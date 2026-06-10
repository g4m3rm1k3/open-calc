# C++ Masterclass — S-02 — LAB 07 — High Score Persistence

**Prerequisites:** S-02 LAB 06. You have a complete Snake game with O(1) collision.

**What this lab adds:**
- Applying file I/O from S-01 LAB 11 in a live game context
- Loading the high score at startup before the game begins
- Saving the high score when a new record is set
- The "no save file" case — graceful first-run handling
- Displaying high score on the game screen throughout play
- Why persistence matters: your game now remembers across sessions

**Time:** ~45 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You learned `std::ifstream` in S-01 LAB 11. Before reading the high score
>    file, what must you always check — and what should happen if the check fails?
> 2. The high score file might not exist on the first run. Should `loadHighScore()`
>    return an error in this case, or is "no file" a normal expected condition?
>    How does the return value communicate the difference?
> 3. Predict: If the player scores 5 points but the current high score is 8, should
>    the high score file be updated? What if they score 10?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The complete Snake game with persistent high score:

```
Score: 7  |  Best: 12  |  Len: 10  |  Q=quit

[Game Over — new high score! 13 > 12]

New high score saved: 13
```

On the next run:
```
Score: 0  |  Best: 13  |  Len: 3  |  Q=quit
```

The high score survives between game sessions.

---

## Part 1 — Persistence Design

### Concept: The Persistence Layer — Separating Storage from Logic

**What it is:** A small set of functions dedicated to reading and writing saved data.
These functions know about files. The game logic functions do not. The game asks
"what is the high score?" — it does not care whether that came from a file, a
database, or a server.

**The two functions:**
```cpp
int  loadHighScore(const std::string& filename);
void saveHighScore(const std::string& filename, int score);
```

**Return value design for `loadHighScore`:**
- Returns an `int` — the saved score if the file exists
- Returns `0` if the file does not exist (first run) — this is not an error; `0`
  is the correct "no previous score" value

This is preferable to returning `-1` (a sentinel error code) because `0` is the
natural "no score yet" value. The caller does not need to check for an error condition —
no saved score and a saved score of 0 are handled identically.

**File format:** A single integer on a single line. Simple, human-readable, and
trivially parseable:
```
13
```

Why so simple? The high score file is not a protocol or a database. It holds one
number. Making it more complex (XML, JSON, binary) would add dependencies and failure
modes with no benefit.

---

## Step 1 — `loadHighScore` and `saveHighScore`

Add to `main.cpp` (above the other functions, after includes):

```cpp
#include <fstream>     // std::ifstream, std::ofstream (if not already included)

const std::string HIGHSCORE_FILE = "highscore.dat";

// ── loadHighScore ─────────────────────────────────────────────────────────────
// Opens the high score file and reads the stored integer.
// If the file does not exist or cannot be read, returns 0 (no previous score).
// First-run case (no file) is NOT an error — it is an expected normal condition.
int loadHighScore(const std::string& filename) {
    std::ifstream file(filename);

    if (!file.is_open()) {
        return 0;   // no save file → high score is 0 (first run or deleted)
    }

    int score = 0;
    file >> score;

    if (file.fail()) {
        return 0;   // file exists but contains invalid data → treat as 0
    }

    file.close();
    return score;
}

// ── saveHighScore ─────────────────────────────────────────────────────────────
// Writes the given score to the high score file, overwriting any previous value.
// Only called when a new high score is actually achieved.
void saveHighScore(const std::string& filename, int score) {
    std::ofstream file(filename);

    if (!file.is_open()) {
        // Cannot write — not a crash condition, just log and continue
        std::cout << "  [Warning] Could not save high score." << std::endl;
        return;
    }

    file << score << std::endl;
    file.close();
}
```

**Why `file >> score` might fail:** The file could exist but contain non-numeric
content (corrupted, user edited it with letters). Checking `file.fail()` after the
read catches this and returns a safe default of 0.

**`std::endl` in the save:** `std::endl` flushes the buffer — guaranteeing the data
is written to disk before `close()` is called. Without the flush, the OS might buffer
the write and the file could contain stale data if the program crashed immediately
after. For a one-number file, this is not a performance concern.

### SAVE AND TRY

Add a quick test in `main()` before the game starts:

```cpp
    int testScore = loadHighScore(HIGHSCORE_FILE);
    std::cout << "Loaded high score: " << testScore << std::endl;
    saveHighScore(HIGHSCORE_FILE, 42);
    std::cout << "Saved 42. Loading again: " << loadHighScore(HIGHSCORE_FILE) << std::endl;
    _getch();
```

```
make
.\dungeon
```

**First run:** Should show `0` then `42`. Open `highscore.dat` in Notepad — contains `42`.
**Second run:** Shows `42` then `42` (loaded the saved value). Remove the test code.

---

## Step 2 — Integrate Into the Game Loop

In `main()`, add the high score before the game loop:

```cpp
    int highScore = loadHighScore(HIGHSCORE_FILE);   // ← add before the while loop
```

In the render section, add the high score to the status line:

```cpp
        std::cout << "Score: " << score
                  << "  |  Best: "   << highScore       // ← add
                  << "  |  Len: "    << body.size()
                  << "  |  Q=quit"   << std::endl;
```

After the game loop ends (player quit or died), check and save the high score:

```cpp
    // ── After game loop ───────────────────────────────────────────────────────
    clearScreen();

    if (score > highScore) {
        std::cout << "[New high score! " << score << " > " << highScore << "]" << std::endl;
        std::cout << std::endl;
        saveHighScore(HIGHSCORE_FILE, score);
        std::cout << "New high score saved: " << score << std::endl;
    } else {
        std::cout << "Game Over!" << std::endl;
        std::cout << "Score: " << score << "  |  Best: " << highScore << std::endl;
    }
```

### SAVE AND TRY

```
make
.\dungeon
```

**Play until you score at least 1 point, then quit.** Check that "New high score saved"
appears. Run again — "Best: 1" (or your score) appears from the start.

**Deliberately get a lower score.** Quit. The "Best" value does not decrease — the
file is only overwritten on a new record.

**Delete `highscore.dat` manually.** Run. "Best: 0" on first play, correct save after.

**Change something:** Change the save format to include the date. Add `#include <ctime>`
and write:
```cpp
std::time_t t = std::time(nullptr);
file << score << " " << std::ctime(&t);
```
Then update `loadHighScore` to only read the first integer with `file >> score`.
The date is stored for human reference; the game ignores it. Change back if preferred.

---

## 🎯 Challenge: Top 5 Scores

**You know:** File I/O, `std::vector`, sorting.

**Task:** Change the persistence to store the top 5 scores. On game over, if the new
score makes the top 5, insert it into the correct position. Save all 5 to the file
(one per line). Display all 5 at the end of the game.

**Hint:** `#include <algorithm>` gives `std::sort`. `std::vector<int> scores(5, 0)`
creates a vector of 5 zeros.

---

<details>
<summary>▶ Show Solution — Key Parts</summary>

```cpp
// Load top 5
std::vector<int> loadTopScores(const std::string& filename) {
    std::vector<int> scores(5, 0);
    std::ifstream file(filename);
    if (!file.is_open()) return scores;
    for (int i = 0; i < 5; ++i) {
        if (!(file >> scores[i])) break;
    }
    return scores;
}

// Save top 5
void saveTopScores(const std::string& filename, std::vector<int>& scores) {
    // Add new score, sort descending, keep top 5
    std::sort(scores.begin(), scores.end(), std::greater<int>());
    if (scores.size() > 5) scores.resize(5);

    std::ofstream file(filename);
    if (!file.is_open()) return;
    for (int s : scores) file << s << std::endl;
}
```

**Key insight:** `std::sort` with `std::greater<int>()` sorts in descending order.
The vector always holds exactly 5 values (filled with 0 for unfilled slots). Saving
and loading 5 integers is as simple as the single-integer version — just in a loop.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| First run returns 0 | Delete `highscore.dat`; load returns 0 |
| File created on first save | `highscore.dat` appears in the folder after beating score 0 |
| High score displayed | "Best: N" shows in the status line during play |
| Higher score saves | Scoring more than "Best" triggers save and confirmation message |
| Lower score does not save | Scoring less than "Best" shows "Game Over" without overwriting |
| Corrupt file handled | Replacing `highscore.dat` content with "abc" returns 0 |

---

## Quick Check Answers

**1. What must you always check before reading from `std::ifstream`, and what if it fails?**
Always call `is_open()` (or check `if (!file)`) after constructing the stream.
If the check fails, the file does not exist, is inaccessible, or the path is wrong.
The correct response depends on context: for a high score file, "not found" is a normal
first-run condition — return a default value (0). For a required configuration file,
"not found" is an error — report it clearly and exit or use safe defaults.
Never proceed to read from a stream that failed to open.

**2. Is "no save file" an error or a normal condition for `loadHighScore`?**
A normal expected condition. On first run, the file simply does not exist yet. The
function returning `0` communicates "no previous record" — which is the correct
logical state. If the function returned `-1` as an error sentinel, every caller would
need to write `if (score == -1) score = 0;`, duplicating error-handling logic.
Choosing `0` as the "no file" return value makes the API honest: "the highest score
ever achieved is 0" is true when no game has been completed.

**3. When should the high score file be updated?**
Only when `score > highScore`. If the player scores 5 and the record is 8, the record
stands unchanged — the file is not touched. If the player scores 10, the new record
(10) overwrites the old one. This avoids unnecessary file writes on every game-over
(file I/O is slow relative to in-memory operations) and correctly preserves the
maximum across all sessions.
