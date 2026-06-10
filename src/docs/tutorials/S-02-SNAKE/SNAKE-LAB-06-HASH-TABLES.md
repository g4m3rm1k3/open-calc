# C++ Masterclass — S-02 — LAB 06 — Self-Collision: Hash Tables and O(1) Lookup

**Prerequisites:** S-02 LAB 05. Food spawns randomly and never on the snake body.

**What this lab adds:**
- The O(n) self-collision problem — measuring the cost at scale
- Hash tables — the data structure that turns O(n) lookup into O(1)
- How a hash function works — mapping keys to array indices
- Hash collisions — when two keys map to the same index
- `std::unordered_set` — the standard library hash set
- A custom hash for `std::pair<int,int>` — enabling pair keys in a hash set
- Replacing the O(n) self-collision loop with O(1) hash lookup

**Time:** ~70 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. The self-collision loop in `updateSnake` iterates every body segment.
>    If the snake is length 150 and runs at 10 FPS, how many comparisons happen
>    per second just for self-collision checking?
> 2. An array lets you look up "what is at index 5?" in O(1). A hash table
>    lets you look up "is 'dragon' in this set?" in O(1). What is the fundamental
>    trick that makes this possible?
> 3. Two different keys map to the same array index in a hash table.
>    This is called a hash _______________. How do hash tables handle this?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The Snake game with the self-collision check upgraded from O(n) to O(1). The game
also gains a performance counter that makes the Big-O difference visible:

```
Score: 5  |  Len: 8  |  Collision checks: 8 [loop] vs 1 [hash]  |  Q=quit
```

---

## Part 1 — The O(n) Problem, Measured

### Concept: Why Self-Collision is O(n) With a Loop

The current check in `updateSnake`:
```cpp
for (const Segment& seg : body) {
    if (seg.row == newHead.row && seg.col == newHead.col) {
        return false;
    }
}
```

In the worst case (new head does NOT collide), every segment is checked. At length N,
this is N comparisons per frame. At 10 FPS and length 150: **1,500 comparisons/second**.
For a 60 FPS game with a length-200 snake: **12,000 comparisons/second** — just for
one game mechanic.

The snake's full interior (18×6 = 108 cells for a 20×8 grid) caps the maximum snake
length. But larger grids (80×24 = 1,682 interior cells) show the O(n) cost clearly.

**The correct data structure:** Something that answers "is position (r,c) in this
set?" in O(1) — regardless of set size. That is a **hash table**.

---

## Part 2 — Hash Tables: The Big Idea

### Concept: Hash Tables — O(1) Set Membership

**What a hash table is:** An array of N "buckets." A **hash function** maps each key
to a bucket index. To check if a key is in the set: hash it, look at that bucket.
O(1) — one array lookup, regardless of how many keys are in the table.

**The problem before (no hash table):**
To answer "is 'dragon' in this set of 10,000 names?", you must compare 'dragon'
against all 10,000 names one at a time. O(n).

**The hash function — mapping keys to indices:**
A hash function takes a key of any type and returns an integer (the hash). The integer
is then reduced modulo the table size to get a bucket index:
```
bucket = hash(key) % table_size
```

**Requirements for a good hash function:**
1. **Deterministic:** Same key always produces the same hash
2. **Uniform:** Keys spread evenly across buckets (no clustering)
3. **Fast:** Computing the hash must be O(1) itself

**Example — hashing a string:**
One common approach: treat each character's ASCII value as a number and combine them.
```
hash("dog") = 'd' * 31^2 + 'o' * 31^1 + 'g' * 31^0
            = 100 * 961 + 111 * 31 + 103
            = 96100 + 3441 + 103
            = 99644
bucket = 99644 % 16 = 12   (if table has 16 buckets)
```

**Hash collisions — when two keys hash to the same bucket:**
With a finite table and infinite possible keys, collisions are inevitable. Two common
strategies:
- **Chaining:** Each bucket holds a linked list of all keys that hash to it.
  Lookup: hash → bucket → scan the list. Average O(1) if the table is not too full.
- **Open addressing:** If bucket is taken, probe adjacent buckets.
  Both work; `std::unordered_set` uses chaining in most implementations.

**Load factor:** The ratio of stored keys to bucket count. A load factor above ~0.7
degrades performance. `std::unordered_set` automatically resizes the table (rehashes)
to keep the load factor low — this is why insertion is O(1) amortized (occasionally
triggers a resize).

**The protected invariant:** For any key `k` ever inserted: `contains(k)` returns
true. For any key never inserted: `contains(k)` returns false. Hash table semantics
are exact — unlike probabilistic data structures like Bloom filters.

**Canonical example:**
A phone directory. Hash the name → index in a large array → that slot holds the phone
number. "Alice" always hashes to the same slot. Lookup is one hash computation + one
array access. The book's total size does not matter for the lookup cost.

---

### Concept: `std::unordered_set<T>` — The Standard Hash Set

**What it is:** A standard library container that stores unique values with O(1) average
insert, O(1) average lookup, and O(1) average erase.

**Key operations:**

| Operation | Method | Average Cost |
|-----------|--------|-------------|
| Insert | `.insert(val)` | O(1) amortized |
| Check membership | `.count(val) > 0` or `.contains(val)` | O(1) average |
| Remove | `.erase(val)` | O(1) average |
| Size | `.size()` | O(1) |

**`count(val)` for sets:** Returns 0 (not present) or 1 (present). Sets store only
unique values — `count` is always 0 or 1 for sets. The name is inherited from
`std::multiset`, where count can be > 1. Prefer `.contains(val)` (C++20) for clarity.

**The hashing requirement:** `std::unordered_set<T>` requires that `T` has a
built-in hash function in the standard library. Built-in types (`int`, `std::string`)
have standard hashes. Custom types (like `Segment` or `std::pair<int,int>`) need
a custom hash.

---

## Step 1 — A Custom Hash for Grid Positions

We will store positions as `std::pair<int,int>` (row, col). The standard library
does not provide a hash for `pair`. We must write one:

```cpp
#include <unordered_set>   // std::unordered_set
#include <utility>         // std::pair, std::make_pair

// ── PairHash — hash function for std::pair<int,int> ──────────────────────────
// An unordered_set requires a hash function for its key type.
// For built-in types (int, string), the standard provides one.
// For custom types (pair<int,int>), we must write it.
struct PairHash {
    size_t operator()(const std::pair<int,int>& p) const {
        // Combine the hashes of the two ints.
        // XOR with a shifted value distributes bits to reduce collision clustering.
        size_t h1 = std::hash<int>{}(p.first);    // hash the row
        size_t h2 = std::hash<int>{}(p.second);   // hash the col
        return h1 ^ (h2 << 16);                   // combine: XOR row-hash with shifted col-hash
        // The << 16 shift prevents (row=1,col=2) from hashing the same as (row=2,col=1)
    }
};

// The type alias — used throughout the file
using PosSet = std::unordered_set<std::pair<int,int>, PairHash>;
```

**`size_t operator()(...)` — the call operator:** Making a struct callable with `()`
is called a **functor** (function object). `std::hash<int>{}` creates an instance of
the standard `int` hasher and calls it with `(p.first)`. `PairHash{}(pair)` creates
an instance of `PairHash` and calls it. `std::unordered_set` calls this internally
when computing bucket indices.

**`using PosSet = ...`:** A type alias — gives a shorter name to the full type.
Instead of writing `std::unordered_set<std::pair<int,int>, PairHash>` everywhere,
we write `PosSet`.

**XOR hash combining:** `h1 ^ (h2 << 16)` is a common, simple combiner. It is not
cryptographically strong, but for small grids it distributes values well enough.
A better combiner (boost::hash_combine) uses: `seed ^= h + 0x9e3779b9 + (seed << 6) + (seed >> 2)`.

### SAVE AND TRY

Add a quick test before the game:
```cpp
    PosSet test;
    test.insert({4, 10});
    test.insert({4, 11});
    std::cout << "Contains (4,10): " << test.count({4, 10}) << "  (expect 1)" << std::endl;
    std::cout << "Contains (4,12): " << test.count({4, 12}) << "  (expect 0)" << std::endl;
    _getch();
```
```
make
.\dungeon
```
**You should see:** `1` for (4,10), `0` for (4,12). The hash set works. Remove the test.

---

## Step 2 — Maintain the Occupied Set

The occupied set must mirror the deque: every body segment is in the set.
We update the set exactly where we update the deque — in `updateSnake`:

```cpp
// Updated updateSnake signature — add the occupied set
bool updateSnake(std::deque<Segment>& body,
                 PosSet& occupied,          // ← add: hash set of all body positions
                 Direction dir,
                 const char grid[GRID_ROWS][GRID_COLS],
                 int foodRow, int foodCol,
                 bool& ate,
                 GameMode mode) {

    Segment newHead = body.front();
    // ... direction update ...
    // ... boundary check ...

    // ── Self-collision: O(1) hash lookup ──────────────────────────────────────
    auto key = std::make_pair(newHead.row, newHead.col);

    if (occupied.count(key) > 0) {   // O(1) average — one hash computation + bucket check
        return false;                 // hit itself
    }

    ate = (newHead.row == foodRow && newHead.col == foodCol);

    // ── Update deque AND hash set together ────────────────────────────────────
    if (!ate) {
        // Remove tail from the set before popping it from the deque
        const Segment& tail = body.back();
        occupied.erase({tail.row, tail.col});   // O(1) removal
        body.pop_back();                         // O(1)
    }

    body.push_front(newHead);   // O(1)
    occupied.insert(key);       // O(1) — add new head to the set

    return true;
}
```

**Invariant maintenance:** The set and the deque must always agree on which cells
are occupied. Every deque operation has a matching set operation:
- `push_front(seg)` → `occupied.insert({seg.row, seg.col})`
- `pop_back()` → `occupied.erase({tail.row, tail.col})` (done before `pop_back`)

If these pairs get out of sync, self-collision checking produces wrong results.

---

## Step 3 — Initialize the Set and Update `main()`

In `main()`, after building the initial body deque, populate the set:

```cpp
    PosSet occupied;
    for (const Segment& seg : body) {
        occupied.insert({seg.row, seg.col});   // mirror the initial body
    }
```

Update the `updateSnake` call to pass `occupied`:
```cpp
    if (!updateSnake(body, occupied, dir, grid, food.row, food.col, ate, mode)) {
```

Also update `placeFood` to accept the `PosSet` for more efficient occupied checking:

```cpp
Segment placeFood(const std::deque<Segment>& body, const PosSet& occupied) {
    std::uniform_int_distribution<int> rowDist(1, GRID_ROWS - 2);
    std::uniform_int_distribution<int> colDist(1, GRID_COLS - 2);

    Segment food;
    do {
        food.row = rowDist(g_rng);
        food.col = colDist(g_rng);
    } while (occupied.count({food.row, food.col}) > 0);   // O(1) check per attempt

    return food;
}
```

Update the `placeFood` calls: `placeFood(body, occupied)`.

### SAVE AND TRY

```
make
.\dungeon
```

**The game runs identically** — but the self-collision check is now O(1). To see
the difference, add a collision check counter:

```cpp
// In updateSnake, above the collision check:
static int loopChecks = 0;   // 'static' persists across calls — like a file-scope var
++loopChecks;                // counted by the old loop; now just 1 per frame (hash)
```

Print `loopChecks` in the status line. It increments by 1 per frame regardless of
snake length — constant time confirmed.

---

## 🎯 Challenge: Benchmark Both Approaches

**You know:** The loop-based and hash-based collision checks.

**Task:** Write a benchmarking function that creates a deque of 100 segments, then
runs 10,000 collision checks using both methods. Use `<chrono>` to time each
approach and print the elapsed microseconds.

```cpp
#include <chrono>

void benchmarkCollision() {
    // Build a 100-segment deque
    // ...

    auto start = std::chrono::high_resolution_clock::now();
    // Run 10,000 loop checks
    auto end   = std::chrono::high_resolution_clock::now();
    auto loopUs = std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();

    // Repeat for hash check
    // ...

    std::cout << "Loop: " << loopUs << " µs" << std::endl;
    std::cout << "Hash: " << hashUs << " µs" << std::endl;
}
```

---

<details>
<summary>▶ Expected Results</summary>

At 100 segments and 10,000 checks, you should see the loop taking significantly
longer than the hash. At 500 segments, the loop slows proportionally while the
hash stays roughly constant. Exact numbers depend on hardware, but the ratio
should be approximately `loop_time / hash_time ≈ snake_length`.

**Key insight:** This is what O(n) vs O(1) looks like in real timing data.
The theoretical complexity classes translate directly to measurable performance
differences. At game scale (60 FPS, hundreds of entities), these differences
determine whether a game runs smoothly or stutters.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| `PosSet` compiles | `std::unordered_set<std::pair<int,int>, PairHash>` is usable |
| Test: (4,10) in set | `.count({4,10})` returns 1 after insertion |
| Test: (4,12) not in set | `.count({4,12})` returns 0 before insertion |
| Set mirrors deque | After movement, `occupied.size() == body.size()` |
| O(1) self-collision | Static counter increments by 1 per frame regardless of length |
| `placeFood` uses set | Replaced the body-scan loop with `occupied.count()` |
| Self-collision still works | U-turning into own body still triggers "Game Over" |

---

## Quick Check Answers

**1. 150-length snake at 10 FPS — comparisons per second for self-collision?**
`150 × 10 = 1,500 comparisons/second`. In the worst case (no collision), all 150
segments are checked every frame. This is O(n) per frame × frames per second = O(n × FPS)
total comparisons per second. At 60 FPS and length 200: 12,000 comparisons/second —
for one mechanic in one game.

**2. What is the fundamental trick that makes hash tables O(1)?**
The hash function maps the key directly to an array index — the lookup becomes a
computation (hash the key) followed by an array access (read bucket[index]).
Array access is O(1) because it uses the address arithmetic formula from S-01 LAB 06:
`base + index × element_size`. No matter how many elements are in the hash table,
the lookup always performs exactly one hash computation and one array access.

**3. Two keys hash to the same bucket — this is called a hash ___? How is it handled?**
A **hash collision**. Two common strategies: (1) **Chaining** — each bucket holds a linked
list of all keys hashing to it. Lookup scans the (usually short) list. (2) **Open addressing**
— if the target bucket is occupied, probe nearby buckets (linear probing, quadratic probing,
or double hashing). `std::unordered_set` uses chaining. Collision handling is what prevents
hash tables from being "broken" by collisions — the invariant is maintained regardless.
