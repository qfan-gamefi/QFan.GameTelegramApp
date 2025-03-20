import axiosBase from "./axiosBase";
import axiosInventory from "./axiosInventory";

const userServiceInventory = {
    async getListInventory(idUser: number) {
        const res = await axiosInventory.get(
            `/inventory/getInventory?userId=${idUser}`
        );
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },

    async getFusion() {
        const res = await axiosInventory.get(`/fusion/getFusions`);
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async makeFusion(data: { UserId: number; CombineId: number }) {
        const res = await axiosInventory.post(`/fusion/makeFusion`, data);
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async useInventory(data: {
        UserId: number;
        ItemCount: number;
        ItemId: number;
    }) {
        const res = await axiosInventory.post(`/item/consumeItem`, data);
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },

    async getListMarket() {
        const res = await axiosInventory.get(`/order/getMarketList`);
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async getFeeConfig() {
        const res = await axiosInventory.get(`/order/getFeeConfig`);
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async makeBuyOrder(valueForm: {
        itemDefId: number;
        userId: number;
        price: number;
        count: number;
        priceType: string;
    }) {
        const res = await axiosInventory.post(`/order/makeBuyOrder`, valueForm);

        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async makeSellOrder(valueForm: {
        itemDefId: number;
        userId: number;
        price: number;
        count: number;
        priceType: string;
    }) {
        const res = await axiosInventory.post(
            `/order/makeSellOrder`,
            valueForm
        );

        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },

    async callOrderShop(userId: number) {
        const res = await axiosInventory.get(
            `/order/getUserItemOrderList?UserId=${userId}`
        );
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async getTopOrder(idItemDef: number) {
        const res = await axiosInventory.get(
            `/order/getTopOrder5?ItemDefId=${idItemDef}`
        );
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async cancelOrder(itemOrderId: number, userId: number) {
        const data = {
            itemOrderId: itemOrderId,
            userId: userId,
        };
        const res = await axiosInventory.post(`/order/cancelOrder`, data);
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async getItemMarket(idItemDef: number) {
        const res = await axiosInventory.get(
            `/order/getMarketList?itemDefId=${idItemDef}`
        );
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },

    async createCredentials(data: { UserId: number; Password: string }) {
        const res = await axiosInventory.post(`/credentials/create`, data);
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async verifyCredentials(data: { UserId: number; Password: string }) {
        const res = await axiosInventory.post(`/credentials/verify`, data);
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async useDefault(data: { itemId: string; userId: string }) {
        const res = await axiosInventory.post(`/item/updateDefaultInStack`, data);
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async getFileConfig(userId: string ) {
        const res = await axiosInventory.get(`/lineup/fieldConfig?userId=${userId}`);
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async postFileConfig(data: { userId: string; cells: any }) {
        const res = await axiosInventory.post(`/lineup/fieldConfig?userId`, data);
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },

    //pvp
    async getYourRank(userId: string) {
        const res = await axiosBase.get(`/inventory/rank/player?userId=${userId}`);
        return res.data
    },
    async getLeaderboard() {
        const res = await axiosBase.get(`/inventory/rank/leaderboard?limit=20&page=1`);
        return res.data
    },
    async rankHistory(userId: string) {
        const res = await axiosBase.get(`/inventory/rank/history?userId=${userId}&limit=20&page=1`);
        return res.data
    },
    async rankOpponents(userId: string) {
        const res = await axiosBase.get(`/inventory/rank/opponents?userId=${userId}`);
        return res.data
    },
    async getEnergy(userId: string) {
        const res = await axiosBase.get(`/inventory/api/v1/energy/get-energy?userId=${userId}&actionCode=MATCH`);
        return res.data
    },
    async handleRefresh(userId: string) {
        const res = await axiosBase.post(`inventory/rank/refresh-opponents`, {
            userId: userId,
        });
        return res.data
    },
    async playRank(data: any) {
        const res = await axiosBase.post(`inventory/rank/play`, {
            ...data,
        });
        return res.data
    },
};

export default userServiceInventory;
