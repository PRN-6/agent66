import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';
import { ROOF_MODES } from '../config/constants.js';
import { audioSystem } from '../systems/AudioSystem.js';

export class OpenHouses {
  constructor(scene, dayNightCycle) {
    this.scene = scene;
    this.dayNightCycle = dayNightCycle;
    this.houses = [];
    this.colliders = [];
    this.roofMode = ROOF_MODES.AUTO;
    this.currentInsideHouse = null;

    this.initElderLodge();
    this.initRoyalPavilion();
    this.initTavernGuild();
    this.initBlacksmithForge();
    this.initJungleOutpost();
    this.initBeachBungalow();
    this.initTempleSanctuary();
    this.initKingdomVillage();
  }

  setRoofMode(mode) {
    this.roofMode = mode;
  }

  // 1. Master Vance's Rustic Timber Lodge (Old Era Cottage)
  initElderLodge() {
    const x = 130;
    const z = 260;
    const y = getTerrainHeight(x, z);
    const houseGroup = new THREE.Group();
    houseGroup.position.set(x, y, z);

    const houseWidth = 18;
    const houseDepth = 14;
    const wallHeight = 4.2;

    const floorMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true }); // Dark timber floor
    const stoneWallMat = new THREE.MeshLambertMaterial({ color: 0x57534e, flatShading: true }); // Medieval fieldstone
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x451a03, flatShading: true });
    const thatchMat = new THREE.MeshLambertMaterial({
      color: 0xca8a04, // Golden thatch roof
      flatShading: true,
      transparent: true,
      opacity: 1.0
    });

    // Stone Foundation & Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(houseWidth, 0.4, houseDepth), floorMat);
    floor.position.y = 0.2;
    floor.receiveShadow = true;
    houseGroup.add(floor);

    // Stone and Timber Walls
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(houseWidth, wallHeight, 0.4), stoneWallMat);
    backWall.position.set(0, wallHeight / 2, -houseDepth / 2);
    houseGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, wallHeight, houseDepth), stoneWallMat);
    leftWall.position.set(-houseWidth / 2, wallHeight / 2, 0);
    houseGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, wallHeight, houseDepth), stoneWallMat);
    rightWall.position.set(houseWidth / 2, wallHeight / 2, 0);
    houseGroup.add(rightWall);

    // Front Wall with Doorway
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry((houseWidth - 3.5) / 2, wallHeight, 0.4), stoneWallMat);
    frontWallLeft.position.set(-((houseWidth - 3.5) / 4 + 1.75), wallHeight / 2, houseDepth / 2);
    houseGroup.add(frontWallLeft);

    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry((houseWidth - 3.5) / 2, wallHeight, 0.4), stoneWallMat);
    frontWallRight.position.set(((houseWidth - 3.5) / 4 + 1.75), wallHeight / 2, houseDepth / 2);
    houseGroup.add(frontWallRight);

    // Stone Fireplace & Chimney
    const fireplace = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.2, 1.8), stoneWallMat);
    fireplace.position.set(0, 1.6, -houseDepth / 2 + 0.9);
    houseGroup.add(fireplace);

    const fireLogs = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    fireLogs.position.set(0, 0.6, -houseDepth / 2 + 0.9);
    houseGroup.add(fireLogs);

    const fireLight = new THREE.PointLight(0xf59e0b, 1.2, 16);
    fireLight.position.set(0, 1.4, -houseDepth / 2 + 1.2);
    fireLight.userData.baseIntensity = 1.2;
    houseGroup.add(fireLight);
    this.dayNightCycle.registerNightLight(fireLight);

    // Interior Medieval Furniture:
    const interiorGroup = new THREE.Group();

    // Heavy Oak Table & Benches
    const table = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.1, 2.0), woodMat);
    table.position.set(-4.5, 0.75, -1.0);
    interiorGroup.add(table);

    const bench = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.5, 0.8), woodMat);
    bench.position.set(-4.5, 0.45, -2.6);
    interiorGroup.add(bench);

    // Master Vance's Legendary Broadsword & Shield on Wall
    const shield = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 0.15), new THREE.MeshLambertMaterial({ color: 0x1e3a8a }));
    shield.position.set(-4.5, 2.6, -houseDepth / 2 + 0.3);
    interiorGroup.add(shield);

    const wallSword = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.4, 0.1), new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }));
    wallSword.rotation.z = Math.PI / 4;
    wallSword.position.set(-4.5, 2.6, -houseDepth / 2 + 0.4);
    interiorGroup.add(wallSword);

    // Straw / Feather Bed
    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.8, 5.2), woodMat);
    bedFrame.position.set(6.0, 0.6, -3.8);
    interiorGroup.add(bedFrame);

    const mattress = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.7, 4.8), new THREE.MeshLambertMaterial({ color: 0xfef08a }));
    mattress.position.set(6.0, 1.1, -3.8);
    interiorGroup.add(mattress);

    // Wooden storage chest
    const chest = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 1.4), woodMat);
    chest.position.set(6.0, 0.8, 4.0);
    interiorGroup.add(chest);

    // Warm hanging iron lantern
    const lantern = new THREE.PointLight(0xfef08a, 1.1, 16);
    lantern.position.set(0, 3.5, 0);
    lantern.userData.baseIntensity = 1.1;
    interiorGroup.add(lantern);

    houseGroup.add(interiorGroup);

    // Thatched Peak Roof
    const roofGroup = new THREE.Group();
    const roof = new THREE.Mesh(new THREE.ConeGeometry(14, 5.0, 4), thatchMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, wallHeight + 2.5, 0);
    roof.castShadow = true;
    roofGroup.add(roof);

    houseGroup.add(roofGroup);
    this.scene.add(houseGroup);

    this.houses.push({
      id: 'elder_lodge',
      name: 'Retired Hero’s Rustic Lodge',
      desc: 'Old-era thatched timber lodge with roaring stone hearth, war trophies, and oak table',
      group: houseGroup,
      roofGroup: roofGroup,
      roofMat: thatchMat,
      roofBaseY: 0,
      currentRoofOffset: 0,
      worldPos: new THREE.Vector3(x, y, z),
      bounds: {
        minX: x - houseWidth / 2,
        maxX: x + houseWidth / 2,
        minZ: z - houseDepth / 2,
        maxZ: z + houseDepth / 2
      },
      isInside: false
    });

    // Complete colliders
    this.colliders.push(
      { type: 'box', minX: x - houseWidth / 2 - 0.2, maxX: x + houseWidth / 2 + 0.2, minZ: z - houseDepth / 2 - 0.3, maxZ: z - houseDepth / 2 + 0.3 },
      { type: 'box', minX: x - houseWidth / 2 - 0.3, maxX: x - houseWidth / 2 + 0.3, minZ: z - houseDepth / 2, maxZ: z + houseDepth / 2 },
      { type: 'box', minX: x + houseWidth / 2 - 0.3, maxX: x + houseWidth / 2 + 0.3, minZ: z - houseDepth / 2, maxZ: z + houseDepth / 2 },
      { type: 'box', minX: x - houseWidth / 2 - 0.2, maxX: x - 1.75, minZ: z + houseDepth / 2 - 0.3, maxZ: z + houseDepth / 2 + 0.3 },
      { type: 'box', minX: x + 1.75, maxX: x + houseWidth / 2 + 0.2, minZ: z + houseDepth / 2 - 0.3, maxZ: z + houseDepth / 2 + 0.3 },
      { type: 'box', minX: x - 2.0, maxX: x + 2.0, minZ: z - houseDepth / 2, maxZ: z - houseDepth / 2 + 2.0 }, // hearth
      { type: 'box', minX: x - 6.8, maxX: x - 2.2, minZ: z - 3.2, maxZ: z + 0.2 }, // table & bench
      { type: 'box', minX: x + 3.8, maxX: x + 8.2, minZ: z - 6.5, maxZ: z - 1.1 }  // bed
    );
  }

  // 2. Princess Aurelia's Royal Sun Pavilion & Manor in East Royal Castle Gardens
  initRoyalPavilion() {
    const x = 470;
    const z = -370;
    const y = getTerrainHeight(x, z);
    const houseGroup = new THREE.Group();
    houseGroup.position.set(x, y, z);

    const pavilionWidth = 24;
    const pavilionDepth = 18;
    const wallHeight = 5.2;

    const marbleMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9, flatShading: true }); // Royal white stone
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true });
    const velvetMat = new THREE.MeshLambertMaterial({ color: 0xec4899, flatShading: true }); // Rose velvet
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x0284c7, flatShading: true });
    const slateMat = new THREE.MeshLambertMaterial({
      color: 0x1e3a8a, // Deep royal blue slate
      flatShading: true,
      transparent: true,
      opacity: 1.0
    });

    // Marble Floor & Courtyard
    const floor = new THREE.Mesh(new THREE.BoxGeometry(pavilionWidth, 0.4, pavilionDepth), marbleMat);
    floor.position.y = 0.2;
    floor.receiveShadow = true;
    houseGroup.add(floor);

    // Stone Garden Fountain on Courtyard Patio
    const fountainGroup = new THREE.Group();
    fountainGroup.position.set(16, 0.2, 0);

    const patio = new THREE.Mesh(new THREE.BoxGeometry(10, 0.35, 14), marbleMat);
    fountainGroup.add(patio);

    const fountainPool = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 5.0, 1.2, 8), marbleMat);
    fountainPool.position.y = 0.6;
    fountainGroup.add(fountainPool);

    const fountainWater = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 0.2, 8), waterMat);
    fountainWater.position.y = 1.15;
    fountainGroup.add(fountainWater);

    const fountainCenter = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 0), goldMat);
    fountainCenter.position.y = 2.2;
    fountainGroup.add(fountainCenter);

    houseGroup.add(fountainGroup);

    // Stone Walls with high archways
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(pavilionWidth, wallHeight, 0.5), marbleMat);
    backWall.position.set(0, wallHeight / 2, -pavilionDepth / 2);
    houseGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallHeight, pavilionDepth), marbleMat);
    leftWall.position.set(-pavilionWidth / 2, wallHeight / 2, 0);
    houseGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallHeight, 8), marbleMat);
    rightWall.position.set(pavilionWidth / 2, wallHeight / 2, -5);
    houseGroup.add(rightWall);

    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(pavilionWidth * 0.6, wallHeight, 0.5), marbleMat);
    frontWall.position.set(-pavilionWidth * 0.2, wallHeight / 2, pavilionDepth / 2);
    houseGroup.add(frontWall);

    // Interior Royal Furnishings:
    const interiorGroup = new THREE.Group();

    // Four-Poster Royal Canopy Bed
    const canopyBed = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.2, 6.2), velvetMat);
    canopyBed.position.set(6.0, 0.8, -5.0);
    interiorGroup.add(canopyBed);

    // Gold Bedposts
    [3.5, 8.5].forEach(bx => {
      [-7.8, -2.2].forEach(bz => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.8, 6), goldMat);
        post.position.set(bx, 2.0, bz);
        interiorGroup.add(post);
      });
    });

    // Royal Divan & Velvet Lounge
    const divan = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.2, 2.5), velvetMat);
    divan.position.set(-5.5, 0.75, 1.5);
    interiorGroup.add(divan);

    // Royal Writing Desk with scrolls
    const desk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 2.2), new THREE.MeshLambertMaterial({ color: 0x78350f }));
    desk.position.set(-5.5, 0.8, -5.5);
    interiorGroup.add(desk);

    // Chandelier
    const chandelier = new THREE.PointLight(0xfef08a, 1.3, 24);
    chandelier.position.set(0, 4.4, 0);
    chandelier.userData.baseIntensity = 1.3;
    interiorGroup.add(chandelier);

    houseGroup.add(interiorGroup);

    // Mansard Slate Roof
    const roofGroup = new THREE.Group();
    const roofSlab = new THREE.Mesh(new THREE.ConeGeometry(17, 5.5, 4), slateMat);
    roofSlab.rotation.y = Math.PI / 4;
    roofSlab.position.y = wallHeight + 2.75;
    roofSlab.castShadow = true;
    roofGroup.add(roofSlab);

    houseGroup.add(roofGroup);
    this.scene.add(houseGroup);

    this.houses.push({
      id: 'royal_manor',
      name: 'Princess Aurelia’s Sun Pavilion',
      desc: 'Graceful royal estate with marble fountain patio, rose silk canopy bed, and royal writing desk',
      group: houseGroup,
      roofGroup: roofGroup,
      roofMat: slateMat,
      roofBaseY: 0,
      currentRoofOffset: 0,
      worldPos: new THREE.Vector3(x, y, z),
      bounds: {
        minX: x - pavilionWidth / 2,
        maxX: x + pavilionWidth / 2,
        minZ: z - pavilionDepth / 2,
        maxZ: z + pavilionDepth / 2
      },
      isInside: false
    });

    this.colliders.push(
      { type: 'box', minX: x - pavilionWidth / 2 - 0.3, maxX: x + pavilionWidth / 2 + 0.3, minZ: z - pavilionDepth / 2 - 0.3, maxZ: z - pavilionDepth / 2 + 0.3 },
      { type: 'box', minX: x - pavilionWidth / 2 - 0.3, maxX: x - pavilionWidth / 2 + 0.3, minZ: z - pavilionDepth / 2, maxZ: z + pavilionDepth / 2 },
      { type: 'box', minX: x + pavilionWidth / 2 - 0.3, maxX: x + pavilionWidth / 2 + 0.3, minZ: z - pavilionDepth / 2, maxZ: z - 1.0 },
      { type: 'box', minX: x - pavilionWidth / 2, maxX: x + 2.4, minZ: z + pavilionDepth / 2 - 0.3, maxZ: z + pavilionDepth / 2 + 0.3 },
      { type: 'cylinder', x: x + 16, z: z, radius: 5.2 }, // fountain
      { type: 'box', minX: x - 9.0, maxX: x - 2.0, minZ: z + 0.2, maxZ: z + 2.8 }, // divan
      { type: 'box', minX: x + 3.2, maxX: x + 8.8, minZ: z - 8.2, maxZ: z - 1.8 }  // canopy bed
    );
  }

  // 3. The Dragon's Rest Tavern & Adventurer's Guild (Old Era Pub)
  initTavernGuild() {
    const x = 205;
    const z = -85;
    const y = getTerrainHeight(x, z);
    const houseGroup = new THREE.Group();
    houseGroup.position.set(x, y, z);

    const tavernWidth = 20;
    const tavernDepth = 16;
    const wallHeight = 4.5;

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x451a03, flatShading: true }); // Dark oak
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x52525b, flatShading: true });
    const roofMat = new THREE.MeshLambertMaterial({
      color: 0x78350f, // Timber shake shingles
      flatShading: true,
      transparent: true,
      opacity: 1.0
    });

    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(tavernWidth, 0.3, tavernDepth), stoneMat);
    floor.position.y = 0.15;
    floor.receiveShadow = true;
    houseGroup.add(floor);

    // Walls
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(tavernWidth, wallHeight, 0.4), stoneMat);
    backWall.position.set(0, wallHeight / 2, -tavernDepth / 2);
    houseGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, wallHeight, tavernDepth), stoneMat);
    leftWall.position.set(-tavernWidth / 2, wallHeight / 2, 0);
    houseGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, wallHeight, tavernDepth), stoneMat);
    rightWall.position.set(tavernWidth / 2, wallHeight / 2, 0);
    houseGroup.add(rightWall);

    // Front Wall with wide tavern entrance
    const frontWallL = new THREE.Mesh(new THREE.BoxGeometry((tavernWidth - 6) / 2, wallHeight, 0.4), stoneMat);
    frontWallL.position.set(-((tavernWidth - 6) / 4 + 3), wallHeight / 2, tavernDepth / 2);
    houseGroup.add(frontWallL);

    const frontWallR = new THREE.Mesh(new THREE.BoxGeometry((tavernWidth - 6) / 2, wallHeight, 0.4), stoneMat);
    frontWallR.position.set(((tavernWidth - 6) / 4 + 3), wallHeight / 2, tavernDepth / 2);
    houseGroup.add(frontWallR);

    // Wooden Tavern Sign
    const sign = new THREE.Mesh(new THREE.BoxGeometry(9, 1.2, 0.3), woodMat);
    sign.position.set(0, wallHeight + 0.8, tavernDepth / 2 + 0.2);
    houseGroup.add(sign);

    // INTERIOR TAVERN & GUILD:
    const interiorGroup = new THREE.Group();

    // Long Wooden Banquet Tables with Benches
    [-4.5, 2.5].forEach(tx => {
      const bTable = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 9.0), woodMat);
      bTable.position.set(tx, 0.7, -1.0);
      bTable.castShadow = true;
      interiorGroup.add(bTable);

      // Low-poly Wooden Ale Tankards on table
      for (let tz = -3.5; tz <= 3.5; tz += 2.0) {
        const mug = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.25, 0.45, 6),
          new THREE.MeshLambertMaterial({ color: 0xd97706, flatShading: true })
        );
        mug.position.set(tx, 1.45, tz);
        interiorGroup.add(mug);
      }
    });

    // Ale Casks & Bar Counter along the back wall
    const barCounter = new THREE.Mesh(new THREE.BoxGeometry(12, 1.3, 1.8), woodMat);
    barCounter.position.set(0, 0.8, -tavernDepth / 2 + 1.8);
    interiorGroup.add(barCounter);

    // Big Wooden Ale Barrels behind counter
    [-3.5, 0, 3.5].forEach(bx => {
      const cask = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 2.2, 8), woodMat);
      cask.rotation.z = Math.PI / 2;
      cask.position.set(bx, 1.2, -tavernDepth / 2 + 0.8);
      interiorGroup.add(cask);
    });

    // Adventurer's Guild Quest Bounty Noticeboard on right wall
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 4.5), woodMat);
    board.position.set(tavernWidth / 2 - 0.2, 2.2, 3.0);
    interiorGroup.add(board);

    // Warm Tavern Candle Chandelier
    const tavernLight = new THREE.PointLight(0xfef08a, 1.4, 20);
    tavernLight.position.set(0, 3.8, 0);
    tavernLight.userData.baseIntensity = 1.4;
    interiorGroup.add(tavernLight);

    houseGroup.add(interiorGroup);

    // Gabled Roof
    const roofGroup = new THREE.Group();
    const roof = new THREE.Mesh(new THREE.ConeGeometry(15, 4.5, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = wallHeight + 2.25;
    roofGroup.add(roof);

    houseGroup.add(roofGroup);
    this.scene.add(houseGroup);

    this.houses.push({
      id: 'tavern',
      name: 'The Dragon’s Rest Tavern & Guild',
      desc: 'Old-era tavern with long banquet tables, ale barrels, quest noticeboards, and candle chandeliers',
      group: houseGroup,
      roofGroup: roofGroup,
      roofMat: roofMat,
      roofBaseY: 0,
      currentRoofOffset: 0,
      worldPos: new THREE.Vector3(x, y, z),
      bounds: {
        minX: x - tavernWidth / 2,
        maxX: x + tavernWidth / 2,
        minZ: z - tavernDepth / 2,
        maxZ: z + tavernDepth / 2
      },
      isInside: false
    });

    this.colliders.push(
      { type: 'box', minX: x - tavernWidth / 2 - 0.3, maxX: x + tavernWidth / 2 + 0.3, minZ: z - tavernDepth / 2 - 0.3, maxZ: z - tavernDepth / 2 + 0.3 },
      { type: 'box', minX: x - tavernWidth / 2 - 0.3, maxX: x - tavernWidth / 2 + 0.3, minZ: z - tavernDepth / 2, maxZ: z + tavernDepth / 2 },
      { type: 'box', minX: x + tavernWidth / 2 - 0.3, maxX: x + tavernWidth / 2 + 0.3, minZ: z - tavernDepth / 2, maxZ: z + tavernDepth / 2 },
      { type: 'box', minX: x - tavernWidth / 2, maxX: x - 3.0, minZ: z + tavernDepth / 2 - 0.3, maxZ: z + tavernDepth / 2 + 0.3 },
      { type: 'box', minX: x + 3.0, maxX: x + tavernWidth / 2, minZ: z + tavernDepth / 2 - 0.3, maxZ: z + tavernDepth / 2 + 0.3 },
      { type: 'box', minX: x - 5.8, maxX: x - 3.2, minZ: z - 5.8, maxZ: z + 3.8 }, // table 1
      { type: 'box', minX: x + 1.2, maxX: x + 3.8, minZ: z - 5.8, maxZ: z + 3.8 }, // table 2
      { type: 'box', minX: x - 6.5, maxX: x + 6.5, minZ: z - tavernDepth / 2, maxZ: z - tavernDepth / 2 + 2.8 } // bar & casks
    );
  }

  // 4. The Iron Anvil Blacksmith & Armory
  initBlacksmithForge() {
    const x = 160;
    const z = -55;
    const y = getTerrainHeight(x, z);
    const houseGroup = new THREE.Group();
    houseGroup.position.set(x, y, z);

    const w = 16;
    const d = 14;
    const h = 4.0;

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x44403c, flatShading: true });
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
    const roofMat = new THREE.MeshLambertMaterial({
      color: 0x7f1d1d, // Dark tile
      flatShading: true,
      transparent: true,
      opacity: 1.0
    });

    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), stoneMat);
    floor.position.y = 0.15;
    houseGroup.add(floor);

    // Half-open forge workshop walls
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.4), stoneMat);
    backWall.position.set(0, h / 2, -d / 2);
    houseGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, d), stoneMat);
    leftWall.position.set(-w / 2, h / 2, 0);
    houseGroup.add(leftWall);

    // Heavy Blacksmith Forge Hearth (with glowing coals)
    const hearth = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.5, 3.5), stoneMat);
    hearth.position.set(-4.5, 1.25, -d / 2 + 2.0);
    houseGroup.add(hearth);

    const coals = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.4, 2.0), new THREE.MeshBasicMaterial({ color: 0xff4500 }));
    coals.position.set(-4.5, 2.2, -d / 2 + 2.0);
    houseGroup.add(coals);

    const forgeLight = new THREE.PointLight(0xff4500, 1.5, 16);
    forgeLight.position.set(-4.5, 2.8, -d / 2 + 2.0);
    forgeLight.userData.baseIntensity = 1.5;
    houseGroup.add(forgeLight);
    this.dayNightCycle.registerNightLight(forgeLight);

    // Massive Iron Anvil in center
    const anvilBlock = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 1.0, 6), woodMat);
    anvilBlock.position.set(0, 0.5, 0);
    houseGroup.add(anvilBlock);

    const anvilIron = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.7), ironMat);
    anvilIron.position.set(0, 1.2, 0);
    houseGroup.add(anvilIron);

    // Water Quenching Barrel
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 1.6, 8), woodMat);
    barrel.position.set(-1.8, 0.8, 2.5);
    houseGroup.add(barrel);

    // Weapon Display Racks (Swords and Shields)
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.6, 5.0), woodMat);
    rack.position.set(w / 2 - 0.4, 1.3, -1.5);
    houseGroup.add(rack);

    // Roof
    const roofGroup = new THREE.Group();
    const roof = new THREE.Mesh(new THREE.ConeGeometry(13, 3.8, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, h + 1.9, 0);
    roofGroup.add(roof);

    houseGroup.add(roofGroup);
    this.scene.add(houseGroup);

    this.houses.push({
      id: 'blacksmith',
      name: 'The Iron Anvil Blacksmith',
      desc: 'Blacksmith armory with glowing coal forge, iron anvil, quenching barrel, and knight weapons',
      group: houseGroup,
      roofGroup: roofGroup,
      roofMat: roofMat,
      roofBaseY: 0,
      currentRoofOffset: 0,
      worldPos: new THREE.Vector3(x, y, z),
      bounds: {
        minX: x - w / 2,
        maxX: x + w / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2
      },
      isInside: false
    });

    this.colliders.push(
      { type: 'box', minX: x - w / 2 - 0.25, maxX: x + w / 2 + 0.25, minZ: z - d / 2 - 0.25, maxZ: z - d / 2 + 0.25 },
      { type: 'box', minX: x - w / 2 - 0.25, maxX: x - w / 2 + 0.25, minZ: z - d / 2, maxZ: z + d / 2 },
      { type: 'box', minX: x - 7.0, maxX: x - 2.0, minZ: z - d / 2, maxZ: z - d / 2 + 4.0 }, // forge
      { type: 'cylinder', x: x, z: z, radius: 1.2 }, // anvil
      { type: 'cylinder', x: x - 1.8, z: z + 2.5, radius: 1.0 } // barrel
    );
  }

  // 5. Jungle Explorer's Research Outpost (Ancient Stilted Cabin)
  initJungleOutpost() {
    const x = -260;
    const z = 120;
    const y = getTerrainHeight(x, z);
    const houseGroup = new THREE.Group();
    houseGroup.position.set(x, y, z);

    const hutWidth = 14;
    const hutDepth = 12;
    const wallHeight = 3.8;

    const woodPlankMat = new THREE.MeshLambertMaterial({ color: 0x854d0e, flatShading: true });
    const bambooMat = new THREE.MeshLambertMaterial({ color: 0xa16207, flatShading: true });
    const thatchMat = new THREE.MeshLambertMaterial({
      color: 0xca8a04,
      flatShading: true,
      transparent: true,
      opacity: 1.0
    });

    // Elevated Wooden Stilts
    const stiltGeom = new THREE.CylinderGeometry(0.35, 0.35, 2.5, 6);
    [
      [-hutWidth / 2 + 0.8, -hutDepth / 2 + 0.8],
      [hutWidth / 2 - 0.8, -hutDepth / 2 + 0.8],
      [-hutWidth / 2 + 0.8, hutDepth / 2 - 0.8],
      [hutWidth / 2 - 0.8, hutDepth / 2 - 0.8]
    ].forEach(([sx, sz]) => {
      const stilt = new THREE.Mesh(stiltGeom, woodPlankMat);
      stilt.position.set(sx, 1.25, sz);
      houseGroup.add(stilt);
    });

    // Elevated Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(hutWidth, 0.4, hutDepth), woodPlankMat);
    deck.position.y = 2.5;
    deck.receiveShadow = true;
    houseGroup.add(deck);

    // Walls
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(hutWidth, wallHeight, 0.3), bambooMat);
    backWall.position.set(0, 2.5 + wallHeight / 2, -hutDepth / 2);
    houseGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallHeight, hutDepth), bambooMat);
    leftWall.position.set(-hutWidth / 2, 2.5 + wallHeight / 2, 0);
    houseGroup.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallHeight, hutDepth), bambooMat);
    rightWall.position.set(hutWidth / 2, 2.5 + wallHeight / 2, 0);
    houseGroup.add(rightWall);

    // Front porch railing
    const railMat = new THREE.MeshLambertMaterial({ color: 0x713f12 });
    const railL = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.2, 0.2), railMat);
    railL.position.set(-4.0, 3.1, hutDepth / 2);
    houseGroup.add(railL);

    const railR = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.2, 0.2), railMat);
    railR.position.set(4.0, 3.1, hutDepth / 2);
    houseGroup.add(railR);

    // Wooden stairs
    const stairs = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 3.0), woodPlankMat);
    stairs.position.set(0, 1.25, hutDepth / 2 + 1.5);
    stairs.rotation.x = -Math.PI / 8;
    houseGroup.add(stairs);

    // Interior Gear
    const interiorGroup = new THREE.Group();
    const desk = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 2.2), woodPlankMat);
    desk.position.set(-3.5, 3.2, -3.0);
    interiorGroup.add(desk);

    const mapDoc = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), new THREE.MeshLambertMaterial({ color: 0xfef08a }));
    mapDoc.rotation.x = -Math.PI / 2;
    mapDoc.position.set(-3.5, 3.82, -3.0);
    interiorGroup.add(mapDoc);

    const cot = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.6, 5.0), new THREE.MeshLambertMaterial({ color: 0x65a30d }));
    cot.position.set(4.0, 3.0, -2.5);
    interiorGroup.add(cot);

    const lanternLight = new THREE.PointLight(0xf59e0b, 1.1, 16);
    lanternLight.position.set(0, 5.0, 0);
    lanternLight.userData.baseIntensity = 1.1;
    interiorGroup.add(lanternLight);

    houseGroup.add(interiorGroup);

    // Thatch Roof
    const roofGroup = new THREE.Group();
    const roofThatch = new THREE.Mesh(new THREE.ConeGeometry(12.5, 3.8, 5), thatchMat);
    roofThatch.rotation.y = Math.PI / 5;
    roofThatch.position.set(0, 2.5 + wallHeight + 1.8, 0);
    roofThatch.castShadow = true;
    roofGroup.add(roofThatch);

    houseGroup.add(roofGroup);
    this.scene.add(houseGroup);

    this.houses.push({
      id: 'jungle_camp',
      name: 'Wild Jungle Outpost',
      desc: 'Ancient stilted bamboo treehouse with exploration charts, field cot, and hanging oil lantern',
      group: houseGroup,
      roofGroup: roofGroup,
      roofMat: thatchMat,
      roofBaseY: 0,
      currentRoofOffset: 0,
      worldPos: new THREE.Vector3(x, y, z),
      bounds: {
        minX: x - hutWidth / 2,
        maxX: x + hutWidth / 2,
        minZ: z - hutDepth / 2,
        maxZ: z + hutDepth / 2
      },
      isInside: false
    });

    this.colliders.push(
      { type: 'box', minX: x - hutWidth / 2 - 0.25, maxX: x + hutWidth / 2 + 0.25, minZ: z - hutDepth / 2 - 0.25, maxZ: z - hutDepth / 2 + 0.25 },
      { type: 'box', minX: x - hutWidth / 2 - 0.25, maxX: x - hutWidth / 2 + 0.25, minZ: z - hutDepth / 2, maxZ: z + hutDepth / 2 },
      { type: 'box', minX: x + hutWidth / 2 - 0.25, maxX: x + hutWidth / 2 + 0.25, minZ: z - hutDepth / 2, maxZ: z + hutDepth / 2 },
      { type: 'box', minX: x - hutWidth / 2, maxX: x - 1.75, minZ: z + hutDepth / 2 - 0.2, maxZ: z + hutDepth / 2 + 0.2 },
      { type: 'box', minX: x + 1.75, maxX: x + hutWidth / 2, minZ: z + hutDepth / 2 - 0.2, maxZ: z + hutDepth / 2 + 0.2 }
    );
  }

  // 6. Coastal Beach Bungalow & Pirate Shack
  initBeachBungalow() {
    const x = -30;
    const z = 50;
    const y = getTerrainHeight(x, z);
    const houseGroup = new THREE.Group();
    houseGroup.position.set(x, y, z);

    const width = 14;
    const depth = 12;
    const wallHeight = 3.6;

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
    const palmThatchMat = new THREE.MeshLambertMaterial({
      color: 0x65a30d,
      flatShading: true,
      transparent: true,
      opacity: 1.0
    });

    const deck = new THREE.Mesh(new THREE.BoxGeometry(width + 4, 0.4, depth + 4), woodMat);
    deck.position.y = 0.2;
    houseGroup.add(deck);

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, wallHeight, 0.3), woodMat);
    backWall.position.set(0, wallHeight / 2, -depth / 2);
    houseGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallHeight, depth), woodMat);
    leftWall.position.set(-width / 2, wallHeight / 2, 0);
    houseGroup.add(leftWall);

    // Interior
    const interiorGroup = new THREE.Group();
    const bed = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.8, 5.0), new THREE.MeshLambertMaterial({ color: 0xfef08a }));
    bed.position.set(-3.0, 0.6, -2.0);
    interiorGroup.add(bed);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 1.4, 6), woodMat);
    barrel.position.set(3.5, 0.7, 2.0);
    interiorGroup.add(barrel);

    houseGroup.add(interiorGroup);

    // Palm Thatch Roof
    const roofGroup = new THREE.Group();
    const roof = new THREE.Mesh(new THREE.ConeGeometry(11, 3.2, 4), palmThatchMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, wallHeight + 1.5, 0);
    roofGroup.add(roof);

    houseGroup.add(roofGroup);
    this.scene.add(houseGroup);

    this.houses.push({
      id: 'beach_haven',
      name: 'Pirate Cove & Watchtower',
      desc: 'Coastal wooden cabin with ocean breeze deck, driftwood bed, and rum casks',
      group: houseGroup,
      roofGroup: roofGroup,
      roofMat: palmThatchMat,
      roofBaseY: 0,
      currentRoofOffset: 0,
      worldPos: new THREE.Vector3(x, y, z),
      bounds: {
        minX: x - width / 2,
        maxX: x + width / 2,
        minZ: z - depth / 2,
        maxZ: z + depth / 2
      },
      isInside: false
    });

    this.colliders.push(
      { type: 'box', minX: x - width / 2 - 0.25, maxX: x + width / 2 + 0.25, minZ: z - depth / 2 - 0.25, maxZ: z - depth / 2 + 0.25 },
      { type: 'box', minX: x - width / 2 - 0.25, maxX: x - width / 2 + 0.25, minZ: z - depth / 2, maxZ: z + depth / 2 }
    );
  }

  // 7. Ancient Jungle Temple Sanctuary (Demon King's Lair)
  initTempleSanctuary() {
    const x = -270;
    const z = -250;
    const y = getTerrainHeight(x, z);

    this.houses.push({
      id: 'jungle_temple',
      name: 'Ancient Jungle Temple',
      desc: 'Mystic stone step pyramid where Demon King Malakor guards the blazing Sunstone Altar',
      group: new THREE.Group(),
      roofGroup: new THREE.Group(),
      roofMat: null,
      roofBaseY: 0,
      currentRoofOffset: 0,
      worldPos: new THREE.Vector3(x, y, z),
      bounds: {
        minX: x - 15,
        maxX: x + 15,
        minZ: z - 15,
        maxZ: z + 15
      },
      isInside: false
    });
  }

  // 8. Old Era Medieval Village Cottages
  initKingdomVillage() {
    const villageHouses = [
      { id: 'woodcutter', name: 'Woodcutter’s Thatched Cottage', desc: 'Rustic stone and timber home with woodpiles', x: 120, z: -25, roofCol: 0xca8a04 },
      { id: 'miller', name: 'Miller’s Millstone House', desc: 'Warm cottage with grain sacks and hearth', x: 75, z: -40, roofCol: 0x991b1b },
      { id: 'fisherman', name: 'River Fisherman’s Shack', desc: 'Timber dwelling near the riverbank with hanging nets', x: 35, z: -120, roofCol: 0x78350f },
      { id: 'knights_rest', name: 'Knight’s Guard House', desc: 'Fortified stone outpost housing the village garrison', x: 250, z: -55, roofCol: 0x1e3a8a }
    ];

    villageHouses.forEach(vh => {
      const x = vh.x;
      const z = vh.z;
      const y = getTerrainHeight(x, z);
      const houseGroup = new THREE.Group();
      houseGroup.position.set(x, y, z);

      const w = 15;
      const d = 12;
      const h = 4.0;

      const stoneMat = new THREE.MeshLambertMaterial({ color: 0x57534e, flatShading: true });
      const woodMat = new THREE.MeshLambertMaterial({ color: 0x451a03, flatShading: true });
      const roofMat = new THREE.MeshLambertMaterial({
        color: vh.roofCol,
        flatShading: true,
        transparent: true,
        opacity: 1.0
      });

      // Stone floor
      const floor = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, d), stoneMat);
      floor.position.y = 0.175;
      houseGroup.add(floor);

      // Walls
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.35), stoneMat);
      backWall.position.set(0, h / 2, -d / 2);
      houseGroup.add(backWall);

      const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, h, d), stoneMat);
      leftWall.position.set(-w / 2, h / 2, 0);
      houseGroup.add(leftWall);

      const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, h, d), stoneMat);
      rightWall.position.set(w / 2, h / 2, 0);
      houseGroup.add(rightWall);

      const frontL = new THREE.Mesh(new THREE.BoxGeometry((w - 3.2) / 2, h, 0.35), stoneMat);
      frontL.position.set(-((w - 3.2) / 4 + 1.6), h / 2, d / 2);
      houseGroup.add(frontL);

      const frontR = new THREE.Mesh(new THREE.BoxGeometry((w - 3.2) / 2, h, 0.35), stoneMat);
      frontR.position.set(((w - 3.2) / 4 + 1.6), h / 2, d / 2);
      houseGroup.add(frontR);

      // Interior rustic items
      const bench = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.8, 1.8), woodMat);
      bench.position.set(-3.5, 0.5, -2.5);
      houseGroup.add(bench);

      const bed = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.7, 4.5), new THREE.MeshLambertMaterial({ color: 0xfef08a }));
      bed.position.set(4.0, 0.55, -2.5);
      houseGroup.add(bed);

      // Gabled Thatched Roof
      const roofGroup = new THREE.Group();
      const roof = new THREE.Mesh(new THREE.ConeGeometry(11.5, 3.8, 4), roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.set(0, h + 1.8, 0);
      roof.castShadow = true;
      roofGroup.add(roof);

      houseGroup.add(roofGroup);
      this.scene.add(houseGroup);

      this.houses.push({
        id: vh.id,
        name: vh.name,
        desc: vh.desc,
        group: houseGroup,
        roofGroup: roofGroup,
        roofMat: roofMat,
        roofBaseY: 0,
        currentRoofOffset: 0,
        worldPos: new THREE.Vector3(x, y, z),
        bounds: {
          minX: x - w / 2,
          maxX: x + w / 2,
          minZ: z - d / 2,
          maxZ: z + d / 2
        },
        isInside: false
      });

      this.colliders.push(
        { type: 'box', minX: x - w / 2 - 0.25, maxX: x + w / 2 + 0.25, minZ: z - d / 2 - 0.25, maxZ: z - d / 2 + 0.25 },
        { type: 'box', minX: x - w / 2 - 0.25, maxX: x - w / 2 + 0.25, minZ: z - d / 2, maxZ: z + d / 2 },
        { type: 'box', minX: x + w / 2 - 0.25, maxX: x + w / 2 + 0.25, minZ: z - d / 2, maxZ: z + d / 2 },
        { type: 'box', minX: x - w / 2, maxX: x - 1.6, minZ: z + d / 2 - 0.25, maxZ: z + d / 2 + 0.25 },
        { type: 'box', minX: x + 1.6, maxX: x + w / 2, minZ: z + d / 2 - 0.25, maxZ: z + d / 2 + 0.25 },
        { type: 'box', minX: x - 5.5, maxX: x - 1.5, minZ: z - 3.4, maxZ: z - 1.6 },
        { type: 'box', minX: x + 2.2, maxX: x + 5.8, minZ: z - 4.8, maxZ: z - 0.2 }
      );
    });
  }

  update(delta, playerPos) {
    if (!playerPos) return;

    let enteredAny = null;

    for (let i = 0; i < this.houses.length; i++) {
      const house = this.houses[i];
      const b = house.bounds;

      const inside = (
        playerPos.x >= b.minX - 1.0 &&
        playerPos.x <= b.maxX + 1.0 &&
        playerPos.z >= b.minZ - 1.0 &&
        playerPos.z <= b.maxZ + 1.0
      );

      if (inside && !house.isInside) {
        house.isInside = true;
        audioSystem.playDoorChime(true);
      } else if (!inside && house.isInside) {
        house.isInside = false;
        audioSystem.playDoorChime(false);
      }

      if (inside) {
        enteredAny = house;
      }

      let targetRoofLift = 0;
      let targetOpacity = 1.0;

      if (this.roofMode === ROOF_MODES.CUTAWAY) {
        targetRoofLift = 12.0;
        targetOpacity = 0.15;
      } else if (this.roofMode === ROOF_MODES.SOLID) {
        targetRoofLift = 0.0;
        targetOpacity = 1.0;
      } else {
        const dist = Math.hypot(playerPos.x - house.worldPos.x, playerPos.z - house.worldPos.z);
        if (inside || dist < 16.0) {
          targetRoofLift = 10.0;
          targetOpacity = 0.15;
        } else {
          targetRoofLift = 0.0;
          targetOpacity = 1.0;
        }
      }

      house.currentRoofOffset += (targetRoofLift - house.currentRoofOffset) * Math.min(1.0, delta * 7.0);
      if (house.roofGroup) {
        house.roofGroup.position.y = house.roofBaseY + house.currentRoofOffset;
      }

      if (house.roofMat) {
        house.roofMat.opacity += (targetOpacity - house.roofMat.opacity) * Math.min(1.0, delta * 7.0);
        house.roofMat.depthWrite = (house.roofMat.opacity > 0.85);
      }
    }

    this.currentInsideHouse = enteredAny;
  }

  getCurrentHouse() {
    return this.currentInsideHouse;
  }

  getAllHouses() {
    return this.houses;
  }
}
