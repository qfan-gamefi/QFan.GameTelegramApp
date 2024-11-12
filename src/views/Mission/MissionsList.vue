<template>
    <transition name="popup">
        <div class="popup-mission" v-if="visible">
            <LoadingForm :loading="loading" />

            <div class="box-mission" v-if="!loading">
                <div class="flex justify-between gap-3 p-[20px] bg-[#00256c]">
                    <div
                        v-for="(btn, index) in btnMission"
                        :key="index"
                        class="btn-mission"
                        :class="{
                            active: activeButton === btn?.name,
                            isPending: checkPending(btn?.name),
                        }"
                        @click="setActiveButton(btn?.name)"
                    >
                        {{ btn?.label }}
                    </div>
                </div>

                <div class="h-full mt-[15px]">
                    <div class="box-desc-mission" v-dragscroll v-if="!loading">
                        <div
                            class="fade-in flex justify-between items-center gap-2 p-[10px] text-xs rounded-lg bg-[#00256c]"
                            v-for="item in missionTab"
                            :key="item?.id"
                            :class="{ 'blur-background': item.isStatus }"
                        >
                            <div class="flex items-center gap-2">
                                <div class="">
                                    <img
                                        class="min-w-[35px] max-w-[35px] rounded object-cover"
                                        :src="`${apiBaseUrl}${item?.attributes?.image?.data?.attributes?.url}`"
                                        loading="lazy"
                                    />
                                </div>

                                <div class="text-[10px]">
                                    <div class="mb-1 f-bangopro">
                                        {{ item?.attributes?.title }}
                                    </div>

                                    <div
                                        class="flex t-primary-color f-nunito"
                                        v-if="!item?.attributes?.QA"
                                    >
                                        +{{ item?.attributes?.rewardAmount }}
                                        <img
                                            class="w-3 rounded ml-1"
                                            src="@public/assets/logo.svg"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div v-else class="grid grid-cols-2 gap-2">
                                        <div
                                            v-for="el in item?.attributes?.QA
                                                ?.answer_selection"
                                            :key="el?.id"
                                            class="btn-qa"
                                            :class="{
                                                active: renderActiveAnswer(
                                                    item,
                                                    el
                                                ),
                                            }"
                                        >
                                            <div @click="handleQA(el, item)">
                                                {{ el?.title }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div
                                class="item-right"
                                v-if="!item?.attributes?.QA"
                            >
                                <div v-if="!item.isStatus">
                                    <a
                                        v-if="buttonText[item?.id] === 'Go'"
                                        v-bind:href="item?.attributes?.link"
                                        target="'_blank"
                                    >
                                        <button
                                            class="mission-btn"
                                            @click="
                                                autoClaim(item?.id, item?.id)
                                            "
                                        >
                                            {{ buttonText[item?.id] }}
                                        </button>
                                    </a>

                                    <a v-if="buttonText[item?.id] !== 'Go'">
                                        <button class="verifying-btn">
                                            <i
                                                class="fa fa-spinner fa-pulse"
                                            ></i>
                                            {{ buttonText[item?.id] }}
                                        </button>
                                    </a>
                                </div>
                                <img
                                    v-else
                                    src="@public/assets/tick.svg"
                                    loading="lazy"
                                />
                            </div>

                            <div v-else>
                                <button
                                    class="submit-btn"
                                    @click="submitQA()"
                                    v-if="!item.isStatus"
                                    :class="{
                                        active: activeSubmit[item?.id],
                                    }"
                                >
                                    <div v-if="buttonText[item?.id] === 'Go'">
                                        Submit
                                    </div>
                                    <div v-else>
                                        <i class="fa fa-spinner fa-pulse"></i>
                                    </div>
                                </button>
                                <img
                                    v-else
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
import { sortMissions, trackEventBtn } from "@/utils";

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
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
            loading: true,
            missionData: null,
            missionTab: null,
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

            activeAnswer: "",
            detailAnswer: null,
            idMission: null,
            idAnswer: null,
            btnMission: [
                { name: "qfan", label: "QFan" },
                { name: "quai_discovery", label: "Quai Discovery" },
                { name: "partnership", label: "Partnership" },
            ],
            activeButton: "qfan",
            activeSubmit: {},
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
        checkPending(nameBtn) {
            const findTab = this.missionData?.filter(
                (item) =>
                    item?.attributes?.category?.data?.attributes?.code?.toLowerCase() ===
                    nameBtn
            );
            const hasCompletedTask = findTab?.some(
                (task) => task?.isStatus === false
            );
            return hasCompletedTask;
        },
        renderActiveAnswer(detailItem, itemAnswer) {
            if (detailItem?.isStatus) {
                const isTrue =
                    detailItem?.attributes?.QA?.right_answer_code ===
                    itemAnswer?.code;
                return isTrue;
            } else {
                return this.activeAnswer === itemAnswer?.title;
            }
        },
        async autoClaim(idMission, id) {
            trackEventBtn({
                label: 'Go_Mission',
            });

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
        setActiveButton(buttonName) {
            const newActiveSubmit = Object.keys(this.activeSubmit).reduce(
                (acc, key) => {
                    acc[key] = false;
                    return acc;
                },
                {}
            );
            this.activeSubmit = newActiveSubmit;

            this.activeAnswer = "";
            this.activeButton = buttonName;
            this.filterCategory(buttonName);
        },
        filterCategory(categoryName) {
            this.missionTab = this.missionData?.filter(
                (item) =>
                    item?.attributes?.category?.data?.attributes?.code?.toLowerCase() ===
                    categoryName
            );
        },
        async fetchMissionData() {
            try {
                this.loading = true;
                const res = await userService.getListMission();
                if (res?.data) {
                    res?.data.forEach((item) => {
                        this.buttonText[item?.id] = "Go";
                    });

                    this.missionData = res?.data;
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
                    const newData = sortedMissions?.map((item) => {
                        return {
                            ...item,
                            attributes: {
                                ...item?.attributes,
                                QA:
                                    item?.attributes?.QA.length > 0
                                        ? item?.attributes?.QA?.[0]
                                        : null,
                            },
                        };
                    });
                    this.missionData = newData;
                    this.filterCategory(this.activeButton);
                }
            } catch (error) {
                this.missionRewardData = [];
            } finally {
                this.loading = false;
            }
        },
        async handleQA(detailAnswer, item) {
            const idMission = item?.id;
            const idAnswer = item?.attributes?.QA?.id;
            const newActiveSubmit = Object.keys(this.activeSubmit).reduce(
                (acc, key) => {
                    acc[key] = false;
                    return acc;
                },
                {}
            );
            newActiveSubmit[idMission] = true;
            this.activeSubmit = newActiveSubmit;

            this.activeAnswer = detailAnswer?.title;
            this.detailAnswer = detailAnswer;

            this.idMission = idMission;
            this.idAnswer = idAnswer;
        },
        async submitQA() {
            const { id, code } = this.detailAnswer;
            this.buttonText[this.idMission] = `Verifying`;

            userService
                .postMissionQA(this.idUser, this.idMission, this.idAnswer, code)
                .then(async () => {
                    await this.renderNotification(
                        "success",
                        "Success!",
                        this.idMission
                    );
                })
                .catch((err) => {
                    const mess = err?.message || "Error!";
                    this.renderNotification("error", mess, this.idMission);
                    this.buttonText[this.idMission] = `Go`;
                });
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
    height: 100%;
}

.box-desc-mission {
    max-height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: calc(100% - 160px);
    padding: 0 15px;
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
button {
    font-size: 10px;
    padding: 10px 5px;
    border: none;
    border-radius: 10px;
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

/* .colors2 {
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
} */

.btn-qa {
    text-align: center;
    border-radius: 10px;
    background: #354d7b;
    transition: background 0.3s ease, transform 0.2s ease;
}

.btn-qa.active {
    background: #ffa53a;
}

.btn-mission.active {
    background: #ffa53a;
    color: white;
}

.btn-mission {
    border-radius: 5px;
    cursor: pointer;
    font-weight: 800;
    font-size: 12px;
    background: #5b5b5bab;
    position: relative;
    width: 100%;
    text-align: center;
    padding: 5px;
}
.isPending::after {
    background: #f80000;
    content: "";
    width: 6px;
    height: 6px;
    position: absolute;
    border-radius: 6px;
    right: 3%;
    top: 3%;
}

.submit-btn {
    opacity: 0.5;
    cursor: not-allowed;
}
.submit-btn.active {
    opacity: 1;
    cursor: pointer;
}

.btn-qa {
    text-align: center;
    border-radius: 10px;
    background: #354d7b;
    transition: background 0.3s ease, transform 0.2s ease;
}

.btn-qa.active {
    background: #ffa53a;
}

.submit-btn {
    opacity: 0.5;
    cursor: not-allowed;
}
.submit-btn.active {
    opacity: 1;
    cursor: pointer;
}
</style>
