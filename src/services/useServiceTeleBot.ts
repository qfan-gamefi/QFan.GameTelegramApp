import teleBotAxiosInstance from "./teleBotAxiosInstance";

const userServiceTelebot = {
    async getAvtTelegram(id: number) {
        try {
            const response = await teleBotAxiosInstance.get(
                `/get-telegram-photo?userId=${id}&bot=twa-testing-ngvhoang`,
                {
                    headers: {
                        "ngrok-skip-browser-warning": "1",
                        Authorization:
                            "Bearer eyJhbGciOiJIUzI1NiJ9.MTIz.x6ObpOYW2nhQ2CpeGInfTIkxrjpSdZ2jdvrWVv82Ij8",
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching Telegram webhook data:", error);
            throw error;
        }
    },
};

export default userServiceTelebot;
