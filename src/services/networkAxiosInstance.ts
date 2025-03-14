import axios from "axios";

const URL_API = import.meta.env.VITE_API_BASE_URL;
export const networkAxiosInstance = axios.create({
    baseURL: `${URL_API}/quaiservice/api/v1/`,
    headers: {
        "Content-Type": "application/json",
    },
});
networkAxiosInstance.interceptors.request.use((config) => {
    const passVerify = localStorage.getItem("passVerify");
    const base64X = localStorage.getItem("auth-x");

    if (passVerify) {
        config.headers["Authorization"] = `Bearer ${passVerify}`;
    }
    if (base64X) {
        config.headers["x-telegram-auth"] = base64X;
    }

    return config;
});

export const NETORK_ADMIN_BASE_URL = `${URL_API}/network/api/`;
export const networkAdminAxiosInstance = axios.create({
    baseURL: NETORK_ADMIN_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});
networkAdminAxiosInstance.interceptors.request.use((config) => {
    const passVerify = localStorage.getItem("passVerify");
    const base64X = localStorage.getItem("auth-x");

    if (passVerify) {
        config.headers["Authorization"] = `Bearer ${passVerify}`;
    }
    if (base64X) {
        config.headers["x-telegram-auth"] = base64X;
    }

    return config;
});