import { FAST_TRAVEL_POINTS, SANCTUARY_ZONES, RACES, BIOMES } from '../config/constants.js';

export class WorldPerceptionEngine {
  constructor(gameApp) {
    this.gameApp = gameApp;
  }

  /**
   * Generates a comprehensive sensory & environmental snapshot for any NPC or character.
   * @param {Object} npc - The NPC object (must have group.position or worldPos, and config).
   * @returns {Object} Structured sensory perception snapshot.
   */
  getSensorySnapshot(npc) {
    const pos = npc.worldPos || npc.group?.position || { x: 0, y: 0.5, z: 0 };
    const config = npc.config || {};
    const raceId = config.race || 'human';
    const raceData = RACES[raceId] || RACES.human;

    // 1. Spatial & Biome Context
    const biome = this.determineBiome(pos.x, pos.z);
    const nearestLandmark = this.findNearestLandmark(pos.x, pos.z);
    const sanctuaryZone = this.findCurrentSanctuary(pos.x, pos.z);

    // 2. Temporal & Atmospheric Context
    const dayNight = this.gameApp?.dayNightCycle;
    let timeFormatted = '12:00 PM';
    try {
      if (dayNight) {
        if (typeof dayNight.getTimeFormatted === 'function') {
          timeFormatted = dayNight.getTimeFormatted();
        } else if (typeof dayNight.getFormattedTime === 'function') {
          timeFormatted = dayNight.getFormattedTime();
        }
      }
    } catch {
      timeFormatted = '12:00 PM';
    }
    const timeVal = dayNight ? (dayNight.timeOfDay ?? dayNight.time ?? 0.5) : 0.5;
    const isNight = (timeVal < 0.22 || timeVal > 0.78);
    const solarPhase = this.getSolarPhase(timeVal);

    // 3. Proximity Radar (Scan within 32m sensory cone)
    const sensoryRadius = 32.0;
    const nearbyNPCs = this.scanNearbyNPCs(pos, npc, sensoryRadius);
    const nearbyMonsters = this.scanNearbyMonsters(pos, sensoryRadius);
    const playerDist = this.getPlayerDistance(pos, npc);

    // 4. Synthesize Human-Readable Sensory Summary for LLM Prompt
    const sensorySummary = [
      `[Location]: Position (${pos.x.toFixed(1)}, ${pos.z.toFixed(1)}) in ${biome.name}.`,
      `[Nearest Landmark]: ${nearestLandmark.name} (${nearestLandmark.dist.toFixed(0)}m away).`,
      sanctuaryZone ? `[Sanctuary Status]: Inside protected sanctuary of ${sanctuaryZone.name} (monsters barred).` : `[Sanctuary Status]: Out in the wild borders.`,
      `[Time & Environment]: ${timeFormatted} (${solarPhase}), ${isNight ? 'Dark night with torches lit' : 'Bright daylight'}.`,
      `[Divine Presence]: The Creator / Hero is ${playerDist.toFixed(1)}m away${playerDist < 10 ? ' (watching you directly!)' : '.'}`,
      nearbyNPCs.length > 0
        ? `[Nearby People]: ${nearbyNPCs.map(n => `${n.name} (${n.badge}, ${n.dist.toFixed(1)}m)`).join(', ')}.`
        : `[Nearby People]: None in immediate sight.`,
      nearbyMonsters.length > 0
        ? `[Nearby Creatures]: ${nearbyMonsters.map(m => `${m.name} Lv.${m.level} (${m.dist.toFixed(1)}m)`).join(', ')}.`
        : `[Nearby Creatures]: No beasts or monsters visible.`
    ].join('\n');

    return {
      coords: { x: Math.round(pos.x), y: Math.round(pos.y || 0.5), z: Math.round(pos.z) },
      biomeName: biome.name,
      biomeColor: biome.color,
      nearestLandmark: nearestLandmark.name,
      landmarkDist: Math.round(nearestLandmark.dist),
      sanctuaryName: sanctuaryZone ? sanctuaryZone.name : null,
      timeFormatted,
      solarPhase,
      isNight,
      playerDist: Math.round(playerDist),
      isCreatorNearby: playerDist < 12.0,
      nearbyNPCs,
      nearbyMonsters,
      raceData,
      sensorySummary
    };
  }

  determineBiome(x, z) {
    if (Math.hypot(x, z - 10) < 45) return BIOMES.CROSSROADS;
    if (x > 20 && z < 40) return BIOMES.HUMAN_KINGDOM;
    if (x <= 20 && z < 40) return BIOMES.DEMON_REALM;
    if (x <= 20 && z >= 40) return BIOMES.ELVEN_FOREST;
    return BIOMES.DWARF_INDUSTRY;
  }

  findNearestLandmark(x, z) {
    let nearest = { name: 'Crossroads Bridge', dist: 999 };
    FAST_TRAVEL_POINTS.forEach(pt => {
      const d = Math.hypot(x - pt.x, z - pt.z);
      if (d < nearest.dist) {
        nearest = { name: pt.name, dist: d };
      }
    });
    return nearest;
  }

  findCurrentSanctuary(x, z) {
    for (let i = 0; i < SANCTUARY_ZONES.length; i++) {
      const zone = SANCTUARY_ZONES[i];
      const d = Math.hypot(x - zone.x, z - zone.z);
      if (d < zone.radius) {
        return zone;
      }
    }
    return null;
  }

  getSolarPhase(t) {
    if (t >= 0.2 && t < 0.3) return 'Dawn Sunrise';
    if (t >= 0.3 && t < 0.7) return 'High Noon';
    if (t >= 0.7 && t < 0.8) return 'Sunset Twilight';
    return 'Midnight Nightfall';
  }

  getPlayerDistance(pos, self = null) {
    // If self is the active playable hero, Creator presence represents Creator Spirit Cam or Dashboard, not 0m self-distance
    if (self && (self === this.gameApp?.player || self.isPlayer || self.characterId)) {
      return 999;
    }
    const player = this.gameApp?.player;
    if (!player) return 999;
    return Math.hypot(player.position.x - pos.x, player.position.z - pos.z);
  }

  scanNearbyNPCs(pos, self, radius) {
    const detected = [];
    const collectFromList = (list) => {
      if (!list) return;
      list.forEach(other => {
        if (!other || other === self) return;
        const oPos = other.worldPos || other.group?.position;
        if (!oPos) return;
        const d = Math.hypot(oPos.x - pos.x, oPos.z - pos.z);
        if (d > 0.3 && d <= radius) {
          detected.push({
            id: other.config?.id || other.char?.id || 'npc',
            name: other.config?.name || other.char?.name || 'Citizen',
            badge: other.config?.badge || other.char?.title || 'Villager',
            race: other.config?.race || other.char?.race || 'human',
            dist: d
          });
        }
      });
    };

    // Scan across all realm citizen managers
    collectFromList(this.gameApp?.realmNPCs?.npcs);
    collectFromList(this.gameApp?.villageSettlement?.villagers);
    if (this.gameApp?.npcManager?.npcs) {
      this.gameApp.npcManager.npcs.forEach(data => {
        const cfg = data.config || data.char || {};
        if (cfg.id && cfg.id !== self.config?.id) {
          const oPos = data.group?.position;
          if (oPos) {
            const d = Math.hypot(oPos.x - pos.x, oPos.z - pos.z);
            if (d <= radius) {
              detected.push({
                id: cfg.id,
                name: cfg.name,
                badge: cfg.badge || cfg.title,
                race: cfg.race,
                dist: d
              });
            }
          }
        }
      });
    }

    return detected.sort((a, b) => a.dist - b.dist).slice(0, 5);
  }

  scanNearbyMonsters(pos, radius) {
    const monsters = this.gameApp?.monsterManager?.monsters;
    if (!monsters) return [];
    const detected = [];
    monsters.forEach(m => {
      if (m.isDead) return;
      const d = Math.hypot(m.group.position.x - pos.x, m.group.position.z - pos.z);
      if (d <= radius) {
        detected.push({
          name: m.name,
          level: m.level,
          isTamed: m.isTamed,
          dist: d
        });
      }
    });
    return detected.sort((a, b) => a.dist - b.dist).slice(0, 4);
  }
}

