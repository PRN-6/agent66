import * as THREE from 'three';

export class DwarfBiome {
  constructor(scene, dayNightCycle) {
    this.scene = scene;
    this.dayNightCycle = dayNightCycle;
    this.colliders = [];
    this.animatedObjects = [];

    this.initMountainBastion();
    this.initBlastFurnaces();
    this.initGiantRotatingGears();
    this.initMineTracksAndCarts();
    this.initColossalAnvilMonument();
    this.initGuardStatues();
  }

  // 1. Great Mountain Bastion & Iron Gate at (200, 200)
  initMountainBastion() {
    const group = new THREE.Group();
    group.position.set(200, 0.5, 200);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x44403c, flatShading: true }); // Dark granite
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x27272a, flatShading: true });  // Cast iron
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true });  // Dwarven gold

    // Main Bastion Rampart (Width 36, Depth 22, Height 16)
    const bastion = new THREE.Mesh(new THREE.BoxGeometry(36, 16, 22), stoneMat);
    bastion.position.y = 8;
    bastion.castShadow = true;
    bastion.receiveShadow = true;
    group.add(bastion);

    // Angular Dwarven Crenellations along the roof
    for (let bx = -16; bx <= 16; bx += 4) {
      [-11.2, 11.2].forEach(bz => {
        const cren = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 1.6), stoneMat);
        cren.position.set(bx, 17.2, bz);
        group.add(cren);
      });
    }

    // Heavy Iron Portcullis & Gateway Arch (Leaves 7m doorway open)
    const gatePillarL = new THREE.Mesh(new THREE.BoxGeometry(4.5, 11, 4), stoneMat);
    gatePillarL.position.set(-6, 5.5, 12);
    group.add(gatePillarL);

    const gatePillarR = new THREE.Mesh(new THREE.BoxGeometry(4.5, 11, 4), stoneMat);
    gatePillarR.position.set(6, 5.5, 12);
    group.add(gatePillarR);

    const gateArch = new THREE.Mesh(new THREE.BoxGeometry(16.5, 3.5, 4), stoneMat);
    gateArch.position.set(0, 12.5, 12);
    group.add(gateArch);

    // Golden Dwarven Runes on Gate Lintels
    const runePlate = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 0.4), goldMat);
    runePlate.position.set(0, 12.5, 14.1);
    group.add(runePlate);

    // Twin High Watch Towers flanking the bastion
    [-18, 18].forEach(tx => {
      const tower = new THREE.Mesh(new THREE.BoxGeometry(8, 24, 8), stoneMat);
      tower.position.set(tx, 12, 0);
      tower.castShadow = true;
      group.add(tower);

      const roofCap = new THREE.Mesh(new THREE.ConeGeometry(5.8, 6.0, 4), ironMat);
      roofCap.rotation.y = Math.PI / 4;
      roofCap.position.set(tx, 27, 0);
      group.add(roofCap);

      this.colliders.push({
        type: 'box',
        minX: 200 + tx - 4.2,
        maxX: 200 + tx + 4.2,
        minZ: 200 - 4.2,
        maxZ: 200 + 4.2
      });
    });

    this.scene.add(group);

    // Colliders (leaves gateway open from x: -3.5 to 3.5)
    this.colliders.push(
      { type: 'box', minX: 200 - 18, maxX: 200 + 18, minZ: 200 - 11 - 0.5, maxZ: 200 - 11 + 0.5 },
      { type: 'box', minX: 200 - 18 - 0.5, maxX: 200 - 18 + 0.5, minZ: 200 - 11, maxZ: 200 + 11 },
      { type: 'box', minX: 200 + 18 - 0.5, maxX: 200 + 18 + 0.5, minZ: 200 - 11, maxZ: 200 + 11 },
      { type: 'box', minX: 200 - 18, maxX: 200 - 3.8, minZ: 200 + 11 - 0.5, maxZ: 200 + 11 + 0.5 },
      { type: 'box', minX: 200 + 3.8, maxX: 200 + 18, minZ: 200 + 11 - 0.5, maxZ: 200 + 11 + 0.5 }
    );
  }

  // 2. Industrial Blast Furnaces & Smeltery at (140, 240)
  initBlastFurnaces() {
    const group = new THREE.Group();
    group.position.set(140, 0.5, 240);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x57534e, flatShading: true });
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true });
    const moltenMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xea580c,
      emissiveIntensity: 0.95,
      roughness: 0.2
    });

    // Twin High Smelting Furnaces
    [-6, 6].forEach(fx => {
      // Cylinder furnace
      const furnace = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.0, 14, 8), stoneMat);
      furnace.position.set(fx, 7, 0);
      furnace.castShadow = true;
      group.add(furnace);

      // Iron reinforcing rings
      [4, 8, 12].forEach(ry => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.25, 4, 8), ironMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(fx, ry, 0);
        group.add(ring);
      });

      // Tall Stone Chimney / Smokestack
      const chimney = new THREE.Mesh(new THREE.BoxGeometry(2.4, 8.0, 2.4), stoneMat);
      chimney.position.set(fx, 18, 0);
      group.add(chimney);

      // Molten Hearth Glow at furnace base
      const hearth = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 1.2), moltenMat);
      hearth.position.set(fx, 1.0, 3.6);
      group.add(hearth);

      const fLight = new THREE.PointLight(0xf97316, 1.6, 18);
      fLight.position.set(fx, 2.0, 4.2);
      fLight.userData.baseIntensity = 1.6;
      group.add(fLight);
      this.dayNightCycle.registerNightLight(fLight);

      this.colliders.push({
        type: 'cylinder',
        x: 140 + fx,
        z: 240,
        radius: 4.4
      });
    });

    // Molten Iron Trough Channel
    const trough = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 2.4), moltenMat);
    trough.position.set(0, 0.25, 5.5);
    group.add(trough);

    this.scene.add(group);
  }

  // 3. Giant Rotating Iron Cog Gears & Industrial Waterwheel
  initGiantRotatingGears() {
    const group = new THREE.Group();
    group.position.set(240, 0.5, 150);

    const ironMat = new THREE.MeshLambertMaterial({ color: 0x3f3f46, flatShading: true });
    const rustMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });

    // Wall mounting structure
    const wall = new THREE.Mesh(new THREE.BoxGeometry(20, 16, 4), rustMat);
    wall.position.set(0, 8, 0);
    wall.castShadow = true;
    group.add(wall);

    // Large Cog Gear 1 (Radius 5m, 8 teeth)
    const gear1Group = new THREE.Group();
    gear1Group.position.set(-4.5, 9, 2.4);

    const gear1Hub = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.8, 12), ironMat);
    gear1Hub.rotation.x = Math.PI / 2;
    gear1Group.add(gear1Hub);

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.8), ironMat);
      tooth.position.set(Math.cos(angle) * 4.6, Math.sin(angle) * 4.6, 0);
      tooth.rotation.z = angle;
      gear1Group.add(tooth);
    }

    group.add(gear1Group);
    this.animatedObjects.push({ type: 'rotate_z', mesh: gear1Group, speed: 0.6 });

    // Meshed Smaller Cog Gear 2 (Radius 3m, counter-rotating)
    const gear2Group = new THREE.Group();
    gear2Group.position.set(4.5, 9, 2.4);

    const gear2Hub = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.8, 10), ironMat);
    gear2Hub.rotation.x = Math.PI / 2;
    gear2Group.add(gear2Hub);

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.6, 0.8), ironMat);
      tooth.position.set(Math.cos(angle) * 3.2, Math.sin(angle) * 3.2, 0);
      tooth.rotation.z = angle;
      gear2Group.add(tooth);
    }

    group.add(gear2Group);
    this.animatedObjects.push({ type: 'rotate_z', mesh: gear2Group, speed: -0.9 });

    this.scene.add(group);

    this.colliders.push({
      type: 'box',
      minX: 240 - 11,
      maxX: 240 + 11,
      minZ: 150 - 2.5,
      maxZ: 150 + 2.5
    });
  }

  // 4. Minecart Rail Tracks & Loaded Ore Carts
  initMineTracksAndCarts() {
    const group = new THREE.Group();
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true });
    const woodTieMat = new THREE.MeshLambertMaterial({ color: 0x451a03, flatShading: true });
    const goldOreMat = new THREE.MeshLambertMaterial({ color: 0xfbbf24, flatShading: true });

    // Track running along X = 170 from Z = 140 to 280
    const trackZStart = 140;
    const trackZEnd = 280;

    // Wooden Ties
    for (let z = trackZStart; z <= trackZEnd; z += 3.5) {
      const tie = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.25, 0.9), woodTieMat);
      tie.position.set(170, 0.55, z);
      tie.receiveShadow = true;
      group.add(tie);
    }

    // Steel Rails
    [-1.4, 1.4].forEach(offsetX => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, trackZEnd - trackZStart), ironMat);
      rail.position.set(170 + offsetX, 0.7, (trackZStart + trackZEnd) / 2);
      group.add(rail);
    });

    // 3 Loaded Mine Carts along the track
    [165, 210, 255].forEach(cartZ => {
      const cart = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.8, 3.8), ironMat);
      cart.position.set(170, 1.8, cartZ);
      cart.castShadow = true;
      group.add(cart);

      // Gold ore nuggets filling cart
      const ore = new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 0), goldOreMat);
      ore.position.set(170, 2.8, cartZ);
      group.add(ore);

      this.colliders.push({
        type: 'box',
        minX: 170 - 1.8,
        maxX: 170 + 1.8,
        minZ: cartZ - 2.2,
        maxZ: cartZ + 2.2
      });
    });

    this.scene.add(group);
  }

  // 5. Colossal Anvil Monument & Dwarven Grand Forge at (200, 260)
  initColossalAnvilMonument() {
    const group = new THREE.Group();
    group.position.set(200, 0.5, 260);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x57534e, flatShading: true });
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x1c1917, flatShading: true });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true });

    // Tiered Stone Base
    const base = new THREE.Mesh(new THREE.BoxGeometry(18, 1.5, 18), stoneMat);
    base.position.y = 0.75;
    base.receiveShadow = true;
    group.add(base);

    // Giant Iron Anvil Monument (Length 9m, Height 4.5m)
    const anvilBody = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.5, 3.5), ironMat);
    anvilBody.position.y = 3.25;
    anvilBody.castShadow = true;
    group.add(anvilBody);

    const hornCone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.0, 8), ironMat);
    hornCone.rotation.z = -Math.PI / 2;
    hornCone.position.set(5.0, 3.8, 0);
    group.add(hornCone);

    // Colossal Dwarven Warhammer resting diagonally across the anvil
    const hammerShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 10, 6), stoneMat);
    hammerShaft.rotation.z = Math.PI / 4;
    hammerShaft.position.set(-2, 5.8, 1.8);
    group.add(hammerShaft);

    const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.2, 2.4), goldMat);
    hammerHead.position.set(-5.5, 9.2, 1.8);
    group.add(hammerHead);

    this.scene.add(group);

    this.colliders.push({
      type: 'box',
      minX: 200 - 8,
      maxX: 200 + 8,
      minZ: 260 - 5,
      maxZ: 260 + 5
    });
  }

  // 6. Colossal Dwarven Guard Statues Flanking Entry
  initGuardStatues() {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x475569, flatShading: true });

    // Statues at (185, 120) and (215, 120)
    [-15, 15].forEach(sx => {
      const statueGroup = new THREE.Group();
      statueGroup.position.set(200 + sx, 0.5, 120);

      // Stone Plinth
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.5, 4.5), stoneMat);
      plinth.position.y = 1.25;
      statueGroup.add(plinth);

      // Stocky Dwarven Body & Robes
      const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 5.5, 2.8), stoneMat);
      body.position.y = 5.25;
      statueGroup.add(body);

      // Helmet & Beard
      const head = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), stoneMat);
      head.position.y = 9.0;
      statueGroup.add(head);

      const beard = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.5, 5), stoneMat);
      beard.rotation.x = Math.PI;
      beard.position.set(0, 7.0, 1.2);
      statueGroup.add(beard);

      // Giant Battleaxe
      const axeShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 12, 6), stoneMat);
      axeShaft.position.set(1.8, 6.0, 0.8);
      statueGroup.add(axeShaft);

      const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.5, 2.4), stoneMat);
      axeBlade.position.set(1.8, 10.5, 1.6);
      statueGroup.add(axeBlade);

      group.add(statueGroup);

      this.colliders.push({
        type: 'box',
        minX: 200 + sx - 2.8,
        maxX: 200 + sx + 2.8,
        minZ: 120 - 2.8,
        maxZ: 120 + 2.8
      });
    });

    this.scene.add(group);
  }

  update(delta) {
    this.animatedObjects.forEach(obj => {
      if (obj.type === 'rotate_z') {
        obj.mesh.rotation.z += delta * obj.speed;
      }
    });
  }
}

