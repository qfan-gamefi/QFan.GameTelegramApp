<template>
    <div></div>
</template>

<script lang="ts">
import { defineComponent, watch, onMounted, onUnmounted, computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import predictService from "@/services/predictService";
import { trackEventBtn } from "@/utils";

export default defineComponent({
    name: "AutoFlip",
    setup() {
        const store = useStore();
        const router = useRouter();

        const dataUserTele = window.Telegram?.WebApp?.initDataUnsafe;
        const idUser = dataUserTele?.user?.id?.toString() ?? "";
        const fullName = `${dataUserTele?.user?.first_name} ${dataUserTele?.user?.last_name}`;
        // const fullName = `su fly 007`;
        const countFlip = computed(() => store.state.countFlip);
        const autoFlipStore = computed(() => store.state.autoFlipStore);
        let isFlippingActive = false;
        const timeLoop = 25000;

        const flipCount = async (count?: number) => {
            const data = {
                gameId: 58,
                userId: idUser,
                userName: fullName,
                value: 200,
                valueType: "QFP",
                side: 0,
            };

            if (count === 0) {
                store.commit("setAutoFlip", false);
                isFlippingActive = false;
                return;
            }

            try {
                const res = await predictService.makeFlip(data);

                if (res.success === true && res?.data?.Status) {
                    if (isFlippingActive) {
                        setTimeout(() => {
                            flipCount(count === -1 ? -1 : count - 1);
                        }, timeLoop);
                    }
                } else if (
                    res.success === false &&
                    res?.data?.Reason?.includes("Pending")
                ) {
                    if (isFlippingActive) {
                        setTimeout(() => {
                            flipCount(count);
                        }, timeLoop);
                    }
                } else {
                    if (isFlippingActive) {
                        setTimeout(() => {
                            flipCount(count);
                        }, timeLoop);
                    }
                }
            } catch (error) {
                if (isFlippingActive) {
                    setTimeout(() => {
                        flipCount(count);
                    }, timeLoop);
                }
            }
        };

        const onAutoFlip = async () => {
            const total = countFlip.value;
            isFlippingActive = true;
            if (total > 0) {
                flipCount(total);
                trackEventBtn({
                    label: "Auto_flip",
                });
            }
            if (total === 0) {
                flipCount(-1);
            }
        };

        onMounted(() => {
            watch(
                () => store.state.autoFlipStore,
                (newValue) => {
                    if (newValue) {
                        onAutoFlip();
                    } else {
                        isFlippingActive = false;
                    }
                }
            );
        });

        onUnmounted(() => {});

        return {};
    },
    methods: {},
    data() {},
});
</script>

<style scoped>
/* No styles needed unless required */
</style>
