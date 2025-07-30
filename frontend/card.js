// card.js - 渲染我的卡片

function openAddCardModal() {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById('add-card-modal').style.display = 'block';
}

function closeAddCardModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('add-card-modal').style.display = 'none';
    // Clear form fields
    document.getElementById('add-card-form').reset();
}

async function submitNewCard() {
    const form = document.getElementById('add-card-form');
    // 获取卡号并去除所有非数字字符
    let card_number = form.querySelector('[name="card_number"]').value.replace(/\D/g, '');
    const bank_name = form.querySelector('[name="bank_name"]').value;
    const balance = parseFloat(form.querySelector('[name="balance"]').value);

    if (!card_number || !bank_name || isNaN(balance)) {
        alert('Please fill in all fields.');
        return;
    }

    // Card number validation
    if (card_number.length < 12 || card_number.length > 19 || !/^\d+$/.test(card_number)) {
        alert('Card number must be 12 to 19 digits.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/cards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ card_number, bank_name, balance }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add card.');
        }

        const newCard = await response.json();
        console.log('New card added:', newCard);
        alert('Card added successfully!');
        closeAddCardModal();
        
        // 假设有一个函数来重新加载/渲染卡片
        if (window.renderCards) {
            window.renderCards();
        } else {
            // 如果渲染函数不存在，则重新加载页面
            location.reload();
        }

    } catch (error) {
        console.error('Error adding card:', error);
        alert(`Error: ${error.message}`);
    }
}

// Make functions globally available because they are called from onclick
window.openAddCardModal = openAddCardModal;
window.closeAddCardModal = closeAddCardModal;
window.submitNewCard = submitNewCard;

document.getElementById('add-card-form').onsubmit = submitNewCard;

// 卡品牌判断（简单根据卡号前缀）
function getCardBrand(cardNumber) {
  if (/^4/.test(cardNumber)) return 'VISA';
  if (/^5[1-5]/.test(cardNumber)) return 'MASTERCARD';
  if (/^6/.test(cardNumber)) return 'DISCOVER';
  return 'CARD';
}

// 卡号格式化
function formatCardNumber(cardNumber) {
  return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
}

// 渲染卡片到页面
function renderCards(cards) {
  const container = document.querySelector('.cards-container');
  if (!container) return;
  container.innerHTML = '';
  if (!cards || cards.length === 0) {
    container.innerHTML = '<div class="no-cards">暂无银行卡</div>';
    return;
  }
  cards.forEach(card => {
    const cardBrand = getCardBrand(card.card_number);
    const createdDate = card.created_at ? new Date(card.created_at).toLocaleDateString() : '';
    const cardHtml = `
      <div class="credit-card primary">
        <div class="card-chip"></div>
        <div class="card-number-display">${formatCardNumber(card.card_number)}</div>
        <div class="card-details">
          <div class="card-holder">${card.bank_name}</div>
          <div class="card-balance">$${card.balance.toLocaleString()}</div>
        </div>
        <div class="card-footer">
          <span class="card-brand">${cardBrand}</span>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', cardHtml);
  });
}

// 获取卡片数据并渲染
export async function loadCards() {
  try {
    const res = await fetch('http://localhost:3000/api/cards');
    const data = await res.json();
    renderCards(data);
  } catch (err) {
    console.error('Failed to load cards', err);
  }
}

// 页面加载时自动调用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCards);
} else {
  loadCards();
}

// 打开添加卡片弹窗
window.openAddCardModal = function() {
  document.getElementById('add-card-modal').style.display = 'block';
}
// 关闭添加卡片弹窗
window.closeAddCardModal = function() {
  document.getElementById('add-card-modal').style.display = 'none';
}

// 监听添加卡片表单提交
const addCardForm = document.getElementById('add-card-form');
if (addCardForm) {
  addCardForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(addCardForm);
    const card_number = formData.get('card_number');
    const bank_name = formData.get('bank_name');
    const balance = Number(formData.get('balance'));
    try {
      const res = await fetch('http://localhost:3000/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_number, bank_name, balance })
      });
      if (!res.ok) {
        let errorMsg = 'Failed to add card.';
        try {
          const errData = await res.json();
          if (errData && errData.error && errData.error.includes('duplicate key value')) {
            errorMsg = 'Card number already exists. Please check your card number.';
          } else if (errData && errData.error) {
            errorMsg = errData.error;
          }
        } catch (e) {}
        throw new Error(errorMsg);
      }
      window.closeAddCardModal();
      addCardForm.reset();
      alert('Card added successfully!');
      await loadCards();
    } catch (err) {
      alert(err.message);
    }
  });
}