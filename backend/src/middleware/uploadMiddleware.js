import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure multer with memory storage
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Helper to upload buffer to Cloudinary
export const uploadToCloudinary = (fileBuffer) => {
    // Configure Cloudinary on demand so environment variables from dotenv are loaded
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'car-dealership',
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        uploadStream.end(fileBuffer);
    });
};
