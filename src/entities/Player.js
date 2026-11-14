import * as THREE from 'three';
import { getTerrainHeight, getDistToImperialRoad } from '../utils/math.js';
import { audioSystem } from '../systems/AudioSystem.js';
import { resolveCircleCollision, checkCollision, resolveEntityCollision, ejectFromColliders } from '../utils/collision.js';
import { CharacterFactory } from './CharacterFactory.js';
import { getCharacterById } from '../config/characters.js';
import { NPCBrain, BRAIN_TIERS } from '../ai/NPCBrain.js';
import { isInSanctuaryZone } from '../config/constants.js';
import { continentalNavGraph } from '../ai/ContinentalNavGraph.js';

export class Player {
  constructor(scene, startPos = new THREE.Vector3(0, 0.5, 12)) {
    this.scene = scene;
    this.position = startPos.clone();
    this.targetRotation = 0;
    this.currentRotation = 0;
    this.radius = 0.55; // Body collision radius
    this.characterId = 'hero';

    // Autonomous AI Mind Mode (LLM Self-Driving & Decisions - Active by Default)
    this.isAutonomous = true;
    this.brain = null;
    this.autonomousDecisionTimer = 0;
    this.gameApp = null;

    // Autonomous navigation & obstacle avoidance
    this.stuckTimer = 0;
    this.avoidanceDir = 1; // +1 = turn right, -1 = turn left
    this.avoidanceHoldTimer = 0;
    this.autoAttackCooldown = 0;

    // Movement speeds
    this.walkSpeed = 6.5;
    this.runSpeed = 12.0;
    this.speedMultiplier = 1.0;
    this.isGodMode = false;

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
    this.gold = 100;
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
    this.config = this.getCharacterConfig();
    this.characterConfig = this.config;

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

    // Re-initialize autonomous brain for new persona
    this.initBrain();
  }

  setGameApp(gameApp) {
    this.gameApp = gameApp;
    this.initBrain();
  }

  initBrain() {
    if (!this.gameApp) return;
    const charConfig = this.getCharacterConfig();
    this.brain = new NPCBrain(
      { ...charConfig, isPlayer: true, isMain6: true, tier: BRAIN_TIERS.IN_FOCUS },
      this.gameApp.groqAdapter,
      this.gameApp.perceptionEngine
    );
    this.autonomousDecisionTimer = 0.5; // Short delay before first cognitive thought
    this.pickNextAutonomousDestination();
  }

  pickNextAutonomousDestination() {
    if (!this.brain) return;

    // Check if character routine system provides a scheduled continental duty
    if (this.gameApp?.routineSystem) {
      const routineTask = this.gameApp.routineSystem.getCurrentTask(this.characterId);
      if (routineTask) {
        const y = getTerrainHeight(routineTask.x, routineTask.z);
        this.brain.currentAction = {
          type: 'WALK_TO',
          target: routineTask.locationName,
          targetPos: new THREE.Vector3(routineTask.x, y, routineTask.z),
          taskData: routineTask,
          intention: routineTask.intention,
          status: 'traveling',
          timer: 0,
          duration: routineTask.duration || 32.0
        };

        if (this.gameApp?.hud) {
          this.gameApp.hud.showAutonomousThoughtToast(
            this.getCharacterConfig()?.name || 'Hero',
            `[Duty: ${routineTask.badge}] Setting course for ${routineTask.locationName}. ${routineTask.intention}`
          );
        }
        return;
      }
    }

    // List of exciting realm landmarks and settlements with verified open pathway coordinates
    const destinations = [
      { name: 'Crossroads Sanctuary Bridge', x: 0, z: 12, intention: 'Survey the Great River crossing at the continental crossroads.' },
      { name: 'High Valoria Castle Town', x: 356, z: -248, intention: 'Stroll along the Grand Lion Fountain and Clocktower promenade in High Valoria.' },
      { name: 'The Dragon’s Rest Tavern', x: 205, z: -74, intention: 'Check the adventurer bounty board at the tavern square.' },
      { name: 'Oakhaven Agricultural Village', x: 105, z: 10, intention: 'Patrol along the sunny wheat fields of Oakhaven.' },
      { name: 'Royal Castle Citadel Gate', x: 380, z: -325, intention: 'Stand guard before King Reginald’s South Barbican Gate.' },
      { name: 'Princess Aurelia’s Sun Pavilion', x: 470, z: -352, intention: 'Visit the fragrant rose gardens outside the Royal Sun Pavilion.' },
      { name: 'Fernbrook Woodland Orchard', x: -75, z: 110, intention: 'Stroll beneath the sweet fruit trees of Fernbrook.' },
      { name: 'Sylvaheim Elven Glade', x: -160, z: 78, intention: 'Observe the radiant Starlight Mana Pool of Sylvaheim.' },
      { name: 'Moon Spire Sanctuary', x: -200, z: 185, intention: 'Pilgrimage to the elevated Moon Spire colonnades.' },
      { name: 'Karak-Drak Mountain Bastion', x: 200, z: 182, intention: 'Inspect the massive stone bastion and dwarven guard statues.' },
      { name: 'Great Blast Furnaces', x: 140, z: 222, intention: 'Watch the rotating giant cogs and molten iron troughs.' },
      { name: 'Karak-Vorn United Clanstead', x: 105, z: 140, intention: 'Visit the mead halls and Unity Monument at the dwarven clanstead.' },
      { name: 'Krag’mar Demon Enclave', x: -120, z: -90, intention: 'Scout the perimeter of the smoldering nether outpost.' }
    ];

    // Filter out destinations too close (< 20m) so the hero makes meaningful exploratory journeys
    const valid = destinations.filter(d => Math.hypot(d.x - this.position.x, d.z - this.position.z) > 20.0);
    const chosen = (valid.length > 0) ? valid[Math.floor(Math.random() * valid.length)] : destinations[0];

    const y = getTerrainHeight(chosen.x, chosen.z);
    this.brain.currentAction = {
      type: 'WALK_TO',
      target: chosen.name,
      targetPos: new THREE.Vector3(chosen.x, y, chosen.z),
      intention: chosen.intention,
      status: 'active',
      timer: 0,
      duration: 45.0
    };

    if (this.gameApp?.hud) {
      this.gameApp.hud.showAutonomousThoughtToast(
        this.getCharacterConfig()?.name || 'Hero',
        `Setting course for ${chosen.name}. ${chosen.intention}`
      );
    }
  }

  toggleAutonomous(forceState = undefined, silent = false) {
    this.isAutonomous = (forceState !== undefined) ? forceState : !this.isAutonomous;
    this.autonomousDecisionTimer = 0; // Trigger immediate thought

    if (!silent && this.gameApp?.combatSystem) {
      const p = this.position.clone();
      p.y += 2.2;
      const msg = this.isAutonomous ? '🤖 Autonomous AI Mind: ACTIVE [P]' : '🎮 Manual Control: RESUMED [P]';
      const col = this.isAutonomous ? '#34d399' : '#38bdf8';
      this.gameApp.combatSystem.spawnFloatingText(p, msg, col);
    }

    if (this.gameApp?.hud) {
      this.gameApp.hud.updateAutoMindButton(this.isAutonomous);
    }

    if (!silent) {
      audioSystem.playChime();
    }
    return this.isAutonomous;
  }

  processAutonomousMind(delta) {
    if (!this.brain) {
      this.initBrain();
      if (!this.brain) return { x: 0, z: 0 };
    }

    this.autonomousDecisionTimer -= delta;

    if (this.autonomousDecisionTimer <= 0) {
      this.autonomousDecisionTimer = 16.0 + Math.random() * 8.0;
      if (this.gameApp?.perceptionEngine) {
        const sensory = this.gameApp.perceptionEngine.getSensorySnapshot(this);
        this.brain.think(sensory).then(thought => {
          if (thought && this.gameApp?.combatSystem) {
            const pos = this.position.clone();
            pos.y += 2.8;
            const charName = this.getCharacterConfig()?.name || 'Hero';
            const snippet = (thought.intention || thought.inner_thought || '').slice(0, 36);
            this.gameApp.combatSystem.spawnFloatingText(pos, `💭 ${charName}: "${snippet}..."`, '#a78bfa');
          }
          if (this.gameApp?.hud) {
            this.gameApp.hud.showAutonomousThoughtToast(this.getCharacterConfig()?.name, thought);
          }
        });
      }
    }

    const action = this.brain.currentAction;
    if (!action) {
      this.pickNextAutonomousDestination();
      return { x: 0, z: 0 };
    }

    if (this.autoAttackCooldown > 0) {
      this.autoAttackCooldown -= delta;
    }

    // 1. COMBAT DEFENSE: Only engage hostile beasts in the wild if close (< 6.5m) and outside sanctuary zones
    const inSanctuary = isInSanctuaryZone(this.position.x, this.position.z);

    if (!inSanctuary && this.gameApp?.monsterManager?.monsters) {
      let nearestBeast = null;
      let minDist = 6.5; // Only engage if predator is right upon the character
      this.gameApp.monsterManager.monsters.forEach(m => {
        if (m.isDead || m.isTamed) return;
        const d = Math.hypot(m.group.position.x - this.position.x, m.group.position.z - this.position.z);
        if (d < minDist) {
          minDist = d;
          nearestBeast = m;
        }
      });

      if (nearestBeast) {
        const dx = nearestBeast.group.position.x - this.position.x;
        const dz = nearestBeast.group.position.z - this.position.z;
        const d = Math.hypot(dx, dz);

        this.targetRotation = Math.atan2(dx, dz);

        if (d > 2.2) {
          this.isSprinting = false;
          return { x: dx / d, z: dz / d };
        } else {
          // In combat cleave range: strike with a measured cadence (1.2s delay between swings)
          this.isSprinting = false;
          if (this.autoAttackCooldown <= 0 && this.attackAnimTimer <= 0 && this.gameApp.handleAttack) {
            this.gameApp.handleAttack();
            this.autoAttackCooldown = 1.2;
          }
          return { x: 0, z: 0 };
        }
      }
    }

    // 2. EXPLORATION & PATH NAVIGATION: Steer towards destination targetPos via Continental NavGraph
    if (action.targetPos) {
      // Build or update navPath if targetPos changed or not present
      if (!this.navPath || this._lastTargetPos !== action.targetPos) {
        this._lastTargetPos = action.targetPos;
        this.navPath = continentalNavGraph.findPath(this.position, action.targetPos);
        this.navIndex = 0;
      }

      // Determine active steering waypoint
      let currentWaypoint = action.targetPos;
      if (this.navPath && this.navPath.length > 0) {
        if (this.navIndex < this.navPath.length) {
          const wp = this.navPath[this.navIndex];
          const distToWp = Math.hypot(wp.x - this.position.x, wp.z - this.position.z);
          // If close to intermediate waypoint, advance to next
          if (distToWp < 3.5 && this.navIndex < this.navPath.length - 1) {
            this.navIndex++;
          }
          currentWaypoint = this.navPath[this.navIndex];
        }
      }

      const dxFinal = action.targetPos.x - this.position.x;
      const dzFinal = action.targetPos.z - this.position.z;
      const finalDist = Math.hypot(dxFinal, dzFinal);

      // Arrival threshold at final destination
      if (finalDist <= 4.0 || action.status === 'working') {
        this.navPath = null;
        if (action.taskData) {
          if (action.status !== 'working') {
            action.status = 'working';
            action.timer = 0;
            this.stuckTimer = 0;
            this.avoidanceHoldTimer = 0;
          }

          action.timer += delta;
          if (action.timer < (action.duration || 30.0)) {
            // Stay at location and perform task!
            return { x: 0, z: 0 };
          }

          // Work finished, advance to next duty
          action.status = 'arrived';
          if (this.gameApp?.routineSystem) {
            this.gameApp.routineSystem.advanceToNextTask(this.characterId, this.brain);
          }
          this.pickNextAutonomousDestination();
          return { x: 0, z: 0 };
        } else {
          action.status = 'arrived';
          this.stuckTimer = 0;
          this.avoidanceHoldTimer = 0;
          this.pickNextAutonomousDestination();
          return { x: 0, z: 0 };
        }
      }

      // Steer towards current intermediate waypoint
      const dx = currentWaypoint.x - this.position.x;
      const dz = currentWaypoint.z - this.position.z;
      const dist = Math.hypot(dx, dz);

      this.isSprinting = (finalDist > 35.0 && dist > 15.0);
      let dirX = dist > 0.001 ? dx / dist : 0;
      let dirZ = dist > 0.001 ? dz / dist : 0;

      // Obstacle avoidance & tangent steering:
      if (this.avoidanceHoldTimer > 0) {
        this.avoidanceHoldTimer -= delta;
      }

      // Proactive forward lookahead
      const lookahead = 2.2;
      const hitCenter = (this.colliders && this.colliders.length > 0) &&
        checkCollision(this.position.x + dirX * lookahead, this.position.z + dirZ * lookahead, this.radius + 0.15, this.colliders);
      const isStuck = this.stuckTimer > 0.7;

      if (hitCenter || isStuck || this.avoidanceHoldTimer > 0) {
        if (this.avoidanceHoldTimer <= 0 && this.colliders && this.colliders.length > 0) {
          const tangX = -dirZ;
          const tangZ = dirX;

          // Test right whisker
          const rightX = this.position.x + (dirX * 0.5 + tangX * 0.866) * 2.4;
          const rightZ = this.position.z + (dirZ * 0.5 + tangZ * 0.866) * 2.4;
          const rightBlocked = checkCollision(rightX, rightZ, this.radius + 0.1, this.colliders);

          // Test left whisker
          const leftX = this.position.x + (dirX * 0.5 - tangX * 0.866) * 2.4;
          const leftZ = this.position.z + (dirZ * 0.5 - tangZ * 0.866) * 2.4;
          const leftBlocked = checkCollision(leftX, leftZ, this.radius + 0.1, this.colliders);

          if (!rightBlocked && leftBlocked) {
            this.avoidanceDir = 1; // Steer right
            this.avoidanceHoldTimer = 0.6;
          } else if (rightBlocked && !leftBlocked) {
            this.avoidanceDir = -1; // Steer left
            this.avoidanceHoldTimer = 0.6;
          } else if (!rightBlocked && !leftBlocked) {
            this.avoidanceDir = 1;
            this.avoidanceHoldTimer = 0.4;
          } else {
            // Both blocked: concave corner or direct wall; hard tangent turn
            this.avoidanceDir = (Math.random() < 0.5 ? 1 : -1);
            this.avoidanceHoldTimer = 0.8;
          }
        }

        // Steer primarily along tangent (15% forward + 95% tangent when blocked)
        const forwardWeight = hitCenter ? 0.15 : 0.40;
        const tangWeight = hitCenter ? 0.95 : 0.75;
        const steerTangX = -dirZ * this.avoidanceDir;
        const steerTangZ = dirX * this.avoidanceDir;

        let finalX = dirX * forwardWeight + steerTangX * tangWeight;
        let finalZ = dirZ * forwardWeight + steerTangZ * tangWeight;
        const finalLen = Math.hypot(finalX, finalZ);
        if (finalLen > 0.001) {
          finalX /= finalLen;
          finalZ /= finalLen;
        }

        this.isSprinting = false;
        return { x: finalX, z: finalZ };
      }

      return { x: dirX, z: dirZ };
    } else {
      this.pickNextAutonomousDestination();
    }

    return { x: 0, z: 0 };
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
    this.resolveNearbyEntityCollisions();
  }

  resolveNearbyEntityCollisions() {
    if (!this.gameApp) return;

    // 1. The other 5 main characters
    if (this.gameApp.npcManager && this.gameApp.npcManager.npcs) {
      resolveEntityCollision(this.position, this.radius, this.gameApp.npcManager.npcs, 0.55);
    }
    // 2. Village Settlers
    if (this.gameApp.villageSettlement && this.gameApp.villageSettlement.villagers) {
      resolveEntityCollision(this.position, this.radius, this.gameApp.villageSettlement.villagers, 0.55);
    }
    // 3. Landmark Realm NPCs
    if (this.gameApp.realmNPCs && this.gameApp.realmNPCs.npcs) {
      resolveEntityCollision(this.position, this.radius, this.gameApp.realmNPCs.npcs, 0.55);
    }
    // 4. Young Pip quest entity
    if (this.gameApp.pipTaskSystem && this.gameApp.pipTaskSystem.pipEntity) {
      resolveEntityCollision(this.position, this.radius, [this.gameApp.pipTaskSystem.pipEntity], 0.5);
    }
    // 5. Vehicle (Warhorse) if not riding
    if (this.gameApp.vehicle && !this.isInVehicle) {
      resolveEntityCollision(this.position, this.radius, [this.gameApp.vehicle], 0.95);
    }
  }

  isTargetNearEntity(targetPos) {
    if (!this.gameApp || !targetPos) return false;
    const thresholdSq = 2.4 * 2.4;

    const check = (list) => {
      if (!list) return false;
      const arr = Array.isArray(list) ? list : (list.values ? Array.from(list.values()) : []);
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const pos = item?.position || item?.group?.position;
        if (pos) {
          const d2 = (targetPos.x - pos.x) ** 2 + (targetPos.z - pos.z) ** 2;
          if (d2 < thresholdSq) return true;
        }
      }
      return false;
    };

    return (
      check(this.gameApp.npcManager?.npcs) ||
      check(this.gameApp.villageSettlement?.villagers) ||
      check(this.gameApp.realmNPCs?.npcs) ||
      check(this.gameApp.pipTaskSystem?.pipEntity ? [this.gameApp.pipTaskSystem.pipEntity] : null)
    );
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
    resolveCircleCollision(this.position, this.radius, this.colliders, 5);
    this.resolveNearbyEntityCollisions();
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

  addGold(amount) {
    this.gold = Math.max(0, (this.gold || 0) + amount);
    return this.gold;
  }

  takeDamage(amount) {
    if (this.isGodMode) return 0;
    const actual = Math.max(1, Math.floor(amount));
    this.currentHp = Math.max(0, this.currentHp - actual);
    return actual;
  }

  exportState() {
    return {
      characterId: this.characterId,
      position: { x: this.position.x, y: this.position.y, z: this.position.z },
      rotation: this.currentRotation,
      level: this.level,
      xp: this.xp,
      xpToNext: this.xpToNext,
      maxHp: this.maxHp,
      currentHp: this.currentHp,
      attackPower: this.attackPower,
      gold: this.gold || 100,
      isAutonomous: this.isAutonomous
    };
  }

  importState(data) {
    if (!data) return;
    if (data.characterId && data.characterId !== this.characterId) {
      this.setCharacter(data.characterId);
    }
    if (data.position && typeof data.position.x === 'number') {
      this.position.set(data.position.x, data.position.y, data.position.z);
      this.group.position.copy(this.position);
    }
    if (typeof data.rotation === 'number') {
      this.currentRotation = data.rotation;
      this.targetRotation = data.rotation;
      this.group.rotation.y = data.rotation;
    }
    if (typeof data.level === 'number') this.level = data.level;
    if (typeof data.xp === 'number') this.xp = data.xp;
    if (typeof data.xpToNext === 'number') this.xpToNext = data.xpToNext;
    if (typeof data.maxHp === 'number') this.maxHp = data.maxHp;
    if (typeof data.currentHp === 'number') this.currentHp = data.currentHp;
    if (typeof data.attackPower === 'number') this.attackPower = data.attackPower;
    if (typeof data.gold === 'number') this.gold = data.gold;
    if (typeof data.isAutonomous === 'boolean') {
      this.toggleAutonomous(data.isAutonomous, true);
    }
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

      // Stop safely outside if target is near an NPC or character
      const stopDist = this.isTargetNearEntity(this.clickTarget) ? 1.8 : 0.8;

      if (dist > stopDist) {
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
      this.isSprinting = inputManager.isSprinting;
      this.clickTarget = null;
      this.clickRing.material.opacity = 0;
    } else if (this.isAutonomous && this.gameApp && !this.clickTarget) {
      if (this._inAutoConversation) {
        // Paused in spontaneous social dialogue
        moveX = 0;
        moveZ = 0;
      } else {
        // 100% Autonomous LLM Self-Driving & Decisions (Character moves itself)
        const autoMove = this.processAutonomousMind(delta);
        moveX = autoMove.x;
        moveZ = autoMove.z;
      }
    } else {
      this.isSprinting = inputManager.isSprinting;
    }

    const isMoving = (Math.hypot(moveX, moveZ) > 0.05);
    this.isMoving = isMoving;

    if (isMoving) {
      // In autonomous mode use controlled, natural human speeds; manual mode uses responsive player speeds
      const autoSpeed = (this.isSprinting ? 7.2 : 4.2) * (this.speedMultiplier || 1.0);
      const manualSpeed = (this.isSprinting ? this.runSpeed : this.walkSpeed) * (this.speedMultiplier || 1.0);
      const speed = this.isAutonomous ? autoSpeed : manualSpeed;
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
        // Entity push first, world colliders second so walls always take precedence!
        this.resolveNearbyEntityCollisions();
        resolveCircleCollision(this.position, this.radius, this.colliders, 3);
      }
      ejectFromColliders(this.position, this.radius, this.colliders);

      // Reactive stuck detection & recovery for autonomous movement
      if (this.isAutonomous) {
        const moved = Math.hypot(this.position.x - prevX, this.position.z - prevZ);
        const expected = speed * delta;
        if (moved < expected * 0.25) {
          // Physical displacement blocked by collider
          this.stuckTimer += delta;
          if (this.stuckTimer > 1.8 && this.avoidanceHoldTimer <= 0) {
            this.avoidanceDir = -this.avoidanceDir;
            this.avoidanceHoldTimer = 0.8;
            ejectFromColliders(this.position, this.radius, this.colliders);
          }
          if (this.stuckTimer > 3.2) {
            // Wedged in geometry; firmly eject and re-route
            ejectFromColliders(this.position, this.radius, this.colliders, 1.0);
            this.stuckTimer = 0;
            this.avoidanceHoldTimer = 0;
            this.navPath = null;
            this.pickNextAutonomousDestination();
          }
        } else {
          // Progressing freely; decay stuck timer
          this.stuckTimer = Math.max(0, this.stuckTimer - delta * 3.0);
        }
      }

      // If click-to-move got completely stopped by a wall or entity, stop attempting
      if (this.clickTarget) {
        const moved = Math.hypot(this.position.x - prevX, this.position.z - prevZ);
        if (moved < 0.005) {
          this.clickTarget = null;
          this.clickRing.material.opacity = 0;
        }
      }

      // Smooth rotation towards movement direction (gentle 6.5 in autonomous mode to prevent jitter)
      this.targetRotation = Math.atan2(moveX, moveZ);
      let diff = this.targetRotation - this.currentRotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      const turnRate = this.isAutonomous ? 6.5 : 12.0;
      this.currentRotation += diff * Math.min(1.0, delta * turnRate);

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
      this.resolveNearbyEntityCollisions();
      resolveCircleCollision(this.position, this.radius, this.colliders, 2);
      ejectFromColliders(this.position, this.radius, this.colliders);
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
    if (this.clickRing && this.clickRing.material && this.clickRing.material.opacity > 0.05) {
      this.clickRing.scale.addScalar(delta * 0.4);
      this.clickRing.material.opacity = Math.max(0, this.clickRing.material.opacity - delta * 0.6);
    }
  }
}
