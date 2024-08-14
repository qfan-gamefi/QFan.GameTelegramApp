import axiosInventory from "./axiosInventory";

const userServiceInventory = {
    async getListInventory(idUser: number) {
        const res = await axiosInventory.get(
            `/inventory/getInventory?userId=${idUser}`
        );
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
}

export default userServiceInventory;