import { Scene, GameObjects } from 'phaser';
import {TextStyle as globalTextStyle} from './Globals'

export class TextLabel extends GameObjects.Text {
    defaultColor: string;

    constructor(scene: Scene, x: number, y: number, textToShow: string, size: number, defaultColor: string = '#ffffff', font: string = 'Inter') {
        const style = {
            ...globalTextStyle,
            fontFamily: 'Poplar Regular',
            fontSize: `${size}px`,
            color: defaultColor,
            fill: defaultColor,
            align: 'center',
        };
        super(scene, x, y, textToShow, style);
    
        this.defaultColor = defaultColor;

        // Set the anchor
        this.setOrigin(0.5, 0.5);

        // Add this text object to the scene
        scene.add.existing(this);
    }
    /**
     * @method updateLabelText update the text on UI Container
     * @param text String passed from Mainscene or UiContainer
     */
    updateLabelText(text: string) {
        this.setText(text);
    }
    /**
     * @method setTextColor used to add color on textLabel
     * @param color passed the value from MaineScene or UiContainer
     */
    setTextColor(color: string) {
        this.setColor(color);
    }
}
