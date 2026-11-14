import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';
import { audioSystem } from './AudioSystem.js';

export const MYTHICAL_CREATURES_CONFIG = [
  {
    id: 'dragon_ignis',
    name: 'Ignis the Ancient Fire Dragon',
    title: 'The Scorched Calamity',
    type: 'fire_dragon',
    level: 8,
    maxHp: 1200,
    attack: 42,
    xpValue: 850,
    scaleColor: 0x991b1b,
    accentColor: 0xf59e0b,
    wingColor: 0x450a0a,
    glowColor: 0xf97316,
    element: 'fire',
    soarAltitude: 28.0,
    flySpeed: 14.0,
    diveSpeed: 20.0,
    spawnX: 40,
    spawnZ: 60,
    raidTargets: [
      { name: 'Central Crossroads Sanctuary Bridge', x: 0, z: 10, radius: 25 },
      { name: 'Oakhaven Agricultural Village', x: 105, z: 10, radius: 28 },
      { name: 'High Valoria Castle Town', x: 370, z: -250, radius: 35 }
    ]
  },
  {
    id: 'dragon_glacius',
    name: 'Glacius the Frost Wyrm',
    title: 'Sovereign of the Frozen Peaks',
    type: 'frost_wyrm',
    level: 7,
    maxHp: 950,
    attack: 38,
    xpValue: 700,
    scaleColor: 0x0284c7,
    accentColor: 0x38bdf8,
    wingColor: 0x0369a1,
    glowColor: 0x38bdf8,
    element: 'frost',
    soarAltitude: 32.0,
    flySpeed: 15.0,
    diveSpeed: 22.0,
    spawnX: -180,
    spawnZ: 140,
    raidTargets: [
      { name: 'Fernbrook Woodland Hamlet', x: -75, z: 110, radius: 26 },
      { name: 'High Valoria Castle Town Gates', x: 370, z: -230, radius: 30 },
      { name: 'Central Crossroads Sanctuary Bridge', x: 0, z: 10, radius: 25 }
    ]
  },
  {
    id: 'beast_chimera',
    name: 'Chimera the Abyssal Manticore',
    title: 'Three-Headed Abyssal Calamity',
    type: 'chimera',
    level: 7,
    maxHp: 880,
    attack: 36,
    xpValue: 650,
    scaleColor: 0x78350f,
    accentColor: 0x10b981,
    wingColor: 0x581c87,
    glowColor: 0xa855f7,
    element: 'venom',
    soarAltitude: 24.0,
    flySpeed: 13.0,
    diveSpeed: 18.0,
    spawnX: 180,
    spawnZ: -80,
    raidTargets: [
      { name: 'Town Market Bazaar', x: 205, z: -110, radius: 28 },
      { name: 'Central Crossroads Sanctuary Bridge', x: 0, z: 10, radius: 25 },
      { name: 'Oakhaven Agricultural Village', x: 105, z: 10, radius: 28 }
    ]
  }
];

export class MythicalDragonSystem {
  constructor(scene, combatSystem, monsterManager, gameApp) {
    this.scene = scene;
    this.combatSystem = combatSystem;
    this.monsterManager = monsterManager;
    this.gameApp = gameApp;

    this.creatures = [];
    this.activeRaid = null;
    this.raidTimer = 30.0; // Initial raid countdown in seconds
    this.particles = []; // Flame/frost breath particles

    this.initDOM();
    this.initCreatures();
  }

  initDOM() {
    // World Boss Top Health Bar Banner
    this.bossCard = document.createElement('div');
    this.bossCard.className = 'boss-hud-card';
    this.bossCard.style.display = 'none';
    this.bossCard.innerHTML = `
      <div class="boss-hud-header">
        <div class="boss-tag">
          <span class="boss-skull">🐲 WORLD BOSS RAID</span>
          <span class="boss-status" id="bossRaidStatus">Assaulting Central Crossroads!</span>
        </div>
        <div class="boss-level" id="bossLevelBadge">Lv. 8</div>
      </div>
      <div class="boss-name-row">
        <span class="boss-title-name" id="bossTitleName">Ignis the Ancient Fire Dragon</span>
        <span class="boss-hp-numeric" id="bossHpText">1200 / 1200 HP</span>
      </div>
      <div class="boss-hp-track">
        <div class="boss-hp-fill" id="bossHpFill" style="width: 100%;"></div>
      </div>
    `;
    document.body.appendChild(this.bossCard);

    // Realm Alert Banner (slides down on descent)
    this.alertBanner = document.createElement('div');
    this.alertBanner.className = 'dragon-alert-banner';
    this.alertBanner.style.display = 'none';
    document.body.appendChild(this.alertBanner);
  }

  initCreatures() {
    MYTHICAL_CREATURES_CONFIG.forEach(cfg => {
      const creature = this.buildCreature(cfg);
      this.creatures.push(creature);

      // Register with MonsterManager so standard attacks, combos, and air slashes hit the dragon!
      if (this.monsterManager && this.monsterManager.monsters) {
        this.monsterManager.monsters.push(creature);
      }
    });
  }

  buildCreature(cfg) {
    const group = new THREE.Group();
    const terrainY = getTerrainHeight(cfg.spawnX, cfg.spawnZ);
    group.position.set(cfg.spawnX, terrainY + cfg.soarAltitude, cfg.spawnZ);

    let modelParts = {};
    if (cfg.type === 'fire_dragon') {
      modelParts = this.buildFireDragonModel(group, cfg);
    } else if (cfg.type === 'frost_wyrm') {
      modelParts = this.buildFrostWyrmModel(group, cfg);
    } else {
      modelParts = this.buildChimeraModel(group, cfg);
    }

    // Elemental Glowing Point Light in chest
    const chestLight = new THREE.PointLight(cfg.glowColor, 1.6, 18);
    chestLight.position.set(0, 1.8, 0.4);
    group.add(chestLight);

    // 2D Canvas Health Bar
    const { sprite, updateHpBar } = this.monsterManager.createHpBarSprite(cfg.name, cfg.level, cfg.maxHp, cfg.maxHp);
    sprite.position.set(0, 5.2, 0);
    sprite.scale.set(3.4, 1.0, 1);
    group.add(sprite);

    this.scene.add(group);

    return {
      id: cfg.id,
      name: cfg.name,
      baseName: cfg.name,
      title: cfg.title,
      type: cfg.type,
      level: cfg.level,
      maxHp: cfg.maxHp,
      currentHp: cfg.maxHp,
      attack: cfg.attack,
      xpValue: cfg.xpValue,
      group: group,
      modelParts: modelParts,
      sprite: sprite,
      updateHpBar: updateHpBar,
      chestLight: chestLight,
      config: cfg,
      state: 'SOARING', // 'SOARING' | 'DESCENDING' | 'ASSAULTING' | 'RETREATING' | 'DEAD'
      stateTimer: 45.0 + Math.random() * 40.0,
      wingCycle: Math.random() * Math.PI * 2,
      soarAngle: Math.random() * Math.PI * 2,
      soarRadius: 55.0 + Math.random() * 30.0,
      soarCenter: new THREE.Vector3(cfg.spawnX, terrainY + cfg.soarAltitude, cfg.spawnZ),
      targetPos: new THREE.Vector3(cfg.spawnX, terrainY + cfg.soarAltitude, cfg.spawnZ),
      currentRaidTarget: null,
      attackCooldown: 0,
      breathCooldown: 2.5,
      isDead: false,
      isTamed: false,
      isMythicalDragon: true,
      isBoss: true,
      spawnPos: new THREE.Vector3(cfg.spawnX, terrainY, cfg.spawnZ),
      respawnTimer: 0
    };
  }

  // 1. Colossal Four-Legged Winged Fire Dragon Model (Ignis)
  buildFireDragonModel(group, cfg) {
    const scaleMat = new THREE.MeshLambertMaterial({ color: cfg.scaleColor, flatShading: true });
    const hornMat = new THREE.MeshLambertMaterial({ color: 0x1c1917, flatShading: true });
    const bellyMat = new THREE.MeshLambertMaterial({ color: 0xb45309, flatShading: true });
    const wingMat = new THREE.MeshLambertMaterial({ color: cfg.wingColor, flatShading: true, side: THREE.DoubleSide });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    const fireSpikeMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true });

    // Main Torso (Heavy muscular low-poly dragon chest)
    const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), scaleMat);
    torso.scale.set(1.1, 1.2, 2.4);
    torso.position.y = 1.8;
    torso.castShadow = true;
    group.add(torso);

    // Golden Underbelly Plates
    const belly = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 2.6), bellyMat);
    belly.position.set(0, 1.2, 0);
    group.add(belly);

    // Arching Serpentine Neck & Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.1, 2.6, 6), scaleMat);
    neck.position.set(0, 2.6, 2.0);
    neck.rotation.x = -0.75;
    group.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.8), scaleMat);
    head.position.set(0, 3.7, 3.2);
    group.add(head);

    // Snout & Lower Jaw
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 5), scaleMat);
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 3.5, 4.4);
    group.add(snout);

    // Dual Sweeping Great Horns
    [-0.45, 0.45].forEach(side => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.6, 4), hornMat);
      horn.position.set(side, 4.4, 2.6);
      horn.rotation.x = -0.8;
      horn.rotation.z = side * 0.3;
      group.add(horn);

      // Glowing Dragon Slit Eyes
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 4, 4), eyeMat);
      eye.position.set(side * 0.9, 3.8, 3.6);
      group.add(eye);
    });

    // 4 Muscular Dragon Legs with Sharp Talons
    const legs = [];
    [[-1.1, -1.2], [1.1, -1.2], [-1.1, 1.2], [1.1, 1.2]].forEach(([lx, lz], idx) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(lx, 1.4, lz);

      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.2, 0.65), scaleMat);
      upper.position.y = -0.5;
      legGroup.add(upper);

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 1.1), hornMat);
      foot.position.set(0, -1.2, 0.2);
      legGroup.add(foot);

      group.add(legGroup);
      legs.push(legGroup);
    });

    // Articulated Wings (Left & Right)
    const wings = [];
    [-1, 1].forEach(side => {
      const wingGroup = new THREE.Group();
      wingGroup.position.set(side * 1.3, 2.6, 0.4);

      // Main Wing Bone
      const wingBone = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 3.4, 5), scaleMat);
      wingBone.rotation.z = side * -Math.PI / 3;
      wingGroup.add(wingBone);

      // Secondary Spar
      const spar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.8, 4), scaleMat);
      spar.position.set(side * 2.2, 0.6, -0.6);
      spar.rotation.y = side * 0.35;
      wingGroup.add(spar);

      // Expansive Leathery Membrane
      const membrane = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.4), wingMat);
      membrane.position.set(side * 2.1, 0.4, 0);
      membrane.rotation.x = Math.PI / 2.3;
      membrane.rotation.y = side * 0.25;
      wingGroup.add(membrane);

      group.add(wingGroup);
      wings.push(wingGroup);
    });

    // Long Dragon Tail with Razor Spines
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.65, 3.8, 6), scaleMat);
    tail.rotation.x = -Math.PI / 2.2;
    tail.position.set(0, 1.6, -3.2);
    group.add(tail);

    // Triangular Dorsal Fin Spines along Spine
    for (let s = -2; s <= 2; s++) {
      const spine = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.9, 4), fireSpikeMat);
      spine.position.set(0, 3.1, s * 0.8);
      spine.rotation.x = -0.3;
      group.add(spine);
    }

    return { torso, head, wings, legs, tail };
  }

  // 2. Crystalline Frost Wyrm Model (Glacius)
  buildFrostWyrmModel(group, cfg) {
    const scaleMat = new THREE.MeshLambertMaterial({ color: cfg.scaleColor, flatShading: true });
    const crystalMat = new THREE.MeshLambertMaterial({ color: 0x7dd3fc, flatShading: true });
    const wingMat = new THREE.MeshLambertMaterial({ color: cfg.wingColor, flatShading: true, side: THREE.DoubleSide });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Aerodynamic Slender Wyrm Body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.4, 4.2, 6), scaleMat);
    body.rotation.x = Math.PI / 2.05;
    body.position.y = 1.8;
    body.castShadow = true;
    group.add(body);

    // Diamond Ice Shard Plates on back
    for (let i = -1.8; i <= 1.8; i += 0.8) {
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), crystalMat);
      shard.position.set(0, 2.7, i);
      shard.scale.set(0.6, 1.4, 0.6);
      group.add(shard);
    }

    // Long Elegant Neck & Dragon Head
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 2.8, 5), scaleMat);
    neck.position.set(0, 2.8, 2.6);
    neck.rotation.x = -0.65;
    group.add(neck);

    const head = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.8, 1.6), scaleMat);
    head.position.set(0, 3.8, 4.0);
    group.add(head);

    // Crystalline Antlers / Frost Horns
    [-0.38, 0.38].forEach(side => {
      const antler = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.8, 4), crystalMat);
      antler.position.set(side, 4.5, 3.6);
      antler.rotation.x = -0.7;
      antler.rotation.z = side * 0.45;
      group.add(antler);

      const eye = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.12), eyeMat);
      eye.position.set(side * 0.8, 3.9, 4.4);
      group.add(eye);
    });

    // Broad Translucent Ice Wings
    const wings = [];
    [-1, 1].forEach(side => {
      const wingGroup = new THREE.Group();
      wingGroup.position.set(side * 1.2, 2.4, 0.5);

      const spar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 3.8, 4), crystalMat);
      spar.rotation.z = side * -Math.PI / 2.8;
      wingGroup.add(spar);

      const membrane = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.6), wingMat);
      membrane.position.set(side * 2.2, 0.5, 0);
      membrane.rotation.x = Math.PI / 2.2;
      membrane.rotation.y = side * 0.3;
      wingGroup.add(membrane);

      group.add(wingGroup);
      wings.push(wingGroup);
    });

    // Serpentine Ice Tail
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.65, 4.4, 5), scaleMat);
    tail.rotation.x = -Math.PI / 2.15;
    tail.position.set(0, 1.6, -4.2);
    group.add(tail);

    return { torso: body, head, wings, tail };
  }

  // 3. Mythical Chimera Manticore Model (Leonine body + Dragon wings + Scorpion tail)
  buildChimeraModel(group, cfg) {
    const lionMat = new THREE.MeshLambertMaterial({ color: cfg.scaleColor, flatShading: true });
    const maneMat = new THREE.MeshLambertMaterial({ color: 0x451a03, flatShading: true });
    const hornMat = new THREE.MeshLambertMaterial({ color: 0x1f2937, flatShading: true });
    const wingMat = new THREE.MeshLambertMaterial({ color: cfg.wingColor, flatShading: true, side: THREE.DoubleSide });
    const stingMat = new THREE.MeshLambertMaterial({ color: cfg.accentColor, flatShading: true });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });

    // Muscular Lion Body
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, 2.8), lionMat);
    torso.position.y = 1.7;
    torso.castShadow = true;
    group.add(torso);

    // Thick Shaggy Lion Mane
    const mane = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), maneMat);
    mane.position.set(0, 2.4, 1.4);
    group.add(mane);

    // Lion Head with Snout
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.95, 1.2), lionMat);
    head.position.set(0, 2.6, 2.2);
    group.add(head);

    // Twin Curved Ram/Demon Horns
    [-0.5, 0.5].forEach(side => {
      const horn = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.15, 4, 8, Math.PI * 1.2), hornMat);
      horn.position.set(side * 0.9, 3.2, 1.8);
      horn.rotation.y = side * Math.PI / 2;
      group.add(horn);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 4, 4), eyeMat);
      eye.position.set(side * 0.7, 2.7, 2.7);
      group.add(eye);
    });

    // 4 Heavy Lion Paws
    const legs = [];
    [[-0.9, -1.0], [0.9, -1.0], [-0.9, 1.0], [0.9, 1.0]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.3, 0.55), lionMat);
      leg.position.set(lx, 0.65, lz);
      group.add(leg);
      legs.push(leg);
    });

    // Shadow Dragon Wings on flanks
    const wings = [];
    [-1, 1].forEach(side => {
      const wingGroup = new THREE.Group();
      wingGroup.position.set(side * 1.0, 2.4, 0.2);

      const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 2.8, 4), hornMat);
      bone.rotation.z = side * -Math.PI / 3;
      wingGroup.add(bone);

      const membrane = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.0), wingMat);
      membrane.position.set(side * 1.8, 0.4, 0);
      membrane.rotation.x = Math.PI / 2.3;
      wingGroup.add(membrane);

      group.add(wingGroup);
      wings.push(wingGroup);
    });

    // Arching Scorpion Stinger Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 2.0, -1.4);

    const tailArc = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.22, 5, 12, Math.PI * 0.9), lionMat);
    tailArc.rotation.y = Math.PI / 2;
    tailArc.rotation.z = -0.5;
    tailArc.position.set(0, 1.2, -0.6);
    tailGroup.add(tailArc);

    const barb = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 4), stingMat);
    barb.position.set(0, 2.4, 0.3);
    barb.rotation.x = Math.PI / 3;
    tailGroup.add(barb);

    group.add(tailGroup);

    return { torso, head, wings, legs, tail: tailGroup };
  }

  // --------------------------------------------------------------------------
  // RAID & ATTACK TRIGGERS
  // --------------------------------------------------------------------------

  /**
   * Spawns or teleports a Mythical Dragon directly to specified coordinates (used by God Mode Spawner).
   * Can spawn as an attacking World Boss or as an immediate Colossal Tamed Companion!
   */
  spawnDragonAt(dragonId, x, z, asTamed = false) {
    const creature = this.creatures.find(c => c.id === dragonId) || this.creatures[0];
    if (!creature) return null;

    creature.isDead = false;
    creature.currentHp = creature.maxHp;
    creature.group.visible = true;
    const y = getTerrainHeight(x, z);
    creature.group.position.set(x, y + 3.0, z);
    creature.updateHpBar(creature.currentHp, creature.maxHp, creature.level);

    if (asTamed) {
      this.tameDragon(creature);
    } else {
      creature.isTamed = false;
      creature.state = 'RAIDING';
      creature.raidTarget = { name: 'Player Arena', x, z };
      creature.raidDiveProgress = 0.5;
    }

    if (this.combatSystem) {
      this.combatSystem.spawnFloatingText(
        creature.group.position,
        `🐉 ${creature.name} Summoned!`,
        asTamed ? '#38bdf8' : '#ef4444'
      );
    }
    return creature;
  }

  /**
   * Inviolable Single-Pet Rule: Tames dragon as a flying guardian and dismisses any previous pet.
   */
  tameDragon(creature) {
    if (!creature) return;

    // Strict Single-Pet Invariant: release any pet from MonsterManager
    if (this.monsterManager && this.monsterManager.tamedMonster) {
      this.monsterManager.releaseTamedMonster();
    }

    // Untame any other dragon
    this.creatures.forEach(c => {
      if (c !== creature && c.isTamed) {
        c.isTamed = false;
        c.state = 'SOARING';
      }
    });

    creature.isTamed = true;
    creature.isDead = false;
    creature.state = 'TAMED';
    creature.group.visible = true;

    // Update companion card in HUD
    if (this.gameApp?.hud?.updateCompanionCard) {
      this.gameApp.hud.updateCompanionCard({
        name: creature.name,
        type: 'dragon',
        level: creature.level,
        currentHp: creature.currentHp,
        maxHp: creature.maxHp,
        attack: creature.attack,
        isTamed: true
      });
    }

    if (this.combatSystem) {
      this.combatSystem.spawnFloatingText(
        creature.group.position,
        `🐾 ${creature.name} is now your loyal Flying Companion!`,
        '#38bdf8',
        true
      );
    }
  }

  /**
   * Dismiss the tamed dragon back into the wild skies
   */
  releaseTamedDragon(creature = null) {
    const target = creature || this.creatures.find(c => c.isTamed);
    if (target) {
      target.isTamed = false;
      target.state = 'SOARING';
      target.group.position.y += 20;
    }
    if (this.gameApp?.hud?.updateCompanionCard) {
      this.gameApp.hud.updateCompanionCard(null);
    }
  }

  /**
   * Launch an on-demand or periodic Dragon Raid attack on a settlement / crossroads
   */
  triggerRaid(creatureId = null, targetName = null) {
    let creature = null;
    if (creatureId) {
      creature = this.creatures.find(c => c.id === creatureId && !c.isDead && !c.isTamed);
    }
    if (!creature) {
      // Pick any soaring creature
      const available = this.creatures.filter(c => !c.isDead && !c.isTamed && c.state === 'SOARING');
      if (available.length === 0) return;
      creature = available[Math.floor(Math.random() * available.length)];
    }

    // Pick raid target
    const targets = creature.config.raidTargets;
    let chosenTarget = null;
    if (targetName) {
      chosenTarget = targets.find(t => t.name.toLowerCase().includes(targetName.toLowerCase()));
    }
    if (!chosenTarget) {
      chosenTarget = targets[Math.floor(Math.random() * targets.length)];
    }

    creature.currentRaidTarget = chosenTarget;
    creature.state = 'DESCENDING';
    creature.stateTimer = 55.0; // Assault duration
    this.activeRaid = { creature, target: chosenTarget };

    // Play deafening draconic roar
    audioSystem.playDragonRoar();

    // Show realm alert banner
    this.showRealmAlertBanner(creature, chosenTarget);

    // Update Boss HUD Card
    this.updateBossCard(creature, chosenTarget);
  }

  showRealmAlertBanner(creature, target) {
    if (!this.alertBanner) return;
    this.alertBanner.innerHTML = `
      <div class="alert-icon">⚠️</div>
      <div class="alert-text-group">
        <span class="alert-heading">MYTHICAL DRAGON ATTACK!</span>
        <span class="alert-desc">${creature.name} is descending upon ${target.name}!</span>
      </div>
    `;
    this.alertBanner.style.display = 'flex';
    this.alertBanner.classList.add('visible');

    clearTimeout(this._alertTimer);
    this._alertTimer = setTimeout(() => {
      this.alertBanner.classList.remove('visible');
      setTimeout(() => {
        this.alertBanner.style.display = 'none';
      }, 500);
    }, 5500);
  }

  updateBossCard(creature, target = null) {
    if (!this.bossCard) return;

    if (!creature || creature.isDead) {
      this.bossCard.style.display = 'none';
      return;
    }

    this.bossCard.style.display = 'flex';
    const nameEl = this.bossCard.querySelector('#bossTitleName');
    const levelEl = this.bossCard.querySelector('#bossLevelBadge');
    const statusEl = this.bossCard.querySelector('#bossRaidStatus');
    const hpText = this.bossCard.querySelector('#bossHpText');
    const hpFill = this.bossCard.querySelector('#bossHpFill');

    if (nameEl) nameEl.textContent = creature.name;
    if (levelEl) levelEl.textContent = `Lv. ${creature.level}`;
    if (statusEl) {
      const tgtName = target ? target.name : (creature.currentRaidTarget ? creature.currentRaidTarget.name : 'The Realm');
      statusEl.textContent = `Assaulting ${tgtName}!`;
    }
    if (hpText) hpText.textContent = `${creature.currentHp} / ${creature.maxHp} HP`;
    if (hpFill) {
      const pct = Math.max(0, Math.min(100, (creature.currentHp / creature.maxHp) * 100));
      hpFill.style.width = `${pct}%`;
    }
  }

  // --------------------------------------------------------------------------
  // PARTICLES & DRAGON BREATH ATTACK
  // --------------------------------------------------------------------------

  spawnDragonBreath(origin, targetPos, element = 'fire') {
    audioSystem.playDragonBreath();

    const color = element === 'fire' ? 0xf97316 : (element === 'frost' ? 0x38bdf8 : 0x10b981);
    const count = 16;

    const dir = new THREE.Vector3().subVectors(targetPos, origin).normalize();

    for (let i = 0; i < count; i++) {
      const pGeom = new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.35, 0);
      const pMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.95
      });
      const pMesh = new THREE.Mesh(pGeom, pMat);
      pMesh.position.copy(origin);
      this.scene.add(pMesh);

      // Conical cone spread
      const spreadX = (Math.random() - 0.5) * 0.45;
      const spreadY = (Math.random() - 0.5) * 0.35;
      const spreadZ = (Math.random() - 0.5) * 0.45;

      const vel = new THREE.Vector3(
        dir.x + spreadX,
        dir.y + spreadY,
        dir.z + spreadZ
      ).normalize().multiplyScalar(18.0 + Math.random() * 8.0);

      this.particles.push({
        mesh: pMesh,
        mat: pMat,
        vel: vel,
        life: 0,
        maxLife: 0.85 + Math.random() * 0.35
      });
    }

    // Damage entity at target
    const dmg = Math.floor(28 + Math.random() * 18);
    this.combatSystem.spawnFloatingText(targetPos, `${element === 'fire' ? '🔥' : (element === 'frost' ? '❄️' : '☣️')} -${dmg}`, color, true);
  }

  // --------------------------------------------------------------------------
  // UPDATE LOOP (Flight Physics, Raid Assaults, Wing Beats)
  // --------------------------------------------------------------------------

  update(delta, playerPos) {
    const time = performance.now() * 0.002;

    // Countdown periodic raid attacks
    this.raidTimer -= delta;
    if (this.raidTimer <= 0) {
      this.raidTimer = 180.0 + Math.random() * 120.0; // Raid every 3-5 minutes automatically
      this.triggerRaid();
    }

    // Update creatures
    this.creatures.forEach(c => {
      if (c.isDead) {
        c.respawnTimer -= delta;
        if (c.respawnTimer <= 0) {
          c.isDead = false;
          c.isTamed = false;
          c.currentHp = c.maxHp;
          c.state = 'SOARING';
          c.stateTimer = 60.0;
          c.group.position.set(c.spawnPos.x, c.spawnPos.y + c.config.soarAltitude, c.spawnPos.z);
          c.group.rotation.set(0, 0, 0);
          c.group.visible = true;
          c.updateHpBar(c.currentHp, c.maxHp, c.level, false);
        }
        return;
      }

      // Check death
      if (c.currentHp <= 0 && !c.isDead) {
        this.killDragon(c);
        return;
      }

      // Animate articulated flapping wings
      c.wingCycle += delta * (c.state === 'DESCENDING' ? 8.0 : 4.5);
      const wingFlap = Math.sin(c.wingCycle);
      if (c.modelParts && c.modelParts.wings) {
        c.modelParts.wings.forEach((wingGroup, sideIdx) => {
          const side = sideIdx === 0 ? -1 : 1;
          wingGroup.rotation.z = side * wingFlap * 0.45;
        });
      }

      // State Machine
      if (c.isTamed) {
        this.updateTamedDragon(c, delta, playerPos);
      } else if (c.state === 'SOARING') {
        this.updateSoaring(c, delta);
      } else if (c.state === 'DESCENDING') {
        this.updateDescending(c, delta);
      } else if (c.state === 'ASSAULTING') {
        this.updateAssaulting(c, delta, playerPos);
      } else if (c.state === 'RETREATING') {
        this.updateRetreating(c, delta);
      }

      // Proximity check to update Boss HUD card
      if (playerPos) {
        const dist = Math.hypot(c.group.position.x - playerPos.x, c.group.position.z - playerPos.z);
        if (dist < 75.0 && (c.state === 'ASSAULTING' || c.state === 'DESCENDING')) {
          this.updateBossCard(c);
        } else if (this.activeRaid && this.activeRaid.creature === c && dist > 110.0) {
          // Player too far from raid
        }
      }
    });

    // Update breath particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      p.mesh.position.addScaledVector(p.vel, delta);
      p.mesh.scale.multiplyScalar(1.0 + delta * 1.5);
      p.mat.opacity = Math.max(0, 1.0 - (p.life / p.maxLife));

      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mat.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  updateSoaring(c, delta) {
    c.soarAngle += (c.config.flySpeed / c.soarRadius) * delta * 0.6;
    const targetX = c.soarCenter.x + Math.sin(c.soarAngle) * c.soarRadius;
    const targetZ = c.soarCenter.z + Math.cos(c.soarAngle) * c.soarRadius;
    const groundY = getTerrainHeight(targetX, targetZ);
    const targetY = groundY + c.config.soarAltitude + Math.sin(c.soarAngle * 2) * 3.0;

    const dx = targetX - c.group.position.x;
    const dz = targetZ - c.group.position.z;
    const heading = Math.atan2(dx, dz);

    c.group.position.x += (targetX - c.group.position.x) * Math.min(1.0, delta * 3.0);
    c.group.position.z += (targetZ - c.group.position.z) * Math.min(1.0, delta * 3.0);
    c.group.position.y += (targetY - c.group.position.y) * Math.min(1.0, delta * 2.0);
    c.group.rotation.y = heading;
    c.group.rotation.z = Math.sin(c.soarAngle) * 0.15; // Banking into turns
  }

  updateDescending(c, delta) {
    if (!c.currentRaidTarget) {
      c.state = 'SOARING';
      return;
    }

    const tgt = c.currentRaidTarget;
    const groundY = getTerrainHeight(tgt.x, tgt.z);
    const targetAltitude = groundY + 3.2; // Hover low over settlement

    const dx = tgt.x - c.group.position.x;
    const dz = tgt.z - c.group.position.z;
    const dy = targetAltitude - c.group.position.y;
    const distHoriz = Math.hypot(dx, dz);

    const angle = Math.atan2(dx, dz);
    c.group.rotation.y = angle;
    c.group.rotation.x = 0.25; // Dive tilt down

    c.group.position.x += Math.sin(angle) * c.config.diveSpeed * delta;
    c.group.position.z += Math.cos(angle) * c.config.diveSpeed * delta;
    c.group.position.y += dy * Math.min(1.0, delta * 2.5);

    if (distHoriz < 18.0 && Math.abs(c.group.position.y - targetAltitude) < 4.0) {
      c.state = 'ASSAULTING';
      c.group.rotation.x = 0;
      this.combatSystem.spawnFloatingText(c.group.position, `💥 DRAGON IMPACT!`, c.config.accentColor, true);
    }
  }

  updateAssaulting(c, delta, playerPos) {
    c.stateTimer -= delta;
    if (c.stateTimer <= 0) {
      c.state = 'RETREATING';
      c.stateTimer = 18.0;
      this.combatSystem.spawnFloatingText(c.group.position, `💨 Dragon Taking Flight!`, '#94a3b8');
      return;
    }

    const tgt = c.currentRaidTarget;
    const groundY = getTerrainHeight(c.group.position.x, c.group.position.z);
    c.group.position.y = THREE.MathUtils.lerp(c.group.position.y, groundY + 2.5, delta * 3.0);

    // Circle and assault inside raid target area
    const time = performance.now() * 0.001;
    const circleRadius = 14.0;
    const raidCenter = tgt ? tgt : { x: 0, z: 10 };
    const raidX = raidCenter.x + Math.sin(time * 0.8) * circleRadius;
    const raidZ = raidCenter.z + Math.cos(time * 0.8) * circleRadius;

    const dx = raidX - c.group.position.x;
    const dz = raidZ - c.group.position.z;
    const heading = Math.atan2(dx, dz);
    c.group.rotation.y = heading;

    c.group.position.x += Math.sin(heading) * 6.0 * delta;
    c.group.position.z += Math.cos(heading) * 6.0 * delta;

    // Periodic breath attack on nearby entities / player
    c.breathCooldown -= delta;
    if (c.breathCooldown <= 0) {
      c.breathCooldown = 3.5 + Math.random() * 2.0;

      let breathTarget = playerPos;
      if (playerPos && Math.hypot(playerPos.x - c.group.position.x, playerPos.z - c.group.position.z) < 28.0) {
        breathTarget = playerPos;
      } else {
        // Target village center
        breathTarget = new THREE.Vector3(raidCenter.x, groundY, raidCenter.z);
      }

      this.spawnDragonBreath(
        new THREE.Vector3(c.group.position.x, c.group.position.y + 2.0, c.group.position.z),
        breathTarget,
        c.config.element
      );
    }

    // Retaliation from village knights & guards
    if (this.gameApp && this.gameApp.traffic && this.gameApp.traffic.patrols) {
      this.gameApp.traffic.patrols.forEach(p => {
        if (!p.group) return;
        const pDist = Math.hypot(p.group.position.x - c.group.position.x, p.group.position.z - c.group.position.z);
        if (pDist < 12.0) {
          // Knights attack dragon!
          c.currentHp -= Math.floor(14 * delta);
          c.updateHpBar(c.currentHp, c.maxHp, c.level);
        }
      });
    }
  }

  updateRetreating(c, delta) {
    const groundY = getTerrainHeight(c.group.position.x, c.group.position.z);
    const targetY = groundY + c.config.soarAltitude;

    c.group.position.y += (targetY - c.group.position.y) * Math.min(1.0, delta * 2.0);
    c.group.position.x += Math.sin(c.group.rotation.y) * c.config.flySpeed * delta;
    c.group.position.z += Math.cos(c.group.rotation.y) * c.config.flySpeed * delta;

    if (c.group.position.y >= targetY - 3.0) {
      c.state = 'SOARING';
      c.currentRaidTarget = null;
      if (this.activeRaid && this.activeRaid.creature === c) {
        this.activeRaid = null;
        this.bossCard.style.display = 'none';
      }
    }
  }

  updateTamedDragon(c, delta, playerPos) {
    if (!playerPos) return;

    // Colossal Flying Dragon Companion: Soars gracefully 10m above player!
    const groundY = getTerrainHeight(playerPos.x, playerPos.z);
    const hoverY = groundY + 11.0;

    const dx = playerPos.x - c.group.position.x;
    const dz = playerPos.z - c.group.position.z;
    const distToPlayer = Math.hypot(dx, dz);

    if (distToPlayer > 60.0) {
      // Teleport if player fast-travels
      c.group.position.set(playerPos.x, hoverY, playerPos.z);
    } else if (distToPlayer > 4.0) {
      const angle = Math.atan2(dx, dz);
      c.group.rotation.y = angle;

      const speed = distToPlayer > 18.0 ? 18.0 : 9.0;
      c.group.position.x += Math.sin(angle) * speed * delta;
      c.group.position.z += Math.cos(angle) * speed * delta;
      c.group.position.y = THREE.MathUtils.lerp(c.group.position.y, hoverY, delta * 3.0);
    }

    // Tamed Dragon protects master by blasting hostile monsters from above!
    c.breathCooldown -= delta;
    if (c.breathCooldown <= 0 && this.monsterManager) {
      c.breathCooldown = 3.2;
      let targetHostile = null;
      let minHostileDist = 24.0;

      this.monsterManager.monsters.forEach(m => {
        if (m === c || m.isDead || m.isTamed) return;
        const d = Math.hypot(m.group.position.x - playerPos.x, m.group.position.z - playerPos.z);
        if (d < minHostileDist) {
          minHostileDist = d;
          targetHostile = m;
        }
      });

      if (targetHostile) {
        this.spawnDragonBreath(
          new THREE.Vector3(c.group.position.x, c.group.position.y - 1.0, c.group.position.z),
          targetHostile.group.position,
          c.config.element
        );
        targetHostile.currentHp -= Math.floor(c.attack * 1.5);
        targetHostile.updateHpBar(targetHostile.currentHp, targetHostile.maxHp, targetHostile.level);
        if (targetHostile.currentHp <= 0) {
          this.monsterManager.killMonster(targetHostile, c.name);
        }
      }
    }
  }

  killDragon(creature) {
    creature.isDead = true;
    creature.currentHp = 0;
    creature.group.rotation.z = Math.PI / 2;
    const groundY = getTerrainHeight(creature.group.position.x, creature.group.position.z);
    creature.group.position.y = groundY + 0.5;

    // Victory audio fanfare & XP
    audioSystem.playDoorChime(true);
    this.combatSystem.spawnFloatingText(creature.group.position, `👑 DRAGON SLAIN! +${creature.xpValue} XP!`, '#fbbf24', true);

    if (this.gameApp && this.gameApp.player) {
      this.gameApp.player.gainXP(creature.xpValue, (lvl) => {
        this.combatSystem.triggerLevelUp(this.gameApp.player.group, this.gameApp.player.characterId, lvl);
      });
      this.gameApp.hud.updateLevel(this.gameApp.player.level, this.gameApp.player.xp, this.gameApp.player.xpToNext);
    }

    if (this.bossCard) {
      this.bossCard.style.display = 'none';
    }

    setTimeout(() => {
      creature.group.visible = false;
    }, 2500);

    creature.respawnTimer = 90.0; // Respawns after 90 seconds
  }
}
