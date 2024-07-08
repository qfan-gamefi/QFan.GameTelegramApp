<template>
    <div class="wr-flip-page">
        <div class="banner-flip"></div>

        <div class="box-detail-flip">
            <div class="wr-cooldown">
                <div class="title">Cooldown</div>
                <!-- <div class="time">0:59</div> -->

                <div id="coin" :class="flipClass">
                    <div class="side-a"></div>
                    <div
                        class="side-b"
                        :style="{
                            backgroundImage: `url(${urlImg})`,
                        }"
                    ></div>
                </div>

                <!-- <div class="box-value">
                    <div class="value">500</div>
                </div> -->

                <div class="box-submit">
                    <button
                        class="btn-submit"
                        @click="flipCoin"
                        :disabled="loadingSubmit"
                    >
                        Submit - 500
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

        <div :class="['popup', { 'closing-popup': !isPopup }]" v-if="isPopup">
            <div class="icon-win" v-if="status !== 'placed'">
                <i class="fa-solid fa-crown"></i>
            </div>
            <!-- <div class="icon-lose" v-if="status == 'lose'">
                <i class="fa-solid fa-flag"></i>
            </div> -->
            <p>{{ text }}</p>
            <button @click="hidePopup" class="btn-close">Close</button>
        </div>
    </div>
</template>

<script lang="ts">
import LoadingForm from "@/components/LoadingForm.vue";
import NotificationToast from "@/components/NotificationToast.vue";
import { formatDateTimeUS } from "@/utils";
import { defineComponent } from "vue";
// import { mapState } from "vuex";

export default defineComponent({
    name: "FlipPage",
    components: {
        NotificationToast,
        LoadingForm,
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
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe.user;

        return {
            loading: false,
            userId: userInfo?.id,
            fullName: `${userInfo?.first_name} ${userInfo?.last_name}`,
            isPopup: false,
            flipClass: "",
            urlImg: "",
            dataHistory: null,
            status: "",
            loadingSubmit: false,

            showNotification: false,
            notificationMessage: "",
            notificationType: "",
            text: "",
        };
    },
    methods: {
        showPopup() {
            this.isPopup = true;
        },
        hidePopup() {
            this.isPopup = false;
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

        async flipCoin() {
            this.flipClass = "";
            this.loadingSubmit = true;

            const flipResult = Math.random();

            setTimeout(() => {
                if (flipResult <= 0.5) {
                    this.flipClass = "heads";
                } else {
                    this.flipClass = "tails";
                }
            }, 100);
            await this.handleSubmit();
        },

        async getAvt() {
            try {
                const response = await fetch(
                    `https://322f-171-224-181-129.ngrok-free.app/api/v1/flip/getPlayerFlipInfo?userId=${this.userId}&domainCode=FLIP_COIN&userName=${this.fullName}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "1",
                        },
                    }
                );

                const data = await response.json();
                const parseData = JSON.parse(data?.message);

                this.urlImg = parseData?.UserPhotoUrl;
            } catch (error) {
                console.error(
                    "There has been a problem with your fetch operation:",
                    error
                );
            }
        },

        async handleSubmit() {
            try {
                const response = await fetch(
                    `https://322f-171-224-181-129.ngrok-free.app/api/v1/flip/makeflip`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "1",
                        },
                        body: JSON.stringify({
                            gameId: 1,
                            userId: this.userId, //this.userId 5314337740
                            userName: this.fullName, //this.fullName 2Awesome
                            value: 500,
                            valueType: "QFP",
                            side: 0,
                        }),
                    }
                );

                const data = await response.json();
                const parseData = JSON.parse(data?.message);
                console.log(parseData);

                if (parseData?.success === true) {
                    this.loadingSubmit = false;
                    if (parseData?.data?.Status === "Placed") {
                        this.status = "placed";
                        this.flipClass = "heads";

                        const text = `Flip success!`;
                        // this.renderSuccess(text);
                        this.text = text;
                        this.showPopup();
                    } else {
                        if (parseData?.data?.Status === "Win") {
                            this.status = "win";
                            this.flipClass = "tails";
                        }
                        if (parseData?.data?.Status === "Lose") {
                            this.status = "lose";
                            this.flipClass = "heads";
                        }
                        const text = `${parseData?.data?.WinnerInfo?.UserName}`; // - ${parseData?.data?.Status}`;
                        // this.renderSuccess(text);
                        this.text = text;
                        this.showPopup();
                    }
                } else {
                    this.renderErr(parseData?.data?.Reason);
                }
            } catch (error) {
                console.log(error);
            } finally {
                this.history();
            }
        },

        async history() {
            this.loading = true;
            try {
                const response = await fetch(
                    `https://322f-171-224-181-129.ngrok-free.app/api/v1/flip/getPlayerFlip?userId=${this.userId}&domainCode=FLIP_COIN`,
                    {
                        method: "Get",
                        headers: {
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "1",
                        },
                    }
                );

                const data = await response.json();
                this.loading = false;
                this.dataHistory = JSON.parse(data?.message);

                console.log(JSON.parse(data?.message));
            } catch (error) {
                this.loading = false;
            }
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
    .title {
        text-align: center;
        font-size: 20px;
        padding: 15px;
        color: #e6b2ff;
    }
    .time {
        font-size: 20px;
        color: #ffcf56;
        text-align: center;
        margin-bottom: 20px;
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
    // width: 70px;
    // height: 70px;
    z-index: 100;
    // background-color: #bb0000;
    // width: 70px;
    // height: 70px;
    height: 100%;
    width: 100%;
}
.side-b {
    // width: 70px;
    // height: 70px;
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

.box-value {
    margin: 20px;
    .value {
        background-color: #ffa53a;
        padding: 5px 10px;
        border-radius: 5px;
        width: fit-content;
        margin: 0 auto;
    }
}

.box-submit {
    margin: 20px;
    .btn-submit {
        background-color: #3eff3a;
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
    height: calc(100% - 341px);
    margin-top: 15px;
    border: 2px solid #d631ff;
    // border-top-left-radius: 10px;
    // border-top-right-radius: 10px;
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
    background: white;
    padding: 30px;
    border: 1px solid #ccc;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.5s forwards;
    border-radius: 10px;
    text-align: center;
    .icon-win {
        color: #ffe500;
        font-size: 22px;
    }
    .icon-lose {
        color: #000000;
        font-size: 22px;
    }
    p {
        color: black;
    }
}

.re-load {
    position: absolute;
    bottom: 3%;
    right: 3%;
}
.btn-close {
    border-radius: 5px;
}
</style>
