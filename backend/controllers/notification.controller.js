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
            userQuery = { section: announcement.section, role: 'student' };
        } else {
            // All users announcement
            userQuery = { role: 'student' };
        }
        
        // If we have a query, find matching users
        if (Object.keys(userQuery).length > 0) {
            const users = await UserModel.find(userQuery).select('_id');
            recipients.push(...users.map(user => user._id));
        }
        
        // Create a notification for each recipient
        const notificationPromises = recipients.map(recipientId => {
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
        
        return !!notification;
    } catch (error) {
        console.error('Error creating application submission notification:', error);
        return false;
    }
};

// Create notification for advisor action (to student and coordinator)
export const createAdvisorActionNotification = async (application, advisor) => {
    try {
        const notifications = [];
        const status = application.advisorStatus;
        const statusText = status === 'approved' ? 'approved' : 'rejected';
        
        // Notify the student about the advisor's decision
        notifications.push(
            createNotification({
                recipient: application.student,
                sender: advisor._id,
                type: 'application_advisor_action',
                title: `Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)} by Advisor`,
                message: `Your application has been ${statusText} by advisor ${advisor.name}`,
                relatedId: application._id,
            })
        );
        
        // If approved, notify coordinator that action is needed
        if (status === 'approved' && application.coordinator) {
            notifications.push(
                createNotification({
                    recipient: application.coordinator,
                    sender: advisor._id,
                    type: 'application_advisor_action',
                    title: 'Application Needs Review',
                    message: `${advisor.name} has approved an application that needs your final review`,
                    relatedId: application._id,
                })
            );
        }
        
        await Promise.all(notifications);
        return true;
    } catch (error) {
        console.error('Error creating advisor action notification:', error);
        return false;
    }
};

// Create notification for coordinator action (to student and advisor)
export const createCoordinatorActionNotification = async (application, coordinator) => {
    try {
        const notifications = [];
        const status = application.status;
        const statusText = status === 'approved' ? 'approved' : 'rejected';
        
        // Notify the student about the final decision
        notifications.push(
            createNotification({
                recipient: application.student,
                sender: coordinator._id,
                type: 'application_coordinator_action',
                title: `Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
                message: `Your application has been ${statusText} by coordinator ${coordinator.name}`,
                relatedId: application._id,
            })
        );
        
        // Notify the advisor about the final decision
        if (application.advisor) {
            notifications.push(
                createNotification({
                    recipient: application.advisor,
                    sender: coordinator._id,
                    type: 'application_coordinator_action',
                    title: `Application ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}`,
                    message: `An application you reviewed has been ${statusText} by coordinator ${coordinator.name}`,
                    relatedId: application._id,
                })
            );
        }
        
        await Promise.all(notifications);
        return true;
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
