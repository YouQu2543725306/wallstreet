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
    // Clear form fields
    document.getElementById('holding-symbol').value = '';
    document.getElementById('holding-name').value = '';
    document.getElementById('holding-quantity').value = '';
    document.getElementById('holding-cost').value = '';
    document.getElementById('holding-market').value = 'NASDAQ';
    document.getElementById('holding-return').value = '';
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

function addNewHolding() {
    const symbol = document.getElementById('holding-symbol').value;
    const name = document.getElementById('holding-name').value;
    const quantity = parseInt(document.getElementById('holding-quantity').value);
    const cost = parseFloat(document.getElementById('holding-cost').value);
    const market = document.getElementById('holding-market').value;
    const expectedReturn = parseFloat(document.getElementById('holding-return').value);
    
    if (!symbol || !name || !quantity || !cost) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Here you would typically make an API call to add the holding
    console.log(`Adding new holding: ${symbol} - ${name}, Quantity: ${quantity}, Cost: $${cost}, Market: ${market}, Expected Return: ${expectedReturn}%`);
    alert(`${symbol} has been added to your holdings`);
    closeAddHoldingModal();
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
            }
        });
    }
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCalculatorModal();
            closeChangeStockModal();
            closeAddHoldingModal();
        }
    });
    enableCardsContainerDragScroll();
    enableCardsScrollbarSync();
}); 