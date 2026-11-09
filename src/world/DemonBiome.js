import * as THREE from 'three';

export class DemonBiome {
  constructor(scene, dayNightCycle) {
    this.scene = scene;
    this.dayNightCycle = dayNightCycle;
    this.colliders = [];
    this.animatedObjects = [];

    this.initObsidianCitadel();
    this.initLavaPoolsAndFissures();
    this.initBasaltSpires();
    this.initBoneGate();
    this.initSacrificialAltar();
    this.initDemonicGargoyles();
  }

  // 1. Colossal Obsidian Dread Citadel (Malakor's Nether Fortress) at (-220, -220)
  initObsidianCitadel() {
    const castleX = -220;
    const castleZ = -220;
    const group = new THREE.Group();
    group.position.set(castleX, 0.5, castleZ);

    const darkStoneMat = new THREE.MeshLambertMaterial({ color: 0x09090b, flatShading: true }); // Pure obsidian
    const basaltMat = new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true });    // Hexagonal basalt
    const crimsonMat = new THREE.MeshLambertMaterial({ color: 0x7f1d1d, flatShading: true });   // Bloodstone
    const hornMat = new THREE.MeshLambertMaterial({ color: 0x1c1917, flatShading: true });      // Dark demon horn
    const boneMat = new THREE.MeshLambertMaterial({ color: 0xf3f4f6, flatShading: true });      // Skull bone
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x27272a, flatShading: true });
    const lavaMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xf97316,
      emissiveIntensity: 0.95,
      roughness: 0.2
    });
    const runeGlowMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 1.2,
      roughness: 0.25
    });
    const voidMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7e22ce,
      emissiveIntensity: 1.0,
      roughness: 0.2
    });

    // -------------------------------------------------------------
    // 1. BOILING MAGMA MOAT & BASALT DRAWBRIDGE CAUSEWAY
    // -------------------------------------------------------------
    const moatW = 112;
    const moatD = 14;
    const moatZ = 45 + moatD / 2; // In front of south outer wall (z = 52)

    // Glowing Magma Channel
    const moatLava = new THREE.Mesh(new THREE.PlaneGeometry(moatW, moatD), lavaMat);
    moatLava.rotateX(-Math.PI / 2);
    moatLava.position.set(0, 0.12, moatZ);
    moatLava.receiveShadow = true;
    group.add(moatLava);

    // Volcanic Basalt Retaining Embankments
    [-moatD / 2, moatD / 2].forEach(mz => {
      const bank = new THREE.Mesh(new THREE.BoxGeometry(moatW + 2, 0.7, 1.4), darkStoneMat);
      bank.position.set(0, 0.35, moatZ + mz);
      group.add(bank);
    });

    // Intimidating Arched Drawbridge of Cracked Obsidian & Basalt
    const bridgeW = 14;
    const bridgeL = 22;
    const bridgeMesh = new THREE.Mesh(new THREE.BoxGeometry(bridgeW, 0.9, bridgeL), basaltMat);
    bridgeMesh.position.set(0, 0.5, moatZ);
    bridgeMesh.receiveShadow = true;
    group.add(bridgeMesh);

    // Jagged Obsidian Bridge Parapets & Flaming Horn Posts
    [-bridgeW / 2 + 0.6, bridgeW / 2 - 0.6].forEach(px => {
      const parapet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, bridgeL), darkStoneMat);
      parapet.position.set(px, 1.4, moatZ);
      parapet.castShadow = true;
      group.add(parapet);

      // Spiked Horn Sentry Posts on bridge ends
      [-bridgeL / 2 + 1, bridgeL / 2 - 1].forEach(pz => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.8, 1.5), darkStoneMat);
        post.position.set(px, 2.4, moatZ + pz);
        group.add(post);

        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.8, 5), hornMat);
        horn.position.set(px, 5.0, moatZ + pz);
        horn.rotation.z = px < 0 ? -0.3 : 0.3;
        group.add(horn);

        const fireLight = new THREE.PointLight(0xef4444, 1.4, 16);
        fireLight.position.set(px, 5.5, moatZ + pz);
        fireLight.userData.baseIntensity = 1.4;
        group.add(fireLight);
        this.dayNightCycle.registerNightLight(fireLight);
      });
    });

    // -------------------------------------------------------------
    // 2. COLOSSAL OUTER SPIKED CURTAIN WALLS (96m wide x 90m deep, 18m high, 4.5m thick)
    // -------------------------------------------------------------
    const wallW = 96;
    const wallD = 90;
    const wallH = 18;
    const wallThick = 4.5;
    const gateW = 16;

    // Inner Courtyard Volcanic Ash Ground Slab
    const courtyard = new THREE.Mesh(new THREE.PlaneGeometry(wallW - 2, wallD - 2), darkStoneMat);
    courtyard.rotateX(-Math.PI / 2);
    courtyard.position.set(0, 0.08, 0);
    courtyard.receiveShadow = true;
    group.add(courtyard);

    // North Curtain Wall (Back)
    const wallNorth = new THREE.Mesh(new THREE.BoxGeometry(wallW, wallH, wallThick), basaltMat);
    wallNorth.position.set(0, wallH / 2, -wallD / 2);
    wallNorth.castShadow = true;
    wallNorth.receiveShadow = true;
    group.add(wallNorth);

    // West Curtain Wall (Left)
    const wallWest = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, wallD), basaltMat);
    wallWest.position.set(-wallW / 2, wallH / 2, 0);
    wallWest.castShadow = true;
    wallWest.receiveShadow = true;
    group.add(wallWest);

    // East Curtain Wall (Right)
    const wallEast = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, wallD), basaltMat);
    wallEast.position.set(wallW / 2, wallH / 2, 0);
    wallEast.castShadow = true;
    wallEast.receiveShadow = true;
    group.add(wallEast);

    // South Curtain Wall (Front with Hellfire Gate)
    const frontSideW = (wallW - gateW) / 2;
    const wallSouthL = new THREE.Mesh(new THREE.BoxGeometry(frontSideW, wallH, wallThick), basaltMat);
    wallSouthL.position.set(-(gateW / 2 + frontSideW / 2), wallH / 2, wallD / 2);
    wallSouthL.castShadow = true;
    wallSouthL.receiveShadow = true;
    group.add(wallSouthL);

    const wallSouthR = new THREE.Mesh(new THREE.BoxGeometry(frontSideW, wallH, wallThick), basaltMat);
    wallSouthR.position.set((gateW / 2 + frontSideW / 2), wallH / 2, wallD / 2);
    wallSouthR.castShadow = true;
    wallSouthR.receiveShadow = true;
    group.add(wallSouthR);

    // Serrated Sawtooth Battlements along Outer Walls
    for (let cx = -wallW / 2 + 3; cx <= wallW / 2 - 3; cx += 4.2) {
      [-wallD / 2, wallD / 2].forEach(cz => {
        if (Math.abs(cz - wallD / 2) < 1 && Math.abs(cx) < gateW / 2 + 1) return; // skip gate
        const tooth = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.2, 4), crimsonMat);
        tooth.position.set(cx, wallH + 1.6, cz + (cz < 0 ? -1.6 : 1.6));
        group.add(tooth);
      });
    }

    for (let cz = -wallD / 2 + 3; cz <= wallD / 2 - 3; cz += 4.2) {
      [-wallW / 2, wallW / 2].forEach(cx => {
        const tooth = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.2, 4), crimsonMat);
        tooth.position.set(cx + (cx < 0 ? -1.6 : 1.6), wallH + 1.6, cz);
        group.add(tooth);
      });
    }

    // -------------------------------------------------------------
    // 3. 4 COLOSSAL CORNER DREAD BASTIONS WITH GIANT DEMON HORNS (Radius 8m, Height 38m)
    // -------------------------------------------------------------
    const cornerOffsets = [
      [-wallW / 2, -wallD / 2],
      [wallW / 2, -wallD / 2],
      [-wallW / 2, wallD / 2],
      [wallW / 2, wallD / 2]
    ];

    const bastionGeom = new THREE.CylinderGeometry(7.5, 8.8, 38, 8);

    cornerOffsets.forEach(([bx, bz]) => {
      const bastion = new THREE.Mesh(bastionGeom, darkStoneMat);
      bastion.position.set(bx, 19, bz);
      bastion.castShadow = true;
      bastion.receiveShadow = true;
      group.add(bastion);

      // Overhanging Spiked Parapet Gallery
      const parapet = new THREE.Mesh(new THREE.CylinderGeometry(9.6, 8.2, 3.2, 8), basaltMat);
      parapet.position.set(bx, 39, bz);
      group.add(parapet);

      // Jagged Bloodstone Conical Spire
      const spire = new THREE.Mesh(new THREE.ConeGeometry(9.6, 13, 8), crimsonMat);
      spire.position.set(bx, 46.5, bz);
      spire.castShadow = true;
      group.add(spire);

      // Colossal Curved Demon Horns (14m long) crowning each bastion
      [-1, 1].forEach(side => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(1.4, 14.0, 6), hornMat);
        horn.position.set(bx + side * 4.5, 48, bz);
        horn.rotation.z = side * 0.55;
        horn.rotation.x = 0.25;
        group.add(horn);
      });

      // Glowing Nether Light atop bastions
      const bastionLight = new THREE.PointLight(0xef4444, 1.8, 24);
      bastionLight.position.set(bx, 53, bz);
      bastionLight.userData.baseIntensity = 1.8;
      group.add(bastionLight);
      this.dayNightCycle.registerNightLight(bastionLight);

      this.colliders.push({
        type: 'cylinder',
        x: castleX + bx,
        z: castleZ + bz,
        radius: 9.2
      });
    });

    // 2 Mid-Wall Spiked Towers on West and East walls
    [-wallW / 2, wallW / 2].forEach(tx => {
      const midTower = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.8, 28, 8), darkStoneMat);
      midTower.position.set(tx, 14, 0);
      group.add(midTower);

      const midSpire = new THREE.Mesh(new THREE.ConeGeometry(6.4, 11, 8), crimsonMat);
      midSpire.position.set(tx, 32.5, 0);
      group.add(midSpire);

      // Glowing Demonic Eye Rune on mid-towers
      const eyeRune = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), runeGlowMat);
      eyeRune.position.set(tx + (tx < 0 ? -5.5 : 5.5), 24, 0);
      group.add(eyeRune);
      this.animatedObjects.push({ type: 'rotate', mesh: eyeRune, speed: 0.8 });

      this.colliders.push({
        type: 'cylinder',
        x: castleX + tx,
        z: castleZ,
        radius: 5.6
      });
    });

    // -------------------------------------------------------------
    // 4. COLOSSAL HELLFIRE BARBICAN GATE OF SKULLS (South Gate)
    // -------------------------------------------------------------
    [-gateW / 2 - 3.5, gateW / 2 + 3.5].forEach(gx => {
      const gateTower = new THREE.Mesh(new THREE.CylinderGeometry(6.0, 7.0, 32, 8), darkStoneMat);
      gateTower.position.set(gx, 16, wallD / 2 + 2);
      gateTower.castShadow = true;
      group.add(gateTower);

      const gateSpire = new THREE.Mesh(new THREE.ConeGeometry(7.5, 12, 8), crimsonMat);
      gateSpire.position.set(gx, 40.5, wallD / 2 + 2);
      group.add(gateSpire);

      // Spiked Demon Horns on gate towers
      const horn = new THREE.Mesh(new THREE.ConeGeometry(1.2, 10.0, 5), hornMat);
      horn.position.set(gx + (gx < 0 ? -3.5 : 3.5), 42, wallD / 2 + 2);
      horn.rotation.z = gx < 0 ? -0.45 : 0.45;
      group.add(horn);

      this.colliders.push({
        type: 'cylinder',
        x: castleX + gx,
        z: castleZ + wallD / 2 + 2,
        radius: 6.8
      });
    });

    // Colossal Demon Bone Gate Arch
    const gateArch = new THREE.Mesh(new THREE.BoxGeometry(gateW + 8, 6, wallThick + 4), basaltMat);
    gateArch.position.set(0, wallH + 2.0, wallD / 2 + 1);
    group.add(gateArch);

    // Giant Demon Skull Crest carved above the gate
    const skullHead = new THREE.Mesh(new THREE.BoxGeometry(4.8, 4.0, 3.2), boneMat);
    skullHead.position.set(0, wallH + 3.5, wallD / 2 + 3.5);
    group.add(skullHead);

    const skullJaw = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.0, 2.4), boneMat);
    skullJaw.position.set(0, wallH + 0.5, wallD / 2 + 3.5);
    group.add(skullJaw);

    [-1.2, 1.2].forEach(ex => {
      const eyeSocket = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 0.4), runeGlowMat);
      eyeSocket.position.set(ex, wallH + 3.8, wallD / 2 + 5.15);
      group.add(eyeSocket);
    });

    // Heavy Iron Skull Portcullis
    const portcullis = new THREE.Mesh(new THREE.BoxGeometry(gateW - 1, 8, 0.5), ironMat);
    portcullis.position.set(0, wallH - 3.5, wallD / 2 + 1);
    group.add(portcullis);

    // Boiling Sulfur & Magma Cauldrons flanking gate
    [-gateW / 2 - 1, gateW / 2 + 1].forEach(cx => {
      const cauldron = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.0, 2.2, 6), ironMat);
      cauldron.position.set(cx, 1.1, wallD / 2 + 5);
      group.add(cauldron);

      const brew = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 6), lavaMat);
      brew.position.set(cx, 2.15, wallD / 2 + 5);
      group.add(brew);

      const fireLight = new THREE.PointLight(0xef4444, 1.6, 16);
      fireLight.position.set(cx, 3.2, wallD / 2 + 5);
      fireLight.userData.baseIntensity = 1.6;
      group.add(fireLight);
      this.dayNightCycle.registerNightLight(fireLight);
    });

    // -------------------------------------------------------------
    // 5. THE INNER DREAD KEEP & THE ABYSSAL SKULL SPIRE (Width 54m, Depth 46m, Height 28m)
    // Centered at (0, -10) relative to (-220, -220); Throne placed at (0, 0) -> world (-220, -220)!
    // -------------------------------------------------------------
    const keepW = 54;
    const keepD = 46;
    const keepH = 28;
    const keepZ = -10; // Bounds z: -33 to +13
    const portalW = 10;

    // Outer Keep Walls
    const keepBack = new THREE.Mesh(new THREE.BoxGeometry(keepW, keepH, 3.5), basaltMat);
    keepBack.position.set(0, keepH / 2, keepZ - keepD / 2);
    keepBack.castShadow = true;
    group.add(keepBack);

    const keepLeft = new THREE.Mesh(new THREE.BoxGeometry(3.5, keepH, keepD), basaltMat);
    keepLeft.position.set(-keepW / 2, keepH / 2, keepZ);
    keepLeft.castShadow = true;
    group.add(keepLeft);

    const keepRight = new THREE.Mesh(new THREE.BoxGeometry(3.5, keepH, keepD), basaltMat);
    keepRight.position.set(keepW / 2, keepH / 2, keepZ);
    keepRight.castShadow = true;
    group.add(keepRight);

    // Front Wall Left & Right of Entrance Portal
    const frontPortionW = (keepW - portalW) / 2;
    const keepFrontL = new THREE.Mesh(new THREE.BoxGeometry(frontPortionW, keepH, 3.5), basaltMat);
    keepFrontL.position.set(-(portalW / 2 + frontPortionW / 2), keepH / 2, keepZ + keepD / 2);
    group.add(keepFrontL);

    const keepFrontR = new THREE.Mesh(new THREE.BoxGeometry(frontPortionW, keepH, 3.5), basaltMat);
    keepFrontR.position.set((portalW / 2 + frontPortionW / 2), keepH / 2, keepZ + keepD / 2);
    group.add(keepFrontR);

    // 4 Corner Keep Spire Towers with curved horns (Height 42m)
    [-keepW / 2, keepW / 2].forEach(kx => {
      [-keepD / 2, keepD / 2].forEach(kz => {
        const turret = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.8, 38, 8), darkStoneMat);
        turret.position.set(kx, 19, keepZ + kz);
        group.add(turret);

        const turretSpire = new THREE.Mesh(new THREE.ConeGeometry(5.6, 12, 8), crimsonMat);
        turretSpire.position.set(kx, 44, keepZ + kz);
        group.add(turretSpire);

        const horn = new THREE.Mesh(new THREE.ConeGeometry(1.0, 9.0, 5), hornMat);
        horn.position.set(kx + (kx < 0 ? -2.5 : 2.5), 45, keepZ + kz);
        horn.rotation.z = kx < 0 ? -0.4 : 0.4;
        group.add(horn);
      });
    });

    // Stepped Volcanic Pyramid Roof on Donjon
    const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(keepW, keepD) * 0.54, 15, 4), darkStoneMat);
    keepRoof.rotation.y = Math.PI / 4;
    keepRoof.position.set(0, keepH + 7.5, keepZ);
    keepRoof.castShadow = true;
    group.add(keepRoof);

    // Central Colossal Nether Spire Monolith (Height 54m)
    const grandSpire = new THREE.Mesh(new THREE.ConeGeometry(4.2, 22, 6), crimsonMat);
    grandSpire.position.set(0, keepH + 24, keepZ);
    grandSpire.castShadow = true;
    group.add(grandSpire);

    // 4 Giant Horns cradling the Colossal Nether Blood Eye
    [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(ang => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(1.2, 12.0, 5), hornMat);
      horn.position.set(Math.sin(ang) * 4.0, keepH + 26, keepZ + Math.cos(ang) * 4.0);
      horn.rotation.z = Math.sin(ang) * 0.45;
      horn.rotation.x = Math.cos(ang) * 0.45;
      group.add(horn);
    });

    // The Colossal Rotating Nether Blood Eye!
    const bloodEye = new THREE.Mesh(new THREE.OctahedronGeometry(2.8, 0), runeGlowMat);
    bloodEye.position.set(0, keepH + 34, keepZ);
    group.add(bloodEye);
    this.animatedObjects.push({ type: 'rotate', mesh: bloodEye, speed: 1.2 });

    const eyeLight = new THREE.PointLight(0xef4444, 2.5, 38);
    eyeLight.position.set(0, keepH + 35, keepZ);
    eyeLight.userData.baseIntensity = 2.5;
    group.add(eyeLight);
    this.dayNightCycle.registerNightLight(eyeLight);

    // Entrance Steps & Arch Portal
    const portalArch = new THREE.Mesh(new THREE.BoxGeometry(portalW + 2, 4.5, 4.0), darkStoneMat);
    portalArch.position.set(0, 15, keepZ + keepD / 2);
    group.add(portalArch);

    // -------------------------------------------------------------
    // 6. THE ABYSSAL THRONE HALL INTERIOR (Lava Trenches, Basalt Columns & Malakor's Throne)
    // -------------------------------------------------------------
    // Twin Molten Lava Trenches running along the hall
    [-15, 15].forEach(lx => {
      const lavaTrench = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.2, keepD - 8), lavaMat);
      lavaTrench.position.set(lx, 0.15, keepZ);
      group.add(lavaTrench);

      // Lava Point Light
      const trenchLight = new THREE.PointLight(0xf97316, 1.4, 18);
      trenchLight.position.set(lx, 2.0, keepZ);
      trenchLight.userData.baseIntensity = 1.4;
      group.add(trenchLight);
      this.dayNightCycle.registerNightLight(trenchLight);
    });

    // 8 Colossal Ribbed Basalt Pillars inside Throne Hall
    [-10, 10].forEach(colX => {
      [-16, -6, 4, 14].forEach(colZ => {
        const column = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, keepH - 2, 6), darkStoneMat);
        column.position.set(colX, (keepH - 2) / 2, keepZ + colZ);
        column.castShadow = true;
        group.add(column);

        // Flaming Skull Sconce
        const skullSconce = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), boneMat);
        skullSconce.position.set(colX + (colX < 0 ? 1.5 : -1.5), 6.5, keepZ + colZ);
        group.add(skullSconce);

        const sconceLight = new THREE.PointLight(0xef4444, 1.2, 14);
        sconceLight.position.set(colX + (colX < 0 ? 1.7 : -1.7), 7.0, keepZ + colZ);
        sconceLight.userData.baseIntensity = 1.2;
        group.add(sconceLight);
        this.dayNightCycle.registerNightLight(sconceLight);

        this.colliders.push({
          type: 'cylinder',
          x: castleX + colX,
          z: castleZ + keepZ + colZ,
          radius: 1.6
        });
      });
    });

    // Demon King Malakor's Throne of Skulls & Netherflame (Located at world [-220, -220] -> local [0, 0])
    const throneZ = 0;
    const dais = new THREE.Mesh(new THREE.BoxGeometry(9.0, 1.0, 7.5), darkStoneMat);
    dais.position.set(0, 0.5, throneZ);
    dais.receiveShadow = true;
    group.add(dais);

    const daisStep = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.5, 9.5), basaltMat);
    daisStep.position.set(0, 0.25, throneZ);
    daisStep.receiveShadow = true;
    group.add(daisStep);

    // Colossal Obsidian & Bone Throne
    const throneSeat = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 2.2), crimsonMat);
    throneSeat.position.set(0, 1.5, throneZ);
    group.add(throneSeat);

    // Winged Dragon / Demon Bone Backrest (Height 5.5m)
    const throneBack = new THREE.Mesh(new THREE.BoxGeometry(2.8, 5.5, 0.6), darkStoneMat);
    throneBack.position.set(0, 3.8, throneZ - 1.1);
    group.add(throneBack);

    [-1.8, 1.8].forEach(wx => {
      const wingBone = new THREE.Mesh(new THREE.ConeGeometry(0.8, 6.0, 4), hornMat);
      wingBone.position.set(wx, 5.2, throneZ - 1.1);
      wingBone.rotation.z = wx < 0 ? 0.35 : -0.35;
      group.add(wingBone);
    });

    // Glowing Nether Eye on Throne Crest
    const throneEye = new THREE.Mesh(new THREE.OctahedronGeometry(0.8, 0), runeGlowMat);
    throneEye.position.set(0, 6.5, throneZ - 1.1);
    group.add(throneEye);

    // Flanking Floating Void Crystals & Braziers
    [-4.5, 4.5].forEach(bx => {
      const obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 10.0, 4), darkStoneMat);
      obelisk.position.set(bx, 5.0, throneZ - 1.8);
      group.add(obelisk);

      const voidCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.2, 0), voidMat);
      voidCrystal.position.set(bx, 11.2, throneZ - 1.8);
      group.add(voidCrystal);
      this.animatedObjects.push({ type: 'rotate', mesh: voidCrystal, speed: 0.9 });

      const brazier = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.7, 2.2, 6), darkStoneMat);
      brazier.position.set(bx, 1.1, throneZ + 3.0);
      group.add(brazier);

      const fire = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), runeGlowMat);
      fire.position.set(bx, 2.4, throneZ + 3.0);
      group.add(fire);

      const fireLight = new THREE.PointLight(0xef4444, 1.8, 18);
      fireLight.position.set(bx, 2.8, throneZ + 3.0);
      fireLight.userData.baseIntensity = 1.8;
      group.add(fireLight);
      this.dayNightCycle.registerNightLight(fireLight);
    });

    this.scene.add(group);

    // -------------------------------------------------------------
    // 7. AIRTIGHT SUB-STEPPED DREAD CITADEL COLLIDERS
    // -------------------------------------------------------------
    this.colliders.push(
      // Outer Perimeter Curtain Walls
      { type: 'box', minX: castleX - wallW / 2, maxX: castleX + wallW / 2, minZ: castleZ - wallD / 2 - 2.5, maxZ: castleZ - wallD / 2 + 2.5 }, // North
      { type: 'box', minX: castleX - wallW / 2 - 2.5, maxX: castleX - wallW / 2 + 2.5, minZ: castleZ - wallD / 2, maxZ: castleZ + wallD / 2 }, // West
      { type: 'box', minX: castleX + wallW / 2 - 2.5, maxX: castleX + wallW / 2 + 2.5, minZ: castleZ - wallD / 2, maxZ: castleZ + wallD / 2 }, // East
      // South Wall Left & Right of Barbican Hellfire Gate
      { type: 'box', minX: castleX - wallW / 2, maxX: castleX - gateW / 2, minZ: castleZ + wallD / 2 - 2.5, maxZ: castleZ + wallD / 2 + 2.5 },
      { type: 'box', minX: castleX + gateW / 2, maxX: castleX + wallW / 2, minZ: castleZ + wallD / 2 - 2.5, maxZ: castleZ + wallD / 2 + 2.5 },

      // Drawbridge Stone Parapets
      { type: 'box', minX: castleX - bridgeW / 2 - 1, maxX: castleX - bridgeW / 2 + 1, minZ: castleZ + moatZ - bridgeL / 2, maxZ: castleZ + moatZ + bridgeL / 2 },
      { type: 'box', minX: castleX + bridgeW / 2 - 1, maxX: castleX + bridgeW / 2 + 1, minZ: castleZ + moatZ - bridgeL / 2, maxZ: castleZ + moatZ + bridgeL / 2 },

      // Keep Perimeter Walls (Leaving 10m open grand entrance portal at front)
      { type: 'box', minX: castleX - keepW / 2, maxX: castleX + keepW / 2, minZ: castleZ + keepZ - keepD / 2 - 1.8, maxZ: castleZ + keepZ - keepD / 2 + 1.8 }, // Keep Back
      { type: 'box', minX: castleX - keepW / 2 - 1.8, maxX: castleX - keepW / 2 + 1.8, minZ: castleZ + keepZ - keepD / 2, maxZ: castleZ + keepZ + keepD / 2 }, // Keep Left
      { type: 'box', minX: castleX + keepW / 2 - 1.8, maxX: castleX + keepW / 2 + 1.8, minZ: castleZ + keepZ - keepD / 2, maxZ: castleZ + keepZ + keepD / 2 }, // Keep Right
      { type: 'box', minX: castleX - keepW / 2, maxX: castleX - portalW / 2, minZ: castleZ + keepZ + keepD / 2 - 1.8, maxZ: castleZ + keepZ + keepD / 2 + 1.8 }, // Keep Front L
      { type: 'box', minX: castleX + portalW / 2, maxX: castleX + keepW / 2, minZ: castleZ + keepZ + keepD / 2 - 1.8, maxZ: castleZ + keepZ + keepD / 2 + 1.8 }, // Keep Front R

      // Throne Dais Barrier
      { type: 'box', minX: castleX - 5.0, maxX: castleX + 5.0, minZ: castleZ + throneZ - 2.8, maxZ: castleZ + throneZ - 0.6 }
    );
  }

  // 2. Molten Lava Pools & Glowing Fissures
  initLavaPoolsAndFissures() {
    const lavaGroup = new THREE.Group();

    const lavaMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xf97316,
      emissiveIntensity: 0.85,
      roughness: 0.2
    });

    const crustMat = new THREE.MeshLambertMaterial({ color: 0x1c1917, flatShading: true });

    // Major Lava Lake at (-160, -250)
    const lakeLava = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 0.4, 12), lavaMat);
    lakeLava.position.set(-160, 0.45, -250);
    lakeLava.receiveShadow = true;
    lavaGroup.add(lakeLava);

    // Stepping stones across the lava
    [-10, -5, 0, 5, 10].forEach(offset => {
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.4, 0.7, 6), crustMat);
      stone.position.set(-160 + offset, 0.7, -250 + Math.sin(offset) * 4);
      stone.castShadow = true;
      lavaGroup.add(stone);
    });

    const lakeLight = new THREE.PointLight(0xf97316, 2.0, 36);
    lakeLight.position.set(-160, 2.5, -250);
    lakeLight.userData.baseIntensity = 2.0;
    lavaGroup.add(lakeLight);
    this.dayNightCycle.registerNightLight(lakeLight);

    // Sinuous Magma Fissure Trench along Z = -160 (from X = -300 to -140)
    for (let x = -300; x <= -140; x += 32) {
      const fissure = new THREE.Mesh(new THREE.BoxGeometry(30, 0.35, 5), lavaMat);
      fissure.position.set(x, 0.46, -160 + Math.sin(x * 0.05) * 8);
      lavaGroup.add(fissure);

      const fLight = new THREE.PointLight(0xdc2626, 1.0, 18);
      fLight.position.set(x, 1.8, -160);
      fLight.userData.baseIntensity = 1.0;
      lavaGroup.add(fLight);
      this.dayNightCycle.registerNightLight(fLight);
    }

    this.scene.add(lavaGroup);

    // Collider for the deep center of the lava lake to prevent walking off the stepping stones
    this.colliders.push({
      type: 'cylinder',
      x: -160,
      z: -250 - 8,
      radius: 6.0
    });
    this.colliders.push({
      type: 'cylinder',
      x: -160,
      z: -250 + 8,
      radius: 6.0
    });
  }

  // 3. Volcanic Basalt Spires & Jagged Rocks
  initBasaltSpires() {
    const spireMat = new THREE.MeshLambertMaterial({ color: 0x1e1b4b, flatShading: true }); // Dark abyssal slate
    const group = new THREE.Group();

    const spireLocations = [
      [-130, -290], [-180, -320], [-250, -320], [-310, -280],
      [-320, -200], [-300, -120], [-250, -90],  [-180, -90],
      [-130, -130], [-110, -210], [-270, -170], [-210, -280]
    ];

    spireLocations.forEach(([x, z]) => {
      const height = 12 + Math.random() * 14;
      const radius = 2.0 + Math.random() * 1.5;

      // Hexagonal basalt column
      const spire = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.6, radius, height, 6), spireMat);
      spire.position.set(x, height / 2, z);
      spire.rotation.x = (Math.random() - 0.5) * 0.15;
      spire.rotation.z = (Math.random() - 0.5) * 0.15;
      spire.castShadow = true;
      group.add(spire);

      this.colliders.push({
        type: 'cylinder',
        x: x,
        z: z,
        radius: radius + 0.3
      });
    });

    this.scene.add(group);
  }

  // 4. Corrupted Bone Gate / Skull Archway
  initBoneGate() {
    // Grand entryway to the demon realm at (-80, 0.5, -200)
    const gateGroup = new THREE.Group();
    gateGroup.position.set(-80, 0.5, -200);

    const boneMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true });   // Pale ivory bone
    const ironMat = new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true });

    // Left & Right Giant Rib Pillars
    [-7, 7].forEach(bx => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 14, 6), boneMat);
      post.position.set(bx, 7, 0);
      post.rotation.z = bx > 0 ? -0.1 : 0.1;
      post.castShadow = true;
      gateGroup.add(post);

      // Skull topping
      const skull = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), boneMat);
      skull.position.set(bx, 15, 0);
      gateGroup.add(skull);

      // Red glowing eye sockets
      [-0.4, 0.4].forEach(ex => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        eye.position.set(bx + ex, 15.2, 1.3);
        gateGroup.add(eye);
      });

      this.colliders.push({
        type: 'cylinder',
        x: -80 + bx,
        z: -200,
        radius: 2.2
      });
    });

    // Archway Crossbeam with spikes
    const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(16, 2.0, 2.4), ironMat);
    crossbeam.position.set(0, 13.5, 0);
    gateGroup.add(crossbeam);

    for (let sx = -6; sx <= 6; sx += 2) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.5, 4), ironMat);
      spike.rotation.x = Math.PI;
      spike.position.set(sx, 11.5, 0);
      gateGroup.add(spike);
    }

    this.scene.add(gateGroup);
  }

  // 5. Stepped Sacrificial Altar & Void Relic
  initSacrificialAltar() {
    // Ancient sacrificial dais at (-270, 0.5, -250)
    const altarGroup = new THREE.Group();
    altarGroup.position.set(-270, 0.5, -250);

    const darkMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true });
    const bloodMat = new THREE.MeshLambertMaterial({ color: 0x991b1b, flatShading: true });
    const voidMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0xa855f7,
      emissiveIntensity: 1.0,
      roughness: 0.2
    });

    // 3 Tiered dark stone steps
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(20, 1.6, 20), darkMat);
    step1.position.y = 0.8;
    step1.receiveShadow = true;
    altarGroup.add(step1);

    const step2 = new THREE.Mesh(new THREE.BoxGeometry(14, 1.6, 14), bloodMat);
    step2.position.y = 2.4;
    step2.receiveShadow = true;
    altarGroup.add(step2);

    const step3 = new THREE.Mesh(new THREE.BoxGeometry(8, 1.6, 8), darkMat);
    step3.position.y = 4.0;
    step3.receiveShadow = true;
    altarGroup.add(step3);

    // Altar Table
    const slab = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.5, 1.6, 8), darkMat);
    slab.position.y = 5.6;
    altarGroup.add(slab);

    // Floating Void Crystal
    const voidCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), voidMat);
    voidCrystal.position.set(0, 8.2, 0);
    altarGroup.add(voidCrystal);
    this.animatedObjects.push({ type: 'crystal', mesh: voidCrystal, speed: 1.2 });

    const voidLight = new THREE.PointLight(0xa855f7, 1.8, 20);
    voidLight.position.set(0, 8.5, 0);
    voidLight.userData.baseIntensity = 1.8;
    altarGroup.add(voidLight);
    this.dayNightCycle.registerNightLight(voidLight);

    this.scene.add(altarGroup);

    this.colliders.push({
      type: 'cylinder',
      x: -270,
      z: -250,
      radius: 4.2
    });
  }

  // 6. Demonic Gargoyles Perched on Columns
  initDemonicGargoyles() {
    const group = new THREE.Group();
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x334155, flatShading: true });

    const gargoyleCoords = [
      [-190, -180], [-250, -180], [-190, -260], [-250, -260]
    ];

    gargoyleCoords.forEach(([x, z]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(2.2, 9, 2.2), stoneMat);
      col.position.set(x, 4.5, z);
      col.castShadow = true;
      group.add(col);

      // Gargoyle torso & head
      const gTorso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), stoneMat);
      gTorso.position.set(x, 9.8, z);
      group.add(gTorso);

      // Wings
      [-1, 1].forEach(side => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 0.3), stoneMat);
        wing.position.set(x + side * 1.8, 10.4, z - 0.4);
        wing.rotation.y = side * 0.4;
        group.add(wing);
      });

      this.colliders.push({
        type: 'box',
        minX: x - 1.5,
        maxX: x + 1.5,
        minZ: z - 1.5,
        maxZ: z + 1.5
      });
    });

    this.scene.add(group);
  }

  update(delta, time) {
    this.animatedObjects.forEach(obj => {
      if (obj.type === 'rotate') {
        obj.mesh.rotation.y += delta * obj.speed;
      } else if (obj.type === 'crystal') {
        obj.mesh.rotation.y += delta * obj.speed;
        obj.mesh.position.y = 8.2 + Math.sin(time * 2.5) * 0.25;
      }
    });
  }
}

