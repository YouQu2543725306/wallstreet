async function loadTransactionHistory(ticker = '') {
  try {
    const response = await fetch(`/transaction-history${ticker ? `?ticker=${ticker}` : ''}`);
    const transactions = await response.json();

    const transactionList = document.querySelector('.transaction-list');
    transactionList.innerHTML = ''; // Clear existing transactions

    if (transactions.length === 0) {
      transactionList.innerHTML = '<p>No transactions found.</p>';
      return;
    }

    transactions.forEach(tx => {
      const { ticker, type, quantity, total_amount, trade_date, status } = tx;

      const transactionItem = document.createElement('div');
      transactionItem.className = 'transaction-item';

      const iconClass = type === 'BUY' ? 'fa-shopping-cart' : 'fa-arrow-up';
      const amountClass = type === 'BUY' ? 'negative' : 'positive';
      const formattedAmount = type === 'BUY' ? `-$${total_amount.toFixed(2)}` : `+$${total_amount.toFixed(2)}`;

      transactionItem.innerHTML = `
        <div class="transaction-icon ${type.toLowerCase()}">
          <i class="fas ${iconClass}"></i>
        </div>
        <div class="transaction-details">
          <div class="transaction-title">${type === 'BUY' ? 'Bought' : 'Sold'} ${ticker}</div>
          <div class="transaction-subtitle">${quantity} shares</div>
          <div class="transaction-date">${new Date(trade_date).toLocaleString()}</div>
        </div>
        <div class="transaction-amount">
          <div class="amount ${amountClass}">${formattedAmount}</div>
          <div class="status ${status.toLowerCase()}">${status}</div>
        </div>
      `;

      transactionList.appendChild(transactionItem);
    });
  } catch (error) {
    console.error('Error loading transaction history:', error);
  }
}

// Call the function on page load
document.addEventListener('DOMContentLoaded', () => {
  // Load transaction history dynamically
  loadTransactionHistory();
});