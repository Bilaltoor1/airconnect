import multer from 'multer';
import path from 'path';

// Configure multer for temporary disk storage before Cloudinary upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/temp');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const imageFileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed!'), false);
    }
};

export const uploadImage = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// For multiple file types (like in announcements)
const generalFileFilter = (req, file, cb) => {
    // Accept various file types
    const allowedTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.'];
    if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
        cb(null, true);
    } else {
        cb(new Error('File type not supported!'), false);
    }
};

export const uploadFiles = multer({
    storage: storage,
    fileFilter: generalFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});
