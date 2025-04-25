import React, { useState } from 'react';
import { format } from 'date-fns';
import { Paperclip, FileText, Image, File, Download, X, ZoomIn, ZoomOut, Maximize, ArrowLeft, ArrowRight } from 'lucide-react';

const ApplicationDetails = ({ application }) => {
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    
    if (!application) return <div>No application data</div>;
    
    const getFileIcon = (url) => {
        const extension = url.split('.').pop().toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
            return <Image size={20} className="text-blue-500" />;
        } else if (extension === 'pdf') {
            return <FileText size={20} className="text-red-500" />;
        } else if (['doc', 'docx'].includes(extension)) {
            return <FileText size={20} className="text-blue-700" />;
        } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
            return <FileText size={20} className="text-green-600" />;
        } else {
            return <File size={20} className="text-gray-500" />;
        }
    };
    
    const getFileName = (url) => {
        const parts = url.split('/');
        // Get the last part and remove any query params
        return parts[parts.length - 1].split('?')[0];
    };
    
    const isImage = (url) => {
        const extension = url.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
    };
    
    const openMediaPreview = (mediaUrl, index) => {
        setSelectedMedia(mediaUrl);
        setSelectedMediaIndex(index);
        setZoomLevel(1); // Reset zoom level when opening a new image
    };
    
    const closeMediaPreview = () => {
        setSelectedMedia(null);
        setZoomLevel(1);
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), 'PPP');
    };
    
    const handleDownload = (mediaUrl, event) => {
        event.stopPropagation(); // Prevent opening the preview
        
        // Create a temporary anchor element
        const anchor = document.createElement('a');
        anchor.href = mediaUrl;
        anchor.download = getFileName(mediaUrl); // Set the filename
        anchor.target = '_blank';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };

    const handleZoomIn = () => {
        setZoomLevel(prevZoom => Math.min(prevZoom + 0.25, 3)); // Limit max zoom to 3x
    };

    const handleZoomOut = () => {
        setZoomLevel(prevZoom => Math.max(prevZoom - 0.25, 0.5)); // Limit min zoom to 0.5x
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
    };

    const navigateMedia = (direction) => {
        if (!application.media || application.media.length <= 1) return;
        
        let newIndex;
        if (direction === 'next') {
            newIndex = (selectedMediaIndex + 1) % application.media.length;
        } else {
            newIndex = (selectedMediaIndex - 1 + application.media.length) % application.media.length;
        }
        
        setSelectedMediaIndex(newIndex);
        setSelectedMedia(application.media[newIndex]);
        setZoomLevel(1); // Reset zoom when changing images
    };
    
    return (
        <div className="bg-base-100 dark:bg-base-200 rounded-lg shadow p-6">
            <div className="border-b border-base-300 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-primary">{application.reason}</h2>
                <div className="flex flex-wrap gap-2 mt-2 text-sm">
                    <span className="px-3 py-1 bg-base-200 dark:bg-base-300 rounded-full">
                        Status: <span className={`font-semibold ${
                            application.applicationStatus === 'Approved by Coordinator' ? 'text-green-500' :
                            application.applicationStatus === 'Rejected' ? 'text-red-500' :
                            application.applicationStatus === 'Forward to Coordinator' ? 'text-yellow-500' :
                            'text-blue-500'
                        }`}>
                            {application.applicationStatus}
                        </span>
                    </span>
                    <span className="px-3 py-1 bg-base-200 dark:bg-base-300 rounded-full">
                        Submitted: {formatDate(application.createdAt)}
                    </span>
                </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3">Student Information</h3>
                    <div className="space-y-2">
                        <p><span className="font-medium">Name:</span> {application.name}</p>
                        <p><span className="font-medium">Roll No:</span> {application.rollNo}</p>
                        <p><span className="font-medium">Email:</span> {application.email}</p>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-3">Application Processing</h3>
                    <div className="space-y-2">
                        <p><span className="font-medium">Advisor:</span> {application.advisor?.name || 'Not assigned'}</p>
                        <p><span className="font-medium">Coordinator:</span> {application.coordinator?.name || 'Not assigned'}</p>
                    </div>
                </div>
            </div>
            
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Application Content</h3>
                <div className="p-4 bg-base-200 dark:bg-base-300 rounded-lg whitespace-pre-line">
                    {application.content}
                </div>
            </div>
            
            {application.media && application.media.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Attachments</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {application.media.map((mediaUrl, index) => (
                            <div 
                                key={index}
                                className="flex flex-col border border-base-300 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                                onClick={() => isImage(mediaUrl) ? openMediaPreview(mediaUrl, index) : window.open(mediaUrl, '_blank')}
                            >
                                {isImage(mediaUrl) ? (
                                    <div className="h-32 overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                                        <img 
                                            src={mediaUrl} 
                                            alt={`Attachment ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button 
                                                onClick={(e) => handleDownload(mediaUrl, e)}
                                                className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                                                title="Download file"
                                            >
                                                <Download size={16} className="text-gray-700" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 flex items-center justify-center bg-base-200 dark:bg-base-300 relative">
                                        {getFileIcon(mediaUrl)}
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button 
                                                onClick={(e) => handleDownload(mediaUrl, e)}
                                                className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors"
                                                title="Download file"
                                            >
                                                <Download size={16} className="text-gray-700" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="p-3 flex items-center justify-between bg-base-200 dark:bg-base-300">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Paperclip size={16} />
                                        <span className="text-sm truncate">{getFileName(mediaUrl)}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDownload(mediaUrl, e)}
                                        className="p-1.5 hover:bg-base-300 dark:hover:bg-base-400 rounded-full transition-colors"
                                        title="Download file"
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {application.advisorComments && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Advisor Comments</h3>
                    <div className="p-4 bg-base-200 dark:bg-base-300 rounded-lg">
                        {application.advisorComments}
                    </div>
                </div>
            )}
            
            {application.coordinatorComments && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Coordinator Comments</h3>
                    <div className="p-4 bg-base-200 dark:bg-base-300 rounded-lg">
                        {application.coordinatorComments}
                    </div>
                </div>
            )}
            
            {/* Enhanced Media Preview Modal */}
            {selectedMedia && application.media && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={closeMediaPreview}>
                    <div className="max-w-5xl w-full max-h-[90vh] relative" onClick={e => e.stopPropagation()}>
                        {/* Close button */}
                        <button 
                            className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all z-30"
                            onClick={closeMediaPreview}
                        >
                            <X size={24} />
                        </button>
                        
                        {/* Image container */}
                        <div className="flex items-center justify-center p-4 relative">
                            <img 
                                src={selectedMedia} 
                                alt="Media preview" 
                                className="max-w-full max-h-[80vh] object-contain transition-transform"
                                style={{ transform: `scale(${zoomLevel})` }}
                            />
                        </div>
                        
                        {/* Controls overlay */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 rounded-full px-4 py-2 flex items-center gap-3">
                            {/* Zoom controls */}
                            <button 
                                className="p-1.5 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                onClick={handleZoomOut}
                                title="Zoom out"
                            >
                                <ZoomOut size={20} />
                            </button>
                            <button 
                                className="p-1.5 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                onClick={handleResetZoom}
                                title="Reset zoom"
                            >
                                <Maximize size={20} />
                            </button>
                            <button 
                                className="p-1.5 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                onClick={handleZoomIn}
                                title="Zoom in"
                            >
                                <ZoomIn size={20} />
                            </button>
                            
                            {/* Separator */}
                            <div className="h-6 w-px bg-white bg-opacity-30 mx-1"></div>
                            
                            {/* Navigation controls (only shown if multiple images) */}
                            {application.media.length > 1 && (
                                <>
                                    <button 
                                        className="p-1.5 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                        onClick={() => navigateMedia('prev')}
                                        title="Previous image"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <span className="text-white text-sm">
                                        {selectedMediaIndex + 1} / {application.media.length}
                                    </span>
                                    <button 
                                        className="p-1.5 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                        onClick={() => navigateMedia('next')}
                                        title="Next image"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                    
                                    {/* Separator */}
                                    <div className="h-6 w-px bg-white bg-opacity-30 mx-1"></div>
                                </>
                            )}
                            
                            {/* Download button */}
                            <button 
                                className="p-1.5 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                onClick={(e) => handleDownload(selectedMedia, e)}
                                title="Download image"
                            >
                                <Download size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicationDetails;
