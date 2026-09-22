// ============================================================================
// CYBER-BREAKER: Roguelike Pong & Breakout
// Room Management: Swarm Survival, Quantum Casino, Cyber Heist & Duel
// 100% English Language Contract
// ============================================================================

const CyberHeistState = {
  FLOOR_SETUP: 'FLOOR_SETUP',
  ARENA_INITIALIZATION: 'ARENA_INITIALIZATION',
  SERVE_PREPARATION: 'SERVE_PREPARATION',
  COUNTDOWN: 'COUNTDOWN',
  ACTIVE_GAMEPLAY: 'ACTIVE_GAMEPLAY',
  ENCOUNTER_COMPLETE: 'ENCOUNTER_COMPLETE',
  REWARD: 'REWARD',
  UPGRADE_CHOICE: 'UPGRADE_CHOICE',
  UPGRADE_APPLIED: 'UPGRADE_APPLIED',
  NEXT_FLOOR: 'NEXT_FLOOR'
};

class RoomManager {
  constructor() {
    this.currentRoomType = 'BREAKOUT';
    
    // Swarm Survival System
    this.swarmActive = false;
    this.swarmWave = 1;
    this.swarmMaxWaves = 3;
    this.swarmEnemies = [];
    this.swarmBeacons = [];
    this.swarmWaveCooldown = 0;
    this.swarmMaxActiveDrones = 14;

    // Cyber Heist System (Strategic Digital Vault Infiltration)
    this.heistActive = false;
    this.heistStateMachineState = CyberHeistState.FLOOR_SETUP;
    this.heistFloor = 1;
    this.heistIsEndless = false;
    this.heistSecurityLevel = 1;
    this.heistCaches = [];
    this.heistNodes = [];
    this.heistTotalCaches = 0;
    this.heistBreachedCount = 0;
    this.heistOverclock = 0; // 0 to 100%
    this.heistOverrideActive = false;
    this.heistOverrideTimer = 0;
    this.heistCombos = 0;
    this.heistComboTimer = 0;
    this.heistComboMultiplier = 1.0;
    this.heistScore = 0;
    this.heistChipsGained = 0;
    this.heistLaserBeams = [];
    this.heistPerfectBreachEligible = true;
    this.heistTimer = 30;

    // Run Shop (Underground Data Chip Market)
    this.shopActive = false;
    this.shopInventory = [];
    this.shopRerollCost = 35;

    // Quantum Casino (The Neon Exchange)
    this.casinoActive = false;
    this.casinoSpinsUsed = 0;
    this.casinoMaxSpins = 3;
    this.casinoWheelAngle = 0;
    this.casinoWheelSpeed = 0;
    this.casinoIsSpinning = false;
    this.casinoOutcome = null;
    this.casinoSelectedWager = 'safe';
  }

  // Robust mode lifecycle cleanup: ensures NO state or timers leak between rooms or modes
  cleanupAllRoomState() {
    this.swarmActive = false;
    this.swarmEnemies = [];
    this.swarmBeacons = [];
    this.swarmWaveCooldown = 0;

    this.heistActive = false;
    this.heistCaches = [];
    this.heistNodes = [];
    this.heistLaserBeams = [];
    this.heistOverrideActive = false;
    this.heistOverclock = 0;
    this.heistComboTimer = 0;

    this.shopActive = false;
    this.shopInventory = [];

    this.casinoActive = false;
    this.casinoIsSpinning = false;
    this.casinoOutcome = null;

    if (window.audio && typeof window.audio.stopAllLoops === 'function') {
      window.audio.stopAllLoops();
    }
  }

  // Dynamic cycling between room types supporting Main Game (1-50 + Endless) and 4 Endless Modes
  getRoomTypeForFloor(floor, mode) {
    const activeMode = mode || (typeof window !== 'undefined' && window.activeGameMode) || 'MAIN';

    // 1. DEDICATED ENDLESS MODES
    if (activeMode === 'SWARM_ENDLESS') return 'SWARM';
    if (activeMode === 'DUEL_ENDLESS') return 'DUEL';
    if (activeMode === 'BREAKOUT_ENDLESS') return 'BREAKOUT';
    if (activeMode === 'HEIST_ENDLESS') return 'HEIST';

    // 2. MAIN GAME (LEVEL 1 TO 50 + POST-50 ENDLESS)
    // Major Bosses on every 10th level: 10, 20, 30, 40, 50
    if (floor % 10 === 0) return 'BOSS';

    // Mini Bosses on every 5th level: 5, 15, 25, 35, 45...
    if (floor % 5 === 0) return 'MINI_BOSS';

    // Run Shops right before major & mini bosses: 4, 9, 14, 19, 24, 29, 34, 39, 44, 49
    if (floor % 5 === 4) return 'SHOP';

    // Quantum Casino every 10 levels: 3, 13, 23, 33, 43
    if (floor % 10 === 3) return 'CASINO';

    // Interleaved core room rotation with procedural run-to-run variation:
    // Floor 1 is always Breakout for clean run onboarding
    if (floor === 1) return 'BREAKOUT';

    // Procedural run variation driven by runSeed
    const seed = (typeof window !== 'undefined' && window.currentRunSeed) ? window.currentRunSeed : 1337;
    const roomPool = ['BREAKOUT', 'DUEL', 'SWARM', 'HEIST'];
    // Deterministic hash of floor and run seed
    const hash = ((floor * 37 + seed * 19) ^ (floor * 11)) >>> 0;
    return roomPool[hash % roomPool.length];
  }

  // ==========================================================================
  // SWARM SURVIVAL SYSTEM: POWERSCALED THREAT BUDGETS & BALANCED DIFFICULTY
  // ==========================================================================
  initSwarmSurvival(floor) {
    this.cleanupAllRoomState();
    this.currentFloor = floor || 3;
    this.swarmActive = true;
    this.swarmWave = 1;
    this.swarmMaxWaves = 3;
    this.swarmEnemies = [];
    this.swarmBeacons = [];
    this.swarmWaveCooldown = 0;
    this.scheduleSwarmWave(this.swarmWave, this.currentFloor);
    if (window.audio) window.audio.swarmAlert();
  }

  // Determine current Swarm Threat Level (1 to 4)
  getThreatLevel(floor) {
    const f = floor || this.currentFloor || 3;
    if (f <= 5) return 1;       // Early (Sector 1)
    if (f <= 10) return 2;      // Mid (Sector 1-2)
    if (f <= 15) return 3;      // Late (Sector 2-3)
    return 4;                   // Endgame (Sector 3+)
  }

  // Visual Threat Meter string for HUD badge
  getThreatPips() {
    const lvl = this.getThreatLevel(this.currentFloor);
    if (lvl === 1) return '[██░░░░░░] LVL 1';
    if (lvl === 2) return '[████░░░░] LVL 2';
    if (lvl === 3) return '[██████░░] LVL 3';
    return '[████████] LVL 4';
  }

  // Threat Budget Formula based on floor, wave, and subtle build scaling
  calculateSwarmBudget(floor, waveNumber) {
    const f = floor || this.currentFloor || 3;
    const wIdx = Math.max(0, Math.min(2, waveNumber - 1));

    let baseBudget = 5;
    if (f <= 5) {
      baseBudget = (SWARM_CONFIG && SWARM_CONFIG.baseBudgets.early[wIdx]) || [5, 7, 9][wIdx];
    } else if (f <= 10) {
      baseBudget = (SWARM_CONFIG && SWARM_CONFIG.baseBudgets.mid[wIdx]) || [10, 14, 18][wIdx];
    } else if (f <= 15) {
      baseBudget = (SWARM_CONFIG && SWARM_CONFIG.baseBudgets.late[wIdx]) || [16, 22, 28][wIdx];
    } else {
      baseBudget = (SWARM_CONFIG && SWARM_CONFIG.baseBudgets.endgame[wIdx]) || [22, 30, 38][wIdx];
    }

    // Subtle build-power awareness (does NOT punish, provides engaging target)
    const artifactsCount = (window.collectedArtifacts && window.collectedArtifacts.size) ? window.collectedArtifacts.size : 0;
    const hasPath = window.primaryPath ? 1 : 0;
    const buildBonus = artifactsCount >= 6 ? Math.min(3, Math.floor((artifactsCount - 5) * 0.4)) + hasPath : 0;

    return baseBudget + buildBonus;
  }

  // Compose the wave units using the allocated threat budget
  composeSwarmWave(budget, floor, waveNumber) {
    const f = floor || this.currentFloor || 3;
    const units = [];
    let rem = budget;

    // Floor 3 (Sector 1 Early Introduction):
    // 100% fair, predictable, NO sentinels in wave 1/2, NO kamikazes, NO bastions
    if (f <= 5) {
      if (waveNumber === 1) {
        // Wave 1: exactly 5 basic drones
        for (let i = 0; i < 5; i++) units.push({ type: 'drone', hp: 1, radius: 12 });
        return units;
      } else if (waveNumber === 2) {
        // Wave 2: 5 drones + 1 agile skimmer
        for (let i = 0; i < 5; i++) units.push({ type: 'drone', hp: 1, radius: 12 });
        units.push({ type: 'skimmer', hp: 1, radius: 10 });
        return units;
      } else {
        // Wave 3: 5 drones + 1 solo sentinel to introduce laser telegraph safely
        for (let i = 0; i < 5; i++) units.push({ type: 'drone', hp: 1, radius: 12 });
        units.push({ type: 'sentinel', hp: 2, radius: 18 });
        return units;
      }
    }

    // Floor 6-10 (Sector 1-2 Escalation with Tactical Wave Archetypes):
    if (f <= 10) {
      this.lastSwarmWaveArchetype = (this.lastSwarmWaveArchetype !== undefined) ? this.lastSwarmWaveArchetype + 1 : 0;
      const archetypes = ['balanced', 'skimmer_flank', 'kamikaze_dive'];
      const currentArchetype = archetypes[(this.lastSwarmWaveArchetype + waveNumber) % archetypes.length];

      if (waveNumber === 1) {
        if (currentArchetype === 'skimmer_flank') {
          for (let i = 0; i < 3; i++) units.push({ type: 'drone', hp: 1, radius: 12 });
          for (let i = 0; i < 3; i++) units.push({ type: 'skimmer', hp: 1, radius: 10 });
        } else if (currentArchetype === 'kamikaze_dive') {
          for (let i = 0; i < 3; i++) units.push({ type: 'drone', hp: 1, radius: 12 });
          for (let i = 0; i < 2; i++) units.push({ type: 'kamikaze', hp: 1, radius: 14 });
        } else {
          for (let i = 0; i < 4; i++) units.push({ type: 'drone', hp: 1, radius: 12 });
          units.push({ type: 'skimmer', hp: 1, radius: 10 });
          units.push({ type: 'kamikaze', hp: 1, radius: 14 });
        }
        return units;
      } else if (waveNumber === 2) {
        if (currentArchetype === 'kamikaze_dive') {
          for (let i = 0; i < 3; i++) units.push({ type: 'drone', hp: 1, radius: 12 });
          for (let i = 0; i < 2; i++) units.push({ type: 'kamikaze', hp: 1, radius: 14 });
          units.push({ type: 'sentinel', hp: 3, radius: 18 });
        } else {
          for (let i = 0; i < 4; i++) units.push({ type: 'drone', hp: 1, radius: 12 });
          units.push({ type: 'skimmer', hp: 1, radius: 10 });
          units.push({ type: 'sentinel', hp: 3, radius: 18 });
          units.push({ type: 'kamikaze', hp: 1, radius: 14 });
        }
        return units;
      } else {
        // Wave 3 Peak: 4 drones, 1 skimmer, 1 sentinel, 1 kamikaze, 1 bastion
        for (let i = 0; i < 4; i++) units.push({ type: 'drone', hp: 1, radius: 12 });
        units.push({ type: 'skimmer', hp: 1, radius: 10 });
        units.push({ type: 'sentinel', hp: 3, radius: 18 });
        units.push({ type: 'kamikaze', hp: 1, radius: 14 });
        units.push({ type: 'bastion', hp: 5, radius: 24 });
        return units;
      }
    }

    // Floor 11+ (Late & Endgame):
    // Tactical composition capped at 12 simultaneous units
    const maxDrones = 12;
    if (waveNumber === 3) {
      units.push({ type: 'bastion', hp: f > 15 ? 7 : 5, radius: 24 });
      rem -= 8;
    }
    while (rem >= 4 && units.length < maxDrones - 3) {
      if (Math.random() < 0.5) {
        units.push({ type: 'sentinel', hp: 3, radius: 18 });
        rem -= 4;
      } else {
        units.push({ type: 'kamikaze', hp: 1, radius: 14 });
        rem -= 4;
      }
    }
    while (rem >= 2 && units.length < maxDrones - 1) {
      units.push({ type: 'skimmer', hp: 1, radius: 10 });
      rem -= 2;
    }
    while (rem >= 1 && units.length < maxDrones) {
      units.push({ type: 'drone', hp: 1, radius: 12 });
      rem -= 1;
    }
    return units;
  }

  scheduleSwarmWave(waveNumber, floor) {
    this.swarmWave = waveNumber;
    this.swarmBeacons = [];
    const f = floor || this.currentFloor || 3;

    // Calculate dynamic threat budget & wave composition
    const budget = this.calculateSwarmBudget(f, waveNumber);
    const waveUnits = this.composeSwarmWave(budget, f, waveNumber);

    const formations = ['wall', 'hunt', 'ring'];
    const chosenFormation = formations[(waveNumber - 1) % formations.length];
    const totalCount = waveUnits.length;

    for (let i = 0; i < totalCount; i++) {
      const u = waveUnits[i];
      let targetX = 660;
      let targetY = 90 + (i % 7) * 60;

      if (chosenFormation === 'ring') {
        const ang = (i / totalCount) * Math.PI * 2;
        targetX = 660 + Math.cos(ang) * 115;
        targetY = 300 + Math.sin(ang) * 115;
      } else if (chosenFormation === 'hunt') {
        targetX = 690 + (i % 3) * 45;
        targetY = 120 + i * 40;
      }

      // Safe Spawn Zoning: Guarantee safe boundaries and minimum 450px from player
      targetX = Math.max(580, Math.min(880, targetX));
      targetY = Math.max(75, Math.min(525, targetY));

      this.swarmBeacons.push({
        x: targetX,
        y: targetY,
        timer: 24, // 0.4s fast warp-in
        maxTimer: 24,
        type: u.type,
        isSentinel: u.type === 'sentinel',
        isKamikaze: u.type === 'kamikaze',
        isBastion: u.type === 'bastion',
        isSkimmer: u.type === 'skimmer',
        hp: u.hp,
        radius: u.radius,
        formation: chosenFormation,
        floor: f
      });
    }
  }

  getLivingSwarmEnemyCount() {
    if (!this.swarmEnemies) return 0;
    return this.swarmEnemies.filter(e => e && e.hp > 0 && e.x >= -30 && !e.dead).length;
  }

  // Destruction logic for Swarm enemies with scaling rewards & safe object-reference handling
  destroySwarmEnemy(target, spawnParticles, addFloatingText, awardPoints = true) {
    let i = -1;
    let e = null;
    if (typeof target === 'number') {
      i = target;
      if (i >= 0 && i < this.swarmEnemies.length) e = this.swarmEnemies[i];
    } else if (target && typeof target === 'object') {
      e = target;
      i = this.swarmEnemies.indexOf(target);
    }
    if (i < 0 || !e) return;

    e.dead = true;
    e.hp = 0;

    // Support flexible signature if caller passes (target, awardPointsBoolean)
    if (typeof spawnParticles === 'boolean') {
      awardPoints = spawnParticles;
      spawnParticles = null;
    }

    if (typeof spawnParticles === 'function') {
      const pColor = e.type === 'bastion' ? '#ffd700' : (e.type === 'sentinel' ? '#00b0ff' : (e.type === 'kamikaze' ? '#ef4444' : '#00f2fe'));
      spawnParticles(e.x, e.y, pColor, e.type === 'bastion' ? 24 : 16);
    }
    if (window.audio) {
      if (e.type === 'bastion') window.audio.tntExplode();
      else if (e.type === 'kamikaze') window.audio.tntExplode();
      else window.audio.brickBreak();
    }

    if (awardPoints) {
      const pts = e.type === 'bastion' ? 300 : (e.type === 'sentinel' ? 150 : (e.type === 'kamikaze' ? 75 : (e.type === 'skimmer' ? 60 : 50)));
      
      // Balanced Cores (Gems): Slowed down so +1 GEM feels valuable, while keeping Elites & Bastions rewarding
      const wave = this.swarmWave || 1;
      const combo = (typeof window !== 'undefined' && window.combo) ? window.combo : 0;
      let cores = 0;
      if (e.type === 'bastion') {
        cores = 2 + (Math.random() < 0.6 ? 1 : 0); // 2 to 3 Gems
      } else if (e.type === 'sentinel') {
        cores = 1 + (combo >= 15 && Math.random() < 0.3 ? 1 : 0); // 1 Gem (rarely 2 on high combo)
      } else if (e.type === 'kamikaze') {
        cores = Math.random() < 0.40 ? 1 : 0; // 40% chance for 1 Gem
      } else if (e.type === 'skimmer') {
        cores = Math.random() < 0.25 ? 1 : 0; // 25% chance for 1 Gem
      } else {
        cores = Math.random() < 0.12 ? 1 : 0; // 12% chance for 1 Gem
      }

      // Dynamic Data Chips (5 - 35 Chips)
      let baseChips = 6;
      if (e.type === 'bastion') baseChips = 26 + Math.floor(Math.random() * 8);
      else if (e.type === 'sentinel') baseChips = 16 + Math.floor(Math.random() * 6);
      else if (e.type === 'kamikaze') baseChips = 12 + Math.floor(Math.random() * 5);
      else if (e.type === 'skimmer') baseChips = 9 + Math.floor(Math.random() * 4);
      else baseChips = 5 + Math.floor(Math.random() * 3);
      const waveChipBonus = Math.min(6, (wave - 1) * 2);
      const comboChipBonus = Math.min(8, Math.floor(combo / 3));
      const chips = Math.min(35, baseChips + waveChipBonus + comboChipBonus);

      window.runScore = (window.runScore || 0) + pts;
      if (window.metaSave) {
        window.metaSave.cores = (window.metaSave.cores || 0) + cores;
        window.runCoresEarned = (window.runCoresEarned || 0) + cores;
      }
      if (window.addDataChips) {
        window.addDataChips(chips, e.x, e.y);
      }
      if (typeof addFloatingText === 'function') addFloatingText(`+${cores} 💎 +${chips} 💾`, e.x, e.y, '#ffd700');

      // Chance for item drops (higher on elites)
      const dropRate = e.type === 'bastion' ? 0.75 : (e.type === 'sentinel' ? 0.40 : 0.22);
      if (window.spawnPowerupDrop && Math.random() < dropRate) {
        window.spawnPowerupDrop(e.x, e.y);
      }

      // Bio Contagion spread
      if (e.infected && e.acidChainDepth < POISON_CONFIG.maxChainDepth) {
        let infectedCount = 0;
        for (let oIdx = 0; oIdx < this.swarmEnemies.length; oIdx++) {
          const other = this.swarmEnemies[oIdx];
          if (other !== e && !other.infected && Math.hypot(other.x - e.x, other.y - e.y) < 130) {
            other.infected = true;
            other.acidTicks = POISON_CONFIG.durationTicks;
            other.acidChainDepth = e.acidChainDepth + 1;
            infectedCount++;
            if (infectedCount >= POISON_CONFIG.maxPropagationTargets) break;
          }
        }
      }
    }

    if (i >= 0 && i < this.swarmEnemies.length) {
      this.swarmEnemies.splice(i, 1);
    }
  }

  // Ball vs Swarm collision detection and physics rebound
  checkBallCollision(b, player, spawnParticles, addFloatingText) {
    if (!this.swarmActive || !this.swarmEnemies || this.swarmEnemies.length === 0) return false;

    for (let i = this.swarmEnemies.length - 1; i >= 0; i--) {
      const e = this.swarmEnemies[i];
      const dist = Math.hypot(b.x - e.x, b.y - e.y);
      const minDist = b.radius + e.radius;

      if (dist < minDist) {
        // Collision normal
        const nx = dist > 0 ? (b.x - e.x) / dist : 1;
        const ny = dist > 0 ? (b.y - e.y) / dist : 0;

        // Position ball outside drone radius
        b.x = e.x + nx * (minDist + 1);
        b.y = e.y + ny * (minDist + 1);

        // Damage calculation
        let dmg = (player && player.smashBonus ? player.smashBonus : 1.0);
        if (window.isHyperSpike) dmg *= 2.0;
        if (window.activeBuffs && window.activeBuffs.megaBall > 0) dmg *= 2.5;
        if (window.activeBallTransformation === 'inferno' || (window.activeBuffs && window.activeBuffs.fireball > 0)) dmg += 2;
        if (b.isCritical) dmg *= 2.5;
        dmg = Math.max(1, Math.round(dmg));

        e.hp -= dmg;
        if (addFloatingText) addFloatingText(`-${dmg}`, e.x, e.y - 12, '#ffd700');
        if (spawnParticles) {
          const hitCol = e.type === 'bastion' ? '#ffd700' : (e.type === 'sentinel' ? '#00b0ff' : (e.type === 'kamikaze' ? '#ef4444' : '#00f2fe'));
          spawnParticles(b.x, b.y, hitCol, 10);
        }
        if (window.audio) window.audio.brickBreak();

        // Elemental status effects
        if (window.activeBallTransformation === 'acid' || (window.collectedArtifacts && window.collectedArtifacts.has('bio_residue'))) {
          e.infected = true;
          e.acidTicks = 180;
        }
        if (window.activeBallTransformation === 'cryo' || (window.collectedArtifacts && window.collectedArtifacts.has('cryo_frostbite'))) {
          e.frozen = true;
          if (window.audio) window.audio.shatterSound();
        }

        // Elastic bounce reflection
        const isFire = (window.activeBallTransformation === 'inferno') || (window.activeBuffs && window.activeBuffs.fireball > 0);
        const isMega = window.activeBuffs && window.activeBuffs.megaBall > 0;
        if (!isFire && !isMega) {
          const dot = b.vx * nx + b.vy * ny;
          b.vx = b.vx - 2 * dot * nx;
          b.vy = b.vy - 2 * dot * ny;

          if (Math.abs(b.vx) < 3.5) {
            b.vx = nx < 0 ? -4.5 : 4.5;
          }
        }

        // Drone impulse knockback (bastion resists knockback)
        const kb = e.type === 'bastion' ? -1.5 : -4.0;
        e.vx += nx * kb;
        e.vy += ny * kb;

        // Score & combo
        window.runScore = (window.runScore || 0) + 30;
        window.combo = Math.min(10, (window.combo || 0) + 1);
        window.comboTimer = 220;
        if (window.screenShake !== undefined) window.screenShake = Math.max(window.screenShake, 3);

        if (e.hp <= 0) {
          this.destroySwarmEnemy(i, spawnParticles, addFloatingText);
        }
        return true;
      }
    }
    return false;
  }

  updateSwarm(timeScale, player, balls, lasers, enemyBullets, spawnParticles, addFloatingText) {
    if (!this.swarmActive) return;

    // Process spawning telegraph beacons
    for (let bIdx = this.swarmBeacons.length - 1; bIdx >= 0; bIdx--) {
      const b = this.swarmBeacons[bIdx];
      b.timer -= 1 * timeScale;

      // Allow early ball interception during warp-in
      let warpIntercepted = false;
      if (balls && balls.length > 0) {
        for (let ball of balls) {
          if (Math.hypot(ball.x - b.x, ball.y - b.y) < ball.radius + 18) {
            warpIntercepted = true;
            break;
          }
        }
      }

      if (b.timer <= 0 || warpIntercepted) {
        const eType = b.type || (b.isBastion ? 'bastion' : (b.isSentinel ? 'sentinel' : (b.isKamikaze ? 'kamikaze' : (b.isSkimmer ? 'skimmer' : 'drone'))));
        const initVx = eType === 'bastion' ? -0.7 : (eType === 'sentinel' ? -1.0 : (eType === 'kamikaze' ? -2.4 : (eType === 'skimmer' ? -2.6 : -1.8)));

        this.swarmEnemies.push({
          id: 'swarm_' + Date.now() + '_' + Math.random(),
          type: eType,
          x: b.x,
          y: b.y,
          vx: initVx,
          vy: (Math.random() - 0.5) * 1.5,
          radius: b.radius || (eType === 'bastion' ? 24 : (eType === 'sentinel' ? 18 : (eType === 'kamikaze' ? 14 : (eType === 'skimmer' ? 10 : 12)))),
          hp: b.hp || (eType === 'bastion' ? 5 : (eType === 'sentinel' ? 3 : 1)),
          maxHp: b.hp || (eType === 'bastion' ? 5 : (eType === 'sentinel' ? 3 : 1)),
          acidResistance: eType === 'bastion' ? 0.6 : (eType === 'sentinel' ? 0.4 : 0.0),
          pattern: b.formation,
          phase: Math.random() * Math.PI * 2,
          aimingTimer: 0,
          kamikazeChargeTimer: 0,
          shootCooldown: 120 + Math.floor(Math.random() * 80),
          frozen: false,
          infected: false,
          acidTicks: 0,
          acidChainDepth: 0
        });
        if (typeof window.recordThreatDiscovery === 'function') {
          window.recordThreatDiscovery('swarm_' + eType);
        }
        if (spawnParticles) {
          const spawnCol = eType === 'bastion' ? '#ffd700' : (eType === 'sentinel' ? '#00b0ff' : (eType === 'kamikaze' ? '#ef4444' : '#00f2fe'));
          spawnParticles(b.x, b.y, spawnCol, 10);
        }
        this.swarmBeacons.splice(bIdx, 1);
      }
    }

    // Between-wave breathing window
    if (this.swarmWaveCooldown > 0) {
      this.swarmWaveCooldown -= 1 * timeScale;
      if (this.swarmWaveCooldown <= 0) {
        if (this.swarmWave < this.swarmMaxWaves) {
          this.scheduleSwarmWave(this.swarmWave + 1, this.currentFloor || 3);
          if (window.audio) window.audio.swarmAlert();
          if (addFloatingText) addFloatingText(`WAVE ${this.swarmWave} / ${this.swarmMaxWaves}!`, 500, 300, '#ffd700');
        } else {
          this.swarmActive = false;
          if (window.handleRoomVictory) window.handleRoomVictory();
        }
      }
      return;
    }

    // Check ball collisions against all active drones
    if (balls && balls.length > 0) {
      balls.forEach(b => {
        this.checkBallCollision(b, player, spawnParticles, addFloatingText);
      });
    }

    // Update active swarm enemies
    for (let i = this.swarmEnemies.length - 1; i >= 0; i--) {
      const e = this.swarmEnemies[i];

      // Poison / Acid DoT handling
      if (e.acidTicks > 0) {
        if (e.acidTicks % POISON_CONFIG.tickIntervalTicks === 0) {
          const dmg = Math.max(1, Math.floor(POISON_CONFIG.damagePerTick * (1 - (e.acidResistance || 0))));
          e.hp -= dmg;
          if (window.audio) window.audio.acidSizzle();
          if (spawnParticles) spawnParticles(e.x, e.y, '#00e676', 4);
          if (addFloatingText) addFloatingText(`-${dmg} ACID`, e.x, e.y, '#00e676');
        }
        e.acidTicks--;
      }

      if (e.frozen) {
        if (e.frozenTimer === undefined || e.frozenTimer <= 0) e.frozenTimer = 240;
        e.frozenTimer -= 1 * timeScale;
        if (e.frozenTimer <= 0) {
          e.frozen = false;
          e.frozenTimer = 0;
          if (spawnParticles) spawnParticles(e.x, e.y, '#00f2fe', 10);
          if (window.audio && typeof window.audio.wallBounce === 'function') window.audio.wallBounce();
        }
      }

      e.phase += (e.frozen ? 0.01 : 0.04) * timeScale;

      // Special Skimmer vertical wave
      if (e.type === 'skimmer' && !e.frozen) {
        e.vy = Math.sin(e.phase * 1.5) * 2.2;
      }

      // Natural physics
      e.x += e.vx * timeScale;
      e.y += e.vy * timeScale;

      // Arena boundary bouncing
      if (e.y - e.radius <= 20) {
        e.y = e.radius + 20;
        e.vy = Math.abs(e.vy) || 1.5;
      } else if (e.y + e.radius >= 580) {
        e.y = 580 - e.radius;
        e.vy = -Math.abs(e.vy) || -1.5;
      }

      if (e.x + e.radius >= 980) {
        e.x = 980 - e.radius;
        e.vx = -Math.abs(e.vx);
      }

      // Smooth banking turn-around near left threshold with enforced standoff distance
      const minPlayerDistance = 160;
      const turnX = Math.max(e.type === 'bastion' ? 260 : 180, player.x + player.w + minPlayerDistance);
      if (e.x <= turnX && e.type !== 'kamikaze') {
        e.vx = Math.abs(e.vx) * 0.9 + 1.2;
        e.vy += (e.y < 300 ? 1.5 : -1.5);
      }

      // Enforce minimum combat standoff distance (160px) to stop enemies hugging paddle
      const distToPlayer = Math.hypot(e.x - (player.x + player.w / 2), e.y - (player.y + player.h / 2));
      if (distToPlayer < minPlayerDistance && e.type !== 'kamikaze') {
        e.vx += 0.85;
        e.vy += (e.y < player.y + player.h / 2 ? -1.2 : 1.2);
      }

      // Proximity & Physical Contact with Paddle
      if (e.x - e.radius <= player.x + player.w &&
          e.x + e.radius >= player.x &&
          e.y + e.radius >= player.y &&
          e.y - e.radius <= player.y + player.h) {

        if (player.modifier === 'shock_absorber' || player.path === 'juggernaut') {
          // Juggernaut bash
          e.hp -= 2;
          e.vx = 9;
          if (spawnParticles) spawnParticles(e.x, e.y, '#00e676', 8);
          if (window.audio) window.audio.paddleHit(true);
          if (addFloatingText) addFloatingText('TITAN BASH!', player.x + 40, player.y, '#00e676');
        } else if (e.type === 'kamikaze') {
          // Kamikaze detonation
          e.hp = 0;
          if (spawnParticles) spawnParticles(e.x, e.y, '#ef4444', 16);
          if (window.audio) window.audio.tntExplode();
          if (addFloatingText) addFloatingText('DETONATION!', player.x + 40, player.y, '#ef4444');
          if (player.invulnerableTimer <= 0 && !player.isVoid) {
            if (window.damagePlayer) window.damagePlayer(2, 'kamikaze', e);
            else if (window.playerHurt) window.playerHurt();
          }
        } else {
          // Elastic drone bounce off paddle
          e.hp -= 1;
          e.vx = 7.5;
          if (spawnParticles) spawnParticles(e.x, e.y, '#00f2fe', 6);
          if (window.audio) window.audio.paddleHit();
          if (player.invulnerableTimer <= 0 && !player.isVoid) {
            if (window.damagePlayer) window.damagePlayer(1, 'drone', e);
            else if (window.playerHurt) window.playerHurt();
          }
        }
      }

      // Kamikaze charging behavior
      if (e.type === 'kamikaze' && !e.frozen) {
        if (distToPlayer < 240) {
          e.kamikazeChargeTimer += 1 * timeScale;
          e.vx -= 0.10;
        }
      }

      // Kamikaze off-screen left boundary check: safely detonate/remove so encounter never locks up!
      if (e.type === 'kamikaze' && e.x < -30) {
        if (typeof spawnParticles === 'function') spawnParticles(Math.max(10, e.x), e.y, '#ef4444', 10);
        this.destroySwarmEnemy(e, spawnParticles, addFloatingText, false);
        continue;
      }

      // General boundary safety guard for any enemy flung out of bounds
      if (e.x < -60 || e.y < -60 || e.y > 660 || e.x > 1060) {
        this.destroySwarmEnemy(e, spawnParticles, addFloatingText, false);
        continue;
      }

      // Sentinel telegraphed aiming & shooting
      if (e.type === 'sentinel' && !e.frozen) {
        if (e.aimingTimer > 0) {
          e.aimingTimer -= 1 * timeScale;
          if (e.aimingTimer <= 0) {
            const ang = Math.atan2((player.y + player.h / 2) - e.y, (player.x + player.w) - e.x);
            if (enemyBullets) {
              enemyBullets.push({
                x: e.x - e.radius - 2,
                y: e.y,
                vx: Math.cos(ang) * 4.2,
                vy: Math.sin(ang) * 4.2,
                radius: 5,
                color: '#f43f5e'
              });
            }
            if (window.audio) window.audio.turretShoot();
            e.shootCooldown = 150 + Math.floor(Math.random() * 80);
          }
        } else {
          e.shootCooldown -= 1 * timeScale;
          if (e.shootCooldown <= 36) {
            e.aimingTimer = 36;
          }
        }
      }

      // Heavy Bastion twin-plasma firing
      if (e.type === 'bastion' && !e.frozen) {
        e.shootCooldown = (e.shootCooldown || 160) - 1 * timeScale;
        if (e.shootCooldown <= 0) {
          e.shootCooldown = 180 + Math.floor(Math.random() * 60);
          if (enemyBullets) {
            [-12, 12].forEach(offsetY => {
              enemyBullets.push({
                x: e.x - e.radius - 4,
                y: e.y + offsetY,
                vx: -3.8,
                vy: (offsetY / 28),
                radius: 6,
                color: '#00b0ff'
              });
            });
            if (window.audio) window.audio.turretShoot();
            if (spawnParticles) spawnParticles(e.x - e.radius, e.y, '#00b0ff', 6);
          }
        }
      }

      // Laser collisions with this enemy
      if (lasers && lasers.length > 0) {
        for (let lIdx = lasers.length - 1; lIdx >= 0; lIdx--) {
          const l = lasers[lIdx];
          if (!l.fromPlayer) continue;

          const lHit = (
            l.x + (l.w || 14) >= e.x - e.radius &&
            l.x <= e.x + e.radius &&
            l.y + (l.h || 4) >= e.y - e.radius &&
            l.y <= e.y + e.radius
          );

          if (lHit) {
            const lDmg = l.damage || 1;
            e.hp -= lDmg;
            if (spawnParticles) spawnParticles(l.x, l.y, l.color || '#00e676', 6);
            if (addFloatingText) addFloatingText(`-${lDmg}`, e.x, e.y - 12, l.color || '#00e676');
            if (window.audio) window.audio.paddleHit();

            if (!l.piercing) {
              lasers.splice(lIdx, 1);
            }
            if (e.hp <= 0) break;
          }
        }
      }

      // Enemy destruction check
      if (e.hp <= 0) {
        this.destroySwarmEnemy(e, spawnParticles, addFloatingText);
      }
    }

    // Clean up any remaining flagged or dead enemies
    this.swarmEnemies = this.swarmEnemies.filter(e => e && e.hp > 0 && !e.dead && e.x >= -30);

    // Check wave completion -> grant breathing window & scaling rewards
    const livingEnemies = this.getLivingSwarmEnemyCount();
    if (this.swarmBeacons.length === 0 && livingEnemies === 0 && this.swarmWaveCooldown <= 0) {
      this.swarmWaveCooldown = 120; // 2s breathing window
      const rewardCores = this.swarmWave === 1 ? 10 : (this.swarmWave === 2 ? 15 : 25);
      if (window.metaSave) {
        window.metaSave.cores = (window.metaSave.cores || 0) + rewardCores;
        window.runCoresEarned = (window.runCoresEarned || 0) + rewardCores;
      }
      if (addFloatingText) addFloatingText(`WAVE ${this.swarmWave} CLEARED! +${rewardCores} CORES 💎`, 500, 260, '#00e676');
      if (window.audio) window.audio.protocolChosen();
    }
  }

  drawSwarm(ctx, player) {
    if (!this.swarmActive) return;

    // Draw holographic warning beacons
    this.swarmBeacons.forEach(b => {
      const pct = 1 - (b.timer / b.maxTimer);
      ctx.save();
      const bColor = b.isBastion ? '#ffd700' : (b.isSentinel ? '#00b0ff' : (b.isKamikaze ? '#ef4444' : (b.isSkimmer ? '#10b981' : '#00f2fe')));

      // Rotating targeting reticle
      ctx.strokeStyle = bColor;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(b.x, b.y, (1 - pct) * 32 + 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner crosshair
      ctx.strokeStyle = bColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(b.x - 8, b.y);
      ctx.lineTo(b.x + 8, b.y);
      ctx.moveTo(b.x, b.y - 8);
      ctx.lineTo(b.x, b.y + 8);
      ctx.stroke();

      // Solid central beacon seed
      ctx.fillStyle = bColor;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Holographic label
      ctx.font = '800 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = bColor;
      ctx.fillText(b.isBastion ? '⚠️ ELITE WARP' : 'WARPING...', b.x, b.y - 18);

      ctx.restore();
    });

    // Draw active swarm enemies with SOLID, HIGH-CONTRAST NEON GRAPHICS
    this.swarmEnemies.forEach(e => {
      ctx.save();

      // Sentinel aiming laser telegraph
      if (e.type === 'sentinel' && e.aimingTimer > 0) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(player.x + player.w / 2, player.y + player.h / 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Kamikaze danger aura
      if (e.type === 'kamikaze' && e.kamikazeChargeTimer > 0) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius + 8 + Math.sin(Date.now() * 0.03) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ======================================================================
      // SOLID HIGH-CONTRAST DRONE GRAPHICS BY ENEMY TIER
      // ======================================================================
      if (e.type === 'bastion') {
        // Heavy Armored Elite Bastion Fortress
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#ffd700';

        // Outer Rotating Shield Barrier
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius + 6, (e.phase || 0), (e.phase || 0) + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Heavy Octagonal Hull
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const ang = (k * Math.PI) / 4;
          const px = e.x + Math.cos(ang) * e.radius;
          const py = e.y + Math.sin(ang) * e.radius;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner Plasma Core
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(e.x, e.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Multi-segmented Health Bar above Bastion
        const barW = 40;
        const barH = 5;
        const barX = e.x - barW / 2;
        const barY = e.y - e.radius - 10;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(barX, barY, Math.max(0, barW * (e.hp / e.maxHp)), barH);

      } else if (e.type === 'sentinel') {
        // Armored Titanium Sentinel Bastion
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#00b0ff';

        // Outer Hexagonal Hull
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#00b0ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const ang = (k * Math.PI) / 3;
          const px = e.x + Math.cos(ang) * e.radius;
          const py = e.y + Math.sin(ang) * e.radius;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner Shield Core
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Crimson Cyclops Optic Eye
        ctx.fillStyle = '#ff2a6d';
        ctx.shadowColor = '#ff2a6d';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(e.x - 3, e.y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Health Bar above Sentinel
        const barW = 32;
        const barH = 4;
        const barX = e.x - barW / 2;
        const barY = e.y - e.radius - 8;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
        ctx.fillStyle = '#00b0ff';
        ctx.fillRect(barX, barY, Math.max(0, barW * (e.hp / e.maxHp)), barH);

      } else if (e.type === 'kamikaze') {
        // Solid Molten Crimson Stealth Wedge
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#ef4444';

        // Rear flame thruster exhaust
        const flameLen = 8 + Math.sin(Date.now() * 0.05) * 5;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(e.x + e.radius - 2, e.y - 4);
        ctx.lineTo(e.x + e.radius + flameLen, e.y);
        ctx.lineTo(e.x + e.radius - 2, e.y + 4);
        ctx.closePath();
        ctx.fill();

        // Wedge Body
        const kamikazeGrad = ctx.createLinearGradient(e.x - e.radius, e.y, e.x + e.radius, e.y);
        kamikazeGrad.addColorStop(0, '#f97316');
        kamikazeGrad.addColorStop(0.5, '#ef4444');
        kamikazeGrad.addColorStop(1, '#7f1d1d');

        ctx.fillStyle = kamikazeGrad;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(e.x - e.radius - 2, e.y);
        ctx.lineTo(e.x + e.radius, e.y - e.radius);
        ctx.lineTo(e.x + e.radius * 0.4, e.y);
        ctx.lineTo(e.x + e.radius, e.y + e.radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Core Warning Indicator
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 3.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (e.type === 'skimmer') {
        // Fast Agile Emerald Skimmer
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#10b981';

        // Swept-back Wings
        ctx.fillStyle = '#064e3b';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(e.x + e.radius, e.y);
        ctx.lineTo(e.x - e.radius, e.y - e.radius * 1.1);
        ctx.lineTo(e.x - e.radius * 0.4, e.y);
        ctx.lineTo(e.x - e.radius, e.y + e.radius * 1.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Speed Thrusters
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(e.x - 2, e.y, 3, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Standard Cyber Drone: Solid Metallic Blue/Cyan
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#00f2fe';

        // 4 Mechanical Rotating Stabilizer Wings
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 1.5;
        for (let a = 0; a < 4; a++) {
          const wAng = (e.phase || 0) + a * (Math.PI / 2);
          const wx = e.x + Math.cos(wAng) * (e.radius + 6);
          const wy = e.y + Math.sin(wAng) * (e.radius + 6);
          ctx.beginPath();
          ctx.arc(wx, wy, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(e.x + Math.cos(wAng) * (e.radius * 0.6), e.y + Math.sin(wAng) * (e.radius * 0.6));
          ctx.lineTo(wx, wy);
          ctx.stroke();
        }

        // Solid Drone Chassis Sphere with Gradient
        const droneGrad = ctx.createRadialGradient(e.x - 2, e.y - 2, 2, e.x, e.y, e.radius);
        droneGrad.addColorStop(0, '#38bdf8');
        droneGrad.addColorStop(0.5, '#0284c7');
        droneGrad.addColorStop(1, '#082f49');

        ctx.fillStyle = droneGrad;
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Center Pulsing Cyber Optic Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00f2fe';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cryo Frost status overlay with 4-phase crystalline evolution
      if (e.frozen) {
        if (typeof window.drawFrozenEffect === 'function') {
          window.drawFrozenEffect(ctx, e.x, e.y, e.radius * 2, e.radius * 2, true, e.radius, e.frozenTimer || 120, 240);
        } else {
          ctx.strokeStyle = '#00f2fe';
          ctx.fillStyle = 'rgba(0, 242, 254, 0.25)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius + 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Acid status overlay
      if (e.acidTicks > 0) {
        ctx.strokeStyle = '#00e676';
        ctx.fillStyle = 'rgba(0, 230, 118, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  // ==========================================================================
  // QUANTUM CASINO SYSTEM (THE NEON EXCHANGE) — SINGLE SOURCE OF TRUTH
  // ==========================================================================
  initCasino(floor) {
    this.cleanupAllRoomState();
    this.casinoActive = true;
    this.casinoSpinsUsed = 0;
    this.casinoMaxSpins = 3;
    this.casinoWheelAngle = 0;
    this.casinoWheelSpeed = 0;
    this.casinoIsSpinning = false;
    this.casinoOutcome = null;
    this.casinoSelectedWager = 'safe';
  }

  getCasinoOddsTable(wagerTier) {
    const tier = wagerTier || this.casinoSelectedWager || 'safe';
    const table = (typeof CASINO_TABLES !== 'undefined' && CASINO_TABLES[tier]) ? CASINO_TABLES[tier] : null;
    if (!table) return [];
    const totalWeight = table.segments.reduce((acc, s) => acc + s.weight, 0) || 100;
    return table.segments.map(s => ({
      name: s.label,
      label: s.label,
      icon: s.icon,
      weight: `${s.weight}`,
      pct: Math.round((s.weight / totalWeight) * 100),
      color: s.color,
      type: s.type
    }));
  }

  spinCasinoWheel(wagerTier, player, addFloatingText) {
    if (this.casinoIsSpinning || this.casinoSpinsUsed >= this.casinoMaxSpins) return false;

    const tier = wagerTier || this.casinoSelectedWager || 'safe';
    const table = (typeof CASINO_TABLES !== 'undefined' && CASINO_TABLES[tier]) ? CASINO_TABLES[tier] : null;
    if (!table) return false;

    // Data Chips are the currency for mid-run casino wagers!
    const currentChips = (typeof window !== 'undefined' && window.runDataChips !== undefined) ? window.runDataChips : 0;
    if (currentChips < table.wager) {
      if (addFloatingText) addFloatingText(`NEED ${table.wager} DATA CHIPS! 💾`, 500, 300, '#f43f5e');
      return false;
    }

    if (window.spendDataChips) {
      window.spendDataChips(table.wager);
    } else if (window.runDataChips !== undefined) {
      window.runDataChips = Math.max(0, window.runDataChips - table.wager);
    }

    this.casinoSpinsUsed++;
    this.casinoIsSpinning = true;

    if (window.audio) window.audio.wheelSpin();

    // 1. SELECT WINNING OUTCOME FIRST from defined table weights
    const totalWeight = table.segments.reduce((acc, s) => acc + s.weight, 0);
    let roll = Math.random() * totalWeight;
    let targetIndex = 0;
    for (let i = 0; i < table.segments.length; i++) {
      roll -= table.segments[i].weight;
      if (roll <= 0) {
        targetIndex = i;
        break;
      }
    }
    const chosenSegment = table.segments[targetIndex];

    // 2. MATHEMATICALLY EXACT ANGLE FOR POINTER ALIGNMENT
    // Top pointer is at 12 o'clock (angle 3*PI/2 = -PI/2)
    // Slices i are drawn starting at angle 0: slice i center is at (i + 0.5) * (2*PI / 8)
    const segAng = (Math.PI * 2) / table.segments.length;
    const totalSpins = 4 + Math.floor(Math.random() * 2);
    const targetAngleAtPointer = (Math.PI * 1.5) - ((targetIndex + 0.5) * segAng);
    const finalAngle = totalSpins * Math.PI * 2 + targetAngleAtPointer;

    this.casinoOutcome = chosenSegment;
    return { finalAngle, outcome: chosenSegment, targetIndex, winningIndex: targetIndex };
  }

  applyCasinoOutcome(outcome, player, addFloatingText) {
    this.casinoIsSpinning = false;
    if (!outcome) return;

    if (outcome.type === 'chips') {
      if (window.addDataChips) window.addDataChips(outcome.val, 500, 280);
      if (window.audio) window.audio.wheelWin();
    } else if (outcome.type === 'shield') {
      window.activeBuffs.shieldCharges = Math.min(4, (window.activeBuffs.shieldCharges || 0) + (outcome.val || 1));
      if (window.audio) window.audio.wheelWin();
      if (addFloatingText) addFloatingText(`+${outcome.val || 1} SHIELD! 🛡️`, 500, 280, '#00e676');
    } else if (outcome.type === 'repair') {
      if (player.hp < player.maxHp) player.hp = Math.min(player.maxHp, player.hp + (outcome.val || 1));
      if (window.audio) window.audio.wheelWin();
      if (addFloatingText) addFloatingText('+1 HP REPAIRED! ❤️', 500, 280, '#ff2a6d');
    } else if (outcome.type === 'buff') {
      if (outcome.buff && window.activeBuffs) {
        window.activeBuffs[outcome.buff] = 600;
      }
      if (window.audio) window.audio.hyperActive();
      if (addFloatingText) addFloatingText('SURGE OVERCHARGE! ⚡', 500, 280, '#ffd700');
    } else if (outcome.type === 'upgrade') {
      const available = Object.values(ARTIFACT_DEFINITIONS).filter(a => !window.collectedArtifacts.has(a.id));
      if (available.length > 0) {
        const upg = available[Math.floor(Math.random() * available.length)];
        if (typeof window.addCollectedArtifact === 'function') {
          window.addCollectedArtifact(upg.id);
        } else {
          window.collectedArtifacts.add(upg.id);
          if (typeof window.recordCodexDiscovery === 'function') window.recordCodexDiscovery(upg.id);
        }
        if (addFloatingText) addFloatingText(`ACQUIRED: ${upg.name.toUpperCase()}! 📦`, 500, 280, '#00e676');
      }
      if (window.audio) window.audio.powerupGet();
    } else if (outcome.type === 'curse_hp') {
      player.hp = Math.max(1, (player.hp || 3) - (outcome.val || 1));
      if (window.audio) window.audio.hurt();
      if (addFloatingText) addFloatingText(`SYSTEM SHORT: -${outcome.val || 1} HP! ⚠️`, 500, 280, '#ef4444');
    } else if (outcome.type === 'lose') {
      if (window.audio) window.audio.aiHit();
      if (addFloatingText) addFloatingText('WAGER LOST! ❌', 500, 280, '#94a3b8');
    } else if (outcome.type === 'jackpot') {
      if (window.addDataChips) window.addDataChips(outcome.val, 500, 280);
      window.activeBuffs.shieldCharges = 4;
      if (window.audio) window.audio.jackpotFanfare ? window.audio.jackpotFanfare() : window.audio.hyperActive();
      if (addFloatingText) addFloatingText(`🌟 JACKPOT! +${outcome.val} DATA CHIPS! 🌟`, 500, 250, '#ffd700');
    }
  }

  // ==========================================================================
  // RUN SHOP SYSTEM (UNDERGROUND CYBER MARKET)
  // ==========================================================================
  initShop(floor) {
    this.cleanupAllRoomState();
    this.shopActive = true;
    this.shopFloor = floor || 1;
    this.shopRerollCost = 35;
    this.generateShopInventory();
  }

  generateShopInventory() {
    this.shopInventory = [];
    if (typeof SHOP_ITEMS_POOL === 'undefined') return;

    const pool = [...SHOP_ITEMS_POOL];
    const pPath = window.primaryPath;

    // Favor items matching active build path
    pool.sort((a, b) => {
      const aMatch = pPath && a.desc.toLowerCase().includes(pPath.toLowerCase()) ? 1 : 0;
      const bMatch = pPath && b.desc.toLowerCase().includes(pPath.toLowerCase()) ? 1 : 0;
      return (bMatch - aMatch) + (Math.random() - 0.5);
    });

    const count = Math.min(5, pool.length);
    for (let i = 0; i < count; i++) {
      this.shopInventory.push({
        ...pool[i],
        purchased: false
      });
    }
  }

  buyShopItem(itemIndex, player, addFloatingText) {
    if (!this.shopInventory || !this.shopInventory[itemIndex]) return false;
    const item = this.shopInventory[itemIndex];
    if (item.purchased) return false;

    const currentChips = (typeof window !== 'undefined' && window.runDataChips !== undefined) ? window.runDataChips : 0;
    if (currentChips < item.cost) {
      if (addFloatingText) addFloatingText('NOT ENOUGH DATA CHIPS! 💾', 500, 300, '#f43f5e');
      return false;
    }

    if (window.spendDataChips) {
      window.spendDataChips(item.cost);
    } else if (window.runDataChips !== undefined) {
      window.runDataChips = Math.max(0, window.runDataChips - item.cost);
    }
    item.purchased = true;

    if (item.type === 'upgrade' && item.upgradeId) {
      if (typeof window.addCollectedArtifact === 'function') {
        window.addCollectedArtifact(item.upgradeId);
      } else {
        window.collectedArtifacts.add(item.upgradeId);
        if (typeof window.recordCodexDiscovery === 'function') window.recordCodexDiscovery(item.upgradeId);
      }
      if (addFloatingText) addFloatingText(`ACQUIRED: ${item.name.toUpperCase()}!`, 500, 300, '#00e676');
    } else if (item.type === 'heal') {
      player.hp = Math.min(player.maxHp, player.hp + item.healAmount);
      if (addFloatingText) addFloatingText(`+${item.healAmount} HP REPAIRED! ❤️`, 500, 300, '#ff2a6d');
    } else if (item.type === 'shield') {
      window.activeBuffs.shieldCharges = Math.min(4, (window.activeBuffs.shieldCharges || 0) + item.shieldAmount);
      if (addFloatingText) addFloatingText(`+${item.shieldAmount} SHIELDS! 🛡️`, 500, 300, '#00b0ff');
    } else if (item.type === 'consumable') {
      if (item.buff && window.activeBuffs) window.activeBuffs[item.buff] = item.duration || 1800;
      if (addFloatingText) addFloatingText(`${item.name.toUpperCase()} ACTIVE! ⚡`, 500, 300, '#ffd700');
    } else if (item.type === 'chips') {
      const awarded = Math.floor(item.minChips + Math.random() * (item.maxChips - item.minChips));
      if (window.addDataChips) window.addDataChips(awarded, 500, 300);
    } else if (item.type === 'token') {
      this.casinoMaxSpins = (this.casinoMaxSpins || 3) + 1;
      if (addFloatingText) addFloatingText('+1 VIP CASINO SPIN! 🎰', 500, 300, '#ffd700');
    }

    if (typeof window !== 'undefined' && typeof window.recordRunPurchase === 'function') {
      window.recordRunPurchase({
        name: item.name,
        cost: item.cost,
        type: item.type,
        icon: item.icon || '💾',
        desc: item.desc,
        status: (item.type === 'upgrade' || item.type === 'shield' || item.type === 'heal') ? 'ACTIVE' : 'CONSUMED',
        source: 'Underground Shop'
      });
    }

    if (window.audio) window.audio.powerupGet ? window.audio.powerupGet() : window.audio.coinGet();
    return true;
  }

  rerollShop(addFloatingText) {
    const currentChips = (typeof window !== 'undefined' && window.runDataChips !== undefined) ? window.runDataChips : 0;
    if (currentChips < this.shopRerollCost) {
      if (addFloatingText) addFloatingText('NOT ENOUGH CHIPS TO REROLL! 💾', 500, 300, '#f43f5e');
      return false;
    }
    if (window.spendDataChips) {
      window.spendDataChips(this.shopRerollCost);
    }
    this.shopRerollCost += 10;
    this.generateShopInventory();
    if (window.audio) window.audio.arcZap();
    return true;
  }

  getShopRerollCost() {
    return this.shopRerollCost || 35;
  }

  get activeShop() {
    return {
      inventory: this.shopInventory || [],
      rerollCost: this.shopRerollCost || 35
    };
  }

  // ==========================================================================
  // CYBER HEIST SYSTEM (STRATEGIC DIGITAL VAULT INFILTRATION)
  // ==========================================================================
  initCyberHeist(floor, isEndless) {
    this.cleanupAllRoomState();
    this.heistStateMachineState = CyberHeistState.ARENA_INITIALIZATION;
    this.heistActive = true;
    this.heistFloor = floor || 1;
    this.heistIsEndless = !!isEndless;
    this.heistSecurityLevel = isEndless ? Math.max(floor || 1, this.heistSecurityLevel || 1) : Math.max(1, Math.min(10, Math.floor((floor || 1) / 5) + 1));
    this.heistOverclock = 0;
    this.heistOverrideActive = false;
    this.heistOverrideTimer = 0;
    this.heistCombos = 0;
    this.heistComboTimer = 0;
    this.heistComboMultiplier = 1.0;
    this.heistBreachedCount = 0;
    this.heistTotalCaches = 0;
    this.heistScore = 0;
    this.heistChipsGained = 0;
    this.heistLaserBeams = [];
    this.heistPerfectBreachEligible = true;
    this.heistTimer = Math.max(16, 32 - (this.heistSecurityLevel - 1) * 1.5);

    this.setupCyberHeistVault();
    this.heistStateMachineState = CyberHeistState.SERVE_PREPARATION;

    if (window.audio && typeof window.audio.heistAlarm === 'function') {
      window.audio.heistAlarm();
    }
    if (typeof window.recordThreatDiscovery === 'function') {
      window.recordThreatDiscovery('heist_data_cache');
    }
  }

  get cyberHeistActive() {
    return !!this.heistActive;
  }

  get cyberHeist() {
    return {
      active: this.heistActive,
      securityLevel: this.heistSecurityLevel,
      caches: this.heistCaches || [],
      nodes: this.heistNodes || [],
      securityNodes: this.heistNodes || [],
      overclock: Math.min(100, Math.round(this.heistOverclock)),
      isOverride: this.heistOverrideActive,
      systemOverrideActive: this.heistOverrideActive,
      overrideTimer: this.heistOverrideTimer,
      combo: this.heistCombos,
      comboMultiplier: this.heistComboMultiplier,
      timer: Math.max(0, this.heistTimer),
      perfectEligible: this.heistPerfectBreachEligible,
      breachedCount: this.heistBreachedCount,
      totalCaches: this.heistTotalCaches
    };
  }

  setupCyberHeistVault() {
    this.heistCaches = [];
    this.heistNodes = [];
    this.heistLaserBeams = [];

    const sec = this.heistSecurityLevel || 1;
    const cacheCount = Math.min(6, 3 + Math.floor(sec / 2));
    this.heistTotalCaches = cacheCount;
    this.heistBreachedCount = 0;

    // Procedural Blueprints with Anti-Repetition
    this.lastHeistBlueprintIndex = (this.lastHeistBlueprintIndex !== undefined) ? (this.lastHeistBlueprintIndex + 1) % 3 : 0;
    
    let cachePositions = [];
    let nodePositions = [];

    if (this.lastHeistBlueprintIndex === 0) {
      // Blueprint 0: Vault Core (Central cluster)
      cachePositions = [
        { x: 640, y: 180 }, { x: 840, y: 180 }, { x: 740, y: 300 },
        { x: 640, y: 420 }, { x: 840, y: 420 }, { x: 920, y: 300 }
      ];
      nodePositions = [
        { x: 540, y: 220, type: 'shield' }, { x: 740, y: 140, type: 'turret' },
        { x: 740, y: 460, type: 'jammer' }, { x: 920, y: 180, type: 'repair' },
        { x: 920, y: 420, type: 'overclock' }
      ];
    } else if (this.lastHeistBlueprintIndex === 1) {
      // Blueprint 1: Perimeter Lanes (Top & bottom dual rails)
      cachePositions = [
        { x: 580, y: 140 }, { x: 740, y: 140 }, { x: 900, y: 140 },
        { x: 580, y: 460 }, { x: 740, y: 460 }, { x: 900, y: 460 }
      ];
      nodePositions = [
        { x: 540, y: 300, type: 'turret' }, { x: 700, y: 300, type: 'shield' },
        { x: 860, y: 300, type: 'jammer' }, { x: 940, y: 220, type: 'repair' },
        { x: 940, y: 380, type: 'overclock' }
      ];
    } else {
      // Blueprint 2: Diamond Network (Staggered zigzag)
      cachePositions = [
        { x: 700, y: 150 }, { x: 560, y: 300 }, { x: 840, y: 300 },
        { x: 700, y: 450 }, { x: 920, y: 200 }, { x: 920, y: 400 }
      ];
      nodePositions = [
        { x: 540, y: 180, type: 'jammer' }, { x: 540, y: 420, type: 'shield' },
        { x: 740, y: 300, type: 'turret' }, { x: 900, y: 140, type: 'overclock' },
        { x: 900, y: 460, type: 'repair' }
      ];
    }

    // Distribute cache tiers according to security level
    const tiers = ['common', 'rare', 'epic', 'legendary', 'black_ice'];
    const cfgCaches = (typeof CYBER_HEIST_CONFIG !== 'undefined' && CYBER_HEIST_CONFIG.caches) ? CYBER_HEIST_CONFIG.caches : {
      common: { hp: 3, chips: 10, color: '#00f2fe', name: 'Standard Data Cache' },
      rare: { hp: 5, chips: 18, color: '#00e676', name: 'Secured Data Cache' },
      epic: { hp: 7, chips: 30, color: '#d500f9', name: 'Cryptographic Core Cache' },
      legendary: { hp: 10, chips: 50, color: '#ffd700', name: 'Quantum Apex Vault' },
      black_ice: { hp: 14, chips: 80, color: '#ff2a6d', name: 'Black Ice Hyper-Cache' }
    };

    for (let i = 0; i < cacheCount; i++) {
      const pos = cachePositions[i % cachePositions.length];
      const safeX = Math.max(520, pos.x);
      let tier = 'common';
      const roll = Math.random() + (sec * 0.08);
      if (sec >= 4 && roll > 1.35) tier = 'black_ice';
      else if (sec >= 3 && roll > 1.05) tier = 'legendary';
      else if (sec >= 2 && roll > 0.75) tier = 'epic';
      else if (roll > 0.45) tier = 'rare';

      const cacheDef = cfgCaches[tier] || cfgCaches.common;
      const baseHp = cacheDef.hp + Math.floor(sec * 0.5);

      this.heistCaches.push({
        id: `cache_${i}`,
        tier: tier,
        name: cacheDef.name,
        x: safeX,
        y: pos.y,
        radius: 24,
        hp: baseHp,
        maxHp: baseHp,
        chips: cacheDef.chips,
        color: cacheDef.color,
        shielded: false,
        shieldSourceId: null,
        pulsePhase: i * 1.1
      });
    }

    // Spawn Security Nodes based on security level — SERVE ZONE: all nodes at x >= 500
    const nodeCount = Math.min(5, 2 + Math.floor(sec / 3));

    const nodeTypes = ['shield', 'turret', 'jammer', 'repair', 'overclock', 'speed'];
    for (let j = 0; j < nodeCount; j++) {
      const posDef = nodePositions[j % nodePositions.length];
      const type = (j === 0 && sec >= 2) ? 'shield' : nodeTypes[j % nodeTypes.length];
      const nHp = (type === 'shield' || type === 'repair' ? 3 : 2) + Math.floor(sec / 4);
      const nColor = type === 'shield' ? '#00b0ff' : (type === 'turret' ? '#ef4444' : (type === 'jammer' ? '#f59e0b' : (type === 'repair' ? '#10b981' : '#ff2a6d')));
      const safeNodeX = Math.max(520, posDef.x);

      const nodeObj = {
        id: `node_${j}`,
        type: type,
        name: type.toUpperCase() + ' NODE',
        x: safeNodeX,
        y: posDef.y,
        radius: 20,
        hp: nHp,
        maxHp: nHp,
        color: nColor,
        cooldown: type === 'turret' ? (160 - Math.min(80, sec * 8)) : 240,
        timer: Math.random() * 60,
        rotation: 0
      };

      this.heistNodes.push(nodeObj);

      // If Shield Node, tether to up to 2 unshielded caches
      if (type === 'shield') {
        let tethered = 0;
        this.heistCaches.forEach(c => {
          if (!c.shielded && tethered < 2) {
            c.shielded = true;
            c.shieldSourceId = nodeObj.id;
            tethered++;
          }
        });
      }
    }
  }

  updateCyberHeist(dt, player, balls, lasers, enemyBullets, spawnParticles, addFloatingText) {
    if (!this.heistActive) return;

    // PRE-SERVE / SETUP STATE: Never deal damage, fire projectiles, or tick alert during serve setup
    if (typeof window !== 'undefined' && window.serveCountdown && window.serveCountdown > 0) {
      this.heistStateMachineState = CyberHeistState.COUNTDOWN;
      return;
    } else if (this.heistActive && (this.heistStateMachineState === CyberHeistState.COUNTDOWN || this.heistStateMachineState === CyberHeistState.SERVE_PREPARATION)) {
      this.heistStateMachineState = CyberHeistState.ACTIVE_GAMEPLAY;
    }

    // Timer countdown
    this.heistTimer -= dt;
    if (this.heistTimer <= 0) {
      if (this.heistPerfectBreachEligible) {
        this.heistPerfectBreachEligible = false;
        if (addFloatingText) addFloatingText('TIME EXPIRED — PERFECT BREACH LOST!', 500, 220, '#f43f5e');
      }
    }

    // Combo multiplier decay
    if (this.heistComboTimer > 0) {
      this.heistComboTimer -= dt;
      if (this.heistComboTimer <= 0) {
        this.heistCombos = 0;
        this.heistComboMultiplier = 1.0;
      }
    }

    // Overclock dynamics: continuous baseline accretion
    const baseGain = (this.heistOverrideActive ? 0 : 2.0) * dt;
    this.heistOverclock = Math.min(100, this.heistOverclock + baseGain);

    // Overclock System Override Event
    if (this.heistOverclock >= 100 && !this.heistOverrideActive) {
      this.heistOverrideActive = true;
      this.heistOverrideTimer = 10.0;
      if (window.audio && typeof window.audio.systemOverride === 'function') {
        window.audio.systemOverride();
      }
      if (addFloatingText) addFloatingText('⚠️ SYSTEM OVERRIDE! 2X CHIPS ACTIVE! ⚠️', 500, 240, '#ff0055');
      if (spawnParticles) {
        for (let p = 0; p < 25; p++) {
          spawnParticles(300 + Math.random() * 600, 100 + Math.random() * 400, '#ff0055', 4);
        }
      }
    }

    if (this.heistOverrideActive) {
      this.heistOverrideTimer -= dt;
      if (this.heistOverrideTimer <= 0) {
        this.heistOverrideActive = false;
        this.heistOverclock = 35; // Reset to safe threshold
        if (addFloatingText) addFloatingText('SYSTEM OVERRIDE SUBSIDING', 500, 240, '#00f2fe');
      }
    }

    // Update Security Nodes
    for (let nIdx = this.heistNodes.length - 1; nIdx >= 0; nIdx--) {
      const node = this.heistNodes[nIdx];
      node.rotation += dt * 2.0;

      // Turret Node: targeted projectile firing
      if (node.type === 'turret') {
        node.timer += 1;
        const fireRate = this.heistOverrideActive ? Math.floor(node.cooldown * 0.5) : node.cooldown;
        if (node.timer >= fireRate) {
          node.timer = 0;
          if (enemyBullets && player) {
            const angle = Math.atan2((player.y + player.h / 2) - node.y, (player.x + player.w) - node.x);
            enemyBullets.push({
              x: node.x - node.radius - 2,
              y: node.y,
              vx: Math.cos(angle) * 4.2,
              vy: Math.sin(angle) * 4.2,
              radius: 5,
              color: '#ef4444'
            });
            if (window.audio && typeof window.audio.turretShoot === 'function') window.audio.turretShoot();
            if (spawnParticles) spawnParticles(node.x - node.radius, node.y, '#ef4444', 6);
          }
        }
      }

      // Repair Node: heals damaged caches
      if (node.type === 'repair') {
        node.timer += 1;
        if (node.timer >= 240) {
          node.timer = 0;
          const damaged = this.heistCaches.find(c => c.hp > 0 && c.hp < c.maxHp);
          if (damaged) {
            damaged.hp = Math.min(damaged.maxHp, damaged.hp + 1);
            if (spawnParticles) spawnParticles(damaged.x, damaged.y, '#10b981', 12);
            if (addFloatingText) addFloatingText('+1 HP REPAIR', damaged.x, damaged.y - 15, '#10b981');
          }
        }
      }

      // Overclock Pylon: accelerates alert
      if (node.type === 'overclock' && !this.heistOverrideActive) {
        this.heistOverclock = Math.min(100, this.heistOverclock + dt * 3.5);
      }
    }

    // Check Player Laser Collisions with Caches & Nodes
    if (lasers && lasers.length > 0) {
      for (let lIdx = lasers.length - 1; lIdx >= 0; lIdx--) {
        const l = lasers[lIdx];
        if (!l.fromPlayer) continue;

        // Check against Nodes
        for (let nIdx = this.heistNodes.length - 1; nIdx >= 0; nIdx--) {
          const node = this.heistNodes[nIdx];
          if (Math.hypot(l.x - node.x, l.y - node.y) <= (l.w || 12) + node.radius) {
            node.hp -= (l.damage || 1);
            if (spawnParticles) spawnParticles(node.x, node.y, node.color, 6);
            if (window.audio && typeof window.audio.paddleHit === 'function') window.audio.paddleHit();
            if (!l.piercing) lasers.splice(lIdx, 1);
            if (node.hp <= 0) {
              this.destroySecurityNode(nIdx, spawnParticles, addFloatingText);
            }
            break;
          }
        }

        // Check against Caches
        for (let cIdx = this.heistCaches.length - 1; cIdx >= 0; cIdx--) {
          const cache = this.heistCaches[cIdx];
          if (cache.hp > 0 && Math.hypot(l.x - cache.x, l.y - cache.y) <= (l.w || 12) + cache.radius) {
            if (cache.shielded) {
              if (spawnParticles) spawnParticles(cache.x, cache.y, '#00b0ff', 6);
              if (addFloatingText) addFloatingText('SHIELDED!', cache.x, cache.y - 15, '#00b0ff');
            } else {
              cache.hp -= (l.damage || 1);
              if (spawnParticles) spawnParticles(cache.x, cache.y, cache.color, 8);
              if (cache.hp <= 0) {
                this.breachDataCache(cIdx, spawnParticles, addFloatingText);
              }
            }
            if (!l.piercing && lasers[lIdx]) lasers.splice(lIdx, 1);
            break;
          }
        }
      }
    }

    // Ball Collisions
    if (balls && balls.length > 0) {
      balls.forEach(b => {
        this.checkCyberHeistBallHit(b, player, spawnParticles, addFloatingText);
      });
    }

    // Check Vault Completion
    const remaining = this.heistCaches.filter(c => c.hp > 0).length;
    if (remaining === 0 && this.heistCaches.length > 0) {
      this.concludeVaultBreach(addFloatingText);
    }
  }

  checkCyberHeistBallHit(b, player, spawnParticles, addFloatingText) {
    if (!this.heistActive) return false;
    if (typeof window !== 'undefined' && window.serveCountdown && window.serveCountdown > 0) return false;
    if (b.x < 240) return false; // SERVE ZONE CLEARANCE: ball must have actively launched into the vault zone

    // Check Security Nodes
    for (let nIdx = this.heistNodes.length - 1; nIdx >= 0; nIdx--) {
      const node = this.heistNodes[nIdx];
      const dist = Math.hypot(b.x - node.x, b.y - node.y);
      if (dist <= b.radius + node.radius) {
        b.vx = -b.vx * 1.05;
        const dmg = (b.isCritical ? 3 : 1) * ((window.duelMomentum && window.duelMomentum >= 4) ? 2 : 1);
        node.hp -= dmg;
        if (spawnParticles) spawnParticles(node.x, node.y, node.color, 12);
        if (addFloatingText) addFloatingText(`-${dmg}`, node.x, node.y - 12, node.color);
        if (window.audio && typeof window.audio.paddleHit === 'function') window.audio.paddleHit();

        if (node.hp <= 0) {
          this.destroySecurityNode(nIdx, spawnParticles, addFloatingText);
        }
        return true;
      }
    }

    // Check Data Caches
    for (let cIdx = this.heistCaches.length - 1; cIdx >= 0; cIdx--) {
      const cache = this.heistCaches[cIdx];
      if (cache.hp <= 0) continue;

      const dist = Math.hypot(b.x - cache.x, b.y - cache.y);
      if (dist <= b.radius + cache.radius) {
        b.vx = -b.vx * 1.05;
        this.heistOverclock = Math.min(100, this.heistOverclock + 1.5);

        if (cache.shielded) {
          if (spawnParticles) spawnParticles(cache.x, cache.y, '#00b0ff', 12);
          if (addFloatingText) addFloatingText('SHIELDED! DESTROY NODE!', cache.x - 30, cache.y - 15, '#00b0ff');
          if (window.audio && typeof window.audio.paddleHit === 'function') window.audio.paddleHit();
        } else {
          const dmg = (b.isCritical ? 3 : 1) * ((window.duelMomentum && window.duelMomentum >= 4) ? 2 : 1);
          cache.hp -= dmg;
          if (spawnParticles) spawnParticles(cache.x, cache.y, cache.color, 14);
          if (addFloatingText) addFloatingText(`-${dmg} HP`, cache.x, cache.y - 14, cache.color);
          if (window.audio && typeof window.audio.brickBreak === 'function') window.audio.brickBreak();

          if (cache.hp <= 0) {
            this.breachDataCache(cIdx, spawnParticles, addFloatingText);
          }
        }
        return true;
      }
    }
    return false;
  }

  destroySecurityNode(nodeIndexOrObj, spawnParticles, addFloatingText) {
    if (!this.heistNodes) return;
    let nodeIndex = -1;
    let node = null;
    if (typeof nodeIndexOrObj === 'number') {
      nodeIndex = nodeIndexOrObj;
      node = this.heistNodes[nodeIndex];
    } else if (nodeIndexOrObj && typeof nodeIndexOrObj === 'object') {
      node = nodeIndexOrObj;
      nodeIndex = this.heistNodes.indexOf(nodeIndexOrObj);
    }
    if (!node) return;

    if (typeof spawnParticles === 'function') spawnParticles(node.x, node.y, node.color, 24);
    if (window.audio && typeof window.audio.nodeShatter === 'function') {
      window.audio.nodeShatter();
    } else if (window.audio && typeof window.audio.tntExplode === 'function') {
      window.audio.tntExplode();
    }

    // Purge Overclock alert by 20%
    const purgePct = node.type === 'overclock' ? 35 : 20;
    this.heistOverclock = Math.max(0, this.heistOverclock - purgePct);

    // Free connected shielded caches
    if (node.type === 'shield') {
      this.heistCaches.forEach(c => {
        if (c.shieldSourceId === node.id) {
          c.shielded = false;
          c.shieldSourceId = null;
        }
      });
      if (typeof addFloatingText === 'function') addFloatingText('SHIELDS DOWN!', node.x, node.y, '#00b0ff');
    }

    // Chip reward for taking down security: calibrated 6 + sec * 2
    const chips = 6 + ((this.heistSecurityLevel || 1) * 2);
    if (typeof window.addDataChips === 'function') window.addDataChips(chips, node.x, node.y);
    if (typeof addFloatingText === 'function') addFloatingText(`${node.name} OFFLINE! +${chips} 💾`, node.x, node.y - 20, '#00e676');

    // Codex Discovery
    if (typeof window.recordThreatDiscovery === 'function') {
      window.recordThreatDiscovery(`heist_${node.type}_node`);
    }

    if (nodeIndex >= 0) this.heistNodes.splice(nodeIndex, 1);
  }

  breachDataCache(cacheIndexOrObj, spawnParticles, addFloatingText) {
    if (!this.heistCaches) return;
    let cacheIndex = -1;
    let cache = null;
    if (typeof cacheIndexOrObj === 'number') {
      cacheIndex = cacheIndexOrObj;
      cache = this.heistCaches[cacheIndex];
    } else if (cacheIndexOrObj && typeof cacheIndexOrObj === 'object') {
      cache = cacheIndexOrObj;
      cacheIndex = this.heistCaches.indexOf(cacheIndexOrObj);
    }
    if (!cache) return;

    cache.hp = 0;
    this.heistBreachedCount++;

    // Increment combo: capped at 1.8x to prevent runaway inflation
    this.heistCombos++;
    this.heistComboTimer = 4.5;
    this.heistComboMultiplier = Math.min(1.8, 1.0 + (this.heistCombos - 1) * 0.12);

    // Calculate Chip reward: override capped at 1.5x
    const overrideMult = this.heistOverrideActive ? 1.5 : 1.0;
    const baseChips = cache.chips || 10;
    const totalChips = Math.round(baseChips * this.heistComboMultiplier * overrideMult);
    this.heistChipsGained += totalChips;

    if (typeof window.addDataChips === 'function') {
      window.addDataChips(totalChips, cache.x, cache.y);
    }

    if (typeof spawnParticles === 'function') spawnParticles(cache.x, cache.y, cache.color, 32);
    if (window.audio && typeof window.audio.cacheBreach === 'function') {
      window.audio.cacheBreach();
    } else if (window.audio && typeof window.audio.criticalHit === 'function') {
      window.audio.criticalHit();
    }

    const comboStr = this.heistCombos > 1 ? ` [x${this.heistComboMultiplier.toFixed(1)} COMBO!]` : '';
    const overrideStr = this.heistOverrideActive ? ' [OVERRIDE 1.5X!]' : '';
    if (addFloatingText) {
      addFloatingText(`${cache.name} BREACHED! +${totalChips} 💾${comboStr}${overrideStr}`, cache.x, cache.y - 25, cache.color);
    }

    // Codex Discovery
    if (typeof window.recordThreatDiscovery === 'function') {
      window.recordThreatDiscovery(`heist_${cache.tier}_cache`);
    }
  }

  concludeVaultBreach(addFloatingText) {
    if (!this.heistActive) return;
    this.heistActive = false;
    this.heistStateMachineState = CyberHeistState.ENCOUNTER_COMPLETE;

    // Perfect breach bonus: calibrated 25 + sec * 5
    let perfectBonus = 0;
    if (this.heistPerfectBreachEligible) {
      perfectBonus = 25 + (this.heistSecurityLevel * 5);
      if (typeof window.addDataChips === 'function') window.addDataChips(perfectBonus, 500, 260);
      if (addFloatingText) addFloatingText(`⭐ PERFECT BREACH! +${perfectBonus} DATA CHIPS! ⭐`, 500, 240, '#ffd700');
      if (window.audio && typeof window.audio.goalScored === 'function') window.audio.goalScored();
    }

    this.heistStateMachineState = CyberHeistState.REWARD;

    if (this.heistIsEndless) {
      this.heistSecurityLevel = Math.max(this.heistSecurityLevel + 1, (typeof currentFloor !== 'undefined' ? currentFloor : 1));
      if (addFloatingText) addFloatingText(`INFILTRATION LEVEL UP: SEC-${this.heistSecurityLevel}! 🔓`, 500, 300, '#00e676');
      if (window.audio && typeof window.audio.levelCleared === 'function') window.audio.levelCleared();
      if (typeof window.handleRoomVictory === 'function') {
        window.handleRoomVictory();
      }
    } else {
      if (addFloatingText) addFloatingText('VAULT INFILTRATION COMPLETE! 🔓', 500, 300, '#00e676');
      if (window.audio && typeof window.audio.levelCleared === 'function') window.audio.levelCleared();
      if (typeof window.handleRoomVictory === 'function') {
        window.handleRoomVictory();
      }
    }
  }

  drawCyberHeist(ctx) {
    if (!this.heistActive) return;

    ctx.save();

    // 1. Draw Shield Conduits / Tether Beams
    this.heistNodes.forEach(node => {
      if (node.type === 'shield') {
        this.heistCaches.forEach(cache => {
          if (cache.shieldSourceId === node.id && cache.hp > 0) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 176, 255, 0.75)';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 6]);
            ctx.lineDashOffset = (Date.now() / 35) % 14;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(cache.x, cache.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      }
    });

    // 2. Draw Data Caches
    this.heistCaches.forEach(cache => {
      if (cache.hp <= 0) return;

      ctx.save();
      ctx.shadowBlur = cache.shielded ? 18 : 12;
      ctx.shadowColor = cache.shielded ? '#00b0ff' : cache.color;

      // Hexagonal Data Cache Chassis
      ctx.fillStyle = '#0a101f';
      ctx.strokeStyle = cache.shielded ? '#00b0ff' : cache.color;
      ctx.lineWidth = cache.shielded ? 3 : 2;

      ctx.beginPath();
      for (let s = 0; s < 6; s++) {
        const angle = (s * Math.PI) / 3;
        const hx = cache.x + Math.cos(angle) * cache.radius;
        const hy = cache.y + Math.sin(angle) * cache.radius;
        if (s === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner pulsating core
      const pulseScale = 0.5 + Math.sin(Date.now() * 0.005 + cache.pulsePhase) * 0.15;
      ctx.fillStyle = cache.color;
      ctx.beginPath();
      ctx.arc(cache.x, cache.y, cache.radius * pulseScale, 0, Math.PI * 2);
      ctx.fill();

      // Shield Dome if shielded
      if (cache.shielded) {
        ctx.strokeStyle = 'rgba(0, 176, 255, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cache.x, cache.y, cache.radius + 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // HP Bar below cache
      const barW = cache.radius * 2.2;
      const barH = 5;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cache.x - barW / 2, cache.y + cache.radius + 6, barW, barH);
      ctx.fillStyle = cache.shielded ? '#00b0ff' : cache.color;
      ctx.fillRect(cache.x - barW / 2, cache.y + cache.radius + 6, (cache.hp / cache.maxHp) * barW, barH);

      // Glyphs & HP Count
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${cache.hp}/${cache.maxHp}`, cache.x, cache.y);

      ctx.restore();
    });

    // 3. Draw Security Nodes
    this.heistNodes.forEach(node => {
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = node.color;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Internal silhouette / rotating radar arms
      ctx.save();
      ctx.translate(node.x, node.y);
      ctx.rotate(node.rotation);
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-node.radius * 0.6, 0);
      ctx.lineTo(node.radius * 0.6, 0);
      ctx.moveTo(0, -node.radius * 0.6);
      ctx.lineTo(0, node.radius * 0.6);
      ctx.stroke();
      ctx.restore();

      // Type Label / Icon
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const glyph = node.type === 'shield' ? '🛡️' : (node.type === 'turret' ? '🎯' : (node.type === 'jammer' ? '⚡' : (node.type === 'repair' ? '🩹' : '🔥')));
      ctx.fillText(glyph, node.x, node.y);

      // Node HP bar
      const nbw = node.radius * 2;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(node.x - nbw / 2, node.y - node.radius - 8, nbw, 4);
      ctx.fillStyle = node.color;
      ctx.fillRect(node.x - nbw / 2, node.y - node.radius - 8, (node.hp / node.maxHp) * nbw, 4);

      ctx.restore();
    });

    // 4. Overclock System HUD Banner
    const ocPct = Math.min(100, Math.round(this.heistOverclock));
    const ocColor = this.heistOverrideActive ? '#ff0055' : (ocPct >= 75 ? '#ef4444' : (ocPct >= 50 ? '#f59e0b' : '#38bdf8'));
    const ocLabel = this.heistOverrideActive ? '⚠️ SYSTEM OVERRIDE (2X DATA CHIPS) ⚠️' : `OVERCLOCK: ${ocPct}%`;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = ocColor;
    ctx.lineWidth = 1.5;
    ctx.fillRect(560, 18, 420, 36);
    ctx.strokeRect(560, 18, 420, 36);

    // Overclock gauge fill
    ctx.fillStyle = ocColor;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(560, 18, 420 * (ocPct / 100), 36);
    ctx.globalAlpha = 1.0;

    // Label & Timer
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(ocLabel, 575, 36);

    ctx.textAlign = 'right';
    const timerCol = this.heistPerfectBreachEligible ? '#00e676' : '#94a3b8';
    ctx.fillStyle = timerCol;
    ctx.fillText(`TIME: ${Math.ceil(this.heistTimer)}s`, 965, 36);

    // Combo Pill
    if (this.heistCombos > 1) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`⚡ BREACH COMBO x${this.heistComboMultiplier.toFixed(1)} ⚡`, 770, 70);
    }

    ctx.restore();

    ctx.restore();
  }

  // Master Canvas draw dispatcher for RoomManager
  draw(ctx, player) {
    if (this.swarmActive) {
      this.drawSwarm(ctx, player || (typeof window !== 'undefined' ? window.player : null));
    }
    if (this.heistActive) {
      this.drawCyberHeist(ctx);
    }
  }
}

// Global instance
window.roomManager = new RoomManager();
