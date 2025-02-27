<template>
    <div
        class="h-[calc(100vh-180px)] p-[10px_15px] overflow-auto flex flex-col gap-2"
    >
        <div
            class="border border-[#2f9ad6] px-2 py-1 rounded-md"
            v-for="(item, index) in listTransaction"
            :key="index"
        >
            <div class="text-[12px]">
                <div class="flex justify-between">
                    <span>{{ $t(item?.tranType?.toLowerCase()) }}</span>
                    <span class="font-extrabold">
                        <i
                            v-if="item?.opr === '+'"
                            class="fa-solid fa-plus fa-lg"
                            style="color: #00ff1e"
                        ></i>
                        <i
                            v-else-if="item?.opr === '-'"
                            class="fa-solid fa-minus fa-lg"
                            style="color: #db0000"
                        ></i>
                    </span>
                </div>

                <div class="flex justify-between">
                    <span class="">{{ $t("status") }}:</span>
                    <span :class="getStatusClass(item?.status)">
                        {{ $t(`stt.${item?.status?.toLowerCase()}`) }}</span
                    >
                </div>
                <div class="flex justify-between">
                    <span class="">{{ $t("amount") }}:</span>
                    <span>{{ item?.netAmount }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="">{{ $t("fee") }}:</span>
                    <span>{{ item?.fee }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="">{{ $t("received_amount") }}:</span>
                    <span>{{ item?.amount }}</span>
                </div>
                <div class="flex justify-between" v-if="item?.hash?.length > 5">
                    <span class="">{{ $t("hash") }}:</span>
                    <span class="underline" @click="linkHash(item?.hash)">{{
                        renderHash(item?.hash)
                    }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="">{{ $t("created_date") }}:</span>
                    <span>{{ formatDateTimeUS(item?.createdAt) }}</span>
                </div>
                <div v-if="item?.message" class="flex justify-between">
                    <span>{{ $t("message") }}:</span>
                    <span>{{ $t(renderMess(item?.message)) }}</span>
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
import NotificationToast from "@/components/NotificationToast.vue";
import { defineComponent } from "vue";
import userService from "@/services/userService";
import { IMarketTransactions, WalletTransactionStatus } from "./defination";
import { formatDateTimeUS } from "@/utils";
import { getTxLinkToExplorer } from "@/crypto_utils/networks";

export default defineComponent({
    name: "TransactionPage",
    // props: {},
    components: {
        NotificationToast,
    },
    created() {
        this.callTransaction();
    },
    watch: {},
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            userId: userInfo?.user?.id || "",
            showNotification: false,
            notificationMessage: "success",
            notificationType: "success",
            listTransaction: [] as IMarketTransactions[],
        };
    },
    methods: {
        formatDateTimeUS,
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
                const res = await userService.walletTrasnsaction(this.userId);
                this.listTransaction = res?.data;
            } catch (error) {
                console.log(error);
            }
        },

        renderHash(hash: string) {
            return `${hash?.slice(0, 6)}.......${hash?.slice(-6)}`;
        },
        getOprClass(opr) {
            return {
                "text-green-800": opr === "+",
                "text-red-800": opr === "-",
            };
        },
        getStatusClass(status) {
            return {
                "text-green-500": status === WalletTransactionStatus.SUCCESS,
                "text-yellow-500": status === WalletTransactionStatus.PENDING,
                "text-red-500": status === WalletTransactionStatus.FAILED,
                "text-blue-500": status === WalletTransactionStatus.PROCESSING,
            };
        },
        async linkHash(hash: string) {
            const exploreUrl = await getTxLinkToExplorer(hash);
            window.open(exploreUrl, "_blank");
        },
        renderMess(text: string) {
            if (text === "Transaction success") {
                return `transaction_success`;
            } else if (text === "Transaction rejected") {
                return `transaction_rejected`;
            } else {
                return text;
            }
        },
    },
});
</script>

<style lang="scss" scoped>
@import "@/styles/global.scss";

$t-white-color: rgb(255, 255, 255);
</style>
