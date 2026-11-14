import * as THREE from 'three';
import { WORLD_SIZE } from '../config/constants.js';

export class Water {
  constructor(scene) {
    this.scene = scene;
    this.uniforms = { uTime: { value: 0 } };
    this.init();
  }

  init() {
    // Water plane slightly below 0.0 elevation
    const size = WORLD_SIZE + 400;
    // 50x50 segments provides crisp, distinct low-poly water facets with 60% fewer vertices
    const geometry = new THREE.PlaneGeometry(size, size, 50, 50);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshLambertMaterial({
      color: 0x1d70b8,
      transparent: true,
      opacity: 0.82,
      flatShading: true,
      depthWrite: false
    });

    // GPU-accelerated vertex wave displacement (zero CPU overhead)
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = this.uniforms.uTime;
      shader.vertexShader = `
        uniform float uTime;
      ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        vec3 transformed = vec3(position);
        float wave = sin(transformed.x * 0.04 + uTime * 1.5) * 0.22 +
                     cos(transformed.z * 0.04 + uTime * 1.2) * 0.22 +
                     sin((transformed.x + transformed.z) * 0.02 + uTime * 2.0) * 0.12;
        transformed.y += wave;
        `
      );
    };

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.y = -0.35;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  update(time) {
    if (this.uniforms && this.uniforms.uTime) {
      this.uniforms.uTime.value = time;
    }
  }
}

