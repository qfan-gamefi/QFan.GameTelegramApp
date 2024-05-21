import SampleGame from "./App.vue";
import { createApp } from "vue";
import "./styles/global.css";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";

// import "primevue/resources/themes/aura-light-green/theme.css";
import "primevue/resources/themes/saga-blue/theme.css"; // theme
import "primevue/resources/primevue.min.css"; // core css
import "primeicons/primeicons.css"; // icons
// import "primeflex/primeflex.css"; // utilities

// createApp(SampleGame).mount("#app");

const app = createApp(SampleGame);

app.use(PrimeVue);
app.use(ToastService);
app.component("Toast", Toast);

app.mount("#app");
