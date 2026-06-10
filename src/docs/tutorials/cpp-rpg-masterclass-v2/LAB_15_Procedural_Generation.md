# C++ Terminal RPG — LAB 15 — Procedural Generation

**Prerequisites:** LAB 14. You have the OOP class hierarchy, the battle
system, and the room grid.

**What this lab adds:**
- Procedurally generated dungeon floors (random room layouts)
- Random enemy selection with floor-difficulty scaling
- Random loot tables — different items drop in different rooms
- A multi-room dungeon with connections and a staircase to the next floor

**Time:** 75–90 minutes

---

## What You Will Build

Every run generates a different dungeon:

```
  FLOOR 2                            [Cleared rooms in grey, current in yellow]

  ┌───┬───┬───┐
  │ 0 │ 1 │   │    Room 0: Goblin Den    — cleared ✓
  ├───┼───┤   │    Room 1: Stone Passage — cleared ✓
  │   │ 2 │ 3 │    Room 2: Armory       — ENEMY!
  └───┴───┴───┘    Room 3: Vault         — locked
       ↑
   [staircase room]    Room 4 (East of room 3): Boss Chamber

  Current room: 2 — Armory
  "Weapon racks line the walls. An Orc Warrior guards the exit."

  Exits: [N]orth (→ 1, cleared)  [E]ast (→ 3, locked)
```

---

> **Quick Check — try to answer before reading:**
> 1. What is a "seed" in procedural generation and why does using the same
>    seed always produce the same dungeon?
> 2. What is a "loot table" and how does probability work in one?
> 3. Prediction: if you generate a 3×3 grid of rooms (9 rooms), how do you
>    decide which rooms are connected? What data structure stores connections?
> *(Answers at the end of this lab)*

---

## Mental Model: Procedural Generation — The Core Idea

**Official name:** Procedural Content Generation (PCG)

**What it is:** Instead of hand-designing every dungeon level, you define a
*space of valid dungeons* and let the computer sample from that space at
runtime. The content is not stored — it is computed.

**Canonical example (General Explanation):**
A deck of cards shuffled before a game — the content is pre-defined (the
cards exist) but the ORDER is randomized. Procedural generation defines a
space of possibilities (room types, enemy configurations, item drops) and
randomly samples from it. The game is never the same twice, but always valid.

```cpp
// The "deck" — all possible room types
std::vector<RoomType> pool = {
    RoomType::Corridor, RoomType::GoblinDen, RoomType::Armory, ...
};

// The "shuffle"
for (int i = pool.size() - 1; i > 0; i--) {
    int j = rand() % (i + 1);
    std::swap(pool[i], pool[j]);
}
// Every run: valid rooms, different order
```

**Why this example makes the mechanic obvious:** The deck always contains
exactly the same cards — you can never draw a card that doesn't exist in the
deck. Procedural generation gives the same guarantee: you can never generate
a room type that isn't in the pool.

**Project Application (The "Why" here):**
The dungeon has Entrance, Corridors, GoblinDens, Armories, Crypts,
Treasuries, a StairsDown, and a BossRoom on every floor — but their order
changes each run. Players explore a fresh layout every time without the dev
needing to hand-craft each floor.

---

## Mental Model: Data-Driven Dispatch — Loot Tables

**Official name:** Data-Driven Dispatch (also called "table-driven design")

**Why it exists:** Hard-coding if/else chains for loot generation creates
fragile, hard-to-balance code. A loot table separates WHAT can drop from
HOW to pick it:

```
Before:
  if (roll < 20) give health potion;
  else if (roll < 40) give mana potion;
  else if (roll < 55) give sword;
  // etc. — buried in logic, hard to rebalance

After:
  struct LootEntry { int weight; Item item; };
  std::vector<LootEntry> table = {
    {20, healthPotion},   // 20% chance
    {20, manaPotion},     // 20% chance
    {15, sword},          // 15% chance
    {45, nothing},        // 45% chance (no drop)
  };
  // One function picks from ANY table — no if/else chains
```

**Where you will see this again:** Lab 16 uses loot tables for room-specific
rewards. Any RPG inventory system uses them for enemy drops.

---

### Math: Weighted Probability

**What it computes:** Selecting a random item where some items are more
likely than others.

**The real-world analogy:** A loaded die — a d6 where 1–3 lands common rooms
(50%), 4–5 lands uncommon rooms (33%), and 6 lands a rare boss room (17%).

**Canonical example:**
```
Weights: common=50, uncommon=30, rare=20   (total=100)
roll = rand() % 100    // [0, 99]
if (roll < 50)  → common        // 0–49 (50 values)
else if (roll < 80) → uncommon  // 50–79 (30 values)
else → rare                     // 80–99 (20 values)
```

**Why it matters here:** Enemy difficulty, loot quality, and room types are
weighted — the player encounters mostly common enemies with occasional rare
ones. Pure uniform random would make every encounter equally likely, which
feels unbalanced.

**Watch for:** The weights must sum to the modulus value (100 for `% 100`).
Add each threshold cumulatively, not absolutely. This lab's `rollLootTable`
function uses cumulative addition through the entry list to achieve the same
result without requiring weights to sum to exactly 100.

---

## Concept: `std::map` — Key-Value Storage

**What it is:** An ordered associative container. Each element has a unique
key and an associated value. Lookups by key are O(log n).

**The problem before:**
```cpp
// Arrays require you to know the index for each connection:
int connections[9][4];  // which direction connects to which room
// Which index is "room 3's east connection"? Requires offset math.
```

**The solution:**
```cpp
#include <map>
// Map room ID → list of connected room IDs
std::map<int, std::vector<int>> connections;
connections[0] = {1, 3};   // room 0 connects to rooms 1 and 3
connections[1] = {0, 2};   // room 1 connects to rooms 0 and 2
```

**What it hides:** Binary search tree management — `std::map` keeps keys
sorted automatically via a red-black tree. Every insert and lookup traverses
this tree. You never see the tree; you just call `map[key]`. Invariant: keys
are always unique. Inserting the same key twice overwrites the value, it
does not create a duplicate entry.

**Canonical example (General Explanation):**
A phone book — you look up by name (key) and get a number (value).
`map<int, Room> rooms` maps room IDs to room objects. `rooms[3]` gives you
Room 3.

```cpp
std::map<int, Room> rooms;
rooms[0] = entranceRoom;
rooms[3] = vaultRoom;
// "What room is at index 3?" → rooms[3]
// "Does room 7 exist?" → rooms.count(7) == 1
```

**Why this example makes the mechanic obvious:** You look up by the room's
ID directly, not by offset arithmetic. `eastConnections[2] = 3` reads as
"room 2's east exit leads to room 3" — intent is visible.

**Project Application (The "Why" here):**
Room connections are stored in four maps (one per cardinal direction).
`eastConnections[i] = j` means stepping east from room i enters room j.
`eastConnections.count(i)` safely checks whether room i even has an east
exit — no bounds violations, no sentinel values.

**Smallest possible example:**
```cpp
#include <map>
std::map<std::string, int> enemyXP;
enemyXP["Goblin"]  = 25;
enemyXP["Orc"]     = 50;
enemyXP["Dragon"]  = 500;
std::cout << enemyXP["Goblin"] << std::endl;  // 25
```

**Why it matters here:** Room connections are stored in a map: room index →
connected room indices in each cardinal direction.

---

## Concept: Dungeon Graph — Room Adjacency

**What it is:** The dungeon is a *graph* — rooms are nodes, connections are
edges. A map per direction (`eastConnections`, `westConnections`, etc.)
stores the adjacency list for each directional edge.

**Canonical example (General Explanation):**
A subway map as a graph — stations are nodes, tracks are edges. A map
`eastConnections[roomA] = roomB` stores whether there is a path from room A
to room B going east. Minimal:

```cpp
std::map<int, int> east;
east[0] = 1;   // room 0's east exit → room 1
east[1] = 2;   // room 1's east exit → room 2
// Checking: does room 3 have an east exit?
if (east.count(3)) { /* yes */ }
```

**What it hides:** Graph traversal complexity. The dungeon never needs
full BFS/DFS because it uses a linear chain with optional branches — checking
a single map entry is enough to navigate.

**Project Application (The "Why" here):**
The dungeon uses four maps (`northConnections`, `southConnections`,
`eastConnections`, `westConnections`). When the player steps through a door
tile, the code looks up the matching connection map: if the key exists, it
transitions to that room. If it doesn't, the door is decorative (or blocked).

---

## Step 1 — Room Type Enum and Dungeon Structs

Add to `main.cpp` (or a new `dungeon.h`):

```cpp
#include <map>
#include <vector>
#include <algorithm>  // for std::shuffle

// ── Room types ────────────────────────────────────────────────
enum class RoomType {
    Entrance,     // starting room (safe)
    Corridor,     // basic passageway, low loot
    GoblinDen,    // goblins — medium loot
    Armory,       // weapons and armor
    Crypt,        // skeletons, undead
    Treasury,     // high gold, locked
    BossRoom,     // floor boss
    StairsDown,   // leads to next floor
    SafeRoom,     // no enemies, rest point
};

// ── Loot entry ────────────────────────────────────────────────
struct LootEntry {
    int  weight;    // higher = more likely to roll this entry
    Item item;
};

// ── Dungeon room (expands Room struct from Lab 10) ─────────────
struct DungeonRoom {
    Room        roomData;   // the grid and tile data from Lab 10
    RoomType    type;
    bool        hasEnemy;
    bool        isCleared;  // enemies dead and loot taken
    bool        isLocked;   // requires key item
    int         floorNum;   // which floor this room is on
    std::string entryFlavor; // text when player enters
    std::vector<LootEntry> lootTable;
};

// ── Dungeon floor ─────────────────────────────────────────────
struct DungeonFloor {
    std::vector<DungeonRoom> rooms;
    std::map<int, int> northConnections;  // room index → north neighbor
    std::map<int, int> southConnections;
    std::map<int, int> eastConnections;
    std::map<int, int> westConnections;
    int stairsRoomIndex;  // which room has the down staircase
    int bossRoomIndex;    // which room has the floor boss
    int playerRoomIndex;  // current room the player is in
};
```

---

## Step 2 — Loot Table Functions

Add:

```cpp
// ── Roll a loot table ─────────────────────────────────────────
// Returns a random item from the table based on weights,
// or a special "nothing" item if the empty slots are rolled
Item rollLootTable(const std::vector<LootEntry>& table) {
    // Calculate total weight
    int totalWeight = 0;
    for (const LootEntry& entry : table) {
        totalWeight += entry.weight;
    }

    if (totalWeight <= 0) {
        Item nothing;
        nothing.name = "Nothing";
        nothing.type = ItemType::KeyItem;
        return nothing;
    }

    // Roll a number from 1 to totalWeight
    int roll = (rand() % totalWeight) + 1;

    // Walk through entries until we find the rolled slot
    int cumulative = 0;
    for (const LootEntry& entry : table) {
        cumulative += entry.weight;
        if (roll <= cumulative) {
            return entry.item;
        }
    }

    // Should never reach here — return last item as safety
    return table.back().item;
}

// ── Build a room-type loot table ─────────────────────────────
std::vector<LootEntry> buildLootTable(RoomType type, int floor) {
    std::vector<LootEntry> table;

    // Base items available everywhere
    LootEntry healthPotion = {30, makeHealthPotion()};
    LootEntry manaPotion   = {20, makeManaPotion()};
    LootEntry nothing      = {50, Item{"Nothing", ItemType::KeyItem, 0, 0, ""}};

    switch (type) {
        case RoomType::Corridor:
            table = {healthPotion, nothing, nothing};
            break;

        case RoomType::GoblinDen:
            table = {healthPotion, manaPotion, nothing};
            // Goblins sometimes carry gold scrolls
            table.push_back({15, makeScroll("Magic Missile", 12 + floor * 3)});
            break;

        case RoomType::Armory:
            // Armories have weapons and armor, rarely potions
            table.push_back({40, makeLongsword()});
            table.push_back({30, makeLeatherArmor()});
            table.push_back({15, healthPotion.item});
            table.push_back({15, nothing.item});
            break;

        case RoomType::Crypt:
            // Skeletons carry magical scrolls, no gold
            table.push_back({40, makeScroll("Necrotic Touch", 15 + floor * 2)});
            table.push_back({30, healthPotion.item});
            table.push_back({30, nothing.item});
            break;

        case RoomType::Treasury:
            // Treasure rooms have higher gold value items
            {
                Item goldPile = makeHealthPotion(); // placeholder — real gold item in Lab 16
                goldPile.name = "Gold Pouch";
                goldPile.value = 50 + floor * 10;
                table.push_back({60, goldPile});
                table.push_back({40, manaPotion.item});
            }
            break;

        default:
            table = {healthPotion, nothing};
    }

    return table;
}
```

---

## Step 3 — Enemy Selection by Floor and Room Type

Add:

```cpp
// ── Pick an enemy appropriate for the floor/room ─────────────
Enemy selectEnemyForRoom(RoomType type, int floor) {
    switch (type) {
        case RoomType::GoblinDen:
            if (floor >= 3) {
                // Tougher goblin variants on later floors
                Enemy elite = Enemy::makeGoblin();
                elite = Enemy("Goblin Elite",
                              elite.getHP() + floor * 3,
                              elite.getATK() + floor,
                              elite.getDEF() + 1,
                              elite.getXPReward() * 2,
                              elite.getGoldReward() * 2,
                              EnemyType::Goblin);
                return elite;
            }
            return Enemy::makeGoblin();

        case RoomType::Crypt:
            return Enemy::makeSkeleton();

        case RoomType::Armory:
            return Enemy::makeOrc();

        case RoomType::BossRoom:
            if (floor >= 5) return Enemy::makeDragon();
            if (floor >= 3) return Enemy::makeOrc();
            return Enemy::makeGoblin();  // easy boss on floor 1

        default:
            return Enemy::makeGoblin();
    }
}

// ── Get room flavor text ──────────────────────────────────────
std::string getRoomFlavor(RoomType type) {
    switch (type) {
        case RoomType::Entrance:
            return "You stand at the dungeon entrance. Cool air flows inward.";
        case RoomType::Corridor:
            return "A narrow stone corridor. Torches flicker on the walls.";
        case RoomType::GoblinDen:
            return "The stench of goblin fills the air. Filthy bedrolls litter the floor.";
        case RoomType::Armory:
            return "Weapon racks line the walls. Most are rusted, but some still gleam.";
        case RoomType::Crypt:
            return "Ancient sarcophagi line the walls. The air tastes of decay.";
        case RoomType::Treasury:
            return "Gold coins are scattered on the floor. Someone left in a hurry.";
        case RoomType::BossRoom:
            return "The floor trembles. Something ancient waits in the shadows.";
        case RoomType::StairsDown:
            return "A spiral staircase descends into deeper darkness.";
        case RoomType::SafeRoom:
            return "A small chamber with a fire pit. You feel safe here.";
        default:
            return "A dungeon room.";
    }
}
```

---

## Step 4 — Generate a Complete Dungeon Floor

Add:

```cpp
// ── Room type pool by floor ───────────────────────────────────
// Returns a shuffled list of room types appropriate for this floor
std::vector<RoomType> getRoomPool(int floor) {
    std::vector<RoomType> pool;

    pool.push_back(RoomType::Entrance);     // always first

    // Standard rooms
    for (int i = 0; i < 2; i++) pool.push_back(RoomType::Corridor);
    for (int i = 0; i < 2; i++) pool.push_back(RoomType::GoblinDen);
    pool.push_back(RoomType::Armory);
    pool.push_back(RoomType::Crypt);

    // Later floors add harder rooms
    if (floor >= 2) pool.push_back(RoomType::Treasury);
    if (floor >= 3) pool.push_back(RoomType::Crypt);      // more crypts
    if (floor >= 4) pool.push_back(RoomType::Treasury);   // more treasure

    pool.push_back(RoomType::SafeRoom);
    pool.push_back(RoomType::StairsDown);
    pool.push_back(RoomType::BossRoom);

    // Shuffle with the seeded rand (simplified shuffle)
    for (int i = static_cast<int>(pool.size()) - 1; i > 0; i--) {
        int j = rand() % (i + 1);
        std::swap(pool[i], pool[j]);
    }

    // Fix: Entrance is always index 0, Boss is always last
    pool[0] = RoomType::Entrance;
    pool.back() = RoomType::BossRoom;

    return pool;
}

// ── Build a DungeonRoom from a type ────────────────────────────
DungeonRoom buildDungeonRoom(RoomType type, int floor) {
    DungeonRoom dRoom;
    dRoom.type         = type;
    dRoom.floorNum     = floor;
    dRoom.isCleared    = (type == RoomType::Entrance || type == RoomType::SafeRoom);
    dRoom.isLocked     = (type == RoomType::Treasury && floor >= 3);
    dRoom.entryFlavor  = getRoomFlavor(type);
    dRoom.lootTable    = buildLootTable(type, floor);

    // Has an enemy if not an entrance, safe room, or stairs room
    dRoom.hasEnemy = (type != RoomType::Entrance &&
                      type != RoomType::SafeRoom &&
                      type != RoomType::StairsDown &&
                      !dRoom.isCleared);

    // Build the physical room grid
    std::string roomName;
    switch (type) {
        case RoomType::GoblinDen:   roomName = "Goblin Den";       break;
        case RoomType::Armory:      roomName = "Armory";            break;
        case RoomType::Crypt:       roomName = "Crypt";             break;
        case RoomType::Treasury:    roomName = "Treasury Vault";    break;
        case RoomType::BossRoom:    roomName = "Boss Chamber";      break;
        case RoomType::StairsDown:  roomName = "Descent Passage";   break;
        case RoomType::SafeRoom:    roomName = "Rest Chamber";      break;
        default:                    roomName = "Corridor";          break;
    }

    dRoom.roomData = buildBasicRoom(roomName, dRoom.entryFlavor);

    // Add chest if loot table has non-nothing items
    if (!dRoom.lootTable.empty()) {
        addChest(dRoom.roomData, 2, 2);
    }

    // Add stairs marker
    if (type == RoomType::StairsDown) {
        dRoom.roomData.grid[ROOM_ROWS / 2][ROOM_COLS - 2] = TILE_STAIRS;
    }

    return dRoom;
}

// ── Generate a complete dungeon floor ─────────────────────────
DungeonFloor generateFloor(int floorNumber) {
    DungeonFloor floor;
    floor.playerRoomIndex = 0;

    std::vector<RoomType> pool = getRoomPool(floorNumber);
    const int ROOM_COUNT = static_cast<int>(pool.size());

    // Build all rooms
    for (int i = 0; i < ROOM_COUNT; i++) {
        floor.rooms.push_back(buildDungeonRoom(pool[i], floorNumber));
    }

    // Connect rooms in a simple chain with some branches:
    // 0 → 1 → 2 → 3 → 4 → ... → last (boss)
    for (int i = 0; i < ROOM_COUNT - 1; i++) {
        // Connect i (east) → i+1 (west)
        floor.eastConnections[i]   = i + 1;
        floor.westConnections[i+1] = i;

        // Add doors to the room grid
        addEastDoor(floor.rooms[i].roomData);
        addWestDoor(floor.rooms[i+1].roomData);
    }

    // Add some north/south connections for branching (every 3 rooms)
    for (int i = 0; i + 3 < ROOM_COUNT; i += 3) {
        // Connect room i (south) → room i+2 (north) — a shortcut
        if (rand() % 2 == 0) {  // 50% chance of a branch
            floor.southConnections[i]   = i + 2;
            floor.northConnections[i+2] = i;
            addSouthDoor(floor.rooms[i].roomData);
            addNorthDoor(floor.rooms[i+2].roomData);
        }
    }

    // Mark staircase and boss rooms
    floor.stairsRoomIndex = static_cast<int>(pool.size()) - 2;
    floor.bossRoomIndex   = static_cast<int>(pool.size()) - 1;

    return floor;
}
```

---

## Step 5 — Wire Procedural Generation Into the Game

Replace the hardcoded `currentRoom` in `main()` with:

```cpp
int          currentFloor    = 1;
DungeonFloor dungeon          = generateFloor(currentFloor);
int          currentRoomIndex = 0;
DungeonRoom& currentDungeonRoom = dungeon.rooms[currentRoomIndex];
Room&        currentRoom       = currentDungeonRoom.roomData;

// Starting position
hero.position.row = ROOM_ROWS / 2;
hero.position.col = ROOM_COLS / 2;

std::cout << COLOR_YELLOW << "  Floor " << currentFloor << " generated: "
          << dungeon.rooms.size() << " rooms." << COLOR_RESET << std::endl;
std::cout << "  " << currentDungeonRoom.entryFlavor << std::endl;
```

Handle room transitions (when player steps through a door):

```cpp
// In movement handling, after movePlayer:
int newTile = currentRoom.grid[hero.position.row][hero.position.col];

if (newTile == TILE_DOOR_E && dungeon.eastConnections.count(currentRoomIndex)) {
    currentRoomIndex = dungeon.eastConnections[currentRoomIndex];
    currentDungeonRoom = dungeon.rooms[currentRoomIndex];  // ← add this
    currentRoom        = currentDungeonRoom.roomData;       // ← add this
    hero.position.col  = 1;  // enter from the west side of the new room
    hero.position.row  = ROOM_ROWS / 2;
    std::cout << "  You enter: " << currentDungeonRoom.entryFlavor << std::endl;

} else if (newTile == TILE_STAIRS) {
    currentFloor++;
    dungeon          = generateFloor(currentFloor);         // ← add this
    currentRoomIndex = 0;
    currentDungeonRoom = dungeon.rooms[0];                  // ← add this
    currentRoom        = currentDungeonRoom.roomData;       // ← add this
    hero.position = {ROOM_ROWS / 2, ROOM_COLS / 2};
    std::cout << COLOR_CYAN << "  You descend to Floor " << currentFloor << "!" << COLOR_RESET << std::endl;
}
```

### SAVE AND TRY

Compile and run. Play through several rooms.

**You should see:** Each run produces a different room order. Room names and
descriptions change based on type. Some rooms have enemies, some are empty.

**Run twice:** Note the room sequence differs. Run 5 times — note that
floor 1 always starts at "Dungeon Entrance" but the subsequent rooms vary.

**Change something:** Change `getRoomPool` to add 2 more `Treasury` entries.
More treasure rooms will appear. Change it back.

---

## Challenge: The Mini-Map

**You know:** `DungeonFloor`, room connections, cleared state.

**Task:** Write `displayMiniMap(const DungeonFloor& floor, int currentIdx)`
that shows a 1-character-per-room map:
- `?` — not yet visited (unknown)
- `.` — visited and cleared
- `E` — has enemy (visited but not cleared)
- `>` — staircase room
- `B` — boss room
- `@` — current room

Use a horizontal layout: `[.][E][.][?][B]` (rooms in the east-west chain).

---

<details>
<summary>▶ Show Solution</summary>

```cpp
void displayMiniMap(const DungeonFloor& floor, int currentIdx) {
    // Track which rooms the player has visited
    // (For simplicity: cleared rooms are "visited")
    std::cout << "  MAP: ";
    for (int i = 0; i < static_cast<int>(floor.rooms.size()); i++) {
        const DungeonRoom& r = floor.rooms[i];
        std::cout << "[";
        if (i == currentIdx) {
            std::cout << COLOR_CYAN << "@" << COLOR_RESET;
        } else if (r.type == RoomType::BossRoom) {
            std::cout << COLOR_RED << "B" << COLOR_RESET;
        } else if (r.type == RoomType::StairsDown) {
            std::cout << COLOR_GREEN << ">" << COLOR_RESET;
        } else if (!r.isCleared && r.hasEnemy) {
            std::cout << COLOR_YELLOW << "E" << COLOR_RESET;
        } else if (r.isCleared) {
            std::cout << ".";
        } else {
            std::cout << "?";  // not yet visited
        }
        std::cout << "]";
    }
    std::cout << std::endl;
}
```

**Key insight:** The mini-map is derived entirely from the `DungeonFloor`
data — no separate "map state" is needed. Cleared rooms show as `.`, rooms
with enemies as `E`. This is an example of "computed display" — the display
is a pure function of the current game state. You can always call it and
get an accurate map because the game state is the single source of truth.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Floor generates on game start | See "Floor 1 generated: N rooms" message |
| Room order differs between runs | Run twice — see different room sequences |
| Moving through east door changes room | Walk through `E` door — see new room description |
| Enemy present in GoblinDen rooms | Navigate to a GoblinDen — encounter triggers |
| Loot table rolls differ between runs | Open chests in same room type — different items |
| Staircase descends to floor 2 | Reach staircase, step on it — see "Floor 2" message |
| Floor 2 generates harder enemies | Reach floor 3 — see Goblin Elite instead of Scout |
| Safe rooms have no enemies | Enter SafeRoom — no encounter triggered |

---

## Quick Check Answers

**1. What is a "seed" in procedural generation?**
A seed is the starting value for the random number generator. Because
`rand()` is deterministic (same inputs → same outputs), giving it the same
starting seed always produces the same sequence of "random" numbers, which
means the same dungeon layout, same enemy stats, same loot drops. Using
`srand(time(nullptr))` gives a different seed each second, producing a
different dungeon every run. Seeding with a fixed number (like `srand(42)`)
would produce the same dungeon every run — useful for testing or
"provably fair" game designs where players can replay the same dungeon.

**2. What is a loot table and how does probability work in one?**
A loot table is a list of possible rewards paired with weights (relative
probabilities). To roll it: sum all weights, pick a random number in
[1, total], then walk through entries accumulating weights until you exceed
the random number — that entry wins. Higher weight = more likely. A table
with entries {weight=30, weight=20, weight=50} has a 30%, 20%, 50% distribution.
This lets you balance "common drops" (potions, gold) vs "rare drops" (legendary
weapons) by adjusting weights without changing any game logic.

**3. How do you store room connections, and what data structure is best?**
Room connections map a room's index to its neighbor's index in each cardinal
direction. `std::map<int, int>` per direction (e.g., `eastConnections`) works
well: `eastConnections[2] = 3` means "room 2's east exit leads to room 3."
Looking up `eastConnections.count(roomIdx)` checks if a connection exists
without throwing an exception. An alternative is a `Room` struct with four
`int` neighbor fields (`northRoom`, `southRoom`, `-1` = no exit), which is
simpler but harder to iterate. For a dungeon with 8–12 rooms, either works;
for 1000+ rooms, the `map` approach scales better.
