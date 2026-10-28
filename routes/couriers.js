const express = require('express');
const router = express.Router();
const courierController = require('../controllers/courierController');

// Public routes
router.get('/', courierController.getCouriers);
router.get('/search', courierController.searchCouriers);
router.get('/statistics', courierController.getStatistics);
router.get('/tracking/:trackingNumber', courierController.getTrackingByNumber);

router.get('/:id', courierController.getCourierById);
router.post('/', courierController.createCourier);
router.put('/:id', courierController.updateCourier);
router.delete('/:id', courierController.deleteCourier);
router.patch('/:id/status', courierController.updateStatus);

// Tracking management routes
router.post('/tracking', courierController.createTracking);
router.put('/tracking/:id/status', courierController.updateTrackingStatus);
router.post('/tracking/:id/location', courierController.addLocationUpdate);
router.put('/tracking/:id/complete', courierController.completeDelivery);
router.put('/tracking/:id/fail', courierController.failDelivery);

module.exports = router;
