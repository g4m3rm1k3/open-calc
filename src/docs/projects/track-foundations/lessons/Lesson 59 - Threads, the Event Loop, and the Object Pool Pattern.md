# Lesson 59: Threads, the Event Loop, and the Object Pool Pattern

**What you will build:** Three small, fully runnable, plain Java labs.

**What you need to know first:** Lesson 10's event-driven programming.

**Terms introduced in this lesson:**

- **Thread** — a genuinely separate, concurrently-running unit of
  execution within one process, with its own call stack, able to run at
  the same time as other threads.
- **Event loop** — a single loop that repeatedly pulls the next pending
  callback off a queue and runs it to completion before pulling the next
  one, guaranteeing two callbacks never run at the same time on that loop.
- **Object Pool Pattern** — reusing a small, fixed set of
  already-created, expensive objects by handing them out and reclaiming
  them, rather than constructing and discarding a brand-new one for every
  use.

---

## Concept Unit: Thread

### The Problem

Every callback this curriculum has shown so far — every `onCreate` call,
every click listener invocation (Lesson 10's own event-driven
programming) — has silently run one after another, never at the same
time as another callback. Real, measurably-slow work (like a database
query) run this same way would freeze everything else in the program for
its entire duration, with nothing able to run concurrently with it.

### Introduce the Concept in Isolation

```
mkdir lesson-59a
cd lesson-59a
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

A thread is the actual mechanism underneath every callback this
curriculum has shown so far — every one of them has, until now, silently
run on the same single thread. Recognizing "this is now a genuinely
separate thread, not just a separate method call" is the transferable
distinction that everything else in this lesson builds on.

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

## Concept Unit: Event Loop

### The Problem

Every `onCreate` call and every click listener invocation since Lesson
10 has silently been one task pulled off some underlying queue and run
to completion — but nothing in this curriculum has yet named the actual
mechanism doing that pulling, or explained why two callbacks never
manage to run at the same time on that one thread.

### Introduce the Concept in Isolation

```
mkdir lesson-59b
cd lesson-59b
```

Create `Main.java`:

```java
import java.util.LinkedList;
import java.util.Queue;

public class Main {
    public static void main(String[] args) {
        Queue<Runnable> taskQueue = new LinkedList<>();
        taskQueue.add(() -> System.out.println("Handling click on Save button"));
        taskQueue.add(() -> System.out.println("Handling onCreate for Activity"));
        taskQueue.add(() -> System.out.println("Handling click on Delete button"));

        while (!taskQueue.isEmpty()) {
            Runnable task = taskQueue.poll();
            task.run();
        }
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
Handling click on Save button
Handling onCreate for Activity
Handling click on Delete button
```

#### Execution Trace

Trace of the `while (!taskQueue.isEmpty())` loop:

1. `taskQueue.poll()` removes the Save-button task; `task.run()` executes
   it fully, printing `"Handling click on Save button"`, before the loop
   condition is even checked again.
2. `taskQueue.poll()` removes the `onCreate` task; `task.run()` executes
   it fully, printing `"Handling onCreate for Activity"` — the Save
   task's own `println` had already completely finished first.
3. `taskQueue.poll()` removes the Delete-button task; `task.run()`
   executes it fully, printing `"Handling click on Delete button"`.
4. `taskQueue.isEmpty()` now returns `true`; the loop ends.

Each task runs completely, in the order it was queued, before the next
one is even pulled off the queue. This is the `event loop` — **first
appearance**: a single loop that repeatedly pulls the next pending
callback off a queue and runs it to completion before pulling the next
one, guaranteeing two callbacks never run at the same time on that loop.
`while (!taskQueue.isEmpty()) { ... task.run(); }` is exactly the shape
that has silently been calling every `onCreate` and every click listener
in this curriculum since Lesson 10 — one task, fully finished, before the
next is even pulled.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Queue<Runnable> taskQueue` — **(a) first appearance**: holds pending
   callbacks in the order they were queued, not yet run.
2. `while (!taskQueue.isEmpty())` — **(a) first appearance**: the loop
   itself, continuing exactly as long as pending tasks remain.
3. `Runnable task = taskQueue.poll(); task.run();` — **(a) first
   appearance**: removes and runs exactly one task to full completion
   before the loop's next iteration ever pulls another.

### CS Lens

The event loop is why this curriculum's own callbacks (Lesson 10) have
never overlapped — each one runs to completion on the loop's own single
thread before the next is even dequeued. This is the actual mechanism
underneath "event-driven programming," not a separate concept from it —
naming the loop itself is what this lesson adds.

Also recognized in: JavaScript's own single-threaded event loop, Android's
own main-thread `Looper`/`MessageQueue`, GUI toolkit event loops across
virtually every mainstream UI framework.

### SE Lens

The alternative — running each queued task on its own separate thread
immediately, rather than one at a time on a single loop — was not chosen
for UI callbacks specifically because updating the same on-screen views
from multiple threads simultaneously creates real, hard-to-reproduce data
races; running one task fully to completion before the next begins is
what prevents that.

---

## Concept Unit: Object Pool Pattern

### The Problem

`ExecutorService` (a later lesson's own subject) reuses a small set of
already-created threads rather than spinning up a brand-new `Thread` for
every database operation — because constructing a real thread has real,
measurable cost, repeated needlessly if a fresh one is created and
discarded for every single task.

### Introduce the Concept in Isolation

```
mkdir lesson-59c
cd lesson-59c
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
appearance**: reusing a small, fixed set of already-created, expensive
objects by handing them out and reclaiming them, rather than constructing
and discarding a brand-new one for every use. `first == second` (Lesson
18's own identity comparison) prints `true` — real proof `borrow()`
handed back the exact same object `giveBack()` had just returned to the
pool, not a freshly constructed one.

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
   Lesson 18, printing `true`: real proof no new `ExpensiveConnection` was
   constructed for this second `borrow()` call.

### CS Lens

The Object Pool Pattern trades a small, fixed, up-front construction cost
for avoiding repeated construction/destruction cost later — worthwhile
specifically when constructing an object is genuinely expensive (a real
thread, a real database connection) and a small, reused set can serve
every caller without each one needing its own permanent instance.

Also recognized in: thread pools (`ExecutorService`, a later lesson's own
subject) and database connection pools across virtually every mainstream
backend framework — the same underlying pattern, applied to whichever
expensive resource is being reused.

### SE Lens

The alternative — constructing a brand-new `ExpensiveConnection` (or a
brand-new `Thread`) every single time one is needed — was not chosen
because repeated construction of a genuinely expensive object wastes real
time and resources that a small, reused pool avoids entirely.

---

## Connect the Pieces

Every callback since Lesson 10 has silently run on one thread, one at a
time, in the order queued — the event loop is the actual mechanism doing
that, and thread is what makes it possible to run genuinely
slow work (like a database query) *without* freezing that same loop, by
moving it to a separate thread instead. The Object Pool Pattern is why
that separate thread doesn't have to be freshly constructed every single
time slow work is needed — a small, reused pool of already-built threads
(`ExecutorService`, a later lesson's own subject) serves every request
without repeating a real, measurable construction cost.

## What Breaks Without This

Running genuinely slow work directly on the same thread the event loop
uses for every callback freezes that loop entirely for the operation's
duration — no other callback, including UI updates, can run until it
finishes. And constructing a brand-new `Thread` (or a brand-new database
connection) for every single slow operation, instead of reusing a small
pool, wastes real, measurable construction cost repeatedly, for no
benefit over reuse.

## Exercises

1. Remove `worker.join();` from the `Thread` example, run it several
   times, and explain, in your own words, why the output order is no
   longer guaranteed.
2. Add a fourth task to the event-loop example's `taskQueue` and confirm
   it runs only after the first three have each fully completed.
3. Explain, in your own words, why `ConnectionPool`'s constructor builds
   every `ExpensiveConnection` up front, rather than lazily, the first
   time each one is actually borrowed.

## Definition of Done

- [ ] You ran the `Thread`/`worker.join()` example and can explain what
      `join()` guarantees.
- [ ] You ran the event-loop example and can explain why two tasks never
      overlap.
- [ ] You ran the `ConnectionPool` example and can explain what
      `first == second` proves.
