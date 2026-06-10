# C++ Space Invaders — LAB 6 — Shields (Destructible Barriers)

**Prerequisites:**

*   LAB 5 — Invader bullets, player lives, RNG, cooldowns
*   You have bullets moving both directions and collision helpers

**What this lab adds:**

*   Shields between player and invaders
*   Shields absorb bullets instead of passing through
*   Shields degrade piece‑by‑piece
*   Both player and invader bullets damage shields
*   No new rendering system — same board, same loop

***

## What You Will Build

You will see shields like this:

    ############################
    #............W.W.W.W......#
    #..........................#
    #....###......###......###.#
    #....###......###......###.#
    #.............^............#
    ############################

After repeated hits, they degrade:

    #....#.#......##.......#..#

Shields are **not sprites**, **not magic**, and **not special‑case code** — they are *data*.

***

## Quick Check (before reading)

1.  **Prediction:** Why should shields *not* be part of the main board array permanently?
2.  **C++:** Why model shields as many small blocks instead of a single rectangle?
3.  **Software Engineering:** Why should bullets stop at the first solid object they hit?

(Answers at the end)

***

## Concept Blocks (before any new code)

***

### Concept: Pattern — Tile Object List

**Name:** Tile Object List  
**Category:** Game architecture (non‑GoF)

**What it is:**  
A list of small, destructible world objects (tiles) with position and durability.

**Used for:**

*   Shields
*   Later: bunkers, walls, terrain, collectibles

**Tradeoff:**  
More objects to track — acceptable at small scale.

**You will see this again in:**

*   LAB 7 when we add game states and reset logic
*   LAB 8 when shields persist across waves

***

### Concept: Damage State (Game + SWE)

**What it is:**  
Each shield tile has hit points (HP).

**The problem before:**  
Binary states (exists / not exists) make the game feel flat.

**The solution:**  
Store `health` per tile. Decrement on hit. Remove when 0.

**Minimal example:**

```cpp
struct ShieldTile {
  int x, y;
  int hp;
};
```

***

### Concept: Collision Priority

**Rule:**

> A bullet hits the *first* solid thing in its path.

**Why:**

*   Prevents bullets from passing through shields
*   Matches player intuition
*   Prevents double collisions in one tick

**Engineering principle:**  
Resolve **closest collision only**, then stop.

***

### Law 2 Mapping (Terminal)

Law 2 (“Visible before styled”) maps here as:

> Show shield blocks **before** making them interact.

You’ll see shields before they take damage.

***

## Step 1 — Represent shield tiles (no behavior yet)

**Focus:**

*   C++ struct
*   Entity‑list pattern reuse
*   Visible output first

Add constants:

```cpp
const char shieldChar = '#';
const int shieldTileHP = 3;
```

Add struct:

```cpp
struct ShieldTile {
    int x;
    int y;
    int hp;
};
```

Add state near other entity lists:

```cpp
std::vector<ShieldTile> shields;
```

Create a helper to build shields:

```cpp
void createShields(std::vector<ShieldTile>& shields) {
    shields.clear();

    const int shieldY = boardHeight - 4;
    const int shieldWidth = 3;
    const int spacing = 6;

    for (int s = 0; s < 3; ++s) {
        int startX = 4 + s * spacing;

        for (int dx = 0; dx < shieldWidth; ++dx) {
            for (int dy = 0; dy < 2; ++dy) {
                shields.push_back(ShieldTile{
                    startX + dx,
                    shieldY + dy,
                    shieldTileHP
                });
            }
        }
    }
}
```

Call it once in `main()` startup.

Render shields (after board creation):

```cpp
for (const ShieldTile& t : shields) {
    board[t.y][t.x] = shieldChar;
}
```

***

### SAVE AND TRY (Step 1)

Rebuild and run.

✅ Shields appear.  
✅ Nothing breaks.

**Terminal verification:**

```bash
./invaders --selftest
```

Optional extension:

```cpp
std::cout << "shieldTiles=" << shields.size() << "\n";
```

***

## Step 2 — Bullet vs shield collision (detect only)

**Focus:**

*   Pure collision detection
*   Reusable logic

Add helper:

```cpp
int findShieldAt(const std::vector<ShieldTile>& shields, int x, int y) {
    for (size_t i = 0; i < shields.size(); ++i) {
        if (shields[i].x == x && shields[i].y == y) {
            return static_cast<int>(i);
        }
    }
    return -1;
}
```

✅ No behavior change yet.

***

### SAVE AND TRY (Step 2)

Rebuild and run.

✅ Shields still render correctly.

***

## Step 3 — Apply bullet damage to shields

**Focus:**

*   Mutating entities safely
*   Collision priority

Add function:

```cpp
bool applyShieldHit(
    std::vector<ShieldTile>& shields,
    int bulletX,
    int bulletY
) {
    int index = findShieldAt(shields, bulletX, bulletY);
    if (index == -1) return false;

    shields[index].hp -= 1;
    if (shields[index].hp <= 0) {
        shields.erase(shields.begin() + index);
    }
    return true;
}
```

***

## Step 4 — Stop bullets at shields

### Player bullets

In your player‑bullet update loop, before invader collision:

```cpp
for (size_t i = 0; i < bullets.size(); ++i) {
    if (applyShieldHit(shields, bullets[i].x, bullets[i].y)) {
        bullets.erase(bullets.begin() + i);
        break;
    }
}
```

### Invader bullets

Similarly:

```cpp
for (size_t i = 0; i < invaderBullets.size(); ++i) {
    if (applyShieldHit(shields, invaderBullets[i].x, invaderBullets[i].y)) {
        invaderBullets.erase(invaderBullets.begin() + i);
        break;
    }
}
```

***

### SAVE AND TRY (Step 4)

Run the game.

✅ Bullets disappear when hitting shields  
✅ Shields degrade visibly  
✅ Bullets do not pass through

***

## Step 5 — HUD + selftest verification

Add to HUD:

```cpp
std::cout << " | Shields: " << shields.size();
```

Add to `runSelfTest()`:

```cpp
std::cout << "shieldTileHP=" << shieldTileHP << "\n";
std::cout << "initialShieldTiles=" << (3 * 3 * 2) << "\n";
```

### SAVE AND TRY

```bash
./invaders --selftest
```

✅ Deterministic diagnostics  
✅ No guessing

***

## Final Check

| Feature                        | Verify                        |
| ------------------------------ | ----------------------------- |
| Shields render                 | Visible at start              |
| Bullets stop                   | Bullet disappears on hit      |
| Shields degrade                | Tiles vanish after HP → 0     |
| Both bullet types apply damage | Player & enemy bullets tested |
| No double hits                 | One collision per bullet      |
| Selftest validates             | `./invaders --selftest`       |

***

## Quick Check Answers

**1. Why not store shields directly in the board?**  
Because the board is *derived output*. Shields are game state that changes over time.

**2. Why many tiles instead of one block?**  
Because partial damage requires partial representation. One object = no granularity.

**3. Why stop at first collision?**  
To enforce physical intuition, prevent double damage, and keep logic deterministic.

***

## What You Learned (LAB 6)

### C++

*   Structs with internal state
*   Safe vector erasure
*   Data‑driven rendering

### Software Engineering

*   Tile object pattern
*   Collision priority
*   Derived vs authoritative state
*   Reusable collision helpers

### Game Design

*   Defensive pacing
*   Risk‑mitigation mechanics
*   Visual feedback loops

***

