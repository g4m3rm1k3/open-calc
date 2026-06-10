# Junior to Senior — T4·L7 — Dependency Graph and Topological Sort

**Prerequisites:** T4·L6 (Repository Pattern). You understand the domain layer structure.
This lesson covers directed graphs and topological sorting — the algorithm behind
"if geometry changes, which toolpaths must regenerate?"

**What this lab adds:**
- Directed graphs: nodes connected by edges with direction (A depends on B)
- DAG (Directed Acyclic Graph): no cycles — you cannot depend on yourself
- Topological sort: ordering nodes so every dependency comes before its dependent
- Cycle detection: finding circular dependencies
- The CAD/CAM application: regenerating only changed items downstream

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Module A imports B. Module B imports C. Module C imports A. Is this a DAG?
>    What is the problem called?
> 2. You have three toolpaths: T1 depends on P1; T2 depends on P1 and T1; T3
>    depends on T2. P1 changes. In what order must they regenerate?
> 3. In a topological sort, a node is "ready to process" when all its dependencies
>    have already been processed. What happens if there is a cycle?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `DependencyGraph` that detects cycles and produces a topological sort:

```ts
const graph = new DependencyGraph<string>();
graph.addNode('P1');
graph.addNode('T1');
graph.addNode('T2');
graph.addNode('GCode');
graph.addDependency('T1',    'P1');   // T1 needs P1
graph.addDependency('T2',    'P1');   // T2 needs P1
graph.addDependency('T2',    'T1');   // T2 needs T1
graph.addDependency('GCode', 'T2');   // GCode needs T2

const order = graph.topologicalSort();
// → ['P1', 'T1', 'T2', 'GCode']  — P1 first, then T1, then T2, then GCode

const affected = graph.getAffectedBy('P1');
// → ['T1', 'T2', 'GCode']  — everything downstream of P1
```

---

### Concept: Directed Graphs

**What it is:** A directed graph is a set of nodes connected by directed edges.
An edge A→B means "A depends on B." Nodes can have many edges. A DAG (Directed
Acyclic Graph) has no cycles.

**The problem before (no dependency tracking):**

```ts
// Without dependency tracking:
function onGeometryChanged(profileId: string): void {
  // Regenerate EVERYTHING — even toolpaths that don't use this profile:
  regenerateAllToolpaths();
  regenerateAllGCode();
  // Wasteful for large models
}
```

**The solution — track which items depend on which:**

```ts
// With dependency graph:
function onGeometryChanged(profileId: string): void {
  const toRegenerate = graph.getAffectedBy(profileId);
  // Only regenerate what actually needs to change
  for (const id of toRegenerate) {
    regenerateItem(id);
  }
}
```

**What it hides:** The transitive dependency calculation. `getAffectedBy('P1')` returns
`['T1', 'T2', 'GCode']` — all three are transitively dependent on P1, even though only
T1 and T2 directly reference P1.

**Canonical example:** A spreadsheet. Changing a cell in A1 re-calculates all cells
that reference A1, all cells that reference those cells, etc. This is topological sort
over a dependency graph — the exact algorithm used by every spreadsheet engine.

**Project Application:** When a user moves a point on Profile P1, the CAD/CAM system
uses the dependency graph to regenerate ONLY the toolpaths and G-code that depend on P1.
Unrelated profiles and their toolpaths are untouched.

**You will see this again in:**
- Build systems (make, webpack, gradle): `make` uses a dependency graph to rebuild only changed files
- Package managers (npm, pip): dependency resolution is topological sort
- CSS preprocessors: `@import` creates a dependency graph that SASS resolves

**Watch for:** Cycles in dependency graphs cause infinite loops in naive traversal.
Always check for cycles before applying topological sort.

---

### Concept: Topological Sort — Kahn's Algorithm

**What it is:** Topological sort orders nodes so every dependency appears before
the dependent. For the CAD/CAM graph: P1 before T1, T1 before T2, T2 before GCode.

**Algorithm (Kahn's Algorithm):**

```
1. Count "in-degree" of each node (how many nodes depend on it)
2. Start with nodes that have in-degree 0 (no dependencies — they are ready)
3. Process each ready node — add it to the result
4. For each processed node, decrement in-degree of nodes that depended on it
5. Any node whose in-degree reaches 0 becomes ready
6. Repeat until all nodes are processed
7. If nodes remain unprocessed: there is a cycle
```

**Why cycles break topological sort:**

In A→B→C→A (cycle):
- A cannot be processed until C is done
- C cannot be processed until B is done
- B cannot be processed until A is done
- Nobody starts → deadlock

**Project Application:** Toolpath generation is queued in topological order — profiles
first (no dependencies), then toolpaths (depend on profiles), then G-code (depends on
toolpaths).

**Smallest possible example:**

```
A → B → C (A depends on B which depends on C)

In-degrees: A=1, B=1, C=0
Start with: C (in-degree 0)
Process C → decrement B's in-degree → B now 0 → ready
Process B → decrement A's in-degree → A now 0 → ready
Process A

Topological order: [C, B, A]  — C before B before A
```

---

## Step 1 — Build the Dependency Graph

Create `src/dependency-graph.ts`:

```ts
export class DependencyGraph<T extends string> {
  // node → set of nodes it depends on (edges pointing OUT from this node)
  private readonly dependencies = new Map<T, Set<T>>();
  // node → set of nodes that depend on it (edges pointing IN to this node)
  private readonly dependents   = new Map<T, Set<T>>();

  addNode(node: T): void {
    if (!this.dependencies.has(node)) this.dependencies.set(node, new Set());
    if (!this.dependents.has(node))   this.dependents.set(node, new Set());
  }

  /**
   * Records that `dependent` depends on `dependency`.
   * Edge direction: dependent → dependency
   */
  addDependency(dependent: T, dependency: T): void {
    this.addNode(dependent);
    this.addNode(dependency);
    this.dependencies.get(dependent)!.add(dependency);
    this.dependents.get(dependency)!.add(dependent);
  }

  /**
   * Topological sort using Kahn's algorithm.
   * Returns a valid processing order (dependencies before dependents).
   * Throws if a cycle is detected.
   */
  topologicalSort(): T[] {
    // Count in-degree: how many dependencies does each node have?
    const inDeg = new Map<T, number>();
    for (const node of this.dependencies.keys()) {
      inDeg.set(node, inDeg.get(node) ?? 0);
    }
    for (const [node, deps] of this.dependencies.entries()) {
      inDeg.set(node, deps.size);
    }

    // Start with nodes that have no dependencies:
    const queue: T[] = [];
    for (const [node, deg] of inDeg.entries()) {
      if (deg === 0) queue.push(node);
    }
    queue.sort();  // deterministic order for nodes with no dependencies

    const result: T[] = [];

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);

      // For each node that depends on this node:
      const dependentsOfNode = this.dependents.get(node) ?? new Set();
      const ready: T[] = [];
      for (const dep of dependentsOfNode) {
        const newDeg = (inDeg.get(dep) ?? 0) - 1;
        inDeg.set(dep, newDeg);
        if (newDeg === 0) ready.push(dep);
      }
      ready.sort();
      queue.push(...ready);
    }

    if (result.length !== this.dependencies.size) {
      throw new Error('Cycle detected in dependency graph');
    }

    return result;
  }

  /**
   * Returns all nodes transitively affected when `node` changes.
   * Does NOT include `node` itself. Returned in topological order.
   */
  getAffectedBy(node: T): T[] {
    const visited = new Set<T>();
    const queue   = [node];

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const dep of this.dependents.get(current) ?? new Set()) {
        if (!visited.has(dep)) {
          visited.add(dep);
          queue.push(dep);
        }
      }
    }

    // Return in topological order:
    const sortOrder = this.topologicalSort();
    return sortOrder.filter(n => visited.has(n));
  }

  hasCycle(): boolean {
    try {
      this.topologicalSort();
      return false;
    } catch {
      return true;
    }
  }
}
```

---

## Step 2 — Write the Tests

Create `src/dependency-graph.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { DependencyGraph }       from './dependency-graph';

describe('DependencyGraph', () => {

  describe('topologicalSort', () => {

    it('sorts a linear chain so dependencies come first', () => {
      // Arrange — B depends on A; C depends on B:
      const graph = new DependencyGraph<string>();
      graph.addDependency('B', 'A');
      graph.addDependency('C', 'B');

      // Act
      const order = graph.topologicalSort();

      // Assert — A before B, B before C:
      expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
      expect(order.indexOf('B')).toBeLessThan(order.indexOf('C'));
    });

    it('sorts the CAD/CAM graph correctly', () => {
      // Arrange
      const graph = new DependencyGraph<string>();
      graph.addDependency('T1',    'P1');
      graph.addDependency('T2',    'P1');
      graph.addDependency('T2',    'T1');
      graph.addDependency('GCode', 'T2');

      // Act
      const order = graph.topologicalSort();

      // Assert — P1 before T1 and T2; T1 before T2; T2 before GCode:
      expect(order.indexOf('P1')).toBeLessThan(order.indexOf('T1'));
      expect(order.indexOf('P1')).toBeLessThan(order.indexOf('T2'));
      expect(order.indexOf('T1')).toBeLessThan(order.indexOf('T2'));
      expect(order.indexOf('T2')).toBeLessThan(order.indexOf('GCode'));
    });

    it('throws when a cycle is present', () => {
      // Arrange — A → B → C → A (cycle):
      const graph = new DependencyGraph<string>();
      graph.addDependency('A', 'B');
      graph.addDependency('B', 'C');
      graph.addDependency('C', 'A');

      // Act + Assert
      expect(() => graph.topologicalSort()).toThrow('Cycle detected');
    });

    it('handles independent nodes', () => {
      const graph = new DependencyGraph<string>();
      graph.addNode('X');
      graph.addNode('Y');
      graph.addNode('Z');

      const order = graph.topologicalSort();
      expect(order).toHaveLength(3);
    });

  });

  describe('getAffectedBy', () => {

    it('returns all transitive dependents', () => {
      // Arrange:
      const graph = new DependencyGraph<string>();
      graph.addDependency('T1',    'P1');
      graph.addDependency('T2',    'P1');
      graph.addDependency('T2',    'T1');
      graph.addDependency('GCode', 'T2');

      // Act
      const affected = graph.getAffectedBy('P1');

      // Assert — everything downstream of P1:
      expect(affected).toContain('T1');
      expect(affected).toContain('T2');
      expect(affected).toContain('GCode');
      expect(affected).not.toContain('P1');  // not the node itself
    });

    it('returns nothing when the node has no dependents', () => {
      const graph = new DependencyGraph<string>();
      graph.addNode('P1');
      expect(graph.getAffectedBy('P1')).toHaveLength(0);
    });

    it('returns only directly and transitively affected nodes', () => {
      // Two independent trees:
      // Tree 1: P1 ← T1 ← GCode1
      // Tree 2: P2 ← T2 ← GCode2
      const graph = new DependencyGraph<string>();
      graph.addDependency('T1',     'P1');
      graph.addDependency('GCode1', 'T1');
      graph.addDependency('T2',     'P2');
      graph.addDependency('GCode2', 'T2');

      const affected = graph.getAffectedBy('P1');

      expect(affected).toContain('T1');
      expect(affected).toContain('GCode1');
      expect(affected).not.toContain('T2');
      expect(affected).not.toContain('GCode2');
    });

  });

  describe('hasCycle', () => {

    it('returns false for a DAG', () => {
      const graph = new DependencyGraph<string>();
      graph.addDependency('B', 'A');
      expect(graph.hasCycle()).toBe(false);
    });

    it('returns true when a cycle exists', () => {
      const graph = new DependencyGraph<string>();
      graph.addDependency('A', 'B');
      graph.addDependency('B', 'A');
      expect(graph.hasCycle()).toBe(true);
    });

  });

});
```

### SAVE AND TRY

```bash
npm test
```

**You should see:**
```
✓ DependencyGraph > topologicalSort > sorts a linear chain
✓ DependencyGraph > topologicalSort > sorts the CAD/CAM graph correctly
✓ DependencyGraph > topologicalSort > throws when a cycle is present
✓ DependencyGraph > topologicalSort > handles independent nodes
✓ DependencyGraph > getAffectedBy > returns all transitive dependents
✓ DependencyGraph > getAffectedBy > returns nothing when no dependents
✓ DependencyGraph > getAffectedBy > returns only affected tree
✓ DependencyGraph > hasCycle > returns false for a DAG
✓ DependencyGraph > hasCycle > returns true when a cycle exists

Tests  9 passed (9)
```

---

## 🎯 Challenge: Build a `RegenerationPlanner`

**You know:** Dependency graph, `getAffectedBy`, topological sort.

**Task:** Build `RegenerationPlanner` that takes a dependency graph and a set of
"dirty" (changed) nodes, and returns the minimum set of nodes to regenerate in order:

```ts
const planner = new RegenerationPlanner(graph);
const dirty   = new Set(['P1', 'T3']);  // two things changed simultaneously

const plan = planner.buildPlan(dirty);
// → ['T1', 'T2', 'GCode', 'T3-derived'] in topological order
```

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export class RegenerationPlanner<T extends string> {
  constructor(private readonly graph: DependencyGraph<T>) {}

  buildPlan(dirtyNodes: Set<T>): T[] {
    const toRegenerate = new Set<T>();

    for (const dirty of dirtyNodes) {
      toRegenerate.add(dirty);  // the dirty node itself needs to regenerate
      for (const affected of this.graph.getAffectedBy(dirty)) {
        toRegenerate.add(affected);
      }
    }

    // Return in topological order:
    const sortOrder = this.graph.topologicalSort();
    return sortOrder.filter(n => toRegenerate.has(n));
  }
}
```

**Tests:**
```ts
it('regenerates only the affected subtree', () => {
  const graph = new DependencyGraph<string>();
  graph.addDependency('T1', 'P1');
  graph.addDependency('T2', 'P2');

  const planner = new RegenerationPlanner(graph);
  const plan    = planner.buildPlan(new Set(['P1']));

  expect(plan).toContain('P1');
  expect(plan).toContain('T1');
  expect(plan).not.toContain('T2');  // independent tree
});

it('handles multiple dirty nodes', () => {
  const graph = new DependencyGraph<string>();
  graph.addDependency('T1',    'P1');
  graph.addDependency('GCode', 'T1');

  const planner = new RegenerationPlanner(graph);
  const plan    = planner.buildPlan(new Set(['P1', 'T1']));

  // T1 appears because P1 made it dirty AND it was explicitly dirty:
  expect(plan).toContain('T1');
  expect(plan).toContain('GCode');
});
```

</details>

---

## Final Check

| Concept | Test |
|---|---|
| Topological order | P1 before all toolpaths; toolpaths before G-code |
| Cycle detection | A→B→A → `hasCycle()` returns true |
| `getAffectedBy` is transitive | Change P1, verify GCode is in affected set |
| Independent subtrees not affected | Change P1, verify P2's toolpaths not returned |

---

## Quick Check Answers

**1. A → B → C → A. Is it a DAG? What is the problem called?**

No — it has a cycle. The problem is called a circular dependency. In module systems, this
causes one module to be partially initialised when another imports it. In dependency graphs,
it makes topological sort impossible — no node can be "first" because every node has a
dependency that hasn't been processed yet.

**2. P1 changes. T1→P1; T2→P1,T1; T3→T2. Regeneration order?**

T1, T2, T3. The topological sort gives: P1 first (no dependencies), then T1 (depends on
P1 which is done), then T2 (depends on both P1 and T1 which are done), then T3 (depends
on T2 which is done). Since P1 is the source, nodes to regenerate are T1, T2, T3.

**3. Cycle present — what happens to topological sort?**

Kahn's algorithm: after processing all reachable nodes, some nodes remain with in-degree > 0
(still waiting for a dependency that is itself waiting). If `result.length !== total nodes`,
a cycle was detected. The algorithm raises an error.
