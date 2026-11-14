import * as THREE from 'three';
import { clampTargetOutsideColliders } from '../utils/collision.js';

export class InputManager {
  constructor(domElement, cameraProvider, terrainProvider, npcProvider = null) {
    this.domElement = domElement;
    this.cameraProvider = cameraProvider;
    this.terrainProvider = terrainProvider;
    this.npcProvider = npcProvider;
    this.colliderProvider = null;
    this.onNpcClicked = null;

    this.keys = {};
    this.moveVector = new THREE.Vector2(0, 0);
    this.isSprinting = false;
    this.interactPressed = false;
    this.attackPressed = false;
    this.mapTogglePressed = false;
    this.racesTogglePressed = false;
    this.creatorDashboardTogglePressed = false;
    this.skillTreeTogglePressed = false;
    this.tasksTogglePressed = false;
    this.tamePressed = false;
    this.untamePressed = false;
    this.spellCastSlot = -1;
    this.cameraModeSwitch = null;
    this.isFreeLookActive = false;
    this.isSpectatingActive = false;

    // God's Roam spectator keys
    this.roamPrevPressed = false;
    this.roamNextPressed = false;
    this.escapePressed = false;
    this.enterPressed = false;
    this.raidTriggerPressed = false;

    // Click to move target
    this.clickTarget = null; // Vector3 or null
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Virtual Joystick state
    this.joystickActive = false;
    this.joystickVector = new THREE.Vector2(0, 0);

    this.initKeyboard();
    this.initMouseClicks();
    this.initTouchControls();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      const code = e.code;
      this.keys[code] = true;

      if (code === 'ShiftLeft' || code === 'ShiftRight') {
        this.isSprinting = true;
      }
      if (code === 'KeyE') {
        this.interactPressed = true;
      }
      if (code === 'KeyF' || code === 'Space') {
        this.attackPressed = true;
      }
      if (code === 'KeyM') {
        this.mapTogglePressed = true;
      }
      if (code === 'KeyL') {
        this.racesTogglePressed = true;
      }
      if (code === 'KeyK') {
        this.creatorDashboardTogglePressed = true;
        this.skillTreeTogglePressed = true;
      }
      if (code === 'KeyJ') {
        this.tasksTogglePressed = true;
      }
      if (code === 'KeyG') {
        this.tamePressed = true;
      }
      if (code === 'KeyU') {
        this.untamePressed = true;
      }
      if (code === 'KeyP') {
        this.autoMindTogglePressed = true;
      }
      if (code === 'BracketLeft') {
        this.roamPrevPressed = true;
      }
      if (code === 'BracketRight') {
        this.roamNextPressed = true;
      }
      if (code === 'Escape') {
        this.escapePressed = true;
      }
      if (code === 'Enter') {
        this.enterPressed = true;
      }
      if (code === 'KeyB') {
        this.raidTriggerPressed = true;
      }
      if (code === 'KeyQ') this.spellCastSlot = 0;
      if (code === 'KeyR') this.spellCastSlot = 1;
      if (code === 'KeyT') this.spellCastSlot = 2;
      if (code === 'KeyY') this.spellCastSlot = 3;
      if (code === 'Digit1') this.cameraModeSwitch = 0;
      if (code === 'Digit2') this.cameraModeSwitch = 1;
      if (code === 'Digit3') this.cameraModeSwitch = 2;
      if (code === 'Digit4') this.cameraModeSwitch = 3;
      if (code === 'KeyV') this.cameraModeSwitch = 'cycle';
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      this.keys[code] = false;

      if (code === 'ShiftLeft' || code === 'ShiftRight') {
        this.isSprinting = false;
      }
    });
  }

  setNpcProvider(provider) {
    this.npcProvider = provider;
  }

  setColliderProvider(provider) {
    this.colliderProvider = provider;
  }

  setOnNpcClicked(callback) {
    this.onNpcClicked = callback;
  }

  initMouseClicks() {
    this.domElement.addEventListener('pointerdown', (e) => {
      // If clicking on UI or modals, ignore
      if (
        e.target !== this.domElement &&
        (e.target.closest('.ui-container') ||
         e.target.closest('.creator-dashboard-backdrop') ||
         e.target.closest('.dialogue-container') ||
         e.target.closest('.races-modal-backdrop') ||
         e.target.closest('.god-roam-banner'))
      ) {
        return;
      }

      // Check if left click
      if (e.button !== 0) return;

      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const camera = this.cameraProvider();
      if (!camera) return;

      this.raycaster.setFromCamera(this.mouse, camera);

      // 1. High-precision Character & NPC 3D Hit Detection (Ray-to-Cylinder + Mesh)
      if (this.npcProvider) {
        const npcTargets = this.npcProvider();
        if (npcTargets && npcTargets.length > 0) {
          let closestHit = null;
          let minRayDist = Infinity;
          const v0 = new THREE.Vector3();
          const v1 = new THREE.Vector3();
          const ptRay = new THREE.Vector3();
          const ptSeg = new THREE.Vector3();

          // A. Compute exact ray distance to each character's vertical cylinder
          for (let i = 0; i < npcTargets.length; i++) {
            const target = npcTargets[i];
            if (!target) continue;

            let pos = null;
            if (target.group && target.group.position) {
              pos = target.group.position;
            } else if (target.position) {
              pos = target.position;
            } else if (target.entity && target.entity.position) {
              pos = target.entity.position;
            }
            if (!pos) continue;

            const height = target.isDragon ? 7.0 : 2.5;
            v0.set(pos.x, pos.y, pos.z);
            v1.set(pos.x, pos.y + height, pos.z);

            const distSq = this.raycaster.ray.distanceSqToSegment(v0, v1, ptRay, ptSeg);
            const camDist = this.raycaster.ray.origin.distanceTo(ptRay);
            // Dynamic scale: close up is 2.0m, far away in God's Roam or Free Look scales generously up to 6.5m
            const baseR = target.isDragon ? 6.5 : (target.clickRadius || 2.0);
            const clickRadius = Math.max(baseR, Math.min(6.5, camDist * 0.055));

            if (distSq <= clickRadius * clickRadius) {
              // Ensure hit is in front of the camera
              if (camDist < minRayDist) {
                minRayDist = camDist;
                closestHit = target;
              }
            }
          }

          // B. Also test child meshes as backup
          if (!closestHit) {
            const meshes = [];
            const meshToTargetMap = new Map();
            for (let i = 0; i < npcTargets.length; i++) {
              const target = npcTargets[i];
              const grp = target?.group || target?.entity;
              if (grp && grp.traverse) {
                grp.traverse((child) => {
                  if (child.isMesh) {
                    meshes.push(child);
                    meshToTargetMap.set(child, target);
                  }
                });
              }
            }

            if (meshes.length > 0) {
              const hits = this.raycaster.intersectObjects(meshes, false);
              if (hits.length > 0) {
                closestHit = meshToTargetMap.get(hits[0].object);
              }
            }
          }

          if (closestHit && this.onNpcClicked) {
            this.clickTarget = null;
            this.onNpcClicked(closestHit.data || closestHit, closestHit);
            return;
          }
        }
      }

      // If in Free Look flight or God's Roam spectator mode, clicking terrain does NOT move player hero
      if (this.isFreeLookActive || this.isSpectatingActive) {
        this.clickTarget = null;
        return;
      }

      // 2. Normal gameplay click-to-move terrain raycast
      const terrain = this.terrainProvider();
      if (!terrain) return;

      const intersects = this.raycaster.intersectObject(terrain, false);
      if (intersects.length > 0) {
        const pt = intersects[0].point.clone();
        // Clamp destination outside any solid world colliders (fountains, houses, walls)
        if (this.colliderProvider) {
          const colliders = this.colliderProvider();
          if (colliders && colliders.length > 0) {
            clampTargetOutsideColliders(pt, 0.6, colliders);
          }
        }
        this.clickTarget = pt;
      }
    });
  }

  initTouchControls() {
    // Touch virtual joystick handling will hook up to UI elements created in HUD
  }

  setJoystickVector(x, y) {
    this.joystickVector.set(x, y);
    this.joystickActive = (this.joystickVector.lengthSq() > 0.001);
  }

  clearClickTarget() {
    this.clickTarget = null;
  }

  update() {
    // If Free Look camera flight is active, freeze player character movement so flight controls are dedicated
    if (this.isFreeLookActive) {
      this.moveVector.set(0, 0);
      this.clickTarget = null;
      return;
    }

    // Compute movement vector from keys
    let x = 0;
    let y = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) y -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) y += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;

    // If virtual joystick is active, it takes priority or blends
    if (this.joystickActive) {
      x = this.joystickVector.x;
      y = this.joystickVector.y;
    }

    this.moveVector.set(x, y);
    if (this.moveVector.lengthSq() > 1 && !this.joystickActive) {
      this.moveVector.normalize();
    }

    // If keyboard input occurs, cancel any pending click-to-move target
    if (this.moveVector.lengthSq() > 0.01) {
      this.clickTarget = null;
    }
  }

  consumeInteract() {
    const p = this.interactPressed;
    this.interactPressed = false;
    return p;
  }

  consumeAttack() {
    const p = this.attackPressed;
    this.attackPressed = false;
    return p;
  }

  triggerAttack() {
    this.attackPressed = true;
  }

  consumeMapToggle() {
    const p = this.mapTogglePressed;
    this.mapTogglePressed = false;
    return p;
  }

  consumeRacesToggle() {
    const p = this.racesTogglePressed;
    this.racesTogglePressed = false;
    return p;
  }

  consumeTame() {
    const p = this.tamePressed;
    this.tamePressed = false;
    return p;
  }

  consumeUntame() {
    const p = this.untamePressed;
    this.untamePressed = false;
    return p;
  }

  triggerTame() {
    this.tamePressed = true;
  }

  consumeCreatorDashboardToggle() {
    const p = this.creatorDashboardTogglePressed;
    this.creatorDashboardTogglePressed = false;
    return p;
  }

  consumeTasksToggle() {
    const p = this.tasksTogglePressed;
    this.tasksTogglePressed = false;
    return p;
  }

  consumeAutoMindToggle() {
    const p = this.autoMindTogglePressed;
    this.autoMindTogglePressed = false;
    return p;
  }

  consumeSkillTreeToggle() {
    const p = this.skillTreeTogglePressed;
    this.skillTreeTogglePressed = false;
    return p;
  }

  consumeSpellCast() {
    const slot = this.spellCastSlot;
    this.spellCastSlot = -1;
    return slot;
  }

  triggerSpellCast(slot) {
    this.spellCastSlot = slot;
  }

  consumeCameraSwitch() {
    const s = this.cameraModeSwitch;
    this.cameraModeSwitch = null;
    return s;
  }

  consumeRoamPrev() {
    const p = this.roamPrevPressed;
    this.roamPrevPressed = false;
    return p;
  }

  consumeRoamNext() {
    const p = this.roamNextPressed;
    this.roamNextPressed = false;
    return p;
  }

  consumeEscape() {
    const p = this.escapePressed;
    this.escapePressed = false;
    return p;
  }

  consumeEnter() {
    const p = this.enterPressed;
    this.enterPressed = false;
    return p;
  }

  consumeRaidTrigger() {
    const p = this.raidTriggerPressed;
    this.raidTriggerPressed = false;
    return p;
  }
}

