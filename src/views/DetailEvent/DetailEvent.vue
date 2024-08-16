<template>
    <div class="popup-detail-event" v-if="isDetailEvent">
        <Loading :loading="loading" />
        <div class="box-detail-event">
            <div class="banner-event" :style="{
                backgroundImage: `url(${apiBaseUrl}${detailEvent?.attributes?.banner?.data?.attributes?.formats?.small?.url})`,
            }">
                <div class="text-banner">
                    <div class="title-item">
                        <div class="event-title-detail">
                            {{ detailEvent?.attributes?.title }}
                        </div>
                        <div class="event-content-detail">
                            {{ detailEvent?.attributes?.description }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="btn-banner">
                <div v-for="(button, index) in buttonsBanner" :key="index" class="btn-item-banner"
                    :class="{ active: activeButton === button?.name }" @click="setActiveButton(button?.name)">
                    {{ button.label }}
                </div>
            </div>

            <div class="list-matches" v-if="activeButton === 'Predict'">
                <div class="box-matches">
                    <div v-for="(item, index) in games" :key="index" :class="[
                        'matches-item',
                        getBorderClass(
                            item?.BidSideNames?.split(','),
                            item?.BidData?.Side
                        ),
                        {
                            'matches-item-disable': item?.BidData,
                        },
                    ]">
                        <div class="matches-time">
                            <div class="time-start">
                                {{ getTimeRemaining(item?.StopBiddingTime) }}
                            </div>
                            <div class="time-end" v-if="
                                item?.CloseCountDown &&
                                item?.CloseCountDown !== -1
                            ">
                                Close in:
                                <CountDown :countDownValue="item?.CloseCountDown" />
                            </div>
                        </div>

                        <div class="matches-title">
                            <div class="matches-title-img" :style="{
                                backgroundImage: `url(${apiBaseUrl}/uploads/${item?.Name?.split(
                                    '-'
                                )?.[0]?.toUpperCase()}.PNG)`,
                            }"></div>
                            {{ item?.Description }}
                            <div class="matches-title-img" :style="{
                                backgroundImage: `url(${apiBaseUrl}/uploads/${item?.Name?.split(
                                    '-'
                                )?.[1]?.toUpperCase()}.PNG)`,
                            }"></div>
                        </div>

                        <div class="box-btn-predict" 
                            :class="{
                            disable: !item?.CloseCountDown,
                            }"
                        >
                            <div v-for="(side, indexSide) in item?.BidSideNames?.split(',')" :key="indexSide" :class="[
                                    // getDynamicClass(side),
                                    'team',
                                    {
                                        selected:
                                            item?.selectedIndex === indexSide ||
                                            item?.BidData?.Side === indexSide,
                                    },
                                ]">
                                <div @click="handleSelectBid(index, indexSide)">
                                    <div>{{ side }}</div>
                                    <div v-if="item?.RateData?.[indexSide] !== 0">
                                        {{ renderRate(item, indexSide) }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="predict-point">
                            <div class="slider-container" v-if="!item?.['GameTemplate.DefaultBidValue']">
                           
                                <input type="range" 
                                    :min="handleMinValue(item?.['GameTemplate.ExtraData'])"
                                    :max="handleMaxValue(item?.['GameTemplate.ExtraData'])" 
                                    :step="stepValue"
                                    :value="sliderValue[index]" 
                                    @input="handleSliderInput($event, index)" 
                                    :class="[
                                        'slider',
                                        {
                                            'btn-predict-disable': item?.BidData || !item?.CloseCountDown,
                                        },
                                    ]" />
                            </div>

                            <div @click="handlePredict(item, index)" 
                                :class="[
                                'predict-point-content',
                                {
                                    'btn-predict-disable': item?.BidData || !item?.CloseCountDown,
                                },
                            ]">

                                <div>Predict&nbsp;</div>
                                <div v-if="item?.['GameTemplate.DefaultBidValue']"> {{ item?.["GameTemplate.DefaultBidValue"] }}</div>
                                <div v-else>{{ sliderValue[index] }}</div>
                                <img src="./../../../public/assets/logo.svg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="list-leaderboard" v-if="activeButton === 'Leaderboard'">
                <div class="box-leaderboard" v-for="(item, index) in leaderboard" :key="index">
                    <div class="leaderboard-item">
                        <div class="content-your-rank">
                            <div class="your-rank-lv" :class="'position-' + (index + 1)">
                                <span>{{ index + 1 }}</span>
                            </div>
                            <div class="avt-your-rank">
                                <div v-if="item?.UserPhotoUrl" class="lv-img" :style="{
                                    backgroundImage: `url(${item?.UserPhotoUrl})`,
                                }"></div>
                                <img v-if="!item?.UserPhotoUrl" src="./../../../public/assets/logo.jpg" />
                            </div>
                            <div class="your-name-point">
                                <div class="your-name">
                                    {{ item?.UserName || item?.UserId }}
                                </div>
                                <div class="your-point">
                                    Point: {{ item?.Balance }} <br />
                                    QFP: {{ item?.QFP_VALUE || 0 }}
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
                        <div v-if="dataRankCurrent?.UserPhotoUrl" class="lv-img" :style="{
                            backgroundImage: `url(${dataRankCurrent?.UserPhotoUrl})`,
                        }" />
                        <img v-if="!dataRankCurrent?.UserPhotoUrl" src="./../../../public/assets/logo.jpg" />
                    </div>
                    <div class="your-name-point">
                        <div class="your-name">
                            {{
                                `${dataTelegram?.user?.first_name} ${dataTelegram?.user?.last_name}` ||
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

                    <div class="history-item" v-for="(item, index) in history" :key="index">
                        <div class="history-item-col">
                            {{ index + 1 }}
                        </div>
                        <div class="history-item-col">
                            <div class="match" :class="item?.Status?.toLowerCase()">
                                {{ item?.Status }}
                            </div>
                            <div>{{ item?.Game?.Name }}</div>
                        </div>
                        <div class="history-item-col">
                            {{ renderSide(item) }}
                        </div>
                        <div class="history-item-col">
                            {{ formatDateToDDMMMYY(item.createdAt) }}
                        </div>
                        <div class="history-item-col">
                            <div v-if="
                                item?.Status?.toLowerCase() === 'win' ||
                                item?.Status?.toLowerCase() === 'lose'
                            ">
                                <div>
                                    {{ renderProfitQFP(item) }}
                                    <img src="./../../../public/assets/logo.svg" />
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

        <Notification v-if="showNotification" :message="notificationMessage" :type="notificationType"
            @close="showNotification = false" />

        <PopupConfirm v-if="showPopup" :text="`Do you want Predict`" :visible="showPopup" @yes="handleYesPredict"
            @no="handleNoPredict" />
    </div>
</template>

<script lang="ts">
import predictService from "../../services/predictService";
import Notification from "../../components/NotificationToast.vue";
import PopupConfirm from "../../components/PopupConfirm.vue";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import EmptyForm from "../../components/EmptyForm.vue";
import { IEvent, IGameExtraData } from "../../interface";
import CountDown from "../../components/count-down/CountDown.vue";
import { formatDateToDDMMMYY } from "../../utils";

dayjs.extend(duration);

export default {
    components: {
        Notification,
        PopupConfirm,
        EmptyForm,
        CountDown,
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
        dataQPoint: {
            type: Object,
            required: true,
        },
    },
    data() {
        
        return {
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
            dataTelegram: null,
            showPopup: false,
            loading: false,
            data: [],
            dataFrom: null,
            dataTo: null,
            activeButton: "Predict",
            buttonsBanner: [
                { name: "Predict", label: "Match" },
                { name: "Leaderboard", label: "Leaderboard" },
                { name: "HistoryReward", label: "History & Reward" },
            ],
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
            bidValue: null,

            stepValue: 50,
            sliderValue: [] as number[],
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
        formatDateToDDMMMYY,
        async renderNotification(message, type) {
            this.notificationMessage = message;
            this.notificationType = type;
            this.showNotification = true;
            setTimeout(() => {
                this.showNotification = false;
            }, 1000);
        },
        async renderSuccess() {
            this.renderNotification("Predict Success!", "success");
        },
        async renderErr() {
            this.renderNotification("Predict Error!", "error");
        },
        async renderWarning(mess) {
            this.renderNotification(mess, "warning");
        },
        calcSide(data) {
            const bidSideNamesArray = data?.Game?.BidSideNames.split(",");
            return bidSideNamesArray?.[data?.Side];
        },
        renderSide(item) {
            return this.calcSide(item);
        },
        renderProfitPoint(value) {
            const dataPoint = JSON.parse(value?.Reward);

            const qfcItem = dataPoint?.find(
                (item) => item?.ValueType?.toLowerCase() === "point"
            );
            const qfcValue = qfcItem?.Value
                ? `${Math?.floor(qfcItem?.Value)} ${qfcItem?.ValueType}`
                : "";

            return qfcValue;
        },
        renderProfitQFP(item) {
            const dataQFC = JSON.parse(item?.Reward);
            const qfcItem = dataQFC?.find(
                (item) => item?.ValueType?.toLowerCase() !== "point"
            );

            const qfcValue = qfcItem ? Math?.floor(qfcItem?.Value) : null;

            return qfcValue;
        },
        getBorderClass(side, index) {
            const lowCase = side?.[index]?.toLowerCase();
            return `border-${lowCase}`;
        },
        getDynamicClass(side) {
            return `team-${side?.toLowerCase()}`;
        },
        updateCountdowns() {
            this.$forceUpdate();
        },
        renderTimeClose(time) {
            if (!time || time === -1) {
                return "";
            } else {
                return ``;
            }
        },
        getTimeRemaining(stopBiddingTime) {
            return dayjs(stopBiddingTime).format("DD.MM.YYYY, HH:mm");
        },
        handleSelectBid(itemIndex, sideIndex) {
            this.games[itemIndex].selectedIndex = sideIndex;
        },
        handlePredict(item, index) {
            const isShow = typeof item?.selectedIndex === "number";
            this.bidValue = item?.["GameTemplate.DefaultBidValue"];

            if (isShow) {
                this.idPredict = item?.id;
                this.indexPredict = index;
                this.showPopup = true;
            } else {
                this.renderWarning("Choose your side!");
            }
        },
        async callPredict() {
            const balance = Number(this.dataQPoint?.balance);

            if (balance < this.bidValue) {
                return this.renderWarning("Insufficient QFP!");
            }

            if (
                typeof this.games[this.indexPredict].selectedIndex === "number"
            ) {
                const dataTele = this.dataTelegram?.user;
                const nameTele = `${dataTele.first_name} ${dataTele.last_name}`;

                const valueBid = this.games[this.indexPredict]?.["GameTemplate.DefaultBidValue"] || this.sliderValue[this.indexPredict]                
                
                const data = {
                    gameId: this.idPredict,
                    userId: this.idUser,
                    value: valueBid,
                    valueType: this.games[this.indexPredict]?.["GameTemplate.ValueType"],
                    side: this.games[this.indexPredict]?.selectedIndex,
                    userName: nameTele
                };

                const dataPredict = await predictService.addBidding(data);

                if (dataPredict?.bid) {
                    this.bidValue = null;
                    await this.renderSuccess();
                    await this.fetchData();
                } else {
                    await this.renderErr();
                    await this.fetchData();
                }
            }
        },
        handleYesPredict() {
            this.showPopup = false;
            this.callPredict();
        },
        handleNoPredict() {
            this.showPopup = false;
        },
        renderRate(item, indexSide) {
            const returnRate = item?.["GameTemplate.ReturnRate"];
            const rateIndex = item?.RateData?.[indexSide];
            return ((returnRate * rateIndex) / 100).toFixed(2);
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
            this.dataTelegram = window.Telegram.WebApp.initDataUnsafe;

            if (!this.detailEvent) return;
            try {
                const games = await predictService.getListGame(
                    this.idUser,
                    this.detailEvent
                );

                this.games = games.map((game) => {
                    return {
                        ...game,
                        selectedIndex: null,
                    };
                });                
                
                this.sliderValue = this.games?.map((item) => {
                    if(item?.BidData?.Value){
                        return item?.BidData?.Value
                    }
                    this.handleMedium(item?.['GameTemplate.ExtraData'])
                });

                this.leaderboard = await predictService.getLeaderBoard(
                    this.detailEvent?.attributes?.domainCode
                );                

                this.history = await predictService.getFilterData("bids", {
                    where: {
                        UserId: this.idUser,
                        "$Game.ListCode$":
                            this.detailEvent?.attributes?.listingCode,
                    },
                    order: [["createdAt", "DESC"]],
                    include: "Games",
                });

                const userPointdata = await predictService.getFilterData(
                    "balancePoints",
                    { where: { UserId: this.idUser } }
                );

                const dataTele = this.dataTelegram?.user;
                const nameTele = `${dataTele.first_name} ${dataTele.last_name}`;
                const dataRankCurrent = await predictService.getYourRank(
                    this.idUser,
                    this.detailEvent,
                    nameTele
                );

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
        handleMedium(extraData){
            const gameExtraData: IGameExtraData = JSON.parse(extraData)
            return (gameExtraData?.Min + gameExtraData?.Max) / 2
        },
        handleMinValue(extraData) {
            const gameExtraData: IGameExtraData = JSON.parse(extraData)
            return gameExtraData?.Min || 200
        },
        handleMaxValue(extraData) {
            const gameExtraData: IGameExtraData = JSON.parse(extraData)
            return gameExtraData?.Max || 2000
        },
        handleSliderInput(event, index) {
            const value = Number(event.target.value);
            this.sliderValue[index] = value
        },
    },
};
</script>

<style scoped>
.popup-detail-event {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    left: 0;
    z-index: 1000;
    animation: fadeInDetailEvent 0.1s ease forwards;
    color: #fff;
    background-image: url("./../../../public/assets/event/background-event.png");
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
    /* height: 17vh; */
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    position: relative;
}

.btn-banner {
    display: flex;
    /* bottom: 0;
    position: absolute; */
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
    gap: 10px;
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
    height: calc(100% - 270px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fadeIn 0.3s ease forwards;
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

.matches-time {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    font-size: 10px;
}

.matches-title {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    font-weight: bold;
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
    gap: 15px;
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

.box-btn-predict {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.box-btn-predict.disable {
    pointer-events: none;
    opacity: 0.5;
}

.team-win,
.team-draw,
.team-lose {
    cursor: pointer;
    padding: 5px 15px;
    border-radius: 5px;
    background-color: rgb(80 80 80);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.team-win.selected {
    background-color: #04cc00;
    transition: background-color 0.3s ease;
}

.team-draw.selected {
    background-color: #f3db00;
    color: #760000;
    transition: background-color 0.3s ease, color 0.3s ease;
}

.team-lose.selected {
    background-color: #d40000;
    transition: background-color 0.3s ease;
}

.team {
    cursor: pointer;
    padding: 5px 15px;
    border-radius: 5px;
    background-color: rgb(80 80 80);
    transition: background-color 0.3s ease, color 0.3s ease;
}

.team.selected {
    background-color: #04cc00;
    transition: background-color 0.3s ease;
}

.team-predict {
    font-weight: bold;
}

.predict-point {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
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
    opacity: 0.5;
    /* background: rgb(80 80 80); */
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
    height: calc(100% - 320px);
    display: flex;
    flex-direction: column;
    gap: 5px;
    text-shadow: 1px 1px 0 black, -1px -1px 0 black, 1px -1px 0 black,
        -1px 1px 0 black, 1px 0 0 black, -1px 0 0 black, 0 1px 0 black,
        0 -1px 0 black;
    overflow: auto;
    scrollbar-width: none;
    animation: fadeIn 0.3s ease forwards;
}

.list-leaderboard::-webkit-scrollbar {
    display: none;
}

@keyframes fadeIn {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.box-your-rank {
    display: flex;
    flex-direction: column;
    position: absolute;
    bottom: calc(2% + 58px);
    background-color: #ffa53a;
    width: calc(100% - 40px);
    padding: 5px 20px 10px;
}

.title-your-rank {
    font-weight: bold;
}

.content-your-rank {
    border: 2px solid #557aff;
    padding: 5px 20px;
    border-radius: 10px;
    display: flex;
    gap: 20px;
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
    width: 30px;
    height: 30px;
    display: flex;
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
    font-size: 11px;
}

.list-history {
    padding: 10px;
    height: calc(100% - 270px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    animation: fadeIn 0.3s ease forwards;
}

.box-history {
    background-color: #0c2678;
    padding: 5px;
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

.time-end {
    display: flex;
    gap: 3px;
}

@media (min-width: 320px) {
    .list-history,
    .list-matches {
        height: calc(100% - 255px);
    }
}

@media (min-width: 360px) {

    .list-history,
    .list-matches {
        height: calc(100% - 255px);
    }
}

@media (min-width: 375px) {

    .list-history,
    .list-matches {
        height: calc(100% - 275px);
    }
}

@media (min-width: 390px) {

    .list-history,
    .list-matches {
        height: calc(100% - 275px);
    }
}

@media (min-width: 460px) {

    .list-history,
    .list-matches {
        height: calc(100% - 290px);
    }
}

@media (min-width: 490px) {

    .list-history,
    .list-matches {
        height: calc(100% - 310px);
    }
}

@media (min-width: 560px) {

    .list-history,
    .list-matches {
        height: calc(100% - 330px);
    }
}

@media (min-width: 768px) {

    .list-history,
    .list-matches {
        height: calc(100% - 420px);
    }
}

@media (min-width: 1024px) {

    .list-history,
    .list-matches {
        height: calc(100% - 480px);
    }
}

.slider-container {
    width: 200px;
    text-align: center;
}

.slider {
    width: 100%;
}
</style>
