// 示例静态数据，后续可用API替换
const data = {
  user: { name: "Mike Profits" },
  // 资产总览数据
  totalBalance: 1960479.98, // 总资产金额
  balanceChange: 2.5, // 较昨日变化百分比
  // 今日盈亏数据
  todayProfit: 1237.45, // 今日盈亏金额
  profitChange: 1.8, // 较昨日变化百分比
  // 其他数据
  coins: [
    { name: "Bitcoin", unit: "BTC", balance: 108.61, usd: 1180577.24 },
    { name: "Ethereum", unit: "ETH", balance: 107.45, usd: 519509.23 },
    { name: "Tether", unit: "USDT", balance: 1568.76, usd: 1552.51 },
    { name: "Ripple", unit: "XRP", balance: 500.0, usd: 245841.0 }
  ],
  profits: [
    { symbol: "BTC", value: 1237.45, percent: 5 },
    { symbol: "ETH", value: 3237.45, percent: 8 },
    { symbol: "USDT", value: -12.45, percent: -1 },
    { symbol: "Other", value: -5374.5, percent: -3 }
  ],
  walletCard: {
    trend: 3.21,
    balance: 1176356.46,
    number: "1111 2222 3333 4444",
    holder: "MIKE PROFITS",
    expiry: "01/23"
  },
  transactions: [
    { type: "Deposit", coin: "Bitcoin", amount: "+1.05401 BTC", date: "2022-09-11 20:53" },
    { type: "Deposit", coin: "Bitcoin", amount: "+0.02642 BTC", date: "2022-09-09 15:21" },
    { type: "Deposit", coin: "ETH", amount: "+0.0144 ETH", date: "2022-09-08 16:45" },
    { type: "Deposit", coin: "USDT", amount: "+980.97 USDT", date: "2022-09-06 09:44" }
  ]
};

// 渲染资产总览
function renderBalanceOverview() {
  const totalBalance = document.getElementById('totalBalance');
  const balanceChange = document.getElementById('balanceChange');
  
  // 更新总资产
  totalBalance.textContent = `$${data.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  // 更新资产变化
  const isPositive = data.balanceChange >= 0;
  balanceChange.innerHTML = `
    <i class="fas fa-caret-${isPositive ? 'up' : 'down'}"></i>
    <span>${Math.abs(data.balanceChange).toFixed(2)}%</span>
    <span class="label">较昨日</span>
  `;
  balanceChange.className = `change ${isPositive ? 'positive' : 'negative'}`;
}

// 渲染今日盈亏
function renderTodayProfit() {
  const todayProfit = document.getElementById('todayProfit');
  const profitChange = document.getElementById('profitChange');
  
  // 更新今日盈亏
  todayProfit.textContent = `${data.todayProfit >= 0 ? '+' : '-'}$${Math.abs(data.todayProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  // 更新盈亏变化
  const isPositive = data.profitChange >= 0;
  profitChange.innerHTML = `
    <i class="fas fa-caret-${isPositive ? 'up' : 'down'}"></i>
    <span>${Math.abs(data.profitChange).toFixed(2)}%</span>
    <span class="label">较昨日</span>
  `;
  profitChange.className = `change ${isPositive ? 'positive' : 'negative'}`;
  
  // 设置金额颜色
  todayProfit.style.color = isPositive ? 'var(--success)' : 'var(--error)';
}

// 渲染钱包卡片
function renderWalletCard() {
  const card = data.walletCard;
  document.querySelector('.wallet-card .trend').textContent = (card.trend >= 0 ? '+' : '') + card.trend + '%';
  document.querySelector('.wallet-card .balance').textContent = '$' + card.balance.toLocaleString();
  document.querySelector('.wallet-card .card-number').textContent = card.number;
  document.querySelector('.wallet-card .card-holder').textContent = card.holder;
  document.querySelector('.wallet-card .expiry').textContent = card.expiry;
}

// 渲染用户信息
function renderUser() {
  document.querySelector('.user').innerHTML = `<i class="fa-solid fa-user"></i> ${data.user.name}`;
}

// 渲染交易历史
function renderTransactions() {
  const tbody = document.querySelector('.transactions tbody');
  tbody.innerHTML = data.transactions.map(tx => `
    <tr>
      <td><span class="badge deposit">${tx.type}</span></td>
      <td>${tx.coin}</td>
      <td>${tx.amount}</td>
      <td>${tx.date}</td>
    </tr>
  `).join('');
}

// 初始化
function init() {
  renderUser();
  renderBalanceOverview();
  renderTodayProfit();
  renderWalletCard();
  renderTransactions();
  
  // 模拟数据更新（实际项目中可以通过API轮询）
  setInterval(updateData, 10000);
}

// 模拟数据更新
function updateData() {
  // 这里可以添加API调用获取最新数据
  // 模拟数据变化
  data.totalBalance += (Math.random() * 1000 - 500);
  data.balanceChange = parseFloat((data.balanceChange + (Math.random() * 0.5 - 0.25)).toFixed(2));
  data.todayProfit += (Math.random() * 200 - 100);
  data.profitChange = parseFloat((data.profitChange + (Math.random() * 0.5 - 0.25)).toFixed(2));
  
  // 重新渲染更新的部分
  renderBalanceOverview();
  renderTodayProfit();
}

document.addEventListener('DOMContentLoaded', init);