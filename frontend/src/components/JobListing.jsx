import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useDeleteJob, useUpdateJob } from '../hooks/useJobs';
import { useState } from 'react';
import { Briefcase, Building, Link as LinkIcon, Edit2, Trash2, X, Save, Calendar, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImagePreviewModal from './ImagePreviewModal';

const JobList = ({ data = [], isLoading }) => {
    const { user } = useAuth();
    const deleteJobMutation = useDeleteJob();
    const updateJobMutation = useUpdateJob();
    const [editingJob, setEditingJob] = useState(null);
    const [jobData, setJobData] = useState({
        jobTitle: '',
        company: '',
        jobDescription: '',
        jobLink: '',
        jobType: 'on-site',
        jobTime: 'full-time'
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    
    const openImagePreview = (imageUrl) => {
        setSelectedImage(imageUrl);
        setPreviewOpen(true);
    };
    
    const closeImagePreview = () => {
        setPreviewOpen(false);
        setTimeout(() => setSelectedImage(null), 300);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this job listing?')) {
            deleteJobMutation.mutate(id, {
                onSuccess: () => {
                    toast.success('Job deleted successfully!');
                },
                onError: () => {
                    toast.error('Failed to delete job.');
                },
            });
        }
    };

    const handleEdit = (job) => {
        setEditingJob(job._id);
        setJobData({ 
            jobTitle: job.jobTitle, 
            company: job.company, 
            jobDescription: job.jobDescription, 
            jobLink: job.jobLink,
            jobType: job.jobType || 'on-site',
            jobTime: job.jobTime || 'full-time'
        });
    };
    
    const handleUpdate = () => {
        updateJobMutation.mutate({ id: editingJob, ...jobData }, {
            onSuccess: () => {
                toast.success('Job updated successfully!');
                setEditingJob(null);
            },
            onError: () => {
                toast.error('Failed to update job.');
            },
        });
    };

    const getJobTypeBadgeColor = (type) => {
        switch (type) {
            case 'remote':
                return 'badge-info';
            case 'hybrid':
                return 'badge-warning';
            default: // on-site
                return 'badge-success';
        }
    };
    
    const getJobTimeBadgeColor = (time) => {
        switch (time) {
            case 'part-time':
                return 'badge-warning';
            case 'contract':
                return 'badge-secondary';
            case 'internship':
                return 'badge-accent';
            default: // full-time
                return 'badge-primary';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Briefcase className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-500">No jobs available</h3>
                <p className="text-gray-400 mt-2">Check back later for new opportunities</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-6">
            {data?.map((job) => (
                <AnimatePresence key={job._id}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-base-100 border border-base-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        {editingJob === job._id ? (
                            <div className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Edit Job Listing</h3>
                                <div className="grid gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block text-base-content/80">Job Title</label>
                                        <input
                                            type="text"
                                            value={jobData.jobTitle}
                                            onChange={(e) => setJobData({ ...jobData, jobTitle: e.target.value })}
                                            placeholder="e.g. Frontend Developer"
                                            className="input input-bordered w-full"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium mb-1 block text-base-content/80">Company</label>
                                        <input
                                            type="text"
                                            value={jobData.company}
                                            onChange={(e) => setJobData({ ...jobData, company: e.target.value })}
                                            placeholder="e.g. Acme Inc."
                                            className="input input-bordered w-full"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium mb-1 block text-base-content/80">Job Type</label>
                                            <select
                                                value={jobData.jobType}
                                                onChange={(e) => setJobData({ ...jobData, jobType: e.target.value })}
                                                className="select select-bordered w-full"
                                            >
                                                <option value="on-site">On-site</option>
                                                <option value="remote">Remote</option>
                                                <option value="hybrid">Hybrid</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium mb-1 block text-base-content/80">Job Time</label>
                                            <select
                                                value={jobData.jobTime}
                                                onChange={(e) => setJobData({ ...jobData, jobTime: e.target.value })}
                                                className="select select-bordered w-full"
                                            >
                                                <option value="full-time">Full-time</option>
                                                <option value="part-time">Part-time</option>
                                                <option value="contract">Contract</option>
                                                <option value="internship">Internship</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium mb-1 block text-base-content/80">Description</label>
                                        <textarea
                                            value={jobData.jobDescription}
                                            onChange={(e) => setJobData({ ...jobData, jobDescription: e.target.value })}
                                            placeholder="Job description and requirements..."
                                            className="textarea textarea-bordered w-full"
                                            rows={4}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm font-medium mb-1 block text-base-content/80">Application Link</label>
                                        <input
                                            type="text"
                                            value={jobData.jobLink}
                                            onChange={(e) => setJobData({ ...jobData, jobLink: e.target.value })}
                                            placeholder="https://..."
                                            className="input input-bordered w-full"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end gap-2 mt-6">
                                    <button 
                                        className="btn btn-outline btn-sm"
                                        onClick={() => setEditingJob(null)}
                                    >
                                        <X size={16} /> Cancel
                                    </button>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={handleUpdate}
                                    >
                                        <Save size={16} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="p-6">
                                    <div className="flex">
                                        {/* Company logo/thumbnail */}
                                        <div 
                                            className="w-16 h-16 rounded-lg overflow-hidden bg-base-200 flex-shrink-0 mr-4 border border-base-300 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => job.thumbnail && openImagePreview(job.thumbnail)}
                                        >
                                            {job.thumbnail ? (
                                                <img 
                                                    src={job.thumbnail} 
                                                    alt={job.company}
                                                    className="w-full h-full object-cover" 
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-base-200">
                                                    <Building size={24} className="text-base-content/50" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Job details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-xl font-bold">{job.jobTitle}</h3>
                                                
                                                {/* Job badges */}
                                                <div className="flex gap-2">
                                                    {job.jobTime && (
                                                        <div className={`badge ${getJobTimeBadgeColor(job.jobTime)}`}>
                                                            {job.jobTime.replace('-', ' ')}
                                                        </div>
                                                    )}
                                                    {job.jobType && (
                                                        <div className={`badge ${getJobTypeBadgeColor(job.jobType)}`}>
                                                            {job.jobType}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-4 text-sm text-base-content/70 mt-1">
                                                <div className="flex items-center">
                                                    <Building size={14} className="mr-1" />
                                                    <span>{job.company}</span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <MapPin size={14} className="mr-1" />
                                                    <span>{job.jobType || 'On-site'}</span>
                                                </div>
                                                
                                                <div className="flex items-center">
                                                    <Clock size={14} className="mr-1" />
                                                    <span>{(job.jobTime || 'Full-time').replace('-', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Job description */}
                                    <div className="mt-4 text-base-content/80">
                                        <p className="line-clamp-3">{job.jobDescription}</p>
                                    </div>
                                </div>
                                
                                {/* Actions footer */}
                                <div className="px-6 py-4 bg-base-100 border-t border-base-200 flex justify-between items-center">
                                    <a 
                                        href={job.jobLink} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="btn btn-primary btn-sm"
                                    >
                                        <LinkIcon size={16} className="mr-1" /> Apply Now
                                    </a>
                                    
                                    {/* Only allow student-affairs role to edit and delete */}
                                    {user.role === 'student-affairs' && (
                                        <div className="flex space-x-2">
                                            <button 
                                                className="btn btn-outline btn-sm"
                                                onClick={() => handleEdit(job)}
                                            >
                                                <Edit2 size={16} /> Edit
                                            </button>
                                            <button
                                                className="btn btn-error btn-outline btn-sm"
                                                onClick={() => handleDelete(job._id)}
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            ))}
            
            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={previewOpen}
                onClose={closeImagePreview}
                imageUrl={selectedImage}
                altText="Job thumbnail"
            />
        </div>
    );
};

export default JobList;