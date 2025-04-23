const User = require("../models/User");
const Course = require("../models/Course");
const bcrypt = require("bcryptjs");

// Get all instructors
exports.getAllInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ role: 'instructor' })
            .select('-password') // Exclude password from response
            .populate('courses', 'title description');
            
        res.json(instructors);
    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('-password')
            .populate('enrolledCourses', 'title description');
            
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get all admins
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' })
            .select('-password');
            
        res.json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Add a new instructor
exports.addInstructor = async (req, res) => {
    try {
        const { firstName, lastName, email, password, specialization, qualifications } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Create new instructor
        user = new User({
            firstName,
            lastName,
            email,
            password,
            role: 'instructor',
            specialization,
            qualifications
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.status(201).json({ 
            message: "Instructor added successfully",
            instructor: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                specialization: user.specialization,
                qualifications: user.qualifications
            }
        });
    } catch (error) {
        console.error('Error adding instructor:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Add a new student
exports.addStudent = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Create new student
        user = new User({
            firstName,
            lastName,
            email,
            password,
            role: 'student'
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.status(201).json({ 
            message: "Student added successfully",
            student: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Add a new admin
exports.addAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Create new admin
        user = new User({
            firstName,
            lastName,
            email,
            password,
            role: 'admin'
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        res.status(201).json({ 
            message: "Admin added successfully",
            admin: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error adding admin:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Delete a user (instructor, student, or admin)
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // If user is an instructor, delete their courses
        if (user.role === 'instructor') {
            await Course.deleteMany({ instructor: userId });
        }
        
        // Delete the user
        await User.findByIdAndDelete(userId);
        
        res.json({ message: `${user.role} deleted successfully` });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Get all courses (for admin)
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('instructor', 'firstName lastName email')
            .populate('enrolledStudents', 'firstName lastName email')
            .select('title description instructor category level status enrolledStudents lessons thumbnail');
            
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Delete a course (admin only)
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        // Find the course
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        
        // Delete the course
        await Course.findByIdAndDelete(courseId);
        
        // Remove course from instructor's courses array
        await User.findByIdAndUpdate(
            course.instructor,
            { $pull: { courses: courseId } }
        );
        
        // Remove course from enrolled students' enrolledCourses array
        await User.updateMany(
            { enrolledCourses: courseId },
            { $pull: { enrolledCourses: courseId } }
        );
        
        res.json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}; 