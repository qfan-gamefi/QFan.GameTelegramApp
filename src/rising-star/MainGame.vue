<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import Phaser from "phaser";
import StartGame from "./main";
import { EventBus } from "./EventBus";

const scene = ref();
const game = ref();

const emit = defineEmits(["current-active-scene"]);

onMounted(() => {
    game.value = StartGame("game-container");
    EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
        emit("current-active-scene", scene_instance);
        scene.value = scene_instance;
    });
});

onUnmounted(() => {
    if (game.value) {
        game.value.destroy(true);
        game.value = null;
    }
});

defineExpose({
    scene,
});
</script>

<template>
    <div id="game-container"></div>
</template>
