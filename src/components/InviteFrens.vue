<template>
    <div class="popup-invite" v-if="visible">
        <div class="box-invite">
            <!-- <div @click="$emit('close')" class="close-invite">
                <img src="./../../public/assets/back.svg" />
                Back
            </div> -->
            <div @click="$emit('close')" class="close-home">
                <i class="fa-solid fa-xmark"></i>
            </div>

            <div class="friend-info">
                <div class="friend-info-text">
                    {{ referalList1?.length }} Friends
                </div>
                <div class="friend-info-number t-primary-color">
                    ~{{ perHour }}
                    <img src="./../../public/assets/logo.svg" /> per hour
                </div>
                <div class="friend-info-desc">
                    <div>Score 10% from buddies +2.5% from their fererrals</div>
                    <div class="friend-info-desc-img">
                        Get a <img src="./../../public/assets/logo.svg" />
                        play pass for each fren
                    </div>
                </div>
            </div>

            <div class="box-content">
                <div class="box-title-friend text-outline-black">
                    Friends list
                </div>

                <Loading :loading="loading" />

                <div class="box-desc" v-if="!loading">
                    <div
                        class="desc-item"
                        v-for="(el, index) in inviteData"
                        :key="index"
                    >
                        <div class="item-left">
                            <div class="item-img">
                                <img src="./../../public/assets/logo.jpg" />
                            </div>
                            <div>{{ el?.firstName }} {{ el?.lastName }}</div>
                        </div>
                        <div class="item-right">
                            {{ el?.qpoint?.balance }}
                            <img src="./../../public/assets/logo.svg" />
                        </div>
                    </div>
                </div>

                <EmptyForm v-if="showEmptyForm && !loading" />
            </div>
        </div>

        <div class="box-btn-invite">
            <button @click="handleInvite" class="invite-btn">
                Invite Friend
            </button>
        </div>
    </div>
</template>

<script>
import userService from "./../services/userService";
import Loading from "./LoadingForm.vue";
import EmptyForm from "./EmptyForm.vue";

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
        rewardAmount: {
            type: String,
            default: "",
        },
    },
    components: {
        Loading,
        EmptyForm,
    },
    data() {
        return {
            loading: true,
            inviteData: [],
            referalList2: [],
            referalList1: [],
            perHour: 0,
        };
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                this.fetchInviteData();
                this.getConfiguration();
            }
        },
    },
    methods: {
        handleInvite() {
            this.$emit("invite");
        },
        async fetchInviteData() {
            try {
                this.loading = true;
                const response = await userService.getListInvite(this?.idUser);

                const list1 = response?.data?.referalList;
                const list2 = response?.data?.referalList2;

                this.referalList2 = list2;
                this.referalList1 = list1;

                if (Array.isArray(list1) && Array.isArray(list2)) {
                    this.inviteData = [...list1, ...list2];
                } else if (Array.isArray(list1)) {
                    this.inviteData = [...list1];
                } else if (Array.isArray(list2)) {
                    this.inviteData = [...list2];
                } else {
                    this.inviteData = [];
                }

                const sortData = this.inviteData.sort(
                    (a, b) => b?.qpoint?.balance - a?.qpoint?.balance
                );

                this.inviteData = sortData;
            } catch (error) {
                this.inviteData = [];
            } finally {
                setTimeout(() => {
                    this.loading = false;
                }, 300);
            }
        },
        // async mounted() {
        //     await this.fetchInviteData();
        // },
        async getConfiguration() {
            try {
                const response = await userService.getConfiguration();

                const dataLV1 =
                    response?.data?.attributes?.referalRewardLv1Percent;
                const dataLV2 =
                    response?.data?.attributes?.referalRewardLv2Percent;

                const lv1 = (Number(this.rewardAmount) * dataLV1) / 100;
                const lv2 = (Number(this.rewardAmount) * dataLV2) / 100;

                if (this.referalList2?.length > 0) {
                    this.perHour = lv1 + lv2;
                } else {
                    this.perHour = lv1;
                }
            } catch (error) {
                console.log(error);
            }
        },
    },
    computed: {
        showEmptyForm() {
            return this.inviteData.length === 0;
        },
    },
};
</script>

<style>
.box-title-friend {
    margin: 10px 0;
}
.popup-invite {
    height: calc(100% - 57px);
    position: absolute;
    width: 100%;
    top: 0%;
    z-index: 999;
    animation: fadeInInvite 0.1s ease forwards;

    background-image: url("./../../public/assets/event/background-event.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}
@keyframes fadeInInvite {
    0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.box-invite {
    padding: 20px;
    height: calc(100% - 40px);
}

.box-content {
    height: calc(100% - 200px);
    color: #fff;
}

.box-desc {
    max-height: 100%;
    overflow-y: auto;
    animation: fadeInDesc 0.1s ease forwards;
    scrollbar-width: none;
    -ms-overflow-style: none;

    display: flex;
    flex-direction: column;
    gap: 10px;
}
.box-desc::-webkit-scrollbar {
    display: none;
}

.desc-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    font-size: 12px;
    font-family: monospace;
    background-color: #00256c;
    border-radius: 10px;
}

.item-left {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: bolder;
}
.item-left .item-img {
    display: flex;
    width: 30px;
    height: 30px;
}
.item-left img {
    width: 30px;
    border-radius: 5px;
}

.item-right {
    display: flex;
    align-items: center;
}
.item-right img {
    width: 15px;
    margin-left: 5px;
}
.close-invite {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 13px;
    border-bottom: 1px solid #fff;
    padding-bottom: 10px;
    margin: 0 -20px;
}
.close-invite img {
    margin-left: 20px;
}

.box-btn-invite {
    position: absolute;
    bottom: 5%;
    width: calc(100% - 40px);
    padding: 0 20px;
}
.invite-btn {
    border-radius: 10px;
}

.friend-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: monospace;
    background-color: #00256c;
    border-radius: 10px;
    padding: 10px 20px;
    gap: 10px;
    color: #fff;
}
.friend-info-text {
    font-size: 16px;
    font-weight: bold;
}
.friend-info-number {
    display: flex;
    align-items: center;
}
.friend-info-number img {
    width: 20px;
    margin: 0 5px;
}
.friend-info-desc {
    font-size: 10px;
    text-align: center;
}
.friend-info-desc img {
    width: 15px;
}
.friend-info-desc-img {
    display: flex;
    align-items: center;
    justify-content: center;
}
.friend-info-desc-img img {
    margin: 0 3px;
}
</style>
