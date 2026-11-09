import { CAMERA_MODES, ROOF_MODES, BIOMES, RACES } from '../config/constants.js';
import { CHARACTERS } from '../config/characters.js';
import { audioSystem } from '../systems/AudioSystem.js';

export class HUD {
  constructor({
    onCameraChange,
    onRoofModeChange,
    onTimeChange,
    onMapToggle,
    onVehicleToggle,
    onJoystickMove,
    onCharacterChange,
    onTalkAction,
    onAttackAction,
    onTameAction,
    onUntameAction
  }) {
    this.onCameraChange = onCameraChange;
    this.onRoofModeChange = onRoofModeChange;
    this.onTimeChange = onTimeChange;
    this.onMapToggle = onMapToggle;
    this.onVehicleToggle = onVehicleToggle;
    this.onJoystickMove = onJoystickMove;
    this.onCharacterChange = onCharacterChange;
    this.onTalkAction = onTalkAction;
    this.onAttackAction = onAttackAction;
    this.onTameAction = onTameAction;
    this.onUntameAction = onUntameAction;

    this.currentCameraMode = CAMERA_MODES.ISOMETRIC;
    this.currentRoofMode = ROOF_MODES.AUTO;

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
          <div class="brand-title">LOW-POLY REALM</div>
          <div class="biome-pill" id="biomePill">
            <span class="biome-dot"></span>
            <span id="biomeName">Valley Crossroads</span>
          </div>
        </div>

        <div class="hud-top-center">
          <div class="time-widget">
            <span class="clock-icon">🕒</span>
            <span id="timeDisplay">11:30 AM</span>
            <div class="time-presets">
              <button class="btn-time" data-time="0.25" title="Sunrise">🌅</button>
              <button class="btn-time" data-time="0.5" title="Noon">☀️</button>
              <button class="btn-time" data-time="0.75" title="Sunset">🌇</button>
              <button class="btn-time" data-time="0.0" title="Midnight">🌙</button>
            </div>
          </div>

          <div class="level-widget" id="levelWidget">
            <span class="level-badge" id="playerLevelBadge">⭐ Lv. 1</span>
            <div class="xp-bar-container">
              <div class="xp-bar-fill" id="xpBarFill" style="width: 0%;"></div>
            </div>
            <span class="xp-text" id="xpText">0/80 XP</span>
          </div>
        </div>

        <div class="hud-top-right">
          <button class="hud-btn" id="btnRaces" title="Races & Lifespans Codex [L]">⏳</button>
          <button class="hud-btn" id="btnSound" title="Toggle Procedural Audio">🔊</button>
          <button class="hud-btn" id="btnHelp" title="Controls Help">❓</button>
        </div>
      </div>

      <!-- Playable Characters Roster Bar (Top Left) -->
      <div class="roster-bar">
        <span class="roster-label">PLAYABLE HEROES:</span>
        <div class="roster-list" id="rosterList"></div>
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
              <span class="key-badge">Left Click</span>
              <span>Click to Walk on ground</span>
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
    // Populate Character Roster
    const rosterList = this.container.querySelector('#rosterList');
    CHARACTERS.forEach(char => {
      const btn = document.createElement('button');
      btn.className = `btn-char ${char.id === 'hero' ? 'active' : ''}`;
      btn.dataset.id = char.id;
      btn.innerHTML = `<span class="char-icon">${char.badge.split(' ')[0]}</span> <span class="char-name">${char.name}</span>`;
      btn.title = `${char.title} - ${char.desc}`;
      btn.addEventListener('click', () => {
        this.setActiveCharacter(char.id);
        if (this.onCharacterChange) {
          this.onCharacterChange(char.id);
        }
      });
      rosterList.appendChild(btn);
    });

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

    // Time presets
    const timeButtons = this.container.querySelectorAll('.btn-time');
    timeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const t = parseFloat(btn.getAttribute('data-time'));
        this.onTimeChange(t);
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

  updateLevel(level, xp, xpToNext) {
    const badge = this.container.querySelector('#playerLevelBadge');
    const fill = this.container.querySelector('#xpBarFill');
    const text = this.container.querySelector('#xpText');

    if (badge) badge.textContent = `⭐ Lv. ${level}`;
    if (text) text.textContent = `${xp}/${xpToNext} XP`;
    if (fill) {
      const pct = Math.min(100, Math.max(0, (xp / xpToNext) * 100));
      fill.style.width = `${pct}%`;
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

  toggleRacesModal(forceState) {
    const modal = this.container.querySelector('#racesModal');
    if (!modal) return;
    const shouldShow = (forceState !== undefined) ? forceState : (modal.style.display === 'none');
    modal.style.display = shouldShow ? 'flex' : 'none';
  }
}
