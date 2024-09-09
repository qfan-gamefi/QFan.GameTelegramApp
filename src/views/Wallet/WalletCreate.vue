<template>
    <router-view>
        <div class="wr-create-wallet">
            <div class="btn-close" @click="navigateToHome">
                <i class="fa-solid fa-rectangle-xmark"></i>
            </div>

            <div class="wr-content-wallet">
                <div class="title">Import Wallet</div>

                <!-- <div class="desc">
                    This account has been logged into from another device.
                    Please enter your passphrase to use this account.
                </div> -->
                <div class="title-pass">Wallet Password</div>
                <div class="wl-addr">
                    <div class="title-addr">Password</div>
                    <input class="code-input" :class="{ 'input-error': errorMessage }" type="password"
                        v-model="walletPassword" id="code" @input="clearError" placeholder="Enter password" />
                    <div class="title-addr">Confirm password</div>
                    <input class="code-input" :class="{ 'input-error': errorMessage }" type="password"
                        v-model="confirmPassword" id="code" @input="clearError" placeholder="Enter password" />
                </div>
                <div class="title-pass">Private Key</div>
                <div class="wr-phrase">
                    <textarea class="code-input" :class="{ 'input-error': errorMessage }" type="text" v-model="mnemonic"
                        id="code" @input="clearError"
                        placeholder="Enter private key export from Pelagus Wallet"></textarea>
                </div>

                <div v-if="errorMessage" class="text-err-code">
                    {{ errorMessage }}
                </div>

                <div class="wr-btn">
                    <button @click="createWallet()" style="color: #000;">Import</button>
                </div>
            </div>
        </div>
    </router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HDKeyring from "@/crypto_utils/HDKeyring";
import { SignerImportSource, SignerSourceTypes } from "@/crypto_utils/type";
import { secureStorage, storage } from "@/storage/storage";

export default defineComponent({
    name: "WalletCreate",
    data() {
        return {
            walletPassword: "",
            confirmPassword: "",
            mnemonic: "",
            errorMessage: "",
        };
    },
    methods: {
        navigateToHome() {
            this.$router.push("/");
            this.$router.push("/");
        },
        async createWallet() {
            if (!this.walletPassword) {
                this.errorMessage = "";
                setTimeout(() => {
                    this.errorMessage = "Please enter password";
                }, 200);

                return;
            }

            if (this.walletPassword !== this.confirmPassword) {
                this.errorMessage = "";
                setTimeout(() => {
                    this.errorMessage = "Password does not match";
                }, 200);

                return;
            }

            if (!this.mnemonic) {
                this.errorMessage = "";
                setTimeout(() => {
                    this.errorMessage = "Please enter seed phrase";
                }, 200);

                return;
            }

            await storage.remove("address");
            await storage.remove("tallyVaults");

            secureStorage.setPassword(this.walletPassword);
            const keyring: HDKeyring = new HDKeyring();
            await keyring.importKeyring({
                type: SignerSourceTypes.privateKey,
                privateKey: this.mnemonic,
            });

            await keyring.unlock();
            //get address
            const address = await keyring
                .getActiveAddress();

            if (address) {
                await storage.set("address", address);
                localStorage.setItem("walletType", "GOLDEN_AGE_WALLET");
                this.$router.push("/wallet/detail");
            } else {
                localStorage.clear();
                this.errorMessage = "";
                setTimeout(() => {
                    this.errorMessage = "Invalid private key";
                }, 200);
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
        // this.mnemonic = await generateRandomMnemonic();
        const walletType = localStorage.getItem("walletType");
        if (walletType !== "GOLDEN_AGE_WALLET_V2") {
            localStorage.removeItem("tallyVaults");
            localStorage.removeItem("address");
            this.$router.push({ name: "WalletCreate" });
        }
    },
});
</script>

<style scoped lang="scss">
.wr-create-wallet {
    height: 100vh;
    width: 100%;
    overflow-y: auto;
    z-index: 999;
    animation: fadeIn 0.3s ease forwards;
    color: #fff;
    background-image: url("./../../../public/assets/wallet/background-wallet-pelagus.png");
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

.text-err-code {
    background-color: #e49f9f;
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    animation: fade 1s infinite;
}

.code-input:focus {
    border-color: #66afe9;
    outline: none;
}

.input-error {
    border-color: #8c0000;
    animation: pulse 1s infinite;
}

.wr-content-wallet {
    display: flex;
    flex-direction: column;
    padding: 20px;
    gap: 10px;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
        1px 1px 0 #000;

    .title {
        font-size: 30px;
        font-weight: bold;
        margin-bottom: 30px;
    }
}

.wl-addr {
    background-color: #fff;
    padding: 15px;
    border-radius: 10px;
    text-shadow: none;
    position: relative;
    display: flex;
    flex-direction: column;

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

    input {
        position: relative;
        border: 1px solid #cdcdcd;
        border-radius: 5px;
        padding: 10px;
        color: #333;
        margin-bottom: 10px;
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

.wr-phrase {
    background-color: #fff;
    color: #000000;
    padding: 15px;
    border-radius: 10px;
    text-shadow: none;
    font-weight: bold;
    display: flex;
    flex-direction: column;

    textarea {
        position: relative;
        border: 1px solid #cdcdcd;
        border-radius: 5px;
        padding: 10px;
        color: #333;
        margin-bottom: 10px;
        height: 100px;
    }
}

.wr-btn {
    width: calc(100% - 40px);
    padding: 20px;

    button {
        padding: 25px;
        border-radius: 10px;
        background: #fff;
        -webkit-text-stroke: 0px;
    }
}

.btn-close {
    text-align: right;
    padding: 10px;
    color: #fff;
    font-size: 20px;
}
</style>
