<template>
    <div class="popup-event" v-if="visible">
        <div class="box-event">
            <Loading :loading="loading" />

            <div class="box-desc-event" v-if="!loading">
                <!--  @click="$emit('openCoomSoon')" -->
                <div
                    class="item-event"
                    v-for="(item, index) in eventData"
                    :key="index"
                    :style="{
                        backgroundImage: `url(${apiBaseUrl}${item?.attributes?.banner?.data?.attributes?.formats?.small?.url})`,
                    }"
                    @click="handleJoin(item)"
                >
                    <div class="box-content-event">
                        <div class="title-item">
                            <div class="event-title">
                                {{ item?.attributes?.title }}
                            </div>
                            <div class="event-content">
                                {{ item?.attributes?.description }}
                            </div>
                        </div>

                        <!-- <div class="btn-join-now">
                            <button @click="handleJoin(item)">Join Now</button>
                        </div> -->
                        <!-- <div class="box-time">
                            <span
                                ><i class="fa-solid fa-clock"></i>
                                {{
                                    item?.attributes?.content?.[1]?.children?.[0]?.text?.replace(
                                        "Time: ",
                                        ""
                                    )
                                }}</span
                            >
                        </div> -->
                    </div>
                </div>
            </div>

            <DetailEvent
                :isDetailEvent="isJoinNow"
                :detailEvent="detailEvent"
                :idUser="idUser"
                :dataQPoint="dataQPoint"
                @close="isJoinNow = false"
            />

            <EmptyForm v-if="showEmptyFormEvent" />
        </div>
    </div>
</template>

<script lang="ts">
import userService from "../../services/userService";
import Loading from "../../components/LoadingForm.vue";
import DetailEvent from "../DetailEvent/DetailEvent.vue";
import EmptyForm from "../../components/EmptyForm.vue";
import { IEvent } from "../../interface";

export default {
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        idUser: {
            type: String,
            required: true,
        },
        dataQPoint: {
            type: Object,
            required: true,
        },
    },
    components: {
        Loading,
        DetailEvent,
        EmptyForm,
    },
    async mounted() {
        if (this.visible) {
            await this.fetchEventData();
        }
    },
    created() {
        if (this.visible) {
            this.fetchEventData();
        }
    },

    data() {
        return {
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
            loading: true,
            eventData: [] as IEvent[],
            buttonText: [],
            loadingBtn: [],
            isJoinNow: false,
            detailEvent: {} as IEvent,
        };
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                this.isJoinNow = false;
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
        handleJoin(itemDetail: IEvent) {     
            const { actionType, status, route } = itemDetail?.attributes || {};
           
            if (actionType === "POST") {
                return this.$router.push(route);
            } else if (actionType === "REDIRECT_EXTERNAL") {
                return (window.location.href = route);
            } else {
                switch (status) {
                    case "PENDING_TO_ACTIVE":
                        this.$emit("openCoomSoon");
                        break;
                    case "ACTIVE":
                        this.detailEvent = itemDetail;
                        this.isJoinNow = true;
                        break;
                }
            }
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
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    z-index: 999;
    animation: fadeInEvent 0.1s ease forwards;
    color: #fff;
    background-image: url("./../../../public/assets/event/background-event.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

@keyframes fadeInEvent {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.box-event {
    padding: 20px;
    height: calc(100% - 125px);
}

.box-desc-event {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: calc(100% - 5px);
    overflow-y: auto;
    animation: fadeInDescEvent 0.5s ease forwards;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.box-desc-event::-webkit-scrollbar {
    display: none;
}

@keyframes fadeInDescEvent {
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
}

.item-event {
    width: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    border-radius: 15px;
    /* height: 17vh; */
}

.box-content-event {
    position: relative;
    height: 100%;
    /* padding: 80px; */
    /* height: calc(100% - 20px);
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 15px;
    font-family: monospace;
    font-weight: bold; */
}

.event-title {
    font-size: 24px;
    color: #ff0000;
    text-shadow: 1px 1px 1px white;
}
.event-content {
    margin-left: 2px;
}

.box-pool {
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

.btn-join-now {
    position: absolute;
    bottom: 25%;
    left: 17px;
}
.btn-join-now button {
    width: auto;
    border-radius: 15px;
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
.box-time span {
    padding: 0 5px;
}

.close-home {
    position: absolute;
    top: 1%;
    right: 2%;
}
</style>
