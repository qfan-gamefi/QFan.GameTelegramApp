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
            // user.id
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
            dataLogin: {
                jwt: "",
                user: {
                    id: null,
                    username: null,
                    email: null,
                    provider: null,
                    confirmed: true,
                    blocked: false,
                    referer_code: null,
                    qpoint: null,
                    createdAt: "2024-05-13T10:13:05.573Z",
                    updatedAt: "2024-05-13T11:58:34.300Z",
                },
            },
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
        async fetchLogin() {
            try {
                const response = await fetch(
                    "https://qfan-api.qcloud.asia/api/auth/local",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            identifier: this.idUser,
                            password: this.idUser,
                        }),
                    }
                );
                const data = await response.json();

                this.dataLogin = data;
            } catch (error) {
                console.error("Error fetching API data:", error);
            }
        },
    },
    mounted() {
        this.fetchApiData();
        this.fetchLogin();
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
                    <div>in storage:</div>
                    <div class="score">{{ dataLogin?.user?.qpoint }}</div>
                    <div>HOT Balance: 90.512399</div>
                </div>
            </div>

            <div class="wrap-commit_reward" :style="beforeStyle">
                <div class="box-info">
                    <div class="box-left">
                        <div class="title">Storage</div>
                        <div class="content">10h 29m to fill</div>
                    </div>
                    <div class="box-right">
                        <button
                            class="btn-commit_reward"
                            @click="commit_reward"
                        >
                            Claim
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

        <!-- copy to clipboard -->
        <div class="copy-success-message" v-if="isCopiedToClipboard">
            <span>Copied to clipboard!</span>
        </div>
    </div>
</template>
