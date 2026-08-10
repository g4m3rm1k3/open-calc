# Concept: `requestAnimationFrame` and the Continuous Render Loop

**What you'll understand by the end:** how to make something redraw smoothly and continuously in a browser, and why this is the standard alternative to a fixed timer for anything visual.

**Prerequisites:** `event-loop.md`.

## Setup

Any browser with a JavaScript console — no install needed.

## The Problem

Anything that needs to visually update continuously — an animation, a live chart, a camera that responds to user input over time — needs to redraw repeatedly, ideally exactly as often as the browser can actually display a new frame, and no more often than that (extra work beyond what can be displayed is pure waste, and can make a page's other work compete for time it doesn't need to spend).

## The Isolated Example

```javascript
let frameCount = 0;
const start = performance.now();

function tick() {
    frameCount++;
    if (performance.now() - start < 1000) {
        requestAnimationFrame(tick);
    } else {
        console.log(`${frameCount} frames in ~1 second`);
    }
}

requestAnimationFrame(tick);
```

**Real output, in a typical browser on typical hardware:**
```
60 frames in ~1 second
```

**Compared to a fixed timer running as fast as the loop allows:**
```javascript
let count = 0;
const start = performance.now();
function tickTimer() {
    count++;
    if (performance.now() - start < 1000) {
        setTimeout(tickTimer, 0);
    } else {
        console.log(`${count} iterations in ~1 second (setTimeout(0))`);
    }
}
setTimeout(tickTimer, 0);
```
**Real output (varies by browser, typically far higher):**
```
1000+ iterations in ~1 second (setTimeout(0))
```

**What this proves:** `requestAnimationFrame` self-limited to almost exactly the display's real refresh rate (60 times per second, matching a typical 60Hz monitor) with zero configuration — a `setTimeout`-based loop, given no natural rate limit, ran far more often, doing needless extra work no display could ever actually show.

## Mechanical Walkthrough

- `requestAnimationFrame(callback)` schedules `callback` to run exactly once, immediately *before* the browser's next actual repaint — not on a fixed time interval, but synchronized to the display's own real refresh cycle.
- Calling `requestAnimationFrame` again *from inside* the callback (as `tick` does, calling itself) is what creates a continuous, ongoing loop — there is no separate "start looping forever" API; the loop is simply each frame re-scheduling the next one, and it stops the moment a frame chooses not to reschedule.
- Because it's tied to actual display repaints, a `requestAnimationFrame` loop automatically slows down (or pauses entirely) when a browser tab is backgrounded or minimized — the browser has no reason to keep computing frames nothing is currently displaying, a real, automatic efficiency `setTimeout`-based loops don't get for free.
- This callback runs on the same single JavaScript thread/event loop (see `event-loop.md`) as everything else — a slow `tick` function still blocks other work exactly as any other synchronous code would; `requestAnimationFrame` changes *when* code runs, not the underlying single-threaded execution model.

## CS Lens

This is a **continuous render loop** — the general shape of "run this repeatedly, forever, reacting to whatever the current state is" applied specifically to visual redraws, synchronized to hardware refresh timing rather than an arbitrary fixed interval. It is a specialized instance of the same self-scheduling-callback idea a game engine's own main loop, or any real-time simulation's update cycle, is built from.

Also recognized in: every real-time game's core loop (update state, render, repeat — usually targeting a specific frame rate like 60fps), video playback's own frame-pacing logic, and, at a more abstract level, a server's own defining shape — a program that starts, then waits, forever, in a loop, for the next request — the identical repeat-forever structure applied to network requests instead of screen redraws.

## SE Lens

Choosing `requestAnimationFrame` over a fixed-interval timer (`setInterval`/`setTimeout`) for anything visual is a real, concrete performance and correctness improvement, not a stylistic preference: a fixed timer set faster than the display can actually show wastes CPU/GPU work no one will ever see, while one set slower produces visibly choppy motion — `requestAnimationFrame` sidesteps having to guess the right interval at all, since it's driven directly by the display's own real capability.

## Connection

Builds on `event-loop.md`. Used to drive `threejs-renderer-scene-camera.md`'s `renderer.render(scene, camera)` call continuously, and to keep `threejs-orbitcontrols.md`'s damped camera motion progressing smoothly frame over frame.

## Try It Yourself

1. Add a deliberately slow, blocking operation (a tight loop doing pointless work for a few milliseconds) inside a `requestAnimationFrame` callback, and observe the resulting visual stutter in any animation running alongside it — direct, visible proof that this API does not run on a separate thread from the rest of the page's JavaScript.
2. Log `performance.now()` at the start of each `tick` call and compute the time delta between consecutive frames — confirm it hovers close to `16.6ms` (1000ms / 60) on a typical 60Hz display, and reason about what a delta far larger than that would indicate (a dropped frame, or blocking work delaying the callback).
3. Minimize or switch away from the browser tab running a `requestAnimationFrame` loop for several seconds, then switch back and check the accumulated `frameCount` — confirm it grew far more slowly than 60-per-second while backgrounded, demonstrating the browser's automatic throttling of frames nothing was displaying.
