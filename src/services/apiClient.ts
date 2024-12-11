import createAxiosInstance from "./axios";

const pathNetwork = "network";
const prefixNetWork = null
const axiosInstanceNetwork = createAxiosInstance(pathNetwork, prefixNetWork);

export const useApiNetWork = {
    async check_airdrop(playerId: string) {
        const filter = JSON.stringify({
            playerId: { _eq: playerId },
        });
        const res = await axiosInstanceNetwork.get(
            `/items/airdrop_list?filter=${filter}`
        );
        return res?.data;
    },
};
