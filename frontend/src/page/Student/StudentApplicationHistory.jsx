import { useHistoryofApplications } from '@/hooks/useApplication';
import { useAuth } from '@/context/AuthContext.jsx';
import { getStatusColor } from '@/utils/applicationStatusColors';
import { useNavigate } from 'react-router-dom';

const StudentApplicationHistory = () => {
    const { user } = useAuth();
    const { data: applications = [], isLoading, error } = useHistoryofApplications({ studentID: user._id });
    const navigate = useNavigate();

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen">Error loading applications</div>;

    const handleClick = (id) => {
        navigate(`/applications/${id}`);
    };

    return (
        <div className="mx-6 py-4">
            <h1 className="text-2xl font-bold uppercase">My Applications</h1>
            <ul className='mt-6 grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4'>
                {applications.map((application) => (
                    <li key={application._id}
                        className={`p-5 rounded-xl shadow-md hover:shadow-lg transition-shadow ${getStatusColor(application.applicationStatus)}`}>
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
                            
                            <div className="flex justify-between items-center">
                                <div>
                                    {application.applicationStatus === 'Transit' && (
                                        <span className="text-xs">Approved by: {application.advisor.name}</span>
                                    )}
                                </div>
                                <button 
                                    onClick={() => handleClick(application._id)}
                                    className="btn btn-xs btn-primary"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StudentApplicationHistory;