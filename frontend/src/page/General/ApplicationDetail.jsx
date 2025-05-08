import {useParams, useNavigate, useLocation} from 'react-router-dom';
import React, {useState, useEffect, useRef, forwardRef} from 'react';
import {useApplication, useUpdateApplicationByStudent, useAddComment, useApplicationComments, useUpdateApplicationByAdvisor, useUpdateApplicationByCoordinator} from '@/hooks/useApplication';
import {getStatusColor, getStatusDisplayText} from '@/utils/applicationStatusColors';
import {motion} from 'framer-motion';
import {useAuth} from '@/context/AuthContext.jsx';
import toast from 'react-hot-toast';
import UserAvatar from '@/components/UserAvatar';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import MediaDisplay from '@/components/MediaDisplay';

// Create a dedicated printable component
const ApplicationPrintContent = forwardRef(({ application, formatDate }, ref) => {
  if (!application) return null;
  
  return (
    <div ref={ref} className="print-document">
      {/* University Header */}
      <div className="flex justify-between items-center border-b-2 border-primary pb-4 mb-6">
        <div className="flex items-center justify-center w-full">
          <img src="/aulogo.png" alt="Air University Logo" className="h-16 mr-4" />
          <div>
            <h1 className="text-2xl font-bold text-primary">AIR UNIVERSITY MULTAN</h1>
            <p>Excellence in Education and Research</p>
          </div>
        </div>
      </div>
      
      <div className="text-right mb-6">
        <p className="font-medium">Date: {formatDate(new Date())}</p>
      </div>
      
      <div className="mb-6">
        <p><span className="font-semibold">To:</span> The Advisor/Coordinator</p>
        <p><span className="font-semibold">Subject:</span> {application.reason}</p>
      </div>
      
      <div className="mb-6">
        <p className="mb-1"><span className="font-semibold">Student Name:</span> {application.name}</p>
        <p className="mb-1"><span className="font-semibold">Roll Number:</span> {application.rollNo}</p>
        <p className="mb-1"><span className="font-semibold">Email:</span> {application.email}</p>
      </div>
      
      <div className="mb-10">
        <p className="mb-2 font-semibold">Content:</p>
        <div className="border border-base-300 p-4 rounded min-h-[200px] whitespace-pre-line">
          {application.content}
        </div>
      </div>
      
      <div className="mb-8">
        <p>Sincerely,</p>
        <p className="font-semibold">{application.name}</p>
        <p>Student</p>
      </div>
      
      {/* Application Processing Information - MOVED BEFORE SUPPORTING DOCUMENTS */}
      <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Application Processing:</h3>
        
        <div className="space-y-4">
          {application.applicationStatus === 'Pending' ? (
            <div className="p-3 rounded border">
              <p className="font-medium">Application is pending review by advisor.</p>
            </div>
          ) : application.applicationStatus === 'Forward to Coordinator' || 
             application.applicationStatus === 'Approved by Coordinator' || 
             application.applicationStatus === 'Rejected' ? (
            <div className="p-3 rounded border">
              <p className="font-medium">Reviewed by Advisor: {application.advisor.name}</p>
              {application.signature && <p>Digitally signed on {formatDate(application.updatedAt || new Date())}</p>}
              
              {application.applicationStatus === 'Forward to Coordinator' && (
                <p className="mt-2">Forwarded to coordinator for final approval.</p>
              )}
              
              {application.applicationStatus === 'Approved by Coordinator' && (
                <div className="mt-2">
                  <p className="font-medium">Approved by Coordinator: {application.coordinator.name}</p>
                  <p>Final approval on {formatDate(application.updatedAt || new Date())}</p>
                </div>
              )}
              
              {application.applicationStatus === 'Rejected' && (
                <div className="mt-2">
                  <p className="font-medium">Application Rejected</p>
                  {application.coordinatorComments ? (
                    <p>Rejected by Coordinator: {application.coordinator.name}</p>
                  ) : (
                    <p>Rejected by Advisor: {application.advisor.name}</p>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Display media attachments if any - NOW AFTER APPLICATION PROCESSING */}
      {application.media && application.media.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Supporting Documents:</h3>
          <div className="grid grid-cols-1 gap-4">
            {application.media.map((mediaUrl, index) => {
              // Determine if it's an image by extension
              const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl);
              if (isImage) {
                return (
                  <div key={index} className="border p-2 rounded">
                    <img 
                      src={mediaUrl} 
                      alt={`Supporting document ${index + 1}`} 
                      className="max-w-full h-auto max-h-[200px] object-contain mx-auto"
                    />
                    <p className="text-center mt-2 text-sm">Document {index + 1}</p>
                  </div>
                );
              } else {
                return (
                  <div key={index} className="border p-4 rounded text-center">
                    <p>Attachment {index + 1}: {mediaUrl.split('/').pop()}</p>
                    <p className="text-sm mt-1">(Non-image document)</p>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}
      
      {/* Comments Section - Moved to the bottom */}
      {(application.advisorComments || application.coordinatorComments) && (
        <div className="mt-8 border-t pt-4 page-break-before">
          <h3 className="text-lg font-semibold mb-4">Official Comments:</h3>
          
          {application.advisorComments && (
            <div className="mb-4 p-3 rounded border">
              <p className="font-medium">Advisor Comment:</p>
              <p>{application.advisorComments}</p>
            </div>
          )}
          
          {application.coordinatorComments && (
            <div className="p-3 rounded border">
              <p className="font-medium">Coordinator Comment:</p>
              <p>{application.coordinatorComments}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Print footer */}
      <div className="mt-8 pt-4 text-center text-sm">
        <p>Air University Multan</p>
        <p>Printed on {formatDate(new Date())}</p>
      </div>
      
      {/* Add print styles to ensure proper printing */}
      <style type="text/css" media="print">{`
        @page { size: portrait; margin: 15mm; }
        .print-document { font-size: 12pt; }
        .page-break-before { page-break-before: always; }
        img { max-width: 100%; height: auto; }
        
        /* Remove any host information */
        a[href^="http://localhost"],
        a[href^="https://localhost"] {
          display: none !important;
        }
      `}</style>
    </div>
  );
});

const ApplicationDetail = () => {
    const {id} = useParams();
    const {data: application, isLoading, error} = useApplication(id);
    const {data: comments = [], isLoading: commentsLoading, error: commentsError, refetch: refetchComments} = useApplicationComments(id);
    const {user} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const contentRef = useRef(null);
    const printRef = useRef(null);
    
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
    
    // Updated print handler using latest API
    const handlePrint = useReactToPrint({
        contentRef: printRef, // Pass the ref directly in the options
        documentTitle: `Application_${application?._id || 'application'}`,
        onBeforePrint: () => {
            console.log("Preparing document for printing...");
            const loadingToast = toast.loading("Preparing document for printing...");
            return new Promise((resolve) => {
                setTimeout(() => {
                    toast.dismiss(loadingToast);
                    resolve();
                }, 1000);
            });
        },
        onAfterPrint: () => {
            console.log("Print completed or canceled");
            toast.success("Document sent to printer");
        },
        onPrintError: (errorLocation, error) => {
            console.error(`Print error at ${errorLocation}:`, error);
            toast.error("Failed to print. Please try downloading as PDF instead.");
        },
        pageStyle: `
            @page {
                size: A4 portrait;
                margin: 15mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                .print-document {
                    display: block !important;
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
                
                /* Hide all other content when printing */
                body > *:not(.print-document) {
                    display: none !important;
                }
            }
        `,
    });

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
                            className="btn btn-sm text-white flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-lime-400 hover:to-lime-500 transition-all duration-300"
                        >
                            <Printer size={16} />
                            Print
                        </button>
                    </div>
                )}
            </div>
            
            {/* Printable component hidden by default */}
            <div style={{ display: 'none' }}>
                <ApplicationPrintContent 
                    ref={printRef}
                    application={application}
                    formatDate={formatDate}
                />
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
                        <div className="flex items-center justify-center w-full">
                            <img src="/aulogo.png" alt="Air University Logo" className="h-16 mr-4" />
                            <div>
                                <h1 className="text-2xl font-bold text-primary">AIR UNIVERSITY MULTAN</h1>
                                <p className="text-base-content/70">Excellence in Education and Research</p>
                            </div>
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
                    
                    <div className="mb-8">
                        <p>Sincerely,</p>
                        <p className="font-semibold">{application.name}</p>
                        <p>Student</p>
                    </div>
                    
                    {/* Application Processing Information - MOVED BEFORE SUPPORTING DOCUMENTS */}
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
                    
                    {/* Display media attachments if any - NOW AFTER APPLICATION PROCESSING */}
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
                                Require Changes
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