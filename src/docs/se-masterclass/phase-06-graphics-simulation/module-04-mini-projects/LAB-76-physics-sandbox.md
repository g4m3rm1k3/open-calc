# SE Masterclass — LAB-76 — Physics Sandbox

**Prerequisites:** LAB-75 (Spatial Partitioning)

## Quick Check

Before starting, answer these (answers at the bottom):

1. In what order should a single simulation frame run: render, physics, collision — or physics, collision, render?
2. Why does resolving a collision between two moving circles need to push them apart, not just flip velocities?
3. Why does this lab reuse the ECS's `World` instead of one big array of "ball" objects?

## What You Will Build

A canvas full of 100+ balls, dropped in one at a time by clicking, all falling under gravity, bouncing off walls and each other, rendered live — every system this module built (ECS, physics, spatial partitioning, rendering, painter's algorithm) running together in one loop.

```
Click canvas -> spawns a ball entity at cursor position
Frame N: physicsSystem (LAB-73) -> collisionSystem via grid (LAB-75) -> renderSystem (LAB-71/74)
120 balls settled: ~1,800 candidate pairs checked/frame, not 7,140 (naive) -- still 60fps
```

## Concept: The Full Simulation Loop

**What it is:** This lab has no new concept of its own — it's the wiring lab. Everything from LAB-70 through LAB-75 (render loop, renderer, painter's algorithm, physics integration, ECS, spatial partitioning) is a piece; this lab assembles them into one running system and is where the pieces either fit together cleanly or expose a seam you glossed over.

**The problem before:** Each prior lab in Phase 6 proved its concept in isolation — LAB-73's physics ran on one hardcoded `Body`, LAB-74's ECS queried components with no physics attached, LAB-75's grid took a plain `Entity[]` with no rendering involved. None of them alone is "a simulation" — they're the separated concerns a simulation is built from, exactly the way LAB-09 through LAB-16 (Phase 1) each built one piece of a language toolchain before anything ran end-to-end.

**The solution:** One `World` (LAB-74), one render loop (LAB-70), and a fixed per-frame system order: integrate physics, detect and resolve collisions (using LAB-75's grid to keep it fast), then render (LAB-71, ordered by LAB-72 if depth ever matters). Every system reads and writes the same shared component data, so nothing needs a bespoke bridge between "the physics part" and "the drawing part" — they're both just systems over the same `World`.

**Canonical example:**

```typescript
function tick(dtSeconds: number) {
  physicsSystem(world, dtSeconds)
  collisionSystem(world, CELL_SIZE, resolveCollision)
  renderSystem(world, ctx)
}
```

**Project Application:** This is the last lab of Phase 6 and the template for LAB-77's CAD viewer and LAB-79's pathfinding visualizer — both reuse this "one `World`, fixed system order, one render loop" shape with different systems plugged in.

**Watch for:** Resolving collisions with only a velocity flip (LAB-73's wall-bounce logic) and no positional correction. Two circles that have already overlapped by the time collision is detected will keep re-triggering the same collision every frame if their positions aren't also pushed apart — an infinite jitter instead of a clean bounce.

## Step 1: Ball entities in the ECS

```typescript
import { World } from "../module-03-simulation/LAB-74-ecs-architecture"
import { Vector2 } from "../module-01-math/LAB-67-vectors"

interface Position { x: number; y: number }
interface Velocity { dx: number; dy: number }
interface Collider { radius: number }
interface Renderable { color: string }

function spawnBall(world: World, x: number, y: number): number {
  const ball = world.createEntity()
  world.addComponent<Position>(ball, "position", { x, y })
  world.addComponent<Velocity>(ball, "velocity", { dx: (Math.random() - 0.5) * 100, dy: 0 })
  world.addComponent<Collider>(ball, "collider", { radius: 10 + Math.random() * 10 })
  world.addComponent<Renderable>(ball, "renderable", { color: `hsl(${Math.random() * 360}, 70%, 50%)` })
  return ball
}
```

Each ball gets a random horizontal velocity and radius, so the sandbox immediately looks alive rather than a grid of identical dots — useful for visually confirming collisions are size-aware (LAB-75's `circlesOverlap` already accounts for each entity's own `radius`).

### SAVE AND TRY

```typescript
const world = new World()
for (let i = 0; i < 20; i++) spawnBall(world, 100 + i * 5, 50)
console.log(world.query("position", "velocity", "collider", "renderable").length) // 20
```

All 20 entities match a query for all four components at once — confirming `spawnBall` attaches a consistent, complete component set every time.

## Step 2: Physics and boundary bounce as systems

```typescript
const GRAVITY = 500
const RESTITUTION = 0.7

function physicsSystem(world: World, dtSeconds: number, bounds: { width: number; height: number }) {
  for (const entity of world.query("position", "velocity", "collider")) {
    const pos = world.getComponent<Position>(entity, "position")!
    const vel = world.getComponent<Velocity>(entity, "velocity")!
    const collider = world.getComponent<Collider>(entity, "collider")!

    vel.dy += GRAVITY * dtSeconds
    pos.x += vel.dx * dtSeconds
    pos.y += vel.dy * dtSeconds

    if (pos.x - collider.radius < 0) { pos.x = collider.radius; vel.dx = -vel.dx * RESTITUTION }
    else if (pos.x + collider.radius > bounds.width) { pos.x = bounds.width - collider.radius; vel.dx = -vel.dx * RESTITUTION }

    if (pos.y - collider.radius < 0) { pos.y = collider.radius; vel.dy = -vel.dy * RESTITUTION }
    else if (pos.y + collider.radius > bounds.height) { pos.y = bounds.height - collider.radius; vel.dy = -vel.dy * RESTITUTION }
  }
}
```

This is LAB-73's `stepPhysics` and `resolveBoundaryCollision`, rewritten as one ECS system operating on every matching entity instead of one hardcoded `Body` — the physics math is unchanged, only where it reads/writes data from (components, not a local variable) is different.

### SAVE AND TRY

Spawn 20 balls and call `physicsSystem(world, 1/60, { width: 600, height: 400 })` sixty times in a loop (simulating one second). Log any entity's `position` before and after — every ball's `y` increases (falling), and any that reached the floor (`y + radius > 400`) should show a reduced, flipped `vel.dy`.

## Step 3: Ball-vs-ball collision resolution

LAB-75's `collisionSystem` finds *which* pairs overlap; it doesn't yet say what to do about it. For two circles, the fix is to separate them along the line connecting their centers, proportional to how much they overlap, and reflect their velocities along that same line.

```typescript
function resolveBallCollision(world: World, idA: number, idB: number) {
  const posA = world.getComponent<Position>(idA, "position")!
  const posB = world.getComponent<Position>(idB, "position")!
  const colA = world.getComponent<Collider>(idA, "collider")!
  const colB = world.getComponent<Collider>(idB, "collider")!
  const velA = world.getComponent<Velocity>(idA, "velocity")!
  const velB = world.getComponent<Velocity>(idB, "velocity")!

  const delta = new Vector2(posB.x - posA.x, posB.y - posA.y)
  const distance = delta.magnitude() || 0.001 // avoid divide-by-zero for exactly-overlapping centers
  const overlap = colA.radius + colB.radius - distance
  if (overlap <= 0) return

  const normal = delta.normalize()

  // push apart, split the correction between both balls
  posA.x -= normal.x * overlap * 0.5
  posA.y -= normal.y * overlap * 0.5
  posB.x += normal.x * overlap * 0.5
  posB.y += normal.y * overlap * 0.5

  // swap the velocity component along the collision normal (equal-mass elastic collision)
  const relativeVelocity = (velB.dx - velA.dx) * normal.x + (velB.dy - velA.dy) * normal.y
  if (relativeVelocity > 0) return // already separating, don't add energy

  velA.dx += normal.x * relativeVelocity
  velA.dy += normal.y * relativeVelocity
  velB.dx -= normal.x * relativeVelocity
  velB.dy -= normal.y * relativeVelocity
}
```

The positional push (`overlap * 0.5` to each ball) is what LAB-73's wall-bounce didn't need — a wall never moves, but two overlapping balls both need to move apart, or they'll still be overlapping next frame and re-trigger the same collision endlessly, a visible jitter bug if this step is skipped.

### SAVE AND TRY

Place two balls of radius 10 with centers 15px apart (so they overlap by 5px) and zero velocity, call `resolveBallCollision`, then check their positions — they should now be exactly `20px` apart (`colA.radius + colB.radius`), pushed apart symmetrically, with no leftover overlap.

## Step 4: Wiring it all together

```typescript
import { UniformGrid } from "../module-03-simulation/LAB-75-spatial-partitioning"
import { drawShape } from "../module-02-rendering/LAB-71-2d-renderer"

function collisionSystem(world: World, cellSize: number) {
  const entities = world.query("position", "collider")
  const grid = new UniformGrid(cellSize)
  const positions = new Map<number, Position>()

  for (const id of entities) {
    const pos = world.getComponent<Position>(id, "position")!
    positions.set(id, pos)
    grid.insert({ id, x: pos.x, y: pos.y, radius: world.getComponent<Collider>(id, "collider")!.radius })
  }

  const checked = new Set<string>()
  for (const id of entities) {
    const pos = positions.get(id)!
    for (const candidateId of grid.neighborCellEntities(pos.x, pos.y)) {
      if (candidateId === id) continue
      const key = [id, candidateId].sort((a, b) => a - b).join(",")
      if (checked.has(key)) continue
      checked.add(key)
      resolveBallCollision(world, id, candidateId)
    }
  }
}

function renderSystem(world: World, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (const id of world.query("position", "collider", "renderable")) {
    const pos = world.getComponent<Position>(id, "position")!
    const collider = world.getComponent<Collider>(id, "collider")!
    const renderable = world.getComponent<Renderable>(id, "renderable")!
    drawShape(ctx, { kind: "circle", center: new Vector2(pos.x, pos.y), radius: collider.radius, color: renderable.color })
  }
}

function startSandbox(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!
  const world = new World()
  const bounds = { width: canvas.width, height: canvas.height }

  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect()
    spawnBall(world, event.clientX - rect.left, event.clientY - rect.top)
  })

  let lastTimestamp: number | null = null
  function tick(timestampMs: number) {
    if (lastTimestamp !== null) {
      const dtSeconds = Math.min((timestampMs - lastTimestamp) / 1000, 1 / 30)
      physicsSystem(world, dtSeconds, bounds)
      collisionSystem(world, 40)
      renderSystem(world, ctx)
    }
    lastTimestamp = timestampMs
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
```

The frame order is deliberate: physics moves everything first, collisions correct any overlaps that movement caused, and rendering draws only the final, corrected state — never an intermediate one. Reordering these (e.g., rendering before collision resolution) would draw balls still overlapping for one visible frame.

### SAVE AND TRY

Call `startSandbox(canvas)` on a real `<canvas>` element and click around 50+ times. Balls spawn, fall, bounce off walls and each other, and settle into a pile at the bottom — confirm no two balls visibly overlap once settled (Step 3 working) and that the frame rate stays smooth even with 100+ balls (Step 4's grid-based `collisionSystem`, not a naive O(n²) one, keeping it fast per LAB-75).

## 🎯 Challenge

Add a `totalKineticEnergy(world)` debug readout: sum `0.5 * mass * speed²` across all balls (assume `mass = radius²` as a simple density proxy) each frame, and confirm it trends downward over time due to `RESTITUTION < 1` — proving energy loss is happening system-wide, not just visually.

<details>
<summary>Solution</summary>

```typescript
function totalKineticEnergy(world: World): number {
  let total = 0
  for (const id of world.query("velocity", "collider")) {
    const vel = world.getComponent<Velocity>(id, "velocity")!
    const collider = world.getComponent<Collider>(id, "collider")!
    const mass = collider.radius * collider.radius
    const speedSquared = vel.dx * vel.dx + vel.dy * vel.dy
    total += 0.5 * mass * speedSquared
  }
  return total
}
```

Logging this once per second (an accumulator, exactly like LAB-70's FPS challenge) shows a curve that rises as balls fall (gaining velocity from gravity) but trends toward a lower plateau over many bounces, as each `RESTITUTION = 0.7` bounce bleeds off energy — a numeric confirmation of what Step 3/LAB-73 only showed visually.

</details>

## Mental Model

| Concept | Isolated-lab version | Sandbox version |
|---|---|---|
| Physics | One hardcoded `Body` (LAB-73) | `physicsSystem` over every entity with `position`+`velocity` |
| Collision detection | Plain `Entity[]` array (LAB-75) | Grid-backed `collisionSystem` reading straight from the `World` |
| Ball-vs-ball response | Not covered (LAB-73 only had walls) | Push apart by overlap + reflect velocity along collision normal |
| Frame order | N/A | physics -> collisions -> render, always in that order |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why must collisions be resolved after physics integration, not before? | |
| 2 | Why does resolving a ball-ball collision move both balls' positions, not just their velocities? | |
| 3 | What would happen to frame rate at 500 balls if `collisionSystem` used the naive O(n²) approach instead of the grid? | |

## Quick Check Answers

1. Physics -> collisions -> render, because physics is what produces this frame's tentative positions, collisions correct any overlaps that movement introduced, and render should only ever draw the final corrected state.
2. Reflecting velocity alone tells the balls which way to move next frame, but does nothing about the fact that they're already overlapping right now — without a positional push, they'd stay overlapped and keep re-triggering the same collision.
3. `World`'s ECS just stores components in maps keyed by type and entity ID — it has no inherent connection to physics or spatial position, so plugging in physics/collision/render systems is just writing functions that query the same shared data, not building any bespoke integration layer.

*Next: [LAB-77 — CAD Viewer](LAB-77-cad-viewer.md)*
