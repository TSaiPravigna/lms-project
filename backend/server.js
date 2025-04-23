const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fileUpload = require('express-fileupload');
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// File upload middleware
app.use(fileUpload({
    createParentPath: true,
    limits: { 
        fileSize: 500 * 1024 * 1024 // 500MB max file size
    },
    abortOnLimit: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Increase payload limit for large files
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://lmsuser:lmspassword@cluster0.mongodb.net/lms?retryWrites=true&w=majority";

mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    })
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        console.error("Please make sure MongoDB is running or you have a valid connection string.");
    });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
