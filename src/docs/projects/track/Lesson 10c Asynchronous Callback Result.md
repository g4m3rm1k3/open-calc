# Lesson 10c: Asynchronous Callback Result

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 2b's callback.

**Terms introduced in this lesson:**

- **Asynchronous callback result** — a value that can't be returned
  synchronously — because producing it requires waiting on something
  external, like user interaction — is instead delivered later by
  invoking a registered callback.

---

## Concept Unit: Asynchronous Callback Result

### The Problem

An ordinary method call `return`s its result immediately, the moment the
method finishes. Some results genuinely cannot work this way — waiting on
a user to make a choice, for instance, might take anywhere from a second
to several minutes, or might never resolve at all if the user navigates
away. A method cannot `return` a value that doesn't exist yet.

### Introduce the Concept in Isolation

```
mkdir lesson-10c
cd lesson-10c
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
callback (Lesson 2b) ahead of time, and that callback is invoked once
the value actually becomes available — in this simplified example,
immediately, but the same shape works identically if the real value took
several minutes to arrive.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface ResultCallback { void onResult(String value); }` — **(b)
   reappearing** functional interface shape from Lesson 0s.
2. `void fetchValueLater(ResultCallback callback) { ... callback
   .onResult("42"); }` — **(a) first appearance** of this specific
   shape: a method with no return value of its own, which instead calls
   the callback it was handed, at whatever point the real result becomes
   available.
3. `lookup.fetchValueLater(value -> { ... });` — **(b) reappearing**
   lambda expression from Lesson 0t, supplying the callback's body
   directly.
4. The final `System.out.println` in `main`, printed *last* in this
   simplified example (but would run immediately, before any real,
   slower result arrives, in a genuinely asynchronous version) — proof
   that registering a callback and receiving its eventual result are two
   separate moments, not one.

### CS Lens

This is Lesson 2b's callback concept, applied specifically to a *result*
rather than a repeatable event: the callback here is expected to fire
once, carrying the one value a synchronous `return` couldn't produce in
time. `main`'s own flow of control doesn't pause waiting for the result —
it registers interest and moves on, exactly as Lesson 2c's own
event-driven programming material already established.

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

## Connect the Pieces

Lessons 10a and 10b showed Android's own real version of this shape —
`setResult`/`finish()` plus `registerForActivityResult`. This lesson
names the general idea behind it in plain Java. The next lesson shows
where a value delivered this way actually has to live to survive past
the method call that requested it.

## What Breaks Without This

A method that must wait on an unpredictable external event (a user's
choice, a network response) but only offers a synchronous `return`
either blocks the entire program while waiting, or has no way to
produce a result at all until that event actually happens.

## Exercises

1. Change `fetchValueLater` to call `callback.onResult` with a
   different value, and confirm the printed output changes to match.
2. Explain, in your own words, why `fetchValueLater` is declared `void`
   rather than returning a `String` directly.
3. Explain, in your own words, why the final `println` in `main` proves
   registering a callback and receiving its result are two separate
   moments.

## Definition of Done

- [ ] You ran the asynchronous-callback example and saw the real,
      ordered output.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      `fetchValueLater` has no `return` statement producing a `String`.
