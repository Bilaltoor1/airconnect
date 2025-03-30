import axios from 'axios';

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3001/api/batches" : "/api/batches";

export const fetchBatches = async () => {
    const response = await axios.get(`${API_URL}/all`);
    return response.data;
};