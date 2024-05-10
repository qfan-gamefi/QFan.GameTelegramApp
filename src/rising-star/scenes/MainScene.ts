import { GameObjects, Scene } from 'phaser';

import { EventBus } from '../EventBus';

const SKY_TEXT = 'sky';
const GROUND_TEXT = 'ground';
const DUDE = "dude";
const BALL = 'ball';
const MIN_KICK_POWER_X = 100;
const MAX_KICK_POWER_X = 150;
const MIN_KICK_POWER_Y = -10;
const MAX_KICK_POWER_Y = -100;
const BALL_THRESH_HOLD = 200;
const KICK_POWER_X_TEXT = 'kick_power_x';
const KICK_POWER_Y_TEXT = 'kick_power_y';

export class MainScene extends Scene {
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
    this.load.spritesheet(DUDE, './assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet(BALL, './assets/balls.png', { frameWidth: 14, frameHeight: 14 });
  }

  create() {
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.platforms = this.physics.add.staticGroup();
    this.add.image(400, 300, SKY_TEXT);
    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    this.player = this.createPlayer();
    this.ball = this.createBall();
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.ball, this.platforms);
    this.player.anims.play('right', true);
    this.ball.anims.play('right-ball', true);
    this.physics.add.overlap(this.player, this.ball, this.kickball, undefined, this);

  }

  update() {
    const player_position = this.player.getCenter();
    const ball_position = this.ball.getCenter();
    if (Phaser.Math.Distance.Between(player_position.x, player_position.y, ball_position.x, ball_position.y) > BALL_THRESH_HOLD) {
      if (this.ball.getData(KICK_POWER_X_TEXT)) {
        this.ball.setData(KICK_POWER_X_TEXT, null);
      }
      this.ball.setVelocityX(-80);
    }
    else if (this.ball.getData(KICK_POWER_X_TEXT)) {
      const y_power = this.ball.getData(KICK_POWER_Y_TEXT)
      this.ball.setVelocity(this.ball.getData(KICK_POWER_X_TEXT), y_power);
      this.ball.setData(KICK_POWER_Y_TEXT, y_power + 3);
    }
    else {
      this.ball.setVelocityX(-80);
    }


    // if (this.cursors?.left.isDown) {
    //   this.player.setVelocityX(-160);

    //   this.player.anims.play('left', true);
    // }
    // else if (this.cursors?.right.isDown) {
    //   this.player.setVelocityX(160);

    //   this.player.anims.play('right', true);
    // }
    // else {
    //   this.player.setVelocityX(0);

    //   this.player.anims.play('turn');
    // }

    // if (this.cursors?.up.isDown && this.player.body.touching.down) {
    //   this.player.setVelocityY(-230);
    // }
  }
  createBall() {
    const ball = this.physics.add.sprite(400, 100, BALL);
    ball.setBounce(0.5);
    this.anims.create({
      key: 'right-ball',
      frames: this.anims.generateFrameNumbers(BALL, { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });
    return ball;
  }
  createPlayer() {
    const player = this.physics.add.sprite(100, 450, DUDE);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers(DUDE, { start: 0, end: 2 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'turn',
      frames: [{ key: DUDE, frame: 4 }],
      frameRate: 20
    });

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers(DUDE, { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    return player;
  }
  kickball() {
    this.ball.data.set(KICK_POWER_X_TEXT, Phaser.Math.FloatBetween(MIN_KICK_POWER_X, MAX_KICK_POWER_X))
    this.ball.data.set(KICK_POWER_Y_TEXT, Phaser.Math.FloatBetween(MIN_KICK_POWER_Y, MAX_KICK_POWER_Y))
    // Phaser.Math.FloatBetween(MIN_KICK_POWER_Y, MAX_KICK_POWER_Y)
  }
}