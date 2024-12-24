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
import "./styles/app.css";
import "./styles/animation/popup.scss";
import AutoMining from "./views/Home/AutoMining.vue";
import { GA_TRACKING_ID } from "./config/googleAnalytics";
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import vi from './locales/vi.json';
import zh from './locales/zh.json';

// @ts-ignore
window.Buffer = Buffer;
window.global = window;

// createApp(SampleGame).mount("#app");
const app = createApp(SampleGame);

router.afterEach((to) => {
    if (window.gtag) {
        window.gtag("config", GA_TRACKING_ID, {
            page_path: to.fullPath,
            page_title: to.name,
        });
    }
});

const messages = {
    en,
    vi,
    zh
  };
const i18n = createI18n({
    locale: 'vi',
    fallbackLocale: 'en',
    messages
  });

app.use(VueDragscroll);
app.use(router);
app.use(store);
app.component("AutoMining", AutoMining);
app.use(i18n);
app.mount("#app");
