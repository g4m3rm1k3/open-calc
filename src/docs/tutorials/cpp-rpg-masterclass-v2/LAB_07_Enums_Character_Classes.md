# C++ Terminal RPG — LAB 07 — Enums & Character Classes

**Prerequisites:** LAB 06. You have `Character` and `Enemy` structs, factory
functions, and the dice system.

**What this lab adds:**
- `enum class` for character classes and damage types
- `switch` statements for dispatch
- Class-based stat bonuses that reshape the character sheet
- Six playable classes: Warrior, Mage, Rogue, Ranger, Paladin, Cleric

**Time:** 55–70 minutes

---

## What You Will Build

Character creation now includes a class selection step:

```
  Choose your class:
  ──────────────────────────────────────────
  [1] Warrior  — Heavy armor, massive damage. STR++, CON++
  [2] Mage     — Devastating spells. INT++, WIS++
  [3] Rogue    — Quick strikes and stealth. DEX++, CHA++
  [4] Ranger   — Bow and beast. DEX++, WIS++
  [5] Paladin  — Holy warrior. STR++, CHA++, divine magic
  [6] Cleric   — Healer. WIS++, CON++, powerful heals
  ──────────────────────────────────────────
  > 2

  You have chosen: MAGE
  +3 INT, +2 WIS applied. Spells are your weapon.

  ┌─────────────────────────────────────────┐
  │     EREVAN — MAGE — LEVEL 1            │
  ├─────────────────────────────────────────┤
  │  STR: 12   DEX: 11   CON: 10           │
  │  INT: 18   WIS: 15   CHA: 10           │  ← INT/WIS boosted
```

---

> **Quick Check — try to answer before reading:**
> 1. Why use `enum class CharacterClass` instead of `const int WARRIOR = 0`?
> 2. What is a `switch` statement and how is it different from `if/else if`?
> 3. Prediction: what happens in a `switch` if you forget `break` at the end
>    of a case?
> *(Answers at the end of this lab)*

---

## Concept: `enum class` — Named Integer Constants with Type Safety

**What it is:** A way to define a set of named constants that share a type.
Each name maps to an integer but the type prevents mixing them up.

**The problem before:**
```cpp
// Magic number approach — which class is 3?
const int WARRIOR = 0;
const int MAGE    = 1;
const int ROGUE   = 2;
// ...
int heroClass = 3;  // Is 3 valid? What class is it?
// Also: heroClass = 42; compiles fine — but 42 is not a valid class
```

**The solution:**
```cpp
enum class CharacterClass {
    Warrior,
    Mage,
    Rogue,
    Ranger,
    Paladin,
    Cleric
};

CharacterClass heroClass = CharacterClass::Mage;
// heroClass = 42;  // COMPILE ERROR — type safety prevents this
```

**What it hides:** Hides magic numbers. Without `enum class CharacterClass`,
you'd write `if (charClass == 1)` and `if (charClass == 2)` — meaningless
integers that anyone can accidentally set to 99. The invariant: values outside
the defined set cannot be created. The type system enforces it at compile time,
not at runtime (or never).

**Canonical example (General Explanation):**

A traffic light can only be RED, YELLOW, or GREEN. It is never in state 4,
never "blinking," never 99. The set of valid values is fixed and named.

```cpp
// Canonical: traffic light with exactly three valid states
enum class Light { Red, Yellow, Green };

Light signal = Light::Red;

if (signal == Light::Green) {
    std::cout << "Go." << std::endl;
}
// signal = 4;  // COMPILE ERROR — 4 is not a Light
```

Why this example makes the mechanic obvious: "only these specific values are
valid" mirrors exactly what an enum does. The type constrains the universe of
possible values to exactly the named set — no more, no less.

Note on `enum class` vs plain `enum`: `enum class` is scoped — you must write
`CharClass::Warrior`, not just `Warrior`. This prevents name collisions across
different enums. Plain `enum` (without `class`) leaks its names into the
enclosing scope: if you had both `enum Color { Red, Green }` and
`enum Light { Red, Yellow }` in the same file, `Red` would be ambiguous.
`enum class` eliminates that problem entirely.

**Project Application (The "Why" here):**

This RPG uses `CharacterClass` to represent the six playable class archetypes.
Every function that cares about a character's class — `getClassName()`,
`getClassDescription()`, `applyClassBonuses()`, `getStartingWeapon()` — takes
a `CharacterClass` parameter. The type system guarantees that none of these
functions can receive an invented class number. Later in the series,
`DamageType`, `RoomType`, `ItemType`, and `EnemyType` all follow the same
pattern.

**Smallest possible example:**
```cpp
enum class Direction { North, South, East, West };

Direction facing = Direction::North;

if (facing == Direction::North) {
    std::cout << "You are heading north." << std::endl;
}
```

**Why it matters here:** Every item type, damage type, room type, and enemy
type in the game becomes an `enum class`. The compiler catches impossible
values at compile time instead of at runtime (or never).

**Watch for:** You MUST use the full qualified name: `CharacterClass::Mage`,
not just `Mage`. This is the "class" in `enum class` — it scopes the names
to prevent collisions. Plain `enum` (without `class`) leaks names into the
surrounding scope and is not recommended in modern C++.

---

## Concept: `switch` — Fast Multi-Branch Dispatch

**What it is:** A control structure that jumps directly to the matching case.
Cleaner than a chain of `else if` when branching on a single value.

**The problem before:**
```cpp
// Long if/else chain — hard to read:
if (heroClass == CharacterClass::Warrior) {
    bonusSTR = 3;
} else if (heroClass == CharacterClass::Mage) {
    bonusINT = 3;
} else if (heroClass == CharacterClass::Rogue) {
    // ...
}
```

**The solution:**
```cpp
switch (heroClass) {
    case CharacterClass::Warrior:
        bonusSTR = 3;
        break;  // ← REQUIRED to exit the switch
    case CharacterClass::Mage:
        bonusINT = 3;
        break;
    case CharacterClass::Rogue:
        bonusDEX = 3;
        break;
    default:
        // handles any case not explicitly listed
        break;
}
```

**Canonical example (General Explanation):**

A factory stamping machine with a dial — if the dial says WARRIOR, the machine
stamps out a sword; if it says MAGE, it stamps out a staff. The switch
exhausts all cases, and each case produces a distinct result. Once a case
body runs, `break` sends execution past the entire switch.

```cpp
// Canonical: machine dial dispatch
enum class Product { Sword, Staff, Bow };

Product dial = Product::Staff;

switch (dial) {
    case Product::Sword: std::cout << "Stamped: sword"  << std::endl; break;
    case Product::Staff: std::cout << "Stamped: staff"  << std::endl; break;
    case Product::Bow:   std::cout << "Stamped: bow"    << std::endl; break;
}
// Output: Stamped: staff
```

Why this example makes the mechanic obvious: the dial has a fixed set of
positions (matching the enum), and each position produces one specific outcome.
The switch is the code equivalent of "check the dial, do the matching action."

**Project Application (The "Why" here):**

`switch` on `CharacterClass` appears in at least four functions in this lab:
`getClassName()`, `getClassDescription()`, `applyClassBonuses()`, and
`selectClass()`. Every future dispatch on `DamageType`, `RoomType`, and enemy
type follows the same skeleton. Learning to read and write this `switch`
pattern is learning to read the entire game's dispatch logic.

**Smallest possible example:**
```cpp
enum class DieType { D4, D6, D8 };
DieType die = DieType::D6;

switch (die) {
    case DieType::D4: std::cout << "4-sided die" << std::endl; break;
    case DieType::D6: std::cout << "6-sided die" << std::endl; break;
    case DieType::D8: std::cout << "8-sided die" << std::endl; break;
}
// Output: 6-sided die
```

**Why it matters here:** `switch` is used to dispatch on character class,
room type, item type, and battle action type throughout the game.

**Watch for:** Forgetting `break` causes **fall-through** — execution
continues into the NEXT case. This is a notorious C++ bug. Some compilers
warn about it (`-Wimplicit-fallthrough`). Intentional fall-through (two cases
sharing one body) is valid but should be marked with a comment `// fall-through`.

---

## Step 1 — Define the Enums

Add these definitions after the `Enemy` struct, before the function definitions:

```cpp
// ── Character class enum ──────────────────────────────────────
enum class CharacterClass {
    Warrior,   // STR/CON — frontline fighter
    Mage,      // INT/WIS — arcane spellcaster
    Rogue,     // DEX/CHA — fast, sneaky striker
    Ranger,    // DEX/WIS — ranged and nature magic
    Paladin,   // STR/CHA — holy warrior, limited healing
    Cleric     // WIS/CON — healer and support
};

// ── Damage type enum — used in battle system (Lab 12+) ────────
enum class DamageType {
    Physical,   // resisted by DEF
    Fire,       // resisted by CON modifier
    Ice,        // resisted by CON modifier  
    Lightning,  // resisted by WIS modifier
    Holy,       // bypasses most resistances
    Poison      // damage over time (Lab 12)
};

// ── Add the class field to the Character struct ────────────────
// (open the struct definition and add one line)
// struct Character {
//     ...
//     CharacterClass characterClass;   ← ADD THIS
// };
```

Add `CharacterClass characterClass;` to the `Character` struct from Lab 06.

### SAVE AND TRY

Compile. No visible output change yet — this is structural setup.

```bash
g++ -std=c++17 -o dungeon main.cpp && echo "Enums defined OK"
```

---

## Step 2 — Class Name and Description Functions

Add these above `main()`:

```cpp
// Returns the display name for a character class
std::string getClassName(CharacterClass characterClass) {
    switch (characterClass) {
        case CharacterClass::Warrior: return "Warrior";
        case CharacterClass::Mage:    return "Mage";
        case CharacterClass::Rogue:   return "Rogue";
        case CharacterClass::Ranger:  return "Ranger";
        case CharacterClass::Paladin: return "Paladin";
        case CharacterClass::Cleric:  return "Cleric";
        default:                      return "Unknown";
    }
}

// Returns the class description for the selection menu
std::string getClassDescription(CharacterClass characterClass) {
    switch (characterClass) {
        case CharacterClass::Warrior:
            return "Heavy armor, massive damage. STR+3, CON+2";
        case CharacterClass::Mage:
            return "Devastating spells. INT+3, WIS+2";
        case CharacterClass::Rogue:
            return "Quick strikes and stealth. DEX+3, CHA+2";
        case CharacterClass::Ranger:
            return "Bow and beast magic. DEX+2, WIS+2";
        case CharacterClass::Paladin:
            return "Holy warrior. STR+2, CHA+2, divine smites";
        case CharacterClass::Cleric:
            return "Healer. WIS+3, CON+2, powerful heals";
        default:
            return "";
    }
}
```

### SAVE AND TRY

Test these functions with a temporary line in `main()`:

```cpp
std::cout << getClassName(CharacterClass::Mage) << std::endl;
std::cout << getClassDescription(CharacterClass::Paladin) << std::endl;
```

**You should see:**
```
Mage
Holy warrior. STR+2, CHA+2, divine smites
```

Remove the test lines after verifying.

---

## Step 3 — Class Stat Bonuses

Add this function that modifies the character's stats based on their class:

```cpp
// Applies class-specific stat bonuses to the character
// Note: modifies by reference — changes the ORIGINAL Character
void applyClassBonuses(Character& hero) {
    switch (hero.characterClass) {

        case CharacterClass::Warrior:
            hero.str += 3;
            hero.con += 2;
            hero.maxHP += 5;  // warriors get extra HP
            hero.hp     = hero.maxHP;
            std::cout << "  +3 STR, +2 CON, +5 HP applied." << std::endl;
            std::cout << "  Your body is built for battle." << std::endl;
            break;

        case CharacterClass::Mage:
            hero.intel += 3;
            hero.wis   += 2;
            hero.maxMP += 8;  // mages get extra MP
            hero.mp     = hero.maxMP;
            std::cout << "  +3 INT, +2 WIS, +8 MP applied." << std::endl;
            std::cout << "  Spells surge through your mind." << std::endl;
            break;

        case CharacterClass::Rogue:
            hero.dex += 3;
            hero.cha += 2;
            std::cout << "  +3 DEX, +2 CHA applied." << std::endl;
            std::cout << "  You move like a shadow." << std::endl;
            break;

        case CharacterClass::Ranger:
            hero.dex += 2;
            hero.wis += 2;
            std::cout << "  +2 DEX, +2 WIS applied." << std::endl;
            std::cout << "  The wilderness is your home." << std::endl;
            break;

        case CharacterClass::Paladin:
            hero.str += 2;
            hero.cha += 2;
            hero.maxHP += 3;
            hero.hp    = hero.maxHP;
            std::cout << "  +2 STR, +2 CHA, +3 HP applied." << std::endl;
            std::cout << "  Your oath grants you divine strength." << std::endl;
            break;

        case CharacterClass::Cleric:
            hero.wis += 3;
            hero.con += 2;
            hero.maxHP += 4;
            hero.hp    = hero.maxHP;
            hero.maxMP += 4;
            hero.mp    = hero.maxMP;
            std::cout << "  +3 WIS, +2 CON, +4 HP, +4 MP applied." << std::endl;
            std::cout << "  Your god's blessing flows through you." << std::endl;
            break;
    }

    // Recalculate derived stats after bonuses
    hero.atk = hero.str / 2;
    hero.def = hero.con / 4;
    hero.spd = 5 + (hero.dex - 10) / 2;
}
```

---

## Step 4 — Class Selection in Character Creation

Add a `selectClass()` function and call it from `createCharacter()`:

```cpp
// Displays the class menu and returns the player's choice
CharacterClass selectClass() {
    std::cout << std::endl;
    std::cout << "  Choose your class:" << std::endl;
    std::cout << "  ──────────────────────────────────────────" << std::endl;
    std::cout << "  [1] Warrior  — " << getClassDescription(CharacterClass::Warrior) << std::endl;
    std::cout << "  [2] Mage     — " << getClassDescription(CharacterClass::Mage)    << std::endl;
    std::cout << "  [3] Rogue    — " << getClassDescription(CharacterClass::Rogue)   << std::endl;
    std::cout << "  [4] Ranger   — " << getClassDescription(CharacterClass::Ranger)  << std::endl;
    std::cout << "  [5] Paladin  — " << getClassDescription(CharacterClass::Paladin) << std::endl;
    std::cout << "  [6] Cleric   — " << getClassDescription(CharacterClass::Cleric)  << std::endl;
    std::cout << "  ──────────────────────────────────────────" << std::endl;
    std::cout << "  > ";

    int choice;
    std::cin >> choice;

    switch (choice) {
        case 1:  return CharacterClass::Warrior;
        case 2:  return CharacterClass::Mage;
        case 3:  return CharacterClass::Rogue;
        case 4:  return CharacterClass::Ranger;
        case 5:  return CharacterClass::Paladin;
        case 6:  return CharacterClass::Cleric;
        default:
            std::cout << "  Invalid choice. Defaulting to Warrior." << std::endl;
            return CharacterClass::Warrior;
    }
}
```

In `createCharacter()`, after rolling stats, add:

```cpp
// Class selection
hero.characterClass = selectClass();          // ← add this
std::cout << std::endl;                       // ← add this
std::cout << "  You have chosen: "            // ← add this
          << getClassName(hero.characterClass) // ← add this
          << std::endl;                        // ← add this
applyClassBonuses(hero);                      // ← add this
```

Update `displayCharacterSheet` to show the class in the header. The change is
a single addition to the header line:

```cpp
void displayCharacterSheet(const Character& hero) {
    std::cout << "  ┌───────────────────────────────────────┐" << std::endl;
    std::cout << "  │  " << hero.name
              << " — " << getClassName(hero.characterClass)  // ← add this
              << " — LEVEL " << hero.level << std::endl;
    // ... rest unchanged
}
```

### SAVE AND TRY

Compile and run.

**You should see:**
1. Roll stats
2. Class selection menu
3. Type `2` → Mage bonus applied
4. Character sheet shows `EREVAN — MAGE — LEVEL 1` with higher INT/WIS

**In the terminal — test all 6 classes:**
Run 6 times, choosing each class. Verify the stat bonuses match the descriptions.

**Change something:** In `applyClassBonuses`, change Warrior's `+5 HP` bonus
to `+10 HP`. See the difference in the sheet. Change it back.

---

### Pattern: Data-Driven Dispatch

**Pattern category:** Behavioral
**Official name:** Table-driven methods / Data-driven dispatch
**Pain before:** A chain of `if/else if` checking enum values — adding a new
class means editing every dispatch chain in every function that touches class.
**Solution:** Map enum values to data (stat modifiers, names, descriptions) in
a lookup table or a consistent `switch` skeleton. All dispatch functions follow
the same shape: one enum value → one behavior.
**Tradeoff:** A `switch` table is harder to read for complex logic; simple
`if/else` is clearer for 2–3 cases. When there are 6+ cases and multiple
dispatch points, the consistent `switch` skeleton pays off.
**You will see this again in:** LAB 11 (enemy type dispatch), LAB 15 (room
type generation)

---

## Challenge: Class-Based Starting Weapon Text

**You know:** `switch`, `CharacterClass`, `getClassName()`.

**Task:** Write a function `std::string getStartingWeapon(CharacterClass cls)`
that returns the name of the starting weapon for each class:
- Warrior → `"Longsword (1d8)"`
- Mage → `"Arcane Staff (1d6+INT)"`
- Rogue → `"Short Swords x2 (1d6)"`
- Ranger → `"Shortbow (1d6)"`
- Paladin → `"War Hammer (1d8+Holy)"`
- Cleric → `"Mace (1d6+WIS)"`

Print it after the class bonuses: `"Your starting weapon: Longsword (1d8)"`.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
std::string getStartingWeapon(CharacterClass cls) {
    switch (cls) {
        case CharacterClass::Warrior: return "Longsword (1d8)";
        case CharacterClass::Mage:    return "Arcane Staff (1d6+INT)";
        case CharacterClass::Rogue:   return "Short Swords x2 (1d6)";
        case CharacterClass::Ranger:  return "Shortbow (1d6)";
        case CharacterClass::Paladin: return "War Hammer (1d8+Holy)";
        case CharacterClass::Cleric:  return "Mace (1d6+WIS)";
        default:                      return "Fists (1d3)";
    }
}
```

In character creation after `applyClassBonuses`:
```cpp
std::cout << "  Your starting weapon: "
          << getStartingWeapon(hero.characterClass) << std::endl;
```

**Key insight:** Every function that dispatches on `CharacterClass` uses the
same `switch` skeleton. This is the **Data-Driven Dispatch** pattern: the
`switch` is a lookup table in code form. In Lab 14 you refactor this into
a `std::map` or virtual functions — but the concept remains the same: one
enum value → one behavior.

</details>

---

## Challenge: The Fallen Warrior — Fall-Through Demo

**You know:** `switch` fall-through (when `break` is omitted).

**Task:** Intentionally use fall-through to create a class tier display:
```cpp
switch (heroClass) {
    case CharacterClass::Paladin:   // fall-through intentional
    case CharacterClass::Warrior:
        std::cout << "  [Frontline Fighter]" << std::endl;
        break;
    case CharacterClass::Cleric:    // fall-through intentional
    case CharacterClass::Mage:
        std::cout << "  [Caster]" << std::endl;
        break;
    case CharacterClass::Rogue:     // fall-through intentional
    case CharacterClass::Ranger:
        std::cout << "  [Skirmisher]" << std::endl;
        break;
}
```
Add this to the character sheet display. Test all 6 classes — each should
print the right tier label.

---

<details>
<summary>▶ Show Solution</summary>

The code above IS the solution. Add it to `displayCharacterSheet`, just
before the closing line.

**Key insight:** Intentional fall-through — two `case` labels sharing one
body with no `break` in between — is a valid C++ feature. Paladin and
Warrior are both frontline fighters: they share the "Frontline Fighter" label.
The `// fall-through intentional` comments tell the next programmer (and the
compiler) this is deliberate, not a forgotten `break`. Some codebases use
`[[fallthrough]];` (a C++17 attribute) instead of a comment for this.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `enum class CharacterClass` compiles | No errors with enum defined |
| `getClassName` returns correct name for each class | Test all 6 classes |
| Class selection menu shows all 6 | Run and see the menu |
| Class bonuses apply correctly for Mage | Choose Mage — INT and WIS increase |
| Character sheet header shows class name | See `EREVAN — MAGE — LEVEL 1` |
| Invalid class choice defaults gracefully | Type `9` — see "Defaulting to Warrior" |
| `DamageType` enum compiles | Add it to file, compile succeeds |

---

## Quick Check Answers

**1. Why use `enum class CharacterClass` instead of `const int WARRIOR = 0`?**
Three reasons. First, type safety: `CharacterClass::Warrior` cannot be
accidentally compared to a `DamageType::Fire` or assigned the number `99` —
the compiler catches misuse at compile time. Second, namespacing: the values
live in the `CharacterClass` scope, so `Warrior` doesn't collide with a
`Warrior` in another enum. Third, readability: `CharacterClass::Mage` in code
is instantly meaningful; `int heroClass = 1` requires you to look up what `1`
means in your constants table.

**2. What is a `switch` statement, and how is it different from `if/else if`?**
Both `switch` and `if/else if` pick one branch from many. The difference:
`switch` can only test a single variable against constant values (integers
or enum values). `if/else if` can test ANY boolean expression. So
`if (hp <= 0 && !alive)` is not expressible in a `switch`, but
`switch (characterClass)` is cleaner than six chained `else if` comparisons.
Performance: `switch` compiles to a jump table for many cases — O(1) dispatch
regardless of how many cases — while `if/else if` is O(n), testing each
condition in sequence.

**3. Prediction: what happens if you forget `break` in a switch case?**
Fall-through: execution continues into the next case's body, regardless of
whether the next case matches. Example: if Warrior has no `break` and the
next case is Mage, a Warrior character will execute BOTH the Warrior body
AND the Mage body. This is almost always a bug. The compiler may warn about
it with `-Wall`. The fix is always `break;` at the end of each case body,
or `return` if the function should exit entirely.
