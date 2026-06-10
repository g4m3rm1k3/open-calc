# C++ Masterclass — S-01 — LAB 13 — Capstone: Dungeon Party Manager

**Prerequisites:** All S-01 labs (00–12). This lab uses every concept taught in this series.

**What this lab adds:**
- Integration — combining all S-01 concepts into one coherent program
- A menu loop — the main game loop pattern every game in this masterclass uses
- Connecting file I/O to a live, interactive program
- Observing where fixed arrays break down — the gap that S-02 (Snake) fills
- A complete, working program you can show to someone and explain fully

**Time:** ~90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. The party manager needs to support 1 to 3 players. You have been using
>    `Player party[3]` — a fixed-size array. What happens to `party[1]` and
>    `party[2]` if the user only creates one player?
> 2. The menu loop runs until the user chooses "Quit." Which loop type is most
>    natural for this — `while`, `for`, or `do-while`? Why?
> 3. After completing this lab, what do you think the fundamental limitation of
>    everything you have built so far is? What can you NOT do with fixed arrays,
>    basic functions, and `std::cout`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A **Dungeon Party Manager** — a fully interactive console application that ties
together everything from S-01. You can actually use this:

```
╔════════════════════════════════════╗
║    DUNGEON PARTY MANAGER  v1.0     ║
╚════════════════════════════════════╝

  [1]  New Party
  [2]  Load Party
  [3]  Level Up a Player
  [4]  Save Party
  [5]  Show Party
  [Q]  Quit

> 1

--- New Party ---
How many players? (1-3): 2

Creating player 1 of 2...
  Name: Zara
  Class [1=Warrior 2=Mage 3=Rogue]: 1
  Starting HP (50-150): 100

Creating player 2 of 2...
  Name: Lyra
  Class [1=Warrior 2=Mage 3=Rogue]: 2
  Starting HP (50-150): 80

Party created!
> 5
[... both sheets displayed ...]
> 4
Party saved to 'party.dat'.
> Q
Goodbye, adventurer.
```

---

## Part 1 — Program Architecture

### Concept: Program Architecture — Organizing Before You Write

**What it is:** Before writing a program larger than a few functions, you plan its
structure: what data it manages, what functions exist, and how they connect.

**The data:** A party of up to 3 players, tracked with their count.
**The functions:**
- `displayMenu()` — prints the menu
- `createParty(party, count)` — fills the array from user input
- `showParty(party, count)` — prints all sheets
- `levelUpMenu(party, count)` — lets the user choose who to level up
- `saveParty(party, count, filename)` — writes to disk
- `loadParty(party, count, filename)` — reads from disk
- `main()` — the menu loop, dispatches to all the above

**The flow:**
```
main() loop:
  → display menu
  → read choice
  → dispatch to function
  → loop again (unless Q)
```

This is exactly the structure every game engine in this masterclass uses. In S-02
Snake, `main()` will be a game loop that reads input, updates state, and renders.
Same pattern — different content.

---

## Step 1 — The Skeleton

Create a new folder: `c:\Users\g4m3r\Desktop\cadcam\masterclass\S-01-CPP-FOUNDATIONS\capstone\`

Inside it, a new `main.cpp`. Type the skeleton and verify it compiles before adding logic:

```cpp
#include <iostream>    // std::cout, std::cin, std::endl
#include <fstream>     // std::ofstream, std::ifstream
#include <sstream>     // std::istringstream
#include <string>      // std::string
#include <limits>      // std::numeric_limits
#include <iomanip>     // std::setw, std::left

// ── Constants ─────────────────────────────────────────────────────────────────
const int    MAX_PARTY    = 3;
const int    MIN_HP       = 50;
const int    MAX_HP       = 150;
const std::string SAVE_FILE = "party.dat";

// ── Player Struct (consolidated from LAB 10) ──────────────────────────────────
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

// ── Forward Declarations ──────────────────────────────────────────────────────
bool readInt(int& out);
int  getValidInt(const std::string& prompt, int minVal, int maxVal);
void displayMenu();
void printSheet(const Player& p);
void showParty(const Player party[], int count);
void createParty(Player party[], int& count);
void levelUpMenu(Player party[], int count);
bool saveParty(const Player party[], int count, const std::string& filename);
bool loadParty(Player party[], int& count, const std::string& filename);

// ── main ──────────────────────────────────────────────────────────────────────
int main() {
    Player party[MAX_PARTY];
    int    partyCount = 0;   // how many players are actually in the party

    std::cout << std::endl;
    displayMenu();

    return 0;
}
```

### SAVE AND TRY

Create a `Makefile` in the capstone folder:

```makefile
CXX      = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -g
dungeon: main.cpp
	$(CXX) $(CXXFLAGS) main.cpp -o dungeon
clean:
	-del dungeon.exe
```

```
make
.\dungeon
```

**You should see:** The program compiles with warnings about unused functions (expected)
and exits. The skeleton is clean. Now add each function one at a time.

---

## Step 2 — Input Utilities (from LAB 12)

Add these before `main()`. These are the robust versions:

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
            std::cout << "  [Error] Must be " << minVal << "–" << maxVal << "." << std::endl;
        } else {
            valid = true;
        }
    }
    return value;
}
```

### SAVE AND TRY

No visible change yet — add a quick test in `main` before `displayMenu`:
```cpp
    int test = getValidInt("Test (1-5): ", 1, 5);
    std::cout << "Got: " << test << std::endl;
```
Type `abc`, then `-1`, then `3`. Verify error messages appear. Remove the test line.

---

## Step 3 — Display Menu and Character Sheet

```cpp
void displayMenu() {
    std::cout << "╔════════════════════════════════════╗" << std::endl;
    std::cout << "║    DUNGEON PARTY MANAGER  v1.0     ║" << std::endl;
    std::cout << "╚════════════════════════════════════╝" << std::endl;
    std::cout << std::endl;
    std::cout << "  [1]  New Party"           << std::endl;
    std::cout << "  [2]  Load Party"          << std::endl;
    std::cout << "  [3]  Level Up a Player"   << std::endl;
    std::cout << "  [4]  Save Party"          << std::endl;
    std::cout << "  [5]  Show Party"          << std::endl;
    std::cout << "  [Q]  Quit"                << std::endl;
    std::cout << std::endl;
}

void printSheet(const Player& p) {
    const int W = 34;
    std::cout << "╔══════════════════════════════════╗" << std::endl;
    std::cout << "║  " << std::left << std::setw(W - 2) << p.name           << "║" << std::endl;
    std::cout << "║  " << std::setw(W - 2)
              << ("Lv " + std::to_string(p.level) + " " + p.className)      << "║" << std::endl;
    std::cout << "╠══════════════════════════════════╣" << std::endl;
    std::cout << "║  " << std::setw(W - 2)
              << ("HP: " + std::to_string(p.hp) + " / " + std::to_string(p.maxHp)) << "║" << std::endl;
    std::cout << "║  " << std::setw(W - 2)
              << ("XP: " + std::to_string(p.xp))                            << "║" << std::endl;
    std::cout << "║  " << std::setw(W - 2)
              << ("ATK: " + std::to_string(p.atk) + "  DEF: " + std::to_string(p.def)) << "║" << std::endl;
    std::cout << "╚══════════════════════════════════╝" << std::endl;
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

### SAVE AND TRY

Add `showParty(party, partyCount);` in `main()`. Run. You should see the menu header
and the "no party" message.

---

## Step 4 — Create Party

```cpp
void createParty(Player party[], int& count) {
    std::cout << std::endl;
    std::cout << "--- New Party ---" << std::endl;

    // count is passed by reference — we update it directly
    count = getValidInt("How many players? (1-" + std::to_string(MAX_PARTY) + "): ", 1, MAX_PARTY);

    const std::string CLASS_NAMES[] = {"", "Warrior", "Mage", "Rogue"};
    //                                  ↑ index 0 unused — class choices are 1,2,3

    for (int i = 0; i < count; ++i) {
        std::cout << std::endl;
        std::cout << "Creating player " << (i + 1) << " of " << count << "..." << std::endl;

        // Name (must be at least 2 chars)
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

        // Class
        int classChoice = getValidInt("  Class [1=Warrior 2=Mage 3=Rogue]: ", 1, 3);
        party[i].className = CLASS_NAMES[classChoice];

        // Stats based on class
        party[i].hp    = getValidInt("  Starting HP (" + std::to_string(MIN_HP)
                                   + "-" + std::to_string(MAX_HP) + "): ", MIN_HP, MAX_HP);
        party[i].maxHp = party[i].hp;
        party[i].level = 1;
        party[i].xp    = 0;

        if (classChoice == 1) { party[i].atk = 8;  party[i].def = 5; }   // Warrior
        if (classChoice == 2) { party[i].atk = 12; party[i].def = 2; }   // Mage
        if (classChoice == 3) { party[i].atk = 10; party[i].def = 3; }   // Rogue
    }

    std::cout << std::endl;
    std::cout << "Party created!" << std::endl;
}
```

### SAVE AND TRY

Update `main()` to call `createParty` when the user chooses `1`:

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
            case '1': createParty(party, partyCount); break;
            case '5': showParty(party, partyCount);   break;
            case 'Q': case 'q': break;
            default: std::cout << "  Unknown option." << std::endl; break;
        }

    } while (choice != 'Q' && choice != 'q');

    std::cout << std::endl;
    std::cout << "Goodbye, adventurer." << std::endl;
    return 0;
}
```

```
make
.\dungeon
```

**You should see:** The menu loop. Choose `1`, create 2 players, choose `5` to view
them, choose `Q` to exit. The loop returns to the menu after each action.

---

## Step 5 — Level Up, Save, and Load

```cpp
void levelUpMenu(Player party[], int count) {
    if (count == 0) { std::cout << "  No party loaded." << std::endl; return; }

    showParty(party, count);
    int idx = getValidInt("Level up which player? (1-" + std::to_string(count) + "): ", 1, count) - 1;

    Player& p = party[idx];   // reference to the chosen player — changes affect the array
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

bool saveParty(const Player party[], int count, const std::string& filename) {
    std::ofstream file(filename);
    if (!file.is_open()) {
        std::cout << "  [Error] Cannot open '" << filename << "' for writing." << std::endl;
        return false;
    }
    file << count << std::endl;   // first line: how many players
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

Add cases `2`, `3`, `4` to the `switch` in `main()`:
```cpp
            case '2': loadParty(party, partyCount, SAVE_FILE);  break;
            case '3': levelUpMenu(party, partyCount);            break;
            case '4': saveParty(party, partyCount, SAVE_FILE);  break;
```

### SAVE AND TRY

```
make
.\dungeon
```

**Full test sequence:**
1. `[1]` Create 2 players
2. `[5]` Show party — verify sheets
3. `[3]` Level up player 1 — verify stats increase
4. `[4]` Save — check `party.dat` exists in Notepad
5. `[Q]` Quit
6. Run again
7. `[2]` Load — verify both players restore
8. `[5]` Show party — verify all stats preserved including level-up

---

## Part 2 — Where Fixed Arrays Break Down

### Concept: The Gap Between S-01 and S-02

You just built a complete, working program. Before moving on, notice what you **cannot**
do with the tools in S-01 alone:

**Problem 1 — The party is limited to 3.** `Player party[MAX_PARTY]` is fixed at
compile time. If a player wants 4 people in their party, you must change the code and
recompile. You cannot grow the array at runtime.

**Problem 2 — "Removing" a player is hard.** If player 2 of 3 leaves the party,
you must shift `party[2]` into `party[1]` and decrement `count`. This is O(n) work
for every removal — and you must write it manually.

**Problem 3 — Snake's body cannot use a fixed array.** In S-02 Snake, the snake starts
at length 3 and grows to (potentially) hundreds of segments. You do not know the final
length at compile time. And the snake moves by adding one segment to the front and
removing one from the back — exactly the "shift everything" operation that is O(n)
with arrays.

**These three problems point to one missing tool:** A **data structure** — an organized
way of storing data that makes specific operations (add to front, remove from back)
efficient. In S-02 Snake, you will discover the **linked list** — and learn exactly
why it exists by first feeling the pain of trying to solve the problem without it.

This is what "the app is a tool to teach the concept" means. You did not build Snake
to have a game — you built Snake to *discover why linked lists exist*.

---

## 🎯 Final Challenge: Add a "Dismiss Player" Feature

**You know:** Everything in S-01.

**Task:** Add menu option `[6] Dismiss Player` that removes one player from the party.
The remaining players must shift to fill the gap (no empty slots in the middle of
the array).

**Hint:** After the user selects player `idx` (0-indexed), shift every player from
`idx+1` onward one slot to the left:
```cpp
for (int i = idx; i < count - 1; ++i) {
    party[i] = party[i + 1];
}
--count;
```

Observe how much manual work one removal requires. In S-02, a linked list does this
in O(1) — one pointer change, regardless of the list size.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
void dismissPlayer(Player party[], int& count) {
    if (count == 0) { std::cout << "  No party loaded." << std::endl; return; }
    if (count == 1) { std::cout << "  Cannot dismiss the last party member." << std::endl; return; }

    showParty(party, count);
    int idx = getValidInt("Dismiss which player? (1-" + std::to_string(count) + "): ", 1, count) - 1;

    std::cout << "  Dismissing " << party[idx].name << "..." << std::endl;

    // Shift all players after idx one position to the left
    for (int i = idx; i < count - 1; ++i) {
        party[i] = party[i + 1];   // struct assignment copies all fields
    }
    --count;   // one fewer player — the last slot is now unused

    std::cout << "  Done. Party now has " << count << " member(s)." << std::endl;
}
```

**The O(n) cost is real:** For a party of 3, the shift is trivial. For Snake's body at
length 200, shifting 199 segments every frame at 60 FPS means 11,940 copy operations
per second — just to move the snake. A linked list removes the tail in O(1) at any
length. This is why data structures exist.

</details>

---

## Final Check — Full Program Verification

| Feature | How to Verify |
|---------|--------------|
| Menu loop | Program returns to menu after each action; `Q` exits cleanly |
| Create 1 player | Party of 1 shows one sheet |
| Create 3 players | Party of 3 shows all three sheets with correct stats by class |
| Input validation | Non-numbers and out-of-range values repeat the prompt correctly |
| Name with spaces | "Sir Reginald" accepted and preserved in save/load |
| Level up | Stats increase; sheet shows new level and full HP |
| Save | `party.dat` created with human-readable data |
| Load | After restart, `[2]` restores full party including level-up stats |
| Dismiss | After removing player 2, player 3 becomes player 2; no gaps |
| Goodbye | `Q` or `q` both exit gracefully |

---

## S-01 Mastery Review

Before starting S-02, you should be able to explain each of these without looking back:

| Concept | Lab | Can you explain it? |
|---------|-----|---------------------|
| Compile-link-run cycle | 00 | ☐ |
| Binary and two's complement | 01 | ☐ |
| Integer division and modulo | 02 | ☐ |
| Boolean logic and truth tables | 03 | ☐ |
| Loop invariants | 04 | ☐ |
| Call stack and stack frames | 05 | ☐ |
| Address arithmetic and zero-indexing | 06 | ☐ |
| C-strings vs `std::string` | 07 | ☐ |
| Pointer dangers (dangling, wild) | 08 | ☐ |
| `const&` for efficiency | 09 | ☐ |
| Struct as entity model | 10 | ☐ |
| Stream state and `clear()`/`ignore()` | 11–12 | ☐ |

If any row feels uncertain, re-read that lab's **Concept** blocks before starting S-02.

---

## Quick Check Answers

**1. What is in `party[1]` and `party[2]` when only one player is created?**
They hold the default-initialized values from the struct: empty strings and zeros for
numeric fields (because of the `= 0` default member initializers). This is why the
program tracks `partyCount` separately — the array always has `MAX_PARTY` slots, but
only the first `partyCount` of them contain real data. Functions that iterate the party
use `for (int i = 0; i < partyCount; ++i)` to avoid touching the unused slots.

**2. Which loop type is most natural for the menu loop?**
`do-while` is the most logically correct: you must display the menu and read a choice
at least once before you can check whether to quit. A `while` loop would require
either duplicating the menu display before the loop or using a flag. However, the
`do-while` with `choice != 'Q'` requires `choice` to be initialized to something
other than `'Q'` before the loop — which is why we initialize it to `'\0'`. In this
program, `while(true)` with a `break` on `'Q'` is also common and explicit.

**3. What is the fundamental limitation of what you have built?**
Fixed-size, compile-time-determined storage. Every array in S-01 was declared with
a size known at compile time (`Player party[3]`, `char tiles[10]`). You cannot grow
them at runtime. Removing an element requires shifting all subsequent elements — O(n)
work. You cannot efficiently add to the front of an array. These limitations are not
C++ limitations — they are limitations of the *fixed array* data structure. S-02
introduces the **linked list**: a data structure built from pointers where inserting
or removing from either end costs O(1) regardless of size. The snake's growing body
is the concrete problem; the linked list is the solution.

---

## What's Next: S-02 — Snake

In S-02, you will build the terminal Snake game. But first — before any code — you will
try to model the snake's body using a fixed array. It will work for a few steps. Then
you will try to make the snake grow. And you will discover, from personal experience,
exactly why the data structure you need must be invented. That discovery is the point of S-02.
