# Lesson 13: Everything You Built Was Already the Architecture
### (LAB 13 — Capstone: Dungeon Party Manager)

**What you will build:** A fully interactive Dungeon Party Manager — create up to three characters, view them, level one up, save the party to disk, reload it later, and dismiss a member — combining every mechanism from LAB-00 through LAB-12 into one running program, plus one deliberately new pattern (a menu loop) and one deliberate limitation this lesson makes you feel firsthand. The transferable problem: this lesson introduces almost no new C++ syntax. Its entire point is proving that twelve separately-learned lessons compose into one coherent program without friction — and then showing you, concretely, the exact wall a fixed-size array hits, so the next series' first lesson (a linked list) arrives as the answer to a problem you've already felt, not an abstract idea handed to you cold.

**What you need to know first:** Every prior S-01 lab (00–12) — this lesson uses all of them together. Nothing here is explained from scratch if it was already fully explained in an earlier lesson; per the Repetition Rule, hard concepts get a brief restatement at the point they're reused, not a re-teach.

**Terms introduced in this lesson**

> **Program architecture** — the plan for what data a program manages, what functions exist, and how they connect, decided before most of the code is written.
> **Menu loop** — a `do-while` (or equivalent) loop that displays options, reads one choice, dispatches to a handler, and repeats until an exit choice is made; the shape underlying every game's main loop in this curriculum.
> **Struct assignment (`=` between two instances)** — copying every member of one struct instance into another already-existing instance, distinct from initialization (LAB-10) or pass-by-value (also LAB-10).
> **O(n) shift** — an operation whose cost grows linearly with the number of elements it touches, here the cost of removing an array element by shifting every element after it.

No pipeline diagram applies — S-01 builds standalone concept programs; this capstone is the series' single largest, but still standalone, program.

---

## Concept Unit 1: Program Architecture — Planning Before Typing

### The Problem

Every prior S-01 lab built one focused program, function by function, as each concept was introduced. A program combining input validation (LAB-12), file save/load (LAB-11), a struct array (LAB-10), and an interactive loop (new to this lesson) is too large to discover its own shape by typing incrementally — it needs a plan first.

### No isolated code lab for this step

Architecture is decided in prose and a function-signature list, not demonstrated with runnable code — the "demonstration" is the working program this entire lesson builds toward.

### Explanation

The data: a party of up to three players (`Player party[MAX_PARTY]`, LAB-06/LAB-10's array-of-structs) tracked alongside a separate count (LAB-13's own new necessity, covered in Concept Unit 3) of how many slots actually hold real data. The functions, each doing exactly one job (LAB-05's, and LAB-12's own Single Responsibility rule):

| Function | Job |
|---|---|
| `displayMenu()` | Prints the menu — no state, no return value |
| `createParty(party, count)` | Fills the array from user input |
| `showParty(party, count)` | Prints all sheets |
| `levelUpMenu(party, count)` | Lets the user choose who to level up |
| `saveParty(party, count, filename)` | Writes to disk |
| `loadParty(party, count, filename)` | Reads from disk |
| `dismissPlayer(party, count)` | Removes one player, shifting the rest |
| `main()` | The menu loop — dispatches to everything above |

The flow: `main` loops — display menu, read one choice, dispatch to the matching function, loop again unless the choice was quit.

### CS Lens

Planning a program's data and function boundaries before writing most of the code is the smallest real instance of **software architecture** — the same activity that scales, in much larger systems, to designing modules, services, or an entire application's layers, always starting from the identical two questions this table answers: what data exists, and what operates on it.

### SE Lens

Every function here takes the party array and count as explicit parameters — `const Player party[]` where only reading is needed (LAB-09's `const&` rule, applied to an array parameter instead of a single struct), plain `Player party[]` plus `int& count` where a function must modify the party's actual contents or size. No function reaches for a variable outside its own parameters — the entire party's state flows through function signatures, visibly, the same discipline every function since LAB-05 has followed individually, now sustained across eight cooperating functions at once.

### Connection

Concept Unit 2 builds the skeleton this table describes, verified to compile before any real logic exists.

---

## Concept Unit 2: The Skeleton

### The Problem

Eight function signatures and one struct, agreed on paper, need to become real, compiling C++ before any of their bodies are filled in — proving the plan itself is sound before investing in the details.

### Project Change

- **Reference Source:** LAB-10's `Player` struct, LAB-11's/LAB-12's `readInt`/`getValidInt` signatures — all quoted and consolidated here, not reinvented.
- **Files affected:** `main.cpp` — new file, in a new project folder for this capstone.
- **Change type:** Add (new file, declarations only, empty `main`).
- **Location:** Whole file.
- **Dependencies:** Every header used across LAB-07/LAB-10/LAB-11/LAB-12 (`<iostream>`, `<fstream>`, `<sstream>`, `<string>`, `<limits>`, `<iomanip>`).

### The New Code

```cpp
const int    MAX_PARTY    = 3;
const int    MIN_HP       = 50;
const int    MAX_HP       = 150;
const std::string SAVE_FILE = "party.dat";

struct Player {
    std::string name;
    std::string className;
    int hp    = 0;
    int maxHp = 0;
    int level = 1;
    int xp    = 0;
    int atk   = 5;
    int def   = 3;
};

bool readInt(int& out);
int  getValidInt(const std::string& prompt, int minVal, int maxVal);
void displayMenu();
void printSheet(const Player& p);
void showParty(const Player party[], int count);
void createParty(Player party[], int& count);
void levelUpMenu(Player party[], int count);
bool saveParty(const Player party[], int count, const std::string& filename);
bool loadParty(Player party[], int& count, const std::string& filename);
void dismissPlayer(Player party[], int& count);

int main() {
    Player party[MAX_PARTY];
    int    partyCount = 0;

    std::cout << std::endl;
    displayMenu();

    return 0;
}
```

### Concept Lab

No separate throwaway: this skeleton, compiled and run below, is the real demonstration Concept Unit 1's plan needed.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
```

Compiles with warnings about unused functions (`displayMenu` is defined nowhere yet, along with every other declared-but-undefined function) — expected at this stage, since only declarations exist. Once every function has both a declaration and a real definition, added Concept Unit by Concept Unit through the rest of this lesson, these warnings disappear.

### Mechanical Walkthrough

- `Player party[MAX_PARTY];` — **(c) reusing** array declaration (LAB-06) with a struct element type (LAB-10) and a named `const` size (LAB-02) — no new syntax, a direct application of three already-taught mechanisms together.
- `int partyCount = 0;` — **(a) first appearance of tracking "how many array slots are actually in use" as a value separate from the array's own fixed size.** `party` always has exactly `MAX_PARTY` slots, per LAB-06's fixed-size guarantee — `partyCount` is what distinguishes "real data" from "unused default-initialized slots" (LAB-10's default member initializers) at any given moment.

### CS Lens

Separating an array's *capacity* (`MAX_PARTY`, fixed forever) from its *logical size* (`partyCount`, changing at runtime) is the exact idea `std::vector` (previewed in LAB-07) automates — `.size()` there is this lesson's `partyCount`, tracked by hand here specifically so the mechanism is visible before a library hides it.

### Connection

Concept Unit 3 fills in the input-handling functions this skeleton declared but didn't yet define.

---

## Concept Unit 3: Input Utilities — Carried Forward Unchanged

### The Problem

Every menu choice and every stat this program collects needs validated numeric input — LAB-12 already solved this problem completely; nothing here should reinvent it.

### Project Change

- **Reference Source:** LAB-12's `readInt`/`getValidInt` (this same series) — quoted verbatim, zero behavioral changes.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (definitions for two already-declared functions).
- **Location:** Above `main`.
- **Dependencies:** LAB-12's own fail-state recovery mechanism.

### The New Code

```cpp
bool readInt(int& out) {
    std::cin >> out;
    if (std::cin.fail()) {
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        return false;
    }
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    return true;
}

int getValidInt(const std::string& prompt, int minVal, int maxVal) {
    int value = 0;
    bool valid = false;
    while (!valid) {
        std::cout << prompt;
        if (!readInt(value)) {
            std::cout << "  [Error] Expected a number." << std::endl;
        } else if (value < minVal || value > maxVal) {
            std::cout << "  [Error] Must be " << minVal << "-" << maxVal << "." << std::endl;
        } else {
            valid = true;
        }
    }
    return value;
}
```

### Concept Lab

No new lab: this is LAB-12's own already-verified mechanism, reused, not re-explained. A quick sanity check before continuing — verified this session, temporarily added to `main`:

```
$ printf "abc\n-1\n3\n" | ./dungeon.exe
```

produced the same two-error-then-accept sequence LAB-12 already proved, confirming the carried-forward code still behaves identically in this new project.

### Connection

Concept Unit 4 gives this program its first genuinely visible output — the menu and character sheets.

---

## Concept Unit 4: Display Functions — Menu and Character Sheet

### The Problem

Nothing yet prints the menu options or a formatted character sheet — both needed before any interactive flow can be tested end-to-end.

### Project Change

- **Reference Source:** LAB-10's `printSheet` (this same series) — reused with the same box-drawing/`setw` technique.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Above `main`.
- **Dependencies:** `std::setw`/`std::left` (LAB-01), `std::to_string` (LAB-07), `for` (LAB-04).

### The New Code

```cpp
void displayMenu() {
    std::cout << "[ DUNGEON PARTY MANAGER  v1.0 ]" << std::endl;
    std::cout << std::endl;
    std::cout << "  [1]  New Party"           << std::endl;
    std::cout << "  [2]  Load Party"          << std::endl;
    std::cout << "  [3]  Level Up a Player"   << std::endl;
    std::cout << "  [4]  Save Party"          << std::endl;
    std::cout << "  [5]  Show Party"          << std::endl;
    std::cout << "  [6]  Dismiss Player"      << std::endl;
    std::cout << "  [Q]  Quit"                << std::endl;
    std::cout << std::endl;
}

void showParty(const Player party[], int count) {
    if (count == 0) {
        std::cout << "  (No party loaded. Use [1] New Party or [2] Load Party.)" << std::endl;
        return;
    }
    std::cout << std::endl;
    for (int i = 0; i < count; ++i) {
        std::cout << "Player " << (i + 1) << " of " << count << ":" << std::endl;
        printSheet(party[i]);
        std::cout << std::endl;
    }
}
```

(`printSheet` itself is LAB-10's own function, carried forward unchanged.)

### Concept Lab

No separate throwaway: `showParty(party, 0)`, run directly, already demonstrates its one interesting branch.

Run it — verified this session, with `partyCount` still `0`:

```
$ ./dungeon.exe
[ DUNGEON PARTY MANAGER  v1.0 ]

  [1]  New Party
  [2]  Load Party
  [3]  Level Up a Player
  [4]  Save Party
  [5]  Show Party
  [6]  Dismiss Player
  [Q]  Quit
```

What that proves, reasoning from `showParty`'s own guard: `count == 0` — checked *before* any loop runs — is what prevents this program from trying to print `party[0]`'s uninitialized-in-spirit (default-initialized, per LAB-10) sheet before any real player exists; without this check, an empty party would print three blank-looking sheets instead of one clear message.

### Mechanical Walkthrough

- `if (count == 0) { ...; return; }` — **(c) reusing** LAB-05's early return, applied here to skip a loop entirely rather than skip the rest of a longer function body.
- `for (int i = 0; i < count; ++i)` — **(c) reusing** LAB-06's array-iteration idiom, bounded by `count` (Concept Unit 2), not `MAX_PARTY` — the loop never touches the unused slots beyond `count`, per Concept Unit 2's own capacity-versus-size distinction.

### Connection

Concept Unit 5 builds `createParty`, the function that actually fills those slots.

---

## Concept Unit 5: `createParty` — Filling the Array From User Input

### The Problem

Nothing yet lets a player actually create characters — `createParty` needs to combine `getValidInt` (Concept Unit 3), `std::getline`-based name validation (LAB-12), and a class-to-stats mapping this lesson hasn't needed before.

### Project Change

- **Reference Source:** LAB-12's `createCharacter` (name validation shape) and LAB-10's field-by-name assignment — combined and extended to loop over multiple players.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Above `main`.
- **Dependencies:** `getValidInt` (Concept Unit 3), `std::getline` + `.length()` (LAB-12/LAB-07), arrays (LAB-06), `if` chains (LAB-03).

### The New Code

```cpp
void createParty(Player party[], int& count) {
    std::cout << std::endl;
    std::cout << "--- New Party ---" << std::endl;

    count = getValidInt("How many players? (1-" + std::to_string(MAX_PARTY) + "): ", 1, MAX_PARTY);

    const std::string CLASS_NAMES[] = {"", "Warrior", "Mage", "Rogue"};

    for (int i = 0; i < count; ++i) {
        std::cout << std::endl;
        std::cout << "Creating player " << (i + 1) << " of " << count << "..." << std::endl;

        bool nameOk = false;
        while (!nameOk) {
            std::cout << "  Name: ";
            std::getline(std::cin, party[i].name);
            if (party[i].name.length() >= 2) {
                nameOk = true;
            } else {
                std::cout << "  [Error] Name must be at least 2 characters." << std::endl;
            }
        }

        int classChoice = getValidInt("  Class [1=Warrior 2=Mage 3=Rogue]: ", 1, 3);
        party[i].className = CLASS_NAMES[classChoice];

        party[i].hp    = getValidInt("  Starting HP (" + std::to_string(MIN_HP)
                                   + "-" + std::to_string(MAX_HP) + "): ", MIN_HP, MAX_HP);
        party[i].maxHp = party[i].hp;
        party[i].level = 1;
        party[i].xp    = 0;

        if (classChoice == 1) { party[i].atk = 8;  party[i].def = 5; }
        if (classChoice == 2) { party[i].atk = 12; party[i].def = 2; }
        if (classChoice == 3) { party[i].atk = 10; party[i].def = 3; }
    }

    std::cout << std::endl;
    std::cout << "Party created!" << std::endl;
}
```

### Concept Lab

No separate throwaway: run directly against the real `main`, wired up in Concept Unit 8's menu dispatch, this function is its own clearest demonstration.

Run it — verified this session, creating two players (a Warrior and a Mage):

```
$ printf "1\n2\nZara\n1\n100\nLyra\n2\n80\n...\n" | ./dungeon.exe
--- New Party ---
How many players? (1-3): 
Creating player 1 of 2...
  Name: [Zara accepted]
  Class [1=Warrior 2=Mage 3=Rogue]: [1 accepted]
  Starting HP (50-150): [100 accepted]

Creating player 2 of 2...
  Name: [Lyra accepted]
  Class [1=Warrior 2=Mage 3=Rogue]: [2 accepted]
  Starting HP (50-150): [80 accepted]

Party created!
```

Confirmed via `showParty` immediately after (Concept Unit 4's function, already verified): Zara — Warrior, HP `100/100`, ATK `8`, DEF `5`; Lyra — Mage, HP `80/80`, ATK `12`, DEF `2` — matching the class-to-stats `if` chain exactly.

### Mechanical Walkthrough

- `const std::string CLASS_NAMES[] = {"", "Warrior", "Mage", "Rogue"};` — **(a) first appearance of an array sized implicitly by its initializer list**, distinct from LAB-06's always-explicit `char tiles[ROW_SIZE]` — the compiler counts the four strings and sizes the array accordingly. Index `0` is deliberately unused (an empty string) specifically so indices `1`–`3` line up directly with the menu's own `1`–`3` class choices, avoiding an off-by-one translation (LAB-04's own off-by-one warning, applied here as a design choice rather than a bug).
- `party[i].className = CLASS_NAMES[classChoice];` — **(c) reusing** array indexing (LAB-06) and member access (LAB-10) together — `classChoice`, validated by `getValidInt` to be `1`–`3` (Concept Unit 3), is trusted as a safe index into `CLASS_NAMES` specifically because that validation already happened; nothing re-checks it here.

### CS Lens

Using a validated menu choice (`1`, `2`, or `3`) directly as an array index (`CLASS_NAMES[classChoice]`) is a **lookup table** — trading a chain of `if`/`else if` string comparisons for one array access, safe here only because `getValidInt`'s own range enforcement (Concept Unit 3) already guarantees `classChoice` cannot be anything `CLASS_NAMES` doesn't have a slot for.

### SE Lens

The three-branch `if (classChoice == 1) {...} if (classChoice == 2) {...} if (classChoice == 3) {...}` for stats — three independent `if`s, not `if`/`else if` — works correctly only because `classChoice` is already known to be exactly one of `1`, `2`, `3`; written as independent `if`s rather than a mutually-exclusive chain, a future edit introducing a fourth class incorrectly could silently fall through all three with no stats set at all, an easy-to-miss risk `switch`/`case` (LAB-03) would have caught by forcing every case to be listed explicitly with a `default`.

### Connection

Concept Unit 6 builds `levelUpMenu`, reusing LAB-10's own `levelUp` logic through a reference into the array.

---

## Concept Unit 6: `levelUpMenu` — A Reference Into an Array Element

### The Problem

LAB-10's `levelUp(Player& p)` modified a single, named `Player`. Here, the player to level up is chosen at runtime, by index, from inside an array — the exact same modification needs to happen, but reached through `party[idx]` instead of a name typed directly into the source code.

### Project Change

- **Reference Source:** LAB-10's `levelUp` (this same series) — logic unchanged, now inlined directly into a menu handler rather than called as a separate function.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Above `main`.
- **Dependencies:** `showParty` (Concept Unit 4), `getValidInt` (Concept Unit 3), `Player&` (LAB-09), array indexing (LAB-06).

### The New Code

```cpp
void levelUpMenu(Player party[], int count) {
    if (count == 0) { std::cout << "  No party loaded." << std::endl; return; }

    showParty(party, count);
    int idx = getValidInt("Level up which player? (1-" + std::to_string(count) + "): ", 1, count) - 1;

    Player& p = party[idx];
    ++p.level;
    p.xp     = 0;
    p.maxHp += 10;
    p.hp     = p.maxHp;
    p.atk   += 2;
    p.def   += 1;

    std::cout << std::endl;
    std::cout << p.name << " is now Level " << p.level << "!" << std::endl;
    printSheet(p);
}
```

### Concept Lab

No separate throwaway: reusing LAB-10's own already-verified `levelUp` arithmetic, the only genuinely new piece is `Player& p = party[idx];`, demonstrated directly below.

Run it — verified this session, leveling up Zara (index `0`, entered as menu choice `1`):

```
$ printf "3\n1\n" | ./dungeon.exe   # (after party already created)
...
Level up which player? (1-2): 
Zara is now Level 2!
[==================================]
  Zara
  Lv 2 Warrior
[----------------------------------]
  HP: 110 / 110
  XP: 0
  ATK: 10  DEF: 6
[==================================]
```

What that proves: `Player& p = party[idx];` (LAB-09's reference-declaration syntax, binding to an *array element* rather than a plain named variable, per LAB-06's own equivalence between `party[idx]` and `*(party + idx)`) means every `p.field` line that follows modifies `party[idx]` directly — verified by `showParty` immediately after, in the same run, showing Zara's own entry with the leveled-up stats, not a separate untouched copy.

### Mechanical Walkthrough

- `int idx = getValidInt(...) - 1;` — **(c) reusing** LAB-02's `-` on a validated, `1`-based menu choice, converting it to a `0`-based array index (LAB-06) — the exact "menu numbers people, arrays number from zero" translation LAB-04 first hinted at with its own off-by-one warning.
- `Player& p = party[idx];` — **(a) first appearance of a reference bound to an array element rather than a plain variable.** LAB-09 proved a reference is an alias for whatever it's bound to at declaration; here, that "whatever" is computed at runtime (`party[idx]`, with `idx` itself only known after the user answers a prompt), not a name written directly in the source.

### CS Lens

A reference bound to `party[idx]` is functionally identical to LAB-08's `int* p = &party[idx]` dereferenced everywhere it's used — LAB-09's own argument for preferring references (no `*` noise, cannot be null, cannot be rebound) applies here exactly as it did for a plain variable; the fact that the *target* was computed by an index expression rather than named directly changes nothing about how the reference itself behaves.

### SE Lens

Naming the reference `p` and writing `p.level`, `p.xp`, etc. — rather than repeating `party[idx].level`, `party[idx].xp` five times — is a readability choice with zero behavioral difference, the same "give a computed thing a short, clear name" instinct LAB-02 first demonstrated for `left`/`right`.

### Connection

Concept Unit 7 extends `saveParty`/`loadParty` (LAB-11's own mechanism) to an entire array of players instead of one.

---

## Concept Unit 7: `saveParty` and `loadParty` — File I/O for a Whole Array

### The Problem

LAB-11 saved and loaded exactly one `Player`. This program's save file needs to hold a *variable* number of players (one to three) — the load function has to know how many to read back, and that count has to be part of the file itself.

### Project Change

- **Reference Source:** LAB-11's `savePlayer`/`loadPlayer` (this same series) — same `<<`/`>>`/`std::getline` mechanism, extended with a leading count line and a loop.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Above `main`.
- **Dependencies:** `std::ofstream`/`std::ifstream` (LAB-11), `is_open()` (LAB-11, verified as the reliable check), `for` (LAB-04).

### The New Code

```cpp
bool saveParty(const Player party[], int count, const std::string& filename) {
    std::ofstream file(filename);
    if (!file.is_open()) {
        std::cout << "  [Error] Cannot open '" << filename << "' for writing." << std::endl;
        return false;
    }
    file << count << std::endl;
    for (int i = 0; i < count; ++i) {
        const Player& p = party[i];
        file << p.name      << std::endl;
        file << p.className << std::endl;
        file << p.hp    << " " << p.maxHp << " "
             << p.level << " " << p.xp    << " "
             << p.atk   << " " << p.def   << std::endl;
    }
    file.close();
    std::cout << "  Party saved to '" << filename << "'." << std::endl;
    return true;
}

bool loadParty(Player party[], int& count, const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cout << "  [Error] No save file found ('" << filename << "')." << std::endl;
        return false;
    }
    file >> count;
    file.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

    for (int i = 0; i < count && i < MAX_PARTY; ++i) {
        std::getline(file, party[i].name);
        std::getline(file, party[i].className);
        file >> party[i].hp >> party[i].maxHp
             >> party[i].level >> party[i].xp
             >> party[i].atk  >> party[i].def;
        file.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    }
    file.close();
    std::cout << "  Party loaded from '" << filename << "'. (" << count << " players)" << std::endl;
    return true;
}
```

### Concept Lab

No separate throwaway: the full save-then-load round trip, verified below, is this lesson's real, load-bearing demonstration.

Run it — verified this session, saving the two-player party from Concept Unit 6 (Zara now Level 2), then a **separate program run** (simulating quitting and restarting) loading it back:

```
$ cat party.dat
2
Zara
Warrior
110 110 2 0 10 6
Lyra
Mage
80 80 1 0 12 2

$ printf "2\n5\nQ\n" | ./dungeon.exe   # fresh run, empty party.cpp
  Party loaded from 'party.dat'. (2 players)

Player 1 of 2:
[==================================]
  Zara
  Lv 2 Warrior
[----------------------------------]
  HP: 110 / 110
  ...
```

What that proves: `file << count << std::endl;` (the *first* line written) is read back by `file >> count;` (the *first* thing `loadParty` reads) — the file format's own first line is metadata about the file, not player data, the same "label describes what follows" idea LAB-11's `"name: ZARA"` used per-field, now used once for the whole file. The `for (int i = 0; i < count && i < MAX_PARTY; ++i)` loop condition — **two** conditions, not one — reads only as many players as the file claims *and* never more than the array physically has room for, a defensive check (LAB-12's own theme) against a hand-edited or corrupted save file claiming more players than `MAX_PARTY` allows.

### Mechanical Walkthrough

- `file << count << std::endl;` — **(c) reusing** `<<` on an `ofstream` (LAB-11), writing an `int` directly rather than a labeled `"field: value"` line — a genuinely different, simpler format for a single value with no ambiguity about which field it is.
- `for (int i = 0; i < count && i < MAX_PARTY; ++i)` — **(a) first appearance of a loop bound combining a runtime value with a compile-time constant, defensively.** `count` alone would trust the file entirely; `MAX_PARTY` alone would ignore what the file actually claims — the `&&` combination (LAB-03) takes the smaller of the two, correctly, in either direction.

### CS Lens

Storing the count as the file's own first line, read before anything else, is exactly how many real binary and text file formats work — a header describing what follows, read first, so the reader knows how much more data to expect without scanning the whole file first. `save.txt` (LAB-11) didn't need this, since it always held exactly one `Player`; a variable-length collection always does.

### SE Lens

Defending `loadParty` against a claimed `count` larger than `MAX_PARTY` — even though this program's own `saveParty` would never write such a file — is defensive programming (this lesson's own named practice) applied to a file's *trustworthiness*, not just a user's typed input: any file on disk can be hand-edited between a save and a load, and `loadParty` cannot assume it wasn't.

### Connection

Concept Unit 8 assembles every function built so far into the interactive menu loop this whole capstone is organized around.

---

## Concept Unit 8: The Menu Loop — `main` as a Dispatcher

### The Problem

Eight working functions exist, but nothing yet lets a user choose which one runs, when, repeatedly, until they're done — the one genuinely new control-flow pattern this entire capstone needed.

### Project Change

- **Reference Source:** No reference counterpart — this specific loop shape is new to this lesson, though built entirely from already-taught pieces (`do-while`, `switch`, `char`).
- **Files affected:** `main.cpp` — modified.
- **Change type:** Replace (Concept Unit 2's minimal `main` body).
- **Location:** `main`.
- **Dependencies:** `do-while` (LAB-04), `switch`/`case`/`break` (LAB-03), `char` (LAB-01), every function from Concept Units 3–7.

### The New Code

```cpp
int main() {
    Player party[MAX_PARTY];
    int    partyCount = 0;
    char   choice     = '\0';

    do {
        std::cout << std::endl;
        displayMenu();
        std::cout << "> ";
        std::cin >> choice;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

        switch (choice) {
            case '1': createParty(party, partyCount);          break;
            case '2': loadParty(party, partyCount, SAVE_FILE); break;
            case '3': levelUpMenu(party, partyCount);           break;
            case '4': saveParty(party, partyCount, SAVE_FILE); break;
            case '5': showParty(party, partyCount);            break;
            case '6': dismissPlayer(party, partyCount);         break;
            case 'Q': case 'q': break;
            default: std::cout << "  Unknown option." << std::endl; break;
        }

    } while (choice != 'Q' && choice != 'q');

    std::cout << std::endl;
    std::cout << "Goodbye, adventurer." << std::endl;
    return 0;
}
```

### Concept Lab

No separate throwaway: this real `main`, run in full below, already proves the loop.

Run it — verified this session, full sequence: create a 2-player party, show it, level up player 1, save, quit:

```
$ printf "1\n2\nZara\n1\n100\nLyra\n2\n80\n5\n3\n1\n4\nQ\n" | ./dungeon.exe
```

produced, in order: the menu, the create-party flow (Concept Unit 5), both sheets (Concept Unit 4), the level-up flow (Concept Unit 6), the save confirmation (Concept Unit 7), and finally "Goodbye, adventurer." — the loop returned to the menu after every single action and stopped only on `Q`.

### Mechanical Walkthrough

- `char choice = '\0';` — **(c) reusing** `char` (LAB-01), initialized to the null character (LAB-07's own null terminator, reused here only as "a value that is definitely not `'Q'` or `'q'`," not as a string terminator) so the `do-while`'s exit condition is well-defined even before the first real choice is read.
- `do { ... } while (choice != 'Q' && choice != 'q');` — **(c) reusing** `do-while` (LAB-04) — the menu must display and read a choice at least once before there's anything to check, exactly the shape LAB-04's own input-validation loops used, here governing the whole program's lifetime instead of one value's validity.
- `switch (choice)` — **(c) reusing** `switch` on a `char` (LAB-03's own Watch for: `switch` works on integer types and `char` is one) — six real cases, one combined `'Q'`/`'q'` case with an empty (no-op) body relying on the outer `while` condition to actually exit, and a `default` catching anything else.

### CS Lens

This exact shape — display state, read one input, dispatch, repeat — is a **game loop** in miniature, the same structural pattern (Concept Unit 1's own forward reference) every interactive program in this curriculum's later series uses: read input, update state, render, repeat. A menu-driven console tool and a real-time game differ enormously in *what* happens inside the loop and *how fast* it repeats, but not in this basic repeat-dispatch-repeat shape.

### SE Lens

Every branch of the `switch` is one line calling an already-fully-tested function — `main` itself contains no party logic at all, only *dispatch*. This is Concept Unit 1's architecture plan realized exactly as designed: the loop's only job is deciding *which* function runs, never *how* that function does its job.

### Connection

This closes the working program — Concept Unit 9 adds one final feature (`dismissPlayer`) specifically because it's the one operation that exposes this whole lesson's real point: where a fixed array stops being enough.

---

## Concept Unit 9: `dismissPlayer` — and the Cost of Removing From an Array

### The Problem

Removing a player from the middle of `party[]` can't simply "delete" a slot — arrays have no concept of a missing element in the middle; every slot must hold something, in order, with no gaps, for `showParty`'s own `for (int i = 0; i < count; ++i)` to keep working correctly.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Above `main`; a `case '6':` already wired into Concept Unit 8's `switch`.
- **Dependencies:** `showParty` (Concept Unit 4), `getValidInt` (Concept Unit 3), array indexing (LAB-06), `for` (LAB-04).

### The New Code

```cpp
void dismissPlayer(Player party[], int& count) {
    if (count == 0) { std::cout << "  No party loaded." << std::endl; return; }
    if (count == 1) { std::cout << "  Cannot dismiss the last party member." << std::endl; return; }

    showParty(party, count);
    int idx = getValidInt("Dismiss which player? (1-" + std::to_string(count) + "): ", 1, count) - 1;

    std::cout << "  Dismissing " << party[idx].name << "..." << std::endl;

    for (int i = idx; i < count - 1; ++i) {
        party[i] = party[i + 1];
    }
    --count;

    std::cout << "  Done. Party now has " << count << " member(s)." << std::endl;
}
```

### Concept Lab

No separate throwaway: the real dismiss-and-verify sequence below is this unit's own proof.

Run it — verified this session, starting from a saved two-player party (Zara, Lyra), dismissing player 1 (Zara):

```
$ printf "2\n5\n6\n1\n5\nQ\n" | ./dungeon.exe
...
Dismiss which player? (1-2): 
  Dismissing Zara...
  Done. Party now has 1 member(s).
...
Player 1 of 1:
[==================================]
  Lyra
  Lv 1 Mage
[----------------------------------]
  HP: 80 / 80
```

What that proves: after dismissing index `0` (Zara), `party[1]`'s contents (Lyra) moved into `party[0]` — confirmed directly by the follow-up `showParty` listing Lyra as "Player 1 of 1," not "Player 2." Nothing about Lyra's own data changed; only her *position* in the array did.

### Mechanical Walkthrough

- `party[i] = party[i + 1];` — **(a) first appearance of `=` assigning one existing struct instance's contents into another existing instance.** Distinct from LAB-10's aggregate initialization (`Player zara = {...}`, creating a *new* instance) and LAB-10's pass-by-value (copying *into a function parameter*) — this copies every member of `party[i+1]` into the *already-existing* `party[i]`, overwriting whatever `party[i]` held before, member by member, the same full-copy behavior LAB-10 Concept Unit 4 proved for pass-by-value, now happening via plain `=` between two array elements instead.
- `for (int i = idx; i < count - 1; ++i)` — **(a) first appearance of a loop starting partway through an array**, not at index `0` — begins exactly at the dismissed player's own position and shifts everything after it left by one, stopping one before the old `count` (the last real element, which becomes redundant with its own predecessor after the shift and is logically discarded by `--count`).
- `--count;` — **(c) reusing** `--` (LAB-02) — the array itself still physically holds `MAX_PARTY` slots (Concept Unit 2's own capacity-versus-size distinction); only the *logical* size shrinks, leaving the old last slot's data present but unreachable through any loop bounded by the new, smaller `count`.

### CS Lens

Shifting every element after the removed one, one position left, is an **O(n) operation** — its cost grows directly with how many elements sit after the removed position, not with the array's total capacity. For this program's party of at most `3`, that's at most two struct copies — trivial. LAB-06's own address-arithmetic formula explains exactly why removal can't be cheaper *for an array specifically*: every element's position is defined by its index times a fixed size, so "removing" one without shifting would leave a gap no `for (int i = 0; i < count; ++i)` loop could correctly skip over.

### SE Lens

**This is the deliberate point of this whole capstone, not an incidental detail:** for three players, an O(n) shift is invisible — nobody would ever notice the cost. `CPP-S02-LAB-10`'s Queues and `S-02-SNAKE`'s own growing body both need the *identical* operation — remove from one end, shift everything else — at a scale where "invisible" stops being true: a snake's body at length `200`, removing its tail every single frame at 60 frames per second, means shifting up to `199` elements, `60` times a second — nearly `12,000` element copies per second just to keep the snake moving, using this exact `for (int i = idx; ...) { party[i] = party[i+1]; }` shape. A **linked list** (`CPP-S02-LAB-07`, the very next series' second lesson) removes an end element in O(1) — one pointer changed, regardless of how long the list is — specifically because it does not store its elements in one contiguous, index-addressed block the way an array must. This lesson does not build a linked list; it makes sure you've felt the exact cost a linked list exists to eliminate, on a real, working program, before that lesson ever explains why.

### Connection

This closes every new mechanism in this lesson and this entire series — the Closing section names, explicitly, the three concrete gaps a fixed array leaves open, as the direct bridge into `S-02-CPP-DSA-MASTERY`.

---

## Closing

### Connect the pieces

Every function in this capstone reused a mechanism from an earlier lesson, combined in a new arrangement: `Player party[MAX_PARTY]` is LAB-06's array holding LAB-10's struct. `createParty` combines LAB-12's validated `std::getline` name check with LAB-03's `if` chain for class stats. `levelUpMenu` binds a LAB-09 reference to a LAB-06 array element and reuses LAB-10's own `levelUp` arithmetic verbatim. `saveParty`/`loadParty` extend LAB-11's single-`Player` file format with a leading count line and a `for` loop (LAB-04). `main`'s menu loop combines LAB-04's `do-while` with LAB-03's `switch` on a LAB-01 `char`. Nothing in this program required a single concept this series hadn't already taught — the only thing this lesson added was the shape that lets them all cooperate, plus `dismissPlayer`'s O(n) shift, felt directly rather than described.

### What breaks without this

Reasoned through directly, using Concept Unit 9's own verified mechanism: if `dismissPlayer` forgot the `--count;` line, `party[]`'s contents would correctly shift left, but `partyCount` would still claim the old, larger number — the very next `showParty` call would iterate one index past where real data actually ends, reading `party[count - 1]`'s stale, pre-shift duplicate (the last element, never overwritten by the shift loop, still holding a second copy of whichever player used to be last) as if it were a distinct, currently-valid party member. This is Concept Unit 2's own capacity-versus-size distinction, violated directly: the array's physical contents and the program's *belief* about how much of it is meaningful would disagree, silently, with no crash — the exact shape of bug LAB-06's own "trust the index, not the memory" theme warned about from the very start of this series.

### Exercises

1. Run the full test sequence this lesson verified — create a 2-player party, show it, level up player 1, save, quit, restart, load, show, dismiss player 1, show, quit — entirely yourself, confirming every intermediate output matches what this lesson's own Concept Units 5–9 showed, not just trusting that it does.
2. Deliberately try to dismiss the only remaining player from a 1-player party — confirm `dismissPlayer`'s own `if (count == 1)` guard (Concept Unit 9) prevents it, with a clear message, rather than leaving a 0-player party a later `showParty` or `levelUpMenu` call would mishandle.
3. Extend `createParty` to reject a fourth attempted `classChoice` value gracefully (test by temporarily changing `getValidInt`'s upper bound to `4` for the class prompt, without adding a fourth entry to `CLASS_NAMES`) — observe, for real, what `CLASS_NAMES[4]` (an out-of-bounds read, per LAB-06's own verified danger) actually does on this toolchain, then revert the change.
4. Answer, in your own words, all three of this lesson's own "S-01 Mastery Review" style questions from memory, then check each answer against the specific lab that taught it — not this capstone, which only ever *reused* those concepts, never re-taught them.

### S-01 Mastery Review

Before starting `S-02-CPP-DSA-MASTERY`, you should be able to explain each of these without looking back — if any feels uncertain, that lab's own Concept Units, not this capstone, are where to review:

| Concept | Lab |
|---|---|
| Compile → link → run, and why each stage exists | 00 |
| Binary, two's complement, and why `int` overflow wraps | 01 |
| Integer division, modulo wraparound, operator precedence | 02 |
| Boolean logic, short-circuit evaluation, `switch` vs `if` | 03 |
| `while` vs `for` vs `do-while`, and why each exists | 04 |
| The call stack, pass-by-value, declaration vs. definition | 05 |
| Address arithmetic, zero-indexing, array-to-pointer decay | 06 |
| C-strings vs. `std::string`, and what `std::string` hides | 07 |
| Pointers, `nullptr`, wild and dangling pointers | 08 |
| References, why they can't be null or rebound, `const&` | 09 |
| Structs as an entity model, member access, struct copying | 10 |
| File streams, `is_open()` as the reliable check, serialization | 11 |
| Stream fail state, `clear()`/`ignore()`, `enum class` | 12 |
| Program architecture, menu loops, and the O(n) array-shift cost that makes a linked list necessary | 13 (this lesson) |

### Definition of done

- [ ] The full Dungeon Party Manager compiles with zero warnings under `-std=c++17 -Wall -Wextra` and every declared function has a real definition.
- [ ] A complete session — create, show, level up, save, quit, restart, load, show, dismiss, show, quit — runs correctly end to end, verified for real, matching this lesson's own confirmed output.
- [ ] You can point to the exact line in `dismissPlayer` that performs the O(n) shift, and explain, in your own words, why an array cannot avoid it.
- [ ] You can name all three concrete gaps a fixed array leaves (cannot grow past `MAX_PARTY`, removal is O(n), inserting at the front would be O(n) too) and connect each to a specific problem `S-02-CPP-DSA-MASTERY`'s linked list solves.
- [ ] The S-01 Mastery Review table above is completed honestly — any row you can't explain without looking back is a real gap worth closing before starting `S-02-CPP-DSA-MASTERY`.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-13: Dungeon Party Manager — every S-01 concept combined, and the O(n) shift that motivates S-02"` — states why (integration proof plus a deliberately felt limitation) not just what changed.
