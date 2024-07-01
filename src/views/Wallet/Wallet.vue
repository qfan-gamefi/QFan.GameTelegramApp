<template>
    <router-view>
        <div class="wr-detail-wallet">
            <div class="header-wl">
                <div class="menu-icon"><i class="fa-solid fa-bars"></i></div>

                <div class="info">
                    <div><img src="@public/assets/logo.svg" /></div>
                    <div class="name">Winter</div>
                    <div class="add-wallet">(...auth)</div>
                    <div class="copy-wallet">
                        <i class="fa-solid fa-copy"></i>
                    </div>
                </div>

                <div class="user-icon">
                    <i class="fa-solid fa-user-plus"></i>
                </div>
            </div>

            <div class="body-wl">
                <div class="wr-balance">
                    <div class="title">
                        Total balance

                        <div @click="toggleVisibility">
                            <div v-if="!isVisible">
                                <i class="fa-solid fa-eye"></i>
                            </div>
                            <div v-if="isVisible">
                                <i class="fa-solid fa-eye-slash"></i>
                            </div>
                        </div>
                    </div>
                    <div>{{ isVisible ? totalBalance : "*********" }}</div>

                    <div class="wr-btn">
                        <div class="btn-item">
                            <i class="fa-solid fa-copy"></i> Receive
                        </div>
                        <div class="btn-item">
                            <i class="fa-solid fa-paper-plane"></i> Send
                        </div>
                        <div class="btn-item">
                            <i class="fa-solid fa-faucet"></i> Faucet
                        </div>
                    </div>
                </div>

                <div class="wr-coin">
                    <div class="title">Token</div>

                    <div class="box-content">
                        <div class="img">
                            <img src="@public/assets/logo-quai.svg" />
                        </div>
                        <div>
                            <div>QUAI</div>
                            <div class="price">$5</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "WalletDetail",
    data() {
        return {
            isVisible: false,
            totalBalance: "$10,000",
        };
    },
    methods: {
        navigateTo() {
            this.$router.push("/");
        },
        toggleVisibility() {
            this.isVisible = !this.isVisible;
        },
    },
    computed: {
        visibilityIcon() {
            return this.isVisible ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
        },
    },
    mounted() {
        console.log("WalletForm component is mounted");
    },
});
</script>

<style scoped lang="scss">
button {
    padding: 25px 50px;
    -webkit-text-stroke: 1px #8c0000;
}
.wr-detail-wallet {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    z-index: 999;
    animation: fadeInWallet 0.3s ease forwards;
    background-color: #fff;
    font-family: monospace;
    color: #000000;
    font-weight: bold;
}

@keyframes fadeInWallet {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.header-wl {
    display: flex;
    justify-content: space-between;
    padding: 20px;
    align-items: center;
}
.info {
    display: flex;
    align-items: center;
    gap: 10px;
    img {
        width: 25px;
    }
    .name {
        color: #00175f;
    }
    .add-wallet {
        color: #8f8f8f;
    }
    .copy-wallet {
        color: #8f8f8f;
    }
}

.body-wl {
    padding: 10px;

    .wr-balance {
        background-color: #f5f5f5;
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        .title {
            color: #00175f;
            font-size: 16px;
            display: flex;
            gap: 10px;
        }
        .wr-btn {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            .btn-item {
                padding: 5px 20px;
                background-color: #00175f;
                color: #fff;
                border-radius: 10px;
            }
        }
    }

    .wr-coin {
        padding: 30px 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        color: #00175f;
        .title {
            color: #00175f;
            font-size: 16px;
        }
        .box-content {
            display: flex;
            gap: 20px;
            align-items: center;
            .img {
                display: flex;
                img {
                    width: 25px;
                    height: 25px;
                }
            }
            .price {
                color: #03a400;
            }
        }
    }
}
</style>
