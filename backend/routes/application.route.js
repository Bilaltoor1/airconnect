import express from 'express';
import {
    createApplication, fetchApplicationById,
    fetchApplications, fetchHistoryofApplication,
    updateApplicationByAdvisor,
    updateApplicationByCoordinator,
    updateApplicationByStudent,
    addComment,
    getApplicationComments
} from '../controllers/application.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { checkCoordinator } from '../middleware/checkCoordinator.js';

const router = express.Router();
router.get('/', verifyToken, fetchApplications);
router.post('/', verifyToken, createApplication);
router.patch('/advisor/:id', verifyToken, updateApplicationByAdvisor);
router.patch('/coordinator/:id', verifyToken, checkCoordinator, updateApplicationByCoordinator);
router.patch('/student/:id', verifyToken, updateApplicationByStudent);
router.get('/history', verifyToken, fetchHistoryofApplication);
router.get('/:id', verifyToken, fetchApplicationById);
router.post('/:id/comments', verifyToken, addComment);
router.get('/:id/comments', verifyToken, getApplicationComments);
export default router;