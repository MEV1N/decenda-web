import axios from 'axios';

const isProduction = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_URL || (isProduction ? '/api' : 'http://localhost:3000/api');

export const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
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
        return Promise.reject(error);
    }
);

export default api;
