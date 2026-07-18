import type { PracticeChallenge } from './loader'

export const title = "Dijkstra's Algorithm"

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `dijkstra(graph, start)`, where `graph[node]` is an array of `[neighbor, weight]` pairs. Return `{ node: distance }` for every node, always expanding from whichever unvisited node currently has the smallest known distance.',
        starter: '',
        tests: `
const graph = { A: [['B',4],['C',1]], B: [], C: [['B',1]] }
assert JSON.stringify(dijkstra(graph, 'A')) === JSON.stringify({A:0,B:2,C:1})
`,
        solution: `function dijkstra(graph, start) {
  const distances = {}
  for (const node in graph) distances[node] = Infinity
  distances[start] = 0
  const unvisited = new Set(Object.keys(graph))
  while (unvisited.size > 0) {
    let current = null
    for (const node of unvisited) {
      if (current === null || distances[node] < distances[current]) current = node
    }
    unvisited.delete(current)
    for (const [neighbor, weight] of graph[current]) {
      const newDist = distances[current] + weight
      if (newDist < distances[neighbor]) distances[neighbor] = newDist
    }
  }
  return distances
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Finish `dijkstraWithPath(graph, start)` returning `{ distances, previous }` — whenever a shorter distance to `neighbor` is found via `current`, also record `previous[neighbor] = current`, so `reconstructPath(previous, end)` can walk backward from `end` to `start` afterward.',
        starter: 'function dijkstraWithPath(graph, start) {\n  const distances = {}, previous = {}\n  for (const node in graph) { distances[node] = Infinity; previous[node] = null }\n  distances[start] = 0\n  const unvisited = new Set(Object.keys(graph))\n  while (unvisited.size > 0) {\n    let current = null\n    for (const node of unvisited) {\n      if (current === null || distances[node] < distances[current]) current = node\n    }\n    unvisited.delete(current)\n    for (const [neighbor, weight] of graph[current]) {\n      const newDist = distances[current] + weight\n      if (newDist < distances[neighbor]) {\n        distances[neighbor] = newDist\n        // TODO: also record that "current" is the predecessor of "neighbor"\n        // on this shorter path, so the path can be reconstructed later\n      }\n    }\n  }\n  return { distances, previous }\n}\nfunction reconstructPath(previous, end) {\n  const path = []\n  let node = end\n  while (node !== null) {\n    path.unshift(node)\n    node = previous[node]\n  }\n  return path\n}',
        tests: `
const graph = { A: [['B',4],['C',1]], B: [], C: [['B',1]] }
const result = dijkstraWithPath(graph, 'A')
assert result.distances.B === 2
assert JSON.stringify(reconstructPath(result.previous, 'B')) === JSON.stringify(['A','C','B'])
`,
        solution: `function dijkstraWithPath(graph, start) {
  const distances = {}, previous = {}
  for (const node in graph) { distances[node] = Infinity; previous[node] = null }
  distances[start] = 0
  const unvisited = new Set(Object.keys(graph))
  while (unvisited.size > 0) {
    let current = null
    for (const node of unvisited) {
      if (current === null || distances[node] < distances[current]) current = node
    }
    unvisited.delete(current)
    for (const [neighbor, weight] of graph[current]) {
      const newDist = distances[current] + weight
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist
        previous[neighbor] = current
      }
    }
  }
  return { distances, previous }
}
function reconstructPath(previous, end) {
  const path = []
  let node = end
  while (node !== null) {
    path.unshift(node)
    node = previous[node]
  }
  return path
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `dijkstraHeap(graph, start)` — same result as `dijkstra`, but using an array-based MIN-HEAP (`heapPush`/`heapPop` on `[distance, node]` pairs) instead of a linear scan to pick "the unvisited node with the smallest distance" each iteration.',
        starter: '',
        tests: `
const graph = { A: [['B',4],['C',1]], B: [['D',1]], C: [['B',1]], D: [] }
assert JSON.stringify(dijkstraHeap(graph, 'A')) === JSON.stringify({A:0,B:2,C:1,D:3})
`,
        solution: `function dijkstraHeap(graph, start) {
  const distances = {}
  for (const node in graph) distances[node] = Infinity
  distances[start] = 0
  const heap = [[0, start]]
  function heapPush(item) {
    heap.push(item)
    let i = heap.length - 1
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2)
      if (heap[parent][0] <= heap[i][0]) break
      ;[heap[parent], heap[i]] = [heap[i], heap[parent]]
      i = parent
    }
  }
  function heapPop() {
    const top = heap[0]
    const last = heap.pop()
    if (heap.length > 0) {
      heap[0] = last
      let i = 0
      while (true) {
        const l = 2 * i + 1, r = 2 * i + 2
        let smallest = i
        if (l < heap.length && heap[l][0] < heap[smallest][0]) smallest = l
        if (r < heap.length && heap[r][0] < heap[smallest][0]) smallest = r
        if (smallest === i) break
        ;[heap[smallest], heap[i]] = [heap[i], heap[smallest]]
        i = smallest
      }
    }
    return top
  }
  const visited = new Set()
  while (heap.length > 0) {
    const [dist, node] = heapPop()
    if (visited.has(node)) continue
    visited.add(node)
    for (const [neighbor, weight] of graph[node]) {
      const newDist = dist + weight
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist
        heapPush([newDist, neighbor])
      }
    }
  }
  return distances
}`,
      },
    ],
  },
]

export default challenges
