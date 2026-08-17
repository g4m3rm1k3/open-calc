# Polyglot Software Foundations Curriculum

### Learner: comfortable in Python. No formal OOP background. Learns language syntax on their own.

---

## Track A — File I/O

_Language: C++. Files are the excuse; growable storage, resource safety, and lazy evaluation are the point._

| #   | Vehicle                                                                         | Concept taught                                                                                                   | Build   |
| --- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------- |
| A1  | Reading input of unknown size into a fixed-size buffer overflows it.            | **DSA** — dynamic array: a container that doubles its capacity when full instead of a fixed block.               | small   |
| A2  | The same growable-array logic would have to be copy-pasted per value type.      | **OOP** — generics: write the class once, parameterized by the type it holds.                                    | small   |
| A3  | A file must never stay open if an error happens mid-read.                       | **OOP** — RAII: tie a resource's lifetime to an object's lifetime so its destructor guarantees cleanup.          | small   |
| A4  | A file too large to fit in memory still needs processing.                       | **FUNC** — generators: yield one item at a time on demand instead of building the whole result up front.         | snippet |
| A5  | Which lines matter changes day to day (by keyword today, by severity tomorrow). | **PATTERN** — Strategy: put interchangeable behavior behind one interface so the caller never changes.           | small   |
| A6  | You need a provably correct sort order, not just "call the library."            | **DSA** — merge sort (split in half, sort each half, merge) + **FUNC** — a comparator lambda defining the order. | small   |

---

## Track B — Parsing & Structured Data

_Language: C++. Parsed JSON/XML is the excuse; trees and the ways to operate on them are the point._

| #   | Vehicle                                                                                                           | Concept taught                                                                                                                            | Build |
| --- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| B1  | Parsed data naturally nests (a group contains items, which contain fields).                                       | **DSA** — tree + traversal orders: pre-order, in-order, post-order, and one done iteratively with an explicit stack instead of recursion. | small |
| B2  | New read-only operations (print it, total it, count it) keep needing to be added without touching the node class. | **PATTERN** — Visitor: define new operations externally; each node "accepts" a visitor instead of gaining a new method per operation.     | small |
| B3  | You want to loop over the tree the same way you loop over any collection.                                         | **PATTERN** — Iterator: a standard way to walk a structure one element at a time, hiding its internal shape.                              | small |
| B4  | A "bundle" of parsed items should work anywhere a single item does.                                               | **PATTERN** — Composite: a container that implements the same interface as the things it contains, so operations recurse for free.        | small |
| B5  | Thousands of parsed records repeat the same substrings (domains, tags, categories).                               | **PATTERN** — Flyweight: store one shared copy of repeated data and reference it instead of duplicating it per record.                    | small |

---

## Track C — Search & Lookup

_Language: C++. "Find this fast" is the excuse; the data structure that makes it fast is the point._

| #   | Vehicle                                                                                               | Concept taught                                                                                                                          | Build |
| --- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| C1  | Scanning every record for a match gets slow as the data grows.                                        | **DSA** — hash map: a hash function maps a key to a bucket index; collisions handled by chaining, with load-factor-triggered rehashing. | small |
| C2  | Typing a few letters should suggest matches — exact-match lookup can't do that.                       | **DSA** — trie: a tree where each path from the root spells out a prefix.                                                               | small |
| C3  | Before an expensive lookup you want a cheap "definitely not present" check without storing every key. | **DSA (variant)** — Bloom filter: a bit array plus several hash functions, trading certainty for memory.                                | small |
| C4  | You need fast lookup _and_ fast insert together — a sorted array only gives you one.                  | **DSA** — binary search tree.                                                                                                           | small |
| C5  | Inserting already-sorted data collapses the BST into a straight line.                                 | **DSA (variant)** — self-balancing tree (AVL or Red-Black): rotates on insert/delete to keep height bounded.                            | small |
| C6  | Data keeps arriving in sorted, append-only order and still needs fast search.                         | **DSA (variant)** — skip list: a linked list with random "express lane" pointers, O(log n) search with cheap inserts.                   | small |

---

## Track D — Caching

_Language: C++. "This call is slow and repeats" is the excuse; bounded memory with eviction is the point._

| #   | Vehicle                                                                                               | Concept taught                                                                                                                           | Build   |
| --- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| D1  | An expensive call gets repeated with the same input.                                                  | **DSA** — LRU cache: hash map (O(1) lookup) combined with a doubly linked list (O(1) move-to-front/evict), evicting least-recently-used. | small   |
| D2  | A cache miss must be distinguishable from a legitimately-empty stored value.                          | **FUNC** — an Optional/nullable return type representing "a value, or explicitly nothing."                                               | snippet |
| D3  | Recency isn't always the right signal — a frequently-hit-but-not-recent key is more valuable to keep. | **DSA (variant)** — LFU cache: track a hit count instead of recency order.                                                               | small   |

---

## Track E — Dependency & Task Graphs

_Language: C++. Job scheduling is the excuse; graphs and the algorithms over them are the point._

| #   | Vehicle                                                                          | Concept taught                                                                                                        | Build   |
| --- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------- |
| E1  | Jobs depend on other jobs finishing first — more than one dependency each.       | **DSA** — graph as an adjacency list.                                                                                 | snippet |
| E2  | Some dependency configs contradict each other (A needs B needs A).               | **DSA** — cycle detection via DFS.                                                                                    | small   |
| E3  | You need one concrete valid order to actually run jobs in.                       | **DSA** — topological sort (Kahn's algorithm: repeatedly run any zero-dependency job, using a queue of "ready" jobs). | small   |
| E4  | Among several ready jobs, some are more urgent.                                  | **DSA** — priority queue / min-heap.                                                                                  | small   |
| E5  | Some jobs share a physical resource and can't run together.                      | **DSA** — Union-Find: merge into groups, answer "same group?" in near-O(1).                                           | small   |
| E6  | Dependents and a progress display both need to react the instant a job finishes. | **PATTERN** — Observer: a subject notifies registered listeners without knowing who they are.                         | small   |
| E7  | Real dependencies have a cost (latency, transfer time), not just an order.       | **DSA (variant)** — Dijkstra's algorithm, reusing E4's priority queue to always expand the cheapest known path.       | small   |

---

## Track F — Constructing Things

_Language: Java, then C#. "I need the right object built the right way" is the excuse; creational patterns are the point._

| #         | Vehicle                                                                                                                                   | Concept taught                                                                                                                                              | Build   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| F1 (Java) | Unrelated types (a flat fee, a percentage fee) force duplicated handling code everywhere they're used.                                    | **OOP** — inheritance + polymorphism: subclasses share a base's interface; the base's method runs whichever subclass's version applies, decided at runtime. | small   |
| F2 (Java) | The right concrete type has to be picked from input data, not hardcoded.                                                                  | **PATTERN** — Factory: one function decides which concrete class to build.                                                                                  | small   |
| F3 (C#)   | An object has many optional fields; a constructor covering every combination is unusable.                                                 | **PATTERN** — Builder: chain calls that each set one piece, then produce the finished object.                                                               | small   |
| F4 (C#)   | Whole matched families of related objects (a region's tax rule + receipt format + charge type) need to be created together, consistently. | **PATTERN** — Abstract Factory: a factory of factories producing a matched family.                                                                          | small   |
| F5 (C#)   | Cloning an already-configured object is cheaper than rebuilding one from scratch.                                                         | **PATTERN** — Prototype.                                                                                                                                    | snippet |

---

## Track G — Wrapping, Composing & Transforming

_Language: C#, then Python. Calls to wrap, pipelines to build — the excuse; structural patterns and functional composition are the point._

| #           | Vehicle                                                                                                  | Concept taught                                                                             | Build   |
| ----------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------- |
| G1 (C#)     | Two providers with incompatible APIs need to be called identically.                                      | **PATTERN** — Adapter: wrap an incompatible interface behind the one your code expects.    | small   |
| G2 (C#)     | A multi-step process (build → adapt → send) shouldn't leak into every caller.                            | **PATTERN** — Facade: one simple entry point hiding the steps.                             | small   |
| G3 (C#)     | Retry-and-log behavior needs to wrap a call without touching that call's own code.                       | **PATTERN** — Decorator: wrap behavior around something transparently.                     | small   |
| G4 (C#)     | Exactly one shared logger/config instance is wanted app-wide — until concurrency breaks that assumption. | **PATTERN** — Singleton, and why shared mutable global state is often the wrong answer.    | small   |
| G5 (C#)     | Several report types share the same skeleton and differ in exactly one step.                             | **PATTERN** — Template Method: fixed skeleton in a base, one step overridden per subclass. | small   |
| G6 (Python) | Chained transforms on a dataset turn into unreadable nested loops.                                       | **FUNC** — closures and higher-order functions, composed into a pipeline.                  | small   |
| G7 (Python) | "Transform every item," "keep the matching ones," "combine into one" keep getting reinvented by hand.    | **FUNC** — map / filter / reduce, and comprehensions as their inline syntax.               | snippet |
| G8 (C#)     | The same transform-and-aggregate pipeline is needed in a statically-typed language.                      | **FUNC** — same vocabulary via LINQ (reinforces G7 in a new language, not a redo of it).   | snippet |
| G9 (Python) | Swapping which hash/cipher algorithm runs shouldn't change any calling code.                             | **PATTERN** — Strategy, reapplied on a new problem (reinforces A5).                        | snippet |

---

## Track H — Editable History

_Language: C++. An editable, undoable buffer is the excuse; linked structures and reversible actions are the point._

| #   | Vehicle                                                                          | Concept taught                                                                                         | Build |
| --- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----- |
| H1  | Inserting/deleting in the middle of an array means shifting everything after it. | **DSA** — linked list: singly first, then doubly to support moving backward.                           | small |
| H2  | Raw pointers between nodes are exactly where leaks and double-frees happen.      | **OOP** — ownership: exactly one thing is responsible for freeing each resource.                       | small |
| H3  | Every edit needs to be reversible later, not just applied in place.              | **PATTERN** — Command: wrap an action (and its inverse) as an object instead of executing it directly. | small |
| H4  | You need both undo and redo, not just one history.                               | **DSA** — stack (two stacks: one for undo, one for redo).                                              | small |

---

## Track I — Storage, Queues & Concurrency

_Language: Python, then C++. Databases and threads are the excuse; decoupled storage and safe concurrent access are the point._

| #           | Vehicle                                                                            | Concept taught                                                                                                    | Build |
| ----------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----- |
| I1 (Python) | Storage format (CSV, JSON, SQL) shouldn't leak into the rest of the code.          | **PATTERN** — Repository: hide _how_ data is stored behind one interface.                                         | small |
| I2 (Python) | Swapping the storage backend (file → database → ORM) shouldn't touch calling code. | **PATTERN** — Repository, second backend — proves the interface actually decouples.                               | small |
| I3 (C++)    | Two threads incrementing shared state at the same time produce wrong results.      | **OOP/DSA** — a critical section guarded by a lock, encapsulated inside a circular-buffer queue class.            | small |
| I4 (C++)    | Worker threads need to safely pull jobs off that shared queue.                     | **PATTERN** — Producer/Consumer: producers add work, consumers take it, the queue handles the handoff.            | small |
| I5 (C++)    | A mutex is real overhead when all you need is a single atomic increment.           | **DSA (variant)** — lock-free atomics: a hardware-guaranteed operation that updates safely without ever blocking. | small |

---

## If you want a bigger build later

None of this requires a capstone. If at some point you want to wire a few tracks together (say, C's search index + D's cache + I's Repository) into something bigger, that's a choice you make later with skills already in hand — not a required final project.
