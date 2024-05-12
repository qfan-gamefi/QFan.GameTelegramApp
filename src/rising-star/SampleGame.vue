<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Phaser from 'phaser';
import StartGame from './main';
import { EventBus } from './EventBus';

// Save the current scene instance
const scene = ref();
const game = ref();

const emit = defineEmits(['current-active-scene']);

onMounted(() => {
    game.value = StartGame('game-container');
});

onUnmounted(() => {

    if (game.value) {
        game.value.destroy(true);
        game.value = null;
    }

});

defineExpose({ scene, game });

</script>
<script lang="ts">
export default {
    data() {
        return {scene: this.scene,game: this.game}
    },
    methods: {
        ChangeSence(sence : String){
            game.value.scene.start(sence);
        }
    },
    };
</script>
<template>
    <div id="game-container"></div>
</template>