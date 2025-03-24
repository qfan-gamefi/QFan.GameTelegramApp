<template>
    <transition name="popup-fade">
        <div class="popup-container" v-if="visible">
            <div
                class="popup-content"
                :style="{ backgroundColor: backgroundColor, border: border }"
            >
                <div @click="no()" class="close-popup">
                    <i
                        class="fa-solid fa-rectangle-xmark"
                        style="color: #ff0000"
                    ></i>
                </div>

                <div class="title">
                    <div class="mb-3 text-sm font-extrabold">
                        {{ itemDetail?.Name }}
                    </div>

                    <div class="flex gap-2 font-semibold px-5">
                        <div class="flex-1 relative">
                            <div v-if="['legendary'].includes(itemDetail?.ItemDef?.Grade?.toLowerCase())" class="shine-A shine-2"></div>
                            <div v-if="['legendary'].includes(itemDetail?.ItemDef?.Grade?.toLowerCase())" class="shine-A shine-3"></div>
                            
                            <LightningCard
                                v-if="['iconic'].includes(itemDetail?.ItemDef?.Grade?.toLowerCase())"
                                :cardImage="JSON.parse(itemDetail?.ItemDef?.ImageUrl)?.Plate" :freezeAfter="30"
                                :widthImg="'w-full'"
                            />
                            <img 
                                v-else
                                class="w-full object-cover fadein"
                                :src="
                                    JSON.parse(itemDetail?.ItemDef?.ImageUrl)
                                        ?.Plate
                                "
                                loading="lazy"
                            />
                            <img
                                class="object-cover absolute top-[16%] right-[8%] w-[60%] fadein"
                                :src="
                                    JSON.parse(itemDetail?.ItemDef?.ImageUrl)
                                        ?.Player
                                "
                                loading="lazy"
                            />
                            <div class="number-configuration">
                                {{
                                    renderConfiguration(
                                        itemDetail?.Configuration
                                    )
                                }}
                            </div>
                            <div class="code-configuration">
                                {{ itemDetail?.Code }}
                            </div>
                            <div class="name-item-player">
                                {{ itemDetail?.Name }}
                            </div>
                            <div class="slot-item">
                                {{ itemDetail?.ItemCount }}
                            </div>
                            <div class="flex absolute bottom-[23%] left-[50%] transform -translate-x-1/2">
                                <img
                                    v-for="(image, index) in imgStarSilver"
                                    :key="index"
                                    class="w-2 object-cover"
                                    :src="image"
                                    loading="lazy"
                                />
                            </div>

                            <div class="flex justify-center">
                                <button
                                    class="w-fit rounded-sm"
                                    :disabled="loading"
                                    @click="useDefault()"
                                >
                                    Use 
                                    <span v-if="loading">
                                        <i class="fa-solid fa-spinner fa-spin"></i>
                                    </span>
                                    
                                </button>
                            </div>
                        </div>
                        <div class="flex-1">
                            <div
                                class="flex w-full justify-between px-4 mb-2"
                                v-for="item in itemDetail?.ConfigurationArr"
                            >
                                <div>{{ item?.Configuration }}</div>
                                <div class="text-[#FFEA00]">
                                    {{ Math.round(item?.value) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box-table">
                    <div class="box-title-columns">
                        <div class="title-column">{{ $t("no") }}.</div>
                        <div class="title-column">Name</div>
                        <div class="title-column">Position</div>
                        <div class="title-column">BP</div>
                    </div>

                    <div class="max-h-36 overflow-y-auto">
                        <div
                            class="table-item"
                            v-for="(item, index) in newDataList"
                            :key="item.id"
                            @click="swItem(item)"
                            :class="itemDetail?.id === item?.id && 'rowDefault'"
                        >
                            <div class="item-col">
                                {{ index + 1 }}
                            </div>
                            <div class="item-col">
                                {{ item?.Name }}
                                <span v-if="item?.DefaultInStack">
                                    <i class="fa-solid fa-check" style="color: #63e6be"></i>
                                </span>
                            </div>
                            <div class="item-col">
                                {{ item?.Code }}
                            </div>
                            <div class="item-col text-[#FFFF73]">
                                {{ renderConfiguration(item?.Configuration) }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { IItemInventory, IDetailPlayer } from "@/interface";
import { defineComponent, PropType } from "vue";
import { renderConfiguration } from "./inventoryHelpers";
import { processPlayerDetails } from "../Fomation/defination-fomation";
import userServiceInventory from "@/services/inventoryService";
import LightningCard from "@/components/LightningCard.vue";

export default defineComponent({
    name: "PopupItemPage",
    components: {
        LightningCard
    },
    props: {
        listData: {
            type: Array as PropType<IItemInventory[]>,
            required: true,
        },
        idDefault: {
            type: Number,
            required: true,
        },
        backgroundColor: {
            type: String,
            default: "#00175F",
        },
        border: {
            type: String,
            default: "1px solid #89A2EF",
        },
        visible: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    watch: {
        visible(newVal, oldVal) {
            if (newVal) {                
                this.newDataList = this.listData?.map((item) => {
                    return {
                        ...item,
                        ConfigurationNumber: renderConfiguration(item?.Configuration),
                    }
                })?.sort((a, b) => b.ConfigurationNumber - a.ConfigurationNumber);               

                const item = this.listData.find(
                    (item) => item?.id === this.idDefault
                );
                if(item){
                    this.itemDetail = this.processPlayerDetails(item);
                }
            }
        },
    },
    emits: ['no', 'refeshData'],
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;
        return {
            loading: false,
            newDataList: [] as IDetailPlayer[],
            itemDetail: {} as IDetailPlayer,
            userId: userInfo?.user?.id || "",
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
        processPlayerDetails,
        swItem(itemSw: IDetailPlayer) {
            if (this.listData) {
                const item = this.listData.find(
                    (item) => item?.id === itemSw?.id
                );
                if (item) {
                    this.itemDetail = this.processPlayerDetails(item);
                }
            }
        },
        async useDefault() {
            //success call api 
            try {
                this.loading = true;
                const raw = {
                    itemId: this.itemDetail?.id.toString(),
                    userId: this.userId?.toString(),
                };

                const res = await userServiceInventory.useDefault(raw)

                if (res?.success) {
                    const newData = this.newDataList?.map((item) => {
                        if (item?.id === res.data?.id) {
                            return res.data;
                        }
                        return {
                            ...item,
                            DefaultInStack: false,
                        };
                    });
                    this.newDataList = [...newData]
                    this.refeshData()
                }
            } catch (error) {
                // Handle error here if necessary
            } finally {
                this.loading = false;
            }
        },
        no() {
            this.$emit("no");
        },
        refeshData() {
            this.$emit("refeshData");
        },
    },
});

</script>

<style scoped>
.close-popup {
    @apply absolute top-1 right-1;
}
.close-popup svg {
    font-size: 18px;
}

.popup-container {
    @apply fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-[9999] text-black;
}

.popup-content {
    @apply text-xs rounded text-center relative text-white border border-[#89a2ef] p-2 w-[90%] flex flex-col gap-2;
}

.number-configuration {
    @apply top-[28%] left-[25%] text-xs;
}
.code-configuration {
    @apply top-[20%] left-[25%] text-xs;
}

.number-configuration, .code-configuration, .name-item-player {
    position: absolute;
    text-shadow: #000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px,
     #000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px;
}

.name-item-player {
    @apply bottom-[30%] left-[50%] text-xs transform -translate-x-1/2 text-[#FFFDB7];
}
.slot-item {
    @apply text-[10px] font-extrabold p-[5px] absolute top-0 right-0 text-[#fffb3a] bg-black/50 rounded-bl-[10px];
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000;
}
.box-table {
    @apply bg-[#0c2678] p-1 rounded-lg;
}
.box-title-columns {
    @apply flex text-xs font-extrabold;
    padding: 10px 0;
    border-bottom: 1px solid #fff;
}
.title-column {
    text-align: center;
}

.title-column:nth-child(1) {
    width: 10%;
}
.title-column:nth-child(2) {
    width: 50%;
}
.title-column:nth-child(n + 3) {
    width: 20%;
}
.table-item {
    @apply flex items-center py-2;
    border-bottom: 1px solid #ffffff5c;
    font-size: 10px;
}
.item-col {
    text-align: center;
}

.item-col:nth-child(1) {
    width: 10%;
}
.item-col:nth-child(2) {
    width: 50%;
}
.item-col:nth-child(n + 3) {
    width: 20%;
}
.rowDefault {
    @apply bg-[#004C83];
}
</style>
