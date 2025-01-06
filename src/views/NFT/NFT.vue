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
                    <p class="card-id">{{ card.name }}</p>
                    <img
                        :src="apiUrl + '/assets/' + card.thumb_image"
                        :alt="card.title"
                        class="card-image"
                    />

                    <div class="card-info">
                        <div class="text-price flex flex-row">
                            <img src="/assets/logo-quai.svg" class="w-3" />
                            <span class="pl-1 font-bold">{{ card.price }}</span>
                        </div>
                        <div class="card-quantity font-bold">
                            {{ card?.remain ?? "-" }}/{{ card?.totalSupply }}
                        </div>
                    </div>
                    <div
                        class="mint-button"
                        v-bind:disabled="isMinting"
                        v-on:click="this.mintNFT(card)"
                    >
                        Mint
                        <span v-if="isMinting && currentMintingCard === card.id"
                            ><i class="fa fa-spinner"></i
                        ></span>
                    </div>
                </div>
            </div>

            <div class="card-grid" v-else>
                <div
                    v-for="item in nftList"
                    :key="item?.id"
                    class="card relative"
                >
                    <a
                        target="_blank"
                        :href="`https://quaiscan.io/token/${item?.token?.address}/instance/${item?.id}`"
                        class="mt-2 text-center text-xs underline absolute left-5 top-2 border-solid bg-red-400 pt-1 pl-2 pr-2 pb-1 rounded font-bold"
                        >#{{ item?.id }}</a
                    >
                    <img
                        v-if="item?.external_app_url"
                        :src="item?.external_app_url"
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

    <MintPage 
        :isMint="showMint"
        @close="closePopup()"
        @closeReload="closeReload()"
        :cardItem="cardItem"            
    />
    <PopupComingSoon
        :visible="isMaintenance"
        message="under_maintenance"
        @close="isMaintenance = false"
    />
</template>

<script>
import PopupConfirm from "@/components/PopupConfirm.vue";
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
import MintPage from "./MintPage.vue";
import PopupComingSoon from "@/components/popup/PopupComingSoon.vue";

export default {
    name: "NFTPage",
    mixins: [BackButtonTelegram],
    components: {
        NotificationToast,
        PopupConfirm,
        MintPage,
        PopupComingSoon
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
            showMint: false,
            cardItem: [],
            isMaintenance: false,
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
                    this.calcHeightBanner = `calc(100% - 15px - ${img.clientHeight}px)`;
                };
            }
        },
        setActiveButton(button) {
            this.activeButton = button;
            if (button === "my_nft") {
                this.debouncedFetchNftList();
            }
        },
        async mintNFT(card) {
            //alert Maintenance
            this.isMaintenance = true

            // this.showMint = true;
            // this.cardItem = card
        },
        async mintNFTStep2(){
            this.isMinting = true;
            this.currentMintingCard = this.card.id;
            try {
                const contractAddress = this.card.contract_address;
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
        showSuccess(message) {
            this.notification.show = true;
            this.notification.message = message;
            this.notification.type = "success";
        },
        async getNFTCollection() {
            this.loading = true;
            const response = await networkAdminAxiosInstance.get(
                "items/nft_collection"
            );
            this.cards = response.data?.data;
            console.log("cards", this.cards);

            if (this.cards.length > 0) {
                const keyringService = new HDKeyring();
                await keyringService.unlock();
                const fromAddress = keyringService.getActiveWallet().address;
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
            }
            this.loading = false;
        },
        async fetchNftList() {
            if (this.cards.length > 0) {
                const nftList = await getNFTList(this.activeWallet?.address);
                //filter the nftList to show only the nft that symbol is equal to the symbol of the cards

                this.nftList = nftList?.items?.filter((nft) => {
                    return this.cards.some(
                        (card) => card.contract_address === nft.token.address
                    );
                });
            }
        },
        renderTotal() {
            if (this.activeButton === "buy_nft") {
                return this.cards?.length;
            } else {
                return this.nftList?.length;
            }
        },
        closePopup(){
            this.showMint = false
        },
        closeReload(){
            this.showMint = false
            this.getNFTCollection();
        }
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
    @apply pt-[10px] pb-[10px] border-b border-[#F5F5F5] mx-[10px];
}

.btn-nft {
    @apply flex w-full justify-center text-[12px] font-extrabold gap-3;
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
    min-height: 150px;
}

.card-id {
    @apply text-sm mb-2 font-extrabold;
}

.card-info {
    @apply flex justify-between items-center text-sm mb-3;
}

.card-price {
    @apply text-red-500 font-semibold text-center;
}

.mint-button {
    @apply bg-[#FFFF73] text-[#00165A] font-bold px-2 py-1 rounded hover:bg-yellow-500 transition text-lg flex justify-center gap-1;
}

/* Custom CSS */
.card {
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.mint-button {
    box-shadow: 0px 2px 4px rgba(255, 223, 0, 0.6);
}
</style>
