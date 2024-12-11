import axios from "axios";

const URL_API = import.meta.env.VITE_API_BASE_URL;

const createAxiosInstance = (pathSegment: string, prefix: string | null) => {
    const baseURL = prefix
        ? `${URL_API}/${pathSegment}/api/${prefix}`
        : `${URL_API}/${pathSegment}/api`;

    const axiosInstance = axios.create({
        baseURL: baseURL,
        headers: {
            "Content-Type": "application/json",
        },
    });

    axiosInstance.interceptors.request.use(
        (config) => {
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            return Promise.reject(error);
        }
    );

    return axiosInstance;
};

export default createAxiosInstance;
