import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';
import { audioSystem } from '../systems/AudioSystem.js';
import { isInSanctuaryZone } from '../config/constants.js';

export class MonsterManager {
  constructor(scene, combatSystem) {
    this.scene = scene;
    this.combatSystem = combatSystem;
    this.monsters = [];
    this.guardians = []; // Elven forest guardians who also fight & level up!
    this.tamedMonster = null; // Only ONE monster can be tamed at a time!
    this.nearbyTamableMonster = null;

    this.initMonsters();
    this.initForestGuardians();
  }

  initMonsters() {
    // Diverse Monster definitions across all 4 territories of the expanded 1600m world (82 Monsters!)
    const monsterSpawns = [
      // -------------------------------------------------------------
      // 1. ELVEN FOREST (South-West: x: -700 to -60, z: 60 to 700)
      // -------------------------------------------------------------
      { type: 'goblin', level: 1, maxHp: 45, attack: 10, xp: 40, x: -230, z: 80, name: 'Forest Goblin' },
      { type: 'goblin', level: 1, maxHp: 45, attack: 10, xp: 40, x: -270, z: 160, name: 'Forest Goblin' },
      { type: 'goblin', level: 1, maxHp: 45, attack: 10, xp: 40, x: -130, z: 220, name: 'Goblin Scout' },
      { type: 'goblin', level: 2, maxHp: 65, attack: 14, xp: 60, x: -250, z: 270, name: 'Goblin Berserker' },
      { type: 'goblin', level: 2, maxHp: 65, attack: 14, xp: 60, x: -170, z: 310, name: 'Goblin Berserker' },
      { type: 'goblin', level: 3, maxHp: 85, attack: 18, xp: 80, x: -320, z: 350, name: 'Goblin Warlord' },
      { type: 'goblin', level: 4, maxHp: 110, attack: 24, xp: 115, x: -460, z: 420, name: 'Deepwood Goblin Chieftain' },

      { type: 'wolf', level: 2, maxHp: 75, attack: 16, xp: 70, x: -280, z: 180, name: 'Dire Forest Wolf' },
      { type: 'wolf', level: 2, maxHp: 75, attack: 16, xp: 70, x: -170, z: 290, name: 'Prowling Shadow Wolf' },
      { type: 'wolf', level: 3, maxHp: 95, attack: 22, xp: 95, x: -240, z: 230, name: 'Alpha Dire Wolf' },
      { type: 'wolf', level: 2, maxHp: 75, attack: 16, xp: 70, x: -120, z: 270, name: 'Dire Forest Wolf' },
      { type: 'wolf', level: 3, maxHp: 100, attack: 24, xp: 105, x: -340, z: 220, name: 'Moonfang Shadow Wolf' },
      { type: 'wolf', level: 4, maxHp: 135, attack: 30, xp: 145, x: -490, z: 310, name: 'Nightstalker Alpha Wolf' },

      { type: 'treant', level: 3, maxHp: 130, attack: 25, xp: 120, x: -160, z: 250, name: 'Corrupted Treant' },
      { type: 'treant', level: 3, maxHp: 130, attack: 25, xp: 120, x: -270, z: 120, name: 'Ancient Moss Golem' },
      { type: 'treant', level: 4, maxHp: 180, attack: 32, xp: 160, x: -220, z: 320, name: 'Elder Wood Behemoth' },
      { type: 'treant', level: 5, maxHp: 240, attack: 40, xp: 220, x: -360, z: 280, name: 'Primeval Root Colossus' },
      { type: 'treant', level: 6, maxHp: 310, attack: 50, xp: 300, x: -520, z: 450, name: 'Ancient Canopy Titan' },

      { type: 'spider', level: 2, maxHp: 70, attack: 16, xp: 65, x: -290, z: 250, name: 'Forest Brood Spider' },
      { type: 'spider', level: 3, maxHp: 95, attack: 22, xp: 90, x: -310, z: 160, name: 'Venom Weaver Arachnid' },
      { type: 'spider', level: 3, maxHp: 95, attack: 22, xp: 90, x: -280, z: 340, name: 'Shadow Silk Stalker' },
      { type: 'spider', level: 5, maxHp: 220, attack: 42, xp: 230, x: -440, z: 380, name: 'Colossal Broodmother' },

      { type: 'boar', level: 2, maxHp: 75, attack: 16, xp: 70, x: -110, z: 230, name: 'Woodland Thorn Boar' },
      { type: 'bear', level: 3, maxHp: 130, attack: 26, xp: 125, x: -380, z: 190, name: 'Great Sylvaheim Grizzly' },

      { type: 'drake', level: 4, maxHp: 160, attack: 34, xp: 180, x: -290, z: 380, name: 'Celestial Starlight Drake' },
      { type: 'drake', level: 5, maxHp: 220, attack: 42, xp: 240, x: -390, z: 330, name: 'Moonfire Dragonling' },
      { type: 'wyvern', level: 6, maxHp: 290, attack: 52, xp: 320, x: -580, z: 520, name: 'Luminous Canopy Wyvern' },

      // -------------------------------------------------------------
      // 2. DEMON DARK TERRITORY (North-West: x: -700 to -40, z: -700 to 20)
      // -------------------------------------------------------------
      { type: 'imp', level: 2, maxHp: 60, attack: 15, xp: 65, x: -290, z: -140, name: 'Brimstone Nether Imp' },
      { type: 'imp', level: 2, maxHp: 60, attack: 15, xp: 65, x: -250, z: -140, name: 'Shadow Spit Imp' },
      { type: 'imp', level: 3, maxHp: 80, attack: 20, xp: 85, x: -310, z: -210, name: 'Demon Pyromancer Imp' },
      { type: 'imp', level: 3, maxHp: 80, attack: 20, xp: 85, x: -140, z: -230, name: 'Void Imp Raider' },
      { type: 'imp', level: 4, maxHp: 110, attack: 26, xp: 120, x: -430, z: -280, name: 'Infernal Tormenter Imp' },

      { type: 'wolf', level: 3, maxHp: 110, attack: 26, xp: 110, x: -290, z: -180, name: 'Magma Hellhound' },
      { type: 'wolf', level: 3, maxHp: 110, attack: 26, xp: 110, x: -210, z: -330, name: 'Obsidian Flame Hound' },
      { type: 'wolf', level: 4, maxHp: 140, attack: 32, xp: 150, x: -350, z: -260, name: 'Cerberus Hellhound' },
      { type: 'wolf', level: 5, maxHp: 200, attack: 40, xp: 210, x: -480, z: -320, name: 'Abyssal Bloodhound' },

      { type: 'skeleton', level: 2, maxHp: 75, attack: 18, xp: 75, x: -190, z: -120, name: 'Cursed Skeleton Warrior' },
      { type: 'skeleton', level: 3, maxHp: 95, attack: 23, xp: 95, x: -270, z: -180, name: 'Nether Bone Cleaver' },
      { type: 'skeleton', level: 4, maxHp: 135, attack: 30, xp: 145, x: -380, z: -220, name: 'Dread Bone Knight' },
      { type: 'skeleton', level: 4, maxHp: 140, attack: 32, xp: 150, x: -460, z: -150, name: 'Cursed Crypt Marauder' },
      { type: 'skeleton', level: 5, maxHp: 210, attack: 44, xp: 230, x: -550, z: -380, name: 'Skull Throne Champion' },

      { type: 'golem', level: 4, maxHp: 200, attack: 36, xp: 180, x: -190, z: -320, name: 'Obsidian Volcanic Golem' },
      { type: 'golem', level: 5, maxHp: 260, attack: 45, xp: 240, x: -270, z: -330, name: 'Nether Magma Colossus' },
      { type: 'golem', level: 6, maxHp: 330, attack: 54, xp: 320, x: -420, z: -420, name: 'Brimstone Titan' },

      { type: 'spider', level: 3, maxHp: 90, attack: 22, xp: 90, x: -330, z: -130, name: 'Magma Brood Spider' },
      { type: 'spider', level: 3, maxHp: 90, attack: 22, xp: 90, x: -230, z: -360, name: 'Nether Web Crawler' },

      { type: 'drake', level: 5, maxHp: 230, attack: 45, xp: 260, x: -360, z: -160, name: 'Dread Nether Wyrm' },
      { type: 'wyvern', level: 6, maxHp: 290, attack: 52, xp: 320, x: -520, z: -260, name: 'Abyssal Flame Wyvern' },
      { type: 'wyvern', level: 7, maxHp: 380, attack: 65, xp: 420, x: -620, z: -450, name: 'Sovereign Void Wyvern' },

      // -------------------------------------------------------------
      // 3. DWARVEN MOUNTAINS & CRAGS (South-East: x: 60 to 700, z: 60 to 700)
      // -------------------------------------------------------------
      { type: 'boar', level: 2, maxHp: 75, attack: 16, xp: 70, x: 190, z: 80, name: 'Mountain Tusk Boar' },
      { type: 'boar', level: 2, maxHp: 75, attack: 16, xp: 70, x: 260, z: 160, name: 'Granite Razorback' },
      { type: 'boar', level: 3, maxHp: 100, attack: 22, xp: 95, x: 310, z: 220, name: 'Armored Iron Boar' },

      { type: 'automaton', level: 3, maxHp: 125, attack: 25, xp: 120, x: 170, z: 340, name: 'Rogue Steam Automaton' },
      { type: 'automaton', level: 3, maxHp: 125, attack: 25, xp: 120, x: 230, z: 270, name: 'Clockwork Iron Sentry' },
      { type: 'automaton', level: 4, maxHp: 170, attack: 34, xp: 165, x: 290, z: 320, name: 'Overcharged Gear Juggernaut' },
      { type: 'automaton', level: 4, maxHp: 175, attack: 35, xp: 170, x: 380, z: 240, name: 'Heavy Mining Drill Sentry' },
      { type: 'automaton', level: 6, maxHp: 320, attack: 52, xp: 310, x: 540, z: 420, name: 'Titanium Steam Colossus' },

      { type: 'bear', level: 3, maxHp: 130, attack: 26, xp: 125, x: 220, z: 360, name: 'Mountain Cave Bear' },
      { type: 'bear', level: 4, maxHp: 175, attack: 35, xp: 170, x: 340, z: 280, name: 'Elder Ironclaw Bear' },
      { type: 'bear', level: 5, maxHp: 240, attack: 45, xp: 240, x: 480, z: 380, name: 'Colossal Crag Bear' },

      { type: 'golem', level: 3, maxHp: 140, attack: 28, xp: 130, x: 270, z: 110, name: 'Crag Rock Golem' },
      { type: 'golem', level: 4, maxHp: 185, attack: 36, xp: 175, x: 350, z: 180, name: 'Granite Bastion Golem' },
      { type: 'golem', level: 5, maxHp: 250, attack: 45, xp: 240, x: 460, z: 260, name: 'Runed Mountain Titan' },

      { type: 'spider', level: 2, maxHp: 75, attack: 18, xp: 70, x: 210, z: 330, name: 'Deep-Mine Cave Spider' },
      { type: 'spider', level: 3, maxHp: 100, attack: 24, xp: 100, x: 370, z: 360, name: 'Gemstone Weaver Spider' },

      { type: 'drake', level: 4, maxHp: 180, attack: 36, xp: 185, x: 420, z: 310, name: 'Mountain Ridge Drake' },
      { type: 'wyvern', level: 5, maxHp: 250, attack: 46, xp: 250, x: 580, z: 350, name: 'Iron-Horned Wyvern' },

      // -------------------------------------------------------------
      // 4. HUMAN KINGDOM MEADOWS & WILDERNESS (North-East: x: 60 to 700, z: -700 to 20)
      // -------------------------------------------------------------
      { type: 'goblin', level: 1, maxHp: 50, attack: 12, xp: 45, x: 90, z: -180, name: 'Outlaw Bandit' },
      { type: 'goblin', level: 2, maxHp: 70, attack: 15, xp: 65, x: 120, z: -250, name: 'Highway Brigand' },
      { type: 'goblin', level: 2, maxHp: 70, attack: 15, xp: 65, x: 310, z: -120, name: 'Rogue Poacher' },
      { type: 'goblin', level: 3, maxHp: 95, attack: 20, xp: 90, x: 330, z: -210, name: 'Bandit Camp Leader' },
      { type: 'goblin', level: 4, maxHp: 130, attack: 26, xp: 135, x: 520, z: -210, name: 'Outlaw Warlord' },

      { type: 'wolf', level: 2, maxHp: 80, attack: 17, xp: 75, x: 310, z: -60, name: 'Highland Gray Wolf' },
      { type: 'wolf', level: 2, maxHp: 80, attack: 17, xp: 75, x: 350, z: -170, name: 'Timberland Stalker' },
      { type: 'wolf', level: 3, maxHp: 105, attack: 23, xp: 105, x: 440, z: -130, name: 'Alpha Steppe Wolf' },

      { type: 'bear', level: 3, maxHp: 135, attack: 27, xp: 130, x: 280, z: -270, name: 'Wild Valorian Brown Bear' },
      { type: 'bear', level: 4, maxHp: 180, attack: 36, xp: 175, x: 260, z: -330, name: 'Grizzly Ridge Behemoth' },

      { type: 'boar', level: 1, maxHp: 55, attack: 13, xp: 50, x: 130, z: -150, name: 'Wild Meadow Boar' },
      { type: 'boar', level: 2, maxHp: 80, attack: 17, xp: 75, x: 310, z: -30, name: 'Bristleback Boar' },

      { type: 'skeleton', level: 2, maxHp: 80, attack: 18, xp: 80, x: 390, z: -220, name: 'Wandering Tomb Skeleton' },
      { type: 'skeleton', level: 3, maxHp: 110, attack: 24, xp: 110, x: 480, z: -190, name: 'Cursed Valley Knight' },

      { type: 'spider', level: 2, maxHp: 75, attack: 17, xp: 70, x: 80, z: -320, name: 'Riverbank Weaver Spider' },
      { type: 'drake', level: 4, maxHp: 175, attack: 35, xp: 180, x: 560, z: -440, name: 'Crownlands Crested Drake' },
      { type: 'wyvern', level: 5, maxHp: 260, attack: 48, xp: 260, x: 560, z: -260, name: 'Royal Ridge Wyvern' }
    ];

    monsterSpawns.forEach((spawn, idx) => {
      const monster = this.createMonster(spawn, idx);
      this.monsters.push(monster);
    });
  }

  createMonster(cfg, id) {
    const group = new THREE.Group();
    const y = getTerrainHeight(cfg.x, cfg.z);
    group.position.set(cfg.x, y, cfg.z);

    let modelParts = {};

    if (cfg.type === 'goblin') {
      modelParts = this.buildGoblinModel(group, cfg.name);
    } else if (cfg.type === 'wolf') {
      modelParts = this.buildWolfModel(group, cfg.name);
    } else if (cfg.type === 'treant') {
      modelParts = this.buildTreantModel(group, cfg.name);
    } else if (cfg.type === 'imp') {
      modelParts = this.buildImpModel(group, cfg.name);
    } else if (cfg.type === 'boar' || cfg.type === 'bear') {
      modelParts = this.buildBearBoarModel(group, cfg.type, cfg.name);
    } else if (cfg.type === 'automaton') {
      modelParts = this.buildAutomatonModel(group, cfg.name);
    } else if (cfg.type === 'drake') {
      modelParts = this.buildDrakeModel(group, cfg.name);
    } else if (cfg.type === 'spider') {
      modelParts = this.buildSpiderModel(group, cfg.name);
    } else if (cfg.type === 'skeleton') {
      modelParts = this.buildSkeletonModel(group, cfg.name);
    } else if (cfg.type === 'golem') {
      modelParts = this.buildGolemModel(group, cfg.name);
    } else if (cfg.type === 'wyvern') {
      modelParts = this.buildWyvernModel(group, cfg.name);
    }

    // Floating HP Bar & Title Billboard
    const { sprite, updateHpBar } = this.createHpBarSprite(cfg.name, cfg.level, cfg.maxHp, cfg.maxHp);
    const spriteY = (cfg.type === 'treant' || cfg.type === 'drake' || cfg.type === 'golem' || cfg.type === 'wyvern') ? 4.2 : 2.6;
    sprite.position.set(0, spriteY, 0);
    group.add(sprite);

    this.scene.add(group);

    return {
      id: `monster_${id}`,
      name: cfg.name,
      baseName: cfg.name,
      type: cfg.type,
      level: cfg.level,
      maxHp: cfg.maxHp,
      currentHp: cfg.maxHp,
      attack: cfg.attack,
      xpValue: cfg.xp,
      group: group,
      modelParts: modelParts,
      sprite: sprite,
      updateHpBar: updateHpBar,
      spawnPos: new THREE.Vector3(cfg.x, y, cfg.z),
      targetPos: new THREE.Vector3(cfg.x, y, cfg.z),
      state: 'idle',
      wanderTimer: Math.random() * 3,
      attackCooldown: 0,
      isDead: false,
      isTamed: false,
      loyaltyAura: null,
      respawnTimer: 0
    };
  }

  // 1. Procedural Low-Poly Goblin / Bandit Model
  buildGoblinModel(group, name) {
    const isBandit = name.toLowerCase().includes('bandit') || name.toLowerCase().includes('brigand') || name.toLowerCase().includes('poacher');
    const skinMat = new THREE.MeshLambertMaterial({ color: isBandit ? 0xffdbac : 0x4d7c0f, flatShading: true });
    const clothMat = new THREE.MeshLambertMaterial({ color: isBandit ? 0x1f2937 : 0x451a03, flatShading: true });
    const eyeMat = new THREE.MeshBasicMaterial({ color: isBandit ? 0x000000 : 0xef4444 });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x52525b, flatShading: true });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.5), clothMat);
    torso.position.y = 0.9;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), skinMat);
    head.position.y = 1.6;
    head.castShadow = true;
    group.add(head);

    // Pointed Ears or Bandana
    [-1, 1].forEach(side => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.45, 4), skinMat);
      ear.rotation.z = side * -Math.PI / 3;
      ear.position.set(side * 0.4, 1.65, 0);
      group.add(ear);
    });

    // Eyes
    [-0.15, 0.15].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 4, 4), eyeMat);
      eye.position.set(ex, 1.65, 0.32);
      group.add(eye);
    });

    // Arm holding weapon
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), skinMat);
    armR.position.set(0.45, 0.9, 0.1);
    group.add(armR);

    const weapon = new THREE.Mesh(
      isBandit ? new THREE.BoxGeometry(0.1, 0.9, 0.05) : new THREE.CylinderGeometry(0.12, 0.06, 0.9, 5),
      isBandit ? ironMat : woodMat
    );
    weapon.rotation.x = Math.PI / 4;
    weapon.position.set(0.45, 1.1, 0.35);
    group.add(weapon);

    return { torso, head, armR };
  }

  // 2. Procedural Low-Poly Dire Wolf / Hellhound Model
  buildWolfModel(group, name) {
    const isHellhound = name.toLowerCase().includes('hellhound') || name.toLowerCase().includes('flame');
    const furColor = isHellhound ? 0x991b1b : 0x374151;
    const darkFurColor = isHellhound ? 0x450a0a : 0x1f2937;
    const eyeColor = isHellhound ? 0xf97316 : 0xfacc15;

    const furMat = new THREE.MeshLambertMaterial({ color: furColor, flatShading: true });
    const darkFurMat = new THREE.MeshLambertMaterial({ color: darkFurColor, flatShading: true });
    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.85, 1.9), furMat);
    body.position.y = 0.85;
    body.castShadow = true;
    group.add(body);

    // Neck & Head
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.65), furMat);
    neck.position.set(0, 1.15, 0.85);
    neck.rotation.x = -0.3;
    group.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.75), darkFurMat);
    head.position.set(0, 1.35, 1.15);
    group.add(head);

    // Ears
    [-0.22, 0.22].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.38, 4), darkFurMat);
      ear.position.set(ex, 1.75, 1.0);
      group.add(ear);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.07, 4, 4), eyeMat);
      eye.position.set(ex * 0.8, 1.4, 1.5);
      group.add(eye);
    });

    // 4 Running Legs
    const legs = [];
    [[-0.38, -0.65], [0.38, -0.65], [-0.38, 0.65], [0.38, 0.65]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.75, 0.22), furMat);
      leg.position.set(lx, 0.38, lz);
      leg.castShadow = true;
      group.add(leg);
      legs.push(leg);
    });

    // Tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.18, 1.0, 4), furMat);
    tail.rotation.x = -Math.PI / 3;
    tail.position.set(0, 0.95, -1.15);
    group.add(tail);

    return { body, head, legs, tail };
  }

  // 3. Procedural Low-Poly Corrupted Treant / Golem Model
  buildTreantModel(group, name) {
    const isObsidian = name.toLowerCase().includes('obsidian') || name.toLowerCase().includes('volcanic') || name.toLowerCase().includes('magma');
    const barkColor = isObsidian ? 0x18181b : 0x3e2723;
    const mossColor = isObsidian ? 0xef4444 : 0x166534;
    const eyeColor = isObsidian ? 0xff4500 : 0xf59e0b;

    const barkMat = new THREE.MeshLambertMaterial({ color: barkColor, flatShading: true });
    const mossMat = new THREE.MeshLambertMaterial({ color: mossColor, flatShading: true });
    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });

    // Heavy Bark / Stone Torso
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.3, 2.4, 6), barkMat);
    torso.position.y = 1.7;
    torso.castShadow = true;
    group.add(torso);

    // Mossy / Lava Shoulder Crest
    const moss = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 0), mossMat);
    moss.position.set(0, 2.7, 0);
    group.add(moss);

    // Glowing Eye Slits
    const eyeSlit = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.14, 0.2), eyeMat);
    eyeSlit.position.set(0, 2.4, 0.95);
    group.add(eyeSlit);

    // Thick Branch Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 0.5), barkMat);
    armL.position.set(-1.3, 1.8, 0);
    group.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 0.5), barkMat);
    armR.position.set(1.3, 1.8, 0);
    group.add(armR);

    return { torso, moss, armL, armR };
  }

  // 4. Procedural Low-Poly Nether Imp Model
  buildImpModel(group) {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0x991b1b, flatShading: true }); // Crimson demon skin
    const hornMat = new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true }); // Obsidian horns
    const wingMat = new THREE.MeshLambertMaterial({ color: 0x581c87, flatShading: true, side: THREE.DoubleSide });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.4), skinMat);
    torso.position.y = 0.8;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), skinMat);
    head.position.y = 1.35;
    group.add(head);

    // Horns
    [-0.15, 0.15].forEach(hx => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 4), hornMat);
      horn.position.set(hx, 1.7, 0);
      horn.rotation.z = hx < 0 ? -0.3 : 0.3;
      group.add(horn);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), eyeMat);
      eye.position.set(hx, 1.35, 0.24);
      group.add(eye);
    });

    // Bat Wings
    [-1, 1].forEach(side => {
      const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), wingMat);
      wing.position.set(side * 0.5, 1.0, -0.2);
      wing.rotation.y = side * 0.4;
      group.add(wing);
    });

    // Tail
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 0.8, 4), skinMat);
    tail.rotation.x = -Math.PI / 3;
    tail.position.set(0, 0.6, -0.4);
    group.add(tail);

    return { torso, head };
  }

  // 5. Procedural Low-Poly Bear / Boar Model
  buildBearBoarModel(group, type) {
    const isBear = (type === 'bear');
    const bodyColor = isBear ? 0x451a03 : 0x57534e;
    const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor, flatShading: true });
    const darkMat = new THREE.MeshLambertMaterial({ color: 0x1c1917, flatShading: true });
    const tuskMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc, flatShading: true });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });

    // Stocky Body
    const bw = isBear ? 1.3 : 1.1;
    const bh = isBear ? 1.2 : 1.0;
    const bd = isBear ? 2.2 : 1.8;
    const body = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), bodyMat);
    body.position.y = bh / 2 + 0.4;
    body.castShadow = true;
    group.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.7, bh * 0.7, 0.8), darkMat);
    head.position.set(0, bh * 0.8 + 0.4, bd / 2 + 0.3);
    group.add(head);

    // Snout
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.4), darkMat);
    snout.position.set(0, bh * 0.7 + 0.3, bd / 2 + 0.8);
    group.add(snout);

    // Tusks for boar
    if (!isBear) {
      [-0.22, 0.22].forEach(tx => {
        const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.45, 4), tuskMat);
        tusk.position.set(tx, bh * 0.7 + 0.4, bd / 2 + 0.8);
        tusk.rotation.x = -0.4;
        group.add(tusk);
      });
    }

    // Legs
    const legs = [];
    [[-bw / 2 + 0.2, -bd / 2 + 0.3], [bw / 2 - 0.2, -bd / 2 + 0.3], [-bw / 2 + 0.2, bd / 2 - 0.3], [bw / 2 - 0.2, bd / 2 - 0.3]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.6, 0.35), bodyMat);
      leg.position.set(lx, 0.3, lz);
      group.add(leg);
      legs.push(leg);
    });

    return { body, head, legs };
  }

  // 6. Procedural Low-Poly Dwarven Steam Automaton Model
  buildAutomatonModel(group) {
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x3f3f46, flatShading: true });
    const brassMat = new THREE.MeshLambertMaterial({ color: 0xb45309, flatShading: true });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

    // Cubical Steam Boiler Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.8), ironMat);
    torso.position.y = 1.3;
    torso.castShadow = true;
    group.add(torso);

    // Brass Chimney Exhaust
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.7, 6), brassMat);
    exhaust.position.set(0.3, 2.1, -0.2);
    group.add(exhaust);

    // Clockwork Gear Core
    const gear = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 8), brassMat);
    gear.rotation.x = Math.PI / 2;
    gear.position.set(0, 1.3, 0.42);
    group.add(gear);

    // Blue Luminous Optical Sensor
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), glowMat);
    eye.position.set(0, 1.7, 0.42);
    group.add(eye);

    // Heavy Piston Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 0.3), ironMat);
    armL.position.set(-0.75, 1.2, 0);
    group.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1, 0.3), brassMat);
    armR.position.set(0.75, 1.2, 0);
    group.add(armR);

    return { torso, gear, armL, armR };
  }

  // 7. Procedural Low-Poly Drake / Dragonling Model
  buildDrakeModel(group, name) {
    const isNether = name.toLowerCase().includes('nether') || name.toLowerCase().includes('dread');
    const scaleColor = isNether ? 0x7f1d1d : 0x0284c7;
    const wingColor = isNether ? 0x18181b : 0x38bdf8;
    const eyeColor = isNether ? 0xef4444 : 0xfacc15;

    const scaleMat = new THREE.MeshLambertMaterial({ color: scaleColor, flatShading: true });
    const wingMat = new THREE.MeshLambertMaterial({ color: wingColor, flatShading: true, side: THREE.DoubleSide });
    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
    const hornMat = new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true });

    // Sleek Reptilian Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.85, 2.2, 6), scaleMat);
    body.rotation.x = Math.PI / 2;
    body.position.y = 1.2;
    body.castShadow = true;
    group.add(body);

    // Long Neck & Dragon Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 1.0, 5), scaleMat);
    neck.position.set(0, 1.6, 1.1);
    neck.rotation.x = -0.6;
    group.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.5, 0.9), scaleMat);
    head.position.set(0, 2.0, 1.6);
    group.add(head);

    // Horns
    [-0.25, 0.25].forEach(hx => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.7, 4), hornMat);
      horn.position.set(hx, 2.3, 1.4);
      horn.rotation.x = -0.5;
      group.add(horn);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 4, 4), eyeMat);
      eye.position.set(hx, 2.05, 1.9);
      group.add(eye);
    });

    // Great Dragon Wings
    [-1, 1].forEach(side => {
      const wing = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.2), wingMat);
      wing.position.set(side * 1.3, 1.6, 0);
      wing.rotation.y = side * 0.3;
      wing.rotation.z = side * 0.3;
      group.add(wing);
    });

    // Long Serpentine Tail
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.8, 5), scaleMat);
    tail.rotation.x = -Math.PI / 2.2;
    tail.position.set(0, 1.0, -1.8);
    group.add(tail);

    return { body, head, tail };
  }

  // 8. Procedural Low-Poly Giant Spider / Arachnid Model
  buildSpiderModel(group, name) {
    const isVenom = name.toLowerCase().includes('venom') || name.toLowerCase().includes('brood') || name.toLowerCase().includes('silk');
    const isBlood = name.toLowerCase().includes('blood') || name.toLowerCase().includes('magma') || name.toLowerCase().includes('crawler');
    const bodyColor = isBlood ? 0x27272a : (isVenom ? 0x064e3b : 0x18181b);
    const abdomenColor = isBlood ? 0x7f1d1d : (isVenom ? 0x047857 : 0x262626);
    const eyeColor = isBlood ? 0xef4444 : (isVenom ? 0x22c55e : 0xf43f5e);

    const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor, flatShading: true });
    const abdomenMat = new THREE.MeshLambertMaterial({ color: abdomenColor, flatShading: true });
    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
    const fangMat = new THREE.MeshLambertMaterial({ color: 0xfafafa, flatShading: true });

    // Cephalothorax (head-thorax)
    const thorax = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.7), bodyMat);
    thorax.position.set(0, 0.55, 0.1);
    thorax.castShadow = true;
    group.add(thorax);

    // Large Bulbous Abdomen
    const abdomen = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), abdomenMat);
    abdomen.position.set(0, 0.75, -0.85);
    abdomen.scale.set(1.0, 0.85, 1.3);
    abdomen.castShadow = true;
    group.add(abdomen);

    // 8 Articulated Spider Legs (4 on each side)
    [-1, 1].forEach(side => {
      for (let legIdx = 0; legIdx < 4; legIdx++) {
        const legGroup = new THREE.Group();
        const zOffset = 0.35 - legIdx * 0.22;
        legGroup.position.set(side * 0.4, 0.55, zOffset);

        // Upper leg (angled up-out)
        const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.65, 4), bodyMat);
        upperLeg.rotation.z = side * -0.9;
        upperLeg.rotation.y = (legIdx - 1.5) * 0.25;
        upperLeg.position.set(side * 0.25, 0.2, 0);
        legGroup.add(upperLeg);

        // Lower leg (angled down to ground)
        const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.75, 4), bodyMat);
        lowerLeg.rotation.z = side * 0.45;
        lowerLeg.position.set(side * 0.55, -0.15, 0);
        legGroup.add(lowerLeg);

        group.add(legGroup);
      }
    });

    // 4 Glowing Bead Eyes on Front Face
    [[-0.2, 0.65], [-0.07, 0.68], [0.07, 0.68], [0.2, 0.65]].forEach(([ex, ey]) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4), eyeMat);
      eye.position.set(ex, ey, 0.47);
      group.add(eye);
    });

    // Curved Fangs
    [-0.12, 0.12].forEach(fx => {
      const fang = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.25, 4), fangMat);
      fang.position.set(fx, 0.38, 0.52);
      fang.rotation.x = -Math.PI / 4;
      group.add(fang);
    });

    return { thorax, abdomen };
  }

  // 9. Procedural Low-Poly Skeleton Warrior / Bone Knight Model
  buildSkeletonModel(group, name) {
    const isKnight = name.toLowerCase().includes('knight') || name.toLowerCase().includes('champion') || name.toLowerCase().includes('dread') || name.toLowerCase().includes('throne');
    const boneMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true });
    const darkBoneMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true });
    const eyeMat = new THREE.MeshBasicMaterial({ color: isKnight ? 0xef4444 : 0x06b6d4 });
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x3f3f46, flatShading: true });
    const armorMat = new THREE.MeshLambertMaterial({ color: isKnight ? 0x18181b : 0x475569, flatShading: true });

    // Spine & Pelvis
    const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 4), boneMat);
    spine.position.y = 1.0;
    spine.castShadow = true;
    group.add(spine);

    const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.3), darkBoneMat);
    pelvis.position.y = 0.55;
    group.add(pelvis);

    // Ribcage (stacked low-poly bone arches)
    for (let r = 0; r < 4; r++) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.55 - r * 0.05, 0.07, 0.35 - r * 0.03), boneMat);
      rib.position.set(0, 0.85 + r * 0.16, 0);
      group.add(rib);
    }

    // Skull
    const skull = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.5, 0.48), boneMat);
    skull.position.y = 1.75;
    skull.castShadow = true;
    group.add(skull);

    // Jaw
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.32), darkBoneMat);
    jaw.position.set(0, 1.45, 0.06);
    group.add(jaw);

    // Glowing Necromantic Eye Sockets
    [-0.12, 0.12].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 4, 4), eyeMat);
      eye.position.set(ex, 1.8, 0.26);
      group.add(eye);
    });

    // Bone Legs
    [-0.16, 0.16].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 4), boneMat);
      leg.position.set(lx, 0.28, 0);
      group.add(leg);
    });

    // Left Arm (with wooden or iron shield if knight)
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 4), boneMat);
    armL.position.set(-0.35, 1.1, 0);
    group.add(armL);

    if (isKnight) {
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, 0.5), armorMat);
      shield.position.set(-0.45, 1.1, 0.2);
      group.add(shield);
    }

    // Right Arm with Bone Sword / Rusted Cleaver
    const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.65, 4), boneMat);
    armR.position.set(0.35, 1.1, 0);
    group.add(armR);

    const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.18), isKnight ? ironMat : boneMat);
    swordBlade.position.set(0.4, 1.3, 0.35);
    swordBlade.rotation.x = Math.PI / 4;
    group.add(swordBlade);

    return { skull, spine, swordBlade };
  }

  // 10. Procedural Low-Poly Rock / Volcanic Golem Model
  buildGolemModel(group, name) {
    const isVolcanic = name.toLowerCase().includes('volcanic') || name.toLowerCase().includes('magma') || name.toLowerCase().includes('nether') || name.toLowerCase().includes('brimstone');
    const isGranite = name.toLowerCase().includes('granite') || name.toLowerCase().includes('mountain') || name.toLowerCase().includes('rock');
    const stoneColor = isVolcanic ? 0x1c1917 : (isGranite ? 0x57534e : 0x3f3f46);
    const coreColor = isVolcanic ? 0xf97316 : 0x06b6d4;

    const stoneMat = new THREE.MeshLambertMaterial({ color: stoneColor, flatShading: true });
    const coreMat = new THREE.MeshBasicMaterial({ color: coreColor });
    const accentMat = new THREE.MeshLambertMaterial({ color: isVolcanic ? 0x7f1d1d : 0x78350f, flatShading: true });

    // Heavy Faceted Rock Torso
    const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 0), stoneMat);
    torso.position.y = 1.7;
    torso.scale.set(1.2, 1.1, 0.9);
    torso.castShadow = true;
    group.add(torso);

    // Glowing Elemental Core at chest center
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), coreMat);
    core.position.set(0, 1.75, 0.7);
    group.add(core);

    // Massive Stone Shoulder Pads
    [-1.2, 1.2].forEach(sx => {
      const shoulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 0), stoneMat);
      shoulder.position.set(sx, 2.1, 0);
      group.add(shoulder);

      // Heavy Stone Fist Club
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.5), stoneMat);
      arm.position.set(sx, 1.2, 0.2);
      group.add(arm);

      const fist = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), accentMat);
      fist.position.set(sx, 0.6, 0.3);
      group.add(fist);
    });

    // Chunky Rock Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.6, 0.7), stoneMat);
    head.position.set(0, 2.5, 0.2);
    group.add(head);

    // Glowing Core Slit Eyes
    [-0.18, 0.18].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.1), coreMat);
      eye.position.set(ex, 2.55, 0.58);
      group.add(eye);
    });

    // Sturdy Columnar Stone Legs
    [-0.5, 0.5].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.9, 0.65), stoneMat);
      leg.position.set(lx, 0.45, 0);
      group.add(leg);
    });

    return { torso, head, core };
  }

  // 11. Procedural Low-Poly Winged Wyvern / Shadow Dragon Model
  buildWyvernModel(group, name) {
    const isNether = name.toLowerCase().includes('nether') || name.toLowerCase().includes('shadow') || name.toLowerCase().includes('dread') || name.toLowerCase().includes('void') || name.toLowerCase().includes('flame');
    const scaleColor = isNether ? 0x450a0a : 0x047857;
    const wingColor = isNether ? 0x18181b : 0x065f46;
    const eyeColor = isNether ? 0xf59e0b : 0x38bdf8;

    const scaleMat = new THREE.MeshLambertMaterial({ color: scaleColor, flatShading: true });
    const wingMat = new THREE.MeshLambertMaterial({ color: wingColor, flatShading: true, side: THREE.DoubleSide });
    const eyeMat = new THREE.MeshBasicMaterial({ color: eyeColor });
    const hornMat = new THREE.MeshLambertMaterial({ color: 0x1c1917, flatShading: true });

    // Elongated Serpentine Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.95, 2.4, 6), scaleMat);
    body.rotation.x = Math.PI / 2.1;
    body.position.y = 1.3;
    body.castShadow = true;
    group.add(body);

    // Arching Dragon Neck & Horned Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 1.2, 5), scaleMat);
    neck.position.set(0, 1.8, 1.2);
    neck.rotation.x = -0.7;
    group.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 1.0), scaleMat);
    head.position.set(0, 2.3, 1.7);
    group.add(head);

    // Dual Curved Horns
    [-0.26, 0.26].forEach(hx => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.85, 4), hornMat);
      horn.position.set(hx, 2.7, 1.4);
      horn.rotation.x = -0.6;
      group.add(horn);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 4, 4), eyeMat);
      eye.position.set(hx, 2.35, 2.05);
      group.add(eye);
    });

    // Broad Leathery Wings
    [-1, 1].forEach(side => {
      const wingGroup = new THREE.Group();
      wingGroup.position.set(side * 0.9, 1.8, 0.3);

      const wingArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.6, 4), scaleMat);
      wingArm.rotation.z = side * -Math.PI / 3;
      wingGroup.add(wingArm);

      const wingMembrane = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), wingMat);
      wingMembrane.position.set(side * 1.1, 0.3, 0);
      wingMembrane.rotation.y = side * 0.3;
      wingMembrane.rotation.z = side * 0.2;
      wingGroup.add(wingMembrane);

      group.add(wingGroup);
    });

    // Long Barbed Spiked Tail
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.2, 5), scaleMat);
    tail.rotation.x = -Math.PI / 2.3;
    tail.position.set(0, 1.1, -2.1);
    group.add(tail);

    const barb = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 4), hornMat);
    barb.position.set(0, 1.4, -3.1);
    barb.rotation.x = Math.PI / 3;
    group.add(barb);

    return { body, head, tail };
  }

  // Billboard 2D Canvas Health Bar & Level Tag
  createHpBarSprite(name, level, currentHp, maxHp, isTamed = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 76;
    const ctx = canvas.getContext('2d');

    const render = (cur, max, lvl, tamed) => {
      ctx.clearRect(0, 0, 256, 76);

      // Background pill
      ctx.fillStyle = tamed ? 'rgba(6, 78, 59, 0.90)' : 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = tamed ? '#38bdf8' : '#ef4444';
      ctx.lineWidth = tamed ? 4 : 3;
      ctx.beginPath();
      ctx.roundRect(6, 6, 244, 64, 12);
      ctx.fill();
      ctx.stroke();

      // Title & Level text
      ctx.fillStyle = tamed ? '#38bdf8' : '#f8fafc';
      ctx.font = 'bold 17px sans-serif';
      ctx.textAlign = 'center';
      const titleText = tamed ? `🐾 [TAMED] Lv. ${lvl} ${name}` : `Lv. ${lvl} ${name}`;
      ctx.fillText(titleText, 128, 28);

      // HP Bar background
      ctx.fillStyle = tamed ? '#0f172a' : '#450a0a';
      ctx.fillRect(20, 42, 216, 16);

      // HP Bar fill
      const ratio = Math.max(0, Math.min(1, cur / max));
      ctx.fillStyle = tamed ? '#38bdf8' : (ratio > 0.4 ? '#22c55e' : '#ef4444');
      ctx.fillRect(20, 42, 216 * ratio, 16);
    };

    render(currentHp, maxHp, level, isTamed);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.4, 1.0, 1);

    const updateHpBar = (newHp, newMax, newLvl, tamed = isTamed) => {
      render(newHp, newMax, newLvl || level, tamed);
      texture.needsUpdate = true;
    };

    return { sprite, updateHpBar };
  }

  // Initialize Elven Forest Guardian NPCs
  initForestGuardians() {
    const guardianConfigs = [
      { name: 'Ranger Lyra', x: -180, z: 140, level: 1, maxHp: 100, attack: 26, color: '#10b981' },
      { name: 'Guardian Kaelen', x: -210, z: 240, level: 1, maxHp: 110, attack: 28, color: '#06b6d4' }
    ];

    guardianConfigs.forEach((cfg) => {
      const group = new THREE.Group();
      const y = getTerrainHeight(cfg.x, cfg.z);
      group.position.set(cfg.x, y, cfg.z);

      const bodyMat = new THREE.MeshLambertMaterial({ color: 0x065f46, flatShading: true });
      const skinMat = new THREE.MeshLambertMaterial({ color: 0xfde047, flatShading: true });

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.5), bodyMat);
      torso.position.y = 1.3;
      group.add(torso);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), skinMat);
      head.position.y = 2.1;
      group.add(head);

      const { sprite, updateHpBar } = this.createHpBarSprite(cfg.name, cfg.level, cfg.maxHp, cfg.maxHp);
      sprite.position.set(0, 3.2, 0);
      group.add(sprite);

      this.scene.add(group);

      this.guardians.push({
        name: cfg.name,
        group: group,
        level: cfg.level,
        maxHp: cfg.maxHp,
        currentHp: cfg.maxHp,
        attack: cfg.attack,
        xp: 0,
        xpToNext: 100,
        updateHpBar: updateHpBar,
        attackCooldown: 0
      });
    });
  }

  // -------------------------------------------------------------
  // MONSTER TAMING SYSTEM ("u can taim the monsters also but only ones")
  // -------------------------------------------------------------

  /**
   * Check if player can tame a monster
   * Rule: Must be within 5m, monster must be alive, not already tamed.
   */
  canTame(monster, playerPos) {
    if (!monster || monster.isDead || monster.isTamed) return false;
    const dist = Math.hypot(monster.group.position.x - playerPos.x, monster.group.position.z - playerPos.z);
    return dist <= 5.0;
  }

  /**
   * Tame the specified monster!
   * Inviolable rule: PLAYER CAN ONLY HAVE ONE TAMED MONSTER AT A TIME ("only ones")!
   */
  tameMonster(monster) {
    if (!monster || monster.isDead || monster.isTamed) return false;

    let prevCompanionName = null;
    // Strict rule: PLAYER CAN ONLY HAVE ONE TAMED MONSTER AT A TIME ("only ones")!
    if (this.tamedMonster && this.tamedMonster !== monster) {
      prevCompanionName = this.tamedMonster.name;
      this.releaseTamedMonster();
    }

    // Set as active tamed monster
    monster.isTamed = true;
    monster.state = 'tamed';
    this.tamedMonster = monster;

    // Full heal on taming
    monster.currentHp = monster.maxHp;

    // Loyalty Crown / Collar Aura
    const auraGroup = new THREE.Group();

    // Floating cyan heart / star crown
    const crown = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.08, 6, 12),
      new THREE.MeshLambertMaterial({ color: 0x38bdf8, emissive: 0x0284c7, flatShading: true })
    );
    crown.rotation.x = Math.PI / 2;
    crown.position.y = (monster.type === 'treant' || monster.type === 'drake' || monster.type === 'golem' || monster.type === 'wyvern') ? 3.6 : 2.2;
    auraGroup.add(crown);

    const loyaltyLight = new THREE.PointLight(0x38bdf8, 1.4, 12);
    loyaltyLight.position.y = crown.position.y;
    auraGroup.add(loyaltyLight);

    monster.group.add(auraGroup);
    monster.loyaltyAura = auraGroup;

    // Update HP bar billboard to Tamed Companion
    monster.updateHpBar(monster.currentHp, monster.maxHp, monster.level, true);

    // Floating celebration text & sound
    const spawnPos = monster.group.position.clone();
    spawnPos.y += 1.6;
    if (prevCompanionName) {
      this.combatSystem.spawnFloatingText(spawnPos, `🐾 Swapped! New Companion: ${monster.name}`, '#38bdf8', true);
    } else {
      this.combatSystem.spawnFloatingText(spawnPos, `❤️ TAMED! (Companion: ${monster.name})`, '#38bdf8', true);
    }
    audioSystem.playDoorChime(true);

    return true;
  }

  /**
   * Release the current tamed monster (if player wants to tame another)
   */
  releaseTamedMonster() {
    if (!this.tamedMonster) return;

    const m = this.tamedMonster;
    m.isTamed = false;
    m.state = 'idle';

    if (m.loyaltyAura) {
      m.group.remove(m.loyaltyAura);
      m.loyaltyAura = null;
    }

    m.updateHpBar(m.currentHp, m.maxHp, m.level, false);
    const releasePos = m.group.position.clone();
    releasePos.y += 1.4;
    this.combatSystem.spawnFloatingText(releasePos, `💔 Released ${m.name} (Now Wild)`, '#f87171');
    audioSystem.playFootstep('wood');

    this.tamedMonster = null;
  }

  getTamedMonster() {
    return this.tamedMonster;
  }

  getCompanionData() {
    if (!this.tamedMonster) return null;
    const m = this.tamedMonster;
    let icon = '🐾';
    if (m.type === 'wolf') icon = '🐺';
    else if (m.type === 'bear') icon = '🐻';
    else if (m.type === 'boar') icon = '🐗';
    else if (m.type === 'spider') icon = '🕷️';
    else if (m.type === 'drake' || m.type === 'wyvern') icon = '🐉';
    else if (m.type === 'skeleton') icon = '💀';
    else if (m.type === 'golem' || m.type === 'treant') icon = '🗿';
    else if (m.type === 'automaton') icon = '⚙️';
    else if (m.type === 'imp') icon = '👿';
    else if (m.type === 'goblin') icon = '👺';

    return {
      id: m.id,
      name: m.name,
      type: m.type,
      level: m.level,
      currentHp: m.currentHp,
      maxHp: m.maxHp,
      attack: m.attack,
      icon: icon
    };
  }

  getNearbyTamableMonster(playerPos) {
    if (!playerPos) return null;

    let closest = null;
    let minDist = 5.0;

    for (const m of this.monsters) {
      if (m.isDead || m.isTamed) continue;
      const d = Math.hypot(m.group.position.x - playerPos.x, m.group.position.z - playerPos.z);
      if (d < minDist) {
        minDist = d;
        closest = m;
      }
    }

    this.nearbyTamableMonster = closest;
    return closest;
  }

  // -------------------------------------------------------------
  // COMBAT & SPELL ATTACKS
  // -------------------------------------------------------------

  playerAttack(playerPos, attackPower) {
    let hitMonster = null;
    let minDist = 3.6;

    this.monsters.forEach(m => {
      if (m.isDead || m.isTamed) return; // Do not hit own tamed companion!
      const dist = Math.hypot(m.group.position.x - playerPos.x, m.group.position.z - playerPos.z);
      if (dist < minDist) {
        minDist = dist;
        hitMonster = m;
      }
    });

    if (hitMonster) {
      const isCrit = Math.random() < 0.25;
      const dmg = Math.floor(attackPower * (isCrit ? 1.5 : 1.0) * (0.85 + Math.random() * 0.3));

      hitMonster.currentHp = Math.max(0, hitMonster.currentHp - dmg);
      hitMonster.updateHpBar(hitMonster.currentHp, hitMonster.maxHp, hitMonster.level);

      this.combatSystem.spawnFloatingText(hitMonster.group.position, isCrit ? `CRIT -${dmg}` : `-${dmg}`, isCrit ? '#f59e0b' : '#ffffff', isCrit);

      // Knockback
      hitMonster.group.position.y += 0.2;

      if (hitMonster.currentHp <= 0) {
        this.killMonster(hitMonster, 'Player');
        return { hit: true, killed: true, xp: hitMonster.xpValue };
      }

      return { hit: true, killed: false, xp: 0 };
    }

    return { hit: false, killed: false, xp: 0 };
  }

  playerSpellAttack(spell, centerPos, forwardVector) {
    let hitCount = 0;
    let totalDamage = 0;
    let totalXp = 0;
    let killedCount = 0;

    for (let i = 0; i < this.monsters.length; i++) {
      const m = this.monsters[i];
      if (m.isDead || m.isTamed) continue; // Do not hit tamed pet!

      const dx = m.group.position.x - centerPos.x;
      const dz = m.group.position.z - centerPos.z;
      const dist = Math.hypot(dx, dz);

      if (dist > spell.radius) continue;

      if (spell.type === 'cone' && forwardVector) {
        const dot = (dx * forwardVector.x + dz * forwardVector.z) / dist;
        if (dot < 0.45) continue;
      }

      const isCrit = Math.random() < 0.30;
      const spellDmg = Math.floor(spell.damage * (isCrit ? 1.5 : 1.0) * (0.9 + Math.random() * 0.25));

      m.currentHp = Math.max(0, m.currentHp - spellDmg);
      m.updateHpBar(m.currentHp, m.maxHp, m.level);

      this.combatSystem.spawnFloatingText(
        m.group.position,
        isCrit ? `⚡ CRIT -${spellDmg}` : `-${spellDmg}`,
        spell.color || '#ef4444',
        isCrit
      );

      hitCount++;
      totalDamage += spellDmg;

      if (m.currentHp <= 0) {
        this.killMonster(m, spell.name);
        totalXp += m.xpValue;
        killedCount++;
      }
    }

    return { hit: hitCount > 0, hitCount, totalDamage, totalXp, killedCount };
  }

  killMonster(monster, killerName) {
    if (monster === this.tamedMonster) {
      this.tamedMonster = null;
    }

    monster.isDead = true;
    monster.currentHp = 0;
    monster.group.rotation.z = Math.PI / 2;
    monster.group.position.y = getTerrainHeight(monster.group.position.x, monster.group.position.z) + 0.3;

    this.combatSystem.spawnFloatingText(monster.group.position, `+${monster.xpValue} XP!`, '#60a5fa');

    setTimeout(() => {
      monster.group.visible = false;
    }, 1200);

    monster.respawnTimer = 22.0; // Respawns after 22 seconds
  }

  // -------------------------------------------------------------
  // MAIN UPDATE LOOP (AI, Tamed Pet Following, Combat)
  // -------------------------------------------------------------

  update(delta, playerPos) {
    const time = performance.now() * 0.002;

    // Check tamable monster near player
    this.getNearbyTamableMonster(playerPos);

    // 1. Update Tamed Monster (Loyal Companion AI)
    if (this.tamedMonster && !this.tamedMonster.isDead) {
      const pet = this.tamedMonster;

      // Animate loyalty aura
      if (pet.loyaltyAura) {
        pet.loyaltyAura.rotation.y += delta * 1.5;
      }

      // Check for nearby hostile monsters to protect master!
      let targetHostile = null;
      let minHostileDist = 12.0;

      this.monsters.forEach(m => {
        if (m === pet || m.isDead || m.isTamed) return;
        const d = Math.hypot(m.group.position.x - playerPos.x, m.group.position.z - playerPos.z);
        if (d < minHostileDist) {
          minHostileDist = d;
          targetHostile = m;
        }
      });

      if (targetHostile) {
        // Tamed Pet charges hostile monster to defend player!
        const dX = targetHostile.group.position.x - pet.group.position.x;
        const dZ = targetHostile.group.position.z - pet.group.position.z;
        const hDist = Math.hypot(dX, dZ);
        const ang = Math.atan2(dX, dZ);
        pet.group.rotation.y = ang;

        if (hDist > 2.2) {
          pet.group.position.x += Math.sin(ang) * 5.5 * delta;
          pet.group.position.z += Math.cos(ang) * 5.5 * delta;
          pet.group.position.y = getTerrainHeight(pet.group.position.x, pet.group.position.z);
        } else {
          // Pet attacks hostile monster!
          pet.attackCooldown -= delta;
          if (pet.attackCooldown <= 0) {
            pet.attackCooldown = 1.2;
            const petDmg = Math.floor(pet.attack * 1.25);
            targetHostile.currentHp -= petDmg;
            targetHostile.updateHpBar(targetHostile.currentHp, targetHostile.maxHp, targetHostile.level);
            this.combatSystem.spawnFloatingText(targetHostile.group.position, `🐾 -${petDmg}`, '#38bdf8');

            if (targetHostile.currentHp <= 0) {
              this.killMonster(targetHostile, pet.name);
            }
          }
        }
      } else {
        // No hostiles: follow player closely
        const dx = playerPos.x - pet.group.position.x;
        const dz = playerPos.z - pet.group.position.z;
        const distToPlayer = Math.hypot(dx, dz);

        // Teleport companion if player fast-travels or rides far ahead
        if (distToPlayer > 35.0) {
          pet.group.position.set(playerPos.x - 2.5, getTerrainHeight(playerPos.x - 2.5, playerPos.z - 2.5), playerPos.z - 2.5);
        } else if (distToPlayer > 2.8) {
          const followAngle = Math.atan2(dx, dz);
          pet.group.rotation.y = followAngle;

          // Match player walking/sprinting/steed galloping speeds
          const petSpeed = distToPlayer > 12.0 ? 12.0 : (distToPlayer > 6.0 ? 8.0 : 4.5);
          pet.group.position.x += Math.sin(followAngle) * petSpeed * delta;
          pet.group.position.z += Math.cos(followAngle) * petSpeed * delta;
          pet.group.position.y = getTerrainHeight(pet.group.position.x, pet.group.position.z);
        }
      }
    }

    // 2. Update Hostile Monsters AI & Behaviors
    this.monsters.forEach(m => {
      if (m.isDead) {
        m.respawnTimer -= delta;
        if (m.respawnTimer <= 0) {
          m.isDead = false;
          m.isTamed = false;
          m.currentHp = m.maxHp;
          m.group.position.copy(m.spawnPos);
          m.group.rotation.set(0, 0, 0);
          m.group.visible = true;
          m.updateHpBar(m.currentHp, m.maxHp, m.level, false);
        }
        return;
      }

      if (m.isTamed) return; // Handled in tamed loop above!

      // Distance checks
      const playerInSanctuary = playerPos ? isInSanctuaryZone(playerPos.x, playerPos.z, 2.0) : null;
      const distToPlayer = (playerPos && !playerInSanctuary) ? Math.hypot(playerPos.x - m.group.position.x, playerPos.z - m.group.position.z) : 999;

      let targetGuardian = null;
      let minGuardDist = 14.0;
      this.guardians.forEach(g => {
        if (isInSanctuaryZone(g.group.position.x, g.group.position.z, 2.0)) return;
        const d = Math.hypot(g.group.position.x - m.group.position.x, g.group.position.z - m.group.position.z);
        if (d < minGuardDist) {
          minGuardDist = d;
          targetGuardian = g;
        }
      });

      let targetEntity = null;
      let targetDist = 999;

      if (distToPlayer < 12.0) {
        targetEntity = { pos: playerPos, type: 'player' };
        targetDist = distToPlayer;
      } else if (targetGuardian) {
        targetEntity = { pos: targetGuardian.group.position, guardian: targetGuardian, type: 'guardian' };
        targetDist = minGuardDist;
      }

      // Chase & Attack or Patrol
      if (targetEntity && targetDist < 12.0) {
        const angle = Math.atan2(targetEntity.pos.x - m.group.position.x, targetEntity.pos.z - m.group.position.z);
        m.group.rotation.y = angle;

        if (targetDist > 2.0) {
          const chaseSpeed = (m.type === 'wolf' || m.type === 'spider') ? 4.8 : (m.type === 'drake' || m.type === 'wyvern' ? 5.2 : 3.0);
          const nextX = m.group.position.x + Math.sin(angle) * chaseSpeed * delta;
          const nextZ = m.group.position.z + Math.cos(angle) * chaseSpeed * delta;

          // Check if candidate chase step breaches a protected settlement or village
          const targetSanctuary = isInSanctuaryZone(nextX, nextZ, 1.5);
          if (targetSanctuary) {
            // Repelled by sacred settlement ward barrier
            m.wardCooldown = (m.wardCooldown || 0) - delta;
            if (m.wardCooldown <= 0) {
              m.wardCooldown = 3.5;
              this.combatSystem.spawnFloatingText(m.group.position, `⛔ WARD BARRIER`, '#fbbf24');
            }
            m.targetPos.copy(m.spawnPos);
          } else {
            m.group.position.x = nextX;
            m.group.position.z = nextZ;
            m.group.position.y = getTerrainHeight(m.group.position.x, m.group.position.z);
          }
        } else {
          m.attackCooldown -= delta;
          if (m.attackCooldown <= 0) {
            m.attackCooldown = 2.0;

            if (targetEntity.type === 'guardian') {
              const dmg = Math.floor(m.attack * (0.8 + Math.random() * 0.4));
              targetEntity.guardian.currentHp = Math.max(0, targetEntity.guardian.currentHp - dmg);
              targetEntity.guardian.updateHpBar(targetEntity.guardian.currentHp, targetEntity.guardian.maxHp, targetEntity.guardian.level);
              this.combatSystem.spawnFloatingText(targetEntity.guardian.group.position, `-${dmg}`, '#f87171');
            } else {
              this.combatSystem.spawnFloatingText(playerPos, `-${m.attack}`, '#ef4444');
            }
          }
        }
      } else {
        // Idle wander around spawn area (prevent wandering into protected settlements)
        m.wanderTimer -= delta;
        if (m.wanderTimer <= 0) {
          m.wanderTimer = 3 + Math.random() * 5;
          let candidateTarget = null;
          for (let attempt = 0; attempt < 6; attempt++) {
            const rx = m.spawnPos.x + (Math.random() - 0.5) * 22;
            const rz = m.spawnPos.z + (Math.random() - 0.5) * 22;
            if (!isInSanctuaryZone(rx, rz, 3.0)) {
              candidateTarget = new THREE.Vector3(rx, getTerrainHeight(rx, rz), rz);
              break;
            }
          }
          if (candidateTarget) {
            m.targetPos.copy(candidateTarget);
          } else {
            m.targetPos.copy(m.spawnPos);
          }
        }

        const dx = m.targetPos.x - m.group.position.x;
        const dz = m.targetPos.z - m.group.position.z;
        if (Math.hypot(dx, dz) > 0.5) {
          const moveAngle = Math.atan2(dx, dz);
          m.group.rotation.y = moveAngle;
          const wanderX = m.group.position.x + Math.sin(moveAngle) * 1.5 * delta;
          const wanderZ = m.group.position.z + Math.cos(moveAngle) * 1.5 * delta;

          if (!isInSanctuaryZone(wanderX, wanderZ, 1.5)) {
            m.group.position.x = wanderX;
            m.group.position.z = wanderZ;
            m.group.position.y = getTerrainHeight(m.group.position.x, m.group.position.z);
          } else {
            // Turned around by sanctuary edge
            m.targetPos.copy(m.spawnPos);
          }
        }
      }

      // Absolute Settlement Depenetration Safeguard (Wild monsters strictly prohibited from settlements/villages)
      const insideSanctuary = isInSanctuaryZone(m.group.position.x, m.group.position.z, 0);
      if (insideSanctuary) {
        const dToCenter = Math.hypot(m.group.position.x - insideSanctuary.x, m.group.position.z - insideSanctuary.z);
        const minSafeDist = insideSanctuary.radius + 3.0;
        if (dToCenter < minSafeDist) {
          let pushX = m.group.position.x - insideSanctuary.x;
          let pushZ = m.group.position.z - insideSanctuary.z;
          if (dToCenter < 0.001) {
            pushX = 1;
            pushZ = 0;
          } else {
            pushX /= dToCenter;
            pushZ /= dToCenter;
          }
          m.group.position.x = insideSanctuary.x + pushX * minSafeDist;
          m.group.position.z = insideSanctuary.z + pushZ * minSafeDist;
          m.group.position.y = getTerrainHeight(m.group.position.x, m.group.position.z);
          m.targetPos.copy(m.spawnPos);
        }
      }

      // Wolf leg swing animation
      if (m.type === 'wolf' && m.modelParts.legs) {
        const legSwing = Math.sin(time * 8) * 0.4;
        m.modelParts.legs[0].rotation.x = legSwing;
        m.modelParts.legs[1].rotation.x = -legSwing;
        m.modelParts.legs[2].rotation.x = -legSwing;
        m.modelParts.legs[3].rotation.x = legSwing;
      }
    });

    // 3. Update Forest Guardians
    this.guardians.forEach(g => {
      let nearestMonster = null;
      let minMDist = 14.0;

      this.monsters.forEach(m => {
        if (m.isDead || m.isTamed) return;
        const d = Math.hypot(m.group.position.x - g.group.position.x, m.group.position.z - g.group.position.z);
        if (d < minMDist) {
          minMDist = d;
          nearestMonster = m;
        }
      });

      if (nearestMonster) {
        const angle = Math.atan2(nearestMonster.group.position.x - g.group.position.x, nearestMonster.group.position.z - g.group.position.z);
        g.group.rotation.y = angle;

        if (minMDist > 3.0) {
          g.group.position.x += Math.sin(angle) * 3.2 * delta;
          g.group.position.z += Math.cos(angle) * 3.2 * delta;
          g.group.position.y = getTerrainHeight(g.group.position.x, g.group.position.z);
        } else {
          g.attackCooldown -= delta;
          if (g.attackCooldown <= 0) {
            g.attackCooldown = 1.4;

            const dmg = Math.floor(g.attack * (0.85 + Math.random() * 0.3));
            nearestMonster.currentHp -= dmg;
            nearestMonster.updateHpBar(nearestMonster.currentHp, nearestMonster.maxHp, nearestMonster.level);

            this.combatSystem.spawnFloatingText(nearestMonster.group.position, `-${dmg}`, '#34d399');

            if (nearestMonster.currentHp <= 0) {
              this.killMonster(nearestMonster, g.name);
              g.xp += nearestMonster.xpValue;

              if (g.xp >= g.xpToNext) {
                g.xp -= g.xpToNext;
                g.level++;
                g.xpToNext = Math.floor(g.xpToNext * 1.6);
                g.maxHp = Math.floor(g.maxHp * 1.35);
                g.currentHp = g.maxHp;
                g.attack = Math.floor(g.attack * 1.35);

                g.updateHpBar(g.currentHp, g.maxHp, g.level);
                this.combatSystem.triggerLevelUp(g.group, g.name, g.level);
              }
            }
          }
        }
      }
    });
  }
}
