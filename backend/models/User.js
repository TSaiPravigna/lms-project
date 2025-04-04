const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "instructor", "admin"], default: "student" },
    specialization: { type: String }, // For instructors
    qualifications: { type: String }, // For instructors
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }], // For both instructors and students
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }] // For students
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
