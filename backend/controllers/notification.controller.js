import Notification from '../models/notification.model.js';
import UserModel from '../models/user.model.js';
import Batch from '../models/batch.model.js';
import { sendNotification } from '../services/socket.service.js';

// Create a notification
export const createNotification = async (notificationData) => {
    try {
        const notification = new Notification(notificationData);
        await notification.save();
        
        // Send real-time notification to the recipient
        try {
            await sendNotification(notification.recipient.toString(), notification);
            console.log(`Notification sent to user ${notification.recipient}`);
        } catch (socketError) {
            console.error('Error sending notification via socket:', socketError);
            // Still continue even if socket error occurs
        }
        
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Create announcement notification for relevant users
export const createAnnouncementNotification = async (announcement, creator) => {
    try {
        const recipients = [];
        let userQuery = {};
        
        // Determine recipients based on announcement properties
        if (announcement.batchName) {
            // Batch-specific announcement
            const batch = await Batch.findById(announcement.batch);
            if (batch) {
                recipients.push(...batch.students);
            }
        } else if (announcement.section && announcement.section !== 'all') {
            // Section-specific announcement
            if (announcement.restrictToTeacherBatches && creator.role === 'teacher') {
                // For teacher-restricted announcements, only notify students in batches taught by this teacher
                console.log('Creating notifications for teacher-restricted announcement');
                
                // Find all batches this teacher teaches
                const teacherBatches = await Batch.find({ 
                    teachers: creator._id,
                    section: announcement.section
                });
                
                // Collect all students from these batches
                for (const batch of teacherBatches) {
                    recipients.push(...batch.students);
                }
                
                // No need for a query in this case as we've directly collected recipients
                userQuery = {};
            } else {
                // Regular section-specific announcement
                userQuery = { section: announcement.section, role: 'student' };
            }
        } else {
            // All users announcement
            userQuery = { role: 'student' };
        }
        
        // If we have a query, find matching users
        if (Object.keys(userQuery).length > 0) {
            const users = await UserModel.find(userQuery).select('_id');
            recipients.push(...users.map(user => user._id));
        }
        
        // Make sure we have unique recipients (a student might be in multiple batches)
        const uniqueRecipients = [...new Set(recipients.map(id => id.toString()))];
        
        // Create a notification for each recipient
        const notificationPromises = uniqueRecipients.map(recipientId => {
            return createNotification({
                recipient: recipientId,
                sender: creator._id,
                type: 'announcement',
                title: 'New Announcement',
                message: `${creator.name} posted a new announcement`,
                relatedId: announcement._id,
            });
        });
        
        await Promise.all(notificationPromises);
        return true;
    } catch (error) {
        console.error('Error creating announcement notifications:', error);
        return false;
    }
};

// Create job notification for all students
export const createJobNotification = async (job, creator) => {
    try {
        // Find all students
        const students = await UserModel.find({ role: 'student' }).select('_id');
        
        // Create a notification for each student
        const notificationPromises = students.map(student => {
            return createNotification({
                recipient: student._id,
                sender: creator._id,
                type: 'job',
                title: 'New Job Opportunity',
                message: `${job.jobTitle} at ${job.company}`,
                relatedId: job._id,
            });
        });
        
        await Promise.all(notificationPromises);
        return true;
    } catch (error) {
        console.error('Error creating job notifications:', error);
        return false;
    }
};

// Create notification for application submission (student to advisor)
export const createApplicationSubmittedNotification = async (application, student) => {
    try {
        console.log('APPLICATION SUBMISSION NOTIFICATION:', {
            applicationId: application._id,
            studentId: student?._id,
            advisorId: application.advisor,
            hasAdvisor: !!application.advisor
        });
        
        if (!application.advisor) {
            console.log("No advisor found for application");
            return false;
        }
        
        // Notify the advisor about the new application
        const notification = await createNotification({
            recipient: application.advisor,
            sender: student._id,
            type: 'application_submitted',
            title: 'New Application Submitted',
            message: `${student.name} has submitted a new application for your review`,
            relatedId: application._id,
        });
        
        console.log('Application submission notification created:', !!notification);
        return !!notification;
    } catch (error) {
        console.error('Error creating application submission notification:', error);
        return false;
    }
};

// Create notification for advisor action (to student and coordinator)
export const createAdvisorActionNotification = async (application, advisor) => {
    try {
        console.log('ADVISOR ACTION NOTIFICATION:', {
            applicationId: application?._id,
            advisorId: advisor?._id,
            studentId: application?.student || application?.studentID,
            coordinatorId: application?.coordinator,
            applicationStatus: application?.applicationStatus,
            advisorComments: application?.advisorComments ? 'Present' : 'None'
        });
        
        const notifications = [];
        
        // Get the status from application
        const status = application.applicationStatus || 'unknown';
        
        console.log('Determined advisor action status:', status);
        
        // Standardize status to lowercase for consistent comparison
        const statusLower = typeof status === 'string' ? status.toLowerCase() : 'unknown';
        
        // Determine the appropriate status text based on actual status
        let statusText;
        let titleText;
        
        if (status === 'Forward to Coordinator') {
            statusText = 'forwarded to coordinator for review';
            titleText = 'Forwarded to Coordinator';
        } else if (status === 'Rejected') {
            statusText = 'rejected';
            titleText = 'Rejected';
        } else if (status === 'Pending' && application.advisorComments) {
            // When status is Pending but there are advisor comments, it's a change request
            statusText = 'returned with requested changes';
            titleText = 'Changes Requested';
        } else if (status === 'Pending') {
            statusText = 'pending review';
            titleText = 'Pending';
        } else {
            statusText = statusLower;
            titleText = status.charAt(0).toUpperCase() + statusLower.slice(1);
        }
        
        console.log('Advisor notification text determined:', { statusText, titleText });
        
        // Make sure we have a valid student ID
        const studentId = application.student || application.studentID;
        if (!studentId) {
            console.error('No student ID found in application');
            return false;
        }
        
        // Notify the student about the advisor's decision
        notifications.push(
            createNotification({
                recipient: studentId,
                sender: advisor._id,
                type: 'application_advisor_action',
                title: `Application ${titleText} by Advisor`,
                message: `Your application has been ${statusText} by advisor ${advisor.name}`,
                relatedId: application._id,
            })
        );
        
        // For Forward to Coordinator status specifically, notify the coordinator
        if (status === 'Forward to Coordinator' && application.coordinator) {
            console.log('Sending notification to coordinator for forwarded application');
            notifications.push(
                createNotification({
                    recipient: application.coordinator,
                    sender: advisor._id,
                    type: 'application_advisor_action',
                    title: 'Application Needs Review',
                    message: `${advisor.name} has forwarded an application that needs your final review`,
                    relatedId: application._id,
                })
            );
        }
        
        const results = await Promise.all(notifications);
        console.log('Advisor notification results:', results.map(r => !!r));
        return results.every(Boolean);
    } catch (error) {
        console.error('Error creating advisor action notification:', error);
        return false;
    }
};

// Create notification for coordinator action (to student and advisor)
export const createCoordinatorActionNotification = async (application, coordinator) => {
    try {
        console.log('COORDINATOR ACTION NOTIFICATION:', {
            applicationId: application?._id,
            coordinatorId: coordinator?._id,
            studentId: application?.student || application?.studentID,
            advisorId: application?.advisor || application?.advisorID,
            applicationStatus: application?.applicationStatus,
            status: application?.status,
            applicationFields: Object.keys(application || {})
        });
        
        const notifications = [];
        
        // Get the status from application, with fallbacks for different field names
        let status;
        if (application.applicationStatus) {
            status = application.applicationStatus;
        } else if (application.status) {
            status = application.status;
        } else {
            status = 'unknown';
        }
        
        console.log('Determined coordinator action status:', status);
        
        // Standardize status to lowercase for consistent comparison
        const statusLower = typeof status === 'string' ? status.toLowerCase() : 'unknown';
        
        // Determine the appropriate status text based on actual status
        let statusText;
        let titleText;
        
        if (statusLower.includes('approve') || statusLower === 'forwarded') {
            statusText = 'approved';
            titleText = 'Approved';
        } else if (statusLower.includes('reject')) {
            statusText = 'rejected';
            titleText = 'Rejected';
        } else if (statusLower.includes('change') || statusLower.includes('request')) {
            statusText = 'returned with requested changes';
            titleText = 'Changes Requested';
        } else {
            statusText = statusLower;
            titleText = status.charAt(0).toUpperCase() + statusLower.slice(1);
        }
        
        console.log('Coordinator notification text determined:', { statusText, titleText });
        
        // Make sure we have a valid student ID
        const studentId = application.student || application.studentID;
        if (!studentId) {
            console.error('No student ID found in application');
            return false;
        }
        
        // Notify the student about the final decision
        notifications.push(
            createNotification({
                recipient: studentId,
                sender: coordinator._id,
                type: 'application_coordinator_action',
                title: `Application ${titleText}`,
                message: `Your application has been ${statusText} by coordinator ${coordinator.name}`,
                relatedId: application._id,
            })
        );
        
        // Notify the advisor about the final decision
        const advisorId = application.advisor || application.advisorID;
        if (advisorId) {
            notifications.push(
                createNotification({
                    recipient: advisorId,
                    sender: coordinator._id,
                    type: 'application_coordinator_action',
                    title: `Application ${titleText}`,
                    message: `An application you reviewed has been ${statusText} by coordinator ${coordinator.name}`,
                    relatedId: application._id,
                })
            );
        }
        
        const results = await Promise.all(notifications);
        console.log('Coordinator notification results:', results.map(r => !!r));
        return results.every(Boolean);
    } catch (error) {
        console.error('Error creating coordinator action notification:', error);
        return false;
    }
};

// Get notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user._id;
        
        const notifications = await Notification.find({ recipient: userId })
            .sort({ created: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('sender', 'name profileImage');
            
        const total = await Notification.countDocuments({ recipient: userId });
        const unread = await Notification.countDocuments({ recipient: userId, read: false });
        
        res.status(200).json({
            notifications,
            total,
            unread,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        const notification = await Notification.findOne({ 
            _id: id, 
            recipient: userId 
        });
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        notification.read = true;
        await notification.save();
        
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        
        await Notification.updateMany(
            { recipient: userId, read: false },
            { $set: { read: true } }
        );
        
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        const notification = await Notification.findOne({ 
            _id: id, 
            recipient: userId 
        });
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        await Notification.deleteOne({ _id: id });
        
        res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

// Clear all notifications for a user
export const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const result = await Notification.deleteMany({ recipient: userId });
        
        res.status(200).json({ 
            message: 'All notifications cleared',
            count: result.deletedCount
        });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
