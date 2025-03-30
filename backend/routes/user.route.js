import express from 'express'
import {
    getUser,
    login,
    logout,
    signup,
    updateProfileSetup,
    updateUser, changePassword, getAllTeachers, getStudentsWithoutBatch,
    getPendingTeachers,
    verifyTeacher
} from "../controllers/user.controller.js";
import {verifyToken} from "../middleware/verifyToken.js";
import {checkCoordinator} from "../middleware/checkCoordinator.js";
import multer from 'multer';
import path from 'path';

const router = express.Router()

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/profile')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'), false);
        }
    }
});

router.post('/signup',signup)
router.post('/login',login)
router.post('/logout',logout)
router.get('/get-user',verifyToken,getUser)
router.post('/profile-setup',verifyToken, upload.single('profileImage'), updateProfileSetup)
router.patch('/update-user', verifyToken, upload.single('profileImage'), updateUser);
router.post('/change-password', verifyToken, changePassword);
router.get('/teachers', verifyToken, checkCoordinator, getAllTeachers);
router.get('/students-without-batch', verifyToken, checkCoordinator, getStudentsWithoutBatch);
router.get('/pending-teachers', verifyToken, checkCoordinator, getPendingTeachers);
router.post('/verify-teacher', verifyToken, checkCoordinator, verifyTeacher);
export default router