import bcrypt from 'bcrypt';
import UserModel from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../GenerateTokenAndSetCookie.js";
import Batch from "../models/batch.model.js";
import cloudinary from '../helpers/cloudinary.js';  // Make sure to import cloudinary
import crypto from 'crypto'; // For generating reset tokens
import nodemailer from 'nodemailer';
import fs from 'fs'; // For file operations

const uploadToCloudinaryWithRetry = async (filePath, options) => {
    let attempts = 3;
    while (attempts > 0) {
        try {
            return await cloudinary.uploader.upload(filePath, options);
        } catch (error) {
            attempts -= 1;
            if (attempts === 0) throw error;
        }
    }
};

// Update signup function to only allow student and teacher roles
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Only allow student and teacher roles for signup
        if (role && !['student', 'teacher'].includes(role)) {
            return res.status(403).json({
                message: "Only students and teachers can register through signup"
            });
        }

        // Email validation patterns
        const studentEmailPattern = /^\d+@students\.au\.edu\.pk$/;
        const teacherEmailPattern = /^[a-zA-Z0-9._%+-]+@aumc\.edu\.pk$/;

        // Validate email based on role
        if (role === 'student' && !studentEmailPattern.test(email)) {
            return res.status(400).json({ 
                message: 'Invalid email format. Student email must follow pattern: 213088@student.au.edu.pk' 
            });
        }

        if (role === 'teacher' && !teacherEmailPattern.test(email) && !studentEmailPattern.test(email)) {
            return res.status(400).json({ 
                message: 'Invalid email format. Teacher email must follow either pattern: name@aumc.edu.pk or 213088@student.au.edu.pk' 
            });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new UserModel({
            name,
            email,
            password: hashedPassword,
            role,
            profileSetup: false,
            identityConfirmed: role === 'student'
        });

        await newUser.save();

        if (role === 'student') {
            generateTokenAndSetCookie(res, newUser);
        }

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (!user.identityConfirmed && user.role !== 'student') {
            return res.status(403).json({ message: 'Identity not confirmed by admin' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        generateTokenAndSetCookie(res, user);

        res.status(200).json({
            message: 'Login successful',
            user: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

const logout = (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({message: 'Logged out successfully'});
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({message: 'Logout failed'});
    }}

export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await UserModel.find({ role: 'teacher' });
        res.status(200).json(teachers);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

const getUser = async (req, res) => {
    try {
        let query = UserModel.findOne({ _id: req.user._id });

        if (req.user.role === 'student') {
            query = query.populate({
                path: 'batch',
                select: 'name advisor teachers',
                populate: [
                    { path: 'advisor', select: 'name email' },
                    { path: 'teachers', select: 'name email section' }
                ]
            });
        }

        const user = await query;

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        
        const userWithBatch = user.toObject();
        
        if (user.batch) {
            console.log('Batch data found:', user.batch); // Debug log
            userWithBatch.batchName = user.batch.name;
            userWithBatch.advisor = user.batch.advisor;
            userWithBatch.teachers = user.batch.teachers;
        } else {
            console.log('No batch data found for user:', user._id);
        }
        
        res.status(200).json({ user: userWithBatch });
    } catch (e) {
        console.error('Error fetching user data:', e);
        res.status(500).json({ message: "Something went wrong, please try again later" });
    }
};

const updateProfileSetup = async (req, res) => {
    try {
        const { userId } = req.body;
        console.log('Profile setup request received:', { userId, file: req.file ? 'File received' : 'No file' });
        
        const profileData = req.body;
        
        // Find the user first to determine the role
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prepare update data based on user role
        const updateData = {
            profileSetup: true,
            identityConfirmed: true
        };

        // Handle profile image upload
        if (req.file) {
            try {
                console.log('Uploading profile image to Cloudinary:', req.file.path);
                // Use the cloudinaryUpload helper with retry logic
                const result = await uploadToCloudinaryWithRetry(req.file.path, {
                    folder: 'user_profiles',
                    resource_type: 'image'
                });
                
                // Add the image URL to update data
                updateData.profileImage = result.secure_url;
                console.log('Image uploaded successfully:', result.secure_url);
                
                // Remove local file after upload to cloudinary
                try {
                    fs.unlinkSync(req.file.path);
                    console.log('Temporary file removed');
                } catch (cleanupError) {
                    console.error('Error removing temporary file:', cleanupError);
                }
            } catch (uploadError) {
                console.error('Error uploading to Cloudinary:', uploadError);
                // Continue without failing the whole operation
            }
        }

        // Add role-specific data directly to the user document
        if (user.role === 'student') {
            // Apply updates directly to user document
            user.section = profileData.section;
            user.rollNo = profileData.rollNo;
            
            // Handle batch assignment
            if (profileData.batchId) {
                const batch = await Batch.findById(profileData.batchId);
                if (!batch) {
                    return res.status(404).json({ message: 'Batch not found' });
                }
                
                // Set batch reference directly on user document
                user.batch = profileData.batchId;
                
                // Add student to batch if not already there
                if (!batch.students.includes(userId)) {
                    batch.students.push(userId);
                    await batch.save();
                }
            }
        } else if (user.role === 'teacher') {
            user.section = profileData.section;
            user.designation = profileData.designation; // Add this line to save the designation
            console.log('Setting teacher designation:', profileData.designation);
        } else if (user.role === 'coordinator') {
            user.department = profileData.department;
            user.officeNumber = profileData.officeNumber;
        }

        // Apply other updates from updateData object
        user.profileSetup = updateData.profileSetup;
        user.identityConfirmed = updateData.identityConfirmed;
        if (updateData.profileImage) {
            user.profileImage = updateData.profileImage;
        }

        // Save the updated user document
        await user.save();

        console.log('Updated user:', user);

        res.status(200).json({ 
            message: 'Profile setup completed successfully',
            user: user
        });
    } catch (error) {
        console.error('Error in profile setup:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

const updateUser = async (req, res) => {
    try {
        const userId = req.body.userId;
        console.log('Update user request received:', { userId, file: req.file ? 'File received' : 'No file' });
        
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract profile data from request body
        const profileData = { ...req.body };
        delete profileData.userId; // Remove userId from the fields to update

        // Handle profile image upload if present
        if (req.file) {
            try {
                console.log('Uploading profile image to Cloudinary:', req.file.path);
                // Use the cloudinaryUpload helper with retry logic
                const uploadResult = await uploadToCloudinaryWithRetry(req.file.path, {
                    folder: 'user_profiles',
                    resource_type: 'image'
                });
                
                profileData.profileImage = uploadResult.secure_url;
                console.log('Image uploaded successfully:', uploadResult.secure_url);
                
                // Remove local file after upload to cloudinary
                try {
                    fs.unlinkSync(req.file.path);
                    console.log('Temporary file removed');
                } catch (cleanupError) {
                    console.error('Error removing temporary file:', cleanupError);
                }
            } catch (uploadError) {
                console.error('Error uploading image:', uploadError);
                return res.status(500).json({ 
                    message: 'Failed to upload profile image',
                    error: uploadError.message
                });
            }
        }

        if (profileData.password) {
            profileData.password = await bcrypt.hash(profileData.password, 12);
        }

        if (user.role === 'student') {
            const { batchId } = profileData;
            const batch = await Batch.findById(batchId);
            if (batch) {
                batch.students.push(user._id);
                await batch.save();
            }
        }

        Object.assign(user, profileData);
        await user.save();
        console.log('updated user', user);

        generateTokenAndSetCookie(res, user);

        res.status(200).json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

 const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    try {
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
const getStudentsWithoutBatch = async (req, res) => {
    try {
        // Fetch all batches and extract student IDs
        const batches = await Batch.find({}, 'students');
        const studentIdsInBatches = batches.flatMap(batch => batch.students);

        // Find students who are not in any batch
        const studentsWithoutBatch = await UserModel.find({
            role: 'student',
            _id: { $nin: studentIdsInBatches }
        });

        console.log('studentsWithoutBatch', studentsWithoutBatch);
        res.status(200).json(studentsWithoutBatch);
    } catch (error) {
        console.error('Error fetching students without batch:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const getPendingTeachers = async (req, res) => {
    try {
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Access denied. Only coordinators can access this resource.' });
        }

        const pendingTeachers = await UserModel.find({ 
            role: 'teacher',
            identityConfirmed: false
        });

        res.status(200).json(pendingTeachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const verifyTeacher = async (req, res) => {
    try {
        // Only allow coordinators to access this endpoint
        if (req.user.role !== 'coordinator') {
            return res.status(403).json({ message: 'Access denied. Only coordinators can verify teachers.' });
        }

        const { teacherId, isApproved } = req.body;

        if (!teacherId) {
            return res.status(400).json({ message: 'Teacher ID is required' });
        }

        const teacher = await UserModel.findById(teacherId);
        
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        if (teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'User is not a teacher' });
        }

        if (isApproved) {
            // Approve the teacher
            teacher.isVerified = true;
            teacher.isApproved = true;
            teacher.identityConfirmed = true;
            await teacher.save();

            res.status(200).json({ 
                message: 'Teacher verified successfully',
                teacher
            });
        } else {
            // Reject the teacher - completely delete from database
            await UserModel.findByIdAndDelete(teacherId);
            
            res.status(200).json({ 
                message: 'Teacher rejected and removed from system',
                deleted: true
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, email, section, batchId } = req.body;
        
        // Update user profile
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { name, email, section },
            { new: true }
        );
        
        // If student is selecting a batch, add them to the batch
        if (req.user.role === 'student' && batchId) {
            // Check if batch exists
            const batch = await Batch.findById(batchId);
            if (!batch) {
                return res.status(404).json({ message: 'Batch not found' });
            }
            
            // Check if student is already in a batch
            const studentInBatch = await Batch.findOne({ students: userId });
            if (studentInBatch && studentInBatch._id.toString() !== batchId) {
                // Remove from old batch first
                await Batch.findByIdAndUpdate(
                    studentInBatch._id,
                    { $pull: { students: userId } }
                );
            }
            
            // Add to new batch if not already there
            if (!batch.students.includes(userId)) {
                batch.students.push(userId);
                await batch.save();
            }
        }
        
        res.status(200).json({ 
            message: 'Profile updated successfully', 
            user: updatedUser 
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Forgot password - send reset email
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with that email does not exist' });
        }
        
        // Generate random reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        console.log('Generated reset token:', resetToken); // Debug log
        
        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
            
        // Set expire time (1 hour instead of 10 minutes for better testing window)
        user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour expiration
        
        await user.save();
        console.log('User after setting reset token:', {
            id: user._id,
            email: user.email,
            tokenSet: !!user.resetPasswordToken,
            expireTime: new Date(user.resetPasswordExpire).toISOString()
        });
        
        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        
        // Create email message
        const message = `
            <h1>Password Reset Request</h1>
            <p>You requested a password reset. Please click on the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 15px; background-color: #4ade80; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">Reset Password</a>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            <p>This link is valid for 1 hour.</p>
        `;
        
        // Create nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        // Send email
        await transporter.sendMail({
            from: `"AirConnect Support" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
            to: email,
            subject: 'AirConnect Password Reset',
            html: message
        });
        
        res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Could not send reset email. Please try again later.' });
    }
};

// Reset password with token
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        console.log('Received reset token:', token);
        
        if (!token) {
            return res.status(400).json({ message: 'Reset token is required' });
        }
        
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
            
        console.log('Hashed token for lookup:', resetPasswordToken);
        
        // Find user with matching token and valid expire time
        const user = await UserModel.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });
        
        console.log('User lookup result:', user ? {
            found: true,
            id: user._id,
            email: user.email,
            tokenMatch: user.resetPasswordToken === resetPasswordToken,
            tokenExpired: user.resetPasswordExpire < Date.now(),
            expiresAt: new Date(user.resetPasswordExpire).toISOString(),
            currentTime: new Date().toISOString()
        } : { found: false });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        
        // Set new password
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        
        await user.save();
        console.log('Password reset successful for user:', user.email);
        
        // Send confirmation email
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        
        const message = `
            <h1>Password Reset Successful</h1>
            <p>Your password has been reset successfully.</p>
            <p>If you did not perform this action, please contact our support team immediately.</p>
        `;
        
        await transporter.sendMail({
            from: `"AirConnect Support" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
            to: user.email,
            subject: 'Password Reset Successful',
            html: message
        });
        
        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            message: 'Could not reset password. Please try again later.',
            error: error.message
        });
    }
};

export { signup, login, getStudentsWithoutBatch, updateUser, changePassword, logout, getUser, updateProfileSetup };