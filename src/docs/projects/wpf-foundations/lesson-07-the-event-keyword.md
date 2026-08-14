# Lesson 07: The `event` Keyword

**What you will build:** a real `Doorbell` class with a plain delegate
field, proving a genuine problem with it — then the same class fixed
with `event`, proving the fix directly. This is the mechanism behind
every WPF `Click`, `PropertyChanged`, and `CollectionChanged` this
series' WPF arc will meet.

**What you need to know first:** [Lesson 06](lesson-06-delegates-func-action.md)
(`Action<>`, and delegate-typed members).

**Terms introduced in this lesson:**
- **`event`** — a keyword narrowing a delegate field so outside code can
  only `+=`/`-=` (subscribe/unsubscribe), never overwrite it entirely.
- **Subscribing** — using `+=` to add a method or lambda to an event's
  list of handlers, without removing whatever was already registered.
- **Null-conditional operator (`?.`)** — `expr?.Member` evaluates
  `Member` only if `expr` isn't `null`, skipping it entirely otherwise.

**Objects and methods used:** none beyond `System.Console.WriteLine`
and `Action`, already covered.

---

## Concept Unit: The Real Problem With a Plain Delegate Field

### The Problem

A plain delegate-typed field can hold behavior (Lesson 06) — but as an
ordinary field, it's just as reassignable as any other field, with a
plain `=`. For "notify me when X happens," where more than one
independent piece of code might want to react to the same event, plain
reassignment is a genuine hazard: does assigning a second handler
silently discard the first one?

### Introduce the Concept in Isolation

```csharp
using System;

public class Doorbell
{
    public Action? Pressed;

    public void Press()
    {
        Console.WriteLine("Button physically pressed.");
        Pressed?.Invoke();
    }
}

public class Program
{
    public static void Main()
    {
        var doorbell = new Doorbell();
        doorbell.Pressed = () => Console.WriteLine("Chime rings!");
        doorbell.Pressed = () => Console.WriteLine("Light flashes!");

        doorbell.Press();
    }
}
```

Output:
```
Button physically pressed.
Light flashes!
```

**"Chime rings!" never prints at all.** The second `doorbell.Pressed =
...` assignment didn't add a second reaction — it used plain `=`, which
*replaced* whatever `Pressed` held before, silently discarding the first
lambda entirely. This is a real, provable bug: nothing in the language
stops outside code from wiping out every previously registered handler
with one careless `=` instead of `+=`.

### Discard

This buggy `Doorbell` is deleted; the fixed version, in the next unit,
keeps the same shape with one keyword added.

### Mechanical Walkthrough

- `public Action? Pressed;` — **(b) hard concept reappearing**,
  `Action` from Lesson 06 as a field type instead of a local variable;
  **(b) hard concept reappearing**, the `?` nullable marker from Lesson
  03, here meaning "this field may legitimately be null before anyone
  assigns it."
- `Pressed?.Invoke();` — **(a) first appearance** of the
  **null-conditional operator**, `?.`: calls `.Invoke()` (a delegate's
  own real method — every delegate, including `Action`, has an
  `Invoke()` method that runs it; calling `Pressed()` directly, as
  earlier lessons did, is actually shorthand for `Pressed.Invoke()`)
  only if `Pressed` is not `null`, skipping the call entirely otherwise
  — the safe way to call a delegate field that might never have been
  assigned, avoiding a `NullReferenceException` (Lesson 03) on a
  doorbell nobody's listening to yet.
- `doorbell.Pressed = () => ...;` (twice) — **(c) already basic** as
  plain field assignment syntax; the *bug* it causes here — silently
  discarding the first handler — is this unit's entire point.
- `doorbell.Press();` — **(c) already basic**, an ordinary method call.

## Concept Unit: `event` — Restricting Outside Code to `+=`/`-=`

### The Problem

The bug just proven needs a real fix, not caller discipline ("just
remember to always use `+=`, never `=`") — caller discipline doesn't
survive a large team or a rushed deadline. Something in the language
itself needs to make the dangerous operation impossible to write by
accident.

### Introduce the Concept in Isolation

```csharp
using System;

public class Doorbell
{
    public event Action? Pressed;

    public void Press()
    {
        Console.WriteLine("Button physically pressed.");
        Pressed?.Invoke();
    }
}

public class Program
{
    public static void Main()
    {
        var doorbell = new Doorbell();
        doorbell.Pressed += () => Console.WriteLine("Chime rings!");
        doorbell.Pressed += () => Console.WriteLine("Light flashes!");

        doorbell.Press();
    }
}
```

Output:
```
Button physically pressed.
Chime rings!
Light flashes!
```

One keyword added — `event`, right before `Action? Pressed;` — and the
call site changed from `=` to `+=`, and now **both** handlers run, in
the order they were added. This is called **subscribing**: `+=` adds a
handler to `Pressed`'s list without removing whatever was already
there, which is exactly the guarantee plain `=` couldn't provide.

### Discard

This fixed `Doorbell` is deleted; the exercises below build on the same
shape without needing it preserved as project code.

### Mechanical Walkthrough

- `public event Action? Pressed;` — **(a) first appearance** of `event`
  itself: placed in front of an already-declared delegate-typed field
  (`Action? Pressed`, both pieces already known from the previous unit),
  it restricts what code *outside this class* is allowed to do with
  `Pressed` down to exactly `+=` and `-=` — a plain `doorbell.Pressed =
  ...;` from outside `Doorbell` is now a **compile error**, not merely
  discouraged, proven directly below.
- `doorbell.Pressed += () => Console.WriteLine("Chime rings!");` — **(a)
  first appearance** of subscribing via `+=`: adds this lambda to
  `Pressed`'s internal list of handlers.
- `doorbell.Pressed += () => Console.WriteLine("Light flashes!");` —
  **(b) hard concept reappearing**, the identical `+=` mechanism, proving
  it genuinely *adds* rather than replaces — both handlers fire, in the
  order subscribed, which the real output above confirms directly.
- `Pressed?.Invoke();` — **(c) already basic**, unchanged from the
  previous unit; now correctly invokes *every* subscribed handler in
  order, not just whichever one happened to be assigned last.

### CS Lens

**(b) hard concept, real restatement.** This is the **Observer pattern**:
`Doorbell` (the subject) has no idea what its subscribers actually do —
it only knows to call whatever's currently registered when the real
event (a physical press) happens. Subscribers react; the subject never
reaches out and asks them anything, and any number of independent
subscribers can react to the same event without knowing about each
other.

Also recognized in: every GUI framework's event handlers (a button's
click listener runs only when the framework detects a tap, never when
application code calls it directly — the same shape WPF's own `Click`
event, met in this series' WPF arc, will turn out to be exactly), JUnit
running `@Test`-annotated methods, web frameworks invoking a
route-handler function only once a matching request arrives, and any
publish/subscribe messaging system at a larger architectural scale.

### SE Lens

The real alternative to `event` — a plain public delegate field, as the
first unit used — genuinely works for the simplest case (exactly one
piece of code, ever, cares about this notification) and breaks silently
the moment a second subscriber shows up, exactly as proven above, with
no compiler warning at the point of the mistake. `event`'s real cost:
slightly more restrictive API from *inside* the declaring class too —
even `Doorbell`'s own code, outside of direct field access, is limited
to `+=`/`-=` on `Pressed` from most contexts (plain read/`Invoke()` is
still fine, which is why `Press()` above works unchanged) — a small
tradeoff against a real, provable class of bug it eliminates entirely.

## Connect the pieces

One trace: a plain delegate field (first unit) allows outside code to
overwrite previously registered behavior with an innocent-looking `=`,
proven by a silently dropped handler. Adding `event` (second unit)
narrows outside access to `+=`/`-=` only, so the identical bug is no
longer expressible — proven by both handlers now firing, in registration
order, from the exact same class shape with one keyword added.

## What breaks without this

With `event` in place, attempt the same plain-assignment mistake the
first unit committed, now from outside the class:

```csharp
doorbell.Pressed = () => Console.WriteLine("Should fail");
```

This does **not** compile:

```
error CS0079: The event 'Doorbell.Pressed' can only appear on the left
hand side of += or -=
```

Real, provable proof that `event` didn't just *discourage* the dangerous
operation — it made the language itself reject it outright, at compile
time, before the program ever runs. This is the actual fix, not a
convention; the bug from this lesson's first unit is now a compile error
instead of a silent runtime surprise.

## Exercises

1. Add `doorbell.Pressed -= <the first lambda>;` — note this requires
   storing the lambda in a named variable first (an anonymous inline
   lambda can't be unsubscribed later, since there'd be no way to refer
   back to that exact same instance) — and confirm only the *second*
   handler fires after unsubscribing the first.
2. Add a second, independent `event Action<int>? Rung;` to `Doorbell`,
   firing with a real integer (a ring count) from inside `Press()`.
   Subscribe a lambda that prints the count, and confirm real output
   across a few calls to `Press()`.

## Definition of Done

- [ ] You compiled and ran the plain-delegate-field version and observed
      the real bug: only one handler fired, the other silently dropped.
- [ ] You compiled and ran the `event`-protected version and observed
      both handlers firing, in order.
- [ ] You caused the real `CS0079` compile error and understand why
      `event` turns the earlier bug into something the compiler now
      rejects outright.
- [ ] You completed both exercises and observed the described behavior
      yourself.

## Next

[Lesson 08 — LINQ: `Where`, `Select`, and Deferred
Execution](lesson-08-linq.md) closes this series' C# arc, showing that
LINQ's own query methods are themselves just ordinary methods accepting
lambdas as `Func<>` parameters — the exact mechanism from Lesson 06,
recognized in a form you've likely already half-understood by pattern
without the full explanation.
