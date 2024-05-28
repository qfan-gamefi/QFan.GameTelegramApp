<template>
    <div class="popup-event" v-if="visible">
        <div class="box-event">
            <!-- <div @click="$emit('close')" class="close-event">
                <img src="./../../public/assets/back.svg" />
                Back
            </div> -->
            <div @click="$emit('close')" class="close-home">
                <i class="fa-solid fa-xmark"></i>
            </div>

            <!-- <div class="box-content-event"> -->
            <!-- <div class="title-event">Events</div> -->

            <Loading :loading="loading" />

            <div
                class="box-desc-event"
                v-if="!loading"
                @click="$emit('openCoomSoon')"
            >
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
                            <button>Join Now</button>
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

                    <!-- <div class="item-left-event">
                            <div class="item-img">
                                <img
                                    v-bind:src="`https://qfan-api.qcloud.asia${item?.attributes?.banner?.data?.attributes?.formats?.small?.url}`"
                                />
                            </div>
                        </div>

                        <div class="item-right-event">
                            <div class="title-item-right-event">
                                {{ item?.attributes?.title }}
                            </div>

                            <div class="desc-item-right-event">
                                {{ item?.attributes?.description }}
                            </div>

                            <div
                                class="desc-item-right-event"
                                v-for="(itemChild, indexChild) in item
                                    ?.attributes?.content"
                                :key="indexChild"
                            >
                                <span>{{ itemChild.children[0].text }}</span>
                            </div>
                        </div> -->
                </div>
            </div>

            <EmptyForm v-if="showEmptyFormEvent" />
            <!-- <Toast /> -->
        </div>
    </div>
    <!-- </div> -->
</template>

<script>
import userService from "../services/userService";
import Loading from "./LoadingForm.vue";

export default {
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        Loading,
    },
    created() {
        if (this.visible) {
            this.fetchEventData();
        }
    },
    data() {
        return {
            loading: true,
            eventData: null,
            buttonText: [],
            loadingBtn: [],
        };
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                this.fetchEventData();
            }
        },
    },
    async mounted() {
        if (this.visible) {
            await this.fetchEventData();
        }
    },
    methods: {
        extractNumber(text) {
            const regex = /\d{1,3}(?:,\d{3})*/; // Bổ sung regex để loại bỏ dấu phân tách
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
                setTimeout(() => {
                    this.loading = false;
                }, 300);
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
    height: calc(100% - 57px);
    position: absolute;
    width: 100%;
    top: 0%;
    z-index: 999;
    animation: fadeIn 0.1s ease forwards;

    background-image: url("./../../public/assets/event/background-event.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

@keyframes fadeIn {
    0% {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(-0%, -0%) scale(1);
    }
}

.box-event {
    padding: 20px;
    height: calc(100% - 40px);
}

/* .box-content-event {
    height: calc(100% - 35px);
} */

/* .title-event {
    margin: 10px 0;
    text-shadow: 1px 1px 0 #9f8900, -1px -1px 0 #9f8900, 1px -1px 0 #9f8900,
        -1px 1px 0 #9f8900, 1px 0 0 #9f8900, -1px 0 0 #9f8900, 0 1px 0 #9f8900,
        0 -1px 0 #9f8900;
} */

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
/* .item-event {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px;
    font-size: 12px;
    font-family: monospace;
    border-bottom: 1px solid #ccc;
}

.item-event:last-child {
    border-bottom: none;
} */

.close-home {
    position: absolute;
    top: 1%;
    right: 1%;
}
.close-event {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 13px;
    border-bottom: 1px solid #fff;
    padding-bottom: 20px;
    margin: 0 -20px;
}

.close-event img {
    margin-left: 20px;
}

/* .item-left-event .item-img {
    display: flex;
}

.item-left-event .item-img img {
    width: 50px;
    height: 50px;
    border-radius: 5px;
}
.item-right-event {
    font-weight: bolder;
}
.title-item-right-event {
    font-size: 13px;
}
.desc-item-right-event {
    font-size: 10px;
} */
</style>
