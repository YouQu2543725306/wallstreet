// 示例静态数据，后续可用API替换
const data = {
  user: { name: "Mike Profits" },
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
function renderCoins() {
  const coinsDiv = document.querySelector('.coins');
  coinsDiv.innerHTML = data.coins.map(coin => `
    <div class="coin">
      <div class="coin-name">${coin.name} <span class="unit">${coin.unit}</span></div>
      <div class="coin-balance">${coin.balance} <span class="sub">${coin.unit}</span></div>
      <div class="coin-usd">$${coin.usd.toLocaleString()}</div>
    </div>
  `).join('');
}

// 渲染今日盈亏
function renderProfits() {
  const profitGrid = document.querySelector('.profit-grid');
  let totalValue = 0, totalPercent = 0;
  data.profits.forEach(p => { totalValue += p.value; totalPercent += p.percent; });
  profitGrid.innerHTML = data.profits.map(p => `
    <div class="profit-card ${p.value >= 0 ? 'up' : 'down'}">
      <span class="symbol">${p.symbol}</span>
      <span class="value">${p.value >= 0 ? '+' : ''}$${Math.abs(p.value).toLocaleString()}</span>
      <span class="percent">${p.percent >= 0 ? '+' : ''}${p.percent}%</span>
    </div>
  `).join('') + `
    <div class="profit-card total ${totalValue >= 0 ? 'up' : 'down'}">
      <span class="symbol">Total</span>
      <span class="value">${totalValue >= 0 ? '+' : ''}$${Math.abs(totalValue).toLocaleString()}</span>
      <span class="percent">${totalPercent >= 0 ? '+' : ''}${totalPercent}%</span>
    </div>
  `;
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

// 渲染用户信息
function renderUser() {
  document.querySelector('.user').innerHTML = `<i class="fa-solid fa-user"></i> ${data.user.name}`;
}

// 初始化
function init() {
  renderUser();
  renderCoins();
  renderProfits();
  renderWalletCard();
  renderTransactions();
}

document.addEventListener('DOMContentLoaded', init);