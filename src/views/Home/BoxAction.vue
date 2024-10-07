<template>
    <div class="box-action">
        <router-link to="/market">
            <img
                loading="lazy"
                class="img-market"
                src="./../../../public/assets/shop/Market.png"
                @click="handleBackButton"
            />
        </router-link>
        <router-link to="/inventory">
            <img
                loading="lazy"
                class="img-inventory"
                src="./../../../public/assets/inventory/inventory.png"
                @click="handleBackButton"
            />
        </router-link>
        <router-link to="/flip">
            <img
                loading="lazy"
                class="img-flip"
                src="./../../../public/assets/event/FlipCoin.gif"
                @click="handleBackButton"
            />
        </router-link>
    </div>
</template>

<script lang="ts">
export default {
    name: "BoxAction",
    methods: {
        handleBackButton() {
            // Telegram.WebApp.BackButton.show();

            // Telegram.WebApp.BackButton.onClick(() => {
            //     this.$router.push("/");
            //     this.getInfoUser();
            //     Telegram.WebApp.BackButton.hide();
            // });
            this.$emit("back-clicked");
        },
    },
};
</script>

<style scoped>
.box-action {
    position: absolute;
    top: 37%;
    right: 5%;
    display: flex;
    /* flex-direction: column; */
    align-items: center;
    gap: 20px;
}

.box-action .img-flip {
    width: 50px;
    object-fit: cover;
}
.box-action .img-inventory {
    border-radius: 3px;
    width: 50px;
    object-fit: cover;
    -webkit-animation: glowing 1500ms infinite;
    -moz-animation: glowing 1500ms infinite;
    -o-animation: glowing 1500ms infinite;
    animation: glowing 1500ms infinite;
}
.box-action .img-market {
    width: 70px;
    object-fit: cover;
}
@-webkit-keyframes glowing {
    0% {
        -webkit-box-shadow: 0 0 3px #271439;
    }
    50% {
        -webkit-box-shadow: 0 0 10px #30154b;
    }
    100% {
        -webkit-box-shadow: 0 0 3px #4d1e79;
    }
}

@-moz-keyframes glowing {
    0% {
        -moz-box-shadow: 0 0 3px #271439;
    }
    50% {
        -moz-box-shadow: 0 0 10px #30154b;
    }
    100% {
        -moz-box-shadow: 0 0 3px #4d1e79;
    }
}

@-o-keyframes glowing {
    0% {
        box-shadow: 0 0 3px #271439;
    }
    50% {
        box-shadow: 0 0 10px #30154b;
    }
    100% {
        box-shadow: 0 0 3px #4d1e79;
    }
}

@keyframes glowing {
    0% {
        box-shadow: 0 0 3px #271439;
    }
    50% {
        box-shadow: 0 0 10px #30154b;
    }
    100% {
        box-shadow: 0 0 3px #4d1e79;
    }
}

/* .box-action a {
    color: #fff;
    text-decoration: none;
}

.box-action button {
    border: none;
    border-radius: 8px;
    font-size: 10px;
    padding: 10px;
} */
</style>
