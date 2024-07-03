<template>
    <router-view>
        <div class="wr-create-wallet">
            <div class="btn-close" @click="navigateToHome">
                <i class="fa-solid fa-rectangle-xmark"></i>
            </div>

            <div class="wr-content-wallet">
                <div class="title">Create Wallet</div>

                <div class="desc">
                    We have created a unique QUAI address for you, which is
                    similar to your telegram nickname.
                </div>

                <div class="wl-addr">
                    <div class="title-addr">Wallet password</div>
                    <input
                        class="code-input"
                        :class="{ 'input-error': errorMessage }"
                        type="text"
                        v-model="walletPassword"
                        id="code"
                        @input="clearError"
                        placeholder="Enter password"
                    />
                    <div v-if="errorMessage" class="text-err-code">
                        {{ errorMessage }}
                    </div>
                </div>

                <div class="wr-phrase">
                    <div class="wr-title">
                        <div class="title">Seed phrase</div>
                        <div class="copy" @click="copySeedPhrase()">
                            <i class="fa-solid fa-copy"></i>
                        </div>
                    </div>
                    <div class="desc">
                        Copy your seed phrase right now to avoid losing your
                        account!
                    </div>
                </div>

                <div class="wr-phrase-text">
                    {{ mnemonic }}
                </div>

                <div class="wr-btn">
                    <button @click="createWallet()">Create</button>
                </div>
            </div>
        </div>
    </router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { addAdddressByShard, createWallet } from "../../storage/wallet";
import { generateRandomMnemonic } from "../../crypto";
import { getDefaultQuaiContext } from "@/storage/wallet/shard";

export default defineComponent({
    name: "WalletCreate",
    data() {
        return {
            walletPassword: "",
            mnemonic: "",
            errorMessage: "",
        };
    },
    methods: {
        navigateToHome() {
            this.$router.push("/");
        },
        async createWallet() {
            let hdWallet = await createWallet(
                this.walletPassword,
                this.mnemonic
            );
            console.log("hdWallet", hdWallet);
            const context = await getDefaultQuaiContext();
            console.log("context", context);

            if (context) {
                await addAdddressByShard(context?.shard);
                this.$router.push({ name: "WalletDetail" });
            }
        },
        clearError() {
            this.errorMessage = "";
        },
        copySeedPhrase() {
            navigator.clipboard.writeText(this.mnemonic);
        },
    },
    async mounted() {
        this.mnemonic = await generateRandomMnemonic();
    },
});
</script>

<style scoped lang="scss">
.wr-create-wallet {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    z-index: 999;
    animation: fadeIn 0.3s ease forwards;
    color: #fff;
    background-image: url("./../../../public/assets/wallet/background-wallet.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    font-family: monospace;
}

@keyframes fadeIn {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.wr-content-wallet {
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 30px;
    text-shadow: -1px -1px 0 #8c0000, 1px -1px 0 #8c0000, -1px 1px 0 #8c0000,
        1px 1px 0 #8c0000;
    .title {
        font-size: 28px;
        font-weight: bold;
    }
}

.wl-addr {
    background-color: #fff;
    padding: 15px;
    border-radius: 10px;
    text-shadow: none;
    .title-addr {
        color: #000000;
        margin-bottom: 5px;
    }
    .ct-addr {
        color: #006dbc;
        font-weight: bold;
        word-wrap: break-word;
        white-space: normal;
    }
}

.wr-title {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 5px;

    .title {
        font-size: 18px;
    }

    .copy {
        color: #8c0000;
    }
}

.wr-phrase-text {
    background-color: #fff;
    color: #000000;
    padding: 15px;
    border-radius: 10px;
    text-shadow: none;
    font-weight: bold;
}

.wr-btn {
    position: absolute;
    width: calc(100% - 40px);
    bottom: 40px;
    left: 0;
    padding: 20px;
    button {
        border-radius: 10px;
    }
}

.btn-close {
    text-align: right;
    padding: 10px;
    color: #8c0000;
    font-size: 20px;
}
</style>
