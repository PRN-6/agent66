import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';

export class KingdomBiome {
  constructor(scene, dayNightCycle) {
    this.scene = scene;
    this.dayNightCycle = dayNightCycle;
    this.colliders = [];
    this.lanterns = [];
    this.animatedObjects = [];

    this.initCobblestoneRoads();
    this.initRoyalCitadel();
    this.initTownMarketSquare();
    this.initMedievalHouses();
    this.initWindmill();
    this.initKingdomDefenses();
  }

  initCobblestoneRoads() {
    const roadGroup = new THREE.Group();

    const cobbleMat = new THREE.MeshLambertMaterial({ color: 0x52525b, flatShading: true }); // Dark flagstone
    const edgeMat = new THREE.MeshLambertMaterial({ color: 0x71717a, flatShading: true });   // Stone curbing
    const gravelMat = new THREE.MeshLambertMaterial({ color: 0xa1a1aa, flatShading: true });

    // 1. The Grand King's Avenue: connects Crossroads (x: 10, z: 10) to Market Square (x: 205, z: -85)
    // and continues north-east as the Royal Highroad to King Reginald's Grand Citadel at (x: 380, z: -380)
    const avenueSegments = [
      { x: 50, z: 10, w: 90, d: 10, rot: 0 },
      { x: 100, z: -35, w: 10, d: 80, rot: 0 },
      { x: 150, z: -75, w: 90, d: 11, rot: 0 },
      // Market Square ring road
      { x: 205, z: -60, w: 110, d: 10, rot: 0 },
      // Northbound Royal Highway from Market towards Citadel
      { x: 205, z: -125, w: 12, d: 120, rot: 0 },
      // Grand Diagonal Royal Causeway to Citadel Gates
      { x: 290, z: -250, w: 14, d: 160, rot: -0.65 },
      // Citadel Barbican Gate Approach Plaza
      { x: 380, z: -315, w: 16, d: 30, rot: 0 },
      // Royal Garden Path connecting Citadel to Princess Aurelia's Sun Pavilion
      { x: 425, z: -350, w: 80, d: 8, rot: 0 }
    ];

    avenueSegments.forEach(seg => {
      const road = new THREE.Mesh(new THREE.PlaneGeometry(seg.w, seg.d), cobbleMat);
      road.rotateX(-Math.PI / 2);
      road.rotation.z = seg.rot;
      road.position.set(seg.x, 0.52, seg.z);
      road.receiveShadow = true;
      roadGroup.add(road);

      // Stone curbs along sides
      const curb1 = new THREE.Mesh(new THREE.BoxGeometry(seg.w, 0.25, 1.0), edgeMat);
      curb1.position.set(seg.x, 0.62, seg.z - seg.d / 2);
      curb1.receiveShadow = true;
      roadGroup.add(curb1);

      const curb2 = new THREE.Mesh(new THREE.BoxGeometry(seg.w, 0.25, 1.0), edgeMat);
      curb2.position.set(seg.x, 0.62, seg.z + seg.d / 2);
      curb2.receiveShadow = true;
      roadGroup.add(curb2);
    });

    this.scene.add(roadGroup);
  }

  initRoyalCitadel() {
    // Grand Fortified Royal Castle & Massive Outer Fortress Walls at (x: 380, z: -380)
    // An authentic medieval fortress: Moat, Arched Drawbridge, Barbican Gatehouse,
    // Outer Bailey with Armory, Stables, King Statues, and the Great Royal Donjon & Throne Hall!
    const castleX = 380;
    const castleZ = -380;
    const citadelGroup = new THREE.Group();
    citadelGroup.position.set(castleX, 0.5, castleZ);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x64748b, flatShading: true }); // Castle ashlar stone
    const darkStoneMat = new THREE.MeshLambertMaterial({ color: 0x334155, flatShading: true }); // Dark granite foundation
    const slateRoofMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a, flatShading: true }); // Royal blue slate
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true });
    const bannerMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8, flatShading: true }); // Royal blue & gold banner
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x1f2937, flatShading: true });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
    const carpetMat = new THREE.MeshLambertMaterial({ color: 0x991b1b, flatShading: true }); // Crimson velvet carpet
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x0284c7, flatShading: true }); // Moat water

    // -------------------------------------------------------------
    // 1. CASTLE DEFENSIVE MOAT & ARCHED DRAWBRIDGE CAUSEWAY
    // -------------------------------------------------------------
    const moatW = 140;
    const moatD = 12;
    const moatZ = 54 + moatD / 2; // In front of south curtain wall

    // Moat Water Channel
    const moatWater = new THREE.Mesh(new THREE.PlaneGeometry(moatW, moatD), waterMat);
    moatWater.rotateX(-Math.PI / 2);
    moatWater.position.set(0, 0.1, moatZ);
    moatWater.receiveShadow = true;
    citadelGroup.add(moatWater);

    // Stone Moat Retaining Embankments
    [-moatD / 2, moatD / 2].forEach(mz => {
      const bank = new THREE.Mesh(new THREE.BoxGeometry(moatW + 2, 0.6, 1.2), darkStoneMat);
      bank.position.set(0, 0.3, moatZ + mz);
      citadelGroup.add(bank);
    });

    // Fortified Stone Drawbridge / Causeway spanning the Moat into the Barbican
    const bridgeW = 14;
    const bridgeL = 22;
    const bridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(bridgeW, 0.8, bridgeL), darkStoneMat);
    bridgeMesh.position.set(0, 0.45, moatZ);
    bridgeMesh.receiveShadow = true;
    citadelGroup.add(bridgeMesh);

    // Timber Deck Inlay on Bridge
    const bridgePlanks = new THREE.Mesh(new THREE.BoxGeometry(bridgeW - 1.2, 0.1, bridgeL - 1), woodMat);
    bridgePlanks.position.set(0, 0.86, moatZ);
    citadelGroup.add(bridgePlanks);

    // Stone Bridge Parapets with Iron Torches
    [-bridgeW / 2 + 0.5, bridgeW / 2 - 0.5].forEach(px => {
      const parapet = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, bridgeL), stoneMat);
      parapet.position.set(px, 1.2, moatZ);
      parapet.castShadow = true;
      citadelGroup.add(parapet);

      // Iron Drawbridge Chains & Winch Pillars
      const chainPillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.2, 1.4), darkStoneMat);
      chainPillar.position.set(px, 2.5, moatZ - bridgeL / 2 + 1);
      citadelGroup.add(chainPillar);

      const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.5, 4), ironMat);
      chain.position.set(px, 2.8, moatZ);
      chain.rotation.x = Math.PI / 4.5;
      citadelGroup.add(chain);

      // Bridge lanterns at entrance
      const lamp = new THREE.PointLight(0xf59e0b, 1.2, 16);
      lamp.position.set(px, 3.2, moatZ + bridgeL / 2 - 1);
      lamp.userData.baseIntensity = 1.2;
      citadelGroup.add(lamp);
      this.dayNightCycle.registerNightLight(lamp);
    });

    // -------------------------------------------------------------
    // 2. MASSIVE CONCENTRIC OUTER CURTAIN WALLS (128m x 108m, 16m high, 4.2m thick)
    // -------------------------------------------------------------
    const wallW = 128;
    const wallD = 108;
    const wallH = 16;
    const wallThick = 4.2;
    const gateW = 16;

    // Inner Courtyard Paved Ground Slab
    const courtyard = new THREE.Mesh(new THREE.PlaneGeometry(wallW - 2, wallD - 2), darkStoneMat);
    courtyard.rotateX(-Math.PI / 2);
    courtyard.position.set(0, 0.06, 0);
    courtyard.receiveShadow = true;
    citadelGroup.add(courtyard);

    // North Curtain Wall (Back)
    const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(wallW, wallH, wallThick), stoneMat);
    wallNorth.position.set(0, wallH / 2, -wallD / 2);
    wallNorth.castShadow = true;
    wallNorth.receiveShadow = true;
    citadelGroup.add(wallNorth);

    // West Curtain Wall (Left)
    const wallWest = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, wallD), stoneMat);
    wallWest.position.set(-wallW / 2, wallH / 2, 0);
    wallWest.castShadow = true;
    wallWest.receiveShadow = true;
    citadelGroup.add(wallWest);

    // East Curtain Wall (Right)
    const wallEast = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, wallD), stoneMat);
    wallEast.position.set(wallW / 2, wallH / 2, 0);
    wallEast.castShadow = true;
    wallEast.receiveShadow = true;
    citadelGroup.add(wallEast);

    // South Curtain Wall (Front with Barbican Gateway)
    const frontSideW = (wallW - gateW) / 2;
    const wallSouthL = new THREE.Mesh(new THREE.BoxGeometry(frontSideW, wallH, wallThick), stoneMat);
    wallSouthL.position.set(-(gateW / 2 + frontSideW / 2), wallH / 2, wallD / 2);
    wallSouthL.castShadow = true;
    wallSouthL.receiveShadow = true;
    citadelGroup.add(wallSouthL);

    const wallSouthR = new THREE.Mesh(new THREE.BoxGeometry(frontSideW, wallH, wallThick), stoneMat);
    wallSouthR.position.set((gateW / 2 + frontSideW / 2), wallH / 2, wallD / 2);
    wallSouthR.castShadow = true;
    wallSouthR.receiveShadow = true;
    citadelGroup.add(wallSouthR);

    // Wall-Walk Machicolations & Stone Crenellations along all outer curtain walls
    for (let cx = -wallW / 2 + 3; cx <= wallW / 2 - 3; cx += 4.5) {
      [-wallD / 2, wallD / 2].forEach(cz => {
        if (Math.abs(cz - wallD / 2) < 1 && Math.abs(cx) < gateW / 2 + 1) return; // skip gate
        const merlon = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 1.2), darkStoneMat);
        merlon.position.set(cx, wallH + 1.1, cz + (cz < 0 ? -1.5 : 1.5));
        citadelGroup.add(merlon);
      });
    }

    for (let cz = -wallD / 2 + 3; cz <= wallD / 2 - 3; cz += 4.5) {
      [-wallW / 2, wallW / 2].forEach(cx => {
        const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 2.4), darkStoneMat);
        merlon.position.set(cx + (cx < 0 ? -1.5 : 1.5), wallH + 1.1, cz);
        citadelGroup.add(merlon);
      });
    }

    // -------------------------------------------------------------
    // 3. 4 COLOSSAL CORNER FORTRESS BASTIONS (Radius 7.5m, Height 34m)
    // -------------------------------------------------------------
    const cornerOffsets = [
      [-wallW / 2, -wallD / 2],
      [wallW / 2, -wallD / 2],
      [-wallW / 2, wallD / 2],
      [wallW / 2, wallD / 2]
    ];

    const bastionGeom = new THREE.CylinderGeometry(7.0, 8.2, 34, 10);
    const bastionSpireGeom = new THREE.ConeGeometry(9.2, 14, 10);

    cornerOffsets.forEach(([bx, bz]) => {
      const bastion = new THREE.Mesh(bastionGeom, stoneMat);
      bastion.position.set(bx, 17, bz);
      bastion.castShadow = true;
      bastion.receiveShadow = true;
      citadelGroup.add(bastion);

      // Overhanging Machicolation Parapet Ring
      const parapet = new THREE.Mesh(new THREE.CylinderGeometry(9.2, 8.0, 2.8, 10), darkStoneMat);
      parapet.position.set(bx, 35, bz);
      citadelGroup.add(parapet);

      // High Conical Blue Slate Spire
      const spire = new THREE.Mesh(bastionSpireGeom, slateRoofMat);
      spire.position.set(bx, 42, bz);
      spire.castShadow = true;
      citadelGroup.add(spire);

      // Gold Imperial Finial & Royal Flagpole
      const finial = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 0), goldMat);
      finial.position.set(bx, 49.5, bz);
      citadelGroup.add(finial);

      const flagpole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 8, 4), darkStoneMat);
      flagpole.position.set(bx, 53, bz);
      citadelGroup.add(flagpole);

      const flag = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.0), bannerMat);
      flag.position.set(bx + 1.8, 55, bz);
      citadelGroup.add(flag);

      // Corner Bastion Collider
      this.colliders.push({
        type: 'cylinder',
        x: castleX + bx,
        z: castleZ + bz,
        radius: 8.5
      });
    });

    // 2 Mid-Wall Watchtowers with Overhanging Bartizans (West & East)
    [-wallW / 2, wallW / 2].forEach(tx => {
      const midTower = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.4, 26, 8), stoneMat);
      midTower.position.set(tx, 13, 0);
      citadelGroup.add(midTower);

      const midSpire = new THREE.Mesh(new THREE.ConeGeometry(6.0, 10, 8), slateRoofMat);
      midSpire.position.set(tx, 30, 0);
      citadelGroup.add(midSpire);

      this.colliders.push({
        type: 'cylinder',
        x: castleX + tx,
        z: castleZ,
        radius: 5.2
      });
    });

    // -------------------------------------------------------------
    // 4. GRAND TWIN BARBICAN GATEHOUSE TOWERS & MACHICOLATIONS
    // -------------------------------------------------------------
    [-gateW / 2 - 3.5, gateW / 2 + 3.5].forEach(gx => {
      const gateTower = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 6.6, 28, 8), stoneMat);
      gateTower.position.set(gx, 14, wallD / 2 + 2);
      gateTower.castShadow = true;
      citadelGroup.add(gateTower);

      // Corbelled Machicolation Gallery
      const gallery = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 6.2, 3.0, 8), darkStoneMat);
      gallery.position.set(gx, 29.5, wallD / 2 + 2);
      citadelGroup.add(gallery);

      const gateSpire = new THREE.Mesh(new THREE.ConeGeometry(7.2, 11, 8), slateRoofMat);
      gateSpire.position.set(gx, 36.5, wallD / 2 + 2);
      citadelGroup.add(gateSpire);

      this.colliders.push({
        type: 'cylinder',
        x: castleX + gx,
        z: castleZ + wallD / 2 + 2,
        radius: 6.4
      });
    });

    // Heavy Fortified Gatehouse Arch & Wall-Walk Bridge
    const gateArch = new THREE.Mesh(new THREE.BoxGeometry(gateW + 7, 5, wallThick + 4), darkStoneMat);
    gateArch.position.set(0, wallH + 1.5, wallD / 2 + 1);
    citadelGroup.add(gateArch);

    // Carved Royal Stone Lion Crest above gate
    const lionShield = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.2, 0.6), goldMat);
    lionShield.position.set(0, wallH + 1.5, wallD / 2 + 3.2);
    citadelGroup.add(lionShield);

    // Iron Portcullis Grate
    const portcullis = new THREE.Mesh(new THREE.BoxGeometry(gateW - 1, 7, 0.5), ironMat);
    portcullis.position.set(0, wallH - 2.5, wallD / 2 + 1);
    citadelGroup.add(portcullis);

    // Heavy Double Oak Gate Doors swung open inside
    const doorL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 10, 6.5), woodMat);
    doorL.position.set(-gateW / 2 + 1.0, 5, wallD / 2 - 3.5);
    doorL.rotation.y = 0.55;
    citadelGroup.add(doorL);

    const doorR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 10, 6.5), woodMat);
    doorR.position.set(gateW / 2 - 1.0, 5, wallD / 2 - 3.5);
    doorR.rotation.y = -0.55;
    citadelGroup.add(doorR);

    // -------------------------------------------------------------
    // 5. OUTER BAILEY (COURTYARD): ARMORY, STABLES, WATER WELL & STATUES
    // -------------------------------------------------------------

    // A. Castle Garrison Armory & Guard Barracks (West Courtyard: x: -42, z: 12)
    const armoryW = 20;
    const armoryD = 14;
    const armoryH = 6;
    const armory = new THREE.Mesh(new THREE.BoxGeometry(armoryW, armoryH, armoryD), stoneMat);
    armory.position.set(-42, armoryH / 2, 12);
    armory.castShadow = true;
    citadelGroup.add(armory);

    const armoryRoof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(armoryW, armoryD) * 0.52, 5, 4), slateRoofMat);
    armoryRoof.rotation.y = Math.PI / 4;
    armoryRoof.position.set(-42, armoryH + 2.5, 12);
    citadelGroup.add(armoryRoof);

    // Exterior Weapon Racks & Training Dummies
    const weaponRack = new THREE.Mesh(new THREE.BoxGeometry(6.0, 2.5, 0.6), woodMat);
    weaponRack.position.set(-30, 1.25, 12);
    citadelGroup.add(weaponRack);

    // Sparring Combat Dummies
    [-34, -28].forEach(dx => {
      const dummyPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.2, 6), woodMat);
      dummyPost.position.set(dx, 1.1, 4);
      citadelGroup.add(dummyPost);

      const dummyBody = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.2, 0.5), new THREE.MeshLambertMaterial({ color: 0xca8a04, flatShading: true }));
      dummyBody.position.set(dx, 1.6, 4);
      citadelGroup.add(dummyBody);

      const dummyShield = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.1), ironMat);
      dummyShield.position.set(dx + 0.45, 1.6, 4);
      citadelGroup.add(dummyShield);
    });

    // B. Royal Warhorse Stables (East Courtyard: x: 42, z: 12)
    const stableW = 22;
    const stableD = 14;
    const stableH = 6;
    const stable = new THREE.Mesh(new THREE.BoxGeometry(stableW, stableH, stableD), woodMat);
    stable.position.set(42, stableH / 2, 12);
    stable.castShadow = true;
    citadelGroup.add(stable);

    const stableRoof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(stableW, stableD) * 0.52, 5, 4), new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true }));
    stableRoof.rotation.y = Math.PI / 4;
    stableRoof.position.set(42, stableH + 2.5, 12);
    citadelGroup.add(stableRoof);

    // Hay Bales & Wooden Water Trough
    [32, 34, 33].forEach((hx, i) => {
      const bale = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.2), new THREE.MeshLambertMaterial({ color: 0xfacc15, flatShading: true }));
      bale.position.set(hx, 0.6 + i * 0.5, 4);
      citadelGroup.add(bale);
    });

    const horseTrough = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.0, 1.4), darkStoneMat);
    horseTrough.position.set(30, 0.5, 12);
    citadelGroup.add(horseTrough);

    // C. Castle Cistern & Water Well (Courtyard: x: -16, z: 22)
    const well = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 1.4, 8), darkStoneMat);
    well.position.set(-16, 0.7, 22);
    well.castShadow = true;
    citadelGroup.add(well);

    const wellWater = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 0.2, 8), waterMat);
    wellWater.position.set(-16, 1.3, 22);
    citadelGroup.add(wellWater);

    // D. Monumental Carved Granite Statues of Ancient Kings
    const statueCoords = [
      [-10, 32],
      [10, 32],
      [-10, 12],
      [10, 12]
    ];

    statueCoords.forEach(([sx, sz]) => {
      // Pedestal
      const pedestal = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.2, 2.8), darkStoneMat);
      pedestal.position.set(sx, 1.1, sz);
      pedestal.castShadow = true;
      citadelGroup.add(pedestal);

      // King Statue Body & Crown
      const statue = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.8, 1.4), stoneMat);
      statue.position.set(sx, 4.1, sz);
      statue.castShadow = true;
      citadelGroup.add(statue);

      const crown = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.8, 5), goldMat);
      crown.position.set(sx, 6.4, sz);
      citadelGroup.add(crown);

      // Broadsword resting point-down in front
      const sword = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.0, 0.3), ironMat);
      sword.position.set(sx, 3.5, sz + 0.85);
      citadelGroup.add(sword);

      this.colliders.push({
        type: 'box',
        minX: castleX + sx - 1.5,
        maxX: castleX + sx + 1.5,
        minZ: castleZ + sz - 1.5,
        maxZ: castleZ + sz + 1.5
      });
    });

    // Courtyard Lamp Posts
    [-18, 18].forEach(lx => {
      [24, 0, -20].forEach(lz => {
        const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 5.0, 6), ironMat);
        lampPost.position.set(lx, 2.5, lz);
        citadelGroup.add(lampPost);

        const lantern = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), goldMat);
        lantern.position.set(lx, 5.2, lz);
        citadelGroup.add(lantern);

        const light = new THREE.PointLight(0xf59e0b, 1.2, 16);
        light.position.set(lx, 5.2, lz);
        light.userData.baseIntensity = 1.2;
        citadelGroup.add(light);
        this.dayNightCycle.registerNightLight(light);
      });
    });

    // -------------------------------------------------------------
    // 6. THE GREAT ROYAL DONJON / KEEP & OPEN ENTERABLE THRONE HALL
    // (Center Back: centered at x: 0, z: -25; Throne at world [380, -375] -> local [0, 5])
    // -------------------------------------------------------------
    const keepW = 54;
    const keepD = 48;
    const keepH = 26;
    const keepZ = -22; // Keep center: bounds z: -46 to +2
    const portalW = 10;

    // Outer Keep Walls (Back, Left, Right, Front with 10m Grand Portal)
    const keepBack = new THREE.Mesh(new THREE.BoxGeometry(keepW, keepH, 3), stoneMat);
    keepBack.position.set(0, keepH / 2, keepZ - keepD / 2);
    keepBack.castShadow = true;
    citadelGroup.add(keepBack);

    const keepLeft = new THREE.Mesh(new THREE.BoxGeometry(3, keepH, keepD), stoneMat);
    keepLeft.position.set(-keepW / 2, keepH / 2, keepZ);
    keepLeft.castShadow = true;
    citadelGroup.add(keepLeft);

    const keepRight = new THREE.Mesh(new THREE.BoxGeometry(3, keepH, keepD), stoneMat);
    keepRight.position.set(keepW / 2, keepH / 2, keepZ);
    keepRight.castShadow = true;
    citadelGroup.add(keepRight);

    // Front Wall Left & Right of Entrance Portal
    const frontPortionW = (keepW - portalW) / 2;
    const keepFrontL = new THREE.Mesh(new THREE.BoxGeometry(frontPortionW, keepH, 3), stoneMat);
    keepFrontL.position.set(-(portalW / 2 + frontPortionW / 2), keepH / 2, keepZ + keepD / 2);
    citadelGroup.add(keepFrontL);

    const keepFrontR = new THREE.Mesh(new THREE.BoxGeometry(frontPortionW, keepH, 3), stoneMat);
    keepFrontR.position.set((portalW / 2 + frontPortionW / 2), keepH / 2, keepZ + keepD / 2);
    citadelGroup.add(keepFrontR);

    // Stepped Buttresses along Keep Exterior
    [-keepW / 2, keepW / 2].forEach(bx => {
      [-12, 12].forEach(bz => {
        const buttress = new THREE.Mesh(new THREE.BoxGeometry(2.5, keepH * 0.8, 3.5), darkStoneMat);
        buttress.position.set(bx + (bx < 0 ? -1.0 : 1.0), (keepH * 0.8) / 2, keepZ + bz);
        citadelGroup.add(buttress);
      });
    });

    // 4 Corner Keep Turret Spires (Height 40m)
    [-keepW / 2, keepW / 2].forEach(kx => {
      [-keepD / 2, keepD / 2].forEach(kz => {
        const turret = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.6, 36, 8), stoneMat);
        turret.position.set(kx, 18, keepZ + kz);
        citadelGroup.add(turret);

        const turretSpire = new THREE.Mesh(new THREE.ConeGeometry(5.2, 11, 8), slateRoofMat);
        turretSpire.position.set(kx, 41.5, keepZ + kz);
        citadelGroup.add(turretSpire);

        const turretFinial = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 0), goldMat);
        turretFinial.position.set(kx, 47.5, keepZ + kz);
        citadelGroup.add(turretFinial);
      });
    });

    // Great Donjon Gabled Roof & Central Celestial Spire (54m tall)
    const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(keepW, keepD) * 0.54, 14, 4), slateRoofMat);
    keepRoof.rotation.y = Math.PI / 4;
    keepRoof.position.set(0, keepH + 7, keepZ);
    keepRoof.castShadow = true;
    citadelGroup.add(keepRoof);

    const grandSpire = new THREE.Mesh(new THREE.ConeGeometry(3.6, 20, 8), slateRoofMat);
    grandSpire.position.set(0, keepH + 21, keepZ);
    grandSpire.castShadow = true;
    citadelGroup.add(grandSpire);

    const royalCrown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 0), goldMat);
    royalCrown.position.set(0, keepH + 31.5, keepZ);
    citadelGroup.add(royalCrown);

    // Grand Entrance Portal Arch & Steps
    const palaceSteps = new THREE.Mesh(new THREE.BoxGeometry(portalW + 4, 1.2, 6), darkStoneMat);
    palaceSteps.position.set(0, 0.6, keepZ + keepD / 2 + 3);
    palaceSteps.receiveShadow = true;
    citadelGroup.add(palaceSteps);

    const portalArch = new THREE.Mesh(new THREE.BoxGeometry(portalW + 2, 4.5, 4.0), darkStoneMat);
    portalArch.position.set(0, 14, keepZ + keepD / 2);
    citadelGroup.add(portalArch);

    // -------------------------------------------------------------
    // 7. THRONE ROOM INTERIOR (Pillars, Feasting Tables, Red Carpet & King's Throne)
    // -------------------------------------------------------------
    // Ceremonial Red Carpet Runner stretching from portal to Throne Dais
    const carpetL = keepD - 10;
    const redCarpet = new THREE.Mesh(new THREE.PlaneGeometry(5.0, carpetL), carpetMat);
    redCarpet.rotateX(-Math.PI / 2);
    redCarpet.position.set(0, 0.12, keepZ + 2);
    redCarpet.receiveShadow = true;
    citadelGroup.add(redCarpet);

    // Gold borders along the carpet
    [-2.6, 2.6].forEach(cx => {
      const border = new THREE.Mesh(new THREE.PlaneGeometry(0.3, carpetL), goldMat);
      border.rotateX(-Math.PI / 2);
      border.position.set(cx, 0.13, keepZ + 2);
      citadelGroup.add(border);
    });

    // 8 Grand Fluted Throne Room Columns
    [-11, 11].forEach(colX => {
      [-16, -6, 4, 14].forEach(colZ => {
        const column = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, keepH - 2, 8), darkStoneMat);
        column.position.set(colX, (keepH - 2) / 2, keepZ + colZ);
        column.castShadow = true;
        citadelGroup.add(column);

        // Column Torch Sconces
        const torch = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 0.3), goldMat);
        torch.position.set(colX + (colX < 0 ? 1.3 : -1.3), 6.5, keepZ + colZ);
        citadelGroup.add(torch);

        const torchLight = new THREE.PointLight(0xf59e0b, 1.2, 14);
        torchLight.position.set(colX + (colX < 0 ? 1.5 : -1.5), 7.0, keepZ + colZ);
        torchLight.userData.baseIntensity = 1.2;
        citadelGroup.add(torchLight);
        this.dayNightCycle.registerNightLight(torchLight);

        this.colliders.push({
          type: 'cylinder',
          x: castleX + colX,
          z: castleZ + keepZ + colZ,
          radius: 1.4
        });
      });
    });

    // Two Long Royal Banquet Feast Tables (Left & Right)
    [-18, 18].forEach(tx => {
      const table = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.2, 16), woodMat);
      table.position.set(tx, 0.75, keepZ);
      table.castShadow = true;
      citadelGroup.add(table);

      // Banquet Benches
      [-2.8, 2.8].forEach(bx => {
        const bench = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 15), woodMat);
        bench.position.set(tx + bx, 0.45, keepZ);
        citadelGroup.add(bench);
      });

      this.colliders.push({
        type: 'box',
        minX: castleX + tx - 3.5,
        maxX: castleX + tx + 3.5,
        minZ: castleZ + keepZ - 8.5,
        maxZ: castleZ + keepZ + 8.5
      });
    });

    // King Reginald's Royal Throne Dais (Located at world [380, -375] -> local [0, 5])
    const throneZ = 5;
    const dais = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.9, 7.0), darkStoneMat);
    dais.position.set(0, 0.45, throneZ);
    dais.receiveShadow = true;
    citadelGroup.add(dais);

    const daisStep = new THREE.Mesh(new THREE.BoxGeometry(10.0, 0.45, 8.5), stoneMat);
    daisStep.position.set(0, 0.22, throneZ);
    daisStep.receiveShadow = true;
    citadelGroup.add(daisStep);

    // Gilded High Sovereign Throne
    const throneSeat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 2.0), carpetMat);
    throneSeat.position.set(0, 1.35, throneZ);
    citadelGroup.add(throneSeat);

    const throneBack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.2, 0.5), carpetMat);
    throneBack.position.set(0, 3.0, throneZ - 1.0);
    citadelGroup.add(throneBack);

    // Golden Lion Arms and Crest
    const throneCrest = new THREE.Mesh(new THREE.DodecahedronGeometry(0.85, 0), goldMat);
    throneCrest.position.set(0, 5.4, throneZ - 1.0);
    citadelGroup.add(throneCrest);

    [-1.3, 1.3].forEach(ax => {
      const armrest = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 1.8), goldMat);
      armrest.position.set(ax, 1.8, throneZ);
      citadelGroup.add(armrest);
    });

    // Royal Heraldic Standards Flanking the Throne
    [-3.8, 3.8].forEach(bx => {
      const standardPost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 9.0, 6), goldMat);
      standardPost.position.set(bx, 4.5, throneZ - 1.5);
      citadelGroup.add(standardPost);

      const standardBanner = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 7.0), bannerMat);
      standardBanner.position.set(bx, 5.0, throneZ - 1.45);
      citadelGroup.add(standardBanner);

      const brazier = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.6, 2.0, 6), darkStoneMat);
      brazier.position.set(bx, 1.0, throneZ + 2.5);
      citadelGroup.add(brazier);

      const fire = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5, 0), goldMat);
      fire.position.set(bx, 2.2, throneZ + 2.5);
      citadelGroup.add(fire);

      const fireLight = new THREE.PointLight(0xf59e0b, 1.5, 16);
      fireLight.position.set(bx, 2.5, throneZ + 2.5);
      fireLight.userData.baseIntensity = 1.5;
      citadelGroup.add(fireLight);
      this.dayNightCycle.registerNightLight(fireLight);
    });

    this.scene.add(citadelGroup);

    // -------------------------------------------------------------
    // 8. AIRTIGHT SUB-STEPPED CASTLE COLLIDERS
    // -------------------------------------------------------------
    this.colliders.push(
      // Outer Perimeter Curtain Walls
      { type: 'box', minX: castleX - wallW / 2, maxX: castleX + wallW / 2, minZ: castleZ - wallD / 2 - 2.5, maxZ: castleZ - wallD / 2 + 2.5 }, // North
      { type: 'box', minX: castleX - wallW / 2 - 2.5, maxX: castleX - wallW / 2 + 2.5, minZ: castleZ - wallD / 2, maxZ: castleZ + wallD / 2 }, // West
      { type: 'box', minX: castleX + wallW / 2 - 2.5, maxX: castleX + wallW / 2 + 2.5, minZ: castleZ - wallD / 2, maxZ: castleZ + wallD / 2 }, // East
      // South Wall Left & Right of Barbican Gate
      { type: 'box', minX: castleX - wallW / 2, maxX: castleX - gateW / 2, minZ: castleZ + wallD / 2 - 2.5, maxZ: castleZ + wallD / 2 + 2.5 },
      { type: 'box', minX: castleX + gateW / 2, maxX: castleX + wallW / 2, minZ: castleZ + wallD / 2 - 2.5, maxZ: castleZ + wallD / 2 + 2.5 },

      // Drawbridge Stone Parapets
      { type: 'box', minX: castleX - bridgeW / 2 - 1, maxX: castleX - bridgeW / 2 + 1, minZ: castleZ + moatZ - bridgeL / 2, maxZ: castleZ + moatZ + bridgeL / 2 },
      { type: 'box', minX: castleX + bridgeW / 2 - 1, maxX: castleX + bridgeW / 2 + 1, minZ: castleZ + moatZ - bridgeL / 2, maxZ: castleZ + moatZ + bridgeL / 2 },

      // Castle Armory Building (West Courtyard)
      { type: 'box', minX: castleX - 42 - armoryW / 2, maxX: castleX - 42 + armoryW / 2, minZ: castleZ + 12 - armoryD / 2, maxZ: castleZ + 12 + armoryD / 2 },
      // Royal Stables Building (East Courtyard)
      { type: 'box', minX: castleX + 42 - stableW / 2, maxX: castleX + 42 + stableW / 2, minZ: castleZ + 12 - stableD / 2, maxZ: castleZ + 12 + stableD / 2 },
      // Castle Water Well
      { type: 'cylinder', x: castleX - 16, z: castleZ + 22, radius: 2.8 },

      // Keep Perimeter Walls (Leaving 10m open grand entrance portal at front)
      { type: 'box', minX: castleX - keepW / 2, maxX: castleX + keepW / 2, minZ: castleZ + keepZ - keepD / 2 - 1.5, maxZ: castleZ + keepZ - keepD / 2 + 1.5 }, // Keep Back
      { type: 'box', minX: castleX - keepW / 2 - 1.5, maxX: castleX - keepW / 2 + 1.5, minZ: castleZ + keepZ - keepD / 2, maxZ: castleZ + keepZ + keepD / 2 }, // Keep Left
      { type: 'box', minX: castleX + keepW / 2 - 1.5, maxX: castleX + keepW / 2 + 1.5, minZ: castleZ + keepZ - keepD / 2, maxZ: castleZ + keepZ + keepD / 2 }, // Keep Right
      { type: 'box', minX: castleX - keepW / 2, maxX: castleX - portalW / 2, minZ: castleZ + keepZ + keepD / 2 - 1.5, maxZ: castleZ + keepZ + keepD / 2 + 1.5 }, // Keep Front L
      { type: 'box', minX: castleX + portalW / 2, maxX: castleX + keepW / 2, minZ: castleZ + keepZ + keepD / 2 - 1.5, maxZ: castleZ + keepZ + keepD / 2 + 1.5 }, // Keep Front R

      // Throne Dais Barrier (behind throne to prevent tunneling out through rear)
      { type: 'box', minX: castleX - 4.5, maxX: castleX + 4.5, minZ: castleZ + throneZ - 2.5, maxZ: castleZ + throneZ - 0.5 }
    );
  }

  initTownMarketSquare() {
    // Market Bazaar & Town Square around (x: 205, z: -110)
    const marketGroup = new THREE.Group();
    const my = getTerrainHeight(205, -110);
    marketGroup.position.set(205, my + 0.15, -110);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x71717a, flatShading: true });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x0284c7, flatShading: true });

    // Central Stone Town Well & Fountain
    const wellBase = new THREE.Mesh(new THREE.CylinderGeometry(5.5, 6.0, 1.4, 8), stoneMat);
    wellBase.position.y = 0.7;
    wellBase.castShadow = true;
    wellBase.receiveShadow = true;
    marketGroup.add(wellBase);

    const wellWater = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.8, 0.2, 8), waterMat);
    wellWater.position.y = 1.35;
    marketGroup.add(wellWater);

    // Well Roof Posts & Timber Canopy
    [-3.5, 3.5].forEach(wx => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.5, 0.4), woodMat);
      post.position.set(wx, 2.5, 0);
      post.castShadow = true;
      marketGroup.add(post);
    });

    const wellRoof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 2.4, 4), new THREE.MeshLambertMaterial({ color: 0x991b1b, flatShading: true }));
    wellRoof.rotation.y = Math.PI / 4;
    wellRoof.position.set(0, 5.2, 0);
    wellRoof.castShadow = true;
    marketGroup.add(wellRoof);

    // Well collider
    this.colliders.push({
      type: 'cylinder',
      x: 205,
      z: -110,
      radius: 6.2
    });

    // Market Stalls with colorful striped canopies
    const stalls = [
      { x: -14, z: -8, rot: 0.2, canopyColor: 0xef4444, goodsCol: 0x84cc16 }, // Fruit & Vegetables
      { x: 14, z: -8, rot: -0.2, canopyColor: 0x3b82f6, goodsCol: 0xf59e0b }, // Bread & Grains
      { x: -14, z: 8, rot: 0.1, canopyColor: 0x10b981, goodsCol: 0xec4899 },  // Potions & Herbs
      { x: 14, z: 8, rot: -0.1, canopyColor: 0x8b5cf6, goodsCol: 0x94a3b8 }   // Armor & Relics
    ];

    stalls.forEach(st => {
      const stallGroup = new THREE.Group();
      stallGroup.position.set(st.x, 0, st.z);
      stallGroup.rotation.y = st.rot;

      // Wooden Table
      const table = new THREE.Mesh(new THREE.BoxGeometry(5.0, 1.2, 2.4), woodMat);
      table.position.y = 0.6;
      table.castShadow = true;
      stallGroup.add(table);

      // Canopy Poles
      [-2.2, 2.2].forEach(px => {
        [-1.0, 1.0].forEach(pz => {
          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 4), woodMat);
          pole.position.set(px, 1.6, pz);
          stallGroup.add(pole);
        });
      });

      // Striped Fabric Canopy
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, 2.8), new THREE.MeshLambertMaterial({ color: st.canopyColor, flatShading: true }));
      canopy.position.set(0, 3.2, 0);
      canopy.castShadow = true;
      stallGroup.add(canopy);

      // Goods Crates / Baskets on table
      for (let gx = -1.6; gx <= 1.6; gx += 1.2) {
        const crate = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.5, 0.9),
          new THREE.MeshLambertMaterial({ color: st.goodsCol, flatShading: true })
        );
        crate.position.set(gx, 1.35, 0);
        stallGroup.add(crate);
      }

      marketGroup.add(stallGroup);

      // Stall colliders
      this.colliders.push({
        type: 'box',
        minX: 205 + st.x - 2.8,
        maxX: 205 + st.x + 2.8,
        minZ: -110 + st.z - 1.6,
        maxZ: -110 + st.z + 1.6
      });
    });

    // Wooden Barrels & Crates scattered in corners
    [
      [-8, -14], [8, -14], [-8, 14], [8, 14]
    ].forEach(([bx, bz]) => {
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 1.6, 6), woodMat);
      barrel.position.set(bx, 0.8, bz);
      barrel.castShadow = true;
      marketGroup.add(barrel);

      this.colliders.push({
        type: 'cylinder',
        x: 205 + bx,
        z: -110 + bz,
        radius: 0.9
      });
    });

    this.scene.add(marketGroup);
  }

  initMedievalHouses() {
    // Rows of Timber-framed medieval houses with steep gables along market town lanes
    const townHouses = [
      { x: 160, z: -110, w: 14, d: 12, h: 9, roofColor: 0x991b1b }, // Baker's House
      { x: 160, z: -85,  w: 14, d: 12, h: 10, roofColor: 0x1e3a8a }, // Weaver's Guild
      { x: 125, z: -85,  w: 14, d: 12, h: 9, roofColor: 0x78350f }, // Hunter's Abode
      { x: 250, z: -110, w: 14, d: 12, h: 10, roofColor: 0x78350f },// Merchant's Guild
      { x: 250, z: -85,  w: 14, d: 12, h: 9, roofColor: 0x1e3a8a }, // Herbalist
      { x: 285, z: -85,  w: 16, d: 14, h: 11, roofColor: 0x991b1b },// City Watch barracks
      { x: 205, z: -35,  w: 18, d: 14, h: 11, roofColor: 0x15803d } // Grand Apothecary
    ];

    const wallMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7, flatShading: true }); // Stucco
    const timberMat = new THREE.MeshLambertMaterial({ color: 0x451a03, flatShading: true }); // Dark timber
    const stoneBaseMat = new THREE.MeshLambertMaterial({ color: 0x71717a, flatShading: true });

    townHouses.forEach(th => {
      const hGroup = new THREE.Group();
      const y = getTerrainHeight(th.x, th.z);
      hGroup.position.set(th.x, y, th.z);

      const roofMat = new THREE.MeshLambertMaterial({ color: th.roofColor, flatShading: true });

      // Stone Base Floor (Ground level)
      const base = new THREE.Mesh(new THREE.BoxGeometry(th.w, 3.5, th.d), stoneBaseMat);
      base.position.y = 1.75;
      base.castShadow = true;
      base.receiveShadow = true;
      hGroup.add(base);

      // Upper Timber Floor (slightly cantilevered out)
      const upper = new THREE.Mesh(new THREE.BoxGeometry(th.w + 0.8, th.h - 3.5, th.d + 0.8), wallMat);
      upper.position.y = 3.5 + (th.h - 3.5) / 2;
      upper.castShadow = true;
      upper.receiveShadow = true;
      hGroup.add(upper);

      // Exposed Timber Beams (Corners and crosses)
      [-th.w / 2 - 0.45, th.w / 2 + 0.45].forEach(tx => {
        [-th.d / 2 - 0.45, th.d / 2 + 0.45].forEach(tz => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, th.h, 0.35), timberMat);
          post.position.set(tx, th.h / 2, tz);
          hGroup.add(post);
        });
      });

      // Steep Gabled Roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(th.w, th.d) * 0.55, 6.5, 4), roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = th.h + 3.2;
      roof.castShadow = true;
      hGroup.add(roof);

      // Stone Chimney with warm smoke potential
      const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.6, 5.0, 1.6), stoneBaseMat);
      chimney.position.set(th.w * 0.3, th.h + 2.5, th.d * 0.25);
      chimney.castShadow = true;
      hGroup.add(chimney);

      this.scene.add(hGroup);

      // Solid building collider
      this.colliders.push({
        type: 'box',
        minX: th.x - th.w / 2 - 0.5,
        maxX: th.x + th.w / 2 + 0.5,
        minZ: th.z - th.d / 2 - 0.5,
        maxZ: th.z + th.d / 2 + 0.5
      });
    });
  }

  initWindmill() {
    // Old Era Windmill on town outskirts at (x: 60, z: -60)
    const wmGroup = new THREE.Group();
    const y = getTerrainHeight(60, -60);
    wmGroup.position.set(60, y, -60);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x78716c, flatShading: true });
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
    const clothMat = new THREE.MeshLambertMaterial({ color: 0xfef9c3, flatShading: true });

    // Round Stone Tower Base
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 6.5, 16, 8), stoneMat);
    tower.position.y = 8;
    tower.castShadow = true;
    tower.receiveShadow = true;
    wmGroup.add(tower);

    // Conical Thatch/Wood Roof Cap
    const cap = new THREE.Mesh(new THREE.ConeGeometry(5.8, 5.0, 8), woodMat);
    cap.position.y = 18.5;
    cap.castShadow = true;
    wmGroup.add(cap);

    // Rotor & 4 Sail Blades
    const rotorHub = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 1.2, 6), woodMat);
    rotorHub.rotation.x = Math.PI / 2;
    rotorHub.position.set(0, 16, 5.2);
    wmGroup.add(rotorHub);

    const sailGroup = new THREE.Group();
    sailGroup.position.set(0, 16, 5.8);

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;

      // Wooden spar
      const spar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 11, 0.2), woodMat);
      spar.rotation.z = angle;
      spar.position.set(Math.sin(angle) * 5.5, Math.cos(angle) * 5.5, 0);
      sailGroup.add(spar);

      // Cloth sail
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 9.5), clothMat);
      sail.rotation.z = angle;
      sail.position.set(Math.sin(angle) * 5.5 + Math.cos(angle) * 0.9, Math.cos(angle) * 5.5 - Math.sin(angle) * 0.9, 0.05);
      sailGroup.add(sail);
    }

    wmGroup.add(sailGroup);
    this.animatedObjects.push({ type: 'windmill', mesh: sailGroup, speed: 0.7 });

    this.scene.add(wmGroup);

    // Windmill collider
    this.colliders.push({
      type: 'cylinder',
      x: 60,
      z: -60,
      radius: 6.8
    });
  }

  initKingdomDefenses() {
    // Border watchtowers along the road to the crossroads and neighboring realms
    const towerPositions = [
      [35, 10],   // Crossroads gate tower North
      [35, -250], // Northwest border watchtower
      [330, -250],// Northeast border watchtower
      [330, 60]   // Southeast border watchtower
    ];

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x57534e, flatShading: true });
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x991b1b, flatShading: true });

    towerPositions.forEach(([x, z]) => {
      const towerGroup = new THREE.Group();
      towerGroup.position.set(x, 0.5, z);

      // Square watchtower
      const tower = new THREE.Mesh(new THREE.BoxGeometry(7, 18, 7), stoneMat);
      tower.position.y = 9;
      tower.castShadow = true;
      tower.receiveShadow = true;
      towerGroup.add(tower);

      // Top parapet
      const parapet = new THREE.Mesh(new THREE.BoxGeometry(8.2, 2.5, 8.2), stoneMat);
      parapet.position.y = 19;
      parapet.castShadow = true;
      towerGroup.add(parapet);

      // Pyramidal tiled roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(6.2, 5.0, 4), roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 22.5;
      roof.castShadow = true;
      towerGroup.add(roof);

      // Torch on watchtower wall
      const torch = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
      torch.position.set(0, 8, 3.8);
      towerGroup.add(torch);

      const light = new THREE.PointLight(0xf59e0b, 0.9, 14);
      light.position.set(0, 8, 4.2);
      light.userData.baseIntensity = 0.9;
      towerGroup.add(light);
      this.dayNightCycle.registerNightLight(light);

      this.scene.add(towerGroup);

      this.colliders.push({
        type: 'box',
        minX: x - 4.2,
        maxX: x + 4.2,
        minZ: z - 4.2,
        maxZ: z + 4.2
      });
    });

    // Iron Street Lanterns along the cobblestone paths
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x27272a, flatShading: true });
    const lampGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfef08a,
      emissiveIntensity: 0.0
    });
    lampGlowMat.userData.baseEmissive = 1.2;
    this.dayNightCycle.registerNightLight(lampGlowMat);

    const lanternCoords = [
      [80, -60], [160, -60], [240, -60], [320, -60],
      [80, -140], [160, -140], [240, -140], [320, -140],
      [80, -220], [160, -220], [240, -220], [320, -220],
      [160, -20], [240, -20], [160, 20], [240, 20],
      // Grand Royal Avenue lanterns leading to King Reginald's Citadel & Royal Gardens
      [205, -120], [205, -160], [250, -200], [290, -250], [335, -285], [375, -315], [420, -345], [460, -365]
    ];

    lanternCoords.forEach(([lx, lz]) => {
      const lampGroup = new THREE.Group();
      const ly = getTerrainHeight(lx, lz);
      lampGroup.position.set(lx, ly, lz);

      // Wooden/Iron post
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 5.5, 6), poleMat);
      pole.position.y = 2.75;
      pole.castShadow = true;
      lampGroup.add(pole);

      // Hanging medieval lantern box
      const lanternBox = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.7), lampGlowMat);
      lanternBox.position.set(0.6, 5.2, 0);
      lampGroup.add(lanternBox);

      const lampLight = new THREE.PointLight(0xfef08a, 0.0, 15);
      lampLight.position.set(0.6, 5.0, 0);
      lampLight.userData.baseIntensity = 0.95;
      lampGroup.add(lampLight);
      this.dayNightCycle.registerNightLight(lampLight);

      this.scene.add(lampGroup);

      this.colliders.push({
        type: 'cylinder',
        x: lx,
        z: lz,
        radius: 0.35
      });
    });
  }

  update(delta) {
    this.animatedObjects.forEach(obj => {
      if (obj.type === 'windmill') {
        obj.mesh.rotation.z += delta * obj.speed;
      }
    });
  }
}

