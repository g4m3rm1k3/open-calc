# Lesson 13b: Synchronous vs. Asynchronous Execution

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 13a's application context.

**Terms introduced in this lesson:**

- **Synchronous vs. asynchronous execution** — work that blocks the
  calling code until done (synchronous) versus work handed off to run
  independently, with results delivered back later through a separate
  channel (asynchronous).

---

## Concept Unit: Synchronous vs. Asynchronous Execution

### The Problem

Real database work genuinely takes measurable time — running it directly
on the same thread that's also responsible for updating the screen would
freeze the entire UI for that duration, since nothing else can happen on
that thread while it's blocked waiting.

### Introduce the Concept in Isolation

```
mkdir lesson-13b
cd lesson-13b
```

Create `Main.java`:

```java
public class Main {
    static void synchronousWork() {
        System.out.println("Synchronous: started.");
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
        }
        System.out.println("Synchronous: finished after blocking.");
    }

    public static void main(String[] args) {
        System.out.println("Before synchronous call.");
        synchronousWork();
        System.out.println("After synchronous call — this line waited.");
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output (with a real, roughly one-second pause before
the third line):

```
Before synchronous call.
Synchronous: started.
Synchronous: finished after blocking.
After synchronous call — this line waited.
```

`main` cannot proceed to its final `println` until `synchronousWork()`
fully returns — the whole thread blocks for the entire duration. This is
`synchronous vs. asynchronous execution` — **first appearance**: work
that blocks the calling code until done (synchronous) versus work
handed off to run independently, with results delivered back later
through a separate channel (asynchronous). `synchronousWork()`
demonstrates the synchronous half directly; Lesson 10c's own asynchronous
callback result already demonstrated the alternative — work handed off,
with a callback delivering the result later, never blocking the caller
at all.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Thread.sleep(1000);` — **(a) first appearance**: pauses the current
   thread for approximately 1000 milliseconds, simulating real,
   measurable work — genuinely basic to call, but chosen deliberately
   here to make the blocking duration real and observable.
2. `synchronousWork();`, called directly from `main` — the calling
   thread (here, the only thread this program has) is entirely blocked
   for the full duration of the sleep; nothing else in this program can
   run during that time.
3. `"After synchronous call — this line waited."` — printed only after
   the full delay, proof the call genuinely blocked rather than
   returning immediately and running the work elsewhere.

### CS Lens

Synchronous execution is the default, familiar shape every method call
in this curriculum has used so far: call, wait, get a result back
immediately. Asynchronous execution (Lesson 10c's own subject) hands the
work off and returns immediately, with the result delivered later,
through a callback — the exact distinction that matters the moment work
takes real, measurable time and blocking would be unacceptable, as with
database work on Android's own main thread.

Also recognized in: blocking versus non-blocking I/O across virtually
every language and platform, `async`/`await` in JavaScript and C#
(structured syntax for asynchronous execution), synchronous versus
asynchronous APIs in any networking library.

### SE Lens

The alternative — running database work synchronously, directly on
Android's main thread — was not chosen because it would freeze the
entire UI for however long the database operation takes, a real,
user-visible problem (and, past a certain duration, a real crash a later
lesson covers). Asynchronous execution is what lets database work happen
without blocking anything the user can see or interact with.

---

## Connect the Pieces

Lesson 13a's application context ensures a shared database instance
outlives any one screen. This lesson shows why that database's own work
should never run synchronously on a UI-responsible thread — the next
lessons build the actual database that work runs against.

## What Breaks Without This

Running database work synchronously, directly on Android's main thread,
freezes the entire UI for however long the operation takes — a real,
user-visible problem, not a theoretical one.

## Exercises

1. Add a second call to `synchronousWork()` in `main`, and predict, then
   confirm, the total real-world delay before the program finishes.
2. Explain, in your own words, why database work should run
   asynchronously specifically on Android, connecting your answer to
   this lesson's own synchronous example.
3. Explain, in your own words, the difference between "blocked" and
   "not yet started."

## Definition of Done

- [ ] You ran the synchronous-execution example and observed the real,
      blocking delay.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why running
      database work synchronously on the main thread is a real problem.
