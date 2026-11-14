export const WORLD_SIZE = 1600;
export const HALF_WORLD = WORLD_SIZE / 2;

export const CAMERA_MODES = {
  ISOMETRIC: 'ISOMETRIC', // 2.5D Low-Poly Orthographic (Classic Isometric diorama)
  TOPDOWN: 'TOPDOWN',     // 2D Pure Top-Down Orthographic (Retro 2D Open World Map)
  PERSPECTIVE: 'PERSPECTIVE', // 3D Follow / Cinematic
  FREELOOK: 'FREELOOK'    // Creator Spirit / Free Flight Camera throughout entire continent
};

export const FAST_TRAVEL_POINTS = [
  { id: 'crossroads', name: 'Crossroads Sanctuary Bridge', x: 0, z: 10, biome: 'Crossroads', desc: 'Ancient stone bridge connecting all 4 realm territories' },
  { id: 'royal_citadel', name: 'Royal Castle & Citadel (Humans)', x: 380, z: -325, biome: 'Human Kingdom', desc: 'Grand outer curtain walls and throne fortress of King Reginald' },
  { id: 'high_valoria_town', name: 'High Valoria Castle Town (Humans)', x: 356, z: -248, biome: 'Human Kingdom', desc: 'The magnificent capital high town outside King Reginald’s Citadel with grand fountain, clocktower, artisan guilds, and flower markets' },
  { id: 'princess_pavilion', name: 'Princess Aurelia’s Sun Pavilion', x: 470, z: -352, biome: 'Human Kingdom', desc: 'Graceful royal estate and gardens of Crown Princess Aurelia' },
  { id: 'tavern', name: 'The Dragon’s Rest Tavern (Humans)', x: 205, z: -74, biome: 'Human Kingdom', desc: 'Lively medieval tavern and adventurer guild with ale casks and bounties' },
  { id: 'demon_citadel', name: 'Colossal Obsidian Dread Citadel (Demons)', x: -220, z: -145, biome: 'Demon Territory', desc: 'Colossal nether fortress crowned in 45m demon horns, magma moat, and seat of Demon King Malakor' },
  { id: 'demon_altar', name: 'Void Sacrificial Altar (Demons)', x: -270, z: -238, biome: 'Demon Territory', desc: 'Stepped dark stone dais with floating purple Nether Crystal' },
  { id: 'elven_sanctuary', name: 'Moon Spire Sanctuary (Elves)', x: -200, z: 185, biome: 'Elven Forest', desc: 'Graceful marble colonnades and floating Celestial Moon Orb' },
  { id: 'elven_archery', name: 'Whispering Archery Grove (Elves)', x: -110, z: 150, biome: 'Elven Forest', desc: 'Target range nestled among colossal ancient elder trees' },
  { id: 'jungle_outpost', name: 'Wild Jungle Research Outpost (Elves)', x: -260, z: 120, biome: 'Elven Forest', desc: 'Elevated bamboo stilt treehouse in the lush deep jungle canopy' },
  { id: 'dwarf_bastion', name: 'Karak-Drak Mountain Bastion (Dwarves)', x: 200, z: 182, biome: 'Dwarf Industry', desc: 'Massive heavy stone fortress flanked by colossal dwarven guard statues' },
  { id: 'dwarf_foundry', name: 'Great Blast Furnaces & Gears (Dwarves)', x: 140, z: 222, biome: 'Dwarf Industry', desc: 'Twin industrial smelting towers with glowing molten iron and rotating cogs' },
  { id: 'elder_lodge', name: 'Retired Hero’s Rustic Lodge', x: 130, z: 248, biome: 'Dwarf Industry', desc: 'Master Vance’s cozy thatched timber home in the peaceful foothills' },
  { id: 'oakhaven_village', name: 'Oakhaven Agricultural Village (Farmlands)', x: 105, z: 10, biome: 'Human Kingdom', desc: 'Bustling farming settlement with golden wheat fields, pumpkin patches, granary, and communal hearth' },
  { id: 'fernbrook_hamlet', name: 'Fernbrook Woodland Orchard & Hamlet', x: -75, z: 110, biome: 'Elven Forest', desc: 'Rustic riverside orchard hamlet with herbal garden beds, skep beehives, and log cabins' },
  { id: 'demon_enclave', name: 'Krag’mar Demon Enclave', x: -120, z: -90, biome: 'Demon Territory', desc: 'Smoldering nether outpost with bone-spire keep, horned huts, boiling sulfur cauldron, and living demons' },
  { id: 'elven_glade', name: 'Sylvaheim Elven Glade', x: -160, z: 78, biome: 'Elven Forest', desc: 'Serene woodland sanctuary with living jade tree pavilions, luminous starlight mana pool, and elven singers' },
  { id: 'dwarf_clanstead', name: 'Karak-Vorn United Clanstead', x: 105, z: 140, biome: 'Dwarf Industry', desc: 'Fortified mountain settlement where the dwarven clans live and work united with mead halls, clan forge, and the Unity Monument' }
];

export const BIOMES = {
  HUMAN_KINGDOM: { name: 'Kingdom of Valoria (Humans)', color: '#3b82f6', ambient: 0x1e3a8a },
  DEMON_REALM: { name: 'Obsidian Wastes (Demons)', color: '#ef4444', ambient: 0x450a0a },
  ELVEN_FOREST: { name: 'Sylvaheim Canopy (Elves)', color: '#10b981', ambient: 0x064e3b },
  DWARF_INDUSTRY: { name: 'Karak-Drak Stronghold (Dwarves)', color: '#f59e0b', ambient: 0x78350f },
  CROSSROADS: { name: 'Crossroads Sanctuary Bridge', color: '#a855f7', ambient: 0x3b0764 }
};

// Inhabited Settlement & Population Protection Zones (Sanctuaries where wild monsters are strictly barred)
export const SANCTUARY_ZONES = [
  // 1. Human Kingdom Town Market Bazaar & Dragon's Rest Tavern Square
  { id: 'market', name: 'Valoria Market Bazaar & Tavern', x: 205, z: -85, radius: 72 },
  // 2. Human King's Royal Castle Citadel & Courtyards
  { id: 'royal_citadel', name: 'Royal Castle & Citadel', x: 380, z: -380, radius: 95 },
  // High Valoria Royal Castle Town & Grand Promenade
  { id: 'high_valoria_town', name: 'High Valoria Castle Town', x: 370, z: -250, radius: 82 },
  // 3. Princess Aurelia's Royal Pavilion & Gardens
  { id: 'princess_pavilion', name: 'Princess Aurelia’s Sun Pavilion', x: 470, z: -370, radius: 52 },
  // 4. Oakhaven Agricultural Village & Farmlands
  { id: 'oakhaven_village', name: 'Oakhaven Agricultural Village', x: 105, z: 10, radius: 68 },
  // 5. Fernbrook Woodland Orchard & Hamlet
  { id: 'fernbrook_hamlet', name: 'Fernbrook Woodland Hamlet', x: -75, z: 110, radius: 62 },
  // 6. Sylvaheim Elven Glade & Mana Pool
  { id: 'elven_glade', name: 'Sylvaheim Elven Glade', x: -160, z: 90, radius: 62 },
  // 7. Moon Spire High Elven Sanctuary
  { id: 'elven_sanctuary', name: 'Moon Spire Sanctuary', x: -200, z: 200, radius: 68 },
  // 8. Karak-Vorn United Dwarven Clanstead
  { id: 'dwarf_clanstead', name: 'Karak-Vorn Clanstead', x: 105, z: 140, radius: 62 },
  // 9. Karak-Drak Mountain Bastion & Foundries
  { id: 'dwarf_bastion', name: 'Karak-Drak Mountain Bastion', x: 200, z: 200, radius: 70 },
  { id: 'dwarf_foundry', name: 'Great Blast Furnaces & Works', x: 140, z: 240, radius: 55 },
  // 10. Master Vance's Retired Hero Lodge
  { id: 'elder_lodge', name: 'Master Vance’s Rustic Lodge', x: 130, z: 260, radius: 42 },
  // 11. Krag’mar Demon Enclave
  { id: 'demon_enclave', name: 'Krag’mar Demon Enclave', x: -120, z: -90, radius: 58 },
  // 12. Colossal Obsidian Dread Citadel
  { id: 'demon_citadel', name: 'Obsidian Dread Citadel', x: -220, z: -220, radius: 78 },
  // 13. Central Crossroads Sanctuary Bridge & Waypoint Obelisk
  { id: 'crossroads', name: 'Central Crossroads Sanctuary', x: 0, z: 10, radius: 46 }
];

export function isInSanctuaryZone(x, z, margin = 0) {
  for (let i = 0; i < SANCTUARY_ZONES.length; i++) {
    const zone = SANCTUARY_ZONES[i];
    const d = Math.hypot(x - zone.x, z - zone.z);
    if (d < zone.radius + margin) {
      return zone;
    }
  }
  return null;
}

export const RACES = {
  human: {
    id: 'human',
    name: 'Humans of Valoria',
    icon: '👑',
    color: '#3b82f6',
    accentColor: '#60a5fa',
    lifespan: '75 – 100 Years',
    averageYears: 85,
    agingSpeed: '1.0x (Mortal Baseline)',
    homeland: 'Kingdom of Valoria (North-East)',
    trait: 'Rapid Ambition & Legacy Builders',
    dispositionTag: '🏰 Versatile & Resourceful',
    dispositionTitle: 'Pragmatic Mastery & Adaptability',
    attitude: 'Humans are good with their stuff—adaptable craft, vast agriculture, stone fortifications, and lucrative trade networks. Deeply suspicious of elven arrogance, dwarven greed, and demon hostility.',
    agingDesc: 'Vigorous prime up to their 30s, distinguished silvering in 50s, venerable elders at 70+. Driven by urgency to leave enduring deeds before their flame fades.',
    philosophy: '“Life is a fierce flame that burns bright and short. In fewer than a hundred winters, we build kingdoms, write treaties, and defy the eternal dark.”',
    viewsOnOthers: [
      { target: 'Demons', stance: 'Hostile', desc: 'Monsters of pure brimstone and hatred. There is no diplomacy with Malakor—only cold steel.' },
      { target: 'Elves', stance: 'Strained', desc: 'Haughty aristocrats looking down their noses from tree branches who view human lives as disposable insects.' },
      { target: 'Dwarves', stance: 'Brisk Trade', desc: 'Greedy for gold and stubborn as bedrock, but their mechanical technology and iron weapons are worth the steep price.' }
    ]
  },
  dwarf: {
    id: 'dwarf',
    name: 'Dwarves of Karak-Drak',
    icon: '🛡️',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    lifespan: '350 – 500 Years',
    averageYears: 420,
    agingSpeed: '0.2x (Stone-Forged Longevity)',
    homeland: 'Karak-Drak Mountain Bastion (South-East)',
    trait: 'Unbreakable Unity & Generational Craft',
    dispositionTag: '⚙️ Master of Technology',
    dispositionTitle: 'Mechanical Engineering & Steam Power',
    attitude: 'Dwarves are mechanical geniuses—masters of giant rotating cog gears, twin smelting blast furnaces, hydraulic pressure, and minecart rail networks. Ridicule elven vanity and human flimsy woodwork.',
    agingDesc: 'Physical prime extends past 150 years. Dense bone density, stone-hard resilience, and mighty braided beards turning iron-silver only after 300 winters.',
    philosophy: '“A human counts in seasons; a dwarf counts in mountain strata. Stone endures, brotherhood outlasts empires, and what is forged united stands forever.”',
    viewsOnOthers: [
      { target: 'Demons', stance: 'Enemy', desc: 'Overgrown burning fiends! A solid hit from a steam-powered piston hammer will crack their horns in two!' },
      { target: 'Elves', stance: 'Contemptuous', desc: 'Dainty snobs singing to twigs! Let\'s see their moonlight poetry turn an eight-ton iron cog gear!' },
      { target: 'Humans', stance: 'Skeptical', desc: 'Good trading partners, but their wooden shacks rot in eighty years! Why build in timber when you can forge in granite?' }
    ]
  },
  elf: {
    id: 'elf',
    name: 'Elves of Sylvaheim',
    icon: '🌙',
    color: '#10b981',
    accentColor: '#34d399',
    lifespan: '1,500 – 3,000+ Years',
    averageYears: 2200,
    agingSpeed: '0.03x (Celestial Starlight Longevity)',
    homeland: 'Sylvaheim Whispering Canopy (South-West)',
    trait: 'Perpetual Youth & Timeless Harmony',
    dispositionTag: '👑 High Celestial Nobility',
    dispositionTitle: 'Supreme Aristocracy & Cosmic Elegance',
    attitude: 'Elves love to be noble—obsessed with ancient high nobility, celestial poise, immaculate marble, and moonlight perfection. View humans as hasty barbarians, dwarves as crude soot-covered troglodytes, and demons as foul abominations.',
    agingDesc: 'Perpetual youth sustained by the Colossal Elder Trees and Celestial Moon Orb. Age manifests not as decay, but as luminous starlight eyes and deep cosmic tranquility.',
    philosophy: '“We watch mortal dynasties blossom and wither like morning lilies. Time is not a race to run, but an ancient melody to harmonize with.”',
    viewsOnOthers: [
      { target: 'Demons', stance: 'Abhorrent', desc: 'Vile corruption of primeval brimstone. An affront to starlight and cosmic nobility that must be purged.' },
      { target: 'Dwarves', stance: 'Disgusted', desc: 'Clattering, soot-belching troglodytes whose black smoke stains our sacred dew and deafens the woodland spirits.' },
      { target: 'Humans', stance: 'Condescending', desc: 'Crude, noisy children stumbling through their brief seventy years without ever comprehending true poise or high nobility.' }
    ]
  },
  demon: {
    id: 'demon',
    name: 'Demons of the Nether Crags',
    icon: '🔥',
    color: '#ef4444',
    accentColor: '#b91c1c',
    lifespan: 'Ageless / Eternal (10,000+ Years)',
    averageYears: 10000,
    agingSpeed: '0.00x (Void Cycle & Nether Flame)',
    homeland: 'Obsidian Dread Wastes (North-West)',
    trait: 'Immortal Nether Vessels & Magma Rebirth',
    dispositionTag: '🔥 Hates Everyone',
    dispositionTitle: 'Universal Contempt & Nether Aggression',
    attitude: 'Demons despise everyone—utter contempt for all other races without exception. View mortals as fragile insects and refuse to ally with anyone, relying solely on brimstone, magma, and raw nether power.',
    agingDesc: 'Do not age through biological decay. Physical vessels persist indefinitely; if shattered in battle, their nether soul re-condenses over centuries in boiling molten magma.',
    philosophy: '“Mortals cling to fleeting heartbeats like drowning insects. We were here before your mountains cooled, and our obsidian flames will burn long after your castles turn to dust.”',
    viewsOnOthers: [
      { target: 'Humans', stance: 'Cattle', desc: 'Weak, squishy mortals hiding behind crumbling walls. When our horns blow, their wheat fields burn to ash!' },
      { target: 'Elves', stance: 'Fragile Dolls', desc: 'Smug tree-hugging narcissists dressed in white silk. Their sacred Elder Trees will make excellent kindling!' },
      { target: 'Dwarves', stance: 'Mud Rats', desc: 'Short pests burrowing in holes with their squeaking toys and gears. When the ground splits, their mountains will become their tombs!' }
    ]
  }
};

export const ROOF_MODES = {
  AUTO: 'AUTO',       // Cutaway when player steps inside or near
  CUTAWAY: 'CUTAWAY', // Always cutaway (inspect all open interiors)
  SOLID: 'SOLID'      // Always solid roofs
};
