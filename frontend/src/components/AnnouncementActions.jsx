import { useState, useEffect } from 'react';
import { useDeleteAnnouncement, useUpdateAnnouncement } from '../hooks/useAnnouncement';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { EllipsisIcon, Paperclip, MessageSquare, X, FileText, Trash2, Edit2, Save, Loader, Users } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { useAnnouncementsFilter } from "../hooks/useAnnouncementFilter.js";
import { useBatchFilter } from "../hooks/useAnnouncementFilter.js";

const AnnouncementActions = ({ announcement }) => {
    const { user } = useAuth();
    const { data: sectionsData, isLoading: sectionsLoading } = useAnnouncementsFilter();
    const { data: batchesData, isLoading: batchesLoading } = useBatchFilter();
    const [isEditing, setIsEditing] = useState(false);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [description, setDescription] = useState(announcement.description);
    const [section, setSection] = useState(announcement.section);
    const [batchId, setBatchId] = useState(announcement.batch || '');
    const [media, setMedia] = useState([]);
    const [filesPreviews, setFilesPreviews] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [teacherSections, setTeacherSections] = useState([]);
    const [filteredBatches, setFilteredBatches] = useState([]);

    const { mutate: deleteAnnouncement, isLoading: isDeleting } = useDeleteAnnouncement();
    const { mutate: updateAnnouncement, isLoading: isUpdating } = useUpdateAnnouncement();

    useEffect(() => {
        if (user.role === 'teacher' && batchesData && batchesData.length > 0) {
            const sections = new Set();
            if (user.section) {
                sections.add(user.section);
            }
            batchesData.forEach(batch => {
                const batchParts = batch.name.split('-');
                if (batchParts.length > 0) {
                    sections.add(batchParts[0]);
                }
            });
            setTeacherSections(Array.from(sections));
        }
    }, [batchesData, user.role, user.section]);

    useEffect(() => {
        if (!batchesLoading && batchesData && batchesData.length > 0) {
            if (user.role === 'coordinator' && section && section !== 'all') {
                const sectionPrefix = section.toLowerCase().split(' ')[0];
                const filtered = batchesData.filter(batch => 
                    batch.name.toLowerCase().includes(sectionPrefix)
                );
                setFilteredBatches(filtered);
            } else {
                setFilteredBatches(batchesData);
            }
        }
    }, [section, batchesData, batchesLoading, user.role]);

    const getFilteredSections = () => {
        if (!sectionsData) return [];
        if (user.role === 'coordinator') return sectionsData;
        if (user.role === 'teacher') {
            return sectionsData.filter(s => 
                s.section === 'all' || teacherSections.includes(s.section)
            );
        }
        return sectionsData;
    };

    useEffect(() => {
        if (announcement.media && announcement.media.length > 0) {
            const previews = announcement.media.map(mediaUrl => {
                const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl);
                return {
                    type: isImage ? 'image' : 'file',
                    url: mediaUrl,
                    name: mediaUrl.split('/').pop(),
                    size: 'Existing file',
                    isExisting: true,
                    fullUrl: mediaUrl
                };
            });
            setFilesPreviews(previews);
        }
    }, [announcement.media]);

    useEffect(() => {
        const editButton = document.getElementById(`edit-announcement-${announcement._id}`);
        const deleteButton = document.getElementById(`delete-announcement-${announcement._id}`);
        
        if (editButton) {
            editButton.addEventListener('click', () => {
                setIsEditing(true);
                setIsPopupVisible(true);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', handleDelete);
        }
        
        return () => {
            if (editButton) {
                editButton.removeEventListener('click', () => {
                    setIsEditing(true);
                    setIsPopupVisible(true);
                });
            }
            
            if (deleteButton) {
                deleteButton.removeEventListener('click', handleDelete);
            }
        };
    }, [announcement._id]);

    const handleDelete = () => {
        setIsDropdownVisible(false);
        setIsPopupVisible(true);
        deleteAnnouncement(announcement._id, {
            onSuccess: () => {
                toast.success('Announcement deleted successfully');
                setIsPopupVisible(false);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete announcement');
                setIsPopupVisible(false);
            }
        });
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('doc')) return '📝';
        if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
        if (fileType.includes('video')) return '🎥';
        return '📁';
    };

    const handleFileChange = (e) => {
        const fileList = Array.from(e.target.files);
        setMedia(e.target.files);
        
        const previews = fileList.map(file => {
            if (file.type.includes('image')) {
                return {
                    type: 'image',
                    url: URL.createObjectURL(file),
                    name: file.name,
                    size: (file.size / 1024).toFixed(2),
                    file: file
                };
            } else {
                return {
                    type: 'file',
                    icon: getFileIcon(file.type),
                    name: file.name,
                    size: (file.size / 1024).toFixed(2),
                    file: file
                };
            }
        });
        
        setFilesPreviews(prev => [...prev, ...previews]);
        setSelectedFiles(prev => [...prev, ...fileList.map(file => ({
            name: file.name,
            size: (file.size / 1024).toFixed(2)
        }))]);
    };

    const removeFile = (index) => {
        setFilesPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleEdit = (e) => {
        e.preventDefault();
        setIsDropdownVisible(false);
        
        const formData = new FormData();
        formData.append('description', description);
        formData.append('section', section);
        
        if (batchId) {
            formData.append('batchId', batchId);
        }
        
        filesPreviews.forEach(filePreview => {
            if (!filePreview.isExisting && filePreview.file) {
                formData.append('files', filePreview.file);
            }
        });
        
        const existingFiles = filesPreviews
            .filter(preview => preview.isExisting)
            .map(preview => preview.fullUrl);
            
        if (existingFiles.length > 0) {
            formData.append('existingMedia', JSON.stringify(existingFiles));
        }
        
        console.log('FormData contents:', {
            id: announcement._id,
            description, 
            section, 
            batchId,
            existingFiles: existingFiles.length
        });
        
        updateAnnouncement({ id: announcement._id, formData }, {
            onSuccess: () => {
                toast.success('Announcement updated successfully');
                setIsEditing(false);
                setIsPopupVisible(false);
            },
            onError: (error) => {
                const errorMessage = error.response?.data?.message || 
                                    error.response?.data?.error || 
                                    'Failed to update announcement. Network error.';
                
                toast.error(errorMessage);
                
                console.error('Update error details:', error);
                
                setIsEditing(true);
            }
        });
    };

    const confirmDelete = () => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            handleDelete();
        }
    };

    if (!['teacher', 'coordinator'].includes(user.role) || user._id !== announcement.user._id) {
        return null;
    }

    return (
        <div className="relative">
            <button 
                onClick={() => setIsDropdownVisible(!isDropdownVisible)} 
                className="p-2 rounded-full hover:bg-base-200 transition-colors duration-200"
                aria-label="Announcement actions"
            >
                <EllipsisIcon className="text-gray-600" />
            </button>
            
            {isDropdownVisible && (
                <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden z-10">
                    <button 
                        className="flex w-full items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        onClick={() => {
                            setIsEditing(true);
                            setIsPopupVisible(true);
                            setIsDropdownVisible(false);
                        }}
                    >
                        <Edit2 size={16} className="mr-2 text-green-500" />
                        <span>Edit Announcement</span>
                    </button>
                    <button 
                        className="flex w-full items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 text-red-500"
                        onClick={confirmDelete}
                    >
                        <Trash2 size={16} className="mr-2" />
                        <span>Delete Announcement</span>
                    </button>
                </div>
            )}
            
            {isPopupVisible && (
                <Dialog open={isPopupVisible} onClose={() => setIsPopupVisible(false)} className="relative z-50">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
                        <DialogPanel className="w-full max-w-2xl bg-base-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 dark:border-gray-800">
                            {isDeleting ? (
                                <div className="p-8 text-center">
                                    <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-green-500" />
                                    <h2 className="text-xl font-bold mb-2">Deleting Announcement</h2>
                                    <p className="text-gray-500">Please wait while we delete the announcement...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                                        <DialogTitle className="text-2xl font-bold text-white flex items-center">
                                            <MessageSquare className="mr-2" />
                                            Edit Announcement
                                        </DialogTitle>
                                        <Description className="text-green-100">
                                            Update the details of your announcement
                                        </Description>
                                    </div>
                                    
                                    <form onSubmit={handleEdit} className="p-6 space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                                                Announcement Content *
                                            </label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <textarea
                                                    className="w-full py-3.5 pl-10 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-base-text shadow-sm transition-all duration-200 min-h-[150px]"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                                                    Target Section
                                                </label>
                                                <div className="relative">
                                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                    <select
                                                        className="w-full py-3.5 pl-10 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-base-text shadow-sm transition-all duration-200 appearance-none cursor-pointer"
                                                        value={section}
                                                        onChange={(e) => setSection(e.target.value)}
                                                    >
                                                        <option value="all">All</option>
                                                        {sectionsLoading ? (
                                                            <option>Loading...</option>
                                                        ) : (
                                                            getFilteredSections().map((section) => (
                                                                <option key={section._id} value={section.section}>
                                                                    {section.section}
                                                                </option>
                                                            ))
                                                        )}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                                                    Target Batch
                                                </label>
                                                <div className="relative">
                                                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                    <select
                                                        className="w-full py-3.5 pl-10 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-base-text shadow-sm transition-all duration-200 appearance-none cursor-pointer"
                                                        value={batchId}
                                                        onChange={(e) => setBatchId(e.target.value)}
                                                    >
                                                        <option value="">Select a batch (optional)</option>
                                                        {batchesLoading ? (
                                                            <option>Loading batches...</option>
                                                        ) : (
                                                            filteredBatches?.map((batch) => (
                                                                <option key={batch._id} value={batch._id}>
                                                                    {batch.name}
                                                                </option>
                                                            ))
                                                        )}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {filesPreviews.length > 0 && (
                                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Attachments:
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {filesPreviews.map((file, index) => (
                                                        <div key={index} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm flex flex-col">
                                                            {file.type === 'image' ? (
                                                                <div className="h-32 mb-2 overflow-hidden rounded bg-gray-100 dark:bg-gray-900">
                                                                    <img 
                                                                        src={file.url} 
                                                                        alt={file.name} 
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="h-32 mb-2 flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded">
                                                                    <span className="text-4xl">{file.icon || '📁'}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center justify-between">
                                                                <div className="truncate flex-1">
                                                                    <p className="text-xs font-medium truncate">{file.name}</p>
                                                                    <p className="text-xs text-gray-500">{file.size} KB</p>
                                                                </div>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={() => removeFile(index)}
                                                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
                                                                    aria-label="Remove file"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
                                            <label className="py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 flex items-center gap-2 cursor-pointer">
                                                <Paperclip size={18} />
                                                {filesPreviews.length > 0 ? `Add More (${filesPreviews.length})` : "Attach Media"}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    multiple
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                            
                                            <div className="flex gap-3 ml-auto">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsPopupVisible(false)}
                                                    className="py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                                
                                                <button 
                                                    type="submit" 
                                                    className="py-2.5 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus:ring-4 focus:ring-green-500/20 focus:outline-none flex items-center gap-2"
                                                    disabled={isUpdating}
                                                >
                                                    {isUpdating ? (
                                                        <>
                                                            <Loader className="w-5 h-5 animate-spin" />
                                                            <span>Updating...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save size={18} />
                                                            <span>Update</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </>
                            )}
                        </DialogPanel>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default AnnouncementActions;