import Phaser from "phaser";
import { gameConfig } from "./appconfig";
import { LineGenerator } from "./Lines";

export default class LineSymbols extends Phaser.GameObjects.Container{
    numberArr: Phaser.GameObjects.Container[] = [];
    linesGenerator!: LineGenerator; // Reference to LineGenerator
    numberContainers!: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene, yOf: number, xOf: number, linesGenerator: LineGenerator) {
        super(scene);
        this.linesGenerator = linesGenerator;

        // Create number sprites
        for (let i = 0; i < 12; i++) {
            let numberText = this.createNumber(scene, i);
            this.numberArr.push(numberText);
            this.add(numberText);
        }

        this.setPosition(gameConfig.scale.width / 2, gameConfig.scale.height / 2.9);
        // Add this Container to the scene
        scene.add.existing(this);
    }

    createNumber(scene: Phaser.Scene, index: number): Phaser.GameObjects.Container {
        const numberContainer = new Phaser.GameObjects.Container(scene);
        let leftSprite: Phaser.GameObjects.Sprite;
        let rightSprite: Phaser.GameObjects.Sprite;
        let yPosition = (index / 2) * 97.5 - 170; // Adjusted Y position for both sides

        // For left side sprites
        leftSprite = scene.add.sprite(-gameConfig.scale.width / 3.18, yPosition + 100, `number${index}`).setScale(0.8).setOrigin(0.5);
        leftSprite.setInteractive({ useHandCursor: true }).setDepth(5);
        numberContainer.add(leftSprite);

        // For right side sprites
        rightSprite = scene.add.sprite(gameConfig.scale.width / 3.19, yPosition + 100, `number${index}`).setScale(0.8).setOrigin(0.5);
        rightSprite.setInteractive({ useHandCursor: true }).setDepth(5);
        numberContainer.add(rightSprite);

        // Add hover event listeners for the left sprite
        leftSprite.on("pointerover", () => {
            this.showLines(index);
        });
            
        leftSprite.on("pointerout", () => {
            this.hideLines();
        });

        // Add hover event listeners for the right sprite
        rightSprite.on("pointerover", () => {
            this.showLines(index);
        });

        rightSprite.on("pointerout", () => {
            this.hideLines();
        });

        return numberContainer;
    }

    showLines(index: number) {
        this.linesGenerator.showLines([index]); // Show only the line with the specified index
    }

    hideLines() {
        this.linesGenerator.hideLines(); // Hide all lines
    }
}
