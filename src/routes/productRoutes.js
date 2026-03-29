const express = require("express");
const productController = require("../controllers/productController");

const router = express.Router();

router.get("/hero-images", productController.getHeroImages);
router.get("/", productController.listProducts);
router.post("/", productController.createProduct);
router.get("/:id", productController.getProductDetails);

module.exports = router;
