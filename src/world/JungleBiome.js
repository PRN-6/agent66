import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';

export class JungleBiome {
  constructor(scene, dayNightCycle) {
    this.scene = scene;
    this.dayNightCycle = dayNightCycle;
    this.colliders = [];
    this.interactiveObjects = [];

    this.initTrees();
    this.initPalms();
    this.initRocksAndFerns();
    this.initAncientTemple();
    this.initSuspensionBridge();
    this.initCrossroadsMonument();
  }

  initTrees() {
    // 350 giant jungle canopy trees using InstancedMesh
    const treeCount = 380;

    // Trunk geometry: 6-sided cylinder
    const trunkGeom = new THREE.CylinderGeometry(0.5, 0.9, 8, 6);
    trunkGeom.translate(0, 4, 0);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a2c11, flatShading: true });
    const trunkInst = new THREE.InstancedMesh(trunkGeom, trunkMat, treeCount);
    trunkInst.castShadow = true;
    trunkInst.receiveShadow = true;

    // Canopy geometry: 2-layer low-poly icosahedron / dodecahedron
    const canopyGeom = new THREE.DodecahedronGeometry(4.2, 0);
    canopyGeom.translate(0, 8.5, 0);
    const canopyMat = new THREE.MeshLambertMaterial({
      color: 0x1b4332,
      flatShading: true
    });
    const canopyInst = new THREE.InstancedMesh(canopyGeom, canopyMat, treeCount);
    canopyInst.castShadow = true;
    canopyInst.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const colors = [0x1b4332, 0x2d6a4f, 0x40916c, 0x52b788, 0x285943];
    const colorObj = new THREE.Color();

    let placed = 0;
    for (let i = 0; i < treeCount; i++) {
      // Jungle region: X from -370 to -45, Z from -370 to 120
      const x = -370 + Math.random() * 320;
      const z = -370 + Math.random() * 480;

      // Avoid placing inside major faction citadels, sanctuaries or river
      const riverDist = Math.abs(x - Math.sin(z * 0.01) * 35);
      const distToTemple = Math.hypot(x - (-270), z - (-250));
      const distToOutpost = Math.hypot(x - (-260), z - 120);
      const distToDemonCitadel = Math.hypot(x - (-220), z - (-220));
      const distToElvenSanctuary = Math.hypot(x - (-200), z - 200);
      const distToCrossroads = Math.hypot(x, z - 10);

      if (riverDist < 20 || distToTemple < 35 || distToOutpost < 25 ||
          distToDemonCitadel < 45 || distToElvenSanctuary < 40 || distToCrossroads < 30) {
        continue;
      }

      const y = getTerrainHeight(x, z);
      const scale = 0.8 + Math.random() * 0.7;
      const rotY = Math.random() * Math.PI * 2;

      dummy.position.set(x, y - 0.2, z);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(0, rotY, (Math.random() - 0.5) * 0.08);
      dummy.updateMatrix();

      trunkInst.setMatrixAt(placed, dummy.matrix);
      canopyInst.setMatrixAt(placed, dummy.matrix);

      // Varied lush foliage colors
      const col = colors[Math.floor(Math.random() * colors.length)];
      colorObj.setHex(col);
      canopyInst.setColorAt(placed, colorObj);

      // Add simple trunk bounding radius for collision
      this.colliders.push({
        type: 'cylinder',
        x: x,
        z: z,
        radius: 0.9 * scale
      });

      placed++;
    }

    trunkInst.count = placed;
    canopyInst.count = placed;
    trunkInst.instanceMatrix.needsUpdate = true;
    canopyInst.instanceMatrix.needsUpdate = true;
    if (canopyInst.instanceColor) canopyInst.instanceColor.needsUpdate = true;

    this.scene.add(trunkInst);
    this.scene.add(canopyInst);
  }

  initPalms() {
    // Tropical palms along the river and coast
    const palmCount = 140;

    const stemGeom = new THREE.CylinderGeometry(0.3, 0.5, 7, 5);
    stemGeom.translate(0, 3.5, 0);
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x785336, flatShading: true });
    const stemInst = new THREE.InstancedMesh(stemGeom, stemMat, palmCount);
    stemInst.castShadow = true;

    // Palm leaf cluster
    const leafGeom = new THREE.ConeGeometry(3.6, 1.2, 5);
    leafGeom.translate(0, 6.8, 0);
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x55a630, flatShading: true });
    const leafInst = new THREE.InstancedMesh(leafGeom, leafMat, palmCount);
    leafInst.castShadow = true;

    const dummy = new THREE.Object3D();
    let placed = 0;

    for (let i = 0; i < palmCount; i++) {
      // Scatter along coastal edge (z: 160 to 350, x: -350 to -40) and river banks
      let x, z;
      if (Math.random() > 0.4) {
        // Coast
        x = -350 + Math.random() * 320;
        z = 180 + Math.random() * 160;
      } else {
        // River banks
        z = -200 + Math.random() * 380;
        x = Math.sin(z * 0.01) * 35 + (Math.random() > 0.5 ? 22 : -22) + (Math.random() - 0.5) * 8;
      }

      const y = getTerrainHeight(x, z);
      if (y < 0.1 || y > 5) continue;

      const scale = 0.8 + Math.random() * 0.5;
      dummy.position.set(x, y - 0.2, z);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set((Math.random() - 0.5) * 0.2, Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.2);
      dummy.updateMatrix();

      stemInst.setMatrixAt(placed, dummy.matrix);
      leafInst.setMatrixAt(placed, dummy.matrix);
      placed++;
    }

    stemInst.count = placed;
    leafInst.count = placed;
    stemInst.instanceMatrix.needsUpdate = true;
    leafInst.instanceMatrix.needsUpdate = true;

    this.scene.add(stemInst);
    this.scene.add(leafInst);
  }

  initRocksAndFerns() {
    const rockCount = 180;
    const rockGeom = new THREE.DodecahedronGeometry(1.4, 0);
    const rockMat = new THREE.MeshLambertMaterial({ color: 0x6b7280, flatShading: true });
    const rockInst = new THREE.InstancedMesh(rockGeom, rockMat, rockCount);
    rockInst.castShadow = true;
    rockInst.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let placed = 0;

    for (let i = 0; i < rockCount; i++) {
      const x = -360 + Math.random() * 350;
      const z = -360 + Math.random() * 500;
      const y = getTerrainHeight(x, z);

      const scaleX = 0.6 + Math.random() * 1.5;
      const scaleY = 0.4 + Math.random() * 0.9;
      const scaleZ = 0.6 + Math.random() * 1.5;

      dummy.position.set(x, y + scaleY * 0.4, z);
      dummy.scale.set(scaleX, scaleY, scaleZ);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.updateMatrix();

      rockInst.setMatrixAt(placed, dummy.matrix);
      placed++;
    }

    rockInst.count = placed;
    rockInst.instanceMatrix.needsUpdate = true;
    this.scene.add(rockInst);
  }

  initAncientTemple() {
    // Ancient Step Pyramid Shrine at (-270, -250)
    const templeGroup = new THREE.Group();
    templeGroup.position.set(-270, getTerrainHeight(-270, -250), -250);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x526058, flatShading: true });
    const mossMat = new THREE.MeshLambertMaterial({ color: 0x3d5a49, flatShading: true });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.8
    });

    // 3 Tiered Steps
    const tier1 = new THREE.Mesh(new THREE.BoxGeometry(32, 2.5, 32), stoneMat);
    tier1.position.y = 1.25;
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    templeGroup.add(tier1);

    const tier2 = new THREE.Mesh(new THREE.BoxGeometry(24, 2.5, 24), mossMat);
    tier2.position.y = 3.75;
    tier2.castShadow = true;
    tier2.receiveShadow = true;
    templeGroup.add(tier2);

    const tier3 = new THREE.Mesh(new THREE.BoxGeometry(16, 2.5, 16), stoneMat);
    tier3.position.y = 6.25;
    tier3.castShadow = true;
    tier3.receiveShadow = true;
    templeGroup.add(tier3);

    // Grand stone staircase leading up to top tier
    const stairs = new THREE.Mesh(new THREE.BoxGeometry(6, 4.5, 12), stoneMat);
    stairs.position.set(0, 2.5, 12);
    stairs.rotation.x = -Math.PI / 10;
    templeGroup.add(stairs);

    // Top Sanctuary Chamber (Open pillars with altar)
    const pillarGeom = new THREE.BoxGeometry(1.4, 5.5, 1.4);
    const pillarPositions = [
      [-6, 10.25, -6],
      [6, 10.25, -6],
      [-6, 10.25, 6],
      [6, 10.25, 6]
    ];

    pillarPositions.forEach(p => {
      const pillar = new THREE.Mesh(pillarGeom, stoneMat);
      pillar.position.set(p[0], p[1], p[2]);
      pillar.castShadow = true;
      templeGroup.add(pillar);
    });

    // Central Altar & Mystic Glowing Crystal
    const altar = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, 1.8, 6), stoneMat);
    altar.position.set(0, 8.4, 0);
    templeGroup.add(altar);

    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), goldMat);
    crystal.position.set(0, 10.2, 0);
    templeGroup.add(crystal);
    this.templeCrystal = crystal;

    // Altar Point Light
    const shrineLight = new THREE.PointLight(0xfbbf24, 1.2, 22);
    shrineLight.position.set(0, 10.5, 0);
    shrineLight.userData.baseIntensity = 1.2;
    templeGroup.add(shrineLight);

    // Torches at the entrance
    [-4, 4].forEach(xOffset => {
      const torchStand = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.5, 5), stoneMat);
      torchStand.position.set(xOffset, 8.5, 7.5);
      templeGroup.add(torchStand);

      const flame = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), new THREE.MeshBasicMaterial({ color: 0xff7700 }));
      flame.position.set(xOffset, 9.8, 7.5);
      templeGroup.add(flame);

      const torchLight = new THREE.PointLight(0xff6600, 0.8, 12);
      torchLight.position.set(xOffset, 9.8, 7.5);
      torchLight.userData.baseIntensity = 0.8;
      templeGroup.add(torchLight);
      if (this.dayNightCycle) this.dayNightCycle.registerNightLight(torchLight);
    });

    this.scene.add(templeGroup);

    // Temple sanctuary colliders (altar and pillars, allowing entry via stairs)
    this.colliders.push({
      type: 'cylinder',
      x: -270,
      z: -250,
      radius: 2.2
    });
    pillarPositions.forEach(p => {
      this.colliders.push({
        type: 'cylinder',
        x: -270 + p[0],
        z: -250 + p[2],
        radius: 1.0
      });
    });
  }

  initSuspensionBridge() {
    // Wooden suspension bridge crossing the river near crossroads (x: 0, z: 10)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(0, 0.5, 10);

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b, flatShading: true });
    const ropeMat = new THREE.MeshLambertMaterial({ color: 0xd4a373, flatShading: true });

    // Bridge Deck (width 6, length 48)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(48, 0.5, 7), woodMat);
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    // Railings & Posts
    for (let x = -22; x <= 22; x += 5.5) {
      [-3.2, 3.2].forEach(z => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.2, 5), woodMat);
        post.position.set(x, 1.1, z);
        post.castShadow = true;
        bridgeGroup.add(post);
      });
    }

    // Top Rope rails
    [-3.2, 3.2].forEach(z => {
      const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 48, 6), ropeMat);
      rope.rotation.z = Math.PI / 2;
      rope.position.set(0, 2.0, z);
      bridgeGroup.add(rope);
    });

    // Bridge stone foundation piers on each river bank
    const pierMat = new THREE.MeshLambertMaterial({ color: 0x475569, flatShading: true });
    [-24, 24].forEach(x => {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(3.5, 4, 8), pierMat);
      pier.position.set(x, -1.2, 0);
      pier.receiveShadow = true;
      bridgeGroup.add(pier);
    });

    this.scene.add(bridgeGroup);
  }

  initCrossroadsMonument() {
    const crossGroup = new THREE.Group();

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x57534e, flatShading: true }); // Carved granite
    const darkStoneMat = new THREE.MeshLambertMaterial({ color: 0x3f3f46, flatShading: true });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
      metalness: 0.7,
      roughness: 0.3
    });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
    const signMat = new THREE.MeshLambertMaterial({ color: 0xca8a04, flatShading: true });

    // Faction Banner Materials
    const valoriaBannerMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8, flatShading: true }); // Royal Blue
    const valoriaGoldMat = new THREE.MeshLambertMaterial({ color: 0xfacc15, flatShading: true });
    const dwarfBannerMat = new THREE.MeshLambertMaterial({ color: 0xb45309, flatShading: true });   // Bronze/Amber
    const elvenBannerMat = new THREE.MeshLambertMaterial({ color: 0x059669, flatShading: true });   // Emerald
    const demonBannerMat = new THREE.MeshLambertMaterial({ color: 0x991b1b, flatShading: true });   // Blood Crimson

    // --- 1. EAST BRIDGEHEAD: GRAND SANCTUARY PLAZA & 4-WAY OBELISK (x: 34, z: 10) ---
    const obeliskX = 34;
    const obeliskZ = 10;
    const obeliskY = getTerrainHeight(obeliskX, obeliskZ);

    const plaza = new THREE.Group();
    plaza.position.set(obeliskX, obeliskY, obeliskZ);

    // Stepped Circular Stone Dais
    const dais1 = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 9.2, 0.4, 16), stoneMat);
    dais1.position.y = 0.2;
    dais1.receiveShadow = true;
    plaza.add(dais1);

    const dais2 = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.8, 0.35, 16), darkStoneMat);
    dais2.position.y = 0.55;
    dais2.receiveShadow = true;
    plaza.add(dais2);

    // Obelisk Pedestal Base
    const pedestal = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.4, 3.0), stoneMat);
    pedestal.position.y = 1.35;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    plaza.add(pedestal);

    // Golden Runic Ring
    const runeRing = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.25, 3.1), goldMat);
    runeRing.position.y = 2.05;
    plaza.add(runeRing);

    // Monumental 4-Sided Tapered Granite Obelisk
    // 4 sides align with the 4 diagonal cardinal paths (NE, SE, SW, NW)
    const shaftGeom = new THREE.CylinderGeometry(0.85, 1.4, 9.0, 4);
    shaftGeom.rotateY(Math.PI / 4);
    const obeliskShaft = new THREE.Mesh(shaftGeom, stoneMat);
    obeliskShaft.position.y = 6.6;
    obeliskShaft.castShadow = true;
    plaza.add(obeliskShaft);

    // Gilded Pyramidion Cap
    const capGeom = new THREE.ConeGeometry(1.2, 2.0, 4);
    capGeom.rotateY(Math.PI / 4);
    const pyramidion = new THREE.Mesh(capGeom, goldMat);
    pyramidion.position.y = 12.0;
    pyramidion.castShadow = true;
    plaza.add(pyramidion);

    // 4 Directional Crest Cross-Arms & Heraldic Faction Pennants
    const arms = [
      { angle: -Math.PI / 4, mat: valoriaBannerMat, label: 'Valoria', crest: valoriaGoldMat }, // North-East
      { angle: Math.PI / 4, mat: dwarfBannerMat, label: 'Karak-Drak', crest: goldMat },         // South-East
      { angle: (3 * Math.PI) / 4, mat: elvenBannerMat, label: 'Sylvaheim', crest: stoneMat },   // South-West
      { angle: -(3 * Math.PI) / 4, mat: demonBannerMat, label: 'Nether', crest: darkStoneMat }  // North-West
    ];

    arms.forEach(({ angle, mat, crest }) => {
      const armGroup = new THREE.Group();
      armGroup.rotation.y = angle;

      // Iron bracket arm pointing outward
      const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 2.6), darkStoneMat);
      bracket.position.set(0, 9.8, 1.4);
      armGroup.add(bracket);

      // Hanging heraldic pennant
      const pennant = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 1.2), mat);
      pennant.position.set(0, 8.4, 2.2);
      pennant.castShadow = true;
      armGroup.add(pennant);

      // Faction crest emblem
      const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 6), crest);
      emblem.rotation.z = Math.PI / 2;
      emblem.position.set(0, 8.6, 2.2);
      armGroup.add(emblem);

      plaza.add(armGroup);
    });

    // 4 Sanctuary Corner Braziers
    const brazierDist = 5.2;
    [
      [-brazierDist, -brazierDist],
      [brazierDist, -brazierDist],
      [-brazierDist, brazierDist],
      [brazierDist, brazierDist]
    ].forEach(([bx, bz]) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.8, 6), stoneMat);
      post.position.set(bx, 0.9, bz);
      post.castShadow = true;
      plaza.add(post);

      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.35, 0.5, 6), darkStoneMat);
      bowl.position.set(bx, 1.9, bz);
      plaza.add(bowl);

      const flame = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      flame.position.set(bx, 2.2, bz);
      plaza.add(flame);

      const light = new THREE.PointLight(0xfbbf24, 0.9, 14);
      light.position.set(bx, 2.3, bz);
      light.userData.baseIntensity = 0.9;
      plaza.add(light);
      if (this.dayNightCycle) this.dayNightCycle.registerNightLight(light);
    });

    // 2 Traveler Stone Resting Benches
    [-3.8, 3.8].forEach(bz => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.8), stoneMat);
      bench.position.set(-4.5, 0.7, bz);
      bench.castShadow = true;
      bench.receiveShadow = true;
      plaza.add(bench);
    });

    // Directional Wooden Signpost at East Road Fork
    const signpost = new THREE.Group();
    signpost.position.set(42, getTerrainHeight(42, 10), 10);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.2, 6), woodMat);
    post.position.y = 1.6;
    post.castShadow = true;
    signpost.add(post);

    // Valoria Sign (NE)
    const signValoria = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 1.8), signMat);
    signValoria.position.set(0.15, 2.7, 0.6);
    signValoria.rotation.y = -Math.PI / 4;
    signpost.add(signValoria);

    // Dwarven Sign (SE)
    const signDwarf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 1.8), signMat);
    signDwarf.position.set(0.15, 2.2, 0.6);
    signDwarf.rotation.y = Math.PI / 4;
    signpost.add(signDwarf);

    crossGroup.add(signpost);
    crossGroup.add(plaza);

    // --- 2. WEST BRIDGEHEAD: GUARDIAN WAYPOINT ARCHWAY (x: -28, z: 10) ---
    const westX = -28;
    const westZ = 10;
    const westY = getTerrainHeight(westX, westZ);

    const archGroup = new THREE.Group();
    archGroup.position.set(westX, westY, westZ);

    // Twin Guardian Stone Pillars
    [-4.5, 4.5].forEach(pz => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.0, 1.4), stoneMat);
      col.position.set(0, 2.5, pz);
      col.castShadow = true;
      col.receiveShadow = true;
      archGroup.add(col);

      // Lantern on pillar
      const lanternMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.4), lanternMat);
      lantern.position.set(0, 4.5, pz > 0 ? pz - 1.0 : pz + 1.0);
      archGroup.add(lantern);

      const lampLight = new THREE.PointLight(0xfef08a, 0.7, 10);
      lampLight.position.copy(lantern.position);
      lampLight.userData.baseIntensity = 0.7;
      archGroup.add(lampLight);
      if (this.dayNightCycle) this.dayNightCycle.registerNightLight(lampLight);

      this.colliders.push({
        type: 'cylinder',
        x: westX,
        z: westZ + pz,
        radius: 1.0
      });
    });

    // Archway Lintel Beam
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 10.4), darkStoneMat);
    lintel.position.set(0, 5.5, 0);
    lintel.castShadow = true;
    archGroup.add(lintel);

    crossGroup.add(archGroup);
    this.scene.add(crossGroup);

    // Obelisk Collider
    this.colliders.push({
      type: 'cylinder',
      x: obeliskX,
      z: obeliskZ,
      radius: 2.2
    });
  }

  update(time) {
    if (this.templeCrystal) {
      this.templeCrystal.rotation.y = time * 0.8;
      this.templeCrystal.position.y = 10.2 + Math.sin(time * 2.0) * 0.15;
    }
  }
}
