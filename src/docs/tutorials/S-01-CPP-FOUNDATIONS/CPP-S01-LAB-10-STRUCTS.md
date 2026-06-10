# C++ Masterclass — S-01 — LAB 10 — Structs

**Prerequisites:** LAB 09. You know references, pass-by-reference, and functions.

**What this lab adds:**
- `struct` — grouping related data under one name
- Member access with `.` — reading and writing struct fields
- Passing structs to functions by value and by reference
- Arrays of structs — the foundation of every entity system in gaming
- Initialization with `{}` — zero-initializing and member initialization
- The entity model — how game objects are represented as data
- A `Player` struct that will be the direct ancestor of the RPG's player entity

**Time:** ~65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You need to track a player's name, HP, level, and XP. Without structs, you would
>    need four separate variables. What problems does this create when you want to
>    write a function that "operates on the player"?
> 2. When you pass a struct to a function by value, what happens? Does the function
>    get a copy of all the fields?
> 3. Predict: If you have `Player p = {};` (initialized with empty braces), what
>    value do each of the numeric fields hold?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A **character sheet generator** — a program that creates `Player` structs, modifies
them through functions, and prints formatted sheets. This is the exact data model
the RPG engine (S-09) will use:

```
=== Character Sheet Generator ===

╔══════════════════════════════════╗
║  ZARA                            ║
║  Level 3  |  Class: Warrior      ║
╠══════════════════════════════════╣
║  HP:    75 / 100                 ║
║  XP:   250 / 400                 ║
║  ATK:   15  DEF:   8             ║
╚══════════════════════════════════╝

╔══════════════════════════════════╗
║  LYRA                            ║
║  Level 1  |  Class: Mage         ║
╠══════════════════════════════════╣
║  HP:   100 / 100                 ║
║  XP:     0 / 100                 ║
║  ATK:    8  DEF:   4             ║
╚══════════════════════════════════╝
```

---

## Part 1 — The Problem Structs Solve

### Concept: `struct` — A Named Group of Related Data

**What it is:** A `struct` (short for "structure") defines a new type that groups
multiple variables together under one name. Every instance of the struct contains
its own copy of each member variable.

**The problem before (parallel variables):**

```cpp
// Tracking two players with parallel variables — a maintenance nightmare
std::string player1Name  = "Zara";
int         player1HP    = 75;
int         player1Level = 3;

std::string player2Name  = "Lyra";
int         player2HP    = 100;
int         player2Level = 1;

// To "process the player," you pass all variables individually:
void printPlayer(const std::string& name, int hp, int level, int maxHp, int atk, int def);
// This function signature grows as you add fields — and every call site must be updated
```

Adding a new field (say, `xp`) means updating every function that touches a player.
If you want an array of players, you need parallel arrays for each field — and keeping
them in sync is bug-prone.

**The solution:**

```cpp
struct Player {
    std::string name;
    int hp;
    int maxHp;
    int level;
    int atk;
    int def;
};

// One parameter, all fields:
void printPlayer(const Player& p);

// An array of players is natural:
Player party[4];
```

**What it hides:** Memory layout. The compiler decides how to arrange the struct's
fields in memory (often with padding for alignment). You access fields by name; the
compiler computes the offset from the struct's base address.

**The protected invariant:** Fields that belong together are always together. You
cannot accidentally split `hp` and `maxHp` into different arrays and forget to update
one of them. The struct guarantees they travel as a unit.

**Pattern category:** Non-GoF (fundamental language feature). This is the foundation
of the **Entity Model** pattern in game development.

**Mental Model — The Entity Model:**
Every "thing" in a game (player, enemy, item, tile) is represented as a collection
of data. The game's logic is separate functions that operate on that data. This is
the **data-oriented** approach: "what information does this thing carry?" rather than
"what can this thing do?" Classes (LAB 11 in S-02) add behavior alongside data — but
the data grouping always comes first.

**You will see this pattern again in:** S-02 Snake (SnakeBody struct), S-09 RPG Engine
(the full Entity-Component-System), and every game series in this masterclass.

---

## Step 1 — Define the `Player` Struct

Start a new `main.cpp`:

```cpp
#include <iostream>    // std::cout, std::endl
#include <string>      // std::string
#include <iomanip>     // std::setw, std::left

// ── Player Struct ─────────────────────────────────────────────────────────────
// This struct is the complete data representation of a dungeon player.
// Note the semicolon after the closing brace — required for struct definitions.
struct Player {
    std::string name;     // player's name
    std::string className; // character class (Warrior, Mage, etc.)
    int hp       = 0;     // current hit points (= 0: default initialization)
    int maxHp    = 0;     // maximum hit points
    int level    = 1;     // character level (starts at 1)
    int xp       = 0;     // current experience points
    int atk      = 0;     // attack power
    int def      = 0;     // defense
};
```

**`= 0` in the struct definition:** These are **default member initializers** — the
value each numeric field takes when a `Player` is created without explicit values.
Without them, creating a `Player` with `Player p;` would leave numeric fields
containing garbage values (uninitialized memory). This is the right habit: always
provide defaults for numeric members.

**The semicolon after `}`:** This is one of C++'s historical quirks. A struct
definition is a statement, and statements end with `;`. Forgetting it causes confusing
errors like "expected `;` before [next identifier]".

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** No output yet — we declared the type but created no instances.
The program compiles and exits immediately. This verifies the struct compiles cleanly.

---

## Part 2 — Creating and Accessing Struct Instances

### Concept: Member Access — The `.` Operator

**What it is:** The `.` operator accesses a field (member variable) of a struct instance.
`p.hp` reads or writes the `hp` field of the specific `Player` instance `p`.

**Analogy:** If a `Player` is a form with named fields, `p.hp` is writing "75" in
the "HP" box of form `p`.

**Creating instances:**
```cpp
Player zara;          // creates one Player; uses default member initializers
zara.name  = "Zara"; // writes to the 'name' field of 'zara'
zara.hp    = 75;
zara.maxHp = 100;
```

**Aggregate initialization with `{}`:**
```cpp
Player zara = { "Zara", "Warrior", 75, 100, 3, 250, 15, 8 };
//              name    className  hp  maxHp lv xp  atk def
// Fields initialized in the order they appear in the struct definition
```

This is compact but brittle — adding a field changes the order, potentially misassigning
values silently. For readability and safety, prefer setting fields by name.

**Watch for:** Unlike arrays, structs do not "decay" to a pointer when passed to a
function. `void f(Player p)` receives a full copy of all fields. `void f(Player& p)`
receives a reference. This is different from arrays.

---

## Step 2 — Create and Print a Player

Add to `main.cpp`:

```cpp
// ── Forward declarations ─────────────────────────────────────────────────────
void printSheet(const Player& p);
int  xpForNextLevel(int level);

// ── xpForNextLevel: XP threshold grows quadratically (level^2 * 100) ─────────
int xpForNextLevel(int level) {
    return level * level * 100;   // Level 1→100, Level 2→400, Level 3→900
}

// ── printSheet: prints one character sheet ───────────────────────────────────
void printSheet(const Player& p) {
    const std::string BORDER = "╔══════════════════════════════════╗";
    const std::string DIVIDE = "╠══════════════════════════════════╣";
    const std::string BOTTOM = "╚══════════════════════════════════╝";
    const int         WIDTH  = 34;   // inner width between borders

    // Header
    std::cout << BORDER << std::endl;
    std::cout << "║  " << std::left << std::setw(WIDTH - 2) << p.name << "║" << std::endl;

    std::string levelLine = "Level " + std::to_string(p.level)
                          + "  |  Class: " + p.className;
    std::cout << "║  " << std::setw(WIDTH - 2) << levelLine << "║" << std::endl;

    std::cout << DIVIDE << std::endl;

    // Stats
    std::string hpLine = "HP: " + std::to_string(p.hp) + " / " + std::to_string(p.maxHp);
    std::cout << "║  " << std::setw(WIDTH - 2) << hpLine << "║" << std::endl;

    std::string xpLine = "XP: " + std::to_string(p.xp) + " / "
                       + std::to_string(xpForNextLevel(p.level));
    std::cout << "║  " << std::setw(WIDTH - 2) << xpLine << "║" << std::endl;

    std::string combatLine = "ATK: " + std::to_string(p.atk)
                           + "  DEF: " + std::to_string(p.def);
    std::cout << "║  " << std::setw(WIDTH - 2) << combatLine << "║" << std::endl;

    std::cout << BOTTOM << std::endl;
}

// ── Main ─────────────────────────────────────────────────────────────────────
int main() {
    std::cout << "=== Character Sheet Generator ===" << std::endl;
    std::cout << std::endl;

    // Create the first player — set fields by name for clarity
    Player zara;
    zara.name      = "ZARA";
    zara.className = "Warrior";
    zara.hp        = 75;
    zara.maxHp     = 100;
    zara.level     = 3;
    zara.xp        = 250;
    zara.atk       = 15;
    zara.def       = 8;

    printSheet(zara);
    std::cout << std::endl;

    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** A formatted character sheet for ZARA with borders.

**Change something:** Change `zara.level = 3` to `zara.level = 1`. Recompile.
The sheet shows Level 1, and the XP threshold changes from 900 to 100 (1×1×100).
The `xpForNextLevel` formula automatically adjusts. Change back to `3`.

---

## Step 3 — Add a Second Player (Arrays of Structs)

Add Lyra and use a loop over an array of players:

```cpp
    // ── Create a second player ────────────────────────────────────────────────
    Player lyra;
    lyra.name      = "LYRA";
    lyra.className = "Mage";
    lyra.hp        = 100;
    lyra.maxHp     = 100;
    lyra.level     = 1;
    lyra.xp        = 0;
    lyra.atk       = 8;
    lyra.def       = 4;

    // ── Print both using an array ─────────────────────────────────────────────
    const int  PARTY_SIZE = 2;
    Player party[PARTY_SIZE] = {zara, lyra};   // array of Player structs

    for (int i = 0; i < PARTY_SIZE; ++i) {
        printSheet(party[i]);   // pass one Player by const reference
        std::cout << std::endl;
    }
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Both character sheets printed in sequence. The loop over the
array handles both players identically — adding a third player means adding one
`Player` to the array and updating `PARTY_SIZE`.

---

## 🎯 Challenge: `levelUp` Function

**You know:** Structs, references, `xpForNextLevel`.

**Task:** Write `void levelUp(Player& p)` that:
1. Increases `p.level` by 1
2. Sets `p.xp` to 0 (reset for new level)
3. Increases `p.maxHp` by 10, and sets `p.hp` to the new `p.maxHp`
4. Increases `p.atk` by 2 and `p.def` by 1

Call it on Lyra. Print her sheet before and after the level-up.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
void levelUp(Player& p) {
    ++p.level;
    p.xp     = 0;
    p.maxHp += 10;
    p.hp     = p.maxHp;   // restore to full health on level up
    p.atk   += 2;
    p.def   += 1;
}

// In main:
std::cout << "=== Before Level Up ===" << std::endl;
printSheet(lyra);
std::cout << std::endl;

levelUp(lyra);

std::cout << "=== After Level Up ===" << std::endl;
printSheet(lyra);
```

**Key insight:** `levelUp(Player& p)` modifies the original player struct via reference.
All six fields are updated in one function. Because they are grouped in a struct, there
is no risk of accidentally updating "level" but forgetting "xp" in one copy while
updating both in another copy — the struct is always coherent.
In S-09, `levelUp` becomes a method of the `Player` class, but its logic is identical
to what you wrote here.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| Struct compiles | Program compiles without errors with the `Player` struct defined |
| Default initialization | `Player p;` — numeric fields start at 0, not garbage |
| Member access | `zara.level = 3` correctly sets the level field |
| `printSheet` reads | Sheet shows correct HP, XP, ATK, DEF from the struct |
| `xpForNextLevel(3)` | Returns 900 (3×3×100) |
| Array of structs | Both players print via the `for (int i...)` loop |
| `levelUp` by reference | Lyra's stats increase after `levelUp(lyra)` |
| Struct invariant | Both `hp` and `maxHp` are always in the same struct |

---

## Quick Check Answers

**1. What problems arise from parallel variables for multiple players?**
Three major problems. First, function signatures must accept every field separately —
`void printPlayer(string name, int hp, int maxHp, int level, int xp, int atk, int def)`.
Adding a new field means changing every function that takes a player.
Second, arrays of players require parallel arrays (`string names[]`, `int hps[]`, etc.)
that must be kept in sync — nothing prevents them from drifting out of alignment.
Third, there is no way to pass "the player" as one argument — you always pass fragments.
Structs eliminate all three problems.

**2. When a struct is passed by value, do all fields get copied?**
Yes — every field of the struct is copied into the function's local parameter.
For a `Player` with 8 fields, that means copying a `std::string`, another `std::string`,
and six `int`s. The copy is complete and independent. Modifications to the copy do not
affect the original. This is why `printSheet(const Player& p)` uses `const&` — it
reads the original player without copying it, and `const` prevents accidental modification.

**3. What does `Player p = {};` initialize numeric fields to?**
Zero. When a struct is initialized with `{}` (empty aggregate initialization) and has
no default member initializers, all numeric fields are zero-initialized. With default
member initializers (like `int hp = 0;` in our `Player`), `Player p;` also sets them to zero.
String members default-initialize to an empty string `""`. The rule: always provide
default initializers for numeric fields in structs you define — it prevents the
"uninitialized garbage" bug class entirely.
