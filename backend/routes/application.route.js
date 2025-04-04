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

// Routes for clearing application history
router.delete('/history/student', verifyToken, clearStudentApplicationHistory);
router.delete('/history/advisor', verifyToken, clearAdvisorApplicationHistory);
router.delete('/history/coordinator', verifyToken, checkCoordinator, clearCoordinatorApplicationHistory);

// Routes for hiding individual applications
router.delete('/student/:id', verifyToken, hideStudentApplication);
router.delete('/advisor/:id', verifyToken, hideAdvisorApplication);
router.delete('/coordinator/:id', verifyToken, checkCoordinator, hideCoordinatorApplication);

export default router;