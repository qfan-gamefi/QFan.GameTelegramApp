<template>
    <transition name="popup-fade">
        <div class="popup-container" v-if="visible">
            <div class="popup-content">
                <p class="f-bangopro">{{ text }}</p>
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
    props: {
        text: {
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
    z-index: 1000;
}

.popup-content {
    font-size: 12px;
    background: white;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
    position: relative;
    color: black;
}

.popup-buttons {
    display: flex;
    margin-top: 20px;
}

.popup-buttons button {
    margin: 0 10px;
    padding: 10px 20px;
    font-size: 12px;
}
</style>
