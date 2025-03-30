import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Check, X, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePendingTeachers, useVerifyTeacher } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { useQueryClient } from 'react-query';

const VerifyTeacherPage = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const queryClient = useQueryClient();
    
    // Use the hook with the correct endpoint
    const { data: pendingTeachers, isLoading, isError } = usePendingTeachers();
    const verifyTeacherMutation = useVerifyTeacher();
    
    // Make sure only coordinators can access this page
    if (user?.role !== 'coordinator') {
        return <Navigate to="/" replace />;
    }
    
    // Filter teachers based on search query
    const filteredTeachers = pendingTeachers?.filter(teacher => 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const handleApprove = (teacherId) => {
        verifyTeacherMutation.mutate(
            { teacherId, isApproved: true },
            {
                onSuccess: () => {
                    toast.success('Teacher approved successfully');
                    queryClient.invalidateQueries('pendingTeachers');
                },
                onError: (error) => {
                    toast.error(error.response?.data?.message || 'Failed to approve teacher');
                }
            }
        );
    };
    
    const handleReject = (teacherId) => {
        if (window.confirm('Are you sure you want to reject this teacher?')) {
            verifyTeacherMutation.mutate(
                { teacherId, isApproved: false },
                {
                    onSuccess: () => {
                        toast.success('Teacher rejected successfully');
                        queryClient.invalidateQueries('pendingTeachers');
                    },
                    onError: (error) => {
                        toast.error(error.response?.data?.message || 'Failed to reject teacher');
                    }
                }
            );
        }
    };
    
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Teacher Verification</h1>
            
            {/* Search bar */}
            <div className="relative mb-8">
                <input
                    type="text"
                    placeholder="Search teachers by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 pl-10 pr-4 bg-base-100 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                </div>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
            ) : isError ? (
                <div className="bg-red-100 p-4 rounded-lg flex items-center">
                    <AlertCircle className="text-red-500 mr-2" />
                    <p>Failed to load pending teachers. Please try again later.</p>
                </div>
            ) : filteredTeachers?.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No teachers pending verification.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTeachers?.map((teacher) => (
                                <tr key={teacher._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {teacher.profileImage ? (
                                                <img 
                                                    src={teacher.profileImage} 
                                                    alt={teacher.name} 
                                                    className="h-10 w-10 rounded-full mr-3 object-cover"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                    <span className="text-gray-500 font-semibold">
                                                        {teacher.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                                                <div className="text-xs text-gray-500">{teacher.section || 'No section assigned'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{teacher.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {new Date(teacher.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleApprove(teacher._id)}
                                                className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                                                title="Approve"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleReject(teacher._id)}
                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                title="Reject"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VerifyTeacherPage;
