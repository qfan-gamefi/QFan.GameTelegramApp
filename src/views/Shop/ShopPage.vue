<template>
    <div class="wr-shop-page">
        <div class="banner">
            <div>
                <router-link to="/" class="close-to-home">
                    <i class="fa-solid fa-chevron-left"></i>Back
                </router-link>
            </div>

            <div class="desc">
                <div class="title">Trading</div>
                <div class="balance">
                    <div class="item">
                        {{ infoWallet?.balance }}
                        <img
                            src="@public/assets/logo-quai.svg"
                            loading="lazy"
                        />
                    </div>
                    <div class="item">
                        {{ renderBalace() }}
                        <img src="@public/assets/logo.svg" loading="lazy" />
                    </div>
                </div>
                <div>
                    <button class="deposit-btn" @click="handleDeposit()">
                        Deposit
                    </button>
                </div>
            </div>
        </div>

        <div class="header-btn">
            <div class="btn-wrapper">
                <div class="btn-list">
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

                <!-- <div>
                    <button class="view-cart-btn" @click="viewCard()">
                        View Cart
                    </button>
                </div> -->
            </div>

            <div class="category-wr">
                <div class="category-label">Category</div>

                <div class="category-btn">
                    <div
                        v-for="(button, index) in btnCategory"
                        :key="index"
                        class="item"
                    >
                        {{ button.label }}
                    </div>
                </div>
            </div>
        </div>

        <div class="content-wr">
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
                            <!-- <div class="item-count">10</div> -->
                        </div>
                        <!-- <div class="title">Legendary Card</div> -->
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
                                <!-- <img
                                src="./../../../public/assets/logo-quai.svg"
                                alt="quai-logo"
                            /> -->
                            </div>
                            <!-- <div class="icon" @click="addCart(item)">
                                <div
                                    class="add-card-btn"
                                    :class="getBtnClass(item)"
                                >
                                    {{ renderBtnBS(item) }}
                                </div>
                            </div> -->
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="activeButton === EButtonName.MyOrders">
                <MyOrderPage />
            </div>
        </div>

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
            this.activeButton = button;
            // if (button !== EButtonName.MarketPlace) {
            // } else {
            //     this.showCoomingSoon = true;
            // }
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
$t-white-color: rgb(255, 255, 255);
$bg-color: #00165a;
$border-color: #2f9ad6;

button {
    font-size: 12px;
    padding: 10px 12px;
    border-radius: 3px;
    font-family: monospace;
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
        display: flex;
        justify-content: space-between;
        align-items: end;
        width: 100%;
        img {
            width: 14px;
        }

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

.header-btn {
    padding: 10px 15px;
    font-size: 12px;
    background-color: $bg-color;
    font-family: monospace;
    border-bottom: 1px solid $border-color;
    .btn-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        button:hover {
            box-shadow: #023b92 0px 6px 0px;
            -webkit-text-fill-color: unset;
        }
        // .view-cart-btn {
        //     color: $t-white-color;
        //     -webkit-text-stroke: 0.5px $t-white-color;
        //     background: #0065ff;
        //     width: 80px;
        // }
    }
    .btn-list {
        display: flex;
        gap: 5px;

        .shop-btn-item.active {
            background: #064bc5;
            color: $t-white-color;
        }

        .shop-btn-item {
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
            background: #00286f;
            -webkit-text-stroke: 0.5px $t-white-color;
            text-transform: uppercase;
        }
    }
}

.category-wr {
    display: flex;
    -webkit-text-stroke: 0.5px $t-white-color;
    .category-label {
        padding-right: 15px;
        border-right: 2px solid $t-white-color;

        text-transform: uppercase;
    }
    .category-btn {
        display: flex;
        margin-left: 15px;
        gap: 10px;
    }
}

.content-wr {
    background-color: $bg-color;
    height: 100%;
    padding: 10px 15px;
    font-family: monospace;
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

            // .add-card-btn {
            //     font-size: 9px;
            //     padding: 5px 0;
            //     color: $t-white-color;
            //     -webkit-text-stroke: 0.5px $t-white-color;
            //     width: 32px;
            //     text-align: center;
            //     border-radius: 3px;
            //     transition: all 0.2s ease;
            // }
            // .sell-btn {
            //     background: #ff0000;
            // }
            // .buy-btn {
            //     background: #2cde00;
            // }
            // .sell-btn:hover {
            //     background: #ff0000;
            //     box-shadow: #970000 0px 6px 0px;
            // }

            // .buy-btn:hover {
            //     background: #2cde00;
            //     box-shadow: #197c00 0px 6px 0px;
            // }
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
</style>
