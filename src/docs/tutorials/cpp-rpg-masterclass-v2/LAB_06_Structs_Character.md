# C++ Terminal RPG — LAB 06 — Structs & the Character

**Prerequisites:** LAB 05. You can write functions with parameters and return
values, and use the dice-rolling system.

**What this lab adds:**
- `struct` to group related data into one named type
- A complete `Character` struct replacing the scattered individual variables
- An `Enemy` struct for the first enemy type

**Time:** 55–70 minutes

---

## What You Will Build

After this lab, all character data travels as one unit:

```
  Rolling your stats...
    STR: [4, 6, 3, 5] drop 3 → 15
    ...

  ┌─────────────────────────────────────────┐
  │         EREVAN — LEVEL 1                │
  ├─────────────────────────────────────────┤
  │  STR: 15   DEX: 12   CON: 13           │
  │  INT: 14   WIS: 10   CHA: 11           │
  ├─────────────────────────────────────────┤
  │  HP:  11/11   MP:  10/10               │
  │  ATK: 7       DEF: 3    SPD: 6         │
  │  Gold: 50     XP: 0/100                │
  └─────────────────────────────────────────┘

  Encountered: GOBLIN (HP: 8/8)
```

---

> **Quick Check — try to answer before reading:**
> 1. What problem does a `struct` solve that individual variables do not?
> 2. How do you access a field inside a struct? What operator do you use?
> 3. Prediction: if you have `Character hero;` and `Character villain;`, do
>    changes to `hero.hp` also change `villain.hp`? Why or why not?
> *(Answers at the end of this lab)*

---

## Concept: `struct` — Grouping Related Data

**What it is:** A user-defined type that groups multiple variables (called
fields or members) under one name.

**The problem before:**
```cpp
// Passing 15 individual variables everywhere is a nightmare:
void displayCharacterSheet(
    const std::string& name, int level,
    int str, int dex, int con, int intel, int wis, int cha,
    int hp, int maxHP, int mp, int maxMP,
    int atk, int def, int gold, int xp  // ← 16 parameters!
) { ... }
```
Adding one new stat (like SPD) means updating EVERY function signature.

**The solution:**
```cpp
struct Character {
    std::string name;
    int level;
    int str, dex, con, intel, wis, cha;  // core stats
    int hp, maxHP, mp, maxMP;            // health and mana
    int atk, def, spd;                   // derived combat stats
    int gold, xp;
};

// Now functions take ONE parameter:
void displayCharacterSheet(const Character& hero) {
    std::cout << hero.name << std::endl;
    std::cout << "HP: " << hero.hp << "/" << hero.maxHP << std::endl;
}
```

**What it hides:** Hides the need to pass 15+ individual arguments to every
function. Without `struct Character`, `displayCharacterSheet` would take
`name, level, str, dex, con, intel, wis, cha, hp, maxHP, ...` — 16 parameters.
Invariant: adding a new field (like `spd`) requires changing only the struct
definition, not every function signature.

**Canonical example (General Explanation):**
A library card — it groups all the fields that belong to one person (name, ID
number, books borrowed). Each card is independent.

```cpp
struct LibraryCard {
    std::string name;
    int         id;
    int         booksBorrowed;
};

LibraryCard card;
card.name          = "Alice";
card.id            = 1042;
card.booksBorrowed = 3;

std::cout << card.name << " has " << card.booksBorrowed << " books." << std::endl;
```

The "named group of related fields" mirrors exactly what a struct does — one
variable holds the whole person.

**Project Application (The "Why" here):**
The `Character` struct is the central data structure of the entire game.
Everything reads from it or writes to it. Every function in future labs takes
a `Character&` instead of 15 individual arguments. When the game grows — adding
`spd`, `luck`, or an inventory — only the struct definition changes, not every
function signature.

**Smallest possible example:**
```cpp
struct Point {
    int x;
    int y;
};

Point origin;        // declare a Point variable
origin.x = 0;       // access fields with .
origin.y = 0;
std::cout << origin.x << ", " << origin.y << std::endl;  // 0, 0
```

**Why it matters here:** The `Character` struct is the central data structure
of the entire game. Everything reads from it or writes to it. Every function
in future labs takes a `Character&` instead of 15 individual arguments.

**Watch for:** The struct definition ends with a semicolon after the closing
brace: `};`. Forgetting the semicolon is a common compile error that produces
confusing messages on the NEXT line.

---

## Concept: Struct Initialization and the Dot Operator

**What it is:** The `.` (dot) operator accesses a struct's fields. You can
initialize a struct's fields one by one or all at once with braces.

**Canonical example (General Explanation):**
A paper form — you fill in each field individually (field-by-field) or
pre-fill it from a template (aggregate initialization). The dot operator is
the pen writing into each named box.

```cpp
struct Color {
    int r;
    int g;
    int b;
};

// Field by field:
Color red;
red.r = 255;
red.g = 0;
red.b = 0;

// Aggregate (order must match definition):
Color blue = {0, 0, 255};
```

Filling in fields by name makes code self-documenting — `red.r = 255` is
clearer than position 0 in a list.

**Project Application (The "Why" here):**
`createGoblin()` uses field-by-field initialization because each field has a
meaningful name (`goblin.maxHP`, `goblin.atk`). Enemy factories benefit from
the explicit form because the numbers are magic values — the name makes their
purpose obvious.

**Smallest possible example:**
```cpp
struct Weapon {
    std::string name;
    int damage;
    int diceSides;
};

// Method 1: field by field
Weapon sword;
sword.name      = "Iron Sword";
sword.damage    = 1;
sword.diceSides = 8;  // 1d8 damage

// Method 2: aggregate initialization (order must match struct definition)
Weapon dagger = {"Iron Dagger", 1, 4};  // 1d4 damage

std::cout << sword.name << " does 1d" << sword.diceSides << std::endl;
```

**Why it matters here:** Aggregate initialization lets you create enemies
and items inline without verbose field-by-field setup.

**Watch for:** In C++11 and later, aggregate initialization works for structs
with no user-defined constructors. If you later add a constructor (Lab 14),
the brace syntax changes slightly.

---

### Math: D&D Ability Modifier

**What it computes:** Converts a raw ability score (3–18) to a modifier
(-4 to +4) that represents how exceptional the score is above or below
average (10).

**The real-world analogy:** A bell curve centered at 10. A score of 10 is
"average" — no bonus, no penalty. A score of 16 is "well above average" — +3
bonus. A score of 6 is "below average" — -2 penalty.

**Canonical example:**
```
Score 10 → (10 - 10) / 2 = 0    (average, no modifier)
Score 16 → (16 - 10) / 2 = 3    (+3 to attacks, checks)
Score  8 → ( 8 - 10) / 2 = -1   (-1 penalty)
Score  3 → ( 3 - 10) / 2 = -3   (very poor)

Integer division truncates: (9 - 10) / 2 = -1/2 = 0 in C++ (rounds toward zero)
```

**Why it matters here:** `maxHP = 10 + (con - 10) / 2` makes a tough character
(CON 16) have 13 HP and a frail one (CON 6) have 8 HP. The same formula drives
`atk`, `def`, and `spd` calculations.

**Watch for:** C++ integer division truncates toward zero, not down.
`(-1) / 2 = 0` not `-1`. This means CON 9 gives the same modifier as CON 10
(both 0), which matches D&D 5e rules exactly.

---

## Concept: `const` References — Pass Without Copying

**What it is:** Passing a struct by `const` reference avoids copying all the
data while preventing the function from modifying the original.

**The problem before:**
```cpp
// By value — creates a COPY of the entire Character (expensive):
void displayCharacterSheet(Character hero) { ... }  // copies all fields

// By pointer — works, but requires * and -> syntax:
void displayCharacterSheet(Character* hero) {
    std::cout << hero->name << std::endl;  // arrow operator for pointers
}
```

**The solution:**
```cpp
// const reference — no copy, no accidental modification:
void displayCharacterSheet(const Character& hero) {
    std::cout << hero.name << std::endl;  // still uses dot operator
}
```

**What it hides:** Hides both the copy cost (passing by value copies all
fields) and the pointer syntax (passing by pointer requires `->` and `*`).
With `const&` you still use `.` for field access, but no copy is made.
Invariant: `const` makes it a compile error to modify any field inside the
function.

**Canonical example (General Explanation):**
A read-only display board in an office — you can look at every item on it
but cannot erase or change anything. Passing `const Character& hero` gives
the function access to all fields without copying 16+ values, and the `const`
prevents accidental modification.

```cpp
struct Score {
    std::string player;
    int points;
};

void printScore(const Score& s) {
    std::cout << s.player << ": " << s.points << std::endl;
    // s.points = 0;  // compile error — const prevents this
}
```

One ampersand (`&`) avoids the copy; `const` locks the data from being changed.

**Project Application (The "Why" here):**
`displayCharacterSheet(const Character& hero)` needs to read 16+ fields.
Passing by value would copy the entire struct on every call. Passing by
`const&` costs nothing — it's just a reference to the existing struct in
memory. `const` catches bugs: if `displayCharacterSheet` accidentally tried
to set `hero.hp = 0`, the compiler would refuse to compile it.

**Why it matters here:** Structs with `std::string` and multiple `int` fields
are expensive to copy. References are always used for struct parameters.
`const&` for read-only functions, `&` (non-const) when the function must
modify the struct (e.g., `applyDamage(Character& target, int damage)`).

---

## Step 1 — Define the Character Struct

Add this at the top of `main.cpp`, BEFORE the function definitions:

```cpp
// ── Character struct ──────────────────────────────────────────
// Holds all data for the player character
struct Character {
    // Identity
    std::string name;
    int         level;

    // Core ability scores (D&D standard)
    int str;    // Strength
    int dex;    // Dexterity
    int con;    // Constitution
    int intel;  // Intelligence (not 'int' — that is a keyword)
    int wis;    // Wisdom
    int cha;    // Charisma

    // Derived combat stats
    int hp;
    int maxHP;
    int mp;
    int maxMP;
    int atk;    // attack
    int def;    // defense
    int spd;    // speed

    // Economy and progression
    int gold;
    int xp;
    int xpToNext;  // XP needed for next level

    // Status
    bool alive;
    bool cursed;
};

// ── Enemy struct ──────────────────────────────────────────────
// Simple enemy for now — will expand in Lab 11
struct Enemy {
    std::string name;
    int         hp;
    int         maxHP;
    int         atk;
    int         def;
    int         xpReward;  // XP given to player on defeat
    int         goldReward;
};
```

### SAVE AND TRY

Just add the struct definitions and compile.

**You should see:** Compilation succeeds with no changes to the program output.
This step is structure only — nothing visible changes yet.

**In the terminal:**
```bash
g++ -std=c++17 -o dungeon main.cpp && echo "Struct defined OK"
```
Expected: `Struct defined OK`

---

## Concept: Functions That Return Structs

**What it is:** A function can create a struct, fill in its fields, and return
the whole thing to the caller. This is the cleanest way to construct complex
objects.

**Canonical example (General Explanation):**
A car factory — the factory function assembles all the parts (fields), runs
quality checks (derived value calculations), and then hands you a finished car
(the returned struct). The caller just says "give me a goblin" and receives a
fully configured one.

```cpp
struct Coin {
    std::string metal;
    int         value;
};

Coin makeGoldCoin() {
    Coin c;
    c.metal = "Gold";
    c.value = 100;
    return c;
}

Coin reward = makeGoldCoin();
std::cout << reward.metal << ": " << reward.value << std::endl;
```

Construction logic lives inside the factory — the caller never needs to know
which fields to fill or in what order.

**Project Application (The "Why" here):**
`createCharacter()` rolls stats, computes all derived values, and returns a
complete, ready-to-play `Character`. `createGoblin()` does the same for the
enemy. Without factory functions, every place that needed a new goblin would
have to repeat all 7 field assignments — and any change to goblin stats would
require hunting down every copy.

**Smallest possible example:**
```cpp
struct Weapon {
    std::string name;
    int damage;
};

Weapon makeIronSword() {
    Weapon sword;
    sword.name   = "Iron Sword";
    sword.damage = 8;
    return sword;  // returns a copy — cheap in C++17 with RVO
}

Weapon myWeapon = makeIronSword();
std::cout << myWeapon.name << std::endl;  // Iron Sword
```

**Why it matters here:** `createCharacter()` will roll stats and return a
fully initialized `Character`. `createGoblin()` will return a ready-to-fight
`Enemy`.

---

## Step 2 — The Character Factory Functions

Replace the character creation code with functions that return structs:

```cpp
// ── Character creation ────────────────────────────────────────
// Asks for name, rolls stats, returns a fully initialized Character
Character createCharacter() {
    Character hero;

    // Identity
    std::cout << "  What is your name, brave adventurer? ";
    std::cin >> hero.name;
    hero.level = 1;

    // Roll core stats
    std::cout << std::endl;
    std::cout << "  Rolling ability scores (4d6 drop lowest)..." << std::endl;
    std::cout << std::endl;

    hero.str   = rollAndDisplayAbilityScore("STR");
    hero.dex   = rollAndDisplayAbilityScore("DEX");
    hero.con   = rollAndDisplayAbilityScore("CON");
    hero.intel = rollAndDisplayAbilityScore("INT");
    hero.wis   = rollAndDisplayAbilityScore("WIS");
    hero.cha   = rollAndDisplayAbilityScore("CHA");

    // Derived stats (D&D modifier formula: (score - 10) / 2)
    hero.maxHP   = 10 + (hero.con   - 10) / 2;
    hero.maxMP   =  8 + (hero.intel - 10) / 2;
    hero.hp      = hero.maxHP;
    hero.mp      = hero.maxMP;
    hero.atk     = hero.str / 2;
    hero.def     = hero.con / 4;
    hero.spd     = 5 + (hero.dex - 10) / 2;

    // Economy
    hero.gold    = 50;
    hero.xp      = 0;
    hero.xpToNext = 100;

    // Status
    hero.alive  = true;
    hero.cursed = false;

    return hero;
}

// ── Enemy factories ───────────────────────────────────────────
// Each function creates and returns a specific enemy type

Enemy createGoblin() {
    Enemy goblin;
    goblin.name       = "Goblin";
    goblin.maxHP      = rollNd(2, D6) + 2;  // 2d6+2 HP (4-14)
    goblin.hp         = goblin.maxHP;
    goblin.atk        = roll(D6);            // 1d6 attack
    goblin.def        = 2;
    goblin.xpReward   = 25;
    goblin.goldReward = roll(D4);            // 1d4 gold
    return goblin;
}

Enemy createOrc() {
    Enemy orc;
    orc.name       = "Orc Warrior";
    orc.maxHP      = rollNd(2, D8) + 4;   // 2d8+4 HP (6-20)
    orc.hp         = orc.maxHP;
    orc.atk        = roll(D8);             // 1d8 attack
    orc.def        = 4;
    orc.xpReward   = 50;
    orc.goldReward = rollNd(2, D4);        // 2d4 gold
    return orc;
}

Enemy createSkeleton() {
    Enemy skeleton;
    skeleton.name       = "Skeleton";
    skeleton.maxHP      = rollNd(2, D6);   // 2d6 HP (2-12)
    skeleton.hp         = skeleton.maxHP;
    skeleton.atk        = roll(D6) + 2;    // 1d6+2
    skeleton.def        = 1;
    skeleton.xpReward   = 30;
    skeleton.goldReward = 0;               // skeletons carry no gold
    return skeleton;
}
```

---

## Step 3 — Rewrite the Sheet Display Function

Replace the old multi-parameter `displayCharacterSheet` with one that
takes a `const Character&`:

```cpp
void displayCharacterSheet(const Character& hero) {
    std::cout << std::endl;
    std::cout << "  ┌───────────────────────────────────────┐" << std::endl;
    std::cout << "  │   " << hero.name << " — LEVEL " << hero.level
              << "                      │" << std::endl;
    std::cout << "  ├───────────────────────────────────────┤" << std::endl;
    std::cout << "  │  STR: " << hero.str   << "   DEX: " << hero.dex
              << "   CON: " << hero.con   << "          │" << std::endl;
    std::cout << "  │  INT: " << hero.intel << "   WIS: " << hero.wis
              << "   CHA: " << hero.cha   << "          │" << std::endl;
    std::cout << "  ├───────────────────────────────────────┤" << std::endl;
    std::cout << "  │  HP:  " << hero.hp    << "/" << hero.maxHP
              << "   MP:  " << hero.mp    << "/" << hero.maxMP << "          │" << std::endl;
    std::cout << "  │  ATK: " << hero.atk   << "   DEF: " << hero.def
              << "   SPD: " << hero.spd   << "          │" << std::endl;
    std::cout << "  │  Gold: " << hero.gold  << "   XP: " << hero.xp
              << "/" << hero.xpToNext << "         │" << std::endl;
    std::cout << "  └───────────────────────────────────────┘" << std::endl;
}

void displayEnemy(const Enemy& enemy) {
    std::cout << "  ── " << enemy.name
              << "  HP: " << enemy.hp << "/" << enemy.maxHP
              << "  ATK: " << enemy.atk
              << "  DEF: " << enemy.def
              << " ──" << std::endl;
}
```

Update `main()`:

```cpp
int main() {
    srand(static_cast<unsigned int>(time(nullptr)));

    Character hero = createCharacter();

    std::cout << std::endl;
    std::cout << "  Press ENTER to see your character sheet...";
    std::cin.ignore();
    std::cin.get();

    displayCharacterSheet(hero);

    // Show a sample enemy encounter
    std::cout << std::endl;
    Enemy goblin = createGoblin();
    std::cout << "  Encountered: ";
    displayEnemy(goblin);

    // Game loop from Lab 04 follows here (using hero instead of individual vars)
    bool isRunning = true;
    while (isRunning) {
        // (abbreviated — update commands to use hero.field notation)
        std::cout << std::endl << "  > ";
        char command;
        std::cin >> command;
        if (command == 's' || command == 'S') {
            displayCharacterSheet(hero);
        } else if (command == 'q' || command == 'Q') {
            isRunning = false;
        }
    }

    std::cout << "  Goodbye, " << hero.name << "." << std::endl;
    return 0;
}
```

### SAVE AND TRY

Compile and run.

**You should see:** Character creation, the sheet displayed as a struct,
and an enemy encounter line with randomized HP/ATK.

**In the terminal:**
```
  Encountered: Goblin  HP: 8/8  ATK: 4  DEF: 2
```
Run again — the goblin's HP and ATK will differ.

**Change something:** In `createGoblin()`, change `rollNd(2, D6) + 2` to
`rollNd(3, D8) + 5`. Recompile. The goblin now has 8–29 HP — much scarier.
Change it back.

---

## Challenge: The Dragon Boss

**You know:** The `Enemy` struct, factory functions.

**Task:** Create a `createDragon()` function that returns an ancient dragon
enemy:
- Name: `"Ancient Dragon"`
- HP: 3d10 + 20 (23–50 HP)
- ATK: 2d8 + 5 (7–21 attack)
- DEF: 8 (tough scales)
- XP reward: 500
- Gold reward: 3d10 × 5 (15–150 gold)

Test it by calling it in `main()` and printing the result with `displayEnemy`.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
Enemy createDragon() {
    Enemy dragon;
    dragon.name       = "Ancient Dragon";
    dragon.maxHP      = rollNd(3, D10) + 20;
    dragon.hp         = dragon.maxHP;
    dragon.atk        = rollNd(2, D8) + 5;
    dragon.def        = 8;
    dragon.xpReward   = 500;
    dragon.goldReward = rollNd(3, D10) * 5;
    return dragon;
}
```

**Key insight:** The dragon's stats use the same formula pattern as goblins
and orcs — `rollNd(count, sides) + bonus`. The only difference is larger
numbers. This is data-driven enemy design: the same `Enemy` struct and the
same display function work for every enemy regardless of power level. Adding
a new enemy type requires only a new factory function, not new display code.

</details>

---

## Challenge: Modifying a Struct — `applyDamage`

**You know:** Non-const references modify the original. `hero.hp -= damage`.

**Task:** Write a function `applyDamage(Enemy& target, int damage)` that:
1. Subtracts `damage` from `target.hp`
2. Clamps `target.hp` to a minimum of 0 (no negative HP)
3. Prints `"  ENEMY takes X damage! (Y HP remaining)"` or
   `"  ENEMY is defeated!"` if HP reaches 0

**Then write the equivalent `applyDamageToHero(Character& hero, int damage)`**
that does the same but sets `hero.alive = false` when HP reaches 0.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
void applyDamage(Enemy& target, int damage) {
    target.hp -= damage;
    if (target.hp <= 0) {
        target.hp = 0;
        std::cout << "  " << target.name << " is defeated!" << std::endl;
    } else {
        std::cout << "  " << target.name << " takes " << damage
                  << " damage! (" << target.hp << " HP remaining)" << std::endl;
    }
}

void applyDamageToHero(Character& hero, int damage) {
    hero.hp -= damage;
    if (hero.hp <= 0) {
        hero.hp    = 0;
        hero.alive = false;
        std::cout << "  " << hero.name << " has fallen!" << std::endl;
    } else {
        std::cout << "  " << hero.name << " takes " << damage
                  << " damage! (" << hero.hp << " HP remaining)" << std::endl;
    }
}
```

**Key insight:** Non-const reference `Enemy&` is what allows the function to
modify the original struct. If you passed by value (`Enemy target`) the
function would modify a COPY and the original would be unchanged. The `&` is
the critical difference between "view this data" and "change this data."

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `Character` struct compiles | No compile errors with struct defined |
| `createCharacter()` rolls and returns all 6 stats | Run — see all stats printed |
| `displayCharacterSheet(hero)` takes one argument | Verify function signature has `const Character&` |
| Goblin HP varies between runs | Run 3 times — goblin HP differs |
| `createOrc()` has higher stats than `createGoblin()` | Inspect both — orc HP and ATK base is higher |
| `applyDamage` modifies the enemy struct | Call with a goblin, see HP decrease |
| `applyDamageToHero` sets `alive = false` at 0 HP | Set hero.hp = 1, apply 5 damage — see death message |

---

## Quick Check Answers

**1. What problem does a `struct` solve that individual variables do not?**
Grouping. When data belongs together (a character's name, HP, stats, gold
are all properties of the SAME character), scattering them as 15 separate
variables means: (1) you must pass all 15 to every function, (2) adding
one new stat requires updating every function signature, (3) it is easy
to accidentally pass `maxHP` where `hp` is expected. A struct bundles them
under one named type — functions take `Character&`, not 15 individual ints.

**2. How do you access a field inside a struct?**
The dot operator: `hero.hp`, `goblin.name`, `weapon.damage`. For a pointer
to a struct you use the arrow operator `->`: `heroPtr->hp`. In this series
we use references (`Character&`) rather than pointers, so you always use `.`.

**3. Do changes to `hero.hp` also change `villain.hp`?**
No. `Character hero` and `Character villain` are separate variables in
memory — changing one does not affect the other. Each is an independent
copy of the `Character` struct with its own storage. Changes DO propagate
when you pass by reference (`Character& target`): the function operates on
the ORIGINAL variable, not a copy. This is why `applyDamage(Enemy& target, ...)`
must use `&` — without it the damage would be applied to a temporary copy that
is discarded when the function returns.
