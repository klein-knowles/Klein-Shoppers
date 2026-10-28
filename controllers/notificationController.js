const notificationService = require('../services/notificationService');

class NotificationController {
    // Get all notifications
    async getNotifications(req, res) {
        try {
            const { filter, page = 1, limit = 10 } = req.query;
            const userId = req.user ? req.user.id : null;
            
            const result = await notificationService.getNotifications({
                filter,
                page: parseInt(page),
                limit: parseInt(limit),
                userId
            });
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getNotifications controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch notifications'
            });
        }
    }
    
    // Get notification by ID
    async getNotificationById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await notificationService.getNotificationById(id);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getNotificationById controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch notification'
            });
        }
    }
    
    // Create new notification
    async createNotification(req, res) {
        try {
            const notificationData = {
                ...req.body,
                user_id: req.user ? req.user.id : null
            };
            
            const result = await notificationService.createNotification(notificationData);
            
            if (!result.success) {
                return res.status(400).json(result);
            }
            
            res.status(201).json(result);
        } catch (error) {
            console.error('Error in createNotification controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create notification'
            });
        }
    }
    
    // Mark notification as read
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            
            const result = await notificationService.markAsRead(id);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in markAsRead controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to mark notification as read'
            });
        }
    }
    
    // Mark all notifications as read
    async markAllAsRead(req, res) {
        try {
            const userId = req.user ? req.user.id : null;
            
            const result = await notificationService.markAllAsRead(userId);
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in markAllAsRead controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to mark all as read'
            });
        }
    }
    
    // Delete notification
    async deleteNotification(req, res) {
        try {
            const { id } = req.params;
            
            const result = await notificationService.deleteNotification(id);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in deleteNotification controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to delete notification'
            });
        }
    }
    
    // Get unread count
    async getUnreadCount(req, res) {
        try {
            const userId = req.user ? req.user.id : null;
            
            const result = await notificationService.getUnreadCount(userId);
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getUnreadCount controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get unread count'
            });
        }
    }
    
    // Get notifications by type
    async getByType(req, res) {
        try {
            const { type } = req.params;
            const { limit = 10 } = req.query;
            
            const result = await notificationService.getNotificationsByType(
                type,
                parseInt(limit)
            );
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getByType controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get notifications by type'
            });
        }
    }
    
    // Bulk create notifications
    async bulkCreate(req, res) {
        try {
            const { notifications } = req.body;
            
            if (!notifications || !Array.isArray(notifications)) {
                return res.status(400).json({
                    success: false,
                    error: 'Notifications array is required'
                });
            }
            
            const result = await notificationService.createBulkNotifications(notifications);
            
            res.status(201).json(result);
        } catch (error) {
            console.error('Error in bulkCreate controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create bulk notifications'
            });
        }
    }
    
    // Cleanup old notifications
    async cleanup(req, res) {
        try {
            const { days = 30 } = req.query;
            
            const result = await notificationService.cleanupOldNotifications(
                parseInt(days)
            );
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in cleanup controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to cleanup notifications'
            });
        }
    }
    
    // Get notification statistics
    async getStatistics(req, res) {
        try {
            const result = await notificationService.getStatistics();
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getStatistics controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to get statistics'
            });
        }
    }
}

module.exports = new NotificationController();