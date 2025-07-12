const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const dataDir = '/mnt/data';
const adsFile = path.join(dataDir, 'ads.json');
const usersFile = path.join(dataDir, 'users.json');

// GET all ads
router.get('/', async (req, res) => {
  try {
    const ads = await fs.readJson(adsFile);
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read ads', details: err.message });
  }
});

// POST new ad
router.post('/', async (req, res) => {
  try {
    const ad = req.body;
    console.log("📩 New ad received:", ad); // Debug log

    // Validate required fields
    if (!ad.userEmail || !ad.title || !ad.price || !ad.category) {
      return res.status(400).json({ error: 'Missing required ad fields' });
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
      userEmail: ad.userEmail,
      title: ad.title,
      description: ad.description || '',
      price: ad.price,
      currency: ad.currency || 'NGN',
      category: ad.category,
      subOptions: ad.subOptions || {},
      location: ad.location || '',
      deliveryTime: ad.deliveryTime || '',
      images: ad.images || [],
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    ads.push(newAd);
    await fs.writeJson(adsFile, ads, { spaces: 2 });

    res.status(201).json({ success: true, ad: newAd });
  } catch (err) {
    console.error("❌ Failed to post ad:", err.message);
    res.status(500).json({ error: 'Failed to post ad', details: err.message });
  }
});

// PUT edit ad
router.put('/:id', async (req, res) => {
  try {
    const ads = await fs.readJson(adsFile);
    const index = ads.findIndex(a => a.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    ads[index] = { ...ads[index], ...req.body };
    await fs.writeJson(adsFile, ads, { spaces: 2 });
    res.json({ success: true, ad: ads[index] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit ad', details: err.message });
  }
});

// DELETE ad
router.delete('/:id', async (req, res) => {
  try {
    const ads = await fs.readJson(adsFile);
    const filtered = ads.filter(a => a.id !== req.params.id);

    if (filtered.length === ads.length) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    await fs.writeJson(adsFile, filtered, { spaces: 2 });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete ad', details: err.message });
  }
});

module.exports = router;
