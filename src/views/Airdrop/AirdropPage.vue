<template>
    <div class="airdrop-page fade-in">
        <div class="absolute w-full top-[35%] px-5 flex flex-col gap-5">
            <div class="p-3 bg-[#003702] rounded-lg border border-[#129900]">
                <div
                    v-for="(item, index) in title_airdrop"
                    :key="index"
                    class="p-3 flex w-full items-center border-b-2 border-b-[#129900] gap-3"
                    >
                    <div><img :src="item.image" class="w-[40px]" /></div>
                    <div>{{ item.text }}</div>
                </div>
            </div>
            <div>
                <button disabled class="">CHECK AIRDROP</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "AirdropPage",
    data() {
    return {
        title_airdrop: [
        { image: "/assets/airdrop/cup.png", text: "BADGE BETA TESTER" },
        { image: "/assets/airdrop/cup.png", text: "LEVEL" },
        { image: "/assets/airdrop/cup.png", text: "MASTER MINER" },
        { image: "/assets/airdrop/cup.png", text: "MINI GAME" },
        { image: "/assets/airdrop/cup.png", text: "REFFERALS" },
      ],
    };
  },
};
</script>

<style scoped lang="scss">
button {
    padding: 15px;
    border: 2px solid #003702;
    border-radius: 8px;
    color: #760000;
    font-weight: bold;
}
button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.airdrop-page {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    left: 0;
    z-index: 998;
    color: #fff;
    background-image: url("/assets/airdrop/bg_air.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}
</style>
