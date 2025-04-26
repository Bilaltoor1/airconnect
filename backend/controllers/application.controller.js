import Application from '../models/application.model.js';
import UserModel from '../models/user.model.js';
import Batch from '../models/batch.model.js';
import {
    createApplicationSubmittedNotification,
    createAdvisorActionNotification,
    createCoordinatorActionNotification
} from './notification.controller.js';
import cloudinary from '../helpers/cloudinary.js';
import { uploadToCloudinaryWithRetry } from '../helpers/cloudinaryUpload.js';
import fs from 'fs';

export const fetchHistoryofApplication = async (req, res) => {
    const { studentID, advisor, coordinator } = req.query;
    const query = {};

    // For students, show all their applications that aren't hidden
    if (studentID) {
        query.studentID = studentID;
        query.hiddenFromStudent = { $ne: true };
    }

    // For advisors, only show applications they've processed that aren't hidden
    if (advisor) {
        query.advisor = advisor;
        query.hiddenFromAdvisor = { $ne: true };
        // Only include applications that have moved beyond "Pending" status
        query.applicationStatus = { $ne: 'Pending' };
    }

    // For coordinators, only show applications they've processed that aren't hidden
    if (coordinator) {
        query.coordinator = coordinator;
        query.hiddenFromCoordinator = { $ne: true };
        // Only include applications explicitly processed by coordinator
        query.$or = [
            { applicationStatus: 'Approved by Coordinator' },
            { applicationStatus: 'Rejected', coordinatorComments: { $ne: '' } } // Only include rejections with coordinator comments
        ];
    }

    console.log(query);
    try {
        const applications = await Application.find(query)
            .populate('advisor', 'name email')
            .populate('coordinator', 'name email')
            .populate('studentID', 'name email');

        return res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const fetchApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const application = await Application.findById(id)
            .populate('advisor', 'name email')
            .populate('coordinator', 'name email')
            .populate('studentID', 'name email');

        if (!application) return res.status(404).json({ message: 'Application not found' });

        return res.status(200).json(application);
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const fetchApplications = async (req, res) => {
    try {
        const { status, advisor, coordinator } = req.query;
        const query = {};

        if (status) query.applicationStatus = status;
        if (advisor) query.advisor = advisor;
        if (coordinator) query.coordinator = coordinator;

        const userId = req.user._id;
        const userRole = req.user.role;

        if (userRole === 'coordinator') {
            // Coordinator can see applications with either status (for compatibility)
            query.applicationStatus = { $in: ['Forward to Coordinator', 'Transit'] };
            const applications = await Application.find(query)
                .populate('advisor', 'name email')
                .populate('coordinator', 'name email') 
                .populate('studentID', 'name email');

            return res.status(200).json(applications);
        } else {
            // Find batches where the teacher is an advisor
            const batches = await Batch.find({ advisor: userId });

            // Get student IDs from these batches
            const studentIds = batches.flatMap(batch => batch.students);

            // Find applications where the student belongs to the same batch as the advisor
            const applications = await Application.find({
                ...query, studentID: { $in: studentIds }, applicationStatus: 'Pending' // Only include pending applications
            })
                .populate('advisor', 'name email')
                .populate('coordinator', 'name email')
                .populate('studentID', 'name email');

            return res.status(200).json(applications);
        }
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// When a student submits an application
export const createApplication = async (req, res) => {
    try {
        const { name, email, studentID, rollNo, reason, content } = req.body;
        
        // Upload files to Cloudinary if any
        let mediaUrls = [];
        if (req.files && req.files.length > 0) {
            try {
                console.log(`Uploading ${req.files.length} application files to Cloudinary...`);
                // Log file information for debugging
                req.files.forEach(file => {
                    console.log(`File: ${file.originalname}, MIME: ${file.mimetype}, Size: ${file.size} bytes`);
                });
                
                const uploadPromises = req.files.map(file => 
                    uploadToCloudinaryWithRetry(file.path, {
                        folder: 'applications',
                        resource_type: 'auto' // Auto-detect file type
                    }).catch(err => {
                        console.error(`Error uploading ${file.originalname}:`, err);
                        return null; // Return null for failed uploads
                    })
                );
                
                const uploadResults = await Promise.all(uploadPromises);
                // Filter out null results from failed uploads
                mediaUrls = uploadResults.filter(result => result !== null).map(result => result.secure_url);
                
                console.log(`Successfully uploaded ${mediaUrls.length} of ${req.files.length} files`);
                
                // Clean up temp files
                req.files.forEach(file => {
                    try {
                        fs.unlinkSync(file.path);
                    } catch (err) {
                        console.error('Error removing temp file:', err);
                    }
                });
            } catch (uploadError) {
                console.error('Error uploading files:', uploadError);
                return res.status(500).json({ message: 'Failed to upload files. Please try again.' });
            }
        }
        
        const batch = await Batch.findOne({ students: studentID }).populate('advisor').populate('coordinator');
        if (!batch) return res.status(404).json({ message: 'Batch not found' });
        
        const application = new Application({
            name,
            email,
            studentID,
            reason,
            content,
            advisor: batch.advisor._id,
            rollNo,
            coordinator: batch.coordinator._id,
            media: mediaUrls // Store media URLs in the application
        });

        await application.save();

        // Send notification to the advisor
        await createApplicationSubmittedNotification(application, req.user);

        res.status(201).json({ message: 'Application created successfully', application });
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// When an advisor takes action on an application
export const updateApplicationByAdvisor = async (req, res) => {
    try {
        const { id } = req.params;
        const { signature, applicationStatus, advisorComments } = req.body;

        const application = await Application.findById(id);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        if (application.advisor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this application' });
        }

        if (signature) application.signature = signature;
        // Map "Transit" to "Forward to Coordinator" if present in request
        if (applicationStatus === 'Transit') {
            application.applicationStatus = 'Forward to Coordinator';
        } else if (applicationStatus) {
            application.applicationStatus = applicationStatus;
        }
        if (advisorComments !== undefined) application.advisorComments = advisorComments;

        application.advisorActionDate = Date.now();

        await application.save();

        // Send notifications to student and possibly coordinator
        await createAdvisorActionNotification(application, req.user);

        res.status(200).json({ message: 'Application updated successfully', application });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// When a coordinator takes action on an application
export const updateApplicationByCoordinator = async (req, res) => {
    try {
        const { id } = req.params;
        const { applicationStatus, coordinatorComments } = req.body;

        const application = await Application.findById(id);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'You are not authorized to update this application' });
        }

        // Map "Forwarded" to "Approved by Coordinator" if present in request
        if (applicationStatus === 'Forwarded') {
            application.applicationStatus = 'Approved by Coordinator';
        } else if (applicationStatus) {
            application.applicationStatus = applicationStatus;
        }
        if (coordinatorComments !== undefined) application.coordinatorComments = coordinatorComments;

        application.coordinatorActionDate = Date.now();
        application.coordinator = req.user._id;

        await application.save();

        // Send notifications to student and advisor
        await createCoordinatorActionNotification(application, req.user);

        res.status(200).json({ message: 'Application updated successfully', application });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const updateApplicationByStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, reason } = req.body;

        // Verify that the requesting user is the application owner
        const application = await Application.findById(id);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        if (application.studentID.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this application' });
        }

        // Only allow updates if application is in Pending state or has comments
        if (application.applicationStatus !== 'Pending' && !application.advisorComments) {
            return res.status(400).json({ message: 'Cannot update application in current state' });
        }

        if (content) application.content = content;
        if (reason) application.reason = reason;
        
        // Handle file uploads if any
        if (req.files && req.files.length > 0) {
            try {
                console.log(`Uploading ${req.files.length} additional files to Cloudinary...`);
                const uploadPromises = req.files.map(file => 
                    uploadToCloudinaryWithRetry(file.path, {
                        folder: 'applications',
                        resource_type: 'auto'
                    })
                );
                
                const uploadResults = await Promise.all(uploadPromises);
                const newMediaUrls = uploadResults.map(result => result.secure_url);
                
                // Add new media to existing media
                application.media = [...(application.media || []), ...newMediaUrls];
                
                // Clean up temp files
                req.files.forEach(file => {
                    try {
                        fs.unlinkSync(file.path);
                    } catch (err) {
                        console.error('Error removing temp file:', err);
                    }
                });
            } catch (uploadError) {
                console.error('Error uploading files:', uploadError);
                return res.status(500).json({ message: 'Failed to upload files. Please try again.' });
            }
        }

        // Reset comments and status if the application was previously commented on
        if (application.advisorComments) {
            application.advisorComments = '';
            application.applicationStatus = 'Pending';
        }

        await application.save();
        res.status(200).json({ message: 'Application updated successfully', application });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        const application = await Application.findById(id);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Determine user's role in relation to this application
        let role = 'student';
        if (req.user._id.toString() === application.advisor.toString()) {
            role = 'advisor';
        } else if (req.user._id.toString() === application.coordinator.toString()) {
            role = 'coordinator';
        } else if (req.user._id.toString() !== application.studentID.toString()) {
            return res.status(403).json({ message: 'You are not authorized to comment on this application' });
        }

        const comment = {
            text,
            author: req.user._id,
            role,
            createdAt: new Date()
        };

        application.comments.push(comment);
        await application.save();

        // Return the populated comment for immediate display
        const updatedApplication = await Application.findById(id)
            .populate({
                path: 'comments.author',
                select: 'name email'
            });

        if (!updatedApplication) {
            return res.status(404).json({ message: 'Application not found after update' });
        }

        const addedComment = updatedApplication.comments[updatedApplication.comments.length - 1];

        res.status(201).json({
            message: 'Comment added successfully',
            comment: addedComment
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const getApplicationComments = async (req, res) => {
    try {
        const { id } = req.params;

        const application = await Application.findById(id)
            .populate({
                path: 'comments.author',
                select: 'name email'
            });

        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Check if user is authorized to view this application
        const userId = req.user._id.toString();
        if (userId !== application.studentID.toString() &&
            userId !== application.advisor.toString() &&
            userId !== application.coordinator.toString() &&
            req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'You are not authorized to view comments for this application' });
        }

        res.status(200).json(application.comments || []);

    } catch (error) {
        res.status(500).json({ message: 'Something went wrong, please try again later' });
        console.error('Error fetching comments:', error);
    }
};
// Clear application history for a student
export const clearStudentApplicationHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        // For students, we don't actually delete the applications but mark them as hidden
        const result = await Application.updateMany(
            { studentID: userId },
            { $set: { hiddenFromStudent: true } }
        );

        res.status(200).json({
            message: 'Application history cleared',
            count: result.modifiedCount
        });
    } catch (error) {
        console.error('Error clearing student application history:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Clear application history for an advisor
export const clearAdvisorApplicationHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        // For advisors, mark applications as hidden from advisor's view
        const result = await Application.updateMany(
            {
                advisor: userId,
                // Only hide applications that have been processed (not in Pending status)
                applicationStatus: { $ne: 'Pending' }
            },
            { $set: { hiddenFromAdvisor: true } }
        );

        res.status(200).json({
            message: 'Application history cleared',
            count: result.modifiedCount
        });
    } catch (error) {
        console.error('Error clearing advisor application history:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Clear application history for a coordinator
export const clearCoordinatorApplicationHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        // For coordinators, mark applications as hidden from coordinator's view
        const result = await Application.updateMany(
            {
                coordinator: userId,
                // Only hide applications that have been processed (Approved or Rejected status)
                applicationStatus: { $in: ['Approved by Coordinator', 'Rejected'] }
            },
            { $set: { hiddenFromCoordinator: true } }
        );

        res.status(200).json({
            message: 'Application history cleared',
            count: result.modifiedCount
        });
    } catch (error) {
        console.error('Error clearing coordinator application history:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Hide a single application for a student
export const hideStudentApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Make sure the application belongs to this student
        const application = await Application.findOne({
            _id: id,
            studentID: userId
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found or does not belong to you' });
        }

        // Mark as hidden for the student
        application.hiddenFromStudent = true;
        await application.save();

        res.status(200).json({
            message: 'Application removed from your history'
        });
    } catch (error) {
        console.error('Error hiding student application:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Hide a single application for an advisor
export const hideAdvisorApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Make sure the application is processed by this advisor
        const application = await Application.findOne({
            _id: id,
            advisor: userId,
            applicationStatus: { $ne: 'Pending' }
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found, does not belong to you, or is still pending' });
        }

        // Mark as hidden for the advisor
        application.hiddenFromAdvisor = true;
        await application.save();

        res.status(200).json({
            message: 'Application removed from your history'
        });
    } catch (error) {
        console.error('Error hiding advisor application:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Hide a single application for a coordinator
export const hideCoordinatorApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Make sure the application is processed by this coordinator
        const application = await Application.findOne({
            _id: id,
            coordinator: userId,
            applicationStatus: { $in: ['Approved by Coordinator', 'Rejected'] }
        });

        if (!application) {
            return res.status(404).json({ message: 'Application not found, does not belong to you, or is not processed yet' });
        }

        // Mark as hidden for the coordinator
        application.hiddenFromCoordinator = true;
        await application.save();

        res.status(200).json({
            message: 'Application removed from your history'
        });
    } catch (error) {
        console.error('Error hiding coordinator application:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};