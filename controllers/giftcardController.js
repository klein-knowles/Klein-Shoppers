const GiftCard = require('../models/GiftCard');
const crypto = require('crypto');

// Generate unique gift card code
function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'GIFT-';
    for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 3 || i === 7) code += '-';
    }
    return code;
}

exports.createGiftCard = async (req, res) => {
    try {
        const { amount, recipientEmail, recipientName, message, expiryDays = 365 } = req.body;
        
        // Validate
        if (!amount || amount < 1) {
            return res.status(400).json({ error: 'Amount must be at least 1' });
        }
        if (!recipientEmail) {
            return res.status(400).json({ error: 'Recipient email is required' });
        }
        
        // Generate unique code
        let code, existing;
        do {
            code = generateCode();
            existing = await GiftCard.findByCode(code);
        } while (existing);
        
        // Calculate expiry
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
        
        // Create gift card
        const result = await GiftCard.create({
            code,
            amount: parseFloat(amount),
            createdBy: req.user.id,
            recipientEmail,
            recipientName,
            message,
            expiryDate
        });
        
        res.status(201).json({
            success: true,
            message: '🎁 Gift card created successfully!',
            giftCard: {
                code,
                amount,
                recipientEmail,
                expiryDate
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkBalance = async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Gift card code is required' });
        }
        
        const card = await GiftCard.findByCode(code.toUpperCase());
        
        if (!card) {
            return res.status(404).json({ error: 'Gift card not found' });
        }
        
        // Check expiry
        if (card.expiry_date < new Date() && card.status === 'active') {
            await GiftCard.updateStatus(card.id, 'expired');
            card.status = 'expired';
        }
        
        res.json({
            success: true,
            giftCard: {
                code: card.code,
                amount: parseFloat(card.amount),
                remainingBalance: parseFloat(card.remaining_balance),
                status: card.status,
                expiryDate: card.expiry_date,
                recipientEmail: card.recipient_email,
                recipientName: card.recipient_name,
                message: card.message,
                isExpired: card.expiry_date < new Date(),
                isValid: card.status === 'active' && card.remaining_balance > 0 && card.expiry_date > new Date()
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.redeemGiftCard = async (req, res) => {
    try {
        const { code, orderId, amount } = req.body;
        
        if (!code || !orderId || !amount) {
            return res.status(400).json({ error: 'Code, orderId, and amount are required' });
        }
        
        const card = await GiftCard.findByCode(code.toUpperCase());
        
        if (!card) {
            return res.status(404).json({ error: 'Gift card not found' });
        }
        
        if (card.status !== 'active') {
            return res.status(400).json({ error: 'Gift card is not active' });
        }
        
        if (card.expiry_date < new Date()) {
            await GiftCard.updateStatus(card.id, 'expired');
            return res.status(400).json({ error: 'Gift card has expired' });
        }
        
        if (parseFloat(amount) > parseFloat(card.remaining_balance)) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        
        // Redeem
        const result = await GiftCard.redeem(
            card.id,
            parseFloat(amount),
            req.user.id,
            orderId
        );
        
        res.json({
            success: true,
            message: `✅ Successfully redeemed $${amount} from gift card`,
            remainingBalance: result.newBalance,
            status: result.status
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMyGiftCards = async (req, res) => {
    try {
        const cards = await GiftCard.getUserCards(req.user.email);
        
        res.json({
            success: true,
            giftCards: cards.map(card => ({
                code: card.code,
                amount: parseFloat(card.amount),
                remainingBalance: parseFloat(card.remaining_balance),
                status: card.status,
                expiryDate: card.expiry_date,
                message: card.message,
                isExpired: card.expiry_date < new Date()
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllGiftCards = async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;
        const cards = await GiftCard.getAll({ status, limit });
        
        res.json({
            success: true,
            giftCards: cards
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.cancelGiftCard = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await GiftCard.findById(id);
        
        if (!card) {
            return res.status(404).json({ error: 'Gift card not found' });
        }
        
        if (card.created_by !== req.user.id && !req.user.is_admin) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        if (card.status === 'redeemed') {
            return res.status(400).json({ error: 'Cannot cancel a redeemed gift card' });
        }
        
        await GiftCard.updateStatus(id, 'cancelled');
        
        res.json({
            success: true,
            message: 'Gift card cancelled'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};