import * as THREE from 'three';
import { WORLD_SIZE } from '../config/constants.js';
import { getTerrainHeight, getDistToImperialRoad, clamp, smoothstep } from '../utils/math.js';

export class Terrain {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.init();
  }

  init() {
    // 180x180 segments over 1600x1600 world creates crisp low-poly triangular facets
    const segments = 180;
    const geometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    // ==========================================
    // 1. REGIONAL REALM PALETTES
    // ==========================================
    // 1.1 Human Kingdom of Valoria (North-East)
    const colHumanMeadow = new THREE.Color(0x4d6938);     // Lush pastoral clover
    const colHumanMeadowLight = new THREE.Color(0x5a7a40);
    const colHumanFarmland = new THREE.Color(0x857739);   // Golden straw pasture
    const colHumanCourtyard = new THREE.Color(0x52525b);  // Castle stone pavers
    const colHumanRoad = new THREE.Color(0x6b7280);       // Flagstone highroad

    // 1.2 Dark Territory of the Demons (North-West)
    const colDemonAsh = new THREE.Color(0x18181b);        // Obsidian black ash
    const colDemonScorched = new THREE.Color(0x450a0a);   // Blood-red scorched crust
    const colDemonBasalt = new THREE.Color(0x27272a);     // Dark volcanic basalt
    const colDemonRoad = new THREE.Color(0x201515);       // Scorched basalt road

    // 1.3 Enchanted Forest of the Elves (South-West)
    const colElvenMoss = new THREE.Color(0x064e3b);       // Deep mystic emerald
    const colElvenTeal = new THREE.Color(0x0f766e);       // Luminous teal mana glade
    const colElvenGrass = new THREE.Color(0x047857);      // Vivid elven turf
    const colElvenRoad = new THREE.Color(0x134e4a);       // Starlight stone path

    // 1.4 Industrial City of the Dwarves (South-East)
    const colDwarfGranite = new THREE.Color(0x44403c);    // Dark mountain granite
    const colDwarfForgeEarth = new THREE.Color(0x78350f); // Red-brown iron clay
    const colDwarfSlate = new THREE.Color(0x57534e);      // Crushed rock
    const colDwarfRoad = new THREE.Color(0x3f3f46);       // Cast-iron slate road

    // 1.5 Natural Boundaries & Coastline
    const colRiverBed = new THREE.Color(0x1c1917);        // Wet river stone
    const colBeachSand = new THREE.Color(0xd4a373);       // Golden coastline sand
    const colDeepOcean = new THREE.Color(0x0c1e33);       // Abyssal deep ocean seabed
    const colSnow = new THREE.Color(0xe2e8f0);            // Alpine mountain peak snow

    const vertex = new THREE.Vector3();
    const baseCol = new THREE.Color();
    const roadCol = new THREE.Color();
    const finalCol = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      vertex.fromBufferAttribute(pos, i);

      // Displace height using the master unified terrain height function
      const h = getTerrainHeight(vertex.x, vertex.z);
      vertex.y = h;
      pos.setXYZ(i, vertex.x, vertex.y, vertex.z);

      const x = vertex.x;
      const z = vertex.z;
      const distFromCenter = Math.hypot(x, z);

      // River canyon check
      const riverDist = Math.abs(x - Math.sin(z * 0.01) * 35);
      const isRiver = (riverDist < 24 && z > -780 && z < 680);
      const isCrossroadsBridge = (Math.abs(x) < 26 && Math.abs(z - 10) < 14);

      // -------------------------------------------------------------
      // STEP 1: COMPUTE BASE BIOME COLOR
      // -------------------------------------------------------------
      if (isRiver && !isCrossroadsBridge && h < 0.1) {
        // Riverbed
        baseCol.copy(colRiverBed);
      } else if (isCrossroadsBridge) {
        // Central Crossroads Bridge Deck
        baseCol.copy(colHumanCourtyard).lerp(colHumanMeadow, 0.4);
      } else if (x <= 20 && z < 40) {
        // --- DEMON DARK TERRITORY (North-West) ---
        const distToLava = Math.hypot(x - (-160), z - (-250));
        const distToCitadel = Math.hypot(x - (-220), z - (-220));
        if (distToLava < 30) {
          baseCol.copy(colDemonScorched);
        } else if (distToCitadel < 45) {
          baseCol.copy(colDemonAsh);
        } else {
          const noise = Math.sin(x * 0.05) * Math.cos(z * 0.05);
          baseCol.copy(noise > 0.2 ? colDemonScorched : (noise < -0.2 ? colDemonBasalt : colDemonAsh));
        }
      } else if (x <= 20 && z >= 40) {
        // --- ELVEN FOREST (South-West) ---
        const distToSanctuary = Math.hypot(x - (-200), z - 200);
        const distToGlade = Math.hypot(x - (-160), z - 90);
        if (distToSanctuary < 32 || distToGlade < 30) {
          baseCol.copy(colElvenTeal);
        } else {
          const noise = Math.sin(x * 0.045) * Math.cos(z * 0.045);
          baseCol.copy(noise > 0.1 ? colElvenMoss : colElvenGrass);
        }
      } else if (x > 20 && z >= 40) {
        // --- DWARVEN INDUSTRY CITY (South-East) ---
        const distToFurnace = Math.hypot(x - 140, z - 240);
        const distToBastion = Math.hypot(x - 200, z - 200);
        if (h > 3.6) {
          // Alpine mountain peak with snow dusted crags
          baseCol.copy(colDwarfGranite).lerp(colSnow, clamp((h - 3.6) / 2.0, 0, 0.7));
        } else if (distToFurnace < 40) {
          baseCol.copy(colDwarfForgeEarth);
        } else if (distToBastion < 45) {
          baseCol.copy(colDwarfGranite);
        } else {
          const noise = Math.sin(x * 0.04) * Math.cos(z * 0.04);
          baseCol.copy(noise > 0.15 ? colDwarfForgeEarth : (noise < -0.15 ? colDwarfGranite : colDwarfSlate));
        }
      } else {
        // --- HUMAN KINGDOM (North-East) ---
        const distToCitadel = Math.hypot(x - 380, z - (-380));
        const distToPavilion = Math.hypot(x - 470, z - (-370));
        const distToMarket = Math.hypot(x - 205, z - (-85));
        const distToFarmlands = Math.hypot(x - 95, z - 10);

        if (distToCitadel < 65) {
          baseCol.copy(colHumanCourtyard);
        } else if (distToPavilion < 32) {
          baseCol.copy(colHumanCourtyard).lerp(colHumanMeadow, 0.4);
        } else if (distToMarket < 42) {
          baseCol.copy(colHumanCourtyard).lerp(colHumanMeadow, 0.3);
        } else if (distToFarmlands < 40) {
          baseCol.copy(colHumanFarmland).lerp(colHumanMeadow, 0.35);
        } else {
          const noise = Math.sin(x * 0.035) * Math.cos(z * 0.035);
          baseCol.copy(noise > 0.2 ? colHumanMeadowLight : colHumanMeadow);
        }
      }

      finalCol.copy(baseCol);

      // -------------------------------------------------------------
      // STEP 2: GRAND IMPERIAL ROAD PAVING OVERLAY
      // -------------------------------------------------------------
      if (!isRiver || isCrossroadsBridge) {
        const roadDist = getDistToImperialRoad(x, z);
        if (roadDist < 6.0) {
          // Determine faction road style based on quadrant
          if (x > 20 && z < 40) {
            roadCol.copy(colHumanRoad);
          } else if (x > 20 && z >= 40) {
            roadCol.copy(colDwarfRoad);
          } else if (x <= 20 && z < 40) {
            roadCol.copy(colDemonRoad);
          } else {
            roadCol.copy(colElvenRoad);
          }

          if (roadDist <= 3.2) {
            finalCol.copy(roadCol);
          } else {
            const edgeBlend = smoothstep(3.2, 5.8, roadDist);
            finalCol.copy(roadCol).lerp(baseCol, edgeBlend);
          }
        }
      }

      // -------------------------------------------------------------
      // STEP 3: NATURAL ISLAND COASTLINE & OCEAN FLOOR
      // -------------------------------------------------------------
      if (distFromCenter > 610) {
        const coastFactor = smoothstep(610, 720, distFromCenter);
        if (h > -0.3) {
          // Golden sandy beach surf
          finalCol.lerp(colBeachSand, coastFactor);
        } else {
          // Deep abyssal ocean floor
          const depthFactor = smoothstep(0.0, -4.5, h);
          finalCol.copy(colBeachSand).lerp(colDeepOcean, depthFactor);
        }
      }

      colors[i * 3 + 0] = finalCol.r;
      colors[i * 3 + 1] = finalCol.g;
      colors[i * 3 + 2] = finalCol.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshLambertMaterial({
      vertexColors: true,
      flatShading: true
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;
    this.mesh.name = 'TerrainMesh';
    this.scene.add(this.mesh);
  }

  getMesh() {
    return this.mesh;
  }
}
