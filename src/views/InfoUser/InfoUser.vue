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
                <div class="username">{{ first_name }} {{ last_name }}</div>
                <div class="lv">
                    <!-- <div class="wr-balance">
                        <img src="@public/assets/logo.svg" />
                        <div
                            class="text-balance"
                            :class="{ 'animate-text': isAnimated }"
                        >
                            {{
                                dataLogin?.attributes?.qpoint?.data?.attributes
                                    ?.balance / 1000
                            }}
                        </div>
                    </div> -->

                    <div class="text">
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

            <!-- <img src="@public/assets//event/beta test.png" /> -->
        </div>
    </div>
</template>

<script lang="ts">
import { ILevel } from "@/interface";
import userService from "@/services/userService";
import userServiceTelebot from "@/services/useServiceTeleBot";
import { calcExpPercentage, calcLevel, nextExpLevel } from "@/utils/exp";
import { defineComponent } from "vue";
import { EItemDefType, IInventory, IItemInventory } from "@/interface";
import axios from "axios";

export default defineComponent({
    name: "InfoUserPage",
    components: {},
    props: {
        dataLogin: {
            type: Object,
            required: true,
        },
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
    data() {
        const dataUserTele = window?.Telegram?.WebApp?.initDataUnsafe;

        let first_name = dataUserTele?.user?.first_name || "";
        let last_name = dataUserTele?.user?.last_name || "";

        return {
            isTelegramLogin: !!first_name || !!last_name,
            idUser: dataUserTele.user?.id?.toString() ?? "",
            first_name: first_name,
            last_name: last_name,
            isAnimated: false,

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
            setTimeout(() => {
                this.isAnimated = false;
            }, 1000);
        },
        async getAvt() {
            const res = await userServiceTelebot.getAvtTelegram(this.idUser);
            this.urlAvt = res;
        },
        async getLevels() {
            const dataLv: ILevel[] = await userService.getLevels();

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

            const maxLV = dataLv?.pop();

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
            axios
                .get(
                    `https://6ade-171-224-177-81.ngrok-free.app/api/v1/inventory/getInventory?userId=${this.idUser}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "1",
                        },
                    }
                )
                .then((response) => {
                    const data: IInventory = JSON.parse(response.data.message);
                    const filterBadge = data?.Items?.filter(
                        (item) => item?.ItemDef?.Type === EItemDefType.Medal
                    );
                    this.itemsBadge = filterBadge;
                })
                .catch((error) => {
                    console.error("Có lỗi xảy ra:", error);
                });
        },
    },
    async mounted() {
        await this.getLevels();
        await this.getAvt();
        await this.getListInventorHome();
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
    gap: 5px;
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
    font-family: monospace;
    font-weight: bold;
    font-size: 8px;
    .number {
        position: absolute;
        top: 50%;
        transform: translate(0%, -50%);
        display: flex;
        width: 100%;
        justify-content: center;
    }
    .exp {
        position: absolute;
        top: 50%;
        transform: translate(0%, -50%);
        display: flex;
        right: 2%;
    }
}

.wr-balance {
    display: flex;
    gap: 5px;
    align-items: center;
    color: $white;
    font-size: 10px;
    border-radius: 8px;
    img {
        width: 15px;
        height: 15px;
    }
    .text-balance {
        transition: all 1s ease;
        @include text-shadow($dark-red);
    }
    .animate-text {
        transform: scale(1.2);
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
