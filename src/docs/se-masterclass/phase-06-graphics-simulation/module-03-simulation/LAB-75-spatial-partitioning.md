# SE Masterclass — LAB-75 — Spatial Partitioning

**Prerequisites:** LAB-74 (ECS Architecture)

## Quick Check

Before starting, answer these (answers at the bottom):

1. Why is checking every pair of N objects for collision O(n²)?
2. What does a uniform grid trade away to make collision checks faster?
3. Why is spatial partitioning called "broad-phase" — broad compared to what?

## What You Will Build

A collision check over 500 entities, timed both the naive way (every pair) and the grid-partitioned way — watching the pair-check count drop by orders of magnitude for the same scene.

```
Naive:        500 entities -> 124,750 pairs checked -> 41ms
Uniform grid: 500 entities -> ~2,100 pairs checked  -> 1.3ms
Same collisions detected. Far fewer comparisons made.
```

## Concept: Spatial Partitioning

**What it is:** A way of pre-sorting objects by *where they are* so that collision checks only compare objects that could plausibly be near each other, instead of comparing everything to everything.

**The problem before:** LAB-73's collision detection had one ball and static walls — cheap to check directly. LAB-74's ECS can hold hundreds of moving entities, and the obvious way to detect collisions between them is to check every pair: entity 1 vs 2, 1 vs 3, ... 2 vs 3, and so on. For N entities that's `N * (N-1) / 2` pairs — 500 entities means ~124,750 checks, every single frame, even though a ball in the top-left corner obviously can't be colliding with one in the bottom-right. This is the same shape of problem LAB-08 (Complexity) named directly: an O(n²) algorithm that gets catastrophically slower as N grows, entirely from checking pairs that could never actually collide.

**The solution:** Divide the world into cells (a uniform grid is the simplest version) and record which cell each entity currently occupies. To find an entity's potential collisions, only check other entities in the *same or neighboring* cells — objects far apart are never compared at all, because they're never even looked at together. This is called **broad-phase** collision detection: a cheap first pass that discards obviously-non-colliding pairs, leaving a much smaller set of *candidate* pairs for a precise (and more expensive) check — the **narrow-phase**, which is just LAB-73-style distance/overlap math.

**Canonical example:**

```typescript
function getCandidatePairs(grid: UniformGrid): [number, number][] {
  const pairs: [number, number][] = []
  for (const cell of grid.cells()) {
    const entities = grid.entitiesIn(cell)
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        pairs.push([entities[i], entities[j]])
      }
    }
  }
  return pairs
}
```

**Project Application:** LAB-76's physics sandbox needs this to handle dozens of simultaneously bouncing bodies without frame drops. LAB-79's pathfinding visualizer reuses the same grid concept to look up "what's near this cell" for neighbor queries during search.

**Watch for:** Forgetting entities near a cell boundary. Two entities in adjacent cells can still be touching (a ball straddling the line between cell A and cell B) — checking only "same cell" misses these; you must also check the immediate neighboring cells.

## Step 1: The naive O(n²) baseline

```typescript
interface Entity { id: number; x: number; y: number; radius: number }

function circlesOverlap(a: Entity, b: Entity): boolean {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const distanceSquared = dx * dx + dy * dy
  const radiusSum = a.radius + b.radius
  return distanceSquared < radiusSum * radiusSum
}

function findCollisionsNaive(entities: Entity[]): [number, number][] {
  const collisions: [number, number][] = []
  let pairChecks = 0
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      pairChecks++
      if (circlesOverlap(entities[i], entities[j])) {
        collisions.push([entities[i].id, entities[j].id])
      }
    }
  }
  console.log(`Naive: ${pairChecks} pair checks for ${entities.length} entities`)
  return collisions
}
```

`circlesOverlap` compares squared distances instead of taking a square root (`Math.sqrt`) — comparing `distanceSquared < radiusSum * radiusSum` gives the same true/false answer as comparing actual distances, without the cost of a square root on every single pair check, LAB-08-style micro-efficiency that matters when this runs thousands of times per frame.

### SAVE AND TRY

Generate 500 entities at random positions and call `findCollisionsNaive`. The logged `pairChecks` count is `500 * 499 / 2 = 124,750` — every entity compared against every other, regardless of how far apart they are.

## Step 2: A uniform grid

```typescript
class UniformGrid {
  private cellSize: number
  private cellMap = new Map<string, number[]>()

  constructor(cellSize: number) {
    this.cellSize = cellSize
  }

  private cellKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize)
    const cy = Math.floor(y / this.cellSize)
    return `${cx},${cy}`
  }

  clear(): void {
    this.cellMap.clear()
  }

  insert(entity: Entity): void {
    const key = this.cellKey(entity.x, entity.y)
    if (!this.cellMap.has(key)) this.cellMap.set(key, [])
    this.cellMap.get(key)!.push(entity.id)
  }

  neighborCellEntities(x: number, y: number): number[] {
    const cx = Math.floor(x / this.cellSize)
    const cy = Math.floor(y / this.cellSize)
    const result: number[] = []
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${cx + dx},${cy + dy}`
        const entities = this.cellMap.get(key)
        if (entities) result.push(...entities)
      }
    }
    return result
  }
}
```

`insert` buckets each entity into a cell based on `Math.floor(position / cellSize)` — this is the same "hash by bucket" idea LAB-04's hash map used, except the bucket key comes from spatial coordinates instead of a hash function. `neighborCellEntities` checks a 3x3 block of cells around a point (`dx`/`dy` from -1 to 1), which is what catches entities that straddle a cell boundary — an entity right at the edge of its own cell can still overlap one in the adjacent cell.

### SAVE AND TRY

Insert entities clustered at `(50, 50)` and `(950, 950)` (far corners of a 1000x1000 world) with `cellSize = 50`. Call `neighborCellEntities(50, 50)` — it returns only the cluster near `(50, 50)`, never touching the far cluster's entities, because they land in entirely different, non-adjacent grid cells.

## Step 3: Broad-phase using the grid

```typescript
function findCollisionsGrid(entities: Entity[], cellSize: number): [number, number][] {
  const grid = new UniformGrid(cellSize)
  for (const entity of entities) grid.insert(entity)

  const collisions: [number, number][] = []
  const checkedPairs = new Set<string>()
  let pairChecks = 0

  for (const entity of entities) {
    const candidates = grid.neighborCellEntities(entity.x, entity.y)
    for (const candidateId of candidates) {
      if (candidateId === entity.id) continue
      const pairKey = [entity.id, candidateId].sort((a, b) => a - b).join(",")
      if (checkedPairs.has(pairKey)) continue
      checkedPairs.add(pairKey)

      pairChecks++
      const other = entities.find(e => e.id === candidateId)!
      if (circlesOverlap(entity, other)) {
        collisions.push([entity.id, candidateId])
      }
    }
  }
  console.log(`Grid: ${pairChecks} pair checks for ${entities.length} entities`)
  return collisions
}
```

`checkedPairs` prevents double-counting: without it, entity A checking its neighbors finds B, and later B checking its neighbors finds A again — the same pair, checked twice. Sorting the pair's IDs before joining them into a key (`[a, b].sort()`) guarantees `"3,7"` and `"7,3"` produce the identical key, so the second check is recognized as a duplicate and skipped.

### SAVE AND TRY

Run `findCollisionsGrid` on the same 500 random entities from Step 1, with `cellSize` roughly matching the entities' typical radius times a few (e.g., `cellSize = 40` for `radius ≈ 10`). Compare the logged `pairChecks` to the naive version's `124,750` — the grid version checks a small fraction of that, and `findCollisionsNaive` and `findCollisionsGrid` should report the *same* collision pairs (just reached via far fewer comparisons), which is worth explicitly verifying by comparing the two result arrays.

## Step 4: Cell size is a tuning knob

```typescript
// Too large: every entity lands in ~1 cell, degenerates toward the naive O(n^2) case.
const collisionsTooCoarse = findCollisionsGrid(entities, 2000)

// Too small: entities spread across many cells, and each entity's own radius spans
// multiple cells, forcing neighborCellEntities to over-collect and re-check.
const collisionsTooFine = findCollisionsGrid(entities, 2)

// About right: cell size roughly matches typical entity size.
const collisionsTuned = findCollisionsGrid(entities, 40)
```

A grid isn't free — it costs memory (the `cellMap`) and a per-frame rebuild (`clear()` + re-`insert()` every entity, since positions change every frame after LAB-73's physics step). The trade is: pay a small, predictable memory/rebuild cost to avoid a quadratic comparison cost. Choosing `cellSize` badly can erase that trade — too coarse and every entity crowds into one cell (back to checking everything against everything); too fine and the per-entity overhead of touching many small cells outweighs the savings.

### SAVE AND TRY

Time `findCollisionsGrid` with `cellSize` at `2000`, `2`, and `40` on the same 500-entity scene (wrap each call with `performance.now()` before/after). The `2000` case's `pairChecks` count approaches the naive `124,750`; `40` should be dramatically lower than both — confirming cell size, not just "having a grid at all," is what determines the speedup.

## 🎯 Challenge

Wire `findCollisionsGrid` into LAB-74's ECS as a `collisionSystem` that queries `world.query("position", "collider")`, rebuilds the grid each frame from current positions, and calls a supplied `onCollision(a, b)` callback for each detected pair — so physics-driven position changes automatically feed into next-frame collision detection with no manual grid bookkeeping outside the system.

<details>
<summary>Solution</summary>

```typescript
function collisionSystem(
  world: World,
  cellSize: number,
  onCollision: (a: number, b: number) => void
) {
  const entities: Entity[] = world.query("position", "collider").map(id => {
    const pos = world.getComponent<Position>(id, "position")!
    const collider = world.getComponent<{ radius: number }>(id, "collider")!
    return { id, x: pos.x, y: pos.y, radius: collider.radius }
  })

  const collisions = findCollisionsGrid(entities, cellSize)
  for (const [a, b] of collisions) onCollision(a, b)
}
```

Because `entities` is rebuilt fresh from `world.query(...)` every call, and `physicsSystem` (LAB-74) already updated `position` components earlier in the same frame, `collisionSystem` always sees this frame's post-physics positions — no stale grid state carries over between frames.

</details>

## Mental Model

| Concept | Naive instinct | Spatial-partitioning instinct |
|---|---|---|
| Collision checking | Compare every pair | Compare only same/neighboring-cell pairs |
| Cost as N grows | O(n²) — quadratic | Roughly O(n) for evenly-distributed entities |
| Cell size | Doesn't matter | Tuned to typical entity size — too big or small both hurt |
| Terminology | — | Broad-phase (cheap filter) then narrow-phase (precise check) |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | Why does checking every pair of N entities cost O(n²)? | |
| 2 | Why must `neighborCellEntities` check a 3x3 block of cells, not just one? | |
| 3 | What's the difference between broad-phase and narrow-phase collision detection? | |

## Quick Check Answers

1. Every entity must be compared against every other entity, and the number of unique pairs among N items is `N * (N-1) / 2` — growing quadratically as N grows.
2. An entity near a cell's edge can overlap an entity in an adjacent cell — checking only its own cell would miss real collisions that straddle a boundary.
3. Broad-phase is described as "broad" because it's a cheap, approximate pass over the whole scene that discards obviously-non-colliding pairs (via spatial buckets); narrow-phase is the precise, more expensive geometric check (like `circlesOverlap`) applied only to the much smaller set of candidates broad-phase leaves behind.

*Next: [LAB-76 — Physics Sandbox](../module-04-mini-projects/LAB-76-physics-sandbox.md)*
