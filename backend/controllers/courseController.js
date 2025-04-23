const Course = require("../models/Course");
const User = require("../models/User");
const path = require('path');

// Create a new course
exports.createCourse = async (req, res) => {
    try {
        const { title, description, level, category, status, startDate, videoUrl, price, instructor: instructorId } = req.body;
        const creatorId = req.user.id; // From auth middleware
        const creatorRole = req.user.role;

        console.log('Creating course with data:', {
            title,
            description,
            level,
            category,
            status,
            startDate,
            videoUrl,
            price,
            instructorId,
            hasVideoFile: !!req.files?.video,
            hasThumbnailFile: !!req.files?.thumbnail
        });

        // Validate required fields
        const missingFields = [];
        if (!title) missingFields.push('title');
        if (!description) missingFields.push('description');
        if (!level) missingFields.push('level');
        if (!category) missingFields.push('category');
        
        // If admin is creating course, instructor ID is required
        if (creatorRole === 'admin' && !instructorId) {
            missingFields.push('instructor');
        }
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Please provide all required fields: ${missingFields.join(', ')}` 
            });
        }

        // Handle file uploads if they exist
        let thumbnailUrl = '';
        let videoUrlToUse = videoUrl;

        // If a video file was uploaded, process it
        if (req.files && req.files.video) {
            const videoFile = req.files.video;
            const videoPath = `/uploads/videos/${Date.now()}-${videoFile.name}`;
            
            // Save the file
            videoFile.mv(path.join(__dirname, '..', videoPath), (err) => {
                if (err) {
                    console.error('Error saving video file:', err);
                    return res.status(500).json({ message: "Error saving video file" });
                }
            });
            
            videoUrlToUse = videoPath;
        }

        // If a thumbnail was uploaded, process it
        if (req.files && req.files.thumbnail) {
            const thumbnailFile = req.files.thumbnail;
            const thumbnailPath = `/uploads/thumbnails/${Date.now()}-${thumbnailFile.name}`;
            
            // Save the file
            thumbnailFile.mv(path.join(__dirname, '..', thumbnailPath), (err) => {
                if (err) {
                    console.error('Error saving thumbnail file:', err);
                    return res.status(500).json({ message: "Error saving thumbnail file" });
                }
            });
            
            thumbnailUrl = thumbnailPath;
        }

        // Create initial lesson with the video URL if provided
        let lessons = [];
        if (videoUrlToUse) {
            lessons.push({
                title: "Introduction",
                description: "Course introduction",
                videoUrl: videoUrlToUse,
                duration: "0:00",
                order: 1
            });
        } else {
            // Create a placeholder lesson if no video is provided
            lessons.push({
                title: "Introduction",
                description: "Course introduction",
                videoUrl: "",
                duration: "0:00",
                order: 1
            });
        }

        const course = new Course({
            title,
            description,
            instructor: creatorRole === 'admin' ? instructorId : creatorId,
            level,
            category,
            thumbnail: thumbnailUrl,
            lessons: lessons,
            enrolledStudents: [],
            status: status || 'Draft',
            startDate: startDate || null,
            price: price || 0
        });

        await course.save();
        console.log('Course created successfully:', course);
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
            .populate('instructor', 'firstName lastName')
            .select('title description instructor category level thumbnail enrolledStudents');
            
        console.log('Found courses:', courses);
        
        if (!courses) {
            return res.status(404).json({ message: 'No courses found' });
        }
        
        res.json(courses);
    } catch (error) {
        console.error('Error in getAllCourses:', error);
        res.status(500).json({ message: "Failed to fetch courses", error: error.message });
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

// Remove student from course
exports.removeStudentFromCourse = async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const instructorId = req.user.id;

        console.log('Remove student request:', { courseId, studentId, instructorId });

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Verify the instructor owns this course
        if (course.instructor.toString() !== instructorId) {
            return res.status(403).json({ message: "Not authorized to remove students from this course" });
        }

        // Check if student is enrolled in the course
        if (!course.enrolledStudents.includes(studentId)) {
            return res.status(400).json({ message: "Student is not enrolled in this course" });
        }

        // Remove student from course
        course.enrolledStudents = course.enrolledStudents.filter(
            id => id.toString() !== studentId
        );
        await course.save();

        // Remove course from student's enrolled courses
        await User.findByIdAndUpdate(
            studentId,
            { $pull: { enrolledCourses: courseId } }
        );

        res.json({ message: "Student removed from course successfully" });
    } catch (error) {
        console.error('Error removing student from course:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}; 