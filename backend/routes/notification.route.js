import express from 'express';
import jwt from 'jsonwebtoken';
import { 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
} from '../controllers/notification.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get('/', verifyToken, getNotifications);
router.patch('/:id/read', verifyToken, markAsRead);
router.patch('/read-all', verifyToken, markAllAsRead);
router.delete('/:id', verifyToken, deleteNotification);

// Debug route to check token validity - useful for troubleshooting
router.post('/verify-token', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ valid: false, message: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({ 
            valid: true, 
            userId: decoded.id,
            decoded
        });
    } catch (err) {
        return res.status(400).json({ 
            valid: false, 
            message: err.message
        });
    }
});

export default router;
