const Reply = require('../models/Reply');
const Ticket = require('../models/Ticket');

exports.addReply = async (req, res) => {
    try {
        const { message } = req.body;
        const ticketId = req.params.ticketId;
        const userId = req.user.id;
        const isAgent = req.user.role === 'admin';

        await Reply.create(ticketId, userId, message, isAgent);
        
        if (isAgent) {
            await Ticket.updateStatus(ticketId, 'in_progress');
        }

        res.status(201).json({ success: true, message: 'Reply added' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getReplies = async (req, res) => {
    try {
        const replies = await Reply.findByTicketId(req.params.ticketId);
        res.json({ success: true, replies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};