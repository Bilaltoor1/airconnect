import {useState} from 'react';
import {useCreateApplication} from '@/hooks/useApplication';
import toast from 'react-hot-toast';
import {useAuth} from "@/context/AuthContext.jsx";

const ApplicationForm = () => {
    const {user} = useAuth();
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        studentID: user._id,
        reason: '',
        content: '',
        rollNo: user.rollNo,
    });
    
    const [showPreview, setShowPreview] = useState(false);
    const createApplication = useCreateApplication();

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createApplication.mutate(formData, {
            onSuccess: () => {
                toast.success('Application submitted successfully');
                setFormData({
                    ...formData,
                    reason: '',
                    content: '',
                });
                setShowPreview(false);
            },
            onError: () => {
                toast.error('Failed to submit application');
            }
        });
    };

    const reasons = [
        'Leave of Absence',
        'Extension of Assignment Deadline',
        'Request for Transcript',
        'Change of Course',
        'Financial Aid Request',
        'Other',
    ];
    
    const togglePreview = () => {
        setShowPreview(!showPreview);
    };
    
    const formatDate = () => {
        const date = new Date();
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-4xl w-full mt-6 mx-auto p-4 bg-base-200 dark:bg-base-200 shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-primary">Create New Application</h2>
            
            {!showPreview ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Full Name</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                className="input input-bordered w-full bg-base-100 dark:bg-base-100"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Email Address</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="input input-bordered w-full bg-base-100 dark:bg-base-100"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Roll Number</span>
                            </label>
                            <input
                                type="text"
                                name="rollNo"
                                className="input input-bordered w-full bg-base-100 dark:bg-base-100"
                                value={formData.rollNo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Application Type</span>
                            </label>
                            <select
                                name="reason"
                                className="select select-bordered w-full bg-base-100 dark:bg-base-100"
                                value={formData.reason}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>Select application type</option>
                                {reasons.map((reason, index) => (
                                    <option key={index} value={reason}>{reason}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Application Content</span>
                        </label>
                        <textarea
                            name="content"
                            className="textarea textarea-bordered w-full h-60 bg-base-100 dark:bg-base-100"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Write your detailed application content here..."
                            required
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                        <button 
                            type="button" 
                            onClick={togglePreview} 
                            className="btn btn-outline btn-info transition-colors duration-200"
                        >
                            Preview Application
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary transition-colors duration-200"
                        >
                            Submit Application
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-base-100 dark:bg-base-100 p-8 rounded-lg shadow-md">
                    {/* Application Preview */}
                    <div className="flex justify-between items-center border-b-2 border-primary pb-4 mb-6">
                        <div className="text-center w-full">
                            <h1 className="text-2xl font-bold text-primary">AIR UNIVERSITY MULTAN</h1>
                            <p className="text-base-content/70">Excellence in Education and Research</p>
                        </div>
                    </div>
                    
                    <div className="text-right mb-6">
                        <p className="font-medium">Date: {formatDate()}</p>
                    </div>
                    
                    <div className="mb-6">
                        <p><span className="font-semibold">To:</span> The Advisor/Coordinator</p>
                        <p><span className="font-semibold">Subject:</span> {formData.reason || "Application"}</p>
                    </div>
                    
                    <div className="mb-6">
                        <p className="mb-1"><span className="font-semibold">Student Name:</span> {formData.name}</p>
                        <p className="mb-1"><span className="font-semibold">Roll Number:</span> {formData.rollNo}</p>
                        <p className="mb-1"><span className="font-semibold">Email:</span> {formData.email}</p>
                    </div>
                    
                    <div className="mb-10 whitespace-pre-line">
                        <p className="mb-2 font-semibold">Content:</p>
                        <p className="border border-base-300 p-4 rounded min-h-[200px]">{formData.content}</p>
                    </div>
                    
                    <div className="mb-8">
                        <p>Sincerely,</p>
                        <p className="font-semibold">{formData.name}</p>
                        <p>Student</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-10">
                        <button 
                            type="button" 
                            onClick={togglePreview} 
                            className="btn btn-outline transition-colors duration-200"
                        >
                            Edit Application
                        </button>
                        <button 
                            type="button" 
                            onClick={handleSubmit} 
                            className="btn btn-primary transition-colors duration-200"
                        >
                            Submit Application
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationForm;