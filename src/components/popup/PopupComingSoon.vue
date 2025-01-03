<template>
    <transition name="popup-fade">
        <div
            class="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[9999] text-center"
            v-if="visible"
        >
            <div class="popup-coming-soon">
                <p>{{ $t(message) }}</p>
                <button class="rounded-md" @click="closePopup">{{ $t("close") }}</button>
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
    background: white;
    padding: 20px;
    border: 1px solid #ccc;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

.popup-coming-soon p {
    color: black;
    margin-bottom: 10px;
}
</style>
