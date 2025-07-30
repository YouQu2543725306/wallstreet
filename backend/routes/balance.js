import express from 'express';
import supabase from '../supabase/client.js';

const router = express.Router();

// 获取总资产余额
router.get('/', async (req, res) => {
  try {
    // 获取所有持仓记录
    const { data: holdings, error } = await supabase
      .from('holdings')
      .select('holding_value');

    if (error) throw error;

    // 计算总余额（所有holding_value的总和）
    const totalBalance = holdings.reduce((sum, holding) => {
      return sum + (parseFloat(holding.holding_value) || 0);
    }, 0);

    // 返回总余额，保留两位小数
    res.json({ 
      total_balance: parseFloat(totalBalance.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;