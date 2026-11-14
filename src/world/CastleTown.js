import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';

export class CastleTown {
  constructor(scene, dayNightCycle) {
    this.scene = scene;
    this.dayNightCycle = dayNightCycle;
    this.colliders = [];
    this.animatedObjects = [];
    this.townGroup = new THREE.Group();

    // Central town coordinates
    this.townX = 370;
    this.townZ = -250;

    this.initMaterials();
    this.initRoadsAndPaving();
    this.initGrandLionFountain();
    this.initGrandClocktower();
    this.initRoyalBankAndVault();
    this.initHighAlchemistSpire();
    this.initSilverStagInn();
    this.initRoyalSmithy();
    this.initCourtLibrary();
    this.initRoyalBakery();
    this.initPatricianResidences();
    this.initArtisanMarketStalls();
    this.initSunkenRoseGarden();
    this.initSouthGatehouse();
    this.initTownLanternsAndDecor();

    this.scene.add(this.townGroup);
  }

  initMaterials() {
    this.mats = {
      // Stone & Masonry
      stonePaving: new THREE.MeshLambertMaterial({ color: 0x475569, flatShading: true }),
      stoneCurb: new THREE.MeshLambertMaterial({ color: 0x64748b, flatShading: true }),
      stoneAshlar: new THREE.MeshLambertMaterial({ color: 0x64748b, flatShading: true }),
      darkGranite: new THREE.MeshLambertMaterial({ color: 0x334155, flatShading: true }),
      whiteMarble: new THREE.MeshLambertMaterial({ color: 0xf1f5f9, flatShading: true }),
      sandstone: new THREE.MeshLambertMaterial({ color: 0xd6d3d1, flatShading: true }),
      brickRed: new THREE.MeshLambertMaterial({ color: 0x991b1b, flatShading: true }),

      // Plaster & Timber
      stuccoCream: new THREE.MeshLambertMaterial({ color: 0xfef3c7, flatShading: true }),
      stuccoWarm: new THREE.MeshLambertMaterial({ color: 0xfde68a, flatShading: true }),
      timberDark: new THREE.MeshLambertMaterial({ color: 0x451a03, flatShading: true }),
      woodOak: new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true }),
      woodPlank: new THREE.MeshLambertMaterial({ color: 0x92400e, flatShading: true }),

      // Roofs
      slateRoyalBlue: new THREE.MeshLambertMaterial({ color: 0x1e3a8a, flatShading: true }),
      slateNavy: new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true }),
      tileTerracotta: new THREE.MeshLambertMaterial({ color: 0xb45309, flatShading: true }),
      slateSageGreen: new THREE.MeshLambertMaterial({ color: 0x15803d, flatShading: true }),
      copperGreen: new THREE.MeshLambertMaterial({ color: 0x0d9488, flatShading: true }),

      // Metals & Heraldry
      goldLion: new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true }),
      bronzeBell: new THREE.MeshLambertMaterial({ color: 0xd97706, flatShading: true }),
      ironWrought: new THREE.MeshLambertMaterial({ color: 0x1f2937, flatShading: true }),
      silverSteel: new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true }),
      royalBlueBanner: new THREE.MeshLambertMaterial({ color: 0x1d4ed8, flatShading: true }),

      // Nature & Glass
      waterCyan: new THREE.MeshLambertMaterial({ color: 0x0284c7, flatShading: true }),
      glassGlow: new THREE.MeshLambertMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.1, flatShading: true }),
      magicCyanGlow: new THREE.MeshLambertMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.8, flatShading: true }),
      magicPurpleGlow: new THREE.MeshLambertMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 0.8, flatShading: true }),
      leavesHedge: new THREE.MeshLambertMaterial({ color: 0x166534, flatShading: true }),
      leavesPinkBlossom: new THREE.MeshLambertMaterial({ color: 0xf472b6, flatShading: true }),
      leavesWhiteBlossom: new THREE.MeshLambertMaterial({ color: 0xfce7f3, flatShading: true }),
      flowerRoseRed: new THREE.MeshLambertMaterial({ color: 0xef4444, flatShading: true }),
      flowerGold: new THREE.MeshLambertMaterial({ color: 0xfacc15, flatShading: true }),
      flowerLavender: new THREE.MeshLambertMaterial({ color: 0xa855f7, flatShading: true })
    };
  }

  // -------------------------------------------------------------
  // 1. ROADS, PROMENADE & MOSAIC CENTRAL PLAZA
  // -------------------------------------------------------------
  initRoadsAndPaving() {
    const roadGroup = new THREE.Group();

    // A. Grand King's Avenue (North-South: Drawbridge at z: -315 to South Gate at z: -165)
    // Width 16m with stone curbs
    const northSouthAvenue = new THREE.Mesh(new THREE.PlaneGeometry(16, 155), this.mats.stonePaving);
    northSouthAvenue.rotateX(-Math.PI / 2);
    northSouthAvenue.position.set(this.townX, 0.52, -240);
    northSouthAvenue.receiveShadow = true;
    roadGroup.add(northSouthAvenue);

    // Stone Curbs for North-South Avenue
    [-8.2, 8.2].forEach(cx => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 155), this.mats.stoneCurb);
      curb.position.set(this.townX + cx, 0.62, -240);
      curb.receiveShadow = true;
      roadGroup.add(curb);
    });

    // B. East-West Artisan Boulevard (Crossing at z: -250 from x: 310 to x: 430)
    const eastWestAvenue = new THREE.Mesh(new THREE.PlaneGeometry(120, 14), this.mats.stonePaving);
    eastWestAvenue.rotateX(-Math.PI / 2);
    eastWestAvenue.position.set(this.townX, 0.525, this.townZ);
    eastWestAvenue.receiveShadow = true;
    roadGroup.add(eastWestAvenue);

    // Stone Curbs for East-West Avenue
    [-7.2, 7.2].forEach(cz => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(120, 0.25, 0.8), this.mats.stoneCurb);
      curb.position.set(this.townX, 0.62, this.townZ + cz);
      curb.receiveShadow = true;
      roadGroup.add(curb);
    });

    // C. Octagonal Central Mosaic Plaza around the Grand Fountain
    const plazaRadius = 24;
    const plazaPaving = new THREE.Mesh(new THREE.CylinderGeometry(plazaRadius, plazaRadius, 0.15, 8), this.mats.sandstone);
    plazaPaving.position.set(this.townX, 0.54, this.townZ);
    plazaPaving.receiveShadow = true;
    roadGroup.add(plazaPaving);

    // Decorative Royal Ring around fountain
    const ringPaving = new THREE.Mesh(new THREE.TorusGeometry(14, 1.2, 4, 16), this.mats.slateRoyalBlue);
    ringPaving.rotateX(Math.PI / 2);
    ringPaving.position.set(this.townX, 0.62, this.townZ);
    ringPaving.receiveShadow = true;
    roadGroup.add(ringPaving);

    // Radiating Mosaic Accents (8 spokes)
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 10), this.mats.stoneCurb);
      spoke.rotation.y = ang;
      spoke.position.set(this.townX + Math.sin(ang) * 19, 0.62, this.townZ + Math.cos(ang) * 19);
      roadGroup.add(spoke);
    }

    this.townGroup.add(roadGroup);
  }

  // -------------------------------------------------------------
  // 2. THE GRAND MARBLE FOUNTAIN OF THE ROYAL LION (Center: 370, -250)
  // -------------------------------------------------------------
  initGrandLionFountain() {
    const fGroup = new THREE.Group();
    fGroup.position.set(this.townX, 0.5, this.townZ);

    // 1. Lower Octagonal Marble Basin (13m diameter, 1.4m height)
    const lowerBasin = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 7.2, 1.4, 8), this.mats.whiteMarble);
    lowerBasin.position.y = 0.7;
    lowerBasin.castShadow = true;
    lowerBasin.receiveShadow = true;
    fGroup.add(lowerBasin);

    // Basin Coping Lip
    const lowerLip = new THREE.Mesh(new THREE.TorusGeometry(6.8, 0.35, 6, 8), this.mats.whiteMarble);
    lowerLip.rotateX(Math.PI / 2);
    lowerLip.position.y = 1.4;
    fGroup.add(lowerLip);

    // Lower Water Pool
    const lowerWater = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.2, 0.2, 8), this.mats.waterCyan);
    lowerWater.position.y = 1.25;
    fGroup.add(lowerWater);

    // 2. Middle Pedestal with Carved Water Spout Gargoyles
    const midPedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.4, 2.2, 8), this.mats.whiteMarble);
    midPedestal.position.y = 2.4;
    midPedestal.castShadow = true;
    fGroup.add(midPedestal);

    // Middle Basin (4.4m diameter)
    const midBasin = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.7, 8), this.mats.whiteMarble);
    midBasin.position.y = 3.6;
    midBasin.castShadow = true;
    fGroup.add(midBasin);

    const midWater = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.15, 8), this.mats.waterCyan);
    midWater.position.y = 3.9;
    fGroup.add(midWater);

    // 3. Upper Pedestal & Basin (2.2m diameter)
    const upperPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 1.8, 8), this.mats.whiteMarble);
    upperPedestal.position.y = 4.8;
    fGroup.add(upperPedestal);

    const upperBasin = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.4, 0.5, 8), this.mats.whiteMarble);
    upperBasin.position.y = 5.8;
    upperBasin.castShadow = true;
    fGroup.add(upperBasin);

    // 4. Golden Monumental Royal Lion Statuette at Peak
    const lionBase = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 1.0), this.mats.goldLion);
    lionBase.position.y = 6.3;
    fGroup.add(lionBase);

    const lionTorso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.4, 1.6), this.mats.goldLion);
    lionTorso.position.set(0, 7.1, 0);
    fGroup.add(lionTorso);

    const lionHead = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.9), this.mats.goldLion);
    lionHead.position.set(0, 8.0, 0.6);
    fGroup.add(lionHead);

    const lionMane = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 0), this.mats.goldLion);
    lionMane.position.set(0, 8.0, 0.3);
    fGroup.add(lionMane);

    // Animated Fountain Shimmer Spray
    const sprayGeom = new THREE.ConeGeometry(0.8, 1.4, 6, 1, true);
    const sprayMesh = new THREE.Mesh(sprayGeom, this.mats.waterCyan);
    sprayMesh.position.set(0, 8.8, 0.6);
    fGroup.add(sprayMesh);
    this.animatedObjects.push({ type: 'fountain_spray', mesh: sprayMesh });

    // 4 Curved White Marble Benches around the plaza
    const benchDists = [10.5, -10.5];
    benchDists.forEach(bx => {
      benchDists.forEach(bz => {
        const benchGroup = new THREE.Group();
        benchGroup.position.set(bx, 0, bz);
        benchGroup.lookAt(0, 0, 0);

        // Bench Seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.45, 1.0), this.mats.whiteMarble);
        seat.position.y = 0.5;
        seat.castShadow = true;
        benchGroup.add(seat);

        // Bench Backrest
        const back = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 0.25), this.mats.whiteMarble);
        back.position.set(0, 1.1, -0.4);
        benchGroup.add(back);

        // Flanking Stone Flower Planters with Red & Gold Roses
        [-2.3, 2.3].forEach(px => {
          const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.4, 0.8, 6), this.mats.sandstone);
          pot.position.set(px, 0.4, 0);
          pot.castShadow = true;
          benchGroup.add(pot);

          const plant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), this.mats.leavesHedge);
          plant.position.set(px, 0.95, 0);
          benchGroup.add(plant);

          const flower = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), (px < 0 ? this.mats.flowerRoseRed : this.mats.flowerGold));
          flower.position.set(px, 1.3, 0);
          benchGroup.add(flower);
        });

        fGroup.add(benchGroup);

        this.colliders.push({
          type: 'box',
          minX: this.townX + bx - 2.0,
          maxX: this.townX + bx + 2.0,
          minZ: this.townZ + bz - 1.2,
          maxZ: this.townZ + bz + 1.2
        });
      });
    });

    this.townGroup.add(fGroup);

    // Fountain basin solid collider
    this.colliders.push({
      type: 'cylinder',
      x: this.townX,
      z: this.townZ,
      radius: 7.2
    });
  }

  // -------------------------------------------------------------
  // 3. THE GRAND CLOCKTOWER OF HIGH VALORIA (x: 340, z: -245)
  // -------------------------------------------------------------
  initGrandClocktower() {
    const ctGroup = new THREE.Group();
    const cx = 340;
    const cz = -245;
    ctGroup.position.set(cx, 0.5, cz);

    const towerW = 8.4;
    const towerH = 26;

    // 1. Heavy Stepped Granite Plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(towerW + 2.5, 3.0, towerW + 2.5), this.mats.darkGranite);
    plinth.position.y = 1.5;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    ctGroup.add(plinth);

    // 2. Main Stone Tower Shaft with Quoined Corner Buttresses
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(towerW, towerH - 8, towerW), this.mats.stoneAshlar);
    shaft.position.y = 3.0 + (towerH - 8) / 2;
    shaft.castShadow = true;
    ctGroup.add(shaft);

    // Corner Buttress Pillars
    [-towerW / 2 - 0.3, towerW / 2 + 0.3].forEach(bx => {
      [-towerW / 2 - 0.3, towerW / 2 + 0.3].forEach(bz => {
        const buttress = new THREE.Mesh(new THREE.BoxGeometry(1.2, towerH - 8, 1.2), this.mats.stoneCurb);
        buttress.position.set(bx, 3.0 + (towerH - 8) / 2, bz);
        ctGroup.add(buttress);
      });
    });

    // 3. Clock Stage Chamber (x: 4 sides)
    const clockStageH = 5.5;
    const clockStageY = towerH - 4;
    const clockStage = new THREE.Mesh(new THREE.BoxGeometry(towerW + 1.2, clockStageH, towerW + 1.2), this.mats.darkGranite);
    clockStage.position.y = clockStageY;
    ctGroup.add(clockStage);

    // 4 Animated Clock Faces (North, South, East, West)
    const clockRotations = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
    this.clockHands = [];

    clockRotations.forEach(rot => {
      const faceGroup = new THREE.Group();
      faceGroup.rotation.y = rot;

      // Dark Dial Rim
      const dialRim = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.25, 16), this.mats.goldLion);
      dialRim.rotateX(Math.PI / 2);
      dialRim.position.set(0, clockStageY, (towerW + 1.2) / 2 + 0.15);
      faceGroup.add(dialRim);

      // White Porcelain Face
      const face = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 0.28, 16), this.mats.whiteMarble);
      face.rotateX(Math.PI / 2);
      face.position.set(0, clockStageY, (towerW + 1.2) / 2 + 0.2);
      faceGroup.add(face);

      // Clock Center Pivot
      const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.45, 8), this.mats.goldLion);
      pivot.rotateX(Math.PI / 2);
      pivot.position.set(0, clockStageY, (towerW + 1.2) / 2 + 0.35);
      faceGroup.add(pivot);

      // Hour Hand & Minute Hand
      const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.05), this.mats.ironWrought);
      hourHand.position.set(0, clockStageY + 0.45, (towerW + 1.2) / 2 + 0.38);
      faceGroup.add(hourHand);

      const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.05), this.mats.ironWrought);
      minHand.position.set(0, clockStageY + 0.65, (towerW + 1.2) / 2 + 0.42);
      faceGroup.add(minHand);

      this.clockHands.push({ hour: hourHand, min: minHand, baseY: clockStageY, offsetZ: (towerW + 1.2) / 2 + 0.4 });

      ctGroup.add(faceGroup);
    });

    // 4. Open Arched Belfry with Golden Bronze Bell
    const belfryY = clockStageY + clockStageH / 2 + 2.5;
    const belfryArch = new THREE.Mesh(new THREE.BoxGeometry(towerW + 0.6, 4.5, towerW + 0.6), this.mats.stoneAshlar);
    belfryArch.position.y = belfryY;
    ctGroup.add(belfryArch);

    // The Big Bronze Town Bell
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 2.0, 8), this.mats.bronzeBell);
    bell.position.y = belfryY;
    bell.castShadow = true;
    ctGroup.add(bell);
    this.animatedObjects.push({ type: 'clock_bell', mesh: bell });

    // 5. Steep Royal Blue Pyramidal Roof with Iron Weather Vane
    const roofH = 8.5;
    const roof = new THREE.Mesh(new THREE.ConeGeometry((towerW + 1.4) * 0.72, roofH, 4), this.mats.slateRoyalBlue);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = belfryY + 2.25 + roofH / 2;
    roof.castShadow = true;
    ctGroup.add(roof);

    // Weathercock Vane Spire at Peak
    const vaneSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 3.5, 6), this.mats.goldLion);
    vaneSpire.position.y = belfryY + 2.25 + roofH + 1.75;
    ctGroup.add(vaneSpire);

    const vaneBanner = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.08), this.mats.goldLion);
    vaneBanner.position.set(0.45, belfryY + 2.25 + roofH + 2.5, 0);
    ctGroup.add(vaneBanner);

    // Double Oak Ground Entry Doors
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.8, 0.6), this.mats.woodOak);
    door.position.set(0, 2.0, towerW / 2 + 0.1);
    ctGroup.add(door);

    this.townGroup.add(ctGroup);

    // Clocktower Collider
    this.colliders.push({
      type: 'box',
      minX: cx - (towerW + 2.5) / 2,
      maxX: cx + (towerW + 2.5) / 2,
      minZ: cz - (towerW + 2.5) / 2,
      maxZ: cz + (towerW + 2.5) / 2
    });
  }

  // -------------------------------------------------------------
  // 4. THE ROYAL BANK & TREASURY OF VALORIA (x: 332, z: -282)
  // -------------------------------------------------------------
  initRoyalBankAndVault() {
    const bGroup = new THREE.Group();
    const bx = 332;
    const bz = -282;
    bGroup.position.set(bx, 0.5, bz);

    const bW = 18;
    const bD = 14;
    const bH = 9.5;

    // 1. Heavy Granite Podium with Front Steps
    const podium = new THREE.Mesh(new THREE.BoxGeometry(bW + 2, 1.2, bD + 2), this.mats.darkGranite);
    podium.position.y = 0.6;
    podium.castShadow = true;
    podium.receiveShadow = true;
    bGroup.add(podium);

    // Front Marble Steps
    const steps = new THREE.Mesh(new THREE.BoxGeometry(8, 0.6, 3), this.mats.whiteMarble);
    steps.position.set(0, 0.3, bD / 2 + 2);
    steps.receiveShadow = true;
    bGroup.add(steps);

    // 2. Main Classical Ashlar Bank Building
    const building = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), this.mats.stoneAshlar);
    building.position.y = 1.2 + bH / 2;
    building.castShadow = true;
    bGroup.add(building);

    // 3. Portico with 4 Classical White Marble Columns
    const porticoZ = bD / 2 + 1.2;
    [-6, -2, 2, 6].forEach(px => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, bH - 1, 8), this.mats.whiteMarble);
      col.position.set(px, 1.2 + (bH - 1) / 2, porticoZ);
      col.castShadow = true;
      bGroup.add(col);
    });

    // Triangular Pediment over Portico
    const pediment = new THREE.Mesh(new THREE.ConeGeometry(8.5, 3.2, 4), this.mats.whiteMarble);
    pediment.rotation.y = Math.PI / 4;
    pediment.position.set(0, 1.2 + bH + 1.2, porticoZ - 0.5);
    pediment.castShadow = true;
    bGroup.add(pediment);

    // Golden Royal Lion Coin Crest in Pediment
    const pedimentCrest = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.3, 12), this.mats.goldLion);
    pedimentCrest.rotateX(Math.PI / 2);
    pedimentCrest.position.set(0, 1.2 + bH + 0.8, porticoZ + 0.8);
    bGroup.add(pedimentCrest);

    // 4. Heavy Reinforced Iron Vault Doors
    const vaultDoor = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.5, 0.6), this.mats.ironWrought);
    vaultDoor.position.set(0, 1.2 + 2.75, bD / 2 + 0.2);
    bGroup.add(vaultDoor);

    // Gold door studs and vault wheel
    const vaultWheel = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.12, 6, 12), this.mats.goldLion);
    vaultWheel.position.set(0, 1.2 + 2.75, bD / 2 + 0.55);
    bGroup.add(vaultWheel);

    // 5. Stately Royal Blue Hipped Slate Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(bW, bD) * 0.54, 5.5, 4), this.mats.slateRoyalBlue);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 1.2 + bH + 2.75;
    roof.castShadow = true;
    bGroup.add(roof);

    // Barred Stained-Glass Windows with Night Glow
    [-5, 5].forEach(wx => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 0.4), this.mats.glassGlow);
      win.position.set(wx, 1.2 + 5.0, bD / 2 + 0.1);
      bGroup.add(win);

      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.6, 0.5), this.mats.ironWrought);
      bar.position.set(wx, 1.2 + 5.0, bD / 2 + 0.2);
      bGroup.add(bar);
    });

    this.townGroup.add(bGroup);

    this.colliders.push({
      type: 'box',
      minX: bx - bW / 2 - 1,
      maxX: bx + bW / 2 + 1,
      minZ: bz - bD / 2 - 1,
      maxZ: bz + bD / 2 + 2.5
    });
  }

  // -------------------------------------------------------------
  // 5. THE HIGH ALCHEMIST'S SPIRE & OBSERVATORY (x: 418, z: -280)
  // -------------------------------------------------------------
  initHighAlchemistSpire() {
    const aGroup = new THREE.Group();
    const ax = 418;
    const az = -280;
    aGroup.position.set(ax, 0.5, az);

    const hallW = 16;
    const hallD = 12;
    const hallH = 8.5;

    // 1. Main Sandstone Academy Hall
    const hall = new THREE.Mesh(new THREE.BoxGeometry(hallW, hallH, hallD), this.mats.sandstone);
    hall.position.set(-2, hallH / 2, 0);
    hall.castShadow = true;
    aGroup.add(hall);

    // Steep Teal/Indigo Slate Roof
    const hallRoof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(hallW, hallD) * 0.52, 6.0, 4), this.mats.copperGreen);
    hallRoof.rotation.y = Math.PI / 4;
    hallRoof.position.set(-2, hallH + 3.0, 0);
    hallRoof.castShadow = true;
    aGroup.add(hallRoof);

    // 2. Attached Round Observatory Tower (x: 6, z: 2)
    const towerR = 4.2;
    const towerH = 18;
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(towerR, towerR + 0.6, towerH, 12), this.mats.stoneAshlar);
    tower.position.set(6, towerH / 2, 2);
    tower.castShadow = true;
    aGroup.add(tower);

    // Rotating Copper Observatory Dome at Top
    const dome = new THREE.Mesh(new THREE.SphereGeometry(towerR + 0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), this.mats.copperGreen);
    dome.position.set(6, towerH, 2);
    dome.castShadow = true;
    aGroup.add(dome);

    // Brass Celestial Telescope jutting from dome slit
    const telescope = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 4.5, 8), this.mats.goldLion);
    telescope.rotation.x = -0.7;
    telescope.rotation.y = 0.5;
    telescope.position.set(6.8, towerH + 2.2, 4.2);
    aGroup.add(telescope);

    // 3. Glass Conservatory Greenhouse Bay (x: -5, z: 6)
    const greenhouse = new THREE.Mesh(new THREE.BoxGeometry(6.5, 4.0, 3.5), this.mats.glassGlow);
    greenhouse.position.set(-5, 2.0, hallD / 2 + 1.2);
    aGroup.add(greenhouse);

    // Magical Pulsing Mana Crystals inside/outside
    const orb1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 0), this.mats.magicCyanGlow);
    orb1.position.set(-5, 3.5, hallD / 2 + 1.2);
    aGroup.add(orb1);

    const orb2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.65, 0), this.mats.magicPurpleGlow);
    orb2.position.set(6, 12, 6.2);
    aGroup.add(orb2);

    this.animatedObjects.push({ type: 'magic_orb', mesh: orb1, speed: 2.0 });
    this.animatedObjects.push({ type: 'magic_orb', mesh: orb2, speed: 1.5 });

    // Exterior Herb Drying Trellis with Lavender and Sage
    const trellis = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.2, 0.4), this.mats.woodOak);
    trellis.position.set(-8, 1.6, hallD / 2 + 0.3);
    aGroup.add(trellis);

    this.townGroup.add(aGroup);

    this.colliders.push({
      type: 'box',
      minX: ax - hallW / 2 - 3,
      maxX: ax + hallW / 2 + 3,
      minZ: az - hallD / 2 - 2,
      maxZ: az + hallD / 2 + 3
    });
  }

  // -------------------------------------------------------------
  // 6. THE SILVER STAG GRAND COACHING INN & WINERY (x: 418, z: -230)
  // -------------------------------------------------------------
  initSilverStagInn() {
    const innGroup = new THREE.Group();
    const ix = 418;
    const iz = -230;
    innGroup.position.set(ix, 0.5, iz);

    const innW = 20;
    const innD = 15;
    const innH = 11;

    // 1. Stone Ground Floor (Tavern Taproom)
    const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(innW, 4.5, innD), this.mats.stoneAshlar);
    groundFloor.position.y = 2.25;
    groundFloor.castShadow = true;
    groundFloor.receiveShadow = true;
    innGroup.add(groundFloor);

    // 2. Overhanging Cantilevered Timber Upper Floor (Guest Rooms)
    const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(innW + 1.2, innH - 4.5, innD + 1.2), this.mats.stuccoCream);
    upperFloor.position.y = 4.5 + (innH - 4.5) / 2;
    upperFloor.castShadow = true;
    innGroup.add(upperFloor);

    // Exposed Half-Timber Cross-Beams
    [-innW / 2 - 0.65, innW / 2 + 0.65].forEach(tx => {
      [-innD / 2 - 0.65, innD / 2 + 0.65].forEach(tz => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, innH - 4.5, 0.4), this.mats.timberDark);
        post.position.set(tx, 4.5 + (innH - 4.5) / 2, tz);
        innGroup.add(post);
      });
    });

    // 3. Steep Terracotta Tiled Gabled Roof with Wooden Dormers
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(innW, innD) * 0.54, 6.5, 4), this.mats.tileTerracotta);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = innH + 3.25;
    roof.castShadow = true;
    innGroup.add(roof);

    // Twin Red Brick Chimneys
    [-6, 6].forEach(cx => {
      const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.8, 6.5, 1.8), this.mats.brickRed);
      chimney.position.set(cx, innH + 3.0, 0);
      chimney.castShadow = true;
      innGroup.add(chimney);
    });

    // 4. Hanging Painted Sign: "The Silver Stag Inn"
    const signBracket = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 0.2), this.mats.ironWrought);
    signBracket.position.set(-innW / 2 - 1.2, 5.5, 3);
    innGroup.add(signBracket);

    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 0.15), this.mats.woodOak);
    signBoard.position.set(-innW / 2 - 1.2, 4.5, 3);
    innGroup.add(signBoard);

    // Golden Stag Crest on Sign
    const stag = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 4), this.mats.goldLion);
    stag.position.set(-innW / 2 - 1.2, 4.5, 3.1);
    innGroup.add(stag);

    // 5. Outdoor Timber Patio with Benches, Tables & Wine Barrels
    const patioW = 12;
    const patioD = 6;
    const patioDeck = new THREE.Mesh(new THREE.BoxGeometry(patioW, 0.3, patioD), this.mats.woodPlank);
    patioDeck.position.set(0, 0.15, innD / 2 + patioD / 2);
    patioDeck.receiveShadow = true;
    innGroup.add(patioDeck);

    // Outdoor Tables & Benches
    [-3.5, 3.5].forEach(tx => {
      const table = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 1.6), this.mats.woodOak);
      table.position.set(tx, 0.6, innD / 2 + 2.5);
      table.castShadow = true;
      innGroup.add(table);

      [-1.2, 1.2].forEach(bz => {
        const bench = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.5, 0.5), this.mats.woodOak);
        bench.position.set(tx, 0.4, innD / 2 + 2.5 + bz);
        innGroup.add(bench);
      });
    });

    // Oak Wine Casks stacked near entrance
    [-7, -7.8].forEach((wx, idx) => {
      const cask = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 1.6, 8), this.mats.woodOak);
      cask.position.set(wx, 0.8 + idx * 0.4, innD / 2 + 2);
      cask.castShadow = true;
      innGroup.add(cask);
    });

    this.townGroup.add(innGroup);

    this.colliders.push({
      type: 'box',
      minX: ix - innW / 2 - 1.5,
      maxX: ix + innW / 2 + 1.5,
      minZ: iz - innD / 2 - 1.5,
      maxZ: iz + innD / 2 + patioD + 1
    });
  }

  // -------------------------------------------------------------
  // 7. THE MASTER ARMOURER & ROYAL SMITHY (x: 330, z: -215)
  // -------------------------------------------------------------
  initRoyalSmithy() {
    const sGroup = new THREE.Group();
    const sx = 330;
    const sz = -215;
    sGroup.position.set(sx, 0.5, sz);

    const sW = 16;
    const sD = 12;
    const sH = 7.5;

    // 1. Heavy Stone Arcade Workshop
    const smithy = new THREE.Mesh(new THREE.BoxGeometry(sW, sH, sD), this.mats.darkGranite);
    smithy.position.set(0, sH / 2, 0);
    smithy.castShadow = true;
    sGroup.add(smithy);

    // Timber Roof with Heavy Stone Chimney
    const sRoof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(sW, sD) * 0.52, 5.0, 4), this.mats.slateNavy);
    sRoof.rotation.y = Math.PI / 4;
    sRoof.position.set(0, sH + 2.5, 0);
    sRoof.castShadow = true;
    sGroup.add(sRoof);

    // Colossal Stone Forge Hearth with Glowing Embers
    const forgeHearth = new THREE.Mesh(new THREE.BoxGeometry(5.0, 2.5, 4.0), this.mats.darkGranite);
    forgeHearth.position.set(sW / 2 + 2.0, 1.25, 0);
    sGroup.add(forgeHearth);

    const forgeEmbers = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.6, 2.4), new THREE.MeshLambertMaterial({ color: 0xef4444, emissive: 0xb91c1c, flatShading: true }));
    forgeEmbers.position.set(sW / 2 + 2.0, 2.2, 0);
    sGroup.add(forgeEmbers);

    const forgeLight = new THREE.PointLight(0xf97316, 1.8, 16);
    forgeLight.position.set(sW / 2 + 2.0, 3.2, 0);
    forgeLight.userData.baseIntensity = 1.8;
    sGroup.add(forgeLight);
    this.dayNightCycle.registerNightLight(forgeLight);

    // Dual Steel Anvils on Timber Tree Trunks
    [sW / 2 + 1.5].forEach(ax => {
      [-2.2, 2.2].forEach(az => {
        const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 1.0, 8), this.mats.timberDark);
        stump.position.set(ax, 0.5, az);
        sGroup.add(stump);

        const anvil = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.6, 0.6), this.mats.ironWrought);
        anvil.position.set(ax, 1.25, az);
        anvil.castShadow = true;
        sGroup.add(anvil);
      });
    });

    // Weapon Display Racks (Halberds & Crested Shields)
    const rack = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.2, 0.8), this.mats.woodOak);
    rack.position.set(sW / 2 + 2.0, 1.1, 4.2);
    sGroup.add(rack);

    this.townGroup.add(sGroup);

    this.colliders.push({
      type: 'box',
      minX: sx - sW / 2 - 1,
      maxX: sx + sW / 2 + 5,
      minZ: sz - sD / 2 - 1,
      maxZ: sz + sD / 2 + 1
    });
  }

  // -------------------------------------------------------------
  // 8. THE COURT LIBRARY & CARTOGRAPHY HOUSE (x: 418, z: -188)
  // -------------------------------------------------------------
  initCourtLibrary() {
    const lGroup = new THREE.Group();
    const lx = 418;
    const lz = -188;
    lGroup.position.set(lx, 0.5, lz);

    const lW = 16;
    const lD = 13;
    const lH = 10;

    // Classical Stone Hall with Bay Windows
    const hall = new THREE.Mesh(new THREE.BoxGeometry(lW, lH, lD), this.mats.stoneAshlar);
    hall.position.set(0, lH / 2, 0);
    hall.castShadow = true;
    lGroup.add(hall);

    // Arched Entrance Portal with Open Book Crest
    const arch = new THREE.Mesh(new THREE.BoxGeometry(4.0, 5.0, 1.2), this.mats.whiteMarble);
    arch.position.set(-lW / 2 - 0.5, 2.5, 0);
    lGroup.add(arch);

    const bookCrest = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.3), this.mats.goldLion);
    bookCrest.position.set(-lW / 2 - 0.8, 5.2, 0);
    lGroup.add(bookCrest);

    // Balcony with Brass Celestial Armillary Sphere
    const balcony = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.6, 3.5), this.mats.stoneCurb);
    balcony.position.set(-lW / 2 - 1.2, 6.2, 0);
    lGroup.add(balcony);

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 8), this.mats.goldLion);
    sphere.position.set(-lW / 2 - 1.2, 7.8, 0);
    lGroup.add(sphere);

    // Indigo Slate Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(lW, lD) * 0.54, 5.5, 4), this.mats.slateRoyalBlue);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, lH + 2.75, 0);
    roof.castShadow = true;
    lGroup.add(roof);

    this.townGroup.add(lGroup);

    this.colliders.push({
      type: 'box',
      minX: lx - lW / 2 - 2.5,
      maxX: lx + lW / 2 + 1,
      minZ: lz - lD / 2 - 1,
      maxZ: lz + lD / 2 + 1
    });
  }

  // -------------------------------------------------------------
  // 9. THE ROYAL PATISSERIE & GUILD BAKERY (x: 330, z: -180)
  // -------------------------------------------------------------
  initRoyalBakery() {
    const bGroup = new THREE.Group();
    const bx = 330;
    const bz = -180;
    bGroup.position.set(bx, 0.5, bz);

    const bW = 14;
    const bD = 11;
    const bH = 8.5;

    // Timber & Stucco Bakery Building
    const building = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), this.mats.stuccoWarm);
    building.position.set(0, bH / 2, 0);
    building.castShadow = true;
    bGroup.add(building);

    // Terracotta Tiled Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(bW, bD) * 0.55, 5.0, 4), this.mats.tileTerracotta);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, bH + 2.5, 0);
    bGroup.add(roof);

    // Outdoor Bakery Canopy with Bread Display Tables
    const awning = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.3, 3.5), this.mats.tileTerracotta);
    awning.position.set(bW / 2 + 1.6, 3.8, 0);
    awning.rotation.z = -0.15;
    bGroup.add(awning);

    const breadTable = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.0, 2.0), this.mats.woodOak);
    breadTable.position.set(bW / 2 + 1.6, 0.5, 0);
    bGroup.add(breadTable);

    // Golden Bread Loaves on Table
    [-1.6, -0.5, 0.5, 1.6].forEach(lx => {
      const loaf = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.8, 6), this.mats.goldLion);
      loaf.rotation.z = Math.PI / 2;
      loaf.position.set(bW / 2 + 1.6, 1.2, lx);
      bGroup.add(loaf);
    });

    this.townGroup.add(bGroup);

    this.colliders.push({
      type: 'box',
      minX: bx - bW / 2 - 1,
      maxX: bx + bW / 2 + 3.5,
      minZ: bz - bD / 2 - 1,
      maxZ: bz + bD / 2 + 1
    });
  }

  // -------------------------------------------------------------
  // 10. HIGH VALORIAN PATRICIAN RESIDENCES (4 Luxury Merchant Villas)
  // -------------------------------------------------------------
  initPatricianResidences() {
    const villas = [
      // North-West Villa (x: 348, z: -298)
      { x: 348, z: -298, w: 12, d: 10, h: 10, roofColor: this.mats.slateSageGreen, dormers: 2 },
      // North-East Villa (x: 395, z: -298)
      { x: 395, z: -298, w: 13, d: 11, h: 11, roofColor: this.mats.tileTerracotta, dormers: 3 },
      // South-West Villa (x: 350, z: -188)
      { x: 350, z: -188, w: 12, d: 10, h: 9.5, roofColor: this.mats.slateNavy, dormers: 2 },
      // South-East Villa (x: 395, z: -188)
      { x: 395, z: -188, w: 13, d: 11, h: 10, roofColor: this.mats.slateRoyalBlue, dormers: 2 }
    ];

    villas.forEach(v => {
      const vGroup = new THREE.Group();
      vGroup.position.set(v.x, 0.5, v.z);

      // Stone Ground Base
      const base = new THREE.Mesh(new THREE.BoxGeometry(v.w, 3.5, v.d), this.mats.stoneAshlar);
      base.position.y = 1.75;
      base.castShadow = true;
      vGroup.add(base);

      // Upper Timber-and-Plaster Floors
      const upper = new THREE.Mesh(new THREE.BoxGeometry(v.w + 0.8, v.h - 3.5, v.d + 0.8), this.mats.stuccoCream);
      upper.position.y = 3.5 + (v.h - 3.5) / 2;
      upper.castShadow = true;
      vGroup.add(upper);

      // Gabled Roof
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(v.w, v.d) * 0.54, 5.5, 4), v.roofColor);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = v.h + 2.75;
      roof.castShadow = true;
      vGroup.add(roof);

      // Flowerboxes with blooming red & gold geraniums under windows
      [-v.w * 0.25, v.w * 0.25].forEach(fx => {
        const box = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.35, 0.4), this.mats.woodOak);
        box.position.set(fx, 5.2, (v.d + 0.8) / 2 + 0.25);
        vGroup.add(box);

        const flowers = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.35, 0.3), this.mats.flowerRoseRed);
        flowers.position.set(fx, 5.55, (v.d + 0.8) / 2 + 0.25);
        vGroup.add(flowers);
      });

      // Stone Chimney
      const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.4, 4.5, 1.4), this.mats.stoneAshlar);
      chimney.position.set(v.w * 0.3, v.h + 2.5, v.d * 0.2);
      vGroup.add(chimney);

      this.townGroup.add(vGroup);

      this.colliders.push({
        type: 'box',
        minX: v.x - v.w / 2 - 0.6,
        maxX: v.x + v.w / 2 + 0.6,
        minZ: v.z - v.d / 2 - 0.6,
        maxZ: v.z + v.d / 2 + 0.6
      });
    });
  }

  // -------------------------------------------------------------
  // 11. THE ROYAL FLOWER MARKET & ARTISAN PROMENADE (z: -218 to -202)
  // -------------------------------------------------------------
  initArtisanMarketStalls() {
    const stalls = [
      // West Side: Royal Florist & Fine Silks
      { x: this.townX - 10, z: -218, rot: 0.1, color: 0xec4899, title: '🌸 Royal Florist & Nursery', goods: 'flowers' },
      { x: this.townX - 10, z: -202, rot: -0.05, color: 0x1d4ed8, title: '🧵 Fine Silks & Royal Tapestries', goods: 'silks' },
      // East Side: Goldsmith & Rare Spices
      { x: this.townX + 10, z: -218, rot: -0.1, color: 0xf59e0b, title: '💎 Imperial Goldsmith & Jewels', goods: 'jewels' },
      { x: this.townX + 10, z: -202, rot: 0.05, color: 0x10b981, title: '🌿 Exotic Spices & Perfumery', goods: 'spices' }
    ];

    stalls.forEach(st => {
      const sGroup = new THREE.Group();
      sGroup.position.set(st.x, 0.5, st.z);
      sGroup.rotation.y = st.rot;

      // Timber Counter Table
      const table = new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.2, 2.5), this.mats.woodOak);
      table.position.y = 0.6;
      table.castShadow = true;
      sGroup.add(table);

      // Four Corner Posts
      [-2.4, 2.4].forEach(px => {
        [-1.0, 1.0].forEach(pz => {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.5, 4), this.mats.woodOak);
          post.position.set(px, 1.75, pz);
          sGroup.add(post);
        });
      });

      // Striped Curved Fabric Canopy
      const canopyMat = new THREE.MeshLambertMaterial({ color: st.color, flatShading: true });
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.45, 2.9), canopyMat);
      canopy.position.set(0, 3.4, 0);
      canopy.castShadow = true;
      sGroup.add(canopy);

      // Goods Displays on Table
      if (st.goods === 'flowers') {
        // Potted plants and flower pots
        [-1.6, 0, 1.6].forEach((gx, idx) => {
          const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.5, 6), this.mats.sandstone);
          pot.position.set(gx, 1.45, 0);
          sGroup.add(pot);

          const blossom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), idx === 0 ? this.mats.flowerRoseRed : (idx === 1 ? this.mats.flowerLavender : this.mats.flowerGold));
          blossom.position.set(gx, 1.85, 0);
          sGroup.add(blossom);
        });
      } else if (st.goods === 'silks') {
        // Rolls of rich fabrics
        [-1.6, -0.5, 0.5, 1.6].forEach(gx => {
          const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.6, 8), this.mats.royalBlueBanner);
          bolt.rotation.x = Math.PI / 2;
          bolt.position.set(gx, 1.4, 0);
          sGroup.add(bolt);
        });
      } else if (st.goods === 'jewels') {
        // Sparkling treasure chests & velvet display cases
        const chest = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 1.0), this.mats.goldLion);
        chest.position.set(0, 1.5, 0);
        sGroup.add(chest);
      } else {
        // Spice jars and ceramic pots
        [-1.6, -0.6, 0.6, 1.6].forEach(gx => {
          const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.65, 6), this.mats.sandstone);
          jar.position.set(gx, 1.45, 0);
          sGroup.add(jar);
        });
      }

      this.townGroup.add(sGroup);

      this.colliders.push({
        type: 'box',
        minX: st.x - 3.0,
        maxX: st.x + 3.0,
        minZ: st.z - 1.8,
        maxZ: st.z + 1.8
      });
    });
  }

  // -------------------------------------------------------------
  // 12. THE SUNKEN ROSE GARDEN & BOTANICAL SANCTUARY (x: 370, z: -288)
  // -------------------------------------------------------------
  initSunkenRoseGarden() {
    const gGroup = new THREE.Group();
    const gx = this.townX;
    const gz = -288;
    gGroup.position.set(gx, 0.5, gz);

    const gardenW = 32;
    const gardenD = 22;

    // 1. Low White Marble Balustrade Enclosure with Open Gateways
    // North Balustrade
    const balustradeN1 = new THREE.Mesh(new THREE.BoxGeometry(12, 1.0, 0.8), this.mats.whiteMarble);
    balustradeN1.position.set(-9, 0.5, -gardenD / 2);
    gGroup.add(balustradeN1);

    const balustradeN2 = new THREE.Mesh(new THREE.BoxGeometry(12, 1.0, 0.8), this.mats.whiteMarble);
    balustradeN2.position.set(9, 0.5, -gardenD / 2);
    gGroup.add(balustradeN2);

    // South Balustrade
    const balustradeS1 = new THREE.Mesh(new THREE.BoxGeometry(12, 1.0, 0.8), this.mats.whiteMarble);
    balustradeS1.position.set(-9, 0.5, gardenD / 2);
    gGroup.add(balustradeS1);

    const balustradeS2 = new THREE.Mesh(new THREE.BoxGeometry(12, 1.0, 0.8), this.mats.whiteMarble);
    balustradeS2.position.set(9, 0.5, gardenD / 2);
    gGroup.add(balustradeS2);

    // East & West Balustrades
    [-gardenW / 2, gardenW / 2].forEach(bx => {
      const balustradeSide = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, gardenD), this.mats.whiteMarble);
      balustradeSide.position.set(bx, 0.5, 0);
      gGroup.add(balustradeSide);

      this.colliders.push({
        type: 'box',
        minX: gx + bx - 0.5,
        maxX: gx + bx + 0.5,
        minZ: gz - gardenD / 2,
        maxZ: gz + gardenD / 2
      });
    });

    // 2. Central White Stone Octagonal Gazebo (x: 0, z: 0)
    const gazeboR = 3.5;
    const gazeboBase = new THREE.Mesh(new THREE.CylinderGeometry(gazeboR, gazeboR + 0.3, 0.5, 8), this.mats.whiteMarble);
    gazeboBase.position.y = 0.25;
    gGroup.add(gazeboBase);

    // 8 Classical Fluted Columns
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.8, 6), this.mats.whiteMarble);
      col.position.set(Math.sin(ang) * (gazeboR - 0.4), 2.15, Math.cos(ang) * (gazeboR - 0.4));
      col.castShadow = true;
      gGroup.add(col);
    }

    // Gazebo Dome Roof with Climbing Rose Vines
    const gazeboDome = new THREE.Mesh(new THREE.ConeGeometry(gazeboR + 0.4, 2.2, 8), this.mats.copperGreen);
    gazeboDome.position.y = 5.1;
    gazeboDome.castShadow = true;
    gGroup.add(gazeboDome);

    // Sundial Monument in Center of Gazebo
    const sundialPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.2, 8), this.mats.whiteMarble);
    sundialPedestal.position.y = 0.85;
    gGroup.add(sundialPedestal);

    const sundialPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.1, 12), this.mats.goldLion);
    sundialPlate.position.y = 1.45;
    gGroup.add(sundialPlate);

    const gnomon = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 3), this.mats.goldLion);
    gnomon.rotation.x = 0.5;
    gnomon.position.set(0, 1.7, -0.1);
    gGroup.add(gnomon);

    // 3. Four Flowering Blossom Trees in Quadrants (Pink & White Blossom)
    const treeCoords = [
      [-10, -6, this.mats.leavesPinkBlossom],
      [10, -6, this.mats.leavesWhiteBlossom],
      [-10, 6, this.mats.leavesWhiteBlossom],
      [10, 6, this.mats.leavesPinkBlossom]
    ];

    treeCoords.forEach(([tx, tz, blossomMat]) => {
      // Slender Brown Tree Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 4.5, 6), this.mats.woodOak);
      trunk.position.set(tx, 2.25, tz);
      trunk.castShadow = true;
      gGroup.add(trunk);

      // Tiered Blossom Foliage Clouds
      const cloud1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.2, 0), blossomMat);
      cloud1.position.set(tx, 5.2, tz);
      cloud1.castShadow = true;
      gGroup.add(cloud1);

      const cloud2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 0), blossomMat);
      cloud2.position.set(tx + 0.8, 6.2, tz + 0.5);
      gGroup.add(cloud2);

      // Low Stone Flower Ring around Tree
      const treeRing = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.2, 4, 8), this.mats.sandstone);
      treeRing.rotateX(Math.PI / 2);
      treeRing.position.set(tx, 0.2, tz);
      gGroup.add(treeRing);

      this.colliders.push({
        type: 'cylinder',
        x: gx + tx,
        z: gz + tz,
        radius: 1.2
      });
    });

    // 4. Manicured Topiary Hedges & Flowerbeds
    [-7, 7].forEach(hx => {
      const hedge = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 10), this.mats.leavesHedge);
      hedge.position.set(hx, 0.45, 0);
      hedge.castShadow = true;
      gGroup.add(hedge);

      this.colliders.push({
        type: 'box',
        minX: gx + hx - 0.7,
        maxX: gx + hx + 0.7,
        minZ: gz - 5.0,
        maxZ: gz + 5.0
      });
    });

    this.townGroup.add(gGroup);

    this.colliders.push({
      type: 'cylinder',
      x: gx,
      z: gz,
      radius: 3.5
    });
  }

  // -------------------------------------------------------------
  // 13. TOWN FORTIFICATIONS & SOUTH GATEHOUSE (x: 370, z: -165)
  // -------------------------------------------------------------
  initSouthGatehouse() {
    const gateGroup = new THREE.Group();
    const gx = this.townX;
    const gz = -165;
    gateGroup.position.set(gx, 0.5, gz);

    const gateSpan = 16;
    const towerR = 3.8;
    const towerH = 14;

    // Twin Round Stone Gate Towers
    [-gateSpan / 2 - towerR + 0.5, gateSpan / 2 + towerR - 0.5].forEach(tx => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(towerR, towerR + 0.4, towerH, 8), this.mats.stoneAshlar);
      tower.position.set(tx, towerH / 2, 0);
      tower.castShadow = true;
      gateGroup.add(tower);

      // Top Parapet Gallery
      const gallery = new THREE.Mesh(new THREE.CylinderGeometry(towerR + 0.6, towerR + 0.2, 1.8, 8), this.mats.darkGranite);
      gallery.position.set(tx, towerH + 0.9, 0);
      gateGroup.add(gallery);

      // Conical Slate Roof
      const cone = new THREE.Mesh(new THREE.ConeGeometry(towerR + 0.6, 6.5, 8), this.mats.slateRoyalBlue);
      cone.position.set(tx, towerH + 1.8 + 3.25, 0);
      cone.castShadow = true;
      gateGroup.add(cone);

      this.colliders.push({
        type: 'cylinder',
        x: gx + tx,
        z: gz,
        radius: towerR + 0.4
      });
    });

    // Fortified Connecting Archway Bridge over the Avenue
    const archBridge = new THREE.Mesh(new THREE.BoxGeometry(gateSpan + 2, 3.5, 4.5), this.mats.stoneAshlar);
    archBridge.position.set(0, 9.5, 0);
    archBridge.castShadow = true;
    gateGroup.add(archBridge);

    // Crenellations along top of arch bridge
    [-6, -2, 2, 6].forEach(cx => {
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.8), this.mats.stoneAshlar);
      merlon.position.set(cx, 11.9, 2.0);
      gateGroup.add(merlon);
    });

    // Royal Banner of the Golden Lion above Archway
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 7.5), this.mats.royalBlueBanner);
    banner.position.set(0, 8.5, 2.3);
    gateGroup.add(banner);

    const bannerLion = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75, 0), this.mats.goldLion);
    bannerLion.position.set(0, 9.5, 2.4);
    gateGroup.add(bannerLion);

    // Stone Perimeter Curtain Wall segments flanking the towers
    [-gateSpan / 2 - towerR * 2 - 12, gateSpan / 2 + towerR * 2 + 12].forEach(wx => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(24, 7.5, 3.5), this.mats.stoneAshlar);
      wall.position.set(wx, 3.75, 0);
      wall.castShadow = true;
      gateGroup.add(wall);

      this.colliders.push({
        type: 'box',
        minX: gx + wx - 12,
        maxX: gx + wx + 12,
        minZ: gz - 2.0,
        maxZ: gz + 2.0
      });
    });

    this.townGroup.add(gateGroup);
  }

  // -------------------------------------------------------------
  // 14. TOWN LANTERNS, FLOWER BASKETS & DECOR
  // -------------------------------------------------------------
  initTownLanternsAndDecor() {
    const lampCoords = [
      // Along Grand King's Avenue
      [this.townX - 8.5, -295], [this.townX + 8.5, -295],
      [this.townX - 8.5, -270], [this.townX + 8.5, -270],
      [this.townX - 8.5, -230], [this.townX + 8.5, -230],
      [this.townX - 8.5, -210], [this.townX + 8.5, -210],
      [this.townX - 8.5, -185], [this.townX + 8.5, -185],
      // Around Plaza & Cross-Street
      [this.townX - 22, this.townZ - 7.5], [this.townX - 22, this.townZ + 7.5],
      [this.townX + 22, this.townZ - 7.5], [this.townX + 22, this.townZ + 7.5],
      [this.townX - 35, this.townZ], [this.townX + 35, this.townZ]
    ];

    lampCoords.forEach(([lx, lz]) => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(lx, 0.5, lz);

      // Wrought-iron fluted lamppost
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 5.5, 6), this.mats.ironWrought);
      pole.position.y = 2.75;
      pole.castShadow = true;
      lampGroup.add(pole);

      // Curved Iron Lamp Arms (Left & Right)
      [-0.65, 0.65].forEach(ax => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.12), this.mats.ironWrought);
        arm.position.set(ax, 5.2, 0);
        lampGroup.add(arm);

        // Hanging Medieval Glass Lantern
        const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.65), this.mats.glassGlow);
        lantern.position.set(ax, 4.6, 0);
        lampGroup.add(lantern);

        // Hanging Flower Basket with geraniums under lamp arm
        const basket = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.45, 6), this.mats.timberDark);
        basket.position.set(ax, 3.8, 0);
        lampGroup.add(basket);

        const flowerCluster = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35, 0), this.mats.flowerRoseRed);
        flowerCluster.position.set(ax, 4.05, 0);
        lampGroup.add(flowerCluster);
      });

      // Warm Golden Night Light
      const pLight = new THREE.PointLight(0xfef08a, 0.0, 16);
      pLight.position.set(0, 4.8, 0);
      pLight.userData.baseIntensity = 1.1;
      lampGroup.add(pLight);
      this.dayNightCycle.registerNightLight(pLight);

      this.townGroup.add(lampGroup);

      this.colliders.push({
        type: 'cylinder',
        x: lx,
        z: lz,
        radius: 0.4
      });
    });
  }

  // -------------------------------------------------------------
  // ANIMATION LOOP (Clock hands, fountain water shimmer, magic orbs)
  // -------------------------------------------------------------
  update(delta) {
    const time = performance.now() * 0.001;

    // 1. Clock Hands Rotation
    if (this.clockHands) {
      this.clockHands.forEach(ch => {
        // Smoothly rotate minute hand and hour hand
        ch.min.rotation.z = -time * 0.4;
        ch.hour.rotation.z = -time * (0.4 / 12);
      });
    }

    // 2. Animated Objects
    this.animatedObjects.forEach(obj => {
      if (obj.type === 'fountain_spray') {
        obj.mesh.rotation.y += delta * 1.5;
        const scaleWave = 1.0 + Math.sin(time * 4) * 0.08;
        obj.mesh.scale.set(scaleWave, 1.0 + Math.cos(time * 3) * 0.12, scaleWave);
      } else if (obj.type === 'clock_bell') {
        obj.mesh.rotation.z = Math.sin(time * 1.2) * 0.08;
      } else if (obj.type === 'magic_orb') {
        obj.mesh.rotation.y += delta * obj.speed;
        obj.mesh.position.y += Math.sin(time * obj.speed * 2) * delta * 0.4;
      }
    });
  }
}

