<template>
    <router-view>
        <div class="popup-wallet">
            <div class="wraper-wallet">
                <div class="logo-wallet">
                    <img src="@public/assets/wallet/logo-pegalus.svg" />
                </div>
                <div class="title-wallet text-outline-black">
                    PELAGUS Wallet, the first web wallet for Quai Network, is
                    here.
                </div>
            </div>

            <div class="box-btn">
                <button @click="navigateToCreateWallet">
                    <!-- <div class="btn-img">
                            <img src="@public/assets/logo.svg" />
                            <div class="text-qfan">QFAN</div>
                        </div> -->

                    <div class="btn-title">Import Wallet</div>
                </button>

                <!-- <button>
                        <div class="btn-img">
                            <img src="@public/assets/logo.svg" />
                            <div class="text-qfan">QFAN</div>
                        </div>
                        <div class="btn-title">Import Wallet</div>
                    </button> -->
            </div>
        </div>
    </router-view>
</template>

<script lang="ts">
import { VAULT_KEY } from "@/crypto_utils/storage";
import { storage } from "@/storage/storage";
import { defineComponent } from "vue";

export default defineComponent({
    name: "WalletForm",
    data() {
        return {};
    },
    methods: {
        navigateToCreateWallet() {
            this.$router.push("/wallet/create");
        },
    },
    async mounted() {
        const vault = await storage.get(VAULT_KEY);
        if (vault) {
            this.$router.push("/wallet/detail");
        }
    },
});
</script>

<style scoped lang="scss">
.popup-wallet {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    z-index: 999;
    animation: fadeInWallet 0.3s ease forwards;
    color: #fff;
    background-image: url("./../../../public/assets/wallet/background-wallet-pelagus.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    font-family: monospace;
}

@keyframes fadeInWallet {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.wraper-wallet {
    display: flex;
    flex-direction: column;
    gap: 45px;
    position: absolute;
    transform: translate(-50%, -50%);
    top: 40%;
    left: 50%;
    width: 100%;
}

.box-btn {
    position: absolute;
    bottom: 15%;
    left: 50%;
    transform: translate(-50%, 0);
    width: 100%;
    button {
        margin: 0 30px;
        width: calc(100% - 60px);
        border-radius: 10px;
        background: #fff;
        padding: 25px 80px;
        -webkit-text-stroke: 0px;
    }
}

.logo-wallet {
    text-align: center;

    img {
        width: 150px;
    }
}

.title-wallet {
    padding: 0 20px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
}

.btn-img {
    display: flex;
    position: absolute;
    left: 5%;
    gap: 5px;
    align-items: center;

    img {
        width: 20px;
        height: 20px;
    }
}

.btn-title {
    // position: absolute;
    // right: 15%;
    color: #0054d2;
}

.text-qfan {
    -webkit-text-stroke: 0px;
    color: #841c2e;
}
</style>
