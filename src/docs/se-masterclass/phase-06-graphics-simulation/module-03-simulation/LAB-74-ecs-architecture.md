# SE Masterclass — LAB-74 — ECS Architecture

**Prerequisites:** LAB-73 (Physics Fundamentals)

## Quick Check

Before starting, answer these (answers at the bottom):

1. In ECS, what is an entity — literally, as a value?
2. Why does "a `Player` that is also `Flying` and also `OnFire`" break down in a class-inheritance model?
3. What does a "system" operate on, in ECS terms?

## What You Will Build

A tiny ECS running 200 entities — some with physics, some with rendering, some with both — where adding "this entity is also on fire" is a one-line component attachment, not a class hierarchy change.

```
Entity 42: [Position, Velocity, Renderable]           <- a ball
Entity 43: [Position, Renderable]                       <- a static wall decoration
Entity 44: [Position, Velocity, Renderable, OnFire]     <- a burning ball
PhysicsSystem processes: 42, 44 (has Position + Velocity)
RenderSystem processes: 42, 43, 44 (has Position + Renderable)
FireSystem processes: 44 (has OnFire)
```

## Concept: Entity-Component-System

**What it is:** ECS splits "an object in the simulation" into three separate things that inheritance normally bundles together. An **entity** is just an ID — a number, nothing more. A **component** is a plain data bag attached to an entity (`Position { x, y }`, `Velocity { dx, dy }`) — no methods, no behavior. A **system** is a function that runs once per frame over every entity that has a specific combination of components, and does something with their data.

**The problem before:** LAB-73's `Body` interface bundled `position` and `velocity` onto one object, and that was fine for a single ball. But a real simulation has many *kinds* of things — a ball has physics and is drawn; a wall decoration is drawn but never moves; a burning ball has physics, is drawn, *and* is on fire. Modeling this with classes leads to the classic inheritance trap this curriculum already met in LAB-19 (`Bird → FlyingBird → PenguinThatCantFly`, doesn't work): does `OnFireBall` extend `Ball` and duplicate physics logic, or extend some `Flammable` mixin, and what extends what when an entity needs three unrelated behaviors at once?

**The solution:** Stop putting behavior on objects at all. An entity has *no* code — it's an ID. Components are pure data, attached or removed freely at runtime ("catch fire" is just adding an `OnFire` component; no class changes). Systems are the only place behavior lives, and each system declares which component combination it cares about, then loops over every entity that matches. This is LAB-19's composition-over-inheritance lesson taken to its logical extreme: no inheritance tree at all, just data and functions that query it.

**Canonical example:**

```typescript
function physicsSystem(world: World, dtSeconds: number) {
  for (const entity of world.query("position", "velocity")) {
    const pos = world.getComponent(entity, "position")!
    const vel = world.getComponent(entity, "velocity")!
    pos.x += vel.dx * dtSeconds
    pos.y += vel.dy * dtSeconds
  }
}
```

**Project Application:** LAB-76's physics sandbox is this ECS with `PhysicsSystem` (from LAB-73's `stepPhysics`) and `RenderSystem` (from LAB-71's `drawShape`) both running over a shared entity pool. LAB-79's pathfinding visualizer reuses the same `World` to track agents separately from the grid.

**Watch for:** Reaching for a class hierarchy the moment two entity "types" share some behavior. The ECS instinct is always the same question: "what data does this need, and what system reads it?" — not "what should this thing inherit from?"

## Step 1: The World — entities as IDs, components as maps

```typescript
type ComponentMap = Record<string, Record<number, unknown>>

class World {
  private nextEntityId = 0
  private components: ComponentMap = {}

  createEntity(): number {
    return this.nextEntityId++
  }

  addComponent<T>(entity: number, type: string, data: T): void {
    if (!this.components[type]) this.components[type] = {}
    this.components[type][entity] = data
  }

  getComponent<T>(entity: number, type: string): T | undefined {
    return this.components[type]?.[entity] as T | undefined
  }

  removeComponent(entity: number, type: string): void {
    delete this.components[type]?.[entity]
  }

  query(...types: string[]): number[] {
    if (types.length === 0) return []
    const [first, ...rest] = types
    const candidates = Object.keys(this.components[first] ?? {}).map(Number)
    return candidates.filter(entity => rest.every(type => this.components[type]?.[entity] !== undefined))
  }
}
```

An entity is genuinely nothing but a number — `createEntity()` returns `0`, `1`, `2`... with no object attached. All the actual data lives in `components`, keyed by component type, then by entity ID. This is structurally the same idea as LAB-04's hash map used as a lookup table, applied to "which entities have which data."

### SAVE AND TRY

```typescript
const world = new World()
const ball = world.createEntity()
world.addComponent(ball, "position", { x: 100, y: 100 })
world.addComponent(ball, "velocity", { dx: 50, dy: 0 })

const wall = world.createEntity()
world.addComponent(wall, "position", { x: 0, y: 0 })

console.log(world.query("position", "velocity")) // [0]  -- only the ball has both
console.log(world.query("position"))              // [0, 1]  -- both have position
```

`query("position", "velocity")` returns only `ball`, because `wall` has no `velocity` component — confirming systems can select exactly the entities relevant to them, nothing more.

## Step 2: Components as pure data

```typescript
interface Position { x: number; y: number }
interface Velocity { dx: number; dy: number }
interface Renderable { color: string; radius: number }
interface OnFire { damagePerSecond: number }
```

None of these have methods. `Position` doesn't know how to move itself; `Renderable` doesn't know how to draw itself. That knowledge belongs entirely to systems — a deliberate inversion of the OOP instinct (from LAB-18's SRP, even) that "a `Position` should be responsible for `Position`-related behavior." Here, "responsible for" behavior is a system's job; a component's only job is holding values.

### SAVE AND TRY

Try adding a method to `Position` (e.g., `distanceTo(other: Position)`) and notice nothing in this design calls it — systems reach *into* components for raw fields (`pos.x`, `pos.y`), they don't call methods on them. Components staying data-only is what makes `query()` able to treat every component type identically (`Object.keys(...)`) without needing to know its shape.

## Step 3: Systems — behavior as functions over queries

```typescript
function physicsSystem(world: World, dtSeconds: number) {
  for (const entity of world.query("position", "velocity")) {
    const pos = world.getComponent<Position>(entity, "position")!
    const vel = world.getComponent<Velocity>(entity, "velocity")!
    pos.x += vel.dx * dtSeconds
    pos.y += vel.dy * dtSeconds
  }
}

function renderSystem(world: World, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (const entity of world.query("position", "renderable")) {
    const pos = world.getComponent<Position>(entity, "position")!
    const shape = world.getComponent<Renderable>(entity, "renderable")!
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, shape.radius, 0, Math.PI * 2)
    ctx.fillStyle = shape.color
    ctx.fill()
  }
}

function fireSystem(world: World, dtSeconds: number, onEntityDestroyed: (e: number) => void) {
  for (const entity of world.query("onFire", "health")) {
    const fire = world.getComponent<OnFire>(entity, "onFire")!
    const health = world.getComponent<{ current: number }>(entity, "health")!
    health.current -= fire.damagePerSecond * dtSeconds
    if (health.current <= 0) onEntityDestroyed(entity)
  }
}
```

`fireSystem` only ever touches entities with *both* `onFire` and `health` — a wall with no `health` component is silently skipped, with no special-casing required. Each system is independently simple because `query()` already filtered its input down to exactly the entities it needs to reason about.

### SAVE AND TRY

Create three entities: one with `position` + `velocity` + `renderable` (a moving ball), one with just `position` + `renderable` (a static decoration), one with all of those plus `onFire` + `health`. Run `physicsSystem` once — only the moving ball's position changes; the static decoration's doesn't move, because it never matched `query("position", "velocity")`.

## Step 4: Attaching and detaching components at runtime

```typescript
function igniteEntity(world: World, entity: number) {
  world.addComponent(entity, "onFire", { damagePerSecond: 5 })
}

function extinguishEntity(world: World, entity: number) {
  world.removeComponent(entity, "onFire")
}
```

"Catching fire" and "being extinguished" are one-line component operations — no subclassing, no reconstructing the entity, no touching `physicsSystem` or `renderSystem` at all. This is the payoff the concept section promised: behavior composition entirely through data attachment.

### SAVE AND TRY

Take an existing ball entity, run `renderSystem` (draws it normally), then call `igniteEntity(world, ball)` and run `fireSystem` a few times with decreasing `health.current` logged each call — then call `extinguishEntity(world, ball)` and confirm `fireSystem`'s query no longer includes it, with zero changes to any system's code.

## 🎯 Challenge

Add a `damageOnFireVisual` behavior: while an entity has `onFire`, `renderSystem` should draw it in red instead of its normal `renderable.color`, without `renderSystem` needing an `if (isOnFire)` branch reading a separate flag — have it check `query`/`getComponent` for the `onFire` component itself.

<details>
<summary>Solution</summary>

```typescript
function renderSystem(world: World, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (const entity of world.query("position", "renderable")) {
    const pos = world.getComponent<Position>(entity, "position")!
    const shape = world.getComponent<Renderable>(entity, "renderable")!
    const onFire = world.getComponent<OnFire>(entity, "onFire")

    ctx.beginPath()
    ctx.arc(pos.x, pos.y, shape.radius, 0, Math.PI * 2)
    ctx.fillStyle = onFire ? "red" : shape.color
    ctx.fill()
  }
}
```

`getComponent` returns `undefined` for entities without `onFire`, so `onFire ? "red" : shape.color` reads as "does this entity currently have the component," not "is some boolean flag set" — the presence of the component *is* the flag.

</details>

## Mental Model

| Concept | Class-inheritance instinct | ECS instinct |
|---|---|---|
| "This thing is on fire" | Subclass or mixin (`FlammableBall extends Ball`) | Attach an `OnFire` component |
| Where behavior lives | Methods on the object | Functions (systems) over queried entities |
| Adding a new combination | New class in the hierarchy | New component + system, no hierarchy change |
| What an entity "is" | An instance of a class | An ID with a set of attached components |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does `query()` intersect entity IDs across multiple component maps instead of checking a class type? | |
| 2 | Why do components have no methods? | |
| 3 | How does an entity "become" something new (like catching fire) in ECS? | |

## Quick Check Answers

1. An entity is literally just an integer ID — a `number` returned by `createEntity()` — with no attached class or behavior of its own.
2. Because a rigid class hierarchy can't cleanly express an object having several independent, orthogonal traits at once (flying + on fire + player-controlled) — each combination would need its own place in the tree.
3. A system: a plain function that queries the `World` for entities holding a specific set of component types and operates on their data each frame.

*Next: [LAB-75 — Spatial Partitioning](LAB-75-spatial-partitioning.md)*
