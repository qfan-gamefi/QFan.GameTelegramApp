<script setup lang="ts">
import { onMounted } from "vue";
import Telegram, { useWebApp } from "vue-tg";
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
</script>

<script lang="ts">
export default {
  data() {
    const telegram_bot_link = "Invite Link: https://t.me/Sampletwabot?start=r_";
    const first_name = window.Telegram.WebApp.initDataUnsafe.user?.first_name;
    const last_name = window.Telegram.WebApp.initDataUnsafe.user?.last_name;
    return {
      isTelegramLogin: Object.keys(window.Telegram.WebApp.initDataUnsafe).length != 0,
      first_name: first_name,
      last_name: last_name,
      telegram_bot_link : telegram_bot_link+window.Telegram.WebApp.initDataUnsafe.user?.id
    }
  },
  methods: {
    onTakeReward(){
        SampleGame?.methods?.ChangeSence('IdleSence');
    }
  }
};
</script>

<style scoped>
@import "./styles/global.css";
@import "./styles/app.css";

.invisible {
    visibility: hidden;
}
.full-width {
    width: 100%;
}
.container {
    width: 384px;
    height: 490px;
}
.wOne3rd {
    width: 33.333333%;
}
.w50 {
    width: 50%;
}
.absolute-training-btn {
    position: absolute;
    top: 40%;
    width: 384px;
    padding: 10px;
    background-color: rgba(11, 92, 197, 0.24);
    border: none;
    font-style: italic;
}
.absolute-training-btn:hover {
    background-color: rgba(11, 92, 197, 0.589);
    color: white;
    font-weight: 1.2em;
}
</style>

<template>
    <button class="absolute-training-btn button-decoration">TAKE REWARD</button>
    <div class="container">
        <div>
            <button
                id="login_button"
                class="btn-login"
                v-show="!isTelegramLogin"
            >
                LOGIN
            </button>
            <div class="user_info_area" v-show="isTelegramLogin">
                <span>Hello</span>
                <label v-text="first_name"></label>
                <label v-text="last_name"></label>
            </div>
            <div class="full-width">
                <span>13216546546 QFP</span>
            </div>
        </div>
        <SampleGame class="full-width" />
        <div class="button-container">
            <div class="row">
                <button><span>Shop</span></button>
                <button><span>Mission</span></button>
            </div>
            <div class="row">
                <button><span>Booster</span></button>
                <button><span>Invite</span></button>
                <button><span>Event</span></button>
            </div>
        </div>
        <span v-text="telegram_bot_link" class="nunito-fonts"></span>
    </div>
    <div class="container">
        <SampleGame id="main-game" class="full-width"/>
    </div>
</template>
