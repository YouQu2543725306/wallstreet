// Modal Management Functions
function openCalculatorModal() {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('calculator-modal').style.display = 'block';
}

function closeCalculatorModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('calculator-modal').style.display = 'none';
    // Clear form fields
    document.getElementById('stock-name').value = '';
    document.getElementById('market-price').value = '';
    document.getElementById('buy-quantity').value = '';
    document.getElementById('duration').value = '1';
    document.getElementById('revenue-result').textContent = '$0.00';
}

function openChangeStockModal() {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('change-stock-modal').style.display = 'block';
}

function closeChangeStockModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('change-stock-modal').style.display = 'none';
    // Clear form fields
    document.getElementById('new-stock-symbol').value = '';
    document.getElementById('new-stock-name').value = '';
}

function openAddHoldingModal() {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('add-holding-modal').style.display = 'block';
}

function closeAddHoldingModal() {
    // Hide the modal
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('add-holding-modal').style.display = 'none';

    // Clear the input fields and reset the modal
    document.getElementById('holding-symbol').value = '';
    document.getElementById('holding-quantity').value = '';
    document.getElementById('holding-unit-price').textContent = '$0.00';
    document.getElementById('holding-total-price').textContent = '$0.00';
    document.getElementById('holding-estimated-gain').textContent = '$0.00';
}

function openTradeHoldingModal(stockTicker, quantity, value) {
    // Populate modal fields
    document.getElementById('trade-stock-ticker').textContent = stockTicker;
    document.getElementById('trade-stock-quantity').textContent = quantity;
    document.getElementById('trade-stock-value').textContent = value;

    // Clear the trade quantity input field
    document.getElementById('trade-quantity').value = '';

    // Show the modal
    document.getElementById('trade-holding-modal').style.display = 'block';
}

function closeTradeHoldingModal() {
    // Hide the modal
    document.getElementById('trade-holding-modal').style.display = 'none';
}

async function confirmTrade() {
    const stockTicker = document.getElementById('trade-stock-ticker').textContent;
    const tradeQuantity = parseInt(document.getElementById('trade-quantity').value, 10);
    const stockValue = parseFloat(document.getElementById('trade-stock-value').textContent.replace('$', ''));

    if (!tradeQuantity || tradeQuantity <= 0) {
        alert('Please enter a valid trade quantity.');
        return;
    }

    try {
        // Generate a new transaction record
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticker: stockTicker,
                quantity: tradeQuantity,
                price: (stockValue / tradeQuantity).toFixed(2), // Calculate unit price
                total_amount: stockValue,
                type: tradeQuantity > 0 ? 'SELL' : 'BUY', // Determine transaction type
                tradeDate: new Date().toISOString(), // Current timestamp
                status: 'ACTIVE', // Assuming the transaction is active
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save transaction');
        }

        alert(`Trade confirmed for ${tradeQuantity} shares of ${stockTicker}.`);

        // Refresh the holdings and transaction history
        await fetchHoldings();
        await fetchTransactionHistory();

        // Close the modal
        closeTradeHoldingModal();
    } catch (error) {
        console.error('Error confirming trade:', error);
        alert('Failed to confirm trade. Please try again later.');
    }
}

// Calculator Functions
function calculateRevenue() {
    const stockName = document.getElementById('stock-name').value;
    const marketPrice = parseFloat(document.getElementById('market-price').value);
    const buyQuantity = parseInt(document.getElementById('buy-quantity').value);
    const duration = parseInt(document.getElementById('duration').value);
    
    if (!stockName || !marketPrice || !buyQuantity) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Simple calculation example (you can make this more sophisticated)
    const totalInvestment = marketPrice * buyQuantity;
    const monthlyReturnRate = 0.05; // 5% monthly return (example)
    const totalReturn = totalInvestment * monthlyReturnRate * duration;
    const totalRevenue = totalInvestment + totalReturn;
    
    document.getElementById('revenue-result').textContent = `$${totalRevenue.toFixed(2)}`;
}

// Stock Management Functions
function removeStock(symbol) {
    if (confirm(`Are you sure you want to remove ${symbol} from tracked stocks?`)) {
        // Here you would typically make an API call to remove the stock
        console.log(`Removing stock: ${symbol}`);
        alert(`${symbol} has been removed from tracked stocks`);
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
    console.log(`Adding new stock: ${symbol} - ${name}`);
    alert(`${symbol} has been added to tracked stocks`);
    closeChangeStockModal();
}

async function updateHoldingDetails() {
    const ticker = document.getElementById('holding-symbol').value.toUpperCase();
    const quantity = parseInt(document.getElementById('holding-quantity').value, 10) || 0;

    if (!ticker) {
        alert('Please enter a valid stock ticker.');
        return;
    }

    try {
        // Fetch unit price and estimated gain from the backend
        const response = await fetch(`/api/stocks/price/${ticker}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch stock data');
        }

        const unitPrice = data.open || 0;
        // Calculate total price and estimated gain
        const estimatedGain = (data.close - data.open)*quantity || 0;
        const totalPrice = unitPrice * quantity;

        // Update the modal fields
        document.getElementById('holding-unit-price').textContent = `$${unitPrice.toFixed(2)}`;
        document.getElementById('holding-total-price').textContent = `$${totalPrice.toFixed(2)}`;
        document.getElementById('holding-estimated-gain').textContent = `$${estimatedGain.toFixed(2)}`;
    } catch (error) {
        console.error('Error fetching stock data:', error);
        alert('Failed to load stock data. Please try again later.');
    }
}

async function fetchUnitPrice(ticker) {
    // Simulate an API call to fetch the stock price
    const mockPrices = {
        AAPL: 175.43,
        TSLA: 195.20,
        MSFT: 315.60,
        GOOGL: 2800.50,
    };
    return mockPrices[ticker] || 0; // Return 0 if ticker is not found
}

async function addNewHolding() {
    const ticker = document.getElementById('holding-symbol').value.toUpperCase();
    const quantity = parseInt(document.getElementById('holding-quantity').value, 10);
    const unitPrice = parseFloat(document.getElementById('holding-unit-price').textContent.replace('$', ''));
    const totalPrice = parseFloat(document.getElementById('holding-total-price').textContent.replace('$', ''));
    const estimatedGain = parseFloat(document.getElementById('holding-estimated-gain').textContent.replace('$', ''));

    if (!ticker || quantity <= 0 || unitPrice <= 0) {
        alert('Please enter valid stock details.');
        return;
    }

    try {
        // Add the holding logic (e.g., update backend or UI)
        alert(`Added Holding:\nTicker: ${ticker}\nQuantity: ${quantity}\nTotal Price: $${totalPrice.toFixed(2)}\nEstimated Gain: $${estimatedGain.toFixed(2)}`);

        // Insert the new transaction into the transaction table
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticker: ticker,
                quantity: quantity,
                price: unitPrice,
                total_amount: totalPrice,
                type: 'BUY', // Assuming this is a buying transaction
                tradeDate: new Date().toISOString(), // Current timestamp
                status: 'ACTIVE', // Assuming the transaction is completed
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save transaction');
        }

        // Refresh the transaction history
        await fetchTransactionHistory();

        // Refresh the holdings block
        await fetchHoldings();


        // Close the modal
        closeAddHoldingModal();
    } catch (error) {
        console.error('Error adding holding:', error);
        alert('Failed to add holding. Please try again later.');
    }
}

async function validateTicker(ticker) {
    try {
        // Fetch the list of distinct tickers from the backend
        const response = await fetch('/api/stocks/distinct-tickers');
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch distinct tickers');
        }

        // Check if the input ticker exists in the list
        const isValid = data.tickers.includes(ticker.toUpperCase());
        if (!isValid) {
            alert('Invalid Ticker. Please enter a valid stock ticker.');
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error validating ticker:', error);
        alert('Failed to validate ticker. Please try again later.');
        return false;
    }
}

function viewFullRecords() {
    alert("Redirecting to full records page...");
    // Add logic to navigate to the full records page or display a modal
}

// Enable mouse drag to scroll for .cards-container
function enableCardsContainerDragScroll() {
    const container = document.querySelector('.cards-container');
    if (!container) return;
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('dragging');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        e.preventDefault();
    });
    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('dragging');
    });
    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('dragging');
    });
    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.2; // scroll speed
        container.scrollLeft = scrollLeft - walk;
    });
}

function enableCardsScrollbarSync() {
    const container = document.querySelector('.cards-container');
    const scrollbar = document.querySelector('.cards-scrollbar');
    const thumb = document.querySelector('.cards-scrollbar-thumb');
    if (!container || !scrollbar || !thumb) return;

    function updateThumb() {
        const visibleRatio = container.clientWidth / container.scrollWidth;
        const thumbWidth = Math.max(scrollbar.clientWidth * visibleRatio, 40);
        thumb.style.width = thumbWidth + 'px';
        const maxScroll = container.scrollWidth - container.clientWidth;
        const maxThumb = scrollbar.clientWidth - thumbWidth;
        const left = maxScroll > 0 ? (container.scrollLeft / maxScroll) * maxThumb : 0;
        thumb.style.left = left + 'px';
    }

    // 同步滚动
    container.addEventListener('scroll', updateThumb);
    window.addEventListener('resize', updateThumb);
    updateThumb();

    // 拖动滑块
    let isDragging = false;
    let dragStartX = 0;
    let dragStartLeft = 0;
    thumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragStartX = e.clientX;
        dragStartLeft = parseInt(thumb.style.left) || 0;
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const scrollbarWidth = scrollbar.clientWidth;
        const thumbWidth = thumb.clientWidth;
        let newLeft = dragStartLeft + dx;
        newLeft = Math.max(0, Math.min(newLeft, scrollbarWidth - thumbWidth));
        thumb.style.left = newLeft + 'px';
        // 同步内容滚动
        const maxScroll = container.scrollWidth - container.clientWidth;
        const maxThumb = scrollbarWidth - thumbWidth;
        if (maxThumb > 0) {
            container.scrollLeft = (newLeft / maxThumb) * maxScroll;
        }
    });
    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.userSelect = '';
    });
}

// Fetch and display transaction history
async function fetchTransactionHistory() {
    try {
        const response = await fetch('/api/transactions/top-ten');
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch transaction history');
        }

        const transactionList = document.querySelector('.transaction-list');
        transactionList.innerHTML = ''; // Clear existing items

        data.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.classList.add('transaction-item');

            // Normalize the transaction type to lowercase for comparison
            const transactionType = transaction.type.toLowerCase();
            const transactionTypeClass = transactionType === 'buy' ? 'buy' : 'sell';
            const transactionAmountClass = transactionType === 'buy' ? 'negative' : 'positive';

            transactionItem.innerHTML = `
                <div class="transaction-icon ${transactionTypeClass}">
                    <i class="fas ${transactionType === 'buy' ? 'fa-shopping-cart' : 'fa-arrow-up'}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${transactionType === 'buy' ? 'Bought' : 'Sold'} ${transaction.ticker}</div>
                    <div class="transaction-subtitle">${transaction.quantity} shares @ $${(transaction.total_amount / transaction.quantity).toFixed(3)}</div>
                    <div class="transaction-date">${new Date(transaction.trade_date).toLocaleString()}</div>
                </div>
                <div class="transaction-amount">
                    <div class="amount ${transactionAmountClass}">${transactionType === 'buy' ? '-' : '+'}$${transaction.total_amount.toFixed(2)}</div>
                    <div class="status ${transaction.status.toLowerCase()}">${transaction.status}</div>
                </div>
            `;

            transactionList.appendChild(transactionItem);
        });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        alert('Failed to load transaction history. Please try again later.');
    }
}

// Fetch and display holdings
async function fetchHoldings() {
    try {
        const response = await fetch('/api/holdings/fetchHolding');
        const holdings = await response.json();

        if (!response.ok) {
            throw new Error('Failed to fetch holdings');
        }

        const holdingsTableBody = document.querySelector('.holdings-table tbody');
        holdingsTableBody.innerHTML = ''; // Clear existing rows

        holdings.forEach(holding => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>
                    <div class="stock-item">
                        <div class="stock-icon">${holding.ticker.charAt(0)}</div>
                        <div class="stock-details">
                            <div class="stock-name">${holding.ticker}</div>
                        </div>
                    </div>
                </td>
                <td>${holding.ticker}</td>
                <td>${holding.net_quantity}</td>
                <td>$${holding.average_buy_price.toFixed(2)}</td>
                <td>$${holding.latest_price.toFixed(2)}</td>
                <td>$${holding.holding_value.toFixed(2)}</td>
                <td class="profit ${holding.unrealized_pl >= 0 ? 'positive' : 'negative'}">
                    ${holding.unrealized_pl >= 0 ? '+' : ''}$${holding.unrealized_pl.toFixed(2)}
                </td>
                <td>
                    <button class="action-btn" onclick="openTradeHoldingModal('${holding.ticker}', '${holding.net_quantity}', '$${holding.holding_value.toFixed(2)}')">
                        Trade
                    </button>
                </td>
            `;

            holdingsTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching holdings:', error);
        alert('Failed to load holdings. Please try again later.');
    }
}

// Close modals when clicking on overlay
document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeCalculatorModal();
                closeChangeStockModal();
                closeAddHoldingModal();
                closeTradeHoldingModal();
            }
        });
    }
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCalculatorModal();
            closeChangeStockModal();
            closeAddHoldingModal();
            closeTradeHoldingModal();
        }
    });
    enableCardsContainerDragScroll();
    enableCardsScrollbarSync();
    fetchTransactionHistory();
    fetchHoldings();
});

document.getElementById("holding-symbol").addEventListener("keypress", async (event) => {
    if (event.key === "Enter") {
        const symbol = event.target.value.trim().toUpperCase();
        if (symbol) {
            // Validate the ticker
            const isValid = await validateTicker(symbol);
            if (!isValid) {
                // Clear the input field if the ticker is invalid
                event.target.value = '';
                return;
            }

            // Fetch stock data if the ticker is valid
            fetchStockData(symbol);
        }
    }
});

function fetchStockData(symbol) {
    // Example API call to fetch stock data
    fetch(`/api/stocks/${symbol}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Cannot load stock data");
            }
            return response.json();
        })
        .then((data) => {
            // Update the UI with stock data
            document.getElementById("holding-unit-price").textContent = `$${data.unitPrice}`;
            document.getElementById("holding-total-price").textContent = `$${data.totalPrice}`;
        })
        .catch((error) => {
            console.error(error.message);
            alert("Cannot load stock data");
        });
}