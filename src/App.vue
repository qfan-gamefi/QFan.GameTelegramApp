<script setup lang="ts">
import MainGame from "./rising-star/MainGame.vue";
import Phaser from "phaser";
import { ref, toRaw, onMounted } from "vue";

interface PhaserScene {
    changeScene: () => void;
}

const phaserRef: any = ref<{ scene?: PhaserScene }>();

onMounted(() => {
    window.Telegram.WebApp.expand();
});
</script>

<script lang="ts">
import InviteFrens from "./components/InviteFrens.vue";
import MissionList from "./components/MissionsList.vue";
import EventList from "./components/EventList.vue";
import BoosterForm from "./components/BoosterForm.vue";
import userService from "./services/userService";
import EventBus from "./utils/eventBus";

const REF_MESS_PREFIX: string = "start r_";
export default {
    components: {
        InviteFrens,
        MissionList,
        EventList,
        BoosterForm,
        // TemplatePopup,
    },
    data() {
        const telegram_bot_link =
            "Invite Link: https://t.me/QFanClubBot?start=r_";

        let first_name = "";
        let last_name = "";

        if (window?.Telegram?.WebApp?.initDataUnsafe) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            if (user) {
                first_name = user.first_name || "";
                last_name = user.last_name || "";
            }
        }

        return {
            isTelegramLogin: !!first_name || !!last_name,
            first_name: first_name,
            last_name: last_name,
            idUser: window.Telegram.WebApp.initDataUnsafe.user?.id.toString(),
            telegram_bot_link:
                telegram_bot_link +
                    window.Telegram.WebApp.initDataUnsafe.user?.id || "",
            // idUser: "2123800227",
            // telegram_bot_link: telegram_bot_link + 2123800227 || "",

            showCoomingSoon: false,
            isCopiedToClipboard: false,
            isSuccess: false,
            apiDataWidth: 0,
            dataLogin: null,
            dataQPoint: {
                balance: 0,
                lastTakeRewardTime: "",
                nextTakeRewardTime: "",
                rewardAmount: "",
                createdAt: "",
                updatedAt: "",
                publishedAt: "",
                rewardScheduleHour: 0,
            },
            increasePerSecond: 0,
            animatedBalance: 0,
            countdown: "",
            isCountingDown: false,
            isPopupCode: false,
            code: "",
            errorMessage: "",
            showInvite: false,
            showBooster: false,
            showMission: false,
            showEvent: false,
            isClaim: false,
            activeButton: "",
        };
    },
    computed: {
        beforeStyle() {
            return {
                "--pseudo-width": `${this.apiDataWidth}%`,
            };
        },
    },
    methods: {
        copyToClipboard() {
            const input = document.createElement("input");
            input.style.position = "fixed";
            input.style.opacity = "0";
            input.value = this.telegram_bot_link;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            this.isCopiedToClipboard = true;
            setTimeout(() => {
                this.isCopiedToClipboard = false;
            }, 2000);
        },
        showPopupCoomingSoon() {
            this.showCoomingSoon = true;
        },
        hidePopupCoomingSoon() {
            this.showCoomingSoon = false;
        },
        hidePopupCode() {
            this.isPopupCode = false;
        },

        async register() {
            if (!window.Telegram.WebApp.initDataUnsafe.user) {
                return;
            }

            try {
                const dataForm = {
                    id: this.idUser,
                    is_bot: false,
                    first_name:
                        window.Telegram.WebApp.initDataUnsafe.user?.first_name,
                    last_name:
                        window.Telegram.WebApp.initDataUnsafe.user?.last_name,
                    language_code: "vi",
                };
                const res = await userService.getCallBack(
                    dataForm,
                    this?.code!
                );

                if (res) {
                    this.isSuccess = true;
                    setTimeout(() => {
                        this.isSuccess = false;
                    }, 2000);
                    this.code = "";

                    this.getInfoUser();
                } else {
                    alert("Error");
                }
            } catch (error) {
                console.error("Error fetching API data:", error);
            }
        },

        async getInfoUser() {
            try {
                var data = await userService.getInfo(this.idUser!);

                if (data?.data?.length == 0) {
                    var refcode: string =
                        window?.Telegram?.WebApp?.initDataUnsafe?.start_param?.replace(
                            REF_MESS_PREFIX,
                            ""
                        ) ?? "";
                    this.isClaim = true;

                    if (await this.isValidRefCode(refcode)) {
                        this.code = refcode;
                        this.register();
                    } else {
                        this.isPopupCode = true;
                    }
                } else {
                    const resData = data?.data?.[0];
                    this.dataLogin = resData;
                    this.dataQPoint =
                        resData.attributes?.qpoint?.data?.attributes;
                    this.animatedBalance = Number(
                        resData.attributes?.qpoint?.data?.attributes?.balance
                    );
                    // if (!this.isClaim) {
                    //     await this.countdownFunc();
                    // }
                }
            } catch (error) {
                console.error("Error fetching API data:", error);
            }
        },

        async isValidRefCode(referCode: string) {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                data: {
                    refererCode: referCode,
                },
            });

            const requestOptions: any = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };

            var response = await fetch(
                "https://qfan-api.qcloud.asia/api/player/checkRefererCode",
                requestOptions
            );
            return response.status == 200;
        },
        async submitCode() {
            this.isClaim = true;
            if (!this.code) {
                this.errorMessage = "Code is required!";
                return;
            }

            try {
                const data = await userService.checkCode(this.code!);

                if (data) {
                    this.errorMessage = "";
                    this.isPopupCode = false;

                    this.register();
                }
            } catch (error: any) {
                // this.register();
                this.errorMessage = error?.response?.data?.error?.message;
            }
        },
        clearError() {
            this.errorMessage = "";
        },
        formatTime(ms: any) {
            if (ms <= 0) {
                return "Time expired";
            }

            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / (1000 * 60)) % 60);
            const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

            return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(
                seconds
            )}`;
        },

        async handleReward() {
            try {
                const res = await userService.takeReward(this.idUser!);
                if (res) {
                    await this.getInfoUser();
                    await this.updateSence();
                }
            } catch (error) {
                console.log(error);
            }
        },
        async updateSence() {
            const phaserRef: any = this.$refs.phaserRef as
                | {
                      scene?: {
                          changeScene: () => void;
                      };
                  }
                | undefined;
            const scene = toRaw(phaserRef?.scene);
            const givenDateTimeString = this.dataQPoint.nextTakeRewardTime;

            const givenDateTime = new Date(givenDateTimeString);
            const currentDateTime = new Date(new Date().toUTCString());
            const differenceInMilliseconds =
                currentDateTime.getTime() - givenDateTime.getTime();

            const rewardTime = new Date(
                this.dataQPoint.nextTakeRewardTime
            ).getTime();
            const currentTime = new Date(new Date().toUTCString()).getTime();
            const timeDiff = rewardTime - currentTime;
            if (timeDiff > 0) {
                this.isClaim = false;
                await this.countdownFunc();
            } else {
                this.isClaim = true;
            }

            if (
                scene?.scene?.key == "IdleScene" &&
                differenceInMilliseconds < 0
            ) {
                scene.changeScene();
            } else if (
                scene?.scene?.key == "MainScene" &&
                differenceInMilliseconds > 0
            ) {
                scene.changeScene();
            }
        },

        pad(value: any) {
            return value < 10 ? "0" + value : value;
        },
        countdownFunc() {
            if (!this.isClaim) {
                const nextTime = this.dataQPoint?.rewardScheduleHour;
                const totalTime = nextTime * 60 * 60 * 1000;

                const rewardTime = new Date(
                    this.dataQPoint.nextTakeRewardTime
                ).getTime();
                const intervalId = setInterval(() => {
                    const currentTime = new Date(
                        new Date().toUTCString()
                    ).getTime();
                    const timeDiff = rewardTime - currentTime;

                    const remainingPercentage = (timeDiff / totalTime) * 100;

                    this.apiDataWidth = 100 - remainingPercentage;

                    this.countdown = this.formatTime(timeDiff);

                    this.isCountingDown = timeDiff > 0;

                    if (timeDiff <= 0) {
                        this.isClaim = true;
                        clearInterval(intervalId);
                    }
                }, 1000);
            }
        },

        handleCopy() {
            this.copyToClipboard();
        },

        handleButtonTab(tab) {
            if (this.activeButton === "booster") {
                EventBus.emit("close-stadium");
            }
            if (this.activeButton === "event") {
                EventBus.emit("close-detail-event");
            }

            Telegram.WebApp.BackButton.show();

            Telegram.WebApp.BackButton.onClick(() => {
                this.showMission = false;
                this.showEvent = false;
                this.showBooster = false;
                this.showInvite = false;
                if (this.activeButton === "booster") {
                    EventBus.emit("close-stadium");
                }
                if (this.activeButton === "event") {
                    EventBus.emit("close-detail-event");
                }

                this.getInfoUser();
                this.activeButton = "";
                Telegram.WebApp.BackButton.hide();
            });

            const tabMappings = {
                mission: {
                    showEvent: false,
                    showBooster: false,
                    showInvite: false,
                    activeButton: "mission",
                    showMission: true,
                },
                event: {
                    showMission: false,
                    showBooster: false,
                    showInvite: false,
                    activeButton: "event",
                    showEvent: true,
                },
                booster: {
                    showMission: false,
                    showEvent: false,
                    showInvite: false,
                    activeButton: "booster",
                    showBooster: true,
                },
                invite: {
                    showMission: false,
                    showEvent: false,
                    showBooster: false,
                    activeButton: "invite",
                    showInvite: true,
                },
            };

            Object.assign(this, tabMappings[tab]);
        },
    },
    async mounted() {
        Telegram.WebApp.ready();
        Telegram.WebApp.setHeaderColor("#ffffff");
        await this.getInfoUser();
    },
    async updated() {
        this.updateSence();
    },
};
</script>

<style scoped>
@import "./styles/global.scss";
@import "./styles/app.css";
</style>

<template>
    <div class="container" onload="updateSence">
        <button class="absolute-training-btn button-decoration">
            START TRAINING
        </button>
        <!-- <div>
            <button
                id="login_button"
                class="btn-login"
                v-show="!isTelegramLogin"
            >
                LOGIN
            </button>
        </div> -->

        <div class="container-game">
            <div class="container-info" v-show="isTelegramLogin">
                <div class="wrap-username">
                    {{ first_name }} {{ last_name }}
                </div>
            </div>

            <div class="wrap-score">
                <div class="content">
                    <img src="./../public/assets/logo.svg" />
                    <div class="balance">
                        <!-- QFP Balance: {{ dataQPoint?.balance }} -->
                        Balance: {{ animatedBalance }}
                    </div>
                </div>
            </div>

            <div class="link-checkin">
                <a
                    v-bind:href="`https://qfan-dapp.qcloud.asia/?playerId=${idUser}`"
                    target="'_blank"
                >
                    <button>
                        <i class="fa-solid fa-calendar-days"></i> Checkin
                    </button>
                </a>
            </div>

            <div class="wrap-commit_reward" :style="beforeStyle">
                <div class="box-info">
                    <div v-if="isClaim" class="box-left-train">
                        Click "Claim" to take +{{
                            Number(dataQPoint?.rewardAmount) *
                            dataQPoint?.rewardScheduleHour
                        }}
                        <img src="./../public/assets/logo.svg" />
                    </div>

                    <div v-else class="box-left">
                        <div class="content">
                            Remain {{ countdown }} to claim
                        </div>
                    </div>

                    <div class="box-right">
                        <button
                            class="btn-commit_reward"
                            @click="handleReward"
                            :disabled="isCountingDown"
                        >
                            {{ isClaim ? "Claim" : "Training..." }}
                        </button>
                    </div>
                </div>
            </div>

            <MainGame ref="phaserRef" />
        </div>

        <div class="box-button">
            <div
                class="btn-item"
                @click="handleButtonTab('mission')"
                :class="{ active: activeButton === 'mission' }"
            >
                <div class="item-img">
                    <img src="./../public/assets/button-icons/mission.svg" />
                </div>
                <div class="item-title">Mission</div>
            </div>
            <div
                class="btn-item"
                @click="handleButtonTab('event')"
                :class="{ active: activeButton === 'event' }"
            >
                <div class="item-img">
                    <img src="./../public/assets/button-icons/event.svg" />
                </div>
                <div class="item-title">Event</div>
            </div>
            <div
                class="btn-item"
                @click="handleButtonTab('booster')"
                :class="{ active: activeButton === 'booster' }"
            >
                <div class="item-img">
                    <img src="./../public/assets/button-icons/booster.svg" />
                </div>
                <div
                    class="item-title"
                    :class="{ active: activeButton === 'booster' }"
                >
                    Booster
                </div>
            </div>
            <div
                class="btn-item"
                @click="handleButtonTab('invite')"
                :class="{ active: activeButton === 'invite' }"
            >
                <div class="item-img">
                    <img
                        src="./../public/assets/button-icons/invite-friend.svg"
                    />
                </div>
                <div class="item-title">Invite Friend</div>
            </div>
            <div class="btn-item" @click="showPopupCoomingSoon">
                <div class="item-img">
                    <img src="./../public/assets/button-icons/shop.svg" />
                </div>
                <div class="item-title">Shop</div>
            </div>
        </div>

        <div v-if="isPopupCode">
            <div class="popup-overlay"></div>
            <div class="popup-referer-code">
                <div class="referer-code">Referer code</div>
                <form @submit.prevent="submitCode">
                    <input
                        class="code-input"
                        :class="{ 'input-error': errorMessage }"
                        type="text"
                        v-model="code"
                        id="code"
                        @input="clearError"
                        placeholder="Enter code"
                    />
                    <div v-if="errorMessage" class="text-err-code">
                        {{ errorMessage }}
                    </div>
                    <button class="btn-submit-code" type="submit">
                        <span>Submit</span>
                    </button>
                </form>
            </div>
        </div>

        <MissionList :visible="showMission" :idUser="idUser" />
        <EventList
            :visible="showEvent"
            :idUser="idUser"
            @openCoomSoon="showPopupCoomingSoon"
        />
        <!-- @openCoomSoon="showPopupCoomingSoon" -->

        <InviteFrens
            :visible="showInvite"
            @invite="handleCopy"
            :idUser="idUser"
            :rewardAmount="dataQPoint.rewardAmount"
        />
        <BoosterForm
            :visible="showBooster"
            :rewardScheduleHour="dataQPoint.rewardScheduleHour"
            :idUser="idUser"
        />

        <div
            :class="[
                'popup-cooming-soon',
                { 'closing-popup': !showCoomingSoon },
            ]"
            v-if="showCoomingSoon"
        >
            <p>Coming soon</p>
            <button @click="hidePopupCoomingSoon" class="btn-close-coming-soon">
                Close
            </button>
        </div>

        <div class="copy-success-message" v-if="isCopiedToClipboard">
            <span>Copied to clipboard!</span>
        </div>

        <div class="enter-code-success" v-if="isSuccess">
            <span>Success!</span>
        </div>
    </div>
</template>
