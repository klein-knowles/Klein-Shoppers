const express = require('express');
const crypto = require('crypto');
const GiftCard = require('../models/GiftCard');
const { protect } = require('../middleware/auth');
const router = express.Router();

// ============ HELPER: Generate unique gift card code ============
function generateGiftCardCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'GIFT-';
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
    if (i === 3 || i === 7) result += '-';
  }
  return result;
}

// ============ ROUTES ============

// 1. CREATE a gift card
router.post('/create', protect, async (req, res) => {
  try {
    const { 
      amount, 
      recipientEmail, 
      recipientName, 
      message, 
      expiryDays = 365 // Default 1 year
    } = req.body;

    // Validate
    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Amount must be at least 1' });
    }
    if (!recipientEmail) {
      return res.status(400).json({ message: 'Recipient email is required' });
    }

    // Generate unique code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateGiftCardCode();
      const existing = await GiftCard.findOne({ code });
      if (!existing) isUnique = true;
    }

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));

    // Create gift card
    const giftCard = await GiftCard.create({
      code,
      amount,
      remainingBalance: amount,
      createdBy: req.user._id,
      recipientEmail,
      recipientName: recipientName || 'Valued Customer',
      message: message || 'Enjoy your gift! 🎁',
      expiryDate,
      transactions: [{
        amount: amount,
        date: new Date(),
        type: 'created',
        note: `Gift card created by ${req.user.name}`
      }]
    });

    res.status(201).json({
      success: true,
      giftCard: {
        code: giftCard.code,
        amount: giftCard.amount,
        recipientEmail: giftCard.recipientEmail,
        expiryDate: giftCard.expiryDate,
        message: giftCard.message
      },
      message: '🎁 Gift card created successfully!'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. CHECK gift card balance
router.post('/check', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Gift card code is required' });
    }

    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() })
      .populate('createdBy', 'name email');

    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    // Check expiry
    if (giftCard.expiryDate < new Date() && giftCard.status === 'active') {
      giftCard.status = 'expired';
      await giftCard.save();
    }

    res.json({
      success: true,
      giftCard: {
        code: giftCard.code,
        amount: giftCard.amount,
        remainingBalance: giftCard.remainingBalance,
        status: giftCard.status,
        expiryDate: giftCard.expiryDate,
        recipientEmail: giftCard.recipientEmail,
        recipientName: giftCard.recipientName,
        message: giftCard.message,
        isExpired: giftCard.expiryDate < new Date(),
        isValid: giftCard.isValid()
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. REDEEM gift card (apply to order)
router.post('/redeem', protect, async (req, res) => {
  try {
    const { code, orderId, amount } = req.body;

    if (!code || !orderId || !amount) {
      return res.status(400).json({ message: 'Code, orderId, and amount are required' });
    }

    const giftCard = await GiftCard.findOne({ code: code.toUpperCase() });

    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    // Check if valid
    if (!giftCard.isValid()) {
      let message = 'Gift card is not valid. ';
      if (giftCard.status === 'expired') message += 'Card has expired.';
      else if (giftCard.status === 'redeemed') message += 'Card has been fully redeemed.';
      else if (giftCard.remainingBalance === 0) message += 'No balance remaining.';
      return res.status(400).json({ message });
    }

    // Redeem
    const redeemedCard = await giftCard.redeem(amount, req.user._id, orderId);

    res.json({
      success: true,
      message: `✅ Successfully redeemed $${amount} from gift card`,
      remainingBalance: redeemedCard.remainingBalance,
      status: redeemedCard.status
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. GET all gift cards (admin)
router.get('/', protect, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;

    const giftCards = await GiftCard.find(filter)
      .populate('createdBy', 'name email')
      .populate('redeemedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await GiftCard.countDocuments(filter);

    res.json({
      success: true,
      giftCards,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. GET gift cards by user
router.get('/my-gift-cards', protect, async (req, res) => {
  try {
    const giftCards = await GiftCard.find({
      recipientEmail: req.user.email,
      status: { $in: ['active', 'redeemed'] }
    })
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      giftCards: giftCards.map(card => ({
        code: card.code,
        amount: card.amount,
        remainingBalance: card.remainingBalance,
        status: card.status,
        expiryDate: card.expiryDate,
        message: card.message,
        isExpired: card.expiryDate < new Date()
      }))
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. CANCEL gift card
router.delete('/:id', protect, async (req, res) => {
  try {
    const giftCard = await GiftCard.findById(req.params.id);
    
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }

    // Only admin or creator can cancel
    if (giftCard.createdBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (giftCard.status === 'redeemed') {
      return res.status(400).json({ message: 'Cannot cancel a redeemed gift card' });
    }

    giftCard.status = 'cancelled';
    await giftCard.save();

    res.json({ success: true, message: 'Gift card cancelled' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;