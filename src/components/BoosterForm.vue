<template>
    <div class="popup-booster" v-if="visible">
        <div class="box-booster">
            <div @click="$emit('close')" class="close-booster">
                <img src="./../../public/assets/back.svg" />
                Back
            </div>

            <div class="box-content-booster">
                <div class="your-balance">
                    <div class="title-your-balance">Your Balance</div>
                    <div class="point-balance">
                        <img src="./../../public/assets/logo.svg" />
                        {{ balance }}
                    </div>
                    <div class="desc-your-balance">
                        Mining Speed: 0.15 QUAI/hour
                    </div>
                </div>

                <div class="stadium">Stadium</div>

                <div class="container-stadium">
                    <div class="logo-stadium">
                        <img
                            src="./../../public/assets/booster/logo-stadium1.svg"
                        />
                    </div>

                    <div class="box-stadium">
                        <div class="stadium-left">
                            <div class="lv-stadium">Level 1</div>
                            <div class="content-stadium">School Stadium</div>
                            <div class="desc-stadium">
                                Increase the fill time to claim less often
                            </div>
                        </div>

                        <div class="stadium-right">
                            10 <img src="./../../public/assets/logo.svg" />
                        </div>
                    </div>
                </div>

                <div class="stadium">Training room</div>

                <div class="container-stadium">
                    <div class="logo-stadium">
                        <img
                            src="./../../public/assets/booster/training-room.svg"
                        />
                    </div>

                    <div class="box-stadium">
                        <div class="stadium-left">
                            <div class="lv-stadium">Level 1</div>
                            <div class="content-stadium">Standard</div>
                            <div class="desc-stadium">
                                Increase the fill time to claim less often
                            </div>
                        </div>

                        <div class="stadium-right">
                            10 <img src="./../../public/assets/logo.svg" />
                        </div>
                    </div>
                </div>

                <Loading :loading="loading" />
                <EmptyForm v-if="showEmptyFormEvent" />
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
        showEmptyFormEvent() {
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
    height: 100%;
    position: absolute;
    width: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /* background-color: #0085d2; */
    /* box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); */
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
    padding: 5px 20px 20px;
    height: calc(100% - 25px);
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

.box-content-booster {
    height: calc(100% - 35px);
    color: #fff;
}

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
    color: #ffe500;
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
/* scroll box  */
.box-desc-event {
    background: #67bdef;
    border-radius: 10px;
    max-height: calc(100% - 75px);
    overflow-y: auto;
    animation: fadeInDesc 0.1s ease forwards;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.box-desc-event::-webkit-scrollbar {
    display: none;
}
</style>
