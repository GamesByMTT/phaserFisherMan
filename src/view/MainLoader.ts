import { Scene } from "phaser";
import MainScene from "./MainScene";
import { LoaderConfig, LoaderSoundConfig } from "../scripts/LoaderConfig";
import { Globals } from "../scripts/Globals";
import SoundManager from "../scripts/SoundManager";
import { Howl } from "howler";
import WebFont from "webfontloader";

export default class MainLoader extends Scene {
    private progressBarContainer!: Phaser.GameObjects.Graphics;
    private progressBarFill!: Phaser.GameObjects.Graphics;
    private readonly progressBarWidth: number = 350;
    private readonly progressBarHeight: number = 12;
    private readonly borderRadius: number = 5;
    public soundManager: SoundManager;

    constructor() {
        super('MainLoader');
        this.soundManager = new SoundManager(this);
    }

    preload() {
        this.loadInitialAssets();
        this.setupFontLoader();
    }

    private loadInitialAssets() {
        window.parent.postMessage("OnEnter", "*");
        
        const initialAssets = [
            { key: "BackgroundNewLayer", path: "src/sprites/bg.png" },
            { key: "logo", path: "src/sprites/ElDorado.png" },
            { key: "title", path: "src/sprites/title.svg" },
        ];

        initialAssets.forEach(asset => this.load.image(asset.key, asset.path));
        
        this.load.spritesheet('star', "src/sprites/star-animation.png", { 
            frameWidth: 120,
            frameHeight: 80
        });

        this.load.once('complete', this.onInitialLoadComplete, this);
    }

    private setupFontLoader() {
        WebFont.load({
            custom: {
                families: ['CrashLandingItalic'],
                urls: ['src/fonts/CrashLandingBB.ttf']
            },
            active: () => {
                // Fonts have loaded
            }
        });
    }

    private onInitialLoadComplete() {
        this.setupUI();
        this.loadMainAssets();
    }

    private setupUI() {
        const { width, height } = this.scale;
        
        this.add.sprite(width / 2, height / 2, 'BackgroundNewLayer').setScale(2.5);
        this.add.sprite(width / 2, 450, 'logo');
        this.add.sprite(width / 2, 650, "title").setScale(1.3);

        this.createProgressBar();
        this.createStarAnimation();
    }

    private createProgressBar() {
        const { width, height } = this.scale;
        
        this.progressBarContainer = this.add.graphics();
        this.progressBarContainer.fillStyle(0x222222);
        this.drawRoundedRect(
            this.progressBarContainer,
            width / 2 - this.progressBarWidth / 2,
            height / 2 + 170,
            this.progressBarWidth,
            this.progressBarHeight,
            this.borderRadius
        );

        this.progressBarFill = this.add.graphics();
        this.progressBarFill.fillStyle(0xfaf729);
        this.progressBarFill.setPosition(width / 2, height / 2 + 170);
        
        this.animateProgressBar();
    }

    private createStarAnimation() {
        const { width } = this.scale;
        
        this.anims.create({
            key: 'playStarAnimation',
            frames: this.anims.generateFrameNumbers('star', { start: 0, end: 74 }),
            frameRate: 10,
            repeat: -1
        });

        this.add.sprite(width / 2, 650, 'star').play('playStarAnimation');
    }

    private animateProgressBar() {
        const animateBar = () => {
            this.tweens.add({
                targets: this.progressBarFill,
                scaleX: { from: 0, to: 1 },
                duration: 700,
                ease: 'Linear',
                yoyo: true,
                repeat: -1
            });
        };

        animateBar();
    }

    private loadMainAssets() {
        Object.entries(LoaderConfig).forEach(([key, value]) => {
            this.load.image(key, value);
        });
        
        Object.entries(LoaderSoundConfig).forEach(([key, value]) => {
            if (typeof value === "string") {
                this.load.audio(key, [value]);
            }
        });

        this.load.on('complete', this.onMainAssetsLoaded, this);
        this.load.start();
    }

    private onMainAssetsLoaded() {
        if (Globals.Socket?.socketLoaded) {
            this.loadMainScene();
        }
    }

    private loadMainScene() {
        this.cleanupUI();
        this.setupGlobals();
        Globals.SceneHandler?.addScene('MainScene', MainScene, true);
    }

    private cleanupUI() {
        [this.progressBarContainer, this.progressBarFill].forEach(obj => obj?.destroy());
        this.children.removeAll();
    }

    private setupGlobals() {
        Globals.resources = { ...this.textures.list };
        Object.entries(LoaderSoundConfig).forEach(([key, value]) => {
            if (typeof value === "string") {
                Globals.soundResources[key] = new Howl({
                    src: [value],
                    autoplay: false,
                    loop: false,
                });
            } else {
                console.warn(`Invalid sound configuration for key: ${key}`);
            }
        });
    }

    private drawRoundedRect(graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, radius: number) {
        graphics.beginPath();
        graphics.moveTo(x + radius, y);
        graphics.lineTo(x + width - radius, y);
        graphics.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
        graphics.lineTo(x + width, y + height - radius);
        graphics.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
        graphics.lineTo(x + radius, y + height);
        graphics.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
        graphics.lineTo(x, y + radius);
        graphics.arc(x + radius, y + radius, radius, Math.PI, 3 * Math.PI / 2, false);
        graphics.closePath();
        graphics.fillPath();
    }
}