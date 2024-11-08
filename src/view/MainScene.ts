import { Scene } from 'phaser';
import { Slots } from '../scripts/Slots';
import { UiContainer } from '../scripts/UiContainer';
import { LineGenerator } from '../scripts/Lines';
import { UiPopups } from '../scripts/UiPopup';
import LineSymbols from '../scripts/LineSymbols';
import { 
    Globals, 
    ResultData, 
    currentGameData, 
    initData, 
    gambleResult 
} from '../scripts/Globals';
import { gameConfig } from '../scripts/appconfig';
import BonusScene from './BonusScene';
import SoundManager from '../scripts/SoundManager';

export default class MainScene extends Scene {
    // Declare properties without explicit initialization
    gameBg!: Phaser.GameObjects.Sprite;
    reelBg!: Phaser.GameObjects.Sprite;
    top!: Phaser.GameObjects.Sprite;
    bottom!: Phaser.GameObjects.Sprite;
    left!: Phaser.GameObjects.Sprite;
    right!: Phaser.GameObjects.Sprite;
    rope!: Phaser.GameObjects.Sprite;
    nail!: Phaser.GameObjects.Sprite
    middleBar!: Phaser.GameObjects.Sprite;
    gameLogo!: Phaser.GameObjects.Sprite;
    slot!: Slots;
    lineGenerator!: LineGenerator;
    soundManager!: SoundManager;
    uiContainer!: UiContainer;
    uiPopups!: UiPopups;    
    lineSymbols!: LineSymbols;
    private mainContainer!: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'MainScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Container for better organization and potential performance
        this.mainContainer = this.add.container();

        this.soundManager = new SoundManager(this);

        this.gameBg = this.add.sprite(width / 2, height / 2, 'gameBg')
            .setDepth(0)
            .setDisplaySize(1920, 1080);
        this.reelBg = this.add.sprite(width/2, height/1.9, "reelBg").setOrigin(0.5)
        this.left = this.add.sprite(width * 0.22, height/1.9, "leftColumn").setOrigin(0.5)
        this.right = this.add.sprite(width * 0.785, height/1.9, "rightColumn").setOrigin(0.5)
        this.top = this.add.sprite(width/2, height * 0.25, "topColumn").setOrigin(0.5)
        this.bottom = this.add.sprite(width/2, height * 0.81, "bottomColumn").setOrigin(0.5)
        this.gameLogo = this.add.sprite(width * 0.5, height * 0.08, "gameLogo").setOrigin(0.5)
        this.mainContainer.add([this.gameBg, this.reelBg, this.left, this.right, this.top, this.bottom]);
         // Repeat reelBg 4 times
         const midLine = 4;
         const midLineSpacing = 212; // Adjust this value to set the spacing between reelBg sprites
         for (let i = 0; i < midLine; i++) {
             const midLineX = width / 3 + i * midLineSpacing; // or any specific x-coordinate
             const midLineY = height / 1.9;
             const middleBar = new Phaser.GameObjects.Sprite(this, midLineX, midLineY, 'middleLine').setDepth(2);
             this.mainContainer.add(middleBar);
         }

        
        this.soundManager.playSound("backgroundMusic");

        this.uiContainer = new UiContainer(this, () => this.onSpinCallBack(), this.soundManager);
        this.mainContainer.add(this.uiContainer);

        this.slot = new Slots(this, this.uiContainer, () => this.onResultCallBack(), this.soundManager);
        this.lineGenerator = new LineGenerator(this, this.slot.slotSymbols[0][0].symbol.height + 50, this.slot.slotSymbols[0][0].symbol.width + 10);
        this.mainContainer.add([this.lineGenerator, this.slot]);

        this.uiPopups = new UiPopups(this, this.uiContainer, this.soundManager);
        this.mainContainer.add(this.uiPopups);

        this.lineSymbols = new LineSymbols(this, 10, 12, this.lineGenerator);
        this.mainContainer.add(this.lineSymbols);
    }

    update(time: number, delta: number) {
        this.uiContainer.update();
    }

    private onResultCallBack() {
        this.uiContainer.onSpin(false);
        this.soundManager.stopSound("onSpin"); 
        this.lineGenerator.showLines(ResultData.gameData.linesToEmit);
    }

    private onSpinCallBack() {
        this.soundManager.playSound("onSpin");
        this.slot.moveReel();
        this.lineGenerator.hideLines();
    }

    recievedMessage(msgType: string, msgParams: any) {
        if (msgType === 'ResultData') {
            // Use setTimeout for better performance in this case
            setTimeout(() => {
                this.handleResultData();
            }, 3000); 

            // Stop tween after a delay for visual effect
            setTimeout(() => {
                this.slot.stopTween();
            }, 1000);
        } else if (msgType === 'GambleResult') {
            this.uiContainer.currentWiningText.updateLabelText(gambleResult.gamleResultData.currentWining.toString());
        }
    }

    // Handle ResultData logic separately
    private handleResultData() {
        if (ResultData.gameData.isBonus) {
            if (this.uiContainer.isAutoSpinning) {
                // Emit events directly instead of simulating clicks
                this.uiContainer.autoBetBtn.emit('pointerdown');
                this.uiContainer.autoBetBtn.emit('pointerup'); 
            }
            Globals.SceneHandler?.addScene('BonusScene', BonusScene, true);
        }

        this.uiContainer.currentWiningText.updateLabelText(ResultData.playerData.currentWining.toString());
        currentGameData.currentBalance = ResultData.playerData.Balance;
        let betValue = (initData.gameData.Bets[currentGameData.currentBetIndex]) * 20;
        let winAmount = ResultData.gameData.WinAmout;
        this.uiContainer.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));

        if (winAmount >= 15 * betValue && winAmount < 20 * betValue) {
            this.showWinPopup(winAmount, 'hugeWinPopup');
        } else if (winAmount >= 20 * betValue && winAmount < 25 * betValue) {
            this.showWinPopup(winAmount, 'megaWinPopup');
        }
    }

    // Function to show win popup
    private showWinPopup(winAmount: number, spriteKey: string) {
        const inputOverlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(9)
            .setInteractive();

        inputOverlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation(); 
        });

        const megaWinBg = this.add.sprite(gameConfig.scale.width / 2, gameConfig.scale.height / 2, "megawinAnimBg")
            .setDepth(10)
            .setOrigin(0.5);

        const megaWinStar = this.add.sprite(gameConfig.scale.width / 2, gameConfig.scale.height / 2, "megawinStar")
            .setDepth(12)
            .setOrigin(0.5)
            .setScale(0); 

        this.tweens.add({
            targets: megaWinStar,
            scale: 1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: 250 
        });

        // Create coin flip animation once
        this.createCoinFlipAnimation();

        const winningSprite = this.add.sprite(gameConfig.scale.width / 4, gameConfig.scale.height * 0.8, `coin0`)
            .setDepth(13)
            .setScale(0.7)
            .play('coinFlip');

        const winSprite = this.add.sprite(this.cameras.main.centerX, this.cameras.main.centerY - 50, spriteKey)
            .setScale(0.8)
            .setDepth(13);

        this.tweens.addCounter({
            from: 0,
            to: winAmount,
            duration: 1000,
            onUpdate: (tween) => {
                // You might want to do something with the incrementing value here
                // For example, update a text object
            },
            onComplete: () => {
                this.time.delayedCall(4000, () => {
                    inputOverlay.destroy();
                    megaWinBg.destroy();
                    megaWinStar.destroy();
                    winSprite.destroy();
                    winningSprite.stop();
                    winningSprite.destroy();
                });
            }
        });
    }

    // Separate function for coin flip animation
    private createCoinFlipAnimation() {
        const coinFrames = [];
        for (let i = 0; i < 19; i++) {
            coinFrames.push({ key: `coin${i}` });
        }

        this.anims.create({
            key: `coinFlip`,
            frames: coinFrames,
            frameRate: 10,
            repeat: -1
        });
    }
}
