<template>
    <div class="container-fomation responsive-fomation">
        <img
            class="w-full object-cover relative"
            src="/assets/fomation/fomation_bg2.png"
            loading="lazy"
        />
        <div class="score-name">
            <div class="flex gap-2">
                <!-- <img src="/assets/mining/fire-gif.gif" class="h-12" loading="lazy" /> -->
                <div class="flex gap-1">
                    BP
                    <div class="text-red-500">{{ totalConfiguration }}</div>
                </div>
            </div>

            <div class="text-name">{{ first_name }} {{ last_name }}</div>
        </div>

        <div class="fomation-page responsive-fomation">
            <div class="grid grid-rows-6 w-full h-full items-center">
                <div
                    v-for="(player, index) in dataList"
                    :key="index"
                    class="grid grid-cols-5 items-center"
                >
                    <div
                        v-for="(item, idx) in player"
                        :key="idx"
                        class="cursor-pointer relative"
                        @click="handleAddPlayer(item, index, idx)"
                    >
                        <div v-if="item && totalItemDefId?.length <= 11">
                            <img
                                v-if="(index === 5 && idx === 2) || index !== 5"
                                :src="getPlateImage(item)"
                                class="object-cover"
                                :class="!item ? 'opacity-10' : 'fadein'"
                                loading="lazy"
                            />

                            <div>
                                <img
                                    v-if="
                                        (index === 5 && idx === 2) ||
                                        index !== 5
                                    "
                                    class="object-cover absolute top-[16%] right-[5%] w-[60%] fadein"
                                    :src="getPlayerImage(item)"
                                    loading="lazy"
                                />
                            </div>
                            <div class="number-configuration">
                                {{ renderConfiguration(item?.Configuration) }}
                            </div>
                            <div class="code-configuration">
                                {{ item?.Code }}
                            </div>
                            <div class="name-item-player">{{ item?.Name }}</div>
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

                        <div v-if="!item && totalItemDefId?.length < 11">
                            <img
                                v-if="(index === 5 && idx === 2) || index !== 5"
                                :src="getPlateImage(item)"
                                class="object-cover"
                                :class="!item ? 'opacity-10' : 'fadein'"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div v-bind:class="{ 'overlay-popup': isGroupPlayer }"></div>
            <div v-if="isGroupPlayer" class="grPlayer fadein">
                <div class="wr-filter-player">
                    <GroupPlayerComponent
                        v-for="(position, index) in ['Position']"
                        :position="position" 
                        @groupClicked="handleGroupClick"
                        :key="index"
                    />
                    <i class="fa-solid fa-filter fa-sm"></i>
                </div>

                <div class="h-[calc(100%-81px)] overflow-y-auto my-2">
                    <div
                        v-for="(player, title) in grPlayer"
                        :key="title"
                        class="row-page"
                    >
                        <div class="title-row">
                            {{ title }}
                        </div>
                        <div class="box-item">
                            <div
                                v-for="item in player"
                                :key="item?.id"
                                class="relative cursor-pointer"
                                @click="handleShowCf(item)"
                            >
                                <img
                                    class="w-full object-cover fadein"
                                    :src="
                                        JSON.parse(item?.ItemDef?.ImageUrl)
                                            ?.Plate
                                    "
                                    loading="lazy"
                                />
                                <div
                                    v-if="
                                        ['iconic', 'legendary'].includes(
                                            item?.ItemDef?.Grade?.toLowerCase()
                                        )
                                    "
                                    class="shine-A shine-2"
                                ></div>
                                <div
                                    v-if="
                                        ['iconic', 'legendary'].includes(
                                            item?.ItemDef?.Grade?.toLowerCase()
                                        )
                                    "
                                    class="shine-A shine-3"
                                ></div>
                                <img
                                    class="object-cover absolute top-[16%] right-[5%] w-[60%] fadein"
                                    :src="
                                        JSON.parse(item?.ItemDef?.ImageUrl)
                                            ?.Player
                                    "
                                    loading="lazy"
                                />
                                <div class="number-configuration">
                                    {{ item?.Configuration }}
                                </div>
                                <div class="code-configuration">
                                    {{ item?.Code }}
                                </div>
                                <div class="name-item-player">
                                    {{ item?.Name }}
                                </div>
                                <div class="slot-item">
                                    {{ item?.ItemCount }}
                                </div>
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

                    <div class="btn-grPlayer">
                        <div class="flex gap-3 font-bold w-fit m-auto text-xs">
                            <div
                                class="rounded bg-[#b51616] px-3 py-1 border border-white"
                                @click="isGroupPlayer = false"
                            >
                                Close
                            </div>

                            <div
                                :disabled="loading"
                                class="rounded bg-[#009FE3] px-3 py-1 border border-white"
                                @click="clearPlayer()"
                                :class="!itemClick && 'disable'"
                            >
                                Clear
                                <span v-if="loading">
                                    <i class="fa-solid fa-spinner fa-spin"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- <PopupAddPlayer
            :visible="openItem" 
            @no="openItem = false"  
            :listData = "dataPlayer"
            :idDefault = "itemDefault"
        /> -->

            <PopupConfirm
                v-if="isPopup"
                :text="textConfirm"
                :loading="loading"
                :visible="isPopup"
                @yes="yesPopup()"
                @no="isPopup = false"
            />

            <NotificationToast
                v-if="showNotification"
                :message="notificationMessage"
                :type="notificationType"
                @close="showNotification = false"
            />
        </div>

        <div class="absolute bottom-0 p-5 flex gap-5 font-extrabold">
            <router-link to="/">
                <div
                    class="bg-[#009FE3] rounded px-5 py-2 flex items-center gap-1"
                >
                    <i class="fa-solid fa-house fa-xs"></i> Home
                </div>
            </router-link>

            <div
                @click="handleClearAll()"
                class="bg-[#4e4e4e] rounded px-5 py-2 flex items-center gap-1"
            >
                <i class="fa-solid fa-eraser fa-xs"></i> Clear
            </div>

            <button
                :disabled="loading"
                class="rounded text-xs p-3 border border-white px-5 py-2 h-auto"
                @click="savePlayer()"
            >
                <i class="fa-regular fa-floppy-disk fa-lg"></i>
                SAVE
                <span v-if="loading">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                </span>
            </button>
        </div>

        <PopupPassword :visible="isPass" @cancel="isPass = false" />
    </div>
</template>

<script lang="ts">
import BackButtonTelegram from "@/mixins/BackButtonTelegram";
import axios from "axios";
import { fnGroupPosition, renderConfiguration } from "../Inventory/inventoryHelpers";
import {
    getPlateImage,
    getPlayerImage,
    countNameDefaultInStack,
    groupedPlayer,
    sortedGroupPlayer,
} from "./defination-fomation";
import PopupAddPlayer from "./PopupAddPlayer.vue";
import { IDetailPlayer, IItemInventory } from "@/interface";
import PopupConfirm from "@/components/PopupConfirm.vue";
import NotificationToast from "@/components/NotificationToast.vue";
import userServiceInventory from "@/services/inventoryService";
import PopupPassword from "@/components/popup/PopupPassword.vue";
import GroupPlayerComponent from "../Inventory/GroupPlayerComponent.vue";

export default {
    name: "FomationPage",
    mixins: [BackButtonTelegram],
    components: {
        PopupAddPlayer,
        PopupConfirm,
        NotificationToast,
        PopupPassword,
        GroupPlayerComponent
    },
    async created() {
        await this.getFileConfig();
        await this.getDataInventor();
    },
    watch: {
        totalItemDefId: {
            handler(newVal) {
                this.getGroupItemDef(this.dataInventory);
            },
            deep: true,
        },
        dataList: {
            handler(newVal) {
                this.totalForces();
            },
            deep: true,
        },
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;
        const createEmptyGrid = (rows, cols) =>
            Array.from({ length: rows }, () => Array(cols).fill(null));

        return {
            isPass: false,
            first_name: userInfo?.user?.first_name || "",
            last_name: userInfo?.user?.last_name || "",
            userId: userInfo?.user?.id || "",
            showNotification: false,
            notificationMessage: "",
            notificationType: "success",
            loading: false,
            openItem: false,
            isPopup: false,
            dataInventory: {},
            itemDefault: 0,
            dataPlayer: [] as IDetailPlayer[], //data not merge count
            isGroupPlayer: false,
            grPlayer: {} as { [key: string]: IDetailPlayer[] },
            grPlayerGrade: {} as { [key: string]: IDetailPlayer[] },
            dataList: createEmptyGrid(6, 5),
            idxParent: 0,
            idxChildren: 0,
            idsListCells: createEmptyGrid(6, 5),
            isAdd: true,
            itemAdd: {} as IDetailPlayer,
            textConfirm: "do_you_want_add_player",
            totalItemDefId: [],
            itemClick: {} as IDetailPlayer,
            totalConfiguration: 0,
            imgStarSilver: [
                "/assets/fomation/star-silver.png",
                "/assets/fomation/star-silver.png",
                "/assets/fomation/star-silver.png",
                "/assets/fomation/star-silver.png",
                "/assets/fomation/star-silver.png",
            ],
        };
    },
    methods: {
        renderConfiguration,
        getPlateImage,
        getPlayerImage,
        fnGroupPosition,
        async renderNotification(message, type) {
            this.notificationMessage = message;
            this.notificationType = type;
            this.showNotification = true;
        },
        async renderSuccess(text: string) {
            this.renderNotification(text, "success");
        },
        async renderErr(text: string) {
            this.renderNotification(text, "error");
        },
        totalForces() {
            const dataFlat = this.dataList.flat()?.map((item) => {
                return {
                    ...item,
                    Configuration: renderConfiguration(item?.Configuration),
                    ConfigurationText: item?.Configuration,
                };
            });
            const totalConfiguration = dataFlat.reduce(
                (sum, item) => sum + (item.Configuration || 0),
                0
            );
            this.totalConfiguration = totalConfiguration;
        },
        async getFileConfig() {
            // const res = await axios.get(
            //     `https://3f96-171-224-181-35.ngrok-free.app/api/v1/lineup/fieldConfig?userId=${this.userId}`,
            //     {
            //         headers: { "ngrok-skip-browser-warning": "1" },
            //     }
            // );
            try {
                const res = await userServiceInventory.getFileConfig(
                    this.userId
                );
                const mapIds = (arr) => {
                    return arr.map((row) =>
                        row.map((cell) => (cell && cell.id) || null)
                    );
                };

                const arrCellsId = mapIds(res.data);
                this.idsListCells = arrCellsId;
                this.dataList = [...res.data];

                const extractIds = (arr) => {
                    const ids = [];
                    arr.forEach((row) => {
                        row.forEach((cell) => {
                            if (cell && cell.ItemDefId) {
                                ids.push(cell.ItemDefId);
                            }
                        });
                    });
                    return ids;
                };

                const idsItemDef = extractIds(res.data);
                this.totalItemDefId = idsItemDef;
            } catch (error) {
                // if (error?.response?.status === 401) {
                //     this.isPass = true;
                // }
            }
        },
        async getDataInventor() {
            // const res = await axios.get(
            //     `https://3f96-171-224-181-35.ngrok-free.app/api/v1/inventory/getInventory?userId=${this.userId}`,
            //     {
            //         headers: { "ngrok-skip-browser-warning": "1" },
            //     }
            // );
            const res = await userServiceInventory.getListInventory(
                Number(this.userId)
            );
            // const data = JSON.parse(res.data.message);
            this.dataInventory = res;
            this.getGroupItemDef(res);
        },
        getGroupItemDef(data) {
            const filterPlayer = data?.Items?.filter(
                (item) =>
                    item?.ItemDef?.Category === "PLAYER" &&
                    this.totalItemDefId?.indexOf(item?.ItemDefId) === -1
            );
            const countName = countNameDefaultInStack(filterPlayer);
            const resultGroupedPlayer = groupedPlayer(countName);
            const resultSort = sortedGroupPlayer(resultGroupedPlayer);

            this.grPlayer = resultSort;
            this.grPlayerGrade = resultSort;
        },
        handleAddPlayer(item, index, idx) {
            this.isGroupPlayer = true;
            this.idxParent = index;
            this.idxChildren = idx;
            this.itemClick = item;
        },

        async handleShowCf(item) {
            this.itemAdd = item;
            this.isPopup = true;
            this.isAdd = true;
            this.textConfirm = "do_you_want_add_player";
        },
        async callAddPlayer() {
            try {
                this.loading = true;
                const raw = {
                    userId: this.userId?.toString(),
                    cells: this.idsListCells,
                };
                const res = await userServiceInventory.postFileConfig(raw);
                // const res = await axios.post(
                //     "https://3f96-171-224-181-35.ngrok-free.app/api/v1/lineup/fieldConfig",
                //     raw,
                //     {
                //         headers: {
                //             "ngrok-skip-browser-warning": "1",
                //             "Content-Type": "application/json",
                //         },
                //     }
                // );

                if (res?.success) {
                    this.renderSuccess("Add player success");
                    await this.getFileConfig();
                    await this.getDataInventor();
                }
            } catch (error) {
                // Handle error here if necessary
                this.renderErr(error);
            } finally {
                this.loading = false;
                this.isPopup = false;
            }
        },
        async clearPlayer() {
            this.textConfirm = "do_you_want_clear_player";
            this.isAdd = false;
            this.isPopup = true;
        },
        async yesPopup() {
            if (this.isAdd) {
                //add
                if (this.itemClick) {
                    this.totalItemDefId = this.totalItemDefId
                        ?.filter((el) => el !== this.itemClick?.ItemDefId)
                        ?.concat(this.itemAdd?.ItemDefId);
                    const dataAdd = { ...this.itemAdd };
                    dataAdd.Configuration = dataAdd.ConfigurationText;
                    delete dataAdd.ConfigurationText;

                    this.dataList[this.idxParent][this.idxChildren] = dataAdd;
                    this.idsListCells[this.idxParent][this.idxChildren] =
                        dataAdd?.id;
                } else {
                    this.totalItemDefId = [
                        ...this.totalItemDefId,
                        this.itemAdd?.ItemDefId,
                    ];
                    const dataAdd = { ...this.itemAdd };
                    dataAdd.Configuration = dataAdd.ConfigurationText;
                    delete dataAdd.ConfigurationText;

                    this.dataList[this.idxParent][this.idxChildren] = dataAdd;
                    this.idsListCells[this.idxParent][this.idxChildren] =
                        dataAdd?.id;
                }
            } else {
                //clear
                if (this.itemClick) {
                    this.totalItemDefId = this.totalItemDefId?.filter(
                        (el) => el !== this.itemClick?.ItemDefId
                    );
                    this.dataList[this.idxParent][this.idxChildren] = null;
                    this.idsListCells[this.idxParent][this.idxChildren] = null;
                } else {
                    // console.log('here:::');
                    // this.totalItemDefId = this.totalItemDefId?.filter(el => el !== this.itemAdd?.ItemDefId)
                    // this.dataList[this.idxParent][this.idxChildren] = null;
                    // this.idsListCells[this.idxParent][this.idxChildren] = null;
                }

                // await this.handleYesClear();
            }
            this.isPopup = false;
            this.isGroupPlayer = false;
        },
        async savePlayer() {
            await this.callAddPlayer();
        },
        handleClearAll() {
            const createEmptyGrid = (rows, cols) =>
                Array.from({ length: rows }, () => Array(cols).fill(null));

            this.dataList = createEmptyGrid(6, 5);
            this.idsListCells = createEmptyGrid(6, 5);
            this.totalItemDefId = [];
        },
        handleGroupClick(titleGroup: string, isActive: boolean) {
            if(titleGroup == 'Position' && isActive){
                this.grPlayer = fnGroupPosition(this.grPlayer)
            }else{
                this.grPlayer = this.grPlayerGrade
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.fomation-page {
    @apply text-white absolute px-5 pt-0 pb-0;
}

.number-configuration,
.code-configuration,
.name-item-player {
    position: absolute;
    text-shadow: #000 0px 0px 1px, #000 0px 0px 1px, #000 0px 0px 1px,
        #000 0px 0px 1px, #000 0px 0px 1px, #000 0px 0px 1px;
}
.number-configuration {
    @apply absolute top-[35%] left-[17%] text-[8px];
}
.code-configuration {
    @apply absolute top-[25%] left-[17%] text-[6px];
}
.name-item-player {
    @apply absolute bottom-[25%] left-[50%] text-[6px] transform -translate-x-1/2 text-center text-[#FFFDB7];
}

.row-page {
    @apply border-b border-[#1e9a50] p-1 rounded-md;
}
.title-row {
    @apply text-[14px] mb-1 font-extrabold;
}
.box-item {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
}
.slot-item {
    @apply text-[10px] font-extrabold p-[5px] absolute top-0 right-0 text-[#fffb3a] bg-black/50 rounded-bl-[10px];
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000;
}

.remove-player {
    @apply absolute top-0 right-0 z-10;
}
.grPlayer {
    @apply fixed w-[90%] h-[90%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1c4e2e] p-3 rounded-md z-[999];
}
.disable {
    @apply opacity-50 cursor-none;
}
.responsive-fomation {
    @apply max-w-[480px];
}
.btn-grPlayer {
    @apply fixed bottom-0 left-1/2 transform -translate-x-1/2 border-t w-full p-2;
}
.score-name {
    @apply absolute top-0 left-0 bg-white w-full p-2 flex items-center text-[#00175F] font-extrabold text-2xl justify-between;
}
.container-fomation {
    @apply relative flex items-center justify-center bg-[#237000] h-screen;
}
.text-name {
    @apply max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis;
}
.wr-filter-player {
    @apply flex gap-3 pb-2 items-center justify-end border-b border-solid;
}
</style>
