// Web Audio API Automotive Siren & Loud Warning Synthesizer
// Engineered for high-decibel acoustic penetration, vibration, and push notifications

class SoundAlertController {
  private ctx: AudioContext | null = null;
  private isAlarmPlaying = false;
  private isMuted = false;
  private intervalTimer: number | null = null;
  private isUnlocked = false;

  constructor() {
    this.setupInteractionUnlock();
  }

  // Mobile Safari / Chrome auto-unlock on first screen tap or gesture
  private setupInteractionUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      this.initContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      } else {
        this.isUnlocked = true;
      }
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('click', unlock);
      window.removeEventListener('pointerdown', unlock);
    };

    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('pointerdown', unlock, { passive: true });
  }

  public initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
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

  // Piercing beep synthesizer with loud gain curve
  public playBeep(freq = 920, durationMs = 180, type: OscillatorType = 'sawtooth', volume = 0.85) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Rapid envelope with maximum acoustic pressure
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationMs / 1000);
    } catch {
      // Audio playback silently suppressed if browser security policy blocks
    }
  }

  // High-decibel alternating emergency klaxon (950Hz / 1400Hz)
  public startAlarmSiren() {
    if (this.isMuted || this.isAlarmPlaying) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      this.isAlarmPlaying = true;
      let highTone = true;

      // Initial piercing pulse
      this.playTonePair(1000, 1500);

      // Trigger phone vibration pattern (SOS pulse)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([400, 150, 400, 150, 800, 200, 400]);
      }

      this.intervalTimer = window.setInterval(() => {
        if (!this.isAlarmPlaying || this.isMuted) {
          this.stopAlarm();
          return;
        }

        // Alternating frequencies create emergency siren urgency
        if (highTone) {
          this.playBeep(1450, 220, 'sawtooth', 0.9);
        } else {
          this.playBeep(920, 220, 'square', 0.85);
        }
        highTone = !highTone;

        // Pulse phone vibration periodically while alarm sounds
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([250, 100, 250]);
        }
      }, 260);
    } catch {
      this.isAlarmPlaying = false;
    }
  }

  private playTonePair(f1: number, f2: number) {
    this.playBeep(f1, 200, 'square', 0.85);
    setTimeout(() => {
      if (this.isAlarmPlaying) this.playBeep(f2, 200, 'sawtooth', 0.9);
    }, 220);
  }

  public stopAlarm() {
    this.isAlarmPlaying = false;
    if (this.intervalTimer !== null) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(0); // Cancel vibration
    }
  }

  public isAlarmActive(): boolean {
    return this.isAlarmPlaying;
  }

  public isAudioUnlocked(): boolean {
    return this.isUnlocked;
  }

  // 2.5 second loud test siren for user verification
  public testAlarm(durationMs = 2500) {
    this.startAlarmSiren();
    setTimeout(() => {
      this.stopAlarm();
    }, durationMs);
  }
}

export const audioAlert = new SoundAlertController();

// Push Notification Helper
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
}

export function triggerTheftNotification(vehiclePlate: string, dropLiters: number) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  const title = '🚨 CRITICAL THEFT ALERT: DIVINE FUEL';
  const body = `RAPID FUEL DRAIN! -${dropLiters.toFixed(1)}L lost on ${vehiclePlate} with IGNITION OFF! Siren sounding!`;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
        tag: 'divine-fuel-theft',
        requireInteraction: true
      });
    } catch {
      // In mobile PWA service worker mode:
      if (navigator.serviceWorker && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: '/favicon.svg',
            tag: 'divine-fuel-theft',
            requireInteraction: true
          });
        });
      }
    }
  }
}
