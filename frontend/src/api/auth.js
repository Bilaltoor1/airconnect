import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api/auth" : "/api/auth";

axios.defaults.withCredentials = true;

export const signup = async ({ email, password, name, role }) => {
    const response = await axios.post(`${API_URL}/signup`, { email, password, name, role });
    return response.data.user;
};

export const login = async ({ email, password }) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
};

export const logout = async () => {
    await axios.post(`${API_URL}/logout`);
};

export const verifyEmail = async (code) => {
    const response = await axios.post(`${API_URL}/verify-email`, { code });
    return response.data.user;
};

export const checkIsAdmin = async () => {
    const response = await axios.get(`${API_URL}/is-admin`);
    return response.data.isAdmin;
};

export const checkAuth = async () => {
    try {
        const response = await axios.get(`${API_URL}/get-user`, { withCredentials: true });
        return response.data.user;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized error
            return null;
        }
        throw error;
    }
};
export const forgotPassword = async (email) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return response.data.message;
};

export const resetPassword = async (token, password) => {
    const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
    return response.data.message;
};

export const profileSetup = async ({ userId, profileData }) => {
    // Add userId to the FormData
    profileData.append('userId', userId);
    
    // Configure axios to properly handle FormData
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
    };
    
    try {
        console.log('Sending profile setup request with:', 
            Array.from(profileData.entries()).reduce((obj, [key, value]) => {
                obj[key] = value instanceof File ? `File: ${value.name}` : value;
                return obj;
            }, {})
        );
        
        const response = await axios.post(
            `${API_URL}/profile-setup`, 
            profileData,  // FormData object
            config
        );
        
        return response.data.user;
    } catch (error) {
        console.error('Profile setup error:', error.response?.data || error.message);
        throw error;
    }
};

export const updateUser = async (userData) => {
    // Configure axios to properly handle FormData with files
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
    };
    
    try {
        console.log('Sending update user request with:', 
            Array.from(userData.entries()).reduce((obj, [key, value]) => {
                obj[key] = value instanceof File ? `File: ${value.name}` : value;
                return obj;
            }, {})
        );
        
        const response = await axios.patch(`${API_URL}/update-user`, userData, config);
        return response.data.user;
    } catch (error) {
        console.error('Update user error:', error.response?.data || error.message);
        throw error;
    }
};

export const changePassword = async ({ currentPassword, newPassword }) => {
    const response = await axios.post(`${API_URL}/change-password`, { currentPassword, newPassword });
    return response.data;
};

export const fetchStudentsWithoutBatch = async () => {
    const response = await axios.get(`${API_URL}/students-without-batch`);
    return response.data;
};

export const getTeachers = async () => {
    const response = await axios.get(`${API_URL}/teachers`);
    return response.data;
};

export const getPendingTeachers = async () => {
    // Use a different base URL for this specific endpoint
    const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api/auth" : "/api/auth";
    const response = await axios.get(`${BASE_URL}/pending-teachers`, {
        withCredentials: true
    });
    return response.data;
};

export const verifyTeacher = async ({ teacherId, isApproved }) => {
    const response = await axios.post(`${API_URL}/verify-teacher`, { teacherId, isApproved });
    return response.data;
};

export const deleteTeacher = async (teacherId) => {
    const response = await axios.delete(`${API_URL}/teacher/${teacherId}`);
    return response.data;
};