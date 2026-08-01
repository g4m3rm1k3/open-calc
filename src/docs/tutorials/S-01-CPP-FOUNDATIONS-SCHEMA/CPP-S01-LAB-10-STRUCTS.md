# Lesson 10: Data That Belongs Together Should Live Together
### (LAB 10 — Structs)

**What you will build:** A character sheet generator — a `Player` struct holding a name, class, HP, level, XP, attack, and defense, printed as a bordered sheet, stored in an array for a two-member party, and modified in place by a `levelUp` function. The transferable problem: eight parallel variables (`playerName`, `playerHP`, `playerLevel`, ...) have no way to travel together — nothing stops one array of names getting out of sync with a separate array of HP values, and every function that "operates on a player" has to accept eight separate parameters instead of one coherent thing.

**What you need to know first:** LAB-09 — references, `const` references, pass-by-reference. LAB-07's `std::string`. LAB-06's arrays. LAB-05's functions.

**Terms introduced in this lesson**

> **`struct`** — a user-defined type grouping multiple named variables (members) together as one unit.
> **Member** — one of a struct's named fields.
> **Member access operator (`.`)** — accesses a specific instance's member by name.
> **Instance** — one concrete variable of a struct type, with its own independent copy of every member.
> **Default member initializer** — a value specified in the struct's own definition, used whenever an instance doesn't explicitly set that member.
> **Aggregate initialization** — initializing a struct's members in declaration order using `{}`, with no member names written.
> **Entity model** — representing a game object (or any real-world thing) as a data-only struct, with logic living in separate functions that operate on it.

No pipeline diagram applies — S-01 builds standalone concept programs.

---

## Concept Unit 1: The Problem Structs Solve

### The Problem

Tracking one player's name, HP, level, XP, attack, and defense as separate variables already means six names to keep straight; a second player doubles that to twelve, with nothing enforcing that `player1HP` and `player1MaxHp` (say) stay logically paired. A function meant to "process a player" has no single thing to accept as its parameter — only fragments.

### No isolated code lab for this step

The problem is best shown directly against the shape of the real code this lesson replaces, not an invented illustration.

### Explanation

```cpp
// Parallel variables — nothing keeps these six values traveling together
std::string player1Name  = "Zara";
int         player1HP    = 75;
int         player1Level = 3;
// ...three more, then the same six again for a second player

void printPlayer(const std::string& name, int hp, int level, int maxHp, int atk, int def);
// every new field means editing this signature, and every call site
```

A `struct` collects them into one named type:

```cpp
struct Player {
    std::string name;
    int hp;
    int maxHp;
    int level;
    int atk;
    int def;
};

void printPlayer(const Player& p);   // one parameter, all fields
Player party[4];                     // an array of players is now natural
```

### CS Lens

A `struct` is the **entity model**'s foundation: representing a game object (or any real-world thing) as *what information it carries*, with the logic that operates on it living in separate functions (`printSheet`, `levelUp`, Concept Units 3 and 5) rather than bundled into the data itself. This is a **data-oriented** approach — "what does this thing carry?" — distinct from an *object-oriented* approach ("what can this thing do?"), which classes (`CPP-S02-LAB-02`) add on top of exactly this same field-grouping foundation.

### SE Lens

A struct's **protected invariant** is that fields belonging together are physically inseparable — `hp` and `maxHp` cannot accidentally end up in two different arrays that drift out of sync, the way LAB-06's array-per-field approach risked. Passing `const Player& p` instead of six separate parameters (LAB-09's `const&` rule, applied here to a struct instead of a `std::string`) means adding a seventh field later touches the struct's own definition once, not every function signature that operates on a player.

### Connection

Concept Unit 2 defines the real `Player` struct this lesson builds around.

---

## Concept Unit 2: Defining `Player`

### The Problem

Concept Unit 1's `struct Player` sketch needs to become real, compilable C++, with every field this lesson's character sheet actually needs.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — new file for this lab.
- **Change type:** Add (new file).
- **Location:** Above `main`.
- **Dependencies:** `std::string` (LAB-07), `int` (LAB-01).

### The New Code

```cpp
struct Player {
    std::string name;
    std::string className;
    int hp       = 0;
    int maxHp    = 0;
    int level    = 1;
    int xp       = 0;
    int atk      = 0;
    int def      = 0;
};
```

### The Updated Project

```cpp
#include <iostream>
#include <string>
#include <iomanip>

struct Player {              // ← new
    std::string name;
    std::string className;
    int hp       = 0;
    int maxHp    = 0;
    int level    = 1;
    int xp       = 0;
    int atk      = 0;
    int def      = 0;
};                            // ← new — note the semicolon

int main() {
    return 0;
}
```

### Concept Lab

```cpp
// scratch_default.cpp  (disposable)
#include <iostream>
struct Player {
    std::string name;
    int hp = 0;
    int level = 1;
};
int main() {
    Player p;
    std::cout << "hp=" << p.hp << " level=" << p.level << " name='" << p.name << "'" << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_default.cpp -o scratch_default -std=c++17 -Wall -Wextra
$ ./scratch_default.exe
hp=0 level=1 name=''
```

What that proves: `Player p;` — no explicit values given at all — still produced `hp = 0`, `level = 1`, and an empty `name`, exactly matching each member's **default member initializer** (`= 0`, `= 1`) written into the struct's own definition, or, for `std::string name` (no `=` written), `std::string`'s own default of an empty string. Without these `= 0`/`= 1` defaults, `p.hp` and `p.level` would hold whatever bits happened to already occupy that memory — the identical "uninitialized garbage" danger LAB-01 warned about for a single variable, now a risk for every numeric member of every struct that omits its defaults.

This scratch file is discarded now; the real `Player` struct's defaults behave identically, verified next when a real `Player` instance is created.

### Mechanical Walkthrough

- `struct Player { ... };` — **(a) first appearance.** Defines a new type named `Player`. The trailing `;` is required — a struct definition is a statement, and C++ statements end in `;`; omitting it produces a confusing "expected `;`" error pointing at the *next* line, not this one.
- `int hp = 0;` (and similarly for `maxHp`, `xp`, `atk`, `def`, and `level = 1`) — **(a) first appearance of a default member initializer.** Not an assignment happening "now" — a value recorded in the type's own definition, applied automatically whenever an instance is created without explicitly setting that member.

### CS Lens

A struct is a genuine new **type**, just like `int` or `bool` — `Player` can be used anywhere a type is expected: as a variable's type (Concept Unit 3), a function parameter's type (Concept Unit 4), or an array's element type (Concept Unit 6). C++ does not distinguish "built-in" types from user-defined ones in terms of where they're allowed to appear.

### SE Lens

Providing a default for every numeric member is a deliberate habit this course treats as mandatory, not optional style — it converts "every `Player` instance is well-defined from the moment it's created" from a discipline the programmer has to remember into a guarantee the struct's own definition enforces, the same shift LAB-02's `const` made for reassignment.

### Run It

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
```

Verified this session — no output, no errors: the struct compiles cleanly with no instances created yet.

### Connection

Concept Unit 3 creates a real `Player` instance and reads/writes its members.

---

## Concept Unit 3: Creating Instances and Member Access

### The Problem

`Player` is now a real type, but nothing has created a specific player yet, or set any of its fields to represent an actual character.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Inside `main`, plus new `printSheet`/`xpForNextLevel` functions above it.
- **Dependencies:** `Player` (Concept Unit 2), `std::to_string` (LAB-07), `std::setw`/`std::left` (LAB-01).

### The New Code

```cpp
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
```

(`printSheet` and `xpForNextLevel`, declared and defined above `main`, are shown in full below since this unit's Run It depends on them.)

### The Updated Project

```cpp
void printSheet(const Player& p);
int  xpForNextLevel(int level);

int xpForNextLevel(int level) {
    return level * level * 100;
}

void printSheet(const Player& p) {
    const std::string BORDER = "╔══════════════════════════════════╗";
    const std::string DIVIDE = "╠══════════════════════════════════╣";
    const std::string BOTTOM = "╚══════════════════════════════════╝";
    const int         WIDTH  = 34;

    std::cout << BORDER << std::endl;
    std::cout << "║  " << std::left << std::setw(WIDTH - 2) << p.name << "║" << std::endl;

    std::string levelLine = "Level " + std::to_string(p.level)
                          + "  |  Class: " + p.className;
    std::cout << "║  " << std::setw(WIDTH - 2) << levelLine << "║" << std::endl;

    std::cout << DIVIDE << std::endl;

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

int main() {
    std::cout << "=== Character Sheet Generator ===" << std::endl;
    std::cout << std::endl;

    Player zara;                    // ← new
    zara.name      = "ZARA";        // ← new
    zara.className = "Warrior";     // ← new
    zara.hp        = 75;            // ← new
    zara.maxHp     = 100;           // ← new
    zara.level     = 3;             // ← new
    zara.xp        = 250;           // ← new
    zara.atk       = 15;            // ← new
    zara.def       = 8;             // ← new

    printSheet(zara);               // ← new
    std::cout << std::endl;

    return 0;
}
```

### Concept Lab

No separate throwaway: `zara.hp = 75;` is already the smallest demonstration of member access, and building `printSheet` as a scratch example separately would just duplicate the real function this lesson needs anyway.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
=== Character Sheet Generator ===

╔══════════════════════════════════╗
║  ZARA                            ║
║  Level 3  |  Class: Warrior      ║
╠══════════════════════════════════╣
║  HP: 75 / 100                    ║
║  XP: 250 / 900                   ║
║  ATK: 15  DEF: 8                 ║
╚══════════════════════════════════╝
```

**Correcting this lesson's own earlier "What you will build" sketch before it's shown again:** an earlier draft's hand-typed mockup showed `XP: 250 / 400` for a level-3 character — but `xpForNextLevel(3)` (Concept Unit 3's own formula, `level * level * 100`) is `3 × 3 × 100 = 900`, not `400` (which is `xpForNextLevel(2)`). The real, compiled output above shows `900`, matching the formula that's actually in the code — the earlier sketch was simply typed by hand and never checked against a real run.

### Mechanical Walkthrough

- `Player zara;` — **(a) first appearance of creating a struct instance.** `zara` is an **instance** of `Player` — its own independent set of all eight members, initialized per Concept Unit 2's defaults (`hp = 0`, `level = 1`, etc.) until overwritten below.
- `zara.name = "ZARA";` — **(a) first appearance of the member access operator `.`.** Reads or writes one named member of a specific instance — `zara.name` is `zara`'s own `name`, entirely independent of any other `Player` instance's `name`.
- `printSheet(const Player& p)` — **(c) reusing** `const&` (LAB-09), applied here to a struct instead of a `std::string` — reads `zara`'s fields with no copy, per LAB-09's own cost argument, now scaled to eight members instead of one.

### CS Lens

`.` computing "which member, at what offset within this instance" is the struct analog of LAB-06's array-indexing formula (`base + index × element_size`) — here, each member has its own fixed offset from the instance's base address, computed by the compiler from the struct's definition, the same "hide the address, expose a name" idea LAB-01 introduced for a single variable and LAB-06 extended to arrays.

### SE Lens

Setting each field by name (`zara.hp = 75;`) rather than a positional list is deliberately verbose, for a real reason: a reader sees exactly which value goes where without cross-referencing the struct's declaration order — Concept Unit 6 shows the terser positional alternative and names its real risk directly.

### Connection

Concept Unit 4 checks what actually happens to a struct's members when it's copied — proving pass-by-value copies everything, not just a reference to it.

---

## Concept Unit 4: Structs Copy Fully — No Decay

### The Problem

LAB-06 proved arrays decay to a pointer when passed to a function — no copy, and a called function can modify the caller's original. Does a struct behave the same way, or does LAB-05's plain pass-by-value rule apply instead?

### No isolated code lab for this step

Needs a dedicated, deliberately-mutating Concept Lab — `printSheet` (Concept Unit 3) only reads, so it can't demonstrate this on its own.

### Concept Lab

```cpp
// scratch_copy.cpp  (disposable)
#include <iostream>
struct Player {
    int hp = 100;
};
void tryModify(Player p) {
    p.hp = 0;
}
int main() {
    Player zara;
    tryModify(zara);
    std::cout << "zara.hp = " << zara.hp << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_copy.cpp -o scratch_copy -std=c++17 -Wall -Wextra
$ ./scratch_copy.exe
zara.hp = 100
```

What that proves: `tryModify(Player p)` — a plain, non-reference parameter — received a **full copy** of `zara`, including every member; setting `p.hp = 0;` changed only that copy. `zara.hp`, back in `main`, remained `100`, completely untouched. This is LAB-05's ordinary pass-by-value rule, exactly as it applies to `int` — a struct is **not** like an array (LAB-06); it does not decay to a pointer or an address when passed. Every member gets copied, in full.

This scratch file is discarded now; the real `printSheet(const Player& p)` deliberately avoids this copy — not because copying would be *wrong*, but because it would be wasteful (LAB-09's cost argument) for a struct this course only ever needs to read from inside that function.

### Mechanical Walkthrough

- `void tryModify(Player p)` — **(a) first appearance of a struct parameter passed by value.** Every member of the argument is copied — for `Player`, that means copying two `std::string`s (each potentially performing their own internal heap allocation, per LAB-07) and six `int`s, on every single call.

### CS Lens

A struct passed by value copying *every member*, recursively (a `std::string` member's own internal storage is copied too, not just its 8-byte handle) — is what makes LAB-09's `const Player&` genuinely matter here, not just as a style preference: for a struct with `std::string` members, a by-value copy is measurably more expensive than a plain `int` copy, in a way arrays never were (arrays, per LAB-06, never copy at all when passed — an entirely different cost shape).

### SE Lens

This course's rule, stated once here and applied everywhere a struct appears as a parameter for the rest of this curriculum: pass a struct by `const&` when a function only reads it (`printSheet`), by plain `&` when it needs to modify the original (`levelUp`, Concept Unit 5) — and reach for by-value only when a genuinely independent copy is the actual intent, which is rare for anything larger than a couple of `int`s.

### Connection

Concept Unit 5's `levelUp` is the first function in this lesson that deliberately modifies a `Player` — using `&`, not `const&`, for exactly the reason Concept Unit 4 just proved matters.

---

## Concept Unit 5: `levelUp` — Modifying a Struct by Reference

### The Problem

A character sheet that never changes isn't very useful — leveling up needs a function that updates several of `Player`'s fields together, coherently, as one operation.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Declaration/definition alongside `printSheet`; call added in `main`.
- **Dependencies:** `Player` (Concept Unit 2), `&` parameters (LAB-09), `++`/`+=` (LAB-02).

### The New Code

```cpp
void levelUp(Player& p);

void levelUp(Player& p) {
    ++p.level;
    p.xp     = 0;
    p.maxHp += 10;
    p.hp     = p.maxHp;
    p.atk   += 2;
    p.def   += 1;
}
```

### The Updated Project

Added alongside `printSheet`'s declaration/definition; called from `main` on Lyra (introduced in Concept Unit 6) with a sheet printed before and after.

### Concept Lab

No separate throwaway: this reuses Concept Unit 4's own proof (struct-by-reference avoids the copy that struct-by-value makes) — `levelUp(Player& p)` is the constructive counterpart to that unit's deliberately-broken `tryModify(Player p)`.

Run it, called on Lyra (Concept Unit 6's second character) — verified this session:

```
$ ./dungeon.exe
...
=== Before Level Up ===
╔══════════════════════════════════╗
║  LYRA                            ║
║  Level 1  |  Class: Mage         ║
╠══════════════════════════════════╣
║  HP: 100 / 100                   ║
║  XP: 0 / 100                     ║
║  ATK: 8  DEF: 4                  ║
╚══════════════════════════════════╝

=== After Level Up ===
╔══════════════════════════════════╗
║  LYRA                            ║
║  Level 2  |  Class: Mage         ║
╠══════════════════════════════════╣
║  HP: 110 / 110                   ║
║  XP: 0 / 400                     ║
║  ATK: 10  DEF: 5                 ║
╚══════════════════════════════════╝
```

What that proves: `levelUp(lyra)` — one call, one line — updated `level` (`1 → 2`), `maxHp` and `hp` together (`100 → 110`, both, coherently — never leaving `hp` greater than `maxHp`), `xp` (reset to `0`), `atk` (`8 → 10`), and `def` (`4 → 5`), all through a single `Player&` parameter. `xpForNextLevel(2) = 400`, matching the new level automatically, since `printSheet` always recomputes it from `p.level` rather than storing it as a separate field that could drift out of sync.

### Mechanical Walkthrough

- `void levelUp(Player& p)` — **(a) first appearance of a struct reference parameter used to modify.** No `const` — this function's entire purpose is mutation, per LAB-09's own decision rule (plain `&` for "needs to modify").
- `p.maxHp += 10; p.hp = p.maxHp;` — **(c) reusing** compound assignment (LAB-02) and member access (Concept Unit 3), sequenced so `hp` is set *from* the already-updated `maxHp` — order matters here, since reversing these two lines would set `hp` to the *old* `maxHp`, one level behind.

### CS Lens

`levelUp` updating six related fields in one function call, atomically from the caller's perspective, is exactly Concept Unit 1's protected invariant put to use: there is no intermediate state a caller could observe where `level` has advanced but `xp` hasn't reset, because the whole update happens inside one function, called once.

### SE Lens

Every field `levelUp` touches lives inside the *same* struct it receives — no risk of updating `level` in one array and forgetting to update `xp` in a separate parallel one, the exact failure mode Concept Unit 1 opened this lesson with, now demonstrably impossible for `Player`'s own fields (though, per Concept Unit 1's own framing, this guarantee is specific to fields *inside* the struct — nothing prevents a *different* struct from drifting out of sync with this one, which is a separate design problem entirely).

### Connection

This closes the modification half of this lesson — Concept Unit 6 returns to creation, this time an *array* of `Player` instances.

---

## Concept Unit 6: Arrays of Structs

### The Problem

One `Player` proves the struct works. A real party has more than one character, and LAB-06's array machinery already knows how to hold many values of one type — does it work for a struct type too?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After `zara`'s creation and print, before `return 0;`.
- **Dependencies:** `Player` (Concept Unit 2), arrays (LAB-06), `for` loop (LAB-04).

### The New Code

```cpp
Player lyra;
lyra.name      = "LYRA";
lyra.className = "Mage";
lyra.hp        = 100;
lyra.maxHp     = 100;
lyra.level     = 1;
lyra.xp        = 0;
lyra.atk       = 8;
lyra.def       = 4;

const int  PARTY_SIZE = 2;
Player party[PARTY_SIZE] = {zara, lyra};

for (int i = 0; i < PARTY_SIZE; ++i) {
    printSheet(party[i]);
    std::cout << std::endl;
}
```

### The Updated Project

Appended after Concept Unit 3's `zara` block, before `return 0;`.

### Concept Lab

No separate throwaway: `Player party[PARTY_SIZE] = {zara, lyra};` is already the smallest real demonstration — an array of a user-defined type, working exactly like LAB-06's `char tiles[10]` worked for a fundamental type.

Run it — verified this session (both sheets shown, matching Concept Unit 3's `zara` output exactly for the first, and a fresh `lyra` sheet for the second):

```
$ ./dungeon.exe
...
╔══════════════════════════════════╗
║  LYRA                            ║
║  Level 1  |  Class: Mage         ║
╠══════════════════════════════════╣
║  HP: 100 / 100                   ║
║  XP: 0 / 100                     ║
║  ATK: 8  DEF: 4                  ║
╚══════════════════════════════════╝
```

What that proves: `Player party[PARTY_SIZE]` is a genuine array — LAB-06's rules apply directly: fixed size (`PARTY_SIZE`), zero-based indexing, iterated by `for (int i = 0; i < PARTY_SIZE; ++i)`, exactly the shape used for `char tiles[10]`, now holding `Player` instances instead of `char`s. `party[0]` is a full copy of `zara` (aggregate-initialized via `{zara, lyra}`, Concept Unit 6's next topic), `party[1]` a full copy of `lyra` — printing both via one loop, with no per-player special-casing.

### Mechanical Walkthrough

- `Player party[PARTY_SIZE] = {zara, lyra};` — **(a) first appearance of aggregate initialization for an array of structs**, using already-existing instances as the initializer values rather than struct-literal syntax — `party[0]` becomes a copy of `zara`, `party[1]` a copy of `lyra`.
- `printSheet(party[i])` — **(c) reusing** `[]` (LAB-06) on an array of structs — identical indexing syntax, now selecting a `Player` instead of a `char`.

### CS Lens

An array of structs is stored exactly like an array of any fundamental type — each `Player` occupies a fixed-size block (per LAB-06's address-arithmetic formula, now with `sizeof(Player)` as the element size instead of `sizeof(char)`), laid out consecutively. Nothing about LAB-06's array machinery cared what the element type actually was — that genericity is what makes this unit's extension to structs work with zero new array-specific concepts.

### SE Lens

Adding a third party member later means adding one `Player` declaration, one entry in the `{}` list, and incrementing `PARTY_SIZE` — the rendering loop itself needs zero changes, the identical "logic stays fixed, data varies" payoff LAB-05's `getValidInput` demonstrated for functions, now shown for a loop operating over a collection.

### Connection

This closes every new concept in this lesson — the Closing section covers positional `{}` initialization's real risk, deferred until now so it could be contrasted against the by-name style this lesson has used throughout.

---

## Closing

### Connect the pieces

Follow `zara` end to end: `Player zara;` (Concept Unit 3) creates an instance with Concept Unit 2's defaults; eight `zara.field = value;` lines set it to a real Warrior. `printSheet(zara)` (Concept Unit 3, using LAB-09's `const&`) reads all eight fields with no copy, formatting them through `std::to_string` and `std::setw` (LAB-07, LAB-01). `Player party[PARTY_SIZE] = {zara, lyra};` (Concept Unit 6) copies `zara` — a *full*, every-member copy, per Concept Unit 4's own proof — into `party[0]`, alongside `lyra`'s equivalent copy into `party[1]`. `levelUp(lyra)` (Concept Unit 5), called on the *original* `lyra`, not `party[1]`, updates six fields atomically through a `Player&` — a change `party[1]`, being an independent copy made before the level-up, would not reflect, a direct, concrete consequence of Concept Unit 4's copy proof applied to this lesson's own data.

### What breaks without this

Positional aggregate initialization — `Player zara = { "Zara", "Warrior", 75, 100, 3, 250, 15, 8 };`, mentioned but not used as this lesson's primary style — assigns values strictly in the struct's declared member order, with no names visible at the call site. Reasoned through directly: if `Player`'s definition (Concept Unit 2) were ever reordered — say, `className` moved before `name` — every existing positional initializer like this one would silently start assigning `"Zara"` to `className` and `"Warrior"` to `name`, with no compiler error at all (both are `std::string`, so the types still match). This is exactly why this lesson set field-by-name assignment (`zara.name = "Zara";`) as its default, per Concept Unit 3 — a reordering that would silently corrupt every positional initializer has no effect at all on by-name assignment, because by-name assignment never depended on order in the first place.

### Exercises

1. Change `zara.level` from `3` to `1`, rebuild, and confirm the sheet shows Level 1 with an XP threshold of `100` (not `900`) — `xpForNextLevel`'s formula recomputing automatically from the new `level`, with no other line of code touched.
2. Add a third field-by-name-constructed `Player` (your own name and stats), extend `party[]` to `PARTY_SIZE = 3`, and confirm all three sheets print correctly from the same unchanged loop.
3. Reorder two fields in `Player`'s own definition (swap `hp` and `maxHp`'s declaration order), then rebuild `zara` using the positional `{}` form from this lesson's Closing discussion instead of by-name assignment — observe, for real, which values land in which fields now, and connect it back to this unit's own warning.
4. Extend `levelUp` to also increase `p.maxHp` by a *different* amount depending on `p.className` (`+15` for `"Warrior"`, `+5` for `"Mage"`) using an `if`/`else` (LAB-03) on `p.className == "Warrior"`. Verify both Zara's and Lyra's level-ups reflect their class-specific growth.

### Definition of done

- [ ] `main.cpp` defines `Player`, creates at least two instances by name, stores them in an array, prints formatted sheets, and modifies one via `levelUp`.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`, and every struct member has a default member initializer.
- [ ] Output matches this lesson's verified run exactly, including the corrected `XP: 250 / 900` for a level-3 character.
- [ ] You can state, from Concept Unit 4's own proof, why a struct passed by value is a full, independent copy — not a decayed pointer the way an array (LAB-06) is.
- [ ] You can explain why this lesson prefers by-name field assignment over positional `{}` initialization, using Concept Unit 6's own reordering risk as the reason.
- [ ] All four Exercises completed with real compiled output, including Exercise 3's deliberate field-reorder demonstration.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-10: Player struct, character sheets, party array, and levelUp by reference"` — states why (grouped, coherent player data replacing parallel variables, verified against a real level-up) not just what changed.
