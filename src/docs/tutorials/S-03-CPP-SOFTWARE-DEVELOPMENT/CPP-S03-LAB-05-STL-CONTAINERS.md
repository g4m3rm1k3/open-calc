# Lesson 5: The Standard Library Already Built the Thing You Built by Hand
### (LAB 05 — STL Containers in Practice)

**What you will build:** A party lookup system rebuilt three ways — a linear-search `std::vector<Player>` (the shape `S-01-CPP-FOUNDATIONS` LAB-13 already used), a sorted `std::map<std::string, Player>`, and a hash-based `std::unordered_map<std::string, Player>` — ending with a real, observed gotcha (`operator[]` silently inserting on a missing key) and a decision table for choosing among them. The transferable problem: `S-02-CPP-DSA-MASTERY` built `MyVector`, `MyLinkedList`, and `MyHashMap` by hand, specifically so their internals would never be a mystery — but no real project reimplements these from scratch. This lesson is the deliberate return trip: the same internals, now used through the standard library's own battle-tested, far more complete versions, with the mapping between "what you built" and "what you now reach for" made explicit.

**What you need to know first:** `S-02-CPP-DSA-MASTERY` LAB-06 (dynamic arrays), LAB-07 (linked lists), LAB-13 (binary search trees), LAB-14 (hash tables) — knowing what these structures do *underneath* is what makes their standard-library counterparts legible rather than magic. `S-01-CPP-FOUNDATIONS` LAB-13's own `dismissPlayer` O(n) array shift.

**Terms introduced in this lesson**

> **STL (Standard Template Library)** — the standard library's collection of container templates, iterators, and algorithms.
> **`std::map`** — an ordered associative container, keys sorted, backed internally by a self-balancing binary search tree (the standard-library analog of `S-02-CPP-DSA-MASTERY` LAB-13's `BST`).
> **`std::unordered_map`** — an unordered associative container, backed internally by a hash table (the standard-library analog of `S-02-CPP-DSA-MASTERY` LAB-14's `MyHashMap`).
> **`std::set` / `std::unordered_set`** — the key-only counterparts of `map`/`unordered_map`, storing unique values with no associated data.
> **`.find()`** — searches a container for a key/value, returning an iterator to it or to `.end()` if absent.
> **`operator[]` on a map** — reads or writes a key's value; on a *missing* key, silently inserts a new, default-constructed entry rather than reporting an error.
> **`.at()`** — the checked counterpart to `operator[]`: throws `std::out_of_range` on a missing key instead of inserting one.

No pipeline diagram applies — this bridge series builds standalone concept programs.

---

## Concept Unit 1: The Problem — You Already Built These, Now Use the Real Ones

### The Problem

`S-01-CPP-FOUNDATIONS` LAB-13's party manager stored players in a fixed `Player party[MAX_PARTY]` array, found one by scanning every slot, and dismissed one with a hand-written O(n) shift. `S-02-CPP-DSA-MASTERY` then spent five labs (LAB-06, 07, 09, 10, 13, 14) building the exact structures that would make this faster and easier — by hand, so the internals are no longer a mystery. Nothing so far has connected those two facts: the standard library's own containers are, underneath, exactly what those labs built, wrapped in a far more complete, tested interface.

### No isolated code lab for this step

Best shown as a direct mapping table, not an invented illustration.

### Explanation

| You built (by hand) | Standard library equivalent | Underlying structure |
|---|---|---|
| `MyVector<T>` (`S-02-CPP-DSA-MASTERY` LAB-06) | `std::vector<T>` | Dynamic array, amortized-growth |
| `MyLinkedList<T>` (LAB-07/08) | `std::list<T>`, `std::forward_list<T>` | Doubly/singly linked list |
| Stack-on-array/list (LAB-09) | `std::stack<T>` | Adapts a `vector`/`deque` underneath |
| Circular buffer (LAB-10) | `std::deque<T>` | Segmented array, O(1) both ends |
| `BST` (LAB-13) | `std::map<K, V>`, `std::set<K>` | Self-balancing binary tree (red-black) |
| `MyHashMap<K, V>` (LAB-14) | `std::unordered_map<K, V>`, `std::unordered_set<K>` | Hash table with chaining |

### CS Lens

Every complexity guarantee `S-02-CPP-DSA-MASTERY` proved by building these structures by hand — `O(1)` amortized `push_back`, `O(log n)` BST search, `O(1)` average hash-table lookup — carries over directly to the standard-library version, because the underlying algorithm is the identical one, just implemented, tested, and optimized by the compiler vendor instead of by a student learning it for the first time.

### SE Lens

The reason real projects reach for `std::unordered_map` instead of a hand-rolled hash table is not that the hand-rolled version is wrong — `S-02-CPP-DSA-MASTERY` LAB-14's own version, if built correctly, works. It's that the standard library's version has been tested against edge cases, tuned for performance, and reviewed by far more people than any one project's own from-scratch implementation ever will be — the same "don't reinvent what's already solved" principle `S-01-CPP-FOUNDATIONS` LAB-05 introduced for functions, now applied at the scale of entire data structures.

### Connection

Concept Unit 2 starts with the structure already familiar from repeated use across this whole curriculum — `std::vector` — used for a job it's genuinely bad at, to motivate what comes next.

---

## Concept Unit 2: `std::vector` — Good at Order, Bad at Lookup by Name

### The Problem

Finding a specific player by name in a `std::vector<Player>` means checking every element until a match is found or the vector is exhausted — exactly `S-01-CPP-FOUNDATIONS` LAB-13's own linear approach, at `O(n)` cost.

### Project Change

- **Reference Source:** `S-01-CPP-FOUNDATIONS` LAB-13's own party array and its linear iteration pattern.
- **Files affected:** `main.cpp` — new file for this lesson.
- **Change type:** Add (new file).
- **Location:** Inside `main`.
- **Dependencies:** `std::vector` (`S-01-CPP-FOUNDATIONS` LAB-07 preview), `for` (`S-01-CPP-FOUNDATIONS` LAB-04).

### The New Code

```cpp
std::vector<Player> party = {{"Zara", 100}, {"Lyra", 80}, {"Finn", 90}};
std::string target = "Finn";
Player* found = nullptr;
for (auto& p : party) {
    if (p.name == target) { found = &p; break; }
}
```

### Concept Lab

No separate throwaway: this real code, run below, is already the smallest useful demonstration.

Run it — verified this session:

```
$ g++ main.cpp -o dungeon -std=c++17 -Wall -Wextra
$ ./dungeon.exe
Found Finn HP=90
```

What that proves: this works — but for `N` players, an average search touches `N/2` of them, and a search for a name *not present* touches all `N`, every time, regardless of how many times the same name is searched for again later. Nothing about a `std::vector` remembers "where" a given name lives — it has no concept of a key at all, only positions.

### Mechanical Walkthrough

- `for (auto& p : party) { if (p.name == target) { found = &p; break; } }` — **(c) reusing** range-based `for` (`S-01-CPP-FOUNDATIONS` LAB-07), `==` on `std::string` (`S-01-CPP-FOUNDATIONS` LAB-07), and `break` (`S-01-CPP-FOUNDATIONS` LAB-04) — the exact shape `S-01-CPP-FOUNDATIONS` LAB-13 used, unchanged.

### CS Lens

A `std::vector` (per Concept Unit 1's own table, `S-02-CPP-DSA-MASTERY` LAB-06's `MyVector`) is optimized for *positional* access — `party[2]` is `O(1)` — and *appending* — `push_back` is amortized `O(1)`. It has no structural advantage for "find the element whose *name* equals X" at all; that's a linear scan regardless of the container's own internal efficiency for other operations.

### Connection

Concept Unit 3 introduces a container built specifically for lookup by key.

---

## Concept Unit 3: `std::map` — Sorted, Searchable by Key

### The Problem

Repeatedly searching for players by name, in a growing party, needs a container that can answer "does this key exist, and what's its value?" faster than checking every element.

### Project Change

- **Reference Source:** `S-02-CPP-DSA-MASTERY` LAB-13's own `BST` — `std::map` is this structure, self-balancing, provided by the standard library.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add (new section).
- **Location:** After Concept Unit 2's vector demo.
- **Dependencies:** `#include <map>`.

### The New Code

```cpp
std::map<std::string, Player> party;
party["Zara"] = {"Zara", 100, 3};
party["Lyra"] = {"Lyra", 80, 1};
party["Finn"] = {"Finn", 90, 2};

for (const auto& [name, p] : party) {
    std::cout << name << ": HP " << p.hp << std::endl;
}

auto it = party.find("Finn");
if (it != party.end()) {
    std::cout << "Found via find(): " << it->second.name << " HP=" << it->second.hp << std::endl;
}
```

### Concept Lab

No separate throwaway: run directly below, this is already the clearest demonstration.

Run it — verified this session:

```
$ g++ scratch_map.cpp -o scratch_map -std=c++17 -Wall -Wextra
$ ./scratch_map.exe
--- iterating std::map (sorted by key) ---
Finn: HP 90
Lyra: HP 80
Zara: HP 100
Found via find(): Finn HP=90
count("Ghost") = 0
find("Ghost") == end(): 1
```

What that proves: iterating `party` prints entries in **sorted key order** (`Finn`, `Lyra`, `Zara` — alphabetical, not insertion order `Zara`, `Lyra`, `Finn`) — a `std::map` maintains this ordering automatically, the direct, observable consequence of being backed by a binary search tree (`S-02-CPP-DSA-MASTERY` LAB-13's own in-order traversal, run here without writing any traversal code). `.find("Finn")` located the entry directly, without a linear scan. `.count("Ghost")` returned `0` — a clean way to check existence without handling an iterator. `.find("Ghost") == party.end()` — **(c) reusing** the `.end()` sentinel pattern this lesson introduces generally in Concept Unit 6 — confirms "not found" the same way every standard-library search function reports absence.

### Mechanical Walkthrough

- `std::map<std::string, Player> party;` — **(a) first appearance.** A template parameterized on both a key type and a value type — `std::string` keys, `Player` values.
- `party["Zara"] = {"Zara", 100, 3};` — **(a) first appearance of map's `operator[]`.** On a key not yet present, inserts a new entry (default-constructed, then immediately assigned here); on an existing key, simply updates its value — full treatment of the *danger* this convenience carries is Concept Unit 5.
- `for (const auto& [name, p] : party)` — **(a) first appearance of a structured binding.** `party`'s elements are actually `std::pair<const std::string, Player>` — `[name, p]` destructures each pair into two named references in one line, rather than writing `.first`/`.second` explicitly.
- `party.find("Finn")` — **(a) first appearance of `.find()`.** Returns an **iterator** (full treatment next lesson) pointing at the matching entry, or `party.end()` (a sentinel iterator meaning "one past the last element," reused from `S-01-CPP-FOUNDATIONS` LAB-07's own `std::string::npos` pattern, generalized to containers) if absent.

### CS Lens

`std::map`'s sorted-order guarantee and `O(log n)` search/insert/erase are the direct, tested version of `S-02-CPP-DSA-MASTERY` LAB-13's own BST proof — the same binary-search-over-a-tree idea, self-balancing (LAB-13's own "why an unbalanced BST degrades to O(n)" warning, solved here automatically) so worst-case behavior never degrades to a linked list's `O(n)`, regardless of insertion order.

### SE Lens

Choosing `std::map` specifically for its sorted iteration (not just its search speed) is a real, common reason to prefer it over `unordered_map` (Concept Unit 4) — a party roster that should always print alphabetically, with no explicit sort step, gets that behavior for free from the container itself.

### Connection

Concept Unit 4 introduces the hash-based alternative — faster average lookup, at the cost of losing this exact ordering guarantee.

---

## Concept Unit 4: `std::unordered_map` — Faster Lookup, No Ordering

### The Problem

`std::map`'s `O(log n)` search is fast, but `S-02-CPP-DSA-MASTERY` LAB-14 built a structure that averages `O(1)` — if a party roster's *order* doesn't actually matter, only lookup speed does, `std::map`'s tree-balancing overhead is paying for a guarantee nothing is using.

### Project Change

- **Reference Source:** `S-02-CPP-DSA-MASTERY` LAB-14's own `MyHashMap` — `std::unordered_map` is this structure, standard-library provided.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After Concept Unit 3's map demo.
- **Dependencies:** `#include <unordered_map>`.

### The New Code

```cpp
std::unordered_map<std::string, Player> party;
party["Zara"] = {"Zara", 100, 3};
party["Lyra"] = {"Lyra", 80, 1};
party["Finn"] = {"Finn", 90, 2};
```

### Concept Lab

No separate throwaway: swapping `std::map` for `std::unordered_map` in Concept Unit 3's own code, with everything else unchanged, is the clearest possible isolation of what actually differs.

Run it — verified this session (same operations, `unordered_map` instead of `map`):

```
$ ./s03lab05_full.exe
Looking up Finn...
Found: Finn Lv2 HP:90
Dismissing Lyra...
party size now: 2
Looking up Lyra after dismiss...
Lyra not found (correctly removed)
```

What that proves: `.find()`, `.erase()`, `.size()` all work identically to `std::map`'s own interface — the two containers share almost the same API surface deliberately, so switching between them (as this lesson just did) rarely requires changing anything beyond the declaration itself. What's *not* shown here, because it's not observable through this interface at all, is iteration order — `unordered_map`'s own iteration order depends on its internal hash table layout, not insertion order and not sorted order, and this course makes no promise about what it will be (verified conceptually against `S-02-CPP-DSA-MASTERY` LAB-14's own explanation of hash bucket placement — order is a consequence of hash values and current table size, not something meaningful to rely on).

### Mechanical Walkthrough

- `std::unordered_map<std::string, Player>` — **(c) reusing** the identical template syntax as `std::map` (Concept Unit 3), same two type parameters, different container name — deliberately, so the two are nearly interchangeable in code that doesn't rely on ordering.
- `.erase("Lyra")` — **(a) first appearance.** Removes the entry with the given key, if present — the standard-library equivalent of `S-01-CPP-FOUNDATIONS` LAB-13's own hand-written `dismissPlayer` shift, except here it's `O(1)` average, not `O(n)`, since nothing needs to shift — a hash table has no "position" for later elements to be shifted into.

### CS Lens

This is `S-01-CPP-FOUNDATIONS` LAB-13's own O(n) dismiss-shift problem, solved by the exact structure that lesson's own Closing section named as the answer — a hash table doesn't store elements contiguously the way an array does, so removing one never requires moving any others, the identical reasoning that made `S-02-CPP-DSA-MASTERY` LAB-14 worth building in the first place.

### SE Lens

Default to `std::unordered_map` when only lookup speed matters and order is irrelevant (a party roster looked up by name, never printed in any particular order); default to `std::map` when sorted iteration is itself a requirement, not an incidental nice-to-have. Neither is universally "better" — Concept Unit 6's own decision table makes this concrete.

### Connection

Concept Unit 5 exposes a real, silent danger both map types share — `operator[]`'s own convenience, misused.

---

## Concept Unit 5: The `operator[]` Trap — Reading Can Silently Write

### The Problem

`party["Zara"]` both *creates* a new entry (Concept Unit 3, when the key didn't exist yet) and *reads* an existing one — the identical syntax means two very different things depending on whether the key was already present. What happens when code only intends to *check* a key, using `[]` by habit?

### Concept Lab

```cpp
// scratch_unordered.cpp  (disposable)
#include <iostream>
#include <unordered_map>
#include <string>
int main() {
    std::unordered_map<std::string, int> hp;
    hp["Zara"] = 100;
    hp["Lyra"] = 80;

    std::cout << "size before accidental read: " << hp.size() << std::endl;
    std::cout << "hp[\"Ghost\"] = " << hp["Ghost"] << std::endl;   // reading a MISSING key
    std::cout << "size after accidental read: " << hp.size() << std::endl;

    try {
        std::cout << hp.at("AlsoGhost") << std::endl;
    } catch (const std::out_of_range& e) {
        std::cout << "at() threw: " << e.what() << std::endl;
    }
}
```

Run it — verified this session:

```
$ g++ scratch_unordered.cpp -o scratch_unordered -std=c++17 -Wall -Wextra
$ ./scratch_unordered.exe
size before accidental read: 2
hp["Ghost"] = 0
size after accidental read: 3
at() threw: unordered_map::at
```

**A real, verified, genuinely dangerous default, worth stating precisely:** `hp["Ghost"]`, intended here only as a *read* (checking what HP a non-existent character has), silently **inserted** a brand-new entry — `"Ghost"` mapped to a default-constructed `int`, `0` — growing the map's size from `2` to `3`, with no error, no warning, nothing to indicate a mutation happened at all. `hp.at("AlsoGhost")`, by contrast, threw a real `std::out_of_range` exception (`S-02-CPP-DSA-MASTERY` LAB-06/09's own already-encountered exception type) — a loud, catchable failure instead of a silent, wrong mutation.

This scratch file is discarded now; every read-only lookup in the real project (Concept Unit 4) uses `.find()` or `.count()`, never bare `[]`, specifically because of this verified behavior.

### Mechanical Walkthrough

- `hp["Ghost"]` (read-intent, on a missing key) — **(a) first appearance of `operator[]`'s insert-on-missing behavior observed as a bug, not a feature** — technically identical to Concept Unit 3's own `party["Zara"] = ...` insertion, just without the immediate `=` making the mutation visually obvious.
- `hp.at("AlsoGhost")` — **(a) first appearance of `.at()`.** The checked alternative: returns the value for an existing key exactly like `[]`, but throws instead of inserting for a missing one.

### CS Lens

`operator[]`'s dual read/write behavior on a map exists because C++ overloads it to also serve as an insertion syntax (`party["Zara"] = {...}`, Concept Unit 3) — the same operator doing two jobs, distinguished only by whether the key happens to already exist, is a real design tradeoff the standard library made for insertion convenience, at the cost of exactly this silent-mutation-on-read risk.

### SE Lens

**The rule this verified finding justifies:** use `[]` only when insertion (or "insert-if-missing, then update") is the actual intent; use `.find()` (Concept Unit 3) when checking for presence without side effects, and `.at()` when a missing key should be a loud failure rather than a silent one. Code that reads with `[]` out of habit is writing to the container every time it "just checks" something — a real, common source of maps silently growing with unintended empty entries in production code.

### Connection

Concept Unit 6 covers `std::set` (the key-only, value-less relative of `map`) and closes with the decision table this whole lesson has been building toward.

---

## Concept Unit 6: `std::set` and the Container Decision Table

### The Problem

Not every "does this exist" question has an associated value — tracking which bosses a party has defeated needs only membership, no per-boss data.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `main.cpp` — modified.
- **Change type:** Add.
- **Location:** After Concept Unit 5's demo.
- **Dependencies:** `#include <set>`.

### The New Code

```cpp
std::set<std::string> defeatedBosses;
defeatedBosses.insert("Dragon");
defeatedBosses.insert("Lich");
defeatedBosses.insert("Dragon");   // duplicate -- silently ignored

std::cout << "size: " << defeatedBosses.size() << std::endl;
for (const auto& boss : defeatedBosses) std::cout << " - " << boss << std::endl;
```

### Concept Lab

No separate throwaway: run directly below, this real demonstration is already minimal.

Run it — verified this session:

```
$ g++ scratch_set.cpp -o scratch_set -std=c++17 -Wall -Wextra
$ ./scratch_set.exe
size: 2
 - Dragon
 - Lich
contains Dragon: 1
```

What that proves: inserting `"Dragon"` twice left `size()` at `2`, not `3` — a `std::set` enforces uniqueness automatically, silently discarding a duplicate `insert` rather than erroring. Iteration prints in sorted order (`Dragon`, `Lich`), the same guarantee `std::map` provides, because `std::set` is literally the same underlying tree structure with no associated value stored per key.

### Mechanical Walkthrough

- `std::set<std::string>` — **(a) first appearance.** A single-type-parameter template — one type, stored uniquely, sorted — the key-only counterpart to `std::map<K, V>`.
- `.insert("Dragon")` (called twice with the same value) — **(a) first appearance of insertion that can silently no-op.** No error, no exception — `std::set`'s own contract is "contains each distinct value at most once," and a duplicate insert simply doesn't change anything.

### Explanation — the decision table

| Need | Reach for | Why |
|---|---|---|
| Ordered sequence, indexed by position, grows at the end | `std::vector` | `O(1)` amortized append, `O(1)` positional access (`S-02-CPP-DSA-MASTERY` LAB-06) |
| Frequent insertion/removal at both ends | `std::deque` | `O(1)` at both ends, no shifting (`S-02-CPP-DSA-MASTERY` LAB-10) |
| Key → value, must iterate in sorted order | `std::map` | Self-balancing tree, `O(log n)` (`S-02-CPP-DSA-MASTERY` LAB-13) |
| Key → value, order doesn't matter, want fastest average lookup | `std::unordered_map` | Hash table, `O(1)` average (`S-02-CPP-DSA-MASTERY` LAB-14) |
| Unique values only, no associated data, sorted | `std::set` | Same tree as `std::map`, key-only |
| Unique values only, no associated data, fastest lookup | `std::unordered_set` | Same hash table as `std::unordered_map`, key-only |

### CS Lens

Every row in this table is a tradeoff this curriculum already proved by hand — `S-02-CPP-DSA-MASTERY`'s labs built each underlying structure specifically so this table's *reasons*, not just its recommendations, are legible: "use `unordered_map` for speed" means something concrete, traced back to real hash-bucket mechanics, not a rule taken on faith.

### SE Lens

Choosing a container is a real design decision with real performance consequences at scale, even though every option in this table will "work" correctly for a small party of three or four — the same "invisible until it scales" lesson `S-01-CPP-FOUNDATIONS` LAB-13's own O(n) shift and this lesson's own map-vs-unordered_map choice both taught: pick based on the actual access pattern the code needs, not whichever container happens to be reached for first.

### Connection

This closes every new container in this lesson — the Closing section connects the full arc from `S-01`'s array to this lesson's own hash-based lookup.

---

## Closing

### Connect the pieces

`S-01-CPP-FOUNDATIONS` LAB-13's `Player party[MAX_PARTY]` — a fixed array, linear search, `O(n)` dismiss-by-shift — is Concept Unit 2's own `std::vector<Player>`, still linear for lookup by name. Concept Unit 3's `std::map` replaced that linear search with `S-02-CPP-DSA-MASTERY` LAB-13's own BST, gaining `O(log n)` lookup and free sorted iteration. Concept Unit 4's `std::unordered_map` traded that ordering away for `S-02-CPP-DSA-MASTERY` LAB-14's own `O(1)` average hash-table lookup — and its own `.erase()` solved `S-01-CPP-FOUNDATIONS` LAB-13's O(n) shift problem directly, with no shifting at all. Concept Unit 5's verified `operator[]` trap is the one sharp edge both map types share. Concept Unit 6's `std::set` closed the arc with the key-only version of the same idea, and named, precisely, when to reach for each.

### What breaks without this

Concept Unit 5's own verified proof is this lesson's real "what breaks": code that checks whether a player exists via `if (party["SomeName"].hp > 0)` — reading with `[]`, intending only a check — silently inserts a new, zero-HP `"SomeName"` entry into the party on every single call where that name doesn't yet exist, growing the container with phantom entries that were never meant to exist, with no error anywhere to reveal it. The fix (`.find()` or `.count()`, Concept Unit 3/5) costs nothing extra to write and eliminates the entire failure mode.

### Exercises

1. Rebuild `S-01-CPP-FOUNDATIONS` LAB-13's `dismissPlayer` using `std::unordered_map<std::string, Player>::erase()` instead of the original's manual array-shift loop — confirm it removes the correct player with no shifting logic written at all.
2. Reproduce Concept Unit 5's `operator[]` trap yourself, on your own container, with your own key names — confirm the silent size growth for real, then fix the same code using `.find()` and confirm no growth occurs.
3. Build a `std::unordered_set<std::string>` tracking which floors of a dungeon have been visited (reusing `S-01-CPP-FOUNDATIONS` LAB-03's floor-numbering theme) — confirm re-visiting an already-visited floor doesn't grow the set, and that `.count()` correctly answers "has this floor been visited?"
4. Time (informally — compare visibly different party sizes, like 10 vs 10,000 entries) a linear `std::vector` search versus an `std::unordered_map` lookup for the same "find by name" operation, and observe, concretely, at what scale the difference stops being negligible — connecting this lesson's own decision table to an actual felt cost, not just a stated one.

### Definition of done

- [ ] The project demonstrates `std::vector`, `std::map`, `std::unordered_map`, and `std::set`, each used for the operation it's actually suited to.
- [ ] The program compiles with zero warnings under `-std=c++17 -Wall -Wextra`.
- [ ] No read-only lookup anywhere in the committed code uses bare `operator[]` — every presence check uses `.find()` or `.count()`, per Concept Unit 5's own verified danger.
- [ ] You can state, from Concept Unit 3/4's own comparison, when `std::map`'s sorted iteration is worth its `O(log n)` cost over `std::unordered_map`'s faster average lookup.
- [ ] You can explain, precisely, what `operator[]` does differently from `.find()` and `.at()` on a missing key — not as three abstract facts, but as three concretely different, verified behaviors.
- [ ] All four Exercises completed with real compiled output, including Exercise 1's full rewrite of `S-01-CPP-FOUNDATIONS` LAB-13's own dismiss logic.
- [ ] Commit: `git add main.cpp && git commit -m "S03-LAB-05: party lookup via std::map/unordered_map/set, replacing S-01's linear scan and O(n) dismiss shift"` — states why (real complexity improvement over S-01's original design, plus a verified operator[] danger avoided) not just what changed.
