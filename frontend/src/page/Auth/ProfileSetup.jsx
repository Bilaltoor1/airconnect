import { useState, useEffect, useRef } from 'react';
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from 'react-router-dom';
import { useLogout, useProfileSetup } from "../../hooks/useAuth.js";
import { useAllAnnouncementsFilter } from "../../hooks/useAnnouncementFilter.js";
import { z } from 'zod';
import { useBatches } from "../../hooks/useBatch.js";
import { Camera, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';

const teacherSchema = z.object({
    section: z.string().min(1, { message: "Section is required" }),
});

const studentSchema = z.object({
    section: z.string().min(1, { message: "Section is required" }),
    rollNo: z.string().min(1, { message: "Roll No is required" }),
    batchId: z.string().min(1, { message: "Batch is required" }),
});

const coordinatorSchema = z.object({
    department: z.string().min(1, { message: "Department is required" }),
    officeNumber: z.string().min(1, { message: "Office Number is required" }),
});

const ProfileSetup = () => {
    const { user } = useAuth();
    const { mutate: logout } = useLogout();
    const { mutate: setupProfile, isLoading: setupLoading } = useProfileSetup();
    const navigate = useNavigate();
    const { data: sectionsData, isLoading: sectionsLoading } = useAllAnnouncementsFilter();
    const { data: batchesData, isLoading: batchesLoading } = useBatches();

    const [section, setSection] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [batchId, setBatchId] = useState('');
    const [department, setDepartment] = useState('');
    const [officeNumber, setOfficeNumber] = useState('');
    const [errors, setErrors] = useState({});
    
    const [profileImage, setProfileImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user && user.profileSetup) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout({
            onSuccess: () => {
                navigate('/login');
            },
            onError: (error) => {
                console.error('Logout failed', error);
            }
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);

        setProfileImage(file);
    };

    const removeImage = () => {
        setProfileImage(null);
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const validateForm = () => {
        try {
            setErrors({});
            
            if (user.role === 'student') {
                studentSchema.parse({ section, rollNo, batchId });
            } else if (user.role === 'teacher') {
                teacherSchema.parse({ section });
            } else if (user.role === 'coordinator') {
                coordinatorSchema.parse({ department, officeNumber });
            }
            
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors(error.format());
            }
            return false;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fill all required fields correctly');
            return;
        }
        
        const formData = new FormData();
        if (profileImage) {
            formData.append('profileImage', profileImage);
        }
        
        if (user.role === 'student') {

            formData.append('batchId', batchId);
            formData.append('rollNo', rollNo);
            formData.append('section', section);
           
        } else if (user.role === 'teacher') {
            formData.append('section', section);
        } else if (user.role === 'coordinator') {
            formData.append('department', department);
            formData.append('officeNumber', officeNumber);
        }
        
        setupProfile({
            userId: user._id,
            profileData: formData
        }, {
            onSuccess: (data) => {
                toast.success('Profile setup completed successfully!');
                navigate('/');
            },
            onError: (error) => {
                console.error('Profile setup error:', error);
                toast.error(error?.response?.data?.message || 'Failed to set up profile. Please try again.');
            }
        });
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-base-100 rounded-2xl shadow-2xl overflow-hidden">
                <div className="grid md:grid-cols-2 grid-cols-1">
                    <div className="p-8 md:p-10 bg-base-100">
                        <div className="mb-10">
                            <h2 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                                Setup Your Profile
                            </h2>
                            <p className="text-center text-gray-500">Complete your profile to get started</p>
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
                                {previewImage ? 'Change Photo' : 'Upload Profile Photo'}
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

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {(user.role === 'teacher') && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discipline</label>
                                    <select
                                        className="w-full py-3 bg-base-100 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 px-3 text-base-text"
                                        value={section}
                                        onChange={(e) => setSection(e.target.value)}
                                    >
                                        <option value="">Select Discipline</option>
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
                                    {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section._errors[0]}</p>}
                                </div>
                            )}
                            {user.role === 'student' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Discipline</label>
                                        <select
                                            className="w-full py-3 bg-base-100 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 px-3 text-base-text"
                                            value={section}
                                            onChange={(e) => setSection(e.target.value)}
                                        >
                                            <option value="">Select Discipline</option>
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
                                        {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section._errors[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Roll No <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            className="w-full py-3 bg-base-100 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 px-3 text-base-text"
                                            value={rollNo}
                                            onChange={(e) => setRollNo(e.target.value)}
                                            placeholder="Enter your roll number"
                                            required
                                        />
                                        {errors.rollNo && <p className="text-red-500 text-xs mt-1">{errors.rollNo._errors[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Batch</label>
                                        <select
                                            className="w-full py-3 bg-base-100 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 px-3 text-base-text"
                                            value={batchId}
                                            onChange={(e) => setBatchId(e.target.value)}
                                        >
                                            <option value="">Select Batch</option>
                                            {batchesLoading ? (
                                                <option>Loading...</option>
                                            ) : (
                                                batchesData.map((batch) => (
                                                    <option key={batch._id} value={batch._id}>
                                                        {batch.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        {errors.batchId && <p className="text-red-500 text-xs mt-1">{errors.batchId._errors[0]}</p>}
                                    </div>
                                </>
                            )}
                            {user.role === 'coordinator' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Department</label>
                                        <input
                                            type="text"
                                            className="w-full py-3 bg-base-100 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 px-3 text-base-text"
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                        />
                                        {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department._errors[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Office Number</label>
                                        <input
                                            type="text"
                                            className="w-full py-3 bg-base-100 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 px-3 text-base-text"
                                            value={officeNumber}
                                            onChange={(e) => setOfficeNumber(e.target.value)}
                                        />
                                        {errors.officeNumber && <p className="text-red-500 text-xs mt-1">{errors.officeNumber._errors[0]}</p>}
                                    </div>
                                </>
                            )}
                            
                            <div className="pt-4 space-y-3">
                                <button 
                                    type="submit" 
                                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                                    disabled={setupLoading}
                                >
                                    {setupLoading ? 'Processing...' : 'Complete Setup'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleLogout} 
                                    className="w-full py-3 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-all duration-200"
                                    disabled={setupLoading}
                                >
                                    Logout
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="hidden md:block relative">
                        <img 
                            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1000&auto=format&fit=crop" 
                            alt="Profile Setup" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                            <h3 className="text-white text-xl font-bold">Complete your profile to get the best experience</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;