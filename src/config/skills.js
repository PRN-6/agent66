export const SKILL_BRANCHES = [
  {
    id: 'celestial',
    name: 'Celestial Starlight',
    icon: '🌙',
    color: '#38bdf8',
    accentColor: '#0ea5e9',
    homeland: 'Sylvaheim Elven Canopy',
    desc: 'Ancient starlight magic channeling lunar radiance, restorative auras, and cosmic supernovas.'
  },
  {
    id: 'nether',
    name: 'Nether Pyromancy',
    icon: '🔥',
    color: '#ef4444',
    accentColor: '#dc2626',
    homeland: 'Obsidian Dread Wastes',
    desc: 'Volcanic brimstone and soul-fire spells erupting magma fissures and apocalyptic cataclysms.'
  },
  {
    id: 'forge',
    name: 'Steam & Seismic Forge',
    icon: '⚙️',
    color: '#f59e0b',
    accentColor: '#d97706',
    homeland: 'Karak-Drak Bastion',
    desc: 'Industrial dwarven engineering utilizing high-pressure steam blasts, shrapnel bombs, and earth quakes.'
  },
  {
    id: 'blade',
    name: 'Dawnblade & Shadow',
    icon: '⚔️',
    color: '#a855f7',
    accentColor: '#8b5cf6',
    homeland: 'Kingdom of Valoria',
    desc: 'Swift martial arts, sweeping crescent whirlwinds, shadow iaijutsu blinks, and heavenly blade strikes.'
  }
];

export const SKILLS = [
  /* -------------------------------------------------------------------------
     1. CELESTIAL STARLIGHT BRANCH (Elven Discipline)
     ------------------------------------------------------------------------- */
  {
    id: 'starlight_orb',
    branch: 'celestial',
    tier: 1,
    name: 'Starlight Moon Orb',
    icon: '✨',
    cost: 1,
    cooldown: 3.0,
    damage: 48,
    radius: 16.0, // Projectile / Target Range
    type: 'projectile',
    color: '#38bdf8',
    requires: null,
    desc: 'Hurls a homing sphere of compressed celestial starlight that detonates in a flash of lunar energy.'
  },
  {
    id: 'celestial_ward',
    branch: 'celestial',
    tier: 2,
    name: 'Prismatic Moon Ward',
    icon: '🛡️',
    cost: 2,
    cooldown: 7.0,
    damage: 75,
    heal: 40,
    radius: 8.5,
    type: 'aoe_aura',
    color: '#06b6d4',
    requires: 'starlight_orb',
    desc: 'Radiates an expanding celestial mandala that heals the caster for 40 HP and scorches nearby foes with radiant light.'
  },
  {
    id: 'supernova_beam',
    branch: 'celestial',
    tier: 3,
    name: 'Cosmic Supernova Beam',
    icon: '🌟',
    cost: 3,
    cooldown: 13.0,
    damage: 185,
    radius: 12.0,
    type: 'sky_beam',
    color: '#fde047',
    requires: 'celestial_ward',
    desc: 'Calls down an apocalyptic pillar of pure stellar fire from the cosmos, decimating all enemies in a grand radius.'
  },

  /* -------------------------------------------------------------------------
     2. NETHER PYROMANCY BRANCH (Demon Discipline)
     ------------------------------------------------------------------------- */
  {
    id: 'brimstone_fireball',
    branch: 'nether',
    tier: 1,
    name: 'Brimstone Fireball',
    icon: '🔥',
    cost: 1,
    cooldown: 3.2,
    damage: 56,
    radius: 16.0,
    type: 'projectile',
    color: '#f97316',
    requires: null,
    desc: 'Launches a roaring volcanic magma sphere that explodes violently on impact, searing the earth.'
  },
  {
    id: 'magma_fissure',
    branch: 'nether',
    tier: 2,
    name: 'Volcanic Magma Fissure',
    icon: '🌋',
    cost: 2,
    cooldown: 6.5,
    damage: 88,
    radius: 9.0,
    type: 'ground_burst',
    color: '#ef4444',
    requires: 'brimstone_fireball',
    desc: 'Shatters the ground beneath enemies, erupting sharp basalt spikes and boiling sulfur lava pools.'
  },
  {
    id: 'nether_cataclysm',
    branch: 'nether',
    tier: 3,
    name: 'Nether Hellfire Cataclysm',
    icon: '💥',
    cost: 3,
    cooldown: 14.0,
    damage: 215,
    radius: 14.0,
    type: 'ring_burst',
    color: '#b91c1c',
    requires: 'magma_fissure',
    desc: 'Unleashes the full wrath of Malakor, summoning a 360-degree storm of black and purple nether flames.'
  },

  /* -------------------------------------------------------------------------
     3. STEAM & SEISMIC FORGE BRANCH (Dwarven Discipline)
     ------------------------------------------------------------------------- */
  {
    id: 'steam_blast',
    branch: 'forge',
    tier: 1,
    name: 'Pressurized Steam Blast',
    icon: '💨',
    cost: 1,
    cooldown: 2.8,
    damage: 50,
    radius: 7.5,
    type: 'cone',
    color: '#e2e8f0',
    requires: null,
    desc: 'Releases a deafening conical wave of scalding steam that pushes back and burns all targets in front.'
  },
  {
    id: 'molten_bomb',
    branch: 'forge',
    tier: 2,
    name: 'Molten Shrapnel Bomb',
    icon: '💣',
    cost: 2,
    cooldown: 6.0,
    damage: 82,
    radius: 8.5,
    type: 'projectile_aoe',
    color: '#f59e0b',
    requires: 'steam_blast',
    desc: 'Hurls an explosive cluster of glowing molten gears that detonate in a hail of burning metal fragments.'
  },
  {
    id: 'titan_quake',
    branch: 'forge',
    tier: 3,
    name: 'Titan Seismic Earth-Quake',
    icon: '⚙️',
    cost: 3,
    cooldown: 12.0,
    damage: 190,
    radius: 12.0,
    type: 'earth_quake',
    color: '#d97706',
    requires: 'molten_bomb',
    desc: 'Strikes the bedrock with immense hydraulic force, causing massive spinning iron gears to burst from the earth.'
  },

  /* -------------------------------------------------------------------------
     4. DAWNBLADE & SHADOW BRANCH (Human Discipline)
     ------------------------------------------------------------------------- */
  {
    id: 'whirlwind_slash',
    branch: 'blade',
    tier: 1,
    name: 'Whirlwind Crescent Slash',
    icon: '⚔️',
    cost: 1,
    cooldown: 2.5,
    damage: 62,
    radius: 6.0,
    type: 'whirlwind',
    color: '#3b82f6',
    requires: null,
    desc: 'Executes a lightning-fast 360-degree spinning crescent sword slash that strikes all adjacent foes.'
  },
  {
    id: 'shadow_blink',
    branch: 'blade',
    tier: 2,
    name: 'Shadow Iaijutsu Blink',
    icon: '⚡',
    cost: 2,
    cooldown: 5.5,
    damage: 96,
    radius: 10.0,
    type: 'teleport_dash',
    color: '#8b5cf6',
    requires: 'whirlwind_slash',
    desc: 'Teleports the warrior 10 meters forward instantaneously in a streak of shadow, severing all enemies in the trajectory.'
  },
  {
    id: 'heavenly_judgment',
    branch: 'blade',
    tier: 3,
    name: 'Heavenly Sovereign Judgment',
    icon: '👑',
    cost: 3,
    cooldown: 13.0,
    damage: 205,
    radius: 12.0,
    type: 'sky_beam',
    color: '#f59e0b',
    requires: 'shadow_blink',
    desc: 'Calls down a colossal luminous golden broadsword from the heavens to impale and obliterate enemy forces.'
  }
];

export function getSkillById(id) {
  return SKILLS.find(s => s.id === id) || null;
}

