//主服务器文件
import express from 'express';
import cardsRouter from './routes/cards.js';
import transactionsRouter from './routes/transactions.js';

const app = express();
app.use(express.json());

import path from 'path';
import { fileURLToPath } from 'url';

// 解决 __dirname 在 ES module 下不可用的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 静态托管 frontend 目录
app.use(express.static(path.join(__dirname, '../frontend')));

// 挂载卡片接口
app.use('/api/cards', cardsRouter);
app.use('/api/transactions', transactionsRouter);

// 默认返回 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
