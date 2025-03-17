<template>
    <div class="wr-inventory-page">
        <img
            class="w-full object-cover"
            :src="bannerSrc"
            alt="banner_inventory"
            ref="bannerInventory"
            loading="lazy"
        />

        <div class="inventory-btns-banner">
            <div
                v-for="(button, index) in buttonInventory"
                :key="index"
                class="inventory-btn-banner"
                :class="{ active: activeButton === button?.name }"
                @click="setActiveButton(button?.name)"
            >
                {{ $t(button.label) }}
            </div>
        </div>

        <div class="wr-box" :style="{ height: calcHeightInventory }">

            <div class="wr-filter-player" v-if="activeButton === 'Player'">
                <GroupPlayerComponent
                    v-for="(position, index) in ['Position']"
                    :position="position" 
                    @groupClicked="handleGroupClick"
                    :key="index"
                />
                <i class="fa-solid fa-filter fa-sm"></i>
            </div>
            

            <div class="inventory-btn-page">
                <div v-if="activeButton === 'Inventory'">
                    <div
                        v-for="(itemTitle, key) in itemsInventory"
                        :key="key"
                        class="row-page fadein"
                    >
                        <div class="title-row">
                            {{ $t(renderTitleKey(key)) }}
                        </div>

                        <div class="box-item">
                            <div
                                class="relative flex"
                                v-for="(item, index) in itemTitle"
                                :key="index"
                            >
                                <div
                                    class="w-full relative cursor-pointer"
                                    @click="toggleButtons(item?.id)"
                                >
                                    <img
                                        class="w-full h-full object-cover rounded"
                                        :src="item?.ItemDef?.ImageUrl"
                                        :alt="item?.Description"
                                        loading="lazy"
                                    />

                                    <div
                                        v-if="activeIndex === item?.id"
                                        class="button-overlay"
                                    >
                                        <div v-if="item?.ItemDef?.Consumable">
                                            <button
                                                @click="handleUseInventory(item)"
                                                :disabled="loadingBtn"
                                            >
                                                <div v-if="loadingBtn">
                                                    <i class="fa fa-spinner fa-spin"></i>
                                                </div>
                                                {{ $t("use") }}
                                            </button>
                                        </div>

                                        <div v-if="item?.Tradable">
                                            <button
                                                @click="handleSell(item)"
                                                :disabled="loadingBtn"
                                            >
                                                <div v-if="loadingBtn">
                                                    <i class="fa fa-spinner fa-spin"></i>
                                                </div>
                                                {{ $t("sell") }}
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

                <div v-if="activeButton === 'Badges'">
                    <div
                        v-for="(items, category) in groupedBadge"
                        :key="category"
                        class="row-page fadein"
                    >
                        <div class="title-row">
                            {{ category }}
                        </div>
                        <div class="box-item">
                            <div v-for="item in items" :key="item.id">
                                <img
                                    class="w-full object-cover"
                                    :src="item?.ItemDef?.ImageUrl"
                                    alt="ItemBadge"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="custom-flex-column"
                    v-if="activeButton === 'Fusion'"
                >
                    <div
                        class="text-[10px]"
                        v-for="(item, index) in listFusion"
                        :key="index"
                    >
                        <div class="slideIn-fusion">
                            <div
                                class="flex items-center gap-2.5 w-[220px] overflow-auto"
                            >
                                <div
                                    class="custom-flex-column min-w-[55px]"
                                    v-for="(
                                        el, idx
                                    ) in item?.ResourcesItemDefIds"
                                    :key="idx"
                                >
                                    <div
                                        class="text-center p-1 rounded-md"
                                        :class="renderItemFusion(el, 'bg', arrInventory, dataInfo)"
                                    >
                                        {{ renderItemFusion(el, "count", arrInventory, dataInfo) }}
                                    </div>
                                    <img
                                        class="w-[55px]"
                                        :src="el?.ImageUrl"
                                        loading="lazy"
                                    />
                                </div>
                            </div>

                            <div class="flex gap-3">
                                <div class="flex items-center">
                                    <img
                                        class="w-2.5"
                                        src="/assets/inventory/triangle.png"
                                    />
                                </div>
                                <div class="flex flex-col gap-2 items-center">
                                    <div class="font-extrabold text-center">
                                        {{ item.Name }}
                                    </div>
                                    <div class="relative" v-if="!item?.Treasure?.Description?.endsWith('Lightning')">
                                        <img
                                            class="w-[60px] rounded-md"
                                            :src="item?.Treasure?.ImageUrl"
                                        />
                                        <div class="slot-item">
                                            {{ item?.TreasureCount }}
                                        </div>
                                    </div>
                                    <LightningCard v-else :cardImage="item?.Treasure?.ImageUrl" :itemCount="item?.TreasureCount" :freezeAfter="30"  />
                                    <div
                                        :class="[
                                            'btn-fusion',
                                            {
                                                disable:
                                                    disableFusion(item, dataInfo, arrInventory),
                                            },
                                        ]"
                                    >
                                        <button @click="handleFausion(item)">
                                            {{ $t("claim") }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="activeButton === 'Player'">
                    <div
                        v-for="(player, title) in arrPlayer"
                        :key="title"
                        class="row-page animation-row"
                    >
                        <div class="title-row">
                            {{ title }}
                        </div>
                        <div class="box-item">
                            <div v-for="item in player" :key="item?.id" class="relative cursor-pointer" @click="handlePlayer(item)">
                                <img
                                    class="w-full object-cover"
                                    :src="JSON.parse(item?.ItemDef?.ImageUrl)?.Plate"
                                    loading="lazy"
                                />
                                <div v-if="['iconic', 'legendary'].includes(item?.ItemDef?.Grade?.toLowerCase())" class="shine-A shine-2"></div>
                                <div v-if="['iconic', 'legendary'].includes(item?.ItemDef?.Grade?.toLowerCase())" class="shine-A shine-3"></div>
                                <img
                                    class="object-cover absolute top-[16%] right-[5%] w-[60%]"
                                    :src="JSON.parse(item?.ItemDef?.ImageUrl)?.Player"
                                    loading="lazy"
                                />
                                <div class="number-configuration">{{item?.Configuration}}</div>
                                <div class="code-configuration">{{item?.Code}}</div>
                                <div class="name-item-player">{{item?.Name}}</div>
                                <div class="slot-item">{{item?.ItemCount}}</div>
                                <div class="flex absolute bottom-[20%] left-[50%] transform -translate-x-1/2">
                                    <img
                                        v-for="(image, index) in imgStarSilver"
                                        :key="index"
                                        class="w-1 object-cover"
                                        :src="image"
                                        loading="lazy"
                                    />
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <PopupComingSoon
            :visible="showCoomingSoon"
            message="coming_soon"
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
            text="do_you_want_claim"
            :loading="loadingBtn"
            :visible="showClaim"
            @yes="handleYesClaim()"
            @no="showClaim = false"
        />

        <ViewCart
            :isViewCart="isViewCart"
            @close="closeViewCart"
            :detailCart="dataDetailCart"
            currentPage="inventory"
            @closeCallApi="closeViewCart()"
            :dataInventory="arrInventory"
        />

        <PopupPassword :visible="isPass" @cancel="isPass = false" />

        <PopupComponent
            :visible="openUseCount"
            :title="useItem?.Name"
            :loading="loadingBtn"
            @yes="yesUseNumber()"
            @no="openUseCount = false"
        >
            <template #content>
                <div class="px-[10px]">
                    <InputField
                        v-model="countUse"
                        label=""
                        placeholder="0"
                    />
                </div>
            </template>
        </PopupComponent>

        <PopupComingSoon
            :visible="isMaintenance"
            message="under_maintenance"
            @close="isMaintenance = false"
        />

        <PopupItem 
            :visible="openItem" 
            @no="openItem = false"  
            :listData = "listDetailPlayer"
            :idDefault = "itemDefault"
            @refeshData="refeshData()"
        />

        <PopupFusionPlayerPage
            :visible="isFusionPlayer" 
            @no="isFusionPlayer = false"  
            :data = "dataFusionPlayer"
        />
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

import NotificationToast from "@/components/NotificationToast.vue";
import PopupConfirm from "@/components/PopupConfirm.vue";
import ViewCart from "./../Shop/ViewCart.vue";
import { IDetailCart } from "@/views/Shop/defination";
import PopupPassword from "@/components/popup/PopupPassword.vue";
import { mapState } from "vuex";
import PopupComingSoon from "@/components/popup/PopupComingSoon.vue";
import userService from "@/services/userService";
import BackButtonTelegram from "@/mixins/BackButtonTelegram";
import { debounce, trackEventBtn } from "@/utils";
import { renderTitleKey, formatNumber, disableFusion, renderConfiguration, renderItemFusion, fnGroupPosition } from "./inventoryHelpers";
import { ButtonName, Button } from "./defination-inventory";
import PopupComponent from "@/components/popup/PopupComponent.vue";
import InputField from "@/components/Input/InputField.vue";
import axios from "axios";
import PopupItem from "./PopupItem.vue";
import PopupFusionPlayerPage from "./PopupFusionPlayer.vue";
import { countNameDefaultInStack, getPlateImage, getPlayerImage } from "../Fomation/defination-fomation";
import { sortedGroupPlayer } from "../Fomation/defination-fomation";
import { groupedPlayer } from "../Fomation/defination-fomation";
import GroupPlayerComponent from "./GroupPlayerComponent.vue";
import LightningCard from "@/components/LightningCard.vue";

export default defineComponent({
    name: "InventoryPage",
    mixins: [BackButtonTelegram],
    components: {
        NotificationToast,
        PopupConfirm,
        ViewCart,
        PopupPassword,
        PopupComingSoon,
        PopupComponent,
        InputField,
        PopupItem,
        PopupFusionPlayerPage,
        GroupPlayerComponent,
        LightningCard
    },
    created() {
        this.getDataInfo();
        this.getDataInventor();
        this.getFausion();

        this.yesUseNumber = debounce(this.yesUseNumber, 500);
        this.handleYesClaim = debounce(this.handleYesClaim, 500);
    },
    mounted() {
        this.updateHeight();
    },
    computed: {
        ...mapState(["rewardInfo", "routerFusion"]),
        bannerSrc() {
            if (this.$i18n.locale === 'zh') {
                return '/assets/inventory/banner-inventory-zh.png';
            } else if (this.$i18n.locale === 'vi') {
                return '/assets/inventory/banner-inventory-player.png';
            }
            return '/assets/inventory/banner-inventory-player.png';
        }
    },
    watch: {
        routerFusion(newVal, oldVal) {
            if (newVal) {
                this.setActiveButton("Fusion");
            }
        },
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            calcHeightInventory: "calc(100% - 131px)",
            dataInfo: null,
            loadingBtn: false,
            showCoomingSoon: false,
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
            userId: userInfo?.user?.id || "2123800227",
            showNotification: false,
            notificationMessage: "",
            notificationType: "",
            activeButton: ButtonName.Inventory as ButtonName,
            buttonInventory: [
                { name: "Inventory", label: "inventory" },
                { name: "Badges", label: "badges" },
                { name: "Fusion", label: "fusion" },
                { name: "Player", label: "player" },
            ] as Button[],
            showClaim: false,
            itemFusion: {} as IFusion,

            itemsInventory: {} as Record<string, IItemInventory[]>,
            itemsBadge: [] as IItemInventory[],
            arrInventory: [] as IItemInventory[],
            arrPlayer: {} as { [key: string]: IItemInventory[] },
            arrPlayerGrade: {} as { [key: string]: IItemInventory[] },
            dataPlayer: {} as { [key: string]: IItemInventory[] }, //data not merge count

            listFusion: [] as IFusion[],
            showButtons: false,
            activeIndex: null,

            isViewCart: false,
            dataDetailCart: {} as IDetailCart,
            isPass: false,
            useItem: {} as IItemInventory,
            countUse: 1,
            openUseCount: false,
            groupedBadge: {} as { [key: string]: IItemInventory[] },
            isMaintenance: false,
            openItem: false,
            listDetailPlayer: [] as IItemInventory[],
            itemDefault: 0,
            isFusionPlayer: false,
            dataFusionPlayer: {} as IItemInventory,
            imgStarSilver: [
                "/assets/fomation/star-silver.png",
                "/assets/fomation/star-silver.png",
                "/assets/fomation/star-silver.png",
                "/assets/fomation/star-silver.png",
                "/assets/fomation/star-silver.png",
            ],
            // selectedGroups: [],
        };
    },
    methods: {
        renderTitleKey,
        formatNumber,
        disableFusion,
        renderConfiguration,
        renderItemFusion,
        // getPlateImage,
        // getPlayerImage,
        fnGroupPosition,
        updateHeight() {
            const img = this.$refs.bannerInventory;            
            // if (img) {                
            //     img.onload = () => {
            //         const heightPx = this.activeButton === 'Player' ? '82px' : '42px'                    
            //         this.calcHeightInventory = `calc(100% - ${heightPx} - ${img.clientHeight}px)`;
            //     };
            // }

            if (img) {
                const onLoadHandler = () => {
                    const heightPx = this.activeButton === 'Player' ? '84px' : '42px';
                    this.calcHeightInventory = `calc(100% - ${heightPx} - ${img.clientHeight}px)`;
                    img.removeEventListener("load", onLoadHandler);
                };

                if (img.complete) {
                    onLoadHandler();
                } else {
                    img.addEventListener("load", onLoadHandler);
                }
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
            this.activeButton = button;
            this.updateHeight();
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
                const filterPlayer = res?.Items?.filter(
                (item) => item?.ItemDef?.Category === "PLAYER"
                );

                this.dataPlayer = filterPlayer
                const countName = countNameDefaultInStack(filterPlayer);
                const resultGroupedPlayer = groupedPlayer(countName)
                const resultSort = sortedGroupPlayer(resultGroupedPlayer)
                
                this.arrPlayer = resultSort
                this.arrPlayerGrade = resultSort

                this.itemsBadge = filterBadge;
                const groupedData = filterBadge.reduce((acc, item) => {
                    const category = item.ItemDef.Category;
                    if (!acc[category]) {
                        acc[category] = [];
                    }
                    acc[category].push(item);
                    return acc;
                }, {});
                this.groupedBadge = groupedData;

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
                        this.arrInventory = filterData;
                        this.itemsInventory = groupedItems;

            } catch (error) {
                console.error(error);
            }
        },
        async handleYesClaim() {
            try {
                this.loadingBtn = true;
                const data = {
                    UserId: this.userId.toString(),
                    CombineId: this.itemFusion.id.toString(),
                };
                const res = await userServiceInventory.makeFusion(data);
                // const res = await axios.post(`https://e168-171-224-181-35.ngrok-free.app/api/v1/fusion/makeFusion`, data);
                // const newRes = JSON.parse(res.data.message)
                trackEventBtn({
                    label: "Fusion",
                });
                
                if (res.success) {
                    this.dataFusionPlayer = res.data[0]
                    const mess = res?.data
                        ?.map((item) => {
                            return `${item?.count} - ${item?.Name}`;
                        })
                        ?.join(", ");
                        
                        // show popup fusion player
                        const configuration = res?.data?.[0]?.Configuration ? JSON.parse(res.data[0].Configuration) : null;
                        
                        if(configuration && Object.keys(configuration).length > 0){
                            this.isFusionPlayer = true
                        }
                    await this.renderSuccess(`Received ${mess}`);
                    await this.refeshData()
                } else {
                    await this.renderErr(`Received ${res?.data}`);
                }
            } catch (error) {
                if (error?.response?.status === 401) {
                    this.isPass = true;
                } else {
                    this.renderErr(`Error!`);
                }
            } finally {
                this.showClaim = false;
                this.loadingBtn = false;
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
            // this.isMaintenance = true
            this.showClaim = true;
            this.itemFusion = item;
        },
        async handleUseInventory(item: IItemInventory) {
            // this.isMaintenance = true
            this.useItem = item;
            this.openUseCount = true;
            this.countUse = 1;
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
        async yesUseNumber() {
            try {
                const targetItem = this.arrInventory.find(
                    (el) => el.id === this.useItem?.id
                );
                if (this.countUse > targetItem.ItemCount) {
                    this.renderErr(`Your quantity is insufficient`);
                    return;
                }
                this.loadingBtn = true;
                const payload = {
                    UserId: this.userId,
                    ItemCount: this.countUse,
                    ItemId: this.useItem?.id,
                };
                const res = await userServiceInventory.useInventory(payload);
                trackEventBtn({
                    label: `${this.useItem?.Code}` || "Use_Inventory",
                });
                if (res.success) {
                    const valueRes = res?.data?.[0];
                    await this.renderSuccess(
                        `Received ${valueRes?.Value} ${valueRes?.ValueType}`
                    );

                    for (const key of Object.keys(this.itemsInventory)) {
                        const items = this.itemsInventory[key];
                        for (const el of items) {
                            if (el.id === this.useItem?.id) {
                                el.ItemCount -= this.countUse;
                                if (el.ItemCount <= 0) {
                                    await this.getDataInventor();
                                }
                            }
                        }
                    }
                } else {
                    this.renderErr(`Received ${res?.data?.Message}`);
                }
            } catch (error) {
                if (error?.response?.status === 401) {
                    this.isPass = true;
                }
            } finally {
                this.loadingBtn = false;
                this.openUseCount = false;
            }
        },
        handlePlayer(item: IItemInventory){  
            
            this.itemDefault = item?.id
            this.openItem = true
            this.listDetailPlayer = this.dataPlayer?.filter(el => el?.ItemDefId === item.ItemDefId)   
                     
        },
        handleGroupClick(titleGroup: string, isActive: boolean) {
            if(titleGroup == 'Position' && isActive){
                this.arrPlayer = fnGroupPosition(this.arrPlayer)
            }else{
                this.arrPlayer = this.arrPlayerGrade
            }
        },
        async refeshData(){
            await this.getDataInventor();
            await this.getFausion();
            await this.getDataInfo();
        }
    },
});
</script>

<style scoped lang="scss">
// @import "@/styles/global.scss";

.wr-inventory-page {
    @apply absolute top-0 left-0 w-full h-full z-[999] text-white bg-center bg-no-repeat bg-cover;
    animation: fadeInDetail 0.1s ease forwards;
    background-image: url("./../../../public/assets/inventory/background-inventory.png");
}

@keyframes fadeInDetail {
    0% {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.5);
    }
    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.inventory-btns-banner {
    @apply flex w-full py-[7px] bg-[#0d2779] justify-around text-[12px] font-extrabold;
}

.inventory-btn-banner.active {
    @apply bg-[#ffa53a] text-white;
}

.inventory-btn-banner {
    @apply px-[10px] py-[5px] rounded-md cursor-pointer;
}

.inventory-btn-page {
    @apply h-full flex flex-col gap-[10px] bg-[#00175f] rounded-[10px] p-2 overflow-y-auto;
} 

.row-page {
    @apply border-b border-[#2F9AD6] p-1 rounded-md
}
.title-row {
    @apply text-[14px] mb-1 font-extrabold
}

.wr-box {
    height: 100%;
    padding: 15px;
    .box-item {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
        animation: slideIn 0.5s forwards;

        button {
            padding: 12px;
            font-size: 12px;
            border-radius: 8px;
            min-width: fit-content;
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
    @apply text-[10px] font-extrabold p-[5px] absolute top-0 right-0 text-white bg-black/50 rounded-bl-[10px];
}

.slideIn-fusion {
    @apply flex justify-between p-1.5 border-2 border-[#56d6ff] rounded-md;
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
    @apply absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black/50 flex-col gap-[5px] z-10;
}

.custom-flex-column {
  @apply flex flex-col gap-[5px];
}

.number-configuration, .code-configuration, .name-item-player {
    position: absolute;
    text-shadow: #000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px,
     #000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px;
}

.number-configuration {
    @apply top-[20%] left-[17%] text-[8px];
}
.code-configuration {
    @apply top-[33%] left-[17%] text-[6px];
}
.name-item-player {
    @apply bottom-[25%] left-[50%] text-[6px] transform -translate-x-1/2 text-center text-[#FFFDB7];
}
.count-item-player {
    @apply absolute bottom-[35%] right-[20%] text-[8px];
}

.wr-filter-player {
    @apply flex gap-3 bg-[#00175f] rounded-md p-1 px-2 items-center justify-end mb-2;
}

</style>
