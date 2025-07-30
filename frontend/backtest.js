let currentJobId = null;
let pollInterval = null;

function openBacktestModal() {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('backtest-modal').style.display = 'block';
    resetUI();
}

function closeBacktestModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('backtest-modal').style.display = 'none';
    clearInterval(pollInterval);
    resetUI();
}

async function runBacktest() {
    const ticker = document.getElementById('backtest-ticker').value.trim();
    const startingCapital = parseFloat(document.getElementById('starting-capital').value);
    const smaPeriod = parseInt(document.getElementById('sma-period').value);

    if (!ticker || startingCapital <= 0) {
        alert('Please enter valid inputs.');
        return;
    }

    resetUI();
    document.getElementById('run-btn').disabled = true;
    document.getElementById('progress-text').textContent = 'Starting...';

    try {
        const res = await fetch('/api/backtest/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker, startingCapital, smaPeriod })
        });

        const data = await res.json();
        if (!data.job_id) throw new Error('Failed to start backtest.');

        currentJobId = data.job_id;

        // Poll job status every 2 seconds
        pollInterval = setInterval(async () => {
            const statusRes = await fetch(`/api/backtest/status?job_id=${currentJobId}`);
            const statusData = await statusRes.json();

            if (statusData.progress !== undefined) {
                updateProgress(statusData.progress);
            }

            if (statusData.status === 'completed') {
                clearInterval(pollInterval);
                showResults(statusData.result);
                resetUI();
            } else if (statusData.status === 'error') {
                clearInterval(pollInterval);
                alert('Error: ' + statusData.error);
                resetUI();
            }
        }, 2000);
    } catch (err) {
        alert('Error starting backtest: ' + err.message);
        resetUI();
    }
}

function stopBacktest() {
    if (currentJobId) {
        fetch('/api/backtest/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ job_id: currentJobId })
        });
    }
    clearInterval(pollInterval);
    resetUI();
}

function updateProgress(pct) {
    document.getElementById('progress-bar').style.width = pct + '%';
    document.getElementById('progress-text').textContent = pct + '%';
}

function resetUI() {
    document.getElementById('run-btn').disabled = false;
    document.getElementById('progress-bar').style.width = '0%';
    document.getElementById('progress-text').textContent = '0%';
    document.getElementById('backtest-results').style.display = 'none';
    document.getElementById('result-summary').innerHTML = '';
    document.getElementById('result-images').innerHTML = '';
}

function showResults(result) {
    console.log("[RESULT] Displaying:", result);

    const resultsSection = document.getElementById('backtest-results');
    document.getElementById('backtest-results').style.display = 'block';
    
    // Summary Table
    document.getElementById('result-summary').innerHTML = `
        <tr><th>Ticker</th><td>${result.ticker}</td></tr>
        <tr><th>SMA Period</th><td>${result.smaPeriod}</td></tr>
        <tr><th>Starting Capital</th><td>$${result.startingCapital.toLocaleString()}</td></tr>
        <tr><th>Final Capital</th><td>$${Number(result.finalCapital).toLocaleString()}</td></tr>
        <tr><th>Profit %</th><td>${result.profitPct}%</td></tr>
        <tr><th>Max Drawdown</th><td>$${Number(result.maxDrawdown).toLocaleString()} (${result.maxDrawdownPct}%)</td></tr>
        <tr><th>Total Trades</th><td>${result.totalTrades}</td></tr>
        <tr><th>Winning %</th><td>${result.percentProfitable}%</td></tr>
        <tr><th>Profit Factor</th><td>${result.profitFactor}</td></tr>
        <tr><th>Expectancy</th><td>${result.expectancy}</td></tr>
        <tr><th>Expected Value</th><td>${result.expectedValue}</td></tr>
    `;

    document.getElementById('backtest-results').style.display = 'block';

    let imageLinksHTML = `
        <h4>Charts:</h4>
        <div class="chart-grid">
            ${result.outputFiles.equityCurve ? `
                <div>
                    <p>Equity Curve</p>
                    <a href="/backend/output/${result.outputFiles.equityCurve}" target="_blank">
                        <img src="/backend/output/${result.outputFiles.equityCurve}" alt="Equity Curve" style="max-width:250px;">
                    </a>
                </div>` : ''}
    `;

    // Append below table
    resultsSection.innerHTML += imageLinksHTML;
}
