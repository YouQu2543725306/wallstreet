import express from 'express';
import supabase from '../supabase/client.js';
const router = express.Router();

// 股票相关路由
// API to fetch stock unit price and estimated gain
router.get('/price/:ticker', async (req, res) => {
  const { ticker } = req.params;
  console.log('Received ticker:', ticker); // Debug log

  const { data, error } = await supabase
    .from('world_stocks')
    .select('open, close')
    .eq('ticker', ticker)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching stock data:', error);
    return res.status(500).json({ error: 'Failed to fetch stock data' });
  }

  console.log('Fetched data:', data); // Debug log
  res.json(data);
});

// API to fetch all distinct tickers
router.get('/distinct-tickers', async (req, res) => {
  try {
    // 从 distinct_tickers 表中获取所有 ticker
    const { data, error } = await supabase
      .from('distinct_tickers')
      .select('ticker');

    if (error) {
      console.error('Error fetching distinct tickers:', error);
      return res.status(500).json({ error: 'Failed to fetch distinct tickers' });
    }

    // 返回结果
    res.json({ tickers: data.map(item => item.ticker) });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Unexpected error occurred' });
  }
});

export default router;