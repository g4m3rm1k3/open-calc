# Lesson 11b: Volatile vs. Non-Volatile State

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 11a's refresh on resume.

**Terms introduced in this lesson:**

- **Volatile vs. non-volatile state** — memory that exists only while a
  process runs (volatile) versus storage that outlives the process
  entirely (non-volatile).

---

## Concept Unit: Volatile vs. Non-Volatile State

### The Problem

Every variable, field, and object this curriculum has built so far has
lived in memory, for as long as the running program lasted — and
disappeared completely the instant that program ended. Some data
genuinely needs to survive longer than any single run of a program;
memory alone, no matter how carefully checkpointed within one run, cannot
provide that on its own.

### Introduce the Concept in Isolation

```
mkdir lesson-11b
cd lesson-11b
```

Create `Main.java`:

```java
public class Main {
    public static void main(String[] args) {
        int inMemoryCounter = 5;
        System.out.println("In-memory value: " + inMemoryCounter);
        System.out.println("Program ending now — this value will not survive.");
    }
}
```

Compile and run it twice in a row:

```
javac Main.java
java Main
java Main
```

Here is the real output, from both runs:

```
In-memory value: 5
Program ending now — this value will not survive.
In-memory value: 5
Program ending now — this value will not survive.
```

`inMemoryCounter` prints `5` both times — not because it survived between
runs, but because it's freshly recreated, from the literal `5` in the
source code, every single time the program starts. This is `volatile vs.
non-volatile state` — **first appearance**: memory that exists only while
a process runs (volatile) versus storage that outlives the process
entirely (non-volatile). `inMemoryCounter` is volatile — nothing in this
program writes its value anywhere that would persist between the first
`java Main` run and the second one.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `int inMemoryCounter = 5;` — an ordinary local variable, **(c)**
   genuinely basic syntax, examined here specifically for how long its
   value actually lasts rather than its declaration shape.
2. Running `java Main` twice — **(a) first appearance** of this exact
   demonstration: two separate, independent process runs, each starting
   fresh from the source code, with nothing carried over between them at
   all.

### CS Lens

Volatile state exists only within one running process's own memory;
non-volatile state is written somewhere that outlives the process
entirely — a file, a database, any real, persistent storage medium. This
distinction is orthogonal to Lesson 5d's own configuration-change
rescue: `onSaveInstanceState` only ever bridges one Activity object's own
destruction within a *still-running* process — it says nothing at all
about surviving the process itself ending.

Also recognized in: RAM versus disk storage generally, a web browser's
in-memory JavaScript variables versus `localStorage` (which persists
across page reloads and browser restarts), any system distinguishing
"fast but temporary" from "slower but durable" storage.

### SE Lens

Recognizing which state genuinely needs non-volatile storage, versus
state that's fine being rebuilt fresh on every run, is a real design
decision with a real cost either way: over-persisting trivial state adds
unnecessary storage and complexity; under-persisting state a user
actually expects to survive produces a real, frustrating loss the moment
the program (or app) restarts.

---

## Connect the Pieces

Lesson 11a's `onResume` re-reads state that might have changed while a
process kept running. This lesson draws a sharper line: some state
doesn't just go stale, it vanishes entirely the moment a process ends.
The next lesson shows the real Android event that ends it.

## What Breaks Without This

Treating volatile, in-memory state as if it were durable leads to a real,
observable surprise the first time a process actually ends: any value
never written to non-volatile storage is simply gone, with no error or
warning of any kind.

## Exercises

1. Add a second local variable, `String status = "running";`, and
   confirm it also prints identically on both runs, for the same reason
   as `inMemoryCounter`.
2. Explain, in your own words, why `inMemoryCounter` printing `5` twice
   does *not* prove the value survived between runs.
3. Name one piece of state from an app you use daily that you'd expect
   to survive being fully closed and reopened, and one you wouldn't.

## Definition of Done

- [ ] You ran the two-process example and can explain why the value
      printed the same both times.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, the difference
      between volatile and non-volatile state.
