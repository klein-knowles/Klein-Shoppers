const Ticket = require('../models/Ticket');
const Reply = require('../models/Reply');

exports.createTicket = async (req, res) => {
    try {
        const { subject, description, priority } = req.body;
        const userId = req.user.id;
        const ticketId = await Ticket.create(userId, subject, description, priority);
        
        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            ticketId
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) filters.status = req.query.status;
        if (req.query.priority) filters.priority = req.query.priority;
        if (req.user.role !== 'admin') filters.userId = req.user.id;

        const tickets = await Ticket.findAll(filters);
        res.json({ success: true, tickets });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }
        const replies = await Reply.findByTicketId(req.params.id);
        res.json({ success: true, ticket, replies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        await Ticket.updateStatus(req.params.id, req.body.status);
        res.json({ success: true, message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const stats = await Ticket.getStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};