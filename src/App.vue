<script setup lang="ts">
import Phaser from 'phaser';
import SampleGame from './rising-star/SampleGame.vue';
import { createApp, onMounted, onUnmounted, ref } from 'vue';
import Telegram, { useWebApp } from 'vue-tg';



onMounted(() => {
     const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "chat_id": 5314337740,
            "text": JSON.stringify(window.Telegram.WebApp.initDataUnsafe)
        });
        const requestOptions : any = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
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
  }
};
</script>

<style scoped>
    .invisible {
        visibility: hidden;
    }
    .full-width{
        width: 100%;
    }
    .container{
        width: 384px;
        height: 490px;
    }
    .wOne3rd{
        width: 33.333333%;
    }
    .w50{
        width: 50%;
    }
    .absolute-training-btn{
        position: absolute;
        top : 40%;
        width: 384px;
        padding: 10px;
        background-color: rgba(11, 92, 197, 0.24);
        border: none;
        font-style: italic;
    }
    .absolute-training-btn:hover{
        background-color: rgba(11, 92, 197, 0.589);
        color: white;
        font-weight: 1.2em;
    }
    .button-container{
        padding: 3px;
    }
    .button-container button{
        padding: 5px
    }
</style>
<template>
    <!-- <button class="absolute-training-btn button-decoration">START TRAINING</button> -->
    <div class="container">
        <div class="button-container">
            <button id="login_button" class="full-width" v-show="!isTelegramLogin">
                LOGIN
            </button>
            <div class="user_info_area" v-show="isTelegramLogin">
                <span>Hello</span>
                <label v-text="first_name"></label>
                <label v-text="last_name"></label>
            </div>
        </div>
        <SampleGame class="full-width"/>
        <div class="button-container">
            <button class="w50 button-decoration">Shop</button>
            <button class="w50 button-decoration">Mission</button>
            <button class="wOne3rd button-decoration">Booster</button>
            <button class="wOne3rd button-decoration">Invite</button>
            <button class="wOne3rd button-decoration">Event</button>
            <span v-text="telegram_bot_link" style="font-size: smaller;"></span>
        </div>
    </div>
</template>
