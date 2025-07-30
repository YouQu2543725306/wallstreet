//资产组合API
// 获取用户持仓
async function getUserPortfolio(req, res) {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('Assets')
    .select(`
      quantity,
      average_cost,
      total_value,
      Stock (symbol, name, current_price)
    `)
    .eq('user_id', userId);
  res.json(data || error);
}

// 计算组合总价值
async function getPortfolioValue(req, res) {
  const { userId } = req.params;
  const { data } = await supabase
    .from('Assets')
    .select('total_value')
    .eq('user_id', userId);
  
  const totalValue = data.reduce((sum, asset) => sum + asset.total_value, 0);
  res.json({ totalValue });
}