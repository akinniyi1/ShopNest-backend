const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = '/mnt/data';
const requiredFiles = [
  'users.json',
  'ads.json',
  'messages.json',
  'orders.json',
  'reviews.json'
];

// Ensure /mnt/data and all JSON files exist
async function initializeStorage() {
  try {
    await fs.ensureDir(dataDir);
    for (const file of requiredFiles) {
      const filePath = path.join(dataDir, file);
      if (!await fs.pathExists(filePath)) {
        await fs.writeJson(filePath, [], { spaces: 2 });
        console.log(`✅ Created: ${filePath}`);
      }
    }
  } catch (err) {
    console.error('❌ Error initializing storage:', err.message);
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Updated paths (no "../" anymore)
const adsRoutes = require('./routes/ads');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

app.use('/api/ads', adsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('ShopNest backend running ✅');
});

// Start server
app.listen(PORT, async () => {
  await initializeStorage();
  console.log(`🚀 Server running on port ${PORT}`);
});
