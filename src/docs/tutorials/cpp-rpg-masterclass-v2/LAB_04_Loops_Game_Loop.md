# C++ Terminal RPG — LAB 04 — Loops & the Game Loop

**Prerequisites:** LAB 03. You can use `if`/`else`, comparison operators, and
logical operators.

**What this lab adds:**
- `while` and `for` loops
- A menu-driven game loop that keeps running until the player quits
- A command dispatcher — the core of every interactive game

**Time:** 50–65 minutes

---

## What You Will Build

After this lab, `./dungeon` runs an interactive loop:

```
  What is your name, brave adventurer? Erevan

  Welcome, Erevan! You stand at the dungeon entrance.

  ┌──────────────────────────────┐
  │  COMMANDS                    │
  │  [S] View Stats              │
  │  [L] Look around             │
  │  [H] Heal (costs 10 gold)    │
  │  [Q] Quit                    │
  └──────────────────────────────┘
  > s

  [Shows character sheet]

  ┌──────────────────────────────┐
  │  COMMANDS ...                │
  └──────────────────────────────┘
  > l

  You are in a damp stone corridor. Torches flicker on the walls.
  You smell something foul to the east.

  > h

  You rest briefly and drink a sip of water. +5 HP (costs 10 gold)
  HP: 16/16  Gold: 40

  > q

  You retreat from the dungeon. Your score: 0
  Goodbye, Erevan.
```

---

> **Quick Check — try to answer before reading:**
> 1. What is an infinite loop? How do you create one intentionally, and how
>    do you stop it?
> 2. What is the difference between `while` and `for`? When would you use each?
> 3. Prediction: what happens if you write `break` inside a nested loop
>    (a loop inside a loop)?
> *(Answers at the end of this lab)*

---

## Mental Model: The Game Loop

**What it is:** Game Loop Pattern

**Why it exists:** A game is not a one-shot script. It must continuously:
1. Wait for player input
2. Update game state based on that input
3. Display the new state to the player
4. Repeat until the game ends

Without a loop, the program would run once and exit. The loop IS the game.

**In this lab** the loop looks like:
```
while (game is running) {
    display menu
    read player command
    process command (update state)
    display result
}
```

**Where you will see this again:** Every interactive game uses this pattern.
Lab 12 (battle system) has its own nested battle loop. Lab 16 (complete game)
has the outer dungeon loop containing the inner battle loop.

---

## Concept: `while` — Loop While a Condition Is True

**What it is:** A loop that repeats its body as long as a condition remains true.
It checks the condition BEFORE each iteration.

**The problem before:** Without a loop, you can only process one command:
```cpp
std::cout << "> ";
char cmd;
std::cin >> cmd;
// handles one command, then program exits
```

**The solution:**
```cpp
bool isRunning = true;

while (isRunning) {
    std::cout << "> ";
    char cmd;
    std::cin >> cmd;

    if (cmd == 'q') {
        isRunning = false;  // set flag to exit the loop
    }
    // other commands handled here
}
// execution continues here after the loop ends
```

**What it hides:** Hides the manual "check condition, jump back to start"
pattern that would otherwise require assembly-style `goto` labels. The
invariant protected: the body executes ONLY when the condition is true; when
the condition becomes false, the loop exits cleanly at the top of the next
iteration — the body is never entered again.

**Canonical example (General Explanation):**
A coin-operated laundry machine — it keeps spinning "while" there are coins.
The condition is checked BEFORE each spin. If you never put coins in, it never
spins.
```cpp
bool isRunning = true;

while (isRunning) {
    processInput();
    update();
    render();
}
```
Why this makes the mechanic obvious: the machine does not check mid-spin
whether the coins ran out — it checks at the start of each new spin, exactly
like `while` checks at the top of each new iteration.

**Project Application (The "Why" here):**
`while (isRunning)` IS the game. Everything the player ever does — viewing
stats, healing, looking around, quitting — happens inside this loop. Setting
`isRunning = false` does not stop the loop immediately; it finishes the current
iteration, then the condition check at the top evaluates to false and the loop
exits cleanly. This is why the goodbye message prints after the loop, not inside it.

**Smallest possible example:**
```cpp
int count = 0;
while (count < 3) {
    std::cout << "Count: " << count << std::endl;
    count++;  // ++ increments by 1, prevents infinite loop
}
// Prints: Count: 0, Count: 1, Count: 2
```

**Why it matters here:** The game loop runs while `isRunning == true`. Setting
`isRunning = false` causes the loop to end after the current iteration completes.

**Watch for:** Forgetting to change the condition inside the loop creates an
infinite loop that never exits. Always make sure SOMETHING inside the loop
can set the condition to false or `break` out.

---

## Concept: `for` — Loop a Known Number of Times

**What it is:** A loop with initialization, condition, and increment all in
one line. Used when you know how many times to loop.

**The problem before:**
```cpp
// Verbose: three separate lines to do what one should do
int index = 0;
while (index < 5) {
    std::cout << index << std::endl;
    index++;
}
```

**The solution:**
```cpp
for (int index = 0; index < 5; index++) {
    std::cout << index << std::endl;
}
// index is scoped to the loop — does not exist outside it
```

The three parts: `(init; condition; increment)`
- `int index = 0` — runs once before the loop
- `index < 5` — checked before each iteration
- `index++` — runs after each iteration

**What it hides:** Hides the three bookkeeping lines (declare, check, advance)
by packing them into one header. Invariant protected: `index` only exists
inside the loop body — it cannot leak out and pollute the surrounding scope
the way a `while`-based counter can.

**Canonical example (General Explanation):**
Counting sheep — you count 1, 2, 3... up to N. Each sheep is one iteration:
initialize the counter before you start, check it hasn't passed N, advance it
after each sheep.
```cpp
for (int count = 0; count < 3; count++) {
    std::cout << count << std::endl;
}
// Output: 0  1  2
```
Why this makes the mechanic obvious: the three parts (start, stop, step) map
directly onto "start at 0, stop before 3, count up by 1."

**Project Application (The "Why" here):**
The `printProgressBar` function in Step 3 uses two `for` loops: one counts
from 0 to `filledBlocks` printing filled characters, the other counts from
`filledBlocks` to `HP_BAR_WIDTH` printing empty characters. The HP bar is
dynamic — the loop range changes every time HP changes, which is exactly what
`for` was designed for.

**Smallest possible example:**
```cpp
// Count 1 to 5:
for (int num = 1; num <= 5; num++) {
    std::cout << num << " ";
}
std::cout << std::endl;  // Output: 1 2 3 4 5
```

**Why it matters here:** Drawing the HP bar (`▓▓▓▓▓░░░`) uses a `for` loop
counting from 0 to bar width. Later, enemy spawning loops over a list of
enemies.

**Watch for:** The most common `for` bug is `<=` vs `<`. `for (int i = 0; i <= 5; i++)`
iterates 6 times (0,1,2,3,4,5). `for (int i = 0; i < 5; i++)` iterates 5 times
(0,1,2,3,4). Off-by-one errors are the most frequent loop bug.

---

## Concept: `break` and `continue`

**What it is:**
- `break` — immediately exits the current loop (jumps to the first line after `}`)
- `continue` — skips the rest of this iteration and starts the next one

**What it hides:** Both hide the manual `goto` jump that would otherwise be
required. `break` hides "jump to the label after the closing brace." `continue`
hides "jump to the label at the top of the loop body (or the increment in a `for`)."
Invariant for `break`: the loop body will NOT execute again after `break` fires,
even if the loop condition would still be true.

**Canonical example (General Explanation):**
Emergency exits in a building — `break` is pulling the fire alarm and leaving
the building immediately (exit the loop now). `continue` is skipping one floor
because the elevator is broken on that floor (skip this iteration, carry on
with the next).
```cpp
for (int floor = 0; floor < 10; floor++) {
    if (floor == 3) continue;   // skip floor 3 — broken elevator
    if (floor == 7) break;      // fire alarm — leave now
    std::cout << "Visiting floor " << floor << std::endl;
}
// Output: floors 0, 1, 2, 4, 5, 6
```
Why this makes the mechanic obvious: you can picture a building, and the two
exits (skip one floor vs leave entirely) map directly to `continue` and `break`.

**Project Application (The "Why" here):**
In later labs, `break` exits the battle loop when either the player or the
enemy reaches 0 HP. `continue` skips the rest of the loop body when the player
enters an unrecognized command (print the error message, then loop back to the
menu without processing anything further).

**Smallest possible example:**
```cpp
for (int index = 0; index < 10; index++) {
    if (index == 3) continue;    // skip 3
    if (index == 7) break;       // stop at 7
    std::cout << index << " ";
}
// Output: 0 1 2 4 5 6
```

**Why it matters here:** `break` exits the battle loop when combat ends.
`continue` skips invalid commands in the game loop.

**Watch for:** `break` only exits ONE loop. Inside a nested loop, `break`
exits the inner loop only, not the outer one.

---

## Step 1 — The Display Menu Function

Add this above `main()` (keep all previous functions):

```cpp
void displayCommandMenu() {
    std::cout << std::endl;
    std::cout << "  ┌──────────────────────────────┐" << std::endl;
    std::cout << "  │  COMMANDS                    │" << std::endl;
    std::cout << "  │  [S] View Stats              │" << std::endl;
    std::cout << "  │  [L] Look around             │" << std::endl;
    std::cout << "  │  [H] Heal (costs 10 gold)    │" << std::endl;
    std::cout << "  │  [Q] Quit                    │" << std::endl;
    std::cout << "  └──────────────────────────────┘" << std::endl;
    std::cout << "  > ";
}
```

In `main()`, add the welcome message and a test render of the menu. Keep all
the character sheet code from previous labs above this, then add the following
lines after it:

```cpp
std::cout << std::endl;
std::cout << "  Welcome, " << playerName << "! You stand at the dungeon entrance." << std::endl;

// Just test the menu renders correctly before adding the loop
displayCommandMenu();  // ← add this

return 0;  // ← was: nothing after character sheet
```

### SAVE AND TRY

Compile and run.

**You should see:** The character sheet followed by the welcome message and
then the command menu box with a `>` prompt. The program exits immediately
after showing the `>` (no input processed yet — that comes in Step 2).

**Change something:** Add `[F] Fight a goblin` to the menu display. Compile.
You should see it in the box. Remove it (we add real fight in Lab 12).

---

## Step 2 — The Game Loop

In `main()`, replace the single `displayCommandMenu()` test call and `return 0`
with the full game loop. Everything before the welcome message stays untouched.

```cpp
std::cout << std::endl;
std::cout << "  Welcome, " << playerName << "! You stand at the dungeon entrance." << std::endl;

// ── Game Loop ─────────────────────────────────────────────
int  playerScore = 0;    // tracks points earned this run
bool isRunning   = true; // set to false to exit the loop

while (isRunning) {                      // ← add this (game loop start)
    displayCommandMenu();

    char command;
    std::cin >> command;
    std::cout << std::endl;

    if (command == 's' || command == 'S') {
        // Show the character sheet
        displayCharacterSheet(
            playerName, playerLevel,
            statSTR, statDEX, statCON, statINT, statWIS, statCHA,
            playerHP, playerMaxHP, playerMP, playerMaxMP,
            playerATK, playerDEF, playerGold, playerXP
        );

    } else if (command == 'l' || command == 'L') {
        // Look around — static room description for now
        std::cout << "  You are in a damp stone corridor." << std::endl;
        std::cout << "  Torches flicker on the moss-covered walls." << std::endl;
        std::cout << "  You smell something foul to the east." << std::endl;

    } else if (command == 'h' || command == 'H') {
        // Heal
        const int HEAL_COST   = 10;  // gold per heal
        const int HEAL_AMOUNT = 5;   // HP restored

        if (playerGold < HEAL_COST) {
            std::cout << "  Not enough gold to heal. (Need " << HEAL_COST << " gold)" << std::endl;
        } else if (playerHP >= playerMaxHP) {
            std::cout << "  You are already at full health." << std::endl;
        } else {
            playerGold -= HEAL_COST;
            playerHP   += HEAL_AMOUNT;
            if (playerHP > playerMaxHP) {
                playerHP = playerMaxHP;  // do not exceed max
            }
            std::cout << "  You rest briefly and recover " << HEAL_AMOUNT << " HP." << std::endl;
            std::cout << "  HP: " << playerHP << "/" << playerMaxHP
                      << "  Gold: " << playerGold << std::endl;
        }

    } else if (command == 'q' || command == 'Q') {
        isRunning = false;  // exit the loop on next check

    } else {
        std::cout << "  Unknown command '" << command << "'. Try again." << std::endl;
    }
}                                        // ← add this (game loop end)
// ── End Game Loop ─────────────────────────────────────────

std::cout << std::endl;
std::cout << "  You retreat from the dungeon. Your score: " << playerScore << std::endl;
std::cout << "  Goodbye, " << playerName << "." << std::endl;
std::cout << std::endl;
```

### SAVE AND TRY

Compile and run.

**You should see:** The character sheet, welcome message, then the command
menu. Type commands:
- `s` → shows stats
- `l` → shows room description
- `h` → heals (type 3-4 times until gold runs out)
- `q` → exits with goodbye message

**In the terminal:**
Try `h` 5 times in a row. Observe: eventually `"Not enough gold"` triggers.

**Change something:** Change `HEAL_COST` from `10` to `5`. Recompile.
You can now heal twice as many times before running out of gold. Change back.

---

### Logic: Game Loop Exit Condition

**What it decides:** Whether to keep running the game or exit to the goodbye
screen.

**Truth table or breakdown:**

| `isRunning` | Player typed | Outcome |
|-------------|--------------|---------|
| true  | any command except `q`/`Q` | Loop body runs again |
| true  | `q` or `Q`                 | Sets `isRunning = false`; loop runs to end of body, then exits |
| false | (never reached — loop already ended) | Program falls through to goodbye message |

**Canonical example:** A restaurant that stays open while `isOpen == true`.
When the owner flips the sign to "Closed," the last customers still finish
their meals before the place actually closes.

**The code:** `while (isRunning)` combined with `isRunning = false;` inside the
`'q'` branch.

**Watch for:** Setting `isRunning = false` does NOT exit the loop immediately.
The rest of the current iteration still runs. If you need to skip remaining
code in that iteration after setting the flag, add `continue;` after
`isRunning = false;`.

---

## Concept: The `for` Loop for Drawing

**What it is:** Using a `for` loop to draw repeated characters — perfect for
HP bars, XP bars, and separator lines.

**The problem before:**
```cpp
// Drawing a 10-character bar by hand:
std::cout << "▓▓▓▓▓▓░░░░" << std::endl;  // hardcoded, does not change
```

**The solution:**
```cpp
int filled  = 6;   // filled blocks
int total   = 10;  // total bar width

for (int block = 0; block < filled; block++) {
    std::cout << "▓";  // filled portion
}
for (int block = filled; block < total; block++) {
    std::cout << "░";  // empty portion
}
std::cout << std::endl;
// Output: ▓▓▓▓▓▓░░░░
```

**What it hides:** Hides N separate `std::cout` calls. Without the loop you
would need to write (or hardcode) every single character. Invariant protected:
the number of filled characters plus the number of empty characters always
equals `total` — the bar width is constant regardless of how much HP remains.

**Canonical example (General Explanation):**
A loading bar on a download screen — the filled portion grows as more bytes
arrive. The total width is fixed; only the split point between filled and empty
moves.
```cpp
int downloaded = 4;
int total      = 10;
for (int i = 0; i < downloaded; i++) { std::cout << "="; }
for (int i = downloaded; i < total;  i++) { std::cout << "-"; }
// Output: ====----- (4 filled, 6 empty)
```
Why this makes the mechanic obvious: you see the two loops independently handle
"how much is done" and "how much is left."

**Project Application (The "Why" here):**
`printProgressBar` in Step 3 uses exactly this two-loop pattern. `filledBlocks`
is calculated from current HP / max HP, and the two loops draw the filled and
empty portions. The same function is called for both HP and MP bars — the
`fillChar` and `emptyChar` parameters let it double as any kind of progress bar
in later labs.

**Why it matters here:** We use this pattern for HP and MP bars in Lab 08.
The bar length changes dynamically as HP changes.

---

## Step 3 — A For-Loop Status Bar Preview

Add this function above `main()`:

```cpp
const int HP_BAR_WIDTH = 16;  // total character width of the HP/MP bars

void printProgressBar(int current, int maximum, char fillChar, char emptyChar) {
    // Calculate how many filled blocks to show (integer math, safe)
    int filledBlocks = (current * HP_BAR_WIDTH) / maximum;
    if (filledBlocks > HP_BAR_WIDTH) filledBlocks = HP_BAR_WIDTH;
    if (filledBlocks < 0)            filledBlocks = 0;

    std::cout << "[";
    for (int block = 0; block < filledBlocks; block++) {
        std::cout << fillChar;
    }
    for (int block = filledBlocks; block < HP_BAR_WIDTH; block++) {
        std::cout << emptyChar;
    }
    std::cout << "] " << current << "/" << maximum;
}
```

Add a `p` command to the game loop (before the `else`):
```cpp
} else if (command == 'p' || command == 'P') {
    // Preview — the HP/MP bar we will use in Lab 08
    std::cout << "  HP  ";
    printProgressBar(playerHP, playerMaxHP, 'X', '.');
    std::cout << std::endl;
    std::cout << "  MP  ";
    printProgressBar(playerMP, playerMaxMP, '*', '.');
    std::cout << std::endl;
```

### SAVE AND TRY

Compile and run. Type `p`.

**You should see:**
```
  HP  [XXXXXXXXXXXXXXXX] 11/11
  MP  [XXXXXXXXXXXXXXXX] 11/11
```
(Full bars since HP = max HP.)

Now type `h` once (to spend 10 gold), then `p` again — bars still full
(we healed back up). Temporarily change `playerHP` to `5` in the code,
recompile, type `p`:
```
  HP  [XXXXXXXXX.......] 5/11
```
The bar is partial. Change `playerHP` back.

---

## Challenge: Add a [D]ig Command

**You know:** Adding a new command to the `else if` chain in the game loop.

**Task:** Add a `[D] Dig for treasure` command:
- 30% chance of finding 5–15 gold (hint: `rand() % 3 == 0` is true ~33% of
  the time — you will learn proper random numbers in Lab 05, use this for now)
- 10% chance of finding a `"Stone Tablet"` (print the message, no inventory yet)
- Otherwise: print `"You find only dust and old bones."`

**Starting code:**
```cpp
} else if (command == 'd' || command == 'D') {
    // Add your dig logic here
```

---

<details>
<summary>▶ Show Solution</summary>

```cpp
} else if (command == 'd' || command == 'D') {
    std::cout << "  You dig at the dungeon floor..." << std::endl;

    int roll = rand() % 10;  // 0-9, rough probability

    if (roll <= 0) {
        // ~10% chance — special find
        std::cout << "  You uncover a Stone Tablet! Ancient writing covers its surface." << std::endl;
    } else if (roll <= 2) {
        // ~20% chance (rolls 1 and 2) — gold find
        int goldFound = 5 + (rand() % 11);  // 5 to 15 gold
        playerGold += goldFound;
        std::cout << "  Your shovel hits something metallic! You find " << goldFound << " gold coins." << std::endl;
        std::cout << "  Gold: " << playerGold << std::endl;
    } else {
        std::cout << "  You find only dust and old bones." << std::endl;
    }
```

Add `#include <cstdlib>` at the top for `rand()`, and add
`srand(static_cast<unsigned>(time(nullptr)));` at the top of `main()` for
`#include <ctime>` so the randomness changes each run.

**Key insight:** `rand() % N` gives a number from 0 to N-1. To simulate
probability: `rand() % 10 == 0` is true ~10% of the time (when it lands on 0).
This is rough — Lab 05 introduces proper seeding and range calculation. For
now, this demonstrates that games use probability for uncertainty and drama.

</details>

---

## Challenge: Action Counter

**You know:** `int` variables, `++` increment, the game loop.

**Task:** Add an `int actionCount = 0;` variable before the game loop.
Increment it each time the player enters a valid command (S, L, H, D).
When the player quits, print: `"You took X actions before retreating."`

This counter becomes the basis for the score system in later labs.

---

<details>
<summary>▶ Show Solution</summary>

Add before `while (isRunning)`:
```cpp
int actionCount = 0;
```

Add `actionCount++;` at the start of each valid branch:
```cpp
} else if (command == 's' || command == 'S') {
    actionCount++;
    displayCharacterSheet(...);
} else if (command == 'l' || command == 'L') {
    actionCount++;
    ...
```

In the quit message:
```cpp
std::cout << "  You took " << actionCount << " actions before retreating." << std::endl;
```

**Key insight:** A counter inside a loop is the simplest form of state that
spans multiple iterations. This is the embryo of the score system: actions →
points in Lab 05 with the dice roll, kills → XP in Lab 12.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Menu displays after character sheet | Run — see the command box |
| `s` shows character sheet | Type `s` — see stats |
| `l` shows room description | Type `l` — see corridor message |
| `h` heals and deducts gold | Type `h` repeatedly — see HP and gold change |
| `h` rejects when no gold | Heal until gold = 0 — see rejection message |
| `h` rejects at full HP | Start with full HP, type `h` — see "already full" |
| `q` exits cleanly | Type `q` — see goodbye message |
| Unknown command shows error | Type `z` — see "Unknown command" |
| Loop keeps running until `q` | Type 5 different commands, then `q` |

---

## Quick Check Answers

**1. What is an infinite loop? How do you create one, and how do you stop it?**
An infinite loop is a loop whose condition never becomes false. Intentional
example: `while (true) { ... }` — the condition is always true. You exit it
with `break`, or by setting an external flag variable to false, or by returning
from the function. In a game loop, `while (isRunning)` is semi-intentional:
it runs "forever" until the player quits. Ctrl+C in the terminal force-kills
any program with a truly stuck infinite loop.

**2. What is the difference between `while` and `for`? When would you use each?**
Both loop, but `for` bundles initialization, condition, and increment in one
line — it is the standard choice when you know how many times to loop (0 to N).
`while` is cleaner when the number of iterations is unknown in advance (e.g.,
"keep looping until the player quits" or "keep rolling dice until you get a 6").
Functionally they are equivalent — every `for` can be rewritten as `while` and
vice versa.

**3. Prediction: what happens when `break` is inside a nested loop?**
`break` exits only the INNERMOST loop containing it. If you have a `for` inside
a `while`, `break` in the `for` exits only the `for` — the `while` keeps running.
To exit both loops you need either a flag variable (`bool done = false;`) that
the outer loop checks, or a `goto` (strongly discouraged), or to restructure
the code into functions where `return` exits the entire function.
