import { AUTO, Game } from 'phaser';
import { MainScene } from './scenes/MainScene';
import { IdleScene } from './scenes/IdleScene';
//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 384,
    height: 490,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        IdleScene, MainScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
        }
    },
};

const StartGame = (parent: any) => {

    return new Game({ ...config, parent });

}

export default StartGame;
