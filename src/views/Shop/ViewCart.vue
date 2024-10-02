<template>
    <div v-bind:class="{ 'overlay-template': isViewCart }"></div>

    <transition name="popup">
        <div class="popup-template close-popup" v-if="isViewCart">
            <div class="header">
                <div class="title">ORDER CONFIRM</div>

                <div @click="handleCloseCart" class="close-view-cart">
                    <i class="fa-solid fa-rectangle-xmark"></i>
                </div>
            </div>

            <div class="shop-items">
                <div class="shop-item" :key="detailCart?.id">
                    <div class="item-content">
                        <div class="item-image">
                            <img
                                :src="detailCart?.ItemDef?.ImageUrl"
                                :alt="detailCart?.ItemDef?.Description"
                            />
                        </div>
                        <div class="item-description">
                            <div class="item-title">
                                {{ detailCart?.ItemDef?.Code }}
                            </div>
                            <div class="item-price">
                                Best price: {{ bestPrice }}
                                {{ detailCart?.GoodPriceType }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="cart-payment">
                <div class="buy-sell" v-if="currentPage !== 'inventory'">
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
                        Buy
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
                        Sell
                    </div>
                </div>

                <div class="price-quantity">
                    <div class="price">
                        <!-- <InputField
                            v-model="price"
                            label="Price"
                            placeholder="Enter price"
                        /> -->

                        <InputSelect
                            v-model="price"
                            label="Price"
                            placeholder="Enter price"
                            :options="quaiOptions"
                            v-model:selectedOption="selectedOption"
                        />
                    </div>
                    <div class="quantity">
                        <InputField
                            v-model="quantity"
                            label="Quantity"
                            placeholder="Enter quantity"
                            type="number"
                        />
                    </div>
                </div>
                <div class="desc-payment">
                    <div class="amount">
                        <div>Amount</div>
                        <div>{{ renderAmount() }}</div>
                    </div>
                    <div class="fee">
                        <div>Fee ({{ this.orderFee?.ValueType }})</div>
                        <div>{{ renderFee() }}</div>
                    </div>
                    <!-- <div class="fee" v-if="activeTab === 'sell'">
                        <div class="vat">VAT</div>
                        <div>{{ renderVat() }}</div>
                    </div> -->
                    <div class="total-payment">
                        <div v-if="activeTab === 'sell'">
                            Total Amount Received
                        </div>
                        <div v-else>Total Payment</div>
                        <div>{{ renderTotal() }}</div>
                    </div>
                    <div class="text-note" v-if="activeTab === 'sell'">
                        ( You will be charge 10% as Value Added Tax )
                    </div>
                </div>

                <div>
                    <button
                        @click="submitData()"
                        :class="[
                            'order-btn',
                            {
                                'buy-active': activeTab === 'buy',
                                'sell-active': activeTab === 'sell',
                            },
                        ]"
                    >
                        Order
                    </button>
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
</template>

<script lang="ts">
import InputField from "@/components/Input/InputField.vue";
import InputSelect from "@/components/Input/InputSelect.vue";
import NotificationToast from "@/components/NotificationToast.vue";
import { EItemDefType, IItemInventory } from "@/interface";
import userServiceInventory from "@/services/inventoryService";
import { IDetailCart, TabTypeBS, IFeeVat } from "@/views/Shop/defination";
import { defineComponent, PropType } from "vue";
import { mapState } from "vuex";

export default defineComponent({
    name: "ViewCartPage",
    components: {
        InputField,
        NotificationToast,
        InputSelect,
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
    },
    watch: {
        isViewCart(newValue) {
            if (newValue) {
                this.initializeValues();
            }
        },
    },
    created() {
        this.getInventory();
        this.getFee();
    },
    mounted() {
        this.initializeValues();
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            userId: userInfo?.user?.id || "",
            showNotification: false,
            notificationMessage: "",
            notificationType: "",
            activeTab: "buy" as TabTypeBS,
            price: 0,
            quantity: 1,
            itemsInventory: [] as IItemInventory[],
            bestPrice: 0,

            orderFee: {} as IFeeVat,
            vat: 0,

            selectedOption: "QFP",
            quaiOptions: ["QFP"],
        };
    },
    methods: {
        initializeValues() {
            this.price = this.detailCart?.GoodBuyPrice || 0;
            this.bestPrice = this.detailCart?.GoodBuyPrice || 0;
            this.quantity = 1;
            if (this.currentPage === "inventory") {
                this.activeTab = "sell";
            } else {
                this.activeTab = "buy";
            }
        },
        setActiveTab(tab: TabTypeBS) {
            this.activeTab = tab;
            this.quantity = 1;
            if (tab === "buy") {
                this.price = this.detailCart?.GoodBuyPrice;
                this.bestPrice = this.detailCart?.GoodBuyPrice;
            }
            if (tab === "sell") {
                this.price = this.detailCart?.GoodSellPrice;
                this.bestPrice = this.detailCart?.GoodSellPrice;
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
        async submitData() {
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

            if (this.activeTab === "buy") {
                if (balance < total) {
                    await this.renderErr(`Your balance is insufficient`);
                } else {
                    try {
                        const response =
                            await userServiceInventory.makeBuyOrder(
                                detailCart?.ItemDefId,
                                this.userId,
                                valuePrice,
                                valueQuantity,
                                detailCart?.GoodPriceType || this.selectedOption
                            );
                        if (response.success) {
                            await this.renderSuccess(`Buy Success`);
                            this.handleCloseCart();
                        } else {
                            await this.renderErr(`Error`);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            }

            if (this.activeTab === "sell") {
                if (valueQuantity > countItem) {
                    await this.renderErr(`Your quantity is insufficient`);
                } else {
                    try {
                        const response =
                            await userServiceInventory.makeSellOrder(
                                detailCart?.ItemDefId,
                                this.userId,
                                valuePrice,
                                valueQuantity,
                                detailCart?.GoodPriceType || this.selectedOption
                            );

                        if (response.success) {
                            await this.renderSuccess(`Sell Success`);
                            this.handleCloseCart();
                        } else {
                            await this.renderErr(`Error`);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        },
        renderFee() {
            return this.orderFee?.Value;
        },
        renderVat() {
            return this.vat?.Value;
        },
        renderAmount() {
            const value = this.price * this.quantity;
            return value;
        },
        renderTotal() {
            const amount = this.price * this.quantity;
            if (this.activeTab === "sell") {
                const fee = 0;
                return amount * (1 - Number(this.vat?.Value) / 100);
            }
            if (this.activeTab === "buy") {
                return amount + Number(this.orderFee?.Value);
            }
        },
    },
});
</script>

<style scoped lang="scss">
$t-white-color: rgb(255, 255, 255);

.overlay-template {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.popup-template {
    height: auto;
    position: absolute;
    width: 100%;
    bottom: 0%;
    z-index: 999;
}
.popup-enter-active {
    animation: slideUp 0.1s ease forwards;
}

.popup-leave-active {
    animation: slideDown 0.1s ease forwards;
}

@keyframes slideUp {
    0% {
        opacity: 0;
        transform: translateY(100%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes slideDown {
    0% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    100% {
        opacity: 0;
        transform: translateY(100%) scale(0.5);
    }
}

.header {
    display: flex;
    justify-content: space-between;
    padding: 20px 15px;
    background-image: url("./../../../public/assets/shop/banner-shop.png");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    border-top-right-radius: 20px;
    border-top-left-radius: 20px;
    .title {
        margin: 0 auto;
    }
}

.shop-items {
    padding: 10px 15px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: #00165a;

    .shop-item {
        background: #0b3393;
        padding: 10px;
        border-radius: 5px;
        .item-content {
            display: flex;
            gap: 10px;
            .item-image {
                img {
                    width: 70px;
                    object-fit: cover;
                    border-radius: 5px;
                    display: flex;
                }
            }
            .item-price {
                font-size: 12px;
            }
            .item-title {
                margin-bottom: 5px;
            }
        }
    }
}

.item-quantity {
    // display: flex;
    // flex-direction: column;
    // justify-content: center;
    // gap: 10px;
    // .quantity-controls {
    //     display: flex;
    //     justify-content: space-between;
    //     color: $t-white-color;
    //     gap: 3px;
    //     .quantity-value {
    //         padding: 5px 15px;
    //         background: $t-white-color;
    //         color: black;
    //     }
    //     .decrease {
    //         background: #cd1900;
    //     }
    //     .increase {
    //         background: #00cd52;
    //     }
    //     .decrease,
    //     .increase {
    //         padding: 5px 10px;
    //     }
    // }
    // .item-total-price {
    //     display: flex;
    //     align-items: center;
    //     gap: 5px;
    //     justify-content: end;
    //     img {
    //         width: 18px;
    //     }
    // }
}

.cart-payment {
    color: $t-white-color;
    padding: 10px 15px;
    background-image: url("./../../../public/assets/shop/banner-shop.png");
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
    button {
        color: $t-white-color;
        -webkit-text-stroke: unset;
        border-radius: 5px;
    }

    .buy-sell {
        display: flex;
        gap: 10px;
        justify-content: center;
        padding: 0 15px 10px;
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
    }
    .buy-sell-item:hover {
        opacity: 0.8;
    }
    .buy-sell-item:nth-child(1) {
        background-color: #2cde00;
        color: white;
    }
    .buy-sell-item:nth-child(2) {
        background-color: #ff0000;
        color: white;
    }
    .active {
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.2);
    }
    .buy-active {
        background-color: #2cde00;
    }
    .sell-active {
        background-color: #ff0000;
    }
    .buy-sell-item.inactive {
        background-color: #6c757d;
    }
}
</style>
