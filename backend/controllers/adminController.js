const User = require("../models/User");

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