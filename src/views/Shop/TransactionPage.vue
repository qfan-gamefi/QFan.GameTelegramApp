<template>
    <div class="box-item h-[calc(100vh-220px)] p-[10px_15px] overflow-auto">
        <div class="order-item" v-for="(item, index) in listTransaction" :key="index">

        </div>
        <div>
            123
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
import NotificationToast from "@/components/NotificationToast.vue";
import { defineComponent } from "vue";
import userService from "@/services/userService";

export default defineComponent({
    name: "TransactionPage",
    // props: {},
    components: {
        NotificationToast,
    },
    created() {
        this.callTransaction();
    },
    watch: {
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            userId: userInfo?.user?.id || "",
            showNotification: false,
            notificationMessage: "success",
            notificationType: "success",
            listTransaction: [],
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
        
       
        async callTransaction() {
            try {
                const res = await userService.walletTrasnsaction(
                    this.userId
                );
                console.log(res);
                
                this.listTransaction = []
            } catch (error) {
                console.log(error);
            }
        },
    },
});
</script>

<style lang="scss" scoped>
@import "@/styles/global.scss";

$t-white-color: rgb(255, 255, 255);

</style>
