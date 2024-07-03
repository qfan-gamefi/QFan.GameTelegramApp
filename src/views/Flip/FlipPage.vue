<template>
    <div class="wr-flip-page">
        <div class="banner-flip"></div>

        <!-- <div class="wr-btn">
            <div>Flip</div>
            <div>History</div>
        </div> -->

        <div class="box-detail-flip">
            <div>
                <div class="wr-cooldown">
                    <div class="title">Cooldown</div>
                    <div class="time">0:59</div>

                    <div id="coin" :class="flipClass">
                        <div class="side-a"></div>
                        <div
                            class="side-b"
                            :style="{
                                backgroundImage: `url(${urlImg})`,
                            }"
                        ></div>
                    </div>

                    <div class="box-value">
                        <div class="value">200</div>
                    </div>

                    <div class="box-submit">
                        <div class="btn-submit" @click="flipCoin">Submit</div>
                    </div>
                </div>
            </div>

            <div class="wr-history">
                <div class="title">
                    <div class="stt">Opponent</div>
                    <div class="time">Time</div>
                    <div class="status">Status</div>
                    <div class="reward">Reward</div>
                </div>
                <div class="wr-content">
                    <div
                        v-for="(item, index) in dataHistory"
                        :key="index"
                        class="content"
                    >
                        <div class="stt">
                            <div>
                                {{ parseReward(item?.Reward).userName }}
                            </div>
                        </div>

                        <div class="time">
                            {{ formatDateTimeUS(item?.createdAt) }}
                        </div>
                        <div class="status">{{ item?.Status }}</div>
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
                User ID: {{ userId }} Name: {{ fullName }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { formatDateTimeUS } from "@/utils";
import { defineComponent } from "vue";
import { mapState } from "vuex";

export default defineComponent({
    name: "FlipPage",
    props: {
        isDetailEvent: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        ...mapState({
            userId: (state) => state?.userId,
            fullName: (state) => state?.fullName,
        }),
    },
    created() {
        this.getAvt();
        this.history();
    },
    data() {
        return {
            flipClass: "",
            urlImg: "",
            dataHistory: null,
        };
    },
    methods: {
        formatDateTimeUS,
        parseReward(rewardString) {
            if (!rewardString) {
                return { point: 0, qfp: 0, userPhotoUrl: null, userName: "" };
            }

            const rewardData = JSON.parse(rewardString);

            let point = 0;
            let qfp = 0;
            let userPhotoUrl = null;
            let userName = "";

            rewardData.forEach((item) => {
                if (item.ValueType === "Point") {
                    point = item.Value;
                } else if (item.UserName !== undefined) {
                    userName = item.UserName;
                } else {
                    qfp = item.Value;
                }
            });

            return { point, qfp, userPhotoUrl, userName };
        },
        navigateToHome() {
            this.$router.push("/");
        },

        flipCoin() {
            this.handleSubmit();
            const flipResult = Math.random();
            this.flipClass = "";
            setTimeout(() => {
                if (flipResult <= 0.5) {
                    this.flipClass = "heads";
                    console.log("it is head");
                } else {
                    this.flipClass = "tails";
                    console.log("it is tails");
                }
            }, 100);
        },

        async getAvt() {
            try {
                const response = await fetch(
                    `https://253f-171-224-181-129.ngrok-free.app/api/v1/flip/getPlayerFlipInfo?userId=5314337740&domainCode=FLIP_COIN`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "1",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Network response was not ok " + response.statusText
                    );
                }
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
                    `https://253f-171-224-181-129.ngrok-free.app/api/v1/flip/makeflip`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "1",
                        },
                        body: JSON.stringify({
                            gameId: 1,
                            userId: 5314337740, //this.userId
                            userName: "2Awesome", //this.fullName
                            value: 200, //200
                            valueType: "QFP",
                            side: 0,
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Network response was not ok " + response.statusText
                    );
                }
                const data = await response.json();
                const parseData = JSON.parse(data?.message);
                console.log(parseData);
            } catch (error) {
                console.error(
                    "There has been a problem with your fetch operation:",
                    error
                );
            }
        },

        async history() {
            try {
                const response = await fetch(
                    `https://253f-171-224-181-129.ngrok-free.app/api/v1/flip/getPlayerFlip?userId=5314337740&domainCode=FLIP_COIN`,
                    {
                        method: "Get",
                        headers: {
                            "Content-Type": "application/json",
                            "ngrok-skip-browser-warning": "1",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Network response was not ok " + response.statusText
                    );
                }
                const data = await response.json();
                console.log(JSON.parse(data?.message));
                this.dataHistory = JSON.parse(data?.message);
            } catch (error) {
                console.error(
                    "There has been a problem with your fetch operation:",
                    error
                );
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
    height: 11%;
}

.box-detail-flip {
    margin: 15px 20px;
    height: 100%;
}

.wr-cooldown {
    background-color: #500d79;
    height: 100%;
    // border-top-left-radius: 10px;
    // border-top-right-radius: 10px;
    border-radius: 10px;
    border: 2px solid #d631ff;
    .title {
        text-align: center;
        font-size: 20px;
        padding: 20px;
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
    width: 100px;
    height: 100px;
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
        padding: 5px 10px;
        border-radius: 5px;
        width: fit-content;
        margin: 0 auto;
    }
}

.wr-history {
    background-color: #500d79;
    height: 100%;
    margin-top: 15px;
    border: 2px solid #d631ff;
    // border-top-left-radius: 10px;
    // border-top-right-radius: 10px;
    border-radius: 10px;
    .title {
        display: flex;
        text-align: center;
        padding: 5px;
        border-bottom: 1px solid #d631ff;
        margin: 0 5px;
        font-family: monospace;
        font-weight: bold;
        .stt {
            flex: 0 0 30%;
        }
        .time {
            flex: 0 0 20%;
        }
        .status {
            flex: 0 0 20%;
        }
        .reward {
            flex: 0 0 30%;
        }
    }

    .wr-content {
        height: calc(100% - 490px);
        overflow: scroll;

        .content {
            display: flex;
            text-align: center;
            padding: 5px 10px;
            font-size: 11px;
            font-family: monospace;
            align-items: center;
            font-weight: bold;
            .stt {
                flex: 0 0 30%;
                img {
                    width: 30px;
                }
            }
            .time {
                flex: 0 0 20%;
            }
            .status {
                flex: 0 0 20%;
            }
            .reward {
                flex: 0 0 30%;
            }
        }
    }
}
</style>
