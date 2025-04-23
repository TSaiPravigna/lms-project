const User = require("../models/User");

// Check if a user exists by email
exports.checkUserExists = async (req, res) => {
    try {
        const { email } = req.params;
        
        // Find user by email
        const user = await User.findOne({ email });
        
        // Return whether user exists
        res.json({ exists: !!user });
    } catch (error) {
        console.error('Error checking user existence:', error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}; 