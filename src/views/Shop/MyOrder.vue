<template>
    <div class="w-full flex justify-end bg-[#00165A] pt-2 pr-[15px]">
        <div class="w-20">
            <SelectBox
                v-model:value="selectedValue"
                :options="selectOptions"
                label="Chọn giá trị:"
            />
        </div>
    </div>
    <div
        class="box-item bg-[#00165A] h-[calc(100vh-145px)] p-[10px_15px] overflow-auto"
    >
        <div class="order-item" v-for="(item, index) in listOrder" :key="index">
            <div class="left-item">
                <div class="image">
                    <img :src="item?.ItemDef?.ImageUrl" />
                </div>
                <div class="content">
                    <div class="title text-[14px]">
                        {{ item?.ItemDef?.Code }}
                    </div>
                    <div class="desc">
                        <div class="price-row">
                            <span>Price:</span>
                            <span class="price-value">{{ item?.Price }}</span>
                        </div>
                        <div class="qty-row">
                            <span>Remain QTTY:</span>
                            <span class="qty-value">
                                {{ item?.Count }}/{{ item?.OriginCount }}
                            </span>
                        </div>
                        <div class="amount-row">
                            <span>Amount:</span>
                            <span class="amount-value">{{
                                item?.OriginCount * item?.Price
                            }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="right-item">
                <div class="status-container">
                    <div
                        class="status-info"
                        :class="['status-text', statusColorClass(item)]"
                    >
                        <div class="status-text">{{ renderStatus(item) }}</div>
                        <div
                            class="status-content"
                            v-if="
                                item?.Status === 'A' &&
                                item?.Count !== item?.OriginCount
                            "
                        >
                            (Partial Filled)
                        </div>
                    </div>

                    <div class="status-time">
                        <div class="font-extrabold" :class="classBS(item)">
                            {{ renderBS(item) }}
                        </div>
                        <div class="status-date">
                            {{ formatDateDDMMYYYY(item?.createdAt) }}
                        </div>

                        <div class="status-clock">
                            {{ formatTime(item?.createdAt) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import SelectBox from "@/components/Select/SelectBox.vue";
import userServiceInventory from "@/services/inventoryService";
import { formatDateDDMMYYYY, formatTime } from "@/utils";
import { IOrderList } from "@/views/Shop/defination";
import { defineComponent } from "vue";

export default defineComponent({
    name: "MyOrderPage",
    // props: {},
    components: {
        SelectBox,
    },
    created() {
        this.callOrderShop();
    },
    // setup() {

    //     watch(selectedValue, (newValue) => {
    //   calculateSomething(newValue);
    // })
    watch: {
        selectedValue(newValue) {
            if (newValue) {
                this.handleFilter(newValue);
            }
        },
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            userId: userInfo?.user?.id || "",
            listOrder: [] as IOrderList[],
            listOrderBuy: [] as IOrderList[],
            listOrderSell: [] as IOrderList[],
            selectedValue: "All",
            selectOptions: [
                { value: "All", text: "All" },
                { value: "Buy", text: "Buy" },
                { value: "Sell", text: "Sell" },
            ],
        };
    },
    methods: {
        formatDateDDMMYYYY,
        formatTime,
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
                return "Active";
            }
            if (item?.Status === "FF") {
                return "Full Filled ";
            }
            if (item?.Status === "CC") {
                return "Cancel ";
            }
        },
        renderBS(item: IOrderList) {
            if (item.Side === "B") {
                return "Buy";
            }
            if (item.Side === "S") {
                return "Sell";
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
        handleFilter(value: "Buy" | "Sell") {
            if (value == "Buy") {
                this.listOrder = this.listOrderBuy;
            } else if (value == "Sell") {
                this.listOrder = this.listOrderSell;
            } else {
                this.listOrder = this.listOrderBuy.concat(this.listOrderSell);
            }
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
    },
});
</script>

<style lang="scss" scoped>
$t-white-color: rgb(255, 255, 255);

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
    .left-item {
        display: flex;
        gap: 10px;
    }
    .right-item {
        display: flex;
    }
    .image {
        display: flex;
        img {
            width: 70px;
        }
    }

    .content {
        .title {
            -webkit-text-stroke: 0.5px $t-white-color;
            margin-bottom: 5px;
        }
    }
    .desc {
        display: flex;
        flex-direction: column;
        font-size: 12px;
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

    .status-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        text-align: right;

        .status-info {
            font-size: 12px;
            .status-content {
                font-size: 10px;
            }
        }
        .status-time {
            font-size: 9px;
        }
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
