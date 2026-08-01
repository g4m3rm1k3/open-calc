# SE Masterclass — LAB-79 — Pathfinding Visualizer

**Prerequisites:** LAB-78 (G-code Backplotter)

## Quick Check

Before starting, answer these (answers at the bottom):

1. BFS guarantees the shortest path on an unweighted grid. What does it explore that A* tries to avoid exploring?
2. What is a heuristic function supposed to estimate, and what happens if it overestimates the true distance?
3. Why does animating "one step per frame" reuse LAB-70's render loop rather than just running the algorithm to completion and drawing the final result?

## What You Will Build

A grid you can click to place walls, drag to set start/end points, then watch BFS or A* explore cell-by-cell (frontier highlighted, visited cells shaded) before tracing the final shortest path — a direct visual answer to "what does A*'s heuristic actually save you?"

```
Grid 20x15, wall density 25%
BFS:  347 cells visited before reaching goal
A*:   89 cells visited before reaching goal (same shortest path length: 28 steps)
```

## Concept: Spatial Graph Search, Visualized

**What it is:** A grid is a graph — each cell is a node, and it has edges to its (up to 4) orthogonal neighbors. BFS (breadth-first search) explores that graph layer by layer, guaranteeing the first time it reaches the goal is via a shortest path. A* is BFS with a *heuristic* added — a guess at "how far is this cell from the goal" — that lets it prioritize exploring cells that seem to be heading the right direction, instead of blindly expanding outward in every direction equally.

**The problem before:** LAB-14's dependency graph and LAB-15's scheduler both used graph traversal, but over abstract task nodes with no spatial meaning — "distance" wasn't a concept, just "depends on." A grid is a graph *with* spatial meaning: neighbors are physically adjacent, and there's an obvious notion of "closer to the goal" that BFS completely ignores (it treats every unvisited neighbor as equally promising) and A* explicitly exploits.

**The solution:** Represent the grid as nodes with neighbor edges (same shape as LAB-14's adjacency list, just generated from grid coordinates instead of declared explicitly). Run BFS with a plain FIFO queue for guaranteed shortest paths with no spatial awareness, or A* with LAB-15's `MinHeap` (priority queue) ordering the frontier by `distanceSoFar + heuristic(cell, goal)` — same graph, same correctness guarantee (assuming an admissible heuristic), fewer cells explored.

**Canonical example:**

```typescript
function heuristic(a: GridCell, b: GridCell): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) // Manhattan distance
}

function aStar(grid: Grid, start: GridCell, goal: GridCell): GridCell[] {
  const frontier = new MinHeap<GridCell>((cell) => costSoFar.get(cell)! + heuristic(cell, goal))
  // ...
}
```

**Project Application:** This is the last lab of Phase 6 — the curriculum's final graphics/simulation project, and it deliberately closes the loop back to LAB-14/15 (graph algorithms, first taught over abstract dependency tasks) by applying the same traversal logic to something visual and immediately intuitive.

**Watch for:** An inadmissible heuristic — one that *overestimates* true distance — which can make A* return a path that isn't actually shortest, because it becomes overconfident about a direction that turns out to be blocked. Manhattan distance is safe on a 4-directional grid because it never overestimates (it's the exact distance with no obstacles).

## Step 1: The grid as a graph

```typescript
interface GridCell { x: number; y: number }

class Grid {
  walls = new Set<string>()
  constructor(public width: number, public height: number) {}

  private key(cell: GridCell): string { return `${cell.x},${cell.y}` }

  toggleWall(cell: GridCell) {
    const key = this.key(cell)
    if (this.walls.has(key)) this.walls.delete(key)
    else this.walls.add(key)
  }

  isWalkable(cell: GridCell): boolean {
    return cell.x >= 0 && cell.x < this.width && cell.y >= 0 && cell.y < this.height && !this.walls.has(this.key(cell))
  }

  neighbors(cell: GridCell): GridCell[] {
    const candidates = [
      { x: cell.x + 1, y: cell.y }, { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 }, { x: cell.x, y: cell.y - 1 },
    ]
    return candidates.filter(c => this.isWalkable(c))
  }
}
```

`neighbors()` is this lab's version of LAB-14's adjacency list — instead of a hardcoded map of task dependencies, edges are computed on the fly from grid coordinates, filtered by walls and bounds. Every graph algorithm below only ever calls `grid.neighbors(cell)`; none of them know or care that "neighbor" means "one step in a cardinal direction."

### SAVE AND TRY

```typescript
const grid = new Grid(5, 5)
grid.toggleWall({ x: 2, y: 2 })
console.log(grid.neighbors({ x: 2, y: 1 }))
// [(3,1), (1,1), (2,0)]  -- (2,2) is missing: it's a wall, filtered out by isWalkable
```

## Step 2: BFS — shortest path, no spatial awareness

```typescript
function bfs(grid: Grid, start: GridCell, goal: GridCell): { path: GridCell[]; visited: GridCell[] } {
  const key = (c: GridCell) => `${c.x},${c.y}`
  const cameFrom = new Map<string, GridCell>()
  const visited = new Set<string>([key(start)])
  const visitedOrder: GridCell[] = []
  const queue: GridCell[] = [start]

  while (queue.length > 0) {
    const current = queue.shift()!
    visitedOrder.push(current)
    if (current.x === goal.x && current.y === goal.y) break

    for (const neighbor of grid.neighbors(current)) {
      if (visited.has(key(neighbor))) continue
      visited.add(key(neighbor))
      cameFrom.set(key(neighbor), current)
      queue.push(neighbor)
    }
  }

  return { path: reconstructPath(cameFrom, start, goal), visited: visitedOrder }
}

function reconstructPath(cameFrom: Map<string, GridCell>, start: GridCell, goal: GridCell): GridCell[] {
  const path: GridCell[] = [goal]
  let current = goal
  while (current.x !== start.x || current.y !== start.y) {
    const prev = cameFrom.get(`${current.x},${current.y}`)
    if (!prev) return [] // no path found
    path.unshift(prev)
    current = prev
  }
  return path
}
```

`queue.shift()` (FIFO — first in, first out) is what makes this BFS instead of DFS: cells are explored in the exact order they were discovered, which is what guarantees layer-by-layer expansion and therefore shortest-path correctness on an unweighted grid. `cameFrom` is the same "record how we got here, then walk backward" trick LAB-14's topological sort used for cycle reporting.

### SAVE AND TRY

Build a 10x10 grid with no walls, run `bfs` from `(0,0)` to `(9,9)`, and log `result.visited.length` — it should be large (BFS explores in a widening diamond in all directions, so it visits many cells even ones nowhere near the direct path) versus `result.path.length` (18 steps — the true shortest distance on a grid with diagonal movement disallowed).

## Step 3: A* — shortest path, guided by a heuristic

```typescript
import { MinHeap } from "../../phase-01-computational-thinking/module-02-build-a-language/LAB-15-scheduler"

function manhattanDistance(a: GridCell, b: GridCell): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function aStar(grid: Grid, start: GridCell, goal: GridCell): { path: GridCell[]; visited: GridCell[] } {
  const key = (c: GridCell) => `${c.x},${c.y}`
  const cameFrom = new Map<string, GridCell>()
  const costSoFar = new Map<string, number>([[key(start), 0]])
  const visitedOrder: GridCell[] = []

  const frontier = new MinHeap<GridCell>((cell) => costSoFar.get(key(cell))! + manhattanDistance(cell, goal))
  frontier.push(start)

  while (!frontier.isEmpty()) {
    const current = frontier.pop()!
    visitedOrder.push(current)
    if (current.x === goal.x && current.y === goal.y) break

    for (const neighbor of grid.neighbors(current)) {
      const newCost = costSoFar.get(key(current))! + 1
      if (!costSoFar.has(key(neighbor)) || newCost < costSoFar.get(key(neighbor))!) {
        costSoFar.set(key(neighbor), newCost)
        cameFrom.set(key(neighbor), current)
        frontier.push(neighbor)
      }
    }
  }

  return { path: reconstructPath(cameFrom, start, goal), visited: visitedOrder }
}
```

The only structural difference from `bfs` is the frontier: a `MinHeap` ordered by `costSoFar + heuristic` (LAB-15's priority queue, reused directly) instead of a plain FIFO array. Cells that *look* closer to the goal (lower `manhattanDistance`) get explored first — the algorithm is still exhaustive and correct, it's just no longer blind to direction.

### SAVE AND TRY

Run `aStar` on the same 10x10 empty grid from Step 2, same start/goal. `result.path.length` should match BFS's exactly (both find a true shortest path — 18 steps), but `result.visited.length` should be smaller than BFS's, since A*'s heuristic steers exploration toward the goal instead of expanding equally in all directions.

## Step 4: Animating the search, one step per frame

```typescript
function* bfsSteps(grid: Grid, start: GridCell, goal: GridCell): Generator<{ visited: GridCell; done: boolean }> {
  const key = (c: GridCell) => `${c.x},${c.y}`
  const cameFrom = new Map<string, GridCell>()
  const visited = new Set<string>([key(start)])
  const queue: GridCell[] = [start]

  while (queue.length > 0) {
    const current = queue.shift()!
    const isDone = current.x === goal.x && current.y === goal.y
    yield { visited: current, done: isDone }
    if (isDone) return

    for (const neighbor of grid.neighbors(current)) {
      if (visited.has(key(neighbor))) continue
      visited.add(key(neighbor))
      cameFrom.set(key(neighbor), current)
      queue.push(neighbor)
    }
  }
}

function animateSearch(grid: Grid, start: GridCell, goal: GridCell, render: (cell: GridCell) => void) {
  const steps = bfsSteps(grid, start, goal)
  let lastTimestamp: number | null = null
  let accumulator = 0
  const stepIntervalSeconds = 0.02 // one grid cell revealed every 20ms

  function tick(timestampMs: number) {
    if (lastTimestamp !== null) {
      accumulator += (timestampMs - lastTimestamp) / 1000
      while (accumulator >= stepIntervalSeconds) {
        accumulator -= stepIntervalSeconds
        const { value, done } = steps.next()
        if (done) return
        render(value.visited)
      }
    }
    lastTimestamp = timestampMs
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}
```

A JavaScript generator (`function*`/`yield`) turns `bfs`'s single blocking loop into a sequence of pausable steps — each call to `steps.next()` resumes exactly where the last one left off, with all of BFS's local state (`queue`, `visited`, `cameFrom`) preserved between calls. `animateSearch` is LAB-70's render loop again, using an accumulator (like LAB-70's challenge FPS counter) to control *how many* algorithm steps to reveal per real second, decoupling animation speed from frame rate exactly as LAB-70 decoupled movement speed from frame rate.

### SAVE AND TRY

Call `animateSearch` with a `render` callback that shades each visited cell on a canvas. Watch the search expand as a widening diamond from the start cell (BFS's signature shape) until it reaches the goal — pause and resume by controlling whether `tick` keeps calling `requestAnimationFrame`, confirming the generator genuinely holds its place mid-search rather than restarting.

## 🎯 Challenge

Add a live visited-count comparison: run both `bfs` and `aStar` (non-animated, Steps 2/3) on the exact same grid/start/goal, and display "BFS visited N cells, A* visited M cells, both found a path of length L" — then let the user toggle walls and re-run both, building intuition for how obstacle density changes the gap between them.

<details>
<summary>Solution</summary>

```typescript
function compareAlgorithms(grid: Grid, start: GridCell, goal: GridCell) {
  const bfsResult = bfs(grid, start, goal)
  const aStarResult = aStar(grid, start, goal)

  console.log(`BFS visited ${bfsResult.visited.length} cells, path length ${bfsResult.path.length}`)
  console.log(`A* visited ${aStarResult.visited.length} cells, path length ${aStarResult.path.length}`)

  if (bfsResult.path.length !== aStarResult.path.length) {
    console.warn("Path lengths differ -- check for an inadmissible heuristic or a bug")
  }
}
```

Asserting the two path lengths match is the important part: it's the concrete, checkable proof that A*'s heuristic-guided exploration didn't sacrifice correctness for speed — same shortest-path length, fewer cells looked at to find it.

</details>

## Mental Model

| Concept | BFS | A* |
|---|---|---|
| Frontier structure | Plain FIFO array/queue | `MinHeap` ordered by `costSoFar + heuristic` |
| Exploration shape | Widens equally in every direction | Biased toward the goal |
| Cells visited | More | Fewer (same shortest path found) |
| Spatial awareness | None — a cell's position doesn't affect priority | Explicit — heuristic uses cell/goal coordinates |

## Final Check

| # | Question | Your answer |
|---|---|---|
| 1 | What single line changes turn the BFS implementation into A*? | |
| 2 | Why does Manhattan distance make a safe heuristic on a 4-directional grid? | |
| 3 | What does the generator (`function*`/`yield`) buy that a plain function call couldn't? | |

## Quick Check Answers

1. BFS explores outward equally in all directions from the start, discovering many cells that are nowhere near the goal; A*'s heuristic biases exploration toward cells that seem closer to the goal, visiting fewer cells overall.
2. A heuristic should estimate remaining distance to the goal without ever exceeding the true remaining distance (admissible); if it overestimates, A* can be misled into confidently committing to a path that isn't actually shortest.
3. It lets the algorithm's progress be paused and resumed one step at a time across separate render-loop frames, with all local search state preserved between steps — necessary for rendering the search as an animation instead of just the final result.

*Next: [Phase 7 — Language & Tooling →](../../phase-07-language-tooling/README.md)*
