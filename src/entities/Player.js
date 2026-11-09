import * as THREE from 'three';
import { getTerrainHeight, getDistToImperialRoad } from '../utils/math.js';
import { audioSystem } from '../systems/AudioSystem.js';
import { resolveCircleCollision } from '../utils/collision.js';
import { CharacterFactory } from './CharacterFactory.js';
import { getCharacterById } from '../config/characters.js';

export class Player {
  constructor(scene, startPos = new THREE.Vector3(0, 0.5, 12)) {
    this.scene = scene;
    this.position = startPos.clone();
    this.targetRotation = 0;
    this.currentRotation = 0;
    this.radius = 0.55; // Body collision radius
    this.characterId = 'hero';

    // Movement speeds
    this.walkSpeed = 12.0;
    this.runSpeed = 22.0;

    // State
    this.isMoving = false;
    this.isSprinting = false;
    this.isInVehicle = false;
    this.walkCycle = 0;

    // RPG Combat & Leveling Stats
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 80;
    this.maxHp = 100;
    this.currentHp = 100;
    this.attackPower = 28;
    this.attackAnimTimer = 0;
    this.attackAnimDuration = 0.35;
    this.comboStep = 1; // 1: Crescent, 2: Cross Arc, 3: Whirlwind Nova
    this.comboResetTimer = 0;
    this.magicSword = null;
    this.swordRuneMats = [];

    this.colliders = [];
    this.clickTarget = null;
    this.animNodes = {};

    this.group = new THREE.Group();
    this.group.position.copy(this.position);
    this.scene.add(this.group);

    this.modelContainer = new THREE.Group();
    this.group.add(this.modelContainer);

    this.setCharacter('hero');
    this.initClickIndicator();
  }

  setCharacter(charId) {
    this.characterId = charId;

    // Clear old model
    while (this.modelContainer.children.length > 0) {
      this.modelContainer.remove(this.modelContainer.children[0]);
    }

    // Build new low-poly character model
    const { group, animNodes } = CharacterFactory.createModel(charId);
    this.modelContainer.add(group);
    this.animNodes = animNodes;

    // Attach signature 3D Magic Sword to player's right hand
    this.attachMagicSword(charId);
  }

  attachMagicSword(charId) {
    this.swordRuneMats = [];
    if (!this.animNodes.armR) return;

    // Remove any previous sword
    if (this.magicSword) {
      this.animNodes.armR.remove(this.magicSword);
      this.magicSword = null;
    }

    const swordGroup = new THREE.Group();

    // Color definitions per character
    let bladeColor = 0xe2e8f0; // Steel
    let runeColor = 0x38bdf8;  // Cyan Starlight
    let guardColor = 0xf59e0b; // Gold
    let gripColor = 0x78350f;  // Leather
    let pommelColor = 0xfacc15;
    let bladeLength = 1.35;
    let bladeWidth = 0.16;

    if (charId === 'princess') {
      bladeColor = 0xf8fafc;
      runeColor = 0x818cf8;
      guardColor = 0xc084fc;
      gripColor = 0x475569;
      pommelColor = 0x38bdf8;
      bladeLength = 1.25;
      bladeWidth = 0.12; // Elegant rapier
    } else if (charId === 'demonking') {
      bladeColor = 0x18181b; // Obsidian
      runeColor = 0xef4444;  // Hellfire
      guardColor = 0x7f1d1d;
      gripColor = 0x09090b;
      pommelColor = 0xdc2626;
      bladeLength = 1.65;
      bladeWidth = 0.24; // Colossal Greatsword
    } else if (charId === 'op_side') {
      bladeColor = 0x1e1b4b; // Midnight shadow
      runeColor = 0xa855f7;  // Void purple
      guardColor = 0x312e81;
      gripColor = 0x0f172a;
      pommelColor = 0x67e8f9;
      bladeLength = 1.40;
      bladeWidth = 0.13; // Curved Muramasa Katana
    } else if (charId === 'king') {
      bladeColor = 0xfef08a; // Gilded double-edge
      runeColor = 0xf59e0b;  // Sovereign gold
      guardColor = 0xb45309;
      gripColor = 0x78350f;
      pommelColor = 0xf59e0b;
      bladeLength = 1.50;
      bladeWidth = 0.20; // Sovereign Royal Claymore
    } else if (charId === 'retired_hero') {
      bladeColor = 0x94a3b8; // Weathered ancient steel
      runeColor = 0x10b981;  // Emerald gale
      guardColor = 0x334155;
      gripColor = 0x57534e;
      pommelColor = 0x34d399;
      bladeLength = 1.45;
      bladeWidth = 0.19; // Vanguard Broadsword
    }

    const steelMat = new THREE.MeshLambertMaterial({ color: bladeColor, flatShading: true });
    const guardMat = new THREE.MeshLambertMaterial({ color: guardColor, flatShading: true });
    const gripMat = new THREE.MeshLambertMaterial({ color: gripColor, flatShading: true });
    const pommelMat = new THREE.MeshLambertMaterial({ color: pommelColor, flatShading: true });

    // Emissive glowing rune core material
    const runeMat = new THREE.MeshLambertMaterial({
      color: runeColor,
      emissive: runeColor,
      emissiveIntensity: 1.3,
      flatShading: true
    });
    this.swordRuneMats.push(runeMat);

    // 1. Grip / Hilt (held in hand at arm bottom)
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.38, 6), gripMat);
    grip.position.set(0, 0.14, 0);
    swordGroup.add(grip);

    // 2. Pommel (weighted bottom cap)
    const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.13), pommelMat);
    pommel.position.set(0, -0.06, 0);
    pommel.rotation.y = Math.PI / 4;
    swordGroup.add(pommel);

    // 3. Crossguard (protective hilt wings)
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.1, 0.14), guardMat);
    guard.position.set(0, 0.34, 0);
    swordGroup.add(guard);

    // Center jewel on guard
    const guardJewel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.16), runeMat);
    guardJewel.position.set(0, 0.34, 0);
    swordGroup.add(guardJewel);

    // 4. Double-edged Blade
    const blade = new THREE.Mesh(new THREE.BoxGeometry(bladeWidth, bladeLength, 0.05), steelMat);
    blade.position.set(0, 0.34 + bladeLength / 2, 0);
    blade.castShadow = true;
    swordGroup.add(blade);

    // 5. Central glowing runic fuller groove
    const fuller = new THREE.Mesh(new THREE.BoxGeometry(bladeWidth * 0.35, bladeLength * 0.88, 0.065), runeMat);
    fuller.position.set(0, 0.34 + (bladeLength * 0.88) / 2, 0);
    swordGroup.add(fuller);

    // 6. Tapered Pointed Tip
    const tip = new THREE.Mesh(new THREE.ConeGeometry(bladeWidth * 0.55, 0.32, 4), steelMat);
    tip.position.set(0, 0.34 + bladeLength + 0.15, 0);
    tip.rotation.y = Math.PI / 4;
    swordGroup.add(tip);

    // 7. Embedded floating runic power crystal
    const runeDiamond = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), runeMat);
    runeDiamond.position.set(0, 0.34 + bladeLength * 0.5, 0.04);
    swordGroup.add(runeDiamond);
    this.runeCrystal = runeDiamond;

    // Attach sword to armR at the bottom (hand level)
    swordGroup.position.set(0, -0.42, 0.15);
    // Angle forward and slightly down in battle-ready idle pose
    swordGroup.rotation.x = -Math.PI / 3;
    swordGroup.rotation.z = -0.15;

    this.animNodes.armR.add(swordGroup);
    this.magicSword = swordGroup;
  }

  getCharacterConfig() {
    return getCharacterById(this.characterId);
  }

  setColliders(colliders) {
    this.colliders = colliders;
    // Resolve immediately on collider load
    resolveCircleCollision(this.position, this.radius, this.colliders, 3);
  }

  initClickIndicator() {
    // Ring marker showing click-to-move destination
    const geom = new THREE.RingGeometry(0.7, 0.95, 16);
    geom.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    this.clickRing = new THREE.Mesh(geom, mat);
    this.scene.add(this.clickRing);
  }

  teleport(x, z) {
    this.position.x = x;
    this.position.z = z;
    resolveCircleCollision(this.position, this.radius, this.colliders, 3);
    this.position.y = getTerrainHeight(this.position.x, this.position.z);
    this.group.position.copy(this.position);
    this.clickTarget = null;
    audioSystem.playTeleport();
  }

  setClickTarget(pos) {
    if (!pos) {
      this.clickTarget = null;
      this.clickRing.material.opacity = 0;
      return;
    }
    this.clickTarget = pos.clone();
    this.clickRing.position.set(pos.x, getTerrainHeight(pos.x, pos.z) + 0.1, pos.z);
    this.clickRing.material.opacity = 0.85;
    this.clickRing.scale.set(1, 1, 1);
  }

  gainXP(amount, onLevelUp) {
    this.xp += amount;
    let leveled = false;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = Math.floor(this.xpToNext * 1.6);
      this.maxHp = Math.floor(this.maxHp * 1.35);
      this.currentHp = this.maxHp;
      this.attackPower = Math.floor(this.attackPower * 1.3);
      leveled = true;
      if (onLevelUp) onLevelUp(this.level);
    }
    return leveled;
  }

  triggerAttackAnim() {
    // Chain combo steps (1: Crescent Slash, 2: Cross Arc, 3: Whirlwind Nova)
    if (this.comboResetTimer > 0) {
      this.comboStep = (this.comboStep % 3) + 1;
    } else {
      this.comboStep = 1;
    }

    this.comboResetTimer = 1.25;
    this.attackAnimDuration = (this.comboStep === 3) ? 0.45 : 0.32;
    this.attackAnimTimer = this.attackAnimDuration;

    return this.comboStep;
  }

  detectSurface(x, z) {
    // 1. Suspension bridge at crossroads is wooden planks
    if (Math.abs(x) < 26 && Math.abs(z - 10) < 14) return 'wood';

    // 2. Open House / Tavern / Forge interiors (wooden floorboards)
    if (
      (Math.hypot(x - 130, z - 260) < 10) ||
      (Math.hypot(x - 260, z - 200) < 14) ||
      (Math.hypot(x - 205, z - (-85)) < 12) ||
      (Math.hypot(x - 160, z - (-55)) < 10) ||
      (Math.hypot(x - 470, z - (-370)) < 16) ||
      (Math.hypot(x - (-260), z - 120) < 12)
    ) {
      return 'wood';
    }

    // 3. Grand Imperial Highroads & Faction Courtyards (flagstones / cobblestone)
    if (getDistToImperialRoad(x, z) < 4.0) return 'stone';
    if (Math.hypot(x - 380, z - (-380)) < 70) return 'stone'; // Grand Castle Citadel & Courtyard
    if (Math.hypot(x - 205, z - (-85)) < 45) return 'stone';  // Market Square
    if (Math.hypot(x - 200, z - 200) < 50) return 'stone';    // Karak-Drak Bastion
    if (Math.hypot(x - (-220), z - (-220)) < 55) return 'stone'; // Nether Citadel

    // 4. Natural grass / forest turf / farmland soil
    return 'grass';
  }

  update(delta, inputManager) {
    if (this.isInVehicle) {
      this.group.visible = false;
      return;
    }
    this.group.visible = true;

    // Movement calculation
    let moveX = 0;
    let moveZ = 0;

    // Handle Click-to-Move
    if (inputManager.clickTarget) {
      this.setClickTarget(inputManager.clickTarget);
      inputManager.clearClickTarget();
    }

    if (this.clickTarget) {
      const dx = this.clickTarget.x - this.position.x;
      const dz = this.clickTarget.z - this.position.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 0.8) {
        moveX = dx / dist;
        moveZ = dz / dist;
      } else {
        this.clickTarget = null;
        this.clickRing.material.opacity = 0;
      }
    }

    // Direct WASD / Touch Joystick input overrides Click-to-Move
    if (inputManager.moveVector.lengthSq() > 0.01) {
      moveX = inputManager.moveVector.x;
      moveZ = inputManager.moveVector.y;
      this.clickTarget = null;
      this.clickRing.material.opacity = 0;
    }

    const isMoving = (Math.hypot(moveX, moveZ) > 0.05);
    this.isMoving = isMoving;
    this.isSprinting = inputManager.isSprinting;

    if (isMoving) {
      const speed = this.isSprinting ? this.runSpeed : this.walkSpeed;
      const totalDist = speed * delta;
      // Sub-step prevents tunneling through thin walls: maximum 10cm per step!
      const maxSubStep = 0.10;
      const steps = Math.max(1, Math.ceil(totalDist / maxSubStep));
      const subDelta = delta / steps;

      const prevX = this.position.x;
      const prevZ = this.position.z;

      for (let s = 0; s < steps; s++) {
        this.position.x += moveX * speed * subDelta;
        this.position.z += moveZ * speed * subDelta;
        resolveCircleCollision(this.position, this.radius, this.colliders, 3);
      }

      // If click-to-move got completely stopped by a wall, stop attempting
      if (this.clickTarget) {
        const moved = Math.hypot(this.position.x - prevX, this.position.z - prevZ);
        if (moved < 0.005) {
          this.clickTarget = null;
          this.clickRing.material.opacity = 0;
        }
      }

      // Smooth rotation towards movement direction
      this.targetRotation = Math.atan2(moveX, moveZ);
      let diff = this.targetRotation - this.currentRotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.currentRotation += diff * Math.min(1.0, delta * 14.0);

      // Footstep sound
      const surface = this.detectSurface(this.position.x, this.position.z);
      audioSystem.playFootstep(surface);

      // Walking limb swing animation
      this.walkCycle += delta * (this.isSprinting ? 18 : 12);
      const swing = Math.sin(this.walkCycle) * 0.45;

      if (this.animNodes.armL) this.animNodes.armL.rotation.x = swing;
      if (this.animNodes.armR) this.animNodes.armR.rotation.x = -swing;
      if (this.animNodes.legL) this.animNodes.legL.rotation.x = -swing;
      if (this.animNodes.legR) this.animNodes.legR.rotation.x = swing;
      if (this.animNodes.torso) this.animNodes.torso.position.y = 1.35 + Math.abs(Math.sin(this.walkCycle)) * 0.08;
    } else {
      // Idle pose
      if (this.animNodes.armL) this.animNodes.armL.rotation.x = 0;
      if (this.animNodes.armR) this.animNodes.armR.rotation.x = 0;
      if (this.animNodes.legL) this.animNodes.legL.rotation.x = 0;
      if (this.animNodes.legR) this.animNodes.legR.rotation.x = 0;
      if (this.animNodes.torso) this.animNodes.torso.position.y = 1.35;

      // Keep pushed out even while standing still
      resolveCircleCollision(this.position, this.radius, this.colliders, 2);
    }

    // Attack swing animation override with 3-hit combo styles
    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer -= delta;
      const progress = 1.0 - (this.attackAnimTimer / this.attackAnimDuration);
      const swingFactor = Math.sin(progress * Math.PI);

      if (this.comboStep === 1) {
        // Combo 1: Horizontal Crescent Slash (sweeps right-to-left across front)
        if (this.animNodes.armR) {
          this.animNodes.armR.rotation.x = -1.6 * swingFactor;
          this.animNodes.armR.rotation.y = 1.1 - progress * 2.2;
          this.animNodes.armR.rotation.z = -0.4;
        }
      } else if (this.comboStep === 2) {
        // Combo 2: Diagonal Overhead Cleave (sweeps down-left across chest)
        if (this.animNodes.armR) {
          this.animNodes.armR.rotation.x = -2.1 + progress * 2.4;
          this.animNodes.armR.rotation.y = -0.3;
          this.animNodes.armR.rotation.z = -0.6 + progress * 1.1;
        }
      } else {
        // Combo 3: 360° Whirlwind Tempest Nova (full body spin with sword horizontally out!)
        if (this.animNodes.armR) {
          this.animNodes.armR.rotation.x = -Math.PI / 2.2;
          this.animNodes.armR.rotation.y = 0;
          this.animNodes.armR.rotation.z = -Math.PI / 3.6;
        }
        this.currentRotation += delta * (Math.PI * 2 / this.attackAnimDuration);
      }
    } else {
      if (this.animNodes.armR && !isMoving) {
        this.animNodes.armR.rotation.y = 0;
        this.animNodes.armR.rotation.z = 0;
      }
    }

    // Update combo reset timer
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= delta;
      if (this.comboResetTimer <= 0) {
        this.comboStep = 1;
      }
    }

    // Animate glowing blade runes and floating crystal
    const time = performance.now() * 0.003;
    if (this.runeCrystal) {
      this.runeCrystal.rotation.y += delta * 3.0;
      this.runeCrystal.rotation.x += delta * 2.0;
    }
    const isAttacking = (this.attackAnimTimer > 0);
    const runeIntensity = isAttacking ? 2.5 : (1.2 + Math.sin(time * 3) * 0.35);
    for (let i = 0; i < this.swordRuneMats.length; i++) {
      this.swordRuneMats[i].emissiveIntensity = runeIntensity;
    }

    // Keep player grounded on terrain
    const groundY = getTerrainHeight(this.position.x, this.position.z);
    this.position.y = groundY;

    this.group.position.copy(this.position);
    this.group.rotation.y = this.currentRotation;

    // Pulse click ring animation
    if (this.clickRing.material.opacity > 0.05) {
      this.clickRing.scale.addScalar(delta * 0.4);
      this.clickRing.material.opacity = Math.max(0, this.clickRing.material.opacity - delta * 0.6);
    }
  }
}
