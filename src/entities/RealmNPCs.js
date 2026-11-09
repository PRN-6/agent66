import * as THREE from 'three';
import { getTerrainHeight } from '../utils/math.js';
import { resolveCircleCollision } from '../utils/collision.js';

export class RealmNPCs {
  constructor(scene, dayNightCycle) {
    this.scene = scene;
    this.dayNightCycle = dayNightCycle;
    this.npcs = [];
    this.colliders = [];
    this.worldColliders = [];
    this.currentNearbyNPC = null;

    // Shared Materials Palette
    this.mats = {
      skinHuman: new THREE.MeshLambertMaterial({ color: 0xffdbac, flatShading: true }),
      skinElf: new THREE.MeshLambertMaterial({ color: 0xffeedb, flatShading: true }),
      skinDemonRed: new THREE.MeshLambertMaterial({ color: 0xb91c1c, flatShading: true }),
      skinDemonPurple: new THREE.MeshLambertMaterial({ color: 0x581c87, flatShading: true }),
      skinDemonAsh: new THREE.MeshLambertMaterial({ color: 0x27272a, flatShading: true }),

      silver: new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true }),
      gold: new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true }),
      bronze: new THREE.MeshLambertMaterial({ color: 0xb45309, flatShading: true }),
      iron: new THREE.MeshLambertMaterial({ color: 0x3f3f46, flatShading: true }),
      obsidian: new THREE.MeshLambertMaterial({ color: 0x18181b, flatShading: true }),
      lavaGlow: new THREE.MeshLambertMaterial({ color: 0xef4444, emissive: 0x991b1b, flatShading: true }),
      bone: new THREE.MeshLambertMaterial({ color: 0xf3f4f6, flatShading: true }),

      wood: new THREE.MeshLambertMaterial({ color: 0x5c3a21, flatShading: true }),
      woodDark: new THREE.MeshLambertMaterial({ color: 0x3d2314, flatShading: true }),

      blueRoyal: new THREE.MeshLambertMaterial({ color: 0x1e3a8a, flatShading: true }),
      blueNavy: new THREE.MeshLambertMaterial({ color: 0x0f172a, flatShading: true }),
      greenForest: new THREE.MeshLambertMaterial({ color: 0x047857, flatShading: true }),
      greenJade: new THREE.MeshLambertMaterial({ color: 0x0f766e, flatShading: true }),
      purpleNether: new THREE.MeshLambertMaterial({ color: 0x3b0764, flatShading: true }),
      dwarfAmber: new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true }),
      dwarfBeardWhite: new THREE.MeshLambertMaterial({ color: 0xd4d4d8, flatShading: true }),
      dwarfBeardBrown: new THREE.MeshLambertMaterial({ color: 0x92400e, flatShading: true }),
      clothWhite: new THREE.MeshLambertMaterial({ color: 0xf8fafc, flatShading: true }),
      manaCyan: new THREE.MeshLambertMaterial({ color: 0x06b6d4, emissive: 0x0284c7, flatShading: true })
    };

    this.initNPCs();
  }

  setColliders(colliders) {
    this.worldColliders = colliders || [];
  }

  initNPCs() {
    const realmNPCData = [
      /* ---------------------------------------------------------------------
         1. HUMAN REALM NPCS (Kingdom of Valoria)
         --------------------------------------------------------------------- */
      {
        id: 'human_guard_captain',
        name: 'Captain Godric',
        badge: '🛡️ Citadel Guard Captain',
        title: 'Commander of the Royal Gate Garrison',
        race: 'human',
        age: 38,
        lifespan: '75 – 100 Years',
        color: '#3b82f6',
        x: 376,
        z: -326,
        role: 'salute',
        tunicMat: this.mats.blueRoyal,
        itemType: 'halberd',
        dialogues: [
          "Halt! You stand before the Citadel of Valoria. State your allegiance or lower your steel.",
          "Keep a sharp eye on the roads: Dwarves smuggle machine parts, Elves dodge bridge tolls claiming 'celestial nobility', and Demons kill on sight.",
          "Humans may not live a thousand years or have steam engines, but our adaptable grit built these walls and keeps the kingdom alive!",
          "King Reginald commands the gate garrison. Stay sharp in the market—trouble brews on all borders."
        ]
      },
      {
        id: 'human_scholar',
        name: 'Grand Scholar Alistair',
        badge: '📜 Royal Court Archivist',
        title: 'Chronicler of the 4 Realm Treaties',
        race: 'human',
        age: 64,
        lifespan: '75 – 100 Years',
        color: '#60a5fa',
        x: 386,
        z: -365,
        role: 'reading',
        tunicMat: this.mats.blueNavy,
        itemType: 'scroll',
        dialogues: [
          "Ah, greetings! I was chronicling the ancient friction between the four races. It has festered for three eras.",
          "The Elves flaunt their celestial nobility, while the Dwarves worship mechanical engineering and iron gears.",
          "And the Demons? Demons despise all breathing life equally. There is no negotiating with Malakor's brood.",
          "Yet it is human versatility and resourceful commerce that keeps the Great River bridges open."
        ]
      },
      {
        id: 'human_barkeep',
        name: 'Barnaby the Barkeep',
        badge: '🍺 Tavern Keeper',
        title: 'Proprietor of The Dragon’s Rest Tavern',
        race: 'human',
        age: 49,
        lifespan: '75 – 100 Years',
        color: '#fbbf24',
        x: 205,
        z: -87,
        role: 'serving',
        tunicMat: this.mats.wood,
        itemType: 'tankard',
        dialogues: [
          "Welcome to The Dragon's Rest! Pull up a stool and have a flagon of spiced Valorian cider!",
          "You won't see many elves in here—they claim our wooden benches are 'beneath their noble poise'. Hah!",
          "The dwarves drop in when they want ale, but they complain our mugs aren't calibrated with precision calipers!",
          "If a demon ever kicks that tavern door down, I keep a loaded heavy iron blunderbuss right under the counter!"
        ]
      },
      {
        id: 'human_merchant',
        name: 'Madame Vivienne',
        badge: '⚖️ Master Merchant',
        title: 'Overseer of the Town Market Bazaar',
        race: 'human',
        age: 42,
        lifespan: '75 – 100 Years',
        color: '#34d399',
        x: 198,
        z: -114,
        role: 'bartering',
        tunicMat: this.mats.greenJade,
        itemType: 'pouch',
        dialogues: [
          "Finest silks from Valoria's looms and imported dwarven steel gears from Karak-Drak!",
          "Dwarves are mechanical geniuses, but bargaining with them is like trying to haggle with a granite boulder.",
          "The Elves look down their noses at our market stalls, calling our coins 'crude mortal metal'. But human coin feeds the realm!",
          "Keep your coin-purse close! Between demon raiders and greedy neighbors, a merchant has to be sharper than a razor."
        ]
      },

      /* ---------------------------------------------------------------------
         2. DEMON REALM NPCS (The Obsidian Nether Wastes)
         --------------------------------------------------------------------- */
      {
        id: 'demon_acolyte',
        name: 'Xarok the Void Acolyte',
        badge: '🔮 High Nether Priest',
        title: 'Guardian of the Void Sacrificial Altar',
        race: 'demon',
        age: 1850,
        lifespan: 'Ageless / Eternal',
        color: '#a855f7',
        x: -266,
        z: -248,
        role: 'chanting',
        tunicMat: this.mats.purpleNether,
        itemType: 'nether_staff',
        dialogues: [
          "The Void Crystal hums with primeval fury... Lord Malakor despises all mortal filth without exception!",
          "Elves preen in their white robes, humans scurry in their dirt, and dwarves clatter their stupid iron toys. We hate them all!",
          "Do not speak to me of peace or pacts. The Nether Altar hungers for the ashes of all four realms!",
          "The stars in the elven sky will be choked in soot, and their fragile 'nobility' burned to black cinders!"
        ]
      },
      {
        id: 'demon_commander',
        name: 'Dread Commander Vhazor',
        badge: '⚔️ Dread Legion Commander',
        title: 'Warlord of the Obsidian Keep Gate',
        race: 'demon',
        age: 2600,
        lifespan: 'Ageless / Eternal',
        color: '#ef4444',
        x: -215,
        z: -202,
        role: 'guarding',
        tunicMat: this.mats.obsidian,
        itemType: 'greatsword',
        dialogues: [
          "You stand before the Dread Keep! Bow your head or prepare your blade!",
          "Dwarves hide behind mechanical cogs. Elves hide behind flower petals. Humans hide behind castle walls. Cowards, all of them!",
          "Demons need no allies! Weakness is purged in boiling magma; raw obsidian power alone decides dominion!",
          "When the Bone Gate swings wide, the entire island will burn in netherflame!"
        ]
      },
      {
        id: 'demon_herder',
        name: 'Ignis the Magma Herder',
        badge: '🔥 Magma Herder',
        title: 'Tender of the Nether Molten Fissures',
        race: 'demon',
        age: 1200,
        lifespan: 'Ageless / Eternal',
        color: '#f97316',
        x: -152,
        z: -242,
        role: 'whipping',
        tunicMat: this.mats.skinDemonAsh,
        itemType: 'whip',
        dialogues: [
          "Stand back from the fissure! This lava boils hot enough to vaporize elven silk and melt dwarven armor in seconds!",
          "Demons don't make friends. Other races are either kindling for our fires or ash beneath our boots!",
          "The soft-skins sweat and weep in this heat. To us, it is the only pure element in this rotten world!",
          "If an elf or human falls into the magma channel, don't bother fishing them out—there won't even be teeth left!"
        ]
      },
      {
        id: 'demon_stalker',
        name: 'Shadow Stalker Nyx',
        badge: '🗡️ Nether Assassin',
        title: 'Silent Sentinel of the Bone Gate',
        race: 'demon',
        age: 950,
        lifespan: 'Ageless / Eternal',
        color: '#dc2626',
        x: -76,
        z: -196,
        role: 'sneaking',
        tunicMat: this.mats.obsidian,
        itemType: 'daggers',
        dialogues: [
          "Did you think you were alone? Most intruders only realize I'm here when the blade touches their throat.",
          "The Elves think their 'celestial nobility' protects them. My daggers slip between their white robes with ease.",
          "The Dwarves think their thick armor is impenetrable until venom seeps into their steam valves.",
          "Malakor's wrath burns eternal. We despise all living flesh on this island."
        ]
      },

      /* ---------------------------------------------------------------------
         3. ELVEN REALM NPCS (The Whispering Canopy of Sylvaheim)
         --------------------------------------------------------------------- */
      {
        id: 'elf_high_priestess',
        name: 'High Priestess Lunara',
        badge: '🌙 High Priestess of the Moon',
        title: 'Custodian of the Celestial Moon Orb',
        race: 'elf',
        age: 1420,
        lifespan: '1,500 – 3,000+ Years',
        color: '#38bdf8',
        x: -198,
        z: 196,
        role: 'chanting',
        tunicMat: this.mats.clothWhite,
        itemType: 'moon_staff',
        dialogues: [
          "Welcome to the Moon Spire Sanctuary, wanderer. Tread gently; you walk among celestial elven nobility.",
          "We elves were lords of the stars before humans could even light a campfire. Our celestial bloodline is immaculate.",
          "The Dwarves across the river blacken the sky with soot and industrial clatter. Such vulgar, unrefined troglodytes.",
          "And the Demons are foul abominations of brimstone. They possess neither grace nor honor—only mindless hatred."
        ]
      },
      {
        id: 'elf_moon_warden',
        name: 'Warden Thalor',
        badge: '🛡️ Moon Spire Warden',
        title: 'Guardian of the Sacred Colonnades',
        race: 'elf',
        age: 890,
        lifespan: '1,500 – 3,000+ Years',
        color: '#10b981',
        x: -208,
        z: 190,
        role: 'guarding',
        tunicMat: this.mats.greenForest,
        itemType: 'halberd',
        dialogues: [
          "Halt! None may bring drawn steel or vulgar manners into the Moon Spire Sanctuary.",
          "No dwarf may enter with his oily wrenches and clanking gears. Their mechanical toys offend our sacred marble.",
          "Humans are permitted only if they bow with respect, though their brief lives make them hasty and unruly.",
          "Our starlight polearms are forged for grace and lethal nobility. Cross us at your peril."
        ]
      },
      {
        id: 'elf_archery_master',
        name: 'Master Bowman Caelan',
        badge: '🎯 Master Bowman',
        title: 'Instructor of the Whispering Archery Grove',
        race: 'elf',
        age: 620,
        lifespan: '1,500 – 3,000+ Years',
        color: '#22c55e',
        x: -114,
        z: 146,
        role: 'aiming',
        tunicMat: this.mats.greenForest,
        itemType: 'bow',
        dialogues: [
          "Breathe with the wind... Release. An elven arrow flies with the elegance of pure celestial nobility.",
          "Dwarves boast about their heavy iron ballistas and steam engines. Clumsy, noisy contraptions that jam in the rain!",
          "A single elven archer in the high boughs can dismantle an entire dwarven engineering crew before they turn a bolt.",
          "As for the demons? Their thick horned hides are no match for a starlight broadhead to the eye."
        ]
      },
      {
        id: 'elf_druid',
        name: 'Druid Faelen',
        badge: '🍃 Elder Wood Druid',
        title: 'Speaker for the Colossal Elder Trees',
        race: 'elf',
        age: 2150,
        lifespan: '1,500 – 3,000+ Years',
        color: '#14b8a6',
        x: -142,
        z: 144,
        role: 'reading',
        tunicMat: this.mats.greenJade,
        itemType: 'druid_staff',
        dialogues: [
          "Feel the pulse of these ancient mahogany Elder Trees. Two thousand winters of peaceful elven guardianship.",
          "Dwarves dig into the earth like blind mole-rats, tearing roots for their filthy blast furnaces. It makes the spirits weep.",
          "Humans live seventy winters and imagine they master the land. They are like fleeting cicadas in summer.",
          "Only the elven nobility possesses the patience to commune with the eternal starlight song of the canopy."
        ]
      },

      /* ---------------------------------------------------------------------
         4. DWARVEN REALM NPCS (Karak-Drak Stronghold)
         --------------------------------------------------------------------- */
      {
        id: 'dwarf_gate_commander',
        name: 'Gate Commander Brokk Stonehelm',
        badge: '🛡️ Bastion Gate Commander',
        title: 'Warden of the Karak-Drak Iron Gate',
        race: 'dwarf',
        age: 210,
        lifespan: '350 – 500 Years',
        color: '#f59e0b',
        x: 200,
        z: 186,
        role: 'salute',
        tunicMat: this.mats.dwarfAmber,
        itemType: 'shield_hammer',
        dialogues: [
          "Halt right there! You stand before the unbreakable Iron Gate of Karak-Drak!",
          "See these steam-actuated hydraulic gate pistons? Dwarven technology at its finest! Could an elf make this with a twig?!",
          "Those fancy elf nobles look down their noses at our sweat and soot. Let's see them defend a gate with a poem and a lute!",
          "Dwarves stay united! Technology, brotherhood, and forged steel—that's how you win wars!"
        ]
      },
      {
        id: 'dwarf_chief_engineer',
        name: 'Chief Engineer Kazador',
        badge: '⚙️ High Blast Engineer',
        title: 'Master of the Great Blast Furnaces & Rotating Gears',
        race: 'dwarf',
        age: 340,
        lifespan: '350 – 500 Years',
        color: '#d97706',
        x: 142,
        z: 234,
        role: 'smithing',
        tunicMat: this.mats.iron,
        itemType: 'tongs',
        dialogues: [
          "Mind the flume! Five thousand gallons of molten iron pouring into precision cast gear-molds every hour!",
          "Those giant rotating iron cogs on the cliff face are masterpieces of dwarven mechanical engineering!",
          "Those elf snobs complain about our furnace chimneys! Ha! Our technology pumps fresh water, casts steel plate, and runs rails!",
          "And the demons? A demon thinks he's tough until a five-ton pneumatic steam hammer drops on his horned head!"
        ]
      },
      {
        id: 'dwarf_prospector',
        name: 'Prospector Durgin Gold-Eye',
        badge: '⛏️ Chief Prospector',
        title: 'Surveyor of the Minecart Rail Network',
        race: 'dwarf',
        age: 175,
        lifespan: '350 – 500 Years',
        color: '#eab308',
        x: 172,
        z: 196,
        role: 'mining',
        tunicMat: this.mats.dwarfAmber,
        itemType: 'pickaxe',
        dialogues: [
          "Clear the tracks! Automated ore cart rolling through on high-tensile steel rails!",
          "Humans try building carts out of green pine that split on the first gravel road. Real technology comes from Karak-Drak!",
          "Gold, mithril, and coal! We fuel the industry that arms the continent, while elves waste centuries singing to flowers!",
          "The candle in my helm never lies. Deep gas ahead—give me a wrench and a pressure valve, not an elven prayer!"
        ]
      },
      {
        id: 'dwarf_lorekeeper',
        name: 'Anvil Lorekeeper Morgrim',
        badge: '📖 Anvil Lorekeeper',
        title: 'Chronicler of the Colossal Anvil Monument',
        race: 'dwarf',
        age: 430,
        lifespan: '350 – 500 Years',
        color: '#b45309',
        x: 198,
        z: 252,
        role: 'reading',
        tunicMat: this.mats.bronze,
        itemType: 'chisel_scroll',
        dialogues: [
          "You stand before the Colossal Anvil of Karak-Drak. Nine meters of pure forged mechanical iron!",
          "Our engineering tablets prove: stone and steel outlast all elven illusions and all human kingdoms.",
          "The demons hate everyone, the elves think they're royalty, and the humans scramble for coins. But the dwarves forge the world!",
          "United we stand, hammer in hand, machine at the ready! Brotherhood and technology forever!"
        ]
      }
    ];

    realmNPCData.forEach(data => {
      const y = getTerrainHeight(data.x, data.z);
      const { group, animNodes } = this.buildRaceModel(data);
      group.position.set(data.x, y, data.z);

      // Create floating 2D billboard badge above head
      const badgeSprite = this.createNPCBadge(data);
      badgeSprite.position.set(0, (data.race === 'dwarf' ? 2.6 : 3.0), 0);
      group.add(badgeSprite);

      this.scene.add(group);

      // Dynamic cylinder collider that moves with the NPC
      const dynCollider = {
        type: 'cylinder',
        x: data.x,
        z: data.z,
        radius: 0.65
      };
      this.colliders.push(dynCollider);

      this.npcs.push({
        config: {
          id: data.id,
          name: data.name,
          badge: data.badge,
          title: data.title,
          color: data.color,
          race: data.race || 'human',
          age: data.age,
          lifespan: data.lifespan,
          dialogues: data.dialogues,
          isVillager: true,
          isPlayable: false
        },
        group: group,
        animNodes: animNodes,
        baseY: y,
        worldPos: new THREE.Vector3(data.x, y, data.z),
        spawnPos: new THREE.Vector3(data.x, y, data.z),
        targetPos: new THREE.Vector3(data.x, y, data.z),
        collider: dynCollider,
        state: 'idle',
        stateTimer: 1.5 + Math.random() * 3.0,
        walkSpeed: 2.2,
        wanderRadius: (data.id.includes('captain') ? 14.0 : (data.id.includes('scholar') ? 10.0 : 12.0)),
        walkCycle: Math.random() * Math.PI * 2,
        isInteracting: false,
        role: data.role
      });
    });
  }

  buildRaceModel(data) {
    const root = new THREE.Group();
    const anim = { torso: null, head: null, armL: null, armR: null, legL: null, legR: null, item: null };

    const isDwarf = (data.race === 'dwarf');
    const isDemon = (data.race === 'demon');
    const isElf = (data.race === 'elf');

    // Skin Tone
    let skinMat = this.mats.skinHuman;
    if (isElf) skinMat = this.mats.skinElf;
    else if (isDemon) {
      if (data.id.includes('acolyte')) skinMat = this.mats.skinDemonPurple;
      else if (data.id.includes('herder')) skinMat = this.mats.skinDemonRed;
      else skinMat = this.mats.skinDemonAsh;
    }

    const tunicMat = data.tunicMat || this.mats.iron;
    const pantsMat = this.mats.iron;
    const bootsMat = this.mats.woodDark;

    // Proportions
    const tW = isDwarf ? 0.95 : 0.78;
    const tH = isDwarf ? 0.82 : 1.05;
    const tD = isDwarf ? 0.58 : 0.46;
    const torsoY = isDwarf ? 1.0 : 1.3;

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(tW, tH, tD), tunicMat);
    torso.position.y = torsoY;
    torso.castShadow = true;
    root.add(torso);
    anim.torso = torso;

    // Belt
    const belt = new THREE.Mesh(new THREE.BoxGeometry(tW + 0.05, 0.16, tD + 0.05), this.mats.woodDark);
    belt.position.set(0, -tH * 0.35, 0);
    torso.add(belt);

    // Armor / Adornments
    if (data.race === 'human' && data.id.includes('guard')) {
      // Polished Breastplate
      const plate = new THREE.Mesh(new THREE.BoxGeometry(tW + 0.06, tH * 0.75, tD + 0.08), this.mats.silver);
      plate.position.set(0, 0.1, 0);
      torso.add(plate);
    } else if (isDemon) {
      // Demon Spiked Pauldrons
      [-tW / 2 - 0.12, tW / 2 + 0.12].forEach(sx => {
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 4), this.mats.obsidian);
        spike.position.set(sx, tH * 0.45, 0);
        spike.rotation.z = (sx < 0 ? 0.6 : -0.6);
        torso.add(spike);
      });
    }

    // Head
    const headY = torsoY + tH / 2 + 0.3;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.52, 0.48), skinMat);
    head.position.y = headY;
    head.castShadow = true;
    root.add(head);
    anim.head = head;

    // Headwear & Facial Features
    if (isDemon) {
      // Curved Demon Horns
      [-0.22, 0.22].forEach(hx => {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.85, 5), this.mats.obsidian);
        horn.position.set(hx, 0.35, -0.05);
        horn.rotation.z = (hx < 0 ? -0.45 : 0.45);
        horn.rotation.x = -0.3;
        head.add(horn);
      });
      // Glowing Eyes
      [-0.14, 0.14].forEach(ex => {
        const eye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), this.mats.lavaGlow);
        eye.position.set(ex, 0.05, 0.25);
        head.add(eye);
      });
    } else if (isElf) {
      // Pointed Elven Ears
      [-0.28, 0.28].forEach(ex => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.36, 4), skinMat);
        ear.position.set(ex, 0.06, -0.05);
        ear.rotation.z = (ex < 0 ? Math.PI / 3 : -Math.PI / 3);
        head.add(ear);
      });

      // Circlet or Crown
      const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 4, 8), this.mats.gold);
      circlet.position.set(0, 0.14, 0);
      circlet.rotation.x = Math.PI / 2;
      head.add(circlet);
    } else if (isDwarf) {
      // Braided Long Beard
      const bColorMat = (data.id.includes('lorekeeper') ? this.mats.dwarfBeardWhite : this.mats.dwarfBeardBrown);
      const beard = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.75, 0.28), bColorMat);
      beard.position.set(0, -0.38, 0.18);
      head.add(beard);

      // Horned or Studded Clan Helmet
      const helm = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.24, 0.56), this.mats.bronze);
      helm.position.set(0, 0.26, 0);
      head.add(helm);

      if (data.id.includes('commander')) {
        [-0.34, 0.34].forEach(hx => {
          const horn = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.45, 4), this.mats.gold);
          horn.position.set(hx, 0.28, 0);
          horn.rotation.z = (hx < 0 ? -0.5 : 0.5);
          head.add(horn);
        });
      }
    } else if (data.race === 'human') {
      if (data.id.includes('guard')) {
        // Guard Sallet Helmet
        const helm = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.3, 0.54), this.mats.silver);
        helm.position.set(0, 0.24, 0);
        head.add(helm);
      } else if (data.id.includes('scholar')) {
        // Scholar Hood
        const hood = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.35, 0.54), this.mats.blueNavy);
        hood.position.set(0, 0.18, -0.05);
        head.add(hood);
      }
    }

    // Legs & Boots (Pivoted at hip for natural walking limb swing)
    const legH = isDwarf ? 0.44 : 0.58;
    const legY = isDwarf ? 0.48 : 0.65;
    [-0.2, 0.2].forEach((lx, idx) => {
      const legPivot = new THREE.Group();
      legPivot.position.set(lx, legY + legH / 2, 0);

      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, legH, 0.32), pantsMat);
      leg.position.set(0, -legH / 2, 0);
      leg.castShadow = true;
      legPivot.add(leg);

      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.44), bootsMat);
      boot.position.set(0, -legH + 0.16, 0.06);
      boot.castShadow = true;
      legPivot.add(boot);

      root.add(legPivot);
      if (idx === 0) anim.legL = legPivot;
      else anim.legR = legPivot;
    });

    // Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.74, 0.22), tunicMat);
    armL.position.set(-(tW / 2 + 0.12), torsoY, 0);
    root.add(armL);
    anim.armL = armL;

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.74, 0.22), tunicMat);
    armR.position.set(tW / 2 + 0.12, torsoY, 0);
    root.add(armR);
    anim.armR = armR;

    // Items & Handheld Equipment
    const itemGroup = new THREE.Group();

    if (data.itemType === 'halberd') {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 5), this.mats.wood);
      pole.position.set(0.4, 0.4, 0.2);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.5, 0.06), this.mats.silver);
      blade.position.set(0.4, 1.6, 0.2);
      itemGroup.add(pole);
      itemGroup.add(blade);
    } else if (data.itemType === 'scroll') {
      const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6), this.mats.clothWhite);
      scroll.rotation.z = Math.PI / 2;
      scroll.position.set(0.32, 0, 0.3);
      itemGroup.add(scroll);
    } else if (data.itemType === 'tankard') {
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.45, 6), this.mats.wood);
      mug.position.set(0.35, -0.05, 0.3);
      itemGroup.add(mug);
    } else if (data.itemType === 'pouch') {
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.22), this.mats.gold);
      pouch.position.set(0.35, -0.15, 0.25);
      itemGroup.add(pouch);
    } else if (data.itemType === 'nether_staff') {
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 5), this.mats.obsidian);
      staff.position.set(0.35, 0.3, 0.2);
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), this.mats.purpleNether);
      crystal.position.set(0.35, 1.5, 0.2);
      itemGroup.add(staff);
      itemGroup.add(crystal);
    } else if (data.itemType === 'greatsword') {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.8, 0.06), this.mats.obsidian);
      blade.position.set(0.4, 0.4, 0.2);
      itemGroup.add(blade);
    } else if (data.itemType === 'whip') {
      const whip = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.04, 4, 8), this.mats.lavaGlow);
      whip.position.set(0.35, 0, 0.2);
      itemGroup.add(whip);
    } else if (data.itemType === 'daggers') {
      [-0.35, 0.35].forEach(dx => {
        const dagger = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.04), this.mats.obsidian);
        dagger.position.set(dx, -0.1, 0.25);
        dagger.rotation.x = 0.4;
        itemGroup.add(dagger);
      });
    } else if (data.itemType === 'moon_staff') {
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 5), this.mats.silver);
      staff.position.set(0.35, 0.3, 0.2);
      const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 4, 8, Math.PI * 1.5), this.mats.manaCyan);
      crescent.position.set(0.35, 1.5, 0.2);
      itemGroup.add(staff);
      itemGroup.add(crescent);
    } else if (data.itemType === 'bow') {
      const bow = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.04, 4, 8, Math.PI), this.mats.wood);
      bow.position.set(0.35, 0.2, 0.2);
      bow.rotation.y = Math.PI / 2;
      itemGroup.add(bow);
    } else if (data.itemType === 'druid_staff') {
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.2, 4), this.mats.wood);
      staff.position.set(0.35, 0.2, 0.2);
      const sprout = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), this.mats.greenJade);
      sprout.position.set(0.35, 1.3, 0.2);
      itemGroup.add(staff);
      itemGroup.add(sprout);
    } else if (data.itemType === 'shield_hammer') {
      const shield = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.15), this.mats.bronze);
      shield.position.set(-0.4, 0, 0.25);
      const hammer = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.6), this.mats.iron);
      hammer.position.set(0.4, 0.2, 0.25);
      itemGroup.add(shield);
      itemGroup.add(hammer);
    } else if (data.itemType === 'tongs') {
      const tongs = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.12), this.mats.iron);
      tongs.position.set(0.35, 0, 0.2);
      itemGroup.add(tongs);
    } else if (data.itemType === 'pickaxe') {
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.4, 4), this.mats.wood);
      handle.position.set(0.35, 0.2, 0.2);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 0.12), this.mats.iron);
      head.position.set(0.35, 0.85, 0.2);
      itemGroup.add(handle);
      itemGroup.add(head);
    } else if (data.itemType === 'chisel_scroll') {
      const chisel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), this.mats.iron);
      chisel.position.set(0.35, 0, 0.25);
      itemGroup.add(chisel);
    }

    torso.add(itemGroup);
    anim.item = itemGroup;

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

  createNPCBadge(data) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 76;
    const ctx = canvas.getContext('2d');

    // Rounded background badge pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = data.color;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(6, 6, 244, 64, 14);
    ctx.fill();
    ctx.stroke();

    // Badge Title & Name
    ctx.fillStyle = data.color;
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data.badge, 128, 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(data.name, 128, 56);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(3.2, 0.95, 1);
    return sprite;
  }

  update(delta, playerPos) {
    const time = performance.now() * 0.0025;
    if (!playerPos) return;

    let nearest = null;
    let minDist = 4.5; // Interaction trigger radius

    this.npcs.forEach(npc => {
      // Keep worldPos in sync with 3D group position
      npc.worldPos.copy(npc.group.position);
      if (npc.collider) {
        npc.collider.x = npc.group.position.x;
        npc.collider.z = npc.group.position.z;
      }

      const distToPlayer = Math.hypot(playerPos.x - npc.group.position.x, playerPos.z - npc.group.position.z);
      const isPlayerNear = distToPlayer < minDist;

      if (isPlayerNear) {
        minDist = distToPlayer;
        nearest = npc.config;
        npc.isInteracting = true;

        // Turn smoothly to face player
        const targetAngle = Math.atan2(playerPos.x - npc.group.position.x, playerPos.z - npc.group.position.z);
        let diff = targetAngle - npc.group.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        npc.group.rotation.y += diff * Math.min(1.0, delta * 8.0);

        // Attentive posture & role pose
        if (npc.animNodes.legL) npc.animNodes.legL.rotation.x = THREE.MathUtils.lerp(npc.animNodes.legL.rotation.x, 0, delta * 8.0);
        if (npc.animNodes.legR) npc.animNodes.legR.rotation.x = THREE.MathUtils.lerp(npc.animNodes.legR.rotation.x, 0, delta * 8.0);

        if (npc.role === 'salute' && npc.animNodes.armR) {
          npc.animNodes.armR.rotation.x = -0.5 + Math.sin(time * 2.0) * 0.08;
        } else if (npc.role === 'reading' && npc.animNodes.armR) {
          npc.animNodes.armR.rotation.x = -0.7;
        }

      } else {
        npc.isInteracting = false;

        // Autonomous Patrol / Stroll State Machine
        if (npc.state === 'idle') {
          npc.stateTimer -= delta;

          // Idle role gestures
          if (npc.animNodes.torso) {
            const isDwarf = (npc.config.race === 'dwarf');
            if (npc.role === 'chanting') {
              npc.animNodes.torso.position.y = (isDwarf ? 1.0 : 1.3) + Math.sin(time * 2.0) * 0.04;
              if (npc.animNodes.armR) npc.animNodes.armR.rotation.x = -0.8 + Math.sin(time * 2.0) * 0.3;
            } else if (npc.role === 'aiming') {
              if (npc.animNodes.armL) npc.animNodes.armL.rotation.x = -1.2;
              if (npc.animNodes.armR) npc.animNodes.armR.rotation.x = -1.1 + Math.sin(time * 1.5) * 0.1;
            } else if (npc.role === 'smithing' || npc.role === 'mining') {
              if (npc.animNodes.armR) npc.animNodes.armR.rotation.x = -0.4 + Math.sin(time * 3.8) * 0.55;
            } else if (npc.role === 'salute') {
              if (npc.animNodes.armR) npc.animNodes.armR.rotation.x = -0.3 + Math.sin(time * 1.0) * 0.08;
            } else if (npc.role === 'serving') {
              if (npc.animNodes.armR) npc.animNodes.armR.rotation.x = -0.6 + Math.sin(time * 2.0) * 0.2;
            } else {
              npc.animNodes.torso.position.y = (isDwarf ? 1.0 : 1.3) + Math.sin(time * 1.5) * 0.03;
            }
          }

          // Ease legs to rest
          if (npc.animNodes.legL) npc.animNodes.legL.rotation.x = THREE.MathUtils.lerp(npc.animNodes.legL.rotation.x, 0, delta * 6.0);
          if (npc.animNodes.legR) npc.animNodes.legR.rotation.x = THREE.MathUtils.lerp(npc.animNodes.legR.rotation.x, 0, delta * 6.0);

          if (npc.stateTimer <= 0) {
            // Determine next patrol / wander destination
            let tx, tz;
            if (npc.config.id === 'human_guard_captain') {
              // Captain Godric: Patrol back and forth along South Barbican Gate
              tx = 370 + Math.random() * 18;
              tz = -326 + (Math.random() - 0.5) * 6;
            } else if (npc.config.id === 'human_scholar') {
              // Scholar Alistair: Stroll across Citadel Courtyard
              tx = 380 + Math.random() * 14;
              tz = -368 + Math.random() * 12;
            } else if (npc.config.id === 'human_merchant') {
              // Madame Vivienne: Stroll market street stalls
              tx = 196 + Math.random() * 16;
              tz = -116 + Math.random() * 10;
            } else if (npc.config.id === 'demon_warlord') {
              // Dread Commander Vhazor: Patrol Dread Keep
              tx = -226 + Math.random() * 18;
              tz = -206 + Math.random() * 14;
            } else if (npc.config.id === 'elven_ranger') {
              // Lyra: Patrol Moon Sanctuary
              tx = -208 + Math.random() * 18;
              tz = 192 + Math.random() * 18;
            } else if (npc.config.id === 'dwarf_chieftain') {
              // Thordak: Walk around Unity Monument
              tx = 100 + Math.random() * 16;
              tz = 134 + Math.random() * 12;
            } else {
              // Generic wander around post
              const angle = Math.random() * Math.PI * 2;
              const r = 3.0 + Math.random() * (npc.wanderRadius - 3.0);
              tx = npc.spawnPos.x + Math.cos(angle) * r;
              tz = npc.spawnPos.z + Math.sin(angle) * r;
            }

            const ty = getTerrainHeight(tx, tz);
            npc.targetPos.set(tx, ty, tz);
            npc.state = 'walking';
            npc.stateTimer = 9.0;
          }

        } else if (npc.state === 'walking') {
          npc.stateTimer -= delta;

          const dx = npc.targetPos.x - npc.group.position.x;
          const dz = npc.targetPos.z - npc.group.position.z;
          const dist = Math.hypot(dx, dz);

          if (dist < 0.5 || npc.stateTimer <= 0) {
            // Reached patrol waypoint, pause to observe
            npc.state = 'idle';
            npc.stateTimer = 2.5 + Math.random() * 5.0;
          } else {
            // Turn smoothly to movement direction
            const moveAngle = Math.atan2(dx, dz);
            let diff = moveAngle - npc.group.rotation.y;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            npc.group.rotation.y += diff * Math.min(1.0, delta * 7.0);

            // Step forward
            const step = Math.min(dist, npc.walkSpeed * delta);
            npc.group.position.x += (dx / dist) * step;
            npc.group.position.z += (dz / dist) * step;

            // Resolve collision with world geometry
            if (this.worldColliders && this.worldColliders.length > 0) {
              resolveCircleCollision(npc.group.position, 0.5, this.worldColliders, 2);
            }

            // Ground cleanly on terrain
            npc.group.position.y = getTerrainHeight(npc.group.position.x, npc.group.position.z);

            // Natural limb swinging cadence
            npc.walkCycle += delta * (npc.walkSpeed * 2.8);
            const swing = Math.sin(npc.walkCycle) * 0.42;

            if (npc.animNodes.legL) npc.animNodes.legL.rotation.x = -swing;
            if (npc.animNodes.legR) npc.animNodes.legR.rotation.x = swing;
            if (npc.animNodes.armL) npc.animNodes.armL.rotation.x = swing;
            if (npc.animNodes.armR && npc.role !== 'aiming' && npc.role !== 'chanting') {
              npc.animNodes.armR.rotation.x = -swing;
            }

            const isDwarf = (npc.config.race === 'dwarf');
            if (npc.animNodes.torso) {
              npc.animNodes.torso.position.y = (isDwarf ? 1.0 : 1.3) + Math.abs(Math.sin(npc.walkCycle)) * 0.05;
            }
          }
        }
      }
    });

    this.currentNearbyNPC = nearest;
  }

  getNearbyNPC() {
    return this.currentNearbyNPC;
  }
}

