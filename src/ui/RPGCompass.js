import * as THREE from 'three';
import { FAST_TRAVEL_POINTS } from '../config/constants.js';

/**
 * Skyrim-Style RPG Top Dynamic Compass Bar
 * 
 * Inspired by alexsylex/CompassNavigationOverhaul and classic open-world RPGs:
 * - Centered horizontal compass tape rotating smoothly with camera yaw
 * - Displays cardinal directions (N, NE, E, SE, S, SW, W, NW) and degree ticks
 * - Renders dynamic 3D landmark icons with distance calculations
 * - Displays active quest markers (❗ Pip's Tasks, 🌿 Lunara's Starlight Trials)
 * - Highlights target in center reticle with an expanding distance badge
 */
export class RPGCompass {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.visible = true;

    this.initDOM();
    this.initLandmarks();
  }

  initDOM() {
    this.container = document.createElement('div');
    this.container.className = 'rpg-compass-container';
    this.container.innerHTML = `
      <div class="compass-frame">
        <div class="compass-marker-center">▼</div>
        <canvas class="compass-canvas" id="compassCanvas" width="480" height="42"></canvas>
        <div class="compass-target-pill" id="compassTargetPill" style="opacity: 0;">
          <span class="target-icon" id="compassTargetIcon">📍</span>
          <span class="target-name" id="compassTargetName">Landmark</span>
          <span class="target-dist" id="compassTargetDist">120m</span>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.canvas = this.container.querySelector('#compassCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.targetPill = this.container.querySelector('#compassTargetPill');
    this.targetIcon = this.container.querySelector('#compassTargetIcon');
    this.targetName = this.container.querySelector('#compassTargetName');
    this.targetDist = this.container.querySelector('#compassTargetDist');
  }

  initLandmarks() {
    this.landmarks = [
      { name: 'Royal Citadel', icon: '👑', x: 380, z: -325, color: '#fbbf24' },
      { name: 'Valoria Castle Town', icon: '⛲', x: 356, z: -248, color: '#60a5fa' },
      { name: 'Dragon’s Rest Tavern', icon: '🍺', x: 205, z: -74, color: '#f59e0b' },
      { name: 'Oakhaven Farmlands', icon: '🌾', x: 105, z: 10, color: '#4ade80' },
      { name: 'Crossroads Bridge', icon: '⚔️', x: 0, z: 10, color: '#a78bfa' },
      { name: 'Moon Spire Sanctuary', icon: '🌙', x: -200, z: 185, color: '#38bdf8' },
      { name: 'Sylvaheim Elven Glade', icon: '🌿', x: -160, z: 78, color: '#34d399' },
      { name: 'Karak-Drak Bastion', icon: '⚒️', x: 200, z: 182, color: '#fb923c' },
      { name: 'Great Blast Furnaces', icon: '⚙️', x: 140, z: 222, color: '#eab308' },
      { name: 'Obsidian Dread Citadel', icon: '🔥', x: -220, z: -145, color: '#f87171' }
    ];
  }

  update(camera, playerPos) {
    if (!this.visible || !camera || !playerPos) return;

    // 1. Calculate camera heading angle (azimuth yaw in radians)
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    // Heading in radians (0 = North, PI/2 = East, PI = South, -PI/2 = West)
    const cameraYaw = Math.atan2(forward.x, forward.z);

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const centerX = w / 2;

    ctx.clearRect(0, 0, w, h);

    // Subtle dark gradient background
    const bgGrad = ctx.createLinearGradient(0, 0, w, 0);
    bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0)');
    bgGrad.addColorStop(0.2, 'rgba(15, 23, 42, 0.75)');
    bgGrad.addColorStop(0.8, 'rgba(15, 23, 42, 0.75)');
    bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Horizontal baseline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, h - 8);
    ctx.lineTo(w - 30, h - 8);
    ctx.stroke();

    // 2. Draw Cardinal & Intermediate Direction Ticks
    // Field of view on compass tape: 180 degrees spread across 480 pixels (~2.66 px per degree)
    const pxPerRad = w / Math.PI; // 180 degrees in radians

    const cardinals = [
      { label: 'N', angle: 0, isMajor: true },
      { label: 'NE', angle: Math.PI * 0.25, isMajor: false },
      { label: 'E', angle: Math.PI * 0.5, isMajor: true },
      { label: 'SE', angle: Math.PI * 0.75, isMajor: false },
      { label: 'S', angle: Math.PI, isMajor: true },
      { label: 'SW', angle: -Math.PI * 0.75, isMajor: false },
      { label: 'W', angle: -Math.PI * 0.5, isMajor: true },
      { label: 'NW', angle: -Math.PI * 0.25, isMajor: false }
    ];

    cardinals.forEach(card => {
      let diff = card.angle - cameraYaw;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      const screenX = centerX + diff * pxPerRad;
      if (screenX >= 20 && screenX <= w - 20) {
        // Tick mark
        ctx.strokeStyle = card.isMajor ? '#facc15' : 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = card.isMajor ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(screenX, h - 8);
        ctx.lineTo(screenX, h - (card.isMajor ? 18 : 12));
        ctx.stroke();

        // Label
        ctx.fillStyle = card.isMajor ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
        ctx.font = card.isMajor ? 'bold 12px sans-serif' : '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(card.label, screenX, h - (card.isMajor ? 22 : 16));
      }
    });

    // 3. Render Landmark Icons & Active Quest Markers
    let closestCenterTarget = null;
    let closestCenterDist = 999;

    // Collect all compass targets
    const allTargets = [...this.landmarks];

    // Add active quest targets if available
    if (this.gameApp.pipTaskSystem && this.gameApp.pipTaskSystem.nearbyQuestObject) {
      allTargets.push({
        name: 'Young Pip’s Task',
        icon: '🎃',
        x: this.gameApp.pipTaskSystem.nearbyQuestObject.position.x,
        z: this.gameApp.pipTaskSystem.nearbyQuestObject.position.z,
        color: '#fbbf24',
        isQuest: true
      });
    }

    allTargets.forEach(lm => {
      const dx = lm.x - playerPos.x;
      const dz = lm.z - playerPos.z;
      const dist = Math.hypot(dx, dz);

      // Angle from player to landmark
      const angleToTarget = Math.atan2(dx, dz);
      let diff = angleToTarget - cameraYaw;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      const screenX = centerX + diff * pxPerRad;

      if (screenX >= 25 && screenX <= w - 25) {
        // Icon rendering
        ctx.font = lm.isQuest ? '16px sans-serif' : '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lm.icon, screenX, 16);

        // Track closest target to center reticle (< 24px)
        const centerDist = Math.abs(screenX - centerX);
        if (centerDist < 24 && centerDist < closestCenterDist) {
          closestCenterDist = centerDist;
          closestCenterTarget = { ...lm, dist: Math.round(dist) };
        }
      }
    });

    // 4. Update Expanding Center Distance Badge
    if (closestCenterTarget) {
      this.targetPill.style.opacity = '1';
      this.targetIcon.textContent = closestCenterTarget.icon;
      this.targetName.textContent = closestCenterTarget.name;
      this.targetDist.textContent = `${closestCenterTarget.dist}m`;
    } else {
      this.targetPill.style.opacity = '0';
    }
  }

  toggle(visible) {
    this.visible = (visible !== undefined) ? visible : !this.visible;
    this.container.style.display = this.visible ? 'block' : 'none';
  }
}

