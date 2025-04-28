import { useState } from "react";
import { Mail, ArrowLeft, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../../hooks/useAuth.js";
import toast from "react-hot-toast";
import AuthHeader from "../../components/AuthHeader.jsx";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const { mutate: forgotPassword, isLoading } = useForgotPassword();

    const handleSubmit = (e) => {
        e.preventDefault();
        forgotPassword(email, {
            onSuccess: (message) => {
                setEmailSent(true);
                toast.success("Reset link sent to your email");
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Failed to send reset email");
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 overflow-y-auto pb-12">
            <AuthHeader />
            
            <div className="pt-24 px-4">
                <div className="max-w-xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100">
                        <div className="p-8 md:p-10 bg-white">
                            <div className="mb-10">
                                <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                                    Forgot Password
                                </h2>
                                <p className="text-center text-gray-500">
                                    {emailSent 
                                        ? "Check your email for password reset instructions" 
                                        : "Enter your email and we'll send you a reset link"}
                                </p>
                            </div>

                            {!emailSent ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                            <input
                                                type="email"
                                                placeholder="Enter your email address"
                                                className="w-full py-3.5 pl-11 bg-white rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-gray-800 shadow-sm transition-all duration-200"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 space-y-4">
                                        <button
                                            className="w-full py-4 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus:ring-4 focus:ring-green-500/20 focus:outline-none"
                                            type="submit"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 
                                                <div className="flex items-center justify-center">
                                                    <Loader className="w-5 h-5 animate-spin mr-2" />
                                                    <span>Sending...</span>
                                                </div> : 
                                                "Send Reset Link"}
                                        </button>
                                        
                                        <Link 
                                            to="/login" 
                                            className="flex items-center justify-center w-full py-3.5 px-4 bg-gray-50 text-gray-700 font-medium rounded-xl text-center hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
                                        >
                                            <ArrowLeft size={16} className="mr-2" />
                                            Back to Login
                                        </Link>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6 text-center">
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                                        <div className="mb-3 flex justify-center">
                                            <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center">
                                                <Mail className="text-green-600" size={24} />
                                            </div>
                                        </div>
                                        <p className="text-gray-700 mb-3">
                                            We've sent an email to <span className="font-medium">{email}</span> with instructions to reset your password.
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            If you don't see the email, check other places it might be, like your spam folder.
                                        </p>
                                    </div>
                                    
                                    <Link 
                                        to="/login" 
                                        className="flex items-center justify-center w-full py-3.5 px-4 bg-gray-50 text-gray-700 font-medium rounded-xl text-center hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
                                    >
                                        <ArrowLeft size={16} className="mr-2" />
                                        Return to Login
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
