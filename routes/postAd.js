const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const dataDir = '/mnt/data';
const postAdFile = path.join(dataDir, 'post-ads.json');
const usersFile = path.join(dataDir, 'users.json');

// Make sure file exists
fs.ensureFileSync(postAdFile);

// POST /api/post-ad
router.post('/', async (req, res) => {
  try {
    const ad = req.body;
    if (!ad.userEmail || !ad.title || !ad.price || !ad.category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ads = await fs.readJson(postAdFile).catch(() => []);
    const users = await fs.readJson(usersFile).catch(() => []);

    const user = users.find(u => u.email === ad.userEmail);
    const userAds = ads.filter(a => a.userEmail === ad.userEmail);
    const plan = user?.plan || 'trial';

    if (plan === 'trial' && userAds.length >= 2) {
      return res.status(403).json({ error: 'Trial post limit reached' });
    }

    const newAd = {
      id: uuidv4(),
      ...ad,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    ads.push(newAd);
    await fs.writeJson(postAdFile, ads, { spaces: 2 });

    res.json({ success: true, ad: newAd });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
