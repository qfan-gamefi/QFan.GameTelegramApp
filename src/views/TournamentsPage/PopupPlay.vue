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
                        <div>Player</div>
                        <div>Score</div>
                        <div>Rival</div>

                        <div class="scoreboard">
                            <div class="player-score">
                                <div class="truncate w-3/4">{{ first_name }} {{ last_name }}</div>

                                <div class="absolute right-2 text-xl">
                                    {{ currentScore.user }}
                                </div>
                            </div>
                            <div class="opponent-score">
                                <div class="absolute left-2 text-xl">
                                    {{ currentScore.opponent }}
                                </div>
                                <div class="truncate w-3/4">
                                    {{
                                        dataPlay?.opponent?.userName ||
                                        dataPlay?.opponent?.userId
                                    }}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <br />
                    <div class="match-status">{{ matchStatus }}</div>

                    <div class="timeout-timer">{{ formatTime(currentMinute) }}</div>

                    <div v-if="showResultMessage" class="result-message" :class="resultClass">
                        {{ resultMessage }}
                    </div>

                    <div class="body-match">
                        <div
                            v-for="(item, index) in displayedItems"
                            :key="index"
                            class="box-goal-item"
                        >
                            <div class="item-goal">
                                <!-- User 1 goal (left aligned) -->
                                <div
                                    class="goal-scorer"
                                    v-if="item.team === 'user' && item.type === 'goal'"
                                >
                                    {{ formatPlayerName(item?.player) }}
                                </div>
                                <div v-else class="goal-scorer empty-cell"></div>

                                <!-- Time (centered) with ball icon -->
                                <div class="time-goal">
                                    {{ item?.minute }}'
                                    <img class="ball-icon" v-if="item.type === 'goal'" :src="ballPlay" />
                                </div>

                                <!-- User 2 goal (right aligned) -->
                                <div
                                    class="goal-scorer justify-end"
                                    v-if="item.team === 'opponent' && item.type === 'goal'"
                                >
                                    {{ formatPlayerName(item?.player) }}
                                </div>
                                <div v-else class="goal-scorer empty-cell"></div>
                            </div>
                        </div>

                        <div v-if="loading" class="loading-spinner">
                            <i class="fa-solid fa-spinner fa-spin"></i>
                        </div>
                    </div>
                </div>
                
                <div v-if="showGoalPopup" class="goal-popup">
                    <div class="goal-animation">
                        <img :src="ballPlay" class="ball-animation" />
                        <div class="goal-text">GOAL!</div>
                        <div class="goal-details">
                            {{ currentGoal.player }} scores at {{ currentGoal.minute }}'
                        </div>
                        <button @click="closeGoalPopup" class="continue-btn">Continue</button>
                    </div>
                </div>
            </div>
            <PopupPassword :visible="isPass" @cancel="isPass = false" />
        </div>
    </transition>
</template>

<script lang="ts">
import PopupPassword from "@/components/popup/PopupPassword.vue";
import userServiceInventory from "@/services/inventoryService";
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
    components: {
        PopupPassword,
    },
    watch: {
        async visible(newVal, oldVal) {
            if (newVal) {
                this.resetMatch();
                await this.playRank();
                if(this.dataPlay) {
                    this.startMatch();
                }
            }
        },
    },
    emits: ["no", "refeshData"],
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;
        return {
            ballPlay: "/assets/tournaments/ball_play.png",
            loading: false,
            userId: userInfo?.user?.id || "",
            first_name: userInfo?.user?.first_name || "",
            last_name: userInfo?.user?.last_name || "",
            dataPlay: null,
            matchEvents: [],
            displayedItems: [],
            isPass: false,
            timerInterval: null,
            timeoutId: null,
            currentMinute: 0,
            currentScore: {
                user: 0,
                opponent: 0
            },
            matchStatus: "Match in progress",
            isPaused: false,
            showGoalPopup: false,
            currentGoal: null,
            showResultMessage: false,
            resultMessage: "",
            resultClass: ""
        };
    },
    beforeUnmount() {
        this.clearTimers();
    },
    methods: {
        resetMatch() {
            this.clearTimers();
            this.currentMinute = 0;
            this.currentScore = { user: 0, opponent: 0 };
            this.displayedItems = [];
            this.matchStatus = "Match in progress";
            this.isPaused = false;
            this.showGoalPopup = false;
            this.currentGoal = null;
            this.showResultMessage = false;
            this.resultMessage = "";
        },
        clearTimers() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        },
        no() {
            this.clearTimers();
            this.dataPlay = null;
            this.displayedItems = [];
            this.$emit("no");
            this.$emit("refeshData");
        },
        formatTime(minutes) {
            const mins = Math.floor(minutes);
            const secs = Math.floor((minutes % 1) * 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        },
        
        formatPlayerName(name) {
            if (!name) return '';
            
            // If name is less than 18 characters, return as is
            if (name.length <= 18) return name;
            
            // Split the name by spaces
            const parts = name.split(' ');
            
            if (parts.length === 1) {
                // If it's a single word, truncate it
                return name.substring(0, 18);
            } else {
                // Take first letter of first part + period, then add remaining parts
                const firstPart = parts[0].charAt(0) + '.';
                const remainingParts = parts.slice(1).join(' ');
                
                // If combined result is still too long, truncate
                const combined = `${firstPart} ${remainingParts}`;
                return combined.length > 18 ? combined.substring(0, 18) : combined;
            }
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
                
                if (this.dataPlay?.match?.events) {
                    // Sort events by minute
                    this.matchEvents = this.dataPlay.match.events.sort((a, b) => a.minute - b.minute);
                    
                    // Fix any inconsistencies in the events data
                    this.matchEvents.forEach(event => {
                        // Ensure score property is properly initialized
                        if (event.type === 'goal' && (!event.score || !event.score.user || !event.score.opponent)) {
                            if (!event.score) {
                                event.score = { user: 0, opponent: 0 };
                            }
                        }
                    });
                }
                
                // Initialize score
                this.currentScore = { 
                    user: 0, 
                    opponent: 0 
                };
                
            } catch (error) {
                console.error("Error in playRank:", error);
                if (error?.response?.status === 401) {
                    this.isPass = true;
                }
            } finally {
                this.loading = false;
            }
        },
        startMatch() {
            this.timerInterval = setInterval(() => {
                if (this.isPaused) return;
                
                // Increment time counter (uses 6 frames per minute)
                this.currentMinute += 1/6;
                
                // Check for events at current minute
                this.checkEvents();
                
                // End match at 90 minutes
                if (this.currentMinute >= 90) {
                    this.endMatch();
                }
            }, 1000/60);  // Update every 1/60th of a minute for smooth timing
        },
        checkEvents() {
            if (!this.matchEvents || this.matchEvents.length === 0) return;
            
            // Check if we should trigger any events
            for (let i = 0; i < this.matchEvents.length; i++) {
                const event = this.matchEvents[i];
                
                // If we've reached or just passed an event's minute
                if (event && !event.processed && Math.floor(this.currentMinute) >= event.minute) {
                    // Process the event
                    this.processEvent(event);
                    event.processed = true;
                }
            }
        },
        processEvent(event) {
            if (event.type === 'goal') {
                // Pause the match
                this.isPaused = true;
                
                // Update the score based on team
                if (event.team === 'user') {
                    this.currentScore.user += 1;
                } else if (event.team === 'opponent') {
                    this.currentScore.opponent += 1;
                }
                
                // Ensure score is properly reflected in the event for display
                if (!event.score) {
                    event.score = { ...this.currentScore };
                }
                
                // Show the goal popup
                this.currentGoal = event;
                this.showGoalPopup = true;
                
                // Add the event to displayed items
                this.displayedItems.push(event);
            } 
        },
        closeGoalPopup() {
            this.showGoalPopup = false;
            this.currentGoal = null;
            this.isPaused = false;
        },
        endMatch() {
            this.clearTimers();
            this.currentMinute = 90;
            this.matchStatus = "Match ended";
            
            // Display the match result
            this.showResultMessage = true;
            
            if (this.dataPlay?.match?.result === 'WIN') {
                this.resultMessage = "YOU WIN!";
                this.resultClass = "result-win";
            } else if (this.dataPlay?.match?.result === 'LOSE') {
                this.resultMessage = "YOU LOSE";
                this.resultClass = "result-lose";
            } else {
                this.resultMessage = "MATCH DRAW";
                this.resultClass = "result-draw";
            }
            
            // If we have a rank update, show the points change
            if (this.dataPlay?.rankUpdate) {
                this.timeoutId = setTimeout(() => {
                    this.resultMessage = `${this.dataPlay.rankUpdate.pointsChange > 0 ? '+' : ''}${this.dataPlay.rankUpdate.pointsChange} Rank Points`;
                }, 2000);
            }
        }
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
    @apply flex justify-evenly bg-black text-xs relative font-medium rounded-t-md p-2;
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

.match-status {
    @apply mt-4 text-center text-xs;
}

.timeout-timer {
    @apply text-center text-xl font-extrabold tracking-wider mt-1;
}

.goal-scorer {
    @apply w-2/5 flex items-center gap-2;
}

.time-goal {
    @apply w-1/5 flex justify-center items-center gap-1 bg-green-500 relative;
}

.ball-icon {
    @apply w-3 h-3;
}

.item-goal {
    @apply p-2 flex bg-[#EDF1FF] rounded-md text-black justify-between;
}

.empty-cell {
    @apply flex-1;
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

.body-match {
    @apply grid gap-1 overflow-y-scroll max-h-[300px];
}

.loading-spinner {
    @apply flex justify-center items-center mt-4;
}

.goal-popup {
    @apply absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 z-10;
}

.goal-animation {
    @apply flex flex-col items-center bg-[#001F78] p-6 rounded-lg;
}

.ball-animation {
    width: 50px;
    height: 50px;
    animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

.goal-text {
    @apply text-3xl font-bold text-yellow-400 mt-4;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
}

.goal-details {
    @apply text-white mt-2 mb-4;
}

.continue-btn {
    @apply bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors;
}

.result-message {
    @apply text-2xl font-bold my-2 py-1;
}

.result-win {
    @apply text-green-400;
    text-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
}

.result-lose {
    @apply text-red-400;
    text-shadow: 0 0 8px rgba(248, 113, 113, 0.6);
}

.result-draw {
    @apply text-yellow-400;
    text-shadow: 0 0 8px rgba(250, 204, 21, 0.6);
}


</style>