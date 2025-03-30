import User from '../models/user.model.js';

export const checkCoordinator = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.role !== 'coordinator') {
            return res.status(403).json({ message: 'You do not have the necessary permissions' });
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};
