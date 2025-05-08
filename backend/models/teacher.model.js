import User from './user.model.js';
import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    section: {
        type: String,
    },
    designation: {
        type: String,
        enum: ["Associate Professor", "Assistant Professor", "Lecturer", "Demonstrator"]
        // Removed required: true to make it optional during signup
    }
});

const Teacher = User.discriminator('teacher', teacherSchema);

export default Teacher;