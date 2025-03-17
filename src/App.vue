<script>
import AutoMining from "./views/Home/AutoMining.vue";
import AutoFlip from "./views/Flip/AutoFlip.vue";

export default {
    components: {
        AutoMining,
        AutoFlip,
    },
    data() {
        // const dataTelegram = window.Telegram?.WebApp?.initDataUnsafe;

        // const reqTelegramX = {
        //     id: dataTelegram?.user?.id,
        //     first_name: dataTelegram?.user?.first_name,
        //     username: dataTelegram?.user?.username,
        //     photo_url: dataTelegram?.user?.photo_url || "",
        //     auth_date: dataTelegram?.auth_date,
        //     hash: dataTelegram?.hash,
        // };
        // const jsonString = JSON.stringify(reqTelegramX);
        // const buf = jsonString && Buffer.from(jsonString, "utf-8");
        // const base64X = buf.toString("base64");

        // localStorage.setItem("auth-x", base64X);
        return {};
    },
};
</script>

<!-- <style scoped>
@import "./styles/global.scss";
@import "./styles/app.css";
</style> -->

<template>
    <AutoMining />
    <AutoFlip />
    <router-view></router-view>
</template>
