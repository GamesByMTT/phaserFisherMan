import Phaser, { Scene } from "phaser";
import { Globals, initData, ResultData } from "./Globals";
import { gameConfig } from "./appconfig";

export default class InfoScene extends Scene{
    pageviewContainer!: Phaser.GameObjects.Container;
    popupBackground!: Phaser.GameObjects.Sprite
    SceneBg!: Phaser.GameObjects.Sprite
    Symbol1!: Phaser.GameObjects.Sprite
    leftArrow!: Phaser.GameObjects.Sprite
    rightArrow!: Phaser.GameObjects.Sprite
    infoCross!: Phaser.GameObjects.Sprite
    currentPageIndex: number = 0;
    pages: Phaser.GameObjects.Container[] = [];
    constructor(){
        super({key: 'InfoScene'})
    }
    create(){
        const {width, height} =  this.cameras.main
        this.SceneBg = new Phaser.GameObjects.Sprite(this, width / 2, height / 2, 'Background')
        .setDisplaySize(width, height)
        .setDepth(11)
        .setInteractive();
        this.SceneBg.on('pointerdown', (pointer:Phaser.Input.Pointer)=>{
            pointer.event.stopPropagation();
        })
        this.pageviewContainer = this.add.container();
        this.popupBackground = new Phaser.GameObjects.Sprite(this, gameConfig.scale.width/2, gameConfig.scale.height/2, "messagePopup");
        this.pageviewContainer.add(this.popupBackground)
        this.leftArrow = new Phaser.GameObjects.Sprite(this, 300, gameConfig.scale.height/2, "leftArrow").setInteractive().setScale(0.5);
        this.rightArrow = new Phaser.GameObjects.Sprite(this, 1600, gameConfig.scale.height/2, "rightArrow").setInteractive().setScale(0.5);
        this.infoCross = new Phaser.GameObjects.Sprite(this, gameConfig.scale.width * 0.77, gameConfig.scale.height/2-300, "infoCross").setInteractive().setScale(0.7)
        this.infoCross.on('pointerdown', ()=>{
            if(Globals.SceneHandler?.getScene("InfoScene")){
                Globals.SceneHandler.removeScene("InfoScene")
            }
        });
        this.leftArrow.on('pointerdown', ()=>{
            this.goToPreviousPage();
        })
        this.rightArrow.on('pointerdown', ()=>{
            this.goToNextPage()
        })
        this.pageviewContainer.add([this.leftArrow, this.rightArrow, this.infoCross])
        this.pages = []
        this.createPages()

    }
    createPages() {
        // Create pages and add content
        this.pages[1] = this.add.container(0, 0);
        const payTableImage = this.add.sprite(gameConfig.scale.width/2, gameConfig.scale.height/2, "payLines").setScale(1.2)
       
        this.pages[1].add([payTableImage]);
        this.pageviewContainer.add(this.pages[1]);

        this.pages[2] = this.add.container(0, 0);  // Position off-screen initially

        const symbol1 = this.add.sprite(500, 400, "inofIcon1").setScale(0.8)
        const symbol2 = this.add.sprite(900, 400, "inofIcon2").setScale(0.8)
        const symbol3 = this.add.sprite(1250, 400, "inofIcon3").setScale(0.8)
        const symbol4 = this.add.sprite(500, 600, "inofIcon4").setScale(0.8)
        const symbol5 = this.add.sprite(900, 600, "inofIcon5").setScale(0.8)
        const symbol6 = this.add.sprite(1250, 600, "inofIcon6").setScale(0.8)
        const symbol7 = this.add.sprite(900, 800, "inofIcon7").setScale(0.8)
        const infoIcons = [
            { x: 590, y: 400 }, // Position for infoIcon2
            { x: 990, y: 400 }, // Position for infoIcon3
            { x: 1340, y: 400 }, //
            { x: 590, y: 600 }, //
            { x: 990, y: 600 }, //
            { x: 1340, y: 600 }, //
            { x: 990, y: 800 }, //
        ]

         initData.UIData.symbols.forEach((symbol, symbolIndex) => {
            // Get the corresponding infoIcon position
            const iconPosition = infoIcons[symbolIndex];

            if (!iconPosition) return; // Avoid undefined positions

            // Loop through each multiplier in the current symbol
            
            symbol.multiplier.forEach((multiplierValueArray, multiplierIndex, array) => {
                if (Array.isArray(multiplierValueArray)) {
                    const multiplierValue = multiplierValueArray[0];
                    if (multiplierValue > 0) {  // Skip the loop iteration if multiplierValue is 0
                        // Determine the text (e.g., '5x', '4x', '2x')
                        // const prefix = [5, 4, 3][multiplierIndex]; // Customize this if needed
                        const prefix = (5 - multiplierIndex) + "x"; // No need for an array lookup
                        // console.log(multiplierValue, "multiplierValue");
                        let text = `${prefix} - ${multiplierValue} \n`;            
                        // Create the text object
                        const textObject = this.add.text(
                            iconPosition.x, // X position (you might want to offset this)
                            iconPosition.y + multiplierIndex * 60, // Y position (spacing between lines)
                            text,
                            { fontFamily: "GhostKid", fontSize: '40px', color: '#fff' } // Customize text style
                        );
                        // Optionally adjust the position further based on requirements
                        textObject.setLineSpacing(100)
                        textObject.setOrigin(0, 0.5); // Center the text if needed
                        this.pages[2].add(textObject);
                    }
                }
            });
        });

        // const BonusSceneHeading = this.add.text(this.scale.width/2.3, 300, "BONUS GAME", {fontFamily:"GhostKid", color: "#ffffff", fontSize: "80px"})

        // const bonusGameImg = this.add.sprite(this.scale.width/2.9, 550, "BonusScenegame").setScale(0.25)

        // const BonusSceneDescription = this.add.text(this.scale.width/1.95, 430, "Triggers bonus game if 5 icons appear anywhere on the result matrix.", {fontFamily:"GhostKid", align:"center", color: "#ffffff", fontSize: "60px", wordWrap:{ width: 600, useAdvancedWrap: true }})
        
        this.pages[2].add([symbol1, symbol2, symbol3, symbol4, symbol5, symbol6, symbol7])
        this.pageviewContainer.add(this.pages[2]);

        this.pages[3] = this.add.container(0, 0);  // Position off-screen initially

        const symbol8 = this.add.sprite(500, 400, "inofIcon8").setScale(0.8)
        const symbol8Text = this.add.text(600, 300, "Scatter: Offers higher pay outs when 3 or more symbols appear anywhere on the result matrix. Payout: 5x - 600, 4x - 300, 3x-100", {fontFamily:"GhostKid", fontSize:"25px", color: "#ffffff", wordWrap:{ width: 300, useAdvancedWrap: true }})
        const symbol9 = this.add.sprite(1050, 400, "inofIcon9").setScale(0.8)
        const symbol9Text = this.add.text(1150, 300, "Starts a Bonus game for a pay out when 3 or more symbols appear anywhere on the result matrix.", {fontFamily:"GhostKid", fontSize:"25px", color: "#ffffff", wordWrap:{ width: 300, useAdvancedWrap: true }})
        const symbol10 = this.add.sprite(500, 700, "inofIcon10").setScale(0.8);
        const symbol10Text = this.add.text(600, 640, "Substitutes for all symbols except Jackpot, Bonus and Scatter.", {fontFamily:"GhostKid", fontSize:"25px", color: "#ffffff", wordWrap:{ width: 300, useAdvancedWrap: true }})
        const symbol11 = this.add.sprite(1050, 700, "inofIcon11").setScale(0.8)
        const symbol11Text = this.add.text(1150, 640, "Mega win triggered by 5 Jackpot symbols anywhere on the result matrix. Payout: 5000x", {fontFamily:"GhostKid", fontSize:"25px", color: "#ffffff", wordWrap:{ width: 300, useAdvancedWrap: true }})
        // const riskGameHeading = this.add.text(this.scale.width/2.3, 270, "Risk Game", {fontFamily:"GhostKid", color: "#ffffff", fontSize: "80px"})

        // const riskGameImg = this.add.sprite(this.scale.width/2.9, 550, "riskGameimage").setScale(0.25)

        // const riskGameDescription = this.add.text(this.scale.width/1.95, 385, `The player can click the "Double" Button After a win to activate the risk game.  the player faces off against the dealer with the total four cards. the player selects one of three face-down cards first, then the dealer reveals their card, if the player chosen card is higher in value than the delear's card, the players winnings are doubled. If not then player receives nothing.`, {fontFamily:"GhostKid", align:"center", color: "#ffffff", fontSize: "40px", wordWrap:{ width: 550, useAdvancedWrap: true }})
        this.pages[3].add([symbol8, symbol8Text, symbol9, symbol9Text, symbol10, symbol10Text, symbol11, symbol11Text])
        this.pageviewContainer.add(this.pages[3]);

        this.pages[4] = this.add.container(0, 0);

         const BonusSceneHeading = this.add.text(this.scale.width/2, 240, "BONUS GAME", {fontFamily:"GhostKid", color: "#ffffff", fontSize: "60px"}).setOrigin(0.5)

        const bonusGameImg = this.add.sprite(this.scale.width/2, this.scale.height/2, "BonusScenegame").setScale(0.35)

        const BonusSceneDescription = this.add.text(this.scale.width/1.95, 500, "Triggers bonus game if 5 icons appear anywhere on the result matrix.", {fontFamily:"GhostKid", align:"center", color: "#ffffff", fontSize: "60px", wordWrap:{ width: 600, useAdvancedWrap: true }})

        this.pages[4].add([BonusSceneHeading, bonusGameImg, BonusSceneDescription])
        this.pages = [this.pages[1], this.pages[2], this.pages[3], this.pages[4]];
        this.currentPageIndex = 0;
        
        // Set initial visibility 
        this.pages.forEach((page, index) => {
            page.setVisible(index === this.currentPageIndex);
        });
    }

    goToNextPage() {
        if (this.currentPageIndex < this.pages.length - 1) {
            this.pages[this.currentPageIndex].setVisible(false);
            this.currentPageIndex++;
            this.pages[this.currentPageIndex].setVisible(true);
        }
    }

    goToPreviousPage() {
        if (this.currentPageIndex > 0) {
            this.pages[this.currentPageIndex].setVisible(false);
            this.currentPageIndex--;
            this.pages[this.currentPageIndex].setVisible(true);
        }
    }
}