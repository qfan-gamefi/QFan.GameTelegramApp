<template>
    <router-view>
        <div class="wr-detail-wallet">
            <div class="header-wl">
                <div class="menu-icon"><i class="fa-solid fa-bars"></i></div>

                <div class="info">
                    <div><img src="@public/assets/logo.svg" /></div>
                    <div class="name">{{ activeAddress?.name }}</div>
                    <div class="add-wallet">(<a href="#" @click="linkToExplore($event)">{{ activeAddress?.address.substring(0,5) }}...</a>)</div>
                    <div class="copy-wallet">
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
                    <div><h1>{{ isVisible ? balance : "*********" }}</h1></div>

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
                            <h2>{{ balance }}</h2>
                        </div>
                    </div>
                </div>
                <div>
                    <button class="btn" @click="checkIn()">Checkin</button>
                    <span class="alert">{{ checkinMessage }}</span>
                </div>
            </div>
        </div>
    </router-view>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { DEFAULT_NETWORKS, updateNetworkController } from "@/services/network/chains";
import { setActiveNetwork } from "@/storage/network";
// import { Pelagus } from "@/services/network/pelagus";
import { storage } from "@/storage/storage";
import { Address, getActiveAddress, getActiveWallet, type StoredWallet, getLinkToExplorer } from "@/storage/wallet";
import { Pelagus } from "@/services/network/pelagus";
export default defineComponent({
    name: "WalletDetail",
    data() {
        return {
            isVisible: false,
            totalBalance: "$10,000",
            isSigned: false,
            activeWallet: null as StoredWallet | null,
            activeAddress: null as Address | null,
            balance: "0",
            exploreUrl: "",
            checkinMessage:""
        };
    },
    methods: {
        navigateTo() {
            this.$router.push("/");
        },
        toggleVisibility() {
            this.isVisible = !this.isVisible;
        },
        copyAddress(e: Event) {
            e.preventDefault();
            navigator.clipboard.writeText(this.activeAddress?.address ?? "");
        },
        checkIn() {
            console.log("Checkin");
            Pelagus.NetworkController.interactContract(this.activeAddress as Address);
        },
        async linkToExplore(e: Event) {
            console.log("Link to explore");
            e.preventDefault();
            const exploreUrl = await getLinkToExplorer(this.activeAddress as Address);
            if (exploreUrl) {
                window.open(exploreUrl, "_blank");
            }
        }
    },
    computed: {
        visibilityIcon() {
            return this.isVisible ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
        },
    },
    async mounted() {
        console.log("WalletForm component is mounted");
        await setActiveNetwork(DEFAULT_NETWORKS[0].name);
        await updateNetworkController();
        storage.get<boolean>("signed_in").then((signed) => {
            console.log("signed", signed);
            if (!signed) {
                this.$router.push({ name: "WalletCreate" });
            }
            this.isSigned = signed ?? false;
        });
        this.activeWallet = await getActiveWallet();
        this.activeAddress = await getActiveAddress();
        const balance = await Pelagus.NetworkController.getBalance(this.activeAddress?.address as string);
        this.balance = balance as string;
        const activites = await Pelagus.NetworkController.fetchActivity([this.activeAddress as Address]);
        console.log("activites", activites);
        
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
                font-size: 18px;
            }
        }
    }
}
</style>
