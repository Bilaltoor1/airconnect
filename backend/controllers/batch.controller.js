import Teacher from '../models/teacher.model.js';
import Student from '../models/student.model.js';
import Batch from '../models/batch.model.js';

export const getBatchSummary = async (req, res) => {
    try {
        const batches = await Batch.find()
            .populate('advisor', 'name')
            .populate('students', '_id')
            .populate('teachers', '_id');

        const batchSummary = batches.map(batch => ({
            _id: batch._id,
            name: batch.name,
            studentCount: batch.students.length,
            teacherCount: batch.teachers.length,
            advisorName: batch.advisor ? batch.advisor.name : 'N/A'
        }));

        res.status(200).json(batchSummary);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const createBatch = async (req, res) => {
    try {
        const { name } = req.body;
        const existingBatch = await Batch.findOne({ name });
        if (existingBatch) {
            return res.status(400).json({ message: 'Batch name already exists' });
        }
        const newBatch = new Batch({ name, coordinator: req.user._id });
        await newBatch.save();
        res.status(201).json(newBatch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};
export const updateBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        const { name } = req.body;
        const batch = await Batch.findById(batchId);
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }
        batch.name = name;
        await batch.save();
        res.status(200).json(batch);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};


export const removeBatch = async (req, res) => {
    try {
        const { batchId } = req.params;
        const batch = await Batch.findByIdAndDelete(batchId);
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }
        res.status(200).json({ message: 'Batch removed successfully' });
    } catch (error) {
        console.error('Error removing batch:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const addStudentToBatch = async (req, res) => {
    try {
        const { studentId, batchId } = req.body;
        const batch = await Batch.findById(batchId);
        const student = await Student.findById(studentId);

        if (!batch || !student) {
            return res.status(404).json({ message: 'Batch or Student not found' });
        }

        // Check if the student is already in the batch
        if (batch.students.includes(studentId)) {
            return res.status(400).json({ message: 'Student is already part of the batch' });
        }

        // Check if the student is already in another batch
        const studentInBatch = await Batch.findOne({ students: studentId });
        if (studentInBatch) {
            return res.status(400).json({ message: 'Student is already part of another batch' });
        }

        batch.students.push(studentId);
        await batch.save();

        res.status(200).json({ message: 'Student added to batch successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

// Add teacher to batch
export const addTeacherToBatch = async (req, res) => {
    try {
        const { teacherId, batchId } = req.body;
        const batch = await Batch.findById(batchId);
        const teacher = await Teacher.findById(teacherId);

        if (!batch || !teacher) {
            return res.status(404).json({ message: 'Batch or Teacher not found' });
        }

        if (batch.teachers.includes(teacherId)) {
            return res.status(400).json({ message: 'Teacher is already part of the batch' });
        }

        batch.teachers.push(teacherId);
        await batch.save();

        res.status(200).json({ message: 'Teacher added to batch successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};
export const getAllBatches = async (req, res) => {
    try {
        let batches;
        if (req.user.role === 'teacher') {
            batches = await Batch.find({ teachers: req.user._id });
        } else {
            batches = await Batch.find();
        }
        res.status(200).json(batches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const getBatchDetails = async (req, res) => {
    try {
        const { batchId } = req.params;

        const batch = await Batch.findById(batchId)
            .populate({
                path: 'students',
                model: 'User',
                // select: 'name email role'
            })
            .populate({
                path: 'teachers',
                model: 'User',
                // select: 'name email role'
            });

        if (!batch) {
            console.log('Batch not found');
            return res.status(404).json({ message: 'Batch not found' });
        }

        res.status(200).json(batch);
    } catch (error) {
        console.error('Error fetching batch details:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const removeStudentFromBatch = async (req, res) => {
    try {
        const { studentId, batchId } = req.body;
        const batch = await Batch.findById(batchId);
        const student = await Student.findById(studentId);

        if (!batch || !student) {
            return res.status(404).json({ message: 'Batch or Student not found' });
        }

        batch.students.pull(studentId);

        await batch.save();

        res.status(200).json({ message: 'Student removed from batch successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const removeTeacherFromBatch = async (req, res) => {
    try {
        const { teacherId, batchId } = req.body;
        const batch = await Batch.findById(batchId);
        const teacher = await Teacher.findById(teacherId);

        if (!batch || !teacher) {
            return res.status(404).json({ message: 'Batch or Teacher not found' });
        }

        batch.teachers.pull(teacherId);

        await batch.save();

        res.status(200).json({ message: 'Teacher removed from batch successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};

export const addAdvisorToBatch = async (req, res) => {
    try {
        const { advisorId, batchId } = req.body;
        const batch = await Batch.findById(batchId);
        const advisor = await Teacher.findById(advisorId);

        if (!batch || !advisor) {
            return res.status(404).json({ message: 'Batch or Advisor not found' });
        }

        if (batch.advisor && batch.advisor.toString() === advisorId) {
            return res.status(400).json({ message: 'Advisor is already assigned to this batch' });
        }

        batch.advisor = advisorId;
        await batch.save();

        res.status(200).json({ message: 'Advisor added to batch successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
};