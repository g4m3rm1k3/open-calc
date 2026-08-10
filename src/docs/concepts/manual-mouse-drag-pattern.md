# Concept: Hand-Building a Drag Interaction (`mousedown`/`mousemove`/`mouseup` on `window`)

**What you'll understand by the end:** the real, three-event pattern behind every hand-built drag interaction — dragging a slider, resizing a panel, moving a window — and specifically why the *move* and *up* listeners are attached to the whole window, not the element the drag started on.

**Prerequisites:** `dom-add-event-listener.md`, `event-driven-ui-callbacks.md`.

## Setup

Any modern browser — no install needed.

## The Problem

A click-and-drag interaction spans three separate, real events, only the first of which happens on the element being dragged: the press (`mousedown`, on the handle itself), the movement (`mousemove`, which can happen anywhere the cursor travels — including well outside the original element's own bounds the instant the cursor moves fast or far), and the release (`mouseup`, also possibly anywhere). A listener attached only to the original element would stop receiving events the moment the cursor left it, breaking the drag the instant it moved too far or too fast.

## The Isolated Example

```javascript
const handle = document.getElementById("handle");
let dragState = null;

handle.addEventListener("mousedown", (event) => {
  dragState = { startX: event.clientX };

  function handleMouseMove(moveEvent) {
    const delta = moveEvent.clientX - dragState.startX;
    console.log(`dragging, delta=${delta}`);
  }
  function handleMouseUp() {
    console.log("mouseup, drag ended");
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);
});
```

**Real output, run this session** (a real mouse-down on the handle, three real move steps totaling +50px, then mouse-up):
```
mousedown at x=28
dragging, delta=16
dragging, delta=33
dragging, delta=50
mouseup, drag ended
```

**What this proves:** every `mousemove` while the button was held down produced a real, growing `delta`, tracking the cursor's actual movement from where the drag started — and the moment `mouseup` fired, both listeners were removed, confirmed by the log receiving nothing further no matter how the mouse moved afterward.

## Mechanical Walkthrough

- `handle.addEventListener("mousedown", ...)` — **(b) reappearing** `addEventListener` (`dom-add-event-listener.md`) — the *only* one of the three listeners attached to the actual element, since a press genuinely has to start on the handle itself.
- `dragState = { startX: event.clientX }` — **(c) already established** object-literal assignment; `event.clientX` — **(a) first appearance** — the cursor's real horizontal pixel position, relative to the browser's own viewport, at the exact moment of this event.
- `function handleMouseMove(moveEvent) {...}` declared *inside* the `mousedown` handler — **(a) first appearance** of this specific shape: a fresh closure created anew on every single `mousedown`, capturing that press's own `dragState` — necessary because a second, later drag needs its own independent `startX`, not one left over from a previous drag.
- `window.addEventListener("mousemove", handleMouseMove)` / `window.addEventListener("mouseup", handleMouseUp)` — **(b) reappearing** `addEventListener`, but **(a) first appearance of attaching to `window` specifically, mid-interaction, rather than to a fixed element up front** — this is the real answer to the Problem above: `window` receives every mouse event anywhere in the page, so the drag keeps tracking correctly no matter how far or fast the cursor travels past the handle's own original bounds.
- `window.removeEventListener("mousemove", handleMouseMove)` / `.removeEventListener("mouseup", handleMouseUp)` — **(a) first appearance** of `removeEventListener` — requires passing the *exact same function reference* that was registered, which is exactly why `handleMouseMove`/`handleMouseUp` were declared as named functions instead of inline arrow functions — an inline function passed to `addEventListener` could never be removed later, since a new, different function value would be created if written again at the `removeEventListener` call site.

## CS Lens

This is a small, real **finite state machine** — "idle" (before any `mousedown`), "dragging" (between `mousedown` and `mouseup`), back to "idle" — where entering the "dragging" state is exactly what causes the two extra listeners to be attached, and leaving it is exactly what causes them to be removed. The listeners' own presence *is* the state, not a separate flag tracked alongside them.

Also recognized in: every native OS-level drag-and-drop implementation (a window manager tracking a dragged window across the whole screen, not just its own original bounds), and the same general shape as `WHILE`/loop-body condition-tracking in this project's own G-code interpreter (Engine §5) — a real interaction or process that's "active" only between a clear start and end signal.

## SE Lens

The real, tempting shortcut — attaching `mousemove`/`mouseup` to the handle element itself, since that's simpler to reason about — is a real, common bug: it appears to work in casual testing (slow, careful mouse movements rarely leave a reasonably-sized element) and then fails unpredictably the moment a real user drags quickly, which is exactly the situation this project's own drag-to-resize interaction cannot afford to get wrong. Attaching to `window` costs nothing extra to write and removes the entire failure class. The real, ongoing responsibility this pattern adds: every `addEventListener` call made *inside* another handler needs a matching `removeEventListener`, or every past drag leaves a real, growing pile of listeners still attached and still running — the identical "you started it, you're on the hook to stop it" discipline `browser-resize-observer.md` already names for a different API.

## Connection

Builds on `dom-add-event-listener.md` and `event-driven-ui-callbacks.md`. Directly relevant to any hand-built slider, resizer, or draggable element — used in this project to resize a real panel by dragging its edge.

## Try It Yourself

1. Remove the `window.removeEventListener` calls from `handleMouseUp` (leave `handleMouseUp` itself in place) and perform two separate real drags — open the browser's own listener-count inspection (or just log a counter inside `handleMouseMove`) and confirm the *second* drag now logs twice as many move events per pixel moved — real, direct proof of what forgetting cleanup actually costs.
2. Change `window.addEventListener("mousemove", ...)` to attach to `handle` instead, then perform a real drag that moves the cursor faster than the (deliberately shrunk) handle's own width — confirm the drag visibly stops tracking the instant the cursor leaves the element, reproducing the Problem this pattern exists to solve.
3. Add a real `touchstart`/`touchmove`/`touchend` version alongside the mouse listeners (reading `event.touches[0].clientX` instead of `event.clientX`) and reason about why a real, shipped drag interaction typically needs both — or look up the newer, unified Pointer Events API (`pointerdown`/`pointermove`/`pointerup`) that was designed specifically to replace needing both at once.
