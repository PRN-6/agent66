import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';
import { audioSystem } from '../systems/AudioSystem.js';
import { resolveCircleCollision } from '../utils/collision.js';

export class Vehicle {
  constructor(scene, dayNightCycle, startPos = new THREE.Vector3(8, 0.5, 16)) {
    this.scene = scene;
    this.dayNightCycle = dayNightCycle;
    this.position = startPos.clone();
    this.rotation = 0;
    this.radius = 1.3; // Steed collision radius

    // Riding physics
    this.speed = 0;
    this.maxSpeed = 34.0;
    this.maxReverse = -8.0;
    this.acceleration = 22.0;
    this.deceleration = 16.0;
    this.turnSpeed = 2.6;

    this.isOccupied = false;
    this.colliders = [];
    this.gallopCycle = 0;

    this.initModel();
  }

  setColliders(colliders) {
    this.colliders = colliders;
    resolveCircleCollision(this.position, this.radius, this.colliders, 3);
  }

  initModel() {
    this.group = new THREE.Group();
    this.group.position.copy(this.position);

    // Medieval Warhorse Materials
    const coatMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true }); // Chestnut brown
    const maneMat = new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true }); // Black mane/tail
    const saddleMat = new THREE.MeshLambertMaterial({ color: 0x991b1b, flatShading: true });// Crimson royal saddle
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true });  // Golden stirrups & bridle
    const hoofMat = new THREE.MeshLambertMaterial({ color: 0x27272a, flatShading: true });

    // Horse Body / Torso
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 2.8), coatMat);
    body.position.y = 1.5;
    body.castShadow = true;
    body.receiveShadow = true;
    this.group.add(body);

    // Horse Neck (angled forward and up)
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 1.0), coatMat);
    neck.position.set(0, 2.3, 1.2);
    neck.rotation.x = -0.45;
    neck.castShadow = true;
    this.group.add(neck);

    // Horse Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.8, 1.4), coatMat);
    head.position.set(0, 2.8, 1.8);
    head.castShadow = true;
    this.group.add(head);

    // Pointed Horse Ears
    [-0.25, 0.25].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 4), coatMat);
      ear.position.set(ex, 3.35, 1.5);
      this.group.add(ear);
    });

    // Dark Mane along neck
    const mane = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.5, 0.5), maneMat);
    mane.position.set(0, 2.6, 0.9);
    mane.rotation.x = -0.45;
    this.group.add(mane);

    // Royal Crimson Saddle & Gold Stirrups
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.35, 1.4), saddleMat);
    saddle.position.set(0, 2.15, -0.1);
    this.group.add(saddle);

    const saddleBlanket = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.6, 1.6), goldMat);
    saddleBlanket.position.set(0, 1.95, -0.1);
    this.group.add(saddleBlanket);

    // Flowing Tail
    this.tail = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.4, 5), maneMat);
    this.tail.position.set(0, 1.8, -1.6);
    this.tail.rotation.x = 0.5;
    this.group.add(this.tail);

    // 4 Horse Legs for Galloping Animation
    this.legs = [];
    const legCoords = [
      [-0.55, 0.65, 1.0, 'FL'],  // Front Left
      [0.55, 0.65, 1.0, 'FR'],   // Front Right
      [-0.55, 0.65, -1.0, 'BL'], // Back Left
      [0.55, 0.65, -1.0, 'BR']   // Back Right
    ];

    legCoords.forEach(([lx, ly, lz, tag]) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(lx, ly + 0.6, lz);

      const upperLeg = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 0.38), coatMat);
      upperLeg.position.y = -0.5;
      upperLeg.castShadow = true;
      legGroup.add(upperLeg);

      const hoof = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.25, 0.42), hoofMat);
      hoof.position.y = -1.1;
      legGroup.add(hoof);

      this.group.add(legGroup);
      this.legs.push({ group: legGroup, tag: tag });
    });

    // Hanging Lantern on Saddle for night riding
    const lantern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
    lantern.position.set(0.8, 1.8, 0.8);
    this.group.add(lantern);

    const saddleLight = new THREE.PointLight(0xfef08a, 0.0, 18);
    saddleLight.position.set(0.8, 1.7, 0.9);
    saddleLight.userData.baseIntensity = 1.3;
    this.group.add(saddleLight);
    if (this.dayNightCycle) this.dayNightCycle.registerNightLight(saddleLight);

    // Ground blob shadow
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.2, 8), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.05;
    this.group.add(shadow);

    this.scene.add(this.group);
  }

  enter() {
    this.isOccupied = true;
    audioSystem.playDoorChime(true);
  }

  exit() {
    this.isOccupied = false;
    this.speed = 0;
    audioSystem.updateEngine(false, 0);
  }

  update(delta, inputManager) {
    if (!this.isOccupied) {
      const groundY = getTerrainHeight(this.position.x, this.position.z);
      this.position.y = groundY;
      this.group.position.copy(this.position);
      return;
    }

    const move = inputManager.moveVector;
    const throttle = -move.y; // 1 = forward gallop, -1 = reverse
    const steer = move.x;

    if (throttle > 0.1) {
      this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration * delta);
    } else if (throttle < -0.1) {
      this.speed = Math.max(this.maxReverse, this.speed - this.acceleration * 0.8 * delta);
    } else {
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - this.deceleration * delta);
      } else if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + this.deceleration * delta);
      }
    }

    if (Math.abs(this.speed) > 0.1) {
      const dir = this.speed >= 0 ? 1 : -1;
      this.rotation -= steer * this.turnSpeed * delta * dir;
    }

    const forwardX = Math.sin(this.rotation);
    const forwardZ = Math.cos(this.rotation);

    const totalDist = Math.abs(this.speed) * delta;
    const maxSubStep = 0.18;
    const steps = Math.max(1, Math.ceil(totalDist / maxSubStep));
    const subDelta = delta / steps;

    const startX = this.position.x;
    const startZ = this.position.z;

    for (let s = 0; s < steps; s++) {
      this.position.x += forwardX * this.speed * subDelta;
      this.position.z += forwardZ * this.speed * subDelta;
      resolveCircleCollision(this.position, this.radius, this.colliders, 3);
    }

    const actualDist = Math.hypot(this.position.x - startX, this.position.z - startZ);
    if (totalDist > 0.08 && actualDist < totalDist * 0.3) {
      this.speed = -this.speed * 0.2;
    }

    const groundY = getTerrainHeight(this.position.x, this.position.z);
    this.position.y = groundY;

    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;

    // Galloping leg animation
    if (Math.abs(this.speed) > 0.1) {
      this.gallopCycle += delta * (Math.abs(this.speed) * 0.8);
      const legSwing = Math.sin(this.gallopCycle) * 0.55;

      this.legs.forEach(leg => {
        if (leg.tag === 'FL' || leg.tag === 'BR') {
          leg.group.rotation.x = legSwing;
        } else {
          leg.group.rotation.x = -legSwing;
        }
      });

      if (this.tail) {
        this.tail.rotation.z = Math.sin(this.gallopCycle) * 0.3;
      }

      // Equestrian gallop hoof clatter
      audioSystem.playGallopHoof();
    } else {
      this.legs.forEach(leg => {
        leg.group.rotation.x = 0;
      });
      if (this.tail) {
        this.tail.rotation.z = 0;
      }
    }

    // Space key: Royal warhorse fanfare
    if (inputManager.keys['Space']) {
      audioSystem.playWarHorn(); // Royal trumpet fanfare
      inputManager.keys['Space'] = false;
    }
  }
}
