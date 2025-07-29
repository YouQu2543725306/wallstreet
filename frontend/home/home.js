// 工具函数
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

function formatPercentage(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
}

function formatShares(shares) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(shares);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// 随机数据生成函数
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function randomPick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function randomDate(daysBack = 30) {
  const now = new Date();
  const daysAgo = randomInt(0, daysBack);
  now.setDate(now.getDate() - daysAgo);
  return now.toISOString();
}

// 生成模拟数据
function generateMockData() {
  // 股票列表
  const stockList = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: randomFloat(150, 200) },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: randomFloat(300, 350) },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: randomFloat(120, 150) },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: randomFloat(130, 160) },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: randomFloat(200, 250) },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: randomFloat(280, 320) },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: randomFloat(400, 450) },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: randomFloat(140, 170) },
    { symbol: 'V', name: 'Visa Inc.', price: randomFloat(230, 260) },
    { symbol: 'WMT', name: 'Walmart Inc.', price: randomFloat(50, 70) }
  ];

  // 为每只股票添加涨跌幅
  stockList.forEach(stock => {
    stock.change = randomFloat(-5, 5);
    stock.changePercent = stock.change / stock.price * 100;
  });

  // 持仓数据
  const portfolio = stockList.slice(0, 5).map(stock => {
    const shares = randomFloat(1, 10, 2);
    const value = shares * stock.price;
    return {
      ...stock,
      shares,
      value
    };
  });

  // 计算总资产
  const totalAssets = portfolio.reduce((sum, stock) => sum + stock.value, 0);
  const availableBalance = randomFloat(5000, 10000);
  const totalBalance = totalAssets + availableBalance;

  // 今日盈亏
  const todayProfit = randomFloat(-1000, 1000);
  const profitChangePercent = (todayProfit / totalBalance) * 100;

  // 交易历史
  const transactions = [];
  for (let i = 0; i < 10; i++) {
    const type = randomPick(['buy', 'sell']);
    const stock = randomPick(stockList);
    const shares = randomFloat(1, 5, 2);
    const price = stock.price * randomFloat(0.95, 1.05); // 略有不同的价格
    const amount = shares * price;
    
    transactions.push({
      id: i + 1,
      type,
      symbol: stock.symbol,
      name: stock.name,
      shares,
      price,
      amount,
      date: randomDate()
    });
  }

  // 按日期排序，最新的在前面
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    stockList,
    portfolio,
    totalAssets,
    availableBalance,
    totalBalance,
    todayProfit,
    profitChangePercent,
    transactions
  };
}

// 初始化页面数据
function initializePageData() {
  const data = generateMockData();
  
  // 更新资产概览
  document.getElementById('totalAssets').textContent = formatCurrency(data.totalBalance);
  document.getElementById('todayProfit').textContent = formatCurrency(data.todayProfit);
  document.getElementById('availableBalance').textContent = formatCurrency(data.availableBalance);
  
  // 更新涨跌指示器
  const assetChangeEl = document.getElementById('assetChange');
  const profitChangeEl = document.getElementById('profitChange');
  
  // 资产变化
  assetChangeEl.querySelector('span').textContent = formatPercentage(data.profitChangePercent);
  if (data.profitChangePercent >= 0) {
    assetChangeEl.classList.add('positive');
    assetChangeEl.classList.remove('negative');
    assetChangeEl.querySelector('i').className = 'fas fa-caret-up';
  } else {
    assetChangeEl.classList.add('negative');
    assetChangeEl.classList.remove('positive');
    assetChangeEl.querySelector('i').className = 'fas fa-caret-down';
  }
  
  // 利润变化
  profitChangeEl.querySelector('span').textContent = formatPercentage(data.profitChangePercent);
  if (data.profitChangePercent >= 0) {
    profitChangeEl.classList.add('positive');
    profitChangeEl.classList.remove('negative');
    profitChangeEl.querySelector('i').className = 'fas fa-caret-up';
  } else {
    profitChangeEl.classList.add('negative');
    profitChangeEl.classList.remove('positive');
    profitChangeEl.querySelector('i').className = 'fas fa-caret-down';
  }
  
  // 渲染持仓列表
  renderPortfolio(data.portfolio);
  
  // 渲染市场列表
  renderMarket(data.stockList);
  
  // 渲染交易历史
  renderTransactions(data.transactions);
  
  return data;
}

// 渲染持仓列表
function renderPortfolio(portfolio) {
  const portfolioList = document.getElementById('portfolioList');
  portfolioList.innerHTML = '';
  
  if (portfolio.length === 0) {
    portfolioList.innerHTML = '<div class="empty-state">No stocks in portfolio</div>';
    return;
  }
  
  portfolio.forEach(stock => {
    const item = document.createElement('div');
    item.className = 'portfolio-item';
    
    const changeClass = stock.changePercent >= 0 ? 'positive' : 'negative';
    const changeIcon = stock.changePercent >= 0 ? 'fa-caret-up' : 'fa-caret-down';
    
    item.innerHTML = `
      <div class="stock-info">
        <div class="stock-symbol">${stock.symbol}</div>
        <div class="stock-name">${stock.name}</div>
      </div>
      <div class="stock-data">
        <div class="stock-price">${formatCurrency(stock.price)}</div>
        <div class="stock-change ${changeClass}">
          <i class="fas ${changeIcon}"></i>
          ${formatPercentage(stock.changePercent)}
        </div>
        <div class="stock-shares">${formatShares(stock.shares)} shares</div>
      </div>
    `;
    
    portfolioList.appendChild(item);
  });
}

// 渲染市场列表
function renderMarket(stockList) {
  const marketList = document.getElementById('marketList');
  marketList.innerHTML = '';
  
  stockList.forEach(stock => {
    const item = document.createElement('div');
    item.className = 'market-item';
    item.dataset.symbol = stock.symbol;
    
    const changeClass = stock.changePercent >= 0 ? 'positive' : 'negative';
    const changeIcon = stock.changePercent >= 0 ? 'fa-caret-up' : 'fa-caret-down';
    
    item.innerHTML = `
      <div class="stock-info">
        <div class="stock-symbol">${stock.symbol}</div>
        <div class="stock-name">${stock.name}</div>
      </div>
      <div class="stock-data">
        <div class="stock-price">${formatCurrency(stock.price)}</div>
        <div class="stock-change ${changeClass}">
          <i class="fas ${changeIcon}"></i>
          ${formatPercentage(stock.changePercent)}
        </div>
      </div>
      <button class="trade-btn" data-symbol="${stock.symbol}">Trade</button>
    `;
    
    marketList.appendChild(item);
  });
  
  // 添加交易按钮事件
  const tradeButtons = document.querySelectorAll('.trade-btn');
  tradeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const symbol = button.dataset.symbol;
      openTradeModal(symbol);
    });
  });
  
  // 添加股票项点击事件
  const marketItems = document.querySelectorAll('.market-item');
  marketItems.forEach(item => {
    item.addEventListener('click', () => {
      const symbol = item.dataset.symbol;
      openTradeModal(symbol);
    });
  });
}

// 渲染交易历史
function renderTransactions(transactions) {
  const transactionList = document.getElementById('transactionList');
  transactionList.innerHTML = '';
  
  if (transactions.length === 0) {
    transactionList.innerHTML = '<div class="empty-state">No transactions yet</div>';
    return;
  }
  
  transactions.slice(0, 5).forEach(tx => {
    const item = document.createElement('div');
    item.className = 'transaction-item';
    
    item.innerHTML = `
      <div class="transaction-info">
        <div>
          <span class="transaction-type ${tx.type}">${tx.type.toUpperCase()}</span>
          <span class="stock-symbol">${tx.symbol}</span>
          <span class="stock-shares">${formatShares(tx.shares)} shares</span>
        </div>
        <div class="transaction-date">${formatDate(tx.date)}</div>
      </div>
      <div class="transaction-amount">${formatCurrency(tx.amount)}</div>
    `;
    
    transactionList.appendChild(item);
  });
}

// 交易弹窗功能
function openTradeModal(symbol) {
  const modal = document.getElementById('tradeModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalStockInfo = document.getElementById('modalStockInfo');
  const tradeForm = document.getElementById('tradeForm');
  const quantityInput = document.getElementById('quantity');
  const estimatedCostEl = document.getElementById('estimatedCost');
  
  // 获取股票数据
  const stockData = window.appData.stockList.find(s => s.symbol === symbol);
  
  if (!stockData) return;
  
  // 更新弹窗标题和股票信息
  modalTitle.textContent = `Trade ${stockData.symbol}`;
  
  const changeClass = stockData.changePercent >= 0 ? 'positive' : 'negative';
  const changeIcon = stockData.changePercent >= 0 ? 'fa-caret-up' : 'fa-caret-down';
  
  modalStockInfo.innerHTML = `
    <div class="modal-stock-header">
      <div class="stock-symbol">${stockData.symbol}</div>
      <div class="stock-name">${stockData.name}</div>
    </div>
    <div class="modal-stock-price">
      <div class="stock-price">${formatCurrency(stockData.price)}</div>
      <div class="stock-change ${changeClass}">
        <i class="fas ${changeIcon}"></i>
        ${formatPercentage(stockData.changePercent)}
      </div>
    </div>
  `;
  
  // 更新估算成本
  function updateEstimatedCost() {
    const quantity = parseFloat(quantityInput.value) || 0;
    const cost = quantity * stockData.price;
    estimatedCostEl.textContent = formatCurrency(cost);
  }
  
  // 初始更新估算成本
  updateEstimatedCost();
  
  // 监听数量变化
  quantityInput.addEventListener('input', updateEstimatedCost);
  
  // 交易类型按钮
  const tradeTypeButtons = document.querySelectorAll('.trade-type-btn');
  const tradeTypeInput = document.getElementById('tradeType');
  
  tradeTypeButtons.forEach(button => {
    button.addEventListener('click', () => {
      tradeTypeButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      tradeTypeInput.value = button.dataset.type;
    });
  });
  
  // 表单提交
  tradeForm.onsubmit = function(e) {
    e.preventDefault();
    
    const type = tradeTypeInput.value;
    const quantity = parseFloat(quantityInput.value) || 0;
    
    if (quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    // 这里可以添加交易逻辑，例如调用API等
    // 模拟交易成功
    alert(`${type.toUpperCase()} order for ${quantity} shares of ${stockData.symbol} placed successfully!`);
    
    // 关闭弹窗
    closeTradeModal();
    
    // 刷新数据（在实际应用中，这里应该调用API获取最新数据）
    window.appData = initializePageData();
  };
  
  // 显示弹窗
  modal.style.display = 'flex';
}

function closeTradeModal() {
  const modal = document.getElementById('tradeModal');
  modal.style.display = 'none';
}

// 关闭按钮事件
document.getElementById('closeModal').addEventListener('click', closeTradeModal);

// 点击弹窗外部关闭
document.getElementById('tradeModal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeTradeModal();
  }
});

// 交易过滤按钮
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const filter = button.dataset.filter;
    // 这里可以添加过滤逻辑
  });
});

// 刷新按钮事件
document.querySelectorAll('.refresh-btn').forEach(button => {
  button.addEventListener('click', () => {
    // 添加旋转动画
    button.querySelector('i').classList.add('fa-spin');
    
    // 模拟加载延迟
    setTimeout(() => {
      window.appData = initializePageData();
      button.querySelector('i').classList.remove('fa-spin');
    }, 500);
  });
});

// 搜索功能
const searchInput = document.querySelector('.search-input');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filteredStocks = window.appData.stockList.filter(stock => {
      return stock.symbol.toLowerCase().includes(query) || 
             stock.name.toLowerCase().includes(query);
    });
    
    renderMarket(filteredStocks);
  });
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
  window.appData = initializePageData();
});