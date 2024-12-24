import { createRouter, createWebHistory } from "vue-router";
// import Home from "../App.vue";
import HomePage from "@/views/Home/HomePage.vue";
import WalletCreate from "@/views/Wallet/WalletCreate.vue";
import WalletForm from "@/views/Wallet/WalletForm.vue";
import FlipPage from "@/views/Flip/FlipPage.vue";
import Wallet from "@/views/Wallet/Wallet.vue";
import InventoryPage from "@/views/Inventory/InventoryPage.vue";
import ShopPage from "@/views/Shop/ShopPage.vue";
import NFT from "@/views/NFT/NFT.vue";
import AirdropPage from "@/views/Airdrop/AirdropPage.vue";

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
    {
        path: "/inventory",
        name: "InventoryPage",
        component: InventoryPage,
    },
    {
        path: "/market",
        name: "ShopPage",
        component: ShopPage,
    },
    {
        path: "/shop",
        name: "Shop",
        component: NFT,
    },
    {
        path: "/airdrop",
        name: "AirdropPage",
        component: AirdropPage,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
