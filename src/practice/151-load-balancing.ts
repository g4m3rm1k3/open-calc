import type { PracticeChallenge } from './loader'

export const title = 'Load Balancing'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeLoadBalancer(servers)` returning `{ markDown(server), routeRequest() }`, cycling through `servers` round-robin — each call to `routeRequest()` returns the next server in order, wrapping back to the start.',
        starter: '',
        tests: `
const lb = makeLoadBalancer(['A','B','C'])
assert lb.routeRequest() === 'A'
assert lb.routeRequest() === 'B'
assert lb.routeRequest() === 'C'
assert lb.routeRequest() === 'A'
`,
        solution: `function makeLoadBalancer(servers) {
  const healthy = new Set(servers)
  let nextIndex = 0
  return {
    markDown(server) { healthy.delete(server) },
    routeRequest() {
      for (let i = 0; i < servers.length; i++) {
        const candidate = servers[nextIndex]
        nextIndex = (nextIndex + 1) % servers.length
        if (healthy.has(candidate)) return candidate
      }
      throw new Error('no healthy servers')
    },
  }
}`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Fix `routeRequest()`: it must skip any server not in the `healthy` set — a server marked down via `markDown` must never be routed to again until it recovers, with the rotation continuing correctly among the remaining healthy servers.',
        starter: 'function makeLoadBalancer(servers) {\n  const healthy = new Set(servers)\n  let nextIndex = 0\n  return {\n    markDown(server) { healthy.delete(server) },\n    routeRequest() {\n      // TODO: skip any candidate not in the healthy set — a marked-down\n      // server must never be routed to until it\'s healthy again\n      const candidate = servers[nextIndex]\n      nextIndex = (nextIndex + 1) % servers.length\n      return candidate\n    },\n  }\n}',
        tests: `
const lb = makeLoadBalancer(['A','B','C'])
assert (lb.routeRequest(), true)
assert (lb.routeRequest(), true)
assert (lb.routeRequest(), true)
assert (lb.routeRequest(), true)
assert (lb.markDown('B'), true)
assert lb.routeRequest() === 'C'
assert lb.routeRequest() === 'A'
`,
        solution: `function makeLoadBalancer(servers) {
  const healthy = new Set(servers)
  let nextIndex = 0
  return {
    markDown(server) { healthy.delete(server) },
    routeRequest() {
      for (let i = 0; i < servers.length; i++) {
        const candidate = servers[nextIndex]
        nextIndex = (nextIndex + 1) % servers.length
        if (healthy.has(candidate)) return candidate
      }
      throw new Error('no healthy servers')
    },
  }
}`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'javascript',
        prompt: 'Write `makeLeastConnectionsBalancer(servers)` returning `{ routeRequest(), finishRequest(server) }`. `routeRequest` sends to whichever server currently has the FEWEST active connections (tracked internally), incrementing its count; `finishRequest` decrements it when a request completes.',
        starter: '',
        tests: `
const lb = makeLeastConnectionsBalancer(['A','B'])
assert lb.routeRequest() === 'A'
assert lb.routeRequest() === 'B'
assert (lb.finishRequest('A'), true)
assert lb.routeRequest() === 'A'
`,
        solution: `function makeLeastConnectionsBalancer(servers) {
  const activeConnections = Object.fromEntries(servers.map(s => [s, 0]))
  return {
    routeRequest() {
      const chosen = servers.reduce((min, s) => activeConnections[s] < activeConnections[min] ? s : min, servers[0])
      activeConnections[chosen]++
      return chosen
    },
    finishRequest(server) {
      activeConnections[server]--
    },
  }
}`,
      },
    ],
  },
]

export default challenges
