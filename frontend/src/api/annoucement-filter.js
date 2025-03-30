import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api/announcement-filter" : "/api/announcements";

axios.defaults.withCredentials = true;

export const createAnnouncementFilter = async ({ section }) => {
    const response = await axios.post(`${API_URL}`, { section });
    return response.data;
};

export const fetchAnnouncementsFilter = async () => {
    const response = await axios.get(`${API_URL}`);
    return response.data;
};

export const fetchAllAnnouncementsFilter = async () => {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
};

export const fetchBatchFilter = async () => {
    const response = await axios.get(`${API_URL}/batches`);
    return response.data;
};

export const updateAnnouncementFilter = async ({ id, section }) => {
    const response = await axios.put(`${API_URL}/${id}`, { section });
    return response.data;
};

export const deleteAnnouncementFilter = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};