# C++ Terminal RPG — LAB 10 — The First Room

**Prerequisites:** LAB 09. You have the inventory system, character struct,
and ANSI colors.

**What this lab adds:**
- A 2D array representing a dungeon room
- ASCII art room display with walls, floor, and the player marker
- N/S/E/W movement within a room with wall collision

**Time:** 60–75 minutes

---

## What You Will Build

The `[L]ook` command now renders a proper room:

```
  ┌─────────────────────────────┐
  │  Room: Goblin Den           │
  └─────────────────────────────┘

  ████████████████████
  █  ·  ·  ·  ·  N  █    N = North exit
  █  ·  ·  ·  ·  |  █
  █  ·  ·  @  ·  ·  █    @ = You
  █  +  ·  ·  ·  ·  █    + = Chest
  █  ·  ·  ·  E──   █    E = East exit
  ████████████████████

  Exits: [N]orth  [E]ast
  Move: [W]←  [A]↑  [S]↓  [D]→
  > n
```

---

> **Quick Check — try to answer before reading:**
> 1. What does `int room[5][5]` declare? How do you access the element at
>    row 2, column 3?
> 2. What is a 2D array's memory layout — row-major or column-major? Why
>    does this matter for performance?
> 3. Prediction: if your room is 5×5 and the player is at row 2, column 4
>    (rightmost valid position), what should happen when they move East?
> *(Answers at the end of this lab)*

---

## Concept: 2D Arrays — The Room Grid

**What it is:** An array of arrays. `int grid[ROWS][COLS]` creates a grid
with `ROWS` rows and `COLS` columns. Access is `grid[row][col]`.

**The problem before:**
```cpp
// Describing a room as 25 individual variables:
int cell00 = WALL, cell01 = WALL, cell02 = WALL, ...;
// Impossible to draw, iterate, or reason about
```

**The solution:**
```cpp
// 5×5 room grid — each cell is a tile type
int room[5][5] = {
    {1, 1, 1, 1, 1},  // row 0 — top wall
    {1, 0, 0, 0, 1},  // row 1 — floor with walls
    {1, 0, 0, 0, 1},  // row 2 — floor
    {1, 0, 0, 0, 1},  // row 3 — floor
    {1, 1, 1, 1, 1},  // row 4 — bottom wall
};
// room[2][2] = center cell (floor)
// room[0][0] = top-left corner (wall)
```

**Canonical example (General Explanation):**
A spreadsheet — `grid[row][col]` is exactly like a cell address (row 2,
column C). Each cell holds one value. The outer index picks the row; the inner
index picks the column within that row. A 3×3 "mini spreadsheet":
```cpp
const int ROWS = 3;
const int COLS = 3;
int sheet[ROWS][COLS] = {
    {1, 2, 3},   // row 0
    {4, 5, 6},   // row 1
    {7, 8, 9},   // row 2
};
std::cout << sheet[1][2] << std::endl;  // 6  (row 1, col 2)
```
Why obvious: "row then column" maps directly to how you read a table —
same mental model as "row 1, column 2" in any grid.

**Project Application (The "Why" here):**
The dungeon room is a grid of integer tile codes. `room.grid[row][col]` holds
a value like `TILE_WALL` or `TILE_CHEST`. The player has a `Position {row, col}`
that changes with each movement command. `drawRoom` loops over every `[row][col]`
and prints the matching character — the 2D array IS the room state. No separate
"wall list" or "object list" needed; the grid holds everything.

**Smallest possible example:**
```cpp
const int ROWS = 3;
const int COLS = 3;
int grid[ROWS][COLS] = {
    {1, 1, 1},
    {1, 0, 1},
    {1, 1, 1},
};

for (int row = 0; row < ROWS; row++) {
    for (int col = 0; col < COLS; col++) {
        std::cout << (grid[row][col] == 1 ? "#" : " ");
    }
    std::cout << std::endl;
}
// Prints:
// ###
// # #
// ###
```

**Why it matters here:** The dungeon room is a grid of tiles. The player has
a row/column position that updates with each movement command.

**Watch for:** Array indexing is `[row][col]` (row first). This maps to
`[y][x]` in screen coordinates — the OPPOSITE of cartesian `(x,y)`. This
causes bugs when you write `grid[x][y]` instead of `grid[y][x]`.

---

## Concept: Tile Types and `enum class`

**What it is:** Using an `enum class` to represent tile types makes the
grid readable and type-safe.

**The problem before:**
```cpp
// Magic numbers — what does 3 mean?
int room[5][5] = {{1,1,1},{1,0,1},{1,3,1},{1,0,1},{1,1,1}};
```

**The solution:**
```cpp
enum class Tile {
    Wall   = 0,  // solid wall — blocks movement
    Floor  = 1,  // walkable floor
    Door   = 2,  // exit to another room
    Chest  = 3,  // treasure chest
    Stairs = 4,  // descend to next floor
};
```

And the grid uses `int` (since arrays can't hold enum classes directly
without more verbosity), but constants give the values names:

```cpp
const int TILE_WALL   = 0;
const int TILE_FLOOR  = 1;
const int TILE_DOOR_N = 2;
const int TILE_DOOR_S = 3;
const int TILE_DOOR_E = 4;
const int TILE_DOOR_W = 5;
const int TILE_CHEST  = 6;
const int TILE_STAIRS = 7;
const int TILE_ENEMY  = 8;
```

**Canonical example (General Explanation):**
A color-coded map legend — instead of remembering "blue = 3, green = 1, red = 0,"
you write `TILE_WATER = 3`, `TILE_GRASS = 1`, `TILE_MOUNTAIN = 0`. The
underlying array still holds integers, but every read and write uses the
named constant. Anyone reading the code knows `TILE_WALL` means wall without
checking a lookup table.
```cpp
const int TILE_WALL  = 0;
const int TILE_FLOOR = 1;
int grid[3][3] = {
    {TILE_WALL,  TILE_WALL,  TILE_WALL},
    {TILE_WALL,  TILE_FLOOR, TILE_WALL},
    {TILE_WALL,  TILE_WALL,  TILE_WALL},
};
if (grid[1][1] == TILE_FLOOR) {
    std::cout << "Center is walkable." << std::endl;
}
```
Why obvious: named constants make every condition self-documenting — `== TILE_WALL`
reads as a sentence, `== 0` does not.

**Project Application (The "Why" here):**
Every collision check (`if (targetTile == TILE_WALL)`), every display branch
(`if (tile == TILE_CHEST)`), and every door detection (`if (room.hasNorth)`)
uses these constants. If the value of `TILE_WALL` ever needs to change (e.g.,
you add a new tile type and need to renumber), one edit to the constant updates
the entire codebase automatically.

---

## Step 1 — Room Struct and Tile Constants

Add after the `Item` struct:

```cpp
// ── Tile constants ────────────────────────────────────────────
const int TILE_WALL    = 0;  // solid wall
const int TILE_FLOOR   = 1;  // walkable floor
const int TILE_DOOR_N  = 2;  // north exit
const int TILE_DOOR_S  = 3;  // south exit
const int TILE_DOOR_E  = 4;  // east exit
const int TILE_DOOR_W  = 5;  // west exit
const int TILE_CHEST   = 6;  // treasure chest
const int TILE_STAIRS  = 7;  // stairs to next floor
const int TILE_ENEMY   = 8;  // enemy marker (visible on map)

// ── Room dimensions ───────────────────────────────────────────
const int ROOM_ROWS = 7;   // rows (height)
const int ROOM_COLS = 10;  // columns (width)

// ── Room struct ───────────────────────────────────────────────
struct Room {
    std::string name;
    std::string description;
    int         grid[ROOM_ROWS][ROOM_COLS];  // tile map
    bool        hasNorth;  // true if north exit exists
    bool        hasSouth;
    bool        hasEast;
    bool        hasWest;
    bool        hasEnemy;     // enemy present in this room
    bool        isCleared;    // all enemies defeated
};

// ── Player position struct ────────────────────────────────────
struct Position {
    int row;
    int col;
};
```

Add `Position position;` to the `Character` struct.

### SAVE AND TRY

```bash
g++ -std=c++17 -o dungeon main.cpp && echo "Room struct OK"
```

---

## Step 2 — Room Creation Functions

Add:

```cpp
// ── Build a basic rectangular room ────────────────────────────
// All edges are walls; interior is floor
Room buildBasicRoom(const std::string& name, const std::string& description) {
    Room room;
    room.name        = name;
    room.description = description;
    room.hasNorth    = false;
    room.hasSouth    = false;
    room.hasEast     = false;
    room.hasWest     = false;
    room.hasEnemy    = false;
    room.isCleared   = true;

    // Fill all tiles with walls first
    for (int row = 0; row < ROOM_ROWS; row++) {
        for (int col = 0; col < ROOM_COLS; col++) {
            room.grid[row][col] = TILE_WALL;
        }
    }

    // Carve out the interior as floor (leave 1-tile border of walls)
    for (int row = 1; row < ROOM_ROWS - 1; row++) {
        for (int col = 1; col < ROOM_COLS - 1; col++) {
            room.grid[row][col] = TILE_FLOOR;
        }
    }

    return room;
}

// ── Add doors (exits) to a room ───────────────────────────────
void addNorthDoor(Room& room) {
    room.hasNorth = true;
    // Place door in the middle of the north wall
    room.grid[0][ROOM_COLS / 2] = TILE_DOOR_N;
}

void addSouthDoor(Room& room) {
    room.hasSouth = true;
    room.grid[ROOM_ROWS - 1][ROOM_COLS / 2] = TILE_DOOR_S;
}

void addEastDoor(Room& room) {
    room.hasEast = true;
    room.grid[ROOM_ROWS / 2][ROOM_COLS - 1] = TILE_DOOR_E;
}

void addWestDoor(Room& room) {
    room.hasWest = true;
    room.grid[ROOM_ROWS / 2][0] = TILE_DOOR_W;
}

// ── Place a chest in the room ──────────────────────────────────
void addChest(Room& room, int row, int col) {
    if (row > 0 && row < ROOM_ROWS - 1 && col > 0 && col < ROOM_COLS - 1) {
        room.grid[row][col] = TILE_CHEST;
    }
}

// ── Get the character for a tile ─────────────────────────────
char getTileChar(int tile) {
    switch (tile) {
        case TILE_WALL:   return '#';
        case TILE_FLOOR:  return '.';
        case TILE_DOOR_N: return 'N';
        case TILE_DOOR_S: return 'S';
        case TILE_DOOR_E: return 'E';
        case TILE_DOOR_W: return 'W';
        case TILE_CHEST:  return '+';
        case TILE_STAIRS: return '>';
        case TILE_ENEMY:  return 'G';  // G for goblin/generic enemy
        default:          return '?';
    }
}
```

---

## Step 3 — Draw the Room

Add:

```cpp
// ── Draw the room with the player at the given position ────────
void drawRoom(const Room& room, const Position& playerPos) {
    std::cout << std::endl;
    std::cout << "  " << COLOR_YELLOW << "Room: " << room.name << COLOR_RESET << std::endl;
    std::cout << std::endl;

    for (int row = 0; row < ROOM_ROWS; row++) {
        std::cout << "  ";
        for (int col = 0; col < ROOM_COLS; col++) {
            // Player position overrides the tile display
            if (row == playerPos.row && col == playerPos.col) {
                std::cout << COLOR_CYAN << "@" << COLOR_RESET;
            } else {
                int tile = room.grid[row][col];
                if (tile == TILE_WALL) {
                    std::cout << COLOR_DARK << "#" << COLOR_RESET;
                } else if (tile == TILE_CHEST) {
                    std::cout << COLOR_YELLOW << "+" << COLOR_RESET;
                } else if (tile == TILE_STAIRS) {
                    std::cout << COLOR_GREEN << ">" << COLOR_RESET;
                } else if (tile == TILE_ENEMY) {
                    std::cout << COLOR_RED << "G" << COLOR_RESET;
                } else if (tile == TILE_DOOR_N || tile == TILE_DOOR_S ||
                           tile == TILE_DOOR_E || tile == TILE_DOOR_W) {
                    std::cout << COLOR_MAGENTA << getTileChar(tile) << COLOR_RESET;
                } else {
                    std::cout << ".";  // plain floor
                }
            }
        }
        std::cout << std::endl;
    }

    // Show exits
    std::cout << std::endl;
    std::cout << "  Exits:";
    if (room.hasNorth) std::cout << " [N]orth";
    if (room.hasSouth) std::cout << " [S]outh";
    if (room.hasEast)  std::cout << " [E]ast";
    if (room.hasWest)  std::cout << " [W]est";
    std::cout << std::endl;
    std::cout << "  " << room.description << std::endl;
}
```

---

## Step 4 — Movement with Wall Collision

Add:

```cpp
// ── Try to move the player in a direction ────────────────────
// Returns true if the move was valid (not into a wall)
bool movePlayer(const Room& room, Position& playerPos, char direction) {
    int newRow = playerPos.row;
    int newCol = playerPos.col;

    switch (direction) {
        case 'w': case 'W': newRow--; break;  // North (up on screen)
        case 's': case 'S': newRow++; break;  // South (down on screen)
        case 'a': case 'A': newCol--; break;  // West (left on screen)
        case 'd': case 'D': newCol++; break;  // East (right on screen)
        default: return false;
    }

    // Bounds check — stay within the grid
    if (newRow < 0 || newRow >= ROOM_ROWS || newCol < 0 || newCol >= ROOM_COLS) {
        std::cout << "  The dungeon wall blocks your path." << std::endl;
        return false;
    }

    // Tile collision — cannot walk through walls
    int targetTile = room.grid[newRow][newCol];
    if (targetTile == TILE_WALL) {
        std::cout << "  A solid stone wall bars your way." << std::endl;
        return false;
    }

    // Move is valid — update position
    playerPos.row = newRow;
    playerPos.col = newCol;
    return true;
}
```

---

## Step 5 — Wire It Into the Game Loop

In `createCharacter()`, add the starting position at the end of the function,
after the existing stat-setup code:

```cpp
hero.position.row = ROOM_ROWS / 2;  // ← add this — start in the center
hero.position.col = ROOM_COLS / 2;  // ← add this
```

Before `main()`'s game loop, create the starting room. Add these lines just
before the `while (running)` loop:

```cpp
// ── Starting room ─────────────────────────────────────────────
Room currentRoom = buildBasicRoom(                           // ← add this
    "Dungeon Entrance",
    "You stand at the dungeon's threshold. Torches flicker."
);
addNorthDoor(currentRoom);                                   // ← add this
addEastDoor(currentRoom);                                    // ← add this
addChest(currentRoom, 2, 2);  // chest at row 2, col 2      // ← add this
```

In the game loop's `if/else if` command chain, update the `[L]ook` handler
and add movement commands. The existing `[L]ook` branch becomes:

```cpp
} else if (command == 'l' || command == 'L') {
    drawRoom(currentRoom, hero.position);        // ← was: your old look message

} else if (command == 'w' || command == 'W' ||  // ← add this block
           command == 's' || command == 'S' ||
           command == 'a' || command == 'A' ||
           command == 'd' || command == 'D') {
    movePlayer(currentRoom, hero.position, command);  // ← add this
    drawRoom(currentRoom, hero.position);             // ← add this
```

Update the menu prompt line to advertise movement controls. Find the existing
`std::cout` that prints the menu, and extend it:

```cpp
std::cout << "  [W/A/S/D] Move   [L]ook   [I]nventory   [H]eal   [Q]uit" << std::endl;
// ← was: std::cout << "  [L]ook   [I]nventory   [H]eal   [Q]uit" << std::endl;
```

### SAVE AND TRY

Compile and run. After character creation, type `l`.

**You should see:** The room grid with `@` in the center, `#` for walls,
`+` for chest, `N` and `E` for exits.

**Type movement commands:**
- `w` — move north (up)
- `s` — move south (down)
- `a` — move west (left)
- `d` — move east (right)

Walk into a wall: `"A solid stone wall bars your way."`

**Change something:** Change `ROOM_ROWS` from `7` to `9` and `ROOM_COLS`
from `10` to `14`. Recompile. See a larger room. Change back.

---

## Challenge: Step on a Chest

**You know:** `Position`, `room.grid[row][col]`, `addToInventory`.

**Task:** When the player steps onto a `TILE_CHEST` tile:
1. Print a message: `"You open the chest!"`
2. Add a health potion to the inventory
3. Replace the chest tile with `TILE_FLOOR` (chest is now empty)

---

<details>
<summary>▶ Show Solution</summary>

In the game loop, update the movement block so `movePlayer`'s return value is
captured and checked:

```cpp
} else if (command == 'w' || command == 'W' ||
           command == 's' || command == 'S' ||
           command == 'a' || command == 'A' ||
           command == 'd' || command == 'D') {
    bool moved = movePlayer(currentRoom, hero.position, command);  // ← was: movePlayer(...);
    if (moved) {
        // Check what we stepped on
        int tile = currentRoom.grid[hero.position.row][hero.position.col];
        if (tile == TILE_CHEST) {                                       // ← add this block
            std::cout << "  You open the chest! You find a Health Potion." << std::endl;
            addToInventory(hero, makeHealthPotion());
            // Replace chest tile with floor — chest is now looted
            currentRoom.grid[hero.position.row][hero.position.col] = TILE_FLOOR;
        }
        drawRoom(currentRoom, hero.position);
    }
```

**Key insight:** The tile the player occupies is a readable value —
`currentRoom.grid[hero.position.row][hero.position.col]` gives the current
tile type. Changing it to `TILE_FLOOR` after looting is the simplest form
of persistent room state: the grid itself IS the state. No separate "is this
chest looted?" flag needed.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Room renders with `#` walls and `.` floor | Type `l` — see room grid |
| `@` is the player | See `@` at center of room |
| `+` is the chest | See yellow `+` at position 2,2 |
| Movement updates `@` position | Press `w` — `@` moves up one row |
| Wall collision blocks movement | Press `a` until hitting wall — see message |
| North/East exits show colored N/E | See magenta N and E markers |
| Chest disappears after looting | Step on `+` — becomes `.`, item added |

---

## Quick Check Answers

**1. What does `int room[5][5]` declare, and how do you access row 2, col 3?**
It declares a 2D array: 5 rows, each containing 5 integers. Total: 25 integers.
Access is `room[2][3]` — row index 2 (third row, zero-indexed), column index 3
(fourth column). Memory layout: `room[0][0]` through `room[0][4]` are contiguous
in memory, then `room[1][0]` through `room[1][4]`, etc. (row-major order).

**2. What is row-major order, and why does it matter for performance?**
In row-major order, all elements of row 0 are stored before row 1, row 1 before
row 2, etc. This means iterating `for row for col` (inner loop over columns)
is cache-friendly: adjacent iterations access adjacent memory addresses. Iterating
`for col for row` (inner loop over rows) jumps between non-adjacent memory
addresses — each access is likely a cache miss. For a 7×10 room this doesn't
matter, but for a 1000×1000 game world map, loop order matters significantly.

**3. Player at row 2, col 4 in a 5×5 grid — move East — what should happen?**
It depends on whether col 4 is a wall. In a basic rectangular room with 1-tile
wall borders, col 4 is the east wall (index 4 in a 0–4 range). The target
position (row 2, col 5) is out of bounds (columns are 0–4). The bounds check
`newCol >= ROOM_COLS` triggers: `"The dungeon wall bars your path."` The
player does not move. In a room where col 4 has an exit door (`TILE_DOOR_E`),
reaching it would trigger room transition logic (Lab 12+).
