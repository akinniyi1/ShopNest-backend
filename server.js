const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const adsFile = path.join("/mnt/data", "ads.json");

// Helper to read ads from file
function readAds() {
  try {
    const data = fs.readFileSync(adsFile, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
}

// Helper to write ads to file
function writeAds(ads) {
  fs.writeFileSync(adsFile, JSON.stringify(ads, null, 2));
}

// GET /api/ads → Get all ads
router.get("/", (req, res) => {
  const ads = readAds();
  res.json(ads);
});

// POST /api/ads/post-ad → Create new ad
router.post("/post-ad", (req, res) => {
  const newAd = req.body;

  if (!newAd.title || !newAd.images || !newAd.userEmail) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const ads = readAds();

  newAd.id = Date.now().toString();
  newAd.status = "active";
  ads.push(newAd);

  writeAds(ads);
  res.json({ success: true, id: newAd.id });
});

// PUT /api/ads/edit-ad/:id → Edit ad by ID
router.put("/edit-ad/:id", (req, res) => {
  const { id } = req.params;
  const updatedAd = req.body;

  let ads = readAds();
  const index = ads.findIndex(ad => ad.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Ad not found." });
  }

  ads[index] = { ...ads[index], ...updatedAd };
  writeAds(ads);
  res.json({ success: true, message: "Ad updated." });
});

// DELETE /api/ads/delete-ad/:id → Delete ad by ID
router.delete("/delete-ad/:id", (req, res) => {
  const { id } = req.params;
  let ads = readAds();
  const filtered = ads.filter(ad => ad.id !== id);

  if (ads.length === filtered.length) {
    return res.status(404).json({ error: "Ad not found." });
  }

  writeAds(filtered);
  res.json({ success: true, message: "Ad deleted." });
});

module.exports = router;
