# Programming Pearls in C++ — Handoff

**Status (2026-08-22):** New curriculum. Reads Jon Bentley's *Programming
Pearls*, 2nd edition, directly from its own real companion source code —
in `book-source/` — rather than through an intermediate teaching
language. Decided after the user confirmed their actual goal: apply the
book's ideas in C++, a language they have only "touched a few times,"
not a working background (see `[[user_role]]` memory, corrected
2026-08-19 after an earlier session wrongly assumed fluency). This
curriculum is book-first: each lesson is grounded in one real file from
`book-source/`, teaching whatever C++ that file actually uses, in the
order the file needs it — not a generic C++ fundamentals series
followed by the book.

**`book-source/`:** 25 real files (`.c` and `.cpp`), moved here from
`perl-getting-started/from the book examples/` on 2026-08-22 (that
folder was an earlier, abandoned plan — see
`perl-getting-started/HANDOFF.md`). All read directly from disk this
session, not reconstructed from memory. `.cpp` files (real C++, not C):
`priqueue.cpp`, `sets.cpp`, `sort.cpp`, `sortedrand.cpp`, `sortints.cpp`,
`spacemod.cpp`, `wordfreq.cpp`, `wordlist.cpp`. Everything else is `.c`.

**Starting point: `sortints.cpp`.** Chosen after reading `sortints.cpp`,
`sortedrand.cpp`, `sets.cpp`, `sort.cpp`, `priqueue.cpp`, `spacemod.cpp`,
`wordlist.cpp`, and `wordfreq.cpp` this session and comparing density:
- `sortints.cpp` (19 lines) — `#include <iostream>`/`<set>`, `cin >>`,
  `set<int>`, iterators, `cout <<` — clean, minimal, nothing else
  competing for attention. **Selected.**
- `wordlist.cpp` / `wordfreq.cpp` — natural next steps in the same
  family: `set<string>`, then `map<string,int>`.
- `sets.cpp` (427 lines) — nine different set implementations
  (STL, bit-vector, sorted array, linked list x2, BST x2, binned list
  x2), heavy on classes, pointers, recursion, bit manipulation. Major
  later material, not a starting point.
- `sort.cpp` (404 lines) — many sorting algorithms, C-style function
  pointers, casts. Advanced, not a starting point.
- `priqueue.cpp` — needs C++ templates (`template<class T>`) already
  understood. Save for after templates are taught.
- `spacemod.cpp` — multi-line macros, structs, templates used oddly on
  purpose (the file's own comment: "Must use macros; templates give
  funny answers"). Interesting later, not first.

**Why `sortints.cpp` needs to be split across more than one lesson:**
even at 19 lines, a real tokenization pass turns up a large number of
genuinely new-to-this-reader concepts: `#include`, header files,
`using namespace std;`, `main`'s role as entry point, `return 0;`'s
meaning, template instantiation (`set<int>`), class-type object
declaration, `::` scope resolution (`set<int>::iterator`), `cin`/`>>`,
a stream-truthiness `while` loop, dot-notation method calls, C-style
three-part `for`, `!=`, prefix `++`, `cout`/`<<`, and iterator
dereference (`*j`). Full schema treatment (isolated lab + full
walkthrough per concept) for all of that in one lesson would be a code
dump by volume alone. Planned split:
- **Lesson 1** — the shell every C++ program needs:
  `#include`/headers, `using namespace std;`, `int main()`, `return 0;`
  — demonstrated with a minimal throwaway program, not yet the real
  file.
- **Lesson 2** — the real `sortints.cpp` itself: `set<int>`, `cin >>`
  in a `while` condition, `insert`, `set<int>::iterator`, the C-style
  `for` loop, `begin()`/`end()`, `!=`, `++j`, `cout <<`, `*j`.

**Next up after `sortints.cpp` is done:** `wordlist.cpp` (swap `set<int>`
for `set<string>` — small, confirms the pattern generalizes), then
`wordfreq.cpp` (`map<string,int>`, `M[t]++`).

**Toolchain — not yet confirmed this session:** the user is on Windows.
No C++ compiler has been confirmed installed. Lesson 1 needs a real
Setup section (MinGW-w64/MSYS2, or Visual Studio's Build Tools, or
another concrete choice) before any code in this curriculum can actually
be compiled and run — this has not been decided yet and needs to happen
as part of Lesson 1, not deferred.

**Rigor level:** full Lesson Schema this time — no more usage-crunch
shortcuts. CRC breakdowns, isolated Concept Isolation labs with real
run output, full Vocabulary Extraction pass, self-check before
presenting each lesson.
