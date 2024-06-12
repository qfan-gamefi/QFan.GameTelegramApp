<template>
    <div>
        {{ formattedCountdown }}
    </div>
</template>

<script>
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export default {
    // name: "Countdowns",
    props: {
        countDownValue: {
            type: Number,
            required: true,
        },
    },
    data() {
        return {
            intervalId: null,
            timeLeft: this.countDownValue,
        };
    },
    computed: {
        formattedCountdown() {
            const duration = dayjs.duration(this.timeLeft, "seconds");
            const days = duration.days();
            const hours = duration.hours().toString().padStart(2, "0");
            const minutes = duration.minutes().toString().padStart(2, "0");
            const seconds = duration.seconds().toString().padStart(2, "0");

            if (days > 0) {
                return `${days}d ${hours}:${minutes}:${seconds}`;
            }
            return `${hours}:${minutes}:${seconds}`;
        },
    },
    mounted() {
        this.startCountdown();
    },
    beforeUnmount() {
        clearInterval(this.intervalId);
    },
    methods: {
        startCountdown() {
            this.intervalId = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft -= 1;
                } else {
                    clearInterval(this.intervalId);
                }
            }, 1000);
        },
    },
};
</script>

<style scoped></style>
