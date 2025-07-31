import express from 'express';
import ollama from 'ollama';

export async function askOllama(question, context = '') {
  const messages = [
    { role: 'system', content: 'You are a financial expert.' },
  ];

  if (context.trim().length > 0) {
    messages.push({ role: 'system', content: `Context:\n${context}` });
  }

  messages.push({ role: 'user', content: question });

  const response = await ollama.chat({
    model: 'smollm:135m',
    messages,
    stream: false,
  });
  return response.message.content;
}

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { question, context } = req.body;

    if (typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Question must be a non-empty string' });
    }

    if (context && typeof context !== 'string') {
      return res.status(400).json({ error: 'Context must be a string' });
    }

    const answer = await askOllama(question, context || '');
    res.json({ answer });
  } catch (err) {
    console.error('Ollama error:', err);
    res.status(500).json({ error: 'Failed to get answer from Ollama' });
  }
});

export default router;
