import * as THREE from 'three';

export class InputManager {
  constructor(domElement, cameraProvider, terrainProvider) {
    this.domElement = domElement;
    this.cameraProvider = cameraProvider;
    this.terrainProvider = terrainProvider;

    this.keys = {};
    this.moveVector = new THREE.Vector2(0, 0);
    this.isSprinting = false;
    this.interactPressed = false;
    this.attackPressed = false;
    this.mapTogglePressed = false;
    this.racesTogglePressed = false;
    this.skillTreeTogglePressed = false;
    this.tamePressed = false;
    this.untamePressed = false;
    this.spellCastSlot = -1;
    this.cameraModeSwitch = null;
    this.isFreeLookActive = false;

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
        this.skillTreeTogglePressed = true;
      }
      if (code === 'KeyG') {
        this.tamePressed = true;
      }
      if (code === 'KeyU') {
        this.untamePressed = true;
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

  initMouseClicks() {
    this.domElement.addEventListener('pointerdown', (e) => {
      // If clicking on UI, ignore
      if (e.target !== this.domElement && e.target.closest('.ui-container')) {
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

      const terrain = this.terrainProvider();
      if (!terrain) return;

      const intersects = this.raycaster.intersectObject(terrain, false);
      if (intersects.length > 0) {
        this.clickTarget = intersects[0].point.clone();
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
}

