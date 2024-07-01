<template>
    <div class="wr-flip-page">
        <div class="banner-flip"></div>

        <!-- <div class="wr-btn">
            <div>Flip</div>
            <div>History</div>
        </div> -->

        <div class="box-detail-flip">
            <div class="wr-cooldown">
                <div class="title">Cooldown</div>
                <div class="time">0:59</div>

                <div id="coin" :class="flipClass">
                    <div class="side-a"></div>
                    <div class="side-b"></div>

                    <!-- <div class="wr-two-coin">
                        <div class="box-qfp"></div>
                        <div class="box-quai"></div>
                    </div> -->
                </div>

                <div class="box-value">200</div>

                <div class="box-submit">
                    <div class="btn-submit" @click="flipCoin">Submit</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "FlipPage",
    props: {
        isDetailEvent: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            flipClass: "",
        };
    },
    methods: {
        navigateToHome() {
            this.$router.push("/");
        },
        flipCoin() {
            const flipResult = Math.random();
            this.flipClass = "";
            setTimeout(() => {
                if (flipResult <= 0.5) {
                    this.flipClass = "heads";
                    console.log("it is head");
                } else {
                    this.flipClass = "tails";
                    console.log("it is tails");
                }
            }, 100);
        },
    },
});
</script>

<style scoped lang="scss">
.wr-flip-page {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    left: 0;
    z-index: 999;
    animation: fadeInDetailEvent 0.1s ease forwards;
    color: #fff;
    background-image: url("./../../public/assets/event/background-flip.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

@keyframes fadeInDetailEvent {
    0% {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.banner-flip {
    background-image: url("./../../../public//assets/event/banner-flip.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    height: 11%;
}

.box-detail-flip {
    margin: 15px 20px;
    height: 100%;
}

.wr-cooldown {
    background-color: #500d79;
    height: 100%;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    border: 2px solid #d631ff;
}

.title {
    text-align: center;
    font-size: 20px;
    padding: 20px;
    color: #e6b2ff;
}
.time {
    font-size: 20px;
    color: #ffcf56;
    text-align: center;
}

#coin {
    position: relative;
    margin: 0 auto;
    cursor: pointer;
    width: 100px;
    height: 100px;
    transition: transform 1s ease-in;
    transform-style: preserve-3d;
}
#coin.heads {
    -webkit-animation: flipHeads 3s ease-out forwards;
    -moz-animation: flipHeads 3s ease-out forwards;
    -o-animation: flipHeads 3s ease-out forwards;
    animation: flipHeads 3s ease-out forwards;
}
#coin.tails {
    -webkit-animation: flipTails 3s ease-out forwards;
    -moz-animation: flipTails 3s ease-out forwards;
    -o-animation: flipTails 3s ease-out forwards;
    animation: flipTails 3s ease-out forwards;
}
#coin div {
    position: absolute;
    backface-visibility: hidden;
}

.side-a {
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("./../../../public/assets/event/coin-img.png");
    // width: 70px;
    // height: 70px;
    z-index: 100;
    // background-color: #bb0000;
    // width: 70px;
    // height: 70px;
    height: 100%;
    width: 100%;
}
.side-b {
    // width: 70px;
    // height: 70px;
    height: 100%;
    width: 100%;
    background-color: #3e3e3e;
    transform: rotateY(-180deg);
}
@keyframes flipHeads {
    from {
        -webkit-transform: rotateY(0);
        -moz-transform: rotateY(0);
        transform: rotateY(0);
    }
    to {
        -webkit-transform: rotateY(1800deg);
        -moz-transform: rotateY(1800deg);
        transform: rotateY(1800deg);
    }
}
@keyframes flipTails {
    from {
        -webkit-transform: rotateY(0);
        -moz-transform: rotateY(0);
        transform: rotateY(0);
    }
    to {
        -webkit-transform: rotateY(1980deg);
        -moz-transform: rotateY(1980deg);
        transform: rotateY(1980deg);
    }
}

.wr-two-coin {
    display: flex;
    gap: 50px;
}
.box-qfp {
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("./../../../public/assets/event/coin-qfp.png");
    width: 55px;
    height: 55px;
}
.box-quai {
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    background-image: url("./../../../public/assets/event/coin-quai.png");
    width: 55px;
    height: 55px;
}

.box-value {
    background-color: #ffa53a;
    width: fit-content;
    padding: 5px 10px;
    border-radius: 5px;
    margin: 0 auto;
}

.box-submit {
    margin: 20px;
    .btn-submit {
        background-color: #3eff3a;
        padding: 5px 10px;
        border-radius: 5px;
        width: fit-content;
        margin: 0 auto;
    }
}
</style>
