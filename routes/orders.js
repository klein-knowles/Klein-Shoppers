const express = require("express");

const router = express.Router();

const orderController =
require("../controllers/orderController");

const adminAuth =
require("../middleware/adminAuth");



// ===========================================
// CUSTOMER CHECKOUT
// ===========================================

router.post(
    "/checkout",
    orderController.checkout
);



// ===========================================
// CUSTOMER ORDERS
// ===========================================

router.get(
    "/my-orders",
    orderController.myOrders
);





// ===========================================
// ADMIN ORDERS
// ===========================================


// Get all orders

router.get(

    "/admin/all",

    adminAuth,

    orderController.getAllOrders

);




// Get single order details

router.get(

    "/admin/:id",

    adminAuth,

    orderController.getOrderDetails

);




// Update order status

router.put(

    "/admin/:id/status",

    adminAuth,

    orderController.updateOrderStatus

);




// Update payment status

router.put(

    "/admin/:id/payment",

    adminAuth,

    orderController.updatePaymentStatus

);



module.exports = router;
