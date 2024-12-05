<template>
    <div v-bind:class="{ 'overlay-template': isDeposit }"></div>

    <div class="popup-template fade-in" v-if="isDeposit">
        <div class="header">
            <div @click="handleBack()" class="back-step" v-if="isConfirm">
                <i class="fa-solid fa-chevron-left"></i>
            </div>

            <div class="title">{{ labelType }} QUAI</div>

            <div @click="handleClose()" class="absolute top-2 right-2">
                <i
                    class="fa-solid fa-rectangle-xmark"
                    style="color: #ff0000"
                ></i>
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
            <a
                class="text-center"
                v-bind:class="labelType.toLowerCase()"
                v-bind:disabled="isLoading"
                @click="isConfirm ? submit() : handleConfirm()"
            >
                {{ labelType }}
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
import { MARKET_WALLET_ADDRESS } from "@/crypto_utils/constants";
import HDKeyring from "@/crypto_utils/HDKeyring";
import userService from "@/services/userService";
import { secureStorage } from "@/storage/storage";
import type { IInfoWallet } from "@/views/Shop/defination";
import {
    QuaiTransactionRequest,
    QuaiTransactionResponse,
} from "quais/lib/commonjs/providers";
import { defineComponent, type PropType } from "vue";
import NotificationToast from "@/components/NotificationToast.vue";
import { parseEther } from "ethers";
import { trackEventBtn } from "@/utils";

export default defineComponent({
    name: "DepositInShop",
    components: {
        InputField,
        NotificationToast,
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
            amount: null,
            password: "",
            amountError: false,
            messAmountError: "",
            passwordError: false,
            messPassError: "",
            isConfirm: false,
            addressWallet: "",
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
        async renderSuccess(text) {
            this.renderNotification(text, "success");
        },
        async renderErr(text) {
            this.renderNotification(text, "error");
        },
        resetFields() {
            this.amount = null;
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
                    6
                )}.......${this.infoWallet?.address?.slice(-6)}`;
            }
        },
        handleConfirm() {
            this.validateAmount();
            this.validatePassword();
        },
        async submit() {
            trackEventBtn({
                label: this.labelType,
            });
            if (this.labelType === "DEPOSIT") {
                await this.submitDeposit();
            } else {
                await this.submitWithdraw();
            }
        },
        async submitDeposit() {
            const id = this.infoWallet?.playerId;
            const address = this.infoWallet?.address;
            const amount = this.amount;
            const keyringService = new HDKeyring();
            await keyringService.unlock();
            this.isLoading = true;

            try {
                const activeWallet = keyringService.getActiveWallet();
                if (!activeWallet || !activeWallet.address) {
                    this.$router.push({ name: "WalletCreate" });
                    return;
                }

                const balance = await keyringService.getBalance(address);

                if (balance < Number(amount)) {
                    this.renderErr("Insufficient balance");
                    this.isLoading = false;
                    return;
                }

                const request: QuaiTransactionRequest = {
                    from: activeWallet.address,
                    to: MARKET_WALLET_ADDRESS,
                    value: parseEther(amount),
                };

                const tx = (await keyringService.signAndSendQuaiTransaction(
                    request
                )) as QuaiTransactionResponse;

                const res = await userService.postDeposit(
                    Number.parseInt(id),
                    address,
                    Number(amount),
                    tx.hash
                );

                if (res?.status === 201 || res?.status === 200) {
                    this.handleClose();
                    this.renderSuccess(
                        `${this.labelType} successfully! Please wait to confirm.`
                    );
                } else {
                    this.renderErr(
                        `${this.labelType} error. ${res.data?.message}`
                    );
                }
            } catch (error) {
                console.log(error);
                this.renderErr(error?.message);
            } finally {
                this.isLoading = false;
            }
        },
        async submitWithdraw() {
            this.isLoading = true;
            //check balance of wallet
            const balance = this.infoWallet?.balance;
            if (balance < this.amount) {
                this.isLoading = false;
                this.renderErr("Insufficient balance");
                return;
            }

            const playerId = this.infoWallet?.playerId;
            const address = this.infoWallet?.address;
            try {
                const res = await userService.postWithdraw(
                    playerId,
                    address,
                    Number(this.amount)
                );
                if (res?.status === 201 || res?.status === 200) {
                    this.handleClose();
                    this.renderSuccess(
                        `${this.labelType} successfully! Please wait to confirm.`
                    );
                } else {
                    this.renderErr(
                        `${this.labelType} error. ${res.data?.message}`
                    );
                }
            } catch (error) {
                console.log(error);
                this.renderErr(error?.response?.data?.message);
            } finally {
                this.isLoading = false;
            }
        },
        handleClose() {
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

    a {
        display: block;
        padding: 10px;
        border-radius: 5px;
        font-weight: 800;
        color: #fff;
        cursor: pointer;
        transition: 0.3s;

        &:hover {
            opacity: 0.8;
        }

        &.withdraw {
            background: #f6465d;
        }

        &.deposit {
            background: #2ebd85;
        }
    }
}
</style>
