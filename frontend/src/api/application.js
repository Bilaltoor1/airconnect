import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api/applications" : "/api/applications";

axios.defaults.withCredentials = true;

export const createApplication = async (applicationData) => {
    try {
        // Configure headers for handling FormData with files
        const config = {
            headers: {}
        };
        
        // If applicationData is FormData, don't set Content-Type
        // Let the browser set it automatically with the correct boundary
        if (!(applicationData instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }
        
        const response = await axios.post(`${API_URL}`, applicationData, config);
        return response.data;
    } catch (error) {
        console.error('Error in createApplication:', error);
        throw error;
    }
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

export const clearStudentApplicationHistory = async () => {
    const response = await axios.delete(`${API_URL}/history/student`);
    return response.data;
};

export const clearAdvisorApplicationHistory = async () => {
    const response = await axios.delete(`${API_URL}/history/advisor`);
    return response.data;
};

export const clearCoordinatorApplicationHistory = async () => {
    const response = await axios.delete(`${API_URL}/history/coordinator`);
    return response.data;
};

export const hideStudentApplication = async (id) => {
    const response = await axios.delete(`${API_URL}/student/${id}`);
    return response.data;
};

export const hideAdvisorApplication = async (id) => {
    const response = await axios.delete(`${API_URL}/advisor/${id}`);
    return response.data;
};

export const hideCoordinatorApplication = async (id) => {
    const response = await axios.delete(`${API_URL}/coordinator/${id}`);
    return response.data;
};