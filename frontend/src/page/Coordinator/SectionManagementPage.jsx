import { useState } from 'react';
import { 
    useCreateAnnouncementFilter, 
    useUpdateAnnouncementFilter, 
    useDeleteAnnouncementFilter, 
    useAllAnnouncementsFilter 
} from '@/hooks/useAnnouncementFilter';
import { Plus, PencilLine, Trash2, Flag } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const SectionManagementPage = () => {
    const { user } = useAuth();
    const { data: sections, isLoading, error } = useAllAnnouncementsFilter();
    const createSection = useCreateAnnouncementFilter();
    const updateSection = useUpdateAnnouncementFilter();
    const deleteSection = useDeleteAnnouncementFilter();
    const [sectionData, setSectionData] = useState({ section: '', id: '' });
    const [editingSectionId, setEditingSectionId] = useState(null);

    // Only coordinators can access this page
    if (user.role !== 'coordinator') {
        return <Navigate to="/" replace />;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSectionData({ ...sectionData, [name]: value });
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (!sectionData.section.trim()) return;
        
        createSection.mutate({ section: sectionData.section.trim() }, {
            onSuccess: () => {
                setSectionData({ section: '', id: '' });
            }
        });
    };

    const handleUpdate = (id) => {
        if (!sectionData.section.trim()) return;
        
        updateSection.mutate({ id, section: sectionData.section.trim() }, {
            onSuccess: () => {
                setEditingSectionId(null);
                setSectionData({ section: '', id: '' });
            }
        });
    };

    const handleRemove = (id) => {
        if(window.confirm("Are you sure you want to delete this section?")) {
            deleteSection.mutate(id);
        }
    };

    if (isLoading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                <p>Error loading sections. Please try again later.</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                Section Management
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-base-100 rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Create New Section</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Section Name</label>
                            <input
                                type="text"
                                name="section"
                                className="w-full py-3 bg-base-100 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 px-3"
                                placeholder="Enter section name (e.g., CSE, EEE)"
                                value={sectionData.section}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
                            disabled={createSection.isLoading}
                        >
                            {createSection.isLoading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    Create Section
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                <div className="bg-base-100 rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-xl shadow">
                            <h4 className="text-sm text-purple-800 font-medium">Total Sections</h4>
                            <p className="text-3xl font-bold text-purple-900">{sections?.length || 0}</p>
                        </div>
                        <div className="bg-gradient-to-r from-amber-100 to-amber-200 p-4 rounded-xl shadow">
                            <h4 className="text-sm text-amber-800 font-medium">Default Section</h4>
                            <p className="text-xl font-bold text-amber-900 truncate">all</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 bg-base-100 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Section List</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-base-200 dark:bg-base-300">
                            <tr className="text-xs font-medium uppercase tracking-wider">
                                <th className="px-6 py-3 rounded-tl-lg text-base-content/70">Section Name</th>
                                <th className="px-6 py-3 rounded-tr-lg text-base-content/70">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sections?.map((section, index) => (
                                <tr 
                                    key={section._id} 
                                    className={`text-sm ${index % 2 === 0 ? 'bg-base-200/50' : ''} hover:bg-base-200 transition-colors`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingSectionId === section._id ? (
                                            <input
                                                type="text"
                                                name="section"
                                                className="w-full py-2 bg-base-100 rounded-lg border border-green-500 focus:ring-2 focus:ring-green-500 px-3"
                                                value={sectionData.section}
                                                onChange={handleChange}
                                                required
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="flex items-center">
                                                <Flag size={16} className="mr-2 text-base-content/60" />
                                                <span className="font-medium text-base-content">{section.section}</span>
                                                {section.section === 'all' && (
                                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingSectionId === section._id ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdate(section._id)}
                                                    className="bg-green-500 text-white py-1 px-3 rounded-md text-sm hover:bg-green-600 transition-colors"
                                                    disabled={updateSection.isLoading}
                                                >
                                                    {updateSection.isLoading ? 'Saving...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingSectionId(null);
                                                        setSectionData({ section: '', id: '' });
                                                    }}
                                                    className="bg-gray-300 text-gray-700 py-1 px-3 rounded-md text-sm hover:bg-gray-400 transition-colors"
                                                    disabled={updateSection.isLoading}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingSectionId(section._id);
                                                        setSectionData({ id: section._id, section: section.section });
                                                    }}
                                                    className="text-amber-600 hover:text-amber-800 transition-colors"
                                                    disabled={section.section === 'all'} // Prevent editing the default section
                                                >
                                                    <PencilLine size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(section._id)}
                                                    className="text-red-600 hover:text-red-800 transition-colors"
                                                    disabled={section.section === 'all'} // Prevent deleting the default section
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!sections?.length && (
                        <div className="text-center py-10 text-gray-500">
                            No sections found. Create your first section above!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SectionManagementPage;
