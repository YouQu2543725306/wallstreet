let chart;
let table;

// User toggles
let userOptions = { volume: false, events: false, ema: false, macd: false, rsi: false };

// Indicators and event markers
let volumeSeries, emaSeries, macdIndicator, rsiIndicator;
let newsMarkers;

// ========================
// Draw Portfolio Charts (Donuts)
// ========================
function drawPortfolioCharts(details) {
  if (!details || details.length === 0) return;

  // Sort by holding value (descending)
  const sortedByValue = [...details].sort((a, b) => b.holding_value - a.holding_value);
  const topValueItems = sortedByValue.slice(0, 6);
  const othersValue = sortedByValue.slice(6).reduce((sum, item) => sum + item.holding_value, 0);

  const valueData = topValueItems.map(item => ({ x: item.ticker, value: item.holding_value }));
  if (othersValue > 0) valueData.push({ x: 'Others', value: othersValue });

  // Sort by quantity (descending)
  const sortedByQuantity = [...details].sort((a, b) => b.net_quantity - a.net_quantity);
  const topQuantityItems = sortedByQuantity.slice(0, 6);
  const othersQuantity = sortedByQuantity.slice(6).reduce((sum, item) => sum + item.net_quantity, 0);

  const quantityData = topQuantityItems.map(item => ({ x: item.ticker, value: item.net_quantity }));
  if (othersQuantity > 0) quantityData.push({ x: 'Others', value: othersQuantity });

  // Consistent colors
  const uniqueTickers = [...new Set([...valueData.map(d => d.x), ...quantityData.map(d => d.x)])];
  const colorPalette = anychart.palettes.distinctColors();
  const colorMap = {};
  uniqueTickers.forEach((ticker, index) => {
    colorMap[ticker] = ticker === 'Others' ? '#B0B0B0' : colorPalette.items()[index % colorPalette.items().length];
  });

  valueData.forEach(item => (item.normal = { fill: colorMap[item.x] }));
  quantityData.forEach(item => (item.normal = { fill: colorMap[item.x] }));

  // Holding Value Donut
  const valueChart = anychart.pie(valueData);
  valueChart.title('Holding Value by Ticker (Top 6 + Others)');
  valueChart.innerRadius('40%');
  valueChart.legend().position('right').itemsLayout('vertical');
  valueChart.labels().enabled(false);
  valueChart.container('holding-value-chart');
  valueChart.draw();

  // Quantity Donut
  const quantityChart = anychart.pie(quantityData);
  quantityChart.title('Quantity by Ticker (Top 6 + Others)');
  quantityChart.innerRadius('40%');
  quantityChart.legend().position('right').itemsLayout('vertical');
  quantityChart.labels().enabled(false);
  quantityChart.container('quantity-chart');
  quantityChart.draw();
}

// ========================
// Load Portfolio Summary
// ========================
async function loadPortfolioSummary() {
  try {
    const response = await fetch('/api/analytics/portfolio-summary');
    const summary = await response.json();
    if (summary.error) return console.error('Error:', summary.error);

    // Update summary cards
    document.getElementById('total-value').textContent = `$${Number(summary.totalValue).toLocaleString()}`;
    document.getElementById('unrealized-pl').textContent = `$${Number(summary.unrealizedPL).toLocaleString()}`;
    document.getElementById('realized-pl').textContent = `$${Number(summary.realizedPL).toLocaleString()}`;

    // Populate ticker select
    const select = document.getElementById('ticker-select');
    select.innerHTML = '';
    summary.details.forEach(item => {
      const option = document.createElement('option');
      option.value = item.ticker;
      option.textContent = `${item.ticker} ($${Number(item.holding_value).toFixed(2)})`;
      select.appendChild(option);
    });

    if (summary.details.length > 0) {
      await updateChart(summary.details[0].ticker);
      drawPortfolioCharts(summary.details);
    }
  } catch (err) {
    console.error('Error loading summary:', err);
  }
}

// ========================
// Chart & Indicators Setup
// ========================
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

    // Price plot
    const pricePlot = chart.plot(0);
    pricePlot.height('60%');
    pricePlot.candlestick(mapping).name(ticker);

    chart.scroller().candlestick(mapping);
    chart.title(`${ticker} Stock Price`);
    chart.crosshair(true);
    chart.tooltip().displayMode('union');

    chart.container('container');
    chart.draw();

    const rangePicker = anychart.ui.rangePicker();
    const rangeSelector = anychart.ui.rangeSelector();
    rangePicker.render(chart);
    rangeSelector.render(chart);

    resetIndicators();
    initializeIndicators();
    applySavedOptions();

    loadingEl.style.display = 'none';
  } catch (err) {
    console.error('Error loading chart:', err);
    loadingEl.innerText = 'Failed to load chart.';
  }
}

function resetIndicators() {
  volumeSeries = null;
  emaSeries = null;
  macdIndicator = null;
  rsiIndicator = null;
  removeEvents();
}

function initializeIndicators() {
  const volumePlot = chart.plot(1);
  volumePlot.height('20%');
  volumePlot.yAxis().labels().format('{%Value}{scale:(1000000)(1)|(m)}');
  const volumeMapping = table.mapAs({ value: 5 });
  volumeSeries = volumePlot.column(volumeMapping).name('Volume').enabled(false);

  emaSeries = chart.plot(0).ema(table.mapAs({ value: 4 }), 50).series();
  emaSeries.stroke('2px #f39c12').enabled(false);

  const macdPlot = chart.plot(2);
  macdIndicator = macdPlot.macd(table.mapAs({ value: 4 }), 12, 26, 9);
  macdIndicator.macdSeries().enabled(false);
  macdIndicator.signalSeries().enabled(false);
  macdIndicator.histogramSeries().enabled(false);

  const rsiPlot = chart.plot(3);
  rsiIndicator = rsiPlot.rsi(table.mapAs({ value: 4 }), 14);
  rsiPlot.lineMarker(0).value(70).stroke('1px #e74c3c');
  rsiPlot.lineMarker(1).value(30).stroke('1px #2ecc71');
  rsiIndicator.series().enabled(false);
}

// ========================
// Apply User Options
// ========================
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

// ========================
// Adjust Plot Heights
// ========================
function adjustPlotHeights() {
  const baseHeight = 60;
  let activeIndicators = 0;
  if (userOptions.volume) activeIndicators++;
  if (userOptions.macd) activeIndicators++;
  if (userOptions.rsi) activeIndicators++;

  const remaining = 100 - baseHeight;
  const extraHeight = activeIndicators > 0 ? remaining / activeIndicators : 0;

  chart.plot(0).height(baseHeight + '%');
  chart.plot(1).height(userOptions.volume ? extraHeight + '%' : '5%').enabled(userOptions.volume);
  chart.plot(2).height(userOptions.macd ? extraHeight + '%' : '5%').enabled(userOptions.macd);
  chart.plot(3).height(userOptions.rsi ? extraHeight + '%' : '5%').enabled(userOptions.rsi);
}

// ========================
// Event Markers
// ========================
async function addEvents() {
  const ticker = document.getElementById('ticker-select').value;

  try {
    const response = await fetch(`/api/transactions/graph_activity?ticker=${ticker}`);
    const activityData = await response.json();

    if (!activityData.length) {
      removeEvents();
      return;
    }

    const buyEvents = activityData
      .filter(i => i.type === 'BUY')
      .map(i => ({ date: i.date, description: `BUY ${i.quantity} @ $${i.price}` }));

    const sellEvents = activityData
      .filter(i => i.type === 'SELL')
      .map(i => ({ date: i.date, description: `SELL ${i.quantity} @ $${i.price}` }));

    // Apply config dynamically every time (version-safe)
    chart.plot(0).eventMarkers({
      groups: [
        { format: 'B', data: buyEvents, normal: { fill: '#4CAF50' }, hovered: { fill: '#66BB6A' } },
        { format: 'S', data: sellEvents, normal: { fill: '#F44336' }, hovered: { fill: '#EF5350' } }
      ]
    });
  } catch (err) {
    console.error('Error fetching trade events:', err);
  }
}

function removeEvents() {
  chart.plot(0).eventMarkers({ groups: [] });
}

async function handleCompanySearch() {
  const companyName = document.getElementById('company-input').value.trim();

  if (!companyName) {
    alert('Please enter a company name.');
    return;
  }

  try {
    const response = await fetch(`/api/analytics/company-info?companyName=${encodeURIComponent(companyName)}`);
    const data = await response.json();

    if (!data || Object.keys(data).length === 0) {
      alert(`No company info found for "${companyName}".`);
      clearCompanyInfo();
      return;
    }

    // Fields to display
    const fields = [
      'date', 'name', 'sector', 'market_cap',
      'pe_ratio', 'dividend_yield', 'volatility',
      'sentiment_score', 'trend'
    ];

    // Fill table dynamically
    fields.forEach(field => {
      const cell = document.getElementById(`ci-${field}`);
      if (cell) {
        let value = data[field] ?? ''; // Handle null/undefined

        // Format numbers for better readability
        if (['market_cap', 'pe_ratio', 'dividend_yield', 'volatility', 'sentiment_score'].includes(field) && value !== '') {
          value = Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
        }

        cell.textContent = value;
      }
    });

  } catch (err) {
    console.error('Error fetching company info:', err);
    alert('Failed to fetch company info. Please try again.');
  }
}

// Helper: Clear previous info
function clearCompanyInfo() {
  const fields = [
    'date', 'name', 'sector', 'market_cap',
    'pe_ratio', 'dividend_yield', 'volatility',
    'sentiment_score', 'trend'
  ];
  fields.forEach(field => {
    const cell = document.getElementById(`ci-${field}`);
    if (cell) cell.textContent = '';
  });
}

// ========================
// Event Listeners
// ========================
document.getElementById('ticker-select').addEventListener('change', () => updateChart());
loadPortfolioSummary();
