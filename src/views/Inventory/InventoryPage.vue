<template>
    <div class="wr-inventory-page">
        <div class="banner-inventory"></div>

        <div class="btn-inventory">
            <div
                v-for="(button, index) in buttonInventory"
                :key="index"
                class="btn-item-inventory"
                :class="{ active: activeButton === button?.name }"
            >
                <!-- @click="setActiveButton(button?.name)" -->
                {{ button.label }}
            </div>
        </div>

        <div class="wr-box">
            <div class="list-inventory">
                <div class="box-item">
                    <div
                        class="item"
                        v-for="(item, index) in itemsInventory"
                        :key="index"
                    >
                        <div
                            class="item-img"
                            :style="{ backgroundImage: `url(${item})` }"
                        ></div>
                        <div class="slot-item">x5</div>
                        <div class="item-btn">
                            <button @click="showCoomingSoon = true">
                                Fusion
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div
            :class="[
                'popup-cooming-soon',
                { 'closing-popup': !showCoomingSoon },
            ]"
            v-if="showCoomingSoon"
        >
            <p>Coming soon</p>
            <button
                @click="showCoomingSoon = false"
                class="btn-close-coming-soon"
            >
                Close
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
// import LoadingForm from '@/components/LoadingForm.vue';
// import NotificationToast from '@/components/NotificationToast.vue';

interface Button {
    name: string;
    label: string;
}

export default defineComponent({
    name: "InventoryPage",
    components: {
        // NotificationToast,
        // LoadingForm,
    },
    created() {
        this.getDataInventor();
    },
    data() {
        return {
            showCoomingSoon: false,
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
            activeButton: "Inventory" as string,
            buttonInventory: [
                { name: "Inventory", label: "Inventory" },
                { name: "Fusion", label: "Fusion" },
                { name: "History", label: "History" },
            ] as Button[],

            itemsInventory: [
                "./../../public/assets/inventory/platinum.png",
                "./../../public/assets/inventory/gold.png",
                "./../../public/assets/inventory/silver.png",
                "./../../public/assets/inventory/bronze.png",
            ],
        };
    },
    methods: {
        setActiveButton(button: string) {
            this.activeButton = button;
        },
        async getDataInventor() {
            try {
                const config = {
                    method: "get",
                    maxBodyLength: Infinity,
                    url: "https://0d39-171-224-181-129.ngrok-free.app/api/v1/getInventory?userId=5314337740",
                    headers: {
                        "ngrok-skip-browser-warning": "1",
                    },
                };

                const response = await axios.request(config);
                console.log(response);

                console.log(JSON.parse(response.data?.message));
            } catch (error) {
                console.error(error);
            }
        },
    },
});
</script>

<style scoped lang="scss">
.wr-inventory-page {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    left: 0;
    z-index: 999;
    animation: fadeInDetailEvent 0.1s ease forwards;
    color: #fff;
    background-image: url("./../../public/assets/inventory/background-inventory.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}
@keyframes fadeInDetailEvent {
    0% {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.banner-inventory {
    background-image: url("./../../public/assets/inventory/banner-inventory.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    width: 100%;
    height: 100px;
}

.btn-inventory {
    display: flex;
    width: 100%;
    padding: 7px 0;
    background-color: #0d2779;
    font-family: monospace;
    justify-content: space-around;
}
.btn-item-inventory.active {
    background: #ffa53a;
    color: white;
}

.btn-item-inventory {
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
}

.wr-box {
    height: 100%;
    padding: 15px;
    .list-inventory {
        height: calc(100% - 170px);
        display: flex;
        flex-direction: column;
        gap: 10px;
        background-color: #00175f;
        border-radius: 10px;
    }
    .box-item {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px 10px;
        padding: 10px;
        button {
            padding: 12px;
            font-size: 12px;
            border-radius: 8px;
        }
        .item {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 7px;
        }
        .item-img {
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            height: 150px;
            border-radius: 5px;
        }
        .slot-item {
            font-size: 10px;
            padding: 5px;
            position: absolute;
            top: 0;
        }
    }
}

.popup-cooming-soon {
    z-index: 999;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 30px;
    border: 1px solid #ccc;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.5s forwards;
    border-radius: 10px;
}

//cooming-soon
.popup-cooming-soon p {
    color: black;
}

.closing-popup {
    animation: slideOut 0.5s forwards;
}

@keyframes slideIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        opacity: 1;
    }
    to {
        opacity: 0;
    }
}
//cooming-soon
</style>
