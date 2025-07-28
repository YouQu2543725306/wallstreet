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

