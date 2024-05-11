<script setup lang="ts">
import Phaser from 'phaser';
import { ref, toRaw } from 'vue';
import type { MainMenu } from './game/scenes/MainMenu';
import PhaserGame from './game/PhaserGame.vue';
import SampleGame from './rising-star/SampleGame.vue';

// // The sprite can only be moved in the MainMenu Scene
// const canMoveSprite = ref();

// //  References to the PhaserGame component (game and scene are exposed)
// const phaserRef = ref();
// const spritePosition = ref({ x: 0, y: 0 });

// const changeScene = () => {

//     const scene = toRaw(phaserRef.value.scene) as MainMenu;

//     if (scene) {
//         //  Call the changeScene method defined in the `MainMenu`, `Game` and `GameOver` Scenes
//         scene.changeScene();
//     }

// }

// const moveSprite = () => {

//     if (phaserRef.value !== undefined) {

//         const scene = toRaw(phaserRef.value.scene) as MainMenu;

//         if (scene) {
//             // Get the update logo position
//             (scene as MainMenu).moveLogo(({ x, y }) => {

//                 spritePosition.value = { x, y };

//             });
//         }
//     }

// }

// const addSprite = () => {

//     const scene = toRaw(phaserRef.value.scene) as Phaser.Scene;

//     if (scene) {
//         // Add a new sprite to the current scene at a random position
//         const x = Phaser.Math.Between(64, scene.scale.width - 64);
//         const y = Phaser.Math.Between(64, scene.scale.height - 64);

//         // `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
//         const star = scene.add.sprite(x, y, 'star');

//         //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
//         //  You could, of course, do this from within the Phaser Scene code, but this is just an example
//         //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
//         scene.add.tween({
//             targets: star,
//             duration: 500 + Math.random() * 1000,
//             alpha: 0,
//             yoyo: true,
//             repeat: -1
//         });
//     }

// }

// // Event emitted from the PhaserGame component
// const currentScene = (scene: MainMenu) => {

//     canMoveSprite.value = (scene.scene.key !== "MainMenu");

// }

</script>
<style scoped>
    .full-width{
        width: 100%;
    }
    .container{
        width: 384;
        height: 490,
    }
    .wOne3rd{
        width: 33.333333%;
    }
    .w50{
        width: 50%;
    }
    .absolute-training-btn{
        position: absolute;
        top : 40%;
        width: 384px;
        padding: 10px;
        background-color: rgba(11, 92, 197, 0.24);
        border: none;
        font-style: italic;
    }
    .absolute-training-btn:hover{
        background-color: rgba(11, 92, 197, 0.589);
        color: white;
        font-weight: 1.2em;
    }
    .button-container{
        padding: 3px;
    }
    .button-container button{
        padding: 5px
    }
</style>
<template>
    <button class="absolute-training-btn button-decoration">START TRAINING</button>
    <div class="container">
        <div class="button-container">
            <button class="full-width">
                LOGIN
            </button>
        </div>
        <SampleGame class="full-width"/>
        <div class="button-container">
            <button class="w50 button-decoration">Shop</button>
            <button class="w50 button-decoration">Mission</button>
            <button class="wOne3rd button-decoration">Booster</button>
            <button class="wOne3rd button-decoration">Invite</button>
            <button class="wOne3rd button-decoration">Invite</button>
        </div>
    </div>
</template>
