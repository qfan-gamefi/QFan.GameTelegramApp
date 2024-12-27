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
        console.log('domainCode', domainCode);
        
        const res = await axiosPredictInstance.get(
            `leaderboard?domainCode=${domainCode}`
        );
        console.log('12312', JSON.parse(res.data.message));
        
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

        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },

    async getRateFlip(idUser: number) {
        const headers = {
            // Authorization:
            //     "Bearer 660787f4d83b0ac80df01fc58696d85b409f92bfccc6ee30b4a5eac5488513b8fc58dbcdf0005885f3aa5d95ed67a3af1ed7d9a1f517bebdea657e867dbfc1c03dfb072d987cd3c0472cbfa46170d58ebb26f044921ca1b9b9fd8df8499a143d932221c0393f3324b7d00100b8b8869cb1475b8e80d95e3e02ed87a97c350319",
            // "Content-Type": "application/json",
            Accept: "*/*",
            "ngrok-skip-browser-warning": "1",
        };
        const data = {
            where: { id: 1 },
            include: "GamesBiddingSides",
        };

        const res = await axiosPredictInstance.get(
            `/flip/getPlayerFlipInfo?userId=${idUser}&domainCode=FLIP_COIN`,
            {
                headers: headers,
                data: data,
            }
        );

        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },

    async getHistoryFlip(idUser: number) {
        const res = await axiosPredictInstance.get(
            `/flip/getPlayerFlip?userId=${idUser}&domainCode=FLIP_COIN`
        );

        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
};

export default predictService;
