const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    thumbnail: {
        type: String,
        default: ''
    },
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lessons: [{
        title: String,
        description: String,
        videoUrl: String,
        duration: String,
        order: Number
    }],
    assignments: [{
        title: String,
        description: String,
        dueDate: Date,
        totalMarks: Number
    }],
    status: {
        type: String,
        enum: ['Draft', 'Published'],
        default: 'Draft'
    }
}, { timestamps: true });

module.exports = mongoose.model("Course", CourseSchema); 