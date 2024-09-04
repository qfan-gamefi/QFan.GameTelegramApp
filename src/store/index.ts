import { createStore } from "vuex";

const store = createStore({
    state() {
        return {
            userId: null,
            fullName: "",
            hasLoaded: false,
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
    },
});

export default store;
