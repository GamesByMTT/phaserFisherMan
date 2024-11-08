import Phaser from "phaser";
import BBCodeTextPlugin from "phaser3-rex-plugins/plugins/bbcodetext-plugin";
import MainLoader from "../view/MainLoader";
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT;

export const gameConfig = {   
  type: Phaser.CANVAS,
  scene: [MainLoader],
  antialias: true,
  scale: {
    scaleFactor: 1,
    minScaleFactor: 1,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
    get topY() {
      return (window.innerHeight - this.height * this.scaleFactor) / 2 + 20; // 20px space at top
    },
    get bottomY() {
      return window.innerHeight - this.topY + 20; // 20px space at bottom
    },
    get leftX() {
      return (window.innerWidth - this.width * this.scaleFactor) / 2;
    },
    get rightX() {
      return window.innerWidth - this.leftX;
    },
    get minTopY(): number {
      return (window.innerHeight - (this.width * this.minScaleFactor)) / 2;
    },
    get minBottomY(): number {
      return window.innerHeight - this.minTopY;
    },
    get minLeftX(): number {
      return (window.innerWidth - (this.width* this.minScaleFactor)) / 2;
    },
    get minRightX(): number {
      return window.innerWidth - this.leftX;
    }
  },
  // physics: { 
  //   default: "arcade",
  //   arcade: {
  //     debug: false,
  //   },
  // },

  plugins: {
    global: [
      {
        key: "rexBBCodeTextPlugin",
        plugin: BBCodeTextPlugin,
        start: true,
      },
    ],
  }
  
};

export const CalculateScaleFactor = () => {
  const maxScaleFactor = Math.max(
    window.innerWidth / gameConfig.scale.width,
    window.innerHeight / gameConfig.scale.height
  );

  const minScaleFactor = Math.min(
    window.innerWidth / gameConfig.scale.width,
    window.innerHeight / gameConfig.scale.height
  );

  gameConfig.scale.scaleFactor = maxScaleFactor;
  gameConfig.scale.minScaleFactor = minScaleFactor;

  const canvas = document.querySelector("canvas");
  if (canvas) {
    canvas.style.marginTop = "20px"; // Margin from top
    canvas.style.marginBottom = "20px"; // Margin from bottom
  }
};
export const maxScaleFactor = () =>{
	return Math.max(
		window.innerWidth / gameConfig.scale.width,
		window.innerHeight / gameConfig.scale.height,
	);
};
export const minScaleFactor = () =>{
	return Math.min(
		window.innerWidth / gameConfig.scale.width,
		window.innerHeight / gameConfig.scale.height,
	);
};