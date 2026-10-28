const Notification = require('../models/Notification');

class NotificationService {
    // Get all notifications with filters
    async getNotifications({ filter, page, limit, userId }) {
        try {
            const result = await Notification.findAll({
                filter,
                page,
                limit,
                userId
            });
            
            // Format notifications for frontend
            const formattedData = result.data.map(notif => ({
                id: notif.id,
                type: notif.type,
                title: notif.title,
                message: notif.message,
                priority: notif.priority,
                status: notif.status,
                time: notif.created_at,
                action: {
                    label: notif.action_label || 'View Details',
                    url: notif.action_url || '#'
                },
                metadata: notif.metadata ? JSON.parse(notif.metadata) : {}
            }));
            
            return {
                success: true,
                data: formattedData,
                hasMore: result.hasMore,
                total: result.total
            };
        } catch (error) {
            console.error('Error in getNotifications service:', error);
            throw error;
        }
    }
    
    // Get notification by ID
    async getNotificationById(id) {
        try {
            const notification = await Notification.findById(id);
            if (!notification) {
                return { success: false, error: 'Notification not found' };
            }
            
            return {
                success: true,
                data: {
                    id: notification.id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    priority: notification.priority,
                    status: notification.status,
                    time: notification.created_at,
                    action: {
                        label: notification.action_label || 'View Details',
                        url: notification.action_url || '#'
                    },
                    metadata: notification.metadata ? JSON.parse(notification.metadata) : {}
                }
            };
        } catch (error) {
            console.error('Error in getNotificationById service:', error);
            throw error;
        }
    }
    
    // Create new notification
    async createNotification(notificationData) {
        try {
            // Validate required fields
            if (!notificationData.type || !notificationData.title || !notificationData.message) {
                throw new Error('Type, title, and message are required');
            }
            
            // Validate type
            const validTypes = ['orders', 'stock', 'customers', 'reviews', 'delivery'];
            if (!validTypes.includes(notificationData.type)) {
                throw new Error('Invalid notification type');
            }
            
            const notification = await Notification.create(notificationData);
            
            return {
                success: true,
                data: notification,
                message: 'Notification created successfully'
            };
        } catch (error) {
            console.error('Error in createNotification service:', error);
            throw error;
        }
    }
    
    // Mark notification as read
    async markAsRead(id) {
        try {
            const notification = await Notification.updateStatus(id, 'read');
            
            if (!notification) {
                return { success: false, error: 'Notification not found' };
            }
            
            return {
                success: true,
                data: notification,
                message: 'Notification marked as read'
            };
        } catch (error) {
            console.error('Error in markAsRead service:', error);
            throw error;
        }
    }
    
    // Mark all notifications as read
    async markAllAsRead(userId = null) {
        try {
            const count = await Notification.markAllAsRead(userId);
            
            return {
                success: true,
                message: `Marked ${count} notifications as read`,
                count: count
            };
        } catch (error) {
            console.error('Error in markAllAsRead service:', error);
            throw error;
        }
    }
    
    // Delete notification
    async deleteNotification(id) {
        try {
            const deleted = await Notification.delete(id);
            
            if (!deleted) {
                return { success: false, error: 'Notification not found' };
            }
            
            return {
                success: true,
                message: 'Notification deleted successfully'
            };
        } catch (error) {
            console.error('Error in deleteNotification service:', error);
            throw error;
        }
    }
    
    // Get unread count
    async getUnreadCount(userId = null) {
        try {
            const count = await Notification.getUnreadCount(userId);
            
            return {
                success: true,
                count: count
            };
        } catch (error) {
            console.error('Error in getUnreadCount service:', error);
            throw error;
        }
    }
    
    // Get notifications by type
    async getNotificationsByType(type, limit = 10) {
        try {
            const notifications = await Notification.findByType(type, limit);
            
            return {
                success: true,
                data: notifications,
                count: notifications.length
            };
        } catch (error) {
            console.error('Error in getNotificationsByType service:', error);
            throw error;
        }
    }
    
    // Clean up old notifications
    async cleanupOldNotifications(days = 30) {
        try {
            const count = await Notification.deleteOld(days);
            
            return {
                success: true,
                message: `Deleted ${count} old notifications`,
                count: count
            };
        } catch (error) {
            console.error('Error in cleanupOldNotifications service:', error);
            throw error;
        }
    }
    
    // Create multiple notifications at once
    async createBulkNotifications(notificationsData) {
        try {
            const results = [];
            const errors = [];
            
            for (const data of notificationsData) {
                try {
                    const result = await this.createNotification(data);
                    results.push(result);
                } catch (error) {
                    errors.push({
                        data: data,
                        error: error.message
                    });
                }
            }
            
            return {
                success: true,
                created: results.length,
                errors: errors.length > 0 ? errors : undefined,
                results: results
            };
        } catch (error) {
            console.error('Error in createBulkNotifications service:', error);
            throw error;
        }
    }
    
    // Get notification statistics
    async getStatistics() {
        try {
            const types = ['orders', 'stock', 'customers', 'reviews', 'delivery'];
            const stats = {
                total: 0,
                unread: 0,
                byType: {},
                byPriority: { high: 0, medium: 0, low: 0 }
            };
            
            // Get total and unread
            const [totalResult] = await Notification.findAll({ limit: 1000 });
            stats.total = totalResult.total;
            stats.unread = await Notification.getUnreadCount();
            
            // Get counts by type
            for (const type of types) {
                const count = await Notification.findByType(type, 1000);
                stats.byType[type] = count.length;
            }
            
            // Get priority counts (SQL query needed)
            const [priorityRows] = await db.query(
                'SELECT priority, COUNT(*) as count FROM notifications GROUP BY priority'
            );
            priorityRows.forEach(row => {
                stats.byPriority[row.priority] = row.count;
            });
            
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('Error in getStatistics service:', error);
            throw error;
        }
    }
}

module.exports = new NotificationService();