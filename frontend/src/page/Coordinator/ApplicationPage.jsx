import { useApplications, useUpdateApplicationByCoordinator } from '@/hooks/useApplication';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { getStatusColor, getStatusDisplayText } from '@/utils/applicationStatusColors';
import { useNavigate } from 'react-router-dom';
import ApplicationStatusFilter from '@/components/ApplicationStatusFilter';

const CoordinatorApplicationPage = () => {
    const { data: applications = [], isLoading, error } = useApplications();
    const updateApplicationByCoordinator = useUpdateApplicationByCoordinator();
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [comment, setComment] = useState('');
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');

    // Filter applications based on activeFilter
    const filteredApplications = applications.filter(app => 
        activeFilter === 'all' || app.applicationStatus === activeFilter
    );

    const handleApprove = (applicationId) => {
        updateApplicationByCoordinator.mutate(
            { id: applicationId, data: { applicationStatus: 'Approved by Coordinator', coordinatorComments: comment || '' } },
            {
                onSuccess: () => {
                    toast.success('Application approved successfully');
                    setSelectedApplication(null);
                    setComment('');
                },
                onError: () => {
                    toast.error('Failed to approve application');
                }
            }
        );
    };

    const handleReject = (applicationId) => {
        if (!comment) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        updateApplicationByCoordinator.mutate(
            { id: applicationId, data: { applicationStatus: 'Rejected', coordinatorComments: comment } },
            {
                onSuccess: () => {
                    toast.success('Application rejected with comments');
                    setSelectedApplication(null);
                    setComment('');
                },
                onError: () => {
                    toast.error('Failed to reject application');
                }
            }
        );
    };

    const handleViewDetails = (id) => {
        navigate(`/applications/${id}`);
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen">Error loading applications</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Applications to Approve</h1>
            
            {applications.length > 0 && (
                <div className="mb-6">
                    <ApplicationStatusFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                </div>
            )}
            
            {applications.length > 0 ? (
                filteredApplications.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {filteredApplications.map((application) => (
                            <div 
                                key={application._id} 
                                className={`p-5 rounded-lg shadow-md border-l-4 ${getStatusColor(application.applicationStatus)} hover:shadow-lg transition-shadow`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-semibold">{application.name}</h2>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.applicationStatus)}`}>
                                        {getStatusDisplayText(application.applicationStatus)}
                                    </span>
                                </div>
                                
                                <p className="text-sm text-gray-500 mb-2">Roll No: {application.rollNo}</p>
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
                                
                                <div className="flex justify-between">
                                    <button 
                                        onClick={() => handleViewDetails(application._id)}
                                        className="btn btn-sm btn-outline"
                                    >
                                        View Full Details
                                    </button>
                                    
                                    {application.applicationStatus === 'Forward to Coordinator' && (
                                        <button 
                                            onClick={() => setSelectedApplication(application)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            Review
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">No applications match the selected filter.</p>
                    </div>
                )
            ) : (
                <div className="text-center p-8 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-medium text-gray-700">No applications to review</h3>
                    <p className="text-gray-500 mt-2">When advisors forward applications, they will appear here for review.</p>
                </div>
            )}
            
            {/* Review Modal */}
            {selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Review Application</h2>
                                <button onClick={() => setSelectedApplication(null)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-lg font-medium">{selectedApplication.name} ({selectedApplication.rollNo})</p>
                                <p className="text-gray-600 mb-2">Subject: {selectedApplication.reason}</p>
                                
                                <div className="bg-gray-50 border p-4 rounded mb-4 whitespace-pre-line">
                                    {selectedApplication.content}
                                </div>
                                
                                {selectedApplication.signature && (
                                    <p className="text-green-600 mb-2">
                                        <span className="font-medium">Advisor Approval:</span> Application signed by advisor
                                    </p>
                                )}
                            </div>
                            
                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Add Comments (required for rejection)
                                </label>
                                <textarea 
                                    className="w-full border rounded-lg p-3 h-32"
                                    placeholder="Add your comments here..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button 
                                    onClick={() => handleReject(selectedApplication._id)}
                                    className="btn btn-outline btn-error"
                                >
                                    Reject Application
                                </button>
                                <button 
                                    onClick={() => handleApprove(selectedApplication._id)}
                                    className="btn btn-primary"
                                >
                                    Approve Application
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoordinatorApplicationPage;