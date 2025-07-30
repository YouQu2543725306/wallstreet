// Chatbox tab logic
let currentChatTab = 'portfolio';

const tabs = document.querySelectorAll('#ai-chat-tabs button');
tabs.forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    tabBtn.classList.add('active');
    currentChatTab = tabBtn.id.replace('tab-', '');
  });
});

async function getPortfolioContext() {
  try {
    const res = await fetch('/api/analytics/portfolio-summary');
    const summary = await res.json();
    if (summary.error) {
      console.error('Error:', summary.error);
      return '';
    }

    let context = `
Portfolio Summary:
Total Value: ${summary.totalValue}
Unrealized P/L: ${summary.unrealizedPL}
Realized P/L: ${summary.realizedPL}
`;

    const topHoldings = summary.details
      .slice()
      .sort((a, b) => b.holding_value - a.holding_value)
      .slice(0, 6);

    context += 'Top Holdings by Value:\n';
    topHoldings.forEach((item, i) => {
      context += `${i + 1}. ${item.ticker} — $${Number(item.holding_value).toFixed(2)}\n`;
    });

    return context;
  } catch (err) {
    console.error('Failed to get portfolio context:', err);
    return '';
  }
}

// Send message event
document.getElementById('ai-chat-form').addEventListener('submit', async e => {
  e.preventDefault();
  const inputEl = document.getElementById('ai-chat-input');
  const question = inputEl.value.trim();
  if (!question) return;
  inputEl.value = '';

  const messagesEl = document.getElementById('ai-chat-messages');

  // Show user message
  const userMsgEl = document.createElement('div');
  userMsgEl.className = 'chat-message user';
  userMsgEl.textContent = question;
  messagesEl.appendChild(userMsgEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Build context for prompt
  let context = '';
  if (currentChatTab === 'portfolio') {
      context = await getPortfolioContext();
  } else if (currentChatTab === 'company') {
    const fields = ['name', 'sector', 'market_cap', 'pe_ratio', 'dividend_yield', 'volatility', 'sentiment_score', 'trend'];
    context = 'Company Information:\n';
    for (const f of fields) {
      const val = document.getElementById(`ci-${f}`)?.textContent || 'N/A';
      context += `${f.replace('_', ' ')}: ${val}\n`;
    }
  } else {
    context = 'You can ask general stock market or investment questions.';
  }

  try {
    console.log('Context sent to AI:', context);
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context }),
    });
    const data = await res.json();

    if (data.error) throw new Error(data.error);

    // Show AI answer
    const aiMsgEl = document.createElement('div');
    aiMsgEl.className = 'chat-message ai';
    aiMsgEl.textContent = data.answer;
    messagesEl.appendChild(aiMsgEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;

  } catch (err) {
    const errEl = document.createElement('div');
    errEl.className = 'chat-message ai';
    errEl.style.color = 'red';
    errEl.textContent = 'Error: ' + err.message;
    messagesEl.appendChild(errEl);
  }
});
