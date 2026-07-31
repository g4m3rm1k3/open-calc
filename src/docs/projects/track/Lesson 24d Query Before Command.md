# Lesson 24d: Query Before Command

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 24c's Permission Rationale State
Machine.

**Terms introduced in this lesson:**

- **Query Before Command** — checking current state is kept as a
  separate operation from requesting a state change — you can always ask
  "is this true right now" without triggering a side effect.

---

## Concept Unit: Query Before Command

### The Problem

A single method that both checks a current state *and* changes it, in
one call, forces the caller to accept a side effect just to find out
what's currently true — no way to ask "is this already the case" without
also possibly triggering a change.

### Introduce the Concept in Isolation

```
mkdir lesson-24d
cd lesson-24d
```

Create `Main.java`:

```java
class LightSwitch {
    private boolean isOn = false;

    boolean isCurrentlyOn() {
        return isOn;
    }

    void turnOn() {
        isOn = true;
        System.out.println("Light turned on.");
    }
}

public class Main {
    public static void main(String[] args) {
        LightSwitch light = new LightSwitch();

        System.out.println("Is it on? " + light.isCurrentlyOn());

        if (!light.isCurrentlyOn()) {
            light.turnOn();
        }

        System.out.println("Is it on now? " + light.isCurrentlyOn());
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
Is it on? false
Light turned on.
Is it on now? true
```

`isCurrentlyOn()` never changes anything — calling it as many times as
needed produces no side effect at all. `turnOn()` is the only method
that actually changes state, and it's called separately, only once the
check has already determined it's needed. This is `Query Before Command`
— **first appearance**: checking current state is kept as a separate
operation from requesting a state change — you can always ask "is this
true right now" without triggering a side effect. Lesson 24b's own
`checkSelfPermission` (a pure query) kept deliberately separate from
actually requesting a permission (a command) already followed this exact
principle.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `boolean isCurrentlyOn() { return isOn; }` — **(a) first appearance**
   of a pure **query**: reads and returns state, with no side effect of
   any kind — calling it any number of times never changes anything.
2. `void turnOn() { isOn = true; ... }` — **(a) first appearance** of a
   **command**: changes state, deliberately kept separate from the query
   above rather than combined into one method.
3. `if (!light.isCurrentlyOn()) { light.turnOn(); }` — the query is
   called first, safely, with no risk of accidentally toggling the
   switch just to check it; the command runs only if the check
   determines it's actually needed.

### CS Lens

This is the **command-query separation** principle: every method should
either answer a question (a query, safely repeatable, no side effects)
or perform an action (a command, causing a side effect), never both at
once. A method that both changes state and reports whether it changed
anything conflates two genuinely different responsibilities into one
call.

Also recognized in: `ContextCompat.checkSelfPermission` (a pure query)
kept deliberately separate from actually requesting a permission (a
command) in Android's own runtime permission model (Lesson 24b),
`SharedPreferences.getInt` (query) versus `Editor.putInt` (command) —
the same read/write split recurring across genuinely different systems.

### SE Lens

The alternative — one method, `turnOnIfNeeded()`, that checks and
changes state in a single call — was not chosen because it removes the
caller's ability to safely check current state without risking a side
effect; separating query from command means the caller decides,
explicitly, whether and when the side-effecting command actually runs.

---

## Connect the Pieces

`isCurrentlyOn()` answers a question, safely, with no side effect.
`turnOn()` performs an action, deliberately separate, called only when
the query already determined it's needed. This separation is what lets
`main` check state as many times as it wants, with total confidence that
checking alone never changes anything — the same discipline Lessons 24a
through 24c's own permission checks already followed.

## What Breaks Without This

A single combined method, checking and changing state together:

```java
boolean turnOnIfNeeded() {
    if (isOn) {
        return false;
    }
    isOn = true;
    return true;
}
```

works correctly here, but removes the caller's ability to check current
state *without* risking a change — every call to this method is also a
potential command, with no safe, side-effect-free way to just ask "is it
on right now" separately. This is the concrete cost of combining query
and command: callers lose the ability to check freely.

## Exercises

1. Add a second command, `turnOff()`, and a matching guard using
   `isCurrentlyOn()` before calling it, following the same query-before-
   command shape as `turnOn()`.
2. Call `isCurrentlyOn()` five times in a row, with no command call in
   between, and confirm the light's state never changes just from
   checking.
3. Explain, in your own words, why `SharedPreferences.getInt` (Lesson
   11d) is a query and `Editor.putInt` is a command, connecting this
   lesson's own principle to that earlier lesson's material.

## Definition of Done

- [ ] You ran the `LightSwitch` example and saw the real, correct
      before/after output.
- [ ] You completed Exercise 2 and confirmed repeated queries cause no
      side effect.
- [ ] You can state, without looking back at this lesson, the difference
      between a query and a command.
