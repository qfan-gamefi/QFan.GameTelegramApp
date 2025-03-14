import axios from "axios";

const URL_API = import.meta.env.VITE_API_BASE_URL;

const teleBotAxiosInstance = axios.create({
    baseURL: `${URL_API}/telebot/api/v1`,
    headers: {
        "Content-Type": "application/json",
    },
});

teleBotAxiosInstance.interceptors.request.use(
    (config) => {
        const passVerify = localStorage.getItem("passVerify");
        const base64X = localStorage.getItem("auth-x");

        passVerify && (config.headers["Authorization"] = `Bearer ${passVerify}`);
        base64X && (config.headers["x-telegram-auth"] = base64X);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

teleBotAxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default teleBotAxiosInstance;
