import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['student', 'advisor', 'coordinator'], required: true },
    createdAt: { type: Date, default: Date.now }
});

const applicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    studentID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    content: { type: String, required: true },
    rollNo: { type: String, required: true },
    applicationStatus: { type: String, enum: ['Pending', 'Forward to Coordinator', 'Approved by Coordinator', 'Rejected'], default: 'Pending' },
    signature: { type: String },
    advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    advisorComments: { type: String, default: '' },
    coordinatorComments: { type: String, default: '' },
    comments: [commentSchema],
    media: [{ type: String }], // Array of Cloudinary URLs for uploaded files
    hiddenFromStudent: { type: Boolean, default: false },
    hiddenFromAdvisor: { type: Boolean, default: false },
    hiddenFromCoordinator: { type: Boolean, default: false }
}, {
    timestamps: true // This adds createdAt and updatedAt fields automatically
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;