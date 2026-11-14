import { CAMERA_MODES, ROOF_MODES, BIOMES, RACES } from '../config/constants.js';
import { CHARACTERS } from '../config/characters.js';
import { audioSystem } from '../systems/AudioSystem.js';

export class HUD {
  constructor({
    onCameraChange,
    onRoofModeChange,
    onTimeChange,
    onWeatherChange,
    onMapToggle,
    onVehicleToggle,
    onJoystickMove,
    onCharacterChange,
    onTalkAction,
    onAttackAction,
    onTameAction,
    onUntameAction,
    onQuestObjectAction,
    onAutoMindToggle,
    onCreatorDashboardToggle,
    onTasksToggle,
    onGodRoamToggle,
    onGodRoamPrev,
    onGodRoamNext,
    onGodRoamPossess,
    onGodRoamMind,
    onGodRoamClose,
    onDragonRaidTrigger,
    onResetRealm,
    onSpellCastAction
  }) {
    this.onCameraChange = onCameraChange;
    this.onRoofModeChange = onRoofModeChange;
    this.onTimeChange = onTimeChange;
    this.onWeatherChange = onWeatherChange;
    this.onSpellCastAction = onSpellCastAction;
    this.onMapToggle = onMapToggle;
    this.onVehicleToggle = onVehicleToggle;
    this.onJoystickMove = onJoystickMove;
    this.onCharacterChange = onCharacterChange;
    this.onTalkAction = onTalkAction;
    this.onAttackAction = onAttackAction;
    this.onTameAction = onTameAction;
    this.onUntameAction = onUntameAction;
    this.onQuestObjectAction = onQuestObjectAction;
    this.onAutoMindToggle = onAutoMindToggle;
    this.onCreatorDashboardToggle = onCreatorDashboardToggle;
    this.onTasksToggle = onTasksToggle;
    this.onGodRoamToggle = onGodRoamToggle;
    this.onGodRoamPrev = onGodRoamPrev;
    this.onGodRoamNext = onGodRoamNext;
    this.onGodRoamPossess = onGodRoamPossess;
    this.onGodRoamMind = onGodRoamMind;
    this.onGodRoamClose = onGodRoamClose;
    this.onDragonRaidTrigger = onDragonRaidTrigger;
    this.onResetRealm = onResetRealm;

    this.currentCameraMode = CAMERA_MODES.ISOMETRIC;
    this.currentRoofMode = ROOF_MODES.AUTO;
    this.currentWeatherMode = 'CLEAR';

    this.initDOM();
    this.setupListeners();
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.className = 'ui-container';
    this.container.innerHTML = `
      <!-- Top Header Bar -->
      <div class="hud-top-bar">
        <div class="hud-brand">
          <div class="brand-crest">🏰</div>
          <div class="brand-title">LOW-POLY REALM</div>
          <div class="biome-pill" id="biomePill">
            <span class="biome-dot"></span>
            <span id="biomeName">Valley Crossroads</span>
          </div>
        </div>

        <div class="hud-top-center">
          <!-- Sleek Time & Weather Dropdown Pill -->
          <div class="time-weather-pill" id="btnTimeWeatherDropdown" title="Click to adjust Time of Day & Realm Weather">
            <span class="clock-icon">🕒</span>
            <span id="timeDisplay">11:30 AM</span>
            <span class="tw-divider">•</span>
            <span class="weather-icon-badge" id="currentWeatherIcon">☀️</span>
            <span class="weather-name-badge" id="currentWeatherName">Clear</span>
            <span class="dropdown-arrow">▾</span>
          </div>

          <!-- Glassmorphic Dropdown Popover for Time & Atmosphere -->
          <div class="time-weather-popover" id="timeWeatherPopover" style="display: none;">
            <div class="popover-section">
              <div class="popover-title">⏳ TIME OF DAY</div>
              <div class="popover-row time-presets">
                <button class="btn-tw-preset btn-time" data-time="0.25">
                  <span class="preset-icon">🌅</span>
                  <span class="preset-label">Dawn</span>
                  <small>06:00</small>
                </button>
                <button class="btn-tw-preset btn-time" data-time="0.5">
                  <span class="preset-icon">☀️</span>
                  <span class="preset-label">Noon</span>
                  <small>12:00</small>
                </button>
                <button class="btn-tw-preset btn-time" data-time="0.75">
                  <span class="preset-icon">🌇</span>
                  <span class="preset-label">Dusk</span>
                  <small>18:00</small>
                </button>
                <button class="btn-tw-preset btn-time" data-time="0.0">
                  <span class="preset-icon">🌙</span>
                  <span class="preset-label">Night</span>
                  <small>00:00</small>
                </button>
              </div>
            </div>
            <div class="popover-section">
              <div class="popover-title">🌧️ REALM ATMOSPHERE & PRECIPITATION</div>
              <div class="popover-row weather-presets">
                <button class="btn-tw-preset btn-weather active" data-weather="CLEAR">
                  <span class="preset-icon">☀️</span>
                  <span class="preset-label">Clear Sky</span>
                </button>
                <button class="btn-tw-preset btn-weather" data-weather="RAIN">
                  <span class="preset-icon">🌧️</span>
                  <span class="preset-label">Tempest Rain</span>
                </button>
                <button class="btn-tw-preset btn-weather" data-weather="SNOW">
                  <span class="preset-icon">❄️</span>
                  <span class="preset-label">Snow Flurry</span>
                </button>
                <button class="btn-tw-preset btn-weather" data-weather="ASH">
                  <span class="preset-icon">🔥</span>
                  <span class="preset-label">Nether Ash</span>
                </button>
              </div>
            </div>
            <div class="popover-section">
              <div class="popover-title">🐲 MYTHICAL WORLD CALAMITY</div>
              <button class="btn-trigger-dragon-raid" id="btnTriggerDragonRaid" title="Summon an ancient mythical dragon to attack a village or crossroads!">
                <span>🐉 Summon Mythical Dragon Raid!</span>
              </button>
            </div>
          </div>

          <!-- Player Level & XP Badge -->
          <div class="level-widget" id="levelWidget">
            <span class="level-badge" id="playerLevelBadge">⭐ Lv. 1</span>
            <div class="xp-bar-container">
              <div class="xp-bar-fill" id="xpBarFill" style="width: 0%;"></div>
            </div>
            <span class="xp-text" id="xpText">0/80 XP</span>
            <div class="gold-badge" id="goldBadge" title="Realm Gold Coins" style="display: inline-flex; align-items: center; gap: 4px; margin-left: 8px; padding: 2px 7px; background: rgba(245, 158, 11, 0.18); border: 1px solid rgba(245, 158, 11, 0.45); border-radius: 9999px; font-weight: 700; color: #fbbf24; font-size: 11px;">
              <span>🪙</span>
              <span id="playerGoldText">100</span>
            </div>
          </div>
        </div>

        <div class="hud-top-right">
          <!-- God's Roam Divine Spectator Focus Button -->
          <button class="hud-btn hud-btn-godroam" id="btnGodRoam" title="👁️ Enter God's Roam Mode (Divine Spectator Focus)">
            <span class="btn-icon">👁️</span>
            <span class="btn-label">God's Roam</span>
          </button>
          <!-- Autonomous AI Mind Toggle Button -->
          <button class="hud-btn hud-btn-automind" id="btnAutoMind" title="🤖 Toggle Autonomous LLM Self-Movement [P]">
            <span class="status-dot"></span>
            <span class="btn-icon">🤖</span>
            <span class="btn-label" id="autoMindText">Auto: ON [P]</span>
          </button>
          <!-- God Mode & Spawner Sanctuary Button -->
          <button class="hud-btn hud-btn-creator god-mode-hud-btn" id="btnCreatorMind" title="👑 God Mode & Item Spawner Sanctuary [K]">
            <span class="btn-icon">👑</span>
            <span class="btn-label">God Mode [K]</span>
          </button>
          <!-- Character Tasks & Daily Agendas Button -->
          <button class="hud-btn hud-btn-tasks" id="btnCharacterTasks" title="📋 Realm Citizen Tasks & Daily Agendas [J]">
            <span class="btn-icon">📋</span>
            <span class="btn-label">Tasks [J]</span>
          </button>
          <!-- Icon Utility Buttons -->
          <button class="hud-btn hud-btn-icon" id="btnRaces" title="Races & Lifespans Codex [L]">⏳</button>
          <button class="hud-btn hud-btn-icon" id="btnSound" title="Toggle Procedural Audio">🔊</button>
          <button class="hud-btn hud-btn-icon" id="btnHelp" title="Controls Help">❓</button>
        </div>
      </div>

      <!-- Playable Characters Roster Bar (Top Left Heraldic Medallions) -->
      <div class="roster-bar">
        <div class="roster-label">
          <span class="roster-label-icon">👑</span>
          <span>HEROES</span>
        </div>
        <div class="roster-list" id="rosterList"></div>
      </div>

      <!-- God's Roam / Divine Spectator Floating Banner (Top Center) -->
      <div class="god-roam-banner" id="godRoamBanner" style="display: none;">
        <div class="god-roam-header">
          <div class="god-roam-eye-tag">
            <span class="eye-pulse">👁️</span>
            <span class="tag-text">GOD'S ROAM • DIVINE SPECTATOR</span>
          </div>
          <div class="god-roam-keys-hint">
            <span class="key-pill">[</span> Prev • Next <span class="key-pill">]</span> • <span class="key-pill">Esc</span> Return to Hero
          </div>
        </div>

        <div class="god-roam-citizen-info">
          <div class="citizen-avatar-medallion" id="roamCitizenAvatar">👑</div>
          <div class="citizen-meta">
            <div class="citizen-name-row">
              <span class="citizen-name" id="roamCitizenName">Hero Aiden</span>
              <span class="citizen-badge-tag" id="roamCitizenBadge">Hero of Valoria</span>
              <span class="citizen-homeland" id="roamCitizenHomeland">📍 Crossroads Nexus</span>
            </div>
            <div class="citizen-status-row">
              <span class="status-indicator-dot"></span>
              <span class="citizen-action-text" id="roamCitizenAction">Autonomous Mind: Patrolling ancient stone bridge</span>
            </div>
          </div>
        </div>

        <div class="god-roam-controls">
          <button class="btn-roam-nav" id="btnRoamPrev" title="Previous Citizen ["><span class="nav-arrow">◀</span> Prev</button>
          <button class="btn-roam-action btn-roam-possess" id="btnRoamPossess" title="Take direct control of this character [Enter]">
            <span>🎮 Possess Body [Enter]</span>
          </button>
          <button class="btn-roam-action btn-roam-mind" id="btnRoamMind" title="Open AI Cognitive Mind Dashboard [K]">
            <span>🧠 Inspect Mind [K]</span>
          </button>
          <button class="btn-roam-nav" id="btnRoamNext" title="Next Citizen ]">Next <span class="nav-arrow">▶</span></button>
          <button class="btn-roam-close" id="btnRoamClose" title="Exit God's Roam and return camera to Hero [Esc]">✕ Return to Hero</button>
        </div>
      </div>

      <!-- Active Tamed Companion Status Card (Strict Single-Pet Invariant) -->
      <div class="companion-hud-card" id="companionHudCard" style="display: none;">
        <div class="companion-hud-avatar" id="companionHudAvatar">🐾</div>
        <div class="companion-hud-details">
          <div class="companion-hud-header">
            <span class="companion-hud-name" id="companionHudName">Companion</span>
            <span class="companion-hud-level" id="companionHudLevel">Lv. 1</span>
            <span class="companion-hud-rule-badge">Limit: 1 Companion</span>
          </div>
          <div class="companion-hud-hp-track">
            <div class="companion-hud-hp-fill" id="companionHudHpFill" style="width: 100%;"></div>
          </div>
          <div class="companion-hud-stats">
            <span id="companionHudHpText">100 / 100 HP</span>
            <span id="companionHudAtkText">⚔️ 20 ATK</span>
          </div>
        </div>
        <button class="btn-companion-dismiss" id="btnDismissCompanion" title="Release Companion back to the wild [U]">💔 Release [U]</button>
      </div>

      <!-- Minimap Radar Container (Top Right) -->
      <div class="minimap-panel">
        <canvas id="minimapCanvas" width="160" height="160"></canvas>
        <button class="btn-expand-map" id="btnOpenWorldMap" title="Open World Map (M)">
          🗺️ World Map [M]
        </button>
      </div>

      <!-- Active Quest / Task Tracker Card (Top Right below Minimap) -->
      <div class="quest-hud-card" id="questHudCard" style="display: none;">
        <div class="quest-hud-header">
          <span class="quest-hud-badge">📜 ACTIVE TASK</span>
          <button class="btn-quest-toggle" id="btnToggleQuestTracker" title="Collapse/Expand Tracker">−</button>
        </div>
        <div class="quest-hud-content" id="questHudContent">
          <div class="quest-hud-title" id="questHudTitle">The Giant Pumpkin Harvest</div>
          <div class="quest-hud-objective" id="questHudObjective">🎯 Pumpkins: 0/3</div>
          <div class="quest-hud-hint" id="questHudHint">📍 Oakhaven Farmlands</div>
          <div class="quest-hud-reward" id="questHudReward">🎁 +60 XP</div>
        </div>
      </div>

      <!-- Camera Mode Switcher -->
      <div class="camera-bar">
        <span class="bar-label">VIEW:</span>
        <button class="btn-cam active" data-mode="${CAMERA_MODES.ISOMETRIC}">2.5D Isometric</button>
        <button class="btn-cam" data-mode="${CAMERA_MODES.TOPDOWN}">2D Top-Down</button>
        <button class="btn-cam" data-mode="${CAMERA_MODES.PERSPECTIVE}">3D Follow</button>
        <button class="btn-cam" data-mode="${CAMERA_MODES.FREELOOK}">🎥 Free Look [4]</button>
      </div>

      <!-- Creator Spirit / Free Look Floating Banner -->
      <div class="freelook-banner" id="freeLookBanner" style="display: none;">
        <div class="freelook-tag">🕊️ CREATOR SPIRIT CAM (FREE LOOK)</div>
        <div class="freelook-sub">[WASD] Fly • [Q / E] Altitude • [Shift] Turbo Speed • [Mouse Drag] Aim • [1 / 2 / 3] Return to Hero</div>
        <div class="freelook-coords" id="freeLookCoords">Continent Coords: X: 0 | Y: 32 | Z: 28</div>
      </div>

      <!-- Roof Cutaway Mode Switcher -->
      <div class="roof-bar">
        <span class="bar-label">ROOFS:</span>
        <button class="btn-roof active" data-roof="${ROOF_MODES.AUTO}">Auto (Inside)</button>
        <button class="btn-roof" data-roof="${ROOF_MODES.CUTAWAY}">Open All Roofs</button>
        <button class="btn-roof" data-roof="${ROOF_MODES.SOLID}">Closed</button>
      </div>

      <!-- RPG Magic Spell Hotbar (Slots Q, R, T, Y) -->
      <div class="magic-spell-hotbar" id="magicSpellHotbar">
        <button class="spell-hotbar-slot" id="spellSlot0" data-slot="0" title="Cast Slot 1: Whirlwind Crescent [Q]">
          <span class="spell-slot-key">Q</span>
          <span class="spell-slot-icon" id="spellIcon0">⚔️</span>
          <span class="spell-slot-cd-overlay" id="spellCd0" style="height: 0%;"></span>
        </button>
        <button class="spell-hotbar-slot" id="spellSlot1" data-slot="1" title="Cast Slot 2: Starlight Moon Orb [R]">
          <span class="spell-slot-key">R</span>
          <span class="spell-slot-icon" id="spellIcon1">✨</span>
          <span class="spell-slot-cd-overlay" id="spellCd1" style="height: 0%;"></span>
        </button>
        <button class="spell-hotbar-slot" id="spellSlot2" data-slot="2" title="Cast Slot 3: Brimstone Fireball [T]">
          <span class="spell-slot-key">T</span>
          <span class="spell-slot-icon" id="spellIcon2">🔥</span>
          <span class="spell-slot-cd-overlay" id="spellCd2" style="height: 0%;"></span>
        </button>
        <button class="spell-hotbar-slot" id="spellSlot3" data-slot="3" title="Cast Slot 4: Pressurized Steam [Y]">
          <span class="spell-slot-key">Y</span>
          <span class="spell-slot-icon" id="spellIcon3">💨</span>
          <span class="spell-slot-cd-overlay" id="spellCd3" style="height: 0%;"></span>
        </button>
      </div>

      <!-- Attack Action Button (Mobile & Desktop) -->
      <div class="attack-prompt" id="attackPrompt">
        <button class="btn-action btn-attack" id="btnAttackAction" title="Unleash 3-Hit Magic Sword Combo & Crescent Blade Waves [F]">
          <span class="btn-action-icon">✨⚔️</span>
          <span>Magic Sword [F]</span>
        </button>
      </div>

      <!-- Tame Monster Action Prompt -->
      <div class="tame-prompt" id="tamePrompt" style="display: none;">
        <button class="btn-action btn-tame" id="btnTameAction">
          <span class="btn-action-icon">🐾</span>
          <span id="tameActionText">Tame Monster [G]</span>
        </button>
      </div>

      <!-- Release Pet Action Prompt -->
      <div class="untame-prompt" id="untamePrompt" style="display: none;">
        <button class="btn-action btn-untame" id="btnUntameAction">
          <span class="btn-action-icon">💔</span>
          <span id="untameActionText">Release Pet [U]</span>
        </button>
      </div>

      <!-- Vehicle / Mount Interaction Prompt -->
      <div class="vehicle-prompt" id="vehiclePrompt" style="display: none;">
        <button class="btn-action" id="btnVehicleAction">
          <span class="btn-action-icon">🐎</span>
          <span id="vehicleActionText">Mount Royal Steed [E]</span>
        </button>
      </div>

      <!-- NPC Talk Interaction Prompt -->
      <div class="talk-prompt" id="talkPrompt" style="display: none;">
        <button class="btn-action btn-talk" id="btnTalkAction">
          <span class="btn-action-icon">💬</span>
          <span id="talkActionText">Talk [E]</span>
        </button>
      </div>

      <!-- Quest Object Interaction Prompt -->
      <div class="quest-object-prompt" id="questObjectPrompt" style="display: none;">
        <button class="btn-action btn-quest-obj" id="btnQuestObjAction">
          <span class="btn-action-icon">✨</span>
          <span id="questObjActionText">Collect Quest Item [E]</span>
        </button>
      </div>

      <!-- Open House Entrance Toast Banner -->
      <div class="house-toast" id="houseToast" style="display: none;">
        <div class="toast-icon">🏡</div>
        <div class="toast-body">
          <div class="toast-title" id="toastTitle">Entered Building</div>
          <div class="toast-desc" id="toastDesc">Interior furnished with cutaway roof</div>
        </div>
      </div>

      <!-- Controls Help Overlay -->
      <div class="help-modal" id="helpModal" style="display: none;">
        <div class="help-card">
          <div class="help-header">
            <h3>🎮 Controls & Characters</h3>
            <button class="btn-close-help" id="btnCloseHelp">✕</button>
          </div>
          <div class="help-grid">
            <div class="help-item">
              <span class="key-badge">👁️ God's Roam</span>
              <span>Divine Spectator Focus mode: Spectate any individual character as they autonomously live! ([ / ] cycle, Enter possess, Esc return)</span>
            </div>
            <div class="help-item">
              <span class="key-badge">[ / ]</span>
              <span>Cycle Prev / Next citizen in God's Roam</span>
            </div>
            <div class="help-item">
              <span class="key-badge">B</span>
              <span>🐉 Summon Mythical Dragon Raid on village / crossroads!</span>
            </div>
            <div class="help-item">
              <span class="key-badge">F / Space</span>
              <span>✨ Magic Sword (3-Hit Combo: Crescent ➔ Cross Arc ➔ 360° Tempest Nova)</span>
            </div>
            <div class="help-item">
              <span class="key-badge">4 / Button</span>
              <span>🕊️ Creator Free Look (Fly across 1600m map: WASD fly, Q/E altitude, Shift turbo, Mouse aim)</span>
            </div>
            <div class="help-item">
              <span class="key-badge">G</span>
              <span>🐾 Tame Monster (Max 1 Loyal Pet!)</span>
            </div>
            <div class="help-item">
              <span class="key-badge">U</span>
              <span>Release Current Tamed Pet</span>
            </div>
            <div class="help-item">
              <span class="key-badge">Shift</span>
              <span>Sprint / Gallop / Turbo Flight</span>
            </div>
            <div class="help-item">
              <span class="key-badge">E</span>
              <span>Talk to Characters / Mount Steed</span>
            </div>
            <div class="help-item">
              <span class="key-badge">K</span>
              <span>🧠 Creator Mind Dashboard (Groq AI Cognitive Stream, Sensory Matrix, Divine Whispers, Click-to-Inspect)</span>
            </div>
            <div class="help-item">
              <span class="key-badge">Left Click</span>
              <span>Click to Walk or Click NPC to Inspect Mind</span>
            </div>
            <div class="help-item">
              <span class="key-badge">M</span>
              <span>Open World Map & Fast Travel</span>
            </div>
            <div class="help-item">
              <span class="key-badge">1 / 2 / 3</span>
              <span>Return to Hero (Iso / 2D / 3D Follow)</span>
            </div>
            <div class="help-item">
              <span class="key-badge">L</span>
              <span>Races & Lifespans Codex</span>
            </div>
            <div class="help-item">
              <span class="key-badge">🏗️ NPC Towns</span>
              <span>NPCs autonomously build houses & expand settlements over time!</span>
            </div>
            <div class="help-item">
              <span class="key-badge">Roster Bar</span>
              <span>Click any of the 6 heroes in top bar to play as them!</span>
            </div>
          </div>
          <div class="help-footer" style="margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 11px; color: #94a3b8;">
              💾 Auto-saves progress continuously. Never resets on page refresh!
            </div>
            <button id="btnResetRealmWorld" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5); color: #fca5a5; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;" title="Wipe local save and start a fresh realm adventure">
              🔄 Reset Realm / New Game
            </button>
          </div>
        </div>
      </div>

      <!-- Races & Lifespans Codex Modal -->
      <div class="races-modal-backdrop" id="racesModal" style="display: none;">
        <div class="races-modal-card">
          <div class="races-header">
            <div class="races-title-box">
              <span class="races-badge">⏳ REALM CHRONICLES • RACIAL TENSIONS & ANTHROPOLOGY</span>
              <h2>The 4 Great Races: Culture, Animosity & Lifespans</h2>
              <p class="races-subtitle">Demons despise everyone • Elves love high nobility • Dwarves master mechanical technology • Humans adapt with versatile grit</p>
            </div>
            <button class="btn-close-races" id="btnCloseRaces">✕</button>
          </div>

          <div class="races-body">
            <div class="races-grid">
              ${Object.values(RACES).map(race => `
                <div class="race-card" style="border-top: 3px solid ${race.color};">
                  <div class="race-card-header">
                    <span class="race-icon">${race.icon}</span>
                    <div class="race-name-group">
                      <h3 style="color: ${race.color};">${race.name}</h3>
                      <span class="race-homeland">📍 ${race.homeland}</span>
                    </div>
                  </div>

                  <div class="race-badges-row">
                    <span class="race-disposition-pill" style="border: 1px solid ${race.color}; color: ${race.accentColor || race.color};">${race.dispositionTag}</span>
                    <span class="race-span-pill">⏳ ${race.lifespan}</span>
                  </div>

                  <div class="race-details">
                    <div class="race-row">
                      <span class="row-label">Racial Trait:</span>
                      <span class="row-value highlight">${race.trait}</span>
                    </div>
                    <div class="race-attitude-box">
                      <p>${race.attitude}</p>
                    </div>

                    <!-- Inter-Race Friction & Rivalry -->
                    <div class="race-rivalry-box">
                      <div class="rivalry-header">⚡ Views on Other Races:</div>
                      ${race.viewsOnOthers ? race.viewsOnOthers.map(v => `
                        <div class="rivalry-item">
                          <strong class="rivalry-target" style="color: ${race.accentColor || race.color};">${v.target} [${v.stance}]:</strong>
                          <span class="rivalry-desc">"${v.desc}"</span>
                        </div>
                      `).join('') : ''}
                    </div>

                    <div class="race-philosophy-box">
                      <em>${race.philosophy}</em>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Lifespan Comparison Scale -->
            <div class="lifespan-scale-box">
              <div class="scale-header">
                <span class="scale-title">📊 Comparative Lifespan Horizon</span>
                <span class="scale-subtitle">Natural lifespan perspective across mortal and immortal beings</span>
              </div>
              <div class="scale-tracks">
                <div class="scale-track-item">
                  <span class="track-label">👑 Humans</span>
                  <div class="track-bar-container">
                    <div class="track-fill human-fill" style="width: 3.5%;">
                      <span class="track-val">~85y</span>
                    </div>
                  </div>
                  <span class="track-span">75–100 Yrs</span>
                </div>
                <div class="scale-track-item">
                  <span class="track-label">🛡️ Dwarves</span>
                  <div class="track-bar-container">
                    <div class="track-fill dwarf-fill" style="width: 17%;">
                      <span class="track-val">~420y</span>
                    </div>
                  </div>
                  <span class="track-span">350–500 Yrs</span>
                </div>
                <div class="scale-track-item">
                  <span class="track-label">🌙 Elves</span>
                  <div class="track-bar-container">
                    <div class="track-fill elf-fill" style="width: 65%;">
                      <span class="track-val">~2,200y</span>
                    </div>
                  </div>
                  <span class="track-span">1,500–3,000+ Yrs</span>
                </div>
                <div class="scale-track-item">
                  <span class="track-label">🔥 Demons</span>
                  <div class="track-bar-container">
                    <div class="track-fill demon-fill" style="width: 100%;">
                      <span class="track-val">Eternal ∞</span>
                    </div>
                  </div>
                  <span class="track-span">Ageless (10,000+ Yrs)</span>
                </div>
              </div>
            </div>
          </div>

          <div class="races-footer">
            <span>Press <span class="key-badge">L</span> or click ✕ to close the Races Codex</span>
          </div>
        </div>
      </div>

      <!-- Virtual Touch Joystick (Mobile & Touch support) -->
      <div class="virtual-joystick-zone" id="joystickZone">
        <div class="joystick-base" id="joystickBase">
          <div class="joystick-knob" id="joystickKnob"></div>
        </div>
      </div>

      <!-- Fullscreen World Map Container -->
      <div id="worldMapContainer" style="display: none;"></div>
    `;

    document.body.appendChild(this.container);
  }

  setupListeners() {
    // Populate Character Roster with Heraldic Medallions
    const rosterList = this.container.querySelector('#rosterList');
    CHARACTERS.forEach(char => {
      const btn = document.createElement('button');
      btn.className = `btn-char ${char.id === 'hero' ? 'active' : ''}`;
      btn.dataset.id = char.id;
      btn.style.setProperty('--hero-accent', char.color || '#3b82f6');

      const icon = (char.badge ? char.badge.split(' ')[0] : '👑');
      btn.innerHTML = `
        <div class="char-medallion-ring">
          <span class="char-icon">${icon}</span>
        </div>
        <div class="char-label-box">
          <span class="char-name">${char.name}</span>
          <span class="char-title-tag">${char.badge.split(' ').slice(1).join(' ') || char.title}</span>
        </div>
      `;
      btn.title = `${char.name} - ${char.title}\n${char.desc}\n• Click to switch playable character\n• Or observe in God's Roam`;

      btn.addEventListener('click', () => {
        this.setActiveCharacter(char.id);
        if (this.onCharacterChange) {
          this.onCharacterChange(char.id);
        }
      });
      rosterList.appendChild(btn);
    });

    // Time & Weather Dropdown Toggle
    const twDropdown = this.container.querySelector('#btnTimeWeatherDropdown');
    const twPopover = this.container.querySelector('#timeWeatherPopover');
    if (twDropdown && twPopover) {
      twDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = twPopover.style.display !== 'none';
        twPopover.style.display = isOpen ? 'none' : 'flex';
        twDropdown.classList.toggle('active', !isOpen);
      });

      // Close popover when clicking anywhere outside
      window.addEventListener('click', (e) => {
        if (!e.target.closest('#btnTimeWeatherDropdown') && !e.target.closest('#timeWeatherPopover')) {
          twPopover.style.display = 'none';
          twDropdown.classList.remove('active');
        }
      });
    }

    // Time presets inside popover
    const timeButtons = this.container.querySelectorAll('.btn-time');
    timeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const t = parseFloat(btn.getAttribute('data-time'));
        this.onTimeChange(t);
        timeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        audioSystem.playChime();
      });
    });

    // Weather presets inside popover
    const weatherButtons = this.container.querySelectorAll('.btn-weather');
    weatherButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wMode = btn.getAttribute('data-weather');
        if (this.onWeatherChange) {
          this.onWeatherChange(wMode);
        }
        this.updateWeatherBadge(wMode);
        audioSystem.playChime();
      });
    });

    // Mythical Dragon Raid Trigger Button
    const raidBtn = this.container.querySelector('#btnTriggerDragonRaid');
    if (raidBtn) {
      raidBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.onDragonRaidTrigger) {
          this.onDragonRaidTrigger();
        }
        const twPopover = this.container.querySelector('#timeWeatherPopover');
        if (twPopover) twPopover.style.display = 'none';
      });
    }

    // God's Roam Top-Right Button
    const btnGodRoam = this.container.querySelector('#btnGodRoam');
    if (btnGodRoam) {
      btnGodRoam.addEventListener('click', () => {
        if (this.onGodRoamToggle) {
          this.onGodRoamToggle();
        }
      });
    }

    // Character Tasks & Daily Agendas Top-Right Button
    const btnTasks = this.container.querySelector('#btnCharacterTasks');
    if (btnTasks) {
      btnTasks.addEventListener('click', () => {
        if (this.onTasksToggle) {
          this.onTasksToggle();
        }
      });
    }

    // God's Roam Banner Controls
    const btnRoamPrev = this.container.querySelector('#btnRoamPrev');
    if (btnRoamPrev) {
      btnRoamPrev.addEventListener('click', () => {
        if (this.onGodRoamPrev) this.onGodRoamPrev();
      });
    }

    const btnRoamNext = this.container.querySelector('#btnRoamNext');
    if (btnRoamNext) {
      btnRoamNext.addEventListener('click', () => {
        if (this.onGodRoamNext) this.onGodRoamNext();
      });
    }

    const btnRoamPossess = this.container.querySelector('#btnRoamPossess');
    if (btnRoamPossess) {
      btnRoamPossess.addEventListener('click', () => {
        if (this.onGodRoamPossess) this.onGodRoamPossess();
      });
    }

    const btnRoamMind = this.container.querySelector('#btnRoamMind');
    if (btnRoamMind) {
      btnRoamMind.addEventListener('click', () => {
        if (this.onGodRoamMind) this.onGodRoamMind();
      });
    }

    const btnRoamClose = this.container.querySelector('#btnRoamClose');
    if (btnRoamClose) {
      btnRoamClose.addEventListener('click', () => {
        if (this.onGodRoamClose) this.onGodRoamClose();
      });
    }

    // Quest object prompt click
    const questObjBtn = this.container.querySelector('#btnQuestObjAction');
    if (questObjBtn) {
      questObjBtn.addEventListener('click', () => {
        if (this.onQuestObjectAction) {
          this.onQuestObjectAction();
        }
      });
    }

    // Quest tracker collapse/expand toggle
    const toggleQuestBtn = this.container.querySelector('#btnToggleQuestTracker');
    if (toggleQuestBtn) {
      toggleQuestBtn.addEventListener('click', () => {
        const content = this.container.querySelector('#questHudContent');
        if (content.style.display === 'none') {
          content.style.display = 'flex';
          toggleQuestBtn.textContent = '−';
        } else {
          content.style.display = 'none';
          toggleQuestBtn.textContent = '+';
        }
      });
    }

    // Talk prompt action click
    const talkBtn = this.container.querySelector('#btnTalkAction');
    talkBtn.addEventListener('click', () => {
      if (this.onTalkAction) {
        this.onTalkAction();
      }
    });

    // Attack prompt action click
    const attackBtn = this.container.querySelector('#btnAttackAction');
    attackBtn.addEventListener('click', () => {
      if (this.onAttackAction) {
        this.onAttackAction();
      }
    });

    // Magic Spell Hotbar Slot Clicks (Slots 0..3)
    for (let slot = 0; slot < 4; slot++) {
      const slotBtn = this.container.querySelector(`#spellSlot${slot}`);
      if (slotBtn) {
        slotBtn.addEventListener('click', () => {
          if (this.onSpellCastAction) {
            this.onSpellCastAction(slot);
          }
        });
      }
    }

    // Tame prompt action click
    const tameBtn = this.container.querySelector('#btnTameAction');
    if (tameBtn) {
      tameBtn.addEventListener('click', () => {
        if (this.onTameAction) {
          this.onTameAction();
        }
      });
    }

    // Untame prompt action click
    const untameBtn = this.container.querySelector('#btnUntameAction');
    if (untameBtn) {
      untameBtn.addEventListener('click', () => {
        if (this.onUntameAction) {
          this.onUntameAction();
        }
      });
    }

    // Dismiss companion button on companion HUD card
    const dismissBtn = this.container.querySelector('#btnDismissCompanion');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        if (this.onUntameAction) {
          this.onUntameAction();
        }
      });
    }

    // Camera buttons
    const camButtons = this.container.querySelectorAll('.btn-cam');
    camButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        camButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-mode');
        this.currentCameraMode = mode;
        this.onCameraChange(mode);
      });
    });

    // Roof buttons
    const roofButtons = this.container.querySelectorAll('.btn-roof');
    roofButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        roofButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const roof = btn.getAttribute('data-roof');
        this.currentRoofMode = roof;
        this.onRoofModeChange(roof);
      });
    });

    // Sound toggle
    const soundBtn = this.container.querySelector('#btnSound');
    soundBtn.addEventListener('click', () => {
      const isMuted = audioSystem.toggleMute();
      soundBtn.textContent = isMuted ? '🔇' : '🔊';
      soundBtn.classList.toggle('muted', isMuted);
    });

    // Help toggle
    const helpBtn = this.container.querySelector('#btnHelp');
    const helpModal = this.container.querySelector('#helpModal');
    const closeHelpBtn = this.container.querySelector('#btnCloseHelp');
    helpBtn.addEventListener('click', () => {
      helpModal.style.display = helpModal.style.display === 'none' ? 'flex' : 'none';
    });
    closeHelpBtn.addEventListener('click', () => {
      helpModal.style.display = 'none';
    });

    const resetWorldBtn = this.container.querySelector('#btnResetRealmWorld');
    if (resetWorldBtn) {
      resetWorldBtn.addEventListener('click', () => {
        if (this.onResetRealm) {
          this.onResetRealm();
        }
      });
    }

    // Autonomous AI Mind Toggle button
    const autoMindBtn = this.container.querySelector('#btnAutoMind');
    if (autoMindBtn) {
      autoMindBtn.addEventListener('click', () => {
        if (this.onAutoMindToggle) {
          this.onAutoMindToggle();
        }
      });
    }

    // Creator Mind Dashboard button
    const creatorMindBtn = this.container.querySelector('#btnCreatorMind');
    if (creatorMindBtn) {
      creatorMindBtn.addEventListener('click', () => {
        if (this.onCreatorDashboardToggle) {
          this.onCreatorDashboardToggle();
        }
      });
    }

    // Races & Lifespans Codex toggle
    const racesBtn = this.container.querySelector('#btnRaces');
    const closeRacesBtn = this.container.querySelector('#btnCloseRaces');
    if (racesBtn) {
      racesBtn.addEventListener('click', () => {
        this.toggleRacesModal();
      });
    }
    if (closeRacesBtn) {
      closeRacesBtn.addEventListener('click', () => {
        this.toggleRacesModal(false);
      });
    }

    // Close modals on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const racesModal = this.container.querySelector('#racesModal');
        if (racesModal && racesModal.style.display !== 'none') {
          this.toggleRacesModal(false);
        }
      }
    });

    // World map button
    const mapBtn = this.container.querySelector('#btnOpenWorldMap');
    mapBtn.addEventListener('click', () => {
      this.onMapToggle();
    });

    // Vehicle Action button
    const vehicleBtn = this.container.querySelector('#btnVehicleAction');
    vehicleBtn.addEventListener('click', () => {
      this.onVehicleToggle();
    });

    // Touch Joystick handling
    this.setupVirtualJoystick();
  }

  setupVirtualJoystick() {
    const zone = this.container.querySelector('#joystickZone');
    const base = this.container.querySelector('#joystickBase');
    const knob = this.container.querySelector('#joystickKnob');

    let touchId = null;
    let baseRect = null;
    const maxRadius = 45;

    const onTouchStart = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touchId === null) {
          touchId = touch.identifier;
          baseRect = base.getBoundingClientRect();
          handleTouch(touch);
          break;
        }
      }
    };

    const handleTouch = (touch) => {
      if (!baseRect) return;
      const centerX = baseRect.left + baseRect.width / 2;
      const centerY = baseRect.top + baseRect.height / 2;

      let dx = touch.clientX - centerX;
      let dy = touch.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }

      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      const normX = dx / maxRadius;
      const normY = dy / maxRadius;
      this.onJoystickMove(normX, normY);
    };

    const onTouchMove = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          handleTouch(touch);
          break;
        }
      }
    };

    const onTouchEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          touchId = null;
          knob.style.transform = `translate(0px, 0px)`;
          this.onJoystickMove(0, 0);
          break;
        }
      }
    };

    zone.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: false });
    window.addEventListener('touchcancel', onTouchEnd, { passive: false });
  }

  setActiveCharacter(charId) {
    const buttons = this.container.querySelectorAll('.btn-char');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.id === charId);
    });
  }

  setTalkPrompt(npcConfig) {
    const prompt = this.container.querySelector('#talkPrompt');
    const text = this.container.querySelector('#talkActionText');

    if (npcConfig) {
      prompt.style.display = 'block';
      text.textContent = `Talk to ${npcConfig.name} (${npcConfig.badge}) [E]`;
    } else {
      prompt.style.display = 'none';
    }
  }

  setCameraModeActive(mode) {
    this.currentCameraMode = mode;
    const buttons = this.container.querySelectorAll('.btn-cam');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });
    this.setFreeLookActive(mode === CAMERA_MODES.FREELOOK);
  }

  setFreeLookActive(active) {
    const banner = this.container.querySelector('#freeLookBanner');
    if (banner) {
      banner.style.display = active ? 'flex' : 'none';
    }
  }

  updateFreeLookCoords(coords) {
    const coordsEl = this.container.querySelector('#freeLookCoords');
    if (coordsEl && coords) {
      coordsEl.textContent = `Continent Coords: X: ${coords.x} | Y: ${coords.y} | Z: ${coords.z}`;
    }
  }

  updateBiome(x, z) {
    const pill = this.container.querySelector('#biomePill');
    const nameEl = this.container.querySelector('#biomeName');

    let biome = BIOMES.CROSSROADS;
    if (Math.abs(x) < 30 && Math.abs(z - 10) < 25) {
      biome = BIOMES.CROSSROADS;
    } else if (x < -20 && z < 40) {
      biome = BIOMES.DEMON_REALM;
    } else if (x < -20 && z >= 40) {
      biome = BIOMES.ELVEN_FOREST;
    } else if (x >= -20 && z >= 40) {
      biome = BIOMES.DWARF_INDUSTRY;
    } else {
      biome = BIOMES.HUMAN_KINGDOM;
    }

    nameEl.textContent = biome.name;
    pill.style.borderColor = biome.color;
  }

  updateTime(timeString) {
    const display = this.container.querySelector('#timeDisplay');
    if (display) display.textContent = timeString;
  }

  updateLevel(level, xp, xpToNext, gold = null) {
    const badge = this.container.querySelector('#playerLevelBadge');
    const fill = this.container.querySelector('#xpBarFill');
    const text = this.container.querySelector('#xpText');
    const goldText = this.container.querySelector('#playerGoldText');

    if (badge) badge.textContent = `⭐ Lv. ${level}`;
    if (text) text.textContent = `${xp}/${xpToNext} XP`;
    if (fill) {
      const pct = Math.min(100, Math.max(0, (xp / xpToNext) * 100));
      fill.style.width = `${pct}%`;
    }
    if (goldText && gold !== null && gold !== undefined) {
      goldText.textContent = `${gold}`;
    }
  }

  setHouseToast(house) {
    const toast = this.container.querySelector('#houseToast');
    const title = this.container.querySelector('#toastTitle');
    const desc = this.container.querySelector('#toastDesc');

    if (house) {
      title.textContent = `🏰 ${house.name}`;
      desc.textContent = house.desc;
      toast.style.display = 'flex';
    } else {
      toast.style.display = 'none';
    }
  }

  setMountPrompt(show, isMounted = false) {
    const prompt = this.container.querySelector('#vehiclePrompt');
    const text = this.container.querySelector('#vehicleActionText');

    if (show) {
      prompt.style.display = 'block';
      text.textContent = isMounted ? 'Dismount Steed [E]' : 'Mount Royal Steed [E]';
    } else {
      prompt.style.display = 'none';
    }
  }

  setTamePrompt(tamableMonster, hasTamedPet, currentPetName = '') {
    const tamePrompt = this.container.querySelector('#tamePrompt');
    const untamePrompt = this.container.querySelector('#untamePrompt');
    const text = this.container.querySelector('#tameActionText');

    if (tamableMonster) {
      tamePrompt.style.display = 'block';
      if (hasTamedPet) {
        text.innerHTML = `🐾 Swap Pet: ${tamableMonster.name} [G] <small style="display:block;font-size:11px;opacity:0.85;">Replaces ${currentPetName || 'current'} (1 Pet Limit)</small>`;
      } else {
        text.innerHTML = `🐾 Tame ${tamableMonster.name} [G] <small style="display:block;font-size:11px;opacity:0.85;">Max 1 loyal companion</small>`;
      }
    } else {
      tamePrompt.style.display = 'none';
    }

    if (hasTamedPet && !tamableMonster) {
      untamePrompt.style.display = 'block';
    } else {
      untamePrompt.style.display = 'none';
    }
  }

  updateCompanionCard(companionData) {
    const card = this.container.querySelector('#companionHudCard');
    if (!card) return;

    if (!companionData) {
      card.style.display = 'none';
      return;
    }

    card.style.display = 'flex';
    const avatar = card.querySelector('#companionHudAvatar');
    const name = card.querySelector('#companionHudName');
    const level = card.querySelector('#companionHudLevel');
    const hpFill = card.querySelector('#companionHudHpFill');
    const hpText = card.querySelector('#companionHudHpText');
    const atkText = card.querySelector('#companionHudAtkText');

    if (avatar) avatar.textContent = companionData.icon || '🐾';
    if (name) name.textContent = companionData.name;
    if (level) level.textContent = `Lv. ${companionData.level}`;
    if (hpText) hpText.textContent = `${companionData.currentHp} / ${companionData.maxHp} HP`;
    if (atkText) atkText.textContent = `⚔️ ${companionData.attack} ATK`;

    if (hpFill) {
      const pct = Math.max(0, Math.min(100, (companionData.currentHp / companionData.maxHp) * 100));
      hpFill.style.width = `${pct}%`;
    }
  }

  setVehiclePrompt(show, isMounted = false) {
    this.setMountPrompt(show, isMounted);
  }

  getMinimapCanvas() {
    return this.container.querySelector('#minimapCanvas');
  }

  getWorldMapContainer() {
    return this.container.querySelector('#worldMapContainer');
  }

  setQuestObjectPrompt(obj) {
    const prompt = this.container.querySelector('#questObjectPrompt');
    const text = this.container.querySelector('#questObjActionText');
    if (!prompt || !text) return;

    if (obj) {
      prompt.style.display = 'block';
      text.textContent = obj.prompt;
    } else {
      prompt.style.display = 'none';
    }
  }

  updatePipQuestTracker(task, status, progress) {
    const card = this.container.querySelector('#questHudCard');
    if (!card) return;

    if (!task || status === 'COMPLETED') {
      card.style.display = 'none';
      return;
    }

    card.style.display = 'flex';
    const titleEl = card.querySelector('#questHudTitle');
    const objEl = card.querySelector('#questHudObjective');
    const hintEl = card.querySelector('#questHudHint');
    const rewardEl = card.querySelector('#questHudReward');

    titleEl.textContent = task.title;
    hintEl.textContent = task.hint;
    rewardEl.textContent = `🎁 +${task.rewardXP} XP`;

    if (status === 'READY_TO_CLAIM') {
      objEl.innerHTML = `<span style="color: #34d399; font-weight: 800;">🎉 Objective Complete! Return to Young Pip!</span>`;
    } else if (status === 'IN_PROGRESS') {
      if (task.type === 'COLLECT') {
        const item = task.title.includes('Sword') ? 'Sword' : 'Golden Pumpkins';
        objEl.textContent = `🎯 ${item}: ${progress}/${task.targetCount}`;
      } else if (task.type === 'EXPLORE') {
        objEl.textContent = `🎯 Scout Crossroads Obelisk: Incomplete`;
      } else if (task.type === 'HUNT') {
        objEl.textContent = `🎯 Defeat Forest Beast: ${progress}/${task.targetCount}`;
      }
    } else {
      objEl.innerHTML = `<span style="color: #fbbf24;">Talk to Young Pip in Oakhaven to accept task [E]</span>`;
    }
  }

  updateElvenQuestTracker(task, status, progress) {
    const card = this.container.querySelector('#questHudCard');
    if (!card) return;

    if (!task || status === 'COMPLETED') {
      card.style.display = 'none';
      return;
    }

    card.style.display = 'flex';
    const badgeEl = card.querySelector('.quest-hud-badge');
    const titleEl = card.querySelector('#questHudTitle');
    const objEl = card.querySelector('#questHudObjective');
    const hintEl = card.querySelector('#questHudHint');
    const rewardEl = card.querySelector('#questHudReward');

    if (badgeEl) badgeEl.textContent = '🌿 STARLIGHT TRIAL';
    titleEl.textContent = task.title;
    hintEl.textContent = task.hint;
    rewardEl.textContent = `🎁 +${task.rewardXP} XP`;

    if (status === 'READY_TO_CLAIM') {
      objEl.innerHTML = `<span style="color: #34d399; font-weight: 800;">✨ Trial Complete! Return to Lunara in Sylvaheim!</span>`;
    } else if (status === 'IN_PROGRESS') {
      if (task.type === 'COLLECT') {
        objEl.textContent = `🎯 Starlight Lotuses: ${progress}/${task.targetCount}`;
      } else if (task.type === 'INTERACT') {
        objEl.textContent = `🎯 Commune with Ancient Jade Font: Incomplete`;
      } else if (task.type === 'EXPLORE') {
        objEl.textContent = `🎯 Reach Moon Spire Sanctuary: Incomplete`;
      } else if (task.type === 'HUNT') {
        objEl.textContent = `🎯 Defeat Nether Monster: ${progress}/${task.targetCount}`;
      }
    } else {
      objEl.innerHTML = `<span style="color: #38bdf8;">Speak with Alchemist Lunara in Sylvaheim Glade [E]</span>`;
    }
  }

  updateWeatherBadge(mode) {
    this.currentWeatherMode = mode;
    const btns = this.container.querySelectorAll('.btn-weather');
    btns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-weather') === mode);
    });

    const iconEl = this.container.querySelector('#currentWeatherIcon');
    const nameEl = this.container.querySelector('#currentWeatherName');
    const weatherMeta = {
      CLEAR: { icon: '☀️', name: 'Clear' },
      RAIN: { icon: '🌧️', name: 'Rain' },
      SNOW: { icon: '❄️', name: 'Snow' },
      ASH: { icon: '🔥', name: 'Nether Ash' }
    };

    const meta = weatherMeta[mode] || weatherMeta.CLEAR;
    if (iconEl) iconEl.textContent = meta.icon;
    if (nameEl) nameEl.textContent = meta.name;
  }

  showGodRoamBanner(citizen) {
    const banner = this.container.querySelector('#godRoamBanner');
    const roamBtn = this.container.querySelector('#btnGodRoam');
    if (roamBtn) roamBtn.classList.add('active');

    if (!banner || !citizen) return;
    banner.style.display = 'flex';

    const avatarEl = banner.querySelector('#roamCitizenAvatar');
    const nameEl = banner.querySelector('#roamCitizenName');
    const badgeEl = banner.querySelector('#roamCitizenBadge');
    const homelandEl = banner.querySelector('#roamCitizenHomeland');
    const actionEl = banner.querySelector('#roamCitizenAction');
    const possessBtn = banner.querySelector('#btnRoamPossess');

    const icon = citizen.icon || (citizen.badge ? citizen.badge.split(' ')[0] : '👑');
    if (avatarEl) avatarEl.textContent = icon;
    if (nameEl) nameEl.textContent = citizen.name;
    if (badgeEl) badgeEl.textContent = citizen.title || citizen.badge || 'Citizen of the Realm';
    if (homelandEl) homelandEl.textContent = citizen.homeland ? `📍 ${citizen.homeland}` : '📍 Low-Poly Continent';

    const actionText = citizen.action || citizen.currentAction || 'Living autonomously in the realm';
    if (actionEl) actionEl.textContent = actionText;

    if (possessBtn) {
      if (citizen.isPlayable !== false) {
        possessBtn.style.display = 'inline-flex';
        possessBtn.innerHTML = `<span>🎮 Possess Body [Enter]</span>`;
      } else {
        possessBtn.style.display = 'none';
      }
    }
  }

  updateGodRoamStatus(actionText) {
    const actionEl = this.container.querySelector('#roamCitizenAction');
    if (actionEl && actionText) {
      actionEl.textContent = actionText;
    }
  }

  hideGodRoamBanner() {
    const banner = this.container.querySelector('#godRoamBanner');
    if (banner) banner.style.display = 'none';
    const roamBtn = this.container.querySelector('#btnGodRoam');
    if (roamBtn) roamBtn.classList.remove('active');
  }

  setGodRoamActive(active) {
    const roamBtn = this.container.querySelector('#btnGodRoam');
    if (roamBtn) roamBtn.classList.toggle('active', active);
    if (!active) {
      this.hideGodRoamBanner();
    }
  }

  updateAutoMindButton(isAutonomous) {
    const btn = this.container.querySelector('#btnAutoMind');
    const text = this.container.querySelector('#autoMindText');
    if (!btn || !text) return;
    if (isAutonomous) {
      btn.classList.add('active-auto');
      text.textContent = 'Auto: ON [P]';
      btn.title = '🤖 Autonomous LLM Self-Movement is ACTIVE. Press [P] to regain manual control.';
    } else {
      btn.classList.remove('active-auto');
      text.textContent = 'Auto Mind [P]';
      btn.title = '🤖 Toggle Autonomous LLM Self-Movement [P]';
    }
  }

  showAutonomousThoughtToast(charName, thought) {
    let toast = this.container.querySelector('#autoThoughtToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'autoThoughtToast';
      toast.className = 'auto-thought-toast';
      this.container.appendChild(toast);
    }
    const text = typeof thought === 'string' ? thought : (thought?.speech || thought?.inner_thought || thought?.intention || '');
    toast.innerHTML = `<span class="thought-badge">🧠 AUTO MIND: ${charName}</span><span class="thought-text">"${text}"</span>`;
    toast.classList.add('visible');
    clearTimeout(this._thoughtToastTimer);
    this._thoughtToastTimer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 4500);
  }

  toggleRacesModal(forceState) {
    const modal = this.container.querySelector('#racesModal');
    if (!modal) return;
    const shouldShow = (forceState !== undefined) ? forceState : (modal.style.display === 'none');
    modal.style.display = shouldShow ? 'flex' : 'none';
  }

  updateSkillHotbar(equippedSlots) {
    if (!equippedSlots) return;
    const iconMap = {
      whirlwind_slash: '⚔️',
      shadow_blink: '⚡',
      heavenly_judgment: '👑',
      starlight_orb: '✨',
      celestial_ward: '🛡️',
      supernova_beam: '🌟',
      brimstone_fireball: '🔥',
      magma_fissure: '🌋',
      nether_cataclysm: '💥',
      steam_blast: '💨',
      molten_bomb: '💣',
      titan_quake: '⚙️'
    };

    for (let i = 0; i < 4; i++) {
      const skillId = equippedSlots[i];
      const iconEl = this.container.querySelector(`#spellIcon${i}`);
      if (iconEl) {
        iconEl.textContent = iconMap[skillId] || '✨';
      }
    }
  }

  updateSkillCooldowns(cooldowns) {
    if (!cooldowns) return;
    const cdMap = {
      whirlwind_slash: 2.5,
      starlight_orb: 3.0,
      brimstone_fireball: 3.2,
      steam_blast: 2.8,
      shadow_blink: 5.5,
      celestial_ward: 7.0,
      magma_fissure: 6.5,
      molten_bomb: 6.0,
      supernova_beam: 13.0,
      nether_cataclysm: 14.0,
      titan_quake: 12.0,
      heavenly_judgment: 13.0
    };

    const slots = [
      document.querySelector('#spellSlot0'),
      document.querySelector('#spellSlot1'),
      document.querySelector('#spellSlot2'),
      document.querySelector('#spellSlot3')
    ];

    // Read skillSystem equipped slots from global if available
    const equipped = window.__skillSystem ? window.__skillSystem.equippedSlots : ['whirlwind_slash', 'starlight_orb', 'brimstone_fireball', 'steam_blast'];

    for (let i = 0; i < 4; i++) {
      const skillId = equipped[i];
      const remaining = cooldowns[skillId] || 0;
      const total = cdMap[skillId] || 3.0;
      const overlay = this.container.querySelector(`#spellCd${i}`);
      const slotBtn = slots[i];

      if (overlay) {
        if (remaining > 0.05) {
          const pct = Math.min(100, Math.max(0, (remaining / total) * 100));
          overlay.style.height = `${pct}%`;
          if (slotBtn) slotBtn.classList.add('on-cooldown');
        } else {
          overlay.style.height = '0%';
          if (slotBtn) slotBtn.classList.remove('on-cooldown');
        }
      }
    }
  }
}
