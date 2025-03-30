import { useState, useEffect } from 'react';
import JobList from "../../components/JobListing.jsx";
import { useAuth } from '../../context/AuthContext.jsx';
import { useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash';
import { useJobs } from '../../hooks/useJobs.js';
import { useAnnouncementsFilter } from '../../hooks/useAnnouncementFilter.js';

const JobListings = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: sectionsData, isLoading: sectionsLoading } = useAnnouncementsFilter();
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'latest';
    const department = searchParams.get('department') || 'all';

    const { data, isLoading, isError, refetch } = useJobs({ page, limit, search, sort, department });

    useEffect(() => {
        refetch();
    }, [search, sort, page, limit, department]);

    const handleSearchChange = debounce((e) => {
        setSearchParams({ search: e.target.value, page: 1 });
    }, 1000);

    const handleSortChange = (e) => {
        setSearchParams({ sort: e.target.value, page: 1 });
    };

    const handleDepartmentChange = (e) => {
        setSearchParams({ department: e.target.value, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage });
    };

    return (
        <div className="min-h-screen mx-auto max-w-4xl w-full bg-base-100 p-4">
            <h2 className="text-2xl text-base-text font-bold mb-4">Job Listings</h2>
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search jobs..."
                    className="input input-bordered w-full max-w-xs"
                    onChange={handleSearchChange}
                />
                <select className="select select-bordered ml-4" onChange={handleSortChange} value={sort}>
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                </select>
                <select
                    className="select ml-4 select-bordered w-full"
                    value={department}
                    onChange={handleDepartmentChange}
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
            {isLoading ? (
                <p>Loading...</p>
            ) : isError ? (
                <p>Error loading jobs</p>
            ) : (
                <>
                    <JobList data={data.jobs} isLoading={isLoading} />
                    {
                        data.total > limit && (
                            <div className="flex justify-between items-center mt-4 mb-20">
                                <button
                                    className="btn btn-outline green-bg text-base-200"
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                >
                                    Previous page
                                </button>
                                <button
                                    className="btn btn-outline rounded-xl green-bg text-base-200"
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page * limit >= data.total}
                                >
                                    Next
                                </button>
                            </div>
                        )

                    }
                </>
            )}
        </div>
    );
};

export default JobListings;