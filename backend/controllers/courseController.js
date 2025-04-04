const Course = require("../models/Course");
const User = require("../models/User");

// Create a new course
exports.createCourse = async (req, res) => {
    try {
        const { title, description, level, videoUrl, thumbnail } = req.body;
        const instructor = req.user.id; // From auth middleware

        // Validate required fields
        if (!title || !description || !level || !videoUrl) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        // Create initial lesson with the video URL
        const initialLesson = {
            title: "Introduction",
            description: "Course introduction",
            videoUrl: videoUrl,
            duration: "0:00",
            order: 1
        };

        const course = new Course({
            title,
            description,
            instructor,
            level,
            thumbnail,
            lessons: [initialLesson],
            enrolledStudents: [],
            status: 'Published'
        });

        await course.save();
        res.status(201).json(course);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Update course thumbnail
exports.updateCourseThumbnail = async (req, res) => {
    try {
        const { courseId } = req.params;
        const instructorId = req.user.id;
        const { thumbnail } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor.toString() !== instructorId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        course.thumbnail = thumbnail;
        await course.save();

        res.json(course);
    } catch (error) {
        console.error('Error updating course thumbnail:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        console.log('Fetching all published courses...');
        const courses = await Course.find({ status: 'Published' })
            .populate('instructor', 'firstName lastName');
        console.log('Found courses:', courses);
        res.json(courses);
    } catch (error) {
        console.error('Error in getAllCourses:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get courses by instructor
exports.getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.user.id;
        console.log('Fetching courses for instructor:', instructorId); // Debug log
        
        const courses = await Course.find({ instructor: instructorId })
            .populate('instructor', 'firstName lastName');
            
        console.log('Found courses:', courses); // Debug log
        res.json(courses);
    } catch (error) {
        console.error('Error in getInstructorCourses:', error); // Debug log
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get enrolled courses for a student
exports.getEnrolledCourses = async (req, res) => {
    try {
        const studentId = req.user.id;
        console.log('Fetching enrolled courses for student:', studentId);
        
        const courses = await Course.find({ enrolledStudents: studentId })
            .populate('instructor', 'firstName lastName');
            
        console.log('Found enrolled courses:', courses);
        res.json(courses || []);
    } catch (error) {
        console.error('Error in getEnrolledCourses:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Enroll in a course
exports.enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.enrolledStudents.includes(studentId)) {
            return res.status(400).json({ message: "Already enrolled in this course" });
        }

        course.enrolledStudents.push(studentId);
        await course.save();

        res.json({ message: "Successfully enrolled in course" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Add lesson to course
exports.addLesson = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, videoUrl, duration, order } = req.body;
        const instructorId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor.toString() !== instructorId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        course.lessons.push({ title, description, videoUrl, duration, order });
        await course.save();

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Add assignment to course
exports.addAssignment = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, description, dueDate, totalMarks } = req.body;
        const instructorId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.instructor.toString() !== instructorId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        course.assignments.push({ title, description, dueDate, totalMarks });
        await course.save();

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Delete course
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log('Delete course request:', { courseId, userId, userRole });

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        console.log('Course found:', { 
            courseId: course._id.toString(), 
            instructorId: course.instructor.toString(),
            userId: userId.toString(),
            userRole 
        });

        // Allow admins to delete any course, or instructors to delete their own courses
        if (userRole !== 'admin' && course.instructor.toString() !== userId.toString()) {
            console.log('Authorization failed:', {
                userRole,
                isAdmin: userRole === 'admin',
                isInstructor: course.instructor.toString() === userId.toString()
            });
            return res.status(403).json({ message: "Not authorized to delete this course" });
        }

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        // Send success response
        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        console.log('Fetching course details for course:', courseId);
        
        const course = await Course.findById(courseId)
            .populate('instructor', 'firstName lastName');

        if (!course) {
            console.log('Course not found:', courseId);
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if user has access to the course
        const userRole = req.user.role;
        const isInstructor = course.instructor._id.toString() === userId;
        const isEnrolled = course.enrolledStudents.includes(userId);
        
        if (userRole === 'admin' || isInstructor || isEnrolled) {
            console.log('User has access to course:', courseId);
            res.json(course);
        } else {
            console.log('User does not have access to course:', courseId);
            res.status(403).json({ message: "You don't have access to this course" });
        }
    } catch (error) {
        console.error('Error in getCourseById:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}; 