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
          <span class="card-created">${createdDate}</span>
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

console.log('fetch到的数据:', data);
