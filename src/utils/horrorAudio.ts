// Web Audio API Horror Sound Effects & Ambient Audio Synthesizer
// Completely self-contained, no external mp3 assets required, resilient in all browsers

class HorrorAudioPlayer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Bone Dice Rolling
  playDiceRoll() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 + Math.random() * 300, ctx.currentTime + i * 0.06);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + i * 0.06 + 0.08);

      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.09);
    }
  }

  // Ghost Wail (haunting spectral glide)
  playGhostWail() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 1.2);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 2.0);

    // Vibrato
    lfo.frequency.setValueAtTime(5, ctx.currentTime);
    lfoGain.gain.setValueAtTime(35, ctx.currentTime);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    lfo.start(ctx.currentTime);
    osc.start(ctx.currentTime);
    lfo.stop(ctx.currentTime + 2.3);
    osc.stop(ctx.currentTime + 2.3);
  }

  // Bat Screech & Wing Flutter
  playBatScreech() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // High chirp
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(3800, ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.26);

    // Second fluttering chirp
    setTimeout(() => {
      if (!ctx) return;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2900, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.15);
      gain2.gain.setValueAtTime(0.15, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.19);
    }, 120);
  }

  // Booby Trap Snap & Clatter
  playTrapSnap() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Metallic heavy snap
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.17);

    // Hiss of the snake / trap
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(ctx.currentTime);
  }

  // Spectral Ladder Ascending Chime
  playLadderClimb() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [261.63, 329.63, 392.0, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.32);
    });
  }

  // Ouija Board Nightmare Shocker (terrifying dissonance & sinister descending chime)
  playNightmareShocker() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Dissonant sub blast
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(55, ctx.currentTime);
    bassOsc.frequency.linearRampToValueAtTime(35, ctx.currentTime + 1.2);
    bassGain.gain.setValueAtTime(0.4, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.start(ctx.currentTime);
    bassOsc.stop(ctx.currentTime + 1.6);

    // Eerie horror chord (tritone: A4 + D#5)
    [440, 622.25, 932.33].forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(f * 0.85, ctx.currentTime + 1.8);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.9);
    });

    // Sinister laughter cadence (chuckles)
    for (let i = 0; i < 5; i++) {
      const laughOsc = ctx.createOscillator();
      const laughGain = ctx.createGain();
      laughOsc.type = 'triangle';
      laughOsc.frequency.setValueAtTime(260 - i * 18, ctx.currentTime + 0.35 + i * 0.14);
      laughGain.gain.setValueAtTime(0.2, ctx.currentTime + 0.35 + i * 0.14);
      laughGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35 + i * 0.14 + 0.1);
      laughOsc.connect(laughGain);
      laughGain.connect(ctx.destination);
      laughOsc.start(ctx.currentTime + 0.35 + i * 0.14);
      laughOsc.stop(ctx.currentTime + 0.35 + i * 0.14 + 0.12);
    }
  }

  // Trivia Success Jingle
  playTriviaCorrect() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    [440, 554.37, 659.25, 880].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.27);
    });
  }

  // Trivia Failure Buzz
  playTriviaWrong() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.setValueAtTime(110, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.38);
  }

  // Grand Finish Victory Ceremony
  playGrandTrophyVictory() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const fanfare = [
      { f: 523.25, t: 0.0, d: 0.2 },
      { f: 659.25, t: 0.2, d: 0.2 },
      { f: 783.99, t: 0.4, d: 0.25 },
      { f: 1046.5, t: 0.65, d: 0.6 },
    ];
    fanfare.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.t + n.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + n.t);
      osc.stop(ctx.currentTime + n.t + n.d + 0.05);
    });
  }
}

export const horrorAudio = new HorrorAudioPlayer();
