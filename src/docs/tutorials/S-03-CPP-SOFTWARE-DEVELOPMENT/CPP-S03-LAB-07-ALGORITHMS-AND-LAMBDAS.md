# Lesson 7: A Lambda Is a Function That Never Needed a Name
### (LAB 07 — Algorithms and Lambdas)

**What you will build:** A party roster sorted by HP, searched for downed members, counted, and cleaned up — all using `<algorithm>` functions (`std::sort`, `std::find_if`, `std::count_if`, `std::for_each`) driven by lambda expressions, ending with the **erase-remove idiom** that fixes Lesson 6's own verified erase-while-iterating bug in a single line. The transferable problem: Lesson 6 opened up what a range-based `for` actually does — a `.begin()`/`.end()` iterator pair — specifically so this lesson could use that pair directly. Every manual loop this bridge series has written to search, count, or filter a container is a named, tested, already-optimized algorithm underneath, waiting to be called instead of rewritten.

**What you need to know first:** This series' Lesson 6 — iterators, `.begin()`/`.end()`, the verified erase-while-iterating bug. This series' Lesson 5 — `std::vector`, `Player`-shaped structs.

**Terms introduced in this lesson**

> **`<algorithm>`** — the standard library header providing generic functions (sort, search, count, transform, remove...) that operate on iterator ranges, working identically across any container.
> **Lambda expression** — an unnamed, inline function value, written `[capture](parameters) { body }`.
> **Capture** — the part of a lambda's syntax (`[...]`) specifying which surrounding variables the lambda's body can use, and whether by value (a snapshot) or by reference (live access).
> **Predicate** — a function (often a lambda) returning `bool`, used by algorithms like `find_if`/`count_if`/`remove_if` to decide which elements match.
> **`std::remove_if`** — moves elements *not* matching a predicate to the front of a range, returning an iterator to the new "logical end" — it does not actually shrink the container.
> **Erase-remove idiom** — `container.erase(std::remove_if(...), container.end());` — the standard, correct way to actually delete matching elements from a container.

No pipeline diagram applies — this bridge series builds standalone concept programs.

---

## Concept Unit 1: `std::sort` and the Lambda Comparator

### The Problem

Sorting a `std::vector<Player>` by HP means comparing pairs of elements repeatedly and rearranging them — a real algorithm (`S-02-CPP-DSA-MASTERY` LAB-15 already built several sorting algorithms by hand) that shouldn't need to be rewritten every time a new project needs sorted data.

### Project Change

- **Reference Source:** `S-02-CPP-DSA-MASTERY` LAB-15's own hand-built sorting algorithms — `std::sort` is the standard library's tested, typically-hybrid-algorithm version.
- **Files affected:** `main.cpp` — new file for this lesson.
- **Change type:** Add (new file).
- **Location:** Inside `main`.
- **Dependencies:** `#include <algorithm>`, `std::vector<Player>` (this series' Lesson 5).

### The New Code

```cpp
std::sort(party.begin(), party.end(), [](const Player& a, const Player& b) {
    return a.hp < b.hp;
});
```

### The Updated Project

```cpp
#include <iostream>
#include <vector>
#include <algorithm>
#include <string>

struct Player { std::string name; int hp; };

int main() {
    std::vector<Player> party = {{"Zara", 100}, {"Lyra", 80}, {"Finn", 95}};

    std::sort(party.begin(), party.end(), [](const Player& a, const Player& b) {
        return a.hp < b.hp;
    });

    for (const auto& p : party) std::cout << p.name << ":" << p.hp << " ";
    std::cout << std::endl;

    return 0;
}
```

### Concept Lab

No separate throwaway: this real code, run below, is already the smallest useful demonstration.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
Lyra:80 Finn:95 Zara:100
```

What that proves: `party`, originally in creation order (`Zara`, `Lyra`, `Finn`), is now sorted ascending by `hp` — `std::sort` took the *range* `party.begin()` to `party.end()` (Lesson 6's own iterator pair, used directly, not through any container-specific API) and a **predicate** (a function returning `bool`, here answering "should `a` sort before `b`?") deciding the order, and rearranged the elements in place.

### Mechanical Walkthrough

- `#include <algorithm>` — **(a) first appearance.** The header providing `std::sort` and every other generic algorithm this lesson uses.
- `std::sort(party.begin(), party.end(), comparator)` — **(a) first appearance.** Takes a range (two iterators, Lesson 6) and a comparison function — works identically on any container providing at least a random-access iterator (Lesson 6's own category system — `std::sort` specifically requires random access, which is why it works on `std::vector` but not `std::list`, a real, compile-time-enforced restriction, not a documentation note).
- `[](const Player& a, const Player& b) { return a.hp < b.hp; }` — **(a) first appearance of a lambda expression**, used here without explanation — Concept Unit 2 covers its syntax in full.

### CS Lens

`std::sort` is not a re-teach of `S-02-CPP-DSA-MASTERY` LAB-15's own sorting algorithms — it's the payoff of having built and understood them: knowing that a comparison-based sort is fundamentally `O(n log n)` (that lesson's own proof) means `std::sort`'s performance characteristics are legible, not a black box, even though this lesson never re-derives them.

### Connection

Concept Unit 2 explains the lambda syntax used above in full.

---

## Concept Unit 2: Lambda Expressions

### The Problem

`std::sort`'s comparator needed a small, specific, one-off piece of logic — writing a fully separate, named function (`S-01-CPP-FOUNDATIONS` LAB-05's own declaration/definition ceremony) for a three-line comparison used exactly once feels disproportionate.

### No isolated code lab for this step

Already demonstrated inline in Concept Unit 1 — this unit names and explains the syntax that code used without full treatment.

### Explanation

```cpp
[](const Player& a, const Player& b) { return a.hp < b.hp; }
```

A **lambda expression** is an unnamed, inline function value. `[]` — the **capture clause** — specifies which surrounding variables (if any) the lambda's body can use (empty here — this lambda uses only its own parameters). `(const Player& a, const Player& b)` is an ordinary parameter list (`S-01-CPP-FOUNDATIONS` LAB-05). `{ return a.hp < b.hp; }` is an ordinary function body. The whole expression *is* a value — a callable object — passed directly as `std::sort`'s third argument, with no separate name, declaration, or definition anywhere else in the file.

### CS Lens

A lambda is, underneath, a compiler-generated class with an overloaded `operator()` (**call operator**, not previously named in this bridge series, though `[]`/`->` have already been seen overloaded on smart pointers and iterators) — `[]() { ... }` is syntactic sugar for a small, anonymous class whose only job is being callable. The capture clause (Concept Unit 3) determines what member variables that hidden class actually has.

### SE Lens

A lambda used exactly once, at exactly one call site (like `std::sort`'s comparator here), is more readable *inline* than as a separately-named function a reader has to look up elsewhere in the file — the logic and its one use sit next to each other. A comparison reused in several places, by contrast, is better named and extracted (`S-01-CPP-FOUNDATIONS` LAB-05's own DRY principle) — a lambda is not a replacement for named functions in general, only for the specific case of small, single-use logic passed directly to something else.

### Connection

Concept Unit 3 shows what the empty `[]` in Concept Unit 1's lambda was actually declining to do — and a real, observable difference when it does.

---

## Concept Unit 3: Capture by Value vs. by Reference

### The Problem

A lambda sometimes needs to use a variable from its surrounding scope, not just its own parameters — `[]` was empty in Concept Unit 1 because the comparator didn't need anything external. What happens when it does, and does it matter whether the lambda gets its own copy or a live connection to the original?

### Concept Lab

```cpp
// scratch_capture.cpp  (disposable)
#include <iostream>
int main() {
    int threshold = 50;
    auto byValue = [threshold](int x) { return x > threshold; };
    auto byRef = [&threshold](int x) { return x > threshold; };

    std::cout << "byValue(60) before change: " << byValue(60) << std::endl;
    std::cout << "byRef(60) before change: " << byRef(60) << std::endl;

    threshold = 100;

    std::cout << "byValue(60) after threshold=100: " << byValue(60) << std::endl;
    std::cout << "byRef(60) after threshold=100: " << byRef(60) << std::endl;
}
```

Run it — verified this session:

```
$ g++ scratch_capture.cpp -o scratch_capture -std=c++17 -Wall -Wextra
$ ./scratch_capture.exe
byValue(60) before change: 1
byRef(60) before change: 1
byValue(60) after threshold=100: 1
byRef(60) after threshold=100: 0
```

What that proves: both lambdas agree before `threshold` changes (`60 > 50` is true for both). After `threshold` becomes `100`, `byValue` still reports `1` (true) — `[threshold]` captured a **snapshot** of `threshold`'s value (`50`) at the moment the lambda was *created*, permanently, unaffected by later changes to the real `threshold`. `byRef` correctly reports `0` (false) — `[&threshold]` captured a **live reference**, reading whatever `threshold` currently holds, every time it's called.

This scratch file is discarded now; every lambda in this lesson's own real project code captures by value (`[]` with named captures, or nothing at all) specifically because none of them need to observe a variable changing after the lambda is created — `S-01-CPP-FOUNDATIONS` LAB-09's own "prefer the tool that permits less, when less is all that's needed" reasoning, applied to captures.

### Mechanical Walkthrough

- `[threshold]` — **(a) first appearance of capture by value.** Copies `threshold`'s current value into the lambda's own hidden storage (Concept Unit 2's CS Lens) at the point the lambda expression is evaluated.
- `[&threshold]` — **(a) first appearance of capture by reference.** Stores a reference (`S-01-CPP-FOUNDATIONS` LAB-09) to the real `threshold` — reading it later always reads the current value, exactly like any other reference.
- `[=]` / `[&]` — not exercised directly in this lesson's own code, but worth naming: capture *everything* used from the surrounding scope, by value or by reference respectively, rather than listing each variable — convenient, but less explicit about exactly what a lambda depends on.

### CS Lens

This is the identical value-versus-reference distinction `S-01-CPP-FOUNDATIONS` LAB-05 drew for function parameters (pass-by-value copies; a reference doesn't) — a capture is, underneath, exactly a parameter to the lambda's own hidden constructor (Concept Unit 2's CS Lens), so the same rules apply for the same reasons.

### SE Lens

A reference capture used carelessly is a real danger this series has already proven the shape of: `S-01-CPP-FOUNDATIONS` LAB-08's dangling pointer, `S-02-CPP-DSA-MASTERY`'s own lifetime warnings — a lambda that captures a local variable by reference and is then called *after* that variable's scope has ended reads a dangling reference, the identical danger, reached through a different syntax. Capture by value is the safer default whenever a lambda might outlive the scope it was created in; capture by reference is appropriate specifically when the lambda is used and discarded within the same scope, as every lambda in this lesson's own real code is.

### Connection

Concept Unit 4 uses lambdas as **predicates** — the specific "returns `bool`, describes a condition" role `std::sort`'s comparator was really just one example of.

---

## Concept Unit 4: `std::find_if` and `std::count_if` — Lambdas as Predicates

### The Problem

Lesson 6 wrote a manual loop with `break` to find the first zero-HP player. That exact "scan until a condition matches" shape is common enough that the standard library provides it directly, parameterized by the condition itself.

### Project Change

- **Reference Source:** This series' Lesson 6's own manual find-with-`break` loop.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After Concept Unit 1's sort.
- **Dependencies:** `<algorithm>` (Concept Unit 1), lambdas (Concept Units 2–3).

### The New Code

```cpp
auto it = std::find_if(party.begin(), party.end(), [](const Player& p) {
    return p.hp == 0;
});
if (it != party.end()) {
    std::cout << "Found downed player: " << it->name << std::endl;
}

int downedCount = std::count_if(party.begin(), party.end(), [](const Player& p) {
    return p.hp == 0;
});
std::cout << "downed count: " << downedCount << std::endl;
```

### Concept Lab

No separate throwaway: run directly below, this real code is already the clearest demonstration.

Run it — verified this session:

```
$ g++ scratch_findif.cpp -o scratch_findif -std=c++17 -Wall -Wextra
$ ./scratch_findif.exe
Found downed player: Lyra
downed count: 1
Zara Lyra Finn 
```

What that proves: `std::find_if` returned an iterator to the first `Player` whose `hp == 0` — **(c) reusing** the `.end()`-means-not-found pattern (Lesson 6, `S-01-CPP-FOUNDATIONS` LAB-07's own `npos`), just with a *condition* instead of an exact value, unlike Lesson 5's `.find("Finn")`, which only checks equality. `std::count_if` scanned every element and reported how many satisfied the identical **predicate** — the exact lambda passed to `find_if`, reused verbatim for a different algorithm, since both accept "any range, any predicate" generically.

The third line — `std::for_each(party.begin(), party.end(), [](const Player& p) { std::cout << p.name << " "; });` — **(a) first appearance of `std::for_each`**, printed `"Zara Lyra Finn"` — functionally identical to a range-based `for` loop, included here specifically to show it exists as an algorithm too, though a plain range-based `for` (Lesson 6's own Concept Unit 1) is this course's preferred style for simple iteration; `for_each` earns its keep mainly when the action itself is already a named, reusable function or lambda being passed around, not typed fresh at the loop site.

### Mechanical Walkthrough

- `std::find_if(begin, end, predicate)` — **(a) first appearance.** Returns an iterator to the first element for which `predicate` returns `true`, or `end` if none match.
- `std::count_if(begin, end, predicate)` — **(a) first appearance.** Returns the count of elements for which `predicate` returns `true` — conceptually a `find_if` that keeps going instead of stopping at the first match.

### CS Lens

Both algorithms are, underneath, a loop over the range calling the predicate once per element — nothing conceptually different from Lesson 6's own manual `for` loop with an `if` — the value is entirely in *naming* the pattern once, correctly, so every call site states its intent ("find the first match," "count all matches") instead of restating the loop mechanics every time.

### Connection

Concept Unit 5 uses this identical predicate idea to fix Lesson 6's own verified erase-while-iterating bug, in one line.

---

## Concept Unit 5: `std::remove_if` and the Erase-Remove Idiom

### The Problem

Lesson 6 proved, with a real observed bug, that manually erasing matching elements while iterating with `++it` is error-prone — skipping elements, and under stricter checks, crashing. The standard library's own idiomatic fix needs its own explanation, because it looks unusual on first read.

### Project Change

- **Reference Source:** This series' Lesson 6's own verified erase-while-iterating bug and its manual fix.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After Concept Unit 4's demo.
- **Dependencies:** `std::remove_if` (`<algorithm>`), `.erase()` (this series' Lesson 5).

### The New Code

```cpp
std::vector<int> hps = {0, 0, 100, 0, 90, 0};
hps.erase(std::remove_if(hps.begin(), hps.end(), [](int hp) { return hp == 0; }), hps.end());
```

### Concept Lab

No separate throwaway: this real line, run below, replaces Lesson 6's entire manual loop — the comparison itself is the demonstration.

Run it — verified this session:

```
$ g++ scratch_eraseremove.cpp -o scratch_eraseremove -std=c++17 -Wall -Wextra
$ ./scratch_eraseremove.exe
100 90
```

What that proves: `{0, 0, 100, 0, 90, 0}` — three zeros, including two consecutive ones, the exact shape that broke Lesson 6's own naive manual loop — correctly reduces to `100 90`, every zero removed, none skipped. `std::remove_if` itself does **not** shrink the container — it rearranges elements so every element *not* matching the predicate moves to the front, in order, and returns an iterator marking where the "real" data ends and leftover, logically-removed junk begins. `.erase(that_iterator, hps.end())` then physically removes everything from that point to the real end — the two-step **erase-remove idiom**, named for calling `erase` on `remove_if`'s own result.

### Mechanical Walkthrough

- `std::remove_if(begin, end, predicate)` — **(a) first appearance.** Returns a "new logical end" iterator — everything before it is the retained data, compacted to the front; everything from it to the original `end` is unspecified leftover values, not yet actually erased from the container.
- `hps.erase(new_logical_end, hps.end())` — **(c) reusing** the range-taking overload of `.erase()` (Concept Unit 5's own extension of Lesson 5's single-iterator `.erase()`) — removes everything from `remove_if`'s returned position to the real end, completing the cleanup.

### CS Lens

`remove_if` alone deliberately does half the job — it's a single `O(n)` pass, compacting matching-excluded elements forward, with no separate shifting-per-removal the way Lesson 6's manual `erase`-in-a-loop performed (an `O(n)` shift *per removed element*, making the naive approach `O(n × k)` for `k` removals in the worst case). `remove_if` plus one final `erase` is `O(n)` total, regardless of how many elements match — a real, measurable improvement over the manual version, achieved by separating "figure out the final arrangement" from "actually resize the container" into two distinct, individually cheap steps.

### SE Lens

The erase-remove idiom looks unusual on first encounter — calling `erase` with `remove_if`'s return value as an argument, rather than something that reads as "remove the matching ones" directly — but it is the standard, expected way to delete-by-predicate from a `std::vector` in real C++ code; recognizing this two-call shape is a real, practical skill, not just a curiosity, because Lesson 6 already proved the seemingly-obvious manual alternative is a genuine bug risk.

### Connection

This closes every new mechanism in this lesson — the Closing section connects lambdas and algorithms into the complete picture this series' Lessons 5–7 have built together.

---

## Closing

### Connect the pieces

Lesson 5 built the containers; Lesson 6 opened up the iterator interface every container shares; this lesson used that shared interface to call algorithms — `std::sort` (Concept Unit 1), `std::find_if`/`std::count_if`/`std::for_each` (Concept Unit 4), `std::remove_if` (Concept Unit 5) — that work identically regardless of which container's iterators they're handed. Lambdas (Concept Units 2–3) supplied the small, inline logic each algorithm needed to specialize its generic behavior to this project's actual data, with capture semantics (value vs. reference) following the identical rules `S-01-CPP-FOUNDATIONS` LAB-05 already established for ordinary function parameters. Concept Unit 5's erase-remove idiom is this whole lesson's own concrete payoff: Lesson 6's real, verified bug, fixed in one line, by an algorithm that also happens to be asymptotically better than the manual version that broke.

### What breaks without this

Reasoned through directly from Concept Unit 5's own complexity analysis: a manual erase-in-a-loop, even written *correctly* (Lesson 6's own fixed version, using `erase`'s return value properly), still performs one `O(n)` shift per removed element — for `k` removals out of `n` elements, that's `O(n × k)` total work. The erase-remove idiom performs exactly one `O(n)` pass regardless of `k`. For a party of three or four, this difference is invisible; for any collection at real scale, it is the same "invisible until it scales" cost `S-01-CPP-FOUNDATIONS` LAB-13's own array-shift analysis and this series' Lesson 5's own map-vs-vector choice already demonstrated, reached here through a third mechanism.

### Exercises

1. Rewrite this series' own Lesson 5 `std::vector<Player>` linear search (Concept Unit 2 there) using `std::find_if` with a lambda instead of a manual loop — confirm identical results.
2. Reproduce Concept Unit 3's capture-by-value-vs-reference proof yourself, but capture a `std::string` instead of an `int`, and confirm the same distinction holds for a type that isn't trivially cheap to copy.
3. Use `std::accumulate` (from `<numeric>`, not `<algorithm>` — a related but separate header) to sum every party member's HP into a single total — confirm the result matches a manually-summed loop.
4. Apply the erase-remove idiom to `std::vector<Player>` directly (removing every player with `hp == 0`), using a lambda predicate that reads `p.hp` instead of a bare `int` — confirm it compiles and behaves identically to Concept Unit 5's own `int`-based version, proving the idiom generalizes to any element type.

### Definition of done

- [ ] The project uses `std::sort`, `std::find_if`, `std::count_if`, and the erase-remove idiom, each replacing a manual loop this bridge series previously wrote by hand.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`.
- [ ] Every lambda's capture clause is deliberate — value where a snapshot suffices, reference only where live access is genuinely needed and the lambda's lifetime is clearly bounded.
- [ ] You can state, from Concept Unit 3's own verified proof, the concrete difference between `[x]` and `[&x]`, in terms of what happens when `x` changes after the lambda is created.
- [ ] You can explain the erase-remove idiom's two steps separately — what `remove_if` alone actually does, and why `erase` is still required afterward.
- [ ] All four Exercises completed with real compiled output, including Exercise 3's `<numeric>` `std::accumulate` usage.
- [ ] Commit: `git add main.cpp && git commit -m "S03-LAB-07: algorithms and lambdas replace manual loops, erase-remove idiom fixes Lesson 6's verified bug"` — states why (tested, asymptotically better, and genuinely correct replacements for hand-written loops) not just what changed.
