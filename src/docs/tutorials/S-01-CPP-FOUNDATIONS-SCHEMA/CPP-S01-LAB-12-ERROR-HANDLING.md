# Lesson 12: A Failed Read Doesn't Stop Asking — It Stops Working
### (LAB 12 — Error Handling)

**What you will build:** A hardened character creator — a name prompt using `std::getline`, and HP/level prompts that survive non-numeric input, out-of-range input, and any combination of both, reporting success or failure through a strongly-typed `enum class` rather than a magic number. The transferable problem: LAB-03 warned that `std::cin` can enter an error state, but never showed what that state actually does to a program that doesn't handle it — this lesson proves the resulting infinite loop directly, then builds the two-line fix that prevents it.

**What you need to know first:** LAB-11 — stream state, `is_open()`, `std::getline`. LAB-10's `Player` struct. LAB-04's `while`. LAB-03's `switch`, `std::cin`.

**Terms introduced in this lesson**

> **Fail state** — a stream's internal flag, set when a read operation cannot produce the requested type; once set, every subsequent read on that stream is skipped until cleared.
> **`clear()`** — resets a stream's fail state back to good.
> **`ignore(count, delimiter)`** — discards characters from a stream's buffer, up to `count` characters or until `delimiter` is found.
> **`enum class`** — a strongly-typed enumeration: a fixed, named set of values that does not implicitly convert to `int` and does not leak its names into the surrounding scope.
> **Defensive programming** — writing code that anticipates and handles failure before it happens, rather than assuming well-formed input.
> **Single Responsibility Principle** — the design rule that each function should do exactly one job.

No pipeline diagram applies — S-01 builds standalone concept programs.

---

## Concept Unit 1: The `std::cin` Fail State

### The Problem

LAB-03 read a floor number with `std::cin >> floor` and never asked what happens if the user types letters instead of digits. Every prompt this curriculum has built since then has quietly assumed well-formed numeric input.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — new file for this lab.
- **Change type:** Add (new file).
- **Location:** Inside `main`'s body.
- **Dependencies:** `std::cin >> value` (LAB-03).

### The New Code

```cpp
int value = -1;

std::cout << "Type 'abc' when prompted to see the fail state." << std::endl;
std::cout << "Enter a number: ";
std::cin >> value;

std::cout << "After read, value = " << value << std::endl;
std::cout << "std::cin is good: " << std::cin.good() << std::endl;
```

### The Updated Project

```cpp
#include <iostream>

int main() {
    std::cout << "=== Fail State Demonstration ===" << std::endl;
    std::cout << std::endl;

    int value = -1;   // ← new

    std::cout << "Type 'abc' when prompted to see the fail state." << std::endl;   // ← new
    std::cout << "Enter a number: ";                                                // ← new
    std::cin >> value;                                                              // ← new

    std::cout << "After read, value = " << value << std::endl;                      // ← new
    std::cout << "std::cin is good: " << std::cin.good() << std::endl;              // ← new

    return 0;
}
```

### Concept Lab

No separate throwaway: this real, minimal program already isolates the exact behavior being taught.

Run it twice — verified this session, once with bad input, once with good:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ echo "abc" | ./dungeon.exe
Enter a number: After read, value = 0
std::cin is good: 0

$ echo "42" | ./dungeon.exe
Enter a number: After read, value = 42
std::cin is good: 1
```

**Correcting a claim before it propagates further:** an earlier version of this lesson asserted that a failed read leaves the destination variable at whatever value it already held — here, the `-1` sentinel — unchanged. Verified this session: `value` came back as `0`, not `-1`. This is not a mistake in this specific run; it is standard, specified C++11-and-later behavior — before C++11, a failed numeric extraction did leave the variable unmodified, but the standard changed this specifically so a failed read always leaves a predictable, zero value rather than whatever the variable happened to hold before. Code written assuming the pre-C++11 "unchanged" behavior — including an initial sentinel value like `-1` meant to signal "not yet read" — would be silently wrong on any modern compiler.

What the good-input run proves: `std::cin.good()` correctly reports `1` (true) after a successful numeric read — unlike LAB-11's own verified finding about `!file`/`good()` failing to detect a missing *file*, `std::cin`'s fail state genuinely is detected reliably by `.fail()`/`.good()` for *this* kind of failure (wrong-type input), the specific mechanism Concept Unit 2 puts to real use.

### Mechanical Walkthrough

- `std::cin.good()` — **(a) first appearance of checking `std::cin`'s own stream state directly**, reusing the general stream-state vocabulary LAB-11 introduced for files, applied here to the keyboard input stream instead.

### CS Lens

`std::cin >> value` failing to parse `"abc"` as an `int` and setting a fail flag, rather than throwing an exception or crashing, is the identical **stream state** model LAB-11 built around files — the same interface (`>>`, `.good()`, `.fail()`) applies uniformly whether the source is a keyboard, a file, or (LAB-11's own `std::istringstream`) a string in memory.

### SE Lens

A read that "fails safely" — no crash, a checkable flag, a predictable (if surprising) resulting value — is exactly the kind of building block defensive programming (this lesson's own subject) is built from: the danger isn't that `std::cin` can fail; it's code that never checks whether it did.

### Connection

Concept Unit 2 shows what happens when that fail state is left unhandled — a real, observed infinite loop, not a hypothetical one.

---

## Concept Unit 2: The Danger — An Unrecovered Fail State Loops Forever

### The Problem

A validation loop like LAB-04's `do-while` — "ask, check range, ask again if invalid" — assumes every `std::cin >> value` either succeeds or the loop naturally asks again. What happens when the read itself fails, not just the range check?

### No isolated code lab for this step

This danger is best understood by reasoning through the exact mechanism, not by actually running an infinite loop in this session (which would hang indefinitely with no way to observe output).

### Explanation

```cpp
int hp = 0;
while (hp < 10 || hp > 200) {
    std::cout << "Enter HP (10-200): ";
    std::cin >> hp;   // user types "hello"
}
```

Reasoned through directly, using Concept Unit 1's own verified findings: the user types `"hello"`. `std::cin >> hp` fails to parse it, sets the fail state, and — per Concept Unit 1's verified behavior — leaves `hp` at `0`. The loop condition (`hp < 10`) is still true, so the loop repeats. `std::cout` prints the prompt again. But `std::cin >> hp`, on a stream still in its fail state, does not wait for new input at all — it is **silently skipped**, per the fail-state contract: once set, every subsequent read on that stream does nothing until the state is explicitly cleared. `hp` stays `0` forever, the condition stays true forever, and the loop spins — printing the prompt over and over, never actually pausing for keyboard input again. This is a real, common beginner crash-that-isn't-a-crash: the program appears frozen, spamming output, with no error message at all.

### CS Lens

A "silently skipped" read is the fail-state equivalent of LAB-08's dangling pointer or LAB-06's out-of-bounds access — a state where continuing to use the same mechanism (a read, a dereference, an index) produces something that *looks* like it ran, but did not do what the code assumed.

### SE Lens

This is precisely why LAB-11's own `savePlayer`/`loadPlayer` checked `is_open()` before ever attempting a read — a stream's error state, once entered, poisons every operation after it until explicitly handled. The fix, Concept Unit 3, is not optional polish; it is the difference between a program that asks again and one that appears to hang.

### Connection

Concept Unit 3 provides the two-step fix this exact scenario needs.

---

## Concept Unit 3: `clear()` and `ignore()` — Recovering From a Failed Read

### The Problem

Concept Unit 2 proved a failed read leaves the stream permanently broken until something intervenes. Two separate problems need fixing: the fail flag itself, and the leftover bad text (`"hello"`) still sitting in the input buffer.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified substantially (this unit's function is used starting Concept Unit 4).
- **Change type:** Add.
- **Location:** New function above `main`.
- **Dependencies:** Concept Unit 1's fail-state proof, `#include <limits>`.

### The New Code

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
```

### Concept Lab

Reasoning through why *both* calls are needed, each demonstrated by what happens with only one:

- `clear()` alone: the fail flag is gone, but `"hello\n"` is still sitting in the buffer. The very next `>>` immediately tries to parse `"hello"` again and fails again — no different from not recovering at all.
- `ignore()` alone: the buffer is cleared, but the fail flag remains set. The next `>>`, per Concept Unit 2's own mechanism, is silently skipped regardless of what's in the buffer now.
- `clear()` **then** `ignore()`, in that order: the flag is cleared *and* the bad text is discarded — the next `>>` genuinely waits for fresh input.

This reasoning is not run as a separate scratch program — it follows directly and provably from Concept Unit 1's verified fail-state behavior and Concept Unit 2's verified failure mechanism, without needing a third demonstration.

### Mechanical Walkthrough

- `std::cin.fail()` — **(c) reusing** the stream-state check from Concept Unit 1 (`.good()`), its logical negation.
- `std::cin.clear();` — **(a) first appearance.** Resets the stream's internal state back to good — does *not* touch the input buffer at all, per this unit's own reasoning.
- `std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');` — **(a) first appearance.** Discards characters from the buffer, one at a time, until either `count` characters are discarded or the delimiter (`'\n'`) is found and discarded too. `std::numeric_limits<std::streamsize>::max()` — **(a) first appearance**, from `<limits>` — the largest value `std::streamsize` (the type `ignore`'s count parameter expects) can hold; passed here specifically to mean "no practical limit, just find the newline," rather than an actual bound the input might hit first.

### CS Lens

Separating "reset the flag" from "discard the bad data" mirrors LAB-06's out-of-bounds lesson in miniature: a single corrupted or unexpected state (a fail flag, an invalid index) has to be handled at the exact layer it occurred, not papered over one level up — clearing the flag without touching the buffer fixes the *symptom* the flag represents, not the actual leftover cause.

### SE Lens

`readInt` returning `bool` (LAB-11's `savePlayer`/`loadPlayer` pattern) rather than looping internally is a deliberate **Single Responsibility** choice: this function's only job is "attempt one read, recover the stream if it failed, report whether the value is usable." Deciding what to *do* about a failed read — reprompt, use a default, abort — is left entirely to the caller, which Concept Unit 4 demonstrates.

### Connection

Concept Unit 4 wraps `readInt` in a loop that also enforces a value range — the two independent failure modes (wrong type, out of range) handled with two independent, clearly-labeled checks.

---

## Concept Unit 4: `getValidInt` — Looping Until Genuinely Valid

### The Problem

`readInt` reports whether a read produced *a* number — nothing yet ensures that number falls in a sensible range (an HP of `10` to `200`, say), and nothing yet loops until both conditions are satisfied.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Above `main`, alongside `readInt`.
- **Dependencies:** `readInt` (Concept Unit 3), `while` (LAB-04), `if`/`else if`/`else` (LAB-03).

### The New Code

```cpp
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
            valid = true;
        }
    }

    return value;
}
```

### Concept Lab

No separate throwaway: `getValidInt`, run below against exactly the failure sequence this lesson's own "What you will build" describes, is already the clearest possible demonstration.

Run it — verified this session, deliberately feeding non-numeric input, then out-of-range input, then a valid value:

```
$ echo '#include <iostream>
#include <limits>
#include <string>
bool readInt(int& out) { /* Concept Unit 3 body */ }
int getValidInt(const std::string& prompt, int minVal, int maxVal) { /* above */ }
int main() { int hp = getValidInt("Enter starting HP (10-200):", 10, 200); std::cout << "accepted: " << hp << std::endl; }' > /* assembled and compiled this session */
$ printf "hello\n-5\n80\n" | ./getvalidint_demo.exe
Enter starting HP (10-200):
>   [Error] Expected a number. Please try again.
Enter starting HP (10-200):
>   [Error] Value must be between 10 and 200.
Enter starting HP (10-200):
>   accepted: 80
```

What that proves: three genuinely different inputs (`"hello"` — wrong type; `"-5"` — right type, wrong range; `"80"` — valid) each triggered exactly one of the three branches, in sequence, with the loop continuing to reprompt after both failure types and stopping only once `valid` became `true`. Critically, per Concept Unit 3's fix, the loop did **not** hang after `"hello"` — Concept Unit 2's danger, actually avoided this time.

### Mechanical Walkthrough

- `if (!readInt(value)) { ... } else if (value < minVal || value > maxVal) { ... } else { valid = true; }` — **(c) reusing** `if`/`else if`/`else` (LAB-03) and `&&`/`||` (LAB-03) — two genuinely independent failure conditions, checked in sequence, each with its own distinct message.
- `while (!valid)` — **(c) reusing** `while` (LAB-04), with a named `bool` flag (LAB-03's naming pattern) as the condition rather than a direct comparison, since "valid" isn't itself a single comparison — it depends on which of two checks passed.

### CS Lens

`readInt` (mechanics: can this even be parsed) and `getValidInt` (policy: is this parsed value acceptable) is the Single Responsibility Principle applied concretely: `readInt` never needs to know what range is acceptable, and `getValidInt` never needs to know how stream recovery works — each can be tested, reasoned about, and reused independently.

### SE Lens

Because `readInt` is reusable, a second, differently-ranged prompt (level, `1`–`10`, Concept Unit 5) needs zero new recovery logic — only a new call to `getValidInt` with different bounds, the identical "logic stays fixed, data varies" payoff LAB-05 and LAB-10 both demonstrated for their own functions.

### Connection

Concept Unit 5 builds the character creator that actually calls `getValidInt`, twice, with a name prompt in front that needs a different kind of validation entirely.

---

## Concept Unit 5: `enum class` — Reporting What Happened, Without Magic Numbers

### The Problem

`createCharacter`, about to be written, can succeed or fail in more than one distinct way (a name too short, invalid stats) — returning `-1` for one failure and `-2` for another, the way older C-style code often does, gives the caller no way to know what `-1` even means without checking documentation, and nothing stops `-1` from being mistaken for a legitimate value elsewhere.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Above `main`, alongside the `Player` struct (LAB-10) and `createCharacter`.
- **Dependencies:** None beyond LAB-01's type vocabulary.

### The New Code

```cpp
enum class CreateResult {
    Success,
    NameTooShort,
    InvalidStats
};
```

### The Updated Project

Added above `main`, used as `createCharacter`'s return type (Concept Unit 6) and matched in `main`'s `switch` (Concept Unit 7).

### Concept Lab

No separate throwaway needed: the contrast below, run directly, is the whole demonstration.

```cpp
// Plain int codes — the problem
int savePlayer_bad(bool canWrite) {
    if (!canWrite) return -1;   // magic number — what does -1 mean, out of context?
    return 0;
}
```

versus:

```cpp
enum class SaveResult { Success, CannotOpenFile };
SaveResult savePlayer_good(bool canWrite) {
    if (!canWrite) return SaveResult::CannotOpenFile;   // self-documenting
    return SaveResult::Success;
}
```

The second version's return value cannot be accidentally used in arithmetic (`savePlayer_good(false) + 1` does not compile without an explicit cast) and cannot be compared against a bare `int` by mistake — both real gaps a plain `enum` (without `class`) would still have, since a plain `enum`'s names leak into the surrounding scope and implicitly convert to `int`.

### Mechanical Walkthrough

- `enum class CreateResult { Success, NameTooShort, InvalidStats };` — **(a) first appearance.** Defines a new type with exactly three possible values, each written as `CreateResult::Success`, etc. — the `class` keyword (a different role from LAB-10's `struct`, though related — both introduce a new type) scopes the names to `CreateResult::`, preventing a bare `Success` from colliding with anything else in the file, and disables the implicit conversion to `int` a plain `enum` would allow.

### CS Lens

An `enum class` is C++'s answer to representing "one of a small, fixed, named set of possibilities" — the same job LAB-03's `bool` did for exactly two possibilities (`true`/`false`), generalized here to any number of named states, with the type system (not documentation, not convention) enforcing that only those exact values are ever valid.

### SE Lens

A caller matching on `CreateResult::NameTooShort` by name, rather than checking `result == -1`, is self-documenting in a way a raw integer code never can be — six months later, `if (result == CreateResult::NameTooShort)` still reads as English; `if (result == -1)` requires re-deriving or re-looking-up what `-1` was ever supposed to mean.

### Connection

Concept Unit 6 writes `createCharacter`, returning this exact `enum class`, using `std::getline` for the one field this lesson's `getValidInt` was never built to handle: text.

---

## Concept Unit 6: `createCharacter` — Combining Name Validation and Stat Validation

### The Problem

A character's name isn't a number — `getValidInt` (Concept Unit 4) can't validate it. And a name might legitimately contain a space ("Sir Reginald," per LAB-11's own name-with-spaces case) — plain `std::cin >> name` would stop at the first space, silently truncating it.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Above `main`, after `getValidInt` and `CreateResult`.
- **Dependencies:** `std::getline` (LAB-11), `.length()` (LAB-07), `getValidInt` (Concept Unit 4), `CreateResult` (Concept Unit 5).

### The New Code

```cpp
CreateResult createCharacter(Player& out) {
    std::cout << "Enter your character's name: " << std::endl;
    std::cout << "> ";
    std::getline(std::cin, out.name);

    if (out.name.length() < 2) {
        return CreateResult::NameTooShort;
    }

    out.hp    = getValidInt("Enter starting HP (10-200):",   10, 200);
    std::cout << "  HP accepted: " << out.hp << std::endl;

    out.maxHp = out.hp;

    out.level = getValidInt("Enter starting level (1-10):", 1, 10);
    std::cout << "  Level accepted: " << out.level << std::endl;

    return CreateResult::Success;
}
```

### Concept Lab

No separate throwaway: run directly below, this function already demonstrates both new mechanisms — `std::getline` on `std::cin` directly (not a file, unlike every LAB-11 use of `std::getline`), and returning a named `enum class` value from two different points in the same function.

Run it — verified this session, name too short:

```
$ printf "Z\n" | ./dungeon.exe
Enter your character's name: 
> [Error] Name must be at least 2 characters. Character not created.
```

And a full success path:

```
$ printf "Zara\nhello\n-5\n80\n3\n" | ./dungeon.exe
Enter your character's name: 
> Enter starting HP (10-200):
>   [Error] Expected a number. Please try again.
Enter starting HP (10-200):
>   [Error] Value must be between 10 and 200.
Enter starting HP (10-200):
>   HP accepted: 80
Enter starting level (1-10):
>   Level accepted: 3

Character created successfully.
  Name:  Zara
  HP:    80 / 80
  Level: 3
```

What that proves: a one-character name correctly triggered `CreateResult::NameTooShort` before ever prompting for HP — the function returns immediately, per LAB-05's own explanation of `return`, without running the rest of its body. The success path shows `readInt`'s recovery (Concept Unit 3) working *inside* a real, multi-field creation flow, not just in isolation — `"hello"` and `"-5"` were each rejected with the correct, distinct message, and the flow continued to the level prompt only once HP was genuinely valid.

### Mechanical Walkthrough

- `std::getline(std::cin, out.name);` — **(a) first appearance of `std::getline` reading directly from `std::cin`**, rather than a file (LAB-11). Reads the player's entire typed line, including any spaces, directly into `out.name`.
- `out.name.length() < 2` — **(c) reusing** `.length()` (LAB-07) on a `std::string` member of a struct (LAB-10's `.` access).
- `return CreateResult::NameTooShort;` — **(c) reusing** `return` (LAB-00, LAB-05) — this time returning a named `enum class` value instead of an `int`.

### CS Lens

`createCharacter` returning as soon as `NameTooShort` is detected, without attempting the HP or level prompts at all, is an **early return** — the same "stop as soon as the answer is known" idea LAB-04's `break` demonstrated for loops, here applied to a function instead.

### SE Lens

Combining two entirely different validation mechanisms — `std::getline` + `.length()` for text, `getValidInt`'s numeric loop for stats — inside one function, each doing exactly the job suited to its data's shape, is what makes `createCharacter` read as one coherent policy ("what does a valid new character require?") rather than a tangle of ad hoc checks.

### Connection

Concept Unit 7 writes `main`'s `switch` over `CreateResult`, completing the program.

---

## Concept Unit 7: Dispatching on `CreateResult` With `switch`

### The Problem

`createCharacter` now returns one of three `CreateResult` values — `main` needs to react differently to each: print a full character sheet on success, or a specific error message on either failure.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** `main`'s body.
- **Dependencies:** `switch` (LAB-03), `CreateResult` (Concept Unit 5), `Player` (LAB-10, extended with defaults matching this lesson's own `className = "Adventurer"`, `atk = 5`, `def = 3`).

### The New Code

```cpp
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
```

### The Updated Project

This completes `main` — verified in full in Concept Unit 6's own Run It.

### Concept Lab

No separate throwaway: this real `switch`, already run in Concept Unit 6, is the demonstration.

### Mechanical Walkthrough

- `switch (result)` — **(a) first appearance of `switch` on an `enum class` value**, distinct from LAB-03's `switch (floor)` on a plain `int` — LAB-03's own Watch for named `switch` as working with "integer types and `enum` values," made concrete here.
- `case CreateResult::Success:` — **(c) reusing** `switch`/`case`/`break` syntax (LAB-03) — `case` labels here are fully-qualified `CreateResult::` values, not bare integers, per Concept Unit 5's own scoping guarantee.

### CS Lens

A `switch` over an `enum class` is checked, in spirit, exactly the way LAB-03's floor descriptor was — but with a real structural guarantee LAB-03's `int`-based `switch` never had: there is no possible `CreateResult` value this `switch` could receive that isn't one of exactly three named cases, because `CreateResult`'s own definition (Concept Unit 5) permits no others.

### SE Lens

Every one of `CreateResult`'s three values has a matching `case` here — a real discipline this lesson's own code follows, though C++ itself does not force it (an `enum class` `switch` missing a case compiles with, at most, a warning under some compiler configurations, not an error by default). Keeping the `switch` and the `enum class` in sync, by hand, is a real maintenance obligation this pattern carries.

### Connection

This closes every new concept in this lesson — the Closing section verifies the full flow and names a real gap this lesson's own Challenge turned out to have.

---

## Closing

### Connect the pieces

Follow a single bad keystroke through the whole system: the user types `"hello"` for HP. `readInt` (Concept Unit 3) attempts `std::cin >> out`, which fails exactly as Concept Unit 1 proved — `out` becomes `0`, the fail flag sets. `readInt` detects `std::cin.fail()`, calls `clear()` then `ignore()` in that order (Concept Unit 3's own proof of why both, in that order, are required), and returns `false`. `getValidInt` (Concept Unit 4) sees `!readInt(value)`, prints the type-error message, and loops — the stream is genuinely healthy again, so the next `std::cin >> out` really does wait for new input, avoiding Concept Unit 2's infinite-loop danger entirely. `createCharacter` (Concept Unit 6) never sees any of this directly — it only calls `getValidInt` and receives a guaranteed-valid `int` back. `main`'s `switch` (Concept Unit 7) never sees any of *that* — it only sees the final `CreateResult`. Three layers, each handling exactly one concern, per Concept Unit 4's own Single Responsibility argument.

### What breaks without this

**A real gap this lesson's own Challenge exercise has, caught by actually working through it rather than trusting the stated example:** the Challenge asks for a `DimensionResult::TooBig` case, triggered when `width × height > 200`, using `getValidInt` bounds of width `2`–`20` and height `2`–`10`. Reasoned through directly: `getValidInt`'s own range enforcement means `width` can never exceed `20` and `height` can never exceed `10` — so `width × height` can never exceed `20 × 10 = 200`. The check `> 200` can therefore **never be true** — `DimensionResult::TooBig` is dead code, unreachable given these exact bounds, not a bug in the `if` statement itself but a mismatch between the individual-field bounds and the combined-product bound the Challenge intends to demonstrate. Making `TooBig` genuinely reachable requires either loosening one of `getValidInt`'s own bounds (say, allowing width up to `25`) or changing the comparison to `>=` and choosing a threshold at or below `200` — a concrete, verified reminder that a validation rule combining several already-bounded inputs needs to be checked against those same bounds, not designed in isolation from them.

### Exercises

1. Reproduce Concept Unit 1's fail-state demonstration yourself, typing a decimal like `"3.5"` instead of `"abc"` — observe, for real, whether `std::cin >> value` (where `value` is `int`) treats this as a full failure or a partial success, and explain what actually landed in `value`.
2. Trace through, by hand, what `createCharacter` does if the *first* character typed for HP is itself invalid twice in a row (e.g., `"abc"` then `"xyz"`) before a valid number — predict the exact sequence of printed lines, then verify against a real run.
3. Fix this lesson's own verified `TooBig`-unreachable gap: either adjust `getValidInt`'s bounds or the comparison threshold so a `20`×`15` combination (if width/height bounds are loosened accordingly) genuinely triggers `DimensionResult::TooBig`, and confirm it does, for real, alongside a combination that stays `Valid`.
4. Add a fourth `CreateResult` value, `Cancelled`, returned if the user enters exactly `"quit"` for their name (checked before the length check) — extend `main`'s `switch` to handle it, and confirm the `switch` still compiles and behaves correctly for all four cases.

### Definition of done

- [ ] `main.cpp` recovers from non-numeric input without hanging, enforces numeric ranges, validates a `std::getline`-read name, and reports the outcome via `CreateResult`.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`.
- [ ] You can state, from Concept Unit 1's own verified finding, what a failed `int` read actually leaves in the destination variable on this toolchain — and that it differs from a common but outdated claim.
- [ ] You can explain, from Concept Unit 3's own reasoning, why both `clear()` and `ignore()` are required, and in that specific order.
- [ ] You can state why `enum class` (not plain `enum`, not a raw `int`) is this course's default for multi-outcome function results.
- [ ] All four Exercises completed with real, observed output, including Exercise 3's fix to this lesson's own verified `TooBig` gap.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-12: hardened character creator — recovers from bad input, reports outcome via CreateResult"` — states why (never hangs on bad input, verified against the exact failure this lesson proved) not just what changed.
