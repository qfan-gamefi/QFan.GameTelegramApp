// src/services/axiosInstance.js
import axios from "axios";

const axiosPredictInstance = axios.create({
    baseURL: "https://qfan-api.qcloud.asia/predict/api/v1/",
    headers: {
        "Content-Type": "application/json",
    },
});

axiosPredictInstance.interceptors.request.use(
    (config) => {
        // Add any custom request configuration here, like auth tokens
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosPredictInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle any errors
        return Promise.reject(error);
    }
);

export default axiosPredictInstance;