# Concept: `ResizeObserver`

**What you'll understand by the end:** how to react, in real time, to an element's actual rendered size changing — for any reason at all, not just a browser window resize.

**Prerequisites:** none.

## Setup

Any modern browser — `ResizeObserver` is a real, built-in global class, no import or install needed.

## The Problem

An element's real, rendered size can change for reasons that have nothing to do with the browser window resizing — a CSS layout change, a sibling element appearing or disappearing, a flex/grid container reflowing. Code that needs to react to an element's *actual* size — a `<canvas>` that has to redraw at its new real pixel dimensions, for instance — needs a real, direct signal for exactly that, not an indirect proxy like listening for the whole window's `resize` event and hoping the element in question happened to change too.

## The Isolated Example

```html
<div id="box" style="width: 300px; height: 100px;"></div>
<pre id="log"></pre>
<script>
  const log = document.getElementById("log");
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      log.textContent += `size: ${Math.round(entry.contentRect.width)}x${Math.round(entry.contentRect.height)}\n`;
    }
  });
  observer.observe(document.getElementById("box"));
</script>
```

**Real output, run this session** (the script above, then `#box`'s width/height changed to `500px`/`220px` via JavaScript, with no window resize involved at all):
```
size: 300x100
size: 500x220
```

**What this proves:** the callback fired twice — once immediately, reporting the element's real starting size the moment `observe()` was called, and again after its size actually changed, with the real, new dimensions — confirmed correct even though nothing about the browser window itself was ever touched.

## Mechanical Walkthrough

- `new ResizeObserver((entries) => {...})` — **(a) first appearance** — constructs a real observer, given a callback that runs every time *any* observed element's size changes. `entries` is an array (not a single value) since one observer can watch multiple elements at once, and a single callback firing can report changes to more than one of them together.
- `observer.observe(element)` — **(a) first appearance** — starts watching a specific real DOM element; the callback fires once immediately with the element's current size (confirmed above — the very first log line reflects the *starting* size, before any real change happened), then again every time it actually changes.
- `entry.contentRect.width` / `.height` — **(a) first appearance** — the real, current size of the observed element's content box, read directly from the entry the browser provides — not something the calling code has to measure itself with `clientWidth`/`clientHeight` after the fact.

## Execution Trace

Two real callback firings, traced against the real output above:

- observer.observe(box) called
  → callback fires immediately (1st firing), entries = [one entry for #box]
  → entry.contentRect = {width: 300, height: 100} (the element's starting size)
  → for (const entry of entries): one iteration, logs "size: 300x100"

- #box's width/height changed to 500px/220px via JavaScript
  → browser detects the real size change, schedules the callback again
  → callback fires (2nd firing), entries = [one entry for #box]
  → entry.contentRect = {width: 500, height: 220} (the new size)
  → for (const entry of entries): one iteration, logs "size: 500x220"

The `for...of` loop inside the callback runs exactly once per firing here
(one observed element), but its real job is handling *however many*
entries one firing reports — a single `ResizeObserver` watching three
elements, all resized in the same browser paint frame, would deliver all
three in one `entries` array to one callback call, not three separate
calls.

## CS Lens

This is the **observer pattern**, the same general idea `event-driven-ui-callbacks.md` already names for click events, applied here to a continuously-monitored *property* (size) rather than a discrete user action — closer in kind to a file-system watcher (react to a file changing, whenever that happens, for whatever reason) than to a single click.

Also recognized in: `MutationObserver` (the DOM's sibling API for watching element/attribute changes generally), `IntersectionObserver` (watching whether an element is visible in the viewport), and any reactive framework's own dependency-tracking system, which is fundamentally the same "run this again when the thing it depends on changes" idea.

## SE Lens

The real alternative — listening for the window's own `resize` event and re-measuring the element by hand — misses every real resize that isn't caused by the window itself changing (a sibling panel resizing, a CSS class toggling, content loading in) and adds a real, indirect measurement step `ResizeObserver` hands over directly. The real cost: an observer that's never disconnected keeps firing and holding a reference to its target for as long as both exist, a real, small cleanup responsibility — the same "you started watching, you're on the hook to stop" discipline already named for a subprocess (`node-child-process-spawn.md`) and a temp file (`python-tempfile.md`), applied here to a browser API instead.

## Connection

Builds on nothing new beyond the DOM. Directly relevant to this project's own real use: a Three.js `<canvas>` that must resize its renderer and update its camera's aspect ratio the moment its real container size changes — for any reason, including one that has nothing to do with the browser window itself resizing at all.

## Try It Yourself

1. Call `observer.observe()` on a *second* element too, resize both, and confirm the same callback receives both changes — inspect whether they arrive as one `entries` array with two entries, or two separate callback calls, by logging `entries.length`.
2. Call `observer.disconnect()` after the first real resize, then resize the element again, and confirm the log stops receiving new lines — real, direct proof that watching has a real "off" switch, and that forgetting to call it leaves the observer running indefinitely.
3. Compare `entry.contentRect.width` against the same element's `getBoundingClientRect().width` when the element has a real CSS `border` and `padding` — and explain, from what `contentRect` specifically means, why the two numbers can genuinely differ.
