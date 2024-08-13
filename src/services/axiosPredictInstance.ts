import axios from "axios";
const URL_API = import.meta.env.VITE_API_BASE_URL;


const axiosPredictInstance = axios.create({
    baseURL: `${URL_API}/predict/api/v1/`,
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
