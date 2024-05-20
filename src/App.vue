<script setup lang="ts">
import Telegram from "vue-tg";
import MainGame from "./rising-star/MainGame.vue";
// import Phaser from "phaser";
import { ref, toRaw, onMounted } from "vue";

interface PhaserScene {
    changeScene: () => void;
}

const phaserRef: any = ref<{ scene?: PhaserScene }>();

onMounted(() => {
    // alert(JSON.stringify(window.Telegram.WebApp.initDataUnsafe.user));
});
</script>

<script lang="ts">
import InviteFrens from "./components/InviteFrens.vue";
import MissionList from "./components/MissionsList.vue";
import userService from "./services/userService";

const REF_MESS_PREFIX: string = "start r_";
export default {
    components: {
        InviteFrens,
        MissionList,
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
                rewardScheduleHour: "",
            },
            countdown: "",
            isCountingDown: false,
            isPopupCode: false,
            code: "",
            errorMessage: "",
            showInvite: false,
            showMission: false,
            isClaim: false,
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
                    alert("Lỗi");
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
                    this.dataLogin = data?.data?.[0];
                    this.dataQPoint =
                        data?.data?.[0]?.attributes?.qpoint?.data?.attributes;
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
                    // await this.countdownFunc();
                    await this.updateSence();
                }
            } catch (error) {
                console.log(error);

                // this.countdownFunc();
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

            // Parse the given date-time string to a Date object
            const givenDateTime = new Date(givenDateTimeString);
            // Get the current date-time in UTC
            const currentDateTime = new Date(new Date().toUTCString());
            // Calculate the difference in milliseconds
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
                // this.isClaim = false;
                scene.changeScene();
                // await this.countdownFunc();
            } else if (
                scene?.scene?.key == "MainScene" &&
                differenceInMilliseconds > 0
            ) {
                // this.isClaim = true;
                scene.changeScene();
            }
        },

        pad(value: any) {
            return value < 10 ? "0" + value : value;
        },
        countdownFunc() {
            const totalTime = 1 * 60 * 60 * 1000;
            const rewardTime = new Date(
                this.dataQPoint.nextTakeRewardTime
            ).getTime();

            if (!this.isClaim) {
                const intervalId = setInterval(() => {
                    const currentTime = new Date(
                        new Date().toUTCString()
                    ).getTime();
                    const timeDiff = rewardTime - currentTime;

                    const remainingPercentage = (timeDiff / totalTime) * 100;

                    // console.log((timeDiff / totalTime) * 100);
                    // console.log(100 - remainingPercentage);
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

        handleReferal() {
            this.showInvite = true;
        },
        closeInvite() {
            this.showInvite = false;
        },
        handleInvite() {
            this.copyToClipboard();
        },
        handleMission() {
            this.showMission = true;
        },
        closeMission() {
            this.showMission = false;
        },
    },
    async mounted() {
        await this.getInfoUser();
        // await this.countdownFunc();
    },
    async updated() {
        this.updateSence();
    },
};
</script>

<style scoped>
@import "./styles/global.css";
@import "./styles/app.css";
</style>

<template>
    <div class="container" onload="updateSence">
        <button class="absolute-training-btn button-decoration">
            START TRAINING
        </button>
        <div>
            <button
                id="login_button"
                class="btn-login"
                v-show="!isTelegramLogin"
            >
                LOGIN
            </button>
        </div>

        <div class="container-game">
            <div class="container-info" v-show="isTelegramLogin">
                <div class="wrap-username">
                    {{ first_name }} {{ last_name }}
                </div>
            </div>

            <div class="wrap-score">
                <div class="content">
                    <img src="./../public/assets/logo.svg" />
                    <div>QFP Balance: {{ dataQPoint?.balance }}</div>
                </div>
            </div>

            <div class="wrap-commit_reward" :style="beforeStyle">
                <div class="box-info">
                    <div v-if="isClaim" class="box-left-train">
                        Click "Train" to take + {{ dataQPoint?.rewardAmount }}
                        <img src="./../public/assets/logo.svg" />
                    </div>

                    <div v-else class="box-left">
                        <div class="title">Remain:</div>
                        <div class="content">{{ countdown }} to train</div>
                    </div>

                    <div class="box-right">
                        <button
                            class="btn-commit_reward"
                            @click="handleReward"
                            :disabled="isCountingDown"
                        >
                            {{ isClaim ? "Claim" : "Train" }}
                        </button>
                    </div>
                </div>
            </div>

            <MainGame ref="phaserRef" />
        </div>

        <div class="button-container">
            <div class="row">
                <button @click="showPopupCoomingSoon">
                    <img
                        src="./../public/assets/button-icons/shopping-bag-3744.svg"
                        class="icon-home"
                    />
                    <span>Shop</span>
                </button>
                <button @click="handleReferal">
                    <img
                        src="./../public/assets/button-icons/copy-link.svg"
                        class="icon-home"
                    />
                    <span>Referal</span>
                </button>
                <InviteFrens
                    :visible="showInvite"
                    @close="closeInvite"
                    @invite="handleInvite"
                    :idUser="idUser"
                />
            </div>

            <div class="row">
                <button @click="showPopupCoomingSoon">
                    <img
                        src="./../public/assets/button-icons/booster.svg"
                        class="icon-home"
                    />
                    <span>Booster</span>
                </button>

                <button @click="handleMission">
                    <img
                        src="./../public/assets/button-icons/mission.svg"
                        class="icon-home"
                    />
                    <span>Mission</span>
                </button>
                <MissionList
                    :visible="showMission"
                    @close="closeMission"
                    @invite="handleMission"
                    :idUser="idUser"
                />

                <button @click="showPopupCoomingSoon">
                    <img
                        src="./../public/assets/button-icons/event.svg"
                        class="icon-home"
                    />
                    <span>Event</span>
                </button>
            </div>
        </div>
        <!-- <span v-text="telegram_bot_link" class="nunito-fonts"></span> -->

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

        <div class="popup-referer-code" v-if="isPopupCode">
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
                <button class="btn-submit-code" type="submit">Submit</button>
            </form>

            <!-- <button @click="hidePopupCode" class="btn-close-coming-soon">
                Close
            </button> -->
        </div>

        <div class="copy-success-message" v-if="isCopiedToClipboard">
            <span>Copied to clipboard!</span>
        </div>

        <div class="enter-code-success" v-if="isSuccess">
            <span>Success!</span>
        </div>
    </div>
</template>
