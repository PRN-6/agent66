import * as THREE from 'three';

export class ElvenBiome {
  constructor(scene, dayNightCycle) {
    this.scene = scene;
    this.dayNightCycle = dayNightCycle;
    this.colliders = [];
    this.animatedObjects = [];

    this.initMoonSanctuary();
    this.initColossalElderTrees();
    this.initCanopyBridges();
    this.initFairyRings();
    this.initArcheryGrove();
    this.initHangingSpiritLanterns();
  }

  // 1. High Elven Moon Spire & Sanctuary Pavilion at (-200, 200)
  initMoonSanctuary() {
    const group = new THREE.Group();
    group.position.set(-200, 0.5, 200);

    const silverMat = new THREE.MeshLambertMaterial({ color: 0xf1f5f9, flatShading: true }); // Pearl white stone
    const jadeMat = new THREE.MeshLambertMaterial({ color: 0x059669, flatShading: true });   // Emerald tile
    const waterMat = new THREE.MeshLambertMaterial({ color: 0x06b6d4, flatShading: true });
    const moonOrbMat = new THREE.MeshStandardMaterial({
      color: 0xa5f3fc,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });

    // Circular Tiered Marble Dais
    const dais1 = new THREE.Mesh(new THREE.CylinderGeometry(22, 24, 1.2, 12), silverMat);
    dais1.position.y = 0.6;
    dais1.receiveShadow = true;
    group.add(dais1);

    const dais2 = new THREE.Mesh(new THREE.CylinderGeometry(16, 17, 1.0, 12), silverMat);
    dais2.position.y = 1.7;
    dais2.receiveShadow = true;
    group.add(dais2);

    // 8 Elegant Slender Marble Colonnade Pillars with Arches
    const pillarGeom = new THREE.CylinderGeometry(0.8, 1.0, 14, 8);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const px = Math.cos(angle) * 14;
      const pz = Math.sin(angle) * 14;

      const col = new THREE.Mesh(pillarGeom, silverMat);
      col.position.set(px, 8.5, pz);
      col.castShadow = true;
      group.add(col);

      // Curved Spire Capital
      const cap = new THREE.Mesh(new THREE.ConeGeometry(1.6, 4.0, 6), jadeMat);
      cap.position.set(px, 17, pz);
      group.add(cap);

      this.colliders.push({
        type: 'cylinder',
        x: -200 + px,
        z: 200 + pz,
        radius: 1.4
      });
    }

    // Central Moon Well & Fountain
    const wellRim = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.8, 1.4, 8), silverMat);
    wellRim.position.y = 2.4;
    group.add(wellRim);

    const wellWater = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.2, 8), waterMat);
    wellWater.position.y = 3.0;
    group.add(wellWater);

    // Levitating Celestial Moon Orb
    const moonOrb = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), moonOrbMat);
    moonOrb.position.set(0, 7.5, 0);
    group.add(moonOrb);
    this.animatedObjects.push({ type: 'moon', mesh: moonOrb, speed: 0.6 });

    const moonLight = new THREE.PointLight(0x38bdf8, 1.6, 26);
    moonLight.position.set(0, 8.0, 0);
    moonLight.userData.baseIntensity = 1.6;
    group.add(moonLight);
    this.dayNightCycle.registerNightLight(moonLight);

    // Central High Crystalline Spire Cap (Elevated Canopy Roof)
    const centralRoof = new THREE.Mesh(new THREE.ConeGeometry(15, 8.5, 8), jadeMat);
    centralRoof.position.set(0, 20, 0);
    centralRoof.castShadow = true;
    group.add(centralRoof);

    this.scene.add(group);

    // Well center collider
    this.colliders.push({
      type: 'cylinder',
      x: -200,
      z: 200,
      radius: 5.6
    });
  }

  // 2. Colossal Sacred Elder Trees
  initColossalElderTrees() {
    const group = new THREE.Group();
    const barkMat = new THREE.MeshLambertMaterial({ color: 0x3e2723, flatShading: true }); // Ancient deep mahogany
    const foliageMat = new THREE.MeshLambertMaterial({ color: 0x047857, flatShading: true }); // Emerald canopy
    const woodPlatformMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });

    const elderTreePositions = [
      [-140, 150], [-260, 150], [-140, 260], [-260, 260],
      [-190, 310], [-290, 210], [-110, 210]
    ];

    elderTreePositions.forEach(([tx, tz]) => {
      // Giant hollow/massive trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 5.0, 26, 8), barkMat);
      trunk.position.set(tx, 13, tz);
      trunk.castShadow = true;
      group.add(trunk);

      // Multi-tier lush foliage crowns
      [22, 28, 34].forEach((fy, idx) => {
        const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(12 - idx * 2.5, 0), foliageMat);
        foliage.position.set(tx + (idx % 2 ? 2 : -2), fy, tz);
        foliage.castShadow = true;
        group.add(foliage);
      });

      // Elevated Wooden Canopy Platform around the trunk at height 10m
      const platform = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 8.5, 0.6, 8), woodPlatformMat);
      platform.position.set(tx, 10, tz);
      group.add(platform);

      // Railing posts
      for (let i = 0; i < 8; i++) {
        const ang = (i * Math.PI * 2) / 8;
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.2, 4), woodPlatformMat);
        post.position.set(tx + Math.cos(ang) * 8.0, 11.1, tz + Math.sin(ang) * 8.0);
        group.add(post);
      }

      this.colliders.push({
        type: 'cylinder',
        x: tx,
        z: tz,
        radius: 4.8
      });
    });

    this.scene.add(group);
  }

  // 3. Elevated Canopy Rope Suspension Bridges linking elder trees
  initCanopyBridges() {
    const bridgeGroup = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
    const ropeMat = new THREE.MeshLambertMaterial({ color: 0xd4a373, flatShading: true });

    const connections = [
      [[-140, 150], [-200, 200]],
      [[-260, 150], [-200, 200]],
      [[-140, 260], [-200, 200]],
      [[-260, 260], [-200, 200]]
    ];

    connections.forEach(([p1, p2]) => {
      const midX = (p1[0] + p2[0]) / 2;
      const midZ = (p1[1] + p2[1]) / 2;
      const length = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) - 14;
      const angle = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);

      const deck = new THREE.Mesh(new THREE.BoxGeometry(length, 0.35, 3.2), woodMat);
      deck.position.set(midX, 10, midZ);
      deck.rotation.y = -angle;
      deck.castShadow = true;
      bridgeGroup.add(deck);

      // Rope handrails
      [-1.4, 1.4].forEach(offsetZ => {
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, length, 4), ropeMat);
        rail.position.set(midX - Math.sin(-angle) * offsetZ, 11.2, midZ + Math.cos(-angle) * offsetZ);
        rail.rotation.z = Math.PI / 2;
        rail.rotation.y = -angle;
        bridgeGroup.add(rail);
      });
    });

    this.scene.add(bridgeGroup);
  }

  // 4. Bioluminescent Fairy Rings & Giant Glowing Mushrooms
  initFairyRings() {
    const group = new THREE.Group();

    const ringCenters = [
      [-170, 130], [-230, 130], [-170, 280], [-230, 280]
    ];

    const mushroomColors = [0x06b6d4, 0xa855f7, 0x10b981, 0xec4899];

    ringCenters.forEach(([cx, cz], rIdx) => {
      const ringRadius = 7.0;

      for (let i = 0; i < 9; i++) {
        const angle = (i * Math.PI * 2) / 9;
        const mx = cx + Math.cos(angle) * ringRadius;
        const mz = cz + Math.sin(angle) * ringRadius;

        const mColor = mushroomColors[(i + rIdx) % mushroomColors.length];

        // Stalk
        const stalk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.35, 1.6, 5),
          new THREE.MeshLambertMaterial({ color: 0xf1f5f9, flatShading: true })
        );
        stalk.position.set(mx, 0.8, mz);
        stalk.castShadow = true;
        group.add(stalk);

        // Glowing Cap
        const cap = new THREE.Mesh(
          new THREE.SphereGeometry(0.75, 6, 6, 0, Math.PI * 2, 0, Math.PI / 2),
          new THREE.MeshStandardMaterial({
            color: mColor,
            emissive: mColor,
            emissiveIntensity: 0.9,
            roughness: 0.3
          })
        );
        cap.position.set(mx, 1.5, mz);
        cap.castShadow = true;
        group.add(cap);
      }

      // Soft magical glow point light in center of fairy ring
      const ringLight = new THREE.PointLight(mushroomColors[rIdx % mushroomColors.length], 0.9, 14);
      ringLight.position.set(cx, 1.8, cz);
      ringLight.userData.baseIntensity = 0.9;
      group.add(ringLight);
      this.dayNightCycle.registerNightLight(ringLight);
    });

    this.scene.add(group);
  }

  // 5. Elven Archery Grove & Targets
  initArcheryGrove() {
    const group = new THREE.Group();
    group.position.set(-110, 0.5, 150);

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
    const strawMat = new THREE.MeshLambertMaterial({ color: 0xfef08a, flatShading: true });
    const redMat = new THREE.MeshLambertMaterial({ color: 0xef4444, flatShading: true });

    // 4 Archery Targets
    [-6, -2, 2, 6].forEach(offset => {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.2, 4), woodMat);
      stand.position.set(offset, 1.6, 12);
      stand.rotation.x = 0.15;
      group.add(stand);

      // Outer straw target
      const targetOuter = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.3, 8), strawMat);
      targetOuter.rotation.x = Math.PI / 2;
      targetOuter.position.set(offset, 2.2, 12.2);
      group.add(targetOuter);

      // Bullseye
      const bullseye = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.35, 8), redMat);
      bullseye.rotation.x = Math.PI / 2;
      bullseye.position.set(offset, 2.2, 12.25);
      group.add(bullseye);

      this.colliders.push({
        type: 'cylinder',
        x: -110 + offset,
        z: 150 + 12,
        radius: 1.4
      });
    });

    // Bow Rack & Quivers
    const rack = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.8, 1.2), woodMat);
    rack.position.set(0, 0.9, 0);
    group.add(rack);

    this.scene.add(group);

    this.colliders.push({
      type: 'box',
      minX: -110 - 4.0,
      maxX: -110 + 4.0,
      minZ: 150 - 1.0,
      maxZ: 150 + 1.0
    });
  }

  // 6. Hanging Spirit Lanterns
  initHangingSpiritLanterns() {
    const group = new THREE.Group();
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      emissive: 0x10b981,
      emissiveIntensity: 0.95,
      roughness: 0.2
    });

    const lanternCoords = [
      [-170, 170], [-230, 170], [-170, 230], [-230, 230],
      [-140, 200], [-260, 200], [-200, 140], [-200, 260]
    ];

    lanternCoords.forEach(([lx, lz]) => {
      // Hanging crystal teardrop
      const teardrop = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), crystalMat);
      teardrop.scale.set(1.0, 1.8, 1.0);
      teardrop.position.set(lx, 6.5, lz);
      group.add(teardrop);

      const light = new THREE.PointLight(0x10b981, 1.1, 16);
      light.position.set(lx, 6.2, lz);
      light.userData.baseIntensity = 1.1;
      group.add(light);
      this.dayNightCycle.registerNightLight(light);
    });

    this.scene.add(group);
  }

  update(delta, time) {
    this.animatedObjects.forEach(obj => {
      if (obj.type === 'moon') {
        obj.mesh.rotation.y += delta * obj.speed;
        obj.mesh.position.y = 7.5 + Math.sin(time * 1.8) * 0.2;
      }
    });
  }
}

