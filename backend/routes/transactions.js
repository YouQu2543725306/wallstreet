//历史交易API
// 获取用户交易记录
async function getTransactionHistory(req, res) {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('Transaction')
    .select(`
      transaction_id,
      type,
      quantity,
      price,
      total_amount,
      transaction_date,
      Stock(symbol, name),
      Cards(card_number, bank_name)
    `)
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });
  res.json(data || error);
}