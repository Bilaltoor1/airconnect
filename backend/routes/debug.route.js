import express from 'express';
import { getIO } from '../services/socket.service.js';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Get socket server status
router.get('/socket-status', verifyToken, (req, res) => {
    try {
        const io = getIO();
        
        // Get room information
        const userId = req.user._id;
        const room = `user:${userId}`;
        const roomClients = io.sockets.adapter.rooms.get(room);
        const clientCount = roomClients ? roomClients.size : 0;
        
        // Get general socket.io stats
        const sockets = io.sockets.sockets;
        const totalConnections = sockets.size;
        
        // Get list of all rooms
        const rooms = io.sockets.adapter.rooms;
        const roomsList = [];
        
        rooms.forEach((clients, roomName) => {
            // Only include user rooms, not socket ID rooms
            if (roomName.startsWith('user:')) {
                roomsList.push({
                    name: roomName,
                    clients: clients.size,
                });
            }
        });
        
        // Collect all socket info
        const connectedSockets = [];
        sockets.forEach((socket) => {
            connectedSockets.push({
                id: socket.id,
                userId: socket.userId,
                rooms: Array.from(socket.rooms),
                handshake: {
                    address: socket.handshake.address,
                    time: socket.handshake.time,
                }
            });
        });
        
        res.json({
            status: 'Socket server running',
            currentUserRoom: room,
            clientsInRoom: clientCount,
            totalConnections,
            rooms: roomsList,
            sockets: connectedSockets,
        });
    } catch (error) {
        console.error('Error getting socket status:', error);
        res.status(500).json({ 
            status: 'Error', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Test route to send a manual notification to a user
router.post('/send-test-notification', verifyToken, async (req, res) => {
    try {
        const io = getIO();
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }
        
        // Create a test notification message
        const notification = {
            _id: new Date().getTime().toString(), // Add a mock ID for client-side tracking
            recipient: userId,
            type: 'system',
            title: 'Test Notification',
            message: 'This is a test notification sent manually',
            created: new Date(),
            read: false,
            sender: {
                _id: req.user._id,
                name: req.user.name || 'System'
            }
        };
        
        // Send to the specified room
        const room = `user:${userId}`;
        io.to(room).emit('notification', notification);
        
        const roomClients = io.sockets.adapter.rooms.get(room);
        const clientCount = roomClients ? roomClients.size : 0;
        
        // Log active socket connections
        const activeSockets = [];
        io.sockets.sockets.forEach(socket => {
            activeSockets.push({
                id: socket.id,
                userId: socket.userId,
                rooms: Array.from(socket.rooms || [])
            });
        });
        
        res.json({ 
            message: 'Test notification sent', 
            room,
            clientsInRoom: clientCount,
            notificationSent: notification,
            activeSockets
        });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ 
            message: 'Error sending test notification', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Add a new route to check current socket connections
router.get('/socket-connections', verifyToken, (req, res) => {
    try {
        const io = getIO();
        const connections = [];
        
        io.sockets.sockets.forEach(socket => {
            connections.push({
                id: socket.id,
                userId: socket.userId,
                rooms: Array.from(socket.rooms || []),
                handshake: {
                    address: socket.handshake.address,
                    headers: socket.handshake.headers,
                    time: socket.handshake.time
                }
            });
        });
        
        res.json({
            totalConnections: connections.length,
            connections
        });
    } catch (error) {
        console.error('Error getting socket connections:', error);
        res.status(500).json({ 
            message: 'Error getting socket connections',
            error: error.message 
        });
    }
});

export default router;
