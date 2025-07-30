import express from 'express';
import ollama from 'ollama';

export async function askOllama(question) {
  const response = await ollama.chat({
    model: 'llama3:latest',
    messages: [
        { role: 'system', content: 'You are a financial expert.' },
        { role: 'user', content: question }
    ],
    stream: false,
  });
  return response.message.content;
}

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });

    const answer = await askOllama(question);
    res.json({ answer });
  } catch (err) {
    console.error('Ollama error:', err);
    res.status(500).json({ error: 'Failed to get answer from Ollama' });
  }
});

export default router;
