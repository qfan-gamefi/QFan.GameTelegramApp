<template>
    <div v-if="!hasLoaded" class="loading-screen">
        <div class="woodwork-loader">
            <div class="runner"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "LoadingScreen",
    components: {},
    props: {
        hasLoaded: {
            type: Boolean,
            required: true,
        },
    },
    watch: {},
});
</script>

<style scoped>
.loading-screen {
    display: inline-grid;
    width: 100%;
    aspect-ratio: 2;
    align-items: center;
    position: absolute;
    top: 50%;
    transform: translate(0%, -50%);
    height: 100%;
    background-image: url("./../../../public/assets/Loading.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

.woodwork-loader {
    width: 90%;
    height: 15px;
    border-radius: 15px;
    color: #ff5c00;
    border: 1px solid #270000;
    position: absolute;
    overflow: visible;
    bottom: 20%;
    transform: translate(5%, 0);
}

.woodwork-loader::before {
    content: "";
    position: absolute;
    top: 0;
    margin: 2px;
    inset: 0 100% 0 0;
    border-radius: inherit;
    background-image: url("./../../../public/assets/mining/back-run.png");
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
}

.runner {
    position: absolute;
    width: 15px;
    height: 15px;
    background-image: url("./../../../public/assets/mining/fire-gif.gif");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    animation: run 20s infinite;
    /* margin-left: -16px;
    left: var(--pseudo-width); */
}

@keyframes run {
    0% {
        left: 0;
    }
    100% {
        left: 100%;
    }
}
</style>
