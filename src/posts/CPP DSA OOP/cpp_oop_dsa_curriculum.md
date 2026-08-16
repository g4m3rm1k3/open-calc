# C++ + OOP + DSA + Design Patterns — Integrated Curriculum
### Starting point: comfortable with Python (loops, conditionals, types, functions). Zero OOP in any language.

---

## The core idea

Every phase answers one question at increasing depth:

> **"What is this thing actually made of, and why is it built that way?"**

You already know *how to use* a list, a dict, a function. We're going to build cheap, small
versions of those things ourselves in C++, using raw memory first, then wrapping them in objects,
then comparing that to how the real C++ standard library does it. OOP isn't taught as its own
subject — it shows up the moment you need a way to bundle data with the code that manages it,
which happens almost immediately once you start building data structures.

**Recurring rule for every non-trivial topic:** we implement it **2–4 different ways**
(e.g. inheritance vs. composition vs. a function vs. a template) and compare them on:
ownership, allocation, coupling, performance, and readability. That comparison — not the
syntax — is the actual skill being taught.

**Recurring project thread:** starting in Phase 2, most lessons end with a small task that
touches file I/O — reading a CSV, writing JSON, hitting a free API, or persisting to SQLite.
You'll write a tiny **Python script to generate test-data files** (CSV/JSON/random datasets)
before each C++ exercise that needs one — that's the one place Python stays in the loop, as
your data-prep tool, not the language being taught.

---

## Phase 0 — Bridging Python → C++ (Weeks 1–2)

Goal: stop feeling like C++ is an alien language. Every lesson opens with "here's how you'd
do this in Python" then shows the C++ equivalent and *why it's different*.

| # | Lesson | Python anchor |
|---|--------|----------------|
| 0.1 | Compiling vs. interpreting — what `python script.py` skips that C++ can't | "why do I need `g++` at all" |
| 0.2 | Static types: `int x = 5` vs `x = 5` | duck typing vs. fixed types |
| 0.3 | Variables are *boxes with fixed size*, not *labels on any object* | this is the single biggest mental shift |
| 0.4 | Functions, parameters, return types | you already know this shape |
| 0.5 | Control flow (`if`, `for`, `while`) — syntax only, no new concepts | fast lesson |
| 0.6 | `const`, and why "can this change" matters more in C++ | Python has no real equivalent |
| **Mini-project** | Rewrite 3 small Python scripts (temp converter, FizzBuzz, word counter) in C++ | confidence check |

---

## Phase 1 — Memory: the thing Python hides from you (Weeks 2–4)

This is the prerequisite for *everything* else — objects, containers, and every data structure
are ultimately "a chunk of memory plus rules for using it."

| # | Lesson |
|---|--------|
| 1.1 | The stack vs. the heap (why Python never makes you think about this) |
| 1.2 | Pointers: an address is just a number |
| 1.3 | References (`&`) — a safer alias for a pointer |
| 1.4 | `new` / `delete`, and why forgetting `delete` is a real bug (Python's GC does this for you) |
| 1.5 | Arrays: fixed-size, contiguous, no bounds checking |
| 1.6 | **Build a resizable array from scratch** (raw `new[]`, manual `resize`) — this *is* what `list.append()` does under the hood in CPython, conceptually |
| 1.7 | Smart pointers (`unique_ptr`, `shared_ptr`) — C++'s version of "let the language clean up after me," closer to Python again |
| **Checkpoint project** | Reimplement your Phase-0 mini-projects using dynamic arrays instead of fixed ones |

---

## Phase 2 — What an "Object" Actually Is (Weeks 4–6)

This is where OOP starts — introduced as *the natural answer* to "my array-building code
needs to remember its size, capacity, and pointer together, and I keep passing three things
around everywhere."

| # | Lesson |
|---|--------|
| 2.1 | `struct`: bundling data with no code (a record, like a Python `dataclass`) |
| 2.2 | `class`: bundling data *with* the functions that operate on it |
| 2.3 | Constructors / destructors — Python's `__init__` has a real, deterministic counterpart here (`__del__` is unreliable in Python; C++ destructors are guaranteed — this is a genuine difference worth sitting with) |
| 2.4 | Access control (`private`/`public`) — Python's "just a convention" (`_x`) becomes enforced |
| 2.5 | **RAII**: the pattern where a constructor acquires a resource and the destructor releases it. This is the single most important C++-specific idea in the whole curriculum. |
| 2.6 | `this` pointer |
| 2.7 | Copying vs. moving — why C++ has *two* ways to hand off an object and Python has neither (everything in Python is a reference) |
| **Project** | Turn your Phase-1 dynamic array into a real `class MyVector` with constructor/destructor/copy — **this is literally step one of implementing `std::vector` yourself.** |

**File-I/O checkpoint:** read a CSV of numbers (Python script generates it), load it into your
`MyVector`, print stats. First contact with `<fstream>`.

---

## Phase 3 — Complexity, and Your First Real Comparison (Week 6)

| # | Lesson |
|---|--------|
| 3.1 | Big-O, explained through the array you already built (`push_back` is O(1) amortized — you'll *see* why because you wrote the resize logic yourself) |
| 3.2 | Time vs. space tradeoffs |
| 3.3 | **Comparison exercise:** your hand-built `MyVector` vs. `std::vector` vs. a Python `list` — benchmark all three doing the same task. What did the standard library buy you? |

---

## Phase 4 — Inheritance & Polymorphism, Taught via a Real Need (Weeks 7–9)

Introduced only once you have a concrete reason: you want several kinds of "shape" or
"employee" or "node" objects that a single piece of code can treat uniformly.

| # | Lesson |
|---|--------|
| 4.1 | Inheritance: "is-a" relationships |
| 4.2 | Virtual functions & dynamic dispatch — how C++ decides *at runtime* which version of a function to call (Python does this automatically; here you'll see the mechanism) |
| 4.3 | Abstract base classes / pure virtual functions (≈ Python's `ABC`) |
| 4.4 | Object slicing — a C++-only gotcha, worth a dedicated lesson |
| 4.5 | **Composition vs. inheritance**, same problem solved both ways, compared on coupling and flexibility |
| **Design pattern intro** | **Strategy pattern** — first pattern taught, because it falls directly out of "I want interchangeable behavior." Implemented 3 ways: inheritance+virtual, `std::function`, and a lambda. You compare all three. |

---

## Phase 5 — Linked Structures = OOP + Memory, Fused (Weeks 9–11)

This is where your array intuition (Phase 1–3) and your object intuition (Phase 2–4) merge.
A linked list is impossible to explain well without both.

| # | Lesson |
|---|--------|
| 5.1 | Singly linked lists — implemented with raw pointers first |
| 5.2 | Same list, rebuilt with `unique_ptr<Node>` — compare ownership models directly |
| 5.3 | Doubly linked lists |
| 5.4 | Traversal, insertion, deletion — and why these are O(1) here vs O(n) in your array |
| 5.5 | Fast/slow pointers, cycle detection |
| **Head-to-head project** | `MyVector` vs. `MyLinkedList`: same interface (`push`, `get`, `remove`), opposite performance profiles. You implement a small common interface (your first **abstract base class in practice**) so both can be swapped in and out — this doubles as an early, concrete **Strategy/Interface pattern** exercise. |

**File-I/O checkpoint:** parse a small JSON file (using a library like `nlohmann/json`) into a
linked list of records. First contact with a real third-party C++ library and JSON parsing.

---

## Phase 6 — Stacks, Queues, Deques (Weeks 11–12)

| # | Lesson |
|---|--------|
| 6.1 | Stack — implement on top of your `MyVector`, then again on top of your `MyLinkedList` |
| 6.2 | Queue, circular buffer |
| 6.3 | `std::deque` — how it actually differs from a vector internally |
| 6.4 | Monotonic stack/queue (used for real algorithm problems) |
| **Pattern** | **Command pattern** using a stack — build a simple undo/redo text editor. Compare an OOP `Command` class hierarchy vs. a `std::function`-based version. |

---

## Phase 7 — Trees, Recursion, and the Iterator Pattern (Weeks 13–15)

| # | Lesson |
|---|--------|
| 7.1 | Recursion, revisited properly (you know it from Python, but now with the call stack visible) |
| 7.2 | Binary trees, traversal (pre/in/post/level-order) |
| 7.3 | Recursive traversal vs. explicit-stack iterative traversal — direct proof that "recursion is just stored state" |
| 7.4 | Binary search trees: insert/search/delete |
| 7.5 | Balanced trees (AVL or red-black, conceptual — not a from-scratch build, just understand *why* they exist) |
| 7.6 | Heaps, and `std::priority_queue` |
| 7.7 | Tries (great for the pattern: build one from a dictionary word list you load from a file) |
| **Pattern** | **Iterator pattern** — give your BST a proper C++ iterator (`begin()`/`end()`) so you can use range-based `for` and STL algorithms on your own tree, the way you can on `std::vector`. This is the payoff lesson that makes "iterators" click. |
| **Pattern** | **Visitor pattern** — walk a tree applying different operations without modifying the tree class. Compared against a `std::variant`-based alternative. |

---

## Phase 8 — Hashing (Weeks 15–16)

You already trust Python's `dict` completely — now you build one.

| # | Lesson |
|---|--------|
| 8.1 | Hash functions |
| 8.2 | Separate chaining (using your `MyLinkedList` from Phase 5 — everything connects) |
| 8.3 | Open addressing / linear probing |
| 8.4 | Load factor & rehashing |
| 8.5 | `std::unordered_map` internals |
| **Project** | Build `MyHashMap`, then re-implement your CSV/JSON loaders from earlier phases to load into it instead of a vector. Compare lookup speed. |
| **Pattern** | **Flyweight pattern** — dedupe repeated string data using your hash map. |

---

## Phase 9 — Graphs (Weeks 17–19)

| # | Lesson |
|---|--------|
| 9.1 | Representations: adjacency list vs. adjacency matrix (a direct callback to Phase 3's tradeoff thinking) |
| 9.2 | BFS, DFS |
| 9.3 | Topological sort, cycle detection |
| 9.4 | Dijkstra, Union-Find |
| **Pattern** | **Observer pattern** — model a graph of "subscribers" (e.g., dependency graph triggering rebuilds). Compared against a signal/slot style callback list. |
| **API checkpoint** | Pull real data from a **free public API** (e.g. a REST endpoint returning city/flight/geographic data — using `libcurl` or `cpr`) and build a graph from it — e.g., cities as nodes, distances as weighted edges, run Dijkstra on live data. |

---

## Phase 10 — Sorting, Searching, and Generic Programming (Weeks 19–21)

| # | Lesson |
|---|--------|
| 10.1 | Binary search |
| 10.2 | Merge sort, quicksort, heap sort — implemented, then compared to `std::sort` |
| 10.3 | Function templates & class templates — "how do I write `MyVector` once and have it work for any type?" (this is the C++ answer to something Python gives you for free) |
| 10.4 | Lambdas & custom comparators — sort your structures by any field, plugged in as a function |
| **Pattern** | **Template Method pattern** vs. a generic templated function — same "define the skeleton, plug in the steps" idea, shown two ways. |

---

## Phase 11 — Functional-Style C++ (Weeks 21–22)

A deliberate perspective shift after ~20 weeks of object-thinking.

| # | Lesson |
|---|--------|
| 11.1 | Functions as values, function pointers, `std::function` |
| 11.2 | `std::optional`, `std::variant` — a taste of Python's flexible typing, done safely |
| 11.3 | STL algorithms (`transform`, `filter`/`copy_if`, `accumulate`) — the C++ equivalent of Python's `map`/`filter`/`reduce`/comprehensions |
| 11.4 | Ranges pipelines |
| **Comparison project** | Take one real task (e.g., "average the JSON records where field X > threshold") and implement it 4 ways: raw loop, STL algorithms, ranges pipeline, and Python one-liner, side by side. |

---

## Phase 12 — Persistence Layer: Files, JSON, XML, CSV, SQLite (Weeks 22–24)

This phase formalizes what's been sprinkled throughout — now as first-class lessons, tied to
patterns.

| # | Lesson |
|---|--------|
| 12.1 | `<fstream>` fundamentals — text and binary |
| 12.2 | CSV parsing (hand-rolled, then with a small library) |
| 12.3 | JSON with `nlohmann/json` — serialize/deserialize your own classes |
| 12.4 | XML with `tinyxml2` |
| 12.5 | SQLite via `sqlite3` C API (or a thin wrapper) — your first real "database," no server needed |
| 12.6 | Calling a free REST API with `cpr`/`libcurl`, parsing the JSON response into your own objects |
| **Pattern** | **Repository pattern** — wrap your SQLite/JSON/CSV access behind one clean interface so the rest of your code doesn't care which storage backend it's talking to. This is the pattern that ties "OOP interfaces" directly to "practical file/DB work." |
| **Pattern** | **Factory pattern** — pick the right repository (CSV vs JSON vs SQLite) at runtime based on config. |

*(Python's role here: small one-off scripts to generate realistic fake CSV/JSON test files
before each exercise — e.g. `faker`-style random data — so your C++ code has something
non-trivial to chew on.)*

---

## Phase 13 — Concurrency, Lightly (Weeks 24–25, optional but recommended)

| # | Lesson |
|---|--------|
| 13.1 | Threads, mutexes — Python's GIL means you've never really had to think about this |
| 13.2 | A thread-safe queue (built on your Phase 6 queue) |
| 13.3 | `std::future`/`std::async` |
| **Pattern** | **Producer/Consumer** and a small **Thread Pool** |

---

## Capstones (Weeks 25–30) — everything converges

Pick 2–3, not all — each one deliberately forces you to reuse most of the curriculum:

1. **LRU Cache** — `MyHashMap` + `MyLinkedList` + Repository pattern to persist it to SQLite between runs.
2. **Mini Expression Evaluator** — parses text input into an AST (tree from Phase 7), evaluated via Visitor pattern; compare an OOP-node hierarchy vs. a `std::variant`-based AST.
3. **CSV/JSON → SQLite ETL Tool** — reads messy CSV (Python script generates realistically messy data), cleans it, loads it into SQLite, using the Repository + Factory patterns from Phase 12.
4. **Job Scheduler** — priority queue (Phase 6) + graph dependency resolution (Phase 9) + thread pool (Phase 13) + Observer for progress reporting.
5. **"City Explorer"** — free geocoding/weather API → graph of locations → Dijkstra shortest path → results cached in SQLite → served back out as JSON.

Each capstone ends with the same question the whole curriculum has been building toward:

> *"I could have solved this with inheritance, composition, a callable, a template, or a
> variant. Given what this program actually needs, why did I choose what I chose?"*

---

## How we'll actually run this day-to-day

- Each lesson: short concept explanation → you write code → we compare 2+ implementations → a
  short "what did this cost/buy us" discussion.
- I'll write the Python data-generator scripts when a lesson needs one, so you're never
  blocked waiting on test data.
- No lesson introduces a pattern or DSA concept in the abstract — it always arrives because a
  concrete problem in the exercise needs it.

Want me to start on **Phase 0, Lesson 0.1** now, or would you rather I adjust the pacing/scope
first (e.g. compress Phase 0 since your Python fundamentals are already solid, or add a
lesson on something specific you're curious about)?
