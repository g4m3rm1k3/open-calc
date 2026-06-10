# C++ Terminal RPG — LAB 12 — The Battle System

**Prerequisites:** LAB 11. You have enemy animations, the character struct
with inventory, and room navigation.

**What this lab adds:**
- A complete turn-based battle system
- Four actions: Attack, Defend, Use Item, Flee
- D&D-style hit and miss rolls, critical hits, damage calculation
- Post-battle XP/gold rewards and leveling up

**Time:** 70–85 minutes

---

## What You Will Build

When combat starts, the battle resolves turn by turn:

```
  [Round 1]
  ─────────────────────────────────────────
  Your HP:    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  11/11
  Goblin HP:  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░   8/8

  Choose action:
  [A]ttack  [D]efend  [I]tem  [F]lee
  > a

  You roll to hit: d20 + 3 = 17 vs Goblin DEF 2... HIT!
  You deal 9 damage (1d8 = 5 + STR mod 4).
  Goblin HP: ▓▓░░░░░░░░░░░░░░   2/8 — WOUNDED!

  [Goblin's turn]
  Goblin attacks: d20 roll = 11 vs your DEF 3... HIT!
  Goblin deals 4 damage.
  Your HP: ▓▓▓▓▓▓▓▓▓▓▓░░░░░   7/11

  [Round 2]
  ...
  > a

  You roll to hit: 20 — CRITICAL HIT! Double damage!
  You deal 16 damage. Goblin is defeated!

  ──── VICTORY! ────
  XP gained:   +25
  Gold gained: +3
  Total XP: 25/100

  (Level up check: no level up yet)
```

---

> **Quick Check — try to answer before reading:**
> 1. What is a "hit roll" in D&D? What two values does it compare?
> 2. How does defending (the [D] action) change the battle outcome?
> 3. Prediction: if the player has DEF = 3 and the enemy rolls d20 + enemy.atk,
>    at what roll total does the attack "hit"?
> *(Answers at the end of this lab)*

---

## Mental Model: The Battle Loop (Nested Game Loop)

**Official name:** Game Loop Pattern — used again

First seen in: LAB 04 where the outer game loop processes player commands.

**Here it appears as:** A nested battle loop that runs while both combatants
are alive. The outer game loop is suspended while the battle loop runs. When
the battle ends (win, lose, or flee), the outer loop resumes.

**The difference:** The battle loop processes combat actions (Attack, Defend,
Item, Flee) rather than room commands (Look, Move, Heal). It is temporary —
it runs until the battle resolves, then the outer loop takes over.

```
Outer game loop (Lab 04):
  while (gameRunning) {
    read command
    if (encounter enemy) {
      
      Inner battle loop (Lab 12):
        while (heroAlive && enemyAlive) {
          read battle action
          process hero action
          process enemy action
        }
      
      continue outer loop with updated hero
    }
  }
```

### Mental Model: The Finite State Machine — applied again

First seen in: LAB_04 (game loop with `isRunning` state).

Here it appears as: the battle state machine — battling, won, lost, fled.

The difference: The LAB_04 loop had one exit condition (`isRunning = false`).
The battle loop has multiple exit conditions — enemy's HP reaches 0 (win),
hero's HP reaches 0 (lose), or player successfully flees. All three end the
same `while` loop but return different `BattleResult` values, so the outer
game loop knows what happened and can respond accordingly (award XP vs. game
over vs. leave enemy alive).

---

## Concept: D&D Hit and Damage Rolls

**What it is:** The standard D&D combat resolution:
1. **Hit roll:** `d20 + attackBonus >= targetAC` → hit or miss
2. **Damage roll:** dice based on weapon type (1d8 for sword, 1d4 for dagger)
3. **Critical hit:** rolling exactly 20 on the d20 → double damage

**In our game:**
- Hero's attack bonus = `hero.atk / 2`
- Enemy's armor class (AC) = `enemy.def + 10` (the D&D base is 10)
- If `d20 + attackBonus >= enemyAC` → hit
- On a 20 → critical hit (double dice damage)

**Smallest possible example:**
```cpp
int attackBonus = hero.atk / 2;
int targetAC    = enemy.def + 10;
int hitRoll     = roll(D20) + attackBonus;

if (hitRoll == 20 + attackBonus) {
    // Critical hit — only if the d20 roll was 20
    // Check the raw d20 roll
}
```

**What it hides:** Two separate values travel through the hit check: the raw
d20 result (needed to detect a natural 20 crit) and the total roll (needed to
compare against AC). `rollToHit` exposes both via an out-parameter
(`rawD20Out`) so the caller can check for crits without rerolling. Invariant:
a natural 20 is always a critical hit, even if the total would have hit anyway.

**Canonical example (General Explanation):**
Rolling a d20 in D&D — you need to roll above the enemy's armor class. Higher
roll means hit; lower roll means miss.

```cpp
// Does this attack land?
int raw   = roll(D20);          // 1–20
int bonus = attacker.atk / 2;  // skill modifier
int ac    = defender.def + 10; // how hard defender is to hit

bool hit  = (raw + bonus) >= ac;
bool crit = (raw == 20);       // natural 20 always crits
```

A warrior with ATK = 8 has bonus = 4. Against a goblin with DEF = 2 (AC = 12),
they hit on a roll of 8 or higher — a 65% hit rate. A mage with ATK = 2
(bonus = 1) hits on 11 or higher — a 50% rate. The formula scales naturally
with stats.

**Project Application (The "Why" here):**
`rollToHit(hero.atk, enemy.def, rawRoll)` encapsulates this logic and writes
the raw d20 value into `rawRoll`. The caller then checks `rawRoll == CRITICAL_HIT_ROLL`
to trigger double damage. Separating "did it hit?" from "was it a crit?" keeps
the battle loop readable.

**Why it matters here:** Familiar D&D math makes the game feel authentic.
The d20 roll keeps each attack exciting — a 1% chance of critical miss
or critical hit provides constant tension.

---

### Math: Probability — Hit Chance

**What it computes:** Whether an attack hits based on a percentage chance
derived from attacker stats vs. defender armor class.

**The real-world analogy:** Rolling a d20 in D&D — you need to roll above
the enemy's armor class. Higher roll = hit; lower = miss.

**Canonical example:**
```cpp
// 70% hit chance using rand():
bool hit = (rand() % 100) < 70;
// rand() % 100 gives [0, 99]
// Values 0–69 (70 of them) → true  (hit)
// Values 70–99 (30 of them) → false (miss)
```

**Why it matters here:** `rollToHit` uses `roll(D20) + attackBonus >= targetAC`
rather than a flat percentage, but the underlying probability principle is
identical. A character with ATK = 8 (bonus = 4) vs. DEF = 2 (AC = 12) hits on
d20 >= 8 — that is 13 values out of 20, or 65%. Dexterity (DEF) raises the
enemy's AC, making hits less likely.

**Watch for:** `rand() % 100 < X` gives X% chance. `rand() % 100 <= X` gives
X+1% chance. Off-by-one errors make attacks slightly more or less accurate than
intended. In `rollToHit`, the equivalent trap is using `>` instead of `>=` — an
off-by-one that makes every attack one point harder to land.

---

## Concept: The Defend Action — State Between Turns

**What it is:** The "defend" action gives the player +5 AC until their
next turn. This requires a flag that persists across one enemy turn.

**The problem before:**
```cpp
// Actions take effect immediately and vanish — no "persistent until next turn" state
```

**The solution:**
```cpp
bool heroIsDefending = false;  // set to true when [D] chosen, reset after enemy turn

// If defending: add 5 to AC for the incoming attack
int effectiveAC = heroAC + (heroIsDefending ? 5 : 0);
// After the enemy's attack resolves:
heroIsDefending = false;  // defending bonus expires
```

**What it hides:** The flag must be cleared at the RIGHT moment. Clearing it
before the enemy attacks would negate the bonus entirely. Clearing it after
the hero's NEXT action would double-stack it. Invariant: `heroIsDefending`
is `true` for exactly one enemy attack — the one immediately following the
hero's Defend action.

**Canonical example (General Explanation):**
Think of a shield block in a fighting game — you raise your guard for one
incoming hit, then lower it automatically. The `bool` flag is the raised
guard; setting it back to `false` after the enemy's attack is the automatic
lowering.

```cpp
bool shieldUp = false;

// Player's turn:
if (playerAction == 'D') shieldUp = true;  // ← add this

// Enemy's turn:
int ac = BASE_AC + hero.def + (shieldUp ? 5 : 0);
bool enemyHit = (roll(D20) + enemy.atk/2) >= ac;
shieldUp = false;  // ← was: nothing — bonus expired after this attack
```

**Project Application (The "Why" here):**
`BattleState::heroIsDefending` is set to `true` when the player picks `[D]`.
Before the enemy attacks, `heroAC` adds 5 if the flag is set. After the enemy
attack resolves, the flag resets to `false`. If the player defends again next
round, the flag is set again — the bonus never stacks beyond +5.

**Why it matters here:** Turn-based RPGs always have actions that last
"until the start of your next turn." State flags are the simplest way to
implement this. More complex states (poisoned, stunned) are handled in the
same way with more flags.

---

### Math: Damage Calculation

**What it computes:** The net damage dealt after attack dice and the strength
modifier are combined.

**The real-world analogy:** A knife fight — you swing with ATK = 8 but the
opponent's armor absorbs DEF = 3, so only 5 damage gets through.

**Formula:** `damage = max(1, damageDice + strMod)`

In our system the DEF stat raises the enemy's armor class (making attacks
miss more often) rather than reducing damage directly. Once a hit is confirmed,
the damage is `damageDice + strMod`, clamped to a minimum of 1.

```cpp
int strMod      = (hero.str - 10) / 2;  // standard D&D modifier
int damageDice  = roll(D8);             // weapon die (Warrior: 1d8)
int totalDamage = damageDice + strMod;
if (totalDamage < 1) totalDamage = 1;   // ← minimum 1 damage always
```

**Watch for:** Always clamp to minimum 1 — without it, a hero with very low
STR (e.g., STR = 6, mod = -2) could deal 0 or negative damage on a low roll,
which would heal the enemy. `(totalDamage < 1) ? 1 : totalDamage` is the
safest clamp.

---

## Step 1 — The Battle State

Add this struct and constants:

```cpp
// ── Battle constants ──────────────────────────────────────────
const int FLEE_SUCCESS_CHANCE = 40;  // % chance of successful flee (0-100)
const int BASE_AC             = 10;  // D&D base armor class (added to DEF)
const int CRITICAL_HIT_ROLL   = 20;  // d20 roll that triggers a critical hit

// ── Battle result enum ────────────────────────────────────────
enum class BattleResult {
    HeroWon,    // enemy defeated
    HeroLost,   // hero died
    HeroFled    // successfully fled
};

// ── Battle state — tracks everything that changes during combat ─
struct BattleState {
    bool heroIsDefending;  // hero chose Defend last turn
    int  round;            // current round number
    bool heroActedFirst;   // hero always goes first in this implementation
};
```

---

## Step 2 — Attack Functions

Add these combat resolution functions:

```cpp
// ── Roll a hit: returns true if the attack hits, false if miss ──
// rawD20Out receives the raw d20 value (for detecting crits)
bool rollToHit(int attackStat, int targetDEF, int& rawD20Out) {
    rawD20Out   = roll(D20);
    int bonus   = attackStat / 2;       // derived attack bonus
    int total   = rawD20Out + bonus;
    int targetAC = targetDEF + BASE_AC; // target's armor class

    return total >= targetAC;
}

// ── Roll weapon damage for the hero based on class ────────────
int heroWeaponDamage(const Character& hero, bool isCritical) {
    int damageDice;
    int strMod = (hero.str - 10) / 2;

    // Weapon damage die is based on class
    switch (hero.characterClass) {
        case CharacterClass::Warrior:
        case CharacterClass::Paladin:
            damageDice = roll(D8);  break;   // 1d8
        case CharacterClass::Rogue:
            damageDice = roll(D6);  break;   // 1d6
        case CharacterClass::Ranger:
            damageDice = roll(D6);  break;   // 1d6 bow
        case CharacterClass::Mage:
        case CharacterClass::Cleric:
            damageDice = roll(D6);  break;   // 1d6 staff/mace
        default:
            damageDice = roll(D4);  break;   // 1d4 unarmed
    }

    // Critical hit doubles the dice (not the modifier)
    if (isCritical) damageDice *= 2;

    int totalDamage = damageDice + strMod;
    return (totalDamage < 1) ? 1 : totalDamage;  // minimum 1 damage
}

// ── Roll enemy damage ─────────────────────────────────────────
int enemyDamage(const Enemy& enemy) {
    // Enemy deals 1d6 + (atk/4) damage on a hit
    int damage = roll(D6) + (enemy.atk / 4);
    return (damage < 1) ? 1 : damage;
}
```

---

## Step 3 — Draw the Battle HUD

Add:

```cpp
void drawBattleHUD(const Character& hero, const Enemy& enemy,
                   int round, const std::string& lastMessage) {
    clearScreen();

    // Header
    std::cout << "  " << COLOR_RED << "[Round " << round << "]" << COLOR_RESET << std::endl;
    std::cout << "  ─────────────────────────────────────────────────" << std::endl;

    // HP bars
    std::cout << "  Your HP   ";
    printHPBar(hero.hp, hero.maxHP);

    std::cout << "  " << COLOR_MAGENTA << enemy.name << COLOR_RESET << " HP ";
    float ePct = static_cast<float>(enemy.hp) / static_cast<float>(enemy.maxHP);
    std::string eColor = ePct > 0.5f ? COLOR_GREEN : ePct > 0.25f ? COLOR_YELLOW : COLOR_RED;
    printColoredBar(enemy.hp, enemy.maxHP, 16, eColor);
    std::cout << std::endl;

    std::cout << std::endl;

    // Last message
    if (!lastMessage.empty()) {
        std::cout << "  " << lastMessage << std::endl;
        std::cout << std::endl;
    }
}

void drawBattleMenu(bool heroIsDefending) {
    std::cout << "  Choose your action:" << std::endl;
    std::cout << "  [A]ttack  [D]efend  [I]tem  [F]lee" << std::endl;
    if (heroIsDefending) {
        std::cout << "  (Defending: +5 AC this turn)" << std::endl;
    }
    std::cout << "  > ";
}
```

---

## Step 4 — The Full Battle Loop

Add the main battle function:

```cpp
// ── The battle function — returns who won ────────────────────
BattleResult runBattle(Character& hero, Enemy& enemy) {
    BattleState state;
    state.heroIsDefending = false;
    state.round           = 1;

    std::string lastMessage = "";

    while (hero.hp > 0 && enemy.hp > 0) {
        // ── Draw the HUD ──────────────────────────────────────
        drawBattleHUD(hero, enemy, state.round, lastMessage);
        drawBattleMenu(state.heroIsDefending);

        // ── Hero's turn ───────────────────────────────────────
        char action;
        std::cin >> action;
        std::cout << std::endl;

        state.heroIsDefending = false;  // reset defending at start of hero turn
        lastMessage = "";

        if (action == 'a' || action == 'A') {
            // ── Attack ─────────────────────────────────────────
            int rawRoll;
            bool hit = rollToHit(hero.atk, enemy.def, rawRoll);
            bool crit = (rawRoll == CRITICAL_HIT_ROLL);

            if (crit) {
                int damage = heroWeaponDamage(hero, true);
                enemy.hp  -= damage;
                lastMessage = COLOR_YELLOW + "CRITICAL HIT! " + COLOR_RESET +
                              "You deal " + std::to_string(damage) + " damage!";
            } else if (hit) {
                int damage = heroWeaponDamage(hero, false);
                enemy.hp  -= damage;
                lastMessage = "You hit " + enemy.name + " for " +
                              std::to_string(damage) + " damage!";
            } else {
                lastMessage = "Your attack misses! (rolled " + std::to_string(rawRoll) + ")";
            }

            if (enemy.hp < 0) enemy.hp = 0;

        } else if (action == 'd' || action == 'D') {
            // ── Defend ─────────────────────────────────────────
            state.heroIsDefending = true;
            lastMessage = "You raise your guard. (+5 AC until your next turn)";

        } else if (action == 'i' || action == 'I') {
            // ── Use Item ───────────────────────────────────────
            displayInventory(hero);
            std::cout << "  Use item #: ";
            int slot;
            std::cin >> slot;
            useItem(hero, slot);
            // Item use does NOT end the turn — enemy still attacks
            lastMessage = "Item used!";

        } else if (action == 'f' || action == 'F') {
            // ── Flee ───────────────────────────────────────────
            int fleeRoll = rand() % 100;
            if (fleeRoll < FLEE_SUCCESS_CHANCE) {
                drawBattleHUD(hero, enemy, state.round, "You escape successfully!");
                std::this_thread::sleep_for(std::chrono::milliseconds(1500));
                return BattleResult::HeroFled;
            } else {
                lastMessage = "You try to flee but the enemy blocks your escape!";
            }

        } else {
            lastMessage = "Unknown command. (A)ttack, (D)efend, (I)tem, (F)lee";
        }

        // ── Check if enemy died ───────────────────────────────
        if (enemy.hp <= 0) break;

        // ── Enemy's turn ──────────────────────────────────────
        {
            int rawRoll;
            int heroAC   = hero.def + BASE_AC + (state.heroIsDefending ? 5 : 0);
            // Use heroAC in a simplified hit check:
            bool enemyHit = (roll(D20) + enemy.atk / 2) >= heroAC;

            if (enemyHit) {
                int damage = enemyDamage(enemy);
                hero.hp   -= damage;
                if (hero.hp < 0) hero.hp = 0;
                lastMessage += "\n  " + enemy.name + " attacks you for " +
                               std::to_string(damage) + " damage!";
            } else {
                lastMessage += "\n  " + enemy.name + "'s attack misses you!";
            }

            state.heroIsDefending = false;  // defend bonus expires after enemy's attack
        }

        state.round++;
    }

    // ── Battle ended — determine result ───────────────────────
    if (hero.hp <= 0) {
        hero.alive = false;
        drawBattleHUD(hero, enemy, state.round, COLOR_RED + "You have fallen!" + COLOR_RESET);
        std::this_thread::sleep_for(std::chrono::milliseconds(2000));
        return BattleResult::HeroLost;
    }

    // Hero won
    drawBattleHUD(hero, enemy, state.round,
                  COLOR_GREEN + "Victory! " + COLOR_RESET + enemy.name + " is defeated!");
    std::this_thread::sleep_for(std::chrono::milliseconds(1500));
    return BattleResult::HeroWon;
}

// ── Award post-battle rewards ─────────────────────────────────
void awardVictoryRewards(Character& hero, const Enemy& enemy) {
    hero.xp   += enemy.xpReward;
    hero.gold += enemy.goldReward;

    clearScreen();
    std::cout << std::endl;
    std::cout << "  ──── " << COLOR_YELLOW << "VICTORY!" << COLOR_RESET << " ────" << std::endl;
    std::cout << "  XP gained:   " << COLOR_CYAN << "+" << enemy.xpReward << COLOR_RESET << std::endl;
    std::cout << "  Gold gained: " << COLOR_YELLOW << "+" << enemy.goldReward << COLOR_RESET << std::endl;
    std::cout << "  Total XP: " << hero.xp << "/" << hero.xpToNext << std::endl;
    std::cout << std::endl;

    // Level up check
    if (hero.xp >= hero.xpToNext) {
        hero.level++;
        hero.xp      -= hero.xpToNext;
        hero.xpToNext = hero.level * 100;  // each level requires 100 more XP

        // Stat increases on level up
        hero.maxHP  += 3 + (hero.con - 10) / 2;
        hero.maxMP  += 2 + (hero.intel - 10) / 2;
        hero.hp      = hero.maxHP;
        hero.mp      = hero.maxMP;
        hero.atk    += 1;
        hero.def    += 1;

        std::cout << COLOR_YELLOW << "  *** LEVEL UP! ***" << COLOR_RESET << std::endl;
        std::cout << "  You are now level " << hero.level << "!" << std::endl;
        std::cout << "  HP, MP, ATK, and DEF increased." << std::endl;
    }

    std::cout << std::endl;
    std::cout << "  Press ENTER to continue...";
    std::cin.ignore();
    std::cin.get();
}
```

---

### Logic: Battle End Conditions

**What it decides:** When to exit the battle loop.

**Truth table:**
```
hero.hp <= 0    → player death  (lose)   → return BattleResult::HeroLost
enemy.hp <= 0   → enemy death   (win)    → return BattleResult::HeroWon
playerFled      → battle escaped         → return BattleResult::HeroFled
None of above   → continue battle        → loop again
```

**The code:** `while (hero.hp > 0 && enemy.hp > 0) { ... }`

The flee condition is an early `return` inside the loop rather than a loop
variable because it must resolve mid-turn (before the enemy gets to act).
Enemy death is detected with `if (enemy.hp <= 0) break;` after the hero's
attack — this prevents the enemy from attacking after dying. Hero death is
detected after the enemy's attack at the bottom of the loop body. The
`while` condition catches the case where neither breaks prematurely.

---

## Step 5 — Replace the Placeholder Battle Trigger

In the enemy encounter in `main()`, replace the placeholder with:

```cpp
if (fightChosen) {
    BattleResult result = runBattle(hero, goblin);

    if (result == BattleResult::HeroWon) {
        awardVictoryRewards(hero, goblin);
        currentRoom.grid[hero.position.row][hero.position.col] = TILE_FLOOR; // ← was: placeholder
        currentRoom.hasEnemy  = false;  // ← add this
        currentRoom.isCleared = true;   // ← add this
    } else if (result == BattleResult::HeroLost) {
        isRunning = false;  // game over — exit the outer loop  // ← add this
    }
    // HeroFled: enemy still in room, player backed away
}
```

After the outer while loop, add a death screen:
```cpp
if (!hero.alive) {
    clearScreen();
    std::cout << COLOR_RED << std::endl;
    std::cout << "  ╔═══════════════════════════════╗" << std::endl;
    std::cout << "  ║        GAME OVER              ║" << std::endl;
    std::cout << "  ║  " << hero.name << " has fallen.       ║" << std::endl;
    std::cout << "  ║  Level: " << hero.level << "   XP: " << hero.xp << "         ║" << std::endl;
    std::cout << "  ╚═══════════════════════════════╝" << std::endl;
    std::cout << COLOR_RESET << std::endl;
}
```

### SAVE AND TRY

Compile and run. Navigate to the enemy. Type `y` to fight.

**You should see:** The battle HUD with both HP bars, the action menu.
Attack until one of you dies. Watch HP bars decrease in real time.

**Test all actions:**
- `a` — attack (try to get a critical hit — 5% chance)
- `d` — defend, then watch enemy's next attack miss more often
- `f` — flee (40% success)
- `i` — use a health potion mid-battle

**Change something:** Change `FLEE_SUCCESS_CHANCE` to `90`. Fleeing almost
always works. Change `CRITICAL_HIT_ROLL` to `19` — crits on 19 or 20 (the
`rawRoll == 19 || rawRoll == 20` check). Change both back.

---

## Challenge: Spell Casting — Mage Battle Action

**You know:** The battle loop, `hero.mp`, `hero.intel`, damage rolls.

**Task:** Add a `[S]pell` action for Mage and Cleric characters:
- Mage: costs 5 MP, deals `2d6 + INT modifier` fire damage (no hit roll — spells always hit)
- Cleric: costs 4 MP, heals `1d8 + WIS modifier` HP

Other classes: print `"You don't know any spells."`

---

<details>
<summary>▶ Show Solution</summary>

In the battle loop, add after the `[D]efend` case:
```cpp
} else if (action == 's' || action == 'S') {
    switch (hero.characterClass) {
        case CharacterClass::Mage: {
            const int SPELL_COST = 5;
            if (hero.mp < SPELL_COST) {
                lastMessage = "Not enough MP! (Need " + std::to_string(SPELL_COST) + ")";
            } else {
                hero.mp -= SPELL_COST;
                int intMod  = (hero.intel - 10) / 2;
                int damage  = rollNd(2, D6) + intMod;
                enemy.hp   -= damage;
                if (enemy.hp < 0) enemy.hp = 0;
                lastMessage = COLOR_RED + "Fireball! " + COLOR_RESET +
                              "You deal " + std::to_string(damage) + " fire damage!";
            }
            break;
        }
        case CharacterClass::Cleric: {
            const int HEAL_COST = 4;
            if (hero.mp < HEAL_COST) {
                lastMessage = "Not enough MP!";
            } else {
                hero.mp  -= HEAL_COST;
                int wisMod = (hero.wis - 10) / 2;
                int healed = roll(D8) + wisMod;
                hero.hp   += healed;
                if (hero.hp > hero.maxHP) hero.hp = hero.maxHP;
                lastMessage = COLOR_GREEN + "Healing Word! " + COLOR_RESET +
                              "You recover " + std::to_string(healed) + " HP.";
            }
            break;
        }
        default:
            lastMessage = "You don't know any spells.";
    }
```

**Key insight:** Spells "always hit" because they target the enemy directly
(no AC check). The cost is MP — a resource that runs out, creating strategy:
should you save your powerful spells for harder fights? This is the fundamental
tension in any RPG resource system. The Cleric healing spell also demonstrates
that "spell" actions can affect the CASTER rather than the enemy.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Battle loop runs while both alive | Fight to the end — no premature exit |
| HP bars update each round | Watch both bars decrease |
| Attack can miss | Low ATK hero vs high DEF enemy — see miss messages |
| Critical hit triggers | Play enough rounds — see `CRITICAL HIT!` eventually |
| Defend reduces damage | Use defend — watch enemy's attack miss more |
| Flee works 40% of the time | Flee 10 times — succeeds roughly 4 times |
| Item use works in battle | Use potion — see HP increase |
| XP and gold awarded on win | Win a battle — see rewards screen |
| Level up triggers at 100 XP | Get 4 easy kills (25 XP each) — see level up |
| Death ends the game | Let HP reach 0 — see GAME OVER screen |

---

## Quick Check Answers

**1. What is a "hit roll" in D&D? What two values does it compare?**
The hit roll is a d20 + attack bonus compared against the target's Armor Class
(AC). If `d20 + bonus >= AC`, the attack hits; otherwise it misses. The d20
provides randomness (range 1–20), the bonus represents skill/strength, and the
AC represents how hard the target is to hit (armor + skill + size). A natural
20 is always a critical hit regardless of whether it would normally hit.

**2. How does defending change the battle outcome?**
Defending adds a temporary AC bonus (+5 in our implementation) that makes
the player harder to hit for the NEXT incoming attack. Against a goblin with
ATK = 4 (bonus = 2), the enemy hits on `d20 + 2 >= 10+3 = 13`, so a roll
of 11+. With +5 defend, they need `d20 + 2 >= 18`, so a roll of 16+. That
reduces the enemy's hit chance from 50% to 25%. Defending is a high-value
action against strong enemies and less useful against weak ones.

**3. Player DEF = 3, enemy rolls d20 + enemy.atk — when does it hit?**
Player's AC = DEF + BASE_AC = 3 + 10 = 13. The attack hits when
`d20 + enemy.atk/2 >= 13`. With atk/2 = 2 (atk = 4): hit when d20 >= 11.
That is a 50% hit rate. With atk/2 = 5 (atk = 10): hit when d20 >= 8,
a 65% hit rate. The higher the enemy's ATK stat, the harder it is to defend.
