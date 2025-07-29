import express from 'express';
import supabase from '../supabase/client.js';

const router = express.Router();
const searchDate ='2025-07-03';
const prevDate = new Date(searchDate);
prevDate.setDate(prevDate.getDate() - 1);
const prevDateStr = prevDate.toISOString().slice(0, 10);

/**
 * @route GET /stocks
 * @desc 获取tracked的股票代码(ticker)
 */
router.get('/', async (req, res) => {
  try {
    const tickers = await getTrackTickers();
    const results = await Promise.all(
      tickers.map(async (item) => {
        const tickername = item.ticker;
        const tickerbrandName = item.brand_name;
        // 获取当前收盘价
        const todayData = await calSharePri(tickername, searchDate);
        // 获取前一天收盘价
        const prevData = await calSharePri(tickername, prevDateStr);
        let todayClose = todayData && todayData[0] ? Number(todayData[0].close) : null;
        const prevClose = prevData && prevData[0] ? Number(prevData[0].close) : null;
        let priceDiff = null;
        let growthRate = null;
        if (todayClose !== null && prevClose !== null) {
          priceDiff = Number((todayClose - prevClose).toFixed(2));
          growthRate = prevClose !== 0 ? Number(((priceDiff / prevClose) * 100).toFixed(4)) : null;
          todayClose = todayClose.toFixed(2);
        }
        return {
          tickername,
          tickerbrandName,
          todayClose,
          priceDiff,
          growthRate
        };
      })
    );
    res.json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error fetching tickers:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch stock tickers',
      details: error.message 
    });
  }
});

/**
 * 从word_stocks表获取所有不重复的ticker
 */
async function getTrackTickers() {
  const { data, error } = await supabase
    .from('track_stocks')
    .select()
  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
  return data;
}

async function calSharePri(ticker,searchDate) {
  const { data, error } = await supabase
    .from('world_stocks')
    .select('ticker,close')
    .eq('ticker', ticker)
    .eq('date', searchDate) // 获取当天的收盘价
  
  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
  return data;
}

export default router;