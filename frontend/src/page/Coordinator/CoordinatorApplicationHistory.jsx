import { useHistoryofApplications, useClearCoordinatorApplicationHistory, useHideCoordinatorApplication } from '@/hooks/useApplication';
import { useAuth } from '@/context/AuthContext.jsx';
import { getStatusColor, getStatusDisplayText } from '@/utils/applicationStatusColors';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, Check, Square, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import StatusLegend from '@/components/StatusLegend';
import ApplicationStatusFilter from '@/components/ApplicationStatusFilter';

const CoordinatorApplicationHistory = () => {
    const { user } = useAuth();
    const { data: applications = [], isLoading, error } = useHistoryofApplications({ coordinator: user._id });
    const clearHistory = useClearCoordinatorApplicationHistory();
    const hideApplication = useHideCoordinatorApplication();
    const navigate = useNavigate();
    
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedApplications, setSelectedApplications] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');

    // Filter applications based on activeFilter
    const filteredApplications = applications.filter(app => 
        activeFilter === 'all' || app.applicationStatus === activeFilter
    );

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen">Error loading applications</div>;

    const handleClick = (id) => {
        if (selectionMode) return;
        navigate(`/applications/${id}`);
    };
    
    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear your processed applications history? This cannot be undone.')) {
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
    
    const handleDeleteApplication = (id, event) => {
        if (event) event.stopPropagation();
        
        if (window.confirm('Are you sure you want to remove this application from your history?')) {
            hideApplication.mutate(id, {
                onSuccess: () => {
                    toast.success('Application removed from your history');
                },
                onError: () => {
                    toast.error('Failed to remove application');
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
        <div className="p-3 sm:p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold uppercase">Applications I've Processed</h1>
                    <p className="text-gray-500 mb-2">
                        Showing applications that you have approved or rejected
                    </p>
                </div>
                
                {applications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
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
            
            {/* Application filters and legend */}
            {applications.length > 0 && (
                <div className="mb-6">
                    <ApplicationStatusFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                    <StatusLegend userRole="coordinator" />
                </div>
            )}
            
            {applications.length === 0 ? (
                <div className="text-center p-8 bg-base-200 rounded-lg">
                    <p className="text-gray-600">No processed applications yet.</p>
                </div>
            ) : filteredApplications.length === 0 ? (
                <div className="text-center p-8 bg-base-200 rounded-lg">
                    <p className="text-gray-600">No applications match the selected filter.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {filteredApplications.map((application) => (
                        <div 
                            key={application._id} 
                            className={`p-5 rounded-lg shadow-md border-l-4 ${getStatusColor(application.applicationStatus)} hover:shadow-lg transition-shadow relative`}
                            onClick={() => handleClick(application._id)}
                        >
                            {/* Selection button in selection mode */}
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
                            
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-semibold">{application.name}</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.applicationStatus)}`}>
                                    {getStatusDisplayText(application.applicationStatus)}
                                </span>
                            </div>
                            
                            <p className="text-sm text-gray-500 mb-2">Student: {application.studentID.name}</p>
                            <p className="text-sm text-gray-500 mb-2">Advisor: {application.advisor.name}</p>
                            <p className="text-sm text-gray-500 mb-4">Reason: {application.reason}</p>
                            
                            <div className="mb-4">
                                <p className="font-medium mb-1">Application Content:</p>
                                <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                                    {application.content.length > 150 
                                        ? `${application.content.substring(0, 150)}...` 
                                        : application.content
                                    }
                                </div>
                            </div>
                            
                            {application.coordinatorComments && (
                                <div className="mb-4">
                                    <p className="font-medium mb-1 text-yellow-700">Your Comment:</p>
                                    <div className="bg-yellow-50 p-3 rounded text-sm">
                                        {application.coordinatorComments}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-between">
                                <button 
                                    className="btn btn-sm btn-outline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClick(application._id);
                                    }}
                                    disabled={selectionMode}
                                >
                                    View Full Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoordinatorApplicationHistory;