import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';
import { useAuth } from '@/context/AuthContext';
import { useAnnouncements } from '@/hooks/useAnnouncement';
import { useAnnouncementsFilter } from '@/hooks/useAnnouncementFilter';
import { useBatchFilter } from '@/hooks/useBatch';
import AnnouncementList from '@/components/AnnouncementList';
import { ChevronLeft, ChevronRight, MessageSquare, Search } from 'lucide-react';

const HomePage = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: sectionsData, isLoading: sectionsLoading } = useAnnouncementsFilter();
    const { data: batchesData, isLoading: batchesLoading } = useBatchFilter();
    const [filteredBatches, setFilteredBatches] = useState([]);
    const navigate = useNavigate();
    
    // Get query parameters with defaults
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'latest';
    const section = searchParams.get('section') || 'all';
    const role = searchParams.get('role') || 'all';
    const batch = searchParams.get('batch') || '';
    
    const { data, isLoading, isError, refetch } = useAnnouncements({ 
        page, 
        limit, 
        search, 
        sort, 
        section, 
        role,
        batch
    });

    useEffect(() => {
        refetch();
    }, [search, sort, page, limit, section, role, batch, refetch]);

    const handleSearchChange = debounce((e) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('search', e.target.value);
            newParams.set('page', '1');
            return newParams;
        });
    }, 500);

    const handleSortChange = (e) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('sort', e.target.value);
            newParams.set('page', '1');
            return newParams;
        });
    };

    const handleSectionChange = (e) => {
        const newSection = e.target.value;
        
        // If coordinator is changing section, also clear the batch selection
        if (user.role === 'coordinator') {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set('section', newSection);
                newParams.set('batch', '');
                newParams.set('page', '1');
                return newParams;
            });
        } else {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set('section', newSection);
                newParams.set('page', '1');
                return newParams;
            });
        }
    };

    const handleRoleChange = (e) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('role', e.target.value);
            newParams.set('page', '1');
            return newParams;
        });
    };

    const handleBatchChange = (e) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('batch', e.target.value);
            newParams.set('page', '1');
            return newParams;
        });
    };

    const handlePageChange = (newPage) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', newPage.toString());
            return newParams;
        });
    };

    // Filter batches based on selected section for coordinators
    useEffect(() => {
        if (!batchesLoading && batchesData && batchesData.length > 0) {
            if (user.role === 'coordinator' && section && section !== 'all') {
                // Filter batches that start with the selected section
                const sectionPrefix = section.toLowerCase().split(' ')[0]; // Get first word of section
                const filtered = batchesData.filter(batch => 
                    batch.name.toLowerCase().includes(sectionPrefix)
                );
                setFilteredBatches(filtered);
                
                // If current selected batch doesn't match the section, clear it
                if (batch && !filtered.some(b => b.name === batch)) {
                    setSearchParams(prev => {
                        const newParams = new URLSearchParams(prev);
                        newParams.set('batch', '');
                        return newParams;
                    });
                }
            } else {
                // If no section filter or not coordinator, show all batches
                setFilteredBatches(batchesData);
            }
        }
    }, [section, batchesData, batchesLoading, user.role]);

    return (
        <div className="container px-4 py-8 mx-auto max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-500 to-emerald-600 inline-block text-transparent bg-clip-text">
                    Welcome, {user?.name || 'User'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Stay updated with the latest announcements and information
                </p>
            </div>

            <div className="bg-base-100 rounded-xl p-6 shadow-lg mb-8">
                <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search announcements..."
                            className="input input-bordered w-full pl-10 focus:ring-2 focus:ring-green-500"
                            onChange={handleSearchChange}
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-3 md:gap-4">
                        <div className="flex items-center">
                            <label className="mr-2 text-sm font-medium whitespace-nowrap">Sort by:</label>
                            <select
                                className="select select-bordered select-sm md:select-md"
                                value={sort}
                                onChange={handleSortChange}
                            >
                                <option value="latest">Latest</option>
                                <option value="oldest">Oldest</option>
                            </select>
                        </div>
                        
                        {/* Section Filter - Only visible to coordinators, teachers, and student affairs */}
                        {(user.role === 'coordinator' || user.role === 'teacher' || user.role === 'student-affairs') && (
                            <div className="flex items-center">
                                <label className="mr-2 text-sm font-medium whitespace-nowrap">Section:</label>
                                <select
                                    className="select select-bordered select-sm md:select-md"
                                    value={section}
                                    onChange={handleSectionChange}
                                >
                                    <option value="all">All</option>
                                    {sectionsLoading ? (
                                        <option>Loading...</option>
                                    ) : (
                                        sectionsData.map((section) => (
                                            <option key={section._id} value={section.section}>
                                                {section.section}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        )}

                        {/* Role Filter - Only visible to students */}
                        {user.role === 'student' && (
                            <div className="flex items-center">
                                <label className="mr-2 text-sm font-medium whitespace-nowrap">Role:</label>
                                <select
                                    className="select select-bordered select-sm md:select-md"
                                    value={role}
                                    onChange={handleRoleChange}
                                >
                                    <option value="all">All</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="coordinator">Coordinator</option>
                                </select>
                            </div>
                        )}
                        
                        {/* Batch Filter - Only visible to coordinators, teachers, and student affairs */}
                        {(user.role === 'coordinator' || user.role === 'teacher' || user.role === 'student-affairs') && (
                            <div className="flex items-center">
                                <label className="mr-2 text-sm font-medium whitespace-nowrap">Batch:</label>
                                <select
                                    className="select select-bordered select-sm md:select-md"
                                    value={batch}
                                    onChange={handleBatchChange}
                                >
                                    <option value="">All Batches</option>
                                    {batchesLoading ? (
                                        <option>Loading...</option>
                                    ) : (
                                        filteredBatches?.map((batch) => (
                                            <option key={batch._id} value={batch.name}>
                                                {batch.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <MessageSquare className="mr-2" size={20} />
                    Announcements
                </h2>
                
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="loading loading-spinner loading-lg text-green-500"></div>
                    </div>
                ) : isError ? (
                    <div className="text-center py-10 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-red-500">Error loading announcements. Please try again later.</p>
                    </div>
                ) : (
                    <AnnouncementList announcements={data.announcements} />
                )}
                
                {data && data.total > 0 && (
                    <div className="mt-8 flex justify-between items-center">
                        <button
                            className="btn btn-outline btn-sm md:btn-md flex items-center gap-2 hover:bg-green-500 hover:text-white hover:border-green-500"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        
                        <span className="text-sm">
                            Page {page} of {Math.ceil(data.total / limit)}
                        </span>
                        
                        <button
                            className="btn btn-outline btn-sm md:btn-md flex items-center gap-2 hover:bg-green-500 hover:text-white hover:border-green-500"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page * limit >= data.total}
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;