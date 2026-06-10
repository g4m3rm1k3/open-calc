# C++ Terminal RPG — LAB 02 — Variables & the Character Sheet

**Prerequisites:** LAB 01. You can compile and run a C++ program, use `cout`
and `cin`, and know what `main()` is.

**What this lab adds:**
- Integer, float, bool, and string variables to store character stats
- Named constants so magic numbers have names
- A formatted character sheet printed to the terminal

**Time:** 45–60 minutes

---

## What You Will Build

When this lab is complete, running `./dungeon` shows:

```
  What is your name, brave adventurer? Erevan

  ┌─────────────────────────────────────┐
  │        CHARACTER SHEET              │
  ├─────────────────────────────────────┤
  │  Name:   Erevan                     │
  │  Level:  1                          │
  │                                     │
  │  ── Core Stats ──                   │
  │  STR: 14    DEX: 10    CON: 12      │
  │  INT: 16    WIS: 13    CHA: 8       │
  │                                     │
  │  ── Derived Stats ──                │
  │  HP:  24 / 24    MP:  18 / 18       │
  │  ATK: 12         DEF:  6            │
  │  Gold: 50        XP:   0 / 100      │
  └─────────────────────────────────────┘
```

---

> **Quick Check — try to answer before reading:**
> 1. Why use `const int MAX_HP = 24` instead of just writing `24` directly in
>    the code wherever you need it?
> 2. What is the difference between `int` and `float`? When would you use each
>    in a game?
> 3. Prediction: if you write `int score = 10; score = score + 5;` and then
>    print `score`, what will you see?
> *(Answers at the end of this lab)*

---

## Concept: Variables — Named Containers for Data

**What it is:** A variable is a named storage location in memory. You give it
a type (what kind of data), a name, and optionally an initial value.

**The problem before:** Without variables, every value is a magic number
buried in code:
```cpp
std::cout << "HP: 24 / 24" << std::endl;  // what is 24? why 24?
// One month later you need to change the starting HP to 30
// and must find every single "24" in your code
```

**The solution:** Name every piece of data:
```cpp
int playerHP    = 24;
int playerMaxHP = 24;
std::cout << "HP: " << playerHP << " / " << playerMaxHP << std::endl;
// To change starting HP: change ONE variable declaration
```

**Canonical example (General Explanation):**
A scoreboard at a basketball game — the scoreboard has a named slot ("HOME") that holds a number, and you update that slot when the score changes rather than painting a new sign. In C++:
```cpp
int score = 0;
score += 10;   // update the slot; the name stays the same
```
The "named slot that holds a changeable value" maps directly to how variables work in RAM: the name is an alias for a memory address, and the value stored there can be overwritten.

**Project Application (The "Why" here):**
Every stat on the character sheet — `playerHP`, `playerMaxHP`, `playerMP`, `statSTR`, `playerGold`, `playerXP` — is a variable. When a monster hits the player for 5 damage, the game does `playerHP -= 5`. When the player picks up gold, it does `playerGold += coinDrop`. The entire game state is a collection of variables changing over time; the character sheet is just a snapshot of those variables printed to the screen.

**Smallest possible example:**
```cpp
int score = 0;
score = score + 10;   // add 10 points
score += 5;           // shorthand for score = score + 5
std::cout << score << std::endl;  // prints 15
```

**Why it matters here:** Every stat on the character sheet is a variable.
Changing them is how the game tracks HP loss, XP gain, and level-up.

**Watch for:** In C++, variables must be declared before they are used.
Declaring is when you say `int hp = 24;`. Using is when you say `hp -= 10;`.
You cannot use a variable that was never declared.

---

## Concept: C++ Primitive Types

**What it is:** The built-in data types that describe what kind of value a
variable holds.

| Type | Stores | Example |
|------|--------|---------|
| `int` | Whole numbers | `24`, `-5`, `1000` |
| `float` | Decimal numbers (less precision) | `3.14f`, `0.75f` |
| `double` | Decimal numbers (more precision) | `3.14159265` |
| `bool` | True or false | `true`, `false` |
| `char` | A single character | `'A'`, `'@'` |
| `std::string` | Text (multiple characters) | `"Erevan"` |

**The problem before:** Using the wrong type causes bugs:
```cpp
int damage = 10;
int resistance = 3;
int result = damage / resistance;  // integer division: result is 3, not 3.33
// The fractional part is silently discarded!
```

**The solution:** Use the right type for the job:
```cpp
float damageFloat = 10.0f;
float resistanceFloat = 3.0f;
float result = damageFloat / resistanceFloat;  // result is 3.33...
```

**Canonical example (General Explanation):**
A scoreboard (`int` for score), roster sheet (`char` for a player's initials), and a game-over flag (`bool` for whether the game ended) — three different kinds of real-world data, each needing a different container:
```cpp
int  score    = 0;       // counted in whole points
char initial  = 'E';     // single letter on a name badge
bool gameOver = false;   // on or off, nothing in between
```
Seeing three types side by side makes it immediately obvious why one type cannot do all jobs: a `bool` can't hold `1500`, and an `int` can't hold `false` meaningfully.

**Project Application (The "Why" here):**
In this RPG: HP, level, gold, XP, and all six core stats are `int` — they are always whole numbers and game math never needs fractions for these. Damage multipliers (like a 1.5× critical hit bonus added later) will be `float`. The player's alive/dead state is `bool`. Character names, room descriptions, and item names are `std::string`. Using the right type for each stat also serves as self-documentation: seeing `bool isCursed` tells a future reader this is a binary flag, not a numeric counter.

**Smallest possible example:**
```cpp
int    level   = 1;
float  speed   = 1.5f;    // the 'f' marks it as float, not double
bool   alive   = true;
char   grade   = 'A';
std::string name = "Erevan";
```

**Why it matters here:** HP, level, gold, and XP are `int`. Damage multipliers
could be `float`. The alive/dead state is `bool`. Names are `std::string`.

**Watch for:** Integer division. `7 / 2` in C++ is `3`, not `3.5`. If you
need decimal division, at least one operand must be a `float` or `double`:
`7.0f / 2` gives `3.5f`.

---

## Concept: `const` — Named Constants

**What it is:** The `const` keyword marks a variable as immutable — its value
cannot change after it is set. By convention, constants use ALL_CAPS names.

**The problem before:**
```cpp
// magic numbers scattered everywhere:
if (playerHP <= 0) { ... }       // what is 0 here?
int hp = 24;                      // why 24?
int maxMana = 18;                 // where does 18 come from?
```

**The solution:**
```cpp
const int STARTING_HP   = 24;   // base HP for a level-1 character
const int STARTING_MANA = 18;   // base MP for a level-1 character
const int STARTING_GOLD = 50;   // coins at game start

int playerHP   = STARTING_HP;
int playerMana = STARTING_MANA;
```
Now if you change `STARTING_HP` to `30`, every place that uses it updates
automatically.

**What it hides:** Prevents accidental mutation — the compiler refuses to compile any line that tries to reassign a `const` variable, so a typo like `STARTING_HP = 0;` becomes a build error instead of a silent bug. Invariant: the value of a `const` variable is guaranteed to be identical at every point in the program after initialization; no function or loop can change it.

**Canonical example (General Explanation):**
A locked display case — you can look at the items inside and read their labels, but the case is sealed and you cannot swap them out. In C++:
```cpp
const int MAX_LEVEL = 20;
// MAX_LEVEL = 30;  // compile error — the case is locked
std::cout << MAX_LEVEL << std::endl;  // reading is always fine
```
The compile error being immediate (not a runtime crash) is what makes `const` valuable: the compiler catches the mistake before the program ever runs.

**Project Application (The "Why" here):**
All starting stat values (`STARTING_STR`, `STARTING_CON`, etc.), the HP and MP base values, starting gold, and XP thresholds are constants defined at the top of the file. They are the game's "rules" — the designer-set numbers that define the game balance. Making them `const` means a careless `+=` somewhere in the combat code can never accidentally corrupt them. When you tune the game (say, raising starting gold from 50 to 75), you change exactly one line.

**Smallest possible example:**
```cpp
const int MAX_LEVEL = 20;       // D&D cap is level 20
const int DICE_SIDES = 6;       // d6
std::cout << "Max level: " << MAX_LEVEL << std::endl;
// MAX_LEVEL = 30; would be a compile error — cannot reassign const
```

**Why it matters here:** Stat caps, starting values, and dungeon dimensions
are all constants. They are defined once at the top of the file and used
everywhere without magic numbers.

**Watch for:** `const` variables must be initialized when declared — you
cannot do `const int X;` and set it later. That is a compile error.

---

## Step 1 — Declare All Character Stats

Starting from the end of LAB-01, your `main.cpp` has `printTitleScreen()` and
a `main()` that asks for the player's name. Now add the constants above
`printTitleScreen`, and add all the stat variables inside `main`:

```cpp
#include <iostream>
#include <string>

// ── Starting stat constants (these never change) ──────────────   // ← add this block
const int STARTING_STR  = 14;  // Strength  — affects melee damage
const int STARTING_DEX  = 10;  // Dexterity — affects dodge and ranged
const int STARTING_CON  = 12;  // Constitution — affects max HP
const int STARTING_INT  = 16;  // Intelligence — affects spell power
const int STARTING_WIS  = 13;  // Wisdom — affects MP and resist
const int STARTING_CHA  =  8;  // Charisma — affects prices and NPC dialog
const int STARTING_GOLD = 50;  // gold coins at game start
const int XP_TO_NEXT    = 100; // XP needed to reach level 2

// ── D&D-style derived stat formulas ──────────────────────────
// HP = 10 + CON modifier, where modifier = (CON - 10) / 2 (integer division)
// MP = 8  + INT modifier, where modifier = (INT - 10) / 2
const int HP_BASE        = 10;
const int MP_BASE        = 8;
                                                                     // ← end of new block

void printTitleScreen() { /* ... keep from LAB-01 ... */ }

int main() {
    // (keep the name prompt from LAB-01)
    std::cout << "  What is your name, brave adventurer? ";
    std::string playerName;
    std::cin >> playerName;

    int         playerLevel = 1;                                     // ← add from here

    // Core stats (the "ability scores" from D&D)
    int statSTR = STARTING_STR;
    int statDEX = STARTING_DEX;
    int statCON = STARTING_CON;
    int statINT = STARTING_INT;
    int statWIS = STARTING_WIS;
    int statCHA = STARTING_CHA;

    // Derived stats (calculated from core stats)
    int playerMaxHP = HP_BASE + (statCON - 10) / 2;  // D&D modifier formula
    int playerMaxMP = MP_BASE + (statINT - 10) / 2;
    int playerHP    = playerMaxHP;                    // start at full health
    int playerMP    = playerMaxMP;
    int playerATK   = statSTR / 2;                    // rough formula
    int playerDEF   = statCON / 4;

    // Economy
    int playerGold  = STARTING_GOLD;
    int playerXP    = 0;

    // Just verify the values for now
    std::cout << "Stats loaded. HP = " << playerHP << ", MP = " << playerMP << std::endl;
                                                                     // ← to here
    return 0;
}
```

### SAVE AND TRY

Compile and run.

**You should see:**
```
Stats loaded. HP = 11, MP = 11
```

Wait — HP = 11? Let's check the math: `HP_BASE + (statCON - 10) / 2` = `10 + (12 - 10) / 2` = `10 + 1` = `11`. That is integer division at work: `(12-10)/2 = 2/2 = 1`.

**In the terminal — check the math:**
Change `STARTING_CON` from `12` to `18`. Recompile.
Expected: `HP = 14` (10 + (18-10)/2 = 10+4 = 14)
Change it back to `12`.

**Change something:** Change `HP_BASE` from `10` to `20`. Recompile.
See HP change to `21`. Change it back.

---

### Math: D&D Ability Score Modifier

**What it computes:** Converts a raw ability score (like CON = 12) into a signed modifier (+1) that adjusts derived stats like HP and MP.

**The real-world analogy:** A grading curve — a score of 10 is average (modifier 0), every 2 points above 10 gives +1, every 2 points below 10 gives -1. A CON of 8 is slightly below average (-1 to HP), a CON of 18 is exceptional (+4 to HP).

**Canonical example:**
```cpp
// modifier = (score - 10) / 2   (integer division)
int con = 12;
int modifier = (con - 10) / 2;  // (12-10)/2 = 2/2 = 1
int maxHP = HP_BASE + modifier; // 10 + 1 = 11
```

**Why it matters here:** This formula is why CON = 12 gives HP = 11 instead of HP = 12. The base of 10 is the "average human" anchor, and the `/2` compresses a wide score range (1–20) into a narrow modifier range (-4 to +5) that keeps HP values reasonable. The same formula drives `playerMaxMP` from INT.

**Watch for:** Integer division truncates toward zero, so CON = 11 gives `(11-10)/2 = 0`, the same modifier as CON = 10. That is intentional in D&D — odd scores give no benefit on their own; they are "saving up" for the next even score. This is working as designed, not a bug.

---

## Concept: `\t` and String Padding — Terminal Layout

**What it is:** Escape sequences (`\n`, `\t`) and the `<<` operator's chaining
let you format terminal output in aligned columns.

**The problem before:**
```cpp
std::cout << "STR: " << statSTR << " DEX: " << statDEX << std::endl;
// Output: STR: 14 DEX: 10
// Alignment breaks when numbers have different digit counts:
// STR: 9 DEX: 10  ← "9" is narrower than "14"
```

**The solution:** `\t` is a tab character. For precise alignment in the
terminal, adding spaces manually works best for simple cases:

```cpp
// \t inserts a tab stop (usually 8 spaces)
std::cout << "STR: " << statSTR << "\t" << "DEX: " << statDEX << std::endl;

// OR pad with spaces for fixed-width columns:
std::cout << "STR: " << statSTR;
if (statSTR < 10) std::cout << " ";  // extra space for single-digit
std::cout << "    DEX: " << statDEX << std::endl;
```

**Canonical example (General Explanation):**
A printed table with column headers — each column is a fixed number of characters wide so the rows line up regardless of the data values. The simplest version uses `\t` to jump to the next tab stop:
```cpp
std::cout << "Name:\t"  << "Erevan" << std::endl;
std::cout << "Level:\t" << 1        << std::endl;
std::cout << "HP:\t"    << 24       << std::endl;
```
The aligned output makes it immediately obvious when a value is missing or misplaced — a misaligned column is a visual bug detector.

**Project Application (The "Why" here):**
The character sheet box must be readable at a glance — misaligned stats break the "D&D character sheet" feel the game is going for. Right now we use `\t` and manual spacing. In LAB-08 we replace this with `std::setw` from `<iomanip>` for precise fixed-width fields, and eventually ANSI cursor-positioning for pixel-perfect terminal layouts. The manual spacing here is the baseline you will understand and improve upon.

**Smallest possible example:**
```cpp
std::cout << "Name:\t" << "Erevan"  << std::endl;
std::cout << "Level:\t" << 1        << std::endl;
std::cout << "HP:\t"    << 24       << std::endl;
```

**Why it matters here:** The character sheet must be readable at a glance.
Misaligned stats look unprofessional.

**Watch for:** Tab stops are terminal-dependent (usually every 8 characters).
They can cause misalignment if your strings have varying lengths. In later
labs we use ANSI cursor positioning for perfect alignment.

---

## Step 2 — The Character Sheet Function

The stat variables from Step 1 are already in `main()`. Now add the forward
declaration above `main` and the full `displayCharacterSheet` function below it.
Also add the `SHEET_WIDTH` constant and the forward declaration just below the
other constants:

```cpp
const int SHEET_WIDTH = 39;  // characters wide (inside the box borders)  // ← add this constant

// ── Forward declaration: displayCharacterSheet is defined below main ──  // ← add this block
void displayCharacterSheet(
    const std::string& name, int level,
    int str, int dex, int con, int intel, int wis, int cha,
    int hp, int maxHP, int mp, int maxMP,
    int atk, int def, int gold, int xp
);
```

Then replace the verification line inside `main` with the function call:

```cpp
    // Just verify the values for now
    std::cout << "Stats loaded. HP = " << playerHP << ", MP = " << playerMP << std::endl;
```

becomes:

```cpp
    displayCharacterSheet(                             // ← was: std::cout << "Stats loaded..."
        playerName, playerLevel,
        statSTR, statDEX, statCON, statINT, statWIS, statCHA,
        playerHP, playerMaxHP, playerMP, playerMaxMP,
        playerATK, playerDEF, playerGold, playerXP
    );
```

Then add the full function definition after the closing `}` of `main`:

```cpp
// ── Character sheet display ────────────────────────────────────  // ← add this entire function
void displayCharacterSheet(
    const std::string& name, int level,
    int str, int dex, int con, int intel, int wis, int cha,
    int hp, int maxHP, int mp, int maxMP,
    int atk, int def, int gold, int xp
) {
    std::cout << "  ┌─────────────────────────────────────┐" << std::endl;
    std::cout << "  │        CHARACTER SHEET              │" << std::endl;
    std::cout << "  ├─────────────────────────────────────┤" << std::endl;
    std::cout << "  │  Name:   " << name << std::endl;
    std::cout << "  │  Level:  " << level                      << std::endl;
    std::cout << "  │                                     │" << std::endl;
    std::cout << "  │  ── Core Stats ──                   │" << std::endl;
    std::cout << "  │  STR: " << str   << "    DEX: " << dex  << "    CON: " << con   << std::endl;
    std::cout << "  │  INT: " << intel << "    WIS: " << wis  << "    CHA: " << cha   << std::endl;
    std::cout << "  │                                     │" << std::endl;
    std::cout << "  │  ── Derived Stats ──                │" << std::endl;
    std::cout << "  │  HP:  " << hp  << " / " << maxHP
              << "    MP:  " << mp  << " / " << maxMP          << std::endl;
    std::cout << "  │  ATK: " << atk << "         DEF:  " << def << std::endl;
    std::cout << "  │  Gold: " << gold << "        XP:   " << xp << " / " << (level * 100) << std::endl;
    std::cout << "  └─────────────────────────────────────┘" << std::endl;
}
```

### SAVE AND TRY

Compile and run.

**You should see:**
```
  What is your name, brave adventurer? Erevan

  ┌─────────────────────────────────────┐
  │        CHARACTER SHEET              │
  ├─────────────────────────────────────┤
  │  Name:   Erevan
  │  Level:  1
  │
  │  ── Core Stats ──                   │
  │  STR: 14    DEX: 10    CON: 12
  │  INT: 16    WIS: 13    CHA: 8
  ...
```

The box borders are not fully aligned yet — that is fine. In Lab 08 we
use ANSI positioning for perfect alignment. For now the data is correct.

**In the terminal — test with a long name:**
Run again. Type `Erevan the Bold` (if you did the getline challenge).
Notice how the name line extends past the box. We will fix this in Lab 08.

**Change something:** Change `STARTING_STR` from `14` to `20`. Recompile.
Notice `ATK` changes from `7` to `10` (formula: `STR / 2`). Change it back.

---

## Challenge: Add a Derived Stat — Speed

**You know:** Derived stats are calculated from core stats. `ATK = STR / 2`.

**Task:** Add a `playerSPD` (speed) stat derived from DEX:
`SPD = 5 + (DEX - 10) / 2`
Print it on the derived stats line of the character sheet.

**Starting code:**
```cpp
int playerATK   = statSTR / 2;
int playerDEF   = statCON / 4;
// Add SPD here
```

**Hints:**
1. Follow the same pattern: `int playerSPD = 5 + (statDEX - 10) / 2;`
2. Add it to the `displayCharacterSheet` function signature and body.

---

<details>
<summary>▶ Show Solution</summary>

In `main()`, after ATK and DEF:
```cpp
int playerSPD = 5 + (statDEX - 10) / 2;
```

Add `spd` to `displayCharacterSheet`'s parameter list:
```cpp
void displayCharacterSheet(
    // ... existing params ...
    int atk, int def, int spd, int gold, int xp
) {
    // ...
    std::cout << "  │  ATK: " << atk << "  DEF: " << def << "  SPD: " << spd << std::endl;
}
```

Call with `playerSPD` added before `playerGold`.

With DEX = 10: SPD = 5 + 0 = 5.
With DEX = 16: SPD = 5 + 3 = 8.

**Key insight:** Adding a new derived stat is a two-step process: compute it
from core stats, then thread it through any display functions. This friction
is WHY we refactor to a `Character` struct in Lab 06 — passing 15 individual
parameters is unsustainable.

</details>

---

## Challenge: Bool Variables — Alive and Cursed

**You know:** `bool` stores `true` or `false`. 

**Task:** Add two bool variables:
- `bool isAlive = true;` — will become `false` when HP reaches 0
- `bool isCursed = false;` — will be `true` if the player has a curse

Print both at the bottom of the character sheet:
```
  │  Status:  Alive  [Not Cursed]
```
or
```
  │  Status:  Dead  [CURSED]
```
Use an `if` statement to choose which text to display. (You will learn `if`
formally in Lab 03, but this is a preview.)

---

<details>
<summary>▶ Show Solution</summary>

```cpp
bool isAlive  = true;
bool isCursed = false;
```

In `displayCharacterSheet` (add bool params to signature):
```cpp
std::cout << "  │  Status:  ";
if (isAlive) {
    std::cout << "Alive";
} else {
    std::cout << "DEAD";
}
std::cout << "  ";
if (isCursed) {
    std::cout << "[CURSED]";
} else {
    std::cout << "[Not Cursed]";
}
std::cout << std::endl;
```

**Key insight:** `bool` variables are perfect for binary game states. Rather
than using `int alive = 1` (a C-style habit), C++ `bool` communicates intent
clearly and prevents accidental values like `2` or `-1`.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Program compiles | `g++ -std=c++17 -o dungeon main.cpp` — no errors |
| Name prompt and input works | Run, type name, see it in the sheet |
| All 6 core stats display | See STR, DEX, CON, INT, WIS, CHA in the sheet |
| Derived stats are calculated correctly | STR=14 → ATK=7; CON=12 → maxHP=11 |
| Gold and XP display | See `Gold: 50  XP: 0 / 100` |
| Changing a constant updates dependent stats | Change STARTING_CON, recompile, see HP change |

---

## Quick Check Answers

**1. Why use `const int MAX_HP = 24` instead of just writing `24` directly?**
Three reasons. First, it gives the number a name so readers know what it
means — `STARTING_HP` is self-documenting, `24` is not. Second, if you
ever change the value, you change ONE line (the constant) and every use
updates automatically — no hunt-and-replace across thousands of lines.
Third, the compiler enforces immutability: trying to assign a new value to
a `const` is a compile error, preventing accidental modification.

**2. What is the difference between `int` and `float`? When would you use each?**
`int` stores whole numbers only — no fractional part. `float` stores decimal
numbers but with limited precision (~7 significant digits). Use `int` for
HP, gold, level, XP — anything counted in whole units. Use `float` for damage
multipliers (like 1.5× critical hit), percentages, or physics coordinates
(in a graphical game). In a terminal RPG, most things are `int` because
whole-number stats feel more game-like and are easier to reason about.

**3. Prediction: `int score = 10; score = score + 5;` — what prints?**
`15`. The right-hand side `score + 5` evaluates to `15`, then that value is
stored back into `score`. The original `10` is discarded. The shorthand
`score += 5` does the same thing in fewer characters.
