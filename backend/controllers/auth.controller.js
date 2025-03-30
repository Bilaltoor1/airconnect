import Announcement from '../models/announcement.model.js';
import Batch from '../models/batch.model.js';
import cloudinary from '../helpers/cloudinary.js';
import Comment from '../models/comment.model.js';
import UserModel from "../models/user.model.js";

export const getAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 8, search = '', sort = 'latest', section = 'all', role = 'all', batch = '' } = req.query;
        const query = search ? { description: { $regex: search, $options: 'i' } } : {};

        if (req.user.role === 'student') {
            const user = await UserModel.findById(req.user._id);
            const batch = await Batch.findOne({ students: req.user._id });
            const batchName = batch ? batch.name : null;
            
            query.$and = [
                { $or: [{ section: 'all' }, { section: user.section }] }
            ];
            
            if (req.query.batch) {
                if (req.query.batch === batchName) {
                    query.$and.push({ batchName: req.query.batch });
                } else {
                    query._id = null;
                }
            } else if (batchName) {
                query.$and.push({ 
                    $or: [
                        { batchName: batchName },
                        { 
                            $and: [
                                { user: { $in: batch.teachers } },
                                { $or: [{ batch: null }, { batch: { $exists: false } }] }
                            ] 
                        }
                    ]
                });
            }
        } 
        else if (req.user.role === 'teacher') {
            const teacherBatches = await Batch.find({ teachers: req.user._id }).select('name');
            const batchNames = teacherBatches.map(batch => batch.name);
            
            query.$or = [
                { section: 'all' },
                { user: req.user._id },
                { batchName: { $in: batchNames } }
            ];
            
            if (req.query.batch && batchNames.includes(req.query.batch)) {
                query.batchName = req.query.batch;
            } else if (req.query.batch) {
                query._id = null;
            }
        } 
        else if (req.user.role === 'coordinator') {
            if (req.query.batch) {
                query.batchName = req.query.batch;
            }
        }
        else if (req.user.role === 'student-affairs') {
            query.$and = [
                { section: 'all' }
            ];
            
            const coordinators = await UserModel.find({ role: 'coordinator' }).select('_id');
            query.$and.push({ user: { $in: coordinators.map(c => c._id) } });
        }

        if (section !== 'all' && !query._id) {
            if (req.user.role === 'student' && section !== user.section) {
                query._id = null;
            } else {
                query.section = section;
            }
        }

        if (role !== 'all' && !query._id) {
            const usersWithRole = await UserModel.find({ role: role }).select('_id');
            query.user = { $in: usersWithRole.map(u => u._id) };
        }

        if (batch && batch !== '' && !query.batchName && !query._id) {
            query.batchName = batch;
        }

        const sortOrder = sort === 'latest' ? { created: -1 } : { created: 1 };

        const announcements = await Announcement.find(query)
            .populate('user', '_id name email role')
            .sort(sortOrder)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Announcement.countDocuments(query);

        res.status(200).json({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            announcements
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findById(id).populate('user', 'name email role');

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        res.status(200).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const createAnnouncement = async (req, res) => {
    try {
        if (req.user.role !== 'teacher' && req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }

        const { description, section, batchId } = req.body;
        let batchName;

        if (batchId) {
            const batch = await Batch.findById(batchId);
            if (!batch) {
                return res.status(404).json({ message: 'Batch not found' });
            }

            if (req.user.role === 'teacher') {
                const isTeacherInBatch = batch.teachers.some(
                    teacher => teacher.toString() === req.user._id.toString()
                );
                
                if (!isTeacherInBatch) {
                    return res.status(403).json({ 
                        message: 'You do not have permission to create announcements for this batch' 
                    });
                }
            }
            
            batchName = batch.name;
        }
        
        const uploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path, {
            resource_type: 'auto'
        }));

        const uploadResults = await Promise.all(uploadPromises);
        const mediaUrls = uploadResults.map(upload => upload.secure_url);

        const newAnnouncement = new Announcement({
            description,
            section,
            batch: batchId,
            batchName,
            user: req.user._id,
            createdByRole: req.user.role,
            media: mediaUrls
        });

        await newAnnouncement.save();
        res.status(201).json(newAnnouncement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const likeAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        if (announcement.likes.includes(userId)) {
            announcement.likes = announcement.likes.filter(user => user.toString() !== userId.toString());
        } else {
            announcement.likes.push(userId);
            announcement.dislikes = announcement.dislikes.filter(user => user.toString() !== userId.toString());
        }

        await announcement.save();

        res.status(200).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const dislikeAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        if (announcement.dislikes.includes(userId)) {
            announcement.dislikes = announcement.dislikes.filter(user => user.toString() !== userId.toString());
        } else {
            announcement.dislikes.push(userId);
            announcement.likes = announcement.likes.filter(user => user.toString() !== userId.toString());
        }

        await announcement.save();

        res.status(200).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        if (announcement.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to delete this announcement' });
        }

        await Announcement.findByIdAndDelete(id);

        res.status(200).json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const updateAnnouncement = async (req, res) => {
    const { id } = req.params;
    const { description, image, section } = req.body;
    console.log('request body update',req.body);
    try {

        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        if (announcement.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this announcement' });
        }

        announcement.description = description;
        announcement.image = image;
        announcement.section = section;

        await announcement.save();

        res.status(200).json(announcement);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later next time' });
    }
};

export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const { announcementId } = req.params;

        const newComment = new Comment({
            text,
            user: req.user._id,
            announcement: announcementId
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const getComments = async (req, res) => {
    try {
        const { announcementId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const comments = await Comment.find({ announcement: announcementId })
            .populate('user', 'name')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ created: -1 });

        const total = await Comment.countDocuments({ announcement: announcementId });

        res.status(200).json({ total, comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const token = jwt.sign(
            { user: { _id: user._id, role: user.role } },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        
        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileSetup: user.profileSetup,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const createUserProfile = async (req, res) => {
    try {
        const { name, email, password, role, section, batch } = req.body;
        
        // Check if user exists
        const existingUser = await UserModel.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Update user profile
        existingUser.name = name;
        existingUser.section = section;
        
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            existingUser.profileImage = result.secure_url;
        }
        
        await existingUser.save();
        
        // If user is a student and a batch is selected, add them to the batch
        if (role === 'student' && batch) {
            const selectedBatch = await Batch.findById(batch);
            
            if (!selectedBatch) {
                return res.status(404).json({ message: 'Selected batch not found' });
            }
            
            // Check if student is already in this batch
            if (!selectedBatch.students.includes(existingUser._id)) {
                // Check if student is in another batch
                const existingBatch = await Batch.findOne({ students: existingUser._id });
                if (existingBatch) {
                    // Remove from old batch
                    existingBatch.students.pull(existingUser._id);
                    await existingBatch.save();
                }
                
                // Add to new batch
                selectedBatch.students.push(existingUser._id);
                await selectedBatch.save();
            }
        }
        
        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                role: existingUser.role,
                section: existingUser.section,
                profileImage: existingUser.profileImage
            }
        });
    } catch (error) {
        console.error('Profile creation error:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};