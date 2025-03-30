import bcrypt from 'bcrypt';
import UserModel from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../GenerateTokenAndSetCookie.js";
import Batch from "../models/batch.model.js";
import cloudinary from '../helpers/cloudinary.js';  // Make sure to import cloudinary

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
                select: 'name',
                match: { students: req.user._id } // Ensure user is in batch.students
            });
        }

        const user = await query;

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        const userWithBatch = user.toObject();
        if (user.batch) {
            userWithBatch.batchName = user.batch.name;
        }
        // console.log('user with batch',userWithBatch)
        res.status(200).json({ user: userWithBatch });
    } catch (e) {
        res.status(500).json({ message: "Something went wrong, please try again later" });
    }
};

const updateProfileSetup = async (req, res) => {
    try {
        console.log('Profile setup request received:', req.body);
        console.log('File:', req.file); // Log the received file

        const userId = req.user._id;
        const profileData = req.body;

        // Check if file was uploaded
        if (req.file) {
            try {
                // Upload to Cloudinary if a file was provided
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'user_profiles',
                });
                
                // Add the image URL to profile data
                profileData.profileImage = result.secure_url;
                
                // Remove local file after upload to cloudinary
                fs.unlinkSync(req.file.path);
            } catch (uploadError) {
                console.error('Error uploading to Cloudinary:', uploadError);
                return res.status(500).json({ message: 'Error uploading image' });
            }
        }

        // Update user profile
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { 
                section: profileData.section,
                rollNo: profileData.rollNo,
                batch: profileData.batchId,
                profileImage: profileData.profileImage,
                identityConfirmed: true,
                profileSetup: true,  // Add this line to set profileSetup to true
                // Add more fields as needed
            },
            { new: true }
        );

        res.status(200).json({ 
            message: 'Profile setup completed successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error in profile setup:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { userId, ...profileData } = req.body;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Handle profile image upload if present
        if (req.body.profileImage) {
            try {
                // Upload to Cloudinary
                const uploadResult = await cloudinary.uploader.upload(req.body.profileImage, {
                    folder: "user_profiles",
                });
                profileData.profileImage = uploadResult.secure_url;
            } catch (uploadError) {
                console.error("Error uploading image:", uploadError);
                // Continue without image if upload fails
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

        // Update teacher verification status
        teacher.isVerified = true;
        teacher.isApproved = isApproved;
        teacher.identityConfirmed = true; // Add this line to ensure verified teachers don't appear in pending list
        
        // If rejected, we might want to provide a reason (could add this later)
        if (!isApproved) {
            teacher.verificationRejectedReason = req.body.reason || 'Not approved by coordinator';
        }

        await teacher.save();

        res.status(200).json({ 
            message: isApproved ? 'Teacher verified successfully' : 'Teacher rejected successfully',
            teacher
        });
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

export { signup, login,getStudentsWithoutBatch,updateUser,changePassword, logout, getUser, updateProfileSetup };