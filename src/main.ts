import SampleGame from "./App.vue";
import { createApp } from "vue";
import "./styles/global.scss";
import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";
import VueDragscroll from "vue-dragscroll";

// createApp(SampleGame).mount("#app");

const app = createApp(SampleGame);
app.use(VueDragscroll);

app.mount("#app");
