// Sound utilities for Call Center audio cues

interface SoundConfig {
  volume?: number;
  loop?: boolean;
  preload?: boolean;
}

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private isEnabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    // Initialize sound effects
    const soundConfigs = {
      newOrder: { src: '/sounds/new-order.mp3', volume: 0.6 },
      orderUpdate: { src: '/sounds/order-update.mp3', volume: 0.4 },
      payment: { src: '/sounds/payment.mp3', volume: 0.5 },
      inventoryAlert: { src: '/sounds/inventory-alert.mp3', volume: 0.7 },
      callIncoming: { src: '/sounds/call-incoming.mp3', volume: 0.8 },
      notification: { src: '/sounds/notification.mp3', volume: 0.4 },
      error: { src: '/sounds/error.mp3', volume: 0.6 },
      success: { src: '/sounds/success.mp3', volume: 0.5 },
    };

    Object.entries(soundConfigs).forEach(([key, config]) => {
      this.createSound(key, config.src, config.volume);
    });
  }

  private createSound(name: string, src: string, volume: number = 0.5) {
    try {
      const audio = new Audio(src);
      audio.volume = volume * this.volume;
      audio.preload = 'auto';
      this.sounds.set(name, audio);
    } catch (error) {
      console.warn(`Failed to load sound: ${name}`, error);
    }
  }

  public playSound(soundName: string, config?: SoundConfig) {
    if (!this.isEnabled) return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      try {
        // Reset audio to beginning
        sound.currentTime = 0;
        
        // Apply config if provided
        if (config) {
          if (config.volume !== undefined) {
            sound.volume = config.volume * this.volume;
          }
          if (config.loop !== undefined) {
            sound.loop = config.loop;
          }
        }

        // Play the sound
        const playPromise = sound.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn(`Failed to play sound: ${soundName}`, error);
          });
        }
      } catch (error) {
        console.warn(`Error playing sound: ${soundName}`, error);
      }
    } else {
      console.warn(`Sound not found: ${soundName}`);
    }
  }

  public stopSound(soundName: string) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  public stopAllSounds() {
    this.sounds.forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      sound.volume = sound.volume * this.volume;
    });
  }

  public getVolume(): number {
    return this.volume;
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
    this.stopAllSounds();
  }

  public isSoundEnabled(): boolean {
    return this.isEnabled;
  }

  public preloadSounds() {
    this.sounds.forEach(sound => {
      sound.load();
    });
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Export utility functions
export const playSound = (soundName: string, config?: SoundConfig) => {
  soundManager.playSound(soundName, config);
};

export const stopSound = (soundName: string) => {
  soundManager.stopSound(soundName);
};

export const stopAllSounds = () => {
  soundManager.stopAllSounds();
};

export const setSoundVolume = (volume: number) => {
  soundManager.setVolume(volume);
};

export const getSoundVolume = (): number => {
  return soundManager.getVolume();
};

export const enableSounds = () => {
  soundManager.enable();
};

export const disableSounds = () => {
  soundManager.disable();
};

export const isSoundEnabled = (): boolean => {
  return soundManager.isSoundEnabled();
};

export const preloadSounds = () => {
  soundManager.preloadSounds();
};

// Export the manager instance for advanced usage
export { soundManager }; 