import * as THREE from 'three';
import { CHARACTERS } from '../config/characters.js';
import { audioSystem } from '../systems/AudioSystem.js';
import { NPCBrain, BRAIN_TIERS } from '../ai/NPCBrain.js';
import { ITEM_DEFINITIONS } from '../systems/ItemDropSystem.js';
import { SKILLS, SKILL_BRANCHES } from '../config/skills.js';

export class CreatorDashboard {
  constructor({
    gameApp,
    groqAdapter,
    perceptionEngine,
    onFocusCharacter
  }) {
    this.gameApp = gameApp;
    this.groqAdapter = groqAdapter;
    this.perceptionEngine = perceptionEngine;
    this.onFocusCharacter = onFocusCharacter;

    this.isOpen = false;
    this.activeGodTab = 'powers'; // 'powers' | 'items' | 'monsters' | 'props' | 'spells' | 'minds' | 'ai'
    this.activeItemCategory = 'all';
    this.activeNPC = null;
    this.activeFilter = 'all';
    this.searchQuery = '';
    this.isGeneratingThought = false;
    this.autoThinkInterval = null;
    this.thoughtHistory = new Map(); // npcId -> [thoughts]

    this.initDOM();
    this.setupListeners();
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.className = 'creator-dashboard-backdrop';
    this.container.style.display = 'none';

    this.container.innerHTML = `
      <div class="creator-dashboard-card god-mode-card">
        <!-- Top Bar -->
        <div class="creator-header">
          <div class="creator-header-left">
            <span class="creator-badge">👑 DIVINE SANCTUARY • OVERSEER GOD MODE</span>
            <h2>GOD MODE & CREATOR OVERSEER SANCTUARY</h2>
            <span class="creator-subtitle">Spawn items, legendary dragons, beasts, cast magic skills, and govern citizen minds across the realm.</span>
          </div>
          <button class="btn-close-creator" id="btnCloseCreator" title="Close Sanctuary [K] or [Esc]">✕</button>
        </div>

        <!-- Master Navigation Tab Bar -->
        <div class="god-nav-strip">
          <div class="god-nav-tabs">
            <button class="god-tab active" data-tab="powers"><span class="tab-icon">⚡</span> God Powers</button>
            <button class="god-tab" data-tab="items"><span class="tab-icon">🎁</span> Spawn Items</button>
            <button class="god-tab" data-tab="monsters"><span class="tab-icon">🐉</span> Spawn Monsters</button>
            <button class="god-tab" data-tab="props"><span class="tab-icon">🏛️</span> Spawn Props</button>
            <button class="god-tab" data-tab="spells"><span class="tab-icon">✨</span> Magic Spells</button>
            <button class="god-tab" data-tab="minds"><span class="tab-icon">🧠</span> Citizen Minds</button>
            <button class="god-tab" data-tab="ai"><span class="tab-icon">⚙️</span> AI Config</button>
          </div>
        </div>

        <!-- Dashboard Content Panes -->
        <div class="god-panes-container">
          
          <!-- 1. PANE: GOD POWERS & CHEATS -->
          <div class="god-pane" id="pane_powers" style="display: flex;">
            <div class="god-scroll-content">
              <div class="god-section-title">
                <span>⚡ DIVINE HERO CHEATS & WORLD OVERRIDES</span>
                <small>Instant toggles for player invincibility, super speeds, wealth, and continental travel.</small>
              </div>

              <div class="god-cheats-grid">
                <!-- God Mode Invincible -->
                <div class="god-cheat-card">
                  <div class="cheat-info">
                    <span class="cheat-icon">👑</span>
                    <div>
                      <strong>Invincible God Mode</strong>
                      <span>Immunity to all monster damage and falls. HP locked to 100%.</span>
                    </div>
                  </div>
                  <button class="btn-god-action" id="btnToggleGodMode">
                    <span id="godModeLabel">🛡️ God Mode: OFF</span>
                  </button>
                </div>

                <!-- Speed Multiplier -->
                <div class="god-cheat-card">
                  <div class="cheat-info">
                    <span class="cheat-icon">⚡</span>
                    <div>
                      <strong>Super Speed Boost</strong>
                      <span>Multiply sprint and run velocities across the open world.</span>
                    </div>
                  </div>
                  <button class="btn-god-action" id="btnCycleSpeed">
                    <span id="godSpeedLabel">🏃 Speed: 1.0x (Normal)</span>
                  </button>
                </div>

                <!-- 1-Hit Kill Cleave -->
                <div class="god-cheat-card">
                  <div class="cheat-info">
                    <span class="cheat-icon">💥</span>
                    <div>
                      <strong>1-Hit Kill Cleave</strong>
                      <span>Supercharge sword and spell attack power to 9,999.</span>
                    </div>
                  </div>
                  <button class="btn-god-action" id="btnToggleOneHit">
                    <span id="oneHitLabel">⚔️ 1-Hit Kill: OFF</span>
                  </button>
                </div>

                <!-- Full Vitality Heal -->
                <div class="god-cheat-card">
                  <div class="cheat-info">
                    <span class="cheat-icon">💖</span>
                    <div>
                      <strong>Full Vitality Restore</strong>
                      <span>Immediately restore Player and Tamed Companion to 100% HP.</span>
                    </div>
                  </div>
                  <button class="btn-god-action" id="btnHealFull">
                    <span>✨ Heal 100% HP</span>
                  </button>
                </div>

                <!-- Gold Coins -->
                <div class="god-cheat-card">
                  <div class="cheat-info">
                    <span class="cheat-icon">🪙</span>
                    <div>
                      <strong>Treasury of Kings</strong>
                      <span>Bestow pure Valorian minted gold coins immediately.</span>
                    </div>
                  </div>
                  <div class="cheat-dual-btns">
                    <button class="btn-god-action-sm" id="btnAdd1000Gold">+1,000 🪙</button>
                    <button class="btn-god-action-sm" id="btnAdd10000Gold">+10,000 🪙</button>
                  </div>
                </div>

                <!-- Level Up -->
                <div class="god-cheat-card">
                  <div class="cheat-info">
                    <span class="cheat-icon">⭐</span>
                    <div>
                      <strong>Heroic Mastery & Level</strong>
                      <span>Gain immediate RPG experience, skill points, and combat stats.</span>
                    </div>
                  </div>
                  <div class="cheat-dual-btns">
                    <button class="btn-god-action-sm" id="btnLevelUp">+1 Level ⭐</button>
                    <button class="btn-god-action-sm" id="btnMaxLevel">Max Lv. 50 🌟</button>
                  </div>
                </div>
              </div>

              <!-- Instant Continental Teleport -->
              <div class="god-section-title" style="margin-top: 24px;">
                <span>🌌 INSTANT CONTINENTAL TELEPORT</span>
                <small>Warp the Creator's vessel to any capital landmark across the 1600m continent.</small>
              </div>

              <div class="teleport-chips-grid">
                <button class="btn-teleport-chip" data-x="0" data-z="10">
                  <span class="chip-icon">🌉</span>
                  <div class="chip-text">
                    <strong>Crossroads Bridge</strong>
                    <small>(0, 10) Central Sanctuary</small>
                  </div>
                </button>
                <button class="btn-teleport-chip" data-x="380" data-z="-380">
                  <span class="chip-icon">🏰</span>
                  <div class="chip-text">
                    <strong>Royal Citadel Castle</strong>
                    <small>(380, -380) Human Throne</small>
                  </div>
                </button>
                <button class="btn-teleport-chip" data-x="370" data-z="-250">
                  <span class="chip-icon">⛲</span>
                  <div class="chip-text">
                    <strong>High Valoria Castle Town</strong>
                    <small>(370, -250) Lion Fountain</small>
                  </div>
                </button>
                <button class="btn-teleport-chip" data-x="-120" data-z="-90">
                  <span class="chip-icon">🌋</span>
                  <div class="chip-text">
                    <strong>Krag’mar Demon Enclave</strong>
                    <small>(-120, -90) Obsidian Spire</small>
                  </div>
                </button>
                <button class="btn-teleport-chip" data-x="-160" data-z="90">
                  <span class="chip-icon">🌿</span>
                  <div class="chip-text">
                    <strong>Sylvaheim Elven Glade</strong>
                    <small>(-160, 90) Mana Pool</small>
                  </div>
                </button>
                <button class="btn-teleport-chip" data-x="105" data-z="140">
                  <span class="chip-icon">⚒️</span>
                  <div class="chip-text">
                    <strong>Karak-Vorn Dwarf Bastion</strong>
                    <small>(105, 140) Great Forge</small>
                  </div>
                </button>
              </div>

              <!-- Solar & Atmospheric Presets -->
              <div class="god-section-title" style="margin-top: 24px;">
                <span>☀️ SOLAR CHRONOMANCY & REALM WEATHER</span>
                <small>Instantly advance continental time or shift the sky's precipitation.</small>
              </div>

              <div class="time-weather-bar">
                <div class="tw-group">
                  <span class="tw-lbl">⏳ Time of Day:</span>
                  <button class="btn-tw-fast" data-time="0.25">🌅 Dawn</button>
                  <button class="btn-tw-fast" data-time="0.5">☀️ Noon</button>
                  <button class="btn-tw-fast" data-time="0.75">🌇 Dusk</button>
                  <button class="btn-tw-fast" data-time="0.0">🌙 Midnight</button>
                </div>
                <div class="tw-group">
                  <span class="tw-lbl">🌧️ Weather:</span>
                  <button class="btn-tw-fast" data-weather="CLEAR">☀️ Clear</button>
                  <button class="btn-tw-fast" data-weather="RAIN">🌧️ Rain</button>
                  <button class="btn-tw-fast" data-weather="SNOW">❄️ Snow</button>
                  <button class="btn-tw-fast" data-weather="ASH">🔥 Ash</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. PANE: SPAWN ITEMS & WEAPONS -->
          <div class="god-pane" id="pane_items" style="display: none;">
            <div class="god-scroll-content">
              <div class="god-section-title">
                <span>🎁 3D WORLD ITEM & WEAPON SPAWNER</span>
                <small>Spawn legendary swords, healing potions, gold chests, and mythical relics directly at your feet or equip them instantly.</small>
              </div>

              <!-- Filter Tabs -->
              <div class="item-filter-strip">
                <button class="item-filter-btn active" data-category="all">All Items</button>
                <button class="item-filter-btn" data-category="weapon">🗡️ Weapons</button>
                <button class="item-filter-btn" data-category="consumable">🧪 Potions & Food</button>
                <button class="item-filter-btn" data-category="treasure">🪙 Gold & Relics</button>
              </div>

              <!-- Item Grid -->
              <div class="spawner-items-grid" id="spawnerItemsGrid">
                <!-- Dynamically populated from ITEM_DEFINITIONS -->
              </div>
            </div>
          </div>

          <!-- 3. PANE: SPAWN MONSTERS & DRAGONS -->
          <div class="god-pane" id="pane_monsters" style="display: none;">
            <div class="god-scroll-content">
              <div class="god-section-title">
                <span>🐉 APEX DRAGONS & CONTINENTAL BEASTS SPAWNER</span>
                <small>Summon colossal aerial apex dragons or wild land beasts. Choose to spawn them as hostile threats or immediately as your single loyal tamed companion!</small>
              </div>

              <!-- Colossal Apex Dragons -->
              <div class="monster-category-title">
                <span>🐲 APEX MYTHICAL DRAGONS (WORLD BOSSES)</span>
              </div>

              <div class="dragons-spawner-grid">
                <!-- Ignis -->
                <div class="dragon-spawner-card">
                  <div class="dragon-card-head">
                    <span class="dragon-icon">🔥</span>
                    <div>
                      <strong>Ignis, the Inferno Dragon</strong>
                      <span class="dragon-badge-boss">NETHER CALAMITY</span>
                    </div>
                  </div>
                  <p class="dragon-desc">Colossal flame wyrm boasting 650 HP, 42m basalt horns, and incendiary magma breath that incinerates settlement defenses.</p>
                  <div class="card-dual-actions">
                    <button class="btn-spawn-dragon-boss" data-dragon="dragon_ignis">🐉 Summon Boss</button>
                    <button class="btn-spawn-dragon-tamed" data-dragon="dragon_ignis">🐾 Tame Companion</button>
                  </div>
                </div>

                <!-- Glacius -->
                <div class="dragon-spawner-card">
                  <div class="dragon-card-head">
                    <span class="dragon-icon">❄️</span>
                    <div>
                      <strong>Glacius, the Frost Wyrm</strong>
                      <span class="dragon-badge-boss" style="background: rgba(6, 182, 212, 0.2); color: #38bdf8; border-color: rgba(6, 182, 212, 0.4);">GLACIAL SCOURGE</span>
                    </div>
                  </div>
                  <p class="dragon-desc">Winged crystalline leviathan boasting 580 HP. Breathes blizzard sub-zero gales that freeze battlefields into jade ice.</p>
                  <div class="card-dual-actions">
                    <button class="btn-spawn-dragon-boss" data-dragon="dragon_glacius">🐉 Summon Boss</button>
                    <button class="btn-spawn-dragon-tamed" data-dragon="dragon_glacius">🐾 Tame Companion</button>
                  </div>
                </div>

                <!-- Chimera -->
                <div class="dragon-spawner-card">
                  <div class="dragon-card-head">
                    <span class="dragon-icon">⚡</span>
                    <div>
                      <strong>Chimera Tempest Apex</strong>
                      <span class="dragon-badge-boss" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border-color: rgba(168, 85, 247, 0.4);">VOID CHIMERA</span>
                    </div>
                  </div>
                  <p class="dragon-desc">Three-headed mythical beast with dragon wings, lion torso, and serpent tail. Roars lightning tempests across the crossroads.</p>
                  <div class="card-dual-actions">
                    <button class="btn-spawn-dragon-boss" data-dragon="dragon_chimera">🐉 Summon Boss</button>
                    <button class="btn-spawn-dragon-tamed" data-dragon="dragon_chimera">🐾 Tame Companion</button>
                  </div>
                </div>
              </div>

              <!-- Wild Realm Land Beasts -->
              <div class="monster-category-title" style="margin-top: 26px;">
                <span>🐾 CONTINENTAL LAND BEASTS & AUTOMATONS</span>
              </div>

              <div class="beasts-spawner-grid" id="beastsSpawnerGrid">
                <!-- Dynamically populated -->
              </div>
            </div>
          </div>

          <!-- 4. PANE: SPAWN PROPS & STRUCTURES -->
          <div class="god-pane" id="pane_props" style="display: none;">
            <div class="god-scroll-content">
              <div class="god-section-title">
                <span>🏛️ INTERACTIVE WORLD PROPS & STRUCTURES</span>
                <small>Construct useful medieval props, roaring bonfires, training dummies, and mana fountains anywhere in the continent.</small>
              </div>

              <div class="props-spawner-grid">
                <!-- Bonfire -->
                <div class="prop-card">
                  <span class="prop-icon">🔥</span>
                  <strong>Warm Bonfire</strong>
                  <p>Stone ring with burning hardwood logs and radiating torchlight.</p>
                  <button class="btn-spawn-prop" data-prop="bonfire">🏛️ Build at Feet</button>
                </div>

                <!-- Mana Crystal Pylon -->
                <div class="prop-card">
                  <span class="prop-icon">💎</span>
                  <strong>Mana Crystal Pylon</strong>
                  <p>Pulsing cyan celestial font that radiates continuous healing starlight.</p>
                  <button class="btn-spawn-prop" data-prop="crystal_pylon">🏛️ Build at Feet</button>
                </div>

                <!-- Training Dummy -->
                <div class="prop-card">
                  <span class="prop-icon">🎯</span>
                  <strong>Combat Training Dummy</strong>
                  <p>Reinforced straw dummy with target shield. Test damage combos and skills.</p>
                  <button class="btn-spawn-prop" data-prop="training_dummy">🏛️ Build at Feet</button>
                </div>

                <!-- Royal Treasure Chest -->
                <div class="prop-card">
                  <span class="prop-icon">🪙</span>
                  <strong>Royal Gold Chest</strong>
                  <p>Heavy gilded iron chest filled with 350 gold pieces. Walk up to claim.</p>
                  <button class="btn-spawn-prop" data-prop="treasure_chest">🏛️ Build at Feet</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 5. PANE: MAGIC SPELLBOOK -->
          <div class="god-pane" id="pane_spells" style="display: none;">
            <div class="god-scroll-content">
              <div class="god-section-title">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <div>
                    <span>✨ CONTINENTAL MAGIC SPELLBOOK & SKILL TREE</span>
                    <small>All 12 legendary skills across the 4 disciplines: Starlight, Nether Pyromancy, Steam Forge, and Dawnblade.</small>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <button class="btn-unlock-all-spells" id="btnUnlockAllSpells">✨ Unlock All Skills</button>
                    <button class="btn-reset-cooldowns" id="btnResetAllCooldowns">⚡ Reset Cooldowns</button>
                  </div>
                </div>
              </div>

              <div class="spellbook-grid" id="spellbookGrid">
                <!-- Dynamically populated from SKILLS -->
              </div>
            </div>
          </div>

          <!-- 6. PANE: CITIZEN MINDS & DIRECTORY -->
          <div class="god-pane" id="pane_minds" style="display: none;">
            <div class="creator-body">
              <!-- Left Directory: Realm Citizens -->
              <div class="creator-left-pane">
                <div class="directory-header">
                  <div class="directory-filter-tabs">
                    <button class="dir-tab active" data-filter="all">All</button>
                    <button class="dir-tab" data-filter="main6">⭐ Main 6</button>
                    <button class="dir-tab" data-filter="human">👑 Valoria</button>
                    <button class="dir-tab" data-filter="elf">🌿 Elves</button>
                    <button class="dir-tab" data-filter="dwarf">⚒️ Dwarves</button>
                    <button class="dir-tab" data-filter="demon">🔥 Demons</button>
                  </div>
                  <input type="text" id="dirSearchInput" class="dir-search-input" placeholder="Search citizens by name..." />
                </div>

                <div class="citizen-roster-list" id="citizenRosterList">
                  <!-- Dynamically populated -->
                </div>
              </div>

              <!-- Right Pane: Active NPC Mind Inspector -->
              <div class="creator-right-pane" id="mindInspectorPane">
                <div class="empty-inspector-state">
                  <span class="empty-icon">🧠</span>
                  <h3>No NPC Selected</h3>
                  <p>Click on any NPC in the 3D world or select a citizen from the left roster to inspect their consciousness, memory stream, and sensory perception.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 7. PANE: AI BACKEND CONFIG -->
          <div class="god-pane" id="pane_ai" style="display: none;">
            <div class="god-scroll-content">
              <div class="god-section-title">
                <span>⚙️ COGNITIVE AI BACKEND & MODEL ENGINE</span>
                <small>Configure Groq Cloud or local Ollama to power the individual minds of the realm's characters.</small>
              </div>

              <div class="ai-config-card">
                <div class="backend-tabs" style="margin-bottom: 16px;">
                  <button class="backend-tab active" data-backend="groq" id="tabBackendGroq">⚡ Groq Cloud (Ultra-Fast ~600 tok/s)</button>
                  <button class="backend-tab" data-backend="ollama" id="tabBackendOllama">🦙 Local Ollama (Private / Qwen2.5)</button>
                </div>

                <div class="config-status-badge" id="groqStatusBadge" style="margin-bottom: 18px; width: fit-content;">
                  <span class="status-dot"></span>
                  <span id="groqStatusText">Checking Cognitive Backend...</span>
                </div>

                <!-- Groq Controls -->
                <div class="config-inputs-vertical" id="groqInputsGroup">
                  <label>Groq Cloud API Key:</label>
                  <div class="input-key-wrapper" style="width: 100%; max-width: 520px;">
                    <span class="key-icon">🔑</span>
                    <input type="password" id="groqApiKeyInput" class="groq-key-input" style="flex: 1;" placeholder="Paste Groq API Key (gsk_...)" autocomplete="off" />
                    <button class="btn-eye-toggle" id="btnEyeToggle" title="Show/Hide Key">👁️</button>
                  </div>

                  <label style="margin-top: 14px;">Select LLM Model:</label>
                  <select id="groqModelSelect" class="groq-model-select" style="width: 100%; max-width: 520px;">
                    <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Recommended)</option>
                    <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant (Ultra-Fast ~600 tok/s)</option>
                    <option value="mixtral-8x7b-32768">Mixtral 8x7B (Long Context)</option>
                  </select>

                  <button class="btn-save-key" id="btnSaveKey" style="margin-top: 16px; width: fit-content;">Save & Test Groq ⚡</button>
                </div>

                <!-- Ollama Controls -->
                <div class="config-inputs-vertical" id="ollamaInputsGroup" style="display: none;">
                  <label>Ollama Local Endpoint:</label>
                  <div class="input-key-wrapper" style="width: 100%; max-width: 520px;">
                    <span class="key-icon">🌐</span>
                    <input type="text" id="ollamaEndpointInput" class="groq-key-input" style="flex: 1;" value="http://localhost:11434" placeholder="http://localhost:11434" />
                  </div>

                  <label style="margin-top: 14px;">Installed Local Model:</label>
                  <div style="display: flex; gap: 8px; width: 100%; max-width: 520px;">
                    <select id="ollamaModelSelect" class="groq-model-select" style="flex: 1;">
                      <option value="qwen2.5:7b-instruct">qwen2.5:7b-instruct (Recommended)</option>
                      <option value="qwen2.5-coder:7b">qwen2.5-coder:7b (Installed)</option>
                      <option value="llama3.1:8b">llama3.1:8b</option>
                      <option value="custom">Custom Model...</option>
                    </select>
                    <button class="btn-detect-models" id="btnDetectOllama" title="Fetch installed models from local Ollama">Detect 🔍</button>
                  </div>

                  <button class="btn-save-key" id="btnSaveOllama" style="margin-top: 16px; width: fit-content;">Save & Test Ollama 🦙</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(this.container);
  }

  setupListeners() {
    // Close button
    this.container.querySelector('#btnCloseCreator').addEventListener('click', () => {
      this.close();
    });

    // Close on backdrop click outside card
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });

    // Tab Navigation
    const godTabs = this.container.querySelectorAll('.god-tab');
    godTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });

    // --- GOD POWERS LISTENERS ---
    // 1. Invincible God Mode
    const btnGodMode = this.container.querySelector('#btnToggleGodMode');
    if (btnGodMode) {
      btnGodMode.addEventListener('click', () => {
        const player = this.gameApp.player;
        if (!player) return;
        player.isGodMode = !player.isGodMode;
        if (player.isGodMode) {
          player.currentHp = player.maxHp;
        }
        this.updateGodModeButtons();
        if (this.gameApp.combatSystem) {
          this.gameApp.combatSystem.spawnFloatingText(
            player.position,
            player.isGodMode ? '👑 God Mode: INVINCIBLE' : '🛡️ God Mode: DEACTIVATED',
            player.isGodMode ? '#fbbf24' : '#94a3b8',
            true
          );
        }
        audioSystem.playDoorChime(true);
      });
    }

    // 2. Speed Boost Cycle
    const btnSpeed = this.container.querySelector('#btnCycleSpeed');
    if (btnSpeed) {
      btnSpeed.addEventListener('click', () => {
        const player = this.gameApp.player;
        if (!player) return;
        if (player.speedMultiplier === 1.0) player.speedMultiplier = 2.0;
        else if (player.speedMultiplier === 2.0) player.speedMultiplier = 4.0;
        else player.speedMultiplier = 1.0;
        this.updateGodModeButtons();
        if (this.gameApp.combatSystem) {
          this.gameApp.combatSystem.spawnFloatingText(
            player.position,
            `⚡ Speed Boost: ${player.speedMultiplier}x`,
            '#38bdf8',
            true
          );
        }
        audioSystem.playFootstep('stone');
      });
    }

    // 3. 1-Hit Kill
    const btnOneHit = this.container.querySelector('#btnToggleOneHit');
    if (btnOneHit) {
      btnOneHit.addEventListener('click', () => {
        const player = this.gameApp.player;
        if (!player) return;
        if (player.attackPower < 9999) {
          player._origAtk = player.attackPower;
          player.attackPower = 9999;
        } else {
          player.attackPower = player._origAtk || 28;
        }
        this.updateGodModeButtons();
        if (this.gameApp.combatSystem) {
          this.gameApp.combatSystem.spawnFloatingText(
            player.position,
            player.attackPower >= 9999 ? '💥 1-Hit Kill Mode (9999 ATK)!' : '⚔️ Attack Power Reset',
            player.attackPower >= 9999 ? '#ef4444' : '#94a3b8',
            true
          );
        }
        audioSystem.playSpellSound('blade');
      });
    }

    // 4. Heal Full
    const btnHealFull = this.container.querySelector('#btnHealFull');
    if (btnHealFull) {
      btnHealFull.addEventListener('click', () => {
        const player = this.gameApp.player;
        if (!player) return;
        player.currentHp = player.maxHp;
        const pet = this.gameApp.monsterManager?.getTamedMonster();
        if (pet) {
          pet.currentHp = pet.maxHp;
          if (pet.updateHpBar) pet.updateHpBar(pet.currentHp, pet.maxHp, pet.level, true);
        }
        if (this.gameApp.combatSystem) {
          this.gameApp.combatSystem.spawnFloatingText(player.position, '💖 100% Full Vitality Restored!', '#34d399', true);
        }
        audioSystem.playChime();
      });
    }

    // 5. Gold Buttons
    const btnGold1000 = this.container.querySelector('#btnAdd1000Gold');
    if (btnGold1000) {
      btnGold1000.addEventListener('click', () => {
        const player = this.gameApp.player;
        if (player) {
          player.addGold(1000);
          if (this.gameApp.hud) this.gameApp.hud.updateLevel(player.level, player.xp, player.xpToNext, player.gold);
          if (this.gameApp.combatSystem) this.gameApp.combatSystem.spawnFloatingText(player.position, '+1,000 Gold Coins 🪙', '#f59e0b', true);
          audioSystem.playDoorChime(true);
        }
      });
    }

    const btnGold10000 = this.container.querySelector('#btnAdd10000Gold');
    if (btnGold10000) {
      btnGold10000.addEventListener('click', () => {
        const player = this.gameApp.player;
        if (player) {
          player.addGold(10000);
          if (this.gameApp.hud) this.gameApp.hud.updateLevel(player.level, player.xp, player.xpToNext, player.gold);
          if (this.gameApp.combatSystem) this.gameApp.combatSystem.spawnFloatingText(player.position, '+10,000 Gold Coins 💰', '#fbbf24', true);
          audioSystem.playDoorChime(true);
        }
      });
    }

    // 6. Level Up
    const btnLvlUp = this.container.querySelector('#btnLevelUp');
    if (btnLvlUp) {
      btnLvlUp.addEventListener('click', () => {
        const player = this.gameApp.player;
        if (player) {
          player.gainXP(player.xpToNext - player.xp + 10, (lvl) => {
            if (this.gameApp.combatSystem) this.gameApp.combatSystem.triggerLevelUp(player.group, player.characterId, lvl);
          });
          if (this.gameApp.hud) this.gameApp.hud.updateLevel(player.level, player.xp, player.xpToNext, player.gold);
          audioSystem.playChime();
        }
      });
    }

    const btnMaxLvl = this.container.querySelector('#btnMaxLevel');
    if (btnMaxLvl) {
      btnMaxLvl.addEventListener('click', () => {
        const player = this.gameApp.player;
        if (player) {
          player.level = 50;
          player.xp = 0;
          player.xpToNext = 5000;
          player.maxHp = 1200;
          player.currentHp = 1200;
          player.attackPower = Math.max(player.attackPower, 350);
          if (this.gameApp.hud) this.gameApp.hud.updateLevel(player.level, player.xp, player.xpToNext, player.gold);
          if (this.gameApp.combatSystem) this.gameApp.combatSystem.triggerLevelUp(player.group, player.characterId, 50);
          audioSystem.playChime();
        }
      });
    }

    // 7. Teleport Chips
    const teleChips = this.container.querySelectorAll('.btn-teleport-chip');
    teleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const x = parseFloat(chip.dataset.x);
        const z = parseFloat(chip.dataset.z);
        if (this.gameApp.player) {
          this.gameApp.player.teleport(x, z);
          if (this.gameApp.cameraManager) {
            this.gameApp.cameraManager.currentLookAt.set(x, this.gameApp.player.position.y, z);
          }
          if (this.gameApp.combatSystem) {
            this.gameApp.combatSystem.spawnFloatingText(this.gameApp.player.position, '🌌 Teleported!', '#38bdf8', true);
          }
          audioSystem.playTeleport();
        }
      });
    });

    // 8. Time & Weather Presets
    const twFast = this.container.querySelectorAll('.btn-tw-fast');
    twFast.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.time !== undefined && this.gameApp.dayNightCycle) {
          this.gameApp.dayNightCycle.setTime(parseFloat(btn.dataset.time));
          audioSystem.playFootstep('stone');
        } else if (btn.dataset.weather && this.gameApp.weatherSystem) {
          this.gameApp.weatherSystem.triggerManualMode(btn.dataset.weather);
          audioSystem.playDoorChime(true);
        }
      });
    });

    // --- ITEM SPAWNER FILTER BUTTONS ---
    const itemFilters = this.container.querySelectorAll('.item-filter-btn');
    itemFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        itemFilters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeItemCategory = btn.dataset.category;
        this.renderItemSpawner();
      });
    });

    // --- DRAGON SPAWNER BUTTONS ---
    this.container.querySelectorAll('.btn-spawn-dragon-boss').forEach(btn => {
      btn.addEventListener('click', () => {
        const dragonId = btn.dataset.dragon;
        const playerPos = this.gameApp.player?.position;
        if (playerPos && this.gameApp.mythicalDragonSystem) {
          this.gameApp.mythicalDragonSystem.spawnDragonAt(dragonId, playerPos.x + 14, playerPos.z + 14, false);
          audioSystem.playDoorChime(true);
        }
      });
    });

    this.container.querySelectorAll('.btn-spawn-dragon-tamed').forEach(btn => {
      btn.addEventListener('click', () => {
        const dragonId = btn.dataset.dragon;
        const playerPos = this.gameApp.player?.position;
        if (playerPos && this.gameApp.mythicalDragonSystem) {
          this.gameApp.mythicalDragonSystem.spawnDragonAt(dragonId, playerPos.x + 3.0, playerPos.z + 3.0, true);
          audioSystem.playDoorChime(true);
        }
      });
    });

    // --- PROP SPAWNER BUTTONS ---
    this.container.querySelectorAll('.btn-spawn-prop').forEach(btn => {
      btn.addEventListener('click', () => {
        const propType = btn.dataset.prop;
        const player = this.gameApp.player;
        if (player && this.gameApp.itemDropSystem) {
          const angle = player.currentRotation || 0;
          const px = player.position.x + Math.sin(angle) * 3.0;
          const pz = player.position.z + Math.cos(angle) * 3.0;
          this.gameApp.itemDropSystem.spawnProp(propType, px, pz);
        }
      });
    });

    // --- SPELLBOOK ACTION BUTTONS ---
    const btnUnlockAll = this.container.querySelector('#btnUnlockAllSpells');
    if (btnUnlockAll) {
      btnUnlockAll.addEventListener('click', () => {
        if (this.gameApp.skillSystem) {
          for (const s of SKILLS) {
            this.gameApp.skillSystem.unlockedSkills.add(s.id);
          }
          this.renderSpellbook();
          if (this.gameApp.combatSystem && this.gameApp.player) {
            this.gameApp.combatSystem.spawnFloatingText(this.gameApp.player.position, '✨ All 12 Magic Skills Unlocked!', '#38bdf8', true);
          }
          audioSystem.playDoorChime(true);
        }
      });
    }

    const btnResetCD = this.container.querySelector('#btnResetAllCooldowns');
    if (btnResetCD) {
      btnResetCD.addEventListener('click', () => {
        if (this.gameApp.skillSystem) {
          this.gameApp.skillSystem.cooldowns = {};
          if (this.gameApp.hud && this.gameApp.hud.updateSkillCooldowns) {
            this.gameApp.hud.updateSkillCooldowns({});
          }
          if (this.gameApp.combatSystem && this.gameApp.player) {
            this.gameApp.combatSystem.spawnFloatingText(this.gameApp.player.position, '⚡ All Cooldowns Reset!', '#eab308', true);
          }
          audioSystem.playChime();
        }
      });
    }

    // --- AI CONFIG LISTENERS ---
    const tabGroq = this.container.querySelector('#tabBackendGroq');
    const tabOllama = this.container.querySelector('#tabBackendOllama');
    const groqGroup = this.container.querySelector('#groqInputsGroup');
    const ollamaGroup = this.container.querySelector('#ollamaInputsGroup');

    tabGroq.addEventListener('click', () => {
      tabGroq.classList.add('active');
      tabOllama.classList.remove('active');
      groqGroup.style.display = 'flex';
      ollamaGroup.style.display = 'none';
      this.groqAdapter.setBackend('groq');
      this.updateStatusBadge();
    });

    tabOllama.addEventListener('click', () => {
      tabOllama.classList.add('active');
      tabGroq.classList.remove('active');
      groqGroup.style.display = 'none';
      ollamaGroup.style.display = 'flex';
      this.groqAdapter.setBackend('ollama');
      this.updateStatusBadge();
    });

    const keyInput = this.container.querySelector('#groqApiKeyInput');
    const eyeToggle = this.container.querySelector('#btnEyeToggle');
    eyeToggle.addEventListener('click', () => {
      keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
    });

    this.container.querySelector('#btnSaveKey').addEventListener('click', () => {
      this.saveAndTestGroq();
    });

    this.container.querySelector('#btnSaveOllama').addEventListener('click', () => {
      this.saveAndTestOllama();
    });

    this.container.querySelector('#btnDetectOllama').addEventListener('click', () => {
      this.detectOllamaModels();
    });

    // Faction Filter tabs in Minds pane
    const tabs = this.container.querySelectorAll('.dir-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeFilter = tab.dataset.filter;
        this.renderCitizenList();
      });
    });

    // Search filter in Minds pane
    const searchInput = this.container.querySelector('#dirSearchInput');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderCitizenList();
    });
  }

  switchTab(tabId) {
    this.activeGodTab = tabId;

    // Toggle tab buttons
    this.container.querySelectorAll('.god-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });

    // Toggle content panes
    this.container.querySelectorAll('.god-pane').forEach(p => {
      p.style.display = (p.id === 'pane_' + tabId) ? 'flex' : 'none';
    });

    // Render pane contents
    if (tabId === 'powers') {
      this.updateGodModeButtons();
    } else if (tabId === 'items') {
      this.renderItemSpawner();
    } else if (tabId === 'monsters') {
      this.renderBeastsSpawner();
    } else if (tabId === 'spells') {
      this.renderSpellbook();
    } else if (tabId === 'minds') {
      this.renderCitizenList();
    }
  }

  updateGodModeButtons() {
    const player = this.gameApp.player;
    if (!player) return;

    const lblGod = this.container.querySelector('#godModeLabel');
    if (lblGod) {
      lblGod.textContent = player.isGodMode ? '👑 God Mode: ACTIVE (Invincible)' : '🛡️ God Mode: OFF';
      lblGod.parentElement.style.background = player.isGodMode ? 'rgba(245, 158, 11, 0.35)' : 'rgba(255, 255, 255, 0.08)';
      lblGod.parentElement.style.borderColor = player.isGodMode ? '#fbbf24' : 'rgba(255, 255, 255, 0.15)';
    }

    const lblSpeed = this.container.querySelector('#godSpeedLabel');
    if (lblSpeed) {
      lblSpeed.textContent = `🏃 Speed: ${player.speedMultiplier || 1.0}x`;
      lblSpeed.parentElement.style.background = (player.speedMultiplier > 1.0) ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.08)';
    }

    const lblOneHit = this.container.querySelector('#oneHitLabel');
    if (lblOneHit) {
      const isOneHit = (player.attackPower >= 9999);
      lblOneHit.textContent = isOneHit ? '💥 1-Hit Kill: ACTIVE' : '⚔️ 1-Hit Kill: OFF';
      lblOneHit.parentElement.style.background = isOneHit ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 255, 255, 0.08)';
    }
  }

  renderItemSpawner() {
    const grid = this.container.querySelector('#spawnerItemsGrid');
    if (!grid) return;

    const filtered = (this.activeItemCategory === 'all')
      ? ITEM_DEFINITIONS
      : ITEM_DEFINITIONS.filter(i => i.category === this.activeItemCategory);

    grid.innerHTML = filtered.map(item => `
      <div class="spawner-item-card" style="border-top: 3px solid ${item.color};">
        <div class="item-card-top">
          <span class="item-icon-box" style="background: ${item.color}22; border-color: ${item.color}66;">${item.icon}</span>
          <div class="item-meta">
            <strong>${item.name}</strong>
            <span class="rarity-badge rarity-${item.rarity}">${item.rarity.toUpperCase()}</span>
          </div>
        </div>

        <p class="item-desc">${item.desc}</p>

        <div class="item-card-actions">
          <button class="btn-spawn-item-world" data-id="${item.id}" title="Spawn 3D rotating model in world at player position">
            <span>✨ Spawn at Feet</span>
          </button>
          <button class="btn-equip-item-direct" data-id="${item.id}" title="Immediately apply/equip to player inventory">
            <span>⚡ Use / Equip</span>
          </button>
        </div>
      </div>
    `).join('');

    // Wire buttons
    grid.querySelectorAll('.btn-spawn-item-world').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (this.gameApp.itemDropSystem) {
          this.gameApp.itemDropSystem.spawnAtPlayer(id);
        }
      });
    });

    grid.querySelectorAll('.btn-equip-item-direct').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        if (this.gameApp.itemDropSystem) {
          this.gameApp.itemDropSystem.giveDirectly(id);
        }
      });
    });
  }

  renderBeastsSpawner() {
    const grid = this.container.querySelector('#beastsSpawnerGrid');
    if (!grid) return;

    const beasts = [
      { type: 'wolf', name: 'Dire Shadow Wolf', icon: '🐺', desc: 'Savage woodland predator. High sprint agility and ferocious bite.' },
      { type: 'treant', name: 'Elder Ancient Treant', icon: '🌲', desc: 'Colossal living forest sentinel with rooted stomp shockwaves.' },
      { type: 'golem', name: 'Rune Obsidian Golem', icon: '🗿', desc: 'Indestructible stone behemoth imbued with ancient dwarven runes.' },
      { type: 'drake', name: 'Fire Drake of Wastes', icon: '🦎', desc: 'Lava-infused reptilian drake spitting explosive volcanic sparks.' },
      { type: 'automaton', name: 'Dwarven Steam Automaton', icon: '⚙️', desc: 'Clockwork iron guardian powered by high-pressure steam pipes.' },
      { type: 'boar', name: 'Armored Forest Boar', icon: '🐗', desc: 'Tusked war beast that charges with crushing tusks.' },
      { type: 'wyvern', name: 'Sky Apex Wyvern', icon: '🦅', desc: 'Poison-barbed aerial flyer guarding high mountain crags.' },
      { type: 'skeleton', name: 'Cursed Skeleton Knight', icon: '💀', desc: 'Ancient fallen warrior brandishing rusted broadsword and buckler.' }
    ];

    grid.innerHTML = beasts.map(b => `
      <div class="beast-spawner-card">
        <div class="beast-card-head">
          <span class="beast-icon">${b.icon}</span>
          <div>
            <strong>${b.name}</strong>
            <span class="beast-sub">${b.type.toUpperCase()}</span>
          </div>
        </div>
        <p class="beast-desc">${b.desc}</p>
        <div class="card-dual-actions">
          <button class="btn-spawn-beast-hostile" data-type="${b.type}">⚔️ Hostile</button>
          <button class="btn-spawn-beast-tamed" data-type="${b.type}">🐾 Tamed Pet</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.btn-spawn-beast-hostile').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const player = this.gameApp.player;
        if (player && this.gameApp.monsterManager) {
          const angle = player.currentRotation || 0;
          const px = player.position.x + Math.sin(angle) * 7.0;
          const pz = player.position.z + Math.cos(angle) * 7.0;
          this.gameApp.monsterManager.spawnCustomMonster(type, px, pz, false, player.level + 2);
          audioSystem.playDoorChime(true);
        }
      });
    });

    grid.querySelectorAll('.btn-spawn-beast-tamed').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const player = this.gameApp.player;
        if (player && this.gameApp.monsterManager) {
          const angle = player.currentRotation || 0;
          const px = player.position.x + Math.sin(angle) * 2.5;
          const pz = player.position.z + Math.cos(angle) * 2.5;
          this.gameApp.monsterManager.spawnCustomMonster(type, px, pz, true, player.level);
          audioSystem.playDoorChime(true);
        }
      });
    });
  }

  renderSpellbook() {
    const grid = this.container.querySelector('#spellbookGrid');
    if (!grid) return;

    const skillSystem = this.gameApp.skillSystem;
    const unlocked = skillSystem ? skillSystem.unlockedSkills : new Set();
    const equipped = skillSystem ? skillSystem.equippedSlots : [];

    grid.innerHTML = SKILLS.map(skill => {
      const isUnlocked = unlocked.has(skill.id);
      const slotIdx = equipped.indexOf(skill.id);
      const slotTag = (slotIdx !== -1) ? `[Equipped: Slot ${slotIdx + 1}]` : '';

      return `
        <div class="spell-card ${isUnlocked ? 'unlocked' : 'locked'}" style="border-top: 3px solid ${skill.color};">
          <div class="spell-card-head">
            <span class="spell-icon-box" style="background: ${skill.color}22; border-color: ${skill.color}66;">${skill.icon}</span>
            <div class="spell-meta">
              <strong>${skill.name}</strong>
              <span class="spell-discipline" style="color: ${skill.color};">${skill.branch.toUpperCase()} • TIER ${skill.tier}</span>
            </div>
            ${slotTag ? `<span class="equipped-tag">${slotTag}</span>` : ''}
          </div>

          <p class="spell-desc">${skill.desc}</p>

          <div class="spell-stats-row">
            <span>💥 Damage: <strong>${skill.damage}</strong></span>
            <span>⏳ Cooldown: <strong>${skill.cooldown}s</strong></span>
            <span>🎯 Range: <strong>${skill.radius}m</strong></span>
          </div>

          <div class="spell-assign-row">
            <span class="assign-label">Hotbar Slot:</span>
            <button class="btn-slot-assign ${slotIdx === 0 ? 'active' : ''}" data-skill="${skill.id}" data-slot="0">Q (1)</button>
            <button class="btn-slot-assign ${slotIdx === 1 ? 'active' : ''}" data-skill="${skill.id}" data-slot="1">R (2)</button>
            <button class="btn-slot-assign ${slotIdx === 2 ? 'active' : ''}" data-skill="${skill.id}" data-slot="2">T (3)</button>
            <button class="btn-slot-assign ${slotIdx === 3 ? 'active' : ''}" data-skill="${skill.id}" data-slot="3">Y (4)</button>
          </div>
        </div>
      `;
    }).join('');

    // Wire slot assign buttons
    grid.querySelectorAll('.btn-slot-assign').forEach(btn => {
      btn.addEventListener('click', () => {
        const skillId = btn.dataset.skill;
        const slotIdx = parseInt(btn.dataset.slot);
        if (skillSystem) {
          skillSystem.unlockedSkills.add(skillId);
          skillSystem.equipSkill(skillId, slotIdx);
          this.renderSpellbook();
          if (this.gameApp.hud && this.gameApp.hud.updateSkillHotbar) {
            this.gameApp.hud.updateSkillHotbar(skillSystem.equippedSlots);
          }
          audioSystem.playDoorChime(true);
        }
      });
    });
  }

  open(targetNPC = null) {
    this.isOpen = true;
    this.container.style.display = 'flex';

    // Populate Groq inputs
    const keyInput = this.container.querySelector('#groqApiKeyInput');
    if (keyInput) keyInput.value = this.groqAdapter.getApiKey();

    const groqModelSelect = this.container.querySelector('#groqModelSelect');
    if (groqModelSelect) groqModelSelect.value = this.groqAdapter.getGroqModel();

    // Populate Ollama inputs
    const ollamaEndpointInput = this.container.querySelector('#ollamaEndpointInput');
    if (ollamaEndpointInput) ollamaEndpointInput.value = this.groqAdapter.getOllamaEndpoint();

    const ollamaModelSelect = this.container.querySelector('#ollamaModelSelect');
    if (ollamaModelSelect) {
      const activeOllamaModel = this.groqAdapter.getOllamaModel();
      let exists = false;
      for (let i = 0; i < ollamaModelSelect.options.length; i++) {
        if (ollamaModelSelect.options[i].value === activeOllamaModel) {
          ollamaModelSelect.selectedIndex = i;
          exists = true;
          break;
        }
      }
      if (!exists && activeOllamaModel) {
        const opt = document.createElement('option');
        opt.value = activeOllamaModel;
        opt.textContent = `${activeOllamaModel} (Active)`;
        opt.selected = true;
        ollamaModelSelect.insertBefore(opt, ollamaModelSelect.firstChild);
      }
    }

    this.updateStatusBadge();

    if (targetNPC) {
      this.switchTab('minds');
      this.selectNPC(targetNPC);
    } else {
      this.switchTab(this.activeGodTab || 'powers');
    }
  }

  close() {
    this.isOpen = false;
    this.container.style.display = 'none';
    if (this.autoThinkInterval) {
      clearInterval(this.autoThinkInterval);
      this.autoThinkInterval = null;
    }
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  async saveAndTestGroq() {
    const keyInput = this.container.querySelector('#groqApiKeyInput');
    const modelSelect = this.container.querySelector('#groqModelSelect');
    const saveBtn = this.container.querySelector('#btnSaveKey');

    const key = keyInput.value.trim();
    const model = modelSelect.value;

    this.groqAdapter.setApiKey(key);
    this.groqAdapter.setGroqModel(model);
    this.groqAdapter.setBackend('groq');

    saveBtn.disabled = true;
    saveBtn.textContent = 'Testing ⏳';

    const result = await this.groqAdapter.testConnection();

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save & Test ⚡';

    this.updateStatusBadge();

    if (result.success) {
      alert(`✅ Groq Connection Successful!\nModel: ${result.model}\nLatency: ${result.latencyMs}ms`);
      if (this.activeNPC) {
        this.generateManualThought();
      }
    } else {
      alert(`⚠️ Groq Test Failed:\n${result.error}\nFalling back to procedural cognitive heuristics.`);
    }
  }

  async saveAndTestOllama() {
    const endpointInput = this.container.querySelector('#ollamaEndpointInput');
    const modelSelect = this.container.querySelector('#ollamaModelSelect');
    const saveBtn = this.container.querySelector('#btnSaveOllama');

    const endpoint = endpointInput.value.trim();
    const model = modelSelect.value;

    this.groqAdapter.setOllamaEndpoint(endpoint);
    this.groqAdapter.setOllamaModel(model);
    this.groqAdapter.setBackend('ollama');

    saveBtn.disabled = true;
    saveBtn.textContent = 'Testing ⏳';

    const result = await this.groqAdapter.testConnection();

    saveBtn.disabled = false;
    saveBtn.textContent = 'Save & Test 🦙';

    this.updateStatusBadge();

    if (result.success) {
      alert(`✅ Ollama Connection Successful!\nModel: ${result.model}\nEndpoint: ${result.endpoint}\nLatency: ${result.latencyMs}ms`);
      if (this.activeNPC) {
        this.generateManualThought();
      }
    } else {
      alert(`⚠️ Ollama Connection Failed:\n${result.error}\nEnsure Ollama is running and accessible.`);
    }
  }

  async detectOllamaModels() {
    const detectBtn = this.container.querySelector('#btnDetectOllama');
    const modelSelect = this.container.querySelector('#ollamaModelSelect');

    detectBtn.disabled = true;
    detectBtn.textContent = 'Detecting...';

    const result = await this.groqAdapter.detectOllamaModels();

    detectBtn.disabled = false;
    detectBtn.textContent = 'Detect 🔍';

    if (result.success && result.models.length > 0) {
      modelSelect.innerHTML = '';
      result.models.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m;
        modelSelect.appendChild(opt);
      });
      const customOpt = document.createElement('option');
      customOpt.value = 'custom';
      customOpt.textContent = 'Custom Model...';
      modelSelect.appendChild(customOpt);

      this.groqAdapter.setOllamaModel(result.models[0]);
      alert(`🔍 Detected ${result.models.length} local Ollama models!\nActive model set to: ${result.models[0]}`);
      this.updateStatusBadge();
    } else {
      alert(`⚠️ Could not detect Ollama models: ${result.error || 'No models found'}\nDefaulting to recommended tags.`);
    }
  }

  updateStatusBadge() {
    const badge = this.container.querySelector('#groqStatusBadge');
    const text = this.container.querySelector('#groqStatusText');
    const status = this.groqAdapter.getStatus();

    badge.className = `config-status-badge ${status.status}`;
    text.textContent = status.label;
  }

  getAllCitizens() {
    const list = [];

    // 1. Main 6 Characters
    CHARACTERS.forEach(c => {
      let brain = null;
      let entity = null;

      if (this.gameApp.player && this.gameApp.player.characterId === c.id) {
        brain = this.gameApp.player.brain;
        entity = this.gameApp.player;
      } else if (this.gameApp.npcManager) {
        const npcInst = this.gameApp.npcManager.npcs.get(c.id);
        if (npcInst) {
          brain = npcInst.brain;
          entity = npcInst;
        }
      }

      list.push({
        id: c.id,
        name: c.name,
        badge: c.badge || '👑 LEGEND',
        role: c.role,
        homeland: c.homeland,
        race: c.race || 'Human',
        age: c.age || 25,
        lifespan: c.lifespan || '75-100 Years',
        isMain6: true,
        category: 'main6',
        faction: c.id === 'malakor' ? 'demon' : (c.id === 'vance' ? 'dwarf' : 'human'),
        config: c,
        brain: brain,
        entity: entity
      });
    });

    // 2. Realm Landmark NPCs
    if (this.gameApp.realmNPCs && this.gameApp.realmNPCs.npcs) {
      this.gameApp.realmNPCs.npcs.forEach(r => {
        list.push({
          id: r.id,
          name: r.name,
          badge: `${r.icon} ${r.race.toUpperCase()}`,
          role: r.title,
          homeland: r.homeland,
          race: r.race,
          age: r.age,
          lifespan: r.lifespan,
          isMain6: false,
          category: r.race.toLowerCase(),
          faction: r.race.toLowerCase(),
          config: r,
          brain: r.brain,
          entity: r
        });
      });
    }

    return list;
  }

  renderCitizenList() {
    const listContainer = this.container.querySelector('#citizenRosterList');
    if (!listContainer) return;

    let citizens = this.getAllCitizens();

    if (this.activeFilter === 'main6') {
      citizens = citizens.filter(c => c.isMain6);
    } else if (this.activeFilter === 'human') {
      citizens = citizens.filter(c => c.race.toLowerCase().includes('human'));
    } else if (this.activeFilter === 'elf') {
      citizens = citizens.filter(c => c.race.toLowerCase().includes('elf'));
    } else if (this.activeFilter === 'dwarf') {
      citizens = citizens.filter(c => c.race.toLowerCase().includes('dwarf'));
    } else if (this.activeFilter === 'demon') {
      citizens = citizens.filter(c => c.race.toLowerCase().includes('demon'));
    }

    if (this.searchQuery) {
      citizens = citizens.filter(c => 
        c.name.toLowerCase().includes(this.searchQuery) ||
        c.role.toLowerCase().includes(this.searchQuery) ||
        c.homeland.toLowerCase().includes(this.searchQuery)
      );
    }

    listContainer.innerHTML = citizens.map(c => {
      const isSelected = (this.activeNPC && this.activeNPC.id === c.id);
      return `
        <div class="roster-item ${isSelected ? 'selected' : ''}" data-id="${c.id}">
          <div class="roster-item-header">
            <span class="roster-name">${c.name}</span>
            <span class="roster-badge">${c.badge}</span>
          </div>
          <div class="roster-item-sub">
            <span>${c.role}</span>
            <span class="roster-race-tag">${c.race}</span>
          </div>
        </div>
      `;
    }).join('');

    listContainer.querySelectorAll('.roster-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        const citizen = citizens.find(c => c.id === id);
        if (citizen) {
          this.selectNPC(citizen);
        }
      });
    });
  }

  selectNPC(citizen) {
    this.activeNPC = citizen;

    this.container.querySelectorAll('.roster-item').forEach(el => {
      el.classList.toggle('selected', el.dataset.id === citizen.id);
    });

    this.refreshActiveMind();
  }

  openWithNPC(npcOrConfig) {
    const id = npcOrConfig.id || npcOrConfig.config?.id || npcOrConfig.char?.id;
    const all = this.getAllCitizens();
    const found = all.find(c => c.id === id);

    this.open(found || npcOrConfig);
  }

  refreshActiveMind(divineWhisper = null) {
    const pane = this.container.querySelector('#mindInspectorPane');
    if (!pane || !this.activeNPC) return;

    const npc = this.activeNPC;
    const sensory = this.perceptionEngine.perceive(npc);
    const brain = npc.brain || (npc.entity && npc.entity.brain) || new NPCBrain(npc.config || npc, this.groqAdapter, BRAIN_TIERS.IMPORTANT);

    try {
      const cachedThought = this.thoughtHistory.get(npc.id) || {
        observation: `Observing the surroundings near ${sensory.spatial.landmark}.`,
        feeling: 'Focused & determined',
        intention: `Fulfill role duties as ${npc.role}.`,
        inner_thought: `The balance of the continent demands vigilance. I shall honor my people.`,
        action: 'WALK_TO',
        action_target: sensory.spatial.landmark,
        engine: 'Cognitive Core'
      };

      pane.innerHTML = `
        <div class="mind-inspector-header">
          <div class="inspector-title-box">
            <span class="inspector-tag">${npc.badge}</span>
            <h2>${npc.name}</h2>
            <div class="inspector-meta-row">
              <span>🏰 ${npc.homeland}</span>
              <span>⏳ Age: <strong>${npc.age}</strong></span>
              <span>🌌 Lifespan: <strong>${npc.lifespan}</strong></span>
            </div>
          </div>
          <div class="inspector-header-actions">
            <button class="btn-focus-cam" id="btnFocusNPC" title="Fly Creator Free-Look camera directly to this character">🕊️ Focus Camera</button>
            <button class="btn-refresh-mind" id="btnRefreshMind" title="Trigger fresh live LLM inner thought cycle">⚡ Trigger Thought</button>
          </div>
        </div>

        <div class="mind-tabs-bar">
          <button class="mind-tab active" data-tab="stream">💭 Cognitive Stream</button>
          <button class="mind-tab" data-tab="sensory">🌐 Sensory Perception</button>
          <button class="mind-tab" data-tab="memory">📜 Memory Buffer</button>
          <button class="mind-tab" data-tab="whisper">✨ Divine Whisper</button>
        </div>

        <!-- 1. STREAM -->
        <div class="mind-tab-content" id="tabStream">
          <div class="stream-bubble active-thought">
            <div class="stream-bubble-header">
              <span class="stream-label">🧠 ACTIVE CONSCIOUSNESS (INNER MONOLOGUE)</span>
              <span class="stream-engine-badge" id="streamEngineBadge">${cachedThought.engine || 'Llama 3.3 70B'}</span>
            </div>
            <p class="stream-text" id="activeThoughtText">"${cachedThought.inner_thought}"</p>
          </div>

          <div class="stream-vitals-row">
            <div class="stream-vital-card">
              <span class="vital-label">👁️ Observation</span>
              <span class="vital-val" id="activeThoughtObs">${cachedThought.observation}</span>
            </div>
            <div class="stream-vital-card">
              <span class="vital-label">🎯 Current Intention</span>
              <span class="vital-val" id="activeThoughtIntent">${cachedThought.intention}</span>
            </div>
            <div class="stream-vital-card">
              <span class="vital-label">⚡ Autonomous Decision</span>
              <span class="vital-val" id="activeThoughtAction">
                <strong class="action-tag">${cachedThought.action}</strong> ➔ ${cachedThought.action_target}
              </span>
            </div>
          </div>
        </div>

        <!-- 2. SENSORY -->
        <div class="mind-tab-content" id="tabSensory" style="display: none;">
          <div class="sensory-grid">
            <div class="sensory-card">
              <strong>📍 World Coordinates</strong>
              <p>X: ${sensory.spatial.x.toFixed(1)}, Y: ${sensory.spatial.y.toFixed(1)}, Z: ${sensory.spatial.z.toFixed(1)}</p>
            </div>
            <div class="sensory-card">
              <strong>🏰 Biome & Landmark</strong>
              <p>${sensory.spatial.biome} (${sensory.spatial.landmark})</p>
            </div>
            <div class="sensory-card">
              <strong>🕒 Temporal Realm Time</strong>
              <p>${sensory.temporal.timeFormatted} (${sensory.temporal.phase})</p>
            </div>
            <div class="sensory-card">
              <strong>🛡️ Settlement Sanctuary</strong>
              <p>${sensory.spatial.isSanctuary ? '✅ Protected Town Ward' : '🌲 Open Wilderness'}</p>
            </div>
          </div>
        </div>

        <!-- 3. MEMORY -->
        <div class="mind-tab-content" id="tabMemory" style="display: none;">
          <div class="memory-stream-box">
            ${brain.memoryStream.length === 0 ? '<p style="color: #64748b; font-style: italic;">No recorded episodic memories yet.</p>' : 
              brain.memoryStream.slice(-8).reverse().map(m => `
                <div class="memory-item ${m.type.toLowerCase()}">
                  <span class="memory-type">${m.type}</span>
                  <span class="memory-desc">${m.description}</span>
                  <span class="memory-score">★ ${m.importance}</span>
                </div>
              `).join('')
            }
          </div>
        </div>

        <!-- 4. WHISPER -->
        <div class="mind-tab-content" id="tabWhisper" style="display: none;">
          <div class="whisper-box">
            <p class="whisper-desc">Whisper a divine decree directly into ${npc.name}'s consciousness. They will internalize your command as inspiration or divine providence.</p>
            <div class="whisper-input-row">
              <input type="text" id="divineWhisperInput" class="whisper-input" placeholder="e.g. Travel to Karak-Drak and negotiate peace with the dwarves..." />
              <button class="btn-send-whisper" id="btnSendWhisper">✨ Whisper Decree</button>
            </div>
          </div>
        </div>
      `;

      // Wire mind tab switching
      const mindTabs = pane.querySelectorAll('.mind-tab');
      mindTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          mindTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const target = tab.dataset.tab;
          pane.querySelector('#tabStream').style.display = target === 'stream' ? 'block' : 'none';
          pane.querySelector('#tabSensory').style.display = target === 'sensory' ? 'block' : 'none';
          pane.querySelector('#tabMemory').style.display = target === 'memory' ? 'block' : 'none';
          pane.querySelector('#tabWhisper').style.display = target === 'whisper' ? 'block' : 'none';
        });
      });

      // Wire Focus Camera button
      const btnFocus = pane.querySelector('#btnFocusNPC');
      if (btnFocus) {
        btnFocus.addEventListener('click', () => {
          if (this.onFocusCharacter) {
            this.onFocusCharacter(npc);
            audioSystem.playChime();
          }
        });
      }

      // Wire Trigger Thought button
      const btnRefresh = pane.querySelector('#btnRefreshMind');
      if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
          this.generateManualThought();
        });
      }

      // Wire Whisper Decree button
      const btnWhisper = pane.querySelector('#btnSendWhisper');
      const whisperInput = pane.querySelector('#divineWhisperInput');
      if (btnWhisper && whisperInput) {
        btnWhisper.addEventListener('click', () => {
          const val = whisperInput.value.trim();
          if (val) {
            brain.recordMemory(`Heard a sacred whisper from the Heavens: "${val}"`, 'DECREE', 10);
            this.spawn3DThoughtBubble(npc, val, true);
            this.refreshActiveMind(val);
          }
        });
      }

    } catch (err) {
      console.error('Critical error in refreshActiveMind:', err);
    }
  }

  generateManualThought() {
    if (!this.activeNPC) return;
    const npc = this.activeNPC;
    const sensory = this.perceptionEngine.perceive(npc);
    const brain = npc.brain || (npc.entity && npc.entity.brain);
    if (!brain) return;

    const engineBadge = this.container.querySelector('#streamEngineBadge');
    if (engineBadge) engineBadge.textContent = '⚡ Generating...';

    brain.think(sensory, null, true).then(freshThought => {
      if (!freshThought || this.activeNPC?.id !== npc.id) return;
      this.thoughtHistory.set(npc.id, freshThought);

      const thoughtText = this.container.querySelector('#activeThoughtText');
      const thoughtObs = this.container.querySelector('#activeThoughtObs');
      const thoughtIntent = this.container.querySelector('#activeThoughtIntent');
      const thoughtAction = this.container.querySelector('#activeThoughtAction');
      const badge = this.container.querySelector('#streamEngineBadge');

      if (thoughtText) thoughtText.textContent = `"${freshThought.inner_thought}"`;
      if (thoughtObs) thoughtObs.textContent = freshThought.observation;
      if (thoughtIntent) thoughtIntent.textContent = freshThought.intention;
      if (thoughtAction) thoughtAction.innerHTML = `<strong class="action-tag">${freshThought.action}</strong> ➔ ${freshThought.action_target}`;
      if (badge) badge.textContent = freshThought.engine || 'Cognitive Core';

      audioSystem.playChime();
    }).catch(err => {
      console.warn('Manual thought error:', err);
    });
  }

  spawn3DThoughtBubble(npc, text, isDivine = false) {
    const entity = npc.entity;
    if (!entity || !entity.group) return;

    if (this.gameApp.combatSystem) {
      const pos = entity.group.position.clone();
      pos.y += (npc.config?.race === 'dwarf' ? 2.5 : 3.2);
      const color = isDivine ? '#fbbf24' : '#38bdf8';
      const prefix = isDivine ? '✨ [Divine Decree] ' : '💭 ';
      this.gameApp.combatSystem.spawnFloatingText(pos, `${prefix}${text.slice(0, 36)}...`, color);
    }
  }
}
