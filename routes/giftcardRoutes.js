const express = require('express');
const router = express.Router();
const giftcardController = require('../controllers/giftcardController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.post('/check', giftcardController.checkBalance);

// Protected routes (require login)
router.post('/create', protect, giftcardController.createGiftCard);
router.post('/redeem', protect, giftcardController.redeemGiftCard);
router.get('/my-gift-cards', protect, giftcardController.getMyGiftCards);
router.delete('/:id', protect, giftcardController.cancelGiftCard);

// Admin routes
router.get('/', protect, admin, giftcardController.getAllGiftCards);

module.exports = router;