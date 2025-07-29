const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zintczxoirrkahrlgmyj.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


let chart = anychart.stock();
chart.container("container").draw();

async function fetchStockData(ticker) {
  const { data, error } = await supabase
    .from("world_stocks")
    .select("date, close")
    .eq("ticker", ticker)
    .order("date", { ascending: true })
    .limit(500);

  if (error) {
    console.error("Error fetching:", error.message);
    return [];
  }

  return data.map((row) => [new Date(row.date).getTime(), row.close]);
}

async function drawChart(ticker) {
  document.getElementById("loading").style.display = "block";
  const stockData = await fetchStockData(ticker);

  if (stockData.length === 0) {
    document.getElementById("loading").innerText = `No data for ${ticker}`;
    return;
  }

  chart.removeAllSeries();
  let dataTable = anychart.data.table();
  dataTable.addData(stockData);

  const mapping = dataTable.mapAs({ value: 1 });
  chart.plot(0).line(mapping).name(ticker);
  chart.scroller().line(mapping);
  chart.title(`Stock Price: ${ticker}`);
  document.getElementById("loading").style.display = "none";
}

document.getElementById("ticker-select").addEventListener("change", (e) => {
  drawChart(e.target.value);
});

drawChart("AAPL");
