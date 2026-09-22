// ==========================================
// CYBER-BREAKER: CORE GAME ENGINE
// Build Depth, Paddle Speed, Archetypes, Casino & Swarm Rework
// ==========================================

// Polyfill CanvasRenderingContext2D.prototype.roundRect for maximum browser compatibility
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r = 0) {
    if (typeof r === 'number') r = [r, r, r, r];
    const [tl, tr, br, bl] = Array.isArray(r) ? r : [0, 0, 0, 0];
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    return this;
  };
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CONFIG = {
  width: 1000,
  height: 600,
  basePaddleW: 15,
  basePaddleH: 86,
  ballRadius: 7,
  maxParticles: 80
};

let currentAppScreen = 'BOOT';
let prePauseScreen = null;
window.prePauseScreen = null;
let currentFloor = 1;
let currentSector = 1;
let roomType = 'BREAKOUT';
let primaryPath = null;
let secondaryBranch = null;
let runScore = 0;
let runCoresEarned = 0;
let combo = 0;
let comboTimer = 0;
let screenShake = 0;

let controlMode = 'keyboard';
let mouseCanvasY = CONFIG.height / 2;

let abilityCooldownCurrent = 0;
let abilityCooldownMax = 300;
let serveWatchdogTimer = 0;
let ballLostWatchdogTimer = 0;
let railgunCharge = 0;
let overchargeAirTime = 0;
let naniteLeechDeflects = 0;

let runPurchases = [];
window.runPurchases = runPurchases;
window.abilityCooldowns = {};

function recordRunPurchase(item) {
  if (!item) return;
  runPurchases.push({
    name: item.name || 'Unknown Item',
    cost: item.cost || 0,
    type: item.type || 'item',
    icon: item.icon || '💾',
    desc: item.desc || '',
    status: item.status || 'ACTIVE',
    source: item.source || 'Shop',
    timestamp: Date.now()
  });
}
window.recordRunPurchase = recordRunPurchase;

const collectedArtifacts = new Set();
window.collectedArtifacts = collectedArtifacts;
let activeBallTransformation = 'normal';
let usedUniqueBallsThisRun = new Set();

let sentryAngle = 0;
let sentryShootTick = 0;
let defenseSatY = CONFIG.height / 2;
let orbitalStrikeTimer = 0;

const activeBuffs = {
  fireball: 0,
  lightning: 0,
  twinBlasters: 0,
  megaBall: 0,
  shieldCharges: 0
};
window.activeBuffs = activeBuffs;
window.isAdminAuthenticated = false;
window.isAdminSessionAuthorized = false;

let twinBlasterTick = 0;
let secondChanceAvailable = false;
let chronoCooldown = 0;
let timeScale = 1.0;
let timeScaleTimer = 0;
let voidPhaseActive = 0;

let duelRallyCount = 0;
let duelMomentum = 1;
let duelTimer = 0;
let currentDuelPersonality = null;
let isHyperSpike = false;
let powerOrb = null;

window.duelMomentum = 1;
window.currentDuelPersonality = null;

let serveCountdown = 0;
let serveAnnouncement = '';
let sectorBannerTimer = 0;
let sectorBannerTitle = '';
let sectorBannerSub = '';

let victorySequenceTimer = 0;
let victoryShockwave = 0;

let nextBrickUniqueId = 1;
let animationFrameId = null;
let lastTimestamp = performance.now();

let activeGameMode = 'MAIN';
window.activeGameMode = activeGameMode;
let runDataChips = 0;
Object.defineProperty(window, 'runDataChips', {
  get: () => runDataChips,
  set: (v) => {
    runDataChips = v;
    if (typeof updateDataChipsDisplay === 'function') updateDataChipsDisplay();
  }
});
let isLevel50EndlessUnlocked = false;

let bossScanIntroTimer = 0;
let bossScanIntroDef = null;
window.skipBossIntro = function() { bossScanIntroTimer = 0; serveCountdown = 0; };
Object.defineProperty(window, 'bossScanIntroTimer', { get: () => bossScanIntroTimer, set: (v) => { bossScanIntroTimer = v; } });
Object.defineProperty(window, 'serveCountdown', { get: () => serveCountdown, set: (v) => { serveCountdown = v; } });

const STORAGE_LEADERBOARD_KEY = 'CYBER_BREAKER_LEADERBOARDS_V1';

function updateDataChipsDisplay() {
  const el = document.getElementById('hudDataChipsVal');
  if (el) el.textContent = runDataChips;
  const casinoEl = document.getElementById('casinoChipsDisplay');
  if (casinoEl) casinoEl.textContent = runDataChips;
  const shopEl = document.getElementById('shopChipsDisplay');
  if (shopEl) shopEl.textContent = runDataChips;
}
window.updateDataChipsDisplay = updateDataChipsDisplay;

function addDataChips(amount, x, y) {
  if (isNaN(amount) || amount <= 0) return;
  let mult = 1.0;
  if (isMarketModActive('mod_reckless_greed')) mult *= 1.6;
  const val = Math.round(amount * mult);
  runDataChips += val;
  window.runDataChips = runDataChips;
  updateDataChipsDisplay();
  if (x !== undefined && y !== undefined) {
    addFloatingText(`+${val} CHIPS 💾`, x, y, '#ffd700');
  }
  if (window.audio && typeof window.audio.coinGet === 'function') window.audio.coinGet();
}
window.addDataChips = addDataChips;

function spendDataChips(amount) {
  if (runDataChips >= amount) {
    runDataChips -= amount;
    window.runDataChips = runDataChips;
    updateDataChipsDisplay();
    return true;
  }
  return false;
}
window.spendDataChips = spendDataChips;

function triggerBossIntroScan(bossDef, isMini = false) {
  bossScanIntroTimer = 150; // 2.5s scan card
  bossScanIntroDef = {
    name: bossDef.name || 'ANOMALY ARCHON',
    subtitle: bossDef.subtitle || (isMini ? 'SECTOR MINI-BOSS ELITE' : 'MAJOR SECTOR OVERLORD'),
    color: bossDef.color || '#ff2a6d',
    isMini: isMini
  };
  screenShake = 12;
  if (window.audio && typeof window.audio.hyperActive === 'function') {
    window.audio.hyperActive();
  }
}
window.triggerBossIntroScan = triggerBossIntroScan;

function drawFrozenEffect(ctx, x, y, w, h, isCircle, radius, remainingTicks, maxTicks = 240) {
  if (!ctx || remainingTicks <= 0) return;
  const ratio = Math.max(0, Math.min(1, remainingTicks / maxTicks));
  ctx.save();

  const centerX = isCircle ? x : x + w / 2;
  const centerY = isCircle ? y : y + h / 2;
  const boundR = isCircle ? radius : Math.max(w, h) / 2;

  // Stage 1: Application Burst (ratio > 0.85): Flash bloom + expansion aura
  if (ratio > 0.85) {
    const burstProgress = (1.0 - ratio) / 0.15;
    const burstScale = 1.0 + (1.0 - burstProgress) * 0.45;
    ctx.strokeStyle = `rgba(0, 242, 254, ${0.85 * (1.0 - burstProgress)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, boundR * burstScale * 1.35, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Stage 2 & 3: Crystalline ice encasement tint (with Stage 3 Thawing Pulse / Flicker when ratio < 0.35)
  let encaseAlpha = 0.45;
  if (ratio < 0.35) {
    const flicker = Math.sin(Date.now() * 0.02) * 0.5 + 0.5;
    encaseAlpha = 0.2 + flicker * 0.25;
  }

  // Ice block / crystal hull
  ctx.fillStyle = `rgba(56, 189, 248, ${encaseAlpha})`;
  ctx.strokeStyle = '#00f2fe';
  ctx.lineWidth = ratio < 0.35 ? 1.5 : 2;

  if (isCircle) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, boundR + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
  }

  // Stage 2 & 3: Crystalline spikes & frost shards
  const spikeCount = 6;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < spikeCount; i++) {
    const ang = (i / spikeCount) * Math.PI * 2 + (isCircle ? 0 : Math.PI / 4);
    const innerDist = boundR * 0.7;
    const outerDist = boundR + 6 + (i % 2 === 0 ? 4 : 1);
    const sx = centerX + Math.cos(ang) * innerDist;
    const sy = centerY + Math.sin(ang) * innerDist;
    const ex = centerX + Math.cos(ang) * outerDist;
    const ey = centerY + Math.sin(ang) * outerDist;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  // Stage 3: Cracking veins when thawing (ratio < 0.35)
  if (ratio < 0.35) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(centerX - boundR * 0.5, centerY - boundR * 0.3);
    ctx.lineTo(centerX, centerY);
    ctx.lineTo(centerX + boundR * 0.6, centerY + boundR * 0.4);
    ctx.stroke();
  }

  ctx.restore();
}
window.drawFrozenEffect = drawFrozenEffect;

const STORAGE_CALLSIGN_KEY = 'CYBER_BREAKER_PILOT_CALLSIGN_V1';
const STORAGE_THREATS_KEY = 'CYBER_BREAKER_THREAT_DISCOVERIES_V1';

function getPlayerCallsign() {
  try {
    const s = localStorage.getItem(STORAGE_CALLSIGN_KEY);
    if (s && s.trim()) return s.trim().slice(0, 16).toUpperCase();
  } catch (e) {}
  return 'VANGUARD-1';
}

function setPlayerCallsign(name) {
  if (!name) return 'VANGUARD-1';
  const clean = name.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().slice(0, 16).toUpperCase() || 'VANGUARD-1';
  try {
    localStorage.setItem(STORAGE_CALLSIGN_KEY, clean);
  } catch (e) {}
  updateCallsignDisplays();
  return clean;
}
window.getPlayerCallsign = getPlayerCallsign;
window.setPlayerCallsign = setPlayerCallsign;

function updateCallsignDisplays() {
  const name = getPlayerCallsign();
  const el = document.getElementById('headerCallsignDisplay');
  if (el) el.textContent = name;
  const inEl = document.getElementById('inputCallsign');
  if (inEl && document.activeElement !== inEl) inEl.value = name;
}

function getThreatDiscoverySet() {
  try {
    const raw = localStorage.getItem(STORAGE_THREATS_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {}
  return new Set();
}

let threatToastTimeout = null;
function showThreatDiscoveryToast(threatDef) {
  const toast = document.getElementById('threatDiscoveryToast');
  if (!toast) return;
  toast.innerHTML = `👾 <span>NEW THREAT ARCHIVED:</span> <strong style="color:${threatDef.color || '#ffd700'}">${threatDef.name}</strong>`;
  toast.classList.remove('hidden');
  if (window.audio && typeof window.audio.powerupGet === 'function') window.audio.powerupGet();
  if (threatToastTimeout) clearTimeout(threatToastTimeout);
  threatToastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

function recordThreatDiscovery(threatId) {
  if (!threatId) return;
  try {
    const s = getThreatDiscoverySet();
    if (!s.has(threatId)) {
      s.add(threatId);
      localStorage.setItem(STORAGE_THREATS_KEY, JSON.stringify([...s]));
      if (typeof THREAT_DATABASE !== 'undefined') {
        const def = THREAT_DATABASE.find(t => t.id === threatId);
        if (def) showThreatDiscoveryToast(def);
      }
    }
  } catch (e) {}
}
window.recordThreatDiscovery = recordThreatDiscovery;
window.getThreatDiscoverySet = getThreatDiscoverySet;

function getLeaderboards() {
  try {
    const raw = localStorage.getItem(STORAGE_LEADERBOARD_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {}
  return {
    MAIN: [
      { pilot: 'NEXUS-PRIME', score: 18500, floor: 50, char: 'Vanguard', date: '2026-09-18' },
      { pilot: 'GHOST_RUNNER', score: 14200, floor: 42, char: 'Phantom', date: '2026-09-17' },
      { pilot: 'AURA-V', score: 9800, floor: 28, char: 'Chronos', date: '2026-09-15' }
    ],
    SWARM_ENDLESS: [
      { pilot: 'SWARM_SLAYER', score: 12400, floor: 18, char: 'Tactician', date: '2026-09-18' },
      { pilot: 'HIVEMIND_PURGE', score: 8600, floor: 12, char: 'Titan', date: '2026-09-16' }
    ],
    DUEL_ENDLESS: [
      { pilot: 'CHAMPION-9', score: 15100, floor: 16, char: 'Striker', date: '2026-09-18' },
      { pilot: 'PADDLE_GOD', score: 10400, floor: 11, char: 'Vanguard', date: '2026-09-16' }
    ],
    BREAKOUT_ENDLESS: [
      { pilot: 'GRID_CRUSHER', score: 16800, floor: 22, char: 'Overclock', date: '2026-09-18' },
      { pilot: 'PRISM_BEAM', score: 11200, floor: 15, char: 'Glitch', date: '2026-09-17' }
    ],
    HEIST_ENDLESS: [
      { pilot: 'CIPHER_NINJA', score: 21500, floor: 24, char: 'Phantom', date: '2026-09-19' },
      { pilot: 'NET_BREAKER', score: 14800, floor: 17, char: 'Overclock', date: '2026-09-18' }
    ]
  };
}

function saveLeaderboardEntry(modeKey, entry) {
  if (!modeKey || !entry) return;
  const boards = getLeaderboards();
  if (!boards[modeKey]) boards[modeKey] = [];

  const charName = (typeof CHARACTERS !== 'undefined' && CHARACTERS[entry.char]) ? CHARACTERS[entry.char].name : (entry.char || 'Vanguard');
  const nowStr = new Date().toISOString().split('T')[0];
  const callsign = getPlayerCallsign() || 'CYBER_PILOT';

  const newRecord = {
    pilot: `${callsign} (YOU)`,
    char: charName,
    score: Math.max(0, Math.round(entry.score || 0)),
    floor: Math.max(1, entry.floor || 1),
    date: nowStr
  };

  boards[modeKey].push(newRecord);
  boards[modeKey].sort((a, b) => b.score - a.score);
  boards[modeKey] = boards[modeKey].slice(0, 10);

  try {
    localStorage.setItem(STORAGE_LEADERBOARD_KEY, JSON.stringify(boards));
  } catch (e) {}
}

let activeLeaderboardTab = 'MAIN';

function renderLeaderboardTab(modeKey) {
  activeLeaderboardTab = modeKey;
  document.querySelectorAll('.leaderboard-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === modeKey);
  });

  const container = document.getElementById('leaderboardRowsContainer');
  if (!container) return;

  const boards = getLeaderboards();
  const entries = boards[modeKey] || [];

  if (entries.length === 0) {
    container.innerHTML = '<div style="padding: 24px; text-align: center; color: #64748b;">No combat records recorded yet for this mode.</div>';
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];
  container.innerHTML = entries.map((e, idx) => {
    const rankDisplay = idx < 3 ? medals[idx] : `#${idx + 1}`;
    const rankClass = idx < 3 ? `lb-rank-${idx + 1}` : '';
    const metricLabel = modeKey === 'DUEL_ENDLESS' ? `Duel ${e.floor}` : (modeKey === 'SWARM_ENDLESS' ? `Wave ${e.floor}` : (modeKey === 'HEIST_ENDLESS' ? `Sec-${e.floor}` : `Lvl ${e.floor}`));
    const isYou = e.pilot && e.pilot.includes('(YOU)');
    const pilotColor = isYou ? '#00f2fe' : '#f8fafc';
    const pilotStyle = isYou ? 'text-shadow: 0 0 8px rgba(0, 242, 254, 0.4);' : '';

    return `
      <div class="lb-row" style="${isYou ? 'background: rgba(0, 242, 254, 0.08); border-left: 3px solid #00f2fe;' : ''}">
        <div class="lb-rank ${rankClass}">${rankDisplay}</div>
        <div>
          <strong style="color: ${pilotColor}; ${pilotStyle}">${e.pilot}</strong>
          <span style="font-size: 0.72rem; color: #64748b; margin-left: 6px;">(${e.char})</span>
        </div>
        <div style="color: #00b0ff; font-weight: 700;">${metricLabel}</div>
        <div style="color: #ffd700; font-weight: 800;">${Number(e.score).toLocaleString('en-US')}</div>
        <div style="color: #64748b; font-size: 0.74rem;">${e.date || '-'}</div>
      </div>
    `;
  }).join('');
}

function openLeaderboardsModal(tab = 'MAIN') {
  currentAppScreen = 'LEADERBOARD_MODAL';
  renderLeaderboardTab(tab);
  document.getElementById('leaderboardOverlay')?.classList.remove('hidden');
}
window.openLeaderboardsModal = openLeaderboardsModal;

let metaSave = {
  cores: 0,
  highestFloor: 1,
  selectedChar: 'vanguard',
  unlockedChars: ['vanguard'],
  unlockedCharacters: ['vanguard'],
  equippedAbility: 'shockwave',
  unlockedAbilities: ['shockwave'],
  marketMods: [],
  marketModStates: {},
  unlockedPaths: [],
  upgrades: { meta_hull: 0, meta_servos: 0, meta_scavenger: 0, meta_defibrillator: 0 }
};
window.metaSave = metaSave;
let midRunSave = null;

// Explicit Isolated Boss Challenge State: 'none' | 'preparation' | 'intro' | 'combat' | 'victory'
let bossChallengeState = 'none';
window.bossChallengeState = bossChallengeState;

// Centralized Path Gating Helper
function isPathUnlocked(pathId) {
  if (!pathId) return false;
  const p = (typeof BUILD_PATHS !== 'undefined') ? BUILD_PATHS[pathId] : null;
  if (!p) return false;
  if (!p.secretUnlock) return true;
  return Array.isArray(metaSave.unlockedPaths) && metaSave.unlockedPaths.includes(pathId);
}
window.isPathUnlocked = isPathUnlocked;

// Centralized Black Market Mod State Helpers (Purchased vs Active/Enabled)
function isMarketModActive(modId) {
  if (!metaSave || !Array.isArray(metaSave.marketMods) || !metaSave.marketMods.includes(modId)) return false;
  if (!metaSave.marketModStates) metaSave.marketModStates = {};
  return metaSave.marketModStates[modId] !== false;
}
window.isMarketModActive = isMarketModActive;

function toggleMarketMod(modId) {
  if (!metaSave || !Array.isArray(metaSave.marketMods) || !metaSave.marketMods.includes(modId)) return;
  if (!metaSave.marketModStates) metaSave.marketModStates = {};
  const currentActive = metaSave.marketModStates[modId] !== false;
  metaSave.marketModStates[modId] = !currentActive;
  saveMetaProgress();
  if (window.audio && typeof window.audio.paddleHit === 'function') window.audio.paddleHit();
  renderBlackMarket();
}
window.toggleMarketMod = toggleMarketMod;

// Centralized Contextual Bennie Boss Health Bar Visibility
function syncBennieBossHudVisibility() {
  const bossHud = document.getElementById('bennieBossHud');
  if (!bossHud) return;
  const prepModal = document.getElementById('benniePrepModal');
  const isPrepOpen = prepModal && !prepModal.classList.contains('hidden');
  const homeOverlay = document.getElementById('homeOverlay');
  const isHomeOpen = homeOverlay && !homeOverlay.classList.contains('hidden');
  const isBennieActive = (currentAppScreen === 'BENNIE_BOSS') || (currentAppScreen === 'PAUSED' && (prePauseScreen === 'BENNIE_BOSS' || bennieBoss));
  if (isPrepOpen || isHomeOpen || !isBennieActive) {
    bossHud.classList.add('hidden');
    bossHud.style.display = 'none';
    return;
  }
  const isCombatActive = (bossChallengeState === 'intro' || bossChallengeState === 'combat' || bossChallengeState === 'victory');
  const shouldShow = isCombatActive && bennieBoss && !bennieBoss.isDefeated;
  if (shouldShow) {
    bossHud.classList.remove('hidden');
    bossHud.style.display = 'flex';
  } else {
    bossHud.classList.add('hidden');
    bossHud.style.display = 'none';
  }
}
window.syncBennieBossHudVisibility = syncBennieBossHudVisibility;

// Extended Player with Speed, Modifiers, Overdrive & Archetype
const player = {
  x: 42,
  y: CONFIG.height / 2 - 43,
  w: CONFIG.basePaddleW,
  h: CONFIG.basePaddleH,
  vy: 0,
  hp: 4,
  maxHp: 4,
  color: '#00f2fe',
  speedMult: 1,
  smashBonus: 1,
  burnChance: 0,
  isVoid: false,
  isChrono: false,
  droneCommander: false,
  glitchArchitect: false,
  archetype: null,
  modifier: 'magnetic_edge',
  magnetHeldBall: null,
  invulnerableTimer: 0,
  afterimages: [],
  // Velocity Overdrive
  overdriveGauge: 0,
  isOverdrive: false,
  lastMovedTick: 0
};
window.player = player;

const ai = {
  active: false,
  x: CONFIG.width - 48,
  y: CONFIG.height / 2 - 45,
  w: 16,
  h: 92,
  vy: 0,
  hp: 3,
  maxHp: 3,
  color: '#ff2a6d',
  stunTimer: 0,
  frozenTimer: 0,
  burnTimer: 0,
  shootCooldown: 0,
  personality: null,
  personalityKey: 'aggressor',
  speedMult: 1.0,
  attackCooldown: 220,
  rageActive: false
};
window.ai = ai;

let balls = [];
let phantomBalls = [];
let bricks = [];
let particles = [];
let floatingTexts = [];
let powerupDrops = [];
let coinDrops = [];
let lasers = [];
let enemyBullets = [];
let shockwaves = [];
let lightningArcs = [];

// Background animation variables
let gridPerspectiveZ = 0;
let homeTerrainPhase = 0;
const cyberTowers = [];
for (let i = 0; i < 20; i++) {
  cyberTowers.push({
    x: i * 52,
    w: 38 + Math.random() * 22,
    h: 130 + Math.random() * 190,
    windows: Math.floor(Math.random() * 7) + 4
  });
}
const flyingTraffic = [];
for (let i = 0; i < 12; i++) {
  flyingTraffic.push({
    x: Math.random() * CONFIG.width,
    y: 80 + Math.random() * 260,
    speed: 1.4 + Math.random() * 2.6,
    length: 18 + Math.random() * 32,
    color: Math.random() > 0.5 ? '#00f2fe' : (Math.random() > 0.5 ? '#ff2a6d' : '#ffd700'),
    alpha: 0.3 + Math.random() * 0.4
  });
}
const starsLayer1 = [];
const starsLayer2 = [];
const starsLayer3 = [];
for (let i = 0; i < 50; i++) starsLayer1.push({ x: Math.random() * CONFIG.width, y: Math.random() * CONFIG.height, s: 1 });
for (let i = 0; i < 35; i++) starsLayer2.push({ x: Math.random() * CONFIG.width, y: Math.random() * CONFIG.height, s: 1.8 });
for (let i = 0; i < 18; i++) starsLayer3.push({ x: Math.random() * CONFIG.width, y: Math.random() * CONFIG.height, s: 2.8 });

const toxicSpores = [];
for (let i = 0; i < 28; i++) {
  toxicSpores.push({
    x: Math.random() * CONFIG.width,
    y: Math.random() * CONFIG.height,
    vy: -0.6 - Math.random() * 0.9,
    wobble: Math.random() * Math.PI * 2,
    r: Math.random() * 3.8 + 1.5
  });
}
const moltenEmbers = [];
for (let i = 0; i < 32; i++) {
  moltenEmbers.push({
    x: Math.random() * CONFIG.width,
    y: Math.random() * CONFIG.height,
    vy: -1.3 - Math.random() * 1.6,
    vx: (Math.random() - 0.5) * 1.4,
    life: Math.random() * 100 + 40,
    r: Math.random() * 3 + 1
  });
}
let voidWarpAngle = 0;

// Input tracking
const keys = { ArrowUp: false, ArrowDown: false, KeyW: false, KeyS: false, KeyD: false };

window.addEventListener('keydown', (e) => {
  if (currentAppScreen === 'BOOT') {
    completeBootSequence();
    return;
  }
  if (e.code in keys) keys[e.code] = true;
  if (window.audio) window.audio.init();

  if (e.code === 'KeyP' || e.code === 'Escape') {
    togglePauseMenu();
  } else if (e.code === 'Space') {
    attemptTriggerAbility();
  } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
    const slotIdx = parseInt(e.code.replace('Digit', '')) - 1;
    if (typeof attemptTriggerAbilitySlot === 'function') {
      attemptTriggerAbilitySlot(slotIdx);
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code in keys) keys[e.code] = false;
});

function getCanvasContentRect() {
  const rect = canvas.getBoundingClientRect();
  const targetAspect = CONFIG.width / CONFIG.height; // 1000 / 600 = 5/3
  if (rect.height <= 0 || rect.width <= 0) {
    return { rect, contentW: CONFIG.width, contentH: CONFIG.height, offsetX: 0, offsetY: 0 };
  }
  const elementAspect = rect.width / rect.height;

  let contentW, contentH, offsetX, offsetY;
  if (elementAspect > targetAspect) {
    // Pillarboxed (letterbox bars on left & right)
    contentH = rect.height;
    contentW = rect.height * targetAspect;
    offsetX = rect.left + (rect.width - contentW) / 2;
    offsetY = rect.top;
  } else {
    // Letterboxed (letterbox bars on top & bottom)
    contentW = rect.width;
    contentH = rect.width / targetAspect;
    offsetX = rect.left;
    offsetY = rect.top + (rect.height - contentH) / 2;
  }

  return { rect, contentW, contentH, offsetX, offsetY };
}
window.getCanvasContentRect = getCanvasContentRect;

function getCanvasMousePos(e) {
  const { contentW, contentH, offsetX, offsetY } = getCanvasContentRect();
  if (contentW <= 0 || contentH <= 0) return { x: 0, y: CONFIG.height / 2 };
  const x = Math.max(0, Math.min(CONFIG.width, ((e.clientX - offsetX) / contentW) * CONFIG.width));
  const y = Math.max(0, Math.min(CONFIG.height, ((e.clientY - offsetY) / contentH) * CONFIG.height));
  return { x, y };
}
window.getCanvasMousePos = getCanvasMousePos;

canvas.addEventListener('mousemove', (e) => {
  const pos = getCanvasMousePos(e);
  mouseCanvasY = pos.y;
});

canvas.addEventListener('mousedown', (e) => {
  if (currentAppScreen === 'BOOT') {
    completeBootSequence();
    return;
  }
  if (window.audio) window.audio.init();
  if (e.button === 0) {
    attemptTriggerAbility();
  }
});

canvas.addEventListener('contextmenu', e => e.preventDefault());

// Dash mechanics removed in favor of 8 specialized Paddle Modifiers & 1:1 mouse movement

// Meta persistence
function loadMetaSave() {
  try {
    const raw = localStorage.getItem(STORAGE_META_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      metaSave.cores = Number(parsed.cores) || 0;
      metaSave.highestFloor = Number(parsed.highestFloor) || 1;
      if (Array.isArray(parsed.unlockedChars)) metaSave.unlockedChars = parsed.unlockedChars;
      if (Array.isArray(parsed.unlockedCharacters)) metaSave.unlockedCharacters = parsed.unlockedCharacters;
      else if (!Array.isArray(metaSave.unlockedCharacters)) metaSave.unlockedCharacters = metaSave.unlockedChars.slice();
      if (parsed.selectedChar && CHARACTERS[parsed.selectedChar]) metaSave.selectedChar = parsed.selectedChar;
      if (Array.isArray(parsed.unlockedAbilities)) metaSave.unlockedAbilities = parsed.unlockedAbilities;
      if (parsed.equippedAbility && ACTIVE_ABILITIES[parsed.equippedAbility]) metaSave.equippedAbility = parsed.equippedAbility;
      if (Array.isArray(parsed.marketMods)) metaSave.marketMods = parsed.marketMods;
      if (parsed.marketModStates && typeof parsed.marketModStates === 'object') metaSave.marketModStates = parsed.marketModStates;
      else if (!metaSave.marketModStates) metaSave.marketModStates = {};
      if (Array.isArray(parsed.unlockedPaths)) metaSave.unlockedPaths = parsed.unlockedPaths;
      else if (!metaSave.unlockedPaths) metaSave.unlockedPaths = [];
      if (parsed.upgrades) {
        for (const key in metaSave.upgrades) {
          if (parsed.upgrades[key] !== undefined) metaSave.upgrades[key] = Number(parsed.upgrades[key]) || 0;
        }
      }
    }
  } catch (e) {}

  try {
    const midRaw = localStorage.getItem(STORAGE_MIDRUN_KEY);
    if (midRaw) {
      const midParsed = JSON.parse(midRaw);
      if (midParsed && midParsed.active) midRunSave = midParsed;
    }
  } catch (e) {}

  updateCoreDisplays();
  updateResumeButton();
}

function saveMetaProgress() {
  try {
    localStorage.setItem(STORAGE_META_KEY, JSON.stringify(metaSave));
  } catch (e) {}
  updateCoreDisplays();
}
window.saveMetaProgress = saveMetaProgress;

function saveMidRunSession() {
  if (currentAppScreen !== 'PLAYING' && currentAppScreen !== 'PAUSED' && currentAppScreen !== 'DRAFT') return;
  if (activeGameMode === 'BENNIE_CHALLENGE' || prePauseScreen === 'BENNIE_BOSS' || roomType === 'BENNIE_ARENA') return;
  try {
    midRunSave = {
      active: true,
      floor: currentFloor,
      score: runScore,
      runCoresEarned: runCoresEarned,
      hp: player.hp,
      maxHp: player.maxHp,
      primaryPath: primaryPath,
      secondaryBranch: secondaryBranch,
      artifacts: Array.from(collectedArtifacts),
      selectedChar: metaSave.selectedChar,
      equippedAbility: metaSave.equippedAbility,
      activeBallTransformation: activeBallTransformation,
      usedUniqueBallsThisRun: Array.from(usedUniqueBallsThisRun),
      railgunCharge: railgunCharge,
      runPurchases: runPurchases,
      runDataChips: runDataChips
    };
    localStorage.setItem(STORAGE_MIDRUN_KEY, JSON.stringify(midRunSave));
  } catch (e) {}
  updateResumeButton();
}

function clearMidRunSession() {
  midRunSave = null;
  try {
    localStorage.removeItem(STORAGE_MIDRUN_KEY);
  } catch (e) {}
  updateResumeButton();
}

function updateResumeButton() {
  const btn = document.getElementById('btnResumeRun');
  if (midRunSave && midRunSave.active) {
    const secNum = Math.min(5, Math.floor((midRunSave.floor - 1) / 10) + 1);
    btn.style.display = 'block';
    btn.textContent = `⚔️ Resume Run • Sector ${secNum} (Floor ${midRunSave.floor})`;
  } else {
    btn.style.display = 'none';
  }
}

function updateCoreDisplays() {
  if (document.getElementById('homeCoresDisplay')) document.getElementById('homeCoresDisplay').textContent = metaSave.cores;
  if (document.getElementById('hangarCoresDisplay')) document.getElementById('hangarCoresDisplay').textContent = metaSave.cores;
  if (document.getElementById('marketCoresDisplay')) document.getElementById('marketCoresDisplay').textContent = metaSave.cores;
  if (document.getElementById('labCoresDisplay')) document.getElementById('labCoresDisplay').textContent = metaSave.cores;
  if (document.getElementById('homeHighFloorDisplay')) document.getElementById('homeHighFloorDisplay').textContent = metaSave.highestFloor;

  // Dynamic Black Market Counter (Discovered / Total from BLACK_MARKET_MODS)
  const homeMarketEl = document.getElementById('homeMarketDisplay');
  if (homeMarketEl) {
    const totalMarketMods = (typeof BLACK_MARKET_MODS !== 'undefined') ? Object.keys(BLACK_MARKET_MODS).length : 0;
    const discoverySet = (typeof getCodexDiscoverySet === 'function') ? getCodexDiscoverySet() : new Set();
    const knownSet = new Set(Array.isArray(metaSave.marketMods) ? metaSave.marketMods : []);
    if (typeof BLACK_MARKET_MODS !== 'undefined') {
      Object.keys(BLACK_MARKET_MODS).forEach(id => {
        if (discoverySet.has(id)) knownSet.add(id);
      });
    }
    homeMarketEl.textContent = `${knownSet.size}/${totalMarketMods}`;
  }

  // Dynamic Paddle Count on Main Menu Hangar Button
  const btnHangar = document.getElementById('btnOpenHangar');
  if (btnHangar && typeof CHARACTERS !== 'undefined') {
    const totalPaddles = Object.keys(CHARACTERS).length;
    btnHangar.textContent = `🚀 Cyber Hangar (${totalPaddles} Paddles)`;
  }

  const char = (typeof CHARACTERS !== 'undefined' && CHARACTERS[metaSave.selectedChar]) ? CHARACTERS[metaSave.selectedChar] : (typeof CHARACTERS !== 'undefined' ? CHARACTERS.vanguard : null);
  const homeCharEl = document.getElementById('homeCharDisplay');
  if (homeCharEl && char) {
    homeCharEl.textContent = `${char.icon} ${char.name}`;
    homeCharEl.style.color = char.color;
  }
}
window.updateCoreDisplays = updateCoreDisplays;

// Boot sequence
function runBootSequence() {
  const lines = [
    { id: 'termLine1', delay: 200 },
    { id: 'termLine2', delay: 650 },
    { id: 'termLine3', delay: 1100 },
    { id: 'termLine4', delay: 1600 },
    { id: 'termLine5', delay: 2100 }
  ];

  lines.forEach(l => {
    setTimeout(() => {
      const el = document.getElementById(l.id);
      if (el) el.classList.add('visible');
    }, l.delay);
  });

  setTimeout(() => {
    const prompt = document.getElementById('bootPrompt');
    if (prompt) prompt.style.opacity = '1';
  }, 2600);

  document.getElementById('bootIntroOverlay').addEventListener('click', completeBootSequence);
}

function completeBootSequence() {
  if (currentAppScreen !== 'BOOT') return;
  if (window.audio) {
    window.audio.init();
    window.audio.bootArp();
  }
  const boot = document.getElementById('bootIntroOverlay');
  boot.style.transition = 'opacity 0.4s ease';
  boot.style.opacity = '0';
  setTimeout(() => {
    boot.style.display = 'none';
    if (currentAppScreen === 'BOOT') {
      currentAppScreen = 'HOME';
      const homeOverlay = document.getElementById('homeOverlay');
      if (homeOverlay) {
        homeOverlay.classList.remove('hidden');
        homeOverlay.scrollTop = 0;
      }
      updateCoreDisplays();
    }
  }, 400);
}

// Ability logic
function triggerSpecificAbility(abilityKey) {
  if (abilityKey === 'shockwave') triggerKineticShockwave();
  else if (abilityKey === 'laser') triggerPlasmaVolley();
  else if (abilityKey === 'anchor') triggerGravityAnchor();
  else if (abilityKey === 'emp_blast') triggerEMPBlast();
  else if (abilityKey === 'cryo_freeze') triggerCryoFreeze();
  else if (abilityKey === 'overdrive_boost') triggerOverdriveBoost();
  else if (abilityKey === 'nano_swarm') triggerNanoSwarm();
  else if (abilityKey === 'railgun_snipe') triggerRailgunSnipe();
  else if (abilityKey === 'quantum_clone') triggerQuantumClone();
  else if (abilityKey === 'gravity_vortex') triggerGravityVortex();
  else if (abilityKey === 'missile_barrage') triggerMissileBarrage();
  else if (abilityKey === 'time_dilation') triggerTimeDilation();
  else if (abilityKey === 'aegis_dome') triggerAegisDome();
  else if (abilityKey === 'chain_lightning') triggerChainLightning();
  else if (abilityKey === 'orbital_laser') triggerOrbitalLaser();

  // Hive Paddle Secondary Trait: Active abilities also trigger a coordinated missile salvo
  if (player.droneCommander || metaSave.selectedChar === 'hive') {
    triggerDroneMissileSalvo();
  }
}

function attemptTriggerAbilitySlot(slotIdx = 0) {
  if (currentAppScreen !== 'PLAYING' && currentAppScreen !== 'BENNIE_BOSS') return;

  if (player.magnetHeldBall) {
    const b = player.magnetHeldBall;
    const minV = getFloorMinSpeed();
    b.vx = Math.abs(b.vx || minV) * 1.25 * player.smashBonus;
    b.vy = (Math.random() - 0.5) * 5;
    player.magnetHeldBall = null;
    if (window.audio) window.audio.paddleHit(true);
    return;
  }

  const hasBattery = collectedArtifacts.has('kinetic_battery');
  const isHyperRail = hasBattery && collectedArtifacts.has('prism_lens');

  if (hasBattery && railgunCharge >= 100 && slotIdx === 0) {
    fireMegaRailgun(isHyperRail);
    railgunCharge = 0;
    return;
  }

  if (player.isVoid && abilityCooldownCurrent <= 0 && slotIdx === 0) {
    voidPhaseActive = 110;
    if (window.audio) window.audio.paddleHit(true);
    spawnParticles(player.x, player.y + player.h / 2, '#d500f9', 16);
    addFloatingText('VOID PHASE ACTIVE!', player.x + 35, player.y, '#d500f9');
    const activeChar = CHARACTERS[metaSave.selectedChar] || CHARACTERS.vanguard;
    const cdMult = (activeChar && activeChar.abilityCdMult) || 1.0;
    const fluxMult = collectedArtifacts.has('flux_capacitor') ? 0.75 : 1.0;
    abilityCooldownMax = Math.round(280 * cdMult * (isMarketModActive('mod_overcharge') ? 0.75 : 1.0) * fluxMult);
    abilityCooldownCurrent = abilityCooldownMax;
    return;
  }

  const list = Array.isArray(metaSave.equippedAbilities) && metaSave.equippedAbilities.length > 0
    ? metaSave.equippedAbilities
    : [metaSave.equippedAbility || 'shockwave'];

  const abilityKey = list[slotIdx] || list[0] || 'shockwave';

  window.abilityCooldowns = window.abilityCooldowns || {};
  const curCd = window.abilityCooldowns[abilityKey] || (slotIdx === 0 ? abilityCooldownCurrent : 0);
  if (curCd > 0) return;

  triggerSpecificAbility(abilityKey);

  const activeChar = CHARACTERS[metaSave.selectedChar] || CHARACTERS.vanguard;
  const cdMult = (activeChar && activeChar.abilityCdMult) || 1.0;
  const defAbility = ACTIVE_ABILITIES[abilityKey] || ACTIVE_ABILITIES.shockwave;
  const baseCd = defAbility.cooldownTicks || 300;
  const fluxMult = collectedArtifacts.has('flux_capacitor') ? 0.75 : 1.0;
  const cdCalculated = Math.round(baseCd * cdMult * (isMarketModActive('mod_overcharge') ? 0.75 : 1.0) * fluxMult);

  window.abilityCooldowns[abilityKey] = cdCalculated;
  if (slotIdx === 0) {
    abilityCooldownMax = cdCalculated;
    abilityCooldownCurrent = cdCalculated;
  }
  updateHud();
}
window.attemptTriggerAbilitySlot = attemptTriggerAbilitySlot;

function attemptTriggerAbility() {
  attemptTriggerAbilitySlot(0);
}

function triggerEMPBlast() {
  if (window.audio) window.audio.hyperActive ? window.audio.hyperActive() : window.audio.shockwaveSound();
  screenShake = 10;
  enemyBullets.length = 0; // Clear all enemy bullets on screen
  spawnParticles(CONFIG.width / 2, CONFIG.height / 2, '#00f2fe', 30);
  addFloatingText('⚡ EMP GRID DISCHARGE! ⚡', CONFIG.width / 2 - 100, CONFIG.height / 2, '#00f2fe');

  // Stun / Damage Swarm Enemies
  if (window.roomManager && window.roomManager.swarmActive && window.roomManager.swarmEnemies) {
    for (let sIdx = window.roomManager.swarmEnemies.length - 1; sIdx >= 0; sIdx--) {
      const se = window.roomManager.swarmEnemies[sIdx];
      if (!se) continue;
      se.hp -= 3;
      se.frozen = true;
      se.vx = 8;
      spawnParticles(se.x, se.y, '#00f2fe', 8);
      if (se.hp <= 0 && window.roomManager.destroySwarmEnemy) {
        window.roomManager.destroySwarmEnemy(se, spawnParticles, addFloatingText);
      }
    }
  }

  // Stun Duel AI / Mini-Boss / Boss
  if (bennieBoss && !bennieBoss.isDefeated && (currentAppScreen === 'BENNIE_BOSS' || roomType === 'BENNIE_ARENA')) {
    bennieBoss.isStaggered = true;
    bennieBoss.staggerTimer = 90;
    damageBennie(2, 'ability_emp', { ability: 'emp_blast' });
    addFloatingText('BENNIE OVERHEATED! ⚡', bennieBoss.x - 40, bennieBoss.y - 30, '#ffd700');
  } else if (ai.active && currentAppScreen !== 'BENNIE_BOSS' && roomType !== 'BENNIE_ARENA') {
    ai.stunTimer = 180;
    ai.hp = Math.max(1, ai.hp - 1);
    addFloatingText('AI STUNNED! ⚡', ai.x - 30, ai.y, '#ffd700');
  }
}

function triggerCryoFreeze() {
  if (window.audio) window.audio.powerupGet();
  screenShake = 4;
  addFloatingText('❄️ CRYO FLASH FREEZE! ❄️', player.x + 40, player.y, '#00e676');

  // Freeze swarm enemies
  if (window.roomManager && window.roomManager.swarmActive && window.roomManager.swarmEnemies) {
    window.roomManager.swarmEnemies.forEach(se => {
      se.frozen = true;
      se.frozenTimer = 240;
      se.vx *= 0.2;
      se.vy *= 0.2;
      spawnParticles(se.x, se.y, '#00e676', 6);
    });
  }

  if (bennieBoss && !bennieBoss.isDefeated && (currentAppScreen === 'BENNIE_BOSS' || roomType === 'BENNIE_ARENA')) {
    bennieBoss.staggerTimer = Math.max(bennieBoss.staggerTimer, 90);
    damageBennie(1, 'ability_cryo', { ability: 'cryo_freeze' });
    addFloatingText('BENNIE CHILLED! ❄️', bennieBoss.x - 40, bennieBoss.y - 30, '#00e676');
  } else if (ai.active && currentAppScreen !== 'BENNIE_BOSS' && roomType !== 'BENNIE_ARENA') {
    ai.frozenTimer = 240;
    addFloatingText('FROZEN! ❄️', ai.x - 20, ai.y, '#00e676');
  }

  // Slow active balls for precise setup
  balls.forEach(b => {
    b.vx *= 0.45;
    b.vy *= 0.45;
    spawnParticles(b.x, b.y, '#00e676', 6);
  });
}

function triggerOverdriveBoost() {
  if (window.audio) window.audio.overdriveActive();
  screenShake = 6;
  player.isOverdrive = true;
  player.overdriveGauge = 100;
  addFloatingText('🔥 OVERDRIVE THRUSTER! 🔥', player.x + 40, player.y, '#ff007f');
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff007f', 16);
  const origSpeed = player.speedMult || 1.0;
  player.speedMult = origSpeed * 1.5;
  setTimeout(() => {
    player.speedMult = origSpeed;
  }, 3500);
}

function triggerNanoSwarm() {
  if (window.audio) window.audio.repairHull ? window.audio.repairHull() : window.audio.powerupGet();
  if (player.hp < player.maxHp) {
    player.hp = Math.min(player.maxHp, player.hp + 1);
    addFloatingText('+1 HP REPAIRED! ❤️', player.x + 40, player.y - 15, '#ff2a6d');
  }
  window.activeBuffs.shieldCharges = Math.min(4, (window.activeBuffs.shieldCharges || 0) + 1);
  addFloatingText('🛡️ +1 SHIELD CHARGE!', player.x + 40, player.y + 15, '#00e676');
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#00e676', 20);
}

function triggerRailgunSnipe() {
  if (window.audio) window.audio.railgunBlast();
  screenShake = 14;
  lasers.push({
    x: player.x + player.w + 4,
    y: player.y + player.h / 2 - 6,
    vx: 28,
    vy: 0,
    w: 70,
    h: 16,
    color: '#00f2fe',
    fromPlayer: true,
    piercing: true,
    damage: 10
  });
  spawnParticles(player.x + player.w, player.y + player.h / 2, '#00f2fe', 16);
  addFloatingText('🎯 HYPER RAILGUN STRIKE!', player.x + 50, player.y, '#00f2fe');
}

function triggerQuantumClone() {
  if (balls.length === 0) return;
  if (window.audio) window.audio.ballSplit ? window.audio.ballSplit() : window.audio.powerupGet();
  const newBalls = [];
  balls.forEach(b => {
    newBalls.push({
      ...b,
      id: nextBallUniqueId++,
      x: b.x,
      y: b.y + (Math.random() - 0.5) * 20,
      vx: b.vx * (0.9 + Math.random() * 0.2),
      vy: -b.vy,
      isQuantum: true,
      color: '#d500f9'
    });
  });
  newBalls.forEach(nb => balls.push(nb));
  addFloatingText('🔮 QUANTUM DUPLICATION!', player.x + 40, player.y, '#d500f9');
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#d500f9', 16);
}

function triggerGravityVortex() {
  if (window.audio) window.audio.hyperActive ? window.audio.hyperActive() : window.audio.powerupGet();
  screenShake = 8;
  addFloatingText('🕳️ GRAVITATIONAL SINGULARITY!', CONFIG.width / 2 - 110, CONFIG.height / 2, '#8b5cf6');
  spawnParticles(CONFIG.width / 2, CONFIG.height / 2, '#8b5cf6', 24);

  // Pull active balls toward center
  balls.forEach(b => {
    const ang = Math.atan2(CONFIG.height / 2 - b.y, CONFIG.width / 2 - b.x);
    b.vx += Math.cos(ang) * 4;
    b.vy += Math.sin(ang) * 4;
  });

  // Pull swarm enemies toward center & damage them
  if (window.roomManager && window.roomManager.swarmActive && window.roomManager.swarmEnemies) {
    for (let sIdx = window.roomManager.swarmEnemies.length - 1; sIdx >= 0; sIdx--) {
      const se = window.roomManager.swarmEnemies[sIdx];
      if (!se) continue;
      const ang = Math.atan2(CONFIG.height / 2 - se.y, CONFIG.width / 2 - se.x);
      se.vx += Math.cos(ang) * 5;
      se.vy += Math.sin(ang) * 5;
      se.hp -= 2;
      if (se.hp <= 0 && window.roomManager.destroySwarmEnemy) {
        window.roomManager.destroySwarmEnemy(se, spawnParticles, addFloatingText);
      }
    }
  }
}

function triggerMissileBarrage() {
  if (window.audio) window.audio.turretShoot ? window.audio.turretShoot() : window.audio.laserShoot();
  screenShake = 6;
  for (let i = 0; i < 8; i++) {
    const ang = ((i - 3.5) / 4) * 0.45;
    lasers.push({
      x: player.x + player.w + 4,
      y: player.y + player.h / 2 + (i - 3.5) * 6,
      vx: Math.cos(ang) * 16,
      vy: Math.sin(ang) * 16,
      w: 12,
      h: 6,
      color: '#ef4444',
      fromPlayer: true,
      piercing: false,
      damage: 3
    });
  }
  addFloatingText('🚀 MICRO-MISSILE BARRAGE!', player.x + 40, player.y, '#ef4444');
  spawnParticles(player.x + player.w, player.y + player.h / 2, '#ef4444', 16);
}

function triggerTimeDilation() {
  if (window.audio) window.audio.paddleHit(true);
  timeScale = 0.35;
  timeScaleTimer = 270; // ~4.5 seconds
  addFloatingText('⏳ CHRONO TIME WARP (4.5s)!', player.x + 40, player.y, '#38bdf8');
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#38bdf8', 16);
}

function triggerAegisDome() {
  if (window.audio) window.audio.powerupGet();
  window.aegisDomeTimer = 360; // 6 seconds
  addFloatingText('🛡️ FORTRESS ENERGY DOME ACTIVE!', player.x + 40, player.y, '#00b0ff');
  spawnParticles(player.x, player.y + player.h / 2, '#00b0ff', 20);
}

function triggerChainLightning() {
  if (window.audio) window.audio.shockwaveSound ? window.audio.shockwaveSound() : window.audio.laserShoot();
  screenShake = 8;
  addFloatingText('⚡ TESLA ARC OVERLOAD!', player.x + 40, player.y, '#ffd700');
  let targetsHit = 0;

  // Hit bricks
  for (let br of bricks) {
    if (targetsHit >= 8) break;
    queueBrickDamage(br.id, 3);
    spawnParticles(br.x + br.w / 2, br.y + br.h / 2, '#ffd700', 8);
    targetsHit++;
  }
  processDamageQueue();

  // Hit swarm
  if (window.roomManager && window.roomManager.swarmActive && window.roomManager.swarmEnemies) {
    for (let sIdx = window.roomManager.swarmEnemies.length - 1; sIdx >= 0; sIdx--) {
      const se = window.roomManager.swarmEnemies[sIdx];
      if (!se) continue;
      if (targetsHit < 8) {
        se.hp -= 3;
        spawnParticles(se.x, se.y, '#ffd700', 8);
        addFloatingText('-3 ⚡', se.x, se.y, '#ffd700');
        if (se.hp <= 0 && window.roomManager.destroySwarmEnemy) {
          window.roomManager.destroySwarmEnemy(se, spawnParticles, addFloatingText);
        }
        targetsHit++;
      }
    }
  }

  // Hit Bennie Boss or AI opponent
  if (bennieBoss && !bennieBoss.isDefeated && (currentAppScreen === 'BENNIE_BOSS' || roomType === 'BENNIE_ARENA')) {
    damageBennie(3, 'ability_chain_lightning', { ability: 'chain_lightning' });
    spawnParticles(bennieBoss.x, bennieBoss.y, '#ffd700', 16);
    addFloatingText('-3 ⚡', bennieBoss.x - 30, bennieBoss.y - 30, '#ffd700');
  } else if (ai.active && currentAppScreen !== 'BENNIE_BOSS' && roomType !== 'BENNIE_ARENA' && targetsHit < 8) {
    ai.hp = Math.max(1, ai.hp - 1);
    spawnParticles(ai.x, ai.y + ai.h / 2, '#ffd700', 12);
    addFloatingText('-1 ⚡', ai.x, ai.y, '#ffd700');
  }
}

function triggerOrbitalLaser() {
  if (window.audio) window.audio.railgunBlast ? window.audio.railgunBlast() : window.audio.tntExplode();
  screenShake = 16;
  let targetX = CONFIG.width - 80;
  let targetY = CONFIG.height / 2;

  if (bennieBoss && !bennieBoss.isDefeated && (currentAppScreen === 'BENNIE_BOSS' || roomType === 'BENNIE_ARENA')) {
    targetX = bennieBoss.x;
    targetY = bennieBoss.y;
    damageBennie(8, 'ability_orbital_laser', { ability: 'orbital_laser' });
    addFloatingText('ION BLAST! -8 HP', bennieBoss.x - 40, bennieBoss.y - 30, '#f43f5e');
  } else if (ai.active && currentAppScreen !== 'BENNIE_BOSS' && roomType !== 'BENNIE_ARENA') {
    targetX = ai.x;
    targetY = ai.y + ai.h / 2;
    ai.hp = Math.max(1, ai.hp - 2);
    addFloatingText('ION BLAST! -2 HP', ai.x - 40, ai.y, '#f43f5e');
  } else if (window.roomManager && window.roomManager.swarmActive && window.roomManager.swarmEnemies && window.roomManager.swarmEnemies.length > 0) {
    const sorted = [...window.roomManager.swarmEnemies].sort((a, b) => b.hp - a.hp);
    const target = sorted[0];
    targetX = target.x;
    targetY = target.y;
    target.hp -= 10;
    if (target.hp <= 0 && window.roomManager.destroySwarmEnemy) {
      window.roomManager.destroySwarmEnemy(target, spawnParticles, addFloatingText);
    }
  } else if (bricks.length > 0) {
    const br = bricks[Math.floor(bricks.length / 2)];
    targetX = br.x + br.w / 2;
    targetY = br.y + br.h / 2;
    queueBrickDamage(br.id, 10);
    processDamageQueue();
  }

  spawnParticles(targetX, targetY, '#f43f5e', 24);
  addFloatingText('🛰️ ORBITAL ION CANNON STRIKE!', targetX - 80, targetY - 30, '#f43f5e');
}

function triggerDroneMissileSalvo() {
  if (window.audio) window.audio.turretShoot();
  const droneCount = (collectedArtifacts.has('nano_sentry') ? 1 : 0) + (collectedArtifacts.has('defense_satellite') ? 1 : 0) + 2;
  for (let i = 0; i < droneCount * 2; i++) {
    const ang = (Math.random() - 0.5) * 0.6;
    lasers.push({
      x: player.x + player.w + 6,
      y: player.y + (Math.random() * player.h),
      vx: Math.cos(ang) * 18,
      vy: Math.sin(ang) * 18,
      w: 10,
      h: 5,
      color: '#eab308',
      fromPlayer: true,
      piercing: false,
      damage: 2
    });
  }
  addFloatingText('🐝 DRONE SALVO!', player.x + 40, player.y + player.h, '#eab308');
}

function fireMegaRailgun(isHyperRail) {
  if (window.audio) window.audio.railgunBlast();
  screenShake = isHyperRail ? 16 : 12;

  if (isHyperRail) {
    [-0.15, -0.07, 0, 0.07, 0.15].forEach(ang => {
      lasers.push({
        x: player.x + player.w + 4,
        y: player.y + player.h / 2 - 5,
        vx: Math.cos(ang) * 26,
        vy: Math.sin(ang) * 26,
        w: 55,
        h: 14,
        color: '#ffd700',
        fromPlayer: true,
        piercing: true,
        damage: 8
      });
    });
    addFloatingText('🌟 HYPER RAILGUN FUSION! 🌟', player.x + 50, player.y - 20, '#ffd700');
  } else {
    lasers.push({
      x: player.x + player.w + 4,
      y: player.y + player.h / 2 - 5,
      vx: 24,
      w: 50,
      h: 12,
      color: '#ffd700',
      fromPlayer: true,
      piercing: true,
      damage: 6
    });
    addFloatingText('⚡ MEGA-RAILGUN FIRED! ⚡', player.x + 50, player.y - 15, '#ffd700');
  }
  spawnParticles(player.x + player.w, player.y + player.h / 2, '#ffd700', 18);
}

function triggerKineticShockwave() {
  if (window.audio) window.audio.shockwaveSound();
  screenShake = 6;
    shockwaves.push({
    x: player.x + player.w / 2,
    y: player.y + player.h / 2,
    radius: 10,
    maxRadius: 280,
    speed: 10,
    alpha: 1
  });

  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i];
    const dist = Math.hypot(eb.x - (player.x + player.w / 2), eb.y - (player.y + player.h / 2));
    if (dist < 280) {
      spawnParticles(eb.x, eb.y, '#00b0ff', 8);
      if (window.audio && typeof window.audio.invulnDeflect === 'function') window.audio.invulnDeflect();
      enemyBullets.splice(i, 1);
    }
  }

  // Intercept and destroy Bennie's hostile prototype gears within shockwave radius
  if (bennieBoss && Array.isArray(bennieBoss.gears)) {
    for (let gIdx = bennieBoss.gears.length - 1; gIdx >= 0; gIdx--) {
      const g = bennieBoss.gears[gIdx];
      const dist = Math.hypot(g.x - (player.x + player.w / 2), g.y - (player.y + player.h / 2));
      if (dist <= 280 + (g.radius || 13)) {
        spawnParticles(g.x, g.y, '#00f2fe', 14);
        addFloatingText('GEAR DESTROYED!', g.x, g.y, '#00f2fe');
        if (window.audio && typeof window.audio.invulnDeflect === 'function') window.audio.invulnDeflect();
        bennieBoss.gears.splice(gIdx, 1);
      }
    }
  }

  balls.forEach(b => {
    const dist = Math.hypot(b.x - (player.x + player.w / 2), b.y - (player.y + player.h / 2));
    if (dist < 280) {
      b.vx = Math.abs(b.vx) * 1.25 * player.smashBonus;
      b.speed = Math.min(b.speed + 1.2, getFloorMaxSpeed());
      spawnParticles(b.x, b.y, '#00f2fe', 8);
    }
  });

  const pCenter = { x: player.x + player.w / 2, y: player.y + player.h / 2 };
  bricks.forEach(br => {
    const dist = Math.hypot(br.x + br.w / 2 - pCenter.x, br.y + br.h / 2 - pCenter.y);
    if (dist < 260) queueBrickDamage(br.id, 2);
  });
  if (window.roomManager && window.roomManager.swarmActive && window.roomManager.swarmEnemies) {
    for (let sIdx = window.roomManager.swarmEnemies.length - 1; sIdx >= 0; sIdx--) {
      const se = window.roomManager.swarmEnemies[sIdx];
      const dist = Math.hypot(se.x - pCenter.x, se.y - pCenter.y);
      if (dist < 280) {
        se.hp -= 2;
        se.vx = 8;
        spawnParticles(se.x, se.y, '#00f2fe', 10);
        addFloatingText('-2 EMP', se.x, se.y, '#00f2fe');
        if (se.hp <= 0 && window.roomManager.destroySwarmEnemy) {
          window.roomManager.destroySwarmEnemy(se, spawnParticles, addFloatingText);
        }
      }
    }
  }

  // Chief Architect Bennie Boss active ability integration with standard range rules
  if (bennieBoss && !bennieBoss.isDefeated && (currentAppScreen === 'BENNIE_BOSS' || roomType === 'BENNIE_ARENA')) {
    // Normal ability range check against Bennie's hitbox (strict <= 280 standard radius)
    const closestX = Math.max(bennieBoss.x - bennieBoss.w / 2, Math.min(pCenter.x, bennieBoss.x + bennieBoss.w / 2));
    const closestY = Math.max(bennieBoss.y - bennieBoss.h / 2, Math.min(pCenter.y, bennieBoss.y + bennieBoss.h / 2));
    const distToBennie = Math.hypot(closestX - pCenter.x, closestY - pCenter.y);

    if (distToBennie <= 280) {
      if (bossChallengeState === 'intro') {
        bossChallengeState = 'combat';
      }
      let dmg = 2.0;
      if (primaryPath === 'kinetic') dmg *= 1.5;
      if (collectedArtifacts.has('resonator_coil')) dmg *= 1.5;
      if (collectedArtifacts.has('kinetic_battery')) dmg *= 1.25;
      if (isMarketModActive('mod_glass_cannon')) dmg *= 1.4;

      damageBennie(dmg, 'ability_kinetic_shock', { ability: 'shockwave' });
      spawnParticles(closestX, closestY, '#00f2fe', 18);
      addFloatingText(`KINETIC SHOCK! -${Math.round(dmg)} HP`, bennieBoss.x - 40, bennieBoss.y - 40, '#00f2fe');
    }
  }

  processDamageQueue();
  addFloatingText('EMP SHOCKWAVE!', player.x + 40, player.y, '#00f2fe');
}

function triggerPlasmaVolley() {
  if (window.audio) window.audio.laserShoot();
  screenShake = 4;
  [player.y + 8, player.y + player.h / 2, player.y + player.h - 8].forEach(yPos => {
    lasers.push({
      x: player.x + player.w + 4,
      y: yPos,
      vx: 16,
      w: 16,
      h: 4,
      color: '#00b0ff',
      fromPlayer: true,
      piercing: true,
      damage: 2
    });
  });
  addFloatingText('TRIPLE LASER!', player.x + 40, player.y, '#00b0ff');
}

function triggerGravityAnchor() {
  if (balls.length === 0) return;
  if (window.audio) window.audio.paddleHit(true);

  const minV = getFloorMinSpeed();
  balls.forEach(b => {
    b.vx = -Math.abs(b.vx || minV);
    b.x = Math.max(player.x + player.w + 10, b.x - 50);
  });

  let nearestBall = balls[0];
  let minD = 999999;
  balls.forEach(b => {
    const d = Math.hypot(b.x - player.x, b.y - (player.y + player.h / 2));
    if (d < minD) {
      minD = d;
      nearestBall = b;
    }
  });

  if (nearestBall) {
    nearestBall.x = player.x + player.w + nearestBall.radius + 2;
    nearestBall.y = player.y + player.h / 2;
    nearestBall.vx = 0;
    nearestBall.vy = 0;
    player.magnetHeldBall = nearestBall;
    spawnParticles(player.x + player.w, player.y + player.h / 2, '#d500f9', 10);
    addFloatingText('QUANTUM TETHER!', player.x + 40, player.y, '#d500f9');
  }
}

function getFloorMinSpeed() {
  if (roomType === 'BREAKOUT' || roomType === 'SWARM' || roomType === 'MELTDOWN') {
    if (currentFloor <= 5) return 4.8;
    if (currentFloor <= 15) return 5.6;
    return 6.2;
  }
  return currentFloor <= 5 ? 6.2 : 7.6;
}

function getFloorMaxSpeed() {
  const baseCap = (roomType === 'BREAKOUT' || roomType === 'SWARM' || roomType === 'MELTDOWN')
    ? (currentFloor <= 5 ? 10.5 : (currentFloor <= 15 ? 12.0 : 13.8))
    : (currentFloor <= 5 ? 13.5 : 17.5);
  return collectedArtifacts.has('rail_accelerator') ? baseCap * 1.25 : baseCap;
}

// Damage pipeline with rebalanced poison & acid resistance
let pendingDamageMap = new Map();

function queueBrickDamage(brickId, dmg) {
  const current = pendingDamageMap.get(brickId) || 0;
  pendingDamageMap.set(brickId, current + dmg);
}

function processDamageQueue() {
  if (pendingDamageMap.size === 0) return;

  const activeShieldZones = [];
  for (let i = 0; i < bricks.length; i++) {
    const br = bricks[i];
    if (br.type === 'generator' && br.hp > 0 && !br.shieldStripped) {
      activeShieldZones.push({ cx: br.x + br.w / 2, cy: br.y + br.h / 2, radius: 70, genId: br.id });
    }
  }

  const explosionQueue = [];
  const contagionQueue = [];
  const explodedTntIds = new Set();

  for (let i = 0; i < bricks.length; i++) {
    const br = bricks[i];
    if (pendingDamageMap.has(br.id)) {
      let isProtected = false;
      if (br.type !== 'generator') {
        for (const zone of activeShieldZones) {
          if (zone.genId !== br.id) {
            const dist = Math.hypot(br.x + br.w / 2 - zone.cx, br.y + br.h / 2 - zone.cy);
            if (dist < zone.radius) {
              isProtected = true;
              break;
            }
          }
        }
      }

      if (isProtected) {
        if (window.audio) window.audio.wallBounce();
        spawnParticles(br.x + br.w / 2, br.y + br.h / 2, '#00b0ff', 3);
        continue;
      }

      let dmg = pendingDamageMap.get(br.id);
      if (isMarketModActive('mod_glass_cannon')) dmg *= 1.4;
      if (collectedArtifacts.has('executioner_protocol') && (br.hp / (br.maxHp || 1)) <= 0.25) {
        dmg *= 3;
      }

      br.hp -= dmg;
      br.regenCooldown = 300;
      spawnParticles(br.x + br.w / 2, br.y + br.h / 2, getBrickColor(br.type), 4);

      if (br.hp <= 0) {
        if (br.type === 'tnt' && !explodedTntIds.has(br.id)) {
          explodedTntIds.add(br.id);
          explosionQueue.push({ cx: br.x + br.w / 2, cy: br.y + br.h / 2 });
        }
        if (br.infected && collectedArtifacts.has('contagion_core')) {
          contagionQueue.push({
            cx: br.x + br.w / 2,
            cy: br.y + br.h / 2,
            chainDepth: br.acidChainDepth || 0
          });
        }
        // Bio Spore Mine
        if (collectedArtifacts.has('bio_spore_mine') && br.infected) {
          spawnParticles(br.x + br.w / 2, br.y + br.h / 2, '#00e676', 8);
          addFloatingText('🍄 SPORE DETONATION!', br.x, br.y, '#00e676');
        }
        // Pyro Magma Eruption
        if (collectedArtifacts.has('pyro_magma_eruption') && br.burning) {
          for (let f = 0; f < 3; f++) {
            lasers.push({
              x: br.x + br.w / 2,
              y: br.y + br.h / 2,
              vx: -10 + Math.random() * 20,
              vy: -6 + Math.random() * 12,
              w: 8,
              h: 8,
              color: '#ff5500',
              fromPlayer: true,
              damage: 2
            });
          }
          addFloatingText('🌋 MAGMA ERUPTION!', br.x, br.y, '#ff5500');
        }
        // Nanite Swarm Infector
        if (collectedArtifacts.has('nanite_swarm_infector')) {
          const adj = bricks.find(b => b.id !== br.id && b.hp > 0 && Math.hypot(b.x - br.x, b.y - br.y) < 65);
          if (adj) {
            adj.hp = Math.max(0, adj.hp - 2);
            spawnParticles(adj.x, adj.y, '#38bdf8', 6);
          }
        }
        // Resonance Acoustic Shatter
        if (collectedArtifacts.has('resonance_acoustic_shatter') && Math.random() < 0.25) {
          bricks.filter(b => b.id !== br.id && Math.abs(b.y - br.y) < 15).forEach(b => { b.hp = Math.max(0, b.hp - 1); });
          addFloatingText('🔊 ROW SHATTER!', br.x, br.y, '#ec4899');
        }
        // Artillery Flak Barrage
        if (collectedArtifacts.has('artillery_flak_barrage')) {
          enemyBullets = enemyBullets.filter(eb => Math.hypot(eb.x - br.x, eb.y - br.y) > 100);
        }
      }
    }
  }
  pendingDamageMap.clear();

  // TNT explosion resolve
  const TNT_RADIUS = 75;
  while (explosionQueue.length > 0) {
    const expl = explosionQueue.shift();
    if (window.audio) window.audio.tntExplode();
    screenShake = Math.min(screenShake + 4, 10);
    spawnParticles(expl.cx, expl.cy, '#ff2a6d', 10);

    let blastCount = 0;
    for (let i = 0; i < bricks.length; i++) {
      const br = bricks[i];
      if (br.hp <= 0 && explodedTntIds.has(br.id)) continue;

      const dist = Math.hypot(br.x + br.w / 2 - expl.cx, br.y + br.h / 2 - expl.cy);
      if (dist < TNT_RADIUS && blastCount < 5) {
        br.hp -= 2;
        blastCount++;
        if (br.hp <= 0 && br.type === 'tnt' && !explodedTntIds.has(br.id)) {
          explodedTntIds.add(br.id);
          explosionQueue.push({ cx: br.x + br.w / 2, cy: br.y + br.h / 2 });
        }
      }
    }
  }

  // Strictly controlled Pandemic Outbreak
  const isPandemic = collectedArtifacts.has('bio_residue') && collectedArtifacts.has('contagion_core');

  while (contagionQueue.length > 0) {
    const ctg = contagionQueue.shift();
    if (ctg.chainDepth >= POISON_CONFIG.maxChainDepth) continue;

    if (window.audio) window.audio.acidSizzle();
    spawnParticles(ctg.cx, ctg.cy, '#00e676', 12);
    addFloatingText(isPandemic ? 'PANDEMIC CONTAGION' : 'CONTAGION SPREAD', ctg.cx - 30, ctg.cy, '#00e676');

    let targetsInfected = 0;
    for (let i = 0; i < bricks.length; i++) {
      const br = bricks[i];
      if (!br.infected && br.hp > 0) {
        const dist = Math.hypot(br.x + br.w / 2 - ctg.cx, br.y + br.h / 2 - ctg.cy);
        if (dist < 80) {
          br.infected = true;
          br.acidTicks = POISON_CONFIG.durationTicks;
          br.acidChainDepth = ctg.chainDepth + 1;
          targetsInfected++;
          if (targetsInfected >= POISON_CONFIG.maxPropagationTargets) break;
        }
      }
    }
  }

  const scavBonus = (metaSave.upgrades.meta_scavenger || 0) * 0.05;
  const surviving = [];
  for (let i = 0; i < bricks.length; i++) {
    const br = bricks[i];
    if (br.hp <= 0) {
      if (window.audio) window.audio.brickBreak();
      const pts = (br.type === 'titanium' ? 120 : (br.type === 'generator' ? 150 : 50)) + (combo * 4);
      runScore += pts;
      addFloatingText(`+${pts}`, br.x, br.y);

      if (br.type !== 'normal' && Math.random() < 0.05 + scavBonus) {
        spawnCoin(br.x, br.y, 1);
      }
      if (br.type === 'mystery' || Math.random() < 0.12 + scavBonus) {
        spawnPowerupDrop(br.x, br.y);
      }
    } else {
      surviving.push(br);
    }
  }
  bricks = surviving;
}

function clampVelocity(val, min, max) {
  if (isNaN(val) || !isFinite(val)) return min;
  if (Math.abs(val) < min) return Math.sign(val || 1) * min;
  if (Math.abs(val) > max) return Math.sign(val) * max;
  return val;
}

function createBall(x, y, vx, vy) {
  const minV = getFloorMinSpeed();
  const maxV = getFloorMaxSpeed();
  return {
    x: Number(x) || (CONFIG.width / 2),
    y: Number(y) || (CONFIG.height / 2),
    vx: clampVelocity(vx || minV, minV, maxV),
    vy: clampVelocity(vy || (Math.random() * 4 - 2), 1.5, maxV),
    speed: minV,
    radius: activeBuffs.megaBall > 0 ? 18 : CONFIG.ballRadius,
    trail: []
  };
}

function spawnParticles(x, y, color, count = 6) {
  const maxPool = (typeof CONFIG !== 'undefined' && CONFIG.maxParticles) ? CONFIG.maxParticles : 250;
  const safeCount = Math.min(count, Math.max(0, maxPool - particles.length));
  for (let i = 0; i < safeCount; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = Math.random() * 3.5 + 1;
    particles.push({
      x: x || 0,
      y: y || 0,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      alpha: 1,
      size: Math.random() * 2.4 + 1,
      color: color || '#00f2fe'
    });
  }
}

function addFloatingText(text, x, y, color = '#ffd700') {
  if (floatingTexts.length > 14) floatingTexts.shift();
  floatingTexts.push({ text, x, y, alpha: 1, vy: -1.2, color });
}

function spawnCoin(x, y, amount = 1) {
  if (coinDrops.length < 12) {
    coinDrops.push({ x, y, vx: -2.0, vy: (Math.random() - 0.5) * 1.2, amount });
  }
}

const POWERUP_DEFS = (typeof DROP_REGISTRY !== 'undefined') ? DROP_REGISTRY : {
  mega_ball: { name: 'Mega Ball', icon: '🌕', color: '#ffd700', category: 'ATTACK', rarity: 'Uncommon', modes: ['universal'] },
  fire_ball: { name: 'Fireball', icon: '🔥', color: '#ff5500', category: 'ATTACK', rarity: 'Common', modes: ['universal'] },
  energy_shield: { name: 'Energy Shield', icon: '🛡️', color: '#00b0ff', category: 'DEFENSE', rarity: 'Common', modes: ['universal'] },
  repair_core: { name: 'Nanite Repair', icon: '❤️', color: '#ff2a6d', category: 'DEFENSE', rarity: 'Common', modes: ['universal'] },
  data_vacuum: { name: 'Chip Magnetizer', icon: '🧲', color: '#14b8a6', category: 'UTILITY', rarity: 'Common', modes: ['universal'] }
};

function spawnPowerupDrop(x, y, roomTypeHint) {
  if (powerupDrops.length >= 6) return;

  // Determine current mode for game-mode-aware drops
  let currentMode = 'breakout';
  if (roomTypeHint) {
    currentMode = roomTypeHint.toLowerCase();
  } else if (ai && ai.active) {
    currentMode = 'duel';
  } else if (window.roomManager && window.roomManager.swarmActive) {
    currentMode = 'swarm';
  } else if (window.roomManager && window.roomManager.heistActive) {
    currentMode = 'heist';
  } else if (typeof currentRoomType !== 'undefined' && currentRoomType) {
    currentMode = currentRoomType.toLowerCase();
  }

  const reg = (typeof DROP_REGISTRY !== 'undefined') ? DROP_REGISTRY : POWERUP_DEFS;
  const eligible = [];
  const rarityWeights = { Common: 45, Uncommon: 30, Rare: 16, Epic: 7, Legendary: 2 };

  Object.keys(reg).forEach(dropKey => {
    const d = reg[dropKey];
    if (!d) return;

    // Strict Ball duplication cap: never spawn split_ball if already at or near 8 balls
    if (dropKey === 'split_ball' && balls && balls.length >= 8) return;

    // Check mode compatibility
    const modes = Array.isArray(d.modes) ? d.modes : ['universal'];
    const isCompatible = modes.includes('universal') || modes.includes(currentMode);
    if (!isCompatible) return;

    const weight = rarityWeights[d.rarity] || 25;
    for (let w = 0; w < weight; w++) {
      eligible.push(dropKey);
    }
  });

  if (eligible.length > 0) {
    const chosenKey = eligible[Math.floor(Math.random() * eligible.length)];
    const def = reg[chosenKey] || { name: 'Drop', icon: '⚡', color: '#00f2fe' };
    powerupDrops.push({
      x,
      y,
      w: 28,
      h: 28,
      vx: -1.6,
      type: chosenKey,
      category: def.category || 'ATTACK',
      rarity: def.rarity || 'Common',
      color: def.color || '#00f2fe'
    });
  }
}
window.spawnPowerupDrop = spawnPowerupDrop;

// Room generator coordinating all 5 rooms
function generateRoom(floor) {
  currentFloor = floor;
  if (floor > metaSave.highestFloor) {
    metaSave.highestFloor = floor;
    saveMetaProgress();
  }

  const prevSector = currentSector;
  currentSector = Math.min(5, Math.floor((floor - 1) / 10) + 1);

  if (currentSector !== prevSector || floor === 1) {
    triggerSectorTitleCard(currentSector);
  }

  bricks = [];
  lasers = [];
  enemyBullets = [];
  powerupDrops = [];
  coinDrops = [];
  particles = [];
  phantomBalls = [];
  floatingTexts = [];
  shockwaves = [];
  lightningArcs = [];
  duelRallyCount = 0;
  isHyperSpike = false;
  timeScale = 1.0;
  timeScaleTimer = 0;
  voidPhaseActive = 0;
  player.invulnerableTimer = 0;
  victorySequenceTimer = 0;
  overchargeAirTime = 0;

  activeBuffs.fireball = 0;
  activeBuffs.lightning = 0;
  activeBuffs.twinBlasters = 0;
  activeBuffs.megaBall = 0;

  const activeChar = CHARACTERS[metaSave.selectedChar] || CHARACTERS.vanguard;
  roomType = window.roomManager.getRoomTypeForFloor(floor, activeGameMode);
  window.roomType = roomType;

  if (activeGameMode === 'MAIN') {
    const floorLabel = floor > 50 ? `OVERDRIVE ${floor}` : `LEVEL ${floor}/50`;
    document.getElementById('hudFloorBadge').textContent = `SECTOR ${currentSector} • ${floorLabel} (${roomType})`;
  } else {
    const modeName = (typeof GAME_MODES !== 'undefined' && GAME_MODES[activeGameMode]) ? GAME_MODES[activeGameMode].name : activeGameMode;
    document.getElementById('hudFloorBadge').textContent = `${modeName.toUpperCase()} • LEVEL ${floor} (${roomType})`;
  }

  // Apply base HP + meta hull upgrades + archetype bonuses
  const baseMetaHp = 4 + (metaSave.upgrades.meta_hull || 0) + activeChar.hpBonus;
  let archetypeHpBonus = 0;
  if (primaryPath === 'juggernaut') archetypeHpBonus += 2;
  if (collectedArtifacts.has('reinforced_hull')) archetypeHpBonus += 1;
  if (collectedArtifacts.has('iron_bastion')) archetypeHpBonus += 1;
  if (isMarketModActive('mod_titan_chassis')) {
    archetypeHpBonus += 2;
    activeBuffs.shieldCharges = Math.max(activeBuffs.shieldCharges, 1);
  }
  if (isMarketModActive('mod_glass_cannon')) archetypeHpBonus -= 1;
  player.maxHp = Math.max(2, baseMetaHp + archetypeHpBonus);

  if (floor === 1) {
    player.hp = player.maxHp;
    activeBallTransformation = 'normal';
    usedUniqueBallsThisRun.clear();
    primaryPath = null;
    secondaryBranch = null;
  }

  // Speed scaling with archetypes & perks
  let archetypeSpeedMult = 1.0;
  if (primaryPath === 'fast') archetypeSpeedMult = 1.25;
  else if (primaryPath === 'juggernaut') archetypeSpeedMult = 0.85;

  let perkSpeedBonus = 1.0;
  if (collectedArtifacts.has('speed_demon')) perkSpeedBonus += 0.20;
  if (collectedArtifacts.has('turbo_servo')) perkSpeedBonus += 0.15;
  if (collectedArtifacts.has('hyper_servo')) perkSpeedBonus += 0.25;
  if (collectedArtifacts.has('iron_hull')) perkSpeedBonus -= 0.10;
  if (isMarketModActive('mod_overclocked_servos')) perkSpeedBonus *= 1.30;
  if (isMarketModActive('mod_titan_chassis')) perkSpeedBonus *= 0.85;

  const charSpeedMult = (activeChar && activeChar.speedMult) || (activeChar && activeChar.stats ? activeChar.stats.speed / 75 : 1.0) || 1.0;
  const charSmash = (activeChar && activeChar.smashBonus) || (activeChar && activeChar.stats ? activeChar.stats.power / 70 : 1.0) || 1.0;
  const charSizeMult = (activeChar && activeChar.paddleSizeMult) || (activeChar && activeChar.stats ? activeChar.stats.size / 75 : 1.0) || 1.0;

  const metaSpeed = 1 + (metaSave.upgrades.meta_servos || 0) * 0.08;
  player.speedMult = metaSpeed * charSpeedMult * archetypeSpeedMult * perkSpeedBonus;
  player.smashBonus = charSmash * (primaryPath === 'fast' ? 1.2 : 1.0);
  player.burnChance = (activeChar && activeChar.burnChance) || 0;
  player.isVoid = !!(activeChar && activeChar.isVoid);
  player.isChrono = !!(activeChar && activeChar.isChrono);
  player.droneCommander = !!(activeChar && activeChar.droneCommander);
  player.glitchArchitect = !!(activeChar && activeChar.glitchArchitect);

  let baseH = CONFIG.basePaddleH * charSizeMult;
  if (primaryPath === 'juggernaut') baseH *= 1.30;
  if (collectedArtifacts.has('titanium_paddle')) baseH *= 1.25;
  if (collectedArtifacts.has('iron_hull')) baseH *= 1.15;
  if (collectedArtifacts.has('iron_bastion')) baseH *= 1.15;
  if (collectedArtifacts.has('aegis_bulwark')) baseH *= 1.20;
  if (collectedArtifacts.has('bismuth_alloy')) baseH *= 1.10;
  if (collectedArtifacts.has('hyper_servo')) baseH *= 0.95;
  if (isMarketModActive('mod_overclocked_servos')) baseH *= 0.85;
  player.h = (!isNaN(baseH) && baseH > 0) ? baseH : CONFIG.basePaddleH;
  player.w = CONFIG.basePaddleW || 16;
  if (floor === 1 || isNaN(player.y) || player.y === undefined) {
    player.y = CONFIG.height / 2 - player.h / 2;
  }
  player.x = 42;

  player.color = primaryPath && BUILD_PATHS[primaryPath] ? BUILD_PATHS[primaryPath].color : (activeChar.color || '#00f2fe');
  player.modifier = (activeChar && activeChar.modifier) || 'magnetic_edge';
  player.magnetHeldBall = null;

  if (player.adrenalineTriggered && player.hp > 1) {
    player.speedBonus = Math.max(0, (player.speedBonus || 0) - 0.15);
    player.adrenalineTriggered = false;
  }

  // Centralized Room State Lifecycle Cleanup: guarantees strictly ONE active game mode
  if (window.roomManager && typeof window.roomManager.cleanupAllRoomState === 'function') {
    window.roomManager.cleanupAllRoomState();
  }
  ai.active = false;
  powerOrb = null;
  enemyBullets.length = 0;
  lasers.length = 0;

  // Initialize selected room
  if (roomType === 'BREAKOUT') {
    const cols = floor <= 5 ? Math.min(4, 2 + Math.floor(floor / 2)) : Math.min(8, 4 + Math.floor(floor / 2));
    const rows = floor <= 5 ? 6 : 8;
    createTacticalBricksGrid(floor, cols, rows, CONFIG.width - (cols * 44) - 40);
  } else if (roomType === 'DUEL') {
    ai.active = true;
    ai.hp = 3;
    ai.maxHp = 3;
    ai.stunTimer = 0;
    ai.frozenTimer = 0;
    ai.burnTimer = 0;

    // Pick personality based on floor progression
    let pKey = 'aggressor';
    if (floor <= 2) pKey = 'aggressor';
    else if (floor <= 6) pKey = 'defender';
    else if (floor <= 10) pKey = 'trickster';
    else if (floor <= 14) pKey = 'artillery';
    else pKey = 'overclocked';

    const pers = (typeof DUEL_PERSONALITIES !== 'undefined' && DUEL_PERSONALITIES[pKey]) ? DUEL_PERSONALITIES[pKey] : {
      id: 'aggressor', name: 'Cyber-Aggressor', color: '#ff2a6d', speedMult: 1.15, sizeMult: 1.0, aggression: 0.85, attackCooldown: 220
    };

    ai.personality = pers;
    ai.personalityKey = pKey;
    if (typeof recordThreatDiscovery === 'function') {
      recordThreatDiscovery('duel_' + pKey);
    }
    ai.color = pers.color;
    ai.w = 16;
    ai.h = Math.round(CONFIG.basePaddleH * (pers.sizeMult || 1.0));
    ai.y = CONFIG.height / 2 - ai.h / 2;
    ai.x = CONFIG.width - 48;
    ai.speedMult = pers.speedMult;
    ai.attackCooldown = pers.attackCooldown;
    ai.shootCooldown = pers.attackCooldown;
    ai.rageActive = false;

    window.currentDuelPersonality = pers;
    duelMomentum = 1;
    window.duelMomentum = 1;
    duelTimer = 0;
    window.duelTimer = 0;

    powerOrb = {
      x: CONFIG.width / 2,
      y: CONFIG.height / 2,
      radius: 20,
      cooldown: 0,
      bobPhase: 0
    };
  } else if (roomType === 'SWARM') {
    window.roomManager.initSwarmSurvival(floor);
  } else if (roomType === 'HEIST') {
    window.roomManager.initCyberHeist(floor, activeGameMode === 'HEIST_ENDLESS');
  } else if (roomType === 'SHOP') {
    window.roomManager.initShop(floor);
    openShopModal();
  } else if (roomType === 'CASINO') {
    window.roomManager.initCasino(floor);
    openCasinoModal();
  } else if (roomType === 'MINI_BOSS') {
    ai.active = true;

    const miniDef = (typeof MINI_BOSS_DEFINITIONS !== 'undefined' && MINI_BOSS_DEFINITIONS[floor]) 
      ? MINI_BOSS_DEFINITIONS[floor] 
      : { name: 'Pulse Vanguard', hp: 5 + Math.floor(floor / 8), color: '#00b0ff', speedMult: 1.15, desc: 'Heavy Elite Opponent' };

    ai.name = miniDef.name;
    ai.subtitle = 'MINI-BOSS ELITE';
    ai.hp = miniDef.hp;
    ai.maxHp = miniDef.hp;
    ai.color = miniDef.color || '#00b0ff';
    ai.speedMult = miniDef.speedMult || 1.1;
    ai.w = 18;
    ai.h = 85;
    ai.y = CONFIG.height / 2 - ai.h / 2;
    ai.x = CONFIG.width - 52;
    ai.attackCooldown = 120;
    ai.shootCooldown = 120;
    ai.stunTimer = 0;
    ai.frozenTimer = 0;
    ai.burnTimer = 0;
    ai.isMiniBoss = true;
    ai.isBoss = false;
    ai.phases = 1;
    ai.currentPhase = 1;

    powerOrb = {
      x: CONFIG.width / 2,
      y: CONFIG.height / 2,
      radius: 22,
      cooldown: 0,
      bobPhase: 0
    };
    createTacticalBricksGrid(floor, 2, 5, CONFIG.width - 200);
    const miniMap = { 5: 'mini_pulse', 15: 'mini_bastion', 25: 'mini_phantom', 35: 'mini_siege', 45: 'mini_void' };
    if (typeof recordThreatDiscovery === 'function') {
      recordThreatDiscovery(miniMap[floor] || 'mini_pulse');
    }
    triggerBossIntroScan(miniDef, true);
  } else if (roomType === 'BOSS') {
    ai.active = true;
    window.roomManager.swarmActive = false;
    window.roomManager.reactorActive = false;
    window.roomManager.casinoActive = false;

    const bossFloorKey = [10, 20, 30, 40, 50].includes(floor) ? floor : 10;
    const bossDef = (typeof BOSS_DEFINITIONS !== 'undefined' && BOSS_DEFINITIONS[bossFloorKey])
      ? BOSS_DEFINITIONS[bossFloorKey]
      : { name: 'Cyber Titan', subtitle: 'Armored Siege Colossus', hp: 8 + Math.floor(floor / 5), color: '#ff2a6d', phases: 2 };

    const bossMap = { 10: 'boss_titan', 20: 'boss_nexus', 30: 'boss_hive', 40: 'boss_quantum', 50: 'boss_archon' };
    if (typeof recordThreatDiscovery === 'function') {
      recordThreatDiscovery(bossMap[bossFloorKey] || 'boss_titan');
    }

    ai.name = bossDef.name;
    ai.subtitle = bossDef.subtitle;
    ai.hp = bossDef.hp;
    ai.maxHp = bossDef.hp;
    ai.color = bossDef.color || '#ff2a6d';
    ai.theme = bossDef.theme;
    ai.phases = bossDef.phases || 2;
    ai.currentPhase = 1;
    ai.speedMult = 1.25;
    ai.w = 22;
    ai.h = 100;
    ai.y = CONFIG.height / 2 - ai.h / 2;
    ai.x = CONFIG.width - 56;
    ai.attackCooldown = 90;
    ai.shootCooldown = 90;
    ai.stunTimer = 0;
    ai.frozenTimer = 0;
    ai.burnTimer = 0;
    ai.isBoss = true;
    ai.isMiniBoss = false;

    powerOrb = {
      x: CONFIG.width / 2,
      y: CONFIG.height / 2,
      radius: 24,
      cooldown: 0,
      bobPhase: 0
    };
    createTacticalBricksGrid(floor, 3, 6, CONFIG.width - 240);
    triggerBossIntroScan(bossDef, false);
  }

  if (roomType === 'DUEL' && ai.personality) {
    startServeCountdown(0.6, `DUEL: ${ai.personality.name.toUpperCase()}`);
  } else {
    startServeCountdown(1.0, `FLOOR ${floor}: ${roomType}`);
  }
  updateHud();
  renderArtifactTray();
  saveMidRunSession();
}

function triggerSectorTitleCard(sectorNum) {
  if (window.audio) window.audio.sectorTitleChime();
  const sec = SECTOR_NAMES[sectorNum - 1] || SECTOR_NAMES[0];
  sectorBannerTitle = `SECTOR 0${sec.num}: ${sec.name}`;
  sectorBannerSub = sec.sub;
  sectorBannerTimer = 160;
}

function createTacticalBricksGrid(floor, cols, rows, startX) {
  const brickW = 28;
  const brickH = 46;
  const gapX = 14;
  const gapY = 12;
  const startY = 65;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      let type = 'normal';
      let hp = 1;
      let acidResistance = 0.0;

      if (floor <= 3) {
        const rand = Math.random();
        if (rand < 0.12) { type = 'tnt'; hp = 1; }
        else if (rand < 0.22) { type = 'mystery'; hp = 1; }
        else { type = 'normal'; hp = 1; }
      } else if (floor <= 5) {
        const rand = Math.random();
        if (rand < 0.20) { type = 'titanium'; hp = 2; acidResistance = 0.5; }
        else if (rand < 0.32) { type = 'regenerator'; hp = 2; }
        else if (rand < 0.44) { type = 'tnt'; hp = 1; }
        else if (rand < 0.54) { type = 'mystery'; hp = 1; }
        else { type = 'normal'; hp = 1; }
      } else {
        const rand = Math.random();
        if (rand < 0.07) { type = 'generator'; hp = 3; acidResistance = 0.7; }
        else if (rand < 0.15) { type = 'phase'; hp = 2; }
        else if (rand < 0.23) { type = 'reflector'; hp = 3; acidResistance = 0.3; }
        else if (rand < 0.33) { type = 'titanium'; hp = 4; acidResistance = 0.5; }
        else if (rand < 0.43) { type = 'turret'; hp = 3; acidResistance = 0.3; }
        else if (rand < 0.51) { type = 'regenerator'; hp = 2; }
        else if (rand < 0.59) { type = 'cryo'; hp = 2; }
        else if (rand < 0.67) { type = 'acid'; hp = 2; }
        else if (rand < 0.77) { type = 'tnt'; hp = 1; }
        else if (rand < 0.87) { type = 'mystery'; hp = 1; }
        else { type = 'normal'; hp = 1; }
      }

      if (typeof recordThreatDiscovery === 'function') {
        if (type === 'phase') recordThreatDiscovery('brick_phase');
        else if (type === 'turret') recordThreatDiscovery('brick_turret');
        else if (type === 'regenerator') recordThreatDiscovery('brick_regen');
        else if (type === 'cryo') recordThreatDiscovery('brick_cryo');
        else if (type === 'acid') recordThreatDiscovery('brick_acid');
      }

      bricks.push({
        id: nextBrickUniqueId++,
        x: startX + c * (brickW + gapX),
        y: startY + r * (brickH + gapY),
        w: brickW,
        h: brickH,
        type,
        hp,
        maxHp: hp,
        acidResistance,
        phaseTick: (c * 30 + r * 20) % 240,
        isTangible: true,
        fireCooldown: 180 + Math.floor(Math.random() * 180),
        regenCooldown: 300,
        frozen: false,
        infected: false,
        acidTicks: 0,
        acidChainDepth: 0
      });
    }
  }
}

function getBrickColor(type) {
  switch (type) {
    case 'generator': return '#ffd700';
    case 'phase': return '#d500f9';
    case 'reflector': return '#e0e6ed';
    case 'titanium': return '#64748b';
    case 'turret': return '#f43f5e';
    case 'regenerator': return '#00e676';
    case 'cryo': return '#38bdf8';
    case 'acid': return '#84cc16';
    case 'tnt': return '#ff2a6d';
    case 'mystery': return '#ffd700';
    default: return '#00b0ff';
  }
}

function startServeCountdown(durationSeconds, message) {
  if (roomType === 'DUEL' && (!durationSeconds || durationSeconds < 2.0)) {
    durationSeconds = 2.2;
  }
  serveCountdown = durationSeconds;
  serveAnnouncement = message;
  serveWatchdogTimer = 0;
  ballLostWatchdogTimer = 0;
  duelRallyCount = 0;
  duelMomentum = 1;
  window.duelMomentum = 1;
  isHyperSpike = false;
  balls = [];
  phantomBalls = [];
  enemyBullets = [];
}

function executeServe() {
  if (bossChallengeState === 'intro') {
    bossChallengeState = 'combat';
  }
  if (window.audio) window.audio.serveBeep();
  const startSpeed = getFloorMinSpeed();
  const spawnX = player.x + player.w + 18;
  const spawnY = Math.max(25, Math.min(CONFIG.height - 25, player.y + player.h / 2));
  const vy = (Math.random() - 0.5) * 2.2;

  balls = [createBall(spawnX, spawnY, Math.abs(startSpeed), vy)];
  addFloatingText('SERVE!', spawnX + 24, spawnY - 16, roomType === 'DUEL' ? '#ffd700' : '#00f2fe');
  screenShake = Math.max(screenShake, 3);
  serveWatchdogTimer = 0;
  ballLostWatchdogTimer = 0;
}

// Main game update loop
function updateGame(dt) {
  try {
    if (bossScanIntroTimer > 0) {
      bossScanIntroTimer--;
      if (serveCountdown > 0) serveCountdown = 1.0;
      return;
    }

    if (victorySequenceTimer > 0) {
      victorySequenceTimer--;
      timeScale = 0.2;
      victoryShockwave += 7;
      if (victorySequenceTimer <= 0) {
        timeScale = 1.0;
        document.getElementById('gameHud').classList.remove('hud-retracted');
        document.getElementById('artifactTray').classList.remove('hud-retracted');
        document.getElementById('abilityGaugeContainer').classList.remove('hud-retracted');

        // Check if Floor 50 in MAIN mode was cleared -> Level 50 Victory Climax!
        if (activeGameMode === 'MAIN' && currentFloor === 50 && !isLevel50EndlessUnlocked) {
          triggerLevel50VictoryClimax();
          return;
        }

        // Check if Floor 2 was cleared -> Primary Path Selection!
        if (currentFloor === 2 && !primaryPath) {
          openPrimaryPathModal();
        } else if (currentFloor === 4 && !secondaryBranch) {
          // Floor 4 (Sector 1 Boss) was cleared -> Secondary Specialization!
          openSecondaryPathModal();
        } else {
          currentAppScreen = 'DRAFT';
          openDraftModal();
        }
      }
      return;
    }

    // Decrement equipped abilities cooldowns
    if (window.abilityCooldowns) {
      Object.keys(window.abilityCooldowns).forEach(k => {
        if (window.abilityCooldowns[k] > 0) window.abilityCooldowns[k]--;
      });
    }

    // Serve logic & Anti-freeze watchdog (Executed at top of loop to prevent soft-locks)
    if (serveCountdown > 0) {
      serveCountdown -= dt;
      serveWatchdogTimer += dt;
      if (serveCountdown <= 0 || serveWatchdogTimer >= 3.8) {
        serveCountdown = 0;
        serveWatchdogTimer = 0;
        executeServe();
      }
    } else {
      serveWatchdogTimer = 0;
      if (balls.length === 0 && (currentAppScreen === 'PLAYING' || currentAppScreen === 'BENNIE_BOSS') && !window.roomManager?.casinoActive && !window.roomManager?.activeShop && victorySequenceTimer <= 0) {
        ballLostWatchdogTimer += dt;
        if (ballLostWatchdogTimer >= 2.2) {
          ballLostWatchdogTimer = 0;
          startServeCountdown(0.6, 'AUTO-SERVE...');
        }
      } else {
        ballLostWatchdogTimer = 0;
      }
    }

    if (isMarketModActive('mod_nanite_infusion') && player.hp < player.maxHp) {
      window.naniteTimer = (window.naniteTimer || 0) + dt;
      if (window.naniteTimer >= 120) {
        window.naniteTimer = 0;
        player.hp = Math.min(player.maxHp, player.hp + 1);
        addFloatingText('+1 HP (NANITE REPAIR)', player.x + 35, player.y - 15, '#00e676');
        updateHud();
      }
    }

    if (timeScaleTimer > 0) {
      timeScaleTimer--;
      timeScale = 0.5;
      if (timeScaleTimer <= 0) timeScale = 1.0;
    } else {
      timeScale = 1.0;
    }

    if (roomType === 'DUEL' && serveCountdown <= 0 && victorySequenceTimer <= 0) {
      duelTimer += (dt || (1 / 60));
      window.duelTimer = duelTimer;
    }

    if (chronoCooldown > 0) chronoCooldown--;
    if (voidPhaseActive > 0) voidPhaseActive--;
    if (abilityCooldownCurrent > 0) abilityCooldownCurrent--;
    if (sectorBannerTimer > 0) sectorBannerTimer--;
    if (player.invulnerableTimer > 0) player.invulnerableTimer--;

    // Update afterimages
    for (let aiIdx = player.afterimages.length - 1; aiIdx >= 0; aiIdx--) {
      const aim = player.afterimages[aiIdx];
      aim.alpha -= 0.08;
      if (aim.alpha <= 0) player.afterimages.splice(aiIdx, 1);
    }

    if (comboTimer > 0) {
      comboTimer--;
      if (comboTimer <= 0) combo = 0;
    }

    if (activeBuffs.fireball > 0) activeBuffs.fireball--;
    if (activeBuffs.lightning > 0) activeBuffs.lightning--;
    if (activeBuffs.piercing > 0) {
      activeBuffs.piercing--;
      if (activeBuffs.piercing === 0) balls.forEach(b => b.isPiercing = false);
    }
    if (activeBuffs.drill > 0) activeBuffs.drill--;
    if (activeBuffs.magnet > 0) activeBuffs.magnet--;
    if (activeBuffs.orbitalDrone > 0) activeBuffs.orbitalDrone--;
    if (activeBuffs.megaBall > 0) {
      activeBuffs.megaBall--;
      if (activeBuffs.megaBall === 0) balls.forEach(b => b.radius = CONFIG.ballRadius);
    }

    // Twin blasters buff
    if (activeBuffs.twinBlasters > 0) {
      twinBlasterTick++;
      if (twinBlasterTick % 18 === 0) {
        if (window.audio) window.audio.laserShoot();
        lasers.push({ x: player.x + player.w + 2, y: player.y + 4, vx: 15, w: 14, h: 4, color: '#d500f9', fromPlayer: true, damage: 1 });
        lasers.push({ x: player.x + player.w + 2, y: player.y + player.h - 4, vx: 15, w: 14, h: 4, color: '#d500f9', fromPlayer: true, damage: 1 });
      }
    }

    // Drone & Autonomous Fleet logic
    const hasSentry = collectedArtifacts.has('nano_sentry') || player.droneCommander || primaryPath === 'drone' || (activeBuffs.orbitalDrone && activeBuffs.orbitalDrone > 0);
    const hasSat = collectedArtifacts.has('defense_satellite');
    const hasArcFusion = hasSentry && hasSat;
    const hasOverclock = collectedArtifacts.has('drone_overclock');
    const hasMissiles = collectedArtifacts.has('seeker_missiles');
    const hasOrbitalStrike = hasOverclock && hasMissiles;

    if (hasSentry) {
      sentryAngle += 0.05 * timeScale;
      sentryShootTick++;
      const targetTick = hasOverclock ? 45 : (player.droneCommander ? 54 : 90);

      const hasSwarmTargets = window.roomManager && Array.isArray(window.roomManager.swarmEnemies) && window.roomManager.swarmEnemies.length > 0;
      const hasHeistTargets = window.roomManager && Array.isArray(window.roomManager.heistCaches) && window.roomManager.heistCaches.length > 0;
      const hasNodeTargets = window.roomManager && Array.isArray(window.roomManager.heistNodes) && window.roomManager.heistNodes.length > 0;
      const hasAiTarget = ai && ai.active;
      const hasAnyTargets = bricks.length > 0 || hasSwarmTargets || hasHeistTargets || hasNodeTargets || hasAiTarget;

      if (sentryShootTick >= targetTick && hasAnyTargets) {
        sentryShootTick = 0;
        const sx = player.x + player.w / 2 + Math.cos(sentryAngle) * 46;
        const sy = player.y + player.h / 2 + Math.sin(sentryAngle) * 46;
        if (window.audio) window.audio.laserShoot();

        if (hasMissiles && Math.random() < 0.25) {
          if (window.audio) window.audio.missileShoot();
          lasers.push({ x: sx, y: sy, vx: 14, w: 18, h: 6, color: '#ffd700', fromPlayer: true, damage: 3, isMissile: true });
        } else {
          lasers.push({ x: sx, y: sy, vx: 12, w: 10, h: 3, color: '#00e676', fromPlayer: true, damage: 1 });
        }
      }
    }

    if (hasSat) {
      defenseSatY += (player.y + player.h / 2 - defenseSatY) * 0.15;
    }

    if (hasArcFusion) {
      const sentryPos = {
        x: player.x + player.w / 2 + Math.cos(sentryAngle) * 46,
        y: player.y + player.h / 2 + Math.sin(sentryAngle) * 46
      };
      const satPos = { x: player.x - 26, y: defenseSatY };

      if (Math.random() < 0.35) {
        if (window.audio) window.audio.arcZap();
        bricks.forEach(br => {
          if (br.x < sentryPos.x + 50 && br.y > Math.min(sentryPos.y, satPos.y) - 25 && br.y < Math.max(sentryPos.y, satPos.y) + 25) {
            queueBrickDamage(br.id, 2);
            spawnParticles(br.x, br.y, '#00f2fe', 3);
          }
        });
      }
    }

    if (hasOrbitalStrike) {
      orbitalStrikeTimer += 1 * timeScale;
      if (orbitalStrikeTimer >= 240) {
        orbitalStrikeTimer = 0;
        const hasSwarmTargetsOrb = window.roomManager && Array.isArray(window.roomManager.swarmEnemies) && window.roomManager.swarmEnemies.length > 0;
        const hasHeistTargetsOrb = window.roomManager && Array.isArray(window.roomManager.heistCaches) && window.roomManager.heistCaches.length > 0;
        const hasAiTargetOrb = ai && ai.active;
        const hasAnyTargetsOrb = bricks.length > 0 || hasSwarmTargetsOrb || hasHeistTargetsOrb || hasAiTargetOrb;

        if (hasAnyTargetsOrb) {
          if (window.audio) window.audio.orbitalStrike();
          screenShake = 10;
          const target = bricks[0] || (hasSwarmTargetsOrb ? window.roomManager.swarmEnemies[0] : null) || (hasHeistTargetsOrb ? window.roomManager.heistCaches[0] : null) || (hasAiTargetOrb ? ai : null);
          if (target) {
            lasers.push({ x: target.x, y: 0, vx: 0, vy: 28, w: 16, h: 600, color: '#ffd700', fromPlayer: true, damage: 6, piercing: true });
            addFloatingText('ORBITAL STRIKE!', target.x - 30, target.y - 20, '#ffd700');
          }
        }
      }
    }

    if (collectedArtifacts.has('overcharge_capacitor')) {
      overchargeAirTime += 1;
    }

    // Update Room Special Modes
    if (roomType === 'SWARM') {
      window.roomManager.updateSwarm(timeScale, player, balls, lasers, enemyBullets, spawnParticles, addFloatingText);
    } else if (roomType === 'HEIST') {
      if (typeof window.roomManager.updateCyberHeist === 'function') {
        window.roomManager.updateCyberHeist(dt || (1 / 60), player, balls, lasers, enemyBullets, spawnParticles, addFloatingText);
      }
    }

    if (powerOrb) {
      powerOrb.bobPhase += 0.04;
      powerOrb.y = (CONFIG.height / 2) + Math.sin(powerOrb.bobPhase) * 45;
      if (powerOrb.cooldown > 0) powerOrb.cooldown--;
    }

    // Update Bricks in Breakout / Boss
    for (let i = 0; i < bricks.length; i++) {
      const br = bricks[i];

      if (br.type === 'phase') {
        br.phaseTick = (br.phaseTick + 1) % 240;
        br.isTangible = (br.phaseTick < 160);
      }

      if (br.acidTicks > 0) {
        const tickInterval = collectedArtifacts.has('toxic_catalyst') ? 48 : POISON_CONFIG.tickIntervalTicks;
        if (br.acidTicks % tickInterval === 0) {
          if (window.audio) window.audio.acidSizzle();
          const dmg = Math.max(1, Math.floor(POISON_CONFIG.damagePerTick * (1 - (br.acidResistance || 0))));
          queueBrickDamage(br.id, dmg);
          spawnParticles(br.x + br.w / 2, br.y + br.h / 2, '#00e676', 3);
        }
        br.acidTicks--;
      }

      if (br.type === 'regenerator' && br.hp < br.maxHp) {
        br.regenCooldown--;
        if (br.regenCooldown <= 0) {
          br.hp++;
          br.regenCooldown = 300;
          spawnParticles(br.x + br.w / 2, br.y + br.h / 2, '#00e676', 6);
          addFloatingText('+1 HP', br.x, br.y - 10, '#00e676');
        }
      }

      if (br.type === 'turret' && enemyBullets.length < 5 && serveCountdown <= 0) {
        br.fireCooldown--;
        if (br.fireCooldown <= 0) {
          br.fireCooldown = 240;
          if (window.audio) window.audio.turretShoot();
          enemyBullets.push({
            x: br.x - 6,
            y: br.y + br.h / 2,
            vx: -3.5 * timeScale,
            radius: 5.5,
            color: '#f43f5e'
          });
        }
      }
    }

    if (player.isChrono && chronoCooldown <= 0) {
      for (let b of balls) {
        if (b.vx < 0 && b.x < 130 && b.x > player.x + player.w) {
          chronoCooldown = 1200;
          timeScaleTimer = 90;
          if (window.audio) window.audio.paddleHit(true);
          addFloatingText('CHRONO SLOWMO (1.5s)!', player.x + 35, player.y - 20, '#00b0ff');
          break;
        }
      }
    }

    // Enemy bullets update
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const eb = enemyBullets[i];

      if (collectedArtifacts.has('gravity_well_inverter') && eb.x < 180) {
        eb.vy += (eb.y < player.y + player.h / 2 ? -0.8 : 0.8);
      }

      // Guardian Network fusion drone intercept
      if (collectedArtifacts.has('guardian_drone') && Math.hypot(eb.x - player.x, eb.y - (player.y + player.h / 2)) < 65) {
        spawnParticles(eb.x, eb.y, '#00b0ff', 6);
        enemyBullets.splice(i, 1);
        continue;
      }

      eb.x += eb.vx * timeScale;
      if (eb.vy) eb.y += eb.vy * timeScale;

      if (activeBallTransformation === 'graviton' && balls.length > 0) {
        const b = balls[0];
        const distToBall = Math.hypot(eb.x - b.x, eb.y - b.y);
        if (distToBall < 65) {
          spawnParticles(eb.x, eb.y, '#6366f1', 6);
          enemyBullets.splice(i, 1);
          continue;
        }
      }

      if (eb.x - eb.radius <= player.x + player.w &&
          eb.x + eb.radius >= player.x &&
          eb.y >= player.y && eb.y <= player.y + player.h) {

        if (serveCountdown > 0 || player.invulnerableTimer > 0 || voidPhaseActive > 0) {
          if (window.audio) window.audio.invulnDeflect();
          spawnParticles(eb.x, eb.y, '#00f2fe', 6);
          addFloatingText('DEFLECTED!', player.x + 35, player.y, '#00f2fe');
          enemyBullets.splice(i, 1);
          continue;
        }

        playerHurt();
        spawnParticles(eb.x, eb.y, '#f43f5e', 8);
        enemyBullets.splice(i, 1);
        continue;
      }

      if (eb.x < 0) enemyBullets.splice(i, 1);
    }

    // Paddle movement with Velocity Overdrive & Dash
    const curH = (!isNaN(player.h) && player.h > 0) ? player.h : CONFIG.basePaddleH;
    player.h = curH;
    const prevY = isNaN(player.y) ? (CONFIG.height / 2 - curH / 2) : player.y;
    if (controlMode === 'mouse') {
      const destY = mouseCanvasY - curH / 2;
      const clampedY = Math.max(8, Math.min(CONFIG.height - curH - 8, destY));
      player.vy = isNaN(clampedY) ? 0 : clampedY - prevY;
      player.y = isNaN(clampedY) ? prevY : clampedY;
    } else {
      const up = keys.ArrowUp || keys.KeyW;
      const down = keys.ArrowDown || keys.KeyS;
      const spdMult = (!isNaN(player.speedMult) && player.speedMult > 0) ? player.speedMult : 1.0;
      const accel = 2.4 * spdMult;

      if (up) player.vy -= accel;
      if (down) player.vy += accel;

      // Soft-cap deceleration curve
      const maxSpd = 14 * spdMult;
      player.vy = clampVelocity(player.vy, 0, maxSpd);
      player.vy *= 0.80;
      player.y = isNaN(player.y) ? (CONFIG.height / 2 - curH / 2) : player.y + player.vy;
    }

    // Velocity Overdrive tracking
    const movedDelta = Math.abs(player.y - prevY);
    if (movedDelta > 2.0) {
      player.overdriveGauge = Math.min(100, player.overdriveGauge + 0.6);
      player.lastMovedTick = performance.now();
      if (player.overdriveGauge >= 100 && !player.isOverdrive) {
        player.isOverdrive = true;
        if (window.audio) window.audio.overdriveActive();
        addFloatingText('⚡ VELOCITY OVERDRIVE! ⚡', player.x + 35, player.y - 15, '#ffd700');
      }
    } else {
      player.overdriveGauge = Math.max(0, player.overdriveGauge - 0.4);
      if (player.overdriveGauge < 50) player.isOverdrive = false;
    }

    player.y = Math.max(8, Math.min(CONFIG.height - 8 - curH, isNaN(player.y) ? (CONFIG.height / 2 - curH / 2) : player.y));

    if (player.magnetHeldBall) {
      player.magnetHeldBall.x = player.x + player.w + player.magnetHeldBall.radius + 1;
      player.magnetHeldBall.y = player.y + player.h / 2;
    }

    // Shockwaves - expanding wavefront projectile destruction
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += sw.speed * timeScale;
      sw.alpha = 1 - (sw.radius / sw.maxRadius);

      // Active expanding wavefront enemy projectile destruction
      for (let bIdx = enemyBullets.length - 1; bIdx >= 0; bIdx--) {
        const eb = enemyBullets[bIdx];
        if (Math.hypot(eb.x - sw.x, eb.y - sw.y) <= sw.radius + (eb.radius || 5)) {
          spawnParticles(eb.x, eb.y, '#00f2fe', 8);
          if (window.audio && typeof window.audio.invulnDeflect === 'function') window.audio.invulnDeflect();
          enemyBullets.splice(bIdx, 1);
        }
      }

      // Active expanding wavefront Bennie prototype gear destruction
      if (bennieBoss && Array.isArray(bennieBoss.gears)) {
        for (let gIdx = bennieBoss.gears.length - 1; gIdx >= 0; gIdx--) {
          const g = bennieBoss.gears[gIdx];
          if (Math.hypot(g.x - sw.x, g.y - sw.y) <= sw.radius + (g.radius || 13)) {
            spawnParticles(g.x, g.y, '#00f2fe', 14);
            addFloatingText('GEAR SHATTERED!', g.x, g.y, '#00f2fe');
            if (window.audio && typeof window.audio.invulnDeflect === 'function') window.audio.invulnDeflect();
            bennieBoss.gears.splice(gIdx, 1);
          }
        }
      }

      if (sw.radius >= sw.maxRadius) shockwaves.splice(i, 1);
    }

    for (let i = lightningArcs.length - 1; i >= 0; i--) {
      const arc = lightningArcs[i];
      arc.life--;
      if (arc.life <= 0) lightningArcs.splice(i, 1);
    }

    // AI Paddle
    if (ai.active && currentAppScreen !== 'BENNIE_BOSS' && roomType !== 'BENNIE_ARENA') {
      if (ai.burnTimer > 0) {
        ai.burnTimer--;
        if (ai.burnTimer % 60 === 0) {
          ai.hp--;
          if (window.audio) window.audio.hurt();
          addFloatingText('-1 HP (BURN)', ai.x - 30, ai.y, '#ff5500');
          if (ai.hp <= 0) {
            handleRoomVictory();
            return;
          }
        }
      }

      if (ai.stunTimer > 0) {
        ai.stunTimer--;
        if (Math.random() < 0.3) spawnParticles(ai.x + ai.w / 2, ai.y + Math.random() * ai.h, '#ffd700', 2);
      } else if (ai.frozenTimer > 0) {
        ai.frozenTimer--;
        if (ai.frozenTimer === 1) {
          spawnParticles(ai.x + ai.w / 2, ai.y + ai.h / 2, '#00f2fe', 16);
          spawnParticles(ai.x + ai.w / 2, ai.y + ai.h / 2, '#ffffff', 10);
          if (window.audio && typeof window.audio.brickHit === 'function') window.audio.brickHit();
        }
      } else {
        let targetBall = null;
        let minDistance = 99999;
        balls.forEach(b => {
          if (b.vx > 0 && b.x < ai.x) {
            const d = ai.x - b.x;
            if (d < minDistance) {
              minDistance = d;
              targetBall = b;
            }
          }
        });

        // AI Speed scaling by personality & frozen status
        let baseAiSpeed = (currentFloor <= 5 ? 4.0 : (roomType === 'BOSS' ? 6.2 : 5.4)) * (ai.speedMult || 1.0);
        if (ai.frozenTimer > 0) baseAiSpeed *= 0.65; // Cryo slow

        // Trickster adds a subtle sinusoidal target offset to impart spin
        let targetOffset = 0;
        if (ai.personalityKey === 'trickster' && targetBall) {
          targetOffset = Math.sin(Date.now() * 0.007) * (ai.h * 0.35);
        }

        const targetY = targetBall ? (targetBall.y - ai.h / 2 + targetOffset) : (CONFIG.height / 2 - ai.h / 2);
        const speed = baseAiSpeed * timeScale;
        const delta = targetY - ai.y;
        ai.y += Math.sign(delta) * Math.min(Math.abs(delta) * (currentFloor <= 5 ? 0.14 : 0.20), speed);
        ai.y = Math.max(8, Math.min(CONFIG.height - 8 - ai.h, ai.y));

        // Aggressor positioning: advances forward into court when ball is approaching
        if (ai.personalityKey === 'aggressor') {
          const targetX = (targetBall && targetBall.x > CONFIG.width * 0.52 && targetBall.vx > 0) ? (CONFIG.width - 78) : (CONFIG.width - 48);
          ai.x += (targetX - ai.x) * 0.12;
        } else {
          ai.x = CONFIG.width - 48;
        }

        // Overclocked Rage state at 1 HP
        if (ai.personalityKey === 'overclocked' && ai.hp === 1 && !ai.rageActive) {
          ai.rageActive = true;
          ai.speedMult = (ai.speedMult || 1.22) * 1.25;
          ai.color = '#ff1144';
          spawnParticles(ai.x, ai.y + ai.h / 2, '#ff1144', 16);
          addFloatingText('⚠️ APEX ENRAGED! (+25% SPEED)', ai.x - 70, ai.y - 10, '#ff1144');
          if (window.audio) window.audio.hyperActive();
        }

        // Artillery Blaster Attack
        if (ai.personalityKey === 'artillery' && serveCountdown <= 0) {
          ai.shootCooldown = (ai.shootCooldown || 180) - 1;
          if (ai.shootCooldown <= 30 && ai.shootCooldown > 0) {
            if (Math.random() < 0.35) spawnParticles(ai.x - 8, ai.y + ai.h / 2, '#ffd700', 1);
          } else if (ai.shootCooldown <= 0) {
            ai.shootCooldown = (ai.personality && ai.personality.attackCooldown) || 160;
            if (window.audio) window.audio.laserShoot();
            enemyBullets.push({
              x: ai.x - 12,
              y: ai.y + ai.h / 2,
              vx: -7.5 * timeScale,
              vy: 0,
              radius: 6,
              color: '#ffd700',
              fromEnemy: true,
              damage: 1
            });
            spawnParticles(ai.x - 12, ai.y + ai.h / 2, '#ffd700', 8);
          }
        }

        if (roomType === 'BOSS' || roomType === 'MINI_BOSS') {
          // Boss Phase transition check
          if (ai.phases >= 2 && ai.currentPhase === 1 && ai.hp <= Math.floor(ai.maxHp / 2)) {
            ai.currentPhase = 2;
            ai.speedMult = (ai.speedMult || 1.1) * 1.25;
            screenShake = 18;
            spawnParticles(ai.x, ai.y + ai.h / 2, ai.color, 35);
            addFloatingText('⚠️ OVERDRIVE: PHASE 2 ENGAGED!', CONFIG.width / 2 - 130, CONFIG.height / 2 - 20, '#ff1144');
            if (window.audio && typeof window.audio.hyperActive === 'function') window.audio.hyperActive();
          }

          if (serveCountdown <= 0) {
            ai.shootCooldown = (ai.shootCooldown || 120) - 1;
          if (ai.shootCooldown <= 0) {
            ai.shootCooldown = roomType === 'BOSS' ? (ai.currentPhase >= 2 ? 80 : 120) : 140;
            if (window.audio) window.audio.laserShoot();
            const laserColor = ai.color || '#ff2a6d';
            lasers.push({
              x: ai.x - 8,
              y: ai.y + ai.h / 2,
              vx: -8.5 * timeScale,
              w: 16,
              h: 4,
              color: laserColor,
              fromPlayer: false,
              damage: 1
            });
            if (ai.currentPhase >= 2) {
              lasers.push({
                x: ai.x - 8,
                y: ai.y + 12,
                vx: -8.0 * timeScale,
                vy: -1.2 * timeScale,
                w: 14,
                h: 4,
                color: laserColor,
                fromPlayer: false,
                damage: 1
              });
              lasers.push({
                x: ai.x - 8,
                y: ai.y + ai.h - 12,
                vx: -8.0 * timeScale,
                vy: 1.2 * timeScale,
                w: 14,
                h: 4,
                color: laserColor,
                fromPlayer: false,
                damage: 1
              });
            }
          }
        }
      }
    }
  }

    // Lasers update
    for (let i = lasers.length - 1; i >= 0; i--) {
      const l = lasers[i];
      l.x += l.vx * timeScale;
      if (l.vy) l.y += l.vy * timeScale;

      if (l.fromPlayer) {
        if (bennieBoss && !bennieBoss.isDefeated && (currentAppScreen === 'BENNIE_BOSS' || roomType === 'BENNIE_ARENA')) {
          const b = bennieBoss;
          if (l.x >= b.x - b.w / 2 && l.x <= b.x + b.w / 2 && l.y >= b.y - b.h / 2 && l.y <= b.y + b.h / 2) {
            damageBennie(l.damage || 2, 'laser', { laser: l });
            spawnParticles(l.x, l.y, l.color || '#00b0ff', 10);
            if (!l.piercing) {
              lasers.splice(i, 1);
              continue;
            }
          }
        }

        if (ai.active && currentAppScreen !== 'BENNIE_BOSS' && roomType !== 'BENNIE_ARENA' && l.x >= ai.x && l.x <= ai.x + ai.w && l.y >= ai.y && l.y <= ai.y + ai.h) {
          ai.stunTimer = 60;
          if (roomType === 'BOSS' || roomType === 'MINI_BOSS') {
            ai.hp--;
            if (window.audio) window.audio.hurt();
            addFloatingText(`-1 HP (${ai.hp}/${ai.maxHp})`, ai.x - 30, ai.y, '#ff5500');
            if (ai.hp <= 0) {
              handleRoomVictory();
              return;
            }
          } else {
            if (window.audio) window.audio.aiStunned();
            addFloatingText('⚡ AI STUNNED! ⚡', ai.x - 50, ai.y, '#ffd700');
          }
          spawnParticles(l.x, l.y, '#ffd700', 8);
          if (!l.piercing) lasers.splice(i, 1);
          continue;
        }

        for (let bIdx = 0; bIdx < bricks.length; bIdx++) {
          const br = bricks[bIdx];
          if (l.x >= br.x && l.x <= br.x + br.w && l.y >= br.y && l.y <= br.y + br.h) {
            queueBrickDamage(br.id, l.damage || 2);

            if (collectedArtifacts.has('prism_lens') && !l.hasSplit) {
              lasers.push({ x: br.x + br.w + 2, y: br.y, vx: 12, vy: -3, w: 10, h: 3, color: '#00b0ff', fromPlayer: true, damage: 1, hasSplit: true });
              lasers.push({ x: br.x + br.w + 2, y: br.y + br.h, vx: 12, vy: 3, w: 10, h: 3, color: '#00b0ff', fromPlayer: true, damage: 1, hasSplit: true });
              addFloatingText('PRISM SPLIT!', br.x, br.y - 12, '#00b0ff');
            }

            if (!l.piercing) lasers.splice(i, 1);
            break;
          }
        }
      } else {
        if (voidPhaseActive <= 0 && player.invulnerableTimer <= 0 && serveCountdown <= 0 &&
            l.x <= player.x + player.w && l.x >= player.x &&
            l.y >= player.y && l.y <= player.y + player.h) {
          playerHurt();
          lasers.splice(i, 1);
          continue;
        }
      }

      if (l.x < 0 || l.x > CONFIG.width) lasers.splice(i, 1);
    }

    // Phantom balls
    for (let i = phantomBalls.length - 1; i >= 0; i--) {
      const pb = phantomBalls[i];
      pb.x += pb.vx * timeScale;
      pb.y += pb.vy * timeScale;
      pb.life--;

      for (let j = 0; j < bricks.length; j++) {
        const br = bricks[j];
        if (pb.x >= br.x && pb.x <= br.x + br.w && pb.y >= br.y && pb.y <= br.y + br.h) {
          queueBrickDamage(br.id, collectedArtifacts.has('phase_inversion') ? 2 : 1);
          spawnParticles(pb.x, pb.y, '#d500f9', 6);
          pb.life = 0;
          break;
        }
      }

      if (pb.life > 0 && window.roomManager && window.roomManager.swarmActive && window.roomManager.swarmEnemies) {
        for (let sIdx = window.roomManager.swarmEnemies.length - 1; sIdx >= 0; sIdx--) {
          const se = window.roomManager.swarmEnemies[sIdx];
          if (Math.hypot(pb.x - se.x, pb.y - se.y) < pb.radius + se.radius) {
            se.hp -= (collectedArtifacts.has('phase_inversion') ? 2 : 1);
            spawnParticles(pb.x, pb.y, '#d500f9', 6);
            pb.life = 0;
            if (se.hp <= 0 && window.roomManager.destroySwarmEnemy) {
              window.roomManager.destroySwarmEnemy(se, spawnParticles, addFloatingText);
            }
            break;
          }
        }
      }

      if (pb.life <= 0 || pb.x < 0 || pb.x > CONFIG.width) phantomBalls.splice(i, 1);
    }

    // Drops & Coins
    for (let i = powerupDrops.length - 1; i >= 0; i--) {
      const p = powerupDrops[i];
      if (activeBuffs.magnet > 0) {
        const dx = (player.x + player.w / 2) - p.x;
        const dy = (player.y + player.h / 2) - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        p.vx += (dx / dist) * 0.45;
        p.y += (dy / dist) * 2.8 * timeScale;
      }
      p.x += p.vx * timeScale;
      if (p.x <= player.x + player.w && p.x + p.w >= player.x &&
          p.y + p.h >= player.y && p.y <= player.y + player.h) {
        applyPowerup(p.type);
        if (window.audio) window.audio.powerupGet();
        powerupDrops.splice(i, 1);
        continue;
      }
      if (p.x < 0) powerupDrops.splice(i, 1);
    }

    for (let i = coinDrops.length - 1; i >= 0; i--) {
      const c = coinDrops[i];
      if (activeBuffs.magnet > 0) {
        const dx = (player.x + player.w / 2) - c.x;
        const dy = (player.y + player.h / 2) - c.y;
        const dist = Math.hypot(dx, dy) || 1;
        c.vx += (dx / dist) * 0.6;
        c.vy += (dy / dist) * 2.8 * timeScale;
      }
      c.x += c.vx * timeScale;
      c.y += c.vy * timeScale;

      if (c.x <= player.x + player.w + 12 && c.x >= player.x - 12 &&
          c.y >= player.y - 12 && c.y <= player.y + player.h + 12) {
        runCoresEarned += c.amount;
        metaSave.cores += c.amount;
        saveMetaProgress();
        if (window.audio) window.audio.coinGet();
        addFloatingText(`+${c.amount} CORE`, player.x + 25, player.y, '#00b0ff');
        coinDrops.splice(i, 1);
        continue;
      }
      if (c.x < 0) coinDrops.splice(i, 1);
    }

    // Ball physics & rebounds
    const minV = getFloorMinSpeed();
    const maxV = getFloorMaxSpeed();

    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      if (player && player.magnetHeldBall === b) continue;
      if (!b.trail) b.trail = [];
      b.trail.push({ x: b.x, y: b.y });
      const currentSpeed = Math.hypot(b.vx, b.vy);
      const maxTrailLen = Math.min(18, Math.max(6, Math.floor(currentSpeed * 1.35)));
      while (b.trail.length > maxTrailLen) b.trail.shift();

      b.x += b.vx * timeScale;
      b.y += b.vy * timeScale;

      b.vx = clampVelocity(b.vx, minV, maxV);
      b.vy = clampVelocity(b.vy, 1.5, maxV);

      if (b.y - b.radius <= 0) {
        b.y = b.radius + 1;
        b.vy = Math.abs(b.vy);
        overchargeAirTime = Math.max(0, overchargeAirTime - 30);
        if (window.audio) window.audio.wallBounce();
      } else if (b.y + b.radius >= CONFIG.height) {
        b.y = CONFIG.height - b.radius - 1;
        b.vy = -Math.abs(b.vy);
        overchargeAirTime = Math.max(0, overchargeAirTime - 30);
        if (window.audio) window.audio.wallBounce();
      }

      if (collectedArtifacts.has('gravity_well_inverter') && b.vx < 0 && b.x < 110 && b.x > player.x + player.w) {
        const pMidY = player.y + player.h / 2;
        b.vy += (pMidY - b.y) * 0.04;
      }

      // Player Paddle Collision with Velocity Momentum
      if (b.vx < 0 &&
          b.x - b.radius <= player.x + player.w &&
          b.x + b.radius >= player.x &&
          b.y >= player.y - 2 && b.y <= player.y + player.h + 2) {

        if (voidPhaseActive > 0) {
          spawnParticles(b.x, b.y, '#d500f9', 8);
          addFloatingText('VOID PHASE THROUGH!', player.x + 40, player.y, '#d500f9');
        } else {
          b.x = player.x + player.w + b.radius + 1;
          handlePaddleRebound(b, player, true);
        }
      }

      if (collectedArtifacts.has('defense_satellite') && b.vx < 0 &&
          b.x - b.radius <= player.x - 12 && b.x + b.radius >= player.x - 30 &&
          Math.abs(b.y - defenseSatY) < 32) {
        b.x = player.x - 10;
        b.vx = Math.abs(b.vx);
        if (window.audio) window.audio.paddleHit();
        spawnParticles(b.x, b.y, '#00b0ff', 10);
        addFloatingText('SATELLITE BLOCK!', player.x - 40, b.y, '#00b0ff');
      }

      if (ai.active && currentAppScreen !== 'BENNIE_BOSS' && roomType !== 'BENNIE_ARENA' && b.vx > 0 &&
          b.x + b.radius >= ai.x &&
          b.x - b.radius <= ai.x + ai.w &&
          b.y >= ai.y - 2 && b.y <= ai.y + ai.h + 2) {
        b.x = ai.x - b.radius - 1;
        handlePaddleRebound(b, ai, false);
      }

      if (powerOrb && powerOrb.cooldown <= 0) {
        const orbDist = Math.hypot(b.x - powerOrb.x, b.y - powerOrb.y);
        if (orbDist <= b.radius + powerOrb.radius) {
          powerOrb.cooldown = 240;
          if (window.audio) window.audio.orbHit();
          spawnParticles(powerOrb.x, powerOrb.y, '#ffd700', 14);
          addFloatingText('ORB OF POWER!', powerOrb.x - 30, powerOrb.y - 25, '#ffd700');
          spawnPowerupDrop(powerOrb.x - 20, powerOrb.y);
          b.vx = -b.vx;
        }
      }

      checkBrickCollisions(b);

      if (window.roomManager && window.roomManager.swarmActive && typeof window.roomManager.checkBallCollision === 'function') {
        window.roomManager.checkBallCollision(b, player, spawnParticles, addFloatingText);
      }
      if (window.roomManager && window.roomManager.heistActive && typeof window.roomManager.checkCyberHeistBallHit === 'function') {
        window.roomManager.checkCyberHeistBallHit(b, player, spawnParticles, addFloatingText);
      }

      if ((!ai.active || currentAppScreen === 'BENNIE_BOSS' || roomType === 'BENNIE_ARENA') && b.x + b.radius >= CONFIG.width) {
        b.x = CONFIG.width - b.radius - 1;
        b.vx = -Math.abs(b.vx);
        overchargeAirTime = Math.max(0, overchargeAirTime - 30);
        if (window.audio) window.audio.wallBounce();
      }

      if (ai.active && currentAppScreen !== 'BENNIE_BOSS' && roomType !== 'BENNIE_ARENA' && b.x - b.radius > CONFIG.width) {
        balls.splice(i, 1);
        const momentumDmg = (duelMomentum >= 4 ? 2 : 1);
        const dmg = isHyperSpike ? (momentumDmg + 1) : momentumDmg;
        ai.hp -= dmg;
        if (window.audio) window.audio.goalScored(isHyperSpike || duelMomentum >= 4);
        screenShake = (duelMomentum >= 4 || isHyperSpike) ? 14 : 9;
        runScore += (isHyperSpike ? 400 : 200) * (duelMomentum >= 4 ? 2 : 1);

        const announcement = (duelMomentum >= 4)
          ? `🔥 OVERDRIVE GOAL! -${dmg} AI HP!`
          : (isHyperSpike ? `🔥 HYPER-SPIKE GOAL! -${dmg} AI HP!` : `GOAL! -${dmg} AI HP`);
        addFloatingText(announcement, CONFIG.width - 160, b.y, '#00e676');
        spawnParticles(CONFIG.width - 20, b.y, '#00e676', 16);

        if (ai.hp <= 0) {
          handleRoomVictory();
          return;
        } else {
          startServeCountdown(roomType === 'DUEL' ? 0.6 : 1.1, 'POINT FOR PLAYER!');
        }
        continue;
      }

      if (b.x + b.radius < 0 || b.x < 0) {
        // Chrono Tachyon Rewind check: once per sector saves 1 dropped ball!
        if (collectedArtifacts.has('tachyon_rewind') && player.tachyonRewindUsed !== currentSector) {
          player.tachyonRewindUsed = currentSector;
          b.x = 220;
          b.y = CONFIG.height / 2;
          b.vx = Math.abs(b.vx || 6);
          b.vy = (Math.random() - 0.5) * 3;
          screenShake = 6;
          if (window.audio && typeof window.audio.arcZap === 'function') window.audio.arcZap();
          addFloatingText('⏳ TACHYON REWIND SAVED BALL!', player.x + 35, player.y - 20, '#06b6d4');
          continue;
        }
        if (b.isResolved) {
          balls.splice(i, 1);
          continue;
        }
        b.isResolved = true;

        // Immediate despawn from active simulation
        balls.splice(i, 1);

        // Aegis Converter retaliation trigger if applicable
        if (collectedArtifacts.has('aegis_converter') && activeBuffs.shieldCharges > 0) {
          if (window.audio && typeof window.audio.laserShoot === 'function') window.audio.laserShoot();
          for (let k = 0; k < 4; k++) {
            lasers.push({ x: 25, y: b.y - 30 + k * 20, vx: 18, w: 16, h: 4, color: '#d500f9', fromPlayer: true, damage: 2 });
          }
          addFloatingText('AEGIS RETALIATION!', 60, b.y + 20, '#d500f9');
        }

        // Apply authoritative damage through damagePlayer pipeline (respects shields, armor, invulnerability, God mode)
        const dmg = (typeof isHyperSpike !== 'undefined' && isHyperSpike) ? 2 : 1;
        damagePlayer(dmg, (typeof isHyperSpike !== 'undefined' && isHyperSpike) ? 'hyper_spike' : 'ball_lost', null);

        // Floating feedback if in void phase
        if (typeof voidPhaseActive !== 'undefined' && voidPhaseActive > 0) {
          addFloatingText('VOID RESCUE!', 60, b.y, '#d500f9');
        }

        // Clear hostile tracking
        enemyBullets = [];

        // If all balls are lost and player is alive, initiate serve sequence
        if (balls.length === 0 && player.hp > 0) {
          const delay = (roomType === 'DUEL') ? 0.6 : 1.1;
          const msg = (typeof voidPhaseActive !== 'undefined' && voidPhaseActive > 0) ? 'VOID PHASE RESCUE' : 'BALL LOST - READY!';
          startServeCountdown(delay, msg);
        }
        continue;
      }
    }

    processDamageQueue();

    if (roomType === 'BREAKOUT' && bricks.length === 0 && victorySequenceTimer === 0) {
      handleRoomVictory();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * timeScale;
      p.y += p.vy * timeScale;
      p.alpha -= 0.035;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= 0.024;
      if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }

    updateHud();
  } catch (err) {
    console.error("Safely caught update tick:", err);
  }
}

// Enhanced paddle rebound with Velocity Momentum
function handlePaddleRebound(b, pad, isPlayer) {
  const maxV = getFloorMaxSpeed();

  if (isPlayer) {
    runScore += 10;
    overchargeAirTime = 0;

    // Velocity Momentum multiplier based on paddle speed
    const paddleSpeedMagnitude = Math.abs(pad.vy);
    const velocityMultiplier = 1.0 + Math.min(1.2, paddleSpeedMagnitude / 8.0);
    b.speedMultiplier = velocityMultiplier;

    if (velocityMultiplier > 1.35) {
      addFloatingText(`VELOCITY SMASH x${velocityMultiplier.toFixed(1)}!`, player.x + 40, player.y - 15, '#ffd700');
    }

    // Velocity build synergy: fast paddle smashes add extra duel rally momentum
    if (primaryPath === 'velocity' && paddleSpeedMagnitude > 4) {
      duelRallyCount++;
    }

    // Velocity Breaker fusion: speed boosts ball smash blast
    if (collectedArtifacts.has('turbo_servo') && collectedArtifacts.has('kinetic_momentum')) {
      if (paddleSpeedMagnitude > 5) {
        screenShake = 6;
        if (window.audio) window.audio.tntExplode();
        spawnParticles(b.x, b.y, '#ffd700', 10);
        addFloatingText('VELOCITY BREAKER BLAST!', b.x, b.y, '#ffd700');
      }
    }

    // Nanite Leech
    if (collectedArtifacts.has('nanite_leech')) {
      naniteLeechDeflects++;
      if (naniteLeechDeflects >= 20) {
        naniteLeechDeflects = 0;
        activeBuffs.shieldCharges = Math.min(4, activeBuffs.shieldCharges + 1);
        if (window.audio) window.audio.powerupGet();
        addFloatingText('+1 SHIELD (NANITE LEECH)', player.x + 35, player.y - 15, '#00b0ff');
      }
    }

    // Precision critical center hit
    const hitRel = Math.abs((b.y - (pad.y + pad.h / 2)) / (pad.h / 2));
    if (primaryPath === 'precision' && hitRel < 0.25) {
      if (window.audio) window.audio.criticalHit();
      addFloatingText('CRITICAL CENTER HIT (2.5X)!', player.x + 40, player.y - 20, '#00f2fe');
      b.isCritical = true;
      // Precision build synergy: jump duel momentum forward
      duelRallyCount = Math.max(duelRallyCount + 2, 6);
    } else {
      b.isCritical = false;
    }

    // Ricochet Shrapnel on sharp edge angles
    if ((collectedArtifacts.has('ricochet_shrapnel') || collectedArtifacts.has('precision_calibrator')) && hitRel > 0.55) {
      if (window.audio) window.audio.laserShoot();
      [-0.25, 0, 0.25].forEach(ang => {
        lasers.push({
          x: player.x + player.w + 4,
          y: player.y + player.h / 2,
          vx: Math.cos(ang) * 16,
          vy: Math.sin(ang) * 16,
          w: 8,
          h: 3,
          color: '#f43f5e',
          fromPlayer: true,
          damage: 1
        });
      });
      addFloatingText('RICOCHET SHRAPNEL!', player.x + 40, player.y, '#f43f5e');
    }

    // ============================================================================
    // 25-PATH PROGRESSION RUNTIME EFFECTS: PADDLE DEFLECTION HOOKS
    // ============================================================================
    // Vampiric / Siphon
    if (collectedArtifacts.has('siphon_nodes') || primaryPath === 'vampiric') {
      player.siphonHits = (player.siphonHits || 0) + 1;
      const reqHits = (collectedArtifacts.has('vampiric_frenzy') && player.hp <= 2) ? 4 : 8;
      if (player.siphonHits >= reqHits) {
        player.siphonHits = 0;
        if (player.hp < player.maxHp) {
          player.hp++;
          addFloatingText('+1 HP (NANO-SIPHON)', player.x + 35, player.y - 15, '#e11d48');
          if (window.audio) window.audio.powerupGet();
          updateHud();
        } else if (collectedArtifacts.has('blood_overdrive') && activeBuffs.shieldCharges < 4) {
          activeBuffs.shieldCharges = Math.min(4, activeBuffs.shieldCharges + 1);
          addFloatingText('+1 SHIELD (CRIMSON OVERDRIVE)', player.x + 35, player.y - 15, '#e11d48');
          if (window.audio) window.audio.powerupGet();
          updateHud();
        }
        if (collectedArtifacts.has('leech_pulse')) {
          shockwaves.push({ x: player.x + player.w, y: player.y + player.h / 2, radius: 10, maxRadius: 90, color: '#e11d48', alpha: 0.8 });
          bricks.forEach(br => {
            if (Math.hypot(br.x + br.w / 2 - player.x, br.y + br.h / 2 - player.y) < 140) br.hp -= 2;
          });
        }
      }
    }

    // Pyro / Inferno
    if (collectedArtifacts.has('combustion_rounds') || primaryPath === 'pyro') {
      b.isFireball = true;
      b.color = '#ff5500';
    }
    if (collectedArtifacts.has('thermal_shockwave') && b.isSmash) {
      shockwaves.push({ x: player.x + player.w, y: player.y + player.h / 2, radius: 15, maxRadius: 150, color: '#ff5500', alpha: 0.9 });
      enemyBullets = enemyBullets.filter(eb => Math.hypot(eb.x - player.x, eb.y - player.y) > 160);
      addFloatingText('THERMAL SHOCKWAVE!', player.x + 40, player.y - 15, '#ff5500');
    }

    // Gravity / Singularity
    if (collectedArtifacts.has('gravity_battery')) {
      railgunCharge = Math.min(100, railgunCharge + 12);
    }
    if (collectedArtifacts.has('singularity_core_prime') && b.isSmash) {
      b.hasSingularityPrime = true;
      addFloatingText('SINGULARITY PRIME SMASH!', player.x + 40, player.y - 15, '#8b5cf6');
    }

    // Chrono / Temporal Stasis
    if (collectedArtifacts.has('stasis_bubble') && Math.abs((b.y - (pad.y + pad.h / 2)) / (pad.h / 2)) < 0.25) {
      enemyBullets.forEach(eb => { eb.vx *= 0.2; eb.vy *= 0.2; });
      addFloatingText('⏳ STASIS BUBBLE (BULLETS FROZEN)!', player.x + 40, player.y - 20, '#06b6d4');
    }

    // Stealth / Phantom Ambush
    if (player.isCloaked || collectedArtifacts.has('optical_camouflage')) {
      if (player.isCloaked) {
        player.isCloaked = false;
        b.isCritical = true;
        b.speedMultiplier = (b.speedMultiplier || 1) * 1.5;
        addFloatingText('🥷 AMBUSH STRIKE (2.5X CRIT)!', player.x + 40, player.y - 20, '#cbd5e1');
        if (collectedArtifacts.has('shadow_assassin')) {
          b.isPiercing = true;
        }
        if (collectedArtifacts.has('ambush_capacitor')) {
          for (let sh = 0; sh < 3; sh++) {
            lasers.push({ x: player.x + player.w + 5, y: player.y + 10 + sh * 15, vx: 18, vy: (sh - 1) * 2, w: 14, h: 4, color: '#64748b', fromPlayer: true, damage: 3 });
          }
        }
      }
    }

    // Acoustic / Resonance
    if (collectedArtifacts.has('ultrasonic_pulse') && b.isSmash) {
      shockwaves.push({ x: player.x + player.w, y: player.y + player.h / 2, radius: 10, maxRadius: 200, color: '#ec4899', alpha: 0.8 });
      if (ai && ai.active) ai.speedMult = 0.5;
      addFloatingText('🔊 ULTRASONIC STUN WAVE!', player.x + 40, player.y - 20, '#ec4899');
    }

    // Cyberware / Overclock
    if (collectedArtifacts.has('heat_sink_thrusters') || primaryPath === 'overclock') {
      player.thermalCharge = Math.min(100, (player.thermalCharge || 0) + 15);
      if (player.thermalCharge >= 100 && collectedArtifacts.has('steam_vent_blast')) {
        player.thermalCharge = 0;
        shockwaves.push({ x: player.x + player.w, y: player.y + player.h / 2, radius: 15, maxRadius: 180, color: '#f59e0b', alpha: 0.9 });
        enemyBullets.length = 0;
        if (collectedArtifacts.has('capacitor_surge') && window.abilityCooldowns) {
          Object.keys(window.abilityCooldowns).forEach(k => { window.abilityCooldowns[k] = Math.floor(window.abilityCooldowns[k] * 0.5); });
        }
        addFloatingText('🔥 THERMAL VENT BLAST!', player.x + 40, player.y - 20, '#f59e0b');
      }
    }

    // Prismatic / Refraction
    if (collectedArtifacts.has('prismatic_facets') || primaryPath === 'mirror') {
      lasers.push({ x: player.x + player.w + 4, y: player.y + player.h / 2, vx: 15, vy: -b.vy * 0.8, w: 20, h: 4, color: '#38bdf8', fromPlayer: true, damage: 2 });
    }
    if (collectedArtifacts.has('refraction_splitter') && Math.abs((b.y - (pad.y + pad.h / 2)) / (pad.h / 2)) < 0.25) {
      if (phantomBalls.length < 4) {
        phantomBalls.push({ x: b.x, y: b.y, vx: b.vx * 0.9, vy: b.vy + 2.5, radius: 5, alpha: 0.8, life: 360 });
        phantomBalls.push({ x: b.x, y: b.y, vx: b.vx * 0.9, vy: b.vy - 2.5, radius: 5, alpha: 0.8, life: 360 });
        addFloatingText('🪞 PRISMATIC REFRACTION!', b.x, b.y, '#38bdf8');
      }
    }

    // Polarity / Magnetic
    if (collectedArtifacts.has('polarity_repulsor_gate')) {
      if (ai && ai.active) ai.x = Math.min(CONFIG.width - 40, ai.x + 30);
      enemyBullets.forEach(eb => { eb.vx = Math.abs(eb.vx) * 0.5; });
      addFloatingText('🧲 POLARITY REPULSOR!', player.x + 40, player.y - 15, '#0ea5e9');
    }
    if (collectedArtifacts.has('flux_inversion_pulse')) {
      shockwaves.push({ x: player.x + player.w, y: player.y + player.h / 2, radius: 10, maxRadius: 100, color: '#0ea5e9', alpha: 0.8 });
    }

    // Radiant / Solar
    if (collectedArtifacts.has('photonic_collector') || primaryPath === 'solar') {
      player.solarRally = (player.solarRally || 0) + 1;
      b.damageMultiplier = 1.0 + (player.solarRally * 0.12);
      if (player.solarRally >= 8 && collectedArtifacts.has('supernova_burst_core')) {
        player.solarRally = 0;
        screenShake = 12;
        spawnParticles(CONFIG.width / 2, CONFIG.height / 2, '#eab308', 35);
        bricks.forEach((br, idx) => { if (idx % 2 === 0) br.hp -= 4; });
        addFloatingText('☀️ SUPERNOVA BURST!', CONFIG.width / 2 - 80, CONFIG.height / 2, '#eab308');
        if (window.audio) window.audio.tntExplode();
      }
    }

    // Inventor / Bennie's Prototype
    if (collectedArtifacts.has('spring_loaded_bumper') && b.isSmash) {
      if (roomType === 'BREAKOUT' && bricks.length > 0) {
        const targetBr = bricks[Math.floor(Math.random() * bricks.length)];
        if (targetBr) {
          spawnParticles(targetBr.x, targetBr.y, '#ffd700', 12);
          targetBr.hp -= 3;
          addFloatingText('💡 KINETIC BUMPER SLAM!', targetBr.x, targetBr.y, '#ffd700');
        }
      }
    }
    if (collectedArtifacts.has('homing_wrench_drone')) {
      player.wrenchHits = (player.wrenchHits || 0) + 1;
      if (player.wrenchHits >= 4) {
        player.wrenchHits = 0;
        lasers.push({ x: player.x + player.w + 6, y: player.y + player.h / 2, vx: 14, vy: (Math.random() - 0.5) * 4, w: 16, h: 6, color: '#ffd700', fromPlayer: true, damage: 4 });
        addFloatingText('🔧 HOMING WRENCH FIRED!', player.x + 35, player.y - 15, '#ffd700');
      }
    }

    // Kinetic battery charge
    if (collectedArtifacts.has('kinetic_battery')) {
      railgunCharge = Math.min(100, railgunCharge + 15);
      if (railgunCharge >= 100) {
        if (window.audio) window.audio.hyperActive();
        addFloatingText('⚡ RAILGUN READY! ⚡', player.x + 35, player.y - 20, '#ffd700');
      }
    }

    // Spike Plating
    if (collectedArtifacts.has('spike_plating') && b.speed > 8) {
      lasers.push({
        x: player.x + player.w + 4,
        y: player.y + player.h / 2,
        vx: 16,
        w: 22,
        h: 6,
        color: '#00e676',
        fromPlayer: true,
        piercing: true,
        damage: 2
      });
      if (window.audio) window.audio.paddleHit(true);
    }

    if (player.burnChance > 0 && Math.random() < player.burnChance) {
      activeBuffs.fireball = 180;
      if (window.audio) window.audio.hyperActive();
      addFloatingText('PYRO FLAME IGNITED!', player.x + 35, player.y - 15, '#ff5500');
    }

    if (player.glitchArchitect && Math.random() < 0.20) {
      phantomBalls.push({ x: b.x, y: b.y, vx: b.vx * 1.1, vy: (Math.random() - 0.5) * 6, radius: 5, alpha: 0.8, life: 140 });
      if (window.audio) window.audio.arcZap();
      addFloatingText('GLITCH EMISSION!', b.x, b.y, '#e0e6ed');
    }

    // --- 49 EXPANSION UPGRADES HOOKS ---
    // Drone Overclock Relay
    if (collectedArtifacts.has('drone_overclock_relay') && b.isSmash) {
      for (let d = 0; d < 2; d++) {
        lasers.push({
          x: player.x + player.w + 6,
          y: player.y + 12 + d * 20,
          vx: 18,
          w: 18,
          h: 4,
          color: '#38bdf8',
          fromPlayer: true,
          damage: 2
        });
      }
      addFloatingText('🤖 DRONE OVERCLOCK SALVO!', player.x + 40, player.y - 15, '#38bdf8');
    }

    // Electro Static Discharge & Thunderbolt Core
    if (collectedArtifacts.has('electro_static_discharge')) {
      bricks.slice(0, 2).forEach(br => {
        if (br) {
          br.hp = Math.max(0, br.hp - 1);
          spawnParticles(br.x, br.y, '#00f2fe', 6);
        }
      });
    }
    if (collectedArtifacts.has('electro_thunderbolt_core') && b.isSmash) {
      if (bennieBoss && !bennieBoss.isDefeated && (currentAppScreen === 'BENNIE_BOSS' || roomType === 'BENNIE_ARENA')) {
        damageBennie(3, 'thunderbolt_core');
        spawnParticles(bennieBoss.x, bennieBoss.y, '#00f2fe', 16);
        addFloatingText('🌩️ THUNDERBOLT STRIKE! -3 HP', bennieBoss.x - 30, bennieBoss.y - 40, '#00f2fe');
      } else if (bricks.length > 0) {
        const strongBr = bricks.reduce((prev, curr) => (curr.hp > prev.hp) ? curr : prev, bricks[0]);
        if (strongBr) {
          strongBr.hp = Math.max(0, strongBr.hp - 3);
          spawnParticles(strongBr.x, strongBr.y, '#00f2fe', 14);
          addFloatingText('🌩️ THUNDERBOLT STRIKE! -3', strongBr.x, strongBr.y, '#00f2fe');
        }
      }
    }

    // Ricochet Angle Optimizer & Prism Reflector
    if (collectedArtifacts.has('ricochet_angle_optimizer')) {
      b.speed = Math.min(b.speed * 1.08, getFloorMaxSpeed());
    }
    if (collectedArtifacts.has('ricochet_prism_reflector')) {
      player.prismReflectCount = (player.prismReflectCount || 0) + 1;
      if (player.prismReflectCount % 4 === 0) {
        lasers.push({ x: b.x, y: b.y, vx: 16, vy: 3, w: 16, h: 4, color: '#38bdf8', fromPlayer: true, damage: 2 });
        lasers.push({ x: b.x, y: b.y, vx: 16, vy: -3, w: 16, h: 4, color: '#38bdf8', fromPlayer: true, damage: 2 });
        addFloatingText('💎 PRISM REFLECTOR SHARDS!', b.x, b.y, '#38bdf8');
      }
    }

    // Artillery Siege Mortar
    if (collectedArtifacts.has('artillery_siege_mortar') && (b.speed > 8 || b.isSmash)) {
      shockwaves.push({ x: player.x + player.w + 40, y: player.y + player.h / 2, radius: 10, maxRadius: 60, color: '#f59e0b', alpha: 0.8 });
      bricks.forEach(br => {
        if (Math.hypot(br.x - (player.x + 80), br.y - (player.y + player.h / 2)) < 60) br.hp = Math.max(0, br.hp - 2);
      });
      addFloatingText('💣 SIEGE MORTAR!', player.x + 40, player.y - 15, '#f59e0b');
    }

    // Gambler Roulette Core
    if (collectedArtifacts.has('gambler_roulette_core')) {
      player.rouletteSpins = (player.rouletteSpins || 0) + 1;
      if (player.rouletteSpins % 7 === 0) {
        const roll = Math.random();
        if (roll < 0.33) {
          activeBuffs.shieldCharges = Math.min(4, activeBuffs.shieldCharges + 1);
          addFloatingText('🎰 ROULETTE JACKPOT: +1 SHIELD!', player.x + 35, player.y - 20, '#ffd700');
        } else if (roll < 0.66) {
          runDataChips += 15;
          addFloatingText('🎰 ROULETTE JACKPOT: +15 CHIPS!', player.x + 35, player.y - 20, '#ffd700');
        } else {
          shockwaves.push({ x: CONFIG.width / 2, y: CONFIG.height / 2, radius: 20, maxRadius: 250, color: '#ffd700', alpha: 0.9 });
          addFloatingText('🎰 ROULETTE JACKPOT: MEGA SHOCKWAVE!', CONFIG.width / 2 - 80, CONFIG.height / 2, '#ffd700');
        }
        if (window.audio) window.audio.legendaryJingle();
      }
    }

    // Inventor Gear Launcher & Spring Bumper
    if (collectedArtifacts.has('inventor_gear_launcher') && b.isSmash) {
      for (let g = 0; g < 2; g++) {
        lasers.push({
          x: player.x + player.w + 6,
          y: player.y + (g === 0 ? 10 : player.h - 10),
          vx: 12,
          vy: (g === 0 ? -2.5 : 2.5),
          w: 12,
          h: 12,
          color: '#ffd700',
          fromPlayer: true,
          damage: 2
        });
      }
      addFloatingText('⚙️ PROTOTYPE GEAR LAUNCH!', player.x + 40, player.y - 15, '#ffd700');
    }

    duelRallyCount++;
    const prevMomentum = duelMomentum;
    if (duelRallyCount >= 9) duelMomentum = 4;
    else if (duelRallyCount >= 6) duelMomentum = 3;
    else if (duelRallyCount >= 3) duelMomentum = 2;
    else duelMomentum = 1;
    window.duelMomentum = duelMomentum;

    if (duelMomentum > prevMomentum) {
      if (duelMomentum === 4) {
        if (window.audio) window.audio.hyperActive();
        screenShake = 8;
        addFloatingText('⚡ OVERDRIVE 4X! DOUBLE GOAL DAMAGE! ⚡', CONFIG.width / 2 - 120, CONFIG.height / 2 - 30, '#ff2a6d');
        spawnParticles(player.x + 40, player.y + player.h / 2, '#ff2a6d', 20);
      } else if (duelMomentum === 3) {
        if (window.audio) window.audio.arcZap();
        screenShake = 4;
        addFloatingText('⚡ HIGH VOLTAGE 3X! ⚡', player.x + 40, player.y - 15, '#ffd700');
      } else if (duelMomentum === 2) {
        addFloatingText('CHARGED 2X!', player.x + 40, player.y - 15, '#00f2fe');
      }
    }

    if (duelRallyCount === 6) {
      if (window.audio) window.audio.hyperActive();
      isHyperSpike = true;
      screenShake = 6;
      addFloatingText('HYPER-SPIKE ACTIVATED! 2X DAMAGE', player.x + 40, player.y - 15, '#ff2a6d');
    }

    if (window.audio) window.audio.paddleHit(isHyperSpike);
    screenShake = isHyperSpike ? 4 : 2;

    combo = Math.min(10, combo + 1);
    comboTimer = 220;

    if (combo === 10 && isMarketModActive('mod_black_ice')) {
      runCoresEarned += 1;
      metaSave.cores += 1;
      saveMetaProgress();
      if (window.audio) window.audio.coinGet();
      addFloatingText('+1 CORE (BLACK-ICE SIPHON)', player.x + 35, player.y - 25, '#00b0ff');
    }

    if (isMarketModActive('mod_blood_pact') && combo === 10 && player.hp < player.maxHp) {
      player.hp++;
      addFloatingText('+1 HP (CYBERNETIC LEECH)', player.x + 35, player.y - 15, '#ff007f');
      updateHud();
    }

    if (collectedArtifacts.has('quantum_cluster') && combo % 4 === 0) {
      phantomBalls.push({ x: b.x, y: b.y, vx: b.vx, vy: b.vy + 3, radius: 5.5, alpha: 0.8, life: 120 });
      phantomBalls.push({ x: b.x, y: b.y, vx: b.vx, vy: b.vy - 3, radius: 5.5, alpha: 0.8, life: 120 });
      addFloatingText('QUANTUM PHANTOMS!', b.x, b.y, '#00b0ff');
    }

    if (!player.isVoid && collectedArtifacts.has('vampiric_touch') && combo % 8 === 0 && player.hp < player.maxHp) {
      player.hp++;
      if (window.audio) window.audio.powerupGet();
      addFloatingText('+1 HP', player.x + 25, player.y, '#ff2a6d');
    }
  } else {
    duelRallyCount++;
    const prevMomentum = duelMomentum;
    if (duelRallyCount >= 9) duelMomentum = 4;
    else if (duelRallyCount >= 6) duelMomentum = 3;
    else if (duelRallyCount >= 3) duelMomentum = 2;
    else duelMomentum = 1;
    window.duelMomentum = duelMomentum;

    if (duelMomentum > prevMomentum && duelMomentum === 4) {
      if (window.audio) window.audio.hyperActive();
      screenShake = 8;
      addFloatingText('⚡ OVERDRIVE 4X! DOUBLE GOAL DAMAGE! ⚡', CONFIG.width / 2 - 120, CONFIG.height / 2 - 30, '#ff2a6d');
    }

    if (duelRallyCount === 6) {
      if (window.audio) window.audio.hyperActive();
      isHyperSpike = true;
      screenShake = 6;
    }
    if (window.audio) window.audio.aiHit();

    // Cryo synergy: if ball is cryo coated or active cryo buff, freeze AI paddle
    if (b.isCryoCoated || activeBallTransformation === 'cryo' || collectedArtifacts.has('cryo_frostbite')) {
      ai.frozenTimer = 180;
      spawnParticles(ai.x, ai.y + ai.h / 2, '#00e5ff', 12);
      addFloatingText('❄️ AI FROZEN (3s)!', ai.x - 40, ai.y, '#00e5ff');
    }
  }

  const hitOffset = (b.y - (pad.y + pad.h / 2)) / (pad.h / 2);
  const clampedOffset = Math.max(-1, Math.min(1, hitOffset));
  let angle = clampedOffset * (Math.PI * 0.32);

  // Trickster AI slice angle
  if (!isPlayer && ai.personalityKey === 'trickster') {
    angle += (Math.random() - 0.5) * 0.28;
  }

  const accelMult = (roomType === 'BREAKOUT' || roomType === 'SWARM' || roomType === 'MELTDOWN')
    ? (currentFloor <= 5 ? 1.008 : 1.015)
    : (1.04 + (duelMomentum - 1) * 0.025);
  const speedMultiplier = accelMult * (isPlayer ? player.smashBonus * (b.speedMultiplier || 1.0) : 1.0);
  b.speed = Math.min(b.speed * speedMultiplier, maxV * (duelMomentum >= 4 ? 1.35 : 1.20));
  // --- PADDLE MODIFIERS & BUILD PATH HOOKS ---
  if (isPlayer) {
    const pMod = player.modifier || (CHARACTERS[metaSave.selectedChar] && CHARACTERS[metaSave.selectedChar].modifier);
    if (pMod === 'kinetic_grip') {
      b.speed = Math.min(b.speed * 1.20, maxV * 1.15);
    } else if (pMod === 'magnetic_edge') {
      if (Math.abs(hitOffset) > 0.70) {
        b.vy *= 0.75;
      }
    } else if (pMod === 'hardpoint_core') {
      if (Math.abs(hitOffset) <= 0.25) {
        b.speed = Math.min(b.speed * 1.25, maxV * 1.2);
        screenShake = Math.max(screenShake, 5);
        spawnParticles(b.x, b.y, '#ffd700', 12);
        addFloatingText('HARDPOINT CRIT!', b.x + 30, b.y, '#ffd700');
        if (window.audio) window.audio.criticalHit();
      }
    } else if (pMod === 'phase_surface') {
      if (Math.abs(hitOffset) <= 0.25) {
        b.phaseHitRemaining = 1;
        spawnParticles(b.x, b.y, '#d946ef', 10);
        addFloatingText('PHASE CHARGE!', b.x + 30, b.y, '#d946ef');
      }
    } else if (pMod === 'cryo_surface') {
      b.isCryoCoated = true;
      spawnParticles(b.x, b.y, '#00e676', 8);
    } else if (pMod === 'overcharge_surface') {
      player.consecutiveHits = (player.consecutiveHits || 0) + 1;
      if (player.consecutiveHits >= 3) {
        player.consecutiveHits = 0;
        spawnParticles(player.x + player.w, player.y + player.h / 2, '#eab308', 14);
        if (window.audio) window.audio.arcZap();
        addFloatingText('EMP OVERCHARGE!', player.x + 40, player.y, '#eab308');
        if (window.roomManager && window.roomManager.swarmEnemies) {
          window.roomManager.swarmEnemies.slice(0, 3).forEach(e => { e.hp -= 2; });
        }
      }
    } else if (pMod === 'reflector_coating') {
      if (enemyBullets && enemyBullets.length > 0) {
        enemyBullets.forEach(eb => {
          if (Math.hypot(eb.x - player.x, eb.y - (player.y + player.h / 2)) < player.h) {
            eb.vx = Math.abs(eb.vx) * 1.2;
            eb.fromPlayer = true;
            eb.color = '#00f2fe';
          }
        });
      }
    }

    // Build Path Signature Mechanics
    if (primaryPath === 'kinetic') {
      player.impactCharge = (player.impactCharge || 0) + 1;
      if (player.impactCharge >= 3) {
        player.impactCharge = 0;
        b.kineticShockwaveNext = true;
        addFloatingText('IMPACT CHARGE READY!', player.x + 30, player.y, '#ff5500');
      }
    } else if (primaryPath === 'critical') {
      if (Math.abs(hitOffset) <= 0.20) {
        b.speed = Math.min(b.speed * 1.3, maxV * 1.25);
        screenShake = 6;
        spawnParticles(b.x, b.y, '#00f2fe', 14);
        if (window.audio) window.audio.criticalHit();
        addFloatingText('PRECISION CRIT! 2.5X', b.x + 35, b.y, '#00f2fe');
      }
    } else if (primaryPath === 'artillery') {
      railgunCharge = Math.min(100, railgunCharge + 20);
      addFloatingText(`+20% RAILGUN (${railgunCharge}%)`, player.x + 30, player.y, '#ffd700');
    } else if (primaryPath === 'gambler') {
      const variance = 0.5 + Math.random() * 2.5; // 0.5x to 3.0x
      b.gamblerMultiplier = variance;
      if (variance >= 2.2) {
        addFloatingText(`JACKPOT HIT! ${variance.toFixed(1)}X`, b.x + 30, b.y, '#ffd700');
        if (window.audio) window.audio.wheelWin();
      }
    }
  }

  const dir = isPlayer ? 1 : -1;
  b.vx = Math.cos(angle) * b.speed * dir;
  b.vy = Math.sin(angle) * b.speed + (pad.vy * 0.18);

  spawnParticles(b.x, b.y, isHyperSpike ? '#ff2a6d' : (isPlayer ? player.color : pad.color), isHyperSpike ? 10 : 6);
}

function checkBrickCollisions(b) {
  const isFire = (activeBallTransformation === 'inferno') || (activeBuffs.fireball > 0) || collectedArtifacts.has('fireball_core');
  const isMega = activeBuffs.megaBall > 0;
  const isAcid = (activeBallTransformation === 'acid') || collectedArtifacts.has('bio_residue');
  const isCryo = (activeBallTransformation === 'cryo') || collectedArtifacts.has('cryo_frostbite');

  for (let i = 0; i < bricks.length; i++) {
    const br = bricks[i];

    if (br.type === 'phase' && !br.isTangible && !collectedArtifacts.has('phase_inversion')) continue;

    const overlapX = (br.w / 2 + b.radius) - Math.abs(b.x - (br.x + br.w / 2));
    const overlapY = (br.h / 2 + b.radius) - Math.abs(b.y - (br.y + br.h / 2));

    if (overlapX > 0 && overlapY > 0) {
      if (!isFire && !isMega) {
        if (overlapX < overlapY) {
          if (b.x < br.x + br.w / 2) {
            b.x = br.x - b.radius - 1;
            b.vx = -Math.abs(b.vx);
          } else {
            b.x = br.x + br.w + b.radius + 1;
            b.vx = Math.abs(b.vx);
          }
        } else {
          if (b.y < br.y + br.h / 2) {
            b.y = br.y - b.radius - 1;
            b.vy = -Math.abs(b.vy);
          } else {
            b.y = br.y + br.h + b.radius + 1;
            b.vy = Math.abs(b.vy);
          }
        }
      }

      if (br.type === 'reflector') {
        b.vx *= 1.15;
        b.vy *= 1.15;
        if (window.audio) window.audio.wallBounce();
      }

      if (collectedArtifacts.has('corrosive_coating')) {
        br.acidResistance = 0.0;
        br.shieldStripped = true;
      }

      if (collectedArtifacts.has('kinetic_concussion') && b.speed > 8) {
        screenShake = 6;
        if (window.audio) window.audio.tntExplode();
        spawnParticles(br.x, br.y, '#f43f5e', 10);
        addFloatingText('CONCUSSIVE BLAST!', br.x, br.y, '#f43f5e');
        bricks.forEach(nb => {
          if (nb.id !== br.id && Math.hypot(nb.x - br.x, nb.y - br.y) < 65) {
            queueBrickDamage(nb.id, 2);
          }
        });
      }

      if (isCryo) {
        if (!br.frozen) {
          br.frozen = true;
          if (window.audio) window.audio.brickHit();
          addFloatingText('FROZEN!', br.x, br.y, '#00e5ff');
        } else {
          if (window.audio) window.audio.shatterSound();
          queueBrickDamage(br.id, 4);
          spawnParticles(br.x + br.w / 2, br.y + br.h / 2, '#00e5ff', 12);
          addFloatingText('SHATTERED!', br.x, br.y, '#00e5ff');

          const isAbsoluteZero = collectedArtifacts.has('cryo_frostbite') && collectedArtifacts.has('toxic_catalyst');
          for (let n = 0; n < bricks.length; n++) {
            const nb = bricks[n];
            if (nb.id !== br.id && Math.hypot(nb.x - br.x, nb.y - br.y) < (isAbsoluteZero ? 90 : 65)) {
              queueBrickDamage(nb.id, isAbsoluteZero ? 2 : 1);
              if (isAbsoluteZero) {
                nb.infected = true;
                nb.acidTicks = POISON_CONFIG.durationTicks;
              }
            }
          }
        }
      } else if (isAcid) {
        br.infected = true;
        br.acidTicks = POISON_CONFIG.durationTicks;
        if (window.audio) window.audio.acidSizzle();
        addFloatingText('POISON CORROSION!', br.x, br.y, '#00e676');
      }

      let baseDamage = (isFire || isMega) ? 3 : (isHyperSpike ? 2 : 1);

      if (b.isCritical) {
        baseDamage = Math.round(baseDamage * 2.5);
      }

      if (collectedArtifacts.has('overcharge_capacitor')) {
        const overchargeMultiplier = 1 + Math.min(1.0, overchargeAirTime / 120);
        baseDamage = Math.round(baseDamage * overchargeMultiplier);
      }

      if (collectedArtifacts.has('echo_chamber')) {
        const echoBonus = Math.floor(balls.length * 0.4);
        baseDamage += echoBonus;
      }

      if (activeBuffs.drill > 0) {
        baseDamage += 2;
      }

      queueBrickDamage(br.id, baseDamage);

      if (activeBuffs.lightning > 0) {
        triggerChainLightning(br);
      }
      break;
    }
  }
}

function triggerChainLightning(sourceBrick) {
  if (window.audio) window.audio.arcZap();
  const sx = sourceBrick.x + sourceBrick.w / 2;
  const sy = sourceBrick.y + sourceBrick.h / 2;

  let struck = 0;
  for (let j = 0; j < bricks.length; j++) {
    const target = bricks[j];
    if (target.id === sourceBrick.id) continue;
    const dist = Math.hypot(target.x - sourceBrick.x, target.y - sourceBrick.y);
    if (dist < 140) {
      queueBrickDamage(target.id, 1);
      lightningArcs.push({
        x1: sx,
        y1: sy,
        x2: target.x + target.w / 2,
        y2: target.y + target.h / 2,
        life: 6
      });
      struck++;
      if (struck >= 3) break;
    }
  }
}

function applyPowerup(type) {
  const reg = (typeof DROP_REGISTRY !== 'undefined') ? DROP_REGISTRY : POWERUP_DEFS;
  const def = reg[type] || POWERUP_DEFS[type] || { name: 'Tactical Drop', color: '#00f2fe', icon: '⚡' };
  addFloatingText(`+ ${def.name.toUpperCase()}!`, player.x + 35, player.y, def.color || '#00f2fe');
  if (window.audio && typeof window.audio.powerupGet === 'function') window.audio.powerupGet();

  if (def.isUniqueBall) {
    activeBallTransformation = def.isUniqueBall;
    usedUniqueBallsThisRun.add(def.isUniqueBall);
    updateHud();
  }

  switch (type) {
    // --- ATTACK ---
    case 'mega_ball':
    case 'megaball':
      activeBuffs.megaBall = 480;
      balls.forEach(b => b.radius = 18);
      break;

    case 'fire_ball':
    case 'fireball':
      activeBuffs.fireball = 420;
      break;

    case 'ice_ball':
    case 'cryofrost':
      activeBuffs.iceBall = 360;
      break;

    case 'shock_ball':
    case 'lightning':
      activeBuffs.shockBall = 420;
      shockwaves.push({
        x: player.x + player.w / 2,
        y: player.y + player.h / 2,
        radius: 10,
        maxRadius: 240,
        speed: 12,
        alpha: 1
      });
      break;

    case 'pierce_ball':
    case 'pierce_core':
      activeBuffs.piercing = (activeBuffs.piercing || 0) + 360;
      balls.forEach(b => b.isPiercing = true);
      break;

    case 'plasma_ball':
      activeBuffs.plasmaBall = 420;
      activeBuffs.fireball = Math.max(activeBuffs.fireball || 0, 360);
      break;

    case 'void_ball':
    case 'dark_matter':
      activeBuffs.voidBall = 300;
      enemyBullets.length = 0;
      break;

    case 'ricochet_burst':
      activeBuffs.ricochet = 480;
      break;

    case 'split_ball': {
      const MAX_BALLS = 8;
      if (balls.length < MAX_BALLS) {
        const originalBalls = [...balls];
        originalBalls.forEach(b => {
          if (balls.length >= MAX_BALLS) return;
          const clone1 = {
            ...b,
            x: b.x,
            y: b.y + (Math.random() * 8 - 4),
            vx: b.vx * (0.92 + Math.random() * 0.16),
            vy: b.vy + (Math.random() > 0.5 ? 1.8 : -1.8),
            trail: []
          };
          const spd = Math.hypot(clone1.vx, clone1.vy) || 5;
          const targetSpd = Math.hypot(b.vx, b.vy) || 5;
          clone1.vx = (clone1.vx / spd) * targetSpd;
          clone1.vy = (clone1.vy / spd) * targetSpd;
          balls.push(clone1);
        });
        if (window.audio && typeof window.audio.ballSplit === 'function') window.audio.ballSplit();
        screenShake = Math.max(screenShake, 4);
        spawnParticles(player.x + 40, player.y + 20, '#38bdf8', 14);
        addFloatingText(`SPLIT BALL! (${balls.length} ACTIVE)`, player.x + 35, player.y - 20, '#38bdf8');
      } else {
        addFloatingText('MAX BALLS (8) REACHED!', player.x + 35, player.y, '#ffd700');
      }
      break;
    }

    // --- DEFENSE ---
    case 'energy_shield':
    case 'shield':
      activeBuffs.shieldCharges = Math.min(4, (activeBuffs.shieldCharges || 0) + 2);
      break;

    case 'phase_barrier':
      player.invulnerableTimer = Math.max(player.invulnerableTimer || 0, 240);
      spawnParticles(player.x, player.y + player.h / 2, '#d500f9', 14);
      break;

    case 'repair_core':
    case 'repair':
      if (player.isVoid) {
        runCoresEarned += 2;
        metaSave.cores += 2;
        runScore += 150;
        saveMetaProgress();
        if (window.audio) window.audio.coinGet();
        addFloatingText('+2 CORES (VOID CONVERT)', player.x + 35, player.y, '#d500f9');
      } else {
        if (player.hp < player.maxHp) player.hp++;
      }
      break;

    case 'nano_armor':
    case 'mitigation':
      activeBuffs.nanoArmor = 480;
      break;

    case 'kinetic_reflect':
      activeBuffs.kineticReflect = 420;
      break;

    case 'emergency_matrix':
      activeBuffs.emergencyMatrix = 1;
      addFloatingText('EMERGENCY PROTOCOL ARMED!', player.x + 35, player.y, '#ec4899');
      break;

    // --- CONTROL ---
    case 'emp_pulse':
      enemyBullets.length = 0;
      shockwaves.push({
        x: player.x + player.w / 2,
        y: player.y + player.h / 2,
        radius: 10,
        maxRadius: 320,
        speed: 15,
        alpha: 1
      });
      if (ai && ai.active) ai.stunTimer = Math.max(ai.stunTimer || 0, 180);
      if (window.roomManager && window.roomManager.swarmEnemies) {
        window.roomManager.swarmEnemies.forEach(e => { e.frozen = true; e.vx = 7; });
      }
      break;

    case 'gravity_well':
      activeBuffs.gravityWell = 300;
      break;

    case 'cryo_field':
      activeBuffs.cryoField = 360;
      if (ai && ai.active) ai.stunTimer = Math.max(ai.stunTimer || 0, 120);
      break;

    case 'time_dilator':
      timeScale = 0.5;
      timeScaleTimer = 300;
      addFloatingText('TIME DILATION ACTIVE!', player.x + 35, player.y, '#6366f1');
      break;

    case 'disruptor_wave':
      if (window.roomManager && window.roomManager.swarmEnemies) {
        window.roomManager.swarmEnemies.forEach(e => { e.x += 150; e.vx = 8; });
      }
      if (ai && ai.active) {
        ai.stunTimer = Math.max(ai.stunTimer || 0, 180);
        ai.vy = 0;
      }
      shockwaves.push({
        x: player.x,
        y: player.y + player.h / 2,
        radius: 10,
        maxRadius: 260,
        speed: 14,
        alpha: 1
      });
      break;

    // --- UTILITY ---
    case 'data_vacuum':
    case 'chip_magnet':
      activeBuffs.magnet = Math.max(activeBuffs.magnet || 0, 480);
      break;

    case 'overclock_cell':
      activeBuffs.overclock = 600;
      break;

    case 'ability_reset':
    case 'ability_charge':
      if (window.abilityCooldowns) {
        Object.keys(window.abilityCooldowns).forEach(k => {
          window.abilityCooldowns[k] = 0;
        });
      }
      abilityCooldownCurrent = 0;
      if (window.audio && typeof window.audio.hyperActive === 'function') window.audio.hyperActive();
      addFloatingText('ABILITIES FULLY CHARGED!', player.x + 35, player.y, '#ffd700');
      break;

    case 'precision_thrusters':
      activeBuffs.thrusters = 480;
      break;

    case 'combo_stabilizer':
      activeBuffs.comboLock = 720;
      break;

    // --- SPECIAL ---
    case 'drone_sentinel':
    case 'orbital_ball':
      activeBuffs.shieldCharges = Math.min(4, (activeBuffs.shieldCharges || 0) + 1);
      activeBuffs.orbitalDrone = (activeBuffs.orbitalDrone || 0) + 720;
      break;

    case 'singularity_blast':
      enemyBullets.length = 0;
      screenShake = 16;
      if (window.roomManager && window.roomManager.swarmEnemies) {
        for (let sIdx = window.roomManager.swarmEnemies.length - 1; sIdx >= 0; sIdx--) {
          const se = window.roomManager.swarmEnemies[sIdx];
          if (se && se.type !== 'bastion') {
            se.hp = 0;
            if (window.roomManager.destroySwarmEnemy) window.roomManager.destroySwarmEnemy(se, spawnParticles, addFloatingText);
          }
        }
      }
      for (let i = 0; i < Math.min(bricks.length, 6); i++) {
        queueBrickDamage(bricks[i].id, 10);
      }
      processDamageQueue();
      if (window.audio && typeof window.audio.tntExplode === 'function') window.audio.tntExplode();
      break;

    case 'super_overcharge':
      activeBuffs.overcharge = 480;
      screenShake = 6;
      balls.forEach(b => {
        b.vx *= 1.25;
        b.vy *= 1.25;
      });
      break;

    case 'jackpot':
      runCoresEarned += 3;
      metaSave.cores += 3;
      saveMetaProgress();
      if (window.audio) window.audio.coinGet();
      for (let k = 0; k < 4; k++) spawnParticles(player.x + 40, player.y + 20, '#00e676', 4);
      break;
  }
  updateHud();
}

function damagePlayer(rawAmount = 1, type = 'generic', source = null) {
  // 0. God Mode cheat for dev/testing
  if (player.godMode || window.isGodModeActive) {
    if (Math.random() < 0.25) addFloatingText('🛡️ GOD MODE', player.x + 35, player.y, '#10b981');
    return 0;
  }

  // Invulnerability window check
  if (player.invulnerableTimer > 0 || (player.isVoid && voidPhaseActive > 0)) {
    return 0;
  }

  const activeChar = (typeof CHARACTERS !== 'undefined' && metaSave) ? (CHARACTERS[metaSave.selectedChar] || CHARACTERS.vanguard) : null;

  // 1. Energy Shield Layer
  if (activeBuffs.shieldCharges > 0) {
    activeBuffs.shieldCharges--;
    if (window.audio && typeof window.audio.shieldBreak === 'function') window.audio.shieldBreak();
    else if (window.audio) window.audio.hurt();
    screenShake = 6;
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#00f2fe', 16);
    addFloatingText('⚡ SHIELD ABSORBED!', player.x + 35, player.y - 15, '#00f2fe');
    updateHud();
    return 0;
  }

  // 2. Integer Damage Tiers & Defensive Mitigation
  let finalDmg = Math.max(1, Math.round(rawAmount));
  const hasArmor = primaryPath === 'juggernaut' ||
    collectedArtifacts.has('reinforced_hull') ||
    collectedArtifacts.has('titan_plating') ||
    collectedArtifacts.has('nanite_barrier') ||
    (activeChar && (activeChar.id === 'bastion' || activeChar.id === 'dreadnought'));

  if (hasArmor) {
    if (finalDmg >= 2) {
      // Heavy hit mitigated down by 1 tier
      finalDmg = Math.max(1, finalDmg - 1);
      addFloatingText(`🛡️ -1 MITIGATED! (${finalDmg} DMG)`, player.x + 35, player.y - 15, '#38bdf8');
      spawnParticles(player.x + 20, player.y, '#38bdf8', 8);
    } else if (Math.random() < 0.35) {
      // 35% chance to deflect light hits
      if (window.audio) window.audio.paddleHit();
      addFloatingText('🛡️ DEFLECTED!', player.x + 35, player.y - 15, '#00e676');
      spawnParticles(player.x + 20, player.y, '#00e676', 10);
      return 0;
    }
  }

  // 3. Second Chance / Defibrillator Check
  if (secondChanceAvailable && player.hp <= finalDmg) {
    secondChanceAvailable = false;
    if (window.audio) window.audio.powerupGet();
    screenShake = 10;
    addFloatingText('DEFIBRILLATOR!', player.x + 30, player.y, '#00e676');
    player.hp = 1;
    player.invulnerableTimer = 180;

    if (isMarketModActive('mod_emp_matrix')) {
      if (window.audio) window.audio.tntExplode();
      screenShake = 14;
      for (let i = 0; i < Math.floor(bricks.length * 0.5); i++) {
        if (bricks[i]) queueBrickDamage(bricks[i].id, 10);
      }
      processDamageQueue();
      addFloatingText('EMERGENCY EMP MATRIX! 50% WIPED', CONFIG.width / 2 - 80, CONFIG.height / 2, '#ffd700');
    }
    updateHud();
    return 0;
  }

  // Shock Absorber perk
  if (collectedArtifacts.has('shock_absorber')) {
    shockwaves.push({
      x: player.x + player.w / 2,
      y: player.y + player.h / 2,
      radius: 10,
      maxRadius: 160,
      speed: 10,
      alpha: 1
    });
  }

  if (collectedArtifacts.has('adaptive_plating')) {
    player.invulnerableTimer = 180;
    addFloatingText('ADAPTIVE SHIELD (3s)!', player.x + 35, player.y, '#00b0ff');
  }

  // 4. Apply Damage
  player.hp = Math.max(0, player.hp - finalDmg);
  if (window.audio) window.audio.hurt();
  screenShake = 7 + finalDmg * 2;
  combo = 0;
  spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ff2a6d', 12);
  addFloatingText(`-${finalDmg} HP`, player.x + 35, player.y, '#ff2a6d');

  // Comeback Adrenaline: at 1 HP, temporary shield + 15% speed boost
  if (player.hp === 1 && !player.adrenalineTriggered) {
    player.adrenalineTriggered = true;
    activeBuffs.shieldCharges = Math.max(activeBuffs.shieldCharges, 1);
    player.speedBonus = (player.speedBonus || 0) + 0.15;
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ffd700', 18);
    addFloatingText('⚡ COMEBACK ADRENALINE! (+15% SPEED & SHIELD) ⚡', player.x + 35, player.y - 25, '#ffd700');
    if (window.audio) window.audio.hyperActive();
  }

  updateHud();

  if (player.hp <= 0) {
    triggerGameOver();
  }
  return finalDmg;
}
window.damagePlayer = damagePlayer;

function playerHurt() {
  damagePlayer(1, 'generic', null);
}
window.playerHurt = playerHurt;

function handleRoomVictory() {
  if (currentAppScreen === 'BENNIE_BOSS' || activeGameMode === 'BENNIE_CHALLENGE' || roomType === 'BENNIE_ARENA') return;
  if (victorySequenceTimer > 0) return;
  if (window.audio) window.audio.levelCleared();
  runScore += 250;
  screenShake = 12;

  victorySequenceTimer = 65;
  victoryShockwave = 10;

  document.getElementById('gameHud').classList.add('hud-retracted');
  document.getElementById('artifactTray').classList.add('hud-retracted');
  document.getElementById('abilityGaugeContainer').classList.add('hud-retracted');

  const isBoss = (roomType === 'BOSS');
  const isMiniBoss = (roomType === 'MINI_BOSS');
  let earnedCores = isBoss ? (4 + Math.floor(Math.random() * 4)) : (isMiniBoss ? 2 : (1 + (currentFloor % 2 === 0 ? 1 : 0)));

  // Rapid Duel Clear bonus
  if (roomType === 'DUEL') {
    if (duelTimer > 0 && duelTimer < 25) {
      const bonusCores = 8;
      runCoresEarned += bonusCores;
      metaSave.cores += bonusCores;
      runScore += 1000;
      addFloatingText('⚡ RAPID DUEL CLEAR (<25s)! +8 CORES 💎', CONFIG.width / 2 - 120, CONFIG.height / 2 - 30, '#ffd700');
      if (window.audio) window.audio.coinGet();
    }
  }

  if (isBoss && isMarketModActive('mod_high_roller')) {
    earnedCores *= 2;
  }

  // Data Chips Reward calculation
  let earnedChips = 35;
  if (isBoss) {
    earnedChips = 180 + Math.floor(Math.random() * 50);
  } else if (isMiniBoss) {
    earnedChips = 90 + Math.floor(Math.random() * 30);
  } else if (roomType === 'SWARM') {
    earnedChips = 45 + Math.floor(Math.random() * 20);
  } else if (roomType === 'HEIST') {
    // Cyber Heist rewards are already awarded live by caches, nodes & vault breach bonuses; no double-dipping
    earnedChips = 0;
  } else if (roomType === 'DUEL') {
    earnedChips = 40 + (duelMomentum >= 4 ? 20 : 0);
  }

  if (roomType !== 'HEIST' && combo > 5) {
    earnedChips += Math.min(30, combo * 2);
  }

  if (earnedChips > 0) {
    addDataChips(earnedChips, CONFIG.width / 2, CONFIG.height / 2 + 35);
  }

  runCoresEarned += earnedCores;
  metaSave.cores += earnedCores;
  saveMetaProgress();
  saveMidRunSession();
}
window.handleRoomVictory = handleRoomVictory;

function triggerLevel50VictoryClimax() {
  currentAppScreen = 'VICTORY_MODAL';
  isLevel50EndlessUnlocked = true;
  metaSave.cores += 100;
  saveMetaProgress();
  if (window.audio && typeof window.audio.legendaryJingle === 'function') {
    window.audio.legendaryJingle();
  }

  saveLeaderboardEntry('MAIN', {
    score: runScore + 5000,
    floor: 50,
    char: metaSave.selectedChar
  });

  const vicOverlay = document.getElementById('victoryOverlay');
  if (vicOverlay) {
    document.getElementById('vicFinalScore').textContent = runScore;
    document.getElementById('vicFinalPath').textContent = primaryPath ? primaryPath.toUpperCase() : 'NONE';
    document.getElementById('vicFinalUpgrades').textContent = collectedArtifacts.size;
    vicOverlay.classList.remove('hidden');
  }
}
window.triggerLevel50VictoryClimax = triggerLevel50VictoryClimax;

function triggerGameOver() {
  currentAppScreen = 'GAMEOVER';
  bossChallengeState = 'none';
  bennieBoss = null;
  syncBennieBossHudVisibility();
  if (window.audio) window.audio.gameOverTone();
  clearMidRunSession();

  // Save to Leaderboards
  saveLeaderboardEntry(activeGameMode, {
    score: runScore,
    floor: currentFloor,
    char: metaSave.selectedChar
  });

  document.getElementById('statFloor').textContent = `Sector ${currentSector} • Floor ${currentFloor} (${roomType})`;
  document.getElementById('statScore').textContent = runScore;
  document.getElementById('statRunCores').textContent = `+${runCoresEarned} 💎`;
  document.getElementById('statTotalCores').textContent = `${metaSave.cores} 💎`;
  document.getElementById('gameOverOverlay').classList.remove('hidden');

  // Clear ephemeral Data Chips
  runDataChips = 0;
  window.runDataChips = 0;
  updateDataChipsDisplay();
}

// Drawing routines
// Delta-time based Cyberpunk Retro Neon Sun Background
let lastBgTime = performance.now();
let bgGridPhase = 0;
let bgPulseTime = 0;

function drawSectorBackground() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastBgTime) * 0.001);
  lastBgTime = now;
  bgPulseTime += dt;
  bgGridPhase = (bgGridPhase + dt * 40) % 24;

  // Sector Theme Color Profiles
  let skyTop = '#030712';
  let skyBot = '#0b132b';
  let sunTop = '#ffd700';
  let sunBot = '#ff007f';
  let gridColor = 'rgba(0, 242, 254, 0.22)';
  let towerColor = 'rgba(7, 15, 36, 0.85)';
  let windowColor = 'rgba(0, 242, 254, 0.2)';
  let horizonGlow = 'rgba(0, 242, 254, 0.25)';

  if (currentAppScreen === 'HOME' || currentAppScreen === 'BOOT') {
    skyTop = '#020308';
    skyBot = '#09132e';
    sunTop = '#ffd700';
    sunBot = '#00f2fe';
    gridColor = 'rgba(0, 242, 254, 0.25)';
  } else if (currentAppScreen === 'BENNIE_BOSS' || currentAppScreen === 'BENNIE_UNLOCK') {
    skyTop = '#0a0d18';
    skyBot = '#141d33';
    sunTop = '#ffd700';
    sunBot = '#f59e0b';
    gridColor = 'rgba(255, 215, 0, 0.28)';
    towerColor = 'rgba(20, 28, 48, 0.9)';
    windowColor = 'rgba(255, 215, 0, 0.25)';
    horizonGlow = 'rgba(255, 215, 0, 0.35)';
  } else if (currentSector === 2) {
    skyTop = '#02030a';
    skyBot = '#16082b';
    sunTop = '#ff007f';
    sunBot = '#7928ca';
    gridColor = 'rgba(213, 0, 249, 0.22)';
    towerColor = 'rgba(18, 6, 32, 0.85)';
    windowColor = 'rgba(213, 0, 249, 0.25)';
    horizonGlow = 'rgba(213, 0, 249, 0.3)';
  } else if (currentSector === 3) {
    skyTop = '#01150f';
    skyBot = '#042f24';
    sunTop = '#00e676';
    sunBot = '#064e3b';
    gridColor = 'rgba(0, 230, 118, 0.22)';
    towerColor = 'rgba(3, 26, 18, 0.85)';
    windowColor = 'rgba(0, 230, 118, 0.25)';
    horizonGlow = 'rgba(0, 230, 118, 0.3)';
  } else if (currentSector === 4) {
    skyTop = '#190303';
    skyBot = '#3b0a0a';
    sunTop = '#ffd700';
    sunBot = '#ef4444';
    gridColor = 'rgba(249, 115, 22, 0.22)';
    towerColor = 'rgba(32, 7, 7, 0.85)';
    windowColor = 'rgba(249, 115, 22, 0.25)';
    horizonGlow = 'rgba(239, 68, 68, 0.3)';
  } else if (currentSector >= 5) {
    skyTop = '#0a0218';
    skyBot = '#1f093d';
    sunTop = '#d946ef';
    sunBot = '#4c1d95';
    gridColor = 'rgba(168, 85, 247, 0.22)';
    towerColor = 'rgba(22, 7, 42, 0.85)';
    windowColor = 'rgba(168, 85, 247, 0.25)';
    horizonGlow = 'rgba(168, 85, 247, 0.3)';
  }

  const horizonY = 330;

  // 1. Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  skyGrad.addColorStop(0, skyTop);
  skyGrad.addColorStop(1, skyBot);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, CONFIG.width, horizonY);

  // 2. Glowing Segmented Retro Synthwave Sun
  const sunX = CONFIG.width / 2;
  const sunY = horizonY - 10;
  const sunRadius = 88;

  // Outer radial sun glow
  const sunAura = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.4, sunX, sunY, sunRadius * 1.8);
  sunAura.addColorStop(0, sunBot + '66');
  sunAura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sunAura;
  ctx.fillRect(sunX - sunRadius * 2, sunY - sunRadius * 2, sunRadius * 4, sunRadius * 4);

  // Sun clipping circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, Math.PI, 0); // Upper hemisphere only (sitting on horizon)
  ctx.closePath();
  ctx.clip();

  // Sun vertical gradient fill
  const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY);
  sunGrad.addColorStop(0, sunTop);
  sunGrad.addColorStop(1, sunBot);
  ctx.fillStyle = sunGrad;
  ctx.fill();

  // Synthwave horizontal cuts through the sun (classic 80s neon stripes)
  const stripeCount = 7;
  for (let s = 1; s <= stripeCount; s++) {
    const cutH = 2 + (s * 1.2); // stripes get thicker toward bottom
    const cutY = sunY - (s * (sunRadius / (stripeCount + 1)));
    ctx.fillStyle = skyBot;
    ctx.fillRect(sunX - sunRadius, cutY, sunRadius * 2, cutH);
  }
  ctx.restore();

  // 3. Layered Digital Skyline Silhouettes in Front of Sun
  cyberTowers.forEach(t => {
    ctx.fillStyle = towerColor;
    ctx.fillRect(t.x, horizonY - t.h * 0.52, t.w, t.h * 0.52);
    
    // Windows with subtle ambient shimmer
    ctx.fillStyle = windowColor;
    for (let w = 0; w < t.windows; w++) {
      ctx.fillRect(t.x + 5, horizonY - t.h * 0.48 + w * 16, 4, 5);
    }
  });

  // Horizon Glow Line
  const hGlowGrad = ctx.createLinearGradient(0, horizonY - 4, 0, horizonY + 4);
  hGlowGrad.addColorStop(0, 'rgba(0,0,0,0)');
  hGlowGrad.addColorStop(0.5, horizonGlow);
  hGlowGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hGlowGrad;
  ctx.fillRect(0, horizonY - 6, CONFIG.width, 12);

  // 4. Smooth Delta-Time Perspective Grid Floor
  const floorGrad = ctx.createLinearGradient(0, horizonY, 0, CONFIG.height);
  floorGrad.addColorStop(0, skyBot);
  floorGrad.addColorStop(1, '#020308');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, horizonY, CONFIG.width, CONFIG.height - horizonY);

  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1.2;

  // Perspective Vertical Rays converging at (sunX, horizonY)
  for (let x = -200; x <= CONFIG.width + 200; x += 60) {
    ctx.beginPath();
    ctx.moveTo(sunX, horizonY);
    ctx.lineTo(x, CONFIG.height);
    ctx.stroke();
  }

  // Perspective Receding Horizontal Lines (smooth delta-time scroll)
  const floorSpan = CONFIG.height - horizonY;
  for (let z = 0; z < floorSpan; z += 20) {
    const y = horizonY + Math.pow((z + bgGridPhase) / floorSpan, 1.7) * floorSpan;
    if (y <= CONFIG.height && y >= horizonY) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CONFIG.width, y);
      ctx.stroke();
    }
  }

  // 5. Ambient Vignette & Subtle CRT Scanlines
  const vigGrad = ctx.createRadialGradient(CONFIG.width / 2, CONFIG.height / 2, 360, CONFIG.width / 2, CONFIG.height / 2, 540);
  vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vigGrad.addColorStop(1, 'rgba(2, 4, 8, 0.7)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
  for (let sY = 0; sY < CONFIG.height; sY += 4) {
    ctx.fillRect(0, sY, CONFIG.width, 1);
  }
  ctx.restore();
}

function drawBrickGraphic(targetCtx, x, y, w, h, brick) {
  const color = getBrickColor(brick.type);
  const isPhaseGhost = (brick.type === 'phase' && !brick.isTangible);

  targetCtx.save();

  const grad = targetCtx.createLinearGradient(x, y, x, y + h);
  if (isPhaseGhost) {
    grad.addColorStop(0, 'rgba(213, 0, 249, 0.25)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.1)');
  } else if (brick.frozen) {
    grad.addColorStop(0, 'rgba(0, 229, 255, 0.45)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
  } else {
    grad.addColorStop(0, 'rgba(30, 41, 59, 0.95)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.95)');
  }

  targetCtx.fillStyle = grad;
  targetCtx.beginPath();
  if (typeof targetCtx.roundRect === 'function') {
    targetCtx.roundRect(x, y, w, h, 5);
  } else {
    targetCtx.rect(x, y, w, h);
  }
  targetCtx.fill();

  targetCtx.strokeStyle = isPhaseGhost ? 'rgba(213, 0, 249, 0.45)' : (brick.frozen ? '#00e5ff' : color);
  targetCtx.lineWidth = brick.frozen ? 2.5 : 2;
  targetCtx.stroke();

  targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  targetCtx.lineWidth = 1.2;
  targetCtx.beginPath();
  targetCtx.moveTo(x + 4, y + 4);
  targetCtx.lineTo(x + w - 4, y + 16);
  targetCtx.stroke();

  if (brick.type === 'generator') {
    targetCtx.fillStyle = '#ffd700';
    targetCtx.font = '900 12px sans-serif';
    targetCtx.textAlign = 'center';
    targetCtx.fillText('⬢', x + w / 2, y + h / 2 + 4);
  } else if (brick.type === 'titanium') {
    const damageTaken = (brick.maxHp || 4) - (brick.hp || 4);
    targetCtx.strokeStyle = 'rgba(0, 242, 254, 0.65)';
    targetCtx.lineWidth = 1.6;
    if (damageTaken >= 1) {
      targetCtx.beginPath(); targetCtx.moveTo(x + 4, y + 10); targetCtx.lineTo(x + w / 2, y + h / 2); targetCtx.stroke();
    }
    if (damageTaken >= 2) {
      targetCtx.beginPath(); targetCtx.moveTo(x + w / 2, y + h / 2); targetCtx.lineTo(x + w - 4, y + h - 8); targetCtx.stroke();
    }
    if (damageTaken >= 3) {
      targetCtx.beginPath(); targetCtx.moveTo(x + w - 6, y + 8); targetCtx.lineTo(x + 6, y + h - 10); targetCtx.stroke();
    }
  } else if (brick.type === 'reflector') {
    targetCtx.fillStyle = '#e0e6ed';
    targetCtx.font = '900 11px sans-serif';
    targetCtx.textAlign = 'center';
    targetCtx.fillText('❖', x + w / 2, y + h / 2 + 4);
  } else if (brick.type === 'turret') {
    targetCtx.fillStyle = '#f43f5e';
    targetCtx.beginPath();
    targetCtx.arc(x + w / 2, y + h / 2, 6, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillRect(x + 2, y + h / 2 - 2, 8, 4);
  } else if (brick.type === 'regenerator') {
    targetCtx.fillStyle = '#00e676';
    targetCtx.font = '900 11px sans-serif';
    targetCtx.textAlign = 'center';
    targetCtx.fillText('✚', x + w / 2, y + h / 2 + 4);
  } else if (brick.type === 'tnt') {
    targetCtx.fillStyle = '#ff2a6d';
    targetCtx.font = '900 9px sans-serif';
    targetCtx.textAlign = 'center';
    targetCtx.fillText('TNT', x + w / 2, y + h / 2 + 3);
  } else if (brick.type === 'mystery') {
    targetCtx.fillStyle = '#ffd700';
    targetCtx.font = '900 11px sans-serif';
    targetCtx.textAlign = 'center';
    targetCtx.fillText('?', x + w / 2, y + h / 2 + 4);
  }

  targetCtx.restore();
}

function drawPaddleGraphic(targetCtx, x, y, w, h, color, isAi = false, isStunned = false) {
  if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return;
  targetCtx.save();
  try {
    const mainCol = color || (isAi ? '#ff2a6d' : '#00f2fe');

    // Outer Glow & Chassis
    targetCtx.shadowBlur = isStunned ? 14 : 10;
    targetCtx.shadowColor = isStunned ? '#ffd700' : mainCol;

    // Base Chassis Gradient
    const bgGrad = targetCtx.createLinearGradient(x, y, x + w, y);
    bgGrad.addColorStop(0, '#0a101f');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#0a101f');

    targetCtx.fillStyle = bgGrad;
    targetCtx.beginPath();
    if (typeof targetCtx.roundRect === 'function') {
      targetCtx.roundRect(x, y, w, h, 6);
    } else {
      targetCtx.rect(x, y, w, h);
    }
    targetCtx.fill();

    // Beveled Neon Border
    targetCtx.strokeStyle = isStunned ? '#ffd700' : mainCol;
    targetCtx.lineWidth = 1.8;
    targetCtx.stroke();

    // Reactive Energy Rails (Top & Bottom Bumpers)
    targetCtx.fillStyle = isStunned ? '#ffd700' : mainCol;
    targetCtx.fillRect(x + 2, y + 2, Math.max(1, w - 4), 3);
    targetCtx.fillRect(x + 2, y + h - 5, Math.max(1, w - 4), 3);

    // Energy Conduction Line
    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    targetCtx.lineWidth = 1.5;
    targetCtx.beginPath();
    targetCtx.moveTo(x + w / 2, y + 8);
    targetCtx.lineTo(x + w / 2, Math.max(y + 8, y + h / 2 - 8));
    targetCtx.moveTo(x + w / 2, Math.min(y + h - 8, y + h / 2 + 8));
    targetCtx.lineTo(x + w / 2, y + h - 8);
    targetCtx.stroke();

    // Central Glowing Reactor Core
    const coreY = y + h / 2;
    const coreX = x + w / 2;
    const pulse = Math.sin(Date.now() * 0.008) * 1.5;
    const coreRadius = Math.max(3, Math.min(6, (w / 2) - 1)) + (isStunned ? 0 : pulse * 0.5);

    // Core halo
    targetCtx.fillStyle = isStunned ? '#ffd700' : mainCol;
    targetCtx.shadowBlur = 16;
    targetCtx.beginPath();
    targetCtx.arc(coreX, coreY, Math.max(2, coreRadius + 2), 0, Math.PI * 2);
    targetCtx.fill();

    // Inner bright white core center
    targetCtx.fillStyle = '#ffffff';
    targetCtx.beginPath();
    targetCtx.arc(coreX, coreY, Math.max(1.5, coreRadius - 2), 0, Math.PI * 2);
    targetCtx.fill();

  } catch (e) {
    console.error("Error in drawPaddleGraphic:", e);
  } finally {
    targetCtx.restore();
  }
}

function draw() {
  try {
    ctx.save();

    if (screenShake > 0) {
      const sx = (Math.random() - 0.5) * screenShake;
      const sy = (Math.random() - 0.5) * screenShake;
      ctx.translate(sx, sy);
      screenShake *= 0.82;
      if (screenShake < 0.2) screenShake = 0;
    }

  drawSectorBackground();

  if (currentAppScreen === 'PLAYING' || currentAppScreen === 'BENNIE_BOSS' || currentAppScreen === 'PAUSED') {
    if (window.roomManager && typeof window.roomManager.draw === 'function' && (currentAppScreen === 'PLAYING' || (currentAppScreen === 'PAUSED' && prePauseScreen !== 'BENNIE_BOSS'))) {
      window.roomManager.draw(ctx, player);
    }

    // Draw Afterimages
    player.afterimages.forEach(aim => {
      ctx.save();
      ctx.globalAlpha = aim.alpha;
      drawPaddleGraphic(ctx, aim.x, aim.y, aim.w, aim.h, aim.color);
      ctx.restore();
    });

    shockwaves.forEach(sw => {
      ctx.strokeStyle = `rgba(0, 242, 254, ${Math.max(0, sw.alpha)})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    if (victorySequenceTimer > 0) {
      ctx.strokeStyle = `rgba(0, 242, 254, ${Math.min(0.6, victorySequenceTimer / 65)})`;
      ctx.lineWidth = 1.5;
      for (let hx = 0; hx < CONFIG.width; hx += 60) {
        for (let hy = 0; hy < CONFIG.height; hy += 52) {
          ctx.strokeRect(hx, hy, 40, 40);
        }
      }

      ctx.strokeStyle = `rgba(255, 215, 0, ${victorySequenceTimer / 65})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(CONFIG.width / 2, CONFIG.height / 2, victoryShockwave, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(3, 6, 17, 0.85)';
      ctx.fillRect(0, CONFIG.height / 2 - 60, CONFIG.width, 120);

      ctx.fillStyle = '#ffd700';
      ctx.font = '900 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0.14em';
      ctx.fillText('⚡ FLOOR CLEARED! ⚡', CONFIG.width / 2, CONFIG.height / 2 - 5);

      ctx.fillStyle = '#00f2fe';
      ctx.font = '800 13px sans-serif';
      ctx.letterSpacing = '0.08em';
      ctx.fillText('// INITIALIZING UPGRADE MATRIX...', CONFIG.width / 2, CONFIG.height / 2 + 28);
    }

    lightningArcs.forEach(arc => {
      ctx.strokeStyle = '#00b0ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(arc.x1, arc.y1);
      ctx.lineTo((arc.x1 + arc.x2) / 2 + (Math.random() - 0.5) * 15, (arc.y1 + arc.y2) / 2 + (Math.random() - 0.5) * 15);
      ctx.lineTo(arc.x2, arc.y2);
      ctx.stroke();
    });

    if (activeBuffs.shieldCharges > 0) {
      ctx.strokeStyle = '#00b0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(10, CONFIG.height);
      ctx.stroke();
    }

    if (powerOrb) {
      ctx.strokeStyle = powerOrb.cooldown <= 0 ? '#ffd700' : '#64748b';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = powerOrb.cooldown <= 0 ? 'rgba(255, 215, 0, 0.15)' : 'rgba(100, 116, 139, 0.1)';
      ctx.beginPath();
      ctx.arc(powerOrb.x, powerOrb.y, powerOrb.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = powerOrb.cooldown <= 0 ? '#ffd700' : '#94a3b8';
      ctx.font = '900 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(powerOrb.cooldown <= 0 ? '✦' : '·', powerOrb.x, powerOrb.y + 4);
    }

    bricks.forEach(b => {
      drawBrickGraphic(ctx, b.x, b.y, b.w, b.h, b);
      if (b.type === 'generator') {
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x + b.w / 2, b.y + b.h / 2, 70, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    enemyBullets.forEach(eb => {
      ctx.fillStyle = eb.color;
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    powerupDrops.forEach(p => {
      const reg = (typeof DROP_REGISTRY !== 'undefined') ? DROP_REGISTRY : POWERUP_DEFS;
      const def = reg[p.type] || POWERUP_DEFS[p.type] || { icon: '★', color: '#ffd700', rarity: 'Common', category: 'ATTACK' };
      const rarityColor = def.color || (def.rarity === 'Legendary' ? '#ffd700' : (def.rarity === 'Epic' ? '#d500f9' : (def.rarity === 'Rare' ? '#00b0ff' : '#00f2fe')));
      
      ctx.save();
      ctx.shadowColor = rarityColor;
      ctx.shadowBlur = def.rarity === 'Legendary' ? 14 : 8;
      ctx.fillStyle = 'rgba(11, 19, 43, 0.94)';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(p.x, p.y, p.w, p.h, 6);
      } else {
        ctx.rect(p.x, p.y, p.w, p.h);
      }
      ctx.fill();

      ctx.strokeStyle = rarityColor;
      ctx.lineWidth = def.rarity === 'Legendary' ? 2.5 : 1.8;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(def.icon, p.x + p.w / 2, p.y + p.h / 2);
      ctx.restore();
    });

    coinDrops.forEach(c => {
      ctx.fillStyle = '#00b0ff';
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - 7);
      ctx.lineTo(c.x + 6, c.y);
      ctx.lineTo(c.x, c.y + 7);
      ctx.lineTo(c.x - 6, c.y);
      ctx.closePath();
      ctx.fill();
    });

    lasers.forEach(l => {
      ctx.fillStyle = l.color;
      ctx.fillRect(l.x, l.y, l.w || 14, l.h || 4);
    });

    // Draw Player Paddle with Overdrive Glow
    let paddleAlpha = 1;
    if (player.invulnerableTimer > 0) {
      paddleAlpha = Math.floor(performance.now() / 60) % 2 === 0 ? 0.35 : 0.95;
    }

    ctx.globalAlpha = paddleAlpha;
    const pColor = player.isOverdrive ? '#ffd700' : (voidPhaseActive > 0 ? '#d500f9' : player.color);
    drawPaddleGraphic(ctx, player.x, player.y, player.w, player.h, pColor);
    ctx.globalAlpha = 1;

    const hasSentry = collectedArtifacts.has('nano_sentry') || player.droneCommander || primaryPath === 'drone' || (activeBuffs.orbitalDrone && activeBuffs.orbitalDrone > 0);
    const hasSat = collectedArtifacts.has('defense_satellite');

    let sentryX = 0, sentryY = 0;
    if (hasSentry) {
      sentryX = player.x + player.w / 2 + Math.cos(sentryAngle) * 46;
      sentryY = player.y + player.h / 2 + Math.sin(sentryAngle) * 46;
      ctx.fillStyle = '#00e676';
      ctx.beginPath();
      ctx.arc(sentryX, sentryY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (hasSat) {
      ctx.fillStyle = '#00b0ff';
      ctx.fillRect(player.x - 26, defenseSatY - 14, 8, 28);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(player.x - 26, defenseSatY - 14, 8, 28);
    }

    if (hasSentry && hasSat) {
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sentryX, sentryY);
      ctx.lineTo(player.x - 22, defenseSatY);
      ctx.stroke();
    }

    if (ai.active && currentAppScreen !== 'BENNIE_BOSS' && roomType !== 'BENNIE_ARENA') {
      drawPaddleGraphic(ctx, ai.x, ai.y, ai.w, ai.h, ai.rageActive ? '#ff1144' : ai.color, true, ai.stunTimer > 0);
      if (ai.frozenTimer > 0 && typeof window.drawFrozenEffect === 'function') {
        window.drawFrozenEffect(ctx, ai.x, ai.y, ai.w, ai.h, false, 0, ai.frozenTimer, 240);
      }

      const barW = 54;
      const barH = 6;
      const barX = ai.x - (barW - ai.w) / 2;
      const barY = ai.y - 14;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      const pipW = (barW - (ai.maxHp - 1) * 2) / ai.maxHp;
      for (let p = 0; p < ai.maxHp; p++) {
        ctx.fillStyle = p < ai.hp ? (ai.rageActive ? '#ff1144' : (ai.color || '#ff2a6d')) : '#334155';
        ctx.fillRect(barX + p * (pipW + 2), barY, pipW, barH);
      }

      if (roomType === 'DUEL' && ai.personality) {
        ctx.fillStyle = ai.rageActive ? '#ff1144' : (ai.color || '#ff2a6d');
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(ai.personality.name.toUpperCase(), barX + barW / 2, barY - 4);
      } else if (roomType === 'BOSS' || roomType === 'MINI_BOSS') {
        ctx.fillStyle = ai.color || '#ff2a6d';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        const label = ai.name ? `${ai.name.toUpperCase()} (P${ai.currentPhase || 1}/${ai.phases || 1})` : 'SECTOR BOSS';
        ctx.fillText(label, barX + barW / 2, barY - 4);
      }
    }

    phantomBalls.forEach(pb => {
      ctx.fillStyle = `rgba(213, 0, 249, ${pb.alpha})`;
      ctx.beginPath();
      ctx.arc(pb.x, pb.y, pb.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    const isFire = (activeBallTransformation === 'inferno') || (activeBuffs.fireball > 0) || collectedArtifacts.has('fireball_core');
    const isAcid = (activeBallTransformation === 'acid') || collectedArtifacts.has('bio_residue');
    const isCryo = (activeBallTransformation === 'cryo') || collectedArtifacts.has('cryo_frostbite');
    const isVortex = (activeBallTransformation === 'graviton') || collectedArtifacts.has('graviton_core');
    const isDarkMatter = (activeBallTransformation === 'dark_matter');

    balls.forEach(b => {
      // Velocity-scaled dynamic ribbon trail
      if (b.trail && b.trail.length > 1) {
        ctx.save();
        for (let i = 0; i < b.trail.length - 1; i++) {
          const pt = b.trail[i];
          const nextPt = b.trail[i + 1];
          const progress = (i + 1) / b.trail.length;
          const a = progress * 0.45;
          let trailColor = `rgba(0, 242, 254, ${a})`;

          if (duelMomentum >= 4) trailColor = `rgba(255, 42, 109, ${Math.min(1, a * 1.6)})`;
          else if (duelMomentum === 3) trailColor = `rgba(255, 215, 0, ${Math.min(1, a * 1.4)})`;
          else if (isHyperSpike) trailColor = `rgba(255, 42, 109, ${a * 1.2})`;
          else if (isFire) trailColor = `rgba(255, 85, 0, ${a * 1.2})`;
          else if (isAcid) trailColor = `rgba(0, 230, 118, ${a * 1.2})`;
          else if (isCryo) trailColor = `rgba(0, 229, 255, ${a * 1.2})`;
          else if (isVortex) trailColor = `rgba(99, 102, 241, ${a * 1.2})`;
          else if (isDarkMatter) trailColor = `rgba(129, 140, 248, ${a * 1.2})`;

          ctx.strokeStyle = trailColor;
          ctx.lineWidth = Math.max(1.5, b.radius * progress * 1.6);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(nextPt.x, nextPt.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      let ballColor = '#ffffff';
      if (duelMomentum >= 4) ballColor = '#ff2a6d';
      else if (duelMomentum === 3) ballColor = '#ffd700';
      else if (isHyperSpike) ballColor = '#ff2a6d';
      else if (isFire) ballColor = '#ff5500';
      else if (isAcid) ballColor = '#00e676';
      else if (isCryo) ballColor = '#00e5ff';
      else if (isVortex) ballColor = '#6366f1';
      else if (isDarkMatter) ballColor = '#818cf8';
      else if (activeBuffs.megaBall > 0) ballColor = '#ffd700';

      ctx.fillStyle = ballColor;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      if (isVortex || isDarkMatter) {
        ctx.strokeStyle = isDarkMatter ? 'rgba(129, 140, 248, 0.4)' : 'rgba(99, 102, 241, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 65, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    floatingTexts.forEach(ft => {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = '800 12px sans-serif';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.globalAlpha = 1;
    });

    if (serveCountdown > 0) {
      const isDuel = (roomType === 'DUEL');
      ctx.save();
      ctx.fillStyle = 'rgba(3, 5, 9, 0.88)';
      ctx.fillRect(CONFIG.width / 2 - 180, CONFIG.height / 2 - 45, 360, 90);
      ctx.strokeStyle = isDuel ? '#ffd700' : '#00f2fe';
      ctx.lineWidth = 2;
      ctx.strokeRect(CONFIG.width / 2 - 180, CONFIG.height / 2 - 45, 360, 90);

      ctx.fillStyle = isDuel ? '#ffd700' : '#00f2fe';
      ctx.font = '900 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(serveAnnouncement, CONFIG.width / 2, CONFIG.height / 2 - 12);

      if (isDuel) {
        let phaseText = 'READY';
        let lightStage = 0;
        if (serveCountdown > 1.65) {
          phaseText = 'READY';
          lightStage = 0;
        } else if (serveCountdown > 1.10) {
          phaseText = '3';
          lightStage = 1;
        } else if (serveCountdown > 0.55) {
          phaseText = '2';
          lightStage = 2;
        } else {
          phaseText = '1';
          lightStage = 3;
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 26px sans-serif';
        ctx.fillText(phaseText, CONFIG.width / 2, CONFIG.height / 2 + 22);

        // Charging lights on left & right
        for (let i = 1; i <= 3; i++) {
          const lit = i <= lightStage;
          ctx.fillStyle = lit ? '#ffd700' : '#334155';
          ctx.beginPath();
          ctx.arc(CONFIG.width / 2 - 65 - (3 - i) * 18, CONFIG.height / 2 + 16, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(CONFIG.width / 2 + 65 + (i - 1) * 18, CONFIG.height / 2 + 16, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Energy pulse wave
        const pulseR = ((2.2 - serveCountdown) * 50) % 55;
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(CONFIG.width / 2, CONFIG.height / 2, 28 + pulseR, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = '800 22px sans-serif';
        ctx.fillText(`SERVE IN: ${Math.ceil(serveCountdown)}`, CONFIG.width / 2, CONFIG.height / 2 + 22);
      }
      ctx.restore();
    }

    if (sectorBannerTimer > 0) {
      const alpha = Math.min(1, sectorBannerTimer / 40);
      ctx.fillStyle = `rgba(2, 4, 8, ${0.85 * alpha})`;
      ctx.fillRect(0, CONFIG.height / 2 - 65, CONFIG.width, 130);

      ctx.strokeStyle = `rgba(0, 242, 254, ${0.7 * alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, CONFIG.height / 2 - 65);
      ctx.lineTo(CONFIG.width, CONFIG.height / 2 - 65);
      ctx.moveTo(0, CONFIG.height / 2 + 65);
      ctx.lineTo(CONFIG.width, CONFIG.height / 2 + 65);
      ctx.stroke();

      ctx.fillStyle = `rgba(0, 242, 254, ${alpha})`;
      ctx.font = '900 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0.12em';
      ctx.fillText(sectorBannerTitle, CONFIG.width / 2, CONFIG.height / 2);

      ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * alpha})`;
      ctx.font = '800 13px sans-serif';
      ctx.fillText(sectorBannerSub, CONFIG.width / 2, CONFIG.height / 2 + 30);
    }

    // Boss Cinematic Scan Intro
    if (bossScanIntroTimer > 0 && bossScanIntroDef) {
      ctx.save();
      ctx.fillStyle = 'rgba(2, 4, 8, 0.78)';
      ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

      const scanY = (1 - (bossScanIntroTimer / 150)) * CONFIG.height;
      ctx.strokeStyle = bossScanIntroDef.color || '#ff2a6d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(CONFIG.width, scanY);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 242, 254, 0.04)';
      for (let sy = 0; sy < CONFIG.height; sy += 8) {
        ctx.fillRect(0, sy, CONFIG.width, 4);
      }

      const boxW = 540, boxH = 136;
      const bx = (CONFIG.width - boxW) / 2;
      const by = (CONFIG.height - boxH) / 2;

      ctx.fillStyle = 'rgba(10, 15, 30, 0.94)';
      ctx.strokeStyle = bossScanIntroDef.color || '#ff2a6d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(bx, by, boxW, boxH, 12);
      } else {
        ctx.rect(bx, by, boxW, boxH);
      }
      ctx.fill();
      ctx.stroke();

      ctx.font = '900 13px sans-serif';
      ctx.fillStyle = '#ff2a6d';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '0.1em';
      ctx.fillText(bossScanIntroDef.isMini ? '⚠️ MINI-BOSS COMBAT LOCK ENGAGED ⚠️' : '⚠️ CRITICAL ANOMALY DETECTED // SECTOR APEX ⚠️', CONFIG.width / 2, by + 34);

      ctx.font = '900 26px sans-serif';
      ctx.fillStyle = bossScanIntroDef.color || '#00f2fe';
      ctx.fillText(bossScanIntroDef.name.toUpperCase(), CONFIG.width / 2, by + 72);

      ctx.font = '700 13px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(bossScanIntroDef.subtitle || '', CONFIG.width / 2, by + 98);

      ctx.font = '800 11px sans-serif';
      ctx.fillStyle = '#ffd700';
      ctx.fillText(`CHASSIS INTEGRITY: ${ai.maxHp} HP • PHASES: ${ai.phases || 1}`, CONFIG.width / 2, by + 122);
      ctx.restore();
    }

    if ((currentAppScreen === 'BENNIE_BOSS' || (currentAppScreen === 'PAUSED' && (prePauseScreen === 'BENNIE_BOSS' || bennieBoss))) && typeof drawBennieBoss === 'function') {
      drawBennieBoss(ctx);
    } else if (currentAppScreen === 'BENNIE_UNLOCK') {
      if (Math.random() < 0.28) {
        spawnParticles(Math.random() * CONFIG.width, CONFIG.height - 20, Math.random() < 0.5 ? '#ffd700' : '#00f2fe', 3);
      }
    }
  }

  ctx.restore();
  } catch (drawErr) {
    console.error("Safely caught draw error:", drawErr);
  }
}

function updateHud() {
  const activeChar = CHARACTERS[metaSave.selectedChar] || CHARACTERS.vanguard;
  document.getElementById('charAvatar').textContent = activeChar.icon;

  for (let i = 1; i <= 7; i++) {
    const h = document.getElementById(`h${i}`);
    if (!h) continue;
    if (i <= player.maxHp) {
      h.style.display = 'inline';
      if (player.isVoid) h.classList.add('void-mode');
      else h.classList.remove('void-mode');

      if (i <= player.hp) h.classList.remove('empty');
      else h.classList.add('empty');
    } else {
      h.style.display = 'none';
    }
  }

  // Compact HUD: Score & Currencies
  const scoreBadge = document.getElementById('hudScore');
  if (scoreBadge) scoreBadge.textContent = `PTS: ${runScore}`;
  const coresBadge = document.getElementById('hudRunCores');
  if (coresBadge) coresBadge.textContent = `💎 ${runCoresEarned}`;
  updateDataChipsDisplay();

  // Compact Level / Sector
  const floorBadge = document.getElementById('hudFloorBadge');
  if (floorBadge) {
    const isNarrow = window.innerWidth <= 840;
    const lvlInSec = ((currentFloor - 1) % 10) + 1;
    floorBadge.textContent = isNarrow ? `S${currentSector}-${lvlInSec}` : `SEC ${currentSector} • LVL ${lvlInSec}/10`;
  }

  // Compact Protocol / Archetype Pill
  const protoPill = document.getElementById('hudProtocolBadge');
  if (protoPill) {
    if (primaryPath && BUILD_PATHS[primaryPath]) {
      const a = BUILD_PATHS[primaryPath];
      protoPill.style.display = 'inline-flex';
      protoPill.className = `protocol-pill ${primaryPath}`;
      protoPill.textContent = `${a.icon} ${a.name.split('/')[0].trim().toUpperCase()}`;
    } else {
      protoPill.style.display = 'none';
    }
  }

  // Room Objective & Boss Indicator (High Center Priority)
  const objPill = document.getElementById('hudObjectiveBadge');
  if (objPill) {
    if ((currentAppScreen === 'BENNIE_BOSS' || (currentAppScreen === 'PAUSED' && (prePauseScreen === 'BENNIE_BOSS' || bennieBoss))) && bennieBoss) {
      objPill.style.display = 'inline-flex';
      objPill.className = 'stat-badge room-objective-pill';
      objPill.style.borderColor = '#ffd700';
      objPill.style.color = '#ffd700';
      const stgText = bennieBoss.isStaggered ? ' • VULNERABLE!' : '';
      objPill.textContent = `💡 BENNIE ${Math.ceil(bennieBoss.hp)}/100${stgText}`;
    } else if (roomType === 'MINI_BOSS') {
      objPill.style.display = 'inline-flex';
      objPill.className = 'stat-badge room-objective-pill';
      const mName = ai.name ? ai.name.toUpperCase() : 'ELITE';
      objPill.textContent = `⚠️ ${mName} ${ai.hp}/${ai.maxHp}`;
    } else if (roomType === 'BOSS') {
      objPill.style.display = 'inline-flex';
      objPill.className = 'stat-badge room-objective-pill';
      const bName = ai.name ? ai.name.toUpperCase() : 'ARCHON';
      objPill.textContent = `💀 ${bName} P${ai.currentPhase || 1} ${ai.hp}/${ai.maxHp}`;
    } else if (roomType === 'SWARM') {
      objPill.style.display = 'inline-flex';
      objPill.className = 'stat-badge room-objective-pill';
      objPill.textContent = `🛸 W${window.roomManager?.swarmWave || 1}/${window.roomManager?.swarmMaxWaves || 3}`;
    } else if (roomType === 'DUEL') {
      objPill.style.display = 'inline-flex';
      objPill.className = 'stat-badge room-objective-pill';
      const persName = (window.currentDuelPersonality && window.currentDuelPersonality.name) ? window.currentDuelPersonality.name : 'AI';
      objPill.textContent = `⚔️ ${persName.toUpperCase()} ${ai.hp}/${ai.maxHp}`;
    } else if (roomType === 'HEIST') {
      objPill.style.display = 'inline-flex';
      objPill.className = 'stat-badge room-objective-pill';
      const ch = window.roomManager?.cyberHeist;
      const rem = ch ? (ch.totalCaches - ch.breachedCount) : 0;
      objPill.textContent = `🔓 HEIST S-${ch ? ch.securityLevel : 1} (${rem} REM)`;
    } else if (roomType === 'SHOP') {
      objPill.style.display = 'inline-flex';
      objPill.className = 'stat-badge room-objective-pill';
      objPill.textContent = `🛒 DATA SHOP`;
    } else if (roomType === 'CASINO') {
      objPill.style.display = 'inline-flex';
      objPill.className = 'stat-badge room-objective-pill';
      objPill.textContent = `🎰 CASINO`;
    } else {
      objPill.style.display = 'none';
    }
  }

  // Real Runtime Defense Indicator (Compact Icon-First)
  const defenseBadge = document.getElementById('hudDefenseBadge');
  if (defenseBadge) {
    const maxShields = 4;
    const curShields = Math.max(0, activeBuffs.shieldCharges || 0);
    const activeChar = (typeof CHARACTERS !== 'undefined' && metaSave) ? (CHARACTERS[metaSave.selectedChar] || CHARACTERS.vanguard) : null;
    let armorMitigation = 0;
    if (activeChar && activeChar.armor) armorMitigation += activeChar.armor;
    if (player.defenseArmor) armorMitigation += player.defenseArmor;
    if (typeof isMarketModActive === 'function' && isMarketModActive('mod_titan_chassis')) armorMitigation += 0.15;
    const armorPct = Math.round(Math.min(0.75, armorMitigation) * 100);

    if (player.invulnerableTimer > 0) {
      defenseBadge.textContent = `🛡️ INVULN [${(player.invulnerableTimer / 60).toFixed(1)}s]`;
      defenseBadge.style.display = 'inline-flex';
    } else {
      const filled = Math.min(maxShields, curShields);
      const empty = Math.max(0, maxShields - filled);
      const pips = '■'.repeat(filled) + '□'.repeat(empty);
      const armorText = armorPct > 0 ? ` ${armorPct}%` : '';
      defenseBadge.textContent = `🛡️ ${curShields}/${maxShields} [${pips}]${armorText}`;
      defenseBadge.style.display = 'inline-flex';
    }
  }

  // Real Runtime Drone Indicator (Compact Icon-First)
  const droneBadge = document.getElementById('hudDroneBadge');
  if (droneBadge) {
    const hasSentry = collectedArtifacts.has('nano_sentry') || player.droneCommander || primaryPath === 'drone' || (activeBuffs.orbitalDrone && activeBuffs.orbitalDrone > 0);
    const hasSat = collectedArtifacts.has('defense_satellite');
    const hasSwarmCore = (typeof isMarketModActive === 'function' && isMarketModActive('mod_drone_swarm_core'));

    let totalDrones = 0;
    if (hasSentry) totalDrones++;
    if (hasSat) totalDrones++;
    if (hasSwarmCore) totalDrones++;

    if (totalDrones > 0) {
      const hasOverclock = collectedArtifacts.has('overclock_drone');
      const targetTick = hasOverclock ? 45 : (player.droneCommander ? 54 : 90);
      const readinessPct = Math.min(100, Math.floor((sentryShootTick / targetTick) * 100));
      const statusText = readinessPct >= 100 ? 'READY' : `${readinessPct}%`;
      droneBadge.textContent = `🤖 ${totalDrones} ${statusText}`;
      droneBadge.style.display = 'inline-flex';
    } else {
      droneBadge.textContent = '🤖 OFF';
      droneBadge.style.display = 'inline-flex';
    }
  }


  // Top-left Ability HUD slots (supports 1..5+ abilities with responsive grid and hotkeys)
  const abilitySlotsContainer = document.getElementById('hudAbilitySlots');
  if (abilitySlotsContainer) {
    const list = Array.isArray(metaSave.equippedAbilities) && metaSave.equippedAbilities.length > 0
      ? metaSave.equippedAbilities
      : [metaSave.equippedAbility || 'shockwave'];

    abilitySlotsContainer.classList.remove('slots-1-3', 'slots-4', 'slots-5-plus');
    if (list.length <= 3) {
      abilitySlotsContainer.classList.add('slots-1-3');
    } else if (list.length === 4) {
      abilitySlotsContainer.classList.add('slots-4');
    } else {
      abilitySlotsContainer.classList.add('slots-5-plus');
    }

    let slotsHtml = '';
    list.forEach((abKey, idx) => {
      const def = (typeof ACTIVE_ABILITIES !== 'undefined' && ACTIVE_ABILITIES[abKey]) ? ACTIVE_ABILITIES[abKey] : (ACTIVE_ABILITIES && ACTIVE_ABILITIES.shockwave) || { name: 'Ability', icon: '⚡', cooldownTicks: 300 };
      const cdCurrent = (window.abilityCooldowns && window.abilityCooldowns[abKey] !== undefined)
        ? window.abilityCooldowns[abKey]
        : (idx === 0 ? abilityCooldownCurrent : 0);
      const isReady = cdCurrent <= 0;
      const keyLabel = idx === 0 ? 'SPC' : `${idx + 1}`;
      const baseCd = def.cooldownTicks || 300;
      const pct = isReady ? 100 : Math.max(0, Math.min(100, Math.round(((baseCd - cdCurrent) / baseCd) * 100)));

      slotsHtml += `
        <div class="ability-slot-badge ${isReady ? 'ready' : 'cooldown'}" onclick="window.attemptTriggerAbilitySlot(${idx})" title="${def.name} [Key: ${keyLabel}]">
          <span class="ability-slot-icon">${def.icon || '⚡'}</span>
          <span class="ability-slot-key">${keyLabel}</span>
          ${!isReady ? `<div class="ability-slot-cooldown-overlay" style="height: ${100 - pct}%;"></div>` : ''}
        </div>
      `;
    });
    abilitySlotsContainer.innerHTML = slotsHtml;
  }

  const rallyBadge = document.getElementById('rallyBadge');
  if (ai.active && (duelRallyCount >= 2 || (window.duelMomentum && window.duelMomentum > 1))) {
    rallyBadge.style.display = 'inline-block';
    const mom = window.duelMomentum || 1;
    if (mom >= 4) {
      rallyBadge.textContent = `🔥 OVERDRIVE 4X: +1 BONUS GOAL DMG! (RALLY ${duelRallyCount})`;
      rallyBadge.style.borderColor = '#ff2a6d';
      rallyBadge.style.color = '#ff2a6d';
    } else if (mom === 3) {
      rallyBadge.textContent = `⚡ HIGH VOLTAGE 3X (RALLY ${duelRallyCount})`;
      rallyBadge.style.borderColor = '#ffd700';
      rallyBadge.style.color = '#ffd700';
    } else if (mom === 2) {
      rallyBadge.textContent = `⚡ CHARGED 2X (RALLY ${duelRallyCount})`;
      rallyBadge.style.borderColor = '#00f2fe';
      rallyBadge.style.color = '#00f2fe';
    } else {
      rallyBadge.textContent = `⚡ RALLY x${duelRallyCount}`;
      rallyBadge.style.borderColor = '#00b0ff';
      rallyBadge.style.color = '#00b0ff';
    }
  } else {
    rallyBadge.style.display = 'none';
  }

  if (player.isVoid) {
    document.getElementById('abilityNameDisplay').textContent = '👁️ VOID PHASE SHIFT';
  } else {
    const curAbility = (ACTIVE_ABILITIES && ACTIVE_ABILITIES[metaSave.equippedAbility]) || (ACTIVE_ABILITIES && ACTIVE_ABILITIES.shockwave) || { name: 'Kinetic Shockwave', icon: '⚡', cooldownTicks: 300 };
    document.getElementById('abilityNameDisplay').textContent = `${curAbility.icon} ${curAbility.name.toUpperCase()}`;
  }

  const fillPct = abilityCooldownCurrent <= 0 ? 100 : ((abilityCooldownMax - abilityCooldownCurrent) / abilityCooldownMax) * 100;
  document.getElementById('abilityFill').style.width = `${fillPct}%`;

  // Overdrive Meter fill
  const odFill = document.getElementById('overdriveFill');
  if (odFill) {
    odFill.style.width = `${player.overdriveGauge}%`;
  }

  const label = document.getElementById('abilityLabel');
  const statusText = document.getElementById('abilityStatusText');
  if (abilityCooldownCurrent <= 0) {
    label.classList.add('ready');
    statusText.textContent = '[SPACE / CLICK READY]';
  } else {
    label.classList.remove('ready');
    statusText.textContent = `${Math.ceil(abilityCooldownCurrent / 60)}s`;
  }

  const railCont = document.getElementById('railgunContainer');
  if (collectedArtifacts.has('kinetic_battery')) {
    railCont.style.display = 'flex';
    document.getElementById('railgunPct').textContent = `${railgunCharge}%`;
    document.getElementById('railgunFill').style.width = `${railgunCharge}%`;
  } else {
    railCont.style.display = 'none';
  }

  const shelf = document.getElementById('buffsShelf');
  shelf.innerHTML = '';

  if (player.invulnerableTimer > 0) appendBuffChip(shelf, '🛡️ INVULNERABLE', `${(player.invulnerableTimer / 60).toFixed(1)}s`, '#00f2fe');
  if (player.isOverdrive) appendBuffChip(shelf, '🔥 OVERDRIVE', 'MAX SPEED', '#ff2a6d');
  if (activeBuffs.fireball > 0) appendBuffChip(shelf, '🔥 FIREBALL', `${Math.ceil(activeBuffs.fireball / 60)}s`, '#ff5500');
  if (activeBuffs.lightning > 0) appendBuffChip(shelf, '⚡ LIGHTNING', `${Math.ceil(activeBuffs.lightning / 60)}s`, '#00b0ff');
  if (activeBuffs.twinBlasters > 0) appendBuffChip(shelf, '🤖 BLASTERS', 'ACTIVE', '#d500f9');
  if (activeBuffs.megaBall > 0) appendBuffChip(shelf, '🌕 MEGA BALL', `${Math.ceil(activeBuffs.megaBall / 60)}s`, '#ffd700');
  if (activeBuffs.shieldCharges > 0) appendBuffChip(shelf, '🛡️ SHIELD', `x${activeBuffs.shieldCharges}`, '#00b0ff');
  if (voidPhaseActive > 0) appendBuffChip(shelf, '👁️ VOID PHASE', `${Math.ceil(voidPhaseActive / 60)}s`, '#d500f9');
  if (ai.active && ai.stunTimer > 0) appendBuffChip(shelf, '⚡ AI STUNNED', `${Math.ceil(ai.stunTimer / 60)}s`, '#ffd700');
}
window.updateHud = updateHud;

function calculateSynergyTags() {
  const counts = {};
  collectedArtifacts.forEach(artId => {
    const art = ARTIFACT_DEFINITIONS[artId];
    if (art && art.tags) {
      art.tags.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    }
  });
  return counts;
}

function appendBuffChip(container, title, val, color) {
  const chip = document.createElement('div');
  chip.className = 'buff-chip';
  chip.style.borderColor = color;
  chip.style.color = color;
  chip.innerHTML = `<span>${title}</span> <strong style="color: #fff;">${val}</strong>`;
  container.appendChild(chip);
}

function renderArtifactTray() {
  const tray = document.getElementById('artifactTray');
  if (!tray) return;
  tray.innerHTML = '';

  collectedArtifacts.forEach(artId => {
    const art = ARTIFACT_DEFINITIONS[artId];
    if (!art) return;

    const slot = document.createElement('div');
    const rarityClass = (art.rarity || 'common').replace('_', '-');
    slot.className = `artifact-icon perk-slot ${rarityClass}`;
    slot.title = `${art.name} (${art.rarity.toUpperCase()}): ${art.desc}`;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'slot-icon';
    iconSpan.textContent = art.icon;
    slot.appendChild(iconSpan);

    tray.appendChild(slot);
  });
}

// PRIMARY COMBAT PATH (FLOOR 2)
function openPrimaryPathModal() {
  currentAppScreen = 'PRIMARY_PATH_SELECT';
  const subP = document.querySelector('#primaryPathOverlay .sub-glow');
  if (subP) {
    subP.textContent = 'Floor 2 Reached! Choose 1 of 25 Primary Combat Paths. This defines your core signature mechanic, unlocks exclusive upgrades, and shapes your ball physics.';
  }
  const grid = document.getElementById('primaryPathSelectionGrid');
  grid.innerHTML = '';
  if (window.audio) window.audio.protocolChosen();

  Object.values(BUILD_PATHS).forEach(p => {
    if (!isPathUnlocked(p.id)) return;
    const card = document.createElement('div');
    card.className = 'path-card-12 primary-path-card';
    card.setAttribute('data-path-id', p.id);
    card.style.borderColor = `${p.color}88`;
    card.innerHTML = `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-weight: 900; font-size: 1.05rem; color: ${p.color}; display: flex; align-items: center; gap: 6px;">
            <span>${p.icon}</span>
            <span>${p.name}</span>
          </div>
          <span style="font-size: 0.62rem; padding: 2px 6px; background: ${p.color}22; border: 1px solid ${p.color}66; border-radius: 4px; color: ${p.color}; font-weight: 800;">${p.difficulty.split('&')[0].trim()}</span>
        </div>
        <div style="font-size: 0.68rem; font-weight: 800; color: ${p.color}; text-transform: uppercase; margin-bottom: 4px;">Tag: ${p.tag}</div>
        <div style="font-size: 0.72rem; color: #ffd700; font-weight: 700; margin-bottom: 2px;">⚡ ${p.signature}</div>
        <div style="font-size: 0.7rem; color: #cbd5e1; line-height: 1.35; margin-bottom: 6px;">${p.signatureDesc}</div>
        <div style="font-size: 0.68rem; color: #94a3b8; line-height: 1.3; margin-bottom: 8px;"><strong>Strengths:</strong> ${p.strengths}</div>
      </div>
      <button class="btn-main" style="background: ${p.color}; color: #020408; font-weight: 900; padding: 8px; font-size: 0.76rem; border-radius: 8px; width: 100%;">
        Select Path
      </button>
    `;

    card.addEventListener('click', () => {
      primaryPath = p.id;
      player.archetype = p.id;
      recordCodexDiscovery(p.id);
      if (window.audio) window.audio.protocolChosen();
      document.getElementById('primaryPathOverlay').classList.add('hidden');
      updateHud();
      saveMidRunSession();
      currentAppScreen = 'DRAFT';
      openDraftModal();
    });

    grid.appendChild(card);
  });

  document.getElementById('primaryPathOverlay').classList.remove('hidden');
}

// SECONDARY SPECIALIZATION (FLOOR 4)
function openSecondaryPathModal() {
  currentAppScreen = 'SECONDARY_PATH_SELECT';
  const grid = document.getElementById('secondaryPathSelectionGrid');
  grid.innerHTML = '';
  if (window.audio) window.audio.protocolChosen();

  const branches = SECONDARY_BRANCHES[primaryPath] || SECONDARY_BRANCHES.velocity;
  branches.forEach(b => {
    if (!isPathUnlocked(b.id)) return;
    const secPath = BUILD_PATHS[b.id] || { color: '#00b0ff', icon: '🌟' };
    const card = document.createElement('div');
    card.className = 'protocol-card';
    card.style.borderColor = secPath.color;
    card.innerHTML = `
      <div>
        <div class="protocol-title" style="color: ${secPath.color};">
          <span>${secPath.icon}</span>
          <span>${b.name}</span>
        </div>
        <div class="protocol-desc" style="margin-top: 8px;">${b.desc}</div>
      </div>
      <button class="btn-main" style="background: ${secPath.color}; color: #020408; padding: 10px; font-size: 0.8rem; border-radius: 8px; margin-top: 14px;">
        Select Specialization
      </button>
    `;

    card.addEventListener('click', () => {
      secondaryBranch = b.id;
      recordCodexDiscovery(b.id);
      if (window.audio) window.audio.protocolChosen();
      document.getElementById('secondaryPathOverlay').classList.add('hidden');
      updateHud();
      saveMidRunSession();
      currentAppScreen = 'DRAFT';
      openDraftModal();
    });

    grid.appendChild(card);
  });

  document.getElementById('secondaryPathOverlay').classList.remove('hidden');
}

// CYBERPUNK CASINO MODAL (Single Source of Truth)
function openCasinoModal() {
  currentAppScreen = 'CASINO_MODAL';
  const overlay = document.getElementById('casinoOverlay');
  updateDataChipsDisplay();
  document.getElementById('casinoSpinsRemaining').textContent = `${window.roomManager.casinoMaxSpins - window.roomManager.casinoSpinsUsed} / ${window.roomManager.casinoMaxSpins}`;
  document.getElementById('casinoOutcomeText').textContent = 'Place your wager and spin the wheel!';

  drawCasinoWheel(0);
  renderCasinoOddsTable();
  overlay.classList.remove('hidden');
}

function renderCasinoOddsTable() {
  const container = document.getElementById('casinoOddsTableContainer');
  if (!container || !window.roomManager.getCasinoOddsTable) return;
  const odds = window.roomManager.getCasinoOddsTable(selectedCasinoTier);
  container.innerHTML = `
    <div class="odds-header"><span>OUTCOME</span><span>WEIGHT</span><span>ODDS</span></div>
    ${odds.map(o => `
      <div class="odds-row">
        <span style="color:${o.color}; font-weight:700;">${o.name || o.label}</span>
        <span style="color:#94a3b8;">${o.weight}</span>
        <span style="font-weight:800; color:#fff;">${o.pct}%</span>
      </div>
    `).join('')}
  `;
}

function drawCasinoWheel(angle) {
  const wheelCanvas = document.getElementById('wheelCanvas');
  if (!wheelCanvas) return;
  const wCtx = wheelCanvas.getContext('2d');
  const cx = 130, cy = 130, radius = 120;
  wCtx.clearRect(0, 0, 260, 260);

  const table = (typeof CASINO_TABLES !== 'undefined' && CASINO_TABLES[selectedCasinoTier]) 
    ? CASINO_TABLES[selectedCasinoTier] 
    : { segments: [{ label: 'CHIPS 💾', color: '#ffd700' }] };
  const segments = table.segments;

  const segAng = (Math.PI * 2) / segments.length;
  for (let i = 0; i < segments.length; i++) {
    wCtx.beginPath();
    wCtx.moveTo(cx, cy);
    wCtx.arc(cx, cy, radius, angle + i * segAng, angle + (i + 1) * segAng);
    wCtx.fillStyle = segments[i].color || '#00f2fe';
    wCtx.fill();
    wCtx.strokeStyle = 'rgba(255,255,255,0.4)';
    wCtx.lineWidth = 1.5;
    wCtx.stroke();

    // Text
    wCtx.save();
    wCtx.translate(cx, cy);
    wCtx.rotate(angle + i * segAng + segAng / 2);
    wCtx.textAlign = 'right';
    wCtx.fillStyle = '#020408';
    wCtx.font = '900 10px sans-serif';
    wCtx.fillText(segments[i].label, radius - 14, 4);
    wCtx.restore();
  }

  // Center hub
  wCtx.fillStyle = '#020408';
  wCtx.beginPath();
  wCtx.arc(cx, cy, 22, 0, Math.PI * 2);
  wCtx.fill();
  wCtx.strokeStyle = '#ffd700';
  wCtx.lineWidth = 2.5;
  wCtx.stroke();
}

// UNDERGROUND RUN SHOP MODAL
function openShopModal() {
  currentAppScreen = 'SHOP_MODAL';
  renderShopUI();
  document.getElementById('shopOverlay')?.classList.remove('hidden');
}
window.openShopModal = openShopModal;

function renderShopUI() {
  const shop = window.roomManager.activeShop;
  const container = document.getElementById('shopItemsContainer');
  if (!container || !shop) return;

  document.getElementById('shopChipsDisplay').textContent = runDataChips;
  const rerollBtn = document.getElementById('btnRerollShop');
  if (rerollBtn) {
    const cost = window.roomManager.getShopRerollCost();
    rerollBtn.textContent = `🔄 REROLL (${cost} 💾)`;
    rerollBtn.disabled = runDataChips < cost;
  }

  container.innerHTML = '';
  shop.inventory.forEach((item, index) => {
    const card = document.createElement('div');
    const rarityClass = item.rarity || 'common';
    card.className = `shop-card ${rarityClass} ${item.purchased ? 'purchased' : ''}`;

    const canAfford = runDataChips >= item.cost;
    card.innerHTML = `
      <div class="shop-card-header">
        <span class="shop-card-icon">${item.icon || '📦'}</span>
        <span class="shop-card-rarity">${(item.rarity || 'common').toUpperCase()}</span>
      </div>
      <div class="shop-card-title">${item.name}</div>
      <div class="shop-card-desc">${item.desc}</div>
      <div class="shop-card-footer">
        <div class="shop-price-tag">${item.cost} 💾</div>
        <button class="btn-shop-buy" ${item.purchased || !canAfford ? 'disabled' : ''}>
          ${item.purchased ? 'OWNED' : 'PURCHASE'}
        </button>
      </div>
    `;

    const buyBtn = card.querySelector('.btn-shop-buy');
    if (buyBtn && !item.purchased) {
      buyBtn.addEventListener('click', () => {
        const success = window.roomManager.buyShopItem(index, player, addFloatingText);
        if (success) {
          renderShopUI();
          updateHud();
        }
      });
    }

    container.appendChild(card);
  });
}

// Draft modal with archetype & tag synergy
function openDraftModal() {
  const container = document.getElementById('draftCardsContainer');
  container.innerHTML = '';
  if (window.audio) window.audio.cardDraftChime();

  const eligibleArtifacts = Object.values(ARTIFACT_DEFINITIONS).filter(a => {
    if (collectedArtifacts.has(a.id)) return false;
    if (a.isUniqueBall && usedUniqueBallsThisRun.has(a.isUniqueBall)) return false;
    if (a.archetype && a.archetype !== 'general' && !isPathUnlocked(a.archetype)) return false;

    // Archetype compatibility check
    if (primaryPath && a.archetype && a.tier >= 2) {
      if (a.archetype !== primaryPath && a.archetype !== 'general' && a.archetype !== secondaryBranch) {
        return false;
      }
    }
    return true;
  });

  function rollRarityTier() {
    const r = Math.random() * 100;
    if (currentFloor <= 5) {
      if (r < 6.0) return 'super_rare';
      if (r < 28.0) return 'rare';
      return 'common';
    } else if (currentFloor <= 15) {
      if (r < 1.5) return 'legendary';
      if (r < 8.0) return 'epic';
      if (r < 28.0) return 'super_rare';
      if (r < 58.0) return 'rare';
      return 'common';
    } else {
      if (r < 14.0) return 'legendary';
      if (r < 35.0) return 'epic';
      if (r < 60.0) return 'super_rare';
      if (r < 85.0) return 'rare';
      return 'common';
    }
  }

  function pickWeightedArtifact() {
    const targetRarity = rollRarityTier();
    let pool = eligibleArtifacts.filter(a => a.rarity === targetRarity);
    if (pool.length === 0) pool = eligibleArtifacts;
    if (pool.length === 0) return null;

    // Weight candidate artifacts based on synergy and path alignment
    const weights = pool.map(a => {
      let w = 1.0;
      if (primaryPath && a.archetype === primaryPath) w += 0.6;
      if (secondaryBranch && a.archetype === secondaryBranch) w += 0.4;
      if (a.partner && collectedArtifacts.has(a.partner)) w += 1.0; // Fusion partner boost!
      return w;
    });
    const totalW = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * totalW;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const targetDraftCount = isMarketModActive('mod_wildcard_chip') ? 4 : 3;
  const choices = [];
  const chosenIds = new Set();
  let attempts = 0;
  while (choices.length < targetDraftCount && attempts < 50) {
    attempts++;
    const art = pickWeightedArtifact();
    if (art && !chosenIds.has(art.id)) {
      chosenIds.add(art.id);
      choices.push(art);
    }
  }

  let hasLegendary = choices.some(c => c.rarity === 'legendary');
  if (hasLegendary && window.audio) window.audio.legendaryJingle();

  choices.forEach((art, index) => {
    const card = document.createElement('div');
    const rarityClass = art.rarity.replace('_', '-');
    const hasPartner = art.partner && collectedArtifacts.has(art.partner);
    const fusionData = art.fusionId ? FUSIONS[art.fusionId] : null;

    card.className = `draft-card-3d ${rarityClass} ${hasPartner ? 'fusion-ready' : ''}`;
    card.style.animationDelay = `${index * 0.14}s`;

    let fusionHtml = '';
    if (fusionData) {
      if (hasPartner) {
        fusionHtml = `<div class="fusion-badge ready">🌟 FUSION READY: ${fusionData.name}!</div>`;
      } else {
        const partnerName = ARTIFACT_DEFINITIONS[art.partner]?.name || 'Partner';
        fusionHtml = `<div class="fusion-badge partial">🧩 Synergizes with: ${partnerName}</div>`;
      }
    }

    let tagsHtml = '';
    if (art.tags) {
      tagsHtml = art.tags.map(t => `<span style="font-size:0.6rem; padding:2px 5px; background:rgba(255,255,255,0.1); border-radius:4px; margin-right:4px;">${t}</span>`).join('');
    }

    card.innerHTML = `
      <div class="card-sheen"></div>
      <div style="font-size: 0.68rem; font-weight: 800; text-transform: uppercase; margin-bottom: 6px; color: ${RARITY_COLORS[art.rarity]};">
        ${art.rarity.replace('_', ' ')}
      </div>
      <div style="font-size: 2.3rem; margin-bottom: 8px;">${art.icon}</div>
      <div style="font-size: 1.05rem; font-weight: 800; color: #fff; margin-bottom: 4px;">${art.name}</div>
      <div style="margin-bottom: 6px;">${tagsHtml}</div>
      <div style="font-size: 0.76rem; color: #94a3b8; line-height: 1.45; margin-bottom: 8px;">${art.desc}</div>
      ${fusionHtml}
    `;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -16;
      const rotateY = ((x - centerX) / centerX) * 16;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;

      const sheen = card.querySelector('.card-sheen');
      if (sheen) {
        sheen.style.background = `radial-gradient(circle at ${(x / rect.width) * 100}% ${(y / rect.height) * 100}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 65%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });

    card.addEventListener('click', () => {
      executeCardSelectionSequence(card, art);
    });

    container.appendChild(card);
  });

  document.getElementById('draftOverlay').classList.remove('hidden');
}

function executeCardSelectionSequence(selectedCard, art) {
  if (window.audio) window.audio.powerupGet();
  const allCards = document.querySelectorAll('.draft-card-3d');

  allCards.forEach(c => {
    if (c === selectedCard) {
      c.classList.add('card-selected-anim');
    } else {
      c.classList.add('card-discard-anim');
    }
  });

  setTimeout(() => {
    window.addCollectedArtifact(art.id);
    if (art.partner && collectedArtifacts.has(art.partner) && art.fusionId) {
      recordCodexDiscovery(art.fusionId);
    }
    if (art.isUniqueBall) {
      activeBallTransformation = art.isUniqueBall;
      usedUniqueBallsThisRun.add(art.isUniqueBall);
    }

    document.getElementById('draftOverlay').classList.add('hidden');
    renderArtifactTray();
    currentAppScreen = 'PLAYING';
    generateRoom(currentFloor + 1);
  }, 420);
}

function checkFusionsDiscovery(newArtId) {
  if (typeof FUSIONS === 'undefined') return;
  Object.values(FUSIONS).forEach(fus => {
    if ((fus.item1 === newArtId || fus.item2 === newArtId) &&
        collectedArtifacts.has(fus.item1) &&
        collectedArtifacts.has(fus.item2)) {
      if (!window.activeFusionsThisRun) window.activeFusionsThisRun = new Set();
      if (!window.activeFusionsThisRun.has(fus.id)) {
        window.activeFusionsThisRun.add(fus.id);
        recordCodexDiscovery(fus.id);
        showFusionDiscoveredPopup(fus);
      }
    }
  });
}
window.checkFusionsDiscovery = checkFusionsDiscovery;

function showFusionDiscoveredPopup(fus) {
  if (!fus) return;
  if (window.audio && typeof window.audio.jackpotFanfare === 'function') {
    window.audio.jackpotFanfare();
  } else if (window.audio && typeof window.audio.powerupGet === 'function') {
    window.audio.powerupGet();
  }

  const container = document.getElementById('fusionToastContainer') || createFusionToastContainer();
  const toast = document.createElement('div');
  toast.className = 'fusion-toast-card';
  toast.innerHTML = `
    <div style="font-size: 0.72rem; font-weight: 900; color: #ffd700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 2px;">
      🌟 NEW FUSION UNLOCKED! 🌟
    </div>
    <div style="display: flex; align-items: center; gap: 10px; margin: 4px 0;">
      <span style="font-size: 2rem;">${fus.icon}</span>
      <span style="font-weight: 900; font-size: 1.15rem; color: #fff; text-shadow: 0 0 10px rgba(0,242,254,0.6);">${fus.name}</span>
    </div>
    <div style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.45;">${fus.desc}</div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 600);
  }, 4500);
}
window.showFusionDiscoveredPopup = showFusionDiscoveredPopup;

function createFusionToastContainer() {
  let c = document.getElementById('fusionToastContainer');
  if (!c) {
    c = document.createElement('div');
    c.id = 'fusionToastContainer';
    c.className = 'fusion-toast-container';
    document.body.appendChild(c);
  }
  return c;
}

window.addCollectedArtifact = function(artId) {
  if (!artId) return;
  const isNew = !collectedArtifacts.has(artId);
  collectedArtifacts.add(artId);
  recordCodexDiscovery(artId);
  checkFusionsDiscovery(artId);

  // Immediate stat recalculation and heals for mid-run pickups
  if (isNew) {
    if (artId === 'reinforced_hull') {
      player.maxHp = (player.maxHp || 4) + 1;
      player.hp = Math.min(player.maxHp, (player.hp || 4) + 1);
      if (typeof addFloatingText === 'function') addFloatingText('+1 MAX HP & HEAL (REINFORCED HULL)', player.x + 35, player.y, '#00e676');
    } else if (artId === 'iron_bastion') {
      player.maxHp = (player.maxHp || 4) + 1;
      player.hp = Math.min(player.maxHp, (player.hp || 4) + 1);
      player.h = Math.round((player.h || CONFIG.basePaddleH) * 1.15);
      if (typeof addFloatingText === 'function') addFloatingText('+1 MAX HP & +15% WIDTH (IRON BASTION)', player.x + 35, player.y, '#00e676');
    } else if (artId === 'aegis_bulwark') {
      player.h = Math.round((player.h || CONFIG.basePaddleH) * 1.20);
      if (typeof addFloatingText === 'function') addFloatingText('+20% WIDTH (AEGIS BULWARK)', player.x + 35, player.y, '#00b0ff');
    } else if (artId === 'bismuth_alloy') {
      player.h = Math.round((player.h || CONFIG.basePaddleH) * 1.10);
      if (typeof addFloatingText === 'function') addFloatingText('+10% WIDTH (BISMUTH ALLOY)', player.x + 35, player.y, '#ffd700');
    }
  }

  if (typeof updateHud === 'function') updateHud();
  if (typeof renderArtifactTray === 'function') renderArtifactTray();
};

function renderPauseMenuDetails() {
  const activeChar = CHARACTERS[metaSave.selectedChar] || CHARACTERS.vanguard;

  document.getElementById('pauseSector').textContent = `${currentSector} (${SECTOR_NAMES[currentSector - 1]?.name || 'Unknown'})`;
  document.getElementById('pauseFloor').textContent = `${currentFloor} (${runScore} Pts)`;
  document.getElementById('pausePaddleName').textContent = `${activeChar.icon} ${activeChar.name}`;
  document.getElementById('pauseRunCores').textContent = `💎 ${runCoresEarned}`;
  document.getElementById('pausePerkCount').textContent = collectedArtifacts.size;

  const protoStatus = document.getElementById('pauseProtocolStatus');
  if (protoStatus) {
    if (primaryPath && BUILD_PATHS[primaryPath]) {
      const a = BUILD_PATHS[primaryPath];
      const secName = secondaryBranch && BUILD_PATHS[secondaryBranch] ? BUILD_PATHS[secondaryBranch].name : (secondaryBranch || 'Base');
      protoStatus.textContent = `${a.icon} ${a.name} (${secName})`;
      protoStatus.style.color = a.color;
    } else {
      protoStatus.textContent = 'Not yet chosen (Unlocks after Floor 2)';
      protoStatus.style.color = '#94a3b8';
    }
  }

  const fusionsBox = document.getElementById('pauseFusionsContainer');
  fusionsBox.innerHTML = '';

  Object.values(FUSIONS).forEach(fus => {
    const has1 = collectedArtifacts.has(fus.item1);
    const has2 = collectedArtifacts.has(fus.item2);
    const isComplete = has1 && has2;

    const name1 = ARTIFACT_DEFINITIONS[fus.item1]?.name || fus.item1;
    const name2 = ARTIFACT_DEFINITIONS[fus.item2]?.name || fus.item2;

    const line = document.createElement('div');
    line.className = 'fusion-line';
    line.innerHTML = `
      <div>
        <span style="font-size: 1.05rem; margin-right: 6px;">${fus.icon}</span>
        <strong style="color: ${isComplete ? '#ffd700' : (has1 || has2 ? '#00f2fe' : '#64748b')};">${fus.name}</strong>
        <span style="font-size: 0.72rem; color: #94a3b8; margin-left: 6px;">(${name1} + ${name2})</span>
      </div>
      <div style="font-weight: 800; color: ${isComplete ? '#ffd700' : (has1 || has2 ? '#00b0ff' : '#475569')};">
        ${isComplete ? '🌟 ACTIVE' : (has1 || has2 ? '🧩 1/2 FOUND' : '🔒 UNDISCOVERED')}
      </div>
    `;
    fusionsBox.appendChild(line);
  });

  const upgGrid = document.getElementById('pauseUpgradesContainer');
  upgGrid.innerHTML = '';

  if (collectedArtifacts.size === 0) {
    upgGrid.innerHTML = '<div style="color:#64748b; font-size:0.78rem; grid-column:span 2;">No upgrades collected yet this run.</div>';
  } else {
    collectedArtifacts.forEach(artId => {
      const art = ARTIFACT_DEFINITIONS[artId];
      if (!art) return;

      const item = document.createElement('div');
      item.className = 'pause-upgrade-item';
      item.innerHTML = `
        <div class="pause-upgrade-icon" style="border: 1.5px solid ${RARITY_COLORS[art.rarity]}; color: ${RARITY_COLORS[art.rarity]};">${art.icon}</div>
        <div>
          <div style="font-weight: 800; font-size: 0.84rem; color: #fff;">${art.name} <span style="font-size: 0.65rem; color: ${RARITY_COLORS[art.rarity]};">(${art.rarity.toUpperCase()})</span></div>
          <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">${art.desc}</div>
        </div>
      `;
      upgGrid.appendChild(item);
    });
  }

  const purchasesBox = document.getElementById('pausePurchasesContainer');
  if (purchasesBox) {
    purchasesBox.innerHTML = '';
    if (!runPurchases || runPurchases.length === 0) {
      purchasesBox.innerHTML = '<div style="color:#64748b; font-size:0.78rem; grid-column:span 2;">No shop purchases recorded yet this run.</div>';
    } else {
      runPurchases.forEach(item => {
        const div = document.createElement('div');
        div.className = 'pause-purchase-item';
        div.innerHTML = `
          <div style="font-size: 1.1rem; margin-right: 6px;">${item.icon || '💾'}</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 800; font-size: 0.82rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${item.name}
            </div>
            <div style="font-size: 0.7rem; color: #ffd700;">${item.cost} 💾 • <span style="color:#94a3b8;">${item.source || 'Shop'}</span></div>
          </div>
          <span class="pause-purchase-badge ${item.status === 'ACTIVE' ? 'active' : 'consumed'}">${item.status}</span>
        `;
        purchasesBox.appendChild(div);
      });
    }
  }

  const effectsBox = document.getElementById('pauseActiveEffectsContainer');
  if (effectsBox) {
    effectsBox.innerHTML = '';
    const effects = [];
    if (activeBuffs.shieldCharges > 0) {
      effects.push({ name: `Shield Charges x${activeBuffs.shieldCharges}`, icon: '🛡️', color: '#00b0ff' });
    }
    if (activeBuffs.twinBlasters > 0) {
      effects.push({ name: `Twin Blasters (${Math.ceil(activeBuffs.twinBlasters / 60)}s)`, icon: '🔫', color: '#d500f9' });
    }
    if (activeBuffs.fireball > 0) {
      effects.push({ name: `Inferno Ball (${Math.ceil(activeBuffs.fireball / 60)}s)`, icon: '🔥', color: '#ff5500' });
    }
    if (activeBuffs.lightning > 0) {
      effects.push({ name: `Volt Overcharge (${Math.ceil(activeBuffs.lightning / 60)}s)`, icon: '⚡', color: '#00f2fe' });
    }
    if (activeBuffs.megaBall > 0) {
      effects.push({ name: `Mega Ball (${Math.ceil(activeBuffs.megaBall / 60)}s)`, icon: '💥', color: '#ffd700' });
    }
    if (primaryPath && typeof BUILD_PATHS !== 'undefined') {
      const pDef = BUILD_PATHS[primaryPath];
      if (pDef) effects.push({ name: `${pDef.name} Protocol`, icon: pDef.icon, color: pDef.color });
    }

    if (effects.length === 0) {
      effectsBox.innerHTML = '<div style="color:#64748b; font-size:0.76rem;">No temporary effects active.</div>';
    } else {
      effects.forEach(eff => {
        const chip = document.createElement('div');
        chip.className = 'pause-effect-chip';
        chip.style.borderColor = eff.color;
        chip.style.color = eff.color;
        chip.innerHTML = `<span>${eff.icon}</span> <span>${eff.name}</span>`;
        effectsBox.appendChild(chip);
      });
    }
  }
}

function getCodexDiscoverySet() {
  try {
    const raw = localStorage.getItem('CYBER_BREAKER_CODEX_DISCOVERY_V1');
    if (raw) return new Set(JSON.parse(raw));
  } catch (e) {}
  return new Set();
}

function recordCodexDiscovery(itemId) {
  if (!itemId) return;
  try {
    const s = getCodexDiscoverySet();
    if (!s.has(itemId)) {
      s.add(itemId);
      localStorage.setItem('CYBER_BREAKER_CODEX_DISCOVERY_V1', JSON.stringify([...s]));
    }
  } catch (e) {}
}

let currentCodexTab = 'paths';
let selectedCodexPath = 'kinetic';
let codexPathViewMode = 'grid';

function renderCyberCodex(tab = 'paths') {
  currentCodexTab = tab;
  if (tab === 'paths') {
    codexPathViewMode = 'grid';
  }
  document.querySelectorAll('.codex-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === currentCodexTab);
  });
  const pBtn = document.getElementById('tabPathsBtn');
  if (pBtn && typeof BUILD_PATHS !== 'undefined') {
    pBtn.textContent = `⚡ ${Object.keys(BUILD_PATHS).length} BUILD PATHS`;
  }
  renderCyberCodexTab();
}

function renderCyberCodexTab() {
  const contentArea = document.getElementById('codexContentArea');
  if (!contentArea) return;
  contentArea.innerHTML = '';

  if (currentCodexTab === 'paths') {
    const allPaths = Object.values(BUILD_PATHS);
    const totalPaths = allPaths.length;
    const unlockedCount = allPaths.filter(p => isPathUnlocked(p.id)).length;

    // Header Overview Bar
    const headerBar = document.createElement('div');
    headerBar.style.display = 'flex';
    headerBar.style.justifyContent = 'space-between';
    headerBar.style.alignItems = 'center';
    headerBar.style.flexWrap = 'wrap';
    headerBar.style.gap = '8px';
    headerBar.style.paddingBottom = '10px';
    headerBar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.12)';
    headerBar.style.marginBottom = '8px';

    if (codexPathViewMode === 'dossier') {
      const curPath = BUILD_PATHS[selectedCodexPath] || BUILD_PATHS.kinetic;
      headerBar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="btn-sec" id="btnBackToPathsGrid" style="display: flex; align-items: center; gap: 6px; font-weight: 800; padding: 6px 12px; font-size: 0.78rem;">
            ← ALL 25 PATHS
          </button>
          <span style="font-size: 0.95rem; font-weight: 900; color: #ffd700;">DOSSIER: ${curPath.name.toUpperCase()}</span>
        </div>
        <div style="font-size: 0.72rem; color: #94a3b8;">
          Protocol Clearance: <strong style="color: ${curPath.color};">${curPath.tag}</strong>
        </div>
      `;
      contentArea.appendChild(headerBar);

      headerBar.querySelector('#btnBackToPathsGrid')?.addEventListener('click', () => {
        codexPathViewMode = 'grid';
        if (window.audio && typeof window.audio.paddleHit === 'function') window.audio.paddleHit();
        renderCyberCodexTab();
      });

      // Dossier Panel
      const curUnlocked = isPathUnlocked(curPath.id);
      const dossier = document.createElement('div');
      dossier.className = 'codex-dossier-panel';
      dossier.style.borderColor = curUnlocked ? `${curPath.color}66` : '#64748b66';

      if (!curUnlocked) {
        dossier.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 1px solid rgba(100, 116, 139, 0.3); padding-bottom: 8px;">
            <div>
              <div style="font-size: 1.25rem; font-weight: 900; color: #94a3b8; display: flex; align-items: center; gap: 8px;">
                <span>🔒</span>
                <span>CLASSIFIED ARCHIVAL PROTOCOL</span>
              </div>
              <div style="font-size: 0.74rem; color: #64748b; font-weight: 700; margin-top: 2px;">Tag: Classified Endgame Signature • Security Clearance Level 5</div>
            </div>
            <span style="padding: 3px 8px; background: rgba(100, 116, 139, 0.2); border: 1px solid #64748b; border-radius: 4px; font-size: 0.72rem; color: #94a3b8; font-weight: 800;">LOCKED / ENCRYPTED</span>
          </div>
          <div style="background: rgba(0,0,0,0.3); border-left: 3px solid #ffd700; padding: 10px 14px; border-radius: 4px; margin-bottom: 12px;">
            <div style="font-weight: 800; font-size: 0.8rem; color: #ffd700; margin-bottom: 3px;">⚡ UNLOCK REQUIREMENT</div>
            <div style="font-size: 0.75rem; color: #cbd5e1; line-height: 1.4;">Defeat Chief Architect Bennie in the Secret Workshop to de-encrypt this experimental combat protocol and unlock its full suite of 10+ gadgets and prototype mechanics.</div>
          </div>
          <div style="font-size: 0.72rem; color: #64748b; font-style: italic;">All telemetry, signature contraptions, and upgrades for this protocol remain encrypted until verified in live combat.</div>
        `;
      } else {
        const secListHtml = (curPath.compatibleSecondary || []).map(secKey => {
          const sec = BUILD_PATHS[secKey] || { name: secKey, icon: '🌟', color: '#00b0ff' };
          return `<span style="display:inline-flex; align-items:center; gap:4px; padding:3px 7px; background:rgba(255,255,255,0.08); border-radius:4px; font-size:0.72rem; color:${sec.color};">${sec.icon} ${sec.name}</span>`;
        }).join(' ');

        const pathUpgrades = Object.values(ARTIFACT_DEFINITIONS).filter(a => a.archetype === curPath.id);
        let pathUpgHtml = '';
        pathUpgrades.forEach(u => {
          pathUpgHtml += `
            <div style="display: flex; gap: 8px; align-items: flex-start; padding: 6px; background: rgba(0,0,0,0.3); border-radius: 6px; border: 1px solid ${RARITY_COLORS[u.rarity] || '#00f2fe'}33;">
              <span style="font-size: 1.1rem;">${u.icon}</span>
              <div>
                <div style="font-weight: 800; font-size: 0.76rem; color: ${RARITY_COLORS[u.rarity] || '#fff'};">${u.name} <span style="font-size: 0.62rem; color: #94a3b8;">(${u.rarity.toUpperCase()})</span></div>
                <div style="font-size: 0.7rem; color: #cbd5e1;">${u.desc}</div>
              </div>
            </div>
          `;
        });

        dossier.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${curPath.color}44; padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 2rem;">${curPath.icon}</span>
              <div>
                <div style="font-size: 1.25rem; font-weight: 900; color: ${curPath.color};">${curPath.name.toUpperCase()} CORE</div>
                <div style="font-size: 0.72rem; color: #94a3b8;">Tag: ${curPath.tag} • Difficulty: <strong style="color: #ffd700;">${curPath.difficulty}</strong></div>
              </div>
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1; font-style: italic; max-width: 320px; text-align: right;">${curPath.idealFor}</div>
          </div>

          <div style="background: rgba(0, 242, 254, 0.06); border-left: 3px solid ${curPath.color}; padding: 8px 12px; border-radius: 6px;">
            <strong style="color: ${curPath.color}; font-size: 0.8rem; display: block; margin-bottom: 2px;">⚡ SIGNATURE MECHANIC: ${curPath.signature}</strong>
            <p style="font-size: 0.76rem; color: #cbd5e1; margin: 0;">${curPath.signatureDesc}</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.75rem;">
            <div style="background: rgba(0, 230, 118, 0.08); border: 1px solid rgba(0, 230, 118, 0.3); border-radius: 6px; padding: 8px;">
              <strong style="color: #00e676; display: block; margin-bottom: 2px;">✔ KEY STRENGTHS</strong>
              <span style="color: #cbd5e1;">${curPath.strengths}</span>
            </div>
            <div style="background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 6px; padding: 8px;">
              <strong style="color: #f43f5e; display: block; margin-bottom: 2px;">✖ KEY WEAKNESSES</strong>
              <span style="color: #cbd5e1;">${curPath.weaknesses}</span>
            </div>
          </div>

          <div style="font-size: 0.74rem;">
            <strong style="color: #94a3b8; display: block; margin-bottom: 4px;">COMPATIBLE SECONDARY SPECIALIZATIONS (FLOOR 4):</strong>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">${secListHtml}</div>
          </div>

          <div style="margin-top: 4px;">
            <strong style="color: #ffd700; font-size: 0.76rem; display: block; margin-bottom: 6px;">PATH-EXCLUSIVE UPGRADES (${pathUpgrades.length}):</strong>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">${pathUpgHtml}</div>
          </div>
        `;
      }
      contentArea.appendChild(dossier);

    } else {
      // Default: ALL 25 PATHS OVERVIEW GRID
      headerBar.innerHTML = `
        <div style="font-weight: 900; font-size: 1.05rem; color: #00f2fe; display: flex; align-items: center; gap: 8px;">
          <span>⚡</span>
          <span>${totalPaths} COMBAT PROTOCOLS REGISTERED</span>
          <span style="font-size: 0.72rem; color: #ffd700; background: rgba(255, 215, 0, 0.15); border: 1px solid rgba(255, 215, 0, 0.4); border-radius: 4px; padding: 2px 8px;">${unlockedCount} / ${totalPaths} UNLOCKED</span>
        </div>
        <div style="font-size: 0.74rem; color: #94a3b8; font-style: italic;">
          Select any combat path to inspect full technical dossier & upgrades
        </div>
      `;
      contentArea.appendChild(headerBar);

      const pathsGrid = document.createElement('div');
      pathsGrid.className = 'codex-paths-grid';

      allPaths.forEach(p => {
        const isSel = p.id === selectedCodexPath;
        const isUnlocked = isPathUnlocked(p.id);
        const card = document.createElement('div');
        card.className = `codex-path-card ${isSel ? 'selected' : ''} ${!isUnlocked ? 'classified' : ''}`;
        card.setAttribute('data-path-id', p.id);
        card.style.borderColor = isSel ? '#ffd700' : (!isUnlocked ? '#64748b' : `${p.color}88`);

        if (!isUnlocked) {
          card.innerHTML = `
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div style="font-weight: 900; font-size: 1.05rem; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
                  <span>🔒</span>
                  <span>Classified Protocol</span>
                </div>
                <span style="font-size: 0.62rem; padding: 2px 6px; background: rgba(100, 116, 139, 0.2); border: 1px solid #64748b; border-radius: 4px; color: #94a3b8; font-weight: 800;">LOCKED</span>
              </div>
              <div style="font-size: 0.68rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">TAG: ENDGAME PROTOCOL</div>
              <div style="font-size: 0.72rem; color: #ffd700; font-weight: 700; margin-bottom: 2px;">⚡ Encrypted Signature</div>
              <div style="font-size: 0.7rem; color: #94a3b8; line-height: 1.35; margin-bottom: 6px;">Defeat Chief Architect Bennie in the Secret Workshop to de-encrypt this protocol.</div>
              <div style="font-size: 0.68rem; color: #64748b; line-height: 1.3; margin-bottom: 4px;"><strong>Strengths:</strong> Classified telemetry</div>
              <div style="font-size: 0.68rem; color: #64748b; line-height: 1.3; margin-bottom: 6px;"><strong>Weaknesses:</strong> Requires security clearance</div>
            </div>
            <button class="btn-sec" style="font-size: 0.74rem; padding: 6px; border-radius: 6px; width: 100%;">
              🔒 View Classified Dossier
            </button>
          `;
        } else {
          const keyUpgs = Object.values(ARTIFACT_DEFINITIONS).filter(a => a.archetype === p.id).slice(0, 3);
          const upgChips = keyUpgs.map(u => `<span style="font-size:0.62rem; padding:1px 5px; background:rgba(0,0,0,0.5); border:1px solid ${(RARITY_COLORS && RARITY_COLORS[u.rarity]) || '#00f2fe'}55; border-radius:4px; color:${(RARITY_COLORS && RARITY_COLORS[u.rarity]) || '#fff'};">${u.icon} ${u.name}</span>`).join(' ');

          card.innerHTML = `
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div style="font-weight: 900; font-size: 1.05rem; color: ${p.color}; display: flex; align-items: center; gap: 6px;">
                  <span>${p.icon}</span>
                  <span>${p.name}</span>
                </div>
                <div style="display: flex; gap: 4px;">
                  <span style="font-size: 0.62rem; padding: 2px 6px; background: ${p.color}22; border: 1px solid ${p.color}66; border-radius: 4px; color: ${p.color}; font-weight: 800;">${p.difficulty.split('&')[0].trim()}</span>
                  <span style="font-size: 0.62rem; padding: 2px 6px; background: rgba(0,230,118,0.15); border: 1px solid #00e676; border-radius: 4px; color: #00e676; font-weight: 800;">ACTIVE</span>
                </div>
              </div>
              <div style="font-size: 0.68rem; font-weight: 800; color: ${p.color}; text-transform: uppercase; margin-bottom: 4px;">TAG: ${p.tag}</div>
              <div style="font-size: 0.72rem; color: #ffd700; font-weight: 700; margin-bottom: 2px;">⚡ ${p.signature}</div>
              <div style="font-size: 0.7rem; color: #cbd5e1; line-height: 1.35; margin-bottom: 6px;">${p.signatureDesc}</div>
              <div style="font-size: 0.68rem; color: #00e676; line-height: 1.3; margin-bottom: 3px;"><strong>✔ Strengths:</strong> <span style="color: #cbd5e1;">${p.strengths}</span></div>
              <div style="font-size: 0.68rem; color: #f43f5e; line-height: 1.3; margin-bottom: 6px;"><strong>✖ Weaknesses:</strong> <span style="color: #cbd5e1;">${p.weaknesses}</span></div>
              ${upgChips ? `<div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px;">${upgChips}</div>` : ''}
            </div>
            <button class="btn-main" style="background: ${p.color}; color: #020408; font-weight: 900; padding: 7px; font-size: 0.75rem; border-radius: 6px; width: 100%;">
              🔍 Inspect Dossier
            </button>
          `;
        }

        card.addEventListener('click', () => {
          selectedCodexPath = p.id;
          codexPathViewMode = 'dossier';
          if (window.audio && typeof window.audio.paddleHit === 'function') window.audio.paddleHit();
          renderCyberCodexTab();
        });

        pathsGrid.appendChild(card);
      });

      contentArea.appendChild(pathsGrid);
    }

  } else if (currentCodexTab === 'guide') {
    // How-to-build Guide
    const guide = CODEX_DATA.howToBuild;
    const titleBlock = document.createElement('div');
    titleBlock.innerHTML = `
      <div style="font-size: 1.2rem; font-weight: 900; color: #00f2fe; margin-bottom: 2px;">${guide.title}</div>
      <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 12px;">${guide.subtitle}</div>
    `;
    contentArea.appendChild(titleBlock);

    guide.sections.forEach(sec => {
      const block = document.createElement('div');
      block.className = 'codex-guide-block';
      block.innerHTML = `
        <h3>${sec.heading}</h3>
        <p>${sec.body}</p>
      `;
      contentArea.appendChild(block);
    });

  } else if (currentCodexTab === 'blueprints') {
    // Example Builds
    const titleBlock = document.createElement('div');
    titleBlock.innerHTML = `
      <div style="font-size: 1.2rem; font-weight: 900; color: #ffd700; margin-bottom: 2px;">TACTICAL BLUEPRINTS</div>
      <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 12px;">Pre-designed archetype combinations and synergy loadouts:</div>
    `;
    contentArea.appendChild(titleBlock);

    CODEX_DATA.exampleBuilds.forEach(bp => {
      const card = document.createElement('div');
      card.className = 'codex-blueprint-card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-size: 1.05rem; font-weight: 900; color: #ffd700;">🌟 ${bp.name}</div>
          <div style="font-size: 0.72rem;">
            <span style="color: #00f2fe; font-weight: 800;">${bp.primary}</span>
            <span style="color: #94a3b8;"> + </span>
            <span style="color: #d500f9; font-weight: 800;">${bp.secondary}</span>
          </div>
        </div>
        <div style="font-size: 0.75rem; color: #00e676; margin-bottom: 4px;">
          <strong>Target Fusions:</strong> ${bp.fusions.join(' • ')}
        </div>
        <div style="font-size: 0.76rem; color: #cbd5e1; line-height: 1.4;">${bp.summary}</div>
      `;
      contentArea.appendChild(card);
    });

  } else if (currentCodexTab === 'database') {
    // Discovery Archive
    const discoveredSet = getCodexDiscoverySet();
    const allUpgrades = Object.values(ARTIFACT_DEFINITIONS);
    const allFusions = Object.values(FUSIONS);
    const totalCount = allUpgrades.length + allFusions.length;
    const discoveredCount = [...discoveredSet].filter(id => ARTIFACT_DEFINITIONS[id] || FUSIONS[id]).length;
    const pct = Math.round((discoveredCount / totalCount) * 100);

    const titleBlock = document.createElement('div');
    titleBlock.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div>
          <div style="font-size: 1.2rem; font-weight: 900; color: #00e676;">DISCOVERY ARCHIVE</div>
          <div style="font-size: 0.75rem; color: #94a3b8;">Track every upgrade and fusion acquired during your runs:</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1rem; font-weight: 900; color: #00f2fe;">${discoveredCount} / ${totalCount} (${pct}%)</div>
          <div style="font-size: 0.65rem; color: #94a3b8;">Discovered Items</div>
        </div>
      </div>
      <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 12px;">
        <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #00f2fe, #00e676); border-radius: 3px;"></div>
      </div>
    `;
    contentArea.appendChild(titleBlock);

    // Fusions Header
    const fusHeader = document.createElement('div');
    fusHeader.style.cssText = 'font-size: 0.85rem; font-weight: 900; color: #ffd700; margin: 8px 0 6px 0;';
    fusHeader.textContent = `🌟 TOP-TIER FUSIONS (${allFusions.length})`;
    contentArea.appendChild(fusHeader);

    const fusionsGrid = document.createElement('div');
    fusionsGrid.className = 'codex-database-grid';
    allFusions.forEach(fus => {
      const isDisc = discoveredSet.has(fus.id);
      const item = document.createElement('div');
      item.className = `codex-database-item ${isDisc ? '' : 'undiscovered'}`;
      if (isDisc) {
        item.style.borderColor = '#ffd700';
        item.innerHTML = `
          <span style="font-size: 1.4rem;">${fus.icon}</span>
          <div style="flex: 1;">
            <div style="font-weight: 800; color: #ffd700; font-size: 0.76rem;">${fus.name}</div>
            <div style="font-size: 0.68rem; color: #cbd5e1; line-height: 1.3;">${fus.desc}</div>
          </div>
        `;
      } else {
        item.innerHTML = `
          <span style="font-size: 1.4rem; opacity: 0.4;">🔒</span>
          <div style="flex: 1;">
            <div style="font-weight: 800; color: #64748b; font-size: 0.76rem;">??? [UNDISCOVERED FUSION]</div>
            <div style="font-size: 0.68rem; color: #475569;">Discover compatible component items in a run.</div>
          </div>
        `;
      }
      fusionsGrid.appendChild(item);
    });
    contentArea.appendChild(fusionsGrid);

    // Upgrades Header
    const upgHeader = document.createElement('div');
    upgHeader.style.cssText = 'font-size: 0.85rem; font-weight: 900; color: #00f2fe; margin: 16px 0 6px 0;';
    upgHeader.textContent = `📦 SPECIALIZED UPGRADES (${allUpgrades.length})`;
    contentArea.appendChild(upgHeader);

    const upgGrid = document.createElement('div');
    upgGrid.className = 'codex-database-grid';
    allUpgrades.forEach(art => {
      const isDisc = discoveredSet.has(art.id);
      const item = document.createElement('div');
      item.className = `codex-database-item ${isDisc ? '' : 'undiscovered'}`;
      const color = RARITY_COLORS[art.rarity] || '#00f2fe';
      if (isDisc) {
        item.style.borderColor = `${color}66`;
        item.innerHTML = `
          <span style="font-size: 1.3rem;">${art.icon}</span>
          <div style="flex: 1;">
            <div style="font-weight: 800; color: ${color}; font-size: 0.76rem;">${art.name}</div>
            <div style="font-size: 0.68rem; color: #cbd5e1; line-height: 1.3;">${art.desc}</div>
          </div>
        `;
      } else {
        item.innerHTML = `
          <span style="font-size: 1.3rem; opacity: 0.4;">🔒</span>
          <div style="flex: 1;">
            <div style="font-weight: 800; color: #64748b; font-size: 0.76rem;">??? [LOCKED ${art.rarity.toUpperCase()}]</div>
            <div style="font-size: 0.68rem; color: #475569;">Archetype: ${art.archetype ? art.archetype.toUpperCase() : 'GENERAL'}</div>
          </div>
        `;
      }
      upgGrid.appendChild(item);
    });
    contentArea.appendChild(upgGrid);

  } else if (currentCodexTab === 'threats') {
    // Enemy Codex & Threat Database (34 hostiles across all game modes)
    const threatSet = getThreatDiscoverySet();
    const allThreats = (typeof THREAT_DATABASE !== 'undefined') ? THREAT_DATABASE : [];
    const discoveredCount = allThreats.filter(t => threatSet.has(t.id)).length;
    const totalCount = allThreats.length || 34;
    const pct = Math.round((discoveredCount / totalCount) * 100);

    const titleBlock = document.createElement('div');
    titleBlock.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div>
          <div style="font-size: 1.2rem; font-weight: 900; color: #ff2a6d;">THREAT DATABASE (ENEMY CODEX)</div>
          <div style="font-size: 0.75rem; color: #94a3b8;">Tactical intelligence on all hostiles, drones, duelists, cyber nodes, and sector bosses:</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1rem; font-weight: 900; color: #ffd700;">${discoveredCount} / ${totalCount} (${pct}%)</div>
          <div style="font-size: 0.65rem; color: #94a3b8;">Hostiles Archived</div>
        </div>
      </div>
      <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 12px;">
        <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #ff2a6d, #ffd700); border-radius: 3px;"></div>
      </div>
    `;
    contentArea.appendChild(titleBlock);

    // Category Filter Bar
    const filterBar = document.createElement('div');
    filterBar.className = 'lab-category-tabs';
    const categories = [
      { id: 'all', label: '⚡ ALL HOSTILES' },
      { id: 'SWARM', label: '🛸 SWARM DRONES' },
      { id: 'DUEL', label: '⚔️ AI DUELISTS' },
      { id: 'HEIST', label: '🔓 HEIST DEFENSES' },
      { id: 'BREAKOUT', label: '🧱 GRID ANOMALIES' },
      { id: 'BOSS', label: '💀 BOSSES & ELITES' }
    ];

    let activeThreatFilter = window._currentThreatFilter || 'all';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `lab-cat-btn ${activeThreatFilter === cat.id ? 'active' : ''}`;
      btn.textContent = cat.label;
      btn.addEventListener('click', () => {
        window._currentThreatFilter = cat.id;
        renderCyberCodexTab();
      });
      filterBar.appendChild(btn);
    });
    contentArea.appendChild(filterBar);

    // Threat Cards Grid
    const threatsGrid = document.createElement('div');
    threatsGrid.className = 'codex-threat-grid';

    const filteredThreats = allThreats.filter(t => {
      if (activeThreatFilter === 'all') return true;
      if (activeThreatFilter === 'BOSS') return t.category === 'BOSS' || t.category === 'MINI_BOSS' || t.category === 'BOSSES';
      if (activeThreatFilter === 'HEIST') return t.category === 'HEIST' || t.category === 'CYBER HEIST';
      return t.category === activeThreatFilter;
    });

    filteredThreats.forEach(t => {
      const isDisc = threatSet.has(t.id);
      const card = document.createElement('div');
      card.className = `codex-threat-card ${isDisc ? '' : 'undiscovered'}`;
      card.style.borderColor = isDisc ? (t.color || '#00f2fe') : 'rgba(255, 255, 255, 0.12)';

      if (isDisc) {
        card.innerHTML = `
          <div class="codex-threat-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.4rem;">${t.icon || '👾'}</span>
              <div>
                <strong style="color: ${t.color || '#f8fafc'}; font-size: 0.85rem;">${t.name}</strong>
                <div style="font-size: 0.65rem; color: #64748b;">${t.category} • ${t.appearsIn || 'Sectors'}</div>
              </div>
            </div>
            <span class="threat-badge" style="background: ${t.color || '#00f2fe'}22; border: 1px solid ${t.color || '#00f2fe'}66; color: ${t.color || '#00f2fe'};">
              ${t.threat || 'Threat'}
            </span>
          </div>
          <div class="threat-intel-row" style="margin-top: 4px;">${t.desc || ''}</div>
          <div class="threat-intel-row"><strong>Behavior:</strong> ${t.behavior || 'Direct engagement'}</div>
          <div class="threat-intel-row"><strong>Attacks:</strong> ${t.attacks || 'Kinetic collision'}</div>
          <div class="threat-intel-row" style="color: #ffd700;"><strong>Tactical Weakness:</strong> ${t.weakness || 'Focused firepower'}</div>
        `;
      } else {
        card.innerHTML = `
          <div class="codex-threat-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.4rem; opacity: 0.4;">🔒</span>
              <div>
                <strong style="color: #64748b; font-size: 0.85rem;">[ENCRYPTED HOSTILE INTEL]</strong>
                <div style="font-size: 0.65rem; color: #475569;">${t.category} SECTOR ANOMALY</div>
              </div>
            </div>
            <span class="threat-badge" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #64748b;">
              UNKNOWN
            </span>
          </div>
          <div class="threat-intel-row" style="color: #475569; font-style: italic; margin-top: 4px;">Encounter this hostile unit in combat to decrypt its behavioral heuristics and tactical vulnerabilities.</div>
          <div class="threat-intel-row" style="color: #38bdf8;"><strong>Intelligence Hint:</strong> ${t.appearsIn || 'Classified'}</div>
        `;
      }
      threatsGrid.appendChild(card);
    });

    contentArea.appendChild(threatsGrid);
  } else if (currentCodexTab === 'drops') {
    const reg = (typeof DROP_REGISTRY !== 'undefined') ? DROP_REGISTRY : POWERUP_DEFS;
    const allDrops = Object.values(reg);

    // Filter Bar with Categories & Game Modes
    const filterContainer = document.createElement('div');
    filterContainer.style.display = 'flex';
    filterContainer.style.flexDirection = 'column';
    filterContainer.style.gap = '8px';
    filterContainer.style.marginBottom = '12px';

    // Category row
    const catBar = document.createElement('div');
    catBar.className = 'lab-category-tabs';
    const catFilters = [
      { id: 'all', label: `⚡ ALL (${allDrops.length})` },
      { id: 'ATTACK', label: '⚔️ ATTACK' },
      { id: 'DEFENSE', label: '🛡️ DEFENSE' },
      { id: 'CONTROL', label: '🌀 CONTROL' },
      { id: 'UTILITY', label: '🔧 UTILITY' },
      { id: 'SPECIAL', label: '⭐ SPECIAL' }
    ];
    let activeDropCat = window._currentDropCatFilter || 'all';
    catFilters.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `lab-cat-btn codex-filter-pill ${activeDropCat === cat.id ? 'active' : ''}`;
      btn.setAttribute('data-filter', cat.id);
      btn.textContent = cat.label;
      btn.addEventListener('click', () => {
        window._currentDropCatFilter = cat.id;
        renderCyberCodexTab();
      });
      catBar.appendChild(btn);
    });
    filterContainer.appendChild(catBar);

    // Mode filter row
    const modeBar = document.createElement('div');
    modeBar.className = 'lab-category-tabs';
    modeBar.style.marginTop = '2px';
    const modeFilters = [
      { id: 'all', label: '🌐 ALL MODES' },
      { id: 'breakout', label: '🧱 BREAKOUT' },
      { id: 'duel', label: '⚔️ DUEL' },
      { id: 'swarm', label: '👾 SWARM' },
      { id: 'heist', label: '💾 HEIST' }
    ];
    let activeDropMode = window._currentDropModeFilter || 'all';
    modeFilters.forEach(m => {
      const btn = document.createElement('button');
      btn.className = `lab-cat-btn codex-filter-pill ${activeDropMode === m.id ? 'active' : ''}`;
      btn.setAttribute('data-mode', m.id);
      btn.style.fontSize = '0.72rem';
      btn.style.padding = '3px 8px';
      btn.textContent = m.label;
      btn.addEventListener('click', () => {
        window._currentDropModeFilter = m.id;
        renderCyberCodexTab();
      });
      modeBar.appendChild(btn);
    });
    filterContainer.appendChild(modeBar);

    contentArea.appendChild(filterContainer);

    // Filter drops dynamically
    const filteredDrops = allDrops.filter(d => {
      if (activeDropCat !== 'all' && d.category !== activeDropCat) return false;
      if (activeDropMode !== 'all') {
        const modes = Array.isArray(d.modes) ? d.modes : ['universal'];
        if (!modes.includes('universal') && !modes.includes(activeDropMode)) return false;
      }
      return true;
    });

    // Stats bar showing live dynamic count
    const statsBar = document.createElement('div');
    statsBar.style.display = 'flex';
    statsBar.style.justifyContent = 'space-between';
    statsBar.style.alignItems = 'center';
    statsBar.style.fontSize = '0.75rem';
    statsBar.style.color = '#94a3b8';
    statsBar.style.marginBottom = '10px';
    statsBar.style.fontWeight = '700';
    statsBar.innerHTML = `
      <span id="codexDropsCount">SHOWING <strong style="color:#00f2fe;">${filteredDrops.length}</strong> OF <strong style="color:#ffd700;">${allDrops.length}</strong> TACTICAL DROPS</span>
      <span style="color:#64748b;">SINGLE SOURCE OF TRUTH // 100% GAMEPLAY SYNCHRONIZED</span>
    `;
    contentArea.appendChild(statsBar);

    // Drops Grid
    const dropsGrid = document.createElement('div');
    dropsGrid.className = 'codex-threat-grid';

    filteredDrops.forEach(d => {
      const card = document.createElement('div');
      card.className = 'codex-threat-card codex-drop-card';
      const rarityColor = d.color || (d.rarity === 'Legendary' ? '#ffd700' : (d.rarity === 'Epic' ? '#d500f9' : (d.rarity === 'Rare' ? '#00b0ff' : '#00f2fe')));
      card.style.borderColor = `${rarityColor}66`;

      const modeBadges = (Array.isArray(d.modes) ? d.modes : ['universal']).map(m => {
        return `<span style="display:inline-block; padding:1px 5px; font-size:0.58rem; font-weight:800; border-radius:3px; background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.12); text-transform:uppercase;">${m}</span>`;
      }).join(' ');

      card.innerHTML = `
        <div class="codex-threat-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.5rem;">${d.icon}</span>
            <div>
              <strong style="color: #fff; font-size: 0.9rem;">${d.name}</strong>
              <div style="font-size: 0.65rem; color: ${rarityColor}; font-weight: 800; letter-spacing: 0.05em;">${d.category} • ${d.rarity.toUpperCase()}</div>
            </div>
          </div>
          <span class="threat-badge" style="background: ${rarityColor}18; border: 1px solid ${rarityColor}55; color: ${rarityColor}; font-size: 0.62rem; font-weight: 900;">
            ${d.rarity}
          </span>
        </div>
        <div style="font-size: 0.74rem; color: #cbd5e1; margin-top: 6px; line-height: 1.35;">${d.desc}</div>
        <div class="threat-intel-row" style="margin-top: 6px; color: #38bdf8;"><strong>Tactical Effect:</strong> ${d.effect || 'Temporary Buff'} ${d.duration > 0 ? `(${d.duration}s)` : ''}</div>
        <div class="threat-intel-row" style="display:flex; align-items:center; gap:4px; margin-top:4px;">
          <strong style="color:#94a3b8; font-size:0.68rem;">Modes:</strong> ${modeBadges}
        </div>
      `;
      dropsGrid.appendChild(card);
    });

    contentArea.appendChild(dropsGrid);
  }
}

// CYBER HANGAR: EXACT REQUIREMENT (HP HEARTS ONLY)
function renderHangar() {
  const sub = document.getElementById('hangarSubtitle');
  if (sub && typeof CHARACTERS !== 'undefined') {
    sub.textContent = `Select or unlock ${Object.keys(CHARACTERS).length} specialized combat paddles with unique modifiers.`;
  }

  const grid = document.getElementById('hangarGrid');
  grid.innerHTML = '';

  Object.values(CHARACTERS).forEach(ch => {
    const isUnlocked = metaSave.unlockedChars.includes(ch.id) || (Array.isArray(metaSave.unlockedCharacters) && metaSave.unlockedCharacters.includes(ch.id));
    const isSelected = metaSave.selectedChar === ch.id;
    const isSecretLocked = !!(ch.secretUnlock && !isUnlocked);
    const canAfford = !isUnlocked && !isSecretLocked && metaSave.cores >= ch.cost;

    const charMaxHp = Math.max(2, 4 + (metaSave.upgrades.meta_hull || 0) + ch.hpBonus);
    const heartsStr = '♥'.repeat(charMaxHp);
    const modDef = PADDLE_MODIFIERS[ch.modifier] || { name: ch.modifier, icon: '🛡️', color: ch.color };

    const card = document.createElement('div');
    card.className = `char-card ${isSelected ? 'selected' : ''}`;
    card.dataset.character = ch.id;

    let secretNoteHtml = '';
    if (isSecretLocked) {
      secretNoteHtml = `<div style="font-size: 0.68rem; color: #ffd700; font-weight: 800; margin-top: 4px; background: rgba(255, 215, 0, 0.1); padding: 4px 6px; border-radius: 4px; border: 1px solid rgba(255, 215, 0, 0.3);">🏆 SECRET REWARD: Defeat Chief Architect Bennie in Secret Workshop to unlock.</div>`;
    }

    let btnLabel = '';
    if (isSelected) btnLabel = '✓ SELECTED';
    else if (isUnlocked) btnLabel = 'SELECT';
    else if (isSecretLocked) btnLabel = '🔒 SECRET CHALLENGE';
    else btnLabel = `${ch.cost} 💎 UNLOCK`;

    card.innerHTML = `
      <div class="char-badge-tag" style="background: ${ch.color}22; color: ${ch.color}; border: 1px solid ${ch.color}55;">
        ${ch.tag}
      </div>
      <div>
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
          <span style="font-size: 1.4rem;">${ch.icon}</span>
          <div style="font-weight: 900; font-size: 0.95rem; color: ${ch.color};">${ch.name}</div>
        </div>
        <div style="font-size: 0.74rem; color: #94a3b8; line-height: 1.4; margin-bottom: 6px;">${ch.desc}</div>

        <div style="background: rgba(0,0,0,0.3); border: 1px solid ${modDef.color}44; border-radius: 6px; padding: 6px 8px; margin-bottom: 8px;">
          <div style="font-size: 0.68rem; font-weight: 800; color: ${modDef.color}; text-transform: uppercase;">
            ${modDef.icon} ${modDef.name}
          </div>
          <div style="font-size: 0.7rem; color: #cbd5e1; margin-top: 2px;">${ch.passiveText}</div>
        </div>

        <div class="stat-bars-container">
          <div class="stat-bar-row">
            <span>Speed</span>
            <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${ch.stats.speed}%;"></div></div>
          </div>
          <div class="stat-bar-row">
            <span>Paddle Length</span>
            <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${ch.stats.size}%;"></div></div>
          </div>
          <div class="stat-bar-row">
            <span>Armor / HP: ${charMaxHp} HP (${heartsStr})</span>
            <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${ch.stats.hp}%;"></div></div>
          </div>
          <div class="stat-bar-row">
            <span>Attack Power</span>
            <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${ch.stats.power}%;"></div></div>
          </div>
        </div>
        ${secretNoteHtml}
      </div>
      <button class="btn-action-sm btn-hangar-action" id="btn_char_${ch.id}">
        ${btnLabel}
      </button>
    `;

    const btn = card.querySelector(`#btn_char_${ch.id}`);
    if (isSelected || isSecretLocked || (!isUnlocked && !canAfford)) {
      btn.disabled = true;
    }

    btn.addEventListener('click', () => {
      if (!isUnlocked && canAfford && !isSecretLocked) {
        metaSave.cores -= ch.cost;
        if (!metaSave.unlockedChars.includes(ch.id)) metaSave.unlockedChars.push(ch.id);
        if (!metaSave.unlockedCharacters.includes(ch.id)) metaSave.unlockedCharacters.push(ch.id);
        metaSave.selectedChar = ch.id;
        saveMetaProgress();
        recordCodexDiscovery(ch.id);
        if (window.audio) window.audio.powerupGet();
        renderHangar();
      } else if (isUnlocked && !isSelected) {
        metaSave.selectedChar = ch.id;
        saveMetaProgress();
        if (window.audio) window.audio.paddleHit();
        renderHangar();
      }
    });

    grid.appendChild(card);
  });

  updateCoreDisplays();
}

function renderBlackMarket() {
  const grid = document.getElementById('marketGrid');
  if (!grid) return;
  grid.innerHTML = '';

  Object.values(BLACK_MARKET_MODS).forEach(mod => {
    const isOwned = metaSave.marketMods.includes(mod.id);
    const isActive = isMarketModActive(mod.id);
    const canAfford = !isOwned && metaSave.cores >= mod.cost;

    const card = document.createElement('div');
    card.className = `market-card ${isOwned ? 'licensed' : ''}`;

    let statusPillHtml = '';
    let actionBtnHtml = '';

    if (!isOwned) {
      statusPillHtml = `<span class="market-status-pill" style="color:#94a3b8; border:1px solid #64748b;">LOCKED</span>`;
      actionBtnHtml = `<button class="btn-action-sm" id="btn_mod_${mod.id}" ${!canAfford ? 'disabled' : ''}>${mod.cost} 💎 INSTALL MOD</button>`;
    } else {
      statusPillHtml = `<span class="market-status-pill ${isActive ? 'active' : 'disabled'}">PURCHASED • ${isActive ? 'ACTIVE' : 'DISABLED'}</span>`;
      actionBtnHtml = `<button class="market-toggle-btn ${isActive ? 'btn-turn-off' : 'btn-turn-on'}" id="btn_mod_${mod.id}">${isActive ? 'TURN OFF' : 'TURN ON'}</button>`;
    }

    card.innerHTML = `
      <div>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size: 1.4rem;">${mod.icon}</span>
            <div style="font-weight: 900; font-size: 0.95rem; color: #d500f9;">${mod.name}</div>
          </div>
          ${statusPillHtml}
        </div>
        <div style="font-size: 0.74rem; color: #94a3b8; line-height: 1.4; margin-bottom: 8px;">${mod.desc}</div>
      </div>
      ${actionBtnHtml}
    `;

    const btn = card.querySelector(`#btn_mod_${mod.id}`);
    if (btn) {
      btn.addEventListener('click', () => {
        if (!isOwned && canAfford) {
          metaSave.cores -= mod.cost;
          metaSave.marketMods.push(mod.id);
          if (!metaSave.marketModStates) metaSave.marketModStates = {};
          metaSave.marketModStates[mod.id] = true;
          saveMetaProgress();
          recordCodexDiscovery(mod.id);
          if (window.audio) window.audio.powerupGet();
          renderBlackMarket();
        } else if (isOwned) {
          toggleMarketMod(mod.id);
        }
      });
    }

    grid.appendChild(card);
  });

  updateCoreDisplays();
}

function renderLabItems() {
  const labList = document.getElementById('labList');
  labList.innerHTML = '';

  const abSecTitle = document.createElement('div');
  abSecTitle.className = 'lab-section-title';
  abSecTitle.textContent = '⚡ ACTIVE ABILITIES (CHOOSE 1)';
  labList.appendChild(abSecTitle);

  Object.values(ACTIVE_ABILITIES).forEach(ab => {
    const isUnlocked = metaSave.unlockedAbilities.includes(ab.id);
    const isEquipped = metaSave.equippedAbility === ab.id;
    const canAfford = !isUnlocked && metaSave.cores >= ab.cost;

    const row = document.createElement('div');
    row.className = `lab-card ${isEquipped ? 'active-equipped' : ''}`;

    let btnText = 'EQUIP';
    let btnDisabled = false;

    if (isEquipped) {
      btnText = '✓ EQUIPPED';
      btnDisabled = true;
    } else if (!isUnlocked) {
      btnText = `${ab.cost} 💎 UNLOCK`;
      btnDisabled = !canAfford;
    }

    row.innerHTML = `
      <div>
        <div style="font-weight: 800; font-size: 0.9rem; color: #fff;">${ab.icon} ${ab.name}</div>
        <div style="font-size: 0.74rem; color: #94a3b8; margin-top: 2px;">${ab.desc}</div>
      </div>
      <button class="btn-action-sm" ${btnDisabled ? 'disabled' : ''}>
        ${btnText}
      </button>
    `;

    const btn = row.querySelector('.btn-action-sm');
    btn.addEventListener('click', () => {
      if (!isUnlocked && canAfford) {
        metaSave.cores -= ab.cost;
        metaSave.unlockedAbilities.push(ab.id);
        metaSave.equippedAbility = ab.id;
        saveMetaProgress();
        recordCodexDiscovery(ab.id);
        if (window.audio) window.audio.powerupGet();
        renderLabItems();
      } else if (isUnlocked && !isEquipped) {
        metaSave.equippedAbility = ab.id;
        saveMetaProgress();
        if (window.audio) window.audio.paddleHit();
        renderLabItems();
      }
    });

    labList.appendChild(row);
  });

  const pasSecTitle = document.createElement('div');
  pasSecTitle.className = 'lab-section-title';
  pasSecTitle.textContent = '🛡️ RESEARCH HARDWARE & PROTOCOLS (22 ABILITIES)';
  labList.appendChild(pasSecTitle);

  // Category Filter Bar
  const catBar = document.createElement('div');
  catBar.className = 'lab-category-tabs';
  const labCats = [
    { id: 'all', label: '⚡ ALL (22)' },
    { id: 'combat', label: '⚔️ COMBAT' },
    { id: 'defense', label: '🛡️ DEFENSE' },
    { id: 'economy', label: '💾 ECONOMY' },
    { id: 'control', label: '🎯 CONTROL' },
    { id: 'heist', label: '🔓 CYBER HEIST' },
    { id: 'casino', label: '🎰 RISK & CASINO' }
  ];

  const activeCat = window._currentLabCategory || 'all';
  labCats.forEach(c => {
    const b = document.createElement('button');
    const isCatActive = activeCat === c.id || (activeCat === 'risk' && c.id === 'casino') || (activeCat === 'casino' && c.id === 'risk');
    b.className = `lab-cat-btn ${isCatActive ? 'active' : ''}`;
    b.textContent = c.label;
    b.addEventListener('click', () => {
      window._currentLabCategory = c.id;
      renderLabItems();
    });
    catBar.appendChild(b);
  });
  labList.appendChild(catBar);

  const abilitiesPool = (typeof RESEARCH_ABILITIES !== 'undefined') ? RESEARCH_ABILITIES : (typeof LAB_PASSIVES !== 'undefined' ? LAB_PASSIVES : []);
  const filteredAbilities = abilitiesPool.filter(a => activeCat === 'all' || a.category === activeCat || (activeCat === 'casino' && a.category === 'risk') || (activeCat === 'risk' && a.category === 'casino'));

  filteredAbilities.forEach(upg => {
    const currentLvl = (metaSave.upgrades && metaSave.upgrades[upg.id]) || 0;
    const isMax = currentLvl >= upg.maxLevel;
    const nextCost = isMax ? null : upg.costs[currentLvl];
    const canAfford = !isMax && metaSave.cores >= nextCost;

    const row = document.createElement('div');
    row.className = 'lab-card';

    let pipsHtml = '';
    for (let i = 0; i < upg.maxLevel; i++) {
      pipsHtml += `<div style="width: 20px; height: 5px; border-radius: 2px; background: ${i < currentLvl ? '#00f2fe' : '#1e293b'};"></div>`;
    }

    const catBadge = upg.category ? `<span style="font-size: 0.62rem; font-weight: 800; padding: 2px 6px; border-radius: 4px; background: rgba(0, 242, 254, 0.12); color: #00f2fe; margin-left: 6px; text-transform: uppercase;">${upg.category}</span>` : '';

    row.innerHTML = `
      <div>
        <div style="font-weight: 800; font-size: 0.9rem; color: #fff; display: flex; align-items: center;">
          ${upg.icon} ${upg.name} ${catBadge}
        </div>
        <div style="font-size: 0.74rem; color: #94a3b8; margin-top: 2px;">${upg.desc}</div>
        <div style="display: flex; gap: 4px; margin-top: 6px;">${pipsHtml}</div>
      </div>
      <button class="btn-action-sm" ${(!canAfford || isMax) ? 'disabled' : ''}>
        ${isMax ? 'MAX' : `${nextCost} 💎 UNLOCK`}
      </button>
    `;

    const btn = row.querySelector('.btn-action-sm');
    btn.addEventListener('click', () => {
      if (!isMax && canAfford) {
        metaSave.cores -= nextCost;
        if (!metaSave.upgrades) metaSave.upgrades = {};
        metaSave.upgrades[upg.id] = currentLvl + 1;
        saveMetaProgress();
        if (window.audio) window.audio.powerupGet();
        renderLabItems();
      }
    });
    labList.appendChild(row);
  });

  updateCoreDisplays();
}

function startNewRun(mode = 'MAIN') {
  if (window.audio) window.audio.init();
  clearMidRunSession();
  collectedArtifacts.clear();
  primaryPath = null;
  secondaryBranch = null;
  activeGameMode = mode;
  window.activeGameMode = mode;
  runDataChips = 0;
  window.runDataChips = 0;
  runPurchases = [];
  window.runPurchases = runPurchases;
  isLevel50EndlessUnlocked = false;
  if (window.roomManager) window.roomManager.activeShop = null;

  // Generate unique run seed for procedural roguelike run-to-run variation
  window.currentRunSeed = Math.floor(Math.random() * 1000000) + 1;

  // Roll run protocol modifier
  const RUN_PROTOCOLS = [
    { id: 'standard', name: 'STANDARD PROTOCOL', desc: 'Standard operating parameters active.' },
    { id: 'solar_flare', name: 'SOLAR FLARE SECTOR', desc: 'Radiant thermal surges: +15% ball velocity and burn damage.' },
    { id: 'overcharged_grid', name: 'OVERCHARGED GRID', desc: 'High-voltage grid: Ability cooldowns recover 15% faster.' },
    { id: 'deep_net', name: 'DEEP NET ANOMALY', desc: 'Encrypted channels: +20% score and bonus draft synergy.' },
    { id: 'neon_prosperity', name: 'NEON WEALTH PROTOCOL', desc: 'Corporate windfall: +25% bonus Data Chips from rooms.' },
    { id: 'titan_protocol', name: 'TITAN FORTRESS PROTOCOL', desc: 'Defensive reinforcement: Starts run with +1 Kinetic Shield.' }
  ];
  window.activeRunProtocol = RUN_PROTOCOLS[Math.floor(Math.random() * RUN_PROTOCOLS.length)];
  const protoBadge = document.getElementById('hudProtocolBadge');
  if (protoBadge) {
    protoBadge.style.display = 'flex';
    protoBadge.textContent = window.activeRunProtocol.name;
    protoBadge.title = window.activeRunProtocol.desc;
  }
  if (window.activeRunProtocol.id === 'titan_protocol') {
    activeBuffs.shieldCharges = Math.min(4, (activeBuffs.shieldCharges || 0) + 1);
  }

  // Authoritative admin security reset
  if (!window.isAdminSessionAuthorized) {
    window.isAdminAuthenticated = false;
  }

  bossChallengeState = 'none';
  bennieBoss = null;
  syncBennieBossHudVisibility();

  if (isMarketModActive('mod_smuggler')) {
    const rareOrEpic = Object.values(ARTIFACT_DEFINITIONS).filter(a => a.rarity === 'rare' || a.rarity === 'epic');
    if (rareOrEpic.length > 0) {
      const freePerk = rareOrEpic[Math.floor(Math.random() * rareOrEpic.length)];
      collectedArtifacts.add(freePerk.id);
      addFloatingText(`SMUGGLER'S STASH: +${freePerk.name.toUpperCase()}!`, CONFIG.width / 2 - 80, CONFIG.height / 2 - 40, '#ffd700');
    }
  }

  secondChanceAvailable = (metaSave.upgrades.meta_defibrillator > 0);
  abilityCooldownCurrent = 0;
  railgunCharge = 0;
  chronoCooldown = 0;
  timeScale = 1.0;
  timeScaleTimer = 0;
  voidPhaseActive = 0;
  player.invulnerableTimer = 0;
  player.overdriveGauge = 0;
  player.isOverdrive = false;

  runScore = 0;
  runCoresEarned = 0;
  combo = 0;

  document.getElementById('homeOverlay').classList.add('hidden');
  document.getElementById('hangarOverlay').classList.add('hidden');
  document.getElementById('blackMarketOverlay').classList.add('hidden');
  document.getElementById('labOverlay').classList.add('hidden');
  document.getElementById('codexOverlay').classList.add('hidden');
  document.getElementById('draftOverlay').classList.add('hidden');
  document.getElementById('primaryPathOverlay').classList.add('hidden');
  document.getElementById('secondaryPathOverlay').classList.add('hidden');
  document.getElementById('casinoOverlay').classList.add('hidden');
  document.getElementById('shopOverlay')?.classList.add('hidden');
  document.getElementById('leaderboardOverlay')?.classList.add('hidden');
  document.getElementById('victoryOverlay')?.classList.add('hidden');
  document.getElementById('gameOverOverlay').classList.add('hidden');
  document.getElementById('pauseOverlay').classList.add('hidden');

  document.getElementById('gameHud').style.opacity = '1';
  document.getElementById('abilityGaugeContainer').style.opacity = '1';
  updateDataChipsDisplay();

  currentAppScreen = 'PLAYING';
  generateRoom(1);
}

function resumeExistingRun() {
  if (!midRunSave || !midRunSave.active) return;
  if (window.audio) window.audio.init();

  collectedArtifacts.clear();
  if (Array.isArray(midRunSave.artifacts)) {
    midRunSave.artifacts.forEach(a => collectedArtifacts.add(a));
  }

  currentFloor = midRunSave.floor || 1;
  runScore = midRunSave.score || 0;
  runCoresEarned = midRunSave.runCoresEarned || 0;
  railgunCharge = midRunSave.railgunCharge || 0;
  activeBallTransformation = midRunSave.activeBallTransformation || 'normal';
  primaryPath = midRunSave.primaryPath || null;
  secondaryBranch = midRunSave.secondaryBranch || null;

  usedUniqueBallsThisRun.clear();
  if (Array.isArray(midRunSave.usedUniqueBallsThisRun)) {
    midRunSave.usedUniqueBallsThisRun.forEach(b => usedUniqueBallsThisRun.add(b));
  }

  runPurchases = Array.isArray(midRunSave.runPurchases) ? midRunSave.runPurchases : [];
  window.runPurchases = runPurchases;
  runDataChips = midRunSave.runDataChips || 0;
  window.runDataChips = runDataChips;
  updateDataChipsDisplay();

  document.getElementById('homeOverlay').classList.add('hidden');
  document.getElementById('pauseOverlay').classList.add('hidden');
  document.getElementById('primaryPathOverlay').classList.add('hidden');
  document.getElementById('secondaryPathOverlay').classList.add('hidden');
  document.getElementById('casinoOverlay').classList.add('hidden');
  document.getElementById('gameHud').style.opacity = '1';
  document.getElementById('abilityGaugeContainer').style.opacity = '1';

  currentAppScreen = 'PLAYING';
  generateRoom(currentFloor);

  if (midRunSave.hp) player.hp = midRunSave.hp;
  if (midRunSave.maxHp) player.maxHp = midRunSave.maxHp;
  updateHud();
}

function togglePauseMenu() {
  if (currentAppScreen === 'PLAYING' || currentAppScreen === 'BENNIE_BOSS') {
    prePauseScreen = currentAppScreen;
    window.prePauseScreen = currentAppScreen;
    currentAppScreen = 'PAUSED';
    if (prePauseScreen === 'PLAYING') {
      saveMidRunSession();
    }
    renderPauseMenuDetails();
    document.getElementById('pauseOverlay')?.classList.remove('hidden');
    syncBennieBossHudVisibility();
  } else if (currentAppScreen === 'PAUSED') {
    document.getElementById('pauseOverlay')?.classList.add('hidden');
    currentAppScreen = prePauseScreen || (bennieBoss && !bennieBoss.isDefeated ? 'BENNIE_BOSS' : 'PLAYING');
    prePauseScreen = null;
    window.prePauseScreen = null;
    syncBennieBossHudVisibility();
  }
}
window.togglePauseMenu = togglePauseMenu;

function returnToHome() {
  prePauseScreen = null;
  window.prePauseScreen = null;
  currentAppScreen = 'HOME';
  bossChallengeState = 'none';
  bennieBoss = null;
  syncBennieBossHudVisibility();
  document.getElementById('gameHud').style.opacity = '0';
  document.getElementById('abilityGaugeContainer').style.opacity = '0';
  document.getElementById('gameOverOverlay').classList.add('hidden');
  document.getElementById('pauseOverlay').classList.add('hidden');
  document.getElementById('draftOverlay').classList.add('hidden');
  document.getElementById('primaryPathOverlay').classList.add('hidden');
  document.getElementById('secondaryPathOverlay').classList.add('hidden');
  document.getElementById('casinoOverlay').classList.add('hidden');
  document.getElementById('shopOverlay')?.classList.add('hidden');
  document.getElementById('leaderboardOverlay')?.classList.add('hidden');
  document.getElementById('victoryOverlay')?.classList.add('hidden');
  document.getElementById('labOverlay').classList.add('hidden');
  document.getElementById('blackMarketOverlay').classList.add('hidden');
  document.getElementById('hangarOverlay').classList.add('hidden');
  document.getElementById('codexOverlay').classList.add('hidden');
  document.getElementById('codeEntryModal')?.classList.add('hidden');
  document.getElementById('adminPanelModal')?.classList.add('hidden');
  const homeOverlay = document.getElementById('homeOverlay');
  if (homeOverlay) {
    homeOverlay.classList.remove('hidden');
    homeOverlay.scrollTop = 0;
  }
  updateCoreDisplays();
  updateResumeButton();
}

// UI Event Listeners
document.getElementById('btnStartRun')?.addEventListener('click', () => startNewRun('MAIN'));
document.getElementById('btnResumeRun')?.addEventListener('click', resumeExistingRun);
document.getElementById('btnRetryRun')?.addEventListener('click', () => startNewRun(activeGameMode));
document.getElementById('btnBackToHome')?.addEventListener('click', returnToHome);
document.getElementById('btnPause')?.addEventListener('click', togglePauseMenu);
document.getElementById('btnResumeGame')?.addEventListener('click', togglePauseMenu);

// Game Mode Selection Cards & Buttons
document.querySelectorAll('.mode-card, .mode-btn').forEach(el => {
  el.addEventListener('click', (e) => {
    e.stopPropagation();
    const mode = el.dataset.mode || el.closest('.mode-card')?.dataset.mode || 'MAIN';
    startNewRun(mode);
  });
});

// Leaderboard Modal Handlers
document.getElementById('btnOpenLeaderboard')?.addEventListener('click', () => {
  openLeaderboardsModal('MAIN');
});
document.getElementById('btnCloseLeaderboard')?.addEventListener('click', () => {
  document.getElementById('leaderboardOverlay')?.classList.add('hidden');
  currentAppScreen = 'HOME';
});
document.querySelectorAll('.leaderboard-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    renderLeaderboardTab(btn.dataset.tab);
  });
});

// Run Shop Modal Handlers
document.getElementById('btnRerollShop')?.addEventListener('click', () => {
  const success = window.roomManager.rerollShop(player, addFloatingText);
  if (success) {
    renderShopUI();
  }
});
document.getElementById('btnLeaveShop')?.addEventListener('click', () => {
  document.getElementById('shopOverlay')?.classList.add('hidden');
  currentAppScreen = 'PLAYING';
  generateRoom(currentFloor + 1);
});

// Level 50 Victory Modal Handlers
document.getElementById('btnContinueEndlessOverdrive')?.addEventListener('click', () => {
  document.getElementById('victoryOverlay')?.classList.add('hidden');
  currentAppScreen = 'PLAYING';
  generateRoom(currentFloor + 1);
});
document.getElementById('btnVictoryReturnHome')?.addEventListener('click', () => {
  clearMidRunSession();
  returnToHome();
});

document.getElementById('btnSaveAndQuit').addEventListener('click', () => {
  saveMidRunSession();
  returnToHome();
});

document.getElementById('btnAbandonRun').addEventListener('click', () => {
  clearMidRunSession();
  returnToHome();
});

function openCyberCodex(tab = 'paths') {
  renderCyberCodex(tab);
  document.getElementById('codexOverlay').classList.remove('hidden');
}
window.openCyberCodex = openCyberCodex;

document.getElementById('btnOpenCodex').addEventListener('click', () => {
  openCyberCodex('paths');
});
document.getElementById('btnCloseCodex').addEventListener('click', () => {
  document.getElementById('codexOverlay').classList.add('hidden');
});

document.getElementById('tabPathsBtn')?.addEventListener('click', () => renderCyberCodex('paths'));
document.getElementById('tabGuideBtn')?.addEventListener('click', () => renderCyberCodex('guide'));
document.getElementById('tabBlueprintsBtn')?.addEventListener('click', () => renderCyberCodex('blueprints'));
document.getElementById('tabDatabaseBtn')?.addEventListener('click', () => renderCyberCodex('database'));
document.getElementById('tabThreatsBtn')?.addEventListener('click', () => renderCyberCodex('threats'));
document.getElementById('tabDropsBtn')?.addEventListener('click', () => renderCyberCodex('drops'));

// Pilot Profile Modal Logic
function openProfileModal() {
  currentAppScreen = 'PROFILE_MODAL';
  updateCallsignDisplays();
  const runs = (metaSave && metaSave.totalRuns) || (metaSave && metaSave.highestFloor > 1 ? 5 : 1);
  const apex = (metaSave && metaSave.highestFloor) || 1;
  const cores = (metaSave && metaSave.cores) || 0;
  const chips = (metaSave && metaSave.totalChipsEarned) || 0;
  const threatCount = getThreatDiscoverySet().size;
  const totalThreats = (typeof THREAT_DATABASE !== 'undefined') ? THREAT_DATABASE.length : 34;
  const charName = (typeof CHARACTERS !== 'undefined' && metaSave && CHARACTERS[metaSave.selectedChar]) ? CHARACTERS[metaSave.selectedChar].name : 'Vanguard';

  const rEl = document.getElementById('profTotalRuns');
  if (rEl) rEl.textContent = runs;
  const aEl = document.getElementById('profApexFloor');
  if (aEl) aEl.textContent = apex;
  const cEl = document.getElementById('profTotalCores');
  if (cEl) cEl.textContent = `${cores} 💎`;
  const chEl = document.getElementById('profTotalChips');
  if (chEl) chEl.textContent = `${chips} 💾`;
  const tEl = document.getElementById('profThreatDiscovery');
  if (tEl) tEl.textContent = `${threatCount} / ${totalThreats}`;
  const fEl = document.getElementById('profFavChassis');
  if (fEl) fEl.textContent = charName;

  document.getElementById('profileOverlay')?.classList.remove('hidden');
}

document.getElementById('btnOpenProfile')?.addEventListener('click', openProfileModal);
document.getElementById('btnHeaderCallsign')?.addEventListener('click', openProfileModal);
document.getElementById('btnCloseProfile')?.addEventListener('click', () => {
  document.getElementById('profileOverlay')?.classList.add('hidden');
  currentAppScreen = 'HOME';
});
document.getElementById('btnSaveCallsign')?.addEventListener('click', () => {
  const input = document.getElementById('inputCallsign');
  if (input) {
    const saved = setPlayerCallsign(input.value);
    input.value = saved;
    const fb = document.getElementById('callsignFeedback');
    if (fb) {
      fb.textContent = `✓ CALLSIGN SAVED: ${saved}`;
      setTimeout(() => { if (fb) fb.textContent = ''; }, 2500);
    }
    if (window.audio && typeof window.audio.paddleHit === 'function') window.audio.paddleHit();
  }
});

document.getElementById('btnOpenHangar').addEventListener('click', () => {
  renderHangar();
  document.getElementById('hangarOverlay').classList.remove('hidden');
});
document.getElementById('btnCloseHangar').addEventListener('click', () => {
  document.getElementById('hangarOverlay').classList.add('hidden');
  updateCoreDisplays();
});

document.getElementById('btnOpenBlackMarket').addEventListener('click', () => {
  renderBlackMarket();
  document.getElementById('blackMarketOverlay').classList.remove('hidden');
});
document.getElementById('btnCloseMarket').addEventListener('click', () => {
  document.getElementById('blackMarketOverlay').classList.add('hidden');
  updateCoreDisplays();
});

function openResearchLab(category) {
  if (category) {
    window._currentLabCategory = (category === 'risk') ? 'casino' : category;
  }
  renderLabItems();
  document.getElementById('labOverlay').classList.remove('hidden');
}
window.openResearchLab = openResearchLab;

document.getElementById('btnOpenLab').addEventListener('click', () => {
  openResearchLab();
});
document.getElementById('btnCloseLab').addEventListener('click', () => {
  document.getElementById('labOverlay').classList.add('hidden');
});

function openResetProgressionModal() {
  const modal = document.getElementById('resetProgressionModal');
  if (!modal) return;
  const step1 = document.getElementById('resetStep1');
  const step2 = document.getElementById('resetStep2');
  const input = document.getElementById('inputResetConfirm');
  const execBtn = document.getElementById('btnExecuteReset');

  if (step1) step1.style.display = 'flex';
  if (step2) step2.style.display = 'none';
  if (input) input.value = '';
  if (execBtn) {
    execBtn.disabled = true;
    execBtn.style.opacity = '0.5';
    execBtn.style.cursor = 'not-allowed';
  }
  modal.classList.remove('hidden');
}
window.openResetProgressionModal = openResetProgressionModal;

function closeResetProgressionModal() {
  const modal = document.getElementById('resetProgressionModal');
  if (modal) modal.classList.add('hidden');
}
window.closeResetProgressionModal = closeResetProgressionModal;

function executeFullProgressionReset() {
  try {
    localStorage.removeItem('CYBER_BREAKER_META_V14');
    localStorage.removeItem('CYBER_BREAKER_MIDRUN_V14');
    localStorage.removeItem('CYBER_BREAKER_CODEX_DISCOVERY_V1');
    localStorage.removeItem('CYBER_BREAKER_THREAT_DISCOVERIES_V1');
    localStorage.removeItem('CYBER_BREAKER_LEADERBOARDS_V1');
  } catch (e) {}

  metaSave = {
    cores: 0,
    highestFloor: 1,
    highScore: 0,
    selectedChar: 'vanguard',
    unlockedChars: ['vanguard'],
    equippedAbility: 'shockwave',
    equippedAbilities: ['shockwave'],
    unlockedAbilities: ['shockwave'],
    marketMods: [],
    upgrades: { meta_hull: 0, meta_servos: 0, meta_scavenger: 0, meta_defibrillator: 0 }
  };

  saveMetaProgress();
  clearMidRunSession();
  collectedArtifacts.clear();
  runPurchases = [];
  window.runPurchases = runPurchases;

  closeResetProgressionModal();
  document.getElementById('profileOverlay')?.classList.add('hidden');
  document.getElementById('labOverlay')?.classList.add('hidden');

  renderLabItems();
  if (typeof renderHangarCards === 'function') renderHangarCards();
  if (typeof renderMarketCards === 'function') renderMarketCards();
  updateCoreDisplays();
  updateCallsignDisplays();

  const homeOverlay = document.getElementById('homeOverlay');
  if (homeOverlay) {
    homeOverlay.classList.remove('hidden');
    homeOverlay.scrollTop = 0;
  }
  currentAppScreen = 'HOME';

  if (window.audio && typeof window.audio.brickHit === 'function') window.audio.brickHit();
  alert('PROGRESSION RESET COMPLETE: All saves, blueprints, and records have been re-initialized.');
}
window.executeFullProgressionReset = executeFullProgressionReset;

// Modal listeners
document.getElementById('btnResetSave')?.addEventListener('click', openResetProgressionModal);
document.getElementById('btnOpenResetProgression')?.addEventListener('click', openResetProgressionModal);
document.getElementById('btnCancelReset1')?.addEventListener('click', closeResetProgressionModal);
document.getElementById('btnCancelReset2')?.addEventListener('click', closeResetProgressionModal);

document.getElementById('btnConfirmResetStep1')?.addEventListener('click', () => {
  const step1 = document.getElementById('resetStep1');
  const step2 = document.getElementById('resetStep2');
  const input = document.getElementById('inputResetConfirm');
  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'flex';
  if (input) {
    input.value = '';
    input.focus();
  }
});

document.getElementById('inputResetConfirm')?.addEventListener('input', (e) => {
  const val = e.target.value.trim().toUpperCase();
  const execBtn = document.getElementById('btnExecuteReset');
  if (execBtn) {
    if (val === 'RESET') {
      execBtn.disabled = false;
      execBtn.style.opacity = '1';
      execBtn.style.cursor = 'pointer';
    } else {
      execBtn.disabled = true;
      execBtn.style.opacity = '0.5';
      execBtn.style.cursor = 'not-allowed';
    }
  }
});

document.getElementById('btnExecuteReset')?.addEventListener('click', () => {
  const input = document.getElementById('inputResetConfirm');
  if (input && input.value.trim().toUpperCase() === 'RESET') {
    executeFullProgressionReset();
  }
});

// Casino Wheel Physics & Single Source of Truth
let selectedCasinoTier = 'safe';
let casinoWheelCurrentAngle = 0;
let isCasinoWheelAnimating = false;

document.getElementById('btnWagerSafe')?.addEventListener('click', () => {
  if (isCasinoWheelAnimating) return;
  selectedCasinoTier = 'safe';
  document.querySelectorAll('.btn-wager').forEach(b => b.classList.remove('active'));
  document.getElementById('btnWagerSafe').classList.add('active');
  drawCasinoWheel(casinoWheelCurrentAngle);
  renderCasinoOddsTable();
});
document.getElementById('btnWagerHigh')?.addEventListener('click', () => {
  if (isCasinoWheelAnimating) return;
  selectedCasinoTier = 'highRoller';
  document.querySelectorAll('.btn-wager').forEach(b => b.classList.remove('active'));
  document.getElementById('btnWagerHigh').classList.add('active');
  drawCasinoWheel(casinoWheelCurrentAngle);
  renderCasinoOddsTable();
});
document.getElementById('btnWagerOverdrive')?.addEventListener('click', () => {
  if (isCasinoWheelAnimating) return;
  selectedCasinoTier = 'overdrive';
  document.querySelectorAll('.btn-wager').forEach(b => b.classList.remove('active'));
  document.getElementById('btnWagerOverdrive').classList.add('active');
  drawCasinoWheel(casinoWheelCurrentAngle);
  renderCasinoOddsTable();
});

document.getElementById('btnSpinWheel')?.addEventListener('click', () => {
  if (isCasinoWheelAnimating || window.roomManager.casinoIsSpinning) return;
  const table = (typeof CASINO_TABLES !== 'undefined' && CASINO_TABLES[selectedCasinoTier]) ? CASINO_TABLES[selectedCasinoTier] : { wager: 30 };
  const wager = (table.wager !== undefined) ? table.wager : (table.cost || 30);
  if (runDataChips < wager) {
    document.getElementById('casinoOutcomeText').textContent = `⚠️ NEED ${wager} DATA CHIPS 💾 (HAVE ${runDataChips})!`;
    if (window.audio && typeof window.audio.hurt === 'function') window.audio.hurt();
    return;
  }

  const res = window.roomManager.spinCasinoWheel(selectedCasinoTier, player, addFloatingText);
  if (!res) return;

  isCasinoWheelAnimating = true;
  document.getElementById('btnSpinWheel').disabled = true;
  document.getElementById('btnLeaveCasino').disabled = true;
  document.getElementById('casinoOutcomeText').textContent = 'SPINNING QUANTUM REEL...';
  updateDataChipsDisplay();

  const startAngle = casinoWheelCurrentAngle;
  const targetMod = (res.finalAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  const currentMod = (startAngle % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  let forwardDelta = targetMod - currentMod;
  if (forwardDelta <= 0) forwardDelta += Math.PI * 2;
  const targetEnd = startAngle + (Math.PI * 2 * 4) + forwardDelta;

  const duration = 3200;
  const startTime = performance.now();
  let lastPeg = -1;

  function animateWheel(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // Cubic ease-out deceleration
    const ease = 1 - Math.pow(1 - progress, 3);
    casinoWheelCurrentAngle = startAngle + (targetEnd - startAngle) * ease;
    drawCasinoWheel(casinoWheelCurrentAngle);

    // Audio peg tick on each segment passed
    const segAng = (Math.PI * 2) / (table.segments?.length || 8);
    const currentPeg = Math.floor(casinoWheelCurrentAngle / segAng);
    if (currentPeg !== lastPeg) {
      lastPeg = currentPeg;
      if (window.audio && typeof window.audio.paddleHit === 'function') {
        window.audio.paddleHit();
      }
    }

    if (progress < 1) {
      requestAnimationFrame(animateWheel);
    } else {
      isCasinoWheelAnimating = false;
      casinoWheelCurrentAngle = targetEnd % (Math.PI * 2);
      drawCasinoWheel(casinoWheelCurrentAngle);
      window.roomManager.applyCasinoOutcome(res.outcome, player, addFloatingText);
      document.getElementById('casinoOutcomeText').textContent = res.outcome.label || res.outcome.text || 'WAGER COMPLETE';
      updateDataChipsDisplay();
      document.getElementById('casinoSpinsRemaining').textContent = `${window.roomManager.casinoMaxSpins - window.roomManager.casinoSpinsUsed} / ${window.roomManager.casinoMaxSpins}`;
      document.getElementById('btnSpinWheel').disabled = window.roomManager.casinoSpinsUsed >= window.roomManager.casinoMaxSpins;
      document.getElementById('btnLeaveCasino').disabled = false;
    }
  }

  requestAnimationFrame(animateWheel);
});

document.getElementById('btnLeaveCasino')?.addEventListener('click', () => {
  if (isCasinoWheelAnimating) return;
  document.getElementById('casinoOverlay').classList.add('hidden');
  currentAppScreen = 'PLAYING';
  generateRoom(currentFloor + 1);
});

const mouseToggle = document.getElementById('mouseBtn');
mouseToggle.addEventListener('click', () => {
  controlMode = controlMode === 'keyboard' ? 'mouse' : 'keyboard';
  mouseToggle.textContent = controlMode === 'mouse' ? '🖱️' : '⌨️';
  mouseToggle.style.color = controlMode === 'mouse' ? '#00f2fe' : '#94a3b8';
});

const muteToggle = document.getElementById('muteBtn');
muteToggle.addEventListener('click', () => {
  if (window.audio) {
    window.audio.init();
    const isMuted = window.audio.toggleMute();
    muteToggle.textContent = isMuted ? '🔇' : '🔊';
    muteToggle.style.color = isMuted ? '#ff2a6d' : '#94a3b8';
  }
});

// ============================================================
// CYBER-BREAKER 2.0: TERMINAL CODE ENTRY & ROOT ADMIN SUITE
// ============================================================

function openCodeEntryModal() {
  const modal = document.getElementById('codeEntryModal');
  const input = document.getElementById('adminCodeInput');
  const fb = document.getElementById('codeEntryFeedback');
  if (!modal) return;
  if (input) input.value = '';
  if (fb) {
    fb.textContent = '';
    fb.className = 'code-feedback';
  }
  modal.classList.remove('hidden');
  setTimeout(() => { if (input) input.focus(); }, 60);
}

function closeCodeEntryModal() {
  const modal = document.getElementById('codeEntryModal');
  if (modal) modal.classList.add('hidden');
  if (window.adminPreScreen && !window.isAdminAuthenticated) {
    currentAppScreen = window.adminPreScreen;
    window.adminPreScreen = null;
  }
}

function submitAccessCode() {
  const input = document.getElementById('adminCodeInput');
  const fb = document.getElementById('codeEntryFeedback');
  if (!input) return;
  const rawVal = input.value.trim();
  const code = rawVal.toLowerCase();

  if (code === 'bossbattlebennie') {
    if (fb) {
      fb.textContent = 'ACCESS GRANTED: PROTOCOL BENNIE ENGAGED!';
      fb.className = 'code-feedback success';
    }
    if (window.audio && typeof window.audio.legendaryJingle === 'function') {
      window.audio.legendaryJingle();
    }
    setTimeout(() => {
      closeCodeEntryModal();
      openBenniePrepModal();
    }, 450);
  } else if (code === 'admin123') {
    window.isAdminAuthenticated = true;
    window.isAdminSessionAuthorized = true;
    const inHudBtn = document.getElementById('btnIngameAdmin');
    if (inHudBtn) inHudBtn.classList.remove('hidden');
    if (fb) {
      fb.textContent = 'ACCESS GRANTED: ROOT PROTOCOL ENGAGED';
      fb.className = 'code-feedback success';
    }
    if (window.audio && typeof window.audio.legendaryJingle === 'function') {
      window.audio.legendaryJingle();
    }
    setTimeout(() => {
      closeCodeEntryModal();
      openAdminPanelModal();
    }, 450);
  } else if (code === 'cyber2026' || code === 'neon') {
    if (fb) {
      fb.textContent = 'PROMO CODE REDEEMED: +100 DATA CHIPS!';
      fb.className = 'code-feedback success';
    }
    if (typeof addDataChips === 'function') addDataChips(100);
    else metaSave.chips = (metaSave.chips || 0) + 100;
    saveMetaProgress();
    updateDataChipsDisplay();
    if (window.audio && typeof window.audio.powerupGet === 'function') window.audio.powerupGet();
    setTimeout(closeCodeEntryModal, 1200);
  } else {
    if (fb) {
      fb.textContent = 'ACCESS DENIED: INVALID ADMIN CODE';
      fb.className = 'code-feedback error';
    }
    if (window.audio && typeof window.audio.aiStunned === 'function') {
      window.audio.aiStunned();
    }
    input.select();
  }
}

function openAdminPanelModal() {
  if (!window.isAdminAuthenticated) {
    if (currentAppScreen === 'PLAYING' || currentAppScreen === 'BENNIE_BOSS') {
      window.adminPreScreen = currentAppScreen;
      currentAppScreen = 'PAUSED';
    }
    openCodeEntryModal();
    const sub = document.querySelector('#codeEntryModal .sub-glow');
    if (sub) sub.textContent = 'ENTER ADMIN CODE TO UNLOCK SYSTEM CONSOLE';
    return;
  }
  const modal = document.getElementById('adminPanelModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  populateAdminDrops();
  refreshAdminTelemetry();
  setAdminTab('progression');
  setAdminStatus('ROOT SYSTEM ACTIVE — ALL DIRECTIVES UNLOCKED');
}

function closeAdminPanelModal() {
  const modal = document.getElementById('adminPanelModal');
  if (modal) modal.classList.add('hidden');
  if (window.adminPreScreen) {
    currentAppScreen = window.adminPreScreen;
    window.adminPreScreen = null;
  }
}

function setAdminTab(tabName) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-admin-tab') === tabName);
  });
  const tabMap = {
    progression: 'adminTabProgression',
    drops: 'adminTabDrops',
    modes: 'adminTabModes',
    inspector: 'adminTabInspector'
  };
  Object.keys(tabMap).forEach(t => {
    const el = document.getElementById(tabMap[t]);
    if (el) el.style.display = (t === tabName) ? 'block' : 'none';
  });
  if (tabName === 'inspector') {
    refreshAdminTelemetry();
  }
}

function populateAdminDrops() {
  const select = document.getElementById('adminDropSelect');
  const quickBox = document.getElementById('adminQuickDrops');
  if (!select) return;
  select.innerHTML = '';
  
  const registry = (typeof DROP_REGISTRY !== 'undefined') ? DROP_REGISTRY : {};
  const drops = Object.values(registry);

  drops.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = `[${d.rarity.toUpperCase()}] ${d.icon} ${d.name} (${d.category})`;
    select.appendChild(opt);
  });

  if (quickBox && quickBox.children.length === 0) {
    const quickIds = ['split_ball', 'emp_blast', 'hyper_shield', 'warp_slow', 'plasma_overcharge', 'jackpot_cube'];
    quickIds.forEach(id => {
      const def = registry[id];
      if (def) {
        const pill = document.createElement('button');
        pill.className = 'admin-quick-pill';
        pill.textContent = `${def.icon} ${def.name}`;
        pill.addEventListener('click', () => {
          select.value = def.id;
          spawnAdminDrop(def.id);
        });
        quickBox.appendChild(pill);
      }
    });
  }
}

function spawnAdminDrop(dropId) {
  const targetId = dropId || document.getElementById('adminDropSelect')?.value || 'split_ball';
  const spawnX = (player && player.x) ? player.x + 80 : 400;
  const spawnY = (player && player.y) ? player.y : 300;
  
  if (typeof powerupDrops !== 'undefined') {
    const reg = (typeof DROP_REGISTRY !== 'undefined') ? DROP_REGISTRY[targetId] : null;
    const rarity = reg ? reg.rarity : 'rare';
    const icon = reg ? reg.icon : '⚡';
    powerupDrops.push({
      x: Math.min(800, Math.max(100, spawnX)),
      y: Math.min(500, Math.max(100, spawnY)),
      vx: 0,
      vy: 1.2,
      type: targetId,
      rarity: rarity,
      icon: icon,
      duration: 900
    });
    setAdminStatus(`SPAWNED DROP: ${targetId.toUpperCase()} AT (${Math.round(spawnX)}, ${Math.round(spawnY)})`);
    if (window.audio && typeof window.audio.coinGet === 'function') window.audio.coinGet();
    if (typeof addFloatingText === 'function') {
      addFloatingText(`ADMIN SPAWN: ${targetId}!`, spawnX, spawnY, '#f59e0b');
    }
  }
}

function setAdminStatus(msg) {
  const st = document.getElementById('adminPanelStatus');
  if (st) st.textContent = `STATUS: ${msg}`;
}

function refreshAdminTelemetry() {
  const grid = document.getElementById('adminInspectorGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const livingEnemies = (window.roomManager && typeof window.roomManager.getLivingSwarmEnemyCount === 'function')
    ? window.roomManager.getLivingSwarmEnemyCount()
    : ((window.roomManager && window.roomManager.swarmEnemies) ? window.roomManager.swarmEnemies.filter(e => e && e.hp > 0 && !e.dead).length : 0);

  const stats = [
    { label: 'Screen / Mode', val: `${currentAppScreen} / ${activeGameMode}` },
    { label: 'Sector / Floor', val: `S${currentSector} • Floor ${currentFloor}` },
    { label: 'Run Score', val: `${runScore}` },
    { label: 'Player HP', val: `${player ? player.hp : 0} / ${player ? player.maxHp : 4}` },
    { label: 'Run Data Chips', val: `${runDataChips} 💾` },
    { label: 'Meta Chips / Gems', val: `${metaSave.chips || 0} 💾 / ${metaSave.gems || 0} 💎` },
    { label: 'Neural Cores', val: `${metaSave.cores || 0} 🧠` },
    { label: 'Active Balls', val: `${(typeof balls !== 'undefined') ? balls.length : 0}` },
    { label: 'Drops on Screen', val: `${(typeof powerupDrops !== 'undefined') ? powerupDrops.length : 0}` },
    { label: 'Living Swarm Enemies', val: `${livingEnemies}` },
    { label: 'Collected Artifacts', val: `${(typeof collectedArtifacts !== 'undefined') ? collectedArtifacts.size : 0}` },
    { label: 'Run Purchases', val: `${(typeof runPurchases !== 'undefined') ? runPurchases.length : 0}` },
    { label: 'Primary Path', val: `${primaryPath ? primaryPath.toUpperCase() : 'NONE'}` },
    { label: 'Secondary Branch', val: `${secondaryBranch ? secondaryBranch.toUpperCase() : 'NONE'}` }
  ];

  stats.forEach(s => {
    const card = document.createElement('div');
    card.className = 'admin-inspector-card';
    card.innerHTML = `
      <div class="admin-inspector-label">${s.label}</div>
      <div class="admin-inspector-val">${s.val}</div>
    `;
    grid.appendChild(card);
  });
}

// Wire Event Listeners for Code Entry & Admin Suite
document.getElementById('btnOpenCodeEntry')?.addEventListener('click', openCodeEntryModal);
document.getElementById('btnCloseCodeModal')?.addEventListener('click', closeCodeEntryModal);
document.getElementById('btnSubmitCode')?.addEventListener('click', submitAccessCode);
document.getElementById('adminCodeInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitAccessCode();
});
document.getElementById('btnCloseAdminModal')?.addEventListener('click', closeAdminPanelModal);

document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-admin-tab');
    if (tabName) setAdminTab(tabName);
  });
});

document.getElementById('adminAddChips')?.addEventListener('click', () => {
  if (typeof addDataChips === 'function') addDataChips(500);
  metaSave.chips = (metaSave.chips || 0) + 500;
  saveMetaProgress();
  updateDataChipsDisplay();
  setAdminStatus('+500 DATA CHIPS GRANTED');
  refreshAdminTelemetry();
});

document.getElementById('adminAddGems')?.addEventListener('click', () => {
  metaSave.gems = (metaSave.gems || 0) + 100;
  saveMetaProgress();
  updateCoreDisplays();
  setAdminStatus('+100 NANO GEMS GRANTED');
  refreshAdminTelemetry();
});

document.getElementById('adminAddCores')?.addEventListener('click', () => {
  metaSave.cores = (metaSave.cores || 0) + 20;
  saveMetaProgress();
  updateCoreDisplays();
  setAdminStatus('+20 NEURAL CORES GRANTED');
  refreshAdminTelemetry();
});

document.getElementById('adminUnlockAllPaddles')?.addEventListener('click', () => {
  if (typeof CHARACTERS !== 'undefined') {
    Object.keys(CHARACTERS).forEach(k => {
      if (!metaSave.unlockedCharacters.includes(k)) {
        metaSave.unlockedCharacters.push(k);
      }
    });
    saveMetaProgress();
    setAdminStatus('ALL 16 COMBAT PADDLES UNLOCKED');
    if (window.audio && typeof window.audio.legendaryJingle === 'function') window.audio.legendaryJingle();
  }
});

document.getElementById('adminSetFloorBtn')?.addEventListener('click', () => {
  const input = document.getElementById('adminFloorInput');
  const targetFloor = Math.max(1, Math.min(50, parseInt(input?.value || '1', 10)));
  currentFloor = targetFloor;
  currentSector = Math.min(5, Math.floor((currentFloor - 1) / 10) + 1);
  updateHud();
  setAdminStatus(`RUN FLOOR SET TO ${currentFloor} (SECTOR ${currentSector})`);
  refreshAdminTelemetry();
});

document.getElementById('adminInstantWinEncounter')?.addEventListener('click', () => {
  if (currentAppScreen === 'PLAYING') {
    closeAdminPanelModal();
    if (typeof handleRoomVictory === 'function') {
      handleRoomVictory(1000);
    }
  } else {
    setAdminStatus('CANNOT CLEAR: NOT IN ACTIVE PLAY SCREEN');
  }
});

document.getElementById('adminGrantRandomBuff')?.addEventListener('click', () => {
  activeBuffs.shieldCharges = Math.min(4, (activeBuffs.shieldCharges || 0) + 2);
  activeBuffs.twinBlasters = 1800;
  activeBuffs.fireball = 1800;
  activeBuffs.lightning = 1800;
  setAdminStatus('GRANTED COMBAT OVERCHARGE (SHIELDS, DUAL BLASTERS, INFERNO, VOLT)');
  refreshAdminTelemetry();
});

document.getElementById('adminClearAllBuffs')?.addEventListener('click', () => {
  activeBuffs.shieldCharges = 0;
  activeBuffs.twinBlasters = 0;
  activeBuffs.fireball = 0;
  activeBuffs.lightning = 0;
  activeBuffs.megaBall = 0;
  setAdminStatus('ALL ACTIVE COMBAT BUFFS CLEARED');
  refreshAdminTelemetry();
});

document.getElementById('adminSpawnDropBtn')?.addEventListener('click', () => {
  spawnAdminDrop();
});

document.getElementById('btnIngameAdmin')?.addEventListener('click', () => {
  if (!window.isAdminAuthenticated) {
    if (currentAppScreen === 'PLAYING' || currentAppScreen === 'BENNIE_BOSS') {
      window.adminPreScreen = currentAppScreen;
      currentAppScreen = 'PAUSED';
    }
    openCodeEntryModal();
    const sub = document.querySelector('#codeEntryModal .sub-glow');
    if (sub) sub.textContent = 'ENTER ADMIN CODE TO UNLOCK SYSTEM CONSOLE';
    return;
  }

  if (currentAppScreen === 'PLAYING' || currentAppScreen === 'BENNIE_BOSS') {
    window.adminPreScreen = currentAppScreen;
    currentAppScreen = 'PAUSED';
    openAdminPanelModal();
  } else if (currentAppScreen === 'PAUSED' && window.adminPreScreen) {
    closeAdminPanelModal();
  } else {
    openAdminPanelModal();
  }
});

document.getElementById('adminToggleGodMode')?.addEventListener('click', () => {
  window.isGodModeActive = !window.isGodModeActive;
  const btn = document.getElementById('adminToggleGodMode');
  if (btn) {
    btn.textContent = window.isGodModeActive ? '🛡️ TOGGLE GOD MODE (ACTIVE)' : '🛡️ TOGGLE GOD MODE (OFF)';
    btn.classList.toggle('admin-btn-highlight', window.isGodModeActive);
  }
  setAdminStatus(`GOD MODE ${window.isGodModeActive ? 'ACTIVATED (IMMUNE TO ALL DAMAGE)' : 'DEACTIVATED'}`);
  refreshAdminTelemetry();
});

document.getElementById('adminHealFullHp')?.addEventListener('click', () => {
  if (player) {
    player.hp = player.maxHp || 4;
    updateHud();
    setAdminStatus('PLAYER HEALED TO MAXIMUM INTEGRITY (100%)');
    refreshAdminTelemetry();
    if (window.audio && typeof window.audio.powerupGet === 'function') window.audio.powerupGet();
  }
});

document.querySelectorAll('[data-warp-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    const warpMode = btn.getAttribute('data-warp-mode');
    if (warpMode === 'BENNIE_BOSS') {
      closeAdminPanelModal();
      openBenniePrepModal();
    } else if (warpMode) {
      closeAdminPanelModal();
      startNewRun(warpMode);
    }
  });
});

document.getElementById('adminRefreshInspector')?.addEventListener('click', () => {
  refreshAdminTelemetry();
  setAdminStatus('TELEMETRY REFRESHED');
});

// ============================================================================
// BENNIE BOSS PREPARATION, ARENA & BATTLE ENGINE
// ============================================================================
let selectedBenniePath = 'inventor';
const selectedBennieUpgrades = new Set();
let bennieBoss = null;

function openBenniePrepModal() {
  const modal = document.getElementById('benniePrepModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  syncBennieBossHudVisibility();
  renderBenniePrepModal();
}
window.openBenniePrepModal = openBenniePrepModal;

function closeBenniePrepModal() {
  const modal = document.getElementById('benniePrepModal');
  if (modal) modal.classList.add('hidden');
}

function renderBenniePrepModal() {
  const pathsGrid = document.getElementById('benniePrepPathsGrid');
  const upgsGrid = document.getElementById('benniePrepUpgradesGrid');
  const countDisp = document.getElementById('benniePrepCountDisplay');
  const pathDisp = document.getElementById('benniePrepPathSelected');
  const sumPathName = document.getElementById('bennieSummaryPathName');
  const sumUpgCount = document.getElementById('bennieSummaryUpgradeCount');
  const summaryText = document.getElementById('benniePrepSummaryText');

  if (!pathsGrid || !upgsGrid) return;
  pathsGrid.innerHTML = '';
  upgsGrid.innerHTML = '';

  const paths = (typeof BUILD_PATHS !== 'undefined') ? Object.values(BUILD_PATHS) : [];
  paths.forEach(p => {
    const isSelected = selectedBenniePath === p.id;
    const card = document.createElement('div');
    card.className = `bennie-path-card ${isSelected ? 'selected' : ''}`;
    card.setAttribute('data-path-id', p.id);
    const tradeoffText = p.weaknesses || 'Requires precise paddle execution.';
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
        <div style="display: flex; align-items: center; gap: 7px;">
          <span class="bennie-path-emblem" style="font-size: 1.35rem;">${p.icon || '🛠️'}</span>
          <div>
            <div style="font-size: 0.85rem; font-weight: 900; color: #fff; line-height: 1.15;">${p.name}</div>
            <div class="bennie-path-tag" style="font-size: 0.65rem; color: #ffd700; font-weight: 700;">${p.tag || 'Combat Core'}</div>
          </div>
        </div>
        ${isSelected ? '<span class="bennie-selected-badge" style="font-size: 0.60rem; background: #ffd700; color: #000; font-weight: 900; padding: 2px 5px; border-radius: 4px;">SELECTED ✓</span>' : ''}
      </div>
      <div style="font-size: 0.68rem; color: #cbd5e1; line-height: 1.25; margin-top: 1px;">
        <strong class="bennie-signature-label" style="color: #38bdf8;">Signature: ${p.signature}:</strong> ${p.signatureDesc || p.playstyle || ''}
      </div>
      <div style="font-size: 0.65rem; color: #00e676; margin-top: 2px; line-height: 1.2;">
        🛠️ <em>Strengths:</em> ${p.strengths || 'Balanced performance across all encounters.'}
      </div>
      <div style="font-size: 0.64rem; color: #f59e0b; margin-top: 2px; line-height: 1.2; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2px;">
        ⚠️ <em>Tradeoff:</em> ${tradeoffText}
      </div>
    `;
    card.addEventListener('click', () => {
      selectedBenniePath = p.id;
      renderBenniePrepModal();
      if (window.audio && typeof window.audio.paddleHit === 'function') window.audio.paddleHit();
    });
    pathsGrid.appendChild(card);
  });

  const allUpgs = (typeof ARTIFACT_DEFINITIONS !== 'undefined') ? Object.values(ARTIFACT_DEFINITIONS) : [];
  allUpgs.forEach(u => {
    const isSel = selectedBennieUpgrades.has(u.id);
    const card = document.createElement('div');
    card.className = `bennie-upg-card bennie-upgrade-card ${isSel ? 'selected' : ''}`;
    card.setAttribute('data-upgrade-id', u.id);

    // Categorize
    let category = 'UTILITY';
    let catIcon = '⚙️';
    const tags = Array.isArray(u.tags) ? u.tags : [];
    if (tags.some(t => ['DEFENSE', 'SHIELD', 'HULL', 'ARMOR'].includes(t)) || (u.name && (u.name.includes('Armor') || u.name.includes('Aegis') || u.name.includes('Shield')))) {
      category = 'DEFENSE';
      catIcon = '🛡️';
    } else if (tags.some(t => ['DRONE', 'SWARM'].includes(t)) || (u.name && u.name.includes('Drone'))) {
      category = 'DRONES';
      catIcon = '🤖';
    } else if (tags.some(t => ['DAMAGE', 'CRITICAL', 'PRECISION', 'FIRE', 'LASER', 'EXPLOSIVE', 'PYRO', 'SOLAR', 'KINETIC', 'BURST'].includes(t)) || (u.name && (u.name.includes('Overdrive') || u.name.includes('Cannon') || u.name.includes('Blade')))) {
      category = 'ATTACK';
      catIcon = '⚔️';
    }

    // Synergy hint
    let synergyHint = '';
    if (u.partner && ARTIFACT_DEFINITIONS[u.partner]) {
      const pName = ARTIFACT_DEFINITIONS[u.partner].name;
      const hasP = selectedBennieUpgrades.has(u.partner);
      synergyHint = hasP ? `🌟 FUSION: ${pName} READY!` : `🔗 Synergizes with ${pName}`;
    } else if (tags.length > 0) {
      synergyHint = `⚙️ Synergizes with ${tags[0]}`;
    } else {
      synergyHint = `⚡ ${u.archetype ? u.archetype.toUpperCase() : 'GENERAL'} PROTOCOL`;
    }

    // Contribution badge
    const contribution = tags[0] || category;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 1.3rem;">${u.icon || '📦'}</span>
          <div>
            <div style="font-size: 0.8rem; font-weight: 800; color: #fff; line-height: 1.2;">${u.name}</div>
            <div style="font-size: 0.62rem; color: #38bdf8; font-weight: 700;">${catIcon} ${category} • ${(u.rarity || 'RARE').toUpperCase()}</div>
          </div>
        </div>
        <span style="font-size: 0.62rem; padding: 2px 6px; border-radius: 4px; background: ${isSel ? '#ffd700' : 'rgba(255,255,255,0.08)'}; color: ${isSel ? '#000' : '#94a3b8'}; font-weight: 800; white-space: nowrap;">
          ${isSel ? 'SELECTED ✓' : '+ ADD'}
        </span>
      </div>
      <div style="font-size: 0.68rem; color: #cbd5e1; line-height: 1.35; margin: 4px 0 6px 0;">
        ${u.desc || 'Experimental combat upgrade.'}
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; font-size: 0.62rem; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 4px;">
        <span style="color: ${isSel ? '#ffd700' : '#94a3b8'}; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;">${synergyHint}</span>
        <span style="color: #38bdf8; background: rgba(56,189,248,0.12); padding: 1px 6px; border-radius: 3px; font-weight: 800;">${contribution}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      if (selectedBennieUpgrades.has(u.id)) {
        selectedBennieUpgrades.delete(u.id);
      } else if (selectedBennieUpgrades.size < 10) {
        selectedBennieUpgrades.add(u.id);
      } else {
        if (window.audio && typeof window.audio.hurt === 'function') window.audio.hurt();
        return;
      }
      renderBenniePrepModal();
      if (window.audio && typeof window.audio.powerupGet === 'function') window.audio.powerupGet();
    });
    upgsGrid.appendChild(card);
  });

  // Dynamic Summary Panel Updates
  const summaryPath = document.getElementById('bennieSummaryPath');
  const summaryFocus = document.getElementById('bennieSummaryFocus');
  const summarySynergies = document.getElementById('bennieSummarySynergies');

  const curPath = BUILD_PATHS[selectedBenniePath] || { name: 'Inventor', tag: 'Workshop Core' };
  if (summaryPath) {
    summaryPath.innerHTML = `<span style="font-size: 0.68rem; color: #94a3b8; font-weight: 800;">SELECTED PATH:</span> <strong style="color: #ffd700;">${curPath.name.toUpperCase()}</strong> <span style="font-size: 0.62rem; color: #38bdf8; background: rgba(56,189,248,0.15); padding: 1px 5px; border-radius: 3px;">${curPath.tag}</span>`;
  }

  // Calculate Build Focus & Synergies
  const tagCounts = {};
  let defCount = 0;
  let atkCount = 0;
  let utilCount = 0;
  let droneCount = 0;

  selectedBennieUpgrades.forEach(id => {
    const upg = ARTIFACT_DEFINITIONS[id];
    if (upg && Array.isArray(upg.tags)) {
      upg.tags.forEach(t => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
        if (['DEFENSE', 'SHIELD', 'HULL', 'ARMOR'].includes(t)) defCount++;
        else if (['DAMAGE', 'CRITICAL', 'PRECISION', 'FIRE', 'LASER', 'EXPLOSIVE', 'ATTACK'].includes(t)) atkCount++;
        else if (['DRONE', 'SWARM'].includes(t)) droneCount++;
        else utilCount++;
      });
    }
  });

  if (summaryFocus) {
    let focusName = 'BALANCED PROTOCOL';
    let focusDesc = 'Well-rounded experimental setup balancing offensive force with tactical utility.';
    if (droneCount >= 3) {
      focusName = 'FLEET COMMAND OVERRIDE';
      focusDesc = 'Autonomous sentry swarm saturation; drones suppress the arena while managing the ball.';
    } else if (defCount >= 3) {
      focusName = 'TITAN FORTRESS PROTOCOL';
      focusDesc = 'Heavy defensive layering with reactive energy shields and high impact resistance.';
    } else if (atkCount >= 3) {
      focusName = 'APEX CRITICAL ASSAULT';
      focusDesc = 'Glass cannon burst offensive tuned for rapid structure dismantling and high DPS.';
    }
    summaryFocus.innerHTML = `<span style="font-size: 0.68rem; color: #94a3b8; font-weight: 800;">CORE FOCUS:</span> <span style="color: #00e676; font-weight: 800;">${focusName}</span> — <span style="color: #cbd5e1;">${focusDesc}</span>`;
  }

  if (summarySynergies) {
    const detected = [];
    if (selectedBennieUpgrades.has('impact_core') && selectedBennieUpgrades.has('titan_impact_perk')) {
      detected.push('🌟 TITAN CONCUSSION FUSION');
    }
    if (selectedBennieUpgrades.has('nano_sentry') && selectedBennieUpgrades.has('tesla_coil')) {
      detected.push('🌟 OVERCHARGED ARC FLEET FUSION');
    }
    if (selectedBennieUpgrades.has('vampiric_frenzy') && selectedBennieUpgrades.has('iron_bastion')) {
      detected.push('🌟 BLOOD BASTION FUSION');
    }
    if (selectedBennieUpgrades.has('perpetual_motion_engine') && selectedBennieUpgrades.has('impact_core')) {
      detected.push('🌟 SPRING-LOADED SLAM FUSION');
    }
    Object.entries(tagCounts).forEach(([tag, cnt]) => {
      if (cnt >= 2) detected.push(`⚡ ${tag} Overload (x${cnt})`);
    });

    if (detected.length === 0) {
      summarySynergies.innerHTML = `<span style="font-size: 0.68rem; color: #94a3b8; font-weight: 800;">DETECTED SYNERGIES:</span> <span class="bennie-synergy-tag">No Synergies Active</span>`;
    } else {
      let synHtml = `<span style="font-size: 0.68rem; color: #94a3b8; font-weight: 800;">DETECTED SYNERGIES:</span>`;
      detected.slice(0, 5).forEach(syn => {
        synHtml += `<span class="bennie-synergy-tag">${syn}</span>`;
      });
      summarySynergies.innerHTML = synHtml;
    }
  }

  const curPathName = BUILD_PATHS[selectedBenniePath]?.name || selectedBenniePath;
  if (countDisp) countDisp.innerHTML = `${selectedBennieUpgrades.size} / 10 Upgrades Selected • Path: <span style="color: #ffd700;">${curPathName.toUpperCase()}</span>`;
  if (pathDisp) pathDisp.textContent = curPathName;
  if (sumPathName) sumPathName.textContent = curPathName;
  if (sumUpgCount) sumUpgCount.textContent = `${selectedBennieUpgrades.size} / 10 Upgrades Selected`;
  if (summaryText) summaryText.textContent = `Primary Path: ${curPathName} | Upgrades: ${selectedBennieUpgrades.size}/10`;
}


function startBennieBossBattle(pathId, upgradeIds) {
  prePauseScreen = null;
  window.prePauseScreen = null;
  closeBenniePrepModal();
  closeAdminPanelModal();
  document.getElementById('homeOverlay')?.classList.add('hidden');
  document.getElementById('pauseOverlay')?.classList.add('hidden');
  document.getElementById('gameOverOverlay')?.classList.add('hidden');
  document.getElementById('victoryOverlay')?.classList.add('hidden');

  currentAppScreen = 'BENNIE_BOSS';
  activeGameMode = 'BENNIE_CHALLENGE';
  window.activeGameMode = 'BENNIE_CHALLENGE';
  roomType = 'BENNIE_ARENA';
  bossChallengeState = 'intro';
  currentFloor = 50;
  currentSector = 5;

  // Setup player temporary experimental state
  player.hp = 5;
  player.maxHp = 5;
  player.invulnerableTimer = 60;
  collectedArtifacts.clear();
  primaryPath = pathId || 'inventor';
  secondaryBranch = 'chrono';
  (upgradeIds || []).forEach(id => collectedArtifacts.add(id));

  // Strictly deactivate and remove standard AI opponent paddle from Bennie arena
  ai.active = false;
  ai.hp = 0;
  if (window.ai) {
    window.ai.active = false;
    window.ai.hp = 0;
  }

  // Reset ability cooldowns so player attacks are ready for battle
  abilityCooldownCurrent = 0;
  if (window.abilityCooldowns) {
    Object.keys(window.abilityCooldowns).forEach(k => { window.abilityCooldowns[k] = 0; });
  }

  // Reset arena elements
  bricks = [];
  lasers = [];
  enemyBullets = [];
  powerupDrops = [];
  coinDrops = [];
  particles = [];
  shockwaves = [];
  lightningArcs = [];
  balls = [];

  // Initialize Boss with mechanical inventor systems
  bennieBoss = {
    hp: 100,
    maxHp: 100,
    phase: 1, // 1: Prototype Overdrive (100%->60%), 2: Lasers & Arms (60%->25%), 3: Catastrophe Overclock (<=25%)
    x: CONFIG.width - 130,
    y: CONFIG.height / 2,
    baseY: CONFIG.height / 2,
    w: 84,
    h: 84,
    hoverAngle: 0,
    
    // Attack Director State
    directorTimer: 80,
    attackPattern: 'idle', // 'idle', 'laser_charge', 'laser_fire', 'gears', 'bumpers', 'arm_lasers', 'staggered'
    attackSubTimer: 0,
    lastAttack: 'none',

    // Laser Overhaul with Aim Lock
    laserChargeTimer: 0,
    laserChargeMax: 100, // ~1.67s charge at 60fps
    laserAimLockThreshold: 35, // locks aim 35 frames (~0.6s) before firing!
    lockedLaserY: CONFIG.height / 2,
    laserFiringTimer: 0,
    laserHitPlayer: false,

    // Stagger / Counter Window
    isStaggered: false,
    staggerTimer: 0,

    // Workshop Hazards
    bumpers: [], // kinetic bumper pads: { x, y, radius, life }
    gears: [],   // bouncing gear projectiles: { x, y, vx, vy, radius, life }
    drones: [],  // Phase 3 escort micro-drones: { angle, dist, speed, hp, maxHp }

    // Personality & Status
    quipText: "Unit test #104: Let us test your deflection velocity!",
    quipTimer: 240,
    defeatTimer: 0,
    isDefeated: false,
    hitFlashTimer: 0
  };

  // Serve countdown for start of combat
  startServeCountdown(1.0, 'SECRET CHALLENGE: BENNIE');

  // Show HUD
  document.getElementById('gameHud').style.opacity = '1';
  document.getElementById('abilityGaugeContainer').style.opacity = '1';
  syncBennieBossHudVisibility();
  updateBennieBossHud();
  updateHud();

  if (window.audio && typeof window.audio.sectorTitleChime === 'function') {
    window.audio.sectorTitleChime();
  }
}

function updateBennieBossHud() {
  if (!bennieBoss) return;
  const fill = document.getElementById('bennieBossHpFill') || document.getElementById('bennieHpFill');
  const val = document.getElementById('bennieBossHpVal') || document.getElementById('bennieHpVal');
  const phase = document.getElementById('bennieBossPhase') || document.getElementById('benniePhaseBadge');

  if (fill) fill.style.width = `${Math.max(0, (bennieBoss.hp / bennieBoss.maxHp) * 100)}%`;
  if (val) val.textContent = `${Math.ceil(bennieBoss.hp)} / ${bennieBoss.maxHp} HP`;
  if (phase) {
    if (bennieBoss.isStaggered) phase.textContent = '⚡ OVERHEATED! COUNTER WINDOW!';
    else if (bennieBoss.phase === 1) phase.textContent = 'PHASE 1: PROTOTYPE DIAGNOSTICS';
    else if (bennieBoss.phase === 2) phase.textContent = 'PHASE 2: UNSTABLE PROTOTYPES';
    else phase.textContent = 'PHASE 3: OVERCLOCKED ARCHITECT';
  }
}

function damageBennie(amount, source, metadata) {
  if (!bennieBoss || bennieBoss.isDefeated) return;
  if (bossChallengeState === 'intro') {
    bossChallengeState = 'combat';
  }
  if (bossChallengeState !== 'combat') return;
  const b = bennieBoss;

  // Stagger bonus: landing hits during stagger window deals +50% extra damage!
  let finalDmg = amount;
  if (b.isStaggered) {
    finalDmg *= 1.5;
  }

  b.hp = Math.max(0, b.hp - finalDmg);
  b.hitFlashTimer = 10;
  screenShake = Math.max(screenShake, b.isStaggered ? 8 : 4);

  spawnParticles(b.x - 20, b.y, b.isStaggered ? '#00f2fe' : '#ffd700', 14);
  addFloatingText(`-${Math.round(finalDmg)} HP`, b.x - 30, b.y - 40, b.isStaggered ? '#00f2fe' : '#ffd700');

  if (window.audio && typeof window.audio.paddleHit === 'function') {
    window.audio.paddleHit();
  }

  updateBennieBossHud();

  // Phase Transitions
  if (b.hp <= 60 && b.phase === 1) {
    b.phase = 2;
    b.quipText = "Phase 2: Calibrating dual arm lasers and prototype spheres!";
    b.quipTimer = 220;
    screenShake = 12;
    spawnParticles(b.x, b.y, '#ffd700', 30);
  } else if (b.hp <= 25 && b.phase === 2) {
    b.phase = 3;
    b.quipText = "Phase 3: Workshop Catastrophe! Overclocking all subsystems!";
    b.quipTimer = 240;
    screenShake = 18;
    spawnParticles(b.x, b.y, '#ff2a6d', 40);
    // Deploy 2 destructible escort micro-drones
    b.drones = [
      { angle: 0, dist: 65, speed: 2.2, hp: 6, maxHp: 6 },
      { angle: Math.PI, dist: 65, speed: 2.2, hp: 6, maxHp: 6 }
    ];
  }

  // Defeat condition: strictly when HP reaches 0
  if (b.hp <= 0) {
    b.isDefeated = true;
    bossChallengeState = 'victory';
    b.defeatTimer = 180;
    b.quipText = "Magnificent! The prototype bounce protocol is validated!";
    b.quipTimer = 180;
    screenShake = 25;
    // Clean all hazards immediately
    b.bumpers = [];
    b.gears = [];
    b.drones = [];
    enemyBullets = [];
    if (window.audio && typeof window.audio.legendaryJingle === 'function') {
      window.audio.legendaryJingle();
    }
  }
}

function openBennieSecretUnlockSequence() {
  // Ensure unlocks are stored in metaSave
  if (!Array.isArray(metaSave.unlockedCharacters)) {
    metaSave.unlockedCharacters = Array.isArray(metaSave.unlockedChars) ? metaSave.unlockedChars : ['vanguard'];
  }
  if (!Array.isArray(metaSave.unlockedChars)) {
    metaSave.unlockedChars = metaSave.unlockedCharacters;
  }
  if (!metaSave.unlockedCharacters.includes('bennie_bouncer')) {
    metaSave.unlockedCharacters.push('bennie_bouncer');
  }
  if (!metaSave.unlockedChars.includes('bennie_bouncer')) {
    metaSave.unlockedChars.push('bennie_bouncer');
  }
  if (!metaSave.unlockedPaths) metaSave.unlockedPaths = [];
  if (!metaSave.unlockedPaths.includes('inventor')) {
    metaSave.unlockedPaths.push('inventor');
  }
  metaSave.cores = (metaSave.cores || 0) + 100;
  saveMetaProgress();

  bossChallengeState = 'none';
  bennieBoss = null;
  prePauseScreen = null;
  window.prePauseScreen = null;
  syncBennieBossHudVisibility();

  // Hide in-game HUD elements
  const hud = document.getElementById('gameHud');
  if (hud) hud.style.opacity = '0';
  const abilityContainer = document.getElementById('abilityGaugeContainer');
  if (abilityContainer) abilityContainer.style.opacity = '0';

  const modal = document.getElementById('bennieSecretUnlockModal');
  if (modal) {
    modal.classList.remove('hidden');
    currentAppScreen = 'BENNIE_UNLOCK';
    if (window.audio && typeof window.audio.legendaryJingle === 'function') {
      window.audio.legendaryJingle();
    }
  } else {
    returnToHome();
  }
}
window.openBennieSecretUnlockSequence = openBennieSecretUnlockSequence;

document.getElementById('btnClaimBennieUnlocks')?.addEventListener('click', () => {
  const modal = document.getElementById('bennieSecretUnlockModal');
  if (modal) modal.classList.add('hidden');
  returnToHome();
  const hud = document.getElementById('gameHud');
  if (hud) hud.style.opacity = '1';
  const abilityContainer = document.getElementById('abilityGaugeContainer');
  if (abilityContainer) abilityContainer.style.opacity = '1';
  if (typeof addFloatingText === 'function') {
    addFloatingText("BLUEPRINTS SAVED: BENNIE'S BOUNCER & INVENTOR READY!", CONFIG.width / 2, CONFIG.height / 2, '#ffd700');
  }
});

function updateBennieBoss(dt) {
  if (!bennieBoss) return;
  const b = bennieBoss;

  // Timers
  if (b.quipTimer > 0) b.quipTimer--;
  if (b.hitFlashTimer > 0) b.hitFlashTimer--;

  // Defeat Sequence & Permanent Unlocks
  if (b.isDefeated) {
    b.defeatTimer--;
    screenShake = Math.max(screenShake, 8);
    if (Math.random() < 0.4) {
      spawnParticles(b.x + (Math.random() - 0.5) * 80, b.y + (Math.random() - 0.5) * 80, Math.random() < 0.5 ? '#ffd700' : '#00f2fe', 8);
    }
    if (b.defeatTimer <= 0) {
      openBennieSecretUnlockSequence();
      return;
    }
    return;
  }

  // Hover oscillation (reduced while staggered)
  const hoverSpeed = b.isStaggered ? 1.0 : (b.phase === 3 ? 3.0 : 2.2);
  const hoverAmp = b.isStaggered ? 25 : (b.phase === 3 ? 90 : 75);
  b.hoverAngle += dt * hoverSpeed;
  b.y = b.baseY + Math.sin(b.hoverAngle) * hoverAmp;

  // Staggered State: vulnerable counter window after laser miss
  if (b.isStaggered) {
    b.staggerTimer--;
    if (Math.random() < 0.3) {
      spawnParticles(b.x - 20, b.y - 10, '#00f2fe', 2);
    }
    if (b.staggerTimer <= 0) {
      b.isStaggered = false;
      b.quipText = "Thermal coolant restored! Back to testing!";
      b.quipTimer = 160;
      updateBennieBossHud();
    }
    // Staggered pauses attack director
    return;
  }

  // Active Laser Beam Damage
  if (b.laserFiringTimer > 0) {
    b.laserFiringTimer--;
    // Check if player paddle intersects the laser beam
    if (player && Math.abs((player.y + player.h / 2) - b.lockedLaserY) < (player.h / 2 + 10)) {
      if (window.damagePlayer) {
        window.damagePlayer(1, 'bennie_laser', b);
        b.laserHitPlayer = true;
      }
    }
    // When laser beam finishes firing
    if (b.laserFiringTimer <= 0) {
      if (!b.laserHitPlayer) {
        // PLAYER DODGED! Trigger Stagger / Counter Window
        b.isStaggered = true;
        b.staggerTimer = 90; // 1.5s recovery window
        b.quipText = "That was NOT supposed to miss! Overheating!";
        b.quipTimer = 90;
        screenShake = 6;
        addFloatingText("OVERHEATED! COUNTER WINDOW!", b.x - 60, b.y - 45, "#00f2fe");
        updateBennieBossHud();
      }
      b.attackPattern = 'idle';
      b.directorTimer = b.phase === 3 ? 60 : 90;
    }
    return;
  }

  // Laser Charging with Aim-Lock
  if (b.laserChargeTimer > 0) {
    b.laserChargeTimer--;
    // During early charge (> threshold), track player smoothly
    if (b.laserChargeTimer > b.laserAimLockThreshold) {
      const targetY = (player && player.y) ? player.y + player.h / 2 : CONFIG.height / 2;
      b.lockedLaserY += (targetY - b.lockedLaserY) * 0.12;
      // Spawn converging charging energy particles toward eye module
      if (Math.random() < 0.6) {
        spawnParticles(b.x - 24 + (Math.random() - 0.5) * 40, b.y - 6 + (Math.random() - 0.5) * 40, '#ffd700', 1);
      }
    } else if (b.laserChargeTimer === b.laserAimLockThreshold) {
      // AIM LOCK: Angle is strictly frozen! No further player tracking!
      if (window.audio && typeof window.audio.arcZap === 'function') window.audio.arcZap();
      screenShake = 3;
    }

    if (b.laserChargeTimer <= 0) {
      // FIRE LASER
      b.laserFiringTimer = 30; // 0.5s beam duration
      b.laserHitPlayer = false;
      screenShake = 8;
      if (window.audio && typeof window.audio.turretShoot === 'function') window.audio.turretShoot();
    }
    return;
  }

  // Arm laser ripple sub-timer
  if (b.armLaserRipple > 0) {
    b.armLaserRipple--;
    if (b.armLaserRipple === 0) {
      for (let k = 0; k < 3; k++) {
        enemyBullets.push({
          x: b.x - 25,
          y: b.y + (k - 1) * 28,
          vx: -3.8,
          vy: (k - 1) * -1.3,
          radius: 5,
          color: '#00f2fe'
        });
      }
      if (window.audio && typeof window.audio.turretShoot === 'function') window.audio.turretShoot();
    }
  }

  // ATTACK DIRECTOR: Weighted pattern selector
  b.directorTimer--;
  if (b.directorTimer <= 0 && b.attackPattern === 'idle') {
    const roll = Math.random();
    if (b.phase === 1) {
      // Phase 1: Prototype Bumpers & Bouncing Gears
      if (roll < 0.38 && b.lastAttack !== 'bumpers') {
        // Deploy Spring-Loaded Bumper
        b.lastAttack = 'bumpers';
        b.bumpers.push({
          x: CONFIG.width - 240 - Math.random() * 120,
          y: 120 + Math.random() * (CONFIG.height - 240),
          radius: 20,
          life: 600,
          pulse: 0
        });
        b.quipText = "Kinetic bumper prototype deployed!";
        b.quipTimer = 160;
        addFloatingText("BUMPER DEPLOYED!", b.x - 60, b.y, "#ffd700");
        b.directorTimer = 115;
      } else if (roll < 0.72) {
        // Launch Bouncing Prototype Gears
        b.lastAttack = 'gears';
        const gearCount = 2;
        for (let g = 0; g < gearCount; g++) {
          b.gears.push({
            x: b.x - 20,
            y: b.y + (g === 0 ? -25 : 25),
            vx: -3.6,
            vy: (g === 0 ? -2.2 : 2.2),
            radius: 13,
            angle: 0,
            life: 360
          });
        }
        b.directorTimer = 125;
      } else {
        // Tri-Gear Arc Salvo
        b.lastAttack = 'gears_arc';
        [-2.3, 0, 2.3].forEach(vyOffset => {
          b.gears.push({
            x: b.x - 25,
            y: b.y + vyOffset * 8,
            vx: -3.4,
            vy: vyOffset,
            radius: 13,
            angle: 0,
            life: 360
          });
        });
        b.quipText = "Calibrating tri-gear trajectory matrix!";
        b.quipTimer = 140;
        b.directorTimer = 130;
      }
    } else if (b.phase === 2) {
      // Phase 2: Laser + Arm Lasers + Spheres
      if (roll < 0.45 && b.lastAttack !== 'laser') {
        b.lastAttack = 'laser';
        b.attackPattern = 'laser_charge';
        b.laserChargeTimer = b.laserChargeMax;
        b.quipText = "Focusing high-energy optical beam... Lock engaged!";
        b.quipTimer = 120;
      } else if (roll < 0.75) {
        // Dual Arm Laser Sweep - Stage 1
        b.lastAttack = 'arm_lasers';
        for (let k = 0; k < 4; k++) {
          enemyBullets.push({
            x: b.x - 25,
            y: b.y + (k - 1.5) * 22,
            vx: -4.2,
            vy: (k - 1.5) * 1.2,
            radius: 5,
            color: '#ffd700'
          });
        }
        b.armLaserRipple = 16; // Stage 2 weave follows 16 frames later
        b.directorTimer = 135;
      } else {
        // Deploy Prototype Sphere
        b.lastAttack = 'prototype_sphere';
        if (balls.length < 3) {
          const protoBall = createBall(b.x - 40, b.y, -3.8, (Math.random() - 0.5) * 3);
          protoBall.isPrototype = true;
          protoBall.color = '#ffd700';
          balls.push(protoBall);
          addFloatingText('PROTOTYPE BALL DEPLOYED!', b.x - 60, b.y - 20, '#ffd700');
        }
        b.directorTimer = 150;
      }
    } else {
      // Phase 3: Workshop Catastrophe Overclock
      if (roll < 0.4 && b.lastAttack !== 'laser') {
        b.lastAttack = 'laser';
        b.attackPattern = 'laser_charge';
        b.laserChargeTimer = 75; // faster charge in phase 3
        b.laserAimLockThreshold = 25;
      } else if (roll < 0.7) {
        b.lastAttack = 'overclock_burst';
        for (let s = 0; s < 5; s++) {
          enemyBullets.push({
            x: b.x - 20,
            y: b.y + (s - 2) * 18,
            vx: -4.4,
            vy: (s - 2) * 1.4,
            radius: 5,
            color: '#ff2a6d'
          });
        }
        b.directorTimer = 85;
      } else {
        // Bumper + Gear combo
        b.bumpers.push({
          x: CONFIG.width - 250 - Math.random() * 100,
          y: 100 + Math.random() * (CONFIG.height - 200),
          radius: 20,
          life: 500,
          pulse: 0
        });
        b.directorTimer = 95;
      }
    }
  }

  // Update Bumpers
  for (let i = b.bumpers.length - 1; i >= 0; i--) {
    const bmp = b.bumpers[i];
    bmp.life--;
    bmp.pulse += 0.05;
    if (bmp.life <= 0) {
      b.bumpers.splice(i, 1);
      continue;
    }
    // Ball collision with bumpers
    balls.forEach(ball => {
      const dist = Math.hypot(ball.x - bmp.x, ball.y - bmp.y);
      if (dist < ball.radius + bmp.radius) {
        const nx = (ball.x - bmp.x) / dist;
        const ny = (ball.y - bmp.y) / dist;
        ball.vx = nx * Math.max(7, Math.abs(ball.vx) * 1.3);
        ball.vy = ny * Math.max(4, Math.abs(ball.vy) * 1.3);
        spawnParticles(bmp.x, bmp.y, '#ffd700', 8);
        if (window.audio && typeof window.audio.wallBounce === 'function') window.audio.wallBounce();
        if (b.phase >= 2 && Math.random() < 0.5) {
          enemyBullets.push({
            x: bmp.x,
            y: bmp.y,
            vx: -3.4,
            vy: (Math.random() - 0.5) * 2.2,
            radius: 4,
            color: '#ffd700'
          });
        }
      }
    });
  }

  // Update Bouncing Prototype Gears
  for (let i = b.gears.length - 1; i >= 0; i--) {
    const g = b.gears[i];
    g.life--;
    g.angle += 0.1;
    g.x += g.vx;
    g.y += g.vy;

    // Wall bounces
    if (g.y - g.radius <= 0 || g.y + g.radius >= CONFIG.height) {
      g.vy = -g.vy;
    }

    // Check collision with player paddle
    if (player && g.x - g.radius <= player.x + player.w && g.x + g.radius >= player.x &&
        g.y + g.radius >= player.y && g.y - g.radius <= player.y + player.h) {
      if (window.damagePlayer) window.damagePlayer(1, 'bennie_gear', b);
      spawnParticles(g.x, g.y, '#ffd700', 10);
      b.gears.splice(i, 1);
      continue;
    }

    // Ball smash destroys gears
    balls.forEach(ball => {
      if (Math.hypot(ball.x - g.x, ball.y - g.y) < ball.radius + g.radius) {
        spawnParticles(g.x, g.y, '#ffd700', 10);
        g.life = 0;
      }
    });

    if (g.life <= 0 || g.x < -30) {
      b.gears.splice(i, 1);
    }
  }

  // Update Escort Micro-Drones (Phase 3)
  if (b.phase === 3 && b.drones) {
    b.drones.forEach((d, idx) => {
      d.angle += dt * d.speed;
      d.x = b.x + Math.cos(d.angle) * d.dist;
      d.y = b.y + Math.sin(d.angle) * d.dist;

      // Intermittent escort pulse shot (every ~110 frames)
      d.fireTimer = (typeof d.fireTimer === 'number') ? d.fireTimer - 1 : (80 + idx * 45);
      if (d.fireTimer <= 0) {
        d.fireTimer = 110 + Math.random() * 35;
        enemyBullets.push({
          x: d.x - 8,
          y: d.y,
          vx: -3.8,
          vy: (Math.random() - 0.5) * 1.4,
          radius: 4.5,
          color: '#00f2fe'
        });
        spawnParticles(d.x, d.y, '#00f2fe', 4);
        if (window.audio && typeof window.audio.turretShoot === 'function') window.audio.turretShoot();
      }

      // Ball collision with drones
      balls.forEach(ball => {
        if (Math.hypot(ball.x - d.x, ball.y - d.y) < ball.radius + 12) {
          ball.vx = -Math.abs(ball.vx);
          d.hp -= 2;
          spawnParticles(d.x, d.y, '#00f2fe', 8);
          if (d.hp <= 0) {
            spawnParticles(d.x, d.y, '#ff2a6d', 16);
            addFloatingText('ESCORT DRONE DESTROYED!', d.x, d.y, '#00f2fe');
            b.drones.splice(idx, 1);
          }
        }
      });
    });
  }

  // Ball Collision with Bennie's Hitbox
  for (let bi = 0; bi < balls.length; bi++) {
    const ball = balls[bi];
    if (ball.x + ball.radius >= b.x - b.w / 2 &&
        ball.x - ball.radius <= b.x + b.w / 2 &&
        ball.y + ball.radius >= b.y - b.h / 2 &&
        ball.y - ball.radius <= b.y + b.h / 2) {

      // Contact debouncing to prevent multi-frame double damage
      const nowTick = (typeof frameCount === 'number') ? frameCount : Date.now();
      const hasRecentHit = ball.lastBossHitTick && (nowTick - ball.lastBossHitTick < 12);

      // Reposition ball outside hitbox and deflect cleanly
      ball.x = b.x - b.w / 2 - ball.radius - 2;
      ball.vx = -Math.max(6, Math.abs(ball.vx));
      ball.vy += (ball.y - b.y) * 0.1;

      if (!hasRecentHit && !b.isDefeated) {
        ball.lastBossHitTick = nowTick;
        if (bossChallengeState === 'intro') {
          bossChallengeState = 'combat';
        }

        // Authoritative damage calculation
        let dmg = 1;
        if (ball.isSmash) dmg += 2;
        if (player && player.isOverdrive) dmg *= 1.5;
        if (primaryPath === 'critical') dmg *= 1.3;
        if (isMarketModActive('mod_glass_cannon')) dmg *= 1.4;

        damageBennie(dmg, 'ball_hit', { ball });
      }
      break;
    }
  }
}

function drawBennieBoss(ctx) {
  if (!bennieBoss) return;
  const b = bennieBoss;

  ctx.save();

  // 1. Draw Workshop Blueprint Schematics & Construction Rails on Arena Floor
  ctx.save();
  ctx.strokeStyle = (b.phase === 3) ? 'rgba(255, 42, 109, 0.12)' : 'rgba(0, 242, 254, 0.06)';
  ctx.lineWidth = 1;
  // Schematic grid
  for (let x = 400; x < CONFIG.width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CONFIG.height);
    ctx.stroke();
  }
  for (let y = 0; y < CONFIG.height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(400, y);
    ctx.lineTo(CONFIG.width, y);
    ctx.stroke();
  }
  // Blueprint calibration circles
  ctx.strokeStyle = (b.phase === 3) ? 'rgba(255, 42, 109, 0.18)' : 'rgba(255, 215, 0, 0.08)';
  ctx.beginPath();
  ctx.arc(b.x, b.baseY, 140, 0, Math.PI * 2);
  ctx.stroke();

  // Top and Bottom Construction Rails with moving teeth
  const railOffset = (Date.now() * 0.03) % 20;
  ctx.strokeStyle = (b.phase === 3) ? 'rgba(255, 42, 109, 0.35)' : 'rgba(0, 242, 254, 0.25)';
  ctx.lineWidth = 2;
  // Top rail
  ctx.beginPath();
  ctx.moveTo(350, 18);
  ctx.lineTo(CONFIG.width, 18);
  ctx.stroke();
  // Bottom rail
  ctx.beginPath();
  ctx.moveTo(350, CONFIG.height - 18);
  ctx.lineTo(CONFIG.width, CONFIG.height - 18);
  ctx.stroke();

  // Moving rail teeth
  ctx.fillStyle = (b.phase === 3) ? 'rgba(255, 42, 109, 0.3)' : 'rgba(0, 242, 254, 0.2)';
  for (let rx = 350 + railOffset; rx < CONFIG.width; rx += 20) {
    ctx.fillRect(rx, 12, 6, 6);
    ctx.fillRect(rx, CONFIG.height - 18, 6, 6);
  }

  // Phase 3 Catastrophic Overclock Emergency Hazard Strobe
  if (b.phase === 3) {
    const strobeAlpha = (Math.sin(Date.now() * 0.008) + 1) * 0.5 * 0.12;
    ctx.fillStyle = `rgba(255, 42, 109, ${strobeAlpha})`;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    // Hazard caution stripes along top and bottom edge
    ctx.strokeStyle = 'rgba(255, 42, 109, 0.25)';
    ctx.lineWidth = 3;
    for (let hx = 0; hx < CONFIG.width; hx += 30) {
      ctx.beginPath();
      ctx.moveTo(hx, 0);
      ctx.lineTo(hx + 15, 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hx, CONFIG.height - 10);
      ctx.lineTo(hx + 15, CONFIG.height);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 2. Draw Spring-Loaded Bumpers
  b.bumpers.forEach(bmp => {
    ctx.save();
    ctx.translate(bmp.x, bmp.y);
    // Outer kinetic glow
    ctx.fillStyle = 'rgba(255, 215, 0, 0.18)';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, bmp.radius + Math.sin(bmp.pulse) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Inner spring spirals
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, bmp.radius * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });

  // 3. Draw Bouncing Prototype Gears
  b.gears.forEach(g => {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(g.angle);
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, g.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // 6 gear cogs
    for (let c = 0; c < 6; c++) {
      const ca = (c / 6) * Math.PI * 2;
      ctx.fillRect(Math.cos(ca) * g.radius - 2, Math.sin(ca) * g.radius - 2, 5, 5);
    }
    ctx.restore();
  });

  // 4. Draw Telegraphed Laser & Active Beam
  if (b.laserFiringTimer > 0) {
    // Active firing laser beam originating visibly from Bennie's eye module
    const startX = b.x - 24;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 16;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 24;
    ctx.beginPath();
    ctx.moveTo(startX, b.lockedLaserY);
    ctx.lineTo(0, b.lockedLaserY);
    ctx.stroke();

    // Inner bright core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(startX, b.lockedLaserY);
    ctx.lineTo(0, b.lockedLaserY);
    ctx.stroke();
    ctx.shadowBlur = 0;
  } else if (b.laserChargeTimer > 0) {
    // Warning telegraph sight line
    const isLocked = b.laserChargeTimer <= b.laserAimLockThreshold;
    const flash = Math.sin(Date.now() * 0.04) > 0;
    ctx.strokeStyle = isLocked ? (flash ? '#ff2a6d' : '#f59e0b') : 'rgba(255, 215, 0, 0.45)';
    ctx.lineWidth = isLocked ? 2.5 : 1.5;
    if (!isLocked) ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(b.x - 24, b.lockedLaserY);
    ctx.lineTo(0, b.lockedLaserY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Optical lock crosshair
    if (isLocked) {
      ctx.fillStyle = '#ff2a6d';
      ctx.beginPath();
      ctx.arc(player ? player.x + player.w / 2 : 40, b.lockedLaserY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 5. Draw Rotating Blueprint Gear Aura behind Bennie
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.hoverAngle * 0.5);
  ctx.strokeStyle = b.isStaggered ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 215, 0, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.stroke();
  for (let g = 0; g < 8; g++) {
    const ga = (g / 8) * Math.PI * 2;
    ctx.strokeRect(Math.cos(ga) * 50 - 4, Math.sin(ga) * 50 - 4, 8, 8);
  }
  ctx.restore();

  // 6. Draw Escort Micro-Drones (Phase 3)
  if (b.phase === 3 && b.drones) {
    b.drones.forEach(d => {
      ctx.save();
      ctx.fillStyle = '#00f2fe';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(d.x, d.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });
  }

  // 7. Draw Bennie's Iconic Flying Cyber Skull
  ctx.save();
  ctx.translate(b.x, b.y);
  if (b.isStaggered) {
    ctx.rotate(0.2); // Slump down while overheated
  }

  // Hit flash / Skull Base Chassis
  const headGrad = ctx.createLinearGradient(-36, -36, 36, 36);
  if (b.hitFlashTimer > 0) {
    headGrad.addColorStop(0, '#ffffff');
    headGrad.addColorStop(1, '#e2e8f0');
  } else {
    headGrad.addColorStop(0, '#1e293b');
    headGrad.addColorStop(0.5, '#334155');
    headGrad.addColorStop(1, '#0f172a');
  }
  ctx.fillStyle = headGrad;
  ctx.strokeStyle = b.isStaggered ? '#00f2fe' : (b.isDefeated ? '#ff2a6d' : '#ffd700');
  ctx.lineWidth = 2.5;
  ctx.shadowColor = b.isStaggered ? '#00f2fe' : '#ffd700';
  ctx.shadowBlur = 15;

  // Cranium shape
  ctx.beginPath();
  ctx.arc(0, -10, 34, Math.PI * 0.85, Math.PI * 0.15, false);
  ctx.lineTo(24, 18);
  ctx.lineTo(16, 32);
  ctx.lineTo(-16, 32);
  ctx.lineTo(-24, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Wild Eccentric Hair Tufts
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-32, -18); ctx.lineTo(-44, -28);
  ctx.moveTo(-34, -10); ctx.lineTo(-48, -14);
  ctx.moveTo(-32, -2);  ctx.lineTo(-45, 4);
  ctx.moveTo(32, -18); ctx.lineTo(44, -28);
  ctx.moveTo(34, -10); ctx.lineTo(48, -14);
  ctx.moveTo(32, -2);  ctx.lineTo(45, 4);
  ctx.stroke();

  // Cyber circuits etched on forehead
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.5)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-18, -26); ctx.lineTo(0, -32); ctx.lineTo(18, -26);
  ctx.moveTo(0, -32); ctx.lineTo(0, -20);
  ctx.stroke();

  // Glowing Optic Eye Sockets (Left eye charging laser)
  ctx.fillStyle = b.laserChargeTimer > 0 ? '#ff5500' : '#00f2fe';
  ctx.shadowColor = b.laserChargeTimer > 0 ? '#ff5500' : '#00f2fe';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(-14, -6, 6, 0, Math.PI * 2);
  ctx.arc(14, -6, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Amber Reading Glasses
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.4;
  ctx.fillStyle = 'rgba(0, 242, 254, 0.25)';
  ctx.fillRect(-22, -12, 17, 12);
  ctx.strokeRect(-22, -12, 17, 12);
  ctx.fillRect(5, -12, 17, 12);
  ctx.strokeRect(5, -12, 17, 12);
  ctx.beginPath();
  ctx.moveTo(-5, -6);
  ctx.lineTo(5, -6);
  ctx.stroke();

  // Teeth grill
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  for (let t = -10; t <= 10; t += 5) {
    ctx.beginPath();
    ctx.moveTo(t, 20); ctx.lineTo(t, 30);
    ctx.stroke();
  }

  // Stagger steam vents
  if (b.isStaggered) {
    ctx.fillStyle = 'rgba(0, 242, 254, 0.7)';
    ctx.beginPath();
    ctx.arc(-15, -28, 4, 0, Math.PI * 2);
    ctx.arc(15, -28, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // restore skull translation

  // Speech bubble
  if (b.quipTimer > 0 && b.quipText) {
    ctx.save();
    ctx.font = '800 12px sans-serif';
    const textW = ctx.measureText(b.quipText).width;
    const bubbleW = textW + 24;
    const bubbleH = 30;
    const bx = b.x - bubbleW / 2;
    const by = b.y - 75;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = b.isStaggered ? '#00f2fe' : '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(bx, by, bubbleW, bubbleH, 6);
    } else {
      ctx.rect(bx, by, bubbleW, bubbleH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = b.isStaggered ? '#00f2fe' : '#ffffff';
    ctx.fillText(b.quipText, bx + 12, by + 19);
    ctx.restore();
  }

  ctx.restore();
}

window.startBennieBossBattle = startBennieBossBattle;
window.updateBennieBoss = updateBennieBoss;
window.drawBennieBoss = drawBennieBoss;
window.updateBennieBossHud = updateBennieBossHud;

// Bennie Prep Modal Event Listeners
document.getElementById('btnCloseBenniePrepModal')?.addEventListener('click', closeBenniePrepModal);
document.getElementById('btnCancelBenniePrep')?.addEventListener('click', closeBenniePrepModal);
document.getElementById('btnStartBennieBattle')?.addEventListener('click', () => {
  startBennieBossBattle(selectedBenniePath, Array.from(selectedBennieUpgrades));
});

window.openAdminPanelModal = openAdminPanelModal;
window.closeAdminPanelModal = closeAdminPanelModal;
window.submitAccessCode = submitAccessCode;

function mainLoop(timestamp) {
  try {
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
    lastTimestamp = timestamp;

    if (currentAppScreen === 'PLAYING') {
      updateGame(dt);
    } else if (currentAppScreen === 'BENNIE_BOSS') {
      updateGame(dt);
      if (typeof updateBennieBoss === 'function') {
        updateBennieBoss(dt);
      }
    }
    draw();
  } catch (loopErr) {
    console.error("Safely caught mainLoop error:", loopErr);
  } finally {
    animationFrameId = requestAnimationFrame(mainLoop);
  }
}

window.onload = function() {
  loadMetaSave();
  runBootSequence();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  lastTimestamp = performance.now();
  animationFrameId = requestAnimationFrame(mainLoop);
};
