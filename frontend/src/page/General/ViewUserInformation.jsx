import { useEffect } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Briefcase, UserCheck } from 'lucide-react';

const ViewUser = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-100 to-base-200">
            <div className="w-full max-w-5xl bg-base-100 rounded-2xl shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="grid md:grid-cols-2 grid-cols-1">
                    {/* Content Section */}
                    <div className="p-6 md:p-10 bg-base-100">
                        <div className="mb-6 md:mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                                Your Profile
                            </h2>
                            <p className="text-center text-gray-500 dark:text-gray-400 text-sm md:text-base">Your personal information</p>
                        </div>

                        {/* Profile Image Display */}
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
                                                {user?.batchName}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {user.role === 'teacher' && (
                                <div className="transition-all duration-200">
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Discipline</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                        <div className="w-full py-2.5 md:py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 px-4 text-base-text text-sm md:text-base">
                                            {user.section}
                                        </div>
                                    </div>
                                </div>
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

                    {/* Image Section */}
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