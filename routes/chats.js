const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/', auth, chatController.sendMessage);
router.get('/', auth, chatController.getMessages);
router.get('/active-users', auth, chatController.getActiveUsers);

module.exports = router;