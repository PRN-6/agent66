import * as THREE from 'three';

export class Traffic {
  constructor(scene, dayNightCycle) {
    this.scene = scene;
    this.dayNightCycle = dayNightCycle;
    this.patrols = [];

    this.initKingdomPatrols();
  }

  initKingdomPatrols() {
    // Kingdom cobblestone routes (clean paths avoiding castle walls and buildings):
    // 1. Market Street (Z ~ -60, X from 125 to 295)
    // 2. King's Castle Promenade (X ~ 200, Z from -114 at south gate to -62 at market)
    // 3. Country Lane (X ~ 100, Z from -70 to 15)
    // 4. Farmland Road (Z ~ 10, X from 15 to 120)

    const routes = [
      // Eastbound along Market Street
      { startX: 130, startZ: -62, dirX: 1, dirZ: 0, minX: 125, maxX: 295, type: 'cart' },
      // Westbound along Market Street
      { startX: 290, startZ: -58, dirX: -1, dirZ: 0, minX: 125, maxX: 295, type: 'guard' },
      // Eastbound along Farmland Road
      { startX: 20, startZ: 8, dirX: 1, dirZ: 0, minX: 15, maxX: 120, type: 'cart' },
      // Westbound along Farmland Road
      { startX: 115, startZ: 12, dirX: -1, dirZ: 0, minX: 15, maxX: 120, type: 'guard' },
      // Southbound along Country Lane
      { startX: 98, startZ: -65, dirX: 0, dirZ: 1, minZ: -70, maxZ: 15, type: 'cart' },
      // Northbound along Country Lane
      { startX: 102, startZ: 10, dirX: 0, dirZ: -1, minZ: -70, maxZ: 15, type: 'guard' },
      // Southbound along Grand Citadel Barbican Gate Promenade
      { startX: 378, startZ: -320, dirX: 0, dirZ: 1, minZ: -325, maxZ: -230, type: 'guard' },
      // Northbound along Grand Citadel Barbican Gate Promenade
      { startX: 382, startZ: -235, dirX: 0, dirZ: -1, minZ: -325, maxZ: -230, type: 'guard' }
    ];

    routes.forEach((route, idx) => {
      const pGroup = new THREE.Group();

      if (route.type === 'guard') {
        this.buildKnightPatrol(pGroup);
      } else {
        this.buildWoodenWagon(pGroup);
      }

      // Spread along route
      const offset = (idx * 55) % 180;
      const x = route.startX + route.dirX * offset;
      const z = route.startZ + route.dirZ * offset;
      pGroup.position.set(x, 0.55, z);

      const angle = Math.atan2(route.dirX, route.dirZ);
      pGroup.rotation.y = angle;

      this.scene.add(pGroup);

      this.patrols.push({
        group: pGroup,
        route: route,
        speed: route.type === 'guard' ? 4.5 : 6.0,
        animTime: Math.random() * 10
      });
    });
  }

  buildKnightPatrol(group) {
    const armorMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true }); // Steel
    const tabardMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a, flatShading: true });// Royal blue
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true });

    // Armored Torso with royal tabard
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.5), tabardMat);
    torso.position.y = 1.35;
    group.add(torso);

    // Steel Knight Helmet with crest
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), armorMat);
    head.position.y = 2.15;
    group.add(head);

    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 4), goldMat);
    crest.position.set(0, 2.6, 0);
    group.add(crest);

    // Upright Halberd / Spear
    const spearShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.2, 5), new THREE.MeshLambertMaterial({ color: 0x78350f }));
    spearShaft.position.set(0.65, 1.8, 0.2);
    group.add(spearShaft);

    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.6, 4), armorMat);
    spearTip.position.set(0.65, 3.6, 0.2);
    group.add(spearTip);

    // Knight Shield on Left Arm
    const shield = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.8), tabardMat);
    shield.position.set(-0.65, 1.3, 0.1);
    group.add(shield);

    // Torch on back for night illumination
    const torch = new THREE.PointLight(0xf59e0b, 0.0, 10);
    torch.position.set(0, 2.5, -0.3);
    torch.userData.baseIntensity = 0.85;
    group.add(torch);
    this.dayNightCycle.registerNightLight(torch);
  }

  buildWoodenWagon(group) {
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x27272a, flatShading: true });
    const hayMat = new THREE.MeshLambertMaterial({ color: 0xfef08a, flatShading: true });

    // Wagon Bed
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 3.6), woodMat);
    bed.position.y = 0.9;
    bed.castShadow = true;
    group.add(bed);

    // Cargo: Hay bales and ale barrels
    const hay = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 2.4), hayMat);
    hay.position.set(0, 1.5, -0.4);
    group.add(hay);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 1.1, 6), woodMat);
    barrel.position.set(0, 1.5, 1.1);
    group.add(barrel);

    // 4 Wooden Spoked Cart Wheels
    const wheelGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.2, 8);
    wheelGeom.rotateZ(Math.PI / 2);

    group.wheels = [];
    [
      [-1.15, 0.55, 1.1],
      [1.15, 0.55, 1.1],
      [-1.15, 0.55, -1.1],
      [1.15, 0.55, -1.1]
    ].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeom, ironMat);
      w.position.set(wx, wy, wz);
      group.add(w);
      group.wheels.push(w);
    });

    // Hanging wagon lantern
    const lanternLight = new THREE.PointLight(0xfef08a, 0.0, 12);
    lanternLight.position.set(0, 1.8, 2.0);
    lanternLight.userData.baseIntensity = 0.95;
    group.add(lanternLight);
    this.dayNightCycle.registerNightLight(lanternLight);
  }

  update(delta) {
    for (let i = 0; i < this.patrols.length; i++) {
      const p = this.patrols[i];
      const r = p.route;

      p.group.position.x += r.dirX * p.speed * delta;
      p.group.position.z += r.dirZ * p.speed * delta;

      // Animate wagon wheels
      if (p.group.wheels) {
        const roll = (p.speed * delta) / 0.55;
        p.group.wheels.forEach(w => {
          w.rotation.x += roll;
        });
      }

      // Gentle walking bob for knight patrol
      if (r.type === 'guard') {
        p.animTime += delta * 6.0;
        p.group.position.y = 0.55 + Math.abs(Math.sin(p.animTime)) * 0.06;
      }

      // Wrap-around
      if (r.dirX > 0 && p.group.position.x > r.maxX) {
        p.group.position.x = r.minX;
      } else if (r.dirX < 0 && p.group.position.x < r.minX) {
        p.group.position.x = r.maxX;
      }

      if (r.dirZ > 0 && p.group.position.z > r.maxZ) {
        p.group.position.z = r.minZ;
      } else if (r.dirZ < 0 && p.group.position.z < r.minZ) {
        p.group.position.z = r.maxZ;
      }
    }
  }
}
