import express from 'express';
import {
    createAnnouncementFilter,
    getAnnouncementFilters,
    deleteAnnouncementFilter,
    getAllAnnouncementFilters,
    getBatchFilters,
    updateAnnouncementFilter
} from '../controllers/announcementFilter.controller.js';
import {verifyToken} from "../middleware/verifyToken.js";
import {checkCoordinator} from "../middleware/checkCoordinator.js";

const router = express.Router();

router.get('/',verifyToken ,getAnnouncementFilters);
router.post('/', verifyToken, checkCoordinator, createAnnouncementFilter);
router.put('/:id', verifyToken, checkCoordinator, updateAnnouncementFilter);
router.delete('/:id', verifyToken, checkCoordinator, deleteAnnouncementFilter);
router.get('/all', getAllAnnouncementFilters);
router.get('/batches', verifyToken, getBatchFilters);
export default router;