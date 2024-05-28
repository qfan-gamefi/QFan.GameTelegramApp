<template>
    <div class="popup-template" v-if="visible">
        <div class="box-template">
            <div @click="$emit('close')" class="close-to-home">
                <i class="fa-solid fa-xmark"></i>
            </div>

            <Loading :loading="loading" />
            <component :is="contentComponent"></component>
            <EmptyForm v-if="showEmptyFormEvent" />
        </div>
    </div>
</template>

<script>
export default {
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        contentComponent: {
            type: [Object, Function],
            required: true,
        },
    },
};
</script>

<style>
.popup-template {
    height: calc(100% - 57px);
    position: absolute;
    width: 100%;
    top: 45%;
    left: 50%;
    z-index: 999;
    animation: fadeInTemplate 0.1s ease forwards;

    background-image: url("./../../public/assets/event/background-event.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

@keyframes fadeInTemplate {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}

.box-template {
    padding: 20px;
    height: calc(100% - 40px);
}

.close-homeclose-to-home {
    position: absolute;
    top: 1%;
    right: 1%;
}
</style>
