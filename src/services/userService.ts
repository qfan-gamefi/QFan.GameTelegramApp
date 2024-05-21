import axiosInstance from "./axiosInstance";

const userService = {
    getListInvite(userId: string) {
        return axiosInstance.get(`/player/getReferalList?playerId=${userId}`);
    },
    async getListMission() {
        const res = await axiosInstance.get(`/missions`);

        return res.data;
    },
    async getListMissionReward(playId: string) {
        const res = await axiosInstance.get(
            `/qpoint-transactions?filters[player][playerId]=${playId}&filters[tranType]=MISSION_REWARD&populate=*`
        );

        return res.data;
    },
    async getInfo(idUser: string) {
        const res = await axiosInstance.get(
            `players?populate=qpoint&filters[playerId]=${idUser}`
        );
        return res.data;
    },
    async getCallBack(data: any, ref: string) {
        // refcode  1927324767
        const newData = {
            message: {
                from: data,
                text: `/ref ${ref}`,
            },
        };

        const res = await axiosInstance.post(`player/messageCallback`, newData);
        return res.data;
    },

    async checkCode(code: string) {
        const data = {
            data: {
                refererCode: code,
            },
        };
        const res = await axiosInstance.post(`player/checkRefererCode`, data);
        return res.data;
    },
    async takeReward(idUser: string) {
        const data = {
            data: {
                playerId: idUser,
            },
        };
        const res = await axiosInstance.post(
            `qpoint-transaction/takeReward`,
            data
        );
        return res.data;
    },
    async claimMission(userId: string, missionId: number) {
        const dataForm = {
            data: {
                playerId: userId,
                missionId: missionId,
            },
        };
        const res = await axiosInstance.post(
            `qpoint-transaction/claimMissionReward`,
            dataForm
        );
        return res.data;
    },
};

export default userService;
