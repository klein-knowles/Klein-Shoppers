const db = require("../config/db");

const Delivery = {};

// ======================================
// Get All Deliveries
// ======================================

Delivery.getAll = (callback) => {

    db.query(

        `

        SELECT

            deliveries.*,

            orders.customer_name,

            orders.total_amount

        FROM deliveries

        INNER JOIN orders

            ON deliveries.order_id = orders.id

        ORDER BY deliveries.id DESC

        `,

        callback

    );

};

// ======================================
// Get One Delivery
// ======================================

Delivery.getById = (id, callback) => {

    db.query(

        "SELECT * FROM deliveries WHERE id=?",

        [id],

        callback

    );

};

// ======================================
// Get Delivery By Tracking Number
// ======================================

Delivery.getByTracking = (trackingNumber, callback) => {

    db.query(

        "SELECT * FROM deliveries WHERE tracking_number=?",

        [trackingNumber],

        callback

    );

};

// ======================================
// Create Delivery
// ======================================

Delivery.create = (data, callback) => {

    db.query(

        `

        INSERT INTO deliveries

        (

            order_id,

            tracking_number,

            courier_name,

            courier_phone,

            delivery_address,

            delivery_fee,

            estimated_date,

            status,

            notes

        )

        VALUES(?,?,?,?,?,?,?,?,?)

        `,

        [

            data.order_id,

            data.tracking_number,

            data.courier_name,

            data.courier_phone,

            data.delivery_address,

            data.delivery_fee,

            data.estimated_date,

            data.status,

            data.notes

        ],

        callback

    );

};

// ======================================
// Update Delivery
// ======================================

Delivery.update = (id, data, callback) => {

    db.query(

        `

        UPDATE deliveries

        SET

        courier_name=?,

        courier_phone=?,

        delivery_address=?,

        delivery_fee=?,

        estimated_date=?,

        delivered_date=?,

        status=?,

        notes=?

        WHERE id=?

        `,

        [

            data.courier_name,

            data.courier_phone,

            data.delivery_address,

            data.delivery_fee,

            data.estimated_date,

            data.delivered_date,

            data.status,

            data.notes,

            id

        ],

        callback

    );

};

// ======================================
// Delete Delivery
// ======================================

Delivery.delete = (id, callback) => {

    db.query(

        "DELETE FROM deliveries WHERE id=?",

        [id],

        callback

    );

};

// ======================================
// Delivery Statistics
// ======================================

Delivery.stats = (callback) => {

    db.query(

        `

        SELECT

        COUNT(*) AS total,

        SUM(status='Pending') AS pending,

        SUM(status='Picked Up') AS pickedUp,

        SUM(status='In Transit') AS inTransit,

        SUM(status='Out For Delivery') AS outForDelivery,

        SUM(status='Delivered') AS delivered,

        SUM(status='Returned') AS returned

        FROM deliveries

        `,

        callback

    );

};

module.exports = Delivery;
