import User from './user.model.js';
import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    section: {
        type: String,
    },
});

const Teacher = User.discriminator('teacher', teacherSchema);

export default Teacher;