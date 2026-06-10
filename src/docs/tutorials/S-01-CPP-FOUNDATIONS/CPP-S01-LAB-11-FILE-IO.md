# C++ Masterclass — S-01 — LAB 11 — File I/O

**Prerequisites:** LAB 10. You know structs and can group data cleanly.

**What this lab adds:**
- `std::ofstream` — writing data to a file on disk
- `std::ifstream` — reading data back from a file
- Stream state checking — detecting and handling file errors
- Line-by-line reading with `std::getline`
- Parsing tokens from a line with `std::istringstream`
- Saving and loading a `Player` struct — persistent game state
- The serialization problem — turning live data into text and back

**Time:** ~65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. When your program creates an `int score = 100`, that value lives in RAM.
>    What happens to it when the program exits?
> 2. If you save a player's HP as the text `"75"` in a file, how do you turn that
>    text back into the integer `75` when loading?
> 3. Predict: If the save file does not exist and you try to open it for reading,
>    does `std::ifstream` crash the program, or does it give you a way to detect
>    the failure?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A **save/load system** for the `Player` struct from LAB 10. The program creates
a player, saves them to `save.txt`, then loads them back and verifies the data
is identical:

```
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

You can open `save.txt` in Notepad after running and see the raw text data.

---

## Part 1 — Writing to Files

### Concept: `std::ofstream` — Writing a File Stream

**What it is:** `std::ofstream` (output file stream) is a stream — like `std::cout` —
but its destination is a file instead of the terminal. You use `<<` to send data to it
exactly as you would to `std::cout`.

**What it hides:**
- The OS file system calls (`CreateFile` on Windows, `open()` on Linux)
- File descriptors (integer handles the OS uses to track open files)
- Write buffering (data may be held in a buffer and written in batches for performance)
- File position tracking (each `<<` advances the position in the file automatically)

**The protected invariant:** Data written to an `ofstream` in order appears in the
file in that order. The stream maintains the write position so you never overlap
or lose data accidentally.

**Opening modes:**
- Default (`std::ofstream file("name.txt")`) — creates the file if it doesn't exist;
  **overwrites** if it does. All previous content is lost.
- Append (`std::ofstream file("name.txt", std::ios::app)`) — adds to the end of an
  existing file without deleting its contents.

**Always check `is_open()`:** `ofstream` does not throw an exception if the file
cannot be opened (e.g., the directory doesn't exist, you lack write permission). It
silently enters an error state. Check `is_open()` before writing.

**Always call `close()`:** Closing the stream flushes the buffer (writes any pending
data) and releases the OS file handle. If you skip `close()`, data may not be written
and the handle may leak. (The destructor calls `close()` automatically when the
stream goes out of scope, but explicit `close()` is clear and safe.)

**Canonical example:**
```cpp
std::ofstream file("data.txt");
if (file.is_open()) {
    file << "score: " << 100 << std::endl;
    file.close();
}
```

---

## Step 1 — Write a Save Function

Include the new headers and add a save function. Start a new `main.cpp` that includes
the `Player` struct from LAB 10:

```cpp
#include <iostream>    // std::cout, std::endl
#include <fstream>     // std::ofstream, std::ifstream — file stream types
#include <string>      // std::string
#include <sstream>     // std::istringstream — parsing strings (Part 3)

// ── Player Struct (carried forward from LAB 10) ───────────────────────────────
struct Player {
    std::string name;
    std::string className;
    int hp      = 0;
    int maxHp   = 0;
    int level   = 1;
    int xp      = 0;
    int atk     = 0;
    int def     = 0;
};

// ── Constants ─────────────────────────────────────────────────────────────────
const std::string SAVE_FILE = "save.txt";   // save file name — named constant

// ── Declarations ──────────────────────────────────────────────────────────────
bool savePlayer(const Player& p, const std::string& filename);
bool loadPlayer(Player& p,       const std::string& filename);
void printPlayer(const Player& p);

// ── savePlayer ────────────────────────────────────────────────────────────────
// Writes player data to a text file. Returns true on success, false on failure.
bool savePlayer(const Player& p, const std::string& filename) {
    std::ofstream file(filename);   // open for writing — creates or overwrites

    if (!file.is_open()) {          // check before writing
        std::cout << "  ERROR: Could not open '" << filename << "' for writing." << std::endl;
        return false;
    }

    // Write each field on its own line with a label
    // Format: "fieldname: value"
    file << "name: "      << p.name      << std::endl;
    file << "class: "     << p.className << std::endl;
    file << "hp: "        << p.hp        << std::endl;
    file << "maxhp: "     << p.maxHp     << std::endl;
    file << "level: "     << p.level     << std::endl;
    file << "xp: "        << p.xp        << std::endl;
    file << "atk: "       << p.atk       << std::endl;
    file << "def: "       << p.def       << std::endl;

    file.close();   // flush and release the file handle
    return true;
}
```

**Why `bool` return type?** File operations can fail (disk full, bad permissions,
invalid path). Returning `bool` lets the caller know whether the save succeeded.
The caller can then warn the user rather than silently losing their progress.

### SAVE AND TRY

Add a temporary `main()` to test the save:

```cpp
int main() {
    std::cout << "=== Save / Load System ===" << std::endl;
    std::cout << std::endl;

    Player zara;
    zara.name      = "ZARA";
    zara.className = "Warrior";
    zara.hp        = 75;
    zara.maxHp     = 100;
    zara.level     = 3;
    zara.xp        = 250;
    zara.atk       = 15;
    zara.def       = 8;

    std::cout << "Creating player..." << std::endl;
    std::cout << "  Name:  " << zara.name  << std::endl;
    std::cout << "  Level: " << zara.level << std::endl;
    std::cout << "  HP:    " << zara.hp << " / " << zara.maxHp << std::endl;
    std::cout << "  XP:    " << zara.xp    << std::endl;
    std::cout << std::endl;

    std::cout << "Saving to '" << SAVE_FILE << "'..." << std::endl;
    if (savePlayer(zara, SAVE_FILE)) {
        std::cout << "  Save successful." << std::endl;
    }

    return 0;
}
```

```
make
.\dungeon
```

**You should see:** The player info and "Save successful." Open `save.txt` in Notepad.
You will see exactly:
```
name: ZARA
class: Warrior
hp: 75
maxhp: 100
level: 3
xp: 250
atk: 15
def: 8
```

---

## Part 2 — Reading from Files

### Concept: `std::ifstream` — Reading a File Stream

**What it is:** The input counterpart to `ofstream`. `std::ifstream` reads from a
file. You use `>>` and `std::getline` just as you would with `std::cin`.

**`>>` vs `std::getline`:**
- `file >> word` — reads one whitespace-delimited token (stops at spaces, newlines, tabs)
- `std::getline(file, line)` — reads an entire line including spaces (stops at `\n`)

For our save format (`"name: ZARA"`), we need to read the label (`"name:"`) and the
value (`"ZARA"`) as two separate tokens with `>>`, then handle the case where the
value contains spaces (a player named "Sir Reginald" would need `getline`).

**Stream state — detecting errors:**
After every read operation, the stream reports its state:
- `file.good()` — no error, not at end
- `file.eof()` — reached end of file
- `file.fail()` — a read failed (wrong type, format error)
- `!file` — equivalent to `!file.good()` — checks for any problem

```cpp
int hp = 0;
file >> hp;             // attempt to read an int
if (!file) {            // if the read failed...
    // handle error
}
```

---

## Part 3 — Parsing Tokens

### Concept: `std::istringstream` — Parsing Strings as Streams

**What it is:** An in-memory stream that treats a `std::string` as if it were a file.
You can use `>>` to extract tokens from a string, exactly as you would from `std::cin`
or `std::ifstream`.

**Why we need it for the save format:**
Our save file has lines like `"name: ZARA"`. We can read the whole line with
`std::getline`, then use an `istringstream` to extract the label and value separately:

```cpp
std::string line  = "name: ZARA";
std::istringstream ss(line);   // treat the string as a stream
std::string label, value;
ss >> label;   // extracts "name:"
ss >> value;   // extracts "ZARA"
```

**`#include <sstream>` provides:** `std::istringstream` (input string stream),
`std::ostringstream` (output string stream — builds a string incrementally).

---

## Step 2 — Write the Load Function

Add the `loadPlayer` function:

```cpp
bool loadPlayer(Player& p, const std::string& filename) {
    std::ifstream file(filename);   // open for reading

    if (!file.is_open()) {
        std::cout << "  ERROR: Could not open '" << filename << "' for reading." << std::endl;
        std::cout << "  (No save file found — start a new game.)" << std::endl;
        return false;
    }

    std::string line;
    while (std::getline(file, line)) {   // read one line at a time until EOF
        if (line.empty()) continue;      // skip blank lines

        std::istringstream ss(line);     // treat this line as a stream
        std::string label;
        ss >> label;                     // extract "name:", "hp:", etc.

        // Match each label to the correct field
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

**`ss >> std::ws`:** `std::ws` (whitespace) is a stream manipulator that skips any
leading whitespace. After reading `"name:"` with `>>`, the stream is positioned before
the space and then "ZARA". `ss >> std::ws` skips that space so `std::getline` reads
"ZARA" and not " ZARA" (with a leading space). This preserves names with internal
spaces (e.g., "Sir Reginald").

---

## Step 3 — Complete Main

Update `main()` to also load and verify:

```cpp
    // (after the save section)
    std::cout << std::endl;
    std::cout << "Loading from '" << SAVE_FILE << "'..." << std::endl;

    Player loaded;   // starts with all default values (0s and empty strings)
    if (loadPlayer(loaded, SAVE_FILE)) {
        std::cout << "  Load successful." << std::endl;
        std::cout << std::endl;
        std::cout << "Loaded player:" << std::endl;
        std::cout << "  Name:  " << loaded.name   << std::endl;
        std::cout << "  Level: " << loaded.level  << std::endl;
        std::cout << "  HP:    " << loaded.hp << " / " << loaded.maxHp << std::endl;
        std::cout << "  XP:    " << loaded.xp     << std::endl;

        // Verify all fields match
        bool match = (loaded.name      == zara.name)
                  && (loaded.className == zara.className)
                  && (loaded.hp        == zara.hp)
                  && (loaded.maxHp     == zara.maxHp)
                  && (loaded.level     == zara.level)
                  && (loaded.xp        == zara.xp)
                  && (loaded.atk       == zara.atk)
                  && (loaded.def       == zara.def);

        std::cout << std::endl;
        std::cout << "Data matches: " << (match ? "YES" : "NO") << std::endl;
    }
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Both the save and load sections run, fields match exactly, and
"Data matches: YES" appears.

**Test error handling:** Delete `save.txt` manually. Run the program. The save section
creates a new one. Now run the program with a valid save. Then rename `save.txt` to
`save2.txt` and run — the load section reports "No save file found."

---

## 🎯 Challenge: Append to a Log File

**You know:** `std::ofstream`, append mode, `std::to_string`.

**Task:** Write `void appendLog(const std::string& filename, const std::string& message)`
that adds one timestamped event to a log file. Use `std::ios::app` to append instead
of overwrite. Call it twice with different messages and verify the file contains
both entries (not just the second one).

---

<details>
<summary>▶ Show Solution</summary>

```cpp
#include <ctime>   // std::time, std::ctime

void appendLog(const std::string& filename, const std::string& message) {
    std::ofstream file(filename, std::ios::app);   // append mode — does not overwrite

    if (!file.is_open()) {
        std::cout << "Could not open log file." << std::endl;
        return;
    }

    // Get current time as a string
    std::time_t now = std::time(nullptr);
    std::string timeStr = std::ctime(&now);
    // ctime adds a newline — remove it
    if (!timeStr.empty() && timeStr.back() == '\n') timeStr.pop_back();

    file << "[" << timeStr << "] " << message << std::endl;
    file.close();
}

// Usage:
appendLog("game.log", "Player entered the dungeon.");
appendLog("game.log", "Player defeated a Goblin.");
```

**Key insight:** Without `std::ios::app`, the second call to `appendLog` would
overwrite the first entry. Append mode advances the write position to the end of
the existing file before writing. This is the same mode used by server logs, error
logs, and audit trails in real-world applications.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| `save.txt` created | File appears in the folder after running the program |
| Correct format | Opening `save.txt` in Notepad shows "name: ZARA" etc. |
| `is_open()` check | Renaming the file before load triggers the error message |
| All fields loaded | `loaded.level` is `3`, `loaded.hp` is `75`, etc. |
| Data matches | "Data matches: YES" prints when save file is valid |
| Name with spaces | Saving "Sir Reginald" and loading it back produces the same string |
| Append mode | Two calls to `appendLog` produce two entries, not one overwritten |

---

## Quick Check Answers

**1. What happens to `int score = 100` when the program exits?**
The memory is released back to the operating system. RAM is volatile — it only holds
data while the computer is powered and the program is running. When the program exits,
the OS reclaims all its memory. `score` and every other variable vanish. The only
way to keep data between runs is to write it to persistent storage — a file on disk,
a database, or another non-volatile medium.

**2. How do you turn the text `"75"` back into the integer `75`?**
Use `std::ifstream`'s `>>` operator with an `int` variable:
`file >> hp` reads the next whitespace-delimited token and attempts to parse it as
an integer. If the token is `"75"`, `hp` becomes the integer `75`. You can also
use `std::stoi("75")` (string to int) from `<string>` to convert an already-read
`std::string`. The `>>` approach works directly on the stream without first reading
into a string.

**3. Does `std::ifstream` crash if the file doesn't exist?**
No — it enters an error state, which you detect with `!file.is_open()` or `!file`.
The stream does not throw an exception by default. This is why checking `is_open()`
immediately after opening is mandatory — you must handle the failure case or risk
reading garbage and silently loading a corrupted player. If you want exceptions on
error, you can set them with `file.exceptions(std::ifstream::failbit)`, but the
manual check is more common in game code.
