import express from 'express';
import {
    addAdvisorToBatch,
    addStudentToBatch,
    addTeacherToBatch,
    createBatch,
    getAllBatches,
    getBatchDetails, getBatchSummary, removeBatch,
    removeStudentFromBatch,
    removeTeacherFromBatch, updateBatch
} from '../controllers/batch.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { checkCoordinator } from '../middleware/checkCoordinator.js';

const router = express.Router();

router.get('/summary', verifyToken, getBatchSummary); // Ensure this is before any dynamic route

router.post('/create', verifyToken, checkCoordinator, createBatch);
router.post('/add-student', verifyToken, checkCoordinator, addStudentToBatch);
router.post('/add-teacher', verifyToken, checkCoordinator, addTeacherToBatch);
router.post('/remove-student', verifyToken, checkCoordinator, removeStudentFromBatch);
router.post('/remove-teacher', verifyToken, checkCoordinator, removeTeacherFromBatch);
router.get('/all', verifyToken, getAllBatches);
router.get('/:batchId', verifyToken, getBatchDetails);
router.post('/add-advisor', verifyToken, addAdvisorToBatch);
router.put('/update/:batchId', verifyToken, checkCoordinator, updateBatch);
router.delete('/remove/:batchId', verifyToken, checkCoordinator, removeBatch);

export default router;