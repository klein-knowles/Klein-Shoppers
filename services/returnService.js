const Return = require('../models/Return');
const Refund = require('../models/Refund');
const { generateReturnNumber, generateRefundNumber } = require('../utils/helpers');

class ReturnService {
    // Get all returns with filters
    async getReturns({ status, search, dateFrom, dateTo, page, limit }) {
        try {
            const result = await Return.findAll({
                status,
                search,
                dateFrom,
                dateTo,
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
            console.error('Error in getReturns service:', error);
            throw error;
        }
    }
    
    // Get return by ID with timeline
    async getReturnById(id) {
        try {
            const returnData = await Return.findById(id);
            if (!returnData) {
                return { success: false, error: 'Return request not found' };
            }
            
            // Get timeline
            const timeline = await Return.getTimeline(id);
            
            // Get refund if exists
            const refund = await Refund.findByReturnId(id);
            
            return {
                success: true,
                data: {
                    ...returnData,
                    timeline,
                    refund
                }
            };
        } catch (error) {
            console.error('Error in getReturnById service:', error);
            throw error;
        }
    }
    
    // Create new return request
    async createReturn(data) {
        try {
            // Validate required fields
            const required = ['order_id', 'customer_name', 'product_name', 'quantity', 'return_reason', 'refund_amount'];
            for (const field of required) {
                if (!data[field]) {
                    throw new Error(`${field} is required`);
                }
            }
            
            // Generate return number
            data.return_number = await generateReturnNumber();
            
            const returnData = await Return.create(data);
            
            return {
                success: true,
                data: returnData,
                message: 'Return request submitted successfully'
            };
        } catch (error) {
            console.error('Error in createReturn service:', error);
            throw error;
        }
    }
    
    // Update return
    async updateReturn(id, data) {
        try {
            const returnData = await Return.update(id, data);
            if (!returnData) {
                return { success: false, error: 'Return request not found' };
            }
            
            return {
                success: true,
                data: returnData,
                message: 'Return updated successfully'
            };
        } catch (error) {
            console.error('Error in updateReturn service:', error);
            throw error;
        }
    }
    
    // Update return status
    async updateStatus(id, status, note = null, userId = null) {
        try {
            const validStatuses = ['pending', 'approved', 'rejected', 'processing', 'shipped', 'received', 'refunded', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid status');
            }
            
            const returnData = await Return.updateStatus(id, status, note, userId);
            if (!returnData) {
                return { success: false, error: 'Return request not found' };
            }
            
            // If status is 'approved', create refund record
            if (status === 'approved') {
                await this.createRefundForReturn(returnData);
            }
            
            // If status is 'refunded', update refund status
            if (status === 'refunded') {
                const refund = await Refund.findByReturnId(id);
                if (refund) {
                    await Refund.completeRefund(refund.id);
                }
            }
            
            return {
                success: true,
                data: returnData,
                message: `Return status updated to ${status}`
            };
        } catch (error) {
            console.error('Error in updateStatus service:', error);
            throw error;
        }
    }
    
    // Create refund for return
    async createRefundForReturn(returnData) {
        try {
            // Check if refund already exists
            const existing = await Refund.findByReturnId(returnData.id);
            if (existing) {
                return { success: true, data: existing };
            }
            
            const refundData = {
                refund_number: await generateRefundNumber(),
                return_id: returnData.id,
                order_id: returnData.order_id,
                customer_id: returnData.customer_id,
                customer_name: returnData.customer_name,
                refund_amount: returnData.refund_amount,
                refund_method: returnData.refund_method || 'original_payment',
                notes: 'Auto-generated from return approval'
            };
            
            const refund = await Refund.create(refundData);
            
            return {
                success: true,
                data: refund,
                message: 'Refund created successfully'
            };
        } catch (error) {
            console.error('Error in createRefundForReturn service:', error);
            throw error;
        }
    }
    
    // Get return statistics
    async getStatistics() {
        try {
            const stats = await Return.getStatistics();
            const refundStats = await Refund.getStatistics();
            
            return {
                success: true,
                data: {
                    returns: stats,
                    refunds: refundStats
                }
            };
        } catch (error) {
            console.error('Error in getStatistics service:', error);
            throw error;
        }
    }
    
    // Search returns
    async searchReturns(query) {
        try {
            if (!query || query.length < 2) {
                return { success: false, error: 'Search query must be at least 2 characters' };
            }
            
            const results = await Return.search(query);
            
            return {
                success: true,
                data: results,
                count: results.length
            };
        } catch (error) {
            console.error('Error in searchReturns service:', error);
            throw error;
        }
    }
    
    // Process refund
    async processRefund(refundId) {
        try {
            const refund = await Refund.processRefund(refundId);
            if (!refund) {
                return { success: false, error: 'Refund not found' };
            }
            
            return {
                success: true,
                data: refund,
                message: 'Refund processing started'
            };
        } catch (error) {
            console.error('Error in processRefund service:', error);
            throw error;
        }
    }
    
    // Complete refund
    async completeRefund(refundId, transactionId = null, gatewayResponse = null) {
        try {
            const refund = await Refund.completeRefund(refundId, transactionId, gatewayResponse);
            if (!refund) {
                return { success: false, error: 'Refund not found' };
            }
            
            // Update return status to refunded
            await Return.updateStatus(refund.return_id, 'refunded', 'Refund completed');
            
            return {
                success: true,
                data: refund,
                message: 'Refund completed successfully'
            };
        } catch (error) {
            console.error('Error in completeRefund service:', error);
            throw error;
        }
    }
    
    // Fail refund
    async failRefund(refundId, reason) {
        try {
            const refund = await Refund.failRefund(refundId, reason);
            if (!refund) {
                return { success: false, error: 'Refund not found' };
            }
            
            return {
                success: true,
                data: refund,
                message: 'Refund marked as failed'
            };
        } catch (error) {
            console.error('Error in failRefund service:', error);
            throw error;
        }
    }
}

module.exports = new ReturnService();