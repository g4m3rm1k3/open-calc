# C++ Terminal RPG — LAB 13 — The Animated Battle Window

**Prerequisites:** LAB 12. You have a working turn-based battle system.

**What this lab adds:**
- A full-width ASCII box drawn around the battle screen
- Enemy ASCII art displayed inside the battle window during combat
- Animated hit and hurt flashes — the enemy art changes frame when damaged
- A scrolling combat log showing the last 3 messages

**Time:** 65–80 minutes

---

## What You Will Build

The battle screen now looks like a proper popup window:

```
╔══════════════════════════════════════════════════════════════╗
║                    ⚔  ROUND 3  ⚔                           ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║       GOBLIN SCOUT                                           ║
║       ────────────                                           ║
║        (°‿°)                                                 ║
║        |⚔  |                                                 ║
║        / \                                                   ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  Goblin HP  ▓▓▓░░░░░░░░░░░░░░  3/8   WOUNDED!               ║
║  Your HP    ▓▓▓▓▓▓▓▓▓▓▓▓░░░░  7/11                         ║
╠══════════════════════════════════════════════════════════════╣
║  > You dealt 6 damage!                                       ║
║  > Goblin attacks for 3 damage.                              ║
║  > You are WOUNDED.                                          ║
╠══════════════════════════════════════════════════════════════╣
║  [A]ttack  [D]efend  [S]pell  [I]tem  [F]lee                ║
╚══════════════════════════════════════════════════════════════╝
```

After a hit, the enemy briefly flashes to the hurt frame, then returns to idle.

---

> **Quick Check — try to answer before reading:**
> 1. What is a "scroll buffer" and why does a combat log need one?
> 2. What is `std::deque` and how is it different from `std::vector`?
> 3. Prediction: if you draw the box border as `╔═══╗/║ ║/╚═══╝` using
>    Unicode characters, will this work in all terminals?
> *(Answers at the end of this lab)*

---

## Concept: `std::deque` — Double-Ended Queue for the Combat Log

**What it is:** A container like `vector` but efficient at both ends. Adding
to the front is O(1). Perfect for a fixed-size sliding log.

**The problem before:**
```cpp
// Vector push_front is O(n) — every element shifts:
std::vector<std::string> log;
log.insert(log.begin(), newMessage);  // slow — shifts all existing elements
```

**The solution:**
```cpp
#include <deque>
std::deque<std::string> combatLog;

// Add to front:
combatLog.push_front(newMessage);

// Keep only the last 3 messages:
if (combatLog.size() > 3) {
    combatLog.pop_back();  // remove the oldest message
}
```

**What it hides:** Hides the O(n) shifting cost of `vector::insert` at the front. Without `deque`, every new combat message would cause all existing messages to shift one slot — a detail that doesn't matter for 3 entries, but is invisible and wrong in principle. `deque` makes the correct operation (cheap front-insert) the default.

**Canonical example (General Explanation):**
A news ticker — the newest headline always appears on the left, and old headlines fall off the right edge. Each new message is `push_front`, each eviction is `pop_back`.

```cpp
std::deque<std::string> ticker;
ticker.push_front("Breaking: Dragon spotted near village");
ticker.push_front("Update: Hero defeats orc");
ticker.push_front("Latest: Shop restocked potions");
if (ticker.size() > 3) ticker.pop_back();
// Only the 3 most recent headlines remain
```

Why obvious: the fixed-width scrolling ticker is exactly what the combat log does — new events push old ones off the end.

**Project Application (The "Why" here):**
The combat log in `drawBattleWindow` shows the last 3 messages inside the box. Every time `logMessage` is called during a round, it `push_front`s the new event and `pop_back`s if over 3 entries. `deque` is the right container because the log grows from the front (newest at top) and discards from the back (oldest falls off).

**Smallest possible example:**
```cpp
std::deque<std::string> log;
log.push_front("Third thing happened");
log.push_front("Second thing happened");
log.push_front("First thing happened");
// print: newest first
for (const std::string& msg : log) {
    std::cout << "> " << msg << std::endl;
}
```

**Why it matters here:** The combat log always shows the 3 most recent
events. Each new event is added to the front; the oldest falls off the back.
`deque` handles this efficiently.

---

## Concept: Drawing ASCII Boxes

**What it is:** A function that draws a bordered box around arbitrary content.
Requires knowing the box WIDTH in advance.

**The box characters:**
```
╔═══╗  ← top border     ╔ top-left, ═ horizontal, ╗ top-right
║   ║  ← side borders   ║ vertical
╠═══╣  ← divider        ╠ left-divider, ═ horizontal, ╣ right-divider
╚═══╝  ← bottom border  ╚ bottom-left, ═ horizontal, ╝ bottom-right
```

**What it hides:** Hides the per-character arithmetic of making every row the same width. Without `printBoxRow`, every line of the battle window would need manual space-padding to ensure the right `║` lands in the same column. The helper encapsulates "pad or truncate to exactly `BATTLE_BOX_WIDTH` characters" so callers never count spaces.

**Canonical example (General Explanation):**
A spreadsheet table — every cell in a column has the same width regardless of content. Short content gets padded; content that overflows gets cut. `printBoxRow` is the "cell formatter" for a single-column table.

```cpp
// Conceptual: a fixed-width cell
std::string cell(const std::string& content, int width) {
    std::string result = content;
    if ((int)result.size() < width) result += std::string(width - result.size(), ' ');
    if ((int)result.size() > width) result = result.substr(0, width);
    return result;
}
std::cout << "║" << cell("HP: 7", 20) << "║\n";
// ║HP: 7               ║  ← always exactly 20 chars inside
```

Why obvious: the right border always lands in the same column — identical to a table column boundary.

**Project Application (The "Why" here):**
`printBoxRow` is called for every line inside the battle window — the title, enemy name, HP bars, combat log lines, and action menu. Because it pads all content to exactly `BATTLE_BOX_WIDTH` characters, the right `║` border is always aligned no matter how short or long the content string is.

**Smallest possible example:**
```cpp
const int BOX_WIDTH = 40;  // total characters inside the box (between || ║)

void printBoxTop() {
    std::cout << "  ╔";
    for (int i = 0; i < BOX_WIDTH; i++) std::cout << "═";
    std::cout << "╗" << std::endl;
}

void printBoxBottom() {
    std::cout << "  ╚";
    for (int i = 0; i < BOX_WIDTH; i++) std::cout << "═";
    std::cout << "╝" << std::endl;
}

void printBoxRow(const std::string& content) {
    // content must be exactly BOX_WIDTH characters wide (pad with spaces)
    std::cout << "  ║" << content << "║" << std::endl;
}
```

**Why it matters here:** The battle window is a box that we draw completely
from scratch on each frame. The ANSI `clearScreen()` ensures each frame is
a fresh draw, not an accumulation.

---

## Concept: HP Bar Visualization

**What it is:** A visual representation of HP as a row of filled (`▓`) and empty (`░`) characters proportional to current HP vs. max HP.

**The problem before:**
The HP was displayed as raw numbers: `HP: 7/11`. This is correct but gives no instant visual read — you have to do mental math to judge how hurt the enemy is.

**The solution:**
Compute what fraction of HP remains, then draw that fraction as filled blocks out of a fixed total bar width.

### Math: Normalized Value (Ratio)

**What it computes:** Converts a value to a 0.0–1.0 proportion of its maximum.

**The real-world analogy:** A phone battery indicator — 7 out of 10 bars is 70%, which is 0.7 as a ratio.

**Formula:** `ratio = currentHP / maxHP` (as floating point)
**Bar width:** `filledBars = (int)(ratio * TOTAL_BAR_WIDTH)`

**Watch for:** Integer division truncates — `7 / 10 = 0` not 0.7. Cast to float first: `(float)hp / maxHP` or `hp * 1.0f / maxHP`.

**What it hides:** Hides the two-step "normalize then scale" arithmetic. The bar loop only needs `filled` (an integer count) — the ratio computation and truncation are handled once before the loop, keeping the drawing code simple.

**Canonical example (General Explanation):**
A loading bar in an installer — "47 of 200 files copied" shows as roughly a quarter of the bar filled. The ratio is `47.0f / 200` = 0.235, so `filledBars = (int)(0.235 * 20)` = 4 out of 20 blocks.

```cpp
int current = 47, maximum = 200, barWidth = 20;
float ratio = (float)current / maximum;       // 0.235
int filled  = (int)(ratio * barWidth);        // 4
for (int i = 0; i < filled; i++)      std::cout << "█";
for (int i = filled; i < barWidth; i++) std::cout << "░";
// Output: ████░░░░░░░░░░░░░░░░
```

Why obvious: the filled portion is visually proportional to how much of the total is complete — identical to any progress bar.

**Project Application (The "Why" here):**
Inside `drawBattleWindow`, both the enemy HP bar and the hero HP bar use this ratio. `ePct = (float)enemy.hp / enemy.maxHP` is computed first, then used both to pick the bar color (green/yellow/red thresholds) and to determine `filled = (int)(ePct * 16)`. The same pattern repeats for the hero bar.

*(This loop draws `filledBars` filled characters and `TOTAL_BAR_WIDTH - filledBars` empty characters — the filled portion represents current HP, the empty portion represents lost HP)*.

**Smallest possible example:**
```cpp
int hp = 7, maxHP = 11;
float ratio  = (float)hp / maxHP;    // 0.636...
int   filled = (int)(ratio * 16);    // 10
for (int b = 0; b < filled; b++)       std::cout << "▓";
for (int b = filled; b < 16; b++)      std::cout << "░";
std::cout << "  " << hp << "/" << maxHP << std::endl;
// ▓▓▓▓▓▓▓▓▓▓░░░░░░  7/11
```

**Why it matters here:** Gives the player an instant glance-read of combat state — are both combatants near full HP, or is one almost dead? The bar color (green → yellow → red) reinforces urgency without reading numbers.

---

## Step 1 — Box Drawing Utilities

Add to `display.h` (before `#endif`):

```cpp
// ── Box drawing constants ─────────────────────────────────────
const int BATTLE_BOX_WIDTH = 60;  // interior width of the battle window

// ── Print a horizontal border line ────────────────────────────
inline void printBoxBorder(char leftChar, char fillChar, char rightChar) {
    std::cout << "  ";
    std::cout << leftChar;
    for (int i = 0; i < BATTLE_BOX_WIDTH; i++) std::cout << fillChar;
    std::cout << rightChar << std::endl;
}

// ── Print a box content row, padded to BATTLE_BOX_WIDTH ───────
inline void printBoxRow(const std::string& content) {
    // Pad content to exactly BATTLE_BOX_WIDTH characters
    std::string padded = content;
    if (static_cast<int>(padded.size()) < BATTLE_BOX_WIDTH) {
        padded += std::string(BATTLE_BOX_WIDTH - padded.size(), ' ');
    }
    // Truncate if too long (safety)
    if (static_cast<int>(padded.size()) > BATTLE_BOX_WIDTH) {
        padded = padded.substr(0, BATTLE_BOX_WIDTH);
    }
    std::cout << "  ║" << padded << "║" << std::endl;
}

inline void printBoxTop()      { printBoxBorder('╔', '═', '╗'); }
inline void printBoxBottom()   { printBoxBorder('╚', '═', '╝'); }
inline void printBoxDivider()  { printBoxBorder('╠', '═', '╣'); }
inline void printBoxBlank()    { printBoxRow(""); }
```

### SAVE AND TRY

Test in `main()`:
```cpp
printBoxTop();
printBoxRow("  Hello, dungeon!");
printBoxRow("  Second line");
printBoxDivider();
printBoxRow("  Below the divider");
printBoxBottom();
```

**You should see:** A proper box with a divider. Remove the test code.

---

## Step 2 — The Battle Window Draw Function

Add to `main.cpp`. This replaces `drawBattleHUD`:

```cpp
#include <deque>
#include <sstream>  // for string formatting

// ── Formats a number-string pair into a fixed-width box row ────
std::string boxLine(const std::string& label, const std::string& content) {
    return "  " + label + content;
}

// ── Draw the full animated battle window ─────────────────────
// art: the current animation frame to display
// combatLog: the last N messages (newest first)
void drawBattleWindow(const Character&           hero,
                      const Enemy&               enemy,
                      int                        round,
                      const std::string          art[ENEMY_ART_ROWS],
                      const std::deque<std::string>& combatLog) {
    clearScreen();

    // ── TOP BORDER ────────────────────────────────────────────
    printBoxTop();

    // ── TITLE ─────────────────────────────────────────────────
    std::string title = "  " + COLOR_RED + "⚔  ROUND " + std::to_string(round) + "  ⚔" + COLOR_RESET;
    printBoxRow(title);
    printBoxDivider();

    // ── ENEMY ART SECTION ─────────────────────────────────────
    printBoxBlank();
    printBoxRow("  " + COLOR_MAGENTA + enemy.name + COLOR_RESET);
    std::string underline(enemy.name.size(), '-');
    printBoxRow("  " + underline);
    printBoxBlank();

    for (int row = 0; row < ENEMY_ART_ROWS; row++) {
        printBoxRow("     " + art[row]);
    }

    printBoxBlank();
    printBoxDivider();

    // ── HP BARS ───────────────────────────────────────────────
    {
        // Enemy HP
        float ePct = (enemy.maxHP > 0) ?
            static_cast<float>(enemy.hp) / static_cast<float>(enemy.maxHP) : 0.0f;
        std::string eColor = ePct > 0.5f ? COLOR_GREEN : ePct > 0.25f ? COLOR_YELLOW : COLOR_RED;

        std::ostringstream enemyBar;
        enemyBar << "  " << enemy.name << " HP  "
                 << eColor;
        // We can't easily call printColoredBar into a string, so we inline it:
        int filled = (int)(ePct * 16);
        for (int b = 0; b < filled; b++) enemyBar << "▓";
        for (int b = filled; b < 16; b++) enemyBar << "░";
        enemyBar << COLOR_RESET << "  " << enemy.hp << "/" << enemy.maxHP;
        if (ePct <= 0.25f) enemyBar << COLOR_RED << "  CRITICAL!" << COLOR_RESET;
        printBoxRow(enemyBar.str());
    }
    {
        // Hero HP
        float hPct = (hero.maxHP > 0) ?
            static_cast<float>(hero.hp) / static_cast<float>(hero.maxHP) : 0.0f;
        std::string hColor = hPct > 0.5f ? COLOR_GREEN : hPct > 0.25f ? COLOR_YELLOW : COLOR_RED;

        std::ostringstream heroBar;
        heroBar << "  Your HP     "
                << hColor;
        int filled = (int)(hPct * 16);
        for (int b = 0; b < filled; b++) heroBar << "▓";
        for (int b = filled; b < 16; b++) heroBar << "░";
        heroBar << COLOR_RESET << "  " << hero.hp << "/" << hero.maxHP;
        printBoxRow(heroBar.str());
    }

    printBoxDivider();

    // ── COMBAT LOG ────────────────────────────────────────────
    const int LOG_LINES = 3;
    int shown = 0;
    for (const std::string& msg : combatLog) {
        if (shown >= LOG_LINES) break;
        printBoxRow("  > " + msg);
        shown++;
    }
    // Fill remaining log lines with blanks
    for (int blank = shown; blank < LOG_LINES; blank++) {
        printBoxBlank();
    }

    printBoxDivider();

    // ── ACTION MENU ───────────────────────────────────────────
    printBoxRow("  [A]ttack  [D]efend  [S]pell  [I]tem  [F]lee");
    printBoxBottom();
    std::cout << "  > ";
}
```

---

## Step 3 — Animated Hit Flash

Add this helper:

```cpp
// ── Flash the hurt frame briefly on a hit ────────────────────
void flashHurtAnimation(const Character&           hero,
                        const Enemy&               enemy,
                        int                        round,
                        const std::string          hurtArt[ENEMY_ART_ROWS],
                        const std::deque<std::string>& combatLog) {
    // Show hurt frame
    drawBattleWindow(hero, enemy, round, hurtArt, combatLog);
    std::this_thread::sleep_for(std::chrono::milliseconds(300));
    // Return to idle frame — caller handles this with the next drawBattleWindow call
}
```

---

## Step 4 — Rewrite Battle Loop to Use the Window

Update `runBattle` to use the new window and combat log:

```cpp
BattleResult runBattle(Character& hero, Enemy& enemy) {
    BattleState           state;
    state.heroIsDefending = false;
    state.round           = 1;

    std::deque<std::string> combatLog;  // last 3 messages

    // Helper: add message to log
    auto logMessage = [&](const std::string& msg) {
        combatLog.push_front(msg);
        if (combatLog.size() > 3) combatLog.pop_back();
    };

    // Get the right art based on enemy name
    auto getArt = [&](int frame) -> const std::string* {
        if (enemy.name.find("Goblin")   != std::string::npos) return goblinArt[frame];
        if (enemy.name.find("Orc")      != std::string::npos) return orcArt[frame];
        if (enemy.name.find("Skeleton") != std::string::npos) return skeletonArt[frame];
        return goblinArt[frame];  // fallback
    };

    while (hero.hp > 0 && enemy.hp > 0) {
        // Draw idle frame
        drawBattleWindow(hero, enemy, state.round, getArt(0), combatLog);

        char action;
        std::cin >> action;
        state.heroIsDefending = false;

        if (action == 'a' || action == 'A') {
            int rawRoll;
            bool hit  = rollToHit(hero.atk, enemy.def, rawRoll);
            bool crit = (rawRoll == CRITICAL_HIT_ROLL);

            if (crit) {
                int dmg  = heroWeaponDamage(hero, true);
                enemy.hp -= dmg;
                if (enemy.hp < 0) enemy.hp = 0;
                logMessage(COLOR_YELLOW + "CRITICAL HIT! " + COLOR_RESET +
                           std::to_string(dmg) + " damage!");
                // Flash attack frame, then hurt
                drawBattleWindow(hero, enemy, state.round, getArt(1), combatLog);
                std::this_thread::sleep_for(std::chrono::milliseconds(200));
                drawBattleWindow(hero, enemy, state.round, getArt(2), combatLog);
                std::this_thread::sleep_for(std::chrono::milliseconds(400));
            } else if (hit) {
                int dmg  = heroWeaponDamage(hero, false);
                enemy.hp -= dmg;
                if (enemy.hp < 0) enemy.hp = 0;
                logMessage("Hit! " + enemy.name + " takes " + std::to_string(dmg) + " damage.");
                drawBattleWindow(hero, enemy, state.round, getArt(1), combatLog);
                std::this_thread::sleep_for(std::chrono::milliseconds(150));
                drawBattleWindow(hero, enemy, state.round, getArt(2), combatLog);
                std::this_thread::sleep_for(std::chrono::milliseconds(250));
            } else {
                logMessage("Miss! (rolled " + std::to_string(rawRoll) + ")");
            }

        } else if (action == 'd' || action == 'D') {
            state.heroIsDefending = true;
            logMessage("You raise your guard. (+5 AC)");

        } else if (action == 'f' || action == 'F') {
            int fleeRoll = rand() % 100;
            if (fleeRoll < FLEE_SUCCESS_CHANCE) {
                logMessage("You escape successfully!");
                drawBattleWindow(hero, enemy, state.round, getArt(0), combatLog);
                std::this_thread::sleep_for(std::chrono::milliseconds(1000));
                return BattleResult::HeroFled;
            } else {
                logMessage("You try to flee but fail!");
            }

        } else if (action == 'i' || action == 'I') {
            displayInventory(hero);
            std::cout << "  Use item #: ";
            int slot; std::cin >> slot;
            useItem(hero, slot);
            logMessage("Used an item.");
        }

        if (enemy.hp <= 0) break;

        // ── Enemy turn ────────────────────────────────────────
        {
            int heroAC = hero.def + BASE_AC + (state.heroIsDefending ? 5 : 0);
            bool hit   = (roll(D20) + enemy.atk / 2) >= heroAC;

            if (hit) {
                int dmg  = enemyDamage(enemy);
                hero.hp -= dmg;
                if (hero.hp < 0) hero.hp = 0;
                logMessage(enemy.name + " hits you for " + std::to_string(dmg) + "!");
            } else {
                logMessage(enemy.name + "'s attack misses!");
            }

            state.heroIsDefending = false;
        }

        state.round++;
    }

    if (hero.hp <= 0) {
        hero.alive = false;
        logMessage(COLOR_RED + "You have fallen!" + COLOR_RESET);
        drawBattleWindow(hero, enemy, state.round, getArt(2), combatLog);
        std::this_thread::sleep_for(std::chrono::milliseconds(2000));
        return BattleResult::HeroLost;
    }

    logMessage(COLOR_GREEN + "VICTORY!" + COLOR_RESET);
    drawBattleWindow(hero, enemy, state.round, getArt(0), combatLog);
    std::this_thread::sleep_for(std::chrono::milliseconds(1500));
    return BattleResult::HeroWon;
}
```

### SAVE AND TRY

Compile and run. Start a battle.

**You should see:** The full box battle window with enemy art, HP bars,
and combat log — all inside a `╔═══╗` border.

**Watch the animation:** Hit the goblin — the art briefly changes to the
attack frame, then the hurt frame, then returns to idle.

**Change something:** Change `ANIMATION_DELAY_MS` constants. Try 100ms for
a flashy fast battle, or 600ms for a slow dramatic one.

---

## Challenge: Flash the Hero Side

**You know:** `clearScreen()`, sleep, box drawing.

**Task:** When the HERO takes damage, briefly flash the hero's HP bar in
red with `"▶▶▶ YOU'VE BEEN HIT! ◀◀◀"` inside the box for 400ms before
returning to normal.

---

<details>
<summary>▶ Show Solution</summary>

After the enemy deals damage:
```cpp
if (hit) {
    int dmg  = enemyDamage(enemy);
    hero.hp -= dmg;
    if (hero.hp < 0) hero.hp = 0;
    logMessage(enemy.name + " hits you for " + std::to_string(dmg) + "!");

    // Flash hero damage
    combatLog.push_front(COLOR_RED + "▶▶ YOU'VE BEEN HIT! ◀◀" + COLOR_RESET);
    drawBattleWindow(hero, enemy, state.round, getArt(1), combatLog);
    std::this_thread::sleep_for(std::chrono::milliseconds(400));
    combatLog.pop_front();  // remove the flash message
}
```

**Key insight:** The `deque` combat log is perfect for temporary flash messages:
`push_front` adds the flash at the top of the log, the next `drawBattleWindow`
renders it, `sleep_for` holds it visible, and `pop_front` removes it before
the next normal message. The log is mutable state that drives the display —
a simple but effective pattern.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Battle window has full box border | Start a battle — see `╔═══╗` box |
| Enemy art displays inside the box | See goblin art in the window |
| Art changes to attack frame on hit | Hit enemy — see attack frame flash |
| Art changes to hurt frame after hit | Hit lands — see hurt frame briefly |
| HP bars show inside the box | See `▓▓▓░░░` bars in the window |
| Combat log shows last 3 messages | Take 4 actions — oldest disappears from log |
| Box width is consistent | All rows same width — no ragged right edges |
| Level up still works | Win 4 battles — see level up after 100 XP |

---

## Quick Check Answers

**1. What is a "scroll buffer" and why does a combat log need one?**
A scroll buffer is a fixed-size collection that automatically discards old
entries when new ones are added, maintaining a consistent "window" of the
most recent data. A combat log needs this because showing all messages since
battle start would overflow the box — especially in long battles. By keeping
only the last 3 messages, the log always shows the most relevant context
without growing uncontrollably.

**2. What is `std::deque` and how is it different from `std::vector`?**
`deque` (double-ended queue) is a sequence container that allows efficient
insertion and removal at BOTH ends: `push_front`, `pop_front`, `push_back`,
`pop_back` are all O(1). `vector` is efficient only at the back — `insert`
at the front is O(n) because every element shifts. For a sliding log where
you always add to the front and remove from the back, `deque` is the correct
choice. Tradeoff: `deque` is slightly less cache-friendly than `vector`
for random access.

**3. Will Unicode box-drawing characters work in all terminals?**
Not all terminals — but most modern ones do. Unicode box characters (╔, ═, ║,
╗, ╠, ╣, ╚, ╝) require the terminal to support UTF-8 encoding, which all
modern terminals (Windows Terminal, VS Code terminal, macOS Terminal, Linux
GNOME Terminal) do. Traditional Windows `cmd.exe` requires a specific code
page (`chcp 65001`). For maximum compatibility, use ASCII alternatives:
`+---+` with `|` sides — uglier but universally supported. This game targets
modern development environments where Unicode is safe.
