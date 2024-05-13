import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

const SKY_TEXT = 'sky';
const GROUND_TEXT = 'ground';
const DUDE = "dude";

export class IdleScene extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;
  logoTween: Phaser.Tweens.Tween | null;

  platforms: Phaser.Physics.Arcade.StaticGroup;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

  preload() {
    this.load.image(GROUND_TEXT, './assets/platform.png');
    this.load.image(SKY_TEXT, './assets/bg.png');
    this.load.spritesheet(DUDE, './assets/dude-idle.png',
      { frameWidth: 67, frameHeight: 129 });
  }

  create() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.platforms = this.physics.add.staticGroup();
    this.add.image(400, 300, SKY_TEXT);
    this.platforms.create(400, 468, 'ground').setScale(2).refreshBody();
    this.player = this.createPlayer();
    this.physics.add.collider(this.player, this.platforms);
    this.player.anims.play('right', true);
    EventBus.emit('current-scene-ready', this);
  }

  update() {
  }
  createPlayer() {
    const player = this.physics.add.sprite(180, 350, DUDE);

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers(DUDE, { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    return player;
  }
}