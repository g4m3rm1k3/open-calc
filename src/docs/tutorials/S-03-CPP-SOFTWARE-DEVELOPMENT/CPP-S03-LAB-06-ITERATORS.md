# Lesson 6: A Range-Based `for` Is Two Iterators Wearing a Trenchcoat
### (LAB 06 — Iterators)

**What you will build:** The same container operations this bridge series has used all along — printing, searching, erasing — rewritten with explicit iterators instead of range-based `for`, ending with a real, verified bug (erasing while iterating incorrectly) and its fix. The transferable problem: every `for (auto& x : container)` since `S-01-CPP-FOUNDATIONS` LAB-07 has hidden a real mechanism underneath — two objects, a beginning and an end, that every standard container provides in the same shape regardless of whether it's a `std::vector` (contiguous array) or a `std::map` (a tree). Lesson 7's algorithms need that uniform shape directly; this lesson opens it up first.

**What you need to know first:** This series' Lesson 5 — `std::vector`, `std::map`, `std::unordered_map`, `std::set`, `.find()`/`.end()`. `S-01-CPP-FOUNDATIONS` LAB-08 — pointers, dereferencing (the mechanism iterators generalize).

**Terms introduced in this lesson**

> **Iterator** — an object generalizing a pointer's `*`/`++` interface to work over any container, regardless of its internal structure.
> **`.begin()` / `.end()`** — a container's own iterator to its first element, and a sentinel iterator one past the last — what a range-based `for` uses internally.
> **Iterator category** — a classification of what operations an iterator supports: forward-only (`++`), bidirectional (`++`/`--`), or random-access (`+`, `-`, `[]`) — determined by the container's own internal structure.
> **`const_iterator`** — an iterator that permits reading but not writing through it.
> **Iterator invalidation** — an operation on a container (like `erase`) that makes some or all of its existing iterators unusable, with undefined results if used afterward.
> **Reverse iterator (`.rbegin()`/`.rend()`)** — an iterator that traverses a container back to front, using the identical `++`/`*` interface as a forward iterator.

No pipeline diagram applies — this bridge series builds standalone concept programs.

---

## Concept Unit 1: `.begin()` / `.end()` — What Range-Based `for` Actually Does

### The Problem

`for (int hp : hps)` has printed, searched, and processed containers throughout this entire curriculum, but never once shown what it expands into. Lesson 7's algorithms need that expanded form directly, since they don't accept a container — they accept a *range*, expressed as two iterators.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — new file for this lesson.
- **Change type:** Add (new file).
- **Location:** Inside `main`.
- **Dependencies:** `std::vector` (this series' Lesson 5).

### The New Code

```cpp
for (std::vector<int>::iterator it = hps.begin(); it != hps.end(); ++it) {
    std::cout << *it << " ";
}
```

### Concept Lab

No separate throwaway: run side by side with a range-based `for` over the identical data, below, this real code is the demonstration.

Run it — verified this session:

```
$ g++ scratch_begin_end.cpp -o scratch_begin_end -std=c++17 -Wall -Wextra
$ ./scratch_begin_end.exe
--- range-based for ---
100 80 90 
--- explicit iterator loop, same result ---
100 80 90
```

What that proves: identical output from two different-looking loops over the identical `std::vector<int>`. `for (int hp : hps)` is, precisely, syntactic sugar (`S-01-CPP-FOUNDATIONS` LAB-02's own term for this kind of thing, applied here to control flow instead of an operator) for `hps.begin()` as a starting point, `hps.end()` as the stopping condition, and `++`/`*` to advance and read — every range-based `for` this entire curriculum has ever written has been doing exactly this, silently.

### Mechanical Walkthrough

- `hps.begin()` — **(a) first appearance, made explicit.** Returns an **iterator** referring to the container's first element.
- `hps.end()` — **(a) first appearance, made explicit.** Returns a sentinel iterator referring to *one past* the last element — never a real element itself, only ever compared against, the identical "past the end" idea `S-01-CPP-FOUNDATIONS` LAB-06's own out-of-bounds-index warning described, here made a safe, well-defined value specifically for comparison.
- `it != hps.end()` — **(a) first appearance of an iterator comparison as a loop condition.** `S-01-CPP-FOUNDATIONS` LAB-07's own `std::string::npos` sentinel pattern, generalized: `.end()` means "nothing here," checked the same way.
- `*it`, `++it` — **(a) first appearance of `*`/`++` on something that isn't a raw pointer.** Both are **overloaded** (this series' Lesson 1's own term, there applied to `+`) on the iterator type to *behave* like a pointer's dereference and increment, even though `hps.begin()`'s actual type is a class, not a raw `int*`.

### CS Lens

An iterator is a **generalization of a pointer** — `S-01-CPP-FOUNDATIONS` LAB-08 proved `tiles[i]` and `*(tiles + i)` are the same operation for a raw array; an iterator takes that "advance, then dereference" interface and makes it work identically for containers with no contiguous memory at all (a `std::map`'s tree, `S-02-CPP-DSA-MASTERY` LAB-13's own BST, has no meaningful "add 1 to this address" operation — its iterator's `++` instead walks to the tree's next in-order node).

### SE Lens

Because every standard container exposes the identical `.begin()`/`.end()`/`*`/`++` interface, one loop shape — and, starting Lesson 7, one *algorithm* — works unmodified across a `std::vector`, a `std::list`, a `std::map`, or a `std::set`, despite their wildly different internal structures (`S-02-CPP-DSA-MASTERY` LAB-06 through LAB-14's own proof of how different those internals really are).

### Connection

Concept Unit 2 shows that not every container's iterator supports the *same* operations — the interface is uniform for `*`/`++`, but diverges past that point.

---

## Concept Unit 2: Iterator Categories — Not Every Iterator Can Jump

### The Problem

A `std::vector`'s elements are contiguous in memory (`S-02-CPP-DSA-MASTERY` LAB-06's own `MyVector`) — jumping forward by `N` positions is a single address calculation. A `std::list`'s elements are scattered, linked by pointers (`S-02-CPP-DSA-MASTERY` LAB-07/08) — "jumping forward by `N`" has no faster implementation than following `N` links one at a time. Does `vector`'s iterator support an operation `list`'s cannot?

### Concept Lab

```cpp
// scratch_random_access.cpp  (disposable)
#include <iostream>
#include <vector>
#include <list>
int main() {
    std::vector<int> v = {10, 20, 30, 40};
    auto vit = v.begin();
    vit += 2;   // jump 2 positions directly
    std::cout << "vector: *vit after +=2: " << *vit << std::endl;

    std::list<int> l = {10, 20, 30, 40};
    auto lit = l.begin();
    ++lit; ++lit;   // list iterators: only one step at a time
    std::cout << "list: *lit after two ++: " << *lit << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_random_access.cpp -o scratch_random_access -std=c++17 -Wall -Wextra
$ ./scratch_random_access.exe
vector: *vit after +=2: 30
list: *lit after two ++: 30
```

Both reach the same value, `30`, but by different means — `vector`'s iterator supports `+=` directly; `list`'s was advanced with two separate `++`. Attempting `+=` on a `list` iterator directly — verified this session:

```
$ echo '...same code, but: it += 2; on a std::list<int>::iterator...' > scratch_list_plusequals.cpp
$ g++ scratch_list_plusequals.cpp -o scratch_list_plusequals -std=c++17 -Wall -Wextra
scratch_list_plusequals.cpp:5:8: error: no match for 'operator+=' (operand types are 'std::_List_iterator<int>' and 'int')
```

What that proves: `list`'s iterator genuinely does not support `+=` at all — this is not a runtime restriction, it's a compile-time one; the type itself has no such operator. `vector`'s iterator is a **random-access iterator** (supports `+`, `-`, `+=`, `[]`, direct jumps); `list`'s is only a **bidirectional iterator** (`++`/`--`, one step at a time, forward or backward, per its own already-proven doubly-linked structure).

Both scratch files are discarded now; code written generically against "any iterator" (Lesson 7's own algorithms) restricts itself to only the operations *every* iterator category supports (`*`, `++`, `!=`) unless it specifically needs and checks for random access.

### Mechanical Walkthrough

- `vit += 2;` — **(a) first appearance of iterator arithmetic**, legal only because `vector`'s iterator is random-access — the same address-jump computation `S-01-CPP-FOUNDATIONS` LAB-06's own array-indexing formula already proved for raw arrays.

### CS Lens

Iterator categories are a real, compiler-enforced hierarchy: every random-access iterator is also bidirectional and forward (it supports everything those weaker categories require, plus more); a `list`'s bidirectional iterator is not random-access, and no amount of wanting it to be changes the underlying cost of "jump forward by N" on a linked structure — the type system reflects the real, unavoidable cost difference `S-02-CPP-DSA-MASTERY`'s own labs already proved between contiguous and linked storage.

### SE Lens

A function template (`S-02-CPP-DSA-MASTERY` LAB-05) written to accept "any iterator" and use `+=` internally will simply fail to compile the moment someone calls it with a `list`'s iterator — the exact same category of compile-time safety `S-02-CPP-DSA-MASTERY` LAB-02's `private` and this series' own `= delete` provide elsewhere: a mismatch that can't happen becomes a mismatch the compiler refuses to build, not a runtime surprise.

### Connection

Concept Unit 3 shows a different iterator restriction — not about *how far* you can move, but whether you're allowed to write through what you're looking at.

---

## Concept Unit 3: `const_iterator` — Read-Only Traversal

### The Problem

Some code needs to *read* every element of a container without ever intending to modify any of them — nothing so far has distinguished "an iterator that can write" from "an iterator that can only read," the same read/write distinction `S-01-CPP-FOUNDATIONS` LAB-08 drew for raw pointers via `const`.

### Concept Lab

```cpp
// scratch_const_it.cpp  (disposable)
#include <vector>
int main() {
    std::vector<int> hps = {100, 80, 90};
    auto it = hps.cbegin();
    *it = 50;   // attempt to write through a const_iterator
    return 0;
}
```

Compiling — verified this session:

```
$ g++ scratch_const_it.cpp -o scratch_const_it -std=c++17 -Wall -Wextra
scratch_const_it.cpp:5:9: error: assignment of read-only location '...'
    5 |     *it = 50;
      |     ~~~~^~~~
```

What that proves: `.cbegin()` (the `c` prefix — "const begin") returns a `const_iterator`, which permits `*it` for reading but refuses to compile `*it = 50;` — the identical `const`-correctness guarantee `S-01-CPP-FOUNDATIONS` LAB-02 and `S-02-CPP-DSA-MASTERY` LAB-02 both already established, applied here to what an iterator is allowed to do to the element it refers to.

This scratch file is discarded now; a range-based `for (const auto& x : container)` (used throughout this bridge series' own read-only loops) is doing exactly this underneath — `const auto&` deduces a `const`-qualified reference, the same protection as an explicit `const_iterator`, per this unit's own proof.

### Mechanical Walkthrough

- `hps.cbegin()` — **(a) first appearance.** Returns a `const_iterator` even when called on a non-`const` container — distinct from `.begin()`, which returns a regular, writable `iterator`.

### CS Lens

`const_iterator` versus `iterator` is the same read/write access-level distinction that appears throughout this bridge series — `Character`'s `protected` (Lesson 1), `const&` parameters (`S-01-CPP-FOUNDATIONS` LAB-09) — here applied specifically to traversal, so a function that only needs to *read* a container's elements can declare that intent in its own iterator type, the same way a `const&` parameter declares it for a whole argument.

### Connection

Concept Unit 4 shows the one situation where even a correctly-typed, writable iterator can go wrong — not from the wrong permissions, but from the container itself changing shape mid-traversal.

---

## Concept Unit 4: Iterator Invalidation — Erasing While Iterating

### The Problem

`.erase()` (this series' Lesson 5) removes an element from a container — but iterators are tied to a container's current internal layout. What happens to an iterator that was pointing *near* the element just erased?

### Concept Lab

```cpp
// scratch_erase_skip.cpp  (disposable -- the naive, wrong version)
#include <iostream>
#include <vector>
int main() {
    std::vector<int> hps = {0, 0, 100, 90};   // two "dead" (0 HP) entries, consecutively
    for (auto it = hps.begin(); it != hps.end(); ++it) {
        if (*it == 0) {
            hps.erase(it);
        }
    }
    std::cout << "result (expected: 100 90): ";
    for (int hp : hps) std::cout << hp << " ";
    std::cout << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_erase_skip.cpp -o scratch_erase_skip -std=c++17 -Wall -Wextra
$ ./scratch_erase_skip.exe
result (expected: 100 90): 0 100 90
```

**A real, verified bug, worth tracing exactly:** the expected result — every zero-HP entry removed — is `100 90`. The actual result is `0 100 90`: one zero-HP entry survives. Here's why: `vector::erase(it)` removes the element `it` points to and **shifts every subsequent element left by one** (`S-01-CPP-FOUNDATIONS` LAB-13's own O(n) shift, reused internally by `vector::erase` itself) — the *value* `it` now points to, immediately after `erase` returns, is whatever *used* to be the next element, not "the element after the one just erased" in any independent sense. The loop's own `++it` then advances *past* that shifted-into element without ever checking it — the second consecutive zero was shifted into the position `it` already occupied, and `++it` skipped right over it.

The fix — using `erase`'s own return value:

```cpp
// scratch_erase_correct.cpp  (disposable -- the fix)
#include <iostream>
#include <vector>
int main() {
    std::vector<int> hps = {100, 0, 80, 0, 90};
    for (auto it = hps.begin(); it != hps.end(); ) {
        if (*it == 0) {
            it = hps.erase(it);   // erase returns an iterator to the NEXT valid element
        } else {
            ++it;
        }
    }
    for (int hp : hps) std::cout << hp << " ";
    std::cout << std::endl;
}
```

```
$ g++ scratch_erase_correct.cpp -o scratch_erase_correct -std=c++17 -Wall -Wextra
$ ./scratch_erase_correct.exe
100 80 90
```

What that proves: `vector::erase(it)` **returns** a fresh, valid iterator to whatever now occupies the erased position — using *that* returned iterator (`it = hps.erase(it);`) instead of blindly `++it`-ing afterward correctly lands on the next real element every time, never skipping one. The loop's own `++it` moved *inside* the `else` branch specifically so it never runs on the same iteration `erase` already advanced.

**A further, more severe consequence, verified separately this session:** with `-D_GLIBCXX_ASSERTIONS` (the standard library's own lightweight debug checks) enabled and a specific data arrangement, the naive version doesn't just skip an element — it **segfaults**, a real, observed crash from continuing to use an iterator the container's own internal bookkeeping considered stale. Whether a given misuse "merely" skips data or crashes outright depends on exact memory layout — undefined behavior, precisely as `S-01-CPP-FOUNDATIONS` LAB-06/LAB-08 both already warned, is never guaranteed to fail the same way twice.

Both scratch files are discarded now; every erase-while-iterating pattern in real project code from this lesson forward uses `erase`'s own return value.

### Mechanical Walkthrough

- `hps.erase(it);` (result discarded) — **(a) first appearance of iterator invalidation encountered as a real, verified bug**, not just a warning to remember.
- `it = hps.erase(it);` — **(a) first appearance of using `erase`'s return value correctly.** `erase` always returns an iterator to the element now occupying the erased position (or `.end()`, if the erased element was last) — the one and only iterator guaranteed valid immediately after the call.

### CS Lens

This is the exact same "the container's own internal state changed, and something is still trusting the old state" family of bug as `S-01-CPP-FOUNDATIONS` LAB-13's own forgotten `--count;` warning (an array's real contents and the program's belief about them disagreeing) — here, the disagreement is between an iterator's remembered position and the container's actual, just-changed layout.

### SE Lens

**The rule this verified proof justifies:** never assume an iterator remains valid after any operation that can change a container's size or layout (`erase`, `insert`, and for `vector` specifically, anything that might trigger reallocation — this series' own Lesson 4). Always use the iterator that operation itself returns, if it returns one, rather than continuing to advance a pre-existing one.

### Connection

Concept Unit 5 closes with one more traversal direction — backward — using the identical `*`/`++` interface this whole lesson has built understanding of.

---

## Concept Unit 5: Reverse Iterators — the Same Interface, Backward

### The Problem

Printing a party roster last-to-first (a "most recently added" view, say) needs backward traversal — nothing so far in this bridge series has shown a way to do that without manually indexing.

### Concept Lab

```cpp
// scratch_reverse.cpp  (disposable)
#include <iostream>
#include <vector>
int main() {
    std::vector<int> hps = {100, 80, 90};
    std::cout << "forward: ";
    for (auto it = hps.begin(); it != hps.end(); ++it) std::cout << *it << " ";
    std::cout << std::endl;
    std::cout << "reverse: ";
    for (auto it = hps.rbegin(); it != hps.rend(); ++it) std::cout << *it << " ";
    std::cout << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_reverse.cpp -o scratch_reverse -std=c++17 -Wall -Wextra
$ ./scratch_reverse.exe
forward: 100 80 90 
reverse: 90 80 100 
```

What that proves: `hps.rbegin()`/`hps.rend()` traverse the *identical* elements, in reverse order, using the *exact same* `!=`/`*`/`++` syntax as `hps.begin()`/`hps.end()` — `++` on a reverse iterator moves backward through the container, internally, without the calling code needing to know or care; the interface stays uniform even though the direction flipped.

This scratch file is discarded now; reverse iteration is used wherever this bridge series' own later projects need a last-to-first view.

### Mechanical Walkthrough

- `hps.rbegin()` / `hps.rend()` — **(a) first appearance.** A reverse iterator pair — `rbegin()` refers to the *last* real element; `rend()` is a sentinel one *before* the first — `++` on either moves toward the front, not the back.

### CS Lens

A reverse iterator is implemented as a thin wrapper around a regular iterator, internally reversing the meaning of `++`/`--` — the identical **wrapper** idea this whole lesson's own iterator abstraction is built from: a small object presenting a standard interface, translating it into whatever the underlying operation actually needs to be.

### Connection

This closes every new iterator mechanism in this lesson — the Closing section connects the full interface to what it exists for: Lesson 7's algorithms, which operate on iterator pairs directly, with no container-specific code at all.

---

## Closing

### Connect the pieces

Every range-based `for` this entire curriculum has ever written (`S-01-CPP-FOUNDATIONS` LAB-07 onward) is Concept Unit 1's own `.begin()`/`!=  .end()`/`++`/`*` loop, spelled with sugar. Concept Unit 2 proved that interface's uniformity has real limits — a `vector`'s random-access iterator can jump; a `list`'s bidirectional one cannot, a genuine, compiler-enforced reflection of their different internal costs (`S-02-CPP-DSA-MASTERY`'s own labs). Concept Unit 3's `const_iterator` applied the same read/write distinction this whole series has drawn everywhere else, to traversal specifically. Concept Unit 4's verified bug — a skipped element, then a real segfault under stricter checking — proved iterators are tied to a container's *current* layout, invalidated the instant that layout changes, with `erase`'s own return value as the only trustworthy way forward. Concept Unit 5 showed the identical interface, reversed.

### What breaks without this

Concept Unit 4's own verified bug *is* this lesson's "what breaks" — and it is exactly the kind of bug that looks correct in casual testing (a single zero-HP entry, tested once, might not even trigger the skip) and fails silently or catastrophically depending on the exact data and build flags, precisely the "undefined behavior isn't guaranteed to fail the same way twice" warning `S-01-CPP-FOUNDATIONS` LAB-06/LAB-08 both already raised, now demonstrated for iterators specifically.

### Exercises

1. Reproduce Concept Unit 2's iterator-category proof yourself, with a `std::map` instead of a `std::list` — confirm whether `std::map`'s iterator supports `+=` (predict first, then check), and explain what that result implies about how `std::map` is actually stored.
2. Reproduce Concept Unit 4's bug yourself with three or more consecutive matching elements (not just two) — confirm more than one element survives incorrectly, then apply the fix and confirm all are removed correctly.
3. Write a function template `template <typename It> void printRange(It begin, It end)` that accepts any pair of iterators (not a container) and prints every element between them — call it with a `std::vector<int>`'s `.begin()`/`.end()` and a `std::list<int>`'s `.begin()`/`.end()`, confirming the identical function works on both, unmodified.
4. Use `.rbegin()`/`.rend()` to search a `std::vector<Player>` (this series' Lesson 5 theme) for the *last* player matching some condition (say, the last one below half HP) — confirm it finds the correct one without writing any manual index arithmetic.

### Definition of done

- [ ] The project demonstrates explicit `.begin()`/`.end()` iteration, a `const_iterator`, a correct erase-while-iterating loop, and reverse iteration.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`.
- [ ] No erase-while-iterating loop anywhere in the committed code discards `erase`'s return value.
- [ ] You can state, from Concept Unit 2's own verified proof, which iterator category `std::vector` provides and which `std::list` provides, and why the difference is unavoidable given each container's internal structure.
- [ ] You can trace, step by step, exactly why Concept Unit 4's naive erase loop skips an element — not just that it does, but the precise mechanism (shift-then-skip).
- [ ] All four Exercises completed with real compiled output, including Exercise 3's iterator-only function template working unmodified across two different container types.
- [ ] Commit: `git add main.cpp && git commit -m "S03-LAB-06: explicit iteration, const_iterator, and a verified erase-while-iterating fix"` — states why (a real skip-then-crash bug traced to its exact cause and fixed at the root) not just what changed.
