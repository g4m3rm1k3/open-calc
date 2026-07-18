import type { PracticeChallenge } from './loader'

export const title = 'Graph'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `bfs(graph, start)`, where `graph` is an adjacency list (`{ A: [\'B\',\'C\'], ... }`). Return the visiting order using breadth-first search — a queue plus a visited set, so every node reachable in 1 step is visited before anything reachable in 2 steps.',
        starter: '',
        tests: `
const graph = { A: ['B','C'], B: ['A','D'], C: ['A'], D: ['B'] }
assert JSON.stringify(bfs(graph, 'A')) === JSON.stringify(['A','B','C','D'])
`,
        solution: `function bfs(graph, start) {
  const visited = new Set([start])
  const queue = [start]
  const order = []
  while (queue.length > 0) {
    const node = queue.shift()
    order.push(node)
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
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
        prompt: 'Fix `dfs(graph, start, visited, order)` so it marks `start` as visited BEFORE recursing into its neighbors. Without that, a graph with a cycle back to `start` (like `D → A` here) causes infinite recursion — the classic "forgot to track visited nodes" graph bug.',
        starter: 'function dfs(graph, start, visited = new Set(), order = []) {\n  // TODO: mark start as visited BEFORE recursing into its neighbors — without\n  // this, a graph with a cycle back to start causes infinite recursion\n  order.push(start)\n  for (const neighbor of graph[start]) {\n    if (!visited.has(neighbor)) {\n      visited.add(neighbor)\n      dfs(graph, neighbor, visited, order)\n    }\n  }\n  return order\n}',
        tests: `
const graph = { A: ['B','C'], B: ['A','D'], C: ['A'], D: ['B','A'] }
assert JSON.stringify(dfs(graph, 'A')) === JSON.stringify(['A','B','D','C'])
`,
        solution: `function dfs(graph, start, visited = new Set([start]), order = []) {
  order.push(start)
  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) {
      visited.add(neighbor)
      dfs(graph, neighbor, visited, order)
    }
  }
  return order
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `hasPath(graph, start, end)` returning whether `end` is reachable from `start` at all (any number of hops), using a visited set so a cyclic graph doesn\'t loop forever.',
        starter: '',
        tests: `
const graph = { A: ['B','C'], B: ['A','D'], C: ['A'], D: ['B','A'] }
assert hasPath(graph, 'A', 'D') === true
assert hasPath(graph, 'C', 'D') === true
const graph2 = { A: ['B'], B: ['A'], C: [] }
assert hasPath(graph2, 'A', 'C') === false
`,
        solution: `function hasPath(graph, start, end) {
  const visited = new Set([start])
  const queue = [start]
  while (queue.length > 0) {
    const node = queue.shift()
    if (node === end) return true
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }
  return false
}`,
      },
    ],
  },
]

export default challenges
