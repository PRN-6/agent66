import { FAST_TRAVEL_POINTS, WORLD_SIZE, HALF_WORLD } from '../config/constants.js';
import { IMPERIAL_ROADS } from '../utils/math.js';

export class Minimap {
  constructor(canvasElement, worldMapContainer, onTeleport) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.worldMapContainer = worldMapContainer;
    this.onTeleport = onTeleport;

    this.isOpenWorldMap = false;
    this.range = 140; // meters shown in radar
    this.initWorldMapModal();
  }

  initWorldMapModal() {
    this.worldMapCanvas = document.createElement('canvas');
    this.worldMapCanvas.width = 600;
    this.worldMapCanvas.height = 600;
    this.worldCtx = this.worldMapCanvas.getContext('2d');

    // Create modal DOM structure
    this.worldMapContainer.innerHTML = `
      <div class="map-modal-backdrop">
        <div class="map-modal-card">
          <div class="map-header">
            <div class="map-title-row">
              <span class="map-badge">OPEN WORLD ATLAS</span>
              <h2>ISLAND MAP & FAST TRAVEL</h2>
            </div>
            <button class="btn-close-map" id="closeMapBtn">✕</button>
          </div>
          <div class="map-body">
            <div class="map-canvas-wrapper" id="worldCanvasWrapper"></div>
            <div class="map-sidebar">
              <h3>Fast Travel Waypoints</h3>
              <div class="travel-list" id="travelList"></div>
            </div>
          </div>
          <div class="map-footer">
            <span>💡 Click any waypoint or click anywhere on the map to fast-travel instantly!</span>
          </div>
        </div>
      </div>
    `;

    const wrapper = this.worldMapContainer.querySelector('#worldCanvasWrapper');
    wrapper.appendChild(this.worldMapCanvas);

    // Populate Fast Travel List
    const list = this.worldMapContainer.querySelector('#travelList');
    FAST_TRAVEL_POINTS.forEach(pt => {
      let icon = '📍';
      if (pt.id === 'oakhaven_village') icon = '🌾';
      else if (pt.id === 'fernbrook_hamlet') icon = '🍎';
      else if (pt.id === 'demon_enclave') icon = '💀';
      else if (pt.id === 'elven_glade') icon = '🌙';
      else if (pt.id === 'dwarf_clanstead') icon = '🛡️';
      else if (pt.id.includes('high_valoria')) icon = '🏛️';
      else if (pt.id.includes('princess')) icon = '👑';
      else if (pt.id.includes('jungle')) icon = '⛺';
      else if (pt.id.includes('citadel') || pt.id.includes('bastion')) icon = '🏰';
      else if (pt.id.includes('demon')) icon = '🔥';
      else if (pt.id.includes('elven')) icon = '🌿';
      else if (pt.id.includes('dwarf') || pt.id.includes('foundry')) icon = '⚒️';
      else if (pt.id.includes('tavern')) icon = '🍺';

      const item = document.createElement('div');
      item.className = 'travel-item';
      item.innerHTML = `
        <div class="item-icon">${icon}</div>
        <div class="item-info">
          <div class="item-name">${pt.name}</div>
          <div class="item-desc">${pt.desc}</div>
        </div>
        <button class="btn-warp" data-id="${pt.id}">Warp</button>
      `;
      item.querySelector('.btn-warp').addEventListener('click', (e) => {
        e.stopPropagation();
        this.teleportTo(pt.x, pt.z);
      });
      item.addEventListener('click', () => {
        this.teleportTo(pt.x, pt.z);
      });
      list.appendChild(item);
    });

    // Close button
    this.worldMapContainer.querySelector('#closeMapBtn').addEventListener('click', () => {
      this.toggleWorldMap(false);
    });

    // Map click to travel anywhere
    this.worldMapCanvas.addEventListener('click', (e) => {
      const rect = this.worldMapCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Convert canvas coords (0 to 600) to world coords (-400 to +400)
      const worldX = ((clickX / this.worldMapCanvas.width) * WORLD_SIZE) - HALF_WORLD;
      const worldZ = ((clickY / this.worldMapCanvas.height) * WORLD_SIZE) - HALF_WORLD;

      this.teleportTo(worldX, worldZ);
    });
  }

  toggleWorldMap(forceState) {
    if (forceState !== undefined) {
      this.isOpenWorldMap = forceState;
    } else {
      this.isOpenWorldMap = !this.isOpenWorldMap;
    }
    this.worldMapContainer.style.display = this.isOpenWorldMap ? 'flex' : 'none';
    if (this.isOpenWorldMap) {
      this.drawFullWorldMap();
    }
  }

  teleportTo(x, z) {
    if (this.onTeleport) {
      this.onTeleport(x, z);
    }
    this.toggleWorldMap(false);
  }

  drawMinimap(playerPos, playerRotation, openHouses) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const scale = w / (this.range * 2);

    ctx.clearRect(0, 0, w, h);

    // Circular radar clipping mask
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 2, 0, Math.PI * 2);
    ctx.clip();

    // Background terrain
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);

    // 4 Territory zones relative to player in radar:
    // 1. Demon Territory (North-West)
    const demonX = cx + (-200 - playerPos.x) * scale;
    const demonZ = cy + (-200 - playerPos.z) * scale;
    ctx.fillStyle = '#3f1d1d';
    ctx.fillRect(demonX - 180 * scale, demonZ - 180 * scale, 360 * scale, 360 * scale);

    // 2. Elven Forest (South-West)
    const elvenX = cx + (-200 - playerPos.x) * scale;
    const elvenZ = cy + (200 - playerPos.z) * scale;
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(elvenX - 180 * scale, elvenZ - 180 * scale, 360 * scale, 360 * scale);

    // 3. Human Kingdom (North-East)
    const humanX = cx + (200 - playerPos.x) * scale;
    const humanZ = cy + (-150 - playerPos.z) * scale;
    ctx.fillStyle = '#334155';
    ctx.fillRect(humanX - 180 * scale, humanZ - 180 * scale, 360 * scale, 360 * scale);

    // 4. Dwarven Industry City (South-East)
    const dwarfX = cx + (200 - playerPos.x) * scale;
    const dwarfZ = cy + (200 - playerPos.z) * scale;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(dwarfX - 180 * scale, dwarfZ - 180 * scale, 360 * scale, 360 * scale);

    // River dividing East and West
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 14 * scale;
    ctx.beginPath();
    for (let z = -400; z <= 400; z += 20) {
      const rx = Math.sin(z * 0.01) * 35;
      const sx = cx + (rx - playerPos.x) * scale;
      const sy = cy + (z - playerPos.z) * scale;
      if (z === -400) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Draw Imperial Road Network in Radar
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 5 * scale;
    ctx.lineCap = 'round';
    IMPERIAL_ROADS.forEach(seg => {
      const sx1 = cx + (seg.x1 - playerPos.x) * scale;
      const sy1 = cy + (seg.z1 - playerPos.z) * scale;
      const sx2 = cx + (seg.x2 - playerPos.x) * scale;
      const sy2 = cy + (seg.z2 - playerPos.z) * scale;
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();
    });

    // Central Crossroads Bridge marker
    const bridgeX = cx + (0 - playerPos.x) * scale;
    const bridgeZ = cy + (10 - playerPos.z) * scale;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(bridgeX - 12 * scale, bridgeZ - 6 * scale, 24 * scale, 12 * scale);

    // Draw Open Houses icons
    if (openHouses) {
      openHouses.forEach(h => {
        const hx = cx + (h.worldPos.x - playerPos.x) * scale;
        const hy = cy + (h.worldPos.z - playerPos.z) * scale;

        // House dot
        ctx.fillStyle = h.isInside ? '#10b981' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(hx, hy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    // Draw Farming Village radar markers
    const oakRadarX = cx + (105 - playerPos.x) * scale;
    const oakRadarZ = cy + (10 - playerPos.z) * scale;
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(oakRadarX, oakRadarZ, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const fernRadarX = cx + (-75 - playerPos.x) * scale;
    const fernRadarZ = cy + (110 - playerPos.z) * scale;
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(fernRadarX, fernRadarZ, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Demon Enclave Radar Dot
    const demonRadarX = cx + (-120 - playerPos.x) * scale;
    const demonRadarZ = cy + (-90 - playerPos.z) * scale;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(demonRadarX, demonRadarZ, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Elven Glade Radar Dot
    const elvenRadarX = cx + (-160 - playerPos.x) * scale;
    const elvenRadarZ = cy + (90 - playerPos.z) * scale;
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(elvenRadarX, elvenRadarZ, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dwarven United Clanstead Radar Dot
    const dwarfRadarX = cx + (105 - playerPos.x) * scale;
    const dwarfRadarZ = cy + (140 - playerPos.z) * scale;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(dwarfRadarX, dwarfRadarZ, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // High Valoria Castle Town Radar Dot
    const valoriaRadarX = cx + (370 - playerPos.x) * scale;
    const valoriaRadarZ = cy + (-250 - playerPos.z) * scale;
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(valoriaRadarX, valoriaRadarZ, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Player arrow in center
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-playerRotation);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 4);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    ctx.restore(); // end clip

    // Radar compass ring
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, cx - 3, 0, Math.PI * 2);
    ctx.stroke();

    // North indicator
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', cx, 14);
  }

  drawFullWorldMap() {
    const ctx = this.worldCtx;
    const w = this.worldMapCanvas.width;
    const h = this.worldMapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Demon Territory (North-West)
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, w / 2, h / 2);

    // 2. Elven Forest (South-West)
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, h / 2, w / 2, h / 2);

    // 3. Human Kingdom (North-East)
    ctx.fillStyle = '#334155';
    ctx.fillRect(w / 2, 0, w / 2, h / 2);

    // 4. Dwarven Industry City (South-East)
    ctx.fillStyle = '#44403c';
    ctx.fillRect(w / 2, h / 2, w / 2, h / 2);

    // Distinct Citadel / Bastion Highlights:
    // Demon Citadel
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.arc(w * 0.22, h * 0.22, 45, 0, Math.PI * 2);
    ctx.fill();

    // Elven Moon Sanctuary
    ctx.fillStyle = '#0f766e';
    ctx.beginPath();
    ctx.arc(w * 0.25, h * 0.75, 45, 0, Math.PI * 2);
    ctx.fill();

    // Human Royal Castle
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(w * 0.74, h * 0.26, 48, 0, Math.PI * 2);
    ctx.fill();

    // High Valoria Castle Town
    ctx.fillStyle = 'rgba(96, 165, 250, 0.45)';
    ctx.beginPath();
    ctx.arc(((370 + HALF_WORLD) / WORLD_SIZE) * w, ((-250 + HALF_WORLD) / WORLD_SIZE) * h, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Dwarven Mountain Bastion & Foundries
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(w * 0.75, h * 0.75, 48, 0, Math.PI * 2);
    ctx.fill();

    // River dividing the realms
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 12;
    ctx.beginPath();
    for (let zw = -HALF_WORLD; zw <= HALF_WORLD; zw += 20) {
      const rw = Math.sin(zw * 0.01) * 35;
      const px = ((rw + HALF_WORLD) / WORLD_SIZE) * w;
      const py = ((zw + HALF_WORLD) / WORLD_SIZE) * h;
      if (zw === -HALF_WORLD) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Center Crossroads Sanctuary Bridge
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(w / 2 - 16, h * 0.51 - 8, 32, 16);

    // Draw Grand Imperial Road Network on Full World Map
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    IMPERIAL_ROADS.forEach(seg => {
      const px1 = ((seg.x1 + HALF_WORLD) / WORLD_SIZE) * w;
      const py1 = ((seg.z1 + HALF_WORLD) / WORLD_SIZE) * h;
      const px2 = ((seg.x2 + HALF_WORLD) / WORLD_SIZE) * w;
      const py2 = ((seg.z2 + HALF_WORLD) / WORLD_SIZE) * h;
      ctx.beginPath();
      ctx.moveTo(px1, py1);
      ctx.lineTo(px2, py2);
      ctx.stroke();
    });

    // Island Coastline Perimeter Indicator
    ctx.strokeStyle = 'rgba(212, 163, 115, 0.45)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, (680 / WORLD_SIZE) * w, 0, Math.PI * 2);
    ctx.stroke();

    // 4 Faction / Territory Labels
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';

    ctx.fillStyle = '#ef4444';
    ctx.fillText('🔥 DEMON REALM', w * 0.25, h * 0.12);
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('(Obsidian Wastes)', w * 0.25, h * 0.15);

    ctx.fillStyle = '#34d399';
    ctx.fillText('🌿 ELVEN FOREST', w * 0.25, h * 0.62);
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('(Sylvaheim Canopy)', w * 0.25, h * 0.65);

    ctx.fillStyle = '#60a5fa';
    ctx.fillText('⚔️ HUMAN KINGDOM', w * 0.75, h * 0.12);
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('(Crown Lands of Valoria)', w * 0.75, h * 0.15);

    ctx.fillStyle = '#fbbf24';
    ctx.fillText('⚒️ DWARVEN INDUSTRY', w * 0.75, h * 0.62);
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('(Karak-Drak Stronghold)', w * 0.75, h * 0.65);

    ctx.fillStyle = '#fef08a';
    ctx.fillText('📍 CROSSROADS BRIDGE', w / 2, h * 0.51 + 22);

    // Fast travel pins
    FAST_TRAVEL_POINTS.forEach(pt => {
      const px = ((pt.x + HALF_WORLD) / WORLD_SIZE) * w;
      const py = ((pt.z + HALF_WORLD) / WORLD_SIZE) * h;

      // Pin circle
      let pinColor = '#f59e0b';
      if (pt.id === 'oakhaven_village') pinColor = '#eab308';
      else if (pt.id === 'fernbrook_hamlet') pinColor = '#22c55e';
      else if (pt.id.includes('demon')) pinColor = '#ef4444';
      else if (pt.id.includes('elven')) pinColor = '#10b981';
      else if (pt.id.includes('dwarf')) pinColor = '#f59e0b';
      else if (pt.id.includes('royal')) pinColor = '#3b82f6';

      ctx.fillStyle = pinColor;
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pin label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(pt.name, px, py - 11);
    });
  }
}

