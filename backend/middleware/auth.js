const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    console.log('Auth Headers:', req.headers);

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            console.log('Token:', token);

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);

            // Get user from the token
            const userId = decoded.user?.id || decoded.id;
            if (!userId) {
                throw new Error('Invalid token structure');
            }

            req.user = await User.findById(userId).select('-password');
            if (!req.user) {
                throw new Error('User not found');
            }

            console.log('User from token:', req.user);
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.log('No token found');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
}; 