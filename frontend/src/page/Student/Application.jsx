import {useState, useRef} from 'react';
import {useCreateApplication} from '@/hooks/useApplication';
import toast from 'react-hot-toast';
import {useAuth} from "@/context/AuthContext.jsx";
import {FileText, Image, File, X, Upload, Paperclip} from 'lucide-react';

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
    const fileInputRef = useRef(null);
    
    const [files, setFiles] = useState([]);
    const [filesPreviews, setFilesPreviews] = useState([]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const getFileIcon = (mimeType) => {
        if (mimeType.startsWith('image/')) return <Image size={24} />;
        if (mimeType.includes('pdf')) return <FileText size={24} />;
        if (mimeType.includes('word') || mimeType.includes('doc')) return <FileText size={24} />;
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileText size={24} />;
        return <File size={24} />;
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
        
        const newPreviews = selectedFiles.map(file => {
            if (file.type.startsWith('image/')) {
                return {
                    type: 'image',
                    file,
                    preview: URL.createObjectURL(file),
                    name: file.name,
                    size: (file.size / 1024).toFixed(2)
                };
            } else {
                return {
                    type: 'file',
                    file,
                    icon: getFileIcon(file.type),
                    name: file.name,
                    size: (file.size / 1024).toFixed(2)
                };
            }
        });
        
        setFilesPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        setFilesPreviews(prev => prev.filter((_, i) => i !== index));
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formDataToSubmit = new FormData();
        formDataToSubmit.append('name', formData.name);
        formDataToSubmit.append('email', formData.email);
        formDataToSubmit.append('studentID', formData.studentID);
        formDataToSubmit.append('reason', formData.reason);
        formDataToSubmit.append('content', formData.content);
        formDataToSubmit.append('rollNo', formData.rollNo);
        
        files.forEach(file => {
            formDataToSubmit.append('files', file);
        });
        
        createApplication.mutate(formDataToSubmit, {
            onSuccess: () => {
                toast.success('Application submitted successfully');
                setFormData({
                    ...formData,
                    reason: '',
                    content: '',
                });
                setShowPreview(false);
                setFiles([]);
                setFilesPreviews([]);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to submit application');
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
                                className="input input-bordered w-full bg-base-100 dark:bg-base-100 cursor-not-allowed"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                readOnly
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Email Address</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="input input-bordered w-full bg-base-100 dark:bg-base-100 cursor-not-allowed"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                readOnly
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
                                className="input input-bordered w-full bg-base-100 dark:bg-base-100 cursor-not-allowed"
                                value={formData.rollNo}
                                onChange={handleChange}
                                required
                                readOnly
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
                    
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Supporting Documents</span>
                            <span className="label-text-alt text-gray-500">Optional (Max 5 files, 10MB each)</span>
                        </label>
                        
                        <div className="flex items-center justify-center w-full">
                            <label 
                                htmlFor="file-upload" 
                                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-base-100 dark:bg-base-100 border-gray-300 dark:border-gray-600 hover:bg-base-200 dark:hover:bg-base-300"
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-3 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Images, PDFs, Word docs, Excel (Max 10MB)
                                    </p>
                                </div>
                                <input 
                                    id="file-upload" 
                                    ref={fileInputRef}
                                    type="file" 
                                    className="hidden" 
                                    multiple 
                                    onChange={handleFileChange}
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                />
                            </label>
                        </div>
                        
                        {filesPreviews.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="font-medium text-sm mb-2">Attached files:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {filesPreviews.map((file, index) => (
                                        <div 
                                            key={index} 
                                            className="flex items-center justify-between p-3 bg-base-100 dark:bg-base-100 rounded-lg border border-gray-200 dark:border-gray-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                {file.type === 'image' ? (
                                                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                                        <img 
                                                            src={file.preview} 
                                                            alt={file.name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex-shrink-0 text-blue-500">
                                                        {file.icon}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{file.size} KB</p>
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                className="p-1 rounded-full text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                                                onClick={() => removeFile(index)}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                            disabled={createApplication.isLoading}
                        >
                            {createApplication.isLoading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-base-100 dark:bg-base-100 p-8 rounded-lg shadow-md">
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
                    
                    <div className="mb-6 whitespace-pre-line">
                        <p className="mb-2 font-semibold">Content:</p>
                        <p className="border border-base-300 p-4 rounded min-h-[200px]">{formData.content}</p>
                    </div>
                    
                    {filesPreviews.length > 0 && (
                        <div className="mb-8">
                            <p className="mb-2 font-semibold">Attachments ({filesPreviews.length}):</p>
                            <div className="border border-base-300 p-4 rounded flex flex-wrap gap-3">
                                {filesPreviews.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-base-200 p-2 rounded">
                                        <Paperclip size={16} />
                                        <span className="text-sm">{file.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
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
                            disabled={createApplication.isLoading}
                        >
                            {createApplication.isLoading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationForm;