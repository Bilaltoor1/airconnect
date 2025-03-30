import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api/announcements" : "/api/announcements";

axios.defaults.withCredentials = true;

export const fetchAnnouncements = async (params) => {
    // Ensure all parameters are properly passed to the API
    const { page, limit, search, sort, section, role, batch } = params;
    const queryParams = new URLSearchParams({
        page: page || 1,
        limit: limit || 10,
        search: search || '',
        sort: sort || 'latest',
        section: section || 'all',
        role: role || 'all',
        batch: batch || ''
    });
    
    const response = await axios.get(`${API_URL}?${queryParams}`);
    return response.data;
};

export const fetchAnnouncementById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

// Alias for fetchAnnouncementById to match the import in useAnnouncement.js
export const fetchAnnouncement = fetchAnnouncementById;

export const createAnnouncement = async (formData) => {
    // Configure headers for multipart/form-data
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    };
    
    const response = await axios.post(`${API_URL}`, formData, config);
    return response.data;
};

export const updateAnnouncement = async (id, announcementData) => {
    // Handle FormData with multipart/form-data content type
    const config = {
        headers: {
            'Content-Type': announcementData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
    };
    
    const response = await axios.patch(`${API_URL}/${id}`, announcementData, config);
    return response.data;
};

export const deleteAnnouncement = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const likeAnnouncement = async (id) => {
    const response = await axios.post(`${API_URL}/${id}/like`);
    return response.data;
};

export const dislikeAnnouncement = async (id) => {
    const response = await axios.post(`${API_URL}/${id}/dislike`);
    return response.data;
};