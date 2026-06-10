# C++ Masterclass — S-01 — LAB 07 — Strings

**Prerequisites:** LAB 06. You know arrays and how they map to memory.

**What this lab adds:**
- `char` arrays as C-strings — the "before" picture that explains why `std::string` exists
- The null terminator `\0` — how C-strings know where they end
- `std::string` — the standard library string type and what it hides
- Common string operations: length, concatenation, comparison, finding, substring
- Building formatted output by constructing strings before printing
- A dungeon event log — messages assembled from parts at runtime

**Time:** ~65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You know that a `char` array of size 10 holds 10 characters. So how does
>    a function like `strlen` (string length) know where the string ends?
>    What tells it "this is the last character"?
> 2. Can you compare two `char` arrays with `==`? What do you predict happens?
> 3. Predict: If `name = "Zara"` and you write `name + " the Warrior"`, what
>    does C++ produce? Is it what you expect?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A **dungeon event log** — a program that assembles and prints formatted game messages
from runtime data, exactly as the RPG engine will do in Series 09:

```
=== Dungeon Event Log ===

[Floor 1] Zara entered the dungeon.
[Floor 1] Zara found a Health Potion (restores 20 HP).
[Floor 2] Zara encountered a Goblin (HP: 10).
[Floor 2] Zara defeated the Goblin and gained 50 XP.

Log contains 4 entries.
Player name is 4 characters long.
```

---

## Part 1 — The Problem: C-Strings

### Concept: C-Strings — Arrays of `char` with a Null Terminator

**What they are:** In C (the predecessor to C++), strings are represented as arrays
of `char` where the last character is the **null terminator**: `'\0'` (the character
with ASCII value 0). Functions that work with C-strings read characters until they
hit `'\0'` — that is how they know where the string ends.

```cpp
char name[6] = {'Z', 'a', 'r', 'a', '\0', ???};
//                                    ↑ string ends here — index 4 is '\0'
//                                                  index 5 is unused
```

Or equivalently (the compiler adds `'\0'` automatically for string literals):
```cpp
char name[6] = "Zara";   // "Zara" is 4 chars + '\0' = 5 bytes; [5] is unused
```

**The problems with C-strings:**
1. **Manual size management:** You must declare the array large enough for the
   string plus the null terminator. Forget this, and the null terminator overwrites
   the next variable.
2. **No concatenation with `+`:** `name + " the Warrior"` does not work — you get
   address arithmetic, not a new string.
3. **No comparison with `==`:** `name == "Zara"` compares addresses, not content.
   You must call `strcmp(name, "Zara") == 0` instead.
4. **Fixed size:** You cannot add characters beyond the declared size.

These are all real problems you will encounter in the S-07 Shell series when working
with OS-level APIs that still use C-strings. Understanding them now makes those labs
much clearer.

---

### Concept: `std::string` — The Managed String Type

**What it is:** A class in the standard library that manages a dynamically sized
sequence of characters. It solves every C-string problem:

| Problem | C-string | `std::string` |
|---------|----------|----------------|
| Size management | Manual | Automatic — grows as needed |
| Concatenation | `strcat` (unsafe) | `name + " the Warrior"` |
| Comparison | `strcmp(a, b) == 0` | `a == b` |
| Length | `strlen(name)` | `name.length()` |
| Fixed size | Yes — must pre-allocate | No — dynamically allocated |

**What it hides:**
- Heap memory allocation and deallocation (the string grows by allocating from the heap
  and frees that memory when the `std::string` goes out of scope)
- The null terminator (still present internally, but you never manage it)
- Buffer overflow risk (the class checks bounds in debug mode and resizes when needed)

**The protected invariant:** A `std::string` always holds a valid, properly terminated
string. You can read `.length()`, concatenate with `+`, and compare with `==` without
worrying about memory or null terminators.

**`#include <string>`:** `std::string` lives in `<string>`. However, you often get it
for free when you include `<iostream>`, since `iostream` uses strings internally.
To be explicit and safe, always `#include <string>` when you use `std::string`.

**Watch for:** `std::string` cannot store a null byte in the middle of the string as
a terminator the way C-strings can. If you are working with binary data (not text),
use `std::vector<char>` instead.

---

## Step 1 — Demonstrate C-String Problems, Then Switch

Build the demo that shows both the problem and the solution. Start a new `main.cpp`:

```cpp
#include <iostream>    // std::cout, std::endl
#include <string>      // std::string — the managed string type

int main() {
    std::cout << "=== Dungeon Event Log ===" << std::endl;
    std::cout << std::endl;

    // ── C-string (the old way — shown for comparison) ────────────────────────
    char cName[10] = "Zara";          // 4 chars + '\0' — must manually size the array
    // cName = "Lyra";                // ERROR: can't reassign a C-string with =
    // std::string built = cName + " the Warrior"; // ERROR: + doesn't work this way

    // ── std::string (the right way) ──────────────────────────────────────────
    std::string playerName = "Zara";          // no size limit, no null terminator concern
    std::string title      = " the Warrior";  // another string

    std::string fullName = playerName + title;  // concatenation with +
    std::cout << fullName << std::endl;          // prints: Zara the Warrior

    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
=== Dungeon Event Log ===

Zara the Warrior
```

**Change something:** Change `playerName = "Zara"` to `playerName = "Sir Reginald the Bold"`.
Recompile. The full name updates automatically — no array resize needed. Change back.

---

## Part 2 — String Operations

### Concept: String Member Functions — Operating on the String

**What they are:** Functions attached to the `std::string` type that you call with
the dot `.` operator. Because `std::string` is a class (covered in depth in S-01 LAB 10),
its operations live "inside" the object.

**The most important operations:**

| Operation | Syntax | Returns | Description |
|-----------|--------|---------|-------------|
| Length | `s.length()` or `s.size()` | `size_t` | Number of characters |
| Is empty? | `s.empty()` | `bool` | True if length is 0 |
| Find | `s.find("sub")` | `size_t` | Index of first match, or `std::string::npos` if not found |
| Substring | `s.substr(start, len)` | `std::string` | Copy of len chars starting at start |
| Starts with | `s.starts_with("pre")` | `bool` | C++20 — check prefix |
| Append | `s += " more"` | — | Add to end of string |
| Compare | `s == "other"` | `bool` | Content equality |

**`size_t`:** An unsigned integer type used for sizes and indices. On 64-bit systems
it is 8 bytes. It is the return type of `.length()` because string lengths are
non-negative. Be careful mixing `size_t` with `int` in comparisons — a `size_t`
cannot be negative, so `-1 < s.length()` may give unexpected results.

**`std::string::npos`:** A special constant value (typically the maximum value of `size_t`)
that `.find()` returns to signal "not found." Always check against `npos` before using
the result of `.find()`.

---

## Step 2 — Build the Event Log Functions

Add string utility functions and the event log system. Add before `main`:

```cpp
#include <iostream>
#include <string>
#include <vector>      // ← add: for storing the log (covered fully in S-02; treat as "dynamic array")

// ── Forward declarations ─────────────────────────────────────────────────────
std::string makeFloorTag(int floor);
void        addToLog(std::vector<std::string>& log, const std::string& entry);
void        printLog(const std::vector<std::string>& log);

// ── Definitions ──────────────────────────────────────────────────────────────
// Builds a "[Floor N]" prefix string
std::string makeFloorTag(int floor) {
    return "[Floor " + std::to_string(floor) + "]";
    //              ↑ concatenation    ↑ converts int to string
}

// Adds one entry to the log
void addToLog(std::vector<std::string>& log, const std::string& entry) {
    log.push_back(entry);   // adds to the end of the dynamic list
}

// Prints all entries and a summary
void printLog(const std::vector<std::string>& log) {
    for (const std::string& entry : log) {      // range-based for loop over a vector
        std::cout << entry << std::endl;
    }
    std::cout << std::endl;
    std::cout << "Log contains " << log.size() << " entries." << std::endl;
}
```

**`std::to_string(floor)` explained:** Converts a numeric value to its text
representation. `std::to_string(42)` returns the `std::string` `"42"`.
This is how you embed numbers inside strings.

**`std::vector<std::string>` — a preview:** `vector` is a dynamic array that can
grow at runtime (full coverage in S-02 Snake). Here it stores the log entries.
You call `push_back` to add an entry. The `&` in `std::vector<std::string>& log`
is a reference — the function works on the original vector, not a copy (covered fully
in LAB 09).

**`for (const std::string& entry : log)` — range-based for:** This is the modern
C++ loop for iterating every element of a collection without managing indices.
`entry` is a reference to each `std::string` in the vector. `const` prevents
modification. Full coverage when we use this pattern in S-02.

---

## Step 3 — Populate the Log

Replace the `main()` body:

```cpp
int main() {
    std::cout << "=== Dungeon Event Log ===" << std::endl;
    std::cout << std::endl;

    std::string playerName = "Zara";
    std::vector<std::string> eventLog;   // empty dynamic list of strings

    // Build log entries by concatenating strings at runtime
    addToLog(eventLog, makeFloorTag(1) + " " + playerName + " entered the dungeon.");
    addToLog(eventLog, makeFloorTag(1) + " " + playerName + " found a Health Potion (restores 20 HP).");
    addToLog(eventLog, makeFloorTag(2) + " " + playerName + " encountered a Goblin (HP: 10).");
    addToLog(eventLog, makeFloorTag(2) + " " + playerName + " defeated the Goblin and gained 50 XP.");

    printLog(eventLog);

    // String operations demo
    std::cout << "Player name is " << playerName.length() << " characters long." << std::endl;

    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:**
```
=== Dungeon Event Log ===

[Floor 1] Zara entered the dungeon.
[Floor 1] Zara found a Health Potion (restores 20 HP).
[Floor 2] Zara encountered a Goblin (HP: 10).
[Floor 2] Zara defeated the Goblin and gained 50 XP.

Log contains 4 entries.
Player name is 4 characters long.
```

**Change something:** Change `playerName = "Zara"` to `playerName = "Sir Reginald"`.
Recompile. All four log entries update because they are built at runtime from `playerName`.
Change back to `"Zara"`.

---

## Part 3 — Finding and Examining Strings

## Step 4 — Use `find` and `substr`

Add a search demo at the end of `main()`:

```cpp
    // Find a specific entry in the log
    std::string searchTerm = "Goblin";
    std::cout << std::endl;
    std::cout << "Searching log for '" << searchTerm << "':" << std::endl;

    for (const std::string& entry : eventLog) {
        size_t position = entry.find(searchTerm);    // returns index if found, npos if not

        if (position != std::string::npos) {         // npos means "not found"
            std::cout << "  Found at position " << position << ": " << entry << std::endl;
        }
    }
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see** (after the log and length line):
```
Searching log for 'Goblin':
  Found at position 30: [Floor 2] Zara encountered a Goblin (HP: 10).
  Found at position 16: [Floor 2] Zara defeated the Goblin and gained 50 XP.
```

*(Exact positions depend on the full string length.)*

---

## 🎯 Challenge: `buildMessage` Function

**You know:** String concatenation, `std::to_string`, function return values.

**Task:** Write a function:
```cpp
std::string buildMessage(const std::string& actor,
                         const std::string& verb,
                         const std::string& target,
                         int floor);
```
That returns a complete log message in this format:
`"[Floor N] Actor verb target."`

Example call:
```cpp
buildMessage("Zara", "discovered", "a hidden room", 3)
```
Should return:
```
"[Floor 3] Zara discovered a hidden room."
```

Add it to the log and print.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
std::string buildMessage(const std::string& actor,
                         const std::string& verb,
                         const std::string& target,
                         int floor) {
    return "[Floor " + std::to_string(floor) + "] "
           + actor + " " + verb + " " + target + ".";
}

// In main():
addToLog(eventLog, buildMessage("Zara", "discovered", "a hidden room", 3));
```

**Key insight:** Functions that build and return strings are one of the most common
patterns in game development — every formatted UI element, every dialog box, every
log entry is built by a function like this. The pattern is simple: concatenate
the pieces with `+`, return the result. In S-09 (RPG Engine), this becomes your
UI rendering layer.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| C-string limitation shown | Comment `cName = "Lyra"` compiles with an error (assignment to array) |
| `std::string` concatenation | `playerName + title` produces `"Zara the Warrior"` |
| `std::to_string` | `makeFloorTag(2)` returns `"[Floor 2]"` |
| `push_back` | After 4 `addToLog` calls, `log.size()` returns 4 |
| `printLog` output | All 4 entries print, followed by the count |
| `.length()` | `"Zara".length()` returns 4 |
| `.find` | Both Goblin entries are found; non-Goblin entries are skipped |
| `std::string::npos` | The `!= npos` check correctly filters entries without "Goblin" |

---

## Quick Check Answers

**1. How does `strlen` know where a C-string ends?**
It reads characters one at a time, starting at the base address, and stops when it
finds a `'\0'` (null terminator, ASCII value 0). The array must contain this
terminator after the last real character. If the null terminator is missing (e.g.,
you fill the entire array with non-null characters), `strlen` reads past the array
into adjacent memory — undefined behavior. This is why C-strings require their array
to be one element larger than the string's visible length.

**2. Can you compare two `char` arrays with `==`?**
The code compiles, but it does not compare content — it compares **addresses**. Since
two different arrays occupy different memory locations, `char a[] = "hello"; char b[] = "hello"; a == b` evaluates to `false` even though the content is identical.
To compare C-string content, you must use `strcmp(a, b) == 0`. This is one of the key
reasons `std::string` was introduced — `s1 == s2` on two `std::string` objects correctly
compares content.

**3. What does `name + " the Warrior"` produce for a `char` array?**
Pointer arithmetic — a new pointer advanced by the value of `" the Warrior"`'s address.
The `+` operator on a `char*` adds an integer offset to the address. This is not string
concatenation. The result is a dangling, meaningless address that will likely crash the
program when dereferenced. With `std::string`, `name + " the Warrior"` works as
expected and produces a new string with both parts joined.
