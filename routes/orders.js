const express = require("express");

const router = express.Router();

const orderController =
require("../controllers/orderController");

const adminAuth =
require("../middleware/adminAuth");
const customerAuth = require("../middleware/customerAuth");



// ===========================================
// CUSTOMER CHECKOUT
// ===========================================

router.post(
    "/checkout",
    customerAuth,
    orderController.checkout
);



// ===========================================
// CUSTOMER ORDERS
// ===========================================

router.get(
    "/my-orders",
    customerAuth,
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
