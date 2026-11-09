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
- [x] **13 Inhabited Settlement Sanctuaries & Wild Monster Exclusion (`SANCTUARY_ZONES`)**:
  - All 13 populated settlements, towns, villages, markets, castles, foundries, and hamlets are registered sanctuary zones.
  - Wild monsters physically barred from entering populated areas via ward boundary barriers (`⛔ WARD BARRIER`), loss of aggro against targets inside sanctuaries, sanctuary-free wander paths, and continuous depenetration safeguards.
- [x] **Surface-Adaptive Audio & Hoofbeats**:
  - Procedural Web Audio footstep detection (wooden planks, stone cobblestones, pasture grass) and dual-strike horse hoof clatter.

---

## 🧭 PHASE 1: Environment & Sensory/Actuator Infrastructure (World Readiness for AI Agents)
*Goal: Build the digital nervous system and action APIs that allow an AI Mind to perceive and manipulate the Three.js world.*

### 1.1 World Perception Engine (`src/ai/WorldPerceptionEngine.js`)
- [ ] **Spatial & Biome Awareness**:
  - Function `getAgentSensorySnapshot(agentId)` returning:
    - Current $(X, Y, Z)$ coordinates, nearest landmark, current territory/biome, distance to nearest Imperial Road.
    - Indoors vs. outdoors status (identifies which Open House the agent is inside).
- [ ] **Sensory Radar (Vision & Proximity)**:
  - Query all entities within $25\text{m}$ sensory cone:
    - Nearby characters/NPCs (name, race, distance, current state).
    - Nearby monsters/threats (species, level, aggression).
    - Nearby interactables (market stalls, taverns, campfires, crops, doors).
    - Player/Creator presence and proximity.
- [ ] **Temporal & Atmospheric Context**:
  - Day/Night state (Time formatted e.g., "02:30 PM", solar phase: sunrise, noon, sunset, midnight).
  - Ambient illumination level and weather/fog density.
- [ ] **Social Snapshot**:
  - Active conversation status, recent utterances in the immediate vicinity, and active faction tensions.

### 1.2 World Action Execution Engine (`src/ai/WorldActionExecutor.js`)
- [ ] **Action 1: Spatial Navigation (`MOVE_TO`)**:
  - Navigates agent to target $(X, Z)$ along the Imperial Road network and waypoint nodes.
  - Integrates collision depenetration and smooth character walking/running limb animations.
- [ ] **Action 2: Speech & Thought Projection (`SPEAK` / `THINK`)**:
  - Generates floating low-poly comic speech bubbles with racial font styling above character 3D heads.
  - Appends spoken dialogue to the global event log and triggers audio blips.
- [ ] **Action 3: Physical Gestures & Emotes (`EMOTE`)**:
  - Triggers procedural body animations: Bow, Threaten/Roar, Laugh, Pray, Wave, Cross Arms.
- [ ] **Action 4: World Interaction (`INTERACT`)**:
  - Drink ale at The Dragon's Rest Tavern, warm hands at campfire, till crops in Oakhaven, inspect forge anvil.
- [ ] **Action 5: Autonomous Construction (`TRIGGER_BUILD`)**:
  - Bridges the agent's decision directly to `NPCTownBuilder.js` to begin constructing a new race structure.
- [ ] **Action 6: Combat & Defense (`ENGAGE` / `FLEE`)**:
  - Casts racial spells via `SkillSystem.js` or swings weapon via `CombatSystem.js` when threatened.

### 1.3 The Creator's Interface: Mind Inspector & Divine Decree (`src/ui/CreatorHUD.js`)
- [ ] **"Creator's Eye" Inspection Modal (`[C]` or HUD Button)**:
  - Clicking on any character opens the **Mind Inspector**:
    - **Current Thought Stream**: Real-time inner monologue of what the character is pondering.
    - **Active Goal**: What they are trying to achieve right now.
    - **Emotional Vitals**: Loyalty, Anger, Fear, Racial Pride, Fatigue (0–100%).
    - **Episodic Memory Log**: Last 5 events/interactions stored in their consciousness.
- [ ] **Divine Decree / Whispering Console**:
  - As The Creator, the user can type a divine thought directly into any character's mind (e.g., *"Aiden, seek the ancient obelisk"* or *"Malakor, hold your fury"*).
  - The character's LLM processes the Divine Message as a sacred or terrifying revelation and adapts its behavior.

---

## 🧠 PHASE 2: Individual AI Mind Architecture (Cognitive Agent Framework)
*Goal: Create the cognitive framework that powers each character's autonomous reasoning, memory, and personality.*

### 2.1 Persona & System Prompt Templates (`src/ai/AgentPersonas.js`)
- [ ] **Canonical Race & Lifespan Grounding**:
  - Strict grounding in canonical lifespans and racial anthropology:
    - **Demons**: Ageless/Eternal ($10,000+$ years), universal contempt for mortal kindling, relentless void will.
    - **Elves**: $1,500 - 3,000+$ years, haughty celestial nobility, disdain for crude human haste and dwarven soot.
    - **Dwarves**: $350 - 500$ years, stone-forged brotherhood, pragmatic machine technology, pride in gears and ore.
    - **Humans**: $75 - 100$ years, mortal baseline, resourcefulness, adaptable ambition, urgency.
- [ ] **Persona Schemas for the 6 Main Characters**:
  - Aiden, Princess Aurelia, Demon King Malakor, Kage, King Reginald, Master Vance.

### 2.2 Memory Stream & Reflection Engine (`src/ai/AgentMemory.js`)
- [ ] **Short-Term Working Memory**:
  - Circular buffer of the last 10 sensory events (sightings, heard dialogue, received damage).
- [ ] **Long-Term Episodic Memory**:
  - Stores key historical events with an **Importance Score** ($1 - 10$):
    - Interactions with the Creator (Importance: 10).
    - Near-death experiences or monster attacks (Importance: 8).
    - Friendship pacts or racial arguments (Importance: 6).
- [ ] **Periodic Reflection Cycle**:
  - Agent synthesizes recent memories into high-level beliefs (e.g., *"I have realized the dwarves at Karak-Vorn are honorable smiths despite their gruff exterior"*).

### 2.3 Pluggable Multi-Backend Brain Adapter (`src/ai/BrainAdapter.js`)
- [ ] **Adapter 1: Free In-Browser Lightweight Model (WebLLM / Transformers.js)**:
  - Runs directly inside the browser using WebGPU/Wasm (e.g. SmolLM-360M, Llama-3.2-1B, or Qwen2.5-0.5B).
  - 100% private, free, and runs offline without API keys.
- [ ] **Adapter 2: Cloud API Provider (Gemini 1.5 Flash / Flash Lite, OpenAI, Ollama)**:
  - User can provide their own API key or localhost Ollama URL for ultra-high intelligence and deep roleplay.
- [ ] **Adapter 3: Zero-Latency Heuristic "Micro-Mind" (Built-In Fallback)**:
  - Rule-based cognitive simulation that guarantees all characters have rich, autonomous behaviors and thoughts even with zero setup or slow internet.

---

## 👑 PHASE 3: The 6 Main Characters' Autonomous Minds
*Goal: Bring the 6 core legends of the realm to life with independent wills.*

- [ ] **1. Aiden (The Chosen Hero)**:
  - *Goal*: Unify the fractured races, seek training from Master Vance, investigate demon activity at the river border.
  - *Voice*: Idealistic, brave, respectful, driven by mortal duty.
- [ ] **2. Princess Aurelia (Crown Princess of Valoria)**:
  - *Goal*: Preserve peace, study elven starlight magic, maintain royal decorum, supervise Oakhaven farmlands.
  - *Voice*: Elegant, diplomatic, observant, carrying hidden magical burdens.
- [ ] **3. Demon King Malakor (The Shadow Monarch)**:
  - *Goal*: Harvest Nether power from the Void Altar, command demon war parties, plot the eradication of the Human Citadel.
  - *Voice*: Thundering, ominous, ancient, completely devoid of mortal pity.
- [ ] **4. Kage (The OP Side Character)**:
  - *Goal*: Wander between the shadows of the Town Market and the jungle, observe quietly, intervene only when catastrophe looms.
  - *Voice*: Laconic, calm, mysterious, razor-sharp anime swordsman persona.
- [ ] **5. King Reginald (High Sovereign)**:
  - *Goal*: Fortify the Citadel walls, balance royal treasury and food granaries, negotiate with dwarven clans for weapons.
  - *Voice*: Regal, weary, paternal, deeply protective of human survival.
- [ ] **6. Master Vance (The Retired Hero)**:
  - *Goal*: Enjoy rustic retirement at his foothills lodge, brew herbal tea, share combat wisdom at the tavern, sharpen his broadsword.
  - *Voice*: Gruff, warm, nostalgic, battle-scarred veteran humor.

---

## 🏘️ PHASE 4: Autonomous Realm NPCs & Living Social Dynamics
*Goal: Populate the 4 realms with living communities that interact, debate, trade, and build together.*

- [ ] **Autonomous Inter-NPC Conversations**:
  - When two characters meet at the Crossroads, market well, or tavern, they greet each other and converse based on their racial dispositions.
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
