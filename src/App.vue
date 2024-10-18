<script>
import AutoMining from "./views/Home/AutoMining.vue";

export default {
    components: {
        AutoMining,
    },
};
</script>

<!-- <style scoped>
@import "./styles/global.scss";
@import "./styles/app.css";
</style> -->

<template>
    <AutoMining />
    <router-view></router-view>
</template>
