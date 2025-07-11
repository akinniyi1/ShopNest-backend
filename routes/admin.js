const express = require('express');
const path = require('path');
const { isAdmin } = require('../utils/middleware/auth'); // ✅ fixed path
const { readJson } = require('../utils/middleware/fileManager'); // ✅ fixed path
const router = express.Router();

const dataDir = '/mnt/data';

router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const users = await readJson(path.join(dataDir, 'users.json'));
    const ads = await readJson(path.join(dataDir, 'ads.json'));
    const messages = await readJson(path.join(dataDir, 'messages.json'));
    const orders = await readJson(path.join(dataDir, 'orders.json'));

    res.json({
      usersCount: users.length,
      adsCount: ads.length,
      messagesCount: messages.length,
      ordersCount: orders.length,
      users,
      ads,
      messages,
      orders
    });
  } catch (err) {
    res.status(500).json({ error: 'Error reading dashboard data', details: err.message });
  }
});

module.exports = router;
