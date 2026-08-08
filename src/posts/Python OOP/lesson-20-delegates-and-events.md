# Lesson 20: A Broadcast That Can't Be Silently Overwritten
### (Project 8 — Desktop Inventory Tracker, C#)

**What you will build.** `Product` gains a real `LowStock` event, fired
automatically whenever its quantity drops below a threshold, with two
completely independent subscribers reacting to it — the third distinct
shape Observer has taken in this curriculum: hand-built from a plain
list in Python (Project 2, Lesson 7), already built into the platform
in JavaScript (Project 4, Lesson 10), and, here, a real language
*keyword* — `event` — sitting on top of a more general mechanism —
`delegate` — that's genuinely dangerous to use directly, proven with
two real compile errors. The transferable problem this lesson is
actually about: a broadcast mechanism is only as trustworthy as its
protection against being silently hijacked by whoever's holding a
reference to it.

**What you need to know first.** Project 2, Lesson 7 — Observer's
core shape: a subject, a list of subscribers, a broadcast. Lesson 19 —
this project's own `Product`, properties.

---

## Concept Unit: `delegate`

### The Problem

C#'s Strategy-shaped tools so far — Lesson 19's lambdas — worked without
ever declaring an interface first, unlike Java's Lesson 15. Before
building anything Observer-shaped, it's worth seeing directly what
actually makes that possible: a real type representing "a method with
this exact signature," which C# calls a `delegate`.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `DelegateLab.cs` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none beyond the toolchain already used in Lesson
  19.

### The New Code

```csharp
delegate int Operation(int a, int b);

class DelegateLab {
    static int Add(int a, int b) { return a + b; }
    static int Multiply(int a, int b) { return a * b; }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```csharp
Operation op = Add;
Console.WriteLine(op(3, 4));

op = Multiply;
Console.WriteLine(op(3, 4));
```

Real output:

```
7
12
```

`delegate int Operation(int a, int b);` declares a real type,
`Operation` — not a class, not an interface, a **delegate type** —
whose values are *methods matching this exact signature*: two `int`
parameters, an `int` return. `Operation op = Add;` assigns an actual
method to a variable of that type, and `op(3, 4)` calls whatever method
`op` currently holds — reassigning `op = Multiply` and calling it again
proves the same variable can hold *different* methods over time,
calling whichever one it currently references.

### Discard the throwaway example

`Operation`/`Add`/`Multiply` are deleted — they only existed to prove a
`delegate` is a real, reassignable reference to a method, isolated from
anything Observer-shaped.

### Mechanical walkthrough

- `delegate int Operation(int a, int b);` — **(a) first appearance.**
  Declares a new named type; any method whose parameters and return
  type match exactly can be assigned to a variable of this type.
- `Operation op = Add;` — **(a) first appearance**, specifically: note
  `Add` is written with no parentheses — this refers to the *method
  itself*, not a call to it (`Add()` would be a call, and wouldn't
  compile here, since `Add` requires arguments).
- `op(3, 4)` — **(a) first appearance** of invoking a delegate:
  syntactically identical to calling a plain method, but actually
  calling through to whichever real method `op` currently references.

### CS lens

A `delegate` is a real, compiler-checked **function reference** — the
same underlying idea as a Python function being a first-class value
(Project 1, Lesson 3) or a JavaScript function being passed directly
(Project 5, Lesson 12), but, true to C#'s static typing, with a real
declared type governing exactly what shape of function is allowed.
Also recognized in: C's own function pointers (a much lower-level,
unchecked ancestor of this same idea), Java's functional interfaces
(Lesson 15's `PricingStrategy`) — the same underlying need, met by an
`interface` instead of a dedicated keyword, since Java has no separate
`delegate` concept at all.

### SE lens

Nothing to compare against yet — this unit's whole job is proving the
mechanism works in isolation before the next two units show what it's
actually good for, and where it becomes genuinely dangerous if used
carelessly.

### Commands needed

Same compile-then-run pattern as Lesson 19.

### Run it

Shown above.

### Connecting sentence

A delegate variable can be reassigned to different methods — the next
unit shows it can also hold *more than one method at once*, which is
the real foundation Observer needs.

---

## Concept Unit: Multicast Delegates, and Two Real Dangers

### The Problem

Observer needs *multiple* independent subscribers reacting to one
event — a single delegate variable holding one method at a time isn't
enough on its own.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `MulticastLab.cs` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```csharp
delegate void Notify(string message);

class MulticastLab {
    static void LogToConsole(string message) {
        Console.WriteLine("console: " + message);
    }

    static void LogWithPrefix(string message) {
        Console.WriteLine("[ALERT] " + message);
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```csharp
Notify subscribers = LogToConsole;
subscribers += LogWithPrefix;

subscribers("Stock is low");
```

Real output:

```
console: Stock is low
[ALERT] Stock is low
```

One call, `subscribers("Stock is low")`, and *both* methods ran. `+=`
on a delegate variable doesn't replace what it holds — it **combines**
the new method with whatever was already there, producing a **multicast
delegate**: one variable, internally holding an ordered list of methods,
all invoked in sequence by a single call.

Now, the real danger — proven directly, not just warned about — using
a plain `public` delegate field exactly the way `subscribers` was just
used, but reached from *outside* the class that owns it:

```csharp
class Publisher {
    public Notify Subscribers;
}
```

```csharp
Publisher pub = new Publisher();
pub.Subscribers += LogToConsole;
pub.Subscribers += LogWithPrefix;

pub.Subscribers("Stock is low");

// Danger 1: outside code can wipe out every other subscriber by mistake
pub.Subscribers = LogWithPrefix;
pub.Subscribers("Stock is low");

// Danger 2: outside code can invoke it directly, bypassing the publisher entirely
pub.Subscribers("This should only ever come from Publisher itself");
```

Real output:

```
console: Stock is low
[ALERT] Stock is low
[ALERT] Stock is low
[ALERT] This should only ever come from Publisher itself
```

Both dangers are real and silent: `pub.Subscribers = LogWithPrefix;` —
using `=` instead of `+=` — didn't add a subscriber, it **replaced**
every existing one; `LogToConsole` never fires again after that line,
with no error anywhere. And nothing stopped code entirely outside
`Publisher` from calling `pub.Subscribers(...)` directly, faking an
event that `Publisher` itself never actually raised.

### Discard the throwaway example

`MulticastLab`, `Publisher`, and both danger demonstrations are
deleted — they proved multicast combination works, and precisely how a
plain public delegate field fails to protect against misuse, isolated
from `Product` entirely.

### Mechanical walkthrough

- `Notify subscribers = LogToConsole; subscribers += LogWithPrefix;` —
  **(a) first appearance** of `+=` on a delegate: combines methods
  rather than replacing the variable's content.
- `public Notify Subscribers;` on `Publisher` — **(b) hard concept
  reappearing**: a plain public field, same as any field before
  properties (Lesson 19) were introduced to control access to one.
- `pub.Subscribers = LogWithPrefix;` — **(a) first appearance**,
  conceptually: `=` on a delegate *replaces* its entire contents, the
  precise, silent danger this unit exists to demonstrate.
- `pub.Subscribers("...")` called from `Main`, entirely outside
  `Publisher` — **(a) first appearance**, conceptually: nothing about a
  plain delegate field distinguishes "the owning class raising this
  event" from "arbitrary outside code pretending to."

### CS lens

Nothing new beyond what a multicast delegate already is — the real
content of this unit is diagnostic: showing precisely *where* a
reasonable-looking mechanism has a real gap, before the next unit closes
it.

### SE lens

Both dangers share one root cause: a plain delegate field offers no
distinction between "subscribing" and "taking over," or between "the
owner raising the event" and "anyone with a reference raising it." That
gap isn't hypothetical — it's proven, live, in the output above, with
zero errors or warnings anywhere. Something more restrictive is needed.

### Commands needed

Same pattern.

### Run it

Shown above, both dangers.

### Connecting sentence

A multicast delegate combines subscribers correctly, but a plain field
holding one gives outside code far more power than a real event
mechanism should — the next unit is C#'s actual answer.

---

## Concept Unit: `event`

### The Problem

What's needed: outside code should be able to subscribe (`+=`) and
unsubscribe (`-=`), and nothing else — no overwriting with `=`, no
invoking directly. C# provides exactly this restriction as a language
keyword.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `EventFix.cs` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```csharp
class Publisher {
    public event Notify Subscribers;

    public void Raise(string message) {
        Subscribers?.Invoke(message);
    }
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```csharp
Publisher pub = new Publisher();
pub.Subscribers += LogToConsole;
pub.Raise("Stock is low");
```

Real output:

```
console: Stock is low
```

Subscribing with `+=` still works exactly the same. Now, attempting
both of the previous unit's dangers against this `event`-declared
version:

```csharp
pub.Subscribers += LogToConsole;
pub.Subscribers = LogToConsole;
```

```
$ csc EventDangerBlocked1.cs
EventDangerBlocked1.cs(15,13): error CS0070: The event 'Publisher.Subscribers' can only appear on the left hand side of += or -= (except when used from within the type 'Publisher')
```

```csharp
pub.Subscribers += LogToConsole;
pub.Subscribers("direct call from outside");
```

```
$ csc EventDangerBlocked2.cs
EventDangerBlocked2.cs(15,13): error CS0070: The event 'Publisher.Subscribers' can only appear on the left hand side of += or -= (except when used from within the type 'Publisher')
```

Both of the previous unit's real, silent dangers are now real,
*compile-time* errors — the exact same "caught before it runs" guarantee
Lesson 15 proved for types, here protecting a broadcast mechanism's
integrity instead. Note the error message's own wording: "except when
used from within the type `Publisher`" — `Publisher` itself, internally,
can still assign or invoke `Subscribers` directly; only *outside* code
is restricted, which is precisely why `Raise(string message)` exists as
`Publisher`'s own sanctioned way to fire the event.

### Discard the throwaway example

`EventFix` and both blocked-danger files are deleted — they proved
`event` genuinely closes both gaps, isolated from `Product` entirely.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — modified `Product.cs`.
- **Change type** — add (a `LowStock` event, wired into the `Quantity`
  property's `set`).
- **Location** — inside `class Product`.
- **Dependencies** — Lesson 19's `Product`.

### The New Code

```csharp
delegate void LowStockHandler(Product product);

class Product {
    private int quantity;
    public event LowStockHandler LowStock;

    public int Quantity {
        get { return quantity; }
        set {
            quantity = value;
            if (quantity < 5) {
                LowStock?.Invoke(this);
            }
        }
    }
}
```

### The Updated Project

```csharp
delegate void LowStockHandler(Product product);                    // ← new

class Product {
    public string Name { get; set; }
    public string Sku { get; set; }

    private int quantity;
    public event LowStockHandler LowStock;                          // ← new

    public int Quantity {
        get { return quantity; }
        set {
            quantity = value;
            if (quantity < 5) {                                       // ← new
                LowStock?.Invoke(this);                                 // ← new
            }
        }
    }

    public Product(string name, string sku, int quantity) {
        Name = name;
        Sku = sku;
        Quantity = quantity;
    }

    public string Summary() {
        return $"{Name} ({Sku}) x{Quantity}";
    }
}
```

Setting `Quantity` — through ordinary property assignment, Lesson 19's
own guarantee — now automatically checks whether the new value crosses
the low-stock threshold, and, if so, raises `LowStock` to every
subscriber, entirely inside `Product`'s own property, with no separate
method a caller needs to remember to call.

### Mechanical walkthrough

- `delegate void LowStockHandler(Product product);` — **(b) hard
  concept reappearing**, a delegate type, this time describing "a
  method that takes the `Product` that triggered the event" — the
  direct C# counterpart to Project 2, Lesson 7's `on_event(event,
  task)` callback shape.
- `public event LowStockHandler LowStock;` — **(b) hard concept
  reappearing**, `event` from the isolated lab, applied to a
  project-specific delegate type instead of the generic `Notify`.
- `LowStock?.Invoke(this);` — **(a) first appearance** of `?.` — the
  **null-conditional operator**: if `LowStock` is `null` (meaning no
  subscribers have ever attached at all — an event with zero
  subscribers starts as `null`, not an empty list), the entire
  expression short-circuits and does nothing, instead of throwing —
  proven directly below — the same safe-miss shape as `.get()`
  returning `null`/`None`/`undefined` across every earlier phase of
  this curriculum, here protecting against calling a method on
  nothing at all.
- `.Invoke(message)` — **(a) first appearance**: the explicit method
  name for calling a delegate, used here instead of the shorthand
  `LowStock(this)` specifically because `?.` requires a method call to
  attach to, and `?.LowStock(this)` isn't valid syntax on its own.

### CS lens

This is Observer, in its third real shape in this curriculum: `event`
plus `delegate` together provide language-level subscribe/notify
machinery, with real, compiler-enforced protection around who can
subscribe versus who can raise — stronger than Project 2, Lesson 7's
hand-built Python version (nothing there stopped external code from
calling `on_event` directly, or replacing `TaskList.observers` outright)
and narrower in scope than JavaScript's `addEventListener` (which
handles arbitrary event types on arbitrary DOM elements; C#'s `event` is
declared per-purpose, on a specific class, for a specific delegate
shape). Also recognized in: virtually every .NET UI framework's own
event model (button clicks, property-changed notifications in WPF,
Project 8's own eventual UI layer), C#'s `INotifyPropertyChanged`
interface (the standard-library version of exactly this pattern, used
throughout real .NET data-binding).

### SE lens

Compare all three now, directly: Python's version (Project 2, Lesson 7)
cost the least ceremony but offered no protection at all — any code
with a reference to `TaskList` could call `observer.on_event(...)`
directly or reassign `.observers` entirely. JavaScript's `addEventListener`
offered real protection (no direct way to "replace" all listeners with
one careless assignment) for free, built into the platform, at the cost
of needing a live DOM element to hang off of — nothing this general
for plain objects. C#'s `event` sits between them: real, compiler-enforced
protection, proven with two real errors above, at the cost of a
`delegate` type declared up front for every distinct event shape —
genuine ceremony, paid once per event type, in exchange for a guarantee
neither earlier language's version actually had.

### Commands needed

Same pattern.

### Run it

```csharp
Product widget = new Product("Widget", "W-001", 10);
widget.LowStock += LogLowStock;
widget.LowStock += QueueReorder;

widget.Quantity = 8;   // still fine, no event
widget.Quantity = 3;   // triggers LowStock

Console.WriteLine("Reorder list now contains: " + string.Join(", ", reorderList));
```

Real output:

```
Setting quantity to 8 (still fine):
Setting quantity to 3 (triggers LowStock):
[log] Low stock warning: Widget (W-001) x3
[reorder] Queued W-001 for reordering
Reorder list now contains: W-001
```

Two entirely independent subscribers — a console logger, a reorder
queue — both correctly notified from one property assignment, and only
once the threshold was actually crossed, not on the earlier, still-safe
assignment to `8`. And, confirming `?.Invoke` genuinely protects the
zero-subscriber case:

```
Dropping quantity with zero subscribers listening:
No crash — done.
```

### Connecting sentence

`Product` now broadcasts its own state changes to as many independent
listeners as attach, through a mechanism that genuinely cannot be
hijacked from outside — the same core idea Project 2 and Project 4 each
built differently, landing here as neither the loosest nor the most
automatic of the three, deliberately.

---

## Closing

**Connect the pieces.** One quantity change, through the whole lesson:
`widget.Quantity = 3` runs through the property `set` block built in
Lesson 19; inside it, `quantity < 5` is now true, so `LowStock?.Invoke(this)`
fires — `?.` first confirms at least one subscriber exists, then calls
each one in the order it was attached, `LogLowStock` then
`QueueReorder`, both receiving the exact `Product` instance that
triggered them, `this`. The event delegate type, `LowStockHandler`, is
what made this type-safe from the start; `event` is what made it
impossible for any code outside `Product` to silently break that
guarantee — proven twice, with two real compile errors, before it was
ever trusted with the real `LowStock` event.

**What breaks without this.** Already shown directly and fully — both
real dangers, both real compile-time fixes — deliberately not restaged
here, since seeing each exactly where it happened, against the same
`Publisher`/`Notify` pair, was the entire point of this lesson's second
and third units.

**Exercises.**
1. Add a second event, `BackInStock`, firing when `Quantity` crosses
   back *above* the low-stock threshold after having been below it —
   you'll need to track whether it was already low before deciding
   whether crossing back up is actually a meaningful transition worth
   raising.
2. `LogLowStock` and `QueueReorder` currently run in the exact order
   they were subscribed. Confirm this with real output by adding a
   third subscriber and observing its position in the sequence, then
   look up whether C# guarantees this ordering or merely happens to
   produce it.
3. Rewrite this lesson's `Product`/`Publisher` example using C#'s
   built-in generic `EventHandler<T>` delegate type instead of a
   hand-declared `LowStockHandler`, and explain in one sentence what
   `EventHandler<T>` saves you from declaring yourself.

**Definition of done.**
- [ ] You've triggered both real compile errors — overwriting with `=`,
      invoking directly from outside — against an `event`-declared
      field, and can explain what each one is protecting against.
- [ ] `Product.LowStock` correctly notifies multiple independent
      subscribers exactly when quantity crosses below the threshold,
      confirmed against the real output shown above.
- [ ] You've confirmed, with real output, that `?.Invoke` safely does
      nothing when zero subscribers are attached.
- [ ] You can state, in one sentence each, how Python's, JavaScript's,
      and C#'s versions of Observer differ in what they protect against
      and what ceremony each requires.
- [ ] Commit with a message explaining why — e.g. `"Raise a LowStock
      event from Product's Quantity property using event instead of a
      plain delegate field, so subscribers can't be silently
      overwritten or bypassed"` — not `"add low stock event"`.

**Next lesson** stays in Project 8: the `Mediator` pattern, once
`Product`, an eventual UI layer, and a reorder system all need to
communicate without every piece holding direct references to every
other piece — and a first look at C# `async`/`await`'s *native* support
for exactly the pattern Project 6, Lesson 14 built entirely on top of
JavaScript's own event loop.
