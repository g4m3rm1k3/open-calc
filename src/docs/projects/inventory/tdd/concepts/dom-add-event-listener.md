# Concept: `addEventListener`

**What you'll understand by the end:** how to register code that runs later, in response to a user action, rather than immediately when the page loads.

**Prerequisites:** `dom-get-element-by-id.md`, `javascript-arrow-functions.md`.

## Setup

Any modern browser. No install needed.

## The Problem

Code that runs top-to-bottom as a page loads can't react to something that hasn't happened yet — a click, sometime in the future, an unknown number of times, or possibly never. Something needs to register "when this happens, run this," and wait.

## The Isolated Example

```html
<button id="my-button">Click me</button>
<script>
  console.log("this runs immediately, on page load");

  document.getElementById("my-button").addEventListener("click", () => {
    console.log("this runs only when the button is actually clicked");
  });

  console.log("this also runs immediately, right after registering the listener");
</script>
```

**Real output on page load (before any click):**
```
this runs immediately, on page load
this also runs immediately, right after registering the listener
```

**Real output after clicking the button twice:**
```
this runs only when the button is actually clicked
this runs only when the button is actually clicked
```

**What this proves:** registering the listener did not run its callback — both `console.log`s around it ran immediately, in order, while the callback itself printed nothing until the button was actually clicked, and printed once per click, independent of when the page loaded.

## Mechanical Walkthrough

- `.addEventListener(eventName, callback)` — a method available on any DOM element, registering `callback` to run every time the named event happens on that specific element.
- `"click"` is one of many event names browsers recognize (others include `"input"`, `"submit"`, `"mouseover"`, `"keydown"`) — each corresponds to a real, distinct kind of user or browser action.
- The arrow function passed as `callback` is not called at the moment `.addEventListener` runs — it's only stored, to be invoked later, potentially many times (once per click), or never, if the button is never clicked.
- Multiple listeners can be registered on the same element for the same event — each one added runs independently when the event fires, not replacing an earlier one.

## CS Lens

This is the core mechanism of **event-driven programming**: registering a callback once, then letting an external event (here, a user action) trigger it an unknown number of times in the future, rather than the program dictating exactly when that code runs.

Also recognized in: every GUI toolkit that has ever existed, game input handling, and a real CNC controller's physical "Cycle Start" button — register the response once, react every time it's pressed, for as long as the machine stays powered on.

## SE Lens

The alternative — a page with no event listeners, only ever running code once at load time — cannot react to anything a user does after the page finishes loading; it would need to be manually reloaded to run any new code, an obviously unworkable UI. `addEventListener` (as opposed to older approaches like setting an element's `onclick` attribute directly) also allows *multiple* independent listeners on the same event without one overwriting another — a real, meaningful advantage once more than one piece of code cares about the same user action.

## Connection

Builds on `dom-get-element-by-id.md` (finding the element to attach to) and `javascript-arrow-functions.md` (the near-universal style for the callback itself). Directly enables `event-driven-ui-callbacks.md`'s broader framing of this same mechanism.

## Try It Yourself

1. Register two separate listeners for `"click"` on the same button, each logging a different message. Confirm both run, in the order they were registered, on a single click.
2. Use `.removeEventListener("click", callback)` to un-register a listener after it's fired three times (track a counter inside the callback). Note that `removeEventListener` requires passing the *same* function reference used in `addEventListener` — try it with an anonymous arrow function first, notice it doesn't work, then fix it by naming the function and passing the same reference to both calls.
3. Attach a listener for `"keydown"` to the whole page (`document.addEventListener("keydown", ...)`) instead of one button, and log which key was pressed using the callback's own event argument (`(event) => console.log(event.key)`) — the callback receives real information about the event, not just a signal that "something happened."
