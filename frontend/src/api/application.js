import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api/applications" : "/api/applications";

axios.defaults.withCredentials = true;

export const createApplication = async (applicationData) => {
    const response = await axios.post(`${API_URL}`, applicationData);
    return response.data;
};
export const fetchHistoryofApplication = async (params) => {
    const response = await axios.get(`${API_URL}/history`, {params});
    return response.data;
};

export const fetchApplicationById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};
export const fetchApplications = async (params) => {
    const response = await axios.get(`${API_URL}`, {params});
    return response.data;
};

export const updateApplicationByAdvisor = async ({id, data}) => {
    const response = await axios.patch(`${API_URL}/advisor/${id}`, data);
    return response.data;
};

export const updateApplicationByCoordinator = async ({id, data}) => {
    const response = await axios.patch(`${API_URL}/coordinator/${id}`, data);
    return response.data;
};

export const updateApplicationByStudent = async ({id, data}) => {
    const response = await axios.patch(`${API_URL}/student/${id}`, data);
    return response.data;
};

export const addApplicationComment = async ({ id, text }) => {
    const response = await axios.post(`${API_URL}/${id}/comments`, { text });
    return response.data;
};

export const getApplicationComments = async (id) => {
    const response = await axios.get(`${API_URL}/${id}/comments`);
    return response.data;
};