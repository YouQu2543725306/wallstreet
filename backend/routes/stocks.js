import express from 'express';
import supabase from '../supabase/client.js';
const router = express.Router();
const searchDate ='2025-07-03';
const prevDate = new Date(searchDate);
prevDate.setDate(prevDate.getDate() - 1);
const prevDateStr = prevDate.toISOString().slice(0, 10);


// 获取所有可选股票ticker和brand_name
router.get('/all-tickers', async (req, res) => {
  try {
    // 调用数据库function distinct_ticker_brand_name()，更加高效
    const { data, error } = await supabase
      .rpc('distinct_ticker_brand_name');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


/**
 * @route GET /stocks
 * @desc 获取tracked_stocks同时计算出每个股票的当前收盘价、前一天收盘价、价格差和增长率
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
 * @route GET /removeStockList
 * @desc 对当前trackd的stock进行删除
 */

router.get('/removeStockList', async (req, res) => {
  const { data, error } = await supabase
    .from('track_stocks')
    .select()
  //console.log('获取removeStockList:', data);   //这句后面可以删掉
  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
  return res.json(
    { success: true, 
      count:data.length, 
      data: data 
    });
});

router.post('/removeStockList/delete', async (req, res) => {
  const { tickername } = req.body;
  if (!tickername) {
    return res.status(400).json({ error: '缺少必要字段: tickername' }); 
  }
  try {
    const { data, error } = await supabase
      .from('track_stocks')
      .delete()
      .eq('ticker', tickername)
      .select();
    if (error) throw error;
    res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error('Error removing stock:', error.message);
    res.status(500).json({ error: '删除关注股票失败', details: error.message });
  }
});

/**
 * @route GET /addStocks
 * @desc 对当前trackd的stock进行删除和增加
 */
router.put('/addStocks', async (req, res) => {
  const { ticker, brand_name } = req.body;
  if (!ticker || !brand_name) {
    return res.status(400).json({ error: 'Missing ticker or brand_name' });
  }

  try {
    const { data, error } = await supabase
      .from('track_stocks')
      .insert([{ ticker, brand_name }]);

    if (error) throw error;

    res.status(201).json({  // 201 Created 更符合新增语义
      success: true,
      action: 'inserted',
      ticker,
      brand_name
    });
  } catch (err) {
    if (err.code === '23505') {  // Supabase 主键冲突错误码
      res.status(409).json({ error: 'Stock already exists' });
    } else {
      console.error('Database Error:', err);
      res.status(500).json({ error: 'Failed to add stock' });
    }
  }
});

/**
 * 从tracked_stocks表获取跟踪的的ticker
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