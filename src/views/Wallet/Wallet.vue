<!-- eslint-disable vue/require-v-for-key -->
<template>
    <router-view>
        <div class="wr-detail-wallet">
            <div class="flex justify-between items-center p-[20px]">
                <div>
                    <a @click="removeWallet()"><i class="fa fa-trash"></i></a>
                </div>

                <div class="flex items-center gap-3">
                    <div>
                        <img src="@public/assets/logo.svg" class="w-[25px]" />
                    </div>
                    <div>{{ $t("address") }}</div>
                    <div class="text-[#8f8f8f]">
                        (<a href="#" @click="linkToExplore($event)"
                            >{{ activeWallet?.address.substring(0, 5) }}...</a
                        >)
                    </div>
                    <div class="text-[#8f8f8f]">
                        <a href="#" @click="copyAddress($event)">
                            <i class="fa-solid fa-copy"></i>
                        </a>
                    </div>
                </div>

                <div class="user-icon">
                    <i class="fa-solid fa-user-plus"></i>
                </div>
            </div>

            <div class="body-wl">
                <div class="wr-balance-wl">
                    <div class="flex gap-[10px]">
                        {{ $t("total_balance") }}
                        <div @click="toggleVisibility()">
                            <div v-if="!isVisible">
                                <i class="fa-solid fa-eye"></i>
                            </div>
                            <div v-if="isVisible">
                                <i class="fa-solid fa-eye-slash"></i>
                            </div>
                        </div>
                        <div>
                            <a href="#" @click="refreshWallet($event)"
                                ><i class="fa-solid fa-refresh"></i
                            ></a>
                        </div>
                    </div>
                    <div>
                        <h1>{{ isVisible ? balance : "*********" }}</h1>
                    </div>

                    <div class="flex text-[12px] gap-2">
                        <button
                            class="btn-item-wl"
                            @click="() => (openReceive = true)"
                        >
                            <i class="fa-solid fa-copy"></i> {{ $t("receive") }}
                        </button>
                        <button @click="onSend()" class="btn-item-wl">
                            <i class="fa-solid fa-paper-plane"></i>
                            {{ $t("send") }}
                        </button>
                        <button
                            class="btn-item-wl"
                            @click="faucet()"
                            v-bind:disabled="executing"
                        >
                            <i class="fa-solid fa-faucet"></i>
                            {{ $t("faucet") }}
                            <div v-if="isFaucet">
                                <i class="fa fa-spinner loading"></i>
                            </div>
                        </button>
                    </div>

                    <span v-if="errorMessage" class="text-xs text-red-500">
                        {{ errorMessage }}
                    </span>

                    <span class="faucet-success" v-if="transactionUrl"
                        >{{ $t("faucet_success_click") }}
                        <a v-bind:href="transactionUrl" target="_blank">{{
                            $t("here")
                        }}</a>
                        {{ $t("to_view_transaction_on_explorer") }}</span
                    >
                </div>

                <div class="wr-coin">
                    <div class="title">
                        <a
                            href="#"
                            @click="setActiveTab($event, 'token')"
                            v-bind:class="activeTab === 'token' ? 'active' : ''"
                            >{{ $t("token") }}</a
                        >
                        <a
                            href="#"
                            @click="setActiveTab($event, 'activities')"
                            v-bind:class="
                                activeTab === 'activities' ? 'active' : ''
                            "
                            >{{ $t("activities") }}</a
                        >
                    </div>

                    <div class="box-content" v-if="activeTab === 'token'">
                        <div class="item-list">
                            <div class="box-item">
                                <div
                                    class="flex justify-between items-center gap-2 w-full"
                                >
                                    <img
                                        src="@public/assets/logo-quai.svg"
                                        class="w-5"
                                    />
                                    <h2 v-if="isVisible">{{ balance }} QUAI</h2>
                                    <h2 v-else>*********</h2>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="box-content" v-if="activeTab === 'activities'">
                        <div class="filter">
                            {{ $t("status") }}:
                            <select v-model="filterStatus">
                                <option value="">{{ $t("all") }}</option>
                                <option value="pending">
                                    {{ $t("pending") }}
                                </option>
                                <option value="confirmed">
                                    {{ $t("confirmed") }}
                                </option>
                            </select>
                        </div>

                        <LoadingForm :loading="executing" />

                        <div class="item-list" v-if="!executing">
                            <div
                                class="box-item"
                                v-for="(
                                    transaction, index
                                ) in activities.filter(
                                    (x) =>
                                        !filterStatus ||
                                        x.status === filterStatus
                                )"
                                :key="index"
                            >
                                <div
                                    class="flex justify-between items-center gap-[10px] w-full"
                                >
                                    <span
                                        ><i class="fa-solid fa-exchange"></i
                                        >&nbsp;{{
                                            transaction.type.toUpperCase()
                                        }}</span
                                    >
                                    <a
                                        href="#"
                                        @click="
                                            getLinkTx($event, transaction.hash)
                                        "
                                        >({{
                                            formatAddress(transaction.hash)
                                        }})</a
                                    >
                                    <div v-bind:class="transaction.status">
                                        {{ transaction.status.toUpperCase() }}
                                    </div>
                                </div>
                                <div class="w-full">
                                    <div>
                                        <a
                                            v-if="
                                                transaction.type === 'receive'
                                            "
                                            class="address"
                                            >{{ $t("from") }}:
                                            {{
                                                formatAddress(transaction?.from)
                                            }}</a
                                        >
                                        <a
                                            v-if="transaction.type === 'send'"
                                            class="address"
                                            >{{ $t("to") }}:
                                            {{
                                                formatAddress(transaction?.to)
                                            }}</a
                                        >
                                    </div>
                                </div>
                                <div class="w-full text-right">
                                    <span
                                        >{{ formatValue(transaction?.value) }}
                                        {{
                                            transaction?.tokenSymbol ?? "QUAI"
                                        }}</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <NotificationToast
            v-if="notification.visible"
            :message="notification.message"
            :type="notification.type"
        />

        <div v-if="openSend">
            <div class="popup-overlay"></div>
            <div class="popup-referer-code">
                <a href="#" @click="closeSend" class="close"
                    ><i class="fa fa-close"></i
                ></a>

                <div class="popup-title">
                    {{ $t("input_address_and_value_to_send") }}
                </div>

                <form @submit.prevent="executeSend">
                    <table>
                        <tr class="form-group">
                            <td>
                                <label class="label" for="address">{{
                                    $t("address")
                                }}</label>
                            </td>
                            <td>
                                <input
                                    class="code-input-wl"
                                    :class="{ 'input-error-wl': errorMessage }"
                                    type="text"
                                    v-model="toAddress"
                                    id="address"
                                    @input="clearError"
                                    placeholder=""
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label class="label" for="value">{{
                                    $t("value")
                                }}</label>
                            </td>
                            <td>
                                <input
                                    class="code-input-wl"
                                    :class="{ 'input-error-wl': errorMessage }"
                                    type="number"
                                    v-model="sendValue"
                                    id="value"
                                    @input="clearError"
                                    placeholder=""
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <label class="label" for="value">{{
                                    $t("password")
                                }}</label>
                            </td>
                            <td>
                                <input
                                    class="code-input-wl"
                                    :class="{ 'input-error-wl': errorMessage }"
                                    type="password"
                                    v-model="sendPassword"
                                    id="password"
                                    @input="clearError"
                                    placeholder=""
                                />
                            </td>
                        </tr>
                    </table>
                    <div
                        v-if="errorMessage"
                        class="text-xs text-red-500 text-center"
                    >
                        {{ errorMessage }}
                    </div>

                    <button
                        class="btn-submit-code"
                        @click="executeSend()"
                        v-bind:disabled="executing"
                        type="submit"
                    >
                        <span
                            >{{ $t("send") }}
                            <a v-if="executing"
                                ><i class="fa fa-spinner loading"></i></a
                        ></span>
                    </button>
                </form>
            </div>
        </div>
        <div v-if="openReceive">
            <div class="popup-overlay"></div>
            <div class="popup-referer-code">
                <a href="#" @click="handleCloseReceive" class="close"
                    ><i class="fa fa-close"></i
                ></a>
                <div class="popup-title">{{ $t("receive_address") }}</div>
                <div class="wl-addr">
                    <div class="mb-3">
                        <img
                            v-bind:src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${activeWallet?.address}`"
                        />
                    </div>
                    <div class="flex justify-center">
                        <a
                            href="#"
                            @click="copyAddress($event)"
                            class="text-white bg-[#1568e5] p-2.5 rounded font text-xs"
                        >
                            <i class="fa-solid fa-copy"></i>
                            {{ $t("copy_address") }}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { secureStorage } from "@/storage/storage";
import userService from "@/services/userService";
import { quais, Wallet } from "quais";
import NotificationToast from "@/components/NotificationToast.vue";
import LoadingForm from "@/components/LoadingForm.vue";
import {
    activeProvider,
    fetchActivity,
    getAddressLinkToExplorer,
    getTxLinkToExplorer,
    signAndSendTransaction,
} from "@/crypto_utils/networks";
import HDKeyring from "@/crypto_utils/HDKeyring";
import { type WalletInfo } from "@/crypto_utils/type";
import type { QuaiTransactionRequest } from "quais/lib/esm/providers";
import { formatEther, parseEther, toBigInt } from "ethers";
import { CURRENT_WALLET_VERSION } from "@/crypto_utils/constants";
import BackButtonTelegram from "@/mixins/BackButtonTelegram";
import { trackEventBtn } from "@/utils";

export default defineComponent({
    name: "WalletDetail",
    mixins: [BackButtonTelegram],
    components: {
        NotificationToast,
        LoadingForm,
    },
    data() {
        return {
            hdKeyring: new HDKeyring(), // KeyringService
            isVisible: false,
            totalBalance: "$10,000",
            isSigned: false,
            activeWallet: null as WalletInfo | null,
            balance: "0",
            exploreUrl: "",
            checkinMessage: "",
            playerId:
                window.Telegram.WebApp.initDataUnsafe.user?.id.toString() ?? "",
            toAddress: "",
            activeTab: "token",
            activities: [],
            notification: {
                visible: false,
                message: "",
                type: "success",
            },
            executing: false,
            openSend: false,
            errorMessage: "",
            sendValue: "",
            sendPassword: "",
            filterStatus: "",
            transactionUrl: "",
            openReceive: false,
            isFaucet: false,
        };
    },
    methods: {
        handleCloseReceive() {
            this.errorMessage = "";
            this.openReceive = false;
        },
        closeSend() {
            this.errorMessage = "";
            this.openSend = false;
        },
        navigateTo() {
            this.$router.push("/");
        },
        toggleVisibility() {
            this.isVisible = !this.isVisible;
        },
        async setActiveTab($event: Event, tab: string) {
            $event?.preventDefault();
            this.activeTab = tab;
            if (tab === "activities") {
                await this.fetchActivity();
            }
        },
        copyAddress(e: Event) {
            e.preventDefault();
            navigator.clipboard.writeText(this.activeWallet?.address ?? "");
        },
        async fetchActivity() {
            this.executing = true;
            this.activities = (await fetchActivity(
                this.activeWallet?.address as string
            )) as never[];

            this.executing = false;
        },
        async faucet() {
            try {
                this.isFaucet = true;
                this.executing = true;
                this.errorMessage = "";
                this.transactionUrl = "";
                const faucetResult = await userService.faucet(
                    this.playerId,
                    this.activeWallet?.address as string
                );
                trackEventBtn({
                    label: "Faucet",
                });
                if (
                    faucetResult.statusCode &&
                    faucetResult.statusCode !== 200
                ) {
                    this.errorMessage = "Faucet error: " + faucetResult.message;
                    this.executing = false;
                    this.isFaucet = false;
                    return;
                }
                if (faucetResult?.hash) {
                    this.transactionUrl = await getTxLinkToExplorer(
                        faucetResult?.hash
                    );
                }
                this.isFaucet = false;
                this.executing = false;
            } catch (error) {
                // console.log("error", error);
                this.errorMessage = "Faucet error: " + error?.message;
                this.executing = false;
                this.isFaucet = false;
            }
        },
        async linkToExplore(e: Event) {
            console.log("Link to explore");
            e.preventDefault();
            const exploreUrl = await getAddressLinkToExplorer(
                this.activeWallet?.address as string
            );
            if (exploreUrl) {
                window.open(exploreUrl, "_blank");
            }
        },
        async getLinkTx($event: Event, hash: string) {
            $event.preventDefault();
            const exploreUrl = await getTxLinkToExplorer(hash);
            window.open(exploreUrl, "_blank");
        },
        onSend() {
            this.errorMessage = "";
            this.openSend = true;
        },
        async executeSend() {
            if (this.toAddress === "" || this.sendValue === "") {
                this.errorMessage = "Please input address and value";
                return;
            }

            if (this.sendPassword === "") {
                this.errorMessage = "Please input password";
                return;
            }

            //check password
            const password = secureStorage.getPassword() as string;

            if (password !== this.sendPassword) {
                this.errorMessage = "Password is incorrect";
                return;
            }
            trackEventBtn({
                label: "Send_wallet",
            });
            try {
                this.executing = true;
                const hdKeyring = new HDKeyring();
                await hdKeyring.unlock();
                const transaction = {
                    from: this.activeWallet?.address as string,
                    to: this.toAddress,
                    value: parseEther(this.sendValue.toString()),
                } as unknown as QuaiTransactionRequest;

                const result = await hdKeyring.signAndSendQuaiTransaction(
                    transaction
                );

                console.log("result", result);
                this.openSend = false;
                setTimeout(() => {
                    this.setActiveTab(new Event(""), "activities");
                }, 2000);
                this.executing = false;
                this.openSend = false;
            } catch (error) {
                console.log("error", error);
                this.errorMessage = error?.message;
                this.executing = false;
            }
        },
        formatValue(value: string) {
            return formatEther(value);
        },
        formatAddress(address: string) {
            const length = address?.length;
            return `${address?.substring(0, 5)}...${address?.substring(
                length - 6,
                length - 1
            )}`;
        },
        clearError() {
            this.errorMessage = "";
        },
        async getBalance() {
            const provider = activeProvider();
            const balance = await provider.getBalance(
                this.activeWallet?.address as string
            );
            this.balance = formatEther(balance);
            //round 2 digits
            this.balance = parseFloat(this.balance).toFixed(2);
        },
        async refreshWallet($event?: Event) {
            if ($event) $event.preventDefault();
            await this.getBalance();
            await this.fetchActivity();
        },
        removeWallet() {
            localStorage.clear();
            this.$router.push({ name: "WalletCreate" });
        },
    },
    computed: {
        visibilityIcon() {
            return this.isVisible ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
        },
    },
    async mounted() {
        // console.log("WalletForm component is mounted");
        // const address = localStorage.getItem("address");
        // if (!address || address == "null") {
        //     this.$router.push({ name: "WalletCreate" });
        //     return;
        // }

        const walletType = localStorage.getItem("walletType");
        if (walletType !== CURRENT_WALLET_VERSION) {
            localStorage.removeItem("tallyVaults");
            localStorage.removeItem("address");
            this.$router.push({ name: "WalletCreate" });
        }

        const hdKeyring = new HDKeyring();
        await hdKeyring.unlock();
        if (hdKeyring.isSigning) {
            this.activeWallet = hdKeyring.getActiveWallet();

            const address = await this.activeWallet?.address;
            if (!address) {
                localStorage.clear();
                this.$router.push({ name: "WalletCreate" });
            }
            await this.refreshWallet();
            setInterval(async () => {
                await this.getBalance();
            }, 5000);
        } else {
            this.$router.push({ name: "WalletCreate" });
        }
    },
});
</script>

<style scoped lang="scss">
button {
    padding: 25px 50px;
}
button:hover {
    box-shadow: none;
}

.wr-detail-wallet {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    z-index: 999;
    animation: fadeInWallet 0.3s ease forwards;
    background-color: #fff;
    color: #00175f;
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

.body-wl {
    padding: 10px;

    .wr-balance-wl {
        background-image: linear-gradient(#5da1db, #fbe1a6);
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .btn-item-wl {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 15px;
            background-color: #00175f !important;
            color: #fff;
            border-radius: 5px;
        }

        .btn-item-wl:disabled {
            background-color: #677cb9;
            cursor: not-allowed;
        }
    }

    .wr-coin {
        padding: 30px 0 0;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .title {
            a {
                text-decoration: none;
                padding: 0 10px;

                &.active {
                    background-color: #00175f;
                    border-radius: 5px;
                    color: #fff;
                }
            }
        }

        .box-content {
            display: flex;
            align-items: center;
            flex-direction: column;
            width: 100%;
            gap: 10px;

            .filter {
                display: flex;
                justify-content: flex-end;
                width: 100%;
                align-items: center;
                font-size: 12px;

                select {
                    padding: 5px;
                    border-radius: 5px;
                    border: 1px solid #ccc;
                    background-color: #f0f0f0;
                    color: #333;
                    outline: none;
                }
            }

            .item-list {
                display: flex;
                align-items: center;
                flex-direction: column;
                width: 100%;
                max-height: calc(100vh - 335px);
                overflow-y: auto;
                scrollbar-width: none;
                -ms-overflow-style: none;
                gap: 10px;
                font-size: 10px;

                .img {
                    display: flex;

                    img {
                        width: 25px;
                        height: 25px;
                    }
                }

                .price {
                    color: #03a400;
                    font-size: 18px;
                }

                .box-item {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: center;
                    background-color: #f5f5f5;
                    border-radius: 10px;
                    width: 100%;
                    padding: 10px;
                    gap: 10px;

                    .address {
                        display: flex;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .pending {
                        background-color: #dba52f;
                        padding: 0 5px;
                        border-radius: 5px;
                        color: #fff;
                    }

                    .confirmed {
                        background-color: #03a400;
                        padding: 0 5px;
                        border-radius: 5px;
                        color: #fff;
                    }
                }
            }
        }
    }
}

.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}

.popup-referer-code {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    padding: 20px;
    z-index: 1000;
    border-radius: 8px;
}

.code-input-wl {
    padding: 5px;
    border: 1px solid #ccc;
    transition: border-color 0.3s ease;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 12px;
    background-color: #f0f0f0;
    color: #333;
    outline: none;
}

.label {
    font-size: 12px;
    color: #333;
    margin-top: 10px;
}

.code-input-wl:focus {
    border-color: #66afe9;
    outline: none;
}

.input-error-wl {
    border-color: red;
}

.form-group {
    padding: 8px 0;
}

.btn-submit-code {
    margin-top: 20px;
    border-radius: 5px;
    color: #fff;
    padding: 15px;
}

.btn-submit-code:disabled {
    background-color: #efcda5;
    cursor: not-allowed;
}

.popup-title {
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    color: #333;
    padding-top: 10px;
}

.close {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #8c0000;
    font-size: 20px;
    cursor: pointer;
}

.loading {
    animation: spin 1s linear infinite;
}

.faucet-success {
    color: #fff;
    font-size: 12px;
    background-color: #a4d8a3;
    padding: 8px;
    border-radius: 5px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
