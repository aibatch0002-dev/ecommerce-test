/**
 * Web Audio API Commercial Synthesizer & Music Engine
 * Supports multiple commercial themes, custom MP3/audio playback, real-time waveform analysis, and stream capture.
 */

import { MusicTrackId } from '../types.ts';

class CommercialAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private timerId: number | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private customAudioElement: HTMLAudioElement | null = null;
  private customAudioSource: MediaElementAudioSourceNode | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public resumeContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getStreamDestination(): MediaStreamAudioDestinationNode {
    this.init();
    if (!this.destinationNode && this.ctx && this.masterGain) {
      this.destinationNode = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.destinationNode);
    }
    return this.destinationNode!;
  }

  public setVolume(volume: number, muted: boolean) {
    if (!this.masterGain || !this.ctx) return;
    const target = muted ? 0 : Math.max(0, Math.min(1, volume));
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    if (this.customAudioElement) {
      this.customAudioElement.volume = muted ? 0 : Math.max(0, Math.min(1, volume));
    }
  }

  public getAnalyserData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(16);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  /**
   * Starts playing selected commercial theme or custom audio
   */
  public startCommercialTheme(
    totalDurationSeconds: number = 15,
    trackId: MusicTrackId = 'festive',
    customAudioUrl?: string
  ) {
    this.init();
    this.resumeContext();
    if (!this.ctx || !this.masterGain) return;
    this.stopCommercialTheme();
    this.isPlaying = true;

    // If custom audio provided
    if (trackId === 'custom' && customAudioUrl) {
      this.playCustomAudio(customAudioUrl, totalDurationSeconds);
      return;
    }

    const ctx = this.ctx;
    const master = this.masterGain;
    const startTime = ctx.currentTime + 0.05;

    if (trackId === 'festive') {
      this.playFestiveBanglaTheme(ctx, master, startTime, totalDurationSeconds);
    } else if (trackId === 'acoustic') {
      this.playAcousticCorporateTheme(ctx, master, startTime, totalDurationSeconds);
    } else if (trackId === 'orchestral') {
      this.playOrchestralTheme(ctx, master, startTime, totalDurationSeconds);
    } else {
      this.playPopJingleTheme(ctx, master, startTime, totalDurationSeconds);
    }

    // Schedule stop at end
    this.timerId = window.setTimeout(() => {
      this.stopCommercialTheme();
    }, totalDurationSeconds * 1000 + 400);
  }

  private playCustomAudio(url: string, duration: number) {
    if (!this.ctx || !this.masterGain) return;
    try {
      if (!this.customAudioElement) {
        this.customAudioElement = new Audio();
        this.customAudioElement.crossOrigin = 'anonymous';
        this.customAudioSource = this.ctx.createMediaElementSource(this.customAudioElement);
        this.customAudioSource.connect(this.masterGain);
      }
      this.customAudioElement.src = url;
      this.customAudioElement.currentTime = 0;
      this.customAudioElement.play().catch(() => {});

      this.timerId = window.setTimeout(() => {
        if (this.customAudioElement) {
          this.customAudioElement.pause();
        }
      }, duration * 1000);
    } catch {
      // fallback
    }
  }

  /**
   * Track 1: Bangla Supermarket Festive Commercial Theme
   * Energetic festive dhol beat, warm acoustic chords, uplifting melodic bells
   */
  private playFestiveBanglaTheme(ctx: AudioContext, master: GainNode, startTime: number, duration: number) {
    const bpm = 120;
    const beatSec = 60 / bpm;

    // Chords: D Major -> G Major -> A Major -> D Major
    const progressions = [
      { root: 146.83, notes: [293.66, 369.99, 440.0, 587.33] }, // D
      { root: 98.0,   notes: [196.0, 246.94, 293.66, 392.0] },  // G
      { root: 110.0,  notes: [220.0, 277.18, 329.63, 440.0] }, // A
      { root: 146.83, notes: [293.66, 369.99, 440.0, 587.33] }, // D
    ];

    let t = startTime;
    let step = 0;

    while (t < startTime + duration) {
      const chord = progressions[Math.floor(step / 4) % progressions.length];

      // Dhol / Bass drum punch on beat 1 & 3
      if (step % 2 === 0) {
        this.playDholPunch(ctx, master, t);
      } else {
        this.playClap(ctx, master, t);
      }

      // Shaker/tinkling rhythm on every 1/2 beat
      this.playShaker(ctx, master, t);
      this.playShaker(ctx, master, t + beatSec * 0.5);

      // Acoustic melodic strums
      const noteFreq = chord.notes[step % chord.notes.length];
      this.playPluckNote(ctx, master, noteFreq, t, 0.45, 0.35);
      this.playPluckNote(ctx, master, chord.root * 2, t + beatSec * 0.5, 0.3, 0.2);

      // Warm bass foundation
      if (step % 2 === 0) {
        this.playWarmBass(ctx, master, chord.root, t, beatSec * 1.8);
      }

      t += beatSec;
      step++;
    }

    // Festive signature chimes
    this.playSparkleChime(ctx, master, startTime + 0.1);
    this.playSparkleChime(ctx, master, startTime + duration * 0.5);
    this.playSparkleChime(ctx, master, startTime + duration - 1.2);
  }

  /**
   * Track 2: Upbeat Retail Corporate Acoustic
   */
  private playAcousticCorporateTheme(ctx: AudioContext, master: GainNode, startTime: number, duration: number) {
    const bpm = 114;
    const beatSec = 60 / bpm;
    const chordProgressions = [
      { root: 130.81, notes: [261.63, 329.63, 392.0, 523.25] }, // C maj
      { root: 98.0,   notes: [196.0, 246.94, 293.66, 392.0] },  // G maj
      { root: 110.0,  notes: [220.0, 261.63, 329.63, 440.0] },  // A min
      { root: 87.31,  notes: [174.61, 220.0, 261.63, 349.23] }, // F maj
    ];

    let t = startTime;
    let step = 0;
    while (t < startTime + duration) {
      const chord = chordProgressions[Math.floor(step / 4) % chordProgressions.length];
      this.playWarmBass(ctx, master, chord.root, t, beatSec * 0.9);

      // Acoustic strum sequence
      for (let i = 0; i < 4; i++) {
        const strumT = t + (i * beatSec) / 4;
        if (strumT >= startTime + duration) break;
        const note = chord.notes[(step + i) % chord.notes.length];
        this.playPluckNote(ctx, master, note, strumT, 0.25, 0.22);
      }

      // Snare / clap on beat 2 and 4
      if (step % 2 === 1) {
        this.playClap(ctx, master, t);
      } else {
        this.playSoftKick(ctx, master, t);
      }

      t += beatSec;
      step++;
    }

    this.playSparkleChime(ctx, master, startTime + 0.1);
    this.playSparkleChime(ctx, master, startTime + duration - 1.0);
  }

  /**
   * Track 3: Luxury Grand Orchestral Commercial Theme
   */
  private playOrchestralTheme(ctx: AudioContext, master: GainNode, startTime: number, duration: number) {
    const bpm = 100;
    const beatSec = 60 / bpm;
    const chords = [
      { root: 146.83, notes: [293.66, 369.99, 440.0, 587.33] }, // D
      { root: 123.47, notes: [246.94, 293.66, 369.99, 493.88] }, // Bm
      { root: 98.0,   notes: [196.0, 246.94, 293.66, 392.0] },  // G
      { root: 110.0,  notes: [220.0, 277.18, 329.63, 440.0] }, // A
    ];

    let t = startTime;
    let step = 0;
    while (t < startTime + duration) {
      const chord = chords[Math.floor(step / 4) % chords.length];
      this.playWarmBass(ctx, master, chord.root, t, beatSec * 2.0);

      // String-like layered swells
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(chord.notes[0], t);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + beatSec * 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + beatSec * 1.5);

      this.playSoftKick(ctx, master, t);

      t += beatSec;
      step++;
    }

    this.playSparkleChime(ctx, master, startTime + 0.1);
    this.playSparkleChime(ctx, master, startTime + duration - 1.5);
  }

  /**
   * Track 4: Modern Pop Commercial Jingle
   */
  private playPopJingleTheme(ctx: AudioContext, master: GainNode, startTime: number, duration: number) {
    const bpm = 126;
    const beatSec = 60 / bpm;
    const notes = [440, 554.37, 659.25, 880];

    let t = startTime;
    let step = 0;
    while (t < startTime + duration) {
      this.playSoftKick(ctx, master, t);
      if (step % 2 === 1) this.playClap(ctx, master, t);
      this.playShaker(ctx, master, t + beatSec * 0.5);

      const note = notes[step % notes.length];
      this.playPluckNote(ctx, master, note, t, 0.2, 0.28);
      this.playWarmBass(ctx, master, 110, t, beatSec * 0.8);

      t += beatSec;
      step++;
    }

    this.playSparkleChime(ctx, master, startTime + 0.1);
  }

  private playDholPunch(ctx: AudioContext, dest: GainNode, time: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.14);

    gain.gain.setValueAtTime(0.42, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  private playClap(ctx: AudioContext, dest: GainNode, time: number) {
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(time);
    noise.stop(time + 0.08);
  }

  private playWarmBass(ctx: AudioContext, dest: GainNode, freq: number, time: number, duration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.35, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playPluckNote(ctx: AudioContext, dest: GainNode, freq: number, time: number, duration: number, volume: number) {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc2.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.003, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, time);
    filter.Q.setValueAtTime(1.2, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc2.start(time);
    osc.stop(time + duration);
    osc2.stop(time + duration);
  }

  private playSoftKick(ctx: AudioContext, dest: GainNode, time: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.09);

    gain.gain.setValueAtTime(0.38, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(time);
    osc.stop(time + 0.14);
  }

  private playShaker(ctx: AudioContext, dest: GainNode, time: number) {
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(5000, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.09, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  public playSparkleChime(ctx: AudioContext, dest: GainNode, time: number) {
    const frequencies = [1046.5, 1318.5, 1567.98, 2093.0];
    frequencies.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, time + idx * 0.06);

      gain.gain.setValueAtTime(0.001, time + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.14, time + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + idx * 0.06 + 1.2);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(time + idx * 0.06);
      osc.stop(time + idx * 0.06 + 1.2);
    });
  }

  public stopCommercialTheme() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.customAudioElement) {
      this.customAudioElement.pause();
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime + 0.05);
    }
  }

  public speakNarration(text: string, lang: 'bn' | 'en') {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'bn') {
      const bnVoice = voices.find(
        v =>
          v.lang.startsWith('bn') ||
          v.name.toLowerCase().includes('bangla') ||
          v.name.toLowerCase().includes('bengali')
      );
      if (bnVoice) utterance.voice = bnVoice;
      utterance.lang = 'bn-BD';
    } else {
      const enVoice = voices.find(
        v =>
          (v.lang.startsWith('en') && v.name.includes('Natural')) ||
          v.lang === 'en-US' ||
          v.lang === 'en-GB'
      );
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = 'en-US';
    }

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore
    }
  }

  public stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const commercialAudio = new CommercialAudioEngine();
