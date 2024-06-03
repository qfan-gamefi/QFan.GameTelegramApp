// src/services/axiosInstance.js
import axios from "axios";

const axiosBetInstance = axios.create({
    baseURL: "https://e994-171-224-178-243.ngrok-free.app/",
    headers: {
        "Content-Type": "application/json",
    },
});

axiosBetInstance.interceptors.request.use(
    (config) => {
        // Add any custom request configuration here, like auth tokens
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosBetInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle any errors
        return Promise.reject(error);
    }
);

export default axiosBetInstance;
