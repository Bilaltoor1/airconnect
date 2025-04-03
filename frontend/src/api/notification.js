import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" 
    ? "http://localhost:3001/api/notifications" 
    : "/api/notifications";

axios.defaults.withCredentials = true;

export const fetchNotifications = async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const response = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await axios.patch(`${API_URL}/${id}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await axios.patch(`${API_URL}/read-all`);
    return response.data;
};

export const deleteNotification = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
