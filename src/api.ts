import axios from 'axios';

const isProduction = import.meta.env.PROD;
const API_URL = import.meta.env.VITE_API_URL || (isProduction ? '/api' : 'http://localhost:3000/api');

export const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        // If Vercel accidentally returns HTML instead of JSON for an API route
        if (typeof response.data === 'string' && response.data.trim().startsWith('<')) {
            console.error("API returned HTML instead of JSON", response.config.url);
            alert(`API Route ${response.config.url} returned HTML! This means the Vercel Serverless function crashed or was not found.`);
        }
        return response;
    },
    (error) => {
        console.error("API Error Response:", error.response);
        return Promise.reject(error);
    }
);

export default api;
