<script setup lang="ts">
import { onMounted, ref, toRaw } from "vue";
import MainGame from "./../../rising-star/MainGame.vue";

interface PhaserScene {
    changeScene: () => void;
}

const phaserRef: any = ref<{ scene?: PhaserScene }>();

onMounted(() => {
    window.Telegram.WebApp.expand()
});
</script>

<script lang="ts">
import BoosterForm from "@/components/BoosterForm.vue";
import InputField from "@/components/Input/InputField.vue";
import InviteFrens from "@/components/InviteFrens.vue";
import NotificationToast from "@/components/NotificationToast.vue";
import PopupComingSoon from "@/components/popup/PopupComingSoon.vue";
import PopupComponent from "@/components/popup/PopupComponent.vue";
import PopupPassword from "@/components/popup/PopupPassword.vue";
import { GA_TRACKING_ID } from "@/config/googleAnalytics";
import {
CURRENT_WALLET_VERSION
} from "@/crypto_utils/constants";
import HDKeyring from "@/crypto_utils/HDKeyring";
import type { ILevel } from "@/interface";
import userService from "@/services/userService";
import { formattedBalance, trackEventBtn } from "@/utils";
import CheckinForm from "@/views/Checkin/CheckinForm.vue";
import EventList from "@/views/Event/EventList.vue";
import InfoUser from "@/views/InfoUser/InfoUser.vue";
import LoadingScreen from "@/views/LoadingScreen/LoadingScreen.vue";
import MissionList from "@/views/Mission/MissionsList.vue";
import { type Wallet } from "quais";
import { mapState } from "vuex";
import BoxAction from "./BoxAction.vue";
import VersionPage from "./VersionPage.vue";

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
        BoxAction,
        PopupPassword,
        PopupComingSoon,
    },

    data() {
        const telegram_bot_link =
            "Invite Link: https://t.me/QFanClubBot?start=r_";

        const dataUserTele = window.Telegram?.WebApp?.initDataUnsafe;

        let first_name = dataUserTele?.user?.first_name || "";
        let last_name = dataUserTele?.user?.last_name || "";

        return {
            storePermission: false,
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
            titleCheckin: "check_in",
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
            isAnimated: false,

            openGiftCode: false,
            giftCode: "",
            showOptions: false,
            isMaintenance: false,
        };
    },
    computed: {
        ...mapState([
            "hasLoaded",
            "autoMiningStore",
            "autoMessStore",
            "autoMessTextStore",
        ]),
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
    watch: {
        autoMiningStore() {
            if (this.autoMiningStore) {
                this.calcWidthMining();
                this.isExecAutoInteract = true;
            }
        },
        autoMessTextStore(newVal, oldVal) {
            this.widthWining = 0;
            if (this.autoMessStore) {
                this.renderSuccess(
                    `Mining success, block reward is being calculated.`
                );
                this.calcWidthMining();
                this.getInfoUser();
            } else {
                this.renderErr(newVal);
            }
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
            this.notification = {
                show: true,
                message: message,
                type: type,
            };
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
                    first_name: this.first_name,
                    last_name: this.last_name,
                    language_code: "vi",
                };
                const res = await userService.getCallBack(
                    dataForm,
                    this?.code!
                );

                if (res) {
                    this.isSuccess = true;
                    this.code = "";

                    this.getInfoUser();
                } else {
                    this.renderErr('Error')
                }
            } catch (error) {
                console.error("Error fetching API data:", error);
            }finally{
                this.isSuccess = false;
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

                    this.$store.commit("setRewardInfo", resData);
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
            return await userService.checkCode(referCode);
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
            trackEventBtn({
                label: "Claim/Trainning",
            });
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
            const handleClick = () => {
                this.$router.push("/");
                this.showMission = false;
                this.showEvent = false;
                this.showBooster = false;
                this.showInvite = false;
                this.activeButton = "";
                this.getInfoUser();

                Telegram.WebApp.BackButton.hide();
                Telegram.WebApp.BackButton.offClick(handleClick);
            };

            Telegram.WebApp.BackButton.onClick(handleClick);
        },
        handleButtonTab(tab) {
            if (window.gtag) {
                window.gtag("config", GA_TRACKING_ID, {
                    page_path: `/${tab}`,
                    page_title: tab,
                });
            }
            trackEventBtn({
                label: tab,
            });

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
                }
            };

            Object.assign(this, tabMappings[tab]);
        },
        async handleWallet() {
            trackEventBtn({
                label: "Wallet",
            });
            const walletType = localStorage.getItem("walletType");
            if (walletType !== CURRENT_WALLET_VERSION) {
                localStorage.removeItem("tallyVaults");
                localStorage.removeItem("address");
                this.$router.push({ name: "WalletCreate" });
            }

            const keyringService = new HDKeyring();
            const isUnlock = await keyringService.unlock();
            if (isUnlock && keyringService.isSigning) {
                this.$router.push({ name: "WalletDetail" });
            } else {
                this.$router.push({ name: "WalletForm" });
            }
        },
        async goToShop() {
            this.$router.push({ name: "Shop" });
        },
        async onCheckIn() {
            trackEventBtn({
                label: "Checkin",
            });
            // this.isMaintenance = true
            try {
                this.titleCheckin = "processing";
                this.isExecCheckin = true;
                const claimCheckin = await userService.claimCheckin(
                        this.idUser
                    );
                if(claimCheckin){
                    this.renderSuccess("Checkin success!")
                    await this.getInfoUser();
                }
                
                // const keyringService = new HDKeyring();
                // const isUnlock = await keyringService.unlock();
                // if (isUnlock) {
                //     const activeWallet = keyringService.getActiveWallet();
                //     const address = await activeWallet?.address;

                //     if (!address) {
                //         this.$router.push({ name: "WalletCreate" });
                //         return;
                //     }

                //     const request: QuaiTransactionRequest = {
                //         from: address,
                //         to: CONTRACT_OWNER_ADDRESS,
                //     };

                //     const tx = (await keyringService.sendTokenTransaction(
                //         request
                //     )) as unknown as unknown as QuaiTransactionResponse;

                //     const claimCheckin = await userService.claimCheckin(
                //         this.idUser,
                //         activeWallet?.address as string,
                //         tx.hash as string
                //     );
                //     await this.getInfoUser();
                    
                //     if (claimCheckin.error) {
                //          this.renderErr(claimCheckin?.message);
                         
                //     } else {
                //         await this.renderSuccess("Checkin success!");
                //     }
                // } else {
                //     this.$router.push({ name: "WalletCreate" });
                // }
            } catch (error) {
                this.renderErr(error?.response?.data?.message)
                // this.renderErr(
                //     "Checkin failed! Chain is not ready to interact."
                // );
            } finally {                
                this.isExecCheckin = false;
                this.titleCheckin = "check_in";
            }
        },
        async onAutoInteract() {
            this.isMaintenance = true
            // trackEventBtn({
            //     label: "AutoMining",
            // });
            // const walletType = localStorage.getItem("walletType");
            // if (walletType !== CURRENT_WALLET_VERSION) {
            //     localStorage.removeItem("tallyVaults");
            //     localStorage.removeItem("address");
            //     this.$router.push({ name: "WalletCreate" });
            // } else {
            //     this.$store.commit("setAutoMining", true);
            //     trackEventBtn({
            //         label: "AutoMining",
            //     });
            // }
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
                this.$store.commit("setHasLoaded", true);
            }, 2000);
        },
        async cancelPopupPassword() {
            this.storePermission = false;
            await this.getInfoUser();
        },
        handleGiftCode() {
            trackEventBtn({
                label: "GiftCode",
            });
            this.openGiftCode = true;
        },
        async handleYesGiftCode() {
            const res = await userService.giftCode(this.idUser, this.giftCode);
                        
            if (res.status === 200) {
                this.renderSuccess(`+ ${res?.data?.amount} ${res?.data?.unit}`);
                this.handleNoGiftCode();
                this.getInfoUser();
            } else {
                this.renderErr(res?.message);
            }
        },
        handleNoGiftCode() {
            this.openGiftCode = false;
            this.giftCode = "";
        },
        handleTutorial() {
            trackEventBtn({
                label: "Tutorial",
            });
            window.open("https://t.me/QFanClubAnnouncement/103", "_blank");
        },
        toggleLanguageOptions() {
            this.$refs.hamburgerCheckbox.checked = false;
            this.showOptions = !this.showOptions;
        },
        selectLanguage(language) {
            this.showOptions = false;
            this.$i18n.locale = language;
            this.$refs.hamburgerCheckbox.checked = true;
            localStorage.setItem("preferredLanguage", language);
        },
        handleMenu(){
            this.showOptions = false;
        },
    },
    async mounted() {
        Telegram.WebApp.ready();
        Telegram.WebApp.BackButton.hide();
        this.$store.commit("setRouterFusion", false);
        await this.getInfoUser();

        if (!this.hasLoaded) {
            this.initializeApp();
        }
        if (this.autoMiningStore) {
            this.calcWidthMining();
            this.isExecAutoInteract = true;
        }
    },
    async updated() {
        this.updateSence();
    },
    created() {
        const savedLanguage = localStorage.getItem("preferredLanguage");
        if (savedLanguage) {
            this.$i18n.locale = savedLanguage;
        }
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

            <div class="container-menu">
                <input
                    type="checkbox"
                    id="openmenu"
                    class="hamburger-checkbox"
                    ref="hamburgerCheckbox"
                />

                <label class="hamburger-icon cursor-pointer" for="openmenu">
                    <!-- <div class="btn-wl-icon">
                        <button @click="handleWallet()">
                            <i class="fa-solid fa-wallet"></i>
                            {{ $t("wallet") }}
                        </button>
                    </div> -->

                    <div class="open-menu btn-menu" for="openmenu" @click="handleMenu()">
                        <i class="fa-solid fa-bars"></i>
                        {{ $t("menu") }}
                    </div>

                    <div class="close-menu" for="openmenu">
                        <button
                            class="btn-menu"
                            @click="onCheckIn()"
                            v-bind:disabled="isExecCheckin"
                        >
                            <i class="fa-solid fa-calendar-days"></i>
                                {{ $t(titleCheckin) }}
                            <span v-if="isExecCheckin"
                                ><i class="fa fa-spinner"></i
                            ></span>
                        </button>
                        <button @click="handleGiftCode()" class="btn-menu">
                            <i class="fa-solid fa-gift"></i>
                            {{ $t('gift_code') }}
                        </button>
                        <button @click="handleTutorial()" class="btn-menu">
                            <i class="fa-solid fa-book"></i>
                            {{ $t('tutorials') }}
                        </button>

                        <div class="close-menu-icon btn-menu">
                            <i class="fa-solid fa-x"></i>
                            {{ $t('close') }}
                        </div>
                    </div>
                </label>

                <label for="openmenu" class="btn-language-icon">
                    <button @click="toggleLanguageOptions()">
                        <i class="fa-solid fa-language"></i>
                        {{ $t("language") }}
                    </button>
                    <div v-if="showOptions" class="language-options">
                        <button @click="selectLanguage('en')">
                            <div class="text-[8px]">EN</div>
                            <div>{{ $t("english") }}</div>
                        </button>
                        <button @click="selectLanguage('zh')">
                            <div class="text-[8px]">ZH</div>
                            <div>{{ $t("chinese") }}</div>
                        </button>
                    </div>
                </label>
            </div>

            <div class="contaner-balance">
                <div class="wr-balance">
                    {{ $t("balance") }}:
                    <div
                        class="text-balance"
                        :class="{ 'animate-text': isAnimated }"
                    >
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
                            {{ $t("click_claim_to_take") }} +{{
                                Number(dataQPoint?.rewardAmount) *
                                dataQPoint?.rewardScheduleHour
                            }}
                            <img src="@public/assets/logo.svg" />
                        </div>

                        <div v-else class="box-left">
                            <div class="content">
                                {{ $t("remain_time") }}: {{ countdown }}
                            </div>
                        </div>

                        <div class="box-right">
                            <button
                                class="btn-commit_reward"
                                @click="handleReward"
                                :disabled="isCountingDown"
                            >
                                {{ isClaim ? $t("claim") : $t("training") }}
                            </button>
                        </div>
                    </div>

                    <!-- <div class="box-info" :style="styleWining">
                        <div class="auto-left">
                            <div class="woodwork-loader">
                                <div
                                    class="runner rotateMining"
                                    :style="styleWining"
                                ></div>
                            </div>

                            <div class="box-woodwork">
                                <img src="@public/assets/mining/woodwork.png" />
                            </div>
                        </div>
                        <div class="box-right">
                            <div
                                class="btn-mining"
                                @click="onAutoInteract()"
                                :class="{ active: isExecAutoInteract }"
                            >
                                <img
                                    src="@public/assets/mining/icon-auto.png"
                                    :class="{
                                        rotateMining: isExecAutoInteract,
                                    }"
                                />
                                {{ $t("mining") }}
                            </div>
                        </div>
                    </div> -->
                </div>
            </div>

            <BoxAction />
            <MainGame ref="phaserRef" />
        </div>

        <div class="box-button">
            <div
                class="btn-item"
                @click="handleButtonTab('mission')"
                :class="{ active: activeButton === 'mission' }"
            >
                <div class="item-img">
                    <img src="@public/assets/button-icons/mission.svg" />
                </div>
                <div class="item-title">{{ $t("mission") }}</div>
            </div>
            <div
                class="btn-item"
                @click="handleButtonTab('event')"
                :class="{ active: activeButton === 'event' }"
            >
                <div class="item-img">
                    <img src="@public/assets/button-icons/event.svg" />
                </div>
                <div class="item-title">{{ $t("event") }}</div>
            </div>
            <div
                class="btn-item"
                @click="handleButtonTab('booster')"
                :class="{ active: activeButton === 'booster' }"
            >
                <div class="item-img">
                    <img src="@public/assets/button-icons/booster.svg" />
                </div>
                <div
                    class="item-title"
                    :class="{ active: activeButton === 'booster' }"
                >
                    {{ $t("booster") }}
                </div>
            </div>
            <div
                class="btn-item"
                @click="handleButtonTab('invite')"
                :class="{ active: activeButton === 'invite' }"
            >
                <div class="item-img">
                    <img src="@public/assets/button-icons/invite-friend.svg" />
                </div>
                <div class="item-title">{{ $t("invite_friend") }}</div>
            </div>

            <!-- <div class="btn-item" @click="goToShop()">
                <div class="item-img">
                    <img src="@public/assets/button-icons/NFT.svg" />
                </div>
                <div class="item-title">{{ $t("nft") }}</div>
            </div> -->
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
            :dataQPoint="dataQPoint"
            @openCoomSoon="showPopupCoomingSoon"
        />

        <InviteFrens
            :visible="showInvite"
            :idUser="idUser"
            :rewardAmount="dataQPoint.rewardAmount"
            :telegram_bot_link="telegram_bot_link"
        />
        <BoosterForm
            :visible="showBooster"
            :rewardScheduleHour="dataQPoint.rewardScheduleHour"
            :idUser="idUser"
        />

        <CheckinForm :isCheckin="isCheckin" @closeCheckin="closeCheckin" />

        <PopupComingSoon
            :visible="showCoomingSoon"
            message="coming_soon"
            @close="showCoomingSoon = false"
        />

        <div class="enter-code-success" v-if="isSuccess">
            <span>Success!</span>
        </div>

        <NotificationToast
            v-if="notification.show"
            :message="notification.message"
            :type="notification.type"
            @close="notification.show = false"
        />

        <PopupPassword
            :visible="storePermission"
            @cancel="cancelPopupPassword"
        />

        <PopupComponent
            :visible="openGiftCode"
            title="gift_code" 
            @yes="handleYesGiftCode()"
            @no="handleNoGiftCode()"
        >
            <template #content>
                <div class="px-[10px]">
                    <InputField
                        v-model="giftCode"
                        label=""
                        placeholder="enter_gift_code"
                    />
                </div>
            </template>
        </PopupComponent>

        <PopupComingSoon
            :visible="isMaintenance"
            message="under_maintenance"
            @close="isMaintenance = false"
        />
        <VersionPage />
    </div>
</template>
