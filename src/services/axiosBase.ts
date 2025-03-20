// src/services/axiosInstance.js
import axios from "axios";

const URL_API = import.meta.env.VITE_API_BASE_URL;

const axiosBase = axios.create({
    baseURL: `${URL_API}`,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosBase.interceptors.request.use(
    (config) => {
        const passVerify = localStorage.getItem("passVerify");
        // const base64X = localStorage.getItem("auth-x");

        passVerify && (config.headers["Authorization"] = `Bearer ${passVerify}`);
        // base64X && (config.headers["x-telegram-auth"] = base64X);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosBase.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.setItem("storePermission", "true");
        }
        return Promise.reject(error);
    }
);

export default axiosBase;
