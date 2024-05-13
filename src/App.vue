<script setup lang="ts">
import { onMounted } from "vue";
import Telegram from "vue-tg";
import SampleGame from "./rising-star/SampleGame.vue";



onMounted(() => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        chat_id: 5314337740,
        text: JSON.stringify(window.Telegram.WebApp.initDataUnsafe),
    });
    const requestOptions: any = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
    };

    // fetch("https://api.telegram.org/bot6815564492:AAHq_HhL8PDPvreGid0pBoCt6MssEWyyyxo/sendMessage", requestOptions)
    //     .then((response) => response.text())
    //     .then((result) => console.log(result))
    //     .catch((error) => console.error(error));
});
const changeScene = () => {
    const scene = toRaw(phaserRef.value.scene);
    if (scene) {
        //  Call the changeScene method defined in the `MainMenu`, `Game` and `GameOver` Scenes
        scene.changeScene();
    }
}
</script>

<script lang="ts">
export default {
    data() {
        const telegram_bot_link =
            "Invite Link: https://t.me/Sampletwabot?start=r_";

        let first_name = "";
        let last_name = "";

        // Kiểm tra xem Telegram WebApp đã khởi tạo dữ liệu hay chưa
        if (
            window.Telegram &&
            window.Telegram.WebApp &&
            window.Telegram.WebApp.initDataUnsafe
        ) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            if (user) {
                first_name = user.first_name || "";
                last_name = user.last_name || "";
            }
        }

        // const first_name =
        //     window.Telegram.WebApp.initDataUnsafe.user?.first_name;
        // const last_name = window.Telegram.WebApp.initDataUnsafe.user?.last_name;

        return {
            // isTelegramLogin:
            //     Object.keys(window.Telegram.WebApp.initDataUnsafe).length != 0,
            isTelegramLogin: !!first_name || !!last_name,
            first_name: first_name,
            last_name: last_name,
            telegram_bot_link:
                telegram_bot_link +
                window.Telegram.WebApp.initDataUnsafe.user?.id || "",
            showCoomingSoon: false,
        };
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
            alert("Copied to clipboard!");
            // this.isCopiedToClipboard = true;
            // setTimeout(() => {
            //     this.isCopiedToClipboard = false;
            // }, 2000);
        },
        showPopupCoomingSoon() {
            this.showCoomingSoon = true;
        },
        hidePopupCoomingSoon() {
            this.showCoomingSoon = false;
        },
    },
};
</script>

<style scoped>
@import "./styles/global.css";
@import "./styles/app.css";
</style>

<template>

    <div class="container">
        <button class="absolute-training-btn button-decoration">START TRAINING</button>
        <div>
            <button id="login_button" class="btn-login" v-show="!isTelegramLogin">
                LOGIN
            </button>
            <button class="commit_reward" @click="commit_reward">Take reward and start training</button>
        </div>

        <div class="container-game">
            <div class="container-info" v-show="isTelegramLogin">
                <div class="wrap-score">SCORE: 0</div>

                <div class="wrap-username">
                    {{ first_name }} {{ last_name }}
                </div>
            </div>

            <SampleGame ref="phaserRef" @current-active-scene="currentScene" />
        </div>

        <div class="button-container">
            <div class="row">
                <button @click="showPopupCoomingSoon"><span>Shop</span></button>
                <button @click="copyToClipboard">
                    <span>Copy Invite</span>
                </button>
            </div>
            <div class="row">
                <button @click="showPopupCoomingSoon">
                    <span>Booster</span>
                </button>
                <button @click="showPopupCoomingSoon">
                    <span>Mission</span>
                </button>
                <button @click="showPopupCoomingSoon">
                    <span>Event</span>
                </button>
            </div>
        </div>
        <!-- <span v-text="telegram_bot_link" class="nunito-fonts"></span> -->

        <div :class="[
            'popup-cooming-soon',
            { 'closing-popup': !showCoomingSoon },
        ]" v-if="showCoomingSoon">
            <p>Coming soon</p>
            <button @click="hidePopupCoomingSoon">Close</button>
        </div>
    </div>
</template>
