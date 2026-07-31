# Lesson 2l: Logging

**What you will build:** A disposable lab.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Logging** — instrumenting running code by emitting diagnostic
  events to an observable sink, so what a program is actually doing can
  be inspected without stopping it or attaching a debugger.

---

## Concept Unit: Logging

### The Problem

Every example so far has used `System.out.println` to show a
program's behavior — necessary for a lesson, but a real running
program, not being read one example at a time, needs a way to record
what it's doing that can be inspected *while it's running*, without
stopping it to attach a debugger, and ideally with more structure than
plain, undifferentiated text.

### Introduce the Concept in Isolation

```
mkdir lesson-2l
cd lesson-2l
```

Create `Main.java`:

```java
import java.util.logging.Logger;

public class Main {
    private static final Logger logger = Logger.getLogger("Main");

    public static void main(String[] args) {
        logger.info("Application starting.");
        int result = 10 / 2;
        logger.info("Computed result: " + result);
        logger.warning("This is a warning-level message.");
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output (the exact timestamp will differ):

```
Jul 30, 2026 9:00:00 AM Main main
INFO: Application starting.
Jul 30, 2026 9:00:00 AM Main main
INFO: Computed result: 5
Jul 30, 2026 9:00:00 AM Main main
WARNING: This is a warning-level message.
```

`logger.info(...)` and `logger.warning(...)` are `logging` — **first
appearance**: instrumenting running code by emitting diagnostic events
to an observable sink, so what a program is actually doing can be
inspected without stopping it or attaching a debugger. Unlike plain
`System.out.println`, every line automatically carries real structure
— a timestamp, a severity level (`INFO`, `WARNING`), and the class that
emitted it — read directly from the log output, not hand-formatted by
the programmer each time.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `Logger logger = Logger.getLogger("Main");` — **(a) first
   appearance**: obtains a real `Logger` object, named `"Main"`, used
   to categorize every message emitted through it.
2. `logger.info("Application starting.");` — **(a) first appearance**:
   emits a message at `INFO` severity — a normal, informational event,
   not an error.
3. `logger.warning("This is a warning-level message.");` — **(a) first
   appearance**: emits a message at a higher severity, `WARNING`,
   visually and structurally distinguished from `INFO` in the real
   output above.

### CS Lens

Logging is diagnostic output with real structure attached — severity,
timestamp, source — specifically so a large, long-running program's
output can be filtered and searched (show only `WARNING` and above, for
instance) rather than scanned line by line the way `println`'s
undifferentiated text requires.

Also recognized in: the `logging` module in Python (near-identical
severity-level shape to Java's own), `ILogger` in C#/.NET, structured
logging frameworks across virtually every server-side language and
platform — Android's own `Log.d`/`Log.i` and Logcat viewer are this
exact same idea, platform-specific syntax for a universal concept.

### SE Lens

The alternative — `System.out.println` for everything, as every
earlier lesson in this course has used for simplicity — was not chosen
for real, long-running software because plain text has no severity to
filter by, no automatic timestamp, and no way to distinguish "the
program is telling you something routine" from "something is actually
wrong," forcing a human reader to make that judgment by reading every
single line.

---

## Connect the Pieces

`logger.info(...)`/`logger.warning(...)` give real, structured
diagnostic output — the same underlying idea `Log.d`/Logcat use on a
real Android device, a later lesson's own subject.

## What Breaks Without This

Replace `logger.warning(...)` with `logger.severe(...)` and run it
yourself — see the real, different severity label in the output, proof
each level is genuinely distinguished, not decorative.

## Exercises

1. Change this lesson's own `logger.warning(...)` call to
   `logger.severe(...)` and observe the real, different severity label
   in the output.
2. Add a fourth log call at `INFO` severity, after the existing three.
3. Explain, in your own words, why a real, long-running program
   benefits from filterable severity levels that plain `println` output
   doesn't have.

## Definition of Done

- [ ] You ran the logging example and saw the real, structured output.
- [ ] You completed Exercise 1 and observed the real severity change.
- [ ] You can state, without looking back at this lesson, one concrete
      advantage logging has over `System.out.println`.
