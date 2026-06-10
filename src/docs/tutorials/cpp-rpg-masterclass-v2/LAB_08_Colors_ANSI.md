# C++ Terminal RPG — LAB 08 — ANSI Colors & Terminal Art

**Prerequisites:** LAB 07. You have the `Character` struct, class selection,
and a working game loop.

**What this lab adds:**
- ANSI escape codes for colored terminal output
- Clearing the screen and redrawing — the foundation of animation
- A colored HP/MP bar
- A fully colorized game UI

**Time:** 60–75 minutes

---

## What You Will Build

The terminal now renders in color:

```
[In the terminal — rendered in color:]

╔══════════════════════════════════════════════╗
║          ☠  DUNGEON OF DOOM  ☠               ║  ← RED text
╚══════════════════════════════════════════════╝

  EREVAN — MAGE — LEVEL 1                       ← YELLOW name

  HP  ▓▓▓▓▓▓▓▓▓▓▓▓▓░░░  11/16                 ← GREEN bar → RED at low HP
  MP  ▓▓▓▓▓▓▓▓▓▓░░░░░░  10/16                 ← BLUE bar

  [S]tats  [L]ook  [H]eal  [D]ig  [Q]uit
  >
```

---

> **Quick Check — try to answer before reading:**
> 1. What is an ANSI escape code, and why does it start with `\033[`?
> 2. If you forget to reset colors after printing colored text, what happens?
> 3. Prediction: will ANSI escape codes work in Windows Command Prompt?
>    What about Windows Terminal or VS Code terminal?
> *(Answers at the end of this lab)*

---

## Concept: ANSI Escape Codes — Terminal Color and Control

**What it is:** Special sequences printed to the terminal that the terminal
interprets as commands rather than text. They control color, cursor position,
and screen clearing.

**The problem before:**
```cpp
std::cout << "HP: " << hero.hp << "/" << hero.maxHP << std::endl;
// Output: HP: 5/20 — plain white text, no visual urgency at low HP
```

**The solution:**
```cpp
// \033 is the ESC character (octal 33 = decimal 27)
// [ starts the escape sequence
// 1;31m means: bold (1) + red (31)
std::cout << "\033[1;31m" << "HP: " << hero.hp << "/" << hero.maxHP
          << "\033[0m" << std::endl;
// Output: HP: 5/20 — in bold red
// \033[0m resets ALL colors back to terminal default
```

*(The number after `[` is the ANSI code: 0=reset, 1=bold, 31=red, 32=green,
33=yellow, 34=blue, 35=magenta, 36=cyan, 37=white. Multiple codes are
separated by `;` — so `1;31` means bold AND red at the same time.)*

**What it hides:** Hides the terminal's internal color state machine. You do
not set each character's color individually — you send a "change to red"
signal and all subsequent characters are red until you send a reset signal.
The terminal tracks "current color" as internal state. You never see that
state directly; you only send transitions. Invariant: you MUST reset
(`"\033[0m"`) before printing non-colored text, or the color bleeds into
everything that follows — including text printed after your program exits.

**Canonical example (General Explanation):**

A stage lighting board — the lighting director presses a button to send a
signal to the lights telling them what color to display. The lights remember
that color until the director sends a new signal. ANSI codes work the same
way: `"\033[31m"` is the signal "switch to red," and the terminal holds that
color for every character printed until `"\033[0m"` says "switch back to
default."

```cpp
// Canonical: send a color signal, print, send a reset signal
std::cout << "\033[34m";          // signal: switch to blue
std::cout << "Loading...";        // terminal displays in blue
std::cout << "\033[0m";           // signal: reset to default
std::cout << " done." << std::endl; // back to normal color
// Output: "Loading..." in blue, " done." in default color
```

Why this example makes the mechanic obvious: the three-step pattern
(signal color → print → signal reset) is exactly what every colored output
looks like. The terminal does not reset on its own — you must send the reset.

**Project Application (The "Why" here):**

HP bars change color at low HP to communicate urgency — green at full health,
yellow below 50%, red below 25%. The dungeon title prints in red to feel
menacing. The player's name prints in yellow to stand out from room
descriptions. Enemy names print in magenta so they are visually distinct
from everything else. Color is game feel, not just decoration. All of this
uses the same signal-print-reset pattern.

**ANSI color code table:**

| Code | Meaning |
|------|---------|
| `\033[0m` | Reset (back to default) |
| `\033[1m` | Bold |
| `\033[30m`–`\033[37m` | Foreground: black, red, green, yellow, blue, magenta, cyan, white |
| `\033[90m`–`\033[97m` | Bright foreground (same colors, brighter) |
| `\033[40m`–`\033[47m` | Background colors |
| `\033[2J` | Clear entire screen |
| `\033[H` | Move cursor to top-left corner |
| `\033[2J\033[H` | Clear screen AND reset cursor (use together) |

**Smallest possible example:**
```cpp
std::cout << "\033[1;32m" << "This text is bold green." << "\033[0m" << std::endl;
std::cout << "\033[1;31m" << "This text is bold red."   << "\033[0m" << std::endl;
std::cout << "This text is back to normal." << std::endl;
```

**Why it matters here:** HP bars that change color at low HP communicate
urgency. The title in red feels menacing. Yellow for player name separates
it from the dungeon description. Color is game feel, not just decoration.

**Watch for:** Always reset with `\033[0m` after colored text. If you forget
to reset, every subsequent `cout` — including the terminal prompt — will be
in the last color you set. This affects the entire terminal session until
you close it or print a reset manually.

---

## Concept: Color Constants — Don't Hardcode Escape Sequences

**What it is:** Define the escape sequences as `const std::string` constants
so you never type `\033[1;31m` by hand.

**The problem before:**
```cpp
std::cout << "\033[1;31m" << text << "\033[0m";  // magic string, opaque
std::cout << "\033[1;33m" << text << "\033[0m";  // what is 1;33m?
```

**The solution:**
```cpp
const std::string COLOR_RESET   = "\033[0m";
const std::string COLOR_RED     = "\033[1;31m";
const std::string COLOR_GREEN   = "\033[1;32m";
const std::string COLOR_YELLOW  = "\033[1;33m";
const std::string COLOR_BLUE    = "\033[1;34m";
const std::string COLOR_MAGENTA = "\033[1;35m";
const std::string COLOR_CYAN    = "\033[1;36m";
const std::string COLOR_WHITE   = "\033[1;37m";

std::cout << COLOR_RED << "DANGER!" << COLOR_RESET << std::endl;
```

**Canonical example (General Explanation):**

Named paint swatches — instead of remembering that `"\033[31m"` means red,
you write `const std::string RED = "\033[31m"` and use `RED` everywhere.
This is exactly the same as CSS custom properties (`--color-primary: #e63946`)
or named constants in any other domain: the name carries meaning, the value
is an implementation detail.

```cpp
// Canonical: named constants so the raw escape sequences never appear in logic
const std::string BOLD  = "\033[1m";
const std::string RESET = "\033[0m";

std::cout << BOLD << "IMPORTANT" << RESET << std::endl;
// Easy to read: "print BOLD, then IMPORTANT, then RESET"
// Without constants: "\033[1m" << "IMPORTANT" << "\033[0m" — what is [1m?
```

Why this example makes the mechanic obvious: the name `BOLD` is self-documenting.
`"\033[1m"` is not. Named constants move the meaning from a comment into the
code itself.

**Project Application (The "Why" here):**

HP, mana, enemy names, and critical hit messages all need specific colors.
Using named constants means:
- `HP_LOW` (red), `HP_MED` (yellow), `HP_FULL` (green) — instantly readable
- `ENEMY_NAME` (bold red or magenta) — one name, one place to change
- Changing `ENEMY_NAME` from bold-red to bold-orange is a one-line edit in
  `display.h`, and it propagates to every enemy in the game automatically

**Why it matters here:** The entire game uses a consistent color palette.
Changing the HP bar color from green to cyan requires changing ONE constant.

---

## Step 1 — The Color Constants Header (New File)

Create a new file called `display.h` in the same folder as `main.cpp`:

```cpp
// display.h — ANSI terminal color constants and display utilities
// Include guard prevents double-inclusion in large projects
#ifndef DISPLAY_H
#define DISPLAY_H

#include <string>
#include <iostream>

// ── ANSI color constants ────────────────────────────────────────
// \033 = ESC character. [1;Xm = bold + color X. [0m = reset.
// (The number after [ is the ANSI code: 0=reset, 1=bold, 31=red,
//  32=green, 33=yellow, 34=blue, 35=magenta, 36=cyan, 37=white)
const std::string COLOR_RESET   = "\033[0m";
const std::string COLOR_RED     = "\033[1;31m";
const std::string COLOR_GREEN   = "\033[1;32m";
const std::string COLOR_YELLOW  = "\033[1;33m";
const std::string COLOR_BLUE    = "\033[1;34m";
const std::string COLOR_MAGENTA = "\033[1;35m";
const std::string COLOR_CYAN    = "\033[1;36m";
const std::string COLOR_WHITE   = "\033[1;37m";
const std::string COLOR_DARK    = "\033[0;90m";  // dark grey for decorations

// ── Screen control ─────────────────────────────────────────────
inline void clearScreen() {
    // \033[2J  clears the screen
    // \033[H   moves cursor to top-left (Home)
    std::cout << "\033[2J\033[H" << std::flush;
}

// ── Convenience wrappers ───────────────────────────────────────
// Returns a string wrapped in color codes — easy inline use
inline std::string colorize(const std::string& text, const std::string& color) {
    return color + text + COLOR_RESET;
}

#endif // DISPLAY_H
```

Add to the top of `main.cpp`:
```cpp
#include "display.h"
```

### SAVE AND TRY

Compile with both files:
```bash
g++ -std=c++17 -o dungeon main.cpp
```
(Header files are included via `#include`, not passed on the command line.)

**You should see:** Same output as before — no visible change. The constants
are now available but not yet used.

**In the terminal — test the colors work:**
Add temporarily to `main()`:
```cpp
std::cout << COLOR_RED    << "Red text"    << COLOR_RESET << std::endl;
std::cout << COLOR_GREEN  << "Green text"  << COLOR_RESET << std::endl;
std::cout << COLOR_YELLOW << "Yellow text" << COLOR_RESET << std::endl;
```

**You should see:** Three colored lines. Remove these test lines after verifying.

---

## Concept: Include Guards — `#ifndef / #define / #endif`

**What it is:** A preprocessor pattern that prevents a header file from being
included more than once in the same compilation unit.

**The problem before:**
```cpp
// If display.h is included twice (directly or via other headers):
#include "display.h"
#include "display.h"
// Error: 'COLOR_RED' redeclared — the same const defined twice
```

**The solution:**
```cpp
#ifndef DISPLAY_H    // if DISPLAY_H is NOT yet defined...
#define DISPLAY_H    // ...define it now (marks this header as "seen")

// ... header content ...

#endif               // end of the guarded section
```
The first time the file is included: `DISPLAY_H` is not yet defined, so the
content is processed and `DISPLAY_H` is defined. Every subsequent include:
`DISPLAY_H` is already defined, so the entire content is skipped.

**Canonical example (General Explanation):**

A wristband at a concert — the first time you enter you get stamped. If you
try to re-enter, the stamp is already there and the door person waves you
through without giving you another ticket. The include guard is the stamp:
the first `#include` processes the file and "stamps" it by defining the guard
macro; every subsequent `#include` sees the stamp and skips the content.

```cpp
// Canonical: a minimal header with an include guard
#ifndef MY_UTILS_H
#define MY_UTILS_H

int add(int a, int b) { return a + b; }  // defined only once, no matter
                                          // how many files include this header
#endif
```

Why this example makes the mechanic obvious: the guard macro acts as a
one-time flag. Once set, the preprocessor skips all content between
`#define` and `#endif` on every subsequent encounter.

**Project Application (The "Why" here):**

Lab 14 introduces multiple `.cpp` files (`combat.cpp`, `dungeon.cpp`,
`ui.cpp`) that all `#include "display.h"`. Without the include guard, every
color constant would be defined once per file that includes the header — a
redefinition error. The include guard makes the header safe to include from
any number of translation units.

**Why it matters here:** Lab 14 introduces multiple `.cpp` files all
including the same headers. Without guards, every constant would be
defined twice — a compile error.

---

## Step 2 — The Colored HP/MP Bars

Add this function to `display.h` (before `#endif`):

```cpp
// ── Progress bar (HP, MP, XP) ──────────────────────────────────
// current  — current value
// maximum  — maximum value
// width    — total bar width in characters
// color    — what color to use for the filled portion
inline void printColoredBar(int current, int maximum, int width,
                            const std::string& fillColor) {
    // Calculate filled blocks (safe integer math)
    int filled = (maximum > 0) ? (current * width) / maximum : 0;
    if (filled > width) filled = width;
    if (filled < 0)     filled = 0;

    std::cout << fillColor << "[";
    for (int block = 0; block < filled; block++) {
        std::cout << "▓";  // Unicode ▓ (filled block)
    }
    for (int block = filled; block < width; block++) {
        std::cout << "░";  // Unicode ░ (light block)
    }
    std::cout << "]" << COLOR_RESET;
    std::cout << " " << current << "/" << maximum;
}

// ── HP bar — green normally, yellow below 50%, red below 25% ──
inline void printHPBar(int hp, int maxHP) {
    float hpPercent = (maxHP > 0) ? static_cast<float>(hp) / static_cast<float>(maxHP) : 0.0f;

    std::string barColor;
    if (hpPercent > 0.5f) {
        barColor = COLOR_GREEN;
    } else if (hpPercent > 0.25f) {
        barColor = COLOR_YELLOW;
    } else {
        barColor = COLOR_RED;   // critical HP — urgent!
    }

    std::cout << "  HP  ";
    printColoredBar(hp, maxHP, 16, barColor);
    std::cout << std::endl;
}

// ── MP bar — always blue ───────────────────────────────────────
inline void printMPBar(int mp, int maxMP) {
    std::cout << "  MP  ";
    printColoredBar(mp, maxMP, 16, COLOR_BLUE);
    std::cout << std::endl;
}
```

### SAVE AND TRY

Add to the game loop's `s` command branch (in `main.cpp`):

```cpp
printHPBar(hero.hp, hero.maxHP);
printMPBar(hero.mp, hero.maxMP);
```

Compile and run. Type `s`.

**You should see:** A green HP bar and blue MP bar below the character sheet.

**Test low HP:** Temporarily set `hero.hp = 2`. Recompile. The bar should be
red and nearly empty. Change back.

---

## Step 3 — Clear Screen and Redraw

Update `main()` to clear the screen each loop iteration:

```cpp
while (isRunning) {
    clearScreen();  // ← add this at the top of the loop

    // ── Draw the game header ──────────────────────────────────
    std::cout << COLOR_RED;
    std::cout << "╔══════════════════════════════════════════════╗" << std::endl;
    std::cout << "║          ☠  DUNGEON OF DOOM  ☠               ║" << std::endl;
    std::cout << "╚══════════════════════════════════════════════╝" << std::endl;
    std::cout << COLOR_RESET << std::endl;

    // ── Draw status bars ──────────────────────────────────────
    std::cout << "  " << COLOR_YELLOW << hero.name << COLOR_RESET
              << " — " << getClassName(hero.characterClass)
              << " — Level " << hero.level << std::endl;
    std::cout << std::endl;
    printHPBar(hero.hp, hero.maxHP);
    printMPBar(hero.mp, hero.maxMP);
    std::cout << "  Gold: " << COLOR_YELLOW << hero.gold << COLOR_RESET
              << "   XP: " << hero.xp << "/" << hero.xpToNext << std::endl;

    // ── Command menu ──────────────────────────────────────────
    std::cout << std::endl;
    std::cout << COLOR_DARK << "  ──────────────────────────────────" << COLOR_RESET << std::endl;
    std::cout << "  [S]tats  [L]ook  [H]eal  [D]ig  [Q]uit" << std::endl;
    std::cout << COLOR_DARK << "  ──────────────────────────────────" << COLOR_RESET << std::endl;
    std::cout << "  > ";

    // (rest of command processing unchanged)
}
```

### SAVE AND TRY

Compile and run. Type commands.

**You should see:** The screen clears each time you enter a command, and the
game header, health bars, and menu redraw fresh.

**In the terminal:**
- The title is red
- Your name is yellow
- HP bar is green (full health)
- Heal to partial HP (use `h` command but HP is already at full... temporarily
  damage yourself by editing code) to see the yellow/red transitions

**Change something:** Remove `clearScreen()` temporarily. See how each
command APPENDS instead of replacing the display. Add it back.

---

## Challenge: Enemy Health Bar Display

**You know:** `printColoredBar()`, enemy struct.

**Task:** Write `void printEnemyStatus(const Enemy& enemy)` that prints
the enemy's name in magenta and their HP bar in the appropriate color
(same green/yellow/red logic as the player HP bar).

Test it by creating a goblin in `main()` with half HP and calling the function.

---

<details>
<summary>▶ Show Solution</summary>

Add to `display.h`:
```cpp
// (Requires Enemy struct — forward declare or include the struct header)
// For now, since Enemy is in main.cpp, add this as a regular function there:
```

In `main.cpp`, after the `Enemy` struct definition:
```cpp
void printEnemyStatus(const Enemy& enemy) {
    float hpPercent = (enemy.maxHP > 0) ?
        static_cast<float>(enemy.hp) / static_cast<float>(enemy.maxHP) : 0.0f;

    std::string barColor;
    if (hpPercent > 0.5f)       barColor = COLOR_GREEN;
    else if (hpPercent > 0.25f) barColor = COLOR_YELLOW;
    else                         barColor = COLOR_RED;

    std::cout << "  " << COLOR_MAGENTA << enemy.name << COLOR_RESET << std::endl;
    std::cout << "  HP  ";
    printColoredBar(enemy.hp, enemy.maxHP, 16, barColor);
    std::cout << std::endl;
}
```

Test:
```cpp
Enemy goblin = createGoblin();
goblin.hp = goblin.maxHP / 2;  // wound it
printEnemyStatus(goblin);
```

**Key insight:** Reusing `printColoredBar` for both player and enemy health
bars means updating the bar appearance (changing the block characters, the
width, the color logic) in one place. This is the DRY principle in action:
Don't Repeat Yourself.

</details>

---

## Challenge: Pulsing Danger Warning

**You know:** `clearScreen()`, the game loop, `COLOR_RED`.

**Task:** When `hero.hp <= hero.maxHP / 4` (critical HP), display a
`"⚠ CRITICAL HP — HEAL NOW! ⚠"` warning in bold red ABOVE the HP bar.
Only show it when HP is critical. Remove it when HP recovers.

---

<details>
<summary>▶ Show Solution</summary>

In the loop, before `printHPBar`:
```cpp
if (hero.hp <= hero.maxHP / 4) {
    std::cout << COLOR_RED << "  ⚠  CRITICAL HP — HEAL NOW!  ⚠" << COLOR_RESET << std::endl;
}
```

**Key insight:** Because the screen clears on each loop iteration and redraws
from scratch, adding/removing this line based on an `if` condition creates a
UI that dynamically responds to game state. This is the core of the immediate
mode rendering pattern: don't track "what's currently on screen" — just
redraw the whole thing correctly based on current state.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| `display.h` compiles without errors | `g++ -std=c++17 -o dungeon main.cpp` |
| Colored text appears in terminal | See red title, yellow name |
| HP bar shows colored blocks | Type `s` — see `▓▓▓▓▓▓▓▓▓▓▓░░░░░` |
| Full HP = green bar | Default start — see green |
| 40% HP = yellow bar | Set `hero.hp = hero.maxHP * 0.4` — see yellow |
| 20% HP = red bar | Set `hero.hp = 1` — see red |
| Screen clears on each loop | Type multiple commands — no scrollback accumulation |
| Colors reset after each colored line | Lines after colored text appear in normal color |

---

## Quick Check Answers

**1. What is an ANSI escape code, and why does it start with `\033[`?**
ANSI escape codes are sequences of characters that terminals interpret as
control commands rather than printable text. The `\033` is the ESC character
(ASCII code 27, octal 33 — the `\033` is the octal literal). `[` begins the
"Control Sequence Introducer" (CSI). Together, `\033[` tells the terminal
"what follows is a control command, not text." The terminal processes the
sequence and changes its state (color, cursor position, etc.) without printing
the characters. This is defined by the ANSI/VT100 standard from the 1970s.

**2. If you forget to reset colors after colored text, what happens?**
All subsequent terminal output — including text you print later, and even
the terminal prompt after the program exits — appears in the last color you
set. The terminal does not automatically reset when your program ends. The
fix is always to print `\033[0m` (or `COLOR_RESET`) after every colored section.
Some terminals can be manually reset by typing `reset` or `tput sgr0`.

**3. Will ANSI escape codes work in Windows Command Prompt (cmd.exe)?**
Not by default in older Windows versions. Traditional `cmd.exe` does not
support ANSI escape codes. However: Windows Terminal (the modern replacement),
VS Code's integrated terminal, Git Bash, WSL, and Windows 10 v1903+ (with
Virtual Terminal Processing enabled) all support ANSI codes. For a game in
a modern development environment, ANSI codes are safe to use. For distribution
to unknown Windows users, you would add a `#ifdef _WIN32` block to enable
Virtual Terminal Processing via the Windows API.
