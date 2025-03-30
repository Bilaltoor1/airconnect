import express from 'express';
import { createJob, getJobs, updateJob, deleteJob } from '../controllers/jobs.controller.js';
import multer from 'multer';
import { verifyToken } from '../middleware/verifyToken.js';
import restrictTo from '../middleware/restrict.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');  // Make sure this directory exists
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes
router.post('/', verifyToken, restrictTo('student-affairs'), upload.single('thumbnail'), createJob);
router.get('/', getJobs);
router.patch('/:id', verifyToken, restrictTo('student-affairs'), updateJob);
router.delete('/:id', verifyToken, restrictTo('student-affairs'), deleteJob);

export default router;