// Web Audio API Automotive Siren & Warning Tone Synthesizer
// Clean, zero external assets, strictly client-side sound generation

class SoundAlertController {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private isAlarmPlaying = false;
  private isMuted = false;
  private intervalTimer: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isAlarmPlaying) {
      this.stopAlarm();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playBeep(freq = 880, durationMs = 120, type: OscillatorType = 'square') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio playback silently suppressed if browser blocks unprompted autoplay
    }
  }

  public startAlarmSiren() {
    if (this.isMuted || this.isAlarmPlaying) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      this.isAlarmPlaying = true;
      let highTone = true;

      // Two-tone industrial pulsed siren (800Hz / 1200Hz alternation)
      this.playTonePair(960, 1440);
      this.intervalTimer = window.setInterval(() => {
        if (!this.isAlarmPlaying || this.isMuted) {
          this.stopAlarm();
          return;
        }
        if (highTone) {
          this.playBeep(1320, 220, 'sawtooth');
        } else {
          this.playBeep(880, 220, 'sawtooth');
        }
        highTone = !highTone;
      }, 260);
    } catch {
      this.isAlarmPlaying = false;
    }
  }

  private playTonePair(f1: number, f2: number) {
    this.playBeep(f1, 200, 'square');
    setTimeout(() => {
      if (this.isAlarmPlaying) this.playBeep(f2, 200, 'square');
    }, 220);
  }

  public stopAlarm() {
    this.isAlarmPlaying = false;
    if (this.intervalTimer !== null) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch {
        // Ignored
      }
      this.oscillator = null;
    }
  }

  public isAlarmActive(): boolean {
    return this.isAlarmPlaying;
  }
}

export const audioAlert = new SoundAlertController();
