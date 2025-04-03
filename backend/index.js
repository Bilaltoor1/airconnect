import express from 'express'
import connectToDB from "./DB/connectToDB.js";
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs';
import path from 'path';
import http from 'http';
import { initializeSocketServer } from './services/socket.service.js';
import notificationRoutes from './routes/notification.route.js';
import debugRoutes from './routes/debug.route.js';
import morgan from 'morgan'
import UserRouter from './routes/user.route.js'
import AnnouncementRouter from "./routes/announcement.route.js";
import AnnouncementFilterRouter from "./routes/announcement-filter.route.js";
import batchRoutes from './routes/batch.route.js';
import JobsRouter from './routes/jobs.route.js';
import ApplicationRouter from './routes/application.route.js'

// Make sure server is defined before routes
const app = express()
dotenv.config()
app.use(morgan('dev')) // Use morgan for logging requests
// Apply middleware
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))

// Make sure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Initialize socket server BEFORE routes
console.log('Initializing Socket.io server...');
initializeSocketServer(server);
console.log('Socket.io server initialized');

app.use('/api/auth', UserRouter)
app.use('/api/announcements', AnnouncementRouter)
app.use('/api/announcement-filter', AnnouncementFilterRouter)
app.use('/api/batches', batchRoutes);
app.use('/api/jobs', JobsRouter);
app.use('/api/applications', ApplicationRouter)
app.use('/api/notifications', notificationRoutes)
app.use('/api/debug', debugRoutes); // Add the debug routes

// Start the server
server.listen(3001, async () => {
    console.log("Server running on port 3001")
    await connectToDB()
})