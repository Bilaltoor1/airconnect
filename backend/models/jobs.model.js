import mongoose from "mongoose";
import { Schema } from "mongoose";

const jobSchema = new Schema({
    jobTitle: { type: String, required: true },
    jobLink: { type: String, required: true },
    company: { type: String, required: true },
    jobDescription: { type: String, required: true },
    thumbnail: { type: String },
    department: { type: String },
    jobType: { type: String, enum: ['remote', 'on-site', 'hybrid'], default: 'on-site' },
    jobTime: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'], default: 'full-time' },
});

const Job = mongoose.model('Job', jobSchema);
export default Job;