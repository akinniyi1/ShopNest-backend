const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const dataDir = '/mnt/data';
const ordersFile = path.join(dataDir, 'orders.json');
const usersFile = path.join(dataDir, 'users.json');
const ADMIN_EMAIL = 'akinrinadeakinniyi9@gmail.com';

// Create order
router.post('/', async (req, res) => {
  try {
    const { buyerEmail, sellerEmail, productId, address, region, price } = req.body;

    if (!buyerEmail || !sellerEmail || !productId || !address || !price || !region) {
      return res.status(400).json({ error: 'Missing order fields' });
    }

    const users = await fs.readJson(usersFile);
    const buyer = users.find(u => u.email === buyerEmail);
    const seller = users.find(u => u.email === sellerEmail);

    if (!buyer || !seller) {
      return res.status(403).json({ error: 'Both users must be registered' });
    }

    const orders = await fs.readJson(ordersFile);
    const newOrder = {
      id: uuidv4(),
      buyerEmail,
      sellerEmail,
      productId,
      address,
      region,
      price,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    await fs.writeJson(ordersFile, orders, { spaces: 2 });
    res.json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

// Admin update order status (e.g., release payment)
router.post('/update', async (req, res) => {
  try {
    const { email, orderId, status } = req.body;
    if (email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const orders = await fs.readJson(ordersFile);
    const order = orders.find(o => o.id === orderId);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    await fs.writeJson(ordersFile, orders, { spaces: 2 });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order', details: err.message });
  }
});

// Get orders for a user
router.get('/user/:email', async (req, res) => {
  try {
    const orders = await fs.readJson(ordersFile);
    const userOrders = orders.filter(o =>
      o.buyerEmail === req.params.email || o.sellerEmail === req.params.email
    );
    res.json(userOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user orders', details: err.message });
  }
});

module.exports = router;
