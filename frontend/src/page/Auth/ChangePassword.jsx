import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useChangePassword } from '../../hooks/useAuth.js';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { Lock, Loader, ChevronLeft } from "lucide-react";

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, { message: "Current password is required" }),
    newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }),
    confirmNewPassword: z.string().min(6, { message: "Confirm new password must be at least 6 characters" }),
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
});

const ChangePassword = () => {
    const navigate = useNavigate();
    const { mutate: changePassword, isLoading } = useChangePassword();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = changePasswordSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = result.error.format();
            setErrors(fieldErrors);
            return;
        }

        changePassword(formData, {
            onSuccess: () => {
                toast.success('Password changed successfully');
                navigate('/');
            },
            onError: (error) => {
                toast.error('Failed to change password');
                console.error('Change password failed', error);
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-100 to-base-200">
            <div className="w-full max-w-5xl bg-base-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="grid md:grid-cols-2 grid-cols-1">
                    {/* Form Section */}
                    <div className="p-8 md:p-10 bg-base-100">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                                Change Password
                            </h2>
                            <p className="text-center text-gray-500 dark:text-gray-400">Update your password to keep your account secure</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Current Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        className="w-full py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-base-text shadow-sm transition-all duration-200"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.currentPassword && <p className="text-red-500 text-xs mt-1.5">{errors.currentPassword._errors[0]}</p>}
                            </div>
                            
                            <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className="w-full py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-base-text shadow-sm transition-all duration-200"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.newPassword && <p className="text-red-500 text-xs mt-1.5">{errors.newPassword._errors[0]}</p>}
                            </div>
                            
                            <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Confirm New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                    <input
                                        type="password"
                                        name="confirmNewPassword"
                                        className="w-full py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-base-text shadow-sm transition-all duration-200"
                                        value={formData.confirmNewPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                                {errors.confirmNewPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmNewPassword._errors[0]}</p>}
                            </div>
                            
                            <div className="pt-6 space-y-4">
                                <button 
                                    type="submit" 
                                    className="w-full py-4 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus:ring-4 focus:ring-green-500/20 focus:outline-none"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 
                                        <div className="flex items-center justify-center">
                                            <Loader className="w-5 h-5 animate-spin mr-2" />
                                            <span>Updating...</span>
                                        </div> : 
                                        "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Image Section */}
                    <div className="hidden md:block relative">
                        <img 
                            src="https://images.unsplash.com/photo-1618060932014-4deda4932554?q=80&w=2070&auto=format&fit=crop" 
                            alt="Security" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-10">
                            <h3 className="text-white text-xl font-bold drop-shadow-lg">Keep your account secure with a strong password</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;