import Phaser from 'phaser';
import { Scene, GameObjects, Types } from 'phaser';
import { Globals, ResultData, currentGameData, initData } from './Globals';
import { TextLabel } from './TextLabel';
import { gameConfig } from './appconfig';
import SoundManager from './SoundManager';
// Define UiContainer as a Phaser Scene class
export class UiContainer extends Phaser.GameObjects.Container {
    SoundManager: SoundManager
    spinBtn!: Phaser.GameObjects.Sprite;
    maxbetBtn!: Phaser.GameObjects.Sprite;
    autoBetBtn!: Phaser.GameObjects.Sprite;
    doubleButton!: Phaser.GameObjects.Sprite;
    CurrentBetText!: TextLabel;
    currentWiningText!: TextLabel;
    WiningText!: Phaser.GameObjects.Sprite;
    currentBalanceText!: TextLabel;
    CurrentLineText!: TextLabel;
    pBtn!: Phaser.GameObjects.Sprite;
    mBtn!: Phaser.GameObjects.Sprite;
    linesNumber!: Phaser.GameObjects.Sprite;
    fadeDoubbleButton!: Phaser.GameObjects.Sprite;
    exitBtn!: Phaser.GameObjects.Sprite
    public isAutoSpinning: boolean = false; // Flag to track if auto-spin is active
    betButtonDisable!: Phaser.GameObjects.Container
    private winTween: Phaser.Tweens.Tween | null = null; // Store the win tween

    constructor(scene: Scene, spinCallBack: () => void, soundManager: SoundManager) {
        super(scene);
        scene.add.existing(this); 
        // Initialize UI elements
        this.maxBetInit();
        this.spinBtnInit(spinCallBack);
        this.autoSpinBtnInit(spinCallBack);
        this.lineBtnInit();
        this.winBtnInit();
        this.balanceBtnInit();
        this.BetBtnInit();  ``
        this.linesNumberInit();
        this.SoundManager = soundManager;
    }

    /**
     * @method lineBtnInit Shows the number of lines for example 1 to 20
     */
    lineBtnInit() { 
        const container = this.scene.add.container(0, 0);
        const linePanel = this.scene.add.sprite(0, 0, "lines").setDepth(0);
        linePanel.setOrigin(0.5);
        linePanel.setPosition(gameConfig.scale.width / 3.35, gameConfig.scale.height * 0.93);
        // container.add(lineText);
        this.pBtn = this.createButton('pBtn', gameConfig.scale.width * 0.385, gameConfig.scale.height * 0.93, () => {
            this.buttonMusic("buttonpressed");
            this.pBtn.setTexture('pBtnH');
            this.pBtn.disableInteractive();
            if (!currentGameData.isMoving) {
                currentGameData.currentBetIndex++;
                if (currentGameData.currentBetIndex >= initData.gameData.Bets.length) {
                    currentGameData.currentBetIndex = 0;
                }
                const betAmount = initData.gameData.Bets[currentGameData.currentBetIndex];
                const updatedBetAmount = betAmount * 12;
                this.CurrentLineText.updateLabelText(betAmount);
                this.CurrentBetText.updateLabelText(updatedBetAmount.toFixed(2).toString());
            }
            this.scene.time.delayedCall(200, () => {
                this.pBtn.setTexture('pBtn');
                this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            });
        }).setDepth(8);
        this.mBtn = this.createButton('mBtn', gameConfig.scale.width * 0.21, gameConfig.scale.height * 0.93, ()=>{
            this.buttonMusic("buttonpressed");
            this.mBtn.setTexture('mBtnH');
            this.mBtn.disableInteractive();
            if (!currentGameData.isMoving) {
                currentGameData.currentBetIndex--;
                if (currentGameData.currentBetIndex <= 0) {
                    currentGameData.currentBetIndex = 0;
                }
                const betAmount = initData.gameData.Bets[currentGameData.currentBetIndex];
                const updatedBetAmount = betAmount * 12;
                this.CurrentLineText.updateLabelText(betAmount);
                this.CurrentBetText.updateLabelText(updatedBetAmount.toFixed(2).toString());
            }
            this.scene.time.delayedCall(200, () => {
                this.mBtn.setTexture('mBtn');
                this.mBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            });
        })
        container.add([this.pBtn, this.mBtn]);
        this.CurrentLineText = new TextLabel(this.scene, linePanel.x + 50, linePanel.y, initData.gameData.Bets[currentGameData.currentBetIndex], 35, "#d2bd6a");
        //Line Count
        container.add(this.CurrentLineText).setDepth(1)
    }

    /**
     * @method winBtnInit add sprite and text
     * @description add the sprite/Placeholder and text for winning amount 
     */
    winBtnInit() {
        const winPanel = this.scene.add.sprite(gameConfig.scale.width * 0.705, gameConfig.scale.height * 0.83, 'balancePanel').setScale(0.8)
        const currentWining: any = ResultData.playerData.currentWining.toFixed(2);
        this.currentWiningText = new TextLabel(this.scene, winPanel.x, winPanel.y, currentWining, 40, "#d2bd6a");
        this.WiningText = this.scene.add.sprite(winPanel.x - 100, winPanel.y, "winText").setOrigin(0.5)
        // const winPanelChild = this.scene.add.container(winPanel.x, winPanel.y)
        this.add([ winPanel, this.currentWiningText, this.WiningText]);
    }

    /**
     * @method balanceBtnInit Remaning balance after bet (total)
     * @description added the sprite/placeholder and Text for Total Balance 
     */
    balanceBtnInit() {
        const balancePanel = this.scene.add.sprite(0, 0, 'balanceBox');
        balancePanel.setOrigin(0.5);
        balancePanel.setPosition(gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.17);
        const container = this.scene.add.container(balancePanel.x, balancePanel.y);
        // container.add(balancePanel);
        currentGameData.currentBalance = initData.playerData.Balance;
        const balanceText = this.scene.add.sprite(0, -40, "balanceText")
        const dollar = this.scene.add.sprite(-150, 0, "dollar").setOrigin(0.5).setScale(0.7)
        this.currentBalanceText = new TextLabel(this.scene, 0, 0, currentGameData.currentBalance.toFixed(2), 35, "#ffffff").setOrigin(0.5);
        container.add([dollar, this.currentBalanceText, balanceText,]);
    }
    /**
     * @method spinBtnInit Spin the reel
     * @description this method is used for creating and spin button and on button click the a SPIn emit will be triggered to socket and will deduct the amout according to the bet
     */
    spinBtnInit(spinCallBack: () => void) {
        this.spinBtn = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "spinBtn");
        this.spinBtn = this.createButton('spinBtn', gameConfig.scale.width * 0.87, gameConfig.scale.height/1.1, () => {
            
            if(ResultData.playerData.Balance < initData.gameData.Bets[currentGameData.currentBetIndex]){
                this.lowBalancePopup();
                return
            }
                this.buttonMusic("spinButton");
                if(this.doubleButton){
                    this.doubleButton.destroy();   
                }
            // checking if autoSpining is working or not if it is auto Spining then stop it
            if(this.isAutoSpinning){
                this.autoBetBtn.emit('pointerdown'); // Simulate the pointerdown event
                this.autoBetBtn.emit('pointerup'); // Simulate the pointerup event (if needed)
                return;
            }
        // tween added to scale transition
            this.scene.tweens.add({
                targets: this.spinBtn,
                duration: 100,
                onComplete: () => {
                    // Send message and update the balance
                    Globals.Socket?.sendMessage("SPIN", { currentBet: currentGameData.currentBetIndex, currentLines: 9, spins: 1 });
                    currentGameData.currentBalance -= (initData.gameData.Bets[currentGameData.currentBetIndex] * 12);
                    this.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                    // Trigger the spin callback
                    this.onSpin(true);
                    spinCallBack();
                }
            });
        }).setDepth(1);
        this.spinBtn.setScale(1.2)
    }

    /**
     * @method maxBetBtn used to increase the bet amount to maximum
     * @description this method is used to add a spirte button and the button will be used to increase the betamount to maximun example on this we have twenty lines and max bet is 1 so the max bet value will be 1X20 = 20
     */
    maxBetInit() {
        this.maxbetBtn =  new Phaser.GameObjects.Sprite(this.scene, 0, 0, 'maxBetBtn')
        this.maxbetBtn = this.createButton('maxBetBtn', gameConfig.scale.width * 0.5, gameConfig.scale.height * 0.92 , () => {
            if (this.SoundManager) {
                this.buttonMusic("buttonpressed");
            }
            this.scene.tweens.add({
                targets: this.maxbetBtn,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                onComplete: ()=>{
                    this.maxbetBtn.setTexture("maxBetBtOnPressed")
                    this.maxbetBtn.disableInteractive()
                    currentGameData.currentBetIndex = initData.gameData.Bets[initData.gameData.Bets.length - 1];
                    this.CurrentBetText.updateLabelText((currentGameData.currentBetIndex*12).toString());
                    this.CurrentLineText.updateLabelText(initData.gameData.Bets[initData.gameData.Bets.length - 1]);
                    this.scene.tweens.add({
                        targets: this.maxbetBtn,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 100,
                        onComplete: ()=>{
                            this.maxbetBtn.setTexture("maxBetBtn");
                            this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true })
                        }
                    })
                    
                }
            })
        }).setDepth(0)   
    }
    /**
     * @method autoSpinBtnInit 
     * @param spinCallBack 
     * @description crete and auto spin button and on that spin button click it change the sprite and called a recursive function and update the balance accroding to that
     */
    autoSpinBtnInit(spinCallBack: () => void) {
        this.autoBetBtn = new Phaser.GameObjects.Sprite(this.scene, 0, 0, "autoSpin");
        this.autoBetBtn = this.createButton(
            'autoSpin',
            this.autoBetBtn.width * 1.1,
            gameConfig.scale.height/1.1,
            () => {
                // this.normalButtonSound.play()
                this.scene.tweens.add({
                    targets: this.autoBetBtn,
                    duration: 100,
                    onComplete: () =>{
                        this.isAutoSpinning = !this.isAutoSpinning; // Toggle auto-spin state
                        if (this.isAutoSpinning && currentGameData.currentBalance > initData.gameData.Bets[currentGameData.currentBetIndex]) {
                            Globals.Socket?.sendMessage("SPIN", {
                                currentBet: currentGameData.currentBetIndex,
                                currentLines : 12
                            });
                            currentGameData.currentBalance -= initData.gameData.Bets[currentGameData.currentBetIndex];
                            this.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                            this.autoSpinRec(true)
                            spinCallBack(); // Callback to indicate the spin has started
                            // Start the spin recursion
                            this.startSpinRecursion(spinCallBack);
                        } else {
                            // Stop the spin if auto-spin is turned off
                            this.autoSpinRec(false);
                        }
                    }
                })
            }
        ).setDepth(0);
        this.autoBetBtn.setScale(0.8)
    }
    /**
     * @method BetBtnInit 
     * @description this method is used to create the bet Button which will show the totla bet which is placed and also the plus and minus button to increase and decrese the bet value
     */
    BetBtnInit() {
        const container = this.scene.add.container(gameConfig.scale.width * 0.3, gameConfig.scale.height * 0.83);
        this.betButtonDisable = container;
        const betPanelHeading = this.scene.add.sprite(-40, 0, "totalBetText").setOrigin(0.5)
        const betPanel = this.scene.add.sprite(0, 0, 'balancePanel').setOrigin(0.5).setDepth(4).setScale(0.8);
        container.add(betPanel);
        this.CurrentBetText = new TextLabel(this.scene, 100, 0, ((initData.gameData.Bets[currentGameData.currentBetIndex]) * 12).toString(), 35, "#d2bd6a").setDepth(6);
        container.add([betPanelHeading, this.CurrentBetText]);
    }
    linesNumberInit(){
        this.linesNumber = this.scene.add.sprite(gameConfig.scale.width * 0.705, gameConfig.scale.height * 0.93 , "lineBox").setOrigin(0.5)
        const totalLines = this.scene.add.text(gameConfig.scale.width * 0.73, gameConfig.scale.height * 0.93, "12", {fontFamily:"GhostKid", fontSize: "35px", color: "#d2bd6a"}).setOrigin(0.5)
    }
   
    /**
     * @method startSpinRecursion
     * @param spinCallBack 
     */
    startSpinRecursion(spinCallBack: () => void) {
        if (this.isAutoSpinning && currentGameData.currentBalance > 0) {
            // this.startFireAnimation();
            // Delay before the next spin
            const delay = currentGameData.isMoving && (ResultData.gameData.symbolsToEmit.length > 0) ? 3000 : 5000;
            this.scene.time.delayedCall(delay, () => {
                if (this.isAutoSpinning && currentGameData.currentBalance >= 0) {
                    Globals.Socket?.sendMessage("SPIN", {
                        currentBet: currentGameData.currentBetIndex,
                        currentLines : 12
                    });
                    currentGameData.currentBalance -= initData.gameData.Bets[currentGameData.currentBetIndex];
                    this.currentBalanceText.updateLabelText(currentGameData.currentBalance.toFixed(2));
                    spinCallBack();
                    // Call the spin recursively
                    this.spinRecursively(spinCallBack);
                }
            });
        }
    }

    spinRecursively(spinCallBack: () => void) {
        if (this.isAutoSpinning) {
            // Perform the spin
            this.autoSpinRec(true);
            if (currentGameData.currentBalance < initData.gameData.Bets[currentGameData.currentBetIndex]) {
                // Stop the spin when a winning condition is met or balance is insufficient
                this.autoSpinRec(false);
                spinCallBack();
            } else {
                // Continue spinning if no winning condition is met and balance is sufficient
                this.startSpinRecursion(spinCallBack);
            }
        }
    }
    
    createButton(key: string, x: number, y: number, callback: () => void): Phaser.GameObjects.Sprite {
        const button = this.scene.add.sprite(x, y, key).setInteractive({ useHandCursor: true, pixelPerfect: true });
        button.on('pointerdown', callback);
        return button;
    }
   
    autoSpinRec(spin: boolean){
        if(spin){
            // this.spinBtn.setTexture("spinBtnOnPressed"); 
            this.spinBtn.setTexture("spinBtn");
            // this.autoBetBtn.setTexture("autoSpinOnPressed");
            this.autoBetBtn.setTexture("autoSpin");
            this.maxbetBtn.disableInteractive();
            this.maxbetBtn.setTexture("maxBetBtOnPressed");
            this.pBtn.disableInteractive();
            this.pBtn.setTexture("pBtnH")
            // this.spinBtn.setAlpha(0.5)
            this.autoBetBtn.setAlpha(0.5)
        }else{
            this.spinBtn.setTexture("spinBtn");
            this.autoBetBtn.setTexture("autoSpin");
            this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.autoBetBtn.setAlpha(1)
            this.pBtn.setTexture("pBtn")
            this.maxbetBtn.setTexture("maxBetBtn");
           
        }        
    }

    onSpin(spin: boolean) {
        // Handle spin functionality
        if(this.isAutoSpinning){
            return
        }
        if(spin){
            this.spinBtn.disableInteractive();
            // this.spinBtn.setTexture("spinBtnOnPressed");
            this.spinBtn.setTexture("spinBtn");
            this.autoBetBtn.setTexture("autoSpin")
            // this.autoBetBtn.setTexture("autoSpinOnPressed")
            this.autoBetBtn.disableInteractive();
            this.maxbetBtn.disableInteractive();
            this.maxbetBtn.setTexture("maxBetBtOnPressed");
            this.pBtn.disableInteractive();
            this.pBtn.setTexture("pBtnH")
            this.spinBtn.setAlpha(0.5)
            this.autoBetBtn.setAlpha(0.5)
            
        }else{
            this.spinBtn.setTexture("spinBtn");
            this.spinBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.autoBetBtn.setTexture("autoSpin");
            this.autoBetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.maxbetBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.maxbetBtn.setTexture("maxBetBtn");
            this.pBtn.setInteractive({ useHandCursor: true, pixelPerfect: true });
            this.pBtn.setTexture("pBtn");
            this.spinBtn.setAlpha(1)
            this.autoBetBtn.setAlpha(1)
        }        
    }

    lowBalancePopup(){
        // Create a semi-transparent background for the popup
        const blurGraphic = this.scene.add.graphics().setDepth(1); // Set depth lower than popup elements
        blurGraphic.fillStyle(0x000000, 0.5); // Black with 50% opacity
        blurGraphic.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height); // Cover entire screen
    
        // Create a container for the popup
        const popupContainer = this.scene.add.container(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        ).setDepth(1); // Set depth higher than blurGraphic
    
        // Popup background image
        const popupBg = this.scene.add.image(0, 0, 'messagePopup').setDepth(10);
        popupBg.setOrigin(0.5);
        popupBg.setDisplaySize(900, 671); // Set the size for your popup background
        popupBg.setAlpha(1); // Set background transparency
   
        this.exitBtn = this.createButton('infoCross', 420, -310, () => { 
            popupContainer.destroy();
            blurGraphic.destroy(); // Destroy blurGraphic when popup is closed
            this.buttonMusic("buttonpressed");
        })
        this.exitBtn.setScale(0.6)
        // Add text to the popup
        const popupText = this.scene.add.text(0, 0, "Your account balance is running low. Please add funds to keep continue.", {color:"#ffffff", fontSize: "40px", fontFamily: 'GhostKid', align:"center",wordWrap: { width: 600, useAdvancedWrap: true }}).setOrigin(0.5);
      
      
        // Add all elements to popupContainer
        popupContainer.add([popupBg, popupText,this.exitBtn]);
        // Add popupContainer to the scene
        this.scene.add.existing(popupContainer);  
    }

    buttonMusic(key: string){
        this.SoundManager.playSound(key)
    }
    update() {
        
    }
    
}
