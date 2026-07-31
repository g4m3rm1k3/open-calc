# Lesson 14d: `ExecutorService`

**What you will build:** No new code to compile — this reads real Java
standard library code directly.

**What you need to know first:** Lesson 14a's thread, Lesson 14c's
Object Pool Pattern.

**Terms introduced in this lesson:**

- **`ExecutorService`** — a standard-library abstraction managing a pool
  of reusable background threads, submitting tasks to run on them instead
  of creating and destroying a raw `Thread` per task.

---

## Concept Unit: `ExecutorService`

### The Problem

Real database work happens repeatedly — every launch's load, every item
added. Lesson 14a's own `new Thread(...)`, called fresh every single
time, would repeatedly pay real, measurable thread-construction cost for
work that recurs constantly, exactly the waste the Object Pool Pattern
(Lesson 14c) was introduced to avoid.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Java standard library code,
verified against the actual `java.util.concurrent` source:

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

ExecutorService executor = Executors.newFixedThreadPool(2);

executor.submit(() -> {
    List<Item> items = loadItemsFromDatabase();
    System.out.println("Loaded " + items.size() + " items on a background thread.");
});
```

This is `ExecutorService` — **first appearance**: a standard-library
abstraction managing a pool of reusable background threads, submitting
tasks to run on them instead of creating and destroying a raw `Thread`
per task. `Executors.newFixedThreadPool(2)` builds a real Object Pool
(Lesson 14c) of exactly two reusable threads, up front; every later
`executor.submit(...)` call hands a task to one of those *existing*
threads rather than constructing a new one.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified Java
standard library code.

### Mechanical Walkthrough

1. `Executors.newFixedThreadPool(2)` — **(a) first appearance**:
   constructs exactly two real threads up front — **(b) reappearing**
   the same Object Pool Pattern shape from Lesson 14c's own
   `ConnectionPool`.
2. `executor.submit(() -> { ... });` — **(a) first appearance**: hands
   the given task to one of the pool's existing threads to run — no new
   `Thread` is constructed for this call.
3. A second, later `executor.submit(...)` call (not shown) would reuse
   one of the same two pooled threads, exactly as `ConnectionPool
   .borrow()` reused an existing `ExpensiveConnection` in Lesson 14c.

### CS Lens

`ExecutorService` names directly why a real app doesn't spin up a brand-
new `Thread` for every single database operation: it's Lesson 14c's own
Object Pool Pattern, applied specifically to threads, provided ready-made
by the standard library rather than hand-written.

Also recognized in: thread pools across virtually every mainstream
language's own standard library or runtime (`ThreadPoolExecutor` in Java,
thread pools in .NET, worker pools in many web server frameworks).

### SE Lens

The alternative — `new Thread(...)` for every single background
operation, as Lesson 14a's own isolated example did — was not chosen for
real, recurring work because repeated thread construction/destruction
carries real, measurable OS-level cost; `ExecutorService` pays that cost
once, up front, and reuses the same threads for every later task.

---

## Connect the Pieces

`ExecutorService` applies Lesson 14c's Object Pool Pattern specifically to
threads. The next lesson names the rule that makes background work like
this necessary in the first place — which thread is allowed to touch the
screen.

## What Breaks Without This

Constructing a brand-new `Thread` for every single background operation,
instead of reusing a pool via `ExecutorService`, wastes real, measurable
OS-level cost repeatedly, for no benefit over reuse.

## Exercises

1. Explain, in your own words, why `Executors.newFixedThreadPool(2)`
   only ever constructs two threads, no matter how many tasks are later
   submitted to it.
2. Submit a second task to `executor` and explain, in your own words,
   which of the two pooled threads it's likely to run on.
3. Explain, in your own words, why `ExecutorService` is described as
   "Lesson 14c's Object Pool Pattern, applied to threads."

## Definition of Done

- [ ] You read the real `ExecutorService` example and can explain why it
      constructs its threads once, up front.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      `ExecutorService` avoids repeated thread-construction cost.
