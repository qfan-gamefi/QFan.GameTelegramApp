import { createStore } from "vuex";

const store = createStore({
    state() {
        return {
            userId: null,
            fullName: "",
        };
    },
    mutations: {
        setUserId(state: any, id: number) {
            state.userId = id;
        },
        setFullName(state: any, name: string) {
            state.fullName = name;
        },
    },
});

export default store;
