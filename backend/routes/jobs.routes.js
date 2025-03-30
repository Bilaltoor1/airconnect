import express from 'express';
import { 
    createJob, 
    getAllJobs, 
    getJobById, 
    updateJob, 
    deleteJob 
} from '../controllers/jobs.controller.js';
import { authenticateUser } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for temporary disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/temp'); // Temporary storage before Cloudinary upload
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Routes with authentication and file upload middleware
router.post('/create', authenticateUser, upload.single('thumbnail'), createJob);
router.get('/all', getAllJobs);
router.get('/:id', getJobById);
router.put('/update/:id', authenticateUser, upload.single('thumbnail'), updateJob);
router.delete('/delete/:id', authenticateUser, deleteJob);

export default router;
