const courierService = require('../services/courierService');

class CourierController {
    // Get all couriers
    async getCouriers(req, res) {
        try {
            const { type, status, search, page, limit } = req.query;
            
            const result = await courierService.getCouriers({
                type,
                status,
                search,
                page,
                limit
            });
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getCouriers controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch couriers'
            });
        }
    }
    
    // Get courier by ID
    async getCourierById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await courierService.getCourierById(id);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getCourierById controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch courier'
            });
        }
    }
    
    // Create new courier
    async createCourier(req, res) {
        try {
            const result = await courierService.createCourier(req.body);
            
            if (!result.success) {
                return res.status(400).json(result);
            }
            
            res.status(201).json(result);
        } catch (error) {
            console.error('Error in createCourier controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create courier'
            });
        }
    }
    
    // Update courier
    async updateCourier(req, res) {
        try {
            const { id } = req.params;
            
            const result = await courierService.updateCourier(id, req.body);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in updateCourier controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update courier'
            });
        }
    }
    
    // Delete courier
    async deleteCourier(req, res) {
        try {
            const { id } = req.params;
            
            const result = await courierService.deleteCourier(id);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in deleteCourier controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to delete courier'
            });
        }
    }
    
    // Update courier status
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!status) {
                return res.status(400).json({
                    success: false,
                    error: 'Status is required'
                });
            }
            
            const result = await courierService.updateStatus(id, status);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in updateStatus controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update courier status'
            });
        }
    }
    
    // Get courier statistics
    async getStatistics(req, res) {
        try {
            const result = await courierService.getStatistics();
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getStatistics controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch statistics'
            });
        }
    }
    
    // Search couriers
    async searchCouriers(req, res) {
        try {
            const { q } = req.query;
            
            if (!q) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required'
                });
            }
            
            const result = await courierService.searchCouriers(q);
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in searchCouriers controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to search couriers'
            });
        }
    }
    
    // Create tracking record
    async createTracking(req, res) {
        try {
            const result = await courierService.createTracking(req.body);
            
            if (!result.success) {
                return res.status(400).json(result);
            }
            
            res.status(201).json(result);
        } catch (error) {
            console.error('Error in createTracking controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create tracking record'
            });
        }
    }
    
    // Update tracking status
    async updateTrackingStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            
            if (!status) {
                return res.status(400).json({
                    success: false,
                    error: 'Status is required'
                });
            }
            
            const result = await courierService.updateTrackingStatus(id, status, notes);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in updateTrackingStatus controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update tracking status'
            });
        }
    }
    
    // Add location update
    async addLocationUpdate(req, res) {
        try {
            const { id } = req.params;
            const locationData = req.body;
            
            const result = await courierService.addLocationUpdate(id, locationData);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in addLocationUpdate controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to add location update'
            });
        }
    }
    
    // Complete delivery
    async completeDelivery(req, res) {
        try {
            const { id } = req.params;
            const { signature, notes } = req.body;
            
            const result = await courierService.completeDelivery(id, signature, notes);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in completeDelivery controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to complete delivery'
            });
        }
    }
    
    // Fail delivery
    async failDelivery(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            
            if (!reason) {
                return res.status(400).json({
                    success: false,
                    error: 'Failure reason is required'
                });
            }
            
            const result = await courierService.failDelivery(id, reason);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in failDelivery controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to mark delivery as failed'
            });
        }
    }
    
    // Get tracking by number
    async getTrackingByNumber(req, res) {
        try {
            const { trackingNumber } = req.params;
            
            const result = await courierService.getTrackingByNumber(trackingNumber);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getTrackingByNumber controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch tracking information'
            });
        }
    }
}

module.exports = new CourierController();