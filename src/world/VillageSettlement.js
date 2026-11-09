import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';

export class VillageSettlement {
  constructor(scene, dayNightCycle) {
    this.scene = scene;
    this.dayNightCycle = dayNightCycle;
    this.colliders = [];
    this.villagers = [];
    this.animatedObjects = [];
    this.currentNearbyVillager = null;

    // Materials Palette
    this.mats = {
      soil: new THREE.MeshLambertMaterial({ color: 0x3d2817, flatShading: true }),       // Dark furrowed earth
      furrow: new THREE.MeshLambertMaterial({ color: 0x2b1c10, flatShading: true }),     // Furrow shadows
      wood: new THREE.MeshLambertMaterial({ color: 0x5c3a21, flatShading: true }),       // Rustic timber
      woodDark: new THREE.MeshLambertMaterial({ color: 0x3d2314, flatShading: true }),   // Aged timber
      stone: new THREE.MeshLambertMaterial({ color: 0x57534e, flatShading: true }),      // Fieldstone
      stoneLight: new THREE.MeshLambertMaterial({ color: 0x78716c, flatShading: true }),
      thatch: new THREE.MeshLambertMaterial({ color: 0xca8a04, flatShading: true }),     // Thatched straw
      hay: new THREE.MeshLambertMaterial({ color: 0xd97706, flatShading: true }),        // Golden hay
      wheat: new THREE.MeshLambertMaterial({ color: 0xeab308, flatShading: true }),      // Ripe wheat
      cabbage: new THREE.MeshLambertMaterial({ color: 0x22c55e, flatShading: true }),    // Cabbage
      cabbageDark: new THREE.MeshLambertMaterial({ color: 0x15803d, flatShading: true }),
      pumpkin: new THREE.MeshLambertMaterial({ color: 0xf97316, flatShading: true }),    // Bright pumpkin
      stem: new THREE.MeshLambertMaterial({ color: 0x4d7c0f, flatShading: true }),       // Vine green
      water: new THREE.MeshLambertMaterial({ color: 0x0284c7, flatShading: true }),
      iron: new THREE.MeshLambertMaterial({ color: 0x27272a, flatShading: true }),
      cloth: new THREE.MeshLambertMaterial({ color: 0xd6d3d1, flatShading: true }),      // Burlap sacks
      flowerPurple: new THREE.MeshLambertMaterial({ color: 0xa855f7, flatShading: true }), // Lavender
      flowerBlue: new THREE.MeshLambertMaterial({ color: 0x38bdf8, flatShading: true }),
      flowerGold: new THREE.MeshLambertMaterial({ color: 0xfacc15, flatShading: true }),
      leafGreen: new THREE.MeshLambertMaterial({ color: 0x166534, flatShading: true }),
      appleRed: new THREE.MeshLambertMaterial({ color: 0xdc2626, flatShading: true }),
      obsidian: new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true }),
      basalt: new THREE.MeshLambertMaterial({ color: 0x27272a, flatShading: true }),
      lava: new THREE.MeshLambertMaterial({ color: 0xef4444, emissive: 0x7f1d1d, flatShading: true }),
      bone: new THREE.MeshLambertMaterial({ color: 0xf3f4f6, flatShading: true }),
      jade: new THREE.MeshLambertMaterial({ color: 0x0f766e, flatShading: true }),
      elvenMarble: new THREE.MeshLambertMaterial({ color: 0xf8fafc, flatShading: true }),
      manaWater: new THREE.MeshLambertMaterial({ color: 0x06b6d4, flatShading: true }),
      dwarfStone: new THREE.MeshLambertMaterial({ color: 0x44403c, flatShading: true }),
      bronze: new THREE.MeshLambertMaterial({ color: 0xb45309, flatShading: true }),
      gold: new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true }),
      dwarfBeard: new THREE.MeshLambertMaterial({ color: 0x92400e, flatShading: true }),
      demonCrimson: new THREE.MeshLambertMaterial({ color: 0x991b1b, flatShading: true })
    };

    this.initOakhavenVillage();
    this.initFernbrookHamlet();
    this.initDemonEnclave();
    this.initElvenGlade();
    this.initDwarfUnion();
    this.initVillagerNPCs();
  }

  /* -------------------------------------------------------------------------
     1. OAKHAVEN AGRICULTURAL VILLAGE (Valoria Farmlands: x ~ 70-160, z ~ -25-45)
     ------------------------------------------------------------------------- */
  initOakhavenVillage() {
    const oakhavenGroup = new THREE.Group();

    // 1.1 Crop Field 1: Golden Wheat Field (x: 75, z: -10)
    this.createWheatField(oakhavenGroup, 75, -10, 24, 20);

    // 1.2 Crop Field 2: Cabbage & Carrot Patch (x: 104, z: -12)
    this.createVegetablePatch(oakhavenGroup, 104, -12, 18, 16);

    // 1.3 Crop Field 3: Harvest Pumpkin Patch (x: 84, z: 32)
    this.createPumpkinPatch(oakhavenGroup, 84, 32, 22, 18);

    // 1.4 Post-and-Rail Split Fences around fields
    this.createFieldFences(oakhavenGroup);

    // 1.5 Conical Hayricks (Haystacks)
    this.createHayricks(oakhavenGroup);

    // 1.6 Farm Wagons & Produce Carts
    this.createFarmCarts(oakhavenGroup);

    // 1.7 Communal Square: Village Well & Campfire / Bread Hearth
    this.createCommunalSquare(oakhavenGroup);

    // 1.8 Village Farmhouses & Barns
    this.createFarmhouses(oakhavenGroup);

    this.scene.add(oakhavenGroup);
  }

  // --- Field 1: Golden Wheat Field ---
  createWheatField(parent, cx, cz, width, depth) {
    const fieldGroup = new THREE.Group();
    fieldGroup.position.set(cx, 0.51, cz);

    // Tilled soil base
    const base = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), this.mats.soil);
    base.rotateX(-Math.PI / 2);
    base.receiveShadow = true;
    fieldGroup.add(base);

    // Furrow ridge strips
    const furrowCount = 9;
    const furrowStep = depth / furrowCount;
    for (let f = 0; f < furrowCount; f++) {
      const zOffset = -depth / 2 + (f + 0.5) * furrowStep;
      const furrow = new THREE.Mesh(new THREE.BoxGeometry(width - 0.8, 0.12, 0.55), this.mats.furrow);
      furrow.position.set(0, 0.06, zOffset);
      furrow.receiveShadow = true;
      fieldGroup.add(furrow);

      // Rows of stylized low-poly wheat stalks
      const stalksPerRow = 14;
      const xStep = (width - 2) / stalksPerRow;
      for (let s = 0; s < stalksPerRow; s++) {
        const xOffset = -(width - 2) / 2 + (s + 0.5) * xStep + (Math.sin(s * 3.7) * 0.2);
        const wheatStalk = this.createLowPolyWheatStalk();
        wheatStalk.position.set(xOffset, 0.12, zOffset + (Math.cos(s * 2.1) * 0.15));
        fieldGroup.add(wheatStalk);
      }
    }

    parent.add(fieldGroup);
  }

  createLowPolyWheatStalk() {
    const group = new THREE.Group();
    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.9, 4), this.mats.wheat);
    stem.position.y = 0.45;
    group.add(stem);

    // Wheat grain head
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 4), this.mats.wheat);
    head.position.y = 0.95;
    head.rotation.z = (Math.random() - 0.5) * 0.25;
    head.rotation.x = (Math.random() - 0.5) * 0.25;
    group.add(head);

    return group;
  }

  // --- Field 2: Cabbage & Carrot Patch ---
  createVegetablePatch(parent, cx, cz, width, depth) {
    const patchGroup = new THREE.Group();
    patchGroup.position.set(cx, 0.51, cz);

    const base = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), this.mats.soil);
    base.rotateX(-Math.PI / 2);
    base.receiveShadow = true;
    patchGroup.add(base);

    // Furrows with cabbages and carrots
    const rows = 6;
    const rowStep = depth / rows;
    for (let r = 0; r < rows; r++) {
      const zOffset = -depth / 2 + (r + 0.5) * rowStep;
      const furrow = new THREE.Mesh(new THREE.BoxGeometry(width - 0.6, 0.12, 0.6), this.mats.furrow);
      furrow.position.set(0, 0.06, zOffset);
      patchGroup.add(furrow);

      const itemsInRow = 8;
      const xStep = (width - 2) / itemsInRow;
      for (let i = 0; i < itemsInRow; i++) {
        const xOffset = -(width - 2) / 2 + (i + 0.5) * xStep;

        if (r % 2 === 0) {
          // Green Low-poly Cabbage Head
          const cabbage = new THREE.Group();
          const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), this.mats.cabbage);
          head.position.y = 0.28;
          cabbage.add(head);

          const leafBase = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 6), this.mats.cabbageDark);
          leafBase.position.y = 0.12;
          cabbage.add(leafBase);

          cabbage.position.set(xOffset, 0, zOffset);
          patchGroup.add(cabbage);
        } else {
          // Orange Carrot Top with feathery greens
          const carrot = new THREE.Group();
          const rootCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.05, 0.2, 5), this.mats.pumpkin);
          rootCrown.position.y = 0.15;
          carrot.add(rootCrown);

          const greens = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 4), this.mats.stem);
          greens.position.y = 0.4;
          carrot.add(greens);

          carrot.position.set(xOffset, 0, zOffset);
          patchGroup.add(carrot);
        }
      }
    }

    parent.add(patchGroup);
  }

  // --- Field 3: Harvest Pumpkin Patch ---
  createPumpkinPatch(parent, cx, cz, width, depth) {
    const patchGroup = new THREE.Group();
    patchGroup.position.set(cx, 0.51, cz);

    const base = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), this.mats.soil);
    base.rotateX(-Math.PI / 2);
    base.receiveShadow = true;
    patchGroup.add(base);

    // Scattered round pumpkins with curly vines
    const pumpkinCoords = [
      [-6, -5], [-2, -6], [4, -4], [7, -5],
      [-7, -1], [-3, 0], [1, -1], [5, 1], [8, -1],
      [-5, 5], [-1, 4], [3, 6], [7, 4]
    ];

    pumpkinCoords.forEach(([px, pz]) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(px, 0, pz);

      const pSize = 0.4 + (Math.abs(Math.sin(px * 1.5)) * 0.2);

      // Low-poly squash body
      const pMesh = new THREE.Mesh(new THREE.CylinderGeometry(pSize, pSize * 0.9, pSize * 0.75, 7), this.mats.pumpkin);
      pMesh.position.y = (pSize * 0.75) / 2 + 0.05;
      pMesh.castShadow = true;
      pGroup.add(pMesh);

      // Green stem
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.25, 4), this.mats.stem);
      stem.position.y = pSize * 0.75 + 0.12;
      stem.rotation.z = 0.3;
      pGroup.add(stem);

      // Tangled green ground vine runners
      const vine = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, 0.12), this.mats.stem);
      vine.rotation.y = Math.sin(px) * 2;
      vine.position.y = 0.03;
      pGroup.add(vine);

      patchGroup.add(pGroup);
    });

    parent.add(patchGroup);
  }

  // --- Post-and-Rail Wooden Split Fences with Gates ---
  createFieldFences(parent) {
    const fenceGroup = new THREE.Group();

    // Enclosing perimeter fences around Wheat Field (cx: 75, cz: -10, w: 24, d: 20)
    this.buildFenceLine(fenceGroup, 62, -21, 88, -21); // North edge
    this.buildFenceLine(fenceGroup, 62, -21, 62, 1);   // West edge
    this.buildFenceLine(fenceGroup, 62, 1, 88, 1, true); // South edge (with open gate!)
    this.buildFenceLine(fenceGroup, 88, -21, 88, 1);   // East edge

    // Enclosing perimeter fences around Pumpkin Field (cx: 84, cz: 32, w: 22, d: 18)
    this.buildFenceLine(fenceGroup, 72, 22, 96, 22, true); // North edge (with gate)
    this.buildFenceLine(fenceGroup, 72, 22, 72, 42);       // West edge
    this.buildFenceLine(fenceGroup, 72, 42, 96, 42);       // South edge
    this.buildFenceLine(fenceGroup, 96, 22, 96, 42);       // East edge

    parent.add(fenceGroup);
  }

  buildFenceLine(parent, x1, z1, x2, z2, hasGate = false) {
    const length = Math.hypot(x2 - x1, z2 - z1);
    const angle = Math.atan2(x2 - x1, z2 - z1);
    const postSpacing = 3.5;
    const postCount = Math.floor(length / postSpacing);

    for (let p = 0; p <= postCount; p++) {
      // If gate in middle, skip a post and rail to leave 2.5m open gate
      if (hasGate && p === Math.floor(postCount / 2)) {
        continue;
      }

      const t = p / postCount;
      const px = x1 + (x2 - x1) * t;
      const pz = z1 + (z2 - z1) * t;

      // Vertical post
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.3, 0.24), this.mats.wood);
      post.position.set(px, 0.5 + 0.65, pz);
      post.castShadow = true;
      parent.add(post);

      // Register post collider
      this.colliders.push({
        type: 'box',
        minX: px - 0.25,
        maxX: px + 0.25,
        minZ: pz - 0.25,
        maxZ: pz + 0.25
      });

      // Horizontal rails to next post
      if (p < postCount && (!hasGate || (p !== Math.floor(postCount / 2) && p !== Math.floor(postCount / 2) - 1))) {
        const nextT = (p + 1) / postCount;
        const nx = x1 + (x2 - x1) * nextT;
        const nz = z1 + (z2 - z1) * nextT;
        const midX = (px + nx) / 2;
        const midZ = (pz + nz) / 2;
        const segLen = Math.hypot(nx - px, nz - pz);
        const segAngle = Math.atan2(nx - px, nz - pz);

        // Lower & Upper Rails
        [0.45, 0.95].forEach(ry => {
          const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, segLen), this.mats.wood);
          rail.position.set(midX, 0.5 + ry, midZ);
          rail.rotation.y = segAngle;
          rail.castShadow = true;
          parent.add(rail);
        });

        // Register rail collision segment
        const halfLen = segLen / 2;
        this.colliders.push({
          type: 'box',
          minX: Math.min(px, nx) - 0.2,
          maxX: Math.max(px, nx) + 0.2,
          minZ: Math.min(pz, nz) - 0.2,
          maxZ: Math.max(pz, nz) + 0.2
        });
      }
    }
  }

  // --- Conical Hayricks & Straw Stacks ---
  createHayricks(parent) {
    const hayPositions = [
      { x: 91, z: 2 },
      { x: 93, z: 7 },
      { x: 74, z: 12 }
    ];

    hayPositions.forEach(hp => {
      const rickGroup = new THREE.Group();
      rickGroup.position.set(hp.x, 0.5, hp.z);

      // Stepped thatched straw cylinder + cone
      const lower = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.5, 1.8, 7), this.mats.hay);
      lower.position.y = 0.9;
      lower.castShadow = true;
      lower.receiveShadow = true;
      rickGroup.add(lower);

      const upper = new THREE.Mesh(new THREE.ConeGeometry(2.3, 2.6, 7), this.mats.thatch);
      upper.position.y = 1.8 + 1.3;
      upper.castShadow = true;
      rickGroup.add(upper);

      // Wooden pitchfork leaning against the haystack
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 4), this.mats.wood);
      pole.position.set(1.9, 1.0, 0.4);
      pole.rotation.z = -0.3;
      rickGroup.add(pole);

      const forkHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.08), this.mats.iron);
      forkHead.position.set(2.2, 1.9, 0.4);
      rickGroup.add(forkHead);

      parent.add(rickGroup);

      // Airtight haystack cylinder collider
      this.colliders.push({
        type: 'cylinder',
        x: hp.x,
        z: hp.z,
        radius: 2.5
      });
    });
  }

  // --- Farm Wagons & Produce Carts ---
  createFarmCarts(parent) {
    const cartPositions = [
      { x: 102, z: 12, rot: 0.35 },
      { x: 122, z: -5, rot: -0.2 }
    ];

    cartPositions.forEach(cp => {
      const cart = new THREE.Group();
      cart.position.set(cp.x, 0.5, cp.z);
      cart.rotation.y = cp.rot;

      // Wooden cart box bed
      const bed = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 3.4), this.mats.wood);
      bed.position.y = 1.1;
      bed.castShadow = true;
      cart.add(bed);

      // Inner hollow cargo cavity
      const cavity = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 3.0), this.mats.woodDark);
      cavity.position.y = 1.25;
      cart.add(cavity);

      // Wooden Spoke Wheels (2 on sides)
      [-1.25, 1.25].forEach(wx => {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.22, 10), this.mats.woodDark);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 0.9, 0);
        wheel.castShadow = true;
        cart.add(wheel);
      });

      // Front pulling shafts (for ox/horse harness)
      [-0.6, 0.6].forEach(sx => {
        const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 2.4), this.mats.wood);
        shaft.position.set(sx, 0.7, 2.5);
        shaft.rotation.x = -0.15;
        cart.add(shaft);
      });

      // Cargo: Grain sacks & pumpkin crates
      [-0.4, 0.4].forEach(gx => {
        const sack = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.8), this.mats.cloth);
        sack.position.set(gx, 1.4, -0.6);
        cart.add(sack);
      });

      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 0.8), this.mats.wood);
      crate.position.set(0, 1.4, 0.5);
      cart.add(crate);

      const cartPumpkin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.24, 6), this.mats.pumpkin);
      cartPumpkin.position.set(0, 1.75, 0.5);
      cart.add(cartPumpkin);

      parent.add(cart);

      // Cart collider
      this.colliders.push({
        type: 'box',
        minX: cp.x - 1.6,
        maxX: cp.x + 1.6,
        minZ: cp.z - 2.4,
        maxZ: cp.z + 2.4
      });
    });
  }

  // --- Communal Square: Village Well & Campfire / Bread Hearth ---
  createCommunalSquare(parent) {
    const squareGroup = new THREE.Group();
    squareGroup.position.set(110, 0.5, 6);

    // 1. Communal Cobblestone Water Well
    const wellBase = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.4, 1.2, 8), this.mats.stone);
    wellBase.position.y = 0.6;
    wellBase.castShadow = true;
    wellBase.receiveShadow = true;
    squareGroup.add(wellBase);

    const wellWater = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.15, 8), this.mats.water);
    wellWater.position.y = 1.0;
    squareGroup.add(wellWater);

    // Well Roof Posts & Canopy
    [-1.5, 1.5].forEach(px => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 0.2), this.mats.wood);
      post.position.set(px, 1.6, 0);
      post.castShadow = true;
      squareGroup.add(post);
    });

    const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 0.18), this.mats.wood);
    crossbeam.position.set(0, 3.1, 0);
    squareGroup.add(crossbeam);

    const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.4, 4), this.mats.thatch);
    wellRoof.rotation.y = Math.PI / 4;
    wellRoof.position.set(0, 3.8, 0);
    wellRoof.castShadow = true;
    squareGroup.add(wellRoof);

    // Well Bucket
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.35, 6), this.mats.wood);
    bucket.position.set(0.6, 1.35, 0.3);
    squareGroup.add(bucket);

    // Well collider
    this.colliders.push({
      type: 'cylinder',
      x: 110,
      z: 6,
      radius: 2.6
    });

    // 2. Communal Campfire & Bread Baking Hearth (x: 115, z: 12)
    const hearthGroup = new THREE.Group();
    hearthGroup.position.set(5, 0, 6);

    // Stone fire ring
    const stoneRing = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.3, 5, 8), this.mats.stone);
    stoneRing.rotation.x = Math.PI / 2;
    stoneRing.position.y = 0.25;
    hearthGroup.add(stoneRing);

    // Burning ember pile
    const emberMat = new THREE.MeshLambertMaterial({ color: 0xef4444, emissive: 0xb91c1c });
    const embers = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.6, 6), emberMat);
    embers.position.y = 0.35;
    hearthGroup.add(embers);

    // Campfire Warm PointLight
    const fireLight = new THREE.PointLight(0xf97316, 1.4, 16);
    fireLight.position.set(0, 1.5, 0);
    fireLight.userData.baseIntensity = 1.4;
    hearthGroup.add(fireLight);
    this.dayNightCycle.registerNightLight(fireLight);
    this.animatedObjects.push({ type: 'fire', light: fireLight });

    // Wooden cooking tripod with iron hanging pot
    [-0.8, 0.8].forEach(tx => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.0, 4), this.mats.wood);
      leg.position.set(tx, 0.95, tx * 0.3);
      leg.rotation.z = -tx * 0.3;
      hearthGroup.add(leg);
    });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.3, 0.4, 6), this.mats.iron);
    pot.position.set(0, 0.8, 0);
    hearthGroup.add(pot);

    // 3 Curved split-log seating benches around the campfire where villagers sit together
    const benchAngles = [0, 2.1, 4.2];
    benchAngles.forEach(ang => {
      const bx = Math.sin(ang) * 2.8;
      const bz = Math.cos(ang) * 2.8;

      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.6), this.mats.wood);
      bench.position.set(bx, 0.3, bz);
      bench.rotation.y = ang + Math.PI / 2;
      bench.castShadow = true;
      hearthGroup.add(bench);

      this.colliders.push({
        type: 'box',
        minX: 110 + 5 + bx - 1.2,
        maxX: 110 + 5 + bx + 1.2,
        minZ: 6 + 6 + bz - 0.5,
        maxZ: 6 + 6 + bz + 0.5
      });
    });

    squareGroup.add(hearthGroup);
    parent.add(squareGroup);
  }

  // --- Village Farmhouses & Barns ---
  createFarmhouses(parent) {
    // 1. The Great Granary & Barn (x: 128, z: -16, w: 18, d: 14)
    this.buildBarn(parent, 128, -16, 18, 14, 5.5);

    // 2. Farmer Bran's Thatched Cottage (x: 126, z: 26, w: 15, d: 12)
    this.buildCottage(parent, 126, 26, 15, 12, 4.2, 'Farmer Bran’s Thatched Cottage');

    // 3. Harvesters' Bunkhouse (x: 154, z: 4, w: 16, d: 11)
    this.buildCottage(parent, 154, 4, 16, 11, 4.0, 'Harvesters’ Bunkhouse');
  }

  buildBarn(parent, x, z, w, d, h) {
    const barnGroup = new THREE.Group();
    barnGroup.position.set(x, 0.5, z);

    // Fieldstone base
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d), this.mats.stone);
    base.position.y = 0.6;
    base.castShadow = true;
    base.receiveShadow = true;
    barnGroup.add(base);

    // Weathered timber walls
    // Back wall
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), this.mats.wood);
    back.position.set(0, h / 2, -d / 2);
    back.castShadow = true;
    barnGroup.add(back);

    // Left wall
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, d), this.mats.wood);
    left.position.set(-w / 2, h / 2, 0);
    left.castShadow = true;
    barnGroup.add(left);

    // Right wall
    const right = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, d), this.mats.wood);
    right.position.set(w / 2, h / 2, 0);
    right.castShadow = true;
    barnGroup.add(right);

    // Front wall: Left & Right sections leaving 4.5m wide open barn entrance
    const doorW = 4.5;
    const sideW = (w - doorW) / 2;

    const frontL = new THREE.Mesh(new THREE.BoxGeometry(sideW, h, 0.4), this.mats.wood);
    frontL.position.set(-(doorW / 2 + sideW / 2), h / 2, d / 2);
    barnGroup.add(frontL);

    const frontR = new THREE.Mesh(new THREE.BoxGeometry(sideW, h, 0.4), this.mats.wood);
    frontR.position.set((doorW / 2 + sideW / 2), h / 2, d / 2);
    barnGroup.add(frontR);

    // Open Granary Interior Props:
    // Stacks of hay bales
    [-3, 3].forEach(hx => {
      const bale = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.1), this.mats.hay);
      bale.position.set(hx, 0.8, -3.5);
      barnGroup.add(bale);
    });

    // Grain sacks in corner
    [-5, -4].forEach(sx => {
      const sack = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), this.mats.cloth);
      sack.position.set(sx, 0.6, 2.5);
      barnGroup.add(sack);
    });

    // High Steep Gabled Thatched Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) * 0.58, 5.0, 4), this.mats.thatch);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, h + 2.4, 0);
    roof.castShadow = true;
    barnGroup.add(roof);

    parent.add(barnGroup);

    // Airtight barn wall colliders (leaving open front doorway)
    this.colliders.push(
      // Back wall
      { type: 'box', minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2 - 0.3, maxZ: z - d / 2 + 0.3 },
      // Left wall
      { type: 'box', minX: x - w / 2 - 0.3, maxX: x - w / 2 + 0.3, minZ: z - d / 2, maxZ: z + d / 2 },
      // Right wall
      { type: 'box', minX: x + w / 2 - 0.3, maxX: x + w / 2 + 0.3, minZ: z - d / 2, maxZ: z + d / 2 },
      // Front wall Left
      { type: 'box', minX: x - w / 2, maxX: x - doorW / 2, minZ: z + d / 2 - 0.3, maxZ: z + d / 2 + 0.3 },
      // Front wall Right
      { type: 'box', minX: x + doorW / 2, maxX: x + w / 2, minZ: z + d / 2 - 0.3, maxZ: z + d / 2 + 0.3 }
    );
  }

  buildCottage(parent, x, z, w, d, h, name) {
    const cotGroup = new THREE.Group();
    cotGroup.position.set(x, 0.5, z);

    // Stone base
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, d), this.mats.stone);
    base.position.y = 0.4;
    cotGroup.add(base);

    // Plaster / Timber walls
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7, flatShading: true }); // Warm wattle-and-daub

    // Back wall
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.35), wallMat);
    back.position.set(0, h / 2, -d / 2);
    cotGroup.add(back);

    // Left wall
    const left = new THREE.Mesh(new THREE.BoxGeometry(0.35, h, d), wallMat);
    left.position.set(-w / 2, h / 2, 0);
    cotGroup.add(left);

    // Right wall
    const right = new THREE.Mesh(new THREE.BoxGeometry(0.35, h, d), wallMat);
    right.position.set(w / 2, h / 2, 0);
    cotGroup.add(right);

    // Front wall (with 3.0m open door)
    const doorW = 3.0;
    const sideW = (w - doorW) / 2;

    const frontL = new THREE.Mesh(new THREE.BoxGeometry(sideW, h, 0.35), wallMat);
    frontL.position.set(-(doorW / 2 + sideW / 2), h / 2, d / 2);
    cotGroup.add(frontL);

    const frontR = new THREE.Mesh(new THREE.BoxGeometry(sideW, h, 0.35), wallMat);
    frontR.position.set((doorW / 2 + sideW / 2), h / 2, d / 2);
    cotGroup.add(frontR);

    // Interior furniture
    const table = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.7, 1.8), this.mats.wood);
    table.position.set(0, 0.5, -1.5);
    cotGroup.add(table);

    const breadLoaf = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.25, 6), this.mats.thatch);
    breadLoaf.position.set(0.2, 0.95, -1.5);
    cotGroup.add(breadLoaf);

    // Stone Chimney with warm smoke potential
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.6, h + 3.2, 1.6), this.mats.stone);
    chimney.position.set(w * 0.3, (h + 3.2) / 2, -d * 0.3);
    chimney.castShadow = true;
    cotGroup.add(chimney);

    // Thatched Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) * 0.55, 4.5, 4), this.mats.thatch);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, h + 2.1, 0);
    roof.castShadow = true;
    cotGroup.add(roof);

    parent.add(cotGroup);

    // Colliders
    this.colliders.push(
      { type: 'box', minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2 - 0.25, maxZ: z - d / 2 + 0.25 },
      { type: 'box', minX: x - w / 2 - 0.25, maxX: x - w / 2 + 0.25, minZ: z - d / 2, maxZ: z + d / 2 },
      { type: 'box', minX: x + w / 2 - 0.25, maxX: x + w / 2 + 0.25, minZ: z - d / 2, maxZ: z + d / 2 },
      { type: 'box', minX: x - w / 2, maxX: x - doorW / 2, minZ: z + d / 2 - 0.25, maxZ: z + d / 2 + 0.25 },
      { type: 'box', minX: x + doorW / 2, maxX: x + w / 2, minZ: z + d / 2 - 0.25, maxZ: z + d / 2 + 0.25 }
    );
  }

  /* -------------------------------------------------------------------------
     2. FERNBROOK WOODLAND ORCHARD & HAMLET (Forest Border: x ~ -95 to -50, z ~ 90 to 140)
     ------------------------------------------------------------------------- */
  initFernbrookHamlet() {
    const fernGroup = new THREE.Group();

    // 2.1 Apple & Pear Fruit Orchard
    this.createFruitOrchard(fernGroup);

    // 2.2 Raised Herbal Garden Beds (Lavender, healing herbs)
    this.createHerbalBeds(fernGroup);

    // 2.3 Woven Straw Beehives (Skeps)
    this.createBeehives(fernGroup);

    // 2.4 Woodland Timber Cabins (Forester & Herbalist)
    this.createWoodlandCabins(fernGroup);

    // 2.5 Woodland Campfire & Log Gathering Area
    this.createWoodlandCampfire(fernGroup);

    this.scene.add(fernGroup);
  }

  createFruitOrchard(parent) {
    const treePositions = [
      { x: -62, z: 120 },
      { x: -55, z: 128 },
      { x: -68, z: 132 },
      { x: -76, z: 126 },
      { x: -84, z: 135 }
    ];

    treePositions.forEach(tp => {
      const y = getTerrainHeight(tp.x, tp.z);
      const tree = new THREE.Group();
      tree.position.set(tp.x, y, tp.z);

      // Gnarled wood trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 3.2, 5), this.mats.woodDark);
      trunk.position.y = 1.6;
      trunk.castShadow = true;
      tree.add(trunk);

      // Stylized low-poly fruit canopy
      const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 0), this.mats.leafGreen);
      canopy.position.y = 3.6;
      canopy.castShadow = true;
      tree.add(canopy);

      // Hanging red apples
      for (let a = 0; a < 6; a++) {
        const ang = (a * Math.PI * 2) / 6;
        const apple = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), this.mats.appleRed);
        apple.position.set(Math.sin(ang) * 1.5, 3.0 + (Math.cos(ang * 2) * 0.4), Math.cos(ang) * 1.5);
        tree.add(apple);
      }

      parent.add(tree);

      // Tree trunk collider
      this.colliders.push({
        type: 'cylinder',
        x: tp.x,
        z: tp.z,
        radius: 0.8
      });
    });
  }

  createHerbalBeds(parent) {
    const bedPositions = [
      { x: -68, z: 98, mat: this.mats.flowerPurple }, // Lavender bed
      { x: -68, z: 103, mat: this.mats.flowerBlue },   // Blue dew-lilies
      { x: -68, z: 108, mat: this.mats.flowerGold }    // Chamomile
    ];

    bedPositions.forEach(bp => {
      const y = getTerrainHeight(bp.x, bp.z);
      const bedGroup = new THREE.Group();
      bedGroup.position.set(bp.x, y, bp.z);

      // Raised timber planter frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.45, 1.8), this.mats.wood);
      frame.position.y = 0.22;
      bedGroup.add(frame);

      // Dark herbal loam
      const loam = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.46, 1.4), this.mats.soil);
      loam.position.y = 0.24;
      bedGroup.add(loam);

      // Flower / herb blossoms
      for (let f = 0; f < 8; f++) {
        const fx = -1.5 + f * 0.42;
        const fz = (Math.sin(f * 2.3) * 0.4);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.4, 4), this.mats.stem);
        stem.position.set(fx, 0.55, fz);
        bedGroup.add(stem);

        const blossom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), bp.mat);
        blossom.position.set(fx, 0.75, fz);
        bedGroup.add(blossom);
      }

      parent.add(bedGroup);

      // Planter box collider
      this.colliders.push({
        type: 'box',
        minX: bp.x - 2.2,
        maxX: bp.x + 2.2,
        minZ: bp.z - 1.0,
        maxZ: bp.z + 1.0
      });
    });
  }

  createBeehives(parent) {
    const x = -88;
    const z = 104;
    const y = getTerrainHeight(x, z);

    const hiveGroup = new THREE.Group();
    hiveGroup.position.set(x, y, z);

    // Wooden trestle bench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 0.9), this.mats.wood);
    bench.position.y = 0.5;
    hiveGroup.add(bench);

    // 3 Woven straw skeps (traditional cone beehives)
    [-1.1, 0, 1.1].forEach(hx => {
      const skep = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.7, 7), this.mats.thatch);
      skep.position.set(hx, 1.1, 0);
      hiveGroup.add(skep);

      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.35, 7), this.mats.hay);
      cap.position.set(hx, 1.55, 0);
      hiveGroup.add(cap);
    });

    parent.add(hiveGroup);

    this.colliders.push({
      type: 'box',
      minX: x - 2.0,
      maxX: x + 2.0,
      minZ: z - 0.7,
      maxZ: z + 0.7
    });
  }

  createWoodlandCabins(parent) {
    // Cabin 1: Forester Cedric's Log Cabin (x: -85, z: 124)
    this.buildLogCabin(parent, -85, 124, 14, 11, 3.8);

    // Cabin 2: Herbalist Rowan's Cottage (x: -60, z: 92)
    this.buildLogCabin(parent, -60, 92, 13, 10, 3.6);
  }

  buildLogCabin(parent, x, z, w, d, h) {
    const y = getTerrainHeight(x, z);
    const cab = new THREE.Group();
    cab.position.set(x, y, z);

    // Dark rustic log walls
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.mats.woodDark);
    wall.position.y = h / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    cab.add(wall);

    // Wooden door frame
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 0.4), this.mats.wood);
    door.position.set(0, 1.4, d / 2 + 0.1);
    cab.add(door);

    // Mossy Thatched Gabled Roof
    const mossMat = new THREE.MeshLambertMaterial({ color: 0x4d7c0f, flatShading: true });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) * 0.55, 4.2, 4), mossMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, h + 1.9, 0);
    roof.castShadow = true;
    cab.add(roof);

    // Outside firewood stack
    const woodpile = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 1.0), this.mats.wood);
    woodpile.position.set(w / 2 + 1.4, 0.6, 0);
    cab.add(woodpile);

    parent.add(cab);

    // Cabin collider
    this.colliders.push({
      type: 'box',
      minX: x - w / 2 - 0.3,
      maxX: x + w / 2 + 1.8, // includes woodpile
      minZ: z - d / 2 - 0.3,
      maxZ: z + d / 2 + 0.3
    });
  }

  createWoodlandCampfire(parent) {
    const x = -76;
    const z = 110;
    const y = getTerrainHeight(x, z);

    const fireGroup = new THREE.Group();
    fireGroup.position.set(x, y, z);

    // Stone fire ring
    const stoneRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.25, 5, 8), this.mats.stone);
    stoneRing.rotation.x = Math.PI / 2;
    stoneRing.position.y = 0.2;
    fireGroup.add(stoneRing);

    // Burning wood logs
    for (let l = 0; l < 3; l++) {
      const ang = (l * Math.PI) / 3;
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 5), this.mats.woodDark);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = ang;
      log.position.y = 0.25;
      fireGroup.add(log);
    }

    // Warm Campfire Light
    const woodFireLight = new THREE.PointLight(0xf59e0b, 1.3, 14);
    woodFireLight.position.set(0, 1.2, 0);
    woodFireLight.userData.baseIntensity = 1.3;
    fireGroup.add(woodFireLight);
    this.dayNightCycle.registerNightLight(woodFireLight);
    this.animatedObjects.push({ type: 'fire', light: woodFireLight });

    // 2 Log seats
    [-2.2, 2.2].forEach(lx => {
      const logSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.2, 6), this.mats.wood);
      logSeat.rotation.x = Math.PI / 2;
      logSeat.position.set(lx, 0.3, 0);
      fireGroup.add(logSeat);

      this.colliders.push({
        type: 'box',
        minX: x + lx - 0.4,
        maxX: x + lx + 0.4,
        minZ: z - 1.2,
        maxZ: z + 1.2
      });
    });

    parent.add(fireGroup);

    this.colliders.push({
      type: 'cylinder',
      x: x,
      z: z,
      radius: 1.4
    });
  }

  /* -------------------------------------------------------------------------
     3. KRAG'MAR DEMON ENCLAVE (Dark Territory Ash Plains: x ~ -120, z ~ -90)
     ------------------------------------------------------------------------- */
  initDemonEnclave() {
    const demonGroup = new THREE.Group();
    const cx = -120;
    const cz = -90;
    const cy = getTerrainHeight(cx, cz);
    demonGroup.position.set(cx, cy, cz);

    // 3.1 Chieftain's Spired Bone-Keep
    this.createDemonKeep(demonGroup, 0, -14, 16, 12, 4.8);

    // 3.2 Two Basalt Horned Huts
    this.createBasaltHut(demonGroup, -16, 4, 3.8);
    this.createBasaltHut(demonGroup, 16, 4, 3.8);

    // 3.3 Boiling Magma & Sulfur Cauldron
    this.createMagmaCauldron(demonGroup, 0, 2);

    // 3.4 Demon Forging Anvil & Weapon Rack
    this.createDemonForge(demonGroup, 8, -2);

    // 3.5 Spiked Bone Palisades with open entryway
    this.createDemonPalisades(demonGroup);

    this.scene.add(demonGroup);
  }

  createDemonKeep(parent, lx, lz, w, d, h) {
    const keepGroup = new THREE.Group();
    keepGroup.position.set(lx, 0, lz);

    // Obsidian base
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, d), this.mats.obsidian);
    base.position.y = 0.4;
    base.castShadow = true;
    keepGroup.add(base);

    // Dark basalt walls
    const wallMat = this.mats.basalt;
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), wallMat);
    back.position.set(0, h / 2, -d / 2);
    keepGroup.add(back);

    const left = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, d), wallMat);
    left.position.set(-w / 2, h / 2, 0);
    keepGroup.add(left);

    const right = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, d), wallMat);
    right.position.set(w / 2, h / 2, 0);
    keepGroup.add(right);

    // Front wall leaving 3.2m open archway
    const doorW = 3.2;
    const sideW = (w - doorW) / 2;
    const frontL = new THREE.Mesh(new THREE.BoxGeometry(sideW, h, 0.4), wallMat);
    frontL.position.set(-(doorW / 2 + sideW / 2), h / 2, d / 2);
    keepGroup.add(frontL);

    const frontR = new THREE.Mesh(new THREE.BoxGeometry(sideW, h, 0.4), wallMat);
    frontR.position.set((doorW / 2 + sideW / 2), h / 2, d / 2);
    keepGroup.add(frontR);

    // Bone archway over door
    const boneArch = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.18, 5, 8, Math.PI), this.mats.bone);
    boneArch.position.set(0, h - 0.2, d / 2 + 0.1);
    keepGroup.add(boneArch);

    // Curved demon horns on roof corners
    [-w / 2, w / 2].forEach(hx => {
      [-d / 2, d / 2].forEach(hz => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.45, 2.8, 5), this.mats.obsidian);
        horn.position.set(hx, h + 1.2, hz);
        horn.rotation.z = (hx < 0 ? 0.35 : -0.35);
        horn.rotation.x = (hz < 0 ? -0.25 : 0.25);
        horn.castShadow = true;
        keepGroup.add(horn);
      });
    });

    // Stepped Obsidian Pyramid Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) * 0.56, 4.5, 4), this.mats.obsidian);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, h + 2.1, 0);
    roof.castShadow = true;
    keepGroup.add(roof);

    // Floating Nether Flame crystal at roof apex
    const flameMat = new THREE.MeshLambertMaterial({ color: 0xef4444, emissive: 0xb91c1c });
    const netherOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), flameMat);
    netherOrb.position.set(0, h + 4.8, 0);
    keepGroup.add(netherOrb);

    const netherLight = new THREE.PointLight(0xef4444, 1.4, 16);
    netherLight.position.set(0, h + 4.8, 0);
    netherLight.userData.baseIntensity = 1.4;
    keepGroup.add(netherLight);
    this.dayNightCycle.registerNightLight(netherLight);
    this.animatedObjects.push({ type: 'fire', light: netherLight });

    parent.add(keepGroup);

    // Colliders (world coords = cx + lx, cz + lz)
    const wx = -120 + lx;
    const wz = -90 + lz;
    this.colliders.push(
      { type: 'box', minX: wx - w / 2, maxX: wx + w / 2, minZ: wz - d / 2 - 0.3, maxZ: wz - d / 2 + 0.3 },
      { type: 'box', minX: wx - w / 2 - 0.3, maxX: wx - w / 2 + 0.3, minZ: wz - d / 2, maxZ: wz + d / 2 },
      { type: 'box', minX: wx + w / 2 - 0.3, maxX: wx + w / 2 + 0.3, minZ: wz - d / 2, maxZ: wz + d / 2 },
      { type: 'box', minX: wx - w / 2, maxX: wx - doorW / 2, minZ: wz + d / 2 - 0.3, maxZ: wz + d / 2 + 0.3 },
      { type: 'box', minX: wx + doorW / 2, maxX: wx + w / 2, minZ: wz + d / 2 - 0.3, maxZ: wz + d / 2 + 0.3 }
    );
  }

  createBasaltHut(parent, lx, lz, radius) {
    const hut = new THREE.Group();
    hut.position.set(lx, 0, lz);

    // Conical basalt body
    const body = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.7, radius, 3.2, 7), this.mats.basalt);
    body.position.y = 1.6;
    body.castShadow = true;
    body.receiveShadow = true;
    hut.add(body);

    // Spired cap
    const cap = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.85, 2.6, 7), this.mats.obsidian);
    cap.position.y = 3.2 + 1.3;
    cap.castShadow = true;
    hut.add(cap);

    // Horns on sides
    [-radius * 0.6, radius * 0.6].forEach(hx => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.6, 4), this.mats.bone);
      horn.position.set(hx, 3.6, 0);
      horn.rotation.z = (hx < 0 ? 0.6 : -0.6);
      hut.add(horn);
    });

    // Red slit window
    const windowMat = new THREE.MeshLambertMaterial({ color: 0xef4444, emissive: 0xef4444 });
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.2), windowMat);
    win.position.set(0, 1.8, radius * 0.85);
    hut.add(win);

    parent.add(hut);

    this.colliders.push({
      type: 'cylinder',
      x: -120 + lx,
      z: -90 + lz,
      radius: radius + 0.2
    });
  }

  createMagmaCauldron(parent, lx, lz) {
    const cauldronGroup = new THREE.Group();
    cauldronGroup.position.set(lx, 0, lz);

    // Basalt dais
    const dais = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 0.4, 8), this.mats.basalt);
    dais.position.y = 0.2;
    cauldronGroup.add(dais);

    // Heavy iron cauldron
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.8, 1.2, 8), this.mats.iron);
    pot.position.y = 0.9;
    pot.castShadow = true;
    cauldronGroup.add(pot);

    // Boiling magma liquid
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.1, 8), this.mats.lava);
    liquid.position.y = 1.35;
    cauldronGroup.add(liquid);

    // Glowing cauldron light
    const cauldronLight = new THREE.PointLight(0xef4444, 1.4, 12);
    cauldronLight.position.set(0, 1.6, 0);
    cauldronLight.userData.baseIntensity = 1.4;
    cauldronGroup.add(cauldronLight);
    this.dayNightCycle.registerNightLight(cauldronLight);
    this.animatedObjects.push({ type: 'fire', light: cauldronLight });

    parent.add(cauldronGroup);

    this.colliders.push({
      type: 'cylinder',
      x: -120 + lx,
      z: -90 + lz,
      radius: 2.1
    });
  }

  createDemonForge(parent, lx, lz) {
    const forge = new THREE.Group();
    forge.position.set(lx, 0, lz);

    // Obsidian anvil
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.7), this.mats.obsidian);
    anvil.position.y = 0.4;
    anvil.castShadow = true;
    forge.add(anvil);

    // Glowing iron ingot
    const ingot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.25), this.mats.lava);
    ingot.position.set(0, 0.85, 0);
    forge.add(ingot);

    // Weapon display rack
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.0, 1.6), this.mats.iron);
    rack.position.set(1.2, 1.0, 0);
    forge.add(rack);

    parent.add(forge);

    this.colliders.push({
      type: 'box',
      minX: -120 + lx - 1.2,
      maxX: -120 + lx + 1.6,
      minZ: -90 + lz - 1.0,
      maxZ: -90 + lz + 1.0
    });
  }

  createDemonPalisades(parent) {
    // Spiked Bone and Iron Palisade lines
    const pz = 18;
    const px = 24;

    // West fence line
    this.buildDemonPalisadeLine(parent, -px, -20, -px, pz);
    // East fence line
    this.buildDemonPalisadeLine(parent, px, -20, px, pz);
    // South fence line with 5m open gate in center
    this.buildDemonPalisadeLine(parent, -px, pz, -3, pz);
    this.buildDemonPalisadeLine(parent, 3, pz, px, pz);
  }

  buildDemonPalisadeLine(parent, x1, z1, x2, z2) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const count = Math.floor(len / 3.0);

    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = x1 + (x2 - x1) * t;
      const z = z1 + (z2 - z1) * t;

      // Spiked post
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 2.4, 4), this.mats.iron);
      post.position.set(x, 1.2, z);
      post.castShadow = true;
      parent.add(post);

      const skull = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.3), this.mats.bone);
      skull.position.set(x, 2.2, z);
      parent.add(skull);
    }

    // Collider line
    this.colliders.push({
      type: 'box',
      minX: -120 + Math.min(x1, x2) - 0.3,
      maxX: -120 + Math.max(x1, x2) + 0.3,
      minZ: -90 + Math.min(z1, z2) - 0.3,
      maxZ: -90 + Math.max(z1, z2) + 0.3
    });
  }

  /* -------------------------------------------------------------------------
     4. SYLVAHEIM ELVEN GLADE (Enchanted Forest Sanctuary: x ~ -160, z ~ 90)
     ------------------------------------------------------------------------- */
  initElvenGlade() {
    const elvenGroup = new THREE.Group();
    const cx = -160;
    const cz = 90;
    const cy = getTerrainHeight(cx, cz);
    elvenGroup.position.set(cx, cy, cz);

    // 4.1 Living Tree Pavilion / Sanctuary Arbor
    this.createElvenPavilion(elvenGroup, 0, -14, 16, 14, 4.6);

    // 4.2 Two Elven Tree-Bark Cabins
    this.createElvenBarkCabin(elvenGroup, -18, 6, 11, 9, 3.8);
    this.createElvenBarkCabin(elvenGroup, 18, 6, 11, 9, 3.8);

    // 4.3 Luminous Starlight Mana Pool
    this.createManaPool(elvenGroup, 0, 3);

    // 4.4 Harp & Meditation Grove
    this.createElvenHarpGrove(elvenGroup, -8, -2);

    // 4.5 Boundary Flora & Woven Vine Archway
    this.createElvenFloraBoundary(elvenGroup);

    this.scene.add(elvenGroup);
  }

  createElvenPavilion(parent, lx, lz, w, d, h) {
    const pav = new THREE.Group();
    pav.position.set(lx, 0, lz);

    // White marble foundation
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.6, d), this.mats.elvenMarble);
    base.position.y = 0.3;
    base.receiveShadow = true;
    pav.add(base);

    // Slender Jade-wrapped marble columns
    [-w / 2 + 0.8, w / 2 - 0.8].forEach(px => {
      [-d / 2 + 0.8, d / 2 - 0.8].forEach(pz => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.35, h, 6), this.mats.elvenMarble);
        col.position.set(px, h / 2 + 0.3, pz);
        col.castShadow = true;
        pav.add(col);

        const vineRing = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 4, 6), this.mats.jade);
        vineRing.rotation.x = Math.PI / 2;
        vineRing.position.set(px, 1.8, pz);
        pav.add(vineRing);
      });
    });

    // Graceful Jade & Glass Gabled Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) * 0.55, 4.2, 4), this.mats.jade);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, h + 2.0, 0);
    roof.castShadow = true;
    pav.add(roof);

    // Levitating Celestial Star Orb inside pavilion
    const starMat = new THREE.MeshLambertMaterial({ color: 0x38bdf8, emissive: 0x0284c7 });
    const starOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), starMat);
    starOrb.position.set(0, 2.5, 0);
    pav.add(starOrb);

    const starlight = new THREE.PointLight(0x38bdf8, 1.3, 14);
    starlight.position.set(0, 2.5, 0);
    starlight.userData.baseIntensity = 1.3;
    pav.add(starlight);
    this.dayNightCycle.registerNightLight(starlight);
    this.animatedObjects.push({ type: 'fire', light: starlight });

    parent.add(pav);

    const wx = -160 + lx;
    const wz = 90 + lz;
    this.colliders.push(
      { type: 'box', minX: wx - w / 2, maxX: wx + w / 2, minZ: wz - d / 2 - 0.3, maxZ: wz - d / 2 + 0.3 },
      { type: 'box', minX: wx - w / 2 - 0.3, maxX: wx - w / 2 + 0.3, minZ: wz - d / 2, maxZ: wz + d / 2 },
      { type: 'box', minX: wx + w / 2 - 0.3, maxX: wx + w / 2 + 0.3, minZ: wz - d / 2, maxZ: wz + d / 2 }
    );
  }

  createElvenBarkCabin(parent, lx, lz, w, d, h) {
    const cab = new THREE.Group();
    cab.position.set(lx, 0, lz);

    // Organic elder wood body
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this.mats.wood);
    body.position.y = h / 2;
    body.castShadow = true;
    cab.add(body);

    // Doorway opening (2.8m wide)
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.6, 0.4), this.mats.woodDark);
    door.position.set(0, 1.3, d / 2 + 0.1);
    cab.add(door);

    // Mossy Jade Thatch Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) * 0.55, 3.8, 4), this.mats.leafGreen);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, h + 1.8, 0);
    roof.castShadow = true;
    cab.add(roof);

    parent.add(cab);

    const wx = -160 + lx;
    const wz = 90 + lz;
    this.colliders.push({
      type: 'box',
      minX: wx - w / 2 - 0.3,
      maxX: wx + w / 2 + 0.3,
      minZ: wz - d / 2 - 0.3,
      maxZ: wz + d / 2 + 0.3
    });
  }

  createManaPool(parent, lx, lz) {
    const pool = new THREE.Group();
    pool.position.set(lx, 0, lz);

    // Marble pool basin
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.7, 0.6, 8), this.mats.elvenMarble);
    basin.position.y = 0.3;
    basin.receiveShadow = true;
    pool.add(basin);

    // Luminous turquoise mana water
    const water = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.15, 8), this.mats.manaWater);
    water.position.y = 0.5;
    pool.add(water);

    // 4 Floating mana crystals around pool
    for (let c = 0; c < 4; c++) {
      const ang = (c * Math.PI) / 2;
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), this.mats.manaWater);
      crystal.position.set(Math.sin(ang) * 2.3, 1.1, Math.cos(ang) * 2.3);
      pool.add(crystal);
    }

    // Gentle cyan mana light
    const poolLight = new THREE.PointLight(0x06b6d4, 1.4, 14);
    poolLight.position.set(0, 1.2, 0);
    poolLight.userData.baseIntensity = 1.4;
    pool.add(poolLight);
    this.dayNightCycle.registerNightLight(poolLight);
    this.animatedObjects.push({ type: 'fire', light: poolLight });

    parent.add(pool);

    this.colliders.push({
      type: 'cylinder',
      x: -160 + lx,
      z: 90 + lz,
      radius: 2.8
    });
  }

  createElvenHarpGrove(parent, lx, lz) {
    const grove = new THREE.Group();
    grove.position.set(lx, 0, lz);

    // Pedestal
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.5, 6), this.mats.elvenMarble);
    ped.position.y = 0.25;
    grove.add(ped);

    // Low-poly carved wooden harp
    const harpPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 4), this.mats.gold);
    harpPillar.position.set(0.4, 1.15, 0);
    harpPillar.rotation.z = -0.15;
    grove.add(harpPillar);

    const harpFrame = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.07, 4, 8, Math.PI), this.mats.gold);
    harpFrame.position.set(0, 1.2, 0);
    harpFrame.rotation.z = Math.PI / 2;
    grove.add(harpFrame);

    parent.add(grove);

    this.colliders.push({
      type: 'cylinder',
      x: -160 + lx,
      z: 90 + lz,
      radius: 1.1
    });
  }

  createElvenFloraBoundary(parent) {
    // Beautiful flower boundary and fairy arches
    [-22, 22].forEach(fx => {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.25, 4, 8, Math.PI), this.mats.wood);
      arch.position.set(fx, 1.8, 14);
      parent.add(arch);
    });
  }

  /* -------------------------------------------------------------------------
     5. KARAK-VORN UNITED CLANSTEAD ("Dwarves Stay United!": x ~ 105, z ~ 140)
     ------------------------------------------------------------------------- */
  initDwarfUnion() {
    const dwarfGroup = new THREE.Group();
    const cx = 105;
    const cz = 140;
    const cy = getTerrainHeight(cx, cz);
    dwarfGroup.position.set(cx, cy, cz);

    // 5.1 The Grand Clan Unity Longhouse & Mead Hall
    this.createDwarfMeadHall(dwarfGroup, 0, -15, 18, 14, 4.8);

    // 5.2 The Clan Unity Monument ("Dwarves Stand United!")
    this.createClanUnityMonument(dwarfGroup, 0, 4);

    // 5.3 The Brotherhood Forge & Smelting Anvil
    this.createBrotherhoodForge(dwarfGroup, -15, -2);

    // 5.4 Mead Cask Storage & Minecart Rail Depot
    this.createMeadMinecartDepot(dwarfGroup, 15, 1);

    // 5.5 Fortified Mountain Granite Wall Perimeter
    this.createDwarfGraniteWalls(dwarfGroup);

    this.scene.add(dwarfGroup);
  }

  createDwarfMeadHall(parent, lx, lz, w, d, h) {
    const hall = new THREE.Group();
    hall.position.set(lx, 0, lz);

    // Heavy mountain stone foundation
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d), this.mats.dwarfStone);
    base.position.y = 0.6;
    base.receiveShadow = true;
    hall.add(base);

    // Timber & Stone walls
    const wallMat = this.mats.woodDark;
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), wallMat);
    back.position.set(0, h / 2, -d / 2);
    hall.add(back);

    const left = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, d), wallMat);
    left.position.set(-w / 2, h / 2, 0);
    hall.add(left);

    const right = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, d), wallMat);
    right.position.set(w / 2, h / 2, 0);
    hall.add(right);

    // Front wall leaving 3.8m wide entrance
    const doorW = 3.8;
    const sideW = (w - doorW) / 2;
    const frontL = new THREE.Mesh(new THREE.BoxGeometry(sideW, h, 0.4), wallMat);
    frontL.position.set(-(doorW / 2 + sideW / 2), h / 2, d / 2);
    hall.add(frontL);

    const frontR = new THREE.Mesh(new THREE.BoxGeometry(sideW, h, 0.4), wallMat);
    frontR.position.set((doorW / 2 + sideW / 2), h / 2, d / 2);
    hall.add(frontR);

    // Crossed Giant Battleaxes above the hall door (Symbol of Clan Unity)
    [-0.5, 0.5].forEach(ax => {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 4), this.mats.wood);
      handle.position.set(ax * 0.4, h + 0.5, d / 2 + 0.1);
      handle.rotation.z = (ax < 0 ? 0.75 : -0.75);
      hall.add(handle);

      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.1), this.mats.bronze);
      blade.position.set(ax * 1.0, h + 1.2, d / 2 + 0.12);
      hall.add(blade);
    });

    // Heavy Mountain Slate Gabled Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) * 0.58, 4.8, 4), this.mats.dwarfStone);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, h + 2.2, 0);
    roof.castShadow = true;
    hall.add(roof);

    // Interior long mead table & ale barrels
    const table = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.8, 2.2), this.mats.wood);
    table.position.set(0, 0.6, -1.0);
    hall.add(table);

    [-3.0, 3.0].forEach(bx => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 1.4, 6), this.mats.wood);
      barrel.position.set(bx, 0.7, 3.5);
      hall.add(barrel);
    });

    parent.add(hall);

    const wx = 105 + lx;
    const wz = 140 + lz;
    this.colliders.push(
      { type: 'box', minX: wx - w / 2, maxX: wx + w / 2, minZ: wz - d / 2 - 0.3, maxZ: wz - d / 2 + 0.3 },
      { type: 'box', minX: wx - w / 2 - 0.3, maxX: wx - w / 2 + 0.3, minZ: wz - d / 2, maxZ: wz + d / 2 },
      { type: 'box', minX: wx + w / 2 - 0.3, maxX: wx + w / 2 + 0.3, minZ: wz - d / 2, maxZ: wz + d / 2 },
      { type: 'box', minX: wx - w / 2, maxX: wx - doorW / 2, minZ: wz + d / 2 - 0.3, maxZ: wz + d / 2 + 0.3 },
      { type: 'box', minX: wx + doorW / 2, maxX: wx + w / 2, minZ: wz + d / 2 - 0.3, maxZ: wz + d / 2 + 0.3 }
    );
  }

  createClanUnityMonument(parent, lx, lz) {
    const mon = new THREE.Group();
    mon.position.set(lx, 0, lz);

    // Hexagonal stone dais
    const dais = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.8, 6), this.mats.dwarfStone);
    dais.position.y = 0.4;
    dais.castShadow = true;
    dais.receiveShadow = true;
    mon.add(dais);

    // 4 Colossal Interlocked Bronze Tower Shields (Facing Outward)
    for (let s = 0; s < 4; s++) {
      const ang = (s * Math.PI) / 2;
      const shield = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.25), this.mats.bronze);
      shield.position.set(Math.sin(ang) * 1.8, 1.8, Math.cos(ang) * 1.8);
      shield.rotation.y = ang;
      shield.castShadow = true;
      mon.add(shield);
    }

    // Central Glowing Golden Anvil of Unity
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.9), this.mats.gold);
    anvil.position.y = 1.4;
    anvil.castShadow = true;
    mon.add(anvil);

    // Crossed Warhammers on the Anvil
    [-0.3, 0.3].forEach(hx => {
      const hammer = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 4), this.mats.wood);
      hammer.position.set(hx * 0.6, 2.3, 0);
      hammer.rotation.z = (hx < 0 ? 0.6 : -0.6);
      mon.add(hammer);

      const hHead = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.35), this.mats.iron);
      hHead.position.set(hx * 1.1, 2.8, 0);
      mon.add(hHead);
    });

    // Warm Golden Clan Light
    const clanLight = new THREE.PointLight(0xf59e0b, 1.5, 14);
    clanLight.position.set(0, 2.2, 0);
    clanLight.userData.baseIntensity = 1.5;
    mon.add(clanLight);
    this.dayNightCycle.registerNightLight(clanLight);
    this.animatedObjects.push({ type: 'fire', light: clanLight });

    parent.add(mon);

    this.colliders.push({
      type: 'cylinder',
      x: 105 + lx,
      z: 140 + lz,
      radius: 3.8
    });
  }

  createBrotherhoodForge(parent, lx, lz) {
    const forge = new THREE.Group();
    forge.position.set(lx, 0, lz);

    // Stone hearth
    const hearth = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 2.2), this.mats.dwarfStone);
    hearth.position.y = 0.7;
    hearth.castShadow = true;
    forge.add(hearth);

    // Glowing coals
    const coals = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 1.2), this.mats.lava);
    coals.position.y = 1.45;
    forge.add(coals);

    // Heavy iron anvil
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.7), this.mats.iron);
    anvil.position.set(0, 0.4, 2.2);
    anvil.castShadow = true;
    forge.add(anvil);

    // Water barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.5, 1.1, 6), this.mats.wood);
    barrel.position.set(-1.8, 0.55, 1.2);
    forge.add(barrel);

    parent.add(forge);

    this.colliders.push({
      type: 'box',
      minX: 105 + lx - 2.2,
      maxX: 105 + lx + 1.6,
      minZ: 140 + lz - 1.4,
      maxZ: 140 + lz + 2.8
    });
  }

  createMeadMinecartDepot(parent, lx, lz) {
    const depot = new THREE.Group();
    depot.position.set(lx, 0, lz);

    // Steel rails
    [-0.5, 0.5].forEach(rx => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 6.0), this.mats.iron);
      rail.position.set(rx, 0.1, 0);
      depot.add(rail);
    });

    // Minecart with ore
    const cart = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 2.2), this.mats.iron);
    cart.position.set(0, 0.6, 0);
    cart.castShadow = true;
    depot.add(cart);

    const ore = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.4, 1.9), this.mats.gold);
    ore.position.set(0, 0.95, 0);
    depot.add(ore);

    // Stacked ale casks
    [-1.6, 1.6].forEach(bx => {
      const cask = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.2, 6), this.mats.wood);
      cask.position.set(bx, 0.6, 1.5);
      depot.add(cask);
    });

    parent.add(depot);

    this.colliders.push({
      type: 'box',
      minX: 105 + lx - 2.2,
      maxX: 105 + lx + 2.2,
      minZ: 140 + lz - 3.2,
      maxZ: 140 + lz + 3.2
    });
  }

  createDwarfGraniteWalls(parent) {
    // Sturdy perimeter low granite walls with an open gate
    const w = 24;
    const d = 20;

    // West wall
    const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, d * 2), this.mats.dwarfStone);
    wallW.position.set(-w, 0.7, 0);
    wallW.castShadow = true;
    parent.add(wallW);

    // East wall
    const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, d * 2), this.mats.dwarfStone);
    wallE.position.set(w, 0.7, 0);
    wallE.castShadow = true;
    parent.add(wallE);

    this.colliders.push(
      { type: 'box', minX: 105 - w - 0.5, maxX: 105 - w + 0.5, minZ: 140 - d, maxZ: 140 + d },
      { type: 'box', minX: 105 + w - 0.5, maxX: 105 + w + 0.5, minZ: 140 - d, maxZ: 140 + d }
    );
  }

  /* -------------------------------------------------------------------------
     6. VILLAGER & SETTLER LIVING GROUP NPCs (All Realms & Factions)
     ------------------------------------------------------------------------- */
  initVillagerNPCs() {
    const villagersData = [
      // --- OAKHAVEN AGRICULTURAL VILLAGE ---
      {
        id: 'villager_bran',
        name: 'Farmer Bran',
        badge: '🌾 Oakhaven Elder',
        title: 'Head Farmer of Oakhaven Hamlet',
        race: 'human',
        age: 52,
        lifespan: '75 – 100 Years',
        color: '#16a34a',
        role: 'tilling',
        x: 82,
        z: -10,
        tunicColor: 0x78350f,
        hatType: 'straw',
        toolType: 'hoe',
        dialogues: [
          "Welcome to Oakhaven! Humans know how to work the soil and build honest towns—not like elven snobs singing to tree bark!",
          "The elves think they're high nobility, but they don't even know how to hold a plow. Human farming feeds the realm!",
          "We keep our pitchforks sharp. If Malakor's sulfur demons ever try crossing the river, every farmer here will fight!",
          "Hard work, grain harvest, and human grit—that's what built the Kingdom of Valoria."
        ]
      },
      {
        id: 'villager_maeve',
        name: 'Maeve the Harvester',
        badge: '🧺 Harvester',
        title: 'Vegetable & Gourd Harvester',
        race: 'human',
        age: 28,
        lifespan: '75 – 100 Years',
        color: '#22c55e',
        role: 'harvesting',
        x: 104,
        z: -12,
        tunicColor: 0x15803d,
        hatType: 'straw',
        toolType: 'basket',
        dialogues: [
          "Good day! Look at these cabbages—firm as shields and sweet as honey from our morning dew.",
          "Dwarves tried trading us iron turnip peelers last month. Heavy, noisy contraptions that sliced the table in half! We do fine with simple human tools.",
          "Young Pip dreams of fighting demons. I told him he'll need a full stomach of Valorian stew before facing brimstone fiends!",
          "Our produce feeds the Citadel garrison. We humans take pride in what we grow with our own hands."
        ]
      },
      {
        id: 'villager_pip',
        name: 'Young Pip',
        badge: '🥖 Farmhand',
        title: 'Eager Village Farmhand',
        race: 'human',
        age: 14,
        lifespan: '75 – 100 Years',
        color: '#f59e0b',
        role: 'raking',
        x: 88,
        z: 32,
        tunicColor: 0xd97706,
        hatType: 'cap',
        toolType: 'rake',
        dialogues: [
          "Woah! Are you an adventurer?! Have you seen the glowing moon trees in the Elven Forest?",
          "Farmer Bran says if I finish weeding the pumpkin patch by sunset, he'll let me ride the cart to the river bridge!",
          "I saw a knight on a massive white warhorse gallop past this morning! One day I'll ride like that!",
          "Watch out for the big pumpkins—some of them weigh more than a sheep!"
        ]
      },
      {
        id: 'villager_elspeth',
        name: 'Elder Elspeth',
        badge: '👵 Village Matron',
        title: 'Storyteller of the Valley',
        race: 'human',
        age: 79,
        lifespan: '75 – 100 Years',
        color: '#ec4899',
        role: 'sitting',
        x: 114,
        z: 14,
        tunicColor: 0x831843,
        hatType: 'coif',
        toolType: 'bread',
        dialogues: [
          "Sit by the fire a moment, traveler. Warm your bones and take a bite of fresh oven hearth bread.",
          "I remember when the Demon King's spires first rose beyond the river. Master Vance fought bravely back then.",
          "The four realms have known peace for years now, but an old woman can feel when magic stirs in the wind.",
          "May the harvest stars shine kindly on your travels, young one."
        ]
      },
      {
        id: 'villager_tobin',
        name: 'Tobin the Carter',
        badge: '📦 Grain Merchant',
        title: 'Village Wagon Driver',
        race: 'human',
        age: 35,
        lifespan: '75 – 100 Years',
        color: '#0284c7',
        role: 'standing',
        x: 120,
        z: -5,
        tunicColor: 0x1e3a8a,
        hatType: 'cap',
        toolType: 'sack',
        dialogues: [
          "Loading the last sacks of grain for the Citadel garrison. The road to the town gate is clear today.",
          "My wagon wheels take a beating on the stone bridge, but there's no better route across the continent.",
          "Need directions? Head North for King Reginald's castle, South for the Dwarven mountain blast furnaces!"
        ]
      },

      // --- FERNBROOK WOODLAND ORCHARD HAMLET ---
      {
        id: 'villager_cedric',
        name: 'Forester Cedric',
        badge: '🪓 Woodland Forester',
        title: 'Caretaker of Fernbrook',
        race: 'human',
        age: 46,
        lifespan: '75 – 100 Years',
        color: '#10b981',
        role: 'carving',
        x: -78,
        z: 108,
        tunicColor: 0x064e3b,
        hatType: 'cap',
        toolType: 'knife',
        dialogues: [
          "Greetings, traveler. Welcome to Fernbrook. We live quietly here on the verge of the Elven woods.",
          "The elves leave us in peace so long as we tend the trees with respect. They even trade sweet sap with us.",
          "Beware the wild wolves and corrupted treants in the southern jungle. If you travel that way, keep your steel drawn.",
          "These apple trees were planted fifty winters ago. Best cider in the western continent."
        ]
      },
      {
        id: 'villager_rowan',
        name: 'Rowan the Herbalist',
        badge: '🌿 Village Herbalist',
        title: 'Keeper of the Garden Beds',
        race: 'human',
        age: 31,
        lifespan: '75 – 100 Years',
        color: '#8b5cf6',
        role: 'tending',
        x: -68,
        z: 98,
        tunicColor: 0x581c87,
        hatType: 'coif',
        toolType: 'pouch',
        dialogues: [
          "Shh... listen to the bees hum. They make the sweetest clover honey from our garden beds.",
          "This purple lavender calms the spirit, and the blue dew-lilies can soothe even a demon flame scorch.",
          "The Elven rangers occasionally stop by to trade seeds from their sacred Moon Spire.",
          "Tread gently near the flowerbeds, friend. Nature rewards those who walk with patience."
        ]
      },
      {
        id: 'villager_barnaby',
        name: 'Old Barnaby',
        badge: '🐑 Shepherd',
        title: 'River Watcher',
        color: '#64748b',
        role: 'leaning',
        race: 'human',
        age: 71,
        lifespan: '75 – 100 Years',
        x: -82,
        z: 120,
        tunicColor: 0x334155,
        hatType: 'straw',
        toolType: 'staff',
        dialogues: [
          "Ah, a traveler! The river flows steady today. Fish are jumping by the willow banks.",
          "I used to walk all the way to the Dwarven city when my knees were younger. Those giant gears are a sight to behold!",
          "Nothing like the quiet life here in Fernbrook. Fire crackles, sheep graze, and stars watch over us."
        ]
      },

      // --- KRAG'MAR DEMON ENCLAVE ---
      {
        id: 'villager_demon_torok',
        name: 'Torok the Fire-Smith',
        badge: '🔨 Demon Fire-Smith',
        title: 'Master Forger of Krag\'mar',
        color: '#ef4444',
        role: 'smithing',
        race: 'demon',
        age: 1400,
        lifespan: 'Ageless / Eternal',
        x: -112,
        z: -92,
        tunicColor: 0x18181b,
        hatType: 'horns',
        toolType: 'hammer',
        dialogues: [
          "Cursed iron tempered in nether magma! We demons hate everyone, and all mortal weaklings fear our blades!",
          "The elves sing to trees and the dwarves drool over clockwork cogs. Both will be pulverized into cinder and slag!",
          "Lord Malakor commands our fury! We forge the barbed spears that shall pierce both elven glades and human citadels!"
        ]
      },
      {
        id: 'villager_demon_vespera',
        name: 'Vespera the Shadow Witch',
        badge: '🔮 Nether Sorceress',
        title: 'Weaver of Brimstone',
        color: '#a855f7',
        role: 'stirring',
        race: 'demon',
        age: 2800,
        lifespan: 'Ageless / Eternal',
        x: -120,
        z: -84,
        tunicColor: 0x3b0764,
        hatType: 'horns',
        toolType: 'staff',
        dialogues: [
          "The sulfur cauldron whispers doom for all surface dwellers. We despise mortals and their fragile treaties!",
          "An elven noble thinks her starlight is eternal? A single drop of this nether brew will dissolve her silk gown and flesh in seconds!",
          "Step back from the cauldron, fleshling, unless you desire to feed the purple soul-flames!"
        ]
      },
      {
        id: 'villager_demon_gorgar',
        name: 'Gorgar the Horned Raider',
        badge: '⚔️ Demon Sentry',
        title: 'Guardian of Krag\'mar Gate',
        color: '#dc2626',
        role: 'guarding',
        race: 'demon',
        age: 820,
        lifespan: 'Ageless / Eternal',
        x: -128,
        z: -80,
        tunicColor: 0x450a0a,
        hatType: 'horns',
        toolType: 'cleaver',
        dialogues: [
          "Halt! Krag'mar is sovereign demon territory! We hate humans, we hate elves, and we hate dwarves! Move before I cleave you!",
          "Those dwarven tunnel rats think their steel armor is tough. My heavy bone cleaver will split their helms like squash!",
          "Move along, fleshling. No outsider sets foot in this enclave while I draw breath!"
        ]
      },

      // --- SYLVAHEIM ELVEN GLADE ---
      {
        id: 'villager_elf_aeloria',
        name: 'Aeloria Starweaver',
        badge: '✨ Elven Songstress',
        title: 'Harpist of the Sacred Glade',
        color: '#38bdf8',
        role: 'playing_lyre',
        race: 'elf',
        age: 760,
        lifespan: '1,500 – 3,000+ Years',
        x: -156,
        z: 88,
        tunicColor: 0x0284c7,
        hatType: 'circlet',
        toolType: 'lyre',
        dialogues: [
          "May the starlight grace your path. Listen closely—only celestial elven nobility can channel the true harmony of the cosmos.",
          "Humans live in mud and dwarves choke on soot. Neither race possesses the breeding or poise to understand our art.",
          "We tolerate the human farmers of Fernbrook because they remain quiet, but dwarves with their clattering gears are strictly forbidden here!"
        ]
      },
      {
        id: 'villager_elf_kaelen',
        name: 'Kaelen Whisperwind',
        badge: '🏹 Canopy Ranger',
        title: 'Pathfinder of the Wilds',
        color: '#10b981',
        role: 'patrolling',
        race: 'elf',
        age: 530,
        lifespan: '1,500 – 3,000+ Years',
        x: -168,
        z: 86,
        tunicColor: 0x047857,
        hatType: 'circlet',
        toolType: 'bow',
        dialogues: [
          "My moon-silk bow never misses. The high nobility of Sylvaheim bows to neither human kings nor dwarven contraptions.",
          "Dwarves boast of their steam engines—vulgar machines that defile nature! A single arrow into their pressure valve brings silence.",
          "And demons? Savage, brainless brutes. They despise everyone simply because they lack both soul and culture."
        ]
      },
      {
        id: 'villager_elf_elyndra',
        name: 'Sylph Master Elyndra',
        badge: '🌿 Mana Botanist',
        title: 'Keeper of the Starlight Pool',
        color: '#06b6d4',
        role: 'gathering',
        race: 'elf',
        age: 1100,
        lifespan: '1,500 – 3,000+ Years',
        x: -160,
        z: 98,
        tunicColor: 0x0f766e,
        hatType: 'circlet',
        toolType: 'phial',
        dialogues: [
          "This starlight mana pool is fed by celestial dew. Only elven nobility has the refined spirit to commune with such purity.",
          "Dwarves would probably try to pump this sacred water into a steam boiler! The mere thought nauseates me.",
          "We preserve what is eternal. Mortals rush, demons rage, but elven nobility endures forever."
        ]
      },

      // --- KARAK-VORN UNITED CLANSTEAD ("Dwarves Stay United!") ---
      {
        id: 'villager_dwarf_thordak',
        name: 'Clan Chief Thordak Ironbrow',
        badge: '👑 Clan Chieftain',
        title: 'Leader of the United Stonefolk',
        color: '#f59e0b',
        role: 'rallying',
        race: 'dwarf',
        age: 260,
        lifespan: '350 – 500 Years',
        x: 105,
        z: 138,
        tunicColor: 0x78350f,
        hatType: 'helm',
        toolType: 'banner',
        dialogues: [
          "A single stone may chip, but the mountain never falls! Dwarven technology and clan brotherhood rule this continent!",
          "Those prancing elf nobles look down their noses at our grease! Let's see their moonlight poetry turn a twenty-ton iron blast gear!",
          "And demons? They hate everyone, but their flaming horns crack just fine under a steam-driven pneumatic forge hammer!",
          "United we stand! Grab a tankard of Dragon-Bane Stout—real technology and real brotherhood happen right here!"
        ]
      },
      {
        id: 'villager_dwarf_bardin',
        name: 'Bardin the Runesmith',
        badge: '⚒️ Clan Runesmith',
        title: 'Master of the Brotherhood Anvil',
        color: '#d97706',
        role: 'smithing',
        race: 'dwarf',
        age: 310,
        lifespan: '350 – 500 Years',
        x: 92,
        z: 136,
        tunicColor: 0x44403c,
        hatType: 'helm',
        toolType: 'hammer',
        dialogues: [
          "Every rune I strike channels masterwork dwarven engineering! Human woodwork rots and elven magic flickers, but forged iron is eternal!",
          "An elf noble called our foundries 'noisy'. I told him our machines forge the armor that keeps demons from roasting his pretty ears!",
          "Technology, steam, and brotherhood! When dwarven gears turn, even mountains get out of the way!"
        ]
      },
      {
        id: 'villager_dwarf_gunnar',
        name: 'Gunnar Keg-Tapper',
        badge: '🍺 Master Brewer',
        title: 'Quartermaster of the Mead Hall',
        color: '#b45309',
        role: 'drinking',
        race: 'dwarf',
        age: 190,
        lifespan: '350 – 500 Years',
        x: 114,
        z: 142,
        tunicColor: 0x92400e,
        hatType: 'helm',
        toolType: 'tankard',
        dialogues: [
          "Dragon-Bane Stout! Brewed with high-pressure steam boilers and mountain barley! Dwarven brewing technology at its absolute peak!",
          "Elves sip dew-water and pass out in five minutes! Hah! It takes real dwarven constitution and mechanical genius to handle this keg!",
          "Skål to the brotherhood! Let the demons burn and the elves sneer—we've got machines, stout, and unbreakable clan unity!"
        ]
      }
    ];

    villagersData.forEach(vd => {
      const y = getTerrainHeight(vd.x, vd.z);
      const { group, animNodes } = this.buildVillagerModel(vd);
      group.position.set(vd.x, y, vd.z);

      // Create floating 2D billboard badge above head
      const badgeSprite = this.createVillagerBadge(vd);
      badgeSprite.position.set(0, 2.9, 0);
      group.add(badgeSprite);

      this.scene.add(group);

      this.villagers.push({
        config: {
          id: vd.id,
          name: vd.name,
          badge: vd.badge,
          title: vd.title,
          color: vd.color,
          race: vd.race || 'human',
          age: vd.age,
          lifespan: vd.lifespan,
          dialogues: vd.dialogues,
          isVillager: true,
          isPlayable: false
        },
        group: group,
        animNodes: animNodes,
        baseY: y,
        worldPos: new THREE.Vector3(vd.x, y, vd.z),
        role: vd.role
      });

      // Villager cylinder collider (stops player from walking directly through)
      this.colliders.push({
        type: 'cylinder',
        x: vd.x,
        z: vd.z,
        radius: 0.75
      });
    });
  }

  buildVillagerModel(vd) {
    const root = new THREE.Group();
    const anim = { torso: null, head: null, armL: null, armR: null, tool: null };

    const isDwarf = (vd.race === 'dwarf');
    const isDemon = (vd.race === 'demon');
    const isElf = (vd.race === 'elf');

    // Skin tones
    let skinColor = 0xffdbac;
    if (isDemon) {
      skinColor = (vd.id.includes('vespera') ? 0x581c87 : 0xb91c1c);
    } else if (isElf) {
      skinColor = 0xffeedb;
    }

    const skinMat = new THREE.MeshLambertMaterial({ color: skinColor, flatShading: true });
    const tunicMat = new THREE.MeshLambertMaterial({ color: vd.tunicColor, flatShading: true });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x27272a, flatShading: true });
    const bootsMat = new THREE.MeshLambertMaterial({ color: 0x3f3f46, flatShading: true });
    const strawMat = new THREE.MeshLambertMaterial({ color: 0xfde047, flatShading: true });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });

    // Torso proportions (stouter for dwarves)
    const tW = isDwarf ? 0.92 : 0.75;
    const tH = isDwarf ? 0.85 : 0.95;
    const tD = isDwarf ? 0.55 : 0.45;
    const torsoY = isDwarf ? 1.05 : 1.25;

    const torso = new THREE.Mesh(new THREE.BoxGeometry(tW, tH, tD), tunicMat);
    torso.position.y = torsoY;
    torso.castShadow = true;
    root.add(torso);
    anim.torso = torso;

    // Belt & Pouch
    const belt = new THREE.Mesh(new THREE.BoxGeometry(tW + 0.04, 0.15, tD + 0.04), this.mats.woodDark);
    belt.position.set(0, -tH * 0.35, 0);
    torso.add(belt);

    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.18), this.mats.wood);
    pouch.position.set(tW * 0.36, -tH * 0.35, tD * 0.52);
    torso.add(pouch);

    // Demon shoulder spikes
    if (isDemon) {
      [-tW / 2 - 0.1, tW / 2 + 0.1].forEach(sx => {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.4, 4), this.mats.obsidian);
        spike.position.set(sx, tH * 0.45, 0);
        spike.rotation.z = (sx < 0 ? 0.5 : -0.5);
        torso.add(spike);
      });
    }

    // Head
    const headY = torsoY + tH / 2 + 0.3;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.5, 0.46), skinMat);
    head.position.y = headY;
    head.castShadow = true;
    root.add(head);
    anim.head = head;

    // Race Headwear / Features
    if (isDemon) {
      // Curved demon horns
      [-0.2, 0.2].forEach(hx => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.7, 4), this.mats.obsidian);
        horn.position.set(hx, 0.32, -0.05);
        horn.rotation.z = (hx < 0 ? -0.4 : 0.4);
        horn.rotation.x = -0.3;
        head.add(horn);
      });
    } else if (isElf) {
      // Pointed elven ears
      [-0.27, 0.27].forEach(ex => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 4), skinMat);
        ear.position.set(ex, 0.05, -0.05);
        ear.rotation.z = (ex < 0 ? Math.PI / 3 : -Math.PI / 3);
        head.add(ear);
      });

      // Gold or silver circlet
      const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 4, 8), this.mats.gold);
      circlet.position.set(0, 0.12, 0);
      circlet.rotation.x = Math.PI / 2;
      head.add(circlet);
    } else if (isDwarf) {
      // Braided dwarven beard over chest
      const beardCol = (vd.id.includes('bardin') ? 0xd4d4d8 : (vd.id.includes('gunnar') ? 0xb45309 : 0x78350f));
      const beardMat = new THREE.MeshLambertMaterial({ color: beardCol, flatShading: true });
      const beard = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.65, 0.26), beardMat);
      beard.position.set(0, -0.35, 0.16);
      head.add(beard);

      // Horned clan helmet
      const helm = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.22, 0.54), this.mats.iron);
      helm.position.set(0, 0.25, 0);
      head.add(helm);

      [-0.32, 0.32].forEach(hx => {
        const hHorn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.4, 4), this.mats.bronze);
        hHorn.position.set(hx, 0.26, 0);
        hHorn.rotation.z = (hx < 0 ? -0.5 : 0.5);
        head.add(hHorn);
      });
    } else if (vd.hatType === 'straw') {
      // Human straw hat
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 8), strawMat);
      brim.position.set(0, 0.26, 0);
      head.add(brim);

      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.35, 8), strawMat);
      crown.position.set(0, 0.46, 0);
      head.add(crown);
    } else if (vd.hatType === 'cap') {
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.52), hairMat);
      cap.position.set(0, 0.26, 0);
      head.add(cap);
    } else {
      const coif = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 0.5), this.mats.cloth);
      coif.position.set(0, 0.12, -0.04);
      head.add(coif);
    }

    // Legs & Boots
    const legH = isDwarf ? 0.45 : 0.55;
    const legY = isDwarf ? 0.5 : 0.65;
    [-0.2, 0.2].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, legH, 0.32), pantsMat);
      leg.position.set(lx, legY, 0);
      leg.castShadow = true;
      root.add(leg);

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.32, 0.42), bootsMat);
      boot.position.set(lx, 0.16, 0.05);
      boot.castShadow = true;
      root.add(boot);
    });

    // Arms & Hands
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.22), tunicMat);
    armL.position.set(-(tW / 2 + 0.12), torsoY, 0);
    root.add(armL);
    anim.armL = armL;

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.72, 0.22), tunicMat);
    armR.position.set(tW / 2 + 0.12, torsoY, 0);
    root.add(armR);
    anim.armR = armR;

    // Handheld Tools & Items (Faction weapons, farming implements, clan standards)
    const toolGroup = new THREE.Group();

    if (vd.toolType === 'hoe') {
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 4), this.mats.wood);
      shaft.position.set(0.3, -0.2, 0.4);
      shaft.rotation.x = 0.5;
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.05), this.mats.iron);
      blade.position.set(0.3, -0.9, 0.85);
      blade.rotation.x = -0.5;
      toolGroup.add(shaft);
      toolGroup.add(blade);
    } else if (vd.toolType === 'basket') {
      const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.45, 6), this.mats.wood);
      basket.position.set(0, -0.15, 0.45);
      const cab = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), this.mats.cabbage);
      cab.position.set(0, 0.1, 0.45);
      toolGroup.add(basket);
      toolGroup.add(cab);
    } else if (vd.toolType === 'rake') {
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.7, 4), this.mats.wood);
      shaft.position.set(0.2, -0.1, 0.3);
      shaft.rotation.x = 0.4;
      const tines = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.15), this.mats.wood);
      tines.position.set(0.2, -0.85, 0.75);
      toolGroup.add(shaft);
      toolGroup.add(tines);
    } else if (vd.toolType === 'hammer') {
      // Forging warhammer (Torok or Bardin)
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.3, 4), this.mats.wood);
      shaft.position.set(0.35, 0.1, 0.25);
      shaft.rotation.x = 0.3;
      const hHead = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.3), (isDemon ? this.mats.obsidian : this.mats.iron));
      hHead.position.set(0.35, 0.65, 0.25);
      toolGroup.add(shaft);
      toolGroup.add(hHead);
    } else if (vd.toolType === 'cleaver') {
      // Demon Cleaver
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.1, 0.08), this.mats.iron);
      blade.position.set(0.35, 0.2, 0.2);
      toolGroup.add(blade);
    } else if (vd.toolType === 'lyre') {
      // Elven Lyre
      const lyre = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 4, 8, Math.PI), this.mats.gold);
      lyre.position.set(0.28, 0, 0.25);
      toolGroup.add(lyre);
    } else if (vd.toolType === 'bow') {
      // Elven Ranger Bow
      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.04, 4, 8, Math.PI), this.mats.wood);
      bow.position.set(-0.35, 0.2, -0.15);
      bow.rotation.y = Math.PI / 2;
      toolGroup.add(bow);
    } else if (vd.toolType === 'banner') {
      // United Clan Standard ("Dwarves Stay United!")
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 4), this.mats.wood);
      pole.position.set(0.45, 0.5, 0.1);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 0.55), this.mats.gold);
      flag.position.set(0.9, 1.3, 0.1);
      toolGroup.add(pole);
      toolGroup.add(flag);
    } else if (vd.toolType === 'tankard') {
      // Dwarven Mead Tankard
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.45, 6), this.mats.wood);
      mug.position.set(0.35, -0.05, 0.3);
      toolGroup.add(mug);
    } else if (vd.toolType === 'phial') {
      const phial = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), this.mats.manaWater);
      phial.position.set(0.32, -0.1, 0.25);
      toolGroup.add(phial);
    } else if (vd.toolType === 'staff') {
      const crook = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 5), this.mats.wood);
      crook.position.set(0.45, -0.1, 0.2);
      crook.rotation.z = -0.1;
      toolGroup.add(crook);
    }

    torso.add(toolGroup);
    anim.tool = toolGroup;

    // Ground blob shadow
    const blobShadow = new THREE.Mesh(
      new THREE.CircleGeometry(isDwarf ? 0.65 : 0.55, 8),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 })
    );
    blobShadow.rotation.x = -Math.PI / 2;
    blobShadow.position.y = 0.04;
    root.add(blobShadow);

    return { group: root, animNodes: anim };
  }

  createVillagerBadge(vd) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 76;
    const ctx = canvas.getContext('2d');

    // Rounded background badge pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = vd.color;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(6, 6, 244, 64, 14);
    ctx.fill();
    ctx.stroke();

    // Badge Title & Name
    ctx.fillStyle = vd.color;
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(vd.badge, 128, 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(vd.name, 128, 56);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.0, 0.9, 1);
    return sprite;
  }

  update(delta, playerPos) {
    const time = performance.now() * 0.0025;

    // 1. Animate campfire & fire lights flickering
    this.animatedObjects.forEach(obj => {
      if (obj.type === 'fire' && obj.light) {
        const base = obj.light.userData.baseIntensity || 1.2;
        obj.light.intensity = base + Math.sin(time * 6.0) * 0.25 + Math.cos(time * 11.0) * 0.15;
      }
    });

    if (!playerPos) return;

    let nearest = null;
    let minDist = 4.5; // Interaction trigger radius

    // 2. Animate villagers and track nearest for dialogue
    this.villagers.forEach(v => {
      // Idle & role animations
      if (v.animNodes.torso) {
        if (v.role === 'tilling' || v.role === 'raking') {
          v.animNodes.torso.position.y = (v.animNodes.torso.position.y || 1.25);
          v.animNodes.torso.rotation.x = 0.15 + Math.sin(time * 2.2) * 0.12;
        } else if (v.role === 'smithing') {
          // Hammering anvil stroke
          if (v.animNodes.armR) {
            v.animNodes.armR.rotation.x = -0.4 + Math.sin(time * 4.0) * 0.55;
          }
        } else if (v.role === 'drinking') {
          // Raising tankard to mouth
          if (v.animNodes.armR) {
            v.animNodes.armR.rotation.x = -0.6 + Math.sin(time * 1.5) * 0.3;
          }
        } else if (v.role === 'playing_lyre') {
          if (v.animNodes.armR) {
            v.animNodes.armR.position.x = 0.48 + Math.sin(time * 2.5) * 0.05;
          }
        } else {
          v.animNodes.torso.rotation.x = 0;
        }
      }

      // Check distance to player
      const dist = Math.hypot(playerPos.x - v.worldPos.x, playerPos.z - v.worldPos.z);
      if (dist < minDist) {
        minDist = dist;
        nearest = v.config;

        // Turn settler smoothly to face player when nearby
        const targetAngle = Math.atan2(playerPos.x - v.worldPos.x, playerPos.z - v.worldPos.z);
        v.group.rotation.y = targetAngle;
      }
    });

    this.currentNearbyVillager = nearest;
  }

  getNearbyVillager() {
    return this.currentNearbyVillager;
  }
}

