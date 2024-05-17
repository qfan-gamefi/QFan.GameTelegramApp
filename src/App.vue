<script setup lang="ts">
import Telegram from "vue-tg";
import SampleGame from "./rising-star/SampleGame.vue";
// import Phaser from "phaser";
import { ref, toRaw, onMounted } from "vue";

interface PhaserScene {
    changeScene: () => void;
}

const phaserRef: any = ref<{ scene?: PhaserScene }>();

onMounted(() => {
    // alert(JSON.stringify(window.Telegram.WebApp.initDataUnsafe.user));
});
</script>

<script lang="ts">
import InviteFrens from "./components/InviteFrens.vue";
import MissionList from "./components/MissionsList.vue";
import userService from "./services/userService";

const REF_MESS_PREFIX: string = 'start r_';
export default {
    components: {
        InviteFrens,
        MissionList,
    },
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
            idUser: window.Telegram.WebApp.initDataUnsafe.user?.id.toString(),
            telegram_bot_link:
                telegram_bot_link +
                window.Telegram.WebApp.initDataUnsafe.user?.id || "",
            showCoomingSoon: false,
            isCopiedToClipboard: false,
            isSuccess: false,
            apiDataWidth: 0,
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
            code: "",
            errorMessage: "",
            showInvite: false,
            showMission: false,
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

        async register() {
            try {
                const dataForm = {
                    id: this.idUser,
                    is_bot: false,
                    first_name:
                        window.Telegram.WebApp.initDataUnsafe.user?.first_name,
                    last_name:
                        window.Telegram.WebApp.initDataUnsafe.user?.last_name,
                    language_code: "vi",
                };
                const res = await userService.getCallBack(
                    dataForm,
                    this?.code!
                );

                if (res) {
                    // thêm thông báo đăng ký thành công
                    this.isSuccess = true;
                    setTimeout(() => {
                        this.isSuccess = false;
                    }, 2000);
                    this.code = "";
                    this.getInfoUser();
                } else {
                    alert("Lỗi");
                }
            } catch (error) {
                console.error("Error fetching API data:", error);
            }
        },

        // b1: gọi info
        async getInfoUser() {
            try {
                var data = await userService.getInfo(this.idUser!);
                //var data = await userService.getInfo('5314337740');
                if (data?.data?.length == 0) {
                    var refcode: string =
                        window?.Telegram?.WebApp?.initDataUnsafe?.start_param?.replace(
                            REF_MESS_PREFIX,
                            ""
                        ) ?? "";
                    // nhập mã code => tự động đăng ký
                    if (await this.isValidRefCode(refcode)) {
                        this.code = refcode;
                        this.register();
                    } else {
                        this.isPopupCode = true;
                    }
                } else {
                    this.dataLogin = data?.data[0];
                    this.dataQPoint =
                        data?.data[0].attributes.qpoint.data.attributes;
                }
                this.dataLogin = data?.data[0];
                this.dataQPoint =
                    data?.data[0].attributes.qpoint.data.attributes;
            } catch (error) {
                console.error("Error fetching API data:", error);
            }
        },

        async isValidRefCode(referCode: string) {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({
                data: {
                    refererCode: referCode,
                },
            });

            const requestOptions: any = {
                method: "POST",
                headers: myHeaders,
                body: raw,
                redirect: "follow",
            };

            var response = await fetch(
                "https://qfan-api.qcloud.asia/api/player/checkRefererCode",
                requestOptions
            );
            return response.status == 200;
        },
        async submitCode() {
            if (!this.code) {
                this.errorMessage = "Code is required!";
                return;
            }
            try {
                const data = await userService.checkCode(this.code!);

                if (data) {
                    this.errorMessage = "";
                    this.isPopupCode = false;

                    this.register();
                }
            } catch (error: any) {
                // this.register();
                this.errorMessage = error?.response?.data?.error?.message;
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

        async handleReward() {
            try {
                const phaserRef: any = this.$refs.phaserRef as
                    | {
                        scene?: {
                            changeScene: () => void;
                        };
                    }
                    | undefined;
                const scene = toRaw(phaserRef?.scene);

                if (scene) {
                    const res = await userService.takeReward(this.idUser!);
                    if (res) {
                        await this.getInfoUser();
                        await this.countdownFunc();
                    }

                    scene.changeScene();
                }
            } catch (error) {
                this.countdownFunc();
            }
        },

        // Phương thức để thêm số 0 vào trước nếu số là một chữ số
        pad(value: any) {
            return value < 10 ? "0" + value : value;
        },

        countdownFunc() {
            const totalTime = 1 * 60 * 60 * 1000;
            const rewardTime: any = new Date(
                this.dataQPoint.nextTakeRewardTime
            ).getTime();

            // Cập nhật mỗi giây
            setInterval(() => {
                const currentTime: any = new Date((new Date()).toUTCString());
                const timeDiff = rewardTime - currentTime;
                // const timeDiff = 1715942661465 - 1715942660465;

                // if (timeDiff > 0) {
                //     gọi run take
                //     commit_reward();
                //     this.handleReward();
                // }

                const remainingPercentage = (timeDiff / totalTime) * 100;
                this.apiDataWidth = 100 - remainingPercentage;

                this.countdown = this.formatTime(timeDiff);

                this.isCountingDown = timeDiff > 0;
            }, 1000);
        },

        handleReferal() {
            this.showInvite = true;
        },
        closeInvite() {
            this.showInvite = false;
        },
        handleInvite() {
            this.copyToClipboard();
        },
        handleMission() {
            this.showMission = true;
        },
        closeMission() {
            this.showMission = false;
        },
    },
    async mounted() {
        await this.getInfoUser();
        await this.countdownFunc();
    },
    async updated() {
    },

};
</script>

<style scoped>
@import "./styles/global.css";
@import "./styles/app.css";
</style>

<template>
    <div class="container" onload="updateSence">
        <button class="absolute-training-btn button-decoration">
            START TRAINING
        </button>
        <div>
            <button id="login_button" class="btn-login" v-show="!isTelegramLogin">
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
                    <img src="./../public/assets/logo.svg" />
                    <div>QFP Balance: {{ dataQPoint?.balance }}</div>
                </div>
            </div>

            <!-- :style="{ width: apiDataWidth + '%' }" -->
            <div class="wrap-commit_reward" :style="beforeStyle">
                <div class="box-info">
                    <div class="box-left" v-if="countdown !== ('Time expired' || '')">
                        <div class="title">Remain:</div>
                        <div class="content">{{ countdown }} to train</div>
                    </div>

                    <div class="box-left-train" v-if="countdown === 'Time expired'">
                        Click "Train" to take +
                        {{ dataQPoint?.rewardAmount }}
                        <img src="./../public/assets/logo.svg" />
                    </div>
                    <div class="box-right">
                        <button class="btn-commit_reward" @click="handleReward" :disabled="isCountingDown">
                            Train
                        </button>
                        <!-- @click="commit_reward" -->
                    </div>
                </div>
            </div>

            <SampleGame ref="phaserRef" />
        </div>

        <div class="button-container">
            <div class="row">
                <button @click="showPopupCoomingSoon">
                    <img src="./../public/assets/button-icons/shopping-bag-3744.svg" class="icon-home" />
                    <span>Shop</span>
                </button>
                <button @click="handleReferal">
                    <img src="./../public/assets/button-icons/copy-link.svg" class="icon-home" />
                    <span>Referal</span>
                </button>
                <InviteFrens :visible="showInvite" @close="closeInvite" @invite="handleInvite" :idUser="idUser" />
            </div>

            <div class="row">
                <button @click="showPopupCoomingSoon">
                    <img src="./../public/assets/button-icons/booster.svg" class="icon-home" />
                    <span>Booster</span>
                </button>

                <button @click="handleMission">
                    <img src="./../public/assets/button-icons/mission.svg" class="icon-home" />
                    <span>Mission</span>
                </button>
                <MissionList :visible="showMission" @close="closeMission" @invite="handleMission" />

                <button @click="showPopupCoomingSoon">
                    <img src="./../public/assets/button-icons/event.svg" class="icon-home" />
                    <span>Event</span>
                </button>
            </div>
        </div>
        <!-- <span v-text="telegram_bot_link" class="nunito-fonts"></span> -->

        <!-- popup coming sooon -->
        <div :class="[
            'popup-cooming-soon',
            { 'closing-popup': !showCoomingSoon },
        ]" v-if="showCoomingSoon">
            <p>Coming soon</p>
            <button @click="hidePopupCoomingSoon" class="btn-close-coming-soon">
                Close
            </button>
        </div>

        <!-- popup refere code -->
        <div class="popup-referer-code" v-if="isPopupCode">
            <div class="referer-code">Referer code</div>
            <form @submit.prevent="submitCode">
                <input class="code-input" :class="{ 'input-error': errorMessage }" type="text" v-model="code" id="code"
                    @input="clearError" placeholder="Enter code" />
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

        <!-- đăng ký nhập mã code thành công -->
        <div class="enter-code-success" v-if="isSuccess">
            <span>Success!</span>
        </div>
    </div>
</template>
