/**
 * OfflineWelcomeModal.js
 * 
 * Displays the Continental Offline Progression summary when the player
 * returns to the game after closing the tab, browser, or being offline.
 */

import { audioSystem } from '../systems/AudioSystem.js';

export class OfflineWelcomeModal {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.container = null;
    this.setupDOM();
  }

  setupDOM() {
    this.container = document.createElement('div');
    this.container.className = 'offline-welcome-backdrop';
    this.container.id = 'offlineWelcomeModal';
    this.container.style.display = 'none';

    this.container.innerHTML = `
      <div class="offline-welcome-card">
        <div class="offline-card-header">
          <div class="offline-badge-pill">👑 CONTINENTAL IDLE ENGINE</div>
          <h2>Welcome Back, Divine Creator!</h2>
          <p class="offline-subtitle">The living realm of Agent66 continued breathing while you were away.</p>
        </div>

        <div class="offline-stats-bar">
          <div class="stat-box">
            <span class="stat-icon">🕒</span>
            <div class="stat-data">
              <span class="stat-val" id="offTimeAway">0 Minutes</span>
              <span class="stat-lbl">Time Away</span>
            </div>
          </div>

          <div class="stat-box">
            <span class="stat-icon">🌅</span>
            <div class="stat-data">
              <span class="stat-val" id="offCyclesPassed">0 Cycles</span>
              <span class="stat-lbl">Realm Cycles Passed</span>
            </div>
          </div>

          <div class="stat-box">
            <span class="stat-icon">🏰</span>
            <div class="stat-data">
              <span class="stat-val" id="offRealmTime">12:00 PM</span>
              <span class="stat-lbl">Current Realm Time</span>
            </div>
          </div>
        </div>

        <div class="offline-duties-section">
          <div class="section-title">
            <span>📋 CITIZEN DUTIES ACCOMPLISHED WHILE AWAY</span>
          </div>
          <div class="offline-duties-list" id="offDutiesList">
            <!-- Dynamic character achievements -->
          </div>
        </div>

        <div class="offline-spoils-card">
          <div class="spoils-title">🎁 OFFLINE REWARDS GRANTED</div>
          <div class="spoils-grid">
            <div class="spoil-item xp-item">
              <span class="spoil-icon">⭐</span>
              <span class="spoil-val" id="offXpVal">+0 XP</span>
              <span class="spoil-desc">Passive Experience</span>
            </div>
            <div class="spoil-item gold-item">
              <span class="spoil-icon">🪙</span>
              <span class="spoil-val" id="offGoldVal">+0 Gold</span>
              <span class="spoil-desc">Realm Tribute</span>
            </div>
            <div class="spoil-item heal-item">
              <span class="spoil-icon">❤️</span>
              <span class="spoil-val">100% HP</span>
              <span class="spoil-desc">Full Vitality Restored</span>
            </div>
          </div>
        </div>

        <div class="offline-card-actions">
          <button class="btn-claim-offline" id="btnClaimOffline">✨ Claim Spoils & Enter Realm</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    const btnClaim = this.container.querySelector('#btnClaimOffline');
    if (btnClaim) {
      btnClaim.addEventListener('click', () => {
        this.close();
      });
    }
  }

  open(data) {
    if (!this.container) return;

    const { elapsedSeconds, cyclesPassed, timeFormatted, routineSummary, offlineXP, offlineGold } = data;

    // Format human-readable time away
    let timeStr = `${Math.floor(elapsedSeconds)}s`;
    if (elapsedSeconds >= 3600) {
      const hrs = (elapsedSeconds / 3600).toFixed(1);
      timeStr = `${hrs} Hours`;
    } else if (elapsedSeconds >= 60) {
      const mins = Math.floor(elapsedSeconds / 60);
      timeStr = `${mins} Minute${mins > 1 ? 's' : ''}`;
    }

    const offTimeAway = this.container.querySelector('#offTimeAway');
    const offCyclesPassed = this.container.querySelector('#offCyclesPassed');
    const offRealmTime = this.container.querySelector('#offRealmTime');
    const offXpVal = this.container.querySelector('#offXpVal');
    const offGoldVal = this.container.querySelector('#offGoldVal');
    const offDutiesList = this.container.querySelector('#offDutiesList');

    if (offTimeAway) offTimeAway.textContent = timeStr;
    if (offCyclesPassed) offCyclesPassed.textContent = `${cyclesPassed} Solar Cycle${cyclesPassed > 1 ? 's' : ''}`;
    if (offRealmTime) offRealmTime.textContent = timeFormatted;
    if (offXpVal) offXpVal.textContent = `+${offlineXP} XP`;
    if (offGoldVal) offGoldVal.textContent = `+${offlineGold} Gold`;

    // Render character deeds
    if (offDutiesList) {
      if (!routineSummary || routineSummary.length === 0) {
        offDutiesList.innerHTML = `
          <div class="duty-item">
            <span class="duty-icon">⚔️</span>
            <div class="duty-info">
              <strong>Continental Patrols Maintained</strong>
              <span>All 6 characters performed daily duties across the 4 territories.</span>
            </div>
          </div>
        `;
      } else {
        offDutiesList.innerHTML = routineSummary.map(r => `
          <div class="duty-item">
            <span class="duty-badge" style="background: ${r.color}; color: #fff;">${r.badge.split(' ')[0] || '👑'}</span>
            <div class="duty-info">
              <strong>${r.charName}</strong>
              <span>Completed <strong>${r.tasksDone} task${r.tasksDone > 1 ? 's' : ''}</strong>. Currently at <em>${r.lastTask?.locationName || 'their post'}</em> (${r.lastTask?.title || 'active duty'}).</span>
            </div>
          </div>
        `).join('');
      }
    }

    this.container.style.display = 'flex';
    audioSystem.playChime();
  }

  close() {
    if (this.container) {
      this.container.style.display = 'none';
      audioSystem.playDoorChime(true);
    }
  }
}
