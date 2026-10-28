const express=require("express");

const router=express.Router();

const controller=require("../controllers/reviewController");

// View all reviews

router.get("/",controller.getAllReviews);

// Delete review

router.delete("/:id",controller.deleteReview);

module.exports=router;