// Utility functions for random data
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function randomPick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}
function randomDate() {
  const now = new Date();
  const daysAgo = randomInt(0, 30);
  now.setDate(now.getDate() - daysAgo);
  return now.toISOString().slice(0, 10) + ' ' + randomInt(10, 23) + ':' + randomInt(10, 59) + ':' + randomInt(10, 59);
}

// Generate mock data
function generateMockData() {
  // Account
  const totalBalance = randomInt(10000, 2000000);
  const balanceChange = randomFloat(-5, 5);
  const todayProfit = randomFloat(-5000, 5000);
  const profitChange = randomFloat(-10, 10);

  // Wallet
  const walletBalance = totalBalance * randomFloat(0.5, 0.8);
  const walletChange = randomFloat(-3, 3);

  // Card
  const cardBalance = totalBalance - walletBalance;
  const cardTypes = ['visa', 'mastercard', 'amex'];
  const cardType = randomPick(cardTypes);
  const cardHolder = randomPick(['John Doe', 'Alice Smith', 'Mike Profits', 'Jane Lee']);
  const cardNumber = '**** **** **** ' + randomInt(1000, 9999);
  const expiryDate = randomInt(1, 12).toString().padStart(2, '0') + '/' + randomInt(25, 29);

  // Transactions
  const txTypes = ['buy', 'sell', 'deposit', 'withdraw'];
  const stockList = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com' }
  ];
  const transactions = Array.from({ length: 8 }, (_, i) => {
    const type = randomPick(txTypes);
    const stock = randomPick(stockList);
    const shares = randomInt(1, 10);
    const price = randomFloat(100, 500);
    const amount = shares * price;
    return {
      id: i + 1,
      type,
      symbol: stock.symbol,
      name: stock.name,
      shares: type === 'deposit' || type === 'withdraw' ? undefined : shares,
      price: type === 'deposit' || type === 'withdraw' ? undefined : price,
      amount: type === 'deposit' || type === 'withdraw' ? randomFloat(100, 5000) : undefined,
      total: type === 'buy' || type === 'sell' ? amount : undefined,
      status: randomPick(['completed', 'pending', 'failed']),
      date: randomDate()
    };
  });

  // Holdings
  const holdings = stockList.map(stock => {
    const shares = randomFloat(0.5, 20, 2);
    const avgPrice = randomFloat(100, 400);
    const currentPrice = avgPrice * randomFloat(0.8, 1.2);
    const value = shares * currentPrice;
    const change = ((currentPrice - avgPrice) / avgPrice) * 100;
    return {
      symbol: stock.symbol,
      name: stock.name,
      shares,
      avgPrice,
      currentPrice,
      change,
      value
    };
  });

  return {
    account: {
      totalBalance,
      balanceChange,
      todayProfit,
      profitChange,
      lastUpdated: new Date().toISOString()
    },
    wallet: {
      balance: walletBalance,
      change: walletChange,
      chartData: Array.from({ length: 10 }, () => randomFloat(1000, walletBalance))
    },
    card: {
      balance: cardBalance,
      cardNumber,
      cardHolder,
      expiryDate,
      cardType
    },
    transactions,
    holdings
  };
}

// App data (initialized with mock data)
let appData = generateMockData();


// Format currency
function formatCurrency(amount, decimals = 2) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

// Format percentage
function formatPercent(value, decimals = 2) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

// Render Account Summary
function renderAccountSummary() {
  const { totalBalance, balanceChange, todayProfit, profitChange } = appData.account;
  const totalBalanceEl = document.getElementById('totalBalance');
  const balanceChangeEl = document.getElementById('balanceChange');
  const todayProfitEl = document.getElementById('todayProfit');
  const profitChangeEl = document.getElementById('profitChange');
  
  // Update total balance
  totalBalanceEl.textContent = formatCurrency(totalBalance);
  
  // Update balance change
  const isBalancePositive = balanceChange >= 0;
  balanceChangeEl.innerHTML = `
    <i class="fas fa-caret-${isBalancePositive ? 'up' : 'down'}"></i>
    <span>${Math.abs(balanceChange).toFixed(2)}%</span>
    <span class="label">vs yesterday</span>
  `;
  balanceChangeEl.className = `change ${isBalancePositive ? 'positive' : 'negative'}`;
  
  // Update today's profit
  const isProfitPositive = todayProfit >= 0;
  todayProfitEl.textContent = `${isProfitPositive ? '+' : '-'}${formatCurrency(Math.abs(todayProfit))}`;
  todayProfitEl.style.color = isProfitPositive ? 'var(--success)' : 'var(--error)';
  
  // Update profit change
  profitChangeEl.innerHTML = `
    <i class="fas fa-caret-${profitChange >= 0 ? 'up' : 'down'}"></i>
    <span>${Math.abs(profitChange).toFixed(2)}%</span>
    <span class="label">vs yesterday</span>
  `;
  profitChangeEl.className = `change ${profitChange >= 0 ? 'positive' : 'negative'}`;
}

// Render Wallet
function renderWallet() {
  const { balance, change } = appData.wallet;
  const walletContent = document.getElementById('walletContent');
  const isPositive = change >= 0;
  
  walletContent.innerHTML = `
    <div class="wallet-amount">${formatCurrency(balance)}</div>
    <div class="wallet-change">
      <span class="change ${isPositive ? 'positive' : 'negative'}">
        <i class="fas fa-caret-${isPositive ? 'up' : 'down'}"></i>
        <span>${Math.abs(change).toFixed(2)}%</span>
        <span class="label">vs yesterday</span>
      </span>
    </div>
    <div class="wallet-chart">
      <canvas id="balanceChart" width="100%" height="80"></canvas>
    </div>
  `;
  
  // Initialize chart (placeholder - would be replaced with actual chart library)
  initializeChart();
}

// 渲染交易历史
function renderTransactions() {
  const tbody = document.querySelector('.transactions tbody');
  tbody.innerHTML = data.transactions.map(tx => `
    <tr>
      <td><span class="badge deposit">${tx.type}</span></td>
      <td>${tx.symbol}</td>
      <td>${tx.shares}</td>
      <td>${tx.date}</td>
    </tr>
  `).join('');
}

// Render all components
function renderAll() {
  renderAccountSummary();
  renderWallet();
  renderCard();
  renderTransactions();
  renderHoldings();
}

// Update all data with new mock data (simulate refresh)
function updateData() {
  appData = generateMockData();
  renderAll();
}

// Initialize the application
function initApp() {
  // Initial render
  renderAll();
  
  // Set up filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTransactions(btn.dataset.filter);
    });
  });
  
  // Update data every 10 seconds
  setInterval(updateData, 10000);
}

// Initial render when the script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

document.addEventListener('DOMContentLoaded', init);