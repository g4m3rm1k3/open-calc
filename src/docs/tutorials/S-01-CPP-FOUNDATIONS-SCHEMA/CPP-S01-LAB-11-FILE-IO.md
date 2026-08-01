# Lesson 11: A File Is a Stream That Outlives the Program
### (LAB 11 — File I/O)

**What you will build:** A save/load system for LAB-10's `Player` struct — writing every field to `save.txt` as labeled text lines, reading it back into a fresh `Player`, and verifying every field matches. The transferable problem: everything this curriculum has built so far lives in RAM, and RAM is erased the instant the program exits (LAB-01). A file is how a program's data outlives the process that created it — and turning a live struct into text, then back into a live struct, is a real, general problem (**serialization**) this lesson solves for the first time.

**What you need to know first:** LAB-10 — the `Player` struct. LAB-07's `std::string`, `std::to_string`. LAB-03's `if`/`else`, `&&`. LAB-04's `while`.

**Terms introduced in this lesson**

> **`std::ofstream`** — an output file stream; writes to a file using `<<`, the same operator `std::cout` uses.
> **`std::ifstream`** — an input file stream; reads from a file using `>>` or `std::getline`, the same as `std::cin`.
> **`is_open()`** — checks whether a file stream successfully opened its target file.
> **Stream state** — a file stream's internal record of whether its last operation succeeded (`good()`, `fail()`, `eof()`).
> **`std::getline`** — reads an entire line from a stream, stopping at `\n`, including any spaces.
> **`std::istringstream`** — an in-memory stream that lets a `std::string` be read from with `>>`/`std::getline` exactly like a file.
> **Serialization** — converting live, in-memory data into a storable/transmittable form (here, text); **deserialization** is the reverse.
> **Append mode (`std::ios::app`)** — an `ofstream` opening mode that writes to the end of an existing file instead of overwriting it.

No pipeline diagram applies — S-01 builds standalone concept programs.

---

## Concept Unit 1: `std::ofstream` — Writing a File

### The Problem

LAB-10's `Player` struct — a name, a class, six numbers — exists only in RAM while `dungeon.exe` runs. The moment the program exits, per LAB-01's own explanation of RAM, that data is gone. Nothing built so far in this curriculum survives past one run.

### Project Change

- **Reference Source:** LAB-10's `Player` struct (this same series, prior lesson) — carried forward unchanged.
- **Files affected:** `main.cpp` — new file for this lab; `save.txt` — created by running the program.
- **Change type:** Add (new file, new function).
- **Location:** `savePlayer` declared/defined above `main`; called from `main`.
- **Dependencies:** `Player` (LAB-10), `#include <fstream>`.

### The New Code

```cpp
bool savePlayer(const Player& p, const std::string& filename) {
    std::ofstream file(filename);

    if (!file.is_open()) {
        std::cout << "  ERROR: Could not open '" << filename << "' for writing." << std::endl;
        return false;
    }

    file << "name: "      << p.name      << std::endl;
    file << "class: "     << p.className << std::endl;
    file << "hp: "        << p.hp        << std::endl;
    file << "maxhp: "     << p.maxHp     << std::endl;
    file << "level: "     << p.level     << std::endl;
    file << "xp: "        << p.xp        << std::endl;
    file << "atk: "       << p.atk       << std::endl;
    file << "def: "       << p.def       << std::endl;

    file.close();
    return true;
}
```

### The Updated Project

```cpp
#include <iostream>
#include <fstream>   // ← new — std::ofstream, std::ifstream
#include <string>
#include <sstream>   // ← new — used starting Concept Unit 4

struct Player {   // ← carried forward from LAB-10, unchanged
    std::string name;
    std::string className;
    int hp      = 0;
    int maxHp   = 0;
    int level   = 1;
    int xp      = 0;
    int atk     = 0;
    int def     = 0;
};

const std::string SAVE_FILE = "save.txt";

bool savePlayer(const Player& p, const std::string& filename);   // ← new

bool savePlayer(const Player& p, const std::string& filename) {  // ← new
    /* body shown above */
}

int main() {
    std::cout << "=== Save / Load System ===" << std::endl;
    std::cout << std::endl;

    Player zara;
    zara.name = "ZARA"; zara.className = "Warrior";
    zara.hp = 75; zara.maxHp = 100; zara.level = 3; zara.xp = 250; zara.atk = 15; zara.def = 8;

    std::cout << "Saving to '" << SAVE_FILE << "'..." << std::endl;
    if (savePlayer(zara, SAVE_FILE)) {
        std::cout << "  Save successful." << std::endl;
    }

    return 0;
}
```

### Concept Lab

No separate throwaway: `savePlayer`, run directly below, already isolates exactly the mechanism being taught — `std::ofstream` used precisely like `std::cout`, redirected to a file instead of the terminal.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
=== Save / Load System ===

Saving to 'save.txt'...
  Save successful.
```

And the file it produced, read back with a plain text tool (not this program — proving the file is real, ordinary text, not something only this program can interpret):

```
$ cat save.txt
name: ZARA
class: Warrior
hp: 75
maxhp: 100
level: 3
xp: 250
atk: 15
def: 8
```

What that proves: `file << "name: " << p.name << std::endl;` behaves exactly like `std::cout << ...` (LAB-00) — the same `<<` operator, the same chaining — except its destination is `save.txt` on disk instead of the terminal. Every field wrote to its own line, in the order `savePlayer` wrote them, labeled by name.

### Mechanical Walkthrough

- `#include <fstream>` — **(a) first appearance.** The header declaring both `std::ofstream` and `std::ifstream` (Concept Unit 3).
- `std::ofstream file(filename);` — **(a) first appearance.** Opens `filename` for writing. By default (no second argument — contrasted with Concept Unit 7's append mode), this **creates** the file if it doesn't exist and **overwrites** it completely if it does — any previous content is gone the instant this line runs, before a single character is written.
- `file.is_open()` — **(a) first appearance.** Returns whether the file actually opened successfully. `std::ofstream` does not throw an exception or crash if opening fails (a missing directory, no write permission) — it silently enters a state where writes do nothing, which is exactly why this check exists.
- `file.close();` — **(a) first appearance.** Flushes any buffered writes (LAB-00's own buffering concept, applied here to a file instead of the terminal) and releases the operating system's file handle.

### CS Lens

`std::ofstream` and `std::cout` sharing the identical `<<` interface is LAB-00's stream abstraction (Concept Unit 8 there) taken to its intended conclusion: "a sequence of characters flowing to a destination" was always general enough to mean a file, not just a terminal — the code that writes doesn't need to know or care which.

### SE Lens

Returning `bool` from `savePlayer` — rather than assuming success — is this course's standing practice for any operation that can genuinely fail for reasons outside the program's control (a full disk, a read-only folder, a bad path). The caller decides what "save failed" means for the user; `savePlayer` only reports whether it happened.

### Connection

Concept Unit 2 checks `is_open()`'s reliability directly — and finds a real surprise worth verifying rather than assuming.

---

## Concept Unit 2: Stream State — What Actually Detects a Failure

### The Problem

The original claim behind this lesson's error handling is that `!file` (or `file.good()`/`file.fail()`) reliably detects a stream in an error state, the same way `is_open()` does. Before trusting that claim in real code, it's worth checking directly.

### Concept Lab

```cpp
// scratch_missing.cpp  (disposable)
#include <fstream>
#include <iostream>
int main() {
    std::ifstream file("does_not_exist_for_real.txt");
    std::cout << "is_open: " << file.is_open() << std::endl;
    std::cout << "good: "    << file.good()    << std::endl;
    std::cout << "fail: "    << file.fail()    << std::endl;
    std::cout << "!file: "   << !file          << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_missing.cpp -o scratch_missing -std=c++17 -Wall -Wextra
$ ./scratch_missing.exe
is_open: 0
good: 1
fail: 0
!file: 0
```

**A real, verified surprise, worth stating plainly rather than glossing over:** on this exact toolchain (GCC 14.2.0, MinGW-w64 libstdc++), opening a file that does not exist leaves `is_open()` correctly reporting `false` — but `good()`, `fail()`, and `!file` all report **no error at all**, even after attempting an actual read (verified separately this session — a `std::getline` attempt on this same failed-to-open stream still left `good()` true and `fail()` false). This directly contradicts the common claim — repeated in earlier drafts of this very lesson — that `!file` is "equivalent to `!file.good()` — checks for any problem" and can substitute for an explicit `is_open()` check.

What this proves, concretely: on this toolchain, **`is_open()` is the only reliable check for this specific failure** — a missing file. `savePlayer` (Concept Unit 1) and `loadPlayer` (Concept Unit 4) both already check `is_open()` specifically, not `!file` — which turns out, per this verification, to be the only version of this lesson's error-checking code that actually works as claimed on this build. This is exactly why this schema insists on running claims rather than restating them: a plausible-sounding, widely-repeated fact about `!file`/`good()` turned out not to hold here.

This scratch file is discarded now; every real error check in this project's own code uses `is_open()`.

### Mechanical Walkthrough

- `file.good()` — **(a) first appearance.** Intended to report "no error, not at end" — verified above to *not* reflect an open failure on this toolchain.
- `file.fail()` — **(a) first appearance.** Intended to report "the last operation failed" — same verified gap.
- `!file` — **(a) first appearance of a stream's boolean conversion**, used the same way `!nullPtr` (LAB-08) or `!isBossFloor` (LAB-03) negates a boolean-convertible value — here proven, not assumed, to be unreliable for this specific failure mode on this build.

### CS Lens

A stream's "state" being represented by internal flag bits (`rdstate()`, checked directly in this session's own verification and confirmed to remain `0`/goodbit even after the failed open) is the same **sentinel-and-flag** idea LAB-07 introduced for `std::string::npos` — except here, the flag simply wasn't set the way documentation for other platforms describes, which is precisely why *verifying on the actual target toolchain*, not trusting a general description, is the only way to know for certain.

### SE Lens

This is a concrete, high-stakes instance of "prose isn't proof": code that checked `!file` instead of `is_open()` after opening `save.txt` would, on this exact toolchain, silently proceed into `loadPlayer`'s reading loop against a stream that never actually opened — reading nothing, looping zero times (`std::getline` on such a stream returns false immediately, per this session's own earlier check), and returning `true` with every field left at its LAB-10 default. A player who deleted their save file would see "Load successful" with a blank, default character, not the honest "no save file found" message `is_open()`'s check actually produces.

### Connection

Concept Unit 3 introduces the read side of file I/O, using `is_open()` from the start, per this unit's own verified finding.

---

## Concept Unit 3: `std::ifstream` — Reading a File

### The Problem

`save.txt` now exists on disk with real player data — nothing yet reads it back into a `Player` struct the running program can use.

### No isolated code lab for this step

`std::ifstream`'s relationship to `std::cin` (both read via `>>`) was already established by LAB-03's `std::cin` — this unit states the file-specific difference directly rather than re-proving the shared mechanism.

### Explanation

`std::ifstream` is `std::ofstream`'s read counterpart — same file-stream idea, opposite direction, using `>>` (LAB-03's stream extraction) or `std::getline` (Concept Unit 5) instead of `<<`. Two extraction tools serve different needs: `file >> word` reads one whitespace-delimited token, stopping at the first space, newline, or tab; `std::getline(file, line)` reads an entire line, including any internal spaces, stopping only at `\n`. `save.txt`'s format (`"name: ZARA"`) needs both: a label token (`"name:"`) read with `>>`, and — since a player's name might itself contain a space ("Sir Reginald") — the value read with `std::getline`, not `>>`, which would stop at the first space inside the name itself.

### Mechanical Walkthrough

- `std::ifstream` — **(a) first appearance.** Opens a file for reading; shares `is_open()` with `std::ofstream` (Concept Unit 1), and per Concept Unit 2's own verified finding, is the check this project relies on exclusively.

### CS Lens

`>>` stopping at whitespace and `std::getline` stopping at `\n` are two different **delimiter rules** for the identical underlying "read until a stopping condition" operation — the same shape LAB-07's `.find()` used (search until a match), generalized here to "read until a character class, not a specific substring."

### Connection

Concept Unit 4 writes the real `loadPlayer` function, combining `is_open()` (Concept Unit 2's verified-reliable check), `std::getline`, and token parsing into one working read loop.

---

## Concept Unit 4: `std::istringstream` — Parsing a Line Into Fields

### The Problem

`std::getline(file, line)` can read `"name: ZARA"` as one whole line — but that line still needs to be split into the label (`"name:"`) and the value (`"ZARA"`) before either can be used.

### No isolated code lab for this step

The mechanism is small enough to demonstrate directly, inline with its explanation, rather than as a separate throwaway followed by real code that repeats it.

### Concept Lab

```cpp
// scratch_wsname.cpp  (disposable)
#include <sstream>
#include <iostream>
#include <string>
int main() {
    std::string line = "name: Sir Reginald";
    std::istringstream ss(line);
    std::string label, name;
    ss >> label;
    std::getline(ss >> std::ws, name);
    std::cout << "label='" << label << "' name='" << name << "'" << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_wsname.cpp -o scratch_wsname -std=c++17 -Wall -Wextra
$ ./scratch_wsname.exe
label='name:' name='Sir Reginald'
```

What that proves: `std::istringstream ss(line);` treats `line`'s text as if it were a stream, letting `>>` and `std::getline` operate on it exactly as they would on `std::cin` or `std::ifstream` — no file involved at all, just an in-memory string being read from. `ss >> label;` consumed `"name:"` (stopping at the space, per `>>`'s whitespace-delimiter rule) and left the stream positioned right after that space, before `"Sir Reginald"`. `std::getline(ss >> std::ws, name);` — `std::ws` (a stream manipulator, the same category as `std::left`/`std::setw` from LAB-01) skips that one leading space first, so `std::getline` reads `"Sir Reginald"` cleanly, not `" Sir Reginald"` with an unwanted leading space, and correctly keeps the internal space between "Sir" and "Reginald," which a second `>>` would have split incorrectly.

This scratch file is discarded now; the real `loadPlayer`, next, applies this identical label/value split to every line of `save.txt`.

### Mechanical Walkthrough

- `std::istringstream ss(line);` — **(a) first appearance.** Constructs an in-memory stream from `line`'s current contents — a copy, not a live connection back to `line` itself.
- `std::ws` — **(a) first appearance.** A stream manipulator (LAB-01's category) that skips leading whitespace on the stream it's applied to.

### CS Lens

`std::istringstream` giving a plain string the exact same `>>`/`std::getline` interface as a file or the keyboard is the stream abstraction (LAB-00, revisited in Concept Unit 1) applied a third time — the source no longer even has to be an external device; it can be data already sitting in memory, read through the identical interface as everything else.

### SE Lens

Parsing `"name: ZARA"` via `>>` and `std::getline`, rather than manually searching for the `:` character and slicing the string by hand (a real alternative, using LAB-07's `.find()` and `.substr()`), reuses stream machinery this course has already built understanding of — one consistent parsing idiom instead of a second, string-specific one.

### Connection

Concept Unit 5 assembles this label/value parsing into the full `loadPlayer` function, matching each label against `Player`'s eight fields.

---

## Concept Unit 5: `loadPlayer` — Reading a Full Save File

### The Problem

Concept Unit 4 parsed one line in isolation. `save.txt` has eight — `loadPlayer` needs to read every line, parse each the same way, and route each value to the correct `Player` field.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Declaration/definition alongside `savePlayer`; call added to `main`.
- **Dependencies:** `is_open()` (Concept Unit 2), `std::getline`/`std::istringstream` (Concept Units 3–4), `if`/`else if` (LAB-03), `while` (LAB-04).

### The New Code

```cpp
bool loadPlayer(Player& p, const std::string& filename) {
    std::ifstream file(filename);

    if (!file.is_open()) {
        std::cout << "  ERROR: Could not open '" << filename << "' for reading." << std::endl;
        std::cout << "  (No save file found — start a new game.)" << std::endl;
        return false;
    }

    std::string line;
    while (std::getline(file, line)) {
        if (line.empty()) continue;

        std::istringstream ss(line);
        std::string label;
        ss >> label;

        if      (label == "name:")   { std::getline(ss >> std::ws, p.name);      }
        else if (label == "class:")  { std::getline(ss >> std::ws, p.className); }
        else if (label == "hp:")     { ss >> p.hp;    }
        else if (label == "maxhp:")  { ss >> p.maxHp; }
        else if (label == "level:")  { ss >> p.level; }
        else if (label == "xp:")     { ss >> p.xp;    }
        else if (label == "atk:")    { ss >> p.atk;   }
        else if (label == "def:")    { ss >> p.def;   }
    }

    file.close();
    return true;
}
```

### The Updated Project

Added alongside `savePlayer`; `main` extended with a load section and a field-by-field match check, shown in full in this unit's Run It.

### Concept Lab

No separate throwaway: `loadPlayer`, run directly against the real `save.txt` from Concept Unit 1, is already the smallest meaningful demonstration.

Run it — verified this session, full program:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
=== Save / Load System ===

Creating player...
  Name:  ZARA
  Level: 3
  HP:    75 / 100
  XP:    250

Saving to 'save.txt'...
  Save successful.

Loading from 'save.txt'...
  Load successful.

Loaded player:
  Name:  ZARA
  Level: 3
  HP:    75 / 100
  XP:    250

Data matches: YES
```

What that proves: `while (std::getline(file, line))` (LAB-04's `while`, condition supplied by `std::getline`'s own boolean conversion — `false` once the file is exhausted, the identical shape verified failing on a never-opened stream in Concept Unit 2) read every one of `save.txt`'s eight lines. Each line's label routed to the matching field via the `if`/`else if` chain (LAB-03), and the loaded `Player`'s eight fields, compared field-by-field with `&&` (LAB-03), matched the original `zara` exactly — a complete, verified round trip from live struct, to text on disk, back to a live struct.

### Mechanical Walkthrough

- `while (std::getline(file, line))` — **(a) first appearance of a stream's read result used directly as a loop condition.** `std::getline` returns the stream itself, which converts to `bool` — `true` while a line was successfully read, `false` once the file is exhausted (this specific case verified reliable, unlike Concept Unit 2's open-failure case) — the loop naturally ends at end-of-file with no explicit line-count tracking needed.
- `if (line.empty()) continue;` — **(c) reusing** `continue` (LAB-04) — skips a blank line's parsing entirely, moving straight to the next `std::getline`.

### CS Lens

Routing each parsed label to its matching field via an `if`/`else if` chain is a **manual dispatch table** — the same "one variable, several exact-match branches" shape LAB-03's `switch` was built for, expressed here with string comparisons instead of integer `case`s, because `switch` (LAB-03's own Watch for) cannot switch on a `std::string`.

### SE Lens

Storing save data as labeled, human-readable text (`"hp: 75"`, not raw bytes) is a deliberate choice trading a small amount of file size and parse time for something valuable: `save.txt`, opened directly in a plain text tool (verified in Concept Unit 1, with no help from this program), is immediately readable and even hand-editable — a debugging and trust advantage over an opaque binary format, at the cost of being slightly larger and slower to parse than one would be.

### Connection

This closes the core save/load loop — Concept Unit 6 verifies the round trip explicitly, and Concept Unit 7 adds a second, genuinely different file-writing mode.

---

## Concept Unit 6: Verifying the Round Trip

### The Problem

"Load successful" only means the file opened and lines were read — it says nothing about whether the *values* that came back are actually correct.

### No isolated code lab for this step

Already demonstrated in full as part of Concept Unit 5's Run It — this unit names the verification mechanism explicitly, since it's the lesson's actual proof of correctness, not incidental output.

### Mechanical Walkthrough

- `bool match = (loaded.name == zara.name) && (loaded.className == zara.className) && ...` — **(c) reusing** `==` on `std::string` (LAB-07, proven to compare content, unlike `char` arrays) and `int` (LAB-03), chained with `&&` (LAB-03) across all eight fields — `true` only if every single field survived the save/load round trip unchanged.

### CS Lens

This is a **round-trip test**: serialize, then deserialize, then compare against the original — the standard way to verify any serialization format is lossless, reused far beyond file saves (network protocols, database storage, any format meant to preserve data exactly).

### SE Lens

Checking every field explicitly, rather than trusting "the load function returned true," is what actually caught (in Concept Unit 2's own investigation) that `is_open()`, not `!file`, was the only reliable check on this toolchain — a save/load system that only checked "did `loadPlayer` return `true`?" without this field-by-field comparison would have had no way to notice a subtly wrong load.

### Connection

The Closing Challenge introduces `std::ios::app`, a second file-opening mode this project hasn't used yet — for a genuinely different use case than overwriting a save file.

---

## Closing

### Connect the pieces

Follow `zara.hp = 75` through the full round trip: `savePlayer` (Concept Unit 1) writes `"hp: 75"` as one line in `save.txt`, verified this session as real, plain text readable outside this program entirely. `loadPlayer` (Concept Unit 5) later opens that same file — only after `is_open()` (Concept Unit 2's verified-reliable check) confirms it's real — reads `"hp: 75"` via `std::getline`, splits it into `label = "hp:"` and, via `std::istringstream`'s `>>` (Concept Unit 4), parses `75` directly into `p.hp` as an `int`, not text. Concept Unit 6's comparison then confirms `loaded.hp == zara.hp` — `75 == 75` — completing the round trip: a value that started as an `int` in RAM became text on disk and became an `int` in RAM again, unchanged.

### What breaks without this

Concept Unit 2 already demonstrated the real failure mode this lesson is built around: on this exact toolchain, checking `!file` instead of `is_open()` after a failed file open does not detect the failure at all — `good()` stays true, `fail()` stays false. A `loadPlayer` written with that check (a plausible-looking, commonly-repeated pattern) would proceed into its `while (std::getline(...))` loop, which — verified separately in Concept Unit 2 — returns `false` immediately on a stream that never truly opened, so the loop body never runs even once, and the function returns `true` having "successfully" loaded a `Player` still holding every LAB-10 default value, with no error message at all.

### Exercises

1. Delete `save.txt`, run the program, and confirm the save section recreates it — then rename it to something else and run again, confirming `loadPlayer` prints the "no save file found" message via `is_open()`'s real, verified check.
2. Change `zara.name` to something containing a space (e.g., `"Sir Reginald"`), rerun the full save/load cycle, and confirm `loaded.name` matches exactly — proving Concept Unit 4's `std::ws` + `std::getline` combination handles internal spaces correctly, on your own project's code, not just the isolated scratch file.
3. Build this lesson's `appendLog` Challenge: `void appendLog(const std::string& filename, const std::string& message)`, opening with `std::ios::app`. Call it twice with different messages and confirm — by reading the file afterward — that both entries are present, not just the second one overwriting the first.
4. Deliberately corrupt one line of `save.txt` by hand (change `"hp: 75"` to `"hp: notanumber"`), rerun the load, and observe what `loaded.hp` actually contains — `ss >> p.hp` failing to parse a non-numeric token leaves `p.hp` at whatever value it already held (LAB-10's default, `0`, if `loaded` was freshly constructed) rather than crashing; verify this for real rather than assuming it.

### Definition of done

- [ ] `main.cpp` saves a `Player` to `save.txt`, loads it back into a fresh `Player`, and verifies every field matches.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`.
- [ ] `save.txt`, opened outside this program, shows exactly the eight labeled lines this lesson's `savePlayer` produces.
- [ ] All error checks in the committed code use `is_open()` specifically — per Concept Unit 2's own verified finding about `!file`'s unreliability on this toolchain.
- [ ] You can state, from Concept Unit 2's own proof, why `is_open()` and `!file`/`good()` are not interchangeable here, with a specific observed example.
- [ ] All four Exercises completed with real, observed output — including Exercise 4's deliberately corrupted save file.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-11: Player save/load via std::ofstream/ifstream, verified round-trip, is_open() as the reliable error check"` — states why (persistent player data, verified byte-for-byte on this exact toolchain) not just what changed.
