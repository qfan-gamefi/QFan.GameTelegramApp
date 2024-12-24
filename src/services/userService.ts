import axiosInstance from "./axiosInstance";
import { networkAxiosInstance } from "./networkAxiosInstance";

const userService = {
    getListInvite(userId: string) {
        return axiosInstance.get(`/player/getReferalList?playerId=${userId}`);
    },
    async getListMission() {
        const res = await axiosInstance.get(
            `/missions?populate[QA][populate]=*&populate[image][populate]=*&populate[category][populate]=*`
        );

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
    async claimCheckin(userId: string, toAddress: string, hash: string) {
        try {
            const dataForm = {
                playerId: userId,
                address: toAddress,
                hash,
            };
            const res = await networkAxiosInstance.post(
                `interact/daily-checkin`,
                dataForm
            );
            return res.data;
        } catch (error) {
            console.log(error);
            return error?.response?.data;
        }
    },
    async autoInteract(userId: string, toAddress: string, hash: any) {
        try {
            const dataForm = {
                playerId: userId,
                address: toAddress,
                hash,
            };
            const res = await networkAxiosInstance.post(
                `interact/auto-interact`,
                dataForm
            );
            return res.data;
        } catch (error) {
            console.log(error);
            return error?.response?.data;
        }
    },
    async faucet(userId: string, toAddress: string) {
        try {
            const dataForm = {
                playerId: userId,
                toAddress,
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
    async registerAddress(
        userId: string,
        address: string,
        firstName: string,
        lastName: string
    ) {
        try {
            const dataForm = {
                playerId: userId,
                firstName,
                lastName,
                address,
            };
            const res = await networkAxiosInstance.post(
                `user/register-address`,
                dataForm
            );
            return res.data;
        } catch (error) {
            console.log(error);
            return error?.response?.data;
        }
    },
    async getWalletInfo(id: number) {
        const res = await networkAxiosInstance.get(
            `/wallet/find-by-player/${id}`
        );
        return res?.data;
    },
    async postDeposit(
        id: number,
        address: string,
        amount: number,
        hash: string
    ) {
        const data = {
            playerId: id,
            walletType: "ON_CHAIN",
            address: address,
            amount: amount,
            unit: "QUAI",
            hash: hash,
        };
        const res = await networkAxiosInstance.post(
            `/wallet/deposit-onchain`,
            data
        );
        return res;
    },
    async postWithdraw(
        playerId: string,
        address: string,
        amount: number
    ) {
        const data = {
            playerId,
            address: address,
            amount: amount,
            unit: "QUAI"
        };
        const res = await networkAxiosInstance.post(
            `/wallet/withdraw-onchain`,
            data
        );
        return res;
    },
    async getLevels() {
        const res = await axiosInstance.get(
            `/player-levels?pagination[pageSize]=9999`
        );
        return res?.data?.data;
    },
    // async getFeeConfig() {
    //     const res = await axiosInstance.get(`v1/order/getFeeConfig`);
    //     return res?.data?.data;
    // },
    // async getListMarket() {
    //     const res = await axiosInstance.get(`v1/order/getMarketList`);
    //     return res?.data?.data;
    // },
    async postMissionQA(
        userId: string,
        missionId: number,
        answerId: number,
        answerCode: string
    ) {
        const dataForm = {
            data: {
                playerId: userId,
                missionId: missionId,
                answer: [
                    {
                        id: answerId,
                        answer: answerCode,
                    },
                ],
            },
        };
        const res = await axiosInstance.post(
            `qpoint-transaction/claimMissionReward`,
            dataForm
        );
        return res;
    },
    async giftCode(idUser: string, code: string) {
        const data = {
            playerId: idUser,
            code: code,
        };
        try {
            const res = await axiosInstance.post(
                `/gift-code/check-available`,
                data
            );
            return res;
        } catch (error) {
            return error;
        }
    },
    async walletTrasnsaction(idUser: string) {
        const res = await networkAxiosInstance.get(
            `/wallet/find-transaction-by-player/${idUser}`
        );
        return res;
    },
    
};

export default userService;
