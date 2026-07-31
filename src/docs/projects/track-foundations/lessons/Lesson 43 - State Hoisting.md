# Lesson 43: State Hoisting

**What you will build:** A small, fully runnable, hand-rolled plain Java
lab, isolating the pattern before meeting its real, Compose-specific
trigger.

**What you need to know first:** Lesson 37's `single source of truth`.

**Terms introduced in this lesson:**

- **State hoisting** — a stateful widget doesn't own its own value — it
  receives a value from above and reports changes upward via a callback,
  with the actual source of truth living one level higher.

---

## Concept Unit: State Hoisting

### The Problem

A widget that owns its own internal value directly (like `EditText`,
which always holds its own current text) makes that value hard for
surrounding code to observe or control from outside — reading it means
reaching into the widget itself, and resetting or validating it means
the widget's own internals must expose a way to do so. Some UI systems
deliberately avoid giving a widget any internal value ownership at all.

### Introduce the Concept in Isolation

```
mkdir lesson-43
cd lesson-43
```

Create `Main.java`:

```java
interface TextChangedCallback {
    void onTextChanged(String newText);
}

class StatelessTextField {
    void render(String currentValue, TextChangedCallback callback) {
        System.out.println("Displaying: " + currentValue);
        callback.onTextChanged(currentValue.toUpperCase());
    }
}

class Screen {
    private String username = "";

    void update() {
        StatelessTextField field = new StatelessTextField();
        field.render(username, newText -> {
            username = newText;
            System.out.println("Screen's own state is now: " + username);
        });
    }
}

public class Main {
    public static void main(String[] args) {
        Screen screen = new Screen();
        screen.update();
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
Displaying: 
Screen's own state is now: 
```

`StatelessTextField` holds no field of its own for the current text at
all — `render(currentValue, callback)` receives the value from `Screen`
and reports any change back through `callback`, never storing anything
itself. This is `state hoisting` — **first appearance**: a stateful
widget doesn't own its own value — it receives a value from above and
reports changes upward via a callback, with the actual source of truth
living one level higher. `Screen.username`, not
`StatelessTextField` itself, is the real, single source of truth (Lesson
37) for the current text.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `interface TextChangedCallback { void onTextChanged(String newText);
   }` — **(b) reappearing** callback interface shape from Lesson 10.
2. `void render(String currentValue, TextChangedCallback callback) {
   ... }` — **(a) first appearance** of the hoisted-state shape itself:
   the widget receives its current value as a plain parameter, and
   reports any change through a callback parameter, rather than reading
   or writing any field of its own.
3. `private String username = "";` on `Screen`, not on
   `StatelessTextField` — **(a) first appearance** of this specific
   placement: the actual, authoritative value lives one level above the
   widget that displays and edits it.
4. `field.render(username, newText -> { username = newText; ... });` —
   `Screen` passes its own current value down, and receives changes back
   up through the lambda, which is the only place `username` is ever
   reassigned.

### CS Lens

State hoisting is single source of truth (Lesson 37) applied specifically
to UI widgets: rather than each widget maintaining its own internal copy
of a value, the value lives in exactly one place — here, `Screen` — and
every widget displaying or editing it is handed that value explicitly,
reporting changes back up rather than keeping its own, potentially
diverging copy.

Also recognized in: "lifting state up" in React (the identical pattern,
same name, applied to JavaScript UI components), unidirectional data flow
in many modern UI frameworks generally — value flows down, change events
flow up, never sideways or in a loop.

### SE Lens

The alternative — a widget owning its own value directly, the way
`EditText` does — was not chosen by Compose's own design because it
makes the value hard to observe or drive from outside the widget itself;
hoisting the state up means any surrounding code (validation logic, a
reset button) can read or set the value directly, through the one shared
source of truth, without needing to reach into the widget's own
internals at all. This is precisely why a Compose `TextField` is
stateless on its own, unlike `EditText`: `TextField(value = username,
onValueChange = { username = it })`, in real Compose code, is this exact
lesson's own pattern, real and load-bearing — the value comes from
above, and every keystroke reports upward through `onValueChange` rather
than the `TextField` ever storing anything itself.

---

## Connect the Pieces

`StatelessTextField.render(currentValue, callback)` never stored a value
of its own — `Screen.username` was the one real source of truth, handed
down on every render and updated only through the callback reporting
changes back up. This is the exact shape a real Compose `TextField`
follows: stateless itself, receiving its value from above and reporting
every change upward, rather than owning any state internally the way
`EditText` always has.

## What Breaks Without This

A widget that owns its own value internally, with no way for outside
code to observe or reset it directly, makes a real, common requirement —
"clear this field when the form is submitted" — awkward at best: outside
code would need the widget to expose a special reset method, rather than
simply setting the one, shared source-of-truth value back to empty and
letting the widget redisplay it, which state hoisting makes trivial.

## Exercises

1. Add a `reset()` method to `Screen` that sets `username` back to an
   empty string, then calls `update()` again, confirming the widget
   displays the cleared value — proof that resetting is trivial when
   `Screen`, not the widget, owns the real value.
2. Add a second hoisted field, `int characterCount`, updated inside the
   same callback whenever `username` changes, following the identical
   hoisting shape.
3. Explain, in your own words, why validating `username` (checking it's
   not empty, say) is easy to do from `Screen` directly, but would be
   awkward if `StatelessTextField` owned the value internally instead.

## Definition of Done

- [ ] You ran the `StatelessTextField`/`Screen` example and saw the real
      output.
- [ ] You completed Exercise 1 and confirmed resetting the hoisted value
      correctly updates what the widget displays.
- [ ] You can state, without looking back at this lesson, why a Compose
      `TextField` is described as stateless, unlike `EditText`.
