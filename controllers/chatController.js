const Chat = require('../models/Chat');

exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;
        const isAgent = req.user.role === 'admin';

        await Chat.saveMessage(userId, message, isAgent);
        res.status(201).json({ success: true, message: 'Message sent' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.role === 'customer' ? req.user.id : req.query.userId;
        const messages = await Chat.getMessages(userId);
        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getActiveUsers = async (req, res) => {
    try {
        const users = await Chat.getActiveUsers();
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};