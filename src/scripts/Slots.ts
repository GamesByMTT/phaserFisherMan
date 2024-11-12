import Phaser from 'phaser';
import { Globals, ResultData, initData } from "./Globals";
import { gameConfig } from './appconfig';
import { UiContainer } from './UiContainer';
import SoundManager from './SoundManager';
import Disconnection from './Disconecction';
export class Slots extends Phaser.GameObjects.Container {
    slotMask: Phaser.GameObjects.Graphics;
    SoundManager: SoundManager
    slotSymbols: any[][] = [];
    moveSlots: boolean = false;
    uiContainer!: UiContainer;
    // winingMusic!: Phaser.Sound.BaseSound
    resultCallBack: () => void;
    slotFrame!: Phaser.GameObjects.Sprite;
    private maskWidth: number;
    private maskHeight: number;
    private symbolKeys: string[];
    private symbolWidth: number;
    private symbolHeight: number;
    private spacingX: number;
    private spacingY: number;
    private reelContainers: Phaser.GameObjects.Container[] = [];
    private connectionTimeout!: Phaser.Time.TimerEvent;
    private reelTweens: Phaser.Tweens.Tween[] = []; // Array for reel tweens
    private totalVisibleSymbols: number = 3; // Number of visible symbols on the reel
    constructor(scene: Phaser.Scene, uiContainer: UiContainer, callback: () => void, SoundManager : SoundManager) {
        super(scene);

        this.resultCallBack = callback;
        this.uiContainer = uiContainer;
        this.SoundManager = SoundManager
        this.slotMask = new Phaser.GameObjects.Graphics(scene);
        
        this.maskWidth = gameConfig.scale.width;
        this.maskHeight = 560;
        // this.slotMask.fillStyle(0xffffff, 1);
        this.slotMask.fillRoundedRect(0, 0, this.maskWidth, this.maskHeight, 20);
        // mask Position set
        this.slotMask.setPosition(
            gameConfig.scale.width / 5,
            gameConfig.scale.height / 4
        );
        // this.add(this.slotMask);
        // Filter and pick symbol keys based on the criteria
        this.symbolKeys = this.getFilteredSymbolKeys();
        
        // Assume all symbols have the same width and height
        const exampleSymbol = new Phaser.GameObjects.Sprite(scene, 0, 0, this.getRandomSymbolKey());
        this.symbolWidth = exampleSymbol.displayWidth/ 5.1;
        this.symbolHeight = exampleSymbol.displayHeight/5;
        this.spacingX = this.symbolWidth * 5; // Add some spacing
        this.spacingY = this.symbolHeight * 4.5; // Add some spacing
        // console.log(this.symbolHeight, "symbolHeightsymbolHeightsymbolHeight");
        
        const startPos = {
            x: gameConfig.scale.width /3.52,
            y: gameConfig.scale.height / 3.1   
        };
        const totalSymbol = 4;
        const visibleSymbol = 3;
        const startIndex = 1;
        const initialYOffset = (totalSymbol - startIndex - visibleSymbol) * this.spacingY;
        const totalSymbolsPerReel = 16; 
        for (let i = 0; i < 5; i++) { // 5 columns
            const reelContainer = new Phaser.GameObjects.Container(this.scene);
            this.reelContainers.push(reelContainer); // Store the container for future use
            
            this.slotSymbols[i] = [];
            for (let j = 0; j < totalSymbolsPerReel; j++) { // 3 rows
                let symbolKey = this.getRandomSymbolKey(); // Get a random symbol key
                // console.log(symbolKey);
                let slot = new Symbols(scene, symbolKey, { x: i, y: j }, reelContainer);
                slot.symbol.setMask(new Phaser.Display.Masks.GeometryMask(scene, this.slotMask));
                slot.symbol.setPosition(
                    startPos.x + i * (this.spacingX + 11),
                    startPos.y + j * (11 + this.spacingY)
                );
                slot.symbol.setScale(0.75)
                slot.startX = slot.symbol.x;
                slot.startY = slot.symbol.y;
                this.slotSymbols[i].push(slot);
                reelContainer.add(slot.symbol)
            }
            reelContainer.height = this.slotSymbols[i].length * this.spacingY;
            reelContainer.setPosition(reelContainer.x, -initialYOffset);
            this.add(reelContainer); 
        }
    }

    getFilteredSymbolKeys(): string[] {
        // Filter symbols based on the pattern
        const allSprites = Globals.resources;
        const allSpriteKeys = Object.keys(Globals.resources); // Get all keys from Globals.resources
        const filteredSprites = allSpriteKeys.filter(spriteName => {
            const regex = /^slots\d+_\d+$/; // Your original regex is correct
            return regex.test(spriteName);
        });
        return filteredSprites;
    }

    getRandomSymbolKey(): string {
        const randomIndex = Phaser.Math.Between(0, this.symbolKeys.length - 1);        
        return this.symbolKeys[randomIndex];
    }

    moveReel() {    
        this.stopWinningAnimations();
        for (let i = 0; i < this.reelContainers.length; i++) {
            const reelContainer = this.reelContainers[i];
            for (let j = 0; j < this.slotSymbols[i].length; j++) {
                const symbol = this.slotSymbols[i][j];
                
                // Stop the symbol animation
                if (symbol.symbol.anims.isPlaying) {
                    symbol.symbol.anims.stop();
                    symbol.symbol.setTexture(this.updateKeyToZero(symbol.symbol.texture.key));
                }
    
                // Destroy winning sprite if it exists
                if (symbol.winningSprite) {
                    symbol.winningSprite.anims.stop();
                    symbol.winningSprite.destroy();
                    symbol.winningSprite = null;
                }
            }
        }
        // // Clear any remaining winning animations from symbolsToEmit
        if (ResultData.gameData.symbolsToEmit) {
            ResultData.gameData.symbolsToEmit.forEach((rowArray: any) => {
                rowArray.forEach((row: any) => {
                    if (typeof row === "string") {
                        const [y, x] = row.split(",").map((value) => parseInt(value));
                        if (this.slotSymbols[y] && this.slotSymbols[y][x]) {
                            this.slotSymbols[y][x].stopAnimation();
                        }
                    }
                });
            });
        }

        const initialYOffset = (this.slotSymbols[0][0].totalSymbol - this.slotSymbols[0][0].visibleSymbol - this.slotSymbols[0][0].startIndex) * (this.slotSymbols[0][0].spacingY + 11);
        setTimeout(() => {
            for (let i = 0; i < this.reelContainers.length; i++) {
                this.reelContainers[i].setPosition(
                    this.reelContainers[i].x,
                    -initialYOffset // Set the reel's position back to the calculated start position
                );
            }    
        }, 100);
         
        this.moveSlots = true;
        setTimeout(() => {
            for (let i = 0; i < this.reelContainers.length; i++) {
                this.startReelSpin(i);
            }
        }, 100);

        //Setting the Timer for response wait
        this.connectionTimeout = this.scene.time.addEvent({
            delay: 20000, // 20 seconds (adjust as needed)
            callback: this.showDisconnectionScene,
            callbackScope: this // Important for the 'this' context
        });
        this.uiContainer.maxbetBtn.disableInteractive();
    }

    startReelSpin(reelIndex: number) {
        if (this.reelTweens[reelIndex]) {
            this.reelTweens[reelIndex].stop(); 
        }
        const reel = this.reelContainers[reelIndex];
        const spinDistance = this.spacingY * 4; // Adjust this value for desired spin amount 
        // reel.y -= 1;
        this.reelTweens[reelIndex] = this.scene.tweens.add({
            targets: reel,
            y: `+=${spinDistance}`, // Spin relative to current position
            duration: 300, 
            repeat: -1, 
            onComplete: () => {},
        });
    }

    showDisconnectionScene(){
        Globals.SceneHandler?.addScene("Disconnection", Disconnection, true)
    }

    update(time: number, delta: number) {
        if (this.slotSymbols && this.moveSlots) {
            for (let i = 0; i < this.reelContainers.length; i++) {
            }
        }
    }
    
    stopTween() {
        for (let i = 0; i < this.reelContainers.length; i++) { 
            this.stopReel(i);   
        }
    }

    stopReel(reelIndex: number) {
        const reel = this.reelContainers[reelIndex];
        const reelDelay = 300 * (reelIndex + 1);
        const targetSymbolIndex = 0; // Example: Align the first symbol
        const targetY = -targetSymbolIndex * this.symbolHeight; 
        this.scene.tweens.add({
            targets: reel,
            y: targetY, // Animate relative to the current position
            duration: 500,
            // ease: 'Elastic.easeOut',
            ease: 'Cubic.easeOut',
            onComplete: () => {
                if (this.reelTweens[reelIndex]) {
                    this.reelTweens[reelIndex].stop(); 
                }
                if (reelIndex === this.reelContainers.length - 1) {
                    this.playWinAnimations();
                    this.moveSlots = false;
                }
            },
            delay: reelDelay
        });

        if (this.connectionTimeout) { 
            this.connectionTimeout.remove(false);
        }
        for (let j = 0; j < this.slotSymbols[reelIndex].length; j++) {
            this.slotSymbols[reelIndex][j].endTween();
         }
    } 

    playWinAnimations() {
        this.resultCallBack();
        // this.stopWinningAnimations();
        ResultData.gameData.symbolsToEmit.forEach((rowArray: any) => {
            rowArray.forEach((row: any) => {
                if (typeof row === "string") {
                    const [y, x]: number[] = row.split(",").map((value) => parseInt(value));
                    const elementId = ResultData.gameData.ResultReel[x][y];

                    if (this.slotSymbols[y] && this.slotSymbols[y][x]) {
                        this.winMusic("winMusic");
                        // Play the regular symbol animation
                        this.slotSymbols[y][x].playAnimation(`symbol_anim_${elementId}`);

                        // Add winning animation overlay
                        this.playWinningOverlayAnimation(x, y, elementId); 
                    }
                }
            });
        });
        
    }

    playWinningOverlayAnimation(x: number, y: number, elementId: number) {
        // Calculate the position for the winning animation
        const winAnimX = this.slotSymbols[y][x].symbol.x;
        const winAnimY = this.slotSymbols[y][x].symbol.y;
        // Create an array to hold the winning animation frames
        const winningFrames = [];
        for (let i = 0; i < 50; i++) { // Assuming you have 50 frames (winning0 to winning49)
            winningFrames.push({ key: `winning${i}` });
        }

        this.scene.anims.create({
            key: `winningAnim_${elementId}`,
            frames: winningFrames,
            frameRate: 10,
            repeat: -1 
        });

        const targetContainer = this.slotSymbols[y][x].symbol.parentContainer; 
            // Create the winning sprite and add it to the container
            const winningSprite = this.scene.add.sprite(winAnimX, winAnimY, `winning0`)
                .setDepth(12)
                .setScale(0.8, 0.8)
                .setName(`winningSprite_${x}_${y}`);
            targetContainer.add(winningSprite); // Add to the container
            this.slotSymbols[y][x].winningSprite = winningSprite; 
            winningSprite.play(`winningAnim_${elementId}`);
    }

    stopWinningAnimations() {
        this.stopWinMusic('winMusic'); // Stop the win music
        for (let i = 0; i < this.reelContainers.length; i++) { // Iterate through reel containers
            for (let j = 0; j < this.slotSymbols[i].length; j++) {
                const winningSpriteName = `winningSprite_${j}_${i}`; // Correct naming
                const winningSprite = this.reelContainers[i].getByName(winningSpriteName) as Phaser.GameObjects.Sprite; // Get from the correct container
                if (winningSprite) {
                    winningSprite.anims.stop();
                    winningSprite.destroy();
                    this.slotSymbols[i][j].winningSprite = null; // Clear the reference
                }
            }
        }
    }
    winMusic(key: string) {
        if (!this.SoundManager.isSoundPlaying(key)) {
            this.SoundManager.playSound(key);
        }
    }
    stopWinMusic(key: string) {
        if (this.SoundManager.isSoundPlaying(key)) {
            this.SoundManager.stopSound(key);
        }
    }

    private updateKeyToZero(symbolKey: string): string {
        const match = symbolKey.match(/^slots(\d+)_\d+$/);
        if (match) {
            const xValue = match[1];
            return `slots${xValue}_0`;
        }
        return symbolKey;
    }
    
}

// @Sybols CLass
class Symbols {
    symbol: Phaser.GameObjects.Sprite;
    startY: number = 0;
    startX: number = 0;
    startMoving: boolean = false;
    index: { x: number; y: number };
    totalSymbol : number = 7;
    visibleSymbol: number = 3;
    startIndex: number = 1;
    spacingY : number = 204;
    scene: Phaser.Scene;
    private isMobile: boolean;
    reelContainer: Phaser.GameObjects.Container
    private bouncingTween: Phaser.Tweens.Tween | null = null;
    winningSprite: Phaser.GameObjects.Sprite | null = null; 
    constructor(scene: Phaser.Scene, symbolKey: string, index: { x: number; y: number }, reelContainer: Phaser.GameObjects.Container) {
        this.scene = scene;
        this.index = index;
        this.reelContainer = reelContainer
        const updatedSymbolKey = this.updateKeyToZero(symbolKey)
        this.symbol = new Phaser.GameObjects.Sprite(scene, 0, 0, updatedSymbolKey);
        this.symbol.setOrigin(0.5, 0.5);
        this.isMobile = scene.sys.game.device.os.android || scene.sys.game.device.os.iOS;
        // Load textures and create animation
        const textures: string[] = [];
        for (let i = 0; i < 8; i++) {
            textures.push(`${symbolKey}`);
        }  
        // console.log(textures, "textures");
              
        this.scene.anims.create({
            key: `${symbolKey}`,
            frames: textures.map((texture) => ({ key: texture })),
            frameRate: 10,
            repeat: -1,
        });        
    }

    // to update the slotx_0 to show the 0 index image at the end
    updateKeyToZero(symbolKey: string): string {
        const match = symbolKey.match(/^slots(\d+)_\d+$/);
        if (match) {
            const xValue = match[1];
            return `slots${xValue}_0`;
        } else {
            return symbolKey; // Return the original key if format is incorrect
        }
    }
    playAnimation(animationId: any) {
       this.symbol.play(animationId)
    }
    stopAnimation() {
        if (this.symbol.anims.isPlaying) {
            console.log("check playing in Symbol Class or not");
            this.symbol.anims.stop();
        } 
    }
    endTween() {
        if (this.index.y < 3) {
            let textureKeys: string[] = [];
            // Retrieve the elementId based on index
            const elementId = ResultData.gameData.ResultReel[this.index.y][this.index.x];
                for (let i = 0; i < 8; i++) {
                    const textureKey = `slots${elementId}_${i}`;
                    // Check if the texture exists in cache
                    if (this.scene.textures.exists(textureKey)) {
                        textureKeys.push(textureKey);                        
                    } 
                }
                // Check if we have texture keys to set
                    if (textureKeys.length > 0) {
                    // Create animation with the collected texture keys
                        this.scene.anims.create({
                            key: `symbol_anim_${elementId}`,
                            frames: textureKeys.map(key => ({ key })),
                            frameRate: 20,
                            repeat: -1
                        });
                    // Set the texture to the first key and start the animation
                        this.symbol.setTexture(textureKeys[0]);           
                    }
                    this.startMoving = true; 
        }
        // Stop moving and start tweening the sprite's position
        this.scene.time.delayedCall(10, () => { // Example: 50ms delay
            this.startMoving = false; 
        });
    }
    
   
}
