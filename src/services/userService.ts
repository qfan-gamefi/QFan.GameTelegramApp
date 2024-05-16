import axiosInstance from "./axiosInstance";

const userService = {
    getListInvite(userId: string) {
        return axiosInstance.get(`/player/getReferalList?playerId=${userId}`);
    },
    getListMission() {
        return axiosInstance.get(`/missions`);
    },
};

export default userService;
