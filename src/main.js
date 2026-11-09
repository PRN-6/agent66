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

class GameApp {
  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'canvas-container';
    document.body.prepend(this.container);

    this.clock = new THREE.Clock();
    this.isMounted = false;
    this._lastTBColliderCount = 0;

    this.initThree();
    this.initSystems();
    this.initWorld();
    this.initEntities();
    this.initUI();
    this.connectColliders();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd0e8ff);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  initSystems() {
    this.cameraManager = new CameraManager(this.renderer.domElement);
    this.dayNightCycle = new DayNightCycle(this.scene);
    this.combatSystem = new CombatSystem(this.scene);
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
    // Player starts as Hero (Aiden) near crossroads bridge
    this.player = new Player(this.scene, new THREE.Vector3(0, 0.5, 12));

    // Vehicle parked at crossroads
    this.vehicle = new Vehicle(this.scene, this.dayNightCycle, new THREE.Vector3(8, 0.5, 18));

    // Armored knight patrols and ox carts on kingdom roads
    this.traffic = new Traffic(this.scene, this.dayNightCycle);

    // Dialogue Box Modal
    this.dialogueBox = new DialogueBox((charId) => {
      this.switchPlayableCharacter(charId, true);
    });

    // NPC Manager (renders the other 5 characters in their realm locations)
    this.npcManager = new NPCManager(this.scene, (npcConfig) => {
      this.dialogueBox.open(npcConfig);
    });

    // Forest Monsters & Guardians (leveling system)
    this.monsterManager = new MonsterManager(this.scene, this.combatSystem);

    // Realm NPCs across all 4 races and landmarks
    this.realmNPCs = new RealmNPCs(this.scene, this.dayNightCycle);

    // NPC Town Builder — NPCs autonomously construct buildings & expand settlements
    this.townBuilder = new NPCTownBuilder(this.scene, this.dayNightCycle);

    // Magic Sword Skills System (3-Hit Combos, Crescent Blade Waves, Whirlwind Nova)
    this.magicSwordSystem = new MagicSwordSystem(this.scene, this.combatSystem, this.monsterManager);

    // Setup Input Manager with terrain raycaster
    this.inputManager = new InputManager(
      this.renderer.domElement,
      () => this.cameraManager.getCamera(),
      () => this.terrain.getMesh()
    );
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
      }
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

    this.hud.updateLevel(this.player.level, this.player.xp, this.player.xpToNext);
  }

  switchPlayableCharacter(charId, teleportToSpawn = false) {
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
        this.hud.updateLevel(this.player.level, this.player.xp, this.player.xpToNext);
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

    // Check Tame key (G) and Untame key (U)
    if (this.inputManager.consumeTame()) {
      this.handleTame();
    }
    if (this.inputManager.consumeUntame()) {
      this.monsterManager.releaseTamedMonster();
    }

    // Check interaction key (E)
    if (this.inputManager.consumeInteract()) {
      const nearbyNPC = this.npcManager.getNearbyNPC() || this.villageSettlement.getNearbyVillager() || this.realmNPCs.getNearbyNPC();
      if (nearbyNPC && !this.isMounted) {
        this.dialogueBox.open(nearbyNPC);
      } else {
        this.toggleMountState();
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
      const nearbyNPC = this.npcManager.getNearbyNPC() || this.villageSettlement.getNearbyVillager() || this.realmNPCs.getNearbyNPC();
      this.hud.setTalkPrompt(nearbyNPC);
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

    // 8. Update Minimap Radar
    const rot = this.isMounted ? this.vehicle.rotation : this.player.currentRotation;
    this.minimap.drawMinimap(activePos, rot, this.openHouses.getAllHouses());

    // 9. Render Frame
    this.renderer.render(this.scene, this.cameraManager.getCamera());
  }
}

// Start application when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
