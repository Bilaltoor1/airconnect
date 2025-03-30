import express from 'express';
import {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    dislikeAnnouncement, likeAnnouncement, deleteAnnouncement, updateAnnouncement, addComment, getComments
} from '../controllers/announcement.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';
import restrictTo from '../middleware/restrict.js';
import upload from '../helpers/upload.js';
const router = express.Router();

router.get('/',verifyToken, getAnnouncements);
router.get('/:id', getAnnouncementById);
router.post('/', verifyToken, restrictTo('coordinator', 'teacher'), upload.array('files', 5), createAnnouncement);
router.post('/:id/like', verifyToken, likeAnnouncement);
router.post('/:id/dislike', verifyToken, dislikeAnnouncement);
router.delete('/:id', verifyToken, restrictTo('coordinator', 'teacher'), deleteAnnouncement);
router.put('/:id', verifyToken, restrictTo('coordinator', 'teacher'), updateAnnouncement);
router.post('/:announcementId/comments', verifyToken, addComment);
router.get('/:announcementId/comments', verifyToken, getComments);

export default router;