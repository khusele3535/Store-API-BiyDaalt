const express = require("express");
const router = express.Router();

const controller = require("../controllers/products.controller");
const reviewsController = require("../controllers/reviews.controller");

router.get("/:id/reviews", reviewsController.getProductReviews);
router.get("/", controller.getProducts);
router.get("/:id", controller.getProductById);
router.post("/", controller.createProduct);
router.patch("/:id", controller.updateProduct);
router.delete("/:id", controller.deleteProduct);

module.exports = router;