import { createRouter, createWebHistory } from "vue-router";
// import Home from "../App.vue";
import HomePage from "@/views/Home/HomePage.vue";
import WalletCreate from "@/views/Wallet/WalletCreate.vue";
import WalletForm from "@/views/Wallet/WalletForm.vue";

const routes = [
    {
        path: "",
        name: "HomeComponent",
        component: HomePage,
    },
    {
        path: "/wallet",
        name: "WalletForm",
        component: WalletForm,
    },
    {
        path: "/wallet/create",
        name: "WalletCreate",
        component: WalletCreate,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
