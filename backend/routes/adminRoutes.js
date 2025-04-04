const express = require("express");
const router = express.Router();
const { getAllInstructors } = require("../controllers/adminController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

// Apply auth middleware to all routes
router.use(auth);

// Apply admin role check to all routes
router.use(checkRole(['admin']));

// Get all instructors
router.get("/instructors", getAllInstructors);

module.exports = router; 