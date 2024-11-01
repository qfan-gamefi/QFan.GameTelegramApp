<template>
    <div class="wr-inventory-page">
        <img
            class="w-full object-cover"
            src="./../../../public/assets/inventory/banner-inventory.png"
            alt="banner_inventory"
            ref="bannerInventory"
            loading="lazy"
        />

        <div class="btn-inventory">
            <div
                v-for="(button, index) in buttonInventory"
                :key="index"
                class="btn-item-inventory"
                :class="{ active: activeButton === button?.name }"
                @click="setActiveButton(button?.name)"
            >
                {{ button.label }}
            </div>
        </div>

        <div class="wr-box" :style="{ height: calcHeightInventory }">
            <div class="inventory-detail p-2">
                <div v-if="activeButton === 'Inventory'">
                    <div
                        v-for="(itemTitle, key) in itemsInventory"
                        :key="key"
                        class="border-b border-[#2F9AD6] p-1 rounded-md animation-inventory"
                    >
                        <div class="text-[14px] mb-1 font-extrabold">
                            {{ renderTitleKey(key) }}
                        </div>

                        <div class="box-item">
                            <div
                                class="item"
                                v-for="(item, index) in itemTitle"
                                :key="index"
                            >
                                <div
                                    class="item-img"
                                    @click="toggleButtons(item?.id)"
                                >
                                    <img
                                        :src="item?.ItemDef?.ImageUrl"
                                        :alt="item?.Description"
                                        loading="lazy"
                                    />

                                    <div
                                        v-if="activeIndex === item?.id"
                                        class="button-overlay"
                                    >
                                        <div
                                            class="item-btn"
                                            v-if="item?.ItemDef?.Consumable"
                                        >
                                            <button
                                                @click="
                                                    handleUseInventory(item)
                                                "
                                                :disabled="loadingBtn"
                                            >
                                                <div v-if="loadingBtn">
                                                    <i
                                                        class="fa fa-spinner fa-spin"
                                                    ></i>
                                                </div>
                                                Use
                                            </button>
                                        </div>

                                        <div
                                            class="item-btn"
                                            v-if="item?.Tradable"
                                        >
                                            <button
                                                @click="handleSell(item)"
                                                :disabled="loadingBtn"
                                            >
                                                <div v-if="loadingBtn">
                                                    <i
                                                        class="fa fa-spinner fa-spin"
                                                    ></i>
                                                </div>
                                                Sell
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="slot-item">
                                    {{ item?.ItemCount }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="box-item" v-if="activeButton === 'Badges'">
                    <div
                        class="item-badge"
                        v-for="(item, index) in itemsBadge"
                        :key="index"
                    >
                        <img class="img-badge" :src="item?.ItemDef?.ImageUrl" />
                        <div class="item-btn">
                            <button @click="showCoomingSoon = true">Use</button>
                        </div>
                    </div>
                </div>

                <div
                    class="flex flex-col gap-[5px]"
                    v-if="activeButton === 'Fusion'"
                >
                    <div
                        class="text-[10px]"
                        v-for="(item, index) in listFusion"
                        :key="index"
                    >
                        <div
                            class="slideIn-fusion flex justify-between p-1.5 border-2 border-[#56d6ff] rounded-md"
                        >
                            <div
                                class="flex items-center gap-2.5 w-[220px] overflow-auto"
                            >
                                <div
                                    class="flex flex-col gap-[5px] min-w-[55px]"
                                    v-for="(
                                        el, idx
                                    ) in item?.ResourcesItemDefIds"
                                    :key="idx"
                                >
                                    <div
                                        class="text-center p-1 rounded-md"
                                        :class="renderItemFusion(el, 'bg')"
                                    >
                                        {{ renderItemFusion(el, "count") }}
                                    </div>
                                    <img
                                        class="w-[55px]"
                                        :src="el?.ImageUrl"
                                        loading="lazy"
                                    />
                                </div>
                            </div>

                            <div class="flex gap-[15px]">
                                <div class="flex items-center">
                                    <img
                                        class="w-2.5"
                                        src="@public/assets/inventory/triangle.png"
                                    />
                                </div>
                                <div class="flex flex-col gap-2 items-center">
                                    <div class="font-extrabold">
                                        {{ item.Name }}
                                    </div>
                                    <div class="relative">
                                        <img
                                            class="w-[60px] rounded-md"
                                            :src="item?.Treasure?.ImageUrl"
                                        />
                                        <div class="slot-item">
                                            {{ item?.TreasureCount }}
                                        </div>
                                    </div>
                                    <div
                                        :class="[
                                            'btn-fusion',
                                            {
                                                disable:
                                                    checkDisableFusion(item),
                                            },
                                        ]"
                                    >
                                        <button @click="handleFausion(item)">
                                            Claim
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <PopupComingSoon
            :visible="showCoomingSoon"
            message="Coming soon!"
            @close="showCoomingSoon = false"
        />

        <NotificationToast
            v-if="showNotification"
            :message="notificationMessage"
            :type="notificationType"
            @close="showNotification = false"
        />

        <PopupConfirm
            v-if="showClaim"
            :text="`Do you want Claim!`"
            :visible="showClaim"
            @yes="handleYesClaim"
            @no="handleNoClaim"
        />

        <ViewCart
            :isViewCart="isViewCart"
            @close="closeViewCart"
            :detailCart="dataDetailCart"
            currentPage="inventory"
            @closeCallApi="closeViewCart()"
        />

        <PopupPassword :visible="isPass" @cancel="isPass = false" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import userServiceInventory from "@/services/inventoryService";
import {
    EItemDefType,
    IFusion,
    IFusionString,
    IItemDefFusion,
    IItemInventory,
} from "@/interface";
import "./style.scss";

import NotificationToast from "@/components/NotificationToast.vue";
import PopupConfirm from "@/components/PopupConfirm.vue";
import ViewCart from "./../Shop/ViewCart.vue";
import { IDetailCart } from "@/views/Shop/defination";
import PopupPassword from "@/components/popup/PopupPassword.vue";
import { mapState } from "vuex";
import PopupComingSoon from "@/components/popup/PopupComingSoon.vue";
import userService from "@/services/userService";

enum ButtonName {
    Inventory = "Inventory",
    Badges = "Badges",
    Fusion = "Fusion",
    History = "History",
}
interface Button {
    name: ButtonName;
    label: string;
}

export default defineComponent({
    name: "InventoryPage",
    components: {
        NotificationToast,
        PopupConfirm,
        ViewCart,
        PopupPassword,
        PopupComingSoon,
    },
    created() {
        this.getDataInfo();
        this.getDataInventor();
        this.getFausion();
    },
    mounted() {
        this.updateHeight();
    },
    computed: {
        ...mapState(["rewardInfo", "routerFusion"]),
    },
    watch: {
        routerFusion(newVal, oldVal) {
            if(newVal){
                this.setActiveButton('Fusion')
            }
        }
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            calcHeightInventory: "calc(100% - 131px)",
            dataInfo: null,
            loadingBtn: false,
            showCoomingSoon: false,
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
            userId: userInfo?.user?.id || "",
            showNotification: false,
            notificationMessage: "",
            notificationType: "",
            activeButton: ButtonName.Inventory as ButtonName,
            buttonInventory: [
                { name: "Inventory", label: "Inventory" },
                { name: "Badges", label: "Badges" },
                { name: "Fusion", label: "Fusion" },
                { name: "History", label: "History" },
            ] as Button[],
            showClaim: false,
            itemFusion: {} as IFusion,

            itemsInventory: {} as Record<string, IItemInventory[]>,
            itemsBadge: [] as IItemInventory[],
            arrInventory: [] as IItemInventory[],

            listFusion: [] as IFusion[],
            showButtons: false,
            activeIndex: null,

            isViewCart: false,
            dataDetailCart: {} as IDetailCart,
            isPass: false,
        };
    },
    methods: {
        updateHeight() {
            const img = this.$refs.bannerInventory;
            if (img) {
                img.onload = () => {
                    this.calcHeightInventory = `calc(100% - 42px - ${img.clientHeight}px)`;
                };
            }
        },
        async getDataInfo() {
            const data = await userService.getInfo(this.userId);
            this.dataInfo = data?.data?.[0];
        },
        async renderNotification(message, type) {
            this.notificationMessage = message;
            this.notificationType = type;
            this.showNotification = true;
            // setTimeout(() => {
            //     this.showNotification = false;
            // }, 2000);
        },
        async renderSuccess(text: string) {
            this.renderNotification(text, "success");
        },
        async renderErr(text) {
            this.renderNotification(text, "error");
        },
        toggleButtons(index: number) {
            this.activeIndex = this.activeIndex === index ? null : index;
        },
        setActiveButton(button: ButtonName) {
            this.$store.commit("setRouterFusion", false);
            if (button === ButtonName.History) {
                this.showCoomingSoon = true;
            } else {
                this.activeButton = button;
            }
        },
        formatNumber(num) {
            if (num >= 1000000) {
                return `${(num / 1000000).toFixed(2)}M`;
            } else if (num >= 10000) {
                return `${(num / 1000).toFixed(0)}K`;
            } else {
                return num?.toString();
            }
        },
        renderItemFusion(item: IItemDefFusion, type: "bg" | "count") {
            const { ItemDefId, AutoCash, CashValue, Count } = item || {};
            const filterIdItem: IItemInventory = this.arrInventory?.find(
                (el) => el.ItemDefId === ItemDefId
            );
            const dataBalance =
                this.dataInfo?.attributes?.qpoint?.data?.attributes;
            // this.rewardInfo?.attributes?.qpoint?.data?.attributes;
            const formatBalace = this.formatNumber(dataBalance?.balance);
            const countItem = filterIdItem?.ItemCount || 0;
            const countHash = Count || 0;

            if (type === "count") {
                if (AutoCash && AutoCash === 1) {
                    const formatCashValue = this.formatNumber(CashValue);

                    return `${formatBalace}/${formatCashValue}`;
                } else {
                    return `${countItem}/${countHash}`;
                }
            }
            if (type === "bg") {
                const bgRed = "bg-[#FF0000]";
                const bgGreen = "bg-[#2cde00]";

                if (AutoCash && AutoCash === 1) {
                    return dataBalance?.balance >= CashValue ? bgGreen : bgRed;
                } else {
                    return countItem >= countHash ? bgGreen : bgRed;
                }
            }
        },

        checkDisableFusion(item) {
            const arrRow = item.ResourcesItemDefIds;
            const balance =
                this.dataInfo?.attributes?.qpoint?.data?.attributes?.balance;

            const hasAutoCash = arrRow.some((item) => "AutoCash" in item);

            if (hasAutoCash) {
                const result = arrRow?.map((item) => {
                    if (item?.AutoCashType === "QFP") {
                        return balance >= item?.CashValue ? true : false;
                    } else {
                        return true;
                    }
                });

                const hasFalseValue = !result.some((value) => value === false);

                return hasFalseValue ? "" : "disable";
            } else {
                const result = arrRow?.every((itemA) => {
                    const matchingItemB = this.arrInventory?.find(
                        (itemB) => itemB.ItemDefId === itemA.ItemDefId
                    );
                    return matchingItemB
                        ? itemA.Count <= matchingItemB.ItemCount
                        : false;
                });

                return result ? "" : "disable";
            }
        },
        async getDataInventor() {
            try {
                const res = await userServiceInventory.getListInventory(
                    Number(this.userId)
                );
                const filterData = res?.Items?.filter(
                    (item) => item?.ItemDef?.Type === EItemDefType.Common
                );
                const filterBadge = res?.Items?.filter(
                    (item) => item?.ItemDef?.Type === EItemDefType.Medal
                );

                this.itemsBadge = filterBadge;
                this.arrInventory = filterData;

                const groupedItems = filterData?.reduce(
                    (accumulator, currentItem) => {
                        const category = currentItem.ItemDef.Category;
                        if (!accumulator[category]) {
                            accumulator[category] = [];
                        }
                        accumulator[category].push(currentItem);
                        return accumulator;
                    },
                    {}
                );

                this.itemsInventory = groupedItems;
            } catch (error) {
                console.error(error);
            }
        },
        handleNoClaim() {
            this.showClaim = false;
        },
        async handleYesClaim() {
            this.showClaim = false;
            try {
                const data = {
                    UserId: this.userId,
                    CombineId: this.itemFusion.id,
                };
                const res = await userServiceInventory.makeFusion(data);
                if (res.success) {
                    const mess = res?.data
                        ?.map((item) => {
                            return `${item?.count} - ${item?.Name}`;
                        })
                        ?.join(", ");

                    await this.renderSuccess(`Received ${mess}`);
                    await this.getDataInventor();
                    await this.getFausion();
                    await this.getDataInfo();
                } else {
                    await this.renderErr(`Received ${res?.data}`);
                }
            } catch (error) {
                if (error?.response?.status === 401) {
                    this.isPass = true;
                    // localStorage.getItem("storePermission") === "true";
                } else {
                    this.renderErr(`Error!`);
                }
            }
        },
        async getFausion() {
            try {
                const resFusion: IFusionString[] =
                    await userServiceInventory.getFusion();
                const parseFusion = resFusion?.map((item) => {
                    return {
                        ...item,
                        ResourcesItemDefIds: JSON.parse(
                            item?.ResourcesItemDefIds
                        ),
                    };
                });

                this.listFusion = parseFusion;
            } catch (error) {
                console.error(error);
            }
        },
        async handleFausion(item) {
            this.showClaim = true;
            this.itemFusion = item;
        },
        async handleUseInventory(item: IItemInventory) {
            this.loadingBtn = true;
            try {
                const data = {
                    UserId: this.userId,
                    ItemCount: 1,
                    ItemId: item?.id,
                };
                const res = await userServiceInventory.useInventory(data);

                if (res.success) {
                    const valueRes = res?.data?.[0];
                    await this.renderSuccess(
                        `Received ${valueRes?.Value} ${valueRes?.ValueType}`
                    );
                    // const resultInventory = this.itemsInventory?.map((el) => {
                    //     return el.id === item.id
                    //         ? { ...el, ItemCount: el.ItemCount - 1 }
                    //         : el;
                    // });
                    // this.itemsInventory = resultInventory;

                    Object.keys(this.itemsInventory)?.forEach((key) => {
                        const items = this.itemsInventory[key];
                        items?.forEach((el) => {
                            const { id } = el;

                            if (id === item?.id) {
                                el.ItemCount -= 1;
                            }
                        });
                    });

                    if (item.ItemCount === 1) {
                        await this.getDataInventor();
                    }
                } else {
                    this.renderErr(`Received ${res?.data?.Message}`);
                }
            } catch (error) {
                // this.renderErr(`Error!`);
                if (error?.response?.status === 401) {
                    this.isPass = true;
                }
            } finally {
                this.loadingBtn = false;
            }
        },
        async handleSell(item: IItemInventory) {
            const res = await userServiceInventory.getItemMarket(
                item?.ItemDefId
            );
            const mergeItem = {
                ...item,
                TotalBuy: res?.[0]?.TotalBuy || 0,
                TotalSell: res?.[0]?.TotalSell || 0,
                GoodPriceType: res?.[0]?.GoodPriceType,
                GoodBuyPrice: res?.[0]?.GoodBuyPrice,
                Side: "S",
            };

            this.isViewCart = true;
            this.dataDetailCart = mergeItem;
        },
        closeViewCart() {
            this.isViewCart = false;
            this.getDataInventor();
        },
        renderTitleKey(key: string) {
            return key
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/^\w/, (c) => c.toUpperCase());
        },
    },
});
</script>

<style scoped lang="scss">
@import "@/styles/global.scss";

.wr-inventory-page {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    left: 0;
    z-index: 999;
    animation: fadeInDetailEvent 0.1s ease forwards;
    color: #fff;
    background-image: url("./../../../public/assets/inventory/background-inventory.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

@keyframes fadeInDetailEvent {
    0% {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.btn-inventory {
    display: flex;
    width: 100%;
    padding: 7px 0;
    background-color: #0d2779;
    justify-content: space-around;
    font-size: 12px;
    font-weight: 800;
}

.btn-item-inventory.active {
    background: #ffa53a;
    color: white;
}

.btn-item-inventory {
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
}

.wr-box {
    height: 100%;
    padding: 15px;
    .inventory-detail {
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background-color: #00175f;
        border-radius: 10px;
        overflow-y: auto;
        scrollbar-width: none;
    }

    .box-item {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 20px 10px;
        animation: slideIn 0.5s forwards;

        button {
            padding: 12px;
            font-size: 12px;
            border-radius: 8px;
            min-width: fit-content;
        }

        .item {
            position: relative;
            display: flex;
        }

        .item-badge {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 5px;

            .img-badge {
                width: 100%;
                object-fit: cover;
            }
        }

        .item-img {
            width: 100%;
            position: relative;
            cursor: pointer;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 5px;
            }
        }
    }

    .btn-fusion {
        button {
            font-size: 10px;
            padding: 5px;
            border-radius: 8px;
        }
    }

    .disable {
        pointer-events: none;
        opacity: 0.5;
    }
}

.slot-item {
    font-size: 10px;
    font-weight: 800;
    padding: 5px;
    position: absolute;
    top: 0;
    right: 0;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
        1px 1px 0 #000;
    background-color: rgba(0, 0, 0, 0.5);
    border-bottom-left-radius: 10px;
    color: #fffb3a;
}

.animation-inventory {
    animation: slideIn 0.5s forwards;
}

.slideIn-fusion {
    animation: slideIn 0.5s forwards;
}

@keyframes slideIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

.button-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    flex-direction: column;
    gap: 5px;
    z-index: 1;
}

.overlay-btn {
    margin: 5px;
    padding: 10px 20px;
    background-color: white;
    border: none;
    cursor: pointer;
    font-size: 16px;
    border-radius: 5px;
}

.overlay-btn:hover {
    background-color: #ddd;
}
</style>
