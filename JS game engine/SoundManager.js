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
      console.log(`Loaded sound: ${name}`);
    } catch (error) {
      console.error(`Failed to load sound ${name}:`, error);
    }
  }

  async loadSounds(soundMap) {
    const promises = Object.entries(soundMap).map(([name, url]) =>
      this.loadSound(name, url)
    );
    await Promise.all(promises);
  }

  play(name, volume = 1.0) {
    const audioBuffer = SoundManager.sounds[name];
    if (!audioBuffer) {
      console.warn(`Sound not loaded: ${name}`);
      return;
    }

    const source = SoundManager.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Create gain node for volume control
    const gainNode = SoundManager.audioContext.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(SoundManager.audioContext.destination);

    source.start(0);
  }

  static get isLoaded() {
    return Object.keys(SoundManager.sounds).length > 0;
  }
}
