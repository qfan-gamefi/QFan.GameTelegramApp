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

            <div class="box-btn flex flex-col gap-2">
                <div class="flex text-[12px] justify-center">
                    <div>If you don’t have a &nbsp;</div>
                    <div class="cursor-pointe">
                        <a
                            href="https://pelaguswallet.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="underline"
                        >
                            Pelagus Wallet,
                        </a>
                        <a
                            href="https://chromewebstore.google.com/detail/pelagus/nhccebmfjcbhghphpclcfdkkekheegop"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="underline"
                        >
                            create one here.
                        </a>
                    </div>
                </div>
                <button @click="navigateToCreateWallet">
                    <div class="btn-title">Import Wallet</div>
                </button>
            </div>
        </div>
    </router-view>
</template>

<script lang="ts">
import HDKeyring from "@/crypto_utils/HDKeyring";
import BackButtonTelegram from "@/mixins/BackButtonTelegram";
import { defineComponent } from "vue";

export default defineComponent({
    name: "WalletForm",
    mixins: [BackButtonTelegram],
    data() {
        return {};
    },
    methods: {
        navigateToCreateWallet() {
            this.$router.push("/wallet/create");
        },
    },
    async mounted() {
        const hdKeyring = new HDKeyring();
        await hdKeyring.loadKeyrings();
        if (hdKeyring.isSigning) {
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
    align-items: center;
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
        background: #fff !important;
        padding: 25px 80px;
        -webkit-text-stroke: 0px;
    }
}

.logo-wallet {
    img {
        width: 200px;
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
    color: #000;
    font-weight: 800;
}
.text-link {
    text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff,
        1px 1px 0 #fff;
}
</style>
