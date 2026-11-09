import * as THREE from 'three';

export class CharacterFactory {
  static createModel(characterId) {
    const root = new THREE.Group();

    // Default animation references
    const animNodes = {
      torso: null,
      head: null,
      armL: null,
      armR: null,
      legL: null,
      legR: null,
      cape: null,
      specialItem: null
    };

    switch (characterId) {
      case 'princess':
        this.buildPrincess(root, animNodes);
        break;
      case 'demonking':
        this.buildDemonKing(root, animNodes);
        break;
      case 'op_side':
        this.buildOPSideCharacter(root, animNodes);
        break;
      case 'king':
        this.buildKing(root, animNodes);
        break;
      case 'retired_hero':
        this.buildRetiredHero(root, animNodes);
        break;
      case 'hero':
      default:
        this.buildHero(root, animNodes);
        break;
    }

    // Add soft ground blob shadow to all characters
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35
    });
    const blobShadow = new THREE.Mesh(new THREE.CircleGeometry(0.65, 8), shadowMat);
    blobShadow.rotation.x = -Math.PI / 2;
    blobShadow.position.y = 0.05;
    root.add(blobShadow);

    return { group: root, animNodes };
  }

  // 1. THE CHOSEN HERO (Aiden)
  static buildHero(root, anim) {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdbac, flatShading: true });
    const tunicMat = new THREE.MeshLambertMaterial({ color: 0x2563eb, flatShading: true }); // Royal blue tunic
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true });  // Gold trim
    const beltMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });  // Leather
    const silverMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true }); // Steel
    const hairMat = new THREE.MeshLambertMaterial({ color: 0xfacc15, flatShading: true });  // Blonde
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1e293b, flatShading: true });

    // Torso with armor breastplate
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 0.5), tunicMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    root.add(torso);
    anim.torso = torso;

    const chestplate = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.7, 0.55), silverMat);
    chestplate.position.set(0, 0.1, 0.02);
    torso.add(chestplate);

    // Leather belt with gold buckle
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.2, 0.54), beltMat);
    belt.position.set(0, -0.4, 0);
    torso.add(belt);

    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.22, 0.58), goldMat);
    buckle.position.set(0, -0.4, 0);
    torso.add(buckle);

    // Sword on back
    const swordHilt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.12), goldMat);
    swordHilt.position.set(0.25, 0.7, -0.32);
    swordHilt.rotation.z = -0.35;
    torso.add(swordHilt);

    const swordCross = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.14), goldMat);
    swordCross.position.set(0.25, 0.45, -0.32);
    swordCross.rotation.z = -0.35;
    torso.add(swordCross);

    const scabbard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.3, 0.15), tunicMat);
    scabbard.position.set(0.05, -0.15, -0.32);
    scabbard.rotation.z = -0.35;
    torso.add(scabbard);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), skinMat);
    head.position.y = 2.15;
    head.castShadow = true;
    root.add(head);
    anim.head = head;

    // Spiky heroic hair
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.35, 0.62), hairMat);
    hair.position.set(0, 0.2, -0.04);
    head.add(hair);

    const hairSpike = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.4, 4), hairMat);
    hairSpike.position.set(0, 0.42, 0.1);
    hairSpike.rotation.x = -0.3;
    head.add(hairSpike);

    // Red Hero Headband
    const headband = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.12, 0.58), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    headband.position.set(0, 0.08, 0);
    head.add(headband);

    // Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 0.28), tunicMat);
    armL.position.set(-0.6, 1.3, 0);
    armL.castShadow = true;
    root.add(armL);
    anim.armL = armL;

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 0.28), tunicMat);
    armR.position.set(0.6, 1.3, 0);
    armR.castShadow = true;
    root.add(armR);
    anim.armR = armR;

    // Legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), pantsMat);
    legL.position.set(-0.25, 0.5, 0);
    legL.castShadow = true;
    root.add(legL);
    anim.legL = legL;

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), pantsMat);
    legR.position.set(0.25, 0.5, 0);
    legR.castShadow = true;
    root.add(legR);
    anim.legR = legR;
  }

  // 2. PRINCESS OF THE REALM (Aurelia)
  static buildPrincess(root, anim) {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffe0bd, flatShading: true });
    const gownMat = new THREE.MeshLambertMaterial({ color: 0xec4899, flatShading: true }); // Pink royal dress
    const gownTrimMat = new THREE.MeshLambertMaterial({ color: 0xfdf2f8, flatShading: true });
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xfbbf24, flatShading: true });  // Tiara gold
    const hairMat = new THREE.MeshLambertMaterial({ color: 0xfef08a, flatShading: true });  // Golden locks

    // Upper Torso / Bodice
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.9, 0.45), gownMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    root.add(torso);
    anim.torso = torso;

    // Flowing bell gown skirt
    const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.15, 8), gownMat);
    skirt.position.set(0, 0.58, 0);
    skirt.castShadow = true;
    root.add(skirt);

    // Gown bottom trim
    const skirtTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.15, 8), gownTrimMat);
    skirtTrim.position.set(0, 0.08, 0);
    root.add(skirtTrim);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
    head.position.y = 2.1;
    head.castShadow = true;
    root.add(head);
    anim.head = head;

    // Elegant long hair
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.4, 0.58), hairMat);
    hair.position.set(0, 0.15, -0.05);
    head.add(hair);

    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.8, 0.2), hairMat);
    hairBack.position.set(0, -0.3, -0.25);
    head.add(hairBack);

    // Golden Princess Tiara
    const tiara = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.25, 4), goldMat);
    tiara.rotation.y = Math.PI / 4;
    tiara.position.set(0, 0.38, 0.08);
    head.add(tiara);

    const gem = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08, 0), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
    gem.position.set(0, 0.38, 0.22);
    head.add(gem);

    // Arms with silk gloves
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.85, 0.22), gownTrimMat);
    armL.position.set(-0.52, 1.3, 0);
    armL.castShadow = true;
    root.add(armL);
    anim.armL = armL;

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.85, 0.22), gownTrimMat);
    armR.position.set(0.52, 1.3, 0);
    armR.castShadow = true;
    root.add(armR);
    anim.armR = armR;

    // Concealed legs under skirt
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.22), skinMat);
    legL.position.set(-0.2, 0.3, 0);
    root.add(legL);
    anim.legL = legL;

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.6, 0.22), skinMat);
    legR.position.set(0.2, 0.3, 0);
    root.add(legR);
    anim.legR = legR;
  }

  // 3. THE DEMON KING (Malakor)
  static buildDemonKing(root, anim) {
    const armorMat = new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true }); // Obsidian plate
    const redPlateMat = new THREE.MeshLambertMaterial({ color: 0x7f1d1d, flatShading: true }); // Blood red steel
    const hornMat = new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true });  // Demon horns
    const glowEyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 }); // Burning red eyes
    const capeMat = new THREE.MeshLambertMaterial({ color: 0x450a0a, flatShading: true });

    // Broad demonic torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.3, 0.65), armorMat);
    torso.position.y = 1.45;
    torso.castShadow = true;
    root.add(torso);
    anim.torso = torso;

    // Glowing chest core
    const core = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), glowEyeMat);
    core.position.set(0, 0.2, 0.34);
    torso.add(core);

    // Spiked Pauldrons (Shoulder pads)
    [-0.75, 0.75].forEach(sx => {
      const pauldron = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.5, 4), redPlateMat);
      pauldron.position.set(sx, 0.55, 0);
      pauldron.rotation.z = sx > 0 ? -0.4 : 0.4;
      torso.add(pauldron);
    });

    // Flowing Dark Cape
    const cape = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.6, 0.1), capeMat);
    cape.position.set(0, -0.15, -0.38);
    cape.rotation.x = 0.15;
    torso.add(cape);
    anim.cape = cape;

    // Horned Demon Helmet
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.65), armorMat);
    head.position.y = 2.35;
    head.castShadow = true;
    root.add(head);
    anim.head = head;

    // Curved low-poly demon horns
    [-0.32, 0.32].forEach(hx => {
      const hornBase = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.75, 5), hornMat);
      hornBase.position.set(hx, 0.45, 0);
      hornBase.rotation.z = hx > 0 ? -0.6 : 0.6;
      hornBase.rotation.x = -0.3;
      head.add(hornBase);
    });

    // Glowing Eye Visor
    const eyeVisor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.2), glowEyeMat);
    eyeVisor.position.set(0, 0.05, 0.3);
    head.add(eyeVisor);

    // Muscular Armored Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 0.35), redPlateMat);
    armL.position.set(-0.8, 1.35, 0);
    armL.castShadow = true;
    root.add(armL);
    anim.armL = armL;

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 0.35), redPlateMat);
    armR.position.set(0.8, 1.35, 0);
    armR.castShadow = true;
    root.add(armR);
    anim.armR = armR;

    // Heavy Plated Legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.0, 0.4), armorMat);
    legL.position.set(-0.32, 0.5, 0);
    legL.castShadow = true;
    root.add(legL);
    anim.legL = legL;

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.0, 0.4), armorMat);
    legR.position.set(0.32, 0.5, 0);
    legR.castShadow = true;
    root.add(legR);
    anim.legR = legR;
  }

  // 4. OVERPOWERED SIDE CHARACTER (Kage)
  static buildOPSideCharacter(root, anim) {
    const coatMat = new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true }); // Pitch black duster
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x581c87, flatShading: true }); // Dark purple shirt
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdbac, flatShading: true });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9, flatShading: true }); // Silver white hair
    const cyanGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 }); // Glowing blindfold / aura
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true });

    // Torso with high collar coat
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.15, 0.5), shirtMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    root.add(torso);
    anim.torso = torso;

    // High upturned trench coat collar
    const collarL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.45), coatMat);
    collarL.position.set(-0.45, 0.6, 0);
    torso.add(collarL);

    const collarR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.45), coatMat);
    collarR.position.set(0.45, 0.6, 0);
    torso.add(collarR);

    // Coat tails hanging down
    const coatTails = new THREE.Mesh(new THREE.BoxGeometry(0.88, 1.0, 0.1), coatMat);
    coatTails.position.set(0, -0.85, -0.22);
    torso.add(coatTails);

    // Sheathed Katana / Nodachi on left hip
    const scabbard = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 5), coatMat);
    scabbard.rotation.z = Math.PI / 4;
    scabbard.position.set(-0.55, -0.15, 0.1);
    torso.add(scabbard);

    const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 6), goldMat);
    tsuba.rotation.z = Math.PI / 4;
    tsuba.position.set(-0.95, 0.25, 0.1);
    torso.add(tsuba);

    const katanaHilt = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 4), shirtMat);
    katanaHilt.rotation.z = Math.PI / 4;
    katanaHilt.position.set(-1.15, 0.45, 0.1);
    torso.add(katanaHilt);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.52, 0.52), skinMat);
    head.position.y = 2.15;
    head.castShadow = true;
    root.add(head);
    anim.head = head;

    // Spiky silver anime hair
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.35, 0.6), hairMat);
    hair.position.set(0, 0.2, -0.04);
    head.add(hair);

    const bang = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 4), hairMat);
    bang.position.set(-0.15, 0.05, 0.32);
    bang.rotation.x = -0.5;
    head.add(bang);

    // Glowing Cyan Eye / Visor (Cool mysterious OP look)
    const eyeBand = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.55), cyanGlowMat);
    eyeBand.position.set(0, 0.02, 0);
    head.add(eyeBand);

    // Coat Arms (Hands in pockets / cool demeanor)
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 0.28), coatMat);
    armL.position.set(-0.58, 1.3, 0);
    armL.castShadow = true;
    root.add(armL);
    anim.armL = armL;

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 0.28), coatMat);
    armR.position.set(0.58, 1.3, 0);
    armR.castShadow = true;
    root.add(armR);
    anim.armR = armR;

    // Slacks
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.3), coatMat);
    legL.position.set(-0.24, 0.5, 0);
    legL.castShadow = true;
    root.add(legL);
    anim.legL = legL;

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.3), coatMat);
    legR.position.set(0.24, 0.5, 0);
    legR.castShadow = true;
    root.add(legR);
    anim.legR = legR;
  }

  // 5. THE KING (King Reginald)
  static buildKing(root, anim) {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdbac, flatShading: true });
    const velvetMat = new THREE.MeshLambertMaterial({ color: 0x991b1b, flatShading: true }); // Crimson velvet
    const ermineMat = new THREE.MeshLambertMaterial({ color: 0xf8fafc, flatShading: true }); // White royal fur
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true });   // Royal gold
    const beardMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true });  // Regal white beard

    // Royal Robed Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.6), velvetMat);
    torso.position.y = 1.4;
    torso.castShadow = true;
    root.add(torso);
    anim.torso = torso;

    // Ermine fur collar & trim
    const furCollar = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.3, 0.7), ermineMat);
    furCollar.position.set(0, 0.5, 0);
    torso.add(furCollar);

    const furStripe = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 0.64), ermineMat);
    furStripe.position.set(0, 0, 0);
    torso.add(furStripe);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), skinMat);
    head.position.y = 2.2;
    head.castShadow = true;
    root.add(head);
    anim.head = head;

    // Majestic White Royal Beard
    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.45, 0.3), beardMat);
    beard.position.set(0, -0.22, 0.2);
    head.add(beard);

    // Golden Royal Crown
    const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.32, 0.22, 8), goldMat);
    crownBase.position.set(0, 0.36, 0);
    head.add(crownBase);

    // Crown Spikes with jewels
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 4), goldMat);
      spike.position.set(Math.sin(a) * 0.32, 0.52, Math.cos(a) * 0.32);
      head.add(spike);

      const ruby = new THREE.Mesh(new THREE.DodecahedronGeometry(0.05, 0), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      ruby.position.set(Math.sin(a) * 0.32, 0.62, Math.cos(a) * 0.32);
      head.add(ruby);
    }

    // Robed Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.3), velvetMat);
    armL.position.set(-0.68, 1.35, 0);
    armL.castShadow = true;
    root.add(armL);
    anim.armL = armL;

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.95, 0.3), velvetMat);
    armR.position.set(0.68, 1.35, 0);
    armR.castShadow = true;
    root.add(armR);
    anim.armR = armR;

    // Golden Sovereign Scepter in right hand
    const scepter = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), goldMat);
    scepter.position.set(0.85, 1.1, 0.3);
    root.add(scepter);

    const scepterOrb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16, 0), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
    scepterOrb.position.set(0.85, 1.85, 0.3);
    root.add(scepterOrb);

    // Legs
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), velvetMat);
    legL.position.set(-0.26, 0.5, 0);
    root.add(legL);
    anim.legL = legL;

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), velvetMat);
    legR.position.set(0.26, 0.5, 0);
    root.add(legR);
    anim.legR = legR;
  }

  // 6. THE RETIRED HERO (Master Vance)
  static buildRetiredHero(root, anim) {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xd4a373, flatShading: true }); // Weathered skin
    const vestMat = new THREE.MeshLambertMaterial({ color: 0x3f6212, flatShading: true }); // Olive fisherman vest
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7, flatShading: true });// Cream shirt
    const hatMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });   // Leather hat
    const grayHairMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8, flatShading: true }); // Veteran gray
    const caneMat = new THREE.MeshLambertMaterial({ color: 0x92400e, flatShading: true });

    // Weathered Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.88, 1.15, 0.52), shirtMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    root.add(torso);
    anim.torso = torso;

    // Olive Veteran Vest
    const vest = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.95, 0.56), vestMat);
    vest.position.set(0, 0.05, 0);
    torso.add(vest);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), skinMat);
    head.position.y = 2.15;
    head.castShadow = true;
    root.add(head);
    anim.head = head;

    // Grizzled Gray Beard
    const beard = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.35, 0.35), grayHairMat);
    beard.position.set(0, -0.18, 0.16);
    head.add(beard);

    // Weathered Slouch Hat
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 8), hatMat);
    hatBrim.position.set(0, 0.28, 0);
    head.add(hatBrim);

    const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.28, 6), hatMat);
    hatCrown.position.set(0, 0.44, 0);
    head.add(hatCrown);

    // Eyepatch on left eye
    const eyepatch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.08), new THREE.MeshBasicMaterial({ color: 0x0f172a }));
    eyepatch.position.set(-0.16, 0.06, 0.28);
    head.add(eyepatch);

    // Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 0.28), shirtMat);
    armL.position.set(-0.6, 1.3, 0);
    armL.castShadow = true;
    root.add(armL);
    anim.armL = armL;

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 0.28), shirtMat);
    armR.position.set(0.6, 1.3, 0);
    armR.castShadow = true;
    root.add(armR);
    anim.armR = armR;

    // Walking Staff / Old Blade
    const cane = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.6, 5), caneMat);
    cane.position.set(0.78, 0.8, 0.25);
    root.add(cane);

    // Pants & Boots
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), hatMat);
    legL.position.set(-0.25, 0.5, 0);
    root.add(legL);
    anim.legL = legL;

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), hatMat);
    legR.position.set(0.25, 0.5, 0);
    root.add(legR);
    anim.legR = legR;
  }
}

