import express from 'express';
import supabase from '../supabase/client.js';

const router = express.Router();

router.get('/profit-timeline', async (req, res) => {
  try {
    const { ticker } = req.query; // Optional query param

    // Fetch transactions
    let query = supabase
      .from('transactions')
      .select('ticker, type, quantity, price, trade_date')
      .order('trade_date', { ascending: true });

    if (ticker) {
      query = query.eq('ticker', ticker.toUpperCase());
    }

    const { data: transactions, error } = await query;

    if (error) return res.status(400).json({ error: error.message });
    if (!transactions || transactions.length === 0) return res.json([]);

    const results = [];
    const holdings = {};
    const dailyProfitMap = {};

    for (const tx of transactions) {
      const { ticker, type, quantity, price, trade_date } = tx;
      if (!holdings[ticker]) holdings[ticker] = [];

      if (type === 'BUY') {
        holdings[ticker].push({ qty: quantity, price });
      } else if (type === 'SELL') {
        let sellQty = quantity;
        let realizedProfit = 0;

        while (sellQty > 0 && holdings[ticker].length > 0) {
          const lot = holdings[ticker][0];
          const matchedQty = Math.min(lot.qty, sellQty);

          realizedProfit += (price - lot.price) * matchedQty;

          lot.qty -= matchedQty;
          sellQty -= matchedQty;

          if (lot.qty === 0) {
            holdings[ticker].shift();
          }
        }

        if (!dailyProfitMap[trade_date]) dailyProfitMap[trade_date] = 0;
        dailyProfitMap[trade_date] += realizedProfit;
      }
    }

    let cumulativeProfit = 0;
    for (const date of Object.keys(dailyProfitMap).sort()) {
      cumulativeProfit += dailyProfitMap[date]; // running total
      results.push({
        date,
        totalProfit: parseFloat(cumulativeProfit.toFixed(2))
      });
    }

    res.json(results);
  } catch (err) {
    console.error('Error calculating FIFO realized P/L:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route: Get user activity (trade_date + ticker)
router.get('/graph_activity', async (req, res) => {
  try {
    const { ticker } = req.query;

    // Fetch all transactions for this user (or ticker)
    let query = supabase
      .from('transactions')
      .select('trade_date, ticker, type, quantity, price')
      .order('trade_date', { ascending: true });

    if (ticker) query = query.eq('ticker', ticker.toUpperCase());

    const { data: transactions, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    if (!transactions || transactions.length === 0) return res.json([]);

    // Compute active tickers (FIFO or simple net sum)
    const holdings = {};
    for (const tx of transactions) {
      const t = tx.ticker;
      if (!holdings[t]) holdings[t] = 0;
      holdings[t] += tx.type === 'BUY' ? tx.quantity : -tx.quantity;
    }

    // Filter to only transactions for ACTIVE tickers
    const activeTickers = Object.keys(holdings).filter(t => holdings[t] > 0);
    const activeTransactions = transactions.filter(tx => activeTickers.includes(tx.ticker));

    const activity = activeTransactions.map(tx => ({
      date: tx.trade_date,
      ticker: tx.ticker,
      type: tx.type,
      quantity: tx.quantity,
      price: tx.price
    }));

    res.json(activity);
  } catch (err) {
    console.error('Error fetching activity:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default router;
