import Phaser, { Scene } from "phaser";
import { Globals, gambleData, gambleResult, ResultData } from "../scripts/Globals";
import SoundManager from "../scripts/SoundManager";
import { gameConfig } from "../scripts/appconfig";

export default class GambleScene extends Scene {
    public bonusContainer!: Phaser.GameObjects.Container;
    public spinContainer!: Phaser.GameObjects.Container;
    SoundManager!: SoundManager;
    SceneBg!: Phaser.GameObjects.Sprite;
    backCards!: Phaser.GameObjects.Sprite[]; // Array to hold all back cards
    DealerCard!: Phaser.GameObjects.Sprite;
    doubleButton!: Phaser.GameObjects.Sprite;
    collecButton!: Phaser.GameObjects.Sprite;
    winBg!: Phaser.GameObjects.Sprite;
    currentWinningText!: Phaser.GameObjects.Text; // Text to display current winning
    isGambleResultRequested: boolean = false; // Flag to ensure the message is sent only once
    doubleButtonText!: Phaser.GameObjects.Text
    collectButtonText!: Phaser.GameObjects.Text
    riskLogo!: Phaser.GameObjects.Sprite
    panelBg!:Phaser.GameObjects.Sprite
    constructor() {
        super({ key: 'GambleScene' });
        this.backCards = []; // Initialize the back cards array
        this.SoundManager = new SoundManager(this)
    }

    create() {
        console.log("gambleData", gambleData);

        const { width, height } = this.cameras.main;
        this.bonusContainer = this.add.container();
        this.SceneBg = new Phaser.GameObjects.Sprite(this, width / 2, height / 2, 'GambleBg')
            .setDisplaySize(width, height)
            .setDepth(11)
            .setInteractive();
        
        this.SceneBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            pointer.event.stopPropagation();
        });

        this.anims.create({
            key: 'winPanelAnimation',
            frames: [
                { key: 'winPanel' },
                { key: 'winPanel1' }
            ],
            frameRate: 2, // Adjust the speed as needed
            repeat: -1 // Repeat indefinitely
        });

        this.winBg = new Phaser.GameObjects.Sprite(this, width / 2, height / 1.2, "winPanel").setDisplaySize(384,190);
        this.DealerCard = new Phaser.GameObjects.Sprite(this, width * 0.15, height / 2, "BackCard1");
        this.riskLogo = new Phaser.GameObjects.Sprite(this, width/2, height * 0.2, "riskLogo").setScale(0.8, 0.8);
        this.panelBg = new Phaser.GameObjects.Sprite(this, width * 0.8, height * 0.85, "balancePanel").setDisplaySize(500, 72)
        const tipsText = new Phaser.GameObjects.Text(this, width * 0.8, height * 0.85, "PICK ONE OF THE THREE CARDS \n TO CHALLENGE DEALER", {color:"#ffffff", fontSize:"20px", align:"center", fontFamily:"Arial"}).setOrigin(0.5)
        const DealerHeading = new Phaser.GameObjects.Text(this, width * 0.1, height * 0.72, "DEALER", {color: "#ffffff", fontSize:"50px", fontFamily:"Arial"})
        this.winBg.play('winPanelAnimation');
        // Create back cards and add them to the array
        this.backCards.push(
            this.createBackCard(width / 2.6, height / 2, "BackCard1", 0),
            this.createBackCard(width / 1.8, height / 2, "BackCard2", 1),
            this.createBackCard(width / 1.4, height / 2, "BackCard3", 2)
        );
        this.currentWinningText = this.add.text(
            this.winBg.x, this.winBg.y + 25, // Position over winBg
            `${ResultData.playerData.currentWining}`, // Initial text
            { fontSize: '40px', color: '#ffffff' } // Styling
        ).setOrigin(0.5); // Center the text
        this.bonusContainer.add([
            this.SceneBg, this.riskLogo, this.winBg, this.DealerCard, 
            ...this.backCards,
            this.currentWinningText, this.panelBg, tipsText, DealerHeading // Add the text to the container
        ]);
    }

    createBackCard(x: number, y: number, texture: string, index: number): Phaser.GameObjects.Sprite {
        const backCard = new Phaser.GameObjects.Sprite(this, x, y, texture)
            .setScale(0.8)
            .setInteractive();
        backCard.on('pointerdown', () => {
            if (!this.isGambleResultRequested) { // Check if the message has already been sent
                this.isGambleResultRequested = true; // Set the flag to true
                Globals.Socket?.sendMessage("GambleResultData", { id: "GambleInit", GAMBLETYPE: "HIGHCARD" });
                setTimeout(() => {
                    this.handleGambleResult(index);
                }, 300);
            }
        });

        return backCard;
    }

    handleGambleResult(clickedIndex: number) {
        console.log(gambleResult, "gambleResult");
        
        if(!gambleResult.gamleResultData.playerWon){
            this.flipCard(this.DealerCard, gambleData.gambleCards.highCard);
            this.flipCard(this.backCards[clickedIndex], gambleData.gambleCards.lowCard);
            setTimeout(() => {
                Globals.Socket?.sendMessage("GAMBLECOLLECT", {id: "GamleCollect"});
                if (Globals.SceneHandler?.getScene("GambleScene")) {
                    Globals.SceneHandler.removeScene("GambleScene");
                }
            }, 2000);
            
        } else {
            // Player won: Show high card on clicked card and ex cards on the others
            this.flipCard(this.backCards[clickedIndex], gambleData.gambleCards.highCard);
            this.flipCard(this.DealerCard, gambleData.gambleCards.lowCard);
            this.doubleButton = new Phaser.GameObjects.Sprite(this, gameConfig.scale.width * 0.9, gameConfig.scale.height / 2.5, "yesButton").setInteractive();
            this.collecButton = new Phaser.GameObjects.Sprite(this, gameConfig.scale.width * 0.9, gameConfig.scale.height / 1.9, "yesButton").setInteractive();
            this.doubleButtonText = this.add.text(this.doubleButton.x - 80, this.doubleButton.y - 40, "DOUBLE", {fontFamily:"crashLandingItalic", fontSize:"70px", color:"#000000"});
            this.collectButtonText = this.add.text(this.collecButton.x - 85, this.collecButton.y - 40, "COLLECT",  {fontFamily:"crashLandingItalic", fontSize:"70px", color:"#000000"})
            this.collecButton.on('pointerdown', () => {
               Globals.Socket?.sendMessage("GAMBLECOLLECT", {id: "GamleCollect"});
                if (Globals.SceneHandler?.getScene("GambleScene")) {
                    Globals.SceneHandler.removeScene("GambleScene");
                }
            });
            this.doubleButton.on('pointerdown', () => {
                Globals.Socket?.sendMessage("GambleInit", {id: "GambleInit", GAMBLETYPE: "HIGHCARD"});
                this.resetCards();
            });
                this.bonusContainer.add([this.doubleButton, this.collecButton // Add the text to the container
            ]);
        }
        const otherCards = this.backCards.filter((_, idx) => idx !== clickedIndex);
        this.flipCard(otherCards[0], gambleData.gambleCards.exCards[0]);
        this.flipCard(otherCards[1], gambleData.gambleCards.exCards[1]);
        this.updateCurrentWinningText();
    }

    updateCurrentWinningText() {
        let winAmount = gambleResult.gamleResultData.currentWining
        this.currentWinningText.setText(`${winAmount}`);
    }

    flipCard(card: Phaser.GameObjects.Sprite, newCardData: any) {
        this.tweens.add({
            targets: card,
            scaleX: 0, // Flip halfway
            duration: 200,
            onComplete: () => {
                // Change texture when at the halfway point
                card.setTexture(this.getCardTexture(newCardData));
                // Continue the flip
                this.tweens.add({
                    targets: card,
                    scaleX: 0.8, // Back to original scale
                    duration: 200
                });
            }
        });
    }

    getCardTexture(cardData: any) {
        return `${cardData.suit}${cardData.value}`; // Example texture naming
    }

    resetCards() {
        // Logic to reset the cards back to their initial state
        this.backCards.forEach(card => {
            card.setTexture("BackCard1");
            card.setScale(0.8);
        });
        this.DealerCard.setTexture("BackCard1");
        this.isGambleResultRequested = false; // Reset the flag to allow new results
        const elements = [
            this.doubleButton,
            this.collecButton,
            this.doubleButtonText,
            this.collectButtonText
        ];
        elements.forEach(element => {
            element.destroy();
        });
        
    }
}
