import * as THREE from 'three';
import { audioSystem } from './AudioSystem.js';
import { getTerrainHeight } from '../utils/math.js';

// Lore-rich signatures for all 6 characters' magic swords
export const SWORD_CONFIGS = {
  hero: {
    name: 'Dawnblade of Light',
    sound: 'celestial',
    color: 0x38bdf8,
    runeColor: 0x93c5fd,
    accentColor: 0xfacc15,
    bladeScale: 1.0,
    comboNames: ['Dawn Crescent Slash', 'Radiant Cross Cleave', 'Solar Flare Tempest Nova']
  },
  princess: {
    name: 'Starlight Rapier',
    sound: 'celestial',
    color: 0x818cf8,
    runeColor: 0xc7d2fe,
    accentColor: 0x38bdf8,
    bladeScale: 0.85,
    comboNames: ['Starlight Thrust Arc', 'Celestial Cross Cleave', 'Astral Supernova']
  },
  demonking: {
    name: 'Obsidian Nether Cleaver',
    sound: 'nether',
    color: 0xef4444,
    runeColor: 0xf87171,
    accentColor: 0x7f1d1d,
    bladeScale: 1.35,
    comboNames: ['Nether Hellfire Slash', 'Brimstone X-Cleave', 'Abyssal Magma Nova']
  },
  op_side: {
    name: 'Shadow Muramasa Katana',
    sound: 'blade',
    color: 0xa855f7,
    runeColor: 0xd8b4fe,
    accentColor: 0x38bdf8,
    bladeScale: 0.95,
    comboNames: ['Void Iaijutsu Slash', 'Phantom Cross Wave', 'Dimensional Rift Nova']
  },
  king: {
    name: 'Sovereign Royal Claymore',
    sound: 'blade',
    color: 0xf59e0b,
    runeColor: 0xfde047,
    accentColor: 0xd97706,
    bladeScale: 1.25,
    comboNames: ['Crown Cleave Arc', 'Imperial Cross Verdict', 'Sovereign Shockwave Nova']
  },
  retired_hero: {
    name: 'Vanguard Ancient Broadsword',
    sound: 'forge',
    color: 0x10b981,
    runeColor: 0x6ee7b7,
    accentColor: 0x059669,
    bladeScale: 1.1,
    comboNames: ['Gale Razor Slash', 'Mountain Cross Cleave', 'Emerald Tempest Nova']
  }
};

export class MagicSwordSystem {
  constructor(scene, combatSystem, monsterManager) {
    this.scene = scene;
    this.combatSystem = combatSystem;
    this.monsterManager = monsterManager;

    this.projectiles = []; // Active flying blade wave meshes
    this.impactSparks = []; // Particle sparks on monster hit
  }

  getSwordConfig(charId) {
    return SWORD_CONFIGS[charId] || SWORD_CONFIGS.hero;
  }

  /**
   * Cast a Magic Sword Skill based on character and combo step
   */
  castSwordSkill(player, comboStep = 1) {
    const charId = player.characterId || 'hero';
    const swordCfg = this.getSwordConfig(charId);
    const pos = player.position;
    const rotY = player.currentRotation;

    // Forward direction from character rotation
    const forward = new THREE.Vector3(Math.sin(rotY), 0, Math.cos(rotY)).normalize();
    const right = new THREE.Vector3(Math.cos(rotY), 0, -Math.sin(rotY)).normalize();

    // Play synthesized weapon whoosh and magic sound
    audioSystem.playSwordSwing(comboStep);
    audioSystem.playBladeWave(swordCfg.sound);

    if (comboStep === 3) {
      // -------------------------------------------------------------
      // COMBO 3: 360° WHIRLWIND TEMPEST NOVA
      // Expands radially outward, hitting all nearby monsters
      // -------------------------------------------------------------
      this.spawnWhirlwindNova(pos, forward, swordCfg, player);
    } else if (comboStep === 2) {
      // -------------------------------------------------------------
      // COMBO 2: CROSS NETHER ARC CLEAVE (Dual intersecting X-wave)
      // -------------------------------------------------------------
      this.spawnCrossCleaveWave(pos, forward, right, swordCfg, player);
    } else {
      // -------------------------------------------------------------
      // COMBO 1: HORIZONTAL CRESCENT BLADE WAVE
      // -------------------------------------------------------------
      this.spawnCrescentWave(pos, forward, right, swordCfg, player);
    }
  }

  // Build a low-poly glowing crescent arc mesh
  createCrescentMesh(color, runeColor, width = 3.2, radius = 2.0) {
    const group = new THREE.Group();

    // Main crescent ribbon arc
    const arcGeom = new THREE.RingGeometry(radius * 0.7, radius * 1.15, 18, 1, -Math.PI * 0.38, Math.PI * 0.76);
    arcGeom.rotateX(-Math.PI / 2); // Lay horizontal

    const arcMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.88,
      side: THREE.DoubleSide
    });
    const arcMesh = new THREE.Mesh(arcGeom, arcMat);
    group.add(arcMesh);

    // Inner bright core blade line
    const coreGeom = new THREE.RingGeometry(radius * 0.88, radius * 0.98, 18, 1, -Math.PI * 0.34, Math.PI * 0.68);
    coreGeom.rotateX(-Math.PI / 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: runeColor,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreMesh.position.y += 0.02;
    group.add(coreMesh);

    return { group, arcMat, coreMat };
  }

  spawnCrescentWave(pos, forward, right, swordCfg, player) {
    const spawnPos = pos.clone().addScaledVector(forward, 1.4);
    spawnPos.y += 1.25;

    const { group, arcMat, coreMat } = this.createCrescentMesh(swordCfg.color, swordCfg.runeColor, 3.2, 2.2);
    group.position.copy(spawnPos);
    group.rotation.y = player.currentRotation;

    this.scene.add(group);

    const speed = 28.0;
    const velocity = forward.clone().multiplyScalar(speed);

    this.projectiles.push({
      type: 'crescent',
      mesh: group,
      materials: [arcMat, coreMat],
      pos: spawnPos,
      velocity: velocity,
      forward: forward,
      distTraveled: 0,
      maxDist: 18.0,
      hitRadius: 2.2,
      damageMult: 1.15,
      comboStep: 1,
      swordCfg: swordCfg,
      player: player,
      hitMonsters: new Set()
    });
  }

  spawnCrossCleaveWave(pos, forward, right, swordCfg, player) {
    const spawnPos = pos.clone().addScaledVector(forward, 1.4);
    spawnPos.y += 1.35;

    const group = new THREE.Group();
    group.position.copy(spawnPos);
    group.rotation.y = player.currentRotation;

    // Wave 1 tilted +32 deg
    const wave1 = this.createCrescentMesh(swordCfg.color, swordCfg.runeColor, 3.6, 2.4);
    wave1.group.rotation.z = 0.55;
    group.add(wave1.group);

    // Wave 2 tilted -32 deg (Intersecting X)
    const wave2 = this.createCrescentMesh(swordCfg.color, swordCfg.runeColor, 3.6, 2.4);
    wave2.group.rotation.z = -0.55;
    group.add(wave2.group);

    this.scene.add(group);

    const speed = 30.0;
    const velocity = forward.clone().multiplyScalar(speed);

    this.projectiles.push({
      type: 'cross',
      mesh: group,
      materials: [...wave1.arcMat ? [wave1.arcMat, wave1.coreMat, wave2.arcMat, wave2.coreMat] : []],
      pos: spawnPos,
      velocity: velocity,
      forward: forward,
      distTraveled: 0,
      maxDist: 21.0,
      hitRadius: 2.8,
      damageMult: 1.5,
      comboStep: 2,
      swordCfg: swordCfg,
      player: player,
      hitMonsters: new Set()
    });
  }

  spawnWhirlwindNova(pos, forward, swordCfg, player) {
    const spawnPos = pos.clone();
    spawnPos.y += 0.85;

    const group = new THREE.Group();
    group.position.copy(spawnPos);

    // Expanding 360 ring disc
    const ringGeom = new THREE.RingGeometry(0.8, 1.8, 32);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: swordCfg.color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    group.add(ringMesh);

    // Inner bright ring core
    const coreGeom = new THREE.RingGeometry(0.9, 1.3, 32);
    coreGeom.rotateX(-Math.PI / 2);
    const coreMat = new THREE.MeshBasicMaterial({
      color: swordCfg.runeColor,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreMesh.position.y += 0.03;
    group.add(coreMesh);

    this.scene.add(group);

    this.projectiles.push({
      type: 'nova',
      mesh: group,
      materials: [ringMat, coreMat],
      pos: spawnPos,
      radius: 1.4,
      maxRadius: 9.0,
      expandSpeed: 16.0,
      damageMult: 2.2,
      comboStep: 3,
      swordCfg: swordCfg,
      player: player,
      hitMonsters: new Set(),
      life: 0,
      maxLife: 0.55
    });
  }

  // Create bursting sparks at hit position
  spawnHitSparks(pos, color) {
    const sparkCount = 6;
    for (let i = 0; i < sparkCount; i++) {
      const geom = new THREE.TetrahedronGeometry(0.18);
      const mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.95
      });
      const spark = new THREE.Mesh(geom, mat);
      spark.position.copy(pos);
      spark.position.y += 0.5 + Math.random() * 0.8;

      const angle = (Math.PI * 2 / sparkCount) * i + Math.random() * 0.5;
      const speed = 4.0 + Math.random() * 3.0;
      const vel = new THREE.Vector3(
        Math.cos(angle) * speed,
        2.5 + Math.random() * 3.0,
        Math.sin(angle) * speed
      );

      this.scene.add(spark);
      this.impactSparks.push({ mesh: spark, mat: mat, vel: vel, life: 0, maxLife: 0.4 });
    }
  }

  update(delta) {
    // 1. Update active Magic Blade Wave projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];

      if (p.type === 'nova') {
        // Nova expands horizontally
        p.life += delta;
        p.radius += p.expandSpeed * delta;
        const scale = p.radius / 1.4;
        p.mesh.scale.set(scale, 1, scale);

        // Fade out
        const fade = Math.max(0, 1.0 - (p.life / p.maxLife));
        p.materials.forEach(m => m.opacity = fade * 0.9);

        // Hit check all monsters within expanding circle radius
        this.checkRadialHit(p);

        if (p.life >= p.maxLife || p.radius >= p.maxRadius) {
          this.disposeProjectile(p);
          this.projectiles.splice(i, 1);
        }
      } else {
        // Crescent & Cross waves travel forward
        const stepDist = p.velocity.length() * delta;
        p.distTraveled += stepDist;
        p.mesh.position.addScaledVector(p.velocity, delta);

        // Ground elevation contouring
        const groundY = getTerrainHeight(p.mesh.position.x, p.mesh.position.z);
        if (p.mesh.position.y < groundY + 0.5) {
          p.mesh.position.y = groundY + 0.8;
        }

        // Fade slightly towards end of flight
        const lifeRatio = p.distTraveled / p.maxDist;
        if (lifeRatio > 0.65) {
          const fade = 1.0 - ((lifeRatio - 0.65) / 0.35);
          p.materials.forEach(m => m.opacity = Math.max(0, fade * 0.9));
        }

        // Check monsters in front of projectile
        this.checkLinearHit(p);

        if (p.distTraveled >= p.maxDist) {
          this.disposeProjectile(p);
          this.projectiles.splice(i, 1);
        }
      }
    }

    // 2. Update particle impact sparks
    for (let i = this.impactSparks.length - 1; i >= 0; i--) {
      const s = this.impactSparks[i];
      s.life += delta;
      s.mesh.position.addScaledVector(s.vel, delta);
      s.vel.y -= 14.0 * delta; // Gravity
      s.mesh.rotation.x += delta * 6.0;
      s.mesh.rotation.y += delta * 8.0;

      s.mat.opacity = Math.max(0, 1.0 - (s.life / s.maxLife));

      if (s.life >= s.maxLife) {
        this.scene.remove(s.mesh);
        s.mesh.geometry.dispose();
        s.mat.dispose();
        this.impactSparks.splice(i, 1);
      }
    }
  }

  checkLinearHit(p) {
    if (!this.monsterManager || !this.monsterManager.monsters) return;

    const wavePos = p.mesh.position;
    const monsters = this.monsterManager.monsters;

    for (let i = 0; i < monsters.length; i++) {
      const m = monsters[i];
      if (m.isDead || m.isTamed) continue;
      if (p.hitMonsters.has(m)) continue; // Already hit by this wave

      const mPos = m.group.position;
      const dist = Math.hypot(mPos.x - wavePos.x, mPos.z - wavePos.z);

      if (dist <= p.hitRadius + 1.2) {
        p.hitMonsters.add(m);
        this.applyMonsterDamage(m, p, false);
      }
    }
  }

  checkRadialHit(p) {
    if (!this.monsterManager || !this.monsterManager.monsters) return;

    const center = p.mesh.position;
    const monsters = this.monsterManager.monsters;

    for (let i = 0; i < monsters.length; i++) {
      const m = monsters[i];
      if (m.isDead || m.isTamed) continue;
      if (p.hitMonsters.has(m)) continue;

      const mPos = m.group.position;
      const dist = Math.hypot(mPos.x - center.x, mPos.z - center.z);

      if (dist <= p.radius + 1.2) {
        p.hitMonsters.add(m);
        this.applyMonsterDamage(m, p, true);
      }
    }
  }

  applyMonsterDamage(monster, p, isNova = false) {
    const isCrit = Math.random() < 0.32;
    const baseAtk = p.player.attackPower || 28;
    const critMult = isCrit ? 1.6 : 1.0;
    const damage = Math.floor(baseAtk * p.damageMult * critMult * (0.9 + Math.random() * 0.25));

    // Deal damage
    monster.currentHp = Math.max(0, monster.currentHp - damage);
    monster.updateHpBar(monster.currentHp, monster.maxHp, monster.level);

    // Audio impact
    audioSystem.playBladeImpact(isCrit);

    // Visual sparks
    this.spawnHitSparks(monster.group.position, p.swordCfg.color);

    // Knockback
    if (p.forward) {
      monster.group.position.x += p.forward.x * (isCrit ? 1.4 : 0.8);
      monster.group.position.z += p.forward.z * (isCrit ? 1.4 : 0.8);
    } else {
      const angle = Math.atan2(monster.group.position.x - p.pos.x, monster.group.position.z - p.pos.z);
      monster.group.position.x += Math.sin(angle) * 1.5;
      monster.group.position.z += Math.cos(angle) * 1.5;
    }

    // Floating RPG damage text
    const label = isNova
      ? (isCrit ? `🌀 NOVA CRIT -${damage}!` : `🌀 NOVA -${damage}`)
      : (isCrit ? `⚡ CLEAVE CRIT -${damage}!` : `✨ CLEAVE -${damage}`);

    this.combatSystem.spawnFloatingText(
      monster.group.position,
      label,
      isCrit ? '#fbbf24' : '#' + p.swordCfg.color.toString(16).padStart(6, '0'),
      isCrit
    );

    // Handle monster kill & player XP
    if (monster.currentHp <= 0) {
      const charName = p.player.getCharacterConfig()?.name || 'Hero';
      this.monsterManager.killMonster(monster, `${charName}'s ${p.swordCfg.name}`);

      if (monster.xpValue > 0) {
        p.player.gainXP(monster.xpValue, (newLevel) => {
          this.combatSystem.triggerLevelUp(p.player.group, p.player.characterId, newLevel);
        });
      }
    }
  }

  disposeProjectile(p) {
    if (p.mesh) {
      this.scene.remove(p.mesh);
      p.mesh.traverse(child => {
        if (child.geometry) child.geometry.dispose();
      });
    }
    if (p.materials) {
      p.materials.forEach(m => m.dispose && m.dispose());
    }
  }
}

