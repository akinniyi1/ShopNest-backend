const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const adsFile = path.join("/mnt/data", "ads.json");

// POST /api/ads/post-ad
router.post("/post-ad", (req, res) => {
  const newAd = req.body;

  if (!newAd.title || !newAd.images || !newAd.userEmail) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  fs.readFile(adsFile, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read ads." });

    let ads = [];
    try {
      ads = JSON.parse(data);
    } catch (e) {
      ads = [];
    }

    newAd.id = Date.now().toString();
    newAd.status = "active";
    ads.push(newAd);

    fs.writeFile(adsFile, JSON.stringify(ads, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to save ad." });
      res.json({ success: true, id: newAd.id });
    });
  });
});

module.exports = router;
