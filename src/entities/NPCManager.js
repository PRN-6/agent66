import * as THREE from 'three';
import { CHARACTERS } from '../config/characters.js';
import { CharacterFactory } from './CharacterFactory.js';
import { getTerrainHeight } from '../utils/math.js';
import { resolveCircleCollision } from '../utils/collision.js';

export class NPCManager {
  constructor(scene, onTalkToNPC) {
    this.scene = scene;
    this.onTalkToNPC = onTalkToNPC;
    this.npcs = new Map(); // id -> npcData
    this.activePlayerCharId = 'hero';
    this.currentNearbyNPC = null;
    this.colliders = [];

    this.initNPCs();
  }

  setColliders(colliders) {
    this.colliders = colliders || [];
  }

  initNPCs() {
    // Character-specific movement settings
    const movementProfiles = {
      hero: { wanderRadius: 16.0, walkSpeed: 3.2 },       // Aiden: Brisk adventurer patrol around Crossroads
      princess: { wanderRadius: 18.0, walkSpeed: 2.4 },   // Aurelia: Graceful royal stroll in East Gardens
      demonking: { wanderRadius: 20.0, walkSpeed: 2.9 },  // Malakor: Ominous stride across Dread Keep & Altar
      op_side: { wanderRadius: 22.0, walkSpeed: 3.6 },    // Kage: Agile wander through Bazaar & alleyways
      king: { wanderRadius: 16.0, walkSpeed: 2.2 },       // Reginald: Dignified pacing across Throne Keep
      retired_hero: { wanderRadius: 14.0, walkSpeed: 2.5 } // Vance: Steady elder stroll around rustic lodge
    };

    CHARACTERS.forEach(char => {
      const { group, animNodes } = CharacterFactory.createModel(char.id);

      // Place at spawn location
      const y = getTerrainHeight(char.spawn.x, char.spawn.z);
      group.position.set(char.spawn.x, y, char.spawn.z);

      // Create floating 2D billboard badge above head
      const badgeSprite = this.createBadgeSprite(char, 1);
      badgeSprite.position.set(0, 3.2, 0);
      group.add(badgeSprite);

      // Subtle particle / halo for Demon King and OP character
      if (char.id === 'demonking') {
        const fireLight = new THREE.PointLight(0xef4444, 0.9, 8);
        fireLight.position.set(0, 2.5, 0);
        group.add(fireLight);
      } else if (char.id === 'op_side') {
        const auraLight = new THREE.PointLight(0x8b5cf6, 0.7, 6);
        auraLight.position.set(0, 2.0, 0);
        group.add(auraLight);
      }

      this.scene.add(group);

      const profile = movementProfiles[char.id] || { wanderRadius: 15.0, walkSpeed: 2.8 };

      this.npcs.set(char.id, {
        config: char,
        group: group,
        animNodes: animNodes,
        baseY: y,
        badgeSprite: badgeSprite,
        spawnPos: new THREE.Vector3(char.spawn.x, y, char.spawn.z),
        targetPos: new THREE.Vector3(char.spawn.x, y, char.spawn.z),
        state: 'idle', // 'idle' | 'walking'
        stateTimer: 1.5 + Math.random() * 3.5,
        wanderRadius: profile.wanderRadius,
        walkSpeed: profile.walkSpeed,
        walkCycle: Math.random() * Math.PI * 2,
        isInteracting: false,
        level: 1,
        xp: 0,
        xpToNext: 80,
        maxHp: 100,
        currentHp: 100,
        attack: 28
      });
    });

    this.updateActiveCharacter('hero');
  }

  createBadgeSprite(char, level = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    // Rounded tag background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = char.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 64, 16);
    ctx.fill();
    ctx.stroke();

    // Text: Badge, Level & Name
    ctx.fillStyle = char.color;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${char.badge} • Lv. ${level}`, 128, 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(char.name, 128, 60);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(3.4, 1.1, 1);
    return sprite;
  }

  gainXP(charId, amount, combatSystem) {
    const npc = this.npcs.get(charId);
    if (!npc) return;

    npc.xp += amount;
    if (npc.xp >= npc.xpToNext) {
      npc.xp -= npc.xpToNext;
      npc.level++;
      npc.xpToNext = Math.floor(npc.xpToNext * 1.6);
      npc.maxHp = Math.floor(npc.maxHp * 1.35);
      npc.currentHp = npc.maxHp;
      npc.attack = Math.floor(npc.attack * 1.3);

      // Replace old badge with new level badge
      npc.group.remove(npc.badgeSprite);
      npc.badgeSprite.material.dispose();
      npc.badgeSprite = this.createBadgeSprite(npc.config, npc.level);
      npc.badgeSprite.position.set(0, 3.2, 0);
      npc.group.add(npc.badgeSprite);

      if (combatSystem) {
        combatSystem.triggerLevelUp(npc.group, npc.config.name, npc.level);
      }
    }
  }

  updateActiveCharacter(charId) {
    this.activePlayerCharId = charId;

    this.npcs.forEach((npc, id) => {
      // Hide the NPC that matches the active playable character
      npc.group.visible = (id !== charId);
    });
  }

  update(delta, playerPos) {
    if (!playerPos) return;

    let nearest = null;
    let minDist = 4.5; // Interaction trigger radius in meters
    const time = performance.now() * 0.002;

    this.npcs.forEach((npc, id) => {
      if (id === this.activePlayerCharId) return;

      // 1. Distance check to player
      const distToPlayer = Math.hypot(playerPos.x - npc.group.position.x, playerPos.z - npc.group.position.z);
      const isPlayerNear = distToPlayer < minDist;

      if (isPlayerNear) {
        minDist = distToPlayer;
        nearest = npc.config;
        npc.isInteracting = true;

        // Turn smoothly to face player
        const targetAngle = Math.atan2(playerPos.x - npc.group.position.x, playerPos.z - npc.group.position.z);
        let diff = targetAngle - npc.group.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        npc.group.rotation.y += diff * Math.min(1.0, delta * 8.0);

        // Neutral attentive posture
        if (npc.animNodes.legL) npc.animNodes.legL.rotation.x = THREE.MathUtils.lerp(npc.animNodes.legL.rotation.x, 0, delta * 10.0);
        if (npc.animNodes.legR) npc.animNodes.legR.rotation.x = THREE.MathUtils.lerp(npc.animNodes.legR.rotation.x, 0, delta * 10.0);
        if (npc.animNodes.armL) npc.animNodes.armL.rotation.x = THREE.MathUtils.lerp(npc.animNodes.armL.rotation.x, 0, delta * 10.0);
        if (npc.animNodes.armR) npc.animNodes.armR.rotation.x = THREE.MathUtils.lerp(npc.animNodes.armR.rotation.x, 0, delta * 10.0);
        if (npc.animNodes.torso) npc.animNodes.torso.position.y = 1.35 + Math.sin(time + id.length) * 0.02;

      } else {
        npc.isInteracting = false;

        // 2. Autonomous Wander State Machine
        if (npc.state === 'idle') {
          npc.stateTimer -= delta;

          // Subtle idle breathing animation
          if (npc.animNodes.torso) {
            npc.animNodes.torso.position.y = 1.35 + Math.sin(time + id.length) * 0.035;
          }
          if (npc.animNodes.head) {
            npc.animNodes.head.position.y = 2.15 + Math.sin(time + id.length) * 0.035;
          }

          // Ease limbs to rest
          if (npc.animNodes.legL) npc.animNodes.legL.rotation.x = THREE.MathUtils.lerp(npc.animNodes.legL.rotation.x, 0, delta * 6.0);
          if (npc.animNodes.legR) npc.animNodes.legR.rotation.x = THREE.MathUtils.lerp(npc.animNodes.legR.rotation.x, 0, delta * 6.0);
          if (npc.animNodes.armL) npc.animNodes.armL.rotation.x = THREE.MathUtils.lerp(npc.animNodes.armL.rotation.x, 0, delta * 6.0);
          if (npc.animNodes.armR) npc.animNodes.armR.rotation.x = THREE.MathUtils.lerp(npc.animNodes.armR.rotation.x, 0, delta * 6.0);

          if (npc.stateTimer <= 0) {
            // Pick new random waypoint within wander radius of home spawn
            const angle = Math.random() * Math.PI * 2;
            const r = 4.0 + Math.random() * (npc.wanderRadius - 4.0);
            const targetX = npc.spawnPos.x + Math.cos(angle) * r;
            const targetZ = npc.spawnPos.z + Math.sin(angle) * r;
            const targetY = getTerrainHeight(targetX, targetZ);

            npc.targetPos.set(targetX, targetY, targetZ);
            npc.state = 'walking';
            npc.stateTimer = 10.0; // Max walk duration timeout
          }

        } else if (npc.state === 'walking') {
          npc.stateTimer -= delta;

          const dx = npc.targetPos.x - npc.group.position.x;
          const dz = npc.targetPos.z - npc.group.position.z;
          const dist = Math.hypot(dx, dz);

          if (dist < 0.6 || npc.stateTimer <= 0) {
            // Reached destination, pause for rest
            npc.state = 'idle';
            npc.stateTimer = 2.5 + Math.random() * 4.5; // Pause for 2.5 - 7.0 seconds
          } else {
            // Rotate smoothly towards movement direction
            const moveAngle = Math.atan2(dx, dz);
            let diff = moveAngle - npc.group.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            npc.group.rotation.y += diff * Math.min(1.0, delta * 7.5);

            // Step forward
            const step = Math.min(dist, npc.walkSpeed * delta);
            npc.group.position.x += (dx / dist) * step;
            npc.group.position.z += (dz / dist) * step;

            // Resolve collision with world structures
            if (this.colliders.length > 0) {
              resolveCircleCollision(npc.group.position, 0.5, this.colliders, 2);
            }

            // Ground cleanly on terrain height
            npc.group.position.y = getTerrainHeight(npc.group.position.x, npc.group.position.z);

            // Natural walking limb swing animation
            npc.walkCycle += delta * (npc.walkSpeed * 2.8);
            const swing = Math.sin(npc.walkCycle) * 0.45;

            if (npc.animNodes.legL) npc.animNodes.legL.rotation.x = -swing;
            if (npc.animNodes.legR) npc.animNodes.legR.rotation.x = swing;
            if (npc.animNodes.armL) npc.animNodes.armL.rotation.x = swing;
            if (npc.animNodes.armR) npc.animNodes.armR.rotation.x = -swing;
            if (npc.animNodes.torso) npc.animNodes.torso.position.y = 1.35 + Math.abs(Math.sin(npc.walkCycle)) * 0.06;
          }
        }
      }
    });

    this.currentNearbyNPC = nearest;
  }

  getNearbyNPC() {
    return this.currentNearbyNPC;
  }
}
