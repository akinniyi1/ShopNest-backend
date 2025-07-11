const express = require('express');
const fs = require('fs-extra');
const router = express.Router();

const usersFile = './data/users.json';

// Register or update user info
router.post('/register', async (req, res) => {
  const { name, email, country } = req.body;

  if (!name || !email || !country) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const users = await fs.readJson(usersFile);
  const existing = users.find(u => u.email === email);

  if (existing) {
    // Update user info if already exists
    existing.name = name;
    existing.country = country;
    await fs.writeJson(usersFile, users, { spaces: 2 });
    return res.json({ success: true, user: existing });
  }

  const newUser = {
    name,
    email,
    country,
    plan: 'trial',
    createdAt: new Date().toISOString(),
    adsPosted: 0
  };

  users.push(newUser);
  await fs.writeJson(usersFile, users, { spaces: 2 });
  res.json({ success: true, user: newUser });
});

// Get user profile
router.get('/:email', async (req, res) => {
  const users = await fs.readJson(usersFile);
  const user = users.find(u => u.email === req.params.email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json(user);
});

// Upgrade user plan
router.post('/upgrade', async (req, res) => {
  const { email, plan } = req.body;
  const users = await fs.readJson(usersFile);
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ error: 'User not found' });

  user.plan = plan;
  await fs.writeJson(usersFile, users, { spaces: 2 });
  res.json({ success: true, plan });
});

module.exports = router;
