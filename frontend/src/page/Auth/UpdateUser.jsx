import { useState, useEffect, useRef } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { Link, useNavigate } from 'react-router-dom';
import { useUpdateUser } from "../../hooks/useAuth.js";
import { useAllAnnouncementsFilter } from "../../hooks/useAnnouncementFilter.js";
import { useBatches } from "../../hooks/useBatch.js";
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { Loader, User, Mail, Briefcase, UserCheck, ChevronLeft, Camera, Upload, X } from 'lucide-react';

const teacherSchema = z.object({
    section: z.string().min(1, { message: "Section is required" }),
});

const studentSchema = z.object({
    section: z.string().min(1, { message: "Section is required" }),
    rollNo: z.string().min(1, { message: "Roll No is required" }),
    batchId: z.string().min(1, { message: "Batch is required" }),
});

const UpdateUser = () => {
    const { user } = useAuth();
    const { mutate: updateUser, isLoading } = useUpdateUser();
    const navigate = useNavigate();
    const { data: sectionsData, isLoading: sectionsLoading } = useAllAnnouncementsFilter();
    const { data: batchesData, isLoading: batchesLoading } = useBatches();
    const fileInputRef = useRef(null);
    const [filteredBatches, setFilteredBatches] = useState([]);

    const [formData, setFormData] = useState({
        userId: user?._id || '',
        name: user?.name || '',
        email: user?.email || '',
        section: user?.section || '',
        rollNo: user?.rollNo || '',
        batchId: user?.batchId || ''
    });

    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(user?.profileImage || null);

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (!batchesLoading && batchesData) {
            if (formData.section) {
                const exactSectionMatches = batchesData.filter(batch => 
                    batch.section && batch.section === formData.section
                );
                
                if (exactSectionMatches.length > 0) {
                    setFilteredBatches(exactSectionMatches);
                } else {
                    const sectionPrefix = formData.section.toLowerCase().split(' ')[0];
                    const nameBasedMatches = batchesData.filter(batch => 
                        batch.name.toLowerCase().includes(sectionPrefix)
                    );
                    setFilteredBatches(nameBasedMatches);
                }
            } else {
                setFilteredBatches(batchesData);
            }
        }
    }, [formData.section, batchesData, batchesLoading]);

    useEffect(() => {
        if (formData.section !== user?.section) {
            setFormData(prev => ({ ...prev, batchId: '' }));
        }
    }, [formData.section, user?.section]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);

        setProfileImage(file);
        console.log('Profile image selected:', file.name, 'Size:', Math.round(file.size / 1024), 'KB');
    };

    const removeImage = () => {
        setProfileImage(null);
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formDataObj = new FormData();
        
        formDataObj.append('userId', user._id);
        formDataObj.append('name', formData.name);
        formDataObj.append('email', formData.email);
        
        if (user.role === 'student') {
            formDataObj.append('section', formData.section);
            formDataObj.append('rollNo', formData.rollNo);
            formDataObj.append('batchId', formData.batchId);
        } else if (user.role === 'teacher') {
            formDataObj.append('section', formData.section);
        }
        
        let isValid = true;
        let validationErrors = {};
        
        if (user.role === 'student') {
            if (!formData.section) {
                validationErrors.section = { _errors: ["Section is required"] };
                isValid = false;
            }
            if (!formData.rollNo) {
                validationErrors.rollNo = { _errors: ["Roll No is required"] };
                isValid = false;
            }
            if (!formData.batchId) {
                validationErrors.batchId = { _errors: ["Batch is required"] };
                isValid = false;
            }
        } else if (user.role === 'teacher' && !formData.section) {
            validationErrors.section = { _errors: ["Section is required"] };
            isValid = false;
        }
        
        if (!isValid) {
            setErrors(validationErrors);
            return;
        }
        
        if (profileImage) {
            console.log('Adding profile image to form data:', profileImage.name);
            formDataObj.append('profileImage', profileImage);
        }
        
        const logObj = {};
        formDataObj.forEach((value, key) => {
            logObj[key] = value instanceof File ? `File: ${value.name} (${Math.round(value.size/1024)}KB)` : value;
        });
        console.log('Updating profile with data:', logObj);
        
        updateUser(formDataObj, {
            onSuccess: () => {
                toast.success('Profile updated successfully');
                navigate('/');
            },
            onError: (error) => {
                const errorMessage = error?.response?.data?.message || 'Failed to update profile';
                toast.error(errorMessage);
                console.error('Update failed', error);
            }
        });
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-base-100 to-base-200">
            <div className="w-full max-w-5xl bg-base-100 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="grid md:grid-cols-2 grid-cols-1">
                    <div className="p-8 md:p-10 bg-base-100">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                                Update Your Profile
                            </h2>
                            <p className="text-center text-gray-500 dark:text-gray-400">Keep your information current and accurate</p>
                        </div>

                        <div className="flex flex-col items-center mb-8">
                            <div className="relative">
                                <div className={`w-32 h-32 rounded-full overflow-hidden flex items-center justify-center border-2 ${previewImage ? 'border-green-500' : 'border-gray-300 bg-gray-100 dark:bg-gray-700'}`}>
                                    {previewImage ? (
                                        <img 
                                            src={previewImage} 
                                            alt="Profile Preview" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : user?.profileImage ? (
                                        <img 
                                            src={user.profileImage} 
                                            alt="Current Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Camera size={40} className="text-gray-400" />
                                    )}
                                </div>
                                
                                {previewImage && (
                                    <button 
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            
                            <label className="mt-3 flex items-center gap-2 cursor-pointer text-sm text-green-600 hover:text-green-700 transition-colors font-medium">
                                <Upload size={16} />
                                {previewImage || user?.profileImage ? 'Change Photo' : 'Upload Profile Photo'}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">Optional (Max 5MB)</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        className="w-full py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-base-text shadow-sm transition-all duration-200"
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            
                            <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        className="w-full py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-base-text opacity-75 cursor-not-allowed"
                                        value={formData.email}
                                        onChange={handleChange}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                            
                            {user.role === 'student' && (
                                <>
                                    <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                        <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Discipline</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                            <select
                                                name="section"
                                                className="w-full py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-base-text shadow-sm transition-all duration-200 appearance-none cursor-pointer"
                                                value={formData.section}
                                                onChange={handleChange}
                                            >
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
                                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.section && <p className="text-red-500 text-xs mt-1.5">{errors.section._errors[0]}</p>}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Roll No</label>
                                            <div className="relative group">
                                                <UserCheck className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                                <input
                                                    type="text"
                                                    name="rollNo"
                                                    className="w-full py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-base-text shadow-sm transition-all duration-200"
                                                    value={formData.rollNo}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            {errors.rollNo && <p className="text-red-500 text-xs mt-1.5">{errors.rollNo._errors[0]}</p>}
                                        </div>
                                        
                                        <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Batch</label>
                                            <div className="relative group">
                                                <select
                                                    name="batchId"
                                                    className="w-full py-3.5 pl-4 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-base-text shadow-sm transition-all duration-200 appearance-none cursor-pointer"
                                                    value={formData.batchId}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select Batch</option>
                                                    {batchesLoading ? (
                                                        <option>Loading...</option>
                                                    ) : (
                                                        filteredBatches.map((batch) => (
                                                            <option key={batch._id} value={batch._id}>
                                                                {batch.name}
                                                            </option>
                                                        ))
                                                    )}
                                                </select>
                                                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                            {errors.batchId && <p className="text-red-500 text-xs mt-1.5">{errors.batchId._errors[0]}</p>}
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {user.role === 'teacher' && (
                                <div className="transition-all duration-200 transform hover:translate-y-[-2px]">
                                    <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Discipline</label>
                                    <div className="relative group">
                                        <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-green-500 transition-colors duration-200" size={18} />
                                        <select
                                            name="section"
                                            className="w-full py-3.5 pl-11 bg-base-100 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-4 focus:ring-green-500/20 px-4 text-base-text shadow-sm transition-all duration-200 appearance-none cursor-pointer"
                                            value={formData.section}
                                            onChange={handleChange}
                                        >
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
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.section && <p className="text-red-500 text-xs mt-1.5">{errors.section._errors[0]}</p>}
                                </div>
                            )}
                            
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
                                        "Update Profile"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="hidden md:block relative">
                        <img 
                            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop" 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-10">
                            <h3 className="text-white text-xl font-bold drop-shadow-lg">Keep your profile information up to date</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateUser;