// card.js - 渲染我的卡片

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
    const res = await fetch('/api/cards');
    const data = await res.json();
    renderCards(data);
  } catch (err) {
    console.error('加载卡片失败', err);
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
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_number, bank_name, balance })
      });
      if (!res.ok) throw new Error('添加失败');
      window.closeAddCardModal();
      addCardForm.reset();
      await loadCards();
    } catch (err) {
      alert('添加卡片失败: ' + err.message);
    }
  });
}



