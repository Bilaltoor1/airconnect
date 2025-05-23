import express from 'express';
import {
    createApplication, fetchApplicationById,
    fetchApplications, fetchHistoryofApplication,
    updateApplicationByAdvisor,
    updateApplicationByCoordinator,
    updateApplicationByStudent,
    addComment,
    getApplicationComments,
    clearStudentApplicationHistory,
    clearAdvisorApplicationHistory,
    clearCoordinatorApplicationHistory,
    hideStudentApplication,
    hideAdvisorApplication,
    hideCoordinatorApplication
} from '../controllers/application.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { checkCoordinator } from '../middleware/checkCoordinator.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure upload directory exists
const uploadDir = './uploads/applications';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads/applications directory');
}

// Configure multer for application file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images, PDFs, docs, and other common file types
    const allowedTypes = [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
        
        // PDFs
        'application/pdf', 
        
        // Word documents
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        
        // Excel files
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        
        // Alternative MIME types that some browsers/systems might use
        'application/octet-stream'
    ];
    
    console.log(`File upload attempt: ${file.originalname}, MIME: ${file.mimetype}`);
    
    // Check MIME type first
    if (allowedTypes.includes(file.mimetype)) {
        return cb(null, true);
    }
    
    // Fallback to extension checking if MIME type check fails
    const ext = file.originalname.split('.').pop().toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
    
    if (allowedExtensions.includes(ext)) {
        console.log(`Accepting file based on extension: ${ext}`);
        return cb(null, true);
    }
    
    console.log(`Rejected file: ${file.originalname}, MIME: ${file.mimetype}, Extension: ${ext}`);
    cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
});

router.get('/', verifyToken, fetchApplications);
router.post('/', verifyToken, upload.array('files', 5), createApplication); // Allow up to 5 files
router.patch('/advisor/:id', verifyToken, updateApplicationByAdvisor);
router.patch('/coordinator/:id', verifyToken, checkCoordinator, updateApplicationByCoordinator);
router.patch('/student/:id', verifyToken, upload.array('files', 5), updateApplicationByStudent);
router.get('/history', verifyToken, fetchHistoryofApplication);
router.get('/:id', verifyToken, fetchApplicationById);
router.post('/:id/comments', verifyToken, addComment);
router.get('/:id/comments', verifyToken, getApplicationComments);

// Routes for clearing application history
router.delete('/history/student', verifyToken, clearStudentApplicationHistory);
router.delete('/history/advisor', verifyToken, clearAdvisorApplicationHistory);
router.delete('/history/coordinator', verifyToken, checkCoordinator, clearCoordinatorApplicationHistory);

// Routes for hiding individual applications
router.delete('/student/:id', verifyToken, hideStudentApplication);
router.delete('/advisor/:id', verifyToken, hideAdvisorApplication);
router.delete('/coordinator/:id', verifyToken, checkCoordinator, hideCoordinatorApplication);

export default router;