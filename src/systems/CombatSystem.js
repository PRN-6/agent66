import * as THREE from 'three';
import { audioSystem } from './AudioSystem.js';

export class CombatSystem {
  constructor(scene) {
    this.scene = scene;
    this.floatingTexts = [];
    this.levelUpEffects = [];
  }

  // Spawn floating floating RPG damage or status text
  spawnFloatingText(pos, text, color = '#f87171', isCrit = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');

    ctx.font = isCrit ? 'bold 36px sans-serif' : 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = isCrit ? '#facc15' : color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(text, 128, 54);
    ctx.fillText(text, 128, 54);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    const sprite = new THREE.Sprite(mat);

    sprite.position.copy(pos);
    sprite.position.y += 2.6;
    sprite.scale.set(isCrit ? 3.0 : 2.4, isCrit ? 1.1 : 0.9, 1);
    this.scene.add(sprite);

    this.floatingTexts.push({
      sprite: sprite,
      mat: mat,
      life: 0,
      maxLife: 1.2,
      velocity: 1.8 + Math.random() * 0.5
    });
  }

  // Trigger grand Level Up visual effect above character or NPC
  triggerLevelUp(targetGroup, name, newLevel) {
    const pos = targetGroup.position;

    // 1. Floating Banner
    this.spawnFloatingText(pos, `⭐ LEVEL UP! Lv. ${newLevel} ⭐`, '#fbbf24', true);

    // 2. Expanding Golden Aura Ring
    const ringGeom = new THREE.RingGeometry(0.8, 1.4, 24);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.set(pos.x, pos.y + 0.3, pos.z);
    this.scene.add(ring);

    this.levelUpEffects.push({
      mesh: ring,
      mat: ringMat,
      life: 0,
      maxLife: 1.0,
      target: targetGroup
    });

    // 3. Play Triumphant Audio Fanfare
    audioSystem.playDoorChime(true);
  }

  update(delta) {
    // 1. Update floating damage numbers
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const item = this.floatingTexts[i];
      item.life += delta;
      item.sprite.position.y += delta * item.velocity;
      item.mat.opacity = Math.max(0, 1.0 - (item.life / item.maxLife));

      if (item.life >= item.maxLife) {
        this.scene.remove(item.sprite);
        item.mat.dispose();
        this.floatingTexts.splice(i, 1);
      }
    }

    // 2. Update level-up expanding aura rings
    for (let i = this.levelUpEffects.length - 1; i >= 0; i--) {
      const ef = this.levelUpEffects[i];
      ef.life += delta;
      const progress = ef.life / ef.maxLife;

      const scale = 1.0 + progress * 3.5;
      ef.mesh.scale.set(scale, 1, scale);
      ef.mesh.position.y += delta * 2.2;
      ef.mat.opacity = Math.max(0, 1.0 - progress);

      if (ef.life >= ef.maxLife) {
        this.scene.remove(ef.mesh);
        ef.mat.dispose();
        this.levelUpEffects.splice(i, 1);
      }
    }
  }
}

