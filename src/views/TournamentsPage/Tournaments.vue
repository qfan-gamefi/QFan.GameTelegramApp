<template>
    <div class="tournament-page">
        <div v-if="activeIndex === 0" class="text-black">
            <div class="title text-white">LEADER BOARD</div>

            <div class="rounded-md bg-[#BDE7FF] mb-3">
                <div class="font-bold rounded-t-md flex gap-2 p-2 items-center">
                    <img src="/assets/tournaments/gift.png" class="w-5" />
                    Reward
                </div>
                <div class="px-2 flex justify-between">
                    <div>Rank 1</div>
                    <div>100K</div>
                </div>
                <div class="px-2 flex justify-between">
                    <div>Rank 2</div>
                    <div>50k</div>
                </div>
            </div>

            <div class="leader-scroll">
                <div class="rank-index">
                    <div
                        v-for="(item, index) in leaderBoardData"
                        :key="item.userId || index"
                        class="flex bg-[#EDF1FF] items-center p-2 justify-between rounded-md"
                    >
                        <div class="flex gap-5 items-center">
                            <div>{{ index + 1 }}</div>
                            <div class="flex gap-2 items-center">
                                <img
                                    v-if="!item?.imageUrl"
                                    src="/assets/logo.svg"
                                    class="w-3"
                                    alt="Logo"
                                />
                                <img v-else 
                                    :src='item?.imageUrl'
                                    class="w-3"
                                    alt="avt"  />
                                {{ item?.userName || item?.userId }}
                            </div>
                        </div>
                        <div>{{ item.rankPoints }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeIndex === 1">
            <div class="title">CURRENTLY UNDERWAY</div>

            <div class="user-rank">
                <div>
                    <div class="rank-title">My rank</div>
                    <div>#{{ yourRank?.position }}</div>
                </div>
                <div>
                    <div class="rank-title">RankPoint</div>
                    <div>{{ yourRank?.rankPoints }}</div>
                </div>
                <div>
                    <div class="rank-title">Rewards</div>
                    <div>0</div>
                </div>
                <div>?</div>
            </div>

            <div class="flex justify-between mb-2">
                <div class="flex gap-1">
                    <img src="/assets/tournaments/ticket.png" class="w-5" />
                    {{ energyData?.currentEnergy }}/{{ energyData?.maxEnergy }}
                </div>
                <div class="flex items-center" @click="handleRefresh()">
                    <div>{{ formattedTime }}</div>
                    <img src="/assets/tournaments/refresh.png" class="w-20" />
                </div>
            </div>

            <div class="rank-scroll">
                <div class="rank-index">
                    <div
                        v-for="(item, index) in dataOpponents"
                        :key="index"
                        class="box-index"
                        :class="'bg-[#EDF1FF]'"
                    >
                        <div class="flex gap-5 items-center">
                            <div class="w-5 text-center">
                                <img src="/assets/logo.svg" />
                            </div>
                            <div class="gird gap-2">
                                <div>{{ item?.userId }}</div>

                                <div>RankPoint: {{ item?.rankPoints }}</div>
                            </div>
                        </div>

                        <div
                            v-if="!item.isDefeated"
                            class="relative"
                            @click="handleFight(item)"
                        >
                            <img
                                src="/assets/tournaments/fight.png"
                                class="w-20"
                            />
                            <div class="number-ticket text-outline">-1</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="activeIndex === 2" class="text-black">
            <div class="title text-white">RECORD</div>

            <div>
                <div class="header-record">
                    <div>User 1</div>
                    <div>Score</div>
                    <div>User 2</div>
                </div>

                <div class="scroll-record">
                    <div
                        v-for="item in history"
                        :key="item.id"
                        class="flex p-2 bg-[#EDF1FF] text-xs w-full"
                        :class="styleRowHistory(item)"
                    >
                        <div class="w-2/5">
                            {{ first_name }} {{ last_name }}
                        </div>
                        <div class="w-1/5 text-center">
                            {{ item.matchScore.user }} -
                            {{ item.matchScore.opponent }}
                        </div>
                        <div class="w-2/5 text-right">
                            {{ item?.userName || item?.opponentId }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="wr-btn">
            <div class="box-btn">
                <div
                    v-for="(item, index) in [
                        'SCHEDULE',
                        'TOURNAMENT',
                        'RECORD',
                    ]"
                    :key="index"
                    class="px-3 py-3 cursor-pointer rounded-full"
                    :class="
                        activeIndex === index
                            ? 'bg-white text-black'
                            : 'bg-transparent text-gray-700'
                    "
                    @click="activeIndex = index"
                >
                    {{ item }}
                </div>
            </div>
        </div>

        <PopupPlayPage
            :visible="isPopup"
            @no="closePopup()"
            :itemFight="itemFight"
        />
    </div>
</template>

<script lang="ts">
import BackButtonTelegram from "@/mixins/BackButtonTelegram";
import userServiceInventory from "@/services/inventoryService";
import PopupPlayPage from "./PopupPlay.vue";

export default {
    name: "TournamentsPage",
    mixins: [BackButtonTelegram],
    components: {
        PopupPlayPage,
    },
    async created() {
        await this.getYourRank();
        await this.getLeaderboard();
        await this.rankHistory();
        await this.rankOpponents();
        await this.getEnergy();
        await this.startCountdown();
    },
    // mounted() {
    //     this.startCountdown();
    // },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    watch: {
        activeIndex(newVal, oldVal) {
            if (newVal === 2) {
                this.rankHistory();
            }
        },
    },
    computed: {
        formattedTime() {
            let hours = Math.floor(Number(this.timeRefreshesIn) / 3600);
            let minutes = Math.floor(Number(this.timeRefreshesIn % 3600) / 60);
            let seconds = Number(this.timeRefreshesIn) % 60;
            return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(
                seconds
            )}`;
        },
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;
        return {
            first_name: userInfo?.user?.first_name || "",
            last_name: userInfo?.user?.last_name || "",
            userId: userInfo?.user?.id || "",
            activeIndex: 1,
            leaderBoardData: [],
            yourRank: null,
            isPopup: false,
            dataOpponents: [],
            history: [],
            itemFight: {},
            energyData: null,
            dataRefresh: {},
            timeRefreshesIn: 0,
            timer: null,
        };
    },
    methods: {
        pad(num) {
            return num < 10 ? `0${num}` : num;
        },
        startCountdown() {
            if (this.timer) {
                clearInterval(this.timer);
            }

            if (this.timeRefreshesIn > 0) {
                this.timer = setInterval(() => {
                    if (this.timeRefreshesIn > 0) {
                        this.timeRefreshesIn--;
                    } else {
                        clearInterval(this.timer);
                    }
                }, 1000);
            }
        },
        async getYourRank() {
            const res = await userServiceInventory.getYourRank(this.userId?.toString());
            this.yourRank = res?.data;
        },
        async getLeaderboard() {
            const res = await userServiceInventory.getLeaderboard();
            this.leaderBoardData = res?.data?.leaderboard;
        },
        async rankHistory() {
            const res = await userServiceInventory.rankHistory(this.userId?.toString());
            this.history = res?.data?.history;
        },
        async rankOpponents() {
            const res = await userServiceInventory.rankOpponents(this.userId?.toString());
            this.dataOpponents = res?.data?.opponents;
            this.timeRefreshesIn = Math.ceil(Number(res?.data?.refreshesIn));
        },
        async handleFight(item) {
            this.itemFight = item;
            this.isPopup = true;
        },
        async closePopup() {
            this.isPopup = false;
            await this.rankOpponents();
        },
        async getEnergy() {
            const res = await userServiceInventory.getEnergy(this.userId?.toString());
            this.energyData = res;
        },
        async handleRefresh() {
            const res = await userServiceInventory.handleRefresh(this.userId?.toString());
            this.dataOpponents = res?.data?.opponents;
            this.timeRefreshesIn = Math.ceil(Number(res?.data?.refreshesIn));
            this.startCountdown();
        },
        styleRowHistory(item){
            if(item?.result === 'WIN') return 'text-green-500'
            if(item?.result === 'DRAW') return 'text-orange-500'
            if(item?.result === 'LOSE') return 'text-red-500'
        }
    },
};
</script>

<style lang="scss" scoped>
.tournament-page {
    @apply bg-center bg-no-repeat bg-cover w-full h-[100vh] p-5;
    background-image: url("/assets/tournaments/bg_rank.png");
}
.title {
    @apply font-extrabold text-center;
}
.user-rank {
    @apply flex justify-between items-center p-3 bg-[#BDE7FF] text-black rounded-md font-bold mt-5 mb-3;
}
.rank-title {
    @apply text-xs;
}
.leader-scroll {
    @apply overflow-y-scroll h-[calc(100vh-210px)];
}
.rank-scroll {
    @apply overflow-y-scroll h-[calc(100vh-200px)];
}
.rank-index {
    @apply grid gap-2 text-black font-bold text-xs;
}
.box-index {
    @apply flex justify-between items-center p-2 rounded-md;
}
.wr-btn {
    @apply absolute bottom-0 left-0 w-full text-sm font-bold px-5 py-1 bg-[#0078E7] text-black;
}
.box-btn {
    @apply flex w-full justify-between bg-[#ffffff9e] rounded-full;
}

.wr-user-play {
    @apply flex justify-evenly bg-black text-xs relative pb-3 font-medium rounded-t-md;
}

.text-outline {
    text-shadow: -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black,
        1px 1px 0 black;
}

.number-ticket {
    @apply absolute font-extrabold text-white top-1 right-6;
}
.header-record {
    @apply flex justify-between p-2 text-white bg-black rounded-t-md text-xs;
}
.scroll-record {
    @apply overflow-y-scroll h-[calc(100vh-140px)];
}
</style>
