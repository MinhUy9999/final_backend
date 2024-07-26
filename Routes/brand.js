const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { isAdmin, verifyToken } = require("../middlewares/auth");

router.post("/brands", verifyToken, isAdmin, brandController.createBrand);
router.get("/brands", brandController.getAllBrands);

module.exports = router;
