# Lesson 22: One Item or a Thousand, Treated the Same, and the Bug That Only Two Threads Can Cause
### (Project 8 — Desktop Inventory Tracker, C#)

**What you will build.** A `Category` that can hold both individual
`Product`s and other `Category`s, with one method — `GetTotalValue()`
— that works correctly no matter how deep the nesting goes. Then a
real, deliberately engineered race condition — not a statistical
maybe, a guaranteed, reproducible lost update — fixed first with `lock`,
then with `ConcurrentDictionary`. The transferable problems this lesson
is actually about: writing one method that treats "a single thing" and
"a group of things" identically, and the specific, mechanical way two
threads touching the same value at the same time can silently lose
data, with no exception, no warning, ever.

**What you need to know first.** Lesson 20 — `Product`'s `LowStock`
event. Lesson 21 — `Task.Run` genuinely running on a separate thread,
and its own closing exercise, which asked you to *observe* a race
condition without fixing it. This lesson fixes it, for real.

---

## Concept Unit: The Composite Pattern

### The Problem

A real inventory isn't flat — "Electronics" might contain "Phones" and
"Laptops," each holding their own products, and "Phones" might itself
be further divided. Computing "total value of everything in
Electronics" needs to work correctly regardless of how many layers of
nesting exist underneath — a method that only knows how to sum a flat
list of `Product`s would need to be rewritten every time the nesting
gets one level deeper.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `CompositeLab.cs` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none beyond the toolchain already used in this
  phase.

### The New Code

```csharp
interface IFileSystemEntry {
    long GetSize();
}

class File : IFileSystemEntry {
    private long size;
    public File(long size) { this.size = size; }
    public long GetSize() { return size; }
}

class Folder : IFileSystemEntry {
    private List<IFileSystemEntry> children = new List<IFileSystemEntry>();

    public void Add(IFileSystemEntry entry) {
        children.Add(entry);
    }

    public long GetSize() {
        long total = 0;
        foreach (var child in children) {
            total += child.GetSize();
        }
        return total;
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```csharp
Folder photos = new Folder();
photos.Add(new File(2000));
photos.Add(new File(3000));

Folder root = new Folder();
root.Add(new File(500));
root.Add(photos);

Console.WriteLine("Total size: " + root.GetSize());
```

Real output:

```
Total size: 5500
```

`root.GetSize()` correctly returned `5500` — `500` from its own direct
file, plus `5000` from `photos`, a nested `Folder` — without
`root.GetSize()`'s own code ever needing to know or care that `photos`
is itself a folder rather than a plain file. Both `File` and `Folder`
implement the exact same interface, `IFileSystemEntry`, and `Folder.GetSize()`
calls `child.GetSize()` on every child *uniformly* — if that child
happens to be another `Folder`, its own `GetSize()` recurses the same
way, automatically, with no special case written anywhere for "this
child is itself a container."

### Discard the throwaway example

`File`/`Folder`/`IFileSystemEntry` are deleted — they only existed to
prove one interface can represent both individual items and containers
of them, summed correctly at any depth, isolated from `Product`
entirely.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `InventoryItem.cs`, `Category.cs`;
  modified `Product.cs`.
- **Change type** — add; `Product` gains an interface implementation and
  a `Price` property.
- **Location** — new files; `Product.cs` modified.
- **Dependencies** — Lesson 20's `Product`.

### The New Code

```csharp
interface IInventoryItem {
    string Name { get; }
    double GetTotalValue();
}
```

```csharp
class Category : IInventoryItem {
    public string Name { get; set; }
    private List<IInventoryItem> children = new List<IInventoryItem>();

    public Category(string name) {
        Name = name;
    }

    public void Add(IInventoryItem item) {
        children.Add(item);
    }

    public double GetTotalValue() {
        double total = 0;
        foreach (var child in children) {
            total += child.GetTotalValue();
        }
        return total;
    }
}
```

and, on `Product`:

```csharp
class Product : IInventoryItem {
    // ...
    public double Price { get; set; }
    // ...
    public double GetTotalValue() {
        return Price * Quantity;
    }
}
```

### The Updated Project

`InventoryItem.cs` and `Category.cs` are new, shown whole above.
`Product` now implements `IInventoryItem`, alongside everything Lessons
19–20 already gave it — the same class, one more interface satisfied,
no existing members touched.

### Mechanical walkthrough

- `interface IInventoryItem { string Name { get; } double GetTotalValue(); }`
  — **(a) first appearance** of a **property inside an interface**:
  `string Name { get; }` declares that any implementer must expose a
  readable `Name` property — not a field, a property (Lesson 19),
  meaning `Product`'s existing `Name { get; set; }` already satisfies
  it without any changes needed.
- `class Category : IInventoryItem {` — **(b) hard concept
  reappearing**, `implements`-via-`:` from Lesson 21's
  `IInventoryComponent`.
- `private List<IInventoryItem> children = new List<IInventoryItem>();`
  — **(b) hard concept reappearing**: a generic `List`, Java's own
  Lesson 16 concept, here holding the *interface* type — meaning this
  one list can hold `Product`s, `Category`s, or any future class
  implementing `IInventoryItem`, all together, uniformly.
- `public double GetTotalValue() { double total = 0; foreach (var child in children) { total += child.GetTotalValue(); } return total; }`
  — **(b) hard concept reappearing**, the exact recursive-shaped summing
  loop proven in the isolated `Folder` lab.
- `public double GetTotalValue() { return Price * Quantity; }` on
  `Product` — **(a) first appearance**, conceptually: this is the
  **base case** — the point where recursion genuinely stops, because a
  `Product` has no children to sum over, only its own direct value.

### CS lens

This is the **Composite pattern**: individual objects (`Product`) and
compositions of objects (`Category`) both satisfy the same interface,
so client code can treat "one thing" and "a tree of things" identically
— the direct object-oriented cousin of the recursive tree-rendering
idea from Project 4, Lesson 11's Kanban columns, here generalized to
arbitrary depth instead of a fixed two levels. Also recognized in: the
DOM itself (an `Element` can contain other `Element`s — Project 4's own
foundation), a file system (this unit's own isolated lab), an
organization chart where a manager and an individual contributor both
respond to "how many people report up through you, eventually."

### SE lens

The alternative — a flat list of every `Product`, with a separate
`string CategoryPath` field on each one (`"Electronics/Phones"`) — would
avoid nested objects entirely, at the real cost this lesson's own
Problem section named: computing "total value of Electronics, including
everything nested under it" would mean parsing and matching path
strings, fragile in exactly the way Project 3, Lesson 9's Adapter unit
worried about brittle string-based logic. `Category`'s real cost: one
extra class, and every consumer of inventory data now has to be
prepared to receive either a `Product` or a `Category` wherever an
`IInventoryItem` is expected — in exchange, arbitrarily deep nesting is
handled by the exact same, unmodified `GetTotalValue()` method,
regardless of how many category layers a real store eventually needs.

### Commands needed

Same compile-then-run pattern as every C# lesson.

### Run it

```csharp
Category phones = new Category("Phones");
phones.Add(new Product("Basic Phone", "P-001", 99.99, 10));
phones.Add(new Product("Smart Phone", "P-002", 599.99, 5));

Category laptops = new Category("Laptops");
laptops.Add(new Product("Budget Laptop", "L-001", 399.99, 8));

Category electronics = new Category("Electronics");
electronics.Add(phones);
electronics.Add(laptops);
electronics.Add(new Product("Charger Cable", "C-001", 9.99, 100));

Console.WriteLine("Phones total: $" + phones.GetTotalValue());
Console.WriteLine("Laptops total: $" + laptops.GetTotalValue());
Console.WriteLine("Electronics total (everything nested): $" + electronics.GetTotalValue());
```

Real output:

```
Phones total: $3999.85
Laptops total: $3199.92
Electronics total (everything nested): $8198.77
```

`electronics.GetTotalValue()` — `8198.77` — correctly equals
`phones.GetTotalValue()` (`3999.85`) plus `laptops.GetTotalValue()`
(`3199.92`) plus the standalone charger cable's own value
(`999.00`), summed across two full levels of nesting by one unmodified
method.

### Connecting sentence

One method now correctly handles both single products and arbitrarily
deep category trees — the rest of this lesson turns to a completely
different kind of correctness problem, one that only shows up once more
than one thread touches the same data.

---

## Concept Unit: A Real, Deterministic Race Condition

### The Problem

Lesson 21's own closing exercise asked you to observe a race condition
by running concurrent, unsynchronized increments and hoping the timing
lined up wrong. That's honest about how race conditions usually get
found in practice — by accident, unreliably — but it's a poor way to
*understand* one, since "sometimes it's wrong" doesn't show *why*. This
unit builds one on purpose, guaranteed to fail every single time,
specifically so the actual mechanism is visible rather than inferred.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `DeterministicRace.cs` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `System.Threading`.

### The New Code

```csharp
using System.Threading;

class DeterministicRace {
    static int counter = 0;
    static ManualResetEvent bothHaveRead = new ManualResetEvent(false);
    static int readersReady = 0;

    static void RaceyIncrement() {
        int temp = counter;
        if (Interlocked.Increment(ref readersReady) == 2) {
            bothHaveRead.Set();
        }
        bothHaveRead.WaitOne();
        counter = temp + 1;
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```csharp
Thread t1 = new Thread(RaceyIncrement);
Thread t2 = new Thread(RaceyIncrement);
t1.Start();
t2.Start();
t1.Join();
t2.Join();

Console.WriteLine("Expected: 2");
Console.WriteLine("Actual:   " + counter);
```

Real output:

```
Expected: 2
Actual:   1
```

Two threads, each incrementing `counter` exactly once — and the final
value is `1`, not `2`. This is a **lost update**, and this version was
deliberately engineered to guarantee it happens, not left to chance: `int
temp = counter;` — both threads read `counter`'s value (`0`) *before*
either one writes anything back. `bothHaveRead.WaitOne()` is a real,
explicit synchronization point forcing both threads to pause *after*
reading and *before* writing, guaranteeing neither one sees the other's
result. When both resume, both compute `temp + 1` — `0 + 1` — and both
write `1` back. One increment is silently, completely lost, with no
exception, no warning, nothing in the program's own output to suggest
anything went wrong except the final number being smaller than
expected.

### Discard the throwaway example

`DeterministicRace` is deleted — it only existed to prove exactly, and
reproducibly, how a lost update happens, isolated from real project
data entirely.

### Mechanical walkthrough

- `static int counter = 0;` — **(c) already basic**, a plain shared
  field — note `static`, meaning both threads genuinely share the exact
  same memory location, not separate copies.
- `int temp = counter;` — **(b) hard concept reappearing**: reading a
  shared value into a local variable — ordinary on its own; dangerous
  specifically because of what happens between this line and the next.
- `Interlocked.Increment(ref readersReady)` — **(a) first appearance**:
  an atomic increment — one that genuinely cannot be interrupted
  partway through, unlike the plain `counter = temp + 1;` this whole
  unit exists to break — used here only to coordinate the demonstration
  itself, not as the lesson's actual fix.
- `bothHaveRead.WaitOne();` — **(a) first appearance** of
  `ManualResetEvent`: a real synchronization primitive that blocks a
  thread until `.Set()` is called elsewhere — used here purely to force
  the exact interleaving needed to guarantee the race, not something
  real project code would normally reach for.
- `counter = temp + 1;` — **(c) already basic** syntactically — the
  actual moment the lost update happens: both threads execute this with
  `temp` equal to `0`, so both write `1`.

### CS lens

This is a **race condition**, and specifically a **lost update**: two
threads performing a read-modify-write sequence on shared state without
coordination, where the correctness of the result depends on the exact,
unpredictable timing of their execution relative to each other. Also
recognized in: two people editing the same spreadsheet cell at the same
moment, both saves based on the value before either edit — one edit
silently disappears; a bank account balance updated by two simultaneous
transactions without proper locking (a famous, real-world category of
bug); Project 2's own `TaskList.history` stack, safe *only* because
nothing in this curriculum's Python or JavaScript phases ever had more
than one thread touching it at once.

### SE lens

This specific bug is real, and this lesson deliberately built the most
reliable, reproducible version of it possible — using explicit
synchronization primitives to *guarantee* the race, rather than relying
on timing luck, precisely because a bug that only sometimes reproduces
is far harder to trust as understood. In real, un-engineered code, this
exact shape of bug is often *rare* and *timing-dependent* — which is
part of what makes race conditions genuinely dangerous in practice: a
program can pass every test, ship, and run correctly thousands of times
before the wrong interleaving finally happens once, in production,
with no test ever having caught it.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

The exact mechanism of a lost update is now visible, not just
described — the next unit fixes it, and proves the fix holds even under
the same forced worst-case interleaving.

---

## Concept Unit: `lock` and `ConcurrentDictionary`

### The Problem

`counter = temp + 1;` needs to become **atomic** in effect — the
read-modify-write sequence needs to happen as one uninterruptible unit,
so no other thread can see a half-finished state.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `LockFix.cs` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```csharp
static int counter = 0;
static readonly object counterLock = new object();

static void SafeIncrement() {
    lock (counterLock) {
        int temp = counter;
        Thread.Sleep(10);
        counter = temp + 1;
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above — the exact same
read-then-write shape that broke in the previous unit, now wrapped in
`lock (counterLock) { ... }`.

### Introduce the concept in isolation

Real output, run with the same two-thread, forced-worst-case setup as
the previous unit — including a real, deliberate `Thread.Sleep(10)`
*inside* the locked section, specifically to prove the fix holds even
under maximum, artificially widened contention:

```
Expected: 2
Actual:   2
```

`lock (counterLock) { ... }` guarantees that only *one* thread can be
executing that block at a time — a second thread reaching `lock
(counterLock)` while another thread is already inside it simply waits
until the first one finishes. The read, the artificial delay, and the
write all happen as one uninterrupted unit from any other thread's
perspective — which is precisely why the result is correct even with a
real 10 millisecond pause deliberately inserted in the middle of the
"critical" moment.

### Discard the throwaway example

`LockFix` is deleted — the `lock` mechanism itself carries forward
conceptually into real project code.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `ConcurrentDictLab.cs`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `System.Collections.Concurrent`.

### The New Code

```csharp
using System.Collections.Concurrent;

var stock = new ConcurrentDictionary<string, int>();
stock["W-001"] = 0;

Task[] tasks = new Task[10];
for (int i = 0; i < 10; i++) {
    tasks[i] = Task.Run(() => {
        for (int j = 0; j < 10000; j++) {
            stock.AddOrUpdate("W-001", 1, (key, oldValue) => oldValue + 1);
        }
    });
}
await Task.WhenAll(tasks);
```

### The Updated Project

Brand-new file, shown whole above.

### Mechanical walkthrough

- `var stock = new ConcurrentDictionary<string, int>();` — **(a)
  first appearance.** A drop-in alternative to the generic
  `Dictionary<TKey, TValue>` proven safe (Lesson 21's own SE lens
  flagged this exact gap) to read and write from multiple threads at
  once, without a `lock` written by hand anywhere.
- `stock.AddOrUpdate("W-001", 1, (key, oldValue) => oldValue + 1);` —
  **(a) first appearance.** A single, atomic operation: if `"W-001"`
  isn't present, add it with the given initial value (`1`); if it *is*
  present, compute a new value from the old one using the given
  function — the entire read-then-write sequence happening as one
  indivisible unit, internally, the same guarantee `lock` provided
  explicitly in the previous unit, here built directly into the data
  structure itself.

### CS lens

`ConcurrentDictionary` is a **thread-safe** collection: a data structure
specifically engineered so its own internal operations never produce
the lost-update problem this lesson just built and fixed by hand, no
matter how many threads use it simultaneously. Also recognized in:
Java's own `ConcurrentHashMap` (the direct equivalent, available in
Java's standard library, never needed anywhere in Phase 3 since
`Inventory` in Project 7 was always single-threaded), Python's
`queue.Queue` (thread-safe by design, in a language whose Global
Interpreter Lock — mentioned honestly in Lesson 21 — already prevents
many, though not all, of these exact races), a database's own row-level
locking, doing the same job at a much larger scale.

### SE lens

Compare the two fixes directly: `lock` is general-purpose — it protects
*any* block of code, of any shape, at the cost of needing to be applied
correctly, by hand, everywhere shared state is touched, with a real risk
of forgetting one spot. `ConcurrentDictionary` is narrower — it only
protects operations on *this one data structure* — but that narrowness
is exactly its strength: there's no `lock` to forget, because the
safety is built into every method the dictionary itself exposes.
Proven directly:

```
Expected: 100000
Actual:   100000
```

Ten concurrent tasks, ten thousand increments each, on a shared
`ConcurrentDictionary`, with zero lost updates — no `lock` keyword
appears anywhere in this unit's own code.

### Commands needed

Same pattern.

### Run it

Both shown above.

### Connecting sentence

The exact lost-update mechanism this lesson built on purpose is now
closed two different ways — a general tool that requires discipline
everywhere it's needed, and a narrower tool that removes the need for
that discipline entirely, for the one specific job it's built for.

---

## Closing

**Connect the pieces.** Imagine `Category.Add(...)` being called from
multiple threads at once — a real possibility once Project 8 eventually
gets a UI, where a background reorder check and a user's own add-product
action could genuinely happen concurrently. `Category`'s own `children`
list, a plain `List<IInventoryItem>`, is not thread-safe — the same
lost-update risk this lesson built on purpose could silently drop an
added product. This lesson's own fixes are exactly the tools that
situation would need: either a `lock` around every mutation of
`children`, or replacing the underlying structure with something
already thread-safe, the same tradeoff weighed directly in this
lesson's last unit.

**What breaks without this.** Already shown, deterministically,
twice: the guaranteed lost update (`Actual: 1`, not `2`), and its two
real fixes, both proven correct even under artificially maximized
contention. Deliberately not restaged as a separate failure here, since
the whole point of engineering it to be reproducible was seeing it
happen exactly where it was built.

**Exercises.**
1. Add a `RemoveLowValue(double threshold)` method to `Category` that
   removes direct child products below a given value — decide, and
   justify in one sentence, whether it should recurse into nested
   categories or only affect direct children.
2. Reproduce this lesson's deterministic race with *three* threads
   instead of two (you'll need to adjust the `Interlocked.Increment`
   check), and confirm the final count is short by more than one.
3. `Category.GetTotalValue()` is not currently thread-safe if products'
   `Quantity` can change concurrently while a total is being computed.
   Describe, in a few sentences, what could go wrong, and which of this
   lesson's two fixes would be the better tool for it — you don't need
   to implement it, just reason through the tradeoff.

**Definition of done.**
- [ ] `Category` and `Product` both implement `IInventoryItem`, and
      `GetTotalValue()` correctly sums across at least two levels of
      real nesting, confirmed against the output shown above.
- [ ] You've reproduced the deterministic lost update — `Actual: 1`, not
      `2` — and can explain, precisely, which two lines both threads
      executed with the same stale value.
- [ ] Both fixes — `lock` and `ConcurrentDictionary` — are confirmed
      correct under real, maximum forced contention, not just "usually
      seems to work."
- [ ] You can state, in one sentence, when you'd reach for `lock` versus
      when you'd reach for a thread-safe collection instead.
- [ ] Commit with a message explaining why — e.g. `"Let Category and
      Product share one interface for uniform nested totals, and fix a
      deliberately engineered lost-update race with lock and
      ConcurrentDictionary"` — not `"add composite and fix race
      condition"`.

**This closes Project 8, and C#'s phase.** Across Lessons 19–22:
properties and LINQ removed real ceremony Java required; `event`
provided a broadcast mechanism with protections neither Python nor
JavaScript's own versions had; Mediator and genuinely concurrent
`Task`-based async proved real, physical differences from a
single-threaded platform; Composite and a real, engineered race
condition closed the phase on both a design pattern and the sharpest
new risk multithreading actually introduces. **Phase 5** moves to
C++ — manual memory, RAII, and a Mini Database Engine — where, for the
first time in this entire curriculum, nothing manages memory
automatically at all.
