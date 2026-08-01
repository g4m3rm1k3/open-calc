# CPP DSA — LAB-19 — Building a File-Backed Searchable Database

**Prerequisites:** LAB-18 (File I/O Fundamentals)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why does it make sense to load an entire file into memory once, up front, rather than searching the file itself on every query?
2. If a file has 100,000 records, roughly how many string comparisons does a linear scan need in the worst case, versus a hash table lookup?
3. What should happen if the same key appears twice in the source file — should the second one silently overwrite the first, be rejected, or something else? Is there a universally "correct" answer, or does it depend on the application?

## What You Will Build

A complete command-line tool: load a CSV file of `id,name,department,salary` employee records into memory, index every record into a `MyHashMap<std::string, Record>` keyed by `id`, and answer searches interactively — this is the exact "open a file, read it, search it in memory" project shape from real coursework, built from every structure this series has developed, combined for the first time into one working tool.

```
$ ./employee_db employees.csv
Loaded 5000 records from employees.csv in 41ms.

> search E4821
Found: id=E4821, name=Diana Prince, department=Engineering, salary=98500

> search E9999
Not found: E9999

> stats
Total records: 5000
Hash table buckets: 8192
Load factor: 0.61

> quit
```

## Concept: Load Once, Search Many — Why the Two-Phase Design Wins

**What it is:** This tool has two clearly separated phases: **load** (read the entire file once, parse every line into a `Record`, insert each into a `MyHashMap`) and **query** (repeatedly search the *in-memory* hash table, never touching the file again). This is a direct, deliberate application of an idea already introduced in this curriculum's SE Masterclass series: pay a cost once (parsing, indexing), so every subsequent operation is cheap — the same "compile once, run many times" logic that made LAB-84's bytecode VM faster than re-interpreting an AST on every loop iteration, here applied to file records instead of code.

**The problem before:** If this tool re-scanned the *file itself* on every single search — reading through every line, comparing IDs — each search would cost O(n) in the number of records, and disk I/O (even for a local file) is dramatically slower than an in-memory operation; doing it repeatedly, for every query, in an interactive tool where a user might search dozens of times per session, would be needlessly, repeatedly expensive for data that never changes between searches.

**The solution:** Read the file exactly once, at startup — using LAB-18's `ifstream`/`getline` techniques — parsing each line into a `Record` struct and inserting it into a `MyHashMap<std::string, Record>` (LAB-14) keyed by whatever field should be searchable (here, `id`). Every search from that point on is a pure in-memory hash table lookup: average O(1), no disk access at all, regardless of how many times the user searches or how large the original file was.

**Canonical example:**

```cpp
struct Record { std::string id, name, department; double salary; };

MyHashMap<std::string, Record> loadDatabase(const std::string& filename) {
    MyHashMap<std::string, Record> db;
    std::ifstream file(filename);
    std::string line;
    while (std::getline(file, line)) {
        Record r = parseLine(line); // LAB-18-style CSV parsing
        db.insert(r.id, r);
    }
    return db;
}
```

**Project Application:** This lab is the direct payoff of LAB-14 and LAB-18 both — nothing new is built here architecturally; this is entirely recombination of two already-complete structures into one real, usable tool, exactly the promise this series' README made about how labs connect.

**Watch for:** Forgetting to validate each line while parsing, and letting one malformed row in a 5,000-line file silently corrupt the *entire* load (either by crashing outright, or — worse — by silently inserting a garbage `Record` that later searches return without any indication something was wrong). LAB-18's Challenge (skip malformed lines, keep processing the rest) is not optional polish here — it's required for a tool meant to survive real, imperfect input data.

## Step 1: The `Record` struct and CSV parsing

```cpp
// Record.h
#ifndef RECORD_H
#define RECORD_H

#include <string>
#include <iostream>

struct Record {
    std::string id;
    std::string name;
    std::string department;
    double salary;
};

std::ostream& operator<<(std::ostream& out, const Record& r) {
    out << "id=" << r.id << ", name=" << r.name
        << ", department=" << r.department << ", salary=" << r.salary;
    return out;
}

#endif
```

`operator<<` here is LAB-03's exact pattern, reused without modification — a free function taking `std::ostream&`, letting `std::cout << someRecord` (or, per LAB-18, `someOutputFile << someRecord`) work naturally, formatting every field in one consistent place instead of manually assembling the same field list at every print site throughout the rest of this tool.

```cpp
#include <sstream>
#include <vector>

bool parseLine(const std::string& line, Record& outRecord) {
    std::istringstream lineStream(line);
    std::string idPart, namePart, deptPart, salaryPart;

    if (!std::getline(lineStream, idPart, ',')) return false;
    if (!std::getline(lineStream, namePart, ',')) return false;
    if (!std::getline(lineStream, deptPart, ',')) return false;
    if (!std::getline(lineStream, salaryPart, ',')) return false;

    try {
        outRecord.id = idPart;
        outRecord.name = namePart;
        outRecord.department = deptPart;
        outRecord.salary = std::stod(salaryPart); // string-to-double
        return true;
    } catch (const std::exception&) {
        return false; // malformed salary field -- this line is unusable
    }
}
```

`std::getline(lineStream, idPart, ',')` — note the third argument — reads up to the next `,` instead of the next newline, which is exactly LAB-18 Step 4's `std::istringstream`-on-a-line technique, extended to a comma-delimited format with four fields instead of two space-separated ones. `parseLine` returns `bool` and writes its result through an output-parameter reference (LAB-10's Challenge pattern) rather than throwing or returning a possibly-invalid `Record` directly — the caller (Step 2) decides what to do with a parse failure, rather than this function assuming a specific error-handling policy.

### SAVE AND TRY

Create a small `employees.csv` by hand with a few lines like `E1001,Alice Chen,Engineering,95000`, then call `parseLine` on each line manually and print the resulting `Record` — confirm every field lands correctly, then deliberately add a malformed line (a non-numeric salary, or a missing field) and confirm `parseLine` returns `false` for it rather than crashing or producing a garbage `Record`.

## Step 2: Loading the whole file into the hash table

```cpp
#include "MyHashMap.h" // LAB-14
#include "Record.h"
#include <fstream>
#include <chrono>

MyHashMap<std::string, Record> loadDatabase(const std::string& filename, int& recordCount, int& skippedCount) {
    MyHashMap<std::string, Record> db;
    recordCount = 0;
    skippedCount = 0;

    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cerr << "ERROR: could not open " << filename << "\n";
        return db;
    }

    std::string line;
    while (std::getline(file, line)) {
        if (line.empty()) continue; // skip blank lines silently, not an error

        Record record;
        if (parseLine(line, record)) {
            db.insert(record.id, record);
            recordCount++;
        } else {
            skippedCount++; // count it, but keep going -- one bad line shouldn't sink the whole load
        }
    }

    return db;
}
```

`recordCount`/`skippedCount` (both output parameters) mean the caller learns *both* how many records loaded successfully *and* how many were rejected — a load that silently drops malformed rows with no report at all would hide real data-quality problems from whoever runs this tool; reporting the skip count, even without stopping the load, keeps the tool honest about what it actually did.

### SAVE AND TRY

```cpp
int recordCount, skippedCount;
auto start = std::chrono::high_resolution_clock::now();
MyHashMap<std::string, Record> db = loadDatabase("employees.csv", recordCount, skippedCount);
auto end = std::chrono::high_resolution_clock::now();
auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);

std::cout << "Loaded " << recordCount << " records from employees.csv in " << duration.count() << "ms.\n";
if (skippedCount > 0) std::cout << "(skipped " << skippedCount << " malformed lines)\n";
```

Generate a larger test file (a few thousand lines — write a small script or copy-paste-modify a template row many times) and confirm the load completes in a small number of milliseconds, matching "What You Will Build"'s timing report format.

## Step 3: The interactive search loop

```cpp
void runSearchLoop(MyHashMap<std::string, Record>& db) {
    std::string command;
    std::cout << "\n> ";
    while (std::cin >> command) {
        if (command == "quit") {
            break;
        } else if (command == "search") {
            std::string id;
            std::cin >> id;
            Record result;
            if (db.get(id, result)) { // LAB-14's Challenge -- the output-parameter get()
                std::cout << "Found: " << result << "\n";
            } else {
                std::cout << "Not found: " << id << "\n";
            }
        } else if (command == "stats") {
            std::cout << "Total records: " << db.getElementCount() << "\n"; // requires exposing this from MyHashMap
        } else {
            std::cout << "Unknown command: " << command << "\n";
        }
        std::cout << "\n> ";
    }
}
```

Every single `search` command is one call to `db.get(id, result)` — a hash table lookup, average O(1) regardless of how large `employees.csv` originally was, exactly the payoff this lab's concept section promised. Notice this function never touches `filename` or opens the file again at all — by the time `runSearchLoop` runs, the file has already served its entire purpose (Step 2 already loaded everything into `db`), and the rest of the program's lifetime lives entirely in memory, exactly the two-phase design the concept section described.

### SAVE AND TRY

Run the full tool end to end: load `employees.csv`, then interactively type `search E1001` (using an ID you know exists in your test file), then `search E9999` (one that doesn't), then `stats`, then `quit`. Confirm each command produces the expected output, matching "What You Will Build"'s transcript format.

## Step 4: Combining with LAB-15/16 — sorted output and range queries

```cpp
#include "MyVector.h"

MyVector<Record> getAllRecordsSortedBySalary(MyHashMap<std::string, Record>& db) {
    MyVector<Record> all = db.getAllValues(); // requires adding a values-extraction method to MyHashMap,
                                                 // walking every bucket's chain and collecting each pair's value

    // sort by salary, descending -- reusing LAB-15's insertion sort, adapted to compare Records instead of ints
    for (int i = 1; i < all.getSize(); i++) {
        Record key = all[i];
        int j = i - 1;
        while (j >= 0 && all[j].salary < key.salary) {
            all[j + 1] = all[j];
            j--;
        }
        all[j + 1] = key;
    }
    return all;
}
```

The hash table (LAB-14) is excellent for exact-match lookup by `id`, but has *no* meaningful ordering — asking "who are the top 5 highest-paid employees" isn't something a hash table can answer directly, since its bucket order has no relationship to salary at all. Extracting every stored value into a `MyVector` and sorting it (LAB-15) is the correct combination: use the right structure for each *kind* of query — hash table for exact lookup, sorted array for ranked/ordered queries — rather than forcing one structure to do both jobs badly.

### SAVE AND TRY

Add a `top` command to `runSearchLoop` that calls `getAllRecordsSortedBySalary` and prints the first 5 entries — confirm they really are the 5 highest salaries in your test file by cross-checking against the raw CSV data by eye.

## 🎯 Challenge

Add a `duplicate key` policy decision (Quick Check question 3, made concrete): modify `loadDatabase` so that instead of silently overwriting a record when a duplicate `id` is encountered (LAB-14's `insert`'s current default behavior), it detects the collision, logs a warning naming the duplicate ID, and keeps the *first* occurrence rather than the last — a deliberate design decision, not the accidental behavior LAB-14 happened to produce by default.

<details>
<summary>Solution</summary>

```cpp
MyHashMap<std::string, Record> loadDatabase(const std::string& filename, int& recordCount, int& duplicateCount) {
    MyHashMap<std::string, Record> db;
    recordCount = 0;
    duplicateCount = 0;

    std::ifstream file(filename);
    std::string line;
    while (std::getline(file, line)) {
        if (line.empty()) continue;

        Record record;
        if (!parseLine(line, record)) continue;

        Record existing;
        if (db.get(record.id, existing)) {
            // ALREADY present -- this is a duplicate. Keep the first, warn, don't overwrite.
            std::cerr << "WARNING: duplicate id '" << record.id << "' -- keeping first occurrence\n";
            duplicateCount++;
            continue;
        }

        db.insert(record.id, record);
        recordCount++;
    }
    return db;
}
```

Checking `db.get(record.id, existing)` *before* calling `db.insert` is what makes "keep first, warn on duplicate" an explicit, deliberate policy rather than an accident of whatever `MyHashMap::insert`'s default overwrite behavior happens to be — this is precisely the kind of decision Quick Check question 3 asked about having no single universally correct answer to: a different application might legitimately want "last write wins" instead, or might want duplicates to be a hard error that aborts the whole load — the *code* needs to make that choice explicit, not leave it as whatever the underlying structure happens to do by default.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Searching a file | Re-scan the file on every query | Load once into memory, search the in-memory structure repeatedly |
| Malformed input rows | Let one bad row crash the whole load | Skip and count them, keep loading the rest |
| Exact-match lookup | Any structure works equally well | Hash table (LAB-14) — average O(1), independent of file size |
| Ranked/ordered queries | The hash table can answer these too | Extract values, sort separately (LAB-15) — different structure for a different query shape |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `runSearchLoop` never reopen or re-read `employees.csv` after `loadDatabase` finishes? | |
| 2 | Why does a hash table answer "does id E4821 exist" quickly but not "who are the top 5 earners"? | |
| 3 | Why does `parseLine` return `bool` and use an output parameter, rather than throwing on a malformed line? | |

## Quick Check Answers

1. Loading once means the one-time cost of reading and parsing the file is paid exactly once, no matter how many searches follow — re-scanning the file on every query would repeat that same cost (and the disk I/O it involves) for every single search, which is wasteful for data that never changes between queries within one program run.
2. Linear scan compares against every record until a match is found (or the file is exhausted), so worst case that's roughly 100,000 string comparisons; a hash table computes one hash and checks a short chain within a single bucket, average O(1) — a difference of many orders of magnitude at that scale.
3. There's no universally correct answer — it genuinely depends on the application's requirements: some systems should reject duplicate keys as a hard error (data integrity matters more than availability), others should silently prefer the newest entry (a log or cache scenario), and others might need to merge or flag them for human review — the right choice is a deliberate design decision the code should make explicit, not something to leave as an accidental side effect of whichever behavior the underlying data structure happens to implement by default.

*Next: [LAB-20 — The Danger Zone: Classic C++ Memory Bugs](CPP-S02-LAB-20-THE-DANGER-ZONE.md)*
