import { useState, useEffect } from 'react';
import { Paperclip, Send, MessageSquare, FileText, Users, X, FileType } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCreateAnnouncement } from '@/hooks/useAnnouncement.js';
import { useAnnouncementsFilter } from '@/hooks/useAnnouncementFilter.js';
import { useBatchFilter } from '@/hooks/useAnnouncementFilter.js';

const CreatePost = () => {
    const { user } = useAuth();
    const { mutate: createAnnouncement, isLoading } = useCreateAnnouncement();
    const { data: sectionsData, isLoading: sectionsLoading } = useAnnouncementsFilter();
    const { data: batchesData, isLoading: batchesLoading } = useBatchFilter();
    const [description, setDescription] = useState('');
    const [media, setMedia] = useState([]);
    const [section, setSection] = useState(user.section || 'all');
    const [batchId, setBatchId] = useState('');
    const [restrictToTeacherBatches, setRestrictToTeacherBatches] = useState(user.role === 'teacher');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filesPreviews, setFilesPreviews] = useState([]);
    const [teacherSections, setTeacherSections] = useState([]);
    const [filteredBatches, setFilteredBatches] = useState([]);

    // Extract teacher sections from batches
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

    const getFilteredSections = () => {
        if (!sectionsData) return [];
        if (user.role === 'coordinator') return sectionsData;
        if (user.role === 'teacher') {
            return sectionsData.filter(s => 
                teacherSections.includes(s.section)
            );
        }
        return sectionsData;
    };

    useEffect(() => {
        if (user.role === 'teacher') {
            if (user.section) {
                setSection(user.section);
            } else if (teacherSections.length > 0) {
                setSection(teacherSections[0]);
            } else {
                setSection('');
            }
        }
    }, [teacherSections, user.role, user.section]);

    useEffect(() => {
        if (!batchesLoading && batchesData) {
            if (section && section !== 'all') {
                const exactSectionMatches = batchesData.filter(batch => 
                    batch.section && batch.section === section
                );
                if (exactSectionMatches.length > 0) {
                    setFilteredBatches(exactSectionMatches);
                } else {
                    const sectionPrefix = section.toLowerCase().split(' ')[0];
                    const nameBasedMatches = batchesData.filter(batch => 
                        batch.name.toLowerCase().includes(sectionPrefix)
                    );
                    setFilteredBatches(nameBasedMatches);
                }
            } else {
                setFilteredBatches(batchesData);
            }
        }
    }, [section, batchesData, batchesLoading]);

    useEffect(() => {
        setBatchId('');
    }, [section]);

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
                    size: (file.size / 1024).toFixed(2)
                };
            } else {
                return {
                    type: 'file',
                    icon: getFileIcon(file.type),
                    name: file.name,
                    size: (file.size / 1024).toFixed(2)
                };
            }
        });
        setFilesPreviews(previews);
        setSelectedFiles(fileList.map(file => ({
            name: file.name,
            size: (file.size / 1024).toFixed(2)
        })));
    };

    const removeFile = (index) => {
        const newSelectedFiles = [...selectedFiles];
        newSelectedFiles.splice(index, 1);
        setSelectedFiles(newSelectedFiles);
        const newPreviews = [...filesPreviews];
        newPreviews.splice(index, 1);
        setFilesPreviews(newPreviews);
        const dataTransfer = new DataTransfer();
        Array.from(media).forEach((file, i) => {
            if (i !== index) {
                dataTransfer.items.add(file);
            }
        });
        setMedia(dataTransfer.files);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('description', description);
        formData.append('section', section);
        if (batchId) {
            formData.append('batchId', batchId);
        }
        if (user.role === 'teacher' && !batchId && restrictToTeacherBatches) {
            formData.append('restrictToTeacherBatches', 'true');
        }
        for (let i = 0; i < media.length; i++) {
            formData.append('files', media[i]);
        }

        createAnnouncement(formData, {
            onSuccess: () => {
                toast.success('Announcement Created Successfully');
                setDescription('');
                setMedia([]);
                setSelectedFiles([]);
                setFilesPreviews([]);
                setSection(user.section || 'all');
                setBatchId('');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Announcement not created');
            }
        });
    };

    if (user.role !== 'coordinator' && user.role !== 'teacher') {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto my-8 px-4">
            <div className="bg-base-100 rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <MessageSquare className="mr-2" />
                        Create Announcement
                    </h2>
                    <p className="text-green-100">Share important information with students and faculty</p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label htmlFor="announcement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Announcement Content *
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                            <textarea
                                id="announcement"
                                className="textarea textarea-bordered pl-10 w-full min-h-[150px] focus:ring-2 focus:ring-green-500"
                                placeholder="What would you like to announce?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="section" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Users size={18} className="inline mr-1" /> Target Section
                            </label>
                            <select
                                id="section"
                                className="select select-bordered w-full focus:ring-2 focus:ring-green-500"
                                value={section}
                                onChange={(e) => setSection(e.target.value)}
                                required
                            >
                                {user.role === 'coordinator' && <option value="all">All Sections</option>}
                                {user.role === 'teacher' && teacherSections.length === 0 && (
                                    <option value="" disabled>No sections available</option>
                                )}
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
                        </div>
                        
                        <div>
                            <label htmlFor="batch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Users size={18} className="inline mr-1" /> Target Batch
                            </label>
                            <select
                                id="batch"
                                className="select select-bordered w-full focus:ring-2 focus:ring-green-500"
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
                        </div>
                    </div>
                    
                    {user.role === 'teacher' && !batchId && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary mr-2"
                                    checked={restrictToTeacherBatches}
                                    onChange={(e) => setRestrictToTeacherBatches(e.target.checked)}
                                />
                                <span className="text-sm text-blue-700">
                                    Only show this announcement to students in batches I teach
                                </span>
                            </label>
                            <p className="text-xs text-blue-500 mt-1 ml-6">
                                When checked, this announcement will only be visible to students in your batches
                            </p>
                        </div>
                    )}
                    
                    {selectedFiles.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                                                <span className="text-4xl">{file.icon}</span>
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
                        <label className="btn btn-outline flex items-center gap-2 hover:bg-green-500 hover:text-white transition-colors">
                            <Paperclip size={18} />
                            {selectedFiles.length > 0 ? `Add More (${selectedFiles.length})` : "Attach Media"}
                            <input
                                type="file"
                                className="hidden"
                                multiple
                                onChange={handleFileChange}
                            />
                        </label>
                        
                        <button 
                            type="submit" 
                            className="btn bg-gradient-to-r from-green-500 to-emerald-600 border-0 text-white hover:from-green-600 hover:to-emerald-700 min-w-[180px]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm mr-2"></span>
                                    Posting...
                                </>
                            ) : (
                                <>
                                    <Send size={18} className="mr-2" />
                                    Post Announcement
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;