import axiosInstance from "./axiosInstance";
import { networkAxiosInstance } from "./networkAxiosInstance";

const userService = {
    getListInvite(userId: string) {
        return axiosInstance.get(`/player/getReferalList?playerId=${userId}`);
    },
    async getListMission() {
        const res = await axiosInstance.get(`/missions`);

        return res.data;
    },
    async getListEvent() {
        const res = await axiosInstance.get(`/events?populate=*`);

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

    async getEvent() {
        const res = await axiosInstance.get(`events?populate=*`);
        return res.data;
    },
    async getListBooster() {
        const res = await axiosInstance.get(`boosters?populate=*`);
        return res.data;
    },
    async getConfiguration() {
        const res = await axiosInstance.get(`configuration`);
        return res.data;
    },
    async getBoosterTransaction(id: string) {
        const res = await axiosInstance.get(
            `booster-transactions?populate[booster][populate]=*&populate[player][populate]=*&filters[player][playerId]=${id}&filters[boosterType]=SPEED&sort[1]=id:desc&pagination[pageSize]=1`
        );
        return res.data;
    },
    async getBoosterAmount(id: string) {
        const res = await axiosInstance.get(
            `booster-transactions?populate[booster][populate]=*&populate[player][populate]=*&filters[player][playerId]=${id}&filters[boosterType]=AMOUNT&sort[1]=id:desc&pagination[pageSize]=1`
        );
        return res.data;
    },
    async postUplevel(id: string, type: string) {
        const dataForm = {
            data: {
                playerId: id,
                boosterType: type,
            },
        };
        const res = await axiosInstance.post(`booster/upLevel`, dataForm);
        return res.data;
    },
    async claimCheckin(userId: string, toAddress: string) {
        const dataForm = {
            data: {
                playerId: userId,
                toAddress: toAddress,
            },
        };
        const res = await axiosInstance.post(
            `qpoint-transaction/takeCheckinReward`,
            dataForm
        );
        return res.data;
    },
    async faucet(userId: string, toAddress: string) {
        try {
            const dataForm = {
                playerId: userId,
                toAddress
            };
            const res = await networkAxiosInstance.post(
                `faucet/send-faucet`,
                dataForm
            );
            return res.data;
        } catch (error) {
            console.log(error);
            return error?.response?.data;
        }

    },
};

export default userService;
