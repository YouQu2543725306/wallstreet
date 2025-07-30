// Enable mouse drag to scroll for .stocks-grid（参考 cards-container 的左滑实现）
function enableStocksGridDragScroll() {
    const container = document.querySelector('.stocks-grid');
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
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('add-holding-modal').style.display = 'none';
}

function openTradeHoldingModal(stockTicker, quantity, value) {
    // Populate modal fields
    document.getElementById('trade-stock-ticker').textContent = stockTicker;
    document.getElementById('trade-stock-quantity').textContent = quantity;
    document.getElementById('trade-stock-value').textContent = value;

    // Show the modal
    document.getElementById('trade-holding-modal').style.display = 'block';
}

function closeTradeHoldingModal() {
    // Hide the modal
    document.getElementById('trade-holding-modal').style.display = 'none';
}

function confirmTrade() {
    const tradeQuantity = document.getElementById('trade-quantity').value;

    if (!tradeQuantity || tradeQuantity <= 0) {
        alert('Please enter a valid trade quantity.');
        return;
    }

    // Perform trade logic here (e.g., update backend or UI)
    alert(`Trade confirmed for quantity: ${tradeQuantity}`);

    // Close the modal
    closeTradeHoldingModal();
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

async function updateHoldingDetails() {
    const ticker = document.getElementById('holding-symbol').value.toUpperCase();
    const quantity = parseInt(document.getElementById('holding-quantity').value, 10) || 0;

    // Simulate fetching the unit price from an API
    const unitPrice = await fetchUnitPrice(ticker);

    // Calculate total price and estimated gain
    const totalPrice = unitPrice * quantity;
    const estimatedGain = totalPrice * 0.1; // Assuming a 10% gain

    // Update the modal fields
    document.getElementById('holding-unit-price').textContent = `$${unitPrice.toFixed(2)}`;
    document.getElementById('holding-total-price').textContent = `$${totalPrice.toFixed(2)}`;
    document.getElementById('holding-estimated-gain').textContent = `$${estimatedGain.toFixed(2)}`;
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

function addNewHolding() {
    const ticker = document.getElementById('holding-symbol').value.toUpperCase();
    const quantity = parseInt(document.getElementById('holding-quantity').value, 10);
    const unitPrice = parseFloat(document.getElementById('holding-unit-price').textContent.replace('$', ''));
    const totalPrice = parseFloat(document.getElementById('holding-total-price').textContent.replace('$', ''));
    const estimatedGain = parseFloat(document.getElementById('holding-estimated-gain').textContent.replace('$', ''));

    if (!ticker || quantity <= 0 || unitPrice <= 0) {
        alert('Please enter valid stock details.');
        return;
    }

    // Add the holding logic (e.g., update backend or UI)
    alert(`Added Holding:\nTicker: ${ticker}\nQuantity: ${quantity}\nTotal Price: $${totalPrice.toFixed(2)}\nEstimated Gain: $${estimatedGain.toFixed(2)}`);

    // Close the modal
    closeAddHoldingModal();
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
                closeDeleteCardModal();
                closeAddCardModal();
                closeBacktestModal();
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
            closeDeleteCardModal();
            closeAddCardModal();
            closeBacktestModal();
        }
    });
    enableCardsContainerDragScroll();
    enableCardsScrollbarSync();
    enableStocksGridDragScroll(); // 启用 stocks-grid 横向拖动
});