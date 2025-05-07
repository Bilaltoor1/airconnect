import { Dialog } from '@headlessui/react';
import { X, Building, Link as LinkIcon, MapPin, Clock, ExternalLink } from 'lucide-react';

const JobDetailModal = ({ job, isOpen, onClose }) => {
    if (!job) return null;

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-2xl bg-base-100 rounded-xl shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
                    <div className="relative">
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-base-200 z-10"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                        
                        {/* Image header with proper aspect ratio */}
                        <div className="h-48 w-full bg-base-200 flex-shrink-0">
                            {job.thumbnail ? (
                                <img 
                                    src={job.thumbnail} 
                                    alt={job.company} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Building size={48} className="text-base-content/30" />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Scrollable content area */}
                    <div className="overflow-y-auto flex-grow">
                        <div className="p-6">
                            {/* Job title and company */}
                            <div className="mb-4">
                                <h2 className="text-2xl font-bold">{job.jobTitle}</h2>
                                <div className="flex items-center mt-1">
                                    <Building size={16} className="mr-2 text-base-content/70" />
                                    <span className="text-lg">{job.company}</span>
                                </div>
                            </div>
                            
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {job.department && job.department !== 'all' && (
                                    <div className="badge badge-outline">{job.department}</div>
                                )}
                                {job.jobType && (
                                    <div className="badge badge-primary">{job.jobType}</div>
                                )}
                                {job.jobTime && (
                                    <div className="badge badge-secondary">{job.jobTime.replace('-', ' ')}</div>
                                )}
                            </div>
                            
                            {/* Job description */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-2">Job Description</h3>
                                <div className="prose max-w-none text-base-content/80 whitespace-pre-line">
                                    <p>{job.jobDescription}</p>
                                </div>
                            </div>
                            
                            {/* Apply button */}
                            <div className="flex justify-center">
                                <a
                                    href={job.jobLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary w-full max-w-xs"
                                >
                                    Apply Now <ExternalLink size={16} className="ml-1" />
                                </a>
                            </div>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default JobDetailModal;
