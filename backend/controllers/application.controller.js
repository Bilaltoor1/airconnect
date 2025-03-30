import Application from '../models/application.model.js';
import Batch from '../models/batch.model.js';

export const fetchHistoryofApplication = async (req, res) => {
    const {studentID, advisor, coordinator} = req.query;
    const query = {};

    // For students, show all their applications
    if (studentID) query.studentID = studentID;
    
    // For advisors, only show applications they've processed
    if (advisor) {
        query.advisor = advisor;
        // Only include applications that have moved beyond "Pending" status
        query.applicationStatus = { $ne: 'Pending' };
    }
    
    // For coordinators, only show applications they've processed
    if (coordinator) {
        query.coordinator = coordinator;
        // Only include applications that have been Forwarded or Rejected
        query.applicationStatus = { $in: ['Forwarded', 'Rejected'] };
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
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};

export const fetchApplicationById = async (req, res) => {
    try {
        const {id} = req.params;
        const application = await Application.findById(id)
            .populate('advisor', 'name email')
            .populate('coordinator', 'name email')
            .populate('studentID', 'name email');

        if (!application) return res.status(404).json({message: 'Application not found'});

        return res.status(200).json(application);
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};

export const fetchApplications = async (req, res) => {
    try {
        const {status, advisor, coordinator} = req.query;
        const query = {};

        if (status) query.applicationStatus = status;
        if (advisor) query.advisor = advisor;
        if (coordinator) query.coordinator = coordinator;

        const userId = req.user._id;
        const userRole = req.user.role;

        if (userRole === 'coordinator') {
            // Coordinator can see only Transit applications
            query.applicationStatus = 'Transit';
            const applications = await Application.find(query)
                .populate('advisor', 'name email')
                .populate('coordinator', 'name email')
                .populate('studentID', 'name email');

            return res.status(200).json(applications);
        } else {
            // Find batches where the teacher is an advisor
            const batches = await Batch.find({advisor: userId});

            // Get student IDs from these batches
            const studentIds = batches.flatMap(batch => batch.students);

            // Find applications where the student belongs to the same batch as the advisor
            const applications = await Application.find({
                ...query, studentID: {$in: studentIds}, applicationStatus: {$ne: 'Forwarded'} // Exclude forwarded applications
            })
                .populate('advisor', 'name email')
                .populate('coordinator', 'name email')
                .populate('studentID', 'name email');

            return res.status(200).json(applications);
        }
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};

export const createApplication = async (req, res) => {
    try {
        const {name, email, studentID, rollNo, reason, content} = req.body;
        const batch = await Batch.findOne({students: studentID}).populate('advisor').populate('coordinator');
        if (!batch) return res.status(404).json({message: 'Batch not found'});
        console.log(batch)
        const application = new Application({
            name,
            email,
            studentID,
            reason,
            content,
            advisor: batch.advisor._id,
            rollNo,
            coordinator: batch.coordinator._id // Ensure coordinator is correctly populated
        });

        await application.save();
        res.status(201).json({message: 'Application created successfully', application});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};

export const updateApplicationByAdvisor = async (req, res) => {
    try {
        const {id} = req.params;
        const {signature, applicationStatus, advisorComments} = req.body;

        const application = await Application.findById(id);
        if (!application) return res.status(404).json({message: 'Application not found'});

        if (signature) application.signature = signature;
        if (applicationStatus) application.applicationStatus = applicationStatus;
        if (advisorComments !== undefined) application.advisorComments = advisorComments;

        await application.save();
        res.status(200).json({message: 'Application updated successfully', application});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};

export const updateApplicationByCoordinator = async (req, res) => {
    try {
        const {id} = req.params;
        const {applicationStatus, coordinatorComments} = req.body;

        const application = await Application.findById(id);
        if (!application) return res.status(404).json({message: 'Application not found'});

        if (applicationStatus) application.applicationStatus = applicationStatus;
        if (coordinatorComments !== undefined) application.coordinatorComments = coordinatorComments;

        await application.save();
        res.status(200).json({message: 'Application updated successfully', application});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};

export const updateApplicationByStudent = async (req, res) => {
    try {
        const {id} = req.params;
        const {content, reason} = req.body;
        
        // Verify that the requesting user is the application owner
        const application = await Application.findById(id);
        if (!application) return res.status(404).json({message: 'Application not found'});
        
        if (application.studentID.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: 'You are not authorized to update this application'});
        }
        
        // Only allow updates if application is in Pending state or has comments
        if (application.applicationStatus !== 'Pending' && !application.advisorComments) {
            return res.status(400).json({message: 'Cannot update application in current state'});
        }
        
        if (content) application.content = content;
        if (reason) application.reason = reason;
        
        // Reset comments and status if the application was previously commented on
        if (application.advisorComments) {
            application.advisorComments = '';
            application.applicationStatus = 'Pending';
        }
        
        await application.save();
        res.status(200).json({message: 'Application updated successfully', application});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};

export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        
        const application = await Application.findById(id);
        if (!application) return res.status(404).json({message: 'Application not found'});
        
        // Determine user's role in relation to this application
        let role = 'student';
        if (req.user._id.toString() === application.advisor.toString()) {
            role = 'advisor';
        } else if (req.user._id.toString() === application.coordinator.toString()) {
            role = 'coordinator';
        } else if (req.user._id.toString() !== application.studentID.toString()) {
            return res.status(403).json({message: 'You are not authorized to comment on this application'});
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
            return res.status(404).json({message: 'Application not found after update'});
        }
        
        const addedComment = updatedApplication.comments[updatedApplication.comments.length - 1];
        
        res.status(201).json({
            message: 'Comment added successfully',
            comment: addedComment
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
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
        
        if (!application) return res.status(404).json({message: 'Application not found'});
        
        // Check if user is authorized to view this application
        const userId = req.user._id.toString();
        if (userId !== application.studentID.toString() && 
            userId !== application.advisor.toString() && 
            userId !== application.coordinator.toString() &&
            req.user.role !== 'coordinator') {
            return res.status(403).json({message: 'You are not authorized to view comments for this application'});
        }
        
        res.status(200).json(application.comments || []);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({message: 'Something went wrong, please try again later'});
    }
};