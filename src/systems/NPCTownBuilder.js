import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';

/**
 * NPCTownBuilder — NPC-driven settlement expansion system.
 *
 * Each race's NPCs autonomously plan and construct new buildings over time:
 *  • Humans  → Thatched cottages, market stalls, watchtowers, granaries
 *  • Demons  → Basalt huts, bone spires, sacrificial pits, war camps
 *  • Elves   → Living tree pavilions, starlight shrines, canopy platforms
 *  • Dwarves → Stone barracks, forge extensions, gear towers, rail depots
 *
 * Buildings appear through a staged construction animation:
 *  1. Foundation (stone/obsidian slab appears)
 *  2. Scaffolding (wooden frame rises)
 *  3. Walls (race-themed walls grow upward)
 *  4. Roof / Crown (capstone placed, building complete)
 *
 * Construction is triggered on a timer per settlement zone.
 * Each zone has a max building capacity to keep performance in check.
 */

// Building templates per race
const BUILDING_TEMPLATES = {
  human: [
    { name: 'Thatched Cottage', type: 'cottage', w: 10, d: 8, h: 3.8, maxPerZone: 3 },
    { name: 'Market Stall', type: 'stall', w: 5, d: 4, h: 2.8, maxPerZone: 2 },
    { name: 'Watchtower', type: 'tower', w: 4, d: 4, h: 7, maxPerZone: 1 },
    { name: 'Storage Barn', type: 'barn', w: 12, d: 9, h: 4.5, maxPerZone: 1 }
  ],
  demon: [
    { name: 'Basalt War Hut', type: 'hut', w: 0, d: 0, h: 3.5, radius: 3.2, maxPerZone: 3 },
    { name: 'Bone Spire Obelisk', type: 'obelisk', w: 0, d: 0, h: 6, radius: 1.2, maxPerZone: 2 },
    { name: 'Sacrificial Fire Pit', type: 'pit', w: 0, d: 0, h: 1.5, radius: 2.5, maxPerZone: 1 },
    { name: 'War Camp Tent', type: 'tent', w: 8, d: 6, h: 3, maxPerZone: 2 }
  ],
  elf: [
    { name: 'Living Tree Bower', type: 'bower', w: 9, d: 8, h: 4, maxPerZone: 3 },
    { name: 'Starlight Shrine', type: 'shrine', w: 0, d: 0, h: 4.5, radius: 2.8, maxPerZone: 2 },
    { name: 'Canopy Platform', type: 'platform', w: 7, d: 7, h: 5.5, maxPerZone: 2 },
    { name: 'Moonwell Font', type: 'moonwell', w: 0, d: 0, h: 1.8, radius: 2.2, maxPerZone: 1 }
  ],
  dwarf: [
    { name: 'Stone Barracks', type: 'barracks', w: 12, d: 9, h: 4.2, maxPerZone: 2 },
    { name: 'Forge Extension', type: 'forge', w: 8, d: 7, h: 3.8, maxPerZone: 2 },
    { name: 'Gear Tower', type: 'gear_tower', w: 5, d: 5, h: 8, maxPerZone: 1 },
    { name: 'Rail Depot Shed', type: 'depot', w: 10, d: 6, h: 3.5, maxPerZone: 1 }
  ]
};

// Settlement expansion zones: where each race can build new structures
const SETTLEMENT_ZONES = [
  {
    id: 'human_oakhaven_expansion',
    race: 'human',
    label: 'Oakhaven Expansion',
    center: { x: 145, z: 30 },
    radius: 35,
    maxBuildings: 5,
    buildInterval: 45  // seconds between each new construction
  },
  {
    id: 'demon_kragmar_expansion',
    race: 'demon',
    label: "Krag'mar Expansion",
    center: { x: -150, z: -65 },
    radius: 30,
    maxBuildings: 5,
    buildInterval: 50
  },
  {
    id: 'elf_sylvaheim_expansion',
    race: 'elf',
    label: 'Sylvaheim Expansion',
    center: { x: -130, z: 115 },
    radius: 30,
    maxBuildings: 5,
    buildInterval: 55
  },
  {
    id: 'dwarf_karakvorn_expansion',
    race: 'dwarf',
    label: 'Karak-Vorn Expansion',
    center: { x: 140, z: 165 },
    radius: 30,
    maxBuildings: 5,
    buildInterval: 48
  }
];

// Construction phases
const PHASE = { FOUNDATION: 0, SCAFFOLDING: 1, WALLS: 2, ROOF: 3, COMPLETE: 4 };
const PHASE_DURATION = 5.0; // seconds per construction phase

export class NPCTownBuilder {
  constructor(scene, dayNightCycle) {
    this.scene = scene;
    this.dayNightCycle = dayNightCycle;
    this.colliders = [];
    this.animatedObjects = [];
    this.worldColliders = []; // Reference to all world colliders for overlap checking

    // Shared race materials
    this.mats = {
      // Human
      humanStone: new THREE.MeshLambertMaterial({ color: 0x57534e, flatShading: true }),
      humanWood: new THREE.MeshLambertMaterial({ color: 0x5c3a21, flatShading: true }),
      humanWoodDark: new THREE.MeshLambertMaterial({ color: 0x3d2314, flatShading: true }),
      humanThatch: new THREE.MeshLambertMaterial({ color: 0xca8a04, flatShading: true }),
      humanPlaster: new THREE.MeshLambertMaterial({ color: 0xfef3c7, flatShading: true }),
      humanCloth: new THREE.MeshLambertMaterial({ color: 0xd6d3d1, flatShading: true }),
      // Demon
      demonObsidian: new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true }),
      demonBasalt: new THREE.MeshLambertMaterial({ color: 0x27272a, flatShading: true }),
      demonLava: new THREE.MeshLambertMaterial({ color: 0xef4444, emissive: 0x7f1d1d, flatShading: true }),
      demonBone: new THREE.MeshLambertMaterial({ color: 0xf3f4f6, flatShading: true }),
      demonPurple: new THREE.MeshLambertMaterial({ color: 0x581c87, emissive: 0x3b0764, flatShading: true }),
      // Elf
      elfMarble: new THREE.MeshLambertMaterial({ color: 0xf8fafc, flatShading: true }),
      elfJade: new THREE.MeshLambertMaterial({ color: 0x0f766e, flatShading: true }),
      elfLeaf: new THREE.MeshLambertMaterial({ color: 0x166534, flatShading: true }),
      elfWood: new THREE.MeshLambertMaterial({ color: 0x5c3a21, flatShading: true }),
      elfMana: new THREE.MeshLambertMaterial({ color: 0x06b6d4, emissive: 0x0284c7, flatShading: true }),
      elfGold: new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true }),
      // Dwarf
      dwarfStone: new THREE.MeshLambertMaterial({ color: 0x44403c, flatShading: true }),
      dwarfIron: new THREE.MeshLambertMaterial({ color: 0x3f3f46, flatShading: true }),
      dwarfBronze: new THREE.MeshLambertMaterial({ color: 0xb45309, flatShading: true }),
      dwarfWood: new THREE.MeshLambertMaterial({ color: 0x3d2314, flatShading: true }),
      dwarfGold: new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true }),
      // Shared
      scaffold: new THREE.MeshLambertMaterial({ color: 0x8B7355, flatShading: true, transparent: true, opacity: 0.7 }),
      foundation: new THREE.MeshLambertMaterial({ color: 0x78716c, flatShading: true })
    };

    // Zone state tracking
    this.zones = SETTLEMENT_ZONES.map(z => ({
      ...z,
      buildings: [],        // Array of built/building structures
      timeSinceLastBuild: Math.random() * z.buildInterval * 0.5, // Stagger initial builds
      typeCounts: {}        // Track how many of each type built
    }));

    // Active construction animations
    this.activeConstructions = [];

    // NPC builder worker references (visual workers at construction sites)
    this.builderWorkers = [];
  }

  /**
   * Main update loop — called every frame from main.js
   */
  update(delta) {
    // 1. Advance construction timers for each zone
    this.zones.forEach(zone => {
      if (zone.buildings.length >= zone.maxBuildings) return;

      zone.timeSinceLastBuild += delta;

      if (zone.timeSinceLastBuild >= zone.buildInterval) {
        zone.timeSinceLastBuild = 0;
        this.startNewConstruction(zone);
      }
    });

    // 2. Animate active constructions (phased building animation)
    this.updateConstructions(delta);

    // 3. Animate completed building effects (fires, rotating gears, floating orbs)
    this.updateAnimations(delta);
  }

  /**
   * Plan and start a new building in a zone
   */
  startNewConstruction(zone) {
    const templates = BUILDING_TEMPLATES[zone.race];
    if (!templates || templates.length === 0) return;

    // Pick a random valid template (not exceeding max per type)
    const validTemplates = templates.filter(t => {
      const count = zone.typeCounts[t.type] || 0;
      return count < t.maxPerZone;
    });

    if (validTemplates.length === 0) return;

    const template = validTemplates[Math.floor(Math.random() * validTemplates.length)];

    // Find a valid placement position (no overlap with existing buildings)
    const pos = this.findBuildPosition(zone, template);
    if (!pos) return;

    // Track type count
    zone.typeCounts[template.type] = (zone.typeCounts[template.type] || 0) + 1;

    // Create construction site
    const construction = {
      zone: zone,
      template: template,
      race: zone.race,
      x: pos.x,
      z: pos.z,
      y: getTerrainHeight(pos.x, pos.z),
      phase: PHASE.FOUNDATION,
      phaseTimer: 0,
      group: new THREE.Group(),
      meshes: {},   // Phase meshes
      completed: false
    };

    construction.group.position.set(pos.x, construction.y, pos.z);
    this.scene.add(construction.group);

    // Build foundation immediately
    this.buildPhase(construction, PHASE.FOUNDATION);

    // Spawn NPC builder worker at site
    this.spawnBuilderWorker(construction);

    this.activeConstructions.push(construction);
    zone.buildings.push(construction);
  }

  /**
   * Find a valid build position within a zone that doesn't overlap anything
   */
  findBuildPosition(zone, template) {
    const maxAttempts = 20;
    const buildRadius = template.radius || Math.max(template.w, template.d) * 0.6;

    for (let i = 0; i < maxAttempts; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 8 + Math.random() * (zone.radius - 10);
      const x = zone.center.x + Math.cos(angle) * dist;
      const z = zone.center.z + Math.sin(angle) * dist;

      // Check no overlap with existing buildings in this zone
      let overlap = false;
      for (const b of zone.buildings) {
        const dx = x - b.x;
        const dz = z - b.z;
        const minDist = buildRadius + (b.template.radius || Math.max(b.template.w, b.template.d) * 0.6) + 4;
        if (dx * dx + dz * dz < minDist * minDist) {
          overlap = true;
          break;
        }
      }

      // Check no overlap with existing colliders (both own and world)
      if (!overlap) {
        const testR = buildRadius + 2;
        const allColliders = [...this.colliders, ...this.worldColliders];
        for (const c of allColliders) {
          if (c.type === 'cylinder') {
            const dx = x - c.x;
            const dz = z - c.z;
            if (Math.sqrt(dx * dx + dz * dz) < testR + c.radius) {
              overlap = true;
              break;
            }
          } else if (c.type === 'box') {
            const closestX = Math.max(c.minX, Math.min(x, c.maxX));
            const closestZ = Math.max(c.minZ, Math.min(z, c.maxZ));
            const dx = x - closestX;
            const dz = z - closestZ;
            if (Math.sqrt(dx * dx + dz * dz) < testR) {
              overlap = true;
              break;
            }
          }
        }
      }

      if (!overlap) {
        return { x, z };
      }
    }

    return null; // No valid position found
  }

  /**
   * Update all active constructions (phase progression)
   */
  updateConstructions(delta) {
    for (let i = this.activeConstructions.length - 1; i >= 0; i--) {
      const c = this.activeConstructions[i];
      if (c.completed) continue;

      c.phaseTimer += delta;

      if (c.phaseTimer >= PHASE_DURATION) {
        c.phaseTimer = 0;

        // Finalize current phase mesh scale to 1 before advancing
        const currentMeshKey = `phase_${c.phase}`;
        const currentMesh = c.meshes[currentMeshKey];
        if (currentMesh) {
          currentMesh.scale.y = 1;
        }

        c.phase++;

        if (c.phase > PHASE.COMPLETE) {
          c.phase = PHASE.COMPLETE;
        }

        if (c.phase <= PHASE.COMPLETE) {
          this.buildPhase(c, c.phase);
        }

        if (c.phase === PHASE.COMPLETE) {
          c.completed = true;
          this.onConstructionComplete(c);
          this.activeConstructions.splice(i, 1);
        }
      } else if (c.phase < PHASE.COMPLETE) {
        // Animate current phase: gradual scale-up
        const progress = c.phaseTimer / PHASE_DURATION;
        this.animatePhase(c, c.phase, progress);
      }
    }
  }

  /**
   * Build a specific construction phase
   */
  buildPhase(construction, phase) {
    const { race, template, group } = construction;

    switch (phase) {
      case PHASE.FOUNDATION:
        this.buildFoundation(construction);
        break;
      case PHASE.SCAFFOLDING:
        this.buildScaffolding(construction);
        break;
      case PHASE.WALLS:
        this.buildWalls(construction);
        break;
      case PHASE.ROOF:
        this.buildRoof(construction);
        break;
      case PHASE.COMPLETE:
        this.finishBuilding(construction);
        break;
    }
  }

  /**
   * Animate a phase as it progresses (0 → 1)
   */
  animatePhase(construction, phase, progress) {
    const meshKey = `phase_${phase}`;
    const mesh = construction.meshes[meshKey];
    if (!mesh) return;

    // Smooth scale-up from ground
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    mesh.scale.y = eased;
  }

  // ===============================================
  //  FOUNDATION
  // ===============================================
  buildFoundation(c) {
    const { template, race } = c;
    const foundGroup = new THREE.Group();

    let foundMat = this.mats.foundation;
    if (race === 'demon') foundMat = this.mats.demonObsidian;
    else if (race === 'elf') foundMat = this.mats.elfMarble;
    else if (race === 'dwarf') foundMat = this.mats.dwarfStone;

    if (template.radius) {
      // Circular foundation
      const found = new THREE.Mesh(
        new THREE.CylinderGeometry(template.radius + 0.5, template.radius + 0.8, 0.6, 8),
        foundMat
      );
      found.position.y = 0.3;
      found.receiveShadow = true;
      foundGroup.add(found);
    } else {
      // Rectangular foundation
      const found = new THREE.Mesh(
        new THREE.BoxGeometry(template.w + 1, 0.6, template.d + 1),
        foundMat
      );
      found.position.y = 0.3;
      found.receiveShadow = true;
      foundGroup.add(found);
    }

    foundGroup.scale.y = 0;
    c.group.add(foundGroup);
    c.meshes['phase_0'] = foundGroup;
  }

  // ===============================================
  //  SCAFFOLDING
  // ===============================================
  buildScaffolding(c) {
    const { template } = c;
    const scaffGroup = new THREE.Group();

    // Remove scaffold later; build wooden frame posts
    const scaffH = template.h * 0.8;
    const halfW = (template.w || template.radius * 2) / 2;
    const halfD = (template.d || template.radius * 2) / 2;

    // 4 corner scaffold posts
    const postPositions = [
      [-halfW, halfD], [halfW, halfD],
      [-halfW, -halfD], [halfW, -halfD]
    ];

    postPositions.forEach(([px, pz]) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, scaffH, 4),
        this.mats.scaffold
      );
      post.position.set(px, scaffH / 2 + 0.6, pz);
      post.castShadow = true;
      scaffGroup.add(post);
    });

    // Cross braces
    const braceH = scaffH * 0.6;
    const brace1 = new THREE.Mesh(
      new THREE.BoxGeometry(halfW * 2, 0.06, 0.06),
      this.mats.scaffold
    );
    brace1.position.set(0, braceH + 0.6, halfD);
    scaffGroup.add(brace1);

    const brace2 = new THREE.Mesh(
      new THREE.BoxGeometry(halfW * 2, 0.06, 0.06),
      this.mats.scaffold
    );
    brace2.position.set(0, braceH + 0.6, -halfD);
    scaffGroup.add(brace2);

    scaffGroup.scale.y = 0;
    c.group.add(scaffGroup);
    c.meshes['phase_1'] = scaffGroup;
  }

  // ===============================================
  //  WALLS — Race-themed
  // ===============================================
  buildWalls(c) {
    const { template, race } = c;
    const wallGroup = new THREE.Group();

    switch (race) {
      case 'human': this.buildHumanWalls(wallGroup, template); break;
      case 'demon': this.buildDemonWalls(wallGroup, template); break;
      case 'elf': this.buildElfWalls(wallGroup, template); break;
      case 'dwarf': this.buildDwarfWalls(wallGroup, template); break;
    }

    // Remove scaffolding once walls are up
    const scaff = c.meshes['phase_1'];
    if (scaff) {
      c.group.remove(scaff);
      scaff.traverse(child => {
        if (child.geometry) child.geometry.dispose();
      });
    }

    wallGroup.scale.y = 0;
    c.group.add(wallGroup);
    c.meshes['phase_2'] = wallGroup;
  }

  buildHumanWalls(parent, t) {
    if (t.type === 'tower') {
      // Stone watchtower body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, t.h, 8), this.mats.humanStone);
      body.position.y = t.h / 2 + 0.6;
      body.castShadow = true;
      parent.add(body);

      // Crenellated top ring
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.0, 0.8, 8), this.mats.humanStone);
      ring.position.y = t.h + 0.6;
      ring.castShadow = true;
      parent.add(ring);
    } else if (t.type === 'stall') {
      // Open-air market stall: 4 posts and a counter
      [-t.w / 2 + 0.3, t.w / 2 - 0.3].forEach(px => {
        [-t.d / 2 + 0.3, t.d / 2 - 0.3].forEach(pz => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, t.h, 0.24), this.mats.humanWood);
          post.position.set(px, t.h / 2 + 0.6, pz);
          post.castShadow = true;
          parent.add(post);
        });
      });

      // Counter/shelf
      const counter = new THREE.Mesh(new THREE.BoxGeometry(t.w - 0.5, 0.2, t.d - 0.5), this.mats.humanWood);
      counter.position.set(0, 1.6, 0);
      parent.add(counter);

      // Display crates
      [-0.8, 0.8].forEach(cx => {
        const crate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.6), this.mats.humanWoodDark);
        crate.position.set(cx, 1.9, 0);
        parent.add(crate);
      });
    } else {
      // Cottage or barn — box walls with open doorway
      const { w, d, h } = t;
      const doorW = t.type === 'barn' ? 4.0 : 2.8;
      const wallMat = t.type === 'barn' ? this.mats.humanWood : this.mats.humanPlaster;

      // Back wall
      const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.35), wallMat);
      back.position.set(0, h / 2 + 0.6, -d / 2);
      back.castShadow = true;
      parent.add(back);

      // Side walls
      [-1, 1].forEach(side => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(0.35, h, d), wallMat);
        wall.position.set(side * w / 2, h / 2 + 0.6, 0);
        wall.castShadow = true;
        parent.add(wall);
      });

      // Front wall with doorway
      const sideW = (w - doorW) / 2;
      [-1, 1].forEach(side => {
        const frontPiece = new THREE.Mesh(new THREE.BoxGeometry(sideW, h, 0.35), wallMat);
        frontPiece.position.set(side * (doorW / 2 + sideW / 2), h / 2 + 0.6, d / 2);
        parent.add(frontPiece);
      });

      // Interior table
      const table = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 1.4), this.mats.humanWood);
      table.position.set(0, 0.9, -d / 4);
      parent.add(table);
    }
  }

  buildDemonWalls(parent, t) {
    if (t.type === 'hut') {
      // Conical basalt hut body
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(t.radius * 0.65, t.radius, t.h, 7),
        this.mats.demonBasalt
      );
      body.position.y = t.h / 2 + 0.6;
      body.castShadow = true;
      parent.add(body);

      // Side bone horns
      [-t.radius * 0.55, t.radius * 0.55].forEach(hx => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.4, 4), this.mats.demonBone);
        horn.position.set(hx, t.h + 0.2, 0);
        horn.rotation.z = (hx < 0 ? 0.5 : -0.5);
        parent.add(horn);
      });

      // Glowing slit window
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.15), this.mats.demonLava);
      win.position.set(0, t.h * 0.5 + 0.6, t.radius * 0.85);
      parent.add(win);
    } else if (t.type === 'obelisk') {
      // Tall bone spire
      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(t.radius, t.h, 5),
        this.mats.demonBone
      );
      spire.position.y = t.h / 2 + 0.6;
      spire.castShadow = true;
      parent.add(spire);

      // Floating nether crystal at tip
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), this.mats.demonPurple);
      crystal.position.y = t.h + 1.4;
      parent.add(crystal);
    } else if (t.type === 'pit') {
      // Sacrificial fire pit: stone ring + embers
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(t.radius, 0.35, 5, 8),
        this.mats.demonBasalt
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.8;
      parent.add(ring);

      const embers = new THREE.Mesh(
        new THREE.ConeGeometry(t.radius * 0.7, 0.6, 6),
        this.mats.demonLava
      );
      embers.position.y = 0.9;
      parent.add(embers);
    } else if (t.type === 'tent') {
      // War camp tent: dark leather over posts
      const tent = new THREE.Mesh(
        new THREE.ConeGeometry(Math.max(t.w, t.d) * 0.55, t.h, 6),
        this.mats.demonObsidian
      );
      tent.position.y = t.h / 2 + 0.6;
      tent.castShadow = true;
      parent.add(tent);

      // Weapon rack
      const rack = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 1.2), this.mats.demonBasalt);
      rack.position.set(t.w / 2 + 0.5, 0.9 + 0.6, 0);
      parent.add(rack);
    }
  }

  buildElfWalls(parent, t) {
    if (t.type === 'bower') {
      // Living tree bower: organic trunk columns with canopy
      const trunkPositions = [
        [-t.w / 2 + 1, -t.d / 2 + 1], [t.w / 2 - 1, -t.d / 2 + 1],
        [-t.w / 2 + 1, t.d / 2 - 1], [t.w / 2 - 1, t.d / 2 - 1]
      ];

      trunkPositions.forEach(([px, pz]) => {
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.45, t.h, 5),
          this.mats.elfWood
        );
        trunk.position.set(px, t.h / 2 + 0.6, pz);
        trunk.castShadow = true;
        parent.add(trunk);

        // Vine ring
        const vine = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.06, 4, 6), this.mats.elfJade);
        vine.rotation.x = Math.PI / 2;
        vine.position.set(px, 1.8, pz);
        parent.add(vine);
      });

      // Open canopy leaf ceiling
      const canopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(Math.max(t.w, t.d) * 0.45, 0),
        this.mats.elfLeaf
      );
      canopy.position.y = t.h + 1.5;
      canopy.castShadow = true;
      parent.add(canopy);
    } else if (t.type === 'shrine') {
      // Marble pedestal with starlight orb
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(t.radius * 0.5, t.radius * 0.7, 2.5, 6),
        this.mats.elfMarble
      );
      pedestal.position.y = 1.85;
      pedestal.castShadow = true;
      parent.add(pedestal);

      // Decorative ring around base
      const baseRing = new THREE.Mesh(
        new THREE.TorusGeometry(t.radius, 0.15, 4, 8),
        this.mats.elfMarble
      );
      baseRing.rotation.x = Math.PI / 2;
      baseRing.position.y = 0.7;
      parent.add(baseRing);
    } else if (t.type === 'platform') {
      // Elevated canopy platform on tree trunk
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.9, t.h, 6),
        this.mats.elfWood
      );
      trunk.position.y = t.h / 2 + 0.6;
      trunk.castShadow = true;
      parent.add(trunk);

      // Flat platform
      const platform = new THREE.Mesh(
        new THREE.CylinderGeometry(t.w / 2, t.w / 2, 0.4, 8),
        this.mats.elfWood
      );
      platform.position.y = t.h + 0.6;
      platform.castShadow = true;
      parent.add(platform);

      // Railing
      const railing = new THREE.Mesh(
        new THREE.TorusGeometry(t.w / 2 - 0.1, 0.06, 4, 8),
        this.mats.elfJade
      );
      railing.rotation.x = Math.PI / 2;
      railing.position.y = t.h + 1.2;
      parent.add(railing);
    } else if (t.type === 'moonwell') {
      // Marble pool basin
      const basin = new THREE.Mesh(
        new THREE.CylinderGeometry(t.radius, t.radius + 0.3, 0.6, 8),
        this.mats.elfMarble
      );
      basin.position.y = 0.9;
      basin.receiveShadow = true;
      parent.add(basin);

      // Luminous water
      const water = new THREE.Mesh(
        new THREE.CylinderGeometry(t.radius - 0.2, t.radius - 0.2, 0.1, 8),
        this.mats.elfMana
      );
      water.position.y = 1.1;
      parent.add(water);
    }
  }

  buildDwarfWalls(parent, t) {
    if (t.type === 'gear_tower') {
      // Stone cylindrical tower with gear motif
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.6, t.h, 8),
        this.mats.dwarfStone
      );
      body.position.y = t.h / 2 + 0.6;
      body.castShadow = true;
      parent.add(body);

      // Large decorative rotating gear on side
      const gear = new THREE.Mesh(
        new THREE.TorusGeometry(1.8, 0.2, 4, 12),
        this.mats.dwarfIron
      );
      gear.position.set(2.8, t.h * 0.6 + 0.6, 0);
      gear.castShadow = true;
      parent.add(gear);
      this.animatedObjects.push({ type: 'gear', mesh: gear });
    } else {
      // Barracks, forge, depot — box structure
      const { w, d, h } = t;
      const doorW = 3.2;

      // Back wall
      const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), this.mats.dwarfStone);
      back.position.set(0, h / 2 + 0.6, -d / 2);
      back.castShadow = true;
      parent.add(back);

      // Side walls
      [-1, 1].forEach(side => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, d), this.mats.dwarfStone);
        wall.position.set(side * w / 2, h / 2 + 0.6, 0);
        wall.castShadow = true;
        parent.add(wall);
      });

      // Front with doorway
      const sideW = (w - doorW) / 2;
      [-1, 1].forEach(side => {
        const frontPiece = new THREE.Mesh(new THREE.BoxGeometry(sideW, h, 0.4), this.mats.dwarfStone);
        frontPiece.position.set(side * (doorW / 2 + sideW / 2), h / 2 + 0.6, d / 2);
        parent.add(frontPiece);
      });

      // Type-specific interiors
      if (t.type === 'forge') {
        // Anvil
        const anvil = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.6), this.mats.dwarfIron);
        anvil.position.set(0, 0.95, -d / 4);
        parent.add(anvil);

        // Glowing coals
        const coals = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.15, 0.8), this.mats.demonLava);
        coals.position.set(-w / 4, 1.0, -d / 4);
        parent.add(coals);
      } else if (t.type === 'depot') {
        // Rail tracks
        [-0.4, 0.4].forEach(rx => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, d - 1), this.mats.dwarfIron);
          rail.position.set(rx, 0.7, 0);
          parent.add(rail);
        });

        // Minecart
        const cart = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 1.8), this.mats.dwarfIron);
        cart.position.set(0, 1.0, 0);
        parent.add(cart);
      }
    }
  }

  // ===============================================
  //  ROOF — Race-themed
  // ===============================================
  buildRoof(c) {
    const { template, race } = c;
    const roofGroup = new THREE.Group();

    if (template.type === 'stall' || template.type === 'pit' || template.type === 'moonwell') {
      // Open-air structures: add canvas canopy or skip
      if (template.type === 'stall') {
        const canopy = new THREE.Mesh(
          new THREE.BoxGeometry(template.w + 0.5, 0.15, template.d + 0.5),
          this.mats.humanCloth
        );
        canopy.position.y = template.h + 0.8;
        canopy.castShadow = true;
        roofGroup.add(canopy);
      }
    } else if (template.radius && (template.type === 'hut' || template.type === 'obelisk' || template.type === 'shrine')) {
      // Cone / pyramid cap
      let roofMat = this.mats.humanThatch;
      if (race === 'demon') roofMat = this.mats.demonObsidian;
      else if (race === 'elf') roofMat = this.mats.elfJade;

      if (template.type !== 'obelisk') {
        const cap = new THREE.Mesh(
          new THREE.ConeGeometry(template.radius * 0.85, 2.2, 7),
          roofMat
        );
        cap.position.y = template.h + 1.7;
        cap.castShadow = true;
        roofGroup.add(cap);
      }
    } else if (template.type === 'platform') {
      // Canopy leaves above platform
      const leafCanopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(template.w / 2 + 0.5, 0),
        this.mats.elfLeaf
      );
      leafCanopy.position.y = template.h + 2.5;
      leafCanopy.castShadow = true;
      roofGroup.add(leafCanopy);
    } else if (template.type === 'gear_tower') {
      // Dwarven crenellated stone cap
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(2.6, 2.3, 1.2, 8),
        this.mats.dwarfStone
      );
      cap.position.y = template.h + 1.0;
      cap.castShadow = true;
      roofGroup.add(cap);

      // Iron spike on top
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 1.5, 4),
        this.mats.dwarfIron
      );
      spike.position.y = template.h + 2.2;
      roofGroup.add(spike);
    } else {
      // Standard gabled roof
      const w = template.w || 6;
      const d = template.d || 6;
      const h = template.h || 3;

      let roofMat = this.mats.humanThatch;
      if (race === 'demon') roofMat = this.mats.demonObsidian;
      else if (race === 'elf') roofMat = this.mats.elfJade;
      else if (race === 'dwarf') roofMat = this.mats.dwarfStone;

      const roofMesh = new THREE.Mesh(
        new THREE.ConeGeometry(Math.hypot(w, d) * 0.55, 3.5, 4),
        roofMat
      );
      roofMesh.rotation.y = Math.PI / 4;
      roofMesh.position.y = h + 2.3;
      roofMesh.castShadow = true;
      roofGroup.add(roofMesh);
    }

    roofGroup.scale.y = 0;
    c.group.add(roofGroup);
    c.meshes['phase_3'] = roofGroup;
  }

  // ===============================================
  //  FINISH — Add lights, colliders, remove workers
  // ===============================================
  finishBuilding(c) {
    const { template, race, x, z } = c;

    // Register collider
    if (template.radius) {
      this.colliders.push({
        type: 'cylinder',
        x: x,
        z: z,
        radius: template.radius + 0.5
      });
    } else {
      this.colliders.push({
        type: 'box',
        minX: x - template.w / 2 - 0.3,
        maxX: x + template.w / 2 + 0.3,
        minZ: z - template.d / 2 - 0.3,
        maxZ: z + template.d / 2 + 0.3
      });
    }

    // Add night light for certain building types
    if (['cottage', 'barn', 'hut', 'tent', 'bower', 'barracks', 'forge', 'depot'].includes(template.type)) {
      const lightColor = {
        human: 0xf97316,
        demon: 0xef4444,
        elf: 0x38bdf8,
        dwarf: 0xf59e0b
      }[race] || 0xf97316;

      const light = new THREE.PointLight(lightColor, 0.9, 12);
      light.position.set(0, template.h * 0.6 + 0.6, 0);
      light.userData.baseIntensity = 0.9;
      c.group.add(light);
      if (this.dayNightCycle) {
        this.dayNightCycle.registerNightLight(light);
      }
    }

    // Add floating orb for elven shrines
    if (template.type === 'shrine') {
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), this.mats.elfMana);
      orb.position.y = template.h + 0.5;
      c.group.add(orb);
      this.animatedObjects.push({ type: 'float', mesh: orb, baseY: template.h + 0.5 });

      const shrineLight = new THREE.PointLight(0x38bdf8, 1.2, 14);
      shrineLight.position.y = template.h + 0.5;
      shrineLight.userData.baseIntensity = 1.2;
      c.group.add(shrineLight);
      if (this.dayNightCycle) {
        this.dayNightCycle.registerNightLight(shrineLight);
      }
    }

    // Add floating nether crystal for demon obelisks
    if (template.type === 'obelisk') {
      const crystal = c.group.getObjectByProperty('material', this.mats.demonPurple);
      if (crystal) {
        this.animatedObjects.push({ type: 'float', mesh: crystal, baseY: crystal.position.y });
      }

      const netherLight = new THREE.PointLight(0xa855f7, 1.0, 10);
      netherLight.position.y = template.h + 1.4;
      netherLight.userData.baseIntensity = 1.0;
      c.group.add(netherLight);
      if (this.dayNightCycle) {
        this.dayNightCycle.registerNightLight(netherLight);
      }
    }

    // Add fire pit light for demon pits
    if (template.type === 'pit') {
      const pitLight = new THREE.PointLight(0xef4444, 1.3, 12);
      pitLight.position.y = 1.5;
      pitLight.userData.baseIntensity = 1.3;
      c.group.add(pitLight);
      if (this.dayNightCycle) {
        this.dayNightCycle.registerNightLight(pitLight);
      }
      this.animatedObjects.push({ type: 'fire', light: pitLight });
    }

    // Remove builder worker
    this.removeBuilderWorker(c);

    // Add a "construction complete" dust puff particle
    this.spawnCompletionParticle(c);
  }

  /**
   * Called when construction completes
   */
  onConstructionComplete(c) {
    // Notification toast could be surfaced via HUD
    // For now, we just finalize colliders & animations
  }

  // ===============================================
  //  NPC Builder Workers (tiny NPCs at construction sites)
  // ===============================================
  spawnBuilderWorker(construction) {
    const { race, x, z, y, group } = construction;

    // Create a small low-poly NPC worker near the construction site
    const worker = new THREE.Group();

    let skinColor = 0xffdbac;
    let tunicColor = 0x78350f;
    if (race === 'demon') { skinColor = 0xb91c1c; tunicColor = 0x18181b; }
    else if (race === 'elf') { skinColor = 0xffeedb; tunicColor = 0x047857; }
    else if (race === 'dwarf') { skinColor = 0xffdbac; tunicColor = 0x44403c; }

    const skinMat = new THREE.MeshLambertMaterial({ color: skinColor, flatShading: true });
    const tunicMat = new THREE.MeshLambertMaterial({ color: tunicColor, flatShading: true });
    const isDwarf = (race === 'dwarf');

    // Torso
    const tH = isDwarf ? 0.7 : 0.85;
    const torso = new THREE.Mesh(new THREE.BoxGeometry(isDwarf ? 0.8 : 0.65, tH, 0.4), tunicMat);
    torso.position.y = isDwarf ? 0.9 : 1.15;
    torso.castShadow = true;
    worker.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.38), skinMat);
    head.position.y = torso.position.y + tH / 2 + 0.28;
    head.castShadow = true;
    worker.add(head);

    // Race features
    if (race === 'demon') {
      [-0.18, 0.18].forEach(hx => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 4), this.mats.demonObsidian);
        horn.position.set(hx, 0.28, -0.04);
        horn.rotation.z = (hx < 0 ? -0.4 : 0.4);
        head.add(horn);
      });
    } else if (race === 'elf') {
      [-0.22, 0.22].forEach(ex => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 4), skinMat);
        ear.position.set(ex, 0.04, -0.04);
        ear.rotation.z = (ex < 0 ? Math.PI / 3 : -Math.PI / 3);
        head.add(ear);
      });
    } else if (isDwarf) {
      const beard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.2),
        new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true }));
      beard.position.set(0, -0.3, 0.12);
      head.add(beard);

      const helm = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.46), this.mats.dwarfIron);
      helm.position.set(0, 0.22, 0);
      head.add(helm);
    }

    // Legs
    const legH = isDwarf ? 0.35 : 0.5;
    [-0.15, 0.15].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, legH, 0.25),
        new THREE.MeshLambertMaterial({ color: 0x27272a, flatShading: true }));
      leg.position.set(lx, isDwarf ? 0.42 : 0.55, 0);
      worker.add(leg);
    });

    // Arms
    const armH = 0.6;
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.18, armH, 0.18), tunicMat);
    armR.position.set((isDwarf ? 0.5 : 0.42), torso.position.y, 0);
    worker.add(armR);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.18, armH, 0.18), tunicMat);
    armL.position.set(-(isDwarf ? 0.5 : 0.42), torso.position.y, 0);
    worker.add(armL);

    // Held tool (hammer)
    const hammerShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.9, 4),
      this.mats.humanWood || this.mats.elfWood
    );
    hammerShaft.position.set(0.5, torso.position.y + 0.1, 0.18);
    hammerShaft.rotation.x = 0.3;
    worker.add(hammerShaft);

    const hammerHead = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.2, 0.2),
      this.mats.dwarfIron
    );
    hammerHead.position.set(0.5, torso.position.y + 0.5, 0.18);
    worker.add(hammerHead);

    // Shadow blob
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.45, 6),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.03;
    worker.add(shadow);

    // Position worker near building
    const angle = Math.random() * Math.PI * 2;
    const dist = 3 + Math.random() * 2;
    worker.position.set(
      Math.cos(angle) * dist,
      0,
      Math.sin(angle) * dist
    );
    worker.rotation.y = Math.atan2(-Math.cos(angle), -Math.sin(angle)); // face building

    group.add(worker);

    this.builderWorkers.push({
      constructionId: construction,
      mesh: worker,
      armR: armR,
      torso: torso
    });
  }

  removeBuilderWorker(construction) {
    for (let i = this.builderWorkers.length - 1; i >= 0; i--) {
      if (this.builderWorkers[i].constructionId === construction) {
        const w = this.builderWorkers[i];
        construction.group.remove(w.mesh);
        // Only dispose geometry; materials are shared from this.mats or are cheap inline creates
        w.mesh.traverse(child => {
          if (child.geometry) child.geometry.dispose();
        });
        this.builderWorkers.splice(i, 1);
      }
    }
  }

  spawnCompletionParticle(c) {
    // Brief dust cloud burst — 8 small cubes that fly outward and fade
    const dustGroup = new THREE.Group();
    dustGroup.position.set(0, c.template.h * 0.5, 0);
    c.group.add(dustGroup);

    const particles = [];
    for (let p = 0; p < 8; p++) {
      const ang = (p / 8) * Math.PI * 2;
      const dust = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.3, 0.3),
        new THREE.MeshBasicMaterial({ color: 0xd6d3d1, transparent: true, opacity: 0.7 })
      );
      dust.position.set(Math.cos(ang) * 0.5, 0, Math.sin(ang) * 0.5);
      dustGroup.add(dust);
      particles.push({
        mesh: dust,
        vx: Math.cos(ang) * 3,
        vy: 1.5 + Math.random() * 2,
        vz: Math.sin(ang) * 3,
        life: 1.5
      });
    }

    this.animatedObjects.push({
      type: 'dust',
      particles: particles,
      parent: dustGroup,
      owner: c.group,
      elapsed: 0
    });
  }

  /**
   * Animate completed building effects
   */
  updateAnimations(delta) {
    const time = performance.now() * 0.002;

    for (let i = this.animatedObjects.length - 1; i >= 0; i--) {
      const obj = this.animatedObjects[i];

      if (obj.type === 'gear' && obj.mesh) {
        obj.mesh.rotation.z += delta * 0.5;
      } else if (obj.type === 'float' && obj.mesh) {
        obj.mesh.position.y = obj.baseY + Math.sin(time * 1.5) * 0.3;
        obj.mesh.rotation.y += delta * 0.8;
      } else if (obj.type === 'fire' && obj.light) {
        obj.light.intensity = (obj.light.userData.baseIntensity || 1.0) + Math.sin(time * 5) * 0.3;
      } else if (obj.type === 'dust') {
        obj.elapsed += delta;
        let allDead = true;
        obj.particles.forEach(p => {
          p.life -= delta;
          if (p.life > 0) {
            allDead = false;
            p.mesh.position.x += p.vx * delta;
            p.mesh.position.y += p.vy * delta;
            p.mesh.position.z += p.vz * delta;
            p.vy -= 4 * delta; // gravity
            p.mesh.material.opacity = Math.max(0, p.life / 1.5);
          } else {
            p.mesh.visible = false;
          }
        });
        if (allDead) {
          obj.owner.remove(obj.parent);
          obj.particles.forEach(p => {
            p.mesh.geometry.dispose();
            p.mesh.material.dispose();
          });
          this.animatedObjects.splice(i, 1);
        }
      }
    }

    // Animate builder workers (hammering motion)
    this.builderWorkers.forEach(w => {
      if (w.armR) {
        w.armR.rotation.x = -0.4 + Math.sin(time * 4.0) * 0.5;
      }
    });
  }

  /**
   * Get all new colliders (called by main.js to extend the collision list)
   */
  getNewColliders() {
    return this.colliders;
  }

  /**
   * Get build status info for HUD display
   */
  getBuildStatus() {
    return this.zones.map(z => ({
      label: z.label,
      race: z.race,
      built: z.buildings.length,
      max: z.maxBuildings,
      underConstruction: this.activeConstructions.filter(c => c.zone === z).length
    }));
  }

  /**
   * Set reference to world colliders so placement checks avoid existing structures
   */
  setWorldColliders(colliders) {
    this.worldColliders = colliders;
  }
}

