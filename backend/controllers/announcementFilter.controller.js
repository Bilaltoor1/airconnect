import AnnouncementFilter from "../models/announcement-filter.model.js";
import Batch from '../models/batch.model.js';

// Create a new section
const createAnnouncementFilter = async (req, res) => {
    try {
        const section = req.body.section;
        
        // Check if section already exists
        const existingSection = await AnnouncementFilter.findOne({ section });
        if (existingSection) {
            return res.status(400).json({ message: 'Section already exists' });
        }
        
        const announcementFilter = new AnnouncementFilter({ section });
        await announcementFilter.save();
        res.status(201).json({
            message: 'Section created successfully',
            section
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
        console.error(error);
    }
};

// Update a section
const updateAnnouncementFilter = async (req, res) => {
    try {
        const { id } = req.params;
        const { section } = req.body;
        
        // Check if section already exists with a different ID
        const existingSection = await AnnouncementFilter.findOne({ 
            section, 
            _id: { $ne: id }
        });
        
        if (existingSection) {
            return res.status(400).json({ message: 'Section name already exists' });
        }
        
        const updatedSection = await AnnouncementFilter.findByIdAndUpdate(
            id, 
            { section },
            { new: true }
        );
        
        if (!updatedSection) {
            return res.status(404).json({ message: 'Section not found' });
        }
        
        res.status(200).json({
            message: 'Section updated successfully',
            section: updatedSection
        });
    } catch (error) {
        console.error('Error updating section:', error);
        res.status(500).json({ message: error.message });
    }
};

const getAnnouncementFilters = async (req, res) => {
    try {
        let sections;
        if (req.user.role === 'student') {
            sections = await AnnouncementFilter.find({ section: { $in: [req.user.section, 'all'] } });
        } else {
            sections = await AnnouncementFilter.find();
        }
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).send({ message: error.message });
        console.error(error);
    }
};
// Delete a section by ID
const deleteAnnouncementFilter = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSection = await AnnouncementFilter.findByIdAndDelete(id);
        if (!deletedSection) {
            return res.status(404).json({ message: 'Section not found' });
        }
        res.status(200).json({ message: 'Section deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: error.message });
        console.error(error);
    }
};
const getAllAnnouncementFilters = async (req, res) => {
    try {
        const sections = await AnnouncementFilter.find();
        res.status(200).json(sections);
    } catch (error) {
        res.status(500).send({ message: error.message });
        console.error(error);
    }
};

// Get batches for filters based on user role
const getBatchFilters = async (req, res) => {
    try {
        let batches;
        
        if (req.user.role === 'student') {
            // Students can only see their own batch
            batches = await Batch.find({ students: req.user._id }).select('_id name section');
        } 
        else if (req.user.role === 'teacher') {
            // Teachers can see batches they are assigned to
            batches = await Batch.find({ teachers: req.user._id }).select('_id name section');
        } 
        else {
            // Coordinators can see all batches
            batches = await Batch.find().select('_id name section');
        }
        
        res.status(200).json(batches);
    } catch (error) {
        console.error('Error fetching batch filters:', error);
        res.status(500).json({ message: error.message });
    }
};

export { 
    createAnnouncementFilter, 
    getAllAnnouncementFilters,
    getAnnouncementFilters, 
    deleteAnnouncementFilter,
    updateAnnouncementFilter,
    getBatchFilters 
};