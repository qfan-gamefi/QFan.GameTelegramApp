<template>
    <div class="airdrop-page fade-in">
        <div class="absolute w-full top-[35%] px-5 flex flex-col gap-5">
            <div class="p-3 bg-[#003702] rounded-lg border border-[#129900]">
                <div
                    v-for="(item, index) in title_airdrop"
                    :key="index"
                    class="p-3 flex w-full items-center border-b-2 border-b-[#129900] gap-3"
                >
                    <div><img :src="item.image" class="w-[40px]" /></div>
                    <div>{{ item.text }}</div>
                </div>
            </div>
            <div>
                <button :disabled="true" @click="checkAirdrrop()">
                    <span v-if="loading">
                        <i class="fa-solid fa-spinner fa-spin"></i> Loading...
                    </span>
                    CHECK AIRDROP
                </button>
            </div>
        </div>
    </div>

    <NotificationToast
        v-if="showNotification"
        :message="notificationMessage"
        :type="notificationType"
        @close="showNotification = false"
    />
</template>

<script lang="ts">
// import { useApiNetWork } from "@/services/apiClient";
import { useApiNetWork } from "@/services/apiClient";
import { IAirdrop } from "./defination-airdrop";
import { defineComponent } from "vue";
import NotificationToast from "@/components/NotificationToast.vue";
import BackButtonTelegram from "@/mixins/BackButtonTelegram";

export default defineComponent({
    name: "AirdropPage",
    mixins: [BackButtonTelegram],
    components: {
        NotificationToast,
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            showNotification: false,
            notificationMessage: "",
            notificationType: "",
            loading: false,
            userId: userInfo?.user?.id || "",
            title_airdrop: [
                { image: "/assets/airdrop/cup.png", text: "BADGE BETA TESTER" },
                { image: "/assets/airdrop/cup.png", text: "LEVEL BADGES" },
                { image: "/assets/airdrop/cup.png", text: "MASTER MINER" },
                { image: "/assets/airdrop/cup.png", text: "MINI GAME" },
                { image: "/assets/airdrop/cup.png", text: "REFFERALS" },
            ],
            dataAirdrop: {} as IAirdrop,
        };
    },
    methods: {
        async renderNotification(message, type) {
            this.notificationMessage = message;
            this.notificationType = type;
            this.showNotification = true;
        },
        async renderSuccess(text: string) {
            this.renderNotification(text, "success");
        },
        async renderErr(text) {
            this.renderNotification(text, "error");
        },
        async checkAirdrrop() {
            try {
                const res = await useApiNetWork.check_airdrop(this.userId);
                // this.dataAirdrop = res?.data?.[0]
                this.renderSuccess(
                    `Congratulations! You will be airdropped ${res?.data?.[0]?.amount} Quai`
                );
            } catch (error) {
                this.renderErr(`Error`);
            }
        },
    },
});
</script>

<style scoped lang="scss">
button {
    padding: 15px;
    border: 2px solid #003702;
    border-radius: 8px;
    color: #760000;
    font-weight: bold;
}
button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.airdrop-page {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    left: 0;
    z-index: 998;
    color: #fff;
    background-image: url("/assets/airdrop/bg_air.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}
</style>
