class RetroSynthAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.lastSoundTime = {};
  }

  init() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {}
  }

  playTone(key, freq, duration, type = 'sine', sweepTo = null, vol = 0.08) {
    if (this.muted || !this.ctx) return;
    const nowMs = performance.now();
    if (this.lastSoundTime[key] && nowMs - this.lastSoundTime[key] < 25) return;
    this.lastSoundTime[key] = nowMs;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;

      osc.type = type;
      const safeFreq = Math.max(35, Math.min(3400, freq));
      osc.frequency.setValueAtTime(safeFreq, t);

      if (sweepTo !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(35, sweepTo), t + duration);
      }

      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {}
  }

  bootArp() {
    [220, 277, 330, 440, 554, 660, 880].forEach((f, i) => {
      setTimeout(() => this.playTone(`boot_${i}`, f, 0.18, 'sine', f * 1.05, 0.1), i * 65);
    });
  }
  paddleHit(isHyper = false) { this.playTone('paddle', isHyper ? 540 : 340, 0.06, 'triangle', isHyper ? 880 : 660, 0.1); }
  aiHit() { this.playTone('ai', 240, 0.06, 'triangle', 440, 0.09); }
  aiStunned() { this.playTone('stun', 700, 0.2, 'sawtooth', 120, 0.14); }
  wallBounce() { this.playTone('wall', 160, 0.04, 'sine', 100, 0.05); }
  brickHit() { this.playTone('bHit', 460, 0.05, 'square', 600, 0.06); }
  brickBreak() { this.playTone('bBreak', 640, 0.08, 'sawtooth', 940, 0.08); }
  tntExplode() { this.playTone('tnt', 130, 0.22, 'sawtooth', 35, 0.16); }
  laserShoot() { this.playTone('laser', 780, 0.06, 'sawtooth', 220, 0.07); }
  railgunBlast() { this.playTone('railgun', 950, 0.35, 'sawtooth', 90, 0.18); }
  arcZap() { this.playTone('arc', 880, 0.06, 'square', 240, 0.07); }
  turretShoot() { this.playTone('turret', 280, 0.12, 'square', 80, 0.08); }
  orbHit() { this.playTone('orb', 880, 0.22, 'sine', 1320, 0.15); }
  shockwaveSound() { this.playTone('shock', 180, 0.2, 'sawtooth', 600, 0.12); }
  shatterSound() { this.playTone('shatter', 900, 0.15, 'triangle', 200, 0.12); }
  acidSizzle() { this.playTone('acid', 320, 0.12, 'sawtooth', 580, 0.08); }
  coinGet() { this.playTone('coin', 740, 0.08, 'sine', 1120, 0.1); }
  powerupGet() { this.playTone('pUp', 520, 0.14, 'triangle', 1040, 0.12); }
  hurt() { this.playTone('hurt', 140, 0.2, 'sawtooth', 40, 0.15); }
  invulnDeflect() { this.playTone('deflect', 620, 0.08, 'sine', 920, 0.09); }
  hyperActive() { this.playTone('hyper', 440, 0.25, 'sawtooth', 880, 0.14); }
  legendaryJingle() {
    [587, 740, 880, 1174].forEach((f, i) => {
      setTimeout(() => this.playTone(`leg_${i}`, f, 0.2, 'triangle', f * 1.05, 0.14), i * 90);
    });
  }
  goalScored(isHyper = false) {
    const freqs = isHyper ? [523, 659, 784, 1046, 1318] : [440, 554, 659, 880];
    freqs.forEach((f, i) => setTimeout(() => this.playTone(`goal_${i}`, f, 0.18, 'sawtooth', f * 1.05, 0.12), i * 55));
  }
  serveBeep() { this.playTone('serve', 580, 0.07, 'sine', 880, 0.08); }
  levelCleared() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.playTone(`win_${i}`, f, 0.15, 'triangle', f * 1.04, 0.11), i * 75));
  }
  sectorTitleChime() {
    [330, 440, 660].forEach((f, i) => setTimeout(() => this.playTone(`sec_${i}`, f, 0.3, 'sine', f * 1.02, 0.1), i * 120));
  }
  gameOverTone() {
    [440, 330, 220].forEach((f, i) => setTimeout(() => this.playTone(`lose_${i}`, f, 0.22, 'sawtooth', f * 0.8, 0.12), i * 110));
  }
  cardDraftChime() {
    [659, 880, 1046].forEach((f, i) => setTimeout(() => this.playTone(`card_${i}`, f, 0.12, 'sine', f * 1.06, 0.09), i * 80));
  }

  reactorAlarm() { this.playTone('rAlarm', 650, 0.12, 'sawtooth', 350, 0.12); }
  reactorBreached() {
    [180, 120, 60, 35].forEach((f, i) => {
      setTimeout(() => this.playTone(`rBreach_${i}`, f, 0.35, 'sawtooth', 30, 0.18), i * 70);
    });
  }
  swarmAlert() {
    [320, 480, 640].forEach((f, i) => {
      setTimeout(() => this.playTone(`swarm_${i}`, f, 0.1, 'sine', f * 1.2, 0.09), i * 60);
    });
  }
  protocolChosen() {
    [440, 554, 659, 880, 1108].forEach((f, i) => {
      setTimeout(() => this.playTone(`proto_${i}`, f, 0.25, 'triangle', f * 1.05, 0.15), i * 85);
    });
  }
  missileShoot() { this.playTone('missile', 420, 0.16, 'sawtooth', 720, 0.09); }
  orbitalStrike() { this.playTone('orbital', 1200, 0.45, 'sawtooth', 60, 0.2); }

  // New audio triggers for build depth, dash, casino & speed
  dashWhoosh() {
    this.playTone('dash', 380, 0.14, 'sawtooth', 80, 0.16);
  }
  wheelSpin() {
    this.playTone('spin', 520, 0.04, 'triangle', 640, 0.06);
  }
  wheelWin() {
    [523, 659, 784, 1046].forEach((f, i) => {
      setTimeout(() => this.playTone(`spinwin_${i}`, f, 0.16, 'sine', f * 1.05, 0.12), i * 65);
    });
  }
  wheelLose() {
    [240, 180, 120].forEach((f, i) => {
      setTimeout(() => this.playTone(`spinlose_${i}`, f, 0.2, 'sawtooth', f * 0.8, 0.12), i * 85);
    });
  }
  jackpotFanfare() {
    [440, 554, 659, 880, 1108, 1318, 1760].forEach((f, i) => {
      setTimeout(() => this.playTone(`jackpot_${i}`, f, 0.35, 'triangle', f * 1.08, 0.18), i * 80);
    });
  }
  criticalHit() {
    this.playTone('crit', 980, 0.1, 'square', 1400, 0.14);
  }
  overdriveActive() {
    this.playTone('overdrive', 480, 0.25, 'triangle', 720, 0.1);
  }

  // Cyber Heist Audio Triggers
  heistAlarm() {
    [480, 680, 480, 680].forEach((f, i) => {
      setTimeout(() => this.playTone(`heist_${i}`, f, 0.12, 'sawtooth', f * 1.1, 0.11), i * 85);
    });
  }
  cacheBreach() {
    [740, 960, 1280].forEach((f, i) => {
      setTimeout(() => this.playTone(`breach_${i}`, f, 0.14, 'square', f * 1.25, 0.13), i * 50);
    });
  }
  nodeShatter() {
    this.playTone('shatterNode', 820, 0.18, 'sawtooth', 140, 0.15);
  }
  systemOverride() {
    [880, 1108, 1318, 1760].forEach((f, i) => {
      setTimeout(() => this.playTone(`override_${i}`, f, 0.22, 'square', 240, 0.16), i * 70);
    });
  }
  stopAllLoops() {
    // Graceful cutoff for any scheduled intervals/timers
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

window.audio = new RetroSynthAudio();
