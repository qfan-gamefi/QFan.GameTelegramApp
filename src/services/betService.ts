import axiosBetInstance from "./axiosBetInstance";

const betService = {
    async getFilterData(table: string, queryObject: object) {
        const res = await axiosBetInstance.post(table + `/filter`, queryObject);
        return res.status == 200 ? JSON.parse(res.data.message).data : {};
    },
    async getLeaderBoard(domainCode: string) {
        const res = await axiosBetInstance.get(
            `leaderboard?domainCode=${domainCode}`
        );
        return res.status == 200 ? JSON.parse(res.data.message).data : {};
    },
    async addBidding(data: object) {
        const res = await axiosBetInstance.post(`/bids`, data);
        console.log(res);

        return res.status == 200 ? JSON.parse(res.data.message).data : {};
    },
    async getListGame(idUser: string, detailEvent: any) {
        const res = await axiosBetInstance.get(
            `matchs?userId=${idUser}&listCode=${detailEvent?.attributes?.listingCode}`
        );
        return res.status == 200 ? JSON.parse(res.data.message).data : {};
    },

    async getYourRank(idUser: string, detailEvent: any, userName: string) {
        const res = await axiosBetInstance.get(
            `point?userId=${idUser}&domainCode=${detailEvent?.attributes?.domainCode}&userName=${userName}`
        );
        return res.status == 200 ? JSON.parse(res.data.message).data : {};
    },
};

export default betService;
