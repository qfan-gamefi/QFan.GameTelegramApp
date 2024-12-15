<template>
    <div class="airdrop-page fade-in">
    
        <div class="absolute w-full top-[35%] px-5 flex flex-col gap-5">
            <div class="p-1 bg-[#003702] rounded-lg border border-[#129900]">
                <div
                    v-for="(item, index) in title_airdrop"
                    :key="index"
                    class="p-2 flex w-full items-center border-b-2 border-b-[#129900] gap-3 last:border-b-0"
                >
                    <div><img :src="item.image" class="w-[35px]" /></div>
                    <div>{{ item.text }}</div>
                </div>
            </div>
            <div>
                <button :disabled="loading" @click="checkAirdrrop()">
                    CHECK AIRDROP
                    <span v-if="loading">
                        <i class="fa-solid fa-spinner fa-spin"></i> 
                    </span>
                </button>
            </div>
        </div>


        <div v-if="show_image" class="fixed inset-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center z-[9999]">
            <div class="w-4/5 absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <img :src="image_airdrop" class="w-full" />

                <div class="flex gap-1 absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2  bottom-[8%]">
                    <div>{{number_airdrop}}</div>
                    <img src="/assets/logo-quai.svg" class="w-[15px]" />
                </div>

                <div class="absolute top-[45%] right-0" @click="closeImg()">
                    <img src="/assets/x_icon.png" class="w-[18px] cursor-pointer"  />
                </div>
                
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
import { debounce } from "@/utils";

export default defineComponent({
    name: "AirdropPage",
    mixins: [BackButtonTelegram],
    components: {
        NotificationToast,
    },
    created() {
        this.checkAirdrrop = debounce(this.checkAirdrrop, 500);
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
                { image: "/assets/airdrop/cup.png", text: "BETA TESTER BADGE" },
                { image: "/assets/airdrop/cup.png", text: "LEVEL BADGES" },
                { image: "/assets/airdrop/cup.png", text: "MASTER MINER" },
                { image: "/assets/airdrop/cup.png", text: "MINI GAME" },
                { image: "/assets/airdrop/cup.png", text: "REFFERALS" },
            ],
            dataAirdrop: {} as IAirdrop,

            show_image: false,
            number_airdrop: 0,
            image_airdrop: "/assets/airdrop/lose_airdrop.png",
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
        closeImg(){
            this.show_image = false
            this.number_airdrop = 0
            this.image_airdrop = ""
        },
        async checkAirdrrop() {
            try {
                this.loading = true
                const res = await useApiNetWork.check_airdrop(this.userId);
                if(res?.data?.[0]?.amount){
                    this.show_image = true
                    this.image_airdrop = "/assets/airdrop/obtain_airdrop.png"
                    this.number_airdrop = res?.data?.[0]?.amount
                    // this.renderSuccess(
                    //     `Congratulations! You will be airdropped ${res?.data?.[0]?.amount} Quai`
                    // );
                }else{
                    this.show_image = true
                    this.image_airdrop = "/assets/airdrop/close_airdrop.png"
                }
                
            } catch (error) {
                this.renderErr(`Error`);
            }finally{
                this.loading = false
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
