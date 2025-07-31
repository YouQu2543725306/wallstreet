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

// 删除卡片
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: '缺少卡片ID' });
  }
  try {
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('card_id', id);
    if (error) throw error;
    res.status(200).json({ message: '卡片已删除' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取卡片简化列表 (只返回 id, bank_name, last4)
router.get('/list', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('card_id, bank_name, card_number, balance'); 

    if (error) throw error;

    // Format data: card_id, card_name, last4, balance
    const formattedCards = data.map(card => ({
      card_id: card.card_id,
      card_name: card.bank_name,
      last4: card.card_number.slice(-4),
      balance: card.balance
    }));

    res.json(formattedCards);
  } catch (error) {
    console.error('Error fetching card list:', error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('card_balance_view')
      .select('card_id, bank_name, last4, balance')
      .eq('card_id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching card from view:', error);
    res.status(500).json({ error: error.message });
  }
});

// 更新卡片余额 (BUY or SELL)
router.post('/updateBalance', async (req, res) => {
  let { card_id, amount, operation } = req.body;

  if (!card_id || !amount || !operation) {
    return res.status(400).json({ error: '缺少必要字段 card_id, amount, operation' });
  }

  if (!['BUY', 'SELL'].includes(operation.toUpperCase())) {
    return res.status(400).json({ error: 'operation 必须是 BUY 或 SELL' });
  }

  try {
    // Convert amount to number
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'amount 必须是数字并且大于 0' });
    }

    // 获取当前余额
    const { data: cardData, error: fetchError } = await supabase
      .from('cards')
      .select('balance')
      .eq('card_id', card_id)
      .single();

    if (fetchError) throw fetchError;
    if (!cardData) {
      return res.status(404).json({ error: '卡片不存在' });
    }

    let newBalance = parseFloat(cardData.balance); // Convert DB value to number

    if (operation.toUpperCase() === 'BUY') {
      if (newBalance < amount) {
        return res.status(400).json({ error: '余额不足，无法完成购买' });
      }
      newBalance -= amount; // 扣款
    } else {
      newBalance += amount; // 卖出加款
    }

    // 更新余额
    const { data, error } = await supabase
      .from('cards')
      .update({ balance: newBalance })
      .eq('card_id', card_id)
      .select();

    if (error) throw error;

    res.status(200).json({
      message: `余额更新成功 (${operation.toUpperCase()})`,
      new_balance: newBalance.toFixed(2) // 返回两位小数
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

