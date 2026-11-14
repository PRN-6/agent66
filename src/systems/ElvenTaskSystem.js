import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';
import { audioSystem } from './AudioSystem.js';

export const ELVEN_TASK_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  READY_TO_CLAIM: 'READY_TO_CLAIM',
  COMPLETED: 'COMPLETED'
};

export const ELVEN_TASKS = [
  {
    id: 'task_elf_lotus',
    order: 1,
    title: 'The Luminous Starlight Lotuses',
    badge: '🌿 Botany',
    subtitle: 'Gather 3 radiant Starlight Lotuses from the Sylvaheim Mana Pool.',
    description: 'Alchemist Lunara needs pristine Starlight Lotus blossoms floating upon the sacred mana pool to brew celestial recovery philters. Their petals only bloom under pure starlight!',
    dialogOffer: "Greetings, traveler of the realm. You walk within Sylvaheim, where starlight has nurtured these boughs for three millennia. I am brewing celestial draughts for our sanctuary sentinels, but the Starlight Lotuses floating in our sacred pool require gentle harvesting. Would you gather 3 radiant blossoms from the pool?",
    dialogInProgress: "The lotuses float upon the shimmering waters of our mana pool just beside my pavilion. Handle their glowing petals with care.",
    dialogReadyToClaim: "Exquisite! You harvested all three without tearing a single petal! The mana resonates with immaculate purity. Here, take this freshly distilled Celestial Dew Phial and accept the gratitude of Sylvaheim!",
    dialogCompleted: "The starlight elixir is brewing splendidly. Our ward sentinels will be revitalized by your deeds.",
    type: 'COLLECT',
    targetCount: 3,
    rewardXP: 100,
    hint: '📍 Sylvaheim Starlight Mana Pool (X: -160, Z: 98)'
  },
  {
    id: 'task_elf_tree',
    order: 2,
    title: 'Communing with the Elder Trees',
    badge: '🍃 Reverence',
    subtitle: 'Ascend the canopy bridges to the Colossal Elder Trees.',
    description: 'The ancient mahogany Elder Trees have stood since the creation of the realm. Ascend the wooden suspension platforms to the Ancient Jade Font at their base and awaken the forest ward.',
    dialogOffer: "Centuries before human stone castles were conceived, our ancestors sang to the Colossal Elder Trees. Their roots channel the pulse of the continent. Ascend the wooden suspension bridge into their elevated boughs and touch the Ancient Jade Font to attune the forest ward.",
    dialogInProgress: "Follow the forest pathway east to the colossal mahogany trunks. Look for the ancient Jade Font gleaming on the elevated root platform.",
    dialogReadyToClaim: "I felt the boughs sigh with renewed vigor across the canopy! The ancient roots recognize your noble spirit. Take this Starlight Moon Silk sash as a token of elven favor!",
    dialogCompleted: "The Elder Trees hum with harmonious mana. Nature stands vigilant against the dark.",
    type: 'EXPLORE',
    targetCount: 1,
    rewardXP: 160,
    hint: '📍 Colossal Elder Trees Canopy (X: -140, Z: 150)'
  },
  {
    id: 'task_elf_spire',
    order: 3,
    title: 'Pilgrimage to the Moon Spire',
    badge: '🌙 Sanctuary',
    subtitle: 'Visit the Moon Spire Sanctuary and gaze upon the Celestial Moon Orb.',
    description: 'The Moon Spire Sanctuary is the pinnacle of elven architecture. Journey to the marble colonnades and receive the blessing of the levitating Celestial Moon Orb.',
    dialogOffer: "Beyond the western groves rises the Moon Spire Sanctuary—a citadel of white marble columns and jade spires, where the levitating Celestial Moon Orb gathers eternal starlight. Make the pilgrimage to the sanctuary and stand beneath the Moon Orb.",
    dialogInProgress: "Journey southwest toward the high marble colonnades of the Moon Spire Sanctuary. High Priestess Elenari watches over the sacred orb.",
    dialogReadyToClaim: "The celestial starlight surrounds you! To stand beneath the levitating Moon Orb is a blessing few mortals ever behold. You carry the grace of the stars itself!",
    dialogCompleted: "The Moon Spire shines eternal over Sylvaheim. Our people will never forget your reverence.",
    type: 'EXPLORE',
    targetCount: 1,
    rewardXP: 220,
    hint: '📍 Moon Spire Sanctuary (X: -200, Z: 200)'
  },
  {
    id: 'task_elf_blight',
    order: 4,
    title: 'Slay the Nether Blight Beast',
    badge: '⚔️ Purification',
    subtitle: 'Slay 1 corrupted shadow beast creeping along the Elven border.',
    description: 'A foul shadow creature spawned from the demon wastes has been corrupting the outer forest borders. Slay the beast with your Magic Sword skills to protect Sylvaheim.',
    dialogOffer: "A dark omen stirs. A shadow beast steeped in nether corruption has crossed the Great River and stalks the edge of our sacred forest. Our sentinels are on high alert. Hero, wield your Magic Sword and purge this corruption before its blight poisons our soil!",
    dialogInProgress: "Hunt down the corrupted beast prowling the border woods outside our ward. Let your blade shine with holy starlight!",
    dialogReadyToClaim: "The blight has vanished from the wind! You cleaved the corruption with legendary valor! By decree of Sylvaheim and the Moon Spire, you are hereby proclaimed an Honored Kin of the High Elves!",
    dialogCompleted: "Our sacred forest remains untainted. You are forever welcome beneath the starlight boughs of Sylvaheim!",
    type: 'HUNT',
    targetCount: 1,
    rewardXP: 350,
    hint: '📍 Forest Borderlands (X: -100, Z: 120)'
  }
];

export class ElvenTaskSystem {
  constructor(scene, gameApp) {
    this.scene = scene;
    this.gameApp = gameApp;

    this.currentTaskIndex = 0;
    this.taskStatus = ELVEN_TASK_STATUS.NOT_STARTED;
    this.taskProgress = 0;

    this.lunaraNPC = null;
    this.questMarker = null;

    this.questObjects = [];
    this.nearbyQuestObject = null;

    this.loadSavedState();
    this.initQuestObjects();
    this.setupModalDOM();
  }

  loadSavedState() {
    try {
      const savedIndex = localStorage.getItem('agent66_elven_task_index');
      const savedStatus = localStorage.getItem('agent66_elven_task_status');
      const savedProgress = localStorage.getItem('agent66_elven_task_progress');

      if (savedIndex !== null) this.currentTaskIndex = Math.min(ELVEN_TASKS.length, parseInt(savedIndex, 10));
      if (savedStatus !== null) this.taskStatus = savedStatus;
      if (savedProgress !== null) this.taskProgress = parseInt(savedProgress, 10);
    } catch {
      // ignore
    }
  }

  saveState() {
    try {
      localStorage.setItem('agent66_elven_task_index', this.currentTaskIndex.toString());
      localStorage.setItem('agent66_elven_task_status', this.taskStatus);
      localStorage.setItem('agent66_elven_task_progress', this.taskProgress.toString());
    } catch {
      // ignore
    }
  }

  getCurrentTask() {
    if (this.currentTaskIndex >= ELVEN_TASKS.length) return null;
    return ELVEN_TASKS[this.currentTaskIndex];
  }

  getLunaraNPC() {
    if (this.lunaraNPC) return this.lunaraNPC;
    if (this.gameApp.villageSettlement?.villagers) {
      this.lunaraNPC = this.gameApp.villageSettlement.villagers.find(v => v.config.id === 'villager_lunara');
    }
    return this.lunaraNPC;
  }

  initQuestObjects() {
    this.clearQuestObjects();
    const task = this.getCurrentTask();
    if (!task || this.taskStatus !== ELVEN_TASK_STATUS.IN_PROGRESS) return;

    if (task.id === 'task_elf_lotus') {
      this.spawnStarlightLotuses();
    } else if (task.id === 'task_elf_tree') {
      this.spawnAncientJadeFont();
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

  spawnStarlightLotuses() {
    const lotusPositions = [
      { x: -158, z: 96 },
      { x: -163, z: 100 },
      { x: -156, z: 102 }
    ];

    lotusPositions.forEach((pos, index) => {
      if (index < this.taskProgress) return;

      const group = new THREE.Group();
      const y = getTerrainHeight(pos.x, pos.z);
      group.position.set(pos.x, y + 0.15, pos.z);

      // Lotus Blossom Core
      const lotusMat = new THREE.MeshLambertMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        flatShading: true
      });
      const petalMat = new THREE.MeshLambertMaterial({
        color: 0xa5f3fc,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.4,
        flatShading: true
      });

      // 6 Lotus Petals arranged in a star
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const petalGeo = new THREE.ConeGeometry(0.22, 0.65, 4);
        petalGeo.scale(1, 0.4, 1.8);
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.rotation.x = Math.PI / 3;
        petal.rotation.y = angle;
        petal.position.set(Math.cos(angle) * 0.25, 0.1, Math.sin(angle) * 0.25);
        group.add(petal);
      }

      // Central Starlight Orb
      const coreGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const core = new THREE.Mesh(coreGeo, lotusMat);
      core.position.y = 0.22;
      group.add(core);

      // Glowing Point Light
      const light = new THREE.PointLight(0x38bdf8, 1.4, 8);
      light.position.set(0, 0.6, 0);
      group.add(light);

      // Shimmering Water Ripple Ring
      const ringGeo = new THREE.RingGeometry(0.6, 0.85, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.05;
      group.add(ringMesh);

      this.scene.add(group);

      this.questObjects.push({
        id: `lotus_${index}`,
        type: 'lotus',
        name: 'Starlight Lotus',
        prompt: `[E] Gather Starlight Lotus (${this.taskProgress + 1}/3)`,
        mesh: group,
        light: light,
        ring: ringMesh,
        pos: new THREE.Vector3(pos.x, y, pos.z),
        baseY: y,
        index: index
      });
    });
  }

  spawnAncientJadeFont() {
    const pos = { x: -140, z: 150 };
    const y = getTerrainHeight(pos.x, pos.z);

    const group = new THREE.Group();
    group.position.set(pos.x, y, pos.z);

    // Marble Dais
    const daisMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true });
    const daisGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.4, 8);
    const dais = new THREE.Mesh(daisGeo, daisMat);
    dais.position.y = 0.2;
    group.add(dais);

    // Jade Basin
    const jadeMat = new THREE.MeshLambertMaterial({ color: 0x0f766e, emissive: 0x047857, emissiveIntensity: 0.3, flatShading: true });
    const basinGeo = new THREE.CylinderGeometry(0.8, 0.6, 0.8, 8);
    const basin = new THREE.Mesh(basinGeo, jadeMat);
    basin.position.y = 0.7;
    group.add(basin);

    // Floating Moonstone Crystal
    const crystalMat = new THREE.MeshLambertMaterial({ color: 0x67e8f9, emissive: 0x06b6d4, emissiveIntensity: 0.7, flatShading: true });
    const crystalGeo = new THREE.OctahedronGeometry(0.35);
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = 1.45;
    group.add(crystal);

    // Cyan Beacon Light
    const light = new THREE.PointLight(0x06b6d4, 1.8, 12);
    light.position.set(0, 1.5, 0);
    group.add(light);

    this.scene.add(group);

    this.questObjects.push({
      id: 'jade_font',
      type: 'font',
      name: 'Ancient Jade Font',
      prompt: '[E] Commune with the Elder Tree Jade Font',
      mesh: group,
      crystal: crystal,
      light: light,
      pos: new THREE.Vector3(pos.x, y, pos.z),
      baseY: y
    });
  }

  update(delta, playerPos) {
    if (!playerPos) return;
    const time = performance.now() * 0.003;

    // 1. Update Lunara's 3D quest marker
    this.updateQuestMarker(delta, time);

    // 2. Animate 3D quest objects
    this.questObjects.forEach(obj => {
      if (obj.type === 'lotus') {
        obj.mesh.position.y = obj.baseY + Math.sin(time * 2.0 + obj.index) * 0.06;
        if (obj.ring) obj.ring.rotation.z += delta * 1.2;
        if (obj.light) obj.light.intensity = 1.2 + Math.sin(time * 3.0 + obj.index) * 0.3;
      } else if (obj.type === 'font') {
        if (obj.crystal) {
          obj.crystal.position.y = 1.45 + Math.sin(time * 2.5) * 0.1;
          obj.crystal.rotation.y += delta * 1.5;
        }
      }
    });

    // 3. Proximity check with quest items
    let nearest = null;
    let minDist = 3.2;
    for (const obj of this.questObjects) {
      const d = Math.hypot(playerPos.x - obj.pos.x, playerPos.z - obj.pos.z);
      if (d < minDist) {
        minDist = d;
        nearest = obj;
      }
    }
    this.nearbyQuestObject = nearest;

    // 4. Check exploration task (Task 3: Moon Spire Sanctuary)
    const task = this.getCurrentTask();
    if (task && task.id === 'task_elf_spire' && this.taskStatus === ELVEN_TASK_STATUS.IN_PROGRESS) {
      const distToSpire = Math.hypot(playerPos.x - (-200), playerPos.z - 200);
      if (distToSpire < 22.0) {
        this.taskProgress = 1;
        this.taskStatus = ELVEN_TASK_STATUS.READY_TO_CLAIM;
        this.saveState();
        this.notifyObjectiveComplete("Gazed upon the Moon Spire Sanctuary! Return to Alchemist Lunara.");
        audioSystem.playChime();
        this.updateHUD();
      }
    }
  }

  updateQuestMarker(delta, time) {
    const lunara = this.getLunaraNPC();
    if (!lunara || !lunara.group) return;

    if (!this.questMarker) {
      this.questMarker = this.createQuestMarkerMesh();
      lunara.group.add(this.questMarker);
    }

    const markerText = (this.taskStatus === ELVEN_TASK_STATUS.READY_TO_CLAIM)
      ? '❓'
      : (this.taskStatus === ELVEN_TASK_STATUS.NOT_STARTED ? '❗' : (this.taskStatus === ELVEN_TASK_STATUS.IN_PROGRESS ? '💬' : '⭐'));

    if (this.questMarker.userData.currentText !== markerText) {
      this.updateMarkerTexture(this.questMarker, markerText);
      this.questMarker.userData.currentText = markerText;
    }

    this.questMarker.position.y = 3.6 + Math.sin(time * 3.0) * 0.12;
    this.questMarker.rotation.y += delta * 1.8;
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
    return group;
  }

  updateMarkerTexture(markerGroup, text) {
    const canvas = markerGroup.userData.canvas;
    const texture = markerGroup.userData.texture;
    if (!canvas || !texture) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);

    const isQuestion = (text === '❓');
    const color = isQuestion ? '#34d399' : '#38bdf8';

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

  handleInteract() {
    if (!this.nearbyQuestObject) return false;

    const obj = this.nearbyQuestObject;
    const task = this.getCurrentTask();
    if (!task || this.taskStatus !== ELVEN_TASK_STATUS.IN_PROGRESS) return false;

    if (obj.type === 'lotus') {
      this.taskProgress++;
      this.spawnCollectSparks(obj.pos, '#38bdf8');
      this.scene.remove(obj.mesh);
      this.questObjects = this.questObjects.filter(o => o.id !== obj.id);
      this.nearbyQuestObject = null;

      audioSystem.playChime();
      this.notifyObjectiveProgress(`🌿 Starlight Lotus Gathered (${this.taskProgress}/${task.targetCount})`);

      if (this.taskProgress >= task.targetCount) {
        this.taskStatus = ELVEN_TASK_STATUS.READY_TO_CLAIM;
        this.notifyObjectiveComplete("All Starlight Lotuses collected! Return to Alchemist Lunara!");
      }

      this.saveState();
      this.updateHUD();
      return true;

    } else if (obj.type === 'font') {
      this.taskProgress = 1;
      this.spawnCollectSparks(obj.pos, '#10b981');
      audioSystem.playChime();
      this.taskStatus = ELVEN_TASK_STATUS.READY_TO_CLAIM;
      this.notifyObjectiveComplete("Attuned the Ancient Jade Font! Return to Lunara in Sylvaheim!");

      this.saveState();
      this.updateHUD();
      return true;
    }

    return false;
  }

  onMonsterKilled(monster) {
    const task = this.getCurrentTask();
    if (!task || task.id !== 'task_elf_blight' || this.taskStatus !== ELVEN_TASK_STATUS.IN_PROGRESS) return;

    this.taskProgress++;
    audioSystem.playChime();
    this.notifyObjectiveProgress(`⚔️ Shadow Beast Cleaved (${this.taskProgress}/${task.targetCount})`);

    if (this.taskProgress >= task.targetCount) {
      this.taskStatus = ELVEN_TASK_STATUS.READY_TO_CLAIM;
      this.notifyObjectiveComplete("Forest perimeter purged! Return to Alchemist Lunara!");
    }

    this.saveState();
    this.updateHUD();
  }

  spawnCollectSparks(pos, hexColor = '#38bdf8') {
    if (this.gameApp.combatSystem) {
      const p = pos.clone();
      p.y += 0.8;
      this.gameApp.combatSystem.spawnFloatingText(p, '✨ Harvested!', hexColor);
    }
  }

  notifyObjectiveProgress(msg) {
    if (this.gameApp.combatSystem && this.gameApp.player) {
      const p = this.gameApp.player.position.clone();
      p.y += 2.2;
      this.gameApp.combatSystem.spawnFloatingText(p, msg, '#67e8f9');
    }
  }

  notifyObjectiveComplete(msg) {
    if (this.gameApp.combatSystem && this.gameApp.player) {
      const p = this.gameApp.player.position.clone();
      p.y += 2.6;
      this.gameApp.combatSystem.spawnFloatingText(p, `🌟 ${msg}`, '#34d399');
    }
  }

  acceptCurrentTask() {
    const task = this.getCurrentTask();
    if (!task) return;

    this.taskStatus = ELVEN_TASK_STATUS.IN_PROGRESS;
    this.taskProgress = 0;
    this.saveState();

    this.initQuestObjects();

    const lunara = this.getLunaraNPC();
    if (lunara && lunara.brain) {
      lunara.brain.recordMemory(
        `The traveler accepted the task: "${task.title}". The stars favor their journey.`,
        'ACTION',
        8
      );
    }

    audioSystem.playChime();
    this.notifyObjectiveProgress(`📜 Accepted Task: ${task.title}`);
    this.updateHUD();
  }

  claimTaskReward() {
    const task = this.getCurrentTask();
    if (!task || this.taskStatus !== ELVEN_TASK_STATUS.READY_TO_CLAIM) return;

    const player = this.gameApp.player;
    if (player) {
      player.gainXP(task.rewardXP, (newLevel) => {
        if (this.gameApp.combatSystem) {
          this.gameApp.combatSystem.triggerLevelUp(player.group, player.characterId, newLevel);
        }
      });
    }

    const lunara = this.getLunaraNPC();
    if (lunara && lunara.brain) {
      lunara.brain.recordMemory(
        `The traveler completed "${task.title}" with flawless grace! Honored by Sylvaheim!`,
        'EVENT',
        10
      );
    }

    this.clearQuestObjects();
    this.currentTaskIndex++;
    this.taskStatus = (this.currentTaskIndex < ELVEN_TASKS.length) ? ELVEN_TASK_STATUS.NOT_STARTED : ELVEN_TASK_STATUS.COMPLETED;
    this.taskProgress = 0;
    this.saveState();

    audioSystem.playChime();
    this.notifyObjectiveComplete(`Elven Task Complete! Claimed +${task.rewardXP} XP!`);
    this.updateHUD();
  }

  updateHUD() {
    if (this.gameApp.hud) {
      const task = this.getCurrentTask();
      this.gameApp.hud.updateElvenQuestTracker(task, this.taskStatus, this.taskProgress);
    }
  }

  setupModalDOM() {
    this.modal = document.createElement('div');
    this.modal.className = 'pip-task-modal-backdrop';
    this.modal.style.display = 'none';

    this.modal.innerHTML = `
      <div class="pip-task-card elven-task-card">
        <div class="pip-task-header elven-task-header">
          <div class="pip-avatar-box">
            <span class="pip-avatar elven-avatar">🌙</span>
            <div class="pip-meta">
              <h3 style="color: #38bdf8;">Alchemist Lunara</h3>
              <span class="pip-title">Mana Weaver of Sylvaheim • Starlight Botanist</span>
            </div>
          </div>
          <button class="btn-close-pip-task" id="btnCloseElvenTask">✕</button>
        </div>

        <div class="pip-task-body" id="elvenTaskBody"></div>
        <div class="pip-task-footer" id="elvenTaskFooter"></div>
      </div>
    `;

    document.body.appendChild(this.modal);

    this.modal.querySelector('#btnCloseElvenTask').addEventListener('click', () => {
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
    const body = this.modal.querySelector('#elvenTaskBody');
    const footer = this.modal.querySelector('#elvenTaskFooter');

    if (!task) {
      body.innerHTML = `
        <div class="task-completed-all">
          <span class="star-trophy">🌟</span>
          <h3 style="color: #38bdf8;">The Starlight Trials are Complete!</h3>
          <p>“You have honored Sylvaheim with wisdom, grace, and valor. The sacred boughs flourish, our mana pool gleams with celestial light, and the borders are secure. You are forever kin to the High Elves.”</p>
          <div class="task-reward-box" style="border-color: #38bdf8; color: #38bdf8; background: rgba(6, 182, 212, 0.15);">
            <span>🎖️ Celestial Title Unlocked: <strong>Honored Kin of Sylvaheim</strong></span>
          </div>
        </div>
      `;
      footer.innerHTML = `
        <button class="btn-task-action btn-task-close" id="btnElvenDone">May the Stars Guide Sylvaheim 🌙</button>
      `;
      footer.querySelector('#btnElvenDone').addEventListener('click', () => this.closeModal());
      this.modal.style.display = 'flex';
      return;
    }

    let speechText = '';
    let actionBtnHtml = '';

    if (this.taskStatus === ELVEN_TASK_STATUS.NOT_STARTED) {
      speechText = task.dialogOffer;
      actionBtnHtml = `
        <button class="btn-task-action btn-accept-task" id="btnAcceptElvenTask" style="background: linear-gradient(135deg, #0284c7, #06b6d4); color: #ffffff;">Accept Trial: ${task.title} 🌿</button>
      `;
    } else if (this.taskStatus === ELVEN_TASK_STATUS.IN_PROGRESS) {
      speechText = task.dialogInProgress;
      actionBtnHtml = `
        <button class="btn-task-action btn-continue-task" id="btnContinueElvenTask">I will fulfill the trial, Lunara! 🌙</button>
      `;
    } else if (this.taskStatus === ELVEN_TASK_STATUS.READY_TO_CLAIM) {
      speechText = task.dialogReadyToClaim;
      actionBtnHtml = `
        <button class="btn-task-action btn-claim-task" id="btnClaimElvenTask">Turn In Trial & Claim +${task.rewardXP} XP! 🌟</button>
      `;
    }

    body.innerHTML = `
      <div class="pip-speech-bubble" style="border-left-color: #38bdf8;">
        <span class="bubble-tag" style="color: #38bdf8;">💬 Lunara speaks with celestial grace:</span>
        <p class="bubble-dialogue">“${speechText}”</p>
      </div>

      <div class="task-details-box">
        <div class="task-details-header">
          <span class="task-badge" style="background: rgba(6, 182, 212, 0.2); color: #38bdf8; border-color: rgba(6, 182, 212, 0.4);">${task.badge} • Trial ${task.order}/4</span>
          <h4>${task.title}</h4>
        </div>
        <p class="task-desc">${task.description}</p>
        <div class="task-objective-row">
          <span class="obj-label">🎯 Objective:</span>
          <span class="obj-val" style="color: #67e8f9;">
            ${task.type === 'COLLECT' ? `Gather Starlight Lotuses: ${this.taskProgress}/${task.targetCount}` : ''}
            ${task.type === 'EXPLORE' ? `${task.title.includes('Spire') ? 'Visit Moon Spire Sanctuary' : 'Attune Ancient Jade Font'}: ${this.taskProgress === 1 ? 'Complete ✅' : 'Incomplete ⏳'}` : ''}
            ${task.type === 'HUNT' ? `Slay Corrupted Shadow Beast: ${this.taskProgress}/${task.targetCount}` : ''}
          </span>
        </div>
        <div class="task-meta-row">
          <span class="task-hint">${task.hint}</span>
          <span class="task-reward" style="color: #38bdf8;">🎁 Reward: +${task.rewardXP} XP</span>
        </div>
      </div>
    `;

    footer.innerHTML = actionBtnHtml;

    const acceptBtn = footer.querySelector('#btnAcceptElvenTask');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        this.acceptCurrentTask();
        this.closeModal();
      });
    }

    const continueBtn = footer.querySelector('#btnContinueElvenTask');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }

    const claimBtn = footer.querySelector('#btnClaimElvenTask');
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

