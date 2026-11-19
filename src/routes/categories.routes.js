const express = require("express");
const router = express.Router();

const controller = require("../controllers/categories.controller");

router.get("/", controller.getCategories);
router.get("/:id/products", controller.getCategoryProducts);
router.get("/:id", controller.getCategoryById);
router.post("/", controller.createCategory);
router.patch("/:id", controller.updateCategory);
router.delete("/:id", controller.deleteCategory);

module.exports = router;