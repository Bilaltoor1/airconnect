import { useEffect, useState } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Briefcase, UserCheck, Users, RefreshCw } from 'lucide-react';
import axios from 'axios';

const ViewUser = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchCompleteUserData();
        }
    }, [user, navigate]);

    const fetchCompleteUserData = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const response = await axios.get('/api/auth/get-user', {
                withCredentials: true,
                params: { timestamp: new Date().getTime() }
            });

            if (response.data.user) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Failed to fetch complete user data:', error);
        } finally {
            setLoading(false);
        }
    };


    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
                <span className="ml-3 text-lg">Loading user data...</span>
            </div>
        );
    }

    const batchDataMissing = user.role === 'student' &&
        (!user.batchName || !user.advisor || !user.teachers);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-100 to-base-200">
            <div className="w-full max-w-5xl bg-base-100 rounded-2xl shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="grid md:grid-cols-2 grid-cols-1">
                    <div className="p-6 md:p-10 bg-base-100">
                        <div className="mb-6 md:mb-10 flex items-center justify-between">
                            <h2 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                                Your Profile
                            </h2>
                        </div>

                        {loading && !isRefreshing && (
                            <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10">
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500 mr-3"></div>
                                    <span>Loading profile details...</span>
                                </div>
                            </div>
                        )}

                        {user.profileImage && (
                            <div className="flex flex-col items-center mb-6 md:mb-8">
                                <div className="relative">
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex items-center justify-center border-2 border-green-500">
                                        <img
                                            src={user.profileImage}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {batchDataMissing && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-700 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle mr-2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                                    Batch details not fully loaded. Please click refresh to load complete data.
                                </p>
                            </div>
                        )}

                        <div className="space-y-4 md:space-y-6">
                            <div className="transition-all duration-200">
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <div className="w-full py-2.5 md:py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 px-4 text-base-text text-sm md:text-base">
                                        {user.name}
                                    </div>
                                </div>
                            </div>

                            <div className="transition-all duration-200">
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <div className="w-full py-2.5 md:py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 px-4 text-base-text text-sm md:text-base truncate">
                                        {user.email}
                                    </div>
                                </div>
                            </div>

                            {user.role === 'student' && (
                                <>
                                    <div className="transition-all duration-200">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Discipline</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <div className="w-full py-2.5 md:py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 px-4 text-base-text text-sm md:text-base">
                                                {user.section}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="transition-all duration-200">
                                            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Roll No</label>
                                            <div className="relative group">
                                                <UserCheck className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                                <div className="w-full py-2.5 md:py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 px-4 text-base-text text-sm md:text-base">
                                                    {user.rollNo}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="transition-all duration-200">
                                            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Batch</label>
                                            <div className="w-full py-2.5 md:py-3.5 px-4 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 text-base-text text-sm md:text-base">
                                                {user.batchName || (loading ? "Loading..." : "Not assigned")}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="transition-all duration-200">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Advisor Name</label>
                                        <div className="relative group">
                                            <Users className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <div className="w-full py-2.5 md:py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 px-4 text-base-text text-sm md:text-base">
                                                {user.advisor?.name || (loading ? "Loading..." : "No advisor assigned")}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="transition-all duration-200">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Teachers</label>
                                        <div className="relative group">
                                            <Users className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            {loading ? (
                                                <div className="w-full py-2.5 md:py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 px-4 text-gray-400 text-sm md:text-base">
                                                    Loading teacher information...
                                                </div>
                                            ) : user.teachers?.length > 0 ? (
                                                <div className="w-full py-2.5 md:py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 px-4 text-base-text text-sm md:text-base">
                                                    <div className="flex flex-wrap gap-2">
                                                        {user.teachers.map(teacher => (
                                                            <span key={teacher._id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                                                {teacher.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full py-2.5 md:py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 px-4 text-base-text text-sm md:text-base">
                                                    No teachers assigned
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {user.role === 'teacher' && (
                                <>
                                    <div className="transition-all duration-200">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Discipline</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <div className="w-full py-2.5 md:py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 px-4 text-base-text text-sm md:text-base">
                                                {user.section}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="transition-all duration-200">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Designation</label>
                                        <div className="relative group">
                                            <UserCheck className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <div className="w-full py-2.5 md:py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 px-4 text-base-text text-sm md:text-base">
                                                {user.designation || "Not specified"}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="pt-4 md:pt-6">
                                <Link
                                    to='/'
                                    className="flex items-center justify-center w-full py-2.5 md:py-3.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-xl text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 text-sm md:text-base"
                                >
                                    <ChevronLeft size={16} className="mr-1" />
                                    Back to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block relative">
                        <img
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-10">
                            <h3 className="text-white text-xl font-bold drop-shadow-lg">Your personal information</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewUser;