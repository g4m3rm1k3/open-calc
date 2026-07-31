# Lesson 14c: Object Pool Pattern

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 14b's Event Loop.

**Terms introduced in this lesson:**

- **Object Pool Pattern** — expensive-to-create resources kept alive and
  reused across many requests for work, instead of created and destroyed
  per request.

---

## Concept Unit: Object Pool Pattern

### The Problem

A tool reusing a small set of already-created, expensive threads rather
than spinning up a brand-new `Thread` for every database operation would
save real, measurable cost — because constructing a real thread has real
cost, repeated needlessly if a fresh one is created and discarded for
every single task.

### Introduce the Concept in Isolation

```
mkdir lesson-14c
cd lesson-14c
```

Create `Main.java`:

```java
import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    static class ExpensiveConnection {
        ExpensiveConnection() {
            System.out.println("Constructing a new expensive connection...");
        }
    }

    static class ConnectionPool {
        private Deque<ExpensiveConnection> available = new ArrayDeque<>();

        ConnectionPool(int size) {
            for (int i = 0; i < size; i++) {
                available.push(new ExpensiveConnection());
            }
        }

        ExpensiveConnection borrow() {
            return available.pop();
        }

        void giveBack(ExpensiveConnection connection) {
            available.push(connection);
        }
    }

    public static void main(String[] args) {
        ConnectionPool pool = new ConnectionPool(2);

        ExpensiveConnection first = pool.borrow();
        System.out.println("Using first connection.");
        pool.giveBack(first);

        ExpensiveConnection second = pool.borrow();
        System.out.println("Using second connection — same one, reused: " + (first == second));
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
Constructing a new expensive connection...
Constructing a new expensive connection...
Using first connection.
Using second connection — same one, reused: true
```

#### Execution Trace

Trace of `ConnectionPool`'s own constructor loop, `for (int i = 0; i <
size; i++)`, with `size = 2`:

1. `i = 0` — `available.push(new ExpensiveConnection())` constructs the
   first real object; `"Constructing a new expensive connection..."`
   prints.
2. `i = 1` — constructs the second real object; the same message prints
   again.
3. `i = 2` — the loop condition `i < size` (`2 < 2`) fails, and the loop
   ends; exactly two objects exist, and `borrow()`/`giveBack()` are never
   called from inside this loop at all.

Only two `ExpensiveConnection` objects are ever constructed — both up
front, in `ConnectionPool`'s own constructor — no matter how many times
`borrow()` is later called. This is the `Object Pool Pattern` — **first
appearance**: expensive-to-create resources kept alive and reused across
many requests for work, instead of created and destroyed per request.
`first == second` (Lesson 4c's own identity comparison) prints `true` —
real proof `borrow()` handed back the exact same object `giveBack()` had
just returned to the pool, not a freshly constructed one.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `ConnectionPool(int size) { for (...) { available.push(new
   ExpensiveConnection()); } }` — **(a) first appearance**: constructs
   every pooled object once, up front — exactly `size` of them, never
   more.
2. `pool.borrow();` then `pool.giveBack(first);` — **(a) first
   appearance**: hands out one existing object, then returns it to the
   pool for reuse — no construction happens in either call.
3. `pool.borrow();` a second time — **(b) reappearing** call from this
   same unit; because `first` was just given back, this call returns that
   exact same object.
4. `first == second` — **(b) reappearing** identity comparison from
   Lesson 4c, printing `true`: real proof no new `ExpensiveConnection` was
   constructed for this second `borrow()` call.

### CS Lens

The Object Pool Pattern trades a small, fixed, up-front construction cost
for avoiding repeated construction/destruction cost later — worthwhile
specifically when constructing an object is genuinely expensive (a real
thread, a real database connection) and a small, reused set can serve
every caller without each one needing its own permanent instance.

Also recognized in: thread pools and database connection pools across
virtually every mainstream backend framework — the same underlying
pattern, applied to whichever expensive resource is being reused.

### SE Lens

The alternative — constructing a brand-new `ExpensiveConnection` (or a
brand-new `Thread`) every single time one is needed — was not chosen
because repeated construction of a genuinely expensive object wastes real
time and resources that a small, reused pool avoids entirely.

---

## Connect the Pieces

Lesson 14a's `Thread` and Lesson 14b's Event Loop are what every callback
in this course runs on. The Object Pool Pattern is why a separate thread
for slow work doesn't have to be freshly constructed every single time —
the next lesson shows the standard-library tool that applies this exact
pattern to threads specifically.

## What Breaks Without This

Constructing a brand-new `Thread` (or a brand-new database connection)
for every single slow operation, instead of reusing a small pool, wastes
real, measurable construction cost repeatedly, for no benefit over reuse.

## Exercises

1. Explain, in your own words, why `ConnectionPool`'s constructor builds
   every `ExpensiveConnection` up front, rather than lazily, the first
   time each one is actually borrowed.
2. Add a third `borrow()` call, without a matching `giveBack()` first,
   and predict what would happen if the pool were empty.
3. Explain, in your own words, why `first == second` — not
   `first.equals(second)` — is the correct check to prove reuse
   happened.

## Definition of Done

- [ ] You ran the `ConnectionPool` example and can explain what
      `first == second` proves.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why the
      Object Pool Pattern is worthwhile only for genuinely expensive
      objects.
