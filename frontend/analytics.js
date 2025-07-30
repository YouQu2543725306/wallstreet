let chart;
let table;

// User toggles
let userOptions = { volume: false, events: false, ema: false, macd: false, rsi: false };

// Indicators
let volumeSeries, emaSeries, macdIndicator, rsiIndicator;
let newsMarkers;


function drawPortfolioCharts(details) {
  if (!details || details.length === 0) return;

  // Sort by holding value (descending)
  const sortedByValue = [...details].sort((a, b) => b.holding_value - a.holding_value);

  // Top 6 + Others for Holding Value
  const topValueItems = sortedByValue.slice(0, 6);
  const othersValue = sortedByValue.slice(6).reduce((sum, item) => sum + item.holding_value, 0);

  const valueData = topValueItems.map(item => ({
    x: item.ticker,
    value: item.holding_value
  }));
  if (othersValue > 0) {
    valueData.push({ x: 'Others', value: othersValue });
  }

  // Sort by quantity (descending)
  const sortedByQuantity = [...details].sort((a, b) => b.net_quantity - a.net_quantity);

  // Top 6 + Others for Quantity
  const topQuantityItems = sortedByQuantity.slice(0, 6);
  const othersQuantity = sortedByQuantity.slice(6).reduce((sum, item) => sum + item.net_quantity, 0);

  const quantityData = topQuantityItems.map(item => ({
    x: item.ticker,
    value: item.net_quantity
  }));
  if (othersQuantity > 0) {
    quantityData.push({ x: 'Others', value: othersQuantity });
  }

  // Create consistent color mapping
  const uniqueTickers = [...new Set([...valueData.map(d => d.x), ...quantityData.map(d => d.x)])];
  const colorPalette = anychart.palettes.distinctColors();
  const colorMap = {};
  uniqueTickers.forEach((ticker, index) => {
    colorMap[ticker] = (ticker === 'Others') ? '#B0B0B0' : colorPalette.items()[index % colorPalette.items().length];
  });

  // Apply colors
  valueData.forEach(item => item.normal = { fill: colorMap[item.x] });
  quantityData.forEach(item => item.normal = { fill: colorMap[item.x] });

  // Holding Value Donut Chart
  const valueChart = anychart.pie(valueData);
  valueChart.title('Holding Value by Ticker (Top 6 + Others)');
  valueChart.innerRadius('40%'); // Donut effect
  valueChart.legend().position('right').itemsLayout('vertical');
  valueChart.labels().format("{%x}: {%percentValue}%");
  valueChart.labels().enabled(false); 
  valueChart.container('holding-value-chart');
  valueChart.draw();

  // Quantity Donut Chart
  const quantityChart = anychart.pie(quantityData);
  quantityChart.title('Quantity by Ticker (Top 6 + Others)');
  quantityChart.innerRadius('40%'); // Donut effect
  quantityChart.legend().position('right').itemsLayout('vertical');
  quantityChart.labels().format("{%x}: {%percentValue}%");
  quantityChart.labels().enabled(false); 
  quantityChart.container('quantity-chart');
  quantityChart.draw();
}


async function loadPortfolioSummary() {
  try {
    const response = await fetch('/api/analytics/portfolio-summary');
    const summary = await response.json();
    if (summary.error) return console.error('Error:', summary.error);

    // Update summary cards
    document.getElementById('total-value').textContent = `$${Number(summary.totalValue).toLocaleString()}`;
    document.getElementById('unrealized-pl').textContent = `$${Number(summary.unrealizedPL).toLocaleString()}`;
    document.getElementById('realized-pl').textContent = `$${Number(summary.realizedPL).toLocaleString()}`;

    const select = document.getElementById('ticker-select');
    select.innerHTML = '';
    summary.details.forEach(item => {
      const option = document.createElement('option');
      option.value = item.ticker;
      option.textContent = `${item.ticker} ($${Number(item.holding_value).toFixed(2)})`;
      select.appendChild(option);
    });

    if (summary.details.length > 0) {
        updateChart(summary.details[0].ticker);
    drawPortfolioCharts(summary.details);
    }
  } catch (err) {
    console.error('Error loading summary:', err);
  }
}



async function updateChart(ticker = null) {
  if (!ticker) ticker = document.getElementById('ticker-select').value;
  const loadingEl = document.getElementById('loading');
  loadingEl.style.display = 'block';
  loadingEl.innerText = 'Loading chart...';

  try {
    const res = await fetch(`/api/analytics/stock-details?ticker=${ticker}`);
    const stockData = await res.json();

    if (!stockData.length) {
      loadingEl.innerText = `No data for ${ticker}`;
      return;
    }

    document.getElementById('container').innerHTML = '';
    chart = anychart.stock();

    table = anychart.data.table();
    table.addData(stockData);
    const mapping = table.mapAs({ open: 1, high: 2, low: 3, close: 4, volume: 5 });

    // Price chart (main plot)
    const pricePlot = chart.plot(0);
    pricePlot.height('60%');
    pricePlot.candlestick(mapping).name(ticker);

    chart.scroller().candlestick(mapping);
    chart.title(`${ticker} Stock Price`);
    chart.crosshair(true);
    chart.tooltip().displayMode('union');

    chart.container('container');
    chart.draw();

    // Range tools
    const rangePicker = anychart.ui.rangePicker();
    const rangeSelector = anychart.ui.rangeSelector();
    rangePicker.render(chart);
    rangeSelector.render(chart);

    initializeIndicators(mapping);
    applySavedOptions();
    adjustPlotHeights();

    loadingEl.style.display = 'none';
  } catch (err) {
    console.error('Error loading chart:', err);
    loadingEl.innerText = 'Failed to load chart.';
  }
}

function initializeIndicators(mapping) {
  // Volume
  if (!volumeSeries) {
    const volumePlot = chart.plot(1);
    volumePlot.height('20%');
    volumePlot.yAxis().labels().format('{%Value}{scale:(1000000)(1)|(m)}');
    volumePlot.crosshair().yLabel().format('{%Value}{scale:(1000000)(1)|(m)}').offsetX(-11);
    const volumeMapping = table.mapAs({ value: 5 });
    volumeSeries = volumePlot.column(volumeMapping).name('Volume').enabled(false);
  }

  // EMA
  if (!emaSeries) {
    emaSeries = chart.plot(0).ema(table.mapAs({ value: 4 }), 50).series();
    emaSeries.stroke('2px #f39c12').enabled(false);
  }

  // MACD
  if (!macdIndicator) {
    const macdPlot = chart.plot(2);
    macdIndicator = macdPlot.macd(table.mapAs({ value: 4 }), 12, 26, 9);
    macdIndicator.macdSeries().enabled(false);
    macdIndicator.signalSeries().enabled(false);
    macdIndicator.histogramSeries().enabled(false);
  }

  // RSI
  if (!rsiIndicator) {
    const rsiPlot = chart.plot(3);
    rsiIndicator = rsiPlot.rsi(table.mapAs({ value: 4 }), 14);
    rsiPlot.lineMarker(0).value(70).stroke('1px #e74c3c');
    rsiPlot.lineMarker(1).value(30).stroke('1px #2ecc71');
    rsiIndicator.series().enabled(false);
  }
}

function applySavedOptions() {
  if (volumeSeries) volumeSeries.enabled(userOptions.volume);
  if (emaSeries) emaSeries.enabled(userOptions.ema);

  if (macdIndicator) {
    const enable = userOptions.macd;
    macdIndicator.macdSeries().enabled(enable);
    macdIndicator.signalSeries().enabled(enable);
    macdIndicator.histogramSeries().enabled(enable);
  }

  if (rsiIndicator) rsiIndicator.series().enabled(userOptions.rsi);

  if (userOptions.events) addEvents(); else removeEvents();

  adjustPlotHeights();
}

function applyChartOptions() {
  userOptions.volume = document.getElementById('toggle-volume')?.checked || false;
  userOptions.events = document.getElementById('toggle-events')?.checked || false;
  userOptions.ema = document.getElementById('toggle-ema')?.checked || false;
  userOptions.macd = document.getElementById('toggle-macd')?.checked || false;
  userOptions.rsi = document.getElementById('toggle-rsi')?.checked || false;

  applySavedOptions();
  toggleOptionsPanel();
}

// Adjust plot heights dynamically
function adjustPlotHeights() {
  let baseHeight = 60;
  let activeIndicators = 0;
  if (userOptions.volume) activeIndicators++;
  if (userOptions.macd) activeIndicators++;
  if (userOptions.rsi) activeIndicators++;

  const remaining = 100 - baseHeight;
  const extraHeight = activeIndicators > 0 ? remaining / activeIndicators : 0;

  chart.plot(0).height(baseHeight + '%');
  chart.plot(1).height(userOptions.volume ? extraHeight + '%' : 0);
  chart.plot(2).height(userOptions.macd ? extraHeight + '%' : 0);
  chart.plot(3).height(userOptions.rsi ? extraHeight + '%' : 0);
}

// Event Markers
async function addEvents() {
  if (newsMarkers) return;
  const ticker = document.getElementById('ticker-select').value;

  try {
    const response = await fetch(`/api/transactions/graph_activity?ticker=${ticker}`);
    const activityData = await response.json();
    if (!activityData.length) return;

    const buyEvents = activityData.filter(i => i.type === 'BUY').map(i => ({ date: i.date, description: `BUY ${i.quantity} @ $${i.price}` }));
    const sellEvents = activityData.filter(i => i.type === 'SELL').map(i => ({ date: i.date, description: `SELL ${i.quantity} @ $${i.price}` }));

    newsMarkers = chart.plot(0).eventMarkers({
      groups: [
        { format: 'B', data: buyEvents, normal: { fill: '#4CAF50' }, hovered: { fill: '#66BB6A' } },
        { format: 'S', data: sellEvents, normal: { fill: '#F44336' }, hovered: { fill: '#EF5350' } }
      ]
    });
  } catch (err) {
    console.error('Error fetching trade events:', err);
  }
}
function removeEvents() { if (newsMarkers) newsMarkers.enabled(false); }

// Event Listener
document.getElementById('ticker-select').addEventListener('change', () => updateChart());
loadPortfolioSummary();
