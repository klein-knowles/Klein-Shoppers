const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');

router.get('/', returnController.getReturns);
router.get('/search', returnController.searchReturns);
router.get('/statistics', returnController.getStatistics);

// Return management routes
router.get('/:id', returnController.getReturnById);
router.post('/', returnController.createReturn);
router.put('/:id', returnController.updateReturn);
router.patch('/:id/status', returnController.updateStatus);

// Refund routes
router.post('/refund/:id/process', returnController.processRefund);
router.put('/refund/:id/complete', returnController.completeRefund);
router.put('/refund/:id/fail', returnController.failRefund);

module.exports = router;
