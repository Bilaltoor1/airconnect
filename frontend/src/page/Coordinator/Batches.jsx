import { Link } from 'react-router-dom';
import { useBatches } from '@/hooks/useBatch.js';
import { Users, UserPlus, School } from 'lucide-react';

const BatchesPage = () => {
    const { data: batches, isLoading, error } = useBatches();
    if (isLoading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                <p>Error loading batches. Please try again later.</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-bold mb-4 md:mb-0 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                    Batch Management
                </h1>
                <div className="flex flex-wrap gap-3">
                    <Link 
                        to="/add-advisor" 
                        className="flex items-center gap-2 py-2 px-4 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
                    >
                        <School size={18} />
                        Add Advisor
                    </Link>
                    <Link 
                        to="/add-teacher" 
                        className="flex items-center gap-2 py-2 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                        <Users size={18} />
                        Add Teacher
                    </Link>
                    <Link 
                        to="/add-student" 
                        className="flex items-center gap-2 py-2 px-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                    >
                        <UserPlus size={18} />
                        Add Student
                    </Link>
                </div>
            </div>
            
            {batches.length === 0 ? (
                <div className="bg-base-100 rounded-2xl shadow-xl p-10 text-center">
                    <School size={48} className="mx-auto mb-4 text-gray-400" />
                    <h2 className="text-xl font-bold mb-2">No Batches Found</h2>
                    <p className="text-gray-500 mb-6">Start by creating your first batch</p>
                    <Link 
                        to="/batch-management" 
                        className="py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        Create Batch
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {batches.map(batch => (
                        <Link 
                            key={batch._id} 
                            to={`/batches/${batch._id}`}
                            className="bg-base-100 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
                        >
                            <div className="h-20 bg-gradient-to-r from-green-400 to-emerald-500 p-6 flex items-center">
                                <h3 className="text-xl font-bold text-white">{batch.name}</h3>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Users size={20} className="text-blue-600" />
                                        <span className="font-medium">Teachers:</span>
                                        <span className="bg-blue-100 text-blue-800 text-xs font-medium py-1 px-2 rounded-full">
                                            {batch.teachers.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserPlus size={20} className="text-purple-600" />
                                        <span className="font-medium">Students:</span>
                                        <span className="bg-purple-100 text-purple-800 text-xs font-medium py-1 px-2 rounded-full">
                                            {batch.students.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {batch.advisor ? (
                                        <p>Advisor: <span className="font-medium text-gray-700">{batch.advisor.name}</span></p>
                                    ) : (
                                        <p>No advisor assigned</p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BatchesPage;