<template>
    <div class="box-action">
        <!-- <router-link to="/airdrop">
            <img loading="lazy" :src="iconAirdrop" class="w-[50px]" />
        </router-link> -->
        <router-link to="/fomation">
            <img loading="lazy" :src="iconFomation" class="w-[50px]" />
        </router-link>
        <div @click="setRouterFusion()">
            <router-link to="/inventory">
                <img loading="lazy" :src="iconFusion" class="img-fusion" />
            </router-link>
        </div>
        <div class="market">
            <router-link to="/market">
                <img loading="lazy" class="img-market" :src="iconMarket" />
                <div class="shine shine-1"></div>
                <div class="shine shine-4"></div>
            </router-link>
        </div>
        <router-link to="/inventory">
            <img loading="lazy" class="img-inventory" :src="iconInventory" />
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
        iconAirdrop() {
            if (this.$i18n.locale === "zh") {
                return "/assets/airdrop/airdrop_logo_zh.png";
            } else {
                return "/assets/airdrop/airdrop_logo.png";
            }
        },
        iconFusion() {
            if (this.$i18n.locale === "zh") {
                return "/assets/inventory/fusion_icon_zh.png";
            } else {
                return "/assets/inventory/fusion_icon.png";
            }
        },
        iconMarket() {
            if (this.$i18n.locale === "zh") {
                return "/assets/shop/marketplace_logo_zh.png";
            } else {
                return "/assets/shop/marketplace_logo.png";
            }
        },
        iconInventory() {
            if (this.$i18n.locale === "zh") {
                return "/assets/inventory/inventory_logo_zh.png";
            } else {
                return "/assets/inventory/inventory_logo.png";
            }
        },
        iconFomation(){
            return "/assets/fomation/fomation_logo.png";
        }
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
        setRouterFusion() {
            this.$store.commit("setRouterFusion", true);
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
    gap: 15px;
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
    height: 58px;
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
    /* border: 1px solid #fff; */
    /* border-radius: 5px; */
    /* background: #320460; */
    display: flex;
    align-items: center;
    /* padding: 0 5px; */
    /* height: 50px; */
}
.img-market {
    height: 50px;
    object-fit: cover;
}
</style>
