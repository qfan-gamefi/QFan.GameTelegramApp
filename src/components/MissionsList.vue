<template>
    <div class="popup-mission" v-if="visible">
        <div class="box-mission">
            <div @click="$emit('close')" class="close-btn">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                >
                    <path
                        fill="#ffffff"
                        d="M16 5v2h-2V5zm-4 4V7h2v2zm-2 2V9h2v2zm0 2H8v-2h2zm2 2v-2h-2v2zm0 0h2v2h-2zm4 4v-2h-2v2z"
                    />
                </svg>
                Back
            </div>

            <div class="box-content">
                <div class="box-title">Missions</div>

                <Loading :loading="loading" />

                <div class="box-desc" v-if="!loading">
                    <div
                        class="desc-item"
                        v-for="(item, index) in missionData"
                        :key="index"
                    >
                        <div class="item-left">
                            <div class="item-img">
                                <img src="./../../public/assets/logo.jpg" />
                            </div>

                            <div class="item-left-content">
                                <div>{{ item?.attributes?.title }}</div>
                                <div class="left-desc">
                                    +{{ item?.attributes?.rewardAmount }}
                                    <img src="./../../public/assets/logo.jpg" />
                                </div>
                            </div>
                        </div>

                        <div class="item-right" v-if="!item.status">
                            <a
                                v-if="buttonText[index] === 'Go'"
                                v-bind:href="item?.attributes?.link"
                                target="'_blank"
                            >
                                <button
                                    class="mission-btn"
                                    @click="fetchMission(item?.id, index)"
                                >
                                    {{ buttonText[index] }}
                                </button>
                            </a>

                            <a v-if="buttonText[index] !== 'Go'">
                                <button class="verifying-btn">
                                    <i class="fa fa-spinner fa-pulse"></i>
                                    {{ buttonText[index] }}
                                </button>
                            </a>
                        </div>
                        <div class="item-right" v-else>
                            <img src="./../../public/assets/tick.svg" />
                        </div>
                    </div>
                </div>

                <EmptyForm v-if="showEmptyFormMission" />
                <Toast />
            </div>
        </div>
    </div>
</template>

<script>
import userService from "../services/userService";
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
    created() {
        this.buttonText = [];
        if (this.visible) {
            this.fetchMissionData();
            this.fetchListMissionReward();
        }
    },
    data() {
        return {
            loading: true,
            missionData: null,
            iframeSrc: "",
            buttonText: [],
            missionRewardData: [],
            loadingBtn: [],
        };
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                this.fetchMissionData();
                this.fetchListMissionReward();
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
        openInIframe(url) {
            this.iframeSrc = url;
        },
        handleMission() {
            this.$emit("mission");
        },
        async autoClaim(idMission) {
            try {
                const res = await userService.claimMission(
                    this.idUser,
                    idMission
                );
                if (res) {
                    await this.fetchMissionData();
                    await this.fetchListMissionReward();
                }
            } catch (error) {
                console.error("Error fetching API data:", error);
            }
        },
        async fetchMission(idMission, index) {
            let randomSeconds = Math.floor(Math.random() * 31) + 60;
            this.buttonText[index] = `Verifying`;
            this.loadingBtn[index] = true;

            const countdown = setInterval(() => {
                if (randomSeconds > 0) {
                    this.loadingBtn[index] = true;
                    this.buttonText[index] = `Verifying`;
                    randomSeconds--;
                } else {
                    this.loadingBtn[index] = false;
                    clearInterval(countdown);
                    this.autoClaim(idMission);
                }
            }, 1000);
        },

        async fetchMissionData() {
            try {
                this.loading = true;
                const res = await userService.getListMission();

                if (res?.data) {
                    this.missionData = res?.data;

                    this.buttonText = res?.data?.map(() => "Go");
                }
            } catch (error) {
                this.missionData = [];
            } finally {
                setTimeout(() => {
                    this.loading = false;
                }, 300);
            }
        },
        async fetchListMissionReward() {
            try {
                const res = await userService.getListMissionReward(this.idUser);
                this.missionRewardData = res.data;

                if (res) {
                    // const lissMiss = this.missionData;

                    toRaw(this.missionData).forEach((mission) => {
                        const matchingReward = toRaw(
                            this.missionRewardData
                        ).find(
                            (reward) => reward?.attributes?.refId == mission?.id
                        );
                        if (matchingReward) {
                            mission.status = true;
                        } else {
                            mission.status = false;
                        }
                    });
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
    height: 100%;
    position: absolute;
    width: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #0085d2;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 999;
    animation: fadeIn 0.1s ease forwards;
}
@keyframes fadeIn {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }
    100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}

.box-mission {
    padding: 20px;
}

.box-content .box-title {
    margin: 10px 0;
}

.box-title {
    text-shadow: 1px 1px 0 #9f8900, -1px -1px 0 #9f8900, 1px -1px 0 #9f8900,
        -1px 1px 0 #9f8900, 1px 0 0 #9f8900, -1px 0 0 #9f8900, 0 1px 0 #9f8900,
        0 -1px 0 #9f8900;
}

.box-desc {
    background: #67bdef;
    border-radius: 10px;
    max-height: 66vh;
    overflow-y: auto;
    animation: fadeInDesc 0.1s ease forwards;
}

.box-desc::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #2b2b2b;
}

.box-desc::-webkit-scrollbar {
    width: 8px;
    background-color: #2b2b2b;
}

.box-desc::-webkit-scrollbar-thumb {
    background-color: #ff7f50;
    border-radius: 10px;
    border: 2px solid #2b2b2b;

    background-image: -webkit-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.2) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.2) 50%,
        rgba(255, 255, 255, 0.2) 75%,
        transparent 75%,
        transparent
    );
}
.box-desc::-webkit-scrollbar-thumb:hover {
    background-color: #ffa07a;
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

.desc-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    font-size: 12px;
    font-family: monospace;
    border-bottom: 1px solid #ccc;
}
.desc-item:last-child {
    border-bottom: none;
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
.left-desc {
    display: flex;
    font-size: 10px;
}
.item-left-content .left-desc img {
    width: 12px;
    border-radius: 5px;
    margin-left: 3px;
}

.item-left .item-img {
    width: 30px;
    height: 30px;
    /* clip-path: polygon(
        30% 0%,
        70% 0%,
        100% 30%,
        100% 70%,
        70% 100%,
        30% 100%,
        0% 70%,
        0% 30%
    ); */
}
.item-left img {
    border-radius: 5px;
    width: 30px;
}

.item-right a {
    text-decoration: none;
    color: #fff;
}
.item-right button {
    font-size: 10px;
    padding: 10px 5px;
    border: none;
}

.close-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 13px;
    border-bottom: 1px solid #fff;
    padding-bottom: 20px;
    margin: 0 -20px;
}
.close-btn svg {
    margin-left: 20px;
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
