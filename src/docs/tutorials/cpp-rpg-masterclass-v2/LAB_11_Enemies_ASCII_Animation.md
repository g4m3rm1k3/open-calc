# C++ Terminal RPG — LAB 11 — Enemies & ASCII Animation

**Prerequisites:** LAB 10. You have the room grid, movement system, and the
character struct.

**What this lab adds:**
- Multi-line ASCII art for enemies stored in string arrays
- A 3-frame animation loop using screen clearing
- Enemy types with distinct visual appearances
- An `ENEMY` tile in the room that triggers an encounter

**Time:** 65–80 minutes

---

## What You Will Build

When you encounter an enemy, a pre-battle encounter screen appears with
an animated enemy — the art cycles between frames:

```
  ┌──────────────────────────────────────────────────────┐
  │              ⚔  ENCOUNTER!  ⚔                       │
  └──────────────────────────────────────────────────────┘

        GOBLIN SCOUT
        ────────────

     Frame 1:         Frame 2:         Frame 3:
      (°‿°)            (>‿<)            (°‿°)
      |⚔  |            |  ⚔|            |⚔  |
      / \              / \              >\  /
     Idle            Attacking          Fleeing?

  HP: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  8/8
  ATK: 4   DEF: 2   XP Reward: 25   Gold Reward: 3

  > A Goblin Scout leers at you! Do you fight? [Y]es/[N]o (flee)
```

The animation runs for 3 cycles (9 frames total) before stopping.

---

> **Quick Check — try to answer before reading:**
> 1. How do you store a multi-line ASCII art image in C++? What type holds it?
> 2. Why does animation require `clearScreen()` between frames?
> 3. Prediction: if you print frame 1, sleep 200ms, print frame 2, sleep 200ms,
>    print frame 3 WITHOUT clearing between them — what would the terminal show?
> *(Answers at the end of this lab)*

---

## Concept: Arrays of Strings — Storing ASCII Art

**What it is:** A fixed-size array of `std::string` where each element is
one row of the ASCII art image. All rows together form the picture.

**The problem before:**
```cpp
// ASCII art hardcoded into a single cout — cannot animate or reuse:
std::cout << "  (°‿°)" << std::endl;
std::cout << "  |⚔  |" << std::endl;
std::cout << "   / \\" << std::endl;
```

**The solution:**
```cpp
const int ART_ROWS = 3;
std::string goblinFrame1[ART_ROWS] = {
    "  (°‿°) ",
    "  |⚔  | ",
    "   / \\  "
};
std::string goblinFrame2[ART_ROWS] = {
    "  (>‿<) ",
    "  |  ⚔| ",
    "   / \\  "
};

// Draw a frame:
for (int row = 0; row < ART_ROWS; row++) {
    std::cout << goblinFrame1[row] << std::endl;
}
```

**What it hides:** The array index is the row number — `goblinFrame1[0]` is
the top of the sprite, `goblinFrame1[ART_ROWS-1]` is the bottom. The loop
invariant is: every index `[0, ART_ROWS)` contains exactly one line of text,
all the same width.

**Canonical example (General Explanation):**
Think of a sprite sheet for a flip book — each `cout` line is one row of
pixels. `printGoblin()` draws the goblin by printing lines top-to-bottom.
The terminal is the canvas; `cout` calls are the brushstrokes.

```cpp
// A 3-line sprite stored as a string array:
std::string cat[3] = {
    " /\\_/\\ ",
    "( o.o )",
    " > ^ < "
};
for (int i = 0; i < 3; i++) std::cout << cat[i] << "\n";
```

When you print all three rows in sequence, the terminal assembles the picture
row by row — exactly like printing pixels line by line on a dot-matrix printer.
A 2D array `art[frame][row]` stacks multiple flip-book pages in a single
variable.

**Project Application (The "Why" here):**
This RPG stores `goblinArt[3][5]` — 3 animation frames, each 5 rows tall.
`playEncounterAnimation` cycles through frames 0 → 1 → 2 → 0 → ... to
show the goblin switching between idle, attacking, and hurt poses. Without
the array structure, you could not swap frames at runtime — you would need
a separate `drawGoblinFrame0()`, `drawGoblinFrame1()`, `drawGoblinFrame2()`
function for every enemy type times every frame.

**Smallest possible example:**
```cpp
const int ROWS = 3, FRAMES = 2;
std::string anim[FRAMES][ROWS] = {
    { "(*_*)", "|   |", " / \\ " },  // frame 0
    { "(^_^)", "|   |", " / \\ " }   // frame 1
};
// Print frame 0:
for (int r = 0; r < ROWS; r++) std::cout << anim[0][r] << "\n";
```

**Why it matters here:** Three separate frame arrays represent the animation
frames. Cycling through them with a loop and `clearScreen()` creates the
appearance of movement.

**Watch for:** All frame strings should be the SAME WIDTH (pad with spaces).
If frame 1 is 10 chars wide and frame 2 is 8 chars, the shorter frame will
show leftover characters from the previous frame when you clear only the
art region (rather than the whole screen).

---

## Concept: `chrono` and `this_thread::sleep_for` — Timed Delays

**What it is:** Standard library facilities for measuring time and pausing
execution. Required for animation timing.

**The problem before:**
```cpp
// Without pausing, frames flash too fast to see:
for (int frame = 0; frame < 3; frame++) {
    clearScreen();
    drawFrame(frame);
    // no delay — next frame appears immediately
}
```

**The solution:**
```cpp
#include <chrono>
#include <thread>

// Pause for 250 milliseconds:
std::this_thread::sleep_for(std::chrono::milliseconds(250));
```

**What it hides:** `sleep_for` suspends the calling thread by handing control
back to the OS scheduler. The OS decides when to wake the thread — the actual
pause may be a few milliseconds longer than requested. Invariant: the program
makes zero forward progress during the sleep; no input is polled, no logic runs.

**Canonical example (General Explanation):**
Think of a pause between film frames — the animation only works if you can see
each frame before the next one replaces it.

```cpp
#include <chrono>
#include <thread>

// Wait 200 ms between two print statements:
std::cout << "Frame A\n";
std::this_thread::sleep_for(std::chrono::milliseconds(200));
std::cout << "Frame B\n";
```

Without the delay, both frames would print so fast the human eye could not
distinguish them. The 200 ms gap is what makes "Frame A" visible before
"Frame B" replaces it.

**Project Application (The "Why" here):**
`playEncounterAnimation` calls `sleep_for(milliseconds(ANIMATION_DELAY_MS))`
after drawing each frame. `ANIMATION_DELAY_MS = 300` gives roughly 3 frames
per second — slow enough for the player to see the goblin's idle → attack →
hurt poses, fast enough to feel like motion rather than a slideshow.

**Smallest possible example:**
```cpp
#include <iostream>
#include <chrono>
#include <thread>

int main() {
    std::cout << "Wait for it..." << std::endl;
    std::this_thread::sleep_for(std::chrono::milliseconds(1000));  // 1 second
    std::cout << "Surprise!" << std::endl;
    return 0;
}
```

**Why it matters here:** 250ms between animation frames gives ~4 frames per
second — slow enough to see each pose, fast enough to feel animated.

**Watch for:** `sleep_for` blocks the entire program — no input is read
while sleeping. For full game animation you would use a proper game loop with
delta time. For a turn-based RPG with brief combat animations, blocking sleep
is fine and much simpler.

---

## Concept: Screen Clearing — Creating the Illusion of Animation

**What it is:** Erasing all terminal output and returning the cursor to the
top-left corner before drawing the next frame.

**The solution:**
```cpp
void clearScreen() {
#ifdef _WIN32
    system("cls");   // ← Windows
#else
    system("clear"); // ← Linux/Mac
#endif
}
```

*(`system("clear")` on Linux/Mac or `system("cls")` on Windows sends a command
to the terminal to erase all output — creating the illusion of animation by
replacing the previous frame with a new one)*.

**What it hides:** `system()` launches a child process to run the shell
command. It is a heavy operation compared to an ANSI escape code like
`"\033[2J\033[H"`. Invariant: every call to `clearScreen()` discards all
previously printed characters — anything you want the player to keep seeing
must be redrawn.

**Canonical example (General Explanation):**
A film projector swaps physical slides between frames — the screen goes dark
for a moment, the new slide drops in, and light shines through. `clearScreen()`
is the "screen goes dark" step; `drawEnemyFrame(...)` is the new slide.

```cpp
for (int frame = 0; frame < 3; frame++) {
    clearScreen();                                              // ← blank the screen
    std::cout << frames[frame] << "\n";                        // ← draw new slide
    std::this_thread::sleep_for(std::chrono::milliseconds(200)); // ← hold the frame
}
```

Without `clearScreen()`, each frame stacks below the last — you get a scroll
of all frames simultaneously rather than the appearance of motion.

**Project Application (The "Why" here):**
`drawEnemyFrame` calls `clearScreen()` as its very first line. This means
every animation frame starts with a completely blank terminal and redraws the
full encounter UI (header, enemy name, ASCII art, stats). The player sees a
clean, stable image each time — not a jumbled stream of concatenated frames.

---

## Pattern: Data-Driven Entity Creation — used again

### Pattern: Data-Driven Entity Creation — used again

First seen in: LAB_06 where factory functions created enemies from named
parameters (e.g., `createGoblin()`, `createOrc()`).

Here it appears as: a name-based dispatch in `playEnemyAnimation` — the
function inspects `enemy.name` with `std::string::find` and selects the
matching art array from a set of pre-defined globals (`goblinArt`, `orcArt`,
`skeletonArt`, `dragonArt`).

The difference: In LAB_06 the data was in the struct fields (HP, ATK, DEF).
Here the data is a 2D string array associated with each enemy type. The
name string acts as an informal type tag — a preview of the `enum` and
`switch` pattern introduced in LAB_14 when enemy types are represented as a
proper `enum class EnemyType`.

---

## Step 1 — Enemy ASCII Art Definitions

Add this section to `main.cpp`, after the `Enemy` struct definition:

```cpp
// ── ASCII art frame dimensions ────────────────────────────────
const int ENEMY_ART_ROWS    = 5;   // height of enemy art in lines
const int ENEMY_ART_FRAMES  = 3;   // number of animation frames

// ── Goblin art — 3 frames ─────────────────────────────────────
// Frame 0: idle    Frame 1: attack    Frame 2: hurt
std::string goblinArt[ENEMY_ART_FRAMES][ENEMY_ART_ROWS] = {
    {  // Frame 0 — Idle
        "   (°‿°)   ",
        "   |⚔  |   ",
        "   / \\    ",
        "          ",
        "          "
    },
    {  // Frame 1 — Attacking (weapon thrust forward)
        "   (>‿<)   ",
        "   |  ⚔|   ",
        "   /|\\    ",
        "          ",
        "          "
    },
    {  // Frame 2 — Hurt (reeling back)
        "   (*‿*)   ",
        "   |\\  |  ",
        "    \\ /   ",
        "     |    ",
        "          "
    }
};

// ── Orc art ───────────────────────────────────────────────────
std::string orcArt[ENEMY_ART_FRAMES][ENEMY_ART_ROWS] = {
    {  // Frame 0 — Idle
        " ┌(°ᴗ°)┐  ",
        "  |⚔⚔|   ",
        "  // \\\\  ",
        "  |   |   ",
        "          "
    },
    {  // Frame 1 — Attacking
        " ┌(>ᴗ<)┐  ",
        "  |⚔⚔|⚔  ",
        "  // \\\\  ",
        "  |   |   ",
        "          "
    },
    {  // Frame 2 — Hurt
        " ┌(*ᴗ*)┐  ",
        "  |  |    ",
        "   \\//    ",
        "   ||     ",
        "          "
    }
};

// ── Skeleton art ──────────────────────────────────────────────
std::string skeletonArt[ENEMY_ART_FRAMES][ENEMY_ART_ROWS] = {
    {  // Frame 0 — Idle
        "   .___.   ",
        "   |○ ○|   ",
        "   |⚔  |  ",
        "   |___|  ",
        "   /   \\  "
    },
    {  // Frame 1 — Attacking
        "   .___.   ",
        "   |○>○|   ",
        "   | ⚔>|  ",
        "   |___|  ",
        "   / | \\  "
    },
    {  // Frame 2 — Hurt
        "   .   .   ",
        "   |○ ○|   ",
        "   | X |  ",
        "   |___|  ",
        "   /   \\  "
    }
};

// ── Dragon art — larger, spans 5 rows ─────────────────────────
std::string dragonArt[ENEMY_ART_FRAMES][ENEMY_ART_ROWS] = {
    {  // Frame 0 — Idle
        " ~~(°ᴥ°)~~ ",
        " //|🔥|\\\\  ",
        " |  | |  | ",
        " \\__| |__/ ",
        " //  \\\\   "
    },
    {  // Frame 1 — Breathing fire
        " ~~(>ᴥ<)~~ ",
        " //|🔥🔥|\\  ",
        " |  | |  | ",
        " \\__|_|__/ ",
        " //  \\\\   "
    },
    {  // Frame 2 — Hurt / roaring
        " ~~(*ᴥ*)~~ ",
        " //|  |\\\\  ",
        " |  \\ /  | ",
        " \\__X X__/ ",
        " //  \\\\   "
    }
};
```

---

## Step 2 — The Animation Function

Add:

```cpp
#include <chrono>   // for milliseconds
#include <thread>   // for sleep_for

const int ANIMATION_DELAY_MS  = 300;  // ms between frames
const int ANIMATION_CYCLES    = 3;    // repeat the full frame sequence N times

// ── Draws one frame of enemy ASCII art ───────────────────────
void drawEnemyFrame(const std::string art[ENEMY_ART_ROWS],
                    const Enemy& enemy, int frameIndex) {
    clearScreen();

    std::cout << "  ┌──────────────────────────────────────────────────┐" << std::endl;
    std::cout << "  │              " << COLOR_RED << "⚔  ENCOUNTER!  ⚔"
              << COLOR_RESET << "                      │" << std::endl;
    std::cout << "  └──────────────────────────────────────────────────┘" << std::endl;
    std::cout << std::endl;

    // Enemy name and frame indicator
    std::cout << "        " << COLOR_MAGENTA << enemy.name << COLOR_RESET << std::endl;
    std::cout << "        ";
    for (int i = 0; i < static_cast<int>(enemy.name.size()); i++) std::cout << "─";
    std::cout << std::endl << std::endl;

    // Draw the art frame
    for (int row = 0; row < ENEMY_ART_ROWS; row++) {
        std::cout << "     " << art[row] << std::endl;
    }

    std::cout << std::endl;

    // Enemy stats
    std::cout << "  HP  ";
    float hpPct = static_cast<float>(enemy.hp) / static_cast<float>(enemy.maxHP);
    std::string barColor = hpPct > 0.5f ? COLOR_GREEN :
                           hpPct > 0.25f ? COLOR_YELLOW : COLOR_RED;
    printColoredBar(enemy.hp, enemy.maxHP, 16, barColor);
    std::cout << std::endl;
    std::cout << "  ATK: " << enemy.atk << "   DEF: " << enemy.def
              << "   XP: " << COLOR_YELLOW << enemy.xpReward << COLOR_RESET
              << "   Gold: " << COLOR_YELLOW << enemy.goldReward << COLOR_RESET << std::endl;
}

// ── Play the full encounter animation ────────────────────────
// Shows the enemy idle animation for ANIMATION_CYCLES full cycles
void playEncounterAnimation(const std::string art[][ENEMY_ART_ROWS],
                             const Enemy& enemy) {
    for (int cycle = 0; cycle < ANIMATION_CYCLES; cycle++) {
        for (int frame = 0; frame < ENEMY_ART_FRAMES; frame++) {
            drawEnemyFrame(art[frame], enemy, frame);
            std::this_thread::sleep_for(std::chrono::milliseconds(ANIMATION_DELAY_MS));
        }
    }
}
```

---

## Step 3 — Enemy Art Selector and Encounter Function

Add:

```cpp
// ── Returns the right art array for an enemy ────────────────
// Uses a simple name-based approach (replaced by enum in Lab 14)
void playEnemyAnimation(const Enemy& enemy) {
    if (enemy.name.find("Goblin") != std::string::npos) {
        playEncounterAnimation(goblinArt, enemy);
    } else if (enemy.name.find("Orc") != std::string::npos) {
        playEncounterAnimation(orcArt, enemy);
    } else if (enemy.name.find("Skeleton") != std::string::npos) {
        playEncounterAnimation(skeletonArt, enemy);
    } else if (enemy.name.find("Dragon") != std::string::npos) {
        playEncounterAnimation(dragonArt, enemy);
    } else {
        // Default to goblin art for unknown enemies
        playEncounterAnimation(goblinArt, enemy);
    }
}

// ── Show the final encounter screen and ask to fight ────────
bool showEncounter(const Enemy& enemy) {
    // Play the animation first
    playEnemyAnimation(enemy);

    // Final static frame with the fight prompt
    drawEnemyFrame(goblinArt[0], enemy, 0);
    std::cout << std::endl;
    std::cout << "  > A " << COLOR_RED << enemy.name << COLOR_RESET
              << " blocks your path!" << std::endl;
    std::cout << "  Do you fight? [Y]es / [N]o (flee)" << std::endl;
    std::cout << "  > ";

    char choice;
    std::cin >> choice;
    return (choice == 'y' || choice == 'Y');
}
```

---

## Step 4 — Trigger Encounter from the Room

In `buildBasicRoom` or after building the room in `main()`, add an enemy:

```cpp
// Add an enemy to the room
Enemy goblin = createGoblin();
goblin.name  = "Goblin Scout";
currentRoom.grid[3][7] = TILE_ENEMY;  // place enemy marker on map  // ← add this
currentRoom.hasEnemy   = true;        // ← add this
currentRoom.isCleared  = false;       // ← add this
```

In the movement handling (after `movePlayer` returns `true`):

```cpp
// Check if player stepped on an enemy
if (currentRoom.grid[hero.position.row][hero.position.col] == TILE_ENEMY) {
    bool fightChosen = showEncounter(goblin);
    if (fightChosen) {
        std::cout << "  (Battle starts in Lab 12!)" << std::endl;
        // Placeholder — replace with real battle in Lab 12
        currentRoom.grid[hero.position.row][hero.position.col] = TILE_FLOOR; // ← was: nothing
        currentRoom.hasEnemy  = false;  // ← add this
        currentRoom.isCleared = true;   // ← add this
        std::cout << "  Press ENTER to continue...";
        std::cin.ignore();
        std::cin.get();
    } else {
        // Player chose to flee — push them back one step
        std::cout << "  You back away cautiously." << std::endl;
        hero.position.row -= (direction == 'w' || direction == 'W') ? -1 : 
                             (direction == 's' || direction == 'S') ?  1 : 0;
        hero.position.col -= (direction == 'a' || direction == 'A') ? -1 :
                             (direction == 'd' || direction == 'D') ?  1 : 0;
    }
}
```

### SAVE AND TRY

Compile and run. Navigate the room. Walk to position (3,7) to trigger the enemy.

**You should see:**
1. The encounter screen with the goblin ASCII art
2. 3 animation cycles (idle → attack → hurt → idle → ...)
3. The fight prompt
4. Type `y` → placeholder battle message
5. Type `n` → you back away

**Change something:** Change `ANIMATION_CYCLES` from `3` to `1`. The animation
plays only once before showing the prompt. Change `ANIMATION_DELAY_MS` from
`300` to `100` — much faster. Change both back.

---

## Challenge: Hurt Animation on Encounter

**You know:** `drawEnemyFrame`, `sleep_for`, the three art frames.

**Task:** Add a "monster notices you" animation: play the idle frame twice,
then the attack frame once (like the enemy is turning to face you), then
settle on the idle frame for the fight prompt. Replace the current looping
animation with this more dramatic approach.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
void playEncounterAnimation(const std::string art[][ENEMY_ART_ROWS],
                             const Enemy& enemy) {
    // Idle × 2 — enemy hasn't noticed you
    drawEnemyFrame(art[0], enemy, 0);
    std::this_thread::sleep_for(std::chrono::milliseconds(400));
    drawEnemyFrame(art[0], enemy, 0);
    std::this_thread::sleep_for(std::chrono::milliseconds(400));

    // Attack frame — enemy turns and snarls
    drawEnemyFrame(art[1], enemy, 1);
    std::this_thread::sleep_for(std::chrono::milliseconds(600));

    // Back to idle — settling into a fighting stance
    drawEnemyFrame(art[0], enemy, 0);
    std::this_thread::sleep_for(std::chrono::milliseconds(300));
}
```

**Key insight:** Animation is storytelling. The sequence idle → idle → attack
→ idle tells a micro-story: the enemy was not looking at you, it noticed you,
it lunged, then settled into a ready stance. Even three frames can create
a compelling character moment. The frame timing (longer for the attack frame)
adds emphasis to the key moment.

</details>

---

## Challenge: A Boss Enemy with Larger Art

**You know:** ASCII art arrays, `ENEMY_ART_ROWS`.

**Task:** Create `vampireArt[3][7]` — a vampire lord with 7 rows of art
instead of 5. Add a `createVampire()` function with:
- HP: 2d10 + 15 (17–35 HP)
- ATK: 2d6 + 3 (5–15)
- DEF: 5
- XP: 150, Gold: 30

The vampire art should include a cape in the idle frame:

```
Frame 0 (idle):
   .--.
  ( °° )
  |╗  ╔|
 /|╚══╝|\
  |    |
  |    |
  /    \
```

---

<details>
<summary>▶ Show Solution</summary>

```cpp
const int VAMPIRE_ART_ROWS = 7;

std::string vampireArt[ENEMY_ART_FRAMES][VAMPIRE_ART_ROWS] = {
    {  // Frame 0 — Idle
        "   .--.   ",
        "  (°ᴗ°)  ",
        "  |╗  ╔| ",
        " /|╚══╝|\\ ",
        "  |    |  ",
        "  |    |  ",
        "  /    \\  "
    },
    {  // Frame 1 — Attacking
        "   .--.   ",
        "  (>ᴗ<)  ",
        "  |╗⚔╔| ",
        " /\\╚══╝/\\ ",
        "  |    |  ",
        "  |    |  ",
        "  /    \\  "
    },
    {  // Frame 2 — Hurt
        "   .--.   ",
        "  (*ᴗ*)  ",
        "  |╗  ╔| ",
        " /|╔══╗|\\ ",
        "  | // |  ",
        "  |    |  ",
        "  /    \\  "
    }
};

Enemy createVampire() {
    Enemy v;
    v.name       = "Vampire Lord";
    v.maxHP      = rollNd(2, D10) + 15;
    v.hp         = v.maxHP;
    v.atk        = rollNd(2, D6) + 3;
    v.def        = 5;
    v.xpReward   = 150;
    v.goldReward = 30;
    return v;
}
```

**Key insight:** The `ENEMY_ART_ROWS` constant only covers standard enemies.
For the vampire you need a DIFFERENT `drawEnemyFrame` overload or parameterized
function that accepts the number of rows. This is the first sign that
hardcoding `ENEMY_ART_ROWS` globally is limiting. In Lab 14 (OOP), the
`Enemy` class stores its own art and frame count — the right fix.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Goblin ASCII art displays | Trigger enemy encounter — see goblin art |
| Animation cycles 3 times | Count — see 9 frames before prompt |
| Frame changes visible | Idle → attack → hurt are visually different |
| Screen clears between frames | No art artifacts from previous frame |
| Enemy stats display below art | See HP bar, ATK, DEF, XP, Gold |
| Fight prompt appears after animation | See `[Y]es/[N]o` prompt |
| `n` (flee) backs player away | Choose `n` — player moves back |
| Dragon art is different from goblin | Swap enemy to Dragon, see different art |

---

## Quick Check Answers

**1. How do you store a multi-line ASCII art image in C++?**
As an array of `std::string`, where each element is one line of the art:
`std::string frame[5] = {"line1", "line2", "line3", "line4", "line5"}`.
A 2D array of strings (`std::string art[3][5]`) stores 3 frames of 5-line
art. Access: `art[frameIndex][rowIndex]`. The outer array is frames, the
inner array is rows within each frame.

**2. Why does animation require `clearScreen()` between frames?**
The terminal is append-only: each `cout` adds characters AFTER everything
already printed. Without clearing, frame 2's art would appear BELOW frame 1's
art, not replacing it. `clearScreen()` erases the screen and moves the cursor
to the top-left, so the next frame is drawn in the same position as the
previous one — creating the visual illusion of motion.

**3. Print frames without clearing — what would the terminal show?**
All three frames stacked vertically. Frame 1 at the top, frame 2 immediately
below it, frame 3 below that. The terminal would show 15 lines of art (3 frames
× 5 rows) all visible simultaneously. The "animation" would not appear to move
at all — just static art with slight pauses between the three sections.
