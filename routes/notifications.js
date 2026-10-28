const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const adminAuth = require('../middleware/adminAuth');

// Notifications are an administration feature in the current site.
router.use(adminAuth);

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.get('/statistics', notificationController.getStatistics);
router.get('/type/:type', notificationController.getByType);

router.get('/:id', notificationController.getNotificationById);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

router.post('/', notificationController.createNotification);
router.post('/bulk', notificationController.bulkCreate);
router.delete('/cleanup', notificationController.cleanup);

module.exports = router;
