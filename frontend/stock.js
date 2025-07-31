// 加载所有可选ticker并填充下拉框
async function loadAllTickers() {
  try {
    const res = await fetch('/api/stocks/all-tickers');
    const result = await res.json();
    if (!result.success) return;
    const select = document.getElementById('new-stock-symbol-select');
    if (!select) return;
    select.innerHTML = '<option value="">请选择股票代码</option>';
    result.data.forEach(item => {
      select.innerHTML += `<option value="${item.ticker}" data-brand="${item.brand_name}">${item.ticker} - ${item.brand_name}</option>`;
    });
    // 监听选择变化，自动填充brand_name
    select.onchange = function() {
      const brand = select.options[select.selectedIndex].getAttribute('data-brand') || '';
      document.getElementById('new-stock-name').value = brand;
      document.getElementById('new-stock-symbol').value = select.value;
    };
  } catch (err) {
    // 可选：错误处理
  }
}

// 页面加载时自动填充下拉
document.addEventListener('DOMContentLoaded', loadAllTickers);
// 删除关注股票列表的展示
async function removeStockList() {
  try {
    const res = await fetch('/api/stocks/removeStockList');
    const data = await res.json();
    randerStockList(data);
    if (data.success) {
        console.log('tracked stocks remove list fetched successfully');
    } else {
        console.error('tracked stocks remove list fetched unsuccessfully', data.error);
    }
  } catch (err) {
    console.error('请求出错:', err);
  }
}

function randerStockList(data) {
  const stocksList = document.querySelector('.stock-list');
  if (!stocksList) return;
  stocksList.innerHTML = ''; // 清空现有内容
  data.data.forEach(stock => {
      const stockItem = document.createElement('div');
      stockItem.className = 'stock-item';
      stockItem.innerHTML = `
        <span>${stock.ticker} - ${stock.brand_name}</span>
        <button class="remove-btn" onclick="removeStock('${stock.ticker}')">
            <i class="fas fa-times"></i>
        </button>
      `;
      stocksList.appendChild(stockItem);
  });
}
// Stock Management Functions
// function removeStock(symbol) {
//     if (confirm(`Are you sure you want to remove ${symbol} from tracked stocks?`)) {
//         // Here you would typically make an API call to remove the stock
//         console.log(`Removing stock: ${symbol}`);
//         alert(`${symbol} has been removed from tracked stocks`);
//     }
// }
async function removeStock(ticker){
    if(!confirm(`Are you sure you want to remove ${ticker} from tracked stocks?`)){
        return;
    }
    try {
        const res = await fetch('/api/stocks/removeStockList/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tickername: ticker })
        });
        const data = await res.json();
        if (data.success) {
            alert(`${ticker} has been removed from tracked stocks`);
            console.log(`Stock ${ticker} removed successfully`);
            removeStockList(); // Refresh the stock list
            loadStock(); // Refresh the stock data
        } else {
            console.error('Error removing stock:', data.error);
        }
    }catch (err) {
        console.error('请求出错:', err);
    }
}

function addNewStock() {
    const symbol = document.getElementById('new-stock-symbol').value;
    const name = document.getElementById('new-stock-name').value;   
    if (!symbol || !name) {
        alert('Please fill in both stock symbol and name');
        return;
    }
    
    // Here you would typically make an API call to add the stock
    fetch('/api/stocks/addStocks', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ticker: symbol, brand_name: name })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(`${symbol} has been added to tracked stocks`);
            console.log(`Stock ${symbol} added successfully`);
            removeStockList(); // Refresh the stock list  
            loadStock(); // Refresh the stock data
        } else {
            alert(`${symbol} already exists`);
            console.error('Error adding stock:', data.error);
        }
    })
}



// 获取股票数据并渲染
export async function loadStock() {
  try {
    const res = await fetch('/api/stocks');
    const data = await res.json();
    randerStock(data);
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
        let isPositive = growthRateVal >= 0 ? 'positive' : 'negative';
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
    document.addEventListener('DOMContentLoaded', removeStockList);
} else {
    loadStock();
    removeStockList();
}

window.openChangeStockModal = openChangeStockModal;
window.removeStock = removeStock; 
window.addNewStock = addNewStock;