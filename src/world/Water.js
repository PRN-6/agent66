import * as THREE from 'three';
import { WORLD_SIZE } from '../config/constants.js';

export class Water {
  constructor(scene) {
    this.scene = scene;
    this.init();
  }

  init() {
    // Water plane slightly below 0.0 elevation
    const size = WORLD_SIZE + 400;
    const geometry = new THREE.PlaneGeometry(size, size, 80, 80);
    geometry.rotateX(-Math.PI / 2);

    this.initialPositions = geometry.attributes.position.clone();

    const material = new THREE.MeshLambertMaterial({
      color: 0x1d70b8,
      transparent: true,
      opacity: 0.82,
      flatShading: true,
      depthWrite: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.y = -0.35;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  update(time) {
    if (!this.mesh) return;
    const pos = this.mesh.geometry.attributes.position;
    const init = this.initialPositions;

    for (let i = 0; i < pos.count; i++) {
      const x = init.getX(i);
      const z = init.getZ(i);

      // Low poly gentle undulating waves
      const wave = Math.sin(x * 0.04 + time * 1.5) * 0.22 +
                   Math.cos(z * 0.04 + time * 1.2) * 0.22 +
                   Math.sin((x + z) * 0.02 + time * 2.0) * 0.12;

      pos.setY(i, wave);
    }
    pos.needsUpdate = true;
    this.mesh.geometry.computeVertexNormals();
  }
}

