# 📋 Master Development Backlog & Architectural Roadmap: The Creator's Realm & Autonomous LLM Minds

> **World Vision**:
> The User acts as **The Creator of the World** (God / Divine Overseer).
> The 6 Main Characters and Realm NPCs possess **their own individual AI Minds (LLM Cognitive Agents)** capable of autonomous perception, inner monologue, memory formation, goal planning, and real-time world actions based on their unique personas, canonical race lifespans, and ideological dispositions.

---

## 🟢 Completed Milestones (Production Baseline)

- [x] **1600m × 1600m Low-Poly Fantasy Continent**:
  - Continuous 180×180 facet-shaded heightmap, animated vertex wave water plane (2000m × 2000m), and natural island coastline dropping into open ocean ($r > 620\text{m}$).
  - 3 Camera Perspectives: 2.5D Isometric Diorama, 2D Top-Down Atlas, and 3D Ground Chase.
- [x] **Airtight Sub-Stepped Collision Engine**:
  - Sub-stepped circle-AABB and circle-cylinder relaxation ($\le 10\text{ cm}$ per micro-step) eliminating tunneling for sprinting and horse riding.
- [x] **The 4 Grand Faction Territories & Crossroads Nexus**:
  - ⚔️ Human Kingdom of Valoria, 🔥 Obsidian Wastes of the Demons, 🌿 Whispering Canopy of the Elves, ⚒️ Karak-Drak Stronghold of the Dwarves.
  - Central Crossroads Sanctuary Bridge with 9m 4-Way Faction Waypoint Obelisk, heraldic crest banners, and guardian archway.
- [x] **Grand Imperial Road Network**:
  - Paved causeways connecting the Crossroads to all major citadels, farmlands, and mountain passes.
- [x] **6 Main Characters System**:
  - 1. Aiden, 2. Princess Aurelia, 3. Demon King Malakor, 4. Kage, 5. King Reginald, 6. Master Vance.
  - Full procedural low-poly 3D models in `CharacterFactory.js`, playable possession, and world NPC rendering.
- [x] **Enterable Old-Era Houses with Real-Time Cutaway Roofs**:
  - The Dragon's Rest Tavern, Blacksmith's Forge, Princess Aurelia's Sun Pavilion, Master Vance's Lodge, Jungle Outpost, Beach Haven, and Village Cottages.
- [x] **5 Autonomous Settlement Communities (`VillageSettlement.js`)**:
  - Oakhaven (Human Farmlands), Fernbrook (Elven Orchard), Krag'mar (Demon Enclave), Sylvaheim (Elven Glade), Karak-Vorn (Dwarven United Clanstead).
- [x] **NPC Town Builder (`NPCTownBuilder.js`)**:
  - Autonomous settlement expansion system with staged 4-tier construction animations (foundation, scaffolding, walls, roof).
- [x] **Monster Bestiary & Strict Single-Pet Taming**:
  - 82+ monsters across 13 species (Goblin, Wolf, Treant, Imp, Hellhound, Golem, Boar, Automaton, Bear, Drake, Spider, Skeleton, Wyvern).
  - Approach taming `[G]`, strict 1-companion rule, cyan loyalty aura, speed matching, defense AI, and Companion Status HUD card.
- [x] **Grand Authentic Castle Overhauls**:
  - Human Kingdom Royal Castle Citadel: 140m × 12m defensive moat, arched drawbridge, twin 28m barbican gate towers, 4 corner bastions (34m), outer bailey garrison armory, sparring racks, warhorse stables, 4 king statues, and the Great Royal Donjon with open enterable Grand Throne Hall, velvet red carpet, banquet feast tables, and King Reginald's Sovereign Throne Dais (`[380, -375]`).
  - Demon Realm Obsidian Dread Citadel: expanded 96m × 90m volcanic stronghold with boiling magma moat, volcanic drawbridge, twin 32m demon skull barbican gatehouses, 38m corner bastions with 14m demon horns, outer bailey sulfur cauldrons, 54m Abyssal Keep with rotating Nether Blood Eye, and Demon King Malakor's Throne of Skulls (`[-220, -220]`).
- [x] **High Valoria Castle Town (`CastleTown.js` at `[370, -250]`)**:
  - Magnificent capital high town situated directly outside the Royal Castle drawbridge:
  - 3-tier Marble Lion Fountain with cascading water spray and radial mosaic plaza.
  - 28m Grand Clocktower with rotating clock hands, open belfry, and swinging bronze bell.
  - Civic & guild buildings: Royal Bank & Vault, High Alchemist's Spire & Conservatory with pulsing mana orbs, Silver Stag Coaching Inn & Winery with dining patio, Master Armourer & Royal Smithy with blazing forge, Court Library & Cartography House with celestial sphere balcony, Royal Patisserie & Bakery.
  - 4 luxury patrician merchant villas with flowerboxes, dormers, and stone chimneys.
  - 4 boutique artisan kiosks (Royal Florist, Silks & Tapestries, Goldsmith & Jewelers, Rare Spices).
  - Sunken Rose Garden botanical sanctuary with marble balustrades, white gazebo, sundial, and 4 blossoming cherry trees.
  - South Gatehouse fortifications with twin watchtowers and golden lion banner.
  - 6 new living high-society citizens: Lord Brandon, Lady Genevieve, Master Corvus, Alchemist Zephyr, Helena the Florist, Town Crier Silas.
- [x] **13 Inhabited Settlement Sanctuaries & Wild Monster Exclusion (`SANCTUARY_ZONES`)**:
  - All 13 populated settlements, towns, villages, markets, castles, foundries, and hamlets are registered sanctuary zones.
  - Wild monsters physically barred from entering populated areas via ward boundary barriers (`⛔ WARD BARRIER`), loss of aggro against targets inside sanctuaries, sanctuary-free wander paths, and continuous depenetration safeguards.
- [x] **Dynamic Weather & Atmospheric Precipitation (`WeatherSystem.js`)**:
  - 4 dynamic weather atmospheres (`CLEAR`, `RAIN`, `SNOW`, `ASH`) with GPU particle precipitation, procedural Web Audio thunder, and territory auto-switching.
- [x] **Skyrim-Style RPG Dynamic Cardinal Compass (`RPGCompass.js`)**:
  - 360° rotating azimuth tape tracking camera yaw with cardinal headings (N, NE, E, SE, S, SW, W, NW), landmark icons, and real-time distance pills.
- [x] **UI Visual Overhaul & Dropdown Time/Atmosphere Architecture**:
  - Replaced cluttered inline 8-button emoji strips with a sleek, glassmorphic dropdown pill (`🕒 11:30 AM • ☀️ Clear ▾`) opening an elegant popover palette for time presets (Dawn, Noon, Dusk, Midnight) and atmospheric precipitation (Clear Sky, Tempest Rain, Snow Flurry, Nether Ash).
  - Cleaned up top-right toolbar: removed awkward two-line text wrapping, added uniform glassmorphic pill buttons with glowing status dots (`🤖 Auto: ON [P]`, `🧠 Mind [K]`), circular icons (`⏳`, `🔊`, `❓`), and the celestial `👁️ God's Roam` button.
  - Overhauled Playable Character Roster: replaced wide horizontal text buttons with royal heraldic crest medallions with character badges, colored faction rings, breathing active pulse, and detailed hover tooltips.
- [x] **God's Roam Mode (Divine Spectator Focus)**:
  - Implemented Divine Spectator Focus mode across `CameraManager.js`, `HUD.js`, and `main.js`.
  - As Creator of the World, the user can smoothly spectate and follow any individual character (the 6 main heroes or realm citizens like Young Pip, Alchemist Lunara, Engineer Brandon, Captain Donald) from above in real-time as they live autonomously.
  - Floating celestial glass banner at top center displays citizen avatar, royal title, homeland, and live action stream.
  - Smooth keyboard navigation: `[` (Prev Citizen), `]` (Next Citizen), `Enter` (Possess Body), `K` (Inspect Mind), `Esc` (Return to Hero).
  - Clicking any hero medallion while in God's Roam instantly glides the divine eye to them!
- [x] **Mythical World Boss Dragons & Village/Crossroads Raids (`MythicalDragonSystem.js`)**:
  - Implemented 3 Apex Mythical Boss Beasts with custom procedural 3D models:
    1. **🐲 Ignis the Ancient Fire Dragon** (Lv. 8 Boss, 1200 HP): Colossal quadrupedal red dragon with molten dorsal plates, horned crest, and conical fire breath. Raids Central Crossroads Bridge & Oakhaven Village!
    2. **❄️ Glacius the Frost Wyrm** (Lv. 7 Boss, 950 HP): Crystalline ice wyrm with diamond scales, translucent frost horns, and freezing ice breath. Raids High Valoria Gates & Fernbrook Hamlet!
    3. **🦁 Chimera the Abyssal Manticore** (Lv. 7 Boss, 880 HP): Three-headed mythical beast with golden lion body, ram horns, dragon bat wings, and venomous scorpion stinger tail. Raids Town Market Bazaar & Crossroads!
  - **Dynamic Aerial Raid AI**: Soars high in the sky ($Y = 24 - 34\text{m}$) flapping articulated wings, lets out a synthesized draconic roar, swoops down across the 1600m continent, and assaults villages / main crossroads area with fire, frost, and venom particles!
  - **Sanctuary Raid Exemption**: Unlike standard forest beasts, Mythical Boss Dragons bypass ordinary ground ward barriers to directly assault settlements.
  - **Interactive Summon & Controls**: Trigger raids at will using the **`[B]`** key, clicking the **`🐉 Summon Mythical Dragon Raid!`** button inside the top time/atmosphere popover, or via natural periodic world calamities.
  - **Boss HUD Bar & Alerts**: Real-time Boss health bar with active raid status, screen-flash raid alert banner, knight retaliation, and single-pet taming (`[G]`) when wounded!
- [x] **Surface-Adaptive Audio & Hoofbeats**:
  - Procedural Web Audio footstep detection (wooden planks, stone cobblestones, pasture grass) and dual-strike horse hoof clatter.

---

## 🧭 PHASE 1: Environment & Sensory/Actuator Infrastructure (World Readiness for AI Agents)
*Goal: Build the digital nervous system and action APIs that allow an AI Mind to perceive and manipulate the Three.js world.*

### 1.1 World Perception Engine (`src/ai/WorldPerceptionEngine.js`) - ✅ COMPLETED
- [x] **Spatial & Biome Awareness**:
  - `getSensorySnapshot(npc)` returning:
    - Current $(X, Y, Z)$ coordinates, nearest landmark, current territory/biome, sanctuary ward zone status (`SANCTUARY_ZONES`).
- [x] **Sensory Radar (Vision & Proximity Cone)**:
  - Queries all entities within $32\text{m}$ perception cone:
    - Nearby characters/NPCs (name, race, distance, faction).
    - Nearby monsters/threats (species, level, distance).
    - Player/Creator presence and proximity (`isCreatorNearby`).
- [x] **Temporal & Atmospheric Context**:
  - Day/Night state (Time formatted e.g., "11:30 AM", solar phase: sunrise, noon, sunset, midnight).
- [x] **Canonical Race & Anthropology Context**:
  - Automatically binds race lifespan (Demons 10,000+ yrs, Elves 3,000 yrs, Dwarves 500 yrs, Humans 80 yrs), aging speed, and cultural animosity/disposition into sensory snapshot.

### 1.2 Multi-Backend Brain Adapter (`src/ai/GroqBrainAdapter.js`) - ✅ COMPLETED
- [x] **Groq Cloud LLM Integration**:
  - OpenAI-compatible endpoint `https://api.groq.com/openai/v1/chat/completions` with JSON schema output (`response_format: { type: "json_object" }`).
  - Model options: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`.
  - Built-in latency ping and speed test reporting tokens/sec.
- [x] **Zero-Latency Heuristic Fallback**:
  - Rich procedural thought generator immediately active when offline or without API key, generating contextual observation, inner monologue, mood, and intentions.

### 1.3 The Creator's Interface: Mind Inspector & Divine Decree (`src/ui/CreatorDashboard.js`) - ✅ COMPLETED
- [x] **"The Creator's Eye" Inspection Modal (`[K]` or HUD Button)**:
  - **Direct 3D Click-to-Inspect**: Left-clicking any character/NPC directly in the 3D scene opens their mind in the dashboard.
  - **Citizen Directory**: Realm directory with faction tabs (`All`, `⭐ Main 6`, `👑 Valoria`, `🌿 Elves`, `⚒️ Dwarves`, `🔥 Demons`), distance to player, and search.
  - **Live 3D Telemetry Matrix**: Coordinates, landmark, sanctuary status, time, creator distance, nearby entities.
  - **Active Consciousness Stream**: Formatted inner thought bubble, observation, mood/feeling, intention, and spoken words.
  - **⚡ Think Now Action**: Immediate cognitive generation on demand.
  - **🎥 View in World**: Focuses Free Look camera directly onto character.
- [x] **Divine Decree / Whispering Console**:
  - The Creator types divine thoughts directly into any character's mind with quick decree chips.
  - Characters process the decree in their next thought stream, accompanied by a glowing 3D billboard over their head in the world.

---

## 🧠 PHASE 2: Individual AI Mind Architecture (Cognitive Agent Framework) - ✅ COMPLETED
*Goal: Create the cognitive framework that powers each character's autonomous reasoning, memory, and personality.*

### 2.1 Reusable Cognitive Framework (`src/ai/NPCBrain.js`) - ✅ COMPLETED
- [x] **Canonical Race & Lifespan Grounding**:
  - Grounding in canonical lifespans and racial anthropology:
    - **Demons**: Ageless/Eternal ($10,000+$ years), universal contempt for mortal kindling, relentless void will.
    - **Elves**: $1,500 - 3,000+$ years, haughty celestial nobility, disdain for crude human haste and dwarven soot.
    - **Dwarves**: $350 - 500$ years, stone-forged brotherhood, pragmatic machine technology, pride in gears and ore.
    - **Humans**: $75 - 100$ years, mortal baseline, resourcefulness, adaptable ambition, urgency.
- [x] **Episodic Memory Stream (`recordMemory`)**:
  - Bounded working memory log preserving highest importance memories ($1 - 10$):
    - Divine decrees from the Creator (Importance: 10).
    - Near-death or monster sightings (Importance: 8).
    - Settlement construction and trades (Importance: 7–8).
    - Ambient daily occurrences and observations (Importance: 3–5).
  - Formats summary for LLM prompt context so NPCs remember past events and decrees.
- [x] **Cognitive Level of Detail (LOD) & Population Scaling**:
  - **Tier 1 (Ambient Utility Routine)**: Zero LLM cost, runs at 60 FPS for hundreds of ordinary villagers/guards.
  - **Tier 2 (Important Agents / Main 6)**: Event-driven periodic reflections and high-level goal evaluations.
  - **Tier 3 (In-Focus Live Consciousness)**: Real-time LLM reasoning when inspected by Creator or engaged in dialogue.
- [x] **Game Action Actuator (`dispatchAction`)**:
  - Translates high-level LLM intentions into engine actuators:
    - `WALK_TO`: resolves destination coordinates via landmarks/sanctuaries, paths along roads, resolves collisions.
    - `WORK_AT`: paths to workplace (forge, farm, stall, throne) and plays work animation.
    - `TALK_TO`: turns towards target, plays conversational gesture, spawns 3D speech bubble.
    - `BUILD`: triggers settlement expansion in `NPCTownBuilder`!
    - `FIGHT`: faces monster threats and adopts combat ready stance.
    - `REST_AT`: paths to tavern or lodge.
    - `TRADE_WITH`: approaches merchant stall and plays commerce gesture.

### 2.2 Dual-Backend Cognitive Brain Adapter (`src/ai/GroqBrainAdapter.js`) - ✅ COMPLETED
- [x] **Groq Cloud LLM Integration**:
  - Ultra-fast cloud completions (~500+ tok/s) with `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`.
- [x] **Local Ollama Integration (Zero-CORS via Vite Proxy)**:
  - Private & offline local LLM execution supporting `qwen2.5:7b-instruct`, `qwen2.5-coder:7b`, `llama3.1:8b`.
  - Vite dev server proxy `/ollama` forwarding to `http://localhost:11434` to eliminate browser CORS blocks.
  - Automatic model auto-detection via `/api/tags` and latency ping test.
- [x] **High-Fidelity Procedural Heuristic Fallback**:
  - Instant zero-latency cognitive generation when offline or unconfigured.

### 2.3 The Creator's Eye & Mind Inspector (`src/ui/CreatorDashboard.js`) - ✅ COMPLETED
- [x] **Dual-Backend Control Strip**:
  - Tab switcher: `⚡ Groq Cloud` vs `🦙 Local Ollama`.
  - Auto-detect local models button and latency benchmark.
- [x] **Comprehensive Mind Inspector**:
  - Active consciousness stream (mood, inner monologue, observation, planned action, intention, spoken dialogue).
  - Episodic Memory Stream visual log with importance score stars.
  - Real-Time Sensory Perception Matrix (location, landmark, sanctuary status, creator proximity, nearby entities).
  - Skills & Aptitudes meter (Combat, Crafting, Diplomacy, Building).
  - Direct Action Orders (`🚶 Crossroads`, `🏰 High Valoria`, `🔨 Build House`, `🍺 Tavern Rest`, `⚔️ Battle Stance`).
- [x] **Dialogue Box Mind Shortcut**:
  - "Inspect Mind 🧠" button inside RPG dialogue modal directly opens the selected NPC's consciousness.

---

## 👑 PHASE 3: The 6 Main Characters' Autonomous Minds & Self-Movement - ✅ COMPLETED
*Goal: Bring the 6 core legends of the realm to life with independent wills and hands-off autonomous self-movement.*

- [x] **Autonomous AI Mind Mode (`[P]` or Top Bar Button)**:
  - Toggle hands-off autonomous self-movement: the user does not need to touch any keys.
  - **Sensory Perception**: Continuously feeds real-time 3D telemetry (location, landmarks, monsters, daytime, creator presence) through `WorldPerceptionEngine`.
  - **Decision Engine**: `NPCBrain` (Groq LLM, Ollama, or Heuristic) plans high-level goals and intentions (`WALK_TO`, `FIGHT`, `WORK_AT`, `REST_AT`, `TRADE_WITH`, `BUILD`).
  - **Engine Actuation**: Autonomous steering loop paths towards destinations, turns smoothly, resolves collisions, and executes 3-hit Magic Sword combos when monsters approach.
  - **Live Consciousness Broadcast**: Floating 3D monologue text above the hero's head and HUD thought toasts (`🧠 AUTO MIND: <Character>`: `"<thought>"`).
- [x] **Non-Player Main Heroes Autonomous Navigation (`NPCManager.js`)**:
  - Distance-aware travel timers (`stateTimer = (dist / speed) + 8.0`) allow Aiden, Aurelia, Malakor, Kage, Reginald, and Vance to walk naturally across biomes and landmarks without getting tethered to their spawn or snapping.
- [x] **Smooth Patrol Reversal in `Traffic.js`**:
  - Replaced instantaneous boundary teleportation with continuous patrol direction reversal for guards and ox-carts.

---

## 🏘️ PHASE 4: Autonomous Realm NPCs & Living Social Dynamics
*Goal: Populate the 4 realms with living communities that interact, debate, trade, and build together.*

- [x] **Young Pip's Questline: "Path to Knighthood" (`src/systems/PipTaskSystem.js`)**:
  - 4 progressive medieval RPG quests given by Young Pip in Oakhaven Farmlands (`x: 88, z: 32`):
    1. *The Giant Pumpkin Harvest*: Gather 3 heavy Golden Harvest Pumpkins in the east furrow (+60 XP).
    2. *The Secret Wooden Sword*: Retrieve Pip's hidden wooden sword from the riverside scarecrow (+100 XP).
    3. *Scouting the Crossroads Bridge*: Travel to the Central Crossroads Sanctuary Obelisk to verify realm banners (+150 XP).
    4. *Slay the Boundary Prowler*: Slay 1 wild forest monster outside the Oakhaven ward to secure the valley (+250 XP).
  - 3D rotating quest markers above Pip's head (`❗` available, `❓` ready to claim, `⭐` completed).
  - 3D interactive quest props in the world (glowing pumpkins with halos, embedded wooden broadsword with light beam).
  - Real-time RPG Quest Tracker card on HUD + Quest interaction prompt `[E]`.
  - Tied directly into Pip's `NPCBrain` episodic memory stream and cognitive reflections.
  - Wooden sword equipped to Pip's 3D model upon questline completion!

- [x] **Alchemist Lunara's Questline: "Starlight Trials of Sylvaheim" (`src/systems/ElvenTaskSystem.js`)**:
  - 4 progressive celestial quests given by Alchemist Lunara in Sylvaheim Elven Glade (`x: -160, z: 98`):
    1. *The Luminous Starlight Lotuses*: Gather 3 radiant floating Starlight Lotuses from the sacred mana pool (+100 XP).
    2. *Communing with the Elder Trees*: Ascend the canopy suspension bridge to attune the Ancient Jade Font (+160 XP).
    3. *Pilgrimage to the Moon Spire*: Stand beneath the levitating Celestial Moon Orb at the Moon Spire Sanctuary (+220 XP).
    4. *Slay the Nether Blight Beast*: Purge corrupted shadow beasts lurking along the forest border (+350 XP).
  - 3D rotating quest marker above Lunara's head (`❗` / `💬` / `❓` / `⭐`).
  - Interactive 3D floating Starlight Lotuses with bobbing animation, point lights, and water ripple rings.
  - Ancient Jade Font prop with floating glowing moonstone crystal.
  - DialogueBox integration ("🌿 Lunara's Starlight Trials" action button) and HUD Quest Tracker card synchronization.

- [x] **Autonomous Inter-NPC Conversations (`src/ai/SocialEncounterEngine.js`)**:
  - Implemented architecture inspired by Stanford Generative Agents & AI Town (`a16z-infra/ai-town`).
  - When two characters meet at the Crossroads, market well, tavern, or on the road, they face each other, pause movement, exchange voiced 3D speech bubbles, and record shared episodic memories into their `NPCBrain` memory streams with importance scoring.
- [x] **Physics-Based Game AI Locomotion (`src/ai/YukaLocomotionEngine.js`)**:
  - Powered by `yuka` (`Mugen87/yuka`). Smooth physics steering, deceleration ramps, continuous heading, and mutual separation behavior preventing clumping and teleportation.
- [ ] **Goal-Driven Daily Schedules**:
  - Morning work $\to$ Afternoon trade/patrol $\to$ Evening tavern gatherings $\to$ Nighttime slumber inside Open Houses.
- [ ] **Autonomous Expansion Triggers**:
  - When clan resources or population increase, NPCs autonomously select a building site and trigger `NPCTownBuilder`.

---

## ⚡ PHASE 5: The Creator's Sandbox & God-Mode Mechanics
*Goal: Empower the user with divine powers to test, guide, and reshape the living world.*

- [ ] **Divine Decrees & Global Events Console (`[~]`)**:
  - Issue realm-wide events:
    - *Divine Blood Moon*: Spawns aggressive monster hordes; tests characters' defensive coordination.
    - *Solar Harvest Blessing*: Accelerates crop growth in Oakhaven and inspires joyous celebrations.
    - *Royal Tournament Decree*: Prompts the 6 heroes to gather at the Citadel Courtyard for friendly combat.
- [ ] **Creator Free-Camera / Spirit Avatar Mode**:
  - Fly seamlessly across the 1600m world as an invisible spirit or radiant orb of light.
- [ ] **Mind Log Export & Save State**:
  - Save/load the evolving memories and relationships of all characters to `localStorage`.
