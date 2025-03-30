import User from '../models/user.model.js';

export const checkStudentAffairs = async (req, res, next) => {
    try {
        // Check if req.user exists
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Authentication required. Please login." });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (user.role !== 'student-affairs') {
            return res.status(403).json({ message: "Access denied. Only Student Affairs personnel can perform this action." });
        }
        
        next();
    } catch (error) {
        console.error("Error checking student affairs role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
