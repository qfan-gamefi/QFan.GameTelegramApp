<template>
    <div v-bind:class="{ 'overlay-template': isMint }"></div>

    <div class="popup-template fade-in" v-if="isMint">
        <div class="header">
            <div class="title">{{ $t("do_you_want_mint_nft") }}</div>

            <div @click="handleClose()" class="absolute top-2 right-2">
                <i
                    class="fa-solid fa-rectangle-xmark"
                    style="color: #ff0000"
                ></i>
            </div>
        </div>

        <div class="wp">
            <div class="desc">
                <InputField
                    v-model="password"
                    label="password"
                    placeholder="enter_password"
                    type="password"
                />
                <span v-if="passwordError" class="error-message">{{
                    $t(messPassError)
                }}</span>
            </div>
        </div>

        <div class="btn">
            <a
                class="text-center bg-[#FFFF73] text-[#00165A]"
                v-bind:disabled="isLoading"
                @click="submit()"
            >
                MINT
                <span v-if="isLoading"><i class="fa fa-spinner"></i></span>
            </a>
        </div>
    </div>

    <NotificationToast
        v-if="showNotification"
        :message="notificationMessage"
        :type="notificationType"
        @close="showNotification = false"
    />
</template>

<script lang="ts">
import InputField from "@/components/Input/InputField.vue";
import HDKeyring from "@/crypto_utils/HDKeyring";
import { secureStorage } from "@/storage/storage";
import { defineComponent } from "vue";
import NotificationToast from "@/components/NotificationToast.vue";
import NFTGoldenAgeCollection from "../../crypto_utils/constants/NFTGoldenAgeCollection.json";
import { trackEventBtn } from "@/utils";

export default defineComponent({
    name: "MintPage",
    components: {
        InputField,
        NotificationToast,
    },
    props: {
        isMint: {
            type: Boolean,
            default: false,
        },
        cardItem: {
            type: Object,
            required: true,
        },
    },
    mounted() {},
    watch: {},
    data() {
        return {
            password: "",
            passwordError: false,
            messPassError: "",
            isLoading: false,
            showNotification: false,
            notificationMessage: "",
            notificationType: "",
        };
    },
    methods: {
        async renderNotification(message, type) {
            this.notificationMessage = message;
            this.notificationType = type;
            this.showNotification = true;
        },
        async showSuccess(text) {
            this.renderNotification(text, "success");
        },
        async showError(text) {
            this.renderNotification(text, "error");
        },
        validatePassword() {
            const getPassword = secureStorage.getPassword();

            if (!this.password) {
                this.passwordError = true;
                this.messPassError = "required_password";
                return false;
            } else if (getPassword !== this.password) {
                this.passwordError = true;
                this.messPassError = "incorrect_password";
                return false;
            } else {
                this.passwordError = false;
                this.messPassError = "";
                return true;
            }
        },

        async submit() {
            if (!this.validatePassword()) {
                return;
            } else {
                trackEventBtn({label: 'MintNFT'});
                this.isLoading = true;
                try {
                    const contractAddress = this.cardItem.contract_address;
                    const keyringService = new HDKeyring();
                    await keyringService.unlock();
                    const fromAddress =
                        keyringService.getActiveWallet().address;
                    const price = await keyringService.callContractMethod(
                        "mintPrice",
                        fromAddress,
                        contractAddress,
                        NFTGoldenAgeCollection.abi,
                        []
                    );
                    let contractTransaction =
                        await keyringService.callContractMethod(
                            "mint",
                            fromAddress,
                            contractAddress,
                            NFTGoldenAgeCollection.abi,
                            [fromAddress, { value: price }]
                        );
                    const txReceipt = await contractTransaction.wait();
                    if (txReceipt.hash) {
                        this.showSuccess("NFT Minted Successfully");
                    } else {
                        this.showError(
                            "NFT transaction is pending. Please check in My NFTs page"
                        );
                    }
                } catch (error) {
                    this.showError(
                        "NFT transaction is pending. Please check in My NFTs page"
                    );
                } finally {
                    this.isLoading = false;
                    this.$emit("closeReload");
                }
            }
        },
        handleClose() {
            this.$emit("close");
        },
    },
});
</script>

<style scoped lang="scss">
$t-white-color: rgb(255, 255, 255);

.error-message {
    @apply text-red-500 text-xs block text-right font-extrabold;
}

.overlay-template {
    @apply fixed top-0 left-0 w-full h-full bg-black/50 z-[999];
}

.popup-template {
    @apply absolute top-1/2 left-0 w-full h-auto -translate-y-1/2 z-[999] px-5;
}

.header {
    display: flex;
    justify-content: space-between;
    padding: 20px 15px;
    background-image: url("./../../../public/assets/shop/banner-shop.png");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
    position: relative;

    .title {
        margin: 0 auto;
        font-weight: 800;
    }
}

.wp {
    padding: 10px 15px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: #00165a;

    .desc {
        background: #0b3393;
        padding: 10px;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
}

.btn {
    padding: 10px 15px;
    background-image: url("./../../../public/assets/shop/banner-shop.png");
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;

    button {
        color: #000000;
        -webkit-text-stroke: 0.5px rgb(0 0 0);
        border-radius: 5px;
    }

    a {
        display: block;
        padding: 10px;
        border-radius: 5px;
        font-weight: 800;
        cursor: pointer;
        transition: 0.3s;

        &:hover {
            opacity: 0.8;
        }
    }
}
</style>
