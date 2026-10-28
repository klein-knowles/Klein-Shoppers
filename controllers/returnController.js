const returnService = require('../services/returnService');

class ReturnController {
    // Get all returns
    async getReturns(req, res) {
        try {
            const { status, search, dateFrom, dateTo, page, limit } = req.query;
            
            const result = await returnService.getReturns({
                status,
                search,
                dateFrom,
                dateTo,
                page,
                limit
            });
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getReturns controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch returns'
            });
        }
    }
    
    // Get return by ID
    async getReturnById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await returnService.getReturnById(id);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getReturnById controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch return'
            });
        }
    }
    
    // Create new return
    async createReturn(req, res) {
        try {
            const result = await returnService.createReturn(req.body);
            
            if (!result.success) {
                return res.status(400).json(result);
            }
            
            res.status(201).json(result);
        } catch (error) {
            console.error('Error in createReturn controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to create return'
            });
        }
    }
    
    // Update return
    async updateReturn(req, res) {
        try {
            const { id } = req.params;
            
            const result = await returnService.updateReturn(id, req.body);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in updateReturn controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update return'
            });
        }
    }
    
    // Update return status
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, note } = req.body;
            
            if (!status) {
                return res.status(400).json({
                    success: false,
                    error: 'Status is required'
                });
            }
            
            const userId = req.user ? req.user.id : null;
            const result = await returnService.updateStatus(id, status, note, userId);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in updateStatus controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update return status'
            });
        }
    }
    
    // Get return statistics
    async getStatistics(req, res) {
        try {
            const result = await returnService.getStatistics();
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getStatistics controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch statistics'
            });
        }
    }
    
    // Search returns
    async searchReturns(req, res) {
        try {
            const { q } = req.query;
            
            if (!q) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required'
                });
            }
            
            const result = await returnService.searchReturns(q);
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in searchReturns controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to search returns'
            });
        }
    }
    
    // Process refund
    async processRefund(req, res) {
        try {
            const { id } = req.params;
            
            const result = await returnService.processRefund(id);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in processRefund controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to process refund'
            });
        }
    }
    
    // Complete refund
    async completeRefund(req, res) {
        try {
            const { id } = req.params;
            const { transactionId, gatewayResponse } = req.body;
            
            const result = await returnService.completeRefund(id, transactionId, gatewayResponse);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in completeRefund controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to complete refund'
            });
        }
    }
    
    // Fail refund
    async failRefund(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            
            if (!reason) {
                return res.status(400).json({
                    success: false,
                    error: 'Failure reason is required'
                });
            }
            
            const result = await returnService.failRefund(id, reason);
            
            if (!result.success) {
                return res.status(404).json(result);
            }
            
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in failRefund controller:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fail refund'
            });
        }
    }
}

module.exports = new ReturnController();