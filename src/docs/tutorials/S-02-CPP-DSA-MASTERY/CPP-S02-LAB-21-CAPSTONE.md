# CPP DSA — LAB-21 — Capstone: The In-Memory Record Store

**Prerequisites:** LAB-20 (The Danger Zone: Classic C++ Memory Bugs)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Of every structure built in this series (`MyVector`, `MyLinkedList`, `MyDoublyLinkedList`, `MyStack`, `MyQueue`, `CircularBuffer`, `BinaryTree`, `BST`, `MyHashMap`), which would you reach for first if asked to build something completely new tomorrow — and why?
2. What's the difference between code that "runs correctly on your test data" and code you can actually trust — what did LAB-20 add to your ability to tell the two apart?
3. Where would you go looking, in your own project code from your coursework, for a Rule of Three violation, now that you know exactly what one looks like?

## What You Will Build

The final assembly: a command-line employee record store that loads a CSV file (LAB-18), indexes it into your own hash table (LAB-14) for O(1) exact-match lookup, supports sorted/ranked queries via your own sort (LAB-15), supports a linear-scan fallback search mode for direct comparison (LAB-16), and — critically — passes a clean `-fsanitize=address` run with zero leaks, zero use-after-free, zero buffer overruns (LAB-20). Every single piece is something you built yourself, from LAB-01 onward; nothing here is new.

```
$ g++ -fsanitize=address -std=c++17 *.cpp -o record_store
$ ./record_store employees.csv

Loaded 5000 records in 38ms (0 skipped, 0 duplicates)

> search E4821
Found: id=E4821, name=Diana Prince, department=Engineering, salary=98500  (1 hash lookup)

> linear E4821
Found: id=E4821, name=Diana Prince, department=Engineering, salary=98500  (2847 comparisons)

> top 3
1. id=E0192, name=Bruce Wayne, department=Executive, salary=245000
2. id=E3301, name=Clark Kent, department=Executive, salary=238000
3. id=E4821, name=Diana Prince, department=Engineering, salary=98500

> quit
Shutting down. Freeing all records...

=================================================================
==12345==LeakSanitizer: 0 bytes leaked in 0 allocations.
```

## Concept: Recombination, Not Reinvention

**What it is:** A capstone project's purpose isn't to teach anything new — it's to prove that everything already built actually composes into something real. Every structure and technique from this series' 20 prior labs gets used here exactly as originally built, with no modifications required, because each one was designed (templates, RAII, clean interfaces) specifically to compose with whatever needed it later.

**The problem before:** Each individual lab proved its own structure works, in isolation, on small, controlled examples. That's necessary but not sufficient — a real tool needs several structures working *together*, correctly, at realistic scale, with real (occasionally malformed) data, and with genuine memory safety guarantees, not just "seemed fine in the lab's SAVE AND TRY." This is exactly LAB-20's lesson taken seriously: a component that individually looked correct can still combine badly with another component, and only integration at real scale, checked with real tools, actually proves the whole system is trustworthy.

**The solution:** Build the whole tool, then verify it as a whole — not just that each part works, but that the *assembly* is clean under AddressSanitizer, at realistic data volumes, including the deliberately imperfect input handling LAB-18/19 already built. This lab has no new "Steps" teaching new material — every step below is an integration checklist, verified against tools rather than trusted on faith.

**Canonical example:**

```cpp
// main.cpp -- the ENTIRE capstone in outline; every piece already built in a prior lab
#include "MyHashMap.h"    // LAB-14
#include "MyVector.h"      // LAB-06
#include "Record.h"         // LAB-19
#include <fstream>

int main(int argc, char* argv[]) {
    auto db = loadDatabase(argv[1], recordCount, skippedCount); // LAB-18 + LAB-19
    runSearchLoop(db); // LAB-19, extended below with `linear` and `top`
    return 0;
}
```

**Project Application:** This lab has no "next" lab to feed into — it is the destination this entire series was building toward, and its own verification checklist (the four items below) is the final thing this series asks you to internalize as a standing habit for any future C++ project, not just this one.

**Watch for:** Treating this lab as "just glue code." Wiring already-correct pieces together incorrectly (using the wrong search mode for the wrong situation, forgetting to free something at the top level even though every individual piece frees itself correctly) is a completely real category of bug on its own — integration bugs, not component bugs — and this lab's verification checklist exists specifically to catch that category, not to re-test each component's own correctness (already proven in its own lab).

## Step 1: Assemble the tool — every piece from a named prior lab, nothing new

```cpp
// main.cpp
#include "MyHashMap.h"
#include "MyVector.h"
#include "Record.h"
#include <iostream>
#include <chrono>

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <csv_file>\n";
        return 1;
    }

    int recordCount = 0, skippedCount = 0, duplicateCount = 0;
    auto start = std::chrono::high_resolution_clock::now();
    MyHashMap<std::string, Record> db = loadDatabase(argv[1], recordCount, skippedCount); // LAB-19
    auto end = std::chrono::high_resolution_clock::now();
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();

    std::cout << "\nLoaded " << recordCount << " records in " << ms << "ms ("
              << skippedCount << " skipped, " << duplicateCount << " duplicates)\n";

    runSearchLoop(db, argv[1]); // extended in Step 2

    std::cout << "Shutting down. Freeing all records...\n";
    return 0; // db and everything it owns is destroyed here -- LAB-04's RAII, one final time
}
```

Notice this function is almost entirely function calls into code from prior labs — `loadDatabase` (LAB-19), `MyHashMap` (LAB-14), the timing pattern (LAB-15's benchmarking technique). The comment on the final `return 0;` is worth sitting with directly: `db` going out of scope here triggers `MyHashMap`'s destructor (which you'd write following LAB-04's Rule of Three, walking every bucket's `MyLinkedList` and letting *its* destructor, also LAB-04-correct, free every node) — a cascade of correctly-composed RAII, each piece trusting the piece beneath it to clean up its own resources correctly.

### SAVE AND TRY

Compile this (with stub implementations of anything not yet fully wired up) and confirm it at least builds and runs against a test CSV file, printing the load-time report — this is the skeleton the rest of this lab fills in and verifies.

## Step 2: Extending the search loop — `linear` mode for direct comparison

```cpp
void runSearchLoop(MyHashMap<std::string, Record>& db, const std::string& filename) {
    std::string command;
    std::cout << "\n> ";
    while (std::cin >> command) {
        if (command == "quit") {
            break;
        } else if (command == "search") {
            std::string id;
            std::cin >> id;
            Record result;
            int comparisons = 1; // a hash lookup is conceptually "1 lookup," reported for comparison
            if (db.get(id, result)) {
                std::cout << "Found: " << result << "  (" << comparisons << " hash lookup)\n";
            } else {
                std::cout << "Not found: " << id << "\n";
            }
        } else if (command == "linear") {
            std::string id;
            std::cin >> id;
            linearSearchFile(filename, id); // LAB-16's linear search, applied to the RAW file this time
        } else if (command == "top") {
            int n;
            std::cin >> n;
            MyVector<Record> sorted = getAllRecordsSortedBySalary(db); // LAB-14 + LAB-15
            for (int i = 0; i < n && i < sorted.getSize(); i++) {
                std::cout << (i + 1) << ". " << sorted[i] << "\n";
            }
        } else {
            std::cout << "Unknown command: " << command << "\n";
        }
        std::cout << "\n> ";
    }
}
```

`linear` deliberately re-scans the *raw file* (not the hash table) to make LAB-16's O(n) vs O(1) gap directly, viscerally comparable within the exact same running tool, on the exact same data — you should be able to *feel* `linear` take measurably longer on a large file than `search`, not just read that it theoretically should. `top` combines LAB-14's value-extraction with LAB-15's sort, exactly LAB-19 Step 4's pattern — the right structure per query shape, composed rather than forced into one.

### SAVE AND TRY

Generate a genuinely large test file (50,000+ rows — write a small generator script, or use one you find/construct) and run both `search` and `linear` for the *same* ID near the end of the file. Time both by eye (or instrument with `<chrono>`) — confirm `linear` is dramatically, noticeably slower, a real, felt demonstration of every complexity-class discussion this entire series has had, now inescapably concrete.

## Step 3: The verification checklist — running every tool this series taught

**Checklist item 1 — Compile cleanly, with warnings enabled:**
```
$ g++ -Wall -Wextra -std=c++17 *.cpp -o record_store
```
Fix every warning, not just every error — `-Wall -Wextra` catches real bugs (like an uninitialized variable, or a signed/unsigned comparison mismatch) that compile without complaint under default settings.

**Checklist item 2 — AddressSanitizer, clean run, no leaks (LAB-20):**
```
$ g++ -fsanitize=address -g -std=c++17 *.cpp -o record_store_asan
$ ./record_store_asan employees.csv
> search E4821
> quit
```
Confirm the final output includes `0 bytes leaked in 0 allocations` — if it doesn't, that's a real bug this checklist just caught, not a false alarm; go find it using the exact same reasoning LAB-20 walked through for each of its five bugs.

**Checklist item 3 — Malformed input, doesn't crash (LAB-18/19):**
Deliberately corrupt a copy of your test CSV (delete a field from one row, put text in a salary field, add a blank line) and confirm the tool still loads, reports the correct skip count, and runs normally on the remaining good data.

**Checklist item 4 — Scale test (LAB-14/15/16's complexity claims, at real size):**
Run against a file with at least 50,000 rows and confirm `search` still feels instant while `linear` is noticeably, measurably slower — the complexity-class difference this series discussed abstractly in LAB-14/15/16, now verified at a scale where it actually matters.

### SAVE AND TRY

Run all four checklist items against your actual capstone build, in order, and fix whatever each one surfaces before moving to the next — do not skip ahead past a failing item. This order (compile warnings → memory safety → malformed input → scale) deliberately goes from cheapest-to-check to most-expensive-to-check, catching easy bugs before spending time on harder-to-diagnose ones.

## Step 4: What you'd do differently — a real, honest retrospective

There's no code in this step — just three questions worth answering in writing, based on your own actual experience building this series, not a hypothetical:

1. Which structure gave you the most trouble to get genuinely correct (not just "compiling"), and looking back, what specifically was hard about it — the pointer logic, the recursion, the Rule of Three discipline?
2. Pick one structure you built (`MyVector`, `MyHashMap`, whichever) and compare it directly against its real STL equivalent (`std::vector`, `std::unordered_map`) — read the actual cppreference documentation for that STL type now. What does the real version do that yours doesn't (exception safety guarantees, iterator support, allocator customization)? What does yours do that's *simpler*, and was that simplicity actually valuable for learning, even though it's not production-ready?
3. If your original DSA coursework's "given implementation" had a bug you now recognize from LAB-20's five patterns, which one was it — and can you now explain, precisely, in the vocabulary this series gave you, exactly what was wrong and why?

### SAVE AND TRY

Write real answers to all three, specifically about your own actual work in this series, not generic answers — question 3 in particular is worth genuinely trying to reconstruct from memory now that LAB-20 gave you the concrete vocabulary (dangling pointer, invalidation, off-by-one, leak, shallow-copy double-free) your original coursework may not have used explicitly.

## 🎯 Challenge

Extend the record store with one genuinely new feature of your own choosing, built entirely from structures already in this series — a `department` command listing every employee in a given department (reusing `MyVector` and a linear filter over `db.getAllValues()`), or a `graph` mode modeling which employees report to which manager (reusing LAB-17's `Graph` and BFS to answer "who's in Alice's management chain"). Whichever you choose, run the full Step 3 verification checklist against your extended version before considering it done.

<details>
<summary>Solution</summary>

There's no single solution here by design — this challenge is intentionally open, matching this lab's actual purpose: proving to yourself that this series' structures compose into things nobody wrote out for you in advance. A `department` filter might look like:

```cpp
MyVector<Record> filterByDepartment(MyHashMap<std::string, Record>& db, const std::string& dept) {
    MyVector<Record> all = db.getAllValues();
    MyVector<Record> filtered;
    for (int i = 0; i < all.getSize(); i++) {
        if (all[i].department == dept) {
            filtered.push_back(all[i]);
        }
    }
    return filtered;
}
```

— a direct, small composition of `MyHashMap::getAllValues()` (LAB-14's Challenge) and a plain linear filter over `MyVector` (LAB-06), needing no new structural code at all. Whatever you actually build, the real deliverable of this challenge is running it through Step 3's checklist and confirming it's genuinely clean — that verification habit, applied to your *own* new idea rather than a prescribed one, is the actual final skill this entire 21-lab series has been building toward.

</details>

## Mental Model

| Concept | Individual lab | This capstone |
|---|---|---|
| What's being tested | One structure, in isolation, on small examples | Every structure, together, at real scale, with real data |
| Correctness proof | "SAVE AND TRY passed" | "-fsanitize=address reports zero errors" |
| New code written | Yes, a new structure or technique each time | Almost none — recombination of what already exists |
| What a bug here means | A gap in understanding one concept | An integration mistake, or a component's edge case never tested at this scale |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does this capstone's Step 3 checklist matter even though every individual structure was already verified in its own lab? | |
| 2 | Why does the `linear` command deliberately re-scan the raw file instead of just walking the hash table's own internal storage? | |
| 3 | What's the actual, concrete difference between "my program compiled and gave the right answer on my test file" and "my program is correct," now that this series is complete? | |

## Quick Check Answers

*(These three are personal — answer them honestly about your own actual experience with this series; there's no single correct answer to check against, which is itself the point of ending the series this way rather than with another factual quiz.)*

## Series Complete

Twenty-one labs: five on the C++ language features DSA code actually needs (headers, classes, operators, RAII, templates), ten hand-built data structures (dynamic array through hash table), two algorithm families (sorting, searching) plus graphs, three labs on real file I/O and the searchable-database project this series was built around, one lab collecting the classic memory bugs by name, and this capstone proving all of it composes. Every structure in `std::` you use from here forward — `std::vector`, `std::list`, `std::unordered_map`, `std::sort` — is something you now understand from the inside, not a black box you were told to trust. That's the actual point of building all of it by hand first.
