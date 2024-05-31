<template>
    <div v-if="visible" :class="`notification ${type}`">
        <span>{{ message }}</span>
        <!-- <div @click="closeNotification">X</div> -->
    </div>
</template>

<script>
export default {
    props: {
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            default: 2000,
        },
    },
    data() {
        return {
            visible: true,
        };
    },
    mounted() {
        this.startTimer();
    },
    methods: {
        startTimer() {
            setTimeout(() => {
                this.visible = false;
            }, this.duration);
        },
        closeNotification() {
            this.visible = false;
        },
    },
};
</script>

<style scoped>
.notification {
    position: fixed;
    top: 10%;
    right: 0;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: calc(100% - 40px);
    padding: 10px 20px;
    font-size: 12px;
    font-family: monospace;
}
.notification.success {
    background-color: #4caf50;
}
.notification.error {
    background-color: #f44336;
}
.notification button {
    background: none;
    border: none;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    margin-left: 10px;
}
</style>
