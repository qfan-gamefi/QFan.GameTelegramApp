<template>
    <transition name="popup-fade">
        <div
            class="fixed inset-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-[9999]"
            v-if="visible"
        >
            <div
                class="bg-white p-5 rounded-lg text-center relative text-black text-[12px] flex flex-col gap-2 w-[250px]"
            >
                <div class="text-[16px] font-extrabold">
                    {{
                        isCreatePass ? "Create password" : "Enter your password"
                    }}
                </div>
                <div>
                    <input
                        type="password"
                        v-model="password"
                        placeholder="Enter password"
                        class="border border-gray-400 p-1 rounded-md f-bangopro w-full"
                        v-if="!isCreatePass"
                    />

                    <div class="flex flex-col gap-3">
                        <input
                            type="password"
                            v-model="newPassword"
                            placeholder="New password"
                            class="border border-gray-400 p-1 rounded-md f-bangopro w-full"
                            v-if="isCreatePass"
                        />
                        <input
                            type="password"
                            v-model="confirmPassword"
                            placeholder="Confirm password"
                            class="border border-gray-400 p-1 rounded-md f-bangopro w-full"
                            v-if="isCreatePass"
                        />
                    </div>
                    <!-- <div
                        v-if="
                            isCreatePass &&
                            newPassword !== confirmPassword &&
                            confirmPassword !== ''
                        "
                        class="text-red-500 text-[10px] font-extrabold"
                    >
                        Passwords do not match!
                    </div> -->

                    <div
                        v-if="showMess"
                        @click="isSuccess && derectBot()"
                        class="font-extrabold"
                        :class="[isSuccess ? 'text-green-500' : 'text-red-500']"
                    >
                        {{ message }}
                    </div>

                    <div
                        class="text-[10px] text-[#ffa53a] font-extrabold flex justify-end"
                    >
                        <div
                            class="w-fit cursor-pointer pt-1"
                            @click="handleCreatePass()"
                        >
                            {{
                                !isCreatePass
                                    ? "Create password"
                                    : "Enter password"
                            }}
                        </div>
                    </div>
                </div>

                <div class="flex gap-2">
                    <button @click="yes()">
                        {{ !isCreatePass ? "Ok" : "Create" }}
                    </button>
                    <button @click="no()">Cancel</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import userServiceInventory from "@/services/inventoryService";
import axios from "axios";

export default {
    name: "PopupPassword",
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

                        if (response?.success) {
                            this.message = response?.data?.message;
                            this.isCreatePass = false;
                            this.isSuccess = true;
                            this.showMess = true;
                        } else {
                            this.showMess = true;
                            this.isSuccess = false;
                            this.message = response?.data?.message;
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
}
</style>
