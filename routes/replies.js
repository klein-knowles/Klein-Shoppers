const express = require('express');
const router = express.Router();
const replyController = require('../controllers/replyController');
const auth = require('../middleware/auth');

router.post('/:ticketId', auth, replyController.addReply);
router.get('/:ticketId', auth, replyController.getReplies);

module.exports = router;