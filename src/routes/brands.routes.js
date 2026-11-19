const express = require("express");
const router = express.Router();

const controller = require("../controllers/brands.controller");

router.get("/", controller.getBrands);
router.get("/:id/products", controller.getBrandProducts);
router.get("/:id", controller.getBrandById);
router.post("/", controller.createBrand);
router.patch("/:id", controller.updateBrand);
router.delete("/:id", controller.deleteBrand);

module.exports = router;