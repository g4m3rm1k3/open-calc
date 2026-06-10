# C++ Terminal RPG — LAB 05 — Functions & Rolling Dice

**Prerequisites:** LAB 04. You understand loops, the game loop, and basic
conditionals.

**What this lab adds:**
- Functions with parameters and return values
- Proper random number generation with seeding
- A full dice-rolling system (d4, d6, d8, d10, d12, d20)
- Character creation by rolling stats — like real D&D

**Time:** 50–65 minutes

---

## What You Will Build

The game now rolls your character's stats at startup:

```
  ┌──────────────────────────────────────┐
  │       CHARACTER CREATION             │
  └──────────────────────────────────────┘

  What is your name, brave adventurer? Erevan

  Rolling your ability scores... (4d6, drop lowest — D&D standard!)

    STR: 🎲 rolling 4d6... [4, 6, 3, 5] drop 3 → 15
    DEX: 🎲 rolling 4d6... [2, 4, 4, 6] drop 2 → 14
    CON: 🎲 rolling 4d6... [1, 3, 5, 6] drop 1 → 14
    INT: 🎲 rolling 4d6... [6, 6, 4, 2] drop 2 → 16
    WIS: 🎲 rolling 4d6... [3, 3, 4, 5] drop 3 → 12
    CHA: 🎲 rolling 4d6... [1, 2, 5, 6] drop 1 → 13

  Your scores have been set. Press ENTER to see your character sheet.
```

---

> **Quick Check — try to answer before reading:**
> 1. What does a function's return type tell the compiler?
> 2. What is `srand()` for, and what happens if you forget to call it?
> 3. Prediction: `int x = roll(6) + roll(6);` — what is the range of values
>    this can produce?
> *(Answers at the end of this lab)*

---

## Concept: Functions — Parameters and Return Values

**What it is:** A named, reusable block of code. Functions take input
(parameters), do something, and optionally send back a result (return value).

**The problem before:**
```cpp
// Damage calculation repeated everywhere — if the formula changes,
// you must find every copy and update each one:
int dmg1 = str / 2 + rand() % 6 + 1;
int dmg2 = str / 2 + rand() % 6 + 1;  // duplicate!
```

**The solution:**
```cpp
// Define once, use everywhere:
int calculateMeleeDamage(int strengthStat) {
    int bonusDamage = strengthStat / 2;         // strength modifier
    int diceDamage  = (rand() % 6) + 1;        // d6
    return bonusDamage + diceDamage;
}
// Use it:
int dmg1 = calculateMeleeDamage(str);
int dmg2 = calculateMeleeDamage(str);  // same formula, no duplication
```

**What it hides:** Hides the implementation details of the calculation. Callers
of `roll(D6)` don't need to know how random numbers work — they just get a 1–6
result. Invariant: the function's internal variables are private to its scope;
callers can't accidentally corrupt them.

**Canonical example (General Explanation):**

The key mechanism is **local scope** — every parameter and variable inside a function exists in its own isolated memory box that disappears when the function returns. When you call `addTwo(5)`, the compiler creates a new variable `n = 5` that has NOTHING to do with any `n` you might have in `main()`. The return value is the only thing that crosses back to the caller.

```cpp
int n = 100;              // main's 'n'
int result = addTwo(n);   // addTwo gets its OWN copy: n = 100, then computes 102
n = 999;                  // modifying main's 'n' doesn't affect addTwo's copy

// Inside addTwo, 'n' is a separate variable in separate memory.
// Changing main's 'n' AFTER the call doesn't change the already-returned result.
// Changing 'n' inside addTwo would not affect main's 'n' either.
```

This isolation is what makes functions safe to call from anywhere — they cannot accidentally read or write the caller's local variables. The only data exchange between caller and function is through parameters (going in) and the return value (coming back).

**Project Application (The "Why" here):**
Every dice roll in the RPG — attack damage, enemy HP rolls, loot drops, stat
generation — calls `roll(sides)` or `rollNd(count, sides)`. The formula lives
in one place, so changing how dice work (e.g., adding a critical-hit bonus)
requires editing exactly one function.

**Smallest possible example:**
```cpp
// A function that returns a random number from 1 to sides
int rollDice(int sides) {
    return (rand() % sides) + 1;
}

int main() {
    std::cout << rollDice(6)  << std::endl;  // 1-6
    std::cout << rollDice(20) << std::endl;  // 1-20
    return 0;
}
```

**Why it matters here:** Dice rolling, damage calculation, stat derivation —
all of these need to work the same way everywhere. Functions guarantee that.

**Watch for:** The return type before the function name MUST match what you
`return`. A function declared `int rollDice(...)` that tries to `return 3.7f`
will truncate the float to `3` silently. A function declared `void` must not
return a value at all.

---

## Concept: Return Values — What Comes Back

**What it is:** The value a function sends back to its caller. The return type
in the function signature declares what kind of data will come back.

**The problem before:**
```cpp
// Without a return value, the caller must repeat the calculation:
void printRoll(int sides) {
    std::cout << (rand() % sides) + 1 << std::endl;
    // caller cannot store or use the result
}
```

**The solution:**
```cpp
int roll(int sides) {
    return (rand() % sides) + 1;  // sends the value back to the caller
}

int damage = roll(D6) + roll(D6);  // caller can use the result
```

**Canonical example (General Explanation):**
A vending machine returning your snack — you press the button (call the
function), the machine does its work, and a snack comes out (return value).
If the machine returns nothing (`void`), it's like a light switch — it does
something but gives you nothing back.

```cpp
int getSnack(int buttonNumber) {
    return buttonNumber * 10;  // snack code comes back out
}

int mySnack = getSnack(3);  // mySnack = 30
```

The snack (return value) can be stored, printed, or used in another calculation.

**Project Application (The "Why" here):**
`roll(D20)` returns a value that the attack system stores, compares against
armor class, and adds to a damage total. Without a return value, each caller
would need to rewrite the dice formula — and the result couldn't be stored for
comparisons like `if (attackRoll >= enemyDef)`.

**Smallest possible example:**
```cpp
int double_it(int x) { return x * 2; }

int main() {
    int result = double_it(5);   // result = 10
    std::cout << result << std::endl;
    return 0;
}
```

**Why it matters here:** `rollAbilityScore()` returns the final stat value so
the caller can assign it to `statSTR`, `statDEX`, etc. and use those values to
compute derived stats like `maxHP`.

**Watch for:** If a non-`void` function reaches the end without hitting a
`return` statement, the behavior is undefined — the compiler may warn, but the
program can produce garbage values or crash.

---

### Math: Probability — Generating Random Numbers

**What it computes:** `rand()` produces a pseudorandom integer in [0, RAND_MAX].
We scale it to a range we want.

**The real-world analogy:** A physical die. Rolling a d6 gives any face (1–6)
with equal probability. `rand() % 6 + 1` maps any large random number to that
1–6 range.

**Canonical example:**
```
rand() % 6       → result in [0, 5]   (6 possible values)
rand() % 6 + 1   → result in [1, 6]   ← the d6 formula
rand() % N + min → result in [min, min+N-1]  ← general formula
```

**The code:**
```cpp
int roll(int sides) {
    return rand() % sides + 1;  // 1-indexed: 1 to sides
}
```

**Why it matters here:** Every dice roll in the game — attack damage, enemy HP,
loot drops — uses this formula. `D6 = 6`, `D8 = 8` are constants so the formula
reads like real dice notation.

**Watch for:** `rand() % sides` gives [0, sides-1]. Adding 1 shifts to
[1, sides]. Forgetting the +1 means a d6 could roll 0, which breaks damage
calculations.

---

## Concept: Random Numbers — `rand()`, `srand()`, and Seeding

**What it is:** `rand()` returns a pseudo-random integer. Without seeding,
it returns the SAME sequence every run. `srand()` sets the starting seed;
using the current time gives a different sequence each run.

**The problem before:**
```cpp
#include <cstdlib>
// Without srand():
std::cout << rand() % 6 << std::endl;  // prints e.g. 1
std::cout << rand() % 6 << std::endl;  // prints e.g. 4
// Run again:
std::cout << rand() % 6 << std::endl;  // prints 1 AGAIN — same sequence!
std::cout << rand() % 6 << std::endl;  // prints 4 AGAIN
```

**The solution:**
```cpp
#include <cstdlib>
#include <ctime>

// Call ONCE at the very start of main():
srand(static_cast<unsigned int>(time(nullptr)));  // seed with current time

// Now each run produces a different sequence:
std::cout << rand() % 6 << std::endl;  // different each run
```

`srand(time(nullptr))` — seeding with time makes each run produce different
numbers. Without it, `rand()` produces the SAME sequence every run
(deterministic). The Unix timestamp changes every second, giving a new starting
point each time the program launches.

**Canonical example (General Explanation):**
A shuffled deck of cards — `srand()` is the initial shuffle. Without shuffling
(no `srand()`), the deck is always in the same factory order. `time(nullptr)`
uses the current clock second as the shuffle seed, so every run starts with a
different deck.

```cpp
#include <cstdlib>
#include <ctime>

srand(static_cast<unsigned int>(time(nullptr)));  // shuffle once
int card = rand() % 52;  // draw a random card (0-51)
```

One shuffle at the start, then any number of draws — all different each run.

**Project Application (The "Why" here):**
Without seeding, every dungeon run is identical — the same enemies appear, the
same loot drops, every roll is predictable. Seeding in `main()` before any dice
rolls ensures the entire session is unique.

**Smallest possible example:**
```cpp
#include <cstdlib>
#include <ctime>
#include <iostream>

int main() {
    srand(static_cast<unsigned int>(time(nullptr)));  // seed once
    for (int roll = 0; roll < 3; roll++) {
        std::cout << (rand() % 6) + 1 << std::endl;  // prints 1-6
    }
    return 0;
}
```

**Why it matters here:** Without seeding, every dungeon run is identical.
The same enemies appear, the same loot drops, every roll is predictable.
Seeding makes every playthrough unique.

**Watch for:** Call `srand()` exactly ONCE at the start of `main()`. Calling
it multiple times (e.g., inside a loop) reseeds the generator and makes
randomness less random, not more.

---

## Step 1 — The Dice Rolling Functions

Create a new section at the top of `main.cpp` (after includes, before other
functions):

```cpp
#include <iostream>
#include <string>
#include <cstdlib>  // for rand(), srand()
#include <ctime>    // for time()
#include <climits>  // for INT_MAX

// ── Dice constants ────────────────────────────────────────────
const int D4  =  4;   // 4-sided die  — daggers, magic missiles
const int D6  =  6;   // 6-sided die  — swords, fireballs
const int D8  =  8;   // 8-sided die  — longswords, warhammers
const int D10 = 10;   // 10-sided die — greataxes, lightning bolt
const int D12 = 12;   // 12-sided die — mauls, greatclubs
const int D20 = 20;   // 20-sided die — the iconic D&D "fate die"

// ── Core dice roller ──────────────────────────────────────────
// Returns a random integer in [1, sides] — the standard dice roll
int roll(int sides) {
    return (rand() % sides) + 1;
}
```

Add to the top of `main()`:
```cpp
srand(static_cast<unsigned int>(time(nullptr)));  // seed once  // ← add this
```

Test in main with a temporary line:
```cpp
std::cout << "d20 test: " << roll(D20) << std::endl;
```

### SAVE AND TRY

Compile and run several times.

**You should see:** Different numbers each run:
```
d20 test: 14
```
Next run:
```
d20 test: 7
```

**In the terminal — verify the range:**
Compile and run 10 times. The d20 value should always be between 1 and 20.

**Change something:** Change `roll(D20)` to `roll(D4)`. The result should
always be 1–4. Change it back.

---

Now add the multi-dice and advantage functions:

```cpp
// ── Roll NdX (multiple dice, sum them) ────────────────────────
// Example: rollNd(3, D6) = 3d6 = sum of 3 six-sided dice (3–18)
int rollNd(int count, int sides) {
    int total = 0;
    for (int dieNum = 0; dieNum < count; dieNum++) {
        total += roll(sides);
    }
    return total;
}

// ── Roll with advantage (roll twice, take higher) ─────────────
// Used for ability checks when circumstances favour the player
int rollWithAdvantage(int sides) {
    int roll1 = roll(sides);
    int roll2 = roll(sides);
    return (roll1 > roll2) ? roll1 : roll2;  // ternary: condition ? ifTrue : ifFalse
}

// ── Roll with disadvantage (roll twice, take lower) ───────────
int rollWithDisadvantage(int sides) {
    int roll1 = roll(sides);
    int roll2 = roll(sides);
    return (roll1 < roll2) ? roll1 : roll2;
}
```

Test both in main:
```cpp
std::cout << "3d6 test: " << rollNd(3, D6) << std::endl;  // ← add this
```

### SAVE AND TRY

Compile and run several times.

**You should see:** Different numbers each run:
```
d20 test: 14
3d6 test: 11
```
Next run:
```
d20 test: 7
3d6 test: 8
```

**In the terminal — verify the range:**
Compile and run 10 times. The d20 value should be between 1 and 20.

**Change something:** Change `rollNd(3, D6)` to `rollNd(10, D6)`.
The result should now be between 10 and 60. Change it back.

---

## Concept: The Ternary Operator `? :`

**What it is:** A compact one-line `if/else` that evaluates to a value.
```
condition ? value_if_true : value_if_false
```

**The problem before:**
```cpp
int higher;
if (roll1 > roll2) {
    higher = roll1;
} else {
    higher = roll2;
}
```

**The solution:**
```cpp
int higher = (roll1 > roll2) ? roll1 : roll2;
```

**Canonical example (General Explanation):**
An airport sign — "Gate A or Gate B?" The sign picks one destination to display
based on a condition. The result is a single value (the gate), not a sequence
of actions.

```cpp
int speed = 80;
std::string sign = (speed > 65) ? "Speeding" : "Legal";
std::cout << sign << std::endl;  // "Speeding"
```

One condition, two possible values — the ternary returns whichever applies.

**Project Application (The "Why" here):**
`rollWithAdvantage` uses the ternary to select the higher of two dice rolls in
one line. Later labs use it for conditional display strings like
`(hero.alive ? "Active" : "Defeated")` in status messages.

**Smallest possible example:**
```cpp
int hp = 5;
std::string status = (hp <= 0) ? "Dead" : "Alive";
std::cout << status << std::endl;  // prints "Alive"
```

**Why it matters here:** Used in `rollWithAdvantage` and later for
conditional display strings. Keep it for simple choices; use `if/else`
for anything more complex than one line.

**Watch for:** Nesting ternaries (`a ? b : c ? d : e`) creates unreadable
code. Never nest them. Use `if/else` the moment it requires two levels.

---

## Step 2 — The 4d6-Drop-Lowest Stat Roller

This is the standard D&D method: roll 4d6, drop the lowest die, sum the rest.

Add above `main()`:

```cpp
// ── 4d6 drop lowest — D&D ability score generation ───────────
// Rolls four d6s, removes the lowest, returns the sum (range 3–18)
int rollAbilityScore() {
    const int NUM_DICE = 4;
    int dice[NUM_DICE];

    // Roll 4 dice and store the results
    for (int diceIndex = 0; diceIndex < NUM_DICE; diceIndex++) {
        dice[diceIndex] = roll(D6);
    }

    // Find the lowest roll (to drop it)
    int lowestValue = dice[0];
    for (int diceIndex = 1; diceIndex < NUM_DICE; diceIndex++) {
        if (dice[diceIndex] < lowestValue) {
            lowestValue = dice[diceIndex];
        }
    }

    // Sum all dice except the lowest
    int total = 0;
    bool droppedOne = false;  // ensure we drop exactly one die
    for (int diceIndex = 0; diceIndex < NUM_DICE; diceIndex++) {
        if (dice[diceIndex] == lowestValue && !droppedOne) {
            droppedOne = true;   // skip this die (drop it)
        } else {
            total += dice[diceIndex];
        }
    }

    return total;
}

// ── Display the roll with drama ───────────────────────────────
// Shows the individual dice before revealing the final score
int rollAndDisplayAbilityScore(const std::string& statName) {
    const int NUM_DICE = 4;
    int dice[NUM_DICE];

    for (int diceIndex = 0; diceIndex < NUM_DICE; diceIndex++) {
        dice[diceIndex] = roll(D6);
    }

    // Find minimum
    int lowestIndex = 0;
    for (int diceIndex = 1; diceIndex < NUM_DICE; diceIndex++) {
        if (dice[diceIndex] < dice[lowestIndex]) {
            lowestIndex = diceIndex;
        }
    }

    // Sum without minimum
    int total = 0;
    for (int diceIndex = 0; diceIndex < NUM_DICE; diceIndex++) {
        if (diceIndex != lowestIndex) {
            total += dice[diceIndex];
        }
    }

    // Print the roll with drama
    std::cout << "    " << statName << ": rolling 4d6... [";
    for (int diceIndex = 0; diceIndex < NUM_DICE; diceIndex++) {
        if (diceIndex == lowestIndex) {
            std::cout << "(" << dice[diceIndex] << ")";  // parentheses = dropped
        } else {
            std::cout << dice[diceIndex];
        }
        if (diceIndex < NUM_DICE - 1) std::cout << ", ";
    }
    std::cout << "] → " << total << std::endl;

    return total;
}
```

---

## Step 3 — Character Creation with Rolled Stats

Replace the fixed stat constants in `main()` with rolled ones:

```cpp
int main() {
    srand(static_cast<unsigned int>(time(nullptr)));

    // ── Character Creation ─────────────────────────────────────
    std::cout << "  ┌──────────────────────────────────────┐" << std::endl;
    std::cout << "  │       CHARACTER CREATION             │" << std::endl;
    std::cout << "  └──────────────────────────────────────┘" << std::endl;
    std::cout << std::endl;

    std::cout << "  What is your name, brave adventurer? ";
    std::string playerName;
    std::cin >> playerName;
    std::cout << std::endl;

    std::cout << "  Rolling your ability scores (4d6, drop lowest)..." << std::endl;
    std::cout << std::endl;

    // Roll each stat and display the dice
    int statSTR = rollAndDisplayAbilityScore("STR");
    int statDEX = rollAndDisplayAbilityScore("DEX");
    int statCON = rollAndDisplayAbilityScore("CON");
    int statINT = rollAndDisplayAbilityScore("INT");
    int statWIS = rollAndDisplayAbilityScore("WIS");
    int statCHA = rollAndDisplayAbilityScore("CHA");

    // Derived stats from rolled values
    int playerLevel  = 1;
    int playerMaxHP  = 10 + (statCON - 10) / 2;
    int playerMaxMP  =  8 + (statINT - 10) / 2;
    int playerHP     = playerMaxHP;
    int playerMP     = playerMaxMP;
    int playerATK    = statSTR / 2;
    int playerDEF    = statCON / 4;
    int playerGold   = 50;
    int playerXP     = 0;

    std::cout << std::endl;
    std::cout << "  Press ENTER to see your character sheet...";
    std::cin.ignore();
    std::cin.get();

    // Display the sheet (reuse the function from Lab 02)
    displayCharacterSheet(
        playerName, playerLevel,
        statSTR, statDEX, statCON, statINT, statWIS, statCHA,
        playerHP, playerMaxHP, playerMP, playerMaxMP,
        playerATK, playerDEF, playerGold, playerXP
    );

    // ... (game loop from Lab 04 follows here unchanged)
    // ... keep the while (isRunning) { ... } block from Lab 04
}
```

### SAVE AND TRY

Compile and run several times.

**You should see:** Different stats each run. One run might give you a STR
warrior, another an INT wizard.

**In the terminal — find the pattern:**
Run 5 times. Notice: values cluster around 10–14 because the 4d6-drop-lowest
method favors the middle of the distribution. Rarely will you see 3 or 18.

**Change something:** Replace `rollAndDisplayAbilityScore("STR")` with
`rollWithAdvantage(D6) + rollWithAdvantage(D6) + rollWithAdvantage(D6)`.
Notice the scores are higher on average (advantage on each die).
Change it back.

---

## Challenge: The Reroll Option

**You know:** Functions, loops, user input, character stat rolling.

**Task:** After showing all 6 rolled stats, ask the player:
`"Accept these rolls? (y/n)"`. If they type `n`, roll all stats again and
ask again. Keep asking until they accept. 

Add a maximum of 3 rerolls — after 3 rerolls, force them to accept their
last rolls.

**Starting code (where to add it):**
```cpp
// After rolling all 6 stats, before the "Press ENTER" prompt:
bool statsAccepted = false;
int  rerollCount   = 0;
const int MAX_REROLLS = 3;
// Your loop goes here
```

---

<details>
<summary>▶ Show Solution</summary>

```cpp
bool statsAccepted = false;
int  rerollCount   = 0;
const int MAX_REROLLS = 3;

while (!statsAccepted) {
    // Roll all stats
    std::cout << "  Rolling your ability scores (4d6, drop lowest)..." << std::endl;
    std::cout << std::endl;
    statSTR = rollAndDisplayAbilityScore("STR");
    statDEX = rollAndDisplayAbilityScore("DEX");
    statCON = rollAndDisplayAbilityScore("CON");
    statINT = rollAndDisplayAbilityScore("INT");
    statWIS = rollAndDisplayAbilityScore("WIS");
    statCHA = rollAndDisplayAbilityScore("CHA");
    std::cout << std::endl;

    if (rerollCount >= MAX_REROLLS) {
        std::cout << "  No more rerolls. Accepting current scores." << std::endl;
        statsAccepted = true;
    } else {
        std::cout << "  Accept these rolls? (y/n): ";
        char choice;
        std::cin >> choice;
        if (choice == 'y' || choice == 'Y') {
            statsAccepted = true;
        } else {
            rerollCount++;
            std::cout << "  Rerolling... (" << rerollCount << "/" << MAX_REROLLS << " rerolls used)" << std::endl;
            std::cout << std::endl;
        }
    }
}
```

**Key insight:** The `while (!statsAccepted)` loop is a classic "confirmation
loop" — keep trying until the user is satisfied, up to a limit. The
`MAX_REROLLS` constant prevents infinite rerolling (which would feel
unconstrained in a real game). Naming the cap as a constant documents the
game design decision: "we allow 3 rerolls by design."

</details>

---

## Challenge: Roll With Advantage for a Chosen Stat

**You know:** `rollWithAdvantage()` rolls twice and takes the higher result.

**Task:** Before the final roll, ask:
`"Which stat do you want rolled with advantage? (STR/DEX/CON/INT/WIS/CHA)"`.
That one stat uses `rollWithAdvantage(D6) + rollWithAdvantage(D6) + rollWithAdvantage(D6)`
instead of the standard 4d6-drop-lowest. All others roll normally.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
std::cout << "  Choose a stat for ADVANTAGE (STR/DEX/CON/INT/WIS/CHA): ";
std::string advantageStat;
std::cin >> advantageStat;

// Convert to uppercase for comparison
for (char& letter : advantageStat) {
    letter = toupper(letter);
}

// Helper lambda to decide which roller to use (preview of Lab 14 concepts)
// For now, just use if/else:
int rolledSTR = (advantageStat == "STR") ?
    rollWithAdvantage(D6) + rollWithAdvantage(D6) + rollWithAdvantage(D6) :
    rollAndDisplayAbilityScore("STR");
// Repeat for DEX, CON, INT, WIS, CHA...
```

**Key insight:** String comparison in C++ uses `==` (same as int comparison)
when comparing two `std::string` objects. Comparing with a string literal
like `"STR"` works because C++ automatically creates a temporary `std::string`
from the literal for the comparison. Converting to uppercase first ensures
`"str"`, `"Str"`, and `"STR"` all work.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `srand` is called once in `main()` | Run twice — see different numbers |
| `roll(6)` returns values 1–6 | Run 10 times — never see 0 or 7 |
| `rollNd(3, D6)` returns values 3–18 | Run 10 times — within that range |
| `rollWithAdvantage(D20)` tends higher than `roll(D20)` | Run both 20 times — compare averages |
| Character creation shows all 6 stats with dice display | Run — see the dice breakdown |
| Stats vary between runs | Run 3 times — at least one stat differs |
| Derived stats (HP, MP) use rolled CON/INT | High CON → higher maxHP |

---

## Quick Check Answers

**1. What does a function's return type tell the compiler?**
The return type declares what kind of data the function sends back to its
caller. `int rollDice(int sides)` promises to return an `int`. The compiler
verifies that every `return` statement in the function returns an `int`-compatible
value. If the return type is `void`, the function returns nothing. The return
type also determines what the caller can do with the result — you can write
`int damage = calculateDamage(str)` only because `calculateDamage` returns `int`.

**2. What is `srand()` for, and what happens if you forget it?**
`srand()` seeds the pseudo-random number generator — it sets the starting
point of the number sequence that `rand()` produces. Without seeding, the
generator always starts from the same default seed (usually 1), producing
the SAME sequence every run: same dice rolls, same dungeon layout, same
"random" events. Calling `srand(time(nullptr))` uses the current Unix timestamp
as the seed, giving a different sequence every second. In a game, forgetting
`srand()` means the player sees exactly the same dungeon every time they play.

**3. Prediction: `int x = roll(6) + roll(6);` — what is the range?**
Minimum: 1 + 1 = 2. Maximum: 6 + 6 = 12. The range is [2, 12], exactly like
rolling two standard d6 dice. The distribution is NOT uniform: 7 is the most
likely result (6 ways to roll it), while 2 and 12 are the least likely
(1 way each). This bell-curve distribution is why D&D uses multiple dice for
damage — results cluster around the middle, making extreme outcomes rare and
dramatic.
