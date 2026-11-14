import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';
import { audioSystem } from './AudioSystem.js';

export const TASK_ACTION_TYPES = {
  TRAIN: 'TRAIN',
  HARVEST: 'HARVEST',
  RITUAL: 'RITUAL',
  FORGE: 'FORGE',
  DECREE: 'DECREE',
  AUDIT: 'AUDIT',
  REST: 'REST',
  PATROL: 'PATROL',
  PRAY: 'PRAY',
  SCOUT: 'SCOUT'
};

export const CHARACTER_ROUTINES = {
  hero: [
    {
      id: 'aiden_patrol_crossroads',
      title: 'Continental Sentry at Crossroads Bridge',
      badge: '⚔️ SENTRY',
      locationName: 'Crossroads Sanctuary Bridge',
      x: 0,
      z: 12,
      duration: 35.0,
      type: TASK_ACTION_TYPES.PATROL,
      intention: 'Survey the Great River crossing and ensure realm boundary markers are secure.',
      speech: 'The Crossroads bridge holds peace between all four realms. I will keep it safe.',
      animation: 'sword_drill'
    },
    {
      id: 'aiden_harvest_oakhaven',
      title: 'Agricultural Relief at Oakhaven Village',
      badge: '🌾 HARVEST',
      locationName: 'Oakhaven Agricultural Village',
      x: 105,
      z: 12,
      duration: 30.0,
      type: TASK_ACTION_TYPES.HARVEST,
      intention: 'Help Oakhaven farmers harvest golden grain and check on Young Pip.',
      speech: 'A good harvest keeps the human kingdom thriving. Glad to lend a hand!',
      animation: 'harvest'
    },
    {
      id: 'aiden_barbican_drill',
      title: 'Citadel Gate Guard Drills',
      badge: '🛡️ TRAINING',
      locationName: 'Royal Castle Citadel Gate',
      x: 380,
      z: -325,
      duration: 32.0,
      type: TASK_ACTION_TYPES.TRAIN,
      intention: 'Practice 3-hit Magic Sword katas with Captain Godric outside the South Barbican.',
      speech: 'Dawnblade, guide my strikes! Blade sweep, cross cleave, whirlwind nova!',
      animation: 'sword_drill'
    },
    {
      id: 'aiden_tavern_bounties',
      title: 'Bounty Board & Hearth Rest',
      badge: '🍺 TAVERN',
      locationName: 'The Dragon’s Rest Tavern',
      x: 205,
      z: -74,
      duration: 25.0,
      type: TASK_ACTION_TYPES.REST,
      intention: 'Review rogue beast bounties and rest beside the tavern hearth fire.',
      speech: 'No monster raids reported on the trade roads today. Time for a well-earned drink.',
      animation: 'rest'
    },
    {
      id: 'aiden_vance_mentorship',
      title: 'Master Vance Swordplay Sparring',
      badge: '🏔️ MASTERY',
      locationName: 'Retired Hero’s Rustic Lodge',
      x: 130,
      z: 252,
      duration: 35.0,
      type: TASK_ACTION_TYPES.TRAIN,
      intention: 'Ascend to Vance’s rustic foothills lodge to study veteran combat tactics.',
      speech: 'Master Vance taught me: true strength is defending those who cannot fight.',
      animation: 'sparring'
    },
    {
      id: 'aiden_scout_fernbrook',
      title: 'Scouting the Elven Border River',
      badge: '🌲 RECON',
      locationName: 'Fernbrook Woodland Orchard',
      x: -75,
      z: 110,
      duration: 30.0,
      type: TASK_ACTION_TYPES.SCOUT,
      intention: 'Patrol along the sweet apple orchards near the elven river crossing.',
      speech: 'The Great River waters run clear here. No signs of dark fiends.',
      animation: 'scout'
    }
  ],

  princess: [
    {
      id: 'aurelia_garden_roses',
      title: 'Royal Sun Pavilion Garden Cultivation',
      badge: '🌹 GARDEN',
      locationName: 'Princess Aurelia’s Sun Pavilion',
      x: 470,
      z: -365,
      duration: 32.0,
      type: TASK_ACTION_TYPES.HARVEST,
      intention: 'Tend celestial golden and red rose planters in the East Royal Gardens.',
      speech: 'These celestial roses flourish under the morning sunlight. Truly divine.',
      animation: 'harvest'
    },
    {
      id: 'aurelia_high_court',
      title: 'High Citadel Throne Room Audience',
      badge: '👑 ROYAL COURT',
      locationName: 'Royal Castle Throne Room',
      x: 380,
      z: -375,
      duration: 35.0,
      type: TASK_ACTION_TYPES.DECREE,
      intention: 'Attend High King Reginald’s court, reviewing kingdom trade petitions.',
      speech: 'A true monarch balances elven celestial grace with the grit of our people.',
      animation: 'court'
    },
    {
      id: 'aurelia_promenade_lion',
      title: 'Promenade at High Valoria Lion Fountain',
      badge: '🏛️ PROMENADE',
      locationName: 'High Valoria Castle Town',
      x: 356,
      z: -248,
      duration: 30.0,
      type: TASK_ACTION_TYPES.PATROL,
      intention: 'Walk the white marble plaza, inspect clocktower street, and greet citizens.',
      speech: 'High Valoria flourishes. The lion fountain shimmers with pure spring water.',
      animation: 'royal_wave'
    },
    {
      id: 'aurelia_elven_mana_pool',
      title: 'Celestial Pilgrimage to Starlight Mana Pool',
      badge: '🌿 STLIGHT RITUAL',
      locationName: 'Sylvaheim Elven Glade',
      x: -160,
      z: 80,
      duration: 40.0,
      type: TASK_ACTION_TYPES.PRAY,
      intention: 'Consult Alchemist Lunara at the Starlight Pool and distill celestial mana lotus.',
      speech: 'Starlight flows through every living petal. The elves possess ancient wisdom.',
      animation: 'pray'
    },
    {
      id: 'aurelia_charity_fernbrook',
      title: 'Fernbrook Riverside Charity Distribution',
      badge: '🧺 CHARITY',
      locationName: 'Fernbrook Woodland Hamlet',
      x: -75,
      z: 115,
      duration: 30.0,
      type: TASK_ACTION_TYPES.HARVEST,
      intention: 'Inspect herbal beehives and orchards, offering royal blessings to villagers.',
      speech: 'May our crown always provide for the humble orchards of the realm.',
      animation: 'harvest'
    },
    {
      id: 'aurelia_bazaar_audit',
      title: 'Bazaar Guildhouse Fair Pricing Audit',
      badge: '⚖️ GUILD AUDIT',
      locationName: 'Valoria Market Bazaar',
      x: 205,
      z: -100,
      duration: 28.0,
      type: TASK_ACTION_TYPES.AUDIT,
      intention: 'Audit merchant stall ledgers to ensure fair tariffs across human and dwarven goods.',
      speech: 'Commerce must remain honest and thriving for every family in Valoria.',
      animation: 'audit'
    }
  ],

  demonking: [
    {
      id: 'malakor_throne_skulls',
      title: 'Dominion over the Throne of Skulls',
      badge: '🔥 DREAD MONARCH',
      locationName: 'Obsidian Dread Fortress',
      x: -220,
      z: -220,
      duration: 38.0,
      type: TASK_ACTION_TYPES.DECREE,
      intention: 'Preside upon the obsidian throne overlooking the boiling magma moat.',
      speech: 'Let the mortals bicker in their stone pens. The abyss bides its time!',
      animation: 'dread_rule'
    },
    {
      id: 'malakor_void_ritual',
      title: 'Void Sacrificial Altar Incantation',
      badge: '🔮 VOID RITUAL',
      locationName: 'Void Sacrificial Altar',
      x: -270,
      z: -245,
      duration: 42.0,
      type: TASK_ACTION_TYPES.RITUAL,
      intention: 'Channel dark netherflames into the floating purple Nether Crystal on the dais.',
      speech: 'Darkness, heed my call! Netherflames shall reduce all weak pacts to cinders!',
      animation: 'ritual_cast'
    },
    {
      id: 'malakor_outpost_muster',
      title: 'Krag’mar Demon Outpost Muster',
      badge: '💀 MUSTER',
      locationName: 'Krag’mar Demon Enclave',
      x: -120,
      z: -90,
      duration: 35.0,
      type: TASK_ACTION_TYPES.TRAIN,
      intention: 'Drill dread horned warriors around the boiling sulfur cauldron.',
      speech: 'Sharpen your obsidian claws! When the void opens, no border will stand!',
      animation: 'sword_drill'
    },
    {
      id: 'malakor_river_threat',
      title: 'Great River Border Menace',
      badge: '🌊 MENACE',
      locationName: 'Great River Nether Bluff',
      x: -45,
      z: -30,
      duration: 30.0,
      type: TASK_ACTION_TYPES.SCOUT,
      intention: 'Stand at the river cliff opposite Crossroads, surveying the mortal kingdoms with wrath.',
      speech: 'Crossroads bridge... a flimsy wooden arch dividing kindling from the fire!',
      animation: 'scout'
    },
    {
      id: 'malakor_basalt_patrol',
      title: 'Basalt Perimeter Towers Inspection',
      badge: '🌋 BASALT PATROL',
      locationName: 'Obsidian Dread Keep Perimeters',
      x: -180,
      z: -170,
      duration: 32.0,
      type: TASK_ACTION_TYPES.PATROL,
      intention: 'Stoke the nether braziers and inspect demonic sentinels along the basalt moat.',
      speech: 'Keep the magma boiling. None shall trespass upon Malakor’s domain.',
      animation: 'patrol'
    }
  ],

  op_side: [
    {
      id: 'kage_bazaar_prowl',
      title: 'Valoria Bazaar Alleyway Prowl',
      badge: '⚡ SHADOW PROWL',
      locationName: 'Valoria Market Bazaar',
      x: 205,
      z: -112,
      duration: 25.0,
      type: TASK_ACTION_TYPES.SCOUT,
      intention: 'Lean against sun-baked stone walls, observing merchant crowds in quiet aloofness.',
      speech: 'Everyone runs around chasing coins. As if gold could ever parry my blade.',
      animation: 'aloof_watch'
    },
    {
      id: 'kage_river_katas',
      title: 'Crossroads Riverbank Muramasa Katas',
      badge: '🗡️ KATAS',
      locationName: 'Crossroads Riverbank Stones',
      x: 25,
      z: 20,
      duration: 36.0,
      type: TASK_ACTION_TYPES.TRAIN,
      intention: 'Practice lightning-fast iaido slashes and wind cuts over the rushing Great River.',
      speech: 'One cut to sever the mist. Two cuts to split the stream.',
      animation: 'sword_drill'
    },
    {
      id: 'kage_tavern_corner',
      title: 'Dragon’s Rest Corner Inspection',
      badge: '🍺 CORNER REST',
      locationName: 'The Dragon’s Rest Tavern',
      x: 208,
      z: -82,
      duration: 28.0,
      type: TASK_ACTION_TYPES.REST,
      intention: 'Drink dark ale in the shadows while scanning wanted posters of calamity beasts.',
      speech: 'A mythical dragon on the loose? Hmph. Might be worth unsheathing for once.',
      animation: 'rest'
    },
    {
      id: 'kage_demon_recon',
      title: 'Krag’mar Nether Ash Reconnaissance',
      badge: '🌑 ASHE RECON',
      locationName: 'Krag’mar Volcanic Ridge',
      x: -95,
      z: -75,
      duration: 34.0,
      type: TASK_ACTION_TYPES.SCOUT,
      intention: 'Scout along volcanic ash ridges, testing blade edge against dark basalt pillars.',
      speech: 'Demon fiends think they are terrifying. They’ve clearly never faced my Muramasa.',
      animation: 'sword_drill'
    },
    {
      id: 'kage_citadel_overlook',
      title: 'High Valoria Citadel Overlook Vigil',
      badge: '🏰 HIGH VIGIL',
      locationName: 'High Valoria Citadel Overlook',
      x: 345,
      z: -280,
      duration: 30.0,
      type: TASK_ACTION_TYPES.SCOUT,
      intention: 'Stand upon the highest stone promontory watching over the entire kingdom.',
      speech: 'The wind is nice up here. Quiet. Just the way I like it.',
      animation: 'aloof_watch'
    },
    {
      id: 'kage_forest_meditation',
      title: 'Ancient Riverside Oak Meditation',
      badge: '🌲 MEDITATION',
      locationName: 'Ancient Riverside Glade',
      x: -40,
      z: 60,
      duration: 32.0,
      type: TASK_ACTION_TYPES.PRAY,
      intention: 'Sit beneath the ancient oak tree in deep silent meditation.',
      speech: 'Still mind... sharp edge. Nothing escapes my perception.',
      animation: 'pray'
    }
  ],

  king: [
    {
      id: 'reginald_throne_court',
      title: 'Sovereign Audience on High Throne',
      badge: '⚜️ HIGH COURT',
      locationName: 'Royal Castle Throne Room',
      x: 380,
      z: -375,
      duration: 40.0,
      type: TASK_ACTION_TYPES.DECREE,
      intention: 'Preside over the High Court of Valoria, issuing royal edicts to chancellor and nobles.',
      speech: 'Humans carved this kingdom out of wilderness! I will see our realm united and strong!',
      animation: 'court'
    },
    {
      id: 'reginald_barbican_parade',
      title: 'Citadel Moat Drawbridge Inspection',
      badge: '🛡️ ARMY INSPECTION',
      locationName: 'South Barbican Drawbridge',
      x: 380,
      z: -325,
      duration: 35.0,
      type: TASK_ACTION_TYPES.PATROL,
      intention: 'Parade across the drawbridge, inspecting armor and halberds of royal knight patrols.',
      speech: 'Valoria’s knights! Stand tall! When dragons or demons strike, you are our shield!',
      animation: 'patrol'
    },
    {
      id: 'reginald_bank_audit',
      title: 'High Valoria Royal Bank & Vault Audit',
      badge: '🏛️ TREASURY',
      locationName: 'High Valoria Royal Bank',
      x: 365,
      z: -245,
      duration: 32.0,
      type: TASK_ACTION_TYPES.AUDIT,
      intention: 'Audit bullion vaults and discuss kingdom trade tariffs with royal bankers.',
      speech: 'Every golden coin in our treasury must support our towns, farms, and garrisons.',
      animation: 'audit'
    },
    {
      id: 'reginald_granary_visit',
      title: 'Oakhaven Granary State Inspection',
      badge: '🌾 STATE VISIT',
      locationName: 'Oakhaven Communal Granary',
      x: 108,
      z: 18,
      duration: 35.0,
      type: TASK_ACTION_TYPES.HARVEST,
      intention: 'Tour communal grain silos, praising farmers and ensuring winter wheat reserves.',
      speech: 'The true strength of Valoria lies in the soil and hands of our faithful farmers!',
      animation: 'harvest'
    },
    {
      id: 'reginald_library_codex',
      title: 'High Court Library Treaties Review',
      badge: '📜 SCHOLAR',
      locationName: 'High Valoria Court Library',
      x: 390,
      z: -260,
      duration: 30.0,
      type: TASK_ACTION_TYPES.AUDIT,
      intention: 'Read ancient four-realm historical pacts and consult cartographic charts.',
      speech: 'Knowledge of the past shields our realm from the errors of our ancestors.',
      animation: 'audit'
    }
  ],

  retired_hero: [
    {
      id: 'vance_hearth_polishing',
      title: 'Rustic Lodge Hearth & Broadsword Maintenance',
      badge: '🔥 HEARTH REST',
      locationName: 'Master Vance’s Rustic Lodge',
      x: 130,
      z: 252,
      duration: 35.0,
      type: TASK_ACTION_TYPES.REST,
      intention: 'Stoke the stone hearth fire in the thatched cabin and oil the Vanguard Broadsword.',
      speech: 'An old soldier’s sword must never rust. The hearth fire keeps the cold away.',
      animation: 'rest'
    },
    {
      id: 'vance_furnace_consult',
      title: 'Great Blast Furnaces Iron Smelting',
      badge: '⚙️ FORGE CONSULT',
      locationName: 'Great Blast Furnaces',
      x: 140,
      z: 230,
      duration: 36.0,
      type: TASK_ACTION_TYPES.FORGE,
      intention: 'Consult with dwarven blacksmiths and inspect red-hot iron billets on the anvil.',
      speech: 'Dwarven metallurgy is unrivaled. Strike while the molten iron is glowing!',
      animation: 'forge'
    },
    {
      id: 'vance_mountain_march',
      title: 'Karak-Drak Mountain Bastion March',
      badge: '🏔️ MOUNTAIN MARCH',
      locationName: 'Karak-Drak Mountain Bastion',
      x: 200,
      z: 185,
      duration: 35.0,
      type: TASK_ACTION_TYPES.PATROL,
      intention: 'March up to the mountain bastion, saluting the colossal dwarven guard statues.',
      speech: 'Still stand proud, old stones. Many a fierce battle was fought on these slopes.',
      animation: 'patrol'
    },
    {
      id: 'vance_train_pip',
      title: 'Young Pip Knightly Sparring at Oakhaven',
      badge: '⚔️ SQUIRE LESSON',
      locationName: 'Oakhaven Farmlands',
      x: 98,
      z: 22,
      duration: 38.0,
      type: TASK_ACTION_TYPES.TRAIN,
      intention: 'Travel to Oakhaven to teach Young Pip proper two-handed sword parries.',
      speech: 'Keep your footing low, Young Pip! A knight fights with balance, not just bravado!',
      animation: 'sparring'
    },
    {
      id: 'vance_tavern_tales',
      title: 'Dragon’s Rest Tavern Legendary Tales',
      badge: '🍺 WAR TALES',
      locationName: 'The Dragon’s Rest Tavern',
      x: 202,
      z: -78,
      duration: 30.0,
      type: TASK_ACTION_TYPES.REST,
      intention: 'Share legendary war stories with young adventurers over foaming mugs of ale.',
      speech: 'Let me tell you about the Great Wyrm of the Frost Pass... a toast to fallen comrades!',
      animation: 'rest'
    }
  ]
};

export class CharacterRoutineSystem {
  constructor(scene, gameApp) {
    this.scene = scene;
    this.gameApp = gameApp;

    // Track active routine state for each character id
    this.characterStates = new Map(); // id -> { currentIndex, state: 'TRAVELING'|'WORKING', timer, completedCount, ... }

    this.initCharacterStates();
    this.setupModalDOM();
  }

  initCharacterStates() {
    Object.keys(CHARACTER_ROUTINES).forEach(charId => {
      this.characterStates.set(charId, {
        charId: charId,
        currentIndex: 0,
        state: 'TRAVELING', // 'TRAVELING' | 'WORKING'
        taskTimer: 0,
        workDuration: 30.0,
        completedCount: 0,
        animTimer: 0,
        speechTimer: 5.0 + Math.random() * 5.0
      });
    });
  }

  getCurrentTask(charId) {
    const list = CHARACTER_ROUTINES[charId];
    if (!list || list.length === 0) return null;

    const state = this.characterStates.get(charId);
    const idx = state ? (state.currentIndex % list.length) : 0;
    return list[idx];
  }

  getCurrentState(charId) {
    return this.characterStates.get(charId) || null;
  }

  exportState() {
    const data = {};
    for (const [charId, state] of this.characterStates.entries()) {
      data[charId] = {
        currentIndex: state.currentIndex,
        state: state.state,
        taskTimer: state.taskTimer,
        workDuration: state.workDuration,
        completedCount: state.completedCount
      };
    }
    return data;
  }

  importState(data) {
    if (!data) return;
    for (const [charId, saved] of Object.entries(data)) {
      if (this.characterStates.has(charId)) {
        const state = this.characterStates.get(charId);
        state.currentIndex = saved.currentIndex || 0;
        state.state = saved.state || 'TRAVELING';
        state.taskTimer = saved.taskTimer || 0;
        state.workDuration = saved.workDuration || 30.0;
        state.completedCount = saved.completedCount || 0;
      }
    }
  }

  simulateOfflineProgress(elapsedSeconds) {
    const summary = [];
    for (const [charId, state] of this.characterStates.entries()) {
      const list = CHARACTER_ROUTINES[charId];
      if (!list || list.length === 0) continue;

      let remaining = elapsedSeconds;
      let tasksDone = 0;

      while (remaining > 0 && tasksDone < 25) {
        const curTask = list[state.currentIndex % list.length];
        const taskDuration = curTask.duration || 30.0;
        if (remaining >= taskDuration) {
          remaining -= taskDuration;
          state.currentIndex = (state.currentIndex + 1) % list.length;
          state.completedCount++;
          tasksDone++;
        } else {
          state.state = 'WORKING';
          state.taskTimer = Math.max(5.0, taskDuration - remaining);
          break;
        }
      }

      if (tasksDone > 0) {
        const charConfig = getCharacterById(charId);
        summary.push({
          charId,
          charName: charConfig?.name || charId,
          badge: charConfig?.badge || '👤 HERO',
          color: charConfig?.color || '#3b82f6',
          tasksDone,
          lastTask: list[state.currentIndex % list.length]
        });
      }
    }
    return summary;
  }

  /**
   * Advances a character to their next scheduled task, logging episodic memory to their NPCBrain.
   */
  advanceToNextTask(charId, brain = null) {
    const list = CHARACTER_ROUTINES[charId];
    if (!list || list.length === 0) return;

    let state = this.characterStates.get(charId);
    if (!state) {
      state = { charId, currentIndex: 0, state: 'TRAVELING', taskTimer: 0, workDuration: 30.0, completedCount: 0, animTimer: 0 };
      this.characterStates.set(charId, state);
    }

    const completedTask = list[state.currentIndex % list.length];
    state.completedCount++;
    state.currentIndex = (state.currentIndex + 1) % list.length;
    state.state = 'TRAVELING';
    state.taskTimer = 0;

    const nextTask = list[state.currentIndex];

    // Log rich episodic memory into the character's LLM Mind
    if (brain && brain.recordMemory) {
      brain.recordMemory(
        `Completed duty: ${completedTask.title} at ${completedTask.locationName}. Proceeding to ${nextTask.locationName} for ${nextTask.title}.`,
        'ACTION',
        8
      );
    }

    // Floating celebration banner
    if (this.gameApp?.combatSystem) {
      const pos = this.getCharacterPosition(charId);
      if (pos) {
        this.gameApp.combatSystem.spawnFloatingText(
          pos,
          `✨ Done: ${completedTask.badge}! Next: ${nextTask.badge}`,
          '#38bdf8'
        );
      }
    }

    // Refresh modal if currently open
    this.refreshModalContent();
    return nextTask;
  }

  getCharacterPosition(charId) {
    if (this.gameApp?.player && this.gameApp.player.characterId === charId) {
      return this.gameApp.player.position;
    }
    if (this.gameApp?.npcManager && this.gameApp.npcManager.npcs.has(charId)) {
      return this.gameApp.npcManager.npcs.get(charId).group.position;
    }
    return null;
  }

  /**
   * Called on every frame from the master loop to progress task timers and animate busy actions.
   */
  update(delta) {
    this.characterStates.forEach((state, charId) => {
      const currentTask = this.getCurrentTask(charId);
      if (!currentTask) return;

      const pos = this.getCharacterPosition(charId);
      if (!pos) return;

      const distToGoal = Math.hypot(currentTask.x - pos.x, currentTask.z - pos.z);

      if (state.state === 'TRAVELING') {
        // Arrival check: within 3.8m of task waypoint
        if (distToGoal <= 3.8) {
          state.state = 'WORKING';
          state.taskTimer = currentTask.duration;
          state.workDuration = currentTask.duration;

          // Announce arrival with voice speech float
          if (this.gameApp?.combatSystem && currentTask.speech) {
            const floatPos = pos.clone();
            floatPos.y += 2.8;
            this.gameApp.combatSystem.spawnFloatingText(
              floatPos,
              `💬 ${currentTask.speech}`,
              '#fef08a'
            );
          }
          const playerPos = this.gameApp?.player?.position;
          const isNearPlayer = playerPos && Math.hypot(pos.x - playerPos.x, pos.z - playerPos.z) < 25;
          const isSpectatingThis = this.gameApp?.cameraManager?.isSpectating && this.gameApp?.cameraManager?.spectateName === charId;
          if (isNearPlayer || isSpectatingThis) {
            audioSystem.playChime();
          }
        }
      } else if (state.state === 'WORKING') {
        state.taskTimer -= delta;
        state.animTimer += delta;

        // Contextual task animations: drive arm gestures and sword swooshes
        this.animateTaskAction(charId, currentTask, delta, state.animTimer);

        if (state.taskTimer <= 0) {
          // Finished work, advance to next destination
          let brain = null;
          if (this.gameApp?.player && this.gameApp.player.characterId === charId) {
            brain = this.gameApp.player.brain;
          } else if (this.gameApp?.npcManager?.npcs?.has(charId)) {
            brain = this.gameApp.npcManager.npcs.get(charId).brain;
          }

          this.advanceToNextTask(charId, brain);
        }
      }
    });

    // Update modal timers if open
    this.updateModalLiveTimers();
  }

  /**
   * Procedural low-poly visual animation for characters actively performing their tasks.
   */
  animateTaskAction(charId, task, delta, animTimer) {
    let animNodes = null;
    if (this.gameApp?.player && this.gameApp.player.characterId === charId) {
      animNodes = this.gameApp.player.animNodes;
    } else if (this.gameApp?.npcManager?.npcs?.has(charId)) {
      animNodes = this.gameApp.npcManager.npcs.get(charId).animNodes;
    }
    if (!animNodes) return;

    if (task.type === TASK_ACTION_TYPES.TRAIN) {
      // 3-hit kata swings with sword
      const swingSpeed = 6.0;
      const swing = Math.sin(animTimer * swingSpeed);
      if (animNodes.armR) {
        animNodes.armR.rotation.x = -1.2 + swing * 0.9;
        animNodes.armR.rotation.y = swing * 0.6;
      }
      if (animNodes.armL) {
        animNodes.armL.rotation.x = -0.4;
      }
    } else if (task.type === TASK_ACTION_TYPES.HARVEST) {
      // Bending down to tend crops or roses
      const bend = Math.sin(animTimer * 2.5);
      if (animNodes.torso) {
        animNodes.torso.rotation.x = 0.25 + Math.abs(bend) * 0.2;
      }
      if (animNodes.armR) {
        animNodes.armR.rotation.x = -0.6 + bend * 0.5;
      }
      if (animNodes.armL) {
        animNodes.armL.rotation.x = -0.6 - bend * 0.5;
      }
    } else if (task.type === TASK_ACTION_TYPES.RITUAL || task.type === TASK_ACTION_TYPES.PRAY) {
      // Arms raised high in incantation / prayer
      const sway = Math.sin(animTimer * 1.8) * 0.15;
      if (animNodes.armR) {
        animNodes.armR.rotation.x = -2.2 + sway;
        animNodes.armR.rotation.z = -0.3;
      }
      if (animNodes.armL) {
        animNodes.armL.rotation.x = -2.2 - sway;
        animNodes.armL.rotation.z = 0.3;
      }
      if (animNodes.torso) {
        animNodes.torso.position.y = 1.35 + Math.abs(Math.sin(animTimer * 1.5)) * 0.08;
      }
    } else if (task.type === TASK_ACTION_TYPES.FORGE) {
      // Rhythmic anvil hammering
      const hammer = Math.sin(animTimer * 4.0);
      if (animNodes.armR) {
        animNodes.armR.rotation.x = (hammer > 0) ? -1.8 : -0.4;
      }
      if (animNodes.armL) {
        animNodes.armL.rotation.x = -0.8;
      }
    } else if (task.type === TASK_ACTION_TYPES.DECREE || task.type === TASK_ACTION_TYPES.AUDIT) {
      // Regal posture / reviewing parchment
      if (animNodes.armR) {
        animNodes.armR.rotation.x = -0.9 + Math.sin(animTimer * 1.2) * 0.15;
        animNodes.armR.rotation.y = -0.4;
      }
      if (animNodes.armL) {
        animNodes.armL.rotation.x = -0.9 - Math.sin(animTimer * 1.2) * 0.15;
        animNodes.armL.rotation.y = 0.4;
      }
    }
  }

  // -------------------------------------------------------------
  // REALM CITIZENS & TASKS AGENDA MODAL (UI)
  // -------------------------------------------------------------
  setupModalDOM() {
    this.modalBackdrop = document.createElement('div');
    this.modalBackdrop.className = 'character-tasks-modal-backdrop';
    this.modalBackdrop.style.display = 'none';

    this.modalBackdrop.innerHTML = `
      <div class="tasks-modal-card">
        <div class="tasks-modal-header">
          <div class="tasks-header-brand">
            <span class="tasks-crest-icon">📋</span>
            <div>
              <div class="tasks-modal-title">REALM CITIZEN TASKS & DAILY AGENDAS</div>
              <div class="tasks-modal-subtitle">Autonomous Medieval RPG Schedules & Continental Duties • Key [J]</div>
            </div>
          </div>
          <button class="btn-tasks-close" id="btnCloseTasksModal" title="Close Agenda [Esc] / [J]">✕</button>
        </div>

        <div class="tasks-filter-bar">
          <button class="btn-task-filter active" data-filter="all">All Citizens</button>
          <button class="btn-task-filter" data-filter="main6">Main 6 Heroes</button>
          <button class="btn-task-filter" data-filter="human">Kingdom of Valoria</button>
          <button class="btn-task-filter" data-filter="demon">Demon Territory</button>
          <button class="btn-task-filter" data-filter="dwarf">Dwarf Foothills</button>
        </div>

        <div class="tasks-card-grid" id="tasksCardGrid"></div>

        <div class="tasks-modal-footer">
          <div class="tasks-footer-hint">
            <span>💡 <b>Tip:</b> Click <b>"👁️ Watch in God's Roam"</b> to have the divine spectator camera fly across the continent and track any character!</span>
          </div>
          <button class="btn-tasks-done" id="btnDoneTasksModal">Close Agenda [J]</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modalBackdrop);

    // Event listeners
    this.modalBackdrop.querySelector('#btnCloseTasksModal').addEventListener('click', () => this.closeModal());
    this.modalBackdrop.querySelector('#btnDoneTasksModal').addEventListener('click', () => this.closeModal());
    this.modalBackdrop.addEventListener('click', (e) => {
      if (e.target === this.modalBackdrop) this.closeModal();
    });

    const filterBtns = this.modalBackdrop.querySelectorAll('.btn-task-filter');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter;
        this.refreshModalContent();
      });
    });

    this.activeFilter = 'all';
  }

  toggleModal() {
    if (this.modalBackdrop.style.display === 'flex') {
      this.closeModal();
    } else {
      this.openModal();
    }
  }

  openModal() {
    this.modalBackdrop.style.display = 'flex';
    this.refreshModalContent();
    audioSystem.playChime();
  }

  closeModal() {
    this.modalBackdrop.style.display = 'none';
    audioSystem.playDoorChime(true);
  }

  refreshModalContent() {
    const grid = this.modalBackdrop.querySelector('#tasksCardGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const charConfigs = [
      { id: 'hero', name: 'Hero Aiden', race: 'human', badge: '⚔️ HERO', color: '#3b82f6', homeland: 'Crossroads Sanctuary Bridge' },
      { id: 'princess', name: 'Princess Aurelia', race: 'human', badge: '👑 PRINCESS', color: '#ec4899', homeland: 'Royal Sun Pavilion' },
      { id: 'demonking', name: 'Demon King Malakor', race: 'demon', badge: '🔥 DEMON KING', color: '#ef4444', homeland: 'Obsidian Dread Fortress' },
      { id: 'op_side', name: 'Kage', race: 'human', badge: '⚡ OP SIDE HERO', color: '#8b5cf6', homeland: 'Valoria Market Bazaar' },
      { id: 'king', name: 'High King Reginald', race: 'human', badge: '⚜️ HIGH KING', color: '#f59e0b', homeland: 'Royal Castle Throne Room' },
      { id: 'retired_hero', name: 'Master Vance', race: 'human', badge: '🏔️ RETIRED HERO', color: '#10b981', homeland: 'Master Vance’s Rustic Lodge' }
    ];

    const filtered = charConfigs.filter(c => {
      if (this.activeFilter === 'all') return true;
      if (this.activeFilter === 'main6') return true;
      if (this.activeFilter === 'human') return c.race === 'human' && c.id !== 'retired_hero';
      if (this.activeFilter === 'demon') return c.race === 'demon';
      if (this.activeFilter === 'dwarf') return c.id === 'retired_hero';
      return true;
    });

    filtered.forEach(c => {
      const routine = CHARACTER_ROUTINES[c.id] || [];
      const state = this.characterStates.get(c.id);
      const currentTask = this.getCurrentTask(c.id);
      if (!currentTask) return;

      const isWorking = state && state.state === 'WORKING';
      const timeLeft = state ? Math.max(0, Math.ceil(state.taskTimer)) : 30;
      const nextIdx = state ? (state.currentIndex + 1) % routine.length : 1;
      const nextTask = routine[nextIdx] || routine[0];

      const card = document.createElement('div');
      card.className = 'task-character-card';
      card.style.borderLeft = `4px solid ${c.color}`;

      card.innerHTML = `
        <div class="task-char-top">
          <div class="task-char-identity">
            <span class="task-char-avatar" style="background: ${c.color}22; color: ${c.color};">${c.badge.split(' ')[0]}</span>
            <div>
              <div class="task-char-name">${c.name}</div>
              <div class="task-char-badge" style="color: ${c.color};">${c.badge}</div>
            </div>
          </div>
          <span class="task-status-pill ${isWorking ? 'status-working' : 'status-traveling'}">
            <span class="status-dot"></span>
            ${isWorking ? 'ACTIVE TASK' : 'TRAVELING'}
          </span>
        </div>

        <div class="task-current-box">
          <div class="task-current-title">
            <span>${currentTask.badge}</span> ${currentTask.title}
          </div>
          <div class="task-current-location">
            📍 <b>Location:</b> ${currentTask.locationName} (X: ${currentTask.x}, Z: ${currentTask.z})
          </div>
          <div class="task-current-intention">
            💭 "${currentTask.intention}"
          </div>
          <div class="task-progress-row">
            <div class="task-time-bar">
              <div class="task-time-fill" style="width: ${isWorking ? Math.max(5, (timeLeft / (state?.workDuration || 30)) * 100) : 100}%;"></div>
            </div>
            <span class="task-time-text">${isWorking ? `${timeLeft}s left` : 'En route'}</span>
          </div>
        </div>

        <div class="task-next-hint">
          <span>➡️ <b>Up Next:</b> ${nextTask.badge} ${nextTask.title}</span>
        </div>

        <div class="task-card-actions">
          <button class="btn-task-action btn-task-spectate" data-char="${c.id}" title="Watch this character do their tasks in God's Roam view!">
            👁️ Watch in God's Roam
          </button>
          <button class="btn-task-action btn-task-possess" data-char="${c.id}" title="Take direct control of this hero!">
            🎮 Possess [Enter]
          </button>
        </div>
      `;

      card.querySelector('.btn-task-spectate').addEventListener('click', () => {
        this.closeModal();
        if (this.gameApp?.startGodRoam) {
          this.gameApp.startGodRoam(c.id);
        }
      });

      card.querySelector('.btn-task-possess').addEventListener('click', () => {
        this.closeModal();
        if (this.gameApp?.switchPlayableCharacter) {
          const npc = this.gameApp.npcManager?.npcs?.get(c.id);
          const livePos = npc?.group?.position;
          this.gameApp.switchPlayableCharacter(c.id, false);
          if (livePos) {
            this.gameApp.player.teleport(livePos.x, livePos.z);
          }
        }
      });

      grid.appendChild(card);
    });
  }

  updateModalLiveTimers() {
    if (this.modalBackdrop.style.display !== 'flex') return;

    this.characterStates.forEach((state, charId) => {
      const card = this.modalBackdrop.querySelector(`.btn-task-spectate[data-char="${charId}"]`)?.closest('.task-character-card');
      if (!card) return;

      const isWorking = state.state === 'WORKING';
      const timeLeft = Math.max(0, Math.ceil(state.taskTimer));
      const fillEl = card.querySelector('.task-time-fill');
      const textEl = card.querySelector('.task-time-text');
      const statusPill = card.querySelector('.task-status-pill');

      if (fillEl) {
        fillEl.style.width = isWorking ? `${Math.max(5, (timeLeft / (state.workDuration || 30)) * 100)}%` : '100%';
      }
      if (textEl) {
        textEl.textContent = isWorking ? `${timeLeft}s left` : 'En route';
      }
      if (statusPill) {
        statusPill.className = `task-status-pill ${isWorking ? 'status-working' : 'status-traveling'}`;
        statusPill.innerHTML = `<span class="status-dot"></span> ${isWorking ? 'ACTIVE TASK' : 'TRAVELING'}`;
      }
    });
  }
}
