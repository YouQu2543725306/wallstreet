import express from 'express';
import supabase from '../supabase/client.js'; 

const router = express.Router();

// Fetch portfolio summary
router.get('/portfolio-summary', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('holdings') 
      .select('ticker, net_quantity, latest_price, holding_value, average_buy_price, unrealized_pl, realized_pl');

    if (error) return res.status(400).json({ error: error.message });

    // Calculate totals
    let totalValue = 0, totalUnrealized = 0, totalRealized = 0;
    data.forEach(row => {
      totalValue += parseFloat(row.holding_value);
      totalUnrealized += parseFloat(row.unrealized_pl);
      totalRealized += parseFloat(row.realized_pl);
    });

    res.json({
      totalValue: totalValue.toFixed(2),
      unrealizedPL: totalUnrealized.toFixed(2),
      realizedPL: totalRealized.toFixed(2),
      details: data
    });
  } catch (err) {
    console.error('Error fetching portfolio summary:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
