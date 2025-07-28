// 股票相关路由
// 获取所有股票列表
async function getAllStocks(req, res) {
  const { data, error } = await supabase
    .from('Stock')
    .select('*');
  res.json(data || error);
}

// 根据股票代码搜索股票
async function searchStocks(req, res) {
  const { symbol } = req.query;
  const { data, error } = await supabase
    .from('Stock')
    .select('*')
    .ilike('symbol', `%${symbol}%`);
  res.json(data || error);
}

// 更新股票实时价格（需要对接外部API）
async function updateStockPrice(req, res) {
  const { stockId, price } = req.body;
  const { data, error } = await supabase
    .from('Stock')
    .update({ current_price: price })
    .eq('stock_id', stockId);
  res.json(data || error);
}