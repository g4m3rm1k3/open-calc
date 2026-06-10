# C++ Masterclass — S-01 — LAB 12 — Error Handling

**Prerequisites:** LAB 11. You can read and write files and check stream state.

**What this lab adds:**
- Why unhandled errors are silent and dangerous
- `std::cin` fail state — what happens when input does not match the expected type
- Recovering from a bad `std::cin` read — `clear()` and `ignore()`
- Return codes vs exceptions — two error signalling strategies
- `enum class` — strongly typed error codes
- Defensive programming — anticipating failure before it happens
- A hardened input loop that survives any keyboard input without crashing

**Time:** ~60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You write `std::cin >> hp` expecting the user to type a number.
>    They type "hello" instead. What state does `std::cin` enter?
>    Will the next `std::cin >> hp` in the loop work correctly?
> 2. A function returns `-1` to signal an error. What happens if the caller
>    ignores the return value and uses `-1` as if it were a real result?
> 3. What is the difference between a program that crashes on bad input and
>    one that handles bad input gracefully?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A **hardened character creator** — the dungeon map sketcher from earlier labs,
upgraded with robust input handling that never crashes regardless of what the
user types:

```
=== Hardened Character Creator ===

Enter your character's name: 
> Zara

Enter starting HP (10-200): 
> hello
  [Error] Expected a number. Please try again.
> -5
  [Error] Value must be between 10 and 200.
> 80
  HP accepted: 80

Enter starting level (1-10): 
> 3
  Level accepted: 3

Character created successfully.
  Name:  Zara
  HP:    80 / 80
  Level: 3
```

---

## Part 1 — The `std::cin` Fail State

### Concept: Stream Fail State — When Input Goes Wrong

**What it is:** Every stream (`std::cin`, `std::ifstream`) tracks whether it is in a
healthy or failed state. When a read operation fails — for example, trying to read an
`int` but finding letters — the stream enters its **fail state**:
1. The read does not modify the destination variable (it keeps its old value)
2. **All subsequent reads on that stream are silently skipped** until the state is cleared
3. The failed input stays in the buffer, causing every future read to fail immediately

**The concrete danger:**
```cpp
int hp = 0;
while (hp < 10 || hp > 200) {
    std::cout << "Enter HP (10-200): ";
    std::cin >> hp;   // user types "hello"
}
// std::cin is now in fail state
// hp is still 0
// The loop spins forever — std::cin >> hp succeeds instantaneously (it's in fail state)
// but hp never changes → infinite loop
```

This is one of the most common crashes in beginner console programs.

**The fix — two operations:**
1. `std::cin.clear()` — clears the fail flag, returning the stream to a good state
2. `std::cin.ignore(count, delimiter)` — discards characters from the input buffer
   until `count` characters have been discarded or the delimiter character is found

```cpp
std::cin.clear();                                          // clear the fail flag
std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');  // discard the rest of the line
```

**`std::numeric_limits<std::streamsize>::max()`:** The largest possible stream size —
effectively "ignore everything up to (and including) the next newline." This safely
discards whatever invalid text the user typed, leaving the stream ready for the next read.
`#include <limits>` provides `std::numeric_limits`.

**Watch for:** If you call `clear()` without `ignore()`, the invalid text ("hello")
is still in the buffer. The next read immediately fails again. You must do both.

---

## Step 1 — Demonstrate the Fail State

New `main.cpp` that shows the problem:

```cpp
#include <iostream>    // std::cout, std::cin, std::endl
#include <limits>      // std::numeric_limits
#include <string>      // std::string

int main() {
    std::cout << "=== Fail State Demonstration ===" << std::endl;
    std::cout << std::endl;

    int value = -1;   // -1 as sentinel: "not yet set to a valid value"

    std::cout << "Type 'abc' when prompted to see the fail state." << std::endl;
    std::cout << "Enter a number: ";
    std::cin >> value;

    std::cout << "After read, value = " << value << std::endl;
    std::cout << "std::cin is good: " << std::cin.good() << std::endl;   // 1=good, 0=failed

    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

Type `abc` at the prompt.

**You should see:** `value = -1` (unchanged) and `good: 0` (stream failed).

**Change something:** Type `42` instead of `abc`. Recompile and run. Now `value = 42`
and `good: 1`. The stream is healthy when given valid input.

---

## Part 2 — Recovering from Failure

### Concept: `clear()` and `ignore()` — Cleaning Up After Bad Input

**Why both are needed in sequence:**
- `clear()` alone: fail flag gone, but "abc\n" is still in the buffer. Next `>>` read
  immediately fails again on "abc".
- `ignore()` alone: the buffer is partially cleared, but the fail flag remains. Next
  `>>` read is immediately skipped.
- `clear()` then `ignore()`: fail flag cleared AND buffer cleared. Next read works.

---

## Step 2 — Write a Robust Input Function

This is the hardened version of `getValidInput` from LAB 05. It handles all failure modes:

```cpp
#include <iostream>
#include <limits>      // std::numeric_limits
#include <string>      // std::string

// ── readInt ───────────────────────────────────────────────────────────────────
// Reads one integer from std::cin.
// Returns true and sets 'out' if successful. Returns false if input was not a number.
// Does NOT loop — caller decides what to do on failure.
bool readInt(int& out) {
    std::cin >> out;

    if (std::cin.fail()) {
        // Clear the fail flag and discard the bad input line
        std::cin.clear();
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
        return false;   // signal: the read failed
    }

    // Discard the rest of the line (e.g., extra characters after the number)
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    return true;   // signal: the read succeeded
}

// ── getValidInt ───────────────────────────────────────────────────────────────
// Loops until the user enters a valid integer in [minVal, maxVal].
// Handles non-numeric input and out-of-range input separately.
int getValidInt(const std::string& prompt, int minVal, int maxVal) {
    int value = 0;
    bool valid = false;

    while (!valid) {
        std::cout << prompt << std::endl;
        std::cout << "> ";

        if (!readInt(value)) {
            std::cout << "  [Error] Expected a number. Please try again." << std::endl;
        } else if (value < minVal || value > maxVal) {
            std::cout << "  [Error] Value must be between " << minVal
                      << " and " << maxVal << "." << std::endl;
        } else {
            valid = true;   // both checks passed — exit the loop
        }
    }

    return value;
}
```

**Why separate `readInt` and `getValidInt`?** `readInt` handles the mechanics (stream
state). `getValidInt` handles the policy (range, user message). Separating them means
you can call `readInt` in contexts where you want different error handling without
rewriting the stream recovery logic. This is the **Single Responsibility Principle**
— each function does exactly one thing.

---

## Part 3 — Enum Class for Error Codes

### Concept: `enum class` — Strongly Typed Error Codes

**What it is:** `enum class` (enumeration) defines a named type with a fixed set of
named values. Used for error codes, states, and any situation where a variable should
only hold one of a small, predefined set of values.

**The problem before (using `int` codes):**
```cpp
int savePlayer(const Player& p, const std::string& file) {
    if (!canWrite) return -1;   // magic number: what does -1 mean?
    if (!hasSpace) return -2;   // -2? Different from -1 how?
    return 0;                   // and 0 means success?
}
```
The caller must know (by convention or documentation) what each number means.
Passing `-1` where an int is expected compiles without warning — you could
accidentally use the error code as data.

**The solution:**
```cpp
enum class SaveResult {
    Success,
    CannotOpenFile,
    DiskFull
};

SaveResult savePlayer(const Player& p, const std::string& file) {
    if (!canWrite) return SaveResult::CannotOpenFile;   // self-documenting
    if (!hasSpace) return SaveResult::DiskFull;
    return SaveResult::Success;
}

// Caller:
SaveResult result = savePlayer(p, "save.txt");
if (result == SaveResult::CannotOpenFile) { /* ... */ }
```

**Why `enum class` over plain `enum`:** Plain `enum` leaks its names into the
surrounding scope (`Success` instead of `SaveResult::Success`) and can implicitly
convert to `int`. `enum class` keeps names scoped and prevents accidental arithmetic.
Always use `enum class` in modern C++.

---

## Step 3 — Upgrade `savePlayer` to Return an Enum

Add the enum and update the character creator:

```cpp
enum class CreateResult {
    Success,
    NameTooShort,
    InvalidStats
};

// ── createCharacter ───────────────────────────────────────────────────────────
// Creates a player by prompting for name and stats.
// Returns CreateResult to signal what happened.
CreateResult createCharacter(Player& out) {
    std::cout << "Enter your character's name: " << std::endl;
    std::cout << "> ";
    std::getline(std::cin, out.name);   // getline reads the full line including spaces

    if (out.name.length() < 2) {
        return CreateResult::NameTooShort;
    }

    out.hp    = getValidInt("Enter starting HP (10-200):",   10, 200);
    std::cout << "  HP accepted: " << out.hp << std::endl;

    out.maxHp = out.hp;   // start at full health

    out.level = getValidInt("Enter starting level (1-10):", 1, 10);
    std::cout << "  Level accepted: " << out.level << std::endl;

    return CreateResult::Success;
}
```

---

## Step 4 — Complete Main

```cpp
// ── Player Struct ────────────────────────────────────────────────────────────
struct Player {
    std::string name;
    std::string className = "Adventurer";
    int hp      = 0;
    int maxHp   = 0;
    int level   = 1;
    int xp      = 0;
    int atk     = 5;
    int def     = 3;
};

int main() {
    std::cout << "=== Hardened Character Creator ===" << std::endl;
    std::cout << std::endl;

    Player newPlayer;
    CreateResult result = createCharacter(newPlayer);

    switch (result) {
        case CreateResult::Success:
            std::cout << std::endl;
            std::cout << "Character created successfully." << std::endl;
            std::cout << "  Name:  " << newPlayer.name  << std::endl;
            std::cout << "  HP:    " << newPlayer.hp << " / " << newPlayer.maxHp << std::endl;
            std::cout << "  Level: " << newPlayer.level << std::endl;
            break;

        case CreateResult::NameTooShort:
            std::cout << "[Error] Name must be at least 2 characters. Character not created." << std::endl;
            break;

        case CreateResult::InvalidStats:
            std::cout << "[Error] Invalid stats. Character not created." << std::endl;
            break;
    }

    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

Type `hello` when asked for HP. The error appears and the prompt repeats.
Type `-5`. The range error appears. Type `80`. Accepted. Type `3` for level.
The character sheet appears.

**Test the name check:** Type a single letter for the name. The `NameTooShort` path triggers.

---

## 🎯 Challenge: Validate Dungeon Dimensions

**You know:** `getValidInt`, `enum class`, defensive input handling.

**Task:** Write a function `enum class DimensionResult { Valid, WidthTooSmall, HeightTooSmall, TooBig };`
and a function that validates dungeon dimensions using your `getValidInt`. If `width × height > 200`,
reject the combination as "too big." Return the appropriate enum value.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
enum class DimensionResult { Valid, WidthTooSmall, HeightTooSmall, TooBig };

DimensionResult validateDimensions(int& outWidth, int& outHeight) {
    outWidth  = getValidInt("Enter dungeon width  (2-20):", 2, 20);
    outHeight = getValidInt("Enter dungeon height (2-10):", 2, 10);

    if (outWidth * outHeight > 200) {
        return DimensionResult::TooBig;
    }
    return DimensionResult::Valid;
}
```

**Key insight:** The function validates the combination of inputs, not just each
individually. A 20×10 dungeon (200 cells) is the boundary; 20×11 (220 cells) would
exceed it. This kind of multi-value validation cannot be expressed in a single
`getValidInt` call — it requires a dedicated function that understands the relationship
between the values.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| Fail state triggered | Typing "abc" for HP shows the error message and repeats |
| `clear()` + `ignore()` | After typing "abc", the next valid number is accepted normally |
| Range check | Typing `-5` shows the range error; typing `80` is accepted |
| `enum class` | The `switch` in `main` covers all three `CreateResult` cases |
| `NameTooShort` path | A 1-character name triggers the error path |
| `getline` for name | A name with spaces (e.g., "Sir Reginald") is accepted and preserved |
| No infinite loop | The program never gets stuck on repeated bad input |

---

## Quick Check Answers

**1. What state does `std::cin` enter when given non-numeric input for an `int`?**
The **fail state** — `std::cin.fail()` returns `true`. The stream refuses all further
reads until `std::cin.clear()` is called. The failed input ("hello") remains in the
input buffer, causing every subsequent read to fail immediately without waiting for
the user. This creates an infinite loop if you do not recover. The fix: `clear()` to
remove the fail flag, then `ignore()` to discard the bad input from the buffer.

**2. What happens if the caller ignores a `-1` error code?**
The `-1` is used as if it were a valid result. If you pass it to `drawGrid(-1, 10)`,
the loop `for (int col = 0; col < -1; ++col)` never executes (correct by accident).
But `tiles[-1]` would cause out-of-bounds access. Integer error codes are completely
type-compatible with valid integers — the language provides no safety net. `enum class`
solves this: a `CreateResult` value cannot be accidentally passed to a function
expecting an `int` without an explicit cast.

**3. Difference between a crash and graceful handling?**
A crash terminates the program with no explanation and may corrupt files or leave
the system in an inconsistent state. Graceful handling: detects the problem,
reports it clearly to the user, and continues (or exits cleanly). The user knows
what went wrong and what to do next. In a multiplayer RPG, a crash on one client
disconnects that player and may corrupt their save. Graceful error handling lets
the client report the error to the server, save state, and exit cleanly — protecting
both the player and the other users still connected.
