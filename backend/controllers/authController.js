const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

// Register a new user
exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        user = new User({
            firstName,
            lastName,
            email,
            password,
            role: role || 'student' // Use provided role or default to student
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "30d" },
            (err, token) => {
                if (err) throw err;
                res.json({ 
                    token,
                    user: {
                        id: user.id,
                        role: user.role,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

// Register a new instructor (admin only)
exports.registerInstructor = async (req, res) => {
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

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "30d" },
            (err, token) => {
                if (err) {
                    console.error('Error generating token:', err);
                    return res.status(500).json({ message: "Error generating token" });
                }
                res.status(201).json({ 
                    message: "Instructor registered successfully",
                    token,
                    userRole: user.role
                });
            }
        );
    } catch (err) {
        console.error('Error in registerInstructor:', err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (!user) {
            console.log('Login attempt failed: User not found for email:', email);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Login attempt failed: Invalid password for email:', email);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create JWT token
        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || "30d" },
            (err, token) => {
                if (err) {
                    console.error('Error generating token:', err);
                    return res.status(500).json({ message: "Error generating token" });
                }
                console.log('Login successful for user:', email, 'Role:', user.role);
                res.json({
                    token,
                    user: {
                        id: user._id,
                        role: user.role,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email
                    }
                });
            }
        );
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
