import mongoose from 'mongoose';

const announcementFilterSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

const AnnouncementFilter = mongoose.model('AnnouncementFilter', announcementFilterSchema);

export default AnnouncementFilter;