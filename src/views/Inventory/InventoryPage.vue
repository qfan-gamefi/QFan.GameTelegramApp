<template>
    <div class="wr-inventory-page">
        <div class="banner-inventory"></div>

        <div class="btn-inventory">
            <div
                v-for="(button, index) in buttonInventory"
                :key="index"
                class="btn-item-inventory"
                :class="{ active: activeButton === button?.name }"
                @click="setActiveButton(button?.name)"
            >
                {{ button.label }}
            </div>
        </div>

        <div class="wr-box">
            <div class="inventory-detail">
                <div class="box-item" v-if="activeButton === 'Inventory'">
                    <div
                        class="item"
                        v-for="(item, index) in itemsInventory"
                        :key="index"
                    >
                        <div
                            class="item-img"
                            :style="{
                                backgroundImage: `url(${item?.ItemDef?.ImageUrl})`,
                            }"
                        ></div>
                        <div class="slot-item">x{{ item?.ItemCount }}</div>
                        <div class="item-btn">
                            <button @click="showCoomingSoon = true">
                                Fusion
                            </button>
                        </div>
                    </div>
                </div>

                <div class="box-item" v-if="activeButton === 'Badges'">
                    <div
                        class="item-badge"
                        v-for="(item, index) in itemsBadge"
                        :key="index"
                    >
                        <img class="img-badge" :src="item?.ItemDef?.ImageUrl" />
                        <div class="item-btn">
                            <button @click="showCoomingSoon = true">Use</button>
                        </div>
                    </div>
                </div>

                <div class="box-fusion" v-if="activeButton === 'Fusion'">
                    <div
                        class="item-fusion"
                        v-for="(item, index) in listFusion"
                        :key="index"
                    >
                        <div class="item">
                            <div class="left">
                                <div
                                    class="el"
                                    v-for="(el, idx) in parseItemDef(
                                        item.ResourcesItemDefIds
                                    )"
                                    :key="idx"
                                >
                                    <div class="text">
                                        {{ numberWithItem(el.ItemDefId) }}/{{
                                            el.Count
                                        }}
                                    </div>
                                    <img :src="el.ImageUrl" />
                                </div>
                            </div>

                            <div class="right">
                                <div class="img">
                                    <img
                                        src="@public/assets/inventory/triangle.png"
                                    />
                                </div>
                                <div class="content">
                                    <div>{{ item.Name }}</div>
                                    <div class="img">
                                        <img :src="item.Treasure.ImageUrl" />
                                    </div>
                                    <div
                                        class=""
                                        :class="[
                                            'btn-fusion',
                                            {
                                                disable:
                                                    checkDisableFusion(item),
                                            },
                                        ]"
                                    >
                                        <button @click="handleFausion(item.id)">
                                            Claim
                                        </button>
                                    </div>
                                </div>
                            </div>
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

        <NotificationToast
            v-if="showNotification"
            :message="notificationMessage"
            :type="notificationType"
            @close="showNotification = false"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import userServiceInventory from "@/services/inventoryService";
import { EItemDefType, IFusion, IItemInventory } from "@/interface";
import "./../../styles/common.scss";
import userService from "@/services/userService";
import axios from "axios";

// import LoadingForm from '@/components/LoadingForm.vue';
import NotificationToast from "@/components/NotificationToast.vue";
enum ButtonName {
    Inventory = "Inventory",
    Badges = "Badges",
    Fusion = "Fusion",
    History = "History",
}
interface Button {
    name: ButtonName;
    label: string;
}

export default defineComponent({
    name: "InventoryPage",
    components: {
        NotificationToast,
        // LoadingForm,
    },
    created() {
        this.getDataInventor();
        this.getFausion();
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            showCoomingSoon: false,
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
            userId: userInfo?.user?.id || "",
            showNotification: false,
            notificationMessage: "",
            notificationType: "",
            activeButton: ButtonName.Inventory as ButtonName,
            buttonInventory: [
                { name: "Inventory", label: "Inventory" },
                { name: "Badges", label: "Badges" },
                { name: "Fusion", label: "Fusion" },
                { name: "History", label: "History" },
            ] as Button[],

            // itemsInventory: [
            //     "./../../public/assets/inventory/platinum.png",
            //     "./../../public/assets/inventory/gold.png",
            //     "./../../public/assets/inventory/silver.png",
            //     "./../../public/assets/inventory/bronze.png",
            // ],
            itemsInventory: [] as IItemInventory[],
            itemsBadge: [] as IItemInventory[],

            listFusion: [] as IFusion[],
        };
    },
    methods: {
        async renderNotification(message, type) {
            this.notificationMessage = message;
            this.notificationType = type;
            this.showNotification = true;
            setTimeout(() => {
                this.showNotification = false;
            }, 2000);
        },
        async renderSuccess(text: string) {
            this.renderNotification(text, "success");
        },
        async renderErr(text) {
            this.renderNotification(text, "error");
        },
        setActiveButton(button: ButtonName) {
            if (button !== ButtonName.History) {
                this.activeButton = button;
            } else {
                this.showCoomingSoon = true;
            }
        },
        numberWithItem(itemId: number) {
            this.itemsInventory;
            const filterIdItem: IItemInventory = this.itemsInventory?.find(
                (el) => el.ItemDefId === itemId
            );
            return filterIdItem?.ItemCount || 0;
        },
        parseItemDef(item: string) {
            const data = JSON.parse(item);
            return data;
        },
        checkDisableFusion(item) {
            const count = JSON.parse(item.ResourcesItemDefIds);

            const result = count.every((itemA) => {
                const matchingItemB = this.itemsInventory.find(
                    (itemB) => itemB.ItemDefId === itemA.ItemDefId
                );
                return matchingItemB
                    ? itemA.Count < matchingItemB.ItemCount
                    : true;
            });

            return result ? "" : "disable";
        },
        async getDataInventor() {
            try {
                const res = await userServiceInventory.getListInventory(
                    Number(this.userId)
                );

                const filterData = res?.Items?.filter(
                    (item) => item?.ItemDef?.Type === EItemDefType.Common
                );
                const filterBadge = res?.Items?.filter(
                    (item) => item?.ItemDef?.Type === EItemDefType.Medal
                );

                this.itemsBadge = filterBadge;
                this.itemsInventory = filterData;
            } catch (error) {
                console.error(error);
            }
        },
        async getFausion() {
            try {
                const response = await axios.get(
                    "https://a025-171-224-180-141.ngrok-free.app/api/v1/fusion/getFusions",
                    {
                        headers: {
                            "ngrok-skip-browser-warning": "1",
                        },
                    }
                );
                const data = JSON.parse(response.data.message);
                this.listFusion = data;
            } catch (error) {
                console.error("Error fetching data:", error);
            }

            //hàm gọi đây a
            // try {
            //     const res = await userService.getFusion();
            //     console.error(res);
            // } catch (error) {
            //     console.error(error);
            // }
        },
        async handleFausion(idFusion: number) {
            try {
                const response = await axios.post(
                    "https://a025-171-224-180-141.ngrok-free.app/api/v1/fusion/makeFusion",
                    {
                        UserId: 2123800227, // this.userId,
                        CombineId: idFusion,
                    },
                    {
                        headers: {
                            "ngrok-skip-browser-warning": "1",
                        },
                    }
                );
                const data = JSON.parse(response.data.message);
                if (data.data.success) {
                    await this.renderSuccess(
                        `Received ${data?.data?.data?.Name}`
                    );
                    await this.getDataInventor();
                    await this.getFausion();
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }

            //hàm gọi đây a
            // try {
            // const data = {
            //     UserId:  this.userId,
            //     CombineId: idFusion,
            // }
            //     const res = await userService.makeFusion(data);
            // neu thanh cong goi rendersuccess va api nhu tren ngrok
            //     console.error(res);
            // } catch (error) {
            //     console.error(error);
            // }
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
    background-image: url("./../../../public/assets/inventory/background-inventory.png");
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
    background-image: url("./../../../public/assets/inventory/inventory-banner.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    width: 100%;
    // height: 100px;
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
    .inventory-detail {
        height: calc(100% - 180px);
        display: flex;
        flex-direction: column;
        gap: 10px;
        background-color: #00175f;
        border-radius: 10px;
        overflow-y: auto;
        scrollbar-width: none;
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
        .item-badge {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 7px;
            .img-badge {
                width: 100%;
            }
        }
        .item-img {
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            // height: 150px;
            border-radius: 5px;
        }
        .slot-item {
            font-size: 10px;
            padding: 5px;
            position: absolute;
            top: 0;
        }
    }
    .box-fusion {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px 0;
    }
    .item-fusion {
        padding: 0 10px;
        font-size: 12px;
        .item {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            border: 2px solid #56d6ff;
            border-radius: 5px;
            .left {
                display: flex;
                gap: 10px;
                align-items: center;
                .el {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    .text {
                        background-color: #2cde00;
                        text-align: center;
                        padding: 3px;
                        border-radius: 5px;
                    }
                    img {
                        width: 70px;
                    }
                }
            }
            .right {
                display: flex;
                gap: 15px;
                .img {
                    display: flex;
                    align-items: center;
                    img {
                        width: 15px;
                        height: auto;
                    }
                }
                .content {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    .img {
                        display: flex;
                        img {
                            width: 70px;
                            border-radius: 5px;
                        }
                    }
                    button {
                        font-size: 10px;
                        padding: 5px;
                        border-radius: 8px;
                    }
                    .disable {
                        pointer-events: none;
                        opacity: 0.8;
                    }
                }
            }
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
