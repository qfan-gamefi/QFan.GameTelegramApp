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
        const passVerify = localStorage.getItem("passVerify");

        if (passVerify) {
            config.headers["Authorization"] = `Bearer ${passVerify}`;
        }
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
        if (error.response && error.response.status === 401) {
            localStorage.setItem("storePermission", "true");
        }
        return Promise.reject(error);
    }
);

export default axiosPredictInstance;
