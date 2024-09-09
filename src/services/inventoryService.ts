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
    async useInventory(data: { UserId: number; ItemCount: number, ItemId: number }) {
        const res = await axiosInventory.post(`/item/consumeItem`, data);
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
}

export default userServiceInventory;