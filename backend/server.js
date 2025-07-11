const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static public folder (optional for static hosting)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const adsRoutes = require('./routes/ads');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');

app.use('/api/ads', adsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('ShopNest backend running ✅');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
