import type { IPlayer } from "@/interface/rewardInfo";
import { createStore } from "vuex";

interface State {
    userId: number | null;
    fullName: string;
    hasLoaded: boolean;
    rewardInfo: IPlayer;
    autoMiningStore: boolean;
    autoMessStore: boolean;
    autoMessTextStore: string;
    autoFlipStore: boolean;
    countFlip: number;
}

const store = createStore<State>({
    state(): State {
        return {
            userId: null,
            fullName: "",
            hasLoaded: false,
            rewardInfo: {} as IPlayer,
            autoMiningStore: false,
            autoMessStore: false,
            autoMessTextStore: "",
            autoFlipStore: false,
            countFlip: 0,
        };
    },
    mutations: {
        setUserId(state: State, id: number) {
            state.userId = id;
        },
        setFullName(state: State, name: string) {
            state.fullName = name;
        },
        setHasLoaded(state: State, status: boolean) {
            state.hasLoaded = status;
        },
        setRewardInfo(state: State, rewardInfo: IPlayer) {
            state.rewardInfo = rewardInfo;
        },
        setCountFlip(state: State, payload: number) {
            state.countFlip = payload;
        },
        setAutoFlip(state: State, payload: boolean) {
            state.autoFlipStore = payload;
        },
        setAutoMining(state: State, payload: boolean) {
            state.autoMiningStore = payload;
        },
        setAutoMessStore(state: State, payload: boolean) {
            state.autoMessStore = false;
            setTimeout(() => {
                state.autoMessStore = payload;
            }, 0);
        },
        setAutoMessTextStore(state: State, payload: string) {
            state.autoMessTextStore = payload;
        },
    },
    // actions: {
    //     triggerAutoMining({ commit }) {
    //         commit("setAutoMining", true);
    //     },
    // },
    getters: {
        isAutoMiningTriggered: (state) => state.autoMiningStore,
    },
});

export default store;
