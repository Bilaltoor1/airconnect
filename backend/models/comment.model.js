import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    announcement: { type: Schema.Types.ObjectId, ref: 'Announcement', required: true },
    created: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;