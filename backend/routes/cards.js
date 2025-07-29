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

// 添加新卡片
router.post('/', async (req, res) => {
  const { card_number, bank_name, balance } = req.body;
  if (!card_number || !bank_name || balance === undefined) {
    return res.status(400).json({ error: '缺少必要字段' });
  }
  try {
    const { data, error } = await supabase
      .from('cards')
      .insert([{ card_number, bank_name, balance }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

