const express = require('express');
const router = express.Router();
const Offer = require('../models/offer');
const authMiddleware = require('../middleware/auth');

/**
 * Offer Routes för HantverkarAI
 * Hanterar CRUD-operationer för offerter
 * Alla routes kräver autentisering
 */

// Använd autentisering för alla routes
router.use(authMiddleware);

/**
 * GET /api/offers
 * Hämtar alla offerter för inloggad användare
 */
router.get('/', async (req, res) => {
  try {
    // Hämta endast användarens egna offerter, sorterade efter nyast först
    const offers = await Offer.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Kunde inte hämta offerter' });
  }
});

/**
 * POST /api/offers
 * Skapar ny offert för inloggad användare
 */
router.post('/', async (req, res) => {
  try {
    const offer = new Offer({
      ...req.body,
      userId: req.user.id // Koppla offerten till användaren
    });
    
    const newOffer = await offer.save();
    res.status(201).json(newOffer);
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(400).json({ message: 'Kunde inte skapa offert' });
  }
});

/**
 * PUT /api/offers/:id
 * Uppdaterar befintlig offert (endast användarens egna)
 */
router.put('/:id', async (req, res) => {
  try {
    const offer = await Offer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, // Säkerställ att det är användarens offert
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!offer) {
      return res.status(404).json({ message: 'Offert hittades inte' });
    }
    
    res.json(offer);
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(400).json({ message: 'Kunde inte uppdatera offert' });
  }
});

/**
 * PATCH /api/offers/:id/status
 * Uppdaterar endast status för offert
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validera att status är giltig
    const validStatuses = ['draft', 'sent', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Ogiltig status' });
    }
    
    const offer = await Offer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );
    
    if (!offer) {
      return res.status(404).json({ message: 'Offert hittades inte' });
    }
    
    res.json(offer);
  } catch (error) {
    console.error('Error updating offer status:', error);
    res.status(400).json({ message: 'Kunde inte uppdatera status' });
  }
});

/**
 * DELETE /api/offers/:id
 * Tar bort offert (endast användarens egna)
 */
router.delete('/:id', async (req, res) => {
  try {
    const offer = await Offer.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!offer) {
      return res.status(404).json({ message: 'Offert hittades inte' });
    }
    
    res.json({ message: 'Offert borttagen framgångsrikt' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ message: 'Kunde inte ta bort offert' });
  }
});

module.exports = router;