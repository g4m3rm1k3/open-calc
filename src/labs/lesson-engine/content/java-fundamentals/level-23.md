---
series: java-fundamentals
level: 23
title: Multithreading Basics
lang: java
---

# Multithreading Basics

Every program in this course has run one instruction at a time, in one single, continuous stream — a single **thread**. Java can run several threads at once, genuinely in parallel on a multi-core machine, or interleaved on a single core — real concurrency, with a real, new category of bug (two threads touching the same data at the same time) that this lesson also covers how to prevent.

## Starting a Thread

```java
public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            System.out.println("Running in a new thread");
        });
        t.start();
        t.join();
        System.out.println("Main thread continues");
    }
}
```

```text
Running in a new thread
Main thread continues
```

`new Thread(() -> { ... })` — the lambda (Level 14) is the code the new thread will run; `Thread` itself accepts a `Runnable` (a functional interface with exactly one abstract method, `run()`, taking nothing and returning nothing — the lambda's shape matches it exactly).

`t.start();` — actually begins running the thread's code, genuinely concurrently with whatever `main`'s own thread does next. Note: calling `t.run()` directly, instead of `t.start()`, would just run the lambda's code synchronously on the *current* thread — `start()` is what actually creates and launches a new one.

`t.join();` — pauses `main`'s own thread until `t` finishes completely. Without it, `"Main thread continues"` could print *before* `"Running in a new thread"` does, or interleaved strangely with it — the two threads would have no guaranteed order relative to each other at all. `throws InterruptedException` — `join()` is a real, checked-exception-throwing call (Level 10): another thread could theoretically interrupt the waiting thread before `t` finishes.

## Runnable, and Naming a Thread

```java
public class Main {
    static class Counter implements Runnable {
        public void run() {
            System.out.println("Counter thread: " + Thread.currentThread().getName());
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(new Counter(), "worker-1");
        t.start();
        t.join();
        System.out.println("Done: " + Thread.currentThread().getName());
    }
}
```

```text
Counter thread: worker-1
Done: main
```

`class Counter implements Runnable` — the same shape as the previous example's lambda, written out as a full class instead (Level 12's `implements`, applied to `Runnable` specifically) — a real, common pattern for a task that needs its own fields or several methods, more than a single lambda expression can comfortably hold.

`new Thread(new Counter(), "worker-1")` — the second constructor argument names the thread. `Thread.currentThread().getName()` — asks whichever thread is currently executing this exact line for its own name; inside `Counter.run()`, that's `"worker-1"`; back in `main` after `t.join()`, it's `"main"` — the name Java gives the thread every program starts on automatically.

## A Real Race Condition, and synchronized

```java
public class Main {
    static int counter = 0;

    static synchronized void increment() {
        counter++;
    }

    public static void main(String[] args) throws InterruptedException {
        Thread[] threads = new Thread[10];
        for (int i = 0; i < 10; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < 1000; j++) increment();
            });
        }
        for (Thread t : threads) t.start();
        for (Thread t : threads) t.join();
        System.out.println(counter);
    }
}
```

```text
10000
```

`counter++` — looks like one operation, but is really three: read `counter`'s current value, add `1`, write the new value back. With `10` threads each doing this `1000` times with no protection, two threads can genuinely read the *same* current value before either writes back — one increment gets silently lost. This is a **race condition**: the final result depends on unpredictable timing, and without `synchronized`, this exact program can (and, run enough times, eventually will) print something less than `10000`.

`static synchronized void increment()` — `synchronized` ensures only *one* thread can be running this method on `Main`'s class-level lock at any given moment; every other thread calling `increment()` at the same time genuinely waits its turn. This is what makes the read-add-write-back sequence effectively **atomic** — indivisible from every other thread's point of view — and guarantees exactly `10000` here, deterministically, every single run.

**CS lens:** `synchronized` works by acquiring a **lock** before running the protected code, and releasing it afterward — any other thread trying to acquire the same lock simply blocks until it's free. This is the fundamental mechanism behind nearly every concurrency-safety tool in nearly every language with real threads — Python's GIL sidesteps the exact problem `synchronized` solves in a different way; C#'s `lock` keyword (if this course's C# curriculum has been taken) is functionally the same idea, different syntax.

**SE lens:** `synchronized` isn't free — every thread waiting for a lock is a thread doing no useful work, and overusing it can turn supposedly-parallel code into something that runs barely faster than a single thread, defeating the entire purpose of threading in the first place. The real engineering judgment is identifying exactly which *shared, mutable* state genuinely needs protecting (`counter` here) and synchronizing only that — code that touches purely local, per-thread data (like each lambda's own `j` loop variable above) never needs it at all.

## Challenge: parallel_sum

Write a `static int parallelSum(int[] nums) throws InterruptedException` method that splits `nums` into two halves, sums each half on its own `Thread`, waits for both to finish with `join()`, and returns the combined total. Store each half's partial sum in a shared `int[]` array of size `2` (an array, since a lambda can't reassign a local variable, but can mutate an array element it captures).

```challenge
static int parallelSum(int[] nums) throws InterruptedException {
    // TODO
}
```

```test
assert parallelSum(new int[]{1, 2, 3, 4}) == 10
assert parallelSum(new int[]{}) == 0
assert parallelSum(new int[]{5}) == 5
assert parallelSum(new int[]{-1, -2, -3}) == -6
```
