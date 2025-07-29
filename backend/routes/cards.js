import express from 'express';
import { getCards } from '../supabase/client.js';
import supabase from '../supabase/client.js';

const router = express.Router();

// 获取所有卡片
router.get('/', async (req, res) => {
  try {
    const cards = await getCards();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//银行卡管理API
// 获取用户银行卡列表
async function getUserCards(req, res) {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('Cards')
    .select('*')
    .eq('user_id', userId);
  res.json(data || error);
}

// 添加银行卡
async function addCard(req, res) {
  const { userId, cardData } = req.body;
  const { data, error } = await supabase
    .from('Cards')
    .insert([{ ...cardData, user_id: userId }]);
  res.json(data || error);
}

export default router;

