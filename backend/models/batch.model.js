import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    teachers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    advisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    coordinator :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;