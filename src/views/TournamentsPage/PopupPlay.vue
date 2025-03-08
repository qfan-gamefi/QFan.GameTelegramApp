<template>
    <transition name="popup-fade">
        <div class="popup-container" v-if="visible">
            <div
                class="popup-content"
                :style="{ backgroundColor: backgroundColor, border: border }"
            >
                <div @click="no()" class="close-popup">
                    <i
                        class="fa-solid fa-rectangle-xmark fa-xl"
                        style="color: #ff0000"
                    ></i>
                </div>

                <div>
                    <div class="wr-user-play">
                        <div>User 1</div>
                        <div>Score</div>
                        <div>User 2</div>

                        <div class="scoreboard">
                            <div class="player-score">
                                <div>{{ first_name }} {{ last_name }}</div>
                                <div class="absolute right-2 text-xl">
                                    {{ dataPlay?.match?.score?.user }}
                                </div>
                            </div>
                            <div class="opponent-score">
                                <div class="absolute left-2 text-xl">
                                    {{ dataPlay?.match?.score?.opponent }}
                                </div>
                                <div>
                                    {{
                                        dataPlay?.opponent?.userName ||
                                        dataPlay?.opponent?.userId
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="timeout-message">Time out</div>

                    <div v-if="loading">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                    </div>

                    <div class="timeout-timer" v-if="!loading">90:00</div>
                    <div v-if="dataPlay?.match?.result === 'DRAW' && !loading">
                        DRAW
                    </div>
                    <div class="grid gap-1" v-if="!loading">
                        <div
                            v-for="(
                                item, index
                            ) in dataPlay?.match?.events?.filter(
                                (el) => el.type === 'goal'
                            )"
                            :key="index"
                            :style="{ animationDelay: `${index * 0.2}s` }"
                            class="box-goal-item"
                        >
                            <div v-if="item.type === 'goal'" class="item-goal">
                                <div
                                    class="goal-scorer"
                                    v-if="item?.score?.team1 && item?.player"
                                >
                                    {{ item?.player }}
                                    <img
                                        class="w-3"
                                        src="/assets/tournaments/ball_play.png"
                                    />
                                </div>

                                <div class="time-goal">
                                    {{ item?.minute ?? "?" }}'
                                </div>

                                <div
                                    class="goal-scorer justify-end"
                                    v-if="item?.score?.team2 && item?.player"
                                >
                                    <img
                                        class="w-3"
                                        src="/assets/tournaments/ball_play.png"
                                    />
                                    {{ item?.player }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import userServiceInventory from "@/services/inventoryService";
import axios from "axios";
import { defineComponent } from "vue";

export default defineComponent({
    name: "PopupPlayPage",
    props: {
        backgroundColor: {
            type: String,
            default: "#00175F",
        },
        border: {
            type: String,
            default: "1px solid #89A2EF",
        },
        visible: {
            type: Boolean,
            required: true,
            default: false,
        },
        itemFight: {
            type: Object,
            required: true,
        },
    },
    watch: {
        async visible(newVal, oldVal) {
            if (newVal) {
                this.playRank();
            }
        },
    },
    emits: ["no", "refeshData"],
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;
        return {
            loading: false,
            userId: userInfo?.user?.id || "",
            first_name: userInfo?.user?.first_name || "",
            last_name: userInfo?.user?.last_name || "",
            dataPlay: null,
        };
    },
    methods: {
        no() {
            this.dataPlay = {};
            this.$emit("no");
        },
        refeshData() {
            this.$emit("refeshData");
        },
        async playRank() {
            this.loading = true;
            const avt = localStorage.getItem("avt");

            try {
                const res = await userServiceInventory.playRank({
                    userId: this.userId.toString(),
                    opponentId: this.itemFight.userId,
                    userName: `${this.first_name} ${this.last_name}`,
                    imageUrl: avt || "",
                });
                this.dataPlay = res?.data;
            } catch (error) {
            } finally {
                this.loading = false;
            }
        },
    },
});
</script>

<style scoped>
.close-popup {
    @apply absolute top-1 right-1;
}

.popup-container {
    @apply fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-[9999] text-black;
}

.popup-content {
    @apply text-xs rounded text-center relative text-white border border-[#89a2ef] p-5 w-[90%] flex flex-col gap-2;
}

.wr-user-play {
    @apply flex justify-evenly bg-black text-xs relative pb-3 font-medium rounded-t-md;
}

.timeout-message {
    @apply mt-8 text-center text-xs;
}

.timeout-timer {
    @apply text-center text-xl font-extrabold tracking-wider;
}

.goal-scorer {
    @apply w-2/5 flex items-center gap-2;
}
.scoreboard {
    @apply absolute bottom-[-75%] flex w-full text-center font-extrabold;
}
.player-score {
    @apply bg-[#9E00FF] p-2 rounded-tl-md rounded-bl-md flex flex-1 justify-center relative items-center;
}
.opponent-score {
    @apply bg-[#0045AC] p-2 rounded-tr-md rounded-br-md flex flex-1 justify-center relative items-center;
}
.time-goal {
    @apply w-1/5 flex justify-center items-center bg-green-500;
}
.item-goal {
    @apply p-2 flex bg-[#EDF1FF] rounded-md text-black;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.box-goal-item {
    opacity: 0;
    animation: fadeIn 0.5s ease-out forwards;
}
</style>
