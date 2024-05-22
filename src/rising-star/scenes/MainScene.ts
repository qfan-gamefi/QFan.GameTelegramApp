import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";

const SKY_TEXT = "sky";
const GROUND_TEXT = "ground";
const NUMBER_0 = "NUMBER_0";
const NUMBER_1 = "NUMBER_1";
const NUMBER_2 = "NUMBER_2";
const NUMBER_3 = "NUMBER_3";
const NUMBER_4 = "NUMBER_4";
const NUMBER_5 = "NUMBER_5";
const NUMBER_6 = "NUMBER_6";
const NUMBER_7 = "NUMBER_7";
const NUMBER_8 = "NUMBER_8";
const NUMBER_9 = "NUMBER_9";
const SYMBOL_P = "SYMBOL_P";
const SYMBOL_C = "SYMBOL_C";
const DUDE_RUN = "dude_run";
const BALL = "ball";
const MIN_KICK_POWER_X = 100;
const MAX_KICK_POWER_X = 150;
const MIN_KICK_POWER_Y = -50;
const MAX_KICK_POWER_Y = -150;
const BALL_THRESH_HOLD = 200;
const KICK_POWER_X_TEXT = "kick_power_x";
const KICK_POWER_Y_TEXT = "kick_power_y";
const KICK_POINT_Y = 460;

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
    points: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[];
    isBallImpactProcessingDone = false;
    constructor() {
        super("MainScene");
    }

    preload() {
        this.loaded = true;
        this.load.image(GROUND_TEXT, "./assets/platform.png");
        this.load.image(SKY_TEXT, "./assets/test-bg.jpg");
        this.load.spritesheet(DUDE_RUN, "./assets/dude_run.png", {
            frameWidth: 92,
            frameHeight: 125
        });
        this.load.spritesheet(BALL, "./assets/balls.png", {
            frameWidth: 32, frameHeight: 32
        });
        this.load.spritesheet(NUMBER_0, "./assets/Number0.png", { frameWidth: 13, frameHeight: 15, startFrame: 0, endFrame: 0 });
        this.load.spritesheet(NUMBER_1, "./assets/Number1.png", { frameWidth: 13, frameHeight: 15, startFrame: 0, endFrame: 0 });
        this.load.spritesheet(NUMBER_2, "./assets/Number2.png", { frameWidth: 13, frameHeight: 15, startFrame: 0, endFrame: 0 });
        this.load.spritesheet(NUMBER_3, "./assets/Number3.png", { frameWidth: 13, frameHeight: 15, startFrame: 0, endFrame: 0 });
        this.load.spritesheet(NUMBER_4, "./assets/Number4.png", { frameWidth: 13, frameHeight: 15, startFrame: 0, endFrame: 0 });
        this.load.spritesheet(NUMBER_5, "./assets/Number5.png", { frameWidth: 13, frameHeight: 15, startFrame: 0, endFrame: 0 });
        this.load.spritesheet(NUMBER_6, "./assets/Number6.png", { frameWidth: 13, frameHeight: 15, startFrame: 0, endFrame: 0 });
        this.load.spritesheet(NUMBER_7, "./assets/Number7.png", { frameWidth: 13, frameHeight: 15, startFrame: 0, endFrame: 0 });
        this.load.spritesheet(NUMBER_8, "./assets/Number8.png", { frameWidth: 13, frameHeight: 15, startFrame: 0, endFrame: 0 });
        this.load.spritesheet(NUMBER_9, "./assets/Number9.png", { frameWidth: 13, frameHeight: 15, startFrame: 0, endFrame: 0 });
        this.load.spritesheet(SYMBOL_P, "./assets/SymbolPlus.png", { frameWidth: 13, frameHeight: 15, startFrame: 0, endFrame: 0 });
        this.load.spritesheet(SYMBOL_C, "./assets/SymbolComma.png", { frameWidth: 13, frameHeight: 15, startFrame: 0, endFrame: 0 });
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
            this.processImpact,
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
        let removePoints: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[];
        if (this.points && this.points.length > 0) {
            this.points?.forEach((value) => {
                if (!value) { return; }
                const alpha = Math.max(0, Math.min(1, (255 - ((Math.abs(KICK_POINT_Y - value.getCenter().y)) / 100) * 255) / 255))
                value.alpha = alpha;
            });
            this.points = this.points.filter((value) => {
                return value && value.alpha > 0;
            })
        }
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
            this.isBallImpactProcessingDone = false;
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
    }
    createPoints(x: number, y: number): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] {
        const points = [this.physics.add.sprite(x - 15, y, SYMBOL_P).setGravity(0, -500),
        this.physics.add.sprite(x, y, NUMBER_0).setGravity(0, -500),
        this.physics.add.sprite(x + 15, y, SYMBOL_C).setGravity(0, -500),
        this.physics.add.sprite(x + 30, y, NUMBER_2).setGravity(0, -500)];

        return points;
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
    processImpact() {
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
            if (!this.isBallImpactProcessingDone) {
                this.points = Array.prototype.concat(this.points, this.createPoints(this.ball.getTopLeft().x, this.ball.getTopLeft().y + 5));
            }
            this.isBallImpactProcessingDone = true
        }
    }
    changeScene() {
        this.scene.start("IdleScene");
    }
}
