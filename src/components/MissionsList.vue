<template>
    <div class="popup-mission" v-if="visible">
        <div class="box-mission">
            <!-- <div @click="$emit('close')" class="close-home">
                <i class="fa-solid fa-rectangle-xmark"></i>
            </div> -->

            <div class="box-content-mission">
                <Loading :loading="loading" />

                <div class="box-desc-mission" v-dragscroll v-if="!loading">
                    <div
                        class="desc-item-mission"
                        v-for="item in missionData"
                        :key="item?.id"
                        :class="{ 'blur-background': item.isStatus }"
                    >
                        <div class="item-left-mission">
                            <div class="item-img-mission">
                                <img src="./../../public/assets/logo.jpg" />
                            </div>

                            <div class="item-left-content">
                                <div class="item-title-mission">
                                    {{ item?.attributes?.title }}
                                </div>
                                <div class="left-desc t-primary-color">
                                    +{{ item?.attributes?.rewardAmount }}
                                    <img src="./../../public/assets/logo.svg" />
                                </div>
                            </div>
                        </div>

                        <div class="item-right" v-if="!item.isStatus">
                            <a
                                v-if="buttonText[item?.id] === 'Go'"
                                v-bind:href="item?.attributes?.link"
                                target="'_blank"
                            >
                                <button
                                    class="mission-btn"
                                    @click="autoClaim(item?.id, item?.id)"
                                >
                                    {{ buttonText[item?.id] }}
                                </button>
                            </a>

                            <a v-if="buttonText[item?.id] !== 'Go'">
                                <button class="verifying-btn">
                                    <i class="fa fa-spinner fa-pulse"></i>
                                    {{ buttonText[item?.id] }}
                                </button>
                            </a>
                        </div>
                        <div class="item-right" v-else>
                            <img src="./../../public/assets/tick.svg" />
                        </div>
                    </div>
                </div>

                <EmptyForm v-if="showEmptyFormMission" />
            </div>
        </div>
    </div>
</template>

<script>
import userService from "../services/userService";
import { sortMissions } from "../utils";
import Loading from "./LoadingForm.vue";
import { toRaw } from "vue";

export default {
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        idUser: {
            type: String,
            required: true,
        },
    },
    components: {
        Loading,
    },
    async created() {
        this.buttonText = [];
        if (this.visible) {
            await this.fetchMissionData();
            await this.fetchListMissionReward();
        }
    },
    data() {
        return {
            loading: true,
            missionData: null,
            buttonText: [],
            missionRewardData: [],
            loadingBtn: [],
        };
    },
    watch: {
        async visible(newVal) {
            if (newVal) {
                await this.fetchMissionData();
                await this.fetchListMissionReward();
            }
        },
    },
    async mounted() {
        if (this.visible) {
            await this.fetchMissionData();
            await this.fetchListMissionReward();
        }
    },
    methods: {
        handleMission() {
            this.$emit("mission");
        },
        async autoClaim(idMission, id) {
            this.buttonText[id] = `Verifying`;
            this.loadingBtn[id] = true;

            userService
                .claimMission(this.idUser, idMission)
                .then(async () => {
                    await this.fetchMissionData();
                    await this.fetchListMissionReward();
                })
                .catch((error) => {
                    console.error("Error claiming mission:", error);
                });
        },

        async fetchMissionData() {
            try {
                this.loading = true;
                const res = await userService.getListMission();

                if (res?.data) {
                    this.missionData = res?.data;

                    res?.data.forEach((item) => {
                        this.buttonText[item?.id] = "Go";
                    });
                }
            } catch (error) {
                this.missionData = [];
            } finally {
                this.loading = false;
            }
        },
        async fetchListMissionReward() {
            try {
                const res = await userService.getListMissionReward(this.idUser);
                this.missionRewardData = res.data;

                if (res) {
                    const rawMissions = toRaw(this.missionData);

                    rawMissions.forEach((mission) => {
                        const matchingReward = res.data.find(
                            (reward) =>
                                Number(reward?.attributes?.refId) == mission?.id
                        );
                        if (matchingReward) {
                            if (
                                matchingReward?.attributes?.status ==
                                "COMPLETED"
                            ) {
                                mission.isStatus = true;
                                mission.status = "COMPLETED";
                            } else if (
                                matchingReward?.attributes?.status ===
                                "PROCESSING"
                            ) {
                                mission.isStatus = false;
                                this.buttonText[mission.id] = `Verifying`;
                                mission.status = "PROCESSING";
                            } else {
                                mission.isStatus = false;
                            }
                        } else {
                            mission.isStatus = false;
                        }
                    });

                    const sortedMissions = sortMissions(rawMissions);
                    this.missionData = [...sortedMissions];
                }
            } catch (error) {
                this.missionRewardData = [];
            }
        },
    },
    computed: {
        showEmptyFormMission() {
            return this.missionData?.length == 0;
        },
    },
};
</script>

<style>
.popup-mission {
    height: calc(100% - 56px);
    position: absolute;
    width: 100%;
    top: 0%;
    z-index: 999;
    animation: fadeInMission 0.1s ease forwards;
    color: #fff;
    background-image: url("./../../public/assets/event/background-event.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

@keyframes fadeInMission {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.box-mission {
    padding: 20px;
    height: calc(100% - 40px);
}

.box-content-mission {
    height: 100%;
}

.box-desc-mission {
    max-height: 100%;
    overflow-y: auto;
    animation: fadeInDesc 0.1s ease forwards;
    scrollbar-width: none;
    -ms-overflow-style: none;

    display: flex;
    flex-direction: column;
    gap: 10px;
}
.box-desc-mission::-webkit-scrollbar {
    display: none;
}

@keyframes fadeInDesc {
    0% {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.desc-item-mission {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    font-size: 12px;
    font-family: monospace;
    border-radius: 10px;
    background-color: #00256c;
}

.blur-background {
    background: #00256c;
    opacity: 0.8;
}

.item-left {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: bolder;
}

.item-left-content {
    display: block;
}

.item-title-mission {
    font-size: 13px;
    margin-bottom: 5px;
}

.left-desc {
    display: flex;
    font-size: 10px;
}

.item-left-content .left-desc img {
    width: 12px;
    border-radius: 3px;
    margin-left: 3px;
}

.item-left-mission {
    display: flex;
    gap: 10px;
    align-items: center;
}

.item-img-mission {
    display: flex;
}

.item-img-mission img {
    width: 35px;
    height: 35px;
    border-radius: 5px;
}

.item-right a {
    text-decoration: none;
    color: #fff;
}
.item-right img {
    width: 20px;
}
.item-right button {
    font-size: 10px;
    padding: 10px 5px;
    border: none;
}
.mission-btn {
    border-radius: 10px;
}

.btn-mission-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/*  */
.verifying-btn {
    border-radius: 10px;
    background-color: #e29a36;
    border: none;
    color: white;
    padding: 10px 15px !important;
}

.fa {
    margin-left: -12px;
    margin-right: 8px;
}

section.loaders .loader {
    display: inline-block;
}

.loader {
    border: 16px solid #f3f3f3;
    border-top: 16px solid blue;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    margin: 25px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.colors2 {
    border-bottom: 16px solid blue;
}

.colors3 {
    border-bottom: 16px solid red;
    border-right: 16px solid green;
}

.colors4 {
    border-bottom: 16px solid red;
    border-right: 16px solid green;
    border-left: 16px solid pink;
}
</style>
