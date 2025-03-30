import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api" : "/api";
axios.withCredentials = true;
export const fetchComments = async (announcementId, page) => {
    const response = await axios.get(`${API_URL}/announcements/${announcementId}/comments`, {
        params: { page }
    });
    return response.data;
};

export const addComment = async ({ announcementId, text }) => {
    const response = await axios.post(`${API_URL}/announcements/${announcementId}/comments`, { text });
    return response.data;
};