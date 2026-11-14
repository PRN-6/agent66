import * as THREE from 'three';
import './style.css';
import { CAMERA_MODES, ROOF_MODES } from './config/constants.js';
import { getCharacterById } from './config/characters.js';
import { Terrain } from './world/Terrain.js';
import { Water } from './world/Water.js';
import { KingdomBiome } from './world/KingdomBiome.js';
import { DemonBiome } from './world/DemonBiome.js';
import { ElvenBiome } from './world/ElvenBiome.js';
import { DwarfBiome } from './world/DwarfBiome.js';
import { JungleBiome } from './world/JungleBiome.js';
import { OpenHouses } from './world/OpenHouses.js';
import { VillageSettlement } from './world/VillageSettlement.js';
import { Player } from './entities/Player.js';
import { Vehicle } from './entities/Vehicle.js';
import { Traffic } from './entities/Traffic.js';
import { NPCManager } from './entities/NPCManager.js';
import { DayNightCycle } from './systems/DayNightCycle.js';
import { CameraManager } from './systems/CameraManager.js';
import { InputManager } from './systems/InputManager.js';
import { Minimap } from './systems/Minimap.js';
import { HUD } from './ui/HUD.js';
import { DialogueBox } from './ui/DialogueBox.js';
import { audioSystem } from './systems/AudioSystem.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { MonsterManager } from './entities/MonsterManager.js';
import { RealmNPCs } from './entities/RealmNPCs.js';
import { NPCTownBuilder } from './systems/NPCTownBuilder.js';
import { MagicSwordSystem } from './systems/MagicSwordSystem.js';
import { PipTaskSystem } from './systems/PipTaskSystem.js';
import { ElvenTaskSystem } from './systems/ElvenTaskSystem.js';
import { WorldPerceptionEngine } from './ai/WorldPerceptionEngine.js';
import { GroqBrainAdapter } from './ai/GroqBrainAdapter.js';
import { CreatorDashboard } from './ui/CreatorDashboard.js';
import { SocialEncounterEngine } from './ai/SocialEncounterEngine.js';
import { YukaLocomotionEngine } from './ai/YukaLocomotionEngine.js';
import { WeatherSystem, WEATHER_MODES } from './systems/WeatherSystem.js';
import { RPGCompass } from './ui/RPGCompass.js';
import { MythicalDragonSystem } from './systems/MythicalDragonSystem.js';
import { CharacterRoutineSystem } from './systems/CharacterRoutineSystem.js';
import { RealmPersistenceSystem } from './systems/RealmPersistenceSystem.js';
import { OfflineWelcomeModal } from './ui/OfflineWelcomeModal.js';
import { SkillSystem } from './systems/SkillSystem.js';
import { ItemDropSystem } from './systems/ItemDropSystem.js';

class GameApp {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'canvas-container';
    document.body.prepend(this.container);

    this.clock = new THREE.Clock();
    this.isMounted = false;
    this._lastTBColliderCount = 0;

    // God's Roam / Divine Spectator State
    this.isGodRoamActive = false;
    this.godRoamIndex = 0;

    this.initThree();
    this.initSystems();
    this.initWorld();
    this.initEntities();
    this.initUI();
    this.connectColliders();

    // Restore saved realm state (coordinates, character, stats, companion, day/night, routines)
    if (this.persistence) {
      this.persistence.restore();
    }

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd0e8ff);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    });
  }

  initSystems() {
    this.cameraManager = new CameraManager(this.renderer.domElement);
    this.dayNightCycle = new DayNightCycle(this.scene);
    this.combatSystem = new CombatSystem(this.scene);
    this.perceptionEngine = new WorldPerceptionEngine(this);
    this.groqAdapter = new GroqBrainAdapter();
    this.weatherSystem = new WeatherSystem(this.scene, this);
    this.rpgCompass = new RPGCompass(this);
  }

  initWorld() {
    this.terrain = new Terrain(this.scene);
    this.water = new Water(this.scene);
    this.kingdom = new KingdomBiome(this.scene, this.dayNightCycle);
    this.demon = new DemonBiome(this.scene, this.dayNightCycle);
    this.elven = new ElvenBiome(this.scene, this.dayNightCycle);
    this.dwarf = new DwarfBiome(this.scene, this.dayNightCycle);
    this.jungle = new JungleBiome(this.scene, this.dayNightCycle);
    this.openHouses = new OpenHouses(this.scene, this.dayNightCycle);
    this.villageSettlement = new VillageSettlement(this.scene, this.dayNightCycle);
  }

  initEntities() {
    // Character Daily Routines & Continental Task System (Busy Schedules for all citizens)
    this.routineSystem = new CharacterRoutineSystem(this.scene, this);
    window.__routineSystem = this.routineSystem;

    // Player starts as Hero (Aiden) near crossroads bridge
    this.player = new Player(this.scene, new THREE.Vector3(0, 0.5, 12));
    this.player.setGameApp(this);

    // Vehicle parked at crossroads
    this.vehicle = new Vehicle(this.scene, this.dayNightCycle, new THREE.Vector3(8, 0.5, 18));

    // Armored knight patrols and ox carts on kingdom roads
    this.traffic = new Traffic(this.scene, this.dayNightCycle);

    // Young Pip Task & Quest System
    this.pipTaskSystem = new PipTaskSystem(this.scene, this);
    window.__pipTaskSystem = this.pipTaskSystem;

    // Elven Starlight Trials Task System
    this.elvenTaskSystem = new ElvenTaskSystem(this.scene, this);
    window.__elvenTaskSystem = this.elvenTaskSystem;

    // Dialogue Box Modal
    this.dialogueBox = new DialogueBox(
      (charId) => {
        this.switchPlayableCharacter(charId, true);
      },
      (character) => {
        this.creatorDashboard.openWithNPC(character);
      },
      () => {
        this.pipTaskSystem.openModal();
      },
      () => {
        this.elvenTaskSystem.openModal();
      }
    );

    // NPC Manager (renders the other 5 characters in their realm locations with AI minds)
    this.npcManager = new NPCManager(this.scene, (npcConfig) => {
      this.dialogueBox.open(npcConfig);
    }, this.groqAdapter, this.perceptionEngine, this);

    // Forest Monsters & Guardians (leveling system)
    this.monsterManager = new MonsterManager(this.scene, this.combatSystem);
    this.monsterManager.gameApp = this;

    // Mythical Dragons & Calamity Beasts (Apex aerial dragons that raid settlements & crossroads)
    this.mythicalDragonSystem = new MythicalDragonSystem(this.scene, this.combatSystem, this.monsterManager, this);
    window.__mythicalDragonSystem = this.mythicalDragonSystem;

    // Realm NPCs across all 4 races and landmarks
    this.realmNPCs = new RealmNPCs(this.scene, this.dayNightCycle, this);
    this.villageSettlement.gameApp = this;

    // NPC Town Builder — NPCs autonomously construct buildings & expand settlements
    this.townBuilder = new NPCTownBuilder(this.scene, this.dayNightCycle);

    // Magic Sword Skills System (3-Hit Combos, Crescent Blade Waves, Whirlwind Nova)
    this.magicSwordSystem = new MagicSwordSystem(this.scene, this.combatSystem, this.monsterManager);

    // Yuka Game AI Locomotion Engine (Mugen87/yuka)
    this.yukaLocomotionEngine = new YukaLocomotionEngine(this);

    // Social Encounter Engine (Stanford Generative Agents / AI Town emergent dialogues)
    this.socialEncounterEngine = new SocialEncounterEngine(this);

    // 3D World Item Drop & Spawner Engine
    this.itemDropSystem = new ItemDropSystem(this.scene, this);
    window.__itemDropSystem = this.itemDropSystem;

    // 4-Discipline Continental Skill & Spell System
    this.skillSystem = new SkillSystem(this.scene, this);
    window.__skillSystem = this.skillSystem;

    // Setup Input Manager with terrain raycaster
    this.inputManager = new InputManager(
      this.renderer.domElement,
      () => this.cameraManager.getCamera(),
      () => this.terrain.getMesh()
    );

    this.initGodRoamFocusRing();
  }

  initGodRoamFocusRing() {
    const ringGeom = new THREE.RingGeometry(0.85, 1.25, 32);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });
    this.godRoamFocusRing = new THREE.Mesh(ringGeom, ringMat);
    this.godRoamFocusRing.visible = false;
    this.scene.add(this.godRoamFocusRing);
  }

  connectColliders() {
    const allColliders = [
      ...this.kingdom.colliders,
      ...this.demon.colliders,
      ...this.elven.colliders,
      ...this.dwarf.colliders,
      ...this.jungle.colliders,
      ...this.openHouses.colliders,
      ...this.villageSettlement.colliders,
      ...this.realmNPCs.colliders,
      ...this.townBuilder.colliders
    ];

    this.player.setColliders(allColliders);
    this.vehicle.setColliders(allColliders);
    this.npcManager.setColliders(allColliders);
    this.realmNPCs.setColliders(allColliders);
    this.villageSettlement.setColliders(allColliders);
    this.yukaLocomotionEngine.setColliders(allColliders);
    this.cameraManager.setColliders(allColliders);
    this.inputManager.setColliderProvider(() => allColliders);

    // Give town builder knowledge of world colliders so new buildings don't overlap
    this.townBuilder.setWorldColliders(allColliders);
  }

  initUI() {
    this.hud = new HUD({
      onCameraChange: (mode) => {
        this.cameraManager.setMode(mode);
      },
      onRoofModeChange: (mode) => {
        this.openHouses.setRoofMode(mode);
      },
      onTimeChange: (timeVal) => {
        this.dayNightCycle.setTime(timeVal);
      },
      onWeatherChange: (mode) => {
        this.weatherSystem.triggerManualMode(mode);
      },
      onMapToggle: () => {
        this.minimap.toggleWorldMap();
      },
      onVehicleToggle: () => {
        this.toggleMountState();
      },
      onJoystickMove: (x, y) => {
        this.inputManager.setJoystickVector(x, y);
      },
      onCharacterChange: (charId) => {
        this.switchPlayableCharacter(charId, false);
      },
      onTalkAction: () => {
        const nearbyNPC = this.npcManager.getNearbyNPC() || this.villageSettlement.getNearbyVillager() || this.realmNPCs.getNearbyNPC();
        if (nearbyNPC) {
          this.dialogueBox.open(nearbyNPC);
        }
      },
      onAttackAction: () => {
        this.handleAttack();
      },
      onTameAction: () => {
        this.handleTame();
      },
      onUntameAction: () => {
        this.monsterManager.releaseTamedMonster();
        if (this.mythicalDragonSystem) {
          this.mythicalDragonSystem.releaseTamedDragon();
        }
      },
      onQuestObjectAction: () => {
        if (this.pipTaskSystem && this.pipTaskSystem.nearbyQuestObject) {
          this.pipTaskSystem.handleInteract();
        } else if (this.elvenTaskSystem && this.elvenTaskSystem.nearbyQuestObject) {
          this.elvenTaskSystem.handleInteract();
        }
      },
      onAutoMindToggle: () => {
        if (this.player) {
          const isAuto = this.player.toggleAutonomous();
          this.hud.updateAutoMindButton(isAuto);
        }
      },
      onCreatorDashboardToggle: () => {
        this.creatorDashboard.toggle();
      },
      onTasksToggle: () => {
        if (this.routineSystem) {
          this.routineSystem.toggleModal();
        }
      },
      onGodRoamToggle: () => {
        if (this.isGodRoamActive) {
          this.stopGodRoam();
        } else {
          this.startGodRoam();
        }
      },
      onGodRoamPrev: () => {
        this.cycleGodRoam(-1);
      },
      onGodRoamNext: () => {
        this.cycleGodRoam(1);
      },
      onGodRoamPossess: () => {
        this.possessCurrentGodRoam();
      },
      onGodRoamMind: () => {
        const citizens = this.getRoamableCitizens();
        const citizen = citizens[this.godRoamIndex];
        if (citizen) {
          this.creatorDashboard.openWithNPC(citizen.characterConfig || citizen);
        }
      },
      onGodRoamClose: () => {
        this.stopGodRoam();
      },
      onDragonRaidTrigger: () => {
        if (this.mythicalDragonSystem) {
          this.mythicalDragonSystem.triggerRaid();
        }
      },
      onResetRealm: () => {
        if (this.persistence) {
          this.persistence.resetWorld();
        }
      },
      onSpellCastAction: (slot) => {
        this.handleSpellCast(slot);
      }
    });

    if (this.pipTaskSystem) {
      this.pipTaskSystem.updateHUD();
    }
    if (this.elvenTaskSystem) {
      this.elvenTaskSystem.updateHUD();
    }

    this.creatorDashboard = new CreatorDashboard({
      gameApp: this,
      groqAdapter: this.groqAdapter,
      perceptionEngine: this.perceptionEngine,
      onFocusCharacter: (npc) => {
        const pos = npc.entity?.worldPos || npc.entity?.group?.position || npc.entity?.position;
        if (pos) {
          this.cameraManager.setMode(CAMERA_MODES.FREELOOK);
          this.hud.setCameraModeActive(CAMERA_MODES.FREELOOK);
          this.cameraManager.freeCamPos.set(pos.x, pos.y + 10, pos.z + 14);
          this.cameraManager.freeCamYaw = 0;
          this.cameraManager.freeCamPitch = -0.4;
        }
      }
    });
    window.__creatorDashboard = this.creatorDashboard;

    // Provide NPC groups & configs to InputManager for 3D world click-to-follow & inspect
    this.inputManager.setNpcProvider(() => {
      const targets = [];
      // 1. Main 5 NPCs
      if (this.npcManager && this.npcManager.npcs) {
        this.npcManager.npcs.forEach((npc, charId) => {
          if (npc && npc.group) {
            targets.push({ id: charId, group: npc.group, data: npc.config || npc.char || { id: charId } });
          }
        });
      }
      // 2. Realm Landmark NPCs & High Valoria citizens
      if (this.realmNPCs && this.realmNPCs.npcs) {
        this.realmNPCs.npcs.forEach((npc) => {
          if (npc && npc.group) {
            targets.push({ id: npc.config?.id, group: npc.group, data: npc.config });
          }
        });
      }
      // 3. Autonomous Village Settlers
      if (this.villageSettlement && this.villageSettlement.villagers) {
        this.villageSettlement.villagers.forEach((v) => {
          if (v && v.group) {
            targets.push({ id: v.config?.id, group: v.group, data: v.config });
          }
        });
      }
      // 4. Young Pip quest entity
      if (this.pipTaskSystem && this.pipTaskSystem.pipEntity) {
        targets.push({
          id: 'pip',
          group: this.pipTaskSystem.pipEntity,
          data: { id: 'pip', name: 'Young Pip', badge: '⚔️ SQUIRE', title: 'Aspiring Knight of Oakhaven' }
        });
      }
      // 5. Mythical Apex Dragons & Bosses
      if (this.mythicalDragonSystem && this.mythicalDragonSystem.creatures) {
        this.mythicalDragonSystem.creatures.forEach((c) => {
          if (c && c.group) {
            targets.push({
              id: c.id,
              group: c.group,
              isDragon: true,
              clickRadius: 4.5,
              data: { id: c.id, name: c.name, badge: '🐲 WORLD BOSS', title: c.title, isDragon: true }
            });
          }
        });
      }
      // 6. Player character itself
      if (this.player && this.player.group && this.player.characterConfig) {
        targets.push({ id: this.player.characterId, group: this.player.group, data: this.player.characterConfig });
      }
      return targets;
    });

    // Clicking a character in God's View smoothly glides the camera to that character and tracks/follows them
    this.inputManager.setOnNpcClicked((npcData, rawTarget) => {
      const targetId = npcData?.id || npcData?.characterConfig?.id || rawTarget?.id || rawTarget?.data?.id;
      this.startGodRoam(targetId || rawTarget || npcData);
    });

    this.minimap = new Minimap(
      this.hud.getMinimapCanvas(),
      this.hud.getWorldMapContainer(),
      (x, z) => {
        if (this.isMounted) {
          this.vehicle.position.set(x, 1, z);
          this.vehicle.speed = 0;
        } else {
          this.player.teleport(x, z);
        }
      }
    );

    // Master Realm Persistence System & Offline Welcome Modal
    this.offlineWelcomeModal = new OfflineWelcomeModal(this);
    window.__offlineWelcomeModal = this.offlineWelcomeModal;

    this.persistence = new RealmPersistenceSystem(this);
    window.__persistence = this.persistence;

    this.hud.updateLevel(this.player.level, this.player.xp, this.player.xpToNext, this.player.gold);
    this.hud.updateAutoMindButton(this.player.isAutonomous);
  }

  switchPlayableCharacter(charId, teleportToSpawn = false) {
    if (this.isGodRoamActive) {
      // In God's Roam mode, clicking a character focuses spectator camera on them
      this.startGodRoam(charId);
      return;
    }

    if (this.isMounted) {
      this.toggleMountState(); // Step off mount before switching
    }

    const charConfig = getCharacterById(charId);

    this.player.setCharacter(charId);
    this.npcManager.updateActiveCharacter(charId);
    this.hud.setActiveCharacter(charId);

    if (teleportToSpawn && charConfig) {
      this.player.teleport(charConfig.spawn.x, charConfig.spawn.z);
    } else {
      audioSystem.playDoorChime(true);
    }
  }

  getRoamableCitizens() {
    const list = [];

    // 1. The 6 Main Characters
    CHARACTERS.forEach(char => {
      const isCurrentPlayer = (this.player && this.player.characterId === char.id);
      let targetEntity = null;
      let action = 'Patrolling realm';

      if (this.routineSystem) {
        const task = this.routineSystem.getCurrentTask(char.id);
        const state = this.routineSystem.getCurrentState(char.id);
        if (task && state) {
          const isWorking = state.state === 'WORKING';
          const remaining = Math.max(0, Math.ceil(state.taskTimer));
          action = isWorking
            ? `Active Task: ${task.badge} ${task.title} at ${task.locationName} (${remaining}s remaining)`
            : `Traveling to: ${task.badge} ${task.title} at ${task.locationName}`;
        }
      }

      if (isCurrentPlayer) {
        targetEntity = this.isMounted ? this.vehicle : this.player;
        if (!this.player.isAutonomous) {
          action = `🎮 Directly possessed by Creator (Player) • ${action}`;
        }
      } else if (this.npcManager && this.npcManager.npcs.has(char.id)) {
        const npc = this.npcManager.npcs.get(char.id);
        targetEntity = npc.group;
      }
      list.push({
        id: char.id,
        name: char.name,
        badge: char.badge,
        title: char.title,
        homeland: char.race === 'demon' ? 'Obsidian Dread Fortress' : (char.race === 'elf' ? 'Sylvaheim Glade' : 'Kingdom of Valoria'),
        isPlayable: true,
        characterConfig: char,
        entity: targetEntity,
        action: action
      });
    });

    // 2. Notable Realm NPCs & Settlers
    // Young Pip
    const pipVillager = this.villageSettlement?.villagers?.find(v => v.id === 'pip') || 
      (this.pipTaskSystem?.pipEntity ? { group: this.pipTaskSystem.pipEntity } : null);
    if (pipVillager && pipVillager.group) {
      list.push({
        id: 'pip',
        name: 'Young Pip',
        badge: '⚔️ SQUIRE',
        title: 'Aspiring Knight of Oakhaven',
        homeland: 'Oakhaven Agricultural Village',
        isPlayable: false,
        entity: pipVillager.group,
        action: 'Tending pumpkin patch & dreaming of chivalric knighthood'
      });
    }

    // Lunara (Elven Celestial Alchemist)
    const lunaraNPC = this.realmNPCs?.npcs?.find(n => n.id === 'lunara');
    if (lunaraNPC && lunaraNPC.group) {
      list.push({
        id: 'lunara',
        name: 'Alchemist Lunara',
        badge: '🌿 CELESTIAL BOTANIST',
        title: 'Guardian of Starlight Lotuses',
        homeland: 'Sylvaheim Elven Glade',
        isPlayable: false,
        entity: lunaraNPC.group,
        action: 'Distilling starlight mana essence from luminous lotus blooms'
      });
    }

    // Brandon (Dwarven Steam Engineer)
    const brandonNPC = this.realmNPCs?.npcs?.find(n => n.id === 'brandon');
    if (brandonNPC && brandonNPC.group) {
      list.push({
        id: 'brandon',
        name: 'Engineer Brandon',
        badge: '⚙️ GEARMASTER',
        title: 'Dwarven Blast Furnace Architect',
        homeland: 'Karak-Vorn United Clanstead',
        isPlayable: false,
        entity: brandonNPC.group,
        action: 'Inspecting steam hydraulics and rotating giant cog gears'
      });
    }

    // Captain Donald (Valoria Citadel Garrison Commander)
    const donaldNPC = this.realmNPCs?.npcs?.find(n => n.id === 'captain_donald');
    if (donaldNPC && donaldNPC.group) {
      list.push({
        id: 'captain_donald',
        name: 'Captain Donald',
        badge: '🛡️ GARRISON COMMANDER',
        title: 'Defender of the High Citadel Gate',
        homeland: 'Royal Castle Citadel of Valoria',
        isPlayable: false,
        entity: donaldNPC.group,
        action: 'Drilling armored royal knights on high castle ramparts'
      });
    }

    // 3. Mythical Apex Dragons & World Calamity Bosses
    if (this.mythicalDragonSystem && this.mythicalDragonSystem.creatures) {
      this.mythicalDragonSystem.creatures.forEach(c => {
        if (c.group) {
          const actionText = c.state === 'DESCENDING'
            ? `⚠️ Descending aggressively upon ${c.currentRaidTarget?.name || 'the realm'}!`
            : (c.state === 'ASSAULTING'
              ? `🔥 Breathing elemental breath in assault on ${c.currentRaidTarget?.name || 'settlement'}!`
              : (c.state === 'RETREATING'
                ? `💨 Taking flight to retreat back into the upper atmosphere`
                : (c.isTamed ? '🐾 Loyal flying dragon companion soaring overhead' : 'Soaring high above the clouds surveying the continent')));

          list.push({
            id: c.id,
            name: c.name,
            badge: '🐲 WORLD BOSS',
            title: c.title,
            homeland: 'Upper Atmospheric Skies of Eldoria',
            isPlayable: false,
            entity: c.group,
            action: actionText
          });
        }
      });
    }

    return list;
  }

  startGodRoam(targetIdOrIndex = 0) {
    const citizens = this.getRoamableCitizens();
    if (!citizens || citizens.length === 0) return;

    if (typeof targetIdOrIndex === 'string') {
      const idx = citizens.findIndex(c => c.id === targetIdOrIndex);
      this.godRoamIndex = idx !== -1 ? idx : 0;
    } else if (typeof targetIdOrIndex === 'number') {
      this.godRoamIndex = Math.max(0, Math.min(citizens.length - 1, targetIdOrIndex));
    } else if (targetIdOrIndex && typeof targetIdOrIndex === 'object') {
      const targetObj = targetIdOrIndex;
      const targetId = targetObj.id || targetObj.data?.id;
      let idx = -1;
      if (targetId) {
        idx = citizens.findIndex(c => c.id === targetId);
      }
      if (idx !== -1) {
        this.godRoamIndex = idx;
      } else {
        const entityGroup = targetObj.group || targetObj.entity;
        const name = targetObj.name || targetObj.data?.name || 'Citizen of Valoria';
        const badge = targetObj.badge || targetObj.data?.badge || '👤 CITIZEN';
        const title = targetObj.title || targetObj.data?.title || 'Resident of the Realm';
        const homeland = targetObj.homeland || 'Kingdom of Valoria';
        citizens.push({
          id: targetId || ('citizen_' + Date.now()),
          name,
          badge,
          title,
          homeland,
          isPlayable: !!targetObj.data?.isPlayable,
          characterConfig: targetObj.data || targetObj,
          entity: entityGroup,
          action: targetObj.data?.action || 'Living autonomously in the realm'
        });
        this.godRoamIndex = citizens.length - 1;
      }
    }

    this.isGodRoamActive = true;
    if (this.inputManager) {
      this.inputManager.isSpectatingActive = true;
      this.inputManager.clearClickTarget();
    }

    const current = citizens[this.godRoamIndex];

    if (current && current.entity) {
      // If currently flying in Free Look, smoothly switch camera to 3D chase/follow
      if (this.cameraManager.mode === CAMERA_MODES.FREELOOK) {
        this.cameraManager.setMode(CAMERA_MODES.PERSPECTIVE);
        this.hud.setCameraModeActive(CAMERA_MODES.PERSPECTIVE);
      }

      this.cameraManager.setSpectateTarget(current.entity, current.name);
      this.hud.showGodRoamBanner(current);

      if (this.combatSystem) {
        const p = current.entity.position ? current.entity.position.clone() : (current.entity.group ? current.entity.group.position.clone() : this.player.position.clone());
        p.y += 2.6;
        this.combatSystem.spawnFloatingText(p, `👁️ God's View: Following ${current.name}`, '#f59e0b');
      }

      audioSystem.playChime();
    }
  }

  cycleGodRoam(direction = 1) {
    const citizens = this.getRoamableCitizens();
    if (!citizens || citizens.length === 0) return;

    this.godRoamIndex = (this.godRoamIndex + direction + citizens.length) % citizens.length;
    const current = citizens[this.godRoamIndex];

    if (current && current.entity) {
      if (this.cameraManager.mode === CAMERA_MODES.FREELOOK) {
        this.cameraManager.setMode(CAMERA_MODES.PERSPECTIVE);
        this.hud.setCameraModeActive(CAMERA_MODES.PERSPECTIVE);
      }
      this.cameraManager.setSpectateTarget(current.entity, current.name);
      this.hud.showGodRoamBanner(current);
      audioSystem.playChime();
    }
  }

  possessCurrentGodRoam() {
    const citizens = this.getRoamableCitizens();
    const current = citizens[this.godRoamIndex];
    if (!current) return;

    if (current.isPlayable) {
      const targetPos = current.entity?.position ? current.entity.position.clone() : (current.entity?.group?.position ? current.entity.group.position.clone() : null);
      this.switchPlayableCharacter(current.id, false);
      if (targetPos) {
        this.player.teleport(targetPos.x, targetPos.z);
      }
      this.stopGodRoam();
    } else {
      this.creatorDashboard.openWithNPC(current.characterConfig || current);
    }
  }

  stopGodRoam() {
    this.isGodRoamActive = false;
    if (this.inputManager) {
      this.inputManager.isSpectatingActive = false;
      this.inputManager.clearClickTarget();
    }
    if (this.godRoamFocusRing) {
      this.godRoamFocusRing.visible = false;
    }
    this.cameraManager.stopSpectating();
    this.hud.hideGodRoamBanner();
    audioSystem.playDoorChime(true);
  }

  toggleMountState() {
    const distToVehicle = Math.hypot(
      this.player.position.x - this.vehicle.position.x,
      this.player.position.z - this.vehicle.position.z
    );

    if (this.isMounted) {
      // Dismount Warhorse Steed
      this.isMounted = false;
      this.vehicle.exit();
      this.player.isInVehicle = false;
      this.player.position.set(
        this.vehicle.position.x - 2.5,
        this.vehicle.position.y,
        this.vehicle.position.z
      );
      this.player.group.position.copy(this.player.position);
      this.hud.setVehiclePrompt(true, false);
    } else if (distToVehicle < 6.0) {
      // Mount Warhorse Steed
      this.isMounted = true;
      this.vehicle.enter();
      this.player.isInVehicle = true;
      this.hud.setVehiclePrompt(true, true);
    }
  }

  toggleVehicleState() {
    this.toggleMountState();
  }

  handleAttack() {
    if (this.isMounted) return;

    // Trigger sword swing animation & get current combo step (1: Crescent, 2: Cross Arc, 3: Tempest Nova)
    const combo = this.player.triggerAttackAnim();

    // Unleash 3D Magic Sword skills and flying crescent blade waves!
    this.magicSwordSystem.castSwordSkill(this.player, combo);

    // Also check for point-blank melee cleave
    const result = this.monsterManager.playerAttack(this.player.position, this.player.attackPower);

    if (result.hit) {
      audioSystem.playFootstep('wood');
      if (result.killed && result.xp > 0) {
        this.player.gainXP(result.xp, (newLevel) => {
          this.combatSystem.triggerLevelUp(this.player.group, this.player.characterId, newLevel);
        });
        const goldGain = Math.max(5, Math.floor(result.xp * 0.75));
        this.player.addGold(goldGain);
        this.hud.updateLevel(this.player.level, this.player.xp, this.player.xpToNext, this.player.gold);
        this.hud.updateAutoMindButton(this.player.isAutonomous);
      }
    }
  }

  handleSpellCast(slotIndex) {
    if (this.isMounted || !this.skillSystem) return;
    const result = this.skillSystem.castSpell(
      slotIndex,
      this.player,
      this.monsterManager,
      this.combatSystem
    );
    if (result && result.success) {
      if (this.hud && this.hud.updateSkillCooldowns) {
        this.hud.updateSkillCooldowns(this.skillSystem.cooldowns);
      }
    }
  }

  handleTame() {
    const nearby = this.monsterManager.getNearbyTamableMonster(this.player.position);
    if (nearby) {
      this.monsterManager.tameMonster(nearby, this.player);
    }
  }

  /**
   * Dynamically refresh colliders when NPC Town Builder adds new buildings.
   * Only updates when the collider list has grown.
   */
  refreshTownBuilderColliders() {
    const tbColliders = this.townBuilder.colliders;
    if (tbColliders.length !== this._lastTBColliderCount) {
      this._lastTBColliderCount = tbColliders.length;
      this.connectColliders();
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Synchronize Free Look active state with InputManager (freezes ground character walking when flying)
    this.inputManager.isFreeLookActive = (this.cameraManager.mode === CAMERA_MODES.FREELOOK);

    // 1. Process Inputs
    this.inputManager.update();

    // Check attack key (F or Space on foot)
    if (this.inputManager.consumeAttack() && !this.isMounted) {
      this.handleAttack();
    }

    // Check Spell Cast keys (Q: 0, R: 1, T: 2, Y: 3)
    const spellSlot = this.inputManager.consumeSpellCast();
    if (spellSlot !== -1 && !this.isMounted) {
      this.handleSpellCast(spellSlot);
    }

    // Check Tame key (G) and Untame key (U)
    if (this.inputManager.consumeTame()) {
      this.handleTame();
    }
    if (this.inputManager.consumeUntame()) {
      this.monsterManager.releaseTamedMonster();
      if (this.mythicalDragonSystem) {
        this.mythicalDragonSystem.releaseTamedDragon();
      }
    }

    // Check interaction key (E)
    if (this.inputManager.consumeInteract()) {
      if (this.pipTaskSystem && this.pipTaskSystem.handleInteract()) {
        // Handled quest object pickup (golden pumpkin, wooden sword)
      } else if (this.elvenTaskSystem && this.elvenTaskSystem.handleInteract()) {
        // Handled elven quest object pickup (starlight lotus, jade font)
      } else {
        const nearbyNPC = this.npcManager.getNearbyNPC() || this.villageSettlement.getNearbyVillager() || this.realmNPCs.getNearbyNPC();
        if (nearbyNPC && !this.isMounted) {
          this.dialogueBox.open(nearbyNPC);
        } else {
          this.toggleMountState();
        }
      }
    }

    // Check Auto Mind key (P)
    if (this.inputManager.consumeAutoMindToggle()) {
      if (this.player) {
        const isAuto = this.player.toggleAutonomous();
        this.hud.updateAutoMindButton(isAuto);
      }
    }

    // Check Map key (M)
    if (this.inputManager.consumeMapToggle()) {
      this.minimap.toggleWorldMap();
    }

    // Check Races Codex key (L)
    if (this.inputManager.consumeRacesToggle()) {
      this.hud.toggleRacesModal();
    }

    // Check Creator Mind Dashboard key (K)
    if (this.inputManager.consumeCreatorDashboardToggle()) {
      this.creatorDashboard.toggle();
    }

    // Check Character Tasks & Daily Agenda key (J)
    if (this.inputManager.consumeTasksToggle()) {
      if (this.routineSystem) {
        this.routineSystem.toggleModal();
      }
    }

    // Check God's Roam spectator keys ([ Prev, ] Next, Esc Return, Enter Possess)
    if (this.inputManager.consumeRoamPrev()) {
      if (!this.isGodRoamActive) {
        this.startGodRoam();
      } else {
        this.cycleGodRoam(-1);
      }
    }
    if (this.inputManager.consumeRoamNext()) {
      if (!this.isGodRoamActive) {
        this.startGodRoam();
      } else {
        this.cycleGodRoam(1);
      }
    }
    if (this.inputManager.consumeEscape()) {
      if (this.isGodRoamActive) {
        this.stopGodRoam();
      }
    }
    if (this.inputManager.consumeEnter()) {
      if (this.isGodRoamActive) {
        this.possessCurrentGodRoam();
      }
    }

    // Check Dragon Raid trigger key (B)
    if (this.inputManager.consumeRaidTrigger()) {
      if (this.mythicalDragonSystem) {
        this.mythicalDragonSystem.triggerRaid();
      }
    }

    if (this.isGodRoamActive) {
      this._roamStatusTimer = (this._roamStatusTimer || 0) + delta;
      if (this._roamStatusTimer >= 0.5) {
        this._roamStatusTimer = 0;
        const citizens = this.getRoamableCitizens();
        const current = citizens[this.godRoamIndex];
        if (current) {
          this.hud.updateGodRoamStatus(current.action);
        }
      }

      // Update 3D celestial focus ring position over the spectated entity
      if (this.godRoamFocusRing) {
        const citizens = this.getRoamableCitizens();
        const current = citizens[this.godRoamIndex];
        const ent = current?.entity;
        const ePos = ent?.position || ent?.group?.position;
        if (ePos) {
          this.godRoamFocusRing.visible = true;
          this.godRoamFocusRing.position.set(ePos.x, ePos.y + 0.15, ePos.z);
          this.godRoamFocusRing.rotation.z += delta * 1.8;
        } else {
          this.godRoamFocusRing.visible = false;
        }
      }
    } else if (this.godRoamFocusRing) {
      this.godRoamFocusRing.visible = false;
    }

    // Check camera toggle key (1, 2, 3, 4, V)
    const camSwitch = this.inputManager.consumeCameraSwitch();
    if (camSwitch !== null) {
      if (camSwitch === 0) {
        this.cameraManager.setMode(CAMERA_MODES.ISOMETRIC);
        this.hud.setCameraModeActive(CAMERA_MODES.ISOMETRIC);
      } else if (camSwitch === 1) {
        this.cameraManager.setMode(CAMERA_MODES.TOPDOWN);
        this.hud.setCameraModeActive(CAMERA_MODES.TOPDOWN);
      } else if (camSwitch === 2) {
        this.cameraManager.setMode(CAMERA_MODES.PERSPECTIVE);
        this.hud.setCameraModeActive(CAMERA_MODES.PERSPECTIVE);
      } else if (camSwitch === 3) {
        this.cameraManager.setMode(CAMERA_MODES.FREELOOK);
        this.hud.setCameraModeActive(CAMERA_MODES.FREELOOK);
      } else if (camSwitch === 'cycle') {
        const nextMode = this.cameraManager.cycleMode();
        this.hud.setCameraModeActive(nextMode);
      }
    }

    // 2. Update Entities
    if (this.isMounted) {
      this.vehicle.update(delta, this.inputManager);
      this.player.position.copy(this.vehicle.position);
      this.hud.setTalkPrompt(null);
    } else {
      this.player.update(delta, this.inputManager);
      this.vehicle.update(delta, this.inputManager);

      // Check distance to steed for prompt
      const distToVehicle = Math.hypot(
        this.player.position.x - this.vehicle.position.x,
        this.player.position.z - this.vehicle.position.z
      );
      this.hud.setVehiclePrompt(distToVehicle < 6.0, false);

      // 3. Update NPCs & Talk Prompt
      this.npcManager.update(delta, this.player.position);
      this.villageSettlement.update(delta, this.player.position);
      this.realmNPCs.update(delta, this.player.position);
      if (this.socialEncounterEngine) {
        this.socialEncounterEngine.update(delta);
      }
      if (this.yukaLocomotionEngine) {
        this.yukaLocomotionEngine.update(delta);
      }
      const nearbyNPC = this.npcManager.getNearbyNPC() || this.villageSettlement.getNearbyVillager() || this.realmNPCs.getNearbyNPC();
      this.hud.setTalkPrompt(nearbyNPC);

      // 3.1 Update Pip & Elven Task Systems
      if (this.pipTaskSystem) {
        this.pipTaskSystem.update(delta, this.player.position);
      }
      if (this.elvenTaskSystem) {
        this.elvenTaskSystem.update(delta, this.player.position);
      }
      // 3.2 Update Realm Character Routines & Busy Task Agendas
      if (this.routineSystem) {
        this.routineSystem.update(delta);
      }
      const nearbyQuestObj = (this.pipTaskSystem && this.pipTaskSystem.nearbyQuestObject) ||
                             (this.elvenTaskSystem && this.elvenTaskSystem.nearbyQuestObject);
      this.hud.setQuestObjectPrompt(nearbyQuestObj);
    }

    // 4. Update Traffic, Combat, Monsters & World
    this.traffic.update(delta);
    this.kingdom.update(delta);
    this.demon.update(delta, elapsedTime);
    this.elven.update(delta, elapsedTime);
    this.dwarf.update(delta);
    this.water.update(elapsedTime);
    this.jungle.update(elapsedTime);

    // Active position for camera and atmosphere tracking
    const activePos = this.isMounted ? this.vehicle.position : this.player.position;

    // Update Combat System, Magic Sword Skills & Forest Monsters
    this.combatSystem.update(delta);
    this.magicSwordSystem.update(delta);
    this.monsterManager.update(delta, activePos);

    // Update Continental Skill System & Active Spells
    if (this.skillSystem) {
      this.skillSystem.update(delta);
      if (this.hud && this.hud.updateSkillCooldowns) {
        this.hud.updateSkillCooldowns(this.skillSystem.cooldowns);
      }
    }

    // Update 3D World Item Drops & Collectibles
    if (this.itemDropSystem) {
      this.itemDropSystem.update(delta, activePos);
    }

    // Update Mythical Dragon System (Apex aerial dragons & settlement raids)
    if (this.mythicalDragonSystem) {
      this.mythicalDragonSystem.update(delta, activePos);
    }

    // Update Tame Prompt & Companion Status Card (Strict Single-Pet Invariant: "only ones")
    const tamableMonster = this.monsterManager.getNearbyTamableMonster(activePos);
    const tamedPet = this.monsterManager.getTamedMonster();
    this.hud.setTamePrompt(tamableMonster, !!tamedPet, tamedPet ? tamedPet.name : '');
    this.hud.updateCompanionCard(this.monsterManager.getCompanionData());

    // Update NPC Town Builder (autonomous settlement expansion)
    this.townBuilder.update(delta);
    this.refreshTownBuilderColliders();

    // 5. Update Open Houses (cutaway roofs & notifications)
    this.openHouses.update(delta, activePos);
    const currentHouse = this.openHouses.getCurrentHouse();
    this.hud.setHouseToast(currentHouse);

    // 6. Update Atmosphere & Day/Night
    const isFreeLook = (this.cameraManager.mode === CAMERA_MODES.FREELOOK);
    const focusPos = isFreeLook ? this.cameraManager.freeCamPos : activePos;
    this.dayNightCycle.update(delta, focusPos);
    this.hud.updateTime(this.dayNightCycle.getTimeFormatted());
    this.hud.updateBiome(focusPos.x, focusPos.z);

    // 7. Update Camera (supports Free Look flight via inputManager)
    this.cameraManager.update(delta, activePos, this.inputManager);
    if (isFreeLook) {
      this.hud.updateFreeLookCoords(this.cameraManager.getFreeCamCoords());
    }

    // 7.1 Update Dynamic Precipitation Weather Particles & Sound
    if (this.weatherSystem) {
      this.weatherSystem.update(delta, focusPos);
    }

    // 7.2 Update Skyrim-Style RPG Top Dynamic Compass Bar
    if (this.rpgCompass) {
      this.rpgCompass.update(this.cameraManager.getCamera(), activePos);
    }

    // 8. Update Minimap Radar (throttled to ~28 FPS to save 2D canvas draw overhead)
    this._minimapTimer = (this._minimapTimer || 0) + delta;
    if (this._minimapTimer >= 0.035) {
      this._minimapTimer = 0;
      const rot = this.isMounted ? this.vehicle.rotation : this.player.currentRotation;
      this.minimap.drawMinimap(activePos, rot, this.openHouses.getAllHouses());
    }

    // 8.5 Update Realm Persistence Engine (throttled auto-save & serverless sync)
    if (this.persistence) {
      this.persistence.update(delta);
    }

    // 9. Render Frame
    this.renderer.render(this.scene, this.cameraManager.getCamera());
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
