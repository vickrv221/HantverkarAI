const express = require('express');
const router = express.Router();
const Offer = require('../models/offer');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Hämta alla offerter
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Skapa ny offert
router.post('/', async (req, res) => {
  const offer = new Offer(req.body);
  try {
    const newOffer = await offer.save();
    res.status(201).json(newOffer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
