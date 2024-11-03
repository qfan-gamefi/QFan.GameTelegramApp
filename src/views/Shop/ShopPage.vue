<template>
    <div class="wr-shop-page text-white bg-[#00165A]">
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
                        {{ infoWallet?.balance || 0 }}
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
            </div> 
            <div class="flex gap-3 justify-end">
                <div
                    class="btn-transaction bg-[#28a745]"
                    @click="handleDeposit('deposit')"
                >
                    Deposit
                </div>
                <div
                    class="btn-transaction bg-[#dc3545]"
                    @click="handleDeposit('withdraw')"
                >
                    Withdraw
                </div>

                <a @click="callWalletInfo()"><i class="fa-solid fa-rotate"></i></a>
            </div>
        </div>

        <div
            class="font-extrabold text-[12px] p-[10px] px-[15px] border-b border-b-[#2f9ad6]"
        >
            <div class="flex justify-between items-center">
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
        </div>

        <div class="h-full" v-if="activeButton === EButtonName.MarketPlace">
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
                            <div>{{ item.ItemDef.Name }}</div>
                        </div>
                        <div class="w-[20%] text-center">
                            {{ formattedBalance(item?.TotalSell) }}
                        </div>
                        <div class="w-[20%] text-right">
                            <div>Starting at:</div>
                            <div>
                                {{ formattedBalance(item?.GoodSellPrice) }}
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

        <div v-if="activeButton === EButtonName.Transactions">
            <TransactionPage />
        </div>

        <ViewCart
            :isViewCart="isViewCart"
            @close="handleCloseCart()"
            @closeCallApi="closeCallApi()"
            :detailCart="dataDetailCart"
        />

        <DepositInShop
            :isDeposit="isDeposit"
            @close="handleCloseDeposit()"
            :infoWallet="infoWallet"
            :labelType="labelTransaction"
        />

        <PopupComingSoon
            :visible="showCoomingSoon"
            message="Coming soon!"
            @close="showCoomingSoon = false"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
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
import TransactionPage from "./TransactionPage.vue";
import DepositInShop from "./Deposit.vue";
import { mapState } from "vuex";
import { formattedBalance } from "@/utils";
import userService from "@/services/userService";
import userServiceInventory from "@/services/inventoryService";
import PopupComingSoon from "@/components/popup/PopupComingSoon.vue";

export default defineComponent({
    name: "ShopPage",
    components: {
        ViewCart,
        DepositInShop,
        MyOrderPage,
        PopupComingSoon,
        TransactionPage,
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
            userId: userInfo?.user?.id || "1927324767",

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
            labelTransaction: "DEPOSIT",
        };
    },
    methods: {
        formattedBalance,
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
            // if (button === EButtonName.Transactions) {
            //     this.showCoomingSoon = true;
            // } else {
            //     this.activeButton = button;
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
        async closeCallApi() {
            this.isViewCart = false;
            this.getListMarket();
        },
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
        },
        handleDeposit(labelType: "withdraw" | "deposit") {
            // this.showCoomingSoon = true
            this.isDeposit = true;
            if (labelType === "deposit") {
                this.labelTransaction = "DEPOSIT";
            } else {
                this.labelTransaction = "WITHDRAW";
            }
        },
        handleCloseDeposit() {
            this.isDeposit = false;
        },
        async callWalletInfo() {
            try {
                const res = await userService.getWalletInfo(this.userId);
                this.infoWallet = res?.[0];
            } catch (error) {
                console.log("Error", error);
            }
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
.btn-transaction {
    width: fit-content;
    padding: 0 10px;
    border-radius: 5px;
}
</style>
