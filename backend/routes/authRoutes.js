const express = require("express");
const { registerUser, loginUser, registerInstructor } = require("../controllers/authController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/register/instructor", auth, checkRole(['admin']), registerInstructor);

module.exports = router;
