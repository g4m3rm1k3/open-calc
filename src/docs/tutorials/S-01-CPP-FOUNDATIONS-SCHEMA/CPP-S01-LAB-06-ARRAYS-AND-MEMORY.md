# Lesson 6: An Index Is Arithmetic Wearing a Bracket
### (LAB 06 — Arrays and Memory)

**What you will build:** A dungeon row inspector — ten `char` tiles stored in one array, individually modified to place a player and a goblin, printed by index and as a row, then deliberately read one past the end to see what "the compiler does not check this" actually looks like. The transferable problem: `tiles[5]` is not a magical lookup — it is `base_address + 5 × sizeof(char)`, computed the same way every time, with nothing stopping that computed address from landing outside the array entirely if the index is wrong.

**What you need to know first:** LAB-05 — functions, parameters, pass-by-value, scope. LAB-01's `sizeof` and `char`. LAB-04's `for` loop, zero-based counting.

**Terms introduced in this lesson**

> **Array** — a fixed-size, sequential block of memory holding multiple values of the same type, stored in consecutive addresses.
> **Index** — an integer selecting one element of an array, counted from `0`.
> **Address arithmetic** — computing an element's memory address as `base_address + index × element_size`.
> **Out-of-bounds access** — reading or writing an array index outside its valid range (`< 0` or `>= size`); C++ performs no automatic check.
> **Undefined behavior (UB)** — code whose result the C++ standard places no requirement on; a compiler is free to do anything, including something that happens to look correct.
> **AddressSanitizer (ASan)** — a compiler instrumentation option (`-fsanitize=address`) adding runtime bounds checking, for use during development.
> **Array-to-pointer decay** — an array, when passed as a function argument, converting to a pointer to its first element rather than being copied.

No pipeline diagram applies — S-01 builds standalone concept programs.

---

## Concept Unit 1: Arrays — Sequential, Same-Type Storage

### The Problem

Ten dungeon tiles need ten values of the same type — nothing so far provides a way to hold "ten `char`s" as one thing. Ten separate variables (`tile0`, `tile1`, ... `tile9`) has no way to be indexed by a variable `i`, looped over, or passed to a function as a single unit.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — new file for this lab.
- **Change type:** Add (new file).
- **Location:** Inside `main`'s body.
- **Dependencies:** `char` (LAB-01), `const` (LAB-02).

### The New Code

```cpp
char tiles[ROW_SIZE] = {'.', '.', '.', '.', '.', '.', '.', '.', '.', '.'};

std::cout << "Initial row:" << std::endl;
for (int i = 0; i < ROW_SIZE; ++i) {
    std::cout << "  tiles[" << i << "] = " << tiles[i] << std::endl;
}
```

### The Updated Project

```cpp
#include <iostream>

const int ROW_SIZE = 10;   // ← new

int main() {
    std::cout << "=== Dungeon Row Inspector ===" << std::endl;
    std::cout << std::endl;

    char tiles[ROW_SIZE] = {'.', '.', '.', '.', '.', '.', '.', '.', '.', '.'};   // ← new

    std::cout << "Initial row:" << std::endl;                                   // ← new
    for (int i = 0; i < ROW_SIZE; ++i) {                                        // ← new
        std::cout << "  tiles[" << i << "] = " << tiles[i] << std::endl;         // ← new
    }

    return 0;
}
```

### Concept Lab

No separate throwaway needed: `char tiles[ROW_SIZE] = {...}` *is* already the smallest demonstration of declaring and reading an array — building a disposable version with different names would teach nothing this real code doesn't already show cleanly.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
=== Dungeon Row Inspector ===

Initial row:
  tiles[0] = .
  tiles[1] = .
  tiles[2] = .
  tiles[3] = .
  tiles[4] = .
  tiles[5] = .
  tiles[6] = .
  tiles[7] = .
  tiles[8] = .
  tiles[9] = .
```

Verified this session, added as a direct check on the storage claim: `sizeof(tiles)` (LAB-01's operator, applied to an array for the first time) reports `10` — one byte per `char` element (LAB-01's byte table), ten elements, stored contiguously with no gaps or padding between them.

### Mechanical Walkthrough

- `char tiles[ROW_SIZE]` — **(a) first appearance.** Declares an array: element type (`char`), name (`tiles`), and size in brackets (`ROW_SIZE`) — fixed at declaration and never changeable afterward.
- `= {'.', '.', ..., '.'}` — **(a) first appearance.** An initializer list — one value per element, in order. A list shorter than the array's size zero-initializes the remaining elements (not exercised in this lesson's own code, but worth knowing).
- `tiles[i]` — **(a) first appearance.** The **index operator** (`[]`) — selects one element by position, counted from `0`.

### CS Lens

All elements sharing one type and one fixed size is what makes an array's indexing exact and fast — every element is reachable in the same constant amount of work regardless of its position, because the address is computed, not searched for. This "contiguous, uniform storage, computed access" shape is what every later container in this curriculum (`MyVector` in `CPP-S02-LAB-06`, and every array-backed structure after it) builds on and eventually generalizes past this fixed size.

### SE Lens

An array hides the individual memory addresses of its elements behind the `[]` operator — the same abstraction-over-addresses idea LAB-01 introduced for a single variable, now applied to ten of them at once: a programmer writes `tiles[3]`, never `0x7FFE3A4C`, and the compiler handles the translation.

### Connection

`tiles[i]` reads an element — Concept Unit 3 makes the address arithmetic behind that bracket explicit, but first, Concept Unit 2 writes to individual elements.

---

## Concept Unit 2: Modifying Individual Elements

### The Problem

The row inspector so far only reads tiles set at declaration — a real dungeon needs individual positions changed at runtime, like placing a player or a monster.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (two sections).
- **Location:** After the initial print, before `return 0;`.
- **Dependencies:** `tiles`, `ROW_SIZE` (Concept Unit 1).

### The New Code

```cpp
std::cout << std::endl;
std::cout << "After placing the player at index 5:" << std::endl;
tiles[5] = '@';

for (int i = 0; i < ROW_SIZE; ++i) {
    std::cout << tiles[i] << " ";
}
std::cout << std::endl;
```

(A second, identical block follows for `tiles[8] = 'G';` — a goblin — omitted here since it repeats this exact shape with a different index and character.)

### The Updated Project

Appended after Concept Unit 1's initial-print loop, before `return 0;` — both the player and goblin sections follow this same pattern in sequence.

### Concept Lab

No separate throwaway: `tiles[5] = '@';` is the smallest possible demonstration of writing to an array element, and it's already the real project code.

Run it — verified this session:

```
$ ./dungeon.exe
...
After placing the player at index 5:
. . . . . @ . . . . 

After placing a goblin at index 8:
. . . . . @ . . G .
```

What that proves: `tiles[5] = '@'` overwrote only index `5`, leaving every other index unchanged (still `.`) — and the second assignment, `tiles[8] = 'G'`, both changed index `8` *and* preserved index `5`'s earlier `'@'`, confirming each element is independently addressable and previous writes persist until explicitly overwritten again.

### Mechanical Walkthrough

- `tiles[5] = '@';` — **(a) first appearance of writing through the index operator**, distinct from Concept Unit 1's read-only use — `[]` works on both sides of `=`, exactly the way a plain variable does.

### CS Lens

`tiles[5]` on the left of `=` and `tiles[i]` on the right of `<<` are the same operation — computing an address and accessing what's there — differing only in whether that access is a read or a write, the same read-versus-write distinction that applies to any variable.

### SE Lens

Placing the player and the goblin by writing directly to computed indices (`5`, `8`) rather than through any higher-level "place object" concept is deliberately minimal for this lesson — it's the array itself doing the work, with no abstraction layer yet hiding what index arithmetic actually is. `S-02-SNAKE` builds exactly this kind of grid-position logic into a real game.

### Connection

`tiles[i]` has now been read and written many times — Concept Unit 3 explains precisely what that bracket computes underneath.

---

## Concept Unit 3: Address Arithmetic — What `[]` Actually Computes

### The Problem

`tiles[5]` reliably reaches the sixth element every time, on every array, regardless of size or type — that reliability needs an actual mechanism, not just trust that the brackets "know what to do."

### No isolated code lab for this step

This is a representational fact about memory layout, not new C++ syntax — no code to isolate; the arithmetic itself is the content.

### Explanation

Every array element's address follows one formula:

```
address of element[i] = base_address + (i × element_size)
```

For a 4-byte `int` array starting at address `1000`:

```
Index │ Address │ Calculation
──────┼─────────┼────────────────────
  [0] │ 1000    │ 1000 + 0 × 4 = 1000
  [1] │ 1004    │ 1000 + 1 × 4 = 1004
  [2] │ 1008    │ 1000 + 2 × 4 = 1008
  [5] │ 1020    │ 1000 + 5 × 4 = 1020
```

Zero-based indexing is a direct consequence of this formula, not an arbitrary convention: for the *first* element, `i = 0`, so the offset is `0 × element_size = 0` — the address is exactly `base_address`, no adjustment needed. If arrays were 1-indexed instead, the first element would sit at `base_address + 1 × element_size`, and every single index calculation would need an extra `- 1` to compensate. Zero-based indexing is the version of this formula that needs no correction term.

### CS Lens

This same `base + index × element_size` formula is not unique to C++ arrays — it's how row-major 2D array storage works (relevant the moment a grid, like LAB-04's dungeon, is stored as one flat array instead of nested arrays), how a CPU's own indexed-addressing instructions work at the hardware level, and how every array-like structure in every language with fixed-size, typed elements computes access, whether or not that language exposes the arithmetic directly.

### SE Lens

Because this formula depends on every element being the *same* size, an array cannot mix types the way some other languages' collections can without additional machinery — this uniformity is exactly what makes `[]` a constant-time, single-multiplication-and-addition operation instead of something that has to search or check types at each access.

### Connection

Concept Unit 4 asks what happens when an index is given that this formula computes an address for, but which lands outside the array entirely.

---

## Concept Unit 4: Out-of-Bounds Access — The Silent Disaster

### The Problem

`tiles` has valid indices `0` through `9`. Concept Unit 3's formula computes a real address for `tiles[10]` too — `base + 10 × sizeof(char)` — one byte past the array's actual allocated memory. Does C++ stop that access?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified, temporarily, for this experiment only (removed afterward per this unit's own Watch for).
- **Change type:** Add (temporary).
- **Location:** End of `main`, before `return 0;`.
- **Dependencies:** `tiles` (Concept Unit 1).

### The New Code

```cpp
std::cout << std::endl;
std::cout << "=== Out-of-Bounds Demonstration ===" << std::endl;
std::cout << "tiles[10] (one past the end): " << tiles[10] << std::endl;
```

### Concept Lab

```cpp
// scratch_oob.cpp  (disposable — the deliberate UB lives only here, never in the real project)
#include <iostream>
int main() {
    char tiles[10] = {'.', '.', '.', '.', '.', '.', '.', '.', '.', '.'};
    std::cout << "tiles[10] (one past the end): " << tiles[10] << std::endl;
}
```

Compiling and running plainly first — verified this session:

```
$ g++ -std=c++17 -Wall -Wextra -g scratch_oob.cpp -o scratch_oob_plain
$ ./scratch_oob_plain.exe
tiles[10] (one past the end): 
```

No error, no warning, no crash — just an empty-looking character, whatever byte happened to occupy that memory. **Correcting an assumption before repeating it:** this lesson's own AddressSanitizer instructions (`-fsanitize=address`) were tested this session and did *not* work on this exact toolchain:

```
$ g++ -std=c++17 -Wall -Wextra -g -fsanitize=address scratch_oob.cpp -o scratch_oob
C:/mingw64/.../ld.exe: cannot find -lasan: No such file or directory
```

This specific MinGW-w64 GCC 14.2.0 build does not ship `libasan` — the linker fails outright, before the program can even run. **If your own toolchain hits the identical linker error, this is not something you did wrong** — some MinGW-w64 distributions include AddressSanitizer, others don't, and this is worth checking rather than assuming. Where it *is* available, the expected result is a descriptive runtime error (`ERROR: AddressSanitizer: stack-buffer-overflow...`) instead of silent garbage — but the honest, verified result on this machine is the plain, silent version above: nothing crashed, nothing warned, and the program printed something meaningless as if it were valid data.

Both files are discarded/reverted now — the out-of-bounds line is added to the real `main.cpp` only long enough to compile and observe once, then deleted, per this unit's own Watch for.

### Mechanical Walkthrough

- `tiles[10]` — **(a) first appearance of an index computed to land outside an array's allocated storage.** Per Concept Unit 3's formula, this is `base + 10 × sizeof(char)` — a real, computable address, just not one `tiles` actually owns.

### CS Lens

This is **undefined behavior (UB)** — not "an error the language forgot to define," but a deliberate category the C++ standard uses: once code does this, the standard places *no* requirement on what happens next, and a compiler is permitted to do literally anything, including something that happens to look correct on one run and not another. This differs from LAB-01's signed-integer-overflow UB only in *what* goes wrong; both share the same "the standard promises nothing here" status.

### SE Lens

C++ does not bounds-check every array access by default because that check — one extra comparison per access — has a real, measurable cost at the scale this language is often used for: a game running at 60 frames per second, touching a grid thousands of times per frame (LAB-04's nested-loop cost, revisited), pays that comparison's cost every single time, whether or not the index was ever actually wrong. C++ trades that safety for speed and trusts the programmer instead — a real, debatable tradeoff, not an oversight; `std::vector` (introduced properly later in this curriculum) offers bounds-checked access via `.at()` specifically for when that tradeoff should go the other way.

### Watch for

The consequences of an out-of-bounds access range from a meaningless read (as verified above) to overwriting an unrelated variable, to a crash, to — in the worst case, when the array lives in a location an attacker can influence — a security exploit (a **buffer overflow**, writing past an array into memory that controls program execution, covered as an attack technique later in this curriculum). Never leave a deliberate out-of-bounds access in real code, even after confirming what it does once — the "what it does" is, by definition, not guaranteed to stay the same.

### Connection

Every array access from here on in this lesson stays within `[0, ROW_SIZE)` — Concept Unit 5 turns to a different question: what happens to `tiles` when it's handed to a function.

---

## Concept Unit 5: Arrays Decay to Pointers When Passed to Functions

### The Problem

LAB-05 proved that plain parameters are copies — `attemptChange`'s `value = 999` never touched the caller's `score`. Does the same hold for an array parameter, or does passing ten `char`s to a function work differently from passing one `int`?

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified (three inline print loops consolidated into one function).
- **Change type:** Refactor (LAB-05's own extraction pattern, applied here to an array-taking function).
- **Location:** Declaration/definition alongside existing functions; `main`'s three print loops replaced with calls.
- **Dependencies:** `tiles`, `ROW_SIZE` (Concept Unit 1), function syntax (LAB-05).

### The New Code

```cpp
void printRow(char tiles[], int size);

void printRow(char tiles[], int size) {
    for (int i = 0; i < size; ++i) {
        std::cout << tiles[i] << " ";
    }
    std::cout << std::endl;
}
```

### The Updated Project

Every inline `for (int i = 0; i < ROW_SIZE; ++i) { std::cout << tiles[i] << " "; } std::cout << std::endl;` block in `main` (Concept Units 1–2) is replaced by a single `printRow(tiles, ROW_SIZE);` call.

### Concept Lab

```cpp
// scratch_decay.cpp  (disposable)
#include <iostream>
void printRow(char tiles[], int size) {
    std::cout << "sizeof(tiles) inside printRow = " << sizeof(tiles) << std::endl;
    for (int i = 0; i < size; ++i) {
        std::cout << tiles[i] << " ";
    }
    std::cout << std::endl;
}
int main() {
    char tiles[10] = {'.', '.', '.', '.', '.', '.', '.', '.', '.', '.'};
    tiles[5] = '@';
    printRow(tiles, 10);
}
```

Compiling and running — verified this session:

```
$ g++ scratch_decay.cpp -o scratch_decay -std=c++17 -Wall -Wextra
scratch_decay.cpp:4:63: warning: 'sizeof' on array function parameter 'tiles' will return size of 'char*' [-Wsizeof-array-argument]
    4 |     std::cout << "sizeof(tiles) inside printRow = " << sizeof(tiles) << std::endl;
scratch_decay.cpp:3:20: note: declared here
    3 | void printRow(char tiles[], int size) {
$ ./scratch_decay.exe
sizeof(tiles) inside printRow = 8
. . . . . @ . . . . 
```

What that proves, in two parts. First: `printRow` correctly printed the `@` placed at index 5 in `main` — it is genuinely operating on `main`'s own array, not a copy, unlike LAB-05's pass-by-value `int` parameters. Second, and more surprising: `sizeof(tiles)` *inside* `printRow` reports `8`, not `10` — and GCC itself warns about exactly this, by name (`-Wsizeof-array-argument`), under `-Wall -Wextra`. `8` is the size of a memory address (a pointer) on this 64-bit system, not the array's element count. This is **array-to-pointer decay**: when an array is passed as a function argument, C++ does not copy its contents — it passes the memory address of the first element, and inside the function, the parameter is genuinely a pointer, even though it's written with `[]` syntax that looks like an array declaration. The function has no way to recover the original size from `tiles` alone — `size` must be passed separately, exactly as `printRow`'s own signature already does.

This scratch file is discarded now; the real `printRow` in `main.cpp` never calls `sizeof` on its `tiles` parameter — it only ever uses the separately-passed `size`, precisely to avoid this trap.

### Mechanical Walkthrough

- `void printRow(char tiles[], int size)` — **(a) first appearance of an array parameter.** `char tiles[]` in a parameter list is accepted syntax but is not actually an array type here — per the Concept Lab's proof, it is a pointer to `char`, and the compiler treats it as one.
- `printRow(tiles, ROW_SIZE)` — **(a) first appearance of passing an array as an argument**, distinct from LAB-05's plain-value arguments — no copy is made; the address of `tiles[0]` is what's actually passed.

### CS Lens

Passing an address instead of copying the whole array is the same performance reasoning that justified pass-by-*reference* in the first place (previewed in LAB-05, formalized in LAB-09): copying a large array — imagine a 1000×1000 game grid — on every function call would be slow and would consume enormous stack space for no benefit, since the function usually only needs to *read* or *modify in place*, not own an independent copy.

### SE Lens

This is a real, sharp-edged inconsistency in C++'s own design, worth naming plainly rather than smoothing over: a plain `int` parameter is copied (LAB-05); an array parameter is not, despite looking like an ordinary parameter in the function's signature. A programmer coming from a language where "parameters are always copies" or "parameters are always references," consistently, will get this specific case wrong by default. `printRow` modifying `tiles[i]` would silently modify `main`'s original array — this course's `printRow` never does, but `fillRow`, next, deliberately relies on exactly this behavior.

### Watch for

Never call `sizeof` on an array parameter inside the function that received it — per the Concept Lab's verified proof, it returns the pointer's size (`8` on this system), not the array's element count, and GCC's own `-Wsizeof-array-argument` warning exists specifically to catch this. Always pass the size as a separate parameter, as `printRow` and `fillRow` both do.

### Run It

```
$ ./dungeon.exe
```

Verified this session — output identical to Concept Units 1–2, now produced by three `printRow(tiles, ROW_SIZE);` calls instead of three inline loops.

### Connection

`fillRow`, next, is a function that exists *specifically because* array parameters aren't copied — writing to `tiles[i]` inside it changes the caller's real array.

---

## Concept Unit 6: `fillRow` — Writing Through a Decayed Array

### The Problem

Resetting every tile back to `'.'` currently means writing ten separate assignment lines, or a loop repeated wherever a reset is needed — Concept Unit 5's array decay means this can, for the first time, be a function that genuinely mutates the caller's data, not just reads it.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** Alongside `printRow`'s declaration/definition; called from `main`.
- **Dependencies:** Array decay (Concept Unit 5).

### The New Code

```cpp
void fillRow(char tiles[], int size, char fillChar);

void fillRow(char tiles[], int size, char fillChar) {
    for (int i = 0; i < size; ++i) {
        tiles[i] = fillChar;
    }
}
```

### The Updated Project

Added alongside `printRow`; called from `main` as `fillRow(tiles, ROW_SIZE, '.'); printRow(tiles, ROW_SIZE);` to reset and confirm.

### Concept Lab

No separate throwaway: this reuses Concept Unit 5's own `scratch_decay.cpp` pattern, extended with a write instead of a read — the real `fillRow` is itself the clearest demonstration.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
```

The output (elided here — matches Concept Units 1–2 for the player/goblin sections) is followed by a reset section confirming every tile prints `.` again after `fillRow(tiles, ROW_SIZE, '.')`, including index `5` and `8`, both previously overwritten with `@` and `G`.

### Mechanical Walkthrough

- `tiles[i] = fillChar;` — **(c) already basic** (Concept Unit 2's write-through-index), executed here inside a function on a decayed-to-pointer parameter (Concept Unit 5) — the write reaches `main`'s real array precisely because no copy was ever made.

### CS Lens

`fillRow` is the same **general-purpose function** shape LAB-05's `getValidInput` established — parameterized over exactly what varies (`size`, `fillChar`) while the "loop over every index and act" structure stays fixed, reusable for resetting to `'.'`, walling with `'#'`, or any other single-character fill, with zero new code required for each.

### SE Lens

That `fillRow` can modify `main`'s original array — with no `&` and no special syntax marking it as "this one is different" — is exactly the sharp edge Concept Unit 5's SE Lens named: reading `fillRow(tiles, ROW_SIZE, '.')` in `main` gives no visual signal, at the call site, that this call is about to overwrite ten values in place. Contrast this with LAB-09's references, which make an intentionally-mutating parameter explicit in the function's own signature — arrays get this behavior "for free," whether a specific function actually wants it or not.

### Connection

This closes every new concept in this lesson — the Closing section traces one index through the whole program, from declaration to a function call that writes to it.

---

## Closing

### Connect the pieces

Follow index `5` through the finished program: `char tiles[ROW_SIZE]` (Concept Unit 1) reserves 10 contiguous bytes; `tiles[5]`'s address is `base_address + 5 × sizeof(char)` (Concept Unit 3) — `base_address + 5`, since a `char` is one byte. `tiles[5] = '@';` (Concept Unit 2) writes there directly. `printRow(tiles, ROW_SIZE)` (Concept Units 5–6) passes not a copy of all ten bytes but the address of `tiles[0]` alone — inside `printRow`, `tiles[5]` computes that *same* address again, from a decayed pointer instead of the original array variable, and reads the identical `'@'` back. Later, `fillRow(tiles, ROW_SIZE, '.')` writes `'.'` to that same address, through the same decayed pointer — and because no copy was ever made anywhere in this chain, `main`'s own `tiles[5]`, read afterward, reflects that overwrite immediately.

### What breaks without this

The out-of-bounds experiment (Concept Unit 4) already showed the "no crash, just garbage" failure mode directly. A second, different failure worth seeing: change `printRow(char tiles[], int size)`'s body to loop `for (int i = 0; i <= size; ++i)` (LAB-04's off-by-one danger, `<=` instead of `<`) instead of the correct `<`. Reasoned through, not run: this would read `tiles[size]` — for `ROW_SIZE = 10`, `tiles[10]` — the exact same out-of-bounds address Concept Unit 4 already proved is unchecked and unpredictable. A single off-by-one in a loop bound is, mechanically, the identical mistake as hardcoding a bad index — LAB-04's loop-bound danger and this lesson's array-bound danger are the same failure, reached from two different directions.

### Exercises

1. Change the initializer list so `tiles[4] = '#'` from the start, rebuild, and confirm the "Initial row" printout shows `#` at index 4 — an array's initializer list sets starting values the same way a plain variable's `= value` does.
2. Verified this session that `sizeof(tiles)` in `main` (where `tiles` is still a real array, not a decayed parameter) reports `10`. Confirm this yourself, then add the identical `sizeof(tiles)` call inside `printRow` and confirm it reports `8` instead, reproducing Concept Unit 5's own proof on your own build.
3. Write and run the out-of-bounds experiment from Concept Unit 4 for real, in your own `main.cpp`, exactly once — observe whatever this specific run happens to print — then delete the line immediately afterward, per this unit's own Watch for.
4. Write a new function `int countChar(char tiles[], int size, char target)` that returns how many elements equal `target`, and call it to count the floor tiles (`'.'`) remaining after placing the player and the goblin — confirm it returns `8` for a 10-tile row with two non-floor tiles placed.

### Definition of done

- [ ] `main.cpp` declares a `char` array, modifies individual elements by index, and prints it through a `printRow` function.
- [ ] `fillRow` resets the array to a chosen fill character, verified by a `printRow` call immediately after.
- [ ] The out-of-bounds experiment was run for real at least once, its actual (not predicted) output observed, and the line removed afterward — no UB remains in the committed code.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra` in its final, committed form.
- [ ] You can state, from Concept Unit 5's own proof, why `sizeof` on an array parameter inside a function is wrong, and what to use instead.
- [ ] You can explain array-to-pointer decay well enough to predict, before running it, whether a given function can modify the caller's original array.
- [ ] All four Exercises completed with real compiled output.
- [ ] Commit: `git add main.cpp && git commit -m "LAB-06: dungeon row array, index-based modification, printRow/fillRow, verified out-of-bounds behavior"` — states why (a working tile row with its real memory behavior verified, not assumed) not just what changed.
