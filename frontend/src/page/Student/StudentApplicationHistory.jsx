import { useHistoryofApplications, useClearStudentApplicationHistory, useHideStudentApplication } from '@/hooks/useApplication';
import { useAuth } from '@/context/AuthContext.jsx';
import { getStatusColor, getStatusDisplayText } from '@/utils/applicationStatusColors';
import { useNavigate } from 'react-router-dom';
import { Trash2, ExternalLink, Check, Square, CheckSquare, ArrowDown, ArrowUp, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useMemo } from 'react';
import StatusLegend from '@/components/StatusLegend';
import ApplicationStatusFilter from '@/components/ApplicationStatusFilter';

const StudentApplicationHistory = () => {
    const { user } = useAuth();
    const [sortOrder, setSortOrder] = useState('newest'); // Default sorting is newest first
    const { data: applications = [], isLoading, error } = useHistoryofApplications({ 
        studentID: user._id,
        sort: sortOrder 
    });
    const clearHistory = useClearStudentApplicationHistory();
    const hideApplication = useHideStudentApplication();
    const navigate = useNavigate();
    
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedApplications, setSelectedApplications] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');

    // Sort applications by date (client-side fallback)
    const sortedApplications = useMemo(() => {
        if (!applications) return [];
        
        return [...applications].sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created);
            const dateB = new Date(b.createdAt || b.created);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }, [applications, sortOrder]);

    // Filter applications based on activeFilter
    const filteredApplications = useMemo(() => 
        sortedApplications.filter(app => 
            activeFilter === 'all' || app.applicationStatus === activeFilter
        ), 
    [sortedApplications, activeFilter]);

    const handleSortChange = (order) => {
        setSortOrder(order);
    };

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
        <div className="p-3 sm:p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold uppercase">My Applications</h1>
                </div>
                
                {applications.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {/* Sort Order Dropdown */}
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-sm btn-outline flex items-center gap-1">
                                <CalendarClock size={16} />
                                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                                {sortOrder === 'newest' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                            </div>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                <li><a onClick={() => handleSortChange('newest')} className={sortOrder === 'newest' ? 'active' : ''}>Newest First</a></li>
                                <li><a onClick={() => handleSortChange('oldest')} className={sortOrder === 'oldest' ? 'active' : ''}>Oldest First</a></li>
                            </ul>
                        </div>
                        
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
                    <StatusLegend userRole="student" />
                </div>
            )}
            
            {applications.length === 0 ? (
                <div className="text-center p-8 bg-base-200 rounded-lg">
                    <p className="text-base-content/70">No applications found.</p>
                </div>
            ) : filteredApplications.length === 0 ? (
                <div className="text-center p-8 bg-base-200 rounded-lg">
                    <p className="text-base-content/70">No applications match the selected filter.</p>
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
                            
                            {application.advisorComments && (
                                <div className="mb-4">
                                    <p className="font-medium mb-1 text-yellow-700">Advisor Comment:</p>
                                    <div className="bg-yellow-50 p-3 rounded text-sm">
                                        {application.advisorComments}
                                    </div>
                                </div>
                            )}
                            
                            {application.coordinatorComments && (
                                <div className="mb-4">
                                    <p className="font-medium mb-1 text-yellow-700">Coordinator Comment:</p>
                                    <div className="bg-yellow-50 p-3 rounded text-sm">
                                        {application.coordinatorComments}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex justify-between">
                                <div>
                                    {application.applicationStatus === 'Forward to Coordinator' && (
                                        <span className="text-xs text-gray-500">Approved by: {application.advisor.name}</span>
                                    )}
                                </div>
                                <button 
                                    className="btn btn-sm"
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

export default StudentApplicationHistory;