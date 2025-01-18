<template>
    <div class="loading-screen" v-if="!hasLoaded" loading="lazy">
        <img  class="w-20 absolute top-[10%] left-[50%] transform -translate-x-1/2" src='/assets/logo.svg' />
        <div class="woodwork-loader">
            <div class="runner"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";

export default defineComponent({
    name: "LoadingScreen",
    components: {},
    // props: {
    //     hasLoaded: {
    //         type: Boolean,
    //         required: true,
    //     },
    // },
    watch: {},
    computed: {
        ...mapState(["hasLoaded"]),
    },
});
</script>

<style scoped lang="scss">
.loading-screen {
    display: inline-grid;
    width: 100%;
    aspect-ratio: 2;
    align-items: center;
    position: absolute;
    top: 50%;
    transform: translate(0%, -50%);
    height: 100%;
    background-image: url("./../../../public/assets/Loading2.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    animation: fadeInLoadingScreen 1s ease-in-out;
}
@keyframes fadeInLoadingScreen {
    from {
        opacity: 0;
    }
    to {
        opacity: 0.5;
    }
}

.woodwork-loader {
    width: 90%;
    height: 10px;
    border-radius: 15px;
    color: #ff5c00;
    border: 2px solid #270000;
    position: absolute;
    overflow: visible;
    bottom: 15%;
    transform: translate(5%, 0);
}

.woodwork-loader::before {
    content: "";
    position: absolute;
    inset: 0 100% 0 0;
    border-radius: inherit;
    background-image: url("./../../../public/assets/mining/back-run.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    animation: runWoodwork 2s infinite;
}
@keyframes runWoodwork {
    0% {
        width: 0;
    }
    100% {
        width: calc(100%);
    }
}

.runner {
    position: absolute;
    width: 120px;
    height: 120px;
    background-image: url("./../../../public/assets/mining/fire-gif.gif");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    animation: run 2s infinite;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 0;
}

@keyframes run {
    0% {
        left: 0;
    }
    100% {
        left: calc(90% - 10px);
    }
}

@media (min-width: 460px) {
    .loading-screen {
        background-size: 100% 100%;
    }
}

@media (min-width: 560px) {
    .loading-screen {
        background-size: 100% 100%;
    }
}
</style>
