# Lesson 30: Read-Only Interface Exposure

**What you will build:** A disposable lab, same pattern as earlier
Java-only lessons. Today's case study: exposing a narrower, safer view of
an object than the full, mutable type it really is internally.

**What you need to know first:** Lesson 04's `encapsulation`.

**Terms introduced in this lesson:**

- **Read-only interface exposure** — exposing a narrower, read-only-
  facing type from a method while the backing field stays the more
  capable mutable type internally — a compile-time-enforced guarantee
  that external code can't mutate what it only needs to observe.

---

## Concept Unit: Read-Only Interface Exposure

### The Problem

Lesson 04's `private` blocks outside code from reaching a field directly
at all — sometimes too strong a restriction. A class often needs to let
outside code *read* some internal state freely, without letting that same
outside code *change* it — a getter returning the full, mutable object
directly would let outside code call mutating methods on it, defeating
the whole point of hiding those mutations behind the class's own
controlled methods.

### Introduce the Concept in Isolation

```
mkdir lesson-30
cd lesson-30
```

Create `Main.java`:

```java
interface ReadableCounter {
    int getValue();
}

class Counter implements ReadableCounter {
    private int value;

    public int getValue() {
        return value;
    }

    void increment() {
        value++;
    }
}

class CounterHolder {
    private Counter counter = new Counter();

    ReadableCounter getCounter() {
        return counter;
    }

    void incrementInternally() {
        counter.increment();
    }
}

public class Main {
    public static void main(String[] args) {
        CounterHolder holder = new CounterHolder();
        holder.incrementInternally();
        holder.incrementInternally();

        ReadableCounter counter = holder.getCounter();
        System.out.println("Current value: " + counter.getValue());
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
Current value: 2
```

`getCounter()` returns type `ReadableCounter`, not `Counter` — even
though the actual object underneath is a real, mutable `Counter`. This is
`read-only interface exposure` — **first appearance**: exposing a
narrower, read-only-facing type from a method while the backing field
stays the more capable mutable type internally — a compile-time-enforced
guarantee that external code can't mutate what it only needs to observe.
`Main` can read the current value through `counter.getValue()`, but has
no way to call `increment()` at all — that method doesn't exist on the
`ReadableCounter` type `Main`'s own variable is declared as, even though
the real object underneath does have it.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface ReadableCounter { int getValue(); }` — **(b) reappearing**
   interface shape from Lesson 06, deliberately declaring only the
   read-facing method, none of the mutating ones.
2. `class Counter implements ReadableCounter { ... void increment() {
   ... } }` — `Counter` fulfills `ReadableCounter`'s contract, and adds
   its own additional, mutating method, `increment()`, which
   `ReadableCounter` itself never promises.
3. `ReadableCounter getCounter() { return counter; }` — **(a) first
   appearance** of the exposure pattern itself: the method's declared
   return type is the narrower `ReadableCounter`, even though the actual
   returned object is a full `Counter`. Lesson 05's dynamic dispatch
   still applies underneath — the real object hasn't changed — but the
   declared type through which `Main` receives it restricts which
   methods are reachable at all.
4. `ReadableCounter counter = holder.getCounter();` — `Main`'s own
   variable is declared as `ReadableCounter`; `counter.increment()`
   would fail to compile here, since `increment()` isn't part of
   `ReadableCounter`'s contract, regardless of what the real object
   underneath actually supports.

### CS Lens

This is Lesson 05's runtime-type-narrowing concept working in reverse:
where that lesson widened a specific type back down after narrowing it
with a cast, this pattern deliberately keeps a reference *widened* to a
less capable type on purpose, specifically to withhold capabilities the
real object has but the exposing code doesn't want to grant. The object's
actual identity never changes — only what's reachable through a given
reference does.

Also recognized in: read-only collection views in many standard
libraries (exposing a mutable list as an unmodifiable view without
copying it), `const` references in C++ (a compiler-enforced read-only
view of an otherwise mutable object), any API surface that returns a
narrower interface specifically to prevent callers from depending on
capabilities the API author doesn't want to promise long-term.

### SE Lens

The alternative — `getCounter()` returning the full `Counter` type
directly — was not chosen because it would let any caller call
`increment()` on it, mutating internal state `CounterHolder` intended to
control exclusively through its own `incrementInternally()` method.
Returning the narrower `ReadableCounter` type instead makes that
restriction structural and compiler-enforced, the same tradeoff Lesson
04's `private` already established, applied here to a returned reference
rather than a field.

---

## Connect the Pieces

`Counter` implements `ReadableCounter` but adds its own additional
mutating method, `increment()`. `CounterHolder.getCounter()` deliberately
returns the narrower `ReadableCounter` type, so `Main` can read the
current value but has no compiler-permitted way to mutate it directly —
only `CounterHolder`'s own `incrementInternally()` can, keeping every
mutation funneled through one controlled path.

## What Breaks Without This

Attempting to call `increment()` on a `ReadableCounter`-typed variable
fails to compile with an error resembling:

```
error: cannot find symbol
        counter.increment();
               ^
  symbol:   method increment()
```

This is concrete proof the restriction is enforced at compile time, not
merely by convention — there is no way to call a method the declared
type doesn't expose, regardless of what the real object underneath
actually supports.

## Exercises

1. Add a second read-only method to `ReadableCounter`, `boolean
   isPositive()`, implement it on `Counter`, and confirm it's reachable
   through the `ReadableCounter`-typed reference in `main`.
2. Attempt `((Counter) counter).increment();` — an explicit cast back to
   the full `Counter` type — from `main`, and explain, in your own
   words, why this compiles and works even though `ReadableCounter`
   itself doesn't expose `increment()`. Connect this back to Lesson 05's
   own runtime-type-narrowing concept.
3. Explain, in your own words, why Exercise 2's cast being *possible*
   doesn't defeat the purpose of this pattern in ordinary use — consider
   what a caller would need to already suspect, and deliberately choose
   to do, for that cast to happen at all.

## Definition of Done

- [ ] You ran the `ReadableCounter`/`Counter` example and saw the real
      output.
- [ ] You attempted `counter.increment()` directly, saw the real "cannot
      find symbol" compiler error, and removed the attempt.
- [ ] You completed Exercise 2 and can explain why the cast still works.
- [ ] You can state, without looking back at this lesson, why
      `getCounter()` returns `ReadableCounter` instead of `Counter`.
