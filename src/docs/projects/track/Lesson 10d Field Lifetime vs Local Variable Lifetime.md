# Lesson 10d: Field Lifetime vs. Local Variable Lifetime

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 10c's asynchronous callback
result, Lesson 0c's `object`, Lesson 0e's `method`.

**Terms introduced in this lesson:**

- **Field lifetime vs. local variable lifetime** — a local variable's
  lifetime ends when its enclosing method call returns; an instance
  field's lifetime lasts as long as its object does.

---

## Concept Unit: Field Lifetime vs. Local Variable Lifetime

### The Problem

A callback registered in one method sometimes needs to run *after* that
method has already finished and returned — the exact situation Lesson
10c's own asynchronous result represents in a real, longer-running
scenario. A value only ever stored in a local variable disappears the
moment its enclosing method returns; something that needs to survive
until a later callback runs needs a different kind of storage entirely.

### Introduce the Concept in Isolation

```
mkdir lesson-10d
cd lesson-10d
```

Create `Main.java`:

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
   from Lesson 0i, here specifically chosen over a local variable because
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
(the same call-stack mechanism behind Lesson 5a's own stack data
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

## Connect the Pieces

Lesson 10c's `fetchValueLater` callback delivers a value that couldn't
be returned synchronously. `Screen.lastResult`, a field rather than a
local variable, is what lets that eventually-delivered value survive
past the method call that originally requested it, since a local
variable's lifetime would have already ended. The next lesson shows the
same registered-callback mechanism carrying precise, incremental
information instead of a bare signal.

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
this lesson exists to prevent: an async result stored in the wrong kind
of variable is effectively lost the instant its originating method
returns.

## Exercises

1. Add a second field to `Screen`, `int loadCount`, incremented every
   time `loadData()` runs, and confirm it correctly persists across
   multiple calls the same way `lastResult` does.
2. Explain, in your own words, why `SlowLookup lookup` inside
   `loadData()` does not need to become a field, while `lastResult` does.
3. Explain, in your own words, why a field's lifetime is tied to its
   object's lifetime rather than to any one method call.

## Definition of Done

- [ ] You ran the field-lifetime example and confirmed the stored result
      survived past its originating method call.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      `lastResult` had to be a field rather than a local variable.
