import * as THREE from 'three';
import { FAST_TRAVEL_POINTS, SANCTUARY_ZONES, RACES } from '../config/constants.js';

export const BRAIN_TIERS = {
  AMBIENT: 1,    // 0 LLM cost: Fast procedural utility routine / behavior schedule
  IMPORTANT: 2,  // Main 6 characters / leaders: Event-driven LLM decisions & periodic reflection
  IN_FOCUS: 3    // Active Creator Dashboard inspection / live dialogue: Real-time LLM reasoning
};

export class NPCBrain {
  constructor(config = {}, brainAdapter, perceptionEngine) {
    this.config = config;
    this.brainAdapter = brainAdapter;
    this.perceptionEngine = perceptionEngine;

    // 1. NPC Persona & Canonical Grounding
    this.id = config.id || 'npc_' + Math.random().toString(36).substr(2, 6);
    this.name = config.name || 'Citizen';
    this.race = config.race || 'human';
    this.age = config.age || (this.race === 'demon' ? 2400 : (this.race === 'elf' ? 450 : (this.race === 'dwarf' ? 180 : 32)));
    this.badge = config.badge || config.title || 'Inhabitant';
    this.color = config.color || '#3b82f6';
    this.raceData = RACES[this.race] || RACES.human;

    this.personality = config.personality || this.getDefaultPersonality(this.race);
    this.background = config.desc || `${this.name} is a dedicated ${this.badge} of the ${this.raceData.homeland}.`;
    this.skills = config.skills || this.getDefaultSkills(this.race, this.badge);

    // 2. Memory System
    this.memories = [];
    this.maxMemories = 16;
    this.initDefaultMemories();

    // 3. Cognitive Tier & Decision Engine State
    this.tier = config.tier || (config.isMain6 ? BRAIN_TIERS.IMPORTANT : BRAIN_TIERS.AMBIENT);
    this.currentGoal = config.initialGoal || 'Serve the prosperity and safety of the realm.';
    this.currentAction = {
      type: 'WALK_TO',
      target: 'Patrol Grounds',
      targetPos: null,
      intention: 'Survey the surrounding territory.',
      status: 'idle', // 'idle' | 'walking' | 'working' | 'talking' | 'fighting'
      timer: 0,
      duration: 5.0
    };

    this.currentThought = {
      observation: `Surveying the realm under the open sky.`,
      inner_thought: `Duty comes first. The realm stands strong.`,
      feeling: 'Vigilant',
      action: 'WALK_TO',
      action_target: 'Patrol Grounds',
      intention: 'Survey the surrounding territory.',
      speech: 'May the light protect our lands.',
      engine: 'Procedural Utility Core',
      timestamp: Date.now()
    };

    // Reflection timer for Tier 2 characters
    this.reflectionTimer = 30.0 + Math.random() * 45.0; // Seconds between autonomous LLM reflections
    this.isThinking = false;
  }

  getDefaultPersonality(race) {
    if (race === 'demon') return 'Proud, fierce, uncompromising, and bound by ancient dark strength.';
    if (race === 'elf') return 'Noble, contemplative, elegant, and reverent of ancient starlight.';
    if (race === 'dwarf') return 'Hardworking, pragmatic, blunt, and passionate about precision metallurgy.';
    return 'Adaptable, ambitious, resourceful, and fiercely loyal to fellow mortals.';
  }

  getDefaultSkills(race, badge) {
    const isWarrior = badge.includes('Hero') || badge.includes('Guard') || badge.includes('King') || badge.includes('Captain');
    const isCraft = badge.includes('Smith') || badge.includes('Horologist') || badge.includes('Alchemist') || badge.includes('Farmer');

    return {
      combat: isWarrior ? 88 : 35,
      crafting: isCraft ? 85 : 40,
      diplomacy: badge.includes('King') || badge.includes('Princess') ? 92 : 45,
      building: race === 'dwarf' ? 82 : (race === 'human' ? 65 : 40)
    };
  }

  initDefaultMemories() {
    this.recordMemory(`Born and sworn to the ideals of ${this.raceData.name}.`, 'LORE', 10);
    this.recordMemory(`Took up the mantle of ${this.badge} in service to the realm.`, 'BACKGROUND', 8);
  }

  /**
   * Records a significant event, encounter, or divine decree into the memory stream.
   */
  recordMemory(text, type = 'EVENT', importance = 5, relatedEntity = null) {
    const memory = {
      id: 'mem_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: Date.now(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: type, // 'DECREE' | 'EVENT' | 'TALK' | 'ACTION' | 'BACKGROUND' | 'LORE'
      text: text,
      importance: Math.min(10, Math.max(1, importance)),
      relatedEntity: relatedEntity
    };

    this.memories.unshift(memory);

    // Keep memory stream bounded
    if (this.memories.length > this.maxMemories) {
      // Sort to preserve highest importance memories while evicting trivial ones
      const topMemories = this.memories.slice(0, 8);
      const remaining = this.memories.slice(8).filter(m => m.importance >= 7);
      this.memories = [...topMemories, ...remaining].slice(0, this.maxMemories);
    }

    return memory;
  }

  getMemoriesSummary(limit = 4) {
    if (this.memories.length === 0) return '';
    return this.memories
      .slice(0, limit)
      .map(m => `• [${m.type}] (Imp: ${m.importance}/10): ${m.text}`)
      .join('\n');
  }

  /**
   * Prompts the Brain to reflect on its surroundings and determine its next thought and action.
   */
  async think(sensorySnapshot, divineWhisper = null, forceLLM = false) {
    if (this.isThinking) return this.currentThought;
    this.isThinking = true;

    try {
      const memoriesSummary = this.getMemoriesSummary(4);

      // Check whether this thought should query the LLM or run on the utility core
      const shouldUseLLM = forceLLM || Boolean(divineWhisper) || this.tier === BRAIN_TIERS.IN_FOCUS || (this.tier === BRAIN_TIERS.IMPORTANT && Math.random() < 0.65);

      let thoughtResult;
      if (shouldUseLLM && this.brainAdapter) {
        thoughtResult = await this.brainAdapter.generateThought(
          this.config,
          sensorySnapshot,
          divineWhisper,
          memoriesSummary
        );
      } else {
        thoughtResult = this.evaluateUtilityRoutine(sensorySnapshot, divineWhisper);
      }

      this.currentThought = {
        ...thoughtResult,
        timestamp: Date.now()
      };

      // Record thought into memory if significant
      if (divineWhisper) {
        this.recordMemory(`Divine Creator whispered: "${divineWhisper}"`, 'DECREE', 10);
      } else if (thoughtResult.action === 'BUILD') {
        this.recordMemory(`Decided to initiate construction in the settlement zone.`, 'ACTION', 8);
      }

      // Convert LLM decision into game action
      this.applyActionDecision(thoughtResult, sensorySnapshot);

      return this.currentThought;
    } finally {
      this.isThinking = false;
    }
  }

  /**
   * Procedural Utility Routine (Tier 1 AI) — Runs in sub-millisecond time.
   * Simulates daily schedules, weather/day-night reaction, and proximity alertness.
   */
  evaluateUtilityRoutine(sensory, divineWhisper) {
    if (divineWhisper) {
      return this.brainAdapter.generateHeuristicThought(this.config, sensory, divineWhisper);
    }

    const isNight = sensory.isNight;
    const hasMonsters = sensory.nearbyMonsters && sensory.nearbyMonsters.length > 0;
    const isCreatorClose = sensory.isCreatorNearby;

    let action = 'WALK_TO';
    let target = sensory.nearestLandmark;
    let intention = 'Patrol around the district.';
    let feeling = 'Content';
    let speech = 'The winds blow fair today.';
    let thought = `Another cycle in ${sensory.biomeName}. Our people work tirelessly.`;

    if (hasMonsters) {
      const m = sensory.nearbyMonsters[0];
      action = 'FIGHT';
      target = m.name;
      feeling = 'Vigilant';
      intention = `Stand alert against the prowling ${m.name}.`;
      speech = `Watch out! Beasts prowling the perimeter!`;
      thought = `A ${m.name} is lingering near the border. If it crosses the ward, it will pay with blood.`;
    } else if (isCreatorClose) {
      action = 'TALK_TO';
      target = 'The Creator';
      feeling = 'Reverent';
      intention = 'Offer respect to the Divine Overseer.';
      speech = 'All honor to the Creator of this world!';
      thought = 'The Divine Architect walks among us. We are truly blessed.';
    } else if (isNight) {
      action = 'REST_AT';
      target = "The Dragon's Rest Tavern";
      feeling = 'Weary';
      intention = 'Seek shelter and rest for the night.';
      speech = 'Darkness settles. Time for a warm hearth.';
      thought = 'The stars watch over our homes. Rest is earned after a long day of labor.';
    } else {
      // Daytime routine based on role
      if (this.badge.includes('Smith') || this.badge.includes('Forge') || this.race === 'dwarf') {
        action = 'WORK_AT';
        target = 'Great Blast Furnaces';
        feeling = 'Industrious';
        intention = 'Forge steel ingots and inspect mechanical gears.';
        speech = 'The fires must never cool!';
        thought = 'Quality iron and balanced gears are the bedrock of civilization.';
      } else if (this.badge.includes('Farmer') || this.badge.includes('Oakhaven')) {
        action = 'WORK_AT';
        target = 'Oakhaven Agricultural Village';
        feeling = 'Productive';
        intention = 'Tend to the golden wheat fields and harvest crops.';
        speech = 'A bountiful harvest this season!';
        thought = 'The kingdom eats because we work the soil with honest hands.';
      } else if (this.badge.includes('Merchant') || this.badge.includes('Barkeep')) {
        action = 'TRADE_WITH';
        target = 'Valoria Market Bazaar';
        feeling = 'Enterprising';
        intention = 'Conduct commerce and trade regional goods.';
        speech = 'Finest wares in all the realm!';
        thought = 'Gold keeps the kingdom humming and connects all four realms.';
      } else if (Math.random() < 0.2) {
        action = 'BUILD';
        target = 'Settlement Expansion';
        feeling = 'Ambitious';
        intention = 'Survey ground for new community infrastructure.';
        speech = 'Our city expands with each passing moon!';
        thought = 'We must build enduring stone and timber structures for generations to come.';
      } else {
        action = 'WALK_TO';
        target = sensory.nearestLandmark;
        feeling = 'Diligent';
        intention = `Patrol near ${sensory.nearestLandmark}.`;
        speech = 'Clear skies over the realm today.';
        thought = `Surveying the boundaries. Peace is preserved through steadfast vigilance.`;
      }
    }

    return {
      observation: `The bells ring across ${sensory.nearestLandmark}. ${sensory.solarPhase} is upon the realm.`,
      inner_thought: thought,
      feeling: feeling,
      action: action,
      action_target: target,
      intention: intention,
      speech: speech,
      engine: 'Procedural Utility Core (Tier 1)',
      isLLM: false,
      backend: 'utility'
    };
  }

  /**
   * Applies the high-level thought action to the internal action controller.
   */
  applyActionDecision(thought, sensory) {
    this.currentAction.type = thought.action || 'WALK_TO';
    this.currentAction.target = thought.action_target || sensory.nearestLandmark;
    this.currentAction.intention = thought.intention || 'Proceed with duty.';
    this.currentAction.status = 'active';
    this.currentAction.timer = 0;
    this.currentAction.duration = 8.0 + Math.random() * 8.0;

    // Resolve destination coordinates
    this.currentAction.targetPos = this.resolveTargetCoordinates(this.currentAction.target, sensory);
  }

  /**
   * Resolves landmark names, districts, or entities into 3D world coordinates.
   */
  resolveTargetCoordinates(targetName, sensory) {
    if (!targetName) return null;
    const clean = targetName.toLowerCase();

    // 1. Search Fast Travel landmarks
    const landmark = FAST_TRAVEL_POINTS.find(pt =>
      clean.includes(pt.name.toLowerCase()) ||
      pt.name.toLowerCase().includes(clean) ||
      clean.includes(pt.id)
    );
    if (landmark) {
      return new THREE.Vector3(landmark.x, 0.5, landmark.z);
    }

    // 2. Search Sanctuary settlements
    const sanctuary = SANCTUARY_ZONES.find(s =>
      clean.includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(clean)
    );
    if (sanctuary) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (sanctuary.radius * 0.5);
      return new THREE.Vector3(sanctuary.x + Math.cos(angle) * r, 0.5, sanctuary.z + Math.sin(angle) * r);
    }

    // 3. Fallback: wander around current landmark or home
    if (sensory && sensory.coords) {
      const angle = Math.random() * Math.PI * 2;
      const r = 8.0 + Math.random() * 12.0;
      return new THREE.Vector3(sensory.coords.x + Math.cos(angle) * r, 0.5, sensory.coords.z + Math.sin(angle) * r);
    }

    return null;
  }

  /**
   * Dispatches and executes the action on the game engine entity.
   * Controls HOW the character performs the action (movement, animations, interactions).
   */
  dispatchAction(delta, entity, gameApp) {
    if (!entity || !entity.group) return;

    // Periodic reflection trigger for Tier 2 (Important NPCs)
    if (this.tier === BRAIN_TIERS.IMPORTANT) {
      this.reflectionTimer -= delta;
      if (this.reflectionTimer <= 0 && !this.isThinking) {
        this.reflectionTimer = 45.0 + Math.random() * 45.0;
        const sensory = this.perceptionEngine.getSensorySnapshot(entity);
        this.think(sensory);
      }
    }

    const action = this.currentAction;
    action.timer += delta;

    switch (action.type) {
      case 'WALK_TO':
      case 'REST_AT':
      case 'TRADE_WITH':
        this.executeMovementAction(delta, entity, action);
        break;

      case 'WORK_AT':
        this.executeWorkAction(delta, entity, action);
        break;

      case 'TALK_TO':
        this.executeTalkAction(delta, entity, gameApp);
        break;

      case 'BUILD':
        this.executeBuildAction(entity, gameApp);
        break;

      case 'FIGHT':
        this.executeFightAction(delta, entity, gameApp);
        break;

      default:
        break;
    }
  }

  executeMovementAction(delta, entity, action) {
    if (!action.targetPos) return;

    const dx = action.targetPos.x - entity.group.position.x;
    const dz = action.targetPos.z - entity.group.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 3.5) {
      // Arrived at destination
      entity.state = 'idle';
      action.status = 'arrived';
      return;
    }

    // Direct entity's pathfinding targetPos
    if (entity.targetPos) {
      entity.targetPos.x = action.targetPos.x;
      entity.targetPos.z = action.targetPos.z;
      entity.state = 'walking';
    }
  }

  executeWorkAction(delta, entity, action) {
    // If far from work site, walk there first
    if (action.targetPos) {
      const dist = Math.hypot(action.targetPos.x - entity.group.position.x, action.targetPos.z - entity.group.position.z);
      if (dist > 3.0) {
        this.executeMovementAction(delta, entity, action);
        return;
      }
    }

    // Play work animation (rhythmic hammer / tool swing with arms)
    entity.state = 'working';
    if (entity.animNodes) {
      const time = performance.now() * 0.005;
      const hammerSwing = Math.sin(time * 3) * 0.6;
      if (entity.animNodes.armR) entity.animNodes.armR.rotation.x = hammerSwing;
      if (entity.animNodes.armL) entity.animNodes.armL.rotation.x = -0.3;
      if (entity.animNodes.torso) entity.animNodes.torso.position.y = 1.35 + Math.abs(Math.sin(time * 3)) * 0.04;
    }
  }

  executeTalkAction(delta, entity, gameApp) {
    entity.state = 'talking';
    const player = gameApp?.player;
    if (player) {
      // Turn to face the player smoothly
      const targetAngle = Math.atan2(player.position.x - entity.group.position.x, player.position.z - entity.group.position.z);
      let diff = targetAngle - entity.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      entity.group.rotation.y += diff * Math.min(1.0, delta * 8.0);
    }

    // Subtle conversational arm gesture
    if (entity.animNodes) {
      const time = performance.now() * 0.003;
      if (entity.animNodes.armR) entity.animNodes.armR.rotation.x = Math.sin(time) * 0.25;
      if (entity.animNodes.armL) entity.animNodes.armL.rotation.x = Math.cos(time) * 0.2;
    }
  }

  executeBuildAction(entity, gameApp) {
    if (!gameApp?.townBuilder) return;

    // Find the NPC's racial expansion zone
    const townBuilder = gameApp.townBuilder;
    const zone = townBuilder.zones?.find(z => z.race === this.race);

    if (zone && zone.buildings.length < zone.maxBuildings) {
      townBuilder.startNewConstruction(zone);
      this.currentAction.type = 'WORK_AT';
      this.currentAction.target = zone.label;
      this.currentAction.targetPos = new THREE.Vector3(zone.center.x, 0.5, zone.center.z);
    } else {
      // If expansion zone full, continue normal routine
      this.currentAction.type = 'WALK_TO';
      this.currentAction.target = 'Settlement Grounds';
    }
  }

  executeFightAction(delta, entity, gameApp) {
    entity.state = 'fighting';
    const monsters = gameApp?.monsterManager?.monsters;
    if (!monsters) return;

    // Find closest hostile beast
    let closestBeast = null;
    let minDist = 30.0;
    monsters.forEach(m => {
      if (m.isDead) return;
      const d = Math.hypot(m.group.position.x - entity.group.position.x, m.group.position.z - entity.group.position.z);
      if (d < minDist) {
        minDist = d;
        closestBeast = m;
      }
    });

    if (closestBeast) {
      // Face monster
      const targetAngle = Math.atan2(closestBeast.group.position.x - entity.group.position.x, closestBeast.group.position.z - entity.group.position.z);
      entity.group.rotation.y = THREE.MathUtils.lerp(entity.group.rotation.y, targetAngle, delta * 8.0);

      // Combat ready stance
      if (entity.animNodes) {
        if (entity.animNodes.armR) entity.animNodes.armR.rotation.x = -1.1; // Weapon raised
        if (entity.animNodes.armL) entity.animNodes.armL.rotation.x = -0.6; // Guard up
      }
    }
  }
}

