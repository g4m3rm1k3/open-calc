# Lesson 21a: Command Dispatch Table

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Command dispatch table** — a fixed set of named actions, matched by
  an identifier and routed to their handler.

---

## Concept Unit: Command Dispatch Table

### The Problem

Routing a request to the correct handler, based on some identifier,
appears constantly, in genuinely unrelated contexts — a menu system, a
message broker, a command-line tool's own subcommands. Recognizing this
as one recurring shape, rather than a new problem each time, is worth
naming explicitly.

### Introduce the Concept in Isolation

```
mkdir lesson-21a
cd lesson-21a
```

Create `Main.java`:

```java
public class Main {
    static void handleCommand(String command) {
        if (command.equals("SAVE")) {
            System.out.println("Saving...");
        } else if (command.equals("DELETE")) {
            System.out.println("Deleting...");
        } else if (command.equals("REFRESH")) {
            System.out.println("Refreshing...");
        } else {
            System.out.println("Unknown command: " + command);
        }
    }

    public static void main(String[] args) {
        handleCommand("SAVE");
        handleCommand("DELETE");
        handleCommand("EXPORT");
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
Saving...
Deleting...
Unknown command: EXPORT
```

`handleCommand` is a `command dispatch table` — **first appearance**: a
fixed set of named actions, matched by an identifier and routed to their
handler. Each `if`/`else if` branch matches one specific, named command
and routes to its own distinct handling — a shape that recurs in genuinely
unrelated systems, not specific to any one of them.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `if (command.equals("SAVE")) { ... } else if (command
   .equals("DELETE")) { ... } else if (...) { ... } else { ... }` —
   genuinely basic conditional syntax, sorted **(c)** — the pattern
   worth naming is the overall shape, not any one individual branch.
2. `handleCommand("EXPORT")` — a command matching none of the known
   branches, falling through to the final `else` — proof the dispatch
   table has a defined behavior even for an unrecognized command, rather
   than silently doing nothing or crashing.

### CS Lens

A dispatch table maps a finite set of named identifiers to their own
distinct behavior — the same underlying shape whether written as
`if`/`else if` chains (as here), a `switch` statement, or a real
`Map<String, Runnable>` structure. Recognizing this shape on sight, in
whatever code it appears, is the actual point — a menu system's
`getItemId()` comparisons and this lesson's own `handleCommand` are the
same idea, encountered in two completely unrelated contexts.

Also recognized in: a command-line tool's own subcommand routing, an
HTTP router matching a URL path to its handler, a game's own input
handler matching a key press to an action, a state machine's own
transition table.

### SE Lens

The alternative — one large method handling every command's full logic
inline, with no clear per-command boundary at all — was not chosen
because a dispatch table's per-command branches (or map entries) keep
each command's own logic cleanly separated and independently
extendable — adding `"EXPORT"` support means adding one new branch (or
map entry), not restructuring the entire method.

---

## Connect the Pieces

`handleCommand` routes a fixed set of named commands to their own
handlers — a shape recognizable across many unrelated systems, including
the menu system this group of lessons is building toward. The next
lesson names a different, unrelated recurring shape.

## What Breaks Without This

One large method handling every command's full logic inline, with no
clear per-command boundary, becomes harder to extend safely — adding a
new command risks entangling its logic with every existing branch.

## Exercises

1. Add a fourth command, `"EXPORT"`, to this lesson's own dispatch
   table, giving it real handling instead of falling through to the
   "Unknown command" branch.
2. Explain, in your own words, why `handleCommand`'s final `else` branch
   matters, rather than leaving unrecognized commands unhandled.
3. Name one real system (besides a menu) that uses a command dispatch
   table, and describe what its "identifier" and "handler" are.

## Definition of Done

- [ ] You ran the `handleCommand` example and saw the real output.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, what a
      dispatch table maps, in general terms.
