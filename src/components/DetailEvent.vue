<template>
    <div class="popup-detail-event" v-if="isDetailEvent">
        <Loading :loading="loading" />
        <div class="box-detail-event">
            <div
                class="banner-event"
                :key="index"
                :style="{
                    backgroundImage: `url(https://qfan-api.qcloud.asia${detailEvent?.attributes?.banner?.data?.attributes?.formats?.small?.url})`,
                }"
            >
                <div class="text-banner">
                    <div class="title-banner">
                        {{ detailEvent?.attributes?.title }}
                    </div>
                    <div class="pool-banner">
                        <div class="text-pool-banner">Frize Pool</div>
                        <div class="number-pool t-primary-color">
                            {{
                                extractNumber(
                                    detailEvent?.attributes?.content?.[0]
                                        ?.children?.[0]?.text
                                )
                            }}
                            <img src="./../../public/assets/logo-quai.svg" />
                        </div>
                    </div>
                    <div class="box-time">
                        <span
                            ><i class="fa-solid fa-clock"></i>
                            {{
                                detailEvent?.attributes?.content?.[1]?.children?.[0]?.text?.replace(
                                    "Time: ",
                                    ""
                                )
                            }}</span
                        >
                    </div>
                </div>
                <div class="btn-banner">
                    <div
                        class="btn-item-banner"
                        :class="{ active: activeButton === 'Predict' }"
                        @click="setActiveButton('Predict')"
                    >
                        Predict
                    </div>
                    <div
                        class="btn-item-banner"
                        :class="{ active: activeButton === 'Leaderboard' }"
                        @click="setActiveButton('Leaderboard')"
                    >
                        Leaderboard
                    </div>
                    <div
                        class="btn-item-banner"
                        :class="{ active: activeButton === 'HistoryReward' }"
                        @click="setActiveButton('HistoryReward')"
                    >
                        History & Reward
                    </div>
                </div>
            </div>

            <div class="list-matches" v-if="activeButton === 'Predict'">
                <div class="box-matches">
                    <div class="matches-item">
                        <div class="matches-title">
                            Day 1: Group Stage - Group A
                        </div>
                        <div class="matches-time">IMG 02:58:23 IMG</div>
                        <div class="matches-bet">
                            <div class="bet-win">WIN</div>
                            <div class="bet-draw">DRAW</div>
                            <div class="bet-lose">LOSE</div>
                        </div>
                        <div class="team-predict">Team Predict</div>
                        <div class="predict-point">
                            <div class="predict-point-content">
                                Predict 200
                                <img src="./../../public/assets/logo.svg" />
                            </div>
                        </div>
                        <div class="point-your t-primary-color">
                            Your Balance: 10000
                            <img src="./../../public/assets/logo.svg" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="list-leaderboard" v-if="activeButton === 'Leaderboard'">
                <div class="box-leaderboard">
                    <div class="leaderboard-item">
                        <div class="content-your-rank">
                            <div class="your-rank-lv position-1">
                                <span>1</span>
                            </div>
                            <div class="avt-your-rank">
                                <img src="./../../public/assets/logo.jpg" />
                            </div>
                            <div class="your-name-point">
                                <div class="your-name">ABCDE</div>
                                <div class="your-point">500.00b</div>
                            </div>
                        </div>
                    </div>
                    <div class="leaderboard-item">
                        <div class="content-your-rank">
                            <div class="your-rank-lv position-2">
                                <span>2</span>
                            </div>
                            <div class="avt-your-rank">
                                <img src="./../../public/assets/logo.jpg" />
                            </div>
                            <div class="your-name-point">
                                <div class="your-name">ABCDE</div>
                                <div class="your-point">500.00b</div>
                            </div>
                        </div>
                    </div>
                    <div class="leaderboard-item">
                        <div class="content-your-rank">
                            <div class="your-rank-lv position-3">
                                <span>3</span>
                            </div>
                            <div class="avt-your-rank">
                                <img src="./../../public/assets/logo.jpg" />
                            </div>
                            <div class="your-name-point">
                                <div class="your-name">ABCDE</div>
                                <div class="your-point">500.00b</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="box-your-rank">
                    <div class="title-your-rank">Your rank</div>
                    <div class="content-your-rank">
                        <div class="your-rank-lv"><span>30</span></div>
                        <div class="avt-your-rank">
                            <img src="./../../public/assets/logo.jpg" />
                        </div>
                        <div class="your-name-point">
                            <div class="your-name">ABCDE</div>
                            <div class="your-point">500.00b</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <EmptyForm v-if="showEmptyDetailEvent" />
    </div>
</template>

<script>
export default {
    props: {
        isDetailEvent: {
            type: Boolean,
            default: false,
        },
        detailEvent: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            loading: false,
            data: [],
            dataFrom: null,
            dataTo: null,
            activeButton: "Predict",
        };
    },
    computed: {
        showEmptyDetailEvent() {
            return this.data?.length == 0;
        },
    },
    methods: {
        extractNumber(text) {
            const regex = /\d{1,3}(?:,\d{3})*/;
            const match = text?.match(regex);
            if (match) {
                return match[0];
            } else {
                return "";
            }
        },
        async fetchData() {
            this.loading = true;
            try {
                const response = await fetch(this.apiUrl);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                this.loading = false;
            }
        },
        setActiveButton(button) {
            this.activeButton = button;
        },
    },
};
</script>

<style>
.popup-detail-event {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    left: 0;
    z-index: 999;
    animation: fadeInDetailEvent 0.1s ease forwards;
    color: #fff;
    background-image: url("./../../public/assets/event/background-event.png");
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

.box-detail-event {
    height: 100%;
    color: #fff;
    font-family: monospace;
}

/* .close-to-event {
} */
.banner-event {
    width: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    position: relative;
}
.btn-banner {
    display: flex;
    bottom: 0;
    position: absolute;
    width: 100%;
    padding: 10px 0;
    background-color: #0d2779;
    font-family: monospace;
    justify-content: space-around;
}
.btn-item-banner.active {
    background: #ffa53a;
    color: white;
}
.btn-item-banner {
    padding: 5px 10px;
    border-radius: 5px;
}
.text-banner {
    padding: 10px 15px 55px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
}
.title-banner {
    font-size: 12px;
    font-family: monospace;
}
.text-pool-banner {
    font-size: 12px;
    font-weight: bold;
}
.number-pool {
    display: flex;
    align-items: center;
    font-size: 16px;
}
.pool-banner img {
    width: 15px;
    margin-left: 5px;
}

.list-matches {
    padding: 10px 20px;
    height: calc(100% - 164px);
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.box-matches {
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scrollbar-width: none;
}
.matches-item {
    text-align: center;
    background-color: #0c2678;
    border-radius: 10px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.matches-bet {
    display: flex;
    justify-content: center;
    gap: 10px;
    font-weight: bold;
}
.bet-win {
    background-color: #04cc00;
    padding: 5px 10px;
    border-radius: 5px;
}
.bet-draw {
    background-color: #f3db00;
    padding: 5px 10px;
    border-radius: 5px;
    color: #760000;
}
.bet-lose {
    background-color: #d40000;
    padding: 5px 10px;
    border-radius: 5px;
}
.team-predict {
    font-weight: bold;
}
.predict-point {
    display: flex;
    justify-content: center;
}
.predict-point img {
    width: 15px;
    height: 15px;
    padding: 0 5px;
}
.predict-point-content {
    background: #ffa53a;
    display: flex;
    padding: 5px 10px;
    border-radius: 5px;
    width: fit-content;
}
.point-your {
    display: flex;
    justify-content: center;
    font-weight: bold;
}
.point-your img {
    width: 15px;
    height: 15px;
    padding: 0 5px;
}

/*  */
.list-leaderboard {
    text-shadow: 1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black,
        -1px 1px 0 black, 1px 0 0 black, -1px 0 0 black, 0 1px 0 black,
        0 -1px 0 black;
}
.box-leaderboard {
    padding: 10px 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.box-your-rank {
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 100%;
    bottom: 0;
    background-color: #ffa53a;
    width: calc(100% - 30px);
    padding: 5px 15px 15px;
}
.title-your-rank {
    font-weight: bold;
    padding-bottom: 5px;
}
.content-your-rank {
    border: 2px solid #557aff;
    padding: 10px 25px;
    border-radius: 10px;
    display: flex;
    gap: 25px;
    background-color: #fff;
    align-items: center;
}

.your-rank-lv {
    background: #ffa53a;
    width: 30px;
    height: 30px;
    position: relative;
    text-align: center;
    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -o-transform: rotate(0eg);
    border-radius: 3px;
}
.your-rank-lv.position-1 {
    background: #c03aff;
}
.your-rank-lv.position-1:before {
    background: #c03aff;
}
.your-rank-lv.position-2 {
    background: #04cc00;
}
.your-rank-lv.position-2:before {
    background: #04cc00;
}
.your-rank-lv.position-3 {
    background: #ff3a3a;
}
.your-rank-lv.position-3:before {
    background: #ff3a3a;
}
.your-rank-lv:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 30px;
    width: 30px;
    background: #ffa53a;
    -webkit-transform: rotate(135deg);
    -moz-transform: rotate(135deg);
    -ms-transform: rotate(135deg);
    -o-transform: rotate(135deg);
    border-radius: 3px;
}
.your-rank-lv span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 18px;
    font-weight: bold;
}
.avt-your-rank img {
    width: 25px;
    height: 25px;
}
.your-name-point {
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-weight: bold;
}
.your-point {
    background-color: #1b3371;
    padding: 3px 5px;
    border-radius: 3px;
}
</style>
