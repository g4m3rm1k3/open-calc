# Concept: Event-Driven UI Programming

**What you'll understand by the end:** the general programming model where a UI's behavior is expressed as a set of independent, registered reactions to events, rather than one linear top-to-bottom script.

**Prerequisites:** `dom-add-event-listener.md`, `event-loop.md`.

## Setup

Any modern browser. No install needed.

## The Problem

A traditional script runs its instructions once, in order, and finishes. A user interface doesn't work that way — it needs to keep responding to arbitrary, unpredictably-ordered user actions (clicks, typing, in any sequence, any number of times) for as long as the page stays open, without the code dictating exactly when any of them happen.

## The Isolated Example

```html
<button id="a">A</button>
<button id="b">B</button>
<p id="log"></p>
<script>
  let clickCount = 0;
  const log = document.getElementById("log");

  document.getElementById("a").addEventListener("click", () => {
    clickCount++;
    log.textContent = `A clicked (total clicks: ${clickCount})`;
  });

  document.getElementById("b").addEventListener("click", () => {
    clickCount++;
    log.textContent = `B clicked (total clicks: ${clickCount})`;
  });
</script>
```

**Real behavior, clicking B, then A, then A again:**
```
B clicked (total clicks: 1)
A clicked (total clicks: 2)
A clicked (total clicks: 3)
```

**What this proves:** nothing in the script dictated an order — the two listeners are entirely independent, and the actual sequence of messages was determined purely by which button the user happened to click, in whatever order and however many times they chose. `clickCount`, a single shared variable, is the only thing connecting the two otherwise-separate reactions.

## Mechanical Walkthrough

- Two independent `addEventListener` registrations run once, at page load, in the order written — but registering them is not the same as running their callbacks; neither callback executes until its specific event actually occurs.
- Both callbacks share access to `clickCount` (a **closure** over the same outer variable) — each one's update is visible to the other, since they're not separate, isolated copies.
- The page, after setup finishes, sits idle — the underlying event loop (see `event-loop.md`) is what's actually waiting and dispatching to whichever listener matches whatever the user does next.

## CS Lens

**Event-driven programming**: describing a program's behavior as a set of independent reactions to named events, rather than one sequential procedure. Control flow is inverted compared to an ordinary script — instead of the program's own code deciding what runs next, the *events themselves*, arriving in whatever order they happen to arrive, determine it.

Also recognized in: every GUI toolkit that has ever existed, game engines' input handling, server-side event loops (see `event-loop.md`) reacting to incoming requests instead of user clicks, and a real CNC controller reacting to physical panel buttons (Cycle Start, Feed Hold, jog buttons) in whatever order an operator happens to press them.

## SE Lens

The alternative — a single procedure asking "what should happen next?" and blocking for input at each decision point — cannot represent a UI with several independent controls a user might interact with in any order (click A, then B, then A again, or never touch B at all). Event-driven structure handles that naturally: each control's behavior is defined once, independently, and the browser's own event loop handles the "what happens in what order" question entirely, driven by real user behavior rather than a script's assumptions about it.

## Connection

Builds directly on `dom-add-event-listener.md` and `event-loop.md` — this file is the general framing that ties both together as one coherent programming model, rather than two separate, unrelated facts.

## Try It Yourself

1. Add a third button whose listener reads and resets `clickCount` to `0`. Click A and B a few times, then the reset button, then A again — confirm the count genuinely resets and continues correctly from zero.
2. Remove the shared `clickCount` variable and give each button its own separate counter instead. Observe that the two buttons' counts now track independently — a concrete demonstration of what sharing versus not sharing state between callbacks actually changes.
3. Add a `"keydown"` listener on the whole document, alongside the two button click listeners, all coexisting. Interact with all three in whatever order you like, and confirm each reacts independently with no listener needing to know the others exist.
