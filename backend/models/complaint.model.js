import mongoose from "mongoose";
const Schema = mongoose.Schema;
const complaintSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    studentID: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Relationship with User
    complaintNumber: { type: String, required: true },
    complaintDescription: { type: String, required: true }
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
