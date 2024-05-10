import { AUTO, Game } from 'phaser';
import { MainScene } from './scenes/MainScene';
//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 384,
    height: 590,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        MainScene
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
        }
    },
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
