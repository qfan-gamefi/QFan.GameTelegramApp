import SampleGame from "./App.vue";
import { createApp } from "vue";
import "./styles/global.scss";
import "./styles/common.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import VueDragscroll from "vue-dragscroll";
import router from "./router";
import store from "./store";
import { Buffer } from "buffer";
import "./index.css";
import "./styles/global.scss";
import AutoMining from "./views/Home/AutoMining.vue";

// @ts-ignore
window.Buffer = Buffer;
window.global = window;

// createApp(SampleGame).mount("#app");
const app = createApp(SampleGame);
app.use(VueDragscroll);
app.use(router);
app.use(store);
app.component("AutoMining", AutoMining);
app.mount("#app");
