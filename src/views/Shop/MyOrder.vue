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
    <div class="box-item h-[calc(100vh-200px)] p-[10px_15px] overflow-auto">
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
                                formattedBalance(item?.price)
                            }}</span>
                        </div>
                        <div class="qty-row">
                            <span>{{ $t("remain_qtty") }}:</span>
                            <span class="qty-value">
                                <!-- {{ item?.Count }}/{{ item?.OriginCount }} -->
                                {{ item?.remainingQuantity }}/{{ item?.quantity }}
                            </span>
                        </div>
                        <div class="amount-row">
                            <span>{{ $t("amount") }}:</span>
                            <span class="amount-value">
                                {{
                                    formattedBalance(
                                        item?.quantity * Number(item?.price)
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
                        <!-- <div>{{ $t(renderStatus(item)) }}</div> -->
                        <div>{{ renderStatus(item) }}</div>
                        <!-- <div
                            class="text-[10px]"
                            v-if="
                                item?.Status === 'A' &&
                                item?.Count !== item?.OriginCount
                            "
                        >
                            (Partial Filled)
                        </div> -->
                    </div>

                    <div class="text-[9px]">
                        <div
                            class="font-extrabold text-xs"
                            :class="classBS(item)"
                        >
                            <!-- {{ $t(renderBS(item)) }} -->
                            {{ renderBS(item) }}
                        </div>
                        <div class="status-date">
                            {{ formatDateDDMMYYYY(item?.createdAt) }}
                        </div>

                        <div class="status-clock">
                            {{ formatTime(item?.createdAt) }}
                        </div>

                        <div v-if="item?.status === ('UNCONFIRMED' || 'OPEN' || 'PARTIAL')">
                            <button @click="handleCancelOrder(item?.id, item)">
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
import axios from "axios";

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
            userId: userInfo?.user?.id || "2123800227",
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
            itemCancel: {},
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
            return item?.status
            // if (item?.Status === "A") {
            //     return "active";
            // }
            // if (item?.Status === "FF") {
            //     return "full_filled";
            // }
            // if (item?.Status === "CC") {
            //     return "cancel";
            // }
        },
        renderBS(item: IOrderList) {
            return item?.side
            if (item.Side === "B") {
                return "buy";
            }
            if (item.Side === "S") {
                return "sell";
            }
        },
        classBS(item: IOrderList) {
            if (item.side === "BUY") {
                return `text-[#2ebd85]`;
            }
            if (item.side === "SELL") {
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
                // const res = await userServiceInventory.callOrderShop(
                //     this.userId
                // );
                const data = await axios.get(
                    `https://5615-171-224-177-67.ngrok-free.app/api/v1/order/getUserItemOrderList?UserId=${this.userId}`, {
                        headers: {
                            "ngrok-skip-browser-warning": "1",}}
                );
                const res = JSON.parse(data.data.message)
                console.log(res?.data);
                this.listOrderBuy = res?.data?.filter(item => item?.side == 'BUY');
                this.listOrderSell = res?.data?.filter(item => item?.side == 'SELL');
                this.listOrder = res?.data
            } catch (error) {
                console.log(error);
            }
        },
        async handleCancelOrder(id: number, item) {
            // this.isMaintenance = true
            this.showPopup = true;
            this.itemId = id;
            this.itemCancel = item;
            console.log(item);
            
        },
        async handleYes() {
            try {
                this.loadingBtn = true;
                // const res = await userServiceInventory.cancelOrder(
                //     this.itemId,
                //     this.userId
                // );
                console.log(this.itemCancel);
                
                const data = await axios.post(
                    `https://5615-171-224-177-67.ngrok-free.app/api/v1/order/cancelOrder`, {
                        
                    "itemDefId": this.itemCancel?.code,
                    "userId": "2123800227",
                    "price": Number(this.itemCancel.price),
                    "count": this.itemCancel.quantity,
                    "priceType": "QFP",
                    "orderId": this.itemCancel.id
                
                    } ,{
                        headers: {
                            "ngrok-skip-browser-warning": "1",}}
                );
                const res = data.status == 200 ? JSON.parse(data.data.message) : {};
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
