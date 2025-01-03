<template>
    <div class="header-actions">
        <div class="w-24">
            <SelectBox
                v-model:value="selectedStatus"
                :options="selectOptionsStatus"
                label="status"
            />
        </div>
        <div class="w-20">
            <SelectBox
                v-model:value="selectedValue"
                :options="selectOptions"
                label="btn.buy_sell"
            />
        </div>
    </div>
    <div class="box-item h-[calc(100vh-220px)] p-[10px_15px] overflow-auto">
        <div class="order-item" v-for="(item, index) in listOrder" :key="index">
            <div class="flex gap-[10px]">
                <div class="w-[60px]">
                    <img
                        class="object-cover"
                        :src="item?.ItemDef?.ImageUrl"
                        alt="order-img"
                        loading="lazy"
                    />
                </div>
                <div class="content text-xs">
                    <div class="title">
                        {{ item?.ItemDef?.Name }}
                    </div>
                    <div class="desc">
                        <div class="price-row">
                            <span>{{ $t("price") }}:</span>
                            <span class="price-value">{{
                                formattedBalance(item?.Price)
                            }}</span>
                        </div>
                        <div class="qty-row">
                            <span>{{ $t("remain_qtty") }}:</span>
                            <span class="qty-value">
                                {{ item?.Count }}/{{ item?.OriginCount }}
                            </span>
                        </div>
                        <div class="amount-row">
                            <span>{{ $t("amount") }}:</span>
                            <span class="amount-value">
                                {{
                                    formattedBalance(
                                        item?.OriginCount * item?.Price
                                    )
                                }}</span
                            >
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex">
                <div class="flex flex-col justify-between text-right">
                    <div class="text-xs" :class="[statusColorClass(item)]">
                        <div>{{ $t(renderStatus(item)) }}</div>
                        <div
                            class="text-[10px]"
                            v-if="
                                item?.Status === 'A' &&
                                item?.Count !== item?.OriginCount
                            "
                        >
                            (Partial Filled)
                        </div>
                    </div>

                    <div class="text-[9px]">
                        <div
                            class="font-extrabold text-xs"
                            :class="classBS(item)"
                        >
                            {{ $t(renderBS(item)) }}
                        </div>
                        <div class="status-date">
                            {{ formatDateDDMMYYYY(item?.createdAt) }}
                        </div>

                        <div class="status-clock">
                            {{ formatTime(item?.createdAt) }}
                        </div>

                        <div v-if="item?.Status === 'A'">
                            <button @click="handleCancelOrder(item?.id)">
                                {{ $t("cancel") }}
                            </button>
                        </div>
                    </div>
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

    <PopupPassword :visible="isPass" @cancel="isPass = false" />

    <PopupConfirm
        v-if="showPopup"
        text="do_you_want_cancel"
        :loading="loadingBtn"
        :visible="showPopup"
        @yes="handleYes()"
        @no="showPopup = false"
    />

    <PopupComingSoon
        :visible="isMaintenance"
        message="under_maintenance"
        @close="isMaintenance = false"
    />
</template>

<script lang="ts">
import NotificationToast from "@/components/NotificationToast.vue";
import SelectBox from "@/components/Select/SelectBox.vue";
import userServiceInventory from "@/services/inventoryService";
import { formatDateDDMMYYYY, formattedBalance, formatTime } from "@/utils";
import {
    BuySellOption,
    IOrderList,
    selectOptions,
    selectOptionsStatus,
    StatusOption,
} from "@/views/Shop/defination";
import { defineComponent } from "vue";
import PopupPassword from "@/components/popup/PopupPassword.vue";
import PopupConfirm from "@/components/PopupConfirm.vue";
import PopupComingSoon from "@/components/popup/PopupComingSoon.vue";

export default defineComponent({
    name: "MyOrderPage",
    // props: {},
    components: {
        SelectBox,
        NotificationToast,
        PopupPassword,
        PopupConfirm,
        PopupComingSoon
    },
    created() {
        this.callOrderShop();
    },
    watch: {
        selectedValue(newValue) {
            if (newValue) {
                this.handleFilter(newValue);
            }
        },
        selectedStatus(newValue) {
            if (newValue) {
                this.handleStatus(newValue);
            }
        },
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            userId: userInfo?.user?.id || "",
            showNotification: false,
            notificationMessage: "success",
            notificationType: "success",
            listOrder: [] as IOrderList[],
            listOrderBuy: [] as IOrderList[],
            listOrderSell: [] as IOrderList[],
            selectedValue: "All" as BuySellOption,
            selectedStatus: "All" as StatusOption,
            selectOptions,
            selectOptionsStatus,
            isPass: false,
            itemId: null,
            loadingBtn: false,
            showPopup: false,
            isMaintenance: false,
        };
    },
    methods: {
        formatDateDDMMYYYY,
        formatTime,
        formattedBalance,
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
        statusColorClass(item) {
            if (item?.Status === "A") {
                return "status-green";
            }
            if (item?.Status === "FF") {
                return "status-yellow";
            }
            if (item?.Status === "CC") {
                return "status-red";
            }
            return "";
        },
        renderStatus(item: IOrderList) {
            if (item?.Status === "A") {
                return "active";
            }
            if (item?.Status === "FF") {
                return "full_filled";
            }
            if (item?.Status === "CC") {
                return "cancel";
            }
        },
        renderBS(item: IOrderList) {
            if (item.Side === "B") {
                return "buy";
            }
            if (item.Side === "S") {
                return "sell";
            }
        },
        classBS(item: IOrderList) {
            if (item.Side === "B") {
                return `text-[#2ebd85]`;
            }
            if (item.Side === "S") {
                return `text-[#f6465d]`;
            }
        },
        applyFilters() {
            let filteredList = [];

            // Filter by Buy/Sell
            if (this.selectedValue === "Buy") {
                filteredList = this.listOrderBuy;
            } else if (this.selectedValue === "Sell") {
                filteredList = this.listOrderSell;
            } else {
                filteredList = this.listOrderBuy.concat(this.listOrderSell);
            }

            // Filter by Status
            if (this.selectedStatus !== "All") {
                filteredList = filteredList.filter(
                    (item) => item?.Status === this.selectedStatus
                );
            }

            this.listOrder = filteredList;
        },
        handleFilter(value: "Buy" | "Sell" | "All") {
            this.applyFilters();
        },
        handleStatus(value: "A" | "FF" | "CC" | "All") {
            this.applyFilters();
        },
        async callOrderShop() {
            try {
                const res = await userServiceInventory.callOrderShop(
                    this.userId
                );
                this.listOrderBuy = res?.data?.BuyList;
                this.listOrderSell = res?.data?.SellList;
                this.listOrder = res?.data?.BuyList.concat(res?.data?.SellList);
            } catch (error) {
                console.log(error);
            }
        },
        async handleCancelOrder(id: number) {
            this.isMaintenance = true
            // this.showPopup = true;
            // this.itemId = id;
        },
        async handleYes() {
            try {
                this.loadingBtn = true;
                const res = await userServiceInventory.cancelOrder(
                    this.itemId,
                    this.userId
                );
                if (res.success) {
                    this.renderSuccess("stt.success");
                    await this.callOrderShop();
                } else {
                    this.renderErr("stt.failed");
                }
            } catch (error) {
                if (error?.response?.status === 401) {
                    this.isPass = true;
                }
            } finally {
                this.loadingBtn = false;
                this.showPopup = false;
                this.itemId = null;
            }
        },
    },
});
</script>

<style lang="scss" scoped>
$t-white-color: rgb(255, 255, 255);

button {
    font-size: 12px;
    padding: 10px 12px;
    border-radius: 3px;
    letter-spacing: 0;
    font-weight: 600;
    cursor: pointer;
}
button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.header-actions {
    @apply flex justify-end border-b border-b-[#2f9ad6] mx-4 py-2 w-[calc(100%-30px)] gap-3 text-xs;
}

.box-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.order-item {
    padding: 10px 15px;
    background: #0b3393;
    border-radius: 5px;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    animation: fadeInZoom 0.1s ease forwards;

    .content {
        .title {
            -webkit-text-stroke: 0.5px $t-white-color;
            margin-bottom: 5px;
        }
    }
    .desc {
        display: flex;
        flex-direction: column;
    }

    .desc div {
        display: flex;
        justify-content: space-between;
        gap: 10px;
    }

    .price-value,
    .qty-value,
    .amount-value,
    .fee-value,
    .total-value {
        text-align: right;
    }
}

.status-green {
    color: #f8d681;
    -webkit-text-stroke: 0.5px #f8d681;
}

.status-yellow {
    color: #19be2a;
    -webkit-text-stroke: 0.5px #19be2a;
}

.status-red {
    color: #ff0000;
    -webkit-text-stroke: 0.5px #ff0000;
}

@keyframes fadeInZoom {
    0% {
        opacity: 0;
        transform: scale(0.8);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
