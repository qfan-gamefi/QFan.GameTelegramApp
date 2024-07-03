import SampleGame from "./App.vue";
import { createApp } from "vue";
import "./styles/global.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import VueDragscroll from "vue-dragscroll";
import router from "./router";
import { Buffer } from "buffer";
import { setActiveNetwork } from "./storage/network";
import { DEFAULT_NETWORKS } from "./services/network/chains";

// @ts-ignore
window.Buffer = Buffer;

// createApp(SampleGame).mount("#app");
await setActiveNetwork(DEFAULT_NETWORKS[0].name);
const app = createApp(SampleGame);
app.use(VueDragscroll);
app.use(router);
app.mount("#app");
