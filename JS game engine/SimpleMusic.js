class Note {
  static notes = {};
  static baseFrequency = 440;
  static noteLetters = 'C C# D D# E F F# G G# A A# B'.split(' ');
  static audioContext = null;

  static initAudioContext() {
    if (!Note.audioContext) {
      Note.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return Note.audioContext;
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

  start() {
    if (!Note.audioContext) {
      Note.initAudioContext();
    }

    // Create gain node for envelope control (prevents clicks)
    this.gainNode = Note.audioContext.createGain();
    this.gainNode.connect(Note.audioContext.destination);

    // Create oscillator
    this.oscillator = new OscillatorNode(Note.audioContext, { type: 'sine', frequency: this.frequency });
    this.oscillator.connect(this.gainNode);

    // Quick fade-in to prevent click at start (5ms)
    const now = Note.audioContext.currentTime;
    this.gainNode.gain.setValueAtTime(0, now);
    this.gainNode.gain.linearRampToValueAtTime(0.3, now + 0.005);

    this.oscillator.start();
  }

  stop() {
    if (!this.oscillator || !this.gainNode) {
      return;
    }

    // Fade out over 20ms to prevent click
    const now = Note.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(0, now + 0.02);

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
    }, 25); // 20ms fade + 5ms buffer
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
