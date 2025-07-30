import express from 'express';
import supabase from '../supabase/client.js';
import fs from 'fs';
import path from 'path';
import dataForge from 'data-forge';
import 'data-forge-fs';
import 'data-forge-indicators';
import 'data-forge-plot';  // Adds plot() to Series/DataFrame
import '@plotex/render-image'; // Enables renderImage
import { backtest, analyze, monteCarlo} from 'grademark';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import Table from 'easy-table';

const router = express.Router();

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseOutputDir = path.resolve(__dirname, '../output');
if (!fs.existsSync(baseOutputDir)) {
    fs.mkdirSync(baseOutputDir, { recursive: true });
}

const jobs = {}; // job_id → {status, progress, result, error}

async function runBacktestJob(jobId, ticker, startingCapital, smaPeriod, monteCarloParams) {
    try {
        jobs[jobId].status = 'running';
        jobs[jobId].progress = 5;

        // Fetch stock data from Supabase
        const { data, error } = await supabase
            .from('world_stocks')
            .select('ticker, date, open, high, low, close, volume')
            .eq('ticker', ticker)
            .order('date', { ascending: true });

        if (error) throw new Error(error.message);
        if (!data || data.length === 0) throw new Error(`No data found for ${ticker}`);

        jobs[jobId].progress = 20;

        // Prepare DataFrame
        let df = new dataForge.DataFrame(data)
            .transformSeries({
                date: value => new Date(value) // Convert timestamp string to Date object
            })
            .setIndex('date')
            .renameSeries({ date: 'time' });;

        // Compute SMA
        const sma = df.deflate(row => row.close).sma(smaPeriod);
        df = df.withSeries('sma', sma).skip(smaPeriod);

        jobs[jobId].progress = 40;

        // Define Strategy
        const strategy = {
            entryRule: (enterPosition, args) => {
                if (!args.position && args.bar.close < args.bar.sma) enterPosition();
            },
            exitRule: (exitPosition, args) => {
                if (args.position && args.bar.close > args.bar.sma) exitPosition();
            },
            stopLoss: args => args.entryPrice * 0.05 // 5% stop-loss
        };

        // Backtest
        const trades = backtest(strategy, df);
        jobs[jobId].progress = 60;

        // Analyze results
        const analysis = analyze(startingCapital, trades);

        let monteCarloStats = null;
        if (monteCarloParams && monteCarloParams.numIterations && monteCarloParams.numSamples) {
            const mcSamples = monteCarlo(trades, monteCarloParams.numIterations, monteCarloParams.numSamples);

            // Compute statistics from MC samples
            const sampleReturns = mcSamples.map(sample =>
                sample.reduce((sum, t) => sum + (t.profit || 0), 0) // sum profits in sample
            );

            const avgReturn = sampleReturns.reduce((a, b) => a + b, 0) / sampleReturns.length;
            const sorted = [...sampleReturns].sort((a, b) => a - b);
            const percentile = (p) => sorted[Math.floor(p * sorted.length)];
            
            monteCarloStats = {
                avgReturn: avgReturn.toFixed(2),
                worstCase: percentile(0.05).toFixed(2),
                bestCase: percentile(0.95).toFixed(2),
                stdDev: Math.sqrt(sampleReturns.reduce((a, r) => a + Math.pow(r - avgReturn, 2), 0) / sampleReturns.length).toFixed(2)
            };
        }


        jobs[jobId].progress = 75;

        // Prepare output folder
        const outputDir = path.join(baseOutputDir, ticker);
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });


        // Save trades to CSV
        new dataForge.DataFrame(trades)
            .asCSV()
            .writeFileSync(path.join(outputDir, `${ticker}_trades.csv`));

        // Save analysis as TXT table
        const analysisTable = new Table();
        for (const key of Object.keys(analysis)) {
            analysisTable.cell('Metric', key);
            analysisTable.cell('Value', analysis[key]);
            analysisTable.newRow();
        }
        fs.writeFileSync(path.join(outputDir, `${ticker}_analysis.txt`), analysisTable.toString());

        jobs[jobId].progress = 100;
        jobs[jobId].status = 'completed';

        // Return summary result
        jobs[jobId].result = {
            ticker,
            smaPeriod,
            startingCapital,
            finalCapital: analysis.finalCapital.toFixed(2),
            profit: analysis.profit.toFixed(2),
            profitPct: analysis.profitPct.toFixed(2),
            maxDrawdown: analysis.maxDrawdown.toFixed(2),
            maxDrawdownPct: analysis.maxDrawdownPct.toFixed(2),
            totalTrades: analysis.totalTrades,
            percentProfitable: analysis.percentProfitable.toFixed(2),
            profitFactor: analysis.profitFactor.toFixed(2),
            expectancy: (analysis.expectency || 0).toFixed(4),
            expectedValue: analysis.expectedValue.toFixed(4),
            monteCarlo: monteCarloStats 
        };


        console.log("\n=== Summary ===");
        console.table([
            {
                Ticker: ticker,
                "Final Capital ($)": analysis.finalCapital.toFixed(2),
                "Profit %": analysis.profitPct.toFixed(2)
            }
        ]);

    } catch (err) {
        jobs[jobId].status = 'error';
        jobs[jobId].error = err.message;
        console.error(`Error in backtest job ${jobId}:`, err.message);
    }
}

// Start job
router.post('/start', (req, res) => {
    const { ticker, startingCapital, smaPeriod, monteCarlo } = req.body;
    if (!ticker || !startingCapital) return res.status(400).json({ error: 'Missing parameters.' });

    const jobId = uuidv4();
    jobs[jobId] = { status: 'pending', progress: 0 };

    setTimeout(() => runBacktestJob(jobId, ticker, startingCapital, smaPeriod || 30, monteCarlo), 0);
    res.json({ job_id: jobId });
});

// Check job status
router.get('/status', (req, res) => {
    const { job_id } = req.query;
    if (!jobs[job_id]) return res.status(404).json({ error: 'Job not found.' });
    res.json(jobs[job_id]);
});

export default router;
