class MusicPlayer {
  constructor(preferencesManager) {
    this.musicData = null;
    this.isPlaying = false;
    this.shouldLoop = true;
    this.scheduledTimeouts = [];
    this.startTime = 0;
    this.preferencesManager = preferencesManager;
  }

  async loadMusic(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      this.musicData = data[0].notes;
      DebugLogger.log(`Loaded ${this.musicData.length} notes from music file`);
      return true;
    } catch (error) {
      DebugLogger.error('Failed to load music:', error);
      return false;
    }
  }

  play() {
    if (!this.musicData || this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this.startTime = Date.now();

    // Schedule all notes
    this.musicData.forEach((noteData) => {
      const noteName = Note.midiToNoteName(noteData.pitch);
      const startDelay = noteData.startTime;
      const duration = noteData.duration;

      // Schedule note start
      const startTimeout = setTimeout(() => {
        if (this.isPlaying) {
          Note.start(noteName);
        }
      }, startDelay);
      this.scheduledTimeouts.push(startTimeout);

      // Schedule note stop
      const stopTimeout = setTimeout(() => {
        if (this.isPlaying) {
          Note.stop(noteName);
        }
      }, startDelay + duration);
      this.scheduledTimeouts.push(stopTimeout);
    });

    // Schedule end of playback / loop
    const lastNote = this.musicData[this.musicData.length - 1];
    const totalDuration = lastNote.startTime + lastNote.duration;
    const endTimeout = setTimeout(() => {
      this.onPlaybackEnd();
    }, totalDuration);
    this.scheduledTimeouts.push(endTimeout);
  }

  onPlaybackEnd() {
    if (this.shouldLoop && this.isPlaying) {
      // Clear timeouts and restart
      this.scheduledTimeouts = [];
      this.isPlaying = false; // Reset flag before calling play()
      this.play();
    } else {
      this.isPlaying = false;
    }
  }

  stop() {
    this.isPlaying = false;

    // Clear all scheduled timeouts
    this.scheduledTimeouts.forEach(timeout => clearTimeout(timeout));
    this.scheduledTimeouts = [];

    // Stop all currently playing notes
    Note.stopAll();
  }

  pause() {
    this.isPlaying = false;

    // Clear all scheduled timeouts
    this.scheduledTimeouts.forEach(timeout => clearTimeout(timeout));
    this.scheduledTimeouts = [];

    // Stop all currently playing notes
    Note.stopAll();
  }

  setLoop(shouldLoop) {
    this.shouldLoop = shouldLoop;
  }

  get loaded() {
    return this.musicData !== null;
  }
}

export { MusicPlayer };
