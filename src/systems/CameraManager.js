import * as THREE from 'three';
import { CAMERA_MODES } from '../config/constants.js';
import { getTerrainHeight } from '../utils/math.js';

export class CameraManager {
  constructor(domElement) {
    this.domElement = domElement;
    this.mode = CAMERA_MODES.ISOMETRIC;
    this.colliders = [];

    // Viewport dimensions
    const aspect = window.innerWidth / window.innerHeight;
    this.aspect = aspect;

    // Zoom level (orthographic frustum size)
    this.orthoSize = 36; // default zoom
    this.minOrthoSize = 14;
    this.maxOrthoSize = 130;

    // Perspective FOV, Orbit & Distance
    this.perspectiveDistance = 22;
    this.desiredDistance = 22;
    this.currentDistance = 22;
    this.perspectiveFov = 50;

    // 3D Perspective Orbit Angles
    this.orbitYaw = 0;          // Horizontal rotation around player
    this.targetOrbitYaw = 0;
    this.orbitPitch = 0.42;     // Vertical elevation angle (~24 deg)
    this.targetOrbitPitch = 0.42;
    this.lastOrbitTime = 0;

    // Setup Orthographic Camera
    this.orthoCamera = new THREE.OrthographicCamera(
      -this.orthoSize * aspect,
      this.orthoSize * aspect,
      this.orthoSize,
      -this.orthoSize,
      1,
      2000
    );

    // Setup Perspective Camera
    this.perspCamera = new THREE.PerspectiveCamera(
      this.perspectiveFov,
      aspect,
      0.5,
      2000
    );

    this.activeCamera = this.orthoCamera;

    // Target tracking positions
    this.targetPos = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);

    // God's Roam / Divine Spectator Target State
    this.spectateTarget = null;
    this.spectateName = '';
    this.isSpectating = false;

    // Creator Free-Look / Spirit Flight Camera State
    this.freeCamPos = new THREE.Vector3(0, 32, 28);
    this.freeCamYaw = 0;       // Horizontal orientation in radians
    this.freeCamPitch = -0.45; // Vertical orientation in radians
    this.freeCamSpeed = 48.0;
    this.freeCamTurboSpeed = 125.0;
    this.isDraggingMouse = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('resize', () => this.handleResize());

    // Mouse drag orientation in Free Look mode & 3D Perspective Orbit
    window.addEventListener('pointerdown', (e) => {
      if (this.mode !== CAMERA_MODES.FREELOOK && this.mode !== CAMERA_MODES.PERSPECTIVE) return;
      if (e.target.closest('.ui-container button, .ui-container input, .modal-backdrop, .modal-card, .races-modal-card, .creator-dashboard-card, .offline-welcome-card, .dialogue-card, .time-weather-popover, .tasks-modal-card')) {
        return;
      }
      this.isDraggingMouse = true;
      this.dragButton = e.button;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    // Prevent default context menu when right-clicking canvas in 3D modes
    window.addEventListener('contextmenu', (e) => {
      if (this.mode === CAMERA_MODES.PERSPECTIVE || this.mode === CAMERA_MODES.FREELOOK) {
        if (!e.target.closest('input, textarea')) {
          e.preventDefault();
        }
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDraggingMouse) return;
      const dx = e.clientX - this.prevMouseX;
      const dy = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      if (this.mode === CAMERA_MODES.FREELOOK) {
        this.freeCamYaw -= dx * 0.0035;
        this.freeCamPitch = THREE.MathUtils.clamp(
          this.freeCamPitch - dy * 0.0035,
          -1.48, // ~85 deg down
          1.48   // ~85 deg up
        );
      } else if (this.mode === CAMERA_MODES.PERSPECTIVE) {
        // Orbit around player in 3D perspective
        this.targetOrbitYaw -= dx * 0.0055;
        this.targetOrbitPitch = THREE.MathUtils.clamp(
          this.targetOrbitPitch + dy * 0.0045,
          0.08, // Low shoulder angle (~4.5 deg)
          1.38  // High overhead angle (~79 deg)
        );
        this.lastOrbitTime = performance.now();
      }
    });

    const stopDrag = () => {
      this.isDraggingMouse = false;
    };
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);

    // Mouse wheel zoom
    window.addEventListener('wheel', (e) => {
      // Don't zoom if cursor is inside a modal or scrollable overlay
      if (e.target.closest('.modal-content, .travel-list, .races-body, .creator-body, .citizen-roster-list, .mind-inspector-pane, .offline-welcome-card, .tasks-modal-card')) return;

      const delta = Math.sign(e.deltaY) * 2.5;
      if (this.mode === CAMERA_MODES.FREELOOK) {
        // In free look, scroll nudges elevation
        this.freeCamPos.y = THREE.MathUtils.clamp(this.freeCamPos.y - delta * 2.0, 3.0, 380.0);
      } else if (this.mode === CAMERA_MODES.PERSPECTIVE) {
        this.desiredDistance = THREE.MathUtils.clamp(
          this.desiredDistance + delta * 1.6,
          6.0,
          68.0
        );
      } else {
        this.orthoSize = THREE.MathUtils.clamp(
          this.orthoSize + delta,
          this.minOrthoSize,
          this.maxOrthoSize
        );
        this.updateOrthoProjection();
      }
    }, { passive: true });
  }

  handleResize() {
    this.aspect = window.innerWidth / window.innerHeight;
    this.updateOrthoProjection();

    this.perspCamera.aspect = this.aspect;
    this.perspCamera.updateProjectionMatrix();
  }

  updateOrthoProjection() {
    this.orthoCamera.left = -this.orthoSize * this.aspect;
    this.orthoCamera.right = this.orthoSize * this.aspect;
    this.orthoCamera.top = this.orthoSize;
    this.orthoCamera.bottom = -this.orthoSize;
    this.orthoCamera.updateProjectionMatrix();
  }

  setMode(mode) {
    if (!CAMERA_MODES[mode]) return;
    const prevMode = this.mode;
    this.mode = mode;

    if (this.mode === CAMERA_MODES.FREELOOK) {
      this.activeCamera = this.perspCamera;
      // Initialize free camera above current focus position if coming from tracked camera
      if (prevMode !== CAMERA_MODES.FREELOOK) {
        this.freeCamPos.set(
          this.currentLookAt.x,
          Math.max(26, this.currentLookAt.y + 24),
          this.currentLookAt.z + 28
        );
        // Look towards target position
        const dx = this.currentLookAt.x - this.freeCamPos.x;
        const dy = this.currentLookAt.y - this.freeCamPos.y;
        const dz = this.currentLookAt.z - this.freeCamPos.z;
        this.freeCamYaw = Math.atan2(-dx, -dz);
        const horizDist = Math.hypot(dx, dz);
        this.freeCamPitch = Math.atan2(dy, horizDist);
      }
    } else if (this.mode === CAMERA_MODES.PERSPECTIVE) {
      this.isDraggingMouse = false;
      this.activeCamera = this.perspCamera;
    } else {
      this.isDraggingMouse = false;
      this.activeCamera = this.orthoCamera;
      this.updateOrthoProjection();
    }
  }

  cycleMode() {
    if (this.mode === CAMERA_MODES.ISOMETRIC) {
      this.setMode(CAMERA_MODES.TOPDOWN);
    } else if (this.mode === CAMERA_MODES.TOPDOWN) {
      this.setMode(CAMERA_MODES.PERSPECTIVE);
    } else if (this.mode === CAMERA_MODES.PERSPECTIVE) {
      this.setMode(CAMERA_MODES.FREELOOK);
    } else {
      this.setMode(CAMERA_MODES.ISOMETRIC);
    }
    return this.mode;
  }

  getCamera() {
    return this.activeCamera;
  }

  setSpectateTarget(target, name = '') {
    this.spectateTarget = target;
    this.spectateName = name;
    this.isSpectating = !!target;

    // If currently in free look flight, switch to perspective follow mode
    if (this.isSpectating && this.mode === CAMERA_MODES.FREELOOK) {
      this.setMode(CAMERA_MODES.PERSPECTIVE);
    }
  }

  setColliders(colliders) {
    this.colliders = colliders || [];
  }

  stopSpectating() {
    this.spectateTarget = null;
    this.spectateName = '';
    this.isSpectating = false;
  }

  getFreeCamCoords() {
    return {
      x: Math.round(this.freeCamPos.x),
      y: Math.round(this.freeCamPos.y),
      z: Math.round(this.freeCamPos.z)
    };
  }

  update(delta, targetWorldPos, inputManager = null) {
    // -------------------------------------------------------------
    // FREE LOOK / CREATOR SPIRIT CAMERA FLIGHT
    // -------------------------------------------------------------
    if (this.mode === CAMERA_MODES.FREELOOK) {
      const cosP = Math.cos(this.freeCamPitch);
      const forward = new THREE.Vector3(
        -Math.sin(this.freeCamYaw) * cosP,
        Math.sin(this.freeCamPitch),
        -Math.cos(this.freeCamYaw) * cosP
      ).normalize();

      const right = new THREE.Vector3(
        Math.cos(this.freeCamYaw),
        0,
        -Math.sin(this.freeCamYaw)
      ).normalize();

      const speed = (inputManager && inputManager.isSprinting) ? this.freeCamTurboSpeed : this.freeCamSpeed;

      if (inputManager && inputManager.keys) {
        const k = inputManager.keys;
        if (k['KeyW'] || k['ArrowUp']) this.freeCamPos.addScaledVector(forward, speed * delta);
        if (k['KeyS'] || k['ArrowDown']) this.freeCamPos.addScaledVector(forward, -speed * delta);
        if (k['KeyD'] || k['ArrowRight']) this.freeCamPos.addScaledVector(right, speed * delta);
        if (k['KeyA'] || k['ArrowLeft']) this.freeCamPos.addScaledVector(right, -speed * delta);
        if (k['KeyE'] || k['Space']) this.freeCamPos.y += speed * delta;
        if (k['KeyQ'] || k['KeyC']) this.freeCamPos.y -= speed * delta;
      }

      // Restrict within world boundaries
      this.freeCamPos.x = THREE.MathUtils.clamp(this.freeCamPos.x, -780, 780);
      this.freeCamPos.z = THREE.MathUtils.clamp(this.freeCamPos.z, -780, 780);

      // Clamp altitude so Spirit Cam never tunnels below the terrain floor
      const minTerrainFloor = getTerrainHeight(this.freeCamPos.x, this.freeCamPos.z) + 1.8;
      this.freeCamPos.y = THREE.MathUtils.clamp(this.freeCamPos.y, minTerrainFloor, 380.0);

      // Prevent camera from ghosting through solid building structures
      if (this.colliders && this.colliders.length > 0) {
        for (let i = 0; i < this.colliders.length; i++) {
          const c = this.colliders[i];
          if (c.type === 'box') {
            if (this.freeCamPos.x >= c.minX - 0.8 && this.freeCamPos.x <= c.maxX + 0.8 &&
                this.freeCamPos.z >= c.minZ - 0.8 && this.freeCamPos.z <= c.maxZ + 0.8) {
              if (this.freeCamPos.y < 16.0) {
                const dx1 = Math.abs(this.freeCamPos.x - c.minX);
                const dx2 = Math.abs(c.maxX - this.freeCamPos.x);
                const dz1 = Math.abs(this.freeCamPos.z - c.minZ);
                const dz2 = Math.abs(c.maxZ - this.freeCamPos.z);
                const minD = Math.min(dx1, dx2, dz1, dz2);
                if (minD === dx1) this.freeCamPos.x = c.minX - 0.85;
                else if (minD === dx2) this.freeCamPos.x = c.maxX + 0.85;
                else if (minD === dz1) this.freeCamPos.z = c.minZ - 0.85;
                else this.freeCamPos.z = c.maxZ + 0.85;
              }
            }
          }
        }
      }

      this.perspCamera.position.copy(this.freeCamPos);
      const lookTarget = this.freeCamPos.clone().add(forward);
      this.perspCamera.lookAt(lookTarget);
      return;
    }

    // Determine tracking target (Spectate Target in God's Roam vs Active Player)
    let effectiveTarget = targetWorldPos;

    if (this.isSpectating && this.spectateTarget) {
      if (this.spectateTarget.isVector3) {
        effectiveTarget = this.spectateTarget;
      } else if (this.spectateTarget.position) {
        effectiveTarget = this.spectateTarget.position;
      } else if (this.spectateTarget.group && this.spectateTarget.group.position) {
        effectiveTarget = this.spectateTarget.group.position;
      } else if (this.spectateTarget.mesh && this.spectateTarget.mesh.position) {
        effectiveTarget = this.spectateTarget.mesh.position;
      }
    }

    if (!effectiveTarget) return;

    // Smooth camera target tracking (swift initial glide when spectating across continent)
    this.targetPos.copy(effectiveTarget);
    const distToTarget = this.currentLookAt.distanceTo(this.targetPos);
    const baseLerp = this.isSpectating ? (distToTarget > 50 ? 9.2 : 6.5) : 7.0;
    const lerpSpeed = Math.min(1.0, delta * baseLerp);
    this.currentLookAt.lerp(this.targetPos, lerpSpeed);

    if (this.mode === CAMERA_MODES.ISOMETRIC) {
      // Classic 2.5D Isometric projection: 45 degree angle on XZ plane, tilted 38 degrees
      const isoDist = 180;
      const isoAngle = Math.PI / 4; // 45 deg
      const isoElevation = Math.PI / 5.2; // ~34.6 deg

      const camX = this.currentLookAt.x + Math.sin(isoAngle) * Math.cos(isoElevation) * isoDist;
      const camY = this.currentLookAt.y + Math.sin(isoElevation) * isoDist;
      const camZ = this.currentLookAt.z + Math.cos(isoAngle) * Math.cos(isoElevation) * isoDist;

      this.orthoCamera.position.set(camX, camY, camZ);
      this.orthoCamera.lookAt(this.currentLookAt);
    } else if (this.mode === CAMERA_MODES.TOPDOWN) {
      // Pure 2D Top-Down Open World Map View
      const topHeight = 220;
      this.orthoCamera.position.set(this.currentLookAt.x, this.currentLookAt.y + topHeight, this.currentLookAt.z + 0.0001);
      this.orthoCamera.lookAt(this.currentLookAt);
    } else {
      // 3D Perspective Orbit Chase Camera with Smooth Anti-Clip Spring-Arm
      this.orbitYaw = THREE.MathUtils.lerp(this.orbitYaw, this.targetOrbitYaw, Math.min(1.0, delta * 12.0));
      this.orbitPitch = THREE.MathUtils.lerp(this.orbitPitch, this.targetOrbitPitch, Math.min(1.0, delta * 12.0));
      this.currentDistance = THREE.MathUtils.lerp(this.currentDistance, this.desiredDistance, Math.min(1.0, delta * 9.0));

      const lookTarget = new THREE.Vector3(this.currentLookAt.x, this.currentLookAt.y + 1.6, this.currentLookAt.z);

      // Spherical coordinate offset based on orbitYaw, orbitPitch, currentDistance
      const cosP = Math.cos(this.orbitPitch);
      const sinP = Math.sin(this.orbitPitch);
      const sinY = Math.sin(this.orbitYaw);
      const cosY = Math.cos(this.orbitYaw);

      const chaseOffset = new THREE.Vector3(
        sinY * cosP * this.currentDistance,
        sinP * this.currentDistance,
        cosY * cosP * this.currentDistance
      );
      let camPos = lookTarget.clone().add(chaseOffset);

      // 1. Terrain floor clearance
      const terrainFloorY = getTerrainHeight(camPos.x, camPos.z) + 1.5;
      if (camPos.y < terrainFloorY) {
        camPos.y = terrainFloorY;
      }

      // 2. Spring-arm collision: check line-of-sight from target to camera position against colliders
      if (this.colliders && this.colliders.length > 0) {
        let maxFraction = 1.0;
        const rayStart = lookTarget;
        const rayDir = camPos.clone().sub(rayStart);
        const rayLen = rayDir.length();
        if (rayLen > 0.001) {
          rayDir.normalize();

          for (let i = 0; i < this.colliders.length; i++) {
            const c = this.colliders[i];
            if (c.type === 'box') {
              const minX = c.minX - 0.45, maxX = c.maxX + 0.45;
              const minZ = c.minZ - 0.45, maxZ = c.maxZ + 0.45;

              if (Math.min(rayStart.x, camPos.x) > maxX || Math.max(rayStart.x, camPos.x) < minX ||
                  Math.min(rayStart.z, camPos.z) > maxZ || Math.max(rayStart.z, camPos.z) < minZ) {
                continue;
              }

              let tmin = (minX - rayStart.x) / (rayDir.x || 0.00001);
              let tmax = (maxX - rayStart.x) / (rayDir.x || 0.00001);
              if (tmin > tmax) { const temp = tmin; tmin = tmax; tmax = temp; }

              let tzmin = (minZ - rayStart.z) / (rayDir.z || 0.00001);
              let tzmax = (maxZ - rayStart.z) / (rayDir.z || 0.00001);
              if (tzmin > tzmax) { const temp = tzmin; tzmin = tzmax; tzmax = temp; }

              if ((tmin < tzmax) && (tzmin < tmax)) {
                const hitT = Math.max(tmin, tzmin);
                if (hitT > 1.2 && hitT < rayLen) {
                  const fraction = Math.max(0.24, (hitT - 0.6) / rayLen);
                  if (fraction < maxFraction) {
                    maxFraction = fraction;
                  }
                }
              }
            }
          }

          if (maxFraction < 1.0) {
            camPos = rayStart.clone().addScaledVector(rayDir, rayLen * maxFraction);
            camPos.y = Math.max(camPos.y, getTerrainHeight(camPos.x, camPos.z) + 1.5);
          }
        }
      }

      this.perspCamera.position.lerp(camPos, Math.min(1.0, delta * 12.0));
      this.perspCamera.lookAt(lookTarget);
    }
  }
}

