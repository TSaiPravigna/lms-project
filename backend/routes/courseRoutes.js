const express = require("express");
const { 
    createCourse, 
    getAllCourses, 
    getInstructorCourses, 
    getEnrolledCourses, 
    enrollInCourse,
    addLesson,
    addAssignment,
    updateCourseThumbnail,
    deleteCourse,
    getCourseById,
    removeStudentFromCourse
} = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/auth");
const Course = require("../models/Course");

const router = express.Router();

// Public routes
router.get("/", getAllCourses);

// Protected routes
router.post("/", protect, authorize('instructor', 'admin'), createCourse);
router.get("/instructor", protect, authorize('instructor'), getInstructorCourses);
router.get("/enrolled", protect, authorize('student'), getEnrolledCourses);
router.get("/:courseId", protect, getCourseById);
router.post("/:courseId/enroll", protect, authorize('student'), enrollInCourse);
router.post("/:courseId/lessons", protect, authorize('instructor'), addLesson);
router.post("/:courseId/assignments", protect, authorize('instructor'), addAssignment);
router.put("/:courseId/thumbnail", protect, authorize('instructor'), updateCourseThumbnail);
router.delete("/:courseId", protect, authorize('instructor', 'admin'), deleteCourse);

// Route to remove a student from a course (instructor only)
router.delete("/:courseId/students/:studentId", protect, authorize('instructor'), removeStudentFromCourse);

module.exports = router; 