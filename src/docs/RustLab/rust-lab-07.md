# Rust Web Server — LAB 07 — Collections: Vec, HashMap, and Iterators

**Prerequisites:** LAB 01–06. You understand types, ownership, borrowing, structs, enums, traits, generics, and modules. The guessing game is split across three files with a `GameState` struct driving all logic.

**What this lab adds:**
- What a collection is — data structures that hold multiple values
- `Vec<T>` — a growable list, its memory model, and how it manages the heap
- `HashMap<K, V>` — a lookup table, what hashing is, and when to use it
- Iterators — what they are, how they work, and the methods they provide
- Amortized cost — the computer science behind how `Vec` grows
- The guessing game gains a full guess history stored in a `Vec`, and a statistics summary using iterators

**Time:** 4–6 hours

---

> **Quick Check — try to answer before reading further:**
>
> 1. In Lab 02, you stored guess history in a fixed-size array `[i32; 7]`. What is the limitation of that approach — what happens if you want to store more or fewer items than you declared?
> 2. If you have a list of 1000 items and you want to find one specific item by name, checking each item one by one takes up to 1000 comparisons. What data structure do you think could find it in a single step?
> 3. A loop processes every item in a list one at a time. What would it mean to describe the processing as a *pipeline* instead — a series of transformations the data flows through?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, the guessing game records every guess in a `Vec` and prints a statistics summary when the game ends:

```
$ cargo run

I'm thinking of a number between 1 and 100.
You have 7 guesses. Good luck.

Guess 1: 50
Too high.

Guess 2: 25
Too low.

Guess 3: 37
Too high.

Guess 4: 30
Too low.

Guess 5: 33
Correct! You got it in 5 guesses!

── Game Summary ──────────────────────────────
Guesses: 50, 25, 37, 30, 33
Highest guess: 50
Lowest guess:  25
Average guess: 35
─────────────────────────────────────────────
Thanks for playing — well done!
```

---

## Part 1 — What a Collection Is

### Concept: Collection — A Data Structure That Holds Multiple Values

**What it is:** A collection is a data structure that groups multiple values together, provides operations to add, remove, and access them, and manages the memory needed to hold them.

**The problem before — fixed-size arrays:**

In Lab 02 you used `[i32; 7]` — a fixed-size array. It has exactly 7 slots, allocated at compile time, living on the stack. This works for exactly one case: when you know the exact number of elements at compile time and that number never changes.

Fixed-size arrays cannot:
- Grow when more items are added
- Shrink when items are removed
- Hold a number of items determined by the user at runtime

For anything dynamic — a list of HTTP requests received by a server, a history of guesses in a game, a set of active connections — you need a collection that manages its own memory.

**The three collections you will use most:**

| Collection | What it is | Best for |
|---|---|---|
| `Vec<T>` | Growable list | Ordered sequences, append-heavy |
| `HashMap<K, V>` | Key-value lookup table | Finding by name or ID |
| `HashSet<T>` | Set of unique values | Membership testing, deduplication |

This lab covers `Vec` and `HashMap`. `HashSet` appears in Lab 11 when we build the HTTP router.

---

## Part 2 — Vec

### Concept: `Vec<T>` — The Growable List

**What it is:** `Vec<T>` (pronounced "vector") is a growable, heap-allocated list of values of type `T`. It is the most used collection in Rust. Where you might use a list or array in other languages, you use `Vec` in Rust.

**What it hides:** `Vec` hides heap allocation, reallocation, and pointer arithmetic. You call `.push(value)` and the value appears in the list. You never call `malloc` or `realloc`. You never track how many bytes are allocated. You never manage a pointer to the beginning of the data. All of that is inside `Vec`.

The invariant `Vec` protects: **the elements are always stored contiguously in memory, in order, with no gaps.** You can index any element in constant time (`vec[3]` is instant regardless of how many elements there are) because the address of element `i` is always `base_address + i * element_size`. The base address and element size are tracked inside the `Vec`.

**Canonical example (General Explanation):**

```rust
let mut numbers: Vec<i32> = Vec::new();  // create an empty Vec
numbers.push(10);                         // add 10 — Vec grows
numbers.push(20);                         // add 20
numbers.push(30);                         // add 30

println!("{:?}", numbers);               // [10, 20, 30]
println!("{}", numbers[1]);              // 20 — zero-based indexing
println!("{}", numbers.len());           // 3 — number of elements
```

**The shorthand — `vec![]` macro:**

```rust
let numbers = vec![10, 20, 30];  // create a Vec with initial values
```

`vec![]` is a macro that creates a `Vec` with the given values already in it. Equivalent to creating an empty `Vec` and pushing each value — but more concise.

---

### Concept: `Vec` Memory Model — Three Fields, Heap Data

**What it is:** A `Vec<T>` stores three values on the stack and its elements on the heap — exactly like `String` from Lab 03.

```
Stack:                           Heap:
┌────────────────────┐           ┌─────┬─────┬─────┬─────┬─────┐
│ ptr ───────────────────────►  │ 10  │ 20  │ 30  │     │     │
│ len: 3             │           └─────┴─────┴─────┴─────┴─────┘
│ capacity: 5        │           (5 slots allocated, 3 used)
└────────────────────┘
```

- **`ptr`** — a pointer to the first element on the heap
- **`len`** — how many elements are currently stored
- **`capacity`** — how many elements the current heap allocation can hold

When `len == capacity` and you push another element, `Vec` must **reallocate** — allocate a larger block, copy all existing elements into it, and free the old block. This is transparent to you but has performance implications.

---

### Concept: Amortized Cost — How `Vec` Grows Efficiently

**What it is:** Amortized cost is a way of analyzing the average cost of an operation over a sequence of operations, even when individual operations have wildly different costs.

**The naive growth strategy (slow):**

If `Vec` grew by exactly 1 slot each time it runs out of room, every `push` that exceeds capacity would require a reallocation and copy of all existing elements:

```
push element 1: allocate 1 slot                (1 copy)
push element 2: allocate 2 slots, copy 1       (2 copies total)
push element 3: allocate 3 slots, copy 2       (4 copies total)
push element 4: allocate 4 slots, copy 3       (7 copies total)
...push n elements: n²/2 total copies
```

Inserting `n` elements would cost O(n²) — quadratic. For 1000 elements: roughly 500,000 copy operations.

**The doubling strategy (fast):**

When `Vec` runs out of capacity, it doubles the capacity. This means reallocations become exponentially rare:

```
push element 1:    capacity 1→2   (copy 0 existing)
push element 2:    no realloc     (fits in capacity 2)
push element 3:    capacity 2→4   (copy 2 existing)
push elements 4:   no realloc
push element 5:    capacity 4→8   (copy 4 existing)
...
```

With doubling, to insert `n` elements total, the copies are: 0 + 0 + 2 + 0 + 4 + 0 + 0 + 0 + 8 + ... which sums to approximately `2n`. So `n` pushes cost `2n` copy operations total — **O(n) amortized**. Each individual push is O(1) on average, even though some pushes are O(n) individually.

**Why this matters:** This is the computer science behind why `Vec::push` is described as "O(1) amortized" in documentation. Individual pushes are cheap. Occasional reallocations are expensive but rare enough that they average out. The doubling strategy is used by dynamic arrays in virtually every language: Python lists, Java ArrayList, C++ std::vector, JavaScript arrays.

**Pre-allocating when you know the size:**

If you know in advance approximately how many elements you will store, you can avoid reallocations entirely:

```rust
let mut history = Vec::with_capacity(7); // allocate space for 7 now — no reallocation later
```

`Vec::with_capacity(n)` creates a `Vec` with `len = 0` and `capacity = n`. You can push up to `n` elements without any reallocation.

**Project Application:**

The guess history will store at most `max_guesses` elements. We will use `Vec::with_capacity(game.max_guesses as usize)` to pre-allocate the right amount and avoid any reallocation.

**Watch for:** When you index a `Vec` with `vec[i]` and `i` is out of bounds (>= `len`), Rust panics immediately with a clear message. This is not silent undefined behavior like C — Rust checks bounds at runtime. To safely get an element that might not exist, use `.get(i)` which returns `Option<&T>`.

---

### Step 1 — Add Guess History to `GameState`

Open `src/game.rs`. Add a `history` field to `GameState`:

```rust
#[derive(Debug)]
pub struct GameState {
    pub max_guesses:   u32,
    pub is_over:       bool,
    pub guesses_taken: u32,
    secret:            i32,
    last_guess:        Option<i32>,
    pub history:       Vec<i32>,    // ← add this: stores every valid guess in order
}
```

Update `new()` to initialize it:

```rust
pub fn new() -> GameState {
    GameState {
        secret:        generate_secret(),
        guesses_taken: 0,
        max_guesses:   7,
        is_over:       false,
        last_guess:    None,
        history:       Vec::with_capacity(7), // ← pre-allocate for 7 guesses — no reallocation
    }
}
```

Update `take_guess` to record each guess:

```rust
pub fn take_guess(&mut self, guess: i32) {
    self.guesses_taken += 1;
    self.last_guess = Some(guess);
    self.history.push(guess);      // ← add this: record the guess in history

    match guess.cmp(&self.secret) {
        // ... rest unchanged ...
    }
    // ... rest unchanged ...
}
```

---

### SAVE AND TRY

```
cargo run
```

**Play a full game.** After it ends, add a temporary debug print to `main.rs` before the farewell messages:

```rust
println!("DEBUG history: {:?}", game.history); // ← print the Vec — {:?} handles Vec
```

You should see something like:

```
DEBUG history: [50, 25, 37, 30, 33]
```

Every valid guess in order. Invalid inputs (from Lab 05's error handling) are not in the history because they never reached `take_guess`. Remove the debug line after verifying.

**Change something:** Push a duplicate value manually before the loop starts:

```rust
game.history.push(999); // ← add temporarily to main.rs
```

Observe it appears first in the debug output. Notice it does not affect game logic — the history is separate from game state. Remove it.

---

## Part 3 — Iterators

### Concept: Iterator — Processing a Sequence One Element at a Time

**What it is:** An iterator is a value that produces a sequence of elements one at a time. You call `.next()` on it repeatedly — each call gives you the next element, wrapped in `Option<T>`, until the sequence is exhausted and `.next()` returns `None`.

**What it hides:** An iterator hides the mechanics of traversal. Whether the underlying data is a `Vec`, a file on disk, a network stream, or a mathematical sequence — the interface is the same: `.next()` gives you the next element. Code that works with iterators works with any source of data, not just in-memory lists.

The invariant iterators protect: **you cannot advance an iterator backward or access elements out of order.** An iterator is a one-way cursor. This constraint enables safe, lazy processing — elements can be produced on demand rather than all at once.

**The `Iterator` trait:**

An iterator is any type that implements the `Iterator` trait. The trait requires exactly one method:

```rust
trait Iterator {
    type Item;                    // the type of each element produced
    fn next(&mut self) -> Option<Self::Item>;  // produce the next element, or None when done
}
```

`type Item` is an **associated type** — a type defined as part of a trait, filled in when the trait is implemented. `Vec<i32>`'s iterator has `Item = i32`. A file-line iterator has `Item = String`. The rest of the iterator machinery works without knowing which specific `Item` type it is.

**Getting an iterator from a `Vec`:**

```rust
let numbers = vec![10, 20, 30];
let mut iter = numbers.iter();   // creates an iterator over &i32 references

println!("{:?}", iter.next()); // Some(10)
println!("{:?}", iter.next()); // Some(20)
println!("{:?}", iter.next()); // Some(30)
println!("{:?}", iter.next()); // None — exhausted
```

**The three iterator methods on `Vec`:**

| Method | Produces | Element type | Ownership |
|---|---|---|---|
| `.iter()` | Iterator over references | `&T` | Borrows the Vec |
| `.iter_mut()` | Iterator over mutable references | `&mut T` | Mutably borrows the Vec |
| `.into_iter()` | Iterator that consumes the Vec | `T` | Takes ownership |

Use `.iter()` when you want to read elements without consuming the `Vec`. Use `.into_iter()` when you want to process and discard the `Vec`. Use `.iter_mut()` when you want to modify elements in place.

---

### Concept: Iterator Adapters — Transforming the Pipeline

**What they are:** Iterator adapters are methods on iterators that transform one iterator into another iterator. They are **lazy** — they do not do any work until you consume the final iterator.

**What it hides:** Iterator adapters hide loops. A chain of `.map().filter().collect()` is equivalent to a `for` loop with an `if` inside and a push at the end — but the intent is clearer, the pieces are composable, and each step can be replaced independently.

**The most important adapters:**

**`.map(|x| transform)` — transform each element:**

```rust
let numbers = vec![1, 2, 3, 4];
let doubled: Vec<i32> = numbers.iter()
    .map(|&x| x * 2)     // multiply each element by 2
    .collect();           // collect results into a new Vec
// doubled = [2, 4, 6, 8]
```

**`.filter(|x| condition)` — keep only matching elements:**

```rust
let numbers = vec![1, 2, 3, 4, 5, 6];
let evens: Vec<&i32> = numbers.iter()
    .filter(|&&x| x % 2 == 0)  // keep only even numbers
    .collect();
// evens = [2, 4, 6]
```

**`.sum()` — add all elements:**

```rust
let numbers = vec![10, 20, 30];
let total: i32 = numbers.iter().sum();   // 60
```

**`.max()` and `.min()` — largest and smallest:**

```rust
let numbers = vec![50, 25, 37, 30, 33];
let highest = numbers.iter().max();  // Some(50) — Option because Vec might be empty
let lowest  = numbers.iter().min();  // Some(25)
```

**`.collect()` — consume the iterator into a collection:**

```rust
let doubled: Vec<i32> = numbers.iter().map(|&x| x * 2).collect();
```

`.collect()` is a **consumer** — it drives the iterator to completion, pulling every element through the pipeline and accumulating them into a collection. The type annotation (`: Vec<i32>`) tells `.collect()` what kind of collection to build.

**Laziness — why it matters:**

Iterator adapters are lazy. `.map()` does not process a single element until something consumes the iterator. This means:

```rust
let doubled = numbers.iter().map(|&x| x * 2); // no work done yet
// doubled is an iterator — it remembers what to do but hasn't done it
let result: Vec<i32> = doubled.collect();      // NOW the work happens
```

For a million-element list, a lazy chain of `.filter().map()` processes elements one at a time rather than building three intermediate lists of a million elements each. This is memory-efficient by design.

**The pipeline mental model:**

```
numbers.iter()
    ↓  produces: &i32 references one at a time
.filter(|&&x| x > 30)
    ↓  keeps only elements > 30
.map(|&x| x * 2)
    ↓  doubles each kept element
.collect::<Vec<i32>>()
    ↓  accumulates into a Vec
result: Vec<i32>
```

Data flows left to right (or top to bottom) through the pipeline. Each stage transforms the stream. No stage sees more than one element at a time. No intermediate collections are built (unless you call `.collect()` explicitly).

---

### Concept: `for` Loop Over a Collection

**What it is:** A `for` loop in Rust is syntactic sugar for creating an iterator and calling `.next()` until `None`.

```rust
for element in &numbers {         // calls numbers.iter() implicitly
    println!("{}", element);
}

// is exactly equivalent to:
let mut iter = numbers.iter();
loop {
    match iter.next() {
        Some(element) => println!("{}", element),
        None => break,
    }
}
```

**When to use `for` vs iterator chains:**

Use `for` when: you are doing something with side effects (printing, writing to a file, sending over a network) for each element.

Use iterator chains when: you are transforming data — filtering, mapping, computing aggregates. The chain expresses the transformation clearly; `for` hides the intent in the loop body.

---

### Step 2 — Add the Statistics Summary

We will add a `stats()` method to `GameState` that uses iterators to compute the summary. Add it inside `impl GameState` in `game.rs`:

```rust
pub fn stats(&self) -> Option<GameStats> {    // ← returns None if no guesses were made
    if self.history.is_empty() {              // ← .is_empty() returns true if len == 0
        return None;
    }

    let count = self.history.len() as i32;   // ← number of guesses made
                                              //   as i32 converts usize to i32 for arithmetic

    let highest = *self.history.iter().max().unwrap();
    // .max() returns Option<&i32> — Some(&max_value) or None
    // .unwrap() extracts the &i32 — safe here because we checked is_empty() above
    // * dereferences the &i32 to get an owned i32

    let lowest = *self.history.iter().min().unwrap();
    // same pattern as highest

    let sum: i32 = self.history.iter().sum();  // ← .sum() adds all elements
                                               //   type annotation : i32 tells sum what to produce

    let average = sum / count;                 // ← integer division — rounds toward zero

    Some(GameStats {                           // ← construct and return the stats
        highest,
        lowest,
        average,
        guesses: self.history.clone(),         // ← clone the Vec so GameStats owns its own copy
    })
}
```

Now define the `GameStats` struct. Add it above `GameState` in `game.rs`:

```rust
#[derive(Debug)]
pub struct GameStats {             // ← public: main.rs will print this
    pub highest: i32,
    pub lowest:  i32,
    pub average: i32,
    pub guesses: Vec<i32>,         // ← owned copy of the guess history
}
```

**Why clone the `Vec` instead of referencing it?**

`GameStats` is a separate value that `main.rs` will own. If `guesses` were `&Vec<i32>` (a reference to `GameState`'s history), `GameStats` could not outlive `GameState`. By cloning, `GameStats` owns its own independent copy. The clone is small — at most 7 integers.

**Why `Option<GameStats>`?**

If the game ended without any valid guesses (player only typed invalid input and hit the consecutive-invalid limit), `history` would be empty. Dividing by zero to compute the average would panic. Returning `Option<GameStats>` forces the caller to handle this case explicitly.

---

### Step 3 — Print the Summary in `main.rs`

Add to `main.rs` after the game loop, before the farewell messages:

```rust
// After the loop, before the farewell:
if let Some(stats) = game.stats() {              // ← if stats exist (history not empty)
    println!();
    println!("── Game Summary ──────────────────────────────");

    // print the guess history as a comma-separated list
    let guess_list: Vec<String> = stats.guesses   // ← start with Vec<i32>
        .iter()                                    // ← iterate over &i32 references
        .map(|&g| g.to_string())                  // ← convert each i32 to String
        .collect();                                // ← collect into Vec<String>

    println!("Guesses: {}", guess_list.join(", ")); // ← join with ", " between each
    //                                .join() takes a Vec<String> and produces one String
    //                                with the separator between each element

    println!("Highest guess: {}", stats.highest);
    println!("Lowest guess:  {}", stats.lowest);
    println!("Average guess: {}", stats.average);
    println!("─────────────────────────────────────────────");
}
```

**`.to_string()` — converting to `String`:**

Any type that implements `Display` automatically gets a `.to_string()` method — it formats the value and returns the result as a `String`. `42i32.to_string()` returns the `String` `"42"`. This is because `Display`'s `fmt` method is used internally by `.to_string()`.

**`.join(separator)` — combining a `Vec<String>` into one `String`:**

`.join(", ")` takes a slice of strings and concatenates them with `", "` between each pair. `vec!["50", "25", "37"].join(", ")` produces `"50, 25, 37"`. This is available on slices of strings — we will see slices formally in Lab 09.

---

### SAVE AND TRY

```
cargo run
```

Play a complete game. After winning or losing, you should see:

```
── Game Summary ──────────────────────────────
Guesses: 50, 25, 37, 30, 33
Highest guess: 50
Lowest guess:  25
Average guess: 35
─────────────────────────────────────────────
```

**Verify all three iterator operations work:**
- Make your highest guess first — confirm it appears as "Highest guess"
- Make your lowest guess last — confirm it appears as "Lowest guess"
- Calculate the expected average manually — verify the printed average matches

**Change something:** Change `.map(|&g| g.to_string())` to `.map(|&g| format!("[{}]", g))`. The guess list should now appear as `[50], [25], [37], [30], [33]`. Change it back.

**Test the empty history case:** Temporarily change `consecutive_invalid >= 3` to `consecutive_invalid >= 1` in `main.rs`. Type "hello" once — the game should end without any valid guesses. No summary should print (the `if let Some(stats)` is `None`). Change the threshold back to 3.

---

## Part 4 — HashMap

### Concept: `HashMap<K, V>` — The Lookup Table

**What it is:** A `HashMap<K, V>` stores key-value pairs. Given a key, it returns the associated value in approximately constant time — O(1) — regardless of how many pairs are stored.

**What it hides:** A `HashMap` hides the hash function, the bucket array, collision resolution, and dynamic resizing. You call `.insert(key, value)` and `.get(&key)`. The internal machinery — which can involve thousands of lines of carefully optimized code — is completely invisible.

The invariant `HashMap` protects: **each key appears at most once.** Inserting a key that already exists replaces the old value. You cannot accidentally store two values under the same key and then be surprised by which one you get back. Keys are unique by design.

**How hashing works — the big idea:**

A hash function takes any value (a string, an integer, a struct) and produces a fixed-size number called a **hash** or **digest**. The hash is used as an index into an array of **buckets** — slots that hold key-value pairs.

```
Key: "Ada"
         ↓ hash function
    3,847,291,052  (a large number)
         ↓ % bucket_count
    index 52       (a slot in the array)
         ↓ store value at slot 52
```

Looking up `"Ada"` later: run the same hash function, get the same index, look at slot 52. One operation, regardless of how many keys are stored. This is why lookups are O(1).

**Hash collisions:** Two different keys might produce the same index. This is called a **collision**. HashMap handles collisions by chaining (storing a list at each bucket) or probing (looking at nearby buckets). Collisions make lookups slightly slower in practice — a well-designed hash function makes them rare, keeping the average case close to O(1).

**What types can be keys:** A type can be used as a `HashMap` key if it implements `Eq` (equality comparison) and `Hash` (can be hashed). Integers, strings, and tuples of hashable types are all valid keys. Floats are not valid keys — they do not implement `Eq` (because `NaN != NaN`, as discussed in Lab 06).

**Canonical example (General Explanation):**

```rust
use std::collections::HashMap;

let mut scores: HashMap<String, i32> = HashMap::new();

scores.insert(String::from("Ada"),   100);  // insert a key-value pair
scores.insert(String::from("Grace"), 200);
scores.insert(String::from("Alan"),  150);

let ada_score = scores.get("Ada");    // get returns Option<&i32>
match ada_score {
    Some(score) => println!("Ada's score: {}", score),
    None        => println!("Ada not found"),
}

println!("Total players: {}", scores.len()); // 3
```

**Why `.get()` returns `Option<&V>`:**

The key might not exist in the map. `Option` forces you to handle that case. This is the same principle as Lab 05 — absence is made explicit in the type. There is no null, no sentinel value, no "check the length first" ritual. The type tells you exactly what to expect.

**Useful `HashMap` operations:**

```rust
// Insert only if key does not already exist:
scores.entry(String::from("Ada")).or_insert(0);
// entry() returns an Entry — a reference to the slot for this key
// or_insert(0) fills it with 0 if it was empty, otherwise does nothing

// Modify an existing value:
let count = scores.entry(String::from("Ada")).or_insert(0);
*count += 1;  // count is &mut i32 — dereference with * to modify

// Check if a key exists:
if scores.contains_key("Ada") { ... }

// Remove a key:
scores.remove("Ada");  // returns Option<i32> — the removed value, or None

// Iterate over all pairs:
for (key, value) in &scores {
    println!("{}: {}", key, value);
}
```

---

### Step 4 — Add a Word Frequency Tracker Using HashMap

We will add a simple demonstration of `HashMap` to the game: tracking how many times the player's guesses fell into each range (low, mid, high). This gives a sense of the player's guessing strategy.

Add to `GameStats` in `game.rs`:

```rust
#[derive(Debug)]
pub struct GameStats {
    pub highest:   i32,
    pub lowest:    i32,
    pub average:   i32,
    pub guesses:   Vec<i32>,
    pub zones:     HashMap<String, u32>, // ← how many guesses fell in each zone
}
```

Add `use std::collections::HashMap;` to the top of `game.rs`:

```rust
use std::collections::HashMap;   // ← add this import
use rand::Rng;
use std::cmp::Ordering;
```

Update the `stats()` method to compute zones:

```rust
pub fn stats(&self) -> Option<GameStats> {
    if self.history.is_empty() {
        return None;
    }

    let count = self.history.len() as i32;

    let highest = *self.history.iter().max().unwrap();
    let lowest  = *self.history.iter().min().unwrap();
    let sum: i32 = self.history.iter().sum();
    let average  = sum / count;

    let mut zones: HashMap<String, u32> = HashMap::new(); // ← zone frequency map

    for &guess in &self.history {                 // ← iterate over the guess history
        let zone = if guess <= 33 {               // ← determine which zone this guess is in
            "low (1–33)"
        } else if guess <= 66 {
            "mid (34–66)"
        } else {
            "high (67–100)"
        };

        let zone_count = zones                    // ← increment the count for this zone
            .entry(zone.to_string())              //   entry() gets or creates the slot
            .or_insert(0);                        //   or_insert(0) starts at 0 if new
        *zone_count += 1;                         //   * dereferences the &mut u32 to modify it
    }

    Some(GameStats {
        highest,
        lowest,
        average,
        guesses: self.history.clone(),
        zones,                                    // ← include the zone map
    })
}
```

Update the summary print in `main.rs` to show zones:

```rust
if let Some(stats) = game.stats() {
    println!();
    println!("── Game Summary ──────────────────────────────");

    let guess_list: Vec<String> = stats.guesses
        .iter()
        .map(|&g| g.to_string())
        .collect();

    println!("Guesses: {}", guess_list.join(", "));
    println!("Highest: {}  Lowest: {}  Average: {}",
        stats.highest, stats.lowest, stats.average);

    println!("Zones:");
    for (zone, count) in &stats.zones {          // ← iterate over the HashMap
        println!("  {}: {} guess{}", zone, count, if *count == 1 { "" } else { "es" });
    }

    println!("─────────────────────────────────────────────");
}
```

---

### SAVE AND TRY

```
cargo run
```

Play a game, making some guesses in each zone. You should see:

```
── Game Summary ──────────────────────────────
Guesses: 50, 25, 75, 37
Highest: 75  Lowest: 25  Average: 46
Zones:
  mid (34–66): 2 guesses
  low (1–33): 1 guess
  high (67–100): 1 guess
─────────────────────────────────────────────
```

**Note:** `HashMap` does not preserve insertion order — the zones may print in any order. This is by design: `HashMap` optimizes for lookup speed, not order. If order matters, use a `BTreeMap` (which keeps keys sorted) or a `Vec` of tuples. We will see ordered maps when we build the HTTP header parser.

**Change something:** Change the zone boundaries from `33/66` to `50`. Now there are only two zones — "low" and "high". Observe the output changes. Change it back to three zones.

---

## 🎯 Challenge: Implement `longest_drought`

**You know:** `Vec`, iterators, `HashMap`, `for` loops, `if` statements, methods.

**Task:** Add a method `longest_drought(&self) -> u32` to `GameState` that returns the longest consecutive run of guesses that were all on the same side of the secret number — all too high or all too low — without a correct guess in between.

For example, if the secret is 37 and the guesses were: `[50, 75, 60, 25, 10, 37]`

- Guesses 50, 75, 60 are all too high (3 in a row)
- Guesses 25, 10 are all too low (2 in a row)
- 37 is correct

The longest drought is 3 (the initial too-high streak).

**Starting point:**

```rust
pub fn longest_drought(&self) -> u32 {
    if self.history.is_empty() {
        return 0;
    }

    let mut longest: u32 = 0;
    let mut current: u32 = 0;
    let mut last_direction: Option<Ordering> = None;
    //      ↑
    //      tracks whether the last guess was Less or Greater
    //      None at the start — no previous guess

    for &guess in &self.history {
        let direction = guess.cmp(&self.secret);

        match direction {
            Ordering::Equal => {
                // correct guess ends any drought
                // update longest if current > longest, reset current
                // your code here
            }
            _ => {
                // guess was too high or too low
                // if direction matches last_direction, extend the streak
                // otherwise, start a new streak of length 1
                // your code here
            }
        }

        last_direction = Some(direction);
    }

    longest
}
```

**Hints:**
1. `last_direction == Some(direction)` compares an `Option<Ordering>` to a `Some(Ordering)` — this works because `Ordering` derives `PartialEq`
2. Update `longest` whenever `current` exceeds it: `if current > longest { longest = current; }`
3. Add `longest_drought` to the `GameStats` output after implementing it

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```rust
pub fn longest_drought(&self) -> u32 {
    if self.history.is_empty() {
        return 0;
    }

    let mut longest: u32 = 0;
    let mut current: u32 = 0;
    let mut last_direction: Option<Ordering> = None;

    for &guess in &self.history {
        let direction = guess.cmp(&self.secret);

        match direction {
            Ordering::Equal => {
                if current > longest {
                    longest = current;   // update before resetting
                }
                current = 0;            // correct guess ends the drought
                last_direction = None;  // reset direction tracking
            }
            _ => {
                if last_direction == Some(direction) {
                    current += 1;       // same direction as last — extend streak
                } else {
                    if current > longest {
                        longest = current; // new direction — save the old streak
                    }
                    current = 1;        // start new streak of length 1
                }
            }
        }

        last_direction = Some(direction);
    }

    // handle streak that runs to end of history (no correct guess to trigger final update)
    if current > longest {
        longest = current;
    }

    longest
}
```

Call it in `stats()` and add to `GameStats`:

```rust
pub struct GameStats {
    pub highest:         i32,
    pub lowest:          i32,
    pub average:         i32,
    pub guesses:         Vec<i32>,
    pub zones:           HashMap<String, u32>,
    pub longest_drought: u32,              // ← add this field
}

// In stats():
Some(GameStats {
    highest,
    lowest,
    average,
    guesses: self.history.clone(),
    zones,
    longest_drought: self.longest_drought(), // ← call the method
})
```

In `main.rs`:

```rust
println!("Longest same-direction streak: {}", stats.longest_drought);
```

**Key insight:** The streak must be finalized after the loop because the last streak might not end with a correct guess — it might simply run to the end of `history`. This "flush after the loop" pattern appears constantly in streaming data processing: you process elements one at a time, accumulating state, and must handle whatever partial result remains after the last element. You will use this pattern when parsing HTTP requests byte by byte — the parser accumulates bytes into a request and must finalize the last field after the last byte arrives.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| `Vec` history stores all valid guesses | Play a game — debug print shows all guesses in order |
| Invalid inputs not in history | Type "hello" — it does not appear in history |
| `.max()` / `.min()` correct | Highest and lowest match what you typed |
| `.sum()` and average correct | Calculate manually and compare |
| Guess list formatted correctly | `"50, 25, 37, 30, 33"` — comma-separated |
| `HashMap` zones count correctly | Make 2 mid guesses — mid shows "2 guesses" |
| `HashMap` iteration works | All three zones print (if all were guessed in) |
| Empty history case handled | No valid guesses → no summary printed |
| `Vec::with_capacity` pre-allocates | No issue — verified by compiler and clean run |
| `cargo build` zero errors | No compile errors or warnings |

---

## Quick Check Answers

**1. What is the limitation of a fixed-size array like `[i32; 7]`?**

The size is fixed at compile time and cannot change at runtime. If the player makes fewer than 7 guesses (they win early), the unused slots hold their initial values (zeroes) — wasted space. If you later change `max_guesses` to 10, you must update the array size manually in every place it appears. The array cannot adapt to input. Collections like `Vec` solve this by allocating exactly as much memory as needed, growing and shrinking as the program runs.

**2. What data structure finds an item by name in a single step?**

A hash map (called `HashMap` in Rust, `dict` in Python, `object`/`Map` in JavaScript). It uses a hash function to convert the key directly into an array index — bypassing the need to examine other elements. This gives O(1) average lookup time regardless of how many items are stored. A `Vec` with 1,000,000 items requires up to 1,000,000 comparisons to find one by value (linear search). A `HashMap` with 1,000,000 entries requires approximately 1 hash computation and 1 array access.

**3. What does it mean to describe list processing as a pipeline?**

A pipeline is a series of stages where data flows from left to right, each stage transforming the stream before passing it to the next. In Rust's iterator system: `.iter()` produces elements, `.filter()` discards unwanted ones, `.map()` transforms each remaining element, `.collect()` assembles the results. Each stage is independent — it only knows about its input and output. The key properties: laziness (no work happens until a consumer drives the pipeline), composability (stages can be added, removed, or reordered independently), and clarity (the transformation intent is visible in the chain rather than buried in a loop body). This pipeline model is the foundation of how your web server will process HTTP requests — each middleware layer is a stage in a pipeline that transforms the request before passing it to the next handler.
