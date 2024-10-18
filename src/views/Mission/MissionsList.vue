<template>
    <transition name="popup">
        <div class="popup-mission" v-if="visible">
            <LoadingForm :loading="loading" />

            <div class="box-mission" v-if="!loading">
                <div class="h-full">
                    <div class="box-desc-mission" v-dragscroll v-if="!loading">
                        <div
                            class="fade-in flex justify-between items-center p-[15px] text-xs rounded-lg bg-[#00256c]"
                            v-for="item in missionData"
                            :key="item?.id"
                            :class="{ 'blur-background': item.isStatus }"
                        >
                            <div class="flex items-center gap-2">
                                <div>
                                    <img
                                        class="w-[35px] rounded-lg"
                                        src="@public/assets/logo.jpg"
                                        loading="lazy"
                                    />
                                </div>

                                <div>
                                    <div class="text-xs mb-1 f-bangopro">
                                        {{ item?.attributes?.title }}
                                    </div>
                                    <div
                                        class="flex text-[10px] t-primary-color f-nunito"
                                    >
                                        +{{ item?.attributes?.rewardAmount }}
                                        <img
                                            class="w-3 rounded ml-1"
                                            src="@public/assets/logo.svg"
                                            loading="lazy"
                                        />
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
                                <img
                                    src="@public/assets/tick.svg"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>

                    <EmptyForm v-if="showEmptyFormMission" />

                    <NotificationToast
                        v-if="notification.visible"
                        :message="notification.message"
                        :type="notification.type"
                    />
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import { defineComponent, toRaw } from "vue";
import EmptyForm from "@/components/EmptyForm.vue";
import NotificationToast from "@/components/NotificationToast.vue";
import LoadingForm from "@/components/LoadingForm.vue";
import userService from "@/services/userService";
import { sortMissions } from "@/utils";

export default defineComponent({
    name: "MissionsList",
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
        LoadingForm,
        NotificationToast,
        EmptyForm,
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

            showNotification: false,
            notificationMessage: "",
            notificationType: "",

            notification: {
                visible: false,
                type: "",
                message: "",
            },
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
        async renderNotification(type, message, idMiss) {
            this.notification = {
                visible: true,
                type,
                message,
            };

            setTimeout(() => {
                // this.fetchMissionData();
                // this.fetchListMissionReward();
                if (type == "success") {
                    this.missionData.forEach((mission) => {
                        if (mission?.id == idMiss) {
                            mission.isStatus = true;
                            mission.status = "COMPLETED";
                        }
                    });
                }

                this.notification = {
                    visible: false,
                };
            }, 2000);
        },
        async autoClaim(idMission, id) {
            this.buttonText[id] = `Verifying`;
            this.loadingBtn[id] = true;

            userService
                .claimMission(this.idUser, idMission)
                .then(async () => {
                    await this.renderNotification(
                        "success",
                        "Success!",
                        idMission
                    );
                })
                .catch(() => {
                    this.renderNotification("error", "Error!", idMission);
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
                this.loading = true;
                const res = await userService.getListMissionReward(this.idUser);
                this.missionRewardData = res.data;

                if (res) {
                    const rawMissions = toRaw(this.missionData);
                    console.log(rawMissions);

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
            } finally {
                this.loading = false;
            }
        },
    },
    computed: {
        showEmptyFormMission() {
            return this.missionData?.length == 0;
        },
    },
});
</script>

<style scoped>
/* @import "@/styles/global.scss";
@import "@/styles/animation/popup.scss"; */

.popup-mission {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    z-index: 999;
    color: #fff;
    background-image: url("./../../../public/assets/event/background-event.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

.box-mission {
    padding: 20px;
    height: calc(100% - 80px);
}

.box-desc-mission {
    max-height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.blur-background {
    opacity: 0.6;
}

.item-left {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: bolder;
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
