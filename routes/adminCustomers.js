const express = require("express");

const router = express.Router();

const adminCustomerController =
require("../controllers/adminCustomerController");

const adminAuth =
require("../middleware/adminAuth");



// ===========================================
// ADMIN CUSTOMERS
// ===========================================


// GET ALL CUSTOMERS

router.get(

    "/",

    adminAuth,

    adminCustomerController.getAllCustomers

);




// GET SINGLE CUSTOMER

router.get(

    "/:id",

    adminAuth,

    adminCustomerController.getCustomer

);



module.exports = router;