import mongoose from "mongoose";

const Schema = mongoose.Schema;

const announcementSchema = new Schema({
    description: { type: String, required: true },
    image: { type: String },
    media: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who liked the announcement
    dislikes: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Array of user IDs who disliked the announcement
    created: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: 'User' }, // Relationship with User
    section: { type: String },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: false }, // Optional relationship with Batch
    batchName: { type: String, required: false }, // Optional batch name
    createdByRole: {
        type: String,
        enum: ['teacher', 'coordinator', 'student', 'student-affairs'],
        required: true
    }
}, {
    timestamps: true
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;