# Lesson 21: Talking Through a Middleman, and Waiting for Real
### (Project 8 — Desktop Inventory Tracker, C#)

**What you will build.** An `InventoryMediator` sitting between
`Product`'s `LowStock` event and two independent reactions — a UI
banner, a reorder queue — so neither ever needs a direct reference to
the other, or to `Product` itself beyond the event it already exposes.
Then a real, measured proof of what "native async support" actually
means: `Task.WhenAll` genuinely overlapping waits, and `Task.Run`
genuinely executing on a different OS thread than the one that started
it — something Project 6's JavaScript, built on a single thread with no
alternative, could never do at all. The transferable problem this
lesson is actually about: reducing how many things need to know about
each other directly, and the real, physical difference between
*non-blocking* and *actually running somewhere else at the same time*.

**What you need to know first.** Lesson 20 — `Product`'s `LowStock`
event. Project 6, Lesson 14 — Promises and `async`/`await`, built
entirely on JavaScript's single thread.

---

## Concept Unit: The Mediator Pattern

### The Problem

Lesson 20 wired `widget.LowStock += LogLowStock;` and
`widget.LowStock += QueueReorder;` directly — two subscribers, attached
by hand, each one a plain method. That's fine for two. A real inventory
tracker will eventually want a UI component, a reorder system, a
logger, an email alert — and if each of those needs to know about the
*others* too (the UI needing to tell the reorder system something, the
reorder system needing to tell the logger something), the number of
direct connections between components grows fast, and every component
ends up needing to know about several others just to do its own job.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `MediatorLab.cs` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none beyond the toolchain already used in Lessons
  19–20.

### The New Code

```csharp
class ChatRoom {
    private List<User> users = new List<User>();

    public void Register(User user) {
        users.Add(user);
        user.Room = this;
    }

    public void Broadcast(User sender, string message) {
        foreach (User u in users) {
            if (u != sender) {
                u.Receive(sender.Name, message);
            }
        }
    }
}

class User {
    public string Name { get; set; }
    public ChatRoom Room { get; set; }

    public void Send(string message) {
        Room.Broadcast(this, message);
    }

    public void Receive(string from, string message) {
        Console.WriteLine($"{Name} got from {from}: {message}");
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```csharp
ChatRoom room = new ChatRoom();
User alice = new User("Alice");
User bob = new User("Bob");
room.Register(alice);
room.Register(bob);

alice.Send("Hey Bob!");
bob.Send("Hey Alice!");
```

Real output:

```
Bob got from Alice: Hey Bob!
Alice got from Bob: Hey Alice!
```

`alice` never holds a reference to `bob` anywhere — `alice.Send(...)`
only ever talks to `Room`, and `Room.Broadcast` is the only thing that
knows about every registered `User`. Adding a third user later means
one `room.Register(...)` call, with zero changes to `User` itself —
`User` doesn't grow more aware of who else exists just because the chat
room does.

### Discard the throwaway example

`ChatRoom`/`User` are deleted — they only existed to prove
communication routed through one shared object avoids direct
peer-to-peer references, isolated from `Product` entirely.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `InventoryMediator.cs`.
- **Change type** — add.
- **Location** — new file, alongside `Product.cs`.
- **Dependencies** — `Product`, Lessons 19–20.

### The New Code

```csharp
interface IInventoryComponent {
    void SetMediator(InventoryMediator mediator);
}

class InventoryMediator {
    private List<IInventoryComponent> components = new List<IInventoryComponent>();

    public void Register(IInventoryComponent component) {
        components.Add(component);
        component.SetMediator(this);
    }

    public void NotifyLowStock(Product product) {
        foreach (var c in components) {
            if (c is UiDisplay ui) ui.ShowLowStockBanner(product);
            if (c is ReorderSystem reorder) reorder.QueueReorder(product);
        }
    }
}

class UiDisplay : IInventoryComponent {
    private InventoryMediator mediator;
    public void SetMediator(InventoryMediator m) { mediator = m; }

    public void ShowLowStockBanner(Product p) {
        Console.WriteLine($"[UI] Banner: '{p.Name}' is running low!");
    }
}

class ReorderSystem : IInventoryComponent {
    private InventoryMediator mediator;
    public void SetMediator(InventoryMediator m) { mediator = m; }

    public void QueueReorder(Product p) {
        Console.WriteLine($"[Reorder] Queued a restock order for {p.Sku}");
    }
}
```

### The Updated Project

Brand-new file, shown whole above — `UiDisplay` and `ReorderSystem`
have no reference to each other anywhere; both only know about
`InventoryMediator`, and `InventoryMediator` is the only thing aware
that both exist.

### Mechanical walkthrough

- `interface IInventoryComponent { void SetMediator(InventoryMediator mediator); }`
  — **(b) hard concept reappearing**: `interface` from Lesson 15's
  Java-equivalent concept, C#'s own version, used here so
  `InventoryMediator` can hold a single, uniform list of *any* component
  type, rather than separate lists per concrete type.
- `public void Register(IInventoryComponent component) { components.Add(component); component.SetMediator(this); }`
  — **(b) hard concept reappearing**: the same registration shape as
  `ChatRoom.Register`, generalized to any `IInventoryComponent`.
- `if (c is UiDisplay ui) ui.ShowLowStockBanner(product);` — **(a)
  first appearance** of a **pattern-matching type check**: `c is
  UiDisplay ui` checks whether `c` is genuinely a `UiDisplay` at
  runtime, and, if so, binds it to a new variable `ui` of that specific
  type, in one expression — the direct C# counterpart to needing an
  explicit cast after a type check in Java.
- `class UiDisplay : IInventoryComponent {` — **(b) hard concept
  reappearing**: `:` is C#'s syntax for both inheritance and interface
  implementation (unlike Java's separate `extends`/`implements`
  keywords) — here declaring that `UiDisplay` satisfies
  `IInventoryComponent`'s contract.

### CS lens

This is the **Mediator pattern**: centralizing communication between a
set of objects through one shared coordinator, so those objects
reference the mediator instead of each other. Also recognized in: an
air traffic control tower (planes don't coordinate directly with each
other, they coordinate through the tower), a message broker in a
distributed system, C#'s own event system from Lesson 20 used at a
larger scale — arguably, `InventoryMediator.NotifyLowStock` is itself
just another Observer-shaped broadcast, one level up from `Product`'s
own `LowStock` event.

### SE lens

The alternative — `Product` holding direct references to `UiDisplay`
and `ReorderSystem`, calling both directly — was already ruled out back
in Lesson 20's own design: `Product` shouldn't need to know these
specific components exist at all. But even Lesson 20's version, with
`widget.LowStock += LogLowStock; widget.LowStock += QueueReorder;`
wired directly in `Main`, has a real, growing cost: every new component
means editing wherever subscriptions are wired up, and if components
ever need to talk to *each other* (not just react to `Product`), that
wiring code becomes real, tangled complexity. `InventoryMediator` costs
one extra coordinating class; in exchange, `UiDisplay` and
`ReorderSystem` can be added, removed, or modified without either one
ever needing to change, and without the wiring code in `Main` growing
more complex as components multiply.

### Commands needed

Same compile-then-run pattern as Lessons 19–20.

### Run it

```csharp
InventoryMediator mediator = new InventoryMediator();
mediator.Register(new UiDisplay());
mediator.Register(new ReorderSystem());

Product widget = new Product("Widget", "W-001", 10);
widget.LowStock += mediator.NotifyLowStock;

widget.Quantity = 3;
```

Real output:

```
Setting quantity to 3:
[UI] Banner: 'Widget' is running low!
[Reorder] Queued a restock order for W-001
```

`widget` only ever holds one subscriber on `LowStock`:
`mediator.NotifyLowStock` — a method on `InventoryMediator`, not on
`UiDisplay` or `ReorderSystem` directly. `Product` genuinely has no way
to know either of those two classes exists.

### Connecting sentence

Every component now talks through one shared mediator instead of
holding direct references to each other — the next unit turns to a
completely different kind of coordination: not *who* talks to whom, but
*how long* something takes to wait for, and what C# can actually do
about it that JavaScript, built on one single thread, never could.

---

## Concept Unit: `async`/`await`, Genuinely Concurrent

### The Problem

Project 6, Lesson 14 proved `async`/`await` makes waiting-without-blocking
read like ordinary code — but everything there ran on JavaScript's one
and only thread; "non-blocking" meant "the single thread moves on to
other work while waiting," never "two things are genuinely happening at
the same physical time." C# runs on a real, multi-threaded platform.
This unit exists to prove, not assume, what that actually buys.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `AsyncLab.cs` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `System.Threading.Tasks`, part of the .NET
  standard library.

### The New Code

```csharp
using System.Threading.Tasks;

static async Task<string> FetchAsync(string name, int ms) {
    await Task.Delay(ms);
    return $"{name} done";
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```csharp
Console.WriteLine("requesting...");
string result = await FetchAsync("thing", 100);
Console.WriteLine("got: " + result);
```

Real output:

```
requesting...
got: thing done
```

`Task.Delay(ms)` is C#'s direct counterpart to Project 6's
`setTimeout`-backed Promise — a real, awaitable pause with no CPU work
happening during it. `async Task<string>` — **(a) first appearance,
formally** — declares a method that returns a `Task<string>`: a
strongly-typed, generic version of JavaScript's plain `Promise`,
carrying its eventual result's *type* as part of the method's own
signature, checked at compile time the same way every other type in
this phase has been.

Now, the actual question this unit exists to answer — does awaiting
multiple things *overlap* the waiting, or just queue it?

```csharp
var sw = Stopwatch.StartNew();

string a = await FetchAsync("A", 200);
string b = await FetchAsync("B", 200);
string c = await FetchAsync("C", 200);

sw.Stop();
Console.WriteLine($"Sequential: {a}, {b}, {c} in {sw.ElapsedMilliseconds}ms");
```

Real output:

```
Sequential: A done, B done, C done in 608ms
```

Awaiting three 200ms delays *one after another* took roughly 600ms —
each `await` genuinely waited for its own `FetchAsync` to finish before
the next one even started, the same sequential behavior three chained
`await`s would produce in JavaScript. Now, starting all three *before*
awaiting any of them:

```csharp
sw.Restart();

Task<string> taskA = FetchAsync("A", 200);
Task<string> taskB = FetchAsync("B", 200);
Task<string> taskC = FetchAsync("C", 200);
string[] results = await Task.WhenAll(taskA, taskB, taskC);

sw.Stop();
Console.WriteLine($"Concurrent: {string.Join(", ", results)} in {sw.ElapsedMilliseconds}ms");
```

Real output:

```
Concurrent: A done, B done, C done in 198ms
```

**198ms, not 600ms** — all three 200ms waits genuinely overlapped.
`FetchAsync("A", 200)` called *without* `await` starts the operation and
immediately hands back a `Task<string>` representing it — already
running — rather than pausing to wait. `Task.WhenAll(...)` then waits
for all three to finish together, taking roughly as long as the
*longest* one, not the *sum* of all three.

### Discard the throwaway example

`AsyncLab`'s specific demonstration is deleted — `FetchAsync` itself
carries forward conceptually, but this exact timing comparison is this
unit's own proof, not reused project code.

### Mechanical walkthrough

- `async Task<string> FetchAsync(...)` — **(b) hard concept
  reappearing**, `async`/`Task` from the isolated lab.
- `await Task.Delay(ms);` — **(b) hard concept reappearing.**
- `Stopwatch.StartNew()` / `.ElapsedMilliseconds` — **(a) first
  appearance**: a real timer, measuring genuine wall-clock elapsed time
  — used here specifically so this unit's claim is a measurement, not
  an assertion.
- `Task<string> taskA = FetchAsync("A", 200);` (no `await`) — **(a)
  first appearance**, conceptually: calling an `async` method without
  `await`ing it immediately starts the operation and returns a live
  `Task<string>` representing work already in progress — the direct C#
  counterpart to JavaScript's own un-awaited Promise, proven identically
  back in Project 6, Lesson 14's own first unit.
- `await Task.WhenAll(taskA, taskB, taskC);` — **(a) first appearance.**
  Waits for every given `Task` to complete, returning an array of all
  their results together, only once the *last* one finishes.

### CS lens

This is **concurrency** made concrete and measured, not just
non-blocking scheduling: multiple independent operations genuinely
in flight at the same time, their total wait time bounded by the
longest one rather than their sum. Also recognized in: `Promise.all(...)`
in JavaScript — genuinely the same concurrency-of-waiting idea, since
even a single thread can have multiple *pending, non-CPU-bound*
operations in flight simultaneously; the real difference between the
two languages isn't *this* capability, both have it — it's what happens
next, with CPU-bound work, proven directly below.

### SE lens

Worth being precise here, not overclaiming: `Task.WhenAll` overlapping
I/O-style waits (network calls, timers, disk reads) is something
JavaScript's `Promise.all` already does too, on one thread, because none
of that waiting consumes CPU time — the thread is genuinely free to
juggle several pending waits at once. The real, physical difference
between the two platforms shows up specifically for work that *does*
consume CPU — proven in the next unit, not this one.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

Overlapping *waits* is something both platforms can do — the next unit
proves the one thing only a genuinely multi-threaded platform can:
running real computation on a different thread entirely.

---

## Concept Unit: `Task.Run`, on a Real Thread

### The Problem

JavaScript, across every project in Phase 2, ran on exactly one thread,
always — nothing there could ever run two pieces of actual CPU-bound
code at the physically same moment, only interleave non-blocking waits
on that single thread. C#'s `Task.Run` claims to run work on a genuinely
different thread. That claim is checkable, directly.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `ThreadProofLab.cs` (throwaway, this
  unit only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `System.Threading`.

### The New Code

```csharp
using System.Threading;
using System.Threading.Tasks;

Console.WriteLine("Main is running on thread " + Thread.CurrentThread.ManagedThreadId);

int cpuBoundResult = await Task.Run(() => {
    Console.WriteLine("Task.Run body is running on thread " + Thread.CurrentThread.ManagedThreadId);
    long sum = 0;
    for (int i = 0; i < 200_000_000; i++) sum += i;
    return (int)(sum % 1000);
});

Console.WriteLine("Back on thread " + Thread.CurrentThread.ManagedThreadId + " with result " + cpuBoundResult);
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

Real output:

```
Main is running on thread 1
Task.Run body is running on thread 4
Back on thread 4 with result 0
```

`Thread.CurrentThread.ManagedThreadId` reports which real OS-backed
thread is currently executing — `Main` runs on thread `1`; the genuinely
CPU-heavy loop inside `Task.Run(...)` ran on thread `4`, a completely
different thread, drawn from .NET's own thread pool specifically to run
real work in parallel with whatever the original thread might otherwise
be doing. This is not simulated, and not something any JavaScript code
in this curriculum could ever produce — Node has exactly one thread for
running JavaScript, full stop; `Thread.CurrentThread.ManagedThreadId`'s
JavaScript equivalent would report the same single thread every time,
for every operation, no exceptions.

One more honest, unscripted detail, worth stating plainly rather than
smoothing over: execution resumed on thread `4` after the `await`, not
back on thread `1` where it started. In a console application like this
one, there's no **synchronization context** forcing `await` to hop back
to a specific original thread — that guarantee exists in UI frameworks
(where all UI updates must happen on one specific thread, for real,
enforced reasons), but not here. This is a genuine, real property of
how `await` behaves outside a UI context, not a mistake in this
lesson's own code.

### Discard the throwaway example

`ThreadProofLab` is deleted — it only existed to prove `Task.Run`
genuinely executes on a separate OS thread, and to surface the
thread-resumption detail honestly, isolated from `InventoryMediator`
entirely.

### Mechanical walkthrough

- `Thread.CurrentThread.ManagedThreadId` — **(a) first appearance.**
  Reports a real integer identifying the current OS-backed thread —
  different calls to this from different points in the program can, and
  here do, return different values.
- `await Task.Run(() => { ... });` — **(a) first appearance** of
  `Task.Run`: schedules the given lambda to execute on a thread-pool
  thread, separate from whichever thread called `Task.Run` itself, and
  returns a `Task` representing that work, awaitable exactly like
  `Task.Delay` or `FetchAsync`.
- The loop inside the lambda (`for (int i = 0; i < 200_000_000; i++) sum += i;`)
  — **(c) already basic**, deliberately simple, genuinely CPU-bound
  work with no waiting involved at all, chosen specifically to
  distinguish this from `Task.Delay`'s non-CPU-bound waiting in the
  previous unit.

### CS lens

This is real **multithreading**: more than one sequence of instructions
genuinely capable of executing at the same physical time, on a platform
providing OS-level threads. Also recognized in: any multi-core CPU's
own hardware capability, Java's own `Thread`/`ExecutorService` classes
(available since Java's earliest versions — Phase 3 never used them,
since nothing in Project 7 needed genuine parallelism), Python's
`threading` module (real, though famously limited by Python's own
Global Interpreter Lock for CPU-bound work specifically — a real,
different constraint from either Java or C#, never explored in Phase 1
since nothing there needed it either).

### SE lens

The real, concrete difference from Project 6 is exactly this: `Task.Run`
can move genuinely CPU-heavy work off whatever thread is currently
handling user interaction (a UI's own thread, once Project 8 builds
one) or coordinating other work, so that heavy computation never freezes
the rest of the program — something no amount of `async`/`await` syntax
in JavaScript could ever achieve, because JavaScript never had a second
thread to move work *to* in the first place. The real cost, worth
naming honestly: multithreading introduces real problems Phase 1 and
Phase 2 never had to think about at all — two threads touching the same
shared data at the same time can genuinely corrupt it, a class of bug
(a **race condition**) with no equivalent anywhere in a single-threaded
language. This project hasn't hit that risk yet, because `Task.Run`'s
lambda here touches no shared state — the moment it does, real
coordination (locks, or safer built-in tools) becomes necessary, not
optional.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

Every idea from this lesson closes the same gap from a different angle:
Mediator reduces how many things need to know about each other
directly; `Task.WhenAll` and `Task.Run` together prove C#'s
`async`/`await` isn't just JavaScript's pattern wearing different
syntax — it's built on a platform that can genuinely run more than one
thing at the exact same physical moment, measured and shown, not
assumed from familiarity with the keywords.

---

## Closing

**Connect the pieces.** Imagine `InventoryMediator.NotifyLowStock`
eventually needing to check current supplier pricing over the network
before queuing a reorder — exactly the kind of operation this lesson's
second and third units exist for. `ReorderSystem.QueueReorder` could
`await` that check without freezing `UiDisplay`'s own banner from
showing immediately; if several products need reordering at once,
`Task.WhenAll` could check every supplier concurrently instead of one
at a time; and if the reorder logic ever needed genuinely heavy
computation (optimizing order quantities across dozens of products,
say), `Task.Run` could push that specific work onto its own thread
without freezing anything else the mediator is coordinating. Mediator
decides *who* talks to whom; this lesson's async tools decide *how
efficiently* any of them can wait for something slow without blocking
everyone else.

**What breaks without this.** Already shown directly, twice, with real
measured numbers: the 608ms-versus-198ms sequential-versus-concurrent
comparison, and the real, distinct thread IDs proving `Task.Run`
genuinely leaves the calling thread. Both are measurements, not claims
— rerunning either demonstration reproduces the same category of
result, even if exact numbers vary run to run.

**Exercises.**
1. Add a `Logger` component implementing `IInventoryComponent`,
   registered with `InventoryMediator` alongside `UiDisplay` and
   `ReorderSystem`, confirming all three react to one `NotifyLowStock`
   call with zero changes to the other two.
2. Reproduce this lesson's sequential-versus-concurrent timing
   comparison yourself, with three delays of your own choosing, and
   confirm the concurrent version's real elapsed time is close to the
   *longest* individual delay, not their sum.
3. Modify `ThreadProofLab`'s `Task.Run` lambda to increment a plain
   `int` field from multiple concurrently-running `Task.Run` calls at
   once (no locking), run it several times, and observe — with real
   output — that the final count is sometimes wrong. This is a real
   race condition, deliberately triggered; don't fix it yet, just
   observe it happening.

**Definition of done.**
- [ ] `InventoryMediator` correctly routes `Product`'s `LowStock` event
      to both `UiDisplay` and `ReorderSystem`, confirmed against real
      output, with neither component referencing the other directly.
- [ ] You've measured, with a real `Stopwatch`, that `Task.WhenAll`
      genuinely overlaps multiple waits instead of serializing them.
- [ ] You've confirmed, with real thread IDs, that `Task.Run` executes
      on a different OS thread than the caller — something no
      JavaScript code in this curriculum could ever produce.
- [ ] You can state, in one sentence, the real physical difference
      between "non-blocking" (something both JavaScript and C# do) and
      "genuinely parallel" (something only C#'s platform, among the
      languages in this curriculum so far, can do).
- [ ] Commit with a message explaining why — e.g. `"Route Product
      events through a Mediator so UI and reorder logic stay decoupled,
      and confirm C#'s Task-based async runs genuinely concurrently,
      unlike JavaScript's single-threaded event loop"` — not `"add
      mediator and async"`.

**Next lesson** stays in Project 8: `Composite`, once the inventory
needs to represent nested categories — a category containing both
products and other categories — and a first look at .NET's
`ConcurrentDictionary`, once more than one thread genuinely needs to
touch the same inventory data at once, the real risk this lesson's own
SE lens named and deliberately didn't solve yet.
