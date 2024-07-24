<template>
    <div class="wr-flip-page">
        <div class="banner-flip"></div>

        <div class="box-detail-flip">
            <div class="wr-cooldown">
                <div class="box-info">
                    <div class="user">
                        <div
                            class="avt"
                            :style="{
                                backgroundImage: `url(${urlImg})`,
                            }"
                        ></div>
                        <div class="name-rate">
                            <div>{{ fullName }}</div>
                            <div>
                                Win rate:
                                <span v-bind:class="{ 'loader-rate': loading }"
                                    >{{ winRate }}%</span
                                >
                            </div>
                        </div>
                    </div>

                    <div class="box-cd">
                        <div class="title">Cooldown</div>
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

                <div class="box-submit">
                    <button
                        class="btn-submit"
                        @click="flipCoin"
                        :disabled="loadingSubmit"
                    >
                        Flip the coin - 200
                    </button>
                </div>

                <div class="re-load" @click="history">
                    <i class="fa-solid fa-rotate"></i>
                </div>
            </div>

            <div class="wr-history">
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
                        class="content"
                    >
                        <div class="stt">
                            <div class="text">
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
                            Point: {{ parseReward(item?.Reward).point }}
                            <br />
                            {{ item?.ValueType }}:
                            {{
                                parseReward(item?.Reward)?.[
                                    item?.ValueType.toLowerCase()
                                ]
                            }}
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

    <PopupConfirm
        v-if="isToken"
        :text="`Click yes to invoke your security token`"
        :visible="isToken"
        @yes="handleYesToken"
        @no="handleNoToken"
    />
</template>

<script lang="ts">
import LoadingForm from "@/components/LoadingForm.vue";
import NotificationToast from "@/components/NotificationToast.vue";
import PopupConfirm from "@/components/PopupConfirm.vue";
import userServiceTelebot from "@/services/useServiceTeleBot";
import { formatDateTimeUS } from "@/utils";
import { defineComponent } from "vue";
import { secureStorage } from "@/storage/storage";
import predictService from "@/services/predictService";

// import { mapState } from "vuex";

export default defineComponent({
    name: "FlipPage",
    components: {
        NotificationToast,
        LoadingForm,
        PopupConfirm,
    },
    props: {},
    // computed: {
    //     ...mapState({
    //         userId: (state) => state?.userId,
    //         fullName: (state) => state?.fullName,
    //     }),
    // },
    created() {
        this.getAvt();
        this.history();
        this.getRate();
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;
        let startParam = "";
        if (
            window.Telegram.WebApp.initDataUnsafe.start_param &&
            window.Telegram.WebApp.initDataUnsafe.start_param?.startsWith(
                "TOKEN_"
            )
        ) {
            startParam =
                window.Telegram.WebApp.initDataUnsafe.start_param?.replace(
                    "TOKEN_",
                    ""
                );
        }
        return {
            loading: false,
            userId: userInfo?.user?.id,
            fullName: `${userInfo?.user?.first_name} ${userInfo?.user?.last_name}`,
            tokenUser: startParam,
            isPopup: false,
            flipClass: "",
            urlImg: null,
            urlImgWinner: null,
            dataHistory: null,
            status: "",
            loadingSubmit: false,

            timeCountdown: 60,
            isAnimating: false,

            showNotification: false,
            notificationMessage: "",
            notificationType: "",
            text: "",
            descWinner: "",

            isToken: false,
            winRate: 0,
            lights: [],
        };
    },
    methods: {
        getImageUrl() {
            if (this.status === "placed") {
                return this.urlImg || "./../../../public/assets/logo.jpg";
            } else {
                return this.urlImgWinner || "./../../../public/assets/logo.jpg";
            }
        },
        handleYesToken() {
            this.isToken = false;
            window.Telegram.WebApp.openTelegramLink(
                "https://t.me/Sampletwabot?start=invoketoken"
            );
            window.Telegram.WebApp.close();
        },
        handleNoToken() {
            this.loadingSubmit = false;
            this.isToken = false;
        },
        showPopup() {
            this.isPopup = true;
        },
        hidePopup() {
            this.isPopup = false;
            this.history();
            this.getRate();
        },
        formatDateTimeUS,
        async renderNotification(message, type) {
            this.notificationMessage = message;
            this.notificationType = type;
            this.showNotification = true;
            setTimeout(() => {
                this.showNotification = false;
            }, 2000);
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
                    this.timeCountdown = 60;
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
            }, 3000);
        },
        async flipCoin() {
            this.loadingSubmit = true;

            await this.handleSubmit();
        },

        async getAvt() {
            const response = await userServiceTelebot.getAvtTelegram(
                this.userId
            );
            this.urlImg = response;
        },

        async handleSubmit() {
            try {
                const securityToken = await secureStorage.get("SECURITY_TOKEN");
                if (!securityToken) {
                    this.isToken = true;
                    return;
                }

                const data = {
                    gameId: 58,
                    userId: this.userId,
                    userName: this.fullName,
                    value: 200,
                    valueType: "QFP",
                    side: 0,
                    securityToken: securityToken?.toString(),
                };
                const res = await predictService.makeFlip(data);

                if (res.success) {
                    const result = res?.data;
                    this.startCountdown();

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
                        }
                        if (result?.Status === "Lose") {
                            this.status = "lose";
                            this.flipClass = "heads";
                            this.descWinner = "You Lose";
                        }
                        const text = `${result?.WinnerInfo?.UserName}`;

                        this.text = text;
                        this.urlImgWinner = result?.WinnerInfo?.UserPhotoUrl;
                    }
                    this.timeoutPopup();
                } else {
                    if (res?.data?.SecurityToken) {
                        this.isToken = true;
                        return;
                    } else {
                        this.startCountdown();
                        this.renderErr(res?.data?.Reason);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        },

        async history() {
            this.loading = true;
            this.getRate();

            try {
                const res = await predictService.getHistoryFlip(this.userId);

                this.loading = false;
                this.dataHistory = res;

                this.lights = res?.map((item) => item?.Status);
            } catch (error) {
                this.loading = false;
            }
        },
        async getRate() {
            const response = await predictService.getRateFlip(this.userId);

            const totalCount = response?.WonCount + response?.LostCount;
            const winRate = (response?.WonCount / totalCount) * 100;

            this.winRate = isNaN(winRate) ? "0" : winRate?.toFixed(2);
        },
    },
});
</script>

<style scoped lang="scss">
.wr-flip-page {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    left: 0;
    z-index: 999;
    animation: fadeInDetailEvent 0.1s ease forwards;
    color: #fff;
    background-image: url("./../../public/assets/event/background-flip.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

@keyframes fadeInDetailEvent {
    0% {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.banner-flip {
    background-image: url("./../../../public//assets/event/banner-flip.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    height: 100px;
}

.box-detail-flip {
    margin: 15px;
    height: 100%;
}

.wr-cooldown {
    background-color: #500d79;
    border-radius: 10px;
    border: 2px solid #d631ff;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 20px;
    .box-info {
        display: flex;
        justify-content: space-between;
        padding: 15px 15px 0;
        .user {
            display: flex;
            gap: 10px;
            .avt {
                border: 2px solid #d83aff;
                border-radius: 5px;

                min-width: 40px;
                height: 40px;
                display: flex;

                background-position: center;
                background-repeat: no-repeat;
                background-size: contain;
            }
            .name-rate {
                font-size: 12px;
                display: flex;
                flex-direction: column;
                gap: 5px;
                span {
                    color: #ffcf56;
                }
            }
        }
        .title {
            text-align: center;
            font-size: 20px;
            color: #e6b2ff;
        }
        .time {
            font-size: 20px;
            color: #ffcf56;
            text-align: center;
            transition: transform 0.5s ease-in-out;
        }
        .counter-animation {
            transform: scale(1.2);
        }
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
    -webkit-animation: flipHeads 3s ease-out forwards;
    -moz-animation: flipHeads 3s ease-out forwards;
    -o-animation: flipHeads 3s ease-out forwards;
    animation: flipHeads 3s ease-out forwards;
}
#coin.tails {
    -webkit-animation: flipTails 3s ease-out forwards;
    -moz-animation: flipTails 3s ease-out forwards;
    -o-animation: flipTails 3s ease-out forwards;
    animation: flipTails 3s ease-out forwards;
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
        -webkit-transform: rotateY(1800deg);
        -moz-transform: rotateY(1800deg);
        transform: rotateY(1800deg);
    }
}
@keyframes flipTails {
    from {
        -webkit-transform: rotateY(0);
        -moz-transform: rotateY(0);
        transform: rotateY(0);
    }
    to {
        -webkit-transform: rotateY(1980deg);
        -moz-transform: rotateY(1980deg);
        transform: rotateY(1980deg);
    }
}

.wr-two-coin {
    display: flex;
    gap: 50px;
}
.box-qfp {
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("./../../../public/assets/event/coin-qfp.png");
    width: 55px;
    height: 55px;
}
.box-quai {
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("./../../../public/assets/event/coin-quai.png");
    width: 55px;
    height: 55px;
}

.box-submit {
    margin-bottom: 20px;
    .btn-submit {
        // background-color: #3eff3a;
        padding: 10px;
        border-radius: 5px;
        width: fit-content;
        margin: 0 auto;
        cursor: pointer;
        font-size: 12px;
    }
    .btn-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

.wr-history {
    background-color: #500d79;
    height: calc(100% - 406px);
    margin-top: 15px;
    border: 2px solid #d631ff;
    border-radius: 10px;
    .title {
        display: flex;
        text-align: center;
        padding: 5px 0;
        border-bottom: 1px solid #d631ff;
        margin: 0 5px;
        font-family: monospace;
        font-weight: bold;
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
        // max-height: calc(100% - 35px);
        height: calc(100% - 35px);
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;

        .content {
            display: flex;
            text-align: center;
            padding: 5px;
            font-size: 11px;
            font-family: monospace;
            align-items: center;
            font-weight: bold;

            .stt {
                flex: 0 0 30%;
                display: flex;
                justify-content: center;
                img {
                    width: 30px;
                }
                .text {
                    width: 80px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
            .time {
                flex: 0 0 25%;
            }
            .status {
                flex: 0 0 20%;
                font-size: 14px;
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

.re-load {
    position: absolute;
    bottom: 3%;
    right: 3%;
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
</style>
