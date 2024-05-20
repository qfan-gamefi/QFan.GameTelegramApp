import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";

const SKY_TEXT = "sky";
const GROUND_TEXT = "ground";
const DUDE_RUN = "dude_run";
const BALL = "ball";
const MIN_KICK_POWER_X = 100;
const MAX_KICK_POWER_X = 150;
const MIN_KICK_POWER_Y = -50;
const MAX_KICK_POWER_Y = -150;
const BALL_THRESH_HOLD = 200;
const KICK_POWER_X_TEXT = "kick_power_x";
const KICK_POWER_Y_TEXT = "kick_power_y";

export class MainScene extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    bg: Phaser.GameObjects.TileSprite;
    platforms: Phaser.Physics.Arcade.StaticGroup;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
    player_run: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    loaded: Boolean = false;

    constructor() {
        super("MainScene");
    }

    preload() {
        this.loaded = true;
        this.load.image(GROUND_TEXT, "./assets/platform.png");
        this.load.image(SKY_TEXT, "./assets/test-bg.jpg");
        this.load.spritesheet(DUDE_RUN, "./assets/dude_run.png", {
            frameWidth: 92,
            frameHeight: 125,
        });
        this.load.spritesheet(BALL, "./assets/balls.png", {
            frameWidth: 32,
            frameHeight: 32,
        });
    }

    create() {
        if (!this.loaded) {
            this.preload();
        }

        const backgroundImage = this.add.image(0, 0, SKY_TEXT);

        // Calculate the scaling factors for width and height to fit the viewport
        const scaleX = this.cameras.main.width / backgroundImage.width;
        const scaleY = this.cameras.main.height / backgroundImage.height;

        // Use the smaller scale to fit the entire image within the viewport
        const scale = Math.max(scaleX, scaleY);

        // Set the background image's display size
        backgroundImage.setDisplaySize(
            backgroundImage.width * scale,
            backgroundImage.height * scale
        );

        // Center the background image
        backgroundImage.setPosition(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2
        );

        this.cursors = this.input.keyboard?.createCursorKeys();
        this.platforms = this.physics.add.staticGroup();
        // this.add.image(400, 300, SKY_TEXT);468
        this.platforms.create(192, 521, "ground").setScale(2).refreshBody();
        this.player_run = this.createPlayer();
        this.ball = this.createBall();
        this.physics.add.collider(this.player_run, this.platforms);
        this.physics.add.collider(this.ball, this.platforms);
        this.player_run.anims.play("right", true);
        this.ball.anims.play("right-ball", true);
        this.physics.add.overlap(
            this.player_run,
            this.ball,
            this.kickball,
            undefined,
            this
        );
        EventBus.emit("current-scene-ready", this);
    }

    update() {
        const player_position = this.player_run.getCenter();
        const ball_position = this.ball.getCenter();
        // this.bg.tilePositionX +=
        //     3 * (this.player_run.anims ? this.player_run.anims.timeScale : 1);

        if (
            Phaser.Math.Distance.Between(
                player_position.x,
                player_position.y,
                ball_position.x,
                ball_position.y
            ) > BALL_THRESH_HOLD
        ) {
            if (this.ball.getData(KICK_POWER_X_TEXT)) {
                this.ball.setData(KICK_POWER_X_TEXT, null);
            }
            this.ball.setVelocityX(-80);
        } else if (this.ball.getData(KICK_POWER_X_TEXT)) {
            const y_power = this.ball.getData(KICK_POWER_Y_TEXT);
            this.ball.setVelocity(
                this.ball.getData(KICK_POWER_X_TEXT),
                y_power
            );
            this.ball.setData(KICK_POWER_Y_TEXT, y_power + 3);
        } else {
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
            key: "right-ball",
            frames: this.anims.generateFrameNumbers(BALL, { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        });

        return ball;
    }
    createPlayer() {
        const player = this.physics.add.sprite(132, 245, DUDE_RUN);

        this.anims.create({
            key: "left",
            frames: this.anims.generateFrameNumbers(DUDE_RUN, {
                start: 0,
                end: 2,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "turn",
            frames: [{ key: DUDE_RUN, frame: 4 }],
            frameRate: 20,
        });

        this.anims.create({
            key: "right",
            frames: this.anims.generateFrameNumbers(DUDE_RUN, {
                start: 0,
                end: 5,
            }),
            frameRate: 10,
            repeat: -1,
        });

        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        return player;
    }
    kickball() {
        if (
            this.player_run.getBottomRight().x - this.ball.getBottomLeft().x >
            30
        ) {
            this.ball.data.set(
                KICK_POWER_X_TEXT,
                Phaser.Math.FloatBetween(MIN_KICK_POWER_X, MAX_KICK_POWER_X)
            );
            this.ball.data.set(
                KICK_POWER_Y_TEXT,
                Phaser.Math.FloatBetween(MIN_KICK_POWER_Y, MAX_KICK_POWER_Y)
            );
        }
    }
    changeScene() {
        this.scene.start("IdleScene");
    }
}
