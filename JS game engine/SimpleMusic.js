class Note {
  static notes = {};
  static baseFrequency = 440;
  static noteLetters = 'C C# D D# E F F# G G# A A# B'.split(' ');
  static volume = 0.5; // 0.0 to 1.0

  // Use SoundManager's shared AudioContext instead of creating our own
  static get audioContext() {
    if (typeof SoundManager !== 'undefined' && SoundManager.audioContext) {
      return SoundManager.audioContext;
    }
    return null;
  }

  static setVolume(volume) {
    Note.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
  }

  constructor(note) {
    this.note = note;
    this.frequency = this.getFrequencyFromNote();
    this.oscillator = null;
    this.gainNode = null;
  }

  getFrequencyFromNote() {
    const pitchRegex = /^([A-Ga-g])(#|♯|b|♭)?(\d+)$/;
    const match = pitchRegex.exec(this.note);
    if (!match) {
      throw new Error(`Invalid note: ${this.note}`);
    }
    const noteLetter = match[1].toUpperCase();
    const accidental = match[2];
    const octave = parseInt(match[3], 10);

    const noteIndex = Note.noteLetters.indexOf(noteLetter);
    if (noteIndex === -1) {
      throw new Error(`Invalid note: ${this.note}`);
    }

    let frequency = Note.baseFrequency * Math.pow(2, (noteIndex - 9) / 12 + (octave - 4));

    if (accidental) {
      if (accidental === '#' || accidental === '♯') {
        frequency *= Math.pow(2, 1 / 12);
      } else if (accidental === 'b' || accidental === '♭') {
        frequency /= Math.pow(2, 1 / 12);
      } else {
        throw new Error(`Invalid note: ${this.note}`);
      }
    }

    return frequency;
  }

  async start() {
    if (!Note.audioContext) {
      DebugLogger.error('AudioContext not available - SoundManager may not be initialized');
      return;
    }

    // Resume AudioContext if suspended (required by browser autoplay policies)
    if (Note.audioContext.state === 'suspended') {
      try {
        await Note.audioContext.resume();
      } catch (error) {
        DebugLogger.error('Failed to resume audio context for music:', error);
        return;
      }
    }

    // Create gain node for envelope control (prevents clicks)
    this.gainNode = Note.audioContext.createGain();
    this.gainNode.connect(Note.audioContext.destination);

    // Create oscillator
    this.oscillator = new OscillatorNode(Note.audioContext, { type: 'sine', frequency: this.frequency });
    this.oscillator.connect(this.gainNode);

    // Fade-in to prevent click at start (50ms for smoother attack)
    const now = Note.audioContext.currentTime;
    const targetVolume = Note.volume > 0 ? Note.volume : 0.001; // Ensure > 0 for exponential ramp
    this.gainNode.gain.setValueAtTime(0.001, now); // Start from very quiet for exponential
    this.gainNode.gain.exponentialRampToValueAtTime(targetVolume, now + 0.05);

    this.oscillator.start();
  }

  stop() {
    if (!this.oscillator || !this.gainNode) {
      return;
    }

    // Exponential fade out over 50ms to prevent click (sounds more natural)
    const now = Note.audioContext.currentTime;
    const fadeTime = 0.05; // 50ms fade-out

    this.gainNode.gain.cancelScheduledValues(now);
    const currentGain = this.gainNode.gain.value;
    this.gainNode.gain.setValueAtTime(currentGain > 0 ? currentGain : 0.01, now);
    // Use exponential ramp to near-zero (can't use exact 0 with exponential)
    this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + fadeTime);

    // Stop and disconnect after fade-out completes
    setTimeout(() => {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
    }, (fadeTime * 1000) + 10); // fadeTime in ms + small buffer
  }

  static start(noteName) {
    if (noteName == null) {
      return;
    }
    Note.stop(noteName);
    const note = new Note(noteName);
    note.start();
    Note.notes[noteName] = note;
  }
  
  static stop(noteName) {
    if (!(noteName in Note.notes)) {
      return;
    }
    const note = Note.notes[noteName];
    note.stop();
    delete Note.notes[noteName];
  }

  static stopAll() {
    for (const noteName in Note.notes) {
      Note.stop(noteName);
    }
  }

  static midiToNoteName(midiNumber) {
    // MIDI note 60 is C4 (middle C)
    const octave = Math.floor(midiNumber / 12) - 1;
    const noteIndex = midiNumber % 12;
    const noteLetter = Note.noteLetters[noteIndex];
    return `${noteLetter}${octave}`;
  }
}
