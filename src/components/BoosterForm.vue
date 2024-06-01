<template>
    <div class="popup-booster" v-if="visible">
        <div class="box-booster">
            <!-- <div @click="$emit('close')" class="close-home">
                <i class="fa-solid fa-rectangle-xmark"></i>
            </div> -->

            <Loading :loading="loading" />
            <EmptyForm v-if="showEmptyForm" />

            <div class="box-content-booster" v-if="!loading">
                <div class="your-balance">
                    <div class="title-your-balance">Your Balance</div>
                    <div class="point-balance t-primary-color">
                        {{ animatedBalance }}
                        <img src="./../../public/assets/logo.svg" />
                    </div>
                    <div class="desc-your-balance">
                        Mining Speed: {{ rewardAmount }}
                        <img src="./../../public/assets/logo.svg" />/hour
                    </div>
                </div>

                <div class="stadium text-outline-black">Stadium</div>
                <div
                    class="container-stadium"
                    :key="stadiumItems?.id"
                    @click="handleStadium(stadiumItems)"
                >
                    <div class="logo-stadium">
                        <img
                            :src="`https://qfan-api.qcloud.asia${stadiumItems?.attributes?.image?.data?.attributes?.url}`"
                        />
                    </div>

                    <div class="box-stadium">
                        <div class="stadium-left">
                            <div class="lv-stadium t-primary-color">
                                Level {{ stadiumItems?.attributes?.applyLevel }}
                            </div>
                            <div class="content-stadium">
                                {{ stadiumItems?.attributes?.name }}
                            </div>
                            <div class="desc-stadium">
                                {{ stadiumItems?.attributes?.description }}
                            </div>
                        </div>

                        <!-- <div class="stadium-right t-primary-color">
                            {{ stadiumItems?.attributes?.price }}
                            <img src="./../../public/assets/logo.svg" />
                        </div> -->
                    </div>
                </div>

                <div class="stadium text-outline-black">Training Room</div>
                <div
                    class="container-stadium"
                    :key="trainingItems.id"
                    @click="handleTraining"
                >
                    <div class="logo-stadium">
                        <img
                            :src="`https://qfan-api.qcloud.asia${trainingItems?.attributes?.image?.data?.attributes?.url}`"
                        />
                    </div>

                    <div class="box-stadium">
                        <div class="stadium-left">
                            <div class="lv-stadium t-primary-color">
                                Level
                                {{ trainingItems?.attributes?.applyLevel }}
                            </div>
                            <div class="content-stadium">
                                {{ trainingItems?.attributes?.name }}
                            </div>
                            <div class="desc-stadium">
                                {{ trainingItems?.attributes?.description }}
                            </div>
                        </div>

                        <!-- <div class="stadium-right t-primary-color">
                            {{ trainingItems?.attributes?.price }}
                            <img src="./../../public/assets/logo.svg" />
                        </div> -->
                    </div>
                </div>
            </div>
        </div>

        <TemplateUpLevel
            :showPopup="isShowStadium"
            @close="closeStadium"
            :items="stadiumItems"
            :dataNext="dataNext"
            :idUser="idUser"
            :isMax="isMax"
            :titleUpload="'Stadium'"
            :descUpload="'Better storage holds more QUAI and you can claim it less often'"
            :typeBooster="typeBooster"
        />

        <TemplateUpLevel
            :showPopup="isShowTraining"
            @close="closeStadium"
            :items="trainingItems"
            :dataNext="dataNext"
            :idUser="idUser"
            :isMax="isMax"
            :titleUpload="'Training Room'"
            :descUpload="'Better boots minings speed'"
            :typeBooster="typeBooster"
        />
    </div>
</template>

<script>
import userService from "../services/userService";
import Loading from "./LoadingForm.vue";
import TemplateUpLevel from "./TemplateUpLevel.vue";
import EventBus from "./../utils/eventBus";
import { toRaw } from "vue";

export default {
    props: {
        visible: {
            type: Boolean,
            default: false,
        },

        rewardScheduleHour: {
            type: Number,
            default: 0,
        },
        idUser: {
            type: String,
            default: "",
        },
    },
    components: {
        Loading,
        TemplateUpLevel,
    },
    data() {
        return {
            loading: true,
            listData: null,
            stadiumItems: {},
            trainingItems: {},
            isShowStadium: false,
            isShowTraining: false,
            dataNext: {},
            isMax: false,
            typeBooster: "SPEED",
            animatedBalance: 0,
            rewardAmount: 0,
        };
    },
    watch: {
        async visible(newVal) {
            if (newVal) {
                await this.getInfoUser();
                await this.fetchListData();
                await this.fetchBoosterTransaction();
                await this.fetchBoosterAmount();
            }
        },
    },
    mounted() {
        EventBus.on("close-stadium", this.closeStadium);
    },
    // created() {
    //     EventBus.on("close-stadium", this.closeStadium);
    // },

    methods: {
        async getInfoUser() {
            try {
                const data = await userService.getInfo(this.idUser);
                const resData = data?.data?.[0];
                this.animatedBalance = Number(
                    resData.attributes?.qpoint?.data?.attributes?.balance
                );
                this.rewardAmount = Number(
                    resData.attributes?.qpoint?.data?.attributes?.rewardAmount
                );
            } catch (error) {
                console.log(error);
            }
        },
        async fetchListData() {
            try {
                this.loading = true;
                const res = await userService.getListBooster();

                if (res?.data) {
                    const stadiumItems = res?.data.filter(
                        (item) => item.attributes.type == "SPEED"
                    );
                    this.stadiumItems = stadiumItems;

                    const trainingItems = res?.data.filter(
                        (item) => item.attributes.type == "AMOUNT"
                    );
                    this.trainingItems = trainingItems;

                    this.listData = res?.data;
                }
            } catch (error) {
                this.listData = [];
            } finally {
                this.loading = false;
            }
        },
        async fetchBoosterTransaction() {
            try {
                this.loading = true;
                const res = await userService.getBoosterTransaction(
                    this.idUser
                );

                if (res?.data?.length === 0) {
                    this.stadiumItems = toRaw(this.stadiumItems)?.find(
                        (el) => el?.attributes?.applyLevel === 1
                    );
                } else {
                    const dataStadiumCurrent = res?.data?.find(
                        (el) => el?.attributes?.boosterType === "SPEED"
                    );

                    if (dataStadiumCurrent) {
                        this.stadiumItems =
                            dataStadiumCurrent?.attributes?.booster?.data;
                    } else {
                        this.stadiumItems = toRaw(this.stadiumItems)?.find(
                            (el) => el?.attributes?.applyLevel === 1
                        );
                    }
                }
            } catch (error) {
                // this.listData = [];
            } finally {
                this.loading = false;
            }
        },
        async fetchBoosterAmount() {
            try {
                this.loading = true;
                const res = await userService.getBoosterAmount(this.idUser);

                if (res?.data?.length === 0) {
                    this.trainingItems = toRaw(this.trainingItems)?.find(
                        (el) => el?.attributes?.applyLevel === 1
                    );
                } else {
                    const dataTrainingCurrent = res?.data?.find(
                        (el) => el?.attributes?.boosterType === "AMOUNT"
                    );
                    if (dataTrainingCurrent) {
                        this.trainingItems =
                            dataTrainingCurrent?.attributes?.booster?.data;
                    } else {
                        this.trainingItems = toRaw(this.trainingItems)?.find(
                            (el) => el?.attributes?.applyLevel === 1
                        );
                    }
                }
            } catch (error) {
                // this.listData = [];
            } finally {
                this.loading = false;
            }
        },
        handleStadium(stadiumItems) {
            this.isShowStadium = true;
            this.typeBooster = "SPEED";
            //check stadium
            const speedItems = toRaw(this.listData).filter(
                (item) => item.attributes.type === "SPEED"
            );
            const lvCurrentStadium =
                toRaw(stadiumItems)?.attributes?.applyLevel;
            const maxLevelStadiumItem = speedItems.reduce(
                (maxItem, currentItem) => {
                    return currentItem.attributes.applyLevel >
                        maxItem.attributes.applyLevel
                        ? currentItem
                        : maxItem;
                },
                speedItems[0]
            );

            const checkMaxStadium =
                maxLevelStadiumItem?.attributes?.applyLevel ===
                lvCurrentStadium;
            if (checkMaxStadium) {
                this.isMax = true;
            } else {
                this.dataNext = speedItems.find(
                    (el) => el?.attributes?.applyLevel === lvCurrentStadium + 1
                );
                this.isMax = false;
            }
        },
        handleTraining() {
            this.isShowTraining = true;
            this.typeBooster = "AMOUNT";
            //check training
            const amountItems = toRaw(this.listData).filter(
                (item) => item.attributes.type === "AMOUNT"
            );
            const lvCurrent = toRaw(this.trainingItems)?.attributes?.applyLevel;
            const maxLevel = amountItems.reduce((maxItem, currentItem) => {
                return currentItem.attributes.applyLevel >
                    maxItem.attributes.applyLevel
                    ? currentItem
                    : maxItem;
            }, amountItems[0]);

            const checkMax = maxLevel?.attributes?.applyLevel === lvCurrent;
            if (checkMax) {
                this.isMax = true;
            } else {
                this.dataNext = amountItems.find(
                    (el) => el?.attributes?.applyLevel === lvCurrent + 1
                );
                this.isMax = false;
            }
        },
        async closeStadium() {
            this.isShowStadium = false;
            this.isShowTraining = false;
            await this.getInfoUser();
            await this.fetchListData();
            await this.fetchBoosterTransaction();
            await this.fetchBoosterAmount();
        },
    },
    computed: {
        showEmptyForm() {
            return this.listData?.length === 0;
        },
    },
    beforeUnmount() {
        EventBus.off("close-stadium", this.closeStadium); //
    },
};
</script>

<style>
.close-booster {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 13px;
    border-bottom: 1px solid #fff;
    padding-bottom: 5px;
    margin: 0 -20px;
}

.close-booster img {
    margin-left: 20px;
}

.popup-booster {
    height: calc(100% - 56px);
    position: absolute;
    width: 100%;
    top: 0;
    z-index: 999;
    animation: fadeInBooster 0.1s ease forwards;
    color: #fff;
    background-image: url("./../../public/assets/booster/background-booster.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

@keyframes fadeInBooster {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.box-booster {
    padding: 20px;
    height: calc(100% - 40px);
}

.box-content-booster {
    height: 100%;
    animation: fadeInDesc 0.1s ease forwards;
}
@keyframes fadeInDesc {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.your-balance {
    background-color: #00256c;
    border-radius: 15px;
    text-align: center;
    padding: 10px;
}
.title-your-balance {
    font-size: 12px;
    font-family: monospace;
    font-weight: bold;
}
.point-balance {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    font-size: 20px;
    gap: 10px;
}
.point-balance img {
    width: 35px;
    height: 35px;
}
.desc-your-balance {
    font-family: monospace;
    display: flex;
    align-items: center;
    justify-content: center;
}
.desc-your-balance img {
    width: 15px;
}

.stadium {
    margin: 15px 0;
}
.container-stadium {
    background-color: #00256c;
    border-radius: 15px;
    text-align: center;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo-stadium {
    display: flex;
}
.logo-stadium img {
    width: 50px;
    height: 50px;
}
.box-stadium {
    display: flex;
    gap: 10px;
    justify-content: space-between;
    width: 100%;
}
.stadium-left {
    display: flex;
    flex-direction: column;
    text-align: left;
    gap: 5px;
}
.lv-stadium {
    font-size: 12px;
}
.desc-stadium {
    font-size: 10px;
    font-family: monospace;
}
.stadium-right {
    display: flex;
    align-items: center;
}
.stadium-right img {
    width: 25px;
    height: 25px;
    margin-left: 5px;
}
</style>
