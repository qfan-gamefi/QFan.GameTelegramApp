<template>
    <div class="box-action">
        <router-link to="/market" class="market">
            <img
                loading="lazy"
                class="img-market"
                src="./../../../public/assets/shop/Market.png"
                @click="handleBackButton"
            />
            <div class="shine"></div>
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

.box-action .img-market {
    width: 70px;
    object-fit: cover;
}

.market {
    position: relative;
}
/* .market:after {
    content: "";
    display: block;
    position: absolute;
}
.market:after {
    left: 0;
    top: 0;
    width: 4px;
    height: 56px;
    background: #fff;
    z-index: 5;
    animation: sheen 5s infinite;
}
@keyframes sheen {
    0%,
    100% {
        left: 0;
        opacity: 0;
    }
    1% {
        opacity: 1;
    }
    10% {
        left: calc(100% - 4px);
    }
    11%,
    98% {
        left: 100%;
        opacity: 0;
    }
} */

.shine {
    position: absolute;
    top: 10%;
    left: 65%;
    width: 1px;
    height: 18px;
    background: #fff;
    transform: rotate(15deg);
    animation: shine 5s infinite;
}
.shine:before,
.shine:after {
    content: "";
    display: block;
    position: absolute;
}
.shine:after {
    top: 6px;
    left: -2px;
    width: 5px;
    height: 5px;
    background: #fff;
    transform: rotate(45deg);
    box-shadow: 0 0 8px 5px rgba(255, 255, 255, 0.75);
}
@keyframes shine {
    0% {
        opacity: 0;
    }
    34% {
        opacity: 0;
        transform: rotate(15deg);
    }
    40% {
        opacity: 0.6;
        transform: rotate(620deg);
    }
    48%,
    100% {
        opacity: 0;
        transform: rotate(635deg);
    }
}
</style>
