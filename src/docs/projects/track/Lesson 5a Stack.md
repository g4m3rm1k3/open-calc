# Lesson 5a: Stack — Last In, First Out

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 0v's `List`/`ArrayList`.

**Terms introduced in this lesson:**

- **Stack (LIFO)** — a data structure allowing additions and removals
  only at the same end, so the most recently added entry is always the
  first one removed (Last In, First Out).

---

## Concept Unit: Stack — Last In, First Out

### The Problem

Some sequences of items need to be undone in the exact reverse order
they were added — the most recent addition is always the first one
removed. A plain `List` (Lesson 0v) permits removing from anywhere; a
more restricted structure, allowing changes only at one end, is what
actually enforces the reverse-order guarantee, rather than trusting
calling code to always remove from the right place by convention.

### Introduce the Concept in Isolation

```
mkdir lesson-5a
cd lesson-5a
```

Create `Main.java`:

```java
import java.util.ArrayDeque;

public class Main {
    public static void main(String[] args) {
        ArrayDeque<String> screens = new ArrayDeque<>();

        screens.push("Home");
        screens.push("Settings");
        screens.push("Profile");

        System.out.println("Current: " + screens.peek());
        screens.pop();
        System.out.println("Current: " + screens.peek());
        screens.pop();
        System.out.println("Current: " + screens.peek());
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
Current: Profile
Current: Settings
Current: Home
```

`"Profile"`, the most recently pushed screen, is also the first one
removed. This is a `stack (LIFO)` — **first appearance**: a data
structure allowing additions and removals only at the same end, so the
most recently added entry is always the first one removed (Last In,
First Out). `push` adds to the top; `pop` removes from the top; `peek`
reads the top without removing it — there is no operation to add or
remove from the bottom, or from the middle, at all.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `ArrayDeque<String> screens = new ArrayDeque<>();` — **(a) first
   appearance** of `ArrayDeque`, Java's standard-library class used
   here as a stack (its own name reflects a more general
   "double-ended queue" capability, only the stack-relevant half of
   which this lesson uses). `<String>` is Lesson 0u's generics,
   reused, **(b)**.
2. `screens.push("Home");`, `screens.push("Settings");`,
   `screens.push("Profile");` — **(a) first appearance** of `push`:
   adds to the top. After all three calls, `"Profile"` sits on top,
   `"Settings"` beneath it, `"Home"` at the bottom.
3. `screens.peek()` — **(a) first appearance**: reads the current top
   entry without removing it.
4. `screens.pop()` — **(a) first appearance**: removes and returns the
   top entry. Called once, it removes `"Profile"`, leaving
   `"Settings"` as the new top; called again, it removes `"Settings"`,
   leaving `"Home"`.

### CS Lens

LIFO ordering is what distinguishes a stack from a plain list or
queue: the *only* accessible entry at any moment is the most recently
added one. This is also, not coincidentally, the exact mechanism
behind function-call return addresses in every language's runtime — a
thrown exception's own stack trace is a literal, real stack of function
calls, most recent on top.

Also recognized in: undo history in virtually every editor (the most
recent action is always the first one undone), the browser's own Back
button, `list.append()`/`list.pop()` used as a stack in Python.

### SE Lens

The alternative — using a plain `List` and always removing from
`list.size() - 1` by convention — was not chosen because nothing stops
code from accidentally removing from index `0` instead, silently
breaking the LIFO guarantee with no error at all. A dedicated stack
type, exposing only `push`/`pop`/`peek`, makes that mistake impossible
to make by accident.

---

## Connect the Pieces

`screens.push("Profile")` then `screens.pop()` demonstrated LIFO
ordering directly. The next lesson (Activity Back Stack) shows this
exact structure, real and load-bearing, inside Android itself.

## What Breaks Without This

Using a plain `List` and removing by convention from `list.size() - 1`
instead of a real stack type doesn't stop code elsewhere from
accidentally calling `list.remove(0)` — silently breaking the
intended LIFO order with no error at all, since nothing about a plain
`List` enforces it.

## Exercises

1. Extend this lesson's own `ArrayDeque` example with a fourth `push`
   and a third `pop`, predicting the printed output before running it.
2. Try calling `screens.pop()` a fourth time (after the stack is
   empty) and read the real exception this produces.
3. Explain, in your own words, why a stack is described as LIFO rather
   than FIFO.

## Definition of Done

- [ ] You ran the `ArrayDeque` stack example and saw the real LIFO
      output.
- [ ] You completed Exercise 1 and correctly predicted the output
      before running it.
- [ ] You can state, without looking back at this lesson, why a stack
      only allows changes at one end.
