import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Ensure we have Cloudinary credentials
const cloudName = process.env.CLOUD_NAME || 'dxwrgjhbl';
const apiKey = process.env.API_KEY || '927474488594855';
const apiSecret = process.env.API_SECRET || 'XVoD2dYSNxjYmWVRRD04v_1OBZw';

// Use environment variables for Cloudinary configuration
cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

// Test the Cloudinary connection
cloudinary.api.ping((error, result) => {
    if (error) {
        console.error('Cloudinary connection error:', error);
    } else {
        console.log('Cloudinary connected successfully:', result.status);
    }
});

export default cloudinary;