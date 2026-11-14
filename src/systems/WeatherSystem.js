import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';
import { audioSystem } from './AudioSystem.js';

export const WEATHER_MODES = {
  CLEAR: 'CLEAR',
  RAIN: 'RAIN',
  SNOW: 'SNOW',
  ASH: 'ASH'
};

/**
 * Biome-Adaptive Dynamic Weather & Precipitation System
 * 
 * Inspired by open-source Three.js weather particle architectures:
 * - Rain storm with slanted droplets and procedural Web Audio thunder claps
 * - Mountain snowfall with gentle wind sway and tumbling flakes
 * - Volcanic nether embers & ash rising from boiling magma pools
 * - Ambient celestial sun motes for clear temperate weather
 * - Bounded volume (80m x 80m x 45m) seamlessly tracking player position
 */
export class WeatherSystem {
  constructor(scene, gameApp) {
    this.scene = scene;
    this.gameApp = gameApp;

    this.currentMode = WEATHER_MODES.CLEAR;
    this.isManualOverride = false;
    this.biomeCheckTimer = 0;
    this.thunderTimer = 0;

    this.particleCount = 1200;
    this.boxSize = 80;
    this.boxHeight = 42;

    this.initParticleTextures();
    this.initParticleSystem();
  }

  initParticleTextures() {
    // Generate low-poly soft circle glow texture procedurally via Canvas (zero asset dependencies)
    const makeTexture = (isStreak = false) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = isStreak ? 128 : 64;
      const ctx = canvas.getContext('2d');

      const cx = 32;
      const cy = isStreak ? 64 : 32;
      const r = isStreak ? 48 : 28;

      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.7)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      if (isStreak) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, 10, 48, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, 28, 0, Math.PI * 2);
        ctx.fill();
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      return tex;
    };

    this.dropTexture = makeTexture(true);  // Rain streak
    this.glowTexture = makeTexture(false); // Snow & Embers
  }

  initParticleSystem() {
    this.geom = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    this.phases = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      this.positions[i * 3 + 0] = (Math.random() - 0.5) * this.boxSize;
      this.positions[i * 3 + 1] = Math.random() * this.boxHeight;
      this.positions[i * 3 + 2] = (Math.random() - 0.5) * this.boxSize;

      this.phases[i] = Math.random() * Math.PI * 2;
    }

    this.geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    // Particle material
    this.mat = new THREE.PointsMaterial({
      size: 1.2,
      map: this.glowTexture,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      color: 0xffffff
    });

    this.points = new THREE.Points(this.geom, this.mat);
    this.points.frustumCulled = false;
    this.scene.add(this.points);

    this.setMode(WEATHER_MODES.CLEAR, true);
  }

  setMode(mode, force = false) {
    if (!force && this.currentMode === mode) return;
    this.currentMode = mode;

    switch (mode) {
      case WEATHER_MODES.RAIN:
        this.mat.map = this.dropTexture;
        this.mat.size = 2.4;
        this.mat.color.setHex(0x93c5fd); // Light blue raindrops
        this.targetOpacity = 0.85;
        this.thunderTimer = 8.0 + Math.random() * 12.0;
        break;

      case WEATHER_MODES.SNOW:
        this.mat.map = this.glowTexture;
        this.mat.size = 1.6;
        this.mat.color.setHex(0xffffff); // Crisp white snowflakes
        this.targetOpacity = 0.90;
        break;

      case WEATHER_MODES.ASH:
        this.mat.map = this.glowTexture;
        this.mat.size = 1.8;
        this.mat.color.setHex(0xf97316); // Fiery orange/red nether embers
        this.targetOpacity = 0.80;
        break;

      case WEATHER_MODES.CLEAR:
      default:
        this.mat.map = this.glowTexture;
        this.mat.size = 1.0;
        this.mat.color.setHex(0xfef08a); // Golden sun pollen
        this.targetOpacity = 0.25;
        break;
    }

    if (this.gameApp?.hud) {
      this.gameApp.hud.updateWeatherBadge(this.currentMode);
    }
  }

  triggerManualMode(mode) {
    this.isManualOverride = true;
    this.setMode(mode);

    if (this.gameApp?.combatSystem && this.gameApp?.player) {
      const p = this.gameApp.player.position.clone();
      p.y += 2.5;
      const names = {
        CLEAR: '☀️ Realm Weather: Clear Skies',
        RAIN: '🌧️ Realm Weather: Tempest Rain Storm',
        SNOW: '❄️ Realm Weather: Mountain Snow Flurry',
        ASH: '🔥 Realm Weather: Volcanic Nether Ash'
      };
      this.gameApp.combatSystem.spawnFloatingText(p, names[mode] || mode, '#38bdf8', true);
    }
  }

  update(delta, focusPos) {
    if (!focusPos) return;

    // Smooth material opacity transition
    this.mat.opacity = THREE.MathUtils.lerp(this.mat.opacity, this.targetOpacity, delta * 3.0);

    // Auto-detect biome weather if not overridden by Creator
    if (!this.isManualOverride) {
      this.biomeCheckTimer -= delta;
      if (this.biomeCheckTimer <= 0) {
        this.biomeCheckTimer = 2.0;
        this.evaluateBiomeWeather(focusPos.x, focusPos.z);
      }
    }

    // Centering particle cloud smoothly over focal character
    const px = focusPos.x;
    const pz = focusPos.z;
    const py = getTerrainHeight(px, pz);

    this.points.position.set(px, py + 1.0, pz);

    // Process particle dynamics
    const pos = this.geom.attributes.position.array;
    const time = performance.now() * 0.0015;

    for (let i = 0; i < this.particleCount; i++) {
      const idx = i * 3;
      const phase = this.phases[i];

      if (this.currentMode === WEATHER_MODES.RAIN) {
        // Falling fast with slight wind slant
        pos[idx + 1] -= (28.0 + Math.sin(phase) * 6.0) * delta;
        pos[idx + 0] += 3.5 * delta; // Wind drift east

        // Reset if hitting ground
        if (pos[idx + 1] < -2.0) {
          pos[idx + 1] = this.boxHeight + Math.random() * 5.0;
          pos[idx + 0] = (Math.random() - 0.5) * this.boxSize;
          pos[idx + 2] = (Math.random() - 0.5) * this.boxSize;
        }

      } else if (this.currentMode === WEATHER_MODES.SNOW) {
        // Slow falling with side-to-side harmonic fluttering
        pos[idx + 1] -= (3.8 + Math.sin(phase) * 1.2) * delta;
        pos[idx + 0] += Math.sin(time + phase) * 1.5 * delta;
        pos[idx + 2] += Math.cos(time * 0.8 + phase) * 1.2 * delta;

        if (pos[idx + 1] < -1.0) {
          pos[idx + 1] = this.boxHeight;
          pos[idx + 0] = (Math.random() - 0.5) * this.boxSize;
          pos[idx + 2] = (Math.random() - 0.5) * this.boxSize;
        }

      } else if (this.currentMode === WEATHER_MODES.ASH) {
        // Rising upward from volcanic vents and lava pools
        pos[idx + 1] += (4.2 + Math.cos(phase) * 1.8) * delta;
        pos[idx + 0] += Math.sin(time * 1.2 + phase) * 2.2 * delta;
        pos[idx + 2] += Math.cos(time * 1.1 + phase) * 1.8 * delta;

        if (pos[idx + 1] > this.boxHeight) {
          pos[idx + 1] = 0.5;
          pos[idx + 0] = (Math.random() - 0.5) * this.boxSize;
          pos[idx + 2] = (Math.random() - 0.5) * this.boxSize;
        }

      } else {
        // Gentle ambient sun pollen floating slowly
        pos[idx + 1] -= 0.6 * delta;
        pos[idx + 0] += Math.sin(time * 0.5 + phase) * 0.4 * delta;
        pos[idx + 2] += Math.cos(time * 0.4 + phase) * 0.4 * delta;

        if (pos[idx + 1] < 0.2) {
          pos[idx + 1] = 18.0;
        }
      }
    }

    this.geom.attributes.position.needsUpdate = true;

    // Rain Thunder Audio
    if (this.currentMode === WEATHER_MODES.RAIN) {
      this.thunderTimer -= delta;
      if (this.thunderTimer <= 0) {
        this.thunderTimer = 14.0 + Math.random() * 18.0;
        this.playProceduralThunder();
      }
    }
  }

  evaluateBiomeWeather(x, z) {
    // 1. Dwarven Mountain Stronghold (South-East) -> Snow flurries
    if (x > 60 && z > 120) {
      this.setMode(WEATHER_MODES.SNOW);
      return;
    }

    // 2. Demon Obsidian Wastes (North-West) -> Volcanic Ash
    if (x < -40 && z < -40) {
      this.setMode(WEATHER_MODES.ASH);
      return;
    }

    // 3. Valoria Kingdom & Crossroads -> Alternates Clear / Rain
    const dayNight = this.gameApp?.dayNightCycle;
    const isNight = dayNight && (dayNight.timeOfDay < 0.2 || dayNight.timeOfDay > 0.8);

    if (isNight && Math.sin(performance.now() * 0.0001) > 0.45) {
      this.setMode(WEATHER_MODES.RAIN);
    } else {
      this.setMode(WEATHER_MODES.CLEAR);
    }
  }

  playProceduralThunder() {
    if (!audioSystem || audioSystem.isMuted || !audioSystem.ctx) return;
    audioSystem.ensureContext();
    const ctx = audioSystem.ctx;
    const t = ctx.currentTime;

    try {
      // Create white noise buffer for thunder rumble
      const bufferSize = ctx.sampleRate * 2.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Lowpass filter to create deep distant boom
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, t);
      filter.frequency.exponentialRampToValueAtTime(45, t + 2.2);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioSystem.masterGain);

      noise.start(t);
      noise.stop(t + 2.5);
    } catch (e) {
      // Audio fallback silent
    }
  }
}

