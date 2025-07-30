import express from 'express';
import supabase from '../supabase/client.js'; 

const router = express.Router();

/* Helper: Fetch stock details (OHLC + volume) */
async function getStockDetails(ticker, startDate = null, endDate = null, limit = 1000) {
  let query = supabase
    .from('world_stocks')
    .select('date, open, high, low, close, volume')
    .eq('ticker', ticker);

  // If date range is provided
  if (startDate && endDate) {
    query = query.gte('date', startDate).lte('date', endDate);
  }
  query = query.order('date', { ascending: false }).limit(limit);

  const { data, error } = await query;
  if (error) throw new Error(`Supabase error: ${error.message}`);

  // Sort in ascending order for chart 
  return data.reverse();
}

// Fetch portfolio summary
router.get('/portfolio-summary', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('holdings')
      .select('ticker, net_quantity, latest_price, holding_value, average_buy_price, unrealized_pl, realized_pl');

    if (error) return res.status(400).json({ error: error.message });

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
      details: data // <-- For ticker dropdown
    });
  } catch (err) {
    console.error('Error fetching portfolio summary:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/stock-details', async (req, res) => {
  const { ticker } = req.query;
  if (!ticker) return res.status(400).json({ error: 'Ticker is required' });

  try {
    const details = await getStockDetails(ticker);
    console.log("DEBUG Raw Details:", details.slice(0, 5)); 
    const formatted = details.map(row => [
      new Date(row.date).getTime(),
      row.open,
      row.high,
      row.low,
      row.close,
      row.volume
    ]);
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching stock details:', err.message);
    res.status(500).json({ error: 'Failed to fetch stock data', details: err.message });
  }
});


export default router;
