// routes/postAdStandalone.js
const express = require("express");
const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const dataDir = "/mnt/data";
const adsFile = path.join(dataDir, "ads-standalone.json");

// Ensure file exists
fs.ensureFileSync(adsFile);
fs.ensureJsonFileSync = async (file) => {
  try {
    await fs.access(file);
  } catch {
    await fs.writeJson(file, []);
  }
};
fs.ensureJsonFileSync(adsFile);

// POST /api/standalone-post-ad
router.post("/", async (req, res) => {
  try {
    const ad = req.body;

    // Basic validation
    if (
      !ad.userEmail ||
      !ad.title ||
      !ad.price ||
      !ad.description ||
      !ad.images ||
      !Array.isArray(ad.images)
    ) {
      return res.status(400).json({ error: "Missing required fields or images not array" });
    }

    const ads = await fs.readJson(adsFile);

    const newAd = {
      id: uuidv4(),
      ...ad,
      status: "active",
      createdAt: new Date().toISOString()
    };

    ads.push(newAd);
    await fs.writeJson(adsFile, ads, { spaces: 2 });

    res.json({ success: true, ad: newAd });
  } catch (err) {
    console.error("Standalone Ad Error:", err);
    res.status(500).json({ error: "Server error. Could not post ad." });
  }
});

module.exports = router;
