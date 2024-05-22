<template>
    <div class="popup-invite" v-if="isPageView">
        <div class="box-invite">
            <div @click="$emit('close')" class="close-btn">
                <!-- <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                >
                    <path
                        fill="#ffffff"
                        d="M16 5v2h-2V5zm-4 4V7h2v2zm-2 2V9h2v2zm0 2H8v-2h2zm2 2v-2h-2v2zm0 0h2v2h-2zm4 4v-2h-2v2z"
                    />
                </svg> -->
                <img src="./../../public/assets/back.svg" />
                Back
            </div>

            <div class="box-content">
                <div class="box-title">Event</div>
                <Loading :loading="loading" />

                <div class="box-desc" v-if="!loading">
                    <div
                        class="desc-item"
                        v-for="(el, index) in inviteData"
                        :key="index"
                    ></div>
                </div>

                <EmptyForm v-if="showEmptyForm && !loading" />
            </div>
        </div>
    </div>
</template>

<script>
import userService from "./../services/userService";
import Loading from "./LoadingForm.vue";
import EmptyForm from "./EmptyForm.vue";

export default {
    props: {
        isPageView: {
            type: Boolean,
            default: false,
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
        };
    },
    watch: {
        isPageView(newVal) {
            if (newVal) {
                this.fetchInviteData();
            }
        },
    },
    methods: {
        async fetchInviteData() {
            try {
                this.loading = true;
                const response = await userService.getListInvite(this?.idUser);
            } catch (error) {
                this.inviteData = [];
            } finally {
                setTimeout(() => {
                    this.loading = false;
                }, 300);
            }
        },
        async mounted() {
            await this.fetchInviteData();
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
.popup-invite {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #0085d2;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    z-index: 999;
    animation: fadeIn 0.1s ease forwards;
}

.box-invite {
    padding: 20px;
}

.box-content .box-title {
    margin: 10px 0;
}

.box-title {
    text-shadow: 1px 1px 0 #9f8900, -1px -1px 0 #9f8900, 1px -1px 0 #9f8900,
        -1px 1px 0 #9f8900, 1px 0 0 #9f8900, -1px 0 0 #9f8900, 0 1px 0 #9f8900,
        0 -1px 0 #9f8900;
}

.box-desc {
    background: #67bdef;
    border-radius: 10px;
    max-height: 66vh;
    overflow-y: auto;
}

.desc-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    font-size: 12px;
    font-family: monospace;
    border-bottom: 1px solid #ccc;
}
.desc-item:last-child {
    border-bottom: none;
}

.close-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 13px;
    border-bottom: 1px solid #fff;
    padding-bottom: 10px;
    margin: 0 -20px;
}
.close-btn svg {
    margin-left: 20px;
}
</style>
