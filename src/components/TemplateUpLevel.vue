<template>
    <div v-bind:class="{ 'overlay-template': showPopup }"></div>

    <div class="popup-template" v-if="showPopup">
        <div class="box-template">
            <div @click="$emit('close')" class="close-to-booster">
                <i class="fa-solid fa-rectangle-xmark"></i>
            </div>

            <Loading :loading="loading" />

            <div class="container-level">
                <div class="box-title-level">
                    <div class="title-level">{{ titleUpload }}</div>
                    <div class="desc-level">{{ descUpload }}</div>
                </div>

                <div class="box-lv" v-if="!isMax">
                    <div>
                        <!-- <img
                            src="./../../public/assets/booster/logo-stadium1.svg"
                        /> -->
                        <img
                            :src="`https://qfan-api.qcloud.asia${dataNext?.attributes?.image?.data?.attributes?.url}`"
                        />
                    </div>
                    <div class="r-lv">
                        <div class="level-lv t-primary-color">
                            Level {{ dataNext?.attributes?.applyLevel }}
                        </div>
                        <div class="title-lv">
                            {{ dataNext?.attributes?.name }}
                        </div>
                        <div class="content-lv" v-if="typeBooster === 'SPEED'">
                            Claim every
                            {{ dataNext?.attributes?.applyQtty }} hour
                        </div>
                        <div class="content-lv" v-if="typeBooster === 'AMOUNT'">
                            Speed {{ dataNext?.attributes?.applyQtty }}
                            <img src="./../../public/assets/logo.svg" /> per
                            hour
                        </div>
                    </div>
                </div>

                <div class="text-full-lv" v-if="isMax">
                    Your level is maximum level. You can not upgrade anymore
                </div>

                <div class="icon-up-lv">
                    <i class="fa-solid fa-angles-up"></i>
                </div>

                <div class="box-lv">
                    <div>
                        <!-- <img
                            src="./../../public/assets/booster/logo-stadium1.svg"
                        /> -->
                        <img
                            :src="`https://qfan-api.qcloud.asia${items?.attributes?.image?.data?.attributes?.url}`"
                        />
                    </div>
                    <div class="r-lv">
                        <div class="level-lv t-primary-color">
                            Level
                            {{ items?.attributes?.applyLevel }}
                        </div>
                        <div class="title-lv">
                            {{ items?.attributes?.name }}
                        </div>
                        <div class="content-lv" v-if="typeBooster === 'SPEED'">
                            Claim every
                            {{ items?.attributes?.applyQtty }} hour
                        </div>
                        <div class="content-lv" v-if="typeBooster === 'AMOUNT'">
                            Speed {{ items?.attributes?.applyQtty }}
                            <img src="./../../public/assets/logo.svg" /> per
                            hour
                        </div>
                    </div>
                </div>

                <div
                    class="box-point-up t-primary-color"
                    :class="{ 'disabled-button': isMax }"
                >
                    {{ dataNext?.attributes?.price }}
                    <img src="./../../public/assets/logo.svg" />
                </div>

                <div>
                    <button
                        @click="handleUplevel"
                        :disabled="isMax"
                        :class="{ 'disabled-button': isMax }"
                    >
                        UPGRADE
                    </button>
                </div>
            </div>

            <EmptyForm v-if="showEmptyFormEvent" />
        </div>

        <Notification
            v-if="showNotification"
            :message="notificationMessage"
            :type="notificationType"
            @close="showNotification = false"
        />
    </div>
</template>

<script>
import userService from "../services/userService";
import Notification from "./NotificationToast.vue";
import EmptyForm from "./EmptyForm.vue";
import Loading from "./LoadingForm.vue";

export default {
    components: {
        Notification,
        EmptyForm,
        Loading,
    },
    props: {
        showPopup: {
            type: Boolean,
            default: false,
        },
        isMax: {
            type: Boolean,
            default: false,
        },
        items: {
            type: Object,
            required: true,
        },
        dataNext: {
            type: Object,
            required: true,
        },
        idUser: {
            type: String,
            default: "",
        },
        typeBooster: {
            type: String,
            default: "AMOUNT",
        },
        titleUpload: {
            type: String,
            default: "",
        },
        descUpload: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            loading: false,
            data: null,
            dataFrom: null,
            dataTo: null,

            showNotification: false,
            notificationMessage: "",
            notificationType: "",
        };
    },
    computed: {
        showEmptyForm() {
            return this.data?.length == 0;
        },
    },
    methods: {
        async handleUplevel() {
            try {
                this.loading = true;
                await userService.postUplevel(this.idUser, this.typeBooster);
                this.showSuccessNotification();
                this.$emit("close");
            } catch (error) {
                this.showErrorNotification(
                    error?.response?.data?.error?.message
                );
                this.loading = false;
            } finally {
                this.loading = false;
            }
        },
        showSuccessNotification() {
            const nameUp =
                this.typeBooster === "SPEED" ? `Stadium` : `Training Room`;
            this.notificationMessage = `Upgrade is yours! ${nameUp} ${this.dataNext?.attributes?.applyLevel}`;
            this.notificationType = "success";
            this.showNotification = true;
        },
        showErrorNotification(errorMessage) {
            this.notificationMessage = errorMessage || "An error occurred!";
            this.notificationType = "error";
            this.showNotification = true;
        },
    },
};
</script>

<style>
.overlay-template {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}
.popup-template {
    height: auto;
    position: absolute;
    width: 100%;
    bottom: 0%;
    z-index: 999;
    animation: fadeInTemplate 0.1s ease forwards;
    background-color: #00175f;
    border-top-right-radius: 20px;
    border-top-left-radius: 20px;
}

@keyframes fadeInTemplate {
    0% {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.5);
    }

    100% {
        opacity: 1;
        transform: translate(0%, 0%) scale(1);
    }
}

.box-template {
    padding: 20px 20px 100px;
    height: calc(100% - 40px);
    color: #fff;
    font-family: monospace;
}

.close-to-home {
    position: absolute;
    top: 1%;
    right: 1%;
}

.box-title-level {
    text-align: center;
    padding: 0 20px 20px;
}
.title-level {
    font-size: 16px;
    font-weight: bold;
    text-transform: uppercase;
}
.desc-level {
    font-size: 10px;
    padding: 0 30px;
}
.box-lv {
    display: flex;
    gap: 30px;
    padding: 15px 30px;
    background-color: #00256c;
    border-radius: 10px;
    border: 1px solid #89a2ef;
    align-items: center;
}
.box-lv img {
    width: 60px;
}
.level-lv {
    font-size: 14px;
    font-weight: bold;
}
.title-lv {
    font-size: 15px;
    font-weight: bold;
}
.content-lv {
    font-size: 12px;
    display: flex;
    align-items: center;
}
.content-lv img {
    width: 20px;
    height: 20px;
    margin: 0 5px;
}
.icon-up-lv {
    text-align: center;
    padding: 10px;
}
.box-point-up {
    display: flex;
    align-items: center;
    font-weight: bold;
    font-size: 18px;
    justify-content: center;
    padding: 10px;
}
.box-point-up img {
    width: 20px;
    margin-left: 5px;
}

button {
    border-radius: 10px;
}
.close-to-booster {
    position: absolute;
    top: 3%;
    right: 3%;
    color: red;
}
.close-to-booster svg {
    font-size: 20px;
}

.text-full-lv {
    text-align: center;
    border: 1px solid #89a2ef;
    padding: 15px;
    background-color: #00256c;
    border-radius: 10px;
}
.disabled-button {
    opacity: 0.5;
    cursor: not-allowed;
    filter: blur(1px);
}
</style>
