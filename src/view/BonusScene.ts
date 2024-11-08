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
    private bonusResults: string[] = ['20', '40', '30', '50', '0']; 
    private totalWinAmount: number = 0;
    private winamountText!: Phaser.GameObjects.Text;
    panelBg!: Phaser.GameObjects.Sprite
    private isSpriteClicked: boolean = false;

    constructor() {
        super({ key: 'BonusScene' });
        this.SoundManager = new SoundManager(this); 
    }

    create() {
        const { width, height } = this.cameras.main;
        this.bonusContainer = this.add.container();
        this.SoundManager.playSound("bonusBg");

        this.SceneBg = new Phaser.GameObjects.Sprite(this, width / 2, height / 2, 'GambleBg')
            .setDisplaySize(width, height)
            .setDepth(11)
            .setInteractive();
        this.SceneBg.on('pointerdown', (pointer:Phaser.Input.Pointer)=>{
            pointer.event.stopPropagation();
        })

        this.winBg = new Phaser.GameObjects.Sprite(this, width * 0.5, height * 0.2, "bonusLogo").setScale(0.8);
        this.winamountText = this.add.text(width * 0.51, height * 0.15, this.totalWinAmount.toString(), { font: "40px Arial", color: "#fff",  align: 'center',  }).setOrigin(0.5);
        this.panelBg = new Phaser.GameObjects.Sprite(this, width * 0.5, height * 0.9, "balancePanel").setDisplaySize(500, 72)
        const tipsText = new Phaser.GameObjects.Text(this, width * 0.5, height * 0.9, "Tap On The Crystals To Try Your Luck", {color:"#ffffff", fontSize:"23px", align:"center", fontFamily:"Arial"}).setOrigin(0.5)
        this.bonusContainer.add([this.SceneBg, this.winBg, this.winamountText, this.panelBg, tipsText]);

        // Define animation frames 
        this.spriteNames = [
            ['blue0', 'blue1', 'blue2', 'blue3', 'blue4', 'blue5', 'blue6', 'blue7', 'blue8', 'blue9', 'blue10', 'blue11', 'blue12', 'blue13', 'blue14', 'blue15', 'blue16', 'blue17', 'blue18', 'blue19', 'blue20'], 
            ['green0', 'green1', 'green2', 'green3', 'green4', 'green5', 'green6', 'green7', 'green8', 'green9', 'green10', 'green11', 'green12', 'green13', 'green14', 'green15', 'green16', 'green17', 'green18', 'green19', 'green20'],
            ['purple0', 'purple1', 'purple2', 'purple3', 'purple4', 'purple5', 'purple6', 'purple7', 'purple8', 'purple9', 'purple10', 'purple11', 'purple12', 'purple13', 'purple14', 'purple15', 'purple16', 'purple17', 'purple18', 'purple19', 'purple20'],
            ['red0', 'red1', 'red2', 'red3', 'red4', 'red5', 'red6', 'red7', 'red8', 'red9', 'red10', 'red11', 'red12', 'red13', 'red14', 'red15', 'red16', 'red17', 'red18', 'red19', 'red20'],
            ['yellow0', 'yellow1', 'yellow2', 'yellow3', 'yellow4', 'yellow5', 'yellow6', 'yellow7', 'yellow8', 'yellow9', 'yellow10', 'yellow11', 'yellow12', 'yellow13', 'yellow14', 'yellow15', 'yellow16', 'yellow17', 'yellow18', 'yellow19', 'yellow20']
        ];

        // Define click animation frames
        this.clickAnimations = [
            ['blueAnim51', 'blueAnim52', 'blueAnim53', 'blueAnim54', 'blueAnim55', 'blueAnim56', 'blueAnim57', 'blueAnim58', 'blueAnim59', 'blueAnim60', 'blueAnim61', 'blueAnim62', 'blueAnim63', 'blueAnim64', 'blueAnim65', 'blueAnim66', 'blueAnim67'],
            ['greenAnim51', 'greenAnim52', 'greenAnim53', 'greenAnim54', 'greenAnim55', 'greenAnim56', 'greenAnim57', 'greenAnim58', 'greenAnim59', 'greenAnim60', 'greenAnim61', 'greenAnim62', 'greenAnim63', 'greenAnim64', 'greenAnim65', 'greenAnim66', 'greenAnim67'],
            ['purpleAnim51', 'purpleAnim52', 'purpleAnim53', 'purpleAnim54', 'purpleAnim55', 'purpleAnim56', 'purpleAnim57', 'purpleAnim58', 'purpleAnim59', 'purpleAnim60', 'purpleAnim61', 'purpleAnim62', 'purpleAnim63', 'purpleAnim64', 'purpleAnim65', 'purpleAnim66', 'purpleAnim67'],
            ['redAnim51', 'redAnim52', 'redAnim53', 'redAnim54', 'redAnim55', 'redAnim56', 'redAnim57', 'redAnim58', 'redAnim59', 'redAnim60', 'redAnim61', 'redAnim62', 'redAnim63', 'redAnim64', 'redAnim65', 'redAnim66', 'redAnim67'],
            ['yellowAnim51', 'yellowAnim52', 'yellowAnim53', 'yellowAnim54', 'yellowAnim55', 'yellowAnim56', 'yellowAnim57', 'yellowAnim58', 'yellowAnim59', 'yellowAnim60', 'yellowAnim61', 'yellowAnim62', 'yellowAnim63', 'yellowAnim64', 'yellowAnim65', 'yellowAnim66', 'yellowAnim67']
        ];

        // Define x positions for sprites
        const xPositions: number[] = [500, 750, 1000, 1250, 1500]; 

        // Create sprites 
        xPositions.forEach((xPos: number, index: number) => {
            const symbolIndex = index % this.spriteNames.length; 
            const sprite = this.add.sprite(xPos, gameConfig.scale.width/2.4, this.spriteNames[symbolIndex][0]) 
                .setInteractive()
                .setDepth(11);

            sprite.setData('value', ResultData.gameData.BonusResult[index]);
            // sprite.setData('value', this.bonusResults[index]);
            sprite.setData('symbolIndex', symbolIndex); 
            sprite.on('pointerdown', () => this.handleGemClick(sprite, xPos, gameConfig.scale.width/2.4)); 
            this.gemObjects.push(sprite);
            this.spriteObjects.push(sprite);
        });

        this.createTweenAnimations(); 
    }

    private createTweenAnimations(): void {
        this.spriteObjects.forEach((sprite, index) => {
            const symbolFrames = this.spriteNames[sprite.getData('symbolIndex')];
            this.tweens.addCounter({
                from: 0,
                to: symbolFrames.length - 1,
                duration: 1500, 
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

    private handleGemClick(sprite: Phaser.GameObjects.Sprite, x: number, y: number): void {
        
        const valueText = sprite.getData('value');
        const value = parseInt(valueText);
        this.totalWinAmount += value;
        this.winamountText.setText(this.totalWinAmount.toString());

        this.tweens.getTweensOf(sprite).forEach(tween => tween.stop()); 
        const symbolIndex = sprite.getData('symbolIndex');
        const clickAnimationFrames = this.clickAnimations[symbolIndex]; 

        this.isSpriteClicked = true; // Set the flag

        sprite.setVisible(false);  

        const animSprite = this.add.sprite(x, y, clickAnimationFrames[0]).setDepth(12); 
        let finalFramePosition = { x, y };
    
        this.tweens.addCounter({
            from: 0,
            to: clickAnimationFrames.length - 1,
            duration: 1500, 
            onUpdate: (tween: Phaser.Tweens.Tween) => {
                const frameIndex = Math.floor(tween.getValue());
                animSprite.setTexture(clickAnimationFrames[frameIndex]);
                finalFramePosition = { x: animSprite.x, y: animSprite.y };
            },
            onComplete: () => {
                let text = this.add.text(finalFramePosition.x, finalFramePosition.y + 380, `+${valueText}`, { font: "50px Arial", color: "#fff" }).setOrigin(0.5);
                if (value === 0) {
                    text.destroy();
                    text = this.add.text(finalFramePosition.x, finalFramePosition.y + 360, "GameOver", { font: "40px Arial", color: "#fff" }).setOrigin(0.5);
                    setTimeout(() => {
                        this.SoundManager.pauseSound("bonusBg");
                        Globals.SceneHandler?.removeScene("BonusScene"); 
                    }, 2000);
                } else {
                    this.SoundManager.playSound("bonuswin");
                }

                this.tweens.add({
                    targets: text,
                    alpha: 0, 
                    duration: 1000,
                    delay: 1000, 
                    onComplete: () => {
                        text.destroy(); 
                    }
                });
                // this.isSpriteClicked = false;
                sprite.destroy();
                animSprite.destroy();
            }
        });
    }

    spinWheel() {
        setTimeout(() => {
            Globals.SceneHandler?.removeScene("BonusScene"); 
        }, 2000);
    }
}