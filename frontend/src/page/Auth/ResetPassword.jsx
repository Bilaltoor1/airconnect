import { useState } from "react";
import { Lock, CheckCircle, Loader } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useResetPassword } from "../../hooks/useAuth.js";
import toast from "react-hot-toast";
import AuthHeader from "../../components/AuthHeader.jsx";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetComplete, setResetComplete] = useState(false);
    const [errors, setErrors] = useState({});
    const { token } = useParams();
    const navigate = useNavigate();
    
    const { mutate: resetPassword, isLoading } = useResetPassword();

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        if (!password || password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        resetPassword({ token, password }, {
            onSuccess: (message) => {
                setResetComplete(true);
                toast.success("Password has been reset successfully");
                // Redirect to login after 3 seconds
                setTimeout(() => navigate("/login"), 3000);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Failed to reset password");
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
                                    {resetComplete ? "Password Reset Complete" : "Reset Password"}
                                </h2>
                                <p className="text-center text-gray-500">
                                    {resetComplete 
                                        ? "Your password has been updated successfully" 
                                        : "Create a new password for your account"}
                                </p>
                            </div>

                            {!resetComplete ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700">New Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                            <input
                                                type="password"
                                                placeholder="New Password"
                                                className="w-full py-3.5 pl-11 bg-white rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-gray-800 shadow-sm transition-all duration-200"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                    </div>

                                    <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700">Confirm New Password</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                            <input
                                                type="password"
                                                placeholder="Confirm New Password"
                                                className="w-full py-3.5 pl-11 bg-white rounded-xl border border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-gray-800 shadow-sm transition-all duration-200"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            className="w-full py-4 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus:ring-4 focus:ring-green-500/20 focus:outline-none"
                                            type="submit"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 
                                                <div className="flex items-center justify-center">
                                                    <Loader className="w-5 h-5 animate-spin mr-2" />
                                                    <span>Resetting Password...</span>
                                                </div> : 
                                                "Reset Password"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6 text-center">
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-6">
                                        <div className="mb-3 flex justify-center">
                                            <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle className="text-green-600" size={24} />
                                            </div>
                                        </div>
                                        <p className="text-gray-700 mb-3">
                                            Your password has been reset successfully.
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            You will be redirected to the login page in a few seconds.
                                        </p>
                                    </div>
                                    
                                    <Link 
                                        to="/login" 
                                        className="flex items-center justify-center w-full py-3.5 px-4 bg-gray-50 text-gray-700 font-medium rounded-xl text-center hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
                                    >
                                        Login with your new password
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

export default ResetPassword;
