// SoundManager.ts

import Phaser from 'phaser';
import { Globals } from './Globals';

export default class SoundManager {
    private scene: Phaser.Scene;
    public sounds: { [key: string]: Phaser.Sound.BaseSound } = {};
    private soundEnabled: boolean = true;
    private musicEnabled: boolean = true;
    private masterVolume: number = 1; // New property for master volume

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupFocusBlurEvents();
    }

    public addSound(key: string, url: string) {
        if (this.scene.sound.get(key)) {
            this.sounds[key] = this.scene.sound.get(key);
        } else {
            this.sounds[key] = this.scene.sound.add(key, { volume: 0.5 });
        }
    }

    public playSound(key: string) {
        if(this.soundEnabled){
            if (key === 'backgroundMusic' || key ==="bonusBg") {                
                Globals.soundResources[key].loop(true);
                Globals.soundResources[key].play();
            } else {
                Globals.soundResources[key].loop(false); // Ensure looping is off for non-background sounds
                Globals.soundResources[key].play();
            }
        }
    }

    public pauseSound(key: string) {
        Globals.soundResources[key].stop();
    }

    public resumeBgMusic(key: string){
        Globals.soundResources[key].play()
    }

    public stopSound(key: string) {
        if (Globals.soundResources[key]) {
            Globals.soundResources[key].stop();
        }
    }

public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    if (!enabled) {
        // Stop all sounds when sounds is disabled
        Object.values(this.sounds).forEach(sounds => sounds.stop());
    }
}

public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
        // Additional logic for handling music
    if (!enabled) {
        this.stopSound("backgroundMusic")
    }else{
        this.playSound("backgroundMusic")
    }
}
public setMasterVolume(volume: number) {
    Globals.masterVolume = Phaser.Math.Clamp(volume, 0, 1);
    Object.entries(Globals.soundResources).forEach(([key, sound]) => {
        if (key !== 'backgroundMusic') {
            this.applyVolumeToSound(sound);
        }
    });
}

public setVolume(key: string, volume: number) {
    const sound = Globals.soundResources[key];
    if (sound) {
        sound.userVolume = Phaser.Math.Clamp(volume, 0, 1);
        this.applyVolumeToSound(sound);
    }
}

private applyVolumeToSound(sound: Howl & { userVolume?: number }) {
    const finalVolume = Globals.masterVolume * (sound.userVolume || 1);
    sound.volume(finalVolume);
}


public getSound(key: string): Phaser.Sound.BaseSound | undefined {
    return this.sounds[key];
}
private setupFocusBlurEvents() {
    window.addEventListener('blur', () => {
            // console.log("onBlur");
                this.pauseSound('backgroundMusic');
        });

        window.addEventListener('focus', () => {
            this.resumeBgMusic('backgroundMusic');
        });
    }

    public getMasterVolume(): number {
        return this.masterVolume;
    }

    public getSoundVolume(key: string): number {
        const sound = Globals.soundResources[key];
        return sound ? (sound.userVolume || 1) : 1;
    }
}
