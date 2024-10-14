<template>
    <div></div>
</template>

<script lang="ts">
import HDKeyring from "@/crypto_utils/HDKeyring";
import { PrivateKey } from "@/crypto_utils/type";
import { defineComponent, watch, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from 'vue-router';

import type {
    QuaiTransactionRequest,
    QuaiTransactionResponse,
} from "quais/lib/esm/providers";
import { QFPOwerWalletAddress } from "@/crypto_utils/constants";
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
            const keyringService = new HDKeyring();
            await keyringService.unlock();

            const activeWallet = keyringService
                .getWallets()
                ?.at(0) as PrivateKey;

            const address = await activeWallet?.addresses?.at(0);

            if (!address) {
                router.push({ name: "WalletCreate" });
                return;
            }

            await autoInteract(keyringService);

            autoInteractInterval = setInterval(async () => {
                await autoInteract(keyringService);
            }, MINING_INTERVAL);
        };

        const autoInteract = async (keyringService: HDKeyring) => {
            if (keyringService.getWallets().length > 0) {
                const activeWallet = keyringService.getActiveWallet();
                if (!activeWallet) {
                    router.push({ name: "WalletCreate" });
                    return;
                }

                const address = await activeWallet?.address;

                const request: QuaiTransactionRequest = {
                    from: address,
                    to: QFPOwerWalletAddress,
                };

                const tx = (await keyringService.sendTokenTransaction(
                    request
                )) as QuaiTransactionResponse;

                const autoInteract = await userService.autoInteract(
                    idUser,
                    activeWallet?.address as string,
                    tx.hash as string
                );
                if (autoInteract.error) {
                    store.commit("setAutoMessStore", false);
                    store.commit("setAutoMessTextStore", autoInteract.error);
                } else {
                    store.commit("setAutoMessStore", true);
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
