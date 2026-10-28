const Courier = require('../models/Courier');
const CourierTracking = require('../models/CourierTracking');
const { generateCourierCode } = require('../utils/helpers');

class CourierService {
    // Get all couriers with filters
    async getCouriers({ type, status, search, page, limit }) {
        try {
            const result = await Courier.findAll({
                type,
                status,
                search,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10
            });
            
            return {
                success: true,
                data: result.data,
                pagination: {
                    total: result.total,
                    page: result.page,
                    limit: result.limit,
                    hasMore: result.hasMore
                }
            };
        } catch (error) {
            console.error('Error in getCouriers service:', error);
            throw error;
        }
    }
    
    // Get courier by ID
    async getCourierById(id) {
        try {
            const courier = await Courier.findById(id);
            if (!courier) {
                return { success: false, error: 'Courier not found' };
            }
            
            // Get tracking history
            const tracking = await CourierTracking.findByCourierId(id);
            
            return {
                success: true,
                data: {
                    ...courier,
                    tracking_history: tracking
                }
            };
        } catch (error) {
            console.error('Error in getCourierById service:', error);
            throw error;
        }
    }
    
    // Create new courier
    async createCourier(data) {
        try {
            // Validate required fields
            const required = ['name', 'type', 'phone'];
            for (const field of required) {
                if (!data[field]) {
                    throw new Error(`${field} is required`);
                }
            }
            
            // Generate unique code if not provided
            if (!data.code) {
                data.code = await generateCourierCode(data.type);
            }
            
            const courier = await Courier.create(data);
            
            return {
                success: true,
                data: courier,
                message: 'Courier created successfully'
            };
        } catch (error) {
            console.error('Error in createCourier service:', error);
            throw error;
        }
    }
    
    // Update courier
    async updateCourier(id, data) {
        try {
            const courier = await Courier.update(id, data);
            if (!courier) {
                return { success: false, error: 'Courier not found' };
            }
            
            return {
                success: true,
                data: courier,
                message: 'Courier updated successfully'
            };
        } catch (error) {
            console.error('Error in updateCourier service:', error);
            throw error;
        }
    }
    
    // Delete courier
    async deleteCourier(id) {
        try {
            const deleted = await Courier.delete(id);
            if (!deleted) {
                return { success: false, error: 'Courier not found' };
            }
            
            return {
                success: true,
                message: 'Courier deleted successfully'
            };
        } catch (error) {
            console.error('Error in deleteCourier service:', error);
            throw error;
        }
    }
    
    // Update courier status
    async updateStatus(id, status) {
        try {
            const courier = await Courier.updateStatus(id, status);
            if (!courier) {
                return { success: false, error: 'Courier not found' };
            }
            
            return {
                success: true,
                data: courier,
                message: `Courier status updated to ${status}`
            };
        } catch (error) {
            console.error('Error in updateStatus service:', error);
            throw error;
        }
    }
    
    // Get courier statistics
    async getStatistics() {
        try {
            const stats = await Courier.getStatistics();
            const trackingStats = await CourierTracking.getStatistics();
            
            return {
                success: true,
                data: {
                    couriers: stats,
                    tracking: trackingStats
                }
            };
        } catch (error) {
            console.error('Error in getStatistics service:', error);
            throw error;
        }
    }
    
    // Search couriers
    async searchCouriers(query) {
        try {
            if (!query || query.length < 2) {
                return { success: false, error: 'Search query must be at least 2 characters' };
            }
            
            const results = await Courier.search(query);
            
            return {
                success: true,
                data: results,
                count: results.length
            };
        } catch (error) {
            console.error('Error in searchCouriers service:', error);
            throw error;
        }
    }
    
    // Create tracking record
    async createTracking(data) {
        try {
            const required = ['courier_id', 'order_id', 'tracking_number', 'delivery_location'];
            for (const field of required) {
                if (!data[field]) {
                    throw new Error(`${field} is required`);
                }
            }
            
            const tracking = await CourierTracking.create(data);
            
            return {
                success: true,
                data: tracking,
                message: 'Tracking record created successfully'
            };
        } catch (error) {
            console.error('Error in createTracking service:', error);
            throw error;
        }
    }
    
    // Update tracking status
    async updateTrackingStatus(id, status, notes = null) {
        try {
            const tracking = await CourierTracking.updateStatus(id, status, notes);
            if (!tracking) {
                return { success: false, error: 'Tracking record not found' };
            }
            
            return {
                success: true,
                data: tracking,
                message: `Tracking status updated to ${status}`
            };
        } catch (error) {
            console.error('Error in updateTrackingStatus service:', error);
            throw error;
        }
    }
    
    // Add location update
    async addLocationUpdate(id, locationData) {
        try {
            const tracking = await CourierTracking.addLocationUpdate(id, locationData);
            if (!tracking) {
                return { success: false, error: 'Tracking record not found' };
            }
            
            return {
                success: true,
                data: tracking,
                message: 'Location updated successfully'
            };
        } catch (error) {
            console.error('Error in addLocationUpdate service:', error);
            throw error;
        }
    }
    
    // Complete delivery
    async completeDelivery(id, signature = null, notes = null) {
        try {
            const tracking = await CourierTracking.completeDelivery(id, signature, notes);
            if (!tracking) {
                return { success: false, error: 'Tracking record not found' };
            }
            
            return {
                success: true,
                data: tracking,
                message: 'Delivery marked as completed'
            };
        } catch (error) {
            console.error('Error in completeDelivery service:', error);
            throw error;
        }
    }
    
    // Fail delivery
    async failDelivery(id, reason) {
        try {
            const tracking = await CourierTracking.failDelivery(id, reason);
            if (!tracking) {
                return { success: false, error: 'Tracking record not found' };
            }
            
            return {
                success: true,
                data: tracking,
                message: 'Delivery marked as failed'
            };
        } catch (error) {
            console.error('Error in failDelivery service:', error);
            throw error;
        }
    }
    
    // Get tracking by number
    async getTrackingByNumber(trackingNumber) {
        try {
            const tracking = await CourierTracking.findByTrackingNumber(trackingNumber);
            if (!tracking) {
                return { success: false, error: 'Tracking record not found' };
            }
            
            return {
                success: true,
                data: tracking
            };
        } catch (error) {
            console.error('Error in getTrackingByNumber service:', error);
            throw error;
        }
    }
}

module.exports = new CourierService();