import axiosInstance from "./axiosInstance";

const userService = {
    getListInvite(userId: string) {
        return axiosInstance.get(`/player/getReferalList?playerId=${userId}`);
    },
    getListMission() {
        return axiosInstance.get(`/missions`);
    },
    async getInfo(idUser: number) {
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
    async takeReward(idUser: number) {
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
};

export default userService;
