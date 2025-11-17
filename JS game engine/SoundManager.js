class SoundManager {
  static instance = null;
  static sounds = {};
  static audioContext = null;

  constructor() {
    if (SoundManager.instance) {
      return SoundManager.instance;
    }
    SoundManager.instance = this;
  }

  static init() {
    if (!SoundManager.audioContext) {
      SoundManager.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return new SoundManager();
  }

  async loadSound(name, url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await SoundManager.audioContext.decodeAudioData(arrayBuffer);
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
    if (SoundManager.audioContext.state === 'suspended') {
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
      const gainNode = SoundManager.audioContext.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(SoundManager.audioContext.destination);

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
