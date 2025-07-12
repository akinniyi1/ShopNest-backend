// routes/postAd.js
const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const dataDir = '/mnt/data';
const adsFile = path.join(dataDir, 'ads.json');
const usersFile = path.join(dataDir, 'users.json');

// POST /api/post-ad
router.post('/', async (req, res) => {
  try {
    const ad = req.body;

    // Basic validation
    if (!ad.userEmail || !ad.title || !ad.price || !ad.category || !Array.isArray(ad.images)) {
      return res.status(400).json({ error: 'Missing required fields or invalid image format' });
    }

    const ads = await fs.readJson(adsFile);
    const users = await fs.readJson(usersFile);
    const user = users.find(u => u.email === ad.userEmail);
    const userAds = ads.filter(a => a.userEmail === ad.userEmail);

    const plan = user?.plan || 'trial';
    const trialPosts = userAds.length;

    if (plan === 'trial' && trialPosts >= 2) {
      return res.status(403).json({ error: 'Trial post limit reached' });
    }

    const newAd = {
      id: uuidv4(),
      ...ad,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    ads.push(newAd);
    await fs.writeJson(adsFile, ads, { spaces: 2 });
    res.json({ success: true, ad: newAd });
  } catch (err) {
    console.error("Error posting ad:", err);
    res.status(500).json({ error: 'Server error. Could not post ad.' });
  }
});

module.exports = router;
