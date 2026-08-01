# Lesson 7: A String Is an Array That Learned to Manage Itself
### (LAB 07 — Strings)

**What you will build:** A dungeon event log — game messages assembled at runtime from a player name, a floor number, and an action, stored in a growable list and searched by substring. The transferable problem: LAB-06 proved arrays are fixed-size, unchecked, and decay to bare pointers when passed around — `std::string` is what a text-holding array becomes once someone builds safety and convenience on top of exactly that same underlying array-of-`char` shape. Seeing the raw, manual version first is what makes `std::string`'s conveniences legible as *solutions*, not just a shorter syntax to memorize.

**What you need to know first:** LAB-06 — arrays, indexing, array decay to pointers. LAB-05's functions and references-as-parameters preview. LAB-04's `for` loop.

**Terms introduced in this lesson**

> **C-string** — a `char` array representing text, terminated by a null character.
> **Null terminator (`'\0'`)** — the character with ASCII value `0`, marking a C-string's end.
> **`std::string`** — the standard library's managed, dynamically-sized string type.
> **`size_t`** — an unsigned integer type used for sizes and indices; `std::string::length()`'s return type.
> **`std::string::npos`** — the special value `.find()` returns to signal "not found."
> **`std::to_string`** — converts a numeric value to its `std::string` text representation.
> **`std::vector`** — a dynamically-growable array type (full treatment in `S-02-CPP-DSA-MASTERY`); used here to store a list of log entries.
> **Range-based `for`** — a loop iterating every element of a collection directly, without managing an index.

No pipeline diagram applies — S-01 builds standalone concept programs.

---

## Concept Unit 1: C-Strings — Arrays of `char` With a Null Terminator

### The Problem

LAB-06's `char tiles[10]` array holds ten characters — but nothing about it says *how much of that ten is a meaningful string* versus unused space. Printing "Zara" from a `char` array needs a way to know exactly where the name stops, without the array's own size being the only source of truth.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — new file for this lab.
- **Change type:** Add (new file).
- **Location:** Inside `main`'s body.
- **Dependencies:** `char` arrays (LAB-06).

### The New Code

```cpp
char cName[10] = "Zara";
```

### The Updated Project

```cpp
#include <iostream>
#include <string>

int main() {
    std::cout << "=== Dungeon Event Log ===" << std::endl;
    std::cout << std::endl;

    char cName[10] = "Zara";   // ← new

    return 0;
}
```

### Concept Lab

```cpp
// scratch_cstring.cpp  (disposable)
#include <iostream>
#include <cstring>
int main() {
    char name[6] = "Zara";
    std::cout << "strlen(name) = " << strlen(name) << std::endl;
    for (int i = 0; i < 6; ++i) {
        std::cout << "  [" << i << "] = " << (int)name[i] << std::endl;
    }
}
```

Run it — verified this session:

```
$ g++ scratch_cstring.cpp -o scratch_cstring -std=c++17 -Wall -Wextra
$ ./scratch_cstring.exe
strlen(name) = 4
  [0] = 90
  [1] = 97
  [2] = 114
  [3] = 97
  [4] = 0
  [5] = 0
```

What that proves: `char name[6] = "Zara"` — a 6-element array holding a 4-character word — stores `'Z'`, `'a'`, `'r'`, `'a'` (ASCII `90, 97, 114, 97`, per LAB-01's char-as-number rule) at indices `0`–`3`, then a `0` at index `4`, then another `0` at index `5` (an unused, zero-initialized remainder — LAB-06's initializer-list rule). `strlen` (the standard library's C-string length function, from `<cstring>`) reported `4`, not `6` — it stopped counting the moment it read a `0` byte at index `4`, never looking at index `5` at all. That `0` byte is the **null terminator** (`'\0'`) — the compiler added it automatically because the literal `"Zara"` is a C-string literal, and every C-string literal is null-terminated by the compiler, not by the programmer typing `'\0'` explicitly.

This scratch file is discarded now; the real project's `cName` follows this identical layout — 4 real characters, a null terminator, one byte of unused space, since it was declared with size `10` for a 4-character name.

### Mechanical Walkthrough

- `char cName[10] = "Zara"` — **(a) first appearance of a string literal used to initialize a `char` array.** `"Zara"` supplies `'Z'`, `'a'`, `'r'`, `'a'`, and a compiler-added `'\0'` — five bytes total, leaving five of the ten declared bytes unused.
- `strlen(name)` — **(a) first appearance.** A standard library function (from `<cstring>`, not demonstrated as included in the real project — only in this disposable lab) that reads characters starting at the array's base address and counts until it finds `'\0'`, per the Concept Lab's proof.

### CS Lens

A C-string is LAB-06's array plus one convention layered on top: "the end is marked by a sentinel value," rather than the length being tracked separately. This **sentinel-terminated sequence** pattern recurs outside strings too — a linked list's `nullptr` tail (`CPP-S02-LAB-07`) is the identical idea applied to a different structure.

### SE Lens

A sentinel-based end marker means every C-string operation (`strlen`, printing, copying) must *read* the whole string just to find out how long it is — there is no `O(1)` length check the way `std::string::length()` (Concept Unit 2) provides, because nothing records the length directly; it has to be rediscovered by scanning for `'\0'` every time it's needed.

### Watch for

The array must be large enough for the text *plus* the null terminator — `char name[4] = "Zara"` (no room for `'\0'`) is a real, silent danger: whatever byte follows the array in memory gets no protection from being misread as part of the string, or the initialization itself may simply be rejected at compile time depending on how it's written. Always size a C-string array for the longest text it needs to hold, plus one.

### Connection

Concept Unit 2 catalogs the concrete ways this manual, sentinel-based system breaks down in ordinary use — motivating `std::string` directly.

---

## Concept Unit 2: The Problems With C-Strings — and `std::string`'s Answer

### The Problem

C-strings work, but four specific operations that feel like they should be easy — resizing, concatenating, comparing, and reassigning — are each a real trap.

### No isolated code lab for this step

Two of the four traps (comparison, concatenation) are demonstrated concretely below; the other two (fixed size, manual sizing) were already shown by Concept Unit 1's own array layout.

### Concept Lab — comparing two C-strings

```cpp
// scratch_cstring.cpp, extended (still disposable)
#include <iostream>
#include <cstring>
int main() {
    char a[] = "hello";
    char b[] = "hello";
    std::cout << "a == b (address compare): " << (a == b) << std::endl;
    std::cout << "strcmp(a,b) == 0: " << (strcmp(a, b) == 0) << std::endl;
}
```

Compiling and running — verified this session:

```
$ g++ scratch_cstring.cpp -o scratch_cstring -std=c++17 -Wall -Wextra
scratch_cstring.cpp:5:53: warning: comparison between two arrays [-Warray-compare]
    5 |     std::cout << "a == b (address compare): " << (a == b) << std::endl;
      |                                                   ~~^~~~
$ ./scratch_cstring.exe
a == b (address compare): 0
strcmp(a,b) == 0: 1
```

What that proves, and a real, verified compiler behavior worth naming: `a == b` compiles (with a warning — GCC's `-Warray-compare`, specifically added to flag exactly this likely-unintended comparison) and evaluates to `0` (false), even though `a` and `b` hold *identical text*. Per LAB-06's array decay, `a == b` compares the two arrays' *addresses*, not their contents — and two separately declared arrays never share an address. `strcmp(a, b) == 0`, the correct C-string comparison, evaluates to `1` (true) — `strcmp` actually reads and compares the characters.

This scratch file is discarded now; the real project never uses `char` arrays for comparison — `std::string`'s `==`, demonstrated next, compares content directly, with no separate function needed.

### Explanation

Four traps, summarized against `std::string`'s answer to each:

| Problem | C-string | `std::string` |
|---|---|---|
| Size management | Manual — array must be pre-sized | Automatic — grows as needed |
| Concatenation | No `+` (produces pointer arithmetic, not new text) | `a + b` works directly |
| Comparison | `strcmp(a, b) == 0` | `a == b` compares content |
| Reassignment | `cName = "Lyra";` does not compile — arrays cannot be reassigned wholesale | `playerName = "Lyra";` works directly |

`std::string` is declared with `#include <string>`. It hides heap memory management (growing and freeing its own storage as needed — heap allocation itself is covered in LAB-08), the null terminator (still present internally, but never managed by the programmer), and out-of-bounds risk on ordinary use.

### Mechanical Walkthrough

- `strcmp(a, b)` — **(a) first appearance.** Compares two C-strings character by character, returning `0` if equal (not `true`/`false` — a `strcmp` quirk inherited from C, where `0` conventionally means "no difference found").

### CS Lens

Every one of `std::string`'s conveniences is built, underneath, on the identical array-plus-length machinery C-strings expose manually — `std::string` is a **class** (full treatment starting LAB-10) wrapping that machinery and providing a safe, uniform interface over it, the same "hide the address, expose a name" abstraction LAB-01 introduced for a single variable, now applied to a whole growable buffer.

### SE Lens

Choosing `std::string` by default, and reaching for a raw C-string only when a specific API demands one (an OS-level call, covered in `S-07`), is this course's standing rule for exactly the reason this unit's proofs demonstrate: every C-string trap above is a *silent* one — no crash, no obvious error, just wrong behavior (`a == b` compiling to something that isn't a text comparison) that's easy to miss in review.

### Connection

Concept Unit 3 builds the real project's first `std::string` values and its first concatenation.

---

## Concept Unit 3: `std::string` — Declaring and Concatenating

### The Problem

The dungeon event log needs to build one text message from several pieces (a floor tag, a player name, an action) at runtime — exactly the concatenation Concept Unit 2 proved doesn't work on C-strings at all.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After Concept Unit 1's `cName` line.
- **Dependencies:** `#include <string>` (already present).

### The New Code

```cpp
std::string playerName = "Zara";
std::string title      = " the Warrior";

std::string fullName = playerName + title;
std::cout << fullName << std::endl;
```

### The Updated Project

```cpp
#include <iostream>
#include <string>

int main() {
    std::cout << "=== Dungeon Event Log ===" << std::endl;
    std::cout << std::endl;

    char cName[10] = "Zara";

    std::string playerName = "Zara";                 // ← new
    std::string title      = " the Warrior";          // ← new

    std::string fullName = playerName + title;        // ← new
    std::cout << fullName << std::endl;                // ← new

    return 0;
}
```

### Concept Lab

No separate throwaway: `playerName + title` already is the smallest possible demonstration of `std::string` concatenation.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
=== Dungeon Event Log ===

Zara the Warrior
```

What that proves: unlike Concept Unit 2's `char` arrays, `+` on two `std::string` values genuinely concatenates their text content and produces a brand-new `std::string` holding both — `fullName` did not exist as a name anywhere before this line; `+` created its value from scratch.

### Mechanical Walkthrough

- `std::string playerName = "Zara";` — **(a) first appearance of declaring a `std::string`.** Unlike Concept Unit 1's `char cName[10]`, no size is specified — `std::string` manages its own storage.
- `playerName + title` — **(a) first appearance of `+` performing string concatenation** — the identical `+` symbol LAB-02 used for arithmetic, here **overloaded** (the same symbol given a different meaning for a different type — full treatment of writing your own overloads in `CPP-S02-LAB-03`) to mean "join these two strings' text."

### CS Lens

An operator whose meaning depends on its operands' types — `+` adds numbers (LAB-02) but concatenates `std::string`s — is **operator overloading**: the same symbol, dispatched to different behavior based on type, decided entirely at compile time here (no runtime cost for the dispatch itself).

### SE Lens

`playerName + title` reading naturally as "join these" is exactly the payoff of overloading `+` for strings rather than requiring a differently-named function (`concat(playerName, title)`) — the operator's meaning tracks the reader's intuition about what `+` "should" do for text, the same way it already does for numbers.

### Connection

Concept Unit 4 builds real functions that use this concatenation to assemble complete log messages.

---

## Concept Unit 4: Building the Event Log — `std::vector`, `push_back`, and `std::to_string`

### The Problem

A single concatenated `fullName` proves the mechanism works, but the actual event log needs *many* messages, built from a player name, a floor number, and an action, collected somewhere that can grow as new events happen.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified substantially.
- **Change type:** Add (three new functions, `main` rewritten).
- **Location:** Function declarations/definitions above `main`; `main`'s body rewritten to use them.
- **Dependencies:** `std::string` concatenation (Concept Unit 3), functions (LAB-05), range-based `for` (new here).

### The New Code

```cpp
#include <vector>

std::string makeFloorTag(int floor);
void        addToLog(std::vector<std::string>& log, const std::string& entry);
void        printLog(const std::vector<std::string>& log);

std::string makeFloorTag(int floor) {
    return "[Floor " + std::to_string(floor) + "]";
}

void addToLog(std::vector<std::string>& log, const std::string& entry) {
    log.push_back(entry);
}

void printLog(const std::vector<std::string>& log) {
    for (const std::string& entry : log) {
        std::cout << entry << std::endl;
    }
    std::cout << std::endl;
    std::cout << "Log contains " << log.size() << " entries." << std::endl;
}
```

### The Updated Project

`main`'s body is replaced entirely:

```cpp
int main() {
    std::cout << "=== Dungeon Event Log ===" << std::endl;
    std::cout << std::endl;

    std::string playerName = "Zara";
    std::vector<std::string> eventLog;

    addToLog(eventLog, makeFloorTag(1) + " " + playerName + " entered the dungeon.");
    addToLog(eventLog, makeFloorTag(1) + " " + playerName + " found a Health Potion (restores 20 HP).");
    addToLog(eventLog, makeFloorTag(2) + " " + playerName + " encountered a Goblin (HP: 10).");
    addToLog(eventLog, makeFloorTag(2) + " " + playerName + " defeated the Goblin and gained 50 XP.");

    printLog(eventLog);

    std::cout << "Player name is " << playerName.length() << " characters long." << std::endl;

    return 0;
}
```

Concept Unit 1–3's C-string and single-concatenation demonstration lines are removed — their job (proving the concept) is done; they were never meant to remain in the finished project, per this schema's own Concept Lab convention, applied here to code that happened to live in `main` rather than a separate scratch file.

### Concept Lab

No separate throwaway: this real code, verified below, is already the smallest useful demonstration of every new piece together.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
=== Dungeon Event Log ===

[Floor 1] Zara entered the dungeon.
[Floor 1] Zara found a Health Potion (restores 20 HP).
[Floor 2] Zara encountered a Goblin (HP: 10).
[Floor 2] Zara defeated the Goblin and gained 50 XP.

Log contains 4 entries.
Player name is 4 characters long.
```

### Mechanical Walkthrough

- `std::to_string(floor)` — **(a) first appearance.** Converts a numeric value to its `std::string` text representation — `std::to_string(2)` returns the two-character string `"2"`, not the number `2` itself; this is what lets an `int` be embedded inside a `+`-concatenated string, since `+` between a `std::string` and a bare `int` has no defined meaning on its own.
- `std::vector<std::string> eventLog;` — **(a) first appearance of `std::vector`**, previewed only, full treatment in `S-02-CPP-DSA-MASTERY`. For this lesson: a dynamically-growable array (LAB-06's array, minus the fixed-size limitation) — declared empty here, with no size specified at all.
- `log.push_back(entry);` — **(a) first appearance.** Appends `entry` to the end of the vector, growing it by one element; `.` (dot) calls a function that belongs to the `log` object itself — the same member-function-call syntax previewed for `std::string` in Concept Unit 2's `strcmp` contrast, made concrete here.
- `std::vector<std::string>& log` (the parameter) — **(a) first appearance of `&` on a function parameter used deliberately for mutation**, briefly previewed as a concept in LAB-05, full treatment in LAB-09 — without it, `addToLog` would receive a *copy* of the vector (LAB-05's pass-by-value default) and `push_back` would only grow that copy, never `main`'s real `eventLog`.
- `for (const std::string& entry : log)` — **(a) first appearance of range-based `for`.** Iterates every element of `log` directly — `entry` is bound to each `std::string` in turn, with no index variable managed by hand, unlike every `for` loop since LAB-04. `const ... &` here means "read each entry without copying it and without permitting modification" — the read-only counterpart to `addToLog`'s mutating reference.
- `log.size()` — **(a) first appearance.** Returns the vector's current element count as a `size_t` — an unsigned integer type (never negative) used throughout the standard library for sizes and indices; mixing `size_t` with a plain `int` in a comparison can produce surprising results if the `int` side is ever negative, worth watching for once index arithmetic involving both appears.

### CS Lens

`push_back` amortized to constant-time growth (the vector occasionally reallocates a larger backing array and copies existing elements over, but rarely enough that the *average* cost per `push_back` stays low) is the exact "amortized growth" idea `CPP-S02-LAB-06`'s `MyVector` builds by hand — `std::vector` here is used, not yet built, but the mechanism is the same one that lesson opens up.

### SE Lens

`makeFloorTag`, `addToLog`, and `printLog` each do exactly one job — build a tag, store an entry, display everything — the identical single-responsibility extraction LAB-05 introduced for `drawGrid`/`getValidInput`, applied now to string and collection logic instead of grid rendering.

### Connection

Concept Unit 5 searches the log this unit built, using `std::string`'s own search operations.

---

## Concept Unit 5: Searching — `.find()` and `std::string::npos`

### The Problem

The event log now holds several messages — finding which ones mention a specific word (like "Goblin") means searching *inside* each string's text, not just comparing whole strings for equality.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After the `.length()` line, before `return 0;`.
- **Dependencies:** `eventLog`, range-based `for` (Concept Unit 4).

### The New Code

```cpp
std::string searchTerm = "Goblin";
std::cout << std::endl;
std::cout << "Searching log for '" << searchTerm << "':" << std::endl;

for (const std::string& entry : eventLog) {
    size_t position = entry.find(searchTerm);

    if (position != std::string::npos) {
        std::cout << "  Found at position " << position << ": " << entry << std::endl;
    }
}
```

### The Updated Project

Appended after `main`'s `.length()` line, before `return 0;` — every line from Concept Unit 4 through here now appears in `main.cpp` in the order introduced.

### Concept Lab

No separate throwaway: this is already the smallest real demonstration, run directly against the actual event log.

Run it — verified this session:

```
$ ./dungeon.exe
...
Searching log for 'Goblin':
  Found at position 29: [Floor 2] Zara encountered a Goblin (HP: 10).
  Found at position 28: [Floor 2] Zara defeated the Goblin and gained 50 XP.
```

**Correcting this lesson's own earlier draft before repeating it:** an earlier version of this material claimed positions `30` and `16` for these two entries. The real, verified positions are `29` and `28` — worth showing precisely because "exact positions depend on the full string length" is true, but that's a reason to *compile and check*, not a license to write down a plausible-looking number without running it, which is exactly the mistake being corrected here.

What that proves: `.find(searchTerm)` scans each `entry` for the first occurrence of `"Goblin"`'s exact text, returning the zero-based index where it starts. Both entries containing "Goblin" were found and printed; the two entries that don't mention it (the "entered the dungeon" and "found a Health Potion" lines) were silently skipped — their `.find()` calls returned `std::string::npos`, a special sentinel value meaning "not found," which failed the `!= npos` check and never entered the `if` block.

### Mechanical Walkthrough

- `entry.find(searchTerm)` — **(a) first appearance.** Searches `entry`'s text for the first occurrence of `searchTerm`'s text, returning the starting index if found.
- `std::string::npos` — **(a) first appearance.** A constant (in practice, the maximum possible value of `size_t`) that `.find()` returns specifically to signal "not found" — not `-1` (which `size_t`, being unsigned, cannot represent meaningfully) and not `0` (which would be indistinguishable from "found at the very start").

### CS Lens

`.find()` returning a sentinel value rather than, say, throwing an error or returning a negative number, is the same **sentinel-value pattern** Concept Unit 1 introduced for C-strings (`'\0'` marking "no more characters") — here applied to "no match found" instead of "no more text."

### SE Lens

Checking `position != std::string::npos` before using `position` is not optional defensive style — using an unchecked `.find()` result as if it were always a valid index is a real bug class: `std::string::npos`, being the *maximum* possible `size_t` value, used as an index elsewhere would either be caught immediately as absurdly out of range, or, worse, silently misbehave depending on what it's used for. Always check against `npos` before trusting a `.find()` result.

### Connection

This closes every new string and container concept in this lesson — the Closing section traces one message through the whole assembled program.

---

## Closing

### Connect the pieces

Follow the "Goblin" message end to end: `makeFloorTag(2)` (Concept Unit 4) calls `std::to_string(2)`, producing `"2"`, concatenated (Concept Unit 3's `+`, overloaded for `std::string`) into `"[Floor 2]"`. That's concatenated again with `playerName` and the action text, producing the full message, which `addToLog` (Concept Unit 4) pushes into `eventLog` via `push_back`, reachable only because `addToLog`'s `std::vector<std::string>& log` parameter is a reference (LAB-09 preview) to `main`'s real vector, not a copy. `printLog`'s range-based `for` (Concept Unit 4) later reads that same entry back out, by reference again, to print it. Finally, Concept Unit 5's search loop calls `.find("Goblin")` on that same string, finds it at the real, verified index `29`, and prints it — one string, built from a C-string-shaped problem (Concept Unit 1) that `std::string` and `std::vector` solved by managing size, comparison, and growth automatically, at every step.

### What breaks without this

Attempting `cName = "Lyra";` on Concept Unit 1's `char cName[10]` (reasoned through, matching this unit's own Watch for — a `char` array cannot be reassigned wholesale with `=` the way a `std::string` can) does not compile at all: an array name is not an assignable target the way a `std::string` variable is. Contrast this with `playerName = "Lyra";` on the real `std::string`, which works exactly as expected — this is not a minor syntax difference; it's a structural reason `std::string` was introduced in the first place, felt directly rather than just described.

### Exercises

1. Change `playerName = "Zara"` to `playerName = "Sir Reginald the Bold"`, rebuild, and confirm all four log entries update automatically — the messages were built at runtime from `playerName`, not hardcoded per entry.
2. Verify, for real, that `entry.substr(0, 9)` on any log entry returns exactly the `"[Floor N]"` tag portion (adjust the length for single- vs. double-digit floor numbers) — compile and run it, don't predict it.
3. Build this lesson's `buildMessage` Challenge — `std::string buildMessage(const std::string& actor, const std::string& verb, const std::string& target, int floor)`, returning `"[Floor N] Actor verb target."` — call it with `buildMessage("Zara", "discovered", "a hidden room", 3)`, add its result to the log, and confirm it prints and searches correctly alongside the other four entries.
4. Write a small standalone program comparing two `char` arrays holding the same text with `==` (reproducing Concept Unit 2's proof) and the identical two texts as `std::string` values with `==` — confirm the `char`-array version evaluates false (or warns, per `-Warray-compare`) while the `std::string` version evaluates true, both compiled and run for real.

### Definition of done

- [ ] `main.cpp` builds a log from `std::string` concatenation, stores entries in a `std::vector<std::string>`, and searches them with `.find()`/`npos`.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra` in its final, committed form (Concept Unit 1–2's deliberately-warning-producing scratch comparisons are not part of the committed file).
- [ ] Output matches this lesson's verified run exactly, including the real (not guessed) `.find()` positions.
- [ ] You can state, from Concept Unit 2's own proof, why `==` on two `char` arrays does not compare their text.
- [ ] You can explain why `std::string::npos` exists and what checking against it protects against.
- [ ] All four Exercises completed with real compiled output.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-07: dungeon event log built with std::string concatenation, std::vector storage, and substring search"` — states why (a working, growable message log, every position verified) not just what changed.
