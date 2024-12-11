<template>
    <transition name="popup-fade">
        <div class="popup-container" v-if="visible">
            <div
                class="popup-content"
                :style="{ backgroundColor: backgroundColor, border: border }"
            >
                <div @click="no()" class="close-popup">
                    <i
                        class="fa-solid fa-rectangle-xmark"
                        style="color: #ff0000"
                    ></i>
                </div>
                <div class="title">
                    {{ title }}
                </div>

                <slot name="content"></slot>

                <div class="popup-buttons">
                    <button @click="yes()" :disabled="loading">
                        <span v-if="loading">
                            <i class="fa-solid fa-spinner fa-spin"></i> Loading...
                        </span>
                        <span v-else>
                            OK
                        </span>
                    </button>
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
        backgroundColor: {
            type: String,
            default: "#00175F",
        },
        border: {
            type: String,
            default: "1px solid #89A2EF",
        },
        visible: {
            type: Boolean,
            required: true,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
            required: false,
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

.close-popup {
    position: absolute;
    top: 3%;
    right: 3%;
}
.close-popup svg {
    font-size: 18px;
}

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
    padding-bottom: 5%;
}

.title {
    padding: 10px 0;
    margin: 0 10px;
    font-size: 12px;
    font-weight: 800;
}

.popup-content {
    font-size: 12px;
    border-radius: 5px;
    text-align: center;
    position: relative;
    color: #fff;
    border: 1px solid #89a2ef;
}

.popup-buttons {
    display: flex;
    gap: 10px;
    padding: 10px;
}

.popup-buttons button {
    padding: 10px 20px;
    font-size: 12px;
    color: #fff;
    border-radius: 5px;
}
.popup-buttons button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
