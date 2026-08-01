# SE Masterclass — LAB-70 — Render Loops

**Prerequisites:** LAB-69 (Coordinate Systems)

## Quick Check

Before starting, answer these (answers at the bottom):

1. If `setInterval(fn, 16)` and the browser's actual frame rate is 144Hz, what happens?
2. Why does frame-rate-dependent movement (`x += 5` per frame) break when the frame rate changes?
3. What's the difference between "update" and "render" in a game/simulation loop?

## What You Will Build

A running dot that moves at a constant speed of 100 pixels/second — identically, whether the browser renders at 30fps, 60fps, or 144fps. You'll watch the frame counter and the dot's position decouple from each other.

```
Frame 1  dt=0.0000s  x=200.0
Frame 2  dt=0.0163s  x=201.6
Frame 3  dt=0.0169s  x=203.3
Frame 4  dt=0.0158s  x=204.9
...
elapsed: 2.00s  x=400.0  (moved exactly 200px in 2 seconds, regardless of frame count)
```

## Concept: The Render Loop

**What it is:** A render loop is a function that the browser calls once per display refresh, forever, via `requestAnimationFrame`. Each call is a "tick" — you update state, then draw it.

**The problem before:** Every earlier lab in this curriculum reacted to *events* — a click, a keypress, a signal changing (LAB-32). Nothing had to happen if nothing changed. Graphics and simulation are different: the world keeps moving even if the user does nothing. A physics simulation, an animation, a game — all of them need something to happen 60 times a second with no external trigger. `setInterval(fn, 16)` looks like the answer, but it's not tied to the display's actual refresh rate, drifts under load, and keeps firing in background tabs, burning battery for frames nobody sees.

**The solution:** `requestAnimationFrame(callback)` asks the browser to call `callback` right before the next repaint — synced to the actual display refresh rate (60Hz, 120Hz, 144Hz, whatever the monitor does), automatically paused in background tabs, and it hands you a timestamp for free. You call it again inside the callback to keep the loop going — a self-scheduling recursive tick, not a fixed-interval timer.

**Canonical example:**

```typescript
function tick(timestampMs: number) {
  // do work with timestampMs
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
```

**Project Application:** Every lab for the rest of Phase 6 — the 2D renderer (LAB-71), the physics sandbox (LAB-76), the pathfinding visualizer (LAB-79) — runs inside a loop built here. This lab is the heartbeat everything else beats against.

**Watch for:** Frame-rate-dependent movement. If you write `x += 5` inside the tick callback with no regard for time, a 30fps machine moves the object half as fast (in real seconds) as a 144fps machine — same code, different physics, depending on whose laptop is running it.

## Step 1: The naive loop — and why it lies to you

```typescript
let x = 0
let frameCount = 0

function naiveTick() {
  x += 5              // "move 5 pixels" — but per WHAT?
  frameCount++
  console.log(`frame ${frameCount}: x=${x}`)
  requestAnimationFrame(naiveTick)
}
requestAnimationFrame(naiveTick)
```

### SAVE AND TRY

Run this in two browser tabs side by side, or throttle one via DevTools' "CPU: 6x slowdown." The throttled tab's dot crawls — same `x += 5`, same code, half the real-world speed. The bug isn't in the math. It's that "5 pixels per frame" silently means "5 pixels per *however-often-my-machine-happens-to-call-this*."

## Step 2: Delta time — decoupling speed from frame rate

`requestAnimationFrame` passes your callback a high-resolution timestamp (milliseconds since the page loaded). The fix is to measure the *time elapsed* since the last frame — "delta time," or `dt` — and scale movement by it.

```typescript
let x = 0
let lastTimestamp: number | null = null

function tick(timestampMs: number) {
  if (lastTimestamp === null) {
    lastTimestamp = timestampMs
    requestAnimationFrame(tick)
    return
  }

  const dtSeconds = (timestampMs - lastTimestamp) / 1000
  lastTimestamp = timestampMs

  const speedPxPerSecond = 100
  x += speedPxPerSecond * dtSeconds

  console.log(`dt=${dtSeconds.toFixed(4)}s  x=${x.toFixed(1)}`)
  requestAnimationFrame(tick)
}
requestAnimationFrame(tick)
```

Now `x` advances by `100 * dt` every frame. On a 60fps machine, `dt ≈ 0.0167`, so `x` grows by `~1.67` per frame — 60 times a second, totaling 100px/second. On a 144fps machine, `dt ≈ 0.0069`, `x` grows by `~0.69` per frame, 144 times a second — still 100px/second. Different frame counts, identical real-world speed.

### SAVE AND TRY

Throttle the tab again ("CPU: 6x slowdown" in DevTools). `frameCount` drops, but if you log elapsed real time versus `x`, the ratio stays locked at 100px/second. The dot moves at the same *speed*, just with choppier, more infrequent updates — which is the correct trade-off. Frame rate should affect smoothness, never correctness.

## Step 3: Update/render separation

Real loops split into two phases: **update** (advance simulation state using `dt`, no drawing) and **render** (draw the current state, no state changes). Keeping them separate means you can later update at a fixed rate while rendering at a variable rate (a pattern used by every serious game engine, out of scope here but worth naming), and it keeps your simulation logic testable without a canvas at all — pure functions of `(state, dt) → state`.

```typescript
import { Vector2 } from "../module-01-math/LAB-67-vectors"

interface SimState {
  position: Vector2
  velocity: Vector2
}

function update(state: SimState, dtSeconds: number): SimState {
  return {
    position: state.position.add(state.velocity.scale(dtSeconds)),
    velocity: state.velocity,
  }
}

function render(state: SimState, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  ctx.beginPath()
  ctx.arc(state.position.x, state.position.y, 8, 0, Math.PI * 2)
  ctx.fill()
}

function makeLoop(initial: SimState, ctx: CanvasRenderingContext2D) {
  let state = initial
  let lastTimestamp: number | null = null

  function tick(timestampMs: number) {
    if (lastTimestamp !== null) {
      const dtSeconds = (timestampMs - lastTimestamp) / 1000
      state = update(state, dtSeconds)
      render(state, ctx)
    }
    lastTimestamp = timestampMs
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
```

`update` never touches the canvas. `render` never mutates `state`. This is the same discipline as LAB-32's signals (read vs write) and LAB-36's virtual DOM (diff vs paint) — separate the decision from the effect.

### SAVE AND TRY

Comment out the `render(state, ctx)` call and instead `console.log(state.position.toString())` once per second (guard with an accumulator). You'll see the position keeps advancing correctly even with nothing drawn — proof `update` doesn't depend on rendering happening at all.

## Step 4: Guarding against huge dt spikes

Switch browser tabs for five seconds, then switch back. `requestAnimationFrame` pauses in background tabs, so the next callback arrives with `dt = 5.0` — your dot teleports 500 pixels in one frame. Clamp it.

```typescript
function tick(timestampMs: number) {
  if (lastTimestamp !== null) {
    const rawDt = (timestampMs - lastTimestamp) / 1000
    const dtSeconds = Math.min(rawDt, 1 / 30) // never simulate more than one 30fps-equivalent step
    state = update(state, dtSeconds)
    render(state, ctx)
  }
  lastTimestamp = timestampMs
  requestAnimationFrame(tick)
}
```

This trades perfect accuracy (the object "loses" the 4.97 seconds it should have moved) for stability (it doesn't jump off-screen). For a physics simulation, an unclamped spike can push objects through walls entirely — LAB-73 will hit this exact issue with collision.

### SAVE AND TRY

Remove the clamp, switch tabs for a few seconds, switch back, and watch the dot jump far past where it should be. Restore the clamp and repeat — it resumes smoothly from close to where it left off instead.

## 🎯 Challenge

Build a frame-rate counter overlay: track how many `tick` calls happened in the last real second (not an assumption — measured), and display it. Use an accumulator pattern: sum `dt` and count frames until the accumulator crosses `1.0`, then report and reset.

<details>
<summary>Solution</summary>

```typescript
let fpsAccumulatorSeconds = 0
let fpsFrameCount = 0
let currentFps = 0

function tick(timestampMs: number) {
  if (lastTimestamp !== null) {
    const dtSeconds = Math.min((timestampMs - lastTimestamp) / 1000, 1 / 30)
    state = update(state, dtSeconds)
    render(state, ctx)

    fpsAccumulatorSeconds += dtSeconds
    fpsFrameCount++
    if (fpsAccumulatorSeconds >= 1.0) {
      currentFps = fpsFrameCount
      fpsFrameCount = 0
      fpsAccumulatorSeconds = 0
      console.log(`FPS: ${currentFps}`)
    }
  }
  lastTimestamp = timestampMs
  requestAnimationFrame(tick)
}
```

The accumulator only resets after a full real second has passed, so `currentFps` is a true "calls per second" measurement, not a guess.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Movement | `x += 5` per frame | `x += speed * dt` per frame |
| Timer | `setInterval(fn, 16)` | `requestAnimationFrame(tick)` |
| Loop structure | Update and draw mixed together | `update(state, dt)` then `render(state)`, kept separate |
| Tab switch | Assume dt is always small | Clamp dt to avoid simulation spikes |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | What does `requestAnimationFrame` sync to that `setInterval` doesn't? | |
| 2 | Why multiply movement by `dt` instead of a fixed constant? | |
| 3 | What breaks if you skip clamping `dt`? | |

## Quick Check Answers

1. `setInterval(fn, 16)` fires roughly every 16ms regardless of the display's actual refresh rate — on a 144Hz screen it fires far less often than the display refreshes, causing visibly choppy motion; it also keeps firing in background tabs.
2. Frame-rate-dependent movement means "distance per frame," but frames-per-second varies by machine and load — the same code produces different real-world speeds on different hardware.
3. Update advances simulation state using elapsed time (`dt`) and touches no pixels; render draws the current state to the screen and changes no state. Separating them keeps simulation logic testable and reusable independent of how (or whether) it's drawn.

*Next: [LAB-71 — 2D Renderer](LAB-71-2d-renderer.md)*
