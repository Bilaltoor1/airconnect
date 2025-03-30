import {useParams, useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {useApplication, useUpdateApplicationByStudent, useAddComment, useApplicationComments} from '@/hooks/useApplication';
import {getStatusColor} from '@/utils/applicationStatusColors';
import {motion} from 'framer-motion';
import {useAuth} from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';

const ApplicationDetail = () => {
    const {id} = useParams();
    const {data: application, isLoading, error} = useApplication(id);
    const {data: comments = [], isLoading: commentsLoading, error: commentsError, refetch: refetchComments} = useApplicationComments(id);
    const {user} = useAuth();
    const navigate = useNavigate();
    const updateApplication = useUpdateApplicationByStudent();
    const addComment = useAddComment();
    
    const [editMode, setEditMode] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [formData, setFormData] = useState({
        content: '',
        reason: ''
    });
    
    // Initialize form data when application loads
    useEffect(() => {
        if (application && !formData.content) {
            setFormData({
                content: application.content,
                reason: application.reason
            });
        }
    }, [application]);
    
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };
    
    const handleUpdate = (e) => {
        e.preventDefault();
        updateApplication.mutate({
            id: application._id,
            data: formData
        }, {
            onSuccess: () => {
                toast.success('Application updated successfully');
                setEditMode(false);
            },
            onError: () => {
                toast.error('Failed to update application');
            }
        });
    };
    
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        
        addComment.mutate({
            id: application._id,
            text: commentText
        }, {
            onSuccess: () => {
                toast.success('Comment added successfully');
                setCommentText('');
                refetchComments();
            },
            onError: (error) => {
                const errorMessage = error.response?.data?.message || 'Failed to add comment';
                toast.error(errorMessage);
                console.error('Comment error:', error);
            }
        });
    };
    
    const canEdit = () => {
        if (!application || !user) return false;
        
        // Student can edit if application is pending or has advisor comments
        return user._id === application.studentID._id && 
            (application.applicationStatus === 'Pending' || application.advisorComments);
    };
    
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="flex justify-center items-center h-screen">Error loading application details</div>;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-center mb-8">Application Details</h1>
            
            {/* Status Badge */}
            <div className="flex justify-center mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(application.applicationStatus)}`}>
                    Status: {application.applicationStatus}
                </span>
            </div>
            
            {/* Application Content */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5}}
                className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                
                {/* University Header */}
                <div className="flex justify-between items-center border-b-2 border-blue-800 pb-4 mb-6">
                    <div className="text-center w-full">
                        <h1 className="text-2xl font-bold text-blue-800">AIR UNIVERSITY MULTAN</h1>
                        <p className="text-gray-600">Excellence in Education and Research</p>
                    </div>
                </div>
                
                <div className="text-right mb-6">
                    <p className="font-medium">Date: {formatDate(new Date())}</p>
                </div>
                
                <div className="mb-6">
                    <p><span className="font-semibold">To:</span> The Advisor/Coordinator</p>
                    <p><span className="font-semibold">Subject:</span> {editMode ? 
                        <select
                            name="reason"
                            className="select select-sm border-gray-300 ml-2"
                            value={formData.reason}
                            onChange={handleChange}
                        >
                            <option value="Leave of Absence">Leave of Absence</option>
                            <option value="Extension of Assignment Deadline">Extension of Assignment Deadline</option>
                            <option value="Request for Transcript">Request for Transcript</option>
                            <option value="Change of Course">Change of Course</option>
                            <option value="Financial Aid Request">Financial Aid Request</option>
                            <option value="Other">Other</option>
                        </select>
                        : application.reason}
                    </p>
                </div>
                
                <div className="mb-6">
                    <p className="mb-1"><span className="font-semibold">Student Name:</span> {application.name}</p>
                    <p className="mb-1"><span className="font-semibold">Roll Number:</span> {application.rollNo}</p>
                    <p className="mb-1"><span className="font-semibold">Email:</span> {application.email}</p>
                </div>
                
                <div className="mb-10">
                    <p className="mb-2 font-semibold">Content:</p>
                    {editMode ? (
                        <textarea
                            name="content"
                            className="textarea textarea-bordered w-full h-60"
                            value={formData.content}
                            onChange={handleChange}
                        />
                    ) : (
                        <div className="border p-4 rounded min-h-[200px] whitespace-pre-line">{application.content}</div>
                    )}
                </div>
                
                <div className="mb-8">
                    <p>Sincerely,</p>
                    <p className="font-semibold">{application.name}</p>
                    <p>Student</p>
                </div>
                
                {/* Application Processing Information */}
                <div className="mt-8 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Application Processing:</h3>
                    
                    <div className="space-y-4">
                        {application.applicationStatus === 'Pending' ? (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="font-medium">Application is pending review by advisor.</p>
                            </div>
                        ) : application.applicationStatus === 'Transit' || application.applicationStatus === 'Forwarded' || application.applicationStatus === 'Rejected' ? (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                <p className="font-medium">Reviewed by Advisor: {application.advisor.name}</p>
                                {application.signature && <p className="text-sm mt-1">Digitally signed on {formatDate(application.updatedAt || new Date())}</p>}
                                
                                {application.applicationStatus === 'Transit' && (
                                    <p className="text-sm mt-2">Forwarded to coordinator for final approval.</p>
                                )}
                                
                                {application.applicationStatus === 'Forwarded' && (
                                    <div className="mt-2">
                                        <p className="font-medium">Approved by Coordinator: {application.coordinator.name}</p>
                                        <p className="text-sm">Final approval on {formatDate(application.updatedAt || new Date())}</p>
                                    </div>
                                )}
                                
                                {application.applicationStatus === 'Rejected' && (
                                    <div className="mt-2">
                                        <p className="font-medium text-red-700">Application Rejected by Coordinator</p>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
                
                {/* Comments Section */}
                {(application.advisorComments || application.coordinatorComments) && (
                    <div className="mt-8 border-t pt-4">
                        <h3 className="text-lg font-semibold mb-4">Official Comments:</h3>
                        
                        {application.advisorComments && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="font-medium text-yellow-800">Advisor Comment:</p>
                                <p>{application.advisorComments}</p>
                            </div>
                        )}
                        
                        {application.coordinatorComments && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                <p className="font-medium text-blue-800">Coordinator Comment:</p>
                                <p>{application.coordinatorComments}</p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Discussion Thread */}
                <div className="mt-8 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Discussion Thread:</h3>
                    
                    {commentsError ? (
                        <p className="text-red-500">Error loading comments. Please try again later.</p>
                    ) : commentsLoading ? (
                        <p>Loading comments...</p>
                    ) : comments && comments.length > 0 ? (
                        <div className="space-y-4 mb-6">
                            {comments.map((comment, index) => (
                                <div key={index} className={`p-3 rounded-lg ${
                                    comment.role === 'student' ? 'bg-gray-50 border border-gray-200' :
                                    comment.role === 'advisor' ? 'bg-yellow-50 border border-yellow-200' :
                                    'bg-blue-50 border border-blue-200'
                                }`}>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-medium">
                                            {comment.author?.name || 'Unknown User'} 
                                            <span className="text-xs ml-2 text-gray-500">
                                                ({comment.role})
                                            </span>
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p>{comment.text}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic mb-6">No comments yet. Start the discussion!</p>
                    )}
                    
                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mt-4">
                        <div className="form-control">
                            <textarea
                                className="textarea textarea-bordered w-full"
                                rows="3"
                                placeholder="Add a comment or question..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mt-2 text-right">
                            <button type="submit" className="btn btn-sm btn-primary">
                                Post Comment
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-between mt-8 pt-4 border-t">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="btn btn-outline btn-sm"
                    >
                        Back
                    </button>
                    
                    {canEdit() && !editMode && (
                        <button 
                            onClick={() => setEditMode(true)}
                            className="btn btn-primary btn-sm"
                        >
                            Edit Application
                        </button>
                    )}
                    
                    {editMode && (
                        <div className="space-x-2">
                            <button 
                                onClick={() => setEditMode(false)}
                                className="btn btn-outline btn-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdate}
                                className="btn btn-primary btn-sm"
                            >
                                Update Application
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ApplicationDetail;