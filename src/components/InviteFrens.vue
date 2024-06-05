<template>
    <div class="popup-invite" v-if="visible">
        <div class="box-invite">
            <!-- <div @click="$emit('close')" class="close-home">
                <i class="fa-solid fa-rectangle-xmark"></i>
            </div> -->

            <div class="friend-info">
                <div class="friend-info-text">
                    {{ inviteData?.length }} Friends
                </div>
                <div class="friend-info-number t-primary-color">
                    ~{{ perHour }}
                    <img src="./../../public/assets/logo.svg" /> per hour
                </div>
                <div class="friend-info-desc">
                    <div>
                        Score +{{ referalRewardLv1Percent }}% from buddies and
                        +{{ referalRewardLv2Percent }}% from their fererrals
                    </div>
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
                            <div>
                                <p class="friend-name">
                                    {{ el?.firstName }} {{ el?.lastName }}
                                </p>
                                <p
                                    v-if="el?.children?.length > 0"
                                    class="friend-user-info"
                                >
                                    <img
                                        class="icon-svg"
                                        src="./../../public/assets/user.svg"
                                    />
                                    <span class="child-text"
                                        >+{{ el?.children?.length }}</span
                                    >
                                </p>
                            </div>
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
            referalRewardLv1Percent: 10,
            referalRewardLv2Percent: 5,
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
                const referalList1 = response?.data?.referalList;
                const referalList2 = response?.data?.referalList2;

                if (Array.isArray(referalList1))
                    this.inviteData = [...referalList1];

                const sortedInviteData = this.inviteData.sort(
                    (a, b) => b?.qpoint?.balance - a?.qpoint?.balance
                );

                // //add list 2 to children of level 1 by refererCode
                this.inviteData = sortedInviteData.map((el) => {
                    if (el?.refererCode) {
                        const children = referalList2.filter(
                            (item) => item?.refererCode === el?.playerId
                        );
                        if (children.length > 0) el.children = children;
                        else el.children = [];
                    }
                    return el;
                });
            } catch (error) {
                this.inviteData = [];
            } finally {
                this.loading = false;
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
                this.referalRewardLv1Percent = dataLV1;
                this.referalRewardLv2Percent = dataLV2;

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
    height: 100%;
    /* height: calc(100% - 56px); */
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
    height: calc(100% - 110px);
}

.box-content {
    height: calc(100% - 215px);
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
    bottom: 90px;
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
.friend-user-info {
    display: flex;
    align-items: center;
    gap: 5px;
}
.friend-user-info {
    margin: 0;
}
.friend-user-info span.child-text {
    font-size: 14px;
    font-weight: normal;
}
.friend-name {
    font-size: 14px;
    margin: 5px 0;
}
</style>
