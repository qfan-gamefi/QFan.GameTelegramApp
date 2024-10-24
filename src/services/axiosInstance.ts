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
        const passVerify = localStorage.getItem("passVerify");

        // if (passVerify) {
        //     config.headers["Authorization"] = `Bearer ${passVerify}`;
        // }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.setItem("storePermission", "true");
        }
        const customError = {
            ...error,
            message: error?.response?.data?.error?.message,
        };

        return Promise.reject(customError);
    }
);

export default axiosInstance;
