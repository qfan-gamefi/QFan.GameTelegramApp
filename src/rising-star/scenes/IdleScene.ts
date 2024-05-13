import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

const SKY_TEXT = 'sky';
const GROUND_TEXT = 'ground';
const DUDE_IDLE = "dude_idle";

export class IdleScene extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;
  logoTween: Phaser.Tweens.Tween | null;

  platforms: Phaser.Physics.Arcade.StaticGroup;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  player_idle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  loaded: Boolean = false;

  constructor() {
    super('IdleScene');
  }
  preload() {
    this.loaded = true;
    this.load.image(GROUND_TEXT, './assets/platform.png');
    this.load.image(SKY_TEXT, './assets/bg.png');
    this.load.spritesheet(DUDE_IDLE, './assets/dude_idle.png',
      { frameWidth: 67, frameHeight: 129 });
  }

  create() {
    if (!this.loaded) {
      this.preload();
    }
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.platforms = this.physics.add.staticGroup();
    this.add.image(400, 300, SKY_TEXT);
    this.platforms.create(400, 468, 'ground').setScale(2).refreshBody();
    this.player_idle = this.createPlayer();
    this.physics.add.collider(this.player_idle, this.platforms);
    this.player_idle.anims.play('right-idle', true);
    EventBus.emit('current-scene-ready', this);
  }

  update() {
  }
  createPlayer() {
    const player = this.physics.add.sprite(180, 350, DUDE_IDLE);

    this.anims.create({
      key: 'right-idle',
      frames: this.anims.generateFrameNumbers(DUDE_IDLE, { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    return player;
  }
  changeScene() {
    this.scene.start('MainScene');
  }
}