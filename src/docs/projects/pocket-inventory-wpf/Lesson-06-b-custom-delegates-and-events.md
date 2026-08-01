# Lesson 06b: A Variable That Holds a Method

*(Prepended before Lesson 7, directly after Lesson 06a — see
`CURRICULUM_NOTES.md`'s 2026-07-31 audit. Lesson 7's own
`PropertyChangedEventHandler` is named "a delegate type" and its
`PropertyChanged` field is declared with the `event` keyword — both
used correctly, neither ever explained. This lesson explains both, from
a delegate type you write yourself.)*

**Developer Story**
> As a developer about to implement `INotifyPropertyChanged`, I want to
> understand what a delegate actually is — a variable that holds a
> method, not a value — and why the field that raises one is marked
> `event` instead of being a plain public field.

**What you will build**
Nothing that survives — every example here is a throwaway lab, same as
every other prepended lesson. What you'll walk away with: a real,
tested understanding of `delegate`, multicast `+=`, and exactly what
`event` protects against.

**What you need to know first**
Lesson 0a: class, object, method. Lesson 6a: generic type parameters
(not required here, but the same "placeholder" way of thinking helps).

**Terms introduced in this lesson:**
- **`delegate`** — a type whose values are *methods*, not data; a
  variable of a delegate type can be assigned any method matching its
  exact signature (parameters and return type), and called like a
  method itself.
- **Multicast delegate** — a single delegate variable that can hold more
  than one method at once, added via `+=`; invoking it calls every
  attached method, in the order they were added.
- **`event`** — a modifier on a delegate-typed field, restricting code
  *outside* the declaring class to only `+=`/`-=` — never direct
  invocation, never wholesale replacement with `=`.

---

## Concept Unit: `delegate` — A Type Whose Values Are Methods

### The Problem

Every variable this project has used so far holds *data* — a number, a
string, an `InventoryItem`. Sometimes what's actually needed is a way
to hold *a method itself*, to be called later, without knowing in
advance exactly which method that will be.

### Introduce the Concept in Isolation
```bash
dotnet new console -o DelegateLab
```

Replace `Program.cs`:

```csharp
void LogToConsole(string message)
{
    Console.WriteLine($"Console: {message}");
}

void LogToUpper(string message)
{
    Console.WriteLine($"Upper: {message.ToUpper()}");
}

NotifyHandler handler = LogToConsole;
handler("First call");

handler += LogToUpper;
Console.WriteLine("After += LogToUpper:");
handler("Second call");

delegate void NotifyHandler(string message);
```

Run it:

```bash
dotnet run
```

Real output:

```text
Console: First call
After += LogToUpper:
Console: Second call
Upper: SECOND CALL
```

#### Execution Trace

1. `NotifyHandler handler = LogToConsole;` — assigns a real *method*
   (not a call to it — no parentheses) to `handler`. `LogToConsole`'s
   own signature (`void`, one `string` parameter) matches
   `NotifyHandler`'s declared shape exactly.
2. `handler("First call");` — calling `handler` like an ordinary
   method actually runs whatever method it currently holds —
   `LogToConsole` — printing `"Console: First call"`.
3. `handler += LogToUpper;` — adds a *second* method to the same
   `handler` variable, without removing the first.
4. `handler("Second call");` — now runs **both** attached methods, in
   the order they were added: `LogToConsole` first (`"Console: Second
   call"`), then `LogToUpper` (`"Upper: SECOND CALL"`).

*What this proves:* `NotifyHandler` is a **delegate** type — its values
are methods, not data — and a single delegate variable can hold more
than one method at once, called a **multicast delegate**, proven
directly by `handler`'s single call after `+=` running two separate
methods, in order, from one call site.

### Discard the Throwaway Example
Keep `DelegateLab` open — the `event` unit, next, reuses this project.

### Mechanical Walkthrough

- `delegate void NotifyHandler(string message);` — **first appearance
  of declaring your own `delegate` type.** Reads like a method signature
  with no body — because that's exactly what it is: a description of
  "any method shaped like this," not a specific one.
- `NotifyHandler handler = LogToConsole;` — assigning a method by name,
  with no parentheses after it — **first appearance of a method used as
  a value.** Writing `LogToConsole()` here would call it immediately and
  try to assign its `void` return value instead, which doesn't compile.
- Attaching a second method with the `+=` operator — **first appearance
  of that operator used on a delegate.** Distinct from every other `+=`
  this project has used (numeric addition) — here it means "also call
  this," not "add these two numbers."

### CS Lens

This is the real mechanism behind `Predicate<T>` (Lesson 19) and
`Action<object?>` (Lesson 23's `RelayCommand`) — both are `delegate`
types .NET already wrote, with generic type parameters (Lesson 6a)
filling in the parameter and return types instead of a hand-written
signature like `NotifyHandler`'s. `Predicate<InventoryItem>` and
`NotifyHandler` are the same underlying idea — "a method, held as a
value" — one generic and reusable, one specific to exactly one
signature.

### SE Lens

Why did .NET write generic delegate types (`Action<T>`, `Func<T,
TResult>`, `Predicate<T>`) instead of every codebase writing its own
`NotifyHandler`-style delegate for every situation? Because most custom
delegates end up being one of a small number of common shapes ("takes
one argument, returns nothing"; "takes one argument, returns `bool`")
— the built-in generic ones cover nearly every case without a new
named type. A hand-written `delegate` like `NotifyHandler` is still the
right choice specifically when the *name* itself documents something
real — `NotifyHandler` reads as "a thing that handles a notification,"
which `Action<string>` alone doesn't communicate.

### Connection

`handler`, so far, is a plain variable — nothing stops code anywhere
else from replacing it entirely with `=`, silently discarding every
method already attached. The next unit proves that's a real risk, and
what `event` does about it.

---

## Concept Unit: `event` — Protecting a Delegate From the Outside

### The Problem

A delegate field on a class, if left as an ordinary public field, can
be reassigned with a plain `=` by *any* outside code — not just added
to with `+=`. Worth proving directly what that actually costs before
trusting a plain delegate field the way `PropertyChanged`
(Lesson 7) is trusted.

### Introduce the Concept in Isolation

In the same `DelegateLab` project, replace `Program.cs`:

```csharp
Publisher publisher = new Publisher();
publisher.Notify += message => Console.WriteLine($"Subscriber A: {message}");
publisher.Notify += message => Console.WriteLine($"Subscriber B: {message}");

Console.WriteLine("Before overwrite:");
publisher.Notify?.Invoke("hello");

publisher.Notify = message => Console.WriteLine($"Replaced: {message}");

Console.WriteLine("After overwrite from outside:");
publisher.Notify?.Invoke("hello");

delegate void NotifyHandler(string message);

class Publisher
{
    public NotifyHandler? Notify;
}
```

Run it:

```bash
dotnet run
```

Real output:

```text
Before overwrite:
Subscriber A: hello
Subscriber B: hello
After overwrite from outside:
Replaced: hello
```

*What this proves:* `publisher.Notify = message => ...;`, run from
*outside* `Publisher` entirely, silently discarded both real
subscribers (`Subscriber A`, `Subscriber B`) and replaced them with one
unrelated handler — a real, silent bug: nothing warned either
subscriber their callback had been removed.

Now the fix — mark `Notify` with `event`, and move invocation inside
the class itself:

```csharp
Publisher publisher = new Publisher();
publisher.Notify += message => Console.WriteLine($"Subscriber A: {message}");
publisher.Notify += message => Console.WriteLine($"Subscriber B: {message}");

Console.WriteLine("Raising from inside Publisher:");
publisher.RaiseNotify("hello");

delegate void NotifyHandler(string message);

class Publisher
{
    public event NotifyHandler? Notify;

    public void RaiseNotify(string message)
    {
        Notify?.Invoke(message);
    }
}
```

Real output:

```text
Raising from inside Publisher:
Subscriber A: hello
Subscriber B: hello
```

Now try the same external overwrite again, plus a direct external
invocation attempt:

```csharp
publisher.Notify = message => Console.WriteLine($"Replaced: {message}");
publisher.Notify?.Invoke("hello");
```

Real, captured failure (both lines):

```text
error CS0070: The event 'Publisher.Notify' can only appear on the left hand side of += or -= (except when used from within the type 'Publisher')
```

#### Execution Trace

1. `public event NotifyHandler? Notify;` — the only source change from
   the broken version: one keyword, `event`, added.
2. `publisher.Notify += ...` (twice, from outside `Publisher`) — still
   compiles; `event` never restricts `+=`/`-=` from outside.
3. `publisher.RaiseNotify("hello");` — a real method *on* `Publisher`
   itself, calling `Notify?.Invoke(message)` from the inside — both
   subscribers fire, exactly as before.
4. `publisher.Notify = ...;`, attempted from outside again — now fails
   to compile with a real `CS0070` error: `event` blocks plain
   reassignment from outside the declaring class entirely.
5. `publisher.Notify?.Invoke("hello");`, attempted from outside — also
   fails with the identical `CS0070` error: `event` blocks *direct
   invocation* from outside too, not just reassignment — the reason
   `RaiseNotify`, a real method living inside `Publisher`, had to exist
   at all.

*What this proves:* `event` doesn't just prevent the silent-overwrite
bug the first version had — it goes further, blocking *any* external
code from invoking the delegate directly, not only from replacing it.
Outside code is restricted to exactly two operations: `+=` and `-=`.
Only code inside the declaring class can actually raise the event.

### Discard the Throwaway Example
Delete the `DelegateLab` folder. `delegate`/`event` are not discarded —
`PropertyChangedEventHandler`/`PropertyChanged` (Lesson 7) use exactly
this next.

### Mechanical Walkthrough

- `public NotifyHandler? Notify;`, no `event` — **first appearance of
  the exact vulnerability `event` exists to close**, proven directly by
  the real, silent subscriber loss above.
- `public event NotifyHandler? Notify;` — **first appearance of
  `event`.** One keyword, changing what code outside `Publisher` is
  permitted to do with `Notify` — from "anything a plain field allows"
  to "only `+=`/`-=`."
- `Notify?.Invoke(message);`, inside the class's own method that raises
  it — **first appearance of `?.Invoke`.** The `?.` matters: if `Notify`
  has no subscribers at all, it's `null`, and calling `Invoke` on `null`
  directly would throw — `?.` skips the call entirely in that case, doing
  nothing instead of
  crashing.

### CS Lens

This is exactly the shape `PropertyChangedEventHandler? PropertyChanged`
(Lesson 7) already used: `event` on the field itself, and every actual
`PropertyChanged?.Invoke(...)` call living *inside* `InventoryItem`
(inside each property's own `set`), never anywhere else. Lesson 7 never
explained why external code couldn't just call
`someItem.PropertyChanged.Invoke(...)` directly to fake a change
notification — this lesson's own real `CS0070` error is that
explanation, made concrete.

### SE Lens

Why does this restriction matter for a real WPF binding system
specifically? Because `PropertyChanged`'s entire job is being a
*trustworthy* signal — WPF's binding engine reacts to it by re-reading
whatever property changed. If any external code could invoke
`PropertyChanged` directly, or silently replace the whole subscriber
list with `=`, a single careless line anywhere in a large codebase
could either fake change notifications for properties that never
actually changed, or silently disconnect WPF's own binding
subscriptions — exactly the kind of hard-to-trace bug `event` makes
impossible by construction, not by convention.

### Connection

Every `PropertyChanged?.Invoke(...)` call this project has written
since Lesson 7 is doing exactly what `RaiseNotify` did here — raising
an `event` from inside its own declaring class, the only place `event`
allows it.

---

## Closing

### Connect the Pieces

`NotifyHandler` (first unit) proved `delegate` types hold methods as
values, and that `+=` makes them multicast — a single call reaching
every attached method, in order. The second unit's own real, contrasted
failure — a plain delegate field silently losing both subscribers to an
outside `=` — is exactly what `event` (one keyword) prevents, proven by
the real `CS0070` errors both an outside reassignment and an outside
direct `.Invoke()` produce once `Notify` is marked `event`. This is the
real mechanism `PropertyChangedEventHandler? PropertyChanged` (Lesson
7) already relies on, now understood rather than just used correctly by
accident.

### What Breaks Without This

Already demonstrated directly, on purpose, in this lesson's second
unit: a plain (non-`event`) delegate field, reassigned from outside with
a single `=`, silently drops every previously-attached subscriber with
no warning, no error, and no trace — a real, silent bug, not a
hypothetical one. No further break-it exercise needed this lesson.

### Exercises

- In a fresh `DelegateLab`, add a third subscriber to `Publisher.Notify`
  via a second `+=`, and confirm, with real output, that
  `RaiseNotify` now calls all three, in the order they were attached.
- Reread `PropertyChangedEventHandler`'s real declaration (Lesson 7) and
  identify, in your own words, which part is the delegate type and
  which part is the `event`-marked field using it — they are two
  separate things, working together.
- Predict, in your own words, what happens if `Notify?.Invoke(message)`
  inside `RaiseNotify` is called when *no* code anywhere has ever done
  `publisher.Notify += ...` — then test it for real (remove both `+=`
  lines) and confirm whether it crashes or does nothing.

### Definition of Done

- [ ] You ran the multicast delegate lab yourself and got the real,
      two-line output after `+=` — not just read it here.
- [ ] You reproduced the real silent-overwrite bug (plain delegate
      field) and then the real `CS0070` errors (both reassignment and
      direct invocation) after adding `event` — yourself, not just read
      them here.
- [ ] You can explain, in your own words and without re-reading this
      lesson, why `RaiseNotify` needs to exist as a method inside
      `Publisher`, rather than callers invoking `Notify` directly.
