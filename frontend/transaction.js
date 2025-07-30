let chartInstance = null;
let fullData = [];

async function loadProfitTimeline() {
    try {
        const response = await fetch('/api/transactions/profit-timeline');
        fullData = await response.json();

        if (!fullData || fullData.length === 0) {
            document.getElementById('profitChart').outerHTML = '<p>No transactions found.</p>';
            return;
        }

        renderChart('7d'); // Default to 7 days
    } catch (error) {
        console.error('Error loading profit timeline:', error);
    }
}

function renderChart(range) {
    const ctx = document.getElementById('profitChart').getContext('2d');

    // Filter data based on selected range
    let dataSubset;
    switch (range) {
        case '3d':
            dataSubset = fullData.slice(-3);
            break;
        case '7d':
            dataSubset = fullData.slice(-7);
            break;
        case '30d':
            dataSubset = fullData.slice(-30);
            break;
        case '3m':
            dataSubset = fullData.slice(-90);
            break;
        default:
            dataSubset = fullData;
    }

    const labels = dataSubset.map(item => formatDate(item.date));
    const profits = dataSubset.map(item => item.totalProfit);

    const currentProfit = profits[profits.length - 1] || 0;
    const startProfit = profits[0] || 0;
    const percentChange = ((currentProfit - startProfit) / Math.abs(startProfit || 1)) * 100;

    // Update header display
    document.getElementById('current-balance').textContent = `Realized P/L: $${currentProfit.toLocaleString()}`;
    const changeEl = document.getElementById('chart-change');
    changeEl.textContent = `Change from Start: ${percentChange.toFixed(2)}%`;
    changeEl.className = `chart-change ${percentChange >= 0 ? 'positive' : 'negative'}`;

    // Destroy old chart
    if (chartInstance) chartInstance.destroy();

    // Adjust styling based on range
    let pointSize = 4;
    let lineWidth = 2;
    if (range === '30d') {
        pointSize = 2;
    } else if (range === '3m') {
        pointSize = 1;
        lineWidth = 1.5;
    }

    // Render Chart
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Realized P/L',
                data: profits,
                borderColor: '#3498db',  // Blue line
                backgroundColor: 'rgba(52,152,219,0.08)', // Light blue fill
                fill: true,
                tension: 0.3,
                pointRadius: pointSize,
                borderWidth: lineWidth,
                pointBackgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `$${context.parsed.y.toLocaleString()}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: value => `$${value}`
                    }
                },
                x: {
                    ticks: { maxRotation: 0, autoSkip: true }
                }
            }
        }
    });
}

function updateChart(range) {
    renderChart(range);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

document.addEventListener('DOMContentLoaded', loadProfitTimeline);

