import axios from 'axios';

const isProduction = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_URL || (isProduction ? '/api' : 'http://localhost:3000/api');

export const api = axios.create({
    baseURL: API_URL,
    timeout: 7000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
            // Transform to a more helpful error for the user
            error.message = 'The server is busy or the database connection limit has been reached. Please try again in a few seconds.';
        }
        return Promise.reject(error);
    }
);

export default api;
