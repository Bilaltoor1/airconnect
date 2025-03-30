import Job from '../models/jobs.model.js';
import cloudinary from '../helpers/cloudinary.js';

// Create a new job post
const createJob = async (req, res) => {
    try {
        // Log incoming request
        console.log('Received job create request:');
        console.log('Body:', req.body);
        console.log('File:', req.file || 'No file uploaded');
        
        const { jobTitle, jobLink, company, jobDescription, department, jobType, jobTime } = req.body;
        let thumbnail = null;
        
        // Check if file was uploaded and process with cloudinary
        if (req.file) {
            // Upload the file to cloudinary
            const uploadResult = await cloudinary.uploader.upload(req.file.path, { 
                resource_type: 'auto' // Auto-detect file type
            });
            thumbnail = uploadResult.secure_url;
            console.log('File uploaded to Cloudinary:', thumbnail);
        }
        
        const requiredFields = ['jobTitle', 'jobLink', 'company', 'jobDescription'];
        const missingFields = requiredFields.filter(field => {
            return req.body[field] === undefined || req.body[field] === null || 
                  (typeof req.body[field] === 'string' && req.body[field].trim() === '');
        });
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }
        
        // Create and save the job
        const newJob = new Job({ 
            jobTitle, 
            jobLink, 
            company, 
            jobDescription, 
            thumbnail, 
            department,
            jobType,
            jobTime 
        });
        
        await newJob.save();
        res.status(201).json({ message: 'Job created successfully', job: newJob });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later', error: error.message });
    }
};

// Get all job posts
const getJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', sort = 'latest', department = 'all' } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { jobTitle: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { jobDescription: { $regex: search, $options: 'i' } },
            ];
        }
        if (department !== 'all') {
            query.department = department;
        }

        const sortOption = sort === 'latest' ? { createdAt: -1 } : { createdAt: 1 };

        const jobs = await Job.find(query)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Job.countDocuments(query);

        res.status(200).json({ jobs, total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Update a job post
const updateJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { jobTitle, jobLink, company, jobDescription, department, jobType, jobTime } = req.body;
        
        // Find the job first to check if it exists
        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        // Handle file upload if there's a new file
        let thumbnail = job.thumbnail; // Keep existing thumbnail by default
        
        if (req.file) {
            // Upload the new file to cloudinary
            const uploadResult = await cloudinary.uploader.upload(req.file.path, { 
                resource_type: 'auto' // Auto-detect file type
            });
            thumbnail = uploadResult.secure_url;
        }
        
        // Update the job with new data
        const updatedJob = await Job.findByIdAndUpdate(
            id, 
            { jobTitle, jobLink, company, jobDescription, thumbnail, department, jobType, jobTime },
            { new: true } // Return the updated document
        );
        
        res.status(200).json({ message: 'Job updated successfully', job: updatedJob });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Delete a job post
const deleteJob = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedJob = await Job.findByIdAndDelete(id);
        if (!deletedJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.status(200).json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export { createJob, getJobs, updateJob, deleteJob };