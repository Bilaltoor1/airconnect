import { useState } from "react";
import { Lock, Mail, User, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSignup } from "../../hooks/useAuth.js";
import toast from "react-hot-toast";
import AuthHeader from "../../components/AuthHeader.jsx";

const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [validationError, setValidationError] = useState("");
    const { mutate: signup, isLoading, error } = useSignup();
    const navigate = useNavigate();

    const roles = ["student", "teacher"];

    // Email validation patterns - FIXED to match backend patterns
    const studentEmailPattern = /^\d+@students\.au\.edu\.pk$/;
    const teacherEmailPattern = /^[a-zA-Z0-9._%+-]+@aumc\.edu\.pk$/;

    const validateEmail = () => {
        if (!role) {
            setValidationError("Please select a role first");
            return false;
        }

        if (role === "student" && !studentEmailPattern.test(email)) {
            setValidationError("Student email must follow the pattern: 213088@students.au.edu.pk");
            return false;
        }

        if (role === "teacher" && !teacherEmailPattern.test(email) && !studentEmailPattern.test(email)) {
            setValidationError("Teacher email must follow either pattern: name@aumc.edu.pk or 213088@students.au.edu.pk");
            return false;
        }

        setValidationError("");
        return true;
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        if (email) {
            // Clear validation error when role changes
            setValidationError("");
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (validationError && role) {
            // Re-validate when email changes if there was an error
            validateEmail();
        }
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        
        if (!validateEmail()) {
            return;
        }
        
        signup({ email, password, name, role }, {
            onSuccess: (response) => {
                if (response.role === 'student') {
                    // Redirect students to profile-setup instead of login
                    navigate("/profile-setup");
                } else if (response.role === 'teacher') {
                    toast.success("Your account needs admin approval. Please log in once approved.");
                    navigate("/login");
                } else {
                    toast.success("Your account needs admin approval. Please log in once approved.");
                    navigate("/login");
                }
            },
            onError: (error) => {
                console.log(error);
                toast.error(error.response?.data?.message || "Signup failed. Please try again.");
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 overflow-y-auto pb-12">
            <AuthHeader />
            
            {/* Main Content with padding top for fixed header */}
            <div className="pt-24 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
                        <div className="grid md:grid-cols-2 grid-cols-1">
                            {/* Form Section */}
                            <div className="p-8 md:p-10 bg-white">
                                <div className="mb-10">
                                    <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                                        Create Account
                                    </h2>
                                    <p className="text-center text-gray-500">Join our educational platform today</p>
                                </div>

                                <form onSubmit={handleSignUp} className="space-y-6">
                                    <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                className="w-full py-3.5 pl-11 bg-white rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-gray-800 shadow-sm transition-all duration-200"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Select Role</label>
                                        <div className="relative group">
                                            <select
                                                className="w-full py-3.5 pl-4 bg-white rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-gray-800 shadow-sm transition-all duration-200 appearance-none cursor-pointer"
                                                value={role}
                                                onChange={handleRoleChange}
                                                required
                                            >
                                                <option value="" disabled>Select a Role</option>
                                                {roles.map((role, index) => (
                                                    <option key={index} value={role}>{role}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                        </div>
                                        {role && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {role === "student" 
                                                    ? "Use email format: 213088@student.au.edu.pk" 
                                                    : "Use email format: name@aumc.edu.pk or 213088@student.au.edu.pk"}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                className={`w-full py-3.5 pl-11 bg-white rounded-xl border ${validationError ? 'border-red-500' : 'border-gray-200'} focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-gray-800 shadow-sm transition-all duration-200`}
                                                value={email}
                                                onChange={handleEmailChange}
                                                required
                                            />
                                        </div>
                                        {validationError && (
                                            <p className="text-red-500 text-sm mt-1">{validationError}</p>
                                        )}
                                    </div>
                                    
                                    <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                className="w-full py-3.5 pl-11 bg-white rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-gray-800 shadow-sm transition-all duration-200"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    {error && <p className="text-red-500 font-semibold">{error.message}</p>}

                                    <div className="pt-6 space-y-4">
                                        <button
                                            className="w-full py-4 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus:ring-4 focus:ring-green-500/20 focus:outline-none"
                                            type="submit"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 
                                                <div className="flex items-center justify-center">
                                                    <Loader className="w-5 h-5 animate-spin mr-2" />
                                                    <span>Creating account...</span>
                                                </div> : 
                                                "Sign Up"}
                                        </button>
                                        
                                        <p className="text-sm text-center">
                                            Already have an account?{" "}
                                            <Link to="/login" className="text-green-500 hover:text-green-700 font-medium hover:underline transition-colors">
                                                Login
                                            </Link>
                                        </p>
                                    </div>
                                </form>
                            </div>

                            {/* Image Section */}
                            <div className="hidden md:block relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=1000&auto=format&fit=crop" 
                                    alt="Education" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-10">
                                    <h3 className="text-white text-xl font-bold drop-shadow-lg">Start Your Learning Journey Today</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Purpose Section - Below Main Form */}
                    <div className="mt-12 mb-8">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-8">
                                <h2 className="text-3xl font-bold mb-6 text-center text-emerald-700">Join Our Academic Community</h2>
                                <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                                    The Air University Portal streamlines academic processes and enhances communication between students, faculty, and administration.
                                </p>
                                
                                <div className="grid md:grid-cols-3 gap-8 mt-10">
                                <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl shadow-sm border border-emerald-100 transform transition-transform hover:scale-105">
										<div className="h-14 w-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
												<path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.727 1.17 1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
											</svg>
										</div>
										<h4 className="text-xl font-semibold mb-2 text-gray-800">Students</h4>
										<p className="text-gray-600">submit applications, check announcements , explore jobs opportunity.</p>
									</div>
                                    
                                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl shadow-sm border border-emerald-100 transform transition-transform hover:scale-105">
                                        <div className="h-14 w-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                            </svg>
                                        </div>
                                        <h4 className="text-xl font-semibold mb-2 text-gray-800">Streamlined Communication</h4>
                                        <p className="text-gray-600">Enjoy direct messaging, announcements, and notifications for important updates.</p>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl shadow-sm border border-emerald-100 transform transition-transform hover:scale-105">
                                        <div className="h-14 w-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h4 className="text-xl font-semibold mb-2 text-gray-800">Administrative Processes</h4>
                                        <p className="text-gray-600">request approvals, and manage documentation digitally,manage user accounts, and oversee all campus operations from a central dashboard.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
