// src/services/axiosInstance.js
import axios from "axios";

const URL_API = import.meta.env.VITE_API_BASE_URL;

const axiosInventory = axios.create({
    baseURL: `${URL_API}/inventory/api/v1`,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInventory.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInventory.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInventory;
