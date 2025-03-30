import express from 'express'
import connectToDB from "./DB/connectToDB.js";
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs';
import path from 'path';
// import multer from 'multer'

import UserRouter from './routes/user.route.js'
import AnnouncementRouter from "./routes/announcement.route.js";
import AnnouncementFilterRouter from "./routes/announcement-filter.route.js";
import batchRoutes from './routes/batch.route.js';
import JobsRouter from './routes/jobs.route.js';
import ApplicationRouter from './routes/application.route.js'
// import * as path from "node:path";
const app = express()
dotenv.config()
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
// app.use(express.static(path.resolve(__dirname,'public')));


// Make sure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// let uploader = multer({
//     storage: multer.diskStorage({}),
//     limits: { fileSize: 500000 }
// });

// app.post('/upload-file', uploader.single("file"), uploadFile);
app.use('/api/auth', UserRouter)
app.use('/api/announcements', AnnouncementRouter)
app.use('/api/announcement-filter', AnnouncementFilterRouter)
app.use('/api/batches', batchRoutes);
app.use('/api/jobs', JobsRouter);
app.use('/api/applications', ApplicationRouter)

app.listen(3001, async () => {
    console.log("Server running on port 3001")
    await connectToDB()
})