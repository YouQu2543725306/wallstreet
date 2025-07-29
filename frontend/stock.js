// 获取股票数据并渲染
export async function loadStock() {
  try {
    const res = await fetch('/api/stocks');
    let data = await res.json();
    randerStock(data);
    return data;
  } catch (err) {
    console.error('加载股票失败', err);
  }
}

function randerStock(data) {
  const stocksGrid = document.querySelector('.stocks-grid');
    if (!stocksGrid) return;
    stocksGrid.innerHTML = ''; // 清空现有内容
    data.data.forEach(stock => {
        const stockCard = document.createElement('div');
        stockCard.className = 'stock-card';
        let growthRateVal = stock.growthRate;
        let isPositive = growthRateVal > 0 ? 'positive' : 'negative';
        let growthRateText = Math.abs(growthRateVal) !== null && Math.abs(growthRateVal) !== undefined
          ? `${Number(Math.abs(growthRateVal)).toFixed(2)}%`
          : '';
        let positiveLabel = isPositive === 'positive' ? '+' : '-';
        stockCard.innerHTML = `
            <div class="stock-header">
                <div class="stock-info">
                    <div class="stock-symbol">${stock.tickername}</div>
                    <div class="stock-name">${stock.tickerbrandName}</div>
                </div>
                <div class="stock-price">
                    <div class="current-price">$${Number(stock.todayClose).toFixed(2)}</div>
                    <div class="price-change ${isPositive}">${positiveLabel}$${Number(Math.abs(stock.priceDiff)).toFixed(2)} (${positiveLabel}${growthRateText})</div>
                </div>
            </div>
            <div class="stock-chart">
                <div class="mini-chart">
                    <i class="fas fa-chart-line"></i>
                </div>
            </div>
        `;
        stocksGrid.appendChild(stockCard);
    });
}


// 页面加载时自动调用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadStock);
} else {
  loadStock();
}
