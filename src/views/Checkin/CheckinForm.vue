<template>
    <div v-bind:class="{ 'overlay-template': isCheckin }"></div>

    <div class="popup-checkin" v-if="isCheckin">
        <div @click="$emit('closeCheckin')" class="close-to-home">
            <i class="fa-solid fa-rectangle-xmark"></i>
        </div>

        <div class="wr">
            <div class="box-title">
                <div class="title">Checkin</div>
                <div class="desc">Total checkin 1</div>
            </div>

            <div class="box-days">
                <div class="box-item" v-for="(day, index) in days" :key="index">
                    <div class="day-item">
                        <div class="item-title">
                            <div>
                                <img src="@public/assets/logo.svg" />
                            </div>

                            <div class="plus-point">
                                <i class="fa-solid fa-plus"></i>{{ day * 100 }}
                            </div>
                        </div>

                        <div class="item-text">DAY {{ day }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "CheckinForm",
    props: {
        isCheckin: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            days: [1, 2, 3, 4, 5, 6, 7],
        };
    },
});
</script>

<style scoped lang="scss">
.overlay-template {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
}
.popup-checkin {
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

.wr {
    padding: 20px 20px 100px;
    color: #fff;
    font-family: monospace;
}
.box-title {
    text-align: center;
    margin-bottom: 20px;

    font-weight: bold;
    .title {
        font-size: 24px;
        margin-bottom: 10px;
    }
    .desc {
        font-size: 13px;
    }
}

.box-days {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    .box-item {
        flex: 1 0 calc(25% - 10px);
        display: flex;
        justify-content: center;
    }
    .day-item {
        width: auto;
        background-color: #ffff73;
        padding: 15px 15px 0;
        border-radius: 10px;
        font-family: "GAMERIA";
        .item-title {
            display: flex;
            flex-direction: column;
            gap: 5px;
            margin-bottom: 10px;
            align-items: center;
            img {
                width: 45px;
                height: 45px;
            }
            .plus-point {
                color: #c31500;
            }
        }
        .item-text {
            background-color: #ffa53a;
            margin: 0 -15px;
            padding: 10px 15px;
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
            text-align: center;
            color: #00175f;
        }
    }
}
.close-to-home {
    position: absolute;
    top: 3%;
    right: 3%;
    color: red;
}
</style>
