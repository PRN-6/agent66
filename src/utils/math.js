// Fast 2D simplex/pseudo-perlin noise implementation for procedural low-poly terrain
export function pseudoNoise(x, z) {
  const s = Math.sin(x * 0.012 + Math.cos(z * 0.015)) * 0.5 + 0.5;
  const s2 = Math.cos(x * 0.028 - Math.sin(z * 0.022)) * 0.3;
  const s3 = Math.sin(x * 0.06 + z * 0.06) * 0.15;
  const s4 = Math.cos(x * 0.005 + z * 0.005) * 0.8;
  return s + s2 + s3 + s4;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// Distance helper
export function dist2D(x1, z1, x2, z2) {
  return Math.hypot(x2 - x1, z2 - z1);
}

// Exact distance from point (px, pz) to line segment (x1, z1) -> (x2, z2)
export function distToSegment(px, pz, x1, z1, x2, z2) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const lenSq = dx * dx + dz * dz;
  if (lenSq === 0) return Math.hypot(px - x1, pz - z1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (pz - z1) * dz) / lenSq));
  const projX = x1 + t * dx;
  const projZ = z1 + t * dz;
  return Math.hypot(px - projX, pz - projZ);
}

// Key faction landmark level foundation pads (keeps buildings, courtyards, and markets level)
export const LEVEL_PADS = [
  // Human Kingdom (North-East) - Relocated to grand domain far from other territories
  { x: 380, z: -380, r: 80, margin: 30 }, // Royal Castle Citadel & Keep Courtyard
  { x: 370, z: -250, r: 68, margin: 25 }, // High Valoria Castle Town & Royal Promenade
  { x: 205, z: -85, r: 48, margin: 20 },  // Town Market Square & Dragon's Rest Tavern
  { x: 95, z: 10, r: 45, margin: 20 },    // Oakhaven Agricultural Hamlet & Farmlands
  { x: 60, z: -60, r: 25, margin: 15 },   // Windmill & Miller's Cottage
  { x: 470, z: -370, r: 35, margin: 25 }, // Princess Aurelia's Sun Pavilion & Manor in East Royal Gardens
  // Dwarven Industry City (South-East)
  { x: 200, z: 200, r: 48, margin: 25 },  // Karak-Drak Mountain Bastion & Gate
  { x: 140, z: 240, r: 38, margin: 20 },  // Great Blast Furnaces & Smelting Trough
  { x: 130, z: 260, r: 28, margin: 15 },  // Master Vance's Lodge & Hearth
  { x: 105, z: 140, r: 45, margin: 20 },  // Karak-Vorn Dwarf Clanstead & Mead Hall
  // Demon Dark Territory (North-West)
  { x: -220, z: -220, r: 68, margin: 25 }, // Colossal Obsidian Dread Citadel & Malakor's Throne
  { x: -270, z: -250, r: 38, margin: 20 }, // Void Sacrificial Altar & Pyramid
  { x: -120, z: -90, r: 45, margin: 20 },  // Krag'mar Demon Enclave & Magma Cauldron
  // Elven Enchanted Forest (South-West)
  { x: -200, z: 200, r: 48, margin: 25 },  // Moon Spire Sanctuary & Colonnades
  { x: -140, z: 150, r: 40, margin: 20 },  // Colossal Elder Trees & Canopy Platforms
  { x: -160, z: 90, r: 45, margin: 20 },   // Sylvaheim Elven Glade & Mana Pool
  { x: -75, z: 110, r: 42, margin: 20 },   // Fernbrook Woodland Hamlet & Beehives
  { x: -260, z: 120, r: 30, margin: 18 },  // Wild Jungle Research Outpost
  { x: -30, z: 50, r: 22, margin: 15 },    // River Shore Beach Haven
  // Crossroads Nexus Hub
  { x: 0, z: 10, r: 35, margin: 18 }       // Central Crossroads Bridge & Obelisk Sanctuary
];

// The Grand Imperial Road Segments connecting Crossroads (0, 10) to the 4 realm citadels
export const IMPERIAL_ROADS = [
  // 1. Valoria Highroad (North-East: Crossroads -> Oakhaven -> Market -> Grand Royal Citadel)
  { x1: 0, z1: 10, x2: 50, z2: 10 },
  { x1: 50, z1: 10, x2: 95, z2: 10 },
  { x1: 95, z1: 10, x2: 145, z2: -35 },
  { x1: 145, z1: -35, x2: 205, z2: -60 },
  { x1: 205, z1: -60, x2: 290, z2: -190 },
  { x1: 290, z1: -190, x2: 370, z2: -250 }, // High Valoria South Avenue
  { x1: 370, z1: -250, x2: 380, z2: -325 }, // High Valoria Grand Promenade to Castle Gate
  { x1: 320, z1: -250, x2: 430, z2: -250 }, // High Valoria East-West Artisan Boulevard
  { x1: 380, z1: -325, x2: 470, z2: -365 }, // Road branch to Princess Aurelia's Royal Gardens
  // 2. Iron Mountain Trail (South-East: Crossroads -> Karak-Vorn -> Bastion)
  { x1: 0, z1: 10, x2: 45, z2: 65 },
  { x1: 45, z1: 65, x2: 105, z2: 140 },
  { x1: 105, z1: 140, x2: 155, z2: 175 },
  { x1: 155, z1: 175, x2: 200, z2: 200 },
  // 3. Starlight Canopy Path (South-West: Crossroads -> Fernbrook -> Sylvaheim -> Moon Spire)
  { x1: 0, z1: 10, x2: -40, z2: 60 },
  { x1: -40, z1: 60, x2: -75, z2: 110 },
  { x1: -75, z1: 110, x2: -125, z2: 100 },
  { x1: -125, z1: 100, x2: -160, z2: 90 },
  { x1: -160, z1: 90, x2: -200, z2: 200 },
  // 4. Ashen Dread Causeway (North-West: Crossroads -> Krag'mar -> Dread Keep)
  { x1: 0, z1: 10, x2: -55, z2: -35 },
  { x1: -55, z1: -35, x2: -120, z2: -90 },
  { x1: -120, z1: -90, x2: -175, z2: -155 },
  { x1: -175, z1: -155, x2: -220, z2: -220 }
];

// Returns min distance from (px, pz) to any Imperial Road segment
export function getDistToImperialRoad(px, pz) {
  if (Math.hypot(px, pz) > 360) return 999;
  let minDist = 999;
  for (let i = 0; i < IMPERIAL_ROADS.length; i++) {
    const seg = IMPERIAL_ROADS[i];
    const d = distToSegment(px, pz, seg.x1, seg.z1, seg.x2, seg.z2);
    if (d < minDist) {
      minDist = d;
      if (minDist < 1.0) break;
    }
  }
  return minDist;
}

// Low-poly terrain elevation function for 4 major realm territories
export function getTerrainHeight(x, z) {
  // 1. Crossroads bridge area (x: -26 to 26, z: -2 to 22) maintains a level crossing
  const isCrossroadsBridge = Math.abs(x) < 26 && Math.abs(z - 10) < 14;
  if (isCrossroadsBridge) {
    return 0.5;
  }

  // 2. River canyon runs North to South roughly along x = sin(z * 0.01) * 35
  const riverX = Math.sin(z * 0.01) * 35;
  const riverDist = Math.abs(x - riverX);
  const isRiver = (riverDist < 24 && z > -780 && z < 680);

  // 3. Raw Regional Fantasy Geography
  let rawHeight = 0.5;
  if (x > 20 && z < 40) {
    // 3.1 Human Kingdom (North-East): Rolling pastoral meadows & soft knolls
    const rollingHills = Math.sin(x * 0.015) * Math.cos(z * 0.015) * 2.2 +
                         Math.sin(x * 0.032 + z * 0.02) * 0.8;
    rawHeight = 0.5 + rollingHills;
  } else if (x > 20 && z >= 40) {
    // 3.2 Dwarven Industry City (South-East): Rugged granite mountain foothills & terraced crags
    const mountainCrags = Math.abs(Math.sin(x * 0.018) + Math.cos(z * 0.018)) * 3.2 +
                          Math.sin(x * 0.04) * 1.2;
    rawHeight = 0.5 + mountainCrags;
  } else if (x <= 20 && z < 40) {
    // 3.3 Demon Dark Territory (North-West): Jagged volcanic ridges & basalt spires
    const volcanicCrags = Math.abs(Math.sin(x * 0.024) * Math.cos(z * 0.024)) * 3.6 +
                          Math.sin(x * 0.05 + z * 0.04) * 1.0;
    rawHeight = 0.5 + volcanicCrags;
  } else {
    // 3.4 Elven Forest (South-West): Rolling enchanted elder wood knolls & sacred mounds
    const enchantedKnolls = Math.sin(x * 0.022) * Math.cos(z * 0.022) * 2.4 +
                            Math.sin((x + z) * 0.028) * 0.9;
    rawHeight = 0.5 + enchantedKnolls;
  }

  // 4. Smooth foundation pads for settlements, citadels, and sanctuaries
  let maxPadWeight = 0;
  for (let i = 0; i < LEVEL_PADS.length; i++) {
    const pad = LEVEL_PADS[i];
    const d = Math.hypot(x - pad.x, z - pad.z);
    if (d < pad.r) {
      maxPadWeight = 1.0;
      break;
    } else if (d < pad.r + pad.margin) {
      const w = 1.0 - smoothstep(pad.r, pad.r + pad.margin, d);
      if (w > maxPadWeight) maxPadWeight = w;
    }
  }

  let finalHeight = lerp(rawHeight, 0.5, maxPadWeight);

  // 5. Grade the Grand Imperial Roads so roads are smooth for travel
  const roadDist = getDistToImperialRoad(x, z);
  if (roadDist < 7.0) {
    const roadWeight = 1.0 - smoothstep(3.5, 7.0, roadDist);
    finalHeight = lerp(finalHeight, 0.5, roadWeight * 0.85);
  }

  // 6. River canyon carving: trough descends down to -2.5m
  if (isRiver) {
    const riverFactor = riverDist / 24;
    const riverBed = -2.5 + riverFactor * 2.8;
    finalHeight = Math.min(finalHeight, riverBed);
  }

  // 7. Natural Island Ocean Perimeter Drop-off:
  // Smoothly slopes down into the ocean at dist > 620m, completely submerged at 730m
  const distFromCenter = Math.hypot(x, z);
  if (distFromCenter > 620) {
    const oceanDrop = smoothstep(620, 730, distFromCenter);
    finalHeight = lerp(finalHeight, -5.5, oceanDrop);
  }

  return finalHeight;
}
