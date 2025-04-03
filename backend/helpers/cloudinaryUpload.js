import cloudinary from './cloudinary.js';

/**
 * Uploads a file to Cloudinary with retry logic
 * @param {string} filePath - Path to the file to upload
 * @param {Object} options - Cloudinary upload options
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} retryDelay - Delay between retries in ms (default: 1000)
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinaryWithRetry = async (
    filePath, 
    options = { resource_type: 'auto' }, 
    maxRetries = 3, 
    retryDelay = 1000
) => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Wait before retrying (skip delay on first attempt)
            if (attempt > 0) {
                console.log(`Retrying Cloudinary upload (attempt ${attempt} of ${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
            
            // Attempt the upload
            const result = await cloudinary.uploader.upload(filePath, options);
            return result;
        } catch (error) {
            console.error(`Cloudinary upload failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
            lastError = error;
            
            // Check if it's a network error that might be temporary
            const isNetworkError = 
                error.code === 'ENOTFOUND' || 
                error.code === 'ECONNRESET' || 
                error.code === 'ETIMEDOUT' ||
                error.code === 'ECONNREFUSED';
                
            // If it's not a network error or we've reached max retries, throw the error
            if (!isNetworkError || attempt === maxRetries) {
                throw error;
            }
        }
    }
    
    // This should not be reached but just in case
    throw lastError;
};

/**
 * Uploads multiple files to Cloudinary with retry logic
 * @param {Array<string>} filePaths - Array of file paths to upload
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Array<Object>>} - Array of Cloudinary upload results
 */
export const uploadMultipleToCloudinaryWithRetry = async (filePaths, options = { resource_type: 'auto' }) => {
    const uploadPromises = filePaths.map(filePath => 
        uploadToCloudinaryWithRetry(filePath, options)
    );
    
    return Promise.all(uploadPromises);
};
