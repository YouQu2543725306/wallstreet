// 格式化货币数字
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// 获取持仓数据并更新UI
async function updateBalanceDisplay() {
    try {
        const response = await fetch('/api/balance');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const holdings = await response.json();
        
        // 计算总余额
        const totalBalance = holdings.reduce((sum, holding) => {
            return sum + (parseFloat(holding.holding_value) || 0);
        }, 0);

        // 按ticker分组并计算每个ticker的总值
        const tickerTotals = {};
        holdings.forEach(holding => {
            const ticker = holding.ticker.toUpperCase();
            tickerTotals[ticker] = (tickerTotals[ticker] || 0) + (parseFloat(holding.holding_value) || 0);
        });

        // 计算各主要币种占比
        const btcValue = tickerTotals['BTC'] || 0;
        const ethValue = tickerTotals['ETH'] || 0;
        const usdtValue = tickerTotals['USDT'] || 0;
        const otherValue = Object.entries(tickerTotals)
            .filter(([ticker]) => !['BTC', 'ETH', 'USDT'].includes(ticker))
            .reduce((sum, [, value]) => sum + value, 0);

        // 计算百分比
        const total = Math.max(totalBalance, 0.01); // 避免除以零
        const btcPercent = (btcValue / total) * 100;
        const ethPercent = (ethValue / total) * 100;
        const usdtPercent = (usdtValue / total) * 100;
        const otherPercent = (otherValue / total) * 100;

        // 更新UI
        document.querySelector('.balance-amount-big').textContent = `$${formatCurrency(totalBalance)}`;
        
        // 更新分布条
        document.querySelector('.bar-btc').style.width = `${btcPercent}%`;
        document.querySelector('.bar-eth').style.width = `${ethPercent}%`;
        document.querySelector('.bar-usdt').style.width = `${usdtPercent}%`;
        document.querySelector('.bar-other').style.width = `${otherPercent}%`;
        
        // 更新标签
        document.querySelector('.btc-label').textContent = `● BTC ${btcPercent.toFixed(1)}%`;
        document.querySelector('.eth-label').textContent = `● ETH ${ethPercent.toFixed(1)}%`;
        document.querySelector('.usdt-label').textContent = `● USDT ${usdtPercent.toFixed(1)}%`;
        document.querySelector('.other-label').textContent = `● Other ${otherPercent.toFixed(1)}%`;

    } catch (error) {
        console.error('Error updating balance display:', error);
        // 可以在这里添加错误处理UI更新
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始加载数据
    updateBalanceDisplay();
    
    // 每30秒刷新一次数据
    setInterval(updateBalanceDisplay, 30000);
});