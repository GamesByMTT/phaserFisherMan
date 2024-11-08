import Phaser from 'phaser';
import { CalculateScaleFactor } from './appconfig';
import { UiContainer } from './UiContainer';
import MainLoader from '../view/MainLoader';

// Global variables or constants
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

export class App {
    game: Phaser.Game;

    constructor() {
        // Initialize Phaser game
        this.game = new Phaser.Game({
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: BASE_WIDTH,
                height: BASE_HEIGHT
            },
            scene: [MainLoader, UiContainer],
            physics: {
                default: 'arcade',
                arcade: {
                    debug: false
                }
            }
        });
        // Handle window resize
        window.addEventListener('resize', this.onResize.bind(this));
        // Start the initial scene;
        this.startScene()
    }

    onResize() {
        CalculateScaleFactor();
        this.game.scale.resize(window.innerWidth, window.innerHeight);
    }

    startScene() {
        // this.game.scene.start('MainScene');
    }
}