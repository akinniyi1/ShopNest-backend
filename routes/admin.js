const express = require('express');
const { isAdmin } = require('../middleware/auth');
const { readJson } = require('../utils/fileManager');
const router = express.Router();

router.get('/dashboard', isAdmin, async (req, res) => {
  const users = await readJson('./data/users.json');
  const ads = await readJson('./data/ads.json');
  const messages = await readJson('./data/messages.json');
  const orders = await readJson('./data/orders.json');

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
});

module.exports = router;
