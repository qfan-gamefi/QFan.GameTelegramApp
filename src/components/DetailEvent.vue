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
                    <div class="box-time">
                        <span>Your Points:{{ this.userPoint }}</span>
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
                    <div
                        v-for="(item, index) in games"
                        :key="index"
                        :class="[
                            'matches-item',
                            {
                                'matches-item-disable': item?.BidData,
                            },
                        ]"
                    >
                        <div class="matches-title">
                            {{ item?.Description }}
                        </div>
                        <div class="matches-time">
                            {{ getTimeRemaining(item?.StopBiddingTime) }}
                        </div>

                        <div class="box-btn-bet">
                            <v-btn-toggle
                                v-for="(
                                    side, indexSide
                                ) in item?.BidSideNames?.split(',')"
                                :key="indexSide"
                                :class="[
                                    getDynamicClass(side),
                                    {
                                        selected:
                                            item?.selectedIndex === indexSide ||
                                            item?.BidData?.Side === indexSide,
                                    },
                                ]"
                            >
                                <v-btn
                                    @click="handleSelectBid(index, indexSide)"
                                    >{{ side }}</v-btn
                                >
                            </v-btn-toggle>
                        </div>

                        <!-- <div class="team-predict">Team Predict</div> -->
                        <div class="predict-point">
                            <div
                                @click="handleJoin(item, index)"
                                :class="[
                                    'predict-point-content',
                                    {
                                        'predict-point-disabled':
                                            typeof item?.selectedIndex !==
                                            'number',
                                    },
                                ]"
                            >
                                Predict 200
                                <img src="./../../public/assets/logo.svg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="list-leaderboard" v-if="activeButton === 'Leaderboard'">
                <div
                    class="box-leaderboard"
                    v-for="(item, index) in leaderboard"
                    :key="index"
                >
                    <div class="leaderboard-item">
                        <div class="content-your-rank">
                            <div
                                class="your-rank-lv"
                                :class="'position-' + (index + 1)"
                            >
                                <span>{{ index + 1 }}</span>
                            </div>
                            <div class="avt-your-rank">
                                <img src="./../../public/assets/logo.jpg" />
                            </div>
                            <div class="your-name-point">
                                <div class="your-name">{{ item.UserId }}</div>
                                <div class="your-point">{{ item.Balance }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="box-your-rank" v-if="activeButton === 'Leaderboard'">
                <div class="title-your-rank">Your rank</div>
                <div class="content-your-rank">
                    <div class="your-rank-lv">
                        <span>{{ dataRankCurrent?.rank }}</span>
                    </div>
                    <div class="avt-your-rank">
                        <img src="./../../public/assets/logo.jpg" />
                    </div>
                    <div class="your-name-point">
                        <div class="your-name">
                            {{ dataRankCurrent?.UserId }}
                        </div>
                        <div class="your-point">
                            {{ dataRankCurrent?.Balance }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="list-matches" v-if="activeButton === 'HistoryReward'">
                <div class="box-matches">
                    <div
                        class="matches-item"
                        v-for="(item, index) in history"
                        :key="index"
                    >
                        <div class="bet-info">
                            <div class="bet-info-row">
                                <div class="bet-info-label">
                                    {{ item?.Game?.ListCode }}:
                                </div>
                                <div class="bet-info-value">
                                    {{ item?.Game?.Name }}
                                </div>
                            </div>
                            <div class="bet-info-row">
                                <div class="bet-info-label">Bet day:</div>
                                <div class="bet-info-value">
                                    {{ formatDate(item.createdAt) }}
                                </div>
                            </div>
                            <div class="bet-info-row">
                                <div class="bet-info-label">Side:</div>
                                <div
                                    class="bet-info-value"
                                    :class="renderSide(item).toLowerCase()"
                                >
                                    {{ renderSide(item) }}
                                </div>
                            </div>

                            <div class="bet-info-row">
                                <div class="bet-info-label">Value:</div>
                                <div class="bet-info-value">
                                    {{ item.Value }} {{ item.ValueType }}
                                </div>
                            </div>
                            <div class="bet-info-row">
                                <div class="bet-info-label">Status:</div>
                                <div class="bet-info-value">
                                    {{ item.Status }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <EmptyForm v-if="showEmptyDetailEvent" />
    </div>
</template>

<script>
import betService from "../services/betService";
import dayjs from "dayjs";

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
        idUser: {
            type: String,
            required: true,
        },
        visible: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            loading: false,
            data: [],
            dataFrom: null,
            dataTo: null,
            activeButton: "Predict",
            games: [],
            leaderboard: [],
            history: [],
            indexBtn: null,
            userPoint: 0,
            selectedIndex: null,
            dataRankCurrent: null,
        };
    },
    watch: {
        detailEvent: "fetchData",
    },
    async mounted() {
        await this.fetchData();
    },
    computed: {
        showEmptyDetailEvent() {
            return this.data?.length == 0;
        },
    },
    methods: {
        renderSide(item) {
            const bidSideNamesArray = item.Game.BidSideNames.split(",");

            return bidSideNamesArray?.[item?.Side];
        },
        getDynamicClass(side) {
            return `bet-${side.toLowerCase()}`;
        },
        formatDate(date) {
            return dayjs(date).format("DD/MM/YYYY");
        },
        getTimeRemaining(stopBiddingTime) {
            const now = dayjs();
            const endTime = dayjs(stopBiddingTime);
            const diff = endTime.diff(now);

            if (diff <= 0) {
                return "End time";
            }

            const duration = dayjs.duration(diff);
            const days = duration.days();
            const hours = duration.hours();
            const minutes = duration.minutes();

            return `${days} day ${hours} hour ${minutes} minute`;
        },
        handleSelectBid(itemIndex, sideIndex) {
            // item["selectedSide"] = index;
            // this.selectedIndex = index;
            this.games[itemIndex].selectedIndex = sideIndex;
        },
        async handleJoin(item, index) {
            if (typeof this.games[index].selectedIndex === "number") {
                const data = {
                    gameId: item.id,
                    userId: this.idUser,
                    value: 200,
                    valueType: "QFC",
                    // side: item["selectedSide"],
                    side: this.games[index].selectedIndex,
                };
                const dataPredict = await betService.addBidding(data);
                if (dataPredict?.bid) {
                    await this.fetchData();
                }
            } else {
                alert("Choose your side");
            }
        },
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

            if (!this.detailEvent) return;
            try {
                const games = await betService.getListGame(
                    this.idUser,
                    this.detailEvent
                );

                // const games = await betService.getFilterData("games", {});
                this.games = games.map((game) => ({
                    ...game,
                    selectedIndex: null,
                }));

                this.leaderboard = await betService.getFilterData(
                    "balancePoints",
                    { order: [["Balance", "DESC"]] }
                );

                this.history = await betService.getFilterData("bids", {
                    where: { UserId: this.idUser },
                    order: [["createdAt", "DESC"]],
                    include: "Games",
                });

                const userPointdata = await betService.getFilterData(
                    "balancePoints",
                    { where: { UserId: this.idUser } }
                );

                const dataRankCurrent = await betService.getYourRank(
                    this.idUser,
                    this.detailEvent
                );
                this.dataRankCurrent = dataRankCurrent?.[0];

                this.userPoint =
                    userPointdata && userPointdata.length != 0
                        ? userPointdata[0]["Balance"]
                        : 0;
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                this.loading = false;
            }
        },
        setActiveButton(button) {
            this.activeButton = button;
            this.games = this.games?.map((game) => ({
                ...game,
                selectedIndex: null,
            }));
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
    gap: 5px;
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
    height: calc(100% - 270px);
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
    -ms-overflow-style: none;
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
.matches-item-disable {
    pointer-events: none;
    opacity: 0.8;
}
.bet-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.bet-info-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px solid #81818147;
    gap: 30px;
}
.bet-info-row:last-child {
    border-bottom: none;
}
.bet-info-label {
    font-weight: bold;
    flex: 1;
    text-align: right;
}

.bet-info-value {
    flex: 1;
    text-align: left;
    font-weight: bold;
}
.bet-info-value.lose {
    color: #d40000;
}
.bet-info-value.draw {
    color: #f3db00;
}
.bet-info-value.win {
    color: #04cc00;
}

.matches-bet {
    display: flex;
    justify-content: center;
    gap: 10px;
    font-weight: bold;
}

.box-btn-bet {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.bet-win,
.bet-draw,
.bet-lose {
    width: min-content;
    padding: 5px 15px;
    border-radius: 5px;
    background-color: rgb(80 80 80);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.bet-win.selected {
    background-color: #04cc00;
    transition: background-color 0.3s ease;
}
.bet-draw.selected {
    background-color: #f3db00;
    color: #760000;
    transition: background-color 0.3s ease, color 0.3s ease;
}
.bet-lose.selected {
    background-color: #d40000;
    transition: background-color 0.3s ease;
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
.predict-point-disabled {
    pointer-events: none;
    opacity: 0.5;
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
    padding: 10px 20px;
    height: calc(100% - 375px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-shadow: 1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black,
        -1px 1px 0 black, 1px 0 0 black, -1px 0 0 black, 0 1px 0 black,
        0 -1px 0 black;
    overflow: auto;
}
.list-leaderboard::-webkit-scrollbar {
    display: none;
}

.box-leaderboard {
    /* padding: 10px 15px;
    display: flex;
    flex-direction: column;
    gap: 10px; */
}

.box-your-rank {
    display: flex;
    flex-direction: column;
    position: absolute;
    width: 100%;
    bottom: 80px;
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
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
        1px 1px 0 #000;
}

.your-point {
    background-color: #1b3371;
    padding: 3px 5px;
    border-radius: 3px;
}
</style>
