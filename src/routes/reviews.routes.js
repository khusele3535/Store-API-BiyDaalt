const express = require("express");
const router = express.Router();

const controller = require("../controllers/reviews.controller");

router.get("/", controller.getReviews);
router.get("/:id", controller.getReviewById);
router.post("/", controller.createReview);
router.patch("/:id", controller.updateReview);
router.delete("/:id", controller.deleteReview);

module.exports = router;