# Lesson 14a: Thread

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 2c's event-driven programming.

**Terms introduced in this lesson:**

- **Thread** — a genuinely separate, concurrently-running unit of
  execution within one process, with its own call stack, able to run at
  the same time as other threads.

---

## Concept Unit: Thread

### The Problem

Every callback this course has shown so far — every `onCreate` call,
every click listener invocation (Lesson 2c's own event-driven
programming) — has silently run one after another, never at the same
time as another callback. Real, measurably-slow work (like a database
query) run this same way would freeze everything else in the program for
its entire duration, with nothing able to run concurrently with it.

### Introduce the Concept in Isolation

```
mkdir lesson-14a
cd lesson-14a
```

Create `Main.java`:

```java
public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            for (int i = 1; i <= 3; i++) {
                System.out.println("Worker thread: " + i);
            }
        });

        worker.start();
        worker.join();
        System.out.println("Main thread: done waiting.");
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
Worker thread: 1
Worker thread: 2
Worker thread: 3
Main thread: done waiting.
```

#### Execution Trace

Trace of the worker thread's own `for` loop:

1. `i = 1` — `"Worker thread: 1"` printed, on the worker thread, while
   `main`'s own thread is blocked inside `worker.join()`.
2. `i = 2` — `"Worker thread: 2"` printed, same thread.
3. `i = 3` — `"Worker thread: 3"` printed, same thread; the loop condition
   `i <= 3` now fails and the loop ends.
4. Only once the worker thread's code fully finishes does
   `worker.join()` return, letting `main`'s own thread finally print
   `"Main thread: done waiting."`.

`worker` runs its own loop independently of `main`'s own call stack. This
is `thread` — **first appearance**: a genuinely separate,
concurrently-running unit of execution within one process, with its own
call stack, able to run at the same time as other threads. `worker
.start()` begins running the worker's code on a real, separate thread;
`worker.join()` makes `main`'s own thread wait until `worker` finishes
before printing its own final line.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `new Thread(() -> { ... })` — **(a) first appearance**: constructs a
   real thread, given the code it should run, but does not yet start
   running it.
2. `worker.start();` — **(a) first appearance**: begins running
   `worker`'s own code on a genuinely separate thread, concurrently with
   `main`'s own thread.
3. `worker.join();` — **(a) first appearance**: blocks `main`'s own
   thread until `worker` finishes — without this call, `"Main thread:
   done waiting."` could print before, during, or after the worker's own
   output, in no guaranteed order.

### CS Lens

A thread is the actual mechanism underneath every callback this course
has shown so far — every one of them has, until now, silently run on
the same single thread. Recognizing "this is now a genuinely separate
thread, not just a separate method call" is the transferable distinction
that everything else in this group of lessons builds on.

Also recognized in: threads across virtually every mainstream language's
own concurrency model, processes and threads as the two basic units of
concurrent execution in every operating system.

### SE Lens

The alternative — running every operation, including slow ones, on the
single thread every callback has used so far — was not chosen for
genuinely slow work because it would freeze that one thread, and
everything depending on it, for the operation's entire duration; a
separate thread lets slow work run without blocking everything else.

---

## Connect the Pieces

`worker` runs independently of `main`'s own call stack — a genuinely
separate thread. The next lesson names the actual mechanism that has
been running every callback in this course, one at a time, so far.

## What Breaks Without This

Running genuinely slow work on the same single thread every callback has
used so far freezes that thread, and everything depending on it, for the
operation's entire duration.

## Exercises

1. Remove `worker.join();` from this lesson's own example, run it
   several times, and explain, in your own words, why the output order
   is no longer guaranteed.
2. Explain, in your own words, what `worker.start()` does differently
   from calling `worker.run()` directly.
3. Explain, in your own words, why `worker.join()` is necessary for the
   real output shown above to be guaranteed, not just likely.

## Definition of Done

- [ ] You ran the `Thread`/`worker.join()` example and can explain what
      `join()` guarantees.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, what a thread
      is, independent of any one specific example.
