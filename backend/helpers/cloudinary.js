import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use environment variables for Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME || 'dxwrgjhbl',
    api_key: process.env.API_KEY || '927474488594855',
    api_secret: process.env.API_SECRET || 'XVoD2dYSNxjYmWVRRD04v_1OBZw'
});

export default cloudinary;