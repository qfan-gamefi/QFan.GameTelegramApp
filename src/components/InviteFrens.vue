<template>
    <transition name="popup">
        <div class="popup-invite" v-if="visible">
            <Loading :loading="loading" />

            <div class="box-invite">
                <div
                    class="flex flex-col items-center justify-center bg-[#00256c] rounded-lg p-[10px] gap-[10px]"
                    v-if="!loading"
                >
                    <div class="f-bangopro">
                        {{ inviteData?.length }} Friends
                    </div>
                    <div class="flex items-center gap-1 t-primary-color">
                        ~{{ perHour }}
                        <img
                            src="./../../public/assets/logo.svg"
                            loading="lazy"
                            class="w-[20px]"
                        />
                        per hour
                    </div>
                    <div class="text-center text-[10px]">
                        <div>
                            Score +{{ referalRewardLv1Percent }}% from buddies
                            and +{{ referalRewardLv2Percent }}% from their
                            fererrals
                        </div>
                        <div class="flex items-center justify-center gap-1">
                            Get a
                            <img
                                class="w-[15px]"
                                src="./../../public/assets/logo.svg"
                                loading="lazy"
                            />
                            play pass for each fren
                        </div>
                    </div>
                </div>

                <div class="box-content" v-if="!loading">
                    <div class="mt-[10px] mb-1 text-outline-black">
                        Friends list
                    </div>

                    <div class="box-desc" v-if="!loading">
                        <div
                            class="desc-item"
                            v-for="(el, index) in inviteData"
                            :key="index"
                        >
                            <div
                                class="flex items-center gap-[10px] font-extrabold"
                            >
                                <div class="flex w-[30px]">
                                    <img
                                        src="./../../public/assets/logo.jpg"
                                        class="rounded-md"
                                        loading="lazy"
                                    />
                                </div>
                                <div>
                                    <p>
                                        {{ el?.firstName }} {{ el?.lastName }}
                                    </p>
                                    <p
                                        v-if="el?.children?.length > 0"
                                        class="flex items-center gap-1"
                                    >
                                        <img
                                            class="icon-svg"
                                            src="./../../public/assets/user.svg"
                                            loading="lazy"
                                        />
                                        <span>+{{ el?.children?.length }}</span>
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-1 f-bangopro">
                                {{ formattedBalance(el?.qpoint?.balance) }}
                                <img
                                    class="w-[15px]"
                                    src="./../../public/assets/logo.svg"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>

                    <EmptyForm v-if="showEmptyForm && !loading" />
                </div>
            </div>

            <div class="box-btn-invite">
                <div class="flex gap-2">
                    <button @click="handleInvite()" class="rounded-lg flex-3">
                        Invite Friend
                    </button>

                    <button @click="handleCopy()" class="rounded-lg flex-1">
                        <i class="fa-solid fa-copy"></i>
                    </button>
                </div>
            </div>

            <NotificationToast
                v-if="notification.isShow"
                :message="notification.mess"
                :type="notification.type"
                @close="closeNoti()"
            />
        </div>
    </transition>
</template>

<script>
import userService from "./../services/userService";
import Loading from "./LoadingForm.vue";
import EmptyForm from "./EmptyForm.vue";
import NotificationToast from "./NotificationToast.vue";
import { formattedBalance, trackEventBtn } from "@/utils";

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
        telegram_bot_link: {
            type: String,
            required: true,
        },
    },
    components: {
        Loading,
        EmptyForm,
        NotificationToast,
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

            notification: {
                isShow: false,
                mess: "",
                type: "",
            },
        };
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                this.fetchInviteData();
                this.getConfiguration();

                this.notification = {
                    isShow: false,
                };
            }
        },
    },
    methods: {
        formattedBalance,
        handleCopy(){
            this.notification = {
                isShow: true,
                type: "success",
                mess: "Copied to clipboard!",
            };

            const input = document.createElement("input");
            input.style.position = "fixed";
            input.style.opacity = "0";
            input.value = this.telegram_bot_link;
            document.body.appendChild(input);
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);

            trackEventBtn({
                label: "Invite ",
            });
        },
        handleInvite() {
            trackEventBtn({
                label: "Invite ",
            });

            const dataUserTele =
                window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            const linkInvite = `https://t.me/QFanClubBot?start=r_${dataUserTele}`;
            const textInvite = `Play to Airdrop $QUAI from Quai Network on QFAN. Don’t miss this opportunity as quantities are limited!`;
            Telegram.WebApp.openTelegramLink(
                `https://t.me/share/url?url=${linkInvite}&text=${textInvite}`
            );
        },
        handleInvite() {
            const dataUserTele =
                window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
            const linkInvite = `https://t.me/QFanClubBot?start=r_${dataUserTele}`;
            const textInvite = `Play to Airdrop $QUAI from Quai Network on QFAN. Don’t miss this opportunity as quantities are limited!`;
            Telegram.WebApp.openTelegramLink(
                `https://t.me/share/url?url=${linkInvite}&text=${textInvite}`
            );
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
        closeNoti() {
            this.notification = {
                isShow: false,
            };
        },
    },
    computed: {
        showEmptyForm() {
            return this.inviteData.length === 0;
        },
    },
};
</script>

<style scoped>
@import "@/styles/global.scss";
@import "@/styles/animation/popup.scss";

.popup-invite {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0%;
    z-index: 999;
    background-image: url("./../../public/assets/event/background-event.png");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    color: #fff;
}

.box-invite {
    padding: 20px;
    height: calc(100% - 125px);
}

.box-content {
    height: calc(100% - 140px);
}

.box-desc {
    max-height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.desc-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    font-size: 12px;
    background-color: #00256c;
    border-radius: 10px;
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
    width: 100%;
    padding: 0 20px;
}
</style>
