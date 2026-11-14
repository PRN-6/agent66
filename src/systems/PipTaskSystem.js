import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';
import { audioSystem } from './AudioSystem.js';

export const TASK_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  READY_TO_CLAIM: 'READY_TO_CLAIM',
  COMPLETED: 'COMPLETED'
};

export const PIP_TASKS = [
  {
    id: 'task_pumpkins',
    order: 1,
    title: 'The Giant Pumpkin Harvest',
    badge: '🎃 Chore',
    subtitle: 'Help Young Pip harvest 3 Giant Golden Pumpkins in Oakhaven.',
    description: 'Farmer Bran has forbidden Young Pip from practicing swordplay until the heavy Golden Pumpkins are gathered from the east furrow. They are too heavy for young Pip, but easy for an adventurer!',
    dialogOffer: "Hey adventurer! Look at these massive pumpkins... Farmer Bran says I can't practice swordplay until I harvest 3 Giant Golden Pumpkins from the east furrow! They're way too heavy for my arms, but a real hero like you could gather them in no time! Will you help me?",
    dialogInProgress: "Still gathering the pumpkins? Look for the glowing golden ones in the furrow fields just east of our barn!",
    dialogReadyToClaim: "WOAH! You really brought all three Giant Golden Pumpkins?! Look at the golden shine on them! Farmer Bran was speechless! You're the best!",
    dialogCompleted: "Thanks to you, my morning chores are done! Farmer Bran actually gave me an extra slice of bread!",
    type: 'COLLECT',
    targetCount: 3,
    rewardXP: 60,
    hint: '📍 Oakhaven Farmlands (X: 104, Z: 32)'
  },
  {
    id: 'task_sword',
    order: 2,
    title: 'The Secret Wooden Sword',
    badge: '⚔️ Training',
    subtitle: "Retrieve Pip's hidden wooden sword from the riverside scarecrow.",
    description: 'Pip carved a secret wooden practice sword so he could train to become a knight. He hid it near the old riverside scarecrow, but strange animal noises scared him away. Fetch it before wild boars chew on it!',
    dialogOffer: "Now that the pumpkins are done... I have a confession! I carved a secret wooden practice sword so I can train to become a knight! I hid it by the Old Scarecrow near the western riverbank. But earlier I heard strange snorting sounds and got scared... could you fetch it for me?",
    dialogInProgress: "My wooden sword is leaning against the scarecrow by the river stream, just west of Oakhaven! Please don't let beasts break it!",
    dialogReadyToClaim: "MY PRACTICE SWORD! *whoosh* *slash* Look at that balance! Vance himself couldn't have carved it better! Here, take my lucky Adventurer's Bandana! You've made my dream come one step closer!",
    dialogCompleted: "I've been practicing my two-handed parry every evening! My wooden blade feels legendary!",
    type: 'COLLECT',
    targetCount: 1,
    rewardXP: 100,
    hint: '📍 Riverside Scarecrow (X: 74, Z: 46)'
  },
  {
    id: 'task_crossroads',
    order: 3,
    title: 'Scouting the Crossroads Bridge',
    badge: '🗺️ Exploration',
    subtitle: 'Scout the ancient 4-Way Waypoint Obelisk at the Crossroads Bridge.',
    description: 'Travelling merchants tell legends of the ancient Crossroads Sanctuary Bridge where the 4 realms meet. Scout the ancient 4-Way Obelisk and return with a report on whether all realm banners still fly.',
    dialogOffer: "The travelling grain carters told tales of the Central Crossroads Sanctuary Bridge where all four grand realms meet! Farmer Bran says I'm too young to ever see it. Hero, could you scout the Crossroads Bridge for me and verify that the ancient Obelisk still stands?",
    dialogInProgress: "Follow the paved Imperial Road southwest across the valley until you reach the ancient stone bridge crossing the Great River!",
    dialogReadyToClaim: "You stood upon the Crossroads Bridge?! And the 4-Way Obelisk still glows with the heraldic banners of Humans, Elves, Dwarves, and Demons?! Unbelievable! One day, I will cross that bridge as a Valorian knight!",
    dialogCompleted: "I drew a map of the Crossroads bridge in my notebook! Four realms connected by one ancient stone arch...",
    type: 'EXPLORE',
    targetCount: 1,
    rewardXP: 150,
    hint: '📍 Central Crossroads Sanctuary (X: 0, Z: 10)'
  },
  {
    id: 'task_beast',
    order: 4,
    title: 'Slay the Boundary Prowler',
    badge: '🛡️ Defense',
    subtitle: 'Defeat 1 wild forest monster prowling outside the Oakhaven perimeter.',
    description: 'A wild forest predator has been stalking the perimeter just outside the Oakhaven sanctuary ward, panicking the livestock. Defeat 1 monster with your Magic Sword skills to protect the valley.',
    dialogOffer: "Our sheep have been trembling all night. A wild forest predator has been prowling right outside our village ward barrier! If I were a knight, I'd face it myself... Hero, could you defeat 1 wild beast lurking in the nearby forest with your Magic Sword skills and make our valley safe?",
    dialogInProgress: "Hunt down 1 wild monster in the woods outside the village perimeter. Watch out for their claws!",
    dialogReadyToClaim: "YOU DEFEATED THE BEAST! The whole village heard the crescent blade slash from here! You saved our livestock and our harvest! From this day forth, I am your squire! Whenever you ride by, Pip will be training to join your guard!",
    dialogCompleted: "Look at me! Guard stance, parry, strike! When I turn eighteen, I will join Aiden's guard at the Citadel!",
    type: 'HUNT',
    targetCount: 1,
    rewardXP: 250,
    hint: '📍 Woods outside Oakhaven Ward (X: 130, Z: -20)'
  }
];

export class PipTaskSystem {
  constructor(scene, gameApp) {
    this.scene = scene;
    this.gameApp = gameApp;

    this.currentTaskIndex = 0; // 0..3
    this.taskStatus = TASK_STATUS.NOT_STARTED;
    this.taskProgress = 0;
    this.totalTasksCompleted = 0;

    this.pipVillager = null;
    this.pipMarker = null;

    this.questObjects = []; // 3D interactive props
    this.nearbyQuestObject = null;

    this.loadSavedState();
    this.initQuestObjects();
    this.setupModalDOM();
  }

  loadSavedState() {
    try {
      const savedIndex = localStorage.getItem('agent66_pip_task_index');
      const savedStatus = localStorage.getItem('agent66_pip_task_status');
      const savedProgress = localStorage.getItem('agent66_pip_task_progress');

      if (savedIndex !== null) this.currentTaskIndex = Math.min(PIP_TASKS.length, parseInt(savedIndex, 10));
      if (savedStatus !== null) this.taskStatus = savedStatus;
      if (savedProgress !== null) this.taskProgress = parseInt(savedProgress, 10);
    } catch {
      // ignore
    }
  }

  saveState() {
    try {
      localStorage.setItem('agent66_pip_task_index', this.currentTaskIndex.toString());
      localStorage.setItem('agent66_pip_task_status', this.taskStatus);
      localStorage.setItem('agent66_pip_task_progress', this.taskProgress.toString());
    } catch {
      // ignore
    }
  }

  getCurrentTask() {
    if (this.currentTaskIndex >= PIP_TASKS.length) return null;
    return PIP_TASKS[this.currentTaskIndex];
  }

  getPipVillager() {
    if (this.pipVillager) return this.pipVillager;
    if (this.gameApp.villageSettlement?.villagers) {
      this.pipVillager = this.gameApp.villageSettlement.villagers.find(v => v.config.id === 'villager_pip');
    }
    return this.pipVillager;
  }

  /**
   * Initializes 3D interactive quest items according to active quest.
   */
  initQuestObjects() {
    // Clear old quest objects
    this.clearQuestObjects();

    const currentTask = this.getCurrentTask();
    if (!currentTask || this.taskStatus !== TASK_STATUS.IN_PROGRESS) return;

    if (currentTask.id === 'task_pumpkins') {
      this.spawnGoldenPumpkins();
    } else if (currentTask.id === 'task_sword') {
      this.spawnPracticeSword();
    }
  }

  clearQuestObjects() {
    this.questObjects.forEach(obj => {
      if (obj.mesh) {
        this.scene.remove(obj.mesh);
        obj.mesh.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else child.material.dispose();
          }
        });
      }
    });
    this.questObjects = [];
    this.nearbyQuestObject = null;
  }

  spawnGoldenPumpkins() {
    const pumpkinPositions = [
      { x: 104, z: 28 },
      { x: 96, z: 38 },
      { x: 112, z: 34 }
    ];

    pumpkinPositions.forEach((pos, index) => {
      // Don't spawn already gathered pumpkins
      if (index < this.taskProgress) return;

      const group = new THREE.Group();
      const y = getTerrainHeight(pos.x, pos.z);
      group.position.set(pos.x, y + 0.1, pos.z);

      // Golden pumpkin body
      const pumpkinMat = new THREE.MeshLambertMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.35,
        flatShading: true
      });
      const stemMat = new THREE.MeshLambertMaterial({ color: 0x15803d, flatShading: true });

      const pumpkinGeo = new THREE.DodecahedronGeometry(0.85, 1);
      pumpkinGeo.scale(1.2, 0.9, 1.2);
      const pumpkinMesh = new THREE.Mesh(pumpkinGeo, pumpkinMat);
      pumpkinMesh.position.y = 0.6;
      pumpkinMesh.castShadow = true;
      group.add(pumpkinMesh);

      // Stem
      const stemGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.35, 6);
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.set(0, 1.15, 0);
      stemMesh.rotation.z = 0.2;
      group.add(stemMesh);

      // Glowing point light
      const light = new THREE.PointLight(0xfbbf24, 1.2, 8);
      light.position.set(0, 0.8, 0);
      group.add(light);

      // Floating ring halo
      const ringGeo = new THREE.RingGeometry(1.0, 1.2, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.05;
      group.add(ringMesh);

      this.scene.add(group);

      this.questObjects.push({
        id: `pumpkin_${index}`,
        type: 'pumpkin',
        name: 'Giant Golden Pumpkin',
        prompt: `[E] Harvest Giant Golden Pumpkin (${this.taskProgress + 1}/3)`,
        mesh: group,
        light: light,
        ring: ringMesh,
        pos: new THREE.Vector3(pos.x, y, pos.z),
        baseY: y,
        index: index
      });
    });
  }

  spawnPracticeSword() {
    const pos = { x: 74, z: 46 };
    const y = getTerrainHeight(pos.x, pos.z);

    const group = new THREE.Group();
    group.position.set(pos.x, y, pos.z);

    // Tree stump base
    const stumpMat = new THREE.MeshLambertMaterial({ color: 0x5c3a21, flatShading: true });
    const stumpGeo = new THREE.CylinderGeometry(0.5, 0.65, 0.7, 8);
    const stumpMesh = new THREE.Mesh(stumpGeo, stumpMat);
    stumpMesh.position.y = 0.35;
    stumpMesh.castShadow = true;
    group.add(stumpMesh);

    // Wooden Practice Sword embedded in stump
    const swordGroup = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xd97706, flatShading: true });
    const guardMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });

    // Blade
    const bladeGeo = new THREE.BoxGeometry(0.16, 1.4, 0.06);
    const blade = new THREE.Mesh(bladeGeo, woodMat);
    blade.position.y = 0.7;
    swordGroup.add(blade);

    // Crossguard
    const guardGeo = new THREE.BoxGeometry(0.5, 0.08, 0.12);
    const guard = new THREE.Mesh(guardGeo, guardMat);
    guard.position.y = 1.4;
    swordGroup.add(guard);

    // Grip
    const gripGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6);
    const grip = new THREE.Mesh(gripGeo, woodMat);
    grip.position.y = 1.6;
    swordGroup.add(grip);

    // Pommel
    const pommelGeo = new THREE.SphereGeometry(0.08, 6, 6);
    const pommel = new THREE.Mesh(pommelGeo, guardMat);
    pommel.position.y = 1.82;
    swordGroup.add(pommel);

    swordGroup.position.set(0, 0.4, 0);
    swordGroup.rotation.z = -0.25;
    swordGroup.rotation.x = 0.15;
    group.add(swordGroup);

    // Cyan beacon light
    const light = new THREE.PointLight(0x38bdf8, 1.5, 10);
    light.position.set(0, 1.2, 0);
    group.add(light);

    // Vertical light beam
    const beamGeo = new THREE.CylinderGeometry(0.08, 0.3, 4.0, 8);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = 2.0;
    group.add(beamMesh);

    this.scene.add(group);

    this.questObjects.push({
      id: 'practice_sword',
      type: 'sword',
      name: "Pip's Wooden Sword",
      prompt: "[E] Pick up Pip's Wooden Practice Sword",
      mesh: group,
      light: light,
      pos: new THREE.Vector3(pos.x, y, pos.z),
      baseY: y
    });
  }

  /**
   * Main per-frame update loop.
   */
  update(delta, playerPos) {
    if (!playerPos) return;
    const time = performance.now() * 0.003;

    // 1. Update Pip's 3D quest marker above his head
    this.updatePipQuestMarker(delta, time);

    // 2. Animate 3D quest objects
    this.questObjects.forEach(obj => {
      if (obj.type === 'pumpkin') {
        obj.mesh.position.y = obj.baseY + Math.sin(time * 2.0 + obj.index) * 0.08;
        if (obj.ring) obj.ring.rotation.z += delta * 1.5;
        if (obj.light) obj.light.intensity = 1.2 + Math.sin(time * 3.0 + obj.index) * 0.3;
      } else if (obj.type === 'sword') {
        if (obj.light) obj.light.intensity = 1.4 + Math.sin(time * 4.0) * 0.4;
      }
    });

    // 3. Proximity check with quest objects
    let nearest = null;
    let minDist = 3.2; // Pickup interaction radius
    for (const obj of this.questObjects) {
      const d = Math.hypot(playerPos.x - obj.pos.x, playerPos.z - obj.pos.z);
      if (d < minDist) {
        minDist = d;
        nearest = obj;
      }
    }
    this.nearbyQuestObject = nearest;

    // 4. Check exploration task (Task 3: Crossroads Bridge)
    const currentTask = this.getCurrentTask();
    if (currentTask && currentTask.id === 'task_crossroads' && this.taskStatus === TASK_STATUS.IN_PROGRESS) {
      const distToCrossroads = Math.hypot(playerPos.x - 0, playerPos.z - 10);
      if (distToCrossroads < 20.0) {
        this.taskProgress = 1;
        this.taskStatus = TASK_STATUS.READY_TO_CLAIM;
        this.saveState();
        this.notifyObjectiveComplete("Crossroads Obelisk verified! Return to Young Pip in Oakhaven.");
        audioSystem.playChime();
        this.updateHUD();
      }
    }
  }

  updatePipQuestMarker(delta, time) {
    const pip = this.getPipVillager();
    if (!pip || !pip.group) return;

    if (!this.pipMarker) {
      this.pipMarker = this.createQuestMarkerMesh();
      pip.group.add(this.pipMarker);
    }

    // Set marker icon and animation
    const markerText = (this.taskStatus === TASK_STATUS.READY_TO_CLAIM)
      ? '❓'
      : (this.taskStatus === TASK_STATUS.NOT_STARTED ? '❗' : (this.taskStatus === TASK_STATUS.IN_PROGRESS ? '💬' : '⭐'));

    if (this.pipMarker.userData.currentText !== markerText) {
      this.updateMarkerTexture(this.pipMarker, markerText);
      this.pipMarker.userData.currentText = markerText;
    }

    // Bouncing & spinning animation
    this.pipMarker.position.y = 3.6 + Math.sin(time * 3.0) * 0.12;
    this.pipMarker.rotation.y += delta * 1.8;
  }

  createQuestMarkerMesh() {
    const group = new THREE.Group();

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.4, 1.4, 1);
    group.add(sprite);

    group.userData.canvas = canvas;
    group.userData.texture = texture;
    group.userData.sprite = sprite;

    return group;
  }

  updateMarkerTexture(markerGroup, text) {
    const canvas = markerGroup.userData.canvas;
    const texture = markerGroup.userData.texture;
    if (!canvas || !texture) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);

    // Glowing circle
    const isQuestion = (text === '❓');
    const isExclamation = (text === '❗');
    const color = isQuestion ? '#34d399' : (isExclamation ? '#fbbf24' : '#60a5fa');

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(64, 64, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = 'bold 58px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 66);

    texture.needsUpdate = true;
  }

  /**
   * Handle interact key [E] on nearby quest object.
   * Returns true if a quest item was collected.
   */
  handleInteract() {
    if (!this.nearbyQuestObject) return false;

    const obj = this.nearbyQuestObject;
    const currentTask = this.getCurrentTask();
    if (!currentTask || this.taskStatus !== TASK_STATUS.IN_PROGRESS) return false;

    if (obj.type === 'pumpkin') {
      this.taskProgress++;
      this.spawnCollectSparks(obj.pos, '#f59e0b');
      this.scene.remove(obj.mesh);
      this.questObjects = this.questObjects.filter(o => o.id !== obj.id);
      this.nearbyQuestObject = null;

      audioSystem.playChime();
      this.notifyObjectiveProgress(`🎃 Giant Golden Pumpkin Harvested (${this.taskProgress}/${currentTask.targetCount})`);

      if (this.taskProgress >= currentTask.targetCount) {
        this.taskStatus = TASK_STATUS.READY_TO_CLAIM;
        this.notifyObjectiveComplete("All pumpkins gathered! Return to Young Pip in Oakhaven!");
      }

      this.saveState();
      this.updateHUD();
      return true;

    } else if (obj.type === 'sword') {
      this.taskProgress = 1;
      this.spawnCollectSparks(obj.pos, '#38bdf8');
      this.scene.remove(obj.mesh);
      this.questObjects = [];
      this.nearbyQuestObject = null;

      audioSystem.playChime();
      this.taskStatus = TASK_STATUS.READY_TO_CLAIM;
      this.notifyObjectiveComplete("Retrieved Pip's Wooden Practice Sword! Return to Pip in Oakhaven!");

      this.saveState();
      this.updateHUD();
      return true;
    }

    return false;
  }

  /**
   * Handler when a monster is killed in the world.
   */
  onMonsterKilled(monster) {
    const currentTask = this.getCurrentTask();
    if (!currentTask || currentTask.id !== 'task_beast' || this.taskStatus !== TASK_STATUS.IN_PROGRESS) return;

    this.taskProgress++;
    audioSystem.playChime();
    this.notifyObjectiveProgress(`⚔️ Forest Beast Vanquished (${this.taskProgress}/${currentTask.targetCount})`);

    if (this.taskProgress >= currentTask.targetCount) {
      this.taskStatus = TASK_STATUS.READY_TO_CLAIM;
      this.notifyObjectiveComplete("Valley perimeter secured! Return to Young Pip!");
    }

    this.saveState();
    this.updateHUD();
  }

  spawnCollectSparks(pos, hexColor = '#fbbf24') {
    if (this.gameApp.combatSystem) {
      const p = pos.clone();
      p.y += 0.8;
      this.gameApp.combatSystem.spawnFloatingText(p, '✨ Picked Up!', hexColor);
    }
  }

  notifyObjectiveProgress(msg) {
    if (this.gameApp.combatSystem && this.gameApp.player) {
      const p = this.gameApp.player.position.clone();
      p.y += 2.2;
      this.gameApp.combatSystem.spawnFloatingText(p, msg, '#fef08a');
    }
  }

  notifyObjectiveComplete(msg) {
    if (this.gameApp.combatSystem && this.gameApp.player) {
      const p = this.gameApp.player.position.clone();
      p.y += 2.6;
      this.gameApp.combatSystem.spawnFloatingText(p, `🎉 ${msg}`, '#34d399');
    }
  }

  /**
   * Accepts the currently offered task from Young Pip.
   */
  acceptCurrentTask() {
    const task = this.getCurrentTask();
    if (!task) return;

    this.taskStatus = TASK_STATUS.IN_PROGRESS;
    this.taskProgress = 0;
    this.saveState();

    // Spawn 3D props
    this.initQuestObjects();

    // Log to Pip's NPCBrain memory stream
    const pip = this.getPipVillager();
    if (pip && pip.brain) {
      pip.brain.recordMemory(
        `The Hero agreed to help me with task: "${task.title}"! I will train hard while they help!`,
        'ACTION',
        8
      );
    }

    audioSystem.playChime();
    this.notifyObjectiveProgress(`📜 Accepted Task: ${task.title}`);
    this.updateHUD();
  }

  /**
   * Turns in completed task and claims reward.
   */
  claimTaskReward() {
    const task = this.getCurrentTask();
    if (!task || this.taskStatus !== TASK_STATUS.READY_TO_CLAIM) return;

    // Award XP to player
    const player = this.gameApp.player;
    if (player) {
      player.gainXP(task.rewardXP, (newLevel) => {
        if (this.gameApp.combatSystem) {
          this.gameApp.combatSystem.triggerLevelUp(player.group, player.characterId, newLevel);
        }
      });
    }

    // Log to Pip's NPCBrain memory stream
    const pip = this.getPipVillager();
    if (pip && pip.brain) {
      pip.brain.recordMemory(
        `The Hero successfully completed "${task.title}"! Truly an inspiration to all of Oakhaven!`,
        'EVENT',
        10
      );
    }

    // Clean up
    this.clearQuestObjects();
    this.totalTasksCompleted++;
    this.currentTaskIndex++;
    this.taskStatus = (this.currentTaskIndex < PIP_TASKS.length) ? TASK_STATUS.NOT_STARTED : TASK_STATUS.COMPLETED;
    this.taskProgress = 0;
    this.saveState();

    // If all tasks complete, equip wooden sword to Young Pip's 3D model!
    if (this.taskStatus === TASK_STATUS.COMPLETED) {
      this.equipPipWoodenSword();
    }

    audioSystem.playChime();
    this.notifyObjectiveComplete(`Task Complete! Claimed +${task.rewardXP} XP!`);
    this.updateHUD();
  }

  equipPipWoodenSword() {
    const pip = this.getPipVillager();
    if (!pip || !pip.animNodes || !pip.animNodes.armR) return;

    // Add wooden sword to Pip's right arm
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xd97706, flatShading: true });
    const bladeGeo = new THREE.BoxGeometry(0.12, 1.1, 0.04);
    const blade = new THREE.Mesh(bladeGeo, woodMat);
    blade.position.set(0, -0.6, 0.2);
    pip.animNodes.armR.add(blade);
  }

  updateHUD() {
    if (this.gameApp.hud) {
      const task = this.getCurrentTask();
      this.gameApp.hud.updatePipQuestTracker(task, this.taskStatus, this.taskProgress);
    }
  }

  /**
   * Setup Pip's Interactive Quest Modal DOM.
   */
  setupModalDOM() {
    this.modal = document.createElement('div');
    this.modal.className = 'pip-task-modal-backdrop';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="pip-task-card">
        <div class="pip-task-header">
          <div class="pip-avatar-box">
            <span class="pip-avatar">🥖</span>
            <div class="pip-meta">
              <h3>Young Pip</h3>
              <span class="pip-title">Eager Oakhaven Farmhand • Aspiring Knight</span>
            </div>
          </div>
          <button class="btn-close-pip-task" id="btnClosePipTask">✕</button>
        </div>

        <div class="pip-task-body" id="pipTaskBody">
          <!-- Dynamic task content -->
        </div>

        <div class="pip-task-footer" id="pipTaskFooter">
          <!-- Dynamic action buttons -->
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    this.modal.querySelector('#btnClosePipTask').addEventListener('click', () => {
      this.closeModal();
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.style.display !== 'none') {
        this.closeModal();
      }
    });
  }

  openModal() {
    const task = this.getCurrentTask();
    const body = this.modal.querySelector('#pipTaskBody');
    const footer = this.modal.querySelector('#pipTaskFooter');

    if (!task) {
      // All tasks completed
      body.innerHTML = `
        <div class="task-completed-all">
          <span class="star-trophy">🏆</span>
          <h3>All Tasks Completed!</h3>
          <p>“You did it, Hero! With your help, I finished all my chores, reclaimed my wooden sword, saw the Crossroads map, and our valley is safe from prowling beasts! You're my idol—one day I'll ride beside you as a true Knight of Valoria!”</p>
          <div class="task-reward-box">
            <span>🎖️ Title Unlocked: <strong>Young Pip's Knightly Mentor</strong></span>
          </div>
        </div>
      `;
      footer.innerHTML = `
        <button class="btn-task-action btn-task-close" id="btnTaskDone">Honor to Your Dream, Pip! ⚔️</button>
      `;
      footer.querySelector('#btnTaskDone').addEventListener('click', () => this.closeModal());
      this.modal.style.display = 'flex';
      return;
    }

    let speechText = '';
    let actionBtnHtml = '';

    if (this.taskStatus === TASK_STATUS.NOT_STARTED) {
      speechText = task.dialogOffer;
      actionBtnHtml = `
        <button class="btn-task-action btn-accept-task" id="btnAcceptTask">Accept Task: ${task.title} 📜</button>
      `;
    } else if (this.taskStatus === TASK_STATUS.IN_PROGRESS) {
      speechText = task.dialogInProgress;
      actionBtnHtml = `
        <button class="btn-task-action btn-continue-task" id="btnContinueTask">I'm on it, Pip! 🏃</button>
      `;
    } else if (this.taskStatus === TASK_STATUS.READY_TO_CLAIM) {
      speechText = task.dialogReadyToClaim;
      actionBtnHtml = `
        <button class="btn-task-action btn-claim-task" id="btnClaimTask">Turn In Task & Claim +${task.rewardXP} XP! 🎁</button>
      `;
    }

    body.innerHTML = `
      <div class="pip-speech-bubble">
        <span class="bubble-tag">💬 Young Pip says:</span>
        <p class="bubble-dialogue">“${speechText}”</p>
      </div>

      <div class="task-details-box">
        <div class="task-details-header">
          <span class="task-badge">${task.badge} • Task ${task.order}/4</span>
          <h4>${task.title}</h4>
        </div>
        <p class="task-desc">${task.description}</p>
        <div class="task-objective-row">
          <span class="obj-label">🎯 Objective:</span>
          <span class="obj-val">
            ${task.type === 'COLLECT' ? `Gather ${task.title.includes('Sword') ? 'Sword' : 'Golden Pumpkins'}: ${this.taskProgress}/${task.targetCount}` : ''}
            ${task.type === 'EXPLORE' ? `Scout Central Crossroads Obelisk (${this.taskProgress === 1 ? 'Verified ✅' : 'Incomplete ⏳'})` : ''}
            ${task.type === 'HUNT' ? `Slay Wild Forest Beast: ${this.taskProgress}/${task.targetCount}` : ''}
          </span>
        </div>
        <div class="task-meta-row">
          <span class="task-hint">${task.hint}</span>
          <span class="task-reward">🎁 Reward: +${task.rewardXP} XP</span>
        </div>
      </div>
    `;

    footer.innerHTML = actionBtnHtml;

    const acceptBtn = footer.querySelector('#btnAcceptTask');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        this.acceptCurrentTask();
        this.closeModal();
      });
    }

    const continueBtn = footer.querySelector('#btnContinueTask');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    const claimBtn = footer.querySelector('#btnClaimTask');
    if (claimBtn) {
      claimBtn.addEventListener('click', () => {
        this.claimTaskReward();
        this.closeModal();
      });
    }

    this.modal.style.display = 'flex';
  }

  closeModal() {
    this.modal.style.display = 'none';
  }
}

