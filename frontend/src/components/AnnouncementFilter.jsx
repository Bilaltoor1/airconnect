import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useAnnouncementsFilter } from "@/hooks/useAnnouncementFilter";
import { useBatchFilter } from "@/hooks/useAnnouncementFilter";
import { useAuth } from '@/context/AuthContext';

const AnnouncementFilter = ({ filters, setFilters }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const { data: sections, isLoading: sectionsLoading } = useAnnouncementsFilter();
    const { data: batches, isLoading: batchesLoading } = useBatchFilter();
    const [selectedBatch, setSelectedBatch] = useState('');

    useEffect(() => {
        if (user.role === 'student' && batches?.length > 0) {
            if (batches.length === 1) {
                setFilters(prev => ({...prev, batch: batches[0].name}));
                setSelectedBatch(batches[0].name);
            }
        }
    }, [user, batches]);

    const toggleFilter = () => {
        setIsOpen(!isOpen);
    };

    const handleSearchChange = (e) => {
        setFilters({...filters, search: e.target.value});
    };

    const handleSectionChange = (e) => {
        setFilters({...filters, section: e.target.value});
    };

    const handleRoleChange = (e) => {
        setFilters({...filters, role: e.target.value});
    };

    const handleBatchChange = (e) => {
        setFilters({...filters, batch: e.target.value});
        setSelectedBatch(e.target.value);
    };

    const handleClearFilters = () => {
        setFilters({
            search: '',
            section: 'all',
            role: 'all',
            batch: ''
        });
        setSelectedBatch('');
    };

    return (
        <div className="w-full">
            <div className="relative mb-4">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search announcements..."
                    className="input input-bordered pl-10 w-full"
                    value={filters.search}
                    onChange={handleSearchChange}
                />
                <button
                    className="btn btn-sm btn-circle absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={toggleFilter}
                >
                    <Filter className="w-4 h-4" />
                </button>
            </div>

            {isOpen && (
                <div className="bg-base-200 p-4 rounded-lg mb-4 animate-fadeIn">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold">Filter Announcements</h3>
                        <button className="btn btn-sm btn-ghost" onClick={handleClearFilters}>
                            <X className="w-4 h-4 mr-1" /> Clear filters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Section filter - Only visible to coordinators, teachers, and student affairs */}
                        {(user.role === 'coordinator' || user.role === 'teacher' || user.role === 'student-affairs') && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Section</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={filters.section}
                                    onChange={handleSectionChange}
                                    disabled={sectionsLoading}
                                >
                                    <option value="all">All Sections</option>
                                    {!sectionsLoading && sections?.map((section) => (
                                        <option key={section._id} value={section.section}>
                                            {section.section}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Role filter - Only visible to students */}
                        {user.role === 'student' && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Posted By</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={filters.role}
                                    onChange={handleRoleChange}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="coordinator">Coordinator</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                        )}

                        {/* Batch filter - Only visible to coordinators, teachers, and student affairs */}
                        {(user.role === 'coordinator' || user.role === 'teacher' || user.role === 'student-affairs') && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Batch</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={filters.batch}
                                    onChange={handleBatchChange}
                                    disabled={batchesLoading}
                                >
                                    <option value="">All Batches</option>
                                    {!batchesLoading && batches?.map((batch) => (
                                        <option key={batch._id} value={batch.name}>
                                            {batch.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementFilter;
