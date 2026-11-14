/**
 * RealmPersistenceSystem.js
 * 
 * Comprehensive Game State Auto-Save, Restoration, and Offline Progression Engine.
 * 
 * Features:
 * 1. Seamless Page Refresh: Preserves exact coordinates, chosen hero, level, XP,
 *    HP, attack power, gold, tamed companions, day/night time, and daily routines.
 * 2. Offline Living Realm Simulation: When the user is away or offline, simulates
 *    elapsed time, continental routine duties, day/night cycles, and grants offline spoils.
 * 3. Vercel Cloud Sync: Asynchronously syncs state snapshots to Vercel serverless /api/sync
 *    when online while ensuring 100% offline local resilience.
 */

export class RealmPersistenceSystem {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.storageKey = 'agent66_realm_state_v1';
    this.autoSaveInterval = 4.0; // Auto-save every 4 seconds
    this.autoSaveTimer = 0;
    this.isRestored = false;
    this.lastSaveTime = null;

    this.setupListeners();
  }

  setupListeners() {
    // Save on browser refresh, tab close, or window navigation
    window.addEventListener('beforeunload', () => {
      this.save();
    });

    // Save when switching away from the tab or minimizing the browser
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.save();
      }
    });

    // Save on mobile pagehide
    window.addEventListener('pagehide', () => {
      this.save();
    });
  }

  /**
   * Captures a complete snapshot of the game realm and persists to localStorage & server.
   */
  save(showToast = false) {
    if (!this.gameApp || !this.gameApp.player) return;

    try {
      const player = this.gameApp.player;
      const dayNight = this.gameApp.dayNightCycle;
      const routines = this.gameApp.routineSystem;
      const monsters = this.gameApp.monsterManager;
      const camera = this.gameApp.cameraManager;
      const weather = this.gameApp.weatherSystem;

      const snapshot = {
        version: '1.2.0',
        timestamp: Date.now(),
        player: player.exportState(),
        dayNight: dayNight ? dayNight.exportState() : null,
        routines: routines ? routines.exportState() : null,
        companion: monsters ? monsters.exportCompanionState() : null,
        weather: weather ? weather.currentMode : 'clear',
        camera: camera ? {
          mode: camera.mode,
          orthoSize: camera.orthoSize
        } : null,
        quests: {
          pipIndex: localStorage.getItem('agent66_pip_task_index') || '0',
          pipStatus: localStorage.getItem('agent66_pip_task_status') || 'idle',
          elvenIndex: localStorage.getItem('agent66_elven_task_index') || '0',
          elvenStatus: localStorage.getItem('agent66_elven_task_status') || 'idle'
        }
      };

      localStorage.setItem(this.storageKey, JSON.stringify(snapshot));
      this.lastSaveTime = snapshot.timestamp;

      // Asynchronous background sync to Vercel serverless /api/sync if online
      this.syncToServerless(snapshot);

      if (showToast && this.gameApp.combatSystem) {
        const p = player.position.clone();
        p.y += 2.4;
        this.gameApp.combatSystem.spawnFloatingText(p, '💾 Progress Auto-Saved', '#38bdf8');
      }
    } catch (err) {
      console.warn('Realm auto-save error:', err);
    }
  }

  /**
   * Restores full game state from localStorage or displays offline progression summary.
   */
  restore() {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      this.isRestored = true;
      return false; // First time launching, use default start
    }

    try {
      const snapshot = JSON.parse(raw);
      if (!snapshot || !snapshot.player) {
        this.isRestored = true;
        return false;
      }

      const elapsedSeconds = Math.max(0, (Date.now() - (snapshot.timestamp || Date.now())) / 1000);

      // 1. Restore Player Character & Stats
      const player = this.gameApp.player;
      const pData = snapshot.player;

      if (pData.characterId && pData.characterId !== player.characterId) {
        this.gameApp.switchPlayableCharacter(pData.characterId, false);
      }

      player.importState(pData);

      // 2. Restore Day & Night Cycle
      if (snapshot.dayNight && this.gameApp.dayNightCycle) {
        this.gameApp.dayNightCycle.importState(snapshot.dayNight);
      }

      // 3. Restore Character Routines & Tasks
      if (snapshot.routines && this.gameApp.routineSystem) {
        this.gameApp.routineSystem.importState(snapshot.routines);
      }

      // 4. Restore Weather
      if (snapshot.weather && this.gameApp.weatherSystem) {
        this.gameApp.weatherSystem.setMode(snapshot.weather, true);
      }

      // 5. Restore Tamed Companion
      if (snapshot.companion && this.gameApp.monsterManager) {
        this.gameApp.monsterManager.restoreCompanion(snapshot.companion, player.position);
      }

      // 6. Restore Camera mode & settings
      if (snapshot.camera && this.gameApp.cameraManager) {
        if (snapshot.camera.mode !== undefined) {
          this.gameApp.cameraManager.setMode(snapshot.camera.mode);
        }
        if (snapshot.camera.orthoSize) {
          this.gameApp.cameraManager.orthoSize = snapshot.camera.orthoSize;
        }
      }

      // 7. Update HUD UI elements
      if (this.gameApp.hud) {
        this.gameApp.hud.updateLevel(player.level, player.xp, player.xpToNext, player.gold);
        this.gameApp.hud.updateAutoMindButton(player.isAutonomous);
        this.gameApp.hud.setActiveCharacter(player.characterId);
      }

      this.isRestored = true;

      // -------------------------------------------------------------
      // OFFLINE LIVING REALM SIMULATION:
      // If away for more than 15 seconds, simulate the continental passage of time!
      // -------------------------------------------------------------
      if (elapsedSeconds > 15) {
        let timeResult = { cyclesPassed: 1, daysPassed: 0 };
        if (this.gameApp.dayNightCycle) {
          timeResult = this.gameApp.dayNightCycle.simulateOfflineTime(elapsedSeconds);
        }

        let routineSummary = [];
        if (this.gameApp.routineSystem) {
          routineSummary = this.gameApp.routineSystem.simulateOfflineProgress(elapsedSeconds);
        }

        // Calculate passive offline rewards
        const offlineXP = Math.min(500, Math.floor(elapsedSeconds * 0.35));
        const offlineGold = Math.min(220, Math.floor(elapsedSeconds * 0.15));

        if (offlineXP > 0) {
          player.gainXP(offlineXP, (lvl) => {
            if (this.gameApp.combatSystem) {
              this.gameApp.combatSystem.triggerLevelUp(player.group, player.getCharacterConfig()?.name || 'Hero', lvl);
            }
          });
        }
        if (offlineGold > 0) {
          player.addGold(offlineGold);
        }

        if (this.gameApp.hud) {
          this.gameApp.hud.updateLevel(player.level, player.xp, player.xpToNext, player.gold);
        }

        // Fully heal player and companion while resting away
        player.currentHp = player.maxHp;
        const pet = this.gameApp.monsterManager?.getTamedMonster();
        if (pet) {
          pet.currentHp = pet.maxHp;
          if (pet.updateHpBar) pet.updateHpBar(pet.currentHp, pet.maxHp, pet.level, true);
        }

        // Show royal Welcome Back dialog
        if (this.gameApp.offlineWelcomeModal) {
          this.gameApp.offlineWelcomeModal.open({
            elapsedSeconds,
            cyclesPassed: timeResult.cyclesPassed,
            timeFormatted: this.gameApp.dayNightCycle?.getTimeFormatted() || '12:00 PM',
            routineSummary,
            offlineXP,
            offlineGold
          });
        }
      } else {
        // Quick browser refresh (F5): show smooth continuity toast
        if (this.gameApp.combatSystem) {
          setTimeout(() => {
            const p = player.position.clone();
            p.y += 2.4;
            this.gameApp.combatSystem.spawnFloatingText(p, '💾 Realm State Restored (Continuing seamlessly)', '#34d399');
          }, 600);
        }
      }

      return true;
    } catch (err) {
      console.error('Critical error in restoring realm state:', err);
      this.isRestored = true;
      return false;
    }
  }

  /**
   * Heartbeat update called in main animation loop to auto-save periodically.
   */
  update(delta) {
    this.autoSaveTimer += delta;
    if (this.autoSaveTimer >= this.autoSaveInterval) {
      this.autoSaveTimer = 0;
      this.save(false);
    }
  }

  /**
   * Resets world state to a clean slate (New Game).
   */
  resetWorld() {
    if (confirm('Are you sure you want to start a New Game? This will reset your position, stats, and world progress.')) {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem('agent66_pip_task_index');
      localStorage.removeItem('agent66_pip_task_status');
      localStorage.removeItem('agent66_pip_task_progress');
      localStorage.removeItem('agent66_elven_task_index');
      localStorage.removeItem('agent66_elven_task_status');
      localStorage.removeItem('agent66_elven_task_progress');
      window.location.reload();
    }
  }

  /**
   * Asynchronously synchronizes realm state to Vercel serverless function /api/sync.
   */
  async syncToServerless(snapshot) {
    if (typeof window === 'undefined' || !window.fetch) return;
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: snapshot.timestamp,
          heroId: snapshot.player.characterId,
          level: snapshot.player.level,
          gold: snapshot.player.gold,
          summary: `Level ${snapshot.player.level} ${snapshot.player.characterId} at (${snapshot.player.position.x.toFixed(0)}, ${snapshot.player.position.z.toFixed(0)})`
        })
      });
    } catch {
      // Offline or local development; fallback silently to localStorage
    }
  }
}
