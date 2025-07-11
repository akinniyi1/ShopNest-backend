const express = require('express');
const fs = require('fs-extra');
const router = express.Router();

const messagesFile = './data/messages.json';
const usersFile = './data/users.json';
const ADMIN_EMAIL = 'akinrinadeakinniyi9@gmail.com';

// POST a message from user
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  if (!email || !message || !name) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const users = await fs.readJson(usersFile);
  const isUser = users.find(u => u.email === email);

  if (!isUser) {
    return res.status(403).json({ error: 'Only registered users can message' });
  }

  const messages = await fs.readJson(messagesFile);
  const newMsg = {
    name,
    email,
    message,
    createdAt: new Date().toISOString()
  };

  messages.push(newMsg);
  await fs.writeJson(messagesFile, messages, { spaces: 2 });
  res.json({ success: true, message: 'Message sent' });
});

// GET all messages — admin only
router.get('/admin/:email', async (req, res) => {
  const email = req.params.email;
  if (email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Unauthorized access' });
  }

  const messages = await fs.readJson(messagesFile);
  res.json(messages);
});

module.exports = router;
