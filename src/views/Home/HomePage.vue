<script setup lang="ts">
// import MainGame from "./rising-star/MainGame.vue";
import MainGame from "./../../rising-star/MainGame.vue";
// import Phaser from "phaser";
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
import InviteFrens from "@/components/InviteFrens.vue";
import MissionList from "@/views/Mission/MissionsList.vue";
import BoosterForm from "@/components/BoosterForm.vue";
import userService from "@/services/userService";
// import EventBus from "@/utils/eventBus";
import EventList from "@/views/Event/EventList.vue";
import CheckinForm from "@/views/Checkin/CheckinForm.vue";
import { secureStorage, storage } from "@/storage/storage";
import { quais, type Wallet } from "quais";
import NotificationToast from "@/components/NotificationToast.vue";
// import { title } from "process";
// import { title } from "process";
import type { ILevel } from "@/interface";
import InfoUser from "@/views/InfoUser/InfoUser.vue";
import LoadingScreen from "@/views/LoadingScreen/LoadingScreen.vue";
import { formattedBalance } from "@/utils";
import { mapState } from "vuex";
import { preloadImages } from "@/utils/preloadImages";
import HDKeyring from "@/crypto_utils/HDKeyring";
import type { PrivateKey } from "@/crypto_utils/type";
import type { QuaiTransactionRequest, QuaiTransactionResponse } from "quais/lib/esm/providers";
import { QFPContractAddress, QFPOwerWalletAddress } from "@/crypto_utils/constants";
import { DEFAULT_QUAI_TESNTET } from "@/services/network/chains";
import { getAddress, parseEther, toBigInt } from "ethers";

const REF_MESS_PREFIX: string = "start r_";
const REF_TOKEN_PREFIX: string = "TOKEN_";
const MINING_INTERVAL = 1000 * 60 * 1 + 5000;
export default {
    components: {
        InviteFrens,
        MissionList,
        EventList,
        BoosterForm,
        CheckinForm,
        NotificationToast,
        InfoUser,
        LoadingScreen,
    },
    data() {
        const telegram_bot_link =
            "Invite Link: https://t.me/QFanClubBot?start=r_";

        const dataUserTele = window.Telegram?.WebApp?.initDataUnsafe;

        let first_name = dataUserTele?.user?.first_name || "";
        let last_name = dataUserTele?.user?.last_name || "";

        if (
            dataUserTele?.start_param &&
            dataUserTele?.start_param?.startsWith("TOKEN_")
        ) {
            secureStorage.set(
                "SECURITY_TOKEN",
                dataUserTele.start_param?.replace("TOKEN_", "")
            );
        }

        return {
            isLoadingCreen: true,
            isTelegramLogin: !!first_name || !!last_name,
            first_name: first_name,
            last_name: last_name,
            idUser: dataUserTele?.user?.id?.toString() ?? "",
            telegram_bot_link: telegram_bot_link + dataUserTele?.user?.id || "",

            showCoomingSoon: false,
            isSuccess: false,
            apiDataWidth: 0,
            dataLogin: null,
            dataQPoint: {
                balance: 0,
                lastTakeRewardTime: "",
                nextTakeRewardTime: "",
                rewardAmount: "",
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
            activeWallet: null as Wallet | null,
            isCheckin: false,
            isExecCheckin: false,
            titleCheckin: "Checkin",
            titleAutoInteract: "Auto Mining",
            isExecAutoInteract: false,
            autoInteractInterval: null as NodeJS.Timeout | null,
            notification: {
                show: false,
                message: "",
                type: "",
            },
            widthWining: 0,

            urlAvt: null,
            dataLevel: {} as ILevel,
            expLevelNext: {} as ILevel,
            percentageLevel: 0,
            isMaxLv: false,
            isAnimated: false
        };
    },
    computed: {
        ...mapState(["hasLoaded"]),
        beforeStyle() {
            return {
                "--pseudo-width": `${this.apiDataWidth}%`,
            };
        },
        styleWining() {
            return {
                "--pseudo-width": `${this.widthWining}%`,
            };
        },
    },
    methods: {
        triggerAnimation() {
            this.isAnimated = true;
            setTimeout(() => {
                this.isAnimated = false;
            }, 1000);
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
        async renderNotification(message, type) {
            (this.notification = {
                show: true,
                message: message,
                type: type,
            }),
                setTimeout(() => {
                    this.notification = {
                        show: false,
                    };
                }, 3000);
        },
        async renderSuccess(mess) {
            this.renderNotification(mess, "success");
        },
        async renderErr(mess) {
            this.renderNotification(mess, "error");
        },
        async renderWarning(mess) {
            this.renderNotification(mess, "warning");
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
            this.$store.commit("setUserId", this.idUser);
            this.$store.commit(
                "setFullName",
                `${this.first_name} ${this.last_name}`
            );
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

                    // secureStorage.set("data_login", resData);

                    this.dataLogin = resData;
                    this.dataQPoint =
                        resData.attributes?.qpoint?.data?.attributes;
                    this.animatedBalance = Number(
                        resData.attributes?.qpoint?.data?.attributes?.balance
                    );
                    this.triggerAnimation();
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

        closeCheckin() {
            this.isCheckin = false;
        },
        handleBackButton() {
            Telegram.WebApp.BackButton.show();

            Telegram.WebApp.BackButton.onClick(() => {
                this.$router.push("/");

                this.showMission = false;
                this.showEvent = false;
                this.showBooster = false;
                this.showInvite = false;

                this.getInfoUser();
                this.activeButton = "";
                Telegram.WebApp.BackButton.hide();
            });
        },
        handleButtonTab(tab) {
            this.isCheckin = false;

            this.handleBackButton();
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
        async handleWallet() {
            this.handleBackButton();
            const keyringService = new HDKeyring();
            const isUnlock = await keyringService.unlock();
            if (isUnlock && keyringService.isSigning) {
                this.$router.push({ name: "WalletDetail" });
            } else {
                this.$router.push({ name: "WalletForm" });
            }
        },
        async onCheckIn() {
            try {
                this.titleCheckin = "Processing";
                this.isExecCheckin = true;
                const keyringService = new HDKeyring();
                const isUnlock = await keyringService.unlock();
                if (isUnlock) {
                    const activeWallet = keyringService.getActiveWallet();
                    const address = await activeWallet?.address;

                    if (!address) {
                        this.$router.push({ name: "WalletCreate" });
                        return;
                    }

                    const request: QuaiTransactionRequest = {
                        from: address,
                        to: QFPOwerWalletAddress,
                    }

                    const tx = await keyringService.sendTokenTransaction(request) as QuaiTransactionResponse;

                    const claimCheckin = await userService.claimCheckin(
                        this.idUser,
                        activeWallet?.address as string,
                        tx.hash as string
                    );

                    console.log("claimCheckin", claimCheckin);

                    await this.getInfoUser();
                    if (claimCheckin.error) {
                        // alert(claimCheckin?.error?.message);
                        this.renderErr(claimCheckin?.message);
                    } else {
                        this.renderSuccess("Checkin success!");
                        // alert(claimCheckin?.message);
                    }
                } else {
                    // alert("Please import wallet to checkin");
                    this.$router.push({ name: "WalletCreate" });
                }
                this.isExecCheckin = false;
            } catch (error) {
                // console.error("Error claimCheckin:", error);
                // alert(error?.message);
                this.renderErr(error?.message);
                this.isExecCheckin = false;
            } finally {
                this.isExecCheckin = false;
                this.titleCheckin = "Checkin";
            }
        },
        async onAutoInteract() {
            const keyringService = new HDKeyring();
            /*
            await keyringService.unlock();

            const activeWallet = keyringService.getWallets()?.at(0) as PrivateKey;

            const address = await activeWallet?.addresses?.at(0);

            if (!address) {
                this.$router.push({ name: "WalletCreate" });
                return;
            }
            */

            // this.titleAutoInteract = "Mining...";
            this.calcWidthMining();
            this.isExecAutoInteract = true;
            await this.autoInteract(keyringService);

            this.autoInteractInterval = setInterval(async () => {
                await this.calcWidthMining();
                await this.autoInteract(keyringService);
            }, MINING_INTERVAL);
        },
        async autoInteract(keyringService: HDKeyring) {
            try {
                //if (keyringService.getWallets().length > 0) {
                this.isExecAutoInteract = true;
                //const activeWallet = keyringService.getActiveWallet();
                //if (!activeWallet) {
                //    this.$router.push({ name: "WalletCreate" });
                //    return;
                //}

                //const address = await activeWallet?.address;

                //const request: QuaiTransactionRequest = {
                //    from: address,
                //    to: QFPOwerWalletAddress,
                //}

                //const tx = await keyringService.sendTokenTransaction(request) as QuaiTransactionResponse;

                //console.log("autoInteract TX", tx);

                const autoInteract = await userService.autoInteract(
                    this.idUser,
                    '0xtestwallet',//activeWallet?.address as string,
                    '0xtesthash'//tx.hash as string
                );
                await this.getInfoUser();
                if (autoInteract.error) {
                    this.renderErr(autoInteract?.message);
                    this.widthWining = 0;
                } else {
                    this.widthWining = 0;
                    this.renderSuccess(`Mining success +${30}QFP`);
                    this.calcWidthMining();
                }
                //} else {
                //    this.$router.push({ name: "WalletCreate" });
                // }
            } catch (error) {
                this.renderErr(error?.message);
                await this.getInfoUser();
            }
        },
        calcWidthMining() {
            const totalTime = MINING_INTERVAL;
            const updateInterval = 1000;
            const increment = (100 * updateInterval) / totalTime / 2;

            this.intervalId = setInterval(() => {
                if (this.widthWining < 100) {
                    this.widthWining += increment;
                    if (this.widthWining >= 100) {
                        this.widthWining = 100;
                        clearInterval(this.intervalId);
                    }
                } else {
                    clearInterval(this.intervalId);
                }
            }, updateInterval);
        },
        async initializeApp() {
            setTimeout(() => {
                // this.setHasLoaded(true);
                this.$store.commit("setHasLoaded", true);
            }, 2000);
        },
    },
    async mounted() {
        Telegram.WebApp.ready();
        Telegram.WebApp.setHeaderColor("#ffffff");
        await this.getInfoUser();
        if (!this.hasLoaded) {
            this.initializeApp();
        }

    },
    async updated() {
        this.updateSence();
    },
    unmounted() {
        this.autoInteractInterval && clearInterval(this.autoInteractInterval);
        this.intervalId && clearInterval(this.intervalId);
    },
};
</script>

<style scoped>
@import "./../../styles/global.scss";
@import "./../../styles/app.css";
</style>

<template>
    <LoadingScreen />

    <div class="container" v-if="hasLoaded">
        <div class="container-game">
            <InfoUser v-if="dataLogin" :dataLogin="dataLogin" />

            <div class="link-checkin">
                <div>
                    <button @click="handleWallet">
                        <i class="fa-solid fa-wallet"></i>
                        Wallet
                    </button>
                </div>
                <button @click="onCheckIn()" v-bind:disabled="isExecCheckin">
                    <i class="fa-solid fa-calendar-days"></i> {{ titleCheckin }}
                    <span v-if="isExecCheckin"><i class="fa fa-spinner"></i></span>
                </button>
            </div>

            <div class="contaner-balance">
                <div class="wr-balance">
                    Balance:
                    <div class="text-balance" :class="{ 'animate-text': isAnimated }">
                        {{
                            formattedBalance(
                                dataLogin?.attributes?.qpoint?.data?.attributes
                                    ?.balance
                            )
                        }}
                    </div>

                    <img src="@public/assets/logo.svg" />
                </div>
                <div class="wrap-commit_reward" :style="beforeStyle">
                    <div class="box-info">
                        <div v-if="isClaim" class="box-left-train">
                            Click "Claim" to take +{{
                                Number(dataQPoint?.rewardAmount) *
                                dataQPoint?.rewardScheduleHour
                            }}
                            <img src="@public/assets/logo.svg" />
                        </div>

                        <div v-else class="box-left">
                            <div class="content">
                                Remain time: {{ countdown }}
                            </div>
                        </div>

                        <div class="box-right">
                            <button class="btn-commit_reward" @click="handleReward" :disabled="isCountingDown">
                                {{ isClaim ? "Claim" : "Training..." }}
                            </button>
                        </div>
                    </div>

                    <div class="box-info" :style="styleWining">
                        <div class="auto-left">
                            <div class="woodwork-loader">
                                <div class="runner" :style="styleWining"></div>
                            </div>

                            <div class="box-woodwork">
                                <img src="@public/assets/mining/woodwork.png" />
                            </div>
                        </div>
                        <!-- <div class="box-right">
                            <div class="btn-mining" @click="onAutoInteract()" :class="{ active: isExecAutoInteract }">
                                <img src="@public/assets/mining/icon-auto.png" :class="{
                                    rotateMining: isExecAutoInteract,
                                }" />
                                Mining
                            </div>
                        </div> -->
                    </div>
                </div>
            </div>

            <div class="box-action">
                <router-link to="/inventory">
                    <div class="img-inventory" @click="handleBackButton"></div>
                </router-link>
                <router-link to="/flip">
                    <div class="img-flip" @click="handleBackButton"></div>
                </router-link>
            </div>

            <MainGame ref="phaserRef" />
        </div>

        <div class="box-button">
            <div class="btn-item" @click="handleButtonTab('mission')" :class="{ active: activeButton === 'mission' }">
                <div class="item-img">
                    <img src="@public/assets/button-icons/mission.svg" />
                </div>
                <div class="item-title">Mission</div>
            </div>
            <div class="btn-item" @click="handleButtonTab('event')" :class="{ active: activeButton === 'event' }">
                <div class="item-img">
                    <img src="@public/assets/button-icons/event.svg" />
                </div>
                <div class="item-title">Event</div>
            </div>
            <div class="btn-item" @click="handleButtonTab('booster')" :class="{ active: activeButton === 'booster' }">
                <div class="item-img">
                    <img src="@public/assets/button-icons/booster.svg" />
                </div>
                <div class="item-title" :class="{ active: activeButton === 'booster' }">
                    Booster
                </div>
            </div>
            <div class="btn-item" @click="handleButtonTab('invite')" :class="{ active: activeButton === 'invite' }">
                <div class="item-img">
                    <img src="@public/assets/button-icons/invite-friend.svg" />
                </div>
                <div class="item-title">Invite Friend</div>
            </div>
            <div class="btn-item" @click="showPopupCoomingSoon">
                <div class="item-img">
                    <img src="@public/assets/button-icons/shop.svg" />
                </div>
                <div class="item-title">Shop</div>
            </div>
        </div>

        <div v-if="isPopupCode">
            <div class="popup-overlay"></div>
            <div class="popup-referer-code">
                <div class="referer-code">Referer code</div>
                <form @submit.prevent="submitCode">
                    <input class="code-input" :class="{ 'input-error': errorMessage }" type="text" v-model="code"
                        id="code" @input="clearError" placeholder="Enter code" />
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
        <EventList :visible="showEvent" :idUser="idUser" :dataQPoint="dataQPoint"
            @openCoomSoon="showPopupCoomingSoon" />

        <InviteFrens :visible="showInvite" :idUser="idUser" :rewardAmount="dataQPoint.rewardAmount"
            :telegram_bot_link="telegram_bot_link" />
        <BoosterForm :visible="showBooster" :rewardScheduleHour="dataQPoint.rewardScheduleHour" :idUser="idUser" />

        <CheckinForm :isCheckin="isCheckin" @closeCheckin="closeCheckin" />

        <div :class="[
            'popup-cooming-soon',
            { 'closing-popup': !showCoomingSoon },
        ]" v-if="showCoomingSoon">
            <p>Coming soon</p>
            <button @click="hidePopupCoomingSoon" class="btn-close-coming-soon">
                Close
            </button>
        </div>

        <div class="enter-code-success" v-if="isSuccess">
            <span>Success!</span>
        </div>

        <NotificationToast v-if="notification.show" :message="notification.message" :type="notification.type"
            @close="notification.show = false" />
    </div>
</template>
