// SceneHandler.ts

import { Game, Scene } from "phaser";
import { Globals } from "../scripts/Globals";
import MyEmitter from "./MyEmitter";

export class SceneHandler {
    private game: Phaser.Game;
    private scenes: Map<string, Phaser.Scene> = new Map();

    constructor(game: Phaser.Game) {
        this.game = game;
        Globals.SceneHandler = this; // Store SceneHandler in Globals for global access
        Globals.emitter = new MyEmitter()
    }
    /**
     * Add a scene to the handler.
     * @param key The unique key for the scene.
     * @param sceneClass The scene class to instantiate.
     */
    addScene(key: string, sceneClass: typeof Scene, autoStart: boolean = false) {
        // Check if the scene already exists in Phaser's scene manager
        const existingScene = this.game.scene.getScene(key);
        if (existingScene) {
            // console.log(`Scene with key "${key}" already exists. Destroying the existing scene...`);
            // Stop and remove the existing scene if it exists
            this.game.scene.stop(key);
            this.game.scene.remove(key);
            this.scenes.delete(key);
        }
        const sceneInstance = new sceneClass();
        this.scenes.set(key, sceneInstance);
        this.game.scene.add(key, sceneInstance, autoStart);
    }
    /**
     * Remove a scene from the handler and game.
     * @param key The unique key of the scene to remove.
     */
    removeScene(key: string) {
       if (this.scenes.has(key)) {          
            this.game.scene.remove(key);
            this.scenes.delete(key);
        }
    }
    /**
     * Start a scene.
     * @param key The unique key of the scene to start.
     */
    startScene(key: string) {
        if (this.scenes.has(key)) {
            this.game.scene.start(key);
        } else {
            console.warn(`Scene ${key} does not exist.`);
        }
    }
    /**
     * Stop a scene.
     * @param key The unique key of the scene to stop.
     */
    stopScene(key: string) {
        if (this.scenes.has(key)) {
            this.game.scene.stop(key);
        } else {
            console.warn(`Scene ${key} does not exist.`);
        }
    }
    /**
     * Get a scene instance by key.
     * @param key The unique key of the scene.
     * @returns The scene instance.
     */
    getScene(key: string): Phaser.Scene | undefined {
        return this.scenes.get(key);
    }
    /**
     * recived a message from My Emitter
     */
    recievedMessage(msgType: string, msgParams: any) {
        this.scenes.forEach(scene => {
            if (typeof (scene as any).recievedMessage === 'function') {
                (scene as any).recievedMessage(msgType, msgParams);
            }
        });
    }
}
