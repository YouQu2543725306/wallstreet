async function loadPortfolioSummary() {
  try {
    const response = await fetch('/api/analytics/portfolio-summary');
    const summary = await response.json();

    if (summary.error) {
      console.error('Error:', summary.error);
      return;
    }

    // Update existing elements
    document.getElementById('total-value').textContent = `$${summary.totalValue}`;
    document.getElementById('unrealized-pl').textContent = `$${summary.unrealizedPL}`;
    document.getElementById('realized-pl').textContent = `$${summary.realizedPL}`;
  } catch (err) {
    console.error('Error loading summary:', err);
  }
}

loadPortfolioSummary();
