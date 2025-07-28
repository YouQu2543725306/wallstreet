// Application data
const appData = {
  // Account summary data
  account: {
    totalBalance: 1960479.98,
    balanceChange: 2.5,
    todayProfit: 1237.45,
    profitChange: 1.8,
    lastUpdated: new Date().toISOString()
  },
  
  // Wallet Data
  wallet: {
    balance: 8560.23,
    change: 1.2,
    chartData: [65, 59, 80, 81, 56, 55, 40]
  },
  
  // Card Data
  card: {
    balance: 4000.66,
    cardNumber: '**** **** **** 4679',
    cardHolder: 'John Doe',
    expiryDate: '12/25',
    cardType: 'visa'
  },
  
  // Transactions Data
  transactions: [
    {
      id: 1,
      type: 'buy',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 5,
      price: 175.34,
      total: 876.70,
      status: 'completed',
      date: '2023-11-15 14:30:22'
    },
    {
      id: 2,
      type: 'sell',
      symbol: 'MSFT',
      name: 'Microsoft',
      shares: 3,
      price: 340.50,
      total: 1021.50,
      status: 'completed',
      date: '2023-11-14 10:15:45'
    },
    {
      id: 3,
      type: 'deposit',
      symbol: 'USD',
      name: 'US Dollar',
      amount: 2000.00,
      status: 'completed',
      date: '2023-11-13 09:20:10'
    }
  ],
  
  // Holdings Data
  holdings: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 15.25,
      avgPrice: 165.45,
      currentPrice: 175.34,
      change: 5.2,
      value: 2672.89
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 5.5,
      avgPrice: 125.30,
      currentPrice: 131.80,
      change: -1.2,
      value: 724.90
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      shares: 3.75,
      avgPrice: 240.10,
      currentPrice: 219.96,
      change: -3.2,
      value: 824.85
    }
  ]
};

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

// Update data with simulated changes
function updateData() {
  // Simulate data changes
  const { account } = appData;
  
  // Update account data with small random changes
  account.totalBalance = Math.max(1000000, account.totalBalance * (1 + (Math.random() * 0.02 - 0.01)));
  account.balanceChange = Math.max(-5, Math.min(5, account.balanceChange + (Math.random() * 0.4 - 0.2)));
  account.todayProfit = account.todayProfit * (1 + (Math.random() * 0.1 - 0.05));
  account.profitChange = Math.max(-10, Math.min(10, account.profitChange + (Math.random() * 0.5 - 0.25)));
  account.lastUpdated = new Date().toISOString();
  
  // Update wallet data
  appData.wallet.balance = account.totalBalance * 0.7; // 70% in wallet
  appData.card.balance = account.totalBalance * 0.3; // 30% in card
  
  // Re-render all components
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