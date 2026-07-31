# Lesson 14b: Event Loop

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 14a's thread.

**Terms introduced in this lesson:**

- **Event Loop** — a single thread continuously pulling queued units of
  work and running them one at a time, in order, forever — the actual
  mechanism behind a framework calling your code at specific points.

---

## Concept Unit: Event Loop

### The Problem

Every `onCreate` call and every click listener invocation since Lesson
2c has silently been one task pulled off some underlying queue and run
to completion — but nothing in this course has yet named the actual
mechanism doing that pulling, or explained why two callbacks never
manage to run at the same time on that one thread.

### Introduce the Concept in Isolation

```
mkdir lesson-14b
cd lesson-14b
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
one is even pulled off the queue. This is the `Event Loop` — **first
appearance**: a single thread continuously pulling queued units of work
and running them one at a time, in order, forever — the actual mechanism
behind a framework calling your code at specific points. `while
(!taskQueue.isEmpty()) { ... task.run(); }` is exactly the shape that has
silently been calling every `onCreate` and every click listener in this
course since Lesson 2c — one task, fully finished, before the next is
even pulled.

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

The event loop is why this course's own callbacks (Lesson 2c) have never
overlapped — each one runs to completion on the loop's own single thread
(Lesson 14a) before the next is even dequeued. This is the actual
mechanism underneath "event-driven programming," not a separate concept
from it — naming the loop itself is what this lesson adds.

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

## Connect the Pieces

The event loop is the actual mechanism that has silently been calling
every callback in this course, one at a time, since Lesson 2c. The next
lesson names a different concern entirely — why the thread this loop
runs on shouldn't be freshly constructed for every piece of slow work.

## What Breaks Without This

Running each queued task on its own separate thread immediately, instead
of one at a time on a single loop, creates real, hard-to-reproduce data
races the moment two tasks touch the same shared state concurrently.

## Exercises

1. Add a fourth task to this lesson's own `taskQueue` and confirm it
   runs only after the first three have each fully completed.
2. Explain, in your own words, why two tasks in `taskQueue` can never
   run at the same time on this loop.
3. Explain, in your own words, how the event loop connects to Lesson
   2c's own event-driven programming material.

## Definition of Done

- [ ] You ran the event-loop example and can explain why two tasks never
      overlap.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, what an event
      loop actually is.
