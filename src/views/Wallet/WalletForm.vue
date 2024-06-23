<template>
    <router-view>
        <div class="popup-wallet">
            <div class="wraper-wallet">
                <div class="logo-wallet">
                    <img src="@public/assets/logo.svg" />
                </div>
                <div class="title-wallet text-outline-black">
                    QFP Wallet, the first web wallet for Quai Network, is here.
                </div>

                <div class="box-btn">
                    <button @click="navigateToCreateWallet">
                        <div class="btn-img">
                            <img src="@public/assets/logo.svg" />
                            <div class="text-qfan">QFAN</div>
                        </div>

                        <div class="btn-title">Create Wallet</div>
                    </button>

                    <button>
                        <div class="btn-img">
                            <img src="@public/assets/logo.svg" />
                            <div class="text-qfan">QFAN</div>
                        </div>
                        <div class="btn-title">Import Wallet</div>
                    </button>
                </div>
            </div>
        </div>
    </router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
    name: "WalletForm",
    methods: {
        navigateToCreateWallet() {
            this.$router.push("/wallet/create");
        },
    },
});
</script>

<style scoped lang="scss">
button {
    padding: 25px 50px;
    -webkit-text-stroke: 1px #8c0000;
}
.popup-wallet {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    z-index: 999;
    animation: fadeInWallet 0.3s ease forwards;
    color: #fff;
    background-image: url("./../../../public/assets/wallet/background-wallet.png");
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
    height: 100%;
    justify-content: center;
    gap: 35px;
}
.box-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    margin: 0 50px;
}
.logo-wallet {
    text-align: center;
    img {
        widows: 100px;
        height: 100px;
    }
}

.title-wallet {
    padding: 0 20px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
    margin: 20px 0 70px;
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
    position: absolute;
    right: 15%;
}
.text-qfan {
    -webkit-text-stroke: 0px;
    color: #841c2e;
}
</style>
