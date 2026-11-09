# 🤖 Agent Guide & Development Manual

Welcome to **Agent66: Low-Poly Medieval Kingdom Open World RPG**!
This document is designed for AI coding agents (Antigravity, Claude Code, Cursor, Windsurf, Copilot, Codex) and human developers switching workspaces, editors, or accounts. It explains the project architecture, inviolable rules, active state, and prioritized roadmap of what needs to be done next.

---

## ⚡ Quick Start & Commands

- **Environment**: Node.js (>= 18), npm
- **Install dependencies**: `npm install`
- **Run dev server**: `npm run dev -- --host` (runs by default at `http://localhost:5173/`)
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

---

## 🏰 Invariants & Design Principles (Never Violate These)

1. **Strictly Old-Era Medieval Fantasy & 4 Grand Territories**:
   - **The 4 Territories**:
     1. **Human Kingdom of Valoria (North-East)**: Royal Citadel, Throne Room, Town Market Bazaar, Windmill, Cobblestone Avenues, Knight Patrols.
     2. **Dark Territory of the Demons (North-West)**: Obsidian Dread Fortress, Molten Lava Pools, Basalt Spires, Bone Gate, Void Altar.
     3. **Enchanted Forest of the Elves (South-West)**: Moon Spire Sanctuary, Sacred Elder Trees, Canopy Suspension Bridges, Fairy Rings.
     4. **Industrial City of the Dwarves (South-East)**: Mountain Bastion, Great Blast Furnaces, Rotating Giant Cog Gears, Minecart Rail Tracks.
     5. **Central Crossroads Sanctuary (Center)**: Ancient stone bridge across the Great River connecting all 4 realms.
   - **NO modern elements**: No skyscrapers, asphalt roads, crosswalks, traffic lights, cars, or modern electronics.
   - Vehicles are **horses / royal warhorse steeds**, and traffic consists of **armored patrol knights** and **wooden ox/cart wagons**.

2. **Airtight Sub-Stepped Collision (Zero Clipping / Tunneling)**:
   - All buildings, walls, towers, fences, and props must register bounding boxes (`{ type: 'box', minX, maxX, minZ, maxZ }`) or cylinders (`{ type: 'cylinder', x, z, radius }`) in their respective biome's `this.colliders` array.
   - Movement depenetration uses continuous circle-AABB and cylinder relaxation in `src/utils/collision.js` with $\le 10\text{ cm}$ sub-stepping per micro-step.
   - Never remove or bypass this collision pipeline when adding new entities, mounts, or structures.

3. **6 Main Characters are Central to the Realm**:
   - The 6 characters (1. Hero Aiden, 2. Princess Aurelia, 3. Demon King Malakor, 4. OP Side Character Kage, 5. King Reginald, 6. Retired Hero Master Vance) must remain both **playable** (via top roster bar or dialogue) and **world NPCs** (when not currently possessed).
   - Character visual models are generated procedurally with Three.js in `src/entities/CharacterFactory.js`.

4. **Open Houses with Cutaway Roofs**:
   - Enterable structures must have open doorways and interior furnishings.
   - Roofs must smoothly lift and fade to opacity 0 on entry (`ROOF_MODES.AUTO` or `CUTAWAY`) and return on exit, handled by `src/world/OpenHouses.js`.

5. **Canonical Race Lifespans, Anthropology & Inter-Racial Animosity**:
   - The 4 races follow canonical lifespans and distinct cultural frictions:
     - **Demons**: `Ageless / Eternal (10,000+ Years)` (`0.00x` void cycle rebirth) — **Universal Hatred**; despise all other races, view mortals as kindling, and reject diplomacy.
     - **Elves**: `1,500 – 3,000+ Years` (`0.03x` celestial starlight preservation) — **Proud Celestial Nobility**; love high aristocracy and look down on humans as brief upstarts and dwarves as soot-covered troglodytes.
     - **Dwarves**: `350 – 500 Years` (`0.2x` stone-forged longevity) — **Mechanical Technology Masters**; master rotating cog gears, blast furnaces, and steam hydraulics while ridiculing elven vanity and human flimsy woodwork.
     - **Humans**: `75 – 100 Years` (`1.0x` mortal baseline) — **Resourceful Versatility**; good with their stuff (farming, commerce, stone castles, and adaptable grit) while navigating the animosity of the other three.
   - Lifespan & disposition pills are rendered in the RPG dialogue modal (`DialogueBox.js`), voice lines in `src/entities/RealmNPCs.js`, and the interactive Races Codex (`HUD.js`) accessible via `[L]` or the top-bar `⏳` button.

6. **Performance & Pure ES Modules**:
   - Pure Three.js + vanilla JavaScript (ES modules) + CSS3.
   - Keep draw calls reasonable: reuse materials (`MeshLambertMaterial`, `flatShading: true`), use instancing/grouping where appropriate, and keep polygon counts stylized low-poly.

7. **Monster Taming & Strict Single-Pet Invariant**:
   - The world features **82+ diverse monsters** across all 4 realms (Goblins, Wolves, Treants, Imps, Hellhounds, Golems, Boars, Automatons, Bears, Drakes, Spiders, Skeletons, Wyverns).
   - Players can approach wild creatures and tame them using **[G]** (or HUD button).
   - **INVIOLABLE RULE**: The player can only have **ONE** tamed monster companion at a time. Taming a new beast automatically frees the previous one.
   - Dedicated Companion Status HUD Card displays companion avatar, level, real-time HP bar, attack power, and quick "Release [U]" dismissal.
   - Tamed pets obtain cyan loyalty auras, follow the player, match gallop/walk speeds, and fight defensively against hostile threats. Release at any time with **[U]**.

8. **Settlement Sanctuaries & Wild Monster Exclusion**:
   - All populated settlements, towns, villages, markets, castles, and hamlets are registered sanctuary zones (`SANCTUARY_ZONES` in `src/config/constants.js`).
   - **INVIOLABLE RULE**: Wild and hostile monsters are strictly barred from entering settlement areas.
   - Monsters lose aggro against targets inside sanctuaries, candidate chase and wander steps into sanctuaries are blocked by boundary ward barriers (`⛔ WARD BARRIER`), wander targets never spawn inside, and continuous depenetration immediately pushes any wild beast outside the perimeter.
   - Only the player's tamed companion (`m.isTamed`) may accompany the player into settlements.

---

## 📁 Codebase Architecture & File Map

```
agent66/
├── index.html                   # Entry HTML; sets up canvas container and loads src/main.js
├── package.json                 # Vite + Three.js dependencies
├── AGENTS.md                    # This master guide for agents & developers
├── README.md                    # Public user & feature documentation
├── .cursorrules                 # Rules for Cursor AI
├── CLAUDE.md                    # Rules for Claude Code
├── docs/                        # Detailed architectural & design specs
│   ├── ARCHITECTURE.md          # Systems, math, collision, and rendering loop
│   ├── CHARACTERS.md            # Lore, visual styles, dialogues, and coordinates
│   ├── WORLD_MAP.md             # Biomes, landmarks, and spatial coordinate grid
│   └── TODO.md                  # Prioritized backlog of upcoming features
└── src/
    ├── main.js                  # Master GameApp class; initializes systems, loop & colliders
    ├── style.css                # HUD, RPG dialogue card, character roster, minimap styles
    ├── config/
    │   ├── constants.js         # World dimensions, biomes, fast travel points, camera modes
    │   └── characters.js        # Character definitions, lore, dialogue lines, spawn points
    ├── entities/
    │   ├── CharacterFactory.js  # Procedural low-poly 3D models for all 6 characters
    │   ├── Player.js            # Player controller with walking, sprint, rotation, colliders
    │   ├── Vehicle.js           # Royal Warhorse Steed (mount/dismount, gallop, physics)
    │   ├── Traffic.js           # Patrolling Knights & Wooden Ox-Carts
    │   ├── NPCManager.js        # Manages remaining 5 characters as interactive NPCs
    │   ├── MonsterManager.js    # Forest monsters & guardians leveling system
    │   └── RealmNPCs.js         # Landmark race NPCs (Humans, Demons, Elves, Dwarves)
    ├── systems/
    │   ├── CameraManager.js     # 2.5D Isometric, 2D Top-Down, 3D Follow, and Creator Free-Look flight
    │   ├── MagicSwordSystem.js  # 3-Hit Magic Sword Combos & 3D Flying Crescent Blade Waves (Air Slashes)
    │   ├── NPCTownBuilder.js    # Autonomous NPC house & settlement construction system
    │   ├── Collision.js         # Sub-stepped continuous collision & depenetration (in utils/)
    │   ├── DayNightCycle.js     # Sun/moon orbit, dynamic shadows, night lights, and fog
    │   ├── InputManager.js      # WASD/Arrows, Click-to-move, Gamepad/Touch, Action keys
    │   ├── Minimap.js           # Canvas radar + fullscreen world map with instant warp
    │   └── AudioSystem.js       # Web Audio API procedural sound synthesizer (chimes, gallop, blade)
    ├── ui/
    │   ├── HUD.js               # Top roster bar, biome tag, time display, prompts, action button
    │   └── DialogueBox.js       # Typewriter RPG dialogue modal with character portraits
    ├── utils/
    │   ├── collision.js         # Continuous circle-AABB & circle-cylinder push-out engine
    │   └── math.js              # Perlin/Simplex terrain noise, clamps, and lerp helpers
    └── world/
        ├── Terrain.js           # Low-poly faceted heightmap terrain & 4-territory vertex coloring
        ├── Water.js             # Animated vertex wave water plane for Great River
        ├── KingdomBiome.js      # Human Kingdom: Royal Castle Citadel, Bazaar, Windmill, Cobblestone
        ├── DemonBiome.js        # Demon Territory: Obsidian Dread Keep, Lava pools, Basalt spires, Bone Gate
        ├── ElvenBiome.js        # Elven Forest: Moon Spire Sanctuary, Sacred Elder Trees, Canopy Bridges
        ├── DwarfBiome.js        # Dwarven Industry City: Mountain Bastion, Blast Furnaces, Rotating Gears
        ├── JungleBiome.js       # Connecting wilderness, flora, and suspension bridge
        ├── OpenHouses.js        # Enterable structures with real-time cutaway roofs
        └── VillageSettlement.js # Agricultural settlements, crop fields, communal life & farmers
```

---

## 🗺️ Coordinate System & Landmarks

World size is **1600m × 1600m** (`-800` to `+800` on X and Z axes). Center is `(0, 0)`.

| Location | Territory | Coordinates $(X, Z)$ | Key Description |
| :--- | :--- | :--- | :--- |
| **Central Crossroads Bridge & Obelisk** | Nexus Hub | `(0, 10)` | Spawn point of Hero Aiden; ancient bridge over Great River; 4-Way Faction Waypoint Obelisk at `(34, 10)`; Warhorse nearby |
| **Royal Castle Citadel** | Human Kingdom | `(380, -380)` | Authentic medieval castle with moat, arched drawbridge, barbican gatehouse, garrison armory, royal stables, King Reginald's Throne Room (Gate at `[380, -325]`) |
| **Princess Aurelia's Royal Pavilion** | Human Kingdom | `(470, -370)` | Elegant sun pavilion & manor in East Royal Gardens with marble columns & rose planters (Spawn at `[470, -365]`) |
| **Town Market Bazaar** | Human Kingdom | `(205, -110)` | Central fountain well, 4 merchant stalls, Kage's haunt |
| **The Dragon's Rest Tavern** | Human Kingdom | `(205, -85)` | Enterable tavern with ale barrels, hearth, banquet tables, bounty board |
| **Colossal Obsidian Dread Citadel** | Demon Realm | `(-220, -220)` | Gargantuan 96m×90m nether fortress with boiling magma moat, jagged basalt drawbridge, 42m demon horn bastions, bone gate & Malakor's Throne of Skulls |
| **Void Sacrificial Altar** | Demon Realm | `(-270, -250)` | Stepped volcanic dais with floating purple Nether Crystal and braziers |
| **Moon Spire Sanctuary** | Elven Forest | `(-200, 200)` | Marble colonnades, jade spires, and levitating Celestial Moon Orb |
| **Colossal Elder Trees** | Elven Forest | `(-140, 150)` | Ancient mahogany trunks with elevated canopy platforms & rope bridges |
| **Karak-Drak Bastion** | Dwarf Industry | `(200, 200)` | Heavy stone mountain bastion flanked by colossal dwarven guard statues |
| **Great Blast Furnaces** | Dwarf Industry | `(140, 240)` | Twin smelting towers, molten iron trough, rotating giant cog gears |
| **Master Vance's Lodge** | Foothills | `(130, 260)` | Retired Hero's thatched retreat with stone hearth & broadsword |
| **Oakhaven Agricultural Village** | Valoria Plains | `(105, 10)` | Communal farming hamlet with wheat fields, pumpkin patches, granary & hearth |
| **Fernbrook Woodland Hamlet** | Forest Border | `(-75, 110)` | Riverside orchard hamlet with fruit trees, herbal garden beds & skep beehives |
| **Krag’mar Demon Enclave** | Demon Realm | `(-120, -90)` | Nether outpost with bone-spire keep, horned basalt huts, boiling magma cauldron & demons |
| **Sylvaheim Elven Glade** | Elven Forest | `(-160, 90)` | Luminous woodland glade with living jade tree pavilions, starlight mana pool & elves |
| **Karak-Vorn United Clanstead** | Dwarf Industry | `(105, 140)` | Fortified mountain settlement where the dwarven clans live and work united with mead hall, forge & Unity Monument |

---

## 🛠️ How to Add or Modify Game Features

### 1. Adding a New Enterable House
1. Open `src/world/OpenHouses.js`.
2. Add your building generator method in `initHouses()`.
3. Build the floor, walls (leaving a doorway $\ge 2.5\text{m}$ wide), interior furniture, and a separate `roofMesh`.
4. Register the house object in `this.houses.push({ id, name, icon, center, bounds, roofMesh, ... })`.
5. Push solid wall colliders into `this.colliders.push({ type: 'box', minX, maxX, minZ, maxZ })`.

### 2. Adding a New Landmark or Prop in the Kingdom
1. Open `src/world/KingdomBiome.js`.
2. Add the mesh geometry to the appropriate group (or create a new group and `this.scene.add(group)`).
3. Always add collision bounds to `this.colliders.push(...)`.
4. If it has nighttime illumination (torches, lamps), register it with `this.dayNightCycle.registerNightLight(light)`.

### 3. Adding a Character Ability or State
1. Character configurations live in `src/config/characters.js`.
2. Visual 3D anatomy is constructed in `src/entities/CharacterFactory.js`.
3. Movement and animations are processed in `src/entities/Player.js` (update method).
4. Dialogue interactions and quotes are configured in `src/config/characters.js`.

---

## 📋 What Needs to Be Done (Priority Roadmap)

When picking up development in any code editor or account, refer to the master backlog in [`docs/TODO.md`](file:///d:/projects/agent66/docs/TODO.md) and these prioritized milestones:

### 👑 The Creator's Realm & Autonomous LLM Minds Architecture
The user acts as **The Creator of the World** (Divine Overseer), while the 6 main characters and realm NPCs possess their own **individual AI Minds (LLM Cognitive Agents)** with perception, memories, goals, and autonomous actions.

- **Phase 1: Environment & Sensory/Actuator Infrastructure**
  - [ ] **World Perception Engine**: Spatial coordinates, biome awareness, entity proximity cone (monsters, NPCs, Creator), temporal day/night snapshot.
  - [ ] **World Action Execution Engine**: Navigation along Imperial Roads, speech bubbles with blips, emotes/gestures, campfire/tavern interaction, and building hooks via `NPCTownBuilder.js`.
  - [ ] **The Creator's Eye (Mind Inspector & Divine Decrees)**: Modal to inspect any character's inner monologue, goal, emotional vitals, and memory stream, with an interface to whisper divine thoughts directly into their consciousness.
- **Phase 2: Individual AI Mind Architecture (Cognitive Agent Framework)**
  - [ ] **Agent Persona & Lifespan Schemas**: Deep system prompts for Aiden, Aurelia, Malakor, Kage, Reginald, Vance grounded in canonical race lifespans and prejudices.
  - [ ] **Memory Stream & Reflection**: Short-term working buffer + episodic memory log with importance scoring.
  - [ ] **Multi-Backend Brain Adapter**: In-browser WebLLM/Transformers.js (free & private) + Cloud LLM (Gemini/Ollama) + Zero-latency heuristic fallback.
- **Phase 3: The 6 Main Characters' Autonomous Wills**
  - [ ] Bring Aiden, Aurelia, Malakor, Kage, Reginald, and Vance to life as self-directed agents with their own daily motivations.
- **Phase 4: Living Community Social Dynamics**
  - [ ] Autonomous dialogue when NPCs cross paths; goal-driven work/tavern/sleep cycles; settlement construction requests.
- **Phase 5: The Creator's Sandbox**
  - [ ] Realm-wide Divine Decrees (Blood Moon, Solar Blessing, Tournament) and spirit free-cam.

---

---

## 🔍 Verification Checklist for Code Changes
Before concluding any task or switching branches:
1. Run `npm run build` to ensure 0 build or module resolution errors.
2. Confirm no collision leaks: Sprint and ride the warhorse directly into castle walls and houses to ensure no tunneling.
3. Confirm camera modes: Press `1` (Isometric), `2` (Top-down 2D), `3` (3D follow), and `4` / `🎥 Free Look` (Creator Spirit Cam flight across entire 1600m continent with WASD, Q/E altitude, Shift turbo, Mouse aim).
4. Verify character roster: Click all 6 character icons on the top bar and ensure player model and stats switch seamlessly, each equipping their own signature 3D low-poly Magic Sword (Aiden's Dawnblade, Aurelia's Starlight Rapier, Malakor's Nether Cleaver, Kage's Muramasa Katana, Reginald's Sovereign Claymore, Vance's Vanguard Broadsword).
5. Verify magic sword skills: Press `F` to attack; verify 3-hit combo sequence (Combo 1: Crescent Wave, Combo 2: Cross Nether Cleave, Combo 3: 360° Whirlwind Tempest Nova) cleaves monsters with pierce, damage text, and sparks.
6. Verify race lifespans: Press `L` or click `⏳` on the HUD to verify the Races & Lifespans Codex modal opens with all 4 race cards and the comparison scale, and talk to any NPC (`E`) to confirm the race/age/lifespan pill in the dialogue box.
7. Verify monster taming: Approach any monster, press `G` (or click `🐾 Tame Monster`) to tame; verify cyan loyalty aura appears, pet follows and only ONE tamed pet can exist; press `U` to release.
