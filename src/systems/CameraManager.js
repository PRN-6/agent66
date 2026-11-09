import * as THREE from 'three';
import { CAMERA_MODES } from '../config/constants.js';

export class CameraManager {
  constructor(domElement) {
    this.domElement = domElement;
    this.mode = CAMERA_MODES.ISOMETRIC;

    // Viewport dimensions
    const aspect = window.innerWidth / window.innerHeight;
    this.aspect = aspect;

    // Zoom level (orthographic frustum size)
    this.orthoSize = 36; // default zoom
    this.minOrthoSize = 14;
    this.maxOrthoSize = 130;

    // Perspective FOV & distance
    this.perspectiveDistance = 28;
    this.perspectiveFov = 50;

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

    // Mouse drag orientation in Free Look mode
    window.addEventListener('pointerdown', (e) => {
      if (this.mode !== CAMERA_MODES.FREELOOK) return;
      if (e.target.closest('.ui-container button, .ui-container input, .modal-backdrop, .modal-card, .races-modal-card')) {
        return;
      }
      this.isDraggingMouse = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDraggingMouse || this.mode !== CAMERA_MODES.FREELOOK) return;
      const dx = e.clientX - this.prevMouseX;
      const dy = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      this.freeCamYaw -= dx * 0.0035;
      this.freeCamPitch = THREE.MathUtils.clamp(
        this.freeCamPitch - dy * 0.0035,
        -1.48, // ~85 deg down
        1.48   // ~85 deg up
      );
    });

    const stopDrag = () => {
      this.isDraggingMouse = false;
    };
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);

    // Mouse wheel zoom
    window.addEventListener('wheel', (e) => {
      // Don't zoom if cursor is inside a modal or scrollable overlay
      if (e.target.closest('.modal-content, .travel-list, .races-body')) return;

      const delta = Math.sign(e.deltaY) * 2.5;
      if (this.mode === CAMERA_MODES.FREELOOK) {
        // In free look, scroll nudges elevation
        this.freeCamPos.y = THREE.MathUtils.clamp(this.freeCamPos.y - delta * 2.0, 3.0, 380.0);
      } else if (this.mode === CAMERA_MODES.PERSPECTIVE) {
        this.perspectiveDistance = THREE.MathUtils.clamp(
          this.perspectiveDistance + delta,
          10,
          85
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
      this.freeCamPos.y = THREE.MathUtils.clamp(this.freeCamPos.y, 2.5, 380.0);

      this.perspCamera.position.copy(this.freeCamPos);
      const lookTarget = this.freeCamPos.clone().add(forward);
      this.perspCamera.lookAt(lookTarget);
      return;
    }

    if (!targetWorldPos) return;

    // Smooth camera target tracking
    this.targetPos.copy(targetWorldPos);
    this.currentLookAt.lerp(this.targetPos, Math.min(1.0, delta * 7.0));

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
      // 3D Perspective Chase Camera
      const chaseOffset = new THREE.Vector3(0, 16, 22);
      const camPos = this.currentLookAt.clone().add(chaseOffset);
      this.perspCamera.position.lerp(camPos, Math.min(1.0, delta * 6.0));
      this.perspCamera.lookAt(this.currentLookAt.x, this.currentLookAt.y + 1.5, this.currentLookAt.z);
    }
  }
}

