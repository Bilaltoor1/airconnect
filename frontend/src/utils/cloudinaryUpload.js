/**
 * Uploads a file directly to Cloudinary from the browser
 * @param {File} file - The file to upload
 * @param {string} folder - The folder in Cloudinary to store the file (default: 'uploads')
 * @returns {Promise<string>} - The secure URL of the uploaded file
 */
export const uploadToCloudinary = async (file, folder = 'uploads') => {
  // Your Cloudinary upload preset - create this in your Cloudinary dashboard
  const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset'; // Change this to your preset
  const CLOUDINARY_CLOUD_NAME = 'your_cloud_name'; // Change this to your cloud name
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Uploads multiple files to Cloudinary
 * @param {File[]} files - Array of files to upload
 * @param {string} folder - The folder in Cloudinary
 * @returns {Promise<string[]>} - Array of secure URLs
 */
export const uploadMultipleToCloudinary = async (files, folder = 'uploads') => {
  const uploadPromises = Array.from(files).map(file => 
    uploadToCloudinary(file, folder)
  );
  
  return Promise.all(uploadPromises);
};
