<template>
    <div class="wr-flip-page fade-in">
        <img
            src="./../../../public/assets/event/banner-flip.png"
            loading="lazy"
            ref="bannerImage"
            alt="banner-flip"
            class="w-full"
        />

        <div class="m-[15px] h-full">
            <div class="wr-cooldown">
                <div
                    class="flex justify-between pt-[15px] px-[10px] gap-[10px]"
                >
                    <div class="flex gap-[10px]">
                        <img
                            class="avt"
                            :src="urlImg"
                            loading="lazy"
                            alt="avt"
                        />
                        <div class="flex flex-col gap-[5px] text-[10px]">
                            <div>{{ fullName }}</div>
                            <div class="text-rate">
                                Win Rate 50 Flips:
                                <span
                                    class="text-[#ffcf56]"
                                    v-bind:class="{ 'loader-rate': loading }"
                                    >{{ winRate }}%</span
                                >
                            </div>
                            <div>
                                Total W/L:
                                <span class="text-[#ffcf56]"
                                    >{{ winFlip }}/{{ lostFlip }}</span
                                >
                            </div>
                        </div>
                    </div>

                    <div class="box-cd">
                        <div class="text-center text-[16px] text-[#e6b2ff]">
                            Cooldown
                        </div>
                        <div
                            class="time"
                            :class="{ 'counter-animation': isAnimating }"
                        >
                            {{ timeCountdown }}
                        </div>
                    </div>
                </div>

                <div class="win-lose" v-if="lights?.length > 0">
                    <div v-for="(item, index) in lights" :key="index">
                        <div class="wl" :class="item.toLowerCase()"></div>
                    </div>
                </div>

                <div id="coin" :class="flipClass">
                    <div class="side-a"></div>
                    <div
                        class="side-b"
                        :style="{
                            backgroundImage: `url(${urlImg})`,
                        }"
                    ></div>
                </div>

                <div class="flex justify-center gap-3">
                    <button
                        class="btn-submit"
                        @click="flipCoin()"
                        :disabled="loadingSubmit"
                        :class="{ isOn: autoFlipValue }"
                    >
                        Flip the coin - 200
                        <img src="@public/assets/logo.svg" />
                    </button>

                    <button
                        class="btn-auto-flip"
                        @click="handleAutoFlip()"
                        :disabled="loadingSubmit"
                    >
                        Auto Flip
                        <div class="btn-on" v-if="autoFlipValue">ON</div>
                        <div class="btn-off" v-else>OFF</div>
                    </button>
                </div>

                <div class="flex justify-between px-[10px] pb-[5px]">
                    <div class="your-balance">
                        Your balance:
                        {{ formattedBalance(balance) }}
                        <img src="@public/assets/logo.svg" />
                    </div>

                    <div class="re-load" @click="handleHistory()">
                        <i class="fa-solid fa-rotate"></i>
                    </div>
                </div>
            </div>

            <div class="wr-history" :style="{ height: calculatedHeight }">
                <div class="title">
                    <div class="stt">Opponent</div>
                    <div class="time">Time</div>
                    <div class="status">Status</div>
                    <div class="reward">Reward</div>
                </div>

                <LoadingForm :loading="loading" />
                <div class="wr-content" v-if="!loading">
                    <div
                        v-for="(item, index) in dataHistory"
                        :key="index"
                        class="flex text-center p-[5px] text-[10px] items-center"
                    >
                        <div class="stt">
                            <div
                                class="w-[80px] whitespace-nowrap overflow-hidden text-ellipsis"
                            >
                                {{ parseReward(item?.Reward).userName || "-" }}
                            </div>
                        </div>

                        <div class="time">
                            {{ formatDateTimeUS(item?.createdAt) }}
                        </div>
                        <div class="status">
                            <div
                                class="win"
                                v-if="item?.Status?.toLowerCase() === 'win'"
                            >
                                <i class="fa-solid fa-crown"></i>
                            </div>
                            <div
                                class="lose"
                                v-if="item?.Status?.toLowerCase() === 'lose'"
                            >
                                <i class="fa-solid fa-flag"></i>
                            </div>
                            <div
                                v-if="item?.Status?.toLowerCase() === 'placed'"
                            >
                                Placed
                            </div>
                        </div>
                        <div class="reward">
                            Exp: 5
                            <br />
                            <div>
                                {{ item?.ValueType }}:
                                {{
                                    parseReward(item?.Reward)?.[
                                        item?.ValueType?.toLowerCase()
                                    ]
                                }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <NotificationToast
            v-if="showNotification"
            :message="notificationMessage"
            :type="notificationType"
            @close="showNotification = false"
        />

        <div v-bind:class="{ 'overlay-popup': isPopup }"></div>
        <div :class="['popup', { 'closing-popup': !isPopup }]" v-if="isPopup">
            <div class="icon-win" v-if="status !== 'placed'">
                <div>Winner</div>
            </div>
            <div class="box-img">
                <div
                    class="img"
                    :style="{
                        backgroundImage: `url(${getImageUrl()})`,
                    }"
                />
            </div>

            <div class="text">{{ text }}</div>
            <div class="desc">{{ descWinner }}</div>
            <button @click="hidePopup" class="btn-close">Close</button>
        </div>
    </div>

    <!-- <PopupConfirm
        v-if="isToken"
        :text="`Click yes to invoke your security token?`"
        :visible="isToken"
        @yes="handleYesToken"
        @no="handleNoToken"
    /> -->

    <PopupPassword :visible="isPass" @cancel="isPass = false" />

    <PopupComponent
        :visible="openAuto"
        title="AUTO FLIP"
        @yes="yesAutoFlip()"
        @no="noAutoFlip()"
        background-color="#500d79"
        border="1px solid #d631ff"
    >
        <template #content>
            <div class="p-[10px] flex flex-col gap-3">
                <div>
                    <div class="text-[14px] mb-1">Number of Auto-Flips</div>
                    <div class="flex gap-2">
                        <div
                            class="box-input w-[75px]"
                            :class="{ active: isCount }"
                            @click="(isCount = true), (countAuto = 1)"
                        >
                            <InputNumber
                                v-model="countAuto"
                                label=""
                                placeholder="Enter number"
                            />
                        </div>
                        <div
                            class="btn-count"
                            :class="{ active: !isCount }"
                            @click="btnUnlimited()"
                        >
                            Unlimited
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </PopupComponent>
</template>

<script lang="ts">
import LoadingForm from "@/components/LoadingForm.vue";
import NotificationToast from "@/components/NotificationToast.vue";
import PopupConfirm from "@/components/PopupConfirm.vue";
import userServiceTelebot from "@/services/useServiceTeleBot";
import { formatDateTimeUS, formattedBalance, trackEventBtn } from "@/utils";
import { defineComponent } from "vue";
import predictService from "@/services/predictService";
import userService from "@/services/userService";
import { TFlipClass, TStatusFlip } from "@/interface";
import PopupPassword from "@/components/popup/PopupPassword.vue";
import PopupComponent from "@/components/popup/PopupComponent.vue";
import InputNumber from "@/components/Input/InputNumber.vue";
import { computed, ref, watch } from "vue";
import { mapState, useStore } from "vuex";
import BackButtonTelegram from "@/mixins/BackButtonTelegram";

export default defineComponent({
    name: "FlipPage",
    mixins: [BackButtonTelegram],
    components: {
        NotificationToast,
        LoadingForm,
        PopupConfirm,
        PopupPassword,
        PopupComponent,
        InputNumber,
    },
    props: {},
    computed: {
        ...mapState(["autoFlipStore", "avtStore", "rewardInfo"]),
    },
    async created() {
        // this.yesBuySell = debounce(this.yesBuySell, 500);
    },
    watch: {
        autoFlipStore(newValue) {            
            this.autoFlipValue = newValue;
            if (!newValue) {
                this.getInfo();
                this.history();
                this.getRate();
            }
        },
    },
    async mounted() {
        this.updateHeight();

        if (!this.avtStore) {
            await this.getAvt();
        } else {
            this.urlImg = this.avtStore;
        }

        if (!this.rewardInfo) {
            await this.getInfo();
        } else {
            this.balance = Number(
                this?.rewardInfo?.attributes?.qpoint?.data?.attributes?.balance
            );
        }
        await Promise.all([this.history(), this.getRate()]);
        this.autoFlipValue = this.autoFlipStore;
    },

    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            imageHeight: 0,
            calculatedHeight: "calc(100% - 436px)",
            dataLogin: null,
            loading: false,
            userId: userInfo?.user?.id || "",
            fullName: `${userInfo?.user?.first_name} ${userInfo?.user?.last_name}`,
            // fullName: "su fly 007",
            isPopup: false,
            flipClass: "" as TFlipClass,
            urlImg: null,
            urlImgWinner: null,
            dataHistory: null,
            status: "" as TStatusFlip,
            loadingSubmit: false,

            timeCountdown: 10,
            isAnimating: false,

            showNotification: false,
            notificationMessage: "",
            notificationType: "",
            text: "",
            descWinner: "",

            // isToken: false,
            winRate: 0,
            lights: [],
            balance: 0,
            winFlip: 0,
            lostFlip: 0,

            isPass: false,

            isCount: true,
            openAuto: false,
            countAuto: 1,
            autoFlipValue: null,
        };
    },
    methods: {
        updateHeight() {
            const img = this.$refs.bannerImage;
            if (img) {
                img.onload = () => {
                    this.imageHeight = img.clientHeight;
                    this.calculatedHeight = `calc(100% - 348px - ${this.imageHeight}px)`;
                };
            }
        },
        getImageUrl() {
            if (this.status === "placed") {
                return this.urlImg || "./../../../public/assets/logo.jpg";
            } else {
                return this.urlImgWinner || "./../../../public/assets/logo.jpg";
            }
        },
        // handleYesToken() {
        //     this.isToken = false;
        //     window.Telegram.WebApp.openTelegramLink(
        //         "https://t.me/QFanClubBot?start=invoketoken"
        //     );
        //     window.Telegram.WebApp.close();
        // },
        // handleNoToken() {
        //     this.loadingSubmit = false;
        //     this.isToken = false;
        // },
        showPopup() {
            this.isPopup = true;
        },
        hidePopup() {
            this.isPopup = false;
            this.history();
            this.getRate();
            this.getInfo();
        },
        formatDateTimeUS,
        formattedBalance,
        async renderNotification(message, type) {
            this.notificationMessage = message;
            this.notificationType = type;
            this.showNotification = true;
        },
        async renderSuccess(text) {
            this.renderNotification(text, "success");
        },
        async renderErr(text) {
            this.renderNotification(text, "error");
        },
        startCountdown() {
            const countdown = setInterval(() => {
                if (this.timeCountdown > 0) {
                    this.animateCounter();
                    this.timeCountdown -= 1;
                } else {
                    this.timeCountdown = 10;
                    this.loadingSubmit = false;
                    clearInterval(countdown);
                }
            }, 1000);
        },
        animateCounter() {
            this.isAnimating = true;
            setTimeout(() => {
                this.isAnimating = false;
            }, 500);
        },
        parseReward(rewardString) {
            if (!rewardString) {
                return { point: 0, qfp: 0, userPhotoUrl: null, userName: "" };
            }

            const rewardData = JSON.parse(rewardString);

            let point = 0;
            let qfp = 0;
            let userPhotoUrl = null;
            let userName = null;

            rewardData.forEach((item) => {
                if (item.ValueType === "Point") {
                    point = item.Value;
                } else if (item.UserName !== undefined) {
                    userName = item.UserName;
                } else {
                    qfp = item.Value || 0;
                }
            });

            return { point, qfp, userPhotoUrl, userName };
        },
        navigateToHome() {
            this.$router.push("/");
        },
        timeoutPopup() {
            const timeoutId = setTimeout(() => {
                this.showPopup();
                clearTimeout(timeoutId);
            }, 5000);
        },
        async flipCoin() {
            this.loadingSubmit = true;
            this.status = "";
            this.flipClass = "";
            await this.handleSubmit();
        },

        async getAvt() {
            const response = await userServiceTelebot.getAvtTelegram(
                this.userId
            );
            this.$store.commit("setAvtStore", response);
            this.urlImg = response?.length > 0 ? response : "./../../../public/assets/logo.jpg";
        },
        async getAvtOpponent(idOpponent: number) {
            const response = await userServiceTelebot.getAvtTelegram(
                idOpponent
            );
            this.urlImgWinner = response;
        },

        async handleSubmit() {
            try {
                const data = {
                    gameId: 58,
                    userId: this.userId,
                    userName: this.fullName,
                    value: 200,
                    valueType: "QFP",
                    side: 0,
                };
                const res = await predictService.makeFlip(data);
                trackEventBtn({
                    label: 'Flip',
                });
                if (res.success) {
                    this.balance = Number(this.balance) - 200;
                    this.startCountdown();
                    const result = res?.data;

                    if (result?.Status === "Placed") {
                        this.status = "placed";
                        this.flipClass = "heads";

                        this.text = `Flip success!`;
                        this.descWinner = null;
                    } else {
                        if (result?.Status === "Win") {
                            this.status = "win";
                            this.flipClass = "tails";
                            this.descWinner = "You Win";
                            this.urlImgWinner = this.urlImg;
                        }
                        if (result?.Status === "Lose") {
                            this.getAvtOpponent(result?.WinnerInfo?.UserId);
                            this.status = "lose";
                            this.flipClass = "heads";
                            this.descWinner = "You Lose";
                        }
                        const text = `${result?.WinnerInfo?.UserName}`;

                        this.text = text;
                    }
                    this.timeoutPopup();
                } else {
                    this.loadingSubmit = false;
                    this.renderErr(res?.data?.Reason);
                }
            } catch (error) {
                if (error?.response?.status === 401) {
                    this.loadingSubmit = false;
                    this.isPass = true;
                }
            }
        },

        async history() {
            this.loading = true;
            try {
                const res = await predictService.getHistoryFlip(this.userId);
                this.loading = false;
                this.dataHistory = res;
                this.lights = res?.slice(0, 20)?.map((item) => item?.Status);
            } catch (error) {
                this.loading = false;
            }
        },
        async getRate() {
            const response = await predictService.getRateFlip(this.userId);
            const totalCount = response?.WonCount + response?.LostCount;
            const winRate = (response?.WonCount / totalCount) * 100;

            this.winFlip = response?.WonCount || 0;
            this.lostFlip = response?.LostCount || 0;
            this.winRate = isNaN(winRate) ? "0" : winRate?.toFixed(2);
        },
        async getInfo() {
            try {
                const data = await userService.getInfo(this.userId);
                const resData = data?.data?.[0];

                this.dataLogin = resData;
                this.balance = Number(
                    resData?.attributes?.qpoint?.data?.attributes?.balance
                );
            } catch (error) {
                console.log(error);
            }
        },
        handleAutoFlip() {
            if (this.autoFlipValue === true) {
                this.$store.commit("setAutoFlip", false);
            } else {
                const passVerify = localStorage.getItem("passVerify");
                if (!passVerify) {
                    this.isPass = true;
                } else {
                    this.openAuto = true;
                }
            }
        },
        async yesAutoFlip() {
            trackEventBtn({
                label: 'Auto_flip',
            });
            this.$store.commit("setAutoFlip", true);
            if (this.isCount) {
                this.$store.commit("setCountFlip", this.countAuto);
                this.renderSuccess(`Auto Flip ${this.countAuto} times`);
            } else {
                this.renderSuccess("Auto Flip Unlimited");
                this.$store.commit("setCountFlip", 0);
            }
            this.openAuto = false;
        },
        async noAutoFlip() {
            this.openAuto = false;
            this.countAuto = 1;
            this.isCount = true;
        },
        btnUnlimited() {
            this.isCount = false;
            this.countAuto = 0;
        },
        async handleHistory() {
            this.getInfo()
            this.getRate()
            this.history()
        }
    },
});
</script>

<style scoped lang="scss">
@import "@/styles/global.scss";

.wr-flip-page {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    left: 0;
    z-index: 999;
    color: #fff;
    background-image: url("./../../../public/assets/event/background-flip.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

.wr-cooldown {
    background-color: #500d79;
    border-radius: 10px;
    border: 2px solid #d631ff;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 20px;

    .avt {
        border: 2px solid #d83aff;
        border-radius: 5px;
        min-width: 40px;
        height: 40px;
    }

    .time {
        color: #ffcf56;
        text-align: center;
        transition: transform 0.5s ease-in-out;
    }

    .counter-animation {
        transform: scale(1.2);
    }

    .win-lose {
        display: flex;
        gap: 5px;
        background: #240039;
        padding: 5px 10px;
        margin-bottom: 20px;
        width: fit-content;
        border-radius: 5px;
        margin: 0 auto;
        flex-wrap: wrap;

        .wl {
            width: 10px;
            height: 10px;
            border-radius: 10px;
        }

        .win {
            background: #42ff00;
        }

        .lose {
            background: #ff0000;
        }

        .placed {
            background: #ffe500;
        }
    }
}

#coin {
    position: relative;
    margin: 0 auto;
    cursor: pointer;
    width: 80px;
    height: 80px;
    transition: transform 1s ease-in;
    transform-style: preserve-3d;
}

#coin.heads {
    -webkit-animation: flipHeads 5s ease-out forwards;
    -moz-animation: flipHeads 5s ease-out forwards;
    -o-animation: flipHeads 5s ease-out forwards;
    animation: flipHeads 5s ease-out forwards;
}

#coin.tails {
    -webkit-animation: flipTails 5s ease-out forwards;
    -moz-animation: flipTails 5s ease-out forwards;
    -o-animation: flipTails 5s ease-out forwards;
    animation: flipTails 5s ease-out forwards;
}

#coin div {
    position: absolute;
    backface-visibility: hidden;
}

.side-a {
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("./../../../public/assets/event/coin-img.png");
    z-index: 100;
    height: 100%;
    width: 100%;
}

.side-b {
    height: 100%;
    width: 100%;
    background-color: #3e3e3e;
    transform: rotateY(-180deg);
    border-radius: 50%;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

@keyframes flipHeads {
    from {
        -webkit-transform: rotateY(0);
        -moz-transform: rotateY(0);
        transform: rotateY(0);
    }

    to {
        -webkit-transform: rotateY(3600deg);
        -moz-transform: rotateY(3600deg);
        transform: rotateY(3600deg);
    }
}

@keyframes flipTails {
    from {
        -webkit-transform: rotateY(0);
        -moz-transform: rotateY(0);
        transform: rotateY(0);
    }

    to {
        -webkit-transform: rotateY(3780deg);
        -moz-transform: rotateY(3780deg);
        transform: rotateY(3780deg);
    }
}

.btn-submit,
.btn-auto-flip {
    padding: 10px;
    border-radius: 5px;
    width: fit-content;
    cursor: pointer;
    font-size: 12px;
    img {
        width: 15px;
    }
}

.btn-submit:disabled,
.btn-auto-flip:disabled,
// .box-input.active,
.isOn {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
}

.btn-auto-flip {
    padding: 10px 0 10px 10px;
}

.btn-on,
.btn-off {
    display: flex;
    align-items: center;
    height: 16px;
    padding: 10px;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
}
.btn-on {
    background: #42ff00;
}
.btn-off {
    background: #ff0000;
}

.wr-history {
    background-color: #500d79;
    // height: calc(100% - 436px);
    margin-top: 15px;
    border: 2px solid #d631ff;
    border-radius: 10px;

    .title {
        display: flex;
        text-align: center;
        padding: 5px 0;
        border-bottom: 1px solid #d631ff;
        margin: 0 5px;
        font-size: 12px;
        font-weight: 800;

        .stt {
            flex: 0 0 30%;
        }

        .time {
            flex: 0 0 25%;
        }

        .status {
            flex: 0 0 20%;
        }

        .reward {
            flex: 0 0 25%;
        }
    }

    .wr-content {
        height: calc(100% - 35px);
        overflow-y: auto;
        // scrollbar-width: none;
        // -ms-overflow-style: none;

        .stt {
            flex: 0 0 30%;
            display: flex;
            justify-content: center;
        }

        .time {
            flex: 0 0 25%;
        }

        .status {
            flex: 0 0 20%;
            font-size: 10px;

            .win {
                color: #ffe500;
            }

            .lose {
                color: #fff;
            }
        }

        .reward {
            flex: 0 0 25%;
        }
    }
}

.popup {
    z-index: 999;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #500d79;
    padding: 30px 50px;
    border: 1px solid #d631ff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.5s forwards;
    border-radius: 10px;
    text-align: center;

    .box-img {
        display: flex;
        justify-content: center;
        padding: 10px;
    }

    .img {
        width: 50px;
        height: 50px;
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        border-radius: 8px;
    }

    .icon-win {
        color: #ffe500;
        font-size: 22px;
    }

    .text {
        font-size: 12px;
    }

    .desc {
        font-size: 12px;
        margin: 10px 0;
    }
}

.btn-close {
    border-radius: 5px;
    font-size: 12px;
}

@keyframes slideIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.overlay-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.your-balance {
    display: flex;
    font-size: 10px;
    align-items: center;
    background: rgba(0, 0, 0, 0.4);
    width: fit-content;
    padding: 3px 5px;
    border-radius: 10px;
    gap: 5px;

    img {
        width: 15px;
    }
}

.btn-count {
    width: fit-content;
    cursor: pointer;
    font-size: 12px;
    padding: 5px 10px;
    background: #412e17;
    font-weight: 800;
    opacity: 0.6;
    border-radius: 5px;
}

.box-input {
    opacity: 0.6;
}
.box-input.active {
    opacity: 1;
}
.btn-count.active {
    background: #ffa53a;
    opacity: 1;
}
</style>
