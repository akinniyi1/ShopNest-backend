const express = require('express');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const adsFile = './data/ads.json';

// GET all ads
router.get('/', async (req, res) => {
  const ads = await fs.readJson(adsFile);
  res.json(ads);
});

// POST new ad
router.post('/', async (req, res) => {
  const ad = req.body;
  if (!ad.userEmail || !ad.title || !ad.price || !ad.category) {
    return res.status(400).json({ error: 'Missing required ad fields' });
  }

  const ads = await fs.readJson(adsFile);
  const userAds = ads.filter(a => a.userEmail === ad.userEmail);

  // Check trial post limit (2)
  const users = await fs.readJson('./data/users.json');
  const user = users.find(u => u.email === ad.userEmail);

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
});

// PUT edit ad
router.put('/:id', async (req, res) => {
  const ads = await fs.readJson(adsFile);
  const index = ads.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Ad not found' });
  }

  ads[index] = { ...ads[index], ...req.body };
  await fs.writeJson(adsFile, ads, { spaces: 2 });
  res.json({ success: true, ad: ads[index] });
});

// DELETE ad
router.delete('/:id', async (req, res) => {
  const ads = await fs.readJson(adsFile);
  const filtered = ads.filter(a => a.id !== req.params.id);

  if (filtered.length === ads.length) {
    return res.status(404).json({ error: 'Ad not found' });
  }

  await fs.writeJson(adsFile, filtered, { spaces: 2 });
  res.json({ success: true });
});

module.exports = router;
