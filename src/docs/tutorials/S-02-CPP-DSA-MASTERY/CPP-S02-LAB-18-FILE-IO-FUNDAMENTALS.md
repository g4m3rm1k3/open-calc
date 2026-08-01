# CPP DSA — LAB-18 — File I/O Fundamentals

**Prerequisites:** LAB-17 (Graphs and Traversal)

## Quick Check

Before starting, answer these (answers at the bottom):

1. `std::ifstream` and `std::ofstream` both inherit from the same stream family as `std::cout`. Why does that mean `>>` and `<<` already work on files, with nothing new to learn syntactically?
2. Why must you check whether a file actually opened successfully before reading from it?
3. What's the difference between text mode and binary mode when opening a file, and why does it matter for reading/writing raw numeric data versus human-readable text?

## What You Will Build

A program that writes a list of structured records (name, score) to a text file using `ofstream` and `operator<<`, then reads them back using `ifstream` and `operator>>` into `MyVector<Record>` objects — with every failure mode (missing file, malformed line, partial read) checked explicitly rather than assumed away.

```
$ ./file_io_demo
Writing 3 records to scores.txt...
Done.

Reading scores.txt...
  Read: Alice 92
  Read: Bob 78
  Read: Carol 85
Total records read: 3

Attempting to open missing_file.txt...
ERROR: could not open missing_file.txt
```

## Concept: Streams — Files Are Just Another `>>`/`<<` Target

**What it is:** `std::cin`/`std::cout` are both instances of C++'s stream classes (`std::istream`/`std::ostream`) — and `std::ifstream`/`std::ofstream` ("input file stream" / "output file stream") are *the same family*, just connected to a file on disk instead of the terminal. This is exactly why LAB-03's `operator<<` overload for `Fraction` — written to work with `std::ostream&`, not specifically `std::cout` — works completely unmodified when writing to a file: `std::ofstream` *is* an `std::ostream`, so anything that already knows how to print to `std::cout` already knows how to print to a file, with zero new code.

**The problem before:** Every program in this series so far has lived entirely in memory — build a structure, use it, program exits, everything's gone. Real programs need **persistence**: data that survives after the program ends, and can be loaded back in on a later run. Reading a file that doesn't exist, or has malformed content, or runs out of data mid-read, are all real, common situations — a naive read that assumes the file is always there and always well-formed will crash or silently produce garbage the moment reality doesn't match that assumption.

**The solution:** Open a file stream, and *check* whether it opened successfully (`if (!file.is_open())` or checking the stream's boolean state directly) before ever attempting to read or write through it — the file might not exist, might be locked by another program, or the path might be wrong, and none of these are things the program controls. When reading structured data with `>>`, check the stream's state *after* each read, not just before — `>>` failing (running out of data, or hitting text where a number was expected) sets the stream into a failed state that every subsequent operation on it will also silently fail unless explicitly checked and handled.

**Canonical example:**

```cpp
std::ifstream file("data.txt");
if (!file.is_open()) {
    std::cerr << "ERROR: could not open data.txt\n";
    return;
}
std::string name;
int score;
while (file >> name >> score) { // fails (returns false) cleanly at end-of-file OR malformed data
    std::cout << "Read: " << name << " " << score << "\n";
}
```

**Project Application:** This is the direct, literal foundation LAB-19's file-backed searchable database is built on — every technique this lab teaches (open, check success, read structured records, handle malformed/missing data) is reused there without modification, just combined with LAB-14's hash table for the "search in memory" half of that project.

**Watch for:** Reading from a file stream without checking `is_open()` first, or without checking the read operation's success inside a loop condition. A file that fails to open still exists as a valid (but permanently "failed") stream object in C++ — reading from it doesn't crash, it just silently reads nothing, forever, which can look deceptively like "the file was just empty" instead of "the file never opened at all," two very different problems that produce identical-looking (wrong) output if you don't check.

## Step 1: Writing to a file — `ofstream` and `operator<<`, unmodified

```cpp
#include <fstream>
#include <iostream>
#include <string>

struct Record {
    std::string name;
    int score;
};

void writeRecords(const std::string& filename, MyVector<Record>& records) {
    std::ofstream file(filename); // opens (creates, or truncates if it exists) the file for writing

    if (!file.is_open()) {
        std::cerr << "ERROR: could not open " << filename << " for writing\n";
        return;
    }

    for (int i = 0; i < records.getSize(); i++) {
        file << records[i].name << " " << records[i].score << "\n"; // THE SAME << you've used with std::cout all series
    }

    // file's destructor closes it automatically when it goes out of scope (RAII, LAB-04's exact discipline)
}
```

`file << records[i].name << " " << records[i].score << "\n";` is *identical* syntax to every `std::cout << ...` line in every lab so far — because `std::ofstream` genuinely is an `std::ostream`, the same type `std::cout` is (specifically, `std::cout` is a *pre-existing* `std::ostream` instance already connected to the terminal, while `file` is a fresh `std::ofstream` instance connected to a file instead). No new syntax to learn, just a different destination. The file's own destructor closing it automatically once `writeRecords` returns is LAB-04's RAII lesson, arriving in the standard library's own classes rather than something you built by hand.

### SAVE AND TRY

```cpp
MyVector<Record> records;
records.push_back({"Alice", 92});
records.push_back({"Bob", 78});
records.push_back({"Carol", 85});
writeRecords("scores.txt", records);
```

Run this, then open `scores.txt` in a plain text editor (outside your program entirely) and confirm it contains exactly three lines, each with a name and a number, space-separated — direct, visible proof the file genuinely persisted to disk, not just something the program *claims* happened.

## Step 2: Reading from a file — `ifstream`, `operator>>`, and checking success

```cpp
MyVector<Record> readRecords(const std::string& filename, bool& success) {
    MyVector<Record> records;
    std::ifstream file(filename);

    if (!file.is_open()) {
        std::cerr << "ERROR: could not open " << filename << "\n";
        success = false;
        return records; // empty -- caller must check `success`, not just the returned vector's size
    }

    std::string name;
    int score;
    while (file >> name >> score) { // THE loop condition IS the success check
        records.push_back({name, score});
        std::cout << "  Read: " << name << " " << score << "\n";
    }

    success = true;
    return records;
}
```

`while (file >> name >> score)` is doing more work than it looks like: `operator>>` returns a reference to the stream itself, and `std::ifstream` (like every stream) can be implicitly converted to a `bool` reflecting whether its *last* operation succeeded — so the `while` condition is really "keep looping as long as reading both a name and a score just worked." This single line handles both normal termination (reaching end-of-file cleanly) and malformed data (finding text where a number was expected) identically: both make the stream enter a failed state, both make `file >> name >> score` evaluate to `false`, both correctly stop the loop with no crash and no garbage data appended.

### SAVE AND TRY

```cpp
bool success;
MyVector<Record> records = readRecords("scores.txt", success);
std::cout << "Total records read: " << records.getSize() << "\n";

bool success2;
readRecords("missing_file.txt", success2); // deliberately a file that doesn't exist
```

Confirm the first call reads all 3 records correctly, and the second prints the `ERROR` message and doesn't crash — matching "What You Will Build" exactly. Then, as an experiment, manually edit `scores.txt` to add a malformed line (a name with no following number, like just `Dave` on its own line with nothing after it) and rerun `readRecords` — confirm it stops cleanly at the malformed line rather than crashing or looping forever, and note how many records it actually read versus how many lines the file has.

## Step 3: `>>` skips whitespace automatically — and why that's a real danger for names with spaces

```cpp
// scores.txt might legitimately contain: "Mary Jane 88"
// Reading this with `file >> name >> score;` gives name = "Mary" and then tries to
// read "Jane" as a SCORE -- which fails, because "Jane" isn't a valid integer.
```

`operator>>` reads exactly one whitespace-delimited "token" per call, for both strings and numbers — it has no concept of "this token might actually be two words that belong together." A name containing a space (`"Mary Jane"`) silently breaks this lab's simple `file >> name >> score;` approach, not with a crash, but with `name` ending up as just `"Mary"` and the subsequent read failing on `"Jane"` (not a valid `int`), which — per Step 2's loop condition — quietly stops the read loop early, potentially losing every record *after* the malformed one too, not just the one that actually had the problem.

### SAVE AND TRY

Manually add a line `Mary Jane 88` to `scores.txt` (after the existing three records) and rerun `readRecords`. Confirm the reported `records.getSize()` is *less* than expected, and trace through why: this is a real, easy-to-hit bug, not a contrived one — exactly the kind of "the implementation we were given was incorrect" situation worth recognizing on sight from now on.

## Step 4: `std::getline` — reading a whole line, correctly, for data that might contain spaces

```cpp
#include <sstream> // for std::istringstream

MyVector<Record> readRecordsRobust(const std::string& filename, bool& success) {
    MyVector<Record> records;
    std::ifstream file(filename);

    if (!file.is_open()) {
        success = false;
        return records;
    }

    std::string line;
    while (std::getline(file, line)) { // reads a WHOLE line, including any spaces, up to the newline
        std::istringstream lineStream(line); // treat the line's text AS IF it were its own little stream
        std::string namePart, namePart2;
        int score;

        // this simple format assumes exactly two words for the name -- a real format
        // would need a more deliberate delimiter (like a comma) to be fully general
        if (lineStream >> namePart >> namePart2 >> score) {
            records.push_back({namePart + " " + namePart2, score});
        }
    }

    success = true;
    return records;
}
```

`std::getline(file, line)` reads an entire line as one string, spaces and all, stopping only at the newline character — completely sidestepping `>>`'s "stop at any whitespace" behavior. `std::istringstream` then treats that already-read line's text as its own miniature stream, letting you `>>` out of it exactly like a file — a genuinely useful, reusable pattern: read a whole line safely first, *then* parse pieces out of that line's text using the same `>>` tools, now operating on a string you already have complete control over instead of the unpredictable live file stream.

### SAVE AND TRY

Rerun the `"Mary Jane 88"` test from Step 3, this time using `readRecordsRobust` instead of `readRecords`. Confirm `"Mary Jane"` is now correctly read as one combined name, and — importantly — confirm records *after* it in the file are no longer lost, since a malformed line here (if this simplified two-word-name assumption is violated) only fails to parse *that specific line*, rather than corrupting the entire stream's state the way Step 2/3's naive version did.

## 🎯 Challenge

Rewrite `writeRecords`/`readRecordsRobust` to use a comma as an explicit delimiter (`Alice,92` instead of `Alice 92`) instead of relying on whitespace-splitting at all — a more robust real-world format, since it correctly supports names containing spaces without the two-word assumption Step 4 had to make.

<details>
<summary>Solution</summary>

```cpp
void writeRecordsCSV(const std::string& filename, MyVector<Record>& records) {
    std::ofstream file(filename);
    if (!file.is_open()) return;

    for (int i = 0; i < records.getSize(); i++) {
        file << records[i].name << "," << records[i].score << "\n";
    }
}

MyVector<Record> readRecordsCSV(const std::string& filename, bool& success) {
    MyVector<Record> records;
    std::ifstream file(filename);
    if (!file.is_open()) { success = false; return records; }

    std::string line;
    while (std::getline(file, line)) {
        size_t commaPos = line.find(',');
        if (commaPos == std::string::npos) continue; // malformed line, no comma -- skip it, don't crash

        std::string name = line.substr(0, commaPos);
        std::string scoreStr = line.substr(commaPos + 1);

        try {
            int score = std::stoi(scoreStr); // string-to-int, throws if scoreStr isn't a valid number
            records.push_back({name, score});
        } catch (const std::exception&) {
            continue; // malformed score -- skip this line, keep reading the rest of the file
        }
    }

    success = true;
    return records;
}
```

`line.find(',')` returns `std::string::npos` (a special "not found" sentinel value) if no comma exists on that line — checked explicitly before attempting `substr`, rather than assuming every line is well-formed. `std::stoi` throwing on invalid input (wrapped in `try`/`catch`, foreshadowing LAB-20's deeper look at error handling) means a malformed score doesn't crash the whole read — it skips just that one bad line and keeps processing the rest of the file, exactly the resilience Step 3's naive version lacked entirely.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| `ifstream`/`ofstream` | A totally different API from `cin`/`cout` | The same stream family — `<<`/`>>` work identically |
| Opening a file | Assume it always succeeds | Always check `is_open()` before reading/writing |
| `file >> name >> score` | Safe for any text data | Breaks silently on names/values containing spaces |
| A malformed line | Should crash the program | Should be detected and skipped, without losing the rest of the file |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does LAB-03's `Fraction` `operator<<` work on a file stream with zero code changes? | |
| 2 | Why does `while (file >> name >> score)` correctly stop at both end-of-file AND malformed data? | |
| 3 | Why does reading `"Mary Jane 88"` with plain `file >> name >> score;` silently lose data, rather than crashing loudly? | |

## Quick Check Answers

1. Both `std::ifstream`/`std::ofstream` and `std::cin`/`std::cout` are instances of the same underlying stream class family (`std::istream`/`std::ostream`) — `>>` and `<<` are defined once, generically, for that family, so anything already written to work with `std::ostream&`/`std::istream&` (rather than hardcoding `std::cout` specifically) works unmodified on a file stream too.
2. Because the file might not exist, might be in a location the program doesn't have permission to access, or might be locked by another process — none of which are under your program's control, and attempting to read from a stream that never successfully opened produces no crash, just silent, permanent failure on every subsequent read, which looks deceptively similar to "the file was legitimately empty" unless explicitly checked for.
3. Text mode treats the file's bytes as human-readable characters, translating platform-specific line-ending conventions (like `\r\n` vs `\n`) automatically, which is correct for reading/writing text like names and formatted numbers; binary mode transfers bytes exactly as-is, with no translation, which is required when writing raw numeric data directly (an `int`'s actual 4-byte representation, not its printed digits) since any translation would corrupt that raw data.

*Next: [LAB-19 — Building a File-Backed Searchable Database](CPP-S02-LAB-19-FILE-BACKED-DATABASE.md)*
