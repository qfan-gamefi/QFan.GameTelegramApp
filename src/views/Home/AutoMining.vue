<template>
    <div></div>
</template>

<script lang="ts">
import HDKeyring from "@/crypto_utils/HDKeyring";
import { PrivateKey } from "@/crypto_utils/type";
import { defineComponent, watch, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

import type {
    QuaiTransactionRequest,
    QuaiTransactionResponse,
} from "quais/lib/esm/providers";
import { CONTRACT_OWNER_ADDRESS } from "@/crypto_utils/constants";
import userService from "@/services/userService";

export default defineComponent({
    name: "AutoMining",
    setup() {
        const store = useStore();
        const router = useRouter();

        const MINING_INTERVAL = 1000 * 60 * 1 + 5000;
        let autoInteractInterval = null as NodeJS.Timeout | null;
        const dataUserTele = window.Telegram?.WebApp?.initDataUnsafe;
        const idUser = dataUserTele?.user?.id?.toString() ?? "";

        const onAutoInteract = async () => {
            try {
                const keyringService = new HDKeyring();
                await keyringService.unlock();

                const activeWallet = keyringService.getActiveWallet();
                const address = await activeWallet?.address;

                if (!address) {
                    store.commit("setAutoMining", false);
                    router.push({ name: "WalletCreate" });
                    return;
                }
                if (!address) {
                    store.commit("setAutoMining", false);
                    router.push({ name: "WalletCreate" });
                    return;
                }

                await autoInteract(keyringService);

                autoInteractInterval = setInterval(async () => {
                    await autoInteract(keyringService);
                }, MINING_INTERVAL);
            } catch (error) {
                console.log(error);

            }

        };

        const autoInteract = async (keyringService: HDKeyring) => {
            if (keyringService.getWallets().length > 0) {
                const activeWallet = keyringService.getActiveWallet();
                if (!activeWallet) {
                    store.commit("setAutoMining", false);
                    router.push({ name: "WalletCreate" });
                    return;
                }

                //check balance of active wallet, if balance is less than 0.01, stop auto mining
                const balance = await keyringService.getBalance(activeWallet.address);
                if (balance < 0.01) {
                    store.commit("setAutoMining", false);
                    store.commit("setAutoMessStore", false);
                    store.commit("setAutoMessTextStore", "Your Quai balance is not enough to mining, please check wallet balance and continue mining again.");
                    return;
                }

                const address = await activeWallet?.address;

                const request: QuaiTransactionRequest = {
                    from: address,
                    to: CONTRACT_OWNER_ADDRESS,
                };
                const tx = (await keyringService.sendTokenTransaction(request)) as unknown as QuaiTransactionResponse;
                const autoInteract = await userService.autoInteract(
                    idUser,
                    activeWallet?.address as string,
                    tx.hash
                );
                if (autoInteract.error) {
                    store.commit("setAutoMessStore", false);
                    store.commit("setAutoMessTextStore", autoInteract.message || autoInteract.error);
                    store.commit("setAutoMessTextStore", autoInteract.message || autoInteract.error);
                } else {
                    store.commit("setAutoMessStore", true);
                    store.commit("setAutoMessTextStore", autoInteract?.updatedAt);
                    store.commit("setAutoMessTextStore", autoInteract?.updatedAt);
                }
            } else {
                router.push({ name: "WalletCreate" });
            }
        };

        onMounted(() => {
            watch(
                () => store.state.autoMiningStore, // store.getters.isAutoMiningTriggered,
                (newValue) => {
                    if (newValue) {
                        onAutoInteract();
                    }
                }
            );
        });

        onUnmounted(() => {
            if (autoInteractInterval) {
                clearInterval(autoInteractInterval);
            }
        });

        return {};
    },
    methods: {},
});
</script>

<style scoped>
/* No styles needed unless required */
</style>
