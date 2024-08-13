import axiosInventory from "./axiosInventory";


const userServiceInventory = {
    async getListInventory(idUser: any) {
        const res = await axiosInventory.get(
            `v1/inventory/getInventory?userId=${idUser}`
        );
        console.log(res);

        return;
        return res.status == 200 ? JSON.parse(res.data.message) : {};
    },
}

export default userServiceInventory;