import { createRouter, createWebHistory } from "vue-router";
// import Home from "../App.vue";
import HomePage from "@/views/Home/HomePage.vue";
import WalletCreate from "@/views/Wallet/WalletCreate.vue";
import WalletForm from "@/views/Wallet/WalletForm.vue";
import FlipPage from "@/views/Flip/FlipPage.vue";
import Wallet from "@/views/Wallet/Wallet.vue";

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
    {
        path: "/flip",
        name: "FlipPage",
        component: FlipPage,
    },
    {
        path: "/wallet/detail",
        name: "WalletDetail",
        component: Wallet,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
