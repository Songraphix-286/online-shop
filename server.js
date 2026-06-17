const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Database connected');
  
  // Tạo bảng nếu chưa tồn tại
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      image TEXT,
      stock INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      items TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin'
    )
  `);

  // Thêm admin mặc định
  db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', '123456', 'admin')`);

  // Thêm sản phẩm mẫu
  db.run(`INSERT OR IGNORE INTO products (name, price, description, stock) VALUES 
    ('Laptop Dell', 15000000, 'Laptop hiệu năng cao', 5),
    ('iPhone 14', 20000000, 'Điện thoại thông minh', 10),
    ('Tai nghe Sony', 3000000, 'Tai nghe chất lượng cao', 20),
    ('Chuột Logitech', 500000, 'Chuột không dây', 30)
  `);
});

// ============ API PRODUCTS ============

// Lấy tất cả sản phẩm
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Lấy chi tiết sản phẩm
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Thêm sản phẩm (admin)
app.post('/api/products', (req, res) => {
  const { name, price, description, stock } = req.body;
  if (!name || !price) return res.status(400).json({ error: 'Name and price required' });
  
  db.run(
    'INSERT INTO products (name, price, description, stock) VALUES (?, ?, ?, ?)',
    [name, price, description, stock || 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, price, description, stock });
    }
  );
});

// Cập nhật sản phẩm (admin)
app.put('/api/products/:id', (req, res) => {
  const { name, price, description, stock } = req.body;
  db.run(
    'UPDATE products SET name = ?, price = ?, description = ?, stock = ? WHERE id = ?',
    [name, price, description, stock, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Xóa sản phẩm (admin)
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ============ API ORDERS ============

// Tạo đơn hàng
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, customer_phone, total, items } = req.body;
  
  if (!customer_name || !customer_email || !total || !items) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO orders (customer_name, customer_email, customer_phone, total, items) VALUES (?, ?, ?, ?, ?)',
    [customer_name, customer_email, customer_phone, total, JSON.stringify(items)],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, success: true });
    }
  );
});

// Lấy tất cả đơn hàng
app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Cập nhật trạng thái đơn hàng
app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ============ AUTH ============

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid credentials' });
    
    res.json({ success: true, user: row.username });
  });
});

// ============ START SERVER ============

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Admin panel at http://localhost:${PORT}/admin.html`);
  console.log(`Username: admin | Password: 123456`);
});