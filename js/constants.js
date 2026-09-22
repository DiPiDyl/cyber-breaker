// ============================================================================
// CYBER-BREAKER: Roguelike Pong & Breakout
// Constants, 12 Build Paths, 8 Paddle Modifiers, Upgrades & Codex Database
// 100% English Language Contract
// ============================================================================

const STORAGE_META_KEY = 'CYBER_BREAKER_META_V14';
const STORAGE_MIDRUN_KEY = 'CYBER_BREAKER_MIDRUN_V14';
const STORAGE_CODEX_KEY = 'CYBER_BREAKER_CODEX_DISCOVERY_V1';

const RARITY_COLORS = {
  common: '#e0e6ed',
  rare: '#00e676',
  super_rare: '#00b0ff',
  epic: '#d500f9',
  legendary: '#ffd700'
};

const POISON_CONFIG = {
  tickIntervalTicks: 72,     // 1.2s at 60 FPS
  durationTicks: 180,        // 3.0s total duration
  damagePerTick: 1,
  maxPropagationTargets: 2,  // Strict limit on infection spread per destroyed target
  maxChainDepth: 2           // Maximum propagation hops to prevent infinite cascading wipes
};

// ============================================================================
// 8 PADDLE MODIFIERS (Replaces Dash & Movement Speed Progression)
// ============================================================================
const PADDLE_MODIFIERS = {
  kinetic_grip: {
    id: 'kinetic_grip',
    name: 'Kinetic Grip',
    icon: '✊',
    color: '#ff5500',
    desc: 'Increases forward ball exit velocity by +20% on deflection and amplifies physical collision impact.'
  },
  magnetic_edge: {
    id: 'magnetic_edge',
    name: 'Magnetic Edge',
    icon: '🧲',
    color: '#00f2fe',
    desc: 'Subtly curves balls grazing the outer paddle edges inward toward safe angles, preventing gutter drains.'
  },
  hardpoint_core: {
    id: 'hardpoint_core',
    name: 'Hardpoint Core',
    icon: '🎯',
    color: '#ffd700',
    desc: 'The center 25% of the paddle deals +50% impact damage and emits a resonant kinetic shockwave upon hit.'
  },
  phase_surface: {
    id: 'phase_surface',
    name: 'Phase Surface',
    icon: '🌀',
    color: '#d946ef',
    desc: 'Perfect center deflections allow the ball to temporarily phase through the first obstacle struck without speed loss.'
  },
  reflector_coating: {
    id: 'reflector_coating',
    name: 'Reflector Coating',
    icon: '🪞',
    color: '#38bdf8',
    desc: 'Paddle deflections reflect incoming enemy laser blasts and bullets back toward enemies as friendly projectiles.'
  },
  cryo_surface: {
    id: 'cryo_surface',
    name: 'Cryo Surface',
    icon: '❄️',
    color: '#00e676',
    desc: 'Imbues deflected balls with cryogenic frost, slowing the first enemy struck by 40% for 3.0s.'
  },
  overcharge_surface: {
    id: 'overcharge_surface',
    name: 'Overcharge Surface',
    icon: '⚡',
    color: '#eab308',
    desc: 'Every 3 consecutive paddle deflections charges an electrical surge that discharges an EMP arc at nearby foes.'
  },
  shock_absorber: {
    id: 'shock_absorber',
    name: 'Shock Absorber',
    icon: '🛡️',
    color: '#64748b',
    desc: 'Provides complete immunity to paddle knockback and hitstun from enemy drone collisions and kamikaze blasts.'
  }
};

// ============================================================================
// 8 PADDLE CHASSIS (CYBER HANGAR)
// ============================================================================
const CHARACTERS = {
  vanguard: {
    id: 'vanguard',
    name: 'Vanguard',
    icon: '⚡',
    color: '#00f2fe',
    tag: 'All-Rounder',
    desc: 'Balanced military-grade chassis. Reliable, responsive, and adaptable to any combat sector.',
    cost: 0,
    stats: { speed: 75, size: 75, hp: 75, power: 70 },
    speedMult: 1.0,
    paddleSizeMult: 1.0,
    smashBonus: 1.0,
    abilityCdMult: 1.0,
    hpBonus: 0,
    burnChance: 0,
    isVoid: false,
    isChrono: false,
    droneCommander: false,
    glitchArchitect: false,
    modifier: 'magnetic_edge',
    passiveText: 'Equipped with Magnetic Edge. Draft rerolls cost 25% fewer Cores.',
    secondaryTrait: 'Smooth deflection curvature across all angles.'
  },
  striker: {
    id: 'striker',
    name: 'Striker',
    icon: '💥',
    color: '#ff5500',
    tag: 'Aggressive',
    desc: 'High-impact kinetic chassis engineered for aggressive forward ball smashing.',
    cost: 35,
    stats: { speed: 90, size: 70, hp: 60, power: 95 },
    speedMult: 1.2,
    paddleSizeMult: 0.9,
    smashBonus: 1.35,
    abilityCdMult: 1.0,
    hpBonus: -1,
    burnChance: 0.15,
    isVoid: false,
    isChrono: false,
    droneCommander: false,
    glitchArchitect: false,
    modifier: 'hardpoint_core',
    passiveText: 'Equipped with Hardpoint Core. Center hits deal +50% impact damage and emit shockwaves.',
    secondaryTrait: 'Smashed balls travel +25% faster; starts with -1 Max HP.'
  },
  bulwark: {
    id: 'bulwark',
    name: 'Bulwark',
    icon: '🛡️',
    color: '#00e676',
    tag: 'Defensive',
    desc: 'Super-heavy fortified composite plating. Built to withstand punishing assaults and defend objectives.',
    cost: 75,
    stats: { speed: 50, size: 100, hp: 100, power: 65 },
    speedMult: 0.85,
    paddleSizeMult: 1.3,
    smashBonus: 0.9,
    abilityCdMult: 1.1,
    hpBonus: 2,
    burnChance: 0,
    isVoid: false,
    isChrono: false,
    droneCommander: false,
    glitchArchitect: false,
    modifier: 'shock_absorber',
    passiveText: '+30% paddle width, +2 Max HP. Starts with 1 Energy Shield.',
    secondaryTrait: 'Shock Absorber built-in: immune to drone knockback and ramming damage.'
  },
  volt: {
    id: 'volt',
    name: 'Volt',
    icon: '⚡🔋',
    color: '#eab308',
    tag: 'Electric',
    desc: 'High-voltage chassis equipped with electromagnetic arc dynamos and energy capacitors.',
    cost: 140,
    stats: { speed: 85, size: 70, hp: 65, power: 85 },
    speedMult: 1.15,
    paddleSizeMult: 0.95,
    smashBonus: 1.1,
    abilityCdMult: 0.85,
    hpBonus: 0,
    burnChance: 0,
    isVoid: false,
    isChrono: false,
    droneCommander: false,
    glitchArchitect: false,
    modifier: 'overcharge_surface',
    passiveText: 'Equipped with Overcharge Surface. Consecutive deflections release chain EMP arcs.',
    secondaryTrait: 'Destroys incoming enemy bullets on direct paddle contact.'
  },
  cryo: {
    id: 'cryo',
    name: 'Cryo',
    icon: '❄️',
    color: '#38bdf8',
    tag: 'Control',
    desc: 'Sub-zero cryonic chassis capable of chilling incoming projectiles and shattering frozen clusters.',
    cost: 160,
    stats: { speed: 70, size: 80, hp: 75, power: 75 },
    speedMult: 0.95,
    paddleSizeMult: 1.05,
    smashBonus: 1.0,
    abilityCdMult: 1.0,
    hpBonus: 0,
    burnChance: 0,
    isVoid: false,
    isChrono: false,
    droneCommander: false,
    glitchArchitect: false,
    modifier: 'cryo_surface',
    passiveText: 'Equipped with Cryo Surface. Deflected balls slow enemies and shatter frozen targets.',
    secondaryTrait: 'Nearby swarm drones move 20% slower.'
  },
  commander: {
    id: 'commander',
    name: 'Commander',
    icon: '🛸',
    color: '#00b0ff',
    tag: 'Autonomous',
    desc: 'Fleet command vessel housing automated micro-drone interceptors and orbital links.',
    cost: 320,
    stats: { speed: 65, size: 75, hp: 80, power: 80 },
    speedMult: 0.9,
    paddleSizeMult: 1.0,
    smashBonus: 1.0,
    abilityCdMult: 0.95,
    hpBonus: 0,
    burnChance: 0,
    isVoid: false,
    isChrono: false,
    droneCommander: true,
    glitchArchitect: false,
    modifier: 'reflector_coating',
    passiveText: 'Starts with 1 permanent Guardian Sentry. Autonomous drones deal +25% damage.',
    secondaryTrait: 'Reflector Coating reflects enemy laser blasts back at foes.'
  },
  phase: {
    id: 'phase',
    name: 'Phase',
    icon: '🌀',
    color: '#d946ef',
    tag: 'Quantum',
    desc: 'Warp-capable chassis oscillating between dimensional frequencies to bypass solid barriers.',
    cost: 350,
    stats: { speed: 80, size: 70, hp: 70, power: 85 },
    speedMult: 1.1,
    paddleSizeMult: 0.95,
    smashBonus: 1.05,
    abilityCdMult: 0.9,
    hpBonus: 0,
    burnChance: 0,
    isVoid: true,
    isChrono: false,
    droneCommander: false,
    glitchArchitect: false,
    modifier: 'phase_surface',
    passiveText: 'Equipped with Phase Surface. Ball passes through the first brick struck per rally.',
    secondaryTrait: 'Temporal rifts slow enemy projectiles passing near the paddle.'
  },
  gambler: {
    id: 'gambler',
    name: 'Gambler',
    icon: '🎲',
    color: '#a855f7',
    tag: 'Fortune',
    desc: 'Experimental casino-rigged chassis designed for high-stakes risk, variance, and rewards.',
    cost: 250,
    stats: { speed: 75, size: 75, hp: 65, power: 90 },
    speedMult: 1.0,
    paddleSizeMult: 1.0,
    smashBonus: 1.2,
    abilityCdMult: 1.0,
    hpBonus: 0,
    burnChance: 0,
    isVoid: false,
    isChrono: false,
    droneCommander: false,
    glitchArchitect: false,
    modifier: 'kinetic_grip',
    passiveText: 'Damage variance ranges from 0.5x to 3.0x. +1 Free Spin in the Quantum Casino.',
    secondaryTrait: 'Draft rerolls grant +10 Cores instead of costing resources.'
  },
  magnetron: {
    id: 'magnetron',
    name: 'Magnetron',
    icon: '🧲',
    color: '#00f2fe',
    tag: 'Magnetic',
    desc: 'Electromagnetic manipulation chassis that curves balls grazing paddle edges inward.',
    cost: 90,
    stats: { speed: 80, size: 75, hp: 75, power: 75 },
    speedMult: 1.05,
    paddleSizeMult: 1.0,
    smashBonus: 1.0,
    abilityCdMult: 0.95,
    hpBonus: 0,
    modifier: 'magnetic_edge',
    passiveText: 'Equipped with Magnetic Edge. Edge deflections curve inward with +15% trajectory correction.',
    secondaryTrait: 'Attracts floating chips and powerups within 120px.'
  },
  dynamo: {
    id: 'dynamo',
    name: 'Dynamo',
    icon: '⚡',
    color: '#ffd700',
    tag: 'Electrical',
    desc: 'High-capacitance dynamo accumulating electrical charge on consecutive ball deflections.',
    cost: 45,
    stats: { speed: 85, size: 70, hp: 70, power: 90 },
    speedMult: 1.1,
    paddleSizeMult: 0.95,
    smashBonus: 1.15,
    abilityCdMult: 0.9,
    hpBonus: 0,
    modifier: 'kinetic_grip',
    passiveText: 'Every 3 consecutive hits releases a chain lightning shock discharging into nearest enemies.',
    secondaryTrait: 'Ball exit speed accelerates by +5% per hit up to +35%.'
  },
  rebounder: {
    id: 'rebounder',
    name: 'Apex Rebounder',
    icon: '📐',
    color: '#ff5500',
    tag: 'Ricochet',
    desc: 'Aerodynamic angled deflector chassis optimized for sharp wall rebounds and velocity multiplication.',
    cost: 220,
    stats: { speed: 90, size: 70, hp: 65, power: 85 },
    speedMult: 1.15,
    paddleSizeMult: 0.95,
    smashBonus: 1.1,
    abilityCdMult: 1.0,
    hpBonus: 0,
    modifier: 'kinetic_grip',
    passiveText: 'Balls gain +15% exit speed and +1 damage on every wall bounce up to 3 stacks.',
    secondaryTrait: 'Critical sweet spot expands by 25% on balls returning from wall ricochets.'
  },
  bastion: {
    id: 'bastion',
    name: 'Aegis Bastion',
    icon: '🏰',
    color: '#10b981',
    tag: 'Fortress',
    desc: 'Impenetrable bunker chassis capable of deploying auxiliary energy hardpoints.',
    cost: 420,
    stats: { speed: 55, size: 95, hp: 95, power: 70 },
    speedMult: 0.85,
    paddleSizeMult: 1.25,
    smashBonus: 0.9,
    abilityCdMult: 1.1,
    hpBonus: 2,
    modifier: 'shock_absorber',
    passiveText: 'Immune to drone knockback. Starts each sector with +2 Shield Charges.',
    secondaryTrait: 'Taking damage triggers a concussive blast pushing all enemies back 140px.'
  },
  sniper: {
    id: 'sniper',
    name: 'Sniper Core',
    icon: '🎯',
    color: '#ef4444',
    tag: 'Precision',
    desc: 'Precision-calibrated rail chassis delivering ultra-lethal pinpoint critical deflections.',
    cost: 380,
    stats: { speed: 85, size: 65, hp: 60, power: 100 },
    speedMult: 1.1,
    paddleSizeMult: 0.85,
    smashBonus: 1.4,
    abilityCdMult: 0.95,
    hpBonus: -1,
    modifier: 'hardpoint_core',
    passiveText: 'Precision center hits deal +100% critical damage and fire a piercing laser tracer.',
    secondaryTrait: 'Critical hit sweet spot is 15% narrower; starts with -1 Max HP.'
  },
  singularity: {
    id: 'singularity',
    name: 'Singularity',
    icon: '🌌',
    color: '#8b5cf6',
    tag: 'Gravitational',
    desc: 'Experimental dark matter core generating micro-gravitational wells during combat.',
    cost: 650,
    stats: { speed: 75, size: 75, hp: 70, power: 90 },
    speedMult: 1.0,
    paddleSizeMult: 1.0,
    smashBonus: 1.1,
    abilityCdMult: 0.9,
    hpBonus: 0,
    isVoid: true,
    modifier: 'phase_surface',
    passiveText: 'High-speed balls subtly pull adjacent bricks and enemy projectiles toward their trajectory.',
    secondaryTrait: 'Space-time dilation activates for 1.5s when ball is within 60px of paddle.'
  },
  hive: {
    id: 'hive',
    name: 'Hive Architect',
    icon: '🐝',
    color: '#eab308',
    tag: 'Fleet Swarm',
    desc: 'Micro-carrier mothership designed for continuous drone fabrication and fleet coordination.',
    cost: 750,
    stats: { speed: 70, size: 80, hp: 75, power: 85 },
    speedMult: 0.95,
    paddleSizeMult: 1.05,
    smashBonus: 0.95,
    abilityCdMult: 0.85,
    hpBonus: 0,
    droneCommander: true,
    modifier: 'reflector_coating',
    passiveText: 'Starts with 2 permanent Sentinel Drones. Drones gain +35% attack speed.',
    secondaryTrait: 'Active abilities also trigger a coordinated missile salvo from all active drones.'
  },
  infiltrator: {
    id: 'infiltrator',
    name: 'Cyber Infiltrator',
    icon: '🔓',
    color: '#06b6d4',
    tag: 'Heist Specialist',
    desc: 'Stealth-coated reconnaissance chassis outfitted with high-bandwidth cryptographic bypassers.',
    cost: 850,
    stats: { speed: 95, size: 70, hp: 65, power: 80 },
    speedMult: 1.2,
    paddleSizeMult: 0.9,
    smashBonus: 1.0,
    abilityCdMult: 0.9,
    hpBonus: 0,
    modifier: 'phase_surface',
    passiveText: 'Cyber Heist alert accumulates 30% slower. Data Caches drop +40% bonus Data Chips.',
    secondaryTrait: 'Starts with +50 Data Chips in every run and has a 20% discount in Underground Shops.'
  },
  chronos: {
    id: 'chronos',
    name: 'Chronos',
    icon: '⏳',
    color: '#00f2fe',
    tag: 'Temporal Engine',
    desc: 'Experimental chrono-stabilized chassis capable of manipulating combat time-flow.',
    cost: 180,
    stats: { speed: 80, size: 75, hp: 70, power: 80 },
    speedMult: 1.05,
    paddleSizeMult: 1.0,
    smashBonus: 1.0,
    abilityCdMult: 0.9,
    hpBonus: 0,
    isChrono: true,
    modifier: 'cryo_surface',
    passiveText: 'Incoming high-speed balls decelerate by 35% within 80px of the paddle.',
    secondaryTrait: 'Perfect center deflections accelerate ball exit speed by +30%.'
  },
  eclipse: {
    id: 'eclipse',
    name: 'Eclipse',
    icon: '🌑',
    color: '#a855f7',
    tag: 'Umbral Phasing',
    desc: 'High-stealth chassis that harnesses shadow energy to phase through hazards and missiles.',
    cost: 210,
    stats: { speed: 90, size: 70, hp: 65, power: 85 },
    speedMult: 1.15,
    paddleSizeMult: 0.95,
    smashBonus: 1.1,
    abilityCdMult: 0.95,
    hpBonus: 0,
    isVoid: true,
    modifier: 'phase_surface',
    passiveText: 'Immune to projectile damage for 1.5s after any ball deflection.',
    secondaryTrait: 'Deflected balls emit an umbral after-image dealing 50% splash damage.'
  },
  maelstrom: {
    id: 'maelstrom',
    name: 'Maelstrom',
    icon: '🌪️',
    color: '#06b6d4',
    tag: 'Vortex Field',
    desc: 'Equipped with dual kinetic turbines that project localized gravitational eddies.',
    cost: 340,
    stats: { speed: 85, size: 80, hp: 75, power: 85 },
    speedMult: 1.1,
    paddleSizeMult: 1.05,
    smashBonus: 1.15,
    abilityCdMult: 0.95,
    hpBonus: 0,
    modifier: 'magnetic_edge',
    passiveText: 'Loose Data Chips and powerup drops gravitate toward the paddle from 2x distance.',
    secondaryTrait: 'Deflections create a micro-cyclone repelling hostile drones from the paddle lane.'
  },
  valkyrie: {
    id: 'valkyrie',
    name: 'Valkyrie',
    icon: '⚔️',
    color: '#f43f5e',
    tag: 'Strike Interceptor',
    desc: 'Aerodynamic rapid-response chassis outfitted for hyper-speed aerial counter-strikes.',
    cost: 80,
    stats: { speed: 95, size: 70, hp: 65, power: 90 },
    speedMult: 1.25,
    paddleSizeMult: 0.9,
    smashBonus: 1.25,
    abilityCdMult: 0.9,
    hpBonus: -1,
    modifier: 'kinetic_grip',
    passiveText: '+25% paddle movement speed; deflection smash threshold reduced by 30%.',
    secondaryTrait: 'Destroying a hostile drone instantly restores 2.0s of active ability cooldown.'
  },
  dreadnought: {
    id: 'dreadnought',
    name: 'Dreadnought',
    icon: '🛡️⚓',
    color: '#64748b',
    tag: 'Heavy Armor',
    desc: 'Titan-class reinforced plating with dual kinetic dampeners. Unyielding defensive fortress.',
    cost: 360,
    stats: { speed: 50, size: 105, hp: 100, power: 75 },
    speedMult: 0.85,
    paddleSizeMult: 1.35,
    smashBonus: 0.9,
    abilityCdMult: 1.15,
    hpBonus: 3,
    modifier: 'shock_absorber',
    passiveText: '+35% paddle width, +3 Max HP. Immune to drone knockback and displacement.',
    secondaryTrait: 'Absorbs the first hit in every sector with zero damage taken; -15% speed.'
  },
  pulsar: {
    id: 'pulsar',
    name: 'Pulsar',
    icon: '💫',
    color: '#38bdf8',
    tag: 'EMP Dynamo',
    desc: 'Resonant pulse emitter that discharges concussive EMP blasts across the combat grid.',
    cost: 70,
    stats: { speed: 80, size: 75, hp: 70, power: 85 },
    speedMult: 1.05,
    paddleSizeMult: 1.0,
    smashBonus: 1.1,
    abilityCdMult: 0.9,
    hpBonus: 0,
    modifier: 'overcharge_surface',
    passiveText: 'Every 5 consecutive ball rallies releases an EMP wave clearing bullets on screen.',
    secondaryTrait: 'EMP blast stuns turrets and hostile drones for 1.5s.'
  },
  mirage: {
    id: 'mirage',
    name: 'Mirage',
    icon: '🪞✨',
    color: '#ec4899',
    tag: 'Holo Decoy',
    desc: 'Advanced holographic projector that deploys decoys to divert enemy fire.',
    cost: 190,
    stats: { speed: 85, size: 75, hp: 70, power: 80 },
    speedMult: 1.1,
    paddleSizeMult: 1.0,
    smashBonus: 1.0,
    abilityCdMult: 0.9,
    hpBonus: 0,
    modifier: 'reflector_coating',
    passiveText: 'Deploys a holographic decoy paddle that mirrors paddle movement and reflects lasers.',
    secondaryTrait: '25% chance for incoming projectiles to pass harmlessly through the decoy.'
  },
  aegis_prime: {
    id: 'aegis_prime',
    name: 'Aegis Prime',
    icon: '🔰',
    color: '#10b981',
    tag: 'Force Barrier',
    desc: 'Elite defensive platform projecting an active electromagnetic barrier shield.',
    cost: 440,
    stats: { speed: 65, size: 90, hp: 90, power: 80 },
    speedMult: 0.9,
    paddleSizeMult: 1.2,
    smashBonus: 0.95,
    abilityCdMult: 1.05,
    hpBonus: 2,
    modifier: 'shock_absorber',
    passiveText: 'Starts every combat sector with +2 Energy Shields. Regenerates 1 shield on bosses.',
    secondaryTrait: 'When a shield breaks, releases a concussive barrier wave damaging all obstacles.'
  },
  tempest: {
    id: 'tempest',
    name: 'Tempest',
    icon: '⚡⛈️',
    color: '#eab308',
    tag: 'Storm Arc',
    desc: 'High-frequency ionic chassis generating continuous electrical arc storms.',
    cost: 150,
    stats: { speed: 85, size: 75, hp: 70, power: 90 },
    speedMult: 1.15,
    paddleSizeMult: 0.95,
    smashBonus: 1.15,
    abilityCdMult: 0.9,
    hpBonus: 0,
    modifier: 'overcharge_surface',
    passiveText: 'Deflections supercharge the ball with chain lightning, arcing to 2 nearby targets.',
    secondaryTrait: 'Shocked enemies take +30% increased damage from subsequent ball hits for 3.0s.'
  },
  voidwalker: {
    id: 'voidwalker',
    name: 'Voidwalker',
    icon: '👁️‍🗨️',
    color: '#d946ef',
    tag: 'Void Singularity',
    desc: 'Phased chassis existing halfway between Euclidean space and the quantum void.',
    cost: 720,
    stats: { speed: 90, size: 75, hp: 70, power: 95 },
    speedMult: 1.2,
    paddleSizeMult: 1.0,
    smashBonus: 1.2,
    abilityCdMult: 0.85,
    hpBonus: 0,
    isVoid: true,
    modifier: 'phase_surface',
    passiveText: 'Paddle phases through obstacles; deflections grant balls temporary void piercing.',
    secondaryTrait: 'Void phase hits ignore brick hardness and shields, piercing through columns.'
  },
  overlord: {
    id: 'overlord',
    name: 'Overlord',
    icon: '👑',
    color: '#ffd700',
    tag: 'Command Network',
    desc: 'Fleet command chassis equipped with high-yield drone fabrication bays and automated turrets.',
    cost: 820,
    stats: { speed: 75, size: 85, hp: 85, power: 90 },
    speedMult: 1.0,
    paddleSizeMult: 1.1,
    smashBonus: 1.1,
    abilityCdMult: 0.85,
    hpBonus: 1,
    droneCommander: true,
    modifier: 'hardpoint_core',
    passiveText: 'Coordinates 2 automated combat drones that target hostiles and shoot micro-lasers.',
    secondaryTrait: 'Drone kills yield +50% bonus Data Chips and accelerate active ability recharge.'
  },
  nexus: {
    id: 'nexus',
    name: 'Nexus',
    icon: '💠',
    color: '#00f2fe',
    tag: 'Quantum Harmonic',
    desc: 'Experimental harmonic resonator that synchronizes all equipped upgrades and abilities.',
    cost: 30,
    stats: { speed: 75, size: 75, hp: 75, power: 75 },
    speedMult: 1.0,
    paddleSizeMult: 1.0,
    smashBonus: 1.0,
    abilityCdMult: 1.0,
    hpBonus: 0,
    modifier: 'kinetic_grip',
    passiveText: 'All artifact synergies and tag requirements are reduced by 1.',
    secondaryTrait: 'Balanced chassis with +10% bonus across all stats when at full HP.'
  },
  bennie_bouncer: {
    id: 'bennie_bouncer',
    name: "Bennie's Ball Bouncer",
    icon: '💡',
    color: '#ffd700',
    tag: 'Inventor Prototype',
    desc: "Bennie's secret experimental chassis outfitted with spring-loaded kinetic bumpers and wacky contraptions.",
    cost: 0,
    secretUnlock: true,
    stats: { speed: 85, size: 80, hp: 80, power: 90 },
    speedMult: 1.15,
    paddleSizeMult: 1.05,
    smashBonus: 1.35,
    abilityCdMult: 0.85,
    hpBonus: 0,
    modifier: 'prototype_bounce',
    passiveText: 'Equipped with Prototype Bounce. Smashed deflections deploy kinetic bumpers that repel balls with 1.4x velocity.',
    secondaryTrait: 'Every 5th deflection releases a random experimental gadget and bouncing prototype springs.'
  }
};

// ============================================================================
// 12 CORE BUILD PATHS
// ============================================================================
const BUILD_PATHS = {
  kinetic: {
    id: 'kinetic',
    name: 'Kinetic',
    icon: '💥',
    color: '#ff5500',
    tag: 'Impact Core',
    signature: 'Impact Charge',
    signatureDesc: 'Hard deflections build kinetic energy that unleashes devastating shockwaves upon impact.',
    playstyle: 'Aggressive physical ball impacts, heavy knockback, and explosive collision waves.',
    strengths: 'Massive single-target and splash burst damage; obliterates armor and heavy structures.',
    weaknesses: 'Minimal crowd control or damage-over-time status effects.',
    difficulty: 'Direct & Aggressive',
    idealFor: 'Players who enjoy high-impact ball deflections and aggressive forward ball striking.',
    compatibleSecondary: ['velocity', 'critical', 'artillery', 'juggernaut']
  },
  velocity: {
    id: 'velocity',
    name: 'Velocity',
    icon: '⚡',
    color: '#ffd700',
    tag: 'Momentum Core',
    signature: 'Momentum Chain',
    signatureDesc: 'The longer the ball stays in continuous play without dropping, the more dangerous and fast it becomes.',
    playstyle: 'Accelerating the ball to extreme speeds and chaining rapid-fire ricochets.',
    strengths: 'Unrivaled room-clearing speed and rapid combo multiplier scaling.',
    weaknesses: 'Severe penalty if the ball is dropped or momentum is lost.',
    difficulty: 'High Reflexes & Rhythm',
    idealFor: 'Players with quick eyes who love fast-paced arcade Pong rallies and rapid bounces.',
    compatibleSecondary: ['kinetic', 'ricochet', 'quantum', 'critical']
  },
  critical: {
    id: 'critical',
    name: 'Critical / Precision',
    icon: '🎯',
    color: '#00f2fe',
    tag: 'Sniper Core',
    signature: 'Precision Window',
    signatureDesc: 'Deflections striking the narrow center zone trigger guaranteed 2.5x critical strikes and piercing laser shards.',
    playstyle: 'Pinpoint paddle positioning, razor deflection angles, and sniper-like weakpoint targeting.',
    strengths: 'Incredible single-target burst and armor-piercing critical strikes.',
    weaknesses: 'Unforgiving against sloppy paddle hits or edge grazing.',
    difficulty: 'Technical & Precision-Heavy',
    idealFor: 'Players who pride themselves on pixel-perfect paddle alignment and sharp angles.',
    compatibleSecondary: ['kinetic', 'velocity', 'artillery', 'ricochet']
  },
  juggernaut: {
    id: 'juggernaut',
    name: 'Juggernaut',
    icon: '🛡️',
    color: '#00e676',
    tag: 'Bastion Core',
    signature: 'Fortify',
    signatureDesc: 'Absorbing hits and deflecting heavy attacks temporarily deploys reactive energy barriers and knockback pulses.',
    playstyle: 'High survivability, wide defensive coverage, shield generation, and drone collision resistance.',
    strengths: 'Exceptional defense, high Max HP, virtually immune to sudden burst damage.',
    weaknesses: 'Lower direct offensive scaling; battles take longer.',
    difficulty: 'Forgiving & Resilient',
    idealFor: 'Players who want a steady, tanky playstyle that withstands heavy swarm barrages.',
    compatibleSecondary: ['kinetic', 'artillery', 'drone', 'bio']
  },
  drone: {
    id: 'drone',
    name: 'Drone Command',
    icon: '🛸',
    color: '#00b0ff',
    tag: 'Fleet Core',
    signature: 'Fleet Capacity',
    signatureDesc: 'Deploys autonomous combat sentries, defensive satellites, and automated seeker missile drones.',
    playstyle: 'Letting an automated fleet handle bullet interception and targeted fire while you manage the ball.',
    strengths: 'Consistent automated room pressure and hands-free bullet destruction.',
    weaknesses: 'Lower direct damage output from the ball itself.',
    difficulty: 'Strategic & Resource-Focused',
    idealFor: 'Players who enjoy summoner and pet-based gameplay with automated support fleets.',
    compatibleSecondary: ['electro', 'juggernaut', 'artillery', 'quantum']
  },
  bio: {
    id: 'bio',
    name: 'Bio-Corrosion',
    icon: '☣️',
    color: '#10b981',
    tag: 'Contagion Core',
    signature: 'Contamination',
    signatureDesc: 'Coats balls in caustic acid. Inflicts steady DoT that strips armor (strictly capped spread: max 2 targets).',
    playstyle: 'Spreading corrosion across the board, weakening high-HP enemies and melting tough shields.',
    strengths: 'Incredible sustained damage against bosses and heavily armored titanium targets.',
    weaknesses: 'Slower initial burst damage against fast-moving swarms.',
    difficulty: 'Tactical & Patient',
    idealFor: 'Players who like watching enemies steadily dissolve under layers of corrosive damage.',
    compatibleSecondary: ['cryo', 'juggernaut', 'artillery', 'ricochet']
  },
  cryo: {
    id: 'cryo',
    name: 'Cryo',
    icon: '❄️',
    color: '#38bdf8',
    tag: 'Permafrost Core',
    signature: 'Shatter',
    signatureDesc: 'Applies frost slow. Frozen enemies become brittle and detonate into lethal ice shards when shattered.',
    playstyle: 'Crowd control, freezing mobile threats in place, and detonating frozen clusters.',
    strengths: 'Superb control over chaotic swarms and enemy projectile cadence.',
    weaknesses: 'Requires follow-up hits to capitalize on frozen targets.',
    difficulty: 'Control & Combo-Heavy',
    idealFor: 'Players who want to dominate the battlefield pace by freezing dangerous enemies solid.',
    compatibleSecondary: ['bio', 'ricochet', 'kinetic', 'quantum']
  },
  electro: {
    id: 'electro',
    name: 'Electromagnetic',
    icon: '⚡🔋',
    color: '#eab308',
    tag: 'Tesla Core',
    signature: 'Conductivity',
    signatureDesc: 'Electrifies targets, causing lightning arcs to chain to up to 3 nearby enemies and trigger EMP stuns.',
    playstyle: 'High-voltage area-of-effect shocks, disabling turrets, and clearing dense groups.',
    strengths: 'Devastating against clustered drone swarms and tight brick formations.',
    weaknesses: 'Inefficient against isolated single targets with no arc partners.',
    difficulty: 'Chain & Group-Focused',
    idealFor: 'Players who love chain reactions, screen-filling electricity, and disabling enemy weapons.',
    compatibleSecondary: ['drone', 'ricochet', 'velocity', 'artillery']
  },
  ricochet: {
    id: 'ricochet',
    name: 'Ricochet',
    icon: '🪃',
    color: '#f97316',
    tag: 'Geometry Core',
    signature: 'Perfect Bounce',
    signatureDesc: 'Each consecutive arena wall and corner bounce grants bonus damage and releases piercing shrapnel needles.',
    playstyle: 'Mastering deflection angles, bouncing around defensive obstacles, and turning the walls into weapons.',
    strengths: 'Hits inaccessible targets behind shields and cleans up awkward corner blocks.',
    weaknesses: 'Reduced effectiveness in wide-open boss chambers with few boundary surfaces.',
    difficulty: 'Geometric & Calculation-Heavy',
    idealFor: 'Players who love trick shots, angle mastery, and billiard-style multi-cushion plays.',
    compatibleSecondary: ['velocity', 'cryo', 'critical', 'electro']
  },
  quantum: {
    id: 'quantum',
    name: 'Quantum',
    icon: '🌀',
    color: '#d946ef',
    tag: 'Warp Core',
    signature: 'Phase State',
    signatureDesc: 'Creates phantom spectral balls and temporal rifts that phase through solid barriers to strike internal cores.',
    playstyle: 'Manipulating time dilation, bypassing impassable defenses, and generating spectral duplicates.',
    strengths: 'Ignores outer shields and impenetrable frontlines to strike generators directly.',
    weaknesses: 'Spectral trajectories can be chaotic and less intuitive to predict.',
    difficulty: 'Exotic & Timing-Heavy',
    idealFor: 'Players seeking mind-bending mechanics, time-slowing rifts, and phase-shifting balls.',
    compatibleSecondary: ['velocity', 'gambler', 'drone', 'cryo']
  },
  artillery: {
    id: 'artillery',
    name: 'Artillery',
    icon: '🚀',
    color: '#ef4444',
    tag: 'Siege Core',
    signature: 'Charge Shot',
    signatureDesc: 'Consecutive paddle hits charge a devastating forward Railgun beam and long-range mortar shells.',
    playstyle: 'Charging up monumental siege strikes to vaporize entire columns of bricks and heavy elites.',
    strengths: 'Unmatched raw line-penetration damage and screen-clearing beam attacks.',
    weaknesses: 'Requires multiple rhythmic hits to charge; vulnerable during reload windows.',
    difficulty: 'Deliberate & Heavy-Hitter',
    idealFor: 'Players who love massive charged lasers, railgun cannons, and catastrophic detonations.',
    compatibleSecondary: ['kinetic', 'critical', 'juggernaut', 'electro']
  },
  gambler: {
    id: 'gambler',
    name: 'Gambler / Chaos',
    icon: '🎲',
    color: '#a855f7',
    tag: 'Fortune Core',
    signature: 'Fortune',
    signatureDesc: 'Every hit rolls a chaotic damage variance (0.5x to 3.0x); unlocks exclusive Quantum Casino wagers and rerolls.',
    playstyle: 'Embracing risk and reward, chasing high-variance jackpots, and turning volatile chaos into victory.',
    strengths: 'Can trigger absurdly overpowered damage spikes and jackpot resource payouts.',
    weaknesses: 'High volatility; low rolls can occur at critical moments.',
    difficulty: 'High-Risk & High-Reward',
    idealFor: 'Gamblers, roguelike thrill-seekers, and players who love unpredictable, exciting runs.',
    compatibleSecondary: ['quantum', 'velocity', 'kinetic', 'critical']
  },
  vampiric: {
    id: 'vampiric',
    name: 'Vampiric / Siphon',
    icon: '🩸',
    color: '#e11d48',
    tag: 'Siphon Core',
    signature: 'Life Siphon',
    signatureDesc: 'Ball impacts against obstacles and elite foes siphon nano-energy into reactive shields and hull repairs.',
    playstyle: 'Aggressive sustained combat where continuous damage repairs your hull and overcharges shields.',
    strengths: 'Unmatched attrition survivability and self-repair during prolonged battles.',
    weaknesses: 'Lower direct initial burst damage.',
    difficulty: 'Sustained & Aggressive',
    idealFor: 'Players who want to stay alive through relentless offense and siphon shields.',
    compatibleSecondary: ['juggernaut', 'kinetic', 'bio', 'chrono']
  },
  pyro: {
    id: 'pyro',
    name: 'Pyro / Inferno',
    icon: '🔥',
    color: '#f97316',
    tag: 'Combustion Core',
    signature: 'Thermal Ignite',
    signatureDesc: 'Ignites bricks and enemies in spreading flames, leaving blazing trails that melt defensive lines.',
    playstyle: 'Area denial, setting whole rows on fire, and detonating overheated structures.',
    strengths: 'Continuous ticking damage that melts heavily armored formations and dense swarms.',
    weaknesses: 'Status damage requires time to tick down high-health targets.',
    difficulty: 'Fiery & Tactical',
    idealFor: 'Players who love burning everything to cinders with thermal ignite reactions.',
    compatibleSecondary: ['electro', 'bio', 'artillery', 'kinetic']
  },
  gravity: {
    id: 'gravity',
    name: 'Gravity / Singularity',
    icon: '🌌',
    color: '#8b5cf6',
    tag: 'Singularity Core',
    signature: 'Graviton Well',
    signatureDesc: 'Ball impacts generate micro-vortexes pulling loose chips, stray balls, and debris toward central points.',
    playstyle: 'Vortex crowd control, warping ball trajectories to bypass shields and strike behind cover.',
    strengths: 'Superb projectile redirection and hands-free Data Chip collection.',
    weaknesses: 'Gravitational pulls can bend ball angles unpredictably.',
    difficulty: 'Complex Physics & Control',
    idealFor: 'Players who enjoy curving trajectories and gravitational battlefield manipulation.',
    compatibleSecondary: ['quantum', 'drone', 'ricochet', 'chrono']
  },
  chrono: {
    id: 'chrono',
    name: 'Chrono / Temporal',
    icon: '⏳',
    color: '#06b6d4',
    tag: 'Temporal Core',
    signature: 'Time Dilation',
    signatureDesc: 'Manipulates temporal flow, slowing down incoming balls near the paddle and granting rewind buffers.',
    playstyle: 'Bullet-time reactions, rhythm control, and undoing critical deflection misses.',
    strengths: 'Immense reaction windows; near-zero dropped balls during chaotic moments.',
    weaknesses: 'Lower raw explosive damage output.',
    difficulty: 'Reflex & Timing-Friendly',
    idealFor: 'Players who want supreme control over game pace and high safety against fast rallies.',
    compatibleSecondary: ['quantum', 'critical', 'velocity', 'vampiric']
  },
  nanite: {
    id: 'nanite',
    name: 'Nanite Swarm',
    icon: '🦠',
    color: '#10b981',
    tag: 'Nanotech Core',
    signature: 'Replication',
    signatureDesc: 'Shattered targets release self-replicating nanite clouds that eat into neighboring blocks autonomously.',
    playstyle: 'Autonomous swarm propagation that chews through defensive barriers automatically.',
    strengths: 'Cascading chain reactions that clean up awkward corner blocks without direct hits.',
    weaknesses: 'Requires initial kills to seed nanite colonies.',
    difficulty: 'Exponential & Autonomous',
    idealFor: 'Players who love watching automated swarms devour entire brick formations.',
    compatibleSecondary: ['bio', 'drone', 'electro', 'gambler']
  },
  stealth: {
    id: 'stealth',
    name: 'Stealth / Phantom',
    icon: '🥷',
    color: '#64748b',
    tag: 'Infiltration Core',
    signature: 'Ambush Strike',
    signatureDesc: 'Paddle cloaks during rallies; uncloaking strikes unleash massive 3x ambush critical spikes.',
    playstyle: 'Patient positioning, lining up single devastating strikes from the shadows.',
    strengths: 'Colossal single-hit burst damage capable of one-shotting elites and heavy nodes.',
    weaknesses: 'Requires deliberate setup time between stealth charges.',
    difficulty: 'Tactical & Burst-Heavy',
    idealFor: 'Players who prefer calculated, patient strikes over continuous rapid fire.',
    compatibleSecondary: ['critical', 'quantum', 'kinetic', 'artillery']
  },
  resonance: {
    id: 'resonance',
    name: 'Acoustic / Resonance',
    icon: '🔊',
    color: '#ec4899',
    tag: 'Harmonic Core',
    signature: 'Shatterwave',
    signatureDesc: 'Emits harmonic sonic vibrations through struck structures, shattering connected blocks of identical type.',
    playstyle: 'Targeting matching structures to trigger seismic chain-shatter waves.',
    strengths: 'Obliterates uniform brick walls and clustered drone formations in single strikes.',
    weaknesses: 'Less effective against mixed, isolated targets.',
    difficulty: 'Pattern Recognition',
    idealFor: 'Players who love domino-effect shattering and structural harmonic booms.',
    compatibleSecondary: ['kinetic', 'ricochet', 'cryo', 'electro']
  },
  overclock: {
    id: 'overclock',
    name: 'Cyberware / Overclock',
    icon: '⚙️',
    color: '#f59e0b',
    tag: 'Overdrive Core',
    signature: 'Thermal Vent',
    signatureDesc: 'Overclocks paddle thrusters and ball acceleration into hyper-drive, venting devastating heat blasts.',
    playstyle: 'Blistering speed, extreme paddle responsiveness, and high-frequency ball rallies.',
    strengths: 'Fastest clear speeds and relentless frontline pressure.',
    weaknesses: 'High heat requires disciplined venting to avoid temporary cooldowns.',
    difficulty: 'High-APM & Intense',
    idealFor: 'Adrenaline junkies who love hyper-speed gameplay and maximum tempo.',
    compatibleSecondary: ['velocity', 'pyro', 'kinetic', 'electro']
  },
  mirror: {
    id: 'mirror',
    name: 'Prismatic / Refraction',
    icon: '🪞',
    color: '#38bdf8',
    tag: 'Prism Core',
    signature: 'Spectrum Split',
    signatureDesc: 'Deflections through prismatic paddle facets refract into secondary spectrum beams and hologram duplicates.',
    playstyle: 'Multiplying firing lanes, flooding the arena with multi-spectral lasers and mirrored balls.',
    strengths: 'Screen-saturating coverage and multi-angle saturation.',
    weaknesses: 'Multiple beams dilute focus from single high-priority targets.',
    difficulty: 'Visual Multitasking',
    idealFor: 'Players who love laser shows, split beams, and kaleidoscopic destruction.',
    compatibleSecondary: ['ricochet', 'quantum', 'critical', 'drone']
  },
  plague: {
    id: 'plague',
    name: 'Toxic / Plague',
    icon: '🧪',
    color: '#84cc16',
    tag: 'Decay Core',
    signature: 'Caustic Miasma',
    signatureDesc: 'Breaks and enemy kills leave lingering toxic miasma clouds that melt through oncoming waves.',
    playstyle: 'Zoning the battlefield with toxic hazard zones that destroy enemies as they advance.',
    strengths: 'Incredible defensive containment against advancing hordes.',
    weaknesses: 'Requires careful positioning so enemies pass through the clouds.',
    difficulty: 'Zoning & Battlefield Control',
    idealFor: 'Players who like setting death traps and controlling enemy movement paths.',
    compatibleSecondary: ['bio', 'nanite', 'pyro', 'juggernaut']
  },
  magnetic: {
    id: 'magnetic',
    name: 'Polarity / Flux',
    icon: '🧲',
    color: '#0ea5e9',
    tag: 'Flux Core',
    signature: 'Remote Flux',
    signatureDesc: 'Magnetic polarity allows the paddle to actively curve and steer the ball mid-air using lateral movement.',
    playstyle: 'Remote ball manipulation, curving shots around indestructible shields, curving trick-shots.',
    strengths: 'Never miss an angle; direct ball steering around obstacles.',
    weaknesses: 'Demands precise paddle maneuvering while balls are in flight.',
    difficulty: 'High Skill Ceiling',
    idealFor: 'Players who want after-touch ball curving and billiard-level trajectory manipulation.',
    compatibleSecondary: ['ricochet', 'velocity', 'gravity', 'artillery']
  },
  solar: {
    id: 'solar',
    name: 'Radiant / Photonic',
    icon: '☀️',
    color: '#eab308',
    tag: 'Solar Core',
    signature: 'Supernova Charge',
    signatureDesc: 'Continuous rallies charge a radiant solar core, releasing blinding solar flares that vaporize entire screen quadrants.',
    playstyle: 'Building momentum over long rallies, discharging catastrophic room-clearing bursts.',
    strengths: 'The most powerful room-clearing blast in the game when fully charged.',
    weaknesses: 'Losing the ball resets solar charge accumulation.',
    difficulty: 'Rally Endurance',
    idealFor: 'Players with patient defense who want massive payoff super-weapons.',
    compatibleSecondary: ['kinetic', 'artillery', 'pyro', 'critical']
  },
  inventor: {
    id: 'inventor',
    name: 'Inventor / Prototype',
    icon: '💡',
    color: '#ffd700',
    tag: 'Workshop Core',
    secretUnlock: true,
    signature: 'Experimental Contraption',
    signatureDesc: "Bennie's secret invention: every hit deploys spring-loaded bumpers, bouncing gears, homing wrenches, and chaotic prototypes.",
    playstyle: 'Whimsical, chaotic mechanical contraptions that flood the arena with unpredictable gadgets and explosive springs.',
    strengths: 'Wild multi-target pressure, bizarre bounces that bypass defenses, high drop luck.',
    weaknesses: 'Erratic contraption bounces require fast on-the-fly improvisation.',
    difficulty: 'Chaotic & Creative',
    idealFor: 'Secret seekers, gadget lovers, and players who want hilarious mechanical bedlam.',
    compatibleSecondary: ['kinetic', 'drone', 'artillery', 'quantum']
  }
};

const ARCHETYPES = BUILD_PATHS;

// Secondary Specialization Branches
const SECONDARY_BRANCHES = {
  kinetic: [
    { id: 'velocity', name: 'Kinetic Momentum', desc: 'Velocity synergy: Extreme forward velocity multiplies collision shockwaves.' },
    { id: 'critical', name: 'Precision Impact', desc: 'Critical synergy: Center hits trigger concussive structural fractures.' },
    { id: 'artillery', name: 'Siege Breaker', desc: 'Artillery synergy: Heavy deflections charge explosive mortar shells.' }
  ],
  velocity: [
    { id: 'kinetic', name: 'Velocity Breaker', desc: 'Kinetic synergy: Speed directly increases damage and collision radius.' },
    { id: 'ricochet', name: 'Momentum Ricochet', desc: 'Ricochet synergy: Wall bounces accelerate the ball instead of slowing it.' },
    { id: 'quantum', name: 'Phase Velocity', desc: 'Quantum synergy: High-speed balls phase through obstacles effortlessly.' }
  ],
  critical: [
    { id: 'kinetic', name: 'Titan Executioner', desc: 'Kinetic synergy: Critical hits unleash localized earthquake pulses.' },
    { id: 'ricochet', name: 'Critical Ricochet', desc: 'Ricochet synergy: Wall bounces preserve critical multipliers.' },
    { id: 'artillery', name: 'Sniper Ordnance', desc: 'Artillery synergy: Center hits charge a piercing high-caliber railgun.' }
  ],
  juggernaut: [
    { id: 'kinetic', name: 'Titan Engine', desc: 'Kinetic synergy: Taking damage converts energy into an explosive forward wave.' },
    { id: 'drone', name: 'Guardian Network', desc: 'Drone synergy: Drones sacrifice their shields to protect your paddle.' },
    { id: 'artillery', name: 'Fortified Siege', desc: 'Artillery synergy: Generates protective barriers while charging Railgun.' }
  ],
  drone: [
    { id: 'electro', name: 'Storm Fleet', desc: 'Electromagnetic synergy: Drones fire chain lightning arcs between targets.' },
    { id: 'artillery', name: 'Orbital Strike Matrix', desc: 'Artillery synergy: Drones laser-designate targets for orbital strikes.' },
    { id: 'quantum', name: 'Spectral Squadron', desc: 'Quantum synergy: Drones duplicate into phase clones during intense waves.' }
  ],
  bio: [
    { id: 'cryo', name: 'Plague Winter', desc: 'Cryo synergy: Shattering frozen enemies releases caustic corrosive gas.' },
    { id: 'artillery', name: 'Toxic Ordnance', desc: 'Artillery synergy: Mortar shells leave large bubbling acid pools.' },
    { id: 'juggernaut', name: 'Corrosive Bastion', desc: 'Juggernaut synergy: Absorbing hits infects attackers with corrosive venom.' }
  ],
  cryo: [
    { id: 'ricochet', name: 'Frozen Pinball', desc: 'Ricochet synergy: Wall bounces spray razor-sharp ice needles.' },
    { id: 'bio', name: 'Absolute Zero', desc: 'Bio synergy: Acid and frost fuse, melting armor and shattering enemies.' },
    { id: 'quantum', name: 'Chrono Stasis', desc: 'Quantum synergy: Temporal rifts freeze all nearby bullets solid.' }
  ],
  electro: [
    { id: 'drone', name: 'Arc Fleet', desc: 'Drone synergy: Constant high-voltage laser boog connects drones.' },
    { id: 'ricochet', name: 'Chain Ricochet', desc: 'Ricochet synergy: Wall bounces release discharging spark rings.' },
    { id: 'velocity', name: 'Superconductor Wave', desc: 'Velocity synergy: Faster ball speed increases chain lightning range.' }
  ],
  ricochet: [
    { id: 'velocity', name: 'Pinball Cascade', desc: 'Velocity synergy: Every wall bounce adds compounding speed and fury.' },
    { id: 'cryo', name: 'Blizzard Bounce', desc: 'Cryo synergy: Wall bounces spawn freezing frost shards.' },
    { id: 'critical', name: 'Angle Sniper', desc: 'Critical synergy: Severe-angle deflections deal guaranteed critical hits.' }
  ],
  quantum: [
    { id: 'velocity', name: 'Dimensional Warp', desc: 'Velocity synergy: Speed creates phantom duplicate balls.' },
    { id: 'gambler', name: 'Probability Collapse', desc: 'Gambler synergy: Quantum bets roll maximum jackpot multipliers.' },
    { id: 'drone', name: 'Phantom Fleet', desc: 'Drone synergy: Drones become invulnerable phase sentries.' }
  ],
  artillery: [
    { id: 'kinetic', name: 'Rail Impact', desc: 'Kinetic synergy: Charged railgun hits cause catastrophic shockwaves.' },
    { id: 'electro', name: 'EMP Mortar', desc: 'Electro synergy: Explosions release wide-area EMP stun waves.' },
    { id: 'critical', name: 'Hyper Railgun', desc: 'Critical synergy: Railgun beams split into 5 hyper-focused beams.' }
  ],
  gambler: [
    { id: 'quantum', name: 'Chaos Singularity', desc: 'Quantum synergy: High variance rolls open wild dimensional rifts.' },
    { id: 'velocity', name: 'High-Roller Rush', desc: 'Velocity synergy: Maximum speed triples all resource drops.' },
    { id: 'kinetic', name: 'Jackpot Smash', desc: 'Kinetic synergy: 777 rolls trigger instant screen-clearing fireworks.' }
  ],
  vampiric: [
    { id: 'juggernaut', name: 'Blood Bastion', desc: 'Juggernaut synergy: Absorbed shield hits convert into permanent hull repair pulses.' },
    { id: 'kinetic', name: 'Leech Impact', desc: 'Kinetic synergy: Shockwave deflections drain health from all targets hit.' },
    { id: 'chrono', name: 'Temporal Siphon', desc: 'Chrono synergy: Time-slowed targets bleed double siphon essence.' }
  ],
  pyro: [
    { id: 'electro', name: 'Plasma Combustion', desc: 'Electro synergy: Burning targets detonate into wide electrical chain explosions.' },
    { id: 'bio', name: 'Toxic Napalm', desc: 'Bio synergy: Acid and flame fuse into persistent acidic firestorms.' },
    { id: 'artillery', name: 'Hellfire Siege', desc: 'Artillery synergy: Railgun leaves incinerating magma scorched-earth trails.' }
  ],
  gravity: [
    { id: 'quantum', name: 'Event Horizon', desc: 'Quantum synergy: Graviton wells pull phase duplicates into crushing focal points.' },
    { id: 'drone', name: 'Orbital Siphon', desc: 'Drone synergy: Drones orbit the gravity well, raining focused plasma into the core.' },
    { id: 'chrono', name: 'Singularity Stasis', desc: 'Chrono synergy: Time freezes completely within the center of gravitational wells.' }
  ],
  chrono: [
    { id: 'critical', name: 'Temporal Execution', desc: 'Critical synergy: Hitting slowed targets guarantees critical devastating fractures.' },
    { id: 'velocity', name: 'Time-Slip Overdrive', desc: 'Velocity synergy: Exiting time dilation shoots the ball forward at hyper velocity.' },
    { id: 'vampiric', name: 'Stasis Leech', desc: 'Vampiric synergy: Slowed enemies continuously regenerate paddle energy shields.' }
  ],
  nanite: [
    { id: 'bio', name: 'Bio-Mechanical Plague', desc: 'Bio synergy: Nanites coat targets in corrosive acid that accelerates cell breakdown.' },
    { id: 'drone', name: 'Nanite Swarm Relay', desc: 'Drone synergy: Combat sentries deploy clouds of micro-nanite seekers on hit.' },
    { id: 'electro', name: 'EMP Micro-Swarm', desc: 'Electro synergy: Nanite clouds discharge high-frequency disruptive electrical arcs.' }
  ],
  stealth: [
    { id: 'critical', name: 'Shadow Assassination', desc: 'Critical synergy: Ambush strikes deal 4x critical damage and ignore armor.' },
    { id: 'quantum', name: 'Spectral Phantom', desc: 'Quantum synergy: Cloaking phases the paddle through incoming enemy bullets.' },
    { id: 'artillery', name: 'Hidden Railgun', desc: 'Artillery synergy: Uncloaking fires an instant charged siege beam with zero charge time.' }
  ],
  resonance: [
    { id: 'kinetic', name: 'Seismic Shock', desc: 'Kinetic synergy: Harmonic shatterwaves trigger secondary structural earthquake tremors.' },
    { id: 'ricochet', name: 'Acoustic Rebound', desc: 'Ricochet synergy: Wall bounces amplify sound waves, boosting shatter radius by 50%.' },
    { id: 'cryo', name: 'Resonant Shatter', desc: 'Cryo synergy: Frozen blocks instantly trigger catastrophic acoustic detonations.' }
  ],
  overclock: [
    { id: 'velocity', name: 'Hyper-Overdrive', desc: 'Velocity synergy: Overclocked heat accelerates ball speed to absolute maximum velocity.' },
    { id: 'pyro', name: 'Thermal Venting', desc: 'Pyro synergy: Venting heat unleashes a 360-degree wave of incinerating combustion fire.' },
    { id: 'electro', name: 'Overcharged Capacitor', desc: 'Electro synergy: Thermal overdrive electrifies paddle edges with continuous arc lightning.' }
  ],
  mirror: [
    { id: 'quantum', name: 'Kaleidoscope Warp', desc: 'Quantum synergy: Refracted light beams create persistent holographic ghost balls.' },
    { id: 'critical', name: 'Prismatic Laser', desc: 'Critical synergy: Center hits refract into 5 piercing pinpoint laser beams.' },
    { id: 'ricochet', name: 'Prism Geometry', desc: 'Ricochet synergy: Every wall bounce splits reflected lasers into rainbow sub-rays.' }
  ],
  plague: [
    { id: 'nanite', name: 'Contagion Hive', desc: 'Nanite synergy: Toxic miasma clouds rapidly spawn aggressive nanite parasites.' },
    { id: 'bio', name: 'Virulent Pandemic', desc: 'Bio synergy: Miasma clouds spread across adjacent rows, melting all enemy armor.' },
    { id: 'juggernaut', name: 'Caustic Armor', desc: 'Juggernaut synergy: Paddle takes zero damage while inside toxic miasma clouds.' }
  ],
  magnetic: [
    { id: 'ricochet', name: 'Vector Curve', desc: 'Ricochet synergy: Steered curved balls gain +30% velocity and damage on wall hits.' },
    { id: 'gravity', name: 'Polar Singularity', desc: 'Gravity synergy: Reversing paddle polarity creates a sudden outward repulsor shockwave.' },
    { id: 'artillery', name: 'Guided Mortar', desc: 'Artillery synergy: Heavy mortar projectiles curve toward the largest enemy cluster.' }
  ],
  solar: [
    { id: 'kinetic', name: 'Solar Flare Smash', desc: 'Kinetic synergy: Hard ball smashes trigger blinding solar flares that blind and scorch.' },
    { id: 'pyro', name: 'Thermonuclear Blaze', desc: 'Pyro synergy: Solar radiation ignites the entire arena in white-hot thermonuclear fire.' },
    { id: 'critical', name: 'Photonic Lance', desc: 'Critical synergy: Center hits discharge a continuous solar beam melting heavy targets.' }
  ],
  inventor: [
    { id: 'kinetic', name: 'Spring-Loaded Slam', desc: 'Kinetic synergy: Bumper springs multiply ball velocity by 2x and launch bouncy gears.' },
    { id: 'drone', name: 'Wrench Workshop', desc: 'Drone synergy: Support drones throw homing wrenches and repair damaged contraptions.' },
    { id: 'quantum', name: 'Unstable Prototype', desc: 'Quantum synergy: Experimental gizmos randomly duplicate into crazy phase machines.' }
  ]
};

// Synergy Thresholds
const SYNERGY_THRESHOLDS = {
  tier1: { count: 3, name: 'Synergy Level I', bonusText: '+15% Path Efficiency' },
  tier2: { count: 6, name: 'Synergy Level II', bonusText: '+30% Path Efficiency & Top Fusion Unlocks' },
  mastery: { count: 9, name: 'Path Mastery', bonusText: 'Maximum Mastery Bonus Active!' }
};

// ============================================================================
// 82 UNIQUE UPGRADES (12 General + 60 Path-Exclusive + 10 Hybrid)
// ============================================================================
const ARTIFACT_DEFINITIONS = {
  // --- GENERAL UPGRADES (12) ---
  reinforced_hull: {
    id: 'reinforced_hull',
    name: 'Reinforced Hull',
    rarity: 'common',
    archetype: 'general',
    tags: ['DEFENSE'],
    tier: 1,
    icon: '🛡️',
    desc: 'Increases Maximum HP by +1 and restores 1 HP immediately.'
  },
  adaptive_plating: {
    id: 'adaptive_plating',
    name: 'Adaptive Plating',
    rarity: 'rare',
    archetype: 'general',
    tags: ['DEFENSE'],
    tier: 2,
    icon: '🪖',
    desc: 'Absorbs 1 hit of damage every 25 seconds without consuming an Energy Shield.'
  },
  emergency_repair: {
    id: 'emergency_repair',
    name: 'Emergency Repair',
    rarity: 'rare',
    archetype: 'general',
    tags: ['UTILITY'],
    tier: 2,
    icon: '🩹',
    desc: 'Restores 1 HP upon clearing any Elite, Swarm, or Boss room.'
  },
  combo_processor: {
    id: 'combo_processor',
    name: 'Combo Processor',
    rarity: 'common',
    archetype: 'general',
    tags: ['UTILITY'],
    tier: 1,
    icon: '🔢',
    desc: 'Reaching a 5+ hit rally combo grants +2 bonus Cores per hit.'
  },
  artifact_amplifier: {
    id: 'artifact_amplifier',
    name: 'Artifact Amplifier',
    rarity: 'super_rare',
    archetype: 'general',
    tags: ['UTILITY'],
    tier: 2,
    icon: '💎',
    desc: 'Increases all passive stat bonuses and perk multipliers by +20%.'
  },
  credit_synthesizer: {
    id: 'credit_synthesizer',
    name: 'Credit Synthesizer',
    rarity: 'rare',
    archetype: 'general',
    tags: ['UTILITY'],
    tier: 1,
    icon: '💳',
    desc: 'Earn +25% bonus Cores from all destroyed enemies and room clears.'
  },
  reroll_protocol: {
    id: 'reroll_protocol',
    name: 'Reroll Protocol',
    rarity: 'common',
    archetype: 'general',
    tags: ['UTILITY'],
    tier: 1,
    icon: '🔄',
    desc: 'Grants +2 free Draft Rerolls per sector.'
  },
  salvage_matrix: {
    id: 'salvage_matrix',
    name: 'Salvage Matrix',
    rarity: 'rare',
    archetype: 'general',
    tags: ['UTILITY', 'DEFENSE'],
    tier: 2,
    icon: '⚙️',
    desc: 'Destroying elite enemies or sentinels drops a temporary Shield Shard.'
  },
  magnet_shard: {
    id: 'magnet_shard',
    name: 'Magnet Shard',
    rarity: 'common',
    archetype: 'general',
    tags: ['UTILITY'],
    tier: 1,
    icon: '🧲',
    desc: 'Magnetic field pulls dropped Cores and bonus power-ups directly to the paddle.'
  },
  core_overclock: {
    id: 'core_overclock',
    name: 'Core Overclock',
    rarity: 'common',
    archetype: 'general',
    tags: ['UTILITY'],
    tier: 1,
    icon: '⚡⚙️',
    desc: 'Active ability cooldowns recharge 30% faster.'
  },
  nanite_repair: {
    id: 'nanite_repair',
    name: 'Nanite Repair Matrix',
    rarity: 'super_rare',
    archetype: 'general',
    tags: ['DEFENSE'],
    tier: 2,
    icon: '🩹🤖',
    desc: 'Restores 1 HP if an entire room is cleared without taking any damage.'
  },
  inferno_ball: {
    id: 'inferno_ball',
    name: 'Inferno Core',
    rarity: 'legendary',
    archetype: 'general',
    tags: ['BALL', 'STATUS'],
    tier: 3,
    icon: '🔥',
    isUniqueBall: 'inferno',
    desc: 'Balls ignite into blazing fireballs that penetrate and burn through multiple targets! (Exclusive: 1x per run).'
  },

  // --- KINETIC (5) ---
  impact_core: {
    id: 'impact_core',
    name: 'Impact Core',
    rarity: 'common',
    archetype: 'kinetic',
    tags: ['KINETIC', 'BALL'],
    tier: 1,
    icon: '💥',
    desc: 'Paddle hits deal +40% impact damage and produce a louder concussive crack.',
    partner: 'titan_impact_perk',
    fusionId: 'titan_engine'
  },
  heavy_strike: {
    id: 'heavy_strike',
    name: 'Heavy Strike',
    rarity: 'rare',
    archetype: 'kinetic',
    tags: ['KINETIC'],
    tier: 2,
    icon: '🔨',
    desc: 'Deflections violently knock back swarm drones 100px and stun them for 1.0s.'
  },
  momentum_reactor: {
    id: 'momentum_reactor',
    name: 'Momentum Reactor',
    rarity: 'super_rare',
    archetype: 'kinetic',
    tags: ['KINETIC', 'AOE'],
    tier: 2,
    icon: '🌀💥',
    desc: 'Every 4th paddle deflection emits a 60px kinetic shockwave damaging nearby targets.'
  },
  kinetic_burst: {
    id: 'kinetic_burst',
    name: 'Kinetic Burst',
    rarity: 'rare',
    archetype: 'kinetic',
    tags: ['KINETIC', 'BALL'],
    tier: 2,
    icon: '💨💥',
    desc: 'Forward smash deflections gain +25% exit speed and penetrate the first block struck.',
    partner: 'iron_bastion',
    fusionId: 'titan_engine'
  },
  titan_impact_perk: {
    id: 'titan_impact_perk',
    name: 'Titan Impact',
    rarity: 'epic',
    archetype: 'kinetic',
    tags: ['KINETIC', 'AOE'],
    tier: 3,
    icon: '💣',
    desc: 'Smashed balls detonate violently on initial impact, dealing 5 AOE damage to all nearby blocks.',
    partner: 'impact_core',
    fusionId: 'titan_engine'
  },

  // --- VELOCITY (5) ---
  accelerator_shard: {
    id: 'accelerator_shard',
    name: 'Accelerator Shard',
    rarity: 'common',
    archetype: 'velocity',
    tags: ['VELOCITY', 'BALL'],
    tier: 1,
    icon: '⚡',
    desc: 'Ball gains +5% velocity with every consecutive bounce (capped at +60% max speed).'
  },
  supercruise_matrix: {
    id: 'supercruise_matrix',
    name: 'Supercruise Matrix',
    rarity: 'rare',
    archetype: 'velocity',
    tags: ['VELOCITY'],
    tier: 2,
    icon: '🚀',
    desc: 'High-speed balls leave a sonic wake that damages blocks and drones in adjacent lanes.'
  },
  sonic_boom_ball: {
    id: 'sonic_boom_ball',
    name: 'Sonic Boom Core',
    rarity: 'super_rare',
    archetype: 'velocity',
    tags: ['VELOCITY', 'BALL'],
    tier: 2,
    icon: '🔊⚡',
    desc: 'Balls traveling at extreme speed deal 2.5x base damage and shatter fragile bricks instantly.',
    partner: 'kinetic_burst',
    fusionId: 'velocity_breaker'
  },
  frictionless_core: {
    id: 'frictionless_core',
    name: 'Frictionless Core',
    rarity: 'rare',
    archetype: 'velocity',
    tags: ['VELOCITY'],
    tier: 2,
    icon: '🧊⚡',
    desc: 'Wall impacts no longer reduce ball speed; ball maintains peak velocity indefinitely.'
  },
  hyperspeed_coil: {
    id: 'hyperspeed_coil',
    name: 'Hyperspeed Coil',
    rarity: 'epic',
    archetype: 'velocity',
    tags: ['VELOCITY', 'BALL'],
    tier: 3,
    icon: '⚡👑',
    desc: 'At maximum ball speed, the ball spawns a trailing phantom afterimage that deals 50% damage.'
  },

  // --- CRITICAL / PRECISION (5) ---
  apex_calibrator: {
    id: 'apex_calibrator',
    name: 'Apex Calibrator',
    rarity: 'common',
    archetype: 'critical',
    tags: ['CRITICAL', 'PRECISION'],
    tier: 1,
    icon: '🎯',
    desc: 'Center paddle deflections trigger a guaranteed 2.5x critical hit with a neon impact flash.',
    partner: 'chronos_rift',
    fusionId: 'phase_strike'
  },
  weakpoint_scanner: {
    id: 'weakpoint_scanner',
    name: 'Weakpoint Scanner',
    rarity: 'rare',
    archetype: 'critical',
    tags: ['CRITICAL'],
    tier: 2,
    icon: '🔍',
    desc: 'Scans target defenses, granting +35% critical strike chance across all paddle angles.'
  },
  precision_lens: {
    id: 'precision_lens',
    name: 'Precision Lens',
    rarity: 'super_rare',
    archetype: 'critical',
    tags: ['CRITICAL', 'PROJECTILE'],
    tier: 2,
    icon: '💎🎯',
    desc: 'Critical strikes fire 3 piercing neon laser shards forward into the room.',
    partner: 'kinetic_battery',
    fusionId: 'hyper_railgun'
  },
  razor_edge: {
    id: 'razor_edge',
    name: 'Razor Edge',
    rarity: 'rare',
    archetype: 'critical',
    tags: ['CRITICAL', 'PRECISION'],
    tier: 2,
    icon: '📐',
    desc: 'Extreme paddle edge deflections carve 25% sharper angles, slipping behind defenses.'
  },
  critical_cascade: {
    id: 'critical_cascade',
    name: 'Critical Cascade',
    rarity: 'epic',
    archetype: 'critical',
    tags: ['CRITICAL'],
    tier: 3,
    icon: '✨🎯',
    desc: 'Each consecutive critical strike increases your critical damage multiplier by +0.5x (max 5.0x).'
  },

  // --- JUGGERNAUT (5) ---
  iron_bastion: {
    id: 'iron_bastion',
    name: 'Iron Bastion',
    rarity: 'common',
    archetype: 'juggernaut',
    tags: ['DEFENSE'],
    tier: 1,
    icon: '🧱',
    desc: '+15% paddle width and +1 Max HP, providing wider coverage against leaking balls.',
    partner: 'fortress_core',
    fusionId: 'fortress_protocol'
  },
  reactive_armor: {
    id: 'reactive_armor',
    name: 'Reactive Armor',
    rarity: 'rare',
    archetype: 'juggernaut',
    tags: ['DEFENSE', 'AOE'],
    tier: 2,
    icon: '🛡️💥',
    desc: 'Taking damage triggers an instant kinetic blast that obliterates all nearby enemy bullets.'
  },
  aegis_converter: {
    id: 'aegis_converter',
    name: 'Aegis Converter',
    rarity: 'super_rare',
    archetype: 'juggernaut',
    tags: ['DEFENSE', 'PROJECTILE'],
    tier: 2,
    icon: '🛡️⚡',
    desc: 'When an Energy Shield blocks damage or saves a ball, fire 4 retaliation laser bolts forward!',
    partner: 'spike_plating',
    fusionId: 'kinetic_retaliator'
  },
  nano_plating: {
    id: 'nano_plating',
    name: 'Nano Plating',
    rarity: 'rare',
    archetype: 'juggernaut',
    tags: ['DEFENSE'],
    tier: 2,
    icon: '🛡️🔧',
    desc: 'Reduces damage received from Elite drone shots and boss lasers by 1 (minimum 1).'
  },
  fortress_core: {
    id: 'fortress_core',
    name: 'Fortress Core',
    rarity: 'epic',
    archetype: 'juggernaut',
    tags: ['DEFENSE'],
    tier: 3,
    icon: '🏰',
    desc: 'When reduced to 1 HP, automatically recharges an Energy Shield shard every 15s.',
    partner: 'iron_bastion',
    fusionId: 'fortress_protocol'
  },

  // --- DRONE COMMAND (5) ---
  nano_sentry: {
    id: 'nano_sentry',
    name: 'Nano Sentry Drone',
    rarity: 'rare',
    archetype: 'drone',
    tags: ['DRONE', 'PROJECTILE'],
    tier: 1,
    icon: '🛸',
    desc: 'Orbits the paddle and fires targeted laser blasts at the nearest enemy every 2.5s.',
    partner: 'defense_satellite',
    fusionId: 'arc_fleet'
  },
  defense_satellite: {
    id: 'defense_satellite',
    name: 'Defense Satellite',
    rarity: 'super_rare',
    archetype: 'drone',
    tags: ['DRONE', 'DEFENSE'],
    tier: 1,
    icon: '🛰️',
    desc: 'Trails behind the paddle baseline and catches stray balls that slip past your guard.',
    partner: 'guardian_interceptor',
    fusionId: 'guardian_network'
  },
  drone_overclock: {
    id: 'drone_overclock',
    name: 'Drone Overclock',
    rarity: 'rare',
    archetype: 'drone',
    tags: ['DRONE'],
    tier: 2,
    icon: '⚙️🛸',
    desc: 'All autonomous drones fire 50% faster and automatically prioritize lowest-HP targets.',
    partner: 'seeker_missiles',
    fusionId: 'orbital_strike_matrix'
  },
  seeker_missiles: {
    id: 'seeker_missiles',
    name: 'Seeker Missiles',
    rarity: 'epic',
    archetype: 'drone',
    tags: ['DRONE', 'AOE'],
    tier: 3,
    icon: '🚀🛸',
    desc: 'Every 5th drone shot launches a homing micro-rocket dealing 3 damage with a 50px blast.',
    partner: 'drone_overclock',
    fusionId: 'orbital_strike_matrix'
  },
  guardian_interceptor: {
    id: 'guardian_interceptor',
    name: 'Guardian Interceptor',
    rarity: 'super_rare',
    archetype: 'drone',
    tags: ['DRONE', 'DEFENSE'],
    tier: 2,
    icon: '🛸🛡️',
    desc: 'Combat drone actively flies into incoming enemy bullets to intercept and neutralize them.',
    partner: 'defense_satellite',
    fusionId: 'guardian_network'
  },

  // --- BIO-CORROSION (5) ---
  bio_residue: {
    id: 'bio_residue',
    name: 'Bio-Residue Trail',
    rarity: 'rare',
    archetype: 'bio',
    tags: ['BIO', 'STATUS'],
    tier: 1,
    icon: '☣️',
    desc: 'Balls leave a toxic trail inflicting controlled acid DoT (1 dmg / 1.2s for 3s).',
    partner: 'contagion_core',
    fusionId: 'pandemic_outbreak'
  },
  contagion_core: {
    id: 'contagion_core',
    name: 'Contagion Core',
    rarity: 'epic',
    archetype: 'bio',
    tags: ['BIO', 'STATUS'],
    tier: 2,
    icon: '🦠',
    desc: 'When a poisoned target is destroyed, infects up to 2 adjacent targets (max chain depth 2).',
    partner: 'bio_residue',
    fusionId: 'pandemic_outbreak'
  },
  corrosive_coating: {
    id: 'corrosive_coating',
    name: 'Corrosive Coating',
    rarity: 'super_rare',
    archetype: 'bio',
    tags: ['BIO'],
    tier: 3,
    icon: '🧫',
    desc: 'Acid DoT permanently strips the armor from Titanium blocks and Elite drones.'
  },
  acid_mists: {
    id: 'acid_mists',
    name: 'Acid Mists',
    rarity: 'rare',
    archetype: 'bio',
    tags: ['BIO', 'AOE'],
    tier: 2,
    icon: '🧪💨',
    desc: 'Acid DoT ticks 35% faster and creates caustic vapor clouds that erode nearby targets.'
  },
  neurotoxin_injector: {
    id: 'neurotoxin_injector',
    name: 'Neurotoxin Injector',
    rarity: 'super_rare',
    archetype: 'bio',
    tags: ['BIO', 'STATUS'],
    tier: 2,
    icon: '💉☣️',
    desc: 'Poisoned drones have their flight speed reduced by 30% and weapon recharge delayed.'
  },

  // --- CRYO (5) ---
  frostbite_core: {
    id: 'frostbite_core',
    name: 'Frostbite Core',
    rarity: 'rare',
    archetype: 'cryo',
    tags: ['CRYO', 'STATUS'],
    tier: 1,
    icon: '❄️',
    desc: 'Balls apply frost. Stacking 2 frost stacks freezes enemies solid for 3.0 seconds.',
    partner: 'toxic_catalyst',
    fusionId: 'absolute_zero'
  },
  cryo_lance: {
    id: 'cryo_lance',
    name: 'Cryo Lance',
    rarity: 'super_rare',
    archetype: 'cryo',
    tags: ['CRYO'],
    tier: 2,
    icon: '🧊🎯',
    desc: 'Hitting a frozen target deals 3x shatter burst damage and breaks the ice into shrapnel.'
  },
  permafrost_field: {
    id: 'permafrost_field',
    name: 'Permafrost Field',
    rarity: 'rare',
    archetype: 'cryo',
    tags: ['CRYO', 'AOE'],
    tier: 2,
    icon: '❄️🌐',
    desc: 'Frozen enemies emit chilling auras that slow all nearby foes by 50%.'
  },
  ice_spikes: {
    id: 'ice_spikes',
    name: 'Ice Spikes',
    rarity: 'epic',
    archetype: 'cryo',
    tags: ['CRYO', 'PROJECTILE'],
    tier: 3,
    icon: '🧊💥',
    desc: 'Shattered frozen targets explode into 4 piercing ice shards that fly outward.'
  },
  subzero_coating: {
    id: 'subzero_coating',
    name: 'Sub-Zero Coating',
    rarity: 'super_rare',
    archetype: 'cryo',
    tags: ['CRYO', 'BALL'],
    tier: 2,
    icon: '❄️⚡',
    desc: 'Center paddle deflections instantly coat the ball in ice, freezing the next target struck.'
  },

  // --- ELECTROMAGNETIC (5) ---
  tesla_coil: {
    id: 'tesla_coil',
    name: 'Tesla Coil',
    rarity: 'rare',
    archetype: 'electro',
    tags: ['ELECTRO', 'AOE'],
    tier: 1,
    icon: '⚡',
    desc: 'Deflections build electrical charge; releases chain lightning hitting up to 3 nearby enemies.',
    partner: 'defense_satellite',
    fusionId: 'arc_fleet'
  },
  arc_discharge: {
    id: 'arc_discharge',
    name: 'Arc Discharge',
    rarity: 'rare',
    archetype: 'electro',
    tags: ['ELECTRO'],
    tier: 2,
    icon: '⚡💥',
    desc: 'Destroying electrified targets zaps all adjacent enemies for 2 shock damage.'
  },
  emp_burst: {
    id: 'emp_burst',
    name: 'EMP Burst',
    rarity: 'super_rare',
    archetype: 'electro',
    tags: ['ELECTRO', 'STATUS'],
    tier: 2,
    icon: '⚡📴',
    desc: 'Chain lightning temporarily disables enemy turrets and laser sentinels for 4.0s.'
  },
  voltage_spike: {
    id: 'voltage_spike',
    name: 'Voltage Spike',
    rarity: 'common',
    archetype: 'electro',
    tags: ['ELECTRO'],
    tier: 1,
    icon: '⚡📈',
    desc: 'Increases all electrical arc damage and shockwave damage by +50%.'
  },
  superconductor: {
    id: 'superconductor',
    name: 'Superconductor',
    rarity: 'epic',
    archetype: 'electro',
    tags: ['ELECTRO'],
    tier: 3,
    icon: '⚡🔋',
    desc: 'Chain lightning jumps an additional +1 target (max 4) and has 40% increased range.'
  },

  // --- RICOCHET (5) ---
  geometric_trajectory: {
    id: 'geometric_trajectory',
    name: 'Geometric Trajectory',
    rarity: 'common',
    archetype: 'ricochet',
    tags: ['RICOCHET', 'BALL'],
    tier: 1,
    icon: '📐',
    desc: 'Every wall bounce increases ball damage by +20% for 3 seconds.'
  },
  wall_resonance: {
    id: 'wall_resonance',
    name: 'Wall Resonance',
    rarity: 'rare',
    archetype: 'ricochet',
    tags: ['RICOCHET', 'AOE'],
    tier: 2,
    icon: '🧱⚡',
    desc: 'Every 2nd arena wall bounce emits a shockwave damaging adjacent blocks along the perimeter.'
  },
  ricochet_shrapnel: {
    id: 'ricochet_shrapnel',
    name: 'Ricochet Shrapnel',
    rarity: 'super_rare',
    archetype: 'ricochet',
    tags: ['RICOCHET', 'PROJECTILE'],
    tier: 2,
    icon: '💥🪃',
    desc: 'Wall impacts spray 3 piercing shrapnel needles forward across the arena.',
    partner: 'precision_calibrator',
    fusionId: 'critical_ricochet'
  },
  corner_trap: {
    id: 'corner_trap',
    name: 'Corner Trap',
    rarity: 'rare',
    archetype: 'ricochet',
    tags: ['RICOCHET'],
    tier: 2,
    icon: '🪃📐',
    desc: 'Balls ricocheting in corners gain double momentum and cannot be absorbed by shields.'
  },
  pinball_accelerator: {
    id: 'pinball_accelerator',
    name: 'Pinball Accelerator',
    rarity: 'epic',
    archetype: 'ricochet',
    tags: ['RICOCHET', 'BALL'],
    tier: 3,
    icon: '🎰🪃',
    desc: 'Chaining 3 wall bounces without paddle contact triggers a massive pinball multiball burst.'
  },

  // --- QUANTUM (5) ---
  quantum_cluster: {
    id: 'quantum_cluster',
    name: 'Quantum Cluster',
    rarity: 'super_rare',
    archetype: 'quantum',
    tags: ['QUANTUM', 'BALL'],
    tier: 1,
    icon: '🌀',
    desc: 'Every 4-hit rally combo spawns 2 mini phantom balls that break 1 target each.',
    partner: 'echo_chamber',
    fusionId: 'fractal_resonator'
  },
  echo_chamber: {
    id: 'echo_chamber',
    name: 'Echo Chamber',
    rarity: 'epic',
    archetype: 'quantum',
    tags: ['QUANTUM'],
    tier: 2,
    icon: '🔊🌀',
    desc: 'For every active ball on screen, ALL balls deal +20% bonus damage.',
    partner: 'quantum_cluster',
    fusionId: 'fractal_resonator'
  },
  gravity_well: {
    id: 'gravity_well',
    name: 'Gravity Well Inverter',
    rarity: 'super_rare',
    archetype: 'quantum',
    tags: ['QUANTUM', 'DEFENSE'],
    tier: 2,
    icon: '🧲🌀',
    desc: 'Balls slipping perilously close to the bottom baseline receive an inward magnetic correction push.',
    partner: 'chronos_rift',
    fusionId: 'dimensional_collapse'
  },
  chronos_rift: {
    id: 'chronos_rift',
    name: 'Chronos Rift',
    rarity: 'rare',
    archetype: 'quantum',
    tags: ['QUANTUM', 'STATUS'],
    tier: 2,
    icon: '⏳🌀',
    desc: 'Paddle edge deflections open a temporal rift that slows enemy bullets by 60%.',
    partner: 'apex_calibrator',
    fusionId: 'phase_strike'
  },
  phase_inversion: {
    id: 'phase_inversion',
    name: 'Phase Inversion',
    rarity: 'epic',
    archetype: 'quantum',
    tags: ['QUANTUM', 'BALL'],
    tier: 3,
    icon: '🌌🌀',
    desc: 'Phantom balls deal 100% full damage and phase unhindered through all solid barriers.',
    partner: 'reflex_core',
    fusionId: 'blink_assault'
  },

  // --- ARTILLERY (5) ---
  kinetic_battery: {
    id: 'kinetic_battery',
    name: 'Kinetic Battery',
    rarity: 'rare',
    archetype: 'artillery',
    tags: ['ARTILLERY', 'PROJECTILE'],
    tier: 1,
    icon: '🔋🚀',
    desc: 'Paddle deflections charge a Railgun meter (+20%). At 100%, fire a piercing hyper-beam!',
    partner: 'precision_lens',
    fusionId: 'hyper_railgun'
  },
  high_explosive_shells: {
    id: 'high_explosive_shells',
    name: 'High-Explosive Shells',
    rarity: 'super_rare',
    archetype: 'artillery',
    tags: ['ARTILLERY', 'AOE'],
    tier: 2,
    icon: '💣🚀',
    desc: 'Smashed balls explode with a 75px blast radius upon striking the backline.'
  },
  siege_calibrator: {
    id: 'siege_calibrator',
    name: 'Siege Calibrator',
    rarity: 'epic',
    archetype: 'artillery',
    tags: ['ARTILLERY'],
    tier: 3,
    icon: '🔭🚀',
    desc: 'Railgun beam pierces through ALL targets in a straight row without losing damage.'
  },
  mortar_blast: {
    id: 'mortar_blast',
    name: 'Mortar Blast',
    rarity: 'rare',
    archetype: 'artillery',
    tags: ['ARTILLERY', 'AOE'],
    tier: 2,
    icon: '💥🚀',
    desc: 'Every 5th paddle deflection launches an explosive mortar shell into the deepest enemy row.'
  },
  heavy_ordnance: {
    id: 'heavy_ordnance',
    name: 'Heavy Ordnance',
    rarity: 'common',
    archetype: 'artillery',
    tags: ['ARTILLERY'],
    tier: 1,
    icon: '🚀💥',
    desc: 'Increases the damage and explosion radius of all mortar and railgun blasts by +50%.'
  },

  // --- GAMBLER / CHAOS (5) ---
  loaded_dice: {
    id: 'loaded_dice',
    name: 'Loaded Dice',
    rarity: 'rare',
    archetype: 'gambler',
    tags: ['GAMBLER'],
    tier: 1,
    icon: '🎲✨',
    desc: 'Damage variance floor is raised: rolls fluctuate between 1.0x and 3.5x multiplier.',
    partner: 'chaos_vortex',
    fusionId: 'probability_singularity'
  },
  high_roller_core: {
    id: 'high_roller_core',
    name: 'High-Roller Core',
    rarity: 'super_rare',
    archetype: 'gambler',
    tags: ['GAMBLER', 'UTILITY'],
    tier: 2,
    icon: '💎🎲',
    desc: 'Casino spins cost 50% fewer Cores and guarantee at least +1 tier higher rewards.'
  },
  chaos_vortex: {
    id: 'chaos_vortex',
    name: 'Chaos Vortex',
    rarity: 'epic',
    archetype: 'gambler',
    tags: ['GAMBLER', 'AOE'],
    tier: 3,
    icon: '🌀🎲',
    desc: '10% chance per hit to trigger screen-clearing neon fireworks that deal 10 damage to all foes.',
    partner: 'loaded_dice',
    fusionId: 'probability_singularity'
  },
  lucky_streak: {
    id: 'lucky_streak',
    name: 'Lucky Streak',
    rarity: 'rare',
    archetype: 'gambler',
    tags: ['GAMBLER', 'DEFENSE'],
    tier: 2,
    icon: '🍀🎲',
    desc: 'Deflecting 5 balls without dropping any grants a temporary Shield Shard.'
  },
  wildcard_matrix: {
    id: 'wildcard_matrix',
    name: 'Wildcard Matrix',
    rarity: 'super_rare',
    archetype: 'gambler',
    tags: ['GAMBLER'],
    tier: 2,
    icon: '🃏🎲',
    desc: 'Every floor draft guarantees at least 1 heavily discounted Epic or Legendary upgrade choice.'
  },

  // --- HYBRID CROSS-PATH UPGRADES (10) ---
  precision_impact: {
    id: 'precision_impact',
    name: 'Precision Impact',
    rarity: 'super_rare',
    archetype: 'hybrid',
    tags: ['KINETIC', 'CRITICAL'],
    tier: 2,
    icon: '🎯💥',
    desc: 'Critical strikes release concussive kinetic shockwaves, fracturing adjacent blocks.'
  },
  frozen_pinball: {
    id: 'frozen_pinball',
    name: 'Frozen Pinball',
    rarity: 'super_rare',
    archetype: 'hybrid',
    tags: ['CRYO', 'RICOCHET'],
    tier: 2,
    icon: '❄️🪃',
    desc: 'Wall ricochets spray freezing ice needles forward, chilling targets along the path.',
    partner: 'permafrost_field',
    fusionId: 'frozen_pinball_fusion'
  },
  emp_fleet: {
    id: 'emp_fleet',
    name: 'EMP Fleet',
    rarity: 'epic',
    archetype: 'hybrid',
    tags: ['DRONE', 'ELECTRO'],
    tier: 2,
    icon: '🛸⚡',
    desc: 'Combat drones periodically discharge chain EMP pulses that shock and stun clusters.'
  },
  plague_winter: {
    id: 'plague_winter',
    name: 'Plague Winter',
    rarity: 'epic',
    archetype: 'hybrid',
    tags: ['BIO', 'CRYO'],
    tier: 3,
    icon: '☣️❄️',
    desc: 'Shattered frozen targets explode into toxic corrosive clouds, spreading acid to nearby foes.'
  },
  phase_momentum: {
    id: 'phase_momentum',
    name: 'Phase Momentum',
    rarity: 'super_rare',
    archetype: 'hybrid',
    tags: ['QUANTUM', 'VELOCITY'],
    tier: 2,
    icon: '🌀⚡',
    desc: 'Balls traveling at extreme speeds temporarily phase through solid barriers.'
  },
  rail_impact: {
    id: 'rail_impact',
    name: 'Rail Impact',
    rarity: 'epic',
    archetype: 'hybrid',
    tags: ['ARTILLERY', 'KINETIC'],
    tier: 3,
    icon: '🚀💥',
    desc: 'Charged Railgun beams trigger a massive kinetic earthquake that stuns all drones.'
  },
  probability_collapse: {
    id: 'probability_collapse',
    name: 'Probability Collapse',
    rarity: 'legendary',
    archetype: 'hybrid',
    tags: ['GAMBLER', 'QUANTUM'],
    tier: 3,
    icon: '🎲🌀',
    desc: '15% chance per room clear to trigger an automatic free Cyber Jackpot spin!'
  },
  fortified_fleet: {
    id: 'fortified_fleet',
    name: 'Fortified Fleet',
    rarity: 'super_rare',
    archetype: 'hybrid',
    tags: ['JUGGERNAUT', 'DRONE'],
    tier: 2,
    icon: '🛡️🛸',
    desc: 'Drones actively sacrifice their chassis to block fatal damage when player is at 1 HP.'
  },
  chain_ricochet: {
    id: 'chain_ricochet',
    name: 'Chain Ricochet',
    rarity: 'rare',
    archetype: 'hybrid',
    tags: ['ELECTRO', 'RICOCHET'],
    tier: 2,
    icon: '⚡🪃',
    desc: 'Each wall bounce unleashes a chain spark hitting up to 2 nearby enemies.'
  },
  toxic_artillery: {
    id: 'toxic_artillery',
    name: 'Toxic Artillery',
    rarity: 'epic',
    archetype: 'hybrid',
    tags: ['BIO', 'ARTILLERY'],
    tier: 3,
    icon: '☣️🚀',
    desc: 'Mortar shells leave bubbling corrosive acid puddles that dissolve armor over 4.0s.'
  },
  nano_repair_swarm: {
    id: 'nano_repair_swarm',
    name: 'Nanite Repair Swarm',
    rarity: 'rare',
    archetype: 'defense',
    tags: ['DEFENSE', 'DRONE'],
    tier: 2,
    icon: '🩹🛸',
    desc: 'Drones release nanite repair pulses restoring 1 HP after completing 3 waves without hull damage.'
  },
  superconductor_rails: {
    id: 'superconductor_rails',
    name: 'Superconductor Rails',
    rarity: 'rare',
    archetype: 'velocity',
    tags: ['ELECTRO', 'VELOCITY'],
    tier: 2,
    icon: '⚡🚄',
    desc: 'Wall deflections boost ball velocity by +15% and electrify paddle edge for 3s.'
  },
  cryo_minefield: {
    id: 'cryo_minefield',
    name: 'Cryo Minefield',
    rarity: 'rare',
    archetype: 'cryo',
    tags: ['CRYO', 'TRAP'],
    tier: 2,
    icon: '❄️💣',
    desc: 'Ball collisions leave stationary cryogenic mines that freeze passing hostiles.'
  },
  singularity_lens: {
    id: 'singularity_lens',
    name: 'Singularity Lens',
    rarity: 'epic',
    archetype: 'critical',
    tags: ['QUANTUM', 'CRITICAL'],
    tier: 3,
    icon: '🌌🎯',
    desc: 'Critical center deflections bend space, drawing all active balls into focused laser convergence.'
  },
  reactive_overplating: {
    id: 'reactive_overplating',
    name: 'Reactive Overplating',
    rarity: 'rare',
    archetype: 'defense',
    tags: ['DEFENSE', 'JUGGERNAUT'],
    tier: 2,
    icon: '🛡️⚡',
    desc: 'Converts 25% of absorbed shield damage into immediate bonus ball velocity and smash power.'
  },
  phantom_payload: {
    id: 'phantom_payload',
    name: 'Phantom Payload',
    rarity: 'rare',
    archetype: 'quantum',
    tags: ['QUANTUM', 'ARTILLERY'],
    tier: 2,
    icon: '🔮🚀',
    desc: 'Phased phantom balls fire micro-missiles upon disintegrating.'
  },
  emp_resonance: {
    id: 'emp_resonance',
    name: 'EMP Resonance Tuner',
    rarity: 'rare',
    archetype: 'electromagnetic',
    tags: ['ELECTRO', 'CONTROL'],
    tier: 2,
    icon: '📡⚡',
    desc: 'EMP shockwaves disable enemy weapon tracking and deflect incoming projectiles for 2.5s.'
  },
  acid_bloom: {
    id: 'acid_bloom',
    name: 'Acid Bloom Spores',
    rarity: 'rare',
    archetype: 'bio',
    tags: ['BIO', 'CHAOS'],
    tier: 2,
    icon: '🧪🌸',
    desc: 'Corrosive targets detonate on destruction, spraying acidic spores in a 90px radius.'
  },
  tachyon_accelerator: {
    id: 'tachyon_accelerator',
    name: 'Tachyon Accelerator',
    rarity: 'epic',
    archetype: 'velocity',
    tags: ['VELOCITY', 'QUANTUM'],
    tier: 3,
    icon: '⏩✨',
    desc: 'Balls reaching Mach 3 phase through unbreakable barriers and strike rear vulnerability cores.'
  },
  aegis_battery: {
    id: 'aegis_battery',
    name: 'Aegis Discharge Battery',
    rarity: 'rare',
    archetype: 'defense',
    tags: ['DEFENSE', 'ELECTRO'],
    tier: 2,
    icon: '🔰🔋',
    desc: 'Shield charges periodically discharge arc lightning at the closest threat every 3.0s.'
  },
  hyper_combustion: {
    id: 'hyper_combustion',
    name: 'Hyper Combustion Unit',
    rarity: 'rare',
    archetype: 'kinetic',
    tags: ['FIRE', 'IMPACT'],
    tier: 2,
    icon: '🔥💥',
    desc: 'Smash deflections trigger thermal explosions on brick contact, igniting adjacent rows.'
  },
  vortex_core: {
    id: 'vortex_core',
    name: 'Magnetic Vortex Core',
    rarity: 'rare',
    archetype: 'control',
    tags: ['GRAVITY', 'CONTROL'],
    tier: 2,
    icon: '🌀🧲',
    desc: 'Paddle pulls floating energy orbs, gems, and chips from up to 250px away.'
  },
  temporal_echo: {
    id: 'temporal_echo',
    name: 'Temporal Mirage Echo',
    rarity: 'epic',
    archetype: 'quantum',
    tags: ['CHRONO', 'QUANTUM'],
    tier: 3,
    icon: '⏳👥',
    desc: 'Spawns a ghostly mirror paddle that mirrors your movement and deflects balls on the top rim.'
  },
  shrapnel_matrix: {
    id: 'shrapnel_matrix',
    name: 'Shrapnel Matrix',
    rarity: 'rare',
    archetype: 'kinetic',
    tags: ['KINETIC', 'RICOCHET'],
    tier: 2,
    icon: '💥🪃',
    desc: 'Brick destructions splinter into 3 kinetic ricochet pellets that damage secondary targets.'
  },
  frost_dynamo: {
    id: 'frost_dynamo',
    name: 'Frost Dynamo',
    rarity: 'rare',
    archetype: 'cryo',
    tags: ['CRYO', 'ENERGY'],
    tier: 2,
    icon: '❄️⚡',
    desc: 'Hitting frozen enemies generates +5 Overcharge energy and restores 10% ability cooldown.'
  },
  gamblers_catalyst: {
    id: 'gamblers_catalyst',
    name: "Gambler's Catalyst",
    rarity: 'rare',
    archetype: 'chaos',
    tags: ['CHAOS', 'GAMBLER'],
    tier: 2,
    icon: '🎲🔥',
    desc: 'Every 7th hit rolls random critical damage between 2.0x and 5.0x.'
  },
  sentinel_overdrive: {
    id: 'sentinel_overdrive',
    name: 'Sentinel Overdrive Core',
    rarity: 'epic',
    archetype: 'drone',
    tags: ['DRONE', 'CHAOS'],
    tier: 3,
    icon: '🛸⚡',
    desc: 'When entering Overdrive, all active drones enter frenzy mode, firing rapid plasma bursts.'
  },
  plasma_conduit: {
    id: 'plasma_conduit',
    name: 'Plasma Conduit Lens',
    rarity: 'rare',
    archetype: 'artillery',
    tags: ['ENERGY', 'ARTILLERY'],
    tier: 2,
    icon: '⚡🔋',
    desc: 'Energy beams pierce through the first 2 enemies struck without losing momentum.'
  },
  corrosive_coating: {
    id: 'corrosive_coating',
    name: 'Corrosive Hull Coating',
    rarity: 'rare',
    archetype: 'bio',
    tags: ['BIO', 'KINETIC'],
    tier: 2,
    icon: '🧪🛡️',
    desc: 'Paddle gains corrosive barrier; colliding hostiles take continuous acid burn.'
  },
  photon_ricochet: {
    id: 'photon_ricochet',
    name: 'Photon Prism Ricochet',
    rarity: 'epic',
    archetype: 'critical',
    tags: ['CRITICAL', 'RICOCHET'],
    tier: 3,
    icon: '💎🪃',
    desc: 'Ricochet beams gain +25% crit chance per bounce, up to a maximum of 100% crit.'
  },
  overclock_stabilizer: {
    id: 'overclock_stabilizer',
    name: 'Overclock Thermal Sink',
    rarity: 'rare',
    archetype: 'control',
    tags: ['CONTROL', 'TECH'],
    tier: 2,
    icon: '⚙️⏱️',
    desc: 'Reduces heat accumulation and cooldown penalty during continuous paddle boost.'
  },
  void_siphon: {
    id: 'void_siphon',
    name: 'Void Core Siphon',
    rarity: 'epic',
    archetype: 'quantum',
    tags: ['QUANTUM', 'ECONOMY'],
    tier: 3,
    icon: '🌌💾',
    desc: 'Pulverizing boss nodes yields double Data Chips and siphons temporary barrier energy.'
  },
  magnetic_blast: {
    id: 'magnetic_blast',
    name: 'Magnetic Repulsor Wave',
    rarity: 'rare',
    archetype: 'control',
    tags: ['GRAVITY', 'IMPACT'],
    tier: 2,
    icon: '🧲💥',
    desc: 'Releasing gravity pull produces a concussive shockwave pushing hostiles backward.'
  },
  cryo_containment: {
    id: 'cryo_containment',
    name: 'Cryo Containment Field',
    rarity: 'epic',
    archetype: 'cryo',
    tags: ['CRYO', 'DEFENSE'],
    tier: 3,
    icon: '🧊🛡️',
    desc: 'Upon taking damage, instantly flash-freezes all screen hostiles for 2.0s.'
  },
  apex_predator: {
    id: 'apex_predator',
    name: 'Apex Sovereign Matrix',
    rarity: 'legendary',
    archetype: 'critical',
    tags: ['CRITICAL', 'VELOCITY'],
    tier: 3,
    icon: '👑⚡',
    desc: 'At maximum ball speed, all strikes are guaranteed critical hits with 2.5x damage.'
  },

  // --- VERSION 2.0 EXPANSION UPGRADES (28 NEW) ---
  chronos_accelerator: {
    id: 'chronos_accelerator',
    name: 'Chronos Accelerator',
    rarity: 'rare',
    archetype: 'velocity',
    tags: ['VELOCITY', 'TIME'],
    tier: 2,
    icon: '⏳⚡',
    desc: '+15% ball acceleration on paddle curve deflects and +0.5s bullet slow field on near-miss.'
  },
  hyper_resonator: {
    id: 'hyper_resonator',
    name: 'Hyper Resonator',
    rarity: 'epic',
    archetype: 'kinetic',
    tags: ['KINETIC', 'AOE'],
    tier: 3,
    icon: '🔊💥',
    desc: 'Consecutive paddle strikes amplify screen vibration and deal +25% kinetic splash to neighboring nodes.'
  },
  aegis_bulwark: {
    id: 'aegis_bulwark',
    name: 'Aegis Bulwark',
    rarity: 'epic',
    archetype: 'juggernaut',
    tags: ['DEFENSE', 'SHIELD'],
    tier: 3,
    icon: '🔰🧱',
    desc: '+20% paddle width and shields absorb 1 additional projectile before depleting.'
  },
  subzero_cryo_cells: {
    id: 'subzero_cryo_cells',
    name: 'Subzero Cryo Cells',
    rarity: 'rare',
    archetype: 'cryo',
    tags: ['CRYO', 'STATUS'],
    tier: 2,
    icon: '❄️🔋',
    desc: 'Cryo freeze duration extended by +1.5s; frozen targets take +35% impact damage.'
  },
  singularity_capacitor: {
    id: 'singularity_capacitor',
    name: 'Singularity Capacitor',
    rarity: 'legendary',
    archetype: 'quantum',
    tags: ['QUANTUM', 'ENERGY'],
    tier: 3,
    icon: '🌌🧲',
    desc: 'Every 100 energy gathered releases a miniature black hole pulling nearby bullets and chips.'
  },
  plasma_overdrive: {
    id: 'plasma_overdrive',
    name: 'Plasma Overdrive',
    rarity: 'rare',
    archetype: 'general',
    tags: ['ATTACK', 'PLASMA'],
    tier: 2,
    icon: '🔥⚡',
    desc: 'Overdrive mode shoots forward twin thermal plasma darts every 0.5s.'
  },
  tactical_nanoswarm: {
    id: 'tactical_nanoswarm',
    name: 'Tactical Nanoswarm',
    rarity: 'epic',
    archetype: 'drone',
    tags: ['DRONE', 'DEFENSE'],
    tier: 3,
    icon: '🛸🛡️',
    desc: 'Deploys 2 escort micro-drones that automatically intercept enemy bullets.'
  },
  bismuth_alloy: {
    id: 'bismuth_alloy',
    name: 'Bismuth Alloy Plating',
    rarity: 'common',
    archetype: 'juggernaut',
    tags: ['DEFENSE'],
    tier: 1,
    icon: '🧱✨',
    desc: '+10% paddle collision width and reduces knockback from heavy impact.'
  },
  supercluster_prism: {
    id: 'supercluster_prism',
    name: 'Supercluster Prism',
    rarity: 'epic',
    archetype: 'critical',
    tags: ['CRITICAL', 'BEAM'],
    tier: 3,
    icon: '💎✨',
    desc: 'Critical hits split light into 3 refraction beams dealing 40% damage.'
  },
  void_compression: {
    id: 'void_compression',
    name: 'Void Compression Core',
    rarity: 'rare',
    archetype: 'quantum',
    tags: ['QUANTUM', 'VOID'],
    tier: 2,
    icon: '🌌🕳️',
    desc: 'Void ball suction radius increased by +40% and deals double tick damage.'
  },
  polarity_inverter: {
    id: 'polarity_inverter',
    name: 'Polarity Inverter',
    rarity: 'rare',
    archetype: 'control',
    tags: ['CONTROL', 'DEFENSE'],
    tier: 2,
    icon: '🔄⚡',
    desc: 'Paddle deflects reverse bullet trajectory for 1.2s turning them into friendly projectiles.'
  },
  supercondensor_cell: {
    id: 'supercondensor_cell',
    name: 'Supercondensor Cell',
    rarity: 'common',
    archetype: 'tech',
    tags: ['TECH', 'COOLDOWN'],
    tier: 1,
    icon: '🔋⚡',
    desc: 'Reduces active ability cooldowns by 12% across all equipped slots.'
  },
  orbital_strike_relay: {
    id: 'orbital_strike_relay',
    name: 'Orbital Strike Relay',
    rarity: 'legendary',
    archetype: 'ordnance',
    tags: ['ATTACK', 'BOMB'],
    tier: 3,
    icon: '🛰️💥',
    desc: 'Clearing an elite node triggers an orbital kinetic strike on the highest HP target.'
  },
  cryo_fracture: {
    id: 'cryo_fracture',
    name: 'Cryo Fracture Shard',
    rarity: 'rare',
    archetype: 'cryo',
    tags: ['CRYO', 'AOE'],
    tier: 2,
    icon: '❄️💎',
    desc: 'Hitting a frozen node immediately shatters it, sending 4 ice shrapnel shards in cardinal directions.'
  },
  kinetic_flywheel: {
    id: 'kinetic_flywheel',
    name: 'Kinetic Flywheel',
    rarity: 'common',
    archetype: 'kinetic',
    tags: ['KINETIC', 'VELOCITY'],
    tier: 1,
    icon: '⚙️💨',
    desc: 'Maintains ball minimum velocity 20% higher, preventing slow ball stalling.'
  },
  aegis_rebounder: {
    id: 'aegis_rebounder',
    name: 'Aegis Rebounder',
    rarity: 'epic',
    archetype: 'juggernaut',
    tags: ['SHIELD', 'ATTACK'],
    tier: 3,
    icon: '🔰🪃',
    desc: 'When an energy shield absorbs a projectile, reflects it back at 3x speed.'
  },
  nanite_recycler: {
    id: 'nanite_recycler',
    name: 'Nanite Recycler',
    rarity: 'rare',
    archetype: 'economy',
    tags: ['ECONOMY'],
    tier: 2,
    icon: '🤖💾',
    desc: 'Destroyed enemy projectiles have a 15% chance to drop 1 Data Chip.'
  },
  overclocked_dynamo: {
    id: 'overclocked_dynamo',
    name: 'Overclocked Dynamo',
    rarity: 'rare',
    archetype: 'tech',
    tags: ['TECH', 'SPEED'],
    tier: 2,
    icon: '⚡⚙️',
    desc: 'Dashing or boosting charges kinetic energy, releasing a shockwave on ball contact.'
  },
  neutron_core: {
    id: 'neutron_core',
    name: 'Neutron Core',
    rarity: 'legendary',
    archetype: 'kinetic',
    tags: ['KINETIC', 'BALL'],
    tier: 3,
    icon: '🪐💥',
    desc: 'Ball mass is tripled; smashes through breakable nodes without bouncing.'
  },
  holographic_baffle: {
    id: 'holographic_baffle',
    name: 'Holographic Baffle',
    rarity: 'rare',
    archetype: 'defense',
    tags: ['DEFENSE', 'DECOY'],
    tier: 2,
    icon: '🛡️👤',
    desc: 'Creates a phantom barrier behind the paddle for 4s after taking damage.'
  },
  flux_stabilizer: {
    id: 'flux_stabilizer',
    name: 'Flux Stabilizer',
    rarity: 'common',
    archetype: 'control',
    tags: ['CONTROL'],
    tier: 1,
    icon: '🎯🕹️',
    desc: 'Paddle movement is 15% smoother with zero deceleration drift.'
  },
  cascade_capacitor: {
    id: 'cascade_capacitor',
    name: 'Cascade Capacitor',
    rarity: 'epic',
    archetype: 'tech',
    tags: ['TECH', 'COOLDOWN'],
    tier: 3,
    icon: '⚡🔄',
    desc: 'Using an active ability refunds 20% of its cooldown if it hits 3+ hostiles.'
  },
  ion_diffuser: {
    id: 'ion_diffuser',
    name: 'Ion Diffuser',
    rarity: 'rare',
    archetype: 'critical',
    tags: ['CRITICAL', 'LIGHTNING'],
    tier: 2,
    icon: '⚡🌿',
    desc: 'Laser strikes branch to 2 secondary targets dealing 50% damage.'
  },
  thermal_plating: {
    id: 'thermal_plating',
    name: 'Thermal Plating',
    rarity: 'common',
    archetype: 'defense',
    tags: ['DEFENSE'],
    tier: 1,
    icon: '🔥🛡️',
    desc: 'Immune to environmental floor hazards and fire dot damage.'
  },
  graviton_anchor: {
    id: 'graviton_anchor',
    name: 'Graviton Anchor',
    rarity: 'rare',
    archetype: 'quantum',
    tags: ['QUANTUM', 'BALL'],
    tier: 2,
    icon: '⚓🌌',
    desc: 'Hold ball in place for 0.8s on right-click to line up precision angled shots.'
  },
  spectral_afterimage: {
    id: 'spectral_afterimage',
    name: 'Spectral Afterimage',
    rarity: 'epic',
    archetype: 'velocity',
    tags: ['VELOCITY'],
    tier: 3,
    icon: '👥✨',
    desc: 'High speed paddle swings leave afterimages that can hit the ball for 0.25s.'
  },
  reaper_protocol: {
    id: 'reaper_protocol',
    name: 'Reaper Protocol',
    rarity: 'legendary',
    archetype: 'general',
    tags: ['ATTACK', 'SURVIVAL'],
    tier: 3,
    icon: '💀⚔️',
    desc: 'Defeating an enemy or clearing a node restores 2% maximum shields and grants 1s frenzy.'
  },
  core_transmuter: {
    id: 'core_transmuter',
    name: 'Core Transmuter',
    rarity: 'epic',
    archetype: 'economy',
    tags: ['ECONOMY'],
    tier: 3,
    icon: '💎🔄',
    desc: 'Transforms 5 excess Energy into 2 Data Chips whenever ability bar is full.'
  },
  zero_point_capacitor: {
    id: 'zero_point_capacitor',
    name: 'Zero-Point Capacitor',
    rarity: 'legendary',
    archetype: 'quantum',
    tags: ['QUANTUM', 'ENERGY'],
    tier: 3,
    icon: '⚛️⚡',
    desc: 'Stores kinetic recoil from every wall bounce, unleashing a chain lightning nova every 10 bounces.'
  },
  ballistic_compensator: {
    id: 'ballistic_compensator',
    name: 'Ballistic Compensator',
    rarity: 'rare',
    archetype: 'kinetic',
    tags: ['KINETIC', 'CONTROL'],
    tier: 2,
    icon: '🎯🔧',
    desc: 'Increases ball sweet-spot angle control on paddle edges by +30%.'
  },

// ============================================================================
  // EXPANDED 25-PATH EXCLUSIVE PROGRESSION ECOSYSTEM (65 DEEP PATH UPGRADES)
  // ============================================================================

  // --- VAMPIRIC / SIPHON (5) ---
  siphon_nodes: {
    id: 'siphon_nodes',
    name: 'Nano-Siphon Conduits',
    rarity: 'rare',
    archetype: 'vampiric',
    tags: ['VAMPIRIC', 'DEFENSE', 'BALL'],
    tier: 1,
    icon: '🩸⚡',
    desc: 'Ball impacts siphon nano-energy, restoring 1 HP every 8 successful hits against structures and elites.'
  },
  blood_overdrive: {
    id: 'blood_overdrive',
    name: 'Crimson Overdrive',
    rarity: 'epic',
    archetype: 'vampiric',
    tags: ['VAMPIRIC', 'DEFENSE'],
    tier: 2,
    icon: '🩸🛡️',
    desc: 'Siphoning energy while at maximum HP converts overflow into temporary Energy Shields (up to +2 charges).'
  },
  leech_pulse: {
    id: 'leech_pulse',
    name: 'Leech Shockwave',
    rarity: 'super_rare',
    archetype: 'vampiric',
    tags: ['VAMPIRIC', 'AOE'],
    tier: 2,
    icon: '🩸💥',
    desc: 'Triggering a siphon emits a 90px crimson shockwave damaging nearby blocks and drones for 3 damage.'
  },
  vampiric_frenzy: {
    id: 'vampiric_frenzy',
    name: 'Vampiric Frenzy',
    rarity: 'rare',
    archetype: 'vampiric',
    tags: ['VAMPIRIC', 'SPEED'],
    tier: 2,
    icon: '🩸⚡',
    partner: 'iron_bastion',
    fusionId: 'blood_bastion',
    desc: 'When at or below 2 HP, paddle speed increases by +25% and ball siphon healing frequency doubles.'
  },
  crimson_pact: {
    id: 'crimson_pact',
    name: 'Crimson Siphon Pact',
    rarity: 'legendary',
    archetype: 'vampiric',
    tags: ['VAMPIRIC', 'BALL', 'BURST'],
    tier: 3,
    icon: '🩸👑',
    desc: 'Smash deflections drain 5% current HP from struck elites/bosses and grant +1 permanent shield charge for the room.'
  },

  // --- PYRO / INFERNO (5) ---
  combustion_rounds: {
    id: 'combustion_rounds',
    name: 'Thermal Ignite Rounds',
    rarity: 'uncommon',
    archetype: 'pyro',
    tags: ['PYRO', 'STATUS', 'BALL'],
    tier: 1,
    icon: '🔥💥',
    desc: 'Deflected balls ignite struck targets, dealing continuous ticking fire damage over 4.0 seconds.'
  },
  magma_conflagration: {
    id: 'magma_conflagration',
    name: 'Magma Conflagration',
    rarity: 'epic',
    archetype: 'pyro',
    tags: ['PYRO', 'AOE'],
    tier: 2,
    icon: '🔥🌋',
    desc: 'Burning targets detonate upon destruction, igniting adjacent rows and melting heavy armor.'
  },
  thermal_shockwave: {
    id: 'thermal_shockwave',
    name: 'Thermal Wavefront',
    rarity: 'rare',
    archetype: 'pyro',
    tags: ['PYRO', 'DEFENSE', 'AOE'],
    tier: 2,
    icon: '🔥🛡️',
    desc: 'Paddle smash deflections release a blazing wavefront that incinerates all incoming hostile projectiles.'
  },
  napalm_wake: {
    id: 'napalm_wake',
    name: 'Infernal Napalm Wake',
    rarity: 'super_rare',
    archetype: 'pyro',
    tags: ['PYRO', 'TRAIL'],
    tier: 2,
    icon: '🔥🛤️',
    partner: 'toxic_canisters',
    fusionId: 'toxic_napalm',
    desc: 'High-speed balls leave an infernal magma trail in their wake that burns passing enemy drones and missiles.'
  },
  superheated_plasma: {
    id: 'superheated_plasma',
    name: 'Superheated Plasma Nova',
    rarity: 'legendary',
    archetype: 'pyro',
    tags: ['PYRO', 'BURST', 'DAMAGE'],
    tier: 3,
    icon: '🔥⭐',
    desc: 'Burn DoT ticks 2x faster. Struck burning targets take +60% damage from ball impacts and trigger fiery explosions.'
  },

  // --- GRAVITY / SINGULARITY (5) ---
  graviton_accelerator: {
    id: 'graviton_accelerator',
    name: 'Graviton Accelerator',
    rarity: 'rare',
    archetype: 'gravity',
    tags: ['GRAVITY', 'BALL', 'CONTROL'],
    tier: 1,
    icon: '🌌🚀',
    desc: 'Ball subtly curves toward high-density enemy clusters, prioritizing high-value elite targets.'
  },
  singularity_core_prime: {
    id: 'singularity_core_prime',
    name: 'Singularity Core Prime',
    rarity: 'legendary',
    archetype: 'gravity',
    tags: ['GRAVITY', 'AOE', 'CONTROL'],
    tier: 2,
    icon: '🌌🌀',
    desc: 'Smash deflections deploy a collapsing micro black hole at impact point, crushing adjacent nodes.'
  },
  event_horizon_field: {
    id: 'event_horizon_field',
    name: 'Event Horizon Field',
    rarity: 'rare',
    archetype: 'gravity',
    tags: ['GRAVITY', 'DEFENSE', 'UTILITY'],
    tier: 2,
    icon: '🌌🛡️',
    desc: 'Gravitational well pulls in loose Data Chips and slows enemy missiles by 50% within 120px.'
  },
  gravity_battery: {
    id: 'gravity_battery',
    name: 'Gravitational Induction',
    rarity: 'super_rare',
    archetype: 'gravity',
    tags: ['GRAVITY', 'ENERGY'],
    tier: 2,
    icon: '🌌🔋',
    partner: 'flux_steering_module',
    fusionId: 'polar_singularity',
    desc: 'Deflecting curved balls charges active abilities +20% faster and generates kinetic barrier charge.'
  },
  gravitational_cataclysm: {
    id: 'gravitational_cataclysm',
    name: 'Orbital Graviton Storm',
    rarity: 'epic',
    archetype: 'gravity',
    tags: ['GRAVITY', 'BURST', 'AOE'],
    tier: 3,
    icon: '🌌☄️',
    desc: 'Pulls nearby enemy bullets into an orbital vortex and flings them back toward enemy blocks as kinetic meteors!'
  },

  // --- CHRONO / TEMPORAL (5) ---
  temporal_buffer: {
    id: 'temporal_buffer',
    name: 'Chrono Buffer Field',
    rarity: 'rare',
    archetype: 'chrono',
    tags: ['CHRONO', 'DEFENSE', 'TIME'],
    tier: 1,
    icon: '⏳🛡️',
    desc: 'Incoming high-speed balls decelerate by 40% when within 75px of the paddle, widening deflection windows.'
  },
  tachyon_rewind: {
    id: 'tachyon_rewind',
    name: 'Tachyon Rewind',
    rarity: 'epic',
    archetype: 'chrono',
    tags: ['CHRONO', 'UTILITY', 'SAFETY'],
    tier: 2,
    icon: '⏳🔄',
    desc: 'Once per sector, a ball dropping past the paddle is rewound back into active play automatically.'
  },
  stasis_bubble: {
    id: 'stasis_bubble',
    name: 'Temporal Stasis Bubble',
    rarity: 'super_rare',
    archetype: 'chrono',
    tags: ['CHRONO', 'CONTROL'],
    tier: 2,
    icon: '⏳🫧',
    desc: 'Center paddle hits trigger a 1.5s time-dilation bubble that freezes all enemy projectiles in mid-air.'
  },
  time_slip_overdrive: {
    id: 'time_slip_overdrive',
    name: 'Time-Slip Overdrive',
    rarity: 'rare',
    archetype: 'chrono',
    tags: ['CHRONO', 'SPEED', 'BALL'],
    tier: 2,
    icon: '⏳⚡',
    partner: 'apex_calibrator',
    fusionId: 'temporal_execution',
    desc: 'Exiting time dilation shoots the ball forward at hyper velocity (+35% exit speed, +50% impact damage).'
  },
  chronos_perpetual: {
    id: 'chronos_perpetual',
    name: 'Chronos Perpetual Drive',
    rarity: 'legendary',
    archetype: 'chrono',
    tags: ['CHRONO', 'COOLDOWN', 'BUFF'],
    tier: 3,
    icon: '⏳👑',
    desc: 'Ability cooldowns recharge 50% faster during rallies; successful deflections extend all active buffs by +1.0s.'
  },

  // --- NANITE SWARM (5) ---
  self_replicating_nanites: {
    id: 'self_replicating_nanites',
    name: 'Nanite Infestation Seeds',
    rarity: 'uncommon',
    archetype: 'nanite',
    tags: ['NANITE', 'DOT', 'SWARM'],
    tier: 1,
    icon: '🦠⚙️',
    desc: 'Breaking a block infests neighboring blocks with microscopic nanites that dissolve them over time.'
  },
  nanite_harvest_matrix: {
    id: 'nanite_harvest_matrix',
    name: 'Nanite Devourer Matrix',
    rarity: 'epic',
    archetype: 'nanite',
    tags: ['NANITE', 'ECONOMY', 'HEAL'],
    tier: 2,
    icon: '🦠💾',
    desc: 'Nanite-destroyed blocks have a 35% chance to drop bonus Data Chips and trigger nanite repair bursts.'
  },
  replication_swarm: {
    id: 'replication_swarm',
    name: 'Autonomous Seeker Swarm',
    rarity: 'super_rare',
    archetype: 'nanite',
    tags: ['NANITE', 'DRONE', 'HOMING'],
    tier: 2,
    icon: '🦠🐝',
    desc: 'Every 5-hit combo spawns 2 seeking nanite micro-hornets that home in on weakened bricks and elites.'
  },
  plague_hive_nanites: {
    id: 'plague_hive_nanites',
    name: 'Corrosive Hive Nanites',
    rarity: 'rare',
    archetype: 'nanite',
    tags: ['NANITE', 'DEBUFF'],
    tier: 2,
    icon: '🦠🧪',
    partner: 'nano_sentry',
    fusionId: 'nanite_swarm_relay',
    desc: 'Nanite clouds strip 25% armor from elite foes and reduce enemy turret firing speed by 20%.'
  },
  nanite_chassis_repair: {
    id: 'nanite_chassis_repair',
    name: 'Nanite Reconstitution Core',
    rarity: 'legendary',
    archetype: 'nanite',
    tags: ['NANITE', 'DEFENSE', 'HEAL'],
    tier: 3,
    icon: '🦠🛡️',
    desc: 'Upon taking damage, emergency nanites instantly repair 1 HP and deploy a 2.0s impenetrable shield barrier.'
  },

  // --- STEALTH / PHANTOM (5) ---
  optical_camouflage: {
    id: 'optical_camouflage',
    name: 'Optical Camouflage',
    rarity: 'rare',
    archetype: 'stealth',
    tags: ['STEALTH', 'CRITICAL', 'BURST'],
    tier: 1,
    icon: '🥷✨',
    desc: 'Paddle cloaks when holding position; next ball strike unleashes a guaranteed 2.5x ambush critical strike.'
  },
  shadow_assassin: {
    id: 'shadow_assassin',
    name: 'Shadow Assassin Protocol',
    rarity: 'legendary',
    archetype: 'stealth',
    tags: ['STEALTH', 'PIERCE', 'BURST'],
    tier: 2,
    icon: '🥷🗡️',
    desc: 'Ambush strikes completely ignore armor thresholds and pierce through the first 3 targets struck.'
  },
  ambush_capacitor: {
    id: 'ambush_capacitor',
    name: 'Ambush Shuriken Capacitor',
    rarity: 'super_rare',
    archetype: 'stealth',
    tags: ['STEALTH', 'PROJECTILE'],
    tier: 2,
    icon: '🥷⚡',
    desc: 'Cloaking charges an ambush capacitor; at max charge, deflecting launches 3 piercing shadow shurikens.'
  },
  smoke_decoy_emitter: {
    id: 'smoke_decoy_emitter',
    name: 'Holographic Smoke Decoy',
    rarity: 'rare',
    archetype: 'stealth',
    tags: ['STEALTH', 'DEFENSE'],
    tier: 2,
    icon: '🥷💨',
    partner: 'kinetic_battery',
    fusionId: 'shadow_railgun',
    desc: 'Entering cloak leaves behind an optical holographic decoy that absorbs incoming enemy fire.'
  },
  phantom_execution: {
    id: 'phantom_execution',
    name: 'Phantom Deathmark Execution',
    rarity: 'epic',
    archetype: 'stealth',
    tags: ['STEALTH', 'EXECUTE', 'AOE'],
    tier: 3,
    icon: '🥷💀',
    desc: 'Ambush critical strikes against targets below 30% HP trigger instant execution and a room-wide smoke stun.'
  },

  // --- ACOUSTIC / RESONANCE (5) ---
  acoustic_transducer: {
    id: 'acoustic_transducer',
    name: 'Acoustic Transducer',
    rarity: 'uncommon',
    archetype: 'resonance',
    tags: ['RESONANCE', 'AOE', 'SOUND'],
    tier: 1,
    icon: '🔊⚡',
    desc: 'Hitting matching colored blocks emits sonic vibrations that shatter adjacent matching blocks.'
  },
  harmonic_amplifier: {
    id: 'harmonic_amplifier',
    name: 'Harmonic Amplifier',
    rarity: 'epic',
    archetype: 'resonance',
    tags: ['RESONANCE', 'COMBO', 'SOUND'],
    tier: 2,
    icon: '🔊💥',
    desc: 'Consecutive hits against uniform brick rows increase harmonic shatter radius by +50% per hit.'
  },
  seismic_rebound: {
    id: 'seismic_rebound',
    name: 'Seismic Acoustic Rebound',
    rarity: 'rare',
    archetype: 'resonance',
    tags: ['RESONANCE', 'BOUNCE'],
    tier: 2,
    icon: '🔊🪃',
    desc: 'Wall bounces generate acoustic shockwaves that damage and fracture blocks along the perimeter.'
  },
  ultrasonic_pulse: {
    id: 'ultrasonic_pulse',
    name: 'Ultrasonic Concussive Pulse',
    rarity: 'super_rare',
    archetype: 'resonance',
    tags: ['RESONANCE', 'STUN', 'AOE'],
    tier: 2,
    icon: '🔊🌊',
    partner: 'momentum_reactor',
    fusionId: 'seismic_shock',
    desc: 'Smash deflections emit an ultrasonic boom that stuns all active drones and turrets for 1.5s.'
  },
  harmonic_cataclysm: {
    id: 'harmonic_cataclysm',
    name: 'Harmonic Resonance Cataclysm',
    rarity: 'legendary',
    archetype: 'resonance',
    tags: ['RESONANCE', 'CHAIN', 'ULTIMATE'],
    tier: 3,
    icon: '🔊💥',
    desc: 'Striking any brick causes all blocks of the identical color across the entire arena to resonate and shatter!'
  },

  // --- CYBERWARE / OVERCLOCK (5) ---
  heat_sink_thrusters: {
    id: 'heat_sink_thrusters',
    name: 'Overclock Thrusters',
    rarity: 'rare',
    archetype: 'overclock',
    tags: ['OVERCLOCK', 'SPEED', 'MOBILITY'],
    tier: 1,
    icon: '⚙️💨',
    desc: 'Paddle movement speed increases by +30%; deflections build thermal charge toward overdrive.'
  },
  steam_vent_blast: {
    id: 'steam_vent_blast',
    name: 'Thermal Vent Blast',
    rarity: 'epic',
    archetype: 'overclock',
    tags: ['OVERCLOCK', 'AOE', 'DEFENSE'],
    tier: 2,
    icon: '⚙️🔥',
    desc: 'Reaching 100% thermal charge discharges a forward scorching heat wave that vaporizes hostile projectiles.'
  },
  hyperclock_servo: {
    id: 'hyperclock_servo',
    name: 'Hyper-Clocked Deflector Servos',
    rarity: 'super_rare',
    archetype: 'overclock',
    tags: ['OVERCLOCK', 'BALL', 'DAMAGE'],
    tier: 2,
    icon: '⚙️⚡',
    desc: 'Overclocked paddle deflections impart +35% ball velocity and turn the ball into a red-hot thermal projectile.'
  },
  capacitor_surge: {
    id: 'capacitor_surge',
    name: 'Thermal Capacitor Surge',
    rarity: 'rare',
    archetype: 'overclock',
    tags: ['OVERCLOCK', 'COOLDOWN'],
    tier: 2,
    icon: '⚙️🔋',
    partner: 'accelerator_shard',
    fusionId: 'hyper_overdrive',
    desc: 'Venting heat refunds 50% of active ability cooldowns and grants an immediate 1.0s movement speed surge.'
  },
  emergency_heatsink: {
    id: 'emergency_heatsink',
    name: 'Cryo-Heatsink Fail-Safe',
    rarity: 'legendary',
    archetype: 'overclock',
    tags: ['OVERCLOCK', 'SURVIVAL', 'DEFENSE'],
    tier: 3,
    icon: '⚙️🛡️',
    desc: 'Thermal overdrive doubles ball damage; taking lethal damage vents all heat to survive with 1 HP!'
  },

  // --- PRISMATIC / REFRACTION (5) ---
  prismatic_facets: {
    id: 'prismatic_facets',
    name: 'Prismatic Facets',
    rarity: 'rare',
    archetype: 'mirror',
    tags: ['MIRROR', 'LASER', 'PRISM'],
    tier: 1,
    icon: '🪞⚡',
    desc: 'Ball deflections emit a secondary laser beam refracted across the opposite geometric angle.'
  },
  refraction_splitter: {
    id: 'refraction_splitter',
    name: 'Refraction Matrix',
    rarity: 'epic',
    archetype: 'mirror',
    tags: ['MIRROR', 'MULTI', 'PRISM'],
    tier: 2,
    icon: '🪞🔮',
    desc: 'Center paddle hits refract the ball into 2 spectral mirror copies for 6 seconds.'
  },
  kaleidoscope_shards: {
    id: 'kaleidoscope_shards',
    name: 'Kaleidoscope Shards',
    rarity: 'super_rare',
    archetype: 'mirror',
    tags: ['MIRROR', 'AOE'],
    tier: 2,
    icon: '🪞✨',
    desc: 'Refracted laser beams split into 3 mini-beams upon striking any boundary wall or obstacle.'
  },
  spectrum_lance: {
    id: 'spectrum_lance',
    name: 'Spectrum Prismatic Lance',
    rarity: 'rare',
    archetype: 'mirror',
    tags: ['MIRROR', 'PIERCE', 'LASER'],
    tier: 2,
    icon: '🪞🌈',
    partner: 'phase_inversion',
    fusionId: 'kaleidoscope_warp',
    desc: 'Refracted beams deal 2x damage to elite shields and pierce through up to 4 targets cleanly.'
  },
  omni_reflector: {
    id: 'omni_reflector',
    name: 'Omni-Reflector Chassis',
    rarity: 'legendary',
    archetype: 'mirror',
    tags: ['MIRROR', 'DEFENSE', 'COUNTER'],
    tier: 3,
    icon: '🪞👑',
    desc: 'Paddle edges reflect all incoming enemy missiles back at the sender as high-damage prismatic lasers!'
  },

  // --- TOXIC / PLAGUE (5) ---
  toxic_canisters: {
    id: 'toxic_canisters',
    name: 'Miasma Canister',
    rarity: 'uncommon',
    archetype: 'plague',
    tags: ['PLAGUE', 'TOXIC', 'ZONE'],
    tier: 1,
    icon: '🧪💨',
    desc: 'Target destruction releases lingering toxic miasma clouds that melt through passing enemy drones.'
  },
  virulent_strain: {
    id: 'virulent_strain',
    name: 'Virulent Pandemic Strain',
    rarity: 'epic',
    archetype: 'plague',
    tags: ['PLAGUE', 'DEBUFF', 'TOXIC'],
    tier: 2,
    icon: '🧪☣️',
    desc: 'Poisoned enemies take +50% damage from all sources and spread lethal contagion upon death.'
  },
  neurotoxin_emitter: {
    id: 'neurotoxin_emitter',
    name: 'Neurotoxin Cloud Emitter',
    rarity: 'rare',
    archetype: 'plague',
    tags: ['PLAGUE', 'SLOW', 'DEFENSE'],
    tier: 2,
    icon: '🧪🌫️',
    desc: 'Paddle collisions spray a defensive toxic mist that corrodes enemy armor and slows missiles by 30%.'
  },
  necrotic_detonation: {
    id: 'necrotic_detonation',
    name: 'Necrotic Acid Detonation',
    rarity: 'super_rare',
    archetype: 'plague',
    tags: ['PLAGUE', 'AOE', 'BURST'],
    tier: 2,
    icon: '🧪💣',
    partner: 'self_replicating_nanites',
    fusionId: 'contagion_hive',
    desc: 'Breaking a poisoned block triggers an explosive acid pop dealing 4 damage in an 80px radius.'
  },
  biohazard_containment: {
    id: 'biohazard_containment',
    name: 'Biohazard Contagion Core',
    rarity: 'legendary',
    archetype: 'plague',
    tags: ['PLAGUE', 'DOT', 'BOSS'],
    tier: 3,
    icon: '🧪☣️',
    desc: 'Miasma clouds expand to cover 40% of the arena floor, dealing continuous acid damage and stripping boss armor.'
  },

  // --- POLARITY / FLUX (5) ---
  flux_steering_module: {
    id: 'flux_steering_module',
    name: 'Magnetic Flux Steering',
    rarity: 'rare',
    archetype: 'magnetic',
    tags: ['MAGNETIC', 'CONTROL', 'STEERING'],
    tier: 1,
    icon: '🧲🎯',
    desc: 'Moving the paddle while ball is in flight applies active electromagnetic curving to steer shots.'
  },
  polarity_repulsor_gate: {
    id: 'polarity_repulsor_gate',
    name: 'Polarity Repulsor Gate',
    rarity: 'epic',
    archetype: 'magnetic',
    tags: ['MAGNETIC', 'DEFENSE', 'KNOCKBACK'],
    tier: 2,
    icon: '🧲🛡️',
    desc: 'Deflecting balls creates a momentary repulsive flux barrier that pushes hostile units back 150px.'
  },
  magnetic_induction: {
    id: 'magnetic_induction',
    name: 'Magnetic Induction Dynamo',
    rarity: 'super_rare',
    archetype: 'magnetic',
    tags: ['MAGNETIC', 'ENERGY', 'COOLDOWN'],
    tier: 2,
    icon: '🧲⚡',
    desc: 'Curving the ball generates induction energy, charging active abilities +25% faster.'
  },
  flux_inversion_pulse: {
    id: 'flux_inversion_pulse',
    name: 'Flux Inversion Pulse',
    rarity: 'rare',
    archetype: 'magnetic',
    tags: ['MAGNETIC', 'EMP', 'AOE'],
    tier: 2,
    icon: '🧲💥',
    partner: 'ricochet_shrapnel',
    fusionId: 'vector_curve',
    desc: 'Striking the ball with opposite paddle edge inverts polarity, releasing a high-voltage EMP discharge.'
  },
  magnetic_lockdown: {
    id: 'magnetic_lockdown',
    name: 'Magnetic Tractor Beam Lockdown',
    rarity: 'legendary',
    archetype: 'magnetic',
    tags: ['MAGNETIC', 'AIM', 'BURST'],
    tier: 3,
    icon: '🧲👑',
    desc: 'Traps the ball in an ultra-precise magnetic tractor beam, allowing you to aim and launch at 2.5x speed!'
  },

  // --- RADIANT / PHOTONIC (5) ---
  photonic_collector: {
    id: 'photonic_collector',
    name: 'Photonic Rally Collector',
    rarity: 'rare',
    archetype: 'solar',
    tags: ['SOLAR', 'CHARGE', 'DAMAGE'],
    tier: 1,
    icon: '☀️🔋',
    desc: 'Each consecutive rally hit accumulates radiant solar energy, boosting ball damage by +12% per hit.'
  },
  supernova_burst_core: {
    id: 'supernova_burst_core',
    name: 'Supernova Ejection Core',
    rarity: 'legendary',
    archetype: 'solar',
    tags: ['SOLAR', 'AOE', 'ULTIMATE'],
    tier: 2,
    icon: '☀️🌠',
    desc: 'Rallies reaching 8+ hits unleash a catastrophic blinding solar flare that clears 40% of the arena.'
  },
  solar_flare_blaster: {
    id: 'solar_flare_blaster',
    name: 'Solar Flare Projection Lens',
    rarity: 'super_rare',
    archetype: 'solar',
    tags: ['SOLAR', 'BEAM', 'PIERCE'],
    tier: 2,
    icon: '☀️💥',
    desc: 'Center hits discharge a bright solar flare beam down the center column, melting all blocks in its path.'
  },
  helios_lance: {
    id: 'helios_lance',
    name: 'Helios Mini-Sun Core',
    rarity: 'rare',
    archetype: 'solar',
    tags: ['SOLAR', 'BALL', 'AOE'],
    tier: 2,
    icon: '☀️🔥',
    partner: 'precision_lens',
    fusionId: 'photonic_lance',
    desc: 'Smash deflections turn the ball into a radiant mini-sun that incinerates everything within 40px radius.'
  },
  radiant_supernova: {
    id: 'radiant_supernova',
    name: 'Radiant Supernova Armament',
    rarity: 'epic',
    archetype: 'solar',
    tags: ['SOLAR', 'ULTIMATE', 'ROOM_CLEAR'],
    tier: 3,
    icon: '☀️👑',
    desc: 'Reaching a 12-hit rally charges a full Supernova blast that vaporizes all non-boss entities and deals 25 damage to bosses!'
  },

  // --- INVENTOR / PROTOTYPE (5) - SECRET UNLOCK ---
  spring_loaded_bumper: {
    id: 'spring_loaded_bumper',
    name: 'Spring-Loaded Bumper',
    rarity: 'rare',
    archetype: 'inventor',
    tags: ['INVENTOR', 'BENNIE', 'PROTOTYPE'],
    tier: 1,
    icon: '💡🔩',
    desc: "Bennie's patent: Smashed deflections deploy kinetic bumpers that repel balls with 1.4x velocity and bouncy gears."
  },
  homing_wrench_drone: {
    id: 'homing_wrench_drone',
    name: 'Homing Wrench Deployer',
    rarity: 'epic',
    archetype: 'inventor',
    tags: ['INVENTOR', 'BENNIE', 'HOMING'],
    tier: 2,
    icon: '💡🔧',
    desc: 'Every 4th paddle hit launches a spinning homing wrench projectile that dismantles heavy blocks and stuns foes.'
  },
  chaotic_gizmo_dispenser: {
    id: 'chaotic_gizmo_dispenser',
    name: 'Chaotic Gizmo Dispenser',
    rarity: 'super_rare',
    archetype: 'inventor',
    tags: ['INVENTOR', 'BENNIE', 'GADGETS'],
    tier: 2,
    icon: '💡⚙️',
    desc: 'Breaking elite blocks dispenses random crazy inventions: spring traps, spark coils, or mini-magnets!'
  },
  perpetual_motion_engine: {
    id: 'perpetual_motion_engine',
    name: 'Perpetual Motion Engine',
    rarity: 'legendary',
    archetype: 'inventor',
    tags: ['INVENTOR', 'BENNIE', 'INFINITE'],
    tier: 2,
    icon: '💡🔄',
    partner: 'impact_core',
    fusionId: 'spring_loaded_slam',
    desc: 'Experimental contraptions bounce indefinitely and gain +10% velocity and damage on every boundary ricochet.'
  },
  doomsday_contraption: {
    id: 'doomsday_contraption',
    name: "Bennie's Masterpiece Prototype",
    rarity: 'legendary',
    archetype: 'inventor',
    tags: ['INVENTOR', 'BENNIE', 'ULTIMATE'],
    tier: 3,
    icon: '💡🤖',
    desc: "Every 10th paddle hit deploys Bennie's Masterpiece: an autonomous prototype walking bot firing lasers and dropping bouncy bombs!"
  },

  // --- DRONE EXPANSION (Path 5) ---
  drone_overclock_relay: {
    id: 'drone_overclock_relay',
    name: 'Drone Overclock Relay',
    rarity: 'rare',
    archetype: 'drone',
    tags: ['DRONE', 'ATTACK', 'SPEED'],
    tier: 2,
    icon: '🤖⚡',
    desc: 'Active drones attack 30% faster and fire piercing laser bursts on paddle smash.'
  },

  // --- BIO EXPANSION (Path 6) ---
  bio_spore_mine: {
    id: 'bio_spore_mine',
    name: 'Toxic Spore Mine',
    rarity: 'rare',
    archetype: 'bio',
    tags: ['BIO', 'POISON', 'HAZARD'],
    tier: 2,
    icon: '🍄',
    desc: 'Destroying infected targets deploys a caustic spore mine that inflicts poison and slows nearby objects.'
  },

  // --- ELECTRO EXPANSION (Path 8) ---
  electro_static_discharge: {
    id: 'electro_static_discharge',
    name: 'Static Discharge',
    rarity: 'common',
    archetype: 'electro',
    tags: ['ELECTRO', 'SHOCK', 'DEFENSE'],
    tier: 1,
    icon: '⚡',
    desc: 'Paddle deflections release a localized electric shock that zaps 2 nearest targets for 1 damage.'
  },
  electro_arc_capacitor: {
    id: 'electro_arc_capacitor',
    name: 'Arc Capacitor',
    rarity: 'rare',
    archetype: 'electro',
    tags: ['ELECTRO', 'CHAIN', 'DAMAGE'],
    tier: 2,
    icon: '🔋⚡',
    desc: 'Chain lightning jumps +2 additional targets and deals +25% shock damage.'
  },
  electro_thunderbolt_core: {
    id: 'electro_thunderbolt_core',
    name: 'Thunderbolt Core',
    rarity: 'epic',
    archetype: 'electro',
    tags: ['ELECTRO', 'BURST', 'ULTIMATE'],
    tier: 3,
    icon: '🌩️',
    desc: 'Smash deflections summon an orbital thunderstorm strike on the highest health enemy or boss.'
  },

  // --- RICOCHET EXPANSION (Path 9) ---
  ricochet_angle_optimizer: {
    id: 'ricochet_angle_optimizer',
    name: 'Angle Optimizer',
    rarity: 'common',
    archetype: 'ricochet',
    tags: ['RICOCHET', 'PHYSICS', 'SPEED'],
    tier: 1,
    icon: '📐',
    desc: 'Wall ricochets correct ball flight angle away from dangerous dead zones, increasing ball speed by +8%.'
  },
  ricochet_prism_reflector: {
    id: 'ricochet_prism_reflector',
    name: 'Prism Reflector',
    rarity: 'rare',
    archetype: 'ricochet',
    tags: ['RICOCHET', 'PIERCE', 'SHARD'],
    tier: 2,
    icon: '💎',
    desc: 'Every 4th wall or bumper bounce unleashes 2 light shards that pierce through blocks.'
  },
  ricochet_kinetic_billiard: {
    id: 'ricochet_kinetic_billiard',
    name: 'Kinetic Billiard Matrix',
    rarity: 'epic',
    archetype: 'ricochet',
    tags: ['RICOCHET', 'CHAIN', 'IMPACT'],
    tier: 3,
    icon: '🎱',
    desc: 'Ball collisions transfer full momentum across adjacent targets, creating cascading chain reactions.'
  },

  // --- ARTILLERY EXPANSION (Path 11) ---
  artillery_siege_mortar: {
    id: 'artillery_siege_mortar',
    name: 'Siege Mortar',
    rarity: 'rare',
    archetype: 'artillery',
    tags: ['ARTILLERY', 'EXPLOSION', 'AOE'],
    tier: 2,
    icon: '💣',
    desc: 'High velocity paddle impacts launch a high-arc mortar shell that explodes in a 60px radius.'
  },
  artillery_flak_barrage: {
    id: 'artillery_flak_barrage',
    name: 'Flak Cannon Barrage',
    rarity: 'epic',
    archetype: 'artillery',
    tags: ['ARTILLERY', 'BURST', 'DEFENSE'],
    tier: 3,
    icon: '💥',
    desc: 'Clearing elite enemies or bricks triggers a devastating flak burst destroying incoming projectiles.'
  },

  // --- GAMBLER EXPANSION (Path 12) ---
  gambler_loaded_dice: {
    id: 'gambler_loaded_dice',
    name: 'Loaded Dice',
    rarity: 'common',
    archetype: 'gambler',
    tags: ['GAMBLER', 'CRIT', 'LUCK'],
    tier: 1,
    icon: '🎲',
    desc: 'Increases baseline critical strike chance by +15% and guarantees minimum 1.5x damage on lucky hits.'
  },
  gambler_double_down_matrix: {
    id: 'gambler_double_down_matrix',
    name: 'Double Down Matrix',
    rarity: 'rare',
    archetype: 'gambler',
    tags: ['GAMBLER', 'RISK', 'REWARD'],
    tier: 2,
    icon: '🃏',
    desc: 'When HP is 2 or less, all coin drops, score, and damage are doubled for 15 seconds.'
  },
  gambler_roulette_core: {
    id: 'gambler_roulette_core',
    name: 'Neon Roulette Core',
    rarity: 'epic',
    archetype: 'gambler',
    tags: ['GAMBLER', 'JACKPOT', 'CHAOS'],
    tier: 3,
    icon: '🎰',
    desc: 'Every 7th deflection triggers a random jackpot: orbital beam, +1 shield, multi-ball, or mega-explosion.'
  },

  // --- VAMPIRIC EXPANSION (Path 13) ---
  vampiric_blood_tether: {
    id: 'vampiric_blood_tether',
    name: 'Blood Tether',
    rarity: 'common',
    archetype: 'vampiric',
    tags: ['VAMPIRIC', 'SIPHON', 'DAMAGE'],
    tier: 1,
    icon: '🩸',
    desc: 'Hitting enemies tethers them for 3s, siphoning life energy that increases paddle smash damage by +20%.'
  },
  vampiric_siphon_veil: {
    id: 'vampiric_siphon_veil',
    name: 'Siphon Veil',
    rarity: 'rare',
    archetype: 'vampiric',
    tags: ['VAMPIRIC', 'SURVIVAL', 'DEFENSE'],
    tier: 2,
    icon: '🦇',
    desc: 'When taking lethal damage, consume 1 shield charge or 50 cores to survive with 1 HP and gain 2s invulnerability.'
  },
  vampiric_crimson_overdrive: {
    id: 'vampiric_crimson_overdrive',
    name: 'Crimson Overdrive',
    rarity: 'epic',
    archetype: 'vampiric',
    tags: ['VAMPIRIC', 'SHOCKWAVE', 'AOE'],
    tier: 3,
    icon: '🍷',
    desc: 'Whenever health is siphoned, trigger a bloody shockwave that damages all nearby enemies and clears bullets.'
  },

  // --- PYRO EXPANSION (Path 14) ---
  pyro_inferno_fuel: {
    id: 'pyro_inferno_fuel',
    name: 'Inferno Fuel',
    rarity: 'common',
    archetype: 'pyro',
    tags: ['PYRO', 'BURN', 'DAMAGE'],
    tier: 1,
    icon: '🔥',
    desc: 'Burn duration on burning targets increased by +3s, and burned enemies take +20% damage from all attacks.'
  },
  pyro_scorch_mark: {
    id: 'pyro_scorch_mark',
    name: 'Scorch Mark',
    rarity: 'rare',
    archetype: 'pyro',
    tags: ['PYRO', 'TRAIL', 'DEFENSE'],
    tier: 2,
    icon: '♨️',
    desc: 'Ball leaves a trail of burning fire on the arena floor that ignites and damages passing enemy projectiles.'
  },
  pyro_magma_eruption: {
    id: 'pyro_magma_eruption',
    name: 'Magma Eruption',
    rarity: 'epic',
    archetype: 'pyro',
    tags: ['PYRO', 'EXPLOSION', 'BURST'],
    tier: 3,
    icon: '🌋',
    desc: 'Destroying a burning target triggers a violent volcanic eruption throwing 3 fireballs across the field.'
  },

  // --- GRAVITY EXPANSION (Path 15) ---
  gravity_event_horizon: {
    id: 'gravity_event_horizon',
    name: 'Event Horizon Lens',
    rarity: 'common',
    archetype: 'gravity',
    tags: ['GRAVITY', 'VORTEX', 'CONTROL'],
    tier: 1,
    icon: '🌌',
    desc: 'Creates a subtle gravitational field around the paddle that curves incoming balls toward the paddle sweetspot.'
  },
  gravity_graviton_anchor: {
    id: 'gravity_graviton_anchor',
    name: 'Graviton Anchor',
    rarity: 'rare',
    archetype: 'gravity',
    tags: ['GRAVITY', 'ORBIT', 'DAMAGE'],
    tier: 2,
    icon: '⚓',
    desc: 'Balls within 120px of targets decelerate into high-density orbits before detonating with 2x impact.'
  },
  gravity_tidal_disruptor: {
    id: 'gravity_tidal_disruptor',
    name: 'Tidal Disruptor',
    rarity: 'epic',
    archetype: 'gravity',
    tags: ['GRAVITY', 'PULSE', 'UTILITY'],
    tier: 3,
    icon: '🪐',
    desc: 'Smash deflections trigger a gravitational pulse that repels enemy bullets and pulls floating powerups.'
  },

  // --- CHRONO EXPANSION (Path 16) ---
  chrono_time_dilation_field: {
    id: 'chrono_time_dilation_field',
    name: 'Time Dilation Field',
    rarity: 'common',
    archetype: 'chrono',
    tags: ['CHRONO', 'SLOWMO', 'CLUTCH'],
    tier: 1,
    icon: '⏳',
    desc: 'When ball is near paddle back-line, time slows down by 40% for 0.8s to enable clutch deflections.'
  },
  chrono_temporal_echo: {
    id: 'chrono_temporal_echo',
    name: 'Temporal Echo',
    rarity: 'rare',
    archetype: 'chrono',
    tags: ['CHRONO', 'CLONE', 'BALL'],
    tier: 2,
    icon: '⏱️',
    desc: 'Deflections create a ghost ball clone that traces the ball path for 2 seconds dealing 50% damage.'
  },
  chrono_paradox_engine: {
    id: 'chrono_paradox_engine',
    name: 'Paradox Engine',
    rarity: 'epic',
    archetype: 'chrono',
    tags: ['CHRONO', 'COOLDOWN', 'REWIND'],
    tier: 3,
    icon: '🌀',
    desc: 'Active ability cooldowns recover 50% faster, and taking damage rewinds cooldowns by 3 seconds.'
  },

  // --- NANITE EXPANSION (Path 17) ---
  nanite_reconstructor: {
    id: 'nanite_reconstructor',
    name: 'Nanite Reconstructor',
    rarity: 'common',
    archetype: 'nanite',
    tags: ['NANITE', 'REPAIR', 'SHIELD'],
    tier: 1,
    icon: '🔬',
    desc: 'Paddle nanites automatically repair 1 shield charge after clearing 2 consecutive rooms without taking damage.'
  },
  nanite_swarm_infector: {
    id: 'nanite_swarm_infector',
    name: 'Swarm Infector',
    rarity: 'rare',
    archetype: 'nanite',
    tags: ['NANITE', 'DISMANTLE', 'CHAIN'],
    tier: 2,
    icon: '🦠',
    desc: 'Nanites jump from destroyed targets to adjacent targets, dismantling enemy armor and dealing 2 damage.'
  },
  nanite_molecular_dissolver: {
    id: 'nanite_molecular_dissolver',
    name: 'Molecular Dissolver',
    rarity: 'epic',
    archetype: 'nanite',
    tags: ['NANITE', 'ARMOR_PIERCE', 'DAMAGE'],
    tier: 3,
    icon: '🧬',
    desc: 'Ball hits dissolve target hitboxes, increasing ball penetration and ignoring reinforced armor.'
  },

  // --- STEALTH EXPANSION (Path 18) ---
  stealth_shadow_cloak: {
    id: 'stealth_shadow_cloak',
    name: 'Shadow Cloak',
    rarity: 'common',
    archetype: 'stealth',
    tags: ['STEALTH', 'AMBUSH', 'DAMAGE'],
    tier: 1,
    icon: '👤',
    desc: 'After 2s without hitting the ball, enter stealth cloak: next deflection deals +75% ambush strike damage.'
  },
  stealth_backstab_protocol: {
    id: 'stealth_backstab_protocol',
    name: 'Backstab Protocol',
    rarity: 'rare',
    archetype: 'stealth',
    tags: ['STEALTH', 'CRIT', 'ANGLE'],
    tier: 2,
    icon: '🗡️',
    desc: 'Ball hits against targets from behind or lateral angles deal 2x critical damage.'
  },
  stealth_ghost_decoy: {
    id: 'stealth_ghost_decoy',
    name: 'Ghost Decoy',
    rarity: 'epic',
    archetype: 'stealth',
    tags: ['STEALTH', 'DECOY', 'DEFENSE'],
    tier: 3,
    icon: '🌫️',
    desc: 'Dodging enemy projectiles leaves a holographic decoy that draws enemy turret fire for 3 seconds.'
  },

  // --- RESONANCE EXPANSION (Path 19) ---
  resonance_tuning_fork: {
    id: 'resonance_tuning_fork',
    name: 'Tuning Fork Matrix',
    rarity: 'common',
    archetype: 'resonance',
    tags: ['RESONANCE', 'RALLY', 'SCALING'],
    tier: 1,
    icon: '🎵',
    desc: 'Continuous ball rallies increase harmonic resonance pitch, boosting paddle size and ball speed by +5% per rally.'
  },
  resonance_acoustic_shatter: {
    id: 'resonance_acoustic_shatter',
    name: 'Acoustic Shatterwave',
    rarity: 'rare',
    archetype: 'resonance',
    tags: ['RESONANCE', 'SHATTER', 'AOE'],
    tier: 2,
    icon: '🔊',
    desc: 'Smash hits release a concussive soundwave that fractures all bricks in the same horizontal row.'
  },
  resonance_harmonic_amplifier: {
    id: 'resonance_harmonic_amplifier',
    name: 'Harmonic Amplifier',
    rarity: 'epic',
    archetype: 'resonance',
    tags: ['RESONANCE', 'CROSSFIRE', 'DAMAGE'],
    tier: 3,
    icon: '📢',
    desc: 'Resonance waves bounce between arena walls, dealing damage to all enemies caught in the crossfire.'
  },

  // --- OVERCLOCK EXPANSION (Path 20) ---
  overclock_heat_sink_bypass: {
    id: 'overclock_heat_sink_bypass',
    name: 'Heat Sink Bypass',
    rarity: 'common',
    archetype: 'overclock',
    tags: ['OVERCLOCK', 'SPEED', 'RISK'],
    tier: 1,
    icon: '🔥',
    desc: 'Paddle movement speed increased by +25%, but taking damage causes a minor steam blowout.'
  },
  overclock_redline_booster: {
    id: 'overclock_redline_booster',
    name: 'Redline Booster',
    rarity: 'rare',
    archetype: 'overclock',
    tags: ['OVERCLOCK', 'MAX_SPEED', 'PIERCE'],
    tier: 2,
    icon: '🚀',
    desc: 'When ball reaches maximum speed, ignite into Overclock State dealing 2.5x damage and piercing 1 target.'
  },
  overclock_thermal_burst: {
    id: 'overclock_thermal_burst',
    name: 'Thermal Discharge Burst',
    rarity: 'epic',
    archetype: 'overclock',
    tags: ['OVERCLOCK', 'SCREEN_CLEAR', 'BURST'],
    tier: 3,
    icon: '💥',
    desc: 'Overheating releases a screen-clearing thermal wave that incinerates incoming bullets and damages all targets.'
  },

  // --- MIRROR EXPANSION (Path 21) ---
  mirror_duplication_matrix: {
    id: 'mirror_duplication_matrix',
    name: 'Duplication Matrix',
    rarity: 'common',
    archetype: 'mirror',
    tags: ['MIRROR', 'CLONE', 'DEFENSE'],
    tier: 1,
    icon: '🪞',
    desc: 'Paddle reflects a ghost mirror image on the opposite side of the arena that mirrors ball deflections.'
  },
  mirror_refraction_lens: {
    id: 'mirror_refraction_lens',
    name: 'Refraction Lens',
    rarity: 'rare',
    archetype: 'mirror',
    tags: ['MIRROR', 'LASER', 'REFRACT'],
    tier: 2,
    icon: '✨',
    desc: 'Laser attacks and projectiles passing through the mirror plane refract into 2 angled beams.'
  },
  mirror_kaleidoscope_shield: {
    id: 'mirror_kaleidoscope_shield',
    name: 'Kaleidoscope Shield',
    rarity: 'epic',
    archetype: 'mirror',
    tags: ['MIRROR', 'BARRIER', 'ABSORB'],
    tier: 3,
    icon: '🔮',
    desc: 'Reflecting a ball with the paddle edge projects a prismatic light barrier absorbing 1 enemy hit.'
  },

  // --- PLAGUE EXPANSION (Path 22) ---
  plague_virulent_strain: {
    id: 'plague_virulent_strain',
    name: 'Virulent Strain',
    rarity: 'common',
    archetype: 'plague',
    tags: ['PLAGUE', 'DECAY', 'SPREAD'],
    tier: 1,
    icon: '☣️',
    desc: 'Decay damage ticks 25% faster and spreads to nearby targets when an afflicted target is struck.'
  },
  plague_rot_infestation: {
    id: 'plague_rot_infestation',
    name: 'Rot Infestation',
    rarity: 'rare',
    archetype: 'plague',
    tags: ['PLAGUE', 'EXECUTE', 'LOOT'],
    tier: 2,
    icon: '💀',
    desc: 'Afflicted targets lose 10% maximum health per second and drop extra Data Chips upon decomposition.'
  },
  plague_epidemic_burst: {
    id: 'plague_epidemic_burst',
    name: 'Epidemic Cataclysm',
    rarity: 'epic',
    archetype: 'plague',
    tags: ['PLAGUE', 'CATACLYSM', 'BURST'],
    tier: 3,
    icon: '☠️',
    desc: 'When an afflicted boss or elite takes smash damage, detonate all decay stacks across the field for massive burst.'
  },

  // --- MAGNETIC EXPANSION (Path 23) ---
  magnetic_gauss_accelerator: {
    id: 'magnetic_gauss_accelerator',
    name: 'Gauss Accelerator',
    rarity: 'common',
    archetype: 'magnetic',
    tags: ['MAGNETIC', 'ACCELERATE', 'AIM'],
    tier: 1,
    icon: '🧲',
    desc: 'Magnetic flux pulls balls smoothly into the paddle center and accelerates launch velocity by +20%.'
  },
  magnetic_polar_attractor: {
    id: 'magnetic_polar_attractor',
    name: 'Polar Attractor Field',
    rarity: 'rare',
    archetype: 'magnetic',
    tags: ['MAGNETIC', 'DEFENSE', 'DEFLECT'],
    tier: 2,
    icon: '🌐',
    desc: 'Generates a magnetic vortex in the arena center that redirects metallic projectiles away from player.'
  },
  magnetic_electromagnetic_pulse: {
    id: 'magnetic_electromagnetic_pulse',
    name: 'Electromagnetic EMP Core',
    rarity: 'epic',
    archetype: 'magnetic',
    tags: ['MAGNETIC', 'EMP', 'DISABLE'],
    tier: 3,
    icon: '⚡',
    desc: 'Smash deflections trigger an EMP shockwave disabling enemy turrets and laser beams for 3 seconds.'
  },

  // --- SOLAR EXPANSION (Path 24) ---
  solar_collector_array: {
    id: 'solar_collector_array',
    name: 'Solar Collector Array',
    rarity: 'common',
    archetype: 'solar',
    tags: ['SOLAR', 'CHARGE', 'DAMAGE'],
    tier: 1,
    icon: '☀️',
    desc: 'Absorbs radiant arena light, charging ball with solar energy that increases ball brightness and damage by +15%.'
  },
  solar_coronal_mass: {
    id: 'solar_coronal_mass',
    name: 'Coronal Mass Ejection',
    rarity: 'rare',
    archetype: 'solar',
    tags: ['SOLAR', 'FLARE', 'BLIND'],
    tier: 2,
    icon: '🌅',
    desc: 'Paddle smash releases a blinding solar flare wave that blinds enemies and burns obstacles.'
  },
  solar_supernova_core: {
    id: 'solar_supernova_core',
    name: 'Supernova Fusion Core',
    rarity: 'epic',
    archetype: 'solar',
    tags: ['SOLAR', 'SUPERNOVA', 'CATACLYSM'],
    tier: 3,
    icon: '🌟',
    desc: 'Accumulates solar charge over 10 deflections: releases a cataclysmic supernova wiping all bullets and dealing 8 damage.'
  },

  // --- INVENTOR EXPANSION (Path 25) ---
  inventor_spring_bumper: {
    id: 'inventor_spring_bumper',
    name: 'Spring Bumper Pad',
    rarity: 'common',
    archetype: 'inventor',
    tags: ['INVENTOR', 'BUMPER', 'RICOCHET'],
    tier: 1,
    icon: '🛠️',
    desc: 'Deploys a kinetic spring bumper on paddle deflection that ricochets balls toward high-value targets.'
  },
  inventor_gear_launcher: {
    id: 'inventor_gear_launcher',
    name: 'Prototype Gear Launcher',
    rarity: 'rare',
    archetype: 'inventor',
    tags: ['INVENTOR', 'GEAR', 'ARMOR_SHRED'],
    tier: 2,
    icon: '⚙️',
    desc: 'Smash hits launch 2 bouncing mechanical gears that shred enemy armor and obstacles.'
  },
  inventor_clockwork_dynamo: {
    id: 'inventor_clockwork_dynamo',
    name: 'Clockwork Overdrive Dynamo',
    rarity: 'epic',
    archetype: 'inventor',
    tags: ['INVENTOR', 'DYNAMO', 'COOLDOWN'],
    tier: 3,
    icon: '🕰️',
    desc: 'Mechanical contraptions generate energy charge, reducing all active ability cooldowns by 35%.'
  }
};

// ============================================================================
// 19 HIGH-TIER FUSIONS
// ============================================================================
const FUSIONS = {
  velocity_breaker: {
    id: 'velocity_breaker',
    name: 'Velocity Breaker',
    icon: '⚡🌠',
    item1: 'sonic_boom_ball',
    item2: 'kinetic_burst',
    desc: 'Ball velocity compounds exponentially, multiplying collision impact and blast radius by 3x!'
  },
  blink_assault: {
    id: 'blink_assault',
    name: 'Blink Assault',
    icon: '⚡🌌',
    item1: 'phase_inversion',
    item2: 'accelerator_shard',
    desc: 'Rapid deflections trigger warp blink shifts that leave behind an electric singularity trail.'
  },
  fortress_protocol: {
    id: 'fortress_protocol',
    name: 'Fortress Protocol',
    icon: '🏰🧱',
    item1: 'iron_bastion',
    item2: 'fortress_core',
    desc: 'When reduced to low HP, an impenetrable energy dome envelops the paddle and blocks all leaks.'
  },
  titan_engine: {
    id: 'titan_engine',
    name: 'Titan Engine',
    icon: '🛡️💥',
    item1: 'impact_core',
    item2: 'iron_bastion',
    desc: 'Heavy ball impacts generate temporary kinetic barriers that absorb incoming enemy projectiles.'
  },
  titan_impact: {
    id: 'titan_impact',
    name: 'Titan Concussion',
    icon: '🛡️💣',
    item1: 'heavy_strike',
    item2: 'titan_impact_perk',
    desc: 'Heavy paddle deflections unleash a room-wide seismic shock that stuns and repels all drones.'
  },
  critical_ricochet: {
    id: 'critical_ricochet',
    name: 'Critical Ricochet',
    icon: '🎯💥',
    item1: 'apex_calibrator',
    item2: 'ricochet_shrapnel',
    desc: 'Center critical deflections fire 4 polarized seeking laser shards that ricochet off walls.'
  },
  guardian_network: {
    id: 'guardian_network',
    name: 'Guardian Network',
    icon: '🛰️🛡️',
    item1: 'defense_satellite',
    item2: 'guardian_interceptor',
    desc: 'Drones synchronize shields, creating a defensive net that intercepts all incoming bullets.'
  },
  phase_strike: {
    id: 'phase_strike',
    name: 'Phase Strike',
    icon: '🎯⏳',
    item1: 'apex_calibrator',
    item2: 'chronos_rift',
    desc: 'Critical strikes phase through obstacles, striking up to 3 separate targets simultaneously.'
  },
  hyper_railgun: {
    id: 'hyper_railgun',
    name: 'Hyper Railgun',
    icon: '🔋💎',
    item1: 'precision_lens',
    item2: 'kinetic_battery',
    desc: 'Kinetic Battery charges 2x faster. At 100%, fires 5 piercing hyper-beams across the entire field!'
  },
  kinetic_cataclysm: {
    id: 'kinetic_cataclysm',
    name: 'Kinetic Cataclysm',
    icon: '⚡💣',
    item1: 'momentum_reactor',
    item2: 'high_explosive_shells',
    desc: 'Smash deflections create a massive 120px kinetic implosion upon striking any target.'
  },
  kinetic_retaliator: {
    id: 'kinetic_retaliator',
    name: 'Kinetic Retaliator',
    icon: '🗡️⚡',
    item1: 'reactive_armor',
    item2: 'aegis_converter',
    desc: 'Paddle impacts or shield breaks instantly fire 6 seeking plasma fireballs at enemy sentinels.'
  },
  arc_fleet: {
    id: 'arc_fleet',
    name: 'Overcharged Arc Fleet',
    icon: '⚡🛸',
    item1: 'nano_sentry',
    item2: 'tesla_coil',
    desc: 'Drones maintain a continuous high-voltage lightning tether between each other, vaporizing bullets.'
  },
  orbital_strike_matrix: {
    id: 'orbital_strike_matrix',
    name: 'Orbital Strike Matrix',
    icon: '🛰️💥',
    item1: 'drone_overclock',
    item2: 'seeker_missiles',
    desc: 'Drones laser-designate the highest-HP target. Every 4.0s, a devastating orbital beam vaporizes it.'
  },
  pandemic_outbreak: {
    id: 'pandemic_outbreak',
    name: 'Pandemic Outbreak',
    icon: '☣️🦠',
    item1: 'bio_residue',
    item2: 'contagion_core',
    desc: 'Acid trails detonate into controlled corrosive clouds that infect up to 2 adjacent foes (capped chain).'
  },
  absolute_zero: {
    id: 'absolute_zero',
    name: 'Absolute Zero',
    icon: '❄️🧪',
    item1: 'frostbite_core',
    item2: 'acid_mists',
    desc: 'Cryo and corrosive acid fuse: frozen targets shatter into caustic ice shrapnel that melts armor.'
  },
  fractal_resonator: {
    id: 'fractal_resonator',
    name: 'Fractal Resonator',
    icon: '🌀🔊',
    item1: 'quantum_cluster',
    item2: 'echo_chamber',
    desc: 'Phantom balls become permanent and increase the damage of ALL active balls by +40% per ball!'
  },
  dimensional_collapse: {
    id: 'dimensional_collapse',
    name: 'Dimensional Collapse',
    icon: '🧲⏳',
    item1: 'gravity_well',
    item2: 'chronos_rift',
    desc: 'Generates a permanent gravitational vortex in the center of the arena that bends enemy bullets.'
  },
  frozen_pinball_fusion: {
    id: 'frozen_pinball_fusion',
    name: 'Frozen Pinball Storm',
    icon: '❄️🪃',
    item1: 'frozen_pinball',
    item2: 'permafrost_field',
    desc: 'Every wall bounce unleashes a swirling blizzard of frost shards that freeze entire formations.'
  },
  probability_singularity: {
    id: 'probability_singularity',
    name: 'Probability Singularity',
    icon: '🎲✨',
    item1: 'loaded_dice',
    item2: 'chaos_vortex',
    desc: 'Variance rolls can no longer drop below 2.0x, and casino spins have a guaranteed 50% jackpot chance!'
  },
  nano_citadel: {
    id: 'nano_citadel',
    name: 'Nanite Citadel',
    icon: '🏰🩹',
    item1: 'nano_repair_swarm',
    item2: 'iron_bastion',
    desc: 'Drones constantly repair paddle shields and project a nanite aura that regenerates hull integrity over time.'
  },
  supercharged_annihilator: {
    id: 'supercharged_annihilator',
    name: 'Superconducting Annihilator',
    icon: '⚡🚄',
    item1: 'superconductor_rails',
    item2: 'sonic_boom_ball',
    desc: 'Ball gains infinite wall-bounce acceleration, generating thunderclaps that vaporize projectile clusters.'
  },
  cryogenic_minefield_fusion: {
    id: 'cryogenic_minefield_fusion',
    name: 'Glacial Minefield',
    icon: '❄️💥',
    item1: 'cryo_minefield',
    item2: 'frostbite_core',
    desc: 'Cryo mines detonate in massive frost novas, freezing hostiles and causing shattered targets to cascade.'
  },
  singularity_deathray: {
    id: 'singularity_deathray',
    name: 'Singularity Deathray',
    icon: '🌌🎯',
    item1: 'singularity_lens',
    item2: 'precision_lens',
    desc: 'Center critical deflections condense into a black-hole laser beam that pierces all targets on the screen.'
  },
  reactive_colossus: {
    id: 'reactive_colossus',
    name: 'Reactive Colossus',
    icon: '🛡️⚡',
    item1: 'reactive_overplating',
    item2: 'reactive_armor',
    desc: 'Shield breaks detonate a thermonuclear kinetic shockwave and immediately regenerate 1 shield charge after 10s.'
  },
  phantom_artillery_storm: {
    id: 'phantom_artillery_storm',
    name: 'Phantom Bombardment',
    icon: '🔮💣',
    item1: 'phantom_payload',
    item2: 'high_explosive_shells',
    desc: 'Phantom balls detonate on every impact, firing clusters of seeking phantom micro-missiles.'
  },
  emp_storm_matrix: {
    id: 'emp_storm_matrix',
    name: 'EMP Storm Grid',
    icon: '📡⚡',
    item1: 'emp_resonance',
    item2: 'tesla_coil',
    desc: 'EMP waves persist for 6s, disabling enemy shields and turning hostiles into static lightning conductors.'
  },
  acidic_nova: {
    id: 'acidic_nova',
    name: 'Bio-Acid Cataclysm',
    icon: '☣️💥',
    item1: 'acid_bloom',
    item2: 'contagion_core',
    desc: 'Corrosive detonations cause toxic chains with no upper limit, melting armored boss barriers in seconds.'
  },
  tachyon_singularity: {
    id: 'tachyon_singularity',
    name: 'Tachyon Singularity',
    icon: '⏩🌌',
    item1: 'tachyon_accelerator',
    item2: 'gravity_well',
    desc: 'Supersonic balls tear holes in space-time, sucking enemies into localized gravity rifts.'
  },
  aegis_lightning_core: {
    id: 'aegis_lightning_core',
    name: 'Aegis Storm Core',
    icon: '🔰⚡',
    item1: 'aegis_battery',
    item2: 'aegis_converter',
    desc: 'Shield charges emit continuous chain lightning and convert absorbed projectile damage into bonus attack power.'
  },
  infernal_cataclysm: {
    id: 'infernal_cataclysm',
    name: 'Infernal Supernova',
    icon: '🔥🌠',
    item1: 'hyper_combustion',
    item2: 'momentum_reactor',
    desc: 'Smash strikes detonate blistering plasma flares that burn the entire arena for 5 seconds.'
  },
  vortex_reaper: {
    id: 'vortex_reaper',
    name: 'Vortex Harvester',
    icon: '🌀💾',
    item1: 'vortex_core',
    item2: 'echo_chamber',
    desc: 'Gravitational vortex draws all floating pick-ups instantly and multiplies collected Data Chips by 2x.'
  },
  temporal_mirage: {
    id: 'temporal_mirage',
    name: 'Temporal Mirage Fleet',
    icon: '⏳👥',
    item1: 'temporal_echo',
    item2: 'phase_inversion',
    desc: 'Mirror paddle becomes solid and fires dual plasma cannons whenever you deflect a ball.'
  },
  calibrated_shrapnel: {
    id: 'calibrated_shrapnel',
    name: 'Cluster Ricochet Flak',
    icon: '💥🪃',
    item1: 'shrapnel_matrix',
    item2: 'ricochet_shrapnel',
    desc: 'Kinetic shards ricochet up to 6 times, each bounce increasing shard velocity and damage by +20%.'
  },
  cryo_dynamo_cascade: {
    id: 'cryo_dynamo_cascade',
    name: 'Absolute Frost Dynamo',
    icon: '❄️🔋',
    item1: 'frost_dynamo',
    item2: 'permafrost_field',
    desc: 'Freezing an enemy immediately restores 25% active ability cooldown and grants instant Overdrive surge.'
  },
  gamblers_armageddon: {
    id: 'gamblers_armageddon',
    name: "Gambler's Cataclysm",
    icon: '🎲💥',
    item1: 'gamblers_catalyst',
    item2: 'loaded_dice',
    desc: 'Lucky rolls can hit up to 10x mega-critical damage, triggering golden coin rain and screen clearing.'
  },
  frenzy_carrier_fleet: {
    id: 'frenzy_carrier_fleet',
    name: 'Apex Carrier Command',
    icon: '🛸👑',
    item1: 'sentinel_overdrive',
    item2: 'drone_overclock',
    desc: 'Drones become indestructible assault carriers firing micro-nukes that track the most dangerous targets.'
  },
  apex_annihilator: {
    id: 'apex_annihilator',
    name: 'Apex Sovereign',
    icon: '👑🎯',
    item1: 'apex_predator',
    item2: 'apex_calibrator',
    desc: 'All critical hits deal 4x damage and emit lethal cross-lasers across both horizontal and vertical axes.'
  },

  // --- VERSION 2.0 EXPANSION FUSIONS (18 NEW) ---
  chronos_singularity: {
    id: 'chronos_singularity',
    name: 'Chronos Singularity',
    icon: '⏳🌌',
    item1: 'chronos_accelerator',
    item2: 'singularity_capacitor',
    desc: 'Slow-motion rifts trap projectiles while singularity cores crush trapped targets for massive continuous damage.'
  },
  aegis_cataclysm: {
    id: 'aegis_cataclysm',
    name: 'Aegis Cataclysm Wall',
    icon: '🔰🌋',
    item1: 'aegis_bulwark',
    item2: 'reactive_colossus',
    desc: 'Shield depletion triggers a 360-degree thermonuclear repulsor shockwave, vaporizing all enemy bullets within 300px.'
  },
  cryo_fracture_blizzard: {
    id: 'cryo_fracture_blizzard',
    name: 'Glacial Shatter Storm',
    icon: '❄️💎',
    item1: 'cryo_fracture',
    item2: 'subzero_cryo_cells',
    desc: 'Shattered ice shrapnel chains freeze on hit, creating a cascading permafrost room-clear detonation.'
  },
  supercluster_annihilation: {
    id: 'supercluster_annihilation',
    name: 'Supercluster Prism Ray',
    icon: '💎⚡',
    item1: 'supercluster_prism',
    item2: 'singularity_deathray',
    desc: 'Prism refraction beams merge into lethal continuous rainbow deathrays that incinerate all nodes in line of sight.'
  },
  orbital_nanocannon: {
    id: 'orbital_nanocannon',
    name: 'Orbital Swarm Relay',
    icon: '🛰️🛸',
    item1: 'orbital_strike_relay',
    item2: 'tactical_nanoswarm',
    desc: 'Escort micro-drones paint targets for continuous kinetic orbital bombardments every 4 seconds.'
  },
  neutron_juggernaut: {
    id: 'neutron_juggernaut',
    name: 'Neutron Colossus',
    icon: '🪐🛡️',
    item1: 'neutron_core',
    item2: 'titan_engine',
    desc: 'Heavy balls crush entire rows without deflection, creating persistent gravity tracks that pull drifting chips.'
  },
  polarity_supernova: {
    id: 'polarity_supernova',
    name: 'Polarity Supernova',
    icon: '🔄⚡',
    item1: 'polarity_inverter',
    item2: 'emp_storm_matrix',
    desc: 'Reflected projectiles explode into emp bursts that turn hostile weapons into allied kinetic flares.'
  },
  plasma_frenzy_reactor: {
    id: 'plasma_frenzy_reactor',
    name: 'Plasma Resonator Core',
    icon: '🔥💥',
    item1: 'plasma_overdrive',
    item2: 'hyper_resonator',
    desc: 'Overdrive plasma darts trigger kinetic resonance explosions that peel 25% armor from bosses.'
  },
  void_reaper_harness: {
    id: 'void_reaper_harness',
    name: 'Void Reaper Matrix',
    icon: '🌌💀',
    item1: 'void_compression',
    item2: 'reaper_protocol',
    desc: 'Crushing nodes in void rifts heals hull integrity and triggers instant room-wide frenzy acceleration.'
  },
  tachyon_afterimage: {
    id: 'tachyon_afterimage',
    name: 'Tachyon Mirage Fleet',
    icon: '⏩👥',
    item1: 'spectral_afterimage',
    item2: 'tachyon_singularity',
    desc: 'Spectral paddle afterimages echo all active ability activations and fire matching laser spreads.'
  },
  overclock_cascade: {
    id: 'overclock_cascade',
    name: 'Perpetual Overclock Loop',
    icon: '⚙️🔋',
    item1: 'overclocked_dynamo',
    item2: 'cascade_capacitor',
    desc: 'Ability hits fully refresh paddle dash charges and refund 40% cooldown across all ability slots.'
  },
  ion_storm_artillery: {
    id: 'ion_storm_artillery',
    name: 'Ion Flak Barrage',
    icon: '⚡💣',
    item1: 'ion_diffuser',
    item2: 'phantom_artillery_storm',
    desc: 'Phantom cluster shells discharge chaining ion arcs on detonation, paralyzing elite hostiles for 3s.'
  },
  nanite_transmutation: {
    id: 'nanite_transmutation',
    name: 'Nanite Alchemy Forge',
    icon: '🤖💎',
    item1: 'nanite_recycler',
    item2: 'core_transmuter',
    desc: 'Enemy projectile destructions guarantee Data Chip drops and grant a 10% chance for raw Gems.'
  },
  bismuth_citadel: {
    id: 'bismuth_citadel',
    name: 'Bismuth Fortress Bastion',
    icon: '🧱🏰',
    item1: 'bismuth_alloy',
    item2: 'nano_citadel',
    desc: 'Massive paddle width is reinforced with an adaptive nanite bulkhead that halves all incoming hull damage.'
  },
  graviton_superconductor: {
    id: 'graviton_superconductor',
    name: 'Graviton Rail Accelerator',
    icon: '🧲🚄',
    item1: 'graviton_anchor',
    item2: 'supercharged_annihilator',
    desc: 'Anchoring the ball charges rail kinetic capacitors to 500% power, firing a rail-shot that pierces the vault.'
  },
  holographic_bulwark: {
    id: 'holographic_bulwark',
    name: 'Holographic Aegis Dome',
    icon: '🛡️🔮',
    item1: 'holographic_baffle',
    item2: 'fortress_protocol',
    desc: 'Taking damage projects a duplicate paddle and energy barrier covering the entire bottom border for 6s.'
  },
  flux_kinetic_dynamo: {
    id: 'flux_kinetic_dynamo',
    name: 'Zero-Drift Kinetic Engine',
    icon: '🌀🚀',
    item1: 'flux_stabilizer',
    item2: 'kinetic_flywheel',
    desc: 'Zero drift paddle handling amplifies ball deflection angle precision, guaranteeing +50% momentum transfer.'
  },
  thermal_inferno_core: {
    id: 'thermal_inferno_core',
    name: 'Superheated Reactor Core',
    icon: '🔥🛡️',
    item1: 'thermal_plating',
    item2: 'infernal_cataclysm',
    desc: 'Immunity to burn hazards is converted into continuous radiating heat aura melting incoming missiles.'
  },

// ============================================================================
  // CROSS-PATH ADVANCED HYBRID FUSIONS FOR ALL 25 PATHS (13 NEW FUSIONS)
  // ============================================================================
  blood_bastion: {
    id: 'blood_bastion',
    name: 'Blood Bastion',
    icon: '🩸🛡️',
    item1: 'vampiric_frenzy',
    item2: 'iron_bastion',
    desc: 'Siphoned HP overflow permanently bolsters paddle width by +15% and grants +1 permanent shield charge per floor.'
  },
  toxic_napalm: {
    id: 'toxic_napalm',
    name: 'Toxic Napalm Storm',
    icon: '🔥🧪',
    item1: 'napalm_wake',
    item2: 'toxic_canisters',
    desc: 'Fire and caustic acid fuse into persistent chemical napalm pools that melt armor and burn indefinitely.'
  },
  polar_singularity: {
    id: 'polar_singularity',
    name: 'Polar Singularity',
    icon: '🌌🧲',
    item1: 'gravity_battery',
    item2: 'flux_steering_module',
    desc: 'Electromagnetic ball curving creates gravitational micro-vortices that pull stray balls and chips into orbit.'
  },
  temporal_execution: {
    id: 'temporal_execution',
    name: 'Temporal Execution',
    icon: '⏳🎯',
    item1: 'time_slip_overdrive',
    item2: 'apex_calibrator',
    desc: 'Exiting time dilation guarantees a 4.0x temporal execution critical strike that shatters elite armor.'
  },
  nanite_swarm_relay: {
    id: 'nanite_swarm_relay',
    name: 'Nanite Swarm Relay',
    icon: '🦠🛸',
    item1: 'plague_hive_nanites',
    item2: 'nano_sentry',
    desc: 'Combat sentries fire nanite-coated darts that infest struck blocks and autonomously dissolve structures.'
  },
  shadow_railgun: {
    id: 'shadow_railgun',
    name: 'Shadow Railgun',
    icon: '🥷🚀',
    item1: 'smoke_decoy_emitter',
    item2: 'kinetic_battery',
    desc: 'Uncloaking from camouflage fires an instant charged hyper-railgun beam with zero charge delay!'
  },
  seismic_shock: {
    id: 'seismic_shock',
    name: 'Seismic Shockwave',
    icon: '🔊💥',
    item1: 'ultrasonic_pulse',
    item2: 'momentum_reactor',
    desc: 'Acoustic shatterwaves trigger room-wide seismic earthquake tremors, stunning all enemies for 2.0s.'
  },
  hyper_overdrive: {
    id: 'hyper_overdrive',
    name: 'Hyper-Overdrive Matrix',
    icon: '⚙️⚡',
    item1: 'capacitor_surge',
    item2: 'accelerator_shard',
    desc: 'Thermal overclocking eliminates velocity caps, compounding ball acceleration by +10% per bounce.'
  },
  kaleidoscope_warp: {
    id: 'kaleidoscope_warp',
    name: 'Kaleidoscope Warp',
    icon: '🪞🌀',
    item1: 'spectrum_lance',
    item2: 'phase_inversion',
    desc: 'Refracted light beams phase through indestructible obstacles and spawn 2 persistent spectral clone balls.'
  },
  contagion_hive: {
    id: 'contagion_hive',
    name: 'Contagion Hive',
    icon: '🧪🦠',
    item1: 'necrotic_detonation',
    item2: 'self_replicating_nanites',
    desc: 'Acid explosions spawn aggressive nanite parasites that autonomously swarm and devour adjacent targets.'
  },
  vector_curve: {
    id: 'vector_curve',
    name: 'Vector Curve Ricochet',
    icon: '🧲🪃',
    item1: 'flux_inversion_pulse',
    item2: 'ricochet_shrapnel',
    desc: 'Steered balls gain +40% velocity on wall hits and release high-voltage piercing shrapnel needles.'
  },
  photonic_lance: {
    id: 'photonic_lance',
    name: 'Photonic Lance',
    icon: '☀️💎',
    item1: 'helios_lance',
    item2: 'precision_lens',
    desc: 'Center deflections fire a concentrated solar death ray that vaporizes entire columns and melts boss shields.'
  },
  spring_loaded_slam: {
    id: 'spring_loaded_slam',
    name: 'Spring-Loaded Slam',
    icon: '💡💥',
    item1: 'perpetual_motion_engine',
    item2: 'impact_core',
    desc: 'Bumper springs multiply ball exit speed by 2.2x and launch spinning explosive bouncy gears across the room.'
  }
};

// ============================================================================
// QUANTUM CASINO CONFIGURATION (THE NEON EXCHANGE)
// ============================================================================
const CASINO_CONFIG = {
  wagers: {
    safe: { id: 'safe', name: 'Safe Spin', cost: 15, icon: '🪙', desc: 'Low risk. Minor rewards: Cores, shield shards, minor heals, overdrive surges.' },
    highRoller: { id: 'highRoller', name: 'High-Roller Spin', cost: 40, icon: '💎', desc: 'Medium risk. High rewards: Rare/Epic upgrades, large Cores cache, or minor system drain.' },
    overdrive: { id: 'overdrive', name: 'Overdrive All-In', cost: 80, icon: '🔥', desc: 'Extreme risk! Chance for CYBER JACKPOT (Legendary + 250 Cores), or severe -2 HP damage!' }
  },
  maxSpinsPerRoom: 3
};

// Build-Specific Casino Gambles
const CASINO_BUILD_GAMBLES = {
  gambler: { name: 'Lucky Spin', bonusText: 'Double jackpot sector width (+100% jackpot chance)!' },
  quantum: { name: 'Probability Shift', bonusText: 'Rerolls negative outcomes automatically once per visit.' },
  kinetic: { name: 'High Impact Bet', bonusText: 'Winning spins also grant +25% permanent smash impact.' },
  cryo: { name: 'Cold Streak', bonusText: 'Guarantees either an Energy Shield or Nanite Repair on spin.' },
  drone: { name: 'Automated Wager', bonusText: 'Adds autonomous drone upgrades to the prize pool.' }
};

// ============================================================================
// BUILD CODEX DATABASE & HOW-TO-BUILD TUTORIAL
// ============================================================================
const CODEX_DATA = {
  howToBuild: {
    title: 'How to Build in CYBER-BREAKER',
    subtitle: 'Mastering Synergies, Specialization, and Strategic Trade-Offs',
    sections: [
      {
        heading: '1. Primary Combat Path (Floor 2)',
        body: 'Upon clearing Floor 2, you select 1 of 25 Primary Combat Paths. This choice defines your core signature mechanic, unlocks exclusive Tier 2 & 3 upgrades in drafts, and shapes your ball and paddle interactions.'
      },
      {
        heading: '2. Secondary Specialization (Floor 4)',
        body: 'On Floor 4, you unlock a Secondary Specialization branch compatible with your Primary Path. This unlocks powerful cross-path Hybrid Upgrades and top-tier Fusions.'
      },
      {
        heading: '3. Synergy Thresholds',
        body: 'Collecting upgrades matching your path tags builds synergy. Reaching 3 tags grants Synergy Level I (+15% efficiency), 6 tags grants Level II (+30% efficiency), and 9 tags unlocks Path Mastery.'
      },
      {
        heading: '4. Fusions & Recipes',
        body: 'Fusions occur when you collect two compatible partner upgrades. Fusions do not merely grant boring stats; they transform your abilities and introduce game-changing mechanics.'
      },
      {
        heading: '5. Meaningful Trade-Offs',
        body: 'True builds require commitment. Glass-cannon builds sacrifice maximum HP for blistering damage; tank builds trade burst speed for resilient barrier shields. Tailor your strategy to survive Sector Bosses.'
      }
    ]
  },
  exampleBuilds: [
    {
      name: 'The Storm Ball',
      primary: 'Electromagnetic',
      secondary: 'Drone Command',
      fusions: ['Overcharged Arc Fleet', 'EMP Fleet'],
      summary: 'Automated drones deploy while lightning arcs chain through entire swarms of enemies, disabling turrets.'
    },
    {
      name: 'The Glacier Smasher',
      primary: 'Cryo',
      secondary: 'Ricochet',
      fusions: ['Frozen Pinball Storm', 'Absolute Zero'],
      summary: 'Wall bounces spray razor-sharp frost needles, freezing entire formations before shattering them with heavy hits.'
    },
    {
      name: 'The Titan Fortress',
      primary: 'Juggernaut',
      secondary: 'Artillery',
      fusions: ['Fortress Protocol', 'Rail Impact'],
      summary: 'Absorb punishing barrages with heavy armor while charging up catastrophic screen-clearing Railgun strikes.'
    },
    {
      name: 'The Ghost Sniper',
      primary: 'Critical / Precision',
      secondary: 'Quantum',
      fusions: ['Phase Strike', 'Fractal Resonator'],
      summary: 'Center critical hits phase cleanly through defensive shields to assassinate high-threat core generators.'
    },
    {
      name: 'The High-Roller Velocity',
      primary: 'Velocity',
      secondary: 'Gambler / Chaos',
      fusions: ['Velocity Breaker', 'Probability Singularity'],
      summary: 'Unleash blistering ball speeds with chaotic damage rolls, chasing thrilling jackpots in the Quantum Casino.'
    }
  ]
};

// ============================================================================
// BLACK MARKET MODS, ACTIVE ABILITIES, LAB PASSIVES & SECTOR NAMES (100% ENGLISH)
// ============================================================================
const BLACK_MARKET_MODS = {
  // Very Cheap Tier (35-45 Cores)
  mod_smuggler: { id: 'mod_smuggler', name: "Smuggler's Stash", icon: '📦', cost: 35, desc: 'Start every new run immediately with 1 random Rare or Epic upgrade installed.' },
  mod_reckless_greed: { id: 'mod_reckless_greed', name: 'Corrupt Data Siphon', icon: '💸', cost: 40, desc: 'Earn +60% more Data Chips throughout the run, but enemy projectiles travel 20% faster.', tradeOff: '+20% Bullet Speed' },
  mod_overclocked_servos: { id: 'mod_overclocked_servos', name: 'Overclocked Servo Actuators', icon: '🏎️', cost: 45, desc: '+30% Paddle movement speed, but paddle width is shortened by 15%.', tradeOff: '-15% Paddle Width' },

  // Cheap Tier (60-100 Cores)
  mod_black_ice: { id: 'mod_black_ice', name: 'Black-Ice Siphon', icon: '🧊', cost: 75, desc: 'Every 10-hit rally combo awards +1 bonus Cyber Core via data siphon.' },
  mod_overcharge: { id: 'mod_overcharge', name: 'Overcharge Capacitor', icon: '🔋', cost: 80, desc: 'Active combat ability cooldowns recharge permanently 25% faster.' },
  mod_glass_cannon: { id: 'mod_glass_cannon', name: 'Hyper-Overdrive Core', icon: '⚡', cost: 90, desc: '+40% ball damage and ball speed, but paddle maximum HP is reduced by 1.', tradeOff: '-1 Max HP' },
  mod_blood_pact: { id: 'mod_blood_pact', name: 'Cybernetic Leech', icon: '🩸', cost: 95, desc: 'Restores 1 HP after every 30-hit combo, but run shop prices increase by +25%.', tradeOff: '+25% Shop Prices' },
  mod_wildcard_chip: { id: 'mod_wildcard_chip', name: 'Wildcard Firmware', icon: '🃏', cost: 100, desc: 'Upgrade drafts offer 4 choices instead of 3, but rerolls cost double Data Chips.', tradeOff: '2x Reroll Cost' },

  // Mid Tier (140-250 Cores)
  mod_emp_matrix: { id: 'mod_emp_matrix', name: 'Emergency EMP Matrix', icon: '⚡', cost: 150, desc: 'When Second Chance triggers, 50% of all bricks on screen are pulverized.' },
  mod_unstable_reactor: { id: 'mod_unstable_reactor', name: 'Unstable Antimatter Cell', icon: '☢️', cost: 175, desc: 'Ball explosions deal +100% blast radius, but taking hull damage reduces combo score.', tradeOff: 'Penalty on hit' },
  mod_dark_matter: { id: 'mod_dark_matter', name: 'Dark Matter Converter', icon: '🌌', cost: 180, desc: 'Unlocks the mythic Dark Matter Ball (attracts nearby bricks and implodes).' },
  mod_titan_chassis: { id: 'mod_titan_chassis', name: 'Titan Bulkhead Armor', icon: '🛡️', cost: 190, desc: 'Gain +2 Maximum HP and +1 Shield Charge, but paddle movement speed is reduced by 15%.', tradeOff: '-15% Paddle Speed' },
  mod_void_edge: { id: 'mod_void_edge', name: 'Void Piercer Lens', icon: '🕳️', cost: 210, desc: 'Critical strikes pierce completely through barriers, but regular hits deal 15% less damage.', tradeOff: '-15% Non-Crit DMG' },
  mod_nanite_infusion: { id: 'mod_nanite_infusion', name: 'Nanite Bloodstream', icon: '🧪', cost: 220, desc: 'Slowly auto-repairs 1 HP every 2 minutes of survival, but shield charges absorb 1 fewer hit.', tradeOff: 'Weaker Shields' },
  mod_quantum_gamble: { id: 'mod_quantum_gamble', name: 'Quantum Casino Dice', icon: '🎲', cost: 230, desc: 'Casino spins cost 30% fewer chips and offer higher payout weights, but lose outcomes deal 1 HP damage.', tradeOff: 'Loss Deals 1 DMG' },
  mod_toxic_overdrive: { id: 'mod_toxic_overdrive', name: 'Caustic Overdrive Injector', icon: '☣️', cost: 240, desc: 'All hits inflict stacking acid burn, but losing a ball deducts 20 Data Chips.', tradeOff: '-20 Chips on Ball Loss' },
  mod_supercharged_capacitor: { id: 'mod_supercharged_capacitor', name: 'Supercharged Rail Capacitor', icon: '🔋', cost: 250, desc: 'Active abilities gain +50% power and duration, but cooldowns are lengthened by 20%.', tradeOff: '+20% Ability CD' },

  // Expensive Tier (320-480 Cores)
  mod_high_roller: { id: 'mod_high_roller', name: 'High-Roller Protocol', icon: '🎰', cost: 320, desc: 'Defeated Sector Bosses are guaranteed to drop double Cyber Cores.' },
  mod_bounty_hunter: { id: 'mod_bounty_hunter', name: 'Apex Bounty Contract', icon: '📜', cost: 350, desc: 'Sector Bosses drop 2 extra upgrades upon defeat, but deal +1 bonus damage on hit.', tradeOff: 'Deadlier Boss Hits' },
  mod_heavy_ordnance: { id: 'mod_heavy_ordnance', name: 'Heavy Ballast Payload', icon: '💣', cost: 380, desc: 'Ball mass increased by 50% crushing heavy barriers effortlessly, but ball launch speed is reduced by 15%.', tradeOff: '-15% Launch Speed' },
  mod_mirror_matrix: { id: 'mod_mirror_matrix', name: 'Prismatic Mirror Shield', icon: '🪞', cost: 420, desc: 'Reflects 100% of enemy bullets back as friendly laser bolts, but shield recharge time is doubled.', tradeOff: '2x Shield CD' },
  mod_ghost_protocol: { id: 'mod_ghost_protocol', name: 'Ghost Shift Protocol', icon: '👻', cost: 450, desc: 'Paddle becomes invulnerable for 1.2s after deflecting a ball, but active ability charge is consumed on hit.', tradeOff: 'Drains Ability' },

  // Very Expensive Tier (600+ Cores)
  mod_drone_swarm_core: { id: 'mod_drone_swarm_core', name: 'Autonomous Swarm Hub', icon: '🛸', cost: 620, desc: 'Spawns 2 additional permanent combat drones, but paddle smash power is reduced by 25%.', tradeOff: '-25% Paddle Smash' },
  mod_singular_focus: { id: 'mod_singular_focus', name: 'Monolithic Focus Core', icon: '🧿', cost: 750, desc: 'Maximum ball count locked to 1, but this single ball deals +200% catastrophic damage and has double hitbox radius.', tradeOff: 'Single Ball Only' },

  // New Version 2.0 Black Market Augmentations (+16 Mods)
  mod_subzero_coolant: { id: 'mod_subzero_coolant', name: 'Cryo-Heatsink Infusion', icon: '❄️', cost: 40, desc: 'Paddle never overheats and ball retains ice coating 50% longer, but launch speed is 10% slower.', tradeOff: '-10% Launch Speed' },
  mod_phantom_shift: { id: 'mod_phantom_shift', name: 'Phase Displacement Core', icon: '🌌', cost: 85, desc: 'Phases cleanly through hostile drones for 1s after deflections, but reduces paddle width by 10%.', tradeOff: '-10% Width' },
  mod_kinetic_dynamo: { id: 'mod_kinetic_dynamo', name: 'Kinetic Dynamo Matrix', icon: '💨', cost: 95, desc: 'Moving the paddle generates kinetic charge that releases on ball impact, but stationary hits deal 20% less.', tradeOff: '-20% Static DMG' },
  mod_chrono_stutter: { id: 'mod_chrono_stutter', name: 'Temporal Stutter Drive', icon: '⏳', cost: 160, desc: 'Incoming high-speed balls decelerate by 40% when close to the paddle, but overall run score is reduced by 15%.', tradeOff: '-15% Score' },
  mod_hyper_drain: { id: 'mod_hyper_drain', name: 'Hyper-Drain Syringe', icon: '💉', cost: 185, desc: 'Destroying elite enemies restores 1 HP immediately, but maximum HP is capped at 4.', tradeOff: 'Max 4 HP' },
  mod_arc_cascade: { id: 'mod_arc_cascade', name: 'Tesla Arc Cascade', icon: '⚡', cost: 200, desc: 'Every 3rd paddle hit zaps 3 nearby targets with chain lightning, but increases incoming bullet speed by 15%.', tradeOff: '+15% Bullet Speed' },
  mod_heist_scrambler: { id: 'mod_heist_scrambler', name: 'Heist Cipher Decryptor', icon: '🔓', cost: 215, desc: 'Cyber Heist vaults grant +50% Data Chips and caches have 1 less HP, but turrets fire 20% faster.', tradeOff: '+20% Turret Speed' },
  mod_swarm_disruptor: { id: 'mod_swarm_disruptor', name: 'Swarm Frequency Jammer', icon: '📡', cost: 225, desc: 'Swarm drones move 25% slower and have 20% less health, but drop 30% fewer Cores.', tradeOff: '-30% Swarm Cores' },
  mod_casino_overclock: { id: 'mod_casino_overclock', name: 'Casino Quantum Bias', icon: '🎰', cost: 240, desc: 'Increases Casino wheel positive outcomes by +40%, but wager cost is increased by 20%.', tradeOff: '+20% Wager Cost' },
  mod_explosive_ricochet: { id: 'mod_explosive_ricochet', name: 'Concussive Ricochet Core', icon: '💣', cost: 330, desc: 'Wall bounces detonate a micro-shockwave that breaks nearby bricks, but paddle takes self-damage on 60+ combos.', tradeOff: 'Combo Hazard' },
  mod_plasma_overdrive: { id: 'mod_plasma_overdrive', name: 'Searing Plasma Injector', icon: '🔥', cost: 360, desc: 'Imbues all balls with permanent scorching plasma, but energy shield charges deplete twice as fast.', tradeOff: '2x Shield Drain' },
  mod_void_siphon_matrix: { id: 'mod_void_siphon_matrix', name: 'Void Siphon Inversion', icon: '🕳️', cost: 390, desc: 'Absorbs enemy bullets to charge active abilities, but paddle width is narrowed by 20%.', tradeOff: '-20% Width' },
  mod_orbital_defense: { id: 'mod_orbital_defense', name: 'Orbital Aegis Array', icon: '🛰️', cost: 430, desc: 'Spawns an orbital defensive satellite that intercepts bullets and balls, but reduces base paddle speed by 20%.', tradeOff: '-20% Speed' },
  mod_nano_swarm_matrix: { id: 'mod_nano_swarm_matrix', name: 'Nanite Swarm Injector', icon: '🩹', cost: 460, desc: 'Nanites passively restore 1 HP after every 2 completed floors, but starting Cores in new runs is zeroed.', tradeOff: 'No Start Cores' },
  mod_quantum_duplicator: { id: 'mod_quantum_duplicator', name: 'Quantum Duplication Matrix', icon: '🔮', cost: 680, desc: 'Every ball serve automatically launches a temporary split phantom ball, but maximum HP is locked to 3.', tradeOff: 'Max 3 HP' },
  mod_apex_sovereign_core: { id: 'mod_apex_sovereign_core', name: 'Apex Sovereign Core', icon: '👑', cost: 800, desc: 'All critical hits deal 3.5x damage and shatter barriers instantly, but non-critical hits deal only 50% damage.', tradeOff: '-50% Non-Crit DMG' }
};

const ACTIVE_ABILITIES = {
  shockwave: { id: 'shockwave', name: 'Kinetic Shockwave', icon: '⚡', desc: 'Concussive energy wave that accelerates balls, clears incoming bullets, and fractures blocks.', cooldownTicks: 300, cost: 0 },
  laser: { id: 'laser', name: 'Plasma Laser Cannon', icon: '🔫', desc: 'Fires 3 piercing lasers that shatter bricks and stun the opponent paddle for 1.5s!', cooldownTicks: 360, cost: 45 },
  anchor: { id: 'anchor', name: 'Gravity Tether', icon: '🧲', desc: 'Magnetically pulls the nearest active ball directly back to your paddle.', cooldownTicks: 420, cost: 70 },
  emp_blast: { id: 'emp_blast', name: 'EMP Grid Discharge', icon: '💫', desc: 'Emits a room-wide EMP pulse that clears all enemy projectiles and freezes enemy turrets/drones for 3.0s.', cooldownTicks: 360, cost: 50 },
  cryo_freeze: { id: 'cryo_freeze', name: 'Cryo Flash Freeze', icon: '❄️', desc: 'Instantly flash-freezes all enemies and slows balls down to 30% speed for precise paddle positioning for 4.0s.', cooldownTicks: 400, cost: 55 },
  overdrive_boost: { id: 'overdrive_boost', name: 'Overdrive Thruster', icon: '🔥', desc: 'Boosts paddle speed by +100% and grants instant Smash strike to any ball deflected in the next 3.5s.', cooldownTicks: 320, cost: 40 },
  nano_swarm: { id: 'nano_swarm', name: 'Nanite Repair Cloud', icon: '🩹', desc: 'Deploys a swarm of medical nanites restoring 1 HP and generating a temporary 5-second protective barrier.', cooldownTicks: 600, cost: 80 },
  railgun_snipe: { id: 'railgun_snipe', name: 'Hyper Railgun Strike', icon: '🎯', desc: 'Fires a high-velocity piercing railgun slug down the arena center dealing 500 damage to all obstacles in line.', cooldownTicks: 340, cost: 60 },
  quantum_clone: { id: 'quantum_clone', name: 'Quantum Duplication', icon: '🔮', desc: 'Instantly duplicates all active balls on screen into phased quantum energy spheres.', cooldownTicks: 450, cost: 65 },
  gravity_vortex: { id: 'gravity_vortex', name: 'Gravitational Singularity', icon: '🕳️', desc: 'Deploys a gravitational singularity at arena center for 4.0s, sucking in hostiles and bending ball paths.', cooldownTicks: 420, cost: 60 },
  missile_barrage: { id: 'missile_barrage', name: 'Micro-Missile Barrage', icon: '🚀', desc: 'Launches 8 homing micro-missiles that seek out and destroy the lowest-HP enemy targets or bricks.', cooldownTicks: 380, cost: 55 },
  time_dilation: { id: 'time_dilation', name: 'Chrono Time Warp', icon: '⏳', desc: 'Slows down game time by 60% for 4.5s while leaving player paddle movement at full speed.', cooldownTicks: 480, cost: 70 },
  aegis_dome: { id: 'aegis_dome', name: 'Fortress Energy Dome', icon: '🛡️', desc: 'Raises an impenetrable energy wall across the bottom of the screen for 6.0s, preventing any ball loss.', cooldownTicks: 500, cost: 75 },
  chain_lightning: { id: 'chain_lightning', name: 'Tesla Arc Overload', icon: '⚡', desc: 'Unleashes a chain lightning discharge that arcs between up to 8 targets, shocking each for heavy damage.', cooldownTicks: 360, cost: 50 },
  orbital_laser: { id: 'orbital_laser', name: 'Orbital Ion Cannon', icon: '🛰️', desc: 'Laser-designates the highest health target on screen and calls down a massive orbital beam vaporizing it.', cooldownTicks: 520, cost: 75 },

  // New Version 2.0 Active Abilities (+12 Abilities)
  void_rip: { id: 'void_rip', name: 'Void Dimensional Rift', icon: '🌀', desc: 'Rips open a dimensional void for 4.0s that swallows all enemy projectiles and damages overlapping foes.', cooldownTicks: 380, cost: 60 },
  kinetic_anchor: { id: 'kinetic_anchor', name: 'Kinetic Anchor Tether', icon: '⚓', desc: 'Instantly halts all balls on screen for 1.2s, locking them in place for precise tactical aim.', cooldownTicks: 300, cost: 45 },
  cryo_lance: { id: 'cryo_lance', name: 'Cryo Lance Piercer', icon: '🧊', desc: 'Fires a high-velocity cryogenic ice lance that freezes and shatters a full row of targets.', cooldownTicks: 340, cost: 55 },
  firewall_barrier: { id: 'firewall_barrier', name: 'Firewall Defensive Grid', icon: '🔥🛡️', desc: 'Deploys a burning thermal barrier ahead of the paddle that incinerates bullets and adds fire to deflections.', cooldownTicks: 400, cost: 65 },
  holo_decoy: { id: 'holo_decoy', name: 'Holographic Phantom Decoy', icon: '🪞', desc: 'Projects a mirror decoy that deflects balls and confuses enemy drone tracking for 5.0s.', cooldownTicks: 360, cost: 50 },
  spark_flare: { id: 'spark_flare', name: 'Spark Flare Discharge', icon: '✨', desc: 'Unleashes a radial blast of 12 electrical sparks in all directions, blinding and damaging targets.', cooldownTicks: 320, cost: 40 },
  rewind_clock: { id: 'rewind_clock', name: 'Chrono Time Rewind', icon: '⏪', desc: 'Rewinds player position and ball state by 2.0s, giving a second chance on missed balls.', cooldownTicks: 550, cost: 85 },
  overcharge_capacitor: { id: 'overcharge_capacitor', name: 'Overcharge Capacitor Surge', icon: '🔋', desc: 'Overcharges the paddle battery, firing automatic twin laser salvos on every deflection for 6.0s.', cooldownTicks: 420, cost: 70 },
  stasis_field: { id: 'stasis_field', name: 'Stasis Field Anomaly', icon: '🌐', desc: 'Deploys a localized stasis bubble that suspends all enemies and bullets inside for 3.5s.', cooldownTicks: 460, cost: 75 },
  railgun_matrix: { id: 'railgun_matrix', name: 'Railgun Battery Salvo', icon: '⚡🎯', desc: 'Fires 3 parallel high-energy railgun beams across top, center, and bottom lanes simultaneously.', cooldownTicks: 480, cost: 80 },
  nanite_burst: { id: 'nanite_burst', name: 'Nanite Shock Infusion', icon: '🧬', desc: 'Releases a swarm of explosive medical nanites that repair +1 HP and detonate nearby drones.', cooldownTicks: 520, cost: 80 },
  singularity_pull: { id: 'singularity_pull', name: 'Singularity Grav-Well', icon: '🕳️', desc: 'Opens a micro-singularity behind enemy lines, sucking in drones and curving balls inward.', cooldownTicks: 440, cost: 70 }
};

const RESEARCH_CATEGORIES = [
  { id: 'combat', name: 'Combat', icon: '⚔️' },
  { id: 'defense', name: 'Defense', icon: '🛡️' },
  { id: 'economy', name: 'Economy', icon: '💾' },
  { id: 'control', name: 'Control', icon: '🧲' },
  { id: 'heist', name: 'Cyber Heist', icon: '🔓' },
  { id: 'risk', name: 'Risk & Casino', icon: '🎰' }
];

const RESEARCH_ABILITIES = [
  // COMBAT
  { id: 'meta_smash', category: 'combat', name: 'Engine Tuning', icon: '🚀', desc: '+10% higher base paddle smash power per level.', maxLevel: 4, costs: [25, 65, 150, 320] },
  { id: 'meta_crit_matrix', category: 'combat', name: 'Critical Matrix', icon: '🎯', desc: 'Widens paddle precision crit zone by +15% and adds +0.3x crit damage multiplier.', maxLevel: 3, costs: [40, 110, 240] },
  { id: 'meta_kinetic_coil', category: 'combat', name: 'Kinetic Overdrive', icon: '⚡', desc: 'Increases ball exit velocity on deflection by +8% per level.', maxLevel: 3, costs: [35, 95, 210] },
  { id: 'meta_bastion_buster', category: 'combat', name: 'Bastion Buster', icon: '💥', desc: 'Deals +35% bonus ball damage against heavy Bastions and Mini-Bosses.', maxLevel: 2, costs: [75, 180] },

  // DEFENSE
  { id: 'meta_hull', category: 'defense', name: 'Hull Reinforcement', icon: '🛡️', desc: '+1 Extra Maximum HP per level at the start of every run.', maxLevel: 4, costs: [30, 80, 180, 360] },
  { id: 'meta_defibrillator', category: 'defense', name: 'Second Chance (Defib)', icon: '❤️‍🩹', desc: 'Survive one fatal miss per run, reviving immediately at 1 HP.', maxLevel: 1, costs: [150] },
  { id: 'meta_kinetic_shield', category: 'defense', name: 'Aegis Generator', icon: '🔰', desc: 'Start every sector with +1 Kinetic Shield Charge automatically.', maxLevel: 3, costs: [50, 120, 260] },
  { id: 'meta_emp_burst', category: 'defense', name: 'Emergency EMP Wave', icon: '💫', desc: 'Taking hull damage unleashes an EMP shockwave pushing enemies away and dissolving bullets.', maxLevel: 2, costs: [60, 140] },

  // ECONOMY
  { id: 'meta_scavenger', category: 'economy', name: 'Scavenger Protocol', icon: '💎', desc: '+8% increased chance for Cores and Data Chips from broken targets.', maxLevel: 4, costs: [35, 90, 220, 450] },
  { id: 'meta_data_extractor', category: 'economy', name: 'Data Siphon', icon: '💾', desc: 'Elite and boss units drop +35% additional Data Chips during runs.', maxLevel: 3, costs: [45, 115, 250] },
  { id: 'meta_black_market', category: 'economy', name: 'Black Market License', icon: '🗝️', desc: 'Run Shops have a 30% higher chance to stock Epic and Legendary items.', maxLevel: 2, costs: [70, 160] },
  { id: 'meta_bargain_hunter', category: 'economy', name: 'Cyber Discount', icon: '🏷️', desc: 'Reduces all Run Shop item prices and reroll costs by 15%.', maxLevel: 2, costs: [55, 130] },

  // CONTROL
  { id: 'meta_servos', category: 'control', name: 'Servo Acceleration', icon: '🏎️', desc: '+8% paddle movement speed and agility per level.', maxLevel: 4, costs: [30, 75, 160, 310] },
  { id: 'meta_chrono_anchor', category: 'control', name: 'Chrono Dampener', icon: '⏳', desc: 'Incoming high-velocity balls slow by 20% when within 70px of the paddle.', maxLevel: 2, costs: [65, 150] },
  { id: 'meta_drone_relay', category: 'control', name: 'Fleet Uplink', icon: '🛸', desc: 'Friendly drones and satellites fire 25% faster with improved tracking.', maxLevel: 3, costs: [40, 100, 220] },
  { id: 'meta_magnetic_pull', category: 'control', name: 'Magnetic Attractor', icon: '🧲', desc: 'Magnetically pulls floating Cores and Data Chips toward your paddle.', maxLevel: 2, costs: [35, 90] },

  // CYBER HEIST
  { id: 'meta_heist_toolkit', category: 'heist', name: 'Heist Master Toolkit', icon: '🔓', desc: 'Begin each Cyber Heist encounter with 1 security node already breached.', maxLevel: 2, costs: [60, 140] },
  { id: 'meta_firewall_breaker', category: 'heist', name: 'Firewall Inversion', icon: '🔥', desc: 'Ball impacts deal +40% damage against Cyber Heist security nodes.', maxLevel: 3, costs: [45, 110, 230] },
  { id: 'meta_cache_scanner', category: 'heist', name: 'Cache Decryptor', icon: '📡', desc: 'Data Caches require 1 fewer hit to breach and extract.', maxLevel: 2, costs: [75, 175] },
  { id: 'meta_overclock_dampener', category: 'heist', name: 'Security Spoofing', icon: '⏱️', desc: 'System Overclock builds 20% slower during Cyber Heist encounters.', maxLevel: 2, costs: [50, 120] },

  // RISK & CASINO
  { id: 'meta_jackpot_protocol', category: 'risk', name: 'High-Roller VIP', icon: '🌟', desc: 'Increases Casino jackpot odds across all tiers by +50%.', maxLevel: 2, costs: [80, 200] },
  { id: 'meta_gambler_insurance', category: 'risk', name: "Gambler's Insurance", icon: '🎲', desc: 'Refunds 50% of your wagered Data Chips when landing on Lose Wager.', maxLevel: 2, costs: [65, 150] },

  // New Version 2.0 Research Abilities (+16 Abilities)
  { id: 'meta_overdrive_amp', category: 'combat', name: 'Overdrive Amplifier', icon: '🔥', desc: '+15% damage during active Overdrive surge per level.', maxLevel: 3, costs: [40, 100, 220] },
  { id: 'meta_smash_pierce', category: 'combat', name: 'Smash Penetrator', icon: '🏹', desc: 'Smashed deflections gain a 25% chance to pierce through the first block.', maxLevel: 2, costs: [60, 150] },
  { id: 'meta_ball_speed_cap', category: 'combat', name: 'Terminal Velocity Drive', icon: '🏎️', desc: 'Increases maximum ball terminal speed cap by +10% per level.', maxLevel: 2, costs: [50, 130] },

  { id: 'meta_plating_reinforce', category: 'defense', name: 'Sweet-Spot Calibration', icon: '🎯', desc: 'Expands the paddle center sweet spot width by +15% per level.', maxLevel: 3, costs: [35, 90, 200] },
  { id: 'meta_hazard_dampener', category: 'defense', name: 'Hazard Inversion Field', icon: '🛡️', desc: 'Reduces collision damage and displacement from room hazards by 25%.', maxLevel: 2, costs: [55, 130] },
  { id: 'meta_emergency_barrier', category: 'defense', name: 'Clutch Forcefield', icon: '🔰', desc: 'When reduced to 1 HP, instantly gain a 4-second invulnerability dome once per sector.', maxLevel: 2, costs: [75, 180] },

  { id: 'meta_crypto_interest', category: 'economy', name: 'Encrypted Dividend', icon: '📈', desc: 'Begin each sector with +15 bonus Data Chips per level.', maxLevel: 3, costs: [30, 75, 160] },
  { id: 'meta_salvage_protocol', category: 'economy', name: 'Core Extraction Protocol', icon: '💎', desc: 'Destroying security nodes or elite drones has a 20% chance to drop +1 bonus Core.', maxLevel: 2, costs: [65, 150] },

  { id: 'meta_tractor_beam', category: 'control', name: 'Grav-Tractor Matrix', icon: '🧲', desc: 'Curves deflected balls toward opponent goal or dense brick clusters by +15%.', maxLevel: 2, costs: [50, 120] },
  { id: 'meta_inertia_stabilizer', category: 'control', name: 'Inertia Nullifier', icon: '⚡', desc: 'Instant paddle acceleration with zero turnaround delay or drift.', maxLevel: 2, costs: [60, 140] },

  { id: 'meta_heist_scrambler', category: 'heist', name: 'Turret Spoofing Routine', icon: '📡', desc: 'Cyber Heist security turrets take 1.2s longer to acquire targets.', maxLevel: 2, costs: [55, 130] },
  { id: 'meta_stealth_frequencies', category: 'heist', name: 'Network Ghost Mask', icon: '👻', desc: 'Lowers baseline System Overclock accumulation rate by 25%.', maxLevel: 2, costs: [70, 160] },
  { id: 'meta_cache_siphon', category: 'heist', name: 'Cache Feedback Siphon', icon: '🔓', desc: 'Breaching a Data Cache instantly restores 20% active ability cooldown.', maxLevel: 2, costs: [65, 150] },

  { id: 'meta_luck_capacitor', category: 'risk', name: 'Probability Resonator', icon: '🎰', desc: '+20% higher chance for positive wheel outcomes in all Casino tiers.', maxLevel: 2, costs: [75, 175] },
  { id: 'meta_jackpot_doubler', category: 'risk', name: 'Jackpot Multiplier', icon: '🌟', desc: 'Hitting a Casino Jackpot awards an extra +75 Data Chips.', maxLevel: 2, costs: [85, 210] },
  { id: 'meta_high_roller_badge', category: 'risk', name: 'VIP Casino Membership', icon: '💳', desc: 'Reduces all Casino wager costs by 15%.', maxLevel: 2, costs: [60, 140] }
];

const LAB_PASSIVES = RESEARCH_ABILITIES;

const SECTOR_NAMES = [
  { num: 1, name: 'CYBER CITY', sub: 'NEON GRID PROTOCOL' },
  { num: 2, name: 'COSMIC NEBULA', sub: 'PARALLAX DEEP SPACE' },
  { num: 3, name: 'TOXIC BIO-HAZARD', sub: 'CHEMICAL CORROSION ZONE' },
  { num: 4, name: 'MOLTEN CORE', sub: 'OVERHEAT THERMAL REACTOR' },
  { num: 5, name: 'THE QUANTUM VOID', sub: 'ANOMALOUS SINGULARITY' }
];

// ============================================================================
// SWARM THREAT POWERSCALING SYSTEM & DUEL PERSONALITIES
// ============================================================================
const SWARM_CONFIG = {
  threatCosts: {
    drone: 1,      // Standard Cyber Drone
    skimmer: 2,    // Agile Swift Skimmer
    sentinel: 4,   // Telegraphed Laser Blaster
    kamikaze: 4,   // High-threat Detonator
    bastion: 8     // Armored Heavy Bastion (Floors >= 8)
  },
  minFloors: {
    drone: 1,
    skimmer: 2,
    sentinel: 3,   // Floor 3 Wave 3 gets exactly 1 solo sentinel to teach the mechanic
    kamikaze: 6,   // Never spawns in Sector 1 early swarm (Floor 3)
    bastion: 8     // Elite bastion only from Floor 8+
  },
  baseBudgets: {
    early: [5, 7, 9],       // Floor 3 (Sector 1 Introduction)
    mid: [10, 14, 18],      // Floor 8 (Sector 1-2 Escalation)
    late: [16, 22, 28],     // Floor 13+ (Sector 2-3 Overdrive)
    endgame: [22, 30, 38]   // Floor 18+ (Sector 3+ Critical Mass)
  }
};

const DUEL_PERSONALITIES = {
  aggressor: {
    id: 'aggressor',
    name: 'Cyber-Aggressor',
    icon: '⚡',
    color: '#ff2a6d',
    tag: 'Aggressive / High Pressure',
    desc: 'Closes distance aggressively and aims for sharp cutback angles.',
    speedMult: 1.15,
    sizeMult: 1.0,
    aggression: 0.85,
    attackCooldown: 220
  },
  defender: {
    id: 'defender',
    name: 'Titan Aegis',
    icon: '🛡️',
    color: '#00b0ff',
    tag: 'Defensive Wall',
    desc: 'Wide defensive paddle that holds the center and resists angular spikes.',
    speedMult: 0.90,
    sizeMult: 1.25,
    aggression: 0.40,
    attackCooldown: 300
  },
  trickster: {
    id: 'trickster',
    name: 'Neon Trickster',
    icon: '🌀',
    color: '#d500f9',
    tag: 'Curving Angles',
    desc: 'Applies sudden spin and angular slices to deflect balls unexpectedly.',
    speedMult: 1.08,
    sizeMult: 0.95,
    aggression: 0.70,
    attackCooldown: 240
  },
  artillery: {
    id: 'artillery',
    name: 'Heavy Artillery',
    icon: '🎯',
    color: '#ffd700',
    tag: 'Ranged Blaster',
    desc: 'Charges and fires forward plasma pulses that can be deflected or dodged.',
    speedMult: 0.95,
    sizeMult: 1.10,
    aggression: 0.60,
    attackCooldown: 160
  },
  overclocked: {
    id: 'overclocked',
    name: 'Overclocked Apex',
    icon: '🔥',
    color: '#ef4444',
    tag: 'Enraged / Accelerating',
    desc: 'Accelerates speed and returns balls with blistering velocity when low on HP.',
    speedMult: 1.22,
    sizeMult: 1.0,
    aggression: 0.95,
    attackCooldown: 140
  }
};

// =============================================================================
// CYBER-BREAKER 2.0: GAME MODES, RUN ECONOMY, SHOP, CASINO & BOSS ARCHITECTURE
// =============================================================================

const GAME_MODES = {
  MAIN: {
    id: 'MAIN',
    name: 'MAIN CAMPAIGN',
    tag: 'The Complete Odyssey',
    icon: '⚡',
    desc: 'Level 1 to 50 Roguelike Journey. Battle through Breakout, Swarm, Duels, and Cyber Heist. Visit underground Shops and the Quantum Casino. Conquer Mini-Bosses every 5 levels and 5 Major Bosses, culminating in Level 50 and post-50 Endless.',
    rule: 'Survive to Level 50 & conquer the frontier',
    leaderboardMetric: 'Fastest Lvl 50 / Furthest Endless',
    color: '#00f2fe'
  },
  BENNIE_CHALLENGE: {
    id: 'BENNIE_CHALLENGE',
    name: "BENNIE'S WORKSHOP",
    tag: 'Secret Architect Gauntlet',
    icon: '💡',
    desc: 'Battle Chief Architect Bennie in his isolated experimental workshop. Survive telegraphed laser sweeps, bouncing prototypes, and support drones.',
    rule: 'Defeat Bennie (100 HP) in multi-phase combat',
    leaderboardMetric: 'Secret Completion',
    color: '#ffd700'
  },
  SWARM_ENDLESS: {
    id: 'SWARM_ENDLESS',
    name: 'SWARM — ENDLESS',
    tag: 'Infinite Horde Survival',
    icon: '🛸',
    desc: 'Face an endless onslaught of escalating alien drone hordes. Threat budget, skimmers, and bastions scale indefinitely.',
    rule: 'Survive infinite waves as long as possible',
    leaderboardMetric: 'Furthest Level Reached',
    color: '#00e676'
  },
  DUEL_ENDLESS: {
    id: 'DUEL_ENDLESS',
    name: 'DUEL — ENDLESS',
    tag: '1v1 High-Stakes Tennis',
    icon: '⚔️',
    desc: 'Infinite gauntlet of AI champions cycling through Aggressors, Defenders, Tricksters, Artillery, and Overclocked Apex rivals.',
    rule: 'Defeat increasingly lethal AI opponents',
    leaderboardMetric: 'Furthest Duel Reached',
    color: '#ff2a6d'
  },
  BREAKOUT_ENDLESS: {
    id: 'BREAKOUT_ENDLESS',
    name: 'BREAKOUT — ENDLESS',
    tag: 'Tactical Destruction',
    icon: '🧱',
    desc: 'Infinite procedural brick matrices with regenerating blocks, titanium armor, and reactive explosive cores.',
    rule: 'Clear escalating tactical brick grids',
    leaderboardMetric: 'Furthest Stage Reached',
    color: '#00b0ff'
  },
  HEIST_ENDLESS: {
    id: 'HEIST_ENDLESS',
    name: 'CYBER HEIST — ENDLESS',
    tag: 'Vault Infiltration',
    icon: '💾',
    desc: 'Infiltrate high-security digital networks, shatter defensive security nodes, breach encrypted Data Caches, and survive escalating System Overclocks.',
    rule: 'Breach security nodes & extract caches',
    leaderboardMetric: 'Furthest Security Level',
    color: '#00e676'
  }
};
GAME_MODES.BREAKOUT = GAME_MODES.BREAKOUT_ENDLESS;
GAME_MODES.DUEL = GAME_MODES.DUEL_ENDLESS;
GAME_MODES.SWARM = GAME_MODES.SWARM_ENDLESS;

const DATA_CHIPS_CONFIG = {
  currencyName: 'Data Chips',
  symbol: '💾',
  color: '#ffd700',
  rewards: {
    roomClearBase: 30,
    roomClearPerLevel: 2,
    heistClearBonus: 25,
    heistPerfectBonus: 40,
    heistNodeKill: 8,
    heistCacheCommon: 18,
    heistCacheRare: 35,
    heistCacheEpic: 60,
    heistCacheLegendary: 110,
    heistCacheBlackIce: 180,
    fastDuelBonus: 30,
    miniBossBonus: 80,
    majorBossBonus: 180,
    combo5Bonus: 4,
    combo10Bonus: 12,
    droneKill: 2,
    skimmerKill: 3,
    sentinelKill: 6,
    kamikazeKill: 5,
    bastionKill: 18
  }
};

const SHOP_ITEMS_POOL = [
  // Very Cheap Tier (15-40 Data Chips)
  { id: 'shop_heal_1', name: 'Nanite Medkit (+1 HP)', type: 'heal', rarity: 'common', cost: 20, icon: '❤️', desc: 'Repairs 1 lost HP segment immediately.', healAmount: 1 },
  { id: 'shop_shield_1', name: 'Kinetic Barrier Shard', type: 'shield', rarity: 'common', cost: 25, icon: '🛡️', desc: 'Grants +1 Shield Charge to block lost balls or hits.', shieldAmount: 1 },
  { id: 'shop_token_reroll', name: 'Cryptographic Reroll Key', type: 'token', rarity: 'common', cost: 25, icon: '🔑', desc: 'Grants +2 free upgrade draft rerolls during your run.', token: 'draft_rerolls', count: 2 },
  { id: 'shop_consumable_overdrive', name: 'Overdrive Adrenaline Shot', type: 'consumable', rarity: 'common', cost: 30, icon: '💉', desc: 'Paddle moves 25% faster with +20% smash power for next 2 rooms.', buff: 'overdrive_speed', duration: 2000 },
  { id: 'shop_consumable_fire', name: 'Inferno Flask', type: 'consumable', rarity: 'common', cost: 35, icon: '🔥', desc: 'Grants Fireball buff for the next 2 rooms.', buff: 'fireball', duration: 1800 },
  { id: 'shop_consumable_lightning', name: 'Static Overcharge Cell', type: 'consumable', rarity: 'common', cost: 35, icon: '⚡', desc: 'Grants Chain Lightning on all ball hits next room.', buff: 'lightning', duration: 1800 },
  { id: 'shop_consumable_shield_shard', name: 'Emergency Barrier Cell', type: 'consumable', rarity: 'common', cost: 18, icon: '🛡️', desc: 'Adds +1 temporary shield charge for the next combat room.' },
  { id: 'shop_consumable_pierce', name: 'Phase Drill Capsule', type: 'consumable', rarity: 'common', cost: 28, icon: '🏹', desc: 'Grants Pierce Core buff for the next room.' },
  { id: 'shop_consumable_magnet', name: 'Micro-Attractor Charm', type: 'consumable', rarity: 'common', cost: 32, icon: '🧲', desc: 'Magnetically attracts loose items for the next 2 rooms.' },

  // Cheap Tier (50-100 Data Chips)
  { id: 'shop_upg_servo', name: 'Hyper-Servos Upgrade', type: 'upgrade', rarity: 'common', cost: 60, icon: '⚡', desc: '+15% Paddle movement speed and agility.', upgradeId: 'hyper_servo' },
  { id: 'shop_upg_hull', name: 'Reinforced Hull Plate', type: 'upgrade', rarity: 'common', cost: 65, icon: '🛡️', desc: '+10% Paddle width and impact resistance.', upgradeId: 'iron_hull' },
  { id: 'shop_upg_ricochet', name: 'Ricochet Shrapnel Array', type: 'upgrade', rarity: 'common', cost: 70, icon: '⚡', desc: 'Sharp angle paddle hits scatter reflective lasers.', upgradeId: 'ricochet_shrapnel' },
  { id: 'shop_shield_2', name: 'Reinforced Aegis Matrix', type: 'shield', rarity: 'rare', cost: 75, icon: '🔰', desc: 'Grants +2 Shield Charges with energy deflection.', shieldAmount: 2 },
  { id: 'shop_token_casino', name: 'Golden Casino VIP Pass', type: 'token', rarity: 'rare', cost: 75, icon: '🎰', desc: 'Unlocks +1 free high-tier spin at the next Casino.', token: 'casino_pass' },
  { id: 'shop_consumable_gold_rush', name: 'Data Siphon Booster', type: 'consumable', rarity: 'rare', cost: 80, icon: '💾', desc: 'Increases Data Chip drops by +50% for the next 2 rooms.', buff: 'chip_boost', duration: 2000 },
  { id: 'shop_consumable_chrono', name: 'Stasis Dilation Grenade', type: 'consumable', rarity: 'rare', cost: 80, icon: '⏳', desc: 'Slows down hostile projectiles by 50% in the next encounter.', buff: 'stasis_zone', duration: 1800 },
  { id: 'shop_upg_toxic', name: 'Toxic Acid Catalyst', type: 'upgrade', rarity: 'rare', cost: 80, icon: '🧪', desc: 'Corrosive poison spreads across adjacent targets.', upgradeId: 'toxic_catalyst' },
  { id: 'shop_upg_cryo', name: 'Cryo Frostbite Coating', type: 'upgrade', rarity: 'rare', cost: 85, icon: '❄️', desc: 'Ball chills bricks & slows AI paddles on contact.', upgradeId: 'cryo_frostbite' },
  { id: 'shop_upg_prism', name: 'Prism Splitter Core', type: 'upgrade', rarity: 'rare', cost: 85, icon: '💎', desc: 'Lasers split into triangular diffraction beams.', upgradeId: 'prism_lens' },
  { id: 'shop_consumable_mega', name: 'Mega Ball Core', type: 'consumable', rarity: 'rare', cost: 85, icon: '💣', desc: 'Triples ball diameter and plows through obstacles.', buff: 'megaBall', duration: 1200 },
  { id: 'shop_upg_twin', name: 'Twin Plasma Injectors', type: 'upgrade', rarity: 'rare', cost: 90, icon: '🎯', desc: 'Twin blaster shots trigger every 5 paddle hits.', upgradeId: 'twin_blaster_core' },
  { id: 'shop_upg_fire', name: 'Inferno Ignition Unit', type: 'upgrade', rarity: 'rare', cost: 90, icon: '🔥', desc: 'Deflections spark explosive fireball impacts.', upgradeId: 'fireball_core' },
  { id: 'shop_upg_overcharge', name: 'Overcharge Coil', type: 'upgrade', rarity: 'rare', cost: 95, icon: '🔋', desc: 'Air time charges ball damage up to +100%.', upgradeId: 'overcharge_capacitor' },
  { id: 'shop_heal_overheal', name: 'Nanite Hull Reinforcement', type: 'heal', rarity: 'epic', cost: 95, icon: '💖', desc: 'Repairs 2 HP and grants +1 Temporary Max HP for this sector.', healAmount: 2, tempHp: 1 },
  { id: 'shop_upg_kinetic_flux', name: 'Kinetic Flux Dampener', type: 'upgrade', rarity: 'rare', cost: 70, icon: '💨', desc: 'Increases paddle smash acceleration by +20%.', upgradeId: 'kinetic_burst' },
  { id: 'shop_consumable_triple', name: 'Split Matrix Primer', type: 'consumable', rarity: 'rare', cost: 75, icon: '➗', desc: 'Next serve automatically splits into 2 combat balls.' },
  { id: 'shop_token_draft_rarity', name: 'Apex Algorithm Bypass', type: 'token', rarity: 'rare', cost: 85, icon: '💎', desc: 'Guarantees the next upgrade draft contains at least 1 Epic perk.' },
  { id: 'shop_upg_defense_sat', name: 'Defense Satellite Micro-Drone', type: 'upgrade', rarity: 'rare', cost: 95, icon: '🛸', desc: 'Spawns an auxiliary orbit drone that blocks incoming fire.', upgradeId: 'defense_satellite' },

  // Mid Tier (125-250 Data Chips)
  { id: 'shop_token_heist', name: 'Heist Security Bypass Key', type: 'token', rarity: 'rare', cost: 125, icon: '🔓', desc: 'Instantly bypasses the first security node in the next Cyber Heist.', token: 'heist_bypass' },
  { id: 'shop_upg_nano_swarm', name: 'Nanite Medical Hub', type: 'upgrade', rarity: 'epic', cost: 135, icon: '🩹', desc: 'Deploys nanites to repair shields and maintain hull integrity.', upgradeId: 'nano_repair_swarm' },
  { id: 'shop_upg_cluster', name: 'Quantum Cluster Seed', type: 'upgrade', rarity: 'epic', cost: 140, icon: '🔮', desc: 'Combos emit quantum phantom balls with phasing.', upgradeId: 'quantum_cluster' },
  { id: 'shop_heal_full', name: 'Full Hull Reconstruction', type: 'heal', rarity: 'epic', cost: 150, icon: '💖', desc: 'Restores all missing HP segments to maximum.', healAmount: 99 },
  { id: 'shop_upg_chrono', name: 'Chrono Time-Anchor', type: 'upgrade', rarity: 'epic', cost: 160, icon: '⏳', desc: 'Slows down game time during high-speed spikes.', upgradeId: 'chrono_dial' },
  { id: 'shop_upg_superconductor', name: 'Superconductor Rail Kit', type: 'upgrade', rarity: 'rare', cost: 165, icon: '⚡', desc: 'Wall rebounds electrify the ball and grant velocity bursts.', upgradeId: 'superconductor_rails' },
  { id: 'shop_shield_3', name: 'Fortress Aegis Overcharger', type: 'shield', rarity: 'legendary', cost: 175, icon: '🛡️', desc: 'Grants +3 Shield Charges and provides 3 seconds of invulnerability.', shieldAmount: 3 },
  { id: 'shop_upg_railgun', name: 'Orbital Railgun Battery', type: 'upgrade', rarity: 'epic', cost: 180, icon: '💥', desc: 'Kinetic rebounds charge high-velocity piercing beam.', upgradeId: 'kinetic_battery' },
  { id: 'shop_upg_reactive_overplating', name: 'Reactive Overplate Matrix', type: 'upgrade', rarity: 'rare', cost: 190, icon: '🛡️', desc: 'Converts absorbed damage into bonus smash velocity.', upgradeId: 'reactive_overplating' },
  { id: 'shop_cache_chips', name: 'Decrypted Data Cache', type: 'chips', rarity: 'rare', cost: 195, icon: '📦', desc: 'High-risk encrypted cache yielding 240-360 Chips.', minChips: 240, maxChips: 360 },
  { id: 'shop_upg_phantom_payload', name: 'Phantom Ordnance Emitter', type: 'upgrade', rarity: 'rare', cost: 210, icon: '🔮', desc: 'Phantom balls fire micro-missiles upon expiring.', upgradeId: 'phantom_payload' },
  { id: 'shop_upg_emp_resonance', name: 'EMP Resonance Tuner', type: 'upgrade', rarity: 'rare', cost: 215, icon: '📡', desc: 'Shockwaves disable enemy projectiles and targeting systems.', upgradeId: 'emp_resonance' },
  { id: 'shop_upg_acid_bloom', name: 'Bio-Acid Spore Capsule', type: 'upgrade', rarity: 'rare', cost: 225, icon: '🧪', desc: 'Corrosive targets explode into toxic acid blooms on death.', upgradeId: 'acid_bloom' },
  { id: 'shop_upg_cryo_mine', name: 'Cryo Mine Deployment System', type: 'upgrade', rarity: 'rare', cost: 230, icon: '❄️', desc: 'Leaves stationary cryo mines when hitting barriers.', upgradeId: 'cryo_minefield' },
  { id: 'shop_upg_tachyon', name: 'Tachyon Phase Injector', type: 'upgrade', rarity: 'legendary', cost: 245, icon: '⏩', desc: 'Maximum velocity balls phase through unbreakable defenses.', upgradeId: 'tachyon_accelerator' },
  { id: 'shop_upg_void_core', name: 'Void Resonance Core', type: 'upgrade', rarity: 'epic', cost: 145, icon: '🌌', desc: 'Phased quantum hits shred through enemy barriers.', upgradeId: 'void_siphon' },
  { id: 'shop_upg_cryo_containment', name: 'Cryo Containment Field', type: 'upgrade', rarity: 'epic', cost: 170, icon: '🧊', desc: 'Flash-freezes all screen hostiles for 2.0s upon taking damage.', upgradeId: 'cryo_containment' },
  { id: 'shop_upg_supercruise', name: 'Supercruise Velocity Array', type: 'upgrade', rarity: 'epic', cost: 185, icon: '🚀', desc: 'High-speed balls leave a sonic shockwave wake.', upgradeId: 'supercruise_matrix' },
  { id: 'shop_upg_titan_impact', name: 'Titan Impact Detonator', type: 'upgrade', rarity: 'epic', cost: 220, icon: '💣', desc: 'Smashed balls detonate violently on initial impact.', upgradeId: 'titan_impact_perk' },

  // Expensive Tier (300-500 Data Chips)
  { id: 'shop_upg_singularity_lens', name: 'Singularity Focus Lens', type: 'upgrade', rarity: 'legendary', cost: 320, icon: '🌌', desc: 'Critical center deflections focus active balls into singularity beams.', upgradeId: 'singularity_lens' },
  { id: 'shop_upg_apex', name: 'Apex Sovereign Core', type: 'upgrade', rarity: 'legendary', cost: 360, icon: '👑', desc: 'Max speed deflections guarantee 2.5x critical hits.', upgradeId: 'apex_predator' },
  { id: 'shop_cache_super', name: 'Encrypted Sovereign Cache', type: 'chips', rarity: 'legendary', cost: 380, icon: '👑', desc: 'Military-grade high encryption cache yielding 480-800 Chips.', minChips: 480, maxChips: 800 },
  { id: 'shop_upg_orbital_anchor', name: 'Orbital Anchor Array', type: 'upgrade', rarity: 'legendary', cost: 340, icon: '⚓', desc: 'Projects a tractor field slowing runaway fast balls by 30%.', upgradeId: 'orbital_anchor' },
  { id: 'shop_cache_legendary_data', name: 'Apex Sovereign Decryptor', type: 'chips', rarity: 'legendary', cost: 420, icon: '💠', desc: 'Yields 550-950 Data Chips and a free shield charge.', minChips: 550, maxChips: 950 },
  { id: 'shop_upg_chronos_dial', name: 'Chronos Singularity Matrix', type: 'upgrade', rarity: 'legendary', cost: 460, icon: '⏳', desc: 'Grants continuous 15% slow-motion field around the player paddle.', upgradeId: 'chrono_trigger' },

  // Very Expensive Tier (600+ Data Chips)
  { id: 'shop_upg_omnicore', name: 'Omnicore Hyper-Matrix', type: 'upgrade', rarity: 'legendary', cost: 650, icon: '🌟', desc: 'Combines +25% paddle speed, +2 HP, and +30% ball smash power.', upgradeId: 'omnicore_matrix' },
  { id: 'shop_cache_black_ice', name: 'Black Ice Sovereign Vault', type: 'chips', rarity: 'legendary', cost: 720, icon: '🧊', desc: 'Massive high-tier data vault yielding 900-1600 Data Chips.', minChips: 900, maxChips: 1600 },
  { id: 'shop_upg_hyper_overdrive', name: 'Quantum Overdrive Engine', type: 'upgrade', rarity: 'legendary', cost: 680, icon: '🌟', desc: 'Overdrive builds twice as fast and deals triple damage to bosses.', upgradeId: 'quantum_overdrive' },
  { id: 'shop_upg_apex_annihilator', name: 'Apex Annihilator Matrix', type: 'upgrade', rarity: 'legendary', cost: 780, icon: '👑', desc: 'Critical hits emit lethal cross-lasers across both axes.', upgradeId: 'apex_annihilator' }
];

const CASINO_TABLES = {
  safe: {
    wager: 30,
    title: 'SAFE PROTOCOL',
    desc: 'Low Risk • Guaranteed Payout Opportunities',
    segments: [
      { id: 's0', label: '+45 DATA CHIPS', icon: '💾', color: '#00f2fe', type: 'chips', val: 45, weight: 25 },
      { id: 's1', label: '+1 SHIELD SHARD', icon: '🛡️', color: '#00e676', type: 'shield', val: 1, weight: 20 },
      { id: 's2', label: '+1 HP REPAIR', icon: '❤️', color: '#ff2a6d', type: 'repair', val: 1, weight: 20 },
      { id: 's3', label: '+75 DATA CHIPS', icon: '💾', color: '#00b0ff', type: 'chips', val: 75, weight: 15 },
      { id: 's4', label: 'OVERCHARGE BUFF', icon: '⚡', color: '#ffd700', type: 'buff', buff: 'fireball', weight: 10 },
      { id: 's5', label: 'LOSE WAGER', icon: '❌', color: '#334155', type: 'lose', val: 0, weight: 5 },
      { id: 's6', label: '+15 REFUND', icon: '🪙', color: '#64748b', type: 'chips', val: 15, weight: 4 },
      { id: 's7', label: '🌟 JACKPOT (+200)', icon: '🌟', color: '#ffd700', type: 'jackpot', val: 200, weight: 1 }
    ]
  },
  highRoller: {
    wager: 75,
    title: 'HIGH ROLLER',
    desc: 'Balanced Risk & Reward • Upgrades & Rare Caches',
    segments: [
      { id: 'h0', label: '+120 DATA CHIPS', icon: '💾', color: '#00f2fe', type: 'chips', val: 120, weight: 22 },
      { id: 'h1', label: 'RARE CYBER UPGRADE', icon: '📦', color: '#00e676', type: 'upgrade', rarity: 'rare', weight: 18 },
      { id: 'h2', label: '+2 SHIELD SHARDS', icon: '🛡️', color: '#00b0ff', type: 'shield', val: 2, weight: 18 },
      { id: 'h3', label: '+200 DATA CHIPS', icon: '💾', color: '#ffd700', type: 'chips', val: 200, weight: 14 },
      { id: 'h4', label: 'SYSTEM SHORT (-1 HP)', icon: '⚠️', color: '#ef4444', type: 'curse_hp', val: 1, weight: 12 },
      { id: 'h5', label: 'LOSE WAGER', icon: '❌', color: '#334155', type: 'lose', val: 0, weight: 8 },
      { id: 'h6', label: 'CHAIN LIGHTNING', icon: '⚡', color: '#d500f9', type: 'buff', buff: 'lightning', weight: 5 },
      { id: 'h7', label: '🌟 JACKPOT (+400)', icon: '🌟', color: '#ffd700', type: 'jackpot', val: 400, weight: 3 }
    ]
  },
  overdrive: {
    wager: 150,
    title: 'OVERDRIVE ALL-IN',
    desc: 'Extreme Variance • Legendary Rewards / Dire Curses',
    segments: [
      { id: 'o0', label: 'EPIC / LEGENDARY UPGRADE', icon: '🔮', color: '#d500f9', type: 'upgrade', rarity: 'epic', weight: 20 },
      { id: 'o1', label: '+350 DATA CHIPS', icon: '💾', color: '#00f2fe', type: 'chips', val: 350, weight: 20 },
      { id: 'o2', label: 'CORE OVERHEAT (-2 HP)', icon: '💀', color: '#ef4444', type: 'curse_hp', val: 2, weight: 18 },
      { id: 'o3', label: 'LOSE WAGER', icon: '❌', color: '#1e293b', type: 'lose', val: 0, weight: 15 },
      { id: 'o4', label: '+3 SHIELD CHARGES', icon: '🛡️', color: '#00e676', type: 'shield', val: 3, weight: 12 },
      { id: 'o5', label: 'MEGA-BALL FRENZY', icon: '💣', color: '#ff8800', type: 'buff', buff: 'megaBall', weight: 8 },
      { id: 'o6', label: '+100 CHIPS REFUND', icon: '🪙', color: '#64748b', type: 'chips', val: 100, weight: 4 },
      { id: 'o7', label: '🌟 APEX JACKPOT (+600)', icon: '🌟', color: '#ffd700', type: 'jackpot', val: 600, weight: 3 }
    ]
  }
};

const CYBER_HEIST_CONFIG = {
  name: 'CYBER HEIST',
  icon: '💾',
  securityLevelScaling: {
    baseNodes: 3,
    maxNodes: 8,
    baseTimer: 25,
    timerDecayPerLevel: 0.35,
    minTimer: 14,
    overclockRate: 0.05
  },
  caches: {
    common: { id: 'common', name: 'Standard Data Cache', glyph: '💽', hp: 3, chips: 10, color: '#00f2fe', desc: 'Encrypted tactical sector telemetry.' },
    rare: { id: 'rare', name: 'Secured Data Cache', glyph: '💾', hp: 5, chips: 18, coreChance: 0.35, color: '#00e676', desc: 'High-value military encryption vault.' },
    epic: { id: 'epic', name: 'Cryptographic Core Cache', glyph: '📦', hp: 7, chips: 30, coreChance: 0.75, upgradeChance: 0.25, color: '#d500f9', desc: 'Black-budget research mainframe cache.' },
    legendary: { id: 'legendary', name: 'Quantum Apex Vault', glyph: '🔮', hp: 10, chips: 50, coreChance: 1.0, upgradeChance: 0.65, color: '#ffd700', desc: 'Apex quantum architectural blueprint.' },
    black_ice: { id: 'black_ice', name: 'Black Ice Hyper-Cache', glyph: '🧊', hp: 12, chips: 80, coreChance: 1.0, upgradeChance: 1.0, color: '#38bdf8', desc: 'Lethal hazard-guarded data singularity.' }
  },
  nodes: {
    shield: { id: 'shield', name: 'Shield Node', icon: '🛡️', color: '#00b0ff', hp: 2, desc: 'Emits a barrier dome shielding adjacent Data Caches until shattered.' },
    turret: { id: 'turret', name: 'Security Turret', icon: '🎯', color: '#ef4444', hp: 3, cooldown: 180, desc: 'Fires telegraphed cyber-plasma projectiles toward the player paddle.' },
    jammer: { id: 'jammer', name: 'Jammer Node', icon: '📡', color: '#f59e0b', hp: 2, desc: 'Disrupts paddle active blasters and abilities within its resonance aura.' },
    speed: { id: 'speed', name: 'Accelerator Node', icon: '⚡', color: '#eab308', hp: 2, desc: 'Accelerates defensive hazards and turret tracking speeds.' },
    repair: { id: 'repair', name: 'Nanite Repair Node', icon: '🔧', color: '#10b981', hp: 3, interval: 240, desc: 'Broadcasts repair pulses restoring 1 HP to damaged security targets.' },
    overclock: { id: 'overclock', name: 'Overclock Pylon', icon: '🔥', color: '#ff2a6d', hp: 2, desc: 'Rapidly accelerates the network alert level toward System Override.' }
  },
  overclockThresholds: [
    { pct: 25, label: 'SECURITY ONLINE', color: '#38bdf8', desc: 'Turret platforms active' },
    { pct: 50, label: 'FIREWALL ACTIVATED', color: '#f59e0b', desc: 'Energy barrier sweeps online' },
    { pct: 75, label: 'ELITE SECURITY', color: '#ef4444', desc: 'Reinforced defense protocols' },
    { pct: 100, label: 'SYSTEM OVERRIDE', color: '#ff0055', desc: 'Crisis event: Maximum alert!' }
  ],
  specialEvents: {
    blackIce: { id: 'blackIce', name: 'BLACK ICE PROTOCOL', desc: 'Lethal scanning lasers guard an ultra-valuable Black Ice Cache!', bonusMultiplier: 2.0 },
    jackpot: { id: 'jackpot', name: 'DATA JACKPOT', desc: 'Triple cache vault with dense defensive turret crossfire!', bonusMultiplier: 1.8 },
    firewall: { id: 'firewall', name: 'FIREWALL LOCKDOWN', desc: 'Sweeping laser beams divide the arena into tactical chambers!', bonusMultiplier: 1.5 },
    ghost: { id: 'ghost', name: 'GHOST PROTOCOL', desc: 'Caches are cloaked until security nodes are neutralized!', bonusMultiplier: 1.6 }
  }
};

const BOSS_DEFINITIONS = {
  10: {
    name: 'Cyber Titan',
    subtitle: 'Armored Siege Colossus',
    hp: 8,
    color: '#00f2fe',
    theme: 'titanium',
    phases: 2,
    desc: 'Heavy reinforced chassis with titanium barrier shields and kinetic blast shockwaves.'
  },
  20: {
    name: 'Nexus-9 Rogue AI',
    subtitle: 'Autonomous Cyber-Infiltration Entity',
    hp: 12,
    color: '#d500f9',
    theme: 'matrix',
    phases: 2,
    desc: 'Rapid teleportation, holographic phantom decoys, and sweeping matrix laser grids.'
  },
  30: {
    name: 'Hive Mother',
    subtitle: 'Autonomous Biomechanical Queen',
    hp: 16,
    color: '#00e676',
    theme: 'swarm',
    phases: 2,
    desc: 'Orbiting energy shield pods, continuous skimmer deployment, and homing plasma stingers.'
  },
  40: {
    name: 'Quantum Warden',
    subtitle: 'Singularity Spatial Architect',
    hp: 20,
    color: '#6366f1',
    theme: 'quantum',
    phases: 2,
    desc: 'Generates gravitational wells bending ball trajectories and opens dimensional phase rifts.'
  },
  50: {
    name: 'Cyber Archon',
    subtitle: 'Final Overlord of the Neon Grid',
    hp: 26,
    color: '#ff2a6d',
    theme: 'apex',
    phases: 3,
    desc: 'Triple orbital shields, quad plasma turrets, overdrive meltdowns, and ultimate screen-wide shockwaves.'
  }
};

const MINI_BOSS_DEFINITIONS = {
  5: { name: 'Pulse Vanguard', hp: 5, color: '#00b0ff', speedMult: 1.2, desc: 'Twin EMP blaster and rapid angular rebounds.' },
  15: { name: 'Bastion Colossus', hp: 7, color: '#f59e0b', speedMult: 0.95, desc: 'Heavy armored dreadnought with twin plasma cannon.' },
  25: { name: 'Phantom Trickster', hp: 9, color: '#d946ef', speedMult: 1.15, desc: 'Creates phantom mirror balls and phase-shifts on impact.' },
  35: { name: 'Siege Dreadnought', hp: 11, color: '#ef4444', speedMult: 1.0, desc: 'Fires mortar cluster shells that detonate on impact.' },
  45: { name: 'Void Archon Fragment', hp: 14, color: '#8b5cf6', speedMult: 1.25, desc: 'Siphons ball momentum and emits void singularities.' }
};

// ============================================================================
// THREAT DATABASE (ENEMY CODEX & BESTIARY - 34 ENCOUNTER DEFINITIONS)
// ============================================================================
const THREAT_DATABASE = [
  // SWARM
  { id: 'swarm_drone', name: 'Cyber Drone', category: 'SWARM', threat: 'Low', icon: '🛸', color: '#ff2a6d', desc: 'Standard autonomous recon drone. Swarms in coordinated squadrons.', behavior: 'Approaches court steadily in formation.', attacks: 'Contact ramming damage.', weakness: 'Fragile; destroyed by single ball impact.', appearsIn: 'Swarm (Wave 1+)' },
  { id: 'swarm_skimmer', name: 'Swift Skimmer', category: 'SWARM', threat: 'Medium', icon: '⚡', color: '#00f2fe', desc: 'High-speed interceptor unit executing evasive sinusoidal patterns.', behavior: 'Weaves vertically while advancing.', attacks: 'Rapid flanking rush.', weakness: 'Wide hit profile on sinusoidal apex.', appearsIn: 'Swarm (Wave 2+)' },
  { id: 'swarm_sentinel', name: 'Sentinel Blaster', category: 'SWARM', threat: 'High', icon: '🎯', color: '#ffd700', desc: 'Heavy laser platform holding backline defensive position.', behavior: 'Charges visible laser sight before firing.', attacks: 'Piercing horizontal laser beam.', weakness: 'Stationary during 1.2s charge sequence.', appearsIn: 'Swarm (Wave 3+)' },
  { id: 'swarm_kamikaze', name: 'Kamikaze Detonator', category: 'SWARM', threat: 'Extreme', icon: '💣', color: '#ef4444', desc: 'Explosive ordinance drone that accelerates toward player.', behavior: 'Pulsates crimson and dashes at high velocity.', attacks: 'Explosive concussive blast on impact.', weakness: 'Can be detonated early with long-range ball hits.', appearsIn: 'Swarm (Floor 6+)' },
  { id: 'swarm_bastion', name: 'Armored Bastion', category: 'SWARM', threat: 'Elite', icon: '🛡️', color: '#f59e0b', desc: 'Fortified siege platform with segmented armor plating.', behavior: 'Advances slowly with heavy twin plasma cannons.', attacks: 'Twin spread plasma salvos.', weakness: 'Rear cooling vent vulnerable to rebound angles.', appearsIn: 'Swarm (Floor 8+)' },

  // DUEL OPPONENTS
  { id: 'duel_aggressor', name: 'Cyber-Aggressor', category: 'DUEL', threat: 'Medium', icon: '⚡', color: '#ff2a6d', desc: 'Relentless combat paddle that advances into mid-court.', behavior: 'Cuts off ball rebound angles aggressively.', attacks: 'Heavy angular cross-court smashes.', weakness: 'Overcommits forward, leaving open back-lines.', appearsIn: 'Duel (Sector 1)' },
  { id: 'duel_defender', name: 'Titan Aegis', category: 'DUEL', threat: 'Medium', icon: '🛡️', color: '#00b0ff', desc: 'Massive armored defensive paddle guarding the goal line.', behavior: 'Stubbornly tracks center mass with 125% paddle size.', attacks: 'Firm deflections with minimal spin.', weakness: 'Slow vertical acceleration against speed spikes.', appearsIn: 'Duel (Sector 2)' },
  { id: 'duel_trickster', name: 'Neon Trickster', category: 'DUEL', threat: 'High', icon: '🌀', color: '#d500f9', desc: 'Agile paddle imparting severe vertical spin on contact.', behavior: 'Sinusoidal tracking imparting wicked slice curves.', attacks: 'Curving spin shots targeting gutter corners.', weakness: 'Center hits cannot apply spin.', appearsIn: 'Duel (Sector 3)' },
  { id: 'duel_artillery', name: 'Heavy Artillery', category: 'DUEL', threat: 'High', icon: '🔫', color: '#ffd700', desc: 'Armed opponent outfitted with integrated plasma blaster.', behavior: 'Charges forward cannons while rallying.', attacks: 'Fires forward plasma bolts mid-rally.', weakness: 'Cannot fire while actively deflecting balls.', appearsIn: 'Duel (Sector 4)' },
  { id: 'duel_overclocked', name: 'Overclocked Apex', category: 'DUEL', threat: 'Extreme', icon: '🔥', color: '#ff1144', desc: 'Hyper-tuned AI champion entering enrage at low health.', behavior: 'Blistering tracking speed; enraged crimson state at 1 HP.', attacks: 'Supercharged 1.35x velocity rebounds.', weakness: 'Predictable center tracking allows precision counters.', appearsIn: 'Duel (Sector 5)' },

  // CYBER HEIST
  { id: 'heist_cache_common', name: 'Standard Data Cache', category: 'CYBER HEIST', threat: 'Low', icon: '💽', color: '#00f2fe', desc: 'Encrypted tactical sector telemetry cache.', behavior: 'Floats inside vault grid; 3 hits to extract.', attacks: 'None.', weakness: 'Direct ball deflections.', appearsIn: 'Cyber Heist' },
  { id: 'heist_cache_rare', name: 'Secured Data Cache', category: 'CYBER HEIST', threat: 'Medium', icon: '💾', color: '#00e676', desc: 'Reinforced military encryption vault containing rare assets.', behavior: 'Protected by rotating encryption ring; 5 hits to breach.', attacks: 'Alerts nearby turrets when struck.', weakness: 'Critical precision center hits.', appearsIn: 'Cyber Heist' },
  { id: 'heist_cache_epic', name: 'Cryptographic Core', category: 'CYBER HEIST', threat: 'High', icon: '📦', color: '#d500f9', desc: 'Black-budget research mainframe cache with high chip yield.', behavior: 'Often tethered to Shield Nodes; 7 hits.', attacks: 'Accelerates Overclock meter when attacked.', weakness: 'Sever tethering Shield Nodes first.', appearsIn: 'Cyber Heist (Security 4+)' },
  { id: 'heist_cache_legendary', name: 'Quantum Apex Vault', category: 'CYBER HEIST', threat: 'Elite', icon: '🔮', color: '#ffd700', desc: 'Legendary vault containing priceless quantum schematics.', behavior: '10 hits; dynamic harmonic resonance shield.', attacks: 'Emits concussive shockwave upon breach.', weakness: 'Kinetic and Critical build perks.', appearsIn: 'Cyber Heist (Security 10+)' },
  { id: 'heist_cache_black_ice', name: 'Black Ice Hyper-Cache', category: 'CYBER HEIST', threat: 'Extreme', icon: '🧊', color: '#38bdf8', desc: 'Lethal hazard-guarded data singularity with massive rewards.', behavior: 'Surrounded by lethal laser barriers; 12 hits.', attacks: 'Triggers automated System Override if hit unshielded.', weakness: 'Quantum phasing or precision timing.', appearsIn: 'Cyber Heist (Special Events)' },
  { id: 'heist_node_shield', name: 'Shield Node', category: 'CYBER HEIST', threat: 'Medium', icon: '🛡️', color: '#00b0ff', desc: 'Forcefield emitter rendering nearby Data Caches invulnerable.', behavior: 'Projects glowing energy conduit to target caches.', attacks: 'Shields targets until destroyed (2 HP).', weakness: 'Must be prioritized first.', appearsIn: 'Cyber Heist' },
  { id: 'heist_node_turret', name: 'Security Turret', category: 'CYBER HEIST', threat: 'High', icon: '🎯', color: '#ef4444', desc: 'Automated defense blaster targeting the player paddle.', behavior: 'Tracks paddle Y-axis and fires plasma pulses every 3s.', attacks: 'Red plasma bullets dealing 1 hull damage.', weakness: 'Can be deflected or destroyed with 3 hits.', appearsIn: 'Cyber Heist' },
  { id: 'heist_node_jammer', name: 'Jammer Node', category: 'CYBER HEIST', threat: 'Medium', icon: '📡', color: '#f59e0b', desc: 'Broadcasts interference jamming active abilities and blasters.', behavior: 'Emits static radio waves pulsing across the arena.', attacks: 'Disables active ability triggers while alive.', weakness: 'Low durability (2 HP).', appearsIn: 'Cyber Heist' },
  { id: 'heist_node_speed', name: 'Accelerator Node', category: 'CYBER HEIST', threat: 'Medium', icon: '⚡', color: '#eab308', desc: 'Supercharges security systems and turret firing rates.', behavior: 'Increases all hazard velocities by +30%.', attacks: 'Global speed buff to defense grid.', weakness: '2 HP.', appearsIn: 'Cyber Heist' },
  { id: 'heist_node_repair', name: 'Nanite Repair Node', category: 'CYBER HEIST', threat: 'Medium', icon: '🔧', color: '#10b981', desc: 'Emits periodic nanite waves healing damaged nodes and caches.', behavior: 'Repairs 1 HP every 4 seconds.', attacks: 'Sustains enemy structures.', weakness: '3 HP; prioritize before durable caches.', appearsIn: 'Cyber Heist' },
  { id: 'heist_node_overclock', name: 'Overclock Pylon', category: 'CYBER HEIST', threat: 'High', icon: '🔥', color: '#ff2a6d', desc: 'Accelerates the network alert meter toward System Override.', behavior: 'Increases alert meter accumulation rate by 2x.', attacks: 'Rapidly summons security reinforcements.', weakness: '2 HP.', appearsIn: 'Cyber Heist' },

  // BREAKOUT HAZARDS
  { id: 'brick_phase', name: 'Phase Anomaly Brick', category: 'BREAKOUT', threat: 'Low', icon: '🌀', color: '#d946ef', desc: 'Shifts between tangible and intangible states on fixed cycle.', behavior: 'Cycles transparency every 2.5 seconds.', attacks: 'Balls pass harmlessly through when intangible.', weakness: 'Time deflections for when solid, or use Phase perks.', appearsIn: 'Breakout' },
  { id: 'brick_cryo', name: 'Cryo Frost Brick', category: 'BREAKOUT', threat: 'Low', icon: '❄️', color: '#00e676', desc: 'Crystalline block containing sub-zero cryogenic fluid.', behavior: 'Chills balls upon impact, slowing ball speed.', attacks: 'Reduces ball velocity by 30% for 3 seconds.', weakness: 'Fireball core destroys instantly without chill.', appearsIn: 'Breakout' },
  { id: 'brick_acid', name: 'Acid Hazard Brick', category: 'BREAKOUT', threat: 'Medium', icon: '🧪', color: '#84cc16', desc: 'Corrosive chemical container block.', behavior: 'Splashes acid on impact, damaging neighboring bricks.', attacks: 'Can prematurely detonate nearby tactical blocks.', weakness: 'Useful for triggering chain reactions.', appearsIn: 'Breakout' },
  { id: 'brick_turret', name: 'Defense Turret Brick', category: 'BREAKOUT', threat: 'High', icon: '🔫', color: '#f43f5e', desc: 'Automated turret embedded within the brick matrix.', behavior: 'Fires red energy bolts every 4 seconds.', attacks: 'Horizontal projectiles targeting player paddle.', weakness: 'Can be destroyed with 2 ball hits.', appearsIn: 'Breakout' },
  { id: 'brick_regen', name: 'Regenerator Core Brick', category: 'BREAKOUT', threat: 'Medium', icon: '💚', color: '#10b981', desc: 'Nanite cluster that repairs itself if not eliminated quickly.', behavior: 'Regenerates 1 HP every 5 seconds.', attacks: 'Extends encounter duration.', weakness: 'Consecutive rapid ball strikes.', appearsIn: 'Breakout' },

  // MINI-BOSSES
  { id: 'mini_pulse', name: 'Pulse Vanguard', category: 'BOSSES', threat: 'Elite', icon: '⚡', color: '#00b0ff', desc: 'Fast elite interceptor outfitted with twin EMP blasters.', behavior: 'Fast angular tracking and twin spread shots.', attacks: 'Twin EMP blasts (stun & damage).', weakness: 'Fragile chassis compared to major bosses.', appearsIn: 'Main Campaign (Floor 5)' },
  { id: 'mini_bastion', name: 'Bastion Colossus', category: 'BOSSES', threat: 'Elite', icon: '🛡️', color: '#f59e0b', desc: 'Heavy armored dreadnought with twin plasma cannon.', behavior: 'Slow tank with reinforced titanium armor.', attacks: 'Heavy plasma artillery shells.', weakness: 'Overheat cooldown after barrage.', appearsIn: 'Main Campaign (Floor 15)' },
  { id: 'mini_phantom', name: 'Phantom Trickster', category: 'BOSSES', threat: 'Elite', icon: '🔮', color: '#d946ef', desc: 'Creates phantom mirror balls and phase-shifts on impact.', behavior: 'Teleports between lanes after deflections.', attacks: 'Phantom decoy balls that confuse defense.', weakness: 'Center critical hits disrupt phase cloak.', appearsIn: 'Main Campaign (Floor 25)' },
  { id: 'mini_siege', name: 'Siege Dreadnought', category: 'BOSSES', threat: 'Elite', icon: '💥', color: '#ef4444', desc: 'Heavy artillery platform firing explosive cluster mortars.', behavior: 'Holds back line and launches mortar arcs.', attacks: 'Cluster shells that detonate on contact.', weakness: 'Vulnerable while reloading mortar batteries.', appearsIn: 'Main Campaign (Floor 35)' },
  { id: 'mini_void', name: 'Void Archon Fragment', category: 'BOSSES', threat: 'Elite', icon: '🌌', color: '#8b5cf6', desc: 'Anomalous rift entity siphoning momentum into singularities.', behavior: 'Creates mini gravity wells pulling balls off course.', attacks: 'Gravitational vortex pulses.', weakness: 'High-speed smash deflections pierce the wells.', appearsIn: 'Main Campaign (Floor 45)' },

  // MAJOR BOSSES
  { id: 'boss_titan', name: 'Cyber Titan', category: 'BOSSES', threat: 'Boss', icon: '🤖', color: '#00f2fe', desc: 'Sector 1 Overlord: Armored Siege Colossus with titanium barrier.', behavior: 'Deploys titanium barrier shields and fires kinetic shockwaves.', attacks: 'Triple laser barrage, kinetic blast, Phase 2 Overdrive speed.', weakness: 'Break protective barrier bricks to expose core.', appearsIn: 'Main Campaign (Floor 10)' },
  { id: 'boss_nexus', name: 'Nexus-9 Rogue AI', category: 'BOSSES', threat: 'Boss', icon: '👁️', color: '#d500f9', desc: 'Sector 2 Overlord: Autonomous Cyber-Infiltration Entity.', behavior: 'Rapid lane teleportation, holographic phantom decoys, sweeping matrix lasers.', attacks: 'Matrix grid lasers, clone decoys, Phase 2 multi-beam sweep.', weakness: 'Focus on true core indicated by subtle eye scanline.', appearsIn: 'Main Campaign (Floor 20)' },
  { id: 'boss_hive', name: 'Hive Mother', category: 'BOSSES', threat: 'Boss', icon: '👑', color: '#00e676', desc: 'Sector 3 Overlord: Autonomous Biomechanical Queen.', behavior: 'Orbiting energy shield pods, continuous skimmer deployment.', attacks: 'Homing plasma stingers, drone escort screen, Phase 2 frenzy.', weakness: 'Shatter orbiting pods to disable her shield barrier.', appearsIn: 'Main Campaign (Floor 30)' },
  { id: 'boss_quantum', name: 'Quantum Warden', category: 'BOSSES', threat: 'Boss', icon: '⚛️', color: '#6366f1', desc: 'Sector 4 Overlord: Singularity Spatial Architect.', behavior: 'Bends ball trajectories with gravitational wells and opens phase rifts.', attacks: 'Singularity vortex, dimensional phase rifts, quantum laser blades.', weakness: 'Phase surface and kinetic grip override gravitational pull.', appearsIn: 'Main Campaign (Floor 40)' },
  { id: 'boss_archon', name: 'Cyber Archon', category: 'BOSSES', threat: 'Boss', icon: '👑', color: '#ff2a6d', desc: 'Sector 5 Ultimate Overlord: Final Guardian of the Neon Grid.', behavior: '3 distinct phases: Triple orbital shields, quad plasma turrets, Overdrive Meltdown climax.', attacks: 'Screen-wide chromatic shockwaves, orbital lasers, enraged bullet storm.', weakness: 'Master all build synergies, time perfect deflections, exploit Phase 2/3 transitions.', appearsIn: 'Main Campaign (Floor 50)' },

  // SECRET BOSS
  { id: 'boss_bennie', name: 'Chief Architect Bennie', category: 'BOSSES', threat: 'Secret Boss', icon: '💡💀', color: '#ffd700', desc: 'Secret Chief Architect: Flying cyber skull with reading glasses, prototype weapons, and blueprints.', behavior: 'Multi-phase hovering boss firing telegraphed targeting lasers, launching bouncing prototypes, and deploying workshop drones.', attacks: 'Telegraphed laser sweep, inventor spark arcs, bouncy spring contraptions, support drones.', weakness: 'Deflect bouncing prototypes back into him; dodge the telegraphed laser line.', appearsIn: "Bennie's Workshop" }
];

// ============================================================================
// AUTHORITATIVE DROP REGISTRY (5 CATEGORIES, 5 RARITIES, MODE-AWARE)
// ============================================================================
const DROP_REGISTRY = {
  // --- ATTACK DROPS ---
  mega_ball: {
    id: 'mega_ball',
    name: 'Mega Ball',
    icon: '🌕',
    category: 'ATTACK',
    rarity: 'Uncommon',
    color: '#ffd700',
    modes: ['universal', 'breakout', 'duel', 'swarm', 'heist'],
    desc: 'Expands ball radius to 18px and boosts kinetic impact damage by +50% for 8 seconds.',
    effect: 'Radius 18px, +50% impact force',
    duration: 8.0
  },
  fire_ball: {
    id: 'fire_ball',
    name: 'Fireball',
    icon: '🔥',
    category: 'ATTACK',
    rarity: 'Common',
    color: '#ff5500',
    modes: ['universal', 'breakout', 'swarm', 'heist'],
    desc: 'Ignites ball with thermal plasma, scorching struck obstacles and drones with burn DoT for 7s.',
    effect: 'Thermal plasma burn DoT',
    duration: 7.0
  },
  ice_ball: {
    id: 'ice_ball',
    name: 'Ice Ball',
    icon: '❄️',
    category: 'ATTACK',
    rarity: 'Uncommon',
    color: '#00e5ff',
    modes: ['universal', 'duel', 'swarm', 'heist'],
    desc: 'Envelops ball in cryogenic ice crystals, freezing or chilling struck targets on contact for 6s.',
    effect: 'Freeze / chill status effect',
    duration: 6.0
  },
  shock_ball: {
    id: 'shock_ball',
    name: 'Shock Ball',
    icon: '⚡',
    category: 'ATTACK',
    rarity: 'Rare',
    color: '#06b6d4',
    modes: ['universal', 'swarm', 'breakout', 'duel'],
    desc: 'Discharges chaining electrical arcs that strike nearby targets on every surface deflection for 7s.',
    effect: 'Chaining electrical shockwaves',
    duration: 7.0
  },
  pierce_ball: {
    id: 'pierce_ball',
    name: 'Piercing Core',
    icon: '🏹',
    category: 'ATTACK',
    rarity: 'Rare',
    color: '#a855f7',
    modes: ['breakout', 'swarm', 'heist'],
    desc: 'Phases ball through obstacles and drones without deflection resistance for 6 seconds.',
    effect: 'Uninterrupted piercing flight',
    duration: 6.0
  },
  plasma_ball: {
    id: 'plasma_ball',
    name: 'Plasma Ball',
    icon: '💥',
    category: 'ATTACK',
    rarity: 'Epic',
    color: '#f97316',
    modes: ['universal', 'breakout', 'swarm', 'heist'],
    desc: 'Triggers high-energy plasma detonations on impact, dealing localized splash damage for 7s.',
    effect: 'High-energy splash detonations',
    duration: 7.0
  },
  void_ball: {
    id: 'void_ball',
    name: 'Void Ball',
    icon: '🌌',
    category: 'ATTACK',
    rarity: 'Legendary',
    color: '#818cf8',
    modes: ['universal', 'duel', 'heist'],
    desc: 'Annihilates incoming enemy projectiles on contact and deals true unmitigated structure damage for 5s.',
    effect: 'Projectile annihilation & true damage',
    duration: 5.0
  },
  ricochet_burst: {
    id: 'ricochet_burst',
    name: 'Ricochet Burst',
    icon: '✨',
    category: 'ATTACK',
    rarity: 'Uncommon',
    color: '#fbbf24',
    modes: ['breakout', 'swarm'],
    desc: 'Emits kinetic shrapnel darts whenever balls bounce against walls or obstacles for 8s.',
    effect: 'Wall bounce shrapnel darts',
    duration: 8.0
  },
  split_ball: {
    id: 'split_ball',
    name: 'Split Ball',
    icon: '🫧',
    category: 'ATTACK',
    rarity: 'Rare',
    color: '#38bdf8',
    modes: ['breakout', 'swarm', 'heist'],
    desc: 'Duplicates active balls into angled split projectiles (strictly capped at 8 simultaneous balls).',
    effect: 'Ball duplication (max 8 balls)',
    duration: 0.0
  },

  // --- DEFENSE DROPS ---
  energy_shield: {
    id: 'energy_shield',
    name: 'Energy Shield',
    icon: '🛡️',
    category: 'DEFENSE',
    rarity: 'Common',
    color: '#00b0ff',
    modes: ['universal', 'duel', 'swarm', 'heist', 'breakout'],
    desc: 'Deploys an energy barrier across the paddle absorbing up to 2 incoming hits.',
    effect: '+2 Shield Charges',
    duration: 0.0
  },
  phase_barrier: {
    id: 'phase_barrier',
    name: 'Phase Barrier',
    icon: '💠',
    category: 'DEFENSE',
    rarity: 'Rare',
    color: '#d500f9',
    modes: ['universal', 'duel', 'swarm', 'heist'],
    desc: 'Grants total invulnerability to enemy bullets, hazards, and drone collision damage for 4 seconds.',
    effect: '4s Complete Invulnerability',
    duration: 4.0
  },
  repair_core: {
    id: 'repair_core',
    name: 'Nanite Repair',
    icon: '❤️',
    category: 'DEFENSE',
    rarity: 'Common',
    color: '#ff2a6d',
    modes: ['universal', 'duel', 'swarm', 'heist', 'breakout'],
    desc: 'Instantly repairs +1 HP (or converts to +2 Cores if piloting a Void chassis).',
    effect: '+1 HP Instant Repair',
    duration: 0.0
  },
  nano_armor: {
    id: 'nano_armor',
    name: 'Nano Armor',
    icon: '🔰',
    category: 'DEFENSE',
    rarity: 'Uncommon',
    color: '#3b82f6',
    modes: ['universal', 'duel', 'swarm', 'heist'],
    desc: 'Hardens paddle plating, reducing all incoming hazard and projectile damage by 50% for 8 seconds.',
    effect: '-50% Incoming Damage',
    duration: 8.0
  },
  kinetic_reflect: {
    id: 'kinetic_reflect',
    name: 'Kinetic Reflect',
    icon: '🪞',
    category: 'DEFENSE',
    rarity: 'Rare',
    color: '#10b981',
    modes: ['duel', 'heist'],
    desc: 'Supercharges paddle deflection angle, accelerating return balls and doubling return damage for 7s.',
    effect: '2x Deflection Speed & Power',
    duration: 7.0
  },
  emergency_matrix: {
    id: 'emergency_matrix',
    name: 'Emergency Matrix',
    icon: '🧬',
    category: 'DEFENSE',
    rarity: 'Legendary',
    color: '#ec4899',
    modes: ['universal', 'duel', 'swarm', 'heist'],
    desc: 'Safety failsafe: Prevents one lethal blow, granting 2.5s of stasis and restoring 1 HP if reduced to 0.',
    effect: 'Fatal Blow Prevention',
    duration: 0.0
  },

  // --- CONTROL DROPS ---
  emp_pulse: {
    id: 'emp_pulse',
    name: 'EMP Pulse',
    icon: '📡',
    category: 'CONTROL',
    rarity: 'Uncommon',
    color: '#00f2fe',
    modes: ['swarm', 'heist', 'breakout'],
    desc: 'Discharges an electromagnetic shockwave that eliminates all enemy bullets and stuns nearby targets.',
    effect: 'Bullet clearance & drone stun',
    duration: 0.0
  },
  gravity_well: {
    id: 'gravity_well',
    name: 'Gravity Well',
    icon: '🌀',
    category: 'CONTROL',
    rarity: 'Rare',
    color: '#8b5cf6',
    modes: ['swarm', 'breakout', 'heist'],
    desc: 'Generates a micro-singularity pulling drones, items, and loose Data Chips toward the arena center for 5s.',
    effect: 'Vortex pull toward arena center',
    duration: 5.0
  },
  cryo_field: {
    id: 'cryo_field',
    name: 'Cryo Field',
    icon: '🧊',
    category: 'CONTROL',
    rarity: 'Uncommon',
    color: '#06b6d4',
    modes: ['duel', 'swarm', 'heist'],
    desc: 'Freezes ambient thermal energy, slowing enemy drone movement and AI paddle reaction speeds by 40% for 6s.',
    effect: '-40% Hostile Velocity',
    duration: 6.0
  },
  time_dilator: {
    id: 'time_dilator',
    name: 'Time Dilator',
    icon: '⏱️',
    category: 'CONTROL',
    rarity: 'Epic',
    color: '#6366f1',
    modes: ['universal', 'duel', 'swarm', 'heist'],
    desc: 'Slows combat simulation time to 50% for 5s while player paddle maintains full responsive speed.',
    effect: '50% Bullet-Time Simulation',
    duration: 5.0
  },
  disruptor_wave: {
    id: 'disruptor_wave',
    name: 'Disruptor Wave',
    icon: '🌊',
    category: 'CONTROL',
    rarity: 'Uncommon',
    color: '#0284c7',
    modes: ['swarm', 'duel'],
    desc: 'Forces encroaching enemies 150px backwards and disrupts opponent AI tracking for 3 seconds.',
    effect: 'Hostile knockback & AI disruption',
    duration: 3.0
  },

  // --- UTILITY DROPS ---
  data_vacuum: {
    id: 'data_vacuum',
    name: 'Chip Magnetizer',
    icon: '🧲',
    category: 'UTILITY',
    rarity: 'Common',
    color: '#14b8a6',
    modes: ['universal', 'breakout', 'heist', 'swarm'],
    desc: 'Magnetically attracts all loose Data Chips, powerup items, and energy orbs directly to the paddle for 8s.',
    effect: 'Magnetic item & chip attraction',
    duration: 8.0
  },
  overclock_cell: {
    id: 'overclock_cell',
    name: 'Overclock Cell',
    icon: '🔋',
    category: 'UTILITY',
    rarity: 'Uncommon',
    color: '#22c55e',
    modes: ['universal', 'duel', 'swarm', 'heist', 'breakout'],
    desc: 'Supercharges energy capacitors, reducing all active ability cooldown timers by +50% for 10 seconds.',
    effect: '+50% Faster Ability Recovery',
    duration: 10.0
  },
  ability_reset: {
    id: 'ability_reset',
    name: 'Ability Surge',
    icon: '⚡',
    category: 'UTILITY',
    rarity: 'Rare',
    color: '#ffd700',
    modes: ['universal', 'duel', 'swarm', 'heist'],
    desc: 'Instantly recharges all equipped active abilities to 100% capacity.',
    effect: 'Instant 100% Ability Refresh',
    duration: 0.0
  },
  precision_thrusters: {
    id: 'precision_thrusters',
    name: 'Precision Thrusters',
    icon: '🚀',
    category: 'UTILITY',
    rarity: 'Common',
    color: '#00f2fe',
    modes: ['universal', 'duel', 'heist'],
    desc: 'Increases paddle traversal velocity and acceleration response by +35% for 8 seconds.',
    effect: '+35% Paddle Speed',
    duration: 8.0
  },
  combo_stabilizer: {
    id: 'combo_stabilizer',
    name: 'Combo Stabilizer',
    icon: '🎯',
    category: 'UTILITY',
    rarity: 'Uncommon',
    color: '#f59e0b',
    modes: ['universal', 'breakout', 'heist'],
    desc: 'Locks the current combo counter from decaying for 12s, preserving high Data Chip score multipliers.',
    effect: '12s Combo Decay Immunity',
    duration: 12.0
  },

  // --- SPECIAL / CHAOS DROPS ---
  drone_sentinel: {
    id: 'drone_sentinel',
    name: 'Drone Sentinel',
    icon: '🛸',
    category: 'SPECIAL',
    rarity: 'Epic',
    color: '#10b981',
    modes: ['universal', 'swarm', 'breakout', 'heist'],
    desc: 'Deploys an autonomous wing sentinel that targets encroaching enemies with kinetic darts for 12 seconds.',
    effect: 'Autonomous firing wing sentinel',
    duration: 12.0
  },
  singularity_blast: {
    id: 'singularity_blast',
    name: 'Singularity Blast',
    icon: '🕳️',
    category: 'SPECIAL',
    rarity: 'Legendary',
    color: '#7c3aed',
    modes: ['universal', 'swarm', 'breakout', 'heist'],
    desc: 'High-yield spatial collapse that instantly destroys all standard enemy projectiles and non-elite drones.',
    effect: 'Catastrophic arena sweep',
    duration: 0.0
  },
  super_overcharge: {
    id: 'super_overcharge',
    name: 'Super Overcharge',
    icon: '⭐',
    category: 'SPECIAL',
    rarity: 'Epic',
    color: '#f43f5e',
    modes: ['universal', 'duel', 'heist', 'breakout'],
    desc: 'Hypercharges ball kinetic systems: +100% impact damage, increased velocity, and neon particle aura for 8s.',
    effect: '+100% Damage, +25% Speed',
    duration: 8.0
  }
};


