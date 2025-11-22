class SoundManager {
  static instance = null;
  static sounds = {};
  static audioContext = null;

  constructor(preferencesManager) {
    if (SoundManager.instance) {
      return SoundManager.instance;
    }
    SoundManager.instance = this;
    this._activeSources = new Set();
    this.preferencesManager = preferencesManager;
  }

  static init(preferencesManager) {
    if (!SoundManager.audioContext) {
      SoundManager.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return new SoundManager(preferencesManager);
  }

  async loadSound(name, url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      DebugLogger.log(`Fetched bytes for ${name}: ${arrayBuffer.byteLength}`);

      const audioBuffer = await SoundManager.audioContext.decodeAudioData(arrayBuffer);

      if (!audioBuffer || audioBuffer.length === 0) {
        DebugLogger.error(`Audio buffer empty for ${name}`);
        return;
      }

      SoundManager.sounds[name] = audioBuffer;
      DebugLogger.log(`Loaded sound: ${name}`);
    } catch (error) {
      DebugLogger.error(`Failed to load sound ${name}:`, error);
    }
  }

  async loadSounds(soundMap) {
    const promises = Object.entries(soundMap).map(([name, url]) =>
      this.loadSound(name, url)
    );
    await Promise.all(promises);
  }

  async play(name, volume = 1.0) {
    const audioBuffer = SoundManager.sounds[name];
    if (!audioBuffer) {
      DebugLogger.warn(`Sound not loaded: ${name}`);
      return;
    }

    if (!SoundManager.audioContext) {
      DebugLogger.warn('Audio context not initialized');
      return;
    }

    // Resume AudioContext if suspended (required by browser autoplay policies)
    DebugLogger.log(`AudioContext state before play: ${SoundManager.audioContext.state}`);

    if (SoundManager.audioContext.state === "suspended") {
      try {
        await SoundManager.audioContext.resume();
        DebugLogger.log('Audio context resumed');
      } catch (error) {
        DebugLogger.error('Failed to resume audio context:', error);
        return;
      }
    }

    try {
      const source = SoundManager.audioContext.createBufferSource();
      source.buffer = audioBuffer;

      // Create gain node for volume control
      // Apply both the base volume and the user's sound effects volume preference
      const gainNode = SoundManager.audioContext.createGain();
      const effectiveVolume = volume * (this.preferencesManager.soundEffectsVolume / 100);
      gainNode.gain.value = effectiveVolume;

      source.connect(gainNode);
      gainNode.connect(SoundManager.audioContext.destination);

      this._activeSources.add(source);
      source.onended = () => this._activeSources.delete(source);

      DebugLogger.log(`Playing sound: ${name}`);

      source.start(0);
    } catch (error) {
      DebugLogger.error(`Failed to play sound ${name}:`, error);
    }
  }

  static async resumeAudioContext() {
    if (SoundManager.audioContext && SoundManager.audioContext.state === 'suspended') {
      try {
        await SoundManager.audioContext.resume();
        DebugLogger.log('Audio context resumed on user interaction');
      } catch (error) {
        DebugLogger.error('Failed to resume audio context:', error);
      }
    }
  }

  static get isLoaded() {
    return Object.keys(SoundManager.sounds).length > 0;
  }
}
