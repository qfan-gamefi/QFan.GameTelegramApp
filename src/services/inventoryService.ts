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
    async makeBuyOrder(
        itemDefId: number,
        userId: number,
        price: number,
        count: number,
        priceType: string
    ) {
        const res = await axiosInventory.post(`/order/makeBuyOrder`, {
            itemDefId: itemDefId,
            userId: userId,
            price: price,
            count: count,
            priceType: priceType,
        });

        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
    async makeSellOrder(
        itemDefId: number,
        userId: number,
        price: number,
        count: number,
        priceType: string
    ) {
        const res = await axiosInventory.post(`/order/makeSellOrder`, {
            itemDefId: itemDefId,
            userId: userId,
            price: price,
            count: count,
            priceType: priceType,
        });

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
};

export default userServiceInventory;
