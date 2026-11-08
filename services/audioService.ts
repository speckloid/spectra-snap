
class AudioService {
  private ctx: AudioContext | null = null;

  constructor() {
    // Try to initialize immediately, but it might stay suspended
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  // Explicitly resume the context - call this on user interaction (button click)
  async resume() {
    if (!this.ctx) {
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            return;
        }
    }
    
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.error("Failed to resume audio context", e);
      }
    }
  }

  private playTone(freq: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth', duration: number, startTime: number = 0) {
    if (!this.ctx) return;
    
    // Ensure context is running if possible (though resume() should be called externally)
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
    
    // Increased volume from 0.1 to 0.3 for better audibility
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  playSuccess() {
    this.playTone(880, 'sine', 0.1, 0); // High A
    this.playTone(1760, 'sine', 0.4, 0.1); // Higher A, ping!
  }

  playFail() {
    this.playTone(150, 'sawtooth', 0.3, 0);
    this.playTone(100, 'sawtooth', 0.5, 0.2); // Descending groan
  }

  playTick() {
    this.playTone(800, 'square', 0.05);
  }
}

export const audioService = new AudioService();
