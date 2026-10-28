const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/auth');

router.post('/', auth, ticketController.createTicket);
router.get('/', auth, ticketController.getAllTickets);
router.get('/stats', auth, ticketController.getStats);
router.get('/:id', auth, ticketController.getTicket);
router.put('/:id/status', auth, ticketController.updateStatus);

module.exports = router;