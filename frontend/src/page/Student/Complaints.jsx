import { useState } from 'react';

const ComplaintsForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        studentId: '',
        complaintType: '',
        description: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
    };

    const complaintTypes = [
        'Academic Issue',
        'Administrative Issue',
        'Facility Issue',
        'Harassment',
        'Other',
    ];

    return (
        <div className="max-w-4xl w-full mt-6 mx-auto p-4 bg-base-200 shadow-lg rounded-lg">
            <h2 className="text-2xl text-base-200 font-bold mb-4">Complaint Form</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-base-text">Name</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        className="input input-bordered w-full"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-base-text">Email</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        className="input input-bordered w-full"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-base-text">Student ID</span>
                    </label>
                    <input
                        type="text"
                        name="studentId"
                        className="input input-bordered w-full"
                        value={formData.studentId}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-base-text">Complaint Type</span>
                    </label>
                    <select
                        name="complaintType"
                        className="select select-bordered w-full"
                        value={formData.complaintType}
                        onChange={handleChange}
                        required
                    >
                        <option value="" disabled>Select a complaint type</option>
                        {complaintTypes.map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text text-base-text">Complaint Description</span>
                    </label>
                    <textarea
                        name="description"
                        className="textarea textarea-bordered w-full h-60"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-full">Submit Complaint</button>
            </form>
        </div>
    );
};

export default ComplaintsForm;