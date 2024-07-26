const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/users/:id", verifyToken, isAdmin, userController.getUserById);
router.get("/users", verifyToken, isAdmin, userController.getAllUsers);
router.put("/users/:id", verifyToken, isAdmin, userController.updateUser);
router.delete("/users/:id", verifyToken, isAdmin, userController.deleteUser);
router.put("/cart", verifyToken, userController.updateCart);
// router.get("/users/search", verifyToken, isAdmin, userController.searchUsers);
module.exports = router;
