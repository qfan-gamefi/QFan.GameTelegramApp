<template>
    <div class="box-action">
            <router-link to="/airdrop">
                <img
                    loading="lazy"
                    src="./../../../public/assets/airdrop/airdrop_logo.png"
                    class="img-fusion"
                />
            </router-link>
        <div @click="setRouterFusion()">
            <router-link to="/inventory">
                <img
                    loading="lazy"
                    src="./../../../public/assets/inventory/fusion_icon.png"
                    class="img-fusion"
                />
            </router-link>
        </div>
        <div class="market">
            <router-link to="/market">
                <img
                    loading="lazy"
                    class="img-market"
                    src="./../../../public/assets/shop/marketplace.png"
                />
                <div class="shine shine-1"></div>
                <div class="shine shine-4"></div>
            </router-link>
        </div>
        <router-link to="/inventory">
            <img
                loading="lazy"
                class="img-inventory"
                src="./../../../public/assets/inventory/inventory.png"
            />
        </router-link>
        <router-link to="/flip">
            <img
                loading="lazy"
                class="img-flip"
                src="./../../../public/assets/event/FlipCoin.gif"
            />
            <div class="icon-auto-flip" v-if="autoFlipValue">
                <img
                    src="./../../../public/assets/event/A_flip.png"
                    loading="lazy"
                />
            </div>
        </router-link>
    </div>

    <PopupComingSoon
        :visible="showCoomingSoon"
        message="Coming soon!"
        @close="showCoomingSoon = false"
    />
</template>

<script lang="ts">
import PopupComingSoon from "@/components/popup/PopupComingSoon.vue";
import { mapActions, mapState } from "vuex";

export default {
    name: "BoxAction",
    components: {
        PopupComingSoon,
    },
    data() {
        return {
            showCoomingSoon: false,
            autoFlipValue: false,
        };
    },
    computed: {
        ...mapState(["autoFlipStore"]),
    },
    watch: {
        autoFlipStore(newValue) {
            this.autoFlipValue = newValue;
        },
    },
    created() {
        this.autoFlipValue = this.autoFlipStore;
    },
    methods: {
        // handleBackButton() {
        //     this.$emit("back-clicked");
        // },
        setRouterFusion(){
            this.$store.commit("setRouterFusion", true);
        }
    },
};
</script>

<style scoped>
.box-action {
    position: absolute;
    top: 37%;
    right: 5%;
    display: flex;
    gap: 20px;
    align-items: end;
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

@keyframes zoomInOut {
    0% {
        transform: scale(0.9);
        opacity: 1;
    }

    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.shine {
    position: absolute;
    /* top: 10%;
    left: 65%;
    width: 1px;
    height: 18px; */
    background: #fff;
    transform: rotate(15deg);
    animation: shine 3s infinite;
}

.shine:before,
.shine:after {
    content: "";
    display: block;
    position: absolute;
}

.shine:after {
    /* top: 6px;
    left: -2px;
    width: 5px;
    height: 5px; */
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

.shine-1 {
    top: 55%;
    left: 15%;
    width: 1px;
    height: 18px;
}

.shine-1:after {
    top: 6px;
    left: -2px;
    width: 5px;
    height: 5px;
}

.shine-2 {
    top: 60%;
    left: 80%;
    width: 1px;
    height: 18px;
    animation-delay: 0.5s;
}

.shine-2:after {
    top: 6px;
    left: -2px;
    width: 5px;
    height: 5px;
}

.shine-3 {
    top: 10%;
    left: 15%;
    width: 1px;
    height: 16px;
    animation-delay: 1s;
}

.shine-3:after {
    top: 6px;
    left: -2px;
    width: 5px;
    height: 5px;
}

.shine-4 {
    top: 5%;
    left: 75%;
    width: 1px;
    height: 16px;
    animation-delay: 1s;
}

.shine-4:after {
    top: 6px;
    left: -2px;
    width: 5px;
    height: 5px;
}
.icon-auto-flip {
    position: absolute;
    top: -10%;
    right: 0;
}
.icon-auto-flip img {
    width: 16px;
}

.img-flip {
    width: 50px;
    object-fit: cover;
}
.img-fusion {
    height: 55px;
    object-fit: cover;
}

.img-inventory {
    border-radius: 3px;
    height: 50px;
    object-fit: cover;
    -webkit-animation: glowing 1500ms infinite;
    -moz-animation: glowing 1500ms infinite;
    -o-animation: glowing 1500ms infinite;
    animation: glowing 1500ms infinite;
}
.market {
    position: relative;
    border: 1px solid #fff;
    border-radius: 5px;
    background: #320460;
    display: flex;
    align-items: center;
    padding: 0 5px;
    height: 50px;
}
.img-market {
    height: 40px;
    object-fit: cover;
}
</style>
