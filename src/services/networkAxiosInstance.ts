import axios from "axios";

export const networkAxiosInstance = axios.create({
    baseURL: "http://localhost:3000/api/v1/",
    headers: {
        "Content-Type": "application/json",
    },
});