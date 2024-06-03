<template>
    <div class="popup-event" v-if="visible">
        <div class="box-event">
            <!-- <div @click="$emit('close')" class="close-home">
                <i class="fa-solid fa-rectangle-xmark"></i>
            </div> -->

            <Loading :loading="loading" />

            <div class="box-desc-event" v-if="!loading">
                <!--  @click="$emit('openCoomSoon')" -->
                <div
                    class="item-event"
                    v-for="(item, index) in eventData"
                    :key="index"
                    :style="{
                        backgroundImage: `url(https://qfan-api.qcloud.asia${item?.attributes?.banner?.data?.attributes?.formats?.small?.url})`,
                    }"
                >
                    <div class="box-content-event">
                        <div class="title-item">
                            {{ item?.attributes?.title }}
                        </div>
                        <div class="box-pool">
                            <div class="text-pool">Prize Pool:</div>
                            <div class="img-pool t-primary-color">
                                {{
                                    extractNumber(
                                        item?.attributes?.content?.[0]
                                            ?.children?.[0]?.text
                                    )
                                }}
                                <img
                                    src="./../../public/assets/logo-quai.svg"
                                />
                            </div>
                        </div>
                        <div class="btn-join-now">
                            <button @click="handleJoin(item)">Join Now</button>
                        </div>
                        <div class="box-time">
                            <span
                                ><i class="fa-solid fa-clock"></i>
                                {{
                                    item?.attributes?.content?.[1]?.children?.[0]?.text?.replace(
                                        "Time: ",
                                        ""
                                    )
                                }}</span
                            >
                        </div>
                    </div>
                </div>
            </div>

            <DetailEvent
                :isDetailEvent="isJoinNow"
                :detailEvent="detailEvent"
                @close="isJoinNow = false"
            />

            <EmptyForm v-if="showEmptyFormEvent" />
        </div>
    </div>
</template>

<script>
import userService from "../services/userService";
import Loading from "./LoadingForm.vue";
import DetailEvent from "./DetailEvent.vue";
import EventBus from "./../utils/eventBus";

export default {
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        Loading,
        DetailEvent,
    },
    async mounted() {
        // Telegram.WebApp.ready();
        // Telegram.WebApp.setHeaderColor("ffffff");
        // Telegram.WebApp.BackButton.show();
        EventBus.on("close-detail-event", this.closeDetailEvent);
        if (this.visible) {
            await this.fetchEventData();
        }
    },
    created() {
        if (this.visible) {
            this.fetchEventData();
        }
    },
    beforeUnmount() {
        EventBus.off("close-detail-event", this.closeDetailEvent);
    },
    data() {
        return {
            loading: true,
            eventData: null,
            buttonText: [],
            loadingBtn: [],
            isJoinNow: false,
            detailEvent: null,
        };
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                this.fetchEventData();
            }
        },
    },

    methods: {
        extractNumber(text) {
            const regex = /\d{1,3}(?:,\d{3})*/;
            const match = text?.match(regex);
            if (match) {
                return match[0];
            } else {
                return "";
            }
        },
        async fetchEventData() {
            try {
                this.loading = true;
                const res = await userService.getListEvent();

                if (res?.data) {
                    this.eventData = res?.data;
                }
            } catch (error) {
                this.eventData = [];
            } finally {
                this.loading = false;
            }
        },
        handleJoin(item) {
            this.detailEvent = item;
            this.isJoinNow = true;
        },
        closeDetailEvent() {
            this.isJoinNow = false;
        },
    },
    computed: {
        showEmptyFormEvent() {
            return this.eventData?.length == 0;
        },
    },
};
</script>

<style>
.popup-event {
    height: calc(100% - 56px);
    position: absolute;
    width: 100%;
    top: 0%;
    z-index: 999;
    animation: fadeInEvent 0.1s ease forwards;
    color: #fff;
    background-image: url("./../../public/assets/event/background-event.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

@keyframes fadeInEvent {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.box-event {
    padding: 20px;
    height: calc(100% - 40px);
}

.box-desc-event {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: calc(100% - 5px);
    overflow-y: auto;
    animation: fadeInDesc 0.1s ease forwards;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.box-desc-event::-webkit-scrollbar {
    display: none;
}

@keyframes fadeInDesc {
    0% {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.item-event {
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    border-radius: 10px;
}
.box-content-event {
    height: calc(100% - 20px);
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
}
.title-item {
    font-size: 12px;
    font-family: monospace;
}
.box-pool img {
    margin-left: 3px;
    width: 15px;
}
.text-pool {
    font-size: 12px;
}
.img-pool {
    display: flex;
    align-items: center;
}
.btn-join-now button {
    width: auto;
    border-radius: 10px;
    font-size: 12px;
}
.box-time {
    font-size: 10px;
    font-family: monospace;
    background-color: #000000;
    padding: 5px;
    border-radius: 15px;
    width: max-content;
}

.close-home {
    position: absolute;
    top: 1%;
    right: 2%;
}
</style>
