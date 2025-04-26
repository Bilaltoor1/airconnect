import { useState } from 'react';
import { ImagePlus, Send, Briefcase, Link as LinkIcon, Building, FileText, X, MapPin, Clock } from 'lucide-react';
import toast from "react-hot-toast";
import { useAnnouncementsFilter } from "../../hooks/useAnnouncementFilter.js";
import { useAuth } from '../../context/AuthContext.jsx';
import { useCreateJob } from '../../hooks/useJobs.js';

const CreateJob = () => {
    const { user } = useAuth();
    const { mutate: createJob, isLoading } = useCreateJob();
    const { data: sectionsData, isLoading: sectionsLoading } = useAnnouncementsFilter();
    const [jobTitle, setJobTitle] = useState('');
    const [jobLink, setJobLink] = useState('');
    const [company, setCompany] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [thumbnail, setThumbnail] = useState(null);
    const [section, setSection] = useState(user.section || 'all');
    const [jobType, setJobType] = useState('on-site');
    const [jobTime, setJobTime] = useState('full-time');
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    
    const getFileIcon = (fileType) => {
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('doc')) return '📝';
        if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
        if (fileType.includes('video')) return '🎥';
        return '📁';
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
            if (file.type.includes('image')) {
                setThumbnailPreview({
                    type: 'image',
                    url: URL.createObjectURL(file),
                    name: file.name,
                    size: (file.size / 1024).toFixed(2)
                });
            } else {
                setThumbnailPreview({
                    type: 'file',
                    icon: getFileIcon(file.type),
                    name: file.name,
                    size: (file.size / 1024).toFixed(2)
                });
            }
        }
    };
    
    const removeImage = () => {
        setThumbnail(null);
        setThumbnailPreview(null);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields client-side first
        if (!jobTitle.trim() || !jobLink.trim() || !company.trim() || !jobDescription.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        // Create FormData object
        const formData = new FormData();
        formData.append('jobTitle', jobTitle.trim());
        formData.append('jobLink', jobLink.trim());
        formData.append('company', company.trim());
        formData.append('jobDescription', jobDescription.trim());
        formData.append('department', section);
        formData.append('jobType', jobType);
        formData.append('jobTime', jobTime);
        
        // Only append thumbnail if one is selected
        if (thumbnail) {
            formData.append('thumbnail', thumbnail);
        }
        
        // Debug log to verify data
        console.log("Submitting job with data:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }

        // Create a formDataObj to log what we're sending (for debugging)
        const formDataObj = {};
        formData.forEach((value, key) => {
            formDataObj[key] = value instanceof File ? value.name : value;
        });
        console.log('Form data as object:', formDataObj);
        
        createJob(formData, {
            onSuccess: () => {
                toast.success('Job Created Successfully');
                setJobTitle('');
                setJobLink('');
                setCompany('');
                setJobDescription('');
                setThumbnail(null);
                setThumbnailPreview(null);
                setSection(user.section || 'all');
                setJobType('on-site');
                setJobTime('full-time');
            },
            onError: (error) => {
                console.error('Error creating job:', error);
                
                // Enhanced error logging
                if (error.response) {
                    console.error('Response status:', error.response.status);
                    console.error('Response headers:', error.response.headers);
                    console.error('Response data:', error.response.data);
                } else if (error.request) {
                    console.error('Request was made but no response received', error.request);
                } else {
                    console.error('Error setting up request:', error.message);
                }
                
                const errorMessage = error.response?.data?.message || 
                                    (error.response?.status === 400 ? 'Invalid form data - check required fields' : 'Job not created');
                toast.error(errorMessage);
                
                // Additional error details for debugging
                if (error.response?.data) {
                    console.error('Server error details:', error.response.data);
                }
            }
        });
    };
    
    // Only allow student-affairs role to create jobs
    if (user.role !== 'student-affairs') {
        return null;
    }

    return (
        <div className="p-3 sm:p-6 max-w-6xl mx-auto">
            <div className="bg-base-100 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <Briefcase className="mr-2" />
                        Create New Job Opportunity
                    </h2>
                    <p className="text-green-100">Post a new job opening for students</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Job Title *
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="jobTitle"
                                        className="input input-bordered pl-10 w-full focus:ring-2 focus:ring-green-500"
                                        placeholder="Position Title"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Company Name *
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="company"
                                        className="input input-bordered pl-10 w-full focus:ring-2 focus:ring-green-500"
                                        placeholder="Company Name"
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="jobLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Application Link *
                                </label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        id="jobLink"
                                        className="input input-bordered pl-10 w-full focus:ring-2 focus:ring-green-500"
                                        placeholder="https://example.com/apply"
                                        value={jobLink}
                                        onChange={(e) => setJobLink(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="section" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Department/Section
                                </label>
                                <select
                                    id="section"
                                    className="select select-bordered w-full focus:ring-2 focus:ring-green-500"
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                >
                                    <option value="all">All Departments</option>
                                    {sectionsLoading ? (
                                        <option>Loading...</option>
                                    ) : (
                                        sectionsData.map((section) => (
                                            <option key={section._id} value={section.section}>
                                                {section.section}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        <MapPin size={16} className="inline mr-1" /> Job Type
                                    </label>
                                    <select
                                        id="jobType"
                                        className="select select-bordered w-full focus:ring-2 focus:ring-green-500"
                                        value={jobType}
                                        onChange={(e) => setJobType(e.target.value)}
                                    >
                                        <option value="on-site">On-site</option>
                                        <option value="remote">Remote</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label htmlFor="jobTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        <Clock size={16} className="inline mr-1" /> Job Time
                                    </label>
                                    <select
                                        id="jobTime"
                                        className="select select-bordered w-full focus:ring-2 focus:ring-green-500"
                                        value={jobTime}
                                        onChange={(e) => setJobTime(e.target.value)}
                                    >
                                        <option value="full-time">Full-time</option>
                                        <option value="part-time">Part-time</option>
                                        <option value="contract">Contract</option>
                                        <option value="internship">Internship</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Job Description *
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <textarea
                                        id="jobDescription"
                                        className="textarea textarea-bordered pl-10 w-full h-32 focus:ring-2 focus:ring-green-500"
                                        placeholder="Describe the job requirements, responsibilities, and qualifications..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Company Logo/Thumbnail
                                </label>
                                {thumbnailPreview ? (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex flex-col">
                                                {thumbnailPreview.type === 'image' ? (
                                                    <div className="h-32 mb-2 overflow-hidden rounded bg-gray-100 dark:bg-gray-900">
                                                        <img 
                                                            src={thumbnailPreview.url} 
                                                            alt={thumbnailPreview.name} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-32 mb-2 flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded">
                                                        <span className="text-4xl">{thumbnailPreview.icon}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between">
                                                    <div className="truncate flex-1">
                                                        <p className="text-xs font-medium truncate">{thumbnailPreview.name}</p>
                                                        <p className="text-xs text-gray-500">{thumbnailPreview.size} KB</p>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={removeImage}
                                                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                                                        aria-label="Remove file"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="btn btn-outline flex items-center gap-2 hover:bg-green-500 hover:text-white transition-colors">
                                        <ImagePlus size={18} />
                                        Select Company Logo
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button 
                            type="submit" 
                            className="btn bg-gradient-to-r from-green-500 to-emerald-600 border-0 text-white hover:from-green-600 hover:to-emerald-700 min-w-[150px]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Send size={18} className="mr-2" />
                                    Post Job
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJob;