<template>
    <transition name="popup-fade">
        <div
            class="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[9999] text-center"
            v-if="visible"
        >
            <div class="popup-coming-soon">
                <p class="mb-3">{{ $t(message) }}</p>
                <button class="btn-close" @click="closePopup">{{ $t("close") }}</button>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "PopupComingSoon",
    props: {
        visible: {
            type: Boolean,
            required: true,
        },
        message: {
            type: String,
            default: "coming_soon",
        },
    },
    emits: ["close"],
    methods: {
        closePopup() {
            this.$emit("close");
        },
    },
});
</script>

<style scoped>
@import "@/styles/global.scss";
@import "@/styles/animation/popup.scss";

.popup-coming-soon {
    z-index: 999;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #00175f;
    padding: 20px;
    border: 1px solid #89a2ef;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    color: #fff;
}

.btn-close {
    font-size: 12px;
    border-radius: 4px;
    width: fit-content;
    margin: auto;
}
</style>
