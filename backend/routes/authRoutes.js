const express = require("express");
const { registerUser, loginUser, registerInstructor } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/register/instructor", protect, authorize('admin'), registerInstructor);

module.exports = router;
