import * as THREE from 'three';
import { CHARACTERS } from '../config/characters.js';
import { CharacterFactory } from './CharacterFactory.js';
import { getTerrainHeight } from '../utils/math.js';
import { resolveCircleCollision, resolveEntityCollision, ejectFromColliders } from '../utils/collision.js';
import { NPCBrain, BRAIN_TIERS } from '../ai/NPCBrain.js';
import { continentalNavGraph } from '../ai/ContinentalNavGraph.js';

export class NPCManager {
  constructor(scene, onTalkToNPC, brainAdapter = null, perceptionEngine = null, gameApp = null) {
    this.scene = scene;
    this.onTalkToNPC = onTalkToNPC;
    this.brainAdapter = brainAdapter;
    this.perceptionEngine = perceptionEngine;
    this.gameApp = gameApp;
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

      const brain = new NPCBrain({
        ...char,
        isMain6: true,
        tier: BRAIN_TIERS.IMPORTANT
      }, this.brainAdapter, this.perceptionEngine);

      this.npcs.set(char.id, {
        config: char,
        brain: brain,
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
      try {
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

        // Spontaneous social conversation stance (Stanford Generative Agents / AI Town)
        if (npc._inAutoConversation) {
          if (npc.animNodes.legL) npc.animNodes.legL.rotation.x = THREE.MathUtils.lerp(npc.animNodes.legL.rotation.x, 0, delta * 8.0);
          if (npc.animNodes.legR) npc.animNodes.legR.rotation.x = THREE.MathUtils.lerp(npc.animNodes.legR.rotation.x, 0, delta * 8.0);
          return;
        }

        // 2. Dispatch high-level brain intentions (LLM decisions & utility routines)
        if (npc.brain) {
          npc.brain.dispatchAction(delta, npc, this.gameApp);
        }

        // 3. Autonomous Action & Movement State Machine
        if (npc.state === 'working' || npc.state === 'talking' || npc.state === 'fighting') {
          // Handled by brain action executor
        } else if (npc.state === 'idle') {
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
            // Check if routine system has a continental task for this hero
            if (this.gameApp?.routineSystem) {
              const routineTask = this.gameApp.routineSystem.getCurrentTask(id);
              if (routineTask) {
                const ty = getTerrainHeight(routineTask.x, routineTask.z);
                npc.targetPos.set(routineTask.x, ty, routineTask.z);
                npc.state = 'walking';
                const dist = Math.hypot(npc.targetPos.x - npc.group.position.x, npc.targetPos.z - npc.group.position.z);
                npc.stateTimer = Math.max(14.0, (dist / (npc.walkSpeed || 3.0)) + 16.0);
                if (npc.brain) {
                  npc.brain.currentAction = {
                    type: 'WALK_TO',
                    target: routineTask.locationName,
                    targetPos: npc.targetPos.clone(),
                    taskData: routineTask,
                    intention: routineTask.intention,
                    status: 'traveling'
                  };
                }
              }
            } else if (npc.brain && npc.brain.currentAction && npc.brain.currentAction.targetPos && npc.brain.currentAction.status !== 'arrived') {
              npc.targetPos.copy(npc.brain.currentAction.targetPos);
              npc.state = 'walking';
              const dist = Math.hypot(npc.targetPos.x - npc.group.position.x, npc.targetPos.z - npc.group.position.z);
              npc.stateTimer = Math.max(8.0, (dist / npc.walkSpeed) + 8.0);
            } else {
              // Pick new waypoint within wander radius of home spawn
              const angle = Math.random() * Math.PI * 2;
              const r = 4.0 + Math.random() * (npc.wanderRadius - 4.0);
              const targetX = npc.spawnPos.x + Math.cos(angle) * r;
              const targetZ = npc.spawnPos.z + Math.sin(angle) * r;
              const targetY = getTerrainHeight(targetX, targetZ);

              npc.targetPos.set(targetX, targetY, targetZ);
              npc.state = 'walking';
              npc.stateTimer = 12.0;
            }
          }

        } else if (npc.state === 'walking') {
          npc.stateTimer -= delta;

          // Build or update intermediate waypoint corridor via continental nav graph
          if (!npc.navPath || !npc._navTarget || Math.hypot(npc._navTarget.x - npc.targetPos.x, npc._navTarget.z - npc.targetPos.z) > 4.0) {
            npc._navTarget = npc.targetPos.clone();
            npc.navPath = continentalNavGraph.findPath(npc.group.position, npc.targetPos);
            npc.navIndex = 0;
          }

          let currentWp = npc.targetPos;
          if (npc.navPath && npc.navPath.length > 0) {
            if (npc.navIndex < npc.navPath.length) {
              const wp = npc.navPath[npc.navIndex];
              const distToWp = Math.hypot(wp.x - npc.group.position.x, wp.z - npc.group.position.z);
              if (distToWp < 3.2 && npc.navIndex < npc.navPath.length - 1) {
                npc.navIndex++;
              }
              currentWp = npc.navPath[npc.navIndex];
            }
          }

          const dxFinal = npc.targetPos.x - npc.group.position.x;
          const dzFinal = npc.targetPos.z - npc.group.position.z;
          const finalDist = Math.hypot(dxFinal, dzFinal);

          // Realistic arrival threshold: within 3.8m of final destination
          const arrivalThreshold = 3.8;

          if (finalDist < arrivalThreshold || npc.stateTimer <= 0) {
            // Reached destination, perform work task
            npc.state = 'idle';
            npc.stuckTimer = 0;
            npc.navPath = null;

            if (this.gameApp?.routineSystem) {
              const routineTask = this.gameApp.routineSystem.getCurrentTask(id);
              const state = this.gameApp.routineSystem.getCurrentState(id);
              // Pause to actively perform work task
              npc.stateTimer = state ? Math.max(12.0, state.taskTimer) : 30.0;
              if (npc.brain && npc.brain.currentAction) {
                npc.brain.currentAction.status = 'working';
              }
            } else {
              npc.stateTimer = 3.0 + Math.random() * 4.0;
              if (npc.brain && npc.brain.currentAction) {
                npc.brain.currentAction.status = 'arrived';
              }
            }
          } else {
            // Avoidance direction check
            if (!npc.avoidanceDir) npc.avoidanceDir = (Math.random() < 0.5 ? 1 : -1);
            if (npc.stuckTimer === undefined) npc.stuckTimer = 0;

            const dx = currentWp.x - npc.group.position.x;
            const dz = currentWp.z - npc.group.position.z;
            const dist = Math.hypot(dx, dz);

            let stepDx = dist > 0.001 ? dx / dist : 0;
            let stepDz = dist > 0.001 ? dz / dist : 0;

            // If blocked by obstacle, steer primarily along tangent
            if (npc.stuckTimer > 0.6) {
              const tangX = -stepDz * npc.avoidanceDir;
              const tangZ = stepDx * npc.avoidanceDir;
              stepDx = stepDx * 0.20 + tangX * 0.90;
              stepDz = stepDz * 0.20 + tangZ * 0.90;
              const len = Math.hypot(stepDx, stepDz);
              if (len > 0.001) {
                stepDx /= len;
                stepDz /= len;
              }
            }

            // Rotate smoothly towards movement direction
            const moveAngle = Math.atan2(stepDx, stepDz);
            let diff = moveAngle - npc.group.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            npc.group.rotation.y += diff * Math.min(1.0, delta * 7.5);

            const prevX = npc.group.position.x;
            const prevZ = npc.group.position.z;

            // Step forward
            const step = Math.min(dist, npc.walkSpeed * delta);
            npc.group.position.x += stepDx * step;
            npc.group.position.z += stepDz * step;

            // 1. Resolve collision with player and other NPCs first
            if (playerPos) {
              resolveEntityCollision(npc.group.position, 0.55, [{ position: playerPos }], 0.55);
            }
            resolveEntityCollision(npc.group.position, 0.55, this.npcs, 0.55);

            // 2. Resolve world colliders SECOND so walls always prevent clipping!
            if (this.colliders.length > 0) {
              resolveCircleCollision(npc.group.position, 0.55, this.colliders, 3);
              ejectFromColliders(npc.group.position, 0.55, this.colliders);
            }

            // Stuck detection & recovery
            const moved = Math.hypot(npc.group.position.x - prevX, npc.group.position.z - prevZ);
            if (moved < step * 0.25) {
              npc.stuckTimer += delta;
              if (npc.stuckTimer > 1.5) {
                npc.avoidanceDir = -npc.avoidanceDir;
                ejectFromColliders(npc.group.position, 0.55, this.colliders);
              }
              if (npc.stuckTimer > 3.2) {
                // Firmly eject and reset to idle
                ejectFromColliders(npc.group.position, 0.55, this.colliders, 1.0);
                npc.state = 'idle';
                npc.stateTimer = 1.0;
                npc.stuckTimer = 0;
                npc.navPath = null;
              }
            } else {
              npc.stuckTimer = Math.max(0, npc.stuckTimer - delta * 2.5);
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
    } catch (err) {
      // Prevent individual NPC tick exceptions from aborting frame animation
    }
  });

    this.currentNearbyNPC = nearest;
  }

  getNearbyNPC() {
    return this.currentNearbyNPC;
  }
}
