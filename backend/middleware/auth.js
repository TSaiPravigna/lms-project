const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findById(decoded.user.id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // Add user and role to request
        req.user = {
            id: user._id,
            role: user.role
        };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: "Token is not valid" });
    }
};

module.exports = auth; 