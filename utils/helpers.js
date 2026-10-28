const db = require('../config/database');

// Generate unique courier code
async function generateCourierCode(type) {
    const prefixMap = {
        'dhl': 'DHL',
        'fedex': 'FED',
        'ups': 'UPS',
        'rider': 'RID',
        'company_driver': 'COM'
    };
    
    const prefix = prefixMap[type] || 'COU';
    const year = new Date().getFullYear().toString().slice(-2);
    
    // Get last sequence number
    const [rows] = await db.query(
        "SELECT code FROM couriers WHERE code LIKE ? ORDER BY id DESC LIMIT 1",
        [`${prefix}${year}%`]
    );
    
    let sequence = 1;
    if (rows.length > 0) {
        const lastCode = rows[0].code;
        const lastSeq = parseInt(lastCode.slice(-4));
        if (!isNaN(lastSeq)) {
            sequence = lastSeq + 1;
        }
    }
    
    return `${prefix}${year}${String(sequence).padStart(4, '0')}`;
}

// Format courier data for response
function formatCourierData(courier) {
    return {
        id: courier.id,
        name: courier.name,
        type: courier.type,
        code: courier.code,
        email: courier.email,
        phone: courier.phone,
        address: courier.address,
        contactPerson: courier.contact_person,
        baseCharge: parseFloat(courier.base_charge),
        perKmCharge: parseFloat(courier.per_km_charge),
        deliveryTimeEstimate: courier.delivery_time_estimate,
        serviceArea: courier.service_area,
        status: courier.status,
        rating: parseFloat(courier.rating),
        totalDeliveries: courier.total_deliveries,
        successfulDeliveries: courier.successful_deliveries,
        failedDeliveries: courier.failed_deliveries,
        metadata: courier.metadata,
        createdAt: courier.created_at,
        updatedAt: courier.updated_at
    };
}

// Format tracking data for response
function formatTrackingData(tracking) {
    return {
        id: tracking.id,
        courierId: tracking.courier_id,
        courierName: tracking.courier_name,
        courierType: tracking.courier_type,
        orderId: tracking.order_id,
        trackingNumber: tracking.tracking_number,
        status: tracking.status,
        pickupLocation: tracking.pickup_location,
        deliveryLocation: tracking.delivery_location,
        pickupTime: tracking.pickup_time,
        estimatedDelivery: tracking.estimated_delivery,
        actualDelivery: tracking.actual_delivery,
        driverName: tracking.driver_name,
        driverPhone: tracking.driver_phone,
        notes: tracking.notes,
        locationHistory: tracking.location_history || [],
        customerSignature: tracking.customer_signature,
        metadata: tracking.metadata,
        createdAt: tracking.created_at,
        updatedAt: tracking.updated_at
    };
}

module.exports = {
    generateCourierCode,
    formatCourierData,
    formatTrackingData
};