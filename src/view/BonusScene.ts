import Phaser, { Scene } from "phaser";
import { Globals, ResultData } from "../scripts/Globals";
import SoundManager from "../scripts/SoundManager";
import { gameConfig } from "../scripts/appconfig";

export default class BonusScene extends Scene {
    public bonusContainer!: Phaser.GameObjects.Container;
    SoundManager!: SoundManager; 
    SceneBg!: Phaser.GameObjects.Sprite;
    winBg!: Phaser.GameObjects.Sprite;
    private spriteObjects: Phaser.GameObjects.Sprite[] = [];
    private spriteNames: string[][] = []; 
    private clickAnimations: string[][] = []; // Array for click animations
    private gemObjects: Phaser.GameObjects.Sprite[] = [];
    private bonusResults: string[] = []; 
    private totalWinAmount: number = 0;
    private winamountText!: Phaser.GameObjects.Text;
    panelBg!: Phaser.GameObjects.Sprite
    private totalPossibleBonus: number = 0;
    private isSpriteClicked: boolean = false;

    constructor() {
        super({ key: 'BonusScene' });
        this.SoundManager = new SoundManager(this); 
    }

    private calculateTotalBonus(): number {
        return ResultData.gameData.BonusResult
            .map(value => parseInt(value))
            .reduce((sum, current) => sum + current, 0);
    }

    create() {
        const { width, height } = this.cameras.main;
        this.bonusContainer = this.add.container();
        this.SoundManager.playSound("bonusBg");

        this.SceneBg = new Phaser.GameObjects.Sprite(this, width / 2, height / 2, 'gameBg')
            .setDisplaySize(width, height)
            .setDepth(11)
            .setInteractive();
        this.SceneBg.on('pointerdown', (pointer:Phaser.Input.Pointer)=>{
            pointer.event.stopPropagation();
        })
        this.bonusResults = ResultData.gameData.BonusResult
        this.totalPossibleBonus = this.calculateTotalBonus();
        console.log("Total Possible Bonus:", this.totalPossibleBonus);
       
        this.bonusContainer.add([this.SceneBg]);
        this.createBoxAnimations();
        // Define sprite names for idle and click animations
        this.spriteNames = [
            ['box0']
        ];
        this.clickAnimations = [
            ['box0', 'box1', 'box2', 'box3', 'box4', 'box5'], // Click animation sequence
        ];

        const positions = [
            // First row (2 boxes)
            { x: gameConfig.scale.width * 0.35, y: gameConfig.scale.height * 0.3 },
            { x: gameConfig.scale.width * 0.65, y: gameConfig.scale.height * 0.3 },
            // Second row (3 boxes)
            { x: gameConfig.scale.width * 0.25, y: gameConfig.scale.height * 0.6 },
            { x: gameConfig.scale.width * 0.5, y: gameConfig.scale.height * 0.6 },
            { x: gameConfig.scale.width * 0.75, y: gameConfig.scale.height * 0.6 }
        ];

        positions.forEach((pos, index) => {
            const sprite = this.add.sprite(pos.x, pos.y, this.spriteNames[0][0])
                .setInteractive()
                .setDepth(11);

            sprite.setData('value', this.bonusResults[index]);
            sprite.setData('symbolIndex', 0);
            sprite.setData('originalPosition', { x: pos.x, y: pos.y });
            sprite.on('pointerdown', () => this.handleGemClick(sprite));

            this.gemObjects.push(sprite);
            this.spriteObjects.push(sprite);
        });

        this.createTweenAnimations();
    }

    private createBoxAnimations(): void {
        // Create animation sequence
        this.anims.create({
            key: 'boxReveal',
            frames: [
                { key: 'box0' },
                { key: 'box1' },
                { key: 'box2' },
                { key: 'box3' },
                { key: 'box4' },
                { key: 'box5' }
            ],
            frameRate: 2,
            repeat: 0
        });
    }

    private createTweenAnimations(): void {
        this.spriteObjects.forEach((sprite, index) => {
            const symbolFrames = this.spriteNames[sprite.getData('symbolIndex')];
            this.tweens.addCounter({
                from: 0,
                to: symbolFrames.length - 1,
                duration: 500, 
                repeat: -1, 
                onUpdate: (tween: Phaser.Tweens.Tween) => {
                    if (!this.isSpriteClicked) { // Only update if not clicked
                        const frameIndex = Math.floor(tween.getValue());
                        sprite.setTexture(symbolFrames[frameIndex]);
                    }
                }
            });
        });
    }

    private handleGemClick(sprite: Phaser.GameObjects.Sprite): void {
        if (this.isSpriteClicked) return; // Prevent multiple clicks
        this.isSpriteClicked = true;
        const originalPos = sprite.getData('originalPosition');
        const valueText = sprite.getData('value');
        const value = parseInt(valueText);
        // First play shake animation
        this.shakeBox(sprite, () => {
            // After shake, play the reveal animation
            this.playRevealAnimation(sprite, value, originalPos);
        });
    }

    private shakeBox(sprite: Phaser.GameObjects.Sprite, onComplete: () => void): void {
        const originalPos = sprite.getData('originalPosition');
        const shakeDistance = 5;
        const shakeDuration = 50;
        const shakeIterations = 4;

        let currentIteration = 0;
        const shakeSequence = () => {
            if (currentIteration >= shakeIterations) {
                // Return to original position and complete
                this.tweens.add({
                    targets: sprite,
                    x: originalPos.x,
                    y: originalPos.y,
                    duration: shakeDuration,
                    onComplete: onComplete
                });
                return;
            }

            // Shake right
            this.tweens.add({
                targets: sprite,
                x: originalPos.x + shakeDistance,
                duration: shakeDuration,
                onComplete: () => {
                    // Shake left
                    this.tweens.add({
                        targets: sprite,
                        x: originalPos.x - shakeDistance,
                        duration: shakeDuration,
                        onComplete: () => {
                            currentIteration++;
                            shakeSequence();
                        }
                    });
                }
            });
        };

        shakeSequence();
    }

    private playRevealAnimation(sprite: Phaser.GameObjects.Sprite, value: number, originalPos: { x: number, y: number }): void {
        sprite.setVisible(false);
        
        const symbolIndex = sprite.getData('symbolIndex');
        const clickAnimationFrames = this.clickAnimations[symbolIndex];
        const animSprite = this.add.sprite(originalPos.x, originalPos.y, clickAnimationFrames[0]).setDepth(12);
    
        this.tweens.addCounter({
            from: 0,
            to: clickAnimationFrames.length - 1,
            duration: 500,
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                const frameIndex = Math.floor(tween.getValue());
                animSprite.setTexture(clickAnimationFrames[frameIndex]);
            },
            onComplete: () => {
                // Create text at box position
                let text = this.add.text(
                    originalPos.x, 
                    originalPos.y, // Start at box position
                    value === 0 ? "Game Over" : `+${value}`, 
                    { 
                        fontFamily: "GhostKid",
                        font: "60px", 
                        color: "#0000FF",
                        stroke: '#0000FF',
                        strokeThickness: 4,
                    }
                ).setOrigin(0.5).setDepth(13);
    
                // Animate text moving upward
                this.tweens.add({
                    targets: text,
                    y: originalPos.y - 200, // Move up by 100 pixels (adjust as needed)
                    duration: 1000,
                    ease: 'Power1',
                    onComplete: () => {
                        if (value === 0) {
                            const overlay = this.add.rectangle(
                                0, 0,
                                gameConfig.scale.width,
                                gameConfig.scale.height,
                                0x000000, 0.7
                            ).setOrigin(0).setDepth(14);
    
                            // Create "Your Win" text
                            const yourWinText = this.add.sprite(
                                gameConfig.scale.width / 2,
                                gameConfig.scale.height + 100, // Start below screen
                                "yourWin"
                            ).setOrigin(0.5).setDepth(15).setScale(0.6);
    
                            // Create win amount text
                            const winAmountText = this.add.text(
                                gameConfig.scale.width / 2,
                                gameConfig.scale.height + 800, // Start below screen
                                `${this.totalWinAmount}`,
                                {
                                    fontFamily: "GhostKid",
                                    fontSize: "90px",
                                    color: "#ecae39", // Gold color
                                    stroke: '#000000',
                                    strokeThickness: 6
                                }
                            ).setOrigin(0.5).setDepth(15);
    
                            // Animate overlay alpha
                            this.tweens.add({
                                targets: overlay,
                                alpha: { from: 0, to: 0.7 },
                                duration: 500
                            });
    
                            // Animate "Your Win" text
                            this.tweens.add({
                                targets: yourWinText,
                                y: gameConfig.scale.height / 2 - 150, // Move to center
                                duration: 1000,
                                ease: 'Back.easeOut',
                                delay: 500
                            });
    
                            // Animate win amount
                            this.tweens.add({
                                targets: winAmountText,
                                y: gameConfig.scale.height / 2 + 150, // Move to center
                                duration: 1000,
                                ease: 'Back.easeOut',
                                delay: 700,
                                onComplete: () => {
                                    // Add a close button or timeout to remove the scene
                                    setTimeout(() => {
                                        this.SoundManager.pauseSound("bonusBg");
                                        Globals.SceneHandler?.removeScene("BonusScene");
                                    }, 3000);
                                }
                            });
                        } else {
                            this.SoundManager.playSound("bonuswin");
                            this.totalWinAmount += value;
                            if (this.winamountText) {
                                this.winamountText.setText(this.totalWinAmount.toString());
                            }
                        }
    
                        // Fade out text after it has moved up
                        this.tweens.add({
                            targets: text,
                            alpha: 0,
                            duration: 500,
                            delay: 500,
                            onComplete: () => {
                                text.destroy();
                                // animSprite.destroy();
                                this.isSpriteClicked = false;
                            }
                        });
                    }
                });
            }
        })
    }

    spinWheel() {
        setTimeout(() => {
            Globals.SceneHandler?.removeScene("BonusScene"); 
        }, 2000);
    }
}