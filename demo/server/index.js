import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // 请根据你的 MySQL 用户名修改
  password: '', // 请根据你的 MySQL 密码修改
  database: 'hotel_demo'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// 创建酒店表（如未存在）
db.query(`CREATE TABLE IF NOT EXISTS hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  price DECIMAL(10,2)
)`, err => {
  if (err) throw err;
});

// 获取所有酒店
app.get('/api/hotels', (req, res) => {
  db.query('SELECT * FROM hotels', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// 添加酒店
app.post('/api/hotels', (req, res) => {
  const { name, location, price } = req.body;
  db.query('INSERT INTO hotels (name, location, price) VALUES (?, ?, ?)', [name, location, price], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, name, location, price });
  });
});

// 更新酒店
app.put('/api/hotels/:id', (req, res) => {
  const { name, location, price } = req.body;
  db.query('UPDATE hotels SET name=?, location=?, price=? WHERE id=?', [name, location, price, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: req.params.id, name, location, price });
  });
});

// 删除酒店
app.delete('/api/hotels/:id', (req, res) => {
  db.query('DELETE FROM hotels WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
