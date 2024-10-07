<template>
    <div class="wr-shop-page text-white">
        <div class="banner">
            <div>
                <router-link to="/" class="close-to-home">
                    <i class="fa-solid fa-chevron-left"></i>Back
                </router-link>
            </div>

            <div class="flex justify-between items-center w-full">
                <div class="text-[24px] f-bangopro">Trading</div>
                <div class="flex gap-4 text-[12px] f-bangopro">
                    <div class="flex gap-1">
                        {{ infoWallet?.balance }}
                        <img
                            src="@public/assets/logo-quai.svg"
                            loading="lazy"
                            class="w-3"
                        />
                    </div>
                    <div class="flex gap-1">
                        {{ renderBalace() }}
                        <img
                            class="w-3"
                            src="@public/assets/logo.svg"
                            loading="lazy"
                        />
                    </div>
                </div>
                <div>
                    <button class="deposit-btn" @click="handleDeposit()">
                        Deposit
                    </button>
                </div>
            </div>
        </div>

        <div
            class="font-extrabold text-[12px] p-[10px] px-[15px] bg-[#00165a] border-b border-b-[#2f9ad6]"
        >
            <div class="flex justify-between items-center mb-[10px]">
                <div class="flex gap-1">
                    <div
                        v-for="(button, index) in btnShop"
                        :key="index"
                        class="shop-btn-item"
                        :class="{ active: activeButton === button?.name }"
                        @click="setActiveButton(button?.name)"
                    >
                        {{ button.label }}
                    </div>
                </div>
            </div>

            <!-- <div class="flex" v-if="activeButton === EButtonName.MarketPlace">
                <div class="pr-[16px] border-r-2 border-r-white uppercase">
                    Category
                </div>

                <div class="flex gap-3 ml-4">
                    <div
                        v-for="(button, index) in btnCategory"
                        :key="index"
                        class="item"
                    >
                        {{ button.label }}
                    </div>
                </div>
            </div> -->
        </div>

        <div
            class="h-full bg-[#00165a]"
            v-if="activeButton === EButtonName.MarketPlace"
        >
            <div
                class="flex text-[12px] border-b border-b-[#2f9ad6] font-extrabold px-4 py-2"
            >
                <div class="w-[10%] text-left">No.</div>
                <div class="w-[50%] text-left">Item</div>
                <div class="w-[20%] text-center">Quantity</div>
                <div class="w-[20%] text-right">Floor Price</div>
            </div>

            <div class="overflow-scroll h-[calc(100vh-200px)] no-scrollbar">
                <div v-for="(item, index) in listShop" :key="index">
                    <div
                        class="flex items-center text-[10px] overflow-y-auto border-b border-b-[#2f9ad6] mx-2 px-2 py-2 animation-item-market"
                        @click="addCart(item)"
                    >
                        <div class="w-[10%] text-left">{{ index + 1 }}</div>
                        <div class="w-[50%] text-left flex gap-3 items-center">
                            <img
                                :src="item?.ItemDef?.ImageUrl"
                                :alt="item?.ItemDef?.Description"
                                loading="lazy"
                                class="w-12"
                            />
                            <div>{{ item.ItemDef.Code }}</div>
                        </div>
                        <div class="w-[20%] text-center">
                            {{ item?.TotalSell }}
                        </div>
                        <div class="w-[20%] text-right">
                            <div>Starting at:</div>
                            <div>
                                {{ item?.GoodSellPrice }}
                                {{ item?.GoodPriceType }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeButton === EButtonName.MyOrders">
            <MyOrderPage />
        </div>
        <!-- <div class="content-wr">
            <div v-if="activeButton === EButtonName.MarketPlace">
                <div class="card">
                    <div
                        class="item-card"
                        v-for="(item, index) in listShop"
                        :key="index"
                    >
                        <div class="img">
                            <img
                                :src="item?.ItemDef?.ImageUrl"
                                :alt="item?.ItemDef?.Description"
                                loading="lazy"
                            />
                        </div>
                        <div class="bottom-card">
                            <div class="price">
                                <div class="title">Start At</div>
                                <div class="text" @click="addCart(item)">
                                    <div class="buy">
                                        Buy {{ `${item?.GoodBuyPrice}` }}
                                    </div>
                                    <div class="sell">
                                        Sell {{ `${item?.GoodSellPrice}` }}
                                    </div>
                                </div>
                                <div class="type">
                                    {{ `${item?.GoodPriceType}` }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="activeButton === EButtonName.MyOrders">
                <MyOrderPage />
            </div>
        </div> -->

        <ViewCart
            :isViewCart="isViewCart"
            @close="handleCloseCart()"
            :detailCart="dataDetailCart"
        />

        <DepositInShop
            :isDeposit="isDeposit"
            @close="handleCloseDeposit()"
            :infoWallet="infoWallet"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import NotificationToast from "@/components/NotificationToast.vue";
import PopupConfirm from "@/components/PopupConfirm.vue";
import {
    btnCategory,
    btnShop,
    EButtonName,
    IDetailCart,
    IInfoWallet,
    ItemShop,
} from "@/views/Shop/defination";
import ViewCart from "./ViewCart.vue";
import MyOrderPage from "./MyOrder.vue";
import DepositInShop from "./Deposit.vue";
import { mapState } from "vuex";
import { formattedBalance } from "@/utils";
import userService from "@/services/userService";
import userServiceInventory from "@/services/inventoryService";
import axios from "axios";

export default defineComponent({
    name: "ShopPage",
    components: {
        ViewCart,
        DepositInShop,
        // NotificationToast,
        // PopupConfirm,
        MyOrderPage,

        // LoadingForm,
    },
    computed: {
        ...mapState(["rewardInfo"]),
    },
    created() {
        this.getListMarket();
        this.callWalletInfo();
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            loadingBtn: false,
            showCoomingSoon: false,
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
            userId: userInfo?.user?.id || "",

            showNotification: false,
            notificationMessage: "",
            notificationType: "",

            EButtonName,
            activeButton: EButtonName.MarketPlace,
            btnShop,
            btnCategory,

            isViewCart: false,
            listShop: [] as IDetailCart[],
            dataDetailCart: {} as IDetailCart,

            isDeposit: false,
            infoWallet: {} as IInfoWallet,
        };
    },
    methods: {
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
        renderBalace() {
            return formattedBalance(
                this.rewardInfo?.attributes?.qpoint?.data?.attributes
                    ?.balance || 0
            );
        },
        setActiveButton(button: EButtonName) {
            if (button === EButtonName.Transactions) {
                // this.showCoomingSoon = true;
            } else {
                this.activeButton = button;
            }
        },
        getBtnClass(item) {
            if (item?.Side === "S") {
                return "sell-btn";
            }
            if (item?.Side === "B") {
                return "buy-btn";
            }
            return "";
        },
        renderBtnBS(item: ItemShop) {
            if (item?.Side === "S") {
                return "Sell";
            }
            if (item?.Side === "B") {
                return "Buy";
            }
        },
        // viewCard() {
        //     this.isViewCart = true;
        // },
        handleCloseCart() {
            this.isViewCart = false;
        },
        async getListMarket() {
            try {
                // const response = await axios.get(
                //     "https://6235-171-224-180-89.ngrok-free.app/api/v1/order/getMarketList",
                //     {
                //         headers: {
                //             "ngrok-skip-browser-warning": "1",
                //         },
                //     }
                // );
                // const data = JSON.parse(response.data.message);
                // this.listShop = data;

                const res = await userServiceInventory.getListMarket();
                this.listShop = res;
            } catch (error) {
                console.error("Error", error);
                return [];
            }
        },
        addCart(item) {
            this.isViewCart = true;
            this.dataDetailCart = item;
            // let carts: any = localStorage.getItem("carts");
            // console.log(carts);
            // console.log(JSON.parse(carts));
            // if (carts) {
            //     carts = JSON.parse(carts);
            // } else {
            //     carts = [];
            // }
            // carts.push(item);
            // localStorage.setItem("carts", JSON.stringify(carts));
        },
        handleDeposit() {
            this.isDeposit = true;
        },
        handleCloseDeposit() {
            this.isDeposit = false;
        },
        async callWalletInfo() {
            try {
                const res = await userService.getWalletInfo(this.userId);
                this.infoWallet = res?.[0];
            } catch (error) {}
        },
    },
});
</script>

<style scoped lang="scss">
@import "@/styles/global.scss";

$t-white-color: rgb(255, 255, 255);
$bg-color: #00165a;
$border-color: #2f9ad6;

button {
    font-size: 12px;
    padding: 10px 12px;
    border-radius: 3px;
    letter-spacing: 0;
}
.close-to-home {
    color: $t-white-color;
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    margin-bottom: 10px;
    text-decoration: none;
}
.close-to-home svg {
    font-size: 20px;
}

.wr-shop-page {
    height: 100vh;
    width: 100%;
    opacity: 0;
    animation: fadeIn 0.2s ease-in-out forwards;
}
@keyframes fadeIn {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

.banner {
    padding: 10px 15px;
    color: $t-white-color;
    background-image: url("./../../../public/assets/shop/banner-shop.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    .desc {
        // display: flex;
        // justify-content: space-between;
        // align-items: end;
        // width: 100%;
        // img {
        //     width: 14px;
        // }

        .title {
            font-size: 25px;
        }
        .balance {
            display: flex;
            gap: 10px;
            .item {
                align-items: center;
                display: flex;
                gap: 3px;
                font-size: 12px;
            }
        }
        .deposit-btn {
            color: #000000;
            -webkit-text-stroke: 0.5px rgb(0 0 0);
            width: 80px;
        }
    }
}

.shop-btn-item.active {
    background: #064bc5;
    color: $t-white-color;
}
.shop-btn-item {
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    background: #00286f;
    text-transform: uppercase;
}

// .category-wr {
//     display: flex;
//     -webkit-text-stroke: 0.5px $t-white-color;
//     .category-label {
//         padding-right: 15px;
//         border-right: 2px solid $t-white-color;

//         text-transform: uppercase;
//     }
//     .category-btn {
//         display: flex;
//         margin-left: 15px;
//         gap: 10px;
//     }
// }

.content-wr {
    background-color: $bg-color;
    height: 100%;
    padding: 10px 15px;
    max-height: calc(100% - 163px);
    overflow-y: auto;
    .card {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 5px;
    }
    .item-card {
        border: 1px solid $border-color;
        padding: 5px;
        border-radius: 5px;
        animation: fadeInZoom 0.1s ease forwards;
        .img {
            width: 100%;
            position: relative;
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 5px;
                display: flex;
            }
            // .item-count {
            //     position: absolute;
            // }
        }

        .bottom-card {
            .title {
                text-align: center;
            }
            .type {
                text-align: center;
            }
            .buy,
            .sell {
                flex: 1;
                text-align: center;
            }
            .buy {
                background: #2cde00;
                padding: 3px;
                border-top-left-radius: 3px;
                border-bottom-left-radius: 3px;
            }
            .sell {
                background: #ff0000;
                padding: 3px;
                border-top-right-radius: 3px;
                border-bottom-right-radius: 3px;
            }
            // display: flex;
            // font-size: 10px;
            // justify-content: space-between;
            // .price {
            //     display: flex;
            //     align-items: center;
            // }
            .price {
                -webkit-text-stroke: 0.5px $t-white-color;
                display: flex;
                flex-direction: column;
                gap: 3px;
                .text {
                    display: flex;
                }
            }
        }
    }
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

.animation-item-market {
    animation: fadeInZoom 0.1s ease forwards;
}
</style>
