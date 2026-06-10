# C++ Terminal RPG — LAB 03 — Conditionals & the First Choice

**Prerequisites:** LAB 02. You can declare variables of various types, use
`const`, and call a function.

**What this lab adds:**
- `if` / `else if` / `else` to make game decisions
- Comparison and logical operators
- A working "are you dead?" check and a starting room description that
  changes based on your character's stats

**Time:** 40–55 minutes

---

## What You Will Build

After the character sheet is displayed, the game now makes decisions:

```
  ┌─────────────────────────────────────┐
  │        CHARACTER SHEET              │
  ...
  └─────────────────────────────────────┘

  Your journey begins. A cold wind blows through the dungeon entrance.

  [Strong adventurer] Your muscles ripple. Enemies will fear you.
   (Triggered because STR >= 14)

  > You notice a locked chest nearby. Unfortunately, you lack the gold
    to bribe the guard. (Gold = 20, need 30 to bribe)

  A wounded goblin blocks the path. It has 5 HP remaining.
  Do you attack? (y/n): y

  You strike the goblin for 7 damage. It collapses!
  (0 HP <= 0 → dead message triggers)
```

---

> **Quick Check — try to answer before reading:**
> 1. What is the difference between `=` and `==` in C++?
> 2. What does `&&` mean? What does `||` mean?
> 3. Prediction: if `playerHP = 0`, will `if (playerHP)` evaluate as true or
>    false? Why?
> *(Answers at the end of this lab)*

---

## Concept: `if` / `else if` / `else`

**What it is:** Branching — the program takes different paths based on whether
a condition is true or false.

**The problem before:** Without conditionals, every character is treated
identically regardless of their stats:
```cpp
std::cout << "You enter the dungeon." << std::endl;
// Same message for a level-1 weakling and a level-10 warrior
```

**The solution:**
```cpp
if (playerLevel >= 10) {
    std::cout << "Veterans call you by name." << std::endl;
} else if (playerLevel >= 5) {
    std::cout << "You are experienced. Others respect you." << std::endl;
} else {
    std::cout << "You are a fresh-faced adventurer." << std::endl;
}
```

**What it hides:** Hides the raw "compare, then jump" machine instructions
underneath. Without `if/else`, you would need manual `goto` labels and
conditional jumps. The invariant protected: exactly one branch executes per
evaluation — there is no ambiguity about which path ran.

**Canonical example (General Explanation):**
A doorman checking IDs — "if age >= 18, let in; else, turn away." The condition
is evaluated once; exactly one branch executes.
```cpp
if (hp <= 0) {
    std::cout << "Dead" << std::endl;
} else {
    std::cout << "Alive" << std::endl;
}
```
Why this makes the mechanic obvious: the "exactly one path" rule is impossible
to miss — either the person gets in or they don't, never both.

**Project Application (The "Why" here):**
Every choice in the dungeon is an `if/else` — "if player types 'a', attack;
else if 'r', run; else, invalid command." The ladder builds from simple yes/no
(is the goblin dead?) to multi-way `else if` chains for different commands.
The entire command dispatcher in Lab 04 is one long `if/else if/else` chain.

**Smallest possible example:**
```cpp
int hp = 5;
if (hp <= 0) {
    std::cout << "You are dead." << std::endl;
} else if (hp <= 10) {
    std::cout << "You are critically wounded!" << std::endl;
} else {
    std::cout << "You are in good health." << std::endl;
}
```

**Why it matters here:** Every game decision — am I dead? Can I open this
door? Do I have enough gold? — is an `if` statement.

**Watch for:** The condition must be inside parentheses: `if (condition)`.
Forgetting the parentheses is a compile error. Also: the braces `{}` are
optional for single-statement bodies, but ALWAYS use them — omitting them
causes bugs when you add a second line later.

---

## Concept: Comparison Operators

**What it is:** Operators that compare two values and produce a `bool`.

| Operator | Meaning | Example |
|----------|---------|---------|
| `==` | Equal to | `hp == 0` |
| `!=` | Not equal to | `alive != false` |
| `<` | Less than | `gold < 30` |
| `>` | Greater than | `str > 14` |
| `<=` | Less than or equal | `hp <= 0` |
| `>=` | Greater than or equal | `level >= 5` |

**The problem before:**
```cpp
// This is ASSIGNMENT, not comparison:
if (hp = 0) {  // BUG: sets hp to 0, then evaluates 0 as false
    std::cout << "You died." << std::endl;
}
// The game never reports death AND hp is now 0 unexpectedly
```

**The solution:** Use `==` for comparison:
```cpp
if (hp == 0) {  // checks if hp is currently 0
    std::cout << "You died." << std::endl;
}
```

**Canonical example (General Explanation):**
A bathroom scale reading — `weight > 200` is either true or false. The
operator produces a boolean result, not a number. `hp <= 0` means "is HP
at or below zero?" — the answer is yes or no, nothing in between.
```cpp
int weight = 185;
if (weight > 200) {
    std::cout << "Over the limit." << std::endl;
}
```
Why this makes the mechanic obvious: the scale either reads over-limit or it
doesn't — one outcome, no ambiguity.

**Project Application (The "Why" here):**
`hp <= 0` is the death check used throughout this lab. `gold >= 30` guards the
bribe check. `str >= 16` unlocks the forced-open option. Each comparison
produces a single `bool` that one `if` branch acts on — the operator is the
bridge between a stat value and a game decision.

**Watch for:** `=` vs `==` is the single most common C++ bug. `=` assigns.
`==` compares. Many programmers write `if (0 == hp)` (constant on the left)
as a guard — the compiler will catch `if (0 = hp)` as an error, unlike
`if (hp = 0)` which silently compiles.

---

## Concept: Logical Operators — `&&`, `||`, `!`

**What it is:** Operators that combine `bool` expressions.

| Operator | Meaning | True when |
|----------|---------|-----------|
| `&&` | AND | Both sides are true |
| `\|\|` | OR | At least one side is true |
| `!` | NOT | The single operand is false |

**What it hides:** Hides the multi-step process of evaluating two separate
boolean results and combining them. Short-circuit evaluation is also hidden:
`&&` stops evaluating the right side when the left is already false (the
outcome cannot change). Invariant protected: the right-hand operand of `&&`
is NEVER evaluated if the left is false, and the right-hand operand of `||`
is NEVER evaluated if the left is true.

**Canonical example (General Explanation):**
Boarding a plane — you must have a valid ticket AND a valid ID. If either is
missing, you don't board. An `||` version: getting through a side gate requires
a staff badge OR an escort — either one works.
```cpp
bool hasTicket = true;
bool hasID     = false;
if (hasTicket && hasID) {
    std::cout << "Board the plane." << std::endl;
}
```
Why this makes the mechanic obvious: you immediately see that both must be
true — one missing piece blocks the whole condition.

**Project Application (The "Why" here):**
The gold-bribe check combines two stats: you need gold below the threshold AND
high enough strength to force-open instead (`playerGold < BRIBE_COST && statSTR >= 16`).
The goblin attack check uses `||` to accept both uppercase and lowercase input
(`choice == 'y' || choice == 'Y'`). Both patterns appear directly in Step 3.

**Smallest possible example:**
```cpp
int hp    = 15;
int gold  = 10;
bool hasKey = false;

// AND: must have HP > 0 AND gold >= 30 to trade
if (hp > 0 && gold >= 30) {
    std::cout << "You can trade." << std::endl;
}

// OR: open the door if you have a key OR enough strength
if (hasKey || str >= 18) {
    std::cout << "The door opens." << std::endl;
}

// NOT: if NOT alive
if (!isAlive) {
    std::cout << "Game over." << std::endl;
}
```

**Why it matters here:** Battle conditions like "flee if low HP AND outnumbered"
require `&&`. Lockpicking: "succeed if high DEX OR has thieves' tools" requires `||`.

**Watch for:** `&&` has higher precedence than `||`. `a || b && c` means
`a || (b && c)`, which may not be what you intended. Use parentheses: `(a || b) && c`.

---

### Logic: HP Death Check

**What it decides:** Whether to treat the character as dead based on current HP.

**Truth table or breakdown:**

| `hp` value | `hp <= 0` | Outcome |
|------------|-----------|---------|
| 10 | false | Alive — no dead branch |
| 1  | false | Alive — still alive |
| 0  | true  | Dead — `[DEAD]` message |
| -3 | true  | Dead — negative HP still means dead |

**Canonical example:** A light switch with a minimum threshold — the light
turns off once the dimmer hits zero or goes below (a broken dimmer could read
negative).

**The code:** `if (hp <= 0)`

**Watch for:** Using `hp == 0` instead of `hp <= 0` misses negative HP values
(which can occur when damage exceeds remaining HP in a single hit).

---

## Step 1 — The "Are You Dead?" Check

Add this function above `main()`:

```cpp
// Returns true if the character should be considered dead
bool isCharacterDead(int hp) {
    return hp <= 0;  // dead if HP is zero or negative
}

// Prints a status message based on current HP vs max HP
void printHealthStatus(int hp, int maxHP) {
    float hpPercent = static_cast<float>(hp) / static_cast<float>(maxHP);

    if (hp <= 0) {
        std::cout << "  [DEAD] You have fallen." << std::endl;
    } else if (hpPercent <= 0.25f) {
        std::cout << "  [CRITICAL] You are barely alive!" << std::endl;
    } else if (hpPercent <= 0.5f) {
        std::cout << "  [WOUNDED] You are badly hurt." << std::endl;
    } else if (hpPercent <= 0.75f) {
        std::cout << "  [HURT] You have taken some damage." << std::endl;
    } else {
        std::cout << "  [HEALTHY] You are in good condition." << std::endl;
    }
}
```

In `main()`, after `displayCharacterSheet(...)` is called, add:

```cpp
std::cout << std::endl;
printHealthStatus(playerHP, playerMaxHP);
```

### SAVE AND TRY

Compile and run.

**You should see** (after the character sheet):
```
  [HEALTHY] You are in good condition.
```

**In the terminal — test the other branches:**
Temporarily change `int playerHP = playerMaxHP;` to `int playerHP = 2;`.
Recompile. See `[CRITICAL]`. Try `0` → `[DEAD]`. Try `playerMaxHP / 2 - 1`.
Change it back to `playerMaxHP` when done.

**Change something:** Change the `0.25f` threshold to `0.15f`. At what HP
does "CRITICAL" now trigger with a 11-HP character? (Answer: when HP ≤ 1.65,
so HP = 1.)

---

## Concept: `static_cast<float>` — Explicit Type Conversion

**What it is:** A way to convert a value from one type to another explicitly
and safely.

**The problem before:**
```cpp
int hp    = 5;
int maxHP = 20;
float pct = hp / maxHP;  // integer division! result is 0, not 0.25
```

**The solution:**
```cpp
float pct = static_cast<float>(hp) / static_cast<float>(maxHP);
// = 5.0f / 20.0f = 0.25f — correct!
```

**Canonical example (General Explanation):**
Dividing a pizza — if you say "5 slices out of 20 slices" and only work in
whole numbers, you get 0 (integer 5 / 20 = 0 with remainder). The cast is
like switching to a measuring cup that can handle fractions.
```cpp
int slices    = 5;
int totalSlices = 20;
float fraction = static_cast<float>(slices) / totalSlices;
// fraction = 0.25 (correct), not 0 (wrong integer result)
```
Why this makes the mechanic obvious: you can physically see that "5 out of 20"
is 25%, but without the cast the compiler throws that information away.

**Project Application (The "Why" here):**
`hpPercent` in `printHealthStatus` computes current HP as a fraction of max HP
so you can compare it to thresholds like `0.25f` and `0.5f`. Without the cast,
`hp / maxHP` with typical values (e.g., `5 / 11`) always produces `0` — every
character would show `[CRITICAL]` the moment they take any damage at all.

**Why it matters here:** HP percentages for health bars and the status check
use division. Without the cast, `5 / 20 = 0` (integer truncation) and your
health bar would show 0% when you have 25% HP remaining.

**Watch for:** Only ONE operand needs the cast to make the whole division
floating-point: `static_cast<float>(hp) / maxHP` works fine.

---

## Step 2 — Stat-Flavored Room Entry Message

Add this function:

```cpp
void printEntryFlavor(int str, int intel, int cha) {
    std::cout << std::endl;
    std::cout << "  Your journey begins. A cold wind blows from the dungeon entrance." << std::endl;
    std::cout << std::endl;

    // Strength flavor
    if (str >= 16) {
        std::cout << "  Your powerful frame makes the torch flicker as you pass." << std::endl;
    } else if (str >= 12) {
        std::cout << "  You carry your pack with ease." << std::endl;
    } else {
        std::cout << "  You struggle with the weight of your equipment." << std::endl;
    }

    // Intelligence flavor
    if (intel >= 15) {
        std::cout << "  You quickly memorize the dungeon map you saw at the entrance." << std::endl;
    } else if (intel >= 10) {
        std::cout << "  You try to remember the map. Some details are fuzzy." << std::endl;
    } else {
        std::cout << "  You forgot to look at the map. Which way is deeper?" << std::endl;
    }

    // Charisma flavor
    if (cha >= 15) {
        std::cout << "  The entrance guard smiles and waves you through." << std::endl;
    } else if (cha <= 6) {
        std::cout << "  The entrance guard sneers at your appearance." << std::endl;
    }
    // No message for average CHA — intentional: neutral gets no comment
}
```

Call it in `main()`:
```cpp
printEntryFlavor(statSTR, statINT, statCHA);
```

### SAVE AND TRY

Compile and run with the default stats (STR 14, INT 16, CHA 8).

**You should see:**
- STR 14: `"You carry your pack with ease."`
- INT 16: `"You quickly memorize the dungeon map..."`
- CHA 8: *(no CHA message — 8 is between 7 and 14)*

**Change something:** Change `STARTING_CHA` to `16`. Now you should see the
positive CHA message. Change it to `5` to see the negative one.
Change it back to `8`.

---

## Step 3 — A Simple Combat Preview

Add this to `main()` after `printEntryFlavor`:

```cpp
std::cout << std::endl;
std::cout << "  A wounded goblin blocks the path." << std::endl;
std::cout << "  It has 5 HP remaining." << std::endl;
std::cout << std::endl;
std::cout << "  Do you attack? (y/n): ";

char choice;
std::cin >> choice;
std::cout << std::endl;

// Check the player's choice
if (choice == 'y' || choice == 'Y') {
    int goblinHP  = 5;
    int goblinMaxHP = 20;
    int damage    = playerATK;  // your ATK stat (from Lab 02)

    goblinHP = goblinHP - damage;  // apply damage

    std::cout << "  You strike the goblin for " << damage << " damage!" << std::endl;

    if (goblinHP <= 0) {
        std::cout << "  The goblin collapses! Victory!" << std::endl;
    } else {
        std::cout << "  The goblin staggers back. It has " << goblinHP << " HP remaining." << std::endl;
    }
} else if (choice == 'n' || choice == 'N') {
    std::cout << "  You step aside cautiously. The goblin snarls." << std::endl;
} else {
    std::cout << "  Confused by your response, you do nothing." << std::endl;
}
```

### SAVE AND TRY

Compile and run.

**You should see:** The goblin prompt. Type `y`. With ATK = 7, damage = 7 > 5,
so the goblin dies. Type `n` and see the step-aside message.

**In the terminal — test all branches:**
1. Run, type `y` → goblin dies
2. Run, type `n` → step aside
3. Run, type `z` → confused message (the `else`)
4. Run, type `Y` (uppercase) → also attacks (the `||` handles it)

**Change something:** Change `int goblinHP = 5;` to `int goblinHP = 15;`.
Recompile. Now the goblin survives your attack.
Change it back to `5`.

---

## Challenge: The Gold Check

**You know:** Comparison operators, `&&`, `||`, `if`/`else`.

**Task:** After the goblin encounter, add a locked chest:
- Print: `"You find a locked chest."`
- If `playerGold >= 30`: print `"You bribe the guard. The chest opens."` and
  subtract 30 from `playerGold`.
- If `playerGold < 30 && playerSTR >= 16`: print `"Too poor to bribe, but
  you're strong enough to force it open!"` (the chest opens anyway).
- Otherwise: print `"The chest remains locked."` (you walk past).

**Starting code:**
```cpp
// Add after the goblin encounter in main()
int chestCost = 30;  // gold to bribe the guard
```

---

<details>
<summary>▶ Show Solution</summary>

```cpp
const int BRIBE_COST = 30;  // gold required to bribe the chest guard

std::cout << std::endl;
std::cout << "  You find a locked chest." << std::endl;

if (playerGold >= BRIBE_COST) {
    playerGold -= BRIBE_COST;  // -= is shorthand for playerGold = playerGold - BRIBE_COST
    std::cout << "  You bribe the guard. The chest opens." << std::endl;
    std::cout << "  Remaining gold: " << playerGold << std::endl;
} else if (playerGold < BRIBE_COST && statSTR >= 16) {
    std::cout << "  Too poor to bribe, but strong enough to force it open!" << std::endl;
} else {
    std::cout << "  The chest remains locked. You walk past." << std::endl;
}
```

**Key insight:** The `-=` shorthand is not just shorter — it prevents a
whole class of bugs. Compare:
```cpp
playerGold = playerGold - BRIBE_COST;  // safe but verbose
playerGold -= BRIBE_COST;               // same thing, fewer characters
```
The same family: `+=`, `-=`, `*=`, `/=`, `%=`. They all read as "modify this
variable by this amount." Use them everywhere — they communicate intent.

</details>

---

## Challenge: The Three-Way Stat Check

**You know:** `&&`, `||`, chained `else if`.

**Task:** Write a function `bool canEnterSecretDoor(int str, int dex, int intel)`
that returns `true` if the character can enter a secret door. The rules are:
- Must have INT >= 12 (to notice the door) AND (STR >= 15 OR DEX >= 15)
- A character with INT < 12 can NEVER enter, even with max STR/DEX

**Test it with a `cout` that prints "Secret door found!" or "You see only a wall."**

---

<details>
<summary>▶ Show Solution</summary>

```cpp
bool canEnterSecretDoor(int str, int dex, int intel) {
    // Must be smart enough to notice, AND strong or agile enough to open
    return intel >= 12 && (str >= 15 || dex >= 15);
}
```

In main:
```cpp
if (canEnterSecretDoor(statSTR, statDEX, statINT)) {
    std::cout << "  You notice a hidden door in the wall! Secret passage found!" << std::endl;
} else {
    std::cout << "  You see only a solid wall." << std::endl;
}
```

**Key insight:** Extracting the condition into a named function (`canEnterSecretDoor`)
is much clearer than writing the raw `&&` / `||` expression inline. Readable
code says WHAT, not HOW. The function name is documentation.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Health status prints after character sheet | Run — see `[HEALTHY]` etc. after the sheet |
| CRITICAL triggers at 25% HP | Temporarily set `playerHP = 2`, see `[CRITICAL]` |
| DEAD triggers at 0 HP | Set `playerHP = 0`, see `[DEAD]` |
| Stat flavor varies with stats | Change STR, INT, CHA constants, see different messages |
| Goblin `y/Y` both attack | Type `Y` — goblin is attacked |
| Goblin combat result varies with ATK | Set `goblinHP = 30`, goblin survives the attack |
| `else` catches unexpected input | Type `z` — see "Confused" message |

---

## Quick Check Answers

**1. What is the difference between `=` and `==` in C++?**
`=` is assignment — it stores a value into a variable: `hp = 5` sets hp to 5.
`==` is comparison — it tests equality and produces a `bool`: `hp == 5` is
`true` only if hp currently holds the value 5. Writing `if (hp = 0)` is
a bug that compiles silently: it SETS hp to 0, then evaluates the integer
`0` as `false`, so the `if` body never runs and hp has been overwritten.

**2. What does `&&` mean? What does `||` mean?**
`&&` is logical AND: the whole expression is `true` only if BOTH sides are
`true`. `gold >= 30 && hasKey` — you need both gold AND a key.
`||` is logical OR: the whole expression is `true` if EITHER side (or both)
is `true`. `hasKey || str >= 18` — a key works, or raw strength works.
Short-circuit evaluation: `&&` stops evaluating if the left side is `false`
(the right side cannot change the outcome). `||` stops if the left side is
`true`. This matters when the right side has side effects.

**3. Prediction: will `if (playerHP)` be true or false when `playerHP = 0`?**
False. In C++, any non-zero integer is treated as `true` when used in a
boolean context; zero is `false`. So `if (playerHP)` is equivalent to
`if (playerHP != 0)`. When HP = 0, the condition is false and the body does
not execute. This integer-to-bool implicit conversion is a C++ feature
inherited from C. It is concise but can be confusing — `if (hp > 0)` is
clearer and should be preferred for readability.
