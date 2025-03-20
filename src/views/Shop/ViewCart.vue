<template>
    <div v-bind:class="{ 'overlay-template': isViewCart }"></div>
    <transition name="popup">
        <div class="popup-template" v-if="isViewCart">
            <div class="header">
                <div class="m-auto f-bangopro">{{ $t('order_confirm')?.toUpperCase() }}</div>

                <div @click="handleCloseCart" class="close-view-cart">
                    <i class="fa-solid fa-rectangle-xmark"></i>
                </div>
            </div>

            <div class="p-2 bg-[#00165a]">
                <div class="bg-[#0b3393] p-1 rounded-md" :key="detailCart?.id">
                    <div class="mb-1">
                        <div
                            class="flex gap-1"
                            v-if="currentPage !== 'inventory'"
                        >
                            <div
                                :class="[
                                    'buy-sell-item',
                                    {
                                        active: activeTab === 'buy',
                                        inactive: activeTab !== 'buy',
                                    },
                                ]"
                                @click="setActiveTab('buy')"
                            >
                                {{ $t('buy') }}
                            </div>
                            <div
                                :class="[
                                    'buy-sell-item',
                                    {
                                        active: activeTab === 'sell',
                                        inactive: activeTab !== 'sell',
                                    },
                                ]"
                                @click="setActiveTab('sell')"
                            >
                                {{ $t('sell') }}
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <div class="w-[80px]">
                            <img
                                class="w-[80px] object-cover rounded-md flex"
                                :src="detailCart?.ImageUrl"
                                :alt="detailCart?.Description"
                            />
                        </div>
                        <div
                            class="flex flex-col gap-1 w-[calc(100%-68px)] text-[10px] font-extrabold"
                        >
                            <div
                                class="flex justify-between px-1 text-[#6c757d] uppercase"
                            >
                                <div>{{ $t('buy') }}</div>
                                <div>{{ $t('price') }}</div>
                                <div>{{ $t('sell') }}</div>
                            </div>

                            <div class="flex relative">
                                <div
                                    class="bg-[#2ebd856b] h-[15px]"
                                    :style="{ width: calcWithTotal('buy') }"
                                >
                                    <div class="absolute left-1">
                                        {{
                                            formattedBalance(
                                                detailCart?.TotalBUY
                                            )
                                        }}
                                    </div>
                                </div>
                                <div
                                    class="bg-[#f6465d5c] text-right"
                                    :style="{
                                        width: calcWithTotal('sell'),
                                    }"
                                >
                                    <div class="absolute right-1">
                                        {{
                                            formattedBalance(
                                                detailCart?.TotalSell
                                            )
                                        }}
                                    </div>
                                </div>
                            </div>

                            <div
                                class="flex gap-2 justify-between"
                                v-for="(item, index) in listDetail"
                                :key="index"
                            >
                                <div class="flex-1 flex relative justify-end">
                                    <div class="absolute left-1">
                                        {{ renderCount("buy", item) }}
                                    </div>
                                    <div
                                        class="bg-[#2ebd856b] text-right h-[15px]"
                                        :style="{
                                            width: calcWithItem('buy', item),
                                        }"
                                    >
                                        <div class="absolute right-1">
                                            {{ renderPrice("buy", item) }}
                                        </div>
                                    </div>
                                </div>

                                <div class="flex-1 flex justify-start relative">
                                    <div
                                        class="bg-[#f6465d5c] h-[15px]"
                                        :style="{
                                            width: calcWithItem('sell', item),
                                        }"
                                    >
                                        <div class="absolute left-1">
                                            {{ renderPrice("sell", item) }}
                                        </div>
                                    </div>
                                    <div class="absolute right-1">
                                        {{ renderCount("sell", item) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="cart-payment">
                <div class="price-quantity">
                    <div class="price flex-1">
                        <InputSelect
                            v-model="price"
                            label="price"
                            placeholder="enter_price"
                            :options="quaiOptions"
                            v-model:selectedOption="selectedOption"
                            type="number"
                        />
                    </div>
                    <div class="quantity flex-1">
                        <InputNumber
                            v-model="quantity"
                            label="quantity"
                            placeholder="enter_quantity"
                        />
                    </div>
                </div>

                <div class="desc-payment">
                    <div class="amount">
                        <div>{{ $t('amount') }}</div>
                        <div>{{ renderAmount() }}</div>
                    </div>
                    <div class="fee">
                        <div>{{ $t('fee') }} ({{ orderFee?.ValueType }})</div>
                        <div>{{ renderFee() }}</div>
                    </div>
                    <div class="total-payment">
                        <div v-if="activeTab === 'sell'">
                             {{ $t('total_amount_received') }}
                        </div>
                        <div v-else>{{ $t('total_payment') }}</div>
                        <div>{{ renderTotal() }}</div>
                    </div>
                    <div class="text-note" v-if="activeTab === 'sell'">
                        ( {{ $t('tax_info') }} )
                    </div>
                </div>

                <div>
                    <div
                        @click="submitData()"
                        :class="[
                            'order-btn f-bangopro',
                            {
                                'buy-active': activeTab === 'buy',
                                'sell-active': activeTab === 'sell',
                            },
                        ]"
                    >
                    {{ $t('order') }}
                    </div>
                </div>
            </div>
        </div>
    </transition>

    <NotificationToast
        v-if="showNotification"
        :message="notificationMessage"
        :type="notificationType"
        @close="showNotification = false"
    />

    <PopupConfirm
        v-if="isBuySell"
        :text="textConfirm"
        :visible="isBuySell"
        :loading="loadingBtn"
        @yes="yesBuySell"
        @no="noBuySell"
    />

    <PopupPassword :visible="isPass" @cancel="cancelPass()" />

    <PopupComingSoon
        :visible="isMaintenance"
        message="under_maintenance"
        @close="isMaintenance = false"
    />
</template>

<script lang="ts">
import InputNumber from "@/components/Input/InputNumber.vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import NotificationToast from "@/components/NotificationToast.vue";
import PopupComingSoon from "@/components/popup/PopupComingSoon.vue";
import PopupPassword from "@/components/popup/PopupPassword.vue";
import PopupConfirm from "@/components/PopupConfirm.vue";
import { EItemDefType, IItemInventory } from "@/interface";
import userServiceInventory from "@/services/inventoryService";
import { debounce, formattedBalance, trackEventBtn } from "@/utils";
import {
    IDetailCart,
    TabTypeBS,
    IFeeVat,
    IItemOrderConfirm,
} from "@/views/Shop/defination";
import axios from "axios";
import { defineComponent, PropType } from "vue";
import { mapState } from "vuex";

export default defineComponent({
    name: "ViewCartPage",
    components: {
        NotificationToast,
        InputSelect,
        InputNumber,
        PopupConfirm,
        PopupPassword,
        PopupComingSoon
    },
    computed: {
        ...mapState(["rewardInfo"]),
    },
    props: {
        isViewCart: {
            type: Boolean,
            default: false,
        },
        detailCart: {
            type: Object as PropType<IDetailCart>,
            required: true,
        },
        currentPage: {
            type: String as () => "inventory" | "",
            required: false,
        },
        dataInventory: {
            type: Array as PropType<IItemInventory[]>,
            required: false,
        }
    },
    watch: {
        isViewCart(newValue) {
            if (newValue) {
                this.initializeValues();
                this.getTopOrder();
            }
        },
    },
    created() {
        if(!this.currentPage){
            this.getInventory();
        }else{
            this.itemsInventory = this.dataInventory;
        }
        this.getFee();
        this.yesBuySell = debounce(this.yesBuySell, 500);
    },
    mounted() {
        this.initializeValues();
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            keyboardOpen: false,
            userId: userInfo?.user?.id || "2123800227",
            showNotification: false,
            notificationMessage: "",
            notificationType: "",
            activeTab: "buy" as TabTypeBS,
            price: 0,
            quantity: 1,
            itemsInventory: [] as IItemInventory[],

            orderFee: {} as IFeeVat,
            vat: 0,

            selectedOption: "QFP",
            qOptions: ["QFP"],

            countTotalBuy: 0,
            countTotalSell: 0,
            countTotal: 0,
            listDetail: [],

            isBuySell: false,
            textConfirm: "confirm_buy",
            isPass: false,
            loadingBtn: false,
            isMaintenance: false,
        };
    },
    methods: {
        formattedBalance,
        initializeValues() {
            this.price = Number(this.detailCart?.goodbuyprice) || 0;
            this.quantity = 1;
            if (this.currentPage === "inventory") {
                this.activeTab = "sell";
            } else {
                this.activeTab = "buy";
            }
        },
        calcWithTotal(type: "buy" | "sell") {
            const total =
                Number(this.detailCart?.TotalBuy) + Number(this.detailCart?.TotalSell);
            const result = (this.detailCart?.TotalBuy / total) * 100;
            const roundedResult = parseFloat(result?.toFixed(2));

            if (type == "buy") {
                return `${roundedResult}%`;
            } else {
                const value = (100 - roundedResult)?.toFixed(2);
                return `${value}%`;
            }
        },
        calcWithItem(type: "buy" | "sell", item: IItemOrderConfirm) {
            if (type === "buy") {
                const widthBuy = (item?.countBuy / this.countTotalBuy) * 100;
                const roundedResult = parseFloat(widthBuy.toFixed(2)) || 0;
                return `${roundedResult}%`;
            } else {
                const widthSell = (item?.countSell / this.countTotalSell) * 100;
                const roundedResult = parseFloat(widthSell.toFixed(2)) || 0;
                return `${roundedResult}%`;
            }
        },
        renderCount(type: "buy" | "sell", item: IItemOrderConfirm) {
            if (type === "buy") {
                const result = item?.countBuy == 0 ? null : item?.countBuy;
                return Number(result);
            } else {
                const result = item?.countSell == 0 ? null : item?.countSell;
                return Number(result);
            }
        },
        renderPrice(type: "buy" | "sell", item: IItemOrderConfirm) {
            const price = type === "buy" ? item?.priceBuy : item?.priceSell;
            const formatted = formattedBalance(price);
            return formatted == 0 ? null : formatted;
        },
        setActiveTab(tab: TabTypeBS) {
            this.activeTab = tab;
            this.quantity = 1;

            if (tab === "buy") {
                const minPriceSell = Math.min(
                    ...this.listDetail
                        .filter((item) => item?.priceSell >= 0)
                        .map((item) => item?.priceSell)
                ); //min sell

                this.price = minPriceSell;
                // this.price = this.detailCart?.GoodBuyPrice;
                // this.bestPrice = this.detailCart?.GoodBuyPrice;
            }
            if (tab === "sell") {
                const maxPriceBuy = Math.max(
                    ...this.listDetail.map((item) => item.priceBuy)
                ); // max buy

                this.price = maxPriceBuy;
                // this.price = this.detailCart?.GoodSellPrice;
                // this.bestPrice = this.detailCart?.GoodSellPrice;
            }
        },
        async renderNotification(message, type) {
            this.notificationMessage = message;
            this.notificationType = type;
            this.showNotification = true;
            setTimeout(() => {
                this.showNotification = false;
            }, 2000);
        },
        async renderSuccess(text: string) {
            this.renderNotification(text, "success");
        },
        async renderErr(text) {
            this.renderNotification(text, "error");
        },
        getBtnClass() {
            if (this.detailCart?.Side === "S") {
                return "sell-btn";
            }
            if (this.detailCart?.Side === "B") {
                return "buy-btn";
            }
            return "";
        },
        handleCloseCart() {
            this.$emit("close");
        },
        async getFee() {
            try {
                const res = await userServiceInventory.getFeeConfig();
                const data = res;
                const dataOrderFee = data?.find(
                    (item) => item.ConfigCode === "OrderFee"
                );
                const dataVat = data?.find((item) => item.ConfigCode === "VAT");

                this.orderFee = JSON.parse(dataOrderFee?.ConfigValue);
                this.vat = JSON.parse(dataVat?.ConfigValue);
            } catch (error) {
                console.error("Error", error);
            }
        },
        async getInventory() {
            try {
                const res = await userServiceInventory.getListInventory(
                    Number(this.userId)
                );
                const filterData = res?.Items?.filter(
                    (item) => item?.ItemDef?.Type === EItemDefType.Common
                );
                this.itemsInventory = filterData;
            } catch (error) {
                console.error(error);
            }
        },
        async getTopOrder() {
            // const data = await userServiceInventory.getTopOrder(
            //     this.detailCart.itemdefid
            // );
            const res = await axios.get(
                `https://94ad8d17454c.ngrok.app/inventory/api/v1/order/getTopOrder5?ItemDefId=${this.detailCart.ItemDefId}`, {
                    headers: {
                        "ngrok-skip-browser-warning": "1",}}
            );
            const data = JSON.parse(res.data.message)
            console.log(data);

            // const buyList = data?.BuyList || [];
            const buyList = data?.filter(item => item?.side == 'BUY') || [];
            // const countTotalBuy = buyList?.reduce(
            //     (total, item) => total + item.Count,
            //     0
            // );
            const countTotalBuy = buyList?.reduce(
                (total, item) => total + Number(item.totalQuantity),
                0
            );
            console.log(countTotalBuy);
            
            this.countTotalBuy = countTotalBuy || 0;

            // const sellList = data?.SellList || [];
            const sellList = data?.filter(item => item?.side == 'SELL') || [];
            // const countTotalSell = sellList?.reduce(
            //     (total, item) => total + item.Count,
            //     0
            // );
            const countTotalSell = sellList?.reduce(
                (total, item) => total + Number(item.totalQuantity),
                0
            );
            this.countTotalSell = countTotalSell || 0;

            this.countTotal = countTotalBuy + countTotalSell;

            const isBuyBiggerSell = buyList.length >= sellList.length;
            const mergedList = (isBuyBiggerSell ? buyList : sellList).map(
                (item, index) => {
                    const otherItem =
                        (isBuyBiggerSell ? sellList[index] : buyList[index]) ||
                        {};

                    return {
                        ItemDefId: item?.itemdefid || otherItem?.itemdefid,
                        priceBuy: isBuyBiggerSell
                            ? item?.price || 0
                            : otherItem?.price || 0,
                        priceSell: isBuyBiggerSell
                            ? otherItem?.price || 0
                            : item?.price || 0,
                        countBuy: isBuyBiggerSell
                            ? item?.totalQuantity || 0
                            : otherItem?.totalQuantity || 0,
                        countSell: isBuyBiggerSell
                            ? otherItem?.totalQuantity || 0
                            : item?.totalQuantity || 0,
                        priceType: item?.PriceType || otherItem?.PriceType,
                        ItemDef: item?.ItemDef || otherItem?.ItemDef,
                    };
                }
            );

            const minPriceSell = Math.min(
                ...mergedList
                    .filter((item) => item?.priceSell >= 0)
                    .map((item) => item?.priceSell)
            ); //min sell
                console.log(mergedList);
                
            this.price = minPriceSell;
            this.listDetail = mergedList;
        },
        async yesBuySell() {
            const detailCart: IDetailCart = this.detailCart;
            const balance =
                this.rewardInfo?.attributes?.qpoint?.data?.attributes?.balance;

            const findItem = this.itemsInventory?.find(
                (el) => el.ItemDefId === this.detailCart.ItemDefId
            );
            const countItem = findItem?.ItemCount;

            const valueQuantity = Number(this.quantity);
            const valuePrice = Number(this.price);
            const total = valuePrice * valueQuantity;

            const payload = {
                itemDefId: detailCart?.ItemDefId,
                userId: this.userId,
                price: valuePrice,
                quantity: valueQuantity,
                priceType: this.selectedOption,
            };

            const handleResponse = async (response, successMsg) => {
                trackEventBtn({
                    label: this.activeTab,
                });
                if (response) {
                    await this.renderSuccess(successMsg);
                    this.$emit("closeCallApi");
                } else {
                    await this.renderErr(`Error`);
                }
            };

            try {
                this.loadingBtn = true
                if (this.activeTab === "buy") {
                    if (balance < total) {
                        await this.renderErr(`insufficient_balance`);
                    } else {
                        // const response =
                        //     await userServiceInventory.makeBuyOrder(payload);
                        const response = await axios.post(`https://94ad8d17454c.ngrok.app/inventory/api/v1/order/makeBuyOrder`, payload);
                        const res = response.status == 200 ? JSON.parse(response.data.message) : {};
                        console.log(res);
                        
                        await handleResponse(res, `noti.buy_success`);
                    }
                } else if (this.activeTab === "sell") {
                    if (valueQuantity > countItem) {
                        await this.renderErr(`insufficient_quantity`);
                    } else {
                        // const response =
                        //     await userServiceInventory.makeSellOrder(payload);
                        const response = await axios.post(`https://94ad8d17454c.ngrok.app/inventory/api/v1/order/makeSellOrder`, payload);
                        const res = response.status == 200 ? JSON.parse(response.data.message) : {};
                        console.log(res);
                        await handleResponse(res, `noti.sell_success`);
                    }
                }
            } catch (error) {
                if (error?.response?.status === 401) {
                    this.isPass = true;
                    // localStorage.getItem("storePermission") === "true";
                }
            } finally{
                this.isBuySell = false;
                this.loadingBtn = false
            }
        },
        noBuySell() {
            this.isBuySell = false;
        },
        async submitData() {
            // this.isMaintenance = true
            if (this.activeTab == "buy") {
                this.textConfirm = `confirm_buy`;
            } else {
                this.textConfirm = `confirm_sell`;
            }
            this.isBuySell = true;
        },
        renderFee() {
            return this.orderFee?.Value;
        },
        renderVat() {
            return this.vat?.Value;
        },
        renderAmount() {
            const value = this.price * this.quantity || 0;
            return formattedBalance(value);
        },
        renderTotal() {
            const amount = this.price * this.quantity;
            let result = 0;
            if (this.activeTab === "sell") {
                result = amount * (1 - Number(this.vat?.Value) / 100) || 0;
            }
            if (this.activeTab === "buy") {
                result = amount + Number(this.orderFee?.Value) || 0;
            }
            return formattedBalance(result); // parseFloat(result.toFixed(2));
        },
        cancelPass() {
            this.isPass = false;
        },
    },
});
</script>

<style scoped lang="scss">
// @import "@/styles/global.scss";
@import "@/styles/animation/popup.scss";

$t-white-color: rgb(255, 255, 255);

.overlay-template {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 999;
}

.popup-template {
    height: auto;
    position: absolute;
    width: 100%;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 999;
    padding: 0 10px;
}

.header {
    display: flex;
    justify-content: space-between;
    padding: 20px 15px;
    background-image: url("/assets/shop/banner-shop.png");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    .title {
        margin: 0 auto;
    }
}

.cart-payment {
    color: $t-white-color;
    padding: 10px 15px;
    background-image: url("/assets/shop/banner-shop.png");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    .price-quantity {
        display: flex;
        gap: 10px;
        padding: 5px 15px 10px;
        border-bottom: 1px solid #00165a85;
    }

    .desc-payment {
        padding: 10px 0;
    }
    .text-note,
    .amount,
    .fee,
    .total-payment {
        display: flex;
        justify-content: space-between;
        padding: 3px 15px;
    }

    .text-note {
        font-size: 10px;
        color: #f8d681;
    }
}

.buy-sell-item {
    padding: 5px;
    cursor: pointer;
    border-radius: 5px;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: center;
    font-size: 14px;
}
.buy-sell-item:hover {
    opacity: 0.8;
}
.buy-sell-item:nth-child(1) {
    background-color: #2ebd85;
    color: white;
}
.buy-sell-item:nth-child(2) {
    background-color: #f6465d;
    color: white;
}
.active {
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
}
.buy-active {
    background-color: #2ebd85;
}
.sell-active {
    background-color: #f6465d;
}
.buy-sell-item.inactive {
    background-color: #6c757d;
}

.order-btn {
    text-align: center;
    border-radius: 5px;
    padding: 10px;
    color: $t-white-color;
}
</style>
