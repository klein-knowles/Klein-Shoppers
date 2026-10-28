const db = require("../config/db");

const Report = {};

// ==========================================
// Daily Report
// ==========================================

Report.daily = function(callback){

    db.query(

        `

        SELECT

            COUNT(*) AS orders,

            IFNULL(SUM(total_amount),0) AS revenue,

            IFNULL(AVG(total_amount),0) AS average

        FROM orders

        WHERE DATE(created_at)=CURDATE()

        `,

        callback

    );

};

// ==========================================
// Weekly Report
// ==========================================

Report.weekly=function(callback){

    db.query(

        `

        SELECT

            COUNT(*) AS orders,

            IFNULL(SUM(total_amount),0) AS revenue,

            IFNULL(AVG(total_amount),0) AS average

        FROM orders

        WHERE YEARWEEK(created_at,1)=YEARWEEK(CURDATE(),1)

        `,

        callback

    );

};

// ==========================================
// Monthly Report
// ==========================================

Report.monthly=function(callback){

    db.query(

        `

        SELECT

            COUNT(*) AS orders,

            IFNULL(SUM(total_amount),0) AS revenue,

            IFNULL(AVG(total_amount),0) AS average

        FROM orders

        WHERE MONTH(created_at)=MONTH(CURDATE())

        AND YEAR(created_at)=YEAR(CURDATE())

        `,

        callback

    );

};

// ==========================================
// Custom Report
// ==========================================

Report.custom=function(start,end,callback){

    db.query(

        `

        SELECT

            COUNT(*) AS orders,

            IFNULL(SUM(total_amount),0) AS revenue,

            IFNULL(AVG(total_amount),0) AS average

        FROM orders

        WHERE DATE(created_at)

        BETWEEN ? AND ?

        `,

        [

            start,

            end

        ],

        callback

    );

};

// ==========================================
// Orders
// ==========================================

Report.orders=function(start,end,callback){

    db.query(

        `

        SELECT

            id,

            customer_name,

            total_amount,

            payment_status,

            created_at

        FROM orders

        WHERE DATE(created_at)

        BETWEEN ? AND ?

        ORDER BY created_at DESC

        `,

        [

            start,

            end

        ],

        callback

    );

};

module.exports=Report;