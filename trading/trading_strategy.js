const dataForge = require('data-forge');
require('data-forge-fs');
require('data-forge-indicators'); // For SMA
const { plot } = require('plot');
require('@plotex/render-image');
const { backtest, analyze, computeEquityCurve, computeDrawdown } = require('grademark');
const Table = require('easy-table');
const fs = require('fs');
const moment = require('moment');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ===== Supabase Client Setup =====
const supabaseUrl = 'https://zintczxoirrkahrlgmyj.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Ensure output folder exists
if (!fs.existsSync('./output')) {
    fs.mkdirSync('./output');
}

async function main() {
    console.log("Step 1: Fetching data for multiple tickers...");

    const tickers = ['AAPL', 'GOOGL', 'TSLA'];
    const limitPerTicker = Math.floor(1000 / tickers.length); // e.g., 333 rows per ticker

    const results = {};

    for (const ticker of tickers) {
        const { data, error } = await supabase
            .from('world_stocks')
            .select('ticker, date, open, high, low, close, volume')
            .eq('ticker', ticker)
            .order('date', { ascending: false })
            .limit(limitPerTicker);

        if (error) {
            console.error(`Error fetching ${ticker}:`, error.message);
            continue;
        }
        const rows = data.reverse();
        results[ticker] = rows;
        console.log(`${ticker}: Fetched ${rows.length} most recent rows.`);
    }


    console.log("Final result keys:", Object.keys(results));

    if (Object.keys(results).length === 0) {
        throw new Error('No data returned for any ticker!');
    }

    let totalRows = Object.values(results).reduce((sum, rows) => sum + rows.length, 0);
    console.log(`Total rows fetched across all tickers: ${totalRows}`);

    // Group data by ticker
    const grouped = {};
    for (const t of tickers) {
        const rows = results[t] || [];
        if (!rows || rows.length === 0) {
            console.log(`No data for ${t}. Skipping...`);
            continue;
        }

        grouped[t] = new dataForge.DataFrame(rows)

        console.log(`${t}: ${grouped[t].count()} rows loaded`);
    }

    const startingCapital = 10000;
    const summaryResults = [];

    for (const ticker of tickers) {
        console.log(`\n=== Processing ${ticker} ===`);

        let df = new dataForge.DataFrame(grouped[ticker])
            .setIndex('date')
            .renameSeries({ date: "time" });
   
        console.log(`${ticker}: ${df.count()} rows loaded`);

        // Compute SMA
        const sma = df.deflate(row => row.close).sma(30);
        df = df.withSeries('sma', sma).skip(30);

        console.log(`First 3 rows with SMA for ${ticker}:`, df.head(3).toArray());

        // Define Strategy
        const strategy = {
            entryRule: (enterPosition, args) => {
                if (!args.position && args.bar.close < args.bar.sma) {
                    enterPosition({ time: args.bar.date });
                }
            },
            exitRule: (exitPosition, args) => {
                if (args.position && args.bar.close > args.bar.sma) {
                    exitPosition({ time: args.bar.date });
                }
            },
            stopLoss: args => args.entryPrice * 0.95 // 5% stop-loss
        };

        // Backtest
        const trades = backtest(strategy, df);
        console.log(`${ticker} → ${trades.length} trades executed`);
        console.log(`Sample trades:`, trades.slice(0, 3));

        // Save trades CSV
        new dataForge.DataFrame(trades)
            .transformSeries({
                entryTime: d => (d ? moment(d).format("YYYY/MM/DD") : ""),
                exitTime: d => (d ? moment(d).format("YYYY/MM/DD") : "")
            })
            .asCSV()
            .writeFileSync(`./output/${ticker}_trades.csv`);

        // Analysis
        const analysis = analyze(startingCapital, trades);
        summaryResults.push({ ticker, finalCapital: analysis.finalCapital, profitPct: analysis.profitPct });

        const analysisTable = new Table();
        for (const key of Object.keys(analysis)) {
            analysisTable.cell("Metric", key);
            analysisTable.cell("Value", analysis[key]);
            analysisTable.newRow();
        }
        const analysisOutput = analysisTable.toString();
        fs.writeFileSync(`./output/${ticker}_analysis.txt`, analysisOutput);

        // Plots
        const equityCurve = computeEquityCurve(startingCapital, trades);
        await plot(equityCurve, { chartType: "area", y: { label: "Equity $" } })
            .renderImage(`output/${ticker}_equity.png`);

        const drawdown = computeDrawdown(startingCapital, trades);
        await plot(drawdown, { chartType: "area", y: { label: "Drawdown $" } })
            .renderImage(`output/${ticker}_drawdown.png`);
    }

    console.log("\n=== Summary ===");
    console.table(summaryResults);
    fs.writeFileSync("./output/summary.json", JSON.stringify(summaryResults, null, 2));
}

main()
    .then(() => console.log("Finished"))
    .catch(err => {
        console.error("An error occurred.");
        console.error(err && err.stack || err);
    });
