# 🏰 Low-Poly Medieval Kingdom Open World RPG

An interactive, high-performance, stylized low-poly open world realm built with **Three.js** and **Vite**. Features a sprawling medieval kingdom with royal citadel, cobblestone streets, town bazaar, dense tropical jungles, enterable old-era open houses with real-time cutaway roofs, rideable warhorse mounts, dynamic day/night atmospheric cycles, and **6 Main Playable & Interactive Characters**.

The application runs live at: **`http://localhost:5173/`**

---

## 👥 The 6 Main Characters

You can switch to play as any of the 6 characters at any time using the **Character Roster Bar** at the top of the screen, or encounter them across the open world as interactive NPCs with dynamic dialogue and lore!

| Character | Role & Title | World Location | Distinct Low-Poly Look |
| :--- | :--- | :--- | :--- |
| **1. Aiden** | `⚔️ The Chosen Hero` | **Central Crossroads Bridge** *(x: 0, z: 12)* | Royal blue adventurer tunic, silver chestplate, golden cross-belt, scabbard with sword on back, blonde hair with red hero headband. |
| **2. Princess Aurelia** | `👑 Crown Princess` | **Royal Sun Pavilion** *(x: 470, z: -365)* | Flowing pink & white royal bell gown, silk gloves, golden tiara with cyan jewel, blonde royal locks. |
| **3. Malakor** | `🔥 The Demon King` | **Ancient Jungle Temple Altar** *(x: -270, z: -246)* | Obsidian heavy plate armor, curved demon horns, glowing red eye visor, ragged crimson cape, floating ember light. |
| **4. Kage** | `⚡ OP Side Character` | **Town Market Bazaar** *(x: 205, z: -110)* | Black duster coat with high upturned collar, spiky silver anime hair, glowing cyan eye-band, sheathed gold-ringed nodachi/katana. |
| **5. King Reginald** | `⚜️ High Sovereign` | **Royal Citadel Throne Room** *(x: 380, z: -375)* | Crimson velvet mantle with white ermine fur trim, golden crown studded with rubies, full white regal beard, Golden Sovereign Scepter. |
| **6. Master Vance** | `🛡️ The Retired Hero` | **Elder Thatched Lodge** *(x: 130, z: 254)* | Weathered brown slouch hat, grizzled gray beard, eyepatch, olive veteran vest, rustic wooden walking staff & old notched broadsword. |

### 💬 Dialogue & Character Switching
- **Interactive NPC Encounters**: Approach within 4 meters of any character to reveal the on-screen prompt: `[E] Talk to [Name]`.
- **RPG Dialogue Modal**: Displays character badge, animated typewriter lore, and relationship history.
- **Instant Playable Possession**: Click **"Play as this Character ⚡"** inside their dialogue, or click any icon on the **Top Roster Bar** to instantly switch control to them!

---

## 🗺️ World Biomes & Key Features

### 1. Camera Modes (2D & 2.5D Map Perspectives)
- **2.5D Isometric (Default)**: Classic diorama perspective (orthographic 45° angle) with sharp flat-shaded low-poly styling.
- **2D Top-Down**: Pure 90° top-down orthographic view (classic 2D open-world map layout).
- **3D Follow**: Dynamic perspective chase camera for ground-level exploration.
- **Smooth Zoom**: Mouse wheel or touch pinch zooms seamlessly from intimate interior room inspection out to full realm overviews.

### 2. The 4 Major Realm Territories

The open world is divided into **4 distinct faction territories** arrayed around the central Great River and the Crossroads Sanctuary Bridge:

#### ⚔️ The Land for the Humans (Crown Lands of Valoria — North-East)
- **Grand Royal Castle Citadel**: Authentic medieval fortress with defensive moat, fortified arched drawbridge with iron chains, twin barbican gate towers with machicolations, iron portcullis, outer bailey with castle garrison armory, weapon racks, sparring dummies, royal warhorse stables, water cistern, four monumental stone statues of ancient kings, and the Great Royal Donjon with an open enterable Grand Throne Hall (54m celestial spire, velvet red carpet runner, 8 stone columns, royal banquet feast tables, and King Reginald's High Throne Dais at `[380, -375]`, South Barbican Gate at `[380, -325]`).
- **Town Market Bazaar**: Central stone well and fountain, vendor stalls with striped canopies (fruit, grains, potions, armor), crates and barrels (`[205, -110]`).
- **Old-Era Medieval Townhouses**: Timber-framed dwellings with cantilevered upper floors, exposed beams, steep gabled roofs, and stone chimneys.
- **Kingdom Windmill**: Rotating cloth sails on a traditional stone mill base (`[60, -60]`).
- **The Dragon's Rest Tavern & Blacksmith's Forge**: Enterable guild hubs with banquet tables, ale barrels, and glowing hearths.
- **Armored Knight Patrols & Ox Wagons**: Royal guards marching cobblestone boulevards.

#### 🔥 The Dark Territory for the Demons (The Obsidian Nether Wastes — North-West)
- **Colossal Obsidian Dread Citadel**: Massive 96m × 90m nether stronghold surrounded by a boiling magma moat with volcanic basalt drawbridge, 38m corner bastions crowned in giant 14m demon horns, Hellfire Barbican Gate carved from colossal demon skulls and fangs, outer bailey with boiling sulfur cauldrons, and the Abyssal Skull Spire with a rotating Nether Blood Eye and Demon King Malakor's Throne of Skulls & Netherflame (`[-220, -220]`, South Drawbridge Gate at `[-220, -160]`).
- **Molten Lava Pools & Magma Fissures**: Bubbling glowing lava channels with stepping stone crossings and fiery night glow (`[-160, -250]`).
- **Volcanic Basalt Spires**: Clusters of angled hexagonal basalt columns jutting out of the cracked ash earth.
- **Corrupted Bone Gate**: Colossal gateway carved from massive demon ribcages and horned skulls with glowing red eye sockets (`[-80, -200]`).
- **Void Sacrificial Altar**: Stepped dark dais with burning braziers and a levitating, rotating purple Nether Crystal (`[-270, -250]`).
- **Perched Gargoyles & Spiked Obelisks**: Watchers carved into stone pillars overlooking the crags.

#### 🌿 The Forest for the Elves (The Whispering Canopy of Sylvaheim — South-West)
- **High Elven Moon Spire Sanctuary**: Slender white marble colonnades with curved sweeping arches, jade spires, and levitating Celestial Moon Orb (`[-200, 200]`).
- **Colossal Sacred Elder Trees**: Ancient mahogany trunks with spiral climbing ramps and elevated canopy platforms (`[-140, 150]`).
- **Canopy Suspension Bridges**: High wooden rope bridges connecting treetop sanctuaries across the upper forest canopy.
- **Bioluminescent Fairy Rings**: Circles of glowing cyan, emerald, and violet mushrooms casting gentle fairy light (`[-170, 130]`).
- **Whispering Archery Grove**: Handcrafted elven shooting stands, straw archery targets, and glowing bow racks (`[-110, 150]`).
- **Hanging Spirit Lanterns**: Crystal teardrops suspended from branches emitting ethereal teal and green illumination.

#### ⚒️ The Industry City for the Dwarves (Karak-Drak Mountain Stronghold — South-East)
- **Great Mountain Bastion & Iron Gate**: Heavy geometric stone ramparts with angular crenellations and gold-inlaid dwarven runes (`[200, 200]`).
- **Colossal Guard Statues**: Giant stone dwarven warriors holding double-bladed battleaxes and tower shields flanking the city entrance.
- **Industrial Blast Furnaces & Smeltery**: Twin stone smelting towers with iron bands, glowing molten iron troughs, and high smokestacks (`[140, 240]`).
- **Animated Giant Rotating Iron Gears**: Meshed 8-toothed iron cog gears rotating continuously on the mountain rock walls (`[240, 150]`).
- **Minecart Rail Network**: Steel rails with loaded iron ore carts transporting glowing gold and iron nuggets (`[170, 200]`).
- **Colossal Anvil Monument**: 9-meter iron anvil on a stone dais crowned with a giant gold-headed dwarven warhammer (`[200, 260]`).
- **Master Vance's Elder Lodge**: Retired Hero's thatched timber sanctuary in the peaceful foothills between the foundries and the river (`[130, 260]`).

#### 📍 The Central Crossroads Sanctuary (The Nexus — Center)
- **Ancient River Suspension Bridge** at `(0, 10)` spanning the Great River with wooden deck planks and rope railings.
- **Grand Faction Waypoint Obelisk & Sanctuary Plaza** at `(34, 10)`:
  - Monumental 9-meter 4-sided carved granite obelisk with golden pyramidion cap and glowing runic ring.
  - 4 Directional Heraldic Pennants with Faction Crests pointing toward each territory:
    - 🦁 **North-East**: Royal Blue & Gold Pennant pointing to the **Kingdom of Valoria**.
    - ⚒️ **South-East**: Bronze & Iron Pennant pointing to the **Dwarven Stronghold of Karak-Drak**.
    - 🌿 **South-West**: Emerald & Silver Pennant pointing to the **Elven Canopy of Sylvaheim**.
    - 💀 **North-West**: Obsidian & Crimson Pennant pointing to the **Obsidian Nether Fortress**.
  - 4 Sanctuary corner stone fire braziers with dynamic nighttime illumination.
  - Multi-directional wooden signposts and stone traveler resting benches.
- **Western Guardian Waypoint Archway** at `(-28, 10)`: Heavy stone portal with twin lanterns welcoming wanderers entering the western realms.
- **Grand Imperial Road Network**: Paved faction causeways connecting the Crossroads to all major citadels and agricultural hamlets.
- **Natural Island Perimeter & Endless Ocean**: The continent slopes smoothly into golden sand beaches and boundless ocean waters at `r > 620m`.
- **Dynamic Organic Heightmap**: Rolling meadows in Valoria, alpine crags in Karak-Drak, and level foundation pads for all settlements.
- **Surface-Adaptive Audio**: Footsteps adapt in real-time between cobblestones, wooden planks, and grass, with dual-strike hoof clatter when galloping the Warhorse.

### 4. Enterable Old-Era Houses with Cutaway Roofs
Step inside any structure to watch the roof smoothly lift up and fade into transparency, revealing fully furnished low-poly interiors:
- **The Dragon's Rest Tavern**: Long banquet tables, tavern counter, wooden ale barrels, tankards, roaring stone hearth, and bounty board.
- **The Blacksmith's Forge**: Open-air stone forge with glowing coal furnace, iron anvil, water quenching trough, and weapon display racks.
- **The Royal Sun Pavilion**: Marble colonnades, royal canopy bed, velvet divan, writing desk, and garden fountain.
- **Master Vance's Elder Lodge**: Thatched timber lodge with stone fireplace, straw bed, wooden weapon mount, and supply chest.
- **Jungle Explorer Outpost**: Elevated wooden stilt outpost with expedition cot, research desk, field maps, and hanging kerosene lantern.
- **Beach Cabana**: Tropical bamboo shelter by the sea.
- **Kingdom Village Cottages**: 4 additional furnished thatched/stone village cottages.

### 5. Faction Settlements & Living Group Communities (`src/world/VillageSettlement.js`)
- **Oakhaven Agricultural Village (Valoria Farmlands at `[105, 10]`)**:
  - **Tilled Crop Fields**: Furrowed soil beds with ripe golden wheat stalks, green cabbage heads, feathery carrots, and prize pumpkin patches with tangled vines.
  - **Post-and-Rail Wooden Fences**: Split-rail fencing enclosing the fields with swinging wooden gates.
  - **Granary, Barns & Cottages**: Enterable open timber granary stacked with grain sacks, hay bales, and tool racks. Farmer Bran's thatched cottage with chimney.
  - **Communal Village Life**: Cobblestone water well, stone bread-baking hearth with flickering campfire and log benches where villagers gather in groups.
  - **Group Living NPCs**: Farmer Bran (tilling with hoe), Maeve the Harvester (carrying cabbage basket), Young Pip (raking), Elder Elspeth (warming by the hearth), and Tobin the Carter (tending grain wagons).
- **Fernbrook Woodland Orchard & Hamlet (Forest Border at `[-75, 110]`)**:
  - Riverside apple orchard with red fruit, raised herbal garden beds (lavender, chamomile, dew-lilies), woven straw skep beehives, and rustic timber cabins.
  - Living villagers: Forester Cedric, Rowan the Herbalist, and Old Barnaby the Shepherd.
- **Krag’mar Demon Enclave (Dark Nether Plains at `[-120, -90]`)**:
  - Horned Chieftain's bone-spire keep, two conical basalt huts with glowing red eye-slits, boiling sulfur and magma cauldron with green/red potion, obsidian forging anvil, and spiked bone palisade walls.
  - Living demons: Torok the Fire-Smith (forging cursed weapons), Vespera the Shadow Witch (stirring sulfur brew), and Gorgar the Horned Raider (sentry guarding the bone gate).
- **Sylvaheim Elven Glade (Mystic Canopy at `[-160, 90]`)**:
  - Living tree sanctuary arbor with jade translucent roof and marble columns, organic elder bark cabins, celestial starlight mana pool with luminous water, and elven harp grove.
  - Living elves: Aeloria Starweaver (playing wooden lyre), Kaelen Whisperwind (canopy ranger with recurve bow), and Sylph Master Elyndra (mana botanist).
- **Karak-Vorn United Clanstead ("Dwarves Stay United!" at `[105, 140]`)**:
  - Fortified mountain settlement founded on dwarven clan brotherhood and unity.
  - **Clan Unity Monument**: Hexagonal stone dais with 4 colossal interlocked bronze dwarven shields and a central glowing golden anvil inscribed *"One Anvil, One Hearth, One Clan! The Stone Shall Never Break!"*.
  - **The Grand Clan Unity Mead Hall**: Enterable heavy stone longhouse with crossed battleaxes above the door, long banquet tables, and dark mountain stout kegs.
  - **Brotherhood Forge & Minecart Depot**: Hearth forge with bellows, quenching barrels, and ore minecarts.
  - Living united dwarves: Clan Chief Thordak Ironbrow (holding the Golden Clan Standard), Bardin the Runesmith (striking runes of brotherhood on the clan anvil), and Gunnar Keg-Tapper (rolling mead kegs into the hall to toast clan solidarity).

### 6. Landmark Race NPCs across the 4 Faction Realms (`src/entities/RealmNPCs.js`)
- **⚔️ Humans (Kingdom of Valoria)**:
  - **Captain Godric (`[196, -135]`)**: Citadel Gate Commander in silver plate armor with halberd.
  - **Grand Scholar Alistair (`[206, -155]`)**: Court Archivist in navy robes reading celestial scrolls in the castle courtyard.
  - **Barnaby the Barkeep (`[205, -87]`)**: Tavern keeper serving spiced cider behind The Dragon's Rest bar counter.
  - **Madame Vivienne (`[198, -114]`)**: Silk & spice trader at the Town Market Bazaar.
- **🔥 Demons (Obsidian Nether Wastes)**:
  - **Xarok the Void Acolyte (`[-266, -248]`)**: High Nether Priest channeling void flames before the Nether Crystal at the Void Altar.
  - **Dread Commander Vhazor (`[-215, -202]`)**: Spiked warlord guarding the Obsidian Dread Keep with a greatsword.
  - **Ignis the Magma Herder (`[-152, -242]`)**: Fire beast tender watching over the boiling lava pools with a flame whip.
  - **Shadow Stalker Nyx (`[-76, -196]`)**: Silent nether assassin perched near the Corrupted Bone Gate.
- **🌿 Elves (Sylvaheim Canopy)**:
  - **High Priestess Lunara (`[-198, 196]`)**: Custodian of the Celestial Moon Orb in silver silk robes with crescent staff.
  - **Warden Thalor (`[-208, 190]`)**: Guardian of the Moon Spire marble colonnades with jade polearm.
  - **Master Bowman Caelan (`[-114, 146]`)**: Instructor at Whispering Archery Grove aiming a recurve longbow.
  - **Druid Faelen (`[-142, 144]`)**: Elder Wood Druid communing with the Colossal Elder Trees and fairy rings.
- **⚒️ Dwarves (Karak-Drak Stronghold)**:
  - **Gate Commander Brokk Stonehelm (`[200, 186]`)**: Bastion Iron Gate warden with colossal tower shield and warhammer.
  - **Chief Engineer Kazador (`[142, 234]`)**: High Blast Engineer overseeing molten iron flow at the Great Blast Furnaces.
  - **Prospector Durgin Gold-Eye (`[172, 196]`)**: Surveyor of the Minecart Rail Network inspecting gold ore carts with pickaxe.
  - **Anvil Lorekeeper Morgrim (`[198, 252]`)**: Chronicler recording oaths at the Colossal Anvil Monument.

### 7. Rideable Royal Warhorse Steed
- Stabled at the central crossroads bridge (`[8, 18]`).
- Press **[E]** or click the on-screen action button to mount and ride.
- Realistic equestrian acceleration, turning, galloping leg animations, and horse lantern.
- Press **[E]** while mounted to dismount smoothly.

### 8. Armored Knight Patrols & Ox Wagons
- Patrolling royal kingdom knights in plate armor with halberds, shields, and torches marching along the stone roads.
- Heavy wooden ox and cart wagons with spoked rotating wheels transporting hay and barrels.

### 9. Minimap & Fullscreen World Map with Fast Travel
- **HUD Radar**: Top-right corner circular radar showing player position, orientation, roads, water, and enterable house markers (🏡).
- **Fullscreen World Map**: Press **[M]** or click the map button to view the entire island atlas with labeled regions.
- **Instant Fast Travel**: Click any waypoint or click anywhere on the world map to warp there instantly!

### 10. Dynamic Day & Night Cycle
- Orbiting sun and moon casting real-time soft shadows.
- Atmospheric transitions (Dawn → Midday → Sunset → Midnight Navy).
- Automatic night lighting: Castle braziers flare, street lanterns glow, forge coals smolder, and glowing fireflies drift through the jungle canopy.

### 11. Airtight Sub-Stepped Collision Engine
- Continuous circle-AABB and circle-cylinder push-out collision ($\le 10\text{ cm}$ per micro-step) prevents any tunneling through walls, towers, stalls, or houses even while sprinting or riding the steed at top speed.

### 12. Canonical Racial Lifespans, Mindsets & Inter-Race Animosity
- **Mutual Dislike & Racial Stereotypes**:
  - **🔥 Demons ("Hates Everyone")**: `Ageless / Eternal (10,000+ Years)` — Universal hatred; despise all mortal races and view them as kindling for the nether flames.
  - **🌙 Elves ("Loves to Be Noble")**: `1,500 – 3,000+ Years` — Aristocratic vanity; obsessed with celestial nobility, looking down on humans as brief upstarts and dwarves as soot-covered troglodytes.
  - **🛡️ Dwarves ("Good with Technology")**: `350 – 500 Years` — Mechanical engineering geniuses; master rotating cog gears, blast furnaces, and steam power while scoffing at elven flower-poetry.
  - **👑 Humans ("Good with Their Stuff")**: `75 – 100 Years` — Versatile mastery; masters of agriculture, stone castles, and lucrative trade, holding the realm together through sheer adaptable grit.
- **In-Game Lifespan & Disposition Badges**: Every conversation displays a custom race pill with their cultural stance, age, and lifespan.
- **Races & Lifespans Codex Modal**: Press **[L]** or click **⏳** on the HUD to open the interactive anthropology codex and view detailed racial profiles, inter-race rivalries, and comparative longevity timelines.

### 13. Monster Bestiary & Monster Taming System (`src/entities/MonsterManager.js`)
- **Massive Bestiary (82+ Monsters Across 4 Territories of the Expanded 1600m World)**:
  - **🌿 Elven Forest**: Forest Goblins, Dire Wolves, Elder Treants, Ancient Canopy Titans, Celestial Starlight Drakes, Giant Brood Spiders, Venom Weaver Arachnids, Forest Bears, Horned Boars, and the Colossal Broodmother (`Lv. 1 – 6`).
  - **🔥 Demon Nether Wastes**: Brimstone Nether Imps, Pyromancers, Magma Hellhounds, Cerberus Hellhounds, Obsidian Volcanic Golems, Nether Colossuses, Cursed Skeleton Warriors, Dread Bone Knights, Blood Spiders, and Sovereign Void Wyverns (`Lv. 2 – 7`).
  - **⚒️ Dwarven Mountains**: Mountain Tusk Boars, Granite Razorbacks, Rogue Steam Automatons, Clockwork Iron Sentries, Titanium Steam Colossuses, Mountain Cave Bears, Crag Rock Golems, Deep-Mine Cave Spiders, and Iron-Horned Wyverns (`Lv. 2 – 6`).
  - **⚔️ Human Valoria Border**: Outlaw Bandits, Highway Brigands, Rogue Poachers, Highland Gray Wolves, Timberland Stalkers, Wild Valorian Brown Bears, Bristleback Boars, Wandering Skeletons, and Royal Ridge Wyverns (`Lv. 1 – 5`).
- **Single-Companion Monster Taming (`[G]` Tame / `[U]` Release)**:
  - Approach any wild beast or monster and press **[G]** (or click the HUD **🐾 Tame Monster** button) to tame them into your loyal companion!
  - **Strict Limit: You can only have ONE tamed companion at a time.** Taming a new creature immediately releases any previous companion back to the wild.
  - **Dedicated Companion HUD Card**: Real-time status display in the HUD showing your companion's avatar, level, dynamic HP bar, attack power, and quick dismissal button.
  - Tamed pets receive a **cyan loyalty aura**, glowing runic collar, full health restoration, and a companion nametag (`🐾 [TAMED] Lv. X Name`).
  - Companions dynamically match your foot sprint or horseback gallop speeds, defend you against aggressive predators, and fight beside you in battle.
  - Press **[U]** (or click the HUD **💔 Release Pet** button) anytime to peacefully set your companion free.

### 14. Inhabited Settlement Sanctuaries & Wild Monster Ward Barriers (`SANCTUARY_ZONES`)
- **Strict Wild Monster Exclusion**:
  - All 13 populated settlements, towns, villages, markets, castles, foundries, and hamlets are registered as sacred sanctuary zones (`SANCTUARY_ZONES` in `src/config/constants.js`).
  - Wild and hostile monsters are physically prevented from entering populated areas:
    - **Ward Perimeter Barriers**: Hostile monsters attempting to cross town or village boundaries are halted by sacred wards (`⛔ WARD BARRIER`), immediately drop target aggro, and leash back to their wilderness haunts.
    - **Immunity Inside Sanctuaries**: Characters or players standing within settlement perimeters cannot be targeted or aggroed by wild beasts.
    - **Safe Wander Paths**: Random wander generation will never select positions inside settlements.
    - **Continuous Depenetration Safeguard**: Any wild monster pushed or bumped near a sanctuary boundary is continuously pushed out beyond the safety margin.
  - **Tamed Companion Access**: Only the player's tamed pet companion (`m.isTamed`) is permitted to cross sanctuary boundaries with their master.

---

## 🕹️ Controls

| Control | Action |
| :--- | :--- |
| **W, A, S, D** or **Arrow Keys** | Walk / Ride Steed |
| **Shift** | Sprint / Gallop |
| **F** or **Space** (on foot) | **✨ Magic Sword Skills** (3-Hit Combo: Crescent ➔ Cross Arc ➔ 360° Whirlwind Tempest Nova) |
| **G** | **🐾 Tame nearby monster** (Only 1 active companion) |
| **U** | **💔 Release current tamed companion** |
| **Left Click / Tap** | Click on ground to walk to destination |
| **Mouse Wheel** | Zoom In / Out (Nudges altitude in Free Look) |
| **E** | Talk to NPC Characters / Mount or Dismount Steed |
| **M** | Open / Close Fullscreen World Map & Fast Travel |
| **L** | **Open / Close Races & Lifespans Codex** |
| **1** | Switch to **2.5D Isometric View** |
| **2** | Switch to **2D Top-Down Map View** |
| **3** | Switch to **3D Follow View** |
| **4** | Switch to **🎥 Creator Free Look (Fly across 1600m map: WASD fly, Q/E altitude, Shift turbo, Mouse aim)** |
| **V** | Cycle through camera modes |
| **Top Roster Bar** | Click any of the 6 Character Icons to play as them! |

---

## 🏗️ Development & Extension

For full architecture details, file relationships, and the prioritized development roadmap, consult:
- **`AGENTS.md`**: Master guide for AI agents and developers switching tools/accounts.
- **`docs/ARCHITECTURE.md`**: Deep dive on systems, collision math, and rendering loop.
- **`docs/CHARACTERS.md`**: Lore, 3D anatomical models, and dialogue trees.
- **`docs/WORLD_MAP.md`**: Spatial coordinates, biomes, and fast travel nodes.
- **`docs/TODO.md`**: Prioritized backlog of upcoming features.
