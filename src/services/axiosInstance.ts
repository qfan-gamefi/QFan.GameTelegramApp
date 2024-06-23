// src/services/axiosInstance.js
import axios from "axios";

const URL_API = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: `${URL_API}/api/`,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        // Add any custom request configuration here, like auth tokens
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle any errors
        return Promise.reject(error);
    }
);

export default axiosInstance;
