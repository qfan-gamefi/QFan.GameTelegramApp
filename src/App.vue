<script>
import AutoMining from "./views/Home/AutoMining.vue";
import AutoFlip from "./views/Flip/AutoFlip.vue";

export default {
    components: {
        AutoMining,
        AutoFlip
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
