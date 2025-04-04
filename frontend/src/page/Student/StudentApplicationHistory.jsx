import { useHistoryofApplications, useClearStudentApplicationHistory, useHideStudentApplication } from '@/hooks/useApplication';
import { useAuth } from '@/context/AuthContext.jsx';
import { getStatusColor } from '@/utils/applicationStatusColors';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, Check, Square, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const StudentApplicationHistory = () => {
    const { user } = useAuth();
    const { data: applications = [], isLoading, error } = useHistoryofApplications({ studentID: user._id });
    const clearHistory = useClearStudentApplicationHistory();
    const hideApplication = useHideStudentApplication();
    const navigate = useNavigate();
    
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedApplications, setSelectedApplications] = useState([]);

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen">Error loading applications</div>;

    const handleClick = (id) => {
        if (selectionMode) return;
        navigate(`/applications/${id}`);
    };
    
    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear your application history? This cannot be undone.')) {
            clearHistory.mutate(undefined, {
                onSuccess: (data) => {
                    toast.success(`Application history cleared. ${data.count} applications removed.`);
                },
                onError: () => {
                    toast.error('Failed to clear application history');
                }
            });
        }
    };
    
    const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
        setSelectedApplications([]);
    };
    
    const toggleApplicationSelection = (id, event) => {
        event.stopPropagation();
        
        if (selectedApplications.includes(id)) {
            setSelectedApplications(selectedApplications.filter(appId => appId !== id));
        } else {
            setSelectedApplications([...selectedApplications, id]);
        }
    };
    
    const deleteSelectedApplications = () => {
        if (selectedApplications.length === 0) {
            toast.error('No applications selected');
            return;
        }
        
        if (window.confirm(`Are you sure you want to delete ${selectedApplications.length} selected application(s)?`)) {
            const deletionPromises = selectedApplications.map(id => 
                new Promise((resolve, reject) => {
                    hideApplication.mutate(id, {
                        onSuccess: () => resolve(),
                        onError: () => reject()
                    });
                })
            );
            
            Promise.allSettled(deletionPromises)
                .then(results => {
                    const successful = results.filter(r => r.status === 'fulfilled').length;
                    
                    if (successful === selectedApplications.length) {
                        toast.success(`${successful} application(s) removed from your history`);
                    } else {
                        toast.success(`${successful} of ${selectedApplications.length} application(s) removed`);
                    }
                    
                    setSelectedApplications([]);
                    setSelectionMode(false);
                });
        }
    };

    return (
        <div className="mx-6 py-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold uppercase">My Applications</h1>
                
                {applications.length > 0 && (
                    <div className="flex gap-2">
                        {selectionMode ? (
                            <>
                                <button 
                                    onClick={toggleSelectionMode}
                                    className="btn btn-sm btn-outline"
                                >
                                    Cancel
                                </button>
                                
                                {selectedApplications.length > 0 && (
                                    <button 
                                        onClick={deleteSelectedApplications}
                                        className="btn btn-sm btn-error flex items-center gap-2"
                                    >
                                        <Trash2 size={16} />
                                        Delete Selected ({selectedApplications.length})
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={toggleSelectionMode}
                                    className="btn btn-sm btn-outline flex items-center gap-2"
                                >
                                    <Check size={16} />
                                    Select
                                </button>
                                
                                <button 
                                    onClick={handleClearHistory}
                                    className="btn btn-sm btn-error flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Clear History
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            
            {applications.length === 0 ? (
                <div className="text-center p-8 bg-base-200 rounded-lg">
                    <p className="text-base-content/70">No applications found.</p>
                </div>
            ) : (
                <ul className='mt-6 grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4'>
                    {applications.map((application) => (
                        <li key={application._id}
                            className={`p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow relative ${getStatusColor(application.applicationStatus)}`}
                            onClick={() => handleClick(application._id)}>
                            
                            {selectionMode && (
                                <button 
                                    className="absolute top-2 right-2 p-1 rounded-full bg-white/70 hover:bg-white text-gray-600 hover:text-primary transition-colors"
                                    onClick={(e) => toggleApplicationSelection(application._id, e)}
                                    title="Select this application"
                                >
                                    {selectedApplications.includes(application._id) ? 
                                        <CheckSquare size={18} className="text-primary" /> : 
                                        <Square size={18} />
                                    }
                                </button>
                            )}
                            
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-bold">{application.name}</h2>
                                    <span className="px-2 py-1 bg-white bg-opacity-30 rounded text-xs">
                                        {application.applicationStatus}
                                    </span>
                                </div>
                                <p className="text-sm mb-2">Reason: {application.reason}</p>
                                <p className="line-clamp-3 mb-3">{application.content}</p>
                                
                                {application.advisorComments && (
                                    <div className="flex items-center mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        <span className="text-xs">Advisor left a comment</span>
                                    </div>
                                )}
                                
                                {application.coordinatorComments && (
                                    <div className="flex items-center mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        <span className="text-xs">Coordinator left a comment</span>
                                    </div>
                                )}
                                
                                {application.comments && application.comments.length > 0 && (
                                    <div className="flex items-center mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                        <span className="text-xs">{application.comments.length} comment{application.comments.length !== 1 ? 's' : ''}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center mt-4">
                                    <div>
                                        {application.applicationStatus === 'Transit' && (
                                            <span className="text-xs">Approved by: {application.advisor.name}</span>
                                        )}
                                    </div>
                                    <button 
                                        className="btn btn-xs btn-primary flex items-center gap-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClick(application._id);
                                        }}
                                        disabled={selectionMode}
                                    >
                                        <ExternalLink size={12} />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default StudentApplicationHistory;