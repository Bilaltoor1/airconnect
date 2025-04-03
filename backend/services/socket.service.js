import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocketServer = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        console.log('Socket auth attempt with token:', token ? `${token.substring(0, 15)}...` : 'No token');
        
        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Socket auth successful for user:', decoded.id);
            socket.userId = decoded.id;
            socket.user = decoded;
            next();
        } catch (err) {
            console.error('Socket auth error:', err.message);
            return next(new Error('Authentication error: Invalid token'));
        }
    });
    
    io.on('connection', (socket) => {
        console.log(`🟢 User connected to socket: ${socket.userId}, Socket ID: ${socket.id}`);
        
        // Add user to their personal room for targeted notifications
        socket.join(`user:${socket.userId}`);
        console.log(`User ${socket.userId} joined room: user:${socket.userId}`);
        
        // Allow manual joining of rooms
        socket.on('joinRoom', (data) => {
            if (data.userId && data.userId === socket.userId) {
                socket.join(`user:${data.userId}`);
                console.log(`User ${socket.userId} manually joined room: user:${data.userId}`);
            }
        });
        
        socket.on('disconnect', () => {
            console.log(`🔴 User disconnected from socket: ${socket.userId}`);
        });
    });
    
    console.log('Socket.io server initialized successfully');
    return io;
};

export const getIO = () => {
    if (!io) {
        console.error('Socket.io not initialized');
        throw new Error('Socket.io not initialized');
    }
    return io;
};

export const sendNotification = (userId, notification) => {
    if (!io) {
        console.error('Cannot send notification: Socket.io not initialized');
        return;
    }
    
    console.log(`🔔 Emitting notification to user:${userId}`);
    const room = `user:${userId}`;
    const roomClients = io.sockets.adapter.rooms.get(room);
    
    console.log(`Room ${room} has ${roomClients ? roomClients.size : 0} connected clients`);
    
    // Send the notification to the user's room
    io.to(room).emit('notification', notification);
    console.log(`Notification emitted to room ${room}`);
    
    return true;
};

export const sendBulkNotifications = (userIds, notification) => {
    if (!io) {
        console.error('Cannot send bulk notifications: Socket.io not initialized');
        return;
    }
    
    console.log(`Emitting notification to ${userIds.length} users`);
    let successCount = 0;
    
    userIds.forEach(userId => {
        const success = sendNotification(userId.toString(), notification);
        if (success) successCount++;
    });
    
    console.log(`Successfully sent ${successCount}/${userIds.length} notifications`);
};
