# Lesson 2b: Callback — Registering Code to Run Later

**What you will build:** A small, fully runnable, hand-rolled lab.

**What you need to know first:** Lesson 2a's inversion of control,
Lesson 0s's functional interface, Lesson 0t's lambda expression.

**Terms introduced in this lesson:**

- **Callback** — a piece of code registered ahead of time and invoked
  later by something else (a framework, a UI toolkit) when a specific
  event occurs.

---

## Concept Unit: Callback — Registering Code to Run Later

### The Problem

`onStart()`, in Lesson 2a, was baked into `MiniFramework`'s own
required shape — any framework user *must* create a subclass and
override it. Sometimes a framework instead needs to let calling code
register a specific piece of behavior for one specific event, without
forcing a whole subclass just for that one registration.

### Introduce the Concept in Isolation

```
mkdir lesson-2b
cd lesson-2b
```

Create `Main.java`:

```java
interface ClickHandler {
    void onClick();
}

class Button {
    private ClickHandler handler;

    void setOnClickListener(ClickHandler handler) {
        this.handler = handler;
    }

    void simulatePress() {
        System.out.println("Button was pressed.");
        handler.onClick();
    }
}

public class Main {
    public static void main(String[] args) {
        Button button = new Button();
        button.setOnClickListener(() -> System.out.println("Handler ran!"));
        button.simulatePress();
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
Button was pressed.
Handler ran!
```

`setOnClickListener(...)` stores a `ClickHandler` — a functional
interface (Lesson 0s), here supplied as a lambda (Lesson 0t) — without
calling it immediately. `simulatePress()`, called separately and later,
is what actually invokes it. This is a `callback` — **first
appearance**: a piece of code registered ahead of time and invoked
later by something else (a framework, a UI toolkit) when a specific
event occurs.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `interface ClickHandler { void onClick(); }` — **(b) reappearing**
   functional interface from Lesson 0s, this time named for a specific
   event rather than a general ability.
2. `private ClickHandler handler;` and `setOnClickListener(ClickHandler
   handler)` — **(a) first appearance** of the registration shape:
   storing a callback in a field, to be invoked at some later, separate
   moment, rather than being called immediately at registration time.
3. `() -> System.out.println("Handler ran!")` — **(b) reappearing**
   lambda expression from Lesson 0t, here supplying `onClick()`'s body
   directly.
4. `button.simulatePress();` — this is the actual invocation. Note the
   gap: registration (`setOnClickListener`) and invocation
   (`simulatePress`) are two completely separate calls, at two separate
   moments — the callback sits stored and unused in between.

### CS Lens

A callback is inversion of control applied to one specific piece of
behavior, rather than to a whole class's structure. `Button` doesn't
know or care what the registered handler actually does — it only knows
*when* to call it. This is the general shape every click listener,
lifecycle method, and observer this course will show shares: something
registered ahead of time, invoked later, at a moment the callback's own
author doesn't control.

Also recognized in: `addEventListener` in JavaScript (near-identical
registration/invocation split), signal/slot connections in Qt, any
`onSomething(...)` method across virtually every UI framework.

### SE Lens

The alternative — `Button` requiring a full subclass to override a
`click()` method, the way `MiniFramework` required in Lesson 2a — was
not chosen here because a `Button` in a real UI often needs its click
behavior decided at the moment it's created, inline, without a whole
new named class for every single button. A callback lets that behavior
be supplied as a value — here, a lambda — right where the button itself
is set up.

---

## Connect the Pieces

Lesson 2a's `MiniFramework` was one whole class inverting control.
`Button`/`ClickHandler` showed the same reversal, scoped down to one
specific piece of behavior, registered and invoked separately. The next
lesson (Event-Driven Programming) names the paradigm both examples
belong to.

## What Breaks Without This

Call `handler.onClick()` directly inside `setOnClickListener` itself,
right after storing it, instead of waiting for `simulatePress()`. Run
it yourself and see the real output — the handler now runs immediately
at registration time, before the button is ever actually "pressed,"
proving registration and invocation are supposed to be genuinely
separate moments.

## Exercises

1. Add a second button with a different lambda handler, and confirm
   each button's own handler runs independently.
2. Try passing `null` as the handler and calling `simulatePress()` —
   read the real `NullPointerException` this produces, and explain why.
3. Explain, in your own words, why `Button` doesn't need to know what
   its own handler actually does.

## Definition of Done

- [ ] You ran the example and saw both real output lines, in order.
- [ ] You completed Exercise 2 and saw the real
      `NullPointerException`.
- [ ] You can state, without looking back at this lesson, the two
      separate moments involved in using a callback.
