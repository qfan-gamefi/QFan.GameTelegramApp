<template>
    <div class="popup-booster" v-if="visible">
        <div class="box-booster">
            <!-- <div @click="$emit('close')" class="close-booster">
                <img src="./../../public/assets/back.svg" />
                Back
            </div> -->

            <Loading :loading="loading" />
            <EmptyForm v-if="showEmptyForm" />

            <div class="box-content-booster" v-if="!loading">
                <div class="your-balance">
                    <div class="title-your-balance">Your Balance</div>
                    <div class="point-balance t-primary-color">
                        <img src="./../../public/assets/logo.svg" />
                        {{ balance }}
                    </div>
                    <div class="desc-your-balance">
                        Mining Speed: 0.15 QUAI/hour
                    </div>
                </div>

                <div class="stadium text-outline-black">Stadium</div>
                <div
                    class="container-stadium"
                    v-for="item in stadiumItems"
                    :key="item.id"
                >
                    <div class="logo-stadium">
                        <img
                            :src="`https://qfan-api.qcloud.asia${item?.attributes?.image?.data?.attributes?.url}`"
                        />
                    </div>

                    <div class="box-stadium">
                        <div class="stadium-left">
                            <div class="lv-stadium t-primary-color">
                                Level {{ item.attributes.level }}
                            </div>
                            <div class="content-stadium">
                                {{ item.attributes.name }}
                            </div>
                            <div class="desc-stadium">
                                {{ item.attributes.description }}
                            </div>
                        </div>

                        <div class="stadium-right t-primary-color">
                            {{ item.attributes.price }}
                            <img src="./../../public/assets/logo.svg" />
                        </div>
                    </div>
                </div>

                <div class="stadium text-outline-black">Training room</div>
                <div
                    class="container-stadium"
                    v-for="item in trainingItems"
                    :key="item.id"
                >
                    <div class="logo-stadium">
                        <img
                            :src="`https://qfan-api.qcloud.asia${item?.attributes?.image?.data?.attributes?.url}`"
                        />
                    </div>

                    <div class="box-stadium">
                        <div class="stadium-left">
                            <div class="lv-stadium t-primary-color">
                                Level {{ item.attributes.level }}
                            </div>
                            <div class="content-stadium">
                                {{ item.attributes.name }}
                            </div>
                            <div class="desc-stadium">
                                {{ item.attributes.description }}
                            </div>
                        </div>

                        <div class="stadium-right t-primary-color">
                            {{ item.attributes.price }}
                            <img src="./../../public/assets/logo.svg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
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
        balance: {
            type: String,
            default: "",
        },
    },
    components: {
        Loading,
    },
    // created() {
    //     if (this.visible) {
    //         this.fetchEventData();
    //     }
    // },
    data() {
        return {
            loading: true,
            listData: null,
            stadiumItems: null,
            trainingItems: null,
        };
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                this.fetchListData();
            }
        },
    },
    // async mounted() {
    //     if (this.visible) {
    //         await this.fetchEventData();
    //     }
    // },
    methods: {
        async fetchListData() {
            try {
                this.loading = true;
                const res = await userService.getListBooster();

                if (res?.data) {
                    const stadiumItems = res?.data.filter(
                        (item) => item.attributes.type == "SPEED"
                    );
                    this.stadiumItems = stadiumItems;

                    const trainingItems = res?.data.filter(
                        (item) => item.attributes.type == "AMOUNT"
                    );
                    this.trainingItems = trainingItems;

                    this.listData = res?.data;
                }
            } catch (error) {
                this.listData = [];
            } finally {
                setTimeout(() => {
                    this.loading = false;
                }, 300);
            }
        },
    },
    computed: {
        showEmptyForm() {
            return this.listData?.length == 0;
        },
    },
};
</script>

<style>
.close-booster {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 13px;
    border-bottom: 1px solid #fff;
    padding-bottom: 5px;
    margin: 0 -20px;
}

.close-booster img {
    margin-left: 20px;
}

.popup-booster {
    height: 90%;
    position: absolute;
    width: 100%;
    /* top: 50%; */
    top: 45%;
    left: 50%;
    /* transform: translate(-50%, -50%); */
    z-index: 999;
    animation: fadeIn 0.1s ease forwards;

    background-image: url("./../../public/assets/booster/background-booster.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}

@keyframes fadeIn {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
}

.box-booster {
    padding: 0 20px;
    height: calc(100% - 25px);
}

.box-content-booster {
    height: calc(100% - 35px);
    color: #fff;
    animation: fadeInDesc 0.1s ease forwards;
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
/* scroll box  */
/* .box-desc-event {
    background: #67bdef;
    border-radius: 10px;
    max-height: calc(100% - 75px);
    overflow-y: auto;
}
.box-desc-event::-webkit-scrollbar {
    display: none;
} */

.your-balance {
    margin-top: 15px;
    background-color: #00256c;
    border-radius: 15px;
    text-align: center;
    padding: 10px;
}
.title-your-balance {
    font-size: 12px;
    font-family: monospace;
    font-weight: bold;
}
.point-balance {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    font-size: 20px;
}
.point-balance img {
    width: 40px;
    height: 40px;
    margin-right: 5px;
}
.desc-your-balance {
    font-family: monospace;
}

.stadium {
    margin: 15px 0;
}
.container-stadium {
    background-color: #00256c;
    border-radius: 15px;
    text-align: center;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo-stadium img {
    width: 50px;
}
.box-stadium {
    display: flex;
    gap: 10px;
}
.stadium-left {
    display: flex;
    flex-direction: column;
    text-align: left;
    gap: 5px;
}
.lv-stadium {
    font-size: 12px;
}
.desc-stadium {
    font-size: 10px;
    font-family: monospace;
}
.stadium-right {
    display: flex;
    align-items: center;
}
.stadium-right img {
    width: 25px;
    height: 25px;
    margin-left: 5px;
}
</style>
