import type { PracticeChallenge } from './loader'

export const title = 'Graph Traversal (DFS vs BFS)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `dfsIterative(graph, start)` performing depth-first search using an EXPLICIT STACK (not recursion) — push a node\'s neighbors in REVERSE order so popping still visits them in their original left-to-right order, matching how recursive DFS would.',
        starter: '',
        tests: `
const graph = { A: ['B', 'C'], B: ['D'], C: [], D: [] }
assert JSON.stringify(dfsIterative(graph, 'A')) === JSON.stringify(['A','B','D','C'])
`,
        solution: `function dfsIterative(graph, start) {
  const visited = new Set()
  const stack = [start]
  const order = []
  while (stack.length > 0) {
    const node = stack.pop()
    if (visited.has(node)) continue
    visited.add(node)
    order.push(node)
    const neighbors = graph[node]
    for (let i = neighbors.length - 1; i >= 0; i--) {
      if (!visited.has(neighbors[i])) stack.push(neighbors[i])
    }
  }
  return order
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `hasCycleDFS(graph)` (a DIRECTED graph as an adjacency list): a single "visited" set can\'t distinguish a genuine cycle from two separate paths re-converging on the same node. Track THREE states per node instead — unvisited, `\'visiting\'` (currently on the path from the root), and `\'done\'` (fully explored) — a cycle exists only if DFS reaches a node that\'s still `\'visiting\'`.',
        starter: 'function hasCycleDFS(graph) {\n  // TODO: a single "visited" set can\'t tell a genuine cycle apart from two\n  // paths re-converging on the same node — track THREE states per node\n  // (\'visiting\' = on the current path, \'done\' = fully explored) instead\n  const visited = new Set()\n  function visit(node) {\n    if (visited.has(node)) return true\n    visited.add(node)\n    for (const neighbor of graph[node]) {\n      if (visit(neighbor)) return true\n    }\n    return false\n  }\n  for (const node of Object.keys(graph)) {\n    if (visit(node)) return true\n  }\n  return false\n}',
        tests: `
const dag = { A: ['B'], B: ['C'], C: [] }
const cyclic = { A: ['B'], B: ['C'], C: ['A'] }
const diamond = { A: ['B','C'], B: ['D'], C: ['D'], D: [] }
assert hasCycleDFS(dag) === false
assert hasCycleDFS(cyclic) === true
assert hasCycleDFS(diamond) === false
`,
        solution: `function hasCycleDFS(graph) {
  const state = new Map()
  function visit(node) {
    if (state.get(node) === 'done') return false
    if (state.get(node) === 'visiting') return true
    state.set(node, 'visiting')
    for (const neighbor of graph[node]) {
      if (visit(neighbor)) return true
    }
    state.set(node, 'done')
    return false
  }
  for (const node of Object.keys(graph)) {
    if (visit(node)) return true
  }
  return false
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `dfsPathLength(graph, start, end)` (length of the FIRST path DFS happens to find) and `bfsPathLength(graph, start, end)` (guaranteed SHORTEST path length). Confirm on a graph where a direct short edge exists but DFS dives down a longer route first, that DFS\'s path is NOT the shortest one.',
        starter: '',
        tests: `
const graph = { A: ['B','E'], B: ['C'], C: ['D'], D: ['E'], E: [] }
assert bfsPathLength(graph, 'A', 'E') === 2
assert dfsPathLength(graph, 'A', 'E') === 5
assert dfsPathLength(graph, 'A', 'E') > bfsPathLength(graph, 'A', 'E')
`,
        solution: `function dfsPathLength(graph, start, end) {
  const visited = new Set()
  function dfs(node, path) {
    visited.add(node)
    path.push(node)
    if (node === end) return [...path]
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        const result = dfs(neighbor, path)
        if (result) return result
      }
    }
    path.pop()
    return null
  }
  const path = dfs(start, [])
  return path ? path.length : -1
}
function bfsPathLength(graph, start, end) {
  const visited = new Set([start])
  const queue = [[start]]
  while (queue.length > 0) {
    const path = queue.shift()
    const node = path[path.length - 1]
    if (node === end) return path.length
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push([...path, neighbor])
      }
    }
  }
  return -1
}`,
      },
    ],
  },
]

export default challenges
