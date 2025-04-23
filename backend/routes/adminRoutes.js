const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get("/instructors", adminController.getAllInstructors);
router.get("/students", adminController.getAllStudents);
router.get("/admins", adminController.getAllAdmins);

router.post("/instructors", adminController.addInstructor);
router.post("/students", adminController.addStudent);
router.post("/admins", adminController.addAdmin);

router.delete("/users/:userId", adminController.deleteUser);

// Course management routes
router.get("/courses", adminController.getAllCourses);
router.delete("/courses/:courseId", adminController.deleteCourse);

module.exports = router; 