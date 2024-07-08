import axios from "axios";

const URL_API = import.meta.env.VITE_API_BASE_URL;
export const networkAxiosInstance = axios.create({
    baseURL: `${URL_API}/quaiservice/api/v1/`,
    headers: {
        "Content-Type": "application/json",
    },
});