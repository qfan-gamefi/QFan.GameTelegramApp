<template>
    <transition name="popup-fade">
        <div
            class="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[9999]"
            v-if="visible"
        >
            <div
                class="bg-[#00175F] rounded-lg text-center relative text-white text-[12px] flex flex-col w-[250px] border border-[#89a2ef]"
            >
                <div class="title">
                    <div class="text-[16px] font-extrabold">
                        {{
                            isCreatePass ? "Create password" : "Enter your password"
                        }}
                    </div>
                    <div @click="no()" class="close-popup">
                        <i
                            class="fa-solid fa-rectangle-xmark"
                            style="color: #ff0000"
                        ></i>
                    </div>
                </div>
                

                <div class="p-[10px]">
                    <!-- <input
                        type="password"
                        v-model="password"
                        placeholder="Enter password"
                        class="border border-gray-100 p-1 rounded-md f-bangopro w-full"
                        v-if="!isCreatePass"
                    /> -->
                    <InputField
                        v-model="password"
                        type="password"
                        placeholder="Enter password"
                        label=""
                        v-if="!isCreatePass"
                    />

                    <div class="flex flex-col gap-3" v-if="isCreatePass">
                        <InputField
                            v-model="newPassword"
                            type="password"
                            placeholder="New password"
                            label=""
                        />
                        <InputField
                            v-model="confirmPassword"
                            type="password"
                            placeholder="Confirm password"
                            label=""
                        />
                        <!-- <input
                            type="password"
                            v-model="newPassword"
                            placeholder="New password"
                            class="border border-gray-100 p-1 rounded-md f-bangopro w-full"
                            v-if="isCreatePass"
                        />
                        <input
                            type="password"
                            v-model="confirmPassword"
                            placeholder="Confirm password"
                            class="border border-gray-100 p-1 rounded-md f-bangopro w-full"
                            v-if="isCreatePass"
                        /> -->
                    </div>

                    <div
                        v-if="showMess"
                        @click="isSuccess && derectBot()"
                        class="font-extrabold"
                        :class="[isSuccess ? 'text-green-500' : 'text-red-500']"
                    >
                        {{ message }}
                    </div>
                </div>

                <div class="flex flex-col gap-2 p-[10px]">
                    <button @click="yes()">
                        {{ !isCreatePass ? "OK" : "Create" }}
                    </button>
                    <button @click="handleCreatePass()">
                        {{
                            !isCreatePass
                                ? "Create password"
                                : "Enter password"
                        }}
                    </button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import userServiceInventory from "@/services/inventoryService";
import InputField from "@/components/Input/InputField.vue";

export default {
    name: "PopupPassword",
    components: {
        InputField,
    },
    props: {
        visible: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    watch: {
        password(newValue) {
            this.message = "";
        },
        visible(newValue) {
            if (newValue === true) {
                this.password = "";
                this.message = "";
                this.newPassword = "";
                this.confirmPassword = "";
                this.isCreatePass = false;
                this.isSuccess = false;
                this.showMess = false;
            }
        },
    },
    data() {
        const userInfo = window.Telegram.WebApp.initDataUnsafe;

        return {
            userId: userInfo?.user?.id || "",
            password: "",
            newPassword: "",
            confirmPassword: "",
            isCreatePass: false,
            message: "",
            isSuccess: false,
            showMess: false,
        };
    },
    methods: {
        logPassword() {
        console.log(this.password);
    },
        validateForm() {
            this.showMess = true;
            this.isSuccess = false;
            if (!this.password && !this.newPassword && !this.confirmPassword) {
                this.message = "Password is not empty!";
                return false;
            }
            if (this.newPassword !== this.confirmPassword) {
                this.message = "Passwords do not match!";
                return false;
            }
            this.showMess = false;
            this.isSuccess = true;
            this.message = "";
            return true;
        },
        async yes() {
            const isValid = this.validateForm();

            if (isValid) {
                try {
                    if (this.isCreatePass) {
                        const dataCreate = {
                            UserId: this.userId,
                            Password: this.confirmPassword,
                        };
                        const response =
                            await userServiceInventory.createCredentials(
                                dataCreate
                            );

                        console.log(response)
                        if (response?.success) {
                            this.message = response?.data?.message;
                            this.isCreatePass = false;
                            this.isSuccess = true;
                            this.showMess = true;
                        } else {
                            this.showMess = true;
                            this.isSuccess = false;
                            this.message = response?.data?.message || response?.data;
                        }
                    } else {
                        const dataVerify = {
                            UserId: this.userId,
                            Password: this.password,
                        };
                        const response =
                            await userServiceInventory.verifyCredentials(
                                dataVerify
                            );
                        if (response?.success) {
                            const jsonString = JSON.stringify(dataVerify);
                            const buf = Buffer.from(jsonString, "utf-8");
                            const passBase64 = buf.toString("base64");

                            localStorage.setItem("passVerify", passBase64);
                            // localStorage.setItem("storePermission", "false");

                            this.message = response?.data?.message;
                            this.isSuccess = true;
                            this.showMess = true;

                            setTimeout(() => {
                                this.$emit("cancel");
                            }, 2000);
                        } else {
                            this.isSuccess = false;
                            this.showMess = true;
                            this.message = response?.data?.message;
                        }
                    }
                } catch (error) {
                    console.error("Error:", error);
                }
            }

            // this.$emit("yes");
        },
        no() {
            this.$emit("cancel");
        },
        handleCreatePass() {
            this.password = "";
            this.message = "";
            this.newPassword = "";
            this.confirmPassword = "";
            this.isCreatePass = !this.isCreatePass;
            this.showMess = false;
        },
        derectBot() {
            window.Telegram.WebApp.openTelegramLink("https://t.me/QFanClubBot");
        },
    },
};
</script>

<style scoped>
@import "@/styles/global.scss";
@import "@/styles/animation/popup.scss";

button {
    padding: 10px 20px;
    font-size: 12px;
    border-radius: 5px;
    color: #fff;
}

.close-popup {
    position: absolute;
    top: 3%;
    right: 3%;
}
.close-popup svg {
    font-size: 18px;
}

.title {
    /* border-bottom: 1px solid #89a2ef; */
    padding: 10px 0;
    margin: 0 10px;
    font-size: 16px;
    font-weight: 800;
}
</style>
