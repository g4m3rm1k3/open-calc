# Asking Fresh Instead of Trusting a Captured Value: getBindingAdapterPosition

**What problem this solves.** A callback registered on a recycled,
reusable object — like a `RecyclerView` row's click listener — is set
up once, at bind time, but fires later, at some unknown future moment.
By the time it fires, the same underlying object may have been reused,
through recycling, to represent a completely different logical item
than the one it represented when the callback was originally
registered. Any information about "which item this is" captured
directly into the callback at registration time — a plain local
variable read once and closed over — can silently go stale, describing
the item that existed back then, not the one the object actually
represents right now. The abstract fix: instead of capturing and
trusting a value at registration time, have the callback ask, at the
exact moment it actually fires, "what do you currently, actually
represent?" — querying live, current state fresh each time, rather than
trusting a snapshot taken earlier that might no longer be true.

**Classic pattern family.** Not a clean Gang-of-Four fit on its own —
best understood as the general stale-reference problem, solved the same
way any stale-reference problem is generally solved: query the current
source of truth at the moment of use, rather than trust a value
captured earlier. The same underlying idea that motivates re-checking
permission status fresh each time, rather than remembering "granted,
once" — not any single classic creational, structural, or behavioral
pattern name.

**Where you'll meet it in Android.**
`RecyclerView.ViewHolder.getBindingAdapterPosition()` and the
`RecyclerView.NO_POSITION` constant.

**Terms used in this pattern.**

- **Closure capture** — a lambda or anonymous class referencing a
  variable from its enclosing scope, keeping that variable reachable
  for as long as the lambda itself exists, even after the method that
  originally declared it has returned. It's the actual mechanism that
  makes it possible — and easy — to naively capture a position value
  that was only ever true at one specific moment.

**Objects and methods used.**

- **`RecyclerView.ViewHolder.getBindingAdapterPosition()`**
  *What it is:* an instance method on `ViewHolder`, returning `int`.
  *Implementation:* `public final int getBindingAdapterPosition()`.
  *Its use:* queried fresh, at the exact moment it's called, asking
  `RecyclerView` what position this specific `ViewHolder` object is
  currently, actually bound to right now — never a value stored or
  cached anywhere ahead of time.
- **`RecyclerView.NO_POSITION`**
  *What it is:* a `public static final int` constant on `RecyclerView`.
  *Implementation:* `public static final int NO_POSITION = -1`.
  *Its use:* the specific value `getBindingAdapterPosition()` returns
  when this `ViewHolder` isn't currently, validly bound to any real
  position at all — such as mid-removal-animation — letting calling
  code detect and safely skip that case rather than acting on a
  nonsense index.

---

## The Shape

Three participants:

- **The `ViewHolder` object itself** — the thing being reused and
  recycled.
- **`RecyclerView`'s own internal bookkeeping** — tracking, live, which
  position each currently-existing `ViewHolder` actually represents
  right now, not exposed as a field, only queryable through this one
  method.
- **The click listener lambda** — registered once, at bind time, but
  firing later, at a genuinely unpredictable future moment.

The relationship: nothing about a `ViewHolder`'s own position is stored
as a plain field the listener could simply read directly and trust —
the only way to find out is to ask `RecyclerView`, through this one
method call, at the exact moment the answer is actually needed. The
lambda captures a reference to the holder object itself, never a
captured position value — which is exactly what makes asking fresh, at
fire time, possible at all; capturing the object and asking it later is
different from capturing a value read from it earlier.

```
   onBindViewHolder runs for position 3
        |
        |  registers: v -> { int p = holder.getBindingAdapterPosition(); ... }
        |             (captures the HOLDER OBJECT, not a position value)
        v
   ... user scrolls; this exact View/ViewHolder is recycled
       for a completely different position, say 47 ...
        |
        v
   user finally taps
        |
        |  lambda fires NOW; calls holder.getBindingAdapterPosition()
        |  FRESH, at THIS moment
        v
   returns 47 (the REAL, current position) -- not the stale 3
   that would have been captured if a plain variable had been used
```

---

## Mechanical Walkthrough

```java
holder.itemView.setOnClickListener(v -> {
    int currentPosition = holder.getBindingAdapterPosition();
    if (currentPosition != RecyclerView.NO_POSITION) {
        Contact contact = contacts.get(currentPosition);
        openContactDetail(contact);
    }
});
```

- **`holder.itemView.setOnClickListener(v -> { ... })`** — registers a
  lambda; the lambda body closes over `holder` (the object), not any
  position value read from it right now.
- **`int currentPosition = holder.getBindingAdapterPosition();`** — the
  actual query, run for the first time only once the lambda fires,
  never at registration time — this is what guarantees the answer
  reflects whatever this object currently represents, however much time
  and recycling has happened since registration.
- **`if (currentPosition != RecyclerView.NO_POSITION)`** — the required
  guard; a `ViewHolder` can genuinely, briefly, have no valid position
  at all, and using an unchecked value directly as a list index would
  crash or silently misbehave.
- **`Contact contact = contacts.get(currentPosition);`** — only reached
  once the position is confirmed valid; reads from the real, current
  position, not whatever position happened to be true when this lambda
  was written.

---

## Collaboration — how it actually runs

1. `onBindViewHolder` runs for some position, and registers a click
   listener lambda on the row's `View` — the lambda's body references
   `holder` (the object itself), not any position value read out of it
   at this moment.
2. Time passes; the user scrolls, and `RecyclerView`'s own recycling
   machinery may reuse this exact same `View`/`ViewHolder` object for a
   different position entirely, calling `onBindViewHolder` again with
   new data — the previously registered lambda is still attached,
   unless it was explicitly replaced.
3. The user eventually taps this row. The lambda finally runs, and only
   now calls `holder.getBindingAdapterPosition()` — asking
   `RecyclerView`, fresh, at this exact moment, what position this
   specific object currently, actually represents.
4. `RecyclerView` answers with the real, current position — whatever it
   actually is right now, which may be completely different from
   whatever position was true back when this lambda was first
   registered.
5. The guard checks that answer against `RecyclerView.NO_POSITION`
   before using it, since a `ViewHolder` can genuinely, briefly, have no
   valid position at all during certain animations or removals.

---

## Why It's Shaped This Way

The design principle is **querying the live, current source of truth at
the exact moment an answer is actually needed**, rather than trusting a
value captured and stored earlier that has no way to update itself as
reality changes underneath it.

The alternative not chosen: capturing position as a plain local
variable directly inside the lambda at bind time. The real cost: this
value is fixed forever the moment it's captured, with no way to ever
learn that the underlying `View` has since been recycled for a
different item — the lambda would silently act on stale, wrong data,
with no exception, no warning, just a tap on a row quietly operating on
whatever item happened to sit at that position when the app was first
built.

The cost this pattern itself carries: an extra method call and an
explicit `NO_POSITION` guard on every single click handler, when the
far simpler-looking "just capture position directly" code would compile
and run without complaint — working correctly right up until an actual
user actually manages to scroll and tap in a way that exposes the
staleness, a bug that's genuinely easy to miss in casual testing.

---

## Recognizing It Elsewhere

Also recognized in: a bank balance display that re-queries the
account's real, current balance at the moment "Confirm Transfer" is
actually clicked, rather than trusting whatever number was on screen
when the page first loaded minutes earlier; a video game re-checking
whether a targeted enemy is still alive and still in range at the exact
moment an attack actually lands, rather than trusting that it was alive
when the attack was first initiated; an elevator button re-confirming a
floor is still a valid destination at the moment the doors are about to
close, rather than trusting the request as it stood when the button was
first pressed.

---

## Where This Actually Breaks

The most common real mistake is exactly the alternative described
above: capturing position — or any other bind-time value describing
"which item is this" — directly into the listener as a plain variable
instead of querying it fresh through `getBindingAdapterPosition()` at
fire time. Because recycling only actually reuses a given
`View`/`ViewHolder` object after enough scrolling has happened, this bug
frequently survives casual testing entirely: a developer tapping the
first few visible rows right after loading the screen never happens to
trigger any recycling at all, and the bug only appears for a real user
who scrolls first and then taps — an extremely common, ordinary usage
pattern the original testing simply didn't happen to reproduce.
