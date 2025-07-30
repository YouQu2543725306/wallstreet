import express from 'express';
import supabase from '../supabase/client.js';
const router = express.Router();

//历史交易API
// 获取用户最近10条交易记录
async function getTopTenTransactionHistory(req, res) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      ticker,
      trade_date,
      type,
      status,
      quantity,
      total_amount
    `)
    .order('trade_date', { ascending: false })
    .limit(10); // Limit to the most recent 10 records

  if (error) {
    console.error('Error fetching transaction history:', error);
    return res.status(500).json({ error: 'Failed to fetch transaction history' });
  }

  res.json(data);
}

// Update the route to remove userId
router.get('/top-ten', getTopTenTransactionHistory);

// API to add a new transaction
router.post('/', async (req, res) => {
    const { ticker, quantity, price, totalPrice, type, tradeDate, status } = req.body;
    const card_id = 1;

    try {
        const { data, error } = await supabase
            .from('transactions')
            .insert([
                { ticker, quantity, price, type, trade_date: tradeDate, status, card_id},
            ]);

        if (error) {
            console.error('Error inserting transaction:', error);
            return res.status(500).json({ error: 'Failed to save transaction' });
        }

        res.status(201).json({ message: 'Transaction saved successfully', data });
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ error: 'Unexpected error occurred' });
    }
});

export default router;

