<template>
    <div v-bind:class="{ 'overlay-template': isDeposit }"></div>

    <div class="popup-template fade-in" v-if="isDeposit">
        <div class="header">
            <div @click="handleBack()" class="back-step" v-if="isConfirm">
                <i class="fa-solid fa-chevron-left"></i>
            </div>

            <div class="title">{{ labelType }} QUAI</div>

            <div @click="handleCloseDeposit()" class="close-view-cart">
                <i class="fa-solid fa-rectangle-xmark"></i>
            </div>
        </div>

        <div class="wp-deposit">
            <div class="desc" v-if="!isConfirm">
                <InputField
                    v-model="amount"
                    label="Amount"
                    placeholder="Enter Amount"
                    type="number"
                />
                <span v-if="amountError" class="error-message">{{
                    messAmountError
                }}</span>
                <InputField
                    v-model="password"
                    label="Password"
                    placeholder="Enter Password"
                    type="password"
                />
                <span v-if="passwordError" class="error-message">{{
                    messPassError
                }}</span>
            </div>
            <div class="desc" v-else>
                <div class="text-center">
                    Are you sure {{ labelType }} {{ amount }} Quai to address
                    {{ addressWallet }}
                </div>
            </div>
        </div>

        <div class="btn-deposit">
            <div
                class="text-center"
                @click="isConfirm ? submitDeposit() : handleConfirm()"
            >
                {{ labelType }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import InputField from "@/components/Input/InputField.vue";
import { QFPOwerWalletAddress } from "@/crypto_utils/constants";
import HDKeyring from "@/crypto_utils/HDKeyring";
import userService from "@/services/userService";
import { secureStorage } from "@/storage/storage";
import type { IInfoWallet } from "@/views/Shop/defination";
import type {
    QuaiTransactionRequest,
    QuaiTransactionResponse,
} from "quais/providers";
import { defineComponent, type PropType } from "vue";

export default defineComponent({
    name: "DepositInShop",
    components: {
        InputField,
    },
    props: {
        isDeposit: {
            type: Boolean,
            default: false,
        },
        infoWallet: {
            type: Object as PropType<IInfoWallet>,
            required: true,
        },
        labelType: {
            type: String,
            required: true,
            validator: (value) => ["DEPOSIT", "WITHDRAW"].includes(value),
        },
    },
    mounted() {},
    watch: {
        isDeposit(newVal) {
            if (!newVal) {
                this.resetFields();
            }
        },
    },
    data() {
        return {
            amount: 0,
            password: "",

            amountError: false,
            messAmountError: "",
            passwordError: false,
            messPassError: "",
            isConfirm: false,
            addressWallet: "",
        };
    },
    methods: {
        resetFields() {
            this.amount = 0;
            this.password = "";
            this.amountError = false;
            this.messAmountError = "";
            this.passwordError = false;
            this.messPassError = "";
        },
        validateAmount() {
            if (this.amount <= 0) {
                this.amountError = true;
                this.messAmountError = "Amount must be greater than 0.";
            } else {
                this.amountError = false;
                this.messAmountError = "";
            }
        },
        validatePassword() {
            const getPassword = secureStorage.getPassword();

            if (!this.password) {
                this.passwordError = true;
                this.messPassError = "Password is required.";
            } else if (getPassword !== this.password) {
                this.passwordError = true;
                this.messPassError = "Password is incorrect.";
            } else {
                this.passwordError = false;
                this.messPassError = "";
                this.isConfirm = true;
                this.addressWallet = `${this.infoWallet?.address?.slice(
                    0,
                    8
                )}.......${this.infoWallet?.address?.slice(-8)}`;
            }
        },
        handleConfirm() {
            this.validateAmount();
            this.validatePassword();
        },
        async submitDeposit() {
            const id = this.infoWallet?.playerId;
            const address = this.infoWallet?.address;
            const amount = this.amount;
            const hash = "";

            const keyringService = new HDKeyring();
            await keyringService.unlock();
            if (!this.amountError && !this.passwordError) {
                try {
                    // const activeWallet = keyringService.getActiveWallet();
                    // const address1 = await activeWallet?.address;
                    // console.log("address1", address1);

                    const request: QuaiTransactionRequest = {
                        from: address,
                        to: QFPOwerWalletAddress,
                        value: Number(amount),
                    };

                    const tx = (await keyringService.sendTokenTransaction(
                        request
                    )) as QuaiTransactionResponse;

                    const res = await userService.postDeposit(
                        Number.parseInt(id),
                        address,
                        Number(amount),
                        tx.hash
                    );
                    console.log(res);

                    if (res?.status === 201 || res?.status === 200) {
                        this.$emit("close");
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        },
        handleCloseDeposit() {
            this.isConfirm = false;
            this.$emit("close");
        },
        handleBack() {
            this.isConfirm = false;
        },
    },
});
</script>

<style scoped lang="scss">
$t-white-color: rgb(255, 255, 255);

.error-message {
    color: red;
    font-size: 12px;
    display: block;
    text-align: right;
    font-weight: 800;
}

.overlay-template {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.popup-template {
    height: auto;
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translate(0, -50%);
    z-index: 999;
    padding: 0 20px;
}
// .popup-enter-active {
//     animation: slideUp 0.1s ease forwards;
// }

// .popup-leave-active {
//     animation: slideDown 0.1s ease forwards;
// }

// @keyframes slideUp {
//     0% {
//         opacity: 0;
//         transform: translateY(100%) scale(0.5);
//     }

//     100% {
//         opacity: 1;
//         transform: translateY(0) scale(1);
//     }
// }

// @keyframes slideDown {
//     0% {
//         opacity: 1;
//         transform: translateY(0) scale(1);
//     }

//     100% {
//         opacity: 0;
//         transform: translateY(100%) scale(0.5);
//     }
// }

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
    .title {
        margin: 0 auto;
        font-weight: 800;
    }
}

.wp-deposit {
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

.btn-deposit {
    color: $t-white-color;
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
}

.address-text {
}
</style>
