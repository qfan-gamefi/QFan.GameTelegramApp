<template>
    <transition name="popup-fade">
        <div class="popup-container" v-if="visible">

            <div class="popup-content">
                <div class="title f-bangopro">{{title}}</div>

                <slot name="content"></slot>

                <div class="popup-buttons">
                    <button @click="yes()">Yes</button>
                    <button @click="no()">No</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: "PopupComponent",
    props: {
        title: {
            type: String,
            required: true,
        },
        visible: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    methods: {
        yes() {
            this.$emit("yes");
        },
        no() {
            this.$emit("no");
        },
    },
};
</script>

<style scoped>
@import "@/styles/global.scss";
@import "@/styles/animation/popup.scss";

.popup-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    color: #000000;
}

.title {
    margin-bottom: 15px;
}

.popup-content {
    font-size: 12px;
    background: #fff;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    position: relative;
}

.popup-buttons {
    display: flex;
    gap: 10px
}

.popup-buttons button {
    padding: 10px 20px;
    font-size: 12px;
    color: #fff;
    border-radius: 5px;
}
</style>
