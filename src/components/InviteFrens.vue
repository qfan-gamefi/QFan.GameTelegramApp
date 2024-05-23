<template>
    <div class="popup-invite" v-if="visible">
        <div class="box-invite">
            <div @click="$emit('close')" class="close-invite">
                <img src="./../../public/assets/back.svg" />
                Back
            </div>

            <div class="box-content">
                <div class="box-title">Referrals</div>

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
                            <img src="./../../public/assets/logo.jpg" />
                        </div>
                    </div>
                </div>

                <EmptyForm v-if="showEmptyForm && !loading" />
            </div>
        </div>

        <div class="box-btn-invite">
            <button @click="handleInvite" class="invite-btn">
                Invite Frens
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
    },
    components: {
        Loading,
        EmptyForm,
    },
    data() {
        return {
            loading: true,
            inviteData: [
                // {
                //     firstName: "1111",
                //     lastName: "lastName",
                //     qpoint: {
                //         balance: 100,
                //     },
                // },
                // {
                //     firstName: "1111",
                //     lastName: "lastName",
                //     qpoint: {
                //         balance: 800,
                //     },
                // },
            ],
        };
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                this.fetchInviteData();
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

                if (Array.isArray(list1) && Array.isArray(list2)) {
                    //    const data = [...list1, ...list2];
                    this.inviteData = [...list1, ...list2];
                } else if (Array.isArray(list1)) {
                    this.inviteData = [...list1];
                } else if (Array.isArray(list2)) {
                    this.inviteData = [...list2];
                } else {
                    this.inviteData = [];
                }
            } catch (error) {
                this.inviteData = [];
                console.error("Error fetching API data:", error);
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
    margin-left: 3px;
    border-radius: 3px;
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
</style>
