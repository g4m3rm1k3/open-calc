# SE Masterclass — LAB-73 — Physics Fundamentals

**Prerequisites:** LAB-72 (Painter's Algorithm)

## Quick Check

Before starting, answer these (answers at the bottom):

1. What's the difference between position, velocity, and acceleration?
2. Why does Euler integration lose accuracy with larger time steps?
3. When a ball bounces off a wall, which component of its velocity flips — and which stays the same?

## What You Will Build

A ball falling under gravity, bouncing off the floor and walls of a canvas, losing a little energy on each bounce — all driven by LAB-70's render loop and drawn with LAB-71's renderer.

```
t=0.00s  pos=(200, 50)   vel=(80, 0)
t=0.50s  pos=(240, 173)  vel=(80, 245)
t=1.00s  pos=(280, 380)  vel=(80, 490)
t=1.10s  pos=(288, 400)  vel=(80, -441)   <- hit floor, y-velocity flipped and dampened
```

## Concept: Physics Simulation

**What it is:** At the level this lab covers, physics simulation is three ideas stacked on each other: a **force** changes **acceleration** (Newton's second law, `F = ma`), acceleration changes velocity over time, and velocity changes position over time. Simulating physics means repeating that chain every frame, using LAB-70's `dt`.

**The problem before:** LAB-70's example moved a dot at a constant speed — `position += velocity * dt`. That's motion, but not physics: nothing was pushing on it, and it never sped up, slowed down, or interacted with anything. Real motion (falling, bouncing, being thrown) requires velocity itself to change over time, driven by forces like gravity.

**The solution:** Track two vectors per object — `position` and `velocity` — plus one derived-per-frame vector, `acceleration`, computed from whatever forces act this frame (usually just gravity, here). Each frame: turn forces into acceleration, apply acceleration to velocity, apply velocity to position. This three-step chain is called **Euler integration**, the simplest possible numerical integrator, and it's exactly the `update` function LAB-70 Step 3 already separated out from rendering.

**Canonical example:**

```typescript
function step(body: Body, dtSeconds: number): Body {
  const acceleration = new Vector2(0, GRAVITY)
  const newVelocity = body.velocity.add(acceleration.scale(dtSeconds))
  const newPosition = body.position.add(newVelocity.scale(dtSeconds))
  return { position: newPosition, velocity: newVelocity }
}
```

**Project Application:** LAB-74's ECS architecture will turn this exact `step` function into a reusable "physics system" that runs over every entity with a `Velocity` component. LAB-76's physics sandbox is this lab, extended to many bodies.

**Watch for:** Applying forces without multiplying by `dt`. `velocity += acceleration` (no `dt`) makes the simulation frame-rate dependent again — precisely the bug LAB-70 spent a whole lab eliminating from position updates. Every force application needs the same `dt` scaling as movement did.

## Step 1: Gravity and Euler integration

```typescript
import { Vector2 } from "../module-01-math/LAB-67-vectors"

interface Body {
  position: Vector2
  velocity: Vector2
}

const GRAVITY = 500 // pixels/second^2 — downward, positive-y-down (LAB-69's screen convention)

function stepPhysics(body: Body, dtSeconds: number): Body {
  const acceleration = new Vector2(0, GRAVITY)
  const newVelocity = body.velocity.add(acceleration.scale(dtSeconds))
  const newPosition = body.position.add(newVelocity.scale(dtSeconds))
  return { position: newPosition, velocity: newVelocity }
}
```

This is called Euler integration because it approximates continuous motion with discrete steps — assume velocity is constant *within* this one frame's `dt`, apply it, move on. It's an approximation, not the true continuous solution, and the approximation error grows with `dt`.

### SAVE AND TRY

Simulate manually: `let body = { position: new Vector2(0, 0), velocity: new Vector2(0, 0) }`, then call `body = stepPhysics(body, 1/60)` sixty times in a loop and log `body.velocity.y` each time. It climbs steadily toward `500` (one second of `GRAVITY = 500`) — confirming velocity accumulates acceleration over time, exactly like a dropped object speeding up.

## Step 2: Large time steps break accuracy

```typescript
let bodySmallSteps: Body = { position: new Vector2(0, 0), velocity: new Vector2(0, 0) }
for (let i = 0; i < 10; i++) bodySmallSteps = stepPhysics(bodySmallSteps, 0.1) // 10 steps of 0.1s

let bodyOneStep: Body = { position: new Vector2(0, 0), velocity: new Vector2(0, 0) }
bodyOneStep = stepPhysics(bodyOneStep, 1.0) // 1 step of 1.0s

console.log(bodySmallSteps.position.y, bodyOneStep.position.y)
// Both "simulate 1 second," but land on different positions.
```

Both runs cover the same total time, but they don't agree, because Euler integration assumes constant velocity *within* each step — the coarser the step, the more that assumption diverges from reality (real velocity is changing continuously, not in jumps). This is why LAB-70's `dt` clamp (Step 4, capping spikes at `1/30`) matters even more here: an unclamped 5-second `dt` spike wouldn't just teleport an object, it would badly mis-simulate its physics for that frame.

### SAVE AND TRY

Run the snippet above and compare the two `position.y` values — they differ, even though both claim to simulate exactly 1 second of fall time. Smaller steps track the true (continuous) trajectory more closely; this is the accuracy/performance trade-off every physics engine makes explicitly.

## Step 3: Collision with boundaries

```typescript
interface Bounds { width: number; height: number }

function resolveBoundaryCollision(body: Body, radius: number, bounds: Bounds, restitution = 0.7): Body {
  let { position, velocity } = body

  if (position.x - radius < 0) {
    position = new Vector2(radius, position.y)
    velocity = new Vector2(-velocity.x * restitution, velocity.y)
  } else if (position.x + radius > bounds.width) {
    position = new Vector2(bounds.width - radius, position.y)
    velocity = new Vector2(-velocity.x * restitution, velocity.y)
  }

  if (position.y - radius < 0) {
    position = new Vector2(position.x, radius)
    velocity = new Vector2(velocity.x, -velocity.y * restitution)
  } else if (position.y + radius > bounds.height) {
    position = new Vector2(position.x, bounds.height - radius)
    velocity = new Vector2(velocity.x, -velocity.y * restitution)
  }

  return { position, velocity }
}
```

A bounce flips the velocity component *perpendicular* to the wall (hit the floor, flip `y`; hit a side wall, flip `x`) and leaves the *parallel* component untouched (hit the floor, `x` velocity is unaffected — a ball rolling sideways keeps rolling sideways after it bounces). `restitution` (`0.7`) scales the flipped velocity down, so each bounce loses energy instead of bouncing forever at full height — set it to `1.0` for a perfectly elastic, endless bounce, and watch why that looks physically wrong.

### SAVE AND TRY

Drop a ball from the top of a 400px-tall canvas with `restitution = 0.7` and let it run for ~10 seconds inside LAB-70's loop. Each bounce reaches a lower peak than the last, settling near the floor — change `restitution` to `1.0` and it bounces at the same height forever, never settling, which makes the energy-loss role of `restitution` immediately visible.

## Step 4: Wiring it into the render loop

```typescript
import { drawShape } from "../module-02-rendering/LAB-71-2d-renderer"

function makePhysicsLoop(ctx: CanvasRenderingContext2D, bounds: Bounds) {
  let body: Body = { position: new Vector2(200, 50), velocity: new Vector2(80, 0) }
  const radius = 15
  let lastTimestamp: number | null = null

  function tick(timestampMs: number) {
    if (lastTimestamp !== null) {
      const dtSeconds = Math.min((timestampMs - lastTimestamp) / 1000, 1 / 30)
      body = stepPhysics(body, dtSeconds)
      body = resolveBoundaryCollision(body, radius, bounds)

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      drawShape(ctx, { kind: "circle", center: body.position, radius, color: "orange" })
    }
    lastTimestamp = timestampMs
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
```

Note the order: integrate first (move the body according to its current velocity), *then* resolve collisions (check if that move put it somewhere invalid, and correct it). Resolving collisions before integrating would check against last frame's stale position.

### SAVE AND TRY

Run `makePhysicsLoop`. Watch the ball fall, bounce off the floor with diminishing height, and also bounce off the left/right walls if it has horizontal velocity when it reaches them (from the initial `vel=(80, 0)`) — both collision axes work independently, exactly as Step 3's per-axis logic intended.

## 🎯 Challenge

Add drag (air resistance): a force that always opposes velocity, proportional to speed, so the ball's horizontal motion gradually slows even without wall bounces. Apply it as an additional acceleration term before gravity.

<details>
<summary>Solution</summary>

```typescript
const DRAG_COEFFICIENT = 0.3

function stepPhysicsWithDrag(body: Body, dtSeconds: number): Body {
  const gravity = new Vector2(0, GRAVITY)
  const drag = body.velocity.scale(-DRAG_COEFFICIENT) // opposes current velocity direction
  const acceleration = gravity.add(drag)

  const newVelocity = body.velocity.add(acceleration.scale(dtSeconds))
  const newPosition = body.position.add(newVelocity.scale(dtSeconds))
  return { position: newPosition, velocity: newVelocity }
}
```

`body.velocity.scale(-DRAG_COEFFICIENT)` always points opposite to the current velocity (negating it), so it constantly fights motion in whatever direction the body is currently moving — the defining property of drag, versus gravity, which always points the same way regardless of velocity.

</details>

## Mental Model

| Concept | Wrong instinct | Correct instinct |
|---|---|---|
| Applying gravity | `velocity.y += GRAVITY` | `velocity.y += GRAVITY * dt` |
| Simulation order | Check collisions, then move | Move (integrate), then check collisions |
| Bounce | Flip both velocity components | Flip only the component perpendicular to the wall |
| Energy loss | `restitution = 1.0` forever | `restitution < 1.0` so bounces settle |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | What are the three quantities chained together in Euler integration? | |
| 2 | Why integrate position before resolving collisions, not after? | |
| 3 | Why does a floor bounce only flip `velocity.y`, not `velocity.x`? | |

## Quick Check Answers

1. Position is where something is; velocity is how fast position is changing; acceleration is how fast velocity is changing — each is the rate of change of the one before it.
2. Larger time steps assume velocity stays constant across a bigger span of "real" time, and real acceleration keeps changing velocity continuously within that span — the assumption drifts further from reality as the step grows.
3. Horizontal velocity flips off a side wall (vertical surface); vertical velocity flips off floor/ceiling (horizontal surface) — each bounce flips only the velocity component perpendicular to the surface it hit, leaving the parallel component (sideways rolling motion) unaffected.

*Next: [LAB-74 — ECS Architecture](LAB-74-ecs-architecture.md)*
