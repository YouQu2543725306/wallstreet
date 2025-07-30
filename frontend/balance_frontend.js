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

        // 转换为数组并排序，获取前3个持仓
        const sortedTickers = Object.entries(tickerTotals)
            .sort((a, b) => b[1] - a[1]);

        // 获取前3个持仓，其余的归为Other
        const topHoldings = sortedTickers.slice(0, 3);
        const otherValue = sortedTickers.slice(3).reduce((sum, [, value]) => sum + value, 0);
        
        // 如果有Other持仓，添加到显示列表
        if (otherValue > 0) {
            topHoldings.push(['OTHER', otherValue]);
        }

        // 计算百分比
        const total = Math.max(totalBalance, 0.01); // 避免除以零
        const percentages = topHoldings.map(([ticker, value]) => ({
            ticker,
            value,
            percent: (value / total) * 100
        }));

        // 更新UI
        document.querySelector('.balance-amount-big').textContent = `$${formatCurrency(totalBalance)}`;
        
        // 更新分布条和标签
        const barElements = [
            document.querySelector('.bar-btc'),
            document.querySelector('.bar-eth'),
            document.querySelector('.bar-usdt'),
            document.querySelector('.bar-other')
        ];
        
        const labelElements = [
            document.querySelector('.btc-label'),
            document.querySelector('.eth-label'),
            document.querySelector('.usdt-label'),
            document.querySelector('.other-label')
        ];
        
        // 重置所有条和标签
        barElements.forEach(bar => bar.style.width = '0%');
        labelElements.forEach(label => {
            label.textContent = '';
            label.style.display = 'none';
        });
        
        // 更新可见的条和标签
        percentages.forEach((holding, index) => {
            if (index >= 4) return; // 最多显示4个（3个主要持仓 + Other）
            
            const bar = barElements[index];
            const label = labelElements[index];
            
            bar.style.width = `${holding.percent}%`;
            
            // 设置标签文本
            const tickerDisplay = holding.ticker === 'OTHER' ? 'Other' : holding.ticker;
            label.textContent = `● ${tickerDisplay} ${holding.percent.toFixed(1)}%`;
            label.style.display = 'inline';
        });

    } catch (error) {
        console.error('Error updating balance display:', error);
        // 可以在这里添加错误处理UI更新
        document.querySelector('.profit-today-label').textContent = 'Error loading data';
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始加载数据
    updateBalanceDisplay();
    
    // 每30秒刷新一次数据
    setInterval(updateBalanceDisplay, 30000);
});