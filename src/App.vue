<script setup lang="ts">
import Telegram from "vue-tg";
import SampleGame from "./rising-star/SampleGame.vue";
import Phaser from "phaser";
import { ref, toRaw, onMounted } from "vue";

const phaserRef = ref();

onMounted(() => {});
const commit_reward = () => {
    const scene = toRaw(phaserRef.value.scene);

    if (scene) {
        //  Call the changeScene method defined in the `MainMenu`, `Game` and `GameOver` Scenes
        scene.changeScene();
    }
};
</script>

<script lang="ts">
export default {
    data() {
        const telegram_bot_link =
            "Invite Link: https://t.me/Sampletwabot?start=r_";

        let first_name = "";
        let last_name = "";

        // Kiểm tra xem Telegram WebApp đã khởi tạo dữ liệu hay chưa
        if (window?.Telegram?.WebApp?.initDataUnsafe) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            if (user) {
                first_name = user.first_name || "";
                last_name = user.last_name || "";
            }
        }

        return {
            isTelegramLogin: !!first_name || !!last_name,
            first_name: first_name,
            last_name: last_name,
            idUser: window.Telegram.WebApp.initDataUnsafe.user?.id,
            telegram_bot_link:
                telegram_bot_link +
                    window.Telegram.WebApp.initDataUnsafe.user?.id || "",
            showCoomingSoon: false,
            isCopiedToClipboard: false,
            apiDataWidth: 10,
            dataLogin: null,
            dataQPoint: {
                balance: "",
                lastTakeRewardTime: "",
                nextTakeRewardTime: "",
                rewardAmount: "100",
                createdAt: "",
                updatedAt: "",
                publishedAt: "",
                rewardScheduleHour: "",
            },
            countdown: "",
            isCountingDown: false,
            isPopupCode: false,
            code: null,
            errorMessage: "",
        };
    },
    computed: {
        beforeStyle() {
            return {
                "--pseudo-width": `${this.apiDataWidth}%`,
            };
        },
    },
    methods: {
        copyToClipboard() {
            const input = document.createElement("input");
            input.style.position = "fixed";
            input.style.opacity = "0";
            input.value = this.telegram_bot_link;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            // Thông báo hoặc cập nhật trạng thái sau khi sao chép
            // alert("Copied to clipboard!");
            this.isCopiedToClipboard = true;
            setTimeout(() => {
                this.isCopiedToClipboard = false;
            }, 2000);
        },
        showPopupCoomingSoon() {
            this.showCoomingSoon = true;
        },
        hidePopupCoomingSoon() {
            this.showCoomingSoon = false;
        },
        hidePopupCode() {
            this.isPopupCode = false;
        },
        fetchApiData() {
            this.apiDataWidth = 79;
            // try {
            //     const response = await fetch("api-url");
            //     const data = await response.json();
            //     this.apiDataWidth = data;
            // } catch (error) {
            //     console.error("Error fetching API data:", error);
            // }
        },

        async loginTele() {
            try {
                const response = await fetch(
                    "https://api.telegram.org/bot7113766207:AAGgpOehwXbbTO83XGak9T5qzbp9p7Wyo8E/getMe",
                    {
                        method: "POST",
                        headers: {
                            accept: "application/json",

                            "content-type": "application/json",
                        },
                    }
                );
                const data = await response.json();

                this.idUser = data.result.id;

                if (data.result.id) {
                    // gọi màn login theo user id
                    // this.register();
                    // this.fetchLogin();
                }
            } catch (error) {
                console.error("Error fetching API data:", error);
            }
        },
        async register() {
            try {
                    const myHeaders = new Headers();
                    myHeaders.append("Content-Type", "application/json");

                    const response = await fetch(
                        "https://qfan-api.qcloud.asia/api/players",
                        {
                            method: "POST",
                            redirect: "follow",
                            headers: myHeaders,
                            body: JSON.stringify({
                                "data": {
                                    "playerId": window.Telegram.WebApp.initDataUnsafe.user?.id,
                                    "firstName": window.Telegram.WebApp.initDataUnsafe.user?.first_name,
                                    "lastName": window.Telegram.WebApp.initDataUnsafe.user?.last_name,
                                    "refererCode": window.Telegram.WebApp.initDataUnsafe.start_param
                                }
                                })
                        }
                    );
                    const data = await response.json();

                if (data?.data) {
                    this.isPopupCode = true;
                } else {
                    alert(data.error.message);
                }
                this.dataLogin = data.data[0];
                this.dataQPoint =
                    data.data[0].attributes.qpoint.data.attributes;
            } catch (error) {
                console.error("Error fetching API data:", error);
            }
        },
        async fetchLogin() {
            try {
                // const response = await fetch(
                //     "https://qfan-api.qcloud.asia/api/auth/local",
                //     {
                //         method: "POST",
                //         headers: {
                //             "Content-Type": "application/json",
                //         },
                //         body: JSON.stringify({
                //             // identifier: this.idUser,
                //             // password: this.idUser,
                //             identifier: "huan123",
                //             password: "huan123",
                //         }),
                //     }
                // );
                var response = await fetch(
                    "https://qfan-api.qcloud.asia/api/players?populate=qpoint&filters[playerId]="+window.Telegram.WebApp.initDataUnsafe.user?.id,
                    {
                        method: "GET",
                        redirect: "follow"
                    }
                );
                var data = await response.json();
                if(data['data'].length == 0){
                    this.register();
                }
                else{
                    this.dataLogin = data.data[0];
                    this.dataQPoint =
                        data.data[0].attributes.qpoint.data.attributes;
                }

            } catch (error) {
                // this.register();
                console.error("Error fetching API data:", error);
            }
        },

        async submitCode() {
            if (!this.code) {
                console.log(this.code);
                this.errorMessage = "Code is required!";
                return;
            }
            try {
                this.code = null; // Clear the input field after submission
                this.errorMessage = "";
                const response = await fetch(
                    "https://qfan-api.qcloud.asia/api/player/checkRefererCode",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            refererCode: this.code,
                        }),
                    }
                );
                const data = await response.json();

                if (data) {
                    console.log(data);
                    // this.isPopupCode = false;
                }
            } catch (error) {
                this.register();
                console.error("Error fetching API data:", error);
            }
        },
        clearError() {
            this.errorMessage = "";
        },
        formatTime(ms: any) {
            if (ms <= 0) {
                return "Time expired";
            }

            const seconds = Math.floor((ms / 1000) % 60);
            const minutes = Math.floor((ms / (1000 * 60)) % 60);
            const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

            return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(
                seconds
            )}`;
        },
        // Phương thức để thêm số 0 vào trước nếu số là một chữ số
        pad(value: any) {
            return value < 10 ? "0" + value : value;
        },

        countdownFunc() {
            const currentTime: any = Date.now();
            // const rewardTime: any = new Date(
            //     this.dataQPoint.nextTakeRewardTime
            // ).getTime();
            const rewardTime = 1915770552375;

            const timeDiff = rewardTime - currentTime;

            this.countdown = this.formatTime(timeDiff);
            // Cập nhật mỗi giây
            setInterval(() => {
                const currentTime = Date.now();
                const timeDiff = rewardTime - currentTime;
                this.countdown = this.formatTime(timeDiff);
                this.isCountingDown = timeDiff > 0;
            }, 1000);
        },
    },
    async mounted() {
        this.fetchApiData();
        await this.fetchLogin();
        await this.countdownFunc();
    },
};
</script>

<style scoped>
@import "./styles/global.css";
@import "./styles/app.css";
</style>

<template>
    <div class="container">
        <button class="absolute-training-btn button-decoration">
            START TRAINING
        </button>
        <div>
            <button
                id="login_button"
                class="btn-login"
                v-show="!isTelegramLogin"
            >
                LOGIN
            </button>
        </div>

        <div class="container-game">
            <div class="container-info" v-show="isTelegramLogin">
                <!-- <div class="wrap-score">SCORE: 0</div> -->

                <div class="wrap-username">
                    {{ first_name }} {{ last_name }}
                </div>
            </div>

            <div class="wrap-score">
                <div class="content">
                    <!-- <div>in storage:</div>
                    <div class="score"></div> -->
                    <div>QFP Balance: {{ dataQPoint?.balance }}</div>
                </div>
            </div>

            <div class="wrap-commit_reward" :style="beforeStyle">
                <div class="box-info">
                    <div class="box-left">
                        <div class="title">Storage</div>
                        <div class="content">{{ countdown }} to fill</div>
                    </div>
                    <div class="box-right">
                        <button
                            class="btn-commit_reward"
                            @click="commit_reward"
                            :disabled="isCountingDown"
                        >
                            Train
                        </button>
                    </div>
                </div>
            </div>

            <SampleGame ref="phaserRef" />
        </div>

        <div class="button-container">
            <div class="row">
                <button @click="showPopupCoomingSoon">
                    <img
                        src="./../public/assets/button-icons/shopping-bag-3744.svg"
                        class="icon-home"
                    />
                    <span>Shop</span>
                </button>
                <button @click="copyToClipboard">
                    <img
                        src="./../public/assets/button-icons/copy-link.svg"
                        class="icon-home"
                    />
                    <span>Copy Invite</span>
                </button>
            </div>
            <div class="row">
                <button @click="showPopupCoomingSoon">
                    <img
                        src="./../public/assets/button-icons/booster.svg"
                        class="icon-home"
                    />
                    <span>Booster</span>
                </button>
                <button @click="showPopupCoomingSoon">
                    <img
                        src="./../public/assets/button-icons/mission.svg"
                        class="icon-home"
                    />
                    <span>Mission</span>
                </button>
                <button @click="showPopupCoomingSoon">
                    <img
                        src="./../public/assets/button-icons/event.svg"
                        class="icon-home"
                    />
                    <span>Event</span>
                </button>
            </div>
        </div>
        <!-- <span v-text="telegram_bot_link" class="nunito-fonts"></span> -->

        <!-- popup coming sooon -->
        <div
            :class="[
                'popup-cooming-soon',
                { 'closing-popup': !showCoomingSoon },
            ]"
            v-if="showCoomingSoon"
        >
            <p>Coming soon</p>
            <button @click="hidePopupCoomingSoon" class="btn-close-coming-soon">
                Close
            </button>
        </div>

        <!-- popup refere code -->
        <div class="popup-referer-code" v-if="isPopupCode">
            <div class="referer-code">Referer code</div>
            <form @submit.prevent="submitCode">
                <input
                    class="code-input"
                    :class="{ 'input-error': errorMessage }"
                    type="text"
                    v-model="code"
                    id="code"
                    @input="clearError"
                />
                <div v-if="errorMessage" class="text-err-code">
                    {{ errorMessage }}
                </div>
                <button class="btn-submit-code" type="submit">Submit</button>
            </form>

            <!-- <button @click="hidePopupCode" class="btn-close-coming-soon">
                Close
            </button> -->
        </div>

        <!-- copy to clipboard -->
        <div class="copy-success-message" v-if="isCopiedToClipboard">
            <span>Copied to clipboard!</span>
        </div>
    </div>
</template>
