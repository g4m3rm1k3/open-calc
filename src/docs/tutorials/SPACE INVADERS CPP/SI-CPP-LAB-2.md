# C++ Space Invaders — LAB 2 — Bullets (Player Fires)

**Prerequisites:**

*   LAB 1 — Board, player movement, invader formation
*   You understand `struct`, `std::vector`, simple loops, and functions

**What this lab adds:**

*   A bullet fired by the player
*   Bullet movement each turn
*   Bullet removal when it leaves the board

**Time:** 60–90 minutes (this is a *thinking* lab)

***

## What You Will Build

When this lab is complete, your game looks like this **after firing**:

    ############################
    #............W.W.W.W......#
    #............W.W.W.W......#
    #............W.W.W.W......#
    #...............|.........#
    #.............^...........#
    ############################
    Commands: a=left, d=right, f=fire, enter=wait, q=quit
    >

*   `^` is the player
*   `|` is a bullet moving upward
*   Press `f` to fire
*   Bullet moves each turn
*   Bullet disappears cleanly when it goes offscreen

No collisions yet. One clean feature.

***

## Quick Check — answer before reading:

1.  **Prediction:** Why would storing *only one bullet* as `(x, y)` be limiting?
2.  **C++:** Why might `std::vector<Bullet>` be safer than `Bullet bullets[100]`?
3.  **Software Engineering:** Why should bullet removal be a *separate step* from bullet movement?

*(Answers at the end of this lab)*

***

# Concept Blocks (before any bullet code)

***

### Concept: `struct` as a “data record” (C++)

**What it is:**  
A `struct` groups related values into one named type.

**The problem before:**  
If you store bullet data as loose variables (`bulletX`, `bulletY`), things fall apart when you add a second bullet.

**The solution:**  
Define a `Bullet` type.

**Smallest possible example:**

```cpp
struct Bullet {
    int x;
    int y;
};
```

**Why it matters here:**  
Bullets are entities. Each one has position. This scales naturally.

**Watch for:**  
Using `struct` for behavior — *structs hold data; functions operate on them.*

***

### Concept: Entity List (Software Engineering Mental Model)

**What it is:**  
A list of objects representing things in the game world.

**The problem before:**  
Hard‑coding a single bullet means rewriting everything later.

**The solution:**  
Store bullets in `std::vector<Bullet>`.

**Smallest possible example:**

```cpp
std::vector<Bullet> bullets;
bullets.push_back(Bullet{10, 5});
```

**Why it matters here:**  
This is the same pattern used for enemies, particles, pickups, etc.

**Watch for:**  
Forgetting that vectors can grow and shrink — design for removal.

***

### Concept: Bullet Lifecycle (Game Design)

**What it is:**  
A bullet has a clear lifetime:

1.  Spawn
2.  Move
3.  Despawn

**The problem before:**  
If you never remove bullets, the game state fills with junk.

**The solution:**  
Handle lifecycle explicitly.

**Why it matters here:**  
This is the *simplest version of object lifetime management*.

**Watch for:**  
Trying to do spawn + move + delete all in one tangled function.

***

### Concept: Single Responsibility (Software Engineering)

**What it is:**  
A function should do one thing only.

**The problem before:**  
One “doEverythingWithBullets” function becomes unreadable.

**The solution:**

*   One function to spawn bullets
*   One to move bullets
*   One to clean them up

**Why it matters here:**  
You can test each step independently.

**Watch for:**  
Functions growing without you noticing — refactor early.

***

# Step 1 — Represent bullets (no behavior yet)

**This step focuses on:**

*   **C++:** `struct`, `std::vector`
*   **Software Engineering:** modeling game entities as data
*   **Game:** nothing moves yet — we’re preparing cleanly

Add near your other structs:

```cpp
struct Bullet {
    int x;
    int y;
};

const char bulletChar = '|';
```

Add this state near `main()` setup:

```cpp
std::vector<Bullet> bullets;
```

Update rendering (inside your loop, before `renderBoard`):

```cpp
for (const Bullet& bullet : bullets) {
    board[bullet.y][bullet.x] = bulletChar;
}
```

### SAVE AND TRY

Rebuild and run.

**You should see:**  
Nothing new yet — and that’s correct.

**Why this is okay:**  
We added *representation*, not behavior. The game still runs.

**Change something:**  
Change `bulletChar` to `'*'`. Rebuild. (Still invisible — expected.)

✅ This step passes Law 1: runnable immediately.

***

## 🎯 Challenge: Explain why bullets are rendered AFTER invaders

**Task:**  
Answer in your own words: what would happen if a bullet shares a cell with an invader later?

*(No code — this is a thinking challenge.)*

**Key insight (after thinking):**  
Later, bullets should visually overwrite enemies when they collide. Draw order matters.

***

# Step 2 — Spawn a bullet when the player fires

**This step focuses on:**

*   **C++:** functions, passing vectors by reference
*   **Software Engineering:** explicit spawn logic
*   **Game:** the player can shoot

***

### Concept: Pass-by-reference for modifying state (C++)

**What it is:**  
Passing a variable with `&` lets a function modify it.

**The problem before:**  
If you pass `bullets` by value, changes are lost.

**The solution:**  
Pass `std::vector<Bullet>&`.

**Smallest possible example:**

```cpp
void addBullet(std::vector<Bullet>& bullets) {
    bullets.push_back(Bullet{0, 0});
}
```

**Why it matters here:**  
Spawning bullets must change game state.

**Watch for:**  
Accidentally copying large vectors.

***

Add this function:

```cpp
void tryFireBullet(std::vector<Bullet>& bullets, const Pos& playerPos) {
    Bullet newBullet;
    newBullet.x = playerPos.x;
    newBullet.y = playerPos.y - 1; // spawn above the player

    bullets.push_back(newBullet);
}
```

Update input handling in `main()`:

```cpp
if (command == "f") {
    tryFireBullet(bullets, playerPos);
}
```

### SAVE AND TRY

Rebuild and run.

**You should see:**  
When you press `f`, a `|` appears above the player.

**Important:**  
It does NOT move yet. That’s intentional.

**Change something:**  
Change spawn `y` to `playerPos.y - 2`. Bullet appears higher.

***

## 🎯 Challenge: Prevent firing into the wall

**You know:**  
Top playable row is `y == 1`.

**Task:**  
Do not spawn a bullet if `playerPos.y - 1 <= 0`.

Try for 5 minutes.

***

<details>
<summary>▶ Show Solution</summary>

```cpp
void tryFireBullet(std::vector<Bullet>& bullets, const Pos& playerPos) {
    const int topPlayableRow = 1;

    int spawnY = playerPos.y - 1;
    if (spawnY <= topPlayableRow) {
        return;
    }

    bullets.push_back(Bullet{ playerPos.x, spawnY });
}
```

**Key insight:**  
Guard conditions simplify logic and prevent impossible states.

</details>

***

# Step 3 — Move bullets upward each turn

**This step focuses on:**

*   **C++:** loops over vectors by reference
*   **Software Engineering:** update phase isolation
*   **Game:** bullets move

***

### Concept: Mutating elements inside a vector (C++)

**What it is:**  
Iterating with `Bullet&` allows modification.

**The problem before:**  
Using `const Bullet&` prevents movement.

**The solution:**  
Use mutable references.

**Smallest possible example:**

```cpp
for (Bullet& b : bullets) {
    b.y -= 1;
}
```

**Why it matters here:**  
Movement is state mutation.

**Watch for:**  
Mixing read-only loops and mutating loops accidentally.

***

Add this function:

```cpp
void moveBulletsUp(std::vector<Bullet>& bullets) {
    for (Bullet& bullet : bullets) {
        bullet.y -= 1;
    }
}
```

Call it each loop:

```cpp
moveBulletsUp(bullets);
```

### SAVE AND TRY

Rebuild and run.

**You should see:**  
Bullets move upward each turn.

**Test:**  
Fire a bullet, press Enter repeatedly.

**Change something:**  
Change `bullet.y -= 1` to `-= 2`. Bullet moves faster.

***

## 🎯 Challenge: Why don’t bullets move only when `f` is pressed?

**Answer in words first.**

**Key insight:**  
Movement belongs in the update phase, not the input phase.

***

# Step 4 — Remove bullets that leave the screen

**This step focuses on:**

*   **C++:** vector cleanup with logic
*   **Software Engineering:** lifecycle completion
*   **Game:** bullets don’t accumulate forever

***

### Concept: “Cleanup pass” (Software Engineering)

**What it is:**  
A dedicated step to remove invalid objects.

**The problem before:**  
Offscreen bullets still exist invisibly.

**The solution:**  
Erase bullets whose `y` is outside play space.

**Why it matters here:**  
Unbounded growth breaks games and programs.

***

### Concept: `erase/remove_if` (C++)

**What it is:**  
A standard library pattern to delete items from a vector.

**Smallest possible example:**

```cpp
v.erase(
  std::remove_if(v.begin(), v.end(), predicate),
  v.end()
);
```

**Watch for:**  
Forgetting `#include <algorithm>`.

***

Add include:

```cpp
#include <algorithm>
```

Add cleanup function:

```cpp
void removeOffscreenBullets(std::vector<Bullet>& bullets) {
    const int topPlayableRow = 1;

    bullets.erase(
        std::remove_if(
            bullets.begin(),
            bullets.end(),
            const Bullet& bullet {
                return bullet.y <= topPlayableRow;
            }
        ),
        bullets.end()
    );
}
```

Call after movement:

```cpp
moveBulletsUp(bullets);
removeOffscreenBullets(bullets);
```

### SAVE AND TRY

Rebuild and run.

**You should see:**  
Bullets disappear cleanly when reaching the top.

**Change something:**  
Change condition to `bullet.y <= 3`. Bullets disappear sooner.

***

# Final Check

| Feature            | Verify                     |
| ------------------ | -------------------------- |
| Bullet spawns      | Press `f` → bullet appears |
| Bullet moves       | Press Enter → bullet moves |
| Bullet removed     | Reaches top → disappears   |
| Game still runs    | No crashes or freezes      |
| No magic numbers   | All constants named        |
| No hidden behavior | Each step isolated         |

***

## Quick Check Answers

**1. Why would only one bullet be limiting?**  
Because you’d need to rewrite everything to support multiple bullets. `std::vector<Bullet>` scales naturally.

**2. Why `std::vector` over arrays?**  
Vectors grow, shrink, and clean themselves safely. Manual arrays don’t.

**3. Why separate movement and removal?**  
Because each function has one responsibility, making bugs easier to find.

***

### ✅ What You Just Learned (consciously)

*   C++ structs as data models
*   Vectors as entity containers
*   Pass‑by‑reference vs value
*   Object lifecycle (spawn → move → remove)
*   Clean update phases
*   Separation of concerns

And you **never typed code without knowing why**.

***

