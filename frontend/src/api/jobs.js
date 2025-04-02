import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api/jobs" : "/api/jobs";

export const createJob = async (jobData) => {
    // When sending FormData, let axios set the Content-Type header automatically
    // to include the correct boundary parameter
    
    // Log the data being sent for debugging
    if (jobData instanceof FormData) {
        for (let [key, value] of jobData.entries()) {
            console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }
    }
    
    // Configure axios to handle multipart/form-data correctly when FormData is used
    const config = {
        headers: {
            'Content-Type': jobData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
    };
    
    // Make sure we don't manually set the Content-Type header when sending FormData
    // axios will set it to 'multipart/form-data' with the correct boundary
    const response = await axios.post(`${API_URL}`, jobData, config);
    return response.data.job;
};

export const fetchJobs = async (params) => {
    const response = await axios.get(`${API_URL}`, { params });
    return response.data;
};

export const deleteJob = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const updateJob = async (jobData) => {
    // Handle FormData with multipart/form-data content type
    const config = {
        headers: {
            'Content-Type': jobData instanceof FormData ? 'multipart/form-data' : 'application/json'
        }
    };
    
    let url = `${API_URL}/${jobData.id}`;
    let data = jobData;
    
    // If we're sending FormData, it's structured differently
    if (jobData instanceof FormData) {
        // The ID is part of the FormData, so the URL is different
        url = `${API_URL}/${jobData.get('id')}`;
    }
    
    const response = await axios.patch(url, data, config);
    return response.data;
};