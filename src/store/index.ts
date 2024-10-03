import type { IPlayer } from "@/interface/rewardInfo";
import { createStore } from "vuex";

const store = createStore({
    state() {
        return {
            userId: null,
            fullName: "",
            hasLoaded: false,
            rewardInfo: {} as IPlayer,
        };
    },
    mutations: {
        setUserId(state: any, id: number) {
            state.userId = id;
        },
        setFullName(state: any, name: string) {
            state.fullName = name;
        },
        setHasLoaded(state, status) {
            state.hasLoaded = status;
        },
        setRewardInfo(state, rewardInfo: IPlayer) {
            state.rewardInfo = rewardInfo;
        },
    },
});

export default store;
