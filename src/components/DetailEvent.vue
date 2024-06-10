<template>
    <div class="popup-detail-event" v-if="isDetailEvent">
        <Loading :loading="loading" />
        <div class="box-detail-event">
            <div
                class="banner-event"
                :style="{
                    backgroundImage: `url(https://qfan-api.qcloud.asia${detailEvent?.attributes?.banner?.data?.attributes?.formats?.small?.url})`,
                }"
            >
                <div class="text-banner">
                    <!-- <div class="title-banner">
                        {{ detailEvent?.attributes?.title }}
                    </div> -->
                    <div class="title-item">
                        <div class="event-title-detail">
                            {{ detailEvent?.attributes?.title }}
                        </div>
                        <div class="event-content-detail">
                            {{ detailEvent?.attributes?.description }}
                        </div>
                    </div>
                    <!-- <div class="pool-banner">
                        <div class="text-pool-banner">Prize Pool</div>
                        <div class="number-pool t-primary-color">
                            {{
                                extractNumber(
                                    detailEvent?.attributes?.content?.[0]
                                        ?.children?.[0]?.text
                                )
                            }}
                            <img src="./../../public/assets/logo.svg" />
                        </div>
                    </div> -->
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
                        Match
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
                            getBorderClass(
                                item?.BidSideNames?.split(','),
                                item?.BidData?.Side
                            ),
                            {
                                'matches-item-disable': item?.BidData,
                            },
                        ]"
                    >
                        <div class="matches-title">
                            <div
                                class="matches-title-img"
                                :style="{
                                    backgroundImage: `url( https://qfan-api.qcloud.asia/uploads/${item?.Name?.split(
                                        '-'
                                    )?.[0]?.toUpperCase()}.png)`,
                                }"
                            ></div>
                            {{ item?.Description }}
                            <div
                                class="matches-title-img"
                                :style="{
                                    backgroundImage: `url( https://qfan-api.qcloud.asia/uploads/${item?.Name?.split(
                                        '-'
                                    )?.[1]?.toUpperCase()}.png)`,
                                }"
                            ></div>
                        </div>
                        <div class="matches-time">
                            {{ getTimeRemaining(item?.StopBiddingTime) }}
                        </div>

                        <div class="box-btn-bet">
                            <div
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
                                <div @click="handleSelectBid(index, indexSide)">
                                    <div>{{ side }}</div>
                                    <div>
                                        [1:{{
                                            item?.RateData?.[
                                                indexSide
                                            ]?.toFixed(2)
                                        }}]
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- <div class="team-predict">Team Predict</div> -->
                        <div class="predict-point">
                            <div
                                @click="handlePredict(item, index)"
                                :class="[
                                    'predict-point-content',
                                    // {
                                    //     'predict-point-disabled':
                                    //         typeof item?.selectedIndex !==
                                    //         'number',
                                    // },
                                    {
                                        'btn-predict-disable': item?.BidData,
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
                                <div
                                    class="lv-img"
                                    :style="{
                                        backgroundImage: `url(${
                                            item?.UserPhotoUrl ||
                                            './../../public/assets/logo.svg'
                                        })`,
                                    }"
                                ></div>
                                <!-- <img src="./../../public/assets/logo.jpg" /> -->
                            </div>
                            <div class="your-name-point">
                                <div class="your-name">
                                    {{ item?.UserName || item?.UserId }}
                                </div>
                                <div class="your-point">
                                    {{ item?.Balance }}
                                </div>
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
                        <div
                            class="lv-img"
                            :style="{
                                backgroundImage: `url(${
                                    dataRankCurrent?.UserPhotoUrl ||
                                    './../../public/assets/logo.svg'
                                })`,
                            }"
                        ></div>
                        <!-- <img src="./../../public/assets/logo.jpg" /> -->
                    </div>
                    <div class="your-name-point">
                        <div class="your-name">
                            {{
                                dataRankCurrent?.UserName ||
                                dataRankCurrent?.UserId
                            }}
                        </div>
                        <div class="your-point">
                            {{ dataRankCurrent?.Balance }}
                        </div>
                    </div>
                </div>
            </div>

            <div class="list-history" v-if="activeButton === 'HistoryReward'">
                <div class="box-history">
                    <div class="box-title-columns">
                        <div class="title-columns">No.</div>
                        <div class="title-columns">Match</div>
                        <div class="title-columns">Predict</div>
                        <div class="title-columns">Time</div>
                        <div class="title-columns">Profit</div>
                    </div>

                    <div
                        class="history-item"
                        v-for="(item, index) in history"
                        :key="index"
                    >
                        <div class="history-item-col">
                            {{ index + 1 }}
                        </div>
                        <div class="history-item-col">
                            <div
                                class="match"
                                :class="item?.Status?.toLowerCase()"
                            >
                                {{ item?.Status }}
                            </div>
                            <div>{{ item?.Game?.Name }}</div>
                        </div>
                        <div class="history-item-col">
                            {{ renderSide(item) }}
                        </div>
                        <div class="history-item-col">
                            {{ formatDate(item.createdAt) }}
                        </div>
                        <div class="history-item-col">
                            <div
                                v-if="
                                    item?.Status?.toLowerCase() === 'win' ||
                                    item?.Status?.toLowerCase() === 'lose'
                                "
                            >
                                <div>
                                    {{ renderProfitQFC(item) }}
                                    <img src="./../../public/assets/logo.svg" />
                                </div>
                                <div>
                                    {{ renderProfitPoint(item) }}
                                </div>
                            </div>
                            <div v-else>
                                <div>Waiting</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <EmptyForm v-if="showEmptyDetailEvent" />

        <Notification
            v-if="showNotification"
            :message="notificationMessage"
            :type="notificationType"
            @close="showNotification = false"
        />

        <PopupConfirm
            v-if="showPopup"
            :text="`Do you want Predict`"
            :visible="showPopup"
            @yes="handleYesPredict"
            @no="handleNoPredict"
        />
    </div>
</template>

<script lang="ts">
import betService from "../services/betService";
import Notification from "./NotificationToast.vue";
import PopupConfirm from "./PopupConfirm.vue";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import EmptyForm from "./EmptyForm.vue";
import { IEvent } from "../interface";

dayjs.extend(duration);

export default {
    components: {
        Notification,
        PopupConfirm,
        EmptyForm,
    },
    props: {
        isDetailEvent: {
            type: Boolean,
            default: false,
        },
        detailEvent: {
            type: Object as () => IEvent,
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
            showPopup: false,
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

            showNotification: false,
            notificationMessage: "",
            notificationType: "",

            idPredict: null,
            indexPredict: null,

            stopBiddingTime: "",
            countdown: "",
            intervalId: null,
        };
    },
    watch: {
        detailEvent: "fetchData",
    },
    async mounted() {
        await this.fetchData();
        // this.intervalId = setInterval(this.updateCountdowns, 1000);
    },
    // beforeUnmount() {
    //     clearInterval(this.intervalId);
    // },
    computed: {
        showEmptyDetailEvent() {
            return this.data?.length == 0;
        },
    },
    methods: {
        async renderSuccess() {
            this.notificationMessage = `Predict Success!`;
            this.notificationType = "success";
            this.showNotification = true;
        },
        async renderErr() {
            this.notificationMessage = `Predict Error!`;
            this.notificationType = "error";
            this.showNotification = true;
        },
        async renderWarning() {
            this.notificationMessage = `Choose your side!`;
            this.notificationType = "warning";
            this.showNotification = true;
            setTimeout(() => {
                this.showNotification = false;
            }, 1000);
        },
        calcSide(data) {
            const bidSideNamesArray = data?.Game?.BidSideNames.split(",");
            return bidSideNamesArray?.[data?.Side];
        },
        renderSide(item) {
            return this.calcSide(item);
            // const bidSideNamesArray = item.Game.BidSideNames.split(",");
            // return bidSideNamesArray?.[item?.Side];
        },
        renderProfitPoint(value) {
            const dataPoint = JSON.parse(value?.Reward);

            const qfcItem = dataPoint?.find(
                (item) => item?.ValueType === "Point"
            );
            const qfcValue = qfcItem?.Value
                ? `${Math?.floor(qfcItem?.Value)} ${qfcItem?.ValueType}`
                : "";

            return qfcValue;
        },
        renderProfitQFC(item) {
            const dataQFC = JSON.parse(item?.Reward);
            const qfcItem = dataQFC?.find((item) => item?.ValueType === "QFC");
            const qfcValue = qfcItem ? Math?.floor(qfcItem?.Value) : null;

            return qfcValue;
        },
        getBorderClass(side, index) {
            const lowCase = side?.[index]?.toLowerCase();
            return `border-${lowCase}`;
        },
        getDynamicClass(side) {
            return `bet-${side?.toLowerCase()}`;
        },
        formatDate(date) {
            return dayjs(date).format("DD-MMM-YY");
        },
        updateCountdowns() {
            this.$forceUpdate();
        },
        getTimeRemaining(stopBiddingTime) {
            const now = dayjs();
            const endTime = dayjs(stopBiddingTime);
            const diff = endTime?.diff(now);

            if (diff <= 0) {
                return "End time";
            }

            const duration = dayjs?.duration(diff);
            const days = duration?.days();
            const hours = duration?.hours();
            const minutes = duration?.minutes();
            const seconds = duration.seconds();

            return `${days}d ${hours}h ${minutes}m `;
        },
        handleSelectBid(itemIndex, sideIndex) {
            // item["selectedSide"] = index;
            // this.selectedIndex = index;
            this.games[itemIndex].selectedIndex = sideIndex;
        },
        handlePredict(item, index) {
            const isShow = typeof item?.selectedIndex === "number";
            if (isShow) {
                this.idPredict = item?.id;
                this.indexPredict = index;
                this.showPopup = true;
            } else {
                this.renderWarning();
            }
        },
        async callPredict() {
            if (
                typeof this.games[this.indexPredict].selectedIndex === "number"
            ) {
                const dataTele = window.Telegram.WebApp.initDataUnsafe?.user;
                const nameTele = `${dataTele.first_name} ${dataTele.last_name}`;

                const data = {
                    gameId: this.idPredict,
                    userId: this.idUser,
                    value: 200,
                    valueType: "QFC",
                    // side: item["selectedSide"],
                    side: this.games[this.indexPredict].selectedIndex,
                    userName: nameTele,
                };
                const dataPredict = await betService.addBidding(data);

                if (dataPredict?.bid) {
                    await this.renderSuccess();
                    await this.fetchData();
                } else {
                    await this.renderErr();
                    await this.fetchData();
                }
            } else {
                alert("Choose your side");
            }
        },
        handleYesPredict() {
            this.showPopup = false;
            this.callPredict();
        },
        handleNoPredict() {
            this.showPopup = false;
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

                console.log(dataRankCurrent);

                if (dataRankCurrent?.length > 0) {
                    this.dataRankCurrent = dataRankCurrent?.[0];
                } else {
                    this.dataRankCurrent = {
                        Balance: 0,
                        UserId: this.idUser,
                        rank: "?",
                    };
                }

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
    padding: 7px 0;
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
    cursor: pointer;
}

.text-banner {
    padding: 10px 15px 55px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 15px;
}

.title-banner {
    font-size: 24px;
    font-family: monospace;
    color: #ff0000;
    text-shadow: 1px 1px 1px white;
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
    height: calc(100% - 280px);
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
.box-matches::-webkit-scrollbar {
    display: none;
}

.matches-title {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}
.matches-title-img {
    width: 25px;
    height: 25px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
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
/* .border-draw {
    border: 5px solid #f3db00;
    border-top: none;
    border-bottom: none;
} */
.bet-info-value.win {
    color: #04cc00;
}
/* .border-win {
    border: 5px solid #04cc00;
    border-top: none;
    border-bottom: none;
} */
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
    cursor: pointer;
    /* width: min-content; */
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
    cursor: pointer;
    background: #ffa53a;
    display: flex;
    padding: 5px 10px;
    border-radius: 5px;
    width: fit-content;
}
.predict-point-disabled {
    /* pointer-events: none; */
    opacity: 0.5;
}
.btn-predict-disable {
    pointer-events: none;
    background: rgb(80 80 80);
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
    scrollbar-width: none;
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
.lv-img {
    width: 30px;
    height: 30px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    border-radius: 50%;
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
    min-width: 90px;
    max-width: 90px;
}

.list-history {
    padding: 10px;
    height: calc(100% - 280px);
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.box-history {
    background-color: #0c2678;
    padding: 10px;
    border-radius: 10px;
    height: 100%;
    overflow: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.box-history::-webkit-scrollbar {
    display: none;
}
.box-title-columns {
    display: flex;
    font-size: 12px;
    font-weight: bold;
    padding: 10px 0;
    border-bottom: 1px solid #fff;
}
.title-columns {
    text-align: center;
}
.title-columns:nth-child(1) {
    /* flex: 0 0 4%; */
    width: 8%;
}
.title-columns:nth-child(n + 2) {
    /* flex: 0 0 24%; */
    width: 23%;
}

.history-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #ffffff5c;
    font-size: 11px;
}
/* .history-item:last-child {
    border-bottom: none;
} */
.history-item-col {
    text-align: center;
}
.history-item-col:nth-child(1) {
    width: 8%;
}
.history-item-col:nth-child(n + 2) {
    width: 23%;
}
.history-item-col img {
    width: 10px;
}

.match {
    font-weight: bold;
}
.match.lose {
    color: #d40000;
}
.match.new {
    color: #f3fb02;
}
.match.win {
    color: #04cc00;
}
.match.placed {
    color: #ffa53a;
}
.match.pending {
    color: #ffa53a;
}

.title-item {
    font-weight: bold;
}
.event-title-detail {
    font-size: 24px;
    color: #ff0000;
    text-shadow: 1px 1px 1px white;
}
.event-content-detail {
    margin-left: 2px;
}
</style>
