const express = require('express');
const fs = require('fs-extra');
const router = express.Router();

const reviewsFile = './data/reviews.json';
const usersFile = './data/users.json';

// Submit a review
router.post('/', async (req, res) => {
  const { email, productId, rating, comment } = req.body;

  if (!email || !productId || !rating || !comment) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const users = await fs.readJson(usersFile);
  const isUser = users.find(u => u.email === email);

  if (!isUser) {
    return res.status(403).json({ error: 'Only registered users can review' });
  }

  const reviews = await fs.readJson(reviewsFile);
  reviews.push({
    email,
    productId,
    rating,
    comment,
    createdAt: new Date().toISOString()
  });

  await fs.writeJson(reviewsFile, reviews, { spaces: 2 });
  res.json({ success: true });
});

// Get reviews for a product
router.get('/:productId', async (req, res) => {
  const reviews = await fs.readJson(reviewsFile);
  const productReviews = reviews.filter(r => r.productId === req.params.productId);
  res.json(productReviews);
});

module.exports = router;
