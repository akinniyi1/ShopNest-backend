const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const router = express.Router();

const dataDir = '/mnt/data';
const messagesFile = path.join(dataDir, 'messages.json');
const usersFile = path.join(dataDir, 'users.json');
const ADMIN_EMAIL = 'akinrinadeakinniyi9@gmail.com';

// POST a message from user
router.post('/', async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }
});

// GET all messages — admin only
router.get('/admin/:email', async (req, res) => {
  try {
    const email = req.params.email;
    if (email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const messages = await fs.readJson(messagesFile);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages', details: err.message });
  }
});

module.exports = router;
