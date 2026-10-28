const express=require("express");

const router=express.Router();

const report=require("../controllers/reportController");

const adminAuth=require("../middleware/adminAuth");

router.get(

"/daily",

adminAuth,

report.daily

);

router.get(

"/weekly",

adminAuth,

report.weekly

);

router.get(

"/monthly",

adminAuth,

report.monthly

);

router.get(

"/custom",

adminAuth,

report.custom

);

router.get(

"/orders",

adminAuth,

report.orders

);

module.exports=router;