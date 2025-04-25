import {useParams, useNavigate, useLocation} from 'react-router-dom';
import {useState, useEffect, useRef} from 'react';
import {useApplication, useUpdateApplicationByStudent, useAddComment, useApplicationComments, useUpdateApplicationByAdvisor, useUpdateApplicationByCoordinator} from '@/hooks/useApplication';
import {getStatusColor, getStatusDisplayText} from '@/utils/applicationStatusColors';
import {motion} from 'framer-motion';
import {useAuth} from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';
import UserAvatar from '@/components/UserAvatar';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import ApplicationDetails from '@/components/ApplicationDetails';
import MediaDisplay from '@/components/MediaDisplay';

const ApplicationDetail = () => {
    const {id} = useParams();
    const {data: application, isLoading, error} = useApplication(id);
    const {data: comments = [], isLoading: commentsLoading, error: commentsError, refetch: refetchComments} = useApplicationComments(id);
    const {user} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const contentRef = useRef(null);
    
    const updateApplication = useUpdateApplicationByStudent();
    const updateApplicationByAdvisor = useUpdateApplicationByAdvisor();
    const updateApplicationByCoordinator = useUpdateApplicationByCoordinator();
    const addComment = useAddComment();
    
    const [editMode, setEditMode] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [formData, setFormData] = useState({
        content: '',
        reason: ''
    });
    const [advisorComment, setAdvisorComment] = useState('');
    const [coordinatorComment, setCoordinatorComment] = useState('');
    
    // Initialize form data when application loads
    useEffect(() => {
        if (application && !formData.content) {
            setFormData({
                content: application.content,
                reason: application.reason
            });
        }
    }, [application]);
    
    // Check if user arrived from a notification
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('notification') === 'true') {
            toast.success('You have a new update on this application');
        }
    }, [location]);
    
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
    
    const handlePrint = useReactToPrint({
        content: () => contentRef.current,
        documentTitle: `Application_${application?._id || 'application'}`,
        onBeforeGetContent: () => {
            const loadingToast = toast.loading("Preparing document for printing...");
            return new Promise((resolve) => {
                setTimeout(() => {
                    toast.dismiss(loadingToast);
                    resolve();
                }, 1000);
            });
        },
        onPrintError: (error) => {
            console.error("Print error:", error);
            toast.error("Failed to print. Please try downloading as PDF instead.");
        },
        removeAfterPrint: true,
        pageStyle: `
            @media print {
                body * {
                    display: none !important;
                }
                .printable-content, .printable-content * {
                    display: block !important;
                    visibility: visible !important;
                }
                .printable-content {
                    position: static !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                    background: white !important;
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                    print-color-adjust: exact;
                }
                @page {
                    size: A4 portrait;
                    margin: 10mm;
                }
            }
        `,
    });
    
    const handleDownloadPDF = () => {
        const element = contentRef.current;
        if (!element) {
            toast.error("Content not ready for PDF generation");
            return;
        }
        
        const loadingToast = toast.loading("Generating PDF...");
        
        // Clone the element to avoid modifying the displayed content
        const clonedElement = element.cloneNode(true);
        
        // Apply some additional styling for better PDF output
        const elementStyles = window.getComputedStyle(element);
        clonedElement.style.width = '100%';
        clonedElement.style.padding = '20px';
        clonedElement.style.backgroundColor = elementStyles.backgroundColor || '#ffffff';
        
        const opt = {
            margin: [10, 10, 10, 10],
            filename: `Application_${application?._id || 'download'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                letterRendering: true,
                logging: false
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true 
            }
        };
        
        // Use promise-based approach for better error handling
        setTimeout(() => {
            html2pdf()
                .from(clonedElement)
                .set(opt)
                .outputPdf()
                .then(pdf => {
                    return html2pdf().from(clonedElement).set(opt).save();
                })
                .then(() => {
                    toast.dismiss(loadingToast);
                    toast.success("PDF downloaded successfully");
                })
                .catch(error => {
                    console.error("PDF generation error:", error);
                    toast.dismiss(loadingToast);
                    toast.error("Failed to download PDF. Try again or use Print instead.");
                });
        }, 300); // Small delay to ensure the UI is updated before PDF generation
    };
    
    const handleApproveByAdvisor = () => {
        updateApplicationByAdvisor.mutate({ 
            id: application._id, 
            data: { 
                signature: 'Digital Signature', 
                applicationStatus: 'Forward to Coordinator', 
                advisorComments: advisorComment || '' 
            } 
        }, {
            onSuccess: () => {
                toast.success('Application approved and forwarded to coordinator');
                setAdvisorComment('');
            },
            onError: () => {
                toast.error('Failed to approve application');
            }
        });
    };
    
    const handleRejectByAdvisor = () => {
        if (!advisorComment) {
            toast.error('Please provide a reason for rejection');
            return;
        }
        
        updateApplicationByAdvisor.mutate({ 
            id: application._id, 
            data: { 
                applicationStatus: 'Rejected', 
                advisorComments: advisorComment 
            } 
        }, {
            onSuccess: () => {
                toast.success('Application rejected with comments');
                setAdvisorComment('');
            },
            onError: () => {
                toast.error('Failed to reject application');
            }
        });
    };
    
    const handleRequestChangesByAdvisor = () => {
        if (!advisorComment) {
            toast.error('Please provide comments for requested changes');
            return;
        }
        
        updateApplicationByAdvisor.mutate({ 
            id: application._id, 
            data: { 
                applicationStatus: 'Pending', 
                advisorComments: advisorComment 
            } 
        }, {
            onSuccess: () => {
                toast.success('Change request sent to student');
                setAdvisorComment('');
            },
            onError: () => {
                toast.error('Failed to request changes');
            }
        });
    };
    
    const handleApproveByCoordinator = () => {
        updateApplicationByCoordinator.mutate({ 
            id: application._id, 
            data: { 
                applicationStatus: 'Approved by Coordinator', 
                coordinatorComments: coordinatorComment || '' 
            } 
        }, {
            onSuccess: () => {
                toast.success('Application approved successfully');
                setCoordinatorComment('');
            },
            onError: () => {
                toast.error('Failed to approve application');
            }
        });
    };
    
    const handleRejectByCoordinator = () => {
        if (!coordinatorComment) {
            toast.error('Please provide a reason for rejection');
            return;
        }
        
        updateApplicationByCoordinator.mutate({ 
            id: application._id, 
            data: { 
                applicationStatus: 'Rejected', 
                coordinatorComments: coordinatorComment 
            } 
        }, {
            onSuccess: () => {
                toast.success('Application rejected with comments');
                setCoordinatorComment('');
            },
            onError: () => {
                toast.error('Failed to reject application');
            }
        });
    };
    
    const canEdit = () => {
        if (!application || !user) return false;
        
        // Student can edit if:
        // 1. Application is pending OR has advisor comments
        // 2. AND the application is not rejected
        return user._id === application.studentID._id && 
            (application.applicationStatus === 'Pending' || application.advisorComments) &&
            application.applicationStatus !== 'Rejected';
    };
    
    const isAdvisor = () => {
        if (!application || !user) return false;
        return user._id === application.advisor._id;
    };
    
    const isCoordinator = () => {
        if (!user) return false;
        return user.role === 'coordinator';
    };
    
    const canTakeAction = () => {
        if (!application) return false;
        
        // Determine if current status allows action
        const status = application.applicationStatus;
        
        if (isAdvisor()) {
            // Advisor can only take action if application is Pending
            return status === 'Pending';
        } else if (isCoordinator()) {
            // Coordinator can only take action if application is Forward to Coordinator
            return status === 'Forward to Coordinator';
        }
        
        return false;
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
        <div className="max-w-6xl mx-auto py-8 px-4">
            {/* Back button at the top */}
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="btn btn-outline btn-sm flex items-center gap-1 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-transparent"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
                
                {/* Print/Download buttons for coordinators */}
                {isCoordinator() && (
                    <div className="flex gap-2">
                        <button 
                            onClick={handlePrint}
                            className="btn btn-sm btn-outline flex items-center gap-1 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-transparent"
                        >
                            <Printer size={16} />
                            Print
                        </button>
                        <button 
                            onClick={handleDownloadPDF}
                            className="btn btn-sm btn-outline flex items-center gap-1 hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-transparent"
                        >
                            <Download size={16} />
                            Download PDF
                        </button>
                    </div>
                )}
            </div>
            
            <h1 className="text-2xl font-bold mb-6">Application Details</h1>
            
            {/* Status Badge */}
            <div className="flex justify-center mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(application.applicationStatus)}`}>
                    Status: {getStatusDisplayText(application.applicationStatus)}
                </span>
            </div>
            
            {/* Application Content */}
            <div>
                <motion.div
                    ref={contentRef}
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                    className="bg-base-100 p-8 rounded-lg shadow-md border-l-4 border-base-300 printable-content"
                >
                    {/* University Header */}
                    <div className="flex justify-between items-center border-b-2 border-primary pb-4 mb-6">
                        <div className="text-center w-full">
                            <h1 className="text-2xl font-bold text-primary">AIR UNIVERSITY MULTAN</h1>
                            <p className="text-base-content/70">Excellence in Education and Research</p>
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
                                className="select select-sm border-base-300 ml-2"
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
                            <div className="border border-base-300 p-4 rounded min-h-[200px] whitespace-pre-line">{application.content}</div>
                        )}
                    </div>
                    
                    {/* Display media attachments if any */}
                    {application.media && application.media.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Supporting Documents</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {application.media.map((mediaUrl, index) => (
                                    <MediaDisplay key={index} media={mediaUrl} />
                                ))}
                            </div>
                        </div>
                    )}
                    
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
                            ) : application.applicationStatus === 'Forward to Coordinator' || application.applicationStatus === 'Approved by Coordinator' || application.applicationStatus === 'Rejected' ? (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                    <p className="font-medium">Reviewed by Advisor: {application.advisor.name}</p>
                                    {application.signature && <p className="text-sm mt-1">Digitally signed on {formatDate(application.updatedAt || new Date())}</p>}
                                    
                                    {application.applicationStatus === 'Forward to Coordinator' && (
                                        <p className="text-sm mt-2">Forwarded to coordinator for final approval.</p>
                                    )}
                                    
                                    {application.applicationStatus === 'Approved by Coordinator' && (
                                        <div className="mt-2">
                                            <p className="font-medium">Approved by Coordinator: {application.coordinator.name}</p>
                                            <p className="text-sm">Final approval on {formatDate(application.updatedAt || new Date())}</p>
                                        </div>
                                    )}
                                    
                                    {application.applicationStatus === 'Rejected' && (
                                        <div className="mt-2">
                                            <p className="font-medium text-red-700">Application Rejected</p>
                                            {application.coordinatorComments ? (
                                                <p className="text-sm">Rejected by Coordinator: {application.coordinator.name}</p>
                                            ) : (
                                                <p className="text-sm">Rejected by Advisor: {application.advisor.name}</p>
                                            )}
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
                </motion.div>
            </div>
            
            {/* Action Buttons for Advisor/Coordinator */}
            {canTakeAction() && (
                <div className="mt-6 border rounded-lg p-6 bg-base-100 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">
                        {isAdvisor() ? "Advisor Actions" : "Coordinator Actions"}
                    </h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">
                            {isAdvisor() ? "Advisor Comment" : "Coordinator Comment"}:
                        </label>
                        <textarea 
                            className="textarea textarea-bordered w-full"
                            placeholder="Add your comments here (required for rejection)..."
                            value={isAdvisor() ? advisorComment : coordinatorComment}
                            onChange={(e) => isAdvisor() ? setAdvisorComment(e.target.value) : setCoordinatorComment(e.target.value)}
                            rows={3}
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                        <button 
                            onClick={isAdvisor() ? handleRejectByAdvisor : handleRejectByCoordinator}
                            className="btn btn-error hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-transparent"
                        >
                            Reject Application
                        </button>
                        {isAdvisor() && (
                            <button 
                                onClick={handleRequestChangesByAdvisor}
                                className="btn btn-warning hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-transparent"
                            >
                                Request Changes
                            </button>
                        )}
                        <button 
                            onClick={isAdvisor() ? handleApproveByAdvisor : handleApproveByCoordinator}
                            className="btn btn-primary hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-transparent"
                        >
                            {isAdvisor() ? "Approve & Forward" : "Approve Application"}
                        </button>
                    </div>
                </div>
            )}
            
            {/* Action Buttons Disabled (after decision) */}
            {!canTakeAction() && (isAdvisor() || isCoordinator()) && application && 
             (application.applicationStatus === 'Approved by Coordinator' || 
              application.applicationStatus === 'Rejected' ||
              (isAdvisor() && application.applicationStatus === 'Forward to Coordinator')) && (
                <div className="mt-6 border rounded-lg p-6 bg-base-100 shadow-sm opacity-75">
                    <h3 className="text-lg font-semibold mb-4 text-gray-400">
                        {isAdvisor() ? "Advisor Actions" : "Coordinator Actions"}
                    </h3>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-400">
                            {isAdvisor() ? "Advisor Comment" : "Coordinator Comment"}:
                        </label>
                        <textarea 
                            className="textarea textarea-bordered w-full bg-gray-50"
                            placeholder="Add your comments here..."
                            disabled
                            rows={3}
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                        <button 
                            className="btn btn-error btn-disabled opacity-60"
                            disabled
                        >
                            Reject Application
                        </button>
                        <button 
                            className="btn btn-primary btn-disabled opacity-60"
                            disabled
                        >
                            {isAdvisor() ? "Approve & Forward" : "Approve Application"}
                        </button>
                    </div>
                </div>
            )}
            
            {/* Discussion Thread */}
            <div className="mt-8 border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Discussion Thread:</h3>
                
                {commentsError ? (
                    <p className="text-error">Error loading comments. Please try again later.</p>
                ) : commentsLoading ? (
                    <p>Loading comments...</p>
                ) : comments && comments.length > 0 ? (
                    <div className="space-y-4 mb-6">
                        {comments.map((comment, index) => (
                            <div key={index} className={`p-3 rounded-lg ${
                                comment.role === 'student' ? 'bg-base-200 border border-base-300' :
                                comment.role === 'advisor' ? 'bg-yellow-50 border border-yellow-200' :
                                comment.role === 'coordinator' ? 'bg-blue-50 border border-blue-200' :
                                ''
                            }`}>
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium">
                                        {comment.author?.name || 'Unknown User'} 
                                        <span className="text-xs text-gray-500 ml-2">({comment.role})</span>
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
                    <p className="text-gray-500">No comments yet. Start a discussion by adding a comment below.</p>
                )}
                
                {/* Comment Form - Only show if application hasn't been fully processed */}
                {(application.applicationStatus !== 'Approved by Coordinator' && 
                  application.applicationStatus !== 'Rejected' &&
                 !(isAdvisor() && application.applicationStatus === 'Forward to Coordinator')) && (
                    <div className="mt-6">
                        <form onSubmit={handleCommentSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Add Comment:</label>
                                <textarea 
                                    className="textarea textarea-bordered w-full"
                                    placeholder="Write your comment here..."
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="mt-2 text-right">
                                <button type="submit" className="btn btn-sm btn-primary hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-transparent">
                                    Post Comment
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex justify-end mt-8 pt-4 border-t">
                    {canEdit() && !editMode && (
                        <button 
                            onClick={() => setEditMode(true)}
                            className="btn btn-primary btn-sm hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-transparent"
                        >
                            Edit Application
                        </button>
                    )}
                    
                    {editMode && (
                        <div className="space-x-2">
                            <button 
                                onClick={() => setEditMode(false)}
                                className="btn btn-outline btn-sm hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-transparent"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdate}
                                className="btn btn-primary btn-sm hover:bg-gradient-to-r hover:from-green-500 hover:to-emerald-500 hover:text-white hover:border-transparent"
                            >
                                Update Application
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetail;