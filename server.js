const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const adminsFile = path.join(dbDir, 'admins.json');
const ordersFile = path.join(dbDir, 'orders.json');
const productsFile = path.join(dbDir, 'products.json');

if (!fs.existsSync(adminsFile)) {
  const defaultAdmins = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@doinggood.com',
      password: '$2a$10$NJ0P.W1j8YrJr7PVKZFhne6sQEjXhD9YKhBbEMNHMjLcqVQj8pHYm',
      createdAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(adminsFile, JSON.stringify(defaultAdmins, null, 2));
}

if (!fs.existsSync(ordersFile)) {
  fs.writeFileSync(ordersFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(productsFile)) {
  const defaultProducts = [
    { id: 1, name: 'T-Shirt', price: 899, category: 'women' },
    { id: 2, name: 'Classic T-Shirt', price: 499, category: 'women' },
    { id: 3, name: 'Brown Shirt', price: 999, category: 'men' },
    { id: 4, name: 'Brown Pants', price: 1299, category: 'men' }
  ];
  fs.writeFileSync(productsFile, JSON.stringify(defaultProducts, null, 2));
}

function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (error) {
    return [];
  }
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const admins = readJSON(adminsFile);
  const admin = admins.find(a => a.username === username);

  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (password !== 'admin123') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const { password: _, ...adminData } = admin;
  res.json({
    success: true,
    admin: adminData,
    token: 'admin-token-' + admin.id
  });
});

app.get('/api/admin/orders', (req, res) => {
  const orders = readJSON(ordersFile);
  res.json(orders);
});

app.get('/api/admin/orders/:id', (req, res) => {
  const orders = readJSON(ordersFile);
  const order = orders.find(o => o.id === parseInt(req.params.id, 10));

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});

app.post('/api/orders', (req, res) => {
  const { customerName, email, phone, address, city, province, zip, country, items, total } = req.body;

  if (!customerName || !email || !items || !total) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const orders = readJSON(ordersFile);
  const newOrder = {
    id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
    customerName,
    email,
    phone,
    address,
    city,
    province,
    zip,
    country,
    items,
    total,
    status: 'pending',
    paymentMethod: 'gcash',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  orders.push(newOrder);
  writeJSON(ordersFile, orders);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order: newOrder
  });
});

app.put('/api/admin/orders/:id', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const orders = readJSON(ordersFile);
  const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id, 10));

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[orderIndex].status = status;
  orders[orderIndex].updatedAt = new Date().toISOString();
  writeJSON(ordersFile, orders);

  res.json({
    success: true,
    message: 'Order status updated',
    order: orders[orderIndex]
  });
});

app.delete('/api/admin/orders/:id', (req, res) => {
  const orders = readJSON(ordersFile);
  const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id, 10));

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const deletedOrder = orders.splice(orderIndex, 1);
  writeJSON(ordersFile, orders);

  res.json({
    success: true,
    message: 'Order deleted',
    order: deletedOrder[0]
  });
});

app.get('/api/admin/stats', (req, res) => {
  const orders = readJSON(ordersFile);

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    recentOrders: orders.slice(-5).reverse()
  };

  res.json(stats);
});

app.get('/api/products', (req, res) => {
  const products = readJSON(productsFile);
  res.json(products);
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`? Server running on http://localhost:${PORT}`);
  console.log(`?? Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`?? Default Admin: username=admin, password=admin123`);
});
