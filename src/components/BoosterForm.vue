<template>
    <div class="popup-booster" v-if="visible">
        <div class="box-booster">
            <Loading :loading="loading" />
            <EmptyForm v-if="showEmptyForm" />

            <div class="box-content-booster" v-if="!loading">
                <div class="your-balance">
                    <div class="title-your-balance f-bangopro">
                        Your Balance
                    </div>
                    <div class="point-balance t-primary-color f-bangopro">
                        {{ animatedBalance }}
                        <img src="./../../public/assets/logo.svg" />
                    </div>
                    <div class="desc-your-balance">
                        Training Speed: {{ rewardAmount }}
                        <img src="./../../public/assets/logo.svg" />/ hour
                    </div>
                </div>

                <div class="wrap-lv">
                    <div
                        class="container-stadium"
                        :key="stadiumItems?.id"
                        @click="handleStadium()"
                    >
                        <div class="logo-stadium">
                            <img
                                :src="`${apiBaseUrl}${stadiumItems?.attributes?.image?.data?.attributes?.url}`"
                            />
                        </div>

                        <div class="box-stadium">
                            <div class="stadium-left">
                                <div class="content-stadium f-bangopro">
                                    {{ stadiumItems?.attributes?.name }}
                                </div>
                                <div class="lv-stadium t-primary-color">
                                    Level
                                    {{ stadiumItems?.attributes?.applyLevel }}
                                </div>
                                <div class="desc-stadium">
                                    {{ stadiumItems?.attributes?.description }}
                                </div>
                            </div>

                            <div
                                class="stadium-right f-bangopro t-primary-color"
                                v-if="dataNextStadium"
                            >
                                {{ dataNextStadium?.attributes?.price }}
                                <img src="./../../public/assets/logo.svg" />
                            </div>
                        </div>
                    </div>

                    <div
                        class="container-stadium"
                        :key="trainingItems.id"
                        @click="handleTraining"
                    >
                        <div class="logo-stadium">
                            <img
                                :src="`${apiBaseUrl}${trainingItems?.attributes?.image?.data?.attributes?.url}`"
                            />
                        </div>

                        <div class="box-stadium">
                            <div class="stadium-left">
                                <div class="content-stadium f-bangopro">
                                    {{ trainingItems?.attributes?.name }}
                                </div>
                                <div class="lv-stadium t-primary-color">
                                    Level
                                    {{ trainingItems?.attributes?.applyLevel }}
                                </div>
                                <div class="desc-stadium">
                                    {{ trainingItems?.attributes?.description }}
                                </div>
                            </div>

                            <div
                                class="stadium-right f-bangopro t-primary-color"
                                v-if="dataNextTraining"
                            >
                                {{ dataNextTraining?.attributes?.price }}
                                <img src="./../../public/assets/logo.svg" />
                            </div>
                        </div>
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
            :descUpload="'Better Stadium holds more QFAN and you can claim it less often'"
            :typeBooster="typeBooster"
            @closeDetailNoCall="closeDetailNoCall"
        />

        <TemplateUpLevel
            :showPopup="isShowTraining"
            @close="closeStadium"
            :items="trainingItems"
            :dataNext="dataNext"
            :idUser="idUser"
            :isMax="isMax"
            :titleUpload="'Skill'"
            :descUpload="'Boosts training speed'"
            :typeBooster="typeBooster"
            @closeDetailNoCall="closeDetailNoCall"
        />

        <NotificationToast
            v-if="showNotification"
            :message="notificationMessage"
            :type="notificationType"
        />
    </div>
</template>

<script>
import EmptyForm from "./EmptyForm.vue";
import userService from "../services/userService";
import Loading from "./LoadingForm.vue";
import TemplateUpLevel from "./TemplateUpLevel.vue";
import NotificationToast from "./NotificationToast.vue";

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
        EmptyForm,
        NotificationToast,
    },
    data() {
        return {
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
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
            dataNextTraining: {},
            dataNextStadium: {},

            stadiumList: [],
            lvStadiumCurrent: 1,

            amountList: [],
            lvTrainCurrent: 1,

            showNotification: false,
            notificationMessage: "",
            notificationType: "",
        };
    },
    watch: {
        async visible(newVal) {
            if (newVal) {
                this.showNotification = false;
                this.isShowStadium = false;
                this.isShowTraining = false;
                await this.getInfoUser();
                await this.fetchListData();
                await this.fetchBoosterTransaction();
                await this.fetchBoosterAmount();
            }
        },
    },

    methods: {
        maxLV(data) {
            const maxLevel = data.reduce((maxItem, currentItem) => {
                return currentItem.attributes.applyLevel >
                    maxItem.attributes.applyLevel
                    ? currentItem
                    : maxItem;
            }, data[0]);
            return maxLevel;
        },
        findLvCurrent(data) {
            return data?.attributes?.booster?.data?.attributes?.applyLevel;
        },
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
                    this.stadiumList = stadiumItems;

                    const trainingItems = res?.data.filter(
                        (item) => item.attributes.type == "AMOUNT"
                    );
                    this.trainingItems = trainingItems;
                    this.amountList = trainingItems;

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
                    this.stadiumItems = this.stadiumList?.find(
                        (el) => el?.attributes?.applyLevel === 1
                    );
                    this.dataNextStadium = this.stadiumList?.find(
                        (el) => el?.attributes?.applyLevel === 2
                    );
                    this.lvStadiumCurrent = 1;
                } else {
                    const stadiumCurrent = res?.data?.find(
                        (el) => el?.attributes?.boosterType === "SPEED"
                    );

                    const lvCurrent = this.findLvCurrent(stadiumCurrent);
                    this.lvStadiumCurrent = lvCurrent;

                    this.stadiumItems =
                        stadiumCurrent?.attributes?.booster?.data;

                    this.dataNextStadium = this.stadiumList.find(
                        (el) => el?.attributes?.applyLevel === lvCurrent + 1
                    );
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
                    this.dataNextTraining = this.amountList?.find(
                        (el) => el?.attributes?.applyLevel === 2
                    );
                    this.trainingItems = this.amountList?.find(
                        (el) => el?.attributes?.applyLevel === 1
                    );
                    this.lvTrainCurrent = 1;
                } else {
                    const trainingCurrent = res?.data?.find(
                        (el) => el?.attributes?.boosterType === "AMOUNT"
                    );

                    const lvCurrent = this.findLvCurrent(trainingCurrent);
                    this.lvTrainCurrent = lvCurrent;

                    this.trainingItems =
                        trainingCurrent?.attributes?.booster?.data;

                    this.dataNextTraining = this.amountList.find(
                        (el) => el?.attributes?.applyLevel === lvCurrent + 1
                    );
                }
            } catch (error) {
                // this.listData = [];
            } finally {
                this.loading = false;
            }
        },
        handleStadium() {
            this.isShowStadium = true;
            this.typeBooster = "SPEED";

            const maxLevel = this.maxLV(this.stadiumList);

            const checkMaxStadium =
                maxLevel?.attributes?.applyLevel === this.lvStadiumCurrent;

            if (checkMaxStadium) {
                this.isMax = true;
            } else {
                this.dataNext = this.dataNextStadium;
                this.isMax = false;
            }
        },
        handleTraining() {
            this.isShowTraining = true;
            this.typeBooster = "AMOUNT";

            const maxLevel = this.maxLV(this.amountList);

            const checkMax =
                maxLevel?.attributes?.applyLevel === this.lvTrainCurrent;

            if (checkMax) {
                this.isMax = true;
            } else {
                this.dataNext = this.dataNextTraining;
                this.isMax = false;
            }
        },
        closeDetailNoCall() {
            this.isShowStadium = false;
            this.isShowTraining = false;
        },
        notification() {
            this.showNotification = true;
            const nameUp =
                this.typeBooster === "SPEED" ? `Stadium` : `Training Room`;
            this.notificationMessage = `Upgrade is yours! ${nameUp} ${this.dataNext?.attributes?.applyLevel}`;
            this.notificationType = "success";
        },
        async closeStadium() {
            this.isShowStadium = false;
            this.isShowTraining = false;
            this.notification();
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
};
</script>

<style scoped>
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
    height: 100%;
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
    transition: background-image 1s ease-in-out;
}

@keyframes fadeInBooster {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.box-booster {
    padding: 20px;
    height: calc(100% - 105px);
}

.box-content-booster {
    height: 100%;
    animation: fadeInDesc 0.5s ease forwards;
}
@keyframes fadeInDesc {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.your-balance {
    background-color: #00256c;
    border-radius: 15px;
    text-align: center;
    padding: 10px;
    margin-bottom: 20px;
}
.title-your-balance {
    font-size: 16px;
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
    width: 25px;
    /* height: 30px; */
}
.desc-your-balance {
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
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
    width: 60px;
    /* height: 50px; */
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
    font-weight: 800;
}
.desc-stadium {
    font-size: 10px;
    font-weight: 800;
}
.stadium-right {
    display: flex;
    align-items: center;
    font-size: 14px;
}
.stadium-right img {
    width: 20px;
    height: 20px;
    margin-left: 5px;
}

.wrap-lv {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
