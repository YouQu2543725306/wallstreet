//主服务器文件

const http = require('http');
const supabase = require('./supabase/client');



const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!\n');
});


server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});





//交易执行
// 执行交易（买入/卖出）
async function executeTrade(req, res) {
  const { userId, stockId, type, quantity, price, cardId } = req.body;
  
  // 1. 验证银行卡余额（买入时）
  if (type === 'BUY') {
    const { data: card } = await supabase
      .from('Cards')
      .select('balance')
      .eq('card_id', cardId)
      .single();
    
    if (card.balance < quantity * price) {
      return res.status(400).json({ error: '银行卡余额不足' });
    }
  }

  // 2. 验证持仓数量（卖出时）
  if (type === 'SELL') {
    const { data: asset } = await supabase
      .from('Assets')
      .select('quantity')
      .eq('user_id', userId)
      .eq('stock_id', stockId)
      .single();
    
    if (!asset || asset.quantity < quantity) {
      return res.status(400).json({ error: '持仓数量不足' });
    }
  }

  // 3. 在事务中执行操作
  const transaction = await supabase.rpc('execute_trade_transaction', {
    p_user_id: userId,
    p_stock_id: stockId,
    p_type: type,
    p_quantity: quantity,
    p_price: price,
    p_card_id: cardId
  });

  res.json(transaction);
}

