# Lesson 27: Async Results, Field Lifetime, and Incremental Updates

**What you will build:** Three disposable labs, same pattern as earlier
Java-only lessons, grouped together because each is a small, real idea
Android's own asynchronous, long-lived components need.

**What you need to know first:** Lesson 10's `callback`, Lesson 02's
`method`, Lesson 01's `object`.

**Terms introduced in this lesson:**

- **Asynchronous callback result** — a value that can't be returned
  synchronously — because producing it requires waiting on something
  external, like user interaction — is instead delivered later by
  invoking a registered callback.
- **Field lifetime vs. local variable lifetime** — a local variable's
  lifetime ends when its enclosing method call returns; an instance
  field's lifetime lasts as long as its object does.
- **Incremental update notification** — communicating precisely what
  changed (e.g. one inserted row) to an observer, rather than telling it
  to assume everything changed and recompute from scratch.

---

## Concept Unit: Asynchronous Callback Result

### The Problem

An ordinary method call, `return`s its result immediately, the moment the
method finishes. Some results genuinely cannot work this way — waiting on
a user to make a choice, for instance, might take anywhere from a second
to several minutes, or might never resolve at all if the user navigates
away. A method cannot `return` a value that doesn't exist yet.

### Introduce the Concept in Isolation

```
mkdir lesson-27
cd lesson-27
```

Create `Main.java`:

```java
interface ResultCallback {
    void onResult(String value);
}

class SlowLookup {
    void fetchValueLater(ResultCallback callback) {
        System.out.println("Starting lookup...");
        callback.onResult("42");
    }
}

public class Main {
    public static void main(String[] args) {
        SlowLookup lookup = new SlowLookup();

        lookup.fetchValueLater(value -> {
            System.out.println("Got the result: " + value);
        });

        System.out.println("This line runs immediately.");
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Starting lookup...
Got the result: 42
This line runs immediately.
```

`fetchValueLater` has no `return` statement producing a `String` at all
— it's `void`. This is an `asynchronous callback result` — **first
appearance**: a value that can't be returned synchronously — because
producing it requires waiting on something external, like user
interaction — is instead delivered later by invoking a registered
callback. `main` never receives `"42"` as a return value; it registers a
callback (Lesson 10) ahead of time, and that callback is invoked once
the value actually becomes available — in this simplified example,
immediately, but the same shape works identically if the real value took
several minutes to arrive.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface ResultCallback { void onResult(String value); }` — **(b)
   reappearing** functional interface shape from Lesson 06.
2. `void fetchValueLater(ResultCallback callback) { ... callback
   .onResult("42"); }` — **(a) first appearance** of this specific
   shape: a method with no return value of its own, which instead calls
   the callback it was handed, at whatever point the real result becomes
   available.
3. `lookup.fetchValueLater(value -> { ... });` — **(b) reappearing**
   lambda expression from Lesson 06, supplying the callback's body
   directly.
4. The final `System.out.println` in `main`, printed *last* in this
   simplified example (but would run immediately, before any real,
   slower result arrives, in a genuinely asynchronous version) — proof
   that registering a callback and receiving its eventual result are two
   separate moments, not one.

### CS Lens

This is Lesson 10's callback concept, applied specifically to a *result*
rather than a repeatable event: the callback here is expected to fire
once, carrying the one value a synchronous `return` couldn't produce in
time. `main`'s own flow of control doesn't pause waiting for the result —
it registers interest and moves on, exactly as Lesson 10's event-driven
programming already established.

Also recognized in: Promises and `async`/`await` in JavaScript (a more
structured syntax for this exact same underlying shape), `Future`/
`CompletableFuture` in Java's own standard library, any UI framework
delivering a user's eventual choice back through a registered callback
rather than a blocking, synchronous call.

### SE Lens

The alternative — blocking `main`'s own execution until the real value
arrives — was not chosen for results that depend on unpredictable
external events (a user's choice, a network response) because blocking
would freeze everything else the program might otherwise be doing while
waiting, for an unpredictable, possibly very long time. A registered
callback lets the rest of the program continue running normally, reacting
to the result only once it's genuinely ready.

---

## Concept Unit: Field Lifetime vs. Local Variable Lifetime

### The Problem

A callback registered in one method sometimes needs to run *after* that
method has already finished and returned — the exact situation the
previous unit's own asynchronous result represents in a real, longer-
running scenario. A value only ever stored in a local variable disappears
the moment its enclosing method returns; something that needs to survive
until a later callback runs needs a different kind of storage entirely.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
interface ResultCallback {
    void onResult(String value);
}

class SlowLookup {
    void fetchValueLater(ResultCallback callback) {
        callback.onResult("42");
    }
}

class Screen {
    private String lastResult;

    void loadData() {
        SlowLookup lookup = new SlowLookup();
        lookup.fetchValueLater(value -> {
            lastResult = value;
            System.out.println("Stored in field: " + lastResult);
        });
    }

    void showStoredResult() {
        System.out.println("Field still holds: " + lastResult);
    }
}

public class Main {
    public static void main(String[] args) {
        Screen screen = new Screen();
        screen.loadData();
        screen.showStoredResult();
    }
}
```

Compile and run it. Here is the real output:

```
Stored in field: 42
Field still holds: 42
```

`lastResult` is stored as a field, not a local variable inside
`loadData()` — it's still readable from `showStoredResult()`, called
separately, after `loadData()` has already fully returned. This is
`field lifetime vs. local variable lifetime` — **first appearance**: a
local variable's lifetime ends when its enclosing method call returns; an
instance field's lifetime lasts as long as its object does.
`SlowLookup lookup`, a local variable inside `loadData()`, would be gone
the moment `loadData()` returned — but `lastResult`, a field on `Screen`
itself, survives exactly as long as the `screen` object does.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `private String lastResult;` — **(b) reappearing** field declaration
   from Lesson 01, here specifically chosen over a local variable because
   its value must outlive `loadData()`'s own single call.
2. `SlowLookup lookup = new SlowLookup();`, inside `loadData()` — a local
   variable, whose lifetime ends the moment `loadData()` returns —
   nothing outside `loadData()` could ever reference `lookup` again,
   even if it wanted to.
3. `lastResult = value;`, inside the callback — writes to the field, not
   a local variable — this is what makes the value survive past
   `loadData()`'s own return.
4. `screen.showStoredResult();`, called separately from `main` — reads
   `lastResult` successfully, proof the field's value survived the
   method call that originally set it.

### CS Lens

This distinction is exactly why code that needs to survive until a later
callback runs must become a field, not stay a local variable — a local
variable's storage is reclaimed the instant its enclosing method returns
(the same call-stack mechanism behind Lesson 22's own stack data
structure), while a field's storage persists for as long as its object
does, entirely independent of which method happens to be running at any
given moment.

Also recognized in: closures in JavaScript and Python (which capture
variables differently — often keeping a local variable alive beyond its
originating call specifically because it's referenced by a still-alive
callback — a genuinely different mechanism from Java's own field-based
approach, worth noting as a real contrast), any language's own local
variables versus instance state distinction generally.

### SE Lens

The alternative — trying to keep using a local variable across the
async boundary — was not chosen because it's not just inconvenient, it's
structurally impossible: `lookup`, from `loadData()`, is gone by the time
any later callback could reference it. Promoting the value that must
survive (here, `lastResult`) to a field is the only correct fix, not
merely a stylistic preference.

---

## Concept Unit: Incremental Update Notification

### The Problem

Reporting "something changed" to an interested observer, with no further
detail, forces that observer to assume everything might have changed and
recompute or redraw from scratch — wasteful when, in reality, only one
small piece actually changed.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
interface ListObserver {
    void onItemInserted(int position, String value);
}

class ObservableList {
    private java.util.List<String> items = new java.util.ArrayList<>();
    private ListObserver observer;

    void setObserver(ListObserver observer) {
        this.observer = observer;
    }

    void add(String value) {
        items.add(value);
        observer.onItemInserted(items.size() - 1, value);
    }
}

public class Main {
    public static void main(String[] args) {
        ObservableList list = new ObservableList();
        list.setObserver((position, value) -> {
            System.out.println("Only position " + position + " changed: " + value);
        });

        list.add("first");
        list.add("second");
    }
}
```

Compile and run it. Here is the real output:

```
Only position 0 changed: first
Only position 1 changed: second
```

`onItemInserted(int position, String value)` tells the observer
*precisely* what changed — one specific position, one specific value —
rather than a bare "the list changed" with no detail. This is
`incremental update notification` — **first appearance**: communicating
precisely what changed (e.g. one inserted row) to an observer, rather
than telling it to assume everything changed and recompute from scratch.
A real UI observing this list could redraw exactly the one new row,
rather than redrawing the entire list on every single addition.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface ListObserver { void onItemInserted(int position, String
   value); }` — **(b) reappearing** observer-style callback interface
   from Lesson 10, carrying specific change data as parameters rather
   than firing with no detail at all.
2. `items.add(value); observer.onItemInserted(items.size() - 1,
   value);` — **(a) first appearance** of this exact precision: the
   notification fires with the *exact* position the new item landed at
   (`items.size() - 1`, the last index after adding), not a generic
   "something was added somewhere" signal.
3. `list.setObserver((position, value) -> { ... });` — **(b) reappearing**
   lambda-as-callback shape, registered once, invoked with precise
   per-change data on every subsequent `add`.

### CS Lens

Incremental notification trades a small amount of extra information at
notification time (which position, which value) for a dramatically
cheaper response: an observer that knows precisely what changed can
update precisely that piece, rather than treating every change as "redo
everything," an idea a later lesson on efficient list updates returns to
and builds on directly.

Also recognized in: fine-grained reactive UI frameworks generally
(updating exactly the DOM node that changed rather than re-rendering an
entire page), database change-data-capture systems (reporting exactly
which row changed, not "the table changed"), version control diffs
(reporting exactly which lines changed, not "the file changed").

### SE Lens

The alternative — a bare `onListChanged()` callback with no detail at
all — was not chosen because it forces every observer to assume the
worst and recompute or redraw everything on every single change, even
when only one small piece actually changed. The cost of incremental
notification is real: the notifying code must track and report precisely
what changed, slightly more bookkeeping than firing one generic signal —
a cost repaid many times over by every observer's own cheaper response.

---

## Connect the Pieces

`fetchValueLater`'s callback delivers a value that couldn't be returned
synchronously — the general async-result shape. `Screen.lastResult`,
a field rather than a local variable, is what lets that eventually-
delivered value survive past the method call that originally requested
it, since a local variable's lifetime would have already ended.
`ObservableList.onItemInserted` shows the same registered-callback
mechanism carrying precise, incremental information, rather than a bare
signal — three small, real ideas, all serving the same larger need:
components that react correctly to events they can't predict the timing
or exact content of in advance.

## What Breaks Without This

Storing an async result in a local variable instead of a field:

```java
void loadData() {
    String result = null;
    SlowLookup lookup = new SlowLookup();
    lookup.fetchValueLater(value -> {
        result = value;
    });
    // `result` is unreachable from anywhere outside this method already
}
```

compiles (with a real requirement that `result` be effectively unmodified
outside the lambda in older Java versions, a detail this lesson doesn't
need to resolve further), but `result`'s value is unreachable the moment
`loadData()` returns — there is no way for any other method to ever read
it, because it was never promoted to a field. This is the concrete proof
this lesson's second unit exists to prevent: an async result stored in
the wrong kind of variable is effectively lost the instant its
originating method returns.

## Exercises

1. Add a second callback to this lesson's `ObservableList`,
   `onItemRemoved(int position)`, and a matching `remove` method,
   following the same incremental-notification shape as `add`.
2. Add a second field to `Screen`, `int loadCount`, incremented every
   time `loadData()` runs, and confirm it correctly persists across
   multiple calls the same way `lastResult` does.
3. Explain, in your own words, why `SlowLookup lookup` inside
   `loadData()` does not need to become a field, while `lastResult` does.

## Definition of Done

- [ ] You ran the asynchronous-callback example and saw the real,
      ordered output.
- [ ] You ran the field-lifetime example and confirmed the stored result
      survived past its originating method call.
- [ ] You ran the incremental-notification example and saw the real,
      precise per-position output.
- [ ] You can state, without looking back at this lesson, why
      `lastResult` had to be a field rather than a local variable.
