<template>
    <div
        class="flex justify-between items-center gap-2 rounded"
        v-if="visible"
        :class="`notification ${type}`"
        :style="{ animationDuration: `${duration / 1000}s` }"
    >
        <div>
            <i class="fa-solid fa-circle-check" v-if="type == 'success'"></i>
            <i
                class="fa-solid fa-circle-exclamation"
                v-else
            ></i>
            
        </div>

        <div>{{ $t(message, { count: count }) }}</div>

        <div @click="closeNotification()">
            <i class="fa-solid fa-xmark"></i>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";

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
        count: {
            type: Number,
            required: false
        }
    },
    setup(props, { emit }) {
        const visible = ref(true);
        let timer = null;

        const startTimer = () => {
            timer = setTimeout(() => {
                closeNotification();
            }, props.duration);
        };

        const closeNotification = () => {
            if (timer) {
                clearTimeout(timer);
            }
            visible.value = false;
            emit("close");
        };

        onMounted(() => {
            startTimer();
        });

        onBeforeUnmount(() => {
            if (timer) {
                clearTimeout(timer);
            }
        });

        return {
            visible,
            closeNotification,
        };
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
    transform: translate(50%, 50%);
    padding: 10px;
    width: 80%;
    font-size: 16px;
    font-weight: bold;
    z-index: 99999;

    animation: fadeNotification ease-in-out forwards;
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
.notification.warning {
    border: 1px solid rgba(241, 142, 6, 0.81);
    box-shadow: 0px 0px 2px #ffb103;
    text-shadow: 2px 1px #00040a;
    background-color: rgb(220 128 1 / 69%);
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
