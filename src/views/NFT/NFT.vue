<template>
  <div class="shop-container h-screen w-screen">
    <div class="header px-6">
      <h1 class="shop-title">NFT COLLECTION</h1>
      <p class="shop-total">Total: {{ cards.length }} items</p>
    </div>
    <div class="card-grid">
      <div v-for="card in cards" :key="card.id" class="card">
        <img :src="card.image" :alt="card.title" class="card-image" />
        <p class="card-id">{{ card.name }}</p>
        <div class="card-info">
          <span class="card-price">{{ card.price }} Quai</span>
          <!-- <span class="card-quantity">{{ card.quantity }}</span> -->
        </div>
        <button class="mint-button" v-bind:disabled="isMinting" v-on:click="this.mintNFT(card)">
          <span v-if="card.id === 0">Random Mint</span>
          <span v-if="card.id !== 0">Mint</span>
          <span v-if="isMinting && currentMintingCard === card.id"><i class="fa fa-spinner"></i></span></button>
      </div>
    </div>
  </div>
  <NotificationToast v-if="notification?.show" :message="notification?.message" :type="notification?.type"
    @close="notification.show = false" />
</template>

<script>
import NotificationToast from '@/components/NotificationToast.vue';
import DreamTeamNFT from '../../crypto_utils/constants/DreamTeamNFT.json';
import HDKeyring from "@/crypto_utils/HDKeyring";
import BackButtonTelegram from '@/mixins/BackButtonTelegram';
export default {
  mixins: [BackButtonTelegram],
  components: {
    NotificationToast,
  },
  data() {
    return {
      cards: [
        {
          id: 0,
          name: "Dream Team Collection 0",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreidkj3coudb4dfo7xzrk5plkmva23kic4jc5mo3cnjy4vmvwdmzhba", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        },
        {
          id: 1,
          name: "Dream Team Collection 12",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreibvmblejzef3udzcv3ybvtweksakmospdcros37bc4l6gnf3myhq4", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        },
        {
          id: 2,
          name: "Dream Team Collection 11",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreibnjjiqgpwnvzkts4y2rmwym2fiukz2rtwcqu57k7grxnk7wfs5pi", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        },
        {
          id: 3,
          name: "Dream Team Collection 10",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreigrlmfpxbt2v6a7jyl5fh4o63yz5xc6sqn5sytp3ogyldrucuz6ni", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        },
        {
          id: 4,
          name: "Dream Team Collection 9",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreibb6chbl2fas2bk3pqnfcnvv4orxtgqi5do4nadb2kaj3y4h56luy", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        },
        {
          id: 5,
          name: "Dream Team Collection 8",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreihvoxhgoovurxzi5igjsvle4a3w2wivrct7q2jllfn2s2xwnnihki", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        },
        {
          id: 6,
          name: "Dream Team Collection 7",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreifge3gbi4ekw55ec3vsoztmnme7eg2eo6hru425cb6hp3yn24bste", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        },
        {
          id: 7,
          name: "Dream Team Collection 6",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreibzgi7nfydzfqpeifpcwjwxw5o4wqtaiuzuk6lqajgrrgc52jdyra", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        },
        {
          id: 8,
          name: "Dream Team Collection 5",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreig4orqlvmhconpsj5qiq3raitgkfxue2ebmvoypwrxeugaa6il74m", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        },
        {
          id: 9,
          name: "Dream Team Collection 4",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreibsqqvf36i77h3q3cnerpdc7cqkhkrjmypbztzqm7zpfh2xkyldci", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        },
        {
          id: 10,
          name: "Dream Team Collection 3",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreiejbqceikehxxq7gxqzmh4ubblmegs4oqubzpf3vh6ni2csmimzqq", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        },
        {
          id: 11,
          name: "Dream Team Collection 2",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreiegpz7iz6ehv6lglmh33qsj5hffonvitngpb3q4ypo7rmlbjxdp5m", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        },
        {
          id: 12,
          name: "Dream Team Collection 1",
          address: "0x002A78bf69d8148b03DbfF028886E58EA92DC00a",
          image: "https://turquoise-elaborate-dolphin-481.mypinata.cloud/ipfs/bafkreifgjvdrct3p7qhed53jagiaragpcarys3qkdftnlocs4biw3m2ixq", // Replace with actual image paths
          price: 1,
          quantity: 1200000,
        }
      ],
      isMinting: false,
      currentMintingCard: null,
      notification: {
        show: false,
        message: "",
        type: "",
      },
    };
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
        const contractAddress = card.address;
        const keyringService = new HDKeyring();
        await keyringService.unlock();
        const fromAddress = keyringService.getActiveWallet().address;
        const price = await keyringService.callContractMethod('mintPrice', fromAddress, contractAddress, DreamTeamNFT.abi, []);
        console.log({ price });
        let contractTransaction = null;
        if (card.id === 0) {
          contractTransaction = await keyringService.callContractMethod('mint', fromAddress, contractAddress, DreamTeamNFT.abi, [{ value: price }]);
        }
        else {
          contractTransaction = await keyringService.callContractMethod('premint', fromAddress, contractAddress, DreamTeamNFT.abi, [fromAddress, card.image, { value: price }]);
        }

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
      }
    },
    showError(message) {
      this.notification.show = true;
      this.notification.message = message;
      this.notification.type = "error";
    },
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
  @apply grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 overflow-y-auto;
  height: calc(100% - 100px);
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
}

/* Custom CSS */
.card {
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.mint-button {
  box-shadow: 0px 2px 4px rgba(255, 223, 0, 0.6);
}
</style>