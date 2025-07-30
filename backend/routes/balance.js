import express from 'express';
import supabase from '../supabase/client.js';

const router = express.Router();

// 获取所有持仓数据
router.get('/', async (req, res) => {
  try {
    // 获取所有持仓记录
    const { data: holdings, error } = await supabase
      .from('holdings')
      .select('*')
      .order('ticker', { ascending: true });

    if (error) throw error;

    // 返回所有持仓数据
    res.json(holdings || []);
  } catch (error) {
    console.error('Error fetching holdings:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;