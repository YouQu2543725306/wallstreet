// Chatbox tab logic
let currentChatTab = 'Portfolio';

const tabs = document.querySelectorAll('#ai-chat-tabs button');
tabs.forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    tabBtn.classList.add('active');
    currentChatTab = tabBtn.id.replace('tab-', '');
  });
});

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
  if (currentChatTab === 'Portfolio') {
    context = `
Portfolio Summary:
Total Value: ${document.getElementById('total-value').textContent}
Unrealized P/L: ${document.getElementById('unrealized-pl').textContent}
Realized P/L: ${document.getElementById('realized-pl').textContent}
    `;
  } else if (currentChatTab === 'Company Info') {
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
