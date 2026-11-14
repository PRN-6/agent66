# 🗺️ World Map & Spatial Coordinates

The realm is a bounded **800m × 800m** open-world continent divided into **4 Grand Faction Territories** connected by the Central Crossroads Sanctuary Bridge:
- World X-axis: `-400` (Far West) to `+400` (Far East)
- World Z-axis: `-400` (Far North) to `+400` (Far South)
- Center Origin: `(0, 0)`

---

## 🧭 The 4 Major Realm Territories

```
                             NORTH (-Z)
             [-400, -400]                    [+400, -400]
                     |                           |
        🔥 DEMON TERRITORY   |       ⚔️ HUMAN KINGDOM
       (The Obsidian Wastes) |     (Crown Lands of Valoria)
       Malakor's Dread Keep  |     King Reginald's Citadel
          (-220, -220)       |           (200, -150)
                             |
 WEST (-X) ------------------+------------------- EAST (+X)
                             |
                             |   📍 CROSSROADS BRIDGE
                             |      (0, 10) Aiden
                             |
        🌿 ELVEN FOREST      |     ⚒️ DWARVEN INDUSTRY
      (Sylvaheim Canopy)     |    (Karak-Drak Stronghold)
      Moon Spire Sanctuary   |     Blast Furnaces & Gears
          (-200, 200)        |          (200, 200)
                     |                           |
             [-400, +400]                    [+400, +400]
                             SOUTH (+Z)
```

---

## 📍 Fast Travel Waypoints & Key POIs

All waypoints are registered in `src/config/constants.js` and accessible via the Fullscreen World Map (`[M]` key):

| ID | Name | Territory | Coordinates $(X, Z)$ | Key Description |
| :--- | :--- | :--- | :--- | :--- |
| `crossroads` | **Crossroads Sanctuary Bridge** | Central Hub | `(0, 10)` | Ancient stone bridge crossing the Great River; Warhorse Steed parked nearby |
| `royal_citadel` | **Royal Castle Citadel** | Human Kingdom | `(380, -380)` | Authentic medieval fortress with defensive moat, drawbridge, 4 corner bastions, King Reginald's Throne Hall (Gate at `[380, -325]`) |
| `high_valoria_town` | **High Valoria Castle Town** | Human Kingdom | `(370, -250)` | Grand capital high town outside Citadel: 3-tier Marble Lion Fountain, 28m Clocktower, Royal Bank, Alchemist Spire, Silver Stag Inn, Smithy, Flower Market & Sunken Rose Garden |
| `princess_pavilion` | **Princess Aurelia’s Sun Pavilion** | Human Kingdom | `(470, -370)` | Graceful royal estate and gardens of Crown Princess Aurelia |
| `tavern` | **The Dragon's Rest Tavern** | Human Kingdom | `(205, -85)` | Enterable tavern with ale casks, hearth, banquet tables, and bounty board |
| `demon_citadel` | **Obsidian Dread Fortress** | Demon Realm | `(-220, -220)` | Crowned in curved demon horns, obsidian battlements, and seat of Demon King Malakor |
| `demon_altar` | **Void Sacrificial Altar** | Demon Realm | `(-270, -250)` | Stepped volcanic stone dais with a levitating purple Void Crystal |
| `elven_sanctuary` | **Moon Spire Sanctuary** | Elven Forest | `(-200, 200)` | Marble colonnades, jade spires, and levitating Celestial Moon Orb |
| `elven_archery` | **Whispering Archery Grove** | Elven Forest | `(-110, 150)` | Straw archery targets and longbow stands under ancient elder trees |
| `jungle_outpost` | **Wild Jungle Research Outpost** | Elven Forest | `(-260, 120)` | Elevated bamboo stilt treehouse in the lush deep jungle canopy |
| `dwarf_bastion` | **Karak-Drak Bastion** | Dwarf Industry | `(200, 200)` | Heavy stone bastion flanked by colossal dwarven guard statues |
| `dwarf_foundry` | **Great Blast Furnaces & Gears** | Dwarf Industry | `(140, 240)` | High stone smelting chimneys, molten metal streams, and rotating cog wheels |
| `elder_lodge` | **Master Vance's Rustic Lodge** | Foothills | `(130, 260)` | Retired Hero's thatched timber lodge with roaring stone hearth and old broadsword |
| `oakhaven_village` | **Oakhaven Agricultural Village** | Human Kingdom | `(105, 10)` | Fertile farmlands with golden wheat fields, pumpkin patches, granary barn, and living farmers |
| `fernbrook_hamlet` | **Fernbrook Woodland Hamlet** | Elven Border | `(-75, 110)` | Riverside orchard hamlet with fruit trees, raised herbal flowerbeds, skep beehives, and log cabins |
| `demon_enclave` | **Krag’mar Demon Enclave** | Demon Realm | `(-120, -90)` | Nether outpost with bone-spire keep, horned basalt huts, boiling magma cauldron, and demon smiths |
| `elven_glade` | **Sylvaheim Elven Glade** | Elven Forest | `(-160, 90)` | Luminous woodland glade with living jade tree pavilions, starlight mana pool, and elven singers |
| `dwarf_clanstead` | **Karak-Vorn United Clanstead** | Dwarf Industry | `(105, 140)` | Fortified mountain settlement where the dwarven clans live and work united with mead halls, forge & Unity Monument |

---

## ⛰️ Terrain Model & Vertex Coloring (`src/world/Terrain.js`)

1. **Demon Territory (NW)**:
   - Charcoal ash ground (`0x18181b`), blood-red scorched earth (`0x450a0a`), and basalt pillars (`0x27272a`).
2. **Elven Forest (SW)**:
   - Ancient emerald moss (`0x064e3b`), vibrant turquoise flora (`0x0f766e`), and leafy elder canopies.
3. **Human Kingdom (NE)**:
   - Cobblestone courtyards (`0x52525b`) and green royal meadows (`0x4d6938`).
4. **Dwarven Industry City (SE)**:
   - Mountain granite stone (`0x44403c`), red-brown iron clay (`0x78350f`), and industrial slate (`0x57534e`).
5. **The Great River**:
   - Flows North to South dividing the western realms (Demons & Elves) from the eastern realms (Humans & Dwarves).
