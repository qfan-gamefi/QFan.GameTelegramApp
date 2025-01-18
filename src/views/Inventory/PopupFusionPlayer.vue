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
                    <div class="mb-3 font-extrabold text-xl">
                        Congratulation
                    </div>

                    <div class="flex gap-2 font-semibold px-8">
                        <div class="flex-1 relative">
                            <!-- <div
                                v-if="
                                    ['iconic', 'legendary'].includes(
                                        itemDetail?.ItemDef?.Grade?.toLowerCase()
                                    )
                                "
                                class="shine shine-2"
                            ></div>
                            <div
                                v-if="
                                    ['iconic', 'legendary'].includes(
                                        itemDetail?.ItemDef?.Grade?.toLowerCase()
                                    )
                                "
                                class="shine shine-3"
                            ></div> -->
                            <img
                                class="w-full object-cover fadein"
                                :src="getPlateImage(itemDetail)"
                                loading="lazy"
                            />
                            <img
                                class="object-cover absolute top-[16%] right-[8%] w-[60%] fadein"
                                :src="getPlayerImage(itemDetail)"
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
                            <div class="flex absolute bottom-[18%] left-[50%] transform -translate-x-1/2">
                                <img
                                    v-for="(image, index) in imgStarSilver"
                                    :key="index"
                                    class="w-2 object-cover"
                                    :src="image"
                                    loading="lazy"
                                />
                            </div>
                        </div>

                        <div class="flex-1 text-sm">
                            <div
                                class="flex w-full justify-between px-2 mb-1"
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
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { IItemInventory, IDetailPlayer } from "@/interface";
import { defineComponent, PropType } from "vue";
import { renderConfiguration } from "./inventoryHelpers";
import { processPlayerDetails } from "../Fomation/defination-fomation";

export default defineComponent({
    name: "PopupFusionPlayerPage",
    props: {
        data: {
            // type: Object as PropType<IItemInventory>,
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

                this.itemDetail = this.data
                this.itemDetail = this.processPlayerDetails(this.itemDetail);
            }
        },
    },
    emits: ["no"],
    data() {
        return {
            loading: false,
            itemDetail: {} as IDetailPlayer,
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
        no() {
            this.$emit("no");
        },
        getPlateImage(item) {
            try {
                const imageUrl = JSON.parse(item?.ImageUrl);
                return imageUrl?.Plate || "/assets/fomation/add_player.png";
            } catch (e) {
                return "/assets/fomation/add_player.png";
            }
        },
        getPlayerImage (item) {
            try {
                const imageUrl = JSON.parse(item?.ImageUrl);
                return imageUrl?.Player || "/assets/fomation/add_player.png";
            } catch (e) {
                return "/assets/fomation/add_player.png";
            }
        }
    },
});
</script>

<style scoped>
.close-popup {
    @apply absolute top-1 right-2;
}
.close-popup svg {
    font-size: 18px;
}

.popup-container {
    @apply fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-[9999] text-black;
}

.popup-content {
    @apply rounded text-center relative text-white border border-[#89a2ef] p-2 w-[90%] flex flex-col gap-2;
}

.number-configuration, .code-configuration, .name-item-player {
    font-size: 14px;
    position: absolute;
    text-shadow: #000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px,
     #000 0px 0px 1px,   #000 0px 0px 1px,   #000 0px 0px 1px;
}
.number-configuration {
    @apply absolute top-[30%] left-[20%] ;

}
.code-configuration {
    @apply absolute top-[20%] left-[20%];
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000;
}
.name-item-player {
    @apply absolute bottom-[23%] left-[50%] transform -translate-x-1/2 text-[#FFFDB7];
}
</style>
