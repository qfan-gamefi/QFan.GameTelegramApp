import { createRouter, createWebHistory } from "vue-router";
import MissionsList from "../components/MissionsList.vue";
import Home from "../App.vue";

const routes = [
    {
        path: "/",
        name: "HomeComponent",
        component: Home,
    },
    {
        path: "/mission",
        name: "MissionComponent",
        component: MissionsList,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
