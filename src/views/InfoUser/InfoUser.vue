<template>
    <div class="container-info" v-show="isTelegramLogin">
        <div class="info-user">
            <div
                class="wr-avt"
                :style="{
                    backgroundImage: `url(${urlAvt})`,
                }"
            />

            <div class="wrap-username-lv">
                <div class="username f-bangopro">
                    {{ first_name }} {{ last_name }}
                </div>
                <div class="lv">
                    <div class="text f-bangopro">
                        {{ dataLevel?.attributes?.levelName }}
                    </div>

                    <div class="exp-lv">
                        <div
                            class="progress-bar"
                            :style="{ width: percentageLevel + '%' }"
                        />
                        <div class="progress-text">
                            <div class="number" v-if="isMaxLv">Max</div>
                            <div class="number" v-else>
                                {{ percentageLevel?.toFixed(2) }}%
                            </div>
                            <div class="exp">EXP</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="wr-badge">
            <div v-for="(item, index) in itemsBadge" :key="index">
                <div
                    class="badge-img"
                    :style="{
                        backgroundImage: `url(${item?.ItemDef?.ImageUrl})`,
                    }"
                ></div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { ILevel } from "@/interface";
import userService from "@/services/userService";
import userServiceTelebot from "@/services/useServiceTeleBot";
import { calcExpPercentage, calcLevel, nextExpLevel } from "@/utils/exp";
import { defineComponent } from "vue";
import { EItemDefType, IItemInventory } from "@/interface";
import userServiceInventory from "@/services/inventoryService";
import { mapState } from "vuex";

export default defineComponent({
    name: "InfoUserPage",
    components: {},
    props: {
        dataLogin: {
            type: Object,
            required: true,
        },
    },
    computed: {
        ...mapState(["avtStore", "dataLvStore"]),
    },
    watch: {
        dataLogin: {
            deep: true,
            handler() {
                this.triggerAnimation();
                this.getLevels();
            },
        },
    },
    async mounted() {
        await this.getLevels();
        if (!this.avtStore) {
            await this.getAvt();
        } else {
            this.urlAvt = this.avtStore;
        }
        await this.getListInventorHome();
    },
    data() {
        const dataUserTele = window?.Telegram?.WebApp?.initDataUnsafe;
        let first_name = dataUserTele?.user?.first_name;
        let last_name = dataUserTele?.user?.last_name;

        return {
            isTelegramLogin: !!first_name || !!last_name,
            idUser: dataUserTele.user?.id?.toString() ?? "",
            first_name: first_name || '',
            last_name: last_name || '',
            isAnimated: false,
            animationTimeout: null,
            urlAvt: "./../../../public/assets/no-img.jpg",
            dataLevel: {} as ILevel,
            expLevelNext: {} as ILevel,
            percentageLevel: 0,
            isMaxLv: false,
            urlBadge: "./../../../public/assets/event/beta test.png",
            itemsBadge: [] as IItemInventory[],
        };
    },
    methods: {
        triggerAnimation() {
            this.isAnimated = true;
            if (this.animationTimeout) {
                clearTimeout(this.animationTimeout);
            }

            this.animationTimeout = setTimeout(() => {
                this.isAnimated = false;
                this.animationTimeout = null;
            }, 1000);
        },
        async getAvt() {
            const res = await userServiceTelebot.getAvtTelegram(this.idUser);
            this.urlAvt = res?.length > 0 ? res : "./../../../public/assets/logo.jpg";
            this.$store.commit("setAvtStore", res);
        },
        async getLevels() {                        
            const dataLv: ILevel[] =
                this.dataLvStore?.length > 0
                    ? this.dataLvStore
                    : await userService.getLevels();
                    
            if (this.dataLvStore?.length === 0) {                
                this.$store.commit("setDataLvStore", dataLv);
            }
            // const dataLv: ILevel[] = await userService.getLevels();

            const dataExpCurrent = this.dataLogin?.attributes?.exp;

            const currentLv = calcLevel(dataLv, dataExpCurrent);

            this.dataLevel = currentLv;

            const nextLevel = nextExpLevel(dataLv, currentLv);

            this.expLevelNext = nextLevel;

            const percentageLevel = calcExpPercentage(
                dataExpCurrent,
                dataLv,
                currentLv
            );

            const maxLV = dataLv?.[dataLv?.length - 1];

            if (maxLV?.attributes?.level == currentLv?.attributes?.level) {
                this.percentageLevel = 100;
                this.isMaxLv = true;
            } else {
                const calcPercentage = (
                    data: number,
                    width: number
                ): number => {
                    return (data / width) * 100;
                };
                this.percentageLevel =
                    calcPercentage(percentageLevel, 100) || 0;
            }
        },
        async getListInventorHome() {
            try {
                const res = await userServiceInventory.getListInventory(
                    Number(this.idUser)
                );
                const filterBadge = res?.Items?.filter(
                    (item) => item?.ItemDef?.Type === EItemDefType.Medal
                );
                const categoryMap = {};
                filterBadge.forEach(item => {
                    const category = item.ItemDef.Category;
                    const itemDefId = item.ItemDefId;
                    if (!categoryMap[category] || itemDefId > categoryMap[category]?.ItemDefId) {
                        categoryMap[category] = item;
                    }
                });
                const highestBadgePerCategory  = Object?.values(categoryMap);                
                
                this.itemsBadge = highestBadgePerCategory ;
            } catch (error) {
                console.error(error);
            }
        },
    },
    unmounted() {
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
        }
    },
});
</script>

<style scoped lang="scss">
$white: #fff;
$yellow: #ffff73;
$dark-red: #3b0000;
$deep-teal: #005662;

@mixin text-shadow($color) {
    text-shadow: 1px 1px 0 $color, -1px -1px 0 $color, 1px -1px 0 $color,
        -1px 1px 0 $color, 1px 0 0 $color, -1px 0 0 $color, 0 1px 0 $color,
        0 -1px 0 $color;
}

.container-info {
    width: 100%;
    position: absolute;
    font-size: 12px;
    top: 2%;
    left: 2%;
    display: flex;
    flex-direction: column;
}

.info-user {
    display: flex;
    gap: 7px;
    align-items: center;
}

.wr-avt {
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    width: 50px;
    height: 50px;
    border-radius: 10px;
    border: 2px solid $dark-red;
}

.wrap-username-lv {
    display: flex;
    flex-direction: column;
    gap: 3px;

    .lv {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }
}

.username {
    color: $white;
    @include text-shadow($dark-red);
}

.lv .text {
    color: $yellow;
    font-size: 10px;
    @include text-shadow($dark-red);
}

.exp-lv {
    width: 100px;
    background-color: $deep-teal;
    overflow: hidden;
    position: relative;
}

.progress-bar {
    height: 10px;
    background: linear-gradient(to right, #006371, #1affad);
    transition: width 0.5s ease;
}

.progress-text {
    font-size: 8px;

    .number {
        position: absolute;
        top: 50%;
        transform: translate(0%, -50%);
        display: flex;
        width: 100%;
        justify-content: center;
        height: 10px;
    }

    .exp {
        position: absolute;
        top: 50%;
        transform: translate(0%, -50%);
        display: flex;
        right: 2%;
        height: 10px;
    }
}

.wr-badge {
    margin-left: 60px;
    display: flex;
    gap: 5px;

    .badge-img {
        width: 25px;
        height: 25px;
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        display: flex;
        gap: 5px;
    }
}
</style>
