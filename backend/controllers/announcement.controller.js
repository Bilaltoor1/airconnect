import Announcement from '../models/announcement.model.js';
import Batch from '../models/batch.model.js';
import cloudinary from '../helpers/cloudinary.js';
import Comment from '../models/comment.model.js';
import UserModel from "../models/user.model.js";
import { createAnnouncementNotification } from './notification.controller.js';
import { uploadMultipleToCloudinaryWithRetry } from '../helpers/cloudinaryUpload.js';
import fs from 'fs';

export const getAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 8, search = '', sort = 'latest', section = 'all', role = 'all', batch = '' } = req.query;
        const query = search ? { description: { $regex: search, $options: 'i' } } : {};
        console.log('Request query params:', req.query);
        console.log('User role:', req.user.role);
        console.log('Initial query:', JSON.stringify(query));
        
        // Add filter for announcements created after user registration
        const user = await UserModel.findById(req.user._id);
        if (user && user.createdAt) {
            query.created = { $gte: user.createdAt };
        }
        
        if (req.user.role === 'coordinator') {
            // Coordinator can only see announcements they created
            query.user = req.user._id;
        }
        else if (req.user.role === 'teacher') {
            // Teacher can see:
            // 1. Announcements from coordinators with section='all'
            // 2. Announcements for batches they teach
            // 3. Their own announcements
            const teacherBatches = await Batch.find({ teachers: req.user._id }).select('name _id');
            const batchNames = teacherBatches.map(batch => batch.name);
            const batchIds = teacherBatches.map(batch => batch._id);

            query.$or = [
                // Coordinator announcements with section='all'
                {
                    $and: [
                        { section: 'all' },
                        { user: { $ne: req.user._id } }, // Not created by this teacher
                        { createdByRole: 'coordinator' }
                    ]
                },
                // Announcements for batches they teach
                {
                    $and: [
                        { batchName: { $in: batchNames } },
                        { user: { $ne: req.user._id } } // Not created by this teacher
                    ]
                },
                // Their own announcements
                { user: req.user._id }
            ];

            if (batch && batch !== '') {
                console.log('Filtering by batch:', batch);
                console.log('Teacher batches:', batchNames);
            
                // More flexible comparison - case insensitive check
                const batchMatchFound = batchNames.some(bName =>
                    bName.toLowerCase() === batch.toLowerCase()
                );
            
                if (batchMatchFound) {
                    // Replace the entire $or array with strict batch conditions
                    query.$or = [
                        // Announcements for the specific batch (not created by this teacher)
                        {
                            $and: [
                                { batchName: batch },
                                { user: { $ne: req.user._id } }
                            ]
                        },
                        // Only include teacher's own announcements for this specific batch
                        {
                            $and: [
                                { batchName: batch },
                                { user: req.user._id }
                            ]
                        }
                    ];
            
                    console.log('Modified query for batch filter:', JSON.stringify(query));
                } else {
                    // Teacher trying to filter by a batch they don't teach
                    query._id = null; // Return no results
                }
            }
        }
        else if (req.user.role === 'student') {
            const user = await UserModel.findById(req.user._id);
            const studentBatch = await Batch.findOne({ students: req.user._id });
            const batchName = studentBatch ? studentBatch.name : null;
            const batchId = studentBatch ? studentBatch._id : null;
            
            // Get the IDs of teachers who teach this student's batch
            const teachersOfStudentBatch = studentBatch ? studentBatch.teachers : [];

            query.$or = [
                // 1. Coordinator announcements with section='all'
                {
                    $and: [
                        { section: 'all' },
                        { createdByRole: 'coordinator' }
                    ]
                },
                // 2. Announcements matching student's section with no batch specified
                // BUT only if either:
                // a) not teacher-restricted, OR 
                // b) created by a teacher who teaches this student
                {
                    $and: [
                        { section: user.section },
                        {
                            $or: [
                                { batch: null },
                                { batch: { $exists: false } },
                                { batchName: { $exists: false } }
                            ]
                        },
                        {
                            $or: [
                                // Not a teacher-restricted announcement
                                { restrictToTeacherBatches: { $ne: true } },
                                // OR a teacher-restricted announcement from a teacher of this student
                                { 
                                    $and: [
                                        { restrictToTeacherBatches: true },
                                        { user: { $in: teachersOfStudentBatch } },
                                        { createdByRole: 'teacher' }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                // 3. Announcements specific to student's batch (fixed logic)
                {
                    $and: [
                        {
                            $or: [
                                { batchName: batchName },
                                { batch: batchId }
                            ]
                        }
                    ]
                }
            ];

            // If there's a teacher-restricted announcement
            if (query.$or) {
                // Filter the OR conditions
                query.$or = query.$or.filter(condition => {
                    // If this is a section-specific condition with potential teacher restriction
                    if (condition.$and && 
                        condition.$and.some(c => c.section === req.user.section) &&
                        !condition.$and.some(c => c.batch || c.batchName)) {
                        condition.$and.push({
                            $or: [
                                { restrictToTeacherBatches: { $ne: true } },
                                { 
                                    $and: [
                                        { restrictToTeacherBatches: true },
                                        { user: { $in: studentBatch ? studentBatch.teachers : [] } }
                                    ]
                                }
                            ]
                        });
                    }
                    return true;
                });
            }

            // If filtering by specific batch
            if (batch) {
                if (batch === batchName) {
                    // Filter to only show batch-specific announcements
                    query.$or = query.$or.filter(condition =>
                        condition.$and && condition.$and.some(c =>
                            (c.$or && c.$or.some(o => o.batchName === batchName)) ||
                            (c.batchName === batchName)
                        )
                    );
                } else {
                    // Student trying to filter by a batch they don't belong to
                    query._id = null; // Return no results
                }
            }
        }
        else if (req.user.role === 'student-affairs') {
            // Student affairs can only see announcements from coordinators with section "all"
            query.$and = [
                { section: 'all' }
            ];

            const coordinators = await UserModel.find({ role: 'coordinator' }).select('_id');
            query.$and.push({ user: { $in: coordinators.map(c => c._id) } });
        }

        // Apply section filter if specified
        if (section !== 'all' && !query._id) {
            // Override existing section filters with the selected one
            // This needs special handling per role
            if (req.user.role === 'student') {
                if (section !== req.user.section) {
                    // Students can only see their own section
                    query._id = null;
                } else {
                    // Keep existing logic for student's section
                }
            } else if (req.user.role === 'teacher') {
                // For teachers, adjust the existing query to focus on this section
                if (query.$or) {
                    // Add section condition to each OR condition
                    query.$or = query.$or.map(condition => {
                        if (condition.$and) {
                            // Add section condition to AND array
                            condition.$and.push({ section: section });
                        } else {
                            // Convert simple condition to AND with section
                            return { $and: [condition, { section: section }] };
                        }
                        return condition;
                    });
                } else {
                    // Simple case - just add section directly
                    query.section = section;
                }
            } else {
                query.section = section;
            }
        }

        // Apply role filter
        if (role !== 'all' && !query._id) {
            const usersWithRole = await UserModel.find({ role: role }).select('_id');

            // Add user role condition based on existing query structure
            if (query.$or) {
                // For each OR condition, add user role filter
                query.$or = query.$or.map(condition => {
                    if (condition.$and) {
                        condition.$and.push({ user: { $in: usersWithRole.map(u => u._id) } });
                    } else {
                        return { $and: [condition, { user: { $in: usersWithRole.map(u => u._id) } }] };
                    }
                    return condition;
                });
            } else if (query.$and) {
                query.$and.push({ user: { $in: usersWithRole.map(u => u._id) } });
            } else {
                query.user = { $in: usersWithRole.map(u => u._id) };
            }
        }

        // Apply batch filter if specified and not already applied
        if (batch && batch !== '' && !query.batchName && !query._id && !query.$or) {
            query.batchName = batch;
        }

        const sortOrder = sort === 'latest' ? { created: -1 } : { created: 1 };

        const announcements = await Announcement.find(query)
            .populate('user', '_id name email role profileImage')
            .sort(sortOrder)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Save user role to announcements for frontend filtering
        const enhancedAnnouncements = announcements.map(announcement => {
            const announcementObj = announcement.toObject();
            if (announcement.user) {
                announcementObj.createdByRole = announcement.user.role;
            }
            return announcementObj;
        });

        const total = await Announcement.countDocuments(query);
        console.log('Final query:', JSON.stringify(query));
        console.log('Found announcements:', announcements.length);
        res.status(200).json({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            announcements: enhancedAnnouncements
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

        const { description, section, batchId, restrictToTeacherBatches } = req.body;
        let batchName;

        if (batchId) {
            const batch = await Batch.findById(batchId);
            if (!batch) {
                return res.status(404).json({ message: 'Batch not found' });
            }

            // If user is a teacher, verify they belong to this batch
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
            resource_type: 'auto' // This allows Cloudinary to automatically detect the file type
        }));

        const uploadResults = await Promise.all(uploadPromises);
        const mediaUrls = uploadResults.map(upload => upload.secure_url);

        const announcementData = {
            description,
            section,
            user: req.user._id,
            createdByRole: req.user.role,
            media: mediaUrls // Store the URLs in the media array
        };

        // Add batch if specified
        if (batchId && batchName) {
            announcementData.batch = batchId;
            announcementData.batchName = batchName;
        }

        // Add the teacher restriction flag
        if (req.user.role === 'teacher' && restrictToTeacherBatches === 'true' && !batchId) {
            // Get the batches this teacher teaches
            const teacherBatches = await Batch.find({ teachers: req.user._id }).select('_id');
            
            // For debugging
            console.log(`Teacher ${req.user._id} teaches ${teacherBatches.length} batches`);
            
            announcementData.restrictToTeacherBatches = true;
            // Store the list of batch IDs this teacher is teaching (for faster filtering)
            announcementData.teacherBatches = teacherBatches.map(batch => batch._id);
        }

        const newAnnouncement = new Announcement(announcementData);

        await newAnnouncement.save();

        // Create notifications for relevant users
        await createAnnouncementNotification(newAnnouncement, req.user);

        res.status(201).json(newAnnouncement);
    } catch (error) {
        console.error('Error creating announcement:', error);
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

// Dislike an announcement
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

        // Check if the user owns the announcement
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

// Update an announcement by ID
export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, section, existingMedia, batchId } = req.body;
        
        console.log('Update announcement request:', { id, description, section, batchId });
        console.log('Files in request:', req.files?.length || 'No files');
        
        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        // Check if the user owns the announcement
        if (announcement.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this announcement' });
        }

        // Update text fields
        announcement.description = description;
        announcement.section = section;
        
        // Handle batch update if provided
        let batchName = announcement.batchName;
        if (batchId) {
            const batch = await Batch.findById(batchId);
            if (!batch) {
                return res.status(404).json({ message: 'Batch not found' });
            }

            // If user is a teacher, verify they belong to this batch
            if (req.user.role === 'teacher') {
                const isTeacherInBatch = batch.teachers.some(
                    teacher => teacher.toString() === req.user._id.toString()
                );

                if (!isTeacherInBatch) {
                    return res.status(403).json({
                        message: 'You do not have permission to update announcements for this batch'
                    });
                }
            }

            // Update batch info
            announcement.batch = batchId;
            announcement.batchName = batch.name;
            batchName = batch.name;
        } else if (batchId === '') {
            // If batch ID is empty string, remove batch association
            announcement.batch = null;
            announcement.batchName = null;
            batchName = null;
        }

        // Handle media files
        let mediaUrls = [];
        
        // Process existing media if provided
        if (existingMedia) {
            try {
                const parsedExistingMedia = JSON.parse(existingMedia);
                if (Array.isArray(parsedExistingMedia)) {
                    mediaUrls = [...parsedExistingMedia];
                }
            } catch (err) {
                console.error('Error parsing existing media:', err);
                // Continue without existing media rather than failing the whole request
            }
        }
        
        // Upload new files if any
        if (req.files && req.files.length > 0) {
            try {
                console.log('Uploading files to Cloudinary...');
                const filePaths = req.files.map(file => file.path);
                
                // Use the retry-capable upload function
                const uploadResults = await uploadMultipleToCloudinaryWithRetry(filePaths);
                const newMediaUrls = uploadResults.map(upload => upload.secure_url);
                
                // Combine with existing media
                mediaUrls = [...mediaUrls, ...newMediaUrls];
                
                // Clean up temp files after successful upload
                req.files.forEach(file => {
                    try {
                        fs.unlinkSync(file.path);
                    } catch (err) {
                        console.error('Error deleting temp file:', err);
                    }
                });
            } catch (uploadError) {
                console.error('Failed to upload files to Cloudinary:', uploadError);
                return res.status(500).json({ 
                    message: 'Failed to upload files. Please try again later.',
                    error: uploadError.message
                });
            }
        }
        
        // Update the media array
        announcement.media = mediaUrls;

        await announcement.save();
        
        res.status(200).json({
            message: 'Announcement updated successfully',
            announcement
        });
    } catch (error) {
        console.error('Error updating announcement:', error);
        res.status(500).json({ 
            message: 'Something went wrong, please try again later',
            error: error.message
        });
    }
};

// Add a comment to an announcement
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

// Get comments for an announcement
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
