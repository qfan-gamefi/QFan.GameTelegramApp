<template>
  <div class="shop-container h-screen w-screen">
    <div class="header px-6">
      <h1 class="shop-title">NFT COLLECTION</h1>
      <p class="shop-total" v-if="!loading">Total: {{ cards.length }} items</p>
    </div>
    <div class="card-grid">
      <div v-for="card in cards" :key="card.id" class="card">
        <img :src="apiUrl + '/assets/' + card.thumb_image" :alt="card.title" class="card-image" />
        <p class="card-id">{{ card.name }}({{ card?.symbol }})</p>
        <div class="card-info">
          <span class="card-quantity">{{ card?.remain }}/{{ card?.totalSupply }}</span>

        </div>
        <button class="mint-button" v-bind:disabled="isMinting" v-on:click="this.mintNFT(card)">
          Mint (-{{ card.price }} Quai)
          <span v-if="isMinting && currentMintingCard === card.id"><i class="fa fa-spinner"></i></span></button>
      </div>
    </div>
  </div>
  <NotificationToast v-if="notification?.show" :message="notification?.message" :type="notification?.type"
    @close="notification.show = false" />
</template>

<script>
import NotificationToast from '@/components/NotificationToast.vue';
import NFTGoldenAgeCollection from '../../crypto_utils/constants/NFTGoldenAgeCollection.json';
import HDKeyring from "@/crypto_utils/HDKeyring";
import BackButtonTelegram from '@/mixins/BackButtonTelegram';
import { networkAdminAxiosInstance, NETORK_ADMIN_BASE_URL } from '@/services/networkAxiosInstance';
export default {
  mixins: [BackButtonTelegram],
  components: {
    NotificationToast,
  },
  data() {
    return {
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
    };
  },
  mounted() {
    this.getNFTCollection();
  },
  methods: {
    async mintNFT(card) {
      // Call the mintNFT function from the contract
      // Use the address, price, and quantity from the card
      // Update the quantity of the card
      this.isMinting = true;
      this.currentMintingCard = card.id;
      console.log("Minting NFT", card);
      try {
        const contractAddress = card.contract_address;
        const keyringService = new HDKeyring();
        await keyringService.unlock();
        const fromAddress = keyringService.getActiveWallet().address;
        const price = await keyringService.callContractMethod('mintPrice', fromAddress, contractAddress, NFTGoldenAgeCollection.abi, []);
        console.log({ price });
        let contractTransaction = await keyringService.callContractMethod('mint', fromAddress, contractAddress, NFTGoldenAgeCollection.abi, [fromAddress, { value: price }]);
        console.log({ contractTransaction });
        const txReceipt = await contractTransaction.wait();
        console.log({ txReceipt });
        if (txReceipt.hash) {
          this.notification.show = true;
          this.notification.message = "NFT Minted Successfully";
          this.notification.type = "success";
        }
        else {
          this.showError("NFT mint error. " + error.reason || error.message);
        }
      } catch (error) {
        console.log(error);
        this.showError("NFT mint error. " + error.reason || error.message);
      }
      finally {
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
      await networkAdminAxiosInstance.get('items/nft_collection')
        .then(async (response) => {
          const keyringService = new HDKeyring();
          await keyringService.unlock();
          const fromAddress = keyringService.getActiveWallet().address;
          console.log(response.data);
          let collections = response.data?.data || [];
          for (let i = 0; i < collections.length; i++) {
            const contractAddress = collections[i].contract_address;
            const tokenId = await keyringService.callContractMethod('tokenIds', fromAddress, contractAddress, NFTGoldenAgeCollection.abi, []);
            console.log({ tokenId });
            const tokenSupply = collections[i].totalSupply;
            if ((Number(tokenId) >= 0) && (Number(tokenSupply) >= 0)) {
              if (tokenId == 0) {
                collections[i].remain = Number(tokenSupply);
              } else {
                collections[i].remain = Number(tokenSupply) - Number(tokenId);
              }
            }
          }
          this.cards = collections;
        })
        .catch((error) => {
          console.error(error);
          this.showError("Error fetching NFTs. " + error.reason || error.message);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  },
};
</script>

<style scoped>
/* TailwindCSS classes */
.shop-container {
  @apply text-center text-white py-6;
  background-color: #00165A;
}

.header {
  @apply text-left px-6;
}

.shop-title {
  @apply text-2xl font-bold mb-4;
}

.shop-total {
  @apply text-lg font-medium mb-6;
}

.card-grid {
  @apply grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-6 px-6 overflow-y-auto;
  max-height: calc(100% - 100px);
}

.card {
  @apply bg-blue-800 border border-teal-500 rounded-lg p-4 text-center;
}

.card-image {
  @apply w-full rounded-lg mb-4;
}

.card-id {
  @apply text-sm text-gray-300 mb-2;
}

.card-info {
  @apply flex justify-center items-center text-sm text-gray-300 mb-4;
}

.card-price {
  @apply text-red-500 font-semibold text-center;
}

.card-quantity {
  @apply text-gray-300;
}

.mint-button {
  @apply bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-500 transition;
  padding: 1rem 2rem;
}

/* Custom CSS */
.card {
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.mint-button {
  box-shadow: 0px 2px 4px rgba(255, 223, 0, 0.6);
}
</style>