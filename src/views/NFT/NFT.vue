<template>
    <div class="shop-container h-screen w-screen">
        <img
            src="/assets/shop/banner-nft.png"
            loading="lazy"
            ref="banner_nft"
            alt="nft"
            class="w-full"
        />

        <div class="box-btn">
            <div class="btn-nft">
                <div
                    v-for="(button, index) in buttons"
                    :key="index"
                    class="btn-item-nft"
                    :class="{ active: activeButton === button?.name }"
                    @click="setActiveButton(button?.name)"
                >
                    {{ button.label }}
                </div>
            </div>
        </div>

        <div class="px-3 text-left mt-[15px] mb-[10px]">
            <p class="shop-total" v-if="!loading">
                Total: {{ renderTotal() }} items
            </p>
        </div>

        <div class="h-full" :style="{ height: calcHeightBanner }">
            <div class="card-grid" v-if="activeButton === 'buy_nft'">
                <div v-for="card in cards" :key="card.id" class="card">
                    <img
                        :src="apiUrl + '/assets/' + card.thumb_image"
                        :alt="card.title"
                        class="card-image"
                    />
                    <p class="card-id">{{ card.name }}({{ card?.symbol }})</p>
                    <div class="card-info">
                        <span class="card-quantity"
                            >{{ card?.remain }}/{{ card?.totalSupply }}</span
                        >
                    </div>
                    <div
                        class="mint-button"
                        v-bind:disabled="isMinting"
                        v-on:click="this.mintNFT(card)"
                    >
                        Mint ( -{{ card.price }} <img src="/assets/logo-quai.svg" class="w-3">)
                        <span v-if="isMinting && currentMintingCard === card.id"
                            ><i class="fa fa-spinner"></i
                        ></span>
                    </div>
                </div>
            </div>

            <div class="card-grid" v-else>
                <div v-for="item in nftList" :key="item?.id" class="card">
                    <img
                        v-if="item?.image_url"
                        :src="item?.image_url"
                        class="card-image"
                    />
                    <img
                        v-else
                        src="@public/assets/nft.png"
                        class="card-image"
                    />

                    <span class="mt-2 text-center text-xs font-extrabold">{{
                        item?.token?.name
                    }}</span>
                    <a
                        target="_blank"
                        :href="`https://quaiscan.io/token/${item?.token?.address}/instance/${item?.id}`"
                        class="mt-2 text-center text-xs underline"
                        >({{ item?.token?.symbol }})</a
                    >
                </div>
            </div>
        </div>
    </div>
    <NotificationToast
        v-if="notification?.show"
        :message="notification?.message"
        :type="notification?.type"
        @close="notification.show = false"
    />
</template>

<script>
import NotificationToast from "@/components/NotificationToast.vue";
import NFTGoldenAgeCollection from "../../crypto_utils/constants/NFTGoldenAgeCollection.json";
import HDKeyring from "@/crypto_utils/HDKeyring";
import BackButtonTelegram from "@/mixins/BackButtonTelegram";
import {
    networkAdminAxiosInstance,
    NETORK_ADMIN_BASE_URL,
} from "@/services/networkAxiosInstance";
import { getNFTList } from "@/crypto_utils/networks";
import { debounce } from "@/utils";

export default {
    name: "NFTPage",
    mixins: [BackButtonTelegram],
    components: {
        NotificationToast,
    },
    data() {
        return {
            hdKeyring: new HDKeyring(),
            calcHeightBanner: "calc(100% - 140px)",
            buttons: [
                { name: "buy_nft", label: "BUY NFT" },
                { name: "my_nft", label: "MY NFT" },
            ],
            activeButton: "buy_nft",
            apiUrl: NETORK_ADMIN_BASE_URL,
            cards: [],
            loading: false,
            isMinting: false,
            currentMintingCard: null,
            notification: {
                show: false,
                message: "",
                type: "",
            },
            nftList: [],
            activeWallet: null,
        };
    },
    created() {
        this.debouncedFetchNftList = debounce(this.fetchNftList, 500);
    },
    async mounted() {
        this.getNFTCollection();
        this.updateHeight();

        const hdKeyring = new HDKeyring();
        await hdKeyring.unlock();
        if (hdKeyring.isSigning) {
            this.activeWallet = hdKeyring.getActiveWallet();
        }

        this.fetchNftList();
    },
    methods: {
        updateHeight() {
            const img = this.$refs.banner_nft;
            if (img) {
                img.onload = () => {
                    this.calcHeightBanner = `calc(100% - 57px - ${img.clientHeight}px)`;
                };
            }
        },
        setActiveButton(button) {
            this.activeButton = button;
            if(button === 'my_nft'){
                this.debouncedFetchNftList();
            }
        },
        async mintNFT(card) {
            // Call the mintNFT function from the contract
            // Use the address, price, and quantity from the card
            // Update the quantity of the card
            this.isMinting = true;
            this.currentMintingCard = card.id;
            try {
                const contractAddress = card.contract_address;
                const keyringService = new HDKeyring();
                await keyringService.unlock();
                const fromAddress = keyringService.getActiveWallet().address;
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
                    this.notification.show = true;
                    this.notification.message = "NFT Minted Successfully";
                    this.notification.type = "success";
                } else {
                    this.showError(
                        "NFT mint error. " + error.reason || error.message
                    );
                }
            } catch (error) {
                this.showError(
                    "NFT mint error. " + error.reason || error.message
                );
            } finally {
                this.isMinting = false;
                this.currentMintingCard = null;
                this.getNFTCollection();
            }
        },
        showError(message) {
            this.notification.show = true;
            this.notification.message = message;
            this.notification.type = "error";
        },
        async getNFTCollection() {
            this.loading = true;
            await networkAdminAxiosInstance
                .get("items/nft_collection")
                .then(async (response) => {
                    const keyringService = new HDKeyring();
                    await keyringService.unlock();
                    const fromAddress =
                        keyringService.getActiveWallet().address;
                    let collections = response.data?.data || [];
                    for (let i = 0; i < collections.length; i++) {
                        const contractAddress = collections[i].contract_address;
                        const tokenId = await keyringService.callContractMethod(
                            "tokenIds",
                            fromAddress,
                            contractAddress,
                            NFTGoldenAgeCollection.abi,
                            []
                        );
                        const tokenSupply = collections[i].totalSupply;
                        if (Number(tokenId) >= 0 && Number(tokenSupply) >= 0) {
                            if (tokenId == 0) {
                                collections[i].remain = Number(tokenSupply);
                            } else {
                                collections[i].remain =
                                    Number(tokenSupply) - Number(tokenId);
                            }
                        }
                    }
                    this.cards = collections;
                })
                .catch((error) => {
                    this.showError(
                        "Error fetching NFTs. " + error.reason || error.message
                    );
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        async fetchNftList() {
            const nftList = await getNFTList(this.activeWallet?.address);
            this.nftList = nftList?.items;
        },
        renderTotal() {
            if (this.activeButton === "buy_nft") {
                return this.cards?.length;
            } else {
                return this.nftList?.length;
            }
        },
    },
};
</script>

<style scoped>
/* TailwindCSS classes */
.shop-container {
    @apply text-center text-white;
    background-color: #00165a;
}

.box-btn {
    @apply pt-[40px] pb-[10px] border-b border-[#F5F5F5] mx-[10px];
}
.btn-nft {
    @apply flex w-full  justify-center text-[12px] font-extrabold gap-3;
}
.btn-item-nft.active {
    @apply bg-[#064BC5] text-white;
}

.btn-item-nft {
    @apply px-[10px] py-[5px] rounded-[5px] cursor-pointer;
}

.shop-total {
    @apply text-lg font-semibold;
}

.card-grid {
    @apply grid grid-cols-2 gap-2 mx-[10px] overflow-y-auto;
    max-height: calc(100% - 100px);
}

.card {
    @apply bg-blue-800 border border-teal-500 rounded-lg p-2 text-center;
}

.card-image {
    @apply w-full rounded-lg mb-4;
}

.card-id {
    @apply text-sm  mb-2 font-extrabold;
}

.card-info {
    @apply flex justify-center items-center text-sm  mb-3;
}

.card-price {
    @apply text-red-500 font-semibold text-center;
}

.mint-button {
    @apply bg-[#FFFF73] text-[#00165A] font-bold px-2 py-1 rounded hover:bg-yellow-500 transition text-xs flex justify-center gap-1;
}

/* Custom CSS */
.card {
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.mint-button {
    box-shadow: 0px 2px 4px rgba(255, 223, 0, 0.6);
}
</style>
