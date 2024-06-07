<template>
    <div v-if="visible" :class="`notification ${type}`">
        <span>
            <i class="fa-solid fa-circle-check" v-if="type === 'success'"></i>
            <i
                class="fa-solid fa-circle-exclamation"
                v-if="type === 'error'"
            ></i>
            {{ message }}
        </span>
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
    right: 50%;
    color: #fff;
    display: flex;
    font-size: 16px;
    font-family: monospace;
    transform: translate(50%, 50%);
    padding: 10px;
    width: 80%;
    justify-content: center;
    font-size: 16px;
    font-weight: bold;

    animation: fadeNotification 2s ease-in-out forwards;
}
.notification.success {
    background-color: rgb(7 149 66 / 69%);
    /* background-color: #4caf50; */
    border: 1px solid rgba(36, 241, 6, 0.46);
    box-shadow: 0px 0px 2px #259c08;
    text-shadow: 2px 1px #00040a;
}
.notification.error {
    /* background-color: #f44336; */
    border: 1px solid rgba(241, 6, 6, 0.81);
    box-shadow: 0px 0px 2px #ff0303;
    text-shadow: 2px 1px #00040a;
    background-color: rgb(220 17 1 / 69%);
}
.notification button {
    background: none;
    border: none;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    margin-left: 10px;
}

@keyframes fadeNotification {
    0% {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.9);
    }
    10% {
        opacity: 1;
        transform: translate(50%, 50%) scale(1);
    }
    90% {
        opacity: 1;
        transform: translate(50%, 50%) scale(1);
    }
    100% {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.9);
    }
}
</style>
