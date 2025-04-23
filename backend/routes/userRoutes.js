const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// Check if user exists by email
router.get("/check-email/:email", protect, userController.checkUserExists);

module.exports = router; 