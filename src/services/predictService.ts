import axiosPredictInstance from "./axiosPredictInstance";

const predictService = {
    async getFilterData(table: string, queryObject: object) {
        const res = await axiosPredictInstance.post(
            table + `/filter`,
            queryObject
        );
        return res.status == 200 ? JSON.parse(res.data.message).data : {};
    },
    async getLeaderBoard(domainCode: string) {
        const res = await axiosPredictInstance.get(
            `leaderboard?domainCode=${domainCode}`
        );
        return res.status == 200 ? JSON.parse(res.data.message).data : {};
    },
    async addBidding(data: object) {
        const res = await axiosPredictInstance.post(`/bids`, data);

        return res.status == 200 ? JSON.parse(res.data.message).data : {};
    },
    async getListGame(idUser: string, detailEvent: any) {
        const res = await axiosPredictInstance.get(
            `matchs?userId=${idUser}&listCode=${detailEvent?.attributes?.listingCode}`
        );
        return res.status == 200 ? JSON.parse(res.data.message).data : {};
    },

    async getYourRank(idUser: string, detailEvent: any, userName: string) {
        const res = await axiosPredictInstance.get(
            `point?userId=${idUser}&domainCode=${detailEvent?.attributes?.domainCode}&userName=${userName}`
        );
        return res.status == 200 ? JSON.parse(res.data.message).data : {};
    },
    async makeFlip(data: object) {
        const res = await axiosPredictInstance.post(`/flip/makeflip`, data);
        console.log(res);

        return res;
    },
};

export default predictService;
